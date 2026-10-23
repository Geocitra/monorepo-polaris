import { Job } from 'bullmq';
import { and, eq, sql } from 'drizzle-orm';
import {
  db,
  contentPublications,
  mediaAssets,
  tenantQuotaLedgers,
  tenantMembers,
  electoralDistricts,
  withTenantContext,
} from '@polaris/database';
import { OpenAIAIEngineAdapter, AiTelemetryService } from '@polaris/ai-engine';
import {
  CloudflareR2StorageAdapter,
  CreativePosterCompositor,
  ArtCollageCompositor,
  ChromiumPosterCompositor,
} from '@polaris/storage';
import { AssetType } from '@polaris/shared-types';
import { AiCostCalculator } from '@polaris/core-domain';
import { StudioGenerationJobPayload } from '../../../queues/studio.queue.js';
import { StudioContextHelper } from '../studio-context.helper.js';

export class StudioPosterRegenerationHandler {
  public static async execute(
    job: Job<StudioGenerationJobPayload>,
    aiEngine: OpenAIAIEngineAdapter,
    storageAdapter: CloudflareR2StorageAdapter
  ): Promise<void> {
    const { tenantId, publicationId, jobId } = job.data;

    try {
      await StudioContextHelper.emitProgress(
        tenantId,
        jobId,
        20,
        'Memuat naskah tersimpan untuk membuat poster...'
      );

      const article = await withTenantContext(tenantId, async (tx) => {
        const [record] = await tx
          .select({
            title: contentPublications.title,
            content: contentPublications.bodyContentMarkdown,
            excerpt: contentPublications.excerpt,
          })
          .from(contentPublications)
          .where(
            and(
              eq(contentPublications.id, publicationId),
              eq(contentPublications.tenantId, tenantId)
            )
          )
          .limit(1);
        return record;
      });

      if (!article?.content.trim()) {
        throw new Error('Naskah artikel tidak tersedia untuk pembuatan poster.');
      }

      // 1. Ambil data profil dewan dan resolusi dapil
      const [member] = await db
        .select({
          fullName: tenantMembers.fullName,
          partyAffiliation: tenantMembers.partyAffiliation,
          dapilId: tenantMembers.electoralDistrictId,
          customDapil: tenantMembers.customDapilName,
          photoUrl: tenantMembers.photoUrl,
          commissionName: tenantMembers.commissionName,
        })
        .from(tenantMembers)
        .where(eq(tenantMembers.id, tenantId))
        .limit(1);

      let dapilName = member?.customDapil || 'Dapil';
      if (member?.dapilId) {
        const [dapil] = await db
          .select({ dapilName: electoralDistricts.dapilName })
          .from(electoralDistricts)
          .where(eq(electoralDistricts.id, member.dapilId))
          .limit(1);
        if (dapil && !member.customDapil) dapilName = dapil.dapilName;
      }

      // 2. Cek blueprint poster sebelumnya agar regenerasi menghasilkan arketipe/variasi layout yang segar
      let lastBlueprintId: string | undefined;
      const [existingAsset] = await withTenantContext(tenantId, async (tx) => {
        return await tx
          .select({ promptUsed: mediaAssets.promptUsed })
          .from(mediaAssets)
          .where(
            and(
              eq(mediaAssets.publicationId, publicationId),
              eq(mediaAssets.assetType, AssetType.DALLE_POSTER)
            )
          )
          .limit(1);
      });

      if (existingAsset?.promptUsed) {
        try {
          const parsed = JSON.parse(existingAsset.promptUsed);
          lastBlueprintId = parsed.blueprintId || parsed.blueprint;
        } catch {}
      }

      // Keputusan Desain Mutlak: AI tidak merender wajah tokoh dan sistem tidak menaruh foto tokoh pada poster
      const subjectPhotoBuffer: Buffer | undefined = undefined;
      const compositionMode: 'PUBLIC_ADVOCACY' = 'PUBLIC_ADVOCACY';

      const tenantBrandHex = await StudioContextHelper.resolveTenantBrandColor(
        tenantId,
        member?.partyAffiliation
      );

      await StudioContextHelper.emitProgress(
        tenantId,
        jobId,
        40,
        'Menghasilkan kanvas seni kolase baru...'
      );

      // 4. Generate Background Kolase Tanpa Teks via AI Engine
      const articleExcerpt = article.excerpt || '';
      const articleSnippet = (article.content || '').slice(0, 1200);

      const groundedContextSummary = [
        `JUDUL & RINGKASAN EKSEKUTIF ARTIKEL: ${article.title} — ${articleExcerpt}`,
        articleSnippet ? `CUPLIKAN ISI & DATA ARTIKEL:\n${articleSnippet}` : '',
      ]
        .filter(Boolean)
        .join('\n\n')
        .trim();

      let posterBuffer: Buffer | undefined;
      let posterSizeBytes = 0;
      let promptUsedJson = '';
      const destPath = `posters/${tenantId}/${Date.now()}-${publicationId}.webp`;

      const useArtCollageEngine = process.env.POSTER_ENGINE_MODE !== 'legacy';

      if (useArtCollageEngine) {
        try {
          console.log(
            `[StudioPosterRegen] Menjalankan Art-Collage Pipeline v3 (Zero-Box + Vision Locator)...`
          );
          const artCollage = await aiEngine.generateArtCollagePoster({
            topic: article.title,
            groundedContextSummary,
            forcedArchetype: (job.data.forcedArchetype as any) || undefined,
            excludeBlueprintId: lastBlueprintId,
            tenantBrandHex,
            tenantId,
            variationKey: `${publicationId}:regen:${Date.now()}`,
          });

          const memberSignature = member?.fullName
            ? `${member.fullName} — ${member.commissionName || 'KOMISI DPR RI'} // ${dapilName}`
            : `ANGGOTA DEWAN // ${dapilName}`;

          let composed: { buffer: Buffer; sizeBytes: number; detectedLuminance: number; blendModeUsed: string };
          try {
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
          } catch (chromErr: any) {
            console.warn(`[StudioPosterRegen] Chromium compositor gagal (${chromErr.message}), fallback ke Sharp compositor...`);
            composed = await ArtCollageCompositor.compose({
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
          }

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
            `[StudioPosterRegen] Art-Collage engine memberi sinyal (${artCollageErr.message}), beralih ke engine cadangan...`
          );
        }
      }

      // Fallback legacy bila mode legacy dipaksa atau art-collage gagal
      if (!posterBuffer) {
        const backgroundResult = await aiEngine.generateCreativePosterBackground({
          topic: article.title,
          groundedContextSummary,
          compositionMode,
          forcedArchetype: (job.data.forcedArchetype as any) || undefined,
          excludeBlueprintId: lastBlueprintId,
          tenantBrandHex,
          tenantId,
        });

        let backgroundBuffer: Buffer;
        if (backgroundResult.temporaryImageUrl.startsWith('data:')) {
          const base64Part = backgroundResult.temporaryImageUrl.split(',')[1] || '';
          backgroundBuffer = Buffer.from(base64Part, 'base64');
        } else {
          const resp = await fetch(backgroundResult.temporaryImageUrl);
          backgroundBuffer = Buffer.from(await resp.arrayBuffer());
        }

        const headlineText = job.data.headline || article.title;
        const quoteText = article.excerpt?.slice(0, 160) || article.content.slice(0, 160);

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
            backgroundResult.compiledPrompt.synthesizedCopy?.primaryAccent ||
            backgroundResult.blueprint.colorPalette.primaryAccent ||
            tenantBrandHex,
          secondaryAccentColor:
            backgroundResult.compiledPrompt.synthesizedCopy?.secondaryAccent ||
            backgroundResult.blueprint.colorPalette.secondaryAccent,
          canvasWidth: backgroundResult.compiledPrompt.canvasDimensions.width,
          canvasHeight: backgroundResult.compiledPrompt.canvasDimensions.height,
          editionTag: `POLARIS // ${dapilName.toUpperCase()}`,
          outputFormat: 'webp',
          compositionPlan: backgroundResult.compiledPrompt.compositionPlan,
          enableVisualQA: true,
          autoHealContrast: true,
        });

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

      // 7. Unggah hasil komposit ke Cloudflare R2 / Storage
      let finalPublicUrl = '';
      let finalSizeBytes = posterSizeBytes;

      try {
        const uploadResult = await storageAdapter.uploadBuffer(posterBuffer, {
          destinationPath: destPath,
          contentType: 'image/webp',
          contentLength: posterSizeBytes,
        });
        finalPublicUrl = uploadResult.publicUrl;
      } catch (storageErr) {
        console.warn(
          `[StudioPosterRegen] GCS/R2 buffer upload gagal, beralih ke data base64:`,
          storageErr
        );
        finalPublicUrl = `data:image/webp;base64,${posterBuffer.toString('base64')}`;
      }

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
            totalTokensConsumed: 0,
            estimatedCostUsd: String(AiCostCalculator.DALLE3_COST_PER_IMAGE_USD),
          })
          .onConflictDoUpdate({
            target: [tenantQuotaLedgers.tenantId, tenantQuotaLedgers.billingCycleMonth],
            set: {
              dalleUsed: sql`${tenantQuotaLedgers.dalleUsed} + 1`,
              estimatedCostUsd: sql`${tenantQuotaLedgers.estimatedCostUsd} + ${AiCostCalculator.DALLE3_COST_PER_IMAGE_USD}`,
              updatedAt: new Date(),
            },
          });
      });

      await StudioContextHelper.emitProgress(
        tenantId,
        jobId,
        100,
        'Poster berhasil dibuat ulang.',
        'COMPLETED',
        `/studio/artikel/${publicationId}`
      );
      await StudioContextHelper.emitNotification(
        tenantId,
        'Poster Berhasil Dibuat Ulang',
        `Poster untuk naskah "${article.title}" telah diperbarui.`
      );
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      await StudioContextHelper.emitProgress(
        tenantId,
        jobId,
        100,
        'Poster belum berhasil dibuat; naskah tetap aman.',
        'FAILED',
        undefined,
        message
      );
      await StudioContextHelper.emitNotification(
        tenantId,
        'Poster Belum Berhasil Dibuat',
        'Naskah tetap tersimpan. Pembuatan poster dapat dicoba kembali.'
      );
      throw error;
    }
  }
}
