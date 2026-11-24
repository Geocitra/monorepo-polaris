import { describe, it, expect, beforeAll, afterAll, vi } from 'vitest';
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe, HttpStatus } from '@nestjs/common';
import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { ConfigModule } from '@nestjs/config';
import { JwtModule, JwtService } from '@nestjs/jwt';
import request from 'supertest';
import crypto from 'node:crypto';
import {
  db,
  withSuperadminContext,
  organizations,
  systemAdmins,
  tenantMembers,
  datahubFiles,
  eq,
  inArray,
  sql,
} from '@polaris/database';
import {
  LegislativeLevel,
  OrganizationContractStatus,
  OrganizationStatus,
  OrganizationUnitType,
  OrganizationMemberRole,
  OrganizationUnitMemberRole,
  InstitutionalNoteVisibility,
  DatahubCategory,
} from '@polaris/shared-types';
import { DatahubEmbedderService, InstitutionalAiService } from '@polaris/ai-engine';
import { GlobalHttpExceptionFilter } from '../src/common/filters/http-exception.filter.js';
import { AuthGuard } from '../src/common/guards/auth.guard.js';
import { RlsContextInterceptor } from '../src/common/interceptors/rls-context.interceptor.js';
import { InstitutionalModule } from '../src/modules/institutional/institutional.module.js';
import { RedisModule } from '../src/modules/redis/redis.module.js';
import { RedisService } from '../src/modules/redis/redis.service.js';
import { TokenCircuitBreakerService } from '../src/modules/billing/token-circuit-breaker.service.js';

