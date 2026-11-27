import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  BadRequestException,
  ExecutionContext,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';

const { mockSelectLimit, mockDbSelect, mockDbInsert, mockJwtVerifyAsync } = vi.hoisted(() => {
  const mockSelectLimit = vi.fn();
  const makeWhereResult = () =>
    Object.assign(Promise.resolve([]), {
      limit: mockSelectLimit,
      orderBy: vi.fn(() => Object.assign(Promise.resolve([]), { limit: mockSelectLimit })),
    });
  const mockDbSelect = vi.fn(() => ({
    from: vi.fn(() => ({
      where: vi.fn(() => makeWhereResult()),
      innerJoin: vi.fn(() => ({
        where: vi.fn(() => makeWhereResult()),
      })),
    })),
  }));

  const mockDbInsert = vi.fn(() => ({
    values: vi.fn(() => ({
      returning: vi.fn().mockResolvedValue([
        {
          id: 'pub-1',
          tenantId: 'tenant-1',
          slug: 'test-slug',
          title: 'Test Title',
          status: 'DRAFT',
        },
      ]),
    })),
  }));

  const mockJwtVerifyAsync = vi.fn();

  return { mockSelectLimit, mockDbSelect, mockDbInsert, mockJwtVerifyAsync };
});

vi.mock('@polaris/database', () => ({
  db: {
    select: mockDbSelect,
    insert: mockDbInsert,
  },
  operatorTenantAssignments: {
    operatorId: 'operator_id',
    tenantId: 'tenant_id',
    status: 'status',
  },
  subscriptions: { tenantId: 'tenant_id', status: 'status' },
  portalConfigs: { tenantId: 'tenant_id' },
  portalThemeSettings: {},
  tenantMembers: { id: 'id' },
  contentPublications: { id: 'id', tenantId: 'tenant_id' },
  contentBriefs: { id: 'id', tenantId: 'tenant_id', status: 'status' },
  contentBriefMessages: {},
  mediaAssets: {},
  withTenantContext: vi.fn(async (_tenantId: string, cb: (tx: any) => Promise<any>) => {
    return cb({ select: mockDbSelect, insert: mockDbInsert });
  }),
  eq: vi.fn((a, b) => ({ eq: [a, b] })),
  and: vi.fn((...args) => ({ and: args })),
}));

import { AuthGuard } from '../src/common/guards/auth.guard.js';
import { StudioService } from '../src/modules/studio/studio.service.js';
import { StudioGeneratorService } from '../src/modules/studio/services/studio-generator.service.js';
import { WhatsAppOperatorBrokerService } from '../src/modules/whatsapp/services/whatsapp-operator-broker.service.js';
import { WhatsAppPublicReviewService } from '../src/modules/whatsapp/services/whatsapp-public-review.service.js';

