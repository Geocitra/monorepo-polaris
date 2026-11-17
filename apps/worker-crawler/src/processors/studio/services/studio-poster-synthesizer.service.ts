import { and, eq, inArray, sql } from 'drizzle-orm';
import {
  db,
  contentPublications,
  mediaAssets,
  tenantQuotaLedgers,
  studioAiCriticLogs,
  withTenantContext,
} from '@polaris/database';
import { OpenAIAIEngineAdapter, PosterVisionCritic } from '@polaris/ai-engine';
import {
  CloudflareR2StorageAdapter,
  ChromiumPosterCompositor,
  PosterAmbientBaker,
} from '@polaris/storage';
import { AssetType, ContentStatus, isInfographicArchetype } from '@polaris/shared-types';
import { StudioContextHelper } from '../studio-context.helper.js';

export interface SynthesizePosterOptions {
  tenantId: string;
  publicationId: string;
  jobId: string;
  topic: string;
  articleTitle?: string;
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
  } | null;
  dapilName: string;
  visualFormat?: 'poster' | 'infographic';
  isStandaloneVisual?: boolean;
  forcedArchetype?: string;
  excludeBlueprintId?: string;
  layoutVariant?: number;
  enableImg2ImgPass?: boolean;
  img2ImgDenoisingStrength?: number;
  variationKey?: string;
  operatorId?: string;
  channel?: string;
  requestId?: string;
  aiEngine: OpenAIAIEngineAdapter;
  storageAdapter: CloudflareR2StorageAdapter;
  onProgress?: (step: string, pct: number) => Promise<void>;
}

export interface SynthesizePosterResult {
  succeeded: boolean;
  publicUrl?: string;
  headline?: string;
  archetype?: string;
  error?: string;
}

