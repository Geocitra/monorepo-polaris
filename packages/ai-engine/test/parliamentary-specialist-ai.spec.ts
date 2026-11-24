import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { ParliamentarySpecialistAiService } from '../src/institutional/parliamentary-specialist-ai.service.js';
import { openaiClient } from '../src/client.js';
import {
  ClauseInspectionStatus,
  LegalRuleVerificationStatus,
  PerformanceAchievementLevel,
  PerformanceContributionScope,
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

describe('ParliamentarySpecialistAiService — Maker-Checker Critic, Daily Briefing & Claim Guardrail', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.OPENAI_API_KEY = 'sk-mock-local-test';
    process.env.AI_USE_ROUTER = 'false';
  });

  it('Maker-Checker Critic harus mendeteksi ketentuan pidana (UU 1/2026 Pasal 15), kewajiban tanpa pelaksana, dan aturan belum terverifikasi', async () => {
    const result = await ParliamentarySpecialistAiService.runClauseComplianceCritic({
      tenantId: '11111111-1111-4111-8111-111111111111',
      organizationId: '22222222-2222-4222-8222-222222222222',
      organizationName: 'DPRD Kabupaten Bandung',
      legislativeLevel: 'DPRD_KABUPATEN_KOTA',
      regionName: 'Kabupaten Bandung',
      draftTitle: 'Raperda Ketertiban Air Minum',
      clause: {
        id: 'clause-1',
        draftId: 'draft-1',
        organizationId: '22222222-2222-4222-8222-222222222222',
        clauseNumber: 'Pasal 15',
        clauseTitle: 'Ketentuan Pidana',
        clauseText:
          'Setiap pengelola wajib menjamin mutu air; pelanggaran dipidana kurungan paling lama 6 bulan atau denda.',
        problemAddressed: 'Banyak pipa bocor tidak ditangani.',
        legalAuthoritySource: 'Perda Lama 2010',
        regulatedSubjects: null,
        impactAssessment: 'Dampak bagi PDAM dan pelanggan.',
        implementationSupervision: null,
        complianceCriticWarnings: [],
        inspectionStatus: ClauseInspectionStatus.PERLU_TELAAH_HUKUM,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      legalRules: [
        {
          id: 'rule-unverified',
          ruleCode: 'PERDA-LAMA-2010',
          title: 'Perda Lama 2010',
          hierarchyLayer: 'PERDA',
          jurisdictionRegion: 'Kabupaten Bandung',
          effectiveDate: '2010-01-01T00:00:00Z',
          verificationStatus: LegalRuleVerificationStatus.UNVERIFIED_NEEDS_CHECK,
          isFinalLegalBasisAllowed: false,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ],
    });

    expect(result.requiresCriminalLawReviewUu12026).toBe(true);
    expect(result.unverifiedLegalBasisDetected).toBe(true);
    expect(result.passedAutomaticChecks).toBe(false);
    expect(result.recommendedInspectionStatus).toBe(ClauseInspectionStatus.PERLU_TELAAH_HUKUM);
    expect(result.warnings.some((w) => w.includes('UU 1/2026'))).toBe(true);
    expect(result.warnings.some((w) => w.includes('KEWAJIBAN TANPA PELAKSANA JELAS'))).toBe(true);
  });

  it('Daily Member Briefing harus menyertakan 5 komponen briefing dan memberi peringatan bila dasar hukum belum terverifikasi', async () => {
    const briefing = await ParliamentarySpecialistAiService.generateDailyMemberBriefing({
      tenantId: '11111111-1111-4111-8111-111111111111',
      organizationId: '22222222-2222-4222-8222-222222222222',
      organizationName: 'DPRD Kabupaten Bandung',
      legislativeLevel: 'DPRD_KABUPATEN_KOTA',
      regionName: 'Kabupaten Bandung',
      unitId: '33333333-3333-4333-8333-333333333333',
      unitName: 'Komisi III -> Bidang Infrastruktur',
      agendaTitle: 'Raker Klarifikasi LKPJ Dinas PUPR',
      focusOpds: ['Dinas PUPR'],
      recentNotesSummary: ['Catatan: 14 desa belum terlayani air minum.'],
      openFindingsSummary: ['[Dinas PUPR] Cakupan Air Minum — Target: 85, Realisasi: 72.5'],
      legalRules: [
        {
          id: 'r1',
          ruleCode: 'PP-13-2019',
          title: 'PP Nomor 13 Tahun 2019',
          hierarchyLayer: 'EVALUASI_LKPJ',
          jurisdictionRegion: 'NASIONAL',
          effectiveDate: '2019-03-13T00:00:00Z',
          verificationStatus: LegalRuleVerificationStatus.VERIFIED_ACTIVE,
          isFinalLegalBasisAllowed: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ],
    });

    expect(briefing.agendaAndRequiredDecisions.length).toBeGreaterThan(0);
    expect(briefing.keyIssuesAndLatestData.length).toBeGreaterThan(0);
    expect(briefing.verifiedLegalBases[0].ruleCode).toBe('PP-13-2019');
    expect(briefing.stanceOptionsAndConsequences.length).toBeGreaterThan(0);
    expect(briefing.keyQuestionsAndFollowups.length).toBeGreaterThan(0);
    expect(briefing.telemetry.traceId).toMatch(/^tr_\d+_[a-f0-9]{8}$/);
  });

  it('Claim Guardrail Publication harus menegakkan tingkat pencapaian dan membedakan kontribusi individu vs keputusan kolektif', async () => {
    const pub = await ParliamentarySpecialistAiService.draftVerifiedPerformancePublication({
      tenantId: '11111111-1111-4111-8111-111111111111',
      organizationId: '22222222-2222-4222-8222-222222222222',
      organizationName: 'DPRD Kabupaten Bandung',
      unitId: '33333333-3333-4333-8333-333333333333',
      unitName: 'Komisi III',
      authorName: 'H. Ahmad',
      evidence: {
        id: 'ev-1',
        organizationId: '22222222-2222-4222-8222-222222222222',
        tenantId: '11111111-1111-4111-8111-111111111111',
        title: 'Perbaikan Layanan Air Minum',
        achievementLevel: PerformanceAchievementLevel.DIREKOMENDASIKAN,
        contributionScope: PerformanceContributionScope.KONTRIBUSI_INDIVIDU,
        evidenceSourceRef: 'Risalah Rapat Komisi III Hal. 12',
        summaryText: 'Rekomendasi telah disampaikan kepada dinas terkait dan tindak lanjutnya sedang dipantau.',
        isVerified: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    });

    expect(pub.claimGuardrailPassed).toBe(true);
    expect(pub.enforcedAchievementLevel).toBe(PerformanceAchievementLevel.DIREKOMENDASIKAN);
    expect(pub.enforcedContributionScope).toBe(PerformanceContributionScope.KONTRIBUSI_INDIVIDU);
    expect(pub.pressReleaseMarkdown).toContain('telah resmi direkomendasikan kepada perangkat daerah terkait');
    expect(pub.pressReleaseMarkdown).toContain('Risalah Rapat Komisi III Hal. 12');
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('jalur live LLM: Compliance Critic harus menyuntikkan legalRules (termasuk Perda & UU 1/2026) ke prompt LLM dan memakai model heavy', async () => {
    process.env.OPENAI_API_KEY = 'sk-live-unit-test-key-1234567890';
    process.env.AI_USE_ROUTER = 'false';

    const createSpy = vi
      .spyOn(openaiClient.chat.completions, 'create')
      .mockResolvedValue({
        model: 'gpt-4o',
        usage: { prompt_tokens: 320, completion_tokens: 180 },
        choices: [
          {
            message: {
              content:
                'Kritik Hukum: Sanksi pidana Pasal 15 melampaui batasan UU 1/2026 dan perlu selaras dengan PERDA-AIR-2025.',
            },
          },
        ],
      } as any);

    const res = await ParliamentarySpecialistAiService.runClauseComplianceCritic({
      tenantId: '11111111-1111-4111-8111-111111111111',
      organizationId: '22222222-2222-4222-8222-222222222222',
      organizationName: 'DPRD Kabupaten Bandung',
      legislativeLevel: 'DPRD_KABUPATEN_KOTA',
      regionName: 'Kabupaten Bandung',
      draftTitle: 'Raperda Air Minum',
      clause: {
        id: 'c-live',
        draftId: 'd-live',
        organizationId: '22222222-2222-4222-8222-222222222222',
        clauseNumber: 'Pasal 15',
        clauseText: 'Pelanggar ketentuan dipidana kurungan 6 bulan.',
        legalAuthoritySource: 'PERDA-AIR-2025',
        regulatedSubjects: 'PDAM',
        problemAddressed: 'Kebocoran pipa',
        impactAssessment: 'Dampak operasional',
        implementationSupervision: 'Inspektorat',
        complianceCriticWarnings: [],
        inspectionStatus: ClauseInspectionStatus.PERLU_TELAAH_HUKUM,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      legalRules: [
        {
          id: 'r-perda',
          ruleCode: 'PERDA-AIR-2025',
          title: 'Perda Pengelolaan Air Minum 2025',
          hierarchyLayer: 'PERDA',
          jurisdictionRegion: 'Kabupaten Bandung',
          effectiveDate: '2025-01-01T00:00:00Z',
          verificationStatus: LegalRuleVerificationStatus.VERIFIED_ACTIVE,
          isFinalLegalBasisAllowed: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ],
    });

    expect(createSpy).toHaveBeenCalledTimes(1);
    const callArg = createSpy.mock.calls[0][0] as any;
    expect(callArg.model).toBe('gpt-4o');
    expect(callArg.messages[1].content).toContain('PERDA-AIR-2025');
    expect(res.criticNarrativeMarkdown).toContain('PERDA-AIR-2025');
  });

  it('jalur live LLM: Daily Briefing & Hybrid Claim Guardrail Publication harus memakai OpenAI JSON dan menahan over-claim LLM', async () => {
    process.env.OPENAI_API_KEY = 'sk-live-unit-test-key-1234567890';
    process.env.AI_USE_ROUTER = 'false';

    vi.spyOn(openaiClient.chat.completions, 'create')
      .mockResolvedValueOnce({
        model: 'gpt-4o-mini',
        usage: { prompt_tokens: 280, completion_tokens: 210 },
        choices: [
          {
            message: {
              content: JSON.stringify({
                agendaAndRequiredDecisions: ['Putuskan tenggat klarifikasi Dinas PUPR 10 hari'],
                keyIssuesAndLatestData: ['14 desa wilayah selatan belum tersambung pipa utama'],
                stanceOptionsAndConsequences: [
                  'Opsi A — Panggil ulang Dirut PDAM: konsekuensi penundaan pengesahan 3 hari',
                ],
                keyQuestionsAndFollowups: ['Kapan peta koordinat 14 desa diserahkan ke Komisi III?'],
                briefingMarkdown: '### Briefing LLM Khusus Komisi III',
              }),
            },
          },
        ],
      } as any)
      .mockResolvedValueOnce({
        model: 'gpt-4o-mini',
        usage: { prompt_tokens: 220, completion_tokens: 190 },
        choices: [
          {
            message: {
              content: JSON.stringify({
                pressReleaseMarkdown:
                  'Siaran Pers: Program perbaikan jalan desa telah tuntas 100% dan menjadi keputusan final seluruh DPRD berkat usulan anggota.',
                socialCaptionDraft:
                  'Kabar gembira! Program jalan desa telah tuntas 100% berkat usulan anggota. #DPRD',
              }),
            },
          },
        ],
      } as any);

    const briefing = await ParliamentarySpecialistAiService.generateDailyMemberBriefing({
      tenantId: '11111111-1111-4111-8111-111111111111',
      organizationId: '22222222-2222-4222-8222-222222222222',
      organizationName: 'DPRD Kabupaten Bandung',
      legislativeLevel: 'DPRD_KABUPATEN_KOTA',
      regionName: 'Kabupaten Bandung',
      unitId: '33333333-3333-4333-8333-333333333333',
      unitName: 'Komisi III',
      agendaTitle: 'Raker Air Minum',
      focusOpds: ['Dinas PUPR'],
      recentNotesSummary: ['14 desa belum terlayani'],
      openFindingsSummary: [],
      legalRules: [],
    });

    expect(briefing.agendaAndRequiredDecisions).toEqual([
      'Putuskan tenggat klarifikasi Dinas PUPR 10 hari',
    ]);
    expect(briefing.briefingMarkdown).toContain('Briefing LLM Khusus Komisi III');

    const pub = await ParliamentarySpecialistAiService.draftVerifiedPerformancePublication({
      tenantId: '11111111-1111-4111-8111-111111111111',
      organizationId: '22222222-2222-4222-8222-222222222222',
      organizationName: 'DPRD Kabupaten Bandung',
      unitId: '33333333-3333-4333-8333-333333333333',
      unitName: 'Komisi III',
      authorName: 'H. Ahmad',
      evidence: {
        id: 'ev-overclaim',
        organizationId: '22222222-2222-4222-8222-222222222222',
        tenantId: '11111111-1111-4111-8111-111111111111',
        title: 'Usulan Perbaikan Jalan Desa',
        achievementLevel: PerformanceAchievementLevel.DIUSULKAN,
        contributionScope: PerformanceContributionScope.KONTRIBUSI_INDIVIDU,
        evidenceSourceRef: 'Risalah Rapat No. 88/2026',
        summaryText: 'Anggota mengusulkan perbaikan jalan desa pada rapat komisi.',
        isVerified: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    });

    // Layer 2 Post-LLM Claim Guardrail MUST clamp over-claiming phrases!
    expect(pub.telemetry.model).toBe('gpt-4o-mini');
    expect(pub.pressReleaseMarkdown).not.toContain('telah tuntas 100%');
    expect(pub.pressReleaseMarkdown).not.toContain('keputusan final seluruh DPRD');
    expect(pub.pressReleaseMarkdown).toContain('telah diusulkan untuk dibahas');
    expect(pub.pressReleaseMarkdown).toContain('Risalah Rapat No. 88/2026');
    expect(pub.pressReleaseMarkdown).toContain('Catatan Transparansi POLARIS');
    expect(pub.socialCaptionDraft).not.toContain('telah tuntas 100%');
  });
});
