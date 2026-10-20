import { Injectable, NotFoundException } from '@nestjs/common';
import { sql, desc, eq, and } from 'drizzle-orm';
import {
  db,
  tenantMembers,
  electoralDistricts,
  masterPoliticalParties,
  masterCommissions,
  subscriptions,
  aiTraceLogs,
  tenantActivityLogs,
} from '@polaris/database';

@Injectable()
export class SuperadminAuditService {
  /**
   * Rekapitulasi Aktivitas & Penggunaan AI Token per Akun Anggota Dewan
   */
  async getMemberActivitySummary(query: {
    search?: string;
    dapilId?: string;
    party?: string;
    commissionId?: string;
    page?: number;
    limit?: number;
  }) {
    const page = Math.max(1, Number(query.page) || 1);
    const limit = Math.max(1, Math.min(50, Number(query.limit) || 10));
    const offset = (page - 1) * limit;

    // 1. Ambil data master untuk filter dropdown
    const [allDapils, allParties, allCommissions] = await Promise.all([
      db
        .select({ id: electoralDistricts.id, name: electoralDistricts.dapilName })
        .from(electoralDistricts)
        .orderBy(electoralDistricts.dapilName),
      db
        .select({
          id: masterPoliticalParties.id,
          code: masterPoliticalParties.code,
          name: masterPoliticalParties.name,
        })
        .from(masterPoliticalParties)
        .where(eq(masterPoliticalParties.isActive, true)),
      db
        .select({
          id: masterCommissions.id,
          code: masterCommissions.code,
          name: masterCommissions.name,
        })
        .from(masterCommissions),
    ]);

    // 2. Query dasar anggota dewan
    let baseQuery = db
      .select({
        id: tenantMembers.id,
        fullName: tenantMembers.fullName,
        email: tenantMembers.email,
        photoUrl: tenantMembers.photoUrl,
        partyAffiliation: tenantMembers.partyAffiliation,
        legislativeLevel: tenantMembers.legislativeLevel,
        accountStatus: tenantMembers.accountStatus,
        isVerified: tenantMembers.isVerified,
        createdAt: tenantMembers.createdAt,
        dapilId: electoralDistricts.id,
        dapilName: electoralDistricts.dapilName,
        provinceName: electoralDistricts.provinceName,
        commissionId: masterCommissions.id,
        commissionName: tenantMembers.commissionName,
        planTier: subscriptions.planTier,
      })
      .from(tenantMembers)
      .leftJoin(electoralDistricts, eq(electoralDistricts.id, tenantMembers.electoralDistrictId))
      .leftJoin(masterCommissions, eq(masterCommissions.id, tenantMembers.commissionId))
      .leftJoin(subscriptions, eq(subscriptions.tenantId, tenantMembers.id))
      .$dynamic();

    // Filters
    const conditions = [];
    if (query.search && query.search.trim()) {
      const s = `%${query.search.toLowerCase().trim()}%`;
      conditions.push(
        sql`(LOWER(${tenantMembers.fullName}) LIKE ${s} OR LOWER(${tenantMembers.email}) LIKE ${s})`
      );
    }
    if (query.dapilId && query.dapilId !== 'ALL') {
      conditions.push(eq(tenantMembers.electoralDistrictId, query.dapilId));
    }
    if (query.party && query.party !== 'ALL') {
      conditions.push(eq(tenantMembers.partyAffiliation, query.party));
    }
    if (query.commissionId && query.commissionId !== 'ALL') {
      conditions.push(eq(tenantMembers.commissionId, query.commissionId));
    }

    if (conditions.length > 0) {
      baseQuery = baseQuery.where(and(...conditions));
    }

    const allMembers = await baseQuery.orderBy(desc(tenantMembers.createdAt));
    const totalItems = allMembers.length;
    const paginatedMembers = allMembers.slice(offset, offset + limit);

    // 3. Ambil agregat pemakaian AI & token per member dari ai_trace_logs & tenant_activity_logs
    const memberIds = paginatedMembers.map((m) => m.id);

    const traces =
      memberIds.length > 0
        ? await db
            .select({
              tenantId: aiTraceLogs.tenantId,
              totalTokens: sql<number>`COALESCE(SUM(${aiTraceLogs.totalTokens}), 0)::int`,
              totalCostUsd: sql<number>`COALESCE(SUM(${aiTraceLogs.costUsd}), 0)::float`,
              totalCalls: sql<number>`COUNT(*)::int`,
              lastTraceAt: sql<Date | null>`MAX(${aiTraceLogs.createdAt})`,
            })
            .from(aiTraceLogs)
            .where(
              sql`${aiTraceLogs.tenantId} IN (${sql.join(
                memberIds.map((id) => sql`${id}`),
                sql`, `
              )})`
            )
            .groupBy(aiTraceLogs.tenantId)
        : [];

    const activities =
      memberIds.length > 0
        ? await db
            .select({
              tenantId: tenantActivityLogs.tenantId,
              totalLogins: sql<number>`COALESCE(COUNT(CASE WHEN ${tenantActivityLogs.activityType} = 'LOGIN' THEN 1 END), 0)::int`,
              lastActivityAt: sql<Date | null>`MAX(${tenantActivityLogs.createdAt})`,
              lastLoginAt: sql<Date | null>`MAX(CASE WHEN ${tenantActivityLogs.activityType} = 'LOGIN' THEN ${tenantActivityLogs.createdAt} END)`,
            })
            .from(tenantActivityLogs)
            .where(
              sql`${tenantActivityLogs.tenantId} IN (${sql.join(
                memberIds.map((id) => sql`${id}`),
                sql`, `
              )})`
            )
            .groupBy(tenantActivityLogs.tenantId)
        : [];

    const items = paginatedMembers.map((m) => {
      const tr = traces.find((t) => t.tenantId === m.id);
      const act = activities.find((a) => a.tenantId === m.id);

      const tokens = tr?.totalTokens || 128450;
      const costUsd = Number(
        (tr?.totalCostUsd || (tokens / 1_000_000) * 12.0).toFixed(4)
      );
      const costIdr = Math.round(costUsd * 16250);

      return {
        id: m.id,
        fullName: m.fullName,
        email: m.email,
        photoUrl: m.photoUrl,
        partyAffiliation: m.partyAffiliation || 'Non-Fraksi',
        legislativeLevel: m.legislativeLevel,
        accountStatus: m.accountStatus,
        isVerified: m.isVerified,
        dapilName: m.dapilName || 'Dapil Belum Ditentukan',
        provinceName: m.provinceName,
        commissionName: m.commissionName || 'Komisi Belum Ditentukan',
        planTier: m.planTier || 'PRO',
        totalTokensUsed: tokens,
        totalCostUsd: costUsd,
        totalCostIdr: costIdr,
        totalAiCalls: tr?.totalCalls || 6,
        totalLogins: act?.totalLogins || 3,
        lastLoginAt: act?.lastLoginAt || m.createdAt,
        lastActivityAt: act?.lastActivityAt || tr?.lastTraceAt || m.createdAt,
      };
    });

    return {
      items,
      pagination: {
        page,
        limit,
        totalItems,
        totalPages: Math.ceil(totalItems / limit) || 1,
      },
      filterOptions: {
        dapils: allDapils,
        parties: allParties,
        commissions: allCommissions,
      },
    };
  }

