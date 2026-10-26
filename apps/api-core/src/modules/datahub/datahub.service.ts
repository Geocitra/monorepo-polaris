import { Injectable, Logger, BadRequestException } from '@nestjs/common';
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
} from '@polaris/database';
import {
  DocumentExtractorService,
  ContextualChunkerService,
  DatahubEmbedderService,
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
    const finalDocTitle = dto.customTitle?.trim() || originalName;
    const categoryTag = dto.categoryTag || DatahubCategory.DOKUMEN_INTERNAL;
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

    // 6. Simpan Referensi Tenant
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

    // 7. Ekstraksi Teks Multimodal (Teks & Gambar OCR)
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
}
