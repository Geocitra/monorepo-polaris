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
import { OpenAIAIEngineAdapter } from '@polaris/ai-engine';
import { CloudflareR2StorageAdapter, CreativePosterCompositor } from '@polaris/storage';
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

      // Sesuai preferensi user: Jangan menempelkan foto profil user secara otomatis sebagai overlay poster
      const subjectPhotoBuffer: Buffer | undefined = undefined;
      const compositionMode: 'PUBLIC_ADVOCACY' | 'FIGURE_CENTERPIECE' =
        job.data.compositionMode || 'PUBLIC_ADVOCACY';

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
      const backgroundResult = await aiEngine.generateCreativePosterBackground({
        topic: article.title,
        groundedContextSummary: article.content.slice(0, 1800),
        compositionMode,
        forcedArchetype: (job.data.forcedArchetype as any) || undefined,
        excludeBlueprintId: lastBlueprintId,
        tenantBrandHex,
        tenantId,
      });

      // 5. Unduh buffer background sementara dari AI
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
        75,
        'Merender tipografi vektor Satori & harmonisasi foto...'
      );

      // 6. Komposisi deterministik Satori + Sharp
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
      });

      // 7. Unggah hasil komposit ke Cloudflare R2 / Storage
      let finalPublicUrl = backgroundResult.temporaryImageUrl;
      let finalSizeBytes = composedPoster.sizeBytes;
      const destPath = `posters/${tenantId}/${Date.now()}-${publicationId}.webp`;

      try {
        const uploadResult = await storageAdapter.uploadBuffer(composedPoster.buffer, {
          destinationPath: destPath,
          contentType: 'image/webp',
          contentLength: composedPoster.sizeBytes,
        });
        finalPublicUrl = uploadResult.publicUrl;
      } catch (storageErr) {
        console.warn(
          `[StudioProcessor] GCS/R2 buffer upload gagal, mencoba upload URL cadangan:`,
          storageErr
        );
        try {
          const uploadResult = await storageAdapter.uploadFromUrl(
            backgroundResult.temporaryImageUrl,
            destPath
          );
          finalPublicUrl = uploadResult.publicUrl;
          finalSizeBytes = uploadResult.sizeBytes;
        } catch (fallbackErr) {
          console.warn(
            `[StudioProcessor] Upload URL cadangan juga gagal, beralih ke data base64:`,
            fallbackErr
          );
          finalPublicUrl = `data:image/webp;base64,${composedPoster.buffer.toString('base64')}`;
        }
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
          promptUsed: JSON.stringify({
            blueprintId: backgroundResult.blueprint.id,
            blueprint: backgroundResult.blueprint.name,
            archetype: backgroundResult.blueprint.archetype,
            compiledPrompt: backgroundResult.compiledPrompt.englishPrompt,
          }),
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
