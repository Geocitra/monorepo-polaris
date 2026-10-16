import {
  db,
  researchJobs,
  researchQuestions,
  sources,
  researchJobSources,
  sourceVersions,
  sourceAssessments,
  evidenceSpans,
  claims,
  claimEvidence,
  researchOutputs,
  eq,
} from '@polaris/database';
import {
  ResearchJobStatus,
  SourceType,
  PublisherType,
  SourceLifecycle,
  ClaimStatus,
  SupportType,
} from '@polaris/shared-types';

import { ResearchPlannerEngine, ResearchPlanInput, ResearchPlanOutput } from './research-planner.engine.js';

import { AcademicDiscoveryConnector } from './connectors/academic-discovery.connector.js';
import { InternalKnowledgeConnector } from './connectors/internal-knowledge.connector.js';
import { WebDiscoveryConnector } from './connectors/web-discovery.connector.js';
import { SourceCredibilityAssessor } from './source-credibility.assessor.js';
import { ClaimEvidenceExtractor } from './claim-evidence.extractor.js';
import { DeterministicQualityGates } from './deterministic-gates.js';

export interface AutonomousResearchJobInput {
  tenantId: string;
  topic: string;
  userPrompt: string;
  targetRegion: string;
  queryEmbedding?: number[];
  attachedDocuments?: Array<{ name: string; type: string; extractedContent: string }>;
  providedUrls?: string[];
  onProgress?: (step: string, percent: number) => Promise<void> | void;
}

export interface AutonomousResearchJobResult {
  jobId: string;
  mainTopic: string;
  evidenceSufficient: boolean;
  qcPassed: boolean;
  totalSourcesEvaluated: number;
  verifiedSourcesCount: number;
  totalEvidenceSpans: number;
  claimsCount: number;
  groundedContextText: string;
  evidenceIdMap: Map<string, string>; // Maps "EV-1" to database UUID
}

