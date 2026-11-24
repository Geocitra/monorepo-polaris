import {
  pgTable,
  uuid,
  varchar,
  text,
  integer,
  bigint,
  numeric,
  real,
  boolean,
  timestamp,
  unique,
  index,
  check,
  foreignKey,
} from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';
import {
  lkpjWorkspaceStatusEnum,
  lkpjMaterialCategoryEnum,
  lkpjExtractionVerificationStatusEnum,
  lkpjIndicatorDirectionEnum,
  lkpjEvidenceStatusEnum,
  lkpjFindingReviewStatusEnum,
  lkpjFollowupStatusEnum,
  lkpjFactionStanceEnum,
} from './enums.js';
import { tenantMembers } from './identity.js';
import { organizations, organizationUnits } from './institutional.js';
import { datahubDocumentRefs, datahubFiles } from './datahub.js';

/**
 * 1. LKPJ EVALUATION WORKSPACES: Satu Ruang Kerja Evaluasi per Pemerintah Daerah (Instansi) & Tahun Anggaran
 * Membedakan dua agenda paripurna (Penyampaian LKPJ Kepala Daerah & Penyampaian Hasil Pembahasan/Rekomendasi DPRD)
 * dengan batas waktu pembahasan maksimal 30 hari sesuai PP Nomor 13 Tahun 2019 & Tata Tertib setempat.
 */
export const lkpjEvaluationWorkspaces = pgTable(
  'lkpj_evaluation_workspaces',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    organizationId: uuid('organization_id')
      .notNull()
      .references(() => organizations.id, { onDelete: 'cascade' }),
    fiscalYear: integer('fiscal_year').notNull(),
    title: varchar('title', { length: 220 }).notNull(),
    status: lkpjWorkspaceStatusEnum('status').default('REGISTERED').notNull(),
    assignedDiscussionUnitId: uuid('assigned_discussion_unit_id').references(
      () => organizationUnits.id,
      { onDelete: 'set null' }
    ),
    lkpjSubmittedAt: timestamp('lkpj_submitted_at', { withTimezone: true }).notNull(),
    discussionDeadlineAt: timestamp('discussion_deadline_at', { withTimezone: true }).notNull(),
    prePlenaryAt: timestamp('pre_plenary_at', { withTimezone: true }),
    finalPlenaryAt: timestamp('final_plenary_at', { withTimezone: true }),
    standingOrdersNotes: text('standing_orders_notes'),
    createdByTenantId: uuid('created_by_tenant_id').references(() => tenantMembers.id, {
      onDelete: 'set null',
    }),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => ({
    unqOrgFiscalYear: unique('unq_lkpj_workspace_org_year').on(t.organizationId, t.fiscalYear),
    unqIdOrgComposite: unique('unq_lkpj_workspace_id_org').on(t.id, t.organizationId),
    idxWorkspaceOrgStatus: index('idx_lkpj_workspaces_org_status').on(
      t.organizationId,
      t.status,
      t.fiscalYear
    ),
    chkDeadlineValid: check(
      'chk_lkpj_workspace_deadline',
      sql`${t.discussionDeadlineAt} >= ${t.lkpjSubmittedAt}`
    ),
  })
);

/**
 * 2. LKPJ EVALUATION MATERIALS: Delapan Bahan Evaluasi & Antrean Pemeriksaan Bukti (Human-in-the-Loop)
 */
