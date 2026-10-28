import { Injectable, Logger, BadRequestException, ForbiddenException } from '@nestjs/common';
import * as crypto from 'crypto';
import * as fs from 'fs';
import * as path from 'path';
import { eq, and, sql } from 'drizzle-orm';
import {
  db,
  datahubFiles,
  datahubDocumentRefs,
  datahubDocumentChunks,
  tenantMembers,
  electoralDistricts,
  operatorTenantAssignments,
  operatorAuditLogs,
} from '@polaris/database';
import {
  DocumentExtractorService,
  ContextualChunkerService,
  DatahubEmbedderService,
  DocumentClassifierService,
} from '@polaris/ai-engine';
import { DatahubUploadDto } from './dto/datahub-upload.dto.js';
import { DatahubPrivacyScope, DatahubCategory } from '@polaris/shared-types';

@Injectable()
export class DatahubService {
  private readonly logger = new Logger(DatahubService.name);

  /**
   * Menangani proses upload blind-ingestion dokumen dengan deduplikasi SHA-256 instan.
   */
  async processUpload(
    tenantId: string,
    file: Express.Multer.File,
    dto: DatahubUploadDto
  ) {
    if (!file || !file.buffer || file.buffer.length === 0) {
      throw new BadRequestException('Berkas dokumen atau gambar tidak boleh kosong.');
    }

    // 1. Ambil Profil Lengkap Tenant (Dapil, Partai, Level, Lembaga)
    const [member] = await db
      .select({
        id: tenantMembers.id,
        partyAffiliation: tenantMembers.partyAffiliation,
        legislativeLevel: tenantMembers.legislativeLevel,
        electoralDistrictId: tenantMembers.electoralDistrictId,
        customDapilName: tenantMembers.customDapilName,
      })
      .from(tenantMembers)
      .where(eq(tenantMembers.id, tenantId));

    if (!member) {
      throw new BadRequestException('Data tenant tidak ditemukan dalam sistem.');
    }

    let dapilCode: string | null = null;
    if (member.electoralDistrictId) {
      const [district] = await db
        .select({ dapilCode: electoralDistricts.dapilCode })
        .from(electoralDistricts)
        .where(eq(electoralDistricts.id, member.electoralDistrictId));
      dapilCode = district?.dapilCode || member.customDapilName || null;
    } else {
      dapilCode = member.customDapilName || null;
    }

    // Tentukan Cabang Pemerintahan (Eksekutif vs Legislatif)
    const executiveRoles = [
      'KEPALA_DAERAH_GUBERNUR',
      'KEPALA_DAERAH_WALIKOTA_BUPATI',
      'PEJABAT_BIROKRAT_DIRJEN_SEKJEN_OPD',
    ];
    const branchType = executiveRoles.includes(member.legislativeLevel)
      ? 'EKSEKUTIF'
      : 'LEGISLATIF';

    // 2. Hitung SHA-256 Checksum dari file buffer
    const contentSha256 = crypto
      .createHash('sha256')
      .update(file.buffer)
      .digest('hex');

    const originalName = file.originalname || 'document.pdf';
    const ext = path.extname(originalName) || '.bin';
    let finalDocTitle = dto.customTitle?.trim() || originalName;
    let categoryTag = dto.categoryTag || DatahubCategory.DOKUMEN_INTERNAL;
    const privacyScope = dto.privacyScope || DatahubPrivacyScope.PRIVATE_TENANT;

    // 3. Cek apakah berkas dengan Hash ini sudah ada di sistem (DEDUPLIKASI)
    const [existingFile] = await db
      .select({
        id: datahubFiles.id,
        contentSha256: datahubFiles.contentSha256,
        extractionStatus: datahubFiles.extractionStatus,
      })
      .from(datahubFiles)
      .where(eq(datahubFiles.contentSha256, contentSha256));

    if (existingFile && existingFile.extractionStatus === 'COMPLETED') {
      this.logger.log(
        `[Datahub] Berkas duplikat terverifikasi (Hash: ${contentSha256}). Skip simpan fisik & embedding AI.`
      );

      // Cek apakah tenant sudah pernah punya referensi ke file ini
      const [existingRef] = await db
        .select({ id: datahubDocumentRefs.id })
        .from(datahubDocumentRefs)
        .where(
          and(
            eq(datahubDocumentRefs.fileId, existingFile.id),
            eq(datahubDocumentRefs.uploadedByTenantId, tenantId)
          )
        );

      if (!existingRef) {
        // Jika categoryTag tidak ditentukan secara eksplisit atau 'AUTO', warisi klasifikasi dari referensi sebelumnya
        if (
          !dto.categoryTag ||
          (dto.categoryTag as string) === 'AUTO' ||
          dto.categoryTag === DatahubCategory.DOKUMEN_INTERNAL
        ) {
          const [priorRef] = await db
            .select({ categoryTag: datahubDocumentRefs.categoryTag })
            .from(datahubDocumentRefs)
            .where(
              and(
                eq(datahubDocumentRefs.fileId, existingFile.id),
                sql`${datahubDocumentRefs.categoryTag} != ${DatahubCategory.DOKUMEN_INTERNAL}`
              )
            )
            .limit(1);

          if (priorRef?.categoryTag) {
            categoryTag = priorRef.categoryTag as DatahubCategory;
          } else {
            // Coba klasifikasikan dari extractedRawText file yang sudah tersimpan
            const [fileData] = await db
              .select({ extractedRawText: datahubFiles.extractedRawText })
              .from(datahubFiles)
              .where(eq(datahubFiles.id, existingFile.id));

            if (fileData?.extractedRawText) {
              const cls = await DocumentClassifierService.classifyDocument(
                originalName,
                fileData.extractedRawText
              );
              categoryTag = cls.category;
            }
          }
        }

        // Catat relasi referensi tenant tanpa menduplikasi data fisik/vektor
        await db.insert(datahubDocumentRefs).values({
          fileId: existingFile.id,
          uploadedByTenantId: tenantId,
          customTitle: finalDocTitle,
          dapilCode,
          partyAffiliation: member.partyAffiliation,
          branchType,
          legislativeLevel: member.legislativeLevel,
          privacyScope,
          categoryTag,
        });
      }

      // UX Idempoten: Berikan respons sukses yang identik ke user
      return {
        status: 'success',
        isDuplicate: true,
        message: 'Dokumen berhasil diserap dan disinkronkan ke AI Knowledge Base Anda.',
        fileId: existingFile.id,
      };
    } else if (existingFile && existingFile.extractionStatus !== 'COMPLETED') {
      // Jika berkas sebelumnya berstatus FAILED / uncompleted, hapus record lama agar diproses ulang secara bersih
      this.logger.warn(`[Datahub] Menghapus record lama yang belum selesai/gagal untuk hash ${contentSha256}`);
      await db.delete(datahubFiles).where(eq(datahubFiles.id, existingFile.id));
    }

    // 4. File Baru: Simpan ke Local Disk Storage (uploads/datahub)
    const uploadDir = path.resolve(process.cwd(), 'uploads/datahub');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    const localFileName = `${contentSha256}${ext}`;
    const localFilePath = path.join(uploadDir, localFileName);
    fs.writeFileSync(localFilePath, file.buffer);

    // 5. Simpan Master File Record
    const [insertedFile] = await db
      .insert(datahubFiles)
      .values({
        contentSha256,
        originalFileName: originalName,
        mimeType: file.mimetype || 'application/octet-stream',
        fileSizeBytes: file.buffer.length,
        storagePath: `/uploads/datahub/${localFileName}`,
        extractionStatus: 'PROCESSING',
      })
      .returning({ id: datahubFiles.id });

    // 6. Ekstraksi Teks Multimodal (Teks, Tabel CSV/Spreadsheet, & Gambar OCR)
    let extractedText = '';
    let totalPages = 1;

    try {
      const extraction = await DocumentExtractorService.extractText(
        file.buffer,
        file.mimetype,
        originalName
      );
      extractedText = extraction.text;
      totalPages = extraction.totalPages;

      // 3-Pass Classifier: Jalankan jika kategori belum disetel spesifik atau masih DOKUMEN_INTERNAL
      if (!dto.categoryTag || dto.categoryTag === DatahubCategory.DOKUMEN_INTERNAL) {
        const classification = await DocumentClassifierService.classifyDocument({
          fileName: originalName,
          extractedText,
          existingCategory: dto.categoryTag,
          customTitle: finalDocTitle,
        });
        categoryTag = classification.category;
        if (finalDocTitle === originalName && classification.suggestedTitle) {
          finalDocTitle = classification.suggestedTitle;
        }
      }
    } catch (extractErr) {
      this.logger.error(`[Datahub] Gagal ekstraksi teks:`, extractErr);
      await db
        .update(datahubFiles)
        .set({ extractionStatus: 'FAILED' })
        .where(eq(datahubFiles.id, insertedFile.id));
      throw new BadRequestException(
        `Gagal membaca isi konten dokumen: ${(extractErr as Error).message}`
      );
    }

    if (!extractedText || extractedText.trim().length === 0) {
      // 7. Simpan Referensi Tenant untuk berkas tanpa konten teks
      await db.insert(datahubDocumentRefs).values({
        fileId: insertedFile.id,
        uploadedByTenantId: tenantId,
        customTitle: finalDocTitle,
        dapilCode,
        partyAffiliation: member.partyAffiliation,
        branchType,
        legislativeLevel: member.legislativeLevel,
        privacyScope,
        categoryTag,
      });

      await db
        .update(datahubFiles)
        .set({ extractionStatus: 'COMPLETED', totalPages, extractedRawText: '' })
        .where(eq(datahubFiles.id, insertedFile.id));

      return {
        status: 'success',
        isDuplicate: false,
        message: 'Dokumen berhasil diunggah, namun tidak ditemukan teks yang dapat diekstrak.',
        fileId: insertedFile.id,
        totalChunks: 0,
      };
    }

    let chunks: any[] = [];
    try {
      // 8. Chunking Dokumen dengan Sliding Window & Metadata Header Injection
      chunks = ContextualChunkerService.chunkDocument(extractedText, {
        documentTitle: finalDocTitle,
        categoryTag,
        targetChunkWords: 380,
        overlapWords: 70,
      });

      this.logger.log(
        `[Datahub] Dokumen '${finalDocTitle}' dipotong menjadi ${chunks.length} semantik chunk.`
      );

      // 9. Batch Vector Embedding
      if (chunks.length > 0) {
        const chunkTexts = chunks.map((c) => c.fullChunkText);
        const embeddings = await DatahubEmbedderService.generateBatchEmbeddings(chunkTexts);

        // Simpan seluruh chunk dan vektor ke pgvector
        const chunkValues = chunks.map((chunk, idx) => ({
          fileId: insertedFile.id,
          chunkIndex: chunk.chunkIndex,
          sectionTitle: chunk.sectionTitle,
          chunkContent: chunk.chunkContent,
          contextualHeader: chunk.contextualHeader,
          tokenCount: chunk.tokenCount,
          vectorEmbedding: embeddings[idx],
        }));

        // Insert batch per 50 rows untuk efisiensi PostgreSQL
        for (let i = 0; i < chunkValues.length; i += 50) {
          const batchSlice = chunkValues.slice(i, i + 50);
          await db.insert(datahubDocumentChunks).values(batchSlice);
        }
      }

      // 10. Update Status File ke COMPLETED
      await db
        .update(datahubFiles)
        .set({
          extractionStatus: 'COMPLETED',
          totalPages,
          extractedRawText: extractedText.slice(0, 50000), // Simpan preview teks 50KB untuk referensi cepat
        })
        .where(eq(datahubFiles.id, insertedFile.id));

      // 11. Daftarkan Referensi Multi-Tenant setelah berkas & vektor sukses 100%
      await db.insert(datahubDocumentRefs).values({
        fileId: insertedFile.id,
        uploadedByTenantId: tenantId,
        customTitle: finalDocTitle,
        dapilCode,
        partyAffiliation: member.partyAffiliation,
        branchType,
        legislativeLevel: member.legislativeLevel,
        privacyScope,
        categoryTag,
      });
    } catch (processErr) {
      this.logger.error(`[Datahub] Gagal memproses chunking/embedding vektor:`, processErr);
      await db
        .update(datahubFiles)
        .set({ extractionStatus: 'FAILED' })
        .where(eq(datahubFiles.id, insertedFile.id));
      throw new BadRequestException(
        `Gagal memproses vektorisasi AI dokumen: ${(processErr as Error).message}`
      );
    }

    return {
      status: 'success',
      isDuplicate: false,
      message: 'Dokumen berhasil diserap, diekstrak, dan disinkronkan ke AI Knowledge Base.',
      fileId: insertedFile.id,
      totalChunks: chunks.length,
      totalPages,
    };
  }

