import {
  pgTable,
  uuid,
  varchar,
  text,
  integer,
  timestamp,
  boolean,
  bigint,
  jsonb,
} from 'drizzle-orm/pg-core';
import { tenantMembers, systemAdmins } from './identity.js';
import { contentPublications } from './content.js';
import {
  contentBriefStatusEnum,
  briefPackageTypeEnum,
  briefUrgencyLevelEnum,
  briefMessageDirectionEnum,
  briefMessageTypeEnum,
} from './enums.js';

/**
 * Tabel Tiket Request Topik (Content Brief) dari Client via WhatsApp Bot / Zero-Login Intake.
 * Menghubungkan Client (tenant_members) dengan Operator (system_admins) melalui Broker Polaris
 * tanpa mengekspos kontak pribadi secara langsung.
 */
export const contentBriefs = pgTable('content_briefs', {
  id: uuid('id').defaultRandom().primaryKey(),
  briefCode: varchar('brief_code', { length: 30 }).notNull().unique(),
  tenantId: uuid('tenant_id')
    .notNull()
    .references(() => tenantMembers.id, { onDelete: 'cascade' }),
  assignedOperatorId: uuid('assigned_operator_id').references(() => systemAdmins.id, {
    onDelete: 'set null',
  }),
  status: contentBriefStatusEnum('status').default('SUBMITTED').notNull(),
  packageType: briefPackageTypeEnum('package_type').default('FULL_CAMPAIGN').notNull(),
  clientUrgency: briefUrgencyLevelEnum('client_urgency').default('NORMAL').notNull(),
  operatorPriority: briefUrgencyLevelEnum('operator_priority').default('NORMAL').notNull(),
  targetWindow: varchar('target_window', { length: 30 }).default('TODAY_REGULAR').notNull(),
  topicSummary: text('topic_summary').notNull(),
  weeklyQuotaPeriod: varchar('weekly_quota_period', { length: 15 }).notNull(),
  weeklyRequestLimit: integer('weekly_request_limit').default(3).notNull(),
  quotaCostDeducted: integer('quota_cost_deducted').default(1).notNull(),
  isUrgentOverquota: boolean('is_urgent_overquota').default(false).notNull(),
  revisionUsed: integer('revision_used').default(0).notNull(),
  revisionLimit: integer('revision_limit').default(3).notNull(),
  articleStatus: varchar('article_status', { length: 20 }).default('PENDING').notNull(),
  imageStatus: varchar('image_status', { length: 20 }).default('PENDING').notNull(),
  captionStatus: varchar('caption_status', { length: 20 }).default('PENDING').notNull(),
  linkedPublicationId: uuid('linked_publication_id').references(() => contentPublications.id, {
    onDelete: 'set null',
  }),
  reviewTokenHash: varchar('review_token_hash', { length: 128 }).unique(),
  reviewTokenExpiresAt: timestamp('review_token_expires_at', { withTimezone: true }),
  acceptedAt: timestamp('accepted_at', { withTimezone: true }),
  submittedForReviewAt: timestamp('submitted_for_review_at', { withTimezone: true }),
  approvedAt: timestamp('approved_at', { withTimezone: true }),
  publishedAt: timestamp('published_at', { withTimezone: true }),
  operatorNotes: text('operator_notes'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

/**
 * Tabel Riwayat Pesan, Lampiran Media (Foto/Dokumen), Klarifikasi Broker, dan Putaran Revisi
 * yang terikat ke suatu Content Brief.
 */
export const contentBriefMessages = pgTable('content_brief_messages', {
  id: uuid('id').defaultRandom().primaryKey(),
  briefId: uuid('brief_id')
    .notNull()
    .references(() => contentBriefs.id, { onDelete: 'cascade' }),
  tenantId: uuid('tenant_id')
    .notNull()
    .references(() => tenantMembers.id, { onDelete: 'cascade' }),
  senderOperatorId: uuid('sender_operator_id').references(() => systemAdmins.id, {
    onDelete: 'set null',
  }),
  direction: briefMessageDirectionEnum('direction').notNull(),
  messageType: briefMessageTypeEnum('message_type').notNull(),
  waMessageId: varchar('wa_message_id', { length: 128 }).unique(),
  textBody: text('text_body'),
  mediaR2Url: text('media_r2_url'),
  mediaCdnUrl: text('media_cdn_url'),
  mediaMimeType: varchar('media_mime_type', { length: 100 }),
  mediaFileName: varchar('media_file_name', { length: 255 }),
  mediaFileSizeBytes: bigint('media_file_size_bytes', { mode: 'number' }),
  revisionRound: integer('revision_round').default(0).notNull(),
  targetComponents: text('target_components').array().default([]).notNull(),
  isInternalFault: boolean('is_internal_fault').default(false).notNull(),
  metadata: jsonb('metadata'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

export type ContentBriefRecord = typeof contentBriefs.$inferSelect;
export type NewContentBriefRecord = typeof contentBriefs.$inferInsert;
export type ContentBriefMessageRecord = typeof contentBriefMessages.$inferSelect;
export type NewContentBriefMessageRecord = typeof contentBriefMessages.$inferInsert;

