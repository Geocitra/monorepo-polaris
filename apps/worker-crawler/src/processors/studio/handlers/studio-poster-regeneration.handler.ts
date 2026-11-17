import { Job } from 'bullmq';
import { and, eq, inArray } from 'drizzle-orm';
import {
  contentPublications,
  mediaAssets,
  withTenantContext,
} from '@polaris/database';
import { OpenAIAIEngineAdapter } from '@polaris/ai-engine';
import { CloudflareR2StorageAdapter } from '@polaris/storage';
import { AssetType } from '@polaris/shared-types';
import { StudioGenerationJobPayload } from '../../../queues/studio.queue.js';
import { StudioContextHelper } from '../studio-context.helper.js';
import { StudioPosterSynthesizerService } from '../services/index.js';

export class StudioPosterRegenerationHandler {
  public static async execute(
    job: Job<StudioGenerationJobPayload>,
    aiEngine: OpenAIAIEngineAdapter,
    storageAdapter: CloudflareR2StorageAdapter
  ): Promise<void> {
    const data = job.data;
    const { tenantId, publicationId, jobId } = data;

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

      if (!article?.content?.trim()) {
        throw new Error('Naskah artikel tidak tersedia untuk pembuatan poster.');
      }

      // 1. Resolusi profil tokoh dan wilayah
      const { member, dapilName } = await StudioContextHelper.resolveMemberAndRegion(tenantId);

      // 2. Cek blueprint visual sebelumnya agar regenerasi menghasilkan variasi baru
      let lastBlueprintId: string | undefined;
      let previousVisualFormat: 'poster' | 'infographic' | undefined;
      const [existingAsset] = await withTenantContext(tenantId, async (tx) => {
        return await tx
          .select({ promptUsed: mediaAssets.promptUsed, assetType: mediaAssets.assetType })
          .from(mediaAssets)
          .where(
            and(
              eq(mediaAssets.publicationId, publicationId),
              inArray(mediaAssets.assetType, [AssetType.DALLE_POSTER, AssetType.INFOGRAPHIC_PNG])
            )
          )
          .limit(1);
      });

      if (existingAsset?.assetType === AssetType.INFOGRAPHIC_PNG) {
        previousVisualFormat = 'infographic';
      }
      if (existingAsset?.promptUsed) {
        try {
          const parsed = JSON.parse(existingAsset.promptUsed);
          lastBlueprintId = parsed.blueprintId || parsed.blueprint;
          if (parsed.visualFormat === 'infographic' || parsed.visualFormat === 'poster') {
            previousVisualFormat = parsed.visualFormat;
          }
        } catch {}
      }

      const resolvedVisualFormat: 'poster' | 'infographic' =
        job.data.visualFormat === 'infographic' || job.data.style === 'infographic'
          ? 'infographic'
          : job.data.visualFormat === 'poster' || job.data.style === 'poster'
          ? 'poster'
          : previousVisualFormat || 'poster';

      await StudioContextHelper.emitProgress(
        tenantId,
        jobId,
        40,
        `Menghasilkan desain ${resolvedVisualFormat === 'infographic' ? 'infografis' : 'poster'} baru...`
      );

      const revisionPrompt = job.data.prompt?.trim();
      const customGroundedEvidence = revisionPrompt
        ? `[INSTRUKSI KHUSUS PROMPT REVISI DARI OPERATOR / KLIEN]:\n${revisionPrompt}`
        : undefined;

      const posterResult = await StudioPosterSynthesizerService.synthesizePoster({
        tenantId,
        publicationId,
        jobId,
        topic: article.title,
        articleTitle: article.title,
        articleExcerpt: article.excerpt || undefined,
        articleContent: article.content,
        groundedEvidenceText: customGroundedEvidence,
        member,
        dapilName,
        visualFormat: resolvedVisualFormat,
        forcedArchetype: job.data.forcedArchetype,
        excludeBlueprintId: lastBlueprintId,
        layoutVariant: job.data.layoutVariant,
        enableImg2ImgPass: data.enableImg2ImgPass,
        img2ImgDenoisingStrength: data.img2ImgDenoisingStrength,
        variationKey: `${publicationId}:regen:${Date.now()}`,
        operatorId: data.operatorId,
        channel: data.channel || 'WEB_STUDIO',
        requestId: data.requestId || jobId,
        aiEngine,
        storageAdapter,
        onProgress: async (step, pct) => {
          await StudioContextHelper.emitProgress(tenantId, jobId, pct, step);
        },
      });

      if (!posterResult.succeeded) {
        throw new Error(posterResult.error || 'Gagal merender poster.');
      }

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