  /**
   * Mengambil statistik ringkas Knowledge Base tenant (tanpa membocorkan list nama file)
   */
  async getTenantKnowledgeMetrics(tenantId: string) {
    const [stats] = await db.execute(sql`
      SELECT 
        COUNT(DISTINCT ref.file_id)::integer AS "totalDocuments",
        COALESCE(SUM(c.token_count), 0)::integer AS "totalTokensLearned",
        MAX(ref.created_at) AS "lastIngestedAt"
      FROM datahub_document_refs ref
      LEFT JOIN datahub_document_chunks c ON ref.file_id = c.file_id
      WHERE ref.uploaded_by_tenant_id = ${tenantId}::uuid;
    `);

    return (
      stats || {
        totalDocuments: 0,
        totalTokensLearned: 0,
        lastIngestedAt: null,
      }
    );
  }

  /**
   * Mengambil metrik global seluruh repositori DataHub untuk Superadmin
   */
  async getAdminStats() {
    const [fileStats] = await db.execute(sql`
      SELECT
        COUNT(*)::integer AS "totalFiles",
        COALESCE(SUM(file_size_bytes), 0)::bigint AS "totalBytes",
        COALESCE(SUM(total_pages), 0)::integer AS "totalPages"
      FROM datahub_files;
    `);

    const [refStats] = await db.execute(sql`
      SELECT
        COUNT(*)::integer AS "totalReferences"
      FROM datahub_document_refs;
    `);

    const [chunkStats] = await db.execute(sql`
      SELECT
        COUNT(*)::integer AS "totalChunks",
        COALESCE(SUM(token_count), 0)::bigint AS "totalTokens"
      FROM datahub_document_chunks;
    `);

    const totalFiles = Number((fileStats as any)?.totalFiles || 0);
    const totalReferences = Number((refStats as any)?.totalReferences || 0);
    const totalBytes = Number((fileStats as any)?.totalBytes || 0);
    const totalPages = Number((fileStats as any)?.totalPages || 0);
    const totalChunks = Number((chunkStats as any)?.totalChunks || 0);
    const totalTokens = Number((chunkStats as any)?.totalTokens || 0);

    const deduplicationSavings =
      totalReferences > 0
        ? Math.max(0, Math.round(((totalReferences - totalFiles) / totalReferences) * 100))
        : 0;

    return {
      totalFiles,
      totalReferences,
      totalBytes,
      totalPages,
      totalChunks,
      totalTokens,
      deduplicationSavings,
    };
  }

