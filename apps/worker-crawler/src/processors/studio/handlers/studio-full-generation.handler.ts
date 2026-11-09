import { Job } from 'bullmq';
import { and, eq } from 'drizzle-orm';
import {
  db,
  contentPublications,
  tenantMembers,
  electoralDistricts,
  withTenantContext,
} from '@polaris/database';
import { OpenAIAIEngineAdapter } from '@polaris/ai-engine';
import { CloudflareR2StorageAdapter } from '@polaris/storage';
import { ContentStatus } from '@polaris/shared-types';
import { StudioGenerationJobPayload } from '../../../queues/studio.queue.js';
import { StudioContextHelper } from '../studio-context.helper.js';
import {
  StudioAttachmentPipelineService,
  StudioArticleSynthesizerService,
  StudioPosterSynthesizerService,
} from '../services/index.js';

export class StudioFullGenerationHandler {
  /**
   * Facade Orchestrator untuk Pemrosesan Generasi Konten Terpadu:
   * 1. Resolusi Identitas Wilayah, Dapil, & Query Embedding Topik
   * 2. Multimodal Ingestion, Deduplikasi SHA-256, OCR, & RAG Chunking (StudioAttachmentPipelineService)
   * 3. Riset Otonom, Ideologi Partai, Sintesis 5-Bab, QC Gate, & Social Pack (StudioArticleSynthesizerService)
   * 4. Progressive Delivery & Render Visual Editorial Poster (StudioPosterSynthesizerService)
   */
  public static async execute(
    job: Job<StudioGenerationJobPayload>,
    aiEngine: OpenAIAIEngineAdapter,
    storageAdapter: CloudflareR2StorageAdapter
  ): Promise<void> {
    const data = job.data;
    const { tenantId, publicationId, jobId } = data;

    console.log(
      `[StudioProcessor] Memulai pemrosesan tugas asinkron #${job.id} (PubID: ${publicationId})...`
    );

    try {
      // -----------------------------------------------------------------------
      // LANGKAH 1 (20%): Resolusi Profil Tokoh, Wilayah & Query Embedding
      // -----------------------------------------------------------------------
      await StudioContextHelper.emitProgress(
        tenantId,
        jobId,
        20,
        'Menyusuri Konteks Regulasi & Analisis Dokumen Lampiran...'
      );

      const [member] = await db
        .select({
          fullName: tenantMembers.fullName,
          partyAffiliation: tenantMembers.partyAffiliation,
          dapilId: tenantMembers.electoralDistrictId,
          customDapil: tenantMembers.customDapilName,
          personalCoverage: tenantMembers.personalCoverage,
          photoUrl: tenantMembers.photoUrl,
          commissionName: tenantMembers.commissionName,
          legislativeLevel: tenantMembers.legislativeLevel,
        })
        .from(tenantMembers)
        .where(eq(tenantMembers.id, tenantId))
        .limit(1);

      let targetRegion = member?.personalCoverage?.[0] || 'NASIONAL';
      let dapilName = member?.customDapil || 'Dapil';
      let resolvedDapilCode: string | null = null;

      if (member?.dapilId) {
        const [dapil] = await db
          .select({
            id: electoralDistricts.id,
            dapilCode: electoralDistricts.dapilCode,
            dapilName: electoralDistricts.dapilName,
            regencyCoverage: electoralDistricts.regencyCoverage,
          })
          .from(electoralDistricts)
          .where(eq(electoralDistricts.id, member.dapilId))
          .limit(1);

        if (dapil) {
          resolvedDapilCode = dapil.dapilCode;
          if (!member.customDapil) dapilName = dapil.dapilName;
          if (!member.personalCoverage || member.personalCoverage.length === 0) {
            targetRegion = dapil.regencyCoverage?.[0] || 'NASIONAL';
          }
        }
      }
      if (!resolvedDapilCode) {
        resolvedDapilCode = member?.customDapil || null;
      }

      // Vektor Grounding Otentik (RAG) untuk Topik
      let queryVector: number[] | null = null;
      try {
        const embedResult = await aiEngine.generateEmbedding(data.topic, tenantId);
        queryVector = embedResult.embedding;
      } catch (err: any) {
        console.warn(`[StudioProcessor] Query embedding gagal: ${err.message}`);
      }

      // -----------------------------------------------------------------------
      // LANGKAH 2: Multimodal Ingestion & Lampiran Lapangan (Pipeline Service)
      // -----------------------------------------------------------------------
      const parsedDocuments = await StudioAttachmentPipelineService.processAttachments({
        tenantId,
        attachments: data.attachments,
        queryVector,
        resolvedDapilCode,
        member,
      });

      // -----------------------------------------------------------------------
      // LANGKAH 3: Checkpoint Idempotency & Sintesis Naskah (Synthesizer Service)
      // -----------------------------------------------------------------------
      const [existingPub] = await db
        .select({
          title: contentPublications.title,
          excerpt: contentPublications.excerpt,
          bodyContentMarkdown: contentPublications.bodyContentMarkdown,
          wordCount: contentPublications.wordCount,
          researchJobId: contentPublications.researchJobId,
          generationCheckpoints: contentPublications.generationCheckpoints,
        })
        .from(contentPublications)
        .where(eq(contentPublications.id, publicationId))
        .limit(1);

      const checkpoints: Record<string, any> =
        existingPub?.generationCheckpoints && typeof existingPub.generationCheckpoints === 'object'
          ? { ...(existingPub.generationCheckpoints as Record<string, any>) }
          : {};

      const synthesisResult = await StudioArticleSynthesizerService.synthesizeArticle({
        tenantId,
        publicationId,
        jobId,
        topic: data.topic,
        prompt: data.prompt,
        targetRegion,
        dapilName,
        queryVector,
        parsedDocuments,
        externalUrls: data.externalUrls,
        referencedUrls: data.referencedUrls,
        targetAudience: data.targetAudience,
        targetLength: data.targetLength,
        writingStyle: data.writingStyle,
        framingStance: data.framingStance,
        toneOverride: data.toneOverride,
        comparisonRegion: data.comparisonRegion,
        member,
        checkpoints,
        existingPub,
        aiEngine,
      });

      const { article: generatedArticle, groundedEvidenceText } = synthesisResult;

      // -----------------------------------------------------------------------
      // LANGKAH 4: Progressive Instant Delivery (Teks 100% Siap)
      // -----------------------------------------------------------------------
      await StudioContextHelper.emitProgress(
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

      // -----------------------------------------------------------------------
      // LANGKAH 5: Visual Editorial Poster Pipeline (Opsional)
      // -----------------------------------------------------------------------
      const shouldGeneratePoster = Boolean(
        data.generateDallePoster && data.taskType !== 'ARTICLE_ONLY'
      );
      let posterSucceeded = !shouldGeneratePoster;
      let posterFailure: string | undefined;

      if (shouldGeneratePoster) {
        await StudioContextHelper.emitProgress(
          tenantId,
          jobId,
          85,
          'Merender poster visual berestetika tinggi; naskah telah tersimpan...'
        );

        const posterResult = await StudioPosterSynthesizerService.synthesizePoster({
          tenantId,
          publicationId,
          jobId,
          topic: data.topic,
          articleTitle: generatedArticle.title,
          articleExcerpt: generatedArticle.excerpt,
          articleContent: generatedArticle.contentMarkdown,
          groundedEvidenceText,
          member,
          dapilName,
          forcedArchetype: data.forcedArchetype,
          layoutVariant: data.layoutVariant,
          enableImg2ImgPass: data.enableImg2ImgPass,
          img2ImgDenoisingStrength: data.img2ImgDenoisingStrength,
          aiEngine,
          storageAdapter,
          onProgress: async (step, pct) => {
            await StudioContextHelper.emitProgress(tenantId, jobId, pct, step);
          },
        });

        posterSucceeded = posterResult.succeeded;
        posterFailure = posterResult.error;
      }

      // -----------------------------------------------------------------------
      // LANGKAH 6 (100%): Finalisasi & Notifikasi
      // -----------------------------------------------------------------------
      const completionStep = posterSucceeded
        ? 'Selesai! Naskah dan materi yang tersedia siap ditinjau.'
        : 'Naskah artikel berhasil dibuat (Poster visual tertunda).';

      await StudioContextHelper.emitProgress(
        tenantId,
        jobId,
        100,
        completionStep,
        'COMPLETED',
        `/studio/artikel`,
        posterFailure
      );

      await StudioContextHelper.emitNotification(
        tenantId,
        posterSucceeded ? 'Naskah Kebijakan Selesai!' : 'Naskah Tersimpan, Poster Tertunda',
        posterSucceeded
          ? `Naskah "${generatedArticle.title}" siap ditinjau di Studio Artikel.`
          : `Naskah "${generatedArticle.title}" berhasil dibuat dan tersimpan. Poster visual dapat dibuat ulang nanti.`
      );

      console.log(
        `[StudioProcessor] Tugas asinkron #${job.id} selesai 100% dengan sukses. Canonical Trace ID: ${generatedArticle.canonicalTraceId}`
      );
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
        `Pemrosesan tertunda: ${message}`,
        'FAILED',
        undefined,
        message
      );
      throw error;
    }
  }
}
