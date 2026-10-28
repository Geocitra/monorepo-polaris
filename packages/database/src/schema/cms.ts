import { pgTable, uuid, varchar, text, boolean, timestamp, unique, jsonb, integer, index } from 'drizzle-orm/pg-core';
import { tenantMembers } from './identity.js';
import { docTypeEnum, socialPlatformEnum } from './enums.js';

export const portalConfigs = pgTable('portal_configs', {
  id: uuid('id').defaultRandom().primaryKey(),
  tenantId: uuid('tenant_id').notNull().unique().references(() => tenantMembers.id, { onDelete: 'cascade' }),
  subdomainSlug: varchar('subdomain_slug', { length: 63 }).notNull().unique(),
  customDomain: varchar('custom_domain', { length: 255 }).unique(),
  customDomainStatus: varchar('custom_domain_status', { length: 30 }).default('UNVERIFIED').notNull(),
  dnsVerificationToken: varchar('dns_verification_token', { length: 64 }),
  dnsVerificationExpiresAt: timestamp('dns_verification_expires_at', { withTimezone: true }),
  domainVerifiedAt: timestamp('domain_verified_at', { withTimezone: true }),
  isActive: boolean('is_active').default(true).notNull(),
  metaTitle: varchar('meta_title', { length: 150 }),
  metaDescription: text('meta_description'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

export const portalThemeSettings = pgTable('portal_theme_settings', {
  id: uuid('id').defaultRandom().primaryKey(),
  portalId: uuid('portal_id').notNull().unique().references(() => portalConfigs.id, { onDelete: 'cascade' }),
  primaryHexColor: varchar('primary_hex_color', { length: 7 }).default('#1890ff').notNull(),
  secondaryHexColor: varchar('secondary_hex_color', { length: 7 }).default('#001529').notNull(),
  fontFamily: varchar('font_family', { length: 50 }).default('Inter, sans-serif').notNull(),
  heroBannerUrl: text('hero_banner_url'),
  officialPhotoUrl: text('official_photo_url'),
  headlineTagline: varchar('headline_tagline', { length: 255 }),
  bioBiography: text('bio_biography'),
  layoutTemplateId: varchar('layout_template_id', { length: 50 }).default('standard-default').notNull(),
  layoutSchema: jsonb('layout_schema'),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

export const portalDocuments = pgTable('portal_documents', {
  id: uuid('id').defaultRandom().primaryKey(),
  portalId: uuid('portal_id').notNull().references(() => portalConfigs.id, { onDelete: 'cascade' }),
  title: varchar('title', { length: 255 }).notNull(),
  docType: docTypeEnum('doc_type').default('REPORT_TRIWULAN').notNull(),
  description: text('description'),
  fileUrl: text('file_url').notNull(),
  fileSizeBytes: integer('file_size_bytes'),
  downloadCount: integer('download_count').default(0).notNull(),
  publishedAt: timestamp('published_at', { withTimezone: true }).defaultNow().notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

export const socialLinks = pgTable('social_links', {
  id: uuid('id').defaultRandom().primaryKey(),
  portalId: uuid('portal_id').notNull().references(() => portalConfigs.id, { onDelete: 'cascade' }),
  platform: socialPlatformEnum('platform').notNull(),
  profileUrl: text('profile_url').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
}, (t) => ({
  unqPortalPlatform: unique().on(t.portalId, t.platform),
}));

export const portalNewsletterSubscribers = pgTable('portal_newsletter_subscribers', {
  id: uuid('id').defaultRandom().primaryKey(),
  portalId: uuid('portal_id').notNull().references(() => portalConfigs.id, { onDelete: 'cascade' }),
  email: varchar('email', { length: 255 }).notNull(),
  isActive: boolean('is_active').default(true).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
}, (t) => ({
  unqPortalEmail: unique().on(t.portalId, t.email),
  idxPortalSubscribers: index('idx_portal_subscribers').on(t.portalId, t.createdAt),
}));

export const domainRequests = pgTable('domain_requests', {
  id: uuid('id').defaultRandom().primaryKey(),
  tenantId: uuid('tenant_id').notNull().references(() => tenantMembers.id, { onDelete: 'cascade' }),
  requestType: varchar('request_type', { length: 20 }).notNull(), // 'SUBDOMAIN' | 'CUSTOM_DOMAIN'
  requestedDomain: varchar('requested_domain', { length: 255 }).notNull(),
  currentDomain: varchar('current_domain', { length: 255 }),
  status: varchar('status', { length: 30 }).default('PENDING_REVIEW').notNull(), // 'PENDING_REVIEW' | 'DNS_CHECKING' | 'APPROVED' | 'REJECTED'
  adminNotes: text('admin_notes'),
  reviewedByUserId: uuid('reviewed_by_user_id'),
  reviewedAt: timestamp('reviewed_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
}, (t) => ({
  idxDomainRequestsTenant: index('idx_domain_requests_tenant').on(t.tenantId),
  idxDomainRequestsStatus: index('idx_domain_requests_status').on(t.status),
}));

export const subdomainAliases = pgTable('subdomain_aliases', {
  id: uuid('id').defaultRandom().primaryKey(),
  tenantId: uuid('tenant_id').notNull().references(() => tenantMembers.id, { onDelete: 'cascade' }),
  oldSubdomainSlug: varchar('old_subdomain_slug', { length: 63 }).notNull().unique(),
  newSubdomainSlug: varchar('new_subdomain_slug', { length: 63 }).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
}, (t) => ({
  idxSubdomainAliasesTenant: index('idx_subdomain_aliases_tenant').on(t.tenantId),
}));