describe('Fase 1 Institutional, Bidang Isolation, RBAC, Storage Quota & Live HTTP E2E', () => {
  let app: INestApplication;
  let jwtService: JwtService;

  const runSuffix = crypto.randomUUID().slice(0, 8);
  const superadminId = crypto.randomUUID();
  const orgAdminTenantId = crypto.randomUUID();
  const memberAId = crypto.randomUUID();
  const memberBId = crypto.randomUUID();

  let superadminToken: string;
  let orgAdminToken: string;
  let memberAToken: string;
  let memberBToken: string;

  let createdOrgId: string;
  let fraksiId: string;
  let bidangA1Id: string;
  let bidangA2Id: string;
  let unitANoteId: string;
  const createdFileIds: string[] = [];

  beforeAll(async () => {
    vi.spyOn(DatahubEmbedderService, 'generateBatchEmbeddings').mockImplementation(
      async (texts: string[]) =>
        texts.map((_, i) => new Array(1536).fill(0).map((__, idx) => Math.sin(idx + i) * 0.05))
    );

    const moduleRef: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({ isGlobal: true, envFilePath: '../../.env' }),
        JwtModule.register({
          global: true,
          secret: process.env.JWT_SECRET || 'polaris-secret-super-secure-key-2026',
          signOptions: { expiresIn: '2h' },
        }),
        RedisModule,
        InstitutionalModule,
      ],
      providers: [
        { provide: APP_FILTER, useClass: GlobalHttpExceptionFilter },
        { provide: APP_GUARD, useClass: AuthGuard },
        { provide: APP_INTERCEPTOR, useClass: RlsContextInterceptor },
      ],
    })
      .overrideProvider(RedisService)
      .useValue({ get: async () => null, set: async () => 'OK', del: async () => 1 })
      .overrideProvider(TokenCircuitBreakerService)
      .useValue({ isCircuitOpen: async () => false })
      .compile();

    app = moduleRef.createNestApplication();
    app.setGlobalPrefix('api/v1');
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      })
    );
    await app.init();

    jwtService = moduleRef.get(JwtService);

    await db.execute(sql`
      INSERT INTO system_admins (id, email, password_hash, full_name, role)
      VALUES (${superadminId}::uuid, ${`e2e.superadmin.${runSuffix}@polaris.test`}, 'hash-e2e', 'E2E Superadmin', 'SUPERADMIN')
    `);

    await db.execute(sql`
      INSERT INTO tenant_members (id, email, password_hash, full_name, phone_number, party_affiliation, legislative_level)
      VALUES
        (${orgAdminTenantId}::uuid, ${`e2e.sekwan.${runSuffix}@dprd.test`}, 'hash-e2e', 'E2E Sekwan Admin', '0812000001', 'SEKRETARIAT', 'DPRD_KABUPATEN_KOTA'),
        (${memberAId}::uuid, ${`e2e.membera.${runSuffix}@dprd.test`}, 'hash-e2e', 'E2E Anggota Bidang A1', '0812000002', 'FRAKSI_A', 'DPRD_KABUPATEN_KOTA'),
        (${memberBId}::uuid, ${`e2e.memberb.${runSuffix}@dprd.test`}, 'hash-e2e', 'E2E Anggota Bidang A2', '0812000003', 'FRAKSI_A', 'DPRD_KABUPATEN_KOTA')
    `);

    superadminToken = await jwtService.signAsync({
      sub: superadminId,
      email: `e2e.superadmin.${runSuffix}@polaris.test`,
      role: 'SUPERADMIN',
      isSuperadmin: true,
    });

    orgAdminToken = await jwtService.signAsync({
      sub: orgAdminTenantId,
      email: `e2e.sekwan.${runSuffix}@dprd.test`,
      role: 'MEMBER',
    });

    memberAToken = await jwtService.signAsync({
      sub: memberAId,
      email: `e2e.membera.${runSuffix}@dprd.test`,
      role: 'MEMBER',
    });

    memberBToken = await jwtService.signAsync({
      sub: memberBId,
      email: `e2e.memberb.${runSuffix}@dprd.test`,
      role: 'MEMBER',
    });
  }, 30000);

  afterAll(async () => {
    vi.restoreAllMocks();
    await withSuperadminContext(superadminId, async (tx) => {
      if (createdOrgId) {
        await tx.delete(organizations).where(eq(organizations.id, createdOrgId));
      }
      if (createdFileIds.length > 0) {
        await tx.delete(datahubFiles).where(inArray(datahubFiles.id, createdFileIds));
      }
    });
    await db.execute(sql`
      DELETE FROM tenant_members
      WHERE id IN (${orgAdminTenantId}::uuid, ${memberAId}::uuid, ${memberBId}::uuid)
    `);
    await db.execute(sql`DELETE FROM system_admins WHERE id = ${superadminId}::uuid`);
    if (app) {
      await app.close();
    }
  });

  it('1. Rejects non-superadmin calling Superadmin Control Tower with 403 Forbidden', async () => {
    await request(app.getHttpServer())
      .post('/api/v1/superadmin/institutions')
      .set('Authorization', `Bearer ${memberAToken}`)
      .send({ code: 'HACK', name: 'Fake Org' })
      .expect(HttpStatus.FORBIDDEN);
  });

  it('2. Superadmin provisions Institution + B2G contract, updates profile, updates contract & assigns ORG_ADMIN', async () => {
    const createRes = await request(app.getHttpServer())
      .post('/api/v1/superadmin/institutions')
      .set('Authorization', `Bearer ${superadminToken}`)
      .send({
        code: `E2E-DPRD-${runSuffix.toUpperCase()}`,
        name: `DPRD Uji Coba ${runSuffix}`,
        legislativeLevel: LegislativeLevel.DPRD_KABUPATEN_KOTA,
        regionName: 'Kabupaten Uji',
        provinceName: 'Jawa Barat',
        contractNumber: `SPK-E2E-${runSuffix}`,
        fiscalYear: 2026,
        startDate: '2026-01-01T00:00:00.000Z',
        endDate: '2027-12-31T23:59:59.000Z',
        maxSeats: 30,
        maxStorageBytes: 1000000, // 1 MB tight quota to verify enforcement
        annualTokenPoolLimit: 5000000,
        contractValueIdr: 150000000,
      })
      .expect(HttpStatus.CREATED);

    createdOrgId = createRes.body.organization.id;
    expect(createdOrgId).toBeDefined();
    expect(createRes.body.activeContract.maxStorageBytes).toBe(1000000);

    // PATCH institution profile (verify previously unwired route!)
    const patchRes = await request(app.getHttpServer())
      .patch(`/api/v1/superadmin/institutions/${createdOrgId}`)
      .set('Authorization', `Bearer ${superadminToken}`)
      .send({
        name: `DPRD Uji Coba ${runSuffix} Updated`,
        status: OrganizationStatus.ACTIVE,
      })
      .expect(HttpStatus.OK);
    expect(patchRes.body.name).toContain('Updated');

    // POST upsert contract (verify previously unwired route!)
    const contractRes = await request(app.getHttpServer())
      .post(`/api/v1/superadmin/institutions/${createdOrgId}/contracts`)
      .set('Authorization', `Bearer ${superadminToken}`)
      .send({
        contractNumber: `SPK-E2E-${runSuffix}`,
        fiscalYear: 2026,
        status: OrganizationContractStatus.ACTIVE,
        startDate: '2026-01-01T00:00:00.000Z',
        endDate: '2027-12-31T23:59:59.000Z',
        maxSeats: 40,
        maxStorageBytes: 1000000,
        annualTokenPoolLimit: 8000000,
      })
      .expect(HttpStatus.OK);
    expect(contractRes.body.maxSeats).toBe(40);

    // Assign ORG_ADMIN
    const adminRes = await request(app.getHttpServer())
      .post(`/api/v1/superadmin/institutions/${createdOrgId}/admins`)
      .set('Authorization', `Bearer ${superadminToken}`)
      .send({
        email: `e2e.sekwan.${runSuffix}@dprd.test`,
        orgRole: OrganizationMemberRole.ORG_ADMIN,
        titleOrPosition: 'Sekretaris DPRD',
      })
      .expect(HttpStatus.OK);
    expect(adminRes.body.orgRole).toBe(OrganizationMemberRole.ORG_ADMIN);
  });

  it('3. ORG_ADMIN creates Fraksi/Bidang hierarchy, registers & assigns members, uploads ORG_SHARED doc & lists it', async () => {
    const fraksiRes = await request(app.getHttpServer())
      .post(`/api/v1/institutions/${createdOrgId}/admin/units`)
      .set('Authorization', `Bearer ${orgAdminToken}`)
      .send({
        unitType: OrganizationUnitType.FRAKSI,
        code: `FR-A-${runSuffix}`,
        name: 'Fraksi A Uji',
      })
      .expect(HttpStatus.CREATED);
    fraksiId = fraksiRes.body.id;

    const b1Res = await request(app.getHttpServer())
      .post(`/api/v1/institutions/${createdOrgId}/admin/units`)
      .set('Authorization', `Bearer ${orgAdminToken}`)
      .send({
        parentUnitId: fraksiId,
        unitType: OrganizationUnitType.BIDANG,
        code: `BID-A1-${runSuffix}`,
        name: 'Bidang Infrastruktur',
      })
      .expect(HttpStatus.CREATED);
    bidangA1Id = b1Res.body.id;

    const b2Res = await request(app.getHttpServer())
      .post(`/api/v1/institutions/${createdOrgId}/admin/units`)
      .set('Authorization', `Bearer ${orgAdminToken}`)
      .send({
        parentUnitId: fraksiId,
        unitType: OrganizationUnitType.BIDANG,
        code: `BID-A2-${runSuffix}`,
        name: 'Bidang Kesehatan',
      })
      .expect(HttpStatus.CREATED);
    bidangA2Id = b2Res.body.id;

    // Register Member A & Member B to org
    await request(app.getHttpServer())
      .post(`/api/v1/institutions/${createdOrgId}/admin/members`)
      .set('Authorization', `Bearer ${orgAdminToken}`)
      .send({
        tenantId: memberAId,
        orgRole: OrganizationMemberRole.MEMBER,
        titleOrPosition: 'Anggota Komisi III',
      })
      .expect(HttpStatus.OK);

    await request(app.getHttpServer())
      .post(`/api/v1/institutions/${createdOrgId}/admin/members`)
      .set('Authorization', `Bearer ${orgAdminToken}`)
      .send({
        tenantId: memberBId,
        orgRole: OrganizationMemberRole.MEMBER,
        titleOrPosition: 'Anggota Komisi IV',
      })
      .expect(HttpStatus.OK);

    // Assign Member A -> Bidang A1 ONLY, Member B -> Bidang A2 ONLY
    await request(app.getHttpServer())
      .post(`/api/v1/institutions/${createdOrgId}/admin/units/${bidangA1Id}/members`)
      .set('Authorization', `Bearer ${orgAdminToken}`)
      .send({
        tenantId: memberAId,
        unitRole: OrganizationUnitMemberRole.MEMBER,
      })
      .expect(HttpStatus.OK);

    await request(app.getHttpServer())
      .post(`/api/v1/institutions/${createdOrgId}/admin/units/${bidangA2Id}/members`)
      .set('Authorization', `Bearer ${orgAdminToken}`)
      .send({
        tenantId: memberBId,
        unitRole: OrganizationUnitMemberRole.UNIT_LEAD,
      })
      .expect(HttpStatus.OK);

    // Upload ORG_SHARED official document
    const uploadOrgDocRes = await request(app.getHttpServer())
      .post(`/api/v1/institutions/${createdOrgId}/admin/documents`)
      .set('Authorization', `Bearer ${orgAdminToken}`)
      .field('customTitle', `RPJMD Resmi ${runSuffix}`)
      .field('categoryTag', DatahubCategory.REGULASI_DAERAH)
      .attach('file', Buffer.from(`Dokumen RPJMD Daerah Uji E2E ${runSuffix}\nPasal 1 Visi Misi Pembangunan Jalan dan Air Minum.` ), 'rpjmd.txt')
      .expect(HttpStatus.OK);

    if (uploadOrgDocRes.body.fileId) createdFileIds.push(uploadOrgDocRes.body.fileId);
    expect(uploadOrgDocRes.body.privacyScope).toBe('ORG_SHARED');

    // Verify new GET /institutions/:orgId/admin/documents endpoint
    const orgDocsRes = await request(app.getHttpServer())
      .get(`/api/v1/institutions/${createdOrgId}/admin/documents`)
      .set('Authorization', `Bearer ${orgAdminToken}`)
      .expect(HttpStatus.OK);
    expect(orgDocsRes.body.length).toBeGreaterThanOrEqual(1);
    expect(orgDocsRes.body[0].title).toContain(`RPJMD Resmi ${runSuffix}`);

    // Verify PATCH /institutions/:orgId/admin/units/:unitId archive & restore
    const archRes = await request(app.getHttpServer())
      .patch(`/api/v1/institutions/${createdOrgId}/admin/units/${bidangA2Id}`)
      .set('Authorization', `Bearer ${orgAdminToken}`)
      .send({ isActive: false })
      .expect(HttpStatus.OK);
    expect(archRes.body.isActive).toBe(false);

    // Archived unit blocks Member B from accessing it via InstitutionalWorkspaceGuard
    await request(app.getHttpServer())
      .get(`/api/v1/institutional/orgs/${createdOrgId}/units/${bidangA2Id}/overview`)
      .set('Authorization', `Bearer ${memberBToken}`)
      .expect(HttpStatus.FORBIDDEN);

    // Restore unit
    await request(app.getHttpServer())
      .patch(`/api/v1/institutions/${createdOrgId}/admin/units/${bidangA2Id}`)
      .set('Authorization', `Bearer ${orgAdminToken}`)
      .send({ isActive: true })
      .expect(HttpStatus.OK);
  });

  it('4. Strict Cross-Bidang Isolation & Governance Enforcement via HTTP Guards + PostgreSQL RLS', async () => {
    // Member A CAN access Bidang A1 overview & sees both UNIT_BIDANG (0) and ORG_SHARED (1)
    const ovRes = await request(app.getHttpServer())
      .get(`/api/v1/institutional/orgs/${createdOrgId}/units/${bidangA1Id}/overview`)
      .set('Authorization', `Bearer ${memberAToken}`)
      .expect(HttpStatus.OK);
    expect(ovRes.body.knowledgeStats.orgSharedDocumentsCount).toBe(1);

    // CRITICAL ISOLATION: Member A CANNOT access Bidang A2 -> 403 Forbidden
    await request(app.getHttpServer())
      .get(`/api/v1/institutional/orgs/${createdOrgId}/units/${bidangA2Id}/overview`)
      .set('Authorization', `Bearer ${memberAToken}`)
      .expect(HttpStatus.FORBIDDEN);

    await request(app.getHttpServer())
      .get(`/api/v1/institutional/orgs/${createdOrgId}/units/${bidangA2Id}/notes`)
      .set('Authorization', `Bearer ${memberAToken}`)
      .expect(HttpStatus.FORBIDDEN);

    // Member A creates a note in Bidang A1
    await request(app.getHttpServer())
      .post(`/api/v1/institutional/orgs/${createdOrgId}/units/${bidangA1Id}/notes`)
      .set('Authorization', `Bearer ${memberAToken}`)
      .send({
        title: 'Temuan Jalan Rusak E2E',
        contentMarkdown: 'Panjang jalan mantap hanya 68% dari target RPJMD 85%.',
        visibility: InstitutionalNoteVisibility.ORG_SHARED, // MUST FAIL: direct ORG_SHARED creation forbidden
      })
      .expect(HttpStatus.BAD_REQUEST);

    const noteRes = await request(app.getHttpServer())
      .post(`/api/v1/institutional/orgs/${createdOrgId}/units/${bidangA1Id}/notes`)
      .set('Authorization', `Bearer ${memberAToken}`)
      .send({
        title: 'Temuan Jalan Rusak E2E',
        contentMarkdown: 'Panjang jalan mantap hanya 68% dari target RPJMD 85%.',
        visibility: InstitutionalNoteVisibility.UNIT_SHARED,
      })
      .expect(HttpStatus.CREATED);
    unitANoteId = noteRes.body.id;

    // Regular MEMBER CANNOT endorse note to PARENT_UNIT_ENDORSED -> 403 Forbidden
    await request(app.getHttpServer())
      .patch(
        `/api/v1/institutional/orgs/${createdOrgId}/units/${bidangA1Id}/notes/${unitANoteId}/visibility`
      )
      .set('Authorization', `Bearer ${memberAToken}`)
      .send({ targetVisibility: InstitutionalNoteVisibility.PARENT_UNIT_ENDORSED })
      .expect(HttpStatus.FORBIDDEN);
  });

  it('5. Enforces maxStorageBytes contract quota on unit/org uploads with 403 Forbidden when exceeded', async () => {
    // Contract maxStorageBytes is 1,000,000 bytes (~1 MB). Uploading a 1.1 MB payload MUST fail cleanly with 403!
    const oversizedBuffer = Buffer.alloc(1100000, 'A');
    await request(app.getHttpServer())
      .post(`/api/v1/institutional/orgs/${createdOrgId}/units/${bidangA1Id}/documents`)
      .set('Authorization', `Bearer ${memberAToken}`)
      .field('customTitle', 'Dokumen Terlalu Besar')
      .attach('file', oversizedBuffer, 'oversized.txt')
      .expect(HttpStatus.FORBIDDEN);
  });

  it('6. Routes scoped AI assist inside Bidang A1 with InstitutionalAiService', async () => {
    const aiSpy = vi
      .spyOn(InstitutionalAiService, 'executeScopedBidangAssist')
      .mockResolvedValue({
        answerMarkdown: 'Ringkasan terverifikasi dari dokumen RPJMD & catatan Bidang A1.',
        unitChunks: [],
        orgSharedChunks: [],
        regulationChunks: [],
        telemetry: {
          traceId: 'trace-e2e-1',
          modelUsed: 'gpt-4o-mini',
          totalTokens: 150,
          estimatedCostIdr: 50,
        },
      });

    const aiRes = await request(app.getHttpServer())
      .post(`/api/v1/institutional/orgs/${createdOrgId}/units/${bidangA1Id}/ai-assist`)
      .set('Authorization', `Bearer ${memberAToken}`)
      .send({
        prompt: 'Bagaimana kesenjangan target infrastruktur jalan pada LKPJ tahun ini?',
        includeOrgSharedDocuments: true,
        includeNationalAndRegionalRegulations: true,
      })
      .expect(HttpStatus.OK);

    expect(aiRes.body.answerMarkdown).toContain('Ringkasan terverifikasi');
    expect(aiRes.body.scopeIsolationSummary.activeUnitId).toBe(bidangA1Id);
    expect(aiRes.body.scopeIsolationSummary.unitNotesRetrieved).toBe(1);
    expect(aiSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        organizationId: createdOrgId,
        activeUnitId: bidangA1Id,
      })
    );
  });
});
