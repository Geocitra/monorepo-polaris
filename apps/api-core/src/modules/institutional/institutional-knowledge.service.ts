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
  institutionalChatSessions,
  institutionalChatMessages,
  eq,
  and,
  desc,
  asc,
  sql,
} from '@polaris/database';
import { CloudflareR2StorageAdapter } from '@polaris/storage';
import {
  OrganizationUnitType,
  OrganizationMemberRole,
  OrganizationUnitMemberRole,
  InstitutionalMembershipStatus,
  InstitutionalNoteVisibility,
  DatahubPrivacyScope,
  DatahubCategory,
  InstitutionalQuotaFeatureScope,
  type InstitutionalUnitOverviewDto,
  type InstitutionalScopedDocumentDto,
  type InstitutionalSharedNoteDto,
  type InstitutionalAiAssistResponseDto,
  type CoordinatorChatResponseDto,
  type CoordinatorChatMode,
  type CoordinatorGuidedQuestionDto,
  type CoordinatorLinkedActionDto,
  type ProactivePromptCardDto,
  type InstitutionalChatSessionDto,
  type InstitutionalChatSessionDetailDto,
} from '@polaris/shared-types';
import {
  InstitutionalAiService,
  InstitutionalCoordinatorChatService,
  AiTelemetryService,
  getTextCompletionClient,
} from '@polaris/ai-engine';
import { DatahubService } from '../datahub/datahub.service.js';
import { InstitutionalGovernanceService } from './institutional-governance.service.js';
import { InstitutionalQuotaService } from './institutional-quota.service.js';
import type {
  CreateSharedNoteRequestDto,
  InstitutionalDocumentUploadMetaDto,
  InstitutionalAiAssistBodyDto,
  CoordinatorChatRequestDto,
} from './dto/institutional-request.dto.js';

/**
 * Layanan Pengetahuan Terisolasi per Bidang (Bidang Documents, Shared Notes,
 * Dokumen Resmi ORG_SHARED, & Asisten Tenaga Ahli AI Scoped).
 */
@Injectable()
export class InstitutionalKnowledgeService {
  private readonly storageAdapter = new CloudflareR2StorageAdapter();

  constructor(
    private readonly governance: InstitutionalGovernanceService,
    private readonly datahubService: DatahubService,
    private readonly quotaService: InstitutionalQuotaService
  ) { }

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
        'Catatan baru wajib dimulai sebagai Draf Pribadi atau Catatan Bidang sebelum dapat dipromosikan oleh Ketua/Penelaah.'
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
        n.revision_used AS "revisionUsed",
        n.revision_limit AS "revisionLimit",
        n.last_revision_prompt AS "lastRevisionPrompt",
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
      revisionUsed: Number(r.revisionUsed ?? 0),
      revisionLimit: Number(r.revisionLimit ?? 3),
      lastRevisionPrompt: r.lastRevisionPrompt || null,
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

    // Reserve 1 kuota Generate mingguan anggota secara atomik (refund jika AI gagal)
    await this.quotaService.consumeGenerateQuota(
      orgId,
      tenantId,
      InstitutionalQuotaFeatureScope.COORDINATOR_CHAT
    );

