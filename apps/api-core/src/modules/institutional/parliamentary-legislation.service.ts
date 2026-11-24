import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import * as crypto from 'node:crypto';
import {
  db,
  withInstitutionalContext,
  organizations,
  organizationUnits,
  organizationUnitMemberships,
  tenantMembers,
  institutionalSharedNotes,
  lkpjFindings,
  contentPublications,
  socialSyndicationPacks,
  legalKnowledgeVersions,
  legislationDrafts,
  legislationClauses,
  legislationDimEntries,
  performanceEvidenceRegisters,
  eq,
  and,
  or,
  desc,
  asc,
  sql,
} from '@polaris/database';
import {
  OrganizationMemberRole,
  OrganizationUnitMemberRole,
  InstitutionalMembershipStatus,
  ParliamentaryDocumentCategory,
  LegislationStage,
  ClauseInspectionStatus,
  LegalRuleVerificationStatus,
  DimEntryStatus,
  PerformanceAchievementLevel,
  PerformanceContributionScope,
  ContentStatus,
  ContentCreationContext,
  type LegalKnowledgeVersionDto,
  type LegislationDraftDto,
  type LegislationClauseDto,
  type LegislationDimEntryDto,
  type PerformanceEvidenceRegisterDto,
  type ClauseComplianceCriticResponseDto,
  type DailyMemberBriefingResponseDto,
  type PerformancePublicationDraftResponseDto,
} from '@polaris/shared-types';
import { ParliamentarySpecialistAiService } from '@polaris/ai-engine';
import { InstitutionalGovernanceService } from './institutional-governance.service.js';
import type {
  UpsertLegalKnowledgeVersionRequestDto,
  CreateLegislationDraftRequestDto,
  UpdateLegislationStageRequestDto,
  UpsertLegislationClauseRequestDto,
  AddLegislationDimEntryRequestDto,
  UpdateLegislationDimEntryRequestDto,
  GenerateDailyBriefingRequestDto,
  RegisterPerformanceEvidenceRequestDto,
} from './dto/parliamentary-request.dto.js';

const STAGE_SEQUENCE: LegislationStage[] = [
  LegislationStage.IDENTIFIKASI_MASALAH,
  LegislationStage.PENENTUAN_INSTRUMEN,
  LegislationStage.PERENCANAAN,
  LegislationStage.KAJIAN_DAN_NASKAH_AKADEMIK,
  LegislationStage.PERUMUSAN_RANCANGAN,
  LegislationStage.PARTISIPASI_MASYARAKAT,
  LegislationStage.PEMERIKSAAN_DAN_PEMBAHASAN,
  LegislationStage.PENYELESAIAN_FORMAL,
  LegislationStage.PEMANTAUAN_PELAKSANAAN,
];

@Injectable()
export class ParliamentaryLegislationService {
  constructor(private readonly governance: InstitutionalGovernanceService) {}

  private async hasReviewerCapability(params: {
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
      const [mem] = await db
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
        mem &&
        (mem.unitRole === OrganizationUnitMemberRole.UNIT_LEAD ||
          mem.unitRole === OrganizationUnitMemberRole.REVIEWER ||
          mem.unitRole === OrganizationUnitMemberRole.EXPERT_STAFF)
      ) {
        return true;
      }
    }

