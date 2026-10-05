import { pgTable, uuid, varchar, text, integer, timestamp, jsonb, bigint, unique } from 'drizzle-orm/pg-core';
import { tenantMembers } from './identity.js';
import { contentStatusEnum, assetTypeEnum } from './enums.js';

export const contentPublications = pgTable('content_publications', {
  id: uuid('id').defaultRandom().primaryKey(),
  tenantId: uuid('tenant_id').notNull().references(() => tenantMembers.id, { onDelete: 'cascade' }),
  title: varchar('title', { length: 255 }).notNull(),
  slug: varchar('slug', { length: 255 }).notNull(),
  excerpt: text('excerpt').notNull(),
  bodyContentMarkdown: text('body_content_markdown').notNull(),
  wordCount: integer('word_count').notNull(),
  status: contentStatusEnum('status').default('DRAFT').notNull(),
  canonicalUrl: text('canonical_url').notNull(),
  commentCount: integer('comment_count').default(0).notNull(),
  publishedAt: timestamp('published_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
}, (t) => ({
  unqTenantSlug: unique().on(t.tenantId, t.slug),
}));

export const mediaAssets = pgTable('media_assets', {
  id: uuid('id').defaultRandom().primaryKey(),
  publicationId: uuid('publication_id').notNull().references(() => contentPublications.id, { onDelete: 'cascade' }),
  assetType: assetTypeEnum('asset_type').notNull(),
  r2StorageUrl: text('r2_storage_url').notNull(),
  cdnPublicUrl: text('cdn_public_url').notNull(),
  promptUsed: text('prompt_used'),
  mimeType: varchar('mime_type', { length: 50 }).default('image/webp').notNull(),
  fileSizeBytes: bigint('file_size_bytes', { mode: 'number' }).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

export const socialSyndicationPacks = pgTable('social_syndication_packs', {
  id: uuid('id').defaultRandom().primaryKey(),
  publicationId: uuid('publication_id').notNull().unique().references(() => contentPublications.id, { onDelete: 'cascade' }),
  instagramCaption: text('instagram_caption'),
  twitterThreads: jsonb('twitter_threads'),
  whatsappBroadcastText: text('whatsapp_broadcast_text'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});
