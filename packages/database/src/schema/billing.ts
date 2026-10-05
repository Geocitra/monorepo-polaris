import { pgTable, uuid, varchar, timestamp, numeric, integer, bigint, text, unique, index, date } from 'drizzle-orm/pg-core';
import { tenantMembers } from './identity.js';
import { subscriptionStatusEnum, planTierEnum, paymentStatusEnum } from './enums.js';

export const subscriptions = pgTable('subscriptions', {
  id: uuid('id').defaultRandom().primaryKey(),
  tenantId: uuid('tenant_id').notNull().unique().references(() => tenantMembers.id, { onDelete: 'cascade' }),
  planTier: planTierEnum('plan_tier').default('PRO').notNull(),
  status: subscriptionStatusEnum('status').default('INACTIVE').notNull(),
  currentPeriodStart: timestamp('current_period_start', { withTimezone: true }),
  currentPeriodEnd: timestamp('current_period_end', { withTimezone: true }),
  gracePeriodEnd: timestamp('grace_period_end', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

export const invoiceTransactions = pgTable('invoice_transactions', {
  id: uuid('id').defaultRandom().primaryKey(),
  subscriptionId: uuid('subscription_id').notNull().references(() => subscriptions.id, { onDelete: 'cascade' }),
  invoiceNumber: varchar('invoice_number', { length: 100 }).notNull().unique(),
  amountIdr: numeric('amount_idr', { precision: 12, scale: 2 }).notNull(),
  grossAmountIdr: numeric('gross_amount_idr', { precision: 12, scale: 2 }),
  mdrFeeIdr: numeric('mdr_fee_idr', { precision: 12, scale: 2 }).default('0.00').notNull(),
  vatFeeIdr: numeric('vat_fee_idr', { precision: 12, scale: 2 }).default('0.00').notNull(),
  netAmountIdr: numeric('net_amount_idr', { precision: 12, scale: 2 }),
  gatewayOrderId: varchar('gateway_order_id', { length: 150 }).notNull().unique(),
  paymentMethod: varchar('payment_method', { length: 50 }),
  paymentStatus: paymentStatusEnum('payment_status').default('PENDING').notNull(),
  paidAt: timestamp('paid_at', { withTimezone: true }),
  settlementTime: timestamp('settlement_time', { withTimezone: true }),
  reconciliationStatus: varchar('reconciliation_status', { length: 30 }).default('UNRECONCILED').notNull(),
  reconciliationBatchId: uuid('reconciliation_batch_id'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
}, (t) => ({
  idxInvoiceReconStatusTime: index('idx_invoice_recon_status_time').on(t.reconciliationStatus, t.paymentStatus, t.settlementTime),
  idxInvoiceGatewayOrder: index('idx_invoice_gateway_order').on(t.gatewayOrderId),
}));

export const tenantQuotaLedgers = pgTable('tenant_quota_ledgers', {
  id: uuid('id').defaultRandom().primaryKey(),
  tenantId: uuid('tenant_id').notNull().references(() => tenantMembers.id, { onDelete: 'cascade' }),
  billingCycleMonth: varchar('billing_cycle_month', { length: 7 }).notNull(),
  articleLimit: integer('article_limit').default(0).notNull(), // 0 = Unlimited metered
  articleUsed: integer('article_used').default(0).notNull(),
  dalleLimit: integer('dalle_limit').default(0).notNull(),     // 0 = Unlimited metered
  dalleUsed: integer('dalle_used').default(0).notNull(),
  totalTokensConsumed: bigint('total_tokens_consumed', { mode: 'number' }).default(0).notNull(),
  estimatedCostUsd: numeric('estimated_cost_usd', { precision: 10, scale: 4 }).default('0.0000').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
}, (t) => ({
  unqTenantMonth: unique().on(t.tenantId, t.billingCycleMonth),
}));

export const aiTraceLogs = pgTable('ai_trace_logs', {
  id: uuid('id').defaultRandom().primaryKey(),
  traceId: varchar('trace_id', { length: 100 }).notNull(),
  tenantId: uuid('tenant_id').references(() => tenantMembers.id, { onDelete: 'set null' }),
  operation: varchar('operation', { length: 100 }).notNull(),
  model: varchar('model', { length: 50 }).notNull(),
  inputTokens: integer('input_tokens').default(0).notNull(),
  outputTokens: integer('output_tokens').default(0).notNull(),
  totalTokens: integer('total_tokens').default(0).notNull(),
  latencyMs: integer('latency_ms').default(0).notNull(),
  costUsd: numeric('cost_usd', { precision: 10, scale: 5 }).default('0').notNull(),
  status: varchar('status', { length: 30 }).default('SUCCESS').notNull(),
  errorMessage: text('error_message'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

export const platformTokenPools = pgTable('platform_token_pools', {
  id: uuid('id').defaultRandom().primaryKey(),
  totalBudgetUsd: numeric('total_budget_usd', { precision: 10, scale: 2 }).default('50.00').notNull(),
  totalTokensAllocated: bigint('total_tokens_allocated', { mode: 'number' }).default(10000000).notNull(),
  totalTokensConsumed: bigint('total_tokens_consumed', { mode: 'number' }).default(0).notNull(),
  alertThresholdPercent: integer('alert_threshold_percent').default(20).notNull(),
  circuitState: varchar('circuit_state', { length: 20 }).default('CLOSED').notNull(),
  lastAlertSentAt: timestamp('last_alert_sent_at', { withTimezone: true }),
  lastTopupDate: timestamp('last_topup_date', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

export const platformTopupHistories = pgTable('platform_topup_histories', {
  id: uuid('id').defaultRandom().primaryKey(),
  amountUsd: numeric('amount_usd', { precision: 10, scale: 2 }).notNull(),
  amountIdr: numeric('amount_idr', { precision: 12, scale: 2 }).notNull(),
  tokensAdded: bigint('tokens_added', { mode: 'number' }).notNull(),
  paymentReference: varchar('payment_reference', { length: 150 }).notNull(),
  notes: text('notes'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

export const reconciliationBatches = pgTable('reconciliation_batches', {
  id: uuid('id').defaultRandom().primaryKey(),
  batchNumber: varchar('batch_number', { length: 100 }).notNull().unique(),
  reconDate: date('recon_date').notNull(),
  sourceGateway: varchar('source_gateway', { length: 50 }).default('MIDTRANS').notNull(),
  totalGatewayTransactions: integer('total_gateway_transactions').default(0).notNull(),
  totalInternalTransactions: integer('total_internal_transactions').default(0).notNull(),
  totalMatchedTransactions: integer('total_matched_transactions').default(0).notNull(),
  totalDiscrepancies: integer('total_discrepancies').default(0).notNull(),
  totalGrossAmountIdr: numeric('total_gross_amount_idr', { precision: 15, scale: 2 }).default('0.00').notNull(),
  totalMdrFeeIdr: numeric('total_mdr_fee_idr', { precision: 15, scale: 2 }).default('0.00').notNull(),
  totalNetAmountIdr: numeric('total_net_amount_idr', { precision: 15, scale: 2 }).default('0.00').notNull(),
  status: varchar('status', { length: 30 }).default('PROCESSING').notNull(),
  rawReportStorageUrl: text('raw_report_storage_url'),
  executedBy: varchar('executed_by', { length: 100 }).default('SYSTEM_CRON').notNull(),
  notes: text('notes'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
}, (t) => ({
  idxBatchDateStatus: index('idx_recon_batch_date_status').on(t.reconDate, t.status),
}));

export const reconciliationDiscrepancies = pgTable('reconciliation_discrepancies', {
  id: uuid('id').defaultRandom().primaryKey(),
  batchId: uuid('batch_id').notNull().references(() => reconciliationBatches.id, { onDelete: 'cascade' }),
  invoiceId: uuid('invoice_id').references(() => invoiceTransactions.id, { onDelete: 'set null' }),
  gatewayOrderId: varchar('gateway_order_id', { length: 150 }).notNull(),
  discrepancyType: varchar('discrepancy_type', { length: 50 }).notNull(),
  internalStatus: varchar('internal_status', { length: 50 }),
  gatewayStatus: varchar('gateway_status', { length: 50 }),
  internalAmountIdr: numeric('internal_amount_idr', { precision: 12, scale: 2 }).default('0.00').notNull(),
  gatewayAmountIdr: numeric('gateway_amount_idr', { precision: 12, scale: 2 }).default('0.00').notNull(),
  discrepancyAmountIdr: numeric('discrepancy_amount_idr', { precision: 12, scale: 2 }).default('0.00').notNull(),
  resolutionStatus: varchar('resolution_status', { length: 30 }).default('UNRESOLVED').notNull(),
  resolutionNotes: text('resolution_notes'),
  resolvedBy: uuid('resolved_by'),
  resolvedAt: timestamp('resolved_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
}, (t) => ({
  idxDiscrepancyBatchRes: index('idx_recon_discrepancy_batch_res').on(t.batchId, t.resolutionStatus),
  idxDiscrepancyGatewayOrder: index('idx_recon_discrepancy_gateway_order').on(t.gatewayOrderId),
}));

