import {
  ResearchJobStatus,
  SourceType,
  PublisherType,
  SourceLifecycle,
  ClaimStatus,
  SupportType,
} from '@polaris/shared-types';
import {
  IResearchJobRepositoryPort,
  RegisteredSourceItem,
  InsertedResearchQuestion,
} from '@polaris/core-domain';

import { DrizzleResearchJobRepository } from './research-job.repository.js';
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
  repository?: IResearchJobRepositoryPort;
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
  private static defaultRepository: IResearchJobRepositoryPort = new DrizzleResearchJobRepository();

  /**
   * Menyuntikkan repository port kustom (Dependency Injection / DIP).
   */
  public static setRepository(repository: IResearchJobRepositoryPort): void {
    this.defaultRepository = repository;
  }

  public static resetRepository(): void {
    this.defaultRepository = new DrizzleResearchJobRepository();
  }

  public static getRepository(): IResearchJobRepositoryPort {
    return this.defaultRepository;
  }

  /**
   * Menjalankan siklus riset otonom POLARIS secara menyeluruh (End-to-End Autonomous Research)
   */
  public static async executeResearchPipeline(
    input: AutonomousResearchJobInput,
    customRepo?: IResearchJobRepositoryPort
  ): Promise<AutonomousResearchJobResult> {
    const repo = customRepo || input.repository || this.defaultRepository;
    const emit = async (msg: string, pct: number) => {
      if (input.onProgress) {
        await input.onProgress(msg, pct);
      }
    };

    let jobId: string | undefined;

    try {
      // 1. Inisialisasi Job Riset di Basis Data via Repository Port
      await emit('Menginisialisasi sesi riset otonom di database...', 5);
      const { id } = await repo.createJob({
        tenantId: input.tenantId,
        topic: input.topic,
        userPrompt: input.userPrompt,
        targetRegion: input.targetRegion,
        status: ResearchJobStatus.PLANNING,
      });

      jobId = id;

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

      // Simpan daftar pertanyaan riset ke tabel research_questions secara atomik via Repository Port
      const insertedQuestions = await repo.saveQuestions(
        jobId,
        plan.questions.map((q) => ({
          question: q.question,
          intentCategory: q.intentCategory,
          temporalBound: q.temporalBound,
          geographicScope: q.geographicScope,
          minRequiredEvidence: q.minRequiredEvidence || 1,
        }))
      );

      // 3. TAHAP 2: Multi-Source Discovery (Internal Knowledge + Web + Academic Crossref)
      await repo.updateJobStatus(jobId, ResearchJobStatus.SEARCHING);

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
      await repo.updateJobStatus(jobId, ResearchJobStatus.EVALUATING);

      await emit('Menilai substansi, kesegaran & integritas metodologi sumber...', 42);

      const evaluatedSources: RegisteredSourceItem[] = [];

      // Proses A: Registrasi Sumber Regulasi Internal (Atomik dalam DB transaction via repo)
      if (internalKnowledge.regulations.length > 0) {
        const regSources = await repo.saveRegulationSources(jobId, internalKnowledge.regulations);
        evaluatedSources.push(...regSources);
      }

      // Proses B: Registrasi Sumber Berita Internal (media_discourses, atomik dalam DB transaction via repo)
      if (internalKnowledge.news.length > 0) {
        const newsSources = await repo.saveNewsSources(jobId, internalKnowledge.news);
        evaluatedSources.push(...newsSources);
      }

      // Proses C: Asesmen dan Registrasi Paper Akademik Crossref
      for (const paper of academicPapers) {
        const textBody = `${paper.title}. Penulis: ${paper.authors.join(', ')} (${paper.publicationYear || 'N/A'}). Jurnal: ${paper.journalTitle || ''}. ${paper.abstractSnippet || ''}`;

        // Asesmen via AI dilakukan di luar transaksi agar tidak menahan connection pool DB
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

        // Penulisan multi-tabel sources + sourceVersions + sourceAssessments + researchJobSources secara atomik via repo
        const savedItem = await repo.saveAcademicSource(
          jobId,
          paper,
          assessment,
          plan.academicQueries[0] || 'Academic Query'
        );
        evaluatedSources.push(savedItem);
      }

      // Proses D: Asesmen dan Registrasi Tautan Web Eksternal
      for (const web of webCandidates) {
        // Asesmen via AI dilakukan di luar transaksi
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

        // Penulisan multi-tabel sources + sourceVersions + sourceAssessments + researchJobSources secara atomik via repo
        const savedItem = await repo.saveWebSource(jobId, web, assessment);
        evaluatedSources.push(savedItem);
      }

      // Proses E: Registrasi Dokumen Lampiran Pengguna (User Attached Documents / Reses / Dokumen Lapangan)
      if (input.attachedDocuments && input.attachedDocuments.length > 0) {
        for (const doc of input.attachedDocuments) {
          if (!doc.extractedContent || doc.extractedContent.trim().length === 0) continue;
          const savedItem = await repo.saveAttachmentSource(jobId, doc);
          evaluatedSources.push(savedItem);
        }
      }

      // 5. TAHAP 4: Claim & Evidence Extraction
      await repo.updateJobStatus(jobId, ResearchJobStatus.EXTRACTING);

      await emit('Mengekstrak klaim kebijakan & bukti kutipan verbatim...', 58);

      const acceptedSources = evaluatedSources.filter((s) => s.isAccepted);
      const extractedClaims = await ClaimEvidenceExtractor.extractClaimsAndEvidence(
        plan.mainTopic,
        insertedQuestions.map((q, idx) => ({ index: idx + 1, question: q.question })),
        acceptedSources
      );

      // Simpan claims, evidence_spans, dan claim_evidence secara atomik dalam satu DB transaction via repo
      const {
        evidenceCountPerQuestion,
        evidenceIdMap,
        evidenceDetailMap,
      } = await repo.saveClaimsAndEvidence({
        jobId,
        claims: extractedClaims,
        insertedQuestions,
      });

      // 6. TAHAP 5: Backend Deterministic Gate -> Evidence Sufficient?
      await emit('Memeriksa kecukupan bukti secara deterministik di backend...', 72);

      const totalEvidenceSpansCount = evidenceIdMap.size;
      const sufficiencyResult = DeterministicQualityGates.verifyEvidenceSufficiency(
        insertedQuestions,
        evidenceCountPerQuestion,
        totalEvidenceSpansCount
      );

      await repo.updateJobSufficiency(
        jobId,
        sufficiencyResult.isSufficient,
        sufficiencyResult.gapAnalysisReason || 'Bukti riset mencukupi.'
      );

      // 7. TAHAP 6: Rakit Grounded Evidence Capsule Berindeks
      const evidenceCapsuleLines: string[] = [];
      evidenceCapsuleLines.push(`=== MANIFEST BUKTI TERVERIFIKASI POLARIS (GROUNDING RESMI) ===`);
      evidenceCapsuleLines.push(`TOPIK RISET: ${plan.mainTopic}`);
      evidenceCapsuleLines.push(`WILAYAH SASARAN: ${input.targetRegion}\n`);

      evidenceCapsuleLines.push(`--- DAFTAR BUKTI BERSERTIFIKAT (SITASI RESMI) ---`);
      for (const [token, detail] of evidenceDetailMap.entries()) {
        evidenceCapsuleLines.push(
          `[${token}] (ID: ${detail.id}) - Kutipan: "${detail.quote}" (Konteks: ${detail.context})`
        );
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
    } catch (error: any) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      if (jobId) {
        try {
          await repo.markJobFailed(jobId, errorMessage, {
            stack: error instanceof Error ? error.stack : undefined,
          });
        } catch (dbUpdateError) {
          console.error(
            `[AutonomousResearchOrchestrator] Gagal memperbarui status research job ${jobId} ke FAILED:`,
            dbUpdateError
          );
        }
      }
      throw error;
    }
  }
}
