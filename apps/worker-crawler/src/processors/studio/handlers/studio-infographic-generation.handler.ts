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
import { OpenAIAIEngineAdapter, AiTelemetryService } from '@polaris/ai-engine';
import {
  CloudflareR2StorageAdapter,
  CreativePosterCompositor,
  ChromiumPosterCompositor,
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
          commissionName: tenantMembers.commissionName,
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
      const quoteText = `Transparansi Kebijakan dan Aspirasi Publik // ${dapilName.toUpperCase()}`;

      // Keputusan Desain Mutlak: AI tidak merender wajah tokoh dan sistem tidak menaruh foto tokoh pada poster
      const subjectPhotoBuffer: Buffer | undefined = undefined;
      const compositionMode: 'PUBLIC_ADVOCACY' = 'PUBLIC_ADVOCACY';

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
        35,
        'Merumuskan naskah editorial dan komposisi visual...'
      );

      let posterBuffer: Buffer | null = null;
      let posterSizeBytes = 0;
      let promptUsedJson = '';

      const useArtCollageEngine = process.env.POSTER_ENGINE_MODE !== 'legacy';

      if (useArtCollageEngine) {
        try {
          console.log(
            `[StudioInfographic] Menjalankan Art-Collage Pipeline v3 (Zero-Box + Vision Locator)...`
          );
          const artCollage = await aiEngine.generateArtCollagePoster({
            topic: cleanPrompt,
            groundedContextSummary,
            forcedArchetype: (data.forcedArchetype as any) || undefined,
            tenantBrandHex,
            tenantId,
            variationKey: `${publicationId}:${jobId}`,
          });

          const memberSignature = member?.fullName
            ? `${member.fullName} — ${member.commissionName || 'KOMISI DPR RI'} // ${dapilName}`
            : `ANGGOTA DEWAN // ${dapilName}`;

          await StudioContextHelper.emitProgress(
            tenantId,
            jobId,
            70,
            'Merender tipografi Chromium Zero-Box tanpa kotak PowerPoint...'
          );

          let composed: { buffer: Buffer; sizeBytes: number; detectedLuminance: number; blendModeUsed: string };
          composed = await ChromiumPosterCompositor.compose({
            canvasBuffer: artCollage.imageBuffer,
            copy: artCollage.copy,
            zones: artCollage.layout,
            palette: {
              accentHex: artCollage.mutation.palette.accentHex,
              secondaryHex: artCollage.mutation.palette.secondaryHex,
            },
            signature: memberSignature,
            editionTag: `POLARIS // ${dapilName.toUpperCase()}`,
            textToneHint: artCollage.layout.textTone,
          });

          posterBuffer = composed.buffer;
          posterSizeBytes = composed.sizeBytes;
          promptUsedJson = JSON.stringify({
            engine: 'ART_COLLAGE_V3',
            blueprintId: artCollage.blueprintId,
            archetype: artCollage.archetype,
            referenceFile: artCollage.referenceFile,
            usedStyleReference: artCollage.usedStyleReference,
            mutation: artCollage.mutation,
            layout: artCollage.layout,
            imagePrompt: artCollage.imagePrompt,
            imageProvider: artCollage.imageProvider,
            detectedLuminance: composed.detectedLuminance,
            blendModeUsed: composed.blendModeUsed,
          });
        } catch (artCollageErr: any) {
          console.warn(
            `[StudioInfographic] Art-Collage engine mengalami kendala (${artCollageErr.message}), beralih ke engine cadangan...`
          );
        }
      }

      // Fallback legacy bila mode legacy dipaksa atau art-collage gagal
      if (!posterBuffer) {
        // 3. Generate background visual tanpa teks
        const backgroundResult = await aiEngine.generateCreativePosterBackground({
          topic: cleanPrompt,
          groundedContextSummary,
          compositionMode,
          forcedArchetype: (data.forcedArchetype as any) || undefined,
          tenantBrandHex,
          tenantId,
        });

        // 4. Unduh background buffer
        let backgroundBuffer: Buffer;
        if (backgroundResult.temporaryImageUrl.startsWith('data:')) {
          const base64Part = backgroundResult.temporaryImageUrl.split(',')[1] || '';
          backgroundBuffer = Buffer.from(base64Part, 'base64');
        } else {
          const resp = await fetch(backgroundResult.temporaryImageUrl);
          backgroundBuffer = Buffer.from(await resp.arrayBuffer());
        }

        await StudioContextHelper.emitProgress(
          tenantId,
          jobId,
          70,
          'Merender tipografi grafis resolusi tinggi...'
        );

        // 5. Komposisi deterministik Satori
        const composedPoster = await CreativePosterCompositor.composePoster({
          backgroundBuffer,
          subjectPhotoBuffer,
          headline: headlineText,
          quote: quoteText,
          memberName: member?.fullName || 'ANGGOTA DEWAN',
          memberTitle: `${member?.commissionName || 'KOMISI DPR RI'} // ${dapilName}`,
          archetype: backgroundResult.blueprint.archetype,
          compositionMode,
          synthesizedCopy: backgroundResult.compiledPrompt.synthesizedCopy,
          primaryAccentColor:
            backgroundResult.blueprint.colorPalette.primaryAccent || tenantBrandHex,
          canvasWidth: backgroundResult.compiledPrompt.canvasDimensions.width,
          canvasHeight: backgroundResult.compiledPrompt.canvasDimensions.height,
          editionTag: `POLARIS // ${dapilName.toUpperCase()}`,
          outputFormat: 'webp',
          compositionPlan: backgroundResult.compiledPrompt.compositionPlan,
          enableVisualQA: true,
          autoHealContrast: true,
        });

        // Catat metrik evaluasi visual poster ke telemetry
        if (composedPoster.qaReport) {
          AiTelemetryService.recordPosterQAMetrics({
            tenantId,
            archetype: backgroundResult.blueprint.archetype,
            score: composedPoster.qaReport.score,
            passed: composedPoster.qaReport.passed,
            issues: composedPoster.qaReport.issues,
            metrics: composedPoster.qaReport.metrics,
            recommendation: composedPoster.qaReport.recommendation,
          }).catch((telErr) =>
            console.warn('[StudioProcessor] QA telemetry write skipped:', telErr?.message)
          );
        }

        posterBuffer = composedPoster.buffer;
        posterSizeBytes = composedPoster.sizeBytes;
        promptUsedJson = JSON.stringify({
          blueprintId: backgroundResult.blueprint.id,
          blueprint: backgroundResult.blueprint.name,
          archetype: backgroundResult.blueprint.archetype,
          compositionPlan: backgroundResult.compiledPrompt.compositionPlan,
          compiledPrompt: backgroundResult.compiledPrompt.englishPrompt,
          qaReport: composedPoster.qaReport,
        });
      }

      await StudioContextHelper.emitProgress(tenantId, jobId, 85, 'Menyimpan aset infografis HD...');

      // 6. Multi-tier upload
      let finalPublicUrl = '';
      let finalSizeBytes = posterSizeBytes;
      const destPath = `posters/${tenantId}/${Date.now()}-${publicationId}.webp`;

      try {
        const uploadResult = await storageAdapter.uploadBuffer(posterBuffer!, {
          destinationPath: destPath,
          contentType: 'image/webp',
          contentLength: posterSizeBytes,
        });
        finalPublicUrl = uploadResult.publicUrl;
      } catch (storageErr) {
        console.warn(`[StudioProcessor] Buffer upload gagal, beralih ke fallback:`, storageErr);
        finalPublicUrl = `data:image/webp;base64,${posterBuffer!.toString('base64')}`;
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
