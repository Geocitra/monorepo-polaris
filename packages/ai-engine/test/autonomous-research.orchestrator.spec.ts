import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AutonomousResearchOrchestrator } from '../src/research/autonomous-research.orchestrator.js';
import { IResearchJobRepositoryPort } from '@polaris/core-domain';
import { ResearchPlannerEngine } from '../src/research/research-planner.engine.js';

describe('AutonomousResearchOrchestrator - Integrity, Transactions & DIP', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    AutonomousResearchOrchestrator.resetRepository();
  });

  it('harus menandai researchJob sebagai FAILED jika terjadi unhandled error di tengah pipeline via Repository Port', async () => {
    const mockJobId = 'test-job-uuid-1234';

    const mockRepo: IResearchJobRepositoryPort = {
      createJob: vi.fn().mockResolvedValue({ id: mockJobId }),
      saveQuestions: vi.fn().mockResolvedValue([]),
      updateJobStatus: vi.fn().mockResolvedValue(undefined),
      saveRegulationSources: vi.fn().mockResolvedValue([]),
      saveNewsSources: vi.fn().mockResolvedValue([]),
      saveAcademicSource: vi.fn().mockResolvedValue({} as any),
      saveWebSource: vi.fn().mockResolvedValue({} as any),
      saveAttachmentSource: vi.fn().mockResolvedValue({} as any),
      saveClaimsAndEvidence: vi.fn().mockResolvedValue({
        evidenceCountPerQuestion: {},
        evidenceIdMap: new Map(),
        evidenceDetailMap: new Map(),
      }),
      updateJobSufficiency: vi.fn().mockResolvedValue(undefined),
      markJobFailed: vi.fn().mockResolvedValue(undefined),
    };

    // Inject custom repository port (Dependency Injection)
    AutonomousResearchOrchestrator.setRepository(mockRepo);

    // Simulasikan kegagalan pada tahap Planner / LLM
    vi.spyOn(ResearchPlannerEngine, 'createPlan').mockRejectedValueOnce(
      new Error('OpenAI RateLimit / Connection Timeout')
    );

    let thrownError: any;
    try {
      await AutonomousResearchOrchestrator.executeResearchPipeline({
        tenantId: 'tenant-123',
        topic: 'Kebijakan Swasembada Pangan',
        userPrompt: 'Bagaimana dampak alokasi subsidi pupuk?',
        targetRegion: 'Jawa Barat',
      });
    } catch (err) {
      thrownError = err;
    }

    expect(thrownError).toBeDefined();
    expect(thrownError.message).toContain('OpenAI RateLimit / Connection Timeout');

    // Verifikasi bahwa createJob dipanggil
    expect(mockRepo.createJob).toHaveBeenCalledWith(
      expect.objectContaining({
        tenantId: 'tenant-123',
        topic: 'Kebijakan Swasembada Pangan',
      })
    );

    // Verifikasi markJobFailed dipanggil pada repository port
    expect(mockRepo.markJobFailed).toHaveBeenCalledWith(
      mockJobId,
      expect.stringContaining('OpenAI RateLimit / Connection Timeout'),
      expect.any(Object)
    );
  });

  it('harus memvalidasi skor dasar PublisherType.USER adalah 0.75 sesuai SourceCredibilityAssessor', async () => {
    const { SourceCredibilityAssessor } = await import('../src/research/source-credibility.assessor.js');
    const { PublisherType } = await import('@polaris/shared-types');

    const baseline = SourceCredibilityAssessor.calculatePublisherBaselineScore('lampiran.pdf', PublisherType.USER);
    expect(baseline).toBe(0.75);
  });
});

