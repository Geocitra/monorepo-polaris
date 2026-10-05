import { pgTable, uuid, varchar, text, timestamp, customType, boolean, integer, type AnyPgColumn, index } from 'drizzle-orm/pg-core';
import { portalConfigs } from './cms.js';
import { contentPublications } from './content.js';
import { feedbackStatusEnum, issueCategoryEnum, commentStatusEnum } from './enums.js';

// Custom type untuk PostgreSQL BYTEA (Data terenkripsi AES-256)
const bytea = customType<{ data: Buffer; driverData: Buffer }>({
  dataType() {
    return 'bytea';
  },
  toDriver(value: Buffer): Buffer {
    return value;
  },
  fromDriver(value: Buffer): Buffer {
    return value;
  },
});

export const constituentFeedbacks = pgTable('constituent_feedbacks', {
  id: uuid('id').defaultRandom().primaryKey(),
  portalId: uuid('portal_id').notNull().references(() => portalConfigs.id, { onDelete: 'cascade' }),
  trackingTicketCode: varchar('tracking_ticket_code', { length: 30 }).notNull().unique(),
  regencyName: varchar('regency_name', { length: 100 }).notNull(),
  districtKecamatan: varchar('district_kecamatan', { length: 100 }).notNull(),
  category: issueCategoryEnum('category').notNull(),
  aspirationMessage: text('aspiration_message').notNull(),
  status: feedbackStatusEnum('status').default('RECEIVED').notNull(),
  submittedAt: timestamp('submitted_at', { withTimezone: true }).defaultNow().notNull(),
});

export const encryptedPiiVaults = pgTable('encrypted_pii_vaults', {
  id: uuid('id').defaultRandom().primaryKey(),
  feedbackId: uuid('feedback_id').notNull().unique().references(() => constituentFeedbacks.id, { onDelete: 'cascade' }),
  encryptedCitizenName: bytea('encrypted_citizen_name').notNull(),
  encryptedPhoneNumber: bytea('encrypted_phone_number').notNull(),
  ivVector: varchar('iv_vector', { length: 64 }).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

