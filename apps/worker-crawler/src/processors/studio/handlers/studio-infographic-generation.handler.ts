import fs from 'fs';
import path from 'path';
import { Job } from 'bullmq';
import { and, eq, sql } from 'drizzle-orm';
import {
  db,
  contentPublications,
  mediaAssets,
  tenantQuotaLedgers,
  tenantMembers,
  electoralDistricts,
  mediaDiscourses,
  findSimilarKnowledgeChunks,
  withTenantContext,
} from '@polaris/database';
import {
  OpenAIAIEngineAdapter,
  synthesizeArtCollageCopy,
} from '@polaris/ai-engine';
import {
  CloudflareR2StorageAdapter,
  CreativePosterCompositor,
} from '@polaris/storage';
import { ContentStatus, AssetType } from '@polaris/shared-types';
import { AiCostCalculator } from '@polaris/core-domain';
import { StudioGenerationJobPayload } from '../../../queues/studio.queue.js';
import { StudioContextHelper } from '../studio-context.helper.js';

/**
 * Mencari path file gambar template infografis secara absolut
 * terlepas dari process.cwd() saat worker dieksekusi
 */
function resolveInfographicTemplatePath(fileName: string): string {
  const possibleRoots = [
    process.cwd(),
    path.resolve(process.cwd(), '../..'),
    path.resolve(process.cwd(), '..'),
    'C:/Users/Geocitra1/Documents/dev/monorepo-polaris',
  ];
  for (const root of possibleRoots) {
    const candidate = path.resolve(root, 'uploads/references/infografis', fileName);
    if (fs.existsSync(candidate)) return candidate;
  }
  return path.resolve(process.cwd(), 'uploads/references/infografis', fileName);
}

export class StudioInfographicGenerationHandler {
  public static async execute(
    job: Job<StudioGenerationJobPayload>,
    aiEngine: OpenAIAIEngineAdapter,
    storageAdapter: CloudflareR2StorageAdapter
  ): Promise<void> {
    const data = job.data;
    const { tenantId, publicationId, jobId } = data;

    console.log(
      `[StudioProcessor] Memulai pemrosesan INFOGRAPHIC_ONLY #${job.id} (PubID: ${publicationId})...`
    );

    try {
      await StudioContextHelper.emitProgress(
        tenantId,
        jobId,
        15,
        'Menganalisis konsep visual dan profil daerah...'
      );

      // 1. Ambil profil dewan & dapil
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
        })
        .from(tenantMembers)
        .where(eq(tenantMembers.id, tenantId))
        .limit(1);

      let dapilName = member?.customDapil || 'Dapil';
      let targetRegion = member?.personalCoverage?.[0] || 'NASIONAL';

      if (member?.dapilId) {
        const [dapil] = await db
          .select({
            dapilName: electoralDistricts.dapilName,
            regencyCoverage: electoralDistricts.regencyCoverage,
          })
          .from(electoralDistricts)
          .where(eq(electoralDistricts.id, member.dapilId))
          .limit(1);
        if (dapil) {
          if (!member.customDapil) dapilName = dapil.dapilName;
          if (!member.personalCoverage || member.personalCoverage.length === 0) {
            targetRegion = dapil.regencyCoverage?.[0] || 'NASIONAL';
          }
        }
      }

      // Bersihkan teks prompt dari constraint teknis
      let cleanPrompt = (data.topic || '')
        .replace(/^Infografis Publik:\s*/i, '')
        .replace(/^Poster Publik:\s*/i, '')
        .replace(/\.\s*STRICT CONSTRAINT:.*$/i, '')
        .trim();

      if (member?.fullName) {
        const escapedName = member.fullName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        cleanPrompt = cleanPrompt.replace(new RegExp(`\\b${escapedName}\\b`, 'gi'), '');
      }

      cleanPrompt = cleanPrompt
        .replace(/menampilkan\s+[^,.]+(dengan|yang|untuk)/gi, '$1')
        .replace(/tokoh\s+[^,.]+/gi, '')
        .replace(/dengan latar belakang/gi, 'berlatar')
        .replace(/\s{2,}/g, ' ')
        .trim();

      const headlineText =
        data.headline ||
        (cleanPrompt.length <= 80 ? cleanPrompt : cleanPrompt.slice(0, 77) + '...');

      // Resolusi identitas representasi resmi (Dewan/Tokoh Publik)
      const roleIdentity = StudioContextHelper.resolveSignatureAndHeader(member, dapilName);

