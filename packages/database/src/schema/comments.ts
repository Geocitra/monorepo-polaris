import { pgTable, uuid, varchar, text, boolean, integer, timestamp, index, type AnyPgColumn } from 'drizzle-orm/pg-core';
import { contentPublications } from './content.js';
import { commentStatusEnum } from './enums.js';

// 1. Tabel Warga Terautentikasi Google OAuth
export const citizenUsers = pgTable('citizen_users', {
  id: uuid('id').defaultRandom().primaryKey(),
  googleId: varchar('google_id', { length: 100 }).notNull().unique(),
  email: varchar('email', { length: 255 }).notNull(),
  fullName: varchar('full_name', { length: 150 }).notNull(),
  avatarUrl: text('avatar_url'),
  isBanned: boolean('is_banned').default(false).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

// 2. Tabel Komentar Berita & Gagasan Kebijakan
export const articleComments = pgTable('article_comments', {
  id: uuid('id').defaultRandom().primaryKey(),
  publicationId: uuid('publication_id').notNull().references(() => contentPublications.id, { onDelete: 'cascade' }),
  citizenId: uuid('citizen_id').notNull().references(() => citizenUsers.id, { onDelete: 'cascade' }),
  parentCommentId: uuid('parent_comment_id').references((): AnyPgColumn => articleComments.id, { onDelete: 'cascade' }),
  commentText: text('comment_text').notNull(),
  status: commentStatusEnum('status').default('PUBLISHED').notNull(),
  likesCount: integer('likes_count').default(0).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
}, (t) => ({
  idxPublicationStatus: index('idx_comments_publication_status').on(t.publicationId, t.status, t.createdAt),
}));
