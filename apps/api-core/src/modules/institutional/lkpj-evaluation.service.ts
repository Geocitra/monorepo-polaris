import {
  Injectable,
  BadRequestException,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import {
  db,
  withInstitutionalContext,
  organizations,
  organizationUnits,
  organizationUnitMemberships,
  datahubDocumentRefs,
  datahubFiles,
  lkpjEvaluationWorkspaces,
  lkpjEvaluationMaterials,
  lkpjFindings,
  lkpjFactionProposals,
  eq,
  and,
  sql,
} from '@polaris/database';
import {
  OrganizationMemberRole,
  OrganizationUnitMemberRole,
  OrganizationUnitType,
  InstitutionalMembershipStatus,
  DatahubPrivacyScope,
  DatahubCategory,
  InstitutionalQuotaFeatureScope,
  LkpjWorkspaceStatus,
  LkpjMaterialCategory,
  LkpjExtractionVerificationStatus,
  LkpjIndicatorDirection,
  LkpjEvidenceStatus,
  LkpjFindingReviewStatus,
  LkpjFollowupStatus,
  LkpjFactionStance,
  LkpjMeetingPackageType,
  type LkpjEvaluationWorkspaceDto,
  type LkpjEvaluationMaterialDto,
  type LkpjFindingDto,
  type LkpjFactionProposalDto,
  type LkpjFactionConsolidationItemDto,
  type LkpjWorkspaceDashboardDto,
  type LkpjSpecialistAiResponseDto,
  type LkpjMeetingPackageResponseDto,
  type UploadLkpjMaterialResultDto,
} from '@polaris/shared-types';
import { LkpjEvaluationAiService } from '@polaris/ai-engine';
import { DatahubService } from '../datahub/datahub.service.js';
import { InstitutionalGovernanceService } from './institutional-governance.service.js';
import { InstitutionalQuotaService } from './institutional-quota.service.js';
import type {
  CreateLkpjWorkspaceRequestDto,
  UpdateLkpjWorkspaceStatusRequestDto,
  RegisterLkpjMaterialRequestDto,
  VerifyLkpjMaterialRequestDto,
  UpsertLkpjFindingRequestDto,
  ReviewLkpjFindingRequestDto,
  UpdateLkpjFindingFollowupRequestDto,
  SubmitLkpjFactionProposalRequestDto,
  RunLkpjSpecialistAiRequestDto,
  UploadLkpjMaterialMetaRequestDto,
} from './dto/lkpj-request.dto.js';

const ALLOWED_WORKSPACE_TRANSITIONS: Record<LkpjWorkspaceStatus, LkpjWorkspaceStatus[]> = {
  [LkpjWorkspaceStatus.REGISTERED]: [
    LkpjWorkspaceStatus.REGISTERED,
    LkpjWorkspaceStatus.IN_DISCUSSION,
  ],
  [LkpjWorkspaceStatus.IN_DISCUSSION]: [
    LkpjWorkspaceStatus.IN_DISCUSSION,
    LkpjWorkspaceStatus.PRE_PLENARY_CONSOLIDATION,
  ],
  [LkpjWorkspaceStatus.PRE_PLENARY_CONSOLIDATION]: [
    LkpjWorkspaceStatus.IN_DISCUSSION,
    LkpjWorkspaceStatus.PRE_PLENARY_CONSOLIDATION,
    LkpjWorkspaceStatus.PLENARY_ADOPTED,
  ],
  [LkpjWorkspaceStatus.PLENARY_ADOPTED]: [
    LkpjWorkspaceStatus.PLENARY_ADOPTED,
    LkpjWorkspaceStatus.POST_PLENARY_MONITORING,
  ],
  [LkpjWorkspaceStatus.POST_PLENARY_MONITORING]: [
    LkpjWorkspaceStatus.POST_PLENARY_MONITORING,
  ],
};

const ALLOWED_FINDING_REVIEW_TRANSITIONS: Record<
  LkpjFindingReviewStatus,
  LkpjFindingReviewStatus[]
> = {
  [LkpjFindingReviewStatus.DRAFT]: [
    LkpjFindingReviewStatus.DRAFT,
    LkpjFindingReviewStatus.NEEDS_REVISION,
    LkpjFindingReviewStatus.APPROVED_FOR_DISCUSSION,
  ],
  [LkpjFindingReviewStatus.NEEDS_REVISION]: [
    LkpjFindingReviewStatus.NEEDS_REVISION,
    LkpjFindingReviewStatus.APPROVED_FOR_DISCUSSION,
  ],
  [LkpjFindingReviewStatus.APPROVED_FOR_DISCUSSION]: [
    LkpjFindingReviewStatus.NEEDS_REVISION,
    LkpjFindingReviewStatus.APPROVED_FOR_DISCUSSION,
    LkpjFindingReviewStatus.CONSOLIDATED_FOR_PLENARY,
    LkpjFindingReviewStatus.OFFICIAL_RECOMMENDATION,
  ],
  [LkpjFindingReviewStatus.CONSOLIDATED_FOR_PLENARY]: [
    LkpjFindingReviewStatus.NEEDS_REVISION,
    LkpjFindingReviewStatus.CONSOLIDATED_FOR_PLENARY,
    LkpjFindingReviewStatus.OFFICIAL_RECOMMENDATION,
  ],
  [LkpjFindingReviewStatus.OFFICIAL_RECOMMENDATION]: [
    LkpjFindingReviewStatus.OFFICIAL_RECOMMENDATION,
  ],
};

@Injectable()
export class LkpjEvaluationService {
  constructor(
    private readonly governance: InstitutionalGovernanceService,
    private readonly datahubService: DatahubService,
    private readonly quotaService: InstitutionalQuotaService
  ) { }

  private async hasReviewerCapabilityOnUnitOrOrg(params: {
    orgId: string;
    tenantId: string;
    orgRole: OrganizationMemberRole;
    unitId?: string | null;
    activeUnitRole?: OrganizationUnitMemberRole | null;
  }): Promise<boolean> {
    if (
      params.orgRole === OrganizationMemberRole.ORG_ADMIN ||
      params.orgRole === OrganizationMemberRole.LEADERSHIP ||
      params.orgRole === OrganizationMemberRole.EXPERT_STAFF
    ) {
      return true;
    }

    if (
      params.activeUnitRole === OrganizationUnitMemberRole.UNIT_LEAD ||
      params.activeUnitRole === OrganizationUnitMemberRole.REVIEWER ||
      params.activeUnitRole === OrganizationUnitMemberRole.EXPERT_STAFF
    ) {
      return true;
    }

    if (params.unitId) {
      const [unitMem] = await db
        .select({ unitRole: organizationUnitMemberships.unitRole })
        .from(organizationUnitMemberships)
        .where(
          and(
            eq(organizationUnitMemberships.organizationId, params.orgId),
            eq(organizationUnitMemberships.unitId, params.unitId),
            eq(organizationUnitMemberships.tenantId, params.tenantId),
            eq(organizationUnitMemberships.status, InstitutionalMembershipStatus.ACTIVE)
          )
        )
        .limit(1);

      if (
        unitMem &&
        (unitMem.unitRole === OrganizationUnitMemberRole.UNIT_LEAD ||
          unitMem.unitRole === OrganizationUnitMemberRole.REVIEWER ||
          unitMem.unitRole === OrganizationUnitMemberRole.EXPERT_STAFF)
      ) {
        return true;
      }
    }

    return false;
  }

  private mapWorkspaceDto(
    row: any,
    orgName?: string,
    unitName?: string | null,
    unitType?: OrganizationUnitType | null
  ): LkpjEvaluationWorkspaceDto {
    const deadlineMs = new Date(row.discussionDeadlineAt || row.discussion_deadline_at).getTime();
    const submittedMs = new Date(row.lkpjSubmittedAt || row.lkpj_submitted_at).getTime();
    const nowMs = Date.now();
    const daysRemaining = Math.max(0, Math.ceil((deadlineMs - nowMs) / (1000 * 60 * 60 * 24)));

    return {
      id: row.id,
      organizationId: row.organizationId || row.organization_id,
      organizationName: orgName || row.organizationName,
      fiscalYear: Number(row.fiscalYear ?? row.fiscal_year),
      title: row.title,
      status: (row.status as LkpjWorkspaceStatus) || LkpjWorkspaceStatus.REGISTERED,
      assignedDiscussionUnitId:
        row.assignedDiscussionUnitId ?? row.assigned_discussion_unit_id ?? null,
      assignedDiscussionUnitName: unitName ?? row.assignedDiscussionUnitName ?? null,
      assignedDiscussionUnitType:
        (unitType ?? (row.assignedDiscussionUnitType as OrganizationUnitType)) || null,
      lkpjSubmittedAt: new Date(submittedMs).toISOString(),
      discussionDeadlineAt: new Date(deadlineMs).toISOString(),
      prePlenaryAt:
        row.prePlenaryAt || row.pre_plenary_at
          ? new Date(row.prePlenaryAt || row.pre_plenary_at).toISOString()
          : null,
      finalPlenaryAt:
        row.finalPlenaryAt || row.final_plenary_at
          ? new Date(row.finalPlenaryAt || row.final_plenary_at).toISOString()
          : null,
      daysRemainingForDiscussion: daysRemaining,
      standingOrdersNotes: row.standingOrdersNotes ?? row.standing_orders_notes ?? null,
      createdByTenantId: row.createdByTenantId ?? row.created_by_tenant_id ?? null,
      createdAt: new Date(row.createdAt || row.created_at).toISOString(),
      updatedAt: new Date(row.updatedAt || row.updated_at).toISOString(),
    };
  }

  // ============================================================================
  // 1. LKPJ EVALUATION WORKSPACE MANAGEMENT (1 RUANG KERJA PER PEMDA & TAHUN)
  // ============================================================================

  async createOrGetWorkspace(
    orgId: string,
    actorTenantId: string,
    myOrgRole: OrganizationMemberRole,
    dto: CreateLkpjWorkspaceRequestDto
  ): Promise<LkpjEvaluationWorkspaceDto> {
    const [org] = await db
      .select()
      .from(organizations)
      .where(eq(organizations.id, orgId))
      .limit(1);

    if (!org) {
      throw new NotFoundException('Instansi tidak ditemukan.');
    }

    const [existing] = await db
      .select()
      .from(lkpjEvaluationWorkspaces)
      .where(
        and(
          eq(lkpjEvaluationWorkspaces.organizationId, orgId),
          eq(lkpjEvaluationWorkspaces.fiscalYear, dto.fiscalYear)
        )
      )
      .limit(1);

    if (existing) {
      return this.mapWorkspaceDto(existing, org.name);
    }

    if (
      myOrgRole !== OrganizationMemberRole.ORG_ADMIN &&
      myOrgRole !== OrganizationMemberRole.LEADERSHIP
    ) {
      throw new ForbiddenException(
        'Hanya Admin Sekretariat DPRD atau Pimpinan DPRD yang berwenang membuka siklus ruang kerja LKPJ baru.'
      );
    }

    const submittedAt = new Date(dto.lkpjSubmittedAt);
    if (isNaN(submittedAt.getTime())) {
      throw new BadRequestException('Tanggal penyampaian LKPJ tidak valid.');
    }

    // Default pembahasan paling lambat 30 hari setelah LKPJ diterima (PP 13/2019 & Tata Tertib)
    const defaultDaysLimit = org.standingOrdersConfig?.lkpjDiscussionDaysLimit ?? 30;
    const deadlineAt = dto.discussionDeadlineAt
      ? new Date(dto.discussionDeadlineAt)
      : new Date(submittedAt.getTime() + defaultDaysLimit * 24 * 60 * 60 * 1000);

    if (isNaN(deadlineAt.getTime()) || deadlineAt < submittedAt) {
      throw new BadRequestException(
        'Batas waktu pembahasan LKPJ tidak boleh lebih awal dari tanggal penyampaian LKPJ.'
      );
    }

    let unitName: string | null = null;
    let unitType: OrganizationUnitType | null = null;
    if (dto.assignedDiscussionUnitId) {
      const [unit] = await db
        .select()
        .from(organizationUnits)
        .where(
          and(
            eq(organizationUnits.id, dto.assignedDiscussionUnitId),
            eq(organizationUnits.organizationId, orgId)
          )
        )
        .limit(1);
      if (!unit) {
        throw new BadRequestException('Alat pembahas (Panja/Pansus/Komisi) tidak ditemukan pada Instansi ini.');
      }
      unitName = unit.name;
      unitType = unit.unitType as OrganizationUnitType;
    }

    const defaultTitle =
      dto.title?.trim() || `Evaluasi LKPJ ${org.regionName} Tahun Anggaran ${dto.fiscalYear}`;

    const [created] = await db
      .insert(lkpjEvaluationWorkspaces)
      .values({
        organizationId: orgId,
        fiscalYear: dto.fiscalYear,
        title: defaultTitle,
        status: LkpjWorkspaceStatus.IN_DISCUSSION,
        assignedDiscussionUnitId: dto.assignedDiscussionUnitId || null,
        lkpjSubmittedAt: submittedAt,
        discussionDeadlineAt: deadlineAt,
        standingOrdersNotes:
          dto.standingOrdersNotes?.trim() ||
          `Batas pembahasan maksimal ${defaultDaysLimit} hari kalender sejak Paripurna Penyampaian LKPJ sesuai PP Nomor 13 Tahun 2019 & Tata Tertib ${org.name}.`,
        createdByTenantId: actorTenantId,
      })
      .returning();

    await this.governance.recordAudit({
      organizationId: orgId,
      unitId: dto.assignedDiscussionUnitId || null,
      actorTenantId,
      action: 'CREATE_LKPJ_EVALUATION_WORKSPACE',
      targetEntity: 'lkpj_evaluation_workspaces',
      targetEntityId: created.id,
      details: {
        fiscalYear: dto.fiscalYear,
        title: created.title,
        lkpjSubmittedAt: submittedAt.toISOString(),
        discussionDeadlineAt: deadlineAt.toISOString(),
      },
    });

    return this.mapWorkspaceDto(created, org.name, unitName, unitType);
  }

  async listWorkspaces(orgId: string): Promise<LkpjEvaluationWorkspaceDto[]> {
    const rows = await db.execute(sql`
      SELECT
        w.*,
        o.name AS "organizationName",
        u.name AS "assignedDiscussionUnitName",
        u.unit_type AS "assignedDiscussionUnitType"
      FROM lkpj_evaluation_workspaces w
      INNER JOIN organizations o ON w.organization_id = o.id
      LEFT JOIN organization_units u ON w.assigned_discussion_unit_id = u.id
      WHERE w.organization_id = ${orgId}::uuid
      ORDER BY w.fiscal_year DESC, w.created_at DESC;
    `);

    const list = (((rows as any)?.rows || rows || []) as any[]);
    return list.map((r) => this.mapWorkspaceDto(r));
  }

  async updateWorkspaceStatus(
    orgId: string,
    workspaceId: string,
    actorTenantId: string,
    myOrgRole: OrganizationMemberRole,
    dto: UpdateLkpjWorkspaceStatusRequestDto
  ): Promise<LkpjEvaluationWorkspaceDto> {
    if (
      myOrgRole !== OrganizationMemberRole.ORG_ADMIN &&
      myOrgRole !== OrganizationMemberRole.LEADERSHIP
    ) {
      throw new ForbiddenException(
        'Hanya Admin Sekretariat DPRD atau Pimpinan DPRD yang berwenang mengubah tahapan resmi siklus pembahasan LKPJ.'
      );
    }

    const [ws] = await db
      .select()
      .from(lkpjEvaluationWorkspaces)
      .where(
        and(
          eq(lkpjEvaluationWorkspaces.id, workspaceId),
          eq(lkpjEvaluationWorkspaces.organizationId, orgId)
        )
      )
      .limit(1);

    if (!ws) {
      throw new NotFoundException('Ruang kerja evaluasi LKPJ tidak ditemukan.');
    }

    const statusLabels: Record<LkpjWorkspaceStatus, string> = {
      [LkpjWorkspaceStatus.REGISTERED]: 'Terdaftar (Diterima DPRD)',
      [LkpjWorkspaceStatus.IN_DISCUSSION]: 'Dalam Pembahasan',
      [LkpjWorkspaceStatus.PRE_PLENARY_CONSOLIDATION]: 'Konsolidasi Praparipurna',
      [LkpjWorkspaceStatus.PLENARY_ADOPTED]: 'Disahkan Paripurna',
      [LkpjWorkspaceStatus.POST_PLENARY_MONITORING]: 'Pemantauan Pascaparipurna',
    };
    const currentStatus = ws.status as LkpjWorkspaceStatus;
    const allowedNext = ALLOWED_WORKSPACE_TRANSITIONS[currentStatus] || [];
    if (!allowedNext.includes(dto.status)) {
      throw new BadRequestException(
        `Transisi tahapan siklus LKPJ tidak diizinkan dari "${statusLabels[currentStatus] || currentStatus}" langsung ke "${statusLabels[dto.status] || dto.status}". Ikuti urutan: Terdaftar → Dalam Pembahasan → Konsolidasi Praparipurna → Disahkan Paripurna → Pemantauan Pascaparipurna.`
      );
    }

    if (dto.assignedDiscussionUnitId) {
      await this.governance.assertUserUnitMembershipOrOrgAdmin(
        orgId,
        dto.assignedDiscussionUnitId,
        actorTenantId,
        myOrgRole
      );
    }

    // Jika pembahasan ditutup menuju konsolidasi / paripurna, tandai otomatis temuan yang buktinya masih INSUFFICIENT_OPEN menjadi STILL_OPEN_AT_CLOSING
    if (
      dto.status === LkpjWorkspaceStatus.PRE_PLENARY_CONSOLIDATION ||
      dto.status === LkpjWorkspaceStatus.PLENARY_ADOPTED
    ) {
      await db
        .update(lkpjFindings)
        .set({
          evidenceStatus: LkpjEvidenceStatus.STILL_OPEN_AT_CLOSING,
          updatedAt: new Date(),
        })
        .where(
          and(
            eq(lkpjFindings.workspaceId, workspaceId),
            eq(lkpjFindings.organizationId, orgId),
            eq(lkpjFindings.evidenceStatus, LkpjEvidenceStatus.INSUFFICIENT_OPEN)
          )
        );
    }

    const [updated] = await db
      .update(lkpjEvaluationWorkspaces)
      .set({
        status: dto.status,
        ...(dto.assignedDiscussionUnitId !== undefined
          ? { assignedDiscussionUnitId: dto.assignedDiscussionUnitId }
          : {}),
        ...(dto.prePlenaryAt ? { prePlenaryAt: new Date(dto.prePlenaryAt) } : {}),
        ...(dto.finalPlenaryAt ? { finalPlenaryAt: new Date(dto.finalPlenaryAt) } : {}),
        updatedAt: new Date(),
      })
      .where(eq(lkpjEvaluationWorkspaces.id, workspaceId))
      .returning();

    await this.governance.recordAudit({
      organizationId: orgId,
      actorTenantId,
      action: 'UPDATE_LKPJ_WORKSPACE_STATUS',
      targetEntity: 'lkpj_evaluation_workspaces',
      targetEntityId: workspaceId,
      details: { previousStatus: ws.status, newStatus: dto.status },
    });

    return this.mapWorkspaceDto(updated);
  }

  // ============================================================================
  // 2. DELAPAN BAHAN EVALUASI & ANTREAN VERIFIKASI BUKTI (HUMAN-IN-THE-LOOP)
  // ============================================================================

  async registerMaterial(
    orgId: string,
    workspaceId: string,
    actorTenantId: string,
    myOrgRole: OrganizationMemberRole,
    dto: RegisterLkpjMaterialRequestDto
  ): Promise<LkpjEvaluationMaterialDto> {
    if (dto.originUnitId) {
      await this.governance.assertUserUnitMembershipOrOrgAdmin(
        orgId,
        dto.originUnitId,
        actorTenantId,
        myOrgRole
      );
    }
    const [ws] = await db
      .select()
      .from(lkpjEvaluationWorkspaces)
      .where(
        and(
          eq(lkpjEvaluationWorkspaces.id, workspaceId),
          eq(lkpjEvaluationWorkspaces.organizationId, orgId)
        )
      )
      .limit(1);

    if (!ws) {
      throw new NotFoundException('Ruang kerja evaluasi LKPJ tidak ditemukan.');
    }

    let linkedFileId: string | null = null;
    if (dto.datahubRefId) {
      const [ref] = await db
        .select()
        .from(datahubDocumentRefs)
        .where(
          and(
            eq(datahubDocumentRefs.id, dto.datahubRefId),
            eq(datahubDocumentRefs.organizationId, orgId)
          )
        )
        .limit(1);

      if (!ref) {
        throw new BadRequestException(
          'Referensi dokumen DataHub tidak ditemukan pada Instansi ini.'
        );
      }
      linkedFileId = ref.fileId;
    }

    const confidence = dto.extractionConfidence ?? 0.95;
    // Angka meragukan / confidence < 0.80 otomatis dikirim ke antrean pemeriksaan penelaah!
    const initialVerificationStatus =
      confidence < 0.65
        ? LkpjExtractionVerificationStatus.FLAGGED_DOUBTFUL
        : confidence < 0.85
          ? LkpjExtractionVerificationStatus.PENDING_VERIFICATION
          : LkpjExtractionVerificationStatus.VERIFIED;

    const sanitizedSummary =
      dto.materialCategory === LkpjMaterialCategory.ASPIRASI_MASYARAKAT
        ? LkpjEvaluationAiService.maskCitizenIdentityForCirculation(dto.summaryExcerpt)
        : dto.summaryExcerpt?.trim() || null;

    const [inserted] = await db
      .insert(lkpjEvaluationMaterials)
      .values({
        workspaceId,
        organizationId: orgId,
        originUnitId: dto.originUnitId || null,
        materialCategory: dto.materialCategory,
        title: dto.title.trim(),
        documentVersion: dto.documentVersion?.trim() || 'FINAL-V1',
        sourceYear: dto.sourceYear,
        pageOrArticleRange: dto.pageOrArticleRange?.trim() || null,
        datahubRefId: dto.datahubRefId || null,
        datahubFileId: linkedFileId,
        extractionConfidence: confidence,
        verificationStatus: initialVerificationStatus,
        doubtfulQueueNotes:
          dto.doubtfulQueueNotes?.trim() ||
          (initialVerificationStatus !== LkpjExtractionVerificationStatus.VERIFIED
            ? 'Confidence ekstraksi di bawah ambang otomatis (85%). Mohon periksa rujukan halaman/tabel asli.'
            : null),
        verifiedByTenantId:
          initialVerificationStatus === LkpjExtractionVerificationStatus.VERIFIED
            ? actorTenantId
            : null,
        verifiedAt:
          initialVerificationStatus === LkpjExtractionVerificationStatus.VERIFIED
            ? new Date()
            : null,
        summaryExcerpt: sanitizedSummary,
        uploadedByTenantId: actorTenantId,
      })
      .returning();

    await this.governance.recordAudit({
      organizationId: orgId,
      unitId: dto.originUnitId || null,
      actorTenantId,
      action: 'REGISTER_LKPJ_EVALUATION_MATERIAL',
      targetEntity: 'lkpj_evaluation_materials',
      targetEntityId: inserted.id,
      details: {
        materialCategory: inserted.materialCategory,
        title: inserted.title,
        verificationStatus: inserted.verificationStatus,
      },
    });

    return {
      id: inserted.id,
      workspaceId: inserted.workspaceId,
      organizationId: inserted.organizationId,
      originUnitId: inserted.originUnitId,
      materialCategory: inserted.materialCategory as LkpjMaterialCategory,
      title: inserted.title,
      documentVersion: inserted.documentVersion,
      sourceYear: inserted.sourceYear,
      pageOrArticleRange: inserted.pageOrArticleRange,
      datahubRefId: inserted.datahubRefId,
      datahubFileId: inserted.datahubFileId,
      extractionConfidence: Number(inserted.extractionConfidence),
      verificationStatus: inserted.verificationStatus as LkpjExtractionVerificationStatus,
      doubtfulQueueNotes: inserted.doubtfulQueueNotes,
      verifiedByTenantId: inserted.verifiedByTenantId,
      verifiedAt: inserted.verifiedAt ? inserted.verifiedAt.toISOString() : null,
      summaryExcerpt: inserted.summaryExcerpt,
      uploadedByTenantId: inserted.uploadedByTenantId,
      createdAt: inserted.createdAt.toISOString(),
      updatedAt: inserted.updatedAt.toISOString(),
    };
  }

  async uploadAndAnalyzeMaterial(
    orgId: string,
    workspaceId: string,
    actorTenantId: string,
    myOrgRole: OrganizationMemberRole,
    file: Express.Multer.File,
    dto: UploadLkpjMaterialMetaRequestDto
  ): Promise<UploadLkpjMaterialResultDto> {
    const [ws] = await db
      .select()
      .from(lkpjEvaluationWorkspaces)
      .where(
        and(
          eq(lkpjEvaluationWorkspaces.id, workspaceId),
          eq(lkpjEvaluationWorkspaces.organizationId, orgId)
        )
      )
      .limit(1);

    if (!ws) {
      throw new NotFoundException('Ruang kerja evaluasi LKPJ tidak ditemukan.');
    }

    if (dto.originUnitId) {
      await this.governance.assertUserUnitMembershipOrOrgAdmin(
        orgId,
        dto.originUnitId,
        actorTenantId,
        myOrgRole
      );
    } else if (
      myOrgRole !== OrganizationMemberRole.ORG_ADMIN &&
      myOrgRole !== OrganizationMemberRole.LEADERSHIP
    ) {
      throw new ForbiddenException(
        'Pengunggahan dokumen tingkat Instansi (ORG_SHARED) pada LKPJ hanya diizinkan untuk ORG_ADMIN/LEADERSHIP. Anggota unit harap sertakan originUnitId Bidang Anda.'
      );
    }

    await this.governance.assertOrganizationStorageQuotaAvailable(
      orgId,
      file.size || file.buffer?.length || 0
    );

    const materialTitle = dto.title?.trim() || file.originalname.replace(/\.[^.]+$/, '');
    const uploadResult = await withInstitutionalContext(
      {
        tenantId: actorTenantId,
        organizationId: orgId,
        unitId: dto.originUnitId || null,
      },
      async () =>
        await this.datahubService.processUpload(
          actorTenantId,
          file,
          {
            customTitle: materialTitle,
            categoryTag:
              dto.materialCategory === LkpjMaterialCategory.ASPIRASI_MASYARAKAT
                ? DatahubCategory.ASPIRASI_KONSTITUEN
                : dto.materialCategory === LkpjMaterialCategory.RPJMD_RKPD_APBD
                  ? DatahubCategory.ANGGARAN_APBD
                  : dto.materialCategory === LkpjMaterialCategory.PERATURAN_BERLAKU
                    ? DatahubCategory.REGULASI_DAERAH
                    : DatahubCategory.DOKUMEN_INTERNAL,
            privacyScope: dto.originUnitId
              ? DatahubPrivacyScope.UNIT_BIDANG
              : DatahubPrivacyScope.ORG_SHARED,
          },
          {
            organizationId: orgId,
            organizationUnitId: dto.originUnitId || null,
          }
        )
    );

    const [storedFile] = await db
      .select({ extractedRawText: datahubFiles.extractedRawText })
      .from(datahubFiles)
      .where(eq(datahubFiles.id, uploadResult.fileId))
      .limit(1);

    const analyzed = LkpjEvaluationAiService.analyzeUploadedEvaluationMaterial({
      extractedText: storedFile?.extractedRawText || '',
      fileName: file.originalname,
      mimeType: file.mimetype || 'application/octet-stream',
      materialTitle,
    });

    // Jika berkas PDF/DOCX tidak berbentuk tabel pipe Markdown, gunakan LLM Structured Extractor sebagai pelapis
    if (
      dto.autoExtractFindings &&
      analyzed.candidateFindings.length === 0 &&
      (storedFile?.extractedRawText || '').trim().length >= 80
    ) {
      const llmExtracted = await LkpjEvaluationAiService.extractCandidateFindingsWithLlm({
        tenantId: actorTenantId,
        organizationId: orgId,
        organizationUnitId: dto.originUnitId || null,
        extractedText: storedFile?.extractedRawText || '',
        fileName: file.originalname,
        materialTitle,
        fiscalYear: ws.fiscalYear,
      });
      if (llmExtracted.candidateFindings.length > 0) {
        analyzed.candidateFindings = llmExtracted.candidateFindings;
        analyzed.extractionConfidence = Math.min(analyzed.extractionConfidence, 0.78);
        analyzed.doubtfulQueueNotes =
          analyzed.doubtfulQueueNotes ||
          'Kandidat temuan diekstrak secara otomatis via LLM dari naskah non-tabel. Wajib diperiksa ulang oleh Penelaah di Antrean Verifikasi.';
      }
    }

    const registeredMaterial = await this.registerMaterial(
      orgId,
      workspaceId,
      actorTenantId,
      myOrgRole,
      {
        materialCategory: dto.materialCategory,
        title: materialTitle,
        documentVersion: dto.documentVersion || 'AUTO-INGEST',
        sourceYear: dto.sourceYear || ws.fiscalYear,
        pageOrArticleRange: dto.pageOrArticleRange || 'Auto-Extracted',
        originUnitId: dto.originUnitId || null,
        datahubRefId: uploadResult.refId || null,
        extractionConfidence: analyzed.extractionConfidence,
        doubtfulQueueNotes: analyzed.doubtfulQueueNotes || undefined,
        summaryExcerpt: analyzed.summaryExcerpt,
      }
    );

    let extractedFindingsCount = 0;
    if (dto.autoExtractFindings && analyzed.candidateFindings.length > 0) {
      for (const candidate of analyzed.candidateFindings) {
        await this.upsertFinding(orgId, workspaceId, actorTenantId, myOrgRole, {
          originUnitId: dto.originUnitId || null,
          governmentAffair: candidate.governmentAffair,
          opdName: candidate.opdName,
          indicatorOrIssue: candidate.indicatorOrIssue,
          indicatorUnit: candidate.indicatorUnit,
          indicatorDirection: LkpjIndicatorDirection.HIGHER_IS_BETTER,
          targetValue: candidate.targetValue,
          realizationValue: candidate.realizationValue,
          budgetCeilingIdr: candidate.budgetCeilingIdr,
          budgetRealizationIdr: candidate.budgetRealizationIdr,
          sourceEvidenceRef: candidate.sourceEvidenceRef,
          sourceMaterialId: registeredMaterial.id,
          evidenceStatus:
            analyzed.extractionConfidence >= 0.85
              ? LkpjEvidenceStatus.SUFFICIENT_VERIFIED
              : LkpjEvidenceStatus.INSUFFICIENT_OPEN,
          missingEvidenceNotes: analyzed.doubtfulQueueNotes || undefined,
        });
        extractedFindingsCount += 1;
      }
    }

    return {
      material: registeredMaterial,
      datahubFileId: uploadResult.fileId,
      datahubRefId: uploadResult.refId || null,
      extractionConfidence: analyzed.extractionConfidence,
      extractedFindingsCount,
      queuedForVerification:
        registeredMaterial.verificationStatus !== LkpjExtractionVerificationStatus.VERIFIED,
    };
  }

  async verifyMaterialInQueue(
    orgId: string,
    workspaceId: string,
    materialId: string,
    actorTenantId: string,
    myOrgRole: OrganizationMemberRole,
    activeUnitRole: OrganizationUnitMemberRole | null,
    dto: VerifyLkpjMaterialRequestDto
  ): Promise<LkpjEvaluationMaterialDto> {
    const [existing] = await db
      .select()
      .from(lkpjEvaluationMaterials)
      .where(
        and(
          eq(lkpjEvaluationMaterials.id, materialId),
          eq(lkpjEvaluationMaterials.workspaceId, workspaceId),
          eq(lkpjEvaluationMaterials.organizationId, orgId)
        )
      )
      .limit(1);

    if (!existing) {
      throw new NotFoundException('Bahan evaluasi tidak ditemukan.');
    }

    const canReview = await this.hasReviewerCapabilityOnUnitOrOrg({
      orgId,
      tenantId: actorTenantId,
      orgRole: myOrgRole,
      unitId: existing.originUnitId,
      activeUnitRole,
    });
    if (!canReview) {
      throw new ForbiddenException(
        'Hanya Penelaah (REVIEWER), Ketua Bidang (UNIT_LEAD), Tenaga Ahli, Pimpinan, atau Sekretariat yang berwenang memverifikasi antrean bukti LKPJ.'
      );
    }

    const [updated] = await db
      .update(lkpjEvaluationMaterials)
      .set({
        verificationStatus: dto.verificationStatus,
        ...(dto.doubtfulQueueNotes !== undefined
          ? { doubtfulQueueNotes: dto.doubtfulQueueNotes }
          : {}),
        verifiedByTenantId: actorTenantId,
        verifiedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(lkpjEvaluationMaterials.id, materialId),
          eq(lkpjEvaluationMaterials.workspaceId, workspaceId),
          eq(lkpjEvaluationMaterials.organizationId, orgId)
        )
      )
      .returning();

    if (!updated) {
      throw new NotFoundException('Bahan evaluasi tidak ditemukan.');
    }

    await this.governance.recordAudit({
      organizationId: orgId,
      actorTenantId,
      action: 'VERIFY_LKPJ_MATERIAL_EXTRACTION',
      targetEntity: 'lkpj_evaluation_materials',
      targetEntityId: materialId,
      details: { verificationStatus: dto.verificationStatus },
    });

    return {
      id: updated.id,
      workspaceId: updated.workspaceId,
      organizationId: updated.organizationId,
      originUnitId: updated.originUnitId,
      materialCategory: updated.materialCategory as LkpjMaterialCategory,
      title: updated.title,
      documentVersion: updated.documentVersion,
      sourceYear: updated.sourceYear,
      pageOrArticleRange: updated.pageOrArticleRange,
      datahubRefId: updated.datahubRefId,
      datahubFileId: updated.datahubFileId,
      extractionConfidence: Number(updated.extractionConfidence),
      verificationStatus: updated.verificationStatus as LkpjExtractionVerificationStatus,
      doubtfulQueueNotes: updated.doubtfulQueueNotes,
      verifiedByTenantId: updated.verifiedByTenantId,
      verifiedAt: updated.verifiedAt ? updated.verifiedAt.toISOString() : null,
      summaryExcerpt: updated.summaryExcerpt,
      uploadedByTenantId: updated.uploadedByTenantId,
      createdAt: updated.createdAt.toISOString(),
      updatedAt: updated.updatedAt.toISOString(),
    };
  }

  // ============================================================================
  // 3. MATRIKS TEMUAN TERSTRUKTUR & PERHITUNGAN DETERMINISTIK
  // ============================================================================

  async upsertFinding(
    orgId: string,
    workspaceId: string,
    actorTenantId: string,
    myOrgRole: OrganizationMemberRole,
    dto: UpsertLkpjFindingRequestDto
  ): Promise<LkpjFindingDto> {
    if (dto.originUnitId) {
      await this.governance.assertUserUnitMembershipOrOrgAdmin(
        orgId,
        dto.originUnitId,
        actorTenantId,
        myOrgRole
      );
    }

    const [ws] = await db
      .select()
      .from(lkpjEvaluationWorkspaces)
      .where(
        and(
          eq(lkpjEvaluationWorkspaces.id, workspaceId),
          eq(lkpjEvaluationWorkspaces.organizationId, orgId)
        )
      )
      .limit(1);

    if (!ws) {
      throw new NotFoundException('Ruang kerja evaluasi LKPJ tidak ditemukan.');
    }

    if (dto.id) {
      const [existingRow] = await db
        .select({ reviewStatus: lkpjFindings.reviewStatus })
        .from(lkpjFindings)
        .where(
          and(
            eq(lkpjFindings.id, dto.id),
            eq(lkpjFindings.workspaceId, workspaceId),
            eq(lkpjFindings.organizationId, orgId)
          )
        )
        .limit(1);
      if (
        existingRow?.reviewStatus === LkpjFindingReviewStatus.OFFICIAL_RECOMMENDATION &&
        myOrgRole !== OrganizationMemberRole.ORG_ADMIN &&
        myOrgRole !== OrganizationMemberRole.LEADERSHIP
      ) {
        throw new ForbiddenException(
          'Rekomendasi yang telah disahkan Paripurna tidak dapat diubah oleh anggota non-pimpinan.'
        );
      }
    }

    // 1. Hitung selisih target vs realisasi & serapan anggaran secara deterministik!
    const direction = dto.indicatorDirection || LkpjIndicatorDirection.HIGHER_IS_BETTER;
    const deterministic = LkpjEvaluationAiService.calculateDeterministicMetrics({
      targetValue: dto.targetValue,
      realizationValue: dto.realizationValue,
      indicatorDirection: direction,
      budgetCeilingIdr: dto.budgetCeilingIdr,
      budgetRealizationIdr: dto.budgetRealizationIdr,
    });

    // 2. Samarkan identitas warga (PII Masking) pada ringkasan aspirasi masyarakat
    const maskedAspiration = LkpjEvaluationAiService.maskCitizenIdentityForCirculation(
      dto.citizenAspirationSummary
    );

    const valuesPayload = {
      workspaceId,
      organizationId: orgId,
      originUnitId: dto.originUnitId || null,
      fiscalYear: ws.fiscalYear,
      governmentAffair: dto.governmentAffair.trim(),
      opdName: dto.opdName.trim(),
      programOrActivity: dto.programOrActivity?.trim() || null,
      indicatorOrIssue: dto.indicatorOrIssue.trim(),
      indicatorUnit: dto.indicatorUnit?.trim() || '%',
      indicatorDirection: direction,
      compatibilityVerified: dto.compatibilityVerified ?? true,
      compatibilityNotes: dto.compatibilityNotes?.trim() || null,
      rpjmdCommitmentBaseline: dto.rpjmdCommitmentBaseline?.trim() || null,
      targetValue:
        dto.targetValue !== undefined && dto.targetValue !== null
          ? Number(dto.targetValue).toFixed(4)
          : null,
      realizationValue:
        dto.realizationValue !== undefined && dto.realizationValue !== null
          ? Number(dto.realizationValue).toFixed(4)
          : null,
      achievementGap:
        deterministic.achievementGap !== null ? deterministic.achievementGap.toFixed(4) : null,
      achievementPercentage:
        deterministic.achievementPercentage !== null
          ? deterministic.achievementPercentage.toFixed(2)
          : null,
      budgetCeilingIdr:
        dto.budgetCeilingIdr !== undefined && dto.budgetCeilingIdr !== null
          ? Math.round(Number(dto.budgetCeilingIdr))
          : null,
      budgetRealizationIdr:
        dto.budgetRealizationIdr !== undefined && dto.budgetRealizationIdr !== null
          ? Math.round(Number(dto.budgetRealizationIdr))
          : null,
      budgetAbsorptionPercentage:
        deterministic.budgetAbsorptionPercentage !== null
          ? deterministic.budgetAbsorptionPercentage.toFixed(2)
          : null,
      locationCoverage: dto.locationCoverage?.trim() || null,
      sourceEvidenceRef: dto.sourceEvidenceRef.trim(),
      sourceMaterialId: dto.sourceMaterialId || null,
      citizenAspirationSummary: maskedAspiration,
      opdClarificationQuestion: dto.opdClarificationQuestion?.trim() || null,
      opdResponse: dto.opdResponse?.trim() || null,
      evidenceStatus: dto.evidenceStatus || LkpjEvidenceStatus.INSUFFICIENT_OPEN,
      missingEvidenceNotes: dto.missingEvidenceNotes?.trim() || null,
      proposedRecommendation: dto.proposedRecommendation?.trim() || null,
      legalBasisRef: dto.legalBasisRef?.trim() || null,
      responsibleOpd: dto.responsibleOpd?.trim() || dto.opdName.trim(),
      followupDeadline: dto.followupDeadline ? new Date(dto.followupDeadline) : null,
      completionIndicator: dto.completionIndicator?.trim() || null,
      updatedAt: new Date(),
    };

    let savedId: string;
    if (dto.id) {
      const [updated] = await db
        .update(lkpjFindings)
        .set(valuesPayload)
        .where(
          and(
            eq(lkpjFindings.id, dto.id),
            eq(lkpjFindings.workspaceId, workspaceId),
            eq(lkpjFindings.organizationId, orgId)
          )
        )
        .returning({ id: lkpjFindings.id });

      if (!updated) {
        throw new NotFoundException('Baris temuan LKPJ tidak ditemukan untuk diperbarui.');
      }
      savedId = updated.id;
    } else {
      const [inserted] = await db
        .insert(lkpjFindings)
        .values({
          ...valuesPayload,
          reviewStatus: LkpjFindingReviewStatus.DRAFT,
          followupStatus: LkpjFollowupStatus.OPEN,
          createdByTenantId: actorTenantId,
        })
        .returning({ id: lkpjFindings.id });
      savedId = inserted.id;
    }

    await this.governance.recordAudit({
      organizationId: orgId,
      unitId: dto.originUnitId || null,
      actorTenantId,
      action: dto.id ? 'UPDATE_LKPJ_FINDING' : 'CREATE_LKPJ_FINDING',
      targetEntity: 'lkpj_findings',
      targetEntityId: savedId,
      details: {
        governmentAffair: dto.governmentAffair,
        opdName: dto.opdName,
        indicatorOrIssue: dto.indicatorOrIssue,
        achievementGap: deterministic.achievementGap,
        achievementPercentage: deterministic.achievementPercentage,
        budgetAbsorptionPercentage: deterministic.budgetAbsorptionPercentage,
      },
    });

    const allFindings = await this.listFindings(orgId, workspaceId);
    const found = allFindings.find((f) => f.id === savedId);
    if (!found) {
      throw new NotFoundException('Gagal memuat baris temuan setelah penyimpanan.');
    }
    return found;
  }

  async reviewFinding(
    orgId: string,
    workspaceId: string,
    findingId: string,
    actorTenantId: string,
    myOrgRole: OrganizationMemberRole,
    activeUnitRole: OrganizationUnitMemberRole | null,
    dto: ReviewLkpjFindingRequestDto
  ): Promise<LkpjFindingDto> {
    const [existing] = await db
      .select()
      .from(lkpjFindings)
      .where(
        and(
          eq(lkpjFindings.id, findingId),
          eq(lkpjFindings.workspaceId, workspaceId),
          eq(lkpjFindings.organizationId, orgId)
        )
      )
      .limit(1);

    if (!existing) {
      throw new NotFoundException('Temuan tidak ditemukan.');
    }

    // RBAC Check: Pengesahan Paripurna (OFFICIAL_RECOMMENDATION) khusus ORG_ADMIN/LEADERSHIP; telaah/persetujuan diskusi butuh peran Penelaah/Lead
    if (dto.reviewStatus === LkpjFindingReviewStatus.OFFICIAL_RECOMMENDATION) {
      if (
        myOrgRole !== OrganizationMemberRole.ORG_ADMIN &&
        myOrgRole !== OrganizationMemberRole.LEADERSHIP
      ) {
        throw new ForbiddenException(
          'Hanya Pimpinan DPRD atau Admin Sekretariat DPRD yang berwenang mengesahkan Rekomendasi Resmi Paripurna.'
        );
      }
    } else {
      const canReview = await this.hasReviewerCapabilityOnUnitOrOrg({
        orgId,
        tenantId: actorTenantId,
        orgRole: myOrgRole,
        unitId: existing.originUnitId,
        activeUnitRole,
      });
      if (!canReview) {
        throw new ForbiddenException(
          'Hanya Penelaah, Ketua Bidang, Tenaga Ahli, Pimpinan, atau Sekretariat yang berwenang melakukan telaah/verifikasi temuan LKPJ.'
        );
      }
    }

    // State Machine Validation
    const prevReview = existing.reviewStatus as LkpjFindingReviewStatus;
    const allowedReviewTransitions = ALLOWED_FINDING_REVIEW_TRANSITIONS[prevReview] || [];
    if (!allowedReviewTransitions.includes(dto.reviewStatus)) {
      throw new BadRequestException(
        `Transisi status telaah temuan tidak diizinkan dari "${prevReview}" ke "${dto.reviewStatus}".`
      );
    }

    // Validasi bahwa promosi menjadi OFFICIAL_RECOMMENDATION wajib memiliki proposedRecommendation
    const finalRec = dto.proposedRecommendation?.trim() || existing.proposedRecommendation;
    if (
      (dto.reviewStatus === LkpjFindingReviewStatus.APPROVED_FOR_DISCUSSION ||
        dto.reviewStatus === LkpjFindingReviewStatus.CONSOLIDATED_FOR_PLENARY ||
        dto.reviewStatus === LkpjFindingReviewStatus.OFFICIAL_RECOMMENDATION) &&
      (!finalRec || finalRec.length < 10)
    ) {
      throw new BadRequestException(
        'Rumusan rekomendasi (proposedRecommendation) wajib diisi sebelum temuan dapat disetujui untuk pembahasan atau ditetapkan sebagai rekomendasi resmi.'
      );
    }

    await db
      .update(lkpjFindings)
      .set({
        reviewStatus: dto.reviewStatus,
        ...(dto.evidenceStatus ? { evidenceStatus: dto.evidenceStatus } : {}),
        ...(dto.proposedRecommendation !== undefined
          ? { proposedRecommendation: dto.proposedRecommendation.trim() }
          : {}),
        ...(dto.legalBasisRef !== undefined ? { legalBasisRef: dto.legalBasisRef.trim() } : {}),
        reviewedByTenantId: actorTenantId,
        reviewedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(lkpjFindings.id, findingId));

    await this.governance.recordAudit({
      organizationId: orgId,
      actorTenantId,
      action: 'REVIEW_LKPJ_FINDING',
      targetEntity: 'lkpj_findings',
      targetEntityId: findingId,
      details: { previousStatus: existing.reviewStatus, newStatus: dto.reviewStatus },
    });

    const allFindings = await this.listFindings(orgId, workspaceId);
    const updated = allFindings.find((f) => f.id === findingId);
    if (!updated) {
      throw new NotFoundException('Gagal memuat temuan setelah telaah.');
    }
    return updated;
  }

  async updateFindingFollowup(
    orgId: string,
    workspaceId: string,
    findingId: string,
    actorTenantId: string,
    myOrgRole: OrganizationMemberRole,
    dto: UpdateLkpjFindingFollowupRequestDto
  ): Promise<LkpjFindingDto> {
    if (
      myOrgRole !== OrganizationMemberRole.ORG_ADMIN &&
      myOrgRole !== OrganizationMemberRole.LEADERSHIP &&
      myOrgRole !== OrganizationMemberRole.SECRETARIAT_STAFF &&
      myOrgRole !== OrganizationMemberRole.EXPERT_STAFF
    ) {
      throw new ForbiddenException(
        'Hanya Sekretariat, Pimpinan, atau Tenaga Ahli yang berwenang mencatat dan memverifikasi tindak lanjut pascaparipurna.'
      );
    }

    const [existing] = await db
      .select()
      .from(lkpjFindings)
      .where(
        and(
          eq(lkpjFindings.id, findingId),
          eq(lkpjFindings.workspaceId, workspaceId),
          eq(lkpjFindings.organizationId, orgId)
        )
      )
      .limit(1);

    if (!existing) {
      throw new NotFoundException('Temuan / rekomendasi tidak ditemukan.');
    }

    if (
      dto.followupStatus === LkpjFollowupStatus.COMPLETED_VERIFIED &&
      !dto.followupProofRef?.trim() &&
      !existing.followupProofRef
    ) {
      throw new BadRequestException(
        'Status tindak lanjut COMPLETED_VERIFIED mewajibkan pencatatan rujukan bukti penyelesaian (followupProofRef).'
      );
    }

    await db
      .update(lkpjFindings)
      .set({
        followupStatus: dto.followupStatus,
        ...(dto.followupResponsePemda !== undefined
          ? { followupResponsePemda: dto.followupResponsePemda.trim() }
          : {}),
        ...(dto.followupProofRef !== undefined
          ? { followupProofRef: dto.followupProofRef.trim() }
          : {}),
        updatedAt: new Date(),
      })
      .where(eq(lkpjFindings.id, findingId));

    await this.governance.recordAudit({
      organizationId: orgId,
      actorTenantId,
      action: 'UPDATE_LKPJ_FOLLOWUP_STATUS',
      targetEntity: 'lkpj_findings',
      targetEntityId: findingId,
      details: { followupStatus: dto.followupStatus },
    });

    const allFindings = await this.listFindings(orgId, workspaceId);
    const updated = allFindings.find((f) => f.id === findingId);
    if (!updated) {
      throw new NotFoundException('Gagal memuat temuan setelah pembaruan tindak lanjut.');
    }
    return updated;
  }

  async listFindings(orgId: string, workspaceId: string): Promise<LkpjFindingDto[]> {
    const rows = await db.execute(sql`
      SELECT
        f.*,
        u.name AS "originUnitName",
        u.unit_type AS "originUnitType",
        creator.full_name AS "createdByName",
        reviewer.full_name AS "reviewedByName",
        (
          SELECT COUNT(*)::integer
          FROM lkpj_faction_proposals fp
          WHERE fp.finding_id = f.id
        ) AS "factionProposalsCount"
      FROM lkpj_findings f
      LEFT JOIN organization_units u ON f.origin_unit_id = u.id
      LEFT JOIN tenant_members creator ON f.created_by_tenant_id = creator.id
      LEFT JOIN tenant_members reviewer ON f.reviewed_by_tenant_id = reviewer.id
      WHERE f.workspace_id = ${workspaceId}::uuid
        AND f.organization_id = ${orgId}::uuid
      ORDER BY f.government_affair ASC, f.opd_name ASC, f.created_at ASC;
    `);

    const list = (((rows as any)?.rows || rows || []) as any[]);
    return list.map((r) => ({
      id: r.id,
      workspaceId: r.workspace_id,
      organizationId: r.organization_id,
      originUnitId: r.origin_unit_id || null,
      originUnitName: r.originUnitName || null,
      originUnitType: (r.originUnitType as OrganizationUnitType) || null,
      fiscalYear: Number(r.fiscal_year),
      governmentAffair: r.government_affair,
      opdName: r.opd_name,
      programOrActivity: r.program_or_activity || null,
      indicatorOrIssue: r.indicator_or_issue,
      indicatorUnit: r.indicator_unit,
      indicatorDirection: r.indicator_direction as LkpjIndicatorDirection,
      compatibilityVerified: Boolean(r.compatibility_verified),
      compatibilityNotes: r.compatibility_notes || null,
      rpjmdCommitmentBaseline: r.rpjmd_commitment_baseline || null,
      targetValue: r.target_value !== null ? Number(r.target_value) : null,
      realizationValue: r.realization_value !== null ? Number(r.realization_value) : null,
      achievementGap: r.achievement_gap !== null ? Number(r.achievement_gap) : null,
      achievementPercentage:
        r.achievement_percentage !== null ? Number(r.achievement_percentage) : null,
      budgetCeilingIdr: r.budget_ceiling_idr !== null ? Number(r.budget_ceiling_idr) : null,
      budgetRealizationIdr:
        r.budget_realization_idr !== null ? Number(r.budget_realization_idr) : null,
      budgetAbsorptionPercentage:
        r.budget_absorption_percentage !== null ? Number(r.budget_absorption_percentage) : null,
      locationCoverage: r.location_coverage || null,
      sourceEvidenceRef: r.source_evidence_ref,
      sourceMaterialId: r.source_material_id || null,
      citizenAspirationSummary: r.citizen_aspiration_summary || null,
      opdClarificationQuestion: r.opd_clarification_question || null,
      opdResponse: r.opd_response || null,
      evidenceStatus: r.evidence_status as LkpjEvidenceStatus,
      missingEvidenceNotes: r.missing_evidence_notes || null,
      reviewStatus: r.review_status as LkpjFindingReviewStatus,
      proposedRecommendation: r.proposed_recommendation || null,
      legalBasisRef: r.legal_basis_ref || null,
      responsibleOpd: r.responsible_opd || null,
      followupDeadline: r.followup_deadline ? new Date(r.followup_deadline).toISOString() : null,
      completionIndicator: r.completion_indicator || null,
      followupStatus: r.followup_status as LkpjFollowupStatus,
      followupResponsePemda: r.followup_response_pemda || null,
      followupProofRef: r.followup_proof_ref || null,
      createdByTenantId: r.created_by_tenant_id,
      createdByName: r.createdByName || undefined,
      reviewedByTenantId: r.reviewed_by_tenant_id || null,
      reviewedByName: r.reviewedByName || null,
      reviewedAt: r.reviewed_at ? new Date(r.reviewed_at).toISOString() : null,
      factionProposalsCount: Number(r.factionProposalsCount || 0),
      createdAt: new Date(r.created_at).toISOString(),
      updatedAt: new Date(r.updated_at).toISOString(),
    }));
  }

  // ============================================================================
  // 4. REKOMENDASI FRAKSI & MATRIKS KONSOLIDASI (TITIK TEMU VS PERBEDAAN)
  // ============================================================================

  async submitFactionProposal(
    orgId: string,
    workspaceId: string,
    actorTenantId: string,
    myOrgRole: OrganizationMemberRole,
    dto: SubmitLkpjFactionProposalRequestDto
  ): Promise<LkpjFactionProposalDto> {
    // Pastikan factionUnitId milik orgId
    const [unit] = await db
      .select()
      .from(organizationUnits)
      .where(
        and(
          eq(organizationUnits.id, dto.factionUnitId),
          eq(organizationUnits.organizationId, orgId)
        )
      )
      .limit(1);

    if (!unit) {
      throw new NotFoundException('Unit Fraksi tidak ditemukan pada Instansi ini.');
    }

    // Pastikan pengirim adalah anggota aktif dari Fraksi tersebut (atau ORG_ADMIN Sekretariat yang menginput risalah resmi fraksi)
    if (
      myOrgRole !== OrganizationMemberRole.ORG_ADMIN &&
      myOrgRole !== OrganizationMemberRole.LEADERSHIP
    ) {
      const [unitMembership] = await db
        .select()
        .from(organizationUnitMemberships)
        .where(
          and(
            eq(organizationUnitMemberships.organizationId, orgId),
            eq(organizationUnitMemberships.unitId, dto.factionUnitId),
            eq(organizationUnitMemberships.tenantId, actorTenantId),
            eq(organizationUnitMemberships.status, InstitutionalMembershipStatus.ACTIVE)
          )
        )
        .limit(1);

      if (!unitMembership) {
        throw new ForbiddenException(
          `Isolasi Fraksi: Anda tidak terdaftar pada "${unit.name}" sehingga tidak dapat mengirimkan sikap resmi atas nama Fraksi tersebut.`
        );
      }
    }

    const [finding] = await db
      .select()
      .from(lkpjFindings)
      .where(
        and(
          eq(lkpjFindings.id, dto.findingId),
          eq(lkpjFindings.workspaceId, workspaceId),
          eq(lkpjFindings.organizationId, orgId)
        )
      )
      .limit(1);

    if (!finding) {
      throw new NotFoundException('Temuan sasaran tidak ditemukan pada Ruang Kerja LKPJ ini.');
    }

    const [existing] = await db
      .select()
      .from(lkpjFactionProposals)
      .where(
        and(
          eq(lkpjFactionProposals.findingId, dto.findingId),
          eq(lkpjFactionProposals.factionUnitId, dto.factionUnitId)
        )
      )
      .limit(1);

    let savedId: string;
    if (existing) {
      const [updated] = await db
        .update(lkpjFactionProposals)
        .set({
          priorityLevel: dto.priorityLevel || 'HIGH',
          stancePosition: dto.stancePosition,
          supervisionPriorityNotes: dto.supervisionPriorityNotes?.trim() || null,
          proposedRedaction: dto.proposedRedaction.trim(),
          submittedByTenantId: actorTenantId,
          updatedAt: new Date(),
        })
        .where(eq(lkpjFactionProposals.id, existing.id))
        .returning({ id: lkpjFactionProposals.id });
      savedId = updated.id;
    } else {
      const [inserted] = await db
        .insert(lkpjFactionProposals)
        .values({
          workspaceId,
          organizationId: orgId,
          findingId: dto.findingId,
          factionUnitId: dto.factionUnitId,
          priorityLevel: dto.priorityLevel || 'HIGH',
          stancePosition: dto.stancePosition,
          supervisionPriorityNotes: dto.supervisionPriorityNotes?.trim() || null,
          proposedRedaction: dto.proposedRedaction.trim(),
          submittedByTenantId: actorTenantId,
        })
        .returning({ id: lkpjFactionProposals.id });
      savedId = inserted.id;
    }

    await this.governance.recordAudit({
      organizationId: orgId,
      unitId: dto.factionUnitId,
      actorTenantId,
      action: 'SUBMIT_LKPJ_FACTION_PROPOSAL',
      targetEntity: 'lkpj_faction_proposals',
      targetEntityId: savedId,
      details: {
        findingId: dto.findingId,
        factionName: unit.name,
        stancePosition: dto.stancePosition,
      },
    });

    const [savedRow] = await db
      .select()
      .from(lkpjFactionProposals)
      .where(eq(lkpjFactionProposals.id, savedId))
      .limit(1);

    return {
      id: savedRow.id,
      workspaceId: savedRow.workspaceId,
      organizationId: savedRow.organizationId,
      findingId: savedRow.findingId,
      findingIndicatorOrIssue: finding.indicatorOrIssue,
      factionUnitId: savedRow.factionUnitId,
      factionUnitName: unit.name,
      factionUnitCode: unit.code,
      priorityLevel: (savedRow.priorityLevel as 'HIGH' | 'MEDIUM' | 'LOW') || 'HIGH',
      stancePosition: savedRow.stancePosition as LkpjFactionStance,
      supervisionPriorityNotes: savedRow.supervisionPriorityNotes,
      proposedRedaction: savedRow.proposedRedaction,
      submittedByTenantId: savedRow.submittedByTenantId,
      createdAt: savedRow.createdAt.toISOString(),
      updatedAt: savedRow.updatedAt.toISOString(),
    };
  }

  async getFactionConsolidationMatrix(
    orgId: string,
    workspaceId: string,
    findingsList?: LkpjFindingDto[]
  ): Promise<LkpjFactionConsolidationItemDto[]> {
    const findings = findingsList || (await this.listFindings(orgId, workspaceId));

    const proposalRows = await db.execute(sql`
      SELECT
        fp.*,
        u.name AS "factionUnitName",
        u.code AS "factionUnitCode",
        tm.full_name AS "submittedByName"
      FROM lkpj_faction_proposals fp
      INNER JOIN organization_units u ON fp.faction_unit_id = u.id
      LEFT JOIN tenant_members tm ON fp.submitted_by_tenant_id = tm.id
      WHERE fp.workspace_id = ${workspaceId}::uuid
        AND fp.organization_id = ${orgId}::uuid
      ORDER BY u.name ASC;
    `);

    const allProposals = (((proposalRows as any)?.rows || proposalRows || []) as any[]);
    const byFinding = new Map<string, LkpjFactionProposalDto[]>();

    for (const p of allProposals) {
      const list = byFinding.get(p.finding_id) || [];
      list.push({
        id: p.id,
        workspaceId: p.workspace_id,
        organizationId: p.organization_id,
        findingId: p.finding_id,
        factionUnitId: p.faction_unit_id,
        factionUnitName: p.factionUnitName,
        factionUnitCode: p.factionUnitCode,
        priorityLevel: (p.priority_level as 'HIGH' | 'MEDIUM' | 'LOW') || 'HIGH',
        stancePosition: p.stance_position as LkpjFactionStance,
        supervisionPriorityNotes: p.supervision_priority_notes || null,
        proposedRedaction: p.proposed_redaction,
        submittedByTenantId: p.submitted_by_tenant_id,
        submittedByName: p.submittedByName || undefined,
        createdAt: new Date(p.created_at).toISOString(),
        updatedAt: new Date(p.updated_at).toISOString(),
      });
      byFinding.set(p.finding_id, list);
    }

    return findings.map((f) => {
      const proposals = byFinding.get(f.id) || [];
      const concurCount = proposals.filter(
        (p) => p.stancePosition === LkpjFactionStance.CONCUR_WITH_PANJA
      ).length;
      const amendmentCount = proposals.filter(
        (p) => p.stancePosition === LkpjFactionStance.PROPOSE_AMENDMENT
      ).length;
      const dissentCount = proposals.filter(
        (p) => p.stancePosition === LkpjFactionStance.DISSENT_NEED_DECISION
      ).length;

      let consensusStatus: LkpjFactionConsolidationItemDto['consensusStatus'] =
        'UNANIMOUS_CONSENSUS';
      if (dissentCount > 0) {
        consensusStatus = 'REQUIRES_MEETING_DECISION';
      } else if (amendmentCount > 0) {
        consensusStatus = 'HAS_AMENDMENTS';
      }

      return {
        findingId: f.id,
        governmentAffair: f.governmentAffair,
        opdName: f.opdName,
        indicatorOrIssue: f.indicatorOrIssue,
        panjaBaseRecommendation: f.proposedRecommendation || null,
        consensusStatus,
        totalFactionsResponded: proposals.length,
        concurCount,
        amendmentCount,
        dissentCount,
        factionProposals: proposals,
      };
    });
  }

  // ============================================================================
  // 5. DASHBOARD RUANG KERJA LKPJ, 6 AGEN SPESIALIS, & 4 PAKET RAPAT PARIPURNA
  // ============================================================================

  async getWorkspaceDashboard(
    orgId: string,
    workspaceId: string
  ): Promise<LkpjWorkspaceDashboardDto> {
    const wsRow = await db.execute(sql`
      SELECT
        w.*,
        o.name AS "organizationName",
        u.name AS "assignedDiscussionUnitName",
        u.unit_type AS "assignedDiscussionUnitType"
      FROM lkpj_evaluation_workspaces w
      INNER JOIN organizations o ON w.organization_id = o.id
      LEFT JOIN organization_units u ON w.assigned_discussion_unit_id = u.id
      WHERE w.id = ${workspaceId}::uuid
        AND w.organization_id = ${orgId}::uuid;
    `);

    const rawWs = ((wsRow as any)?.rows?.[0] ?? (Array.isArray(wsRow) ? wsRow[0] : undefined)) as any;
    if (!rawWs) {
      throw new NotFoundException('Ruang kerja evaluasi LKPJ tidak ditemukan.');
    }

    const workspace = this.mapWorkspaceDto(rawWs);

    const materialRows = await db.execute(sql`
      SELECT
        m.*,
        u.name AS "originUnitName",
        up.full_name AS "uploadedByName",
        ver.full_name AS "verifiedByName"
      FROM lkpj_evaluation_materials m
      LEFT JOIN organization_units u ON m.origin_unit_id = u.id
      LEFT JOIN tenant_members up ON m.uploaded_by_tenant_id = up.id
      LEFT JOIN tenant_members ver ON m.verified_by_tenant_id = ver.id
      WHERE m.workspace_id = ${workspaceId}::uuid
        AND m.organization_id = ${orgId}::uuid
      ORDER BY m.material_category ASC, m.created_at DESC;
    `);

    const materials: LkpjEvaluationMaterialDto[] = (
      ((materialRows as any)?.rows || materialRows || []) as any[]
    ).map((m) => ({
      id: m.id,
      workspaceId: m.workspace_id,
      organizationId: m.organization_id,
      originUnitId: m.origin_unit_id || null,
      originUnitName: m.originUnitName || null,
      materialCategory: m.material_category as LkpjMaterialCategory,
      title: m.title,
      documentVersion: m.document_version,
      sourceYear: Number(m.source_year),
      pageOrArticleRange: m.page_or_article_range || null,
      datahubRefId: m.datahub_ref_id || null,
      datahubFileId: m.datahub_file_id || null,
      extractionConfidence: Number(m.extraction_confidence),
      verificationStatus: m.verification_status as LkpjExtractionVerificationStatus,
      doubtfulQueueNotes: m.doubtful_queue_notes || null,
      verifiedByTenantId: m.verified_by_tenant_id || null,
      verifiedByName: m.verifiedByName || null,
      verifiedAt: m.verified_at ? new Date(m.verified_at).toISOString() : null,
      summaryExcerpt: m.summary_excerpt || null,
      uploadedByTenantId: m.uploaded_by_tenant_id,
      uploadedByName: m.uploadedByName || undefined,
      createdAt: new Date(m.created_at).toISOString(),
      updatedAt: new Date(m.updated_at).toISOString(),
    }));

    const materialsByCategoryCount: Record<LkpjMaterialCategory, number> = {
      [LkpjMaterialCategory.LKPJ_PEMDA]: 0,
      [LkpjMaterialCategory.RPJMD_RKPD_APBD]: 0,
      [LkpjMaterialCategory.ASPIRASI_MASYARAKAT]: 0,
      [LkpjMaterialCategory.KELUARAN_PANJA]: 0,
      [LkpjMaterialCategory.REKOMENDASI_FRAKSI]: 0,
      [LkpjMaterialCategory.ANALISIS_TENAGA_AHLI]: 0,
      [LkpjMaterialCategory.LAPORAN_PENDUKUNG]: 0,
      [LkpjMaterialCategory.PERATURAN_BERLAKU]: 0,
    };

    for (const m of materials) {
      materialsByCategoryCount[m.materialCategory] =
        (materialsByCategoryCount[m.materialCategory] || 0) + 1;
    }

    const verificationQueueCount = materials.filter(
      (m) => m.verificationStatus !== LkpjExtractionVerificationStatus.VERIFIED
    ).length;

    const findings = await this.listFindings(orgId, workspaceId);
    const factionConsolidationMatrix = await this.getFactionConsolidationMatrix(
      orgId,
      workspaceId,
      findings
    );

    return {
      workspace,
      materialsByCategoryCount,
      verificationQueueCount,
      findingsSummary: {
        totalFindings: findings.length,
        insufficientEvidenceCount: findings.filter(
          (f) => f.evidenceStatus === LkpjEvidenceStatus.INSUFFICIENT_OPEN
        ).length,
        stillOpenAtClosingCount: findings.filter(
          (f) => f.evidenceStatus === LkpjEvidenceStatus.STILL_OPEN_AT_CLOSING
        ).length,
        sufficientVerifiedCount: findings.filter(
          (f) => f.evidenceStatus === LkpjEvidenceStatus.SUFFICIENT_VERIFIED
        ).length,
        approvedForDiscussionCount: findings.filter(
          (f) =>
            f.reviewStatus === LkpjFindingReviewStatus.APPROVED_FOR_DISCUSSION ||
            f.reviewStatus === LkpjFindingReviewStatus.CONSOLIDATED_FOR_PLENARY ||
            f.reviewStatus === LkpjFindingReviewStatus.OFFICIAL_RECOMMENDATION
        ).length,
        officialRecommendationCount: findings.filter(
          (f) => f.reviewStatus === LkpjFindingReviewStatus.OFFICIAL_RECOMMENDATION
        ).length,
        followupOpenCount: findings.filter(
          (f) => f.followupStatus !== LkpjFollowupStatus.COMPLETED_VERIFIED
        ).length,
        followupCompletedCount: findings.filter(
          (f) => f.followupStatus === LkpjFollowupStatus.COMPLETED_VERIFIED
        ).length,
      },
      materials,
      findings,
      factionConsolidationMatrix,
    };
  }

  async runSpecialistAi(
    orgId: string,
    workspaceId: string,
    actorTenantId: string,
    myOrgRole: OrganizationMemberRole,
    dto: RunLkpjSpecialistAiRequestDto
  ): Promise<LkpjSpecialistAiResponseDto> {
    if (dto.activeUnitId) {
      await this.governance.assertUserUnitMembershipOrOrgAdmin(
        orgId,
        dto.activeUnitId,
        actorTenantId,
        myOrgRole
      );
    }

    const [org] = await db
      .select()
      .from(organizations)
      .where(eq(organizations.id, orgId))
      .limit(1);

    if (!org) {
      throw new NotFoundException('Instansi tidak ditemukan.');
    }

    const dashboard = await this.getWorkspaceDashboard(orgId, workspaceId);
    const targetFinding = dto.targetFindingId
      ? dashboard.findings.find((f) => f.id === dto.targetFindingId) || null
      : null;

    await this.quotaService.consumeGenerateQuota(
      orgId,
      actorTenantId,
      InstitutionalQuotaFeatureScope.LKPJ_EVALUATION
    );
    let aiResponse: Awaited<ReturnType<typeof LkpjEvaluationAiService.executeSpecialistAgent>>;
    try {
      aiResponse = await LkpjEvaluationAiService.executeSpecialistAgent({
        tenantId: actorTenantId,
        organizationId: org.id,
        organizationName: org.name,
        legislativeLevel: org.legislativeLevel,
        regionName: org.regionName,
        activeUnitId:
          dto.activeUnitId || dashboard.workspace.assignedDiscussionUnitId || null,
        workspaceTitle: dashboard.workspace.title,
        fiscalYear: dashboard.workspace.fiscalYear,
        specialistRole: dto.specialistRole,
        customInstruction: dto.customInstruction,
        targetFinding,
        findings: dashboard.findings,
        materials: dashboard.materials,
        factionConsolidation: dashboard.factionConsolidationMatrix,
      });
    } catch (err) {
      await this.quotaService.refundGenerateQuota(
        orgId,
        actorTenantId,
        InstitutionalQuotaFeatureScope.LKPJ_EVALUATION
      );
      throw err;
    }

    await this.governance.recordAudit({
      organizationId: orgId,
      unitId: dto.activeUnitId || dashboard.workspace.assignedDiscussionUnitId || null,
      actorTenantId,
      action: 'RUN_LKPJ_SPECIALIST_AI',
      targetEntity: 'lkpj_evaluation_workspaces',
      targetEntityId: workspaceId,
      details: {
        specialistRole: dto.specialistRole,
        traceId: aiResponse.telemetry.traceId,
        totalTokens: aiResponse.telemetry.totalTokens,
      },
    });

    return aiResponse;
  }

  /**
   * Menyusun 4 Paket Resmi yang Dibawa ke Rapat DPRD dari satu Matriks Temuan yang sama:
   * 1. CLARIFICATION_MEETING (Rapat Pembahasan dan Klarifikasi)
   * 2. PRE_PLENARY_MEETING (Rapat Persiapan Paripurna)
   * 3. PLENARY_DECISION_PACKAGE (Paripurna Hasil Pembahasan)
   * 4. POST_PLENARY_REGISTER (Pascaparipurna & Register Pemantauan Tindak Lanjut)
   */
  async generateMeetingPackage(
    orgId: string,
    workspaceId: string,
    packageType: LkpjMeetingPackageType,
    actorTenantId?: string,
    activeUnitId?: string | null
  ): Promise<LkpjMeetingPackageResponseDto> {
    const dashboard = await this.getWorkspaceDashboard(orgId, workspaceId);
    const ws = dashboard.workspace;

    const openDataRequests = dashboard.findings
      .filter((f) => f.evidenceStatus !== LkpjEvidenceStatus.SUFFICIENT_VERIFIED)
      .map((f) => ({
        findingId: f.id,
        opdName: f.opdName,
        indicatorOrIssue: f.indicatorOrIssue,
        evidenceStatus: f.evidenceStatus,
        missingEvidenceNotes:
          f.missingEvidenceNotes ||
          'Bukti pendukung realisasi lapangan / rincian per lokasi belum diserahkan oleh OPD.',
        opdClarificationQuestion:
          f.opdClarificationQuestion ||
          `Mohon klarifikasi dan bukti pemenuhan data atas capaian "${f.indicatorOrIssue}" (${f.realizationValue ?? '-'} ${f.indicatorUnit} dari target ${f.targetValue ?? '-'} ${f.indicatorUnit}).`,
      }));

    let includedFindings = dashboard.findings;
    let packageTitle = '';
    let defaultExecutiveSummaryMarkdown = '';
    const needDecisionCount = dashboard.factionConsolidationMatrix.filter(
      (m) => m.consensusStatus !== 'UNANIMOUS_CONSENSUS'
    ).length;

    if (packageType === LkpjMeetingPackageType.CLARIFICATION_MEETING) {
      packageTitle = `Paket Rapat Pembahasan dan Klarifikasi OPD — ${ws.title}`;
      defaultExecutiveSummaryMarkdown = `### Paket Rapat Pembahasan & Klarifikasi Perangkat Daerah (${ws.organizationName})
- **Total Indikator & Isu Diperiksa**: ${dashboard.findings.length} temuan
- **Permintaan Pemenuhan Data & Bukti Terbuka**: ${openDataRequests.length} isu memerlukan klarifikasi perangkat daerah
- **Batas Waktu Pembahasan (PP 13/2019)**: ${new Date(ws.discussionDeadlineAt).toLocaleDateString('id-ID')} (${ws.daysRemainingForDiscussion} hari tersisa)`;
    } else if (packageType === LkpjMeetingPackageType.PRE_PLENARY_MEETING) {
      packageTitle = `Paket Rapat Persiapan Paripurna — ${ws.title}`;
      defaultExecutiveSummaryMarkdown = `### Paket Rapat Persiapan Paripurna (${ws.organizationName})
- **Temuan Prioritas Siap Dibahas**: ${dashboard.findingsSummary.approvedForDiscussionCount} dari ${dashboard.findings.length} temuan
- **Isu dengan Bukti Masih Terbuka Saat Pembahasan Ditutup**: ${dashboard.findingsSummary.stillOpenAtClosingCount} isu (dibawa sebagai rekomendasi permintaan verifikasi/pemenuhan data)
- **Konsolidasi Usulan Fraksi**: ${needDecisionCount} isu memiliki usulan perubahan redaksi atau perbedaan pandangan yang memerlukan keputusan rapat.`;
    } else if (packageType === LkpjMeetingPackageType.PLENARY_DECISION_PACKAGE) {
      packageTitle = `Paket Paripurna Penyampaian Hasil Pembahasan & Rekomendasi DPRD — ${ws.title}`;
      includedFindings = dashboard.findings.filter(
        (f) =>
          f.reviewStatus === LkpjFindingReviewStatus.APPROVED_FOR_DISCUSSION ||
          f.reviewStatus === LkpjFindingReviewStatus.CONSOLIDATED_FOR_PLENARY ||
          f.reviewStatus === LkpjFindingReviewStatus.OFFICIAL_RECOMMENDATION
      );
      defaultExecutiveSummaryMarkdown = `### Naskah Laporan Hasil Pembahasan & Rumusan Rekomendasi DPRD (${ws.organizationName} TA ${ws.fiscalYear})
Berdasarkan pembahasan terhadap LKPJ Kepala Daerah Tahun Anggaran ${ws.fiscalYear} dengan memperhatikan capaian program/kegiatan, serapan APBD, aspirasi masyarakat, serta pelaksanaan Perda dan Perkada sesuai PP Nomor 13 Tahun 2019, telah ditetapkan **${includedFindings.length} rumusan rekomendasi DPRD yang telah ditelaah**.`;
    } else {
      packageTitle = `Register Rekomendasi Resmi & Dasbor Tindak Lanjut Pascaparipurna — ${ws.title}`;
      includedFindings = dashboard.findings.filter(
        (f) =>
          f.reviewStatus === LkpjFindingReviewStatus.OFFICIAL_RECOMMENDATION ||
          Boolean(f.proposedRecommendation)
      );
      defaultExecutiveSummaryMarkdown = `### Register Rekomendasi Resmi DPRD & Pemantauan Tindak Lanjut (${ws.organizationName})
- **Total Rekomendasi Terdaftar**: ${includedFindings.length}
- **Selesai & Bukti Terverifikasi**: ${dashboard.findingsSummary.followupCompletedCount}
- **Masih Terbuka / Dibawa ke Evaluasi Berikutnya**: ${dashboard.findingsSummary.followupOpenCount}`;
    }

    const executiveSummaryMarkdown = actorTenantId
      ? await LkpjEvaluationAiService.synthesizeMeetingPackageSummary({
        tenantId: actorTenantId,
        organizationId: orgId,
        organizationName: ws.organizationName || 'DPRD',
        unitId: activeUnitId || ws.assignedDiscussionUnitId || null,
        workspaceTitle: ws.title,
        fiscalYear: ws.fiscalYear,
        packageType,
        daysRemaining: ws.daysRemainingForDiscussion,
        discussionDeadlineIso: ws.discussionDeadlineAt.slice(0, 10),
        includedFindings,
        openDataRequestsCount: openDataRequests.length,
        factionNeedDecisionCount: needDecisionCount,
        defaultExecutiveSummaryMarkdown,
      })
      : defaultExecutiveSummaryMarkdown;

    const officialRecommendationsRegister = includedFindings
      .filter((f) => Boolean(f.proposedRecommendation))
      .map((f) => ({
        findingId: f.id,
        governmentAffair: f.governmentAffair,
        responsibleOpd: f.responsibleOpd || f.opdName,
        recommendationText: f.proposedRecommendation!,
        legalBasisRef: f.legalBasisRef || 'PP Nomor 13 Tahun 2019 & Tata Tertib DPRD',
        followupDeadline: f.followupDeadline || null,
        completionIndicator:
          f.completionIndicator ||
          `Tersampaikannya laporan pemutakhiran data dan bukti perbaikan "${f.indicatorOrIssue}" oleh ${f.opdName}.`,
        followupStatus: f.followupStatus,
        followupResponsePemda: f.followupResponsePemda || null,
        followupProofRef: f.followupProofRef || null,
      }));

    return {
      packageType,
      packageTitle,
      workspaceId: ws.id,
      organizationName: ws.organizationName || 'DPRD',
      fiscalYear: ws.fiscalYear,
      generatedAt: new Date().toISOString(),
      executiveSummaryMarkdown,
      includedFindings,
      openDataRequests,
      factionMatrix: dashboard.factionConsolidationMatrix,
      officialRecommendationsRegister,
    };
  }
}
