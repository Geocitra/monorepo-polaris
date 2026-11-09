import { Injectable, NotFoundException } from '@nestjs/common';
import { sql, desc, eq, and, ilike } from 'drizzle-orm';
import {
  db,
  tenantMembers,
  electoralDistricts,
  masterPoliticalParties,
  masterCommissions,
  subscriptions,
  aiTraceLogs,
  tenantActivityLogs,
  tenantQuotaWallets,
  tenantQuotaTransactions,
  systemAdmins,
} from '@polaris/database';
import { DynamicExchangeRate, AiCostCalculator } from '@polaris/core-domain';

@Injectable()
export class SuperadminAuditService {
  /**
   * Rekapitulasi Aktivitas & Penggunaan AI Token per Akun Anggota Dewan
   * Terpisah secara presisi antara OpenAI dan Google Gemini dalam 100% Rupiah (Rp).
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

    // 3. Ambil agregat pemakaian AI & token per member dari ai_trace_logs & tenant_activity_logs & tenant_quota_wallets
    const memberIds = paginatedMembers.map((m) => m.id);

    const [traces, activities, wallets, fxSnapshot] = await Promise.all([
      memberIds.length > 0
        ? db
            .select({
              tenantId: aiTraceLogs.tenantId,
              totalTokens: sql<number>`COALESCE(SUM(${aiTraceLogs.totalTokens}), 0)::int`,
              totalCostIdr: sql<number>`COALESCE(SUM(${aiTraceLogs.costIdr}), 0)::bigint`,
              totalCostUsd: sql<number>`COALESCE(SUM(${aiTraceLogs.costUsd}), 0)::float`,
              totalCalls: sql<number>`COUNT(*)::int`,
              lastTraceAt: sql<Date | null>`MAX(${aiTraceLogs.createdAt})`,
              openaiTotalTokens: sql<number>`COALESCE(SUM(CASE WHEN ${aiTraceLogs.provider} = 'OPENAI' THEN ${aiTraceLogs.totalTokens} ELSE 0 END), 0)::int`,
              openaiImageCalls: sql<number>`COALESCE(SUM(CASE WHEN ${aiTraceLogs.provider} = 'OPENAI' THEN ${aiTraceLogs.imageCalls} ELSE 0 END), 0)::int`,
              openaiCostIdr: sql<number>`COALESCE(SUM(CASE WHEN ${aiTraceLogs.provider} = 'OPENAI' THEN ${aiTraceLogs.costIdr} ELSE 0 END), 0)::bigint`,
              geminiTotalTokens: sql<number>`COALESCE(SUM(CASE WHEN ${aiTraceLogs.provider} = 'GEMINI' THEN ${aiTraceLogs.totalTokens} ELSE 0 END), 0)::int`,
              geminiImageCalls: sql<number>`COALESCE(SUM(CASE WHEN ${aiTraceLogs.provider} = 'GEMINI' THEN ${aiTraceLogs.imageCalls} ELSE 0 END), 0)::int`,
              geminiCostIdr: sql<number>`COALESCE(SUM(CASE WHEN ${aiTraceLogs.provider} = 'GEMINI' THEN ${aiTraceLogs.costIdr} ELSE 0 END), 0)::bigint`,
            })
            .from(aiTraceLogs)
            .where(
              sql`${aiTraceLogs.tenantId} IN (${sql.join(
                memberIds.map((id) => sql`${id}`),
                sql`, `
              )})`
            )
            .groupBy(aiTraceLogs.tenantId)
        : [],
      memberIds.length > 0
        ? db
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
        : [],
      memberIds.length > 0
        ? db
            .select({
              tenantId: tenantQuotaWallets.tenantId,
              remainingQuota: tenantQuotaWallets.remainingQuota,
              totalQuotaAllocated: tenantQuotaWallets.totalQuotaAllocated,
              weeklyAllowanceLimit: tenantQuotaWallets.weeklyAllowanceLimit,
            })
            .from(tenantQuotaWallets)
            .where(
              sql`${tenantQuotaWallets.tenantId} IN (${sql.join(
                memberIds.map((id) => sql`${id}`),
                sql`, `
              )})`
            )
        : [],
      DynamicExchangeRate.getLiveUsdToIdrSnapshot(),
    ]);

    const items = paginatedMembers.map((m) => {
      const tr = traces.find((t) => t.tenantId === m.id);
      const act = activities.find((a) => a.tenantId === m.id);
      const wal = wallets.find((w) => w.tenantId === m.id);

      const tokens = Number(tr?.totalTokens || 0);
      const costIdr = Number(tr?.totalCostIdr || 0);
      const costUsd = Number(tr?.totalCostUsd || 0);

      const openaiTotalTokens = Number(tr?.openaiTotalTokens || 0);
      const openaiImageCalls = Number(tr?.openaiImageCalls || 0);
      const openaiCostIdr = Number(tr?.openaiCostIdr || 0);

      const geminiTotalTokens = Number(tr?.geminiTotalTokens || 0);
      const geminiImageCalls = Number(tr?.geminiImageCalls || 0);
      const geminiCostIdr = Number(tr?.geminiCostIdr || 0);

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
        remainingQuota: wal?.remainingQuota ?? 0,
        totalQuotaAllocated: wal?.totalQuotaAllocated ?? 12,
        weeklyAllowanceLimit: wal?.weeklyAllowanceLimit ?? 3,
        totalTokensUsed: tokens,
        totalCostUsd: costUsd,
        totalCostIdr: costIdr,
        totalAiCalls: Number(tr?.totalCalls || 0),
        openaiTotalTokens,
        openaiImageCalls,
        openaiCostIdr,
        geminiTotalTokens,
        geminiImageCalls,
        geminiCostIdr,
        totalLogins: Number(act?.totalLogins || 0),
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
      fxRateApplied: fxSnapshot.rateIdrPerUsd,
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

    // 2. Query log aktivitas dari tenantActivityLogs
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

    // 3. Ringkasan total token & cost anggota riil dari ai_trace_logs
    const [traceAgg] = await db
      .select({
        totalTokens: sql<number>`COALESCE(SUM(${aiTraceLogs.totalTokens}), 0)::int`,
        totalCostIdr: sql<number>`COALESCE(SUM(${aiTraceLogs.costIdr}), 0)::bigint`,
        totalCostUsd: sql<number>`COALESCE(SUM(${aiTraceLogs.costUsd}), 0)::float`,
        openaiTokens: sql<number>`COALESCE(SUM(CASE WHEN ${aiTraceLogs.provider} = 'OPENAI' THEN ${aiTraceLogs.totalTokens} ELSE 0 END), 0)::int`,
        openaiCostIdr: sql<number>`COALESCE(SUM(CASE WHEN ${aiTraceLogs.provider} = 'OPENAI' THEN ${aiTraceLogs.costIdr} ELSE 0 END), 0)::bigint`,
        geminiTokens: sql<number>`COALESCE(SUM(CASE WHEN ${aiTraceLogs.provider} = 'GEMINI' THEN ${aiTraceLogs.totalTokens} ELSE 0 END), 0)::int`,
        geminiCostIdr: sql<number>`COALESCE(SUM(CASE WHEN ${aiTraceLogs.provider} = 'GEMINI' THEN ${aiTraceLogs.costIdr} ELSE 0 END), 0)::bigint`,
      })
      .from(aiTraceLogs)
      .where(eq(aiTraceLogs.tenantId, tenantId));

    const totalTokens = Number(traceAgg?.totalTokens || 0);
    const totalCostIdr = Number(traceAgg?.totalCostIdr || 0);
    const totalCostUsd = Number(traceAgg?.totalCostUsd || 0);

    return {
      member: {
        ...member,
        totalTokensUsed: totalTokens,
        totalCostUsd,
        totalCostIdr,
        openaiTokens: Number(traceAgg?.openaiTokens || 0),
        openaiCostIdr: Number(traceAgg?.openaiCostIdr || 0),
        geminiTokens: Number(traceAgg?.geminiTokens || 0),
        geminiCostIdr: Number(traceAgg?.geminiCostIdr || 0),
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

  /**
   * Detail Lengkap Audit Aktivitas AI per User:
   * Menyajikan pemisahan token & biaya OpenAI vs Gemini, rincian per kegiatan,
   * rincian per operator, log per request, dan rekonsiliasi transaksi kuota.
   */
  async getMemberAiActivityDetail(tenantId: string) {
    // 1. Profil Member & Langganan
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
        planTier: subscriptions.planTier,
      })
      .from(tenantMembers)
      .leftJoin(electoralDistricts, eq(electoralDistricts.id, tenantMembers.electoralDistrictId))
      .leftJoin(subscriptions, eq(subscriptions.tenantId, tenantMembers.id))
      .where(eq(tenantMembers.id, tenantId))
      .limit(1);

    if (!member) {
      throw new NotFoundException('Data anggota dewan tidak ditemukan.');
    }

    // 2. Saldo Dompet Kuota & Jatah Mingguan
    const [wallet] = await db
      .select()
      .from(tenantQuotaWallets)
      .where(eq(tenantQuotaWallets.tenantId, tenantId))
      .limit(1);

    // Hitung jatah mingguan terpakai di periode ISO week saat ini
    const now = new Date();
    const currentWeek = `${now.getFullYear()}-W${String(Math.ceil((now.getDate() + 6) / 7)).padStart(2, '0')}`;
    const [weekUsage] = await db
      .select({
        weeklyUsed: sql<number>`COALESCE(ABS(SUM(CASE WHEN ${tenantQuotaTransactions.amountDelta} < 0 THEN ${tenantQuotaTransactions.amountDelta} ELSE 0 END)), 0)::int`,
      })
      .from(tenantQuotaTransactions)
      .where(
        and(
          eq(tenantQuotaTransactions.tenantId, tenantId),
          eq(tenantQuotaTransactions.weeklyQuotaPeriod, currentWeek),
        )
      );

    // 3. Provider Breakdown (OpenAI vs Gemini)
    const [providerAgg] = await db
      .select({
        openaiInputTokens: sql<number>`COALESCE(SUM(CASE WHEN ${aiTraceLogs.provider} = 'OPENAI' THEN ${aiTraceLogs.inputTokens} ELSE 0 END), 0)::int`,
        openaiOutputTokens: sql<number>`COALESCE(SUM(CASE WHEN ${aiTraceLogs.provider} = 'OPENAI' THEN ${aiTraceLogs.outputTokens} ELSE 0 END), 0)::int`,
        openaiTotalTokens: sql<number>`COALESCE(SUM(CASE WHEN ${aiTraceLogs.provider} = 'OPENAI' THEN ${aiTraceLogs.totalTokens} ELSE 0 END), 0)::int`,
        openaiImageCalls: sql<number>`COALESCE(SUM(CASE WHEN ${aiTraceLogs.provider} = 'OPENAI' THEN ${aiTraceLogs.imageCalls} ELSE 0 END), 0)::int`,
        openaiCostIdr: sql<number>`COALESCE(SUM(CASE WHEN ${aiTraceLogs.provider} = 'OPENAI' THEN ${aiTraceLogs.costIdr} ELSE 0 END), 0)::bigint`,
        geminiInputTokens: sql<number>`COALESCE(SUM(CASE WHEN ${aiTraceLogs.provider} = 'GEMINI' THEN ${aiTraceLogs.inputTokens} ELSE 0 END), 0)::int`,
        geminiOutputTokens: sql<number>`COALESCE(SUM(CASE WHEN ${aiTraceLogs.provider} = 'GEMINI' THEN ${aiTraceLogs.outputTokens} ELSE 0 END), 0)::int`,
        geminiTotalTokens: sql<number>`COALESCE(SUM(CASE WHEN ${aiTraceLogs.provider} = 'GEMINI' THEN ${aiTraceLogs.totalTokens} ELSE 0 END), 0)::int`,
        geminiImageCalls: sql<number>`COALESCE(SUM(CASE WHEN ${aiTraceLogs.provider} = 'GEMINI' THEN ${aiTraceLogs.imageCalls} ELSE 0 END), 0)::int`,
        geminiCostIdr: sql<number>`COALESCE(SUM(CASE WHEN ${aiTraceLogs.provider} = 'GEMINI' THEN ${aiTraceLogs.costIdr} ELSE 0 END), 0)::bigint`,
        totalCostIdr: sql<number>`COALESCE(SUM(${aiTraceLogs.costIdr}), 0)::bigint`,
      })
      .from(aiTraceLogs)
      .where(eq(aiTraceLogs.tenantId, tenantId));

    // 4. Breakdown per Kegiatan (Activity Type)
    const rawActivityRows = await db
      .select({
        activityType: sql<string>`COALESCE(${aiTraceLogs.activityType}, ${aiTraceLogs.operation})`,
        totalCalls: sql<number>`COUNT(*)::int`,
        openaiTokens: sql<number>`COALESCE(SUM(CASE WHEN ${aiTraceLogs.provider} = 'OPENAI' THEN ${aiTraceLogs.totalTokens} ELSE 0 END), 0)::int`,
        geminiTokens: sql<number>`COALESCE(SUM(CASE WHEN ${aiTraceLogs.provider} = 'GEMINI' THEN ${aiTraceLogs.totalTokens} ELSE 0 END), 0)::int`,
        imageCalls: sql<number>`COALESCE(SUM(${aiTraceLogs.imageCalls}), 0)::int`,
        totalCostIdr: sql<number>`COALESCE(SUM(${aiTraceLogs.costIdr}), 0)::bigint`,
      })
      .from(aiTraceLogs)
      .where(eq(aiTraceLogs.tenantId, tenantId))
      .groupBy(sql`COALESCE(${aiTraceLogs.activityType}, ${aiTraceLogs.operation})`);

    const activityLabels: Record<string, string> = {
      STUDIO_ARTICLE_GENERATION: 'Pembuatan Naskah Artikel (GPT-4o 5 Bab)',
      STUDIO_INFOGRAPHIC_GENERATION: 'Pembuatan Poster & Infografis (Imagen 3 / DALL-E)',
      POSTER_REVISION: 'Revisi & Polishing Visual (Gemini Flash Pass)',
      VISION_CRITIC: 'Inspeksi Kualitas Visual (Multimodal Vision Critic)',
      AUTONOMOUS_RESEARCH: 'Riset Otonom & Pencarian Fakta Lapangan',
      WHATSAPP_BOT_BRIEF: 'Chat Bot WhatsApp (Intake & Klasifikasi Tiket)',
      PUBLIC_CHAT_CONCIERGE: 'Chat Bot Web Publik (Concierge Aspirasi)',
      CIVIC_ASSISTANT_QUERY: 'Chat Bot Tanya Dewan (Civic Assistant Warga)',
      VISION_OCR: 'Ekstraksi Teks Lampiran Dokumen (Vision OCR)',
    };

    const activityBreakdown = rawActivityRows.map((r) => ({
      activityType: r.activityType,
      label: activityLabels[r.activityType] || r.activityType,
      totalCalls: Number(r.totalCalls || 0),
      openaiTokens: Number(r.openaiTokens || 0),
      geminiTokens: Number(r.geminiTokens || 0),
      imageCalls: Number(r.imageCalls || 0),
      totalCostIdr: Number(r.totalCostIdr || 0),
    }));

    // 5. Breakdown per Operator (Siapa operator yang mengeksekusi)
    const rawOperatorRows = await db
      .select({
        operatorId: aiTraceLogs.operatorId,
        operatorName: systemAdmins.fullName,
        totalRequests: sql<number>`COUNT(*)::int`,
        costIdr: sql<number>`COALESCE(SUM(${aiTraceLogs.costIdr}), 0)::bigint`,
      })
      .from(aiTraceLogs)
      .leftJoin(systemAdmins, eq(systemAdmins.id, aiTraceLogs.operatorId))
      .where(eq(aiTraceLogs.tenantId, tenantId))
      .groupBy(aiTraceLogs.operatorId, systemAdmins.fullName);

    const operatorBreakdown = rawOperatorRows.map((op) => ({
      operatorId: op.operatorId || null,
      operatorName: op.operatorName || (op.operatorId ? 'Operator Anonim' : 'Langsung oleh Dewan (Self-Service)'),
      totalRequests: Number(op.totalRequests || 0),
      costIdr: Number(op.costIdr || 0),
    }));

    // 6. Recent AI Traces (30 Log Terakhir dengan detail per request)
    const recentTracesRaw = await db
      .select({
        id: aiTraceLogs.id,
        traceId: aiTraceLogs.traceId,
        tenantId: aiTraceLogs.tenantId,
        operatorId: aiTraceLogs.operatorId,
        operatorName: systemAdmins.fullName,
        publicationId: aiTraceLogs.publicationId,
        ledgerId: aiTraceLogs.ledgerId,
        channel: aiTraceLogs.channel,
        activityType: aiTraceLogs.activityType,
        requestId: aiTraceLogs.requestId,
        provider: aiTraceLogs.provider,
        operation: aiTraceLogs.operation,
        model: aiTraceLogs.model,
        inputTokens: aiTraceLogs.inputTokens,
        outputTokens: aiTraceLogs.outputTokens,
        totalTokens: aiTraceLogs.totalTokens,
        imageCalls: aiTraceLogs.imageCalls,
        latencyMs: aiTraceLogs.latencyMs,
        costUsd: aiTraceLogs.costUsd,
        fxRateApplied: aiTraceLogs.fxRateApplied,
        costIdr: aiTraceLogs.costIdr,
        visitorIpHash: aiTraceLogs.visitorIpHash,
        metadata: aiTraceLogs.metadata,
        status: aiTraceLogs.status,
        errorMessage: aiTraceLogs.errorMessage,
        createdAt: aiTraceLogs.createdAt,
      })
      .from(aiTraceLogs)
      .leftJoin(systemAdmins, eq(systemAdmins.id, aiTraceLogs.operatorId))
      .where(eq(aiTraceLogs.tenantId, tenantId))
      .orderBy(desc(aiTraceLogs.createdAt))
      .limit(30);

    const recentTraces = recentTracesRaw.map((t) => ({
      id: t.id,
      traceId: t.traceId,
      tenantId: t.tenantId,
      tenantName: member.fullName,
      operatorId: t.operatorId,
      operatorName: t.operatorName || null,
      publicationId: t.publicationId,
      ledgerId: t.ledgerId,
      channel: t.channel || 'WEB_STUDIO',
      activityType: t.activityType || t.operation,
      requestId: t.requestId,
      provider: t.provider,
      operation: t.operation,
      model: t.model,
      inputTokens: Number(t.inputTokens || 0),
      outputTokens: Number(t.outputTokens || 0),
      totalTokens: Number(t.totalTokens || 0),
      imageCalls: Number(t.imageCalls || 0),
      latencyMs: Number(t.latencyMs || 0),
      costUsd: Number(t.costUsd || 0),
      fxRateApplied: Number(t.fxRateApplied || 16350),
      costIdr: Number(t.costIdr || 0),
      visitorIpHash: t.visitorIpHash,
      metadata: t.metadata as Record<string, any> | null,
      status: t.status,
      errorMessage: t.errorMessage,
      createdAt: t.createdAt ? new Date(t.createdAt).toISOString() : new Date().toISOString(),
    }));

    // 7. Recent Quota Transactions (30 Transaksi Kuota Terakhir)
    const recentTransactionsRaw = await db
      .select({
        id: tenantQuotaTransactions.id,
        tenantId: tenantQuotaTransactions.tenantId,
        briefId: tenantQuotaTransactions.briefId,
        publicationId: tenantQuotaTransactions.publicationId,
        ledgerId: tenantQuotaTransactions.ledgerId,
        operatorId: tenantQuotaTransactions.operatorId,
        operatorName: systemAdmins.fullName,
        invoiceId: tenantQuotaTransactions.invoiceId,
        channel: tenantQuotaTransactions.channel,
        activityType: tenantQuotaTransactions.activityType,
        requestId: tenantQuotaTransactions.requestId,
        referenceCode: tenantQuotaTransactions.referenceCode,
        transactionType: tenantQuotaTransactions.transactionType,
        amountDelta: tenantQuotaTransactions.amountDelta,
        balanceAfter: tenantQuotaTransactions.balanceAfter,
        notes: tenantQuotaTransactions.notes,
        createdAt: tenantQuotaTransactions.createdAt,
      })
      .from(tenantQuotaTransactions)
      .leftJoin(systemAdmins, eq(systemAdmins.id, tenantQuotaTransactions.operatorId))
      .where(eq(tenantQuotaTransactions.tenantId, tenantId))
      .orderBy(desc(tenantQuotaTransactions.createdAt))
      .limit(30);

    const recentTransactions = recentTransactionsRaw.map((tx) => ({
      id: tx.id,
      tenantId: tx.tenantId,
      briefId: tx.briefId,
      publicationId: tx.publicationId,
      ledgerId: tx.ledgerId,
      operatorId: tx.operatorId,
      operatorName: tx.operatorName || null,
      invoiceId: tx.invoiceId,
      channel: tx.channel,
      activityType: tx.activityType,
      requestId: tx.requestId,
      referenceCode: tx.referenceCode,
      transactionType: tx.transactionType,
      amountDelta: Number(tx.amountDelta),
      balanceAfter: Number(tx.balanceAfter),
      notes: tx.notes,
      createdAt: tx.createdAt ? new Date(tx.createdAt).toISOString() : new Date().toISOString(),
    }));

    return {
      member: {
        id: member.id,
        fullName: member.fullName,
        email: member.email,
        partyAffiliation: member.partyAffiliation || 'Non-Fraksi',
        legislativeLevel: member.legislativeLevel,
        dapilName: member.dapilName || 'Dapil Belum Ditentukan',
        commissionName: member.commissionName || 'Komisi Belum Ditentukan',
        accountStatus: member.accountStatus,
        isVerified: member.isVerified,
        planTier: member.planTier || 'PRO',
        photoUrl: member.photoUrl,
      },
      quota: {
        remainingQuota: wallet?.remainingQuota ?? 0,
        totalQuotaAllocated: wallet?.totalQuotaAllocated ?? 12,
        weeklyAllowanceLimit: wallet?.weeklyAllowanceLimit ?? 3,
        weeklyUsed: Number(weekUsage?.weeklyUsed || 0),
      },
      providerBreakdown: {
        openai: {
          inputTokens: Number(providerAgg?.openaiInputTokens || 0),
          outputTokens: Number(providerAgg?.openaiOutputTokens || 0),
          totalTokens: Number(providerAgg?.openaiTotalTokens || 0),
          imageCalls: Number(providerAgg?.openaiImageCalls || 0),
          costIdr: Number(providerAgg?.openaiCostIdr || 0),
        },
        gemini: {
          inputTokens: Number(providerAgg?.geminiInputTokens || 0),
          outputTokens: Number(providerAgg?.geminiOutputTokens || 0),
          totalTokens: Number(providerAgg?.geminiTotalTokens || 0),
          imageCalls: Number(providerAgg?.geminiImageCalls || 0),
          costIdr: Number(providerAgg?.geminiCostIdr || 0),
        },
        totalCostIdr: Number(providerAgg?.totalCostIdr || 0),
      },
      activityBreakdown,
      operatorBreakdown,
      recentTraces,
      recentTransactions,
    };
  }

  /**
   * Global Audit Log Query untuk Facade Superadmin
   */
  async getAuditLogs(query: {
    tenantId?: string;
    category?: string;
    activityType?: string;
    search?: string;
    startDate?: string;
    endDate?: string;
    page?: number;
    limit?: number;
  }) {
    const page = Math.max(1, Number(query.page) || 1);
    const limit = Math.max(1, Math.min(100, Number(query.limit) || 20));
    const offset = (page - 1) * limit;

    let baseQuery = db
      .select({
        id: tenantActivityLogs.id,
        tenantId: tenantActivityLogs.tenantId,
        tenantName: tenantMembers.fullName,
        party: tenantMembers.partyAffiliation,
        activityType: tenantActivityLogs.activityType,
        category: tenantActivityLogs.category,
        description: tenantActivityLogs.description,
        ipAddress: tenantActivityLogs.ipAddress,
        userAgent: tenantActivityLogs.userAgent,
        metadata: tenantActivityLogs.metadata,
        createdAt: tenantActivityLogs.createdAt,
      })
      .from(tenantActivityLogs)
      .leftJoin(tenantMembers, eq(tenantMembers.id, tenantActivityLogs.tenantId))
      .$dynamic();

    const conditions = [];
    if (query.tenantId) conditions.push(eq(tenantActivityLogs.tenantId, query.tenantId));
    if (query.category && query.category !== 'ALL') conditions.push(eq(tenantActivityLogs.category, query.category));
    if (query.activityType) conditions.push(eq(tenantActivityLogs.activityType, query.activityType));
    if (query.search) conditions.push(ilike(tenantActivityLogs.description, `%${query.search}%`));

    if (conditions.length > 0) {
      baseQuery = baseQuery.where(and(...conditions));
    }

    const [totalRes] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(tenantActivityLogs)
      .where(conditions.length > 0 ? and(...conditions) : undefined);

    const items = await baseQuery.orderBy(desc(tenantActivityLogs.createdAt)).limit(limit).offset(offset);
    const totalItems = totalRes?.count || 0;

    return {
      items,
      pagination: {
        page,
        limit,
        totalItems,
        totalPages: Math.ceil(totalItems / limit) || 1,
      },
    };
  }
}
