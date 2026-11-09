import { and, eq, sql } from 'drizzle-orm';
import {
  mediaAssets,
  tenantQuotaLedgers,
  withTenantContext,
} from '@polaris/database';
import { OpenAIAIEngineAdapter } from '@polaris/ai-engine';
import {
  CloudflareR2StorageAdapter,
  ChromiumPosterCompositor,
  PosterAmbientBaker,
} from '@polaris/storage';
import { AssetType } from '@polaris/shared-types';
import { StudioContextHelper } from '../studio-context.helper.js';

export interface SynthesizePosterOptions {
  tenantId: string;
  publicationId: string;
  jobId: string;
  topic: string;
  articleTitle: string;
  articleExcerpt?: string;
  articleContent?: string;
  groundedEvidenceText?: string;
  member?: {
    fullName?: string | null;
    partyAffiliation?: string | null;
    photoUrl?: string | null;
    commissionName?: string | null;
    legislativeLevel?: string | null;
    customDapil?: string | null;
  };
  dapilName: string;
  forcedArchetype?: string;
  excludeBlueprintId?: string;
  layoutVariant?: number;
  enableImg2ImgPass?: boolean;
  img2ImgDenoisingStrength?: number;
  variationKey?: string;
  aiEngine: OpenAIAIEngineAdapter;
  storageAdapter: CloudflareR2StorageAdapter;
  onProgress?: (step: string, pct: number) => Promise<void>;
}

export interface SynthesizePosterResult {
  succeeded: boolean;
  publicUrl?: string;
  error?: string;
}

export class StudioPosterSynthesizerService {
  /**
   * Mengorkestrasi sintesis materi visual poster editorial berestetika tinggi:
   * 1. Resolusi warna tema fraksi/partai tokoh dewan
   * 2. Pembuatan kanvas kolase AI tanpa teks (Art-Collage Pipeline)
   * 3. Komposisi tipografi, tata letak, dan tag identitas via headless Chromium
   * 4. AI Img2Img pass-through / ambient texture baking untuk kohesi pencahayaan
   * 5. Unggah berkas WebP ke Cloudflare R2 CDN (dengan fallback base64)
   * 6. Penyimpanan asset ke media_assets & update ledger kuota visual
   */
  public static async synthesizePoster(
    options: SynthesizePosterOptions
  ): Promise<SynthesizePosterResult> {
    const {
      tenantId,
      publicationId,
      jobId,
      topic,
      articleTitle,
      articleExcerpt,
      articleContent,
      groundedEvidenceText,
      member,
      dapilName,
      forcedArchetype,
      excludeBlueprintId,
      layoutVariant,
      enableImg2ImgPass,
      img2ImgDenoisingStrength,
      variationKey,
      aiEngine,
      storageAdapter,
      onProgress,
    } = options;

    try {
      // 1. Resolusi warna tema partai/fraksi tokoh dewan
      const tenantBrandHex = await StudioContextHelper.resolveTenantBrandColor(
        tenantId,
        member?.partyAffiliation
      );

      // 2. Ekstrak latar belakang berseni dan fakta kontekstual terstruktur
      const cleanTopic = (articleTitle || topic || '').trim();
      const excerpt = articleExcerpt || '';
      const articleSnippet = (articleContent || '').slice(0, 3500);
      const evidenceSnippet = (groundedEvidenceText || '').slice(0, 2500);

      const cleanContextSummary = [
        `JUDUL & RINGKASAN EKSEKUTIF ARTIKEL: ${cleanTopic} — ${excerpt}`,
        articleSnippet ? `CUPLIKAN ISI & DATA ARTIKEL:\n${articleSnippet}` : '',
        evidenceSnippet ? `BUKTI RISET TERVERIFIKASI:\n${evidenceSnippet}` : '',
      ]
        .filter(Boolean)
        .join('\n\n')
        .trim();

      const destPath = `posters/${tenantId}/${Date.now()}-${publicationId}.webp`;

      // 3. AI Art-Collage canvas generator
      console.log(`[StudioPosterSynthesizer] Menjalankan Art-Collage Pipeline + Chromium renderer...`);
      const artCollage = await aiEngine.generateArtCollagePoster({
        topic: cleanTopic,
        groundedContextSummary: cleanContextSummary,
        forcedArchetype: (forcedArchetype as any) || undefined,
        excludeBlueprintId,
        tenantBrandHex,
        tenantId,
        variationKey: variationKey || `${publicationId}:${jobId}`,
      });

      // 4. Resolusi identitas jabatan, signature dan header tag
      const roleIdentity = StudioContextHelper.resolveSignatureAndHeader(member, dapilName);
      const chosenVariant =
        typeof layoutVariant === 'number' ? layoutVariant : Math.floor(Math.random() * 4);

      // 5. Komposisi Chromium HTML/CSS
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
        layoutVariant: chosenVariant,
      });

