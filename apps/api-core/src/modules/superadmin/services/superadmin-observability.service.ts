import { Injectable, BadRequestException, Optional, Logger } from '@nestjs/common';
import { eq, desc, sql, and, inArray } from 'drizzle-orm';
import {
  db,
  tenantMembers,
  subscriptions,
  tenantQuotaLedgers,
  aiTraceLogs,
  platformTokenPools,
  platformTopupHistories,
  contentPublications,
  mediaAssets,
} from '@polaris/database';
import { PlatformTokenPool, CircuitState } from '@polaris/core-domain';
import { AiTelemetryService } from '@polaris/ai-engine';
import { TopupTokenPoolDto } from '../dto/superadmin.dto.js';
import { TokenCircuitBreakerService } from '../../billing/token-circuit-breaker.service.js';
import { SuperadminDashboardService } from './superadmin-dashboard.service.js';

const USD_TO_IDR_RATE = 16250;

@Injectable()
export class SuperadminObservabilityService {
  private readonly logger = new Logger(SuperadminObservabilityService.name);

  constructor(
    private readonly dashboardService: SuperadminDashboardService,
    @Optional() private readonly circuitBreakerService?: TokenCircuitBreakerService,
  ) {}

  /**
   * AI Observability & Langfuse Telemetry Stats (100% Real-Time Database & Telemetry Aggregation)
   */
  async getAiObservability() {
    const tenants = await db
      .select({
        id: tenantMembers.id,
        fullName: tenantMembers.fullName,
        email: tenantMembers.email,
        partyAffiliation: tenantMembers.partyAffiliation,
        planTier: subscriptions.planTier,
        status: subscriptions.status,
      })
      .from(tenantMembers)
      .leftJoin(subscriptions, eq(subscriptions.tenantId, tenantMembers.id));

    const rlsCountsMap = new Map<string, { publications: number; media: number }>();
    let totalArticlesGen = 0;
    let totalDalleGen = 0;
    for (const tenant of tenants) {
      const counts = await this.dashboardService.getTenantRlsCounts(tenant.id);
      rlsCountsMap.set(tenant.id, { publications: counts.publications, media: counts.media });
      totalArticlesGen += counts.publications;
      totalDalleGen += counts.media;
    }

    // 1. Agregasi Global Riil dari ai_trace_logs
    const [globalTraceAgg] = await db
      .select({
        totalTokens: sql<number>`COALESCE(SUM(${aiTraceLogs.totalTokens}), 0)::bigint`,
        totalCostUsd: sql<number>`COALESCE(SUM(${aiTraceLogs.costUsd}), 0)::float`,
        totalCalls: sql<number>`COUNT(*)::int`,
        successfulCalls: sql<number>`COUNT(*) FILTER (WHERE ${aiTraceLogs.status} = 'SUCCESS')::int`,
        avgLatencyMs: sql<number>`COALESCE(AVG(${aiTraceLogs.latencyMs}), 0)::float`,
      })
      .from(aiTraceLogs);

    // 2. Agregasi Per-Model Riil dari ai_trace_logs
    const modelTraceRows = await db
      .select({
        model: aiTraceLogs.model,
        tokens: sql<number>`COALESCE(SUM(${aiTraceLogs.totalTokens}), 0)::bigint`,
        calls: sql<number>`COUNT(*)::int`,
        successCalls: sql<number>`COUNT(*) FILTER (WHERE ${aiTraceLogs.status} = 'SUCCESS')::int`,
        costUsd: sql<number>`COALESCE(SUM(${aiTraceLogs.costUsd}), 0)::float`,
        avgLatencyMs: sql<number>`COALESCE(AVG(${aiTraceLogs.latencyMs}), 0)::float`,
      })
      .from(aiTraceLogs)
      .groupBy(aiTraceLogs.model);

    // 3. Agregasi Per-Tenant Riil dari ai_trace_logs & tenant_quota_ledgers
    const tenantTraceRows = await db
      .select({
        tenantId: aiTraceLogs.tenantId,
        tokens: sql<number>`COALESCE(SUM(${aiTraceLogs.totalTokens}), 0)::bigint`,
        costUsd: sql<number>`COALESCE(SUM(${aiTraceLogs.costUsd}), 0)::float`,
        calls: sql<number>`COUNT(*)::int`,
      })
      .from(aiTraceLogs)
      .where(sql`${aiTraceLogs.tenantId} IS NOT NULL`)
      .groupBy(aiTraceLogs.tenantId);

    const tenantTraceMap = new Map(
      tenantTraceRows.map((r) => [
        r.tenantId as string,
        {
          tokens: Number(r.tokens || 0),
          costUsd: Number(r.costUsd || 0),
          calls: Number(r.calls || 0),
        },
      ])
    );

    const ledgerAggRows = await db
      .select({
        tenantId: tenantQuotaLedgers.tenantId,
        articleLimit: sql<number>`MAX(${tenantQuotaLedgers.articleLimit})::int`,
        articleUsed: sql<number>`COALESCE(SUM(${tenantQuotaLedgers.articleUsed}), 0)::int`,
        dalleLimit: sql<number>`MAX(${tenantQuotaLedgers.dalleLimit})::int`,
        dalleUsed: sql<number>`COALESCE(SUM(${tenantQuotaLedgers.dalleUsed}), 0)::int`,
        totalTokensConsumed: sql<number>`COALESCE(SUM(${tenantQuotaLedgers.totalTokensConsumed}), 0)::bigint`,
        estimatedCostUsd: sql<number>`COALESCE(SUM(${tenantQuotaLedgers.estimatedCostUsd}), 0)::float`,
      })
      .from(tenantQuotaLedgers)
      .groupBy(tenantQuotaLedgers.tenantId);

    const ledgerMap = new Map(
      ledgerAggRows.map((l) => [
        l.tenantId,
        {
          articleLimit: Number(l.articleLimit || 0),
          articleUsed: Number(l.articleUsed || 0),
          dalleLimit: Number(l.dalleLimit || 0),
          dalleUsed: Number(l.dalleUsed || 0),
          totalTokensConsumed: Number(l.totalTokensConsumed || 0),
          estimatedCostUsd: Number(l.estimatedCostUsd || 0),
        },
      ])
    );

    const ledgerTotalTokens = ledgerAggRows.reduce((acc, l) => acc + Number(l.totalTokensConsumed || 0), 0);
    const ledgerTotalCostUsd = ledgerAggRows.reduce((acc, l) => acc + Number(l.estimatedCostUsd || 0), 0);

    const totalTokens = Math.max(Number(globalTraceAgg?.totalTokens || 0), ledgerTotalTokens);
    const rawTotalCostUsd = Math.max(Number(globalTraceAgg?.totalCostUsd || 0), ledgerTotalCostUsd);
    const totalCostUsd = Number(rawTotalCostUsd.toFixed(4));
    const totalCostIdr = Math.round(totalCostUsd * USD_TO_IDR_RATE);
    const totalGenerations = Number(globalTraceAgg?.successfulCalls || 0) || (totalArticlesGen + totalDalleGen);
    const avgLatencySeconds = Number(((Number(globalTraceAgg?.avgLatencyMs || 0)) / 1000).toFixed(2));

    const tenantBreakdowns = tenants.map((t) => {
      const ledger = ledgerMap.get(t.id);
      const traceStat = tenantTraceMap.get(t.id);
      const rlsCounts = rlsCountsMap.get(t.id) || { publications: 0, media: 0 };

      const usedArt = Math.max(ledger?.articleUsed ?? 0, rlsCounts.publications);
      const limitArt = ledger?.articleLimit && ledger.articleLimit > 0 ? ledger.articleLimit : 30;
      const usedImg = Math.max(ledger?.dalleUsed ?? 0, rlsCounts.media);
      const limitImg = ledger?.dalleLimit && ledger.dalleLimit > 0 ? ledger.dalleLimit : 30;
      const tokens = Math.max(traceStat?.tokens ?? 0, ledger?.totalTokensConsumed ?? 0);
      const costUsd = Math.max(traceStat?.costUsd ?? 0, ledger?.estimatedCostUsd ?? 0);

      return {
        tenantId: t.id,
        name: t.fullName,
        email: t.email,
        party: t.partyAffiliation,
        tier: t.planTier || 'STARTER',
        articlesUsed: usedArt,
        articlesLimit: limitArt,
        articlesRemaining: Math.max(0, limitArt - usedArt),
        dalleUsed: usedImg,
        dalleLimit: limitImg,
        dalleRemaining: Math.max(0, limitImg - usedImg),
        tokensConsumed: tokens,
        estimatedCostUsd: Number(costUsd.toFixed(4)),
      };
    });

    tenantBreakdowns.sort((a, b) => b.estimatedCostUsd - a.estimatedCostUsd || b.tokensConsumed - a.tokensConsumed);

    // 4. Platform Master Token Pool (OpenAI & Gemini Master Credit Pool)
    let [masterPool] = await db.select().from(platformTokenPools).limit(1);
    if (!masterPool) {
      const [inserted] = await db
        .insert(platformTokenPools)
        .values({
          totalBudgetUsd: '100.00',
          totalTokensAllocated: 20000000,
          totalTokensConsumed: totalTokens,
          alertThresholdPercent: 20,
        })
        .returning();
      masterPool = inserted;
    } else if (totalTokens !== Number(masterPool.totalTokensConsumed || 0)) {
      await db
        .update(platformTokenPools)
        .set({ totalTokensConsumed: totalTokens, updatedAt: new Date() })
        .where(eq(platformTokenPools.id, masterPool.id));
      masterPool.totalTokensConsumed = totalTokens;
    }

    const topups = await db
      .select()
      .from(platformTopupHistories)
      .orderBy(desc(platformTopupHistories.createdAt))
      .limit(10);

    const totalBudgetUsd = Number(masterPool.totalBudgetUsd) || 100;
    const poolEntity = new PlatformTokenPool({
      id: masterPool.id,
      totalBudgetUsd,
      totalTokensAllocated: Number(masterPool.totalTokensAllocated) || 20000000,
      totalTokensConsumed: totalTokens,
      alertThresholdPercent: masterPool.alertThresholdPercent || 20,
      circuitState: (masterPool.circuitState as CircuitState) || 'CLOSED',
      lastAlertSentAt: masterPool.lastAlertSentAt,
      lastTopupDate: masterPool.lastTopupDate,
    });
    const evalState = poolEntity.evaluateState(totalCostUsd);

    const consumedBudgetUsd = totalCostUsd;
    const remainingBudgetUsd = evalState.remainingUsd;
    const remainingBudgetIdr = Math.round(remainingBudgetUsd * USD_TO_IDR_RATE);
    const percentRemaining = Math.round(evalState.percentRemaining);
    const percentConsumed = Math.max(0, 100 - percentRemaining);
    const isAlert = evalState.isWarning;

    const masterPoolData = {
      id: masterPool.id,
      totalBudgetUsd,
      totalBudgetIdr: Math.round(totalBudgetUsd * USD_TO_IDR_RATE),
      consumedBudgetUsd,
      consumedBudgetIdr: totalCostIdr,
      remainingBudgetUsd,
      remainingBudgetIdr,
      percentRemaining,
      percentConsumed,
      totalTokensConsumed: totalTokens,
      alertThresholdPercent: masterPool.alertThresholdPercent || 20,
      isAlertActive: isAlert,
      lastTopupDate: masterPool.lastTopupDate,
      recentTopups: topups.map((t) => ({
        id: t.id,
        amountUsd: Number(t.amountUsd),
        amountIdr: Number(t.amountIdr),
        tokensAdded: Number(t.tokensAdded || 0),
        paymentReference: t.paymentReference,
        notes: t.notes,
        createdAt: t.createdAt,
      })),
    };

    // 5. Kelompokkan Model Metrics dari data riil ai_trace_logs
    const bucketStats = {
      flagship: { tokens: 0, calls: 0, success: 0, costUsd: 0, latencySum: 0 },
      highSpeed: { tokens: 0, calls: 0, success: 0, costUsd: 0, latencySum: 0 },
      visualDiffusion: { tokens: 0, calls: 0, success: 0, costUsd: 0, latencySum: 0 },
    };

    for (const row of modelTraceRows) {
      const m = (row.model || '').toLowerCase();
      const calls = Number(row.calls || 0);
      const tokens = Number(row.tokens || 0);
      const success = Number(row.successCalls || 0);
      const costUsd = Number(row.costUsd || 0);
      const avgLat = Number(row.avgLatencyMs || 0);

      if (m.includes('image') || m.includes('dall-e') || m.includes('imagen')) {
        bucketStats.visualDiffusion.tokens += tokens;
        bucketStats.visualDiffusion.calls += calls;
        bucketStats.visualDiffusion.success += success;
        bucketStats.visualDiffusion.costUsd += costUsd;
        bucketStats.visualDiffusion.latencySum += avgLat * calls;
      } else if (m.includes('mini') || m.includes('embedding') || m.includes('flash')) {
        bucketStats.highSpeed.tokens += tokens;
        bucketStats.highSpeed.calls += calls;
        bucketStats.highSpeed.success += success;
        bucketStats.highSpeed.costUsd += costUsd;
        bucketStats.highSpeed.latencySum += avgLat * calls;
      } else {
        bucketStats.flagship.tokens += tokens;
        bucketStats.flagship.calls += calls;
        bucketStats.flagship.success += success;
        bucketStats.flagship.costUsd += costUsd;
        bucketStats.flagship.latencySum += avgLat * calls;
      }
    }

    const formatQuality = (success: number, calls: number) =>
      calls > 0 ? `${((success / calls) * 100).toFixed(1)}%` : '100.0%';

    const modelMetrics = [
      {
        model: 'GPT-4o (Flagship Reasoning)',
        useCase: 'Sintesis Naskah Kebijakan 2-Stage, Ekstraksi Klaim Verbatim & Vision Blueprint',
        tokens: bucketStats.flagship.tokens,
        calls: bucketStats.flagship.calls,
        costUsd: Number(bucketStats.flagship.costUsd.toFixed(4)),
        avgLatencyMs:
          bucketStats.flagship.calls > 0
            ? Math.round(bucketStats.flagship.latencySum / bucketStats.flagship.calls)
            : 0,
        qualityScore: formatQuality(bucketStats.flagship.success, bucketStats.flagship.calls),
      },
      {
        model: 'Gemini Imagen & DALL-E (Visual Engine)',
        useCase: 'Kanvas Seni Kolase Poster, Infografis Legislatif & Ilustrasi Editorial',
        tokens: bucketStats.visualDiffusion.tokens,
        calls: bucketStats.visualDiffusion.calls,
        costUsd: Number(bucketStats.visualDiffusion.costUsd.toFixed(4)),
        avgLatencyMs:
          bucketStats.visualDiffusion.calls > 0
            ? Math.round(bucketStats.visualDiffusion.latencySum / bucketStats.visualDiffusion.calls)
            : 0,
        qualityScore: formatQuality(
          bucketStats.visualDiffusion.success,
          bucketStats.visualDiffusion.calls
        ),
      },
      {
        model: 'GPT-4o Mini & Gemini Flash (High Speed)',
        useCase: 'Research Planner, Copywriter Poster, Vision Locator, OCR DataHub & RAG Embedding',
        tokens: bucketStats.highSpeed.tokens,
        calls: bucketStats.highSpeed.calls,
        costUsd: Number(bucketStats.highSpeed.costUsd.toFixed(4)),
        avgLatencyMs:
          bucketStats.highSpeed.calls > 0
            ? Math.round(bucketStats.highSpeed.latencySum / bucketStats.highSpeed.calls)
            : 0,
        qualityScore: formatQuality(bucketStats.highSpeed.success, bucketStats.highSpeed.calls),
      },
    ];

    return {
      masterPool: masterPoolData,
      summary: {
        totalTokens,
        totalCostUsd,
        totalCostIdr,
        totalGenerations,
        totalArticlesGenerated: totalArticlesGen,
        totalDalleGenerated: totalDalleGen,
        avgLatencySeconds,
      },
      langfuse: AiTelemetryService.getLangfuseStatus(),
      modelMetrics,
      tenantBreakdowns,
    };
  }