    let aiResult: Awaited<ReturnType<typeof InstitutionalAiService.executeScopedBidangAssist>>;
    try {
      aiResult = await InstitutionalAiService.executeScopedBidangAssist({
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
    } catch (err) {
      await this.quotaService.refundGenerateQuota(
        orgId,
        tenantId,
        InstitutionalQuotaFeatureScope.COORDINATOR_CHAT
      );
      throw err;
    }

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

  /**
   * Revisi AI gratis (maksimal 3x per catatan/materi) tanpa memotong kuota Generate mingguan.
   */
  async reviseUnitSharedNote(
    orgId: string,
    unitId: string,
    noteId: string,
    tenantId: string,
    revisionInstruction: string
  ): Promise<InstitutionalSharedNoteDto> {
    const cleanInstruction = revisionInstruction?.trim();
    if (!cleanInstruction) {
      throw new BadRequestException('Instruksi revisi tidak boleh kosong.');
    }

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
      throw new NotFoundException('Catatan bidang tidak ditemukan.');
    }

    const revUsed = Number(note.revisionUsed ?? 0);
    const revLimit = Number(note.revisionLimit ?? 3);
    if (revUsed >= revLimit) {
      throw new BadRequestException({
        errorCode: 'REVISION_LIMIT_EXCEEDED',
        message: `Batas revisi gratis (${revUsed}/${revLimit}) untuk catatan ini telah habis. Silakan buat analisis/generate baru.`,
        revisionUsed: revUsed,
        revisionLimit: revLimit,
      });
    }

    const { client, resolveModel } = getTextCompletionClient();
    const modelName = resolveModel('gpt-4o-mini');
    const trace = AiTelemetryService.startTrace({
      operation: 'institutional_note_revision',
      tenantId,
      organizationId: orgId,
      organizationUnitId: unitId,
      channel: 'INSTITUTIONAL_WORKSPACE',
      activityType: 'INSTITUTIONAL_NOTE_REVISION',
      model: modelName,
      inputPayload: { noteId, revisionRound: revUsed + 1 },
    });

    let revisedMarkdown = note.contentMarkdown;
    let inTokens = 0;
    let outTokens = 0;

    try {
      const completion = await client.chat.completions.create({
        model: modelName,
        temperature: 0.3,
        messages: [
          {
            role: 'system',
            content:
              'Anda adalah Tenaga Ahli Digital Parlemen POLARIS. Revisi catatan kerja berikut sesuai instruksi pengguna tanpa menghilangkan sitasi bukti/pasal yang sudah ada.',
          },
          {
            role: 'user',
            content: `=== JUDUL CATATAN ===\n${note.title}\n\n=== ISI CATATAN SAAT INI ===\n${note.contentMarkdown}\n\n=== INSTRUKSI REVISI (PUTARAN ${revUsed + 1}/${revLimit}) ===\n${cleanInstruction}`,
          },
        ],
      });

      revisedMarkdown = completion.choices[0]?.message?.content?.trim() || note.contentMarkdown;
      inTokens = completion.usage?.prompt_tokens || 0;
      outTokens = completion.usage?.completion_tokens || 0;

      await trace.endTrace({
        status: 'SUCCESS',
        inputTokens: inTokens,
        outputTokens: outTokens,
      });
    } catch (err: any) {
      await trace.endTrace({
        status: 'FAILED',
        inputTokens: 0,
        outputTokens: 0,
        errorMessage: err?.message || 'Revision failed',
      });
      throw err;
    }

    const [updated] = await db
      .update(institutionalSharedNotes)
      .set({
        contentMarkdown: revisedMarkdown,
        revisionUsed: revUsed + 1,
        lastRevisionPrompt: cleanInstruction,
        updatedAt: new Date(),
      })
      .where(eq(institutionalSharedNotes.id, note.id))
      .returning();

    await this.quotaService.recordMemberRevisionStat(orgId, tenantId);
    await this.governance.recordAudit({
      organizationId: orgId,
      unitId,
      actorTenantId: tenantId,
      action: 'REVISE_SHARED_NOTE_AI',
      targetEntity: 'institutional_shared_notes',
      targetEntityId: note.id,
      details: { revisionRound: revUsed + 1, revisionLimit: revLimit },
    });

    const notes = await this.listUnitSharedNotes(orgId, unitId, tenantId);
    const matched = notes.find((n) => n.id === updated.id);
    if (matched) return matched;

    return {
      id: updated.id,
      organizationId: updated.organizationId,
      unitId: updated.unitId,
      authorTenantId: updated.authorTenantId,
      authorName: 'Anggota',
      title: updated.title,
      contentMarkdown: updated.contentMarkdown,
      visibility: updated.visibility as InstitutionalNoteVisibility,
      sourceFileIds: updated.sourceFileIds || [],
      approvedByTenantId: updated.approvedByTenantId,
      approvedAt: updated.approvedAt ? updated.approvedAt.toISOString() : null,
      revisionUsed: updated.revisionUsed,
      revisionLimit: updated.revisionLimit,
      lastRevisionPrompt: updated.lastRevisionPrompt,
      createdAt: updated.createdAt.toISOString(),
      updatedAt: updated.updatedAt.toISOString(),
    };
  }

  /**
   * Koordinator Tenaga Ahli POLARIS (Chat Konvensional + Tabel Keuangan/LKPJ + Gambar Imagen).
   * Mematuhi Strict Bidang Isolation dan sistem kuota B2B mingguan.
   */
  async executeCoordinatorChat(
    orgId: string,
    unitId: string,
    tenantId: string,
    dto: CoordinatorChatRequestDto
  ): Promise<CoordinatorChatResponseDto> {
    const cleanMessage = dto.message?.trim();
    if (!cleanMessage) {
      throw new BadRequestException('Pesan chat tidak boleh kosong.');
    }

    const [org] = await db
      .select()
      .from(organizations)
      .where(eq(organizations.id, orgId))
      .limit(1);

    if (!org) {
      throw new NotFoundException('Instansi tidak ditemukan.');
    }

    const unitRow = await db.execute(sql`
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

    // Ambil ringkasan matriks LKPJ & Rancangan Legislasi terbaru di organisasi (jika ada) agar Koordinator sadar konteks
    let lkpjContextSummary: string | null = null;
    try {
      const findingsRes = await db.execute(sql`
        SELECT f.opd_name AS "opdName", f.indicator_or_issue AS "indicatorOrIssue",
               f.target_value AS "targetValue", f.realization_value AS "realizationValue",
               f.budget_ceiling_idr AS "budgetCeilingIdr", f.budget_realization_idr AS "budgetRealizationIdr",
               f.proposed_recommendation AS "recommendationDraft"
        FROM lkpj_findings f
        JOIN lkpj_evaluation_workspaces w ON f.workspace_id = w.id
        WHERE w.organization_id = ${orgId}::uuid
          AND (w.assigned_discussion_unit_id IS NULL OR w.assigned_discussion_unit_id = ${unitId}::uuid)
        ORDER BY f.updated_at DESC
        LIMIT 8;
      `);
      const rows = ((findingsRes as any)?.rows || []) as any[];
      if (rows.length > 0) {
        lkpjContextSummary = rows
          .map(
            (r, i) =>
              `[TEMUAN_LKPJ_${i + 1}] OPD: ${r.opdName} | Isu: ${r.indicatorOrIssue} | Target: ${r.targetValue ?? '-'} | Realisasi: ${r.realizationValue ?? '-'} | Pagu: ${r.budgetCeilingIdr ?? '-'} | Realisasi APBD: ${r.budgetRealizationIdr ?? '-'} | Rekomendasi: ${r.recommendationDraft || '-'}`
          )
          .join('\n');
      }
    } catch {
      // Abaikan bila tabel belum memiliki data
    }

    let legislationContextSummary: string | null = null;
    try {
      const draftsRes = await db.execute(sql`
        SELECT title, document_category AS "documentCategory", current_stage AS "currentStage", problem_statement AS "problemStatement"
        FROM legislation_drafts
        WHERE organization_id = ${orgId}::uuid
        ORDER BY updated_at DESC
        LIMIT 5;
      `);
      const draftRows = ((draftsRes as any)?.rows || []) as any[];
      if (draftRows.length > 0) {
        legislationContextSummary = draftRows
          .map(
            (d, i) =>
              `[RANCANGAN_${i + 1}] [${d.documentCategory}] ${d.title} (Tahap: ${d.currentStage}) — Masalah: ${d.problemStatement || '-'}`
          )
          .join('\n');
      }
    } catch {
      // Abaikan bila tabel belum memiliki data
    }

    const guidedQuestion = this.buildClarificationGuide(
      dto.mode,
      cleanMessage,
      dto.skipClarification,
      dto.selectedFileIds,
      Boolean(lkpjContextSummary),
      Boolean(legislationContextSummary)
    );
    if (guidedQuestion) {
      const currentQuota = await this.quotaService.getMemberQuota(
        orgId,
        tenantId,
        InstitutionalQuotaFeatureScope.COORDINATOR_CHAT
      );
      return {
        assistantMessage: guidedQuestion.promptTitle,
        routedAgents: ['Koordinator Tenaga Ahli'],
        detectedMode: dto.mode || 'AUTO',
        usedCitations: [],
        guidedQuestion,
        quotaRemainingWeekly: currentQuota.remainingWeekly,
        quotaWeeklyLimit: currentQuota.weeklyLimit,
      };
    }

    // Reserve 1 kuota Generate mingguan anggota secara atomik (refund jika AI gagal)
    await this.quotaService.consumeGenerateQuota(
      orgId,
      tenantId,
      InstitutionalQuotaFeatureScope.COORDINATOR_CHAT
    );

    let chatResult: Awaited<
      ReturnType<typeof InstitutionalCoordinatorChatService.executeCoordinatorChat>
    >;
    let finalImageUrl: string | null = null;
    let sessionId = dto.sessionId?.trim() || '';

    try {
      chatResult = await InstitutionalCoordinatorChatService.executeCoordinatorChat({
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
        message: cleanMessage,
        mode: dto.mode || 'AUTO',
        history: dto.history || [],
        selectedFileIds: dto.selectedFileIds,
        includeOrgSharedDocuments: dto.includeOrgSharedDocuments ?? true,
        includeNationalAndRegionalRegulations:
          dto.includeNationalAndRegionalRegulations ?? true,
        imageAspectRatio: dto.imageAspectRatio || '4:5',
        unitSharedNotes: sharedOnlyNotes,
        lkpjContextSummary,
        legislationContextSummary,
      });

      // Persistensikan gambar hasil Imagen ke Object Storage (@polaris/storage) jika tersedia
      finalImageUrl = chatResult.generatedImageUrl || null;
      if (finalImageUrl) {
        finalImageUrl = await this.persistGeneratedChatImage(orgId, unitId, finalImageUrl);
      }

      // Persistensikan Sesi & Pesan Chat ke PostgreSQL
      if (sessionId) {
        const [existingSession] = await db
          .select({ id: institutionalChatSessions.id })
          .from(institutionalChatSessions)
          .where(
            and(
              eq(institutionalChatSessions.id, sessionId),
              eq(institutionalChatSessions.organizationId, orgId),
              eq(institutionalChatSessions.unitId, unitId),
              eq(institutionalChatSessions.tenantId, tenantId)
            )
          )
          .limit(1);
        if (!existingSession) {
          sessionId = '';
        }
      }

      if (!sessionId) {
        const sessionTitle =
          cleanMessage.length > 80 ? `${cleanMessage.slice(0, 77)}...` : cleanMessage;
        const [createdSession] = await db
          .insert(institutionalChatSessions)
          .values({
            organizationId: orgId,
            unitId,
            tenantId,
            title: sessionTitle,
          })
          .returning({ id: institutionalChatSessions.id });
        sessionId = createdSession.id;
      } else {
        await db
          .update(institutionalChatSessions)
          .set({ lastMessageAt: new Date(), updatedAt: new Date() })
          .where(eq(institutionalChatSessions.id, sessionId));
      }

      await db.insert(institutionalChatMessages).values([
        {
          sessionId,
          role: 'user',
          content: cleanMessage,
          detectedMode: chatResult.detectedMode,
          routedAgents: [],
          usedCitations: [],
          generatedImageUrl: null,
        },
        {
          sessionId,
          role: 'assistant',
          content: chatResult.assistantMessage,
          detectedMode: chatResult.detectedMode,
          routedAgents: chatResult.routedAgents || [],
          usedCitations: chatResult.usedCitations || [],
          generatedImageUrl: finalImageUrl,
        },
      ]);
    } catch (err) {
      await this.quotaService.refundGenerateQuota(
        orgId,
        tenantId,
        InstitutionalQuotaFeatureScope.COORDINATOR_CHAT
      );
      throw err;
    }

    let savedNoteId: string | null = null;
    if (dto.saveAsSharedNoteTitle && dto.saveAsSharedNoteTitle.trim()) {
      const saved = await this.createSharedNote(orgId, unitId, tenantId, {
        title: dto.saveAsSharedNoteTitle.trim(),
        contentMarkdown: chatResult.assistantMessage,
        visibility: InstitutionalNoteVisibility.UNIT_SHARED,
        sourceFileIds: dto.selectedFileIds || [],
      });
      savedNoteId = saved.id;
    }

    const updatedQuota = await this.quotaService.getMemberQuota(
      orgId,
      tenantId,
      InstitutionalQuotaFeatureScope.COORDINATOR_CHAT
    );

    await this.governance.recordAudit({
      organizationId: orgId,
      unitId,
      actorTenantId: tenantId,
      action: 'COORDINATOR_CHAT_EXECUTION',
      targetEntity: 'organization_units',
      targetEntityId: unitId,
      details: {
        sessionId,
        detectedMode: chatResult.detectedMode,
        routedAgents: chatResult.routedAgents,
        hasGeneratedImage: Boolean(finalImageUrl),
      },
    });

    const linkedActions = this.buildLinkedActions(chatResult.detectedMode, Boolean(finalImageUrl));

    return {
      ...chatResult,
      sessionId,
      generatedImageUrl: finalImageUrl,
      quotaRemainingWeekly: updatedQuota.remainingWeekly,
      quotaWeeklyLimit: updatedQuota.weeklyLimit,
      savedNoteId,
      linkedActions,
    };
  }

  private buildLinkedActions(
    mode?: CoordinatorChatMode | null,
    hasImage?: boolean
  ): CoordinatorLinkedActionDto[] {
    const actions: CoordinatorLinkedActionDto[] = [];
    if (mode === 'LKPJ_FINANCE') {
      actions.push({
        label: 'Buka Matriks LKPJ & Cetak PDF',
        kind: 'OPEN_LKPJ',
        href: '/institutional/lkpj',
      });
    } else if (mode === 'LEGISLATION') {
      actions.push({
        label: 'Buka Workspace Raperda & DIM',
        kind: 'OPEN_LEGISLATION',
        href: '/institutional/legislation',
      });
    }
    if (hasImage) {
      actions.push({
        label: 'Unduh Visual',
        kind: 'DOWNLOAD_IMAGE',
      });
    }
    return actions;
  }

  private buildClarificationGuide(
    mode: CoordinatorChatMode | undefined,
    cleanMessage: string,
    skipClarification?: boolean,
    selectedFileIds?: string[],
    hasLkpjData?: boolean,
    hasLegislationData?: boolean
  ): CoordinatorGuidedQuestionDto | null {
    if (skipClarification) return null;
    if (selectedFileIds && selectedFileIds.length > 0) return null;
    if (cleanMessage.length >= 45) return null;

    if (mode === 'LKPJ_FINANCE') {
      return {
        promptTitle:
          'Untuk evaluasi LKPJ & serapan anggaran yang akurat, silakan pilih fokus analisis atau sumber datanya:',
        options: [
          {
            id: 'lkpj_recommended',
            label: '(Recommended) Audit Serapan & Anomali OPD dari Data Bidang',
            description: hasLkpjData
              ? 'Langsung analisa workspace LKPJ & dokumen anggaran yang tersedia di Bidang ini.'
              : 'Analisa struktur anggaran & siapkan tabel evaluasi OPD.',
            recommended: true,
            mode: 'LKPJ_FINANCE',
            nextMessage:
              'Buatkan tabel evaluasi keuangan dan kinerja OPD berdasarkan data LKPJ/APBD Bidang ini: tampilkan Target, Realisasi, Pagu, Serapan (%), dan soroti potensi anomali anggaran.',
          },
          {
            id: 'lkpj_upload',
            label: 'Unggah Dokumen LKPJ / APBD Baru (PDF/Excel)',
            description: 'Lampirkan file LKPJ terlebih dahulu agar angka diekstrak presisi.',
            requiresUpload: true,
            mode: 'LKPJ_FINANCE',
            nextMessage: '',
          },
          {
            id: 'lkpj_library',
            label: 'Pilih Dokumen Spesifik dari Pustaka Bidang',
            description: 'Tentukan file LKPJ tertentu yang sudah tersimpan di Bidang.',
            requiresLibraryPick: true,
            mode: 'LKPJ_FINANCE',
            nextMessage: '',
          },
          {
            id: 'lkpj_fraksi',
            label: 'Susun Draf Sikap Fraksi & Rekomendasi Paripurna',
            description: 'Fokus pada poin catatan strategis dan rekomendasi perbaikan untuk kepala daerah.',
            mode: 'LKPJ_FINANCE',
            nextMessage:
              'Susunkan draf sikap fraksi dan rekomendasi strategis atas capaian LKPJ di Bidang ini lengkap dengan indikator kinerja dan tindak lanjut OPD.',
          },
        ],
      };
    }

    if (mode === 'LEGISLATION') {
      return {
        promptTitle:
          'Pilih jenis telaah legislasi & hukum yang ingin dilakukan oleh Tim Ahli POLARIS:',
        options: [
          {
            id: 'leg_recommended',
            label: '(Recommended) Uji Kepatuhan Pasal & Tumpang Tindih Regulasi',
            description: hasLegislationData
              ? 'Telaah draf Raperda yang sudah ada di Bidang ini terhadap regulasi & UU 1/2026.'
              : 'Periksa kesesuaian draf kebijakan terhadap regulasi nasional & daerah.',
            recommended: true,
            mode: 'LEGISLATION',
            nextMessage:
              'Lakukan uji kepatuhan draf Raperda/kebijakan di Bidang ini terhadap regulasi yang berlaku, cek potensi tumpang tindih kewenangan, dan susun matriks perbaikannya.',
          },
          {
            id: 'leg_upload',
            label: 'Unggah Draf Raperda / Naskah Akademik (PDF/DOCX)',
            description: 'Lampirkan naskah Raperda baru untuk dianalisis pasal per pasal.',
            requiresUpload: true,
            mode: 'LEGISLATION',
            nextMessage: '',
          },
          {
            id: 'leg_dim',
            label: 'Susun Daftar Inventarisasi Masalah (DIM)',
            description: 'Buat matriks perbandingan pasal bermasalah, usulan fraksi, dan alasannya.',
            mode: 'LEGISLATION',
            nextMessage:
              'Buatkan Daftar Inventarisasi Masalah (DIM) dalam format tabel terstruktur (Pasal, Rumusan Awal, Catatan Kritis, Usulan Perubahan) dari draf regulasi di Bidang ini.',
          },
        ],
      };
    }

    return null;
  }

  async getUnitProactivePrompts(
    orgId: string,
    unitId: string
  ): Promise<ProactivePromptCardDto[]> {
    const [org] = await db
      .select({ name: organizations.name, regionName: organizations.regionName })
      .from(organizations)
      .where(eq(organizations.id, orgId))
      .limit(1);

    let unitName = 'Bidang Kerja';
    let focusSectors: string[] = [];
    try {
      const unitRes = await db.execute(sql`
        SELECT name, focus_sectors AS "focusSectors"
        FROM organization_units
        WHERE id = ${unitId}::uuid AND organization_id = ${orgId}::uuid
        LIMIT 1;
      `);
      const u = ((unitRes as any)?.rows || [])[0];
      if (u?.name) unitName = u.name;
      if (Array.isArray(u?.focusSectors)) focusSectors = u.focusSectors;
    } catch { }

    const regionLabel = org?.regionName || 'Daerah';
    const sectorLabel = focusSectors[0] || unitName;

    let latestNewsTitle: string | null = null;
    try {
      const newsRes = await db.execute(sql`
        SELECT title
        FROM radar_trends
        WHERE region_name ILIKE ${'%' + regionLabel + '%'}
        ORDER BY created_at DESC
        LIMIT 1;
      `);
      latestNewsTitle = ((newsRes as any)?.rows || [])[0]?.title || null;
    } catch { }

    let latestLkpjLabel: string | null = null;
    try {
      const lkpjRes = await db.execute(sql`
        SELECT title, fiscal_year AS "fiscalYear"
        FROM lkpj_evaluation_workspaces
        WHERE organization_id = ${orgId}::uuid
          AND (assigned_discussion_unit_id IS NULL OR assigned_discussion_unit_id = ${unitId}::uuid)
        ORDER BY updated_at DESC
        LIMIT 1;
      `);
      const row = ((lkpjRes as any)?.rows || [])[0];
      if (row?.title) latestLkpjLabel = `${row.title} (${row.fiscalYear || ''})`.trim();
    } catch { }

    let latestLegTitle: string | null = null;
    try {
      const legRes = await db.execute(sql`
        SELECT title
        FROM legislation_drafts
        WHERE organization_id = ${orgId}::uuid
        ORDER BY updated_at DESC
        LIMIT 1;
      `);
      latestLegTitle = ((legRes as any)?.rows || [])[0]?.title || null;
    } catch { }

    let latestDocTitle: string | null = null;
    try {
      const docRes = await db.execute(sql`
        SELECT COALESCE(custom_title, category_tag) AS title
        FROM datahub_document_refs
        WHERE organization_id = ${orgId}::uuid AND organization_unit_id = ${unitId}::uuid
        ORDER BY created_at DESC
        LIMIT 1;
      `);
      latestDocTitle = ((docRes as any)?.rows || [])[0]?.title || null;
    } catch { }

    return [
      {
        id: 'proactive_news',
        category: 'NEWS',
        badge: `Isu ${regionLabel}`,
        title: latestNewsTitle
          ? `Analisa Isu: ${latestNewsTitle.slice(0, 68)}`
          : `Analisa Isu Publik & Aspirasi ${sectorLabel} (${regionLabel})`,
        prompt: latestNewsTitle
          ? `Analisa isu berita terbaru "${latestNewsTitle}" dari sudut pandang ${unitName} (${regionLabel}), dampaknya bagi masyarakat, serta susun 5 pertanyaan kritis untuk rapat bersama OPD mitra.`
          : `Rangkumkan isu strategis sektor ${sectorLabel} di ${regionLabel}, identifikasi titik masalah utama, dan susun 5 pertanyaan rapat kritis untuk OPD mitra.`,
        mode: 'BRIEFING',
      },
      {
        id: 'proactive_lkpj',
        category: 'LKPJ',
        badge: 'LKPJ & Anggaran',
        title: latestLkpjLabel
          ? `Audit Serapan: ${latestLkpjLabel.slice(0, 60)}`
          : latestDocTitle
            ? `Evaluasi Dokumen: ${latestDocTitle.slice(0, 60)}`
            : `Audit Serapan Anggaran & Kinerja OPD (${unitName})`,
        prompt: latestLkpjLabel
          ? `Lakukan audit serapan anggaran dan capaian kinerja pada ${latestLkpjLabel}: tampilkan tabel Target, Realisasi, Pagu, Serapan (%), dan soroti anomali atau program yang tertinggal.`
          : `Buatkan tabel evaluasi serapan anggaran dan kinerja OPD berdasarkan dokumen LKPJ/APBD terbaru di ${unitName}: tampilkan Pagu, Realisasi, Serapan (%), serta catatan kritis.`,
        mode: 'LKPJ_FINANCE',
      },
      {
        id: 'proactive_leg',
        category: 'LEGISLATION',
        badge: 'Legislasi',
        title: latestLegTitle
          ? `Telaah Pasal: ${latestLegTitle.slice(0, 62)}`
          : `Uji Kepatuhan Raperda & Matriks DIM (${unitName})`,
        prompt: latestLegTitle
          ? `Lakukan uji kepatuhan hukum atas rancangan "${latestLegTitle}" terhadap regulasi nasional dan UU 1/2026, serta susun Daftar Inventarisasi Masalah (DIM) untuk penyempurnaan pasal.`
          : `Telaah rancangan peraturan atau kebijakan di ${unitName} terhadap regulasi yang berlaku, cek potensi tumpang tindih kewenangan, dan buatkan matriks perbaikannya.`,
        mode: 'LEGISLATION',
      },
      {
        id: 'proactive_image',
        category: 'IMAGE',
        badge: 'Visual Publik',
        title: `Buat Infografis Edukasi Publik ${sectorLabel}`,
        prompt: latestNewsTitle
          ? `Buatkan infografis editorial yang jelas dan informatif mengenai sikap ${unitName} (${regionLabel}) atas isu "${latestNewsTitle}".`
          : `Buatkan infografis editorial yang informatif mengenai prioritas pengawasan ${unitName} di bidang ${sectorLabel} untuk publikasi masyarakat ${regionLabel}.`,
        mode: 'IMAGE',
      },
    ];
  }

  private async persistGeneratedChatImage(
    orgId: string,
    unitId: string,
    rawUrl: string
  ): Promise<string> {
    try {
      let buffer: Buffer | null = null;
      let contentType = 'image/png';

      if (rawUrl.startsWith('data:image/')) {
        const match = rawUrl.match(/^data:(image\/[a-zA-Z0-9+.-]+);base64,(.+)$/);
        if (match) {
          contentType = match[1];
          buffer = Buffer.from(match[2], 'base64');
        }
      } else if (rawUrl.startsWith('http://') || rawUrl.startsWith('https://')) {
        const res = await fetch(rawUrl);
        if (res.ok) {
          contentType = res.headers.get('content-type') || 'image/png';
          buffer = Buffer.from(await res.arrayBuffer());
        }
      }

      if (!buffer || buffer.length === 0) return rawUrl;

      const ext = contentType.includes('jpeg') ? 'jpg' : 'png';
      const destinationPath = `institutional/${orgId}/units/${unitId}/chat-images/${Date.now()}.${ext}`;
      const uploaded = await this.storageAdapter.uploadBuffer(buffer, {
        destinationPath,
        contentType,
        contentLength: buffer.length,
      });
      return uploaded.publicUrl || rawUrl;
    } catch {
      return rawUrl;
    }
  }

  async listUnitChatSessions(
    orgId: string,
    unitId: string,
    tenantId: string
  ): Promise<InstitutionalChatSessionDto[]> {
    const rows = await db
      .select()
      .from(institutionalChatSessions)
      .where(
        and(
          eq(institutionalChatSessions.organizationId, orgId),
          eq(institutionalChatSessions.unitId, unitId),
          eq(institutionalChatSessions.tenantId, tenantId)
        )
      )
      .orderBy(desc(institutionalChatSessions.lastMessageAt))
      .limit(30);

    return rows.map((s) => ({
      id: s.id,
      organizationId: s.organizationId,
      unitId: s.unitId,
      tenantId: s.tenantId,
      title: s.title,
      lastMessageAt: s.lastMessageAt.toISOString(),
      createdAt: s.createdAt.toISOString(),
    }));
  }

  async getUnitChatSessionDetail(
    orgId: string,
    unitId: string,
    sessionId: string,
    tenantId: string
  ): Promise<InstitutionalChatSessionDetailDto> {
    const [session] = await db
      .select()
      .from(institutionalChatSessions)
      .where(
        and(
          eq(institutionalChatSessions.id, sessionId),
          eq(institutionalChatSessions.organizationId, orgId),
          eq(institutionalChatSessions.unitId, unitId),
          eq(institutionalChatSessions.tenantId, tenantId)
        )
      )
      .limit(1);

    if (!session) {
      throw new NotFoundException('Sesi percakapan tidak ditemukan.');
    }

    const msgs = await db
      .select()
      .from(institutionalChatMessages)
      .where(eq(institutionalChatMessages.sessionId, session.id))
      .orderBy(asc(institutionalChatMessages.createdAt));

    return {
      session: {
        id: session.id,
        organizationId: session.organizationId,
        unitId: session.unitId,
        tenantId: session.tenantId,
        title: session.title,
        lastMessageAt: session.lastMessageAt.toISOString(),
        createdAt: session.createdAt.toISOString(),
      },
      messages: msgs.map((m) => ({
        id: m.id,
        sessionId: m.sessionId,
        role: m.role as 'user' | 'assistant',
        content: m.content,
        detectedMode: (m.detectedMode as CoordinatorChatMode) || null,
        routedAgents: Array.isArray(m.routedAgents) ? m.routedAgents : [],
        usedCitations: Array.isArray(m.usedCitations) ? m.usedCitations : [],
        generatedImageUrl: m.generatedImageUrl || null,
        linkedActions:
          m.role === 'assistant'
            ? this.buildLinkedActions((m.detectedMode as CoordinatorChatMode) || null, Boolean(m.generatedImageUrl))
            : undefined,
        createdAt: m.createdAt.toISOString(),
      })),
    };
  }

  async deleteUnitChatSession(
    orgId: string,
    unitId: string,
    sessionId: string,
    tenantId: string
  ): Promise<{ deleted: true }> {
    const [deleted] = await db
      .delete(institutionalChatSessions)
      .where(
        and(
          eq(institutionalChatSessions.id, sessionId),
          eq(institutionalChatSessions.organizationId, orgId),
          eq(institutionalChatSessions.unitId, unitId),
          eq(institutionalChatSessions.tenantId, tenantId)
        )
      )
      .returning({ id: institutionalChatSessions.id });

    if (!deleted) {
      throw new NotFoundException('Sesi percakapan tidak ditemukan.');
    }

    return { deleted: true };
  }
}
