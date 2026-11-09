import { Injectable, Logger } from '@nestjs/common';
import { eq, sql } from 'drizzle-orm';
import { db, platformTokenPools, aiTraceLogs } from '@polaris/database';
import {
  PlatformTokenPool,
  CircuitState,
  PoolProvider,
  DynamicExchangeRate,
} from '@polaris/core-domain';
import { RedisService } from '../redis/redis.service.js';
import { EmailService } from '../../common/services/email.service.js';

@Injectable()
export class TokenCircuitBreakerService {
  private readonly logger = new Logger(TokenCircuitBreakerService.name);

  public static readonly REDIS_CIRCUIT_KEY = 'platform:circuit:state';
  public static readonly REDIS_REMAINING_USD_KEY = 'platform:circuit:remaining_usd';
  public static readonly REDIS_REMAINING_IDR_KEY = 'platform:circuit:remaining_idr';
  public static readonly ALERT_COOLDOWN_MS = 4 * 60 * 60 * 1000; // 4 jam cooldown email

  constructor(
    private readonly redisService: RedisService,
    private readonly emailService: EmailService,
  ) {}

  /**
   * Pengecekan cepat dalam memori Redis (< 1ms) untuk Pre-Flight Guard
   */
  async isCircuitOpen(provider?: PoolProvider): Promise<boolean> {
    try {
      if (provider) {
        const provState = await this.redisService.get<string>(
          `${TokenCircuitBreakerService.REDIS_CIRCUIT_KEY}:${provider}`,
        );
        if (provState === 'OPEN') return true;
      }
      const state = await this.redisService.get<string>(
        TokenCircuitBreakerService.REDIS_CIRCUIT_KEY,
      );
      return state === 'OPEN';
    } catch {
      return false;
    }
  }

  /**
   * Mengevaluasi kondisi saldo riil dari database untuk kedua Vault (OPENAI & GEMINI) dalam Rupiah (IDR)
   */
  async checkAndEvaluateBudget(): Promise<{
    circuitState: CircuitState;
    remainingUsd: number;
    remainingIdr: number;
    percentRemaining: number;
  }> {
    const fxSnapshot = await DynamicExchangeRate.getLiveUsdToIdrSnapshot();
    const fxRate = fxSnapshot.rateIdrPerUsd;

    const pools = await db.select().from(platformTokenPools);
    if (!pools || pools.length === 0) {
      return {
        circuitState: 'CLOSED',
        remainingUsd: 100,
        remainingIdr: Math.round(100 * fxRate),
        percentRemaining: 100,
      };
    }

    // Ambil akumulasi biaya pemakaian AI per provider dari log trace
    const costAggRows = await db
      .select({
        provider: aiTraceLogs.provider,
        totalCostUsd: sql<number>`COALESCE(SUM(${aiTraceLogs.costUsd}), 0)::float`,
        totalCostIdr: sql<number>`COALESCE(SUM(${aiTraceLogs.costIdr}), 0)::bigint`,
      })
      .from(aiTraceLogs)
      .groupBy(aiTraceLogs.provider);

    const costMap = new Map<string, { usd: number; idr: number }>();
    for (const row of costAggRows) {
      const prov = (row.provider || 'OPENAI').toUpperCase();
      const usd = Number(row.totalCostUsd || 0);
      const idr =
        Number(row.totalCostIdr || 0) > 0
          ? Number(row.totalCostIdr)
          : Math.round(usd * fxRate);
      costMap.set(prov, { usd, idr });
    }

    let overallState: CircuitState = 'CLOSED';
    let totalRemainingUsd = 0;
    let totalRemainingIdr = 0;
    let totalBudgetIdr = 0;

    for (const poolRecord of pools) {
      const prov = ((poolRecord as any).provider || 'OPENAI') as PoolProvider;
      const traceUsage = costMap.get(prov) || { usd: 0, idr: 0 };
      const budgetUsd = Number(poolRecord.totalBudgetUsd) || 61.16;
      const budgetIdr =
        Number((poolRecord as any).totalBudgetIdr || 0) > 0
          ? Number((poolRecord as any).totalBudgetIdr)
          : Math.round(budgetUsd * fxRate);
      const consumedIdr = Math.max(
        Number((poolRecord as any).consumedBudgetIdr || 0),
        traceUsage.idr,
      );
      const consumedUsd = Math.max(traceUsage.usd, Number((consumedIdr / fxRate).toFixed(4)));

      const poolEntity = new PlatformTokenPool({
        id: poolRecord.id,
        provider: prov,
        totalBudgetUsd: budgetUsd,
        totalBudgetIdr: budgetIdr,
        consumedBudgetIdr: consumedIdr,
        totalTokensAllocated: Number(poolRecord.totalTokensAllocated),
        totalTokensConsumed: Number(poolRecord.totalTokensConsumed),
        totalImagesGenerated: Number((poolRecord as any).totalImagesGenerated || 0),
        alertThresholdPercent: poolRecord.alertThresholdPercent,
        circuitState: (poolRecord.circuitState as CircuitState) || 'CLOSED',
        lastAlertSentAt: poolRecord.lastAlertSentAt,
        lastTopupDate: poolRecord.lastTopupDate,
      });

      const evalResult = poolEntity.evaluateState(consumedUsd, consumedIdr);
      totalRemainingUsd += evalResult.remainingUsd;
      totalRemainingIdr += evalResult.remainingIdr;
      totalBudgetIdr += budgetIdr;

      await this.redisService.set(
        `${TokenCircuitBreakerService.REDIS_CIRCUIT_KEY}:${prov}`,
        poolEntity.circuitState,
        300,
      );

      if (poolEntity.circuitState === 'OPEN') {
        overallState = 'OPEN';
      } else if (poolEntity.circuitState === 'HALF_OPEN' && overallState === 'CLOSED') {
        overallState = 'HALF_OPEN';
      }

      if (poolEntity.circuitState !== poolRecord.circuitState) {
        await db
          .update(platformTokenPools)
          .set({ circuitState: poolEntity.circuitState, updatedAt: new Date() })
          .where(eq(platformTokenPools.id, poolRecord.id));

        this.logger.warn(
          `[CircuitBreaker] Status sirkuit vault ${prov} berubah menjadi: ${poolEntity.circuitState}`,
        );
      }

      if (evalResult.isWarning) {
        await this.triggerEmergencyBroadcast(poolRecord, prov, evalResult);
      }
    }

    const overallPercentRemaining =
      totalBudgetIdr > 0
        ? Math.max(0, Math.min(100, Math.round((totalRemainingIdr / totalBudgetIdr) * 100)))
        : 100;

    await this.redisService.set(
      TokenCircuitBreakerService.REDIS_CIRCUIT_KEY,
      overallState,
      300,
    );
    await this.redisService.set(
      TokenCircuitBreakerService.REDIS_REMAINING_USD_KEY,
      Number(totalRemainingUsd.toFixed(2)),
      300,
    );
    await this.redisService.set(
      TokenCircuitBreakerService.REDIS_REMAINING_IDR_KEY,
      totalRemainingIdr,
      300,
    );

    return {
      circuitState: overallState,
      remainingUsd: Number(totalRemainingUsd.toFixed(2)),
      remainingIdr: totalRemainingIdr,
      percentRemaining: overallPercentRemaining,
    };
  }

