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
  'FINANCE_ADMIN',
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
]);

export const legalStatusEnum = pgEnum('legal_status_enum', [
  'BERLAKU',
  'DICABUT',
  'DIUJI_MK',
]);

export const socialPlatformEnum = pgEnum('social_platform_enum', [
  'INSTAGRAM',
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
