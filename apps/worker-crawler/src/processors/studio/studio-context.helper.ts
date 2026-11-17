import { eq, or, sql } from 'drizzle-orm';
import {
  db,
  masterPoliticalParties,
  portalThemeSettings,
  portalConfigs,
  tenantMembers,
  electoralDistricts,
  mediaDiscourses,
  findSimilarKnowledgeChunks,
} from '@polaris/database';
import { OpenAIAIEngineAdapter } from '@polaris/ai-engine';
import { redisConnection } from '../../config/redis.connection.js';
import { StudioAttachmentPipelineService } from './services/studio-attachment-pipeline.service.js';

export class StudioContextHelper {
  /**
   * Mengambil warna identitas resmi partai politik atau kustomisasi tema portal tenant
   */
  public static async resolveTenantBrandColor(
    tenantId: string,
    partyAffiliation?: string | null
  ): Promise<string> {
    let resolvedBrandHex = '#9E0B0F';
    let partyColorFound = false;

    try {
      if (partyAffiliation && partyAffiliation.trim()) {
        const cleanParty = partyAffiliation.trim();
        const [party] = await db
          .select({ primaryColor: masterPoliticalParties.primaryColor })
          .from(masterPoliticalParties)
          .where(
            or(
              eq(masterPoliticalParties.code, cleanParty),
              eq(masterPoliticalParties.name, cleanParty),
              sql`UPPER(REPLACE(${masterPoliticalParties.code}, '-', '')) = UPPER(REPLACE(${cleanParty}, '-', ''))`
            )
          )
          .limit(1);

        if (party?.primaryColor) {
          resolvedBrandHex = party.primaryColor;
          partyColorFound = true;
        }
      }

      // Periksa tema portal tenant. Catatan: Warna default pendaftaran adalah '#1890ff'.
      // Jika warna tema portal masih default '#1890ff' dan warna partai ditemukan, prioritaskan warna partai!
      const [theme] = await db
        .select({ primaryHexColor: portalThemeSettings.primaryHexColor })
        .from(portalThemeSettings)
        .innerJoin(portalConfigs, eq(portalThemeSettings.portalId, portalConfigs.id))
        .where(eq(portalConfigs.tenantId, tenantId))
        .limit(1);

      if (theme?.primaryHexColor) {
        const isDefaultBlue = theme.primaryHexColor.toLowerCase() === '#1890ff';
        if (!partyColorFound || !isDefaultBlue) {
          resolvedBrandHex = theme.primaryHexColor;
        }
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
    const name = member?.fullName?.trim() || 'POLARIS';
    const level = member?.legislativeLevel;
    const cleanDapil =
      dapilName && dapilName.toLowerCase() !== 'dapil' ? dapilName.toUpperCase() : 'INDONESIA';
    const customPosition = member?.commissionName?.trim()
      ? member.commissionName.trim().toUpperCase()
      : null;

    switch (level) {
      case 'PIMPINAN_LEMBAGA_REKTOR_SWASTA':
        return {
          signature: customPosition ? `${name} // ${customPosition}` : name,
          headerTag: 'DOKUMEN OPINI PUBLIK',
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
          signature: customPosition ? `${name} // ${customPosition}` : name,
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
        const comm = customPosition ? `${customPosition} • ` : '';
        return {
          signature: `${name} // ${comm}DPR RI • ${cleanDapil}`,
          headerTag: 'DOKUMEN ADVOKASI PUBLIK',
          editionTag: `POLARIS // ${cleanDapil}`,
        };
      }
      case 'DPRD_PROVINSI': {
        const comm = customPosition ? `${customPosition} • ` : '';
        return {
          signature: `${name} // ${comm}DPRD PROVINSI • ${cleanDapil}`,
          headerTag: 'DOKUMEN ADVOKASI PUBLIK',
          editionTag: `POLARIS // ${cleanDapil}`,
        };
      }
      case 'DPRD_KABUPATEN_KOTA': {
        const comm = customPosition ? `${customPosition} • ` : '';
        return {
          signature: `${name} // ${comm}DPRD • ${cleanDapil}`,
          headerTag: 'DOKUMEN ADVOKASI PUBLIK',
          editionTag: `POLARIS // ${cleanDapil}`,
        };
      }
      default:
        return {
          signature: customPosition ? `${name} // ${customPosition}` : name,
          headerTag: 'DOKUMEN ANALISIS PUBLIK',
          editionTag: `POLARIS // ${cleanDapil}`,
        };
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

  /**
   * Resolusi terpusat profil tokoh (Pejabat Publik, Pejabat Swasta, Tokoh Publik, Tokoh Swasta)
   * beserta cakupan wilayah kerjanya.
   */
  public static async resolveMemberAndRegion(tenantId: string) {
    const [member] = await db
      .select({
        fullName: tenantMembers.fullName,
        partyAffiliation: tenantMembers.partyAffiliation,
        dapilId: tenantMembers.electoralDistrictId,
        customDapil: tenantMembers.customDapilName,
        personalCoverage: tenantMembers.personalCoverage,
        photoUrl: tenantMembers.photoUrl,
        photoGallery: tenantMembers.photoGallery,
        commissionName: tenantMembers.commissionName,
        legislativeLevel: tenantMembers.legislativeLevel,
        issueInterests: tenantMembers.issueInterests,
      })
      .from(tenantMembers)
      .where(eq(tenantMembers.id, tenantId))
      .limit(1);

    let dapilName = member?.customDapil || 'Indonesia';
    let targetRegion = member?.personalCoverage?.[0] || 'NASIONAL';
    let resolvedDapilCode: string | null = member?.customDapil || null;

    if (member?.dapilId) {
      const [dapil] = await db
        .select({
          id: electoralDistricts.id,
          dapilCode: electoralDistricts.dapilCode,
          dapilName: electoralDistricts.dapilName,
          regencyCoverage: electoralDistricts.regencyCoverage,
        })
        .from(electoralDistricts)
        .where(eq(electoralDistricts.id, member.dapilId))
        .limit(1);
      if (dapil) {
        resolvedDapilCode = dapil.dapilCode;
        if (!member.customDapil) dapilName = dapil.dapilName;
        if (!member.personalCoverage || member.personalCoverage.length === 0) {
          targetRegion = dapil.regencyCoverage?.[0] || 'NASIONAL';
        }
      }
    }

    return { member, dapilName, targetRegion, resolvedDapilCode };
  }

  /**
   * Unified Grounding Builder untuk Poster & Infografis Standalone:
   * Menyerap Dokumen Upload User (attachments), Tautan Eksternal, Vector RAG DB, dan Berita Wilayah.
   */
  public static async buildStandaloneGroundingContext(params: {
    tenantId: string;
    cleanTopic: string;
    dapilName: string;
    targetRegion: string;
    resolvedDapilCode: string | null;
    member?: any;
    attachments?: Array<{ name: string; type: string; base64: string }>;
    externalUrls?: string[];
    aiEngine: OpenAIAIEngineAdapter;
  }): Promise<string> {
    const {
      tenantId,
      cleanTopic,
      dapilName,
      targetRegion,
      resolvedDapilCode,
      member,
      attachments,
      externalUrls,
      aiEngine,
    } = params;

    const ragSnippets: string[] = [];
    let queryVector: number[] | null = null;

    // 1. Generate embedding untuk RAG & ekstraksi lampiran
    try {
      const embedRes = await aiEngine.generateEmbedding(cleanTopic, tenantId);
      if (
        embedRes?.embedding &&
        Array.isArray(embedRes.embedding) &&
        embedRes.embedding.length === 1536
      ) {
        queryVector = embedRes.embedding;
      }
    } catch (embedErr: any) {
      console.warn(`[StudioUnifiedGrounding] Embedding lookup skipped: ${embedErr.message}`);
    }

    // 2. Dokumen Upload User (Attachments / DataHub)
    if (attachments && attachments.length > 0) {
      try {
        const parsedDocs = await StudioAttachmentPipelineService.processAttachments({
          tenantId,
          attachments,
          queryVector,
          resolvedDapilCode,
          member,
        });
        if (Array.isArray(parsedDocs) && parsedDocs.length > 0) {
          const docsText = parsedDocs
            .map((d) => `[${d.name}]: ${d.extractedContent.slice(0, 900)}`)
            .join('\n');
          if (docsText.trim()) {
            ragSnippets.push(`DOKUMEN & DATA UPLOAD PENGGUNA:\n${docsText.slice(0, 2200)}`);
          }
        }
      } catch (attErr: any) {
        console.warn(`[StudioUnifiedGrounding] Attachment extraction skipped: ${attErr.message}`);
      }
    }

    // 3. Vector Search Pengetahuan & Regulasi di Database
    if (queryVector) {
      try {
        const chunks = await findSimilarKnowledgeChunks(queryVector, 4, targetRegion, 0.55);
        if (chunks && chunks.length > 0) {
          ragSnippets.push(
            'DATA & REGULASI DATABASE INTERNAL:\n' +
              chunks
                .map((c) => `- [${c.structuralReference || 'Dokumen'}]: ${c.chunkContent.slice(0, 320)}`)
                .join('\n')
          );
        }
      } catch (ragErr: any) {
        console.warn(`[StudioUnifiedGrounding] Vector RAG lookup skipped: ${ragErr.message}`);
      }
    }

    // 4. Berita & Diskursus Media Terbaru dari Database
    try {
      const recentNews = await db
        .select({
          title: mediaDiscourses.articleTitle,
          summary: mediaDiscourses.cleanSummary,
        })
        .from(mediaDiscourses)
        .where(
          targetRegion && targetRegion !== 'NASIONAL'
            ? eq(mediaDiscourses.regionScope, targetRegion)
            : sql`TRUE`
        )
        .orderBy(sql`${mediaDiscourses.publishedAt} DESC`)
        .limit(4);

      if (recentNews && recentNews.length > 0) {
        ragSnippets.push(
          'BERITA & DISKURSUS MEDIA TERKINI:\n' +
            recentNews.map((n) => `- ${n.title}: ${n.summary.slice(0, 220)}`).join('\n')
        );
      }
    } catch (newsErr: any) {
      console.warn(`[StudioUnifiedGrounding] Local news lookup skipped: ${newsErr.message}`);
    }

    // 5. Referensi Tautan Internet Eksternal
    if (externalUrls && externalUrls.length > 0) {
      ragSnippets.push(`RUJUKAN TAUTAN EKSTERNAL:\n${externalUrls.slice(0, 5).map((u) => `- ${u}`).join('\n')}`);
    }

    const personaLabel = member?.fullName
      ? `${member.fullName}${member.commissionName ? ` (${member.commissionName})` : ''}`
      : 'Tokoh / Instansi';

    if (ragSnippets.length > 0) {
      return [
        `TOPIK UTAMA: ${cleanTopic}`,
        `PROFIL & WILAYAH FOKUS: ${personaLabel} — ${dapilName} (${targetRegion})`,
        ...ragSnippets,
      ].join('\n\n');
    }

    return `Isu Utama: ${cleanTopic}. Profil & Wilayah: ${personaLabel} — ${dapilName} (${targetRegion}). Fokus: Informasi solutif, data akurat, dan mudah dipahami publik.`;
  }
}
