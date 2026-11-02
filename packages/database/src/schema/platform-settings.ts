import { pgTable, varchar, boolean, timestamp } from 'drizzle-orm/pg-core';

/**
 * Sakelar fitur tingkat platform (global, berlaku untuk seluruh tenant).
 * Bukan data tenant, sehingga TIDAK memakai RLS. Hanya Superadmin yang boleh mengubah.
 *
 * Prinsip keamanan: FAIL-CLOSED. Baris yang tidak ada, tabel yang belum dimigrasi,
 * atau kegagalan koneksi database selalu dianggap NONAKTIF (false).
 */
export const platformFeatureFlags = pgTable('platform_feature_flags', {
  flagKey: varchar('flag_key', { length: 100 }).primaryKey(),
  enabled: boolean('enabled').default(false).notNull(),
  updatedBy: varchar('updated_by', { length: 255 }),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

export type PlatformFeatureFlag = typeof platformFeatureFlags.$inferSelect;
export type NewPlatformFeatureFlag = typeof platformFeatureFlags.$inferInsert;

export const FEATURE_FLAG_KEYS = {
  AUTO_PUBLISH_INSTAGRAM: 'AUTO_PUBLISH_INSTAGRAM',
  AUTO_PUBLISH_THREADS: 'AUTO_PUBLISH_THREADS',
  AUTO_PUBLISH_TIKTOK: 'AUTO_PUBLISH_TIKTOK',
  AUTO_PUBLISH_X_TWITTER: 'AUTO_PUBLISH_X_TWITTER',
} as const;

export type FeatureFlagKey = (typeof FEATURE_FLAG_KEYS)[keyof typeof FEATURE_FLAG_KEYS];