  /**
   * Mengambil daftar master dokumen dan referensi dewan pengunggah untuk Superadmin
   */
  async getAdminDocuments(query?: {
    search?: string;
    partyAffiliation?: string;
    categoryTag?: string;
    privacyScope?: string;
  }) {
    const rows = await db.execute(sql`
      SELECT 
        f.id AS "fileId",
        f.original_file_name AS "originalFileName",
        f.mime_type AS "mimeType",
        f.file_size_bytes AS "fileSizeBytes",
        f.content_sha256 AS "contentSha256",
        f.extraction_status AS "extractionStatus",
        f.total_pages AS "totalPages",
        f.created_at AS "createdAt",
        COALESCE(c_stats.chunk_count, 0)::integer AS "chunkCount",
        COALESCE(ref_stats.ref_count, 0)::integer AS "referenceCount",
        COALESCE(ref_stats.ref_list, '[]'::json) AS "references"
      FROM datahub_files f
      LEFT JOIN (
        SELECT file_id, COUNT(*)::integer AS chunk_count 
        FROM datahub_document_chunks 
        GROUP BY file_id
      ) c_stats ON f.id = c_stats.file_id
      LEFT JOIN (
        SELECT 
          ref.file_id,
          COUNT(ref.id)::integer AS ref_count,
          json_agg(
            json_build_object(
              'refId', ref.id,
              'tenantId', ref.uploaded_by_tenant_id,
              'tenantName', tm.full_name,
              'tenantEmail', tm.email,
              'customTitle', ref.custom_title,
              'dapilCode', ref.dapil_code,
              'partyAffiliation', ref.party_affiliation,
              'branchType', ref.branch_type,
              'legislativeLevel', ref.legislative_level,
              'privacyScope', ref.privacy_scope,
              'categoryTag', ref.category_tag,
              'createdAt', ref.created_at
            ) ORDER BY ref.created_at DESC
          ) AS ref_list
        FROM datahub_document_refs ref
        LEFT JOIN tenant_members tm ON ref.uploaded_by_tenant_id = tm.id
        GROUP BY ref.file_id
      ) ref_stats ON f.id = ref_stats.file_id
      ORDER BY f.created_at DESC;
    `);

    let list = (rows as unknown as any[]) || [];

    if (query?.search) {
      const q = query.search.toLowerCase();
      list = list.filter(
        (item) =>
          item.originalFileName?.toLowerCase().includes(q) ||
          item.contentSha256?.toLowerCase().includes(q) ||
          item.references?.some(
            (r: any) =>
              r.customTitle?.toLowerCase().includes(q) ||
              r.tenantName?.toLowerCase().includes(q) ||
              r.partyAffiliation?.toLowerCase().includes(q) ||
              r.dapilCode?.toLowerCase().includes(q)
          )
      );
    }

    if (query?.partyAffiliation && query.partyAffiliation !== 'ALL') {
      list = list.filter((item) =>
        item.references?.some((r: any) => r.partyAffiliation === query.partyAffiliation)
      );
    }

    if (query?.categoryTag && query.categoryTag !== 'ALL') {
      list = list.filter((item) =>
        item.references?.some((r: any) => r.categoryTag === query.categoryTag)
      );
    }

    if (query?.privacyScope && query.privacyScope !== 'ALL') {
      list = list.filter((item) =>
        item.references?.some((r: any) => r.privacyScope === query.privacyScope)
      );
    }

    return list;
  }

