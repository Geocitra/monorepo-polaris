import { Injectable, BadRequestException, Optional, Logger } from '@nestjs/common';
import { eq, desc, sql, inArray } from 'drizzle-orm';
import {
  db,
  tenantMembers,
  subscriptions,
  tenantQuotaLedgers,
  tenantQuotaWallets,
  aiTraceLogs,
  platformTokenPools,
  platformTopupHistories,
  contentPublications,
  mediaAssets,
} from '@polaris/database';
import {
  PlatformTokenPool,
  CircuitState,
  PoolProvider,
  AiCostCalculator,
  DynamicExchangeRate,
} from '@polaris/core-domain';
import { AiTelemetryService } from '@polaris/ai-engine';
import { TopupTokenPoolDto } from '../dto/superadmin.dto.js';
import { TokenCircuitBreakerService } from '../../billing/token-circuit-breaker.service.js';
import { SuperadminDashboardService } from './superadmin-dashboard.service.js';

@Injectable()
export class SuperadminObservabilityService {
  private readonly logger = new Logger(SuperadminObservabilityService.name);

  constructor(
    private readonly dashboardService: SuperadminDashboardService,
    @Optional() private readonly circuitBreakerService?: TokenCircuitBreakerService,
  ) {}

  /**
   * Memastikan kedua Vault Provider ('OPENAI' & 'GEMINI') selalu ada di tabel platform_token_pools
   */
  private async ensureDualProviderPools(fxRate: number) {
    const existing = await db.select().from(platformTokenPools);
    const byProvider = new Map<string, typeof platformTokenPools.$inferSelect>();
    for (const row of existing) {
      byProvider.set(((row as any).provider || 'OPENAI').toUpperCase(), row);
    }

    const defaultBudgetIdr = 1_000_000;
    const defaultBudgetUsd = Number((defaultBudgetIdr / fxRate).toFixed(2));

    for (const prov of ['OPENAI', 'GEMINI'] as PoolProvider[]) {
      if (!byProvider.has(prov)) {
        try {
          const [inserted] = await db
            .insert(platformTokenPools)
            .values({
              provider: prov,
              totalBudgetUsd: String(defaultBudgetUsd),
              totalBudgetIdr: defaultBudgetIdr,
              consumedBudgetIdr: 0,
              totalTokensAllocated: prov === 'GEMINI' ? 25_000_000 : 10_000_000,
              totalTokensConsumed: 0,
              totalImagesGenerated: 0,
              alertThresholdPercent: 20,
              circuitState: 'CLOSED',
            })
            .onConflictDoNothing()
            .returning();
          if (inserted) {
            byProvider.set(prov, inserted);
          }
        } catch {
          // Abaikan bila terjadi race condition pada onConflict
        }
      }
    }

    if (byProvider.size < 2) {
      const refreshed = await db.select().from(platformTokenPools);
      for (const row of refreshed) {
        byProvider.set(((row as any).provider || 'OPENAI').toUpperCase(), row);
      }
    }

    return byProvider;
  }

