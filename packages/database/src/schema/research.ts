import { pgTable, uuid, varchar, text, integer, real, timestamp, boolean, jsonb, index, check, unique, uniqueIndex } from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';
import { tenantMembers } from './identity.js';
import {
  researchJobStatusEnum,
  questionIntentEnum,
  questionStatusEnum,
  sourceTypeEnum,
  publisherTypeEnum,
  sourceLifecycleEnum,
  claimStatusEnum,
  supportTypeEnum,
} from './enums.js';

/**
 * 1. RESEARCH JOBS: Sesi / Pekerjaan Riset Otonom POLARIS
 */
export const researchJobs = pgTable('research_jobs', {
  id: uuid('id').defaultRandom().primaryKey(),
  tenantId: uuid('tenant_id').notNull().references(() => tenantMembers.id, { onDelete: 'cascade' }),
  topic: varchar('topic', { length: 255 }).notNull(),
  userPrompt: text('user_prompt').notNull(),
  targetRegion: varchar('target_region', { length: 100 }).notNull(),
  status: researchJobStatusEnum('status').default('PENDING').notNull(),
  evidenceSufficient: boolean('evidence_sufficient').default(false).notNull(),
  qcPassed: boolean('qc_passed').default(false).notNull(),
  summaryReport: text('summary_report'),
  metadata: jsonb('metadata').default(sql`'{}'::jsonb`),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
}, (t) => ({
  tenantStatusIdx: index('idx_research_jobs_tenant_status').on(t.tenantId, t.status),
}));

/**
 * 2. RESEARCH QUESTIONS: Pertanyaan Riset Berstruktur (Causal / Factual Requirements)
 */
