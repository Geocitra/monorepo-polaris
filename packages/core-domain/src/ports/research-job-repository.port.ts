/**
 * Port Interface untuk Autonomous Research Job Repository (DIP / Hexagonal Architecture).
 * Mengabstraksikan seluruh persistensi basis data sesi riset otonom dari @polaris/ai-engine.
 */

export interface CreateResearchJobDto {
  tenantId: string;
  topic: string;
  userPrompt: string;
  targetRegion: string;
  status?: string;
}

export interface ResearchQuestionDto {
  question: string;
  intentCategory: string;
  temporalBound?: string | null;
  geographicScope?: string | null;
  minRequiredEvidence?: number;
}

export interface InsertedResearchQuestion {
  id: string;
  question: string;
  minRequiredEvidence: number;
}

export interface RegisteredSourceItem {
  sourceId: string;
  versionId: string;
  title: string;
  url: string;
  publisherName: string;
  extractedText: string;
  isAccepted: boolean;
}

export interface SaveClaimEvidenceParams {
  jobId: string;
  claims: any[];
  insertedQuestions: InsertedResearchQuestion[];
}

export interface SaveClaimEvidenceResult {
  evidenceCountPerQuestion: Record<string, number>;
  evidenceIdMap: Map<string, string>;
  evidenceDetailMap: Map<string, { id: string; quote: string; context: string }>;
}

export interface IResearchJobRepositoryPort {
  /**
   * Menginisialisasi job riset baru
   */
  createJob(input: CreateResearchJobDto): Promise<{ id: string }>;

  /**
   * Menyimpan daftar pertanyaan riset secara atomik
   */
  saveQuestions(
    jobId: string,
    questions: ResearchQuestionDto[]
  ): Promise<InsertedResearchQuestion[]>;

  /**
   * Memperbarui status siklus pekerjaan riset (misal: SEARCHING, EVALUATING, EXTRACTING)
   */
  updateJobStatus(jobId: string, status: string): Promise<void>;

  /**
   * Menyimpan batch sumber regulasi internal beserta versinya secara atomik
   */
  saveRegulationSources(jobId: string, regulations: any[]): Promise<RegisteredSourceItem[]>;

  /**
   * Menyimpan batch sumber berita internal beserta versinya secara atomik
   */
  saveNewsSources(jobId: string, news: any[]): Promise<RegisteredSourceItem[]>;

  /**
   * Menyimpan sumber akademik (paper crossref) beserta asesmen kredibilitasnya secara atomik
   */
  saveAcademicSource(
    jobId: string,
    paper: any,
    assessment: any,
    queryUsed: string
  ): Promise<RegisteredSourceItem>;

  /**
   * Menyimpan sumber web eksternal beserta asesmen kredibilitasnya secara atomik
   */
  saveWebSource(jobId: string, web: any, assessment: any): Promise<RegisteredSourceItem>;

  /**
   * Menyimpan lampiran dokumen pengguna secara atomik
   */
  saveAttachmentSource(
    jobId: string,
    doc: { name: string; extractedContent: string }
  ): Promise<RegisteredSourceItem>;

  /**
   * Menyimpan kesatuan claims, evidence_spans, dan claim_evidence secara atomik
   */
  saveClaimsAndEvidence(params: SaveClaimEvidenceParams): Promise<SaveClaimEvidenceResult>;

  /**
   * Memperbarui kecukupan bukti dan ringkasan gap analysis
   */
  updateJobSufficiency(jobId: string, isSufficient: boolean, summaryReport: string): Promise<void>;

  /**
   * Menandai job sebagai FAILED saat terjadi unhandled error
   */
  markJobFailed(jobId: string, errorMessage: string, metadata?: Record<string, any>): Promise<void>;
}
