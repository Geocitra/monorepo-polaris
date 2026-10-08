import { pgTable, uuid, varchar, timestamp, text, boolean, integer, jsonb } from 'drizzle-orm/pg-core';
import { legislativeLevelEnum } from './enums.js';

export const electoralDistricts = pgTable('electoral_districts', {
  id: uuid('id').defaultRandom().primaryKey(),
  dapilCode: varchar('dapil_code', { length: 50 }).notNull().unique(),
  dapilName: varchar('dapil_name', { length: 100 }).notNull(),
  provinceName: varchar('province_name', { length: 100 }).notNull(),
  regencyCoverage: text('regency_coverage').array().notNull(),
  totalVoters: integer('total_voters'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

export const tenantMembers = pgTable('tenant_members', {
  id: uuid('id').defaultRandom().primaryKey(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  passwordHash: varchar('password_hash', { length: 255 }).notNull(),
  fullName: varchar('full_name', { length: 150 }).notNull(),
  phoneNumber: varchar('phone_number', { length: 30 }).notNull(),
  partyAffiliation: varchar('party_affiliation', { length: 100 }),
  legislativeLevel: legislativeLevelEnum('legislative_level').notNull(),
  electoralDistrictId: uuid('electoral_district_id').references(() => electoralDistricts.id, { onDelete: 'restrict' }),
  customDapilName: varchar('custom_dapil_name', { length: 100 }),
  personalCoverage: text('personal_coverage').array().default([]),
  commissionId: uuid('commission_id'),
  commissionName: varchar('commission_name', { length: 150 }),
  photoUrl: text('photo_url'),
  gender: varchar('gender', { length: 20 }),
  birthDate: varchar('birth_date', { length: 30 }),
  education: text('education'),
  courses: text('courses').array(),
  issueInterests: text('issue_interests').array(),
  isVerified: boolean('is_verified').default(false).notNull(),
  accountStatus: varchar('account_status', { length: 30 }).default('ACTIVE').notNull(),
  username: varchar('username', { length: 50 }).unique(),
  mustChangePassword: boolean('must_change_password').default(false).notNull(),
  temporaryPasswordPlaintextPreview: varchar('temporary_password_plaintext_preview', { length: 100 }),
  passwordChangedAt: timestamp('password_changed_at', { withTimezone: true }),
  internalNotes: text('internal_notes'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

export const emailOtps = pgTable('email_otps', {
  id: uuid('id').defaultRandom().primaryKey(),
  email: varchar('email', { length: 255 }).notNull(),
  otpCode: varchar('otp_code', { length: 10 }).notNull(),
  expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
  isUsed: boolean('is_used').default(false).notNull(),
  attempts: integer('attempts').default(0).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

export const systemAdmins = pgTable('system_admins', {
  id: uuid('id').defaultRandom().primaryKey(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  passwordHash: varchar('password_hash', { length: 255 }).notNull(),
  fullName: varchar('full_name', { length: 150 }).notNull(),
  role: varchar('role', { length: 50 }).default('SUPERADMIN').notNull(),
  isActive: boolean('is_active').default(true).notNull(),
  avatarUrl: text('avatar_url'),
  lastLoginAt: timestamp('last_login_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

export const masterPoliticalParties = pgTable('master_political_parties', {
  id: uuid('id').defaultRandom().primaryKey(),
  code: varchar('code', { length: 30 }).notNull().unique(),
  name: varchar('name', { length: 150 }).notNull(),
  ballotNumber: integer('ballot_number'),
  primaryColor: varchar('primary_color', { length: 20 }).notNull(),
  secondaryColor: varchar('secondary_color', { length: 20 }),
  logoUrl: text('logo_url'),
  description: text('description'),
  isActive: boolean('is_active').default(true).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

export const masterCommissions = pgTable('master_commissions', {
  id: uuid('id').defaultRandom().primaryKey(),
  legislativeLevel: legislativeLevelEnum('legislative_level').notNull(),
  code: varchar('code', { length: 50 }).notNull(),
  name: varchar('name', { length: 150 }).notNull(),
  focusAreas: text('focus_areas').array(),
  partnerMinistries: text('partner_ministries').array(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

export const tenantActivityLogs = pgTable('tenant_activity_logs', {
  id: uuid('id').defaultRandom().primaryKey(),
  tenantId: uuid('tenant_id').references(() => tenantMembers.id, { onDelete: 'cascade' }).notNull(),
  activityType: varchar('activity_type', { length: 50 }).notNull(),
  category: varchar('category', { length: 30 }).default('AUTH').notNull(),
  description: text('description').notNull(),
  ipAddress: varchar('ip_address', { length: 45 }),
  userAgent: text('user_agent'),
  metadata: jsonb('metadata'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});