export class StudioPosterSynthesizerService {
  /**
   * Unified Visual Synthesis Engine untuk Poster & Infografis (ATM Pipeline):
   * 1. Resolusi warna tema identitas tokoh/partai/portal
   * 2. Pembuatan kanvas kolase AI + secondary cutouts tanpa teks (Art-Collage ATM Pipeline)
   * 3. Komposisi tipografi, micro-components, dan layout adaptif via headless Chromium
   * 4. AI Img2Img pass-through / ambient texture baking untuk kohesi pencahayaan
   * 5. Autonomous Vision Critic & Auto-Repair (khusus template infografis kompleks)
   * 6. Unggah berkas WebP + raw canvas ke Cloudflare R2 & simpan konsisten ke media_assets
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
      visualFormat,
      isStandaloneVisual = false,
      forcedArchetype,
      excludeBlueprintId,
      layoutVariant,
      enableImg2ImgPass,
      img2ImgDenoisingStrength,
      variationKey,
      operatorId,
      channel = 'WEB_STUDIO',
      requestId,
      aiEngine,
      storageAdapter,
      onProgress,
    } = options;

    try {
      const isInfographic =
        visualFormat === 'infographic' || isInfographicArchetype(forcedArchetype);
      const visualLabel = isInfographic ? 'Infografis' : 'Poster';

      // 1. Resolusi warna tema tokoh/partai/portal
      const tenantBrandHex = await StudioContextHelper.resolveTenantBrandColor(
        tenantId,
        member?.partyAffiliation
      );

      // 2. Bangun ringkasan konteks terpadu (dari artikel maupun grounding mandiri)
      const cleanTopic = (articleTitle || topic || '').trim();
      const excerpt = articleExcerpt || '';
      const articleSnippet = (articleContent || '').slice(0, 3500);
      const evidenceSnippet = (groundedEvidenceText || '').slice(0, 3000);

      const cleanContextSummary = [
        excerpt
          ? `JUDUL & RINGKASAN EKSEKUTIF: ${cleanTopic} — ${excerpt}`
          : `TOPIK UTAMA: ${cleanTopic}`,
        articleSnippet ? `INTISARI NASKAH ARTIKEL:\n${articleSnippet}` : '',
        evidenceSnippet ? `FAKTA RISET & SUMBER DATA TERVERIFIKASI:\n${evidenceSnippet}` : '',
      ]
        .filter(Boolean)
        .join('\n\n')
        .trim();

      const folderPrefix = isInfographic ? 'infographics' : 'posters';
      const destPath = `${folderPrefix}/${tenantId}/${Date.now()}-${publicationId}.webp`;

      if (onProgress) {
        await onProgress(
          `Merancang komposisi ${visualLabel} berbasis referensi ATM & konteks data...`,
          45
        );
      }

      // 3. AI Art-Collage ATM Canvas & Copy Generator
      console.log(
        `[StudioVisualSynthesizer] Menjalankan Art-Collage ATM Pipeline (${visualLabel}, isInfographic=${isInfographic})...`
      );
      let artCollage = await aiEngine.generateArtCollagePoster({
        topic: cleanTopic,
        groundedContextSummary: cleanContextSummary,
        forcedArchetype: (forcedArchetype as any) || undefined,
        excludeBlueprintId,
        isInfographic,
        tenantBrandHex,
        tenantId,
        variationKey: variationKey || `${publicationId}:${jobId}`,
      });

      // 4. Resolusi identitas jabatan, signature, headerTag & varian layout yang konsisten
      const roleIdentity = StudioContextHelper.resolveSignatureAndHeader(member, dapilName);
      const chosenVariant =
        typeof layoutVariant === 'number' ? layoutVariant : Math.floor(Math.random() * 4);

      if (onProgress) {
        await onProgress(
          `Merender tipografi & elemen grafis ${visualLabel} (${artCollage.archetype})...`,
          68
        );
      }

      // 5. Komposisi Chromium HTML/CSS (termasuk secondaryCanvasBuffers untuk multi-cutout)
      const composed = await ChromiumPosterCompositor.compose({
        canvasBuffer: artCollage.imageBuffer,
        secondaryCanvasBuffers: artCollage.secondaryImageBuffers,
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

      let posterBuffer: Buffer = composed.buffer;
      let posterSizeBytes: number = composed.sizeBytes;
      let img2ImgMetadata: Record<string, any> | null = null;

      // 6. Img2Img Pass-through / Ambient Texture Baking
      if (enableImg2ImgPass !== false) {
        if (onProgress) {
          await onProgress(
            `Mematangkan pencahayaan ambient & tekstur kertas ${visualLabel}...`,
            76
          );
        }

        try {
          const sdxlInputBuffer = await PosterAmbientBaker.prepareSdxlInput(posterBuffer);
          const passResult = await aiEngine.applyImg2ImgPass({
            imageBuffer: posterBuffer,
            sdxlInputBuffer,
            prompt: artCollage.imagePrompt || cleanTopic,
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
            const harmonized = await PosterAmbientBaker.harmonizeDiffusedWithCrispDraft(
              posterBuffer,
              passResult.buffer
            );
            posterBuffer = harmonized;
            posterSizeBytes = harmonized.length;
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
          console.warn('[StudioVisualSynthesizer] Img2Img fallback: ' + img2imgErr.message);
        }
      }

      // 7. Autonomous AI Vision Critic & Auto-Repair Loop (khusus arketipe infografis padat)
      let criticLogged = false;
      if (
        isInfographic &&
        (artCollage.archetype === 'INFOGRAPHIC_NARRATIVE_WAVE' ||
          artCollage.archetype === 'INFOGRAPHIC_CHRONICLE_GRID' ||
          artCollage.archetype === 'INFOGRAPHIC_RADIAL_CLOCK' ||
          artCollage.archetype === 'INFOGRAPHIC_ADVOCACY_PILLARS')
      ) {
        try {
          if (onProgress) {
            await onProgress(
              'AI Multimodal Vision Critic sedang memverifikasi kualitas tata letak...',
              82
            );
          }

          let evalResult = await PosterVisionCritic.evaluatePoster({
            imageBuffer: posterBuffer,
            archetype: artCollage.archetype,
            topic: cleanTopic,
            copy: artCollage.copy,
            layoutVariant: chosenVariant,
            tenantId,
            operatorId,
            publicationId,
            channel,
            activityType: 'VISION_CRITIC',
            requestId: requestId || jobId,
          });

          let beforeImageUrl: string | undefined = undefined;
          let autoRepaired = false;

          const hasBackgroundStructuralDefects =
            !evalResult.passed &&
            (evalResult.checklist.duplicatePieChartDetected ||
              evalResult.checklist.duplicateKpiDetected ||
              evalResult.checklist.textWaveOverlapDetected ||
              evalResult.overallScore < 85);

          if (hasBackgroundStructuralDefects) {
            if (onProgress) {
              await onProgress(
                'Menyempurnakan presisi kanvas dengan kandidat ke-2...',
                88
              );
            }

            try {
              const beforeUpload = await storageAdapter.uploadBuffer(posterBuffer, {
                destinationPath: `${folderPrefix}/${tenantId}/critic-candidate1-${Date.now()}-${publicationId}.webp`,
                contentType: 'image/webp',
                contentLength: posterBuffer.length,
              });
              beforeImageUrl = beforeUpload.publicUrl;
            } catch {}

            try {
              const candidate2 = await aiEngine.generateArtCollagePoster({
                topic: cleanTopic,
                groundedContextSummary: cleanContextSummary,
                forcedArchetype: (artCollage.archetype as any) || undefined,
                isInfographic: true,
                tenantBrandHex,
                tenantId,
                variationKey: `${publicationId}:${jobId}:c2:${Date.now()}`,
                candidateIndex: 2,
                remedyPrompt:
                  evalResult.remedyInstructions ||
                  'MANDAT PERBAIKAN: Pastikan area ruang negatif bersih 100% dari objek pengganggu dan bebas teks/angka latar belakang.',
                reuseCopy: artCollage.copy,
              });

              const composed2 = await ChromiumPosterCompositor.compose({
                canvasBuffer: candidate2.imageBuffer,
                secondaryCanvasBuffers: candidate2.secondaryImageBuffers,
                copy: artCollage.copy,
                zones: candidate2.layout,
                palette: {
                  accentHex: candidate2.mutation.palette.accentHex,
                  secondaryHex: candidate2.mutation.palette.secondaryHex,
                },
                signature: roleIdentity.signature,
                headerTag: roleIdentity.headerTag,
                editionTag: roleIdentity.editionTag,
                textToneHint: candidate2.layout.textTone,
                archetype: candidate2.archetype,
                layoutVariant: chosenVariant,
              });

              const evalResult2 = await PosterVisionCritic.evaluatePoster({
                imageBuffer: composed2.buffer,
                archetype: candidate2.archetype,
                topic: cleanTopic,
                copy: artCollage.copy,
                layoutVariant: chosenVariant,
                tenantId,
                operatorId,
                publicationId,
                channel,
                activityType: 'VISION_CRITIC',
                requestId: requestId || jobId,
              });

              if (evalResult2.overallScore >= evalResult.overallScore) {
                artCollage = candidate2;
                posterBuffer = composed2.buffer;
                posterSizeBytes = composed2.sizeBytes;
                evalResult = evalResult2;
                autoRepaired = true;
              }
            } catch (c2Err: any) {
              console.warn(`[VisionCritic] Gagal generate kandidat ke-2: ${c2Err?.message}`);
            }
          }

          await PosterVisionCritic.recordCriticLog({
            tenantId,
            publicationId,
            jobId: String(jobId),
            archetype: artCollage.archetype,
            layoutVariant: chosenVariant,
            topic: cleanTopic,
            evalResult,
            autoRepaired,
            beforeImageUrl,
            finalImageUrl: '',
          });
          criticLogged = true;
        } catch (criticErr: any) {
          console.warn(`[VisionCritic] Evaluasi dilewati: ${criticErr?.message}`);
        }
      }

      // 8. Unggah Master Raw Canvas Latar Belakang Bersih (untuk Magic Layers)
      let rawCanvasPublicUrl = '';
      if (artCollage.imageBuffer && artCollage.imageBuffer.length > 0) {
        const rawDestPath = `${folderPrefix}/${tenantId}/raw-canvas-${Date.now()}-${publicationId}.webp`;
        try {
          const rawUpload = await storageAdapter.uploadBuffer(artCollage.imageBuffer, {
            destinationPath: rawDestPath,
            contentType: 'image/webp',
            contentLength: artCollage.imageBuffer.length,
          });
          rawCanvasPublicUrl = rawUpload.publicUrl;
        } catch (rawErr: any) {
          console.warn(`[StudioVisualSynthesizer] Raw canvas R2 upload dilewati: ${rawErr?.message}`);
        }
      }

      const promptUsedJson = JSON.stringify({
        engine: 'ART_COLLAGE_CHROMIUM',
        renderer: 'chromium',
        visualFormat: isInfographic ? 'infographic' : 'poster',
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

      // 9. Unggah hasil komposit akhir ke Cloudflare R2
      if (onProgress) {
        await onProgress(`Menyimpan hasil akhir ${visualLabel} ke penyimpanan awan...`, 92);
      }

      let finalPublicUrl = '';
      const finalSizeBytes = posterSizeBytes;

      try {
        const uploadResult = await storageAdapter.uploadBuffer(posterBuffer, {
          destinationPath: destPath,
          contentType: 'image/webp',
          contentLength: posterSizeBytes,
        });
        finalPublicUrl = uploadResult.publicUrl;
      } catch (storageErr: any) {
        // Retry 1x sebelum melempar error (hindari menulis string base64 raksasa ke kolom URL DB)
        const retryResult = await storageAdapter.uploadBuffer(posterBuffer, {
          destinationPath: destPath,
          contentType: 'image/webp',
          contentLength: posterSizeBytes,
        });
        finalPublicUrl = retryResult.publicUrl;
      }

      const targetAssetType = isInfographic ? AssetType.INFOGRAPHIC_PNG : AssetType.DALLE_POSTER;
      const finalHeadline = artCollage.copy.headline || cleanTopic.slice(0, 80);

      // 10. Transaksi penyimpanan asset, konsistensi relasi DB & ledger
      await withTenantContext(tenantId, async (tx) => {
        // Bersihkan aset visual utama lama (baik DALLE_POSTER maupun INFOGRAPHIC_PNG) agar tidak duplikat saat ganti format
        await tx
          .delete(mediaAssets)
          .where(
            and(
              eq(mediaAssets.publicationId, publicationId),
              inArray(mediaAssets.assetType, [AssetType.DALLE_POSTER, AssetType.INFOGRAPHIC_PNG])
            )
          );

        await tx.insert(mediaAssets).values({
          publicationId,
          assetType: targetAssetType,
          r2StorageUrl: finalPublicUrl,
          cdnPublicUrl: finalPublicUrl,
          promptUsed: promptUsedJson,
          mimeType: 'image/webp',
          fileSizeBytes: finalSizeBytes,
        });

        // Simpan Master Raw Canvas secara konsisten sebagai HEADER_IMAGE untuk Magic Layers
        if (rawCanvasPublicUrl) {
          await tx
            .delete(mediaAssets)
            .where(
              and(
                eq(mediaAssets.publicationId, publicationId),
                eq(mediaAssets.assetType, AssetType.HEADER_IMAGE)
              )
            );

          await tx.insert(mediaAssets).values({
            publicationId,
            assetType: AssetType.HEADER_IMAGE,
            r2StorageUrl: rawCanvasPublicUrl,
            cdnPublicUrl: rawCanvasPublicUrl,
            promptUsed: 'MASTER_CLEAN_BACKGROUND_CANVAS',
            mimeType: 'image/webp',
            fileSizeBytes: artCollage.imageBuffer.length,
          });
        }

        // Jika visual standalone (POSTER_ONLY / INFOGRAPHIC_ONLY), perbarui record contentPublications
        if (isStandaloneVisual) {
          const standalonePrefix = isInfographic ? 'Infografik Publik' : 'Poster Publik';
          await tx
            .update(contentPublications)
            .set({
              title: finalHeadline,
              excerpt: `${standalonePrefix}: ${finalHeadline}`,
              bodyContentMarkdown: `# ${finalHeadline}\n\n![${finalHeadline}](${finalPublicUrl})\n\n*Dipublikasikan melalui Studio Visual Polaris.*`,
              wordCount: 0,
              status: ContentStatus.DRAFT,
              generationCheckpoints: {
                taskType: isInfographic ? 'INFOGRAPHIC_ONLY' : 'POSTER_ONLY',
                visualFormat: isInfographic ? 'infographic' : 'poster',
                archetype: artCollage.archetype,
              },
              updatedAt: new Date(),
            })
            .where(eq(contentPublications.id, publicationId));
        }

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

      if (criticLogged && finalPublicUrl) {
        await db
          .update(studioAiCriticLogs)
          .set({ finalImageUrl: finalPublicUrl })
          .where(eq(studioAiCriticLogs.publicationId, publicationId))
          .catch(() => null);
      }

      return {
        succeeded: true,
        publicUrl: finalPublicUrl,
        headline: finalHeadline,
        archetype: artCollage.archetype,
      };
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      console.warn(`[StudioVisualSynthesizer] Kegagalan sintesis visual: ${message}`);
      return {
        succeeded: false,
        error: message,
      };
    }
  }
}
