import { Job } from 'bullmq';
import { and, eq, sql } from 'drizzle-orm';
import {
  db,
  contentPublications,
  mediaAssets,
  socialSyndicationPacks,
  tenantQuotaLedgers,
  tenantMembers,
  electoralDistricts,
  findSimilarKnowledgeChunks,
  withTenantContext,
  researchJobs,
  researchOutputs,
  masterPoliticalParties,
  portalThemeSettings,
  portalConfigs,
} from '@polaris/database';
import {
  OpenAIAIEngineAdapter,
  ContextCapsuleBuilder,
  AutonomousResearchOrchestrator,
  DeterministicQualityGates,
} from '@polaris/ai-engine';
import { CloudflareR2StorageAdapter, CreativePosterCompositor } from '@polaris/storage';
import { ContentStatus, AssetType, ResearchJobStatus } from '@polaris/shared-types';

import { AiCostCalculator } from '@polaris/core-domain';
import { StudioGenerationJobPayload } from '../queues/studio.queue.js';
import { redisConnection } from '../config/redis.connection.js';

export class StudioGenerationProcessor {
  private static readonly aiEngine = new OpenAIAIEngineAdapter();
  private static readonly storageAdapter = new CloudflareR2StorageAdapter();

  /**
   * Mengambil warna identitas resmi partai politik atau kustomisasi tema portal tenant
   */
  private static async resolveTenantBrandColor(
    tenantId: string,
    partyAffiliation?: string | null
  ): Promise<string> {
    let resolvedBrandHex = '#9E0B0F';
    try {
      if (partyAffiliation) {
        const [party] = await db
          .select({ primaryColor: masterPoliticalParties.primaryColor })
          .from(masterPoliticalParties)
          .where(eq(masterPoliticalParties.code, partyAffiliation))
          .limit(1);
        if (party?.primaryColor) {
          resolvedBrandHex = party.primaryColor;
        }
      }
      const [theme] = await db
        .select({ primaryHexColor: portalThemeSettings.primaryHexColor })
        .from(portalThemeSettings)
        .innerJoin(portalConfigs, eq(portalThemeSettings.portalId, portalConfigs.id))
        .where(eq(portalConfigs.tenantId, tenantId))
        .limit(1);
      if (theme?.primaryHexColor) {
        resolvedBrandHex = theme.primaryHexColor;
      }
    } catch (colorErr) {
      console.warn(`[StudioProcessor] Gagal memuat warna tema tenant, fallback:`, colorErr);
    }
    return resolvedBrandHex;
  }

  private static async emitProgress(
    tenantId: string,
    jobId: string,
    percent: number,
    step: string,
    status: 'RUNNING' | 'COMPLETED' | 'FAILED' = 'RUNNING',
    resultUrl?: string,
    errorDetails?: string,
    textReady?: boolean,
    publicationId?: string
  ) {
    const payload = {
      jobId,
      percent,
      step,
      status,
      resultUrl,
      errorDetails,
      textReady: textReady ?? false,
      publicationId,
      timestamp: Date.now(),
    };
    const serialized = JSON.stringify(payload);
    await Promise.all([
      redisConnection.publish(`realtime:progress:${tenantId}`, serialized).catch(() => null),
      redisConnection.set(`job:progress:${tenantId}:${jobId}`, serialized, 'EX', 3600).catch(() => null),
    ]);
  }

  private static async emitNotification(
    tenantId: string,
    title: string,
    message: string,
    link: string = '/studio/artikel'
  ) {
    const payload = {
      id: `notif_${Date.now()}`,
      title,
      message,
      category: 'ARTICLE',
      link,
      timestamp: Date.now(),
    };
    const serialized = JSON.stringify(payload);
    await Promise.all([
      redisConnection.publish(`realtime:notifications:${tenantId}`, serialized).catch(() => null),
      redisConnection.lpush(`history:notifications:${tenantId}`, serialized).catch(() => null),
      redisConnection.ltrim(`history:notifications:${tenantId}`, 0, 19).catch(() => null),
    ]);
  }