      // Ambil foto tokoh bila ada
      let subjectPhotoBuffer: Buffer | undefined = undefined;
      const candidatePhotoUrl =
        (data as any).customPhotoUrl ||
        member?.photoUrl ||
        (Array.isArray(member?.photoGallery) && member.photoGallery[0]);

      if (candidatePhotoUrl && typeof candidatePhotoUrl === 'string') {
        try {
          if (candidatePhotoUrl.startsWith('data:')) {
            const base64Part = candidatePhotoUrl.split(',')[1] || candidatePhotoUrl;
            subjectPhotoBuffer = Buffer.from(base64Part, 'base64');
          } else if (candidatePhotoUrl.startsWith('http://') || candidatePhotoUrl.startsWith('https://')) {
            const resp = await fetch(candidatePhotoUrl, { signal: AbortSignal.timeout(6000) });
            if (resp.ok) {
              subjectPhotoBuffer = Buffer.from(await resp.arrayBuffer());
            }
          }
        } catch (photoErr: any) {
          console.warn(`[StudioInfographic] Gagal mengambil foto tokoh: ${photoErr.message}`);
        }
      }

      const galleryPhotos: string[] = (Array.isArray(member?.photoGallery) ? member.photoGallery : []).filter(
        (url): url is string => typeof url === 'string' && url.length > 0
      );

      const tenantBrandHex = await StudioContextHelper.resolveTenantBrandColor(
        tenantId,
        member?.partyAffiliation
      );

      // Fast Grounding Lookup (RAG Perda & Diskursus Media Daerah)
      let groundedContextSummary = `Isu Utama: ${cleanPrompt}. Wilayah: ${dapilName} (${targetRegion}). Narasi: Edukasi publik, kebijakan solutif dan transparan.`;
      try {
        const ragSnippets: string[] = [];

        // 1. Vector Search Regulasi Daerah
        try {
          const embedRes = await aiEngine.generateEmbedding(cleanPrompt, tenantId);
          if (embedRes?.embedding && Array.isArray(embedRes.embedding) && embedRes.embedding.length === 1536) {
            const chunks = await findSimilarKnowledgeChunks(embedRes.embedding, 3, targetRegion, 0.55);
            if (chunks && chunks.length > 0) {
              ragSnippets.push(
                'KUTIPAN REGULASI & DATA DAERAH:\n' +
                  chunks
                    .map((c) => `- [${c.structuralReference || 'Regulasi'}]: ${c.chunkContent.slice(0, 300)}`)
                    .join('\n')
              );
            }
          }
        } catch (ragErr: any) {
          console.warn(`[StudioInfographic] Fast RAG lookup skipped: ${ragErr.message}`);
        }

        // 2. Berita Lokal Terbaru dari mediaDiscourses
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
            .limit(3);

          if (recentNews && recentNews.length > 0) {
            ragSnippets.push(
              'BERITA & DISKURSUS MEDIA LOKAL:\n' +
                recentNews
                  .map((n) => `- ${n.title}: ${n.summary.slice(0, 200)}`)
                  .join('\n')
            );
          }
        } catch (newsErr: any) {
          console.warn(`[StudioInfographic] Local news lookup skipped: ${newsErr.message}`);
        }

