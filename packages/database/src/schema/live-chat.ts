import {
  pgTable,
  uuid,
  varchar,
  text,
  integer,
  timestamp,
  boolean,
} from 'drizzle-orm/pg-core';
import { tenantMembers, systemAdmins } from './identity.js';
import { contentBriefs } from './briefs.js';
import {
  liveChatSessionStatusEnum,
  liveChatCsatRatingEnum,
} from './enums.js';

/**
 * Tabel Sesi Diskusi Langsung (Live Chat) antara Klien (tenantMembers) dan Operator (systemAdmins).
 * Berfungsi sebagai sesi komunikasi real-time dua arah terisolasi tanpa mencemari draf artikel/kuota.
 */
export const liveChatSessions = pgTable('live_chat_sessions', {
  id: uuid('id').defaultRandom().primaryKey(),
  sessionCode: varchar('session_code', { length: 30 }).notNull().unique(), // Contoh: CS-2611-1001
  tenantId: uuid('tenant_id')
    .notNull()
    .references(() => tenantMembers.id, { onDelete: 'cascade' }),
  assignedOperatorId: uuid('assigned_operator_id')
    .references(() => systemAdmins.id, { onDelete: 'set null' }),
  status: liveChatSessionStatusEnum('status').default('WAITING_OPERATOR').notNull(),

  // Konteks Jam Kerja
  isOffHours: boolean('is_off_hours').default(false).notNull(),
  clientInitialTopic: text('client_initial_topic'),

  // Telemetri Waktu Respons & Durasi (Audit KPI)
  startedAt: timestamp('started_at', { withTimezone: true }).defaultNow().notNull(),
  acceptedAt: timestamp('accepted_at', { withTimezone: true }),
  firstOperatorResponseAt: timestamp('first_operator_response_at', { withTimezone: true }),
  endedAt: timestamp('ended_at', { withTimezone: true }),
  lastMessageAt: timestamp('last_message_at', { withTimezone: true }).defaultNow().notNull(),

  // Kalkulasi Terindeks (Detik)
  firstResponseSeconds: integer('first_response_seconds'),
  totalDurationSeconds: integer('total_duration_seconds'),

  // Survei Kepuasan (CSAT)
  csatRating: liveChatCsatRatingEnum('csat_rating'),
  csatFeedbackText: text('csat_feedback_text'),

  // Kaitan ke Tiket Konten (Bila Diskusi Berbuah Tiket Brief Baru)
  convertedToBriefId: uuid('converted_to_brief_id')
    .references(() => contentBriefs.id, { onDelete: 'set null' }),

  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

/**
 * Tabel Gelembung Pesan Obrolan Dua Arah Sesi Diskusi Langsung.
 */
export const liveChatMessages = pgTable('live_chat_messages', {
  id: uuid('id').defaultRandom().primaryKey(),
  sessionId: uuid('session_id')
    .notNull()
    .references(() => liveChatSessions.id, { onDelete: 'cascade' }),
  tenantId: uuid('tenant_id')
    .notNull()
    .references(() => tenantMembers.id, { onDelete: 'cascade' }),
  senderType: varchar('sender_type', { length: 20 }).notNull(), // 'CLIENT' | 'OPERATOR' | 'SYSTEM'
  senderOperatorId: uuid('sender_operator_id')
    .references(() => systemAdmins.id, { onDelete: 'set null' }),
  waMessageId: varchar('wa_message_id', { length: 128 }),
  messageType: varchar('message_type', { length: 20 }).default('TEXT').notNull(), // 'TEXT' | 'IMAGE' | 'DOCUMENT'
  textBody: text('text_body'),
  mediaR2Url: text('media_r2_url'),
  mediaCdnUrl: text('media_cdn_url'),
  mediaMimeType: varchar('media_mime_type', { length: 100 }),
  mediaFileName: varchar('media_file_name', { length: 255 }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

export type LiveChatSessionRecord = typeof liveChatSessions.$inferSelect;
export type NewLiveChatSessionRecord = typeof liveChatSessions.$inferInsert;
export type LiveChatMessageRecord = typeof liveChatMessages.$inferSelect;
export type NewLiveChatMessageRecord = typeof liveChatMessages.$inferInsert;