export class AutonomousResearchOrchestrator {
  /**
   * Menjalankan siklus riset otonom POLARIS secara menyeluruh (End-to-End Autonomous Research)
   */
  public static async executeResearchPipeline(
    input: AutonomousResearchJobInput
  ): Promise<AutonomousResearchJobResult> {
    const emit = async (msg: string, pct: number) => {
      if (input.onProgress) {
        await input.onProgress(msg, pct);
      }
    };

    // 1. Inisialisasi Job Riset di Basis Data
    await emit('Menginisialisasi sesi riset otonom di database...', 5);
    const [job] = await db
      .insert(researchJobs)
      .values({
        tenantId: input.tenantId,
        topic: input.topic,
        userPrompt: input.userPrompt,
        targetRegion: input.targetRegion,
        status: ResearchJobStatus.PLANNING,
      })
      .returning();

    const jobId = job.id;

    // 2. TAHAP 1: Research Planner (Divide-and-Conquer Questions)
    await emit('Merumuskan pertanyaan riset kausal & parameter bukti...', 12);
    const attachedSummary = (input.attachedDocuments || [])
      .map((d) => `[${d.name}]: ${d.extractedContent.slice(0, 500)}`)
      .join('\n');

    const plan: ResearchPlanOutput = await ResearchPlannerEngine.createPlan({
      userPrompt: input.userPrompt,
      targetRegion: input.targetRegion,
      attachedDocsSummary: attachedSummary,
      providedUrls: input.providedUrls,
      tenantId: input.tenantId,
    });

    // Simpan daftar pertanyaan riset ke tabel research_questions
    const insertedQuestions: Array<{ id: string; question: string; minRequiredEvidence: number }> = [];
    for (const q of plan.questions) {
      const [qRow] = await db
        .insert(researchQuestions)
        .values({
          researchJobId: jobId,
          question: q.question,
          intentCategory: q.intentCategory,
          temporalBound: q.temporalBound,
          geographicScope: q.geographicScope,
          minRequiredEvidence: q.minRequiredEvidence || 1,
        })
        .returning();
      insertedQuestions.push({
        id: qRow.id,
        question: qRow.question,
        minRequiredEvidence: qRow.minRequiredEvidence,
      });
    }

    // 3. TAHAP 2: Multi-Source Discovery (Internal Knowledge + Web + Academic Crossref)
    await db
      .update(researchJobs)
      .set({ status: ResearchJobStatus.SEARCHING, updatedAt: new Date() })
      .where(eq(researchJobs.id, jobId));

    await emit('Mengambil regulasi internal daerah & arsip diskursus berita...', 22);
    const internalKnowledge = await InternalKnowledgeConnector.retrieveInternalKnowledge({
      queryEmbedding: input.queryEmbedding,
      targetRegion: input.targetRegion,
      policySector: plan.internalRetrievalPlan.mediaSector,
      keywords: plan.internalRetrievalPlan.mediaKeywords,
      maxRegulations: 3,
      maxNews: 4,
    });

    await emit('Menelusuri publikasi ilmiah bereputasi (Crossref DOI) & tautan web...', 32);
    const academicPapers = plan.academicQueries && plan.academicQueries.length > 0
      ? await AcademicDiscoveryConnector.searchCrossref(plan.academicQueries[0], 3)
      : [];

    const webCandidates = input.providedUrls && input.providedUrls.length > 0
      ? await WebDiscoveryConnector.fetchMultipleUrls(input.providedUrls)
      : [];

    // 4. TAHAP 3: Source Registry, Deduplication & Credibility Assessment
    await db
      .update(researchJobs)
      .set({ status: ResearchJobStatus.EVALUATING, updatedAt: new Date() })
      .where(eq(researchJobs.id, jobId));

    await emit('Menilai substansi, kesegaran & integritas metodologi sumber...', 42);

    interface RegisteredSourceItem {
      sourceId: string;
      versionId: string;
      title: string;
      url: string;
      publisherName: string;
      extractedText: string;
      isAccepted: boolean;
    }

    const evaluatedSources: RegisteredSourceItem[] = [];

    // Proses A: Registrasi Sumber Regulasi Internal
    for (const reg of internalKnowledge.regulations) {
      const [s] = await db
        .insert(sources)
        .values({
          url: `internal://regulation/${reg.documentId}`,
          canonicalUrl: `internal://regulation/${reg.documentId}`,
          sourceType: SourceType.INTERNAL_REGULATION,
          publisherName: 'Pemerintah Daerah / JDIH',
          publisherType: PublisherType.GOVERNMENT,
          publisherCredibilityScore: 0.95,
          lifecycleStatus: SourceLifecycle.VERIFIED,
        })
        .returning();

      const [sv] = await db
        .insert(sourceVersions)
        .values({
          sourceId: s.id,
          contentHash: WebDiscoveryConnector.hashContent(reg.chunkContent),
          title: reg.structuralReference,
          extractedText: reg.chunkContent,
          httpStatus: 200,
        })
        .returning();

      await db.insert(researchJobSources).values({
        researchJobId: jobId,
        sourceId: s.id,
        relevanceScore: reg.similarityScore,
        queryUsed: 'Vector HNSW Cosine Search',
      });

      evaluatedSources.push({
        sourceId: s.id,
        versionId: sv.id,
        title: reg.structuralReference,
        url: s.url,
        publisherName: 'JDIH / Regulasi Daerah',
        extractedText: reg.chunkContent,
        isAccepted: true,
      });
    }

    // Proses B: Registrasi Sumber Berita Internal (media_discourses)
    for (const news of internalKnowledge.news) {
      const [s] = await db
        .insert(sources)
        .values({
          url: news.originalUrl,
          canonicalUrl: news.originalUrl,
          sourceType: SourceType.INTERNAL_NEWS,
          publisherName: news.portalName,
          publisherType: PublisherType.MEDIA,
          publisherCredibilityScore: 0.80,
          lifecycleStatus: SourceLifecycle.VERIFIED,
        })
        .returning();

      const [sv] = await db
        .insert(sourceVersions)
        .values({
          sourceId: s.id,
          contentHash: WebDiscoveryConnector.hashContent(news.cleanSummary),
          title: news.articleTitle,
          extractedText: news.cleanSummary,
          httpStatus: 200,
        })
        .returning();

      await db.insert(researchJobSources).values({
        researchJobId: jobId,
        sourceId: s.id,
        relevanceScore: 0.80,
        queryUsed: 'Civic Media Diskursus Filter',
      });

      evaluatedSources.push({
        sourceId: s.id,
        versionId: sv.id,
        title: news.articleTitle,
        url: s.url,
        publisherName: news.portalName,
        extractedText: news.cleanSummary,
        isAccepted: true,
      });
    }

    // Proses C: Asesmen dan Registrasi Paper Akademik Crossref
    for (const paper of academicPapers) {
      const [s] = await db
        .insert(sources)
        .values({
          url: paper.url,
          canonicalUrl: `https://doi.org/${paper.doi}`,
          sourceType: SourceType.ACADEMIC_PAPER,
          publisherName: paper.journalTitle || 'Academic Publisher',
          publisherType: PublisherType.ACADEMIC,
          doi: paper.doi,
          isPeerReviewed: paper.isPeerReviewed,
          hasRetractionsOrCorrections: paper.hasRetractionsOrCorrections,
          publisherCredibilityScore: 0.88,
          lifecycleStatus: paper.hasRetractionsOrCorrections
            ? SourceLifecycle.REJECTED
            : SourceLifecycle.ASSESSED,
        })
        .returning();

      const textBody = `${paper.title}. Penulis: ${paper.authors.join(', ')} (${paper.publicationYear || 'N/A'}). Jurnal: ${paper.journalTitle || ''}. ${paper.abstractSnippet || ''}`;
      const [sv] = await db
        .insert(sourceVersions)
        .values({
          sourceId: s.id,
          contentHash: WebDiscoveryConnector.hashContent(textBody),
          title: paper.title,
          extractedText: textBody,
          httpStatus: 200,
        })
        .returning();

      const assessment = await SourceCredibilityAssessor.assessSource(
        {
          url: paper.url,
          domain: 'crossref.org',
          title: paper.title,
          extractedText: textBody,
          publisherType: PublisherType.ACADEMIC,
          doi: paper.doi,
          isPeerReviewed: paper.isPeerReviewed,
          hasRetractions: paper.hasRetractionsOrCorrections,
        },
        plan.mainTopic
      );

      await db.insert(sourceAssessments).values({
        sourceId: s.id,
        substantiveScore: assessment.substantiveScore,
        methodologyScore: assessment.methodologyScore,
        recencyScore: assessment.recencyScore,
        overallScore: assessment.overallScore,
        assessmentReason: assessment.assessmentReason,
        isAccepted: assessment.isAccepted,
      });

      await db
        .update(sources)
        .set({ lifecycleStatus: assessment.lifecycleStatus })
        .where(eq(sources.id, s.id));

      await db.insert(researchJobSources).values({
        researchJobId: jobId,
        sourceId: s.id,
        relevanceScore: assessment.overallScore,
        queryUsed: plan.academicQueries[0] || 'Academic Query',
      });

      evaluatedSources.push({
        sourceId: s.id,
        versionId: sv.id,
        title: paper.title,
        url: paper.url,
        publisherName: paper.journalTitle || 'Jurnal Akademik',
        extractedText: textBody,
        isAccepted: assessment.isAccepted,
      });
    }

    // Proses D: Asesmen dan Registrasi Tautan Web Eksternal
    for (const web of webCandidates) {
      const [s] = await db
        .insert(sources)
        .values({
          url: web.url,
          canonicalUrl: web.canonicalUrl,
          sourceType: SourceType.EXTERNAL_WEB,
          publisherName: web.publisherName,
          publisherType: PublisherType.MEDIA,
          lifecycleStatus: SourceLifecycle.FETCHED,
        })
        .returning();

      const [sv] = await db
        .insert(sourceVersions)
        .values({
          sourceId: s.id,
          contentHash: web.contentHash,
          title: web.title,
          rawContent: web.rawContent,
          extractedText: web.extractedText,
          httpStatus: web.httpStatus,
        })
        .returning();

      const assessment = await SourceCredibilityAssessor.assessSource(
        {
          url: web.url,
          domain: web.domain,
          title: web.title,
          extractedText: web.extractedText,
          publisherType: PublisherType.MEDIA,
        },
        plan.mainTopic
      );

      await db.insert(sourceAssessments).values({
        sourceId: s.id,
        substantiveScore: assessment.substantiveScore,
        methodologyScore: assessment.methodologyScore,
        recencyScore: assessment.recencyScore,
        overallScore: assessment.overallScore,
        assessmentReason: assessment.assessmentReason,
        isAccepted: assessment.isAccepted,
      });

      await db
        .update(sources)
        .set({ lifecycleStatus: assessment.lifecycleStatus })
        .where(eq(sources.id, s.id));

      await db.insert(researchJobSources).values({
        researchJobId: jobId,
        sourceId: s.id,
        relevanceScore: assessment.overallScore,
        queryUsed: 'User Supplied URL',
      });

      evaluatedSources.push({
        sourceId: s.id,
        versionId: sv.id,
        title: web.title,
        url: web.url,
        publisherName: web.publisherName || web.domain,
        extractedText: web.extractedText,
        isAccepted: assessment.isAccepted,
      });
    }

    // 5. TAHAP 4: Claim & Evidence Extraction
    await db
      .update(researchJobs)
      .set({ status: ResearchJobStatus.EXTRACTING, updatedAt: new Date() })
      .where(eq(researchJobs.id, jobId));

    await emit('Mengekstrak klaim kebijakan & bukti kutipan verbatim...', 58);

    const acceptedSources = evaluatedSources.filter((s) => s.isAccepted);
    const extractedClaims = await ClaimEvidenceExtractor.extractClaimsAndEvidence(
      plan.mainTopic,
      insertedQuestions.map((q, idx) => ({ index: idx + 1, question: q.question })),
      acceptedSources
    );

    // Simpan claims dan evidence_spans ke DB
    const evidenceCountPerQuestion: Record<string, number> = {};
    const evidenceIdMap = new Map<string, string>(); // 'EV-1' -> database uuid
    let spanCounter = 1;

    for (const c of extractedClaims) {
      // Petakan ke researchQuestionId
      const targetQuestion =
        c.questionIndex && c.questionIndex > 0 && c.questionIndex <= insertedQuestions.length
          ? insertedQuestions[c.questionIndex - 1]
          : insertedQuestions[0];

      const [claimRow] = await db
        .insert(claims)
        .values({
          researchJobId: jobId,
          researchQuestionId: targetQuestion?.id,
          claimStatement: c.claimStatement,
          status: c.status,
          confidenceScore: c.confidenceScore,
        })
        .returning();

      for (const ev of c.evidenceItems) {
        const shortToken = `EV-${spanCounter++}`;
        const [evSpan] = await db
          .insert(evidenceSpans)
          .values({
            sourceId: ev.sourceId,
            verbatimQuote: ev.verbatimQuote,
            contextSnippet: ev.contextSnippet,
            sectionOrPage: ev.sectionOrPage,
            confidenceScore: 0.95,
            isVerified: true,
          })
          .returning();

        evidenceIdMap.set(shortToken, evSpan.id);

        await db.insert(claimEvidence).values({
          claimId: claimRow.id,
          evidenceSpanId: evSpan.id,
          supportType: ev.supportType,
          relationshipExplanation: ev.relationshipExplanation,
        });

        if (targetQuestion) {
          evidenceCountPerQuestion[targetQuestion.id] =
            (evidenceCountPerQuestion[targetQuestion.id] || 0) + 1;
        }
      }
    }

    // 6. TAHAP 5: Backend Deterministic Gate -> Evidence Sufficient?
    await emit('Memeriksa kecukupan bukti secara deterministik di backend...', 72);

    const totalEvidenceSpansCount = evidenceIdMap.size;
    const sufficiencyResult = DeterministicQualityGates.verifyEvidenceSufficiency(
      insertedQuestions,
      evidenceCountPerQuestion,
      totalEvidenceSpansCount
    );

    await db
      .update(researchJobs)
      .set({
        evidenceSufficient: sufficiencyResult.isSufficient,
        summaryReport: sufficiencyResult.gapAnalysisReason || 'Bukti riset mencukupi.',
        updatedAt: new Date(),
      })
      .where(eq(researchJobs.id, jobId));

    // 7. TAHAP 6: Rakit Grounded Evidence Capsule Berindeks
    const evidenceCapsuleLines: string[] = [];
    evidenceCapsuleLines.push(`=== MANIFEST BUKTI TERVERIFIKASI POLARIS (GROUNDING RESMI) ===`);
    evidenceCapsuleLines.push(`TOPIK RISET: ${plan.mainTopic}`);
    evidenceCapsuleLines.push(`WILAYAH SASARAN: ${input.targetRegion}\n`);

    evidenceCapsuleLines.push(`--- DAFTAR BUKTI BERSERTIFIKAT (SITASI RESMI) ---`);
    for (const [token, spanDbId] of evidenceIdMap.entries()) {
      // Cari detail span
      const matchedClaim = extractedClaims.flatMap((c) => c.evidenceItems).find((item) => item);
      if (matchedClaim) {
        evidenceCapsuleLines.push(
          `[${token}] (ID: ${spanDbId}) - Kutipan: "${matchedClaim.verbatimQuote}" (Konteks: ${matchedClaim.contextSnippet})`
        );
      }
    }

    evidenceCapsuleLines.push(`\n--- DAFTAR SUMBER RUJUKAN RESMI ---`);
    for (const src of acceptedSources) {
      evidenceCapsuleLines.push(`- [${src.publisherName}] ${src.title}: ${src.url}`);
    }
    evidenceCapsuleLines.push(`===========================================================`);

    const groundedContextText = evidenceCapsuleLines.join('\n');

    await emit('Siklus riset otonom selesai. Siap diteruskan ke Evidence-Grounded Writer.', 85);

    return {
      jobId,
      mainTopic: plan.mainTopic,
      evidenceSufficient: sufficiencyResult.isSufficient,
      qcPassed: false, // Menunggu tahap penulisan dan QC gate
      totalSourcesEvaluated: evaluatedSources.length,
      verifiedSourcesCount: acceptedSources.length,
      totalEvidenceSpans: totalEvidenceSpansCount,
      claimsCount: extractedClaims.length,
      groundedContextText,
      evidenceIdMap,
    };
  }
}