export const lkpjEvaluationMaterials = pgTable(
  'lkpj_evaluation_materials',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    workspaceId: uuid('workspace_id')
      .notNull()
      .references(() => lkpjEvaluationWorkspaces.id, { onDelete: 'cascade' }),
    organizationId: uuid('organization_id')
      .notNull()
      .references(() => organizations.id, { onDelete: 'cascade' }),
    originUnitId: uuid('origin_unit_id').references(() => organizationUnits.id, {
      onDelete: 'set null',
    }),
    materialCategory: lkpjMaterialCategoryEnum('material_category').notNull(),
    title: varchar('title', { length: 255 }).notNull(),
    documentVersion: varchar('document_version', { length: 80 }).default('FINAL-V1').notNull(),
    sourceYear: integer('source_year').notNull(),
    pageOrArticleRange: varchar('page_or_article_range', { length: 120 }),
    datahubRefId: uuid('datahub_ref_id').references(() => datahubDocumentRefs.id, {
      onDelete: 'set null',
    }),
    datahubFileId: uuid('datahub_file_id').references(() => datahubFiles.id, {
      onDelete: 'set null',
    }),
    extractionConfidence: real('extraction_confidence').default(0.95).notNull(),
    verificationStatus: lkpjExtractionVerificationStatusEnum('verification_status')
      .default('VERIFIED')
      .notNull(),
    doubtfulQueueNotes: text('doubtful_queue_notes'),
    verifiedByTenantId: uuid('verified_by_tenant_id').references(() => tenantMembers.id, {
      onDelete: 'set null',
    }),
    verifiedAt: timestamp('verified_at', { withTimezone: true }),
    summaryExcerpt: text('summary_excerpt'),
    uploadedByTenantId: uuid('uploaded_by_tenant_id')
      .notNull()
      .references(() => tenantMembers.id, { onDelete: 'cascade' }),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => ({
    idxMaterialWorkspaceCat: index('idx_lkpj_materials_ws_cat').on(
      t.workspaceId,
      t.materialCategory,
      t.verificationStatus
    ),
    fkWorkspaceOrg: foreignKey({
      columns: [t.workspaceId, t.organizationId],
      foreignColumns: [lkpjEvaluationWorkspaces.id, lkpjEvaluationWorkspaces.organizationId],
      name: 'fk_lkpj_material_workspace_org',
    }).onDelete('cascade'),
    chkConfidenceRange: check(
      'chk_lkpj_material_confidence',
      sql`${t.extractionConfidence} >= 0 AND ${t.extractionConfidence} <= 1`
    ),
  })
);

/**
 * 3. LKPJ FINDINGS: Matriks Temuan Terstruktur (Pusat Aplikasi Evaluasi LKPJ)
 * Menyimpan angka target, realisasi, dan serapan anggaran secara deterministik (bukan teks bebas)
 * lengkap dengan rujukan bukti sumber, klarifikasi OPD, status kecukupan bukti, dan tindak lanjut.
 */
