import {
  pgTable,
  uuid,
  varchar,
  text,
  boolean,
  timestamp,
  jsonb,
  unique,
  index,
  foreignKey,
} from 'drizzle-orm/pg-core';
import {
  parliamentaryDocumentCategoryEnum,
  legislationStageEnum,
  clauseInspectionStatusEnum,
  legalRuleVerificationStatusEnum,
  dimEntryStatusEnum,
  performanceAchievementLevelEnum,
  performanceContributionScopeEnum,
} from './enums.js';
import { tenantMembers, systemAdmins } from './identity.js';
import { organizations, organizationUnits } from './institutional.js';
import { lkpjFindings } from './lkpj.js';
import { contentPublications } from './content.js';

/**
 * 1. LEGAL KNOWLEDGE VERSIONS: Basis Pengetahuan Hukum Terversi & Status Berlaku
 * Memuat lapisan pedoman nasional (UUD 1945, UU 12/2011 jo. UU 13/2022 jo. UU 1/2026,
 * PP 12/2018, PP 13/2019, Permendagri 80/2015 jo. 120/2018) dan regulasi daerah per Instansi.
 */
export const legalKnowledgeVersions = pgTable(
  'legal_knowledge_versions',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    organizationId: uuid('organization_id').references(() => organizations.id, {
      onDelete: 'cascade',
    }),
    ruleCode: varchar('rule_code', { length: 100 }).notNull(),
    title: varchar('title', { length: 255 }).notNull(),
    hierarchyLayer: varchar('hierarchy_layer', { length: 100 }).notNull(),
    jurisdictionRegion: varchar('jurisdiction_region', { length: 120 }).default('NASIONAL').notNull(),
    effectiveDate: timestamp('effective_date', { withTimezone: true }).notNull(),
    amendmentSummary: text('amendment_summary'),
    verificationStatus: legalRuleVerificationStatusEnum('verification_status')
      .default('UNVERIFIED_NEEDS_CHECK')
      .notNull(),
    sourceUrl: text('source_url'),
    verifiedByAdminId: uuid('verified_by_admin_id').references(() => systemAdmins.id, {
      onDelete: 'set null',
    }),
    verifiedByTenantId: uuid('verified_by_tenant_id').references(() => tenantMembers.id, {
      onDelete: 'set null',
    }),
    lastVerifiedAt: timestamp('last_verified_at', { withTimezone: true }),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => ({
    unqRuleCodeRegion: unique('unq_legal_knowledge_rule_region').on(
      t.ruleCode,
      t.jurisdictionRegion
    ),
    idxLegalKnowledgeStatus: index('idx_legal_knowledge_status').on(
      t.verificationStatus,
      t.jurisdictionRegion
    ),
  })
);

/**
 * 2. LEGISLATION DRAFTS: Ruang Kerja Legislasi (RUU/Raperda/Keputusan Kelembagaan)
 * Membedakan produk hukum, keputusan kelembagaan, dokumen pembahasan, dan bahan komunikasi.
 */
export const legislationDrafts = pgTable(
  'legislation_drafts',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    organizationId: uuid('organization_id')
      .notNull()
      .references(() => organizations.id, { onDelete: 'cascade' }),
    originUnitId: uuid('origin_unit_id').references(() => organizationUnits.id, {
      onDelete: 'set null',
    }),
    title: varchar('title', { length: 255 }).notNull(),
    documentCategory: parliamentaryDocumentCategoryEnum('document_category')
      .default('PRODUK_HUKUM')
      .notNull(),
    currentStage: legislationStageEnum('current_stage')
      .default('IDENTIFIKASI_MASALAH')
      .notNull(),
    problemStatement: text('problem_statement'),
    instrumentChoiceRationale: text('instrument_choice_rationale'),
    academicPaperSummary: text('academic_paper_summary'),
    hasCriminalSanctionProvision: boolean('has_criminal_sanction_provision')
      .default(false)
      .notNull(),
    legalBasisVerifiedAt: timestamp('legal_basis_verified_at', { withTimezone: true }),
    createdByTenantId: uuid('created_by_tenant_id')
      .notNull()
      .references(() => tenantMembers.id, { onDelete: 'cascade' }),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => ({
    unqDraftIdOrg: unique('unq_legislation_draft_id_org').on(t.id, t.organizationId),
    idxDraftOrgStage: index('idx_legislation_drafts_org_stage').on(
      t.organizationId,
      t.documentCategory,
      t.currentStage
    ),
  })
);

/**
 * 3. LEGISLATION CLAUSES: Editor Berbasis Pasal + Lembar Pemeriksaan Kualitas Rancangan
 */
