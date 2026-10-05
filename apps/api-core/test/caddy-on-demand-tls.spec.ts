import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, HttpStatus, NotFoundException } from '@nestjs/common';
import request from 'supertest';
import { CmsController } from '../src/modules/cms/cms.controller.js';
import { CmsService } from '../src/modules/cms/cms.service.js';

describe('Caddy On-Demand TLS & Custom Domain Validation (Sub-Fase E.2)', () => {
  let app: INestApplication;

  const mockCmsService = {
    checkCustomDomainAllowed: vi.fn(async (domain?: string) => {
      if (!domain) return false;
      const clean = domain.toLowerCase().trim();

      // Blacklist rejection
      if (['polaris.id', 'gov.id', 'dpr.go.id', 'localhost'].some((b) => clean === b || clean.endsWith(`.${b}`))) {
        return false;
      }

      // Verified active domains
      if (clean === 'achmadfauzi.id' || clean === 'dewan-bekasi.com') {
        return true;
      }

      // Unverified or unknown domains
      return false;
    }),
  };

  beforeEach(async () => {
    vi.clearAllMocks();

    const moduleRef: TestingModule = await Test.createTestingModule({
      controllers: [CmsController],
      providers: [
        {
          provide: CmsService,
          useValue: mockCmsService,
        },
      ],
    }).compile();

    app = moduleRef.createNestApplication();
    app.setGlobalPrefix('api/v1');
    await app.init();
  });

  it('Invarian 1: Menyetujui domain yang valid dan berstatus VERIFIED (HTTP 200 ALLOWED)', async () => {
    const res = await request(app.getHttpServer())
      .get('/api/v1/cms/domain/check?domain=achmadfauzi.id')
      .expect(HttpStatus.OK);

    expect(res.body).toEqual({
      status: 'ALLOWED',
      domain: 'achmadfauzi.id',
    });
    expect(mockCmsService.checkCustomDomainAllowed).toHaveBeenCalledWith('achmadfauzi.id');
  });

  it('Invarian 2: Menolak domain yang belum terverifikasi atau tidak terdaftar (HTTP 404 - Anti-DDoS SSL)', async () => {
    const res = await request(app.getHttpServer())
      .get('/api/v1/cms/domain/check?domain=malicious-attacker-domain.xyz')
      .expect(HttpStatus.NOT_FOUND);

    expect(res.body.message).toContain("Domain 'malicious-attacker-domain.xyz' tidak diizinkan");
  });

  it('Invarian 3: Menolak domain terlarang/internal blacklist secara mutlak (HTTP 404)', async () => {
    await request(app.getHttpServer())
      .get('/api/v1/cms/domain/check?domain=dpr.go.id')
      .expect(HttpStatus.NOT_FOUND);

    await request(app.getHttpServer())
      .get('/api/v1/cms/domain/check?domain=fake.polaris.id')
      .expect(HttpStatus.NOT_FOUND);
  });

  it('Invarian 4: Menolak permintaan tanpa query domain (HTTP 404)', async () => {
    await request(app.getHttpServer())
      .get('/api/v1/cms/domain/check')
      .expect(HttpStatus.NOT_FOUND);
  });
});