  /**
   * AI Observability & Langfuse Telemetry Stats (100% Real-Time Dual-Provider & Live IDR Aggregation)
   */
  async getAiObservability() {
    const fxSnapshot = await DynamicExchangeRate.getLiveUsdToIdrSnapshot();
    const fxRate = fxSnapshot.rateIdrPerUsd;

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

    const wallets = await db.select().from(tenantQuotaWallets);
    const walletMap = new Map(wallets.map((w) => [w.tenantId, w]));

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
        totalCostIdr: sql<number>`COALESCE(SUM(${aiTraceLogs.costIdr}), 0)::bigint`,
        totalImageCalls: sql<number>`COALESCE(SUM(${aiTraceLogs.imageCalls}), 0)::int`,
        totalCalls: sql<number>`COUNT(*)::int`,
        successfulCalls: sql<number>`COUNT(*) FILTER (WHERE ${aiTraceLogs.status} = 'SUCCESS')::int`,
        avgLatencyMs: sql<number>`COALESCE(AVG(${aiTraceLogs.latencyMs}), 0)::float`,
      })
      .from(aiTraceLogs);

    // 2. Agregasi Per-Model Riil dari ai_trace_logs
    const modelTraceRows = await db
      .select({
        model: aiTraceLogs.model,
        provider: aiTraceLogs.provider,
        inputTokens: sql<number>`COALESCE(SUM(${aiTraceLogs.inputTokens}), 0)::bigint`,
        outputTokens: sql<number>`COALESCE(SUM(${aiTraceLogs.outputTokens}), 0)::bigint`,
        tokens: sql<number>`COALESCE(SUM(${aiTraceLogs.totalTokens}), 0)::bigint`,
        imageCalls: sql<number>`COALESCE(SUM(${aiTraceLogs.imageCalls}), 0)::int`,
        calls: sql<number>`COUNT(*)::int`,
        successCalls: sql<number>`COUNT(*) FILTER (WHERE ${aiTraceLogs.status} = 'SUCCESS')::int`,
        costUsd: sql<number>`COALESCE(SUM(${aiTraceLogs.costUsd}), 0)::float`,
        costIdr: sql<number>`COALESCE(SUM(${aiTraceLogs.costIdr}), 0)::bigint`,
        avgLatencyMs: sql<number>`COALESCE(AVG(${aiTraceLogs.latencyMs}), 0)::float`,
      })
      .from(aiTraceLogs)
      .groupBy(aiTraceLogs.model, aiTraceLogs.provider);

    // Hitung agregat per Provider (OPENAI vs GEMINI) dari trace logs
    const providerTraceSummary = {
      OPENAI: {
        inputTokens: 0,
        outputTokens: 0,
        totalTokens: 0,
        imageCalls: 0,
        calls: 0,
        successCalls: 0,
        costUsd: 0,
        costIdr: 0,
      },
      GEMINI: {
        inputTokens: 0,
        outputTokens: 0,
        totalTokens: 0,
        imageCalls: 0,
        calls: 0,
        successCalls: 0,
        costUsd: 0,
        costIdr: 0,
      },
    };

    for (const row of modelTraceRows) {
      const resolvedProv = AiCostCalculator.resolveProvider(row.model || row.provider || '');
      if (resolvedProv !== 'OPENAI' && resolvedProv !== 'GEMINI') continue;
      const bucket = providerTraceSummary[resolvedProv];
      const rowCostUsd = Number(row.costUsd || 0);
      const rowCostIdr =
        Number(row.costIdr || 0) > 0
          ? Number(row.costIdr)
          : AiCostCalculator.toIdr(rowCostUsd, fxRate);
      const isImg = AiCostCalculator.isImageModel(row.model || '');
      const imgCount =
        Number(row.imageCalls || 0) > 0
          ? Number(row.imageCalls)
          : isImg
            ? Number(row.successCalls || 0)
            : 0;

      bucket.inputTokens += Number(row.inputTokens || 0);
      bucket.outputTokens += Number(row.outputTokens || 0);
      bucket.totalTokens += Number(row.tokens || 0);
      bucket.imageCalls += imgCount;
      bucket.calls += Number(row.calls || 0);
      bucket.successCalls += Number(row.successCalls || 0);
      bucket.costUsd += rowCostUsd;
      bucket.costIdr += rowCostIdr;
    }

    // 3. Agregasi Per-Tenant & Per-Provider Riil dari ai_trace_logs
    const tenantProviderTraceRows = await db
      .select({
        tenantId: aiTraceLogs.tenantId,
        model: aiTraceLogs.model,
        provider: aiTraceLogs.provider,
        inputTokens: sql<number>`COALESCE(SUM(${aiTraceLogs.inputTokens}), 0)::bigint`,
        outputTokens: sql<number>`COALESCE(SUM(${aiTraceLogs.outputTokens}), 0)::bigint`,
        tokens: sql<number>`COALESCE(SUM(${aiTraceLogs.totalTokens}), 0)::bigint`,
        imageCalls: sql<number>`COALESCE(SUM(${aiTraceLogs.imageCalls}), 0)::int`,
        costUsd: sql<number>`COALESCE(SUM(${aiTraceLogs.costUsd}), 0)::float`,
        costIdr: sql<number>`COALESCE(SUM(${aiTraceLogs.costIdr}), 0)::bigint`,
        calls: sql<number>`COUNT(*)::int`,
        successCalls: sql<number>`COUNT(*) FILTER (WHERE ${aiTraceLogs.status} = 'SUCCESS')::int`,
      })
      .from(aiTraceLogs)
      .where(sql`${aiTraceLogs.tenantId} IS NOT NULL`)
      .groupBy(aiTraceLogs.tenantId, aiTraceLogs.model, aiTraceLogs.provider);

    interface TenantProviderAccum {
      tokens: number;
      costUsd: number;
      costIdr: number;
      calls: number;
      openaiInputTokens: number;
      openaiOutputTokens: number;
      openaiTotalTokens: number;
      openaiImageCalls: number;
      openaiCostIdr: number;
      geminiInputTokens: number;
      geminiOutputTokens: number;
      geminiTotalTokens: number;
      geminiImageCalls: number;
      geminiCostIdr: number;
    }

    const tenantTraceMap = new Map<string, TenantProviderAccum>();
    for (const r of tenantProviderTraceRows) {
      const tid = r.tenantId as string;
      if (!tid) continue;
      let acc = tenantTraceMap.get(tid);
      if (!acc) {
        acc = {
          tokens: 0,
          costUsd: 0,
          costIdr: 0,
          calls: 0,
          openaiInputTokens: 0,
          openaiOutputTokens: 0,
          openaiTotalTokens: 0,
          openaiImageCalls: 0,
          openaiCostIdr: 0,
          geminiInputTokens: 0,
          geminiOutputTokens: 0,
          geminiTotalTokens: 0,
          geminiImageCalls: 0,
          geminiCostIdr: 0,
        };
        tenantTraceMap.set(tid, acc);
      }

      const prov = AiCostCalculator.resolveProvider(r.model || r.provider || '');
      const inTok = Number(r.inputTokens || 0);
      const outTok = Number(r.outputTokens || 0);
      const totTok = Number(r.tokens || 0);
      const cUsd = Number(r.costUsd || 0);
      const cIdr =
        Number(r.costIdr || 0) > 0
          ? Number(r.costIdr)
          : AiCostCalculator.toIdr(cUsd, fxRate);
      const isImg = AiCostCalculator.isImageModel(r.model || '');
      const imgCalls =
        Number(r.imageCalls || 0) > 0
          ? Number(r.imageCalls)
          : isImg
            ? Number(r.successCalls || 0)
            : 0;

      acc.tokens += totTok;
      acc.costUsd += cUsd;
      acc.costIdr += cIdr;
      acc.calls += Number(r.calls || 0);

      if (prov === 'GEMINI') {
        acc.geminiInputTokens += inTok;
        acc.geminiOutputTokens += outTok;
        acc.geminiTotalTokens += totTok;
        acc.geminiImageCalls += imgCalls;
        acc.geminiCostIdr += cIdr;
      } else if (prov === 'OPENAI') {
        acc.openaiInputTokens += inTok;
        acc.openaiOutputTokens += outTok;
        acc.openaiTotalTokens += totTok;
        acc.openaiImageCalls += imgCalls;
        acc.openaiCostIdr += cIdr;
      }
    }

    const ledgerAggRows = await db
      .select({
        tenantId: tenantQuotaLedgers.tenantId,
        articleLimit: sql<number>`MAX(${tenantQuotaLedgers.articleLimit})::int`,
        articleUsed: sql<number>`COALESCE(SUM(${tenantQuotaLedgers.articleUsed}), 0)::int`,
        dalleLimit: sql<number>`MAX(${tenantQuotaLedgers.dalleLimit})::int`,
        dalleUsed: sql<number>`COALESCE(SUM(${tenantQuotaLedgers.dalleUsed}), 0)::int`,
        totalTokensConsumed: sql<number>`COALESCE(SUM(${tenantQuotaLedgers.totalTokensConsumed}), 0)::bigint`,
        estimatedCostUsd: sql<number>`COALESCE(SUM(${tenantQuotaLedgers.estimatedCostUsd}), 0)::float`,
        openaiInputTokens: sql<number>`COALESCE(SUM(${tenantQuotaLedgers.openaiInputTokens}), 0)::bigint`,
        openaiOutputTokens: sql<number>`COALESCE(SUM(${tenantQuotaLedgers.openaiOutputTokens}), 0)::bigint`,
        openaiTotalTokens: sql<number>`COALESCE(SUM(${tenantQuotaLedgers.openaiTotalTokens}), 0)::bigint`,
        openaiImageCalls: sql<number>`COALESCE(SUM(${tenantQuotaLedgers.openaiImageCalls}), 0)::int`,
        openaiCostIdr: sql<number>`COALESCE(SUM(${tenantQuotaLedgers.openaiCostIdr}), 0)::bigint`,
        geminiInputTokens: sql<number>`COALESCE(SUM(${tenantQuotaLedgers.geminiInputTokens}), 0)::bigint`,
        geminiOutputTokens: sql<number>`COALESCE(SUM(${tenantQuotaLedgers.geminiOutputTokens}), 0)::bigint`,
        geminiTotalTokens: sql<number>`COALESCE(SUM(${tenantQuotaLedgers.geminiTotalTokens}), 0)::bigint`,
        geminiImageCalls: sql<number>`COALESCE(SUM(${tenantQuotaLedgers.geminiImageCalls}), 0)::int`,
        geminiCostIdr: sql<number>`COALESCE(SUM(${tenantQuotaLedgers.geminiCostIdr}), 0)::bigint`,
        totalCostIdr: sql<number>`COALESCE(SUM(${tenantQuotaLedgers.totalCostIdr}), 0)::bigint`,
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
          openaiInputTokens: Number(l.openaiInputTokens || 0),
          openaiOutputTokens: Number(l.openaiOutputTokens || 0),
          openaiTotalTokens: Number(l.openaiTotalTokens || 0),
          openaiImageCalls: Number(l.openaiImageCalls || 0),
          openaiCostIdr: Number(l.openaiCostIdr || 0),
          geminiInputTokens: Number(l.geminiInputTokens || 0),
          geminiOutputTokens: Number(l.geminiOutputTokens || 0),
          geminiTotalTokens: Number(l.geminiTotalTokens || 0),
          geminiImageCalls: Number(l.geminiImageCalls || 0),
          geminiCostIdr: Number(l.geminiCostIdr || 0),
          totalCostIdr: Number(l.totalCostIdr || 0),
        },
      ]),
    );

    const ledgerTotalTokens = ledgerAggRows.reduce(
      (acc, l) => acc + Number(l.totalTokensConsumed || 0),
      0,
    );
    const ledgerTotalCostUsd = ledgerAggRows.reduce(
      (acc, l) => acc + Number(l.estimatedCostUsd || 0),
      0,
    );
    const ledgerTotalCostIdr = ledgerAggRows.reduce(
      (acc, l) => acc + Number(l.totalCostIdr || 0),
      0,
    );

    const totalTokens = Math.max(Number(globalTraceAgg?.totalTokens || 0), ledgerTotalTokens);
    const rawTotalCostUsd = Math.max(
      Number(globalTraceAgg?.totalCostUsd || 0),
      ledgerTotalCostUsd,
    );
    const totalCostUsd = Number(rawTotalCostUsd.toFixed(4));
    const traceCostIdr =
      providerTraceSummary.OPENAI.costIdr + providerTraceSummary.GEMINI.costIdr;
    const totalCostIdr = Math.max(
      traceCostIdr,
      ledgerTotalCostIdr,
      AiCostCalculator.toIdr(totalCostUsd, fxRate),
    );
    const totalGenerations =
      Number(globalTraceAgg?.successfulCalls || 0) || totalArticlesGen + totalDalleGen;
    const avgLatencySeconds = Number(
      (Number(globalTraceAgg?.avgLatencyMs || 0) / 1000).toFixed(2),
    );

    const tenantBreakdowns = tenants.map((t) => {
      const ledger = ledgerMap.get(t.id);
      const traceStat = tenantTraceMap.get(t.id);
      const wallet = walletMap.get(t.id);
      const rlsCounts = rlsCountsMap.get(t.id) || { publications: 0, media: 0 };

      const walletAllocated = wallet?.totalQuotaAllocated || 12;
      const walletRemaining =
        wallet?.remainingQuota !== undefined ? wallet.remainingQuota : walletAllocated;
      const weeklyLimit = wallet?.weeklyAllowanceLimit || 3;

      const usedArt = Math.max(ledger?.articleUsed ?? 0, rlsCounts.publications);
      const limitArt = walletAllocated;
      const usedImg = Math.max(ledger?.dalleUsed ?? 0, rlsCounts.media);
      const limitImg = walletAllocated;

      const openaiInputTokens = Math.max(
        traceStat?.openaiInputTokens ?? 0,
        ledger?.openaiInputTokens ?? 0,
      );
      const openaiOutputTokens = Math.max(
        traceStat?.openaiOutputTokens ?? 0,
        ledger?.openaiOutputTokens ?? 0,
      );
      const openaiTotalTokens = Math.max(
        traceStat?.openaiTotalTokens ?? 0,
        ledger?.openaiTotalTokens ?? 0,
        openaiInputTokens + openaiOutputTokens,
      );
      const openaiImageCalls = Math.max(
        traceStat?.openaiImageCalls ?? 0,
        ledger?.openaiImageCalls ?? 0,
      );
      const openaiCostIdr = Math.max(
        traceStat?.openaiCostIdr ?? 0,
        ledger?.openaiCostIdr ?? 0,
      );

      const geminiInputTokens = Math.max(
        traceStat?.geminiInputTokens ?? 0,
        ledger?.geminiInputTokens ?? 0,
      );
      const geminiOutputTokens = Math.max(
        traceStat?.geminiOutputTokens ?? 0,
        ledger?.geminiOutputTokens ?? 0,
      );
      const geminiTotalTokens = Math.max(
        traceStat?.geminiTotalTokens ?? 0,
        ledger?.geminiTotalTokens ?? 0,
        geminiInputTokens + geminiOutputTokens,
      );
      const geminiImageCalls = Math.max(
        traceStat?.geminiImageCalls ?? 0,
        ledger?.geminiImageCalls ?? 0,
      );
      const geminiCostIdr = Math.max(
        traceStat?.geminiCostIdr ?? 0,
        ledger?.geminiCostIdr ?? 0,
      );

      const tokens = Math.max(
        traceStat?.tokens ?? 0,
        ledger?.totalTokensConsumed ?? 0,
        openaiTotalTokens + geminiTotalTokens,
      );
      const costUsd = Math.max(traceStat?.costUsd ?? 0, ledger?.estimatedCostUsd ?? 0);
      const estimatedCostIdr = Math.max(
        openaiCostIdr + geminiCostIdr,
        traceStat?.costIdr ?? 0,
        ledger?.totalCostIdr ?? 0,
        AiCostCalculator.toIdr(costUsd, fxRate),
      );

      return {
        tenantId: t.id,
        name: t.fullName,
        email: t.email,
        party: t.partyAffiliation,
        tier: t.planTier || 'STARTER',
        articlesUsed: usedArt,
        articlesLimit: limitArt,
        articlesRemaining: walletRemaining,
        dalleUsed: usedImg,
        dalleLimit: limitImg,
        dalleRemaining: walletRemaining,
        totalQuotaAllocated: walletAllocated,
        remainingQuota: walletRemaining,
        weeklyAllowanceLimit: weeklyLimit,
        tokensConsumed: tokens,
        estimatedCostUsd: Number(costUsd.toFixed(4)),
        estimatedCostIdr,
        openaiInputTokens,
        openaiOutputTokens,
        openaiTotalTokens,
        openaiImageCalls,
        openaiCostIdr,
        geminiInputTokens,
        geminiOutputTokens,
        geminiTotalTokens,
        geminiImageCalls,
        geminiCostIdr,
      };
    });

    tenantBreakdowns.sort(
      (a, b) =>
        b.estimatedCostIdr - a.estimatedCostIdr || b.tokensConsumed - a.tokensConsumed,
    );

    // 4. Platform Dual-Provider Token Pools (OPENAI Vault & GEMINI Vault) dalam Rupiah (IDR)
    const poolsMap = await this.ensureDualProviderPools(fxRate);
    const topups = await db
      .select()
      .from(platformTopupHistories)
      .orderBy(desc(platformTopupHistories.createdAt))
      .limit(20);

    const buildPoolView = (prov: PoolProvider) => {
      const record = poolsMap.get(prov);
      const provTrace = providerTraceSummary[prov];
      const budgetIdr =
        record && Number((record as any).totalBudgetIdr || 0) > 0
          ? Number((record as any).totalBudgetIdr)
          : record
            ? Math.round(Number(record.totalBudgetUsd || 61.16) * fxRate)
            : 1_000_000;
      const budgetUsd = Number((budgetIdr / fxRate).toFixed(2));
      const consumedIdr = Math.max(
        Number((record as any)?.consumedBudgetIdr || 0),
        provTrace.costIdr,
      );
      const consumedUsd = Number((consumedIdr / fxRate).toFixed(4));
      const tokensConsumed = Math.max(
        Number(record?.totalTokensConsumed || 0),
        provTrace.totalTokens,
      );
      const imagesGenerated = Math.max(
        Number((record as any)?.totalImagesGenerated || 0),
        provTrace.imageCalls,
      );
      const tokensAllocated =
        Number(record?.totalTokensAllocated || 0) ||
        (prov === 'GEMINI' ? 25_000_000 : 10_000_000);

      const entity = new PlatformTokenPool({
        id: record?.id || `pool-${prov.toLowerCase()}`,
        provider: prov,
        totalBudgetUsd: budgetUsd,
        totalBudgetIdr: budgetIdr,
        consumedBudgetIdr: consumedIdr,
        totalTokensAllocated: tokensAllocated,
        totalTokensConsumed: tokensConsumed,
        totalImagesGenerated: imagesGenerated,
        alertThresholdPercent: record?.alertThresholdPercent || 20,
        circuitState: (record?.circuitState as CircuitState) || 'CLOSED',
        lastAlertSentAt: record?.lastAlertSentAt || null,
        lastTopupDate: record?.lastTopupDate || null,
      });

      const evalState = entity.evaluateState(consumedUsd, consumedIdr);
      const remainingIdr = evalState.remainingIdr;
      const remainingUsd = evalState.remainingUsd;
      const percentRemaining = Math.round(evalState.percentRemaining);
      const percentConsumed = Math.max(0, 100 - percentRemaining);

      const providerTopups = topups
        .filter((t) => ((t as any).provider || 'OPENAI').toUpperCase() === prov)
        .map((t) => ({
          id: t.id,
          provider: ((t as any).provider || 'OPENAI') as PoolProvider,
          amountUsd: Number(t.amountUsd),
          amountIdr: Number(t.amountIdr),
          fxRateApplied: Number((t as any).fxRateApplied || fxRate),
          tokensAdded: Number(t.tokensAdded || 0),
          paymentReference: t.paymentReference,
          notes: t.notes,
          createdAt: t.createdAt,
        }));

      return {
        id: record?.id || `pool-${prov.toLowerCase()}`,
        provider: prov,
        totalBudgetUsd: budgetUsd,
        totalBudgetIdr: budgetIdr,
        consumedBudgetUsd: consumedUsd,
        consumedBudgetIdr: consumedIdr,
        remainingBudgetUsd: remainingUsd,
        remainingBudgetIdr: remainingIdr,
        percentRemaining,
        percentConsumed,
        totalTokensAllocated: tokensAllocated,
        totalTokensConsumed: tokensConsumed,
        inputTokensConsumed: provTrace.inputTokens,
        outputTokensConsumed: provTrace.outputTokens,
        totalImagesGenerated: imagesGenerated,
        totalApiCalls: provTrace.calls,
        alertThresholdPercent: record?.alertThresholdPercent || 20,
        circuitState: entity.circuitState,
        isAlertActive: evalState.isWarning,
        lastTopupDate: record?.lastTopupDate || null,
        recentTopups: providerTopups,
      };
    };

    const openaiPool = buildPoolView('OPENAI');
    const geminiPool = buildPoolView('GEMINI');

    const combinedBudgetIdr = openaiPool.totalBudgetIdr + geminiPool.totalBudgetIdr;
    const combinedConsumedIdr = openaiPool.consumedBudgetIdr + geminiPool.consumedBudgetIdr;
    const combinedRemainingIdr = openaiPool.remainingBudgetIdr + geminiPool.remainingBudgetIdr;
    const combinedPercentRemaining =
      combinedBudgetIdr > 0
        ? Math.max(0, Math.min(100, Math.round((combinedRemainingIdr / combinedBudgetIdr) * 100)))
        : 100;

    const masterPoolData = {
      id: openaiPool.id,
      totalBudgetUsd: Number((openaiPool.totalBudgetUsd + geminiPool.totalBudgetUsd).toFixed(2)),
      totalBudgetIdr: combinedBudgetIdr,
      consumedBudgetUsd: Number(
        (openaiPool.consumedBudgetUsd + geminiPool.consumedBudgetUsd).toFixed(4),
      ),
      consumedBudgetIdr: combinedConsumedIdr,
      remainingBudgetUsd: Number(
        (openaiPool.remainingBudgetUsd + geminiPool.remainingBudgetUsd).toFixed(2),
      ),
      remainingBudgetIdr: combinedRemainingIdr,
      percentRemaining: combinedPercentRemaining,
      percentConsumed: Math.max(0, 100 - combinedPercentRemaining),
      totalTokensConsumed: totalTokens,
      alertThresholdPercent: 20,
      isAlertActive: openaiPool.isAlertActive || geminiPool.isAlertActive,
      lastTopupDate: openaiPool.lastTopupDate || geminiPool.lastTopupDate,
      openaiPool,
      geminiPool,
      exchangeRate: fxSnapshot,
      recentTopups: topups.map((t) => ({
        id: t.id,
        provider: ((t as any).provider || 'OPENAI') as PoolProvider,
        amountUsd: Number(t.amountUsd),
        amountIdr: Number(t.amountIdr),
        fxRateApplied: Number((t as any).fxRateApplied || fxRate),
        tokensAdded: Number(t.tokensAdded || 0),
        paymentReference: t.paymentReference,
        notes: t.notes,
        createdAt: t.createdAt,
      })),
    };

    // 5. Kelompokkan Model Metrics dari data riil ai_trace_logs (dengan pemisahan Provider & Biaya IDR)
    const bucketStats = {
      openaiFlagship: {
        tokens: 0,
        inputTokens: 0,
        outputTokens: 0,
        imageCalls: 0,
        calls: 0,
        success: 0,
        costUsd: 0,
        costIdr: 0,
        latencySum: 0,
      },
      openaiFastAndImage: {
        tokens: 0,
        inputTokens: 0,
        outputTokens: 0,
        imageCalls: 0,
        calls: 0,
        success: 0,
        costUsd: 0,
        costIdr: 0,
        latencySum: 0,
      },
      geminiTextAndVision: {
        tokens: 0,
        inputTokens: 0,
        outputTokens: 0,
        imageCalls: 0,
        calls: 0,
        success: 0,
        costUsd: 0,
        costIdr: 0,
        latencySum: 0,
      },
      geminiImagenVisual: {
        tokens: 0,
        inputTokens: 0,
        outputTokens: 0,
        imageCalls: 0,
        calls: 0,
        success: 0,
        costUsd: 0,
        costIdr: 0,
        latencySum: 0,
      },
    };

    for (const row of modelTraceRows) {
      const m = (row.model || '').toLowerCase();
      const prov = AiCostCalculator.resolveProvider(m);
      if (prov === 'SYSTEM') continue;

      const calls = Number(row.calls || 0);
      const tokens = Number(row.tokens || 0);
      const inTok = Number(row.inputTokens || 0);
      const outTok = Number(row.outputTokens || 0);
      const success = Number(row.successCalls || 0);
      const costUsd = Number(row.costUsd || 0);
      const costIdr =
        Number(row.costIdr || 0) > 0
          ? Number(row.costIdr)
          : AiCostCalculator.toIdr(costUsd, fxRate);
      const avgLat = Number(row.avgLatencyMs || 0);
      const isImg = AiCostCalculator.isImageModel(m);
      const imgCalls =
        Number(row.imageCalls || 0) > 0 ? Number(row.imageCalls) : isImg ? success : 0;

      const target =
        prov === 'GEMINI'
          ? isImg
            ? bucketStats.geminiImagenVisual
            : bucketStats.geminiTextAndVision
          : m.includes('gpt-4o') && !m.includes('mini')
            ? bucketStats.openaiFlagship
            : bucketStats.openaiFastAndImage;

      target.tokens += tokens;
      target.inputTokens += inTok;
      target.outputTokens += outTok;
      target.imageCalls += imgCalls;
      target.calls += calls;
      target.success += success;
      target.costUsd += costUsd;
      target.costIdr += costIdr;
      target.latencySum += avgLat * calls;
    }

    const formatQuality = (success: number, calls: number) =>
      calls > 0 ? `${((success / calls) * 100).toFixed(1)}%` : '100.0%';

    const modelMetrics = [
      {
        provider: 'OPENAI',
        model: 'OpenAI GPT-4o (Flagship Reasoning)',
        useCase: 'Sintesis Naskah Kebijakan 5 Bab, Ekstraksi Klaim Verbatim & Vision OCR DataHub',
        tokens: bucketStats.openaiFlagship.tokens,
        inputTokens: bucketStats.openaiFlagship.inputTokens,
        outputTokens: bucketStats.openaiFlagship.outputTokens,
        imageCalls: bucketStats.openaiFlagship.imageCalls,
        calls: bucketStats.openaiFlagship.calls,
        costUsd: Number(bucketStats.openaiFlagship.costUsd.toFixed(4)),
        costIdr: bucketStats.openaiFlagship.costIdr,
        avgLatencyMs:
          bucketStats.openaiFlagship.calls > 0
            ? Math.round(bucketStats.openaiFlagship.latencySum / bucketStats.openaiFlagship.calls)
            : 0,
        qualityScore: formatQuality(
          bucketStats.openaiFlagship.success,
          bucketStats.openaiFlagship.calls,
        ),
      },
      {
        provider: 'OPENAI',
        model: 'OpenAI GPT-4o Mini, Embedding & DALL-E',
        useCase: 'Research Planner, Social Syndication, RAG Embedding, Civic Chat & Failover Poster',
        tokens: bucketStats.openaiFastAndImage.tokens,
        inputTokens: bucketStats.openaiFastAndImage.inputTokens,
        outputTokens: bucketStats.openaiFastAndImage.outputTokens,
        imageCalls: bucketStats.openaiFastAndImage.imageCalls,
        calls: bucketStats.openaiFastAndImage.calls,
        costUsd: Number(bucketStats.openaiFastAndImage.costUsd.toFixed(4)),
        costIdr: bucketStats.openaiFastAndImage.costIdr,
        avgLatencyMs:
          bucketStats.openaiFastAndImage.calls > 0
            ? Math.round(
                bucketStats.openaiFastAndImage.latencySum / bucketStats.openaiFastAndImage.calls,
              )
            : 0,
        qualityScore: formatQuality(
          bucketStats.openaiFastAndImage.success,
          bucketStats.openaiFastAndImage.calls,
        ),
      },
      {
        provider: 'GEMINI',
        model: 'Google Gemini 3.8 Flash (Text & Vision)',
        useCase: 'Art-Collage Copywriter, Vision Layout Locator, Scene Prompt Compiler & Refiner',
        tokens: bucketStats.geminiTextAndVision.tokens,
        inputTokens: bucketStats.geminiTextAndVision.inputTokens,
        outputTokens: bucketStats.geminiTextAndVision.outputTokens,
        imageCalls: bucketStats.geminiTextAndVision.imageCalls,
        calls: bucketStats.geminiTextAndVision.calls,
        costUsd: Number(bucketStats.geminiTextAndVision.costUsd.toFixed(4)),
        costIdr: bucketStats.geminiTextAndVision.costIdr,
        avgLatencyMs:
          bucketStats.geminiTextAndVision.calls > 0
            ? Math.round(
                bucketStats.geminiTextAndVision.latencySum / bucketStats.geminiTextAndVision.calls,
              )
            : 0,
        qualityScore: formatQuality(
          bucketStats.geminiTextAndVision.success,
          bucketStats.geminiTextAndVision.calls,
        ),
      },
      {
        provider: 'GEMINI',
        model: 'Google Imagen 3 & Gemini Flash Image',
        useCase: 'Kanvas Seni Kolase Poster, Relayout Infografis 4:5 & Ilustrasi Editorial',
        tokens: bucketStats.geminiImagenVisual.tokens,
        inputTokens: bucketStats.geminiImagenVisual.inputTokens,
        outputTokens: bucketStats.geminiImagenVisual.outputTokens,
        imageCalls: bucketStats.geminiImagenVisual.imageCalls,
        calls: bucketStats.geminiImagenVisual.calls,
        costUsd: Number(bucketStats.geminiImagenVisual.costUsd.toFixed(4)),
        costIdr: bucketStats.geminiImagenVisual.costIdr,
        avgLatencyMs:
          bucketStats.geminiImagenVisual.calls > 0
            ? Math.round(
                bucketStats.geminiImagenVisual.latencySum / bucketStats.geminiImagenVisual.calls,
              )
            : 0,
        qualityScore: formatQuality(
          bucketStats.geminiImagenVisual.success,
          bucketStats.geminiImagenVisual.calls,
        ),
      },
    ];

    return {
      exchangeRate: fxSnapshot,
      masterPool: masterPoolData,
      providerPools: {
        OPENAI: openaiPool,
        GEMINI: geminiPool,
      },
      summary: {
        totalTokens,
        totalCostUsd,
        totalCostIdr,
        openaiTokens: openaiPool.totalTokensConsumed,
        openaiImages: openaiPool.totalImagesGenerated,
        openaiCostIdr: openaiPool.consumedBudgetIdr,
        geminiTokens: geminiPool.totalTokensConsumed,
        geminiImages: geminiPool.totalImagesGenerated,
        geminiCostIdr: geminiPool.consumedBudgetIdr,
        totalGenerations,
        totalArticlesGenerated: totalArticlesGen,
        totalDalleGenerated: totalDalleGen,
        avgLatencySeconds,
        fxRateApplied: fxRate,
        fxRateSource: fxSnapshot.source,
      },
      langfuse: AiTelemetryService.getLangfuseStatus(),
      modelMetrics,
      tenantBreakdowns,
    };
  }

  /**
   * Catat Top Up Saldo Deposit (OpenAI Vault atau Gemini Vault) dalam Rupiah (IDR)
   */
  async topupMasterTokenPool(dto: TopupTokenPoolDto) {
    const fxSnapshot = await DynamicExchangeRate.getLiveUsdToIdrSnapshot();
    const fxRate = fxSnapshot.rateIdrPerUsd;
    const provider: PoolProvider =
      dto.provider && dto.provider.toUpperCase() === 'GEMINI' ? 'GEMINI' : 'OPENAI';

    const rawIdr = Number(dto.amountIdr || 0);
    const rawUsd = Number(dto.amountUsd || 0);
    const amountIdr = rawIdr > 0 ? Math.round(rawIdr) : Math.round(rawUsd * fxRate);
    const amountUsd =
      rawUsd > 0 ? Number(rawUsd.toFixed(2)) : Number((amountIdr / fxRate).toFixed(2));

    if (!Number.isFinite(amountIdr) || amountIdr <= 0) {
      throw new BadRequestException('Nominal Top Up Rupiah (IDR) harus lebih dari Rp 0.');
    }

    // Estimasi kuota token setara berdasarkan tarif rata-rata provider bila tidak diisi manual
    const defaultTokensPerIdr = provider === 'GEMINI' ? 25 : 10;
    const tokensAdded =
      Number(dto.tokensAdded) > 0
        ? Math.round(Number(dto.tokensAdded))
        : Math.round(amountIdr * defaultTokensPerIdr);

    const poolsMap = await this.ensureDualProviderPools(fxRate);
    let pool = poolsMap.get(provider);

    if (!pool) {
      const [newPool] = await db
        .insert(platformTokenPools)
        .values({
          provider,
          totalBudgetUsd: String(amountUsd),
          totalBudgetIdr: amountIdr,
          consumedBudgetIdr: 0,
          totalTokensAllocated: tokensAdded,
          totalTokensConsumed: 0,
          totalImagesGenerated: 0,
          alertThresholdPercent: 20,
          circuitState: 'CLOSED',
          lastTopupDate: new Date(),
        })
        .returning();
      pool = newPool;
    } else {
      const currentBudgetIdr =
        Number((pool as any).totalBudgetIdr || 0) > 0
          ? Number((pool as any).totalBudgetIdr)
          : Math.round(Number(pool.totalBudgetUsd || 0) * fxRate);
      const newBudgetIdr = currentBudgetIdr + amountIdr;
      const newBudgetUsd = Number((newBudgetIdr / fxRate).toFixed(2));
      const newTokens = Number(pool.totalTokensAllocated || 0) + tokensAdded;

      const [updatedPool] = await db
        .update(platformTokenPools)
        .set({
          totalBudgetUsd: String(newBudgetUsd),
          totalBudgetIdr: newBudgetIdr,
          totalTokensAllocated: newTokens,
          circuitState: 'CLOSED',
          lastTopupDate: new Date(),
          updatedAt: new Date(),
        })
        .where(eq(platformTokenPools.id, pool.id))
        .returning();
      pool = updatedPool;
    }

    const [history] = await db
      .insert(platformTopupHistories)
      .values({
        poolId: pool.id,
        provider,
        amountUsd: String(amountUsd),
        amountIdr: String(amountIdr),
        fxRateApplied: fxRate.toFixed(2),
        tokensAdded,
        paymentReference: dto.paymentReference || `${provider}-TOPUP-${Date.now()}`,
        notes:
          dto.notes ||
          `Top up deposit saldo ${provider === 'GEMINI' ? 'Google Gemini / Vertex AI' : 'OpenAI Platform'} via Superadmin`,
      })
      .returning();

    if (this.circuitBreakerService) {
      await this.circuitBreakerService.resetCircuitOnTopup(provider);
    }

    return {
      success: true,
      message: `Berhasil mencatat top up deposit ${provider} sebesar Rp ${amountIdr.toLocaleString('id-ID')} (Kurs Live: Rp ${fxRate.toLocaleString('id-ID')}/USD). Sirkuit AI ${provider} aktif penuh.`,
      transaction: history,
      pool,
      exchangeRate: fxSnapshot,
    };
  }

  /**
   * Riwayat Trace AI Terkini (Langfuse Sync Logs dengan Biaya IDR & Resolusi Provider)
   */
  async getAiTraces(limit: number = 30, operation?: string, status?: string) {
    const fxSnapshot = await DynamicExchangeRate.getLiveUsdToIdrSnapshot();
    const fxRate = fxSnapshot.rateIdrPerUsd;

    const rows = await db
      .select({
        id: aiTraceLogs.traceId,
        timestamp: aiTraceLogs.createdAt,
        provider: aiTraceLogs.provider,
        operation: aiTraceLogs.operation,
        model: aiTraceLogs.model,
        tenantName: tenantMembers.fullName,
        party: tenantMembers.partyAffiliation,
        inputTokens: aiTraceLogs.inputTokens,
        outputTokens: aiTraceLogs.outputTokens,
        totalTokens: aiTraceLogs.totalTokens,
        imageCalls: aiTraceLogs.imageCalls,
        latencyMs: aiTraceLogs.latencyMs,
        costUsd: sql<number>`${aiTraceLogs.costUsd}::float`,
        fxRateApplied: sql<number>`${aiTraceLogs.fxRateApplied}::float`,
        costIdr: aiTraceLogs.costIdr,
        status: aiTraceLogs.status,
      })
      .from(aiTraceLogs)
      .leftJoin(tenantMembers, eq(tenantMembers.id, aiTraceLogs.tenantId))
      .orderBy(desc(aiTraceLogs.createdAt))
      .limit(limit);

    return rows.map((r) => {
      const costUsd = Number(r.costUsd || 0);
      const appliedRate = Number(r.fxRateApplied || 0) > 0 ? Number(r.fxRateApplied) : fxRate;
      const recordedIdr = Number(r.costIdr || 0);
      const costIdr =
        recordedIdr > 0 ? recordedIdr : AiCostCalculator.toIdr(costUsd, appliedRate);
      const resolvedProv = AiCostCalculator.resolveProvider(r.model || r.provider || '');

      return {
        ...r,
        provider: resolvedProv,
        tenantName: r.tenantName || 'Visitor Publik / Sistem',
        party: r.party || 'Publik',
        costUsd,
        fxRateApplied: appliedRate,
        costIdr,
      };
    });
  }

  async getObservabilityMetrics(days: number = 7) {
    return await this.getAiObservability();
  }

  async topupTokenPool(dto: TopupTokenPoolDto) {
    return await this.topupMasterTokenPool(dto);
  }

  async getTokenPool() {
    const fxSnapshot = await DynamicExchangeRate.getLiveUsdToIdrSnapshot();
    const poolsMap = await this.ensureDualProviderPools(fxSnapshot.rateIdrPerUsd);
    return {
      OPENAI: poolsMap.get('OPENAI') || null,
      GEMINI: poolsMap.get('GEMINI') || null,
      exchangeRate: fxSnapshot,
    };
  }

  async getTenantQuotaBreakdown(month?: string) {
    const stats = await this.getAiObservability();
    return stats.tenantBreakdowns || [];
  }

  async getHistoricalTopups() {
    return await db
      .select()
      .from(platformTopupHistories)
      .orderBy(desc(platformTopupHistories.createdAt))
      .limit(50);
  }

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
