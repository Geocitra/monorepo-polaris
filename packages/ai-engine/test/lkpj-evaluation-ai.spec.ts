import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { LkpjEvaluationAiService } from '../src/institutional/lkpj-evaluation-ai.service.js';
import { openaiClient } from '../src/client.js';
import {
  LkpjIndicatorDirection,
  LkpjAiSpecialistRole,
  LkpjMeetingPackageType,
  LkpjEvidenceStatus,
  LkpjFindingReviewStatus,
  LkpjFollowupStatus,
} from '@polaris/shared-types';

const mockUpdate = vi.fn().mockReturnValue({
  set: vi.fn().mockReturnValue({
    where: vi.fn().mockResolvedValue(true),
  }),
});

const mockInsert = vi.fn().mockReturnValue({
  values: vi.fn().mockResolvedValue(true),
});

const mockSelect = vi.fn().mockReturnValue({
  from: vi.fn().mockReturnValue({
    where: vi.fn().mockReturnValue({
      limit: vi.fn().mockResolvedValue([]),
    }),
  }),
});

vi.mock('@polaris/database', () => ({
  db: {
    insert: (...args: any[]) => mockInsert(...args),
    update: (...args: any[]) => mockUpdate(...args),
    select: (...args: any[]) => mockSelect(...args),
  },
  aiTraceLogs: { name: 'ai_trace_logs' },
  tenantQuotaLedgers: { name: 'tenant_quota_ledgers' },
  organizationContracts: {
    name: 'organization_contracts',
    organizationId: 'organization_id',
    status: 'status',
    tokensConsumed: 'tokens_consumed',
  },
  organizationQuotaLedgers: {
    name: 'organization_quota_ledgers',
    id: 'id',
    organizationId: 'organization_id',
    unitId: 'unit_id',
    billingCycleMonth: 'billing_cycle_month',
  },
  platformTokenPools: {
    name: 'platform_token_pools',
    provider: 'provider',
    totalTokensConsumed: 'total_tokens_consumed',
    consumedBudgetIdr: 'consumed_budget_idr',
    totalImagesGenerated: 'total_images_generated',
  },
  tenantActivityLogs: { name: 'tenant_activity_logs' },
  operatorAuditLogs: { name: 'operator_audit_logs' },
  eq: vi.fn(),
  and: vi.fn(),
  sql: vi.fn((strings: TemplateStringsArray, ...values: any[]) => ({ strings, values })),
}));

