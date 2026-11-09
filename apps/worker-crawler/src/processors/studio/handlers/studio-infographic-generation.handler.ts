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
  studioAiCriticLogs,
} from '@polaris/database';
import { OpenAIAIEngineAdapter, PosterVisionCritic } from '@polaris/ai-engine';
import {
  CloudflareR2StorageAdapter,
  ChromiumPosterCompositor,
  PosterAmbientBaker,
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
        'Menganalisis topik riset, memeriksa aturan kualitas proyek & learned memories di database...'
      );

      // Pemilihan gaya infografis otomatis dari seluruh template terkurasi (Template 1-12)
      const infographicArchetypeList = [
        'INFOGRAPHIC_NARRATIVE_WAVE',
        'INFOGRAPHIC_CHRONICLE_GRID',
        'INFOGRAPHIC_RADIAL_CLOCK',
        'INFOGRAPHIC_ADVOCACY_PILLARS',
        'INFOGRAPHIC_VISIONARY_TIMELINE',
        'INFOGRAPHIC_EDITORIAL_COLLAGE',
        'INFOGRAPHIC_HISTORICAL_EXPEDITION',
        'INFOGRAPHIC_PUNK_ZINE',
        'INFOGRAPHIC_HERITAGE_EDITORIAL',
        'INFOGRAPHIC_INDIGENOUS_ADVOCACY',
        'INFOGRAPHIC_CLASSICAL_MONUMENT',
        'INFOGRAPHIC_RETRO_SUNBURST',
      ] as const;

      // Hormati forcedArchetype jika disediakan, atau pilih acak jika tidak ada
      const chosenArchetype =
        data.forcedArchetype && infographicArchetypeList.includes(data.forcedArchetype as any)
          ? data.forcedArchetype
          : infographicArchetypeList[Math.floor(Math.random() * infographicArchetypeList.length)];

      console.log(`[StudioInfographic] v3.0 Authentic Editorial Broadsheet Infographics loaded (${chosenArchetype})...`);

      // =========================================================================
      // ALUR INFOGRAFIS MURNI SEPERTI POSTER (ZERO-SKELETON / FULL AI VISION)
      // 1. Selector memilih template referensi dari uploads/references/infografis/
      // 2. AI Generator menghasilkan kanvas visual utuh dari nol (tanpa teks)
      // 3. Gemini Vision mendeteksi zona kertas kosong (Negative Space)
      // =========================================================================
      let artCollage = await aiEngine.generateArtCollagePoster({
        topic: cleanPrompt,
        groundedContextSummary,
        forcedArchetype: (chosenArchetype as any) || undefined,
        isInfographic: true,
        tenantBrandHex,
        tenantId,
        variationKey: `${publicationId}:${jobId}`,
      });

      // 4. Chromium merender tipografi infografis langsung di atas kanvas dengan tata letak adaptif
      await StudioContextHelper.emitProgress(
        tenantId,
        jobId,
        70,
        `Merender tipografi grafis Chromium (${artCollage.archetype})...`
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
        layoutVariant: typeof data.layoutVariant === 'number' ? data.layoutVariant : Math.floor(Math.random() * 4),
      });

      let posterBuffer: Buffer = composed.buffer;
      let posterSizeBytes: number = composed.sizeBytes;
      let img2ImgMetadata: Record<string, any> | null = null;

      // =========================================================================
      // LANGKAH 3: IMAGE-TO-IMAGE (IMG2IMG) PASS-THROUGH & AMBIENT TEXTURE BAKE
      // Mematangkan draf poster Chromium melalui neural diffusion / ambient bake
      // dengan denoising strength 0.15 - 0.25 agar teks menyatu dengan lighting latar
      // =========================================================================
      const shouldApplyImg2Img = data.enableImg2ImgPass !== false;
      if (shouldApplyImg2Img) {
        await StudioContextHelper.emitProgress(
          tenantId,
          jobId,
          80,
          'Mematangkan pencahayaan ambient & tekstur AI (Img2Img Pass-through)...'
        );

        try {
          const sdxlInputBuffer = await PosterAmbientBaker.prepareSdxlInput(posterBuffer);
          const passResult = await aiEngine.applyImg2ImgPass({
            imageBuffer: posterBuffer,
            sdxlInputBuffer,
            prompt: artCollage.imagePrompt || cleanPrompt,
            denoisingStrength: data.img2ImgDenoisingStrength || 0.18,
            archetype: artCollage.archetype,
            layoutVariant: data.layoutVariant,
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
            console.log(
              `[StudioInfographic] Img2Img Pass + Crisp Harmonization berhasil (${passResult.providerUsed}, ${passResult.durationMs}ms)`
            );
          } else {
            // Built-in Native Ambient Texture & Lighting Bake Fallback via Sharp
            const baked = await PosterAmbientBaker.bakeAmbientTexture({
              imageBuffer: posterBuffer,
              archetype: artCollage.archetype,
            layoutVariant: data.layoutVariant,
            copy: artCollage.copy,
            signature: roleIdentity.signature,
            headerTag: roleIdentity.headerTag,
            editionTag: roleIdentity.editionTag,
              strength: data.img2ImgDenoisingStrength || 0.15,
            });
            posterBuffer = baked;
            posterSizeBytes = baked.length;
            img2ImgMetadata = {
              providerUsed: 'native-ambient-bake',
              denoisingStrength: 0.15,
            };
            console.log(`[StudioInfographic] Native Ambient Texture Bake berhasil (Sharp grain & light dispersion)`);
          }
        } catch (img2imgErr: any) {
          console.warn(`[StudioInfographic] Img2Img pass-through fallback: ${img2imgErr.message}`);
        }
      }

      // =========================================================================
      // LANGKAH 4: AUTONOMOUS AI VISION CRITIC & MULTI-CANDIDATE AUTO-REPAIR LOOP
      // Khusus fokus template Gelombang Naratif Merah (INFOGRAPHIC_NARRATIVE_WAVE):
      // Menginspeksi draf dengan AI Vision. Jika skor < 85 atau ada cacat visual
      // (terutama chart background, KPI duplikat, atau pita menimpa teks), sistem
      // diizinkan mengenerate kanvas kandidat ke-2 yang bersih di latar belakang.
      // =========================================================================
      if (artCollage.archetype === 'INFOGRAPHIC_NARRATIVE_WAVE') {
        try {
          await StudioContextHelper.emitProgress(
            tenantId,
            jobId,
            75,
            'AI Multimodal Vision Critic sedang menginspeksi draf poster terhadap checklist kualitas...'
          );

          let evalResult = await PosterVisionCritic.evaluatePoster({
            imageBuffer: posterBuffer,
            archetype: artCollage.archetype,
            topic: cleanPrompt,
            copy: artCollage.copy,
            layoutVariant: data.layoutVariant,
            tenantId,
            operatorId: data.operatorId,
            publicationId,
            channel: data.channel || 'WEB_STUDIO',
            activityType: 'VISION_CRITIC',
            requestId: data.requestId || jobId,
          });

          console.log(
            `[VisionCritic] Evaluasi Draf 1: Skor ${evalResult.overallScore}/100, Lulus: ${evalResult.passed}`
          );

          let beforeImageUrl: string | undefined = undefined;
          let autoRepaired = false;

          // ATURAN BARU: Boleh generate lebih dari 1 gambar jika diperlukan saja!
          // Cacat latar belakang (chart background fiktif, KPI duplikat, pita merah menimpa teks, atau skor < 85)
          const hasBackgroundStructuralDefects =
            !evalResult.passed &&
            (evalResult.checklist.duplicatePieChartDetected ||
              evalResult.checklist.duplicateKpiDetected ||
              evalResult.checklist.textWaveOverlapDetected ||
              evalResult.overallScore < 85);

          if (hasBackgroundStructuralDefects) {
            console.log(
              `[VisionCritic] Mendeteksi cacat kanvas latar belakang (${evalResult.critiqueNotes.join('; ')}). Mengaktifkan izin generasi kanvas kandidat ke-2...`
            );
            await StudioContextHelper.emitProgress(
              tenantId,
              jobId,
              80,
              'Ditemukan anomali kanvas, mengaktifkan izin generasi kanvas kandidat ke-2 yang lebih presisi...'
            );

            // Simpan snapshot draf 1 sebagai beforeImageUrl untuk audit transparansi admin
            try {
              const beforeUpload = await storageAdapter.uploadBuffer(posterBuffer, {
                destinationPath: `posters/${tenantId}/critic-candidate1-${Date.now()}-${publicationId}.webp`,
                contentType: 'image/webp',
                contentLength: posterBuffer.length,
              });
              beforeImageUrl = beforeUpload.publicUrl;
            } catch (e) {
              console.warn('[VisionCritic] Gagal upload snapshot before candidate 1: ', e);
            }

            try {
              const candidate2 = await aiEngine.generateArtCollagePoster({
                topic: cleanPrompt,
                groundedContextSummary,
                forcedArchetype: (chosenArchetype as any) || undefined,
                isInfographic: true,
                tenantBrandHex,
                tenantId,
                variationKey: `${publicationId}:${jobId}:c2:${Date.now()}`,
                candidateIndex: 2,
                remedyPrompt:
                  evalResult.remedyInstructions ||
                  'MANDAT KRUSIAL: Area 42% bawah wajib 100% kertas krem polos (#F8F6F0) tanpa chart fiktif apapun, 1 baris KPI tunggal tanpa duplikasi, dan pita merah dibatasi di atas 58% tinggi poster.',
                reuseCopy: artCollage.copy,
              });

              const composed2 = await ChromiumPosterCompositor.compose({
                canvasBuffer: candidate2.imageBuffer,
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
                layoutVariant: typeof data.layoutVariant === 'number' ? data.layoutVariant : 0,
              });

              const evalResult2 = await PosterVisionCritic.evaluatePoster({
                imageBuffer: composed2.buffer,
                archetype: candidate2.archetype,
                topic: cleanPrompt,
                copy: artCollage.copy,
                layoutVariant: data.layoutVariant,
                tenantId,
                operatorId: data.operatorId,
                publicationId,
                channel: data.channel || 'WEB_STUDIO',
                activityType: 'VISION_CRITIC',
                requestId: data.requestId || jobId,
              });

              console.log(
                `[VisionCritic] Evaluasi Kanvas Kandidat ke-2: Skor ${evalResult2.overallScore}/100, Lulus: ${evalResult2.passed}`
              );

              if (evalResult2.overallScore >= evalResult.overallScore) {
                artCollage = candidate2;
                posterBuffer = composed2.buffer;
                posterSizeBytes = composed2.sizeBytes;
                evalResult = evalResult2;
                autoRepaired = true;
              }
            } catch (c2Err: any) {
              console.warn(`[VisionCritic] Gagal generate kanvas kandidat ke-2: ${c2Err?.message}`);
            }
          } else if (!evalResult.passed && evalResult.remedyInstructions) {
            console.log(
              `[VisionCritic] Menjalankan Autonomous Auto-Repair Pass berdasarkan feedback: ${evalResult.critiqueNotes.join('; ')}`
            );
            autoRepaired = true;

            // Simpan snapshot gambar sebelum perbaikan untuk audit admin
            try {
              const beforeUpload = await storageAdapter.uploadBuffer(posterBuffer, {
                destinationPath: `posters/${tenantId}/critic-before-${Date.now()}-${publicationId}.webp`,
                contentType: 'image/webp',
                contentLength: posterBuffer.length,
              });
              beforeImageUrl = beforeUpload.publicUrl;
            } catch (e) {
              console.warn('[VisionCritic] Gagal upload snapshot before: ', e);
            }

            // Jalankan Micro-Refinement Pass dengan instruksi perbaikan Critic
            try {
              const repairResult = await aiEngine.applyImg2ImgPass({
                imageBuffer: posterBuffer,
                prompt: `${artCollage.imagePrompt}\nCRITICAL CRITIC AUTO-REPAIR FIX:\n${evalResult.remedyInstructions}`,
                denoisingStrength: 0.22,
                archetype: artCollage.archetype,
                layoutVariant: data.layoutVariant,
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

              if (repairResult.providerUsed !== 'skipped') {
                const harmonizedRepair = await PosterAmbientBaker.harmonizeDiffusedWithCrispDraft(
                  posterBuffer,
                  repairResult.buffer
                );
                posterBuffer = harmonizedRepair;
                posterSizeBytes = harmonizedRepair.length;
                console.log(`[VisionCritic] Auto-Repair Pass selesai diaplikasikan.`);
              }
            } catch (repairErr: any) {
              console.warn(`[VisionCritic] Auto-Repair Pass gagal, memakai draf sebelumnya:`, repairErr?.message);
            }
          }

          // Catat Log ke database studio_ai_critic_logs
          await PosterVisionCritic.recordCriticLog({
            tenantId,
            publicationId,
            jobId: String(jobId || job.id),
            archetype: artCollage.archetype,
            layoutVariant: data.layoutVariant || 0,
            topic: cleanPrompt,
            evalResult,
            autoRepaired,
            beforeImageUrl,
            finalImageUrl: '', // Diperbarui setelah upload
          });
        } catch (criticErr: any) {
          console.warn(`[VisionCritic] Peringatan kritik AI: ${criticErr?.message}`);
        }
      }

      // 5b. Upload Master Raw Canvas Latar Belakang Bersih (Tanpa Teks / Kartu) untuk Magic Layers Studio
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
        } catch (rawErr) {
          console.warn(`[StudioInfographic] Raw canvas upload fallback:`, rawErr);
          rawCanvasPublicUrl = `data:image/webp;base64,${artCollage.imageBuffer.toString('base64')}`;
        }
      }

      const promptUsedJson = JSON.stringify({
        engine: 'ART_COLLAGE_INFOGRAPHIC_CHROMIUM',
        renderer: 'chromium',
        img2ImgPass: img2ImgMetadata,
        rawCanvasUrl: rawCanvasPublicUrl,
        layoutManifest: composed.layoutManifest,
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

      console.log(
        `[StudioInfographic] Sukses membuat infografis otonom tanpa kerangka statis (${posterSizeBytes} bytes)`
      );

      await StudioContextHelper.emitProgress(tenantId, jobId, 85, 'Menyimpan aset infografis HD...');

      // 5. Multi-tier upload ke storage
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

        await tx
          .update(contentPublications)
          .set({
            title: artCollage.copy.headline || headlineText,
            excerpt: `Infografik Publik: ${artCollage.copy.headline || headlineText}`,
            bodyContentMarkdown: `# ${artCollage.copy.headline || headlineText}\n\n![${artCollage.copy.headline || headlineText}](${finalPublicUrl})\n\n*Dipublikasikan melalui Studio Infografis Polaris Gov.*`,
            wordCount: 0,
            status: ContentStatus.DRAFT,
            updatedAt: new Date(),
          })
          .where(eq(contentPublications.id, publicationId));

        // Single Source of Truth: Token & biaya USD infografis sudah dicatat oleh AiTelemetryService.endTrace().
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

      if (finalPublicUrl) {
        try {
          await db
            .update(studioAiCriticLogs)
            .set({ finalImageUrl: finalPublicUrl })
            .where(eq(studioAiCriticLogs.publicationId, publicationId));
        } catch (e) {
          // non-critical
        }
      }

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
        `Infografis visual "${artCollage.copy.headline || headlineText}" berhasil dibuat.`,
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
