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
} from '@polaris/database';
import { OpenAIAIEngineAdapter, ContextCapsuleBuilder } from '@polaris/ai-engine';
import { CloudflareR2StorageAdapter } from '@polaris/storage';
import { ContentStatus, AssetType } from '@polaris/shared-types';
import { AiCostCalculator } from '@polaris/core-domain';
import { StudioGenerationJobPayload } from '../queues/studio.queue.js';
import { redisConnection } from '../config/redis.connection.js';

export class StudioGenerationProcessor {
  private static readonly aiEngine = new OpenAIAIEngineAdapter();
  private static readonly storageAdapter = new CloudflareR2StorageAdapter();

  private static async emitProgress(
    tenantId: string,
    jobId: string,
    percent: number,
    step: string,
    status: 'RUNNING' | 'COMPLETED' | 'FAILED' = 'RUNNING',
    resultUrl?: string,
    errorDetails?: string
  ) {
    const payload = {
      jobId,
      percent,
      step,
      status,
      resultUrl,
      errorDetails,
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

      const similarChunks = queryVector
        ? await findSimilarKnowledgeChunks(queryVector, 3, targetRegion, 0.60)
        : [];

      const contextPayload = ContextCapsuleBuilder.assembleContext({
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

      // -----------------------------------------------------------------------
      // LANGKAH 2 (50%): Sintesis Naskah Kebijakan Panjang (GPT-4o)
      // Telemetri Langfuse dan ai_trace_logs otomatis tersinkronisasi 1:1 via AiTelemetryService
      // -----------------------------------------------------------------------
      await this.emitProgress(tenantId, jobId, 50, 'Menyusun Naskah Kebijakan Teknokratis 3.000 Kata...');

      const generatedArticle = await this.aiEngine.generateArticle({
        topic: data.topic,
        regionalContextData: contextPayload,
        targetAudience: data.targetAudience,
        tenantId,
      });

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
      await this.emitProgress(tenantId, jobId, 70, 'Menyimpan naskah dan paket teks...');
      const textCostUsd = AiCostCalculator.calculateCostUsd(generatedArticle.totalTokensUsed, 0);
      await withTenantContext(tenantId, async (tx) => {
        await tx
          .update(contentPublications)
          .set({
            title: generatedArticle.title,
            excerpt: generatedArticle.excerpt,
            bodyContentMarkdown: generatedArticle.contentMarkdown,
            wordCount: generatedArticle.wordCount,
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

      let posterSucceeded = !data.generateDallePoster;
      let posterFailure: string | undefined;
      if (data.generateDallePoster) {
        await this.emitProgress(tenantId, jobId, 85, 'Merender poster visual; naskah telah tersimpan...');
        try {
          const infographicSpec = await this.aiEngine.generateInfographicSpec(generatedArticle.contentMarkdown, tenantId);
          const dallePrompt = await this.aiEngine.generateDallePrompt(infographicSpec);
          const dalleResult = await this.aiEngine.generateDalleImage(dallePrompt, tenantId);
          const uploadResult = await this.storageAdapter.uploadFromUrl(
            dalleResult.temporaryImageUrl,
            `posters/${tenantId}/${Date.now()}-${publicationId}.webp`
          );

          await withTenantContext(tenantId, async (tx) => {
            await tx.insert(mediaAssets).values({
              publicationId,
              assetType: AssetType.DALLE_POSTER,
              r2StorageUrl: uploadResult.publicUrl,
              cdnPublicUrl: uploadResult.publicUrl,
              promptUsed: dallePrompt,
              mimeType: 'image/webp',
              fileSizeBytes: uploadResult.sizeBytes,
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

      await this.emitProgress(tenantId, jobId, 55, 'Menyusun spesifikasi infografis dari naskah...');
      const infographicSpec = await this.aiEngine.generateInfographicSpec(article.content, tenantId);
      const dallePrompt = await this.aiEngine.generateDallePrompt(infographicSpec);
      const dalleResult = await this.aiEngine.generateDalleImage(dallePrompt, tenantId);
      const uploadResult = await this.storageAdapter.uploadFromUrl(
        dalleResult.temporaryImageUrl,
        `posters/${tenantId}/${Date.now()}-${publicationId}.webp`
      );

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
          r2StorageUrl: uploadResult.publicUrl,
          cdnPublicUrl: uploadResult.publicUrl,
          promptUsed: dallePrompt,
          mimeType: 'image/webp',
          fileSizeBytes: uploadResult.sizeBytes,
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
}
