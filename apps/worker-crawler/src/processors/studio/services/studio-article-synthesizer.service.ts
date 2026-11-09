import { sql, eq } from 'drizzle-orm';
import {
  db,
  contentPublications,
  socialSyndicationPacks,
  tenantQuotaLedgers,
  findSimilarKnowledgeChunks,
  withTenantContext,
  researchJobs,
  researchOutputs,
} from '@polaris/database';
import {
  OpenAIAIEngineAdapter,
  ContextCapsuleBuilder,
  AutonomousResearchOrchestrator,
  DeterministicQualityGates,
  PartyIdeologyResolver,
} from '@polaris/ai-engine';
import { ContentStatus, ResearchJobStatus } from '@polaris/shared-types';
import { StudioContextHelper } from '../studio-context.helper.js';
import { ParsedAttachmentDocument } from './studio-attachment-pipeline.service.js';

export interface SynthesizeArticleOptions {
  tenantId: string;
  publicationId: string;
  jobId: string;
  topic: string;
  prompt?: string;
  targetRegion: string;
  dapilName: string;
  queryVector: number[] | null;
  parsedDocuments: ParsedAttachmentDocument[];
  externalUrls?: string[];
  referencedUrls?: string[];
  targetAudience?: string;
  targetLength?: string;
  writingStyle?: string;
  framingStance?: string;
  toneOverride?: string;
  comparisonRegion?: string;
  member?: {
    partyAffiliation?: string | null;
    fullName?: string | null;
  };
  checkpoints: Record<string, any>;
  existingPub?: {
    title?: string | null;
    excerpt?: string | null;
    bodyContentMarkdown?: string | null;
    wordCount?: number | null;
    researchJobId?: string | null;
  };
  aiEngine: OpenAIAIEngineAdapter;
}

export interface SynthesizeArticleResult {
  article: {
    title: string;
    excerpt: string;
    contentMarkdown: string;
    wordCount: number;
    totalTokensUsed: number;
    canonicalTraceId: string;
  };
  socialPack: {
    instagramCaption: string;
    twitterThreads: string[];
    whatsappBroadcast: string;
  };
  researchJobId?: string;
  groundedEvidenceText: string;
  evidenceMap: Map<string, string>;
  isAlreadyCheckpointed: boolean;
}

