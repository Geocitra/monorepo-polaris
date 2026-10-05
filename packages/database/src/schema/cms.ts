import { pgTable, uuid, varchar, text, boolean, timestamp, unique } from 'drizzle-orm/pg-core';
import { tenantMembers } from './identity.js';
import { socialPlatformEnum } from './enums.js';

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
