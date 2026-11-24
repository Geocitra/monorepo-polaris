import {
  Injectable,
  BadRequestException,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import {
  db,
  organizations,
  organizationContracts,
  organizationUnits,
  organizationMemberships,
  organizationUnitMemberships,
  institutionalAuditLogs,
  tenantMembers,
  eq,
  and,
  desc,
  asc,
  sql,
} from '@polaris/database';
import {
  WorkspaceMode,
  OrganizationStatus,
  OrganizationContractStatus,
  OrganizationUnitType,
  OrganizationMemberRole,
  OrganizationUnitMemberRole,
  InstitutionalMembershipStatus,
  DatahubPrivacyScope,
  LegislativeLevel,
  type OrganizationDto,
  type OrganizationContractDto,
  type OrganizationUnitNodeDto,
  type OrganizationMemberDto,
  type MyWorkspacesResponseDto,
  type InstitutionalScopedDocumentDto,
  type SuperadminInstitutionSummaryDto,
  type SuperadminInstitutionDetailDto,
} from '@polaris/shared-types';
import type {
  CreateInstitutionRequestDto,
  UpdateInstitutionRequestDto,
  UpsertOrganizationContractRequestDto,
  AssignOrganizationMemberRequestDto,
  CreateOrganizationUnitRequestDto,
  UpdateOrganizationUnitRequestDto,
  AssignUnitMemberRequestDto,
} from './dto/institutional-request.dto.js';

/**
 * Layanan Tata Kelola Instansi (Superadmin Control Tower, Kontrak B2G,
 * Hierarki AKD/Bidang, Keanggotaan, Pagu Storage, & Workspace Switcher).
 */
@Injectable()
export class InstitutionalGovernanceService {
  mapOrganizationDto(row: typeof organizations.$inferSelect): OrganizationDto {
    return {
      id: row.id,
      code: row.code,
      name: row.name,
      legislativeLevel: row.legislativeLevel as LegislativeLevel,
      regionName: row.regionName,
      provinceName: row.provinceName,
      standingOrdersConfig: row.standingOrdersConfig || {},
      status: row.status as OrganizationStatus,
      createdAt: row.createdAt.toISOString(),
      updatedAt: row.updatedAt.toISOString(),
    };
  }

  mapContractDto(row: typeof organizationContracts.$inferSelect): OrganizationContractDto {
    return {
      id: row.id,
      organizationId: row.organizationId,
      contractNumber: row.contractNumber,
      fiscalYear: row.fiscalYear,
      status: row.status as OrganizationContractStatus,
      startDate: row.startDate.toISOString(),
      endDate: row.endDate.toISOString(),
      gracePeriodEnd: row.gracePeriodEnd ? row.gracePeriodEnd.toISOString() : null,
      maxSeats: row.maxSeats,
      maxStorageBytes: Number(row.maxStorageBytes),
      annualTokenPoolLimit: Number(row.annualTokenPoolLimit),
      tokensConsumed: Number(row.tokensConsumed),
      contractValueIdr: Number(row.contractValueIdr),
      notes: row.notes,
      createdAt: row.createdAt.toISOString(),
      updatedAt: row.updatedAt.toISOString(),
    };
  }

  async recordAudit(params: {
    organizationId: string;
    unitId?: string | null;
    actorTenantId?: string | null;
    actorAdminId?: string | null;
    action: string;
    targetEntity: string;
    targetEntityId?: string | null;
    details?: Record<string, unknown>;
  }): Promise<void> {
    try {
      await db.insert(institutionalAuditLogs).values({
        organizationId: params.organizationId,
        unitId: params.unitId || null,
        actorTenantId: params.actorTenantId || null,
        actorAdminId: params.actorAdminId || null,
        action: params.action,
        targetEntity: params.targetEntity,
        targetEntityId: params.targetEntityId || null,
        details: params.details || {},
      });
    } catch {
      // Non-blocking audit write
    }
  }

  /**
   * Menegakkan pagu kapasitas storage (maxStorageBytes) pada kontrak B2G Instansi.
   */
  async assertOrganizationStorageQuotaAvailable(
    orgId: string,
    incomingByteSize: number
  ): Promise<void> {
    const [contract] = await db
      .select()
      .from(organizationContracts)
      .where(eq(organizationContracts.organizationId, orgId))
      .orderBy(desc(organizationContracts.endDate))
      .limit(1);

    if (!contract) {
      throw new ForbiddenException('Kontrak tahunan B2G Instansi tidak ditemukan.');
    }

    const maxBytes = Number(contract.maxStorageBytes || 0);
    if (maxBytes <= 0) {
      return;
    }

    const [usage] = await db.execute(sql`
      SELECT COALESCE(SUM(f.file_size_bytes), 0)::bigint AS "storageUsedBytes"
      FROM datahub_files f
      WHERE f.id IN (
        SELECT DISTINCT file_id
        FROM datahub_document_refs
        WHERE organization_id = ${orgId}::uuid
      );
    `);

    const usedBytes = Number(((usage as any)?.storageUsedBytes) || 0);
    if (usedBytes + Math.max(0, incomingByteSize) > maxBytes) {
      throw new ForbiddenException(
        `Kapasitas storage kontrak B2G Instansi penuh (${usedBytes.toLocaleString('id-ID')} / ${maxBytes.toLocaleString('id-ID')} bytes). Hubungi Superadmin untuk perluasan pagu storage.`
      );
    }
  }

  /**
   * Memastikan bahwa target unitId benar milik orgId dan actorTenantId terdaftar aktif
   * di unitId tersebut (kecuali actor memiliki peran ORG_ADMIN atau LEADERSHIP).
   */
  async assertUserUnitMembershipOrOrgAdmin(
    orgId: string,
    unitId: string,
    tenantId: string,
    orgRole: OrganizationMemberRole
  ): Promise<void> {
    const [unit] = await db
      .select({ id: organizationUnits.id, isActive: organizationUnits.isActive })
      .from(organizationUnits)
      .where(and(eq(organizationUnits.id, unitId), eq(organizationUnits.organizationId, orgId)))
      .limit(1);

    if (!unit) {
      throw new BadRequestException('Unit/Bidang tidak ditemukan di dalam Instansi ini.');
    }

    if (!unit.isActive) {
      throw new ForbiddenException('Unit/Bidang tersebut telah diarsipkan atau tidak aktif.');
    }

    if (
      orgRole === OrganizationMemberRole.ORG_ADMIN ||
      orgRole === OrganizationMemberRole.LEADERSHIP
    ) {
      return;
    }

    const [membership] = await db
      .select({ id: organizationUnitMemberships.id })
      .from(organizationUnitMemberships)
      .where(
        and(
          eq(organizationUnitMemberships.organizationId, orgId),
          eq(organizationUnitMemberships.unitId, unitId),
          eq(organizationUnitMemberships.tenantId, tenantId),
          eq(organizationUnitMemberships.status, InstitutionalMembershipStatus.ACTIVE)
        )
      )
      .limit(1);

    if (!membership) {
      throw new ForbiddenException(
        'Akses ditolak: Anda tidak terdaftar sebagai anggota aktif pada Unit/Bidang tersebut.'
      );
    }
  }

  // ============================================================================
  // 1. SUPERADMIN INSTITUTIONAL CONTROL TOWER
  // ============================================================================

  async createInstitution(
    adminId: string | undefined,
    dto: CreateInstitutionRequestDto
  ): Promise<SuperadminInstitutionDetailDto> {
    const cleanCode = dto.code.trim().toUpperCase();
    const [existing] = await db
      .select({ id: organizations.id })
      .from(organizations)
      .where(eq(organizations.code, cleanCode))
      .limit(1);

    if (existing) {
      throw new BadRequestException(`Kode Instansi "${cleanCode}" sudah terdaftar.`);
    }

    const startDate = new Date(dto.startDate);
    const endDate = new Date(dto.endDate);
    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime()) || endDate <= startDate) {
      throw new BadRequestException('Tanggal akhir kontrak wajib lebih besar dari tanggal mulai.');
    }

    const [createdOrg] = await db
      .insert(organizations)
      .values({
        code: cleanCode,
        name: dto.name.trim(),
        legislativeLevel: dto.legislativeLevel,
        regionName: dto.regionName.trim(),
        provinceName: dto.provinceName.trim(),
        standingOrdersConfig: dto.standingOrdersConfig || {
          lkpjDiscussionDaysLimit: 30,
          defaultDiscussionBodyType: OrganizationUnitType.PANJA,
          requireReviewerApprovalBeforeConsolidation: true,
        },
        status: OrganizationStatus.ACTIVE,
        createdByAdminId: adminId || null,
      })
      .returning();

    await db.insert(organizationContracts).values({
      organizationId: createdOrg.id,
      contractNumber: dto.contractNumber.trim(),
      fiscalYear: dto.fiscalYear,
      status: OrganizationContractStatus.ACTIVE,
      startDate,
      endDate,
      maxSeats: dto.maxSeats ?? 50,
      maxStorageBytes: dto.maxStorageBytes ?? 10737418240,
      annualTokenPoolLimit: dto.annualTokenPoolLimit ?? 50000000,
      tokensConsumed: 0,
      contractValueIdr: (dto.contractValueIdr ?? 0).toFixed(2),
      createdByAdminId: adminId || null,
    });

    if (dto.initialOrgAdminTenantId) {
      const [member] = await db
        .select({ id: tenantMembers.id })
        .from(tenantMembers)
        .where(eq(tenantMembers.id, dto.initialOrgAdminTenantId))
        .limit(1);

      if (member) {
        await db.insert(organizationMemberships).values({
          organizationId: createdOrg.id,
          tenantId: member.id,
          orgRole: OrganizationMemberRole.ORG_ADMIN,
          status: InstitutionalMembershipStatus.ACTIVE,
          titleOrPosition: 'Admin Instansi / Sekretariat DPRD',
        });
      }
    }

    await this.recordAudit({
      organizationId: createdOrg.id,
      actorAdminId: adminId || null,
      action: 'CREATE_INSTITUTION_AND_CONTRACT',
      targetEntity: 'organizations',
      targetEntityId: createdOrg.id,
      details: { code: cleanCode, contractNumber: dto.contractNumber },
    });

    return this.getSuperadminInstitutionDetail(createdOrg.id);
  }

  async listSuperadminInstitutions(): Promise<SuperadminInstitutionSummaryDto[]> {
    const orgRows = await db
      .select()
      .from(organizations)
      .orderBy(desc(organizations.createdAt));

    const currentMonth = new Date().toISOString().slice(0, 7);
    const summaries: SuperadminInstitutionSummaryDto[] = [];

    for (const org of orgRows) {
      const [latestContract] = await db
        .select()
        .from(organizationContracts)
        .where(eq(organizationContracts.organizationId, org.id))
        .orderBy(desc(organizationContracts.endDate))
        .limit(1);

      const [counts] = await db.execute(sql`
        SELECT
          (SELECT COUNT(*)::integer FROM organization_memberships WHERE organization_id = ${org.id}::uuid) AS "totalMembers",
          (SELECT COUNT(*)::integer FROM organization_memberships WHERE organization_id = ${org.id}::uuid AND status = 'ACTIVE') AS "activeSeatsUsed",
          (SELECT COUNT(*)::integer FROM organization_units WHERE organization_id = ${org.id}::uuid AND is_active = true) AS "totalUnits",
          (SELECT COUNT(*)::integer FROM organization_units WHERE organization_id = ${org.id}::uuid AND unit_type = 'BIDANG' AND is_active = true) AS "totalBidang",
          (SELECT COUNT(DISTINCT ref.id)::integer FROM datahub_document_refs ref WHERE ref.organization_id = ${org.id}::uuid) AS "totalDocuments",
          (SELECT COALESCE(SUM(f.file_size_bytes), 0)::bigint
           FROM datahub_files f
           WHERE f.id IN (SELECT DISTINCT file_id FROM datahub_document_refs WHERE organization_id = ${org.id}::uuid)
          ) AS "storageUsedBytes"
      `);

      const [monthlyAi] = await db.execute(sql`
        SELECT
          COALESCE(SUM(total_requests), 0)::integer AS "totalRequests",
          COALESCE(SUM(total_tokens_consumed), 0)::bigint AS "totalTokensConsumed",
          COALESCE(SUM(total_cost_idr), 0)::bigint AS "totalCostIdr",
          COALESCE(SUM(openai_total_tokens), 0)::bigint AS "openaiTokens",
          COALESCE(SUM(gemini_total_tokens), 0)::bigint AS "geminiTokens"
        FROM organization_quota_ledgers
        WHERE organization_id = ${org.id}::uuid
          AND billing_cycle_month = ${currentMonth};
      `);

      const cRow = (counts as any) || {};
      const mRow = (monthlyAi as any) || {};

      summaries.push({
        organization: this.mapOrganizationDto(org),
        activeContract: latestContract ? this.mapContractDto(latestContract) : null,
        totalMembers: Number(cRow.totalMembers || 0),
        activeSeatsUsed: Number(cRow.activeSeatsUsed || 0),
        totalUnits: Number(cRow.totalUnits || 0),
        totalBidang: Number(cRow.totalBidang || 0),
        totalDocuments: Number(cRow.totalDocuments || 0),
        storageUsedBytes: Number(cRow.storageUsedBytes || 0),
        monthlyAiUsage: {
          billingCycleMonth: currentMonth,
          totalRequests: Number(mRow.totalRequests || 0),
          totalTokensConsumed: Number(mRow.totalTokensConsumed || 0),
          totalCostIdr: Number(mRow.totalCostIdr || 0),
          openaiTokens: Number(mRow.openaiTokens || 0),
          geminiTokens: Number(mRow.geminiTokens || 0),
        },
      });
    }

    return summaries;
  }

  async getSuperadminInstitutionDetail(orgId: string): Promise<SuperadminInstitutionDetailDto> {
    const [org] = await db
      .select()
      .from(organizations)
      .where(eq(organizations.id, orgId))
      .limit(1);

    if (!org) {
      throw new NotFoundException('Instansi tidak ditemukan.');
    }

    const allContracts = await db
      .select()
      .from(organizationContracts)
      .where(eq(organizationContracts.organizationId, orgId))
      .orderBy(desc(organizationContracts.endDate));

    const unitTree = await this.getOrganizationUnitTree(orgId);
    const members = await this.getOrganizationMembers(orgId);

    const currentMonth = new Date().toISOString().slice(0, 7);
    const [counts] = await db.execute(sql`
      SELECT
        (SELECT COUNT(*)::integer FROM organization_memberships WHERE organization_id = ${orgId}::uuid) AS "totalMembers",
        (SELECT COUNT(*)::integer FROM organization_memberships WHERE organization_id = ${orgId}::uuid AND status = 'ACTIVE') AS "activeSeatsUsed",
        (SELECT COUNT(*)::integer FROM organization_units WHERE organization_id = ${orgId}::uuid AND is_active = true) AS "totalUnits",
        (SELECT COUNT(*)::integer FROM organization_units WHERE organization_id = ${orgId}::uuid AND unit_type = 'BIDANG' AND is_active = true) AS "totalBidang",
        (SELECT COUNT(DISTINCT ref.id)::integer FROM datahub_document_refs ref WHERE ref.organization_id = ${orgId}::uuid) AS "totalDocuments",
        (SELECT COALESCE(SUM(f.file_size_bytes), 0)::bigint
         FROM datahub_files f
         WHERE f.id IN (SELECT DISTINCT file_id FROM datahub_document_refs WHERE organization_id = ${orgId}::uuid)
        ) AS "storageUsedBytes"
    `);

    const [monthlyAi] = await db.execute(sql`
      SELECT
        COALESCE(SUM(total_requests), 0)::integer AS "totalRequests",
        COALESCE(SUM(total_tokens_consumed), 0)::bigint AS "totalTokensConsumed",
        COALESCE(SUM(total_cost_idr), 0)::bigint AS "totalCostIdr",
        COALESCE(SUM(openai_total_tokens), 0)::bigint AS "openaiTokens",
        COALESCE(SUM(gemini_total_tokens), 0)::bigint AS "geminiTokens"
      FROM organization_quota_ledgers
      WHERE organization_id = ${orgId}::uuid
        AND billing_cycle_month = ${currentMonth};
    `);

    const unitUsageRows = await db.execute(sql`
      SELECT
        l.unit_id AS "unitId",
        COALESCE(u.code, 'ORG-GENERAL') AS "unitCode",
        COALESCE(u.name, 'Tingkat Instansi / Sekretariat') AS "unitName",
        COALESCE(u.unit_type::text, 'ORG_GENERAL') AS "unitType",
        pu.name AS "parentUnitName",
        COALESCE(SUM(l.total_requests), 0)::integer AS "totalRequests",
        COALESCE(SUM(l.total_tokens_consumed), 0)::bigint AS "totalTokensConsumed",
        COALESCE(SUM(l.total_cost_idr), 0)::bigint AS "totalCostIdr"
      FROM organization_quota_ledgers l
      LEFT JOIN organization_units u ON l.unit_id = u.id
      LEFT JOIN organization_units pu ON u.parent_unit_id = pu.id
      WHERE l.organization_id = ${orgId}::uuid
      GROUP BY l.unit_id, u.code, u.name, u.unit_type, pu.name
      ORDER BY "totalTokensConsumed" DESC;
    `);

    const cRow = (counts as any) || {};
    const mRow = (monthlyAi as any) || {};
    const uRows = ((unitUsageRows as any)?.rows || unitUsageRows || []) as any[];

    return {
      organization: this.mapOrganizationDto(org),
      activeContract: allContracts[0] ? this.mapContractDto(allContracts[0]) : null,
      contracts: allContracts.map((c) => this.mapContractDto(c)),
      totalMembers: Number(cRow.totalMembers || 0),
      activeSeatsUsed: Number(cRow.activeSeatsUsed || 0),
      totalUnits: Number(cRow.totalUnits || 0),
      totalBidang: Number(cRow.totalBidang || 0),
      totalDocuments: Number(cRow.totalDocuments || 0),
      storageUsedBytes: Number(cRow.storageUsedBytes || 0),
      monthlyAiUsage: {
        billingCycleMonth: currentMonth,
        totalRequests: Number(mRow.totalRequests || 0),
        totalTokensConsumed: Number(mRow.totalTokensConsumed || 0),
        totalCostIdr: Number(mRow.totalCostIdr || 0),
        openaiTokens: Number(mRow.openaiTokens || 0),
        geminiTokens: Number(mRow.geminiTokens || 0),
      },
      unitTree,
      members,
      unitUsageBreakdown: uRows.map((r) => ({
        unitId: r.unitId || null,
        unitCode: r.unitCode,
        unitName: r.unitName,
        unitType: r.unitType,
        parentUnitName: r.parentUnitName || null,
        totalRequests: Number(r.totalRequests || 0),
        totalTokensConsumed: Number(r.totalTokensConsumed || 0),
        totalCostIdr: Number(r.totalCostIdr || 0),
      })),
    };
  }

  async updateInstitution(
    orgId: string,
    adminId: string | undefined,
    dto: UpdateInstitutionRequestDto
  ): Promise<OrganizationDto> {
    const [updated] = await db
      .update(organizations)
      .set({
        ...(dto.name ? { name: dto.name.trim() } : {}),
        ...(dto.regionName ? { regionName: dto.regionName.trim() } : {}),
        ...(dto.provinceName ? { provinceName: dto.provinceName.trim() } : {}),
        ...(dto.status ? { status: dto.status } : {}),
        ...(dto.standingOrdersConfig ? { standingOrdersConfig: dto.standingOrdersConfig } : {}),
        updatedAt: new Date(),
      })
      .where(eq(organizations.id, orgId))
      .returning();

    if (!updated) {
      throw new NotFoundException('Instansi tidak ditemukan.');
    }

    await this.recordAudit({
      organizationId: orgId,
      actorAdminId: adminId || null,
      action: 'UPDATE_INSTITUTION',
      targetEntity: 'organizations',
      targetEntityId: orgId,
      details: dto as unknown as Record<string, unknown>,
    });

    return this.mapOrganizationDto(updated);
  }

  async upsertOrganizationContract(
    orgId: string,
    adminId: string | undefined,
    dto: UpsertOrganizationContractRequestDto
  ): Promise<OrganizationContractDto> {
    const [org] = await db
      .select({ id: organizations.id })
      .from(organizations)
      .where(eq(organizations.id, orgId))
      .limit(1);

    if (!org) {
      throw new NotFoundException('Instansi tidak ditemukan.');
    }

    const startDate = new Date(dto.startDate);
    const endDate = new Date(dto.endDate);
    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime()) || endDate <= startDate) {
      throw new BadRequestException('Tanggal akhir kontrak wajib lebih besar dari tanggal mulai.');
    }

    const [existing] = await db
      .select()
      .from(organizationContracts)
      .where(eq(organizationContracts.contractNumber, dto.contractNumber.trim()))
      .limit(1);

    if (existing && existing.organizationId !== orgId) {
      throw new BadRequestException(
        `Nomor kontrak "${dto.contractNumber}" sudah terdaftar pada Instansi lain.`
      );
    }

    let saved: typeof organizationContracts.$inferSelect;
    if (existing) {
      const [updated] = await db
        .update(organizationContracts)
        .set({
          fiscalYear: dto.fiscalYear,
          status: dto.status,
          startDate,
          endDate,
          ...(dto.maxSeats !== undefined ? { maxSeats: dto.maxSeats } : {}),
          ...(dto.maxStorageBytes !== undefined ? { maxStorageBytes: dto.maxStorageBytes } : {}),
          ...(dto.annualTokenPoolLimit !== undefined
            ? { annualTokenPoolLimit: dto.annualTokenPoolLimit }
            : {}),
          ...(dto.contractValueIdr !== undefined
            ? { contractValueIdr: dto.contractValueIdr.toFixed(2) }
            : {}),
          ...(dto.notes !== undefined ? { notes: dto.notes } : {}),
          updatedAt: new Date(),
        })
        .where(eq(organizationContracts.id, existing.id))
        .returning();
      saved = updated;
    } else {
      const [inserted] = await db
        .insert(organizationContracts)
        .values({
          organizationId: orgId,
          contractNumber: dto.contractNumber.trim(),
          fiscalYear: dto.fiscalYear,
          status: dto.status,
          startDate,
          endDate,
          maxSeats: dto.maxSeats ?? 50,
          maxStorageBytes: dto.maxStorageBytes ?? 10737418240,
          annualTokenPoolLimit: dto.annualTokenPoolLimit ?? 50000000,
          contractValueIdr: (dto.contractValueIdr ?? 0).toFixed(2),
          notes: dto.notes || null,
          createdByAdminId: adminId || null,
        })
        .returning();
      saved = inserted;
    }

    await this.recordAudit({
      organizationId: orgId,
      actorAdminId: adminId || null,
      action: 'UPSERT_ORGANIZATION_CONTRACT',
      targetEntity: 'organization_contracts',
      targetEntityId: saved.id,
      details: { contractNumber: saved.contractNumber, status: saved.status },
    });

    return this.mapContractDto(saved);
  }

  // ============================================================================
  // 2. SEKRETARIAT (ORG_ADMIN) — HIERARCHY, MEMBERSHIPS & OFFICIAL DOCS LIST
  // ============================================================================

  async createOrganizationUnit(
    orgId: string,
    actorTenantId: string | undefined,
    dto: CreateOrganizationUnitRequestDto
  ): Promise<OrganizationUnitNodeDto> {
    const cleanCode = dto.code.trim().toUpperCase();
    const [existingCode] = await db
      .select({ id: organizationUnits.id })
      .from(organizationUnits)
      .where(
        and(eq(organizationUnits.organizationId, orgId), eq(organizationUnits.code, cleanCode))
      )
      .limit(1);

    if (existingCode) {
      throw new BadRequestException(
        `Kode Unit/Bidang "${cleanCode}" sudah terdaftar di dalam Instansi ini.`
      );
    }

    if (dto.parentUnitId) {
      const [parentUnit] = await db
        .select()
        .from(organizationUnits)
        .where(
          and(
            eq(organizationUnits.id, dto.parentUnitId),
            eq(organizationUnits.organizationId, orgId)
          )
        )
        .limit(1);

      if (!parentUnit) {
        throw new BadRequestException(
          'Unit induk (parentUnitId) tidak ditemukan di dalam Instansi ini.'
        );
      }
    }

    const [created] = await db
      .insert(organizationUnits)
      .values({
        organizationId: orgId,
        parentUnitId: dto.parentUnitId || null,
        unitType: dto.unitType,
        code: cleanCode,
        name: dto.name.trim(),
        description: dto.description?.trim() || null,
        politicalPartyId: dto.politicalPartyId || null,
        focusSectors: dto.focusSectors || [],
        partnerOpds: dto.partnerOpds || [],
        isAdHoc:
          dto.isAdHoc ??
          (dto.unitType === OrganizationUnitType.PANJA ||
            dto.unitType === OrganizationUnitType.PANSUS),
        fiscalYear: dto.fiscalYear || null,
        isActive: true,
      })
      .returning();

    await this.recordAudit({
      organizationId: orgId,
      unitId: created.id,
      actorTenantId: actorTenantId || null,
      action: 'CREATE_ORGANIZATION_UNIT',
      targetEntity: 'organization_units',
      targetEntityId: created.id,
      details: {
        code: created.code,
        name: created.name,
        unitType: created.unitType,
        parentUnitId: created.parentUnitId,
      },
    });

    return {
      id: created.id,
      organizationId: created.organizationId,
      parentUnitId: created.parentUnitId,
      unitType: created.unitType as OrganizationUnitType,
      code: created.code,
      name: created.name,
      description: created.description,
      politicalPartyId: created.politicalPartyId,
      politicalPartyName: null,
      focusSectors: created.focusSectors || [],
      partnerOpds: created.partnerOpds || [],
      isAdHoc: created.isAdHoc,
      fiscalYear: created.fiscalYear,
      isActive: created.isActive,
      archivedAt: null,
      memberCount: 0,
      documentCount: 0,
      children: [],
    };
  }

  async updateOrganizationUnit(
    orgId: string,
    unitId: string,
    actorTenantId: string | undefined,
    dto: UpdateOrganizationUnitRequestDto
  ): Promise<OrganizationUnitNodeDto> {
    const [unit] = await db
      .select()
      .from(organizationUnits)
      .where(and(eq(organizationUnits.id, unitId), eq(organizationUnits.organizationId, orgId)))
      .limit(1);

    if (!unit) {
      throw new NotFoundException('Unit atau Bidang tidak ditemukan di dalam Instansi ini.');
    }

    const [updated] = await db
      .update(organizationUnits)
      .set({
        ...(dto.name ? { name: dto.name.trim() } : {}),
        ...(dto.description !== undefined ? { description: dto.description } : {}),
        ...(dto.focusSectors ? { focusSectors: dto.focusSectors } : {}),
        ...(dto.partnerOpds ? { partnerOpds: dto.partnerOpds } : {}),
        ...(dto.isActive !== undefined
          ? {
              isActive: dto.isActive,
              archivedAt: dto.isActive ? null : new Date(),
            }
          : {}),
        updatedAt: new Date(),
      })
      .where(eq(organizationUnits.id, unitId))
      .returning();

    await this.recordAudit({
      organizationId: orgId,
      unitId,
      actorTenantId: actorTenantId || null,
      action: 'UPDATE_ORGANIZATION_UNIT',
      targetEntity: 'organization_units',
      targetEntityId: unitId,
      details: dto as unknown as Record<string, unknown>,
    });

    return {
      id: updated.id,
      organizationId: updated.organizationId,
      parentUnitId: updated.parentUnitId,
      unitType: updated.unitType as OrganizationUnitType,
      code: updated.code,
      name: updated.name,
      description: updated.description,
      politicalPartyId: updated.politicalPartyId,
      politicalPartyName: null,
      focusSectors: updated.focusSectors || [],
      partnerOpds: updated.partnerOpds || [],
      isAdHoc: updated.isAdHoc,
      fiscalYear: updated.fiscalYear,
      isActive: updated.isActive,
      archivedAt: updated.archivedAt ? updated.archivedAt.toISOString() : null,
      memberCount: 0,
      documentCount: 0,
      children: [],
    };
  }

  async getOrganizationUnitTree(orgId: string): Promise<OrganizationUnitNodeDto[]> {
    const rows = await db.execute(sql`
      SELECT
        u.id,
        u.organization_id AS "organizationId",
        u.parent_unit_id AS "parentUnitId",
        u.unit_type AS "unitType",
        u.code,
        u.name,
        u.description,
        u.political_party_id AS "politicalPartyId",
        p.name AS "politicalPartyName",
        u.focus_sectors AS "focusSectors",
        u.partner_opds AS "partnerOpds",
        u.is_ad_hoc AS "isAdHoc",
        u.fiscal_year AS "fiscalYear",
        u.is_active AS "isActive",
        u.archived_at AS "archivedAt",
        (
          SELECT COUNT(*)::integer
          FROM organization_unit_memberships um
          WHERE um.unit_id = u.id AND um.status = 'ACTIVE'
        ) AS "memberCount",
        (
          SELECT COUNT(*)::integer
          FROM datahub_document_refs ref
          WHERE ref.organization_id = u.organization_id
            AND ref.organization_unit_id = u.id
            AND ref.privacy_scope = 'UNIT_BIDANG'
        ) AS "documentCount"
      FROM organization_units u
      LEFT JOIN master_political_parties p ON u.political_party_id = p.id
      WHERE u.organization_id = ${orgId}::uuid
      ORDER BY u.unit_type ASC, u.name ASC;
    `);

    const flatList = (((rows as any)?.rows || rows || []) as any[]).map(
      (r): OrganizationUnitNodeDto => ({
        id: r.id,
        organizationId: r.organizationId,
        parentUnitId: r.parentUnitId || null,
        unitType: r.unitType as OrganizationUnitType,
        code: r.code,
        name: r.name,
        description: r.description || null,
        politicalPartyId: r.politicalPartyId || null,
        politicalPartyName: r.politicalPartyName || null,
        focusSectors: Array.isArray(r.focusSectors) ? r.focusSectors : [],
        partnerOpds: Array.isArray(r.partnerOpds) ? r.partnerOpds : [],
        isAdHoc: Boolean(r.isAdHoc),
        fiscalYear: r.fiscalYear || null,
        isActive: Boolean(r.isActive),
        archivedAt: r.archivedAt ? new Date(r.archivedAt).toISOString() : null,
        memberCount: Number(r.memberCount || 0),
        documentCount: Number(r.documentCount || 0),
        children: [],
      })
    );

    const byId = new Map<string, OrganizationUnitNodeDto>();
    for (const node of flatList) {
      byId.set(node.id, node);
    }

    const roots: OrganizationUnitNodeDto[] = [];
    for (const node of flatList) {
      if (node.parentUnitId && byId.has(node.parentUnitId)) {
        byId.get(node.parentUnitId)!.children.push(node);
      } else {
        roots.push(node);
      }
    }

    return roots;
  }

  async assignOrganizationMember(
    orgId: string,
    actorId: { tenantId?: string; adminId?: string },
    dto: AssignOrganizationMemberRequestDto
  ): Promise<OrganizationMemberDto> {
    if (!dto.tenantId && !dto.email) {
      throw new BadRequestException('Pilih akun pengguna berdasarkan tenantId atau email.');
    }

    const [member] = await db
      .select({
        id: tenantMembers.id,
        email: tenantMembers.email,
      })
      .from(tenantMembers)
      .where(
        dto.tenantId
          ? eq(tenantMembers.id, dto.tenantId)
          : eq(tenantMembers.email, dto.email!.trim().toLowerCase())
      )
      .limit(1);

    if (!member) {
      throw new NotFoundException(
        'Akun pengguna tidak ditemukan di POLARIS. Pastikan akun telah terdaftar.'
      );
    }

    const [contract] = await db
      .select()
      .from(organizationContracts)
      .where(eq(organizationContracts.organizationId, orgId))
      .orderBy(desc(organizationContracts.endDate))
      .limit(1);

    const [existingMembership] = await db
      .select()
      .from(organizationMemberships)
      .where(
        and(
          eq(organizationMemberships.organizationId, orgId),
          eq(organizationMemberships.tenantId, member.id)
        )
      )
      .limit(1);

    if (!existingMembership && contract) {
      const [seatStats] = await db.execute(sql`
        SELECT COUNT(*)::integer AS "activeSeats"
        FROM organization_memberships
        WHERE organization_id = ${orgId}::uuid AND status = 'ACTIVE';
      `);
      const activeSeats = Number(((seatStats as any)?.activeSeats) || 0);
      if (activeSeats >= contract.maxSeats) {
        throw new BadRequestException(
          `Kuota kursi (maxSeats: ${contract.maxSeats}) pada kontrak Instansi ini telah penuh.`
        );
      }
    }

    if (existingMembership) {
      await db
        .update(organizationMemberships)
        .set({
          orgRole: dto.orgRole,
          status: InstitutionalMembershipStatus.ACTIVE,
          ...(dto.titleOrPosition !== undefined ? { titleOrPosition: dto.titleOrPosition } : {}),
          updatedAt: new Date(),
        })
        .where(eq(organizationMemberships.id, existingMembership.id));
    } else {
      await db.insert(organizationMemberships).values({
        organizationId: orgId,
        tenantId: member.id,
        orgRole: dto.orgRole,
        status: InstitutionalMembershipStatus.ACTIVE,
        titleOrPosition: dto.titleOrPosition || null,
      });
    }

    await this.recordAudit({
      organizationId: orgId,
      actorTenantId: actorId.tenantId || null,
      actorAdminId: actorId.adminId || null,
      action: 'ASSIGN_ORGANIZATION_MEMBER',
      targetEntity: 'organization_memberships',
      targetEntityId: member.id,
      details: { email: member.email, orgRole: dto.orgRole },
    });

    const allMembers = await this.getOrganizationMembers(orgId);
    const matched = allMembers.find((m) => m.tenantId === member.id);
    if (!matched) {
      throw new NotFoundException('Gagal memuat data anggota instansi setelah penugasan.');
    }
    return matched;
  }

  async assignUnitMember(
    orgId: string,
    unitId: string,
    actorId: { tenantId?: string; adminId?: string },
    dto: AssignUnitMemberRequestDto
  ) {
    const [unit] = await db
      .select()
      .from(organizationUnits)
      .where(and(eq(organizationUnits.id, unitId), eq(organizationUnits.organizationId, orgId)))
      .limit(1);

    if (!unit) {
      throw new NotFoundException('Unit atau Bidang tidak ditemukan di dalam Instansi ini.');
    }

    const [orgMember] = await db
      .select()
      .from(organizationMemberships)
      .where(
        and(
          eq(organizationMemberships.organizationId, orgId),
          eq(organizationMemberships.tenantId, dto.tenantId),
          eq(organizationMemberships.status, InstitutionalMembershipStatus.ACTIVE)
        )
      )
      .limit(1);

    if (!orgMember) {
      throw new BadRequestException(
        'Pengguna wajib terdaftar sebagai anggota aktif di Instansi ini terlebih dahulu sebelum dapat ditugaskan ke Unit/Bidang.'
      );
    }

    const [existingUnitMember] = await db
      .select()
      .from(organizationUnitMemberships)
      .where(
        and(
          eq(organizationUnitMemberships.unitId, unitId),
          eq(organizationUnitMemberships.tenantId, dto.tenantId)
        )
      )
      .limit(1);

    if (existingUnitMember) {
      await db
        .update(organizationUnitMemberships)
        .set({
          unitRole: dto.unitRole,
          status: InstitutionalMembershipStatus.ACTIVE,
          assignedByTenantId: actorId.tenantId || null,
          assignedByAdminId: actorId.adminId || null,
          updatedAt: new Date(),
        })
        .where(eq(organizationUnitMemberships.id, existingUnitMember.id));
    } else {
      await db.insert(organizationUnitMemberships).values({
        organizationId: orgId,
        unitId,
        tenantId: dto.tenantId,
        unitRole: dto.unitRole,
        status: InstitutionalMembershipStatus.ACTIVE,
        assignedByTenantId: actorId.tenantId || null,
        assignedByAdminId: actorId.adminId || null,
      });
    }

    await this.recordAudit({
      organizationId: orgId,
      unitId,
      actorTenantId: actorId.tenantId || null,
      actorAdminId: actorId.adminId || null,
      action: 'ASSIGN_UNIT_MEMBER',
      targetEntity: 'organization_unit_memberships',
      targetEntityId: dto.tenantId,
      details: { unitCode: unit.code, unitName: unit.name, unitRole: dto.unitRole },
    });

    return {
      status: 'success',
      message: `Anggota berhasil ditugaskan ke ruang kerja "${unit.name}" dengan peran ${dto.unitRole}.`,
    };
  }

  async revokeUnitMember(
    orgId: string,
    unitId: string,
    targetTenantId: string,
    actorId: { tenantId?: string; adminId?: string }
  ) {
    const [existing] = await db
      .select()
      .from(organizationUnitMemberships)
      .where(
        and(
          eq(organizationUnitMemberships.organizationId, orgId),
          eq(organizationUnitMemberships.unitId, unitId),
          eq(organizationUnitMemberships.tenantId, targetTenantId)
        )
      )
      .limit(1);

    if (!existing) {
      throw new NotFoundException('Keanggotaan pengguna pada Bidang/Unit ini tidak ditemukan.');
    }

    await db
      .update(organizationUnitMemberships)
      .set({
        status: InstitutionalMembershipStatus.REVOKED,
        updatedAt: new Date(),
      })
      .where(eq(organizationUnitMemberships.id, existing.id));

    await this.recordAudit({
      organizationId: orgId,
      unitId,
      actorTenantId: actorId.tenantId || null,
      actorAdminId: actorId.adminId || null,
      action: 'REVOKE_UNIT_MEMBER',
      targetEntity: 'organization_unit_memberships',
      targetEntityId: targetTenantId,
      details: { unitId, targetTenantId },
    });

    return {
      status: 'success',
      message: 'Akses pengguna ke ruang kerja Bidang/Unit ini telah dicabut.',
    };
  }

  async getOrganizationMembers(orgId: string): Promise<OrganizationMemberDto[]> {
    const memberRows = await db
      .select({
        membershipId: organizationMemberships.id,
        organizationId: organizationMemberships.organizationId,
        tenantId: organizationMemberships.tenantId,
        orgRole: organizationMemberships.orgRole,
        status: organizationMemberships.status,
        titleOrPosition: organizationMemberships.titleOrPosition,
        joinedAt: organizationMemberships.joinedAt,
        fullName: tenantMembers.fullName,
        email: tenantMembers.email,
        phoneNumber: tenantMembers.phoneNumber,
        partyAffiliation: tenantMembers.partyAffiliation,
        photoUrl: tenantMembers.photoUrl,
      })
      .from(organizationMemberships)
      .innerJoin(tenantMembers, eq(organizationMemberships.tenantId, tenantMembers.id))
      .where(eq(organizationMemberships.organizationId, orgId))
      .orderBy(asc(tenantMembers.fullName));

    const unitAssignmentRows = await db.execute(sql`
      SELECT
        um.tenant_id AS "tenantId",
        um.unit_id AS "unitId",
        u.code AS "unitCode",
        u.name AS "unitName",
        u.unit_type AS "unitType",
        pu.name AS "parentUnitName",
        um.unit_role AS "unitRole",
        um.status
      FROM organization_unit_memberships um
      INNER JOIN organization_units u ON um.unit_id = u.id
      LEFT JOIN organization_units pu ON u.parent_unit_id = pu.id
      WHERE um.organization_id = ${orgId}::uuid
        AND um.status = 'ACTIVE'
      ORDER BY u.unit_type ASC, u.name ASC;
    `);

    const unitAssignments = (((unitAssignmentRows as any)?.rows || unitAssignmentRows || []) as any[]);
    const byTenant = new Map<string, OrganizationMemberDto['assignedUnits']>();
    for (const ua of unitAssignments) {
      const list = byTenant.get(ua.tenantId) || [];
      list.push({
        unitId: ua.unitId,
        unitCode: ua.unitCode,
        unitName: ua.unitName,
        unitType: ua.unitType as OrganizationUnitType,
        parentUnitName: ua.parentUnitName || null,
        unitRole: ua.unitRole as OrganizationUnitMemberRole,
        status: ua.status as InstitutionalMembershipStatus,
      });
      byTenant.set(ua.tenantId, list);
    }

    return memberRows.map((m) => ({
      membershipId: m.membershipId,
      organizationId: m.organizationId,
      tenantId: m.tenantId,
      fullName: m.fullName,
      email: m.email,
      phoneNumber: m.phoneNumber,
      partyAffiliation: m.partyAffiliation,
      photoUrl: m.photoUrl,
      orgRole: m.orgRole as OrganizationMemberRole,
      status: m.status as InstitutionalMembershipStatus,
      titleOrPosition: m.titleOrPosition,
      joinedAt: m.joinedAt.toISOString(),
      assignedUnits: byTenant.get(m.tenantId) || [],
    }));
  }

  async listOfficialOrgSharedDocuments(orgId: string): Promise<InstitutionalScopedDocumentDto[]> {
    const rows = await db.execute(sql`
      SELECT
        ref.id AS "refId",
        ref.file_id AS "fileId",
        COALESCE(ref.custom_title, f.original_file_name) AS "title",
        f.original_file_name AS "originalFileName",
        f.mime_type AS "mimeType",
        f.file_size_bytes AS "fileSizeBytes",
        COALESCE(f.total_pages, 1) AS "totalPages",
        ref.category_tag AS "categoryTag",
        ref.privacy_scope AS "privacyScope",
        ref.organization_id AS "organizationId",
        ref.organization_unit_id AS "organizationUnitId",
        NULL::text AS "unitName",
        ref.uploaded_by_tenant_id AS "uploadedByTenantId",
        tm.full_name AS "uploadedByName",
        COALESCE(cs.chunk_count, 0)::integer AS "chunkCount",
        COALESCE(cs.token_count, 0)::integer AS "tokenCount",
        ref.created_at AS "createdAt"
      FROM datahub_document_refs ref
      INNER JOIN datahub_files f ON ref.file_id = f.id
      INNER JOIN tenant_members tm ON ref.uploaded_by_tenant_id = tm.id
      LEFT JOIN (
        SELECT file_id, COUNT(*)::integer AS chunk_count, COALESCE(SUM(token_count), 0)::integer AS token_count
        FROM datahub_document_chunks
        GROUP BY file_id
      ) cs ON f.id = cs.file_id
      WHERE ref.organization_id = ${orgId}::uuid
        AND ref.organization_unit_id IS NULL
        AND ref.privacy_scope = 'ORG_SHARED'
      ORDER BY ref.created_at DESC;
    `);

    const list = (((rows as any)?.rows || rows || []) as any[]);
    return list.map((r) => ({
      refId: r.refId,
      fileId: r.fileId,
      title: r.title,
      originalFileName: r.originalFileName,
      mimeType: r.mimeType,
      fileSizeBytes: Number(r.fileSizeBytes || 0),
      totalPages: Number(r.totalPages || 1),
      categoryTag: r.categoryTag,
      privacyScope: r.privacyScope as DatahubPrivacyScope,
      organizationId: r.organizationId,
      organizationUnitId: null,
      unitName: null,
      uploadedByTenantId: r.uploadedByTenantId,
      uploadedByName: r.uploadedByName,
      chunkCount: Number(r.chunkCount || 0),
      tokenCount: Number(r.tokenCount || 0),
      createdAt: new Date(r.createdAt).toISOString(),
    }));
  }

  async getMyWorkspaces(tenantId: string): Promise<MyWorkspacesResponseDto> {
    const [member] = await db
      .select({
        id: tenantMembers.id,
        fullName: tenantMembers.fullName,
        email: tenantMembers.email,
        legislativeLevel: tenantMembers.legislativeLevel,
        partyAffiliation: tenantMembers.partyAffiliation,
      })
      .from(tenantMembers)
      .where(eq(tenantMembers.id, tenantId))
      .limit(1);

    if (!member) {
      throw new NotFoundException('Profil akun tidak ditemukan.');
    }

    const orgRows = await db.execute(sql`
      SELECT
        o.id AS "organizationId",
        o.code AS "organizationCode",
        o.name AS "organizationName",
        o.legislative_level AS "legislativeLevel",
        o.region_name AS "regionName",
        om.org_role AS "orgRole",
        (
          SELECT c.status
          FROM organization_contracts c
          WHERE c.organization_id = o.id
          ORDER BY c.end_date DESC
          LIMIT 1
        ) AS "contractStatus"
      FROM organization_memberships om
      INNER JOIN organizations o ON om.organization_id = o.id
      WHERE om.tenant_id = ${tenantId}::uuid
        AND om.status = 'ACTIVE'
        AND o.status = 'ACTIVE'
      ORDER BY o.name ASC;
    `);

    const activeOrgs = (((orgRows as any)?.rows || orgRows || []) as any[]);
    const institutionalWorkspaces = [];

    for (const org of activeOrgs) {
      const unitRows = await db.execute(sql`
        SELECT
          u.id AS "unitId",
          u.parent_unit_id AS "parentUnitId",
          pu.name AS "parentUnitName",
          pu.unit_type AS "parentUnitType",
          u.code AS "unitCode",
          u.name AS "unitName",
          u.unit_type AS "unitType",
          um.unit_role AS "unitRole",
          u.focus_sectors AS "focusSectors",
          u.partner_opds AS "partnerOpds"
        FROM organization_unit_memberships um
        INNER JOIN organization_units u ON um.unit_id = u.id
        LEFT JOIN organization_units pu ON u.parent_unit_id = pu.id
        WHERE um.organization_id = ${org.organizationId}::uuid
          AND um.tenant_id = ${tenantId}::uuid
          AND um.status = 'ACTIVE'
          AND u.is_active = true
        ORDER BY u.unit_type ASC, u.name ASC;
      `);

      const units = (((unitRows as any)?.rows || unitRows || []) as any[]).map((u) => ({
        unitId: u.unitId,
        parentUnitId: u.parentUnitId || null,
        parentUnitName: u.parentUnitName || null,
        parentUnitType: (u.parentUnitType as OrganizationUnitType) || null,
        unitCode: u.unitCode,
        unitName: u.unitName,
        unitType: u.unitType as OrganizationUnitType,
        unitRole: u.unitRole as OrganizationUnitMemberRole,
        focusSectors: Array.isArray(u.focusSectors) ? u.focusSectors : [],
        partnerOpds: Array.isArray(u.partnerOpds) ? u.partnerOpds : [],
      }));

      institutionalWorkspaces.push({
        workspaceMode: WorkspaceMode.INSTITUTIONAL,
        organizationId: org.organizationId,
        organizationCode: org.organizationCode,
        organizationName: org.organizationName,
        legislativeLevel: org.legislativeLevel as LegislativeLevel,
        regionName: org.regionName,
        orgRole: org.orgRole as OrganizationMemberRole,
        contractStatus: (org.contractStatus as OrganizationContractStatus) || undefined,
        units,
      });
    }

    return {
      personalWorkspace: {
        workspaceMode: WorkspaceMode.PERSONAL,
        tenantId: member.id,
        fullName: member.fullName,
        email: member.email,
        legislativeLevel: member.legislativeLevel as LegislativeLevel,
        partyAffiliation: member.partyAffiliation,
      },
      institutionalWorkspaces,
    };
  }
}