  public static async process(job: Job<StudioGenerationJobPayload>): Promise<void> {
    const data = job.data;
    const { tenantId, publicationId, jobId } = data;

    if (data.taskType === 'REGENERATE_POSTER') {
      await this.processPosterRegeneration(job);
      return;
    }

    if (data.taskType === 'INFOGRAPHIC_ONLY') {
      await this.processInfographicOnly(job);
      return;
    }

    console.log(`[StudioProcessor] Memulai pemrosesan tugas asinkron #${job.id} (PubID: ${publicationId})...`);

    try {
      // -----------------------------------------------------------------------
      // LANGKAH 1 (20%): Resolusi Wilayah & Ekstraksi Dokumen
      // -----------------------------------------------------------------------
      await this.emitProgress(tenantId, jobId, 20, 'Menyusuri Konteks Regulasi & Analisis Dokumen Lampiran...');

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

      let targetRegion = member?.personalCoverage?.[0] || 'NASIONAL';
      let dapilName = member?.customDapil || 'Dapil';

      if (member?.dapilId) {
        const [dapil] = await db
          .select()
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

      // OCR Lampiran & Scraping Dokumen jika ada
      const parsedDocuments: Array<{ name: string; type: string; extractedContent: string }> = [];
      if (data.attachments && data.attachments.length > 0) {
        for (const att of data.attachments.slice(0, 3)) {
          if (att.type.includes('image/') || att.name.match(/\.(png|jpg|jpeg|webp)$/i)) {
            try {
              const ocrText = await this.aiEngine.performVisionOCR({
                base64Data: att.base64,
                mimeType: att.type || 'image/jpeg',
                fileName: att.name,
              });
              parsedDocuments.push({ name: att.name, type: att.type, extractedContent: ocrText });
            } catch (error: unknown) {
              const message = error instanceof Error ? error.message : String(error);
              console.warn(`[StudioProcessor] Lampiran ${att.name} dilewati setelah OCR gagal: ${message}`);
            }
          }
        }
      }

      // Vektor Grounding Otentik (RAG)
      let queryVector: number[] | null = null;
      try {
        const embedResult = await this.aiEngine.generateEmbedding(data.topic, tenantId);
        queryVector = embedResult.embedding;
      } catch (err: any) {
        console.warn(`[StudioProcessor] Query embedding gagal: ${err.message}`);
      }

      // -----------------------------------------------------------------------
      // LANGKAH 1B (20%-35%): Autonomous Research Pipeline (Planner, Multi-Source, Evidence Spans)
      // Menghubungkan regulasi internal, berita media lokal, Crossref DOI, dan web discovery
      // -----------------------------------------------------------------------
      await this.emitProgress(tenantId, jobId, 20, 'Menjalankan Riset Otonom & Pencarian Bukti Terverifikasi...');

      let researchJobId: string | undefined;
      let groundedEvidenceText = '';
      let evidenceMap = new Map<string, string>();

      try {
        const researchResult = await AutonomousResearchOrchestrator.executeResearchPipeline({
          tenantId,
          topic: data.topic,
          userPrompt: data.prompt || data.topic,
          targetRegion,
          queryEmbedding: queryVector || undefined,
          attachedDocuments: parsedDocuments,
          providedUrls: data.externalUrls || data.referencedUrls || [],
          onProgress: async (step, pct) => {
            const scaledPct = Math.round(20 + (pct / 100) * 15);
            await this.emitProgress(tenantId, jobId, scaledPct, step);
          },
        });
        researchJobId = researchResult.jobId;
        groundedEvidenceText = researchResult.groundedContextText;
        evidenceMap = researchResult.evidenceIdMap;
      } catch (researchErr: any) {
        console.warn(`[StudioProcessor] Autonomous research error, fallback ke RAG dasar: ${researchErr.message}`);
      }

      const similarChunks = queryVector
        ? await findSimilarKnowledgeChunks(queryVector, 3, targetRegion, 0.60)
        : [];

      const baseContext = ContextCapsuleBuilder.assembleContext({
        regionName: `${dapilName} (${targetRegion})`,
        regulations: similarChunks.map((c) => ({
          reference: c.structuralReference,
          content: c.chunkContent,
        })),
        recentNews: [],
        comparisonRegionData: data.comparisonRegion ? `Perbandingan: ${data.comparisonRegion}` : undefined,
        attachedDocuments: parsedDocuments,
        framingStance: data.framingStance,
      });

      const contextPayload = groundedEvidenceText
        ? `${baseContext}\n\n${groundedEvidenceText}`
        : baseContext;

      // -----------------------------------------------------------------------
      // LANGKAH 2 (50%): Sintesis Naskah Kebijakan Panjang (GPT-4o)
      // Telemetri Langfuse dan ai_trace_logs otomatis tersinkronisasi 1:1 via AiTelemetryService
      // -----------------------------------------------------------------------
      await this.emitProgress(tenantId, jobId, 35, 'Menyusun Naskah Kebijakan Modular Berantai...');

      const generatedArticle = await this.aiEngine.generateArticle({
        topic: data.topic,
        regionalContextData: contextPayload,
        targetAudience: data.targetAudience,
        targetLength: data.targetLength,
        writingStyle: data.writingStyle,
        toneOverride: data.toneOverride,
        tenantId,
        onProgress: async (step, pct) => {
          await this.emitProgress(tenantId, jobId, pct, step);
        },
      });

      // -----------------------------------------------------------------------
      // LANGKAH 2B: Deterministic Quality Control Gate (Sitasi & Bukti Integritas)
      // -----------------------------------------------------------------------
      const validEvidenceKeys = new Set(evidenceMap.keys());
      const qcResult = DeterministicQualityGates.verifyCitationQualityControl(
        generatedArticle.contentMarkdown,
        validEvidenceKeys
      );

      if (researchJobId) {
        try {
          await db
            .update(researchJobs)
            .set({
              qcPassed: qcResult.qcPassed,
              status: ResearchJobStatus.COMPLETED,
              updatedAt: new Date(),
            })
            .where(eq(researchJobs.id, researchJobId));

          await db.insert(researchOutputs).values({
            researchJobId,
            title: generatedArticle.title,
            executiveSummary: generatedArticle.excerpt,
            markdownBody: generatedArticle.contentMarkdown,
            bibliographyJson: Array.from(evidenceMap.entries()).map(([token, spanId]) => ({
              citationToken: token,
              evidenceSpanId: spanId,
            })),
            qcReport: qcResult,
          });
        } catch (dbErr: any) {
          console.warn(`[StudioProcessor] Gagal menyimpan research outputs: ${dbErr.message}`);
        }
      }

      let socialPack = {
        instagramCaption: '',
        twitterThreads: [] as string[],
        whatsappBroadcast: `*${generatedArticle.title}*\n\n${generatedArticle.excerpt}`,
      };
      try {
        const generatedSocialPack = await this.aiEngine.generateSocialSnippets(generatedArticle.contentMarkdown);
        socialPack = {
          instagramCaption: generatedSocialPack.instagramCaption || '',
          twitterThreads: generatedSocialPack.twitterThreads || [],
          whatsappBroadcast: generatedSocialPack.whatsappBroadcast || socialPack.whatsappBroadcast,
        };
      } catch (error: unknown) {
        const message = error instanceof Error ? error.message : String(error);
        console.warn(`[StudioProcessor] Social pack gagal dibuat; memakai ringkasan artikel: ${message}`);
      }

      // Commit naskah artikel sebelum operasi gambar opsional
      await this.emitProgress(tenantId, jobId, 69, 'Menyimpan naskah dan paket teks...');
      const textCostUsd = AiCostCalculator.calculateCostUsd(generatedArticle.totalTokensUsed, 0);

      // Self-healing sanitizer untuk rogue citations (Defect 6)
      let finalMarkdown = generatedArticle.contentMarkdown;
      if (qcResult.rogueCitations && qcResult.rogueCitations.length > 0) {
        console.warn(`[StudioProcessor] Menghapus ${qcResult.rogueCitations.length} rogue citation dari naskah: ${qcResult.rogueCitations.join(', ')}`);
        for (const rogueId of qcResult.rogueCitations) {
          const rogueRegex = new RegExp(`\\[(?:\\^|Bukti:?\\s*)?${rogueId}\\]`, 'gi');
          finalMarkdown = finalMarkdown.replace(rogueRegex, '');
        }
      }

      await withTenantContext(tenantId, async (tx) => {
        await tx
          .update(contentPublications)
          .set({
            title: generatedArticle.title,
            excerpt: generatedArticle.excerpt,
            bodyContentMarkdown: finalMarkdown,
            wordCount: generatedArticle.wordCount,
            status: ContentStatus.DRAFT,
            researchJobId: researchJobId || null,
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
            articleUsed: 1,
            dalleLimit: 0,
            dalleUsed: 0,
            totalTokensConsumed: generatedArticle.totalTokensUsed,
            estimatedCostUsd: String(textCostUsd),
          })
          .onConflictDoUpdate({
            target: [tenantQuotaLedgers.tenantId, tenantQuotaLedgers.billingCycleMonth],
            set: {
              articleUsed: sql`${tenantQuotaLedgers.articleUsed} + 1`,
              totalTokensConsumed: sql`${tenantQuotaLedgers.totalTokensConsumed} + ${generatedArticle.totalTokensUsed}`,
              estimatedCostUsd: sql`${tenantQuotaLedgers.estimatedCostUsd} + ${textCostUsd}`,
              updatedAt: new Date(),
            },
          });

        await tx.insert(socialSyndicationPacks).values({
          publicationId,
          instagramCaption: socialPack.instagramCaption,
          twitterThreads: socialPack.twitterThreads,
          whatsappBroadcastText: socialPack.whatsappBroadcast,
        }).onConflictDoUpdate({
          target: socialSyndicationPacks.publicationId,
          set: {
            instagramCaption: socialPack.instagramCaption,
            twitterThreads: socialPack.twitterThreads,
            whatsappBroadcastText: socialPack.whatsappBroadcast,
          },
        });
      });

      // PROGRESSIVE INSTANT DELIVERY: Naskah teks 100% siap di database!
      // Emit textReady: true agar frontend langsung membuka naskah di layar
      await this.emitProgress(
        tenantId,
        jobId,
        70,
        'Naskah kebijakan telah tersimpan. Merender materi visual...',
        'RUNNING',
        undefined,
        undefined,
        true,
        publicationId
      );

      let posterSucceeded = !data.generateDallePoster;
      let posterFailure: string | undefined;
      if (data.generateDallePoster) {
        await this.emitProgress(tenantId, jobId, 85, 'Merender poster visual berestetika tinggi; naskah telah tersimpan...');
        try {
          const headlineText = data.headline || generatedArticle.title;
          const quoteText = generatedArticle.excerpt?.slice(0, 160) || '';

          // Sesuai preferensi user: Jangan menempelkan foto profil user secara otomatis sebagai overlay poster
          const subjectPhotoBuffer: Buffer | undefined = undefined;
          const compositionMode: 'PUBLIC_ADVOCACY' | 'FIGURE_CENTERPIECE' =
            data.compositionMode || 'PUBLIC_ADVOCACY';

          const tenantBrandHex = await this.resolveTenantBrandColor(tenantId, member?.partyAffiliation);

          // 2. Ekstrak latar belakang berseni tanpa teks (Clean Art Conditioning)
          const backgroundResult = await this.aiEngine.generateCreativePosterBackground({
            topic: data.topic,
            groundedContextSummary: groundedEvidenceText,
            compositionMode,
            forcedArchetype: (data.forcedArchetype as any) || undefined,
            tenantBrandHex,
            tenantId,
          });

          // 3. Unduh buffer background sementara dari AI
          let backgroundBuffer: Buffer;
          if (backgroundResult.temporaryImageUrl.startsWith('data:')) {
            const base64Part = backgroundResult.temporaryImageUrl.split(',')[1] || '';
            backgroundBuffer = Buffer.from(base64Part, 'base64');
          } else {
            const resp = await fetch(backgroundResult.temporaryImageUrl);
            backgroundBuffer = Buffer.from(await resp.arrayBuffer());
          }

          // 4. Komposisi deterministik (Base AI Collage + Satori Multi-Column Vector Text + Harmonized Photo)
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
            primaryAccentColor: backgroundResult.blueprint.colorPalette.primaryAccent || tenantBrandHex,
            canvasWidth: backgroundResult.compiledPrompt.canvasDimensions.width,
            canvasHeight: backgroundResult.compiledPrompt.canvasDimensions.height,
            editionTag: `POLARIS // ${dapilName.toUpperCase()}`,
            outputFormat: 'webp',
          });

          // 5. Unggah hasil komposit ke Cloudflare R2
          let finalPublicUrl = backgroundResult.temporaryImageUrl;
          let finalSizeBytes = composedPoster.sizeBytes;
          const destPath = `posters/${tenantId}/${Date.now()}-${publicationId}.webp`;

          try {
            const uploadResult = await this.storageAdapter.uploadBuffer(composedPoster.buffer, {
              destinationPath: destPath,
              contentType: 'image/webp',
              contentLength: composedPoster.sizeBytes,
            });
            finalPublicUrl = uploadResult.publicUrl;
          } catch (storageErr) {
            console.warn(`[StudioProcessor] GCS/R2 buffer upload gagal, mencoba upload URL cadangan:`, storageErr);
            try {
              const uploadResult = await this.storageAdapter.uploadFromUrl(
                backgroundResult.temporaryImageUrl,
                destPath
              );
              finalPublicUrl = uploadResult.publicUrl;
              finalSizeBytes = uploadResult.sizeBytes;
            } catch (fallbackErr) {
              console.warn(`[StudioProcessor] Upload URL cadangan juga gagal, beralih ke data base64:`, fallbackErr);
              finalPublicUrl = `data:image/webp;base64,${composedPoster.buffer.toString('base64')}`;
            }
          }

          await withTenantContext(tenantId, async (tx) => {
            await tx.insert(mediaAssets).values({
              publicationId,
              assetType: AssetType.DALLE_POSTER,
              r2StorageUrl: finalPublicUrl,
              cdnPublicUrl: finalPublicUrl,
              promptUsed: JSON.stringify({
                blueprint: backgroundResult.blueprint.name,
                archetype: backgroundResult.blueprint.archetype,
                compiledPrompt: backgroundResult.compiledPrompt.englishPrompt,
              }),
              mimeType: 'image/webp',
              fileSizeBytes: finalSizeBytes,
            });

            await tx
              .update(tenantQuotaLedgers)
              .set({
                dalleUsed: sql`${tenantQuotaLedgers.dalleUsed} + 1`,
                estimatedCostUsd: sql`${tenantQuotaLedgers.estimatedCostUsd} + ${AiCostCalculator.DALLE3_COST_PER_IMAGE_USD}`,
                updatedAt: new Date(),
              })
              .where(and(
                eq(tenantQuotaLedgers.tenantId, tenantId),
                eq(tenantQuotaLedgers.billingCycleMonth, new Date().toISOString().slice(0, 7))
              ));
          });
          posterSucceeded = true;
        } catch (error: unknown) {
          posterSucceeded = false;
          posterFailure = error instanceof Error ? error.message : String(error);
          console.warn(`[StudioProcessor] Poster gagal; naskah tetap tersimpan: ${posterFailure}`);
        }
      }

      const completionStep = posterSucceeded
        ? 'Selesai! Naskah dan materi yang tersedia siap ditinjau.'
        : 'Naskah artikel berhasil dibuat (Poster visual tertunda).';
      await this.emitProgress(
        tenantId,
        jobId,
        100,
        completionStep,
        'COMPLETED',
        `/studio/artikel`,
        posterFailure
      );

      await this.emitNotification(
        tenantId,
        posterSucceeded ? 'Naskah Kebijakan Selesai!' : 'Naskah Tersimpan, Poster Tertunda',
        posterSucceeded
          ? `Naskah "${generatedArticle.title}" siap ditinjau di Studio Artikel.`
          : `Naskah "${generatedArticle.title}" berhasil dibuat dan tersimpan. Poster visual dapat dibuat ulang nanti.`
      );

      console.log(`[StudioProcessor] Tugas asinkron #${job.id} selesai 100% dengan sukses. Canonical Trace ID: ${generatedArticle.canonicalTraceId}`);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      console.error(`[StudioProcessor] Kegagalan langkah kritis job #${job.id}: ${message}`);

      await withTenantContext(tenantId, async (tx) =>
        tx
          .update(contentPublications)
          .set({
            status: ContentStatus.DRAFT,
            excerpt: `[Pemrosesan Tertunda] ${message.slice(0, 450)}`,
            updatedAt: new Date(),
          })
          .where(and(
            eq(contentPublications.id, publicationId),
            eq(contentPublications.status, ContentStatus.GENERATING)
          ))
      ).catch(() => null);

      await this.emitProgress(tenantId, jobId, 100, `Pemrosesan tertunda: ${message}`, 'FAILED', undefined, message);
      throw error;
    }
  }

  private static async processPosterRegeneration(job: Job<StudioGenerationJobPayload>): Promise<void> {
    const { tenantId, publicationId, jobId } = job.data;

    try {
      await this.emitProgress(tenantId, jobId, 20, 'Memuat naskah tersimpan untuk membuat poster...');
      const article = await withTenantContext(tenantId, async (tx) => {
        const [record] = await tx
          .select({
            title: contentPublications.title,
            content: contentPublications.bodyContentMarkdown,
            excerpt: contentPublications.excerpt,
          })
          .from(contentPublications)
          .where(and(
            eq(contentPublications.id, publicationId),
            eq(contentPublications.tenantId, tenantId)
          ))
          .limit(1);
        return record;
      });

      if (!article?.content.trim()) throw new Error('Naskah artikel tidak tersedia untuk pembuatan poster.');

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
          .where(and(
            eq(mediaAssets.publicationId, publicationId),
            eq(mediaAssets.assetType, AssetType.DALLE_POSTER)
          ))
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

      const tenantBrandHex = await this.resolveTenantBrandColor(tenantId, member?.partyAffiliation);

      await this.emitProgress(tenantId, jobId, 40, 'Menghasilkan kanvas seni kolase baru...');

      // 4. Generate Background Kolase Tanpa Teks via AI Engine
      const backgroundResult = await this.aiEngine.generateCreativePosterBackground({
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

      await this.emitProgress(tenantId, jobId, 75, 'Merender tipografi vektor Satori & harmonisasi foto...');

      // 6. Komposisi deterministik Satori + Sharp (Base AI Collage + Multi-Column Vector Text + Harmonized Photo)
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
        primaryAccentColor: backgroundResult.blueprint.colorPalette.primaryAccent || tenantBrandHex,
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
        const uploadResult = await this.storageAdapter.uploadBuffer(composedPoster.buffer, {
          destinationPath: destPath,
          contentType: 'image/webp',
          contentLength: composedPoster.sizeBytes,
        });
        finalPublicUrl = uploadResult.publicUrl;
      } catch (storageErr) {
        console.warn(`[StudioProcessor] GCS/R2 buffer upload gagal, mencoba upload URL cadangan:`, storageErr);
        try {
          const uploadResult = await this.storageAdapter.uploadFromUrl(
            backgroundResult.temporaryImageUrl,
            destPath
          );
          finalPublicUrl = uploadResult.publicUrl;
          finalSizeBytes = uploadResult.sizeBytes;
        } catch (fallbackErr) {
          console.warn(`[StudioProcessor] Upload URL cadangan juga gagal, beralih ke data base64:`, fallbackErr);
          finalPublicUrl = `data:image/webp;base64,${composedPoster.buffer.toString('base64')}`;
        }
      }

      await withTenantContext(tenantId, async (tx) => {
        await tx
          .delete(mediaAssets)
          .where(and(
            eq(mediaAssets.publicationId, publicationId),
            eq(mediaAssets.assetType, AssetType.DALLE_POSTER)
          ));

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

      await this.emitProgress(tenantId, jobId, 100, 'Poster berhasil dibuat ulang.', 'COMPLETED', `/studio/artikel/${publicationId}`);
      await this.emitNotification(tenantId, 'Poster Berhasil Dibuat Ulang', `Poster untuk naskah "${article.title}" telah diperbarui.`);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      await this.emitProgress(tenantId, jobId, 100, 'Poster belum berhasil dibuat; naskah tetap aman.', 'FAILED', undefined, message);
      await this.emitNotification(tenantId, 'Poster Belum Berhasil Dibuat', 'Naskah tetap tersimpan. Pembuatan poster dapat dicoba kembali.');
      throw error;
    }
  }

  private static async processInfographicOnly(job: Job<StudioGenerationJobPayload>): Promise<void> {
    const data = job.data;
    const { tenantId, publicationId, jobId } = data;

    console.log(`[StudioProcessor] Memulai pemrosesan INFOGRAPHIC_ONLY #${job.id} (PubID: ${publicationId})...`);

    try {
      await this.emitProgress(tenantId, jobId, 15, 'Menganalisis konsep visual dan profil daerah...');

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

      const headlineText = data.headline || (cleanPrompt.length <= 80 ? cleanPrompt : cleanPrompt.slice(0, 77) + '...');
      const quoteText = `Transparansi Kebijakan dan Aspirasi Publik // ${dapilName.toUpperCase()}`;

      // Sesuai preferensi user: Jangan menempelkan foto profil user secara otomatis sebagai overlay poster
      const subjectPhotoBuffer: Buffer | undefined = undefined;
      const compositionMode: 'PUBLIC_ADVOCACY' | 'FIGURE_CENTERPIECE' =
        data.compositionMode || 'PUBLIC_ADVOCACY';

      const tenantBrandHex = await this.resolveTenantBrandColor(tenantId, member?.partyAffiliation);

      await this.emitProgress(tenantId, jobId, 35, 'Merumuskan naskah editorial dan komposisi visual...');

      // 3. Generate background visual tanpa teks
      const backgroundResult = await this.aiEngine.generateCreativePosterBackground({
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

      await this.emitProgress(tenantId, jobId, 70, 'Merender tipografi vektor Satori & grafis resolusi tinggi...');

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
        primaryAccentColor: backgroundResult.blueprint.colorPalette.primaryAccent || tenantBrandHex,
        canvasWidth: backgroundResult.compiledPrompt.canvasDimensions.width,
        canvasHeight: backgroundResult.compiledPrompt.canvasDimensions.height,
        editionTag: `POLARIS // ${dapilName.toUpperCase()}`,
        outputFormat: 'webp',
      });

      await this.emitProgress(tenantId, jobId, 85, 'Menyimpan aset infografis HD...');

      // 6. Multi-tier upload
      let finalPublicUrl = backgroundResult.temporaryImageUrl;
      let finalSizeBytes = composedPoster.sizeBytes;
      const destPath = `posters/${tenantId}/${Date.now()}-${publicationId}.webp`;

      try {
        const uploadResult = await this.storageAdapter.uploadBuffer(composedPoster.buffer, {
          destinationPath: destPath,
          contentType: 'image/webp',
          contentLength: composedPoster.sizeBytes,
        });
        finalPublicUrl = uploadResult.publicUrl;
      } catch (storageErr) {
        console.warn(`[StudioProcessor] Buffer upload gagal, beralih ke fallback:`, storageErr);
        try {
          const uploadResult = await this.storageAdapter.uploadFromUrl(
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

      await this.emitProgress(
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

      await this.emitNotification(
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
          .where(and(
            eq(contentPublications.id, publicationId),
            eq(contentPublications.status, ContentStatus.GENERATING)
          ))
      ).catch(() => null);

      await this.emitProgress(tenantId, jobId, 100, `Pemrosesan infografis gagal: ${message}`, 'FAILED', undefined, message);
      throw error;
    }
  }
}
