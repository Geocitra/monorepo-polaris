import { Job } from 'bullmq';
import { eq } from 'drizzle-orm';
import { contentPublications, withTenantContext } from '@polaris/database';
import { OpenAIAIEngineAdapter } from '@polaris/ai-engine';
import { CloudflareR2StorageAdapter } from '@polaris/storage';
import { ContentStatus } from '@polaris/shared-types';
import { StudioGenerationJobPayload } from '../../../queues/studio.queue.js';
import { StudioContextHelper } from '../studio-context.helper.js';
import { StudioPosterSynthesizerService } from '../services/index.js';

export class StudioInfographicGenerationHandler {
  /**
   * Orchestrator Modular untuk Generasi Visual Standalone (POSTER_ONLY & INFOGRAPHIC_ONLY):
   * 1. Deteksi mode visual secara tegas (Poster vs Infografis)
   * 2. Resolusi profil tokoh & wilayah (StudioContextHelper.resolveMemberAndRegion)
   * 3. Unified Grounding: Dokumen Upload (attachments) + URL + RAG DB + Berita (StudioContextHelper.buildStandaloneGroundingContext)
   * 4. Sintesis Visual ATM & Penyimpanan Konsisten (StudioPosterSynthesizerService.synthesizePoster)
   */
  public static async execute(
    job: Job<StudioGenerationJobPayload>,
    aiEngine: OpenAIAIEngineAdapter,
    storageAdapter: CloudflareR2StorageAdapter
  ): Promise<void> {
    const data = job.data;
    const { tenantId, publicationId, jobId } = data;

    const isPosterMode =
      data.taskType === 'POSTER_ONLY' ||
      data.visualFormat === 'poster' ||
      data.style === 'poster' ||
      data.style === 'photo' ||
      data.style === 'illustration';
    const visualFormat: 'poster' | 'infographic' = isPosterMode ? 'poster' : 'infographic';
    const modeLabel = isPosterMode ? 'Poster Visual' : 'Infografis Data';

    console.log(
      `[StudioProcessor] Memulai pemrosesan ${isPosterMode ? 'POSTER_ONLY' : 'INFOGRAPHIC_ONLY'} #${job.id} (PubID: ${publicationId})...`
    );

    try {
      await StudioContextHelper.emitProgress(
        tenantId,
        jobId,
        15,
        `Menganalisis konsep ${modeLabel} dan profil wilayah...`
      );

      // 1. Resolusi profil tokoh & cakupan wilayah
      const { member, dapilName, targetRegion, resolvedDapilCode } =
        await StudioContextHelper.resolveMemberAndRegion(tenantId);

      // 2. Bersihkan teks prompt dari prefix teknis
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

      await StudioContextHelper.emitProgress(
        tenantId,
        jobId,
        28,
        `Menghimpun konteks data, dokumen lampiran, & referensi untuk ${modeLabel}...`
      );

      // 3. Unified Grounding (Attachments + External URLs + RAG DB + Berita Wilayah)
      const groundedContextSummary = await StudioContextHelper.buildStandaloneGroundingContext({
        tenantId,
        cleanTopic: cleanPrompt,
        dapilName,
        targetRegion,
        resolvedDapilCode,
        member,
        attachments: data.attachments,
        externalUrls: data.externalUrls,
        aiEngine,
      });

      // 4. Sintesis Visual Satu Pintu (Poster atau Infografis)
      const synthesisResult = await StudioPosterSynthesizerService.synthesizePoster({
        tenantId,
        publicationId,
        jobId,
        topic: cleanPrompt,
        articleTitle: data.headline || cleanPrompt,
        groundedEvidenceText: groundedContextSummary,
        member,
        dapilName,
        visualFormat,
        isStandaloneVisual: true,
        forcedArchetype: data.forcedArchetype,
        layoutVariant: data.layoutVariant,
        enableImg2ImgPass: data.enableImg2ImgPass,
        img2ImgDenoisingStrength: data.img2ImgDenoisingStrength,
        variationKey: `${publicationId}:${jobId}`,
        operatorId: data.operatorId,
        channel: data.channel || 'WEB_STUDIO',
        requestId: data.requestId || jobId,
        aiEngine,
        storageAdapter,
        onProgress: async (step, pct) => {
          await StudioContextHelper.emitProgress(tenantId, jobId, pct, step);
        },
      });

      if (!synthesisResult.succeeded || !synthesisResult.publicUrl) {
        throw new Error(synthesisResult.error || `Gagal menghasilkan ${modeLabel}.`);
      }

      await StudioContextHelper.emitProgress(
        tenantId,
        jobId,
        100,
        `${modeLabel} selesai dan siap digunakan!`,
        'COMPLETED',
        synthesisResult.publicUrl,
        undefined,
        true,
        publicationId
      );

      await StudioContextHelper.emitNotification(
        tenantId,
        `${modeLabel} Selesai!`,
        `Desain "${synthesisResult.headline || cleanPrompt.slice(0, 50)}" siap ditinjau dan diunduh.`,
        '/studio/infografis'
      );

      console.log(
        `[StudioProcessor] Tugas ${isPosterMode ? 'POSTER_ONLY' : 'INFOGRAPHIC_ONLY'} #${job.id} selesai 100% dengan sukses (${synthesisResult.archetype}).`
      );
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      console.error(`[StudioProcessor] Kegagalan visual standalone #${job.id}: ${message}`);

      await withTenantContext(tenantId, async (tx) => {
        await tx
          .update(contentPublications)
          .set({
            title: `Gagal Membuat ${modeLabel}: ${data.topic.slice(0, 40)}`,
            excerpt: `Error sistem: ${message.slice(0, 120)}`,
            bodyContentMarkdown: `# Pemrosesan ${modeLabel} Terhenti\n\nSistem mengalami kendala saat memproses permintaan Anda: \`${message}\`.\n\nSilakan coba kembali beberapa saat lagi.`,
            status: ContentStatus.DRAFT,
            updatedAt: new Date(),
          })
          .where(eq(contentPublications.id, publicationId));
      }).catch(() => {});

      await StudioContextHelper.emitProgress(
        tenantId,
        jobId,
        100,
        `Gagal merender ${modeLabel}.`,
        'FAILED',
        undefined,
        message
      );

      throw error;
    }
  }
}
