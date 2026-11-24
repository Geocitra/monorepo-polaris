import { pgEnum } from 'drizzle-orm/pg-core';

export const legislativeLevelEnum = pgEnum('legislative_level_enum', [
  'DPR_RI',
  'DPD_RI',
  'MPR_RI',
  'DPRD_PROVINSI',
  'DPRD_KABUPATEN_KOTA',
  'KEPALA_DAERAH_GUBERNUR',
  'KEPALA_DAERAH_WALIKOTA_BUPATI',
  'PEJABAT_BIROKRAT_DIRJEN_SEKJEN_OPD',
  'PIMPINAN_LEMBAGA_REKTOR_SWASTA',
]);

export const superadminRoleEnum = pgEnum('superadmin_role_enum', [
  'SUPERADMIN',
  'SUPPORT_OPERATOR',
  'CONTENT_OPERATOR',
  'FINANCE_ADMIN',
]);

export const operatorAssignmentStatusEnum = pgEnum('operator_assignment_status_enum', [
  'ACTIVE',
  'PAUSED',
  'REVOKED',
]);

export const contentCreationContextEnum = pgEnum('content_creation_context_enum', [
  'MEMBER',
  'OPERATOR',
  'SYSTEM_AI',
]);


export const subscriptionStatusEnum = pgEnum('subscription_status_enum', [
  'INACTIVE',
  'PENDING_PAYMENT',
  'ACTIVE',
  'GRACE_PERIOD',
  'SUSPENDED',
  'ARCHIVED',
]);

export const planTierEnum = pgEnum('plan_tier_enum', [
  'STARTER',
  'PRO',
  'VIP',
]);

export const paymentStatusEnum = pgEnum('payment_status_enum', [
  'PENDING',
  'SETTLEMENT',
  'EXPIRED',
  'FAILED',
]);

export const contentStatusEnum = pgEnum('content_status_enum', [
  'GENERATING',
  'DRAFT',
  'UNDER_REVIEW',
  'PUBLISHED',
  'UNPUBLISHED',
  'ARCHIVED',
]);

export const assetTypeEnum = pgEnum('asset_type_enum', [
  'DALLE_POSTER',
  'INFOGRAPHIC_PNG',
  'HEADER_IMAGE',
]);

export const docTypeEnum = pgEnum('doc_type_enum', [
  'PERDA',
  'PERBUP',
  'APBD',
  'RPJMD',
  'BPS_STATISTIC',
  'NOTULA_SIDANG',
  'REPORT_TRIWULAN',
  'DRAFT_RUU',
  'BULETIN',
  'KAJIAN_AKADEMIS',
  'OTHER',
]);

export const legalStatusEnum = pgEnum('legal_status_enum', [
  'BERLAKU',
  'DICABUT',
  'DIUJI_MK',
]);

export const socialPlatformEnum = pgEnum('social_platform_enum', [
  'INSTAGRAM',
  'THREADS',
  'X_TWITTER',
  'TIKTOK',
  'YOUTUBE',
  'WHATSAPP',
]);

export const feedbackStatusEnum = pgEnum('feedback_status_enum', [
  'RECEIVED',
  'VERIFIED',
  'RESPONDED',
  'ARCHIVED',
]);

export const issueCategoryEnum = pgEnum('issue_category_enum', [
  'INFRASTRUKTUR',
  'PERTANIAN',
  'PENDIDIKAN',
  'KESEHATAN',
  'BANSOS_UMKM',
  'LAINNYA',
]);

export const commentStatusEnum = pgEnum('comment_status_enum', [
  'PUBLISHED',
  'PENDING_REVIEW',
  'HIDDEN',
  'FLAGGED_SPAM',
]);

export const inquiryStatusEnum = pgEnum('inquiry_status_enum', [
  'NEW_LEAD',
  'MEETING_SCHEDULED',
  'PROPOSAL_SENT',
  'DEAL_CONVERTED',
  'REJECTED_DROPPED',
]);

export const researchJobStatusEnum = pgEnum('research_job_status_enum', [
  'PENDING',
  'PLANNING',
  'SEARCHING',
  'EVALUATING',
  'EXTRACTING',
  'WRITING',
  'COMPLETED',
  'FAILED',
]);

export const questionIntentEnum = pgEnum('question_intent_enum', [
  'REGULATORY',
  'STATISTICAL_BENCHMARK',
  'PUBLIC_OPINION',
  'POLICY_EVALUATION',
  'FACTUAL_VERIFICATION',
]);

export const questionStatusEnum = pgEnum('question_status_enum', [
  'UNRESOLVED',
  'PARTIAL',
  'RESOLVED',
]);