describe('LkpjEvaluationAiService — Deterministic Performance Math, PII Masking & 6 Specialist Agents', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.OPENAI_API_KEY = 'sk-mock-local-test';
    process.env.AI_USE_ROUTER = 'false';
  });

  it('harus menghitung selisih target vs realisasi (HIGHER_IS_BETTER) dan persentase serapan anggaran secara 100% deterministik', () => {
    const metrics = LkpjEvaluationAiService.calculateDeterministicMetrics({
      targetValue: 85,
      realizationValue: 72.5,
      indicatorDirection: LkpjIndicatorDirection.HIGHER_IS_BETTER,
      budgetCeilingIdr: 20_000_000_000,
      budgetRealizationIdr: 18_500_000_000,
    });

    expect(metrics.achievementGap).toBe(-12.5);
    expect(metrics.achievementPercentage).toBe(85.29);
    expect(metrics.budgetAbsorptionPercentage).toBe(92.5);
  });

  it('harus menghitung selisih arah indikator negatif (LOWER_IS_BETTER seperti Angka Kemiskinan/Stunting) secara akurat', () => {
    const metrics = LkpjEvaluationAiService.calculateDeterministicMetrics({
      targetValue: 9.0,
      realizationValue: 8.1,
      indicatorDirection: LkpjIndicatorDirection.LOWER_IS_BETTER,
      budgetCeilingIdr: 10_000_000_000,
      budgetRealizationIdr: 9_500_000_000,
    });

    // Realisasi kemiskinan 8.1% lebih baik (+0.9%) dari target 9.0%
    expect(metrics.achievementGap).toBe(0.9);
    expect(metrics.achievementPercentage).toBe(111.11);
    expect(metrics.budgetAbsorptionPercentage).toBe(95);
  });

  it('harus menyamarkan NIK, nomor telepon, email, dan nama pelapor warga pada aspirasi masyarakat', () => {
    const rawAspiration =
      'Pelapor: Budi Santoso (NIK 3204123456789012, HP 081234567890, email budi.warga@gmail.com) melaporkan pipa air minum di Desa Mekarjaya belum mengalir sejak Januari.';
    const masked = LkpjEvaluationAiService.maskCitizenIdentityForCirculation(rawAspiration);

    expect(masked).not.toContain('3204123456789012');
    expect(masked).not.toContain('081234567890');
    expect(masked).not.toContain('budi.warga@gmail.com');
    expect(masked).not.toContain('Budi Santoso');
    expect(masked).toContain('[NIK-WARGA-DISAMARKAN]');
    expect(masked).toContain('[NO-TELP-DISAMARKAN]');
    expect(masked).toContain('[EMAIL-DISAMARKAN]');
    expect(masked).toContain('Desa Mekarjaya belum mengalir');
  });

  it('harus menjalankan Agen Spesialis LKPJ di atas Matriks Temuan dan mencatat telemetry ke Kontrak Instansi', async () => {
    const res = await LkpjEvaluationAiService.executeSpecialistAgent({
      tenantId: '11111111-1111-4111-8111-111111111111',
      organizationId: '22222222-2222-4222-8222-222222222222',
      organizationName: 'DPRD Kabupaten Bandung',
      legislativeLevel: 'DPRD_KABUPATEN_KOTA',
      regionName: 'Kabupaten Bandung',
      activeUnitId: '33333333-3333-4333-8333-333333333333',
      workspaceTitle: 'Evaluasi LKPJ Kabupaten Bandung TA 2025',
      fiscalYear: 2025,
      specialistRole: LkpjAiSpecialistRole.LEGAL_REVIEWER_AND_DRAFTER,
      findings: [
        {
          id: 'finding-1',
          workspaceId: 'ws-1',
          organizationId: '22222222-2222-4222-8222-222222222222',
          fiscalYear: 2025,
          governmentAffair: 'Layanan Air Minum',
          opdName: 'Dinas PUPR',
          indicatorOrIssue: 'Cakupan Desa Terlayani Air Minum',
          indicatorUnit: '%',
          indicatorDirection: LkpjIndicatorDirection.HIGHER_IS_BETTER,
          compatibilityVerified: true,
          targetValue: 85,
          realizationValue: 72.5,
          achievementGap: -12.5,
          achievementPercentage: 85.29,
          budgetCeilingIdr: 20_000_000_000,
          budgetRealizationIdr: 18_500_000_000,
          budgetAbsorptionPercentage: 92.5,
          locationCoverage: '14 Desa Wilayah Selatan',
          sourceEvidenceRef: 'LKPJ Bab III Hal. 114',
          evidenceStatus: LkpjEvidenceStatus.INSUFFICIENT_OPEN,
          reviewStatus: LkpjFindingReviewStatus.DRAFT,
          followupStatus: LkpjFollowupStatus.OPEN,
          createdByTenantId: '11111111-1111-4111-8111-111111111111',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ],
      materials: [],
      factionConsolidation: [],
    });

    expect(res.specialistRole).toBe(LkpjAiSpecialistRole.LEGAL_REVIEWER_AND_DRAFTER);
    expect(res.deterministicMetricsUsed.findingsAnalyzedCount).toBe(1);
    expect(res.deterministicMetricsUsed.openEvidenceCount).toBe(1);
    expect(res.suggestedRecommendationDraft).toContain('Dinas PUPR');
    expect(res.suggestedRecommendationDraft).toContain('14 Desa Wilayah Selatan');
    expect(res.telemetry.traceId).toMatch(/^tr_\d+_[a-f0-9]{8}$/);
    expect(mockUpdate).toHaveBeenCalled();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('jalur live LLM: executeSpecialistAgent harus memakai JSON output LLM (rekomendasi & pertanyaan bukan statis) serta model heavy untuk LEGAL_REVIEWER_AND_DRAFTER', async () => {
    process.env.OPENAI_API_KEY = 'sk-live-unit-test-key-1234567890';
    process.env.AI_USE_ROUTER = 'false';

    const createSpy = vi
      .spyOn(openaiClient.chat.completions, 'create')
      .mockResolvedValue({
        model: 'gpt-4o',
        usage: { prompt_tokens: 410, completion_tokens: 220 },
        choices: [
          {
            message: {
              content: JSON.stringify({
                analysisMarkdown: '### Telaah Hukum LLM\nSelisih -12.5% pada Dinas PUPR teruji.',
                suggestedRecommendationDraft:
                  'DPRD merekomendasikan audit teknis jaringan pipa di 14 Desa Wilayah Selatan oleh Dinas PUPR paling lambat Q3.',
                suggestedClarificationQuestions: [
                  'Mengapa serapan 92.5% tidak sebanding dengan cakupan 72.5% pada 14 desa selatan?',
                ],
              }),
            },
          },
        ],
      } as any);

    const res = await LkpjEvaluationAiService.executeSpecialistAgent({
      tenantId: '11111111-1111-4111-8111-111111111111',
      organizationId: '22222222-2222-4222-8222-222222222222',
      organizationName: 'DPRD Kabupaten Bandung',
      legislativeLevel: 'DPRD_KABUPATEN_KOTA',
      regionName: 'Kabupaten Bandung',
      workspaceTitle: 'LKPJ TA 2025',
      fiscalYear: 2025,
      specialistRole: LkpjAiSpecialistRole.LEGAL_REVIEWER_AND_DRAFTER,
      findings: [
        {
          id: 'f-live-1',
          workspaceId: 'ws-1',
          organizationId: '22222222-2222-4222-8222-222222222222',
          fiscalYear: 2025,
          governmentAffair: 'Layanan Air Minum',
          opdName: 'Dinas PUPR',
          indicatorOrIssue: 'Cakupan Desa Terlayani Air Minum',
          indicatorUnit: '%',
          indicatorDirection: LkpjIndicatorDirection.HIGHER_IS_BETTER,
          compatibilityVerified: true,
          targetValue: 85,
          realizationValue: 72.5,
          achievementGap: -12.5,
          achievementPercentage: 85.29,
          budgetCeilingIdr: 20_000_000_000,
          budgetRealizationIdr: 18_500_000_000,
          budgetAbsorptionPercentage: 92.5,
          sourceEvidenceRef: 'LKPJ Hal. 114',
          evidenceStatus: LkpjEvidenceStatus.SUFFICIENT_VERIFIED,
          reviewStatus: LkpjFindingReviewStatus.DRAFT,
          followupStatus: LkpjFollowupStatus.OPEN,
          createdByTenantId: '11111111-1111-4111-8111-111111111111',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ],
      materials: [],
      factionConsolidation: [],
    });

    expect(createSpy).toHaveBeenCalledTimes(1);
    const callArg = createSpy.mock.calls[0][0] as any;
    expect(callArg.model).toBe('gpt-4o');
    expect(callArg.response_format).toEqual({ type: 'json_object' });
    expect(res.analysisMarkdown).toContain('Telaah Hukum LLM');
    expect(res.suggestedRecommendationDraft).toContain('audit teknis jaringan pipa');
    expect(res.suggestedClarificationQuestions).toEqual([
      'Mengapa serapan 92.5% tidak sebanding dengan cakupan 72.5% pada 14 desa selatan?',
    ]);
  });

  it('jalur live LLM: extractCandidateFindingsWithLlm & synthesizeMeetingPackageSummary harus memproses PDF naratif dan menyusun ringkasan paripurna', async () => {
    process.env.OPENAI_API_KEY = 'sk-live-unit-test-key-1234567890';
    process.env.AI_USE_ROUTER = 'false';

    vi.spyOn(openaiClient.chat.completions, 'create')
      .mockResolvedValueOnce({
        model: 'gpt-4o-mini',
        usage: { prompt_tokens: 200, completion_tokens: 150 },
        choices: [
          {
            message: {
              content: JSON.stringify({
                findings: [
                  {
                    governmentAffair: 'Kesehatan',
                    opdName: 'Dinas Kesehatan',
                    indicatorOrIssue: 'Penurunan Prevalensi Stunting Balita',
                    indicatorUnit: '%',
                    targetValue: 14,
                    realizationValue: 16.2,
                    budgetCeilingIdr: 5000000000,
                    budgetRealizationIdr: 4700000000,
                    sourceEvidenceRef: 'LKPJ Bab IV Hal. 77',
                  },
                ],
              }),
            },
          },
        ],
      } as any)
      .mockResolvedValueOnce({
        model: 'gpt-4o-mini',
        usage: { prompt_tokens: 250, completion_tokens: 180 },
        choices: [
          {
            message: {
              content:
                '### Ringkasan Eksekutif Paripurna LKPJ TA 2025\nDPRD menetapkan rekomendasi perbaikan kinerja stunting kepada Dinas Kesehatan berdasarkan data deterministik matriks.',
            },
          },
        ],
      } as any);

    const extracted = await LkpjEvaluationAiService.extractCandidateFindingsWithLlm({
      tenantId: '11111111-1111-4111-8111-111111111111',
      organizationId: '22222222-2222-4222-8222-222222222222',
      extractedText:
        'Laporan Keterangan Pertanggungjawaban Kepala Daerah Bab IV Bidang Kesehatan: Dinas Kesehatan menargetkan penurunan prevalensi stunting balita sebesar 14 persen, namun realisasi tahun berjalan mencapai 16,2 persen dari pagu Rp 5 miliar dengan realisasi Rp 4,7 miliar.',
      fileName: 'lkpj-naratif.pdf',
      materialTitle: 'LKPJ Bab IV',
      fiscalYear: 2025,
    });

    expect(extracted.usedLlm).toBe(true);
    expect(extracted.candidateFindings.length).toBe(1);
    expect(extracted.candidateFindings[0].opdName).toBe('Dinas Kesehatan');
    expect(extracted.candidateFindings[0].targetValue).toBe(14);

    const summary = await LkpjEvaluationAiService.synthesizeMeetingPackageSummary({
      tenantId: '11111111-1111-4111-8111-111111111111',
      organizationId: '22222222-2222-4222-8222-222222222222',
      organizationName: 'DPRD Kabupaten Bandung',
      workspaceTitle: 'Evaluasi LKPJ TA 2025',
      fiscalYear: 2025,
      packageType: LkpjMeetingPackageType.PLENARY_DECISION_PACKAGE,
      daysRemaining: 5,
      discussionDeadlineIso: '2026-04-30',
      includedFindings: [
        {
          id: 'f-1',
          workspaceId: 'ws-1',
          organizationId: '22222222-2222-4222-8222-222222222222',
          fiscalYear: 2025,
          governmentAffair: 'Kesehatan',
          opdName: 'Dinas Kesehatan',
          indicatorOrIssue: 'Penurunan Stunting',
          indicatorUnit: '%',
          indicatorDirection: LkpjIndicatorDirection.LOWER_IS_BETTER,
          compatibilityVerified: true,
          targetValue: 14,
          realizationValue: 16.2,
          achievementGap: -2.2,
          achievementPercentage: 86.42,
          budgetCeilingIdr: 5000000000,
          budgetRealizationIdr: 4700000000,
          budgetAbsorptionPercentage: 94,
          sourceEvidenceRef: 'LKPJ Hal. 77',
          evidenceStatus: LkpjEvidenceStatus.SUFFICIENT_VERIFIED,
          reviewStatus: LkpjFindingReviewStatus.OFFICIAL_RECOMMENDATION,
          followupStatus: LkpjFollowupStatus.OPEN,
          createdByTenantId: '11111111-1111-4111-8111-111111111111',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ],
      openDataRequestsCount: 0,
      factionNeedDecisionCount: 0,
      defaultExecutiveSummaryMarkdown: 'Fallback summary',
    });

    expect(summary).toContain('Ringkasan Eksekutif Paripurna LKPJ TA 2025');
  });
});
