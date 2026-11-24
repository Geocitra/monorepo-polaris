import {
  pgTable,
  uuid,
  varchar,
  text,
  integer,
  bigint,
  numeric,
  boolean,
  timestamp,
  jsonb,
  unique,
  index,
  check,
  foreignKey,
  type AnyPgColumn,
} from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';
import {
  legislativeLevelEnum,
  organizationStatusEnum,
  organizationContractStatusEnum,
  organizationUnitTypeEnum,
  organizationMemberRoleEnum,
  organizationUnitMemberRoleEnum,
  institutionalMembershipStatusEnum,
  institutionalNoteVisibilityEnum,
} from './enums.js';
import { tenantMembers, systemAdmins, masterPoliticalParties } from './identity.js';
import type { StandingOrdersConfigDto } from '@polaris/shared-types';

/**
 * 1. ORGANIZATIONS: Master Instansi (DPRD Provinsi, DPRD Kab/Kota, DPR RI, DPD RI)
 */
export const organizations = pgTable(
  'organizations',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    code: varchar('code', { length: 50 }).notNull().unique(),
    name: varchar('name', { length: 200 }).notNull(),
    legislativeLevel: legislativeLevelEnum('legislative_level').notNull(),
    regionName: varchar('region_name', { length: 120 }).notNull(),
    provinceName: varchar('province_name', { length: 100 }).notNull(),
    standingOrdersConfig: jsonb('standing_orders_config')
      .$type<StandingOrdersConfigDto>()
      .default({})
      .notNull(),
    status: organizationStatusEnum('status').default('ACTIVE').notNull(),
    createdByAdminId: uuid('created_by_admin_id').references(() => systemAdmins.id, {
      onDelete: 'set null',
    }),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => ({
    idxOrgStatusLevel: index('idx_organizations_status_level').on(t.status, t.legislativeLevel),
    idxOrgRegion: index('idx_organizations_region').on(t.regionName),
  })
);

/**
 * 2. ORGANIZATION CONTRACTS: Kontrak Tahunan B2G & Pooled AI Token / Storage Quota
 */
export const organizationContracts = pgTable(
  'organization_contracts',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    organizationId: uuid('organization_id')
      .notNull()
      .references(() => organizations.id, { onDelete: 'cascade' }),
    contractNumber: varchar('contract_number', { length: 100 }).notNull().unique(),
    fiscalYear: integer('fiscal_year').notNull(),
    status: organizationContractStatusEnum('status').default('DRAFT').notNull(),
    startDate: timestamp('start_date', { withTimezone: true }).notNull(),
    endDate: timestamp('end_date', { withTimezone: true }).notNull(),
    gracePeriodEnd: timestamp('grace_period_end', { withTimezone: true }),
    maxSeats: integer('max_seats').default(50).notNull(),
    maxStorageBytes: bigint('max_storage_bytes', { mode: 'number' })
      .default(10737418240)
      .notNull(),
    annualTokenPoolLimit: bigint('annual_token_pool_limit', { mode: 'number' })
      .default(50000000)
      .notNull(),
    tokensConsumed: bigint('tokens_consumed', { mode: 'number' }).default(0).notNull(),
    contractValueIdr: numeric('contract_value_idr', { precision: 15, scale: 2 })
      .default('0.00')
      .notNull(),
    notes: text('notes'),
    createdByAdminId: uuid('created_by_admin_id').references(() => systemAdmins.id, {
      onDelete: 'set null',
    }),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => ({
    idxContractOrgStatus: index('idx_org_contracts_org_status').on(
      t.organizationId,
      t.status,
      t.endDate
    ),
    chkContractDates: check('chk_org_contracts_dates', sql`${t.endDate} > ${t.startDate}`),
    chkContractSeats: check('chk_org_contracts_max_seats', sql`${t.maxSeats} > 0`),
  })
);

/**
 * 3. ORGANIZATION UNITS: Hierarki Banggar, Fraksi, Komisi, Panja, & Sub-Unit Bidang
 */