describe('Operator <-> B2C Hardening Suite (Impersonation, Quota, & Broker Lifecycle)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSelectLimit.mockReset();
    mockJwtVerifyAsync.mockReset();
  });

  describe('AuthGuard x-acting-tenant-id Restriksi Operator', () => {
    const makeGuard = () => {
      const reflector = { getAllAndOverride: vi.fn().mockReturnValue(false) };
      const jwtService = { verifyAsync: mockJwtVerifyAsync };
      return new AuthGuard(jwtService as any, reflector as any);
    };

    const makeCtx = (path: string, method: string, actingTenantId = 'tenant-b2c-1') => {
      const req: any = {
        path,
        url: path,
        method,
        headers: {
          authorization: 'Bearer valid-op-token',
          'x-acting-tenant-id': actingTenantId,
        },
        query: {},
      };
      return {
        req,
        ctx: {
          getHandler: () => ({}),
          getClass: () => ({}),
          switchToHttp: () => ({ getRequest: () => req }),
        } as unknown as ExecutionContext,
      };
    };

    it('menolak (403 Forbidden) operator yang mencoba /auth/change-password, /social/instagram/exchange, atau /institutional/*', async () => {
      const guard = makeGuard();
      mockJwtVerifyAsync.mockResolvedValue({
        sub: 'op-1',
        email: 'op@polaris.id',
        role: 'CONTENT_OPERATOR',
      });

      await expect(
        guard.canActivate(makeCtx('/api/v1/auth/change-password', 'POST').ctx)
      ).rejects.toThrow(ForbiddenException);

      await expect(
        guard.canActivate(makeCtx('/api/v1/social/instagram/exchange', 'POST').ctx)
      ).rejects.toThrow(ForbiddenException);

      await expect(
        guard.canActivate(makeCtx('/api/v1/institutional/my-workspaces', 'GET').ctx)
      ).rejects.toThrow(ForbiddenException);
    });

    it('mengizinkan operator aktif pada rute Studio dan mempropagasi canDirectPublish = false', async () => {
      const guard = makeGuard();
      mockJwtVerifyAsync.mockResolvedValue({
        sub: 'op-1',
        email: 'op@polaris.id',
        role: 'CONTENT_OPERATOR',
      });
      mockSelectLimit.mockResolvedValueOnce([
        { id: 'assign-1', operatorId: 'op-1', tenantId: 'tenant-b2c-1', canDirectPublish: false },
      ]);

      const { ctx, req } = makeCtx('/api/v1/studio/articles', 'GET');
      await expect(guard.canActivate(ctx)).resolves.toBe(true);
      expect(req.user.isOperator).toBe(true);
      expect(req.user.canDirectPublish).toBe(false);
    });
  });

  describe('StudioService.publishInfographic (canDirectPublish Guard)', () => {
    it('menolak (403 Forbidden) jika operator dengan canDirectPublish=false mencoba menerbitkan infografis langsung', async () => {
      const studioService = new StudioService(
        {} as any,
        {} as any,
        {} as any,
        {} as any
      );

      await expect(
        studioService.publishInfographic(
          'tenant-1',
          { title: 'Infografis', imageUrl: 'https://cdn.example.com/a.png' } as any,
          { isOperator: true, canDirectPublish: false }
        )
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('StudioGeneratorService.generateNewContentPackage (Anti-Bypass briefId)', () => {
    it('menolak (404 NotFound) jika dto.briefId tidak ditemukan milik tenant', async () => {
      const genService = new StudioGeneratorService(
        {} as any,
        {} as any,
        {} as any
      );
      try {
        // 1. subscriptions -> ACTIVE
        mockSelectLimit.mockResolvedValueOnce([{ status: 'ACTIVE', planTier: 'PRO' }]);
        // 2. portalConfigs -> found
        mockSelectLimit.mockResolvedValueOnce([{ subdomainSlug: 'budi-santoso', customDomain: null }]);
        // 3. contentBriefs -> []
        mockSelectLimit.mockResolvedValueOnce([]);

        await expect(
          genService.generateNewContentPackage('tenant-1', {
            topic: 'Test Topik',
            briefId: '00000000-0000-0000-0000-000000000099',
          } as any)
        ).rejects.toThrow(NotFoundException);
      } finally {
        await genService.onModuleDestroy();
      }
    });

    it('menolak (403 Forbidden) jika dto.briefId sudah berstatus CANCELLED (mencegah bypass kuota)', async () => {
      const genService = new StudioGeneratorService(
        {} as any,
        {} as any,
        {} as any
      );
      try {
        // 1. subscriptions -> ACTIVE
        mockSelectLimit.mockResolvedValueOnce([{ status: 'ACTIVE', planTier: 'PRO' }]);
        // 2. portalConfigs -> found
        mockSelectLimit.mockResolvedValueOnce([{ subdomainSlug: 'budi-santoso', customDomain: null }]);
        // 3. contentBriefs -> CANCELLED
        mockSelectLimit.mockResolvedValueOnce([
          { id: 'brief-1', briefCode: 'BR-001', status: 'CANCELLED' },
        ]);

        await expect(
          genService.generateNewContentPackage('tenant-1', {
            topic: 'Test Topik',
            briefId: 'brief-1',
          } as any)
        ).rejects.toThrow(ForbiddenException);
      } finally {
        await genService.onModuleDestroy();
      }
    });
  });

  describe('WhatsApp Broker & Public Review Terminal-State Guards', () => {
    it('menolak (400 BadRequest) rejectBrief pada tiket yang sudah REJECTED (anti double refund)', async () => {
      const mockHelper = {
        assertOperatorCanAccessTenant: vi.fn().mockResolvedValue(undefined),
      };
      const broker = new WhatsAppOperatorBrokerService(
        {} as any,
        {} as any,
        mockHelper as any,
        {} as any
      );
      mockSelectLimit.mockResolvedValueOnce([
        {
          brief: { id: 'brief-1', briefCode: 'BR-001', tenantId: 'tenant-1', status: 'REJECTED' },
          fullName: 'Budi',
          phoneNumber: '628123',
        },
      ]);

      await expect(
        broker.rejectBrief('op-1', 'brief-1', { reason: 'Ditolak ulang' } as any, false)
      ).rejects.toThrow(BadRequestException);
    });

    it('menolak (400 BadRequest) approveBriefByToken pada tiket yang sudah CANCELLED', async () => {
      const publicReview = new WhatsAppPublicReviewService(
        {} as any,
        {} as any,
        {} as any
      );
      vi.spyOn(publicReview as any, 'findBriefByValidReviewToken').mockResolvedValueOnce({
        id: 'brief-1',
        briefCode: 'BR-001',
        tenantId: 'tenant-1',
        status: 'CANCELLED',
      });

      await expect(publicReview.approveBriefByToken('valid-token')).rejects.toThrow(
        BadRequestException
      );
    });
  });
});
