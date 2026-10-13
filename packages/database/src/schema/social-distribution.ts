import {
  pgTable,
  uuid,
  varchar,
  text,
  timestamp,
  customType,
  integer,
  unique,
  index,
} from 'drizzle-orm/pg-core';
import { tenantMembers } from './identity.js';
import { contentPublications } from './content.js';
import { socialPlatformEnum } from './enums.js';

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

export const connectedSocialAccounts = pgTable(
  'connected_social_accounts',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    tenantId: uuid('tenant_id')
      .notNull()
      .references(() => tenantMembers.id, { onDelete: 'cascade' }),
    platform: socialPlatformEnum('platform').default('INSTAGRAM').notNull(),
    accountType: varchar('account_type', { length: 30 }).default('BUSINESS').notNull(),
    externalAccountId: varchar('external_account_id', { length: 100 }).notNull(),
    facebookPageId: varchar('facebook_page_id', { length: 100 }),
    accountHandle: varchar('account_handle', { length: 100 }).notNull(),
    accountName: varchar('account_name', { length: 150 }),
    profilePictureUrl: text('profile_picture_url'),

    // Vault Kredensial Terenkripsi HKDF (UU PDP No. 27/2022)
    encryptedAccessToken: bytea('encrypted_access_token').notNull(),
    tokenIv: varchar('token_iv', { length: 32 }).notNull(),
    tokenExpiresAt: timestamp('token_expires_at', { withTimezone: true }).notNull(),
    tokenLastRefreshedAt: timestamp('token_last_refreshed_at', { withTimezone: true }),

    status: varchar('status', { length: 30 }).default('ACTIVE').notNull(),
    lastErrorMessage: text('last_error_message'),

    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => ({
    unqTenantPlatformAccount: unique().on(t.tenantId, t.platform, t.externalAccountId),
    idxSocialAccountsTenant: index('idx_social_accounts_tenant').on(t.tenantId, t.platform, t.status),
    idxSocialAccountsTokenRefresh: index('idx_social_accounts_token_refresh').on(t.status, t.tokenExpiresAt),
  })
);

export const socialPublishingJobs = pgTable(
  'social_publishing_jobs',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    tenantId: uuid('tenant_id')
      .notNull()
      .references(() => tenantMembers.id, { onDelete: 'cascade' }),
    accountId: uuid('account_id')
      .notNull()
      .references(() => connectedSocialAccounts.id, { onDelete: 'cascade' }),
    publicationId: uuid('publication_id').references(() => contentPublications.id, {
      onDelete: 'set null',
    }),

    mediaFormat: varchar('media_format', { length: 30 }).default('FEED_IMAGE').notNull(),
    originalMediaUrl: text('original_media_url').notNull(),
    formattedMediaUrl: text('formatted_media_url'),
    caption: text('caption').notNull(),

    scheduledAt: timestamp('scheduled_at', { withTimezone: true }).defaultNow().notNull(),
    publishedAt: timestamp('published_at', { withTimezone: true }),

    status: varchar('status', { length: 30 }).default('PENDING').notNull(),

    // Idempotency tracking Meta
    metaContainerId: varchar('meta_container_id', { length: 100 }),
    metaPostId: varchar('meta_post_id', { length: 100 }),
    metaPermalink: text('meta_permalink'),

    retryCount: integer('retry_count').default(0).notNull(),
    maxRetries: integer('max_retries').default(3).notNull(),
    lastErrorMessage: text('last_error_message'),

    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => ({
    idxPublishingJobsSchedule: index('idx_publishing_jobs_schedule').on(t.status, t.scheduledAt),
    idxPublishingJobsTenant: index('idx_publishing_jobs_tenant').on(t.tenantId, t.status),
  })
);