  /**
   * Superadmin memperbarui klasifikasi 5 lapis atau hak akses dokumen
   */
  async updateReferenceClassification(
    refId: string,
    dto: {
      customTitle?: string;
      categoryTag?: string;
      privacyScope?: string;
      partyAffiliation?: string;
      dapilCode?: string;
      branchType?: string;
      legislativeLevel?: any;
    }
  ) {
    const [updated] = await db
      .update(datahubDocumentRefs)
      .set({
        ...(dto.customTitle ? { customTitle: dto.customTitle.trim() } : {}),
        ...(dto.categoryTag ? { categoryTag: dto.categoryTag } : {}),
        ...(dto.privacyScope ? { privacyScope: dto.privacyScope } : {}),
        ...(dto.partyAffiliation ? { partyAffiliation: dto.partyAffiliation } : {}),
        ...(dto.dapilCode ? { dapilCode: dto.dapilCode } : {}),
        ...(dto.branchType ? { branchType: dto.branchType } : {}),
        ...(dto.legislativeLevel ? { legislativeLevel: dto.legislativeLevel } : {}),
      })
      .where(eq(datahubDocumentRefs.id, refId))
      .returning();

    if (!updated) {
      throw new BadRequestException('Data referensi dokumen tidak ditemukan.');
    }

    return {
      status: 'success',
      message: 'Klasifikasi dokumen dan hak akses berhasil diperbarui oleh Admin.',
      data: updated,
    };
  }

