import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe, HttpStatus } from '@nestjs/common';
import request from 'supertest';
import { PublicChatController } from '../src/modules/public-chat/public-chat.controller.js';
import { PublicChatService } from '../src/modules/public-chat/public-chat.service.js';
import { IpThrottleGuard } from '../src/modules/public-chat/guards/ip-throttle.guard.js';
import { TokenCircuitBreakerGuard } from '../src/common/guards/token-circuit-breaker.guard.js';
import { RedisService } from '../src/modules/redis/redis.service.js';

describe('PublicChat Ingress & Rate Limiting Integration', () => {
  let app: INestApplication;
  let mockRedisCounts: Record<string, number> = {};

  const mockRedisService = {
    incrementRateLimit: vi.fn(async (key: string) => {
      mockRedisCounts[key] = (mockRedisCounts[key] || 0) + 1;
      return mockRedisCounts[key];
    }),
  };

  const mockPublicChatService = {
    processVisitorMessage: vi.fn(async (dto: any) => ({
      reply: `Jawaban untuk: ${dto.message}`,
      suggestedAction: 'VIEW_PRICING',
      isSafeRefusal: false,
      tokensUsed: 42,
    })),
  };

  beforeEach(async () => {
    mockRedisCounts = {};
    vi.clearAllMocks();

    const moduleRef: TestingModule = await Test.createTestingModule({
      controllers: [PublicChatController],
      providers: [
        { provide: PublicChatService, useValue: mockPublicChatService },
        { provide: RedisService, useValue: mockRedisService },
        IpThrottleGuard,
        TokenCircuitBreakerGuard,
      ],
    }).compile();

    app = moduleRef.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      })
    );
    await app.init();
  });

  it('harus mengizinkan hingga 5 request berturut-turut dari IP yang sama (HTTP 200 OK)', async () => {
    for (let i = 1; i <= 5; i++) {
      const res = await request(app.getHttpServer())
        .post('/public/chat')
        .set('x-forwarded-for', '180.252.10.1')
        .send({ message: `Pertanyaan ke-${i}` });

      expect(res.status).toBe(HttpStatus.OK);
      expect(res.body.reply).toBeDefined();
    }
  });

  it('harus memblokir request ke-6 dari IP yang sama dengan status HTTP 429 Too Many Requests', async () => {
    // 5 request pertama lolos
    for (let i = 1; i <= 5; i++) {
      await request(app.getHttpServer())
        .post('/public/chat')
        .set('x-forwarded-for', '180.252.10.2')
        .send({ message: `Pertanyaan ${i}` });
    }

    // Request ke-6 ditolak
    const blockedRes = await request(app.getHttpServer())
      .post('/public/chat')
      .set('x-forwarded-for', '180.252.10.2')
      .send({ message: 'Pertanyaan ke-6 yang melewati batas' });

    expect(blockedRes.status).toBe(HttpStatus.TOO_MANY_REQUESTS);
    expect(blockedRes.body.message).toContain('mencapai batas frekuensi');
  });

  it('harus menolak input yang melebihi batas 250 karakter dengan status HTTP 400 Bad Request', async () => {
    const longMessage = 'A'.repeat(251);

    const res = await request(app.getHttpServer())
      .post('/public/chat')
      .set('x-forwarded-for', '180.252.10.3')
      .send({ message: longMessage });

    expect(res.status).toBe(HttpStatus.BAD_REQUEST);
    expect(res.body.message).toEqual(
      expect.arrayContaining([expect.stringContaining('Pertanyaan maksimal 250 karakter')])
    );
  });
});
