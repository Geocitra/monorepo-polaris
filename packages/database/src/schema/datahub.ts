import { pgTable, uuid, varchar, text, integer, timestamp, customType, index } from 'drizzle-orm/pg-core';
import { tenantMembers } from './identity.js';
import { legislativeLevelEnum } from './enums.js';

// Custom type untuk pgvector vector(1536)
export const pgVector1536 = customType<{ data: number[]; driverData: string }>({
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

export const datahubFiles = pgTable('datahub_files', {
  id: uuid('id').defaultRandom().primaryKey(),
  contentSha256: varchar('content_sha256', { length: 64 }).notNull().unique(),
  originalFileName: varchar('original_file_name', { length: 255 }).notNull(),
  mimeType: varchar('mime_type', { length: 100 }).notNull(),
  fileSizeBytes: integer('file_size_bytes').notNull(),
  storagePath: text('storage_path').notNull(),
  extractionStatus: varchar('extraction_status', { length: 30 }).default('COMPLETED').notNull(),
  totalPages: integer('total_pages').default(1),
  extractedRawText: text('extracted_raw_text'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  sha256Idx: index('idx_datahub_files_sha256').on(table.contentSha256),
}));

export const datahubDocumentRefs = pgTable('datahub_document_refs', {
  id: uuid('id').defaultRandom().primaryKey(),
  fileId: uuid('file_id').notNull().references(() => datahubFiles.id, { onDelete: 'cascade' }),
  uploadedByTenantId: uuid('uploaded_by_tenant_id').notNull().references(() => tenantMembers.id, { onDelete: 'cascade' }),
  customTitle: varchar('custom_title', { length: 255 }),
  dapilCode: varchar('dapil_code', { length: 50 }),
  partyAffiliation: varchar('party_affiliation', { length: 100 }),
  branchType: varchar('branch_type', { length: 50 }),
  legislativeLevel: legislativeLevelEnum('legislative_level'),
  privacyScope: varchar('privacy_scope', { length: 50 }).default('PRIVATE_TENANT').notNull(),
  categoryTag: varchar('category_tag', { length: 50 }).default('DOKUMEN_INTERNAL').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  tenantIdx: index('idx_datahub_refs_tenant').on(table.uploadedByTenantId),
  dapilIdx: index('idx_datahub_refs_dapil').on(table.dapilCode),
  partyIdx: index('idx_datahub_refs_party').on(table.partyAffiliation),
}));

export const datahubDocumentChunks = pgTable('datahub_document_chunks', {
  id: uuid('id').defaultRandom().primaryKey(),
  fileId: uuid('file_id').notNull().references(() => datahubFiles.id, { onDelete: 'cascade' }),
  chunkIndex: integer('chunk_index').notNull(),
  sectionTitle: varchar('section_title', { length: 255 }),
  chunkContent: text('chunk_content').notNull(),
  contextualHeader: text('contextual_header'),
  tokenCount: integer('token_count').notNull(),
  vectorEmbedding: pgVector1536('vector_embedding').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  fileIdx: index('idx_datahub_chunks_file').on(table.fileId),
}));
