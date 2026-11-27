import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ForbiddenException } from '@nestjs/common';
import { InstitutionalQuotaFeatureScope } from '@polaris/shared-types';

const {
  mockDbSelect,
  mockDbUpdate,
  mockDbInsert,
  mockDbTransaction,
  mockSelectLimit,
  mockSelectWhere,
  mockUpdateReturning,
  mockUpdateWhere,
  mockDbExecute,
} = vi.hoisted(() => {
  const mockSelectLimit = vi.fn();
  const mockSelectWhere = vi.fn(() => ({
    orderBy: vi.fn(() => ({ limit: mockSelectLimit })),
    limit: mockSelectLimit,
  }));
  const mockDbSelect = vi.fn(() => ({
    from: vi.fn(() => ({
      where: mockSelectWhere,
    })),
  }));

  const mockUpdateReturning = vi.fn();
  const mockUpdateWhere = vi.fn(() => ({
    returning: mockUpdateReturning,
  }));
  const mockDbUpdate = vi.fn(() => ({
    set: vi.fn(() => ({
      where: mockUpdateWhere,
    })),
  }));

  const mockDbInsert = vi.fn(() => ({
    values: vi.fn(() => ({
      onConflictDoNothing: vi.fn().mockResolvedValue(undefined),
    })),
  }));

  const mockDbTransaction = vi.fn(async (cb: (tx: any) => Promise<any>) => {
    return cb({
      insert: mockDbInsert,
      update: mockDbUpdate,
    });
  });

  const mockDbExecute = vi.fn();

  return {
    mockDbSelect,
    mockDbUpdate,
    mockDbInsert,
    mockDbTransaction,
    mockSelectLimit,
    mockSelectWhere,
    mockUpdateReturning,
    mockUpdateWhere,
    mockDbExecute,
  };
});

vi.mock('@polaris/database', () => ({
  db: {
    select: mockDbSelect,
    update: mockDbUpdate,
    insert: mockDbInsert,
    transaction: mockDbTransaction,
    execute: mockDbExecute,
  },
  organizationContracts: {
    organizationId: 'organization_id',
    contractNumber: 'contract_number',
    fiscalYear: 'fiscal_year',
    annualTokenPoolLimit: 'annual_token_pool_limit',
    tokensConsumed: 'tokens_consumed',
    weeklyGenerateLimitPerMember: 'weekly_generate_limit_per_member',
    revisionLimitPerItem: 'revision_limit_per_item',
    endDate: 'end_date',
  },
  organizationMemberQuotaWallets: {
    organizationId: 'organization_id',
    tenantId: 'tenant_id',
    weeklyPeriodKey: 'weekly_period_key',
    featureScope: 'feature_scope',
    weeklyUsed: 'weekly_used',
    totalGenerated: 'total_generated',
    totalRevisions: 'total_revisions',
  },
  eq: vi.fn((a, b) => ({ eq: [a, b] })),
  and: vi.fn((...args) => ({ and: args })),
  desc: vi.fn((a) => ({ desc: a })),
  sql: vi.fn((strings: TemplateStringsArray, ...vals: any[]) => ({ sql: strings.join('?'), vals })),
}));

import { InstitutionalQuotaService } from '../src/modules/institutional/institutional-quota.service.js';

