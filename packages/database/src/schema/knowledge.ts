import { pgTable, uuid, varchar, text, integer, real, timestamp, customType, check, index } from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';
import { tenantMembers } from './identity.js';
import { docTypeEnum, legalStatusEnum } from './enums.js';
import { PolicySector } from '@polaris/shared-types';

// Custom type untuk pgvector vector(1536)
const pgVector1536 = customType<{ data: number[]; driverData: string }>({
  dataType() {
    return 'vector(1536)';
  },
  toDriver(value: number[]): string {
    return `[${value.join(',')}]`;
  },
  fromDriver(value: string): number[] {
    return JSON.parse(value.replace(/^{|}$/g, (match) => (match === '{' ? '[' : ']')));
  },
});

export const knowledgeDocuments = pgTable('knowledge_documents', {
  id: uuid('id').defaultRandom().primaryKey(),
  jurisdictionRegion: varchar('jurisdiction_region', { length: 100 }).notNull(),
  docType: docTypeEnum('doc_type').notNull(),
  docNumber: varchar('doc_number', { length: 50 }).notNull(),
  docYear: integer('doc_year').notNull(),
  title: varchar('title', { length: 255 }).notNull(),
  legalStatus: legalStatusEnum('legal_status').default('BERLAKU').notNull(),
  sourceUrl: text('source_url'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

export const knowledgeChunks = pgTable('knowledge_chunks', {
  id: uuid('id').defaultRandom().primaryKey(),
  documentId: uuid('document_id').notNull().references(() => knowledgeDocuments.id, { onDelete: 'cascade' }),
  structuralReference: varchar('structural_reference', { length: 100 }).notNull(),
  chunkContent: text('chunk_content').notNull(),
  vectorEmbedding: pgVector1536('vector_embedding').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

export const mediaDiscourses = pgTable('media_discourses', {
  id: uuid('id').defaultRandom().primaryKey(),
  regionScope: varchar('region_scope', { length: 100 }).notNull(),
  newsPortalName: varchar('news_portal_name', { length: 100 }).notNull(),
  originalUrl: text('original_url').notNull().unique(),
  articleTitle: varchar('article_title', { length: 255 }).notNull(),
  cleanSummary: text('clean_summary').notNull(),
  sentimentScore: real('sentiment_score').notNull(),
  sector: varchar('sector', { length: 50 }),
  relevanceScore: real('relevance_score'),
  primaryKeywords: text('primary_keywords').array(),
  publishedAt: timestamp('published_at', { withTimezone: true }).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  policySectorCheck: check(
    'chk_media_discourses_policy_sector',
    sql`${table.sector} IS NULL OR ${table.sector} IN (${sql.join(
      Object.values(PolicySector).map((sector) => sql`${sector}`),
      sql`, `
    )})`
  ),
  relevanceScoreCheck: check(
    'chk_media_discourses_relevance_score',
    sql`${table.relevanceScore} IS NULL OR ${table.relevanceScore} BETWEEN 0 AND 1`
  ),
  sectorRegionPublishedAtIndex: index('idx_media_discourses_sector_region')
    .on(table.sector, table.regionScope, table.publishedAt),
}));

export const memberWritingMemories = pgTable('member_writing_memories', {
  id: uuid('id').defaultRandom().primaryKey(),
  tenantId: uuid('tenant_id').notNull().references(() => tenantMembers.id, { onDelete: 'cascade' }),
  sampleText: text('sample_text').notNull(),
  keyVocabulary: text('key_vocabulary').array(),
  writingStyleEmbedding: pgVector1536('writing_style_embedding').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});