  /**
   * Superadmin menghapus dokumen master (membersihkan disk & pgvector)
   */
  async deleteMasterFile(fileId: string) {
    const [file] = await db
      .select({ storagePath: datahubFiles.storagePath })
      .from(datahubFiles)
      .where(eq(datahubFiles.id, fileId));

    if (!file) {
      throw new BadRequestException('Berkas tidak ditemukan.');
    }

    if (file.storagePath) {
      try {
        const fullPath = path.resolve(process.cwd(), file.storagePath.replace(/^\//, ''));
        if (fs.existsSync(fullPath)) {
          fs.unlinkSync(fullPath);
        }
      } catch (err) {
        this.logger.warn(`Gagal menghapus file fisik di disk:`, err);
      }
    }

    await db.delete(datahubFiles).where(eq(datahubFiles.id, fileId));

    return {
      status: 'success',
      message: 'Berkas master dan seluruh vektor pengetahuan berhasil dihapus dari sistem.',
    };
  }

  // =========================================================================
  // OPERATOR DATAHUB MANAGEMENT (MULTI-CLIENT KNOWLEDGE HUB)
  // =========================================================================

  /**
   * Mengambil daftar dokumen binaan yang dikelola oleh staf operator
   */
  async getOperatorDocuments(
    operatorId: string,
    query?: {
      tenantId?: string;
      search?: string;
      categoryTag?: string;
      privacyScope?: string;
    },
    isSuperadmin = false
  ) {
    let assignedTenantIds: string[] = [];
    if (!isSuperadmin) {
      const assignments = await db
        .select({ tenantId: operatorTenantAssignments.tenantId })
        .from(operatorTenantAssignments)
        .where(
          and(
            eq(operatorTenantAssignments.operatorId, operatorId),
            eq(operatorTenantAssignments.status, 'ACTIVE')
          )
        );
      assignedTenantIds = assignments.map((a) => a.tenantId);
      if (assignedTenantIds.length === 0) {
        return [];
      }
    }

    if (query?.tenantId) {
      if (!isSuperadmin && !assignedTenantIds.includes(query.tenantId)) {
        throw new ForbiddenException('Akses Ditolak: Anggota dewan ini bukan binaan aktif Anda.');
      }
      assignedTenantIds = [query.tenantId];
    }

    const conditions = [];

    if (isSuperadmin && !query?.tenantId) {
      conditions.push(sql`1=1`);
    } else {
      const idList = sql.join(
        assignedTenantIds.map((id) => sql`${id}::uuid`),
        sql`, `
      );
      conditions.push(sql`ref.uploaded_by_tenant_id IN (${idList})`);
    }

    if (query?.search && query.search.trim()) {
      const q = `%${query.search.trim()}%`;
      conditions.push(sql`(
        ref.custom_title ILIKE ${q} OR
        f.original_file_name ILIKE ${q} OR
        tm.full_name ILIKE ${q}
      )`);
    }

    if (query?.categoryTag && query.categoryTag !== 'ALL') {
      conditions.push(sql`ref.category_tag = ${query.categoryTag}`);
    }

    if (query?.privacyScope && query.privacyScope !== 'ALL') {
      conditions.push(sql`ref.privacy_scope = ${query.privacyScope}`);
    }

    const whereClause = sql.join(conditions, sql` AND `);

    const rows = await db.execute(sql`
      SELECT 
        ref.id AS "refId",
        ref.file_id AS "fileId",
        ref.custom_title AS "customTitle",
        ref.privacy_scope AS "privacyScope",
        ref.category_tag AS "categoryTag",
        ref.dapil_code AS "dapilCode",
        ref.party_affiliation AS "partyAffiliation",
        ref.created_at AS "createdAt",
        ref.uploaded_by_tenant_id AS "uploadedByTenantId",
        tm.full_name AS "tenantName",
        tm.photo_url AS "tenantPhoto",
        tm.custom_dapil_name AS "tenantDapil",
        f.original_file_name AS "originalFileName",
        f.mime_type AS "mimeType",
        f.file_size_bytes AS "fileSizeBytes",
        f.extraction_status AS "extractionStatus",
        f.total_pages AS "totalPages",
        f.content_sha256 AS "contentSha256",
        COALESCE(c_stats.chunk_count, 0)::integer AS "chunkCount",
        COALESCE(c_stats.total_tokens, 0)::integer AS "totalTokens"
      FROM datahub_document_refs ref
      INNER JOIN datahub_files f ON ref.file_id = f.id
      INNER JOIN tenant_members tm ON ref.uploaded_by_tenant_id = tm.id
      LEFT JOIN (
        SELECT file_id, COUNT(*)::integer AS chunk_count, SUM(token_count)::integer AS total_tokens
        FROM datahub_document_chunks 
        GROUP BY file_id
      ) c_stats ON f.id = c_stats.file_id
      WHERE ${whereClause}
      ORDER BY ref.created_at DESC;
    `);

    return (rows as unknown as any[]) || [];
  }

  /**
   * Mengambil statistik ringkas Knowledge Hub untuk operator
   */
  async getOperatorStats(operatorId: string, isSuperadmin = false) {
    let assignedTenantIds: string[] = [];
    if (!isSuperadmin) {
      const assignments = await db
        .select({ tenantId: operatorTenantAssignments.tenantId })
        .from(operatorTenantAssignments)
        .where(
          and(
            eq(operatorTenantAssignments.operatorId, operatorId),
            eq(operatorTenantAssignments.status, 'ACTIVE')
          )
        );
      assignedTenantIds = assignments.map((a) => a.tenantId);
      if (assignedTenantIds.length === 0) {
        return {
          totalDocuments: 0,
          totalTokens: 0,
          assignedTenantsCount: 0,
          scopeCounts: { PRIVATE_TENANT: 0, PARTY_CONFIDENTIAL: 0, DAPIL_SHARED: 0 },
        };
      }
    }

    const idList = sql.join(
      assignedTenantIds.map((id) => sql`${id}::uuid`),
      sql`, `
    );

    const tenantCondition = isSuperadmin
      ? sql`1=1`
      : sql`ref.uploaded_by_tenant_id IN (${idList})`;

    const tenantConditionSub = isSuperadmin
      ? sql`1=1`
      : sql`sub_ref.uploaded_by_tenant_id IN (${idList})`;

    const [stats] = await db.execute(sql`
      SELECT 
        COUNT(DISTINCT ref.id)::integer AS "totalDocuments",
        COALESCE((
          SELECT SUM(c.token_count)::bigint
          FROM datahub_document_chunks c
          WHERE c.file_id IN (
            SELECT DISTINCT sub_ref.file_id
            FROM datahub_document_refs sub_ref
            WHERE ${tenantConditionSub}
          )
        ), 0)::bigint AS "totalTokens"
      FROM datahub_document_refs ref
      WHERE ${tenantCondition};
    `);

    const scopeRows = await db.execute(sql`
      SELECT ref.privacy_scope AS "scope", COUNT(DISTINCT ref.id)::integer AS "count"
      FROM datahub_document_refs ref
      WHERE ${tenantCondition}
      GROUP BY ref.privacy_scope;
    `);

    const scopeCounts: Record<string, number> = {
      PRIVATE_TENANT: 0,
      PARTY_CONFIDENTIAL: 0,
      DAPIL_SHARED: 0,
    };
    for (const r of (scopeRows as unknown as any[]) || []) {
      if (r.scope) scopeCounts[r.scope] = Number(r.count || 0);
    }

    return {
      totalDocuments: Number((stats as any)?.totalDocuments || 0),
      totalTokens: Number((stats as any)?.totalTokens || 0),
      assignedTenantsCount: isSuperadmin ? 0 : assignedTenantIds.length,
      scopeCounts,
    };
  }

  /**
   * Operator: Memperbarui klasifikasi atau cakupan privasi dokumen binaan
   */
  async operatorUpdateReference(
    operatorId: string,
    refId: string,
    dto: {
      customTitle?: string;
      categoryTag?: any;
      privacyScope?: any;
    },
    isSuperadmin = false
  ) {
    const [ref] = await db
      .select()
      .from(datahubDocumentRefs)
      .where(eq(datahubDocumentRefs.id, refId));

    if (!ref) {
      throw new BadRequestException('Dokumen tidak ditemukan.');
    }

    if (!isSuperadmin) {
      const [assignment] = await db
        .select()
        .from(operatorTenantAssignments)
        .where(
          and(
            eq(operatorTenantAssignments.operatorId, operatorId),
            eq(operatorTenantAssignments.tenantId, ref.uploadedByTenantId),
            eq(operatorTenantAssignments.status, 'ACTIVE')
          )
        )
        .limit(1);

      if (!assignment) {
        throw new ForbiddenException('Akses Ditolak: Anda tidak memiliki penugasan aktif untuk tokoh pemilik dokumen ini.');
      }
    }

    if (dto.privacyScope === 'PUBLIC_SYSTEM') {
      throw new BadRequestException('Staf Operator hanya diizinkan mengatur cakupan ke Privat, Fraksi Partai, atau Berbagi Dapil.');
    }

    const [updated] = await db
      .update(datahubDocumentRefs)
      .set({
        ...(dto.customTitle ? { customTitle: dto.customTitle.trim() } : {}),
        ...(dto.categoryTag ? { categoryTag: dto.categoryTag } : {}),
        ...(dto.privacyScope ? { privacyScope: dto.privacyScope } : {}),
      })
      .where(eq(datahubDocumentRefs.id, refId))
      .returning();

    try {
      await db.insert(operatorAuditLogs).values({
        operatorId,
        tenantId: ref.uploadedByTenantId,
        action: 'UPDATE_DOCUMENT_CLASSIFICATION',
        targetEntity: 'datahub_document_refs',
        targetEntityId: refId,
        details: {
          updatedFields: dto,
          previousTitle: ref.customTitle,
          previousCategory: ref.categoryTag,
          previousScope: ref.privacyScope,
        },
      });
    } catch (auditErr) {
      this.logger.warn('Gagal mencatat audit log operator update reference:', auditErr);
    }

    return {
      status: 'success',
      message: 'Klasifikasi dokumen dan hak akses berhasil diperbarui.',
      data: updated,
    };
  }

  /**
   * Operator: Mencabut kaitan dokumen dari dewan binaan (Detach / Unlink aman)
   */
  async operatorDetachReference(
    operatorId: string,
    refId: string,
    isSuperadmin = false
  ) {
    const [ref] = await db
      .select()
      .from(datahubDocumentRefs)
      .where(eq(datahubDocumentRefs.id, refId));

    if (!ref) {
      throw new BadRequestException('Dokumen tidak ditemukan.');
    }

    if (!isSuperadmin) {
      const [assignment] = await db
        .select()
        .from(operatorTenantAssignments)
        .where(
          and(
            eq(operatorTenantAssignments.operatorId, operatorId),
            eq(operatorTenantAssignments.tenantId, ref.uploadedByTenantId),
            eq(operatorTenantAssignments.status, 'ACTIVE')
          )
        )
        .limit(1);

      if (!assignment) {
        throw new ForbiddenException('Akses Ditolak: Anda tidak memiliki penugasan aktif untuk tokoh pemilik dokumen ini.');
      }
    }

    await db.delete(datahubDocumentRefs).where(eq(datahubDocumentRefs.id, refId));

    try {
      await db.insert(operatorAuditLogs).values({
        operatorId,
        tenantId: ref.uploadedByTenantId,
        action: 'DETACH_DOCUMENT_REFERENCE',
        targetEntity: 'datahub_document_refs',
        targetEntityId: refId,
        details: {
          detachedFileId: ref.fileId,
          customTitle: ref.customTitle,
        },
      });
    } catch (auditErr) {
      this.logger.warn('Gagal mencatat audit log operator detach reference:', auditErr);
    }

    return {
      status: 'success',
      message: 'Kaitan dokumen dengan tokoh dewan binaan berhasil dicabut dari Knowledge Hub.',
    };
  }

  /**
   * Operator: Mengunggah dokumen baru atas nama dewan binaan
   */
  async operatorUploadDocument(
    operatorId: string,
    file: Express.Multer.File,
    dto: {
      tenantId: string;
      customTitle?: string;
      categoryTag?: any;
      privacyScope?: any;
    },
    isSuperadmin = false
  ) {
    if (!dto.tenantId) {
      throw new BadRequestException('Target anggota dewan binaan (tenantId) wajib dipilih.');
    }

    if (!isSuperadmin) {
      const [assignment] = await db
        .select()
        .from(operatorTenantAssignments)
        .where(
          and(
            eq(operatorTenantAssignments.operatorId, operatorId),
            eq(operatorTenantAssignments.tenantId, dto.tenantId),
            eq(operatorTenantAssignments.status, 'ACTIVE')
          )
        )
        .limit(1);

      if (!assignment) {
        throw new ForbiddenException('Akses Ditolak: Anda tidak memiliki penugasan untuk anggota dewan yang dipilih.');
      }
    }

    if (dto.privacyScope === 'PUBLIC_SYSTEM') {
      dto.privacyScope = DatahubPrivacyScope.PARTY_CONFIDENTIAL;
    }

    const uploadResult = await this.processUpload(dto.tenantId, file, {
      customTitle: dto.customTitle,
      categoryTag: dto.categoryTag,
      privacyScope: dto.privacyScope,
    });

    try {
      await db.insert(operatorAuditLogs).values({
        operatorId,
        tenantId: dto.tenantId,
        action: 'UPLOAD_DOCUMENT_FOR_TENANT',
        targetEntity: 'datahub_files',
        targetEntityId: uploadResult.fileId,
        details: {
          originalFileName: file.originalname,
          customTitle: dto.customTitle,
          privacyScope: dto.privacyScope,
        },
      });
    } catch (auditErr) {
      this.logger.warn('Gagal mencatat audit log operator upload:', auditErr);
    }

    return uploadResult;
  }
}