        if (ragSnippets.length > 0) {
          groundedContextSummary = [
            `TOPIK INFOGRAFIS: ${cleanPrompt}`,
            `WILAYAH DAPIL: ${dapilName} (${targetRegion})`,
            ...ragSnippets,
          ].join('\n\n');
        }
      } catch (lookupErr: any) {
        console.warn(`[StudioInfographic] Grounding context lookup error: ${lookupErr.message}`);
      }

      await StudioContextHelper.emitProgress(
        tenantId,
        jobId,
        25,
        'Memilih template infografis terkurasi...'
      );

      // 2. Pilih salah satu dari 5 template infografis resmi
      const infographicArchetypeList = [
        'INFOGRAPHIC_NARRATIVE_WAVE',
        'INFOGRAPHIC_CHRONICLE_GRID',
        'INFOGRAPHIC_RADIAL_CLOCK',
        'INFOGRAPHIC_ADVOCACY_PILLARS',
        'INFOGRAPHIC_VISIONARY_TIMELINE',
      ] as const;

      let chosenArchetype = data.forcedArchetype as string | undefined;
      if (!chosenArchetype || chosenArchetype === 'auto' || !infographicArchetypeList.includes(chosenArchetype as any)) {
        chosenArchetype = infographicArchetypeList[Math.floor(Math.random() * infographicArchetypeList.length)];
      }

      // Map archetype ke nama file template resmi
      let templateRefFileName = 'template-03-radial-clock-chronicle.jpg';
      if (chosenArchetype === 'INFOGRAPHIC_NARRATIVE_WAVE') {
        templateRefFileName = 'template-01-red-wave-narrative.jpg';
      } else if (chosenArchetype === 'INFOGRAPHIC_CHRONICLE_GRID') {
        templateRefFileName = 'template-02-biography-timeline-grid.jpg';
      } else if (chosenArchetype === 'INFOGRAPHIC_ADVOCACY_PILLARS') {
        templateRefFileName = 'template-04-advocacy-data-pillars.jpg';
      } else if (chosenArchetype === 'INFOGRAPHIC_VISIONARY_TIMELINE') {
        templateRefFileName = 'template-05-visionary-milestone-timeline.jpg';
      }

      console.log(`[StudioInfographic] Menggunakan template infografis: ${chosenArchetype} (${templateRefFileName})`);

      // Muat background buffer dari file template
      const templateFullPath = resolveInfographicTemplatePath(templateRefFileName);
      let backgroundBuffer: Buffer;
      if (fs.existsSync(templateFullPath)) {
        backgroundBuffer = fs.readFileSync(templateFullPath);
      } else {
        console.warn(`[StudioInfographic] File template ${templateFullPath} tidak ditemukan, menggunakan kanvas fallback.`);
        backgroundBuffer = Buffer.alloc(0);
      }

      // 3. AI Menghasilkan Teks Editorial yang Relevan Khusus Sesuai Template
      await StudioContextHelper.emitProgress(
        tenantId,
        jobId,
        45,
        'Merumuskan struktur konten dan data infografis...'
      );

      const synthesizedCopy = await synthesizeArtCollageCopy({
        topic: cleanPrompt,
        groundedContext: groundedContextSummary,
        archetype: chosenArchetype as any,
      });

      // 4. Komposisi Tata Letak Presisi Mengikuti Template Asli (1:1 Layout)
      await StudioContextHelper.emitProgress(
        tenantId,
        jobId,
        70,
        `Merender infografis presisi sesuai template (${chosenArchetype})...`
      );

      const composed = await CreativePosterCompositor.composePoster({
        backgroundBuffer,
        subjectPhotoBuffer,
        galleryPhotos,
        headline: synthesizedCopy.headline || headlineText,
        quote: synthesizedCopy.closingLine || `Aspirasi & Kebijakan Terukur // ${dapilName.toUpperCase()}`,
        memberName: member?.fullName || roleIdentity.signature,
        memberTitle: roleIdentity.headerTag || `${member?.commissionName || 'KOMISI DPR RI'} // ${dapilName}`,
        archetype: chosenArchetype as any,
        compositionMode: 'PUBLIC_ADVOCACY',
        synthesizedCopy: {
          ...synthesizedCopy,
          primaryAccent: tenantBrandHex,
        } as any,
        primaryAccentColor: tenantBrandHex,
        canvasWidth: 1080,
        canvasHeight: 1350,
        editionTag: roleIdentity.editionTag || `POLARIS // ${dapilName.toUpperCase()}`,
        outputFormat: 'webp',
        enableVisualQA: false,
      });

      const posterBuffer: Buffer = composed.buffer;
      const posterSizeBytes: number = composed.sizeBytes;
      const promptUsedJson = JSON.stringify({
        engine: 'INFOGRAPHIC_TEMPLATE_COMPOSITOR_V2',
        archetype: chosenArchetype,
        templateReference: templateRefFileName,
        headline: synthesizedCopy.headline,
        kicker: synthesizedCopy.kicker,
        pointsCount: synthesizedCopy.points?.length || 0,
      });

      console.log(
        `[StudioInfographic] Sukses merender infografis dengan layout template ${chosenArchetype} (${posterSizeBytes} bytes)`
      );

      await StudioContextHelper.emitProgress(tenantId, jobId, 85, 'Menyimpan aset infografis HD...');

      // 5. Multi-tier upload
      let finalPublicUrl = '';
      let finalSizeBytes = posterSizeBytes;
      const destPath = `posters/${tenantId}/${Date.now()}-${publicationId}.webp`;

      try {
        const uploadResult = await storageAdapter.uploadBuffer(posterBuffer, {
          destinationPath: destPath,
          contentType: 'image/webp',
          contentLength: posterSizeBytes,
        });
        finalPublicUrl = uploadResult.publicUrl;
      } catch (storageErr) {
        console.warn(`[StudioProcessor] Buffer upload gagal, beralih ke fallback:`, storageErr);
        finalPublicUrl = `data:image/webp;base64,${posterBuffer.toString('base64')}`;
      }

      // 6. Simpan ke database
      await withTenantContext(tenantId, async (tx) => {
        await tx
          .delete(mediaAssets)
          .where(
            and(
              eq(mediaAssets.publicationId, publicationId),
              eq(mediaAssets.assetType, AssetType.DALLE_POSTER)
            )
          );

        await tx.insert(mediaAssets).values({
          publicationId,
          assetType: AssetType.DALLE_POSTER,
          r2StorageUrl: finalPublicUrl,
          cdnPublicUrl: finalPublicUrl,
          promptUsed: promptUsedJson,
          mimeType: 'image/webp',
          fileSizeBytes: finalSizeBytes,
        });

        await tx
          .update(contentPublications)
          .set({
            title: synthesizedCopy.headline || headlineText,
            excerpt: `Infografik Publik: ${synthesizedCopy.headline || headlineText}`,
            bodyContentMarkdown: `# ${synthesizedCopy.headline || headlineText}\n\n![${synthesizedCopy.headline || headlineText}](${finalPublicUrl})\n\n*Dipublikasikan melalui Studio Infografis Polaris Gov.*`,
            wordCount: 0,
            status: ContentStatus.DRAFT,
            updatedAt: new Date(),
          })
          .where(eq(contentPublications.id, publicationId));

        const currentMonth = new Date().toISOString().slice(0, 7);
        await tx
          .insert(tenantQuotaLedgers)
          .values({
            tenantId,
            billingCycleMonth: currentMonth,
            articleLimit: 0,
            articleUsed: 0,
            dalleLimit: 0,
            dalleUsed: 1,
            totalTokensConsumed: 400,
            estimatedCostUsd: String(AiCostCalculator.DALLE3_COST_PER_IMAGE_USD),
          })
          .onConflictDoUpdate({
            target: [tenantQuotaLedgers.tenantId, tenantQuotaLedgers.billingCycleMonth],
            set: {
              dalleUsed: sql`${tenantQuotaLedgers.dalleUsed} + 1`,
              totalTokensConsumed: sql`${tenantQuotaLedgers.totalTokensConsumed} + 400`,
              estimatedCostUsd: sql`${tenantQuotaLedgers.estimatedCostUsd} + ${AiCostCalculator.DALLE3_COST_PER_IMAGE_USD}`,
              updatedAt: new Date(),
            },
          });
      });

      await StudioContextHelper.emitProgress(
        tenantId,
        jobId,
        100,
        'Infografis selesai dan siap digunakan!',
        'COMPLETED',
        finalPublicUrl,
        undefined,
        true,
        publicationId
      );

      await StudioContextHelper.emitNotification(
        tenantId,
        'Infografis Selesai!',
        `Infografis visual "${synthesizedCopy.headline || headlineText}" berhasil dibuat.`,
        '/studio/infografis'
      );

      console.log(`[StudioProcessor] Tugas INFOGRAPHIC_ONLY #${job.id} selesai 100% dengan sukses.`);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      console.error(`[StudioProcessor] Kegagalan INFOGRAPHIC_ONLY #${job.id}: ${message}`);

      await withTenantContext(tenantId, async (tx) =>
        tx
          .update(contentPublications)
          .set({
            status: ContentStatus.DRAFT,
            excerpt: `[Pemrosesan Visual Gagal] ${message.slice(0, 450)}`,
            updatedAt: new Date(),
          })
          .where(
            and(
              eq(contentPublications.id, publicationId),
              eq(contentPublications.status, ContentStatus.GENERATING)
            )
          )
      ).catch(() => null);

      await StudioContextHelper.emitProgress(
        tenantId,
        jobId,
        100,
        `Pemrosesan infografis gagal: ${message}`,
        'FAILED',
        undefined,
        message
      );
      throw error;
    }
  }
}
