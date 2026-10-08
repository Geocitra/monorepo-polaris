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
  subscriptionPriceMatrices,
} from '@polaris/database';
import { MidtransPaymentAdapter, MidtransFeeCalculator } from '@polaris/payment';
import {
  SubscriptionStatus,
  PaymentStatus,
  PlanTier,
} from '@polaris/shared-types';
import { AiCostCalculator, EntitlementPolicy } from '@polaris/core-domain';
import { CreateCheckoutDto, CheckoutResponseDto, BillingStatusDto } from './dto/billing.dto.js';
import { RedisService } from '../redis/redis.service.js';

@Injectable()
export class BillingService {
  private readonly logger = new Logger(BillingService.name);
  private readonly paymentGateway = new MidtransPaymentAdapter();

  constructor(private readonly redisService?: RedisService) {}

  private getFallbackPrice(cycle?: string): { amountIdr: number; durationDays: number } {
    const key = (cycle || 'MONTHLY').toUpperCase();
    switch (key) {
      case 'ANNUAL':
        return { amountIdr: 20000000, durationDays: 365 };
      case 'SEMESTER':
        return { amountIdr: 10000000, durationDays: 180 };
      default:
        return { amountIdr: 2000000, durationDays: 30 };
    }
  }

  async createSubscriptionCheckout(
    tenantId: string,
    dto: CreateCheckoutDto
  ): Promise<CheckoutResponseDto> {
    const [member] = await db
      .select({
        id: tenantMembers.id,
        fullName: tenantMembers.fullName,
        email: tenantMembers.email,
        phoneNumber: tenantMembers.phoneNumber,
        legislativeLevel: tenantMembers.legislativeLevel,
      })
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

    let priceRecord: any = null;
    if (dto.matrixId) {
      [priceRecord] = await db
        .select()
        .from(subscriptionPriceMatrices)
        .where(
          and(
            eq(subscriptionPriceMatrices.id, dto.matrixId),
            eq(subscriptionPriceMatrices.legislativeLevel, member.legislativeLevel),
            eq(subscriptionPriceMatrices.isActive, true)
          )
        )
        .limit(1);
    }

    const selectedTier = (dto.planTier || priceRecord?.planTier || sub.planTier || 'PRO').toString().toUpperCase() as any;
    const rawCycle = (dto.billingCycle || priceRecord?.billingCycle || 'MONTHLY').toString().toUpperCase();
    const selectedCycle = rawCycle === 'ANNUAL' || rawCycle === 'SEMESTER' ? rawCycle : 'MONTHLY';

    if (!priceRecord) {
      // Information Expert: Kueri harga resmi dari subscription_price_matrices
      [priceRecord] = await db
        .select()
        .from(subscriptionPriceMatrices)
        .where(
          and(
            eq(subscriptionPriceMatrices.legislativeLevel, member.legislativeLevel),
            eq(subscriptionPriceMatrices.planTier, selectedTier),
            eq(subscriptionPriceMatrices.billingCycle, selectedCycle),
            eq(subscriptionPriceMatrices.isActive, true)
          )
        )
        .limit(1);
    }

    const fallback = this.getFallbackPrice(selectedCycle);
    const amountIdr = priceRecord ? Number(priceRecord.amountIdr) : fallback.amountIdr;

    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const randomSuffix = Math.random().toString(36).substring(2, 7).toUpperCase();
    const invoiceNumber = `INV-${dateStr}-${randomSuffix}`;

    const snapResult = await this.paymentGateway.createInvoice({
      invoiceNumber,
      amountIdr,
      customerName: member.fullName,
      customerEmail: member.email,
      customerPhone: member.phoneNumber,
    });

    await db.insert(invoiceTransactions).values({
      subscriptionId: sub.id,
      matrixId: priceRecord ? priceRecord.id : null,
      invoiceNumber,
      amountIdr: amountIdr.toString(),
      grossAmountIdr: amountIdr.toString(),
      gatewayOrderId: invoiceNumber,
      paymentStatus: PaymentStatus.PENDING,
      reconciliationStatus: 'UNRECONCILED',
    });

    this.logger.log(
      `[BillingCheckout] Invoice dibuat: ${invoiceNumber} (Rp ${amountIdr.toLocaleString('id-ID')}) untuk ${member.fullName} [${member.legislativeLevel} / ${selectedTier} / ${selectedCycle}]`
    );

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

      // Resolusi Durasi dan Tier Paket Berdasarkan Matriks Harga Resmi
      const [member] = await tx
        .select({
          id: tenantMembers.id,
          legislativeLevel: tenantMembers.legislativeLevel,
        })
        .from(tenantMembers)
        .where(eq(tenantMembers.id, sub.tenantId))
        .limit(1);

      let durationDays = 30;
      let targetPlanTier = sub.planTier;

      if (invoice.matrixId) {
        const [directMatrix] = await tx
          .select()
          .from(subscriptionPriceMatrices)
          .where(eq(subscriptionPriceMatrices.id, invoice.matrixId))
          .limit(1);

        if (directMatrix) {
          durationDays = directMatrix.durationDays;
          targetPlanTier = directMatrix.planTier;
        }
      } else if (member) {
        const [matchedMatrix] = await tx
          .select()
          .from(subscriptionPriceMatrices)
          .where(
            and(
              eq(subscriptionPriceMatrices.legislativeLevel, member.legislativeLevel),
              eq(subscriptionPriceMatrices.amountIdr, invoice.amountIdr)
            )
          )
          .limit(1);

        if (matchedMatrix) {
          durationDays = matchedMatrix.durationDays;
          targetPlanTier = matchedMatrix.planTier;
        } else {
          // Fallback deterministik: Cari matriks aktif dengan nominal persis sama
          const [anyMatchedMatrix] = await tx
            .select()
            .from(subscriptionPriceMatrices)
            .where(
              and(
                eq(subscriptionPriceMatrices.amountIdr, invoice.amountIdr),
                eq(subscriptionPriceMatrices.isActive, true)
              )
            )
            .limit(1);

          if (anyMatchedMatrix) {
            durationDays = anyMatchedMatrix.durationDays;
            targetPlanTier = anyMatchedMatrix.planTier;
            this.logger.warn(
              `[BillingService] Matriks level mismatch untuk nominal ${invoice.amountIdr} (Level Anggota: ${member.legislativeLevel}, Level Matriks: ${anyMatchedMatrix.legislativeLevel}). Menggunakan durasi sah ${durationDays} hari.`
            );
          } else {
            this.logger.warn(
              `[BillingService] Tidak ditemukan matriks harga persis untuk invoice ${invoice.invoiceNumber} nominal ${invoice.amountIdr}. Menggunakan durasi standar (30 hari).`
            );
          }
        }
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
          planTier: targetPlanTier,
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

    // Ambil data anggota dewan untuk resolusi legislativeLevel
    const [member] = await db
      .select({
        id: tenantMembers.id,
        legislativeLevel: tenantMembers.legislativeLevel,
      })
      .from(tenantMembers)
      .where(eq(tenantMembers.id, tenantId))
      .limit(1);

    // Information Expert: Kueri harga terisolasi HANYA untuk tingkat legislatif anggota ini
    // Information Expert: Kueri penawaran berjenjang 3D Tensor untuk tingkat legislatif anggota ini
    let availablePlans: any[] = [];
    let tierOfferings: any[] = [];

    if (member?.legislativeLevel) {
      // Ambil SELURUH matriks aktif untuk level ini (3 Tier x 3 Siklus = 9 baris)
      const allMatrices = await db
        .select()
        .from(subscriptionPriceMatrices)
        .where(
          and(
            eq(subscriptionPriceMatrices.legislativeLevel, member.legislativeLevel),
            eq(subscriptionPriceMatrices.isActive, true)
          )
        );

      const targetTier = (sub.planTier || 'PRO') as any;
      let priceRecords = allMatrices.filter((m) => m.planTier === targetTier);
      if (priceRecords.length === 0) {
        priceRecords = allMatrices;
      }
      priceRecords.sort((a, b) => a.durationDays - b.durationDays);

      availablePlans = priceRecords.map((p) => {
        const amt = Number(p.amountIdr);
        const priceFormatted = new Intl.NumberFormat('id-ID', {
          style: 'currency',
          currency: 'IDR',
          maximumFractionDigits: 0,
        }).format(amt).replace(/\s/g, '');

        let name = '1 Bulan';
        let badge = 'Fleksibel';
        let badgeClass = 'bg-slate-100 text-slate-600';
        let tagline = 'Cocok untuk evaluasi awal atau masa sidang singkat';
        let savings: string | null = null;
        let originalPriceFormatted: string | null = null;
        let rateNote = `/ 30 hari`;
        let highlight = false;

        if (p.billingCycle === 'SEMESTER') {
          name = '6 Bulan';
          badge = 'Paling Populer';
          badgeClass = 'bg-blue-600 text-white shadow-xs';
          highlight = true;
          tagline = 'Ideal untuk 1 siklus masa persidangan & reses';
          rateNote = `~Rp${(Math.round((amt / 6) / 100000) / 10).toLocaleString('id-ID')} Jt/bln`;
        } else if (p.billingCycle === 'ANNUAL') {
          name = '1 Tahun';
          badge = 'Nilai Terbaik';
          badgeClass = 'bg-amber-100 text-amber-900 border border-amber-200';
          tagline = 'Mencakup 1 tahun anggaran APBN/APBD penuh';
          rateNote = `~Rp${(Math.round((amt / 12) / 100000) / 10).toLocaleString('id-ID')} Jt/bln`;
        }

        return {
          id: p.billingCycle,
          matrixId: p.id,
          name,
          durationLabel: `${p.durationDays} Hari`,
          badge,
          badgeClass,
          tier: p.planTier,
          cycle: p.billingCycle,
          durationDays: p.durationDays,
          amountIdr: amt,
          priceFormatted,
          originalPriceFormatted,
          rateNote,
          tagline,
          savings,
          highlight,
          perks: [
            `+${p.durationDays} Hari Masa Aktif Penuh`,
            'AI Unlimited (Naskah & Poster)',
            p.planTier === 'STARTER' ? 'Portal Resmi Standar Parlemen' : 'Dukungan Custom Domain & Layout Tematik',
            'Garansi Akumulasi Hari Tidak Hangus',
          ],
        };
      });

      // Pure Fabrication (EntitlementPolicy): Bangun struktur penawaran berjenjang 2 Tier (STARTER & PRO)
      const tiers: PlanTier[] = [PlanTier.STARTER, PlanTier.PRO];
      const cycles = ['MONTHLY', 'SEMESTER', 'ANNUAL'];

      tierOfferings = tiers.map((tier) => {
        const entitlement = EntitlementPolicy.getEntitlement(tier);
        const tierMatrices = allMatrices.filter((m) => m.planTier === tier);
        const cyclePricing: Record<string, any> = {};

        cycles.forEach((cycle) => {
          const matched = tierMatrices.find((m) => m.billingCycle === cycle);
          if (matched) {
            const amt = Number(matched.amountIdr);
            const months = matched.durationDays <= 31 ? 1 : matched.durationDays <= 185 ? 6 : 12;
            const monthlyRate = Math.round(amt / months);

            let savingsNote: string | undefined;
            if (cycle === 'SEMESTER') {
              savingsNote = 'Hemat ~15% dibanding bulanan';
            } else if (cycle === 'ANNUAL') {
              savingsNote = 'Hemat ~25% dibanding bulanan';
            }

            cyclePricing[cycle] = {
              matrixId: matched.id,
              cycle,
              durationDays: matched.durationDays,
              amountIdr: amt,
              priceFormatted: new Intl.NumberFormat('id-ID', {
                style: 'currency',
                currency: 'IDR',
                maximumFractionDigits: 0,
              }).format(amt).replace(/\s/g, ''),
              monthlyRateFormatted: new Intl.NumberFormat('id-ID', {
                style: 'currency',
                currency: 'IDR',
                maximumFractionDigits: 0,
              }).format(monthlyRate).replace(/\s/g, '') + '/bln',
              savingsNote,
            };
          }
        });

        // Daftar poin checklist faktual sesuai hak akses 2-tier (STARTER vs PRO)
        const perks = tier === PlanTier.STARTER
          ? [
              'Durasi Masa Aktif Penuh Sesuai Siklus',
              'AI Unlimited (Naskah Legislasi & Poster Dapil)',
              'Tata Letak Standar Parlemen Saja (Default)',
              'Domain Resmi Bawaan (subdomain.polaris.id)',
              'Pembayaran Mandiri Cepat via VA Bank & QRIS',
              'Garansi Akumulasi Sisa Hari Tidak Hangus',
            ]
          : [
              'Durasi Masa Aktif Penuh Sesuai Siklus',
              'AI Unlimited (Naskah Legislasi & Poster Dapil)',
              'Bebas Pilih Layout Tematik (Editorial, Baliho, Newsroom)',
              'Dukungan Custom Domain Pribadi (.id / .com)',
              'Fasilitasi Dokumen Administrasi SPK & Setwan',
              'Faktur Pajak Resmi Negara (PPN 11% & PPh Instansi)',
              'Prioritas Jalur Antrean Pemrosesan AI 24/7',
              'Garansi Akumulasi Sisa Hari Tidak Hangus',
            ];

        return {
          tier,
          name: entitlement.displayName,
          badge: entitlement.badge,
          tagline: entitlement.tagline,
          isCurrentTier: sub.planTier === tier,
          entitlements: {
            thematicLayouts: entitlement.thematicLayoutsEnabled,
            customDomain: entitlement.customDomainEnabled,
            spkSupport: entitlement.spkProcurementEnabled,
            priorityQueue: entitlement.priorityQueueEnabled,
          },
          perks,
          pricing: cyclePricing,
        };
      });
    }

    return {
      subscriptionStatus: sub.status,
      planTier: sub.planTier,
      currentPeriodEnd: sub.currentPeriodEnd ? sub.currentPeriodEnd.toISOString() : null,
      legislativeLevel: member?.legislativeLevel as any,
      availablePlans,
      tierOfferings,
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
