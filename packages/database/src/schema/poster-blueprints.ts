import { pgTable, varchar, text, integer, timestamp, jsonb, index } from 'drizzle-orm/pg-core';

/**
 * Tabel poster_reference_blueprints: Menyimpan blueprint referensi desain poster
 * yang dapat ditambahkan dan dianalisis secara dinamis via AI Vision.
 */
export const posterReferenceBlueprints = pgTable(
  'poster_reference_blueprints',
  {
    id: varchar('id', { length: 100 }).primaryKey(),
    name: varchar('name', { length: 150 }).notNull(),
    referenceFile: text('reference_file').notNull(),
    archetype: varchar('archetype', { length: 60 }).notNull(),
    description: text('description').notNull(),
    tags: text('tags').array().notNull(),
    aspectRatio: varchar('aspect_ratio', { length: 10 }).default('4:5').notNull(),
    colorPalette: jsonb('color_palette').notNull(),
    scenePromptHint: text('scene_prompt_hint').notNull(),
    negativeSpaceZone: text('negative_space_zone').notNull(),
    slotManifest: jsonb('slot_manifest').notNull(),
    fixedConstraints: jsonb('fixed_constraints'),
    variationRules: jsonb('variation_rules'),
    status: varchar('status', { length: 20 }).default('DRAFT').notNull(), // 'DRAFT' | 'APPROVED' | 'ARCHIVED'
    version: integer('version').default(1).notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    statusIdx: index('idx_poster_blueprints_status').on(table.status),
    archetypeIdx: index('idx_poster_blueprints_archetype').on(table.archetype),
  })
);

export type PosterReferenceBlueprintRecord = typeof posterReferenceBlueprints.$inferSelect;
export type NewPosterReferenceBlueprintRecord = typeof posterReferenceBlueprints.$inferInsert;