describe('InstitutionalQuotaService (Kuota Mingguan Terpisah per Fitur)', () => {
  let service: InstitutionalQuotaService;

  beforeEach(() => {
    vi.clearAllMocks();
    service = new InstitutionalQuotaService();
  });

  it('memisahkan batas kuota Chat POLARIS (minimal 10x/mgg) dan LKPJ/Legislasi (sesuai kontrak 3x/mgg)', async () => {
    // 1. getContractQuotaConfig -> select().from().where().orderBy().limit(1)
    mockSelectWhere.mockReturnValueOnce({
      orderBy: vi.fn(() => ({ limit: mockSelectLimit })),
      limit: mockSelectLimit,
    });
    mockSelectLimit.mockResolvedValueOnce([
      { weeklyGenerateLimitPerMember: 3, revisionLimitPerItem: 3 },
    ]);
    // 2. getMemberQuota -> wallets select().from().where()
    mockSelectWhere.mockResolvedValueOnce([
      {
        featureScope: InstitutionalQuotaFeatureScope.COORDINATOR_CHAT,
        weeklyLimit: 10,
        weeklyUsed: 2,
        totalGenerated: 2,
        totalRevisions: 0,
      },
      {
        featureScope: InstitutionalQuotaFeatureScope.LKPJ_EVALUATION,
        weeklyLimit: 3,
        weeklyUsed: 1,
        totalGenerated: 1,
        totalRevisions: 1,
      },
    ] as any);

    const quota = await service.getMemberQuota(
      'org-1',
      'tenant-1',
      InstitutionalQuotaFeatureScope.COORDINATOR_CHAT
    );

    expect(quota.weeklyLimit).toBe(10);
    expect(quota.weeklyUsed).toBe(2);
    expect(quota.remainingWeekly).toBe(8);
    expect(quota.byFeature.COORDINATOR_CHAT.remainingWeekly).toBe(8);
    expect(quota.byFeature.LKPJ_EVALUATION.weeklyLimit).toBe(3);
    expect(quota.byFeature.LKPJ_EVALUATION.remainingWeekly).toBe(2);
    expect(quota.byFeature.LEGISLATION.weeklyLimit).toBe(3);
    expect(quota.byFeature.LEGISLATION.remainingWeekly).toBe(3);
  });

  it('melempar ForbiddenException WEEKLY_GENERATE_LIMIT_EXCEEDED saat kuota fitur habis', async () => {
    mockSelectLimit.mockResolvedValueOnce([
      { weeklyGenerateLimitPerMember: 3, revisionLimitPerItem: 3 },
    ]);
    // Atomic update mengembalikan array kosong -> tidak ada row yang memenuhi weeklyUsed < weeklyLimit
    mockUpdateReturning.mockResolvedValueOnce([]);

    try {
      await service.consumeGenerateQuota(
        'org-1',
        'tenant-1',
        InstitutionalQuotaFeatureScope.LKPJ_EVALUATION
      );
      expect.unreachable('Seharusnya melempar ForbiddenException');
    } catch (err: any) {
      expect(err).toBeInstanceOf(ForbiddenException);
      const response = err.getResponse();
      expect(response.errorCode).toBe('WEEKLY_GENERATE_LIMIT_EXCEEDED');
      expect(response.featureScope).toBe(InstitutionalQuotaFeatureScope.LKPJ_EVALUATION);
      expect(response.weeklyLimit).toBe(3);
    }
  });

  it('mengembalikan kuota jika refundGenerateQuota dipanggil setelah AI error', async () => {
    mockUpdateWhere.mockResolvedValueOnce(undefined as any);
    await service.refundGenerateQuota(
      'org-1',
      'tenant-1',
      InstitutionalQuotaFeatureScope.COORDINATOR_CHAT
    );
    expect(mockDbUpdate).toHaveBeenCalledTimes(1);
  });

  it('mereset kuota mingguan anggota lewat resetMemberWeeklyQuota', async () => {
    mockUpdateWhere.mockResolvedValueOnce(undefined as any);
    mockSelectWhere.mockReturnValueOnce({
      orderBy: vi.fn(() => ({ limit: mockSelectLimit })),
      limit: mockSelectLimit,
    });
    mockSelectLimit.mockResolvedValueOnce([
      { weeklyGenerateLimitPerMember: 3, revisionLimitPerItem: 3 },
    ]);
    mockSelectWhere.mockResolvedValueOnce([] as any);

    const result = await service.resetMemberWeeklyQuota('org-1', 'tenant-1');
    expect(mockDbUpdate).toHaveBeenCalledTimes(1);
    expect(result.weeklyUsed).toBe(0);
    expect(result.remainingWeekly).toBe(10);
  });

  it('memicu peringatan WARNING_80 saat pemakaian pool token kontrak >= 80%', async () => {
    // 1. getContractQuotaConfig
    mockSelectWhere.mockReturnValueOnce({
      orderBy: vi.fn(() => ({ limit: mockSelectLimit })),
      limit: mockSelectLimit,
    });
    mockSelectLimit.mockResolvedValueOnce([
      { weeklyGenerateLimitPerMember: 3, revisionLimitPerItem: 3 },
    ]);
    // 2. unitRows & memberRows (db.execute x2)
    mockDbExecute.mockResolvedValueOnce({ rows: [] }).mockResolvedValueOnce({ rows: [] });
    // 3. walletRows
    mockSelectWhere.mockResolvedValueOnce([] as any);
    // 4. contractRow untuk tokenPoolAlert (85% terpakai)
    mockSelectWhere.mockReturnValueOnce({
      orderBy: vi.fn(() => ({ limit: mockSelectLimit })),
      limit: mockSelectLimit,
    });
    mockSelectLimit.mockResolvedValueOnce([
      {
        contractNumber: 'KONTRAK-2026-01',
        fiscalYear: 2026,
        annualTokenPoolLimit: 1_000_000,
        tokensConsumed: 850_000,
      },
    ]);

    const analytics = await service.getOrganizationUsageAnalytics('org-1', '2026-11');
    expect(analytics.tokenPoolAlert?.alertLevel).toBe('WARNING_80');
    expect(analytics.tokenPoolAlert?.usagePercentage).toBe(85);
    expect(analytics.tokenPoolAlert?.message).toContain('80%');
  });
});
