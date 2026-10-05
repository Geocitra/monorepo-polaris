import { eq, and, lt, lte, sql } from 'drizzle-orm';
import { db, subscriptions, tenantQuotaLedgers } from '@polaris/database';
import { SubscriptionStatus, PlanTier } from '@polaris/shared-types';

export class BillingMaintenanceProcessor {
  /**
   * getQuotasByTier menentukan alokasi kuota baru bulanan
   * Seluruh tier kini disamaratakan menjadi Unlimited AI Enterprise (Dedicated Operator Ready).
   */
  private static getQuotasByTier(_tier?: PlanTier | string) {
    return { articleLimit: 9999, dalleLimit: 9999 };
  }

  /**
   * processSubscriptionLifecycle mengaudit dan memperbarui status akun dewan
   * yang sudah habis masa aktif atau melewati masa tenggang (Grace Period).
   */
  public static async processSubscriptionLifecycle(): Promise<{
    movedToGrace: number;
    movedToSuspended: number;
  }> {
    const now = new Date();
    let movedToGrace = 0;
    let movedToSuspended = 0;

    console.log('[BillingDaemon] Memulai audit siklus hidup langganan tenant...');

    // 1. Cari akun ACTIVE yang sudah melewati current_period_end -> Pindahkan ke GRACE_PERIOD
    const expiredActiveSubs = await db
      .select({ id: subscriptions.id, tenantId: subscriptions.tenantId })
      .from(subscriptions)
      .where(
        and(
          eq(subscriptions.status, SubscriptionStatus.ACTIVE),
          lt(subscriptions.currentPeriodEnd, now)
        )
      );

    for (const sub of expiredActiveSubs) {
      await db
        .update(subscriptions)
        .set({
          status: SubscriptionStatus.GRACE_PERIOD,
          updatedAt: now,
        })
        .where(eq(subscriptions.id, sub.id));
      movedToGrace++;
    }

    // 2. Cari akun GRACE_PERIOD yang sudah melewati grace_period_end (H+3) -> Pindahkan ke SUSPENDED
    const expiredGraceSubs = await db
      .select({ id: subscriptions.id, tenantId: subscriptions.tenantId })
      .from(subscriptions)
      .where(
        and(
          eq(subscriptions.status, SubscriptionStatus.GRACE_PERIOD),
          lt(subscriptions.gracePeriodEnd, now)
        )
      );

    for (const sub of expiredGraceSubs) {
      await db
        .update(subscriptions)
        .set({
          status: SubscriptionStatus.SUSPENDED,
          updatedAt: now,
        })
        .where(eq(subscriptions.id, sub.id));
      movedToSuspended++;
    }

    console.log(
      `[BillingDaemon] Audit selesai: ${movedToGrace} akun masuk Masa Tenggang (Grace), ${movedToSuspended} akun Ditangguhkan (Suspended).`
    );

    return { movedToGrace, movedToSuspended };
  }

  /**
   * processMonthlyQuotaRollover menginisialisasi saldo kuota baru
   * untuk seluruh tenant aktif di bulan kalender yang baru (YYYY-MM).
   */
  public static async processMonthlyQuotaRollover(): Promise<{ initializedTenants: number }> {
    const now = new Date();
    const currentMonth = now.toISOString().slice(0, 7);
    let initializedTenants = 0;

    console.log(`[BillingDaemon] Menyiapkan buku meteran penggunaan bulanan untuk periode ${currentMonth}...`);

    const activeTenants = await db
      .select({
        id: subscriptions.id,
        tenantId: subscriptions.tenantId,
      })
      .from(subscriptions)
      .where(eq(subscriptions.status, SubscriptionStatus.ACTIVE));

    for (const tenant of activeTenants) {
      await db
        .insert(tenantQuotaLedgers)
        .values({
          tenantId: tenant.tenantId,
          billingCycleMonth: currentMonth,
          articleLimit: 0,
          articleUsed: 0,
          dalleLimit: 0,
          dalleUsed: 0,
          totalTokensConsumed: 0,
          estimatedCostUsd: '0.0000',
        })
        .onConflictDoNothing({
          target: [tenantQuotaLedgers.tenantId, tenantQuotaLedgers.billingCycleMonth],
        });

      initializedTenants++;
    }

    console.log(`[BillingDaemon] Berhasil menginisialisasi buku meteran baru untuk ${initializedTenants} tenant aktif.`);
    return { initializedTenants };
  }
}