export const sourceTypeEnum = pgEnum('source_type_enum', [
  'INTERNAL_REGULATION',
  'INTERNAL_NEWS',
  'EXTERNAL_WEB',
  'ACADEMIC_PAPER',
  'USER_ATTACHMENT',
]);

export const publisherTypeEnum = pgEnum('publisher_type_enum', [
  'GOVERNMENT',
  'MEDIA',
  'ACADEMIC',
  'INDUSTRY',
  'USER',
]);

export const sourceLifecycleEnum = pgEnum('source_lifecycle_enum', [
  'DISCOVERED',
  'FETCHED',
  'ASSESSED',
  'VERIFIED',
  'REJECTED',
  'STALE',
]);

export const claimStatusEnum = pgEnum('claim_status_enum', [
  'UNSUPPORTED',
  'PARTIALLY_SUPPORTED',
  'VERIFIED',
  'CONTRADICTED',
]);

export const supportTypeEnum = pgEnum('support_type_enum', [
  'SUPPORTS',
  'REFUTES',
  'NEUTRAL_CONTEXT',
]);

export const contentBriefStatusEnum = pgEnum('content_brief_status_enum', [
  'DRAFT',
  'SUBMITTED',
  'ACCEPTED',
  'QUEUED_NEXT_WEEK',
  'IN_PROGRESS',
  'NEED_CLARIFICATION',
  'READY_FOR_REVIEW',
  'REVISION_REQUESTED',
  'APPROVED',
  'PUBLISHED',
  'REJECTED',
  'CANCELLED',
  'CLOSED_UNPUBLISHED',
]);

export const briefPackageTypeEnum = pgEnum('brief_package_type_enum', [
  'FULL_CAMPAIGN',
  'ARTICLE_ONLY',
  'POSTER_ONLY',
  'INFOGRAPHIC_ONLY',
]);

export const briefUrgencyLevelEnum = pgEnum('brief_urgency_level_enum', [
  'NORMAL',
  'URGENT',
]);

export const briefMessageDirectionEnum = pgEnum('brief_message_direction_enum', [
  'INBOUND',
  'OUTBOUND',
]);

export const briefMessageTypeEnum = pgEnum('brief_message_type_enum', [
  'TEXT',
  'IMAGE',
  'DOCUMENT',
  'INTERACTIVE',
  'SYSTEM',
]);

export const quotaTransactionTypeEnum = pgEnum('quota_transaction_type_enum', [
  'PACKAGE_PURCHASE',
  'REGULAR_CONSUME',
  'URGENT_SURGE_CONSUME',
  'REFUND_CANCELLED',
  'REFUND_REJECTED',
  'EXPIRED_FLUSH',
  'ADMIN_ADJUSTMENT',
]);

export const liveChatSessionStatusEnum = pgEnum('live_chat_session_status_enum', [
  'WAITING_OPERATOR',
  'ACTIVE',
  'AWAITING_FEEDBACK',
  'CLOSED',
  'TIMEOUT_CLOSED',
]);

export const liveChatCsatRatingEnum = pgEnum('live_chat_csat_rating_enum', [
  'SATISFIED',
  'DISSATISFIED',
]);

export const organizationStatusEnum = pgEnum('organization_status_enum', [
  'ACTIVE',
  'SUSPENDED',
  'ARCHIVED',
]);

export const organizationContractStatusEnum = pgEnum('organization_contract_status_enum', [
  'DRAFT',
  'ACTIVE',
  'GRACE_PERIOD',
  'EXPIRED',
  'SUSPENDED',
]);

export const organizationUnitTypeEnum = pgEnum('organization_unit_type_enum', [
  'BANGGAR',
  'FRAKSI',
  'KOMISI',
  'BAPEMPERDA',
  'BAMUS',
  'BK',
  'PANJA',
  'PANSUS',
  'SEKRETARIAT',
  'BIDANG',
]);

export const organizationMemberRoleEnum = pgEnum('organization_member_role_enum', [
  'ORG_ADMIN',
  'LEADERSHIP',
  'MEMBER',
  'EXPERT_STAFF',
  'SECRETARIAT_STAFF',
]);

export const organizationUnitMemberRoleEnum = pgEnum('organization_unit_member_role_enum', [
  'UNIT_LEAD',
  'REVIEWER',
  'MEMBER',
  'EXPERT_STAFF',
]);

export const institutionalMembershipStatusEnum = pgEnum('institutional_membership_status_enum', [
  'ACTIVE',
  'INACTIVE',
  'REVOKED',
]);

export const institutionalNoteVisibilityEnum = pgEnum('institutional_note_visibility_enum', [
  'PRIVATE_DRAFT',
  'UNIT_SHARED',
  'PARENT_UNIT_ENDORSED',
  'ORG_SHARED',
]);