    return false;
  }

  // ============================================================================
  // 1. BASIS PENGETAHUAN HUKUM TERVERSI & STATUS ATURAN PADA TANGGAL PENGERJAAN
  // ============================================================================

  async listApplicableLegalRules(orgId: string): Promise<LegalKnowledgeVersionDto[]> {
    const [org] = await db
      .select()
      .from(organizations)
      .where(eq(organizations.id, orgId))
      .limit(1);

    if (!org) {
      throw new NotFoundException('Instansi tidak ditemukan.');
    }

    const rows = await db
      .select()
      .from(legalKnowledgeVersions)
      .where(
        or(
          eq(legalKnowledgeVersions.organizationId, orgId),
          eq(legalKnowledgeVersions.jurisdictionRegion, 'NASIONAL'),
          eq(legalKnowledgeVersions.jurisdictionRegion, org.regionName)
        )
      )
      .orderBy(asc(legalKnowledgeVersions.hierarchyLayer), desc(legalKnowledgeVersions.effectiveDate));

    return rows.map((r) => ({
      id: r.id,
      organizationId: r.organizationId,
      ruleCode: r.ruleCode,
      title: r.title,
      hierarchyLayer: r.hierarchyLayer,
      jurisdictionRegion: r.jurisdictionRegion,
      effectiveDate: r.effectiveDate.toISOString(),
      amendmentSummary: r.amendmentSummary,
      verificationStatus: r.verificationStatus as LegalRuleVerificationStatus,
      sourceUrl: r.sourceUrl,
      lastVerifiedAt: r.lastVerifiedAt ? r.lastVerifiedAt.toISOString() : null,
      isFinalLegalBasisAllowed: r.verificationStatus === LegalRuleVerificationStatus.VERIFIED_ACTIVE,
      createdAt: r.createdAt.toISOString(),
      updatedAt: r.updatedAt.toISOString(),
    }));
  }

  async upsertOrgLegalRule(
    orgId: string,
    actorTenantId: string,
    myOrgRole: OrganizationMemberRole,
    dto: UpsertLegalKnowledgeVersionRequestDto
  ): Promise<LegalKnowledgeVersionDto> {
    if (
      myOrgRole !== OrganizationMemberRole.ORG_ADMIN &&
      myOrgRole !== OrganizationMemberRole.LEADERSHIP &&
      myOrgRole !== OrganizationMemberRole.EXPERT_STAFF &&
      myOrgRole !== OrganizationMemberRole.SECRETARIAT_STAFF
    ) {
      throw new ForbiddenException(
        'Hanya Sekretariat (ORG_ADMIN), Pimpinan, atau Tenaga Ahli Hukum yang berwenang mendaftarkan/memperbarui Basis Pengetahuan Hukum Daerah.'
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

    const cleanCode = dto.ruleCode.trim().toUpperCase();
    const region = dto.jurisdictionRegion?.trim() || org.regionName;
    const effectiveDate = new Date(dto.effectiveDate);

    if (isNaN(effectiveDate.getTime())) {
      throw new BadRequestException('Tanggal efektif peraturan tidak valid.');
    }

    const [existing] = await db
      .select()
      .from(legalKnowledgeVersions)
      .where(
        and(
          eq(legalKnowledgeVersions.ruleCode, cleanCode),
          eq(legalKnowledgeVersions.jurisdictionRegion, region)
        )
      )
      .limit(1);

    let saved: typeof legalKnowledgeVersions.$inferSelect;
    if (existing) {
      const [updated] = await db
        .update(legalKnowledgeVersions)
        .set({
          title: dto.title.trim(),
          hierarchyLayer: dto.hierarchyLayer.trim().toUpperCase(),
          effectiveDate,
          amendmentSummary: dto.amendmentSummary?.trim() || null,
          verificationStatus: dto.verificationStatus,
          sourceUrl: dto.sourceUrl?.trim() || null,
          verifiedByTenantId:
            dto.verificationStatus === LegalRuleVerificationStatus.VERIFIED_ACTIVE
              ? actorTenantId
              : existing.verifiedByTenantId,
          lastVerifiedAt:
            dto.verificationStatus === LegalRuleVerificationStatus.VERIFIED_ACTIVE
              ? new Date()
              : existing.lastVerifiedAt,
          updatedAt: new Date(),
        })
        .where(eq(legalKnowledgeVersions.id, existing.id))
        .returning();
      saved = updated;
    } else {
      const [inserted] = await db
        .insert(legalKnowledgeVersions)
        .values({
          organizationId: orgId,
          ruleCode: cleanCode,
          title: dto.title.trim(),
          hierarchyLayer: dto.hierarchyLayer.trim().toUpperCase(),
          jurisdictionRegion: region,
          effectiveDate,
          amendmentSummary: dto.amendmentSummary?.trim() || null,
          verificationStatus: dto.verificationStatus,
          sourceUrl: dto.sourceUrl?.trim() || null,
          verifiedByTenantId:
            dto.verificationStatus === LegalRuleVerificationStatus.VERIFIED_ACTIVE
              ? actorTenantId
              : null,
          lastVerifiedAt:
            dto.verificationStatus === LegalRuleVerificationStatus.VERIFIED_ACTIVE
              ? new Date()
              : null,
        })
        .returning();
      saved = inserted;
    }

    await this.governance.recordAudit({
      organizationId: orgId,
      actorTenantId,
      action: 'UPSERT_LEGAL_KNOWLEDGE_VERSION',
      targetEntity: 'legal_knowledge_versions',
      targetEntityId: saved.id,
      details: {
        ruleCode: saved.ruleCode,
        verificationStatus: saved.verificationStatus,
      },
    });

    return {
      id: saved.id,
      organizationId: saved.organizationId,
      ruleCode: saved.ruleCode,
      title: saved.title,
      hierarchyLayer: saved.hierarchyLayer,
      jurisdictionRegion: saved.jurisdictionRegion,
      effectiveDate: saved.effectiveDate.toISOString(),
      amendmentSummary: saved.amendmentSummary,
      verificationStatus: saved.verificationStatus as LegalRuleVerificationStatus,
      sourceUrl: saved.sourceUrl,
      lastVerifiedAt: saved.lastVerifiedAt ? saved.lastVerifiedAt.toISOString() : null,
      isFinalLegalBasisAllowed:
        saved.verificationStatus === LegalRuleVerificationStatus.VERIFIED_ACTIVE,
      createdAt: saved.createdAt.toISOString(),
      updatedAt: saved.updatedAt.toISOString(),
    };
  }

  // ============================================================================
  // 2. RUANG KERJA LEGISLASI (9 TAHAP, EDITOR PASAL, CRITIC & DIM)
  // ============================================================================

  async createLegislationDraft(
    orgId: string,
    actorTenantId: string,
    myOrgRole: OrganizationMemberRole,
    dto: CreateLegislationDraftRequestDto
  ): Promise<LegislationDraftDto> {
    if (dto.originUnitId) {
      await this.governance.assertUserUnitMembershipOrOrgAdmin(
        orgId,
        dto.originUnitId,
        actorTenantId,
        myOrgRole
      );
    }

    const [created] = await db
      .insert(legislationDrafts)
      .values({
        organizationId: orgId,
        originUnitId: dto.originUnitId || null,
        title: dto.title.trim(),
        documentCategory: dto.documentCategory,
        currentStage: dto.currentStage || LegislationStage.IDENTIFIKASI_MASALAH,
        problemStatement: dto.problemStatement?.trim() || null,
        instrumentChoiceRationale: dto.instrumentChoiceRationale?.trim() || null,
        academicPaperSummary: dto.academicPaperSummary?.trim() || null,
        hasCriminalSanctionProvision: dto.hasCriminalSanctionProvision ?? false,
        legalBasisVerifiedAt: new Date(),
        createdByTenantId: actorTenantId,
      })
      .returning();

    await this.governance.recordAudit({
      organizationId: orgId,
      unitId: dto.originUnitId || null,
      actorTenantId,
      action: 'CREATE_LEGISLATION_DRAFT',
      targetEntity: 'legislation_drafts',
      targetEntityId: created.id,
      details: {
        title: created.title,
        documentCategory: created.documentCategory,
        currentStage: created.currentStage,
      },
    });

    return this.getLegislationDraftDetail(orgId, created.id);
  }

  async listLegislationDrafts(orgId: string): Promise<LegislationDraftDto[]> {
    const rows = await db.execute(sql`
      SELECT
        d.*,
        u.name AS "originUnitName",
        tm.full_name AS "createdByName",
        (SELECT COUNT(*)::integer FROM legislation_clauses c WHERE c.draft_id = d.id) AS "clausesCount",
        (SELECT COUNT(*)::integer FROM legislation_dim_entries e WHERE e.draft_id = d.id) AS "dimEntriesCount"
      FROM legislation_drafts d
      LEFT JOIN organization_units u ON d.origin_unit_id = u.id
      LEFT JOIN tenant_members tm ON d.created_by_tenant_id = tm.id
      WHERE d.organization_id = ${orgId}::uuid
      ORDER BY d.updated_at DESC;
    `);

    const list = (((rows as any)?.rows || rows || []) as any[]);
    return list.map((r) => ({
      id: r.id,
      organizationId: r.organization_id,
      originUnitId: r.origin_unit_id || null,
      originUnitName: r.originUnitName || null,
      title: r.title,
      documentCategory: r.document_category as ParliamentaryDocumentCategory,
      currentStage: r.current_stage as LegislationStage,
      problemStatement: r.problem_statement || null,
      instrumentChoiceRationale: r.instrument_choice_rationale || null,
      academicPaperSummary: r.academic_paper_summary || null,
      hasCriminalSanctionProvision: Boolean(r.has_criminal_sanction_provision),
      legalBasisVerifiedAt: r.legal_basis_verified_at
        ? new Date(r.legal_basis_verified_at).toISOString()
        : null,
      clausesCount: Number(r.clausesCount || 0),
      dimEntriesCount: Number(r.dimEntriesCount || 0),
      createdByTenantId: r.created_by_tenant_id,
      createdByName: r.createdByName || undefined,
      createdAt: new Date(r.created_at).toISOString(),
      updatedAt: new Date(r.updated_at).toISOString(),
    }));
  }

  async getLegislationDraftDetail(orgId: string, draftId: string): Promise<LegislationDraftDto> {
    const drafts = await this.listLegislationDrafts(orgId);
    const draft = drafts.find((d) => d.id === draftId);
    if (!draft) {
      throw new NotFoundException('Rancangan produk parlemen tidak ditemukan.');
    }

    const clauseRows = await db.execute(sql`
      SELECT
        c.*,
        chk.full_name AS "checkedByName"
      FROM legislation_clauses c
      LEFT JOIN tenant_members chk ON c.checked_by_tenant_id = chk.id
      WHERE c.draft_id = ${draftId}::uuid
        AND c.organization_id = ${orgId}::uuid
      ORDER BY c.created_at ASC;
    `);

    const clauses: LegislationClauseDto[] = (
      ((clauseRows as any)?.rows || clauseRows || []) as any[]
    ).map((c) => ({
      id: c.id,
      draftId: c.draft_id,
      organizationId: c.organization_id,
      clauseNumber: c.clause_number,
      clauseTitle: c.clause_title || null,
      clauseText: c.clause_text,
      explanationText: c.explanation_text || null,
      problemAddressed: c.problem_addressed || null,
      legalAuthoritySource: c.legal_authority_source || null,
      regulatedSubjects: c.regulated_subjects || null,
      relatedClauses: c.related_clauses || null,
      impactAssessment: c.impact_assessment || null,
      implementationSupervision: c.implementation_supervision || null,
      interpretationRisks: c.interpretation_risks || null,
      complianceCriticWarnings: Array.isArray(c.compliance_critic_warnings)
        ? c.compliance_critic_warnings
        : [],
      inspectionStatus: c.inspection_status as ClauseInspectionStatus,
      checkedByTenantId: c.checked_by_tenant_id || null,
      checkedByName: c.checkedByName || null,
      checkedAt: c.checked_at ? new Date(c.checked_at).toISOString() : null,
      createdAt: new Date(c.created_at).toISOString(),
      updatedAt: new Date(c.updated_at).toISOString(),
    }));

    const dimRows = await db.execute(sql`
      SELECT
        e.*,
        tm.full_name AS "createdByName"
      FROM legislation_dim_entries e
      LEFT JOIN tenant_members tm ON e.created_by_tenant_id = tm.id
      WHERE e.draft_id = ${draftId}::uuid
        AND e.organization_id = ${orgId}::uuid
      ORDER BY e.created_at DESC;
    `);

    const dimEntries: LegislationDimEntryDto[] = (
      ((dimRows as any)?.rows || dimRows || []) as any[]
    ).map((e) => ({
      id: e.id,
      draftId: e.draft_id,
      organizationId: e.organization_id,
      sourcePartyName: e.source_party_name,
      isPublicConsultation: Boolean(e.is_public_consultation),
      targetClauseRef: e.target_clause_ref,
      issueSummary: e.issue_summary,
      proposedAmendment: e.proposed_amendment,
      responseAndFollowup: e.response_and_followup || null,
      status: e.status as DimEntryStatus,
      createdByTenantId: e.created_by_tenant_id,
      createdByName: e.createdByName || undefined,
      createdAt: new Date(e.created_at).toISOString(),
      updatedAt: new Date(e.updated_at).toISOString(),
    }));

    return {
      ...draft,
      clauses,
      dimEntries,
    };
  }

  async updateLegislationStage(
    orgId: string,
    draftId: string,
    actorTenantId: string,
    myOrgRole: OrganizationMemberRole,
    activeUnitRole: OrganizationUnitMemberRole | null,
    dto: UpdateLegislationStageRequestDto
  ): Promise<LegislationDraftDto> {
    const [existing] = await db
      .select()
      .from(legislationDrafts)
      .where(
        and(eq(legislationDrafts.id, draftId), eq(legislationDrafts.organizationId, orgId))
      )
      .limit(1);

    if (!existing) {
      throw new NotFoundException('Rancangan produk parlemen tidak ditemukan.');
    }

    if (existing.originUnitId) {
      await this.governance.assertUserUnitMembershipOrOrgAdmin(
        orgId,
        existing.originUnitId,
        actorTenantId,
        myOrgRole
      );
    }

    const currentIdx = STAGE_SEQUENCE.indexOf(existing.currentStage as LegislationStage);
    const nextIdx = STAGE_SEQUENCE.indexOf(dto.currentStage);
    if (nextIdx > currentIdx + 1) {
      throw new BadRequestException(
        `Tahap legislasi tidak dapat melompat langsung dari "${existing.currentStage}" ke "${dto.currentStage}". Ikuti tahapan berurutan sesuai tata cara pembentukan peraturan.`
      );
    }

    if (
      dto.currentStage === LegislationStage.PENYELESAIAN_FORMAL ||
      dto.currentStage === LegislationStage.PEMANTAUAN_PELAKSANAAN
    ) {
      const canFinalize = await this.hasReviewerCapability({
        orgId,
        tenantId: actorTenantId,
        orgRole: myOrgRole,
        unitId: existing.originUnitId,
        activeUnitRole,
      });
      if (!canFinalize) {
        throw new ForbiddenException(
          'Hanya Pimpinan, Sekretariat, Penelaah, atau Ketua Unit yang berwenang memajukan rancangan ke tahap Penyelesaian Formal atau Pemantauan Pelaksanaan.'
        );
      }
    }

    // Jika masuk PENYELESAIAN_FORMAL, pastikan tidak ada pasal yang masih berstatus PERLU_TELAAH_HUKUM jika memiliki ketentuan pidana
    if (dto.currentStage === LegislationStage.PENYELESAIAN_FORMAL) {
      const clauses = await db
        .select()
        .from(legislationClauses)
        .where(
          and(
            eq(legislationClauses.draftId, draftId),
            eq(legislationClauses.organizationId, orgId)
          )
        );
      const blockingClause = clauses.find(
        (c) => c.inspectionStatus !== ClauseInspectionStatus.SIAP_PEMERIKSAAN_AKHIR
      );
      if (blockingClause) {
        throw new BadRequestException(
          `Pasal "${blockingClause.clauseNumber}" masih berstatus ${blockingClause.inspectionStatus}. Selesaikan telaah lembar pemeriksaan sebelum tahap Penyelesaian Formal.`
        );
      }
    }

    await db
      .update(legislationDrafts)
      .set({
        currentStage: dto.currentStage,
        ...(dto.instrumentChoiceRationale !== undefined
          ? { instrumentChoiceRationale: dto.instrumentChoiceRationale.trim() }
          : {}),
        ...(dto.academicPaperSummary !== undefined
          ? { academicPaperSummary: dto.academicPaperSummary.trim() }
          : {}),
        updatedAt: new Date(),
      })
      .where(eq(legislationDrafts.id, draftId));

    await this.governance.recordAudit({
      organizationId: orgId,
      actorTenantId,
      action: 'UPDATE_LEGISLATION_STAGE',
      targetEntity: 'legislation_drafts',
      targetEntityId: draftId,
      details: { previousStage: existing.currentStage, newStage: dto.currentStage },
    });

    return this.getLegislationDraftDetail(orgId, draftId);
  }

  async upsertLegislationClause(
    orgId: string,
    draftId: string,
    actorTenantId: string,
    myOrgRole: OrganizationMemberRole,
    dto: UpsertLegislationClauseRequestDto
  ): Promise<LegislationClauseDto> {
    const [draft] = await db
      .select()
      .from(legislationDrafts)
      .where(
        and(eq(legislationDrafts.id, draftId), eq(legislationDrafts.organizationId, orgId))
      )
      .limit(1);

    if (!draft) {
      throw new NotFoundException('Rancangan produk parlemen tidak ditemukan.');
    }

    if (draft.originUnitId) {
      await this.governance.assertUserUnitMembershipOrOrgAdmin(
        orgId,
        draft.originUnitId,
        actorTenantId,
        myOrgRole
      );
    }

    const payload = {
      draftId,
      organizationId: orgId,
      clauseNumber: dto.clauseNumber.trim(),
      clauseTitle: dto.clauseTitle?.trim() || null,
      clauseText: dto.clauseText.trim(),
      explanationText: dto.explanationText?.trim() || null,
      problemAddressed: dto.problemAddressed?.trim() || null,
      legalAuthoritySource: dto.legalAuthoritySource?.trim() || null,
      regulatedSubjects: dto.regulatedSubjects?.trim() || null,
      relatedClauses: dto.relatedClauses?.trim() || null,
      impactAssessment: dto.impactAssessment?.trim() || null,
      implementationSupervision: dto.implementationSupervision?.trim() || null,
      interpretationRisks: dto.interpretationRisks?.trim() || null,
      inspectionStatus: dto.inspectionStatus || ClauseInspectionStatus.PERLU_TELAAH_HUKUM,
      updatedAt: new Date(),
    };

    let savedId: string;
    if (dto.id) {
      const [updated] = await db
        .update(legislationClauses)
        .set(payload)
        .where(
          and(
            eq(legislationClauses.id, dto.id),
            eq(legislationClauses.draftId, draftId),
            eq(legislationClauses.organizationId, orgId)
          )
        )
        .returning({ id: legislationClauses.id });

      if (!updated) {
        throw new NotFoundException('Pasal tidak ditemukan pada rancangan ini.');
      }
      savedId = updated.id;
    } else {
      const [inserted] = await db
        .insert(legislationClauses)
        .values(payload)
        .returning({ id: legislationClauses.id });
      savedId = inserted.id;
    }

    // Deteksi otomatis apakah ada ketentuan pidana untuk menandai rancangan
    if (/\b(pidana|kurungan|penjara|denda)\b/i.test(dto.clauseText)) {
      await db
        .update(legislationDrafts)
        .set({ hasCriminalSanctionProvision: true, updatedAt: new Date() })
        .where(eq(legislationDrafts.id, draftId));
    }

    const detail = await this.getLegislationDraftDetail(orgId, draftId);
    const found = detail.clauses?.find((c) => c.id === savedId);
    if (!found) {
      throw new NotFoundException('Gagal memuat pasal setelah penyimpanan.');
    }
    return found;
  }

  /**
   * Menjalankan Maker-Checker Compliance Critic pada sebuah Pasal Rancangan.
   */
  async runClauseComplianceCritic(
    orgId: string,
    draftId: string,
    clauseId: string,
    actorTenantId: string,
    myOrgRole: OrganizationMemberRole
  ): Promise<ClauseComplianceCriticResponseDto> {
    const [org] = await db
      .select()
      .from(organizations)
      .where(eq(organizations.id, orgId))
      .limit(1);

    if (!org) {
      throw new NotFoundException('Instansi tidak ditemukan.');
    }

    const detail = await this.getLegislationDraftDetail(orgId, draftId);
    if (detail.originUnitId) {
      await this.governance.assertUserUnitMembershipOrOrgAdmin(
        orgId,
        detail.originUnitId,
        actorTenantId,
        myOrgRole
      );
    }
    const clause = detail.clauses?.find((c) => c.id === clauseId);
    if (!clause) {
      throw new NotFoundException('Pasal tidak ditemukan pada rancangan ini.');
    }

    const legalRules = await this.listApplicableLegalRules(orgId);

    const criticResult = await ParliamentarySpecialistAiService.runClauseComplianceCritic({
      tenantId: actorTenantId,
      organizationId: org.id,
      organizationName: org.name,
      legislativeLevel: org.legislativeLevel,
      regionName: org.regionName,
      activeUnitId: detail.originUnitId || null,
      draftTitle: detail.title,
      clause,
      legalRules,
    });

    await db
      .update(legislationClauses)
      .set({
        complianceCriticWarnings: criticResult.warnings,
        inspectionStatus: criticResult.recommendedInspectionStatus,
        checkedByTenantId: actorTenantId,
        checkedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(legislationClauses.id, clauseId));

    await this.governance.recordAudit({
      organizationId: orgId,
      unitId: detail.originUnitId || null,
      actorTenantId,
      action: 'RUN_CLAUSE_COMPLIANCE_CRITIC',
      targetEntity: 'legislation_clauses',
      targetEntityId: clauseId,
      details: {
        recommendedInspectionStatus: criticResult.recommendedInspectionStatus,
        warningsCount: criticResult.warnings.length,
        traceId: criticResult.telemetry.traceId,
      },
    });

    return criticResult;
  }

  async addDimEntry(
    orgId: string,
    draftId: string,
    actorTenantId: string,
    myOrgRole: OrganizationMemberRole,
    dto: AddLegislationDimEntryRequestDto
  ): Promise<LegislationDimEntryDto> {
    const [draft] = await db
      .select({ id: legislationDrafts.id, originUnitId: legislationDrafts.originUnitId })
      .from(legislationDrafts)
      .where(
        and(eq(legislationDrafts.id, draftId), eq(legislationDrafts.organizationId, orgId))
      )
      .limit(1);

    if (!draft) {
      throw new NotFoundException('Rancangan produk parlemen tidak ditemukan.');
    }

    if (draft.originUnitId) {
      await this.governance.assertUserUnitMembershipOrOrgAdmin(
        orgId,
        draft.originUnitId,
        actorTenantId,
        myOrgRole
      );
    }

    const [inserted] = await db
      .insert(legislationDimEntries)
      .values({
        draftId,
        organizationId: orgId,
        sourcePartyName: dto.sourcePartyName.trim(),
        isPublicConsultation: dto.isPublicConsultation ?? false,
        targetClauseRef: dto.targetClauseRef.trim(),
        issueSummary: dto.issueSummary.trim(),
        proposedAmendment: dto.proposedAmendment.trim(),
        responseAndFollowup: dto.responseAndFollowup?.trim() || null,
        status: dto.status || DimEntryStatus.OPEN,
        createdByTenantId: actorTenantId,
      })
      .returning();

    await this.governance.recordAudit({
      organizationId: orgId,
      actorTenantId,
      action: 'ADD_LEGISLATION_DIM_ENTRY',
      targetEntity: 'legislation_dim_entries',
      targetEntityId: inserted.id,
      details: {
        targetClauseRef: inserted.targetClauseRef,
        isPublicConsultation: inserted.isPublicConsultation,
      },
    });

    const detail = await this.getLegislationDraftDetail(orgId, draftId);
    const created = detail.dimEntries?.find((d) => d.id === inserted.id);
    if (!created) {
      throw new NotFoundException('Gagal memuat entri DIM setelah penyimpanan.');
    }
    return created;
  }

  async updateDimEntry(
    orgId: string,
    draftId: string,
    dimId: string,
    actorTenantId: string,
    myOrgRole: OrganizationMemberRole,
    activeUnitRole: OrganizationUnitMemberRole | null,
    dto: UpdateLegislationDimEntryRequestDto
  ): Promise<LegislationDimEntryDto> {
    const [draft] = await db
      .select({ id: legislationDrafts.id, originUnitId: legislationDrafts.originUnitId })
      .from(legislationDrafts)
      .where(and(eq(legislationDrafts.id, draftId), eq(legislationDrafts.organizationId, orgId)))
      .limit(1);

    if (!draft) {
      throw new NotFoundException('Rancangan produk parlemen tidak ditemukan.');
    }

    const canDecide = await this.hasReviewerCapability({
      orgId,
      tenantId: actorTenantId,
      orgRole: myOrgRole,
      unitId: draft.originUnitId,
      activeUnitRole,
    });
    if (!canDecide) {
      throw new ForbiddenException(
        'Hanya Penelaah, Ketua Unit, Tenaga Ahli, Pimpinan, atau Sekretariat yang berwenang memutuskan status entri DIM.'
      );
    }

    const [updated] = await db
      .update(legislationDimEntries)
      .set({
        status: dto.status,
        ...(dto.responseAndFollowup !== undefined
          ? { responseAndFollowup: dto.responseAndFollowup.trim() }
          : {}),
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(legislationDimEntries.id, dimId),
          eq(legislationDimEntries.draftId, draftId),
          eq(legislationDimEntries.organizationId, orgId)
        )
      )
      .returning();

    if (!updated) {
      throw new NotFoundException('Entri DIM tidak ditemukan pada rancangan ini.');
    }

    await this.governance.recordAudit({
      organizationId: orgId,
      unitId: draft.originUnitId || null,
      actorTenantId,
      action: 'UPDATE_LEGISLATION_DIM_STATUS',
      targetEntity: 'legislation_dim_entries',
      targetEntityId: dimId,
      details: { status: dto.status },
    });

    const detail = await this.getLegislationDraftDetail(orgId, draftId);
    const saved = detail.dimEntries?.find((d) => d.id === dimId);
    if (!saved) {
      throw new NotFoundException('Gagal memuat entri DIM setelah pembaruan status.');
    }
    return saved;
  }

  // ============================================================================
  // 3. BRIEFING HARIAN ANGGOTA DEWAN (PDF HAL. 7 BAGIAN 8)
  // ============================================================================

  async generateDailyBriefing(
    orgId: string,
    actorTenantId: string,
    myOrgRole: OrganizationMemberRole,
    dto: GenerateDailyBriefingRequestDto
  ): Promise<DailyMemberBriefingResponseDto> {
    await this.governance.assertUserUnitMembershipOrOrgAdmin(
      orgId,
      dto.unitId,
      actorTenantId,
      myOrgRole
    );

    const [org] = await db
      .select()
      .from(organizations)
      .where(eq(organizations.id, orgId))
      .limit(1);

    if (!org) {
      throw new NotFoundException('Instansi tidak ditemukan.');
    }

    const [unit] = await db
      .select()
      .from(organizationUnits)
      .where(
        and(eq(organizationUnits.id, dto.unitId), eq(organizationUnits.organizationId, orgId))
      )
      .limit(1);

    if (!unit) {
      throw new NotFoundException('Unit atau Bidang tidak ditemukan.');
    }

    const notes = await withInstitutionalContext(
      { tenantId: actorTenantId, organizationId: orgId, unitId: unit.id },
      async (tx) =>
        await tx
          .select()
          .from(institutionalSharedNotes)
          .where(
            and(
              eq(institutionalSharedNotes.organizationId, orgId),
              eq(institutionalSharedNotes.unitId, unit.id)
            )
          )
          .orderBy(desc(institutionalSharedNotes.updatedAt))
          .limit(5)
    );

    const openFindings = await db
      .select()
      .from(lkpjFindings)
      .where(eq(lkpjFindings.organizationId, orgId))
      .orderBy(desc(lkpjFindings.updatedAt))
      .limit(5);

    const legalRules = await this.listApplicableLegalRules(orgId);

    return await ParliamentarySpecialistAiService.generateDailyMemberBriefing({
      tenantId: actorTenantId,
      organizationId: org.id,
      organizationName: org.name,
      legislativeLevel: org.legislativeLevel,
      regionName: org.regionName,
      unitId: unit.id,
      unitName: unit.name,
      agendaTitle: dto.agendaTitle.trim(),
      focusOpds: unit.partnerOpds || [],
      recentNotesSummary: notes.map((n) => `${n.title}: ${n.contentMarkdown.slice(0, 160)}`),
      openFindingsSummary: openFindings.map(
        (f) =>
          `[${f.opdName}] ${f.indicatorOrIssue} — Target: ${f.targetValue ?? '-'}, Realisasi: ${f.realizationValue ?? '-'} (${f.evidenceStatus})`
      ),
      legalRules,
    });
  }

  // ============================================================================
  // 4. REGISTER BUKTI KINERJA & CLAIM GUARDRAIL -> STUDIO PUBLIKASI
  // ============================================================================

  async registerPerformanceEvidence(
    orgId: string,
    actorTenantId: string,
    myOrgRole: OrganizationMemberRole,
    dto: RegisterPerformanceEvidenceRequestDto
  ): Promise<PerformanceEvidenceRegisterDto> {
    if (dto.unitId) {
      await this.governance.assertUserUnitMembershipOrOrgAdmin(
        orgId,
        dto.unitId,
        actorTenantId,
        myOrgRole
      );
    }

    if (dto.lkpjFindingId) {
      const [finding] = await db
        .select({ id: lkpjFindings.id })
        .from(lkpjFindings)
        .where(and(eq(lkpjFindings.id, dto.lkpjFindingId), eq(lkpjFindings.organizationId, orgId)))
        .limit(1);
      if (!finding) {
        throw new BadRequestException('Temuan LKPJ rujukan tidak ditemukan pada Instansi ini.');
      }
    }

    if (dto.legislationDraftId) {
      const [draft] = await db
        .select({ id: legislationDrafts.id })
        .from(legislationDrafts)
        .where(
          and(
            eq(legislationDrafts.id, dto.legislationDraftId),
            eq(legislationDrafts.organizationId, orgId)
          )
        )
        .limit(1);
      if (!draft) {
        throw new BadRequestException('Rancangan legislasi rujukan tidak ditemukan pada Instansi ini.');
      }
    }

    const [inserted] = await db
      .insert(performanceEvidenceRegisters)
      .values({
        organizationId: orgId,
        unitId: dto.unitId || null,
        tenantId: actorTenantId,
        lkpjFindingId: dto.lkpjFindingId || null,
        legislationDraftId: dto.legislationDraftId || null,
        title: dto.title.trim(),
        achievementLevel: dto.achievementLevel,
        contributionScope: dto.contributionScope,
        evidenceSourceRef: dto.evidenceSourceRef.trim(),
        summaryText: dto.summaryText.trim(),
        isVerified: false,
      })
      .returning();

    await this.governance.recordAudit({
      organizationId: orgId,
      unitId: dto.unitId || null,
      actorTenantId,
      action: 'REGISTER_PERFORMANCE_EVIDENCE',
      targetEntity: 'performance_evidence_registers',
      targetEntityId: inserted.id,
      details: {
        title: inserted.title,
        achievementLevel: inserted.achievementLevel,
        contributionScope: inserted.contributionScope,
      },
    });

    const list = await this.listPerformanceEvidence(orgId);
    const created = list.find((e) => e.id === inserted.id);
    if (!created) {
      throw new NotFoundException('Gagal memuat register bukti kinerja.');
    }
    return created;
  }

  async verifyPerformanceEvidence(
    orgId: string,
    evidenceId: string,
    actorTenantId: string,
    myOrgRole: OrganizationMemberRole,
    activeUnitRole: OrganizationUnitMemberRole | null = null
  ): Promise<PerformanceEvidenceRegisterDto> {
    const [existing] = await db
      .select()
      .from(performanceEvidenceRegisters)
      .where(
        and(
          eq(performanceEvidenceRegisters.id, evidenceId),
          eq(performanceEvidenceRegisters.organizationId, orgId)
        )
      )
      .limit(1);

    if (!existing) {
      throw new NotFoundException('Catatan register bukti kinerja tidak ditemukan.');
    }

    const canVerify = await this.hasReviewerCapability({
      orgId,
      tenantId: actorTenantId,
      orgRole: myOrgRole,
      unitId: existing.unitId,
      activeUnitRole,
    });
    if (!canVerify) {
      throw new ForbiddenException(
        'Hanya Penelaah (REVIEWER), Ketua Bidang (UNIT_LEAD), Tenaga Ahli, Pimpinan, atau Sekretariat yang berwenang memverifikasi register bukti kinerja.'
      );
    }

    // Maker-Checker Rule: Pembuat klaim dilarang memverifikasi bukti kinerjanya sendiri (kecuali ORG_ADMIN/LEADERSHIP)
    if (
      existing.tenantId === actorTenantId &&
      myOrgRole !== OrganizationMemberRole.ORG_ADMIN &&
      myOrgRole !== OrganizationMemberRole.LEADERSHIP
    ) {
      throw new ForbiddenException(
        'Maker-Checker Violation: Pembuat klaim kinerja tidak diperbolehkan memverifikasi catatannya sendiri.'
      );
    }

    const [updated] = await db
      .update(performanceEvidenceRegisters)
      .set({
        isVerified: true,
        verifiedByTenantId: actorTenantId,
        verifiedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(performanceEvidenceRegisters.id, evidenceId),
          eq(performanceEvidenceRegisters.organizationId, orgId)
        )
      )
      .returning();

    if (!updated) {
      throw new NotFoundException('Catatan register bukti kinerja tidak ditemukan.');
    }

    await this.governance.recordAudit({
      organizationId: orgId,
      unitId: updated.unitId,
      actorTenantId,
      action: 'VERIFY_PERFORMANCE_EVIDENCE',
      targetEntity: 'performance_evidence_registers',
      targetEntityId: evidenceId,
      details: { title: updated.title },
    });

    const list = await this.listPerformanceEvidence(orgId);
    return list.find((e) => e.id === evidenceId)!;
  }

  async listPerformanceEvidence(orgId: string): Promise<PerformanceEvidenceRegisterDto[]> {
    const rows = await db.execute(sql`
      SELECT
        p.*,
        u.name AS "unitName",
        author.full_name AS "authorName",
        ver.full_name AS "verifiedByName"
      FROM performance_evidence_registers p
      LEFT JOIN organization_units u ON p.unit_id = u.id
      LEFT JOIN tenant_members author ON p.tenant_id = author.id
      LEFT JOIN tenant_members ver ON p.verified_by_tenant_id = ver.id
      WHERE p.organization_id = ${orgId}::uuid
      ORDER BY p.created_at DESC;
    `);

    const list = (((rows as any)?.rows || rows || []) as any[]);
    return list.map((r) => ({
      id: r.id,
      organizationId: r.organization_id,
      unitId: r.unit_id || null,
      unitName: r.unitName || null,
      tenantId: r.tenant_id,
      authorName: r.authorName || undefined,
      lkpjFindingId: r.lkpj_finding_id || null,
      legislationDraftId: r.legislation_draft_id || null,
      title: r.title,
      achievementLevel: r.achievement_level as PerformanceAchievementLevel,
      contributionScope: r.contribution_scope as PerformanceContributionScope,
      evidenceSourceRef: r.evidence_source_ref,
      summaryText: r.summary_text,
      isVerified: Boolean(r.is_verified),
      verifiedByTenantId: r.verified_by_tenant_id || null,
      verifiedByName: r.verifiedByName || null,
      verifiedAt: r.verified_at ? new Date(r.verified_at).toISOString() : null,
      linkedPublicationId: r.linked_publication_id || null,
      generatedPublicationDraftMarkdown: r.generated_publication_draft_markdown || null,
      createdAt: new Date(r.created_at).toISOString(),
      updatedAt: new Date(r.updated_at).toISOString(),
    }));
  }

  /**
   * Menghasilkan draf publikasi berbasis bukti + Claim Guardrail dan (jika diminta)
   * menyimpannya sebagai DRAFT di modul Studio Publikasi (content_publications) agar siap ditinjau/diedarkan.
   */
  async draftAndSyncPublicationFromEvidence(
    orgId: string,
    evidenceId: string,
    actorTenantId: string,
    createStudioDraft: boolean
  ): Promise<PerformancePublicationDraftResponseDto> {
    const [org] = await db
      .select()
      .from(organizations)
      .where(eq(organizations.id, orgId))
      .limit(1);

    if (!org) {
      throw new NotFoundException('Instansi tidak ditemukan.');
    }

    const list = await this.listPerformanceEvidence(orgId);
    const evidence = list.find((e) => e.id === evidenceId);
    if (!evidence) {
      throw new NotFoundException('Catatan register bukti kinerja tidak ditemukan.');
    }

    if (!evidence.isVerified) {
      throw new ForbiddenException(
        'Claim Guardrail: Bukti kinerja wajib diverifikasi terlebih dahulu sebelum dapat disusun menjadi materi publikasi.'
      );
    }

    const [author] = await db
      .select({ fullName: tenantMembers.fullName })
      .from(tenantMembers)
      .where(eq(tenantMembers.id, actorTenantId))
      .limit(1);

    const draftResult = await ParliamentarySpecialistAiService.draftVerifiedPerformancePublication({
      tenantId: actorTenantId,
      organizationId: org.id,
      organizationName: org.name,
      unitId: evidence.unitId,
      unitName: evidence.unitName,
      authorName: author?.fullName || evidence.authorName || 'Anggota Dewan',
      evidence,
    });

    let linkedPublicationId = evidence.linkedPublicationId;
    if (createStudioDraft && !linkedPublicationId) {
      const slugBase = evidence.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '')
        .slice(0, 60);
      const uniqueSlug = `${slugBase || 'kinerja'}-${crypto.randomBytes(3).toString('hex')}`;
      const wordCount = draftResult.pressReleaseMarkdown.split(/\s+/).filter(Boolean).length;

      const [pub] = await db
        .insert(contentPublications)
        .values({
          tenantId: actorTenantId,
          title: `[Bukti Kinerja] ${evidence.title}`.slice(0, 255),
          slug: uniqueSlug,
          excerpt: evidence.summaryText.slice(0, 220),
          bodyContentMarkdown: draftResult.pressReleaseMarkdown,
          wordCount,
          status: ContentStatus.DRAFT,
          canonicalUrl: `/publikasi/${uniqueSlug}`,
          createdContext: ContentCreationContext.MEMBER,
        })
        .returning({ id: contentPublications.id });

      linkedPublicationId = pub.id;

      await db
        .insert(socialSyndicationPacks)
        .values({
          publicationId: pub.id,
          instagramCaption: draftResult.socialCaptionDraft,
          threadsText: draftResult.socialCaptionDraft,
          whatsappBroadcastText: draftResult.socialCaptionDraft,
        })
        .onConflictDoNothing();
    }

    await db
      .update(performanceEvidenceRegisters)
      .set({
        generatedPublicationDraftMarkdown: draftResult.pressReleaseMarkdown,
        linkedPublicationId: linkedPublicationId || null,
        updatedAt: new Date(),
      })
      .where(eq(performanceEvidenceRegisters.id, evidenceId));

    await this.governance.recordAudit({
      organizationId: orgId,
      unitId: evidence.unitId,
      actorTenantId,
      action: 'DRAFT_VERIFIED_PERFORMANCE_PUBLICATION',
      targetEntity: 'performance_evidence_registers',
      targetEntityId: evidenceId,
      details: {
        linkedPublicationId,
        achievementLevel: evidence.achievementLevel,
        contributionScope: evidence.contributionScope,
      },
    });

    return draftResult;
  }
}
