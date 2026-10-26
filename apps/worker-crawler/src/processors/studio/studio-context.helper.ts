import { eq } from 'drizzle-orm';
import {
  db,
  masterPoliticalParties,
  portalThemeSettings,
  portalConfigs,
} from '@polaris/database';
import { redisConnection } from '../../config/redis.connection.js';

export class StudioContextHelper {
  /**
   * Mengambil warna identitas resmi partai politik atau kustomisasi tema portal tenant
   */
  public static async resolveTenantBrandColor(
    tenantId: string,
    partyAffiliation?: string | null
  ): Promise<string> {
    let resolvedBrandHex = '#9E0B0F';
    try {
      if (partyAffiliation) {
        const [party] = await db
          .select({ primaryColor: masterPoliticalParties.primaryColor })
          .from(masterPoliticalParties)
          .where(eq(masterPoliticalParties.code, partyAffiliation))
          .limit(1);
        if (party?.primaryColor) {
          resolvedBrandHex = party.primaryColor;
        }
      }
      const [theme] = await db
        .select({ primaryHexColor: portalThemeSettings.primaryHexColor })
        .from(portalThemeSettings)
        .innerJoin(portalConfigs, eq(portalThemeSettings.portalId, portalConfigs.id))
        .where(eq(portalConfigs.tenantId, tenantId))
        .limit(1);
      if (theme?.primaryHexColor) {
        resolvedBrandHex = theme.primaryHexColor;
      }
    } catch (colorErr) {
      console.warn(`[StudioProcessor] Gagal memuat warna tema tenant, fallback:`, colorErr);
    }
    return resolvedBrandHex;
  }

  public static async emitProgress(
    tenantId: string,
    jobId: string,
    percent: number,
    step: string,
    status: 'RUNNING' | 'COMPLETED' | 'FAILED' = 'RUNNING',
    resultUrl?: string,
    errorDetails?: string,
    textReady?: boolean,
    publicationId?: string
  ) {
    const payload = {
      jobId,
      percent,
      step,
      status,
      resultUrl,
      errorDetails,
      textReady: textReady ?? false,
      publicationId,
      timestamp: Date.now(),
    };
    const serialized = JSON.stringify(payload);
    await Promise.all([
      redisConnection.publish(`realtime:progress:${tenantId}`, serialized).catch(() => null),
      redisConnection.set(`job:progress:${tenantId}:${jobId}`, serialized, 'EX', 3600).catch(() => null),
    ]);
  }

  public static async emitNotification(
    tenantId: string,
    title: string,
    message: string,
    link: string = '/studio/artikel'
  ) {
    const payload = {
      id: `notif_${Date.now()}`,
      title,
      message,
      category: 'ARTICLE',
      link,
      timestamp: Date.now(),
    };
    const serialized = JSON.stringify(payload);
    await Promise.all([
      redisConnection.publish(`realtime:notifications:${tenantId}`, serialized).catch(() => null),
      redisConnection.lpush(`history:notifications:${tenantId}`, serialized).catch(() => null),
      redisConnection.ltrim(`history:notifications:${tenantId}`, 0, 19).catch(() => null),
    ]);
  }
}