export const lkpjWorkspaceStatusEnum = pgEnum('lkpj_workspace_status_enum', [
  'REGISTERED',
  'IN_DISCUSSION',
  'PRE_PLENARY_CONSOLIDATION',
  'PLENARY_ADOPTED',
  'POST_PLENARY_MONITORING',
]);

export const lkpjMaterialCategoryEnum = pgEnum('lkpj_material_category_enum', [
  'LKPJ_PEMDA',
  'RPJMD_RKPD_APBD',
  'ASPIRASI_MASYARAKAT',
  'KELUARAN_PANJA',
  'REKOMENDASI_FRAKSI',
  'ANALISIS_TENAGA_AHLI',
  'LAPORAN_PENDUKUNG',
  'PERATURAN_BERLAKU',
]);

export const lkpjExtractionVerificationStatusEnum = pgEnum(
  'lkpj_extraction_verification_status_enum',
  ['PENDING_VERIFICATION', 'VERIFIED', 'FLAGGED_DOUBTFUL']
);

export const lkpjIndicatorDirectionEnum = pgEnum('lkpj_indicator_direction_enum', [
  'HIGHER_IS_BETTER',
  'LOWER_IS_BETTER',
  'TARGET_BAND',
]);

export const lkpjEvidenceStatusEnum = pgEnum('lkpj_evidence_status_enum', [
  'INSUFFICIENT_OPEN',
  'STILL_OPEN_AT_CLOSING',
  'SUFFICIENT_VERIFIED',
]);

export const lkpjFindingReviewStatusEnum = pgEnum('lkpj_finding_review_status_enum', [
  'DRAFT',
  'NEEDS_REVISION',
  'APPROVED_FOR_DISCUSSION',
  'CONSOLIDATED_FOR_PLENARY',
  'OFFICIAL_RECOMMENDATION',
]);

export const lkpjFollowupStatusEnum = pgEnum('lkpj_followup_status_enum', [
  'OPEN',
  'IN_PROGRESS',
  'COMPLETED_VERIFIED',
  'CARRIED_TO_NEXT_EVALUATION',
]);

export const lkpjFactionStanceEnum = pgEnum('lkpj_faction_stance_enum', [
  'CONCUR_WITH_PANJA',
  'PROPOSE_AMENDMENT',
  'DISSENT_NEED_DECISION',
]);

export const parliamentaryDocumentCategoryEnum = pgEnum('parliamentary_document_category_enum', [
  'PRODUK_HUKUM',
  'KEPUTUSAN_KELEMBAGAAN',
  'DOKUMEN_PEMBAHASAN',
  'BAHAN_KOMUNIKASI',
]);

export const legislationStageEnum = pgEnum('legislation_stage_enum', [
  'IDENTIFIKASI_MASALAH',
  'PENENTUAN_INSTRUMEN',
  'PERENCANAAN',
  'KAJIAN_DAN_NASKAH_AKADEMIK',
  'PERUMUSAN_RANCANGAN',
  'PARTISIPASI_MASYARAKAT',
  'PEMERIKSAAN_DAN_PEMBAHASAN',
  'PENYELESAIAN_FORMAL',
  'PEMANTAUAN_PELAKSANAAN',
]);

export const clauseInspectionStatusEnum = pgEnum('clause_inspection_status_enum', [
  'PERLU_DATA',
  'PERLU_TELAAH_HUKUM',
  'PERLU_KEPUTUSAN_KEBIJAKAN',
  'SIAP_PEMERIKSAAN_AKHIR',
]);

export const legalRuleVerificationStatusEnum = pgEnum('legal_rule_verification_status_enum', [
  'VERIFIED_ACTIVE',
  'AMENDED',
  'REVOKED',
  'UNVERIFIED_NEEDS_CHECK',
]);

export const dimEntryStatusEnum = pgEnum('dim_entry_status_enum', [
  'OPEN',
  'DISCUSSED',
  'AGREED',
  'DEFERRED',
  'REJECTED',
]);

export const performanceAchievementLevelEnum = pgEnum('performance_achievement_level_enum', [
  'DIUSULKAN',
  'DIBAHAS',
  'DIREKOMENDASIKAN',
  'DISEPAKATI',
  'DILAKSANAKAN',
  'MENUNJUKKAN_HASIL',
]);

export const performanceContributionScopeEnum = pgEnum('performance_contribution_scope_enum', [
  'KONTRIBUSI_INDIVIDU',
  'SIKAP_FRAKSI_UNIT',
  'KEPUTUSAN_KOLEKTIF_LEMBAGA',
  'PELAKSANAAN_PEMERINTAH',
]);


