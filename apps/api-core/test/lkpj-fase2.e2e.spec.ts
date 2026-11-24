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
  datahubFiles,
  eq,
  sql,
} from '@polaris/database';
import {
  LegislativeLevel,
  OrganizationUnitType,
  OrganizationMemberRole,
  OrganizationUnitMemberRole,
  LkpjWorkspaceStatus,
  LkpjMaterialCategory,
  LkpjExtractionVerificationStatus,
  LkpjFindingReviewStatus,
  LkpjFollowupStatus,
  LkpjMeetingPackageType,
} from '@polaris/shared-types';
import { DatahubEmbedderService } from '@polaris/ai-engine';
import { GlobalHttpExceptionFilter } from '../src/common/filters/http-exception.filter.js';
import { AuthGuard } from '../src/common/guards/auth.guard.js';
import { RlsContextInterceptor } from '../src/common/interceptors/rls-context.interceptor.js';
import { InstitutionalModule } from '../src/modules/institutional/institutional.module.js';
import { RedisModule } from '../src/modules/redis/redis.module.js';
import { RedisService } from '../src/modules/redis/redis.service.js';
import { TokenCircuitBreakerService } from '../src/modules/billing/token-circuit-breaker.service.js';

describe('Fase 2 LKPJ RBAC, Unit Spoofing Defense, State Machine, Auto-Ingest CSV & HTTP E2E', () => {
  let app: INestApplication;
  let jwtService: JwtService;

  const runSuffix = crypto.randomUUID().slice(0, 8);
  const superadminId = crypto.randomUUID();
  const orgAdminTenantId = crypto.randomUUID();
  const memberAId = crypto.randomUUID();
  const unitLeadBId = crypto.randomUUID();

  let superadminToken: string;
  let orgAdminToken: string;
  let memberAToken: string;
  let unitLeadBToken: string;

  let orgId: string;
  let bidangA1Id: string;
  let bidangA2Id: string;
  let workspaceId: string;
  let doubtfulMaterialId: string;
  let extractedFindingId: string;
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
      VALUES (${superadminId}::uuid, ${`e2e.lkpj.admin.${runSuffix}@polaris.test`}, 'hash', 'LKPJ E2E Admin', 'SUPERADMIN')
    `);

    await db.execute(sql`
      INSERT INTO tenant_members (id, email, password_hash, full_name, phone_number, party_affiliation, legislative_level)
      VALUES
        (${orgAdminTenantId}::uuid, ${`e2e.lkpj.sekwan.${runSuffix}@dprd.test`}, 'hash', 'Sekwan LKPJ', '0813000001', 'SEKRETARIAT', 'DPRD_KABUPATEN_KOTA'),
        (${memberAId}::uuid, ${`e2e.lkpj.membera.${runSuffix}@dprd.test`}, 'hash', 'Anggota A1 LKPJ', '0813000002', 'FRAKSI_A', 'DPRD_KABUPATEN_KOTA'),
        (${unitLeadBId}::uuid, ${`e2e.lkpj.leadb.${runSuffix}@dprd.test`}, 'hash', 'Ketua Bidang A2 LKPJ', '0813000003', 'FRAKSI_A', 'DPRD_KABUPATEN_KOTA')
    `);

    superadminToken = await jwtService.signAsync({
      sub: superadminId,
      email: `e2e.lkpj.admin.${runSuffix}@polaris.test`,
      role: 'SUPERADMIN',
      isSuperadmin: true,
    });
    orgAdminToken = await jwtService.signAsync({
      sub: orgAdminTenantId,
      email: `e2e.lkpj.sekwan.${runSuffix}@dprd.test`,
      role: 'MEMBER',
    });
    memberAToken = await jwtService.signAsync({
      sub: memberAId,
      email: `e2e.lkpj.membera.${runSuffix}@dprd.test`,
      role: 'MEMBER',
    });
    unitLeadBToken = await jwtService.signAsync({
      sub: unitLeadBId,
      email: `e2e.lkpj.leadb.${runSuffix}@dprd.test`,
      role: 'MEMBER',
    });

    // Provision Org, Units & Members via Fase 1 endpoints
    const orgRes = await request(app.getHttpServer())
      .post('/api/v1/superadmin/institutions')
      .set('Authorization', `Bearer ${superadminToken}`)
      .send({
        code: `E2E-LKPJ-${runSuffix.toUpperCase()}`,
        name: `DPRD Uji LKPJ ${runSuffix}`,
        legislativeLevel: LegislativeLevel.DPRD_KABUPATEN_KOTA,
        regionName: 'Kabupaten Uji LKPJ',
        provinceName: 'Jawa Barat',
        contractNumber: `SPK-LKPJ-${runSuffix}`,
        fiscalYear: 2026,
        startDate: '2026-01-01T00:00:00.000Z',
        endDate: '2027-12-31T23:59:59.000Z',
        maxSeats: 30,
        maxStorageBytes: 50000000,
        annualTokenPoolLimit: 5000000,
      })
      .expect(HttpStatus.CREATED);
    orgId = orgRes.body.organization.id;

    await request(app.getHttpServer())
      .post(`/api/v1/superadmin/institutions/${orgId}/admins`)
      .set('Authorization', `Bearer ${superadminToken}`)
      .send({
        tenantId: orgAdminTenantId,
        orgRole: OrganizationMemberRole.ORG_ADMIN,
      })
      .expect(HttpStatus.OK);

    const b1 = await request(app.getHttpServer())
      .post(`/api/v1/institutions/${orgId}/admin/units`)
      .set('Authorization', `Bearer ${orgAdminToken}`)
      .send({
        unitType: OrganizationUnitType.BIDANG,
        code: `LKPJ-B1-${runSuffix}`,
        name: 'Bidang A1 Infrastruktur',
      })
      .expect(HttpStatus.CREATED);
    bidangA1Id = b1.body.id;

    const b2 = await request(app.getHttpServer())
      .post(`/api/v1/institutions/${orgId}/admin/units`)
      .set('Authorization', `Bearer ${orgAdminToken}`)
      .send({
        unitType: OrganizationUnitType.BIDANG,
        code: `LKPJ-B2-${runSuffix}`,
        name: 'Bidang A2 Kesehatan',
      })
      .expect(HttpStatus.CREATED);
    bidangA2Id = b2.body.id;

    for (const tid of [memberAId, unitLeadBId]) {
      await request(app.getHttpServer())
        .post(`/api/v1/institutions/${orgId}/admin/members`)
        .set('Authorization', `Bearer ${orgAdminToken}`)
        .send({ tenantId: tid, orgRole: OrganizationMemberRole.MEMBER })
        .expect(HttpStatus.OK);
    }

    await request(app.getHttpServer())
      .post(`/api/v1/institutions/${orgId}/admin/units/${bidangA1Id}/members`)
      .set('Authorization', `Bearer ${orgAdminToken}`)
      .send({ tenantId: memberAId, unitRole: OrganizationUnitMemberRole.MEMBER })
      .expect(HttpStatus.OK);

    await request(app.getHttpServer())
      .post(`/api/v1/institutions/${orgId}/admin/units/${bidangA2Id}/members`)
      .set('Authorization', `Bearer ${orgAdminToken}`)
      .send({ tenantId: unitLeadBId, unitRole: OrganizationUnitMemberRole.UNIT_LEAD })
      .expect(HttpStatus.OK);
  }, 30000);

  afterAll(async () => {
    vi.restoreAllMocks();
    await withSuperadminContext(superadminId, async (tx) => {
      if (orgId) {
        await tx.delete(organizations).where(eq(organizations.id, orgId));
      }
      if (createdFileIds.length > 0) {
        for (const fId of createdFileIds) {
          await tx.delete(datahubFiles).where(eq(datahubFiles.id, fId));
        }
      }
    });
    await db.execute(sql`
      DELETE FROM tenant_members
      WHERE id IN (${orgAdminTenantId}::uuid, ${memberAId}::uuid, ${unitLeadBId}::uuid)
    `);
    await db.execute(sql`DELETE FROM system_admins WHERE id = ${superadminId}::uuid`);
    if (app) {
      await app.close();
    }
  });

  it('1. Enforces ORG_ADMIN/LEADERSHIP RBAC on workspace creation & validates originUnitId membership against spoofing', async () => {
    // MEMBER cannot open LKPJ workspace -> 403
    await request(app.getHttpServer())
      .post(`/api/v1/institutional/orgs/${orgId}/lkpj/workspaces`)
      .set('Authorization', `Bearer ${memberAToken}`)
      .send({ fiscalYear: 2025, lkpjSubmittedAt: '2026-03-25T00:00:00.000Z' })
      .expect(HttpStatus.FORBIDDEN);

    // ORG_ADMIN opens workspace -> 200
    const wsRes = await request(app.getHttpServer())
      .post(`/api/v1/institutional/orgs/${orgId}/lkpj/workspaces`)
      .set('Authorization', `Bearer ${orgAdminToken}`)
      .send({
        fiscalYear: 2025,
        title: `Evaluasi LKPJ TA 2025 (${runSuffix})`,
        lkpjSubmittedAt: '2026-03-25T00:00:00.000Z',
        assignedDiscussionUnitId: bidangA2Id,
      })
      .expect(HttpStatus.OK);
    workspaceId = wsRes.body.id;

    // Member A assigned ONLY to Bidang A1 CANNOT spoof originUnitId = Bidang A2 -> 403!
    await request(app.getHttpServer())
      .post(`/api/v1/institutional/orgs/${orgId}/lkpj/workspaces/${workspaceId}/materials`)
      .set('Authorization', `Bearer ${memberAToken}`)
      .send({
        materialCategory: LkpjMaterialCategory.KELUARAN_PANJA,
        title: 'Spoofed Material',
        sourceYear: 2025,
        originUnitId: bidangA2Id,
      })
      .expect(HttpStatus.FORBIDDEN);

    await request(app.getHttpServer())
      .post(`/api/v1/institutional/orgs/${orgId}/lkpj/workspaces/${workspaceId}/findings`)
      .set('Authorization', `Bearer ${memberAToken}`)
      .send({
        originUnitId: bidangA2Id,
        governmentAffair: 'Kesehatan',
        opdName: 'Dinas Kesehatan',
        indicatorOrIssue: 'Spoofed Finding',
        sourceEvidenceRef: 'Hal 1',
      })
      .expect(HttpStatus.FORBIDDEN);
  });

  it('2. Auto-Ingests CSV into LKPJ Material + deterministic Findings Matrix, and auto-queues short/doubtful docs', async () => {
    const csvContent = [
      'Urusan,OPD,Indikator,Satuan,Target,Realisasi,Pagu,Serapan',
      'Pekerjaan Umum,Dinas PUPR,Panjang Jalan Mantap,Km,100,75,50000000000,45000000000',
      'Air Minum,PDAM Tirta,Cakupan Sambungan Rumah,%,85,68,20000000000,19000000000',
    ].join('\n');

    const csvRes = await request(app.getHttpServer())
      .post(`/api/v1/institutional/orgs/${orgId}/lkpj/workspaces/${workspaceId}/materials/upload`)
      .set('Authorization', `Bearer ${memberAToken}`)
      .field('materialCategory', LkpjMaterialCategory.LKPJ_PEMDA)
      .field('title', 'Tabel Capaian LKPJ PU CSV')
      .field('originUnitId', bidangA1Id)
      .field('autoExtractFindings', 'true')
      .attach('file', Buffer.from(csvContent, 'utf-8'), 'lkpj_pu.csv')
      .expect(HttpStatus.CREATED);

    if (csvRes.body.datahubFileId) createdFileIds.push(csvRes.body.datahubFileId);
    expect(csvRes.body.extractedFindingsCount).toBe(2);

    // Upload very short text (< 80 chars) -> auto-queued as FLAGGED_DOUBTFUL!
    const shortRes = await request(app.getHttpServer())
      .post(`/api/v1/institutional/orgs/${orgId}/lkpj/workspaces/${workspaceId}/materials/upload`)
      .set('Authorization', `Bearer ${memberAToken}`)
      .field('materialCategory', LkpjMaterialCategory.LAPORAN_PENDUKUNG)
      .field('title', 'Lampiran Scan Pendek')
      .field('originUnitId', bidangA1Id)
      .attach('file', Buffer.from('Lampiran pendek', 'utf-8'), 'scan_pendek.txt')
      .expect(HttpStatus.CREATED);

    if (shortRes.body.datahubFileId) createdFileIds.push(shortRes.body.datahubFileId);
    doubtfulMaterialId = shortRes.body.material.id;
    expect(shortRes.body.queuedForVerification).toBe(true);
    expect(shortRes.body.material.verificationStatus).toBe(
      LkpjExtractionVerificationStatus.FLAGGED_DOUBTFUL
    );

    const dashRes = await request(app.getHttpServer())
      .get(`/api/v1/institutional/orgs/${orgId}/lkpj/workspaces/${workspaceId}/dashboard`)
      .set('Authorization', `Bearer ${orgAdminToken}`)
      .expect(HttpStatus.OK);

    expect(dashRes.body.findings.length).toBe(2);
    extractedFindingId = dashRes.body.findings[0].id;
    // Verify deterministic math persisted (-25 gap or -17 gap)
    expect(dashRes.body.findings[0].achievementGap).not.toBeNull();
  });

  it('3. Enforces Reviewer RBAC & Finding/Workspace State Machines before Plenary Adoption & Post-Plenary Followup', async () => {
    // Regular MEMBER CANNOT verify doubtful material queue -> 403
    await request(app.getHttpServer())
      .patch(
        `/api/v1/institutional/orgs/${orgId}/lkpj/workspaces/${workspaceId}/materials/${doubtfulMaterialId}/verify`
      )
      .set('Authorization', `Bearer ${memberAToken}`)
      .send({ verificationStatus: LkpjExtractionVerificationStatus.VERIFIED })
      .expect(HttpStatus.FORBIDDEN);

    // ORG_ADMIN CAN verify doubtful material queue -> 200
    await request(app.getHttpServer())
      .patch(
        `/api/v1/institutional/orgs/${orgId}/lkpj/workspaces/${workspaceId}/materials/${doubtfulMaterialId}/verify`
      )
      .set('Authorization', `Bearer ${orgAdminToken}`)
      .send({ verificationStatus: LkpjExtractionVerificationStatus.VERIFIED })
      .expect(HttpStatus.OK);

    // Regular MEMBER CANNOT approve finding -> 403
    await request(app.getHttpServer())
      .patch(
        `/api/v1/institutional/orgs/${orgId}/lkpj/workspaces/${workspaceId}/findings/${extractedFindingId}/review`
      )
      .set('Authorization', `Bearer ${memberAToken}`)
      .send({
        reviewStatus: LkpjFindingReviewStatus.APPROVED_FOR_DISCUSSION,
        proposedRecommendation: 'Dinas PUPR wajib melakukan percepatan peningkatan jalan.',
      })
      .expect(HttpStatus.FORBIDDEN);

    // State Machine Check: Cannot jump straight DRAFT -> OFFICIAL_RECOMMENDATION -> 400 Bad Request
    await request(app.getHttpServer())
      .patch(
        `/api/v1/institutional/orgs/${orgId}/lkpj/workspaces/${workspaceId}/findings/${extractedFindingId}/review`
      )
      .set('Authorization', `Bearer ${orgAdminToken}`)
      .send({
        reviewStatus: LkpjFindingReviewStatus.OFFICIAL_RECOMMENDATION,
        proposedRecommendation: 'Dinas PUPR wajib melakukan percepatan peningkatan jalan.',
      })
      .expect(HttpStatus.BAD_REQUEST);

    // UNIT_LEAD CAN approve DRAFT -> APPROVED_FOR_DISCUSSION, but CANNOT adopt OFFICIAL_RECOMMENDATION -> 403
    await request(app.getHttpServer())
      .patch(
        `/api/v1/institutional/orgs/${orgId}/lkpj/workspaces/${workspaceId}/findings/${extractedFindingId}/review`
      )
      .set('Authorization', `Bearer ${unitLeadBToken}`)
      .set('x-active-unit-id', bidangA2Id)
      .send({
        reviewStatus: LkpjFindingReviewStatus.APPROVED_FOR_DISCUSSION,
        proposedRecommendation: 'Dinas PUPR wajib melakukan percepatan peningkatan jalan desa.',
      })
      .expect(HttpStatus.OK);

    await request(app.getHttpServer())
      .patch(
        `/api/v1/institutional/orgs/${orgId}/lkpj/workspaces/${workspaceId}/findings/${extractedFindingId}/review`
      )
      .set('Authorization', `Bearer ${unitLeadBToken}`)
      .set('x-active-unit-id', bidangA2Id)
      .send({
        reviewStatus: LkpjFindingReviewStatus.OFFICIAL_RECOMMENDATION,
      })
      .expect(HttpStatus.FORBIDDEN);

    // ORG_ADMIN promotes APPROVED_FOR_DISCUSSION -> OFFICIAL_RECOMMENDATION -> 200
    await request(app.getHttpServer())
      .patch(
        `/api/v1/institutional/orgs/${orgId}/lkpj/workspaces/${workspaceId}/findings/${extractedFindingId}/review`
      )
      .set('Authorization', `Bearer ${orgAdminToken}`)
      .send({ reviewStatus: LkpjFindingReviewStatus.OFFICIAL_RECOMMENDATION })
      .expect(HttpStatus.OK);

    // Workspace State Machine Check: IN_DISCUSSION CANNOT skip straight to POST_PLENARY_MONITORING -> 400
    await request(app.getHttpServer())
      .patch(`/api/v1/institutional/orgs/${orgId}/lkpj/workspaces/${workspaceId}/status`)
      .set('Authorization', `Bearer ${orgAdminToken}`)
      .send({ status: LkpjWorkspaceStatus.POST_PLENARY_MONITORING })
      .expect(HttpStatus.BAD_REQUEST);

    // Valid transition IN_DISCUSSION -> PRE_PLENARY_CONSOLIDATION -> PLENARY_ADOPTED -> 200
    await request(app.getHttpServer())
      .patch(`/api/v1/institutional/orgs/${orgId}/lkpj/workspaces/${workspaceId}/status`)
      .set('Authorization', `Bearer ${orgAdminToken}`)
      .send({ status: LkpjWorkspaceStatus.PRE_PLENARY_CONSOLIDATION })
      .expect(HttpStatus.OK);

    // Post-Plenary Followup: Regular MEMBER -> 403; ORG_ADMIN without proof -> 400; with proof -> 200
    await request(app.getHttpServer())
      .patch(
        `/api/v1/institutional/orgs/${orgId}/lkpj/workspaces/${workspaceId}/findings/${extractedFindingId}/followup`
      )
      .set('Authorization', `Bearer ${memberAToken}`)
      .send({
        followupStatus: LkpjFollowupStatus.COMPLETED_VERIFIED,
        followupProofRef: 'BAST-001/2026',
      })
      .expect(HttpStatus.FORBIDDEN);

    await request(app.getHttpServer())
      .patch(
        `/api/v1/institutional/orgs/${orgId}/lkpj/workspaces/${workspaceId}/findings/${extractedFindingId}/followup`
      )
      .set('Authorization', `Bearer ${orgAdminToken}`)
      .send({ followupStatus: LkpjFollowupStatus.COMPLETED_VERIFIED })
      .expect(HttpStatus.BAD_REQUEST);

    await request(app.getHttpServer())
      .patch(
        `/api/v1/institutional/orgs/${orgId}/lkpj/workspaces/${workspaceId}/findings/${extractedFindingId}/followup`
      )
      .set('Authorization', `Bearer ${orgAdminToken}`)
      .send({
        followupStatus: LkpjFollowupStatus.COMPLETED_VERIFIED,
        followupResponsePemda: 'Pemda telah memperbaiki 25 Km ruas jalan.',
        followupProofRef: 'BAST-PUPR-001/2026',
      })
      .expect(HttpStatus.OK);

    // Meeting Package Export Check
    const pkgRes = await request(app.getHttpServer())
      .get(
        `/api/v1/institutional/orgs/${orgId}/lkpj/workspaces/${workspaceId}/meeting-packages?packageType=${LkpjMeetingPackageType.POST_PLENARY_REGISTER}`
      )
      .set('Authorization', `Bearer ${orgAdminToken}`)
      .expect(HttpStatus.OK);

    expect(pkgRes.body.officialRecommendationsRegister.length).toBeGreaterThanOrEqual(1);
    expect(pkgRes.body.officialRecommendationsRegister[0].followupProofRef).toBe(
      'BAST-PUPR-001/2026'
    );
  });
});
