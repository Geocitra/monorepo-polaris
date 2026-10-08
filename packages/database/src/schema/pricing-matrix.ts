import { pgTable, uuid, varchar, timestamp, numeric, integer, boolean, unique, index } from 'drizzle-orm/pg-core';
import { legislativeLevelEnum, planTierEnum } from './enums.js';

export const subscriptionPriceMatrices = pgTable('subscription_price_matrices', {
  id: uuid('id').defaultRandom().primaryKey(),
  legislativeLevel: legislativeLevelEnum('legislative_level').notNull(),
  planTier: planTierEnum('plan_tier').notNull(),
  billingCycle: varchar('billing_cycle', { length: 20 }).notNull(), // 'MONTHLY', 'SEMESTER', 'ANNUAL'
  durationDays: integer('duration_days').notNull(),                 // 30, 180, 365
  amountIdr: numeric('amount_idr', { precision: 12, scale: 2 }).notNull(),
  isActive: boolean('is_active').default(true).notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
}, (t) => ({
  unqLevelTierCycle: unique('unq_level_tier_cycle').on(t.legislativeLevel, t.planTier, t.billingCycle),
  idxPriceMatrixLookup: index('idx_price_matrix_lookup').on(t.legislativeLevel, t.planTier, t.billingCycle, t.isActive),
}));