export const organizationUnits = pgTable(
  'organization_units',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    organizationId: uuid('organization_id')
      .notNull()
      .references(() => organizations.id, { onDelete: 'cascade' }),
    parentUnitId: uuid('parent_unit_id').references((): AnyPgColumn => organizationUnits.id, {
      onDelete: 'restrict',
    }),
    unitType: organizationUnitTypeEnum('unit_type').notNull(),
    code: varchar('code', { length: 60 }).notNull(),
    name: varchar('name', { length: 180 }).notNull(),
    description: text('description'),
    politicalPartyId: uuid('political_party_id').references(() => masterPoliticalParties.id, {
      onDelete: 'set null',
    }),
    focusSectors: text('focus_sectors').array().default([]).notNull(),
    partnerOpds: text('partner_opds').array().default([]).notNull(),
    isAdHoc: boolean('is_ad_hoc').default(false).notNull(),
    fiscalYear: integer('fiscal_year'),
    isActive: boolean('is_active').default(true).notNull(),
    archivedAt: timestamp('archived_at', { withTimezone: true }),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => ({
    unqOrgUnitCode: unique('unq_org_units_org_code').on(t.organizationId, t.code),
    idxUnitOrgParent: index('idx_org_units_org_parent').on(
      t.organizationId,
      t.parentUnitId,
      t.isActive
    ),
    idxUnitOrgType: index('idx_org_units_org_type').on(t.organizationId, t.unitType),
    chkNoSelfParent: check(
      'chk_org_units_no_self_parent',
      sql`${t.parentUnitId} IS NULL OR ${t.parentUnitId} != ${t.id}`
    ),
  })
);

/**
 * 4. ORGANIZATION MEMBERSHIPS: Keanggotaan Akun User (tenant_members) pada Instansi
 */
export const organizationMemberships = pgTable(
  'organization_memberships',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    organizationId: uuid('organization_id')
      .notNull()
      .references(() => organizations.id, { onDelete: 'cascade' }),
    tenantId: uuid('tenant_id')
      .notNull()
      .references(() => tenantMembers.id, { onDelete: 'cascade' }),
    orgRole: organizationMemberRoleEnum('org_role').default('MEMBER').notNull(),
    status: institutionalMembershipStatusEnum('status').default('ACTIVE').notNull(),
    titleOrPosition: varchar('title_or_position', { length: 150 }),
    joinedAt: timestamp('joined_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => ({
    unqOrgTenant: unique('unq_org_memberships_org_tenant').on(t.organizationId, t.tenantId),
    idxOrgMemberTenant: index('idx_org_memberships_tenant').on(t.tenantId, t.status),
    idxOrgMemberOrgRole: index('idx_org_memberships_org_role').on(
      t.organizationId,
      t.orgRole,
      t.status
    ),
  })
);

/**
 * 5. ORGANIZATION UNIT MEMBERSHIPS: Penugasan Many-to-Many User ke Unit / Bidang
 * Dilengkapi Composite Foreign Key ke organization_memberships(organization_id, tenant_id)
 * untuk mencegah orphan unit membership (user wajib terdaftar di instansi yang sama).
 */
export const organizationUnitMemberships = pgTable(
  'organization_unit_memberships',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    organizationId: uuid('organization_id')
      .notNull()
      .references(() => organizations.id, { onDelete: 'cascade' }),
    unitId: uuid('unit_id')
      .notNull()
      .references(() => organizationUnits.id, { onDelete: 'cascade' }),
    tenantId: uuid('tenant_id')
      .notNull()
      .references(() => tenantMembers.id, { onDelete: 'cascade' }),
    unitRole: organizationUnitMemberRoleEnum('unit_role').default('MEMBER').notNull(),
    status: institutionalMembershipStatusEnum('status').default('ACTIVE').notNull(),
    assignedByTenantId: uuid('assigned_by_tenant_id').references(() => tenantMembers.id, {
      onDelete: 'set null',
    }),
    assignedByAdminId: uuid('assigned_by_admin_id').references(() => systemAdmins.id, {
      onDelete: 'set null',
    }),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => ({
    unqUnitTenant: unique('unq_org_unit_memberships_unit_tenant').on(t.unitId, t.tenantId),
    idxUnitMemberTenant: index('idx_org_unit_memberships_tenant').on(
      t.tenantId,
      t.organizationId,
      t.status
    ),
    idxUnitMemberUnit: index('idx_org_unit_memberships_unit').on(t.unitId, t.status),
    fkOrgMemberComposite: foreignKey({
      columns: [t.organizationId, t.tenantId],
      foreignColumns: [organizationMemberships.organizationId, organizationMemberships.tenantId],
      name: 'fk_unit_membership_org_member',
    }).onDelete('cascade'),
  })
);

/**
 * 6. ORGANIZATION QUOTA LEDGERS: Monitoring Pemakaian AI Bulanan per Instansi & per Bidang
 */