export const legislationClauses = pgTable(
  'legislation_clauses',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    draftId: uuid('draft_id')
      .notNull()
      .references(() => legislationDrafts.id, { onDelete: 'cascade' }),
    organizationId: uuid('organization_id')
      .notNull()
      .references(() => organizations.id, { onDelete: 'cascade' }),
    clauseNumber: varchar('clause_number', { length: 60 }).notNull(),
    clauseTitle: varchar('clause_title', { length: 200 }),
    clauseText: text('clause_text').notNull(),
    explanationText: text('explanation_text'),
    problemAddressed: text('problem_addressed'),
    legalAuthoritySource: text('legal_authority_source'),
    regulatedSubjects: text('regulated_subjects'),
    relatedClauses: text('related_clauses'),
    impactAssessment: text('impact_assessment'),
    implementationSupervision: text('implementation_supervision'),
    interpretationRisks: text('interpretation_risks'),
    complianceCriticWarnings: jsonb('compliance_critic_warnings').$type<string[]>().default([]).notNull(),
    inspectionStatus: clauseInspectionStatusEnum('inspection_status')
      .default('PERLU_TELAAH_HUKUM')
      .notNull(),
    checkedByTenantId: uuid('checked_by_tenant_id').references(() => tenantMembers.id, {
      onDelete: 'set null',
    }),
    checkedAt: timestamp('checked_at', { withTimezone: true }),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => ({
    idxClauseDraft: index('idx_legislation_clauses_draft').on(t.draftId, t.inspectionStatus),
    fkClauseDraftOrg: foreignKey({
      columns: [t.draftId, t.organizationId],
      foreignColumns: [legislationDrafts.id, legislationDrafts.organizationId],
      name: 'fk_legislation_clause_draft_org',
    }).onDelete('cascade'),
  })
);

/**
 * 4. LEGISLATION DIM ENTRIES: Daftar Inventarisasi Masalah (DIM) & Partisipasi Masyarakat (Pasal 96 UU 13/2022)
 */
export const legislationDimEntries = pgTable(
  'legislation_dim_entries',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    draftId: uuid('draft_id')
      .notNull()
      .references(() => legislationDrafts.id, { onDelete: 'cascade' }),
    organizationId: uuid('organization_id')
      .notNull()
      .references(() => organizations.id, { onDelete: 'cascade' }),
    sourcePartyName: varchar('source_party_name', { length: 180 }).notNull(),
    isPublicConsultation: boolean('is_public_consultation').default(false).notNull(),
    targetClauseRef: varchar('target_clause_ref', { length: 100 }).notNull(),
    issueSummary: text('issue_summary').notNull(),
    proposedAmendment: text('proposed_amendment').notNull(),
    responseAndFollowup: text('response_and_followup'),
    status: dimEntryStatusEnum('status').default('OPEN').notNull(),
    createdByTenantId: uuid('created_by_tenant_id')
      .notNull()
      .references(() => tenantMembers.id, { onDelete: 'cascade' }),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => ({
    idxDimDraft: index('idx_legislation_dim_draft').on(t.draftId, t.status),
    fkDimDraftOrg: foreignKey({
      columns: [t.draftId, t.organizationId],
      foreignColumns: [legislationDrafts.id, legislationDrafts.organizationId],
      name: 'fk_legislation_dim_draft_org',
    }).onDelete('cascade'),
  })
);

/**
 * 5. PERFORMANCE EVIDENCE REGISTERS: Register Bukti Kinerja & Claim Guardrail -> Studio Publikasi
 */
export const performanceEvidenceRegisters = pgTable(
  'performance_evidence_registers',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    organizationId: uuid('organization_id')
      .notNull()
      .references(() => organizations.id, { onDelete: 'cascade' }),
    unitId: uuid('unit_id').references(() => organizationUnits.id, { onDelete: 'set null' }),
    tenantId: uuid('tenant_id')
      .notNull()
      .references(() => tenantMembers.id, { onDelete: 'cascade' }),
    lkpjFindingId: uuid('lkpj_finding_id').references(() => lkpjFindings.id, {
      onDelete: 'set null',
    }),
    legislationDraftId: uuid('legislation_draft_id').references(() => legislationDrafts.id, {
      onDelete: 'set null',
    }),
    title: varchar('title', { length: 255 }).notNull(),
    achievementLevel: performanceAchievementLevelEnum('achievement_level')
      .default('DIUSULKAN')
      .notNull(),
    contributionScope: performanceContributionScopeEnum('contribution_scope')
      .default('KONTRIBUSI_INDIVIDU')
      .notNull(),
    evidenceSourceRef: text('evidence_source_ref').notNull(),
    summaryText: text('summary_text').notNull(),
    isVerified: boolean('is_verified').default(false).notNull(),
    verifiedByTenantId: uuid('verified_by_tenant_id').references(() => tenantMembers.id, {
      onDelete: 'set null',
    }),
    verifiedAt: timestamp('verified_at', { withTimezone: true }),
    linkedPublicationId: uuid('linked_publication_id').references(() => contentPublications.id, {
      onDelete: 'set null',
    }),
    generatedPublicationDraftMarkdown: text('generated_publication_draft_markdown'),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => ({
    idxEvidenceOrgUnit: index('idx_perf_evidence_org_unit').on(
      t.organizationId,
      t.unitId,
      t.isVerified
    ),
  })
);
