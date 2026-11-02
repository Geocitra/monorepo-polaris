import { Injectable, Logger } from '@nestjs/common';
import { db, platformFeatureFlags, eq, asc } from '@polaris/database';
import {
  PlatformFeatureFlagKey,
  PlatformFeatureFlagRecord,
  SocialFeatureFlagsResponse,
} from '@polaris/shared-types';

@Injectable()
export class PlatformSettingsService {
  private readonly logger = new Logger(PlatformSettingsService.name);
  private cache: Map<string, { enabled: boolean; expiresAt: number }> = new Map();
  private readonly CACHE_TTL_MS = 15000; // Cache 15 detik untuk performa tinggi

  /**
   * Mengecek apakah sebuah fitur aktif di tingkat platform.
   * Prinsip: FAIL-CLOSED. Jika query error atau record belum dibuat, default selalu FALSE (nonaktif).
   */
  async isFeatureEnabled(flagKey: string): Promise<boolean> {
    const cached = this.cache.get(flagKey);
    if (cached && Date.now() < cached.expiresAt) {
      return cached.enabled;
    }

    try {
      const [row] = await db
        .select()
        .from(platformFeatureFlags)
        .where(eq(platformFeatureFlags.flagKey, flagKey))
        .limit(1);

      const isEnabled = Boolean(row?.enabled);
      this.cache.set(flagKey, {
        enabled: isEnabled,
        expiresAt: Date.now() + this.CACHE_TTL_MS,
      });
      return isEnabled;
    } catch (err: any) {
      this.logger.error(
        `[PlatformSettings] Gagal membaca flag "${flagKey}": ${err.message}. Menerapkan fail-closed fallback: false.`
      );
      return false;
    }
  }

  /**
   * Mengambil status seluruh sakelar auto-publish media sosial.
   */
  async getSocialFeatureFlags(): Promise<SocialFeatureFlagsResponse> {
    const [instagram, threads, tiktok, xTwitter] = await Promise.all([
      this.isFeatureEnabled(PlatformFeatureFlagKey.AUTO_PUBLISH_INSTAGRAM),
      this.isFeatureEnabled(PlatformFeatureFlagKey.AUTO_PUBLISH_THREADS),
      this.isFeatureEnabled(PlatformFeatureFlagKey.AUTO_PUBLISH_TIKTOK),
      this.isFeatureEnabled(PlatformFeatureFlagKey.AUTO_PUBLISH_X_TWITTER),
    ]);

    return {
      AUTO_PUBLISH_INSTAGRAM: instagram,
      AUTO_PUBLISH_THREADS: threads,
      AUTO_PUBLISH_TIKTOK: tiktok,
      AUTO_PUBLISH_X_TWITTER: xTwitter,
    };
  }

  /**
   * Mengambil semua feature flags untuk panel Superadmin dengan urutan stabil (deterministik).
   */
  async getAllFlags(): Promise<PlatformFeatureFlagRecord[]> {
    try {
      const rows = await db
        .select()
        .from(platformFeatureFlags)
        .orderBy(asc(platformFeatureFlags.flagKey));

      return rows.map((r) => ({
        flagKey: r.flagKey,
        enabled: r.enabled,
        updatedBy: r.updatedBy,
        updatedAt: r.updatedAt.toISOString(),
      }));
    } catch (err: any) {
      this.logger.error(`[PlatformSettings] Gagal mengambil seluruh flags: ${err.message}`);
      return [];
    }
  }

  /**
   * Memperbarui sakelar fitur (Hanya diizinkan via Superadmin).
   */
  async updateFlag(
    flagKey: string,
    enabled: boolean,
    updatedBy?: string
  ): Promise<PlatformFeatureFlagRecord> {
    const [existing] = await db
      .select()
      .from(platformFeatureFlags)
      .where(eq(platformFeatureFlags.flagKey, flagKey))
      .limit(1);

    let record: typeof platformFeatureFlags.$inferSelect;

    if (existing) {
      const [updated] = await db
        .update(platformFeatureFlags)
        .set({
          enabled,
          updatedBy: updatedBy || 'SUPERADMIN',
          updatedAt: new Date(),
        })
        .where(eq(platformFeatureFlags.flagKey, flagKey))
        .returning();
      record = updated;
    } else {
      const [created] = await db
        .insert(platformFeatureFlags)
        .values({
          flagKey,
          enabled,
          updatedBy: updatedBy || 'SUPERADMIN',
          updatedAt: new Date(),
        })
        .returning();
      record = created;
    }

    // Invalidate local in-memory cache
    this.cache.delete(flagKey);

    this.logger.log(
      `[PlatformSettings] Flag "${flagKey}" diubah menjadi ${enabled} oleh "${updatedBy || 'SUPERADMIN'}"`
    );

    return {
      flagKey: record.flagKey,
      enabled: record.enabled,
      updatedBy: record.updatedBy,
      updatedAt: record.updatedAt.toISOString(),
    };
  }

  clearCache(): void {
    this.cache.clear();
  }
}
