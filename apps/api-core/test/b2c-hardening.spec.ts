import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ExecutionContext, ForbiddenException } from '@nestjs/common';
import { PlanTier, SubscriptionStatus } from '@polaris/shared-types';

const { mockSelectLimit, mockDbSelect, mockDbInsert, mockDbTransaction } = vi.hoisted(() => {
  const mockSelectLimit = vi.fn();
  const makeWhereResult = () =>
    Object.assign(Promise.resolve([]), {
      limit: mockSelectLimit,
      orderBy: vi.fn(() => Object.assign(Promise.resolve([]), { limit: mockSelectLimit })),
      for: vi.fn(() => ({ limit: mockSelectLimit })),
    });
  const mockDbSelect = vi.fn(() => ({
    from: vi.fn(() => ({
      where: vi.fn(() => makeWhereResult()),
    })),
  }));

  const mockDbInsert = vi.fn(() => ({
    values: vi.fn(() => ({
      onConflictDoNothing: vi.fn(() => ({ returning: vi.fn().mockResolvedValue([]) })),
    })),
  }));

  const mockDbTransaction = vi.fn(async (cb: (tx: any) => Promise<any>) => {
    return cb({
      select: mockDbSelect,
      insert: mockDbInsert,
    });
  });

  return { mockSelectLimit, mockDbSelect, mockDbInsert, mockDbTransaction };
});

vi.mock('@polaris/database', () => ({
  db: {
    select: mockDbSelect,
    insert: mockDbInsert,
    transaction: mockDbTransaction,
  },
  subscriptions: {
    id: 'id',
    tenantId: 'tenant_id',
    status: 'status',
    planTier: 'plan_tier',
    currentPeriodEnd: 'current_period_end',
    gracePeriodEnd: 'grace_period_end',
  },
  invoiceTransactions: {
    id: 'id',
    subscriptionId: 'subscription_id',
    createdAt: 'created_at',
  },
  tenantQuotaLedgers: {
    tenantId: 'tenant_id',
    billingCycleMonth: 'billing_cycle_month',
  },
  tenantQuotaWallets: {
    id: 'id',
    tenantId: 'tenant_id',
  },
  tenantQuotaTransactions: {},
  tenantMembers: {
    id: 'id',
    legislativeLevel: 'legislative_level',
  },
  subscriptionPriceMatrices: {},
  portalConfigs: {
    id: 'id',
    tenantId: 'tenant_id',
    subdomainSlug: 'subdomain_slug',
    customDomain: 'custom_domain',
  },
  domainRequests: {},
  subdomainAliases: {},
  contentPublications: {
    id: 'id',
    tenantId: 'tenant_id',
  },
  mediaAssets: {
    publicationId: 'publication_id',
    cdnPublicUrl: 'cdn_public_url',
  },
  contentBriefs: {},
  withTenantContext: vi.fn(),
  eq: vi.fn((a, b) => ({ eq: [a, b] })),
  and: vi.fn((...args) => ({ and: args })),
  desc: vi.fn((a) => ({ desc: a })),
}));

vi.mock('@polaris/core-domain', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@polaris/core-domain')>();
  return {
    ...actual,
    DynamicExchangeRate: {
      getLiveUsdToIdrSnapshot: vi.fn().mockResolvedValue({
        rateIdrPerUsd: 16000,
        source: 'MOCK',
      }),
    },
  };
});

import { SubscriptionGuard } from '../src/common/guards/subscription.guard.js';
import { BillingService } from '../src/modules/billing/billing.service.js';
import { QuotaWalletService } from '../src/modules/billing/quota-wallet.service.js';
import { StudioMagicLayersService } from '../src/modules/studio/services/studio-magic-layers.service.js';
import { CmsDomainDnsService } from '../src/modules/cms/services/cms-domain-dns.service.js';

