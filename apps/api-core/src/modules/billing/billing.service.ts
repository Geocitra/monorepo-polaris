import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { eq, and, desc } from 'drizzle-orm';
import {
  db,
  subscriptions,
  invoiceTransactions,
  tenantQuotaLedgers,
  tenantMembers,
} from '@polaris/database';
import { MidtransPaymentAdapter, MidtransFeeCalculator } from '@polaris/payment';
import {
  SubscriptionStatus,
  PaymentStatus,
} from '@polaris/shared-types';
import { AiCostCalculator } from '@polaris/core-domain';
import { CreateCheckoutDto, CheckoutResponseDto, BillingStatusDto } from './dto/billing.dto.js';
import { RedisService } from '../redis/redis.service.js';

@Injectable()
export class BillingService {
  private readonly logger = new Logger(BillingService.name);
  private readonly paymentGateway = new MidtransPaymentAdapter();

  constructor(private readonly redisService?: RedisService) {}

  private getCycleDetails(cycleOrTier?: string): { amountIdr: number; durationDays: number; name: string } {
    const key = (cycleOrTier || 'MONTHLY').toUpperCase();

    switch (key) {
      case 'ANNUAL':
      case 'TAHUNAN':
      case 'VIP':
      case '1TAHUN':
        return { amountIdr: 20000000, durationDays: 365, name: 'Paket 1 Tahun (365 Hari)' };
      case 'SEMESTER':
      case 'SETENGAH_TAHUN':
      case 'PRO':
      case '6BULAN':
        return { amountIdr: 10000000, durationDays: 180, name: 'Paket 6 Bulan (180 Hari)' };
      case 'MONTHLY':
      case 'BULANAN':
      case 'STARTER':
      case '1BULAN':
      default:
        return { amountIdr: 2000000, durationDays: 30, name: 'Paket 1 Bulan (30 Hari)' };
    }
  }

  async createSubscriptionCheckout(
    tenantId: string,
    dto: CreateCheckoutDto
  ): Promise<CheckoutResponseDto> {
    const [member] = await db
      .select()
      .from(tenantMembers)
      .where(eq(tenantMembers.id, tenantId))
      .limit(1);

    if (!member) {
      throw new NotFoundException('Data anggota dewan tidak ditemukan.');
    }

    const [sub] = await db
      .select()
      .from(subscriptions)
      .where(eq(subscriptions.tenantId, tenantId))
      .limit(1);

    if (!sub) {
      throw new NotFoundException('Data kontrak langganan tidak ditemukan.');
    }

    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const randomSuffix = Math.random().toString(36).substring(2, 7).toUpperCase();
    const invoiceNumber = `INV-${dateStr}-${randomSuffix}`;
    const cycleDetails = this.getCycleDetails(dto.billingCycle || dto.planTier);
    const amountIdr = cycleDetails.amountIdr;

    const snapResult = await this.paymentGateway.createInvoice({
      invoiceNumber,
      amountIdr,
      customerName: member.fullName,
      customerEmail: member.email,
      customerPhone: member.phoneNumber,
    });

    await db.insert(invoiceTransactions).values({
      subscriptionId: sub.id,
      invoiceNumber,
      amountIdr: amountIdr.toString(),
      grossAmountIdr: amountIdr.toString(),
      gatewayOrderId: invoiceNumber,
      paymentStatus: PaymentStatus.PENDING,
      reconciliationStatus: 'UNRECONCILED',
    });

    this.logger.log(`[BillingCheckout] Invoice dibuat: ${invoiceNumber} (Rp ${amountIdr.toLocaleString('id-ID')}) untuk ${member.fullName}`);

    return {
      invoiceNumber,
      amountIdr,
      snapToken: snapResult.snapToken,
      redirectUrl: snapResult.redirectUrl,
    };
  }

