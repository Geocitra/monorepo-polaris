import {
  Injectable,
  Logger,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import {
  db,
  eq,
  and,
  desc,
  sql,
  tenantQuotaWallets,
  tenantQuotaTransactions,
  tenantQuotaLedgers,
  contentBriefs,
  contentPublications,
  subscriptions,
} from '@polaris/database';
import { QuotaTransactionType, QuotaConsumptionChannel } from '@polaris/shared-types';
import { getCurrentWibWeeklyPeriod } from '../whatsapp/contact-sanitizer.util.js';

const QUOTA_CONSUMING_BRIEF_STATUSES = [
  'SUBMITTED',
  'ACCEPTED',
  'IN_PROGRESS',
  'NEED_CLARIFICATION',
  'READY_FOR_REVIEW',
  'REVISION_REQUESTED',
  'APPROVED',
  'PUBLISHED',
] as const;

export interface DeductQuotaParams {
  tenantId: string;
  cost: number;
  briefId?: string;
  publicationId?: string;
  operatorId?: string;
  activityType?: string;
  requestId?: string;
  referenceCode?: string;
  isUrgentOverquota?: boolean;
  channel?: QuotaConsumptionChannel | 'WHATSAPP' | 'WEB_STUDIO' | 'ADMIN';
  enforceWeeklyPacing?: boolean;
  notes?: string;
}

export interface RefundQuotaParams {
  tenantId: string;
  briefId?: string;
  publicationId?: string;
  operatorId?: string;
  activityType?: string;
  requestId?: string;
  reason?: string;
  isCancelledByClient?: boolean;
}

export interface AllocatePackageQuotaParams {
  tenantId: string;
  quotaAmount: number;
  periodEnd: Date;
  operatorId?: string;
  activityType?: string;
  requestId?: string;
  invoiceId?: string;
  referenceCode?: string;
  notes?: string;
}

@Injectable()
export class QuotaWalletService {
  private readonly logger = new Logger(QuotaWalletService.name);

  /**
   * Memastikan baris buku besar bulanan (tenant_quota_ledgers) tersedia untuk bulan berjalan
   * dan mengembalikan ID-nya agar relasi FK ledger_id pada transaksi selalu konsisten.
   */
  private async ensureCurrentMonthLedgerId(txOrDb: any, tenantId: string): Promise<string | null> {
    try {
      const currentMonth = new Date().toISOString().slice(0, 7);
      const [existing] = await txOrDb
        .select({ id: tenantQuotaLedgers.id })
        .from(tenantQuotaLedgers)
        .where(
          and(
            eq(tenantQuotaLedgers.tenantId, tenantId),
            eq(tenantQuotaLedgers.billingCycleMonth, currentMonth),
          ),
        )
        .limit(1);

      if (existing?.id) {
        return existing.id;
      }

      const [inserted] = await txOrDb
        .insert(tenantQuotaLedgers)
        .values({
          tenantId,
          billingCycleMonth: currentMonth,
          articleLimit: 12,
          articleUsed: 0,
          dalleLimit: 12,
          dalleUsed: 0,
          totalTokensConsumed: 0,
          estimatedCostUsd: '0.0000',
        })
        .onConflictDoUpdate({
          target: [tenantQuotaLedgers.tenantId, tenantQuotaLedgers.billingCycleMonth],
          set: { updatedAt: new Date() },
        })
        .returning({ id: tenantQuotaLedgers.id });

      return inserted?.id || null;
    } catch {
      return null;
    }
  }

  /**
   * Menghitung pemakaian jatah mingguan gabungan (Omnichannel: WhatsApp Brief + Web Studio Direct)
   * pada periode minggu berjalan (reset setiap Senin 00:00 WIB).
   */
  public async getOmnichannelWeeklyUsage(
    tenantId: string,
    txOrDb: any = db,
  ): Promise<{
    weeklyQuotaPeriod: string;
    whatsappWeeklyUsed: number;
    webStudioWeeklyUsed: number;
    weeklyUsed: number;
    queuedNextWeekCount: number;
  }> {
    const currentWeek = getCurrentWibWeeklyPeriod();

    // 1. Hitung pemakaian dari tiket WhatsApp Brief pada minggu berjalan
    const briefRows = await txOrDb
      .select({
        status: contentBriefs.status,
        quotaCostDeducted: contentBriefs.quotaCostDeducted,
      })
      .from(contentBriefs)
      .where(
        and(
          eq(contentBriefs.tenantId, tenantId),
          eq(contentBriefs.weeklyQuotaPeriod, currentWeek),
        ),
      );

    const whatsappWeeklyUsed = briefRows
      .filter((r: any) =>
        (QUOTA_CONSUMING_BRIEF_STATUSES as readonly string[]).includes(r.status),
      )
      .reduce((acc: number, r: any) => acc + (r.quotaCostDeducted || 1), 0);

    const queuedNextWeekCount = briefRows.filter(
      (r: any) => r.status === 'QUEUED_NEXT_WEEK',
    ).length;

    // 2. Hitung pemakaian dari Web Studio langsung (tanpa briefId) pada minggu berjalan
    const studioTxRows = await txOrDb
      .select({
        amountDelta: tenantQuotaTransactions.amountDelta,
        briefId: tenantQuotaTransactions.briefId,
        channel: tenantQuotaTransactions.channel,
      })
      .from(tenantQuotaTransactions)
      .where(
        and(
          eq(tenantQuotaTransactions.tenantId, tenantId),
          eq(tenantQuotaTransactions.weeklyQuotaPeriod, currentWeek),
        ),
      );

    const rawWebStudioDelta = studioTxRows
      .filter((tx: any) => !tx.briefId && tx.channel === 'WEB_STUDIO')
      .reduce((acc: number, tx: any) => acc + (-1 * (Number(tx.amountDelta) || 0)), 0);

    const webStudioWeeklyUsed = Math.max(0, rawWebStudioDelta);
    const weeklyUsed = whatsappWeeklyUsed + webStudioWeeklyUsed;

    return {
      weeklyQuotaPeriod: currentWeek,
      whatsappWeeklyUsed,
      webStudioWeeklyUsed,
      weeklyUsed,
      queuedNextWeekCount,
    };
  }

  /**
   * Mengambil saldo dompet kuota tenant dengan mekanisme self-healing + status jatah mingguan Omnichannel.
   */
  public async getTenantQuotaWallet(tenantId: string) {
    let [wallet] = await db
      .select()
      .from(tenantQuotaWallets)
      .where(eq(tenantQuotaWallets.tenantId, tenantId))
      .limit(1);

    if (!wallet) {
      const [sub] = await db
        .select()
        .from(subscriptions)
        .where(eq(subscriptions.tenantId, tenantId))
        .limit(1);

      const now = new Date();
      const isActive =
        sub?.status === 'ACTIVE' &&
        sub.currentPeriodEnd &&
        new Date(sub.currentPeriodEnd) > now;
      const initialRemaining = isActive ? 12 : 0;
      const periodEnd = sub?.currentPeriodEnd || null;

      const [inserted] = await db
        .insert(tenantQuotaWallets)
        .values({
          tenantId,
          totalQuotaAllocated: 12,
          remainingQuota: initialRemaining,
          weeklyAllowanceLimit: 3,
          currentPeriodEnd: periodEnd,
        })
        .onConflictDoNothing({ target: [tenantQuotaWallets.tenantId] })
        .returning();

      wallet =
        inserted ||
        (await db
          .select()
          .from(tenantQuotaWallets)
          .where(eq(tenantQuotaWallets.tenantId, tenantId))
          .limit(1)
          .then((r) => r[0]));
    }

    const now = new Date();
    const isExpired = wallet.currentPeriodEnd
      ? new Date(wallet.currentPeriodEnd) <= now
      : true;
    const effectiveRemaining = isExpired ? 0 : wallet.remainingQuota;

    const weeklyUsage = await this.getOmnichannelWeeklyUsage(tenantId);
    const weeklyLimit = wallet.weeklyAllowanceLimit || 3;
    const weeklyRemaining = isExpired
      ? 0
      : Math.max(0, weeklyLimit - weeklyUsage.weeklyUsed);

    return {
      ...wallet,
      isExpired,
      effectiveRemaining,
      weeklyQuotaPeriod: weeklyUsage.weeklyQuotaPeriod,
      weeklyUsed: weeklyUsage.weeklyUsed,
      whatsappWeeklyUsed: weeklyUsage.whatsappWeeklyUsed,
      webStudioWeeklyUsed: weeklyUsage.webStudioWeeklyUsed,
      weeklyRemaining,
      queuedNextWeekCount: weeklyUsage.queuedNextWeekCount,
    };
  }

  /**
   * Alokasi kuota paket lisensi (Aktivasi Baru, Perpanjangan SPK, atau Midtrans Settlement).
   * Menjamin konsistensi atomik antara saldo dompet, ledger bulanan, dan mutasi transaksi.
   */
  public async allocatePackageQuota(params: AllocatePackageQuotaParams): Promise<{
    totalQuotaAllocated: number;
    remainingQuota: number;
  }> {
    const { tenantId, quotaAmount, periodEnd, invoiceId, referenceCode, notes } = params;

    return await db.transaction(async (tx) => {
      const now = new Date();
      const ledgerId = await this.ensureCurrentMonthLedgerId(tx, tenantId);
      const currentWeek = getCurrentWibWeeklyPeriod(now);

      const [existingWallet] = await tx
        .select()
        .from(tenantQuotaWallets)
        .where(eq(tenantQuotaWallets.tenantId, tenantId))
        .for('update')
        .limit(1);

      let newAllocated: number;
      let newRemaining: number;

      if (existingWallet) {
        newAllocated = existingWallet.totalQuotaAllocated + quotaAmount;
        newRemaining = existingWallet.remainingQuota + quotaAmount;

        await tx
          .update(tenantQuotaWallets)
          .set({
            totalQuotaAllocated: newAllocated,
            remainingQuota: newRemaining,
            currentPeriodEnd: periodEnd,
            updatedAt: now,
          })
          .where(eq(tenantQuotaWallets.id, existingWallet.id));
      } else {
        newAllocated = quotaAmount;
        newRemaining = quotaAmount;

        await tx.insert(tenantQuotaWallets).values({
          tenantId,
          totalQuotaAllocated: newAllocated,
          remainingQuota: newRemaining,
          weeklyAllowanceLimit: 3,
          currentPeriodEnd: periodEnd,
          createdAt: now,
          updatedAt: now,
        });
      }

      if (ledgerId) {
        await tx
          .update(tenantQuotaLedgers)
          .set({
            articleLimit: newAllocated,
            dalleLimit: newAllocated,
            updatedAt: now,
          })
          .where(eq(tenantQuotaLedgers.id, ledgerId));
      }

      await tx.insert(tenantQuotaTransactions).values({
        tenantId,
        ledgerId,
        operatorId: params.operatorId || null,
        activityType: params.activityType || 'PACKAGE_ALLOCATION',
        requestId: params.requestId || null,
        invoiceId: invoiceId || null,
        channel: QuotaConsumptionChannel.ADMIN,
        weeklyQuotaPeriod: currentWeek,
        referenceCode: referenceCode || null,
        transactionType: QuotaTransactionType.PACKAGE_PURCHASE,
        amountDelta: quotaAmount,
        balanceAfter: newRemaining,
        notes: notes || `Pembelian / aktivasi paket lisensi (+${quotaAmount} kuota request)`,
        createdAt: now,
      });

      this.logger.log(
        `[QuotaWallet] Alokasi kuota paket berhasil: Tenant=${tenantId}, +${quotaAmount} request, Saldo=${newRemaining}`,
      );

      return {
        totalQuotaAllocated: newAllocated,
        remainingQuota: newRemaining,
      };
    });
  }

  /**
   * Pemotongan kuota secara atomik dengan Row-Level Lock (SELECT ... FOR UPDATE).
   * Mendukung penegakan jatah mingguan (weekly pacing) baik dari WhatsApp maupun Web Studio.
   */
  public async deductQuota(params: DeductQuotaParams): Promise<{
    success: boolean;
    remainingQuota: number;
    costDeducted: number;
    weeklyUsedAfter: number;
    weeklyRemainingAfter: number;
  }> {
    const {
      tenantId,
      cost,
      briefId,
      publicationId,
      referenceCode,
      isUrgentOverquota,
      channel = QuotaConsumptionChannel.WHATSAPP,
      enforceWeeklyPacing = false,
      notes,
    } = params;

    // Pastikan dompet sudah diinisialisasi terlebih dahulu bila belum ada
    await this.getTenantQuotaWallet(tenantId);

    return await db.transaction(async (tx) => {
      const [wallet] = await tx
        .select()
        .from(tenantQuotaWallets)
        .where(eq(tenantQuotaWallets.tenantId, tenantId))
        .for('update')
        .limit(1);

      if (!wallet) {
        throw new NotFoundException(`Dompet kuota untuk tenant ${tenantId} tidak ditemukan.`);
      }

      const now = new Date();
      if (wallet.currentPeriodEnd && new Date(wallet.currentPeriodEnd) <= now) {
        throw new ForbiddenException(
          'Masa aktif paket lisensi Anda telah berakhir. Silakan lakukan perpanjangan paket untuk membuat materi baru.',
        );
      }

      const weeklyUsage = await this.getOmnichannelWeeklyUsage(tenantId, tx);
      const weeklyLimit = wallet.weeklyAllowanceLimit || 3;
      const isWeeklyFull = weeklyUsage.weeklyUsed >= weeklyLimit;

      if (enforceWeeklyPacing && isWeeklyFull && !isUrgentOverquota) {
        throw new ForbiddenException({
          statusCode: 403,
          errorCode: 'WEEKLY_QUOTA_EXCEEDED',
          message: `Jatah kuota mingguan Anda minggu ini (${weeklyUsage.weeklyUsed}/${weeklyLimit} request) telah penuh. Anda dapat menunggu reset otomatis pada hari Senin pukul 00:00 WIB, atau mengaktifkan mode Darurat Over-Quota (memotong 2 kuota dari sisa saldo paket Anda: ${wallet.remainingQuota}).`,
          weeklyUsed: weeklyUsage.weeklyUsed,
          weeklyLimit,
          remainingQuota: wallet.remainingQuota,
          canUseUrgentOverquota: wallet.remainingQuota >= 2,
        });
      }

      const effectiveCost =
        enforceWeeklyPacing && isWeeklyFull && isUrgentOverquota
          ? Math.max(cost, 2)
          : Math.max(1, cost);

      if (wallet.remainingQuota < effectiveCost) {
        throw new ForbiddenException({
          statusCode: 403,
          errorCode: 'PACKAGE_QUOTA_EXHAUSTED',
          message: `Saldo kuota paket Anda tidak mencukupi (Tersisa: ${wallet.remainingQuota} kuota, Dibutuhkan: ${effectiveCost} kuota). Silakan hubungi tim administrasi atau perpanjang paket langganan Anda.`,
          remainingQuota: wallet.remainingQuota,
          requiredCost: effectiveCost,
        });
      }

      const newRemaining = wallet.remainingQuota - effectiveCost;
      const ledgerId = await this.ensureCurrentMonthLedgerId(tx, tenantId);

      // Mutasi saldo dompet
      await tx
        .update(tenantQuotaWallets)
        .set({
          remainingQuota: newRemaining,
          updatedAt: now,
        })
        .where(eq(tenantQuotaWallets.id, wallet.id));

      // Catat di Buku Besar Transaksi (Immutable Ledger dengan relasi FK lengkap)
      const effectiveOverquota = Boolean(isUrgentOverquota || (enforceWeeklyPacing && isWeeklyFull));
      const txType = effectiveOverquota
        ? QuotaTransactionType.URGENT_SURGE_CONSUME
        : QuotaTransactionType.REGULAR_CONSUME;

      await tx.insert(tenantQuotaTransactions).values({
        tenantId,
        briefId: briefId || null,
        publicationId: publicationId || null,
        ledgerId,
        operatorId: params.operatorId || null,
        activityType: params.activityType || (channel === 'WHATSAPP' ? 'WHATSAPP_BOT_BRIEF' : 'STUDIO_ARTICLE_GENERATION'),
        requestId: params.requestId || null,
        channel,
        weeklyQuotaPeriod: weeklyUsage.weeklyQuotaPeriod,
        referenceCode: referenceCode || null,
        transactionType: txType,
        amountDelta: -effectiveCost,
        balanceAfter: newRemaining,
        notes:
          notes ||
          (effectiveOverquota
            ? `Pengajuan darurat over-quota jatah mingguan via ${channel} (biaya -${effectiveCost} kuota)`
            : `Pembuatan materi reguler via ${channel} (-${effectiveCost} kuota)`),
        createdAt: now,
      });

      this.logger.log(
        `[QuotaWallet] Pemotongan berhasil: Tenant=${tenantId}, Channel=${channel}, Cost=${effectiveCost}, Sisa=${newRemaining}, Jenis=${txType}`,
      );

      const weeklyUsedAfter = weeklyUsage.weeklyUsed + effectiveCost;
      return {
        success: true,
        remainingQuota: newRemaining,
        costDeducted: effectiveCost,
        weeklyUsedAfter,
        weeklyRemainingAfter: Math.max(0, weeklyLimit - weeklyUsedAfter),
      };
    });
  }

  /**
   * Pengembalian kuota (Refund) secara atomik saat tiket WhatsApp ditolak/dibatalkan
   * ATAU saat job pembuatan materi Web Studio gagal permanen di antrean worker.
   */
  public async refundQuota(params: RefundQuotaParams): Promise<{
    refundedCost: number;
    remainingQuota: number;
  }> {
    const { tenantId, briefId, publicationId, reason, isCancelledByClient } = params;

    return await db.transaction(async (tx) => {
      let refundCost = 1;
      let resolvedRefCode: string | null = null;
      let resolvedChannel: string = QuotaConsumptionChannel.WHATSAPP;

      if (briefId) {
        const [brief] = await tx
          .select({
            id: contentBriefs.id,
            briefCode: contentBriefs.briefCode,
            quotaCostDeducted: contentBriefs.quotaCostDeducted,
          })
          .from(contentBriefs)
          .where(eq(contentBriefs.id, briefId))
          .limit(1);

        refundCost = brief?.quotaCostDeducted || 1;
        resolvedRefCode = brief?.briefCode || null;
        resolvedChannel = QuotaConsumptionChannel.WHATSAPP;
      } else if (publicationId) {
        const [pub] = await tx
          .select({
            id: contentPublications.id,
            slug: contentPublications.slug,
            quotaCostDeducted: contentPublications.quotaCostDeducted,
          })
          .from(contentPublications)
          .where(eq(contentPublications.id, publicationId))
          .limit(1);

        refundCost = pub?.quotaCostDeducted ?? 1;
        if (refundCost <= 0) {
          return { refundedCost: 0, remainingQuota: 0 };
        }
        resolvedRefCode = pub?.slug ? `WEB-${pub.slug.slice(0, 40)}` : `WEB-${publicationId.slice(0, 8)}`;
        resolvedChannel = QuotaConsumptionChannel.WEB_STUDIO;
      }

      const [wallet] = await tx
        .select()
        .from(tenantQuotaWallets)
        .where(eq(tenantQuotaWallets.tenantId, tenantId))
        .for('update')
        .limit(1);

      if (!wallet) {
        throw new NotFoundException(`Dompet kuota untuk tenant ${tenantId} tidak ditemukan.`);
      }

      const now = new Date();
      const newRemaining = Math.min(
        wallet.totalQuotaAllocated,
        wallet.remainingQuota + refundCost,
      );

      await tx
        .update(tenantQuotaWallets)
        .set({
          remainingQuota: newRemaining,
          updatedAt: now,
        })
        .where(eq(tenantQuotaWallets.id, wallet.id));

      const ledgerId = await this.ensureCurrentMonthLedgerId(tx, tenantId);
      const currentWeek = getCurrentWibWeeklyPeriod(now);

      const txType = isCancelledByClient
        ? QuotaTransactionType.REFUND_CANCELLED
        : QuotaTransactionType.REFUND_REJECTED;

      await tx.insert(tenantQuotaTransactions).values({
        tenantId,
        briefId: briefId || null,
        publicationId: publicationId || null,
        ledgerId,
        operatorId: params.operatorId || null,
        activityType: params.activityType || 'QUOTA_REFUND',
        requestId: params.requestId || null,
        channel: resolvedChannel,
        weeklyQuotaPeriod: currentWeek,
        referenceCode: resolvedRefCode,
        transactionType: txType,
        amountDelta: refundCost,
        balanceAfter: newRemaining,
        notes:
          reason ||
          (isCancelledByClient
            ? 'Pembatalan tiket oleh klien'
            : 'Pengembalian kuota otomatis (penolakan redaksi / kegagalan sistem)'),
        createdAt: now,
      });

      this.logger.log(
        `[QuotaWallet] Refund berhasil: Tenant=${tenantId}, Channel=${resolvedChannel}, Refund=+${refundCost}, Saldo=${newRemaining}`,
      );

      return {
        refundedCost: refundCost,
        remainingQuota: newRemaining,
      };
    });
  }

  /**
   * Mengambil riwayat mutasi buku besar kuota untuk audit trail.
   */
  public async getTransactionHistory(tenantId: string, limit = 20) {
    return await db
      .select()
      .from(tenantQuotaTransactions)
      .where(eq(tenantQuotaTransactions.tenantId, tenantId))
      .orderBy(desc(tenantQuotaTransactions.createdAt))
      .limit(limit);
  }
}
