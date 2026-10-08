import { pgTable, uuid, varchar, timestamp, text, index } from 'drizzle-orm/pg-core';
import { legislativeLevelEnum, planTierEnum, inquiryStatusEnum } from './enums.js';
import { systemAdmins, tenantMembers } from './identity.js';

export const licenseInquiries = pgTable('license_inquiries', {
  id: uuid('id').defaultRandom().primaryKey(),
  fullName: varchar('full_name', { length: 150 }).notNull(),
  phoneNumber: varchar('phone_number', { length: 30 }).notNull(),
  officialEmail: varchar('official_email', { length: 255 }).notNull(),
  partyAffiliation: varchar('party_affiliation', { length: 100 }),
  legislativeLevel: legislativeLevelEnum('legislative_level').notNull(),
  targetRegion: varchar('target_region', { length: 100 }).notNull(),
  preferredCycle: varchar('preferred_cycle', { length: 20 }).default('SEMESTER').notNull(),
  preferredTier: planTierEnum('preferred_tier').default('PRO').notNull(),
  meetingDatetime: timestamp('meeting_datetime', { withTimezone: true }),
  meetingUrl: text('meeting_url'),
  adminNotes: text('admin_notes'),
  status: inquiryStatusEnum('status').default('NEW_LEAD').notNull(),
  handledByAdminId: uuid('handled_by_admin_id').references(() => systemAdmins.id, { onDelete: 'set null' }),
  convertedTenantId: uuid('converted_tenant_id').references(() => tenantMembers.id, { onDelete: 'set null' }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
}, (t) => ({
  idxInquiryStatusLevel: index('idx_inquiry_status_level').on(t.status, t.legislativeLevel),
}));