export const organizationQuotaLedgers = pgTable(
  'organization_quota_ledgers',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    organizationId: uuid('organization_id')
      .notNull()
      .references(() => organizations.id, { onDelete: 'cascade' }),
    unitId: uuid('unit_id').references(() => organizationUnits.id, { onDelete: 'set null' }),
    billingCycleMonth: varchar('billing_cycle_month', { length: 7 }).notNull(),
    totalRequests: integer('total_requests').default(0).notNull(),
    openaiInputTokens: bigint('openai_input_tokens', { mode: 'number' }).default(0).notNull(),
    openaiOutputTokens: bigint('openai_output_tokens', { mode: 'number' }).default(0).notNull(),
    openaiTotalTokens: bigint('openai_total_tokens', { mode: 'number' }).default(0).notNull(),
    openaiCostIdr: bigint('openai_cost_idr', { mode: 'number' }).default(0).notNull(),
    geminiInputTokens: bigint('gemini_input_tokens', { mode: 'number' }).default(0).notNull(),
    geminiOutputTokens: bigint('gemini_output_tokens', { mode: 'number' }).default(0).notNull(),
    geminiTotalTokens: bigint('gemini_total_tokens', { mode: 'number' }).default(0).notNull(),
    geminiCostIdr: bigint('gemini_cost_idr', { mode: 'number' }).default(0).notNull(),
    totalTokensConsumed: bigint('total_tokens_consumed', { mode: 'number' }).default(0).notNull(),
    totalCostIdr: bigint('total_cost_idr', { mode: 'number' }).default(0).notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => ({
    idxOrgLedgerMonth: index('idx_org_quota_ledgers_org_month').on(
      t.organizationId,
      t.billingCycleMonth
    ),
    idxOrgLedgerUnitMonth: index('idx_org_quota_ledgers_unit_month').on(
      t.organizationId,
      t.unitId,
      t.billingCycleMonth
    ),
  })
);

/**
 * 7. INSTITUTIONAL SHARED NOTES: Catatan Kerja, Analisis AI, & Temuan Bidang
 */
export const institutionalSharedNotes = pgTable(
  'institutional_shared_notes',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    organizationId: uuid('organization_id')
      .notNull()
      .references(() => organizations.id, { onDelete: 'cascade' }),
    unitId: uuid('unit_id')
      .notNull()
      .references(() => organizationUnits.id, { onDelete: 'cascade' }),
    authorTenantId: uuid('author_tenant_id')
      .notNull()
      .references(() => tenantMembers.id, { onDelete: 'cascade' }),
    title: varchar('title', { length: 255 }).notNull(),
    contentMarkdown: text('content_markdown').notNull(),
    visibility: institutionalNoteVisibilityEnum('visibility').default('UNIT_SHARED').notNull(),
    sourceFileIds: uuid('source_file_ids').array().default([]).notNull(),
    approvedByTenantId: uuid('approved_by_tenant_id').references(() => tenantMembers.id, {
      onDelete: 'set null',
    }),
    approvedAt: timestamp('approved_at', { withTimezone: true }),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => ({
    idxSharedNotesOrgUnit: index('idx_inst_shared_notes_org_unit').on(
      t.organizationId,
      t.unitId,
      t.visibility
    ),
  })
);

/**
 * 8. INSTITUTIONAL AUDIT LOGS: Jejak Audit Governance & Akses Ruang Kerja Instansi
 */
export const institutionalAuditLogs = pgTable(
  'institutional_audit_logs',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    organizationId: uuid('organization_id')
      .notNull()
      .references(() => organizations.id, { onDelete: 'cascade' }),
    unitId: uuid('unit_id').references(() => organizationUnits.id, { onDelete: 'set null' }),
    actorTenantId: uuid('actor_tenant_id').references(() => tenantMembers.id, {
      onDelete: 'set null',
    }),
    actorAdminId: uuid('actor_admin_id').references(() => systemAdmins.id, {
      onDelete: 'set null',
    }),
    action: varchar('action', { length: 100 }).notNull(),
    targetEntity: varchar('target_entity', { length: 60 }).notNull(),
    targetEntityId: uuid('target_entity_id'),
    details: jsonb('details').default({}),
    ipAddress: varchar('ip_address', { length: 50 }),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => ({
    idxInstAuditOrgCreated: index('idx_inst_audit_logs_org_created').on(
      t.organizationId,
      t.createdAt
    ),
  })
);
