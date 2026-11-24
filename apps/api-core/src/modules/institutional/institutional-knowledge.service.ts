import {
  Injectable,
  BadRequestException,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import {
  db,
  organizations,
  organizationContracts,
  institutionalSharedNotes,
  eq,
  and,
  desc,
  sql,
} from '@polaris/database';
import {
  OrganizationUnitType,
  OrganizationMemberRole,
  OrganizationUnitMemberRole,
  InstitutionalMembershipStatus,
  InstitutionalNoteVisibility,
  DatahubPrivacyScope,
  DatahubCategory,
  type InstitutionalUnitOverviewDto,
  type InstitutionalScopedDocumentDto,
  type InstitutionalSharedNoteDto,
  type InstitutionalAiAssistResponseDto,
} from '@polaris/shared-types';
import { InstitutionalAiService } from '@polaris/ai-engine';
import { DatahubService } from '../datahub/datahub.service.js';
import { InstitutionalGovernanceService } from './institutional-governance.service.js';
import type {
  CreateSharedNoteRequestDto,
  InstitutionalDocumentUploadMetaDto,
  InstitutionalAiAssistBodyDto,
} from './dto/institutional-request.dto.js';

/**
 * Layanan Pengetahuan Terisolasi per Bidang (Bidang Documents, Shared Notes,
 * Dokumen Resmi ORG_SHARED, & Asisten Tenaga Ahli AI Scoped).
 */
@Injectable()
export class InstitutionalKnowledgeService {
  constructor(
    private readonly governance: InstitutionalGovernanceService,
    private readonly datahubService: DatahubService
  ) {}

  async uploadOfficialOrgSharedDocument(
    orgId: string,
    uploaderTenantId: string,
    file: Express.Multer.File,
    dto: InstitutionalDocumentUploadMetaDto
  ) {
    await this.governance.assertOrganizationStorageQuotaAvailable(orgId, file.size || file.buffer?.length || 0);

    const result = await this.datahubService.processUpload(
      uploaderTenantId,
      file,
      {
        customTitle: dto.customTitle,
        categoryTag: dto.categoryTag || DatahubCategory.REGULASI_DAERAH,
        privacyScope: DatahubPrivacyScope.ORG_SHARED,
      },
      {
        organizationId: orgId,
        organizationUnitId: null,
      }
    );

    await this.governance.recordAudit({
      organizationId: orgId,
      actorTenantId: uploaderTenantId,
      action: 'UPLOAD_OFFICIAL_ORG_SHARED_DOCUMENT',
      targetEntity: 'datahub_document_refs',
      targetEntityId: result.refId || result.fileId,
      details: {
        fileId: result.fileId,
        customTitle: dto.customTitle || file.originalname,
        categoryTag: dto.categoryTag,
        privacyScope: DatahubPrivacyScope.ORG_SHARED,
      },
    });

    return result;
  }

  async getUnitWorkspaceOverview(
    orgId: string,
    unitId: string,
    myOrgRole: OrganizationMemberRole,
    myUnitRole: OrganizationUnitMemberRole
  ): Promise<InstitutionalUnitOverviewDto> {
    const [org] = await db
      .select()
      .from(organizations)
      .where(eq(organizations.id, orgId))
      .limit(1);

    if (!org) {
      throw new NotFoundException('Instansi tidak ditemukan.');
    }

    const [contract] = await db
      .select()
      .from(organizationContracts)
      .where(eq(organizationContracts.organizationId, orgId))
      .orderBy(desc(organizationContracts.endDate))
      .limit(1);

    const [unitRow] = await db.execute(sql`
      SELECT
        u.id,
        u.parent_unit_id AS "parentUnitId",
        pu.name AS "parentUnitName",
        pu.unit_type AS "parentUnitType",
        u.unit_type AS "unitType",
        u.code,
        u.name,
        u.description,
        u.focus_sectors AS "focusSectors",
        u.partner_opds AS "partnerOpds",
        u.is_ad_hoc AS "isAdHoc",
        u.fiscal_year AS "fiscalYear"
      FROM organization_units u
      LEFT JOIN organization_units pu ON u.parent_unit_id = pu.id
      WHERE u.id = ${unitId}::uuid AND u.organization_id = ${orgId}::uuid;
    `);

    const u = ((unitRow as any)?.rows?.[0] || unitRow) as any;
    if (!u) {
      throw new NotFoundException('Bidang atau Unit tidak ditemukan.');
    }

    const memberRows = await db.execute(sql`
      SELECT
        tm.id AS "tenantId",
        tm.full_name AS "fullName",
        tm.email,
        tm.party_affiliation AS "partyAffiliation",
        tm.photo_url AS "photoUrl",
        um.unit_role AS "unitRole",
        um.status
      FROM organization_unit_memberships um
      INNER JOIN tenant_members tm ON um.tenant_id = tm.id
      WHERE um.organization_id = ${orgId}::uuid
        AND um.unit_id = ${unitId}::uuid
        AND um.status = 'ACTIVE'
      ORDER BY tm.full_name ASC;
    `);

    const [kStats] = await db.execute(sql`
      SELECT
        (
          SELECT COUNT(*)::integer
          FROM datahub_document_refs ref
          WHERE ref.organization_id = ${orgId}::uuid
            AND ref.organization_unit_id = ${unitId}::uuid
            AND ref.privacy_scope = 'UNIT_BIDANG'
        ) AS "unitDocumentsCount",
        (
          SELECT COUNT(*)::integer
          FROM datahub_document_refs ref
          WHERE ref.organization_id = ${orgId}::uuid
            AND ref.organization_unit_id IS NULL
            AND ref.privacy_scope = 'ORG_SHARED'
        ) AS "orgSharedDocumentsCount",
        (
          SELECT COUNT(*)::integer
          FROM institutional_shared_notes n
          WHERE n.organization_id = ${orgId}::uuid
            AND n.unit_id = ${unitId}::uuid
        ) AS "unitNotesCount",
        (
          SELECT COALESCE(SUM(c.token_count), 0)::integer
          FROM datahub_document_chunks c
          WHERE c.file_id IN (
            SELECT DISTINCT ref.file_id
            FROM datahub_document_refs ref
            WHERE (ref.organization_id = ${orgId}::uuid AND ref.organization_unit_id = ${unitId}::uuid AND ref.privacy_scope = 'UNIT_BIDANG')
               OR (ref.organization_id = ${orgId}::uuid AND ref.organization_unit_id IS NULL AND ref.privacy_scope = 'ORG_SHARED')
          )
        ) AS "totalScopedTokens"
    `);

    const ks = (kStats as any) || {};
    const members = (((memberRows as any)?.rows || memberRows || []) as any[]).map((m) => ({
      tenantId: m.tenantId,
      fullName: m.fullName,
      email: m.email,
      partyAffiliation: m.partyAffiliation || null,
      photoUrl: m.photoUrl || null,
      unitRole: m.unitRole as OrganizationUnitMemberRole,
      status: m.status as InstitutionalMembershipStatus,
    }));

    return {
      organization: this.governance.mapOrganizationDto(org),
      activeContract: contract ? this.governance.mapContractDto(contract) : null,
      unit: {
        id: u.id,
        parentUnitId: u.parentUnitId || null,
        parentUnitName: u.parentUnitName || null,
        parentUnitType: (u.parentUnitType as OrganizationUnitType) || null,
        unitType: u.unitType as OrganizationUnitType,
        code: u.code,
        name: u.name,
        description: u.description || null,
        focusSectors: Array.isArray(u.focusSectors) ? u.focusSectors : [],
        partnerOpds: Array.isArray(u.partnerOpds) ? u.partnerOpds : [],
        isAdHoc: Boolean(u.isAdHoc),
        fiscalYear: u.fiscalYear || null,
      },
      myOrgRole,
      myUnitRole,
      members,
      knowledgeStats: {
        unitDocumentsCount: Number(ks.unitDocumentsCount || 0),
        orgSharedDocumentsCount: Number(ks.orgSharedDocumentsCount || 0),
        unitNotesCount: Number(ks.unitNotesCount || 0),
        totalScopedTokens: Number(ks.totalScopedTokens || 0),
      },
    };
  }

  async uploadUnitScopedDocument(
    orgId: string,
    unitId: string,
    uploaderTenantId: string,
    file: Express.Multer.File,
    dto: InstitutionalDocumentUploadMetaDto
  ) {
    await this.governance.assertOrganizationStorageQuotaAvailable(orgId, file.size || file.buffer?.length || 0);

    const result = await this.datahubService.processUpload(
      uploaderTenantId,
      file,
      {
        customTitle: dto.customTitle,
        categoryTag: dto.categoryTag || DatahubCategory.DOKUMEN_INTERNAL,
        privacyScope: DatahubPrivacyScope.UNIT_BIDANG,
      },
      {
        organizationId: orgId,
        organizationUnitId: unitId,
      }
    );

    await this.governance.recordAudit({
      organizationId: orgId,
      unitId,
      actorTenantId: uploaderTenantId,
      action: 'UPLOAD_UNIT_BIDANG_DOCUMENT',
      targetEntity: 'datahub_document_refs',
      targetEntityId: result.refId || result.fileId,
      details: {
        fileId: result.fileId,
        customTitle: dto.customTitle || file.originalname,
        categoryTag: dto.categoryTag,
        privacyScope: DatahubPrivacyScope.UNIT_BIDANG,
      },
    });

    return result;
  }

  async listUnitAccessibleDocuments(
    orgId: string,
    unitId: string
  ): Promise<InstitutionalScopedDocumentDto[]> {
    const rows = await db.execute(sql`
      SELECT
        ref.id AS "refId",
        ref.file_id AS "fileId",
        COALESCE(ref.custom_title, f.original_file_name) AS "title",
        f.original_file_name AS "originalFileName",
        f.mime_type AS "mimeType",
        f.file_size_bytes AS "fileSizeBytes",
        COALESCE(f.total_pages, 1) AS "totalPages",
        ref.category_tag AS "categoryTag",
        ref.privacy_scope AS "privacyScope",
        ref.organization_id AS "organizationId",
        ref.organization_unit_id AS "organizationUnitId",
        u.name AS "unitName",
        ref.uploaded_by_tenant_id AS "uploadedByTenantId",
        tm.full_name AS "uploadedByName",
        COALESCE(cs.chunk_count, 0)::integer AS "chunkCount",
        COALESCE(cs.token_count, 0)::integer AS "tokenCount",
        ref.created_at AS "createdAt"
      FROM datahub_document_refs ref
      INNER JOIN datahub_files f ON ref.file_id = f.id
      INNER JOIN tenant_members tm ON ref.uploaded_by_tenant_id = tm.id
      LEFT JOIN organization_units u ON ref.organization_unit_id = u.id
      LEFT JOIN (
        SELECT file_id, COUNT(*)::integer AS chunk_count, COALESCE(SUM(token_count), 0)::integer AS token_count
        FROM datahub_document_chunks
        GROUP BY file_id
      ) cs ON f.id = cs.file_id
      WHERE
        (
          ref.privacy_scope = 'UNIT_BIDANG'
          AND ref.organization_id = ${orgId}::uuid
          AND ref.organization_unit_id = ${unitId}::uuid
        )
        OR (
          ref.privacy_scope = 'ORG_SHARED'
          AND ref.organization_id = ${orgId}::uuid
          AND ref.organization_unit_id IS NULL
        )
      ORDER BY
        CASE WHEN ref.privacy_scope = 'UNIT_BIDANG' THEN 0 ELSE 1 END ASC,
        ref.created_at DESC;
    `);

    const list = (((rows as any)?.rows || rows || []) as any[]);
    return list.map((r) => ({
      refId: r.refId,
      fileId: r.fileId,
      title: r.title,
      originalFileName: r.originalFileName,
      mimeType: r.mimeType,
      fileSizeBytes: Number(r.fileSizeBytes || 0),
      totalPages: Number(r.totalPages || 1),
      categoryTag: r.categoryTag,
      privacyScope: r.privacyScope as DatahubPrivacyScope,
      organizationId: r.organizationId,
      organizationUnitId: r.organizationUnitId || null,
      unitName: r.unitName || null,
      uploadedByTenantId: r.uploadedByTenantId,
      uploadedByName: r.uploadedByName,
      chunkCount: Number(r.chunkCount || 0),
      tokenCount: Number(r.tokenCount || 0),
      createdAt: new Date(r.createdAt).toISOString(),
    }));
  }

  async createSharedNote(
    orgId: string,
    unitId: string,
    authorTenantId: string,
    dto: CreateSharedNoteRequestDto
  ): Promise<InstitutionalSharedNoteDto> {
    const initialVisibility = dto.visibility || InstitutionalNoteVisibility.UNIT_SHARED;
    if (
      initialVisibility === InstitutionalNoteVisibility.PARENT_UNIT_ENDORSED ||
      initialVisibility === InstitutionalNoteVisibility.ORG_SHARED
    ) {
      throw new BadRequestException(
        'Catatan baru wajib dimulai sebagai PRIVATE_DRAFT atau UNIT_SHARED sebelum dapat dipromosikan oleh Ketua/Penelaah.'
      );
    }

    const [inserted] = await db
      .insert(institutionalSharedNotes)
      .values({
        organizationId: orgId,
        unitId,
        authorTenantId,
        title: dto.title.trim(),
        contentMarkdown: dto.contentMarkdown.trim(),
        visibility: initialVisibility,
        sourceFileIds: dto.sourceFileIds || [],
      })
      .returning();

    await this.governance.recordAudit({
      organizationId: orgId,
      unitId,
      actorTenantId: authorTenantId,
      action: 'CREATE_SHARED_NOTE',
      targetEntity: 'institutional_shared_notes',
      targetEntityId: inserted.id,
      details: { title: inserted.title, visibility: inserted.visibility },
    });

    const notes = await this.listUnitSharedNotes(orgId, unitId, authorTenantId);
    const createdNote = notes.find((n) => n.id === inserted.id);
    if (!createdNote) {
      throw new NotFoundException('Catatan bersama gagal dimuat setelah penyimpanan.');
    }
    return createdNote;
  }

  async promoteSharedNoteVisibility(
    orgId: string,
    unitId: string,
    noteId: string,
    actorTenantId: string,
    myOrgRole: OrganizationMemberRole,
    myUnitRole: OrganizationUnitMemberRole,
    targetVisibility: InstitutionalNoteVisibility
  ): Promise<InstitutionalSharedNoteDto> {
    const [note] = await db
      .select()
      .from(institutionalSharedNotes)
      .where(
        and(
          eq(institutionalSharedNotes.id, noteId),
          eq(institutionalSharedNotes.organizationId, orgId),
          eq(institutionalSharedNotes.unitId, unitId)
        )
      )
      .limit(1);

    if (!note) {
      throw new NotFoundException('Catatan tidak ditemukan pada Bidang ini.');
    }

    const isLeadOrReviewer =
      myUnitRole === OrganizationUnitMemberRole.UNIT_LEAD ||
      myUnitRole === OrganizationUnitMemberRole.REVIEWER ||
      myOrgRole === OrganizationMemberRole.ORG_ADMIN ||
      myOrgRole === OrganizationMemberRole.LEADERSHIP;

    if (
      (targetVisibility === InstitutionalNoteVisibility.PARENT_UNIT_ENDORSED ||
        targetVisibility === InstitutionalNoteVisibility.ORG_SHARED) &&
      !isLeadOrReviewer
    ) {
      throw new ForbiddenException(
        'Hanya Ketua Bidang (UNIT_LEAD), Penelaah (REVIEWER), atau Pimpinan/Sekretariat yang berwenang mengesahkan catatan menjadi sikap resmi Fraksi/Komisi atau Instansi.'
      );
    }

    if (
      note.visibility === InstitutionalNoteVisibility.PRIVATE_DRAFT &&
      note.authorTenantId !== actorTenantId &&
      !isLeadOrReviewer
    ) {
      throw new ForbiddenException('Hanya pembuat draf pribadi yang dapat membagikannya ke Bidang.');
    }

    await db
      .update(institutionalSharedNotes)
      .set({
        visibility: targetVisibility,
        approvedByTenantId: isLeadOrReviewer ? actorTenantId : note.approvedByTenantId,
        approvedAt: isLeadOrReviewer ? new Date() : note.approvedAt,
        updatedAt: new Date(),
      })
      .where(eq(institutionalSharedNotes.id, noteId));

    await this.governance.recordAudit({
      organizationId: orgId,
      unitId,
      actorTenantId,
      action: 'PROMOTE_SHARED_NOTE_VISIBILITY',
      targetEntity: 'institutional_shared_notes',
      targetEntityId: noteId,
      details: { previousVisibility: note.visibility, targetVisibility },
    });

    const notes = await this.listUnitSharedNotes(orgId, unitId, actorTenantId);
    const updated = notes.find((n) => n.id === noteId);
    if (!updated) {
      throw new NotFoundException('Catatan gagal dimuat setelah pembaruan status.');
    }
    return updated;
  }

  async listUnitSharedNotes(
    orgId: string,
    unitId: string,
    requestingTenantId: string
  ): Promise<InstitutionalSharedNoteDto[]> {
    const rows = await db.execute(sql`
      SELECT
        n.id,
        n.organization_id AS "organizationId",
        n.unit_id AS "unitId",
        u.name AS "unitName",
        n.author_tenant_id AS "authorTenantId",
        author.full_name AS "authorName",
        n.title,
        n.content_markdown AS "contentMarkdown",
        n.visibility,
        n.source_file_ids AS "sourceFileIds",
        n.approved_by_tenant_id AS "approvedByTenantId",
        approver.full_name AS "approvedByName",
        n.approved_at AS "approvedAt",
        n.created_at AS "createdAt",
        n.updated_at AS "updatedAt"
      FROM institutional_shared_notes n
      INNER JOIN organization_units u ON n.unit_id = u.id
      INNER JOIN tenant_members author ON n.author_tenant_id = author.id
      LEFT JOIN tenant_members approver ON n.approved_by_tenant_id = approver.id
      WHERE n.organization_id = ${orgId}::uuid
        AND n.unit_id = ${unitId}::uuid
        AND (
          n.visibility IN ('UNIT_SHARED', 'PARENT_UNIT_ENDORSED', 'ORG_SHARED')
          OR (n.visibility = 'PRIVATE_DRAFT' AND n.author_tenant_id = ${requestingTenantId}::uuid)
        )
      ORDER BY n.updated_at DESC;
    `);

    const list = (((rows as any)?.rows || rows || []) as any[]);
    return list.map((r) => ({
      id: r.id,
      organizationId: r.organizationId,
      unitId: r.unitId,
      unitName: r.unitName,
      authorTenantId: r.authorTenantId,
      authorName: r.authorName,
      title: r.title,
      contentMarkdown: r.contentMarkdown,
      visibility: r.visibility as InstitutionalNoteVisibility,
      sourceFileIds: Array.isArray(r.sourceFileIds) ? r.sourceFileIds : [],
      approvedByTenantId: r.approvedByTenantId || null,
      approvedByName: r.approvedByName || null,
      approvedAt: r.approvedAt ? new Date(r.approvedAt).toISOString() : null,
      createdAt: new Date(r.createdAt).toISOString(),
      updatedAt: new Date(r.updatedAt).toISOString(),
    }));
  }

  async executeBidangScopedAiAssist(
    orgId: string,
    unitId: string,
    tenantId: string,
    dto: InstitutionalAiAssistBodyDto
  ): Promise<InstitutionalAiAssistResponseDto> {
    if (!dto.prompt || !dto.prompt.trim()) {
      throw new BadRequestException('Pertanyaan atau instruksi analisis tidak boleh kosong.');
    }

    const [org] = await db
      .select()
      .from(organizations)
      .where(eq(organizations.id, orgId))
      .limit(1);

    if (!org) {
      throw new NotFoundException('Instansi tidak ditemukan.');
    }

    const [unitRow] = await db.execute(sql`
      SELECT
        u.id,
        u.code,
        u.name,
        u.unit_type AS "unitType",
        u.focus_sectors AS "focusSectors",
        u.partner_opds AS "partnerOpds",
        pu.name AS "parentUnitName",
        pu.unit_type AS "parentUnitType"
      FROM organization_units u
      LEFT JOIN organization_units pu ON u.parent_unit_id = pu.id
      WHERE u.id = ${unitId}::uuid AND u.organization_id = ${orgId}::uuid;
    `);

    const unit = ((unitRow as any)?.rows?.[0] || unitRow) as any;
    if (!unit) {
      throw new NotFoundException('Unit atau Bidang tidak ditemukan.');
    }

    const unitNotes = await this.listUnitSharedNotes(orgId, unitId, tenantId);
    const sharedOnlyNotes = unitNotes.filter(
      (n) => n.visibility !== InstitutionalNoteVisibility.PRIVATE_DRAFT
    );

    const aiResult = await InstitutionalAiService.executeScopedBidangAssist({
      tenantId,
      organizationId: org.id,
      organizationName: org.name,
      legislativeLevel: org.legislativeLevel,
      regionName: org.regionName,
      standingOrdersConfig: org.standingOrdersConfig || {},
      activeUnitId: unit.id,
      activeUnitCode: unit.code,
      activeUnitName: unit.name,
      activeUnitType: unit.unitType as OrganizationUnitType,
      parentUnitName: unit.parentUnitName || null,
      parentUnitType: (unit.parentUnitType as OrganizationUnitType) || null,
      focusSectors: Array.isArray(unit.focusSectors) ? unit.focusSectors : [],
      partnerOpds: Array.isArray(unit.partnerOpds) ? unit.partnerOpds : [],
      prompt: dto.prompt.trim(),
      focusIssue: dto.focusIssue?.trim(),
      includeOrgSharedDocuments: dto.includeOrgSharedDocuments ?? true,
      includeNationalAndRegionalRegulations: dto.includeNationalAndRegionalRegulations ?? true,
      unitSharedNotes: sharedOnlyNotes.map((n) => ({
        id: n.id,
        title: n.title,
        authorName: n.authorName,
        visibility: n.visibility,
        contentMarkdown: n.contentMarkdown,
        updatedAt: n.updatedAt,
      })),
    });

    let savedNote: InstitutionalSharedNoteDto | null = null;
    if (dto.saveAsSharedNoteTitle && dto.saveAsSharedNoteTitle.trim()) {
      const citedFileIds = Array.from(
        new Set([
          ...aiResult.unitChunks.map((c) => c.fileId),
          ...aiResult.orgSharedChunks.map((c) => c.fileId),
        ])
      );
      savedNote = await this.createSharedNote(orgId, unitId, tenantId, {
        title: dto.saveAsSharedNoteTitle.trim(),
        contentMarkdown: aiResult.answerMarkdown,
        visibility: InstitutionalNoteVisibility.UNIT_SHARED,
        sourceFileIds: citedFileIds,
      });
    }

    await this.governance.recordAudit({
      organizationId: orgId,
      unitId,
      actorTenantId: tenantId,
      action: 'EXECUTE_BIDANG_SCOPED_AI_ASSIST',
      targetEntity: 'ai_trace_logs',
      details: {
        traceId: aiResult.telemetry.traceId,
        unitChunksRetrieved: aiResult.unitChunks.length,
        orgSharedChunksRetrieved: aiResult.orgSharedChunks.length,
        regulationChunksRetrieved: aiResult.regulationChunks.length,
        totalTokens: aiResult.telemetry.totalTokens,
      },
    });

    const citations: InstitutionalAiAssistResponseDto['citations'] = [
      ...aiResult.unitChunks.map((c) => ({
        sourceType: 'UNIT_BIDANG_DOC' as const,
        sourceId: c.fileId,
        title: c.customTitle,
        reference: c.sectionTitle || `Chunk #${c.chunkIndex + 1}`,
        similarityScore: Number(Number(c.similarityScore).toFixed(3)),
        excerpt: c.chunkContent.slice(0, 280),
      })),
      ...aiResult.orgSharedChunks.map((c) => ({
        sourceType: 'ORG_SHARED_DOC' as const,
        sourceId: c.fileId,
        title: c.customTitle,
        reference: c.sectionTitle || `Chunk #${c.chunkIndex + 1}`,
        similarityScore: Number(Number(c.similarityScore).toFixed(3)),
        excerpt: c.chunkContent.slice(0, 280),
      })),
      ...aiResult.regulationChunks.map((r) => ({
        sourceType: 'REGULATION' as const,
        sourceId: r.documentId,
        title: r.structuralReference,
        reference: r.structuralReference,
        similarityScore: Number(Number(r.similarityScore).toFixed(3)),
        excerpt: r.chunkContent.slice(0, 280),
      })),
      ...sharedOnlyNotes.slice(0, 3).map((n) => ({
        sourceType: 'UNIT_SHARED_NOTE' as const,
        sourceId: n.id,
        title: n.title,
        reference: `Oleh ${n.authorName} (${n.visibility})`,
        similarityScore: 1,
        excerpt: n.contentMarkdown.slice(0, 240),
      })),
    ];

    return {
      answerMarkdown: aiResult.answerMarkdown,
      scopeIsolationSummary: {
        organizationId: org.id,
        organizationName: org.name,
        activeUnitId: unit.id,
        activeUnitName: unit.name,
        activeUnitType: unit.unitType as OrganizationUnitType,
        parentUnitName: unit.parentUnitName || null,
        unitChunksRetrieved: aiResult.unitChunks.length,
        orgSharedChunksRetrieved: aiResult.orgSharedChunks.length,
        regulationChunksRetrieved: aiResult.regulationChunks.length,
        unitNotesRetrieved: sharedOnlyNotes.length,
      },
      citations,
      telemetry: aiResult.telemetry,
      savedNote,
    };
  }
}