      let posterBuffer = composed.buffer;
      let posterSizeBytes = composed.sizeBytes;
      let img2ImgMetadata: Record<string, any> | null = null;

      // 6. Img2Img Pass-through / Ambient Texture Baking
      if (enableImg2ImgPass !== false) {
        if (onProgress) {
          await onProgress(
            'Mematangkan pencahayaan ambient & tekstur AI (Img2Img Pass-through)...',
            75
          );
        }

        try {
          const passResult = await aiEngine.applyImg2ImgPass({
            imageBuffer: posterBuffer,
            sdxlInputBuffer: await PosterAmbientBaker.prepareSdxlInput(posterBuffer),
            prompt: artCollage.imagePrompt || articleTitle || cleanTopic,
            denoisingStrength: img2ImgDenoisingStrength || 0.18,
            archetype: artCollage.archetype,
            layoutVariant: chosenVariant,
            copy: artCollage.copy,
            signature: roleIdentity.signature,
            headerTag: roleIdentity.headerTag,
            editionTag: roleIdentity.editionTag,
            palette: {
              accentHex: artCollage.mutation.palette.accentHex,
              secondaryHex: artCollage.mutation.palette.secondaryHex,
            },
            tenantId,
          });

          if (passResult.providerUsed !== 'skipped') {
            posterBuffer = await PosterAmbientBaker.harmonizeDiffusedWithCrispDraft(
              posterBuffer,
              passResult.buffer
            );
            posterSizeBytes = passResult.buffer.length;
            img2ImgMetadata = {
              providerUsed: passResult.providerUsed,
              denoisingStrength: passResult.denoisingStrengthUsed,
              durationMs: passResult.durationMs,
              relayoutPrompt: passResult.compiledRelayoutPrompt,
            };
          } else {
            const baked = await PosterAmbientBaker.bakeAmbientTexture({
              imageBuffer: posterBuffer,
              archetype: artCollage.archetype,
              layoutVariant: chosenVariant,
              copy: artCollage.copy,
              signature: roleIdentity.signature,
              headerTag: roleIdentity.headerTag,
              editionTag: roleIdentity.editionTag,
              strength: img2ImgDenoisingStrength || 0.15,
            });
            posterBuffer = baked;
            posterSizeBytes = baked.length;
            img2ImgMetadata = {
              providerUsed: 'native-ambient-bake',
              denoisingStrength: 0.15,
            };
          }
        } catch (img2imgErr: any) {
          console.warn('[StudioPosterSynthesizer] Img2Img fallback: ' + img2imgErr.message);
        }
      }

      // 7. Unggah raw canvas (opsional)
      let rawCanvasPublicUrl = '';
      if (artCollage.imageBuffer && artCollage.imageBuffer.length > 0) {
        const rawDestPath = `posters/${tenantId}/raw-canvas-${Date.now()}-${publicationId}.webp`;
        try {
          const rawUpload = await storageAdapter.uploadBuffer(artCollage.imageBuffer, {
            destinationPath: rawDestPath,
            contentType: 'image/webp',
            contentLength: artCollage.imageBuffer.length,
          });
          rawCanvasPublicUrl = rawUpload.publicUrl;
        } catch {}
      }

      const promptUsedJson = JSON.stringify({
        engine: 'ART_COLLAGE_CHROMIUM',
        renderer: 'chromium',
        img2ImgPass: img2ImgMetadata,
        rawCanvasUrl: rawCanvasPublicUrl || undefined,
        layoutManifest: composed.layoutManifest,
        blueprintId: artCollage.blueprintId,
        archetype: artCollage.archetype,
        layoutVariant: chosenVariant,
        referenceFile: artCollage.referenceFile,
        usedStyleReference: artCollage.usedStyleReference,
        mutation: artCollage.mutation,
        layout: artCollage.layout,
        imagePrompt: artCollage.imagePrompt,
        imageProvider: artCollage.imageProvider,
        detectedLuminance: composed.detectedLuminance,
        blendModeUsed: composed.blendModeUsed,
      });

      // 8. Unggah hasil komposit ke Cloudflare R2
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
          `[StudioPosterSynthesizer] GCS/R2 buffer upload gagal, beralih ke data base64:`,
          storageErr
        );
        finalPublicUrl = `data:image/webp;base64,${posterBuffer.toString('base64')}`;
      }

      // 9. Transaksi penyimpanan asset & ledger
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
            estimatedCostUsd: '0.00000',
          })
          .onConflictDoUpdate({
            target: [tenantQuotaLedgers.tenantId, tenantQuotaLedgers.billingCycleMonth],
            set: {
              dalleUsed: sql`${tenantQuotaLedgers.dalleUsed} + 1`,
              updatedAt: new Date(),
            },
          });
      });

      return {
        succeeded: true,
        publicUrl: finalPublicUrl,
      };
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      console.warn(`[StudioPosterSynthesizer] Poster gagal; naskah tetap tersimpan: ${message}`);
      return {
        succeeded: false,
        error: message,
      };
    }
  }
}

