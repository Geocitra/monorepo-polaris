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
      if (member?.dapilId) {
        const [dapil] = await db
          .select({ dapilName: electoralDistricts.dapilName })
          .from(electoralDistricts)
          .where(eq(electoralDistricts.id, member.dapilId))
          .limit(1);
        if (dapil && !member.customDapil) dapilName = dapil.dapilName;
      }

      // Bersihkan teks prompt dari constraint teknis
      const cleanPrompt = (data.topic || '')
        .replace(/^Infografis Publik:\s*/i, '')
        .replace(/\.\s*STRICT CONSTRAINT:.*$/i, '')
        .trim();

      const headlineText =
        data.headline ||
        (cleanPrompt.length <= 80 ? cleanPrompt : cleanPrompt.slice(0, 77) + '...');
      const quoteText = `Transparansi Kebijakan dan Aspirasi Publik // ${dapilName.toUpperCase()}`;

      // Sesuai preferensi user: Jangan menempelkan foto profil user secara otomatis sebagai overlay poster
      const subjectPhotoBuffer: Buffer | undefined = undefined;
      const compositionMode: 'PUBLIC_ADVOCACY' | 'FIGURE_CENTERPIECE' =
        data.compositionMode || 'PUBLIC_ADVOCACY';

      const tenantBrandHex = await StudioContextHelper.resolveTenantBrandColor(
        tenantId,
        member?.partyAffiliation
      );

      await StudioContextHelper.emitProgress(
        tenantId,
        jobId,
        35,
        'Merumuskan naskah editorial dan komposisi visual...'
      );

      // 3. Generate background visual tanpa teks
      const backgroundResult = await aiEngine.generateCreativePosterBackground({
        topic: cleanPrompt,
        groundedContextSummary: `Isu Utama: ${cleanPrompt}. Wilayah: ${dapilName}. Narasi: Edukasi publik, kebijakan solutif dan transparan.`,
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
        'Merender tipografi vektor Satori & grafis resolusi tinggi...'
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
      });

      await StudioContextHelper.emitProgress(tenantId, jobId, 85, 'Menyimpan aset infografis HD...');

      // 6. Multi-tier upload
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
        console.warn(`[StudioProcessor] Buffer upload gagal, beralih ke fallback:`, storageErr);
        try {
          const uploadResult = await storageAdapter.uploadFromUrl(
            backgroundResult.temporaryImageUrl,
            destPath
          );
          finalPublicUrl = uploadResult.publicUrl;
          finalSizeBytes = uploadResult.sizeBytes;
        } catch {
          finalPublicUrl = `data:image/webp;base64,${composedPoster.buffer.toString('base64')}`;
        }
      }

      // 7. Simpan ke database
      await withTenantContext(tenantId, async (tx) => {
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