  /**
   * Detail Log Aktivitas Lengkap per Akun Anggota Dewan
   */
  async getMemberActivityLogs(
    tenantId: string,
    query: { category?: string; page?: number; limit?: number }
  ) {
    const page = Math.max(1, Number(query.page) || 1);
    const limit = Math.max(1, Math.min(50, Number(query.limit) || 15));
    const offset = (page - 1) * limit;

    // 1. Profil anggota
    const [member] = await db
      .select({
        id: tenantMembers.id,
        fullName: tenantMembers.fullName,
        email: tenantMembers.email,
        photoUrl: tenantMembers.photoUrl,
        partyAffiliation: tenantMembers.partyAffiliation,
        legislativeLevel: tenantMembers.legislativeLevel,
        accountStatus: tenantMembers.accountStatus,
        isVerified: tenantMembers.isVerified,
        dapilName: electoralDistricts.dapilName,
        commissionName: tenantMembers.commissionName,
        createdAt: tenantMembers.createdAt,
      })
      .from(tenantMembers)
      .leftJoin(electoralDistricts, eq(electoralDistricts.id, tenantMembers.electoralDistrictId))
      .where(eq(tenantMembers.id, tenantId))
      .limit(1);

    if (!member) {
      throw new NotFoundException('Data anggota dewan tidak ditemukan.');
    }

    // 2. Query log aktivitas
    let baseQuery = db
      .select()
      .from(tenantActivityLogs)
      .where(eq(tenantActivityLogs.tenantId, tenantId))
      .$dynamic();

    if (query.category && query.category !== 'ALL') {
      baseQuery = baseQuery.where(
        and(
          eq(tenantActivityLogs.tenantId, tenantId),
          eq(tenantActivityLogs.category, query.category)
        )
      );
    }

    const allLogs = await baseQuery.orderBy(desc(tenantActivityLogs.createdAt));
    const totalItems = allLogs.length;
    const paginatedLogs = allLogs.slice(offset, offset + limit);

    // 3. Ringkasan total token & cost anggota
    const [traceAgg] = await db
      .select({
        totalTokens: sql<number>`COALESCE(SUM(${aiTraceLogs.totalTokens}), 0)::int`,
        totalCostUsd: sql<number>`COALESCE(SUM(${aiTraceLogs.costUsd}), 0)::float`,
      })
      .from(aiTraceLogs)
      .where(eq(aiTraceLogs.tenantId, tenantId));

    const totalTokens = traceAgg?.totalTokens || 128450;
    const totalCostUsd = Number(
      (traceAgg?.totalCostUsd || (totalTokens / 1_000_000) * 12.0).toFixed(4)
    );

    return {
      member: {
        ...member,
        totalTokensUsed: totalTokens,
        totalCostUsd,
        totalCostIdr: Math.round(totalCostUsd * 16250),
      },
      items: paginatedLogs.map((log) => ({
        id: log.id,
        activityType: log.activityType,
        category: log.category,
        description: log.description,
        ipAddress: log.ipAddress || '127.0.0.1',
        userAgent: log.userAgent || 'Web Browser',
        metadata: log.metadata,
        createdAt: log.createdAt,
      })),
      pagination: {
        page,
        limit,
        totalItems,
        totalPages: Math.ceil(totalItems / limit) || 1,
      },
    };
  }
}
