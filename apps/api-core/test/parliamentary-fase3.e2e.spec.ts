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
  withTenantContext,
  organizations,
  contentPublications,
  socialSyndicationPacks,
  eq,
  sql,
} from '@polaris/database';
import {
  LegislativeLevel,
  OrganizationContractStatus,
  OrganizationUnitType,
  OrganizationMemberRole,
  OrganizationUnitMemberRole,
  InstitutionalNoteVisibility,
  ParliamentaryDocumentCategory,
  LegislationStage,
  LegalRuleVerificationStatus,
  DimEntryStatus,
  PerformanceAchievementLevel,
  PerformanceContributionScope,
} from '@polaris/shared-types';
import { ParliamentarySpecialistAiService } from '@polaris/ai-engine';
import { GlobalHttpExceptionFilter } from '../src/common/filters/http-exception.filter.js';
import { AuthGuard } from '../src/common/guards/auth.guard.js';
import { RlsContextInterceptor } from '../src/common/interceptors/rls-context.interceptor.js';
import { InstitutionalModule } from '../src/modules/institutional/institutional.module.js';
import { RedisModule } from '../src/modules/redis/redis.module.js';
import { RedisService } from '../src/modules/redis/redis.service.js';
import { TokenCircuitBreakerService } from '../src/modules/billing/token-circuit-breaker.service.js';

