import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  BadRequestException,
  ForbiddenException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';

const { mockSelectLimit, mockDbSelect } = vi.hoisted(() => {
  const mockSelectLimit = vi.fn();
  const makeWhereResult = () =>
    Object.assign(Promise.resolve([]), {
      limit: mockSelectLimit,
      orderBy: vi.fn(() => Object.assign(Promise.resolve([]), { limit: mockSelectLimit })),
    });
  const mockDbSelect = vi.fn(() => ({
    from: vi.fn(() => ({
      where: vi.fn(() => makeWhereResult()),
    })),
  }));

  return { mockSelectLimit, mockDbSelect };
});

vi.mock('@polaris/database', () => ({
  db: {
    select: mockDbSelect,
  },
  systemAdmins: { id: 'id', email: 'email', isActive: 'is_active', role: 'role' },
  emailOtps: { email: 'email', otpCode: 'otp_code', isUsed: 'is_used', createdAt: 'created_at' },
  operatorTenantAssignments: {
    id: 'id',
    operatorId: 'operator_id',
    tenantId: 'tenant_id',
    status: 'status',
  },
  liveChatSessions: { id: 'id', tenantId: 'tenant_id', assignedOperatorId: 'assigned_operator_id' },
  liveChatMessages: { sessionId: 'session_id', createdAt: 'created_at' },
  tenantMembers: { id: 'id' },
  connectedSocialAccounts: { id: 'id', tenantId: 'tenant_id' },
  socialPublishingJobs: {},
  withTenantContext: vi.fn(async (_tenantId: string, cb: (tx: any) => Promise<any>) => {
    return cb({ select: mockDbSelect });
  }),
  eq: vi.fn((a, b) => ({ eq: [a, b] })),
  and: vi.fn((...args) => ({ and: args })),
  desc: vi.fn((a) => ({ desc: a })),
  asc: vi.fn((a) => ({ asc: a })),
  inArray: vi.fn((a, b) => ({ inArray: [a, b] })),
  sql: vi.fn(),
}));

import { SuperadminAuthService } from '../src/modules/superadmin/services/superadmin-auth.service.js';
import { OperatorService } from '../src/modules/operator/operator.service.js';
import { WhatsAppCloudClient } from '../src/modules/whatsapp/whatsapp-cloud.client.js';
import { WhatsAppLiveChatService } from '../src/modules/whatsapp/services/whatsapp-live-chat.service.js';
import { PosterVisionExtractorService } from '../src/modules/studio/services/poster-vision-extractor.service.js';
import { InstagramService } from '../src/modules/instagram/instagram.service.js';
import { ThreadsService } from '../src/modules/threads/threads.service.js';

describe('Security Hardening Suite (Superadmin, Operator, WhatsApp, Sosmed, Vision SSRF)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSelectLimit.mockReset();
  });

  describe('SuperadminAuthService.verifyOtp (No 123456 Backdoor)', () => {
    it('menolak (401 Unauthorized) kode OTP 123456 jika tidak ada record OTP aktif di database', async () => {
      const authService = new SuperadminAuthService({} as any);
      // 1. systemAdmins -> active superadmin found
      mockSelectLimit.mockResolvedValueOnce([
        { id: 'admin-1', email: 'super@polaris.id', fullName: 'Super', role: 'SUPERADMIN', isActive: true },
      ]);
      // 2. emailOtps -> [] (no valid OTP record)
      mockSelectLimit.mockResolvedValueOnce([]);

      await expect(
        authService.verifyOtp({ email: 'super@polaris.id', otpCode: '123456' })
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('OperatorService (Protect SUPERADMIN from Operator Admin Endpoints)', () => {
    it('menolak (403 Forbidden) jika endpoint operator mencoba mengubah atau menghapus akun SUPERADMIN', async () => {
      const operatorService = new OperatorService({} as any);
      mockSelectLimit.mockResolvedValueOnce([
        { id: 'admin-1', email: 'super@polaris.id', role: 'SUPERADMIN' },
      ]);

      await expect(
        operatorService.updateOperatorAccount('admin-1', { fullName: 'Hacked' })
      ).rejects.toThrow(ForbiddenException);

      mockSelectLimit.mockResolvedValueOnce([
        { id: 'admin-1', email: 'super@polaris.id', role: 'SUPERADMIN' },
      ]);

      await expect(operatorService.deleteOperatorAccount('admin-1')).rejects.toThrow(
        ForbiddenException
      );
    });
  });

  describe('WhatsAppCloudClient & WhatsAppLiveChatService', () => {
    it('menolak webhook signature jika WHATSAPP_APP_SECRET kosong di environment non-test', () => {
      const prevSecret = process.env.WHATSAPP_APP_SECRET;
      const prevEnv = process.env.NODE_ENV;
      delete process.env.WHATSAPP_APP_SECRET;
      process.env.NODE_ENV = 'production';

      try {
        const client = new WhatsAppCloudClient();
        expect(client.verifyWebhookSignature('{"test":1}', 'sha256=abc')).toBe(false);
      } finally {
        if (prevSecret !== undefined) process.env.WHATSAPP_APP_SECRET = prevSecret;
        if (prevEnv !== undefined) process.env.NODE_ENV = prevEnv;
      }
    });

    it('menolak (403 Forbidden) operator yang tidak ditugaskan mengakses pesan live chat tenant lain', async () => {
      const liveChat = new WhatsAppLiveChatService({} as any, {} as any);
      // 1. liveChatSessions -> belongs to tenant-other, assigned to op-other
      mockSelectLimit.mockResolvedValueOnce([
        { id: 'sess-1', tenantId: 'tenant-other', assignedOperatorId: 'op-other', status: 'ACTIVE' },
      ]);
      // 2. operatorTenantAssignments -> [] (not assigned)
      mockSelectLimit.mockResolvedValueOnce([]);

      await expect(
        liveChat.getSessionMessages('sess-1', 'op-intruder', false)
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('PosterVisionExtractorService (SSRF Protection)', () => {
    it('menolak (400 BadRequest) URL internal / metadata cloud seperti 169.254.169.254 dan localhost', async () => {
      const extractor = new PosterVisionExtractorService();

      await expect(
        extractor.extractContentFromImage('http://169.254.169.254/latest/meta-data/')
      ).rejects.toThrow(BadRequestException);

      await expect(
        extractor.extractContentFromImage('http://127.0.0.1:4000/api/v1/health')
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('InstagramService & ThreadsService (Anti-IDOR Account Ownership)', () => {
    it('menolak (404 NotFound) publikasi Instagram/Threads jika accountId bukan milik tenantId', async () => {
      const mockPlatformSettings = {
        isFeatureEnabled: vi.fn().mockResolvedValue(true),
      };
      const igService = new InstagramService({} as any, mockPlatformSettings as any);
      const threadsService = new ThreadsService(mockPlatformSettings as any);

      try {
        mockSelectLimit.mockResolvedValueOnce([]);
        await expect(
          igService.triggerPublishContent('tenant-attacker', {
            accountId: 'acc-victim',
            caption: 'test',
            mediaUrl: 'https://cdn.example.com/a.jpg',
          })
        ).rejects.toThrow(NotFoundException);

        mockSelectLimit.mockResolvedValueOnce([]);
        await expect(
          threadsService.triggerPublishContent('tenant-attacker', {
            accountId: 'acc-victim',
            text: 'test',
          } as any)
        ).rejects.toThrow(NotFoundException);
      } finally {
        await igService.onModuleDestroy();
      }
    });
  });
});
