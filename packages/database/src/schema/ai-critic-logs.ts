import { pgTable, varchar, text, integer, boolean, timestamp, jsonb, index } from 'drizzle-orm/pg-core';

/**
 * Tabel studio_ai_critic_logs: Menyimpan riwayat audit kualitas mandiri (Self-Critic) AI
 * untuk setiap poster/infografis yang di-generate.
 */
export const studioAiCriticLogs = pgTable(
  'studio_ai_critic_logs',
  {
    id: varchar('id', { length: 100 }).primaryKey(),
    tenantId: varchar('tenant_id', { length: 100 }),
    publicationId: varchar('publication_id', { length: 100 }),
    jobId: varchar('job_id', { length: 100 }),
    archetype: varchar('archetype', { length: 60 }).notNull(),
    layoutVariant: integer('layout_variant').default(0),
    topic: text('topic').notNull(),
    overallScore: integer('overall_score').notNull(), // 0 - 100
    passed: boolean('passed').notNull(),
    autoRepaired: boolean('auto_repaired').default(false).notNull(),
    checklist: jsonb('checklist').notNull(), // { textOnPhotoDetected, pieChartDetected, pieChartDuplicateNumbers, pointDuplicationDetected, spellingAccurate, contrastClean }
    critiqueNotes: jsonb('critique_notes').notNull(), // string[]
    remedyInstructions: text('remedy_instructions'),
    beforeImageUrl: text('before_image_url'),
    finalImageUrl: text('final_image_url'),
    durationMs: integer('duration_ms').default(0),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    archetypeIdx: index('idx_critic_logs_archetype').on(table.archetype),
    passedIdx: index('idx_critic_logs_passed').on(table.passed),
    createdIdx: index('idx_critic_logs_created').on(table.createdAt),
    tenantIdx: index('idx_critic_logs_tenant').on(table.tenantId),
  })
);

/**
 * Tabel studio_ai_learned_memories: Menyimpan akumulasi pelajaran/pantangan
 * yang dipelajari AI dari kesalahan masa lalu untuk mencegah pengulangan bug.
 */
export const studioAiLearnedMemories = pgTable(
  'studio_ai_learned_memories',
  {
    id: varchar('id', { length: 100 }).primaryKey(),
    archetype: varchar('archetype', { length: 60 }).notNull(),
    category: varchar('category', { length: 60 }).notNull(), // 'TEXT_ON_PHOTO' | 'PIE_CHART' | 'DUPLICATE_POINTS' | 'SPELLING' | 'CONTRAST'
    title: varchar('title', { length: 200 }).notNull(),
    ruleInstruction: text('rule_instruction').notNull(),
    triggerCount: integer('trigger_count').default(1).notNull(),
    isActive: boolean('is_active').default(true).notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    archetypeIdx: index('idx_learned_memories_archetype').on(table.archetype),
    activeIdx: index('idx_learned_memories_active').on(table.isActive),
  })
);

export type StudioAiCriticLogRecord = typeof studioAiCriticLogs.$inferSelect;
export type NewStudioAiCriticLogRecord = typeof studioAiCriticLogs.$inferInsert;

export type StudioAiLearnedMemoryRecord = typeof studioAiLearnedMemories.$inferSelect;
export type NewStudioAiLearnedMemoryRecord = typeof studioAiLearnedMemories.$inferInsert;