export class StudioArticleSynthesizerService {
  /**
   * Mengorkestrasi sintesis naskah kebijakan:
   * 1. Riset Otonom (Autonomous Research Pipeline: Planner, Multi-Source, Evidence Spans) dengan Checkpoint Idempotency
   * 2. Resolusi Doktrin Ideologi Partai Politik (PartyIdeologyResolver)
   * 3. Penyusunan Context Capsule Grounding
   * 4. Sintesis Naskah Panjang Dua Tahap (TwoStageArticleEngine)
   * 5. Deterministic Quality Control Gate & BR-05 Self-Healing Citation Gate
   * 6. Pembuatan Social Syndication Pack (Instagram, X/Twitter, WhatsApp)
   * 7. Transaksi database atomik (content_publications, tenant_quota_ledgers, social_syndication_packs)
   */
  public static async synthesizeArticle(
    options: SynthesizeArticleOptions
  ): Promise<SynthesizeArticleResult> {
    const {
      tenantId,
      publicationId,
      jobId,
      topic,
      prompt,
      targetRegion,
      dapilName,
      queryVector,
      parsedDocuments,
      externalUrls,
      referencedUrls,
      targetAudience,
      targetLength,
      writingStyle,
      framingStance,
      toneOverride,
      comparisonRegion,
      member,
      checkpoints,
      existingPub,
      aiEngine,
    } = options;

    // -------------------------------------------------------------------------
    // LANGKAH 1: Autonomous Research Pipeline dengan Checkpoint Idempotency
    // -------------------------------------------------------------------------
    await StudioContextHelper.emitProgress(
      tenantId,
      jobId,
      20,
      'Menjalankan Riset Otonom & Pencarian Bukti Terverifikasi...'
    );

    let researchJobId: string | undefined =
      checkpoints.researchJobId || existingPub?.researchJobId || undefined;
    let groundedEvidenceText =
      typeof checkpoints.groundedEvidenceText === 'string'
        ? checkpoints.groundedEvidenceText
        : '';
    let evidenceMap = new Map<string, string>(
      Array.isArray(checkpoints.evidenceEntries) ? checkpoints.evidenceEntries : []
    );

    if (checkpoints.researchDone && groundedEvidenceText) {
      console.log(
        `[StudioArticleSynthesizer] Checkpoint Riset Otonom ditemukan untuk PubID ${publicationId}; melewati eksekusi ulang riset.`
      );
    } else {
      try {
        const researchResult = await AutonomousResearchOrchestrator.executeResearchPipeline({
          tenantId,
          topic,
          userPrompt: prompt || topic,
          targetRegion,
          queryEmbedding: queryVector || undefined,
          attachedDocuments: parsedDocuments,
          providedUrls: externalUrls || referencedUrls || [],
          onProgress: async (step, pct) => {
            const scaledPct = Math.round(20 + (pct / 100) * 15);
            await StudioContextHelper.emitProgress(tenantId, jobId, scaledPct, step);
          },
        });
        researchJobId = researchResult.jobId;
        groundedEvidenceText = researchResult.groundedContextText;
        evidenceMap = researchResult.evidenceIdMap;

        checkpoints.researchDone = true;
        checkpoints.researchJobId = researchJobId || null;
        checkpoints.groundedEvidenceText = groundedEvidenceText.slice(0, 25000);
        checkpoints.evidenceEntries = Array.from(evidenceMap.entries());

        await db
          .update(contentPublications)
          .set({
            researchJobId: researchJobId || null,
            generationCheckpoints: checkpoints,
            updatedAt: new Date(),
          })
          .where(eq(contentPublications.id, publicationId))
          .catch(() => null);
      } catch (researchErr: any) {
        console.warn(
          `[StudioArticleSynthesizer] Autonomous research error, fallback ke RAG dasar: ${researchErr.message}`
        );
      }
    }

    const similarChunks = queryVector
      ? await findSimilarKnowledgeChunks(queryVector, 3, targetRegion, 0.6)
      : [];

    // -------------------------------------------------------------------------
    // LANGKAH 2: Resolusi Doktrin Ideologi Partai Politik Tokoh Dewan
    // -------------------------------------------------------------------------
    let partyDirectiveStr: string | undefined;
    if (member?.partyAffiliation) {
      try {
        const resolvedDirective = await PartyIdeologyResolver.resolveDirective({
          partyAffiliation: member.partyAffiliation,
          topic,
        });
        partyDirectiveStr = resolvedDirective.promptInstructions;
      } catch (ideologyErr: any) {
        console.warn(
          `[StudioArticleSynthesizer] Gagal resolve party ideology: ${ideologyErr.message}`
        );
      }
    }

    // -------------------------------------------------------------------------
    // LANGKAH 3: Penyusunan Grounding Context Capsule
    // -------------------------------------------------------------------------
    const baseContext = ContextCapsuleBuilder.assembleContext({
      regionName: `${dapilName} (${targetRegion})`,
      regulations: similarChunks.map((c) => ({
        reference: c.structuralReference,
        content: c.chunkContent,
      })),
      recentNews: [],
      comparisonRegionData: comparisonRegion
        ? `Perbandingan: ${comparisonRegion}`
        : undefined,
      attachedDocuments: parsedDocuments,
      framingStance,
      partyIdeologyDirective: partyDirectiveStr,
    });

    const contextPayload = groundedEvidenceText
      ? `${baseContext}\n\n${groundedEvidenceText}`
      : baseContext;

    // -------------------------------------------------------------------------
    // LANGKAH 4: Sintesis Naskah Kebijakan Panjang (Two-Stage GPT-4o)
    // -------------------------------------------------------------------------
    await StudioContextHelper.emitProgress(
      tenantId,
      jobId,
      35,
      'Menyusun Naskah Kebijakan Modular Berantai...'
    );

    const isArticleAlreadyCheckpointed = Boolean(
      checkpoints.articleDone &&
        existingPub?.bodyContentMarkdown &&
        (existingPub.wordCount ?? 0) > 100
    );

    const generatedArticle = isArticleAlreadyCheckpointed
      ? {
          title: existingPub!.title || topic,
          excerpt: existingPub!.excerpt || '',
          contentMarkdown: existingPub!.bodyContentMarkdown!,
          wordCount: existingPub!.wordCount || 0,
          totalTokensUsed: 0,
          canonicalTraceId: String(checkpoints.canonicalTraceId || `checkpoint-${publicationId}`),
        }
      : await aiEngine.generateArticle({
          topic,
          regionalContextData: contextPayload,
          targetAudience,
          targetLength,
          writingStyle,
          framingStance,
          toneOverride,
          partyAffiliation: member?.partyAffiliation || null,
          partyIdeologyDirective: partyDirectiveStr,
          tenantId,
          onProgress: async (step, pct) => {
            await StudioContextHelper.emitProgress(tenantId, jobId, pct, step);
          },
        });

    let socialPack = {
      instagramCaption: '',
      twitterThreads: [] as string[],
      whatsappBroadcast: `*${generatedArticle.title}*\n\n${generatedArticle.excerpt}`,
    };

    if (!isArticleAlreadyCheckpointed) {
      // -----------------------------------------------------------------------
      // LANGKAH 5: Deterministic Quality Control Gate & BR-05 Self-Healing Gate
      // -----------------------------------------------------------------------
      const validEvidenceKeys = new Set(evidenceMap.keys());
      let qcResult = DeterministicQualityGates.verifyCitationQualityControl(
        generatedArticle.contentMarkdown,
        validEvidenceKeys
      );

      // BR-05: Self-Healing Anti-Rogue Citation Gate
      if (qcResult.rogueCitations && qcResult.rogueCitations.length > 0) {
        console.warn(
          `[StudioArticleSynthesizer] Terdeteksi ${qcResult.rogueCitations.length} rogue citation fiktif: [${qcResult.rogueCitations.join(', ')}]. Menjalankan Self-Healing Citation Gate...`
        );
        let healedMarkdown = generatedArticle.contentMarkdown;
        for (const rogueId of qcResult.rogueCitations) {
          const escaped = rogueId.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
          const rogueRegex = new RegExp(`\\[(?:\\^|Bukti:?\\s*)?${escaped}\\]`, 'gi');
          healedMarkdown = healedMarkdown.replace(rogueRegex, '');
        }
        healedMarkdown = healedMarkdown.replace(/[ \t]{2,}([.,;])/g, '$1');
        generatedArticle.contentMarkdown = healedMarkdown;

        // Re-evaluasi QC setelah pembersihan deterministik
        qcResult = DeterministicQualityGates.verifyCitationQualityControl(
          generatedArticle.contentMarkdown,
          validEvidenceKeys
        );
      }

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
          console.warn(
            `[StudioArticleSynthesizer] Gagal menyimpan research outputs: ${dbErr.message}`
          );
        }
      }