  /**
   * Catat Top Up Master Saldo OpenAI Credit Pool
   */
  async topupMasterTokenPool(dto: TopupTokenPoolDto) {
    const amountUsd = Number(dto.amountUsd);
    if (isNaN(amountUsd) || amountUsd <= 0) {
      throw new BadRequestException('Nominal Top Up USD harus lebih dari 0.');
    }

    const tokensAdded = Number(dto.tokensAdded) || 0;
    const amountIdr = dto.amountIdr || Math.round(amountUsd * 16250);

    // 1. Simpan riwayat transaksi top up
    const [history] = await db
      .insert(platformTopupHistories)
      .values({
        amountUsd: String(amountUsd),
        amountIdr: String(amountIdr),
        tokensAdded,
        paymentReference: dto.paymentReference || `OPENAI-TOPUP-${Date.now()}`,
        notes: dto.notes || 'Top up deposit saldo OpenAI via Superadmin',
      })
      .returning();

    // 2. Update platform master pool
    let [pool] = await db.select().from(platformTokenPools).limit(1);
    if (!pool) {
      const [newPool] = await db
        .insert(platformTokenPools)
        .values({
          totalBudgetUsd: String(amountUsd),
          totalTokensAllocated: tokensAdded,
          totalTokensConsumed: 0,
          alertThresholdPercent: 20,
          lastTopupDate: new Date(),
        })
        .returning();
      pool = newPool;
    } else {
      const newBudget = Number(pool.totalBudgetUsd) + amountUsd;
      const newTokens = Number(pool.totalTokensAllocated) + tokensAdded;

      const [updatedPool] = await db
        .update(platformTokenPools)
        .set({
          totalBudgetUsd: String(newBudget),
          totalTokensAllocated: newTokens,
          circuitState: 'CLOSED',
          lastTopupDate: new Date(),
          updatedAt: new Date(),
        })
        .where(eq(platformTokenPools.id, pool.id))
        .returning();
      pool = updatedPool;
    }

    // Reset status circuit breaker secara atomik di Redis & memori
    if (this.circuitBreakerService) {
      await this.circuitBreakerService.resetCircuitOnTopup();
    }

    return {
      success: true,
      message: `Berhasil mencatat top up deposit $${amountUsd} (Rp ${amountIdr.toLocaleString('id-ID')}). Sirkuit AI diaktifkan kembali.`,
      transaction: history,
      pool,
    };
  }