  /**
   * Menangani notifikasi webhook resmi dari Midtrans secara Idempotent.
   */
  async handleMidtransWebhook(payload: Record<string, any>): Promise<{ status: string }> {
    const signatureKey = payload.signature_key;
    if (!signatureKey) {
      throw new ForbiddenException('Payload webhook tidak memiliki signature_key.');
    }

    // 1. Verifikasi Keaslian Signature SHA-512
    const isValidSignature = this.paymentGateway.verifyWebhookSignature(payload, signatureKey);
    if (!isValidSignature) {
      this.logger.error(`[Webhook Fraud Alert] Signature tidak valid untuk order_id: ${payload.order_id}`);
      throw new ForbiddenException('Signature webhook tidak valid. Potensi manipulasi data.');
    }

    const orderId = payload.order_id;
    const transactionStatus = payload.transaction_status;
    const fraudStatus = payload.fraud_status;

    // 2. Ambil Record Tagihan Internal
    const [invoice] = await db
      .select()
      .from(invoiceTransactions)
      .where(eq(invoiceTransactions.gatewayOrderId, orderId))
      .limit(1);

    if (!invoice) {
      this.logger.warn(`[Webhook Unmatched] Order ID ${orderId} tidak terdaftar di database internal.`);
      throw new NotFoundException(`Invoice dengan order_id ${orderId} tidak terdaftar.`);
    }

    // 3. IDEMPOTENCY GUARD: Jika sudah lunas, cegah mutasi ganda dan kembalikan status idempotent
    if (invoice.paymentStatus === PaymentStatus.SETTLEMENT) {
      this.logger.log(`[Webhook Idempotent] Order ID ${orderId} sudah berstatus SETTLEMENT sebelumnya. Mengabaikan eksekusi ulang.`);
      return { status: 'ALREADY_SETTLED_IDEMPOTENT' };
    }

    const domainPaymentStatus = this.paymentGateway.parseTransactionStatus(transactionStatus, fraudStatus);

    // 4. Proses Pelunasan (Settlement Ingress)
    if (domainPaymentStatus === PaymentStatus.SETTLEMENT) {
      const grossAmount = payload.gross_amount ? parseFloat(payload.gross_amount) : Number(invoice.amountIdr);
      const paymentType = payload.payment_type || 'midtrans';
      const settlementTime = payload.settlement_time ? new Date(payload.settlement_time) : new Date();

      await this.activateSubscriptionFromSettlement(
        invoice,
        invoice.subscriptionId,
        grossAmount,
        paymentType,
        settlementTime
      );

      return { status: 'ACTIVATED_SUCCESSFULLY' };
    }

    // 5. Penanganan Status Expired / Failed
    if (domainPaymentStatus === PaymentStatus.EXPIRED || domainPaymentStatus === PaymentStatus.FAILED) {
      await db
        .update(invoiceTransactions)
        .set({ paymentStatus: domainPaymentStatus })
        .where(eq(invoiceTransactions.id, invoice.id));

      this.logger.log(`[Webhook Status] Order ID ${orderId} diperbarui menjadi ${domainPaymentStatus}`);
    }

    return { status: 'PROCESSED' };
  }