  /**
   * Menyiarkan notifikasi darurat via Redis Pub/Sub dan Email dalam Rupiah (IDR)
   */
  private async triggerEmergencyBroadcast(
    poolRecord: typeof platformTokenPools.$inferSelect,
    provider: PoolProvider,
    evalResult: {
      remainingUsd: number;
      remainingIdr: number;
      percentRemaining: number;
      shouldTrip: boolean;
    },
  ) {
    const now = Date.now();
    const lastSentTime = poolRecord.lastAlertSentAt
      ? new Date(poolRecord.lastAlertSentAt).getTime()
      : 0;
    const formattedIdr = `Rp ${evalResult.remainingIdr.toLocaleString('id-ID')}`;

    await this.redisService.publish('realtime:broadcast', {
      id: `alert_token_${provider}_${now}`,
      title: evalResult.shouldTrip
        ? `🚨 Sirkuit AI ${provider} Terputus (Saldo Kritis)`
        : `⚠️ Ambang Batas Saldo Deposit ${provider} Kritis!`,
      message: `Sisa saldo deposit vault ${provider} tersisa ${formattedIdr} (${evalResult.percentRemaining}%). Segera lakukan Top Up di Ruang Monitoring AI.`,
      category: 'SYSTEM',
      link: '/superadmin/ai-monitoring',
      timestamp: now,
    });

    if (now - lastSentTime > TokenCircuitBreakerService.ALERT_COOLDOWN_MS) {
      const adminEmail = process.env.SUPERADMIN_ALERT_EMAIL || 'smtpgeocitra@gmail.com';
      await this.emailService.sendSystemAlertEmail(
        adminEmail,
        `[URGENT] Saldo Deposit ${provider} POLARIS Tersisa ${formattedIdr} (${evalResult.percentRemaining}%)`,
        {
          title: `Peringatan Kapasitas Kredit Vault ${provider}`,
          message: `Sistem mendeteksi konsumsi token/gambar pada API ${provider} mendekati batas minimum deposit (${formattedIdr}).`,
          remainingUsd: evalResult.remainingUsd,
          percentRemaining: evalResult.percentRemaining,
        },
      );

      await db
        .update(platformTokenPools)
        .set({ lastAlertSentAt: new Date() })
        .where(eq(platformTokenPools.id, poolRecord.id));
    }
  }

  /**
   * Mereset status sirkuit menjadi CLOSED dan menghapus blokade saat Superadmin mencatat top up
   */
  async resetCircuitOnTopup(provider?: PoolProvider): Promise<void> {
    if (provider) {
      await this.redisService.set(
        `${TokenCircuitBreakerService.REDIS_CIRCUIT_KEY}:${provider}`,
        'CLOSED',
        86400,
      );
    }
    await this.redisService.set(TokenCircuitBreakerService.REDIS_CIRCUIT_KEY, 'CLOSED', 86400);
    this.logger.log(
      `[CircuitBreaker] Sirkuit ${provider || 'ALL'} berhasil di-reset ke CLOSED pasca top-up.`,
    );
  }
}