  /**
   * Riwayat Trace AI Terkini (Langfuse Sync Logs)
   */
  async getAiTraces(limit: number = 20, operation?: string, status?: string) {
    const rows = await db
      .select({
        id: aiTraceLogs.traceId,
        timestamp: aiTraceLogs.createdAt,
        operation: aiTraceLogs.operation,
        model: aiTraceLogs.model,
        tenantName: tenantMembers.fullName,
        party: tenantMembers.partyAffiliation,
        inputTokens: aiTraceLogs.inputTokens,
        outputTokens: aiTraceLogs.outputTokens,
        totalTokens: aiTraceLogs.totalTokens,
        latencyMs: aiTraceLogs.latencyMs,
        costUsd: sql<number>`${aiTraceLogs.costUsd}::float`,
        status: aiTraceLogs.status,
      })
      .from(aiTraceLogs)
      .leftJoin(tenantMembers, eq(tenantMembers.id, aiTraceLogs.tenantId))
      .orderBy(desc(aiTraceLogs.createdAt))
      .limit(limit);

    return rows.map((r) => ({
      ...r,
      tenantName: r.tenantName || 'Superadmin / Dewan RI',
      party: r.party || 'Fraksi Parlemen',
      costUsd: Number(r.costUsd || 0),
    }));
  }

