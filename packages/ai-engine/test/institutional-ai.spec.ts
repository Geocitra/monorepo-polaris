import { describe, it, expect, vi, beforeEach } from 'vitest';
import { InstitutionalAiService } from '../src/institutional/institutional-ai.service.js';
import { OrganizationUnitType } from '@polaris/shared-types';

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
  findInstitutionalScopedDatahubChunks: vi.fn().mockResolvedValue([
    {
      id: 'chunk-unit-1',
      fileId: '11111111-1111-4111-8111-111111111111',
      chunkIndex: 0,
      sectionTitle: 'Bab III Realisasi Air Minum',
      chunkContent: 'Target layanan air minum RPJMD 85%, realisasi LKPJ 72% pada 14 desa.',
      contextualHeader: 'Kajian Bidang Infrastruktur',
      customTitle: 'Kajian Air Minum Bidang Infrastruktur',
      categoryTag: 'KAJIAN_AKADEMIS',
      privacyScope: 'UNIT_BIDANG',
      organizationId: '22222222-2222-4222-8222-222222222222',
      organizationUnitId: '33333333-3333-4333-8333-333333333333',
      similarityScore: 0.91,
    },
    {
      id: 'chunk-org-1',
      fileId: '44444444-4444-4444-8444-444444444444',
      chunkIndex: 2,
      sectionTitle: 'Halaman 114 LKPJ 2025',
      chunkContent: 'Realisasi anggaran Dinas PUPR untuk jaringan perpipaan mencapai Rp 14,2 Miliar.',
      contextualHeader: 'LKPJ Resmi Sekretariat',
      customTitle: 'LKPJ Pemerintah Daerah TA 2025',
      categoryTag: 'REGULASI_DAERAH',
      privacyScope: 'ORG_SHARED',
      organizationId: '22222222-2222-4222-8222-222222222222',
      organizationUnitId: null,
      similarityScore: 0.87,
    },
  ]),
  findSimilarKnowledgeChunks: vi.fn().mockResolvedValue([
    {
      id: 'reg-1',
      documentId: '55555555-5555-4555-8555-555555555555',
      structuralReference: 'PP Nomor 13 Tahun 2019 Pasal 20',
      chunkContent: 'DPRD melakukan pembahasan LKPJ paling lambat 30 hari setelah LKPJ diterima.',
      similarityScore: 0.84,
    },
  ]),
}));

describe('InstitutionalAiService — Strict Bidang Scoped AI & B2G Contract Telemetry', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.OPENAI_API_KEY = 'sk-mock-local-test';
    process.env.AI_USE_ROUTER = 'false';
  });

  it('harus memisahkan sumber UNIT_BIDANG, ORG_SHARED, dan REGULASI serta membebankan token ke Kontrak Instansi (bukan kuota personal)', async () => {
    const tenantId = '11111111-1111-4111-8111-111111111111';
    const organizationId = '22222222-2222-4222-8222-222222222222';
    const activeUnitId = '33333333-3333-4333-8333-333333333333';

    const result = await InstitutionalAiService.executeScopedBidangAssist({
      tenantId,
      organizationId,
      organizationName: 'DPRD Kabupaten Bandung',
      legislativeLevel: 'DPRD_KABUPATEN_KOTA',
      regionName: 'Kabupaten Bandung',
      activeUnitId,
      activeUnitCode: 'KOM3-BID-INFRA',
      activeUnitName: 'Bidang Infrastruktur',
      activeUnitType: OrganizationUnitType.BIDANG,
      parentUnitName: 'Komisi III',
      parentUnitType: OrganizationUnitType.KOMISI,
      focusSectors: ['Pekerjaan Umum', 'Air Minum'],
      partnerOpds: ['Dinas PUPR', 'PDAM Tirta Raharja'],
      prompt: 'Evaluasi capaian layanan air minum tahun 2025 dan susun pertanyaan klarifikasi untuk Dinas PUPR.',
      focusIssue: 'Kesenjangan Target Air Minum',
      unitSharedNotes: [
        {
          id: 'note-1',
          title: 'Temuan Reses Desa Selatan',
          authorName: 'H. Ahmad',
          visibility: 'UNIT_SHARED',
          contentMarkdown: '3 desa di wilayah selatan melaporkan pipa distribusi belum mengalir.',
          updatedAt: new Date().toISOString(),
        },
      ],
    });

    expect(result.unitChunks).toHaveLength(1);
    expect(result.unitChunks[0].privacyScope).toBe('UNIT_BIDANG');
    expect(result.orgSharedChunks).toHaveLength(1);
    expect(result.orgSharedChunks[0].privacyScope).toBe('ORG_SHARED');
    expect(result.regulationChunks).toHaveLength(1);
    expect(result.telemetry.traceId).toMatch(/^tr_\d+_[a-f0-9]{8}$/);
    expect(result.telemetry.totalTokens).toBeGreaterThan(0);
    expect(result.answerMarkdown).toContain('Komisi III (KOMISI) -> Bidang Infrastruktur (BIDANG)');
    expect(result.answerMarkdown).toContain('[DOKUMEN_BIDANG_1]');
    expect(result.answerMarkdown).toContain('[DOKUMEN_RESMI_SEKRETARIAT_1]');

    // Verifikasi bahwa organizationContracts di-update untuk memotong kuota B2G Instansi
    expect(mockUpdate).toHaveBeenCalled();
  });
});
