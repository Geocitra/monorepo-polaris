import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe, HttpStatus } from '@nestjs/common';
import request from 'supertest';
import { InstagramController } from '../src/modules/instagram/instagram.controller.js';
import { InstagramService } from '../src/modules/instagram/instagram.service.js';
import { AuthGuard } from '../src/common/guards/auth.guard.js';
import { SubscriptionGuard } from '../src/common/guards/subscription.guard.js';

describe('InstagramController HTTP & Ingress Defense Integration', () => {
  let app: INestApplication;

  const mockInstagramService = {
    getAuthorizationUrl: vi.fn((tenantId: string) => ({
      authorizationUrl: `https://www.instagram.com/oauth/authorize?client_id=123&state=signed_state_${tenantId}`,
      state: `signed_state_${tenantId}`,
    })),
    getConnectedAccount: vi.fn(async (tenantId: string) => ({
      id: 'acc-uuid-1',
      accountHandle: 'ahmadfauzi_dpr',
      status: 'ACTIVE',
      daysRemaining: 45,
    })),
    disconnectAccount: vi.fn(async () => ({
      success: true,
      message: 'Koneksi akun Instagram berhasil diputus.',
    })),
    triggerPublishContent: vi.fn(async () => ({
      success: true,
      jobId: 'job-uuid-1',
      publishingJobId: 'pub-job-uuid-1',
    })),
  };

  const mockUserPayload = {
    tenantId: '11111111-1111-4111-8111-111111111111',
    email: 'dewan@dpr.go.id',
    subdomainSlug: 'ahmadfauzi',
    role: 'MEMBER',
  };

  beforeEach(async () => {
    vi.clearAllMocks();

    const moduleRef: TestingModule = await Test.createTestingModule({
      controllers: [InstagramController],
      providers: [
        { provide: InstagramService, useValue: mockInstagramService },
      ],
    })
      .overrideGuard(AuthGuard)
      .useValue({
        canActivate: (context: any) => {
          context.switchToHttp().getRequest().user = mockUserPayload;
          return true;
        },
      })
      .overrideGuard(SubscriptionGuard)
      .useValue({ canActivate: () => true })
      .compile();

    app = moduleRef.createNestApplication();
    app.use((req: any, _res: any, next: any) => {
      req.user = mockUserPayload;
      next();
    });
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
    await app.init();
  });

  it('GET /social/instagram/auth-url -> Mengembalikan URL otorisasi Meta ber-signature (HTTP 200 OK)', async () => {
    const res = await request(app.getHttpServer())
      .get('/social/instagram/auth-url')
      .expect(HttpStatus.OK);

    expect(res.body.authorizationUrl).toContain('instagram.com/oauth/authorize');
    expect(res.body.state).toBeDefined();
    expect(mockInstagramService.getAuthorizationUrl).toHaveBeenCalledWith(mockUserPayload.tenantId);
  });

  it('GET /social/instagram/account -> Mengembalikan detail akun sosial terhubung milik tenant (HTTP 200 OK)', async () => {
    const res = await request(app.getHttpServer())
      .get('/social/instagram/account')
      .expect(HttpStatus.OK);

    expect(res.body.accountHandle).toBe('ahmadfauzi_dpr');
    expect(res.body.status).toBe('ACTIVE');
    expect(res.body.daysRemaining).toBe(45);
  });

  it('POST /social/instagram/publish -> Menerima permintaan publikasi dan mengembalikan status 202 ACCEPTED', async () => {
    const res = await request(app.getHttpServer())
      .post('/social/instagram/publish')
      .send({
        accountId: 'acc-uuid-1',
        publicationId: 'pub-uuid-1',
        caption: 'Kajian Kebijakan Pupuk Bersubsidi 2026',
        mediaUrl: 'https://assets.polaris.id/posters/test.webp',
      })
      .expect(HttpStatus.ACCEPTED);

    expect(res.body.success).toBe(true);
    expect(res.body.jobId).toBeDefined();
    expect(mockInstagramService.triggerPublishContent).toHaveBeenCalled();
  });
});