export const researchQuestions = pgTable('research_questions', {
  id: uuid('id').defaultRandom().primaryKey(),
  researchJobId: uuid('research_job_id').notNull().references(() => researchJobs.id, { onDelete: 'cascade' }),
  question: text('question').notNull(),
  intentCategory: questionIntentEnum('intent_category').default('POLICY_EVALUATION').notNull(),
  temporalBound: varchar('temporal_bound', { length: 50 }),
  geographicScope: varchar('geographic_scope', { length: 100 }),
  minRequiredEvidence: integer('min_required_evidence').default(1).notNull(),
  status: questionStatusEnum('status').default('UNRESOLVED').notNull(),
  resolutionSummary: text('resolution_summary'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
}, (t) => ({
  jobIdx: index('idx_research_questions_job').on(t.researchJobId),
}));

/**
 * 3. SOURCES: Registri Sumber Universal & Status Siklus Hidup
 */
export const sources = pgTable('sources', {
  id: uuid('id').defaultRandom().primaryKey(),
  url: text('url').notNull().unique(),
  canonicalUrl: text('canonical_url'),
  sourceType: sourceTypeEnum('source_type').notNull(),
  publisherName: varchar('publisher_name', { length: 255 }),
  publisherType: publisherTypeEnum('publisher_type').default('MEDIA').notNull(),
  publisherCredibilityScore: real('publisher_credibility_score').default(0.5).notNull(),
  doi: varchar('doi', { length: 100 }),
  isPeerReviewed: boolean('is_peer_reviewed'),
  hasRetractionsOrCorrections: boolean('has_retractions_or_corrections').default(false).notNull(),
  lifecycleStatus: sourceLifecycleEnum('lifecycle_status').default('DISCOVERED').notNull(),
  rejectionReason: text('rejection_reason'),
  retrievedAt: timestamp('retrieved_at', { withTimezone: true }).defaultNow().notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
}, (t) => ({
  urlIdx: index('idx_sources_url').on(t.url),
  canonicalUrlIdx: uniqueIndex('idx_sources_canonical_url').on(t.canonicalUrl),
  lifecycleIdx: index('idx_sources_lifecycle').on(t.lifecycleStatus),
}));

/**
 * 4. RESEARCH JOB SOURCES: Relasi Banyak-ke-Banyak Antara Job dan Sumber
 */
export const researchJobSources = pgTable('research_job_sources', {
  id: uuid('id').defaultRandom().primaryKey(),
  researchJobId: uuid('research_job_id').notNull().references(() => researchJobs.id, { onDelete: 'cascade' }),
  sourceId: uuid('source_id').notNull().references(() => sources.id, { onDelete: 'cascade' }),
  relevanceScore: real('relevance_score').default(0.5).notNull(),
  queryUsed: text('query_used'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
}, (t) => ({
  jobSourceIdx: index('idx_research_job_sources_pair').on(t.researchJobId, t.sourceId),
  unqJobSource: unique().on(t.researchJobId, t.sourceId),
}));

/**
 * 5. SOURCE VERSIONS: Snapshot Isi Sumber & Bukti Audit Trail
 */
export const sourceVersions = pgTable('source_versions', {
  id: uuid('id').defaultRandom().primaryKey(),
  sourceId: uuid('source_id').notNull().references(() => sources.id, { onDelete: 'cascade' }),
  contentHash: varchar('content_hash', { length: 64 }).notNull(),
  title: text('title').notNull(),
  rawContent: text('raw_content'),
  extractedText: text('extracted_text').notNull(),
  httpStatus: integer('http_status').default(200).notNull(),
  fetchedAt: timestamp('fetched_at', { withTimezone: true }).defaultNow().notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
}, (t) => ({
  sourceHashIdx: index('idx_source_versions_source_hash').on(t.sourceId, t.contentHash),
  unqSourceContent: unique().on(t.sourceId, t.contentHash),
}));

/**
 * 6. SOURCE ASSESSMENTS: Riwayat Penilaian Relevansi & Kredibilitas
 */
export const sourceAssessments = pgTable('source_assessments', {
  id: uuid('id').defaultRandom().primaryKey(),
  sourceId: uuid('source_id').notNull().references(() => sources.id, { onDelete: 'cascade' }),
  substantiveScore: real('substantive_score').notNull(),
  methodologyScore: real('methodology_score'),
  recencyScore: real('recency_score').notNull(),
  overallScore: real('overall_score').notNull(),
  assessmentReason: text('assessment_reason').notNull(),
  isAccepted: boolean('is_accepted').notNull(),
  evaluatedAt: timestamp('evaluated_at', { withTimezone: true }).defaultNow().notNull(),
});

/**
 * 7. EVIDENCE SPANS: Petikan Kutipan & Bukti Faktual Granular
 */
export const evidenceSpans = pgTable('evidence_spans', {
  id: uuid('id').defaultRandom().primaryKey(),
  sourceId: uuid('source_id').notNull().references(() => sources.id, { onDelete: 'cascade' }),
  sourceVersionId: uuid('source_version_id').references(() => sourceVersions.id, { onDelete: 'set null' }),
  verbatimQuote: text('verbatim_quote').notNull(),
  contextSnippet: text('context_snippet').notNull(),
  sectionOrPage: varchar('section_or_page', { length: 100 }),
  confidenceScore: real('confidence_score').default(1.0).notNull(),
  isVerified: boolean('is_verified').default(true).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
}, (t) => ({
  sourceIdx: index('idx_evidence_spans_source').on(t.sourceId),
}));

/**
 * 8. CLAIMS: Klaim Faktual / Argumen Kebijakan yang Diselidiki
 */
export const claims = pgTable('claims', {
  id: uuid('id').defaultRandom().primaryKey(),
  researchJobId: uuid('research_job_id').notNull().references(() => researchJobs.id, { onDelete: 'cascade' }),
  researchQuestionId: uuid('research_question_id').references(() => researchQuestions.id, { onDelete: 'set null' }),
  claimStatement: text('claim_statement').notNull(),
  status: claimStatusEnum('status').default('UNSUPPORTED').notNull(),
  confidenceScore: real('confidence_score').default(0.0).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
}, (t) => ({
  jobClaimIdx: index('idx_claims_job').on(t.researchJobId),
}));

/**
 * 9. CLAIM EVIDENCE: Pemetaan Relasi Klaim dengan Bukti
 */
export const claimEvidence = pgTable('claim_evidence', {
  id: uuid('id').defaultRandom().primaryKey(),
  claimId: uuid('claim_id').notNull().references(() => claims.id, { onDelete: 'cascade' }),
  evidenceSpanId: uuid('evidence_span_id').notNull().references(() => evidenceSpans.id, { onDelete: 'cascade' }),
  supportType: supportTypeEnum('support_type').default('SUPPORTS').notNull(),
  relationshipExplanation: text('relationship_explanation'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
}, (t) => ({
  claimEvidencePairIdx: index('idx_claim_evidence_pair').on(t.claimId, t.evidenceSpanId),
}));

/**
 * 10. RESEARCH OUTPUTS: Hasil Naskah Riset & Bibliografi Lengkap
 */
export const researchOutputs = pgTable('research_outputs', {
  id: uuid('id').defaultRandom().primaryKey(),
  researchJobId: uuid('research_job_id').notNull().references(() => researchJobs.id, { onDelete: 'cascade' }),
  title: varchar('title', { length: 255 }).notNull(),
  executiveSummary: text('executive_summary').notNull(),
  markdownBody: text('markdown_body').notNull(),
  bibliographyJson: jsonb('bibliography_json').notNull(),
  qcReport: jsonb('qc_report').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});
