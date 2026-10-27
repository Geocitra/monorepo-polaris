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

  /**
   * Adaptive Role Profiling: Menghasilkan signature, headerTag, dan editionTag yang tepat
   * sesuai level jabatan (Tokoh Publik, Kepala Daerah, DPD, DPR/DPRD) tanpa em-dash
   * dan tanpa memaksakan "KOMISI DPR RI" atau "PARLEMEN" ke tokoh publik.
   */
  public static resolveSignatureAndHeader(
    member?: {
      fullName?: string | null;
      commissionName?: string | null;
      legislativeLevel?: string | null;
      partyAffiliation?: string | null;
    } | null,
    dapilName: string = 'Indonesia'
  ): { signature: string; headerTag: string; editionTag: string } {
    const name = member?.fullName?.trim() || 'POLARIS // ADVOKASI PUBLIK';
    const level = member?.legislativeLevel || 'DPR_RI';
    const cleanDapil =
      dapilName && dapilName.toLowerCase() !== 'dapil' ? dapilName.toUpperCase() : 'INDONESIA';

    switch (level) {
      case 'PIMPINAN_LEMBAGA_REKTOR_SWASTA':
        return {
          signature: `${name} // TELAAH & OPINI KEBIJAKAN`,
          headerTag: 'DOKUMEN ANALISIS PUBLIK',
          editionTag: `POLARIS // ${cleanDapil}`,
        };
      case 'KEPALA_DAERAH_GUBERNUR':
        return {
          signature: `${name} // GUBERNUR ${cleanDapil}`,
          headerTag: 'DOKUMEN KEBIJAKAN DAERAH',
          editionTag: `POLARIS // ${cleanDapil}`,
        };
      case 'KEPALA_DAERAH_WALIKOTA_BUPATI':
        return {
          signature: `${name} // KEPALA DAERAH ${cleanDapil}`,
          headerTag: 'DOKUMEN KEBIJAKAN DAERAH',
          editionTag: `POLARIS // ${cleanDapil}`,
        };
      case 'PEJABAT_BIROKRAT_DIRJEN_SEKJEN_OPD':
        return {
          signature: `${name} // ${member?.commissionName || 'PELAYANAN PUBLIK'}`,
          headerTag: 'INFORMASI KEBIJAKAN PUBLIK',
          editionTag: `POLARIS // ${cleanDapil}`,
        };
      case 'DPD_RI':
        return {
          signature: `${name} // DPD RI • ${cleanDapil}`,
          headerTag: 'DOKUMEN ADVOKASI DAERAH',
          editionTag: `POLARIS // ${cleanDapil}`,
        };
      case 'MPR_RI':
        return {
          signature: `${name} // MPR RI • ${cleanDapil}`,
          headerTag: 'DOKUMEN KEBIJAKAN KEBANGSAAN',
          editionTag: `POLARIS // ${cleanDapil}`,
        };
      case 'DPR_RI': {
        const comm = member?.commissionName ? `${member.commissionName} • ` : '';
        return {
          signature: `${name} // ${comm}DPR RI • ${cleanDapil}`,
          headerTag: 'DOKUMEN ADVOKASI PUBLIK',
          editionTag: `POLARIS // ${cleanDapil}`,
        };
      }
      case 'DPRD_PROVINSI': {
        const comm = member?.commissionName ? `${member.commissionName} • ` : '';
        return {
          signature: `${name} // ${comm}DPRD PROVINSI • ${cleanDapil}`,
          headerTag: 'DOKUMEN ADVOKASI PUBLIK',
          editionTag: `POLARIS // ${cleanDapil}`,
        };
      }
      case 'DPRD_KABUPATEN_KOTA': {
        const comm = member?.commissionName ? `${member.commissionName} • ` : '';
        return {
          signature: `${name} // ${comm}DPRD • ${cleanDapil}`,
          headerTag: 'DOKUMEN ADVOKASI PUBLIK',
          editionTag: `POLARIS // ${cleanDapil}`,
        };
      }
      default: {
        const comm = member?.commissionName ? `${member.commissionName} • ` : '';
        return {
          signature: `${name} // ${comm}TELAAH & ADVOKASI KEBIJAKAN`,
          headerTag: 'DOKUMEN ADVOKASI PUBLIK',
          editionTag: `POLARIS // ${cleanDapil}`,
        };
      }
    }
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