  /**
   * Alias getObservabilityMetrics untuk memenuhi kontrak Facade
   */
  async getObservabilityMetrics(days: number = 7) {
    return await this.getAiObservability();
  }

  /**
   * Alias topupTokenPool untuk memenuhi kontrak Facade
   */
  async topupTokenPool(dto: TopupTokenPoolDto) {
    return await this.topupMasterTokenPool(dto);
  }

  /**
   * Ambil data saldo Platform Token Pool
   */
  async getTokenPool() {
    const [pool] = await db.select().from(platformTokenPools).limit(1);
    return pool || null;
  }

  /**
   * Breakdown kuota AI per tenant
   */
  async getTenantQuotaBreakdown(month?: string) {
    const stats = await this.getAiObservability();
    return stats.tenantBreakdowns || [];
  }

  /**
   * Riwayat transaksi topup deposit
   */
  async getHistoricalTopups() {
    return await db
      .select()
      .from(platformTopupHistories)
      .orderBy(desc(platformTopupHistories.createdAt))
      .limit(50);
  }

  /**
   * Ambil daftar publikasi & prompt AI lintas tenant untuk Ruang Monitoring AI 3D Superadmin
   */
  async getAiPromptPayloads(limit: number = 30) {
    const pubs = await db
      .select({
        id: contentPublications.id,
        tenantId: contentPublications.tenantId,
        title: contentPublications.title,
        excerpt: contentPublications.excerpt,
        createdAt: contentPublications.createdAt,
        tenantName: tenantMembers.fullName,
        party: tenantMembers.partyAffiliation,
      })
      .from(contentPublications)
      .leftJoin(tenantMembers, eq(tenantMembers.id, contentPublications.tenantId))
      .orderBy(desc(contentPublications.createdAt))
      .limit(limit);

    const pubIds = pubs.map((p) => p.id);
    const mediaMap = new Map<string, { url: string; promptUsed: string | null }>();

    if (pubIds.length > 0) {
      const medias = await db
        .select({
          publicationId: mediaAssets.publicationId,
          cdnPublicUrl: mediaAssets.cdnPublicUrl,
          promptUsed: mediaAssets.promptUsed,
        })
        .from(mediaAssets)
        .where(inArray(mediaAssets.publicationId, pubIds));

      for (const m of medias) {
        if (!mediaMap.has(m.publicationId) || m.promptUsed) {
          mediaMap.set(m.publicationId, {
            url: m.cdnPublicUrl,
            promptUsed: m.promptUsed || null,
          });
        }
      }
    }

    return pubs.map((p) => {
      const media = mediaMap.get(p.id);
      return {
        id: p.id,
        title: p.title,
        excerpt: p.excerpt,
        createdAt: p.createdAt,
        tenantName: p.tenantName || 'Anggota Dewan',
        party: p.party || 'Fraksi',
        imageUrl: media?.url || null,
        promptUsed: media?.promptUsed || null,
      };
    });
  }
}