describe('B2C Production Hardening Suite (Fase 1-3 Regressions)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSelectLimit.mockReset();
  });

  describe('SubscriptionGuard (Expiry & Grace Period Enforcement)', () => {
    const guard = new SubscriptionGuard();
    const makeCtx = (tenantId = 'tenant-1'): ExecutionContext =>
      ({
        switchToHttp: () => ({
          getRequest: () => ({ user: { tenantId } }),
        }),
      }) as unknown as ExecutionContext;

    it('menolak (403 Forbidden) jika langganan ACTIVE tetapi currentPeriodEnd & gracePeriodEnd sudah lewat', async () => {
      const past = new Date(Date.now() - 86_400_000);
      mockSelectLimit.mockResolvedValueOnce([
        {
          id: 'sub-1',
          tenantId: 'tenant-1',
          status: SubscriptionStatus.ACTIVE,
          currentPeriodEnd: past,
          gracePeriodEnd: past,
        },
      ]);

      await expect(guard.canActivate(makeCtx())).rejects.toThrow(ForbiddenException);
    });

    it('mengizinkan akses jika langganan ACTIVE dan masih dalam masa aktif', async () => {
      const future = new Date(Date.now() + 86_400_000);
      mockSelectLimit.mockResolvedValueOnce([
        {
          id: 'sub-1',
          tenantId: 'tenant-1',
          status: SubscriptionStatus.ACTIVE,
          currentPeriodEnd: future,
          gracePeriodEnd: null,
        },
      ]);

      await expect(guard.canActivate(makeCtx())).resolves.toBe(true);
    });
  });

  describe('BillingService.getBillingStatus (No Auto-PRO Provisioning)', () => {
    it('mengembalikan status INACTIVE dan kuota 0 tanpa menyisipkan baris PRO gratis jika belum pernah checkout', async () => {
      const mockQuotaWalletService = {
        getTenantQuotaWallet: vi.fn().mockResolvedValue(null),
      };
      const billingService = new BillingService(
        undefined,
        mockQuotaWalletService as any
      );

      // 1. subscriptions -> []
      mockSelectLimit.mockResolvedValueOnce([]);
      // 2. tenantQuotaWallets fallback -> []
      mockSelectLimit.mockResolvedValueOnce([]);
      // 3. tenantQuotaLedgers -> []
      mockSelectLimit.mockResolvedValueOnce([]);
      // 4. tenantMembers -> [{ id, legislativeLevel }]
      mockSelectLimit.mockResolvedValueOnce([{ id: 'tenant-1', legislativeLevel: 'DPRD_KAB_KOTA' }]);

      const status = await billingService.getBillingStatus('tenant-1');

      expect(mockDbInsert).not.toHaveBeenCalled();
      expect(status.subscriptionStatus).toBe(SubscriptionStatus.INACTIVE);
      expect(status.planTier).toBe(PlanTier.STARTER);
      expect(status.quota.totalQuotaAllocated).toBe(0);
      expect(status.quota.remainingQuota).toBe(0);
    });
  });

  describe('QuotaWalletService.deductQuota (SUSPENDED & Null Expiry Guard)', () => {
    it('menolak pemotongan kuota jika langganan berstatus SUSPENDED', async () => {
      const quotaService = new QuotaWalletService();
      vi.spyOn(quotaService, 'getTenantQuotaWallet').mockResolvedValueOnce({} as any);

      // 1. wallet inside tx
      mockSelectLimit.mockResolvedValueOnce([
        {
          id: 'w-1',
          tenantId: 'tenant-1',
          remainingQuota: 10,
          currentPeriodEnd: new Date(Date.now() + 86_400_000),
        },
      ]);
      // 2. subscription inside tx
      mockSelectLimit.mockResolvedValueOnce([{ status: SubscriptionStatus.SUSPENDED }]);

      await expect(
        quotaService.deductQuota({ tenantId: 'tenant-1', cost: 1 })
      ).rejects.toThrow(ForbiddenException);
    });

    it('menolak pemotongan kuota jika wallet.currentPeriodEnd bernilai null', async () => {
      const quotaService = new QuotaWalletService();
      vi.spyOn(quotaService, 'getTenantQuotaWallet').mockResolvedValueOnce({} as any);

      mockSelectLimit.mockResolvedValueOnce([
        {
          id: 'w-1',
          tenantId: 'tenant-1',
          remainingQuota: 10,
          currentPeriodEnd: null,
        },
      ]);
      mockSelectLimit.mockResolvedValueOnce([{ status: SubscriptionStatus.ACTIVE }]);

      await expect(
        quotaService.deductQuota({ tenantId: 'tenant-1', cost: 1 })
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('StudioMagicLayersService (Cross-Tenant IDOR Guard)', () => {
    it('menolak (403 Forbidden) jika publicationId milik tenant lain', async () => {
      const magicService = new StudioMagicLayersService({} as any);
      mockSelectLimit.mockResolvedValueOnce([{ tenantId: 'tenant-owner-a' }]);

      await expect(
        magicService.getOrExtractPosterManifest({
          imageUrl: 'https://cdn.example.com/poster.png',
          publicationId: 'pub-a',
          tenantId: 'tenant-attacker-b',
        })
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('CmsDomainDnsService (Custom Domain Entitlement Check)', () => {
    it('menolak (403 Forbidden) jika akun tier STARTER mencoba mengatur customDomain', async () => {
      const dnsService = new CmsDomainDnsService({} as any);
      // 1. portalConfigs
      mockSelectLimit.mockResolvedValueOnce([
        { id: 'portal-1', tenantId: 'tenant-starter', subdomainSlug: 'budi-santoso' },
      ]);
      // 2. subscriptions -> STARTER
      mockSelectLimit.mockResolvedValueOnce([{ planTier: PlanTier.STARTER }]);

      await expect(
        dnsService.updateDomainConfig('tenant-starter', {
          customDomain: 'budisantoso.id',
        })
      ).rejects.toThrow(ForbiddenException);
    });
  });
});