describe('Fase 3 Parliamentary Legislation, DIM, Briefing RLS & Performance Claim Guardrail HTTP E2E', () => {
  let app: INestApplication;
  let jwtService: JwtService;

  const runSuffix = crypto.randomUUID().slice(0, 8);
  const superadminId = crypto.randomUUID();
  const orgAdminTenantId = crypto.randomUUID();
  const memberAId = crypto.randomUUID();
  const leadA1Id = crypto.randomUUID();
  const memberBId = crypto.randomUUID();

  let superadminToken: string;
  let orgAdminToken: string;
  let memberAToken: string;
  let leadA1Token: string;
  let memberBToken: string;

  let createdOrgId: string;
  let fraksiId: string;
  let bidangA1Id: string;
  let bidangA2Id: string;
  let draftId: string;
  let dimId: string;
  let memberAEvidenceId: string;
  let leadA1SelfEvidenceId: string;
  let linkedPublicationId: string | null = null;

  beforeAll(async () => {
    vi.spyOn(
      ParliamentarySpecialistAiService,
      'generateDailyMemberBriefing'
    ).mockImplementation(async (params) => ({
      generatedForDate: new Date().toISOString().slice(0, 10),
      organizationName: params.organizationName,
      unitName: params.unitName,
      agendaAndRequiredDecisions: [`Agenda: ${params.agendaTitle}`],
      keyIssuesAndLatestData: params.recentNotesSummary,
      verifiedLegalBases: params.legalRules.slice(0, 5).map((r) => ({
        ruleCode: r.ruleCode,
        title: r.title,
        verificationStatus: r.verificationStatus,
        warningNote: null,
      })),
      stanceOptionsAndConsequences: ['Opsi 1 — Minta Data Tertulis'],
      keyQuestionsAndFollowups: ['Kapan pemenuhan data diserahkan?'],
      briefingMarkdown: `Briefing untuk ${params.unitName}\nCatatan:\n${params.recentNotesSummary.join('\n')}`,
      telemetry: {
        traceId: `mock-trace-${runSuffix}`,
        model: 'mock-gpt-4o-mini',
        totalTokens: 250,
      },
    }));

    vi.spyOn(
      ParliamentarySpecialistAiService,
      'draftVerifiedPerformancePublication'
    ).mockImplementation(async (params) => ({
      evidenceId: params.evidence.id,
      claimGuardrailPassed: params.evidence.isVerified,
      enforcedAchievementLevel: params.evidence.achievementLevel,
      enforcedContributionScope: params.evidence.contributionScope,
      pressReleaseMarkdown: `### Siaran Pers — ${params.evidence.title}\nRujukan: ${params.evidence.evidenceSourceRef}`,
      socialCaptionDraft: `[POLARIS] ${params.evidence.title} (${params.evidence.achievementLevel}) #Transparansi`,
      telemetry: {
        traceId: `mock-pub-trace-${runSuffix}`,
        model: 'mock-gpt-4o-mini',
        totalTokens: 180,
      },
    }));

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
      VALUES (${superadminId}::uuid, ${`e2e.f3.superadmin.${runSuffix}@polaris.test`}, 'hash-e2e', 'E2E F3 Superadmin', 'SUPERADMIN')
    `);

    await db.execute(sql`
      INSERT INTO tenant_members (id, email, password_hash, full_name, phone_number, party_affiliation, legislative_level)
      VALUES
        (${orgAdminTenantId}::uuid, ${`e2e.f3.sekwan.${runSuffix}@dprd.test`}, 'hash-e2e', 'E2E F3 Sekwan Admin', '0813000001', 'SEKRETARIAT', 'DPRD_KABUPATEN_KOTA'),
        (${memberAId}::uuid, ${`e2e.f3.membera.${runSuffix}@dprd.test`}, 'hash-e2e', 'E2E F3 Anggota A1', '0813000002', 'FRAKSI_A', 'DPRD_KABUPATEN_KOTA'),
        (${leadA1Id}::uuid, ${`e2e.f3.leada1.${runSuffix}@dprd.test`}, 'hash-e2e', 'E2E F3 Ketua Bidang A1', '0813000003', 'FRAKSI_A', 'DPRD_KABUPATEN_KOTA'),
        (${memberBId}::uuid, ${`e2e.f3.memberb.${runSuffix}@dprd.test`}, 'hash-e2e', 'E2E F3 Ketua Bidang A2', '0813000004', 'FRAKSI_A', 'DPRD_KABUPATEN_KOTA')
    `);

    superadminToken = await jwtService.signAsync({
      sub: superadminId,
      email: `e2e.f3.superadmin.${runSuffix}@polaris.test`,
      role: 'SUPERADMIN',
      isSuperadmin: true,
    });
    orgAdminToken = await jwtService.signAsync({
      sub: orgAdminTenantId,
      email: `e2e.f3.sekwan.${runSuffix}@dprd.test`,
      role: 'MEMBER',
    });
    memberAToken = await jwtService.signAsync({
      sub: memberAId,
      email: `e2e.f3.membera.${runSuffix}@dprd.test`,
      role: 'MEMBER',
    });
    leadA1Token = await jwtService.signAsync({
      sub: leadA1Id,
      email: `e2e.f3.leada1.${runSuffix}@dprd.test`,
      role: 'MEMBER',
    });
    memberBToken = await jwtService.signAsync({
      sub: memberBId,
      email: `e2e.f3.memberb.${runSuffix}@dprd.test`,
      role: 'MEMBER',
    });

    // Provision Org, Units, Memberships
    const orgRes = await request(app.getHttpServer())
      .post('/api/v1/superadmin/institutions')
      .set('Authorization', `Bearer ${superadminToken}`)
      .send({
        code: `E2E-F3-${runSuffix.toUpperCase()}`,
        name: `DPRD F3 Uji ${runSuffix}`,
        legislativeLevel: LegislativeLevel.DPRD_KABUPATEN_KOTA,
        regionName: 'Kabupaten Uji F3',
        provinceName: 'Jawa Barat',
        contractNumber: `SPK-E2E-F3-${runSuffix}`,
        fiscalYear: 2026,
        startDate: '2026-01-01T00:00:00.000Z',
        endDate: '2027-12-31T23:59:59.000Z',
        maxSeats: 30,
        maxStorageBytes: 5000000,
        annualTokenPoolLimit: 5000000,
        contractValueIdr: 150000000,
      })
      .expect(HttpStatus.CREATED);
    createdOrgId = orgRes.body.organization.id;

    await request(app.getHttpServer())
      .post(`/api/v1/superadmin/institutions/${createdOrgId}/admins`)
      .set('Authorization', `Bearer ${superadminToken}`)
      .send({
        email: `e2e.f3.sekwan.${runSuffix}@dprd.test`,
        orgRole: OrganizationMemberRole.ORG_ADMIN,
        titleOrPosition: 'Sekretaris DPRD',
      })
      .expect(HttpStatus.OK);

    const frRes = await request(app.getHttpServer())
      .post(`/api/v1/institutions/${createdOrgId}/admin/units`)
      .set('Authorization', `Bearer ${orgAdminToken}`)
      .send({ unitType: OrganizationUnitType.FRAKSI, code: `FR-F3-${runSuffix}`, name: 'Fraksi F3' })
      .expect(HttpStatus.CREATED);
    fraksiId = frRes.body.id;

    const a1Res = await request(app.getHttpServer())
      .post(`/api/v1/institutions/${createdOrgId}/admin/units`)
      .set('Authorization', `Bearer ${orgAdminToken}`)
      .send({
        parentUnitId: fraksiId,
        unitType: OrganizationUnitType.BIDANG,
        code: `BID-A1-${runSuffix}`,
        name: 'Bidang A1 Legislasi',
      })
      .expect(HttpStatus.CREATED);
    bidangA1Id = a1Res.body.id;

    const a2Res = await request(app.getHttpServer())
      .post(`/api/v1/institutions/${createdOrgId}/admin/units`)
      .set('Authorization', `Bearer ${orgAdminToken}`)
      .send({
        parentUnitId: fraksiId,
        unitType: OrganizationUnitType.BIDANG,
        code: `BID-A2-${runSuffix}`,
        name: 'Bidang A2 Anggaran',
      })
      .expect(HttpStatus.CREATED);
    bidangA2Id = a2Res.body.id;

    for (const tid of [memberAId, leadA1Id, memberBId]) {
      await request(app.getHttpServer())
        .post(`/api/v1/institutions/${createdOrgId}/admin/members`)
        .set('Authorization', `Bearer ${orgAdminToken}`)
        .send({ tenantId: tid, orgRole: OrganizationMemberRole.MEMBER })
        .expect(HttpStatus.OK);
    }

    await request(app.getHttpServer())
      .post(`/api/v1/institutions/${createdOrgId}/admin/units/${bidangA1Id}/members`)
      .set('Authorization', `Bearer ${orgAdminToken}`)
      .send({ tenantId: memberAId, unitRole: OrganizationUnitMemberRole.MEMBER })
      .expect(HttpStatus.OK);

    await request(app.getHttpServer())
      .post(`/api/v1/institutions/${createdOrgId}/admin/units/${bidangA1Id}/members`)
      .set('Authorization', `Bearer ${orgAdminToken}`)
      .send({ tenantId: leadA1Id, unitRole: OrganizationUnitMemberRole.UNIT_LEAD })
      .expect(HttpStatus.OK);

    await request(app.getHttpServer())
      .post(`/api/v1/institutions/${createdOrgId}/admin/units/${bidangA2Id}/members`)
      .set('Authorization', `Bearer ${orgAdminToken}`)
      .send({ tenantId: memberBId, unitRole: OrganizationUnitMemberRole.UNIT_LEAD })
      .expect(HttpStatus.OK);
  }, 45000);

  afterAll(async () => {
    vi.restoreAllMocks();
    if (linkedPublicationId) {
      await withTenantContext(memberAId, async (tx) => {
        await tx.delete(contentPublications).where(eq(contentPublications.id, linkedPublicationId!));
      });
    }
    await withSuperadminContext(superadminId, async (tx) => {
      if (createdOrgId) {
        await tx.delete(organizations).where(eq(organizations.id, createdOrgId));
      }
    });
    await db.execute(sql`
      DELETE FROM tenant_members
      WHERE id IN (${orgAdminTenantId}::uuid, ${memberAId}::uuid, ${leadA1Id}::uuid, ${memberBId}::uuid)
    `);
    await db.execute(sql`DELETE FROM system_admins WHERE id = ${superadminId}::uuid`);
    if (app) {
      await app.close();
    }
  });

  it('1. Enforces RBAC on Legal Knowledge registration (403 for MEMBER, success for ORG_ADMIN) and lists national + org rules', async () => {
    await request(app.getHttpServer())
      .post(`/api/v1/institutional/orgs/${createdOrgId}/parliamentary/legal-rules`)
      .set('Authorization', `Bearer ${memberAToken}`)
      .set('x-active-unit-id', bidangA1Id)
      .send({
        ruleCode: `PERDA-ILLEGAL-${runSuffix}`,
        title: 'Percobaan Member',
        hierarchyLayer: 'PERDA',
        jurisdictionRegion: 'Kabupaten Uji F3',
        effectiveDate: '2026-01-02',
        verificationStatus: LegalRuleVerificationStatus.VERIFIED_ACTIVE,
      })
      .expect(HttpStatus.FORBIDDEN);

    const createRuleRes = await request(app.getHttpServer())
      .post(`/api/v1/institutional/orgs/${createdOrgId}/parliamentary/legal-rules`)
      .set('Authorization', `Bearer ${orgAdminToken}`)
      .send({
        ruleCode: `PERDA-E2E-${runSuffix.toUpperCase()}`,
        title: `Perda Penyelenggaraan Air Minum ${runSuffix}`,
        hierarchyLayer: 'PERDA',
        jurisdictionRegion: 'Kabupaten Uji F3',
        effectiveDate: '2026-01-02',
        verificationStatus: LegalRuleVerificationStatus.VERIFIED_ACTIVE,
        amendmentSummary: 'Aturan daerah aktif 2026',
      });
    expect([HttpStatus.OK, HttpStatus.CREATED]).toContain(createRuleRes.status);
    expect(createRuleRes.body.ruleCode).toBe(`PERDA-E2E-${runSuffix.toUpperCase()}`);

    const rulesRes = await request(app.getHttpServer())
      .get(`/api/v1/institutional/orgs/${createdOrgId}/parliamentary/legal-rules`)
      .set('Authorization', `Bearer ${memberAToken}`)
      .set('x-active-unit-id', bidangA1Id)
      .expect(HttpStatus.OK);

    const codes = (rulesRes.body as Array<{ ruleCode: string }>).map((r) => r.ruleCode);
    expect(codes).toContain(`PERDA-E2E-${runSuffix.toUpperCase()}`);
  });

  it('2. Rejects cross-unit originUnitId/unitId spoofing across draft, daily briefing, and performance evidence (403)', async () => {
    await request(app.getHttpServer())
      .post(`/api/v1/institutional/orgs/${createdOrgId}/parliamentary/drafts`)
      .set('Authorization', `Bearer ${memberAToken}`)
      .set('x-active-unit-id', bidangA1Id)
      .send({
        originUnitId: bidangA2Id,
        title: 'Spoof Draft Bidang A2',
        documentCategory: ParliamentaryDocumentCategory.PRODUK_HUKUM,
      })
      .expect(HttpStatus.FORBIDDEN);

    await request(app.getHttpServer())
      .post(`/api/v1/institutional/orgs/${createdOrgId}/parliamentary/daily-briefing`)
      .set('Authorization', `Bearer ${memberAToken}`)
      .set('x-active-unit-id', bidangA1Id)
      .send({
        unitId: bidangA2Id,
        agendaTitle: 'Spoof Briefing Bidang A2',
      })
      .expect(HttpStatus.FORBIDDEN);

    await request(app.getHttpServer())
      .post(`/api/v1/institutional/orgs/${createdOrgId}/parliamentary/performance-evidences`)
      .set('Authorization', `Bearer ${memberAToken}`)
      .set('x-active-unit-id', bidangA1Id)
      .send({
        unitId: bidangA2Id,
        title: 'Spoof Bukti Bidang A2',
        achievementLevel: PerformanceAchievementLevel.DIUSULKAN,
        contributionScope: PerformanceContributionScope.KONTRIBUSI_INDIVIDU,
        evidenceSourceRef: 'Risalah 99',
        summaryText: 'Isi ringkasan uji',
      })
      .expect(HttpStatus.FORBIDDEN);
  });

  it('3. Daily Briefing queries institutional notes under live FORCE RLS: keeps A1 UNIT_SHARED, hides A2 & other PRIVATE_DRAFT', async () => {
    await request(app.getHttpServer())
      .post(`/api/v1/institutional/orgs/${createdOrgId}/units/${bidangA1Id}/notes`)
      .set('Authorization', `Bearer ${memberAToken}`)
      .set('x-active-unit-id', bidangA1Id)
      .send({
        title: `Catatan Publik A1 ${runSuffix}`,
        contentMarkdown: `FAKTA_BIDANG_A1_${runSuffix} layanan air minum desa`,
        visibility: InstitutionalNoteVisibility.UNIT_SHARED,
      })
      .expect(HttpStatus.CREATED);

    await request(app.getHttpServer())
      .post(`/api/v1/institutional/orgs/${createdOrgId}/units/${bidangA1Id}/notes`)
      .set('Authorization', `Bearer ${leadA1Token}`)
      .set('x-active-unit-id', bidangA1Id)
      .send({
        title: `Draft Pribadi Ketua A1 ${runSuffix}`,
        contentMarkdown: `RAHASIA_PRIBADI_LEAD_${runSuffix}`,
        visibility: InstitutionalNoteVisibility.PRIVATE_DRAFT,
      })
      .expect(HttpStatus.CREATED);

    await request(app.getHttpServer())
      .post(`/api/v1/institutional/orgs/${createdOrgId}/units/${bidangA2Id}/notes`)
      .set('Authorization', `Bearer ${memberBToken}`)
      .set('x-active-unit-id', bidangA2Id)
      .send({
        title: `Catatan Internal Bidang A2 ${runSuffix}`,
        contentMarkdown: `RAHASIA_BIDANG_A2_${runSuffix}`,
        visibility: InstitutionalNoteVisibility.UNIT_SHARED,
      })
      .expect(HttpStatus.CREATED);

    const briefingRes = await request(app.getHttpServer())
      .post(`/api/v1/institutional/orgs/${createdOrgId}/parliamentary/daily-briefing`)
      .set('Authorization', `Bearer ${memberAToken}`)
      .set('x-active-unit-id', bidangA1Id)
      .send({
        unitId: bidangA1Id,
        agendaTitle: `Rapat Kerja Infrastruktur ${runSuffix}`,
      });

    expect([HttpStatus.OK, HttpStatus.CREATED]).toContain(briefingRes.status);
    const bodyText = JSON.stringify(briefingRes.body);
    expect(bodyText).toContain(`Catatan Publik A1 ${runSuffix}`);
    expect(bodyText).not.toContain(`RAHASIA_PRIBADI_LEAD_${runSuffix}`);
    expect(bodyText).not.toContain(`RAHASIA_BIDANG_A2_${runSuffix}`);
  });

  it('4. Enforces 9-stage transition ordering (400 on skip, 403 for MEMBER) and persists DIM status/response (PATCH .../dim/:dimId)', async () => {
    const createDraftRes = await request(app.getHttpServer())
      .post(`/api/v1/institutional/orgs/${createdOrgId}/parliamentary/drafts`)
      .set('Authorization', `Bearer ${memberAToken}`)
      .set('x-active-unit-id', bidangA1Id)
      .send({
        originUnitId: bidangA1Id,
        title: `Raperda Air Minum Desa ${runSuffix}`,
        documentCategory: ParliamentaryDocumentCategory.PRODUK_HUKUM,
        problemStatement: 'Akses air bersih tertinggal di 14 desa.',
      });
    expect([HttpStatus.OK, HttpStatus.CREATED]).toContain(createDraftRes.status);
    draftId = createDraftRes.body.id;
    expect(createDraftRes.body.currentStage).toBe(LegislationStage.IDENTIFIKASI_MASALAH);

    // Skipping stage must fail with 400
    await request(app.getHttpServer())
      .patch(`/api/v1/institutional/orgs/${createdOrgId}/parliamentary/drafts/${draftId}/stage`)
      .set('Authorization', `Bearer ${leadA1Token}`)
      .set('x-active-unit-id', bidangA1Id)
      .send({ currentStage: LegislationStage.PERUMUSAN_RANCANGAN })
      .expect(HttpStatus.BAD_REQUEST);

    // Regular MEMBER can progress early drafting step sequentially
    const stage1Res = await request(app.getHttpServer())
      .patch(`/api/v1/institutional/orgs/${createdOrgId}/parliamentary/drafts/${draftId}/stage`)
      .set('Authorization', `Bearer ${memberAToken}`)
      .set('x-active-unit-id', bidangA1Id)
      .send({ currentStage: LegislationStage.PENENTUAN_INSTRUMEN })
      .expect(HttpStatus.OK);
    expect(stage1Res.body.currentStage).toBe(LegislationStage.PENENTUAN_INSTRUMEN);

    // Advance sequentially to PEMERIKSAAN_DAN_PEMBAHASAN
    for (const nextStage of [
      LegislationStage.PERENCANAAN,
      LegislationStage.KAJIAN_DAN_NASKAH_AKADEMIK,
      LegislationStage.PERUMUSAN_RANCANGAN,
      LegislationStage.PARTISIPASI_MASYARAKAT,
      LegislationStage.PEMERIKSAAN_DAN_PEMBAHASAN,
    ]) {
      await request(app.getHttpServer())
        .patch(`/api/v1/institutional/orgs/${createdOrgId}/parliamentary/drafts/${draftId}/stage`)
        .set('Authorization', `Bearer ${leadA1Token}`)
        .set('x-active-unit-id', bidangA1Id)
        .send({ currentStage: nextStage })
        .expect(HttpStatus.OK);
    }

    // Regular MEMBER cannot finalize into PENYELESAIAN_FORMAL (403 Forbidden)
    await request(app.getHttpServer())
      .patch(`/api/v1/institutional/orgs/${createdOrgId}/parliamentary/drafts/${draftId}/stage`)
      .set('Authorization', `Bearer ${memberAToken}`)
      .set('x-active-unit-id', bidangA1Id)
      .send({ currentStage: LegislationStage.PENYELESAIAN_FORMAL })
      .expect(HttpStatus.FORBIDDEN);

    // UNIT_LEAD advances cleanly into PENYELESAIAN_FORMAL (no blocking clauses yet -> 200 OK)
    const stageRes = await request(app.getHttpServer())
      .patch(`/api/v1/institutional/orgs/${createdOrgId}/parliamentary/drafts/${draftId}/stage`)
      .set('Authorization', `Bearer ${leadA1Token}`)
      .set('x-active-unit-id', bidangA1Id)
      .send({ currentStage: LegislationStage.PENYELESAIAN_FORMAL })
      .expect(HttpStatus.OK);
    expect(stageRes.body.currentStage).toBe(LegislationStage.PENYELESAIAN_FORMAL);

    // Add DIM entry & test update RBAC
    const dimCreateRes = await request(app.getHttpServer())
      .post(`/api/v1/institutional/orgs/${createdOrgId}/parliamentary/drafts/${draftId}/dim`)
      .set('Authorization', `Bearer ${memberAToken}`)
      .set('x-active-unit-id', bidangA1Id)
      .send({
        sourcePartyName: 'Koalisi Warga Peduli Air',
        isPublicConsultation: true,
        targetClauseRef: 'Pasal 5 Ayat (1)',
        issueSummary: 'Standar minimum tekanan air belum tercantum.',
        proposedAmendment: 'Tambahkan batas layanan minimal 24 jam per hari.',
      });
    expect([HttpStatus.OK, HttpStatus.CREATED]).toContain(dimCreateRes.status);
    dimId = dimCreateRes.body.id;

    await request(app.getHttpServer())
      .patch(`/api/v1/institutional/orgs/${createdOrgId}/parliamentary/drafts/${draftId}/dim/${dimId}`)
      .set('Authorization', `Bearer ${memberAToken}`)
      .set('x-active-unit-id', bidangA1Id)
      .send({
        status: DimEntryStatus.AGREED,
        responseAndFollowup: 'Percobaan ubah oleh non-reviewer',
      })
      .expect(HttpStatus.FORBIDDEN);

    const dimUpdateRes = await request(app.getHttpServer())
      .patch(`/api/v1/institutional/orgs/${createdOrgId}/parliamentary/drafts/${draftId}/dim/${dimId}`)
      .set('Authorization', `Bearer ${leadA1Token}`)
      .set('x-active-unit-id', bidangA1Id)
      .send({
        status: DimEntryStatus.AGREED,
        responseAndFollowup: 'Disepakati masuk ke rumusan Pasal 5 ayat (2).',
      })
      .expect(HttpStatus.OK);
    expect(dimUpdateRes.body.status).toBe(DimEntryStatus.AGREED);

    const detailRes = await request(app.getHttpServer())
      .get(`/api/v1/institutional/orgs/${createdOrgId}/parliamentary/drafts/${draftId}`)
      .set('Authorization', `Bearer ${memberAToken}`)
      .set('x-active-unit-id', bidangA1Id)
      .expect(HttpStatus.OK);
    expect(detailRes.body.dimEntries[0].status).toBe(DimEntryStatus.AGREED);
    expect(detailRes.body.dimEntries[0].responseAndFollowup).toContain('Disepakati masuk');

    // Cross-unit isolation: Member B (Bidang A2) MUST NOT be able to mutate Bidang A1's draft clauses or DIM
    await request(app.getHttpServer())
      .post(`/api/v1/institutional/orgs/${createdOrgId}/parliamentary/drafts/${draftId}/clauses`)
      .set('Authorization', `Bearer ${memberBToken}`)
      .set('x-active-unit-id', bidangA2Id)
      .send({
        clauseNumber: 'Pasal 99',
        clauseText: 'Percobaan injeksi pasal dari Bidang A2',
      })
      .expect(HttpStatus.FORBIDDEN);

    await request(app.getHttpServer())
      .post(`/api/v1/institutional/orgs/${createdOrgId}/parliamentary/drafts/${draftId}/dim`)
      .set('Authorization', `Bearer ${memberBToken}`)
      .set('x-active-unit-id', bidangA2Id)
      .send({
        sourcePartyName: 'Penyusup Bidang A2',
        targetClauseRef: 'Pasal 5',
        issueSummary: 'Uji cross-unit DIM',
        proposedAmendment: 'Tidak boleh lolos',
      })
      .expect(HttpStatus.FORBIDDEN);
  });

  it('5. Enforces Maker-Checker anti-self-approval (even for UNIT_LEAD) and Claim Guardrail -> creates real content_publications row', async () => {
    // Member A registers evidence
    const evARes = await request(app.getHttpServer())
      .post(`/api/v1/institutional/orgs/${createdOrgId}/parliamentary/performance-evidences`)
      .set('Authorization', `Bearer ${memberAToken}`)
      .set('x-active-unit-id', bidangA1Id)
      .send({
        unitId: bidangA1Id,
        legislationDraftId: draftId,
        title: `Perbaikan Saluran Air 14 Desa ${runSuffix}`,
        achievementLevel: PerformanceAchievementLevel.DIREKOMENDASIKAN,
        contributionScope: PerformanceContributionScope.KONTRIBUSI_INDIVIDU,
        evidenceSourceRef: 'Risalah Rapat Komisi III No. 12/2026',
        summaryText: 'Rekomendasi resmi percepatan sambungan air bersih pedesaan.',
      });
    expect([HttpStatus.OK, HttpStatus.CREATED]).toContain(evARes.status);
    memberAEvidenceId = evARes.body.id;
    expect(evARes.body.isVerified).toBe(false);

    // Unverified evidence cannot enter Studio Publikasi (403 Claim Guardrail)
    await request(app.getHttpServer())
      .post(
        `/api/v1/institutional/orgs/${createdOrgId}/parliamentary/performance-evidences/${memberAEvidenceId}/draft-publication`
      )
      .set('Authorization', `Bearer ${memberAToken}`)
      .set('x-active-unit-id', bidangA1Id)
      .expect(HttpStatus.FORBIDDEN);

    // Member A cannot verify own evidence (403)
    await request(app.getHttpServer())
      .patch(
        `/api/v1/institutional/orgs/${createdOrgId}/parliamentary/performance-evidences/${memberAEvidenceId}/verify`
      )
      .set('Authorization', `Bearer ${memberAToken}`)
      .set('x-active-unit-id', bidangA1Id)
      .expect(HttpStatus.FORBIDDEN);

    // UNIT_LEAD registers own evidence, then tries self-approving -> MUST be rejected (403 Maker-Checker!)
    const evLeadRes = await request(app.getHttpServer())
      .post(`/api/v1/institutional/orgs/${createdOrgId}/parliamentary/performance-evidences`)
      .set('Authorization', `Bearer ${leadA1Token}`)
      .set('x-active-unit-id', bidangA1Id)
      .send({
        unitId: bidangA1Id,
        title: `Usulan Mandiri Ketua Bidang ${runSuffix}`,
        achievementLevel: PerformanceAchievementLevel.DIUSULKAN,
        contributionScope: PerformanceContributionScope.KONTRIBUSI_INDIVIDU,
        evidenceSourceRef: 'Nota Dinas 04/2026',
        summaryText: 'Uji larangan self-approval oleh pembuat yang juga UNIT_LEAD.',
      });
    expect([HttpStatus.OK, HttpStatus.CREATED]).toContain(evLeadRes.status);
    leadA1SelfEvidenceId = evLeadRes.body.id;

    await request(app.getHttpServer())
      .patch(
        `/api/v1/institutional/orgs/${createdOrgId}/parliamentary/performance-evidences/${leadA1SelfEvidenceId}/verify`
      )
      .set('Authorization', `Bearer ${leadA1Token}`)
      .set('x-active-unit-id', bidangA1Id)
      .expect(HttpStatus.FORBIDDEN);

    // UNIT_LEAD verifies Member A's evidence -> 200 OK
    const verifyRes = await request(app.getHttpServer())
      .patch(
        `/api/v1/institutional/orgs/${createdOrgId}/parliamentary/performance-evidences/${memberAEvidenceId}/verify`
      )
      .set('Authorization', `Bearer ${leadA1Token}`)
      .set('x-active-unit-id', bidangA1Id)
      .expect(HttpStatus.OK);
    expect(verifyRes.body.isVerified).toBe(true);
    expect(verifyRes.body.verifiedByTenantId).toBe(leadA1Id);

    // Verified evidence generates Studio Publikasi draft & persists real content_publications row
    const pubRes = await request(app.getHttpServer())
      .post(
        `/api/v1/institutional/orgs/${createdOrgId}/parliamentary/performance-evidences/${memberAEvidenceId}/draft-publication`
      )
      .set('Authorization', `Bearer ${memberAToken}`)
      .set('x-active-unit-id', bidangA1Id);
    expect([HttpStatus.OK, HttpStatus.CREATED]).toContain(pubRes.status);
    expect(pubRes.body.claimGuardrailPassed).toBe(true);
    expect(pubRes.body.enforcedAchievementLevel).toBe(
      PerformanceAchievementLevel.DIREKOMENDASIKAN
    );

    const listRes = await request(app.getHttpServer())
      .get(`/api/v1/institutional/orgs/${createdOrgId}/parliamentary/performance-evidences`)
      .set('Authorization', `Bearer ${memberAToken}`)
      .set('x-active-unit-id', bidangA1Id)
      .expect(HttpStatus.OK);

    const syncedEv = (listRes.body as Array<{ id: string; linkedPublicationId?: string | null }>).find(
      (e) => e.id === memberAEvidenceId
    );
    expect(syncedEv?.linkedPublicationId).toBeTruthy();
    linkedPublicationId = syncedEv?.linkedPublicationId || null;

    await withTenantContext(memberAId, async (tx) => {
      const [pubRow] = await tx
        .select({ id: contentPublications.id, title: contentPublications.title })
        .from(contentPublications)
        .where(eq(contentPublications.id, linkedPublicationId!));
      expect(pubRow?.id).toBe(linkedPublicationId);
      expect(pubRow?.title).toContain(`Perbaikan Saluran Air 14 Desa ${runSuffix}`);

      const [packRow] = await tx
        .select({
          publicationId: socialSyndicationPacks.publicationId,
          instagramCaption: socialSyndicationPacks.instagramCaption,
        })
        .from(socialSyndicationPacks)
        .where(eq(socialSyndicationPacks.publicationId, linkedPublicationId!));
      expect(packRow?.publicationId).toBe(linkedPublicationId);
      expect(packRow?.instagramCaption).toContain(`Perbaikan Saluran Air 14 Desa ${runSuffix}`);
    });
  });
});
