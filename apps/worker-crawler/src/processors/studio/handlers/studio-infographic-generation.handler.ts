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
  DynamicInfographicOrchestrator,
} from '@polaris/ai-engine';
import {
  CloudflareR2StorageAdapter,
  ChromiumPosterCompositor,
  DynamicInfographicCompositor,
} from '@polaris/storage';
import { ContentStatus, AssetType } from '@polaris/shared-types';
import { AiCostCalculator } from '@polaris/core-domain';
import { StudioGenerationJobPayload } from '../../../queues/studio.queue.js';
import { StudioContextHelper } from '../studio-context.helper.js';

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

      // Bersihkan teks prompt dari constraint teknis dan nama tokoh agar AI TIDAK PERNAH menggambar manusia/wajah
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
        'Menentukan template & gaya naratif infografis...'
      );

      // Random picker otomatis dari 5 template infografis terkurasi
      const infographicArchetypeList = [
        'INFOGRAPHIC_CHRONICLE_GRID',
        'INFOGRAPHIC_ADVOCACY_PILLARS',
        'INFOGRAPHIC_NARRATIVE_WAVE',
        'INFOGRAPHIC_RADIAL_CLOCK',
        'INFOGRAPHIC_VISIONARY_TIMELINE',
      ] as const;

      let chosenArchetype = data.forcedArchetype as string | undefined;
      if (!chosenArchetype || chosenArchetype === 'auto' || !infographicArchetypeList.includes(chosenArchetype as any)) {
        chosenArchetype = infographicArchetypeList[Math.floor(Math.random() * infographicArchetypeList.length)];
      }

      // Map archetype ke file referensi gambar template di uploads/references/infografis/
      let templateRefFile = 'uploads/references/infografis/template-03-radial-clock-chronicle.jpg';
      if (chosenArchetype === 'INFOGRAPHIC_CHRONICLE_GRID') {
        templateRefFile = 'uploads/references/infografis/template-02-biography-timeline-grid.jpg';
      } else if (chosenArchetype === 'INFOGRAPHIC_NARRATIVE_WAVE') {
        templateRefFile = 'uploads/references/infografis/template-01-red-wave-narrative.jpg';
      } else if (chosenArchetype === 'INFOGRAPHIC_ADVOCACY_PILLARS') {
        templateRefFile = 'uploads/references/infografis/template-04-advocacy-data-pillars.jpg';
      } else if (chosenArchetype === 'INFOGRAPHIC_VISIONARY_TIMELINE') {
        templateRefFile = 'uploads/references/infografis/template-05-visionary-milestone-timeline.jpg';
      }

      let posterBuffer: Buffer | null = null;
      let posterSizeBytes = 0;
      let promptUsedJson = '';

      // =========================================================================
      // AUTONOMOUS AI INFOGRAPHIC PIPELINE (4 LANGKAH DEDIKASI INFOGRAFIS)
      // =========================================================================
      try {
        console.log(`[StudioInfographic] Menjalankan Autonomous AI Infographic Pipeline (${chosenArchetype})...`);

        // Langkah 1, 2, 3: Konten Editorial, Visual Assets, dan Vision Layout Blueprint
        const prepared = await DynamicInfographicOrchestrator.prepare({
          topic: cleanPrompt,
          dapilName,
          targetRegion,
          memberName: roleIdentity.signature,
          memberTitle: roleIdentity.headerTag || `${member?.commissionName || 'KOMISI DPR RI'} // ${dapilName}`,
          ragContextSummary: groundedContextSummary,
          referenceTemplatePath: templateRefFile,
          onProgress: async (percent, status) => {
            await StudioContextHelper.emitProgress(tenantId, jobId, percent, status);
          },
        });

        // Langkah 4: AI Menggabungkan Semua Menjadi Satu Gambar Infografis HD
        await StudioContextHelper.emitProgress(
          tenantId,
          jobId,
          80,
          'AI menyatukan seluruh elemen menjadi gambar infografis HD...'
        );

        const composed = await DynamicInfographicCompositor.compose(
          prepared.content,
          prepared.layoutSpec,
          {
            motifImageBuffer: prepared.visualAssets.motifImageBuffer,
            sectionImageBuffers: prepared.visualAssets.sectionImageBuffers,
            decorations: prepared.visualAssets.decorations,
          },
          {
            outputFormat: 'webp',
            quality: 92,
          }
        );

        posterBuffer = composed.buffer;
        posterSizeBytes = composed.sizeBytes;
        promptUsedJson = JSON.stringify({
          engine: 'AUTONOMOUS_AI_INFOGRAPHIC_V1',
          archetype: chosenArchetype,
          templateReference: templateRefFile,
          mainTitle: prepared.content.mainTitle,
          layoutStyle: prepared.layoutSpec.styleName,
          sectionsCount: prepared.content.sections.length,
        });

        console.log(`[StudioInfographic] Autonomous Infographic sukses terbuat (${posterSizeBytes} bytes)`);
      } catch (dynamicErr: any) {
        console.warn(
          `[StudioInfographic] Autonomous pipeline mengalami kendala (${dynamicErr.message}), beralih ke engine cadangan...`
        );
      }

      // Fallback ke Art-Collage Chromium jika Autonomous Infographic mengalami kendala
      if (!posterBuffer) {
        console.log(`[StudioInfographic] Menjalankan Art-Collage Chromium fallback...`);
        await StudioContextHelper.emitProgress(
          tenantId,
          jobId,
          60,
          'Merender visual alternatif via Chromium Art-Collage...'
        );

        const artCollage = await aiEngine.generateArtCollagePoster({
          topic: cleanPrompt,
          groundedContextSummary,
          forcedArchetype: (chosenArchetype as any) || undefined,
          tenantBrandHex,
          tenantId,
          variationKey: `${publicationId}:${jobId}`,
        });

        const composed = await ChromiumPosterCompositor.compose({
          canvasBuffer: artCollage.imageBuffer,
          copy: artCollage.copy,
          zones: artCollage.layout,
          palette: {
            accentHex: artCollage.mutation.palette.accentHex,
            secondaryHex: artCollage.mutation.palette.secondaryHex,
          },
          signature: roleIdentity.signature,
          headerTag: roleIdentity.headerTag,
          editionTag: roleIdentity.editionTag,
          textToneHint: artCollage.layout.textTone,
          archetype: artCollage.archetype,
        });

        posterBuffer = composed.buffer;
        posterSizeBytes = composed.sizeBytes;
        promptUsedJson = JSON.stringify({
          engine: 'ART_COLLAGE_CHROMIUM_FALLBACK',
          blueprintId: artCollage.blueprintId,
          archetype: artCollage.archetype,
          referenceFile: artCollage.referenceFile,
        });
      }

      await StudioContextHelper.emitProgress(tenantId, jobId, 85, 'Menyimpan aset infografis HD...');

      // 6. Multi-tier upload
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

      // 7. Simpan ke database
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
            title: headlineText,
            excerpt: `Infografik Publik: ${headlineText}`,
            bodyContentMarkdown: `# ${headlineText}\n\n![${headlineText}](${finalPublicUrl})\n\n*Dipublikasikan melalui Studio Infografis Polaris Gov.*`,
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
        `Infografis visual "${headlineText}" berhasil dibuat.`,
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
