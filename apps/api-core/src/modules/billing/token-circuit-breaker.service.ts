import { Injectable, Logger } from '@nestjs/common';
import { eq, sql } from 'drizzle-orm';
import { db, platformTokenPools, aiTraceLogs } from '@polaris/database';
import { PlatformTokenPool, CircuitState } from '@polaris/core-domain';
import { RedisService } from '../redis/redis.service.js';
import { EmailService } from '../../common/services/email.service.js';

@Injectable()
export class TokenCircuitBreakerService {
  private readonly logger = new Logger(TokenCircuitBreakerService.name);

  public static readonly REDIS_CIRCUIT_KEY = 'platform:circuit:state';
  public static readonly REDIS_REMAINING_USD_KEY = 'platform:circuit:remaining_usd';
  public static readonly ALERT_COOLDOWN_MS = 4 * 60 * 60 * 1000; // 4 jam cooldown email

  constructor(
    private readonly redisService: RedisService,
    private readonly emailService: EmailService,
  ) {}

  /**
   * Pengecekan cepat dalam memori Redis (< 1ms) untuk Pre-Flight Guard
   */
  async isCircuitOpen(): Promise<boolean> {
    try {
      const state = await this.redisService.get<string>(TokenCircuitBreakerService.REDIS_CIRCUIT_KEY);
      if (state === 'OPEN') {
        return true;
      }
      return false;
    } catch {
      // Fail-safe: jika redis error, izinkan request lewat
      return false;
    }
  }

  /**
   * Mengevaluasi kondisi saldo riil dari database dan memicu alarm jika ambang batas terlampaui
   */
  async checkAndEvaluateBudget(): Promise<{
    circuitState: CircuitState;
    remainingUsd: number;
    percentRemaining: number;
  }> {
    const [poolRecord] = await db.select().from(platformTokenPools).limit(1);

    if (!poolRecord) {
      return { circuitState: 'CLOSED', remainingUsd: 100, percentRemaining: 100 };
    }

    // Ambil akumulasi biaya pemakaian AI dari log trace
    const [costAgg] = await db
      .select({
        totalCostUsd: sql<number>`COALESCE(SUM(${aiTraceLogs.costUsd}), 0)::float`,
      })
      .from(aiTraceLogs);

    const consumedUsd = costAgg?.totalCostUsd || 0;

    const poolEntity = new PlatformTokenPool({
      id: poolRecord.id,
      totalBudgetUsd: Number(poolRecord.totalBudgetUsd),
      totalTokensAllocated: Number(poolRecord.totalTokensAllocated),
      totalTokensConsumed: Number(poolRecord.totalTokensConsumed),
      alertThresholdPercent: poolRecord.alertThresholdPercent,
      circuitState: (poolRecord.circuitState as CircuitState) || 'CLOSED',
      lastAlertSentAt: poolRecord.lastAlertSentAt,
      lastTopupDate: poolRecord.lastTopupDate,
    });

    const evalResult = poolEntity.evaluateState(consumedUsd);

    // 1. Simpan status terkini ke Redis cache untuk dibaca oleh guard
    await this.redisService.set(TokenCircuitBreakerService.REDIS_CIRCUIT_KEY, poolEntity.circuitState, 300);
    await this.redisService.set(TokenCircuitBreakerService.REDIS_REMAINING_USD_KEY, evalResult.remainingUsd, 300);

    // 2. Jika status berubah atau ambang batas kritis tercapai, perbarui database
    if (poolEntity.circuitState !== poolRecord.circuitState) {
      await db
        .update(platformTokenPools)
        .set({ circuitState: poolEntity.circuitState, updatedAt: new Date() })
        .where(eq(platformTokenPools.id, poolRecord.id));

      this.logger.warn(`[CircuitBreaker] Status sirkuit platform berubah menjadi: ${poolEntity.circuitState}`);
    }

    // 3. Picu alarm darurat jika sisa saldo <= ambang batas peringatan
    if (evalResult.isWarning) {
      await this.triggerEmergencyBroadcast(poolRecord, evalResult);
    }

    return {
      circuitState: poolEntity.circuitState,
      remainingUsd: evalResult.remainingUsd,
      percentRemaining: evalResult.percentRemaining,
    };
  }

  /**
   * Menyiarkan notifikasi darurat via Redis Pub/Sub dan Email saat saldo deposit menipis
   */
  private async triggerEmergencyBroadcast(
    poolRecord: typeof platformTokenPools.$inferSelect,
    evalResult: { remainingUsd: number; percentRemaining: number; shouldTrip: boolean }
  ) {
    const now = Date.now();
    const lastSentTime = poolRecord.lastAlertSentAt ? new Date(poolRecord.lastAlertSentAt).getTime() : 0;

    // A. Broadcast real-time ke Superadmin Dashboard Topbar Bell via Redis Pub/Sub (tanpa cooldown)
    await this.redisService.publish('realtime:broadcast', {
      id: `alert_token_${now}`,
      title: evalResult.shouldTrip ? '🚨 Sirkuit AI Terputus (Saldo Kritis)' : '⚠️ Ambang Batas Saldo OpenAI Kritis!',
      message: `Sisa saldo deposit platform tersisa $${evalResult.remainingUsd.toFixed(2)} (${evalResult.percentRemaining}%). Segera lakukan Top Up.`,
      category: 'SYSTEM',
      link: '/superadmin/ai-monitoring',
      timestamp: now,
    });

    // B. Kirim email darurat dengan cooldown 4 jam agar inbox admin tidak terkena spam
    if (now - lastSentTime > TokenCircuitBreakerService.ALERT_COOLDOWN_MS) {
      const adminEmail = process.env.SUPERADMIN_ALERT_EMAIL || 'smtpgeocitra@gmail.com';
      await this.emailService.sendSystemAlertEmail(
        adminEmail,
        `[URGENT] Saldo Deposit OpenAI POLARIS Tersisa ${evalResult.percentRemaining}%`,
        {
          title: 'Peringatan Kapasitas Kredit Platform',
          message: 'Sistem mendeteksi konsumsi token mendekati batas minimum deposit master.',
          remainingUsd: evalResult.remainingUsd,
          percentRemaining: evalResult.percentRemaining,
        }
      );

      // Catat waktu pengiriman email
      await db
        .update(platformTokenPools)
        .set({ lastAlertSentAt: new Date() })
        .where(eq(platformTokenPools.id, poolRecord.id));
    }
  }

  /**
   * Mereset status sirkuit menjadi CLOSED dan menghapus blokade saat Superadmin mencatat top up
   */
  async resetCircuitOnTopup(): Promise<void> {
    await this.redisService.set(TokenCircuitBreakerService.REDIS_CIRCUIT_KEY, 'CLOSED', 86400);
    this.logger.log('[CircuitBreaker] Sirkuit berhasil di-reset ke CLOSED pasca top-up.');
  }
}