  /**
   * Eksekusi atomik pelunasan finansial, perpanjangan masa aktif, dan inisialisasi meteran penggunaan.
   */
  private async activateSubscriptionFromSettlement(
    invoice: any,
    subscriptionId: string,
    grossAmountIdr: number,
    paymentMethod: string,
    settlementTime: Date
  ): Promise<void> {
    // Hitung rincian potongan fee MDR & PPN 11% secara presisi
    const feeBreakdown = MidtransFeeCalculator.calculate(grossAmountIdr, paymentMethod);

    await db.transaction(async (tx) => {
      // 1. Mutasi status tagihan dengan pembukuan kas bersih (Net Ingress)
      await tx
        .update(invoiceTransactions)
        .set({
          paymentStatus: PaymentStatus.SETTLEMENT,
          paymentMethod: paymentMethod || 'midtrans',
          grossAmountIdr: feeBreakdown.grossAmountIdr.toString(),
          mdrFeeIdr: feeBreakdown.mdrFeeIdr.toString(),
          vatFeeIdr: feeBreakdown.vatFeeIdr.toString(),
          netAmountIdr: feeBreakdown.netAmountIdr.toString(),
          paidAt: settlementTime,
          settlementTime: settlementTime,
          reconciliationStatus: 'UNRECONCILED', // Siap diaudit oleh batch harian
        })
        .where(eq(invoiceTransactions.id, invoice.id));

      // 2. Ambil data langganan
      const [sub] = await tx
        .select()
        .from(subscriptions)
        .where(eq(subscriptions.id, subscriptionId))
        .limit(1);

      if (!sub) return;

      const now = new Date();

      // Durasi Paket Berdasarkan Nilai Tagihan
      let durationDays = 30;
      if (grossAmountIdr >= 15000000) {
        durationDays = 365;
      } else if (grossAmountIdr >= 8000000) {
        durationDays = 180;
      }

      // Garansi Akumulasi: Jika masa aktif masih berjalan, tambahkan di ujung periode berjalan
      const baseDate = sub.currentPeriodEnd && new Date(sub.currentPeriodEnd) > now
        ? new Date(sub.currentPeriodEnd)
        : now;

      const periodEnd = new Date(baseDate.getTime() + durationDays * 24 * 60 * 60 * 1000);
      const graceEnd = new Date(periodEnd.getTime() + 3 * 24 * 60 * 60 * 1000);
      const currentMonth = now.toISOString().slice(0, 7);

      await tx
        .update(subscriptions)
        .set({
          status: SubscriptionStatus.ACTIVE,
          currentPeriodStart: sub.currentPeriodStart || now,
          currentPeriodEnd: periodEnd,
          gracePeriodEnd: graceEnd,
          updatedAt: now,
        })
        .where(eq(subscriptions.id, sub.id));

      // 3. Inisialisasi Metered Ledger Baru Bulan Berjalan (Tanpa Kuota Fiktif)
      await tx
        .insert(tenantQuotaLedgers)
        .values({
          tenantId: sub.tenantId,
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

      // 4. Siarkan Event Real-Time ke Dashboard Anggota Dewan
      if (this.redisService) {
        await this.redisService.emitUserNotification(sub.tenantId, {
          id: `bill_${Date.now()}`,
          title: '🎉 Pembayaran Lisensi Terverifikasi Lunas!',
          message: `Lisensi Parlemen Anda aktif hingga ${periodEnd.toLocaleDateString('id-ID')}. Kas bersih: Rp ${feeBreakdown.netAmountIdr.toLocaleString('id-ID')}. Akses AI terbuka penuh.`,
          category: 'BILLING',
          link: '/billing',
        });

        await this.redisService.emitUserProgress(sub.tenantId, {
          jobId: `checkout_${invoice.gatewayOrderId}`,
          percent: 100,
          step: 'Pembayaran Terverifikasi & Lisensi Aktif!',
          status: 'COMPLETED',
          resultUrl: '/billing',
        });
      }

      this.logger.log(
        `[BillingSettled] Invoice ${invoice.invoiceNumber} LUNAS. Gross: Rp ${feeBreakdown.grossAmountIdr}, MDR: Rp ${feeBreakdown.mdrFeeIdr}, PPN: Rp ${feeBreakdown.vatFeeIdr}, Net Kas: Rp ${feeBreakdown.netAmountIdr}. Aktif s.d: ${periodEnd.toISOString()}`
      );
    });
  }

  /**
   * Sinkronisasi status transaksi secara manual via Midtrans Core API.
   */
  async syncTransactionStatus(tenantId: string, orderId: string): Promise<BillingStatusDto> {
    const [invoice] = await db
      .select()
      .from(invoiceTransactions)
      .where(eq(invoiceTransactions.gatewayOrderId, orderId))
      .limit(1);

    if (!invoice) {
      throw new NotFoundException(`Invoice dengan order_id ${orderId} tidak terdaftar.`);
    }

    const [sub] = await db
      .select()
      .from(subscriptions)
      .where(and(eq(subscriptions.id, invoice.subscriptionId), eq(subscriptions.tenantId, tenantId)))
      .limit(1);

    if (!sub) {
      throw new ForbiddenException('Akses ditolak untuk invoice ini.');
    }

    if (invoice.paymentStatus !== PaymentStatus.SETTLEMENT) {
      try {
        const details = await this.paymentGateway.getOrderDetails(orderId);

        if (details.paymentStatus === PaymentStatus.SETTLEMENT) {
          const gross = details.grossAmount || Number(invoice.amountIdr);
          const pType = details.paymentType || 'midtrans';
          const setTime = details.settlementTime ? new Date(details.settlementTime) : new Date();

          await this.activateSubscriptionFromSettlement(invoice, sub.id, gross, pType, setTime);
        } else if (details.paymentStatus === PaymentStatus.EXPIRED || details.paymentStatus === PaymentStatus.FAILED) {
          await db
            .update(invoiceTransactions)
            .set({ paymentStatus: details.paymentStatus })
            .where(eq(invoiceTransactions.id, invoice.id));
        }
      } catch (err: any) {
        this.logger.warn(`[SyncStatusWarning] Gagal memeriksa status order ke Midtrans: ${err.message}`);
      }
    }

    return await this.getBillingStatus(tenantId);
  }

  async getBillingStatus(tenantId: string): Promise<BillingStatusDto> {
    const [sub] = await db
      .select()
      .from(subscriptions)
      .where(eq(subscriptions.tenantId, tenantId))
      .limit(1);

    if (!sub) {
      throw new NotFoundException('Data langganan tidak ditemukan.');
    }

    const currentMonth = new Date().toISOString().slice(0, 7);

    const [quota] = await db
      .select()
      .from(tenantQuotaLedgers)
      .where(
        and(
          eq(tenantQuotaLedgers.tenantId, tenantId),
          eq(tenantQuotaLedgers.billingCycleMonth, currentMonth)
        )
      )
      .limit(1);

    // Ambil riwayat invoice terakhir dewan
    const [lastInvoice] = await db
      .select({
        invoiceNumber: invoiceTransactions.invoiceNumber,
        grossAmountIdr: invoiceTransactions.grossAmountIdr,
        netAmountIdr: invoiceTransactions.netAmountIdr,
        paymentMethod: invoiceTransactions.paymentMethod,
        paymentStatus: invoiceTransactions.paymentStatus,
        settlementTime: invoiceTransactions.settlementTime,
        reconciliationStatus: invoiceTransactions.reconciliationStatus,
      })
      .from(invoiceTransactions)
      .where(eq(invoiceTransactions.subscriptionId, sub.id))
      .orderBy(desc(invoiceTransactions.createdAt))
      .limit(1);

    const tokens = quota?.totalTokensConsumed || 0;
    const articles = quota?.articleUsed || 0;
    const dalle = quota?.dalleUsed || 0;
    const recordedCostUsd = Number(quota?.estimatedCostUsd) || AiCostCalculator.calculateCostUsd(tokens, dalle);
    const costIdr = AiCostCalculator.toIdr(recordedCostUsd);

    const serverKey = process.env.MIDTRANS_SERVER_KEY || '';
    const isProd = process.env.MIDTRANS_IS_PRODUCTION !== undefined
      ? process.env.MIDTRANS_IS_PRODUCTION === 'true'
      : serverKey.startsWith('Mid-server-');
    const clientKey = process.env.MIDTRANS_CLIENT_KEY || process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY || '';

    return {
      subscriptionStatus: sub.status,
      planTier: sub.planTier,
      currentPeriodEnd: sub.currentPeriodEnd ? sub.currentPeriodEnd.toISOString() : null,
      quota: {
        billingMonth: currentMonth,
        articleLimit: 0,
        articleUsed: articles,
        articleRemaining: 9999,
        dalleLimit: 0,
        dalleUsed: dalle,
        dalleRemaining: 9999,
        totalTokensConsumed: tokens,
        estimatedCostUsd: recordedCostUsd,
        estimatedCostIdr: costIdr,
        isUnlimited: true,
      },
      recentInvoice: lastInvoice
        ? {
            invoiceNumber: lastInvoice.invoiceNumber,
            grossAmountIdr: Number(lastInvoice.grossAmountIdr || 0),
            netAmountIdr: Number(lastInvoice.netAmountIdr || 0),
            paymentMethod: lastInvoice.paymentMethod,
            paymentStatus: lastInvoice.paymentStatus,
            settlementTime: lastInvoice.settlementTime ? lastInvoice.settlementTime.toISOString() : null,
            reconciliationStatus: lastInvoice.reconciliationStatus,
          }
        : null,
      gatewayConfig: {
        clientKey,
        isProduction: isProd,
        snapScriptUrl: isProd
          ? 'https://app.midtrans.com/snap/snap.js'
          : 'https://app.sandbox.midtrans.com/snap/snap.js',
      },
    };
  }
}