export const lkpjFindings = pgTable(
  'lkpj_findings',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    workspaceId: uuid('workspace_id')
      .notNull()
      .references(() => lkpjEvaluationWorkspaces.id, { onDelete: 'cascade' }),
    organizationId: uuid('organization_id')
      .notNull()
      .references(() => organizations.id, { onDelete: 'cascade' }),
    originUnitId: uuid('origin_unit_id').references(() => organizationUnits.id, {
      onDelete: 'set null',
    }),
    fiscalYear: integer('fiscal_year').notNull(),
    governmentAffair: varchar('government_affair', { length: 160 }).notNull(),
    opdName: varchar('opd_name', { length: 180 }).notNull(),
    programOrActivity: varchar('program_or_activity', { length: 240 }),
    indicatorOrIssue: text('indicator_or_issue').notNull(),
    indicatorUnit: varchar('indicator_unit', { length: 60 }).default('%').notNull(),
    indicatorDirection: lkpjIndicatorDirectionEnum('indicator_direction')
      .default('HIGHER_IS_BETTER')
      .notNull(),
    compatibilityVerified: boolean('compatibility_verified').default(true).notNull(),
    compatibilityNotes: text('compatibility_notes'),
    rpjmdCommitmentBaseline: text('rpjmd_commitment_baseline'),
    targetValue: numeric('target_value', { precision: 18, scale: 4 }),
    realizationValue: numeric('realization_value', { precision: 18, scale: 4 }),
    achievementGap: numeric('achievement_gap', { precision: 18, scale: 4 }),
    achievementPercentage: numeric('achievement_percentage', { precision: 10, scale: 2 }),
    budgetCeilingIdr: bigint('budget_ceiling_idr', { mode: 'number' }),
    budgetRealizationIdr: bigint('budget_realization_idr', { mode: 'number' }),
    budgetAbsorptionPercentage: numeric('budget_absorption_percentage', {
      precision: 10,
      scale: 2,
    }),
    locationCoverage: text('location_coverage'),
    sourceEvidenceRef: text('source_evidence_ref').notNull(),
    sourceMaterialId: uuid('source_material_id').references(() => lkpjEvaluationMaterials.id, {
      onDelete: 'set null',
    }),
    citizenAspirationSummary: text('citizen_aspiration_summary'),
    opdClarificationQuestion: text('opd_clarification_question'),
    opdResponse: text('opd_response'),
    evidenceStatus: lkpjEvidenceStatusEnum('evidence_status')
      .default('INSUFFICIENT_OPEN')
      .notNull(),
    missingEvidenceNotes: text('missing_evidence_notes'),
    reviewStatus: lkpjFindingReviewStatusEnum('review_status').default('DRAFT').notNull(),
    proposedRecommendation: text('proposed_recommendation'),
    legalBasisRef: text('legal_basis_ref'),
    responsibleOpd: varchar('responsible_opd', { length: 180 }),
    followupDeadline: timestamp('followup_deadline', { withTimezone: true }),
    completionIndicator: text('completion_indicator'),
    followupStatus: lkpjFollowupStatusEnum('followup_status').default('OPEN').notNull(),
    followupResponsePemda: text('followup_response_pemda'),
    followupProofRef: text('followup_proof_ref'),
    createdByTenantId: uuid('created_by_tenant_id')
      .notNull()
      .references(() => tenantMembers.id, { onDelete: 'cascade' }),
    reviewedByTenantId: uuid('reviewed_by_tenant_id').references(() => tenantMembers.id, {
      onDelete: 'set null',
    }),
    reviewedAt: timestamp('reviewed_at', { withTimezone: true }),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => ({
    idxFindingWorkspaceOpd: index('idx_lkpj_findings_ws_opd').on(
      t.workspaceId,
      t.opdName,
      t.evidenceStatus,
      t.reviewStatus
    ),
    idxFindingWorkspaceAffair: index('idx_lkpj_findings_ws_affair').on(
      t.workspaceId,
      t.governmentAffair
    ),
    fkFindingWorkspaceOrg: foreignKey({
      columns: [t.workspaceId, t.organizationId],
      foreignColumns: [lkpjEvaluationWorkspaces.id, lkpjEvaluationWorkspaces.organizationId],
      name: 'fk_lkpj_finding_workspace_org',
    }).onDelete('cascade'),
  })
);

/**
 * 4. LKPJ FACTION PROPOSALS: Matriks Usulan Fraksi, Titik Temu, & Perbedaan Pandangan
 */
export const lkpjFactionProposals = pgTable(
  'lkpj_faction_proposals',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    workspaceId: uuid('workspace_id')
      .notNull()
      .references(() => lkpjEvaluationWorkspaces.id, { onDelete: 'cascade' }),
    organizationId: uuid('organization_id')
      .notNull()
      .references(() => organizations.id, { onDelete: 'cascade' }),
    findingId: uuid('finding_id')
      .notNull()
      .references(() => lkpjFindings.id, { onDelete: 'cascade' }),
    factionUnitId: uuid('faction_unit_id')
      .notNull()
      .references(() => organizationUnits.id, { onDelete: 'cascade' }),
    priorityLevel: varchar('priority_level', { length: 20 }).default('HIGH').notNull(),
    stancePosition: lkpjFactionStanceEnum('stance_position')
      .default('CONCUR_WITH_PANJA')
      .notNull(),
    supervisionPriorityNotes: text('supervision_priority_notes'),
    proposedRedaction: text('proposed_redaction').notNull(),
    submittedByTenantId: uuid('submitted_by_tenant_id')
      .notNull()
      .references(() => tenantMembers.id, { onDelete: 'cascade' }),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => ({
    unqFindingFaction: unique('unq_lkpj_faction_proposal_finding_unit').on(
      t.findingId,
      t.factionUnitId
    ),
    idxFactionPropWorkspace: index('idx_lkpj_faction_proposals_ws').on(
      t.workspaceId,
      t.findingId
    ),
    fkFactionPropWorkspaceOrg: foreignKey({
      columns: [t.workspaceId, t.organizationId],
      foreignColumns: [lkpjEvaluationWorkspaces.id, lkpjEvaluationWorkspaces.organizationId],
      name: 'fk_lkpj_faction_prop_workspace_org',
    }).onDelete('cascade'),
  })
);
