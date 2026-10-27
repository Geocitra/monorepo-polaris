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
import { CloudflareR2StorageAdapter, ChromiumPosterCompositor } from '@polaris/storage';
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
          legislativeLevel: tenantMembers.legislativeLevel,
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

      const destPath = `posters/${tenantId}/${Date.now()}-${publicationId}.webp`;

      // Pipeline tunggal Chromium — tanpa fallback Satori. Kegagalan dilempar apa adanya.
      console.log(`[StudioPosterRegen] Menjalankan Art-Collage Pipeline + Chromium renderer...`);
      const artCollage = await aiEngine.generateArtCollagePoster({
        topic: article.title,
        groundedContextSummary,
        forcedArchetype: (job.data.forcedArchetype as any) || undefined,
        excludeBlueprintId: lastBlueprintId,
        tenantBrandHex,
        tenantId,
        variationKey: `${publicationId}:regen:${Date.now()}`,
      });

      const roleIdentity = StudioContextHelper.resolveSignatureAndHeader(member, dapilName);

      await StudioContextHelper.emitProgress(
        tenantId,
        jobId,
        70,
        'Merender tipografi poster via Chromium...'
      );

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

      const posterBuffer = composed.buffer;
      const posterSizeBytes = composed.sizeBytes;
      const promptUsedJson = JSON.stringify({
        engine: 'ART_COLLAGE_CHROMIUM',
        renderer: 'chromium',
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