      // -----------------------------------------------------------------------
      // LANGKAH 6: Pembuatan Social Syndication Snippets
      // -----------------------------------------------------------------------
      try {
        const generatedSocialPack = await aiEngine.generateSocialSnippets(
          generatedArticle.contentMarkdown,
          tenantId
        );
        socialPack = {
          instagramCaption: generatedSocialPack.instagramCaption || '',
          twitterThreads: generatedSocialPack.twitterThreads || [],
          whatsappBroadcast:
            generatedSocialPack.whatsappBroadcast || socialPack.whatsappBroadcast,
        };
      } catch (error: unknown) {
        const message = error instanceof Error ? error.message : String(error);
        console.warn(
          `[StudioArticleSynthesizer] Social pack gagal dibuat; memakai ringkasan artikel: ${message}`
        );
      }

      await StudioContextHelper.emitProgress(
        tenantId,
        jobId,
        69,
        'Menyimpan naskah dan paket teks...'
      );

      // Self-healing sanitizer akhir untuk rogue citations
      let finalMarkdown = generatedArticle.contentMarkdown;
      if (qcResult.rogueCitations && qcResult.rogueCitations.length > 0) {
        for (const rogueId of qcResult.rogueCitations) {
          const rogueRegex = new RegExp(`\\[(?:\\^|Bukti:?\\s*)?${rogueId}\\]`, 'gi');
          finalMarkdown = finalMarkdown.replace(rogueRegex, '');
        }
      }

      checkpoints.articleDone = true;
      checkpoints.socialDone = true;
      checkpoints.canonicalTraceId = generatedArticle.canonicalTraceId;

      // -----------------------------------------------------------------------
      // LANGKAH 7: Transaksi Penyimpanan Atomik
      // -----------------------------------------------------------------------
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
            generationCheckpoints: checkpoints,
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
            totalTokensConsumed: 0,
            estimatedCostUsd: '0.00000',
          })
          .onConflictDoUpdate({
            target: [tenantQuotaLedgers.tenantId, tenantQuotaLedgers.billingCycleMonth],
            set: {
              articleUsed: sql`${tenantQuotaLedgers.articleUsed} + 1`,
              updatedAt: new Date(),
            },
          });

        await tx
          .insert(socialSyndicationPacks)
          .values({
            publicationId,
            instagramCaption: socialPack.instagramCaption,
            twitterThreads: socialPack.twitterThreads,
            whatsappBroadcastText: socialPack.whatsappBroadcast,
          })
          .onConflictDoUpdate({
            target: socialSyndicationPacks.publicationId,
            set: {
              instagramCaption: socialPack.instagramCaption,
              twitterThreads: socialPack.twitterThreads,
              whatsappBroadcastText: socialPack.whatsappBroadcast,
            },
          });
      });
    } else {
      console.log(
        `[StudioArticleSynthesizer] Checkpoint Naskah 5-Bab ditemukan untuk PubID ${publicationId}; melewati sintesis ulang GPT-4o.`
      );
    }

    return {
      article: generatedArticle,
      socialPack,
      researchJobId,
      groundedEvidenceText,
      evidenceMap,
      isAlreadyCheckpointed: isArticleAlreadyCheckpointed,
    };
  }
}

