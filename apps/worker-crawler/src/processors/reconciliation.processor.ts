import { Job } from 'bullmq';
import { eq, and, or, desc, inArray } from 'drizzle-orm';
import {
  db,
  reconciliationBatches,
  reconciliationDiscrepancies,
  invoiceTransactions,
  subscriptions,
  tenantQuotaLedgers,
  tenantMembers,
  subscriptionPriceMatrices,
} from '@polaris/database';
import { MidtransReportAdapter, MidtransFeeCalculator } from '@polaris/payment';
import { GatewaySettlementRecord } from '@polaris/core-domain';
import {
  ReconciliationBatchStatus,
  DiscrepancyType,
  DiscrepancyResolutionStatus,
  PaymentStatus,
  SubscriptionStatus,
} from '@polaris/shared-types';
import { ReconciliationJobPayload } from '../queues/reconciliation.queue.js';
import { redisConnection } from '../config/redis.connection.js';

export class ReconciliationProcessor {
  private static readonly reportAdapter = new MidtransReportAdapter();

  /**
   * Eksekutor utama yang dipicu otomatis oleh BullMQ Cron (01.30 WIB) atau Superadmin Trigger
   */
  public static async process(job: Job<ReconciliationJobPayload>): Promise<any> {
    let targetDate = job.data.reconDate;

    // 1. Jika bernilai 'YESTERDAY', hitung tanggal H-1 (WIB / UTC+7 deterministik)
    if (targetDate === 'YESTERDAY') {
      const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);
      targetDate = yesterday.toISOString().slice(0, 10);
    }

    const executedBy = job.data.triggeredBy || 'SYSTEM_CRON';
    console.log(`[ReconWorker] Memulai audit rekonsiliasi kas tanggal: ${targetDate} (Job #${job.id}, Pelaksana: ${executedBy})...`);

    // 2. Cegah duplikasi audit jika batch tanggal tersebut sudah selesai dan berstatus BALANCED
    const [existingBatch] = await db
      .select({ id: reconciliationBatches.id, status: reconciliationBatches.status })
      .from(reconciliationBatches)
      .where(
        and(
          eq(reconciliationBatches.reconDate, targetDate),
          eq(reconciliationBatches.sourceGateway, 'MIDTRANS')
        )
      )
      .orderBy(desc(reconciliationBatches.createdAt))
      .limit(1);

    if (existingBatch && [ReconciliationBatchStatus.BALANCED, ReconciliationBatchStatus.RESOLVED].includes(existingBatch.status as any)) {
      console.log(`[ReconWorker] Batch ${targetDate} sudah berstatus ${existingBatch.status}. Audit dilewati.`);
      return { status: 'SKIPPED_ALREADY_BALANCED', batchId: existingBatch.id };
    }

    // 3. Ambil data mutasi penyelesaian resmi dari Gateway (CSV Upload atau Core API)
    let gatewayRecords: GatewaySettlementRecord[] = [];

    if (job.data.csvContent) {
      gatewayRecords = await this.reportAdapter.parseSettlementCsv(job.data.csvContent);
    } else {
      // Ambil transaksi internal yang belum direkonsiliasi untuk dicocokkan statusnya ke API Midtrans
      const pendingInvoices = await db
        .select({ gatewayOrderId: invoiceTransactions.gatewayOrderId })
        .from(invoiceTransactions)
        .where(
          or(
            eq(invoiceTransactions.reconciliationStatus, 'UNRECONCILED'),
            eq(invoiceTransactions.paymentStatus, PaymentStatus.PENDING)
          )
        )
        .limit(100);

      const orderIds = pendingInvoices
        .map((inv) => inv.gatewayOrderId)
        .filter((id): id is string => Boolean(id));

      gatewayRecords = await this.reportAdapter.fetchSettlementListByDate(targetDate, orderIds);
    }

    console.log(`[ReconWorker] Berhasil mengumpulkan ${gatewayRecords.length} mutasi penyelesaian dari Midtrans.`);

    // 4. Eksekusi Algoritma 5-Way Matching di dalam Transaksi Database ACID
    const dateStr = targetDate.replace(/-/g, '');
    const randomSuffix = Math.random().toString(36).substring(2, 6).toUpperCase();
    const batchNumber = `REC-${dateStr}-${randomSuffix}`;

    return await db.transaction(async (tx) => {
      // Inisialisasi Header Batch Rekonsiliasi
      const [batchRecord] = await tx
        .insert(reconciliationBatches)
        .values({
          batchNumber,
          reconDate: targetDate,
          sourceGateway: job.data.csvContent ? 'MIDTRANS_CSV' : 'MIDTRANS',
          totalGatewayTransactions: gatewayRecords.length,
          status: ReconciliationBatchStatus.PROCESSING,
          executedBy,
          notes: `Audit otonom harian transaksi ${targetDate}`,
        })
        .returning();

      // Query seluruh tagihan internal terkait
      const gatewayOrderIds = gatewayRecords.map((r) => r.gatewayOrderId);

      const internalInvoices = await tx
        .select()
        .from(invoiceTransactions)
        .where(
          gatewayOrderIds.length > 0
            ? or(
                inArray(invoiceTransactions.gatewayOrderId, gatewayOrderIds),
                eq(invoiceTransactions.reconciliationStatus, 'UNRECONCILED')
              )
            : eq(invoiceTransactions.reconciliationStatus, 'UNRECONCILED')
        );

      const gatewayMap = new Map<string, GatewaySettlementRecord>(
        gatewayRecords.map((r) => [r.gatewayOrderId, r])
      );
      const internalMap = new Map<string, typeof invoiceTransactions.$inferSelect>(
        internalInvoices.map((i) => [i.gatewayOrderId, i])
      );

      const allOrderIds = new Set<string>([...gatewayMap.keys(), ...internalMap.keys()]);

      let matchedCount = 0;
      let totalGrossIdr = 0;
      let totalMdrIdr = 0;
      let totalNetIdr = 0;
      const discrepanciesToInsert: Array<typeof reconciliationDiscrepancies.$inferInsert> = [];

      for (const orderId of allOrderIds) {
        const gw = gatewayMap.get(orderId);
        const internal = internalMap.get(orderId);

        // KASUS 4: Uang masuk di Midtrans tapi tidak ada invoice internal (MISSING_IN_INTERNAL)
        if (gw && !internal) {
          discrepanciesToInsert.push({
            batchId: batchRecord.id,
            gatewayOrderId: orderId,
            discrepancyType: DiscrepancyType.MISSING_IN_INTERNAL,
            gatewayStatus: gw.paymentStatus,
            internalStatus: null,
            internalAmountIdr: '0.00',
            gatewayAmountIdr: gw.grossAmountIdr.toString(),
            discrepancyAmountIdr: gw.grossAmountIdr.toString(),
            resolutionStatus: DiscrepancyResolutionStatus.UNRESOLVED,
            resolutionNotes: 'Dana ditarik di Midtrans namun tidak ada record tagihan internal.',
          });
          continue;
        }

        // KASUS 5: Di internal berstatus lunas tapi tidak ada di mutasi Midtrans (MISSING_IN_GATEWAY)
        if (!gw && internal) {
          if (internal.paymentStatus === PaymentStatus.SETTLEMENT) {
            const internalGross = Number(internal.grossAmountIdr || internal.amountIdr);
            discrepanciesToInsert.push({
              batchId: batchRecord.id,
              invoiceId: internal.id,
              gatewayOrderId: orderId,
              discrepancyType: DiscrepancyType.MISSING_IN_GATEWAY,
              internalStatus: internal.paymentStatus,
              gatewayStatus: null,
              internalAmountIdr: internalGross.toString(),
              gatewayAmountIdr: '0.00',
              discrepancyAmountIdr: internalGross.toString(),
              resolutionStatus: DiscrepancyResolutionStatus.UNRESOLVED,
              resolutionNotes: 'Invoice lunas di internal namun nihil di mutasi resmi gateway.',
            });

            await tx
              .update(invoiceTransactions)
              .set({
                reconciliationStatus: 'DISCREPANCY',
                reconciliationBatchId: batchRecord.id,
              })
              .where(eq(invoiceTransactions.id, internal.id));
          }
          continue;
        }

        // KASUS DUA PIHAK ADA: Komparasi Status & Nilai Nominal
        if (gw && internal) {
          const internalGross = Number(internal.grossAmountIdr || internal.amountIdr);
          const gwGross = gw.grossAmountIdr;
          const amountDiff = Math.abs(internalGross - gwGross);

          // KASUS 3: Selisih Nominal Melebihi Toleransi Rp 2 (AMOUNT_MISMATCH)
          if (amountDiff > 2) {
            discrepanciesToInsert.push({
              batchId: batchRecord.id,
              invoiceId: internal.id,
              gatewayOrderId: orderId,
              discrepancyType: DiscrepancyType.AMOUNT_MISMATCH,
              internalStatus: internal.paymentStatus,
              gatewayStatus: gw.paymentStatus,
              internalAmountIdr: internalGross.toString(),
              gatewayAmountIdr: gwGross.toString(),
              discrepancyAmountIdr: amountDiff.toString(),
              resolutionStatus: DiscrepancyResolutionStatus.UNRESOLVED,
              resolutionNotes: `Selisih nominal tagihan (Internal: Rp ${internalGross} vs Gateway: Rp ${gwGross}).`,
            });

            await tx
              .update(invoiceTransactions)
              .set({
                reconciliationStatus: 'DISCREPANCY',
                reconciliationBatchId: batchRecord.id,
              })
              .where(eq(invoiceTransactions.id, internal.id));
            continue;
          }

          // KASUS 2: SELF-HEALING (Missed Webhook: Internal PENDING tapi di Midtrans SETTLEMENT)
          if (gw.paymentStatus === 'SETTLEMENT' && internal.paymentStatus === PaymentStatus.PENDING) {
            console.log(`[ReconWorker Self-Healing] Memulihkan transaksi tertunda Order ID: ${orderId}...`);

            const feeCalc = MidtransFeeCalculator.calculate(gwGross, gw.paymentType);
            const settlementDate = gw.settlementTime || new Date();

            await tx
              .update(invoiceTransactions)
              .set({
                paymentStatus: PaymentStatus.SETTLEMENT,
                paymentMethod: gw.paymentType,
                grossAmountIdr: feeCalc.grossAmountIdr.toString(),
                mdrFeeIdr: feeCalc.mdrFeeIdr.toString(),
                vatFeeIdr: feeCalc.vatFeeIdr.toString(),
                netAmountIdr: feeCalc.netAmountIdr.toString(),
                paidAt: settlementDate,
                settlementTime: settlementDate,
                reconciliationStatus: 'MATCHED',
                reconciliationBatchId: batchRecord.id,
              })
              .where(eq(invoiceTransactions.id, internal.id));

            // Pulihkan dan aktifkan lisensi dewan
            await this.autoHealSubscription(tx, internal.subscriptionId, gwGross, settlementDate);

            discrepanciesToInsert.push({
              batchId: batchRecord.id,
              invoiceId: internal.id,
              gatewayOrderId: orderId,
              discrepancyType: DiscrepancyType.STATUS_MISMATCH,
              internalStatus: PaymentStatus.PENDING,
              gatewayStatus: 'SETTLEMENT',
              internalAmountIdr: internalGross.toString(),
              gatewayAmountIdr: gwGross.toString(),
              discrepancyAmountIdr: '0.00',
              resolutionStatus: DiscrepancyResolutionStatus.AUTO_RESOLVED,
              resolutionNotes: 'Self-healed otomatis oleh daemon audit 01.30 WIB: Webhook macet dipulihkan dan lisensi diaktifkan.',
              resolvedAt: new Date(),
            });

            matchedCount++;
            totalGrossIdr += feeCalc.grossAmountIdr;
            totalMdrIdr += feeCalc.mdrFeeIdr + feeCalc.vatFeeIdr;
            totalNetIdr += feeCalc.netAmountIdr;
            continue;
          }

          // KASUS 1: MATCHED SEMPURNA (Status Lunas & Nominal Seimbang)
          if (gw.paymentStatus === 'SETTLEMENT' && internal.paymentStatus === PaymentStatus.SETTLEMENT) {
            let mdr = Number(internal.mdrFeeIdr || 0);
            let vat = Number(internal.vatFeeIdr || 0);
            let net = Number(internal.netAmountIdr || 0);

            if (mdr === 0 && vat === 0) {
              const feeRecalc = MidtransFeeCalculator.calculate(gwGross, gw.paymentType || internal.paymentMethod || 'bank_transfer');
              mdr = feeRecalc.mdrFeeIdr;
              vat = feeRecalc.vatFeeIdr;
              net = feeRecalc.netAmountIdr;
            }

            await tx
              .update(invoiceTransactions)
              .set({
                grossAmountIdr: gwGross.toString(),
                mdrFeeIdr: mdr.toString(),
                vatFeeIdr: vat.toString(),
                netAmountIdr: net.toString(),
                settlementTime: gw.settlementTime || internal.settlementTime || internal.paidAt,
                reconciliationStatus: 'MATCHED',
                reconciliationBatchId: batchRecord.id,
              })
              .where(eq(invoiceTransactions.id, internal.id));

            matchedCount++;
            totalGrossIdr += gwGross;
            totalMdrIdr += mdr + vat;
            totalNetIdr += net;
          }
        }
      }

      // Simpan log selisih jika ada
      if (discrepanciesToInsert.length > 0) {
        await tx.insert(reconciliationDiscrepancies).values(discrepanciesToInsert);
      }

      const unresolvedDiscrepancies = discrepanciesToInsert.filter(
        (d) => d.resolutionStatus === DiscrepancyResolutionStatus.UNRESOLVED
      );

      const finalStatus =
        unresolvedDiscrepancies.length === 0
          ? ReconciliationBatchStatus.BALANCED
          : ReconciliationBatchStatus.DISCREPANCY_DETECTED;

      // Update Header Batch Selesai
      const [finalBatch] = await tx
        .update(reconciliationBatches)
        .set({
          totalInternalTransactions: internalInvoices.length,
          totalMatchedTransactions: matchedCount,
          totalDiscrepancies: unresolvedDiscrepancies.length,
          totalGrossAmountIdr: totalGrossIdr.toString(),
          totalMdrFeeIdr: totalMdrIdr.toString(),
          totalNetAmountIdr: totalNetIdr.toString(),
          status: finalStatus,
          updatedAt: new Date(),
        })
        .where(eq(reconciliationBatches.id, batchRecord.id))
        .returning();

      // Jika ada selisih kas, siarkan alarm darurat ke dashboard Superadmin
      if (unresolvedDiscrepancies.length > 0) {
        await redisConnection.publish('realtime:broadcast', JSON.stringify({
          id: `recon_alert_${Date.now()}`,
          title: '⚠️ Peringatan Selisih Rekonsiliasi Kas!',
          message: `Audit harian ${batchNumber} (${targetDate}) mendeteksi ${unresolvedDiscrepancies.length} transaksi selisih. Mohon segera ditinjau di Konsol Superadmin.`,
          category: 'BILLING',
          link: '/superadmin/reconciliation',
          timestamp: Date.now(),
        })).catch(() => null);
      }

      console.log(
        `[ReconWorker] Audit Selesai: Batch ${batchNumber} Status = ${finalStatus} (Cocok: ${matchedCount}, Selisih: ${unresolvedDiscrepancies.length}, Net Kas Masuk: Rp ${totalNetIdr.toLocaleString('id-ID')})`
      );

      return finalBatch;
    });
  }

  /**
   * Helper pemulihan lisensi dewan secara atomik pasca self-healing
   */
  private static async autoHealSubscription(
    tx: any,
    subscriptionId: string,
    grossAmountIdr: number,
    settlementDate: Date
  ): Promise<void> {
    const [sub] = await tx
      .select()
      .from(subscriptions)
      .where(eq(subscriptions.id, subscriptionId))
      .limit(1);

    if (!sub) return;

    let durationDays = 30;
    let targetPlanTier = sub.planTier;

    const [member] = await tx
      .select({ legislativeLevel: tenantMembers.legislativeLevel })
      .from(tenantMembers)
      .where(eq(tenantMembers.id, sub.tenantId))
      .limit(1);

    if (member) {
      const [matchedMatrix] = await tx
        .select()
        .from(subscriptionPriceMatrices)
        .where(
          and(
            eq(subscriptionPriceMatrices.legislativeLevel, member.legislativeLevel),
            eq(subscriptionPriceMatrices.amountIdr, grossAmountIdr.toString())
          )
        )
        .limit(1);

      if (matchedMatrix) {
        durationDays = matchedMatrix.durationDays;
        targetPlanTier = matchedMatrix.planTier;
      } else {
        const [anyMatchedMatrix] = await tx
          .select()
          .from(subscriptionPriceMatrices)
          .where(
            and(
              eq(subscriptionPriceMatrices.amountIdr, grossAmountIdr.toString()),
              eq(subscriptionPriceMatrices.isActive, true)
            )
          )
          .limit(1);

        if (anyMatchedMatrix) {
          durationDays = anyMatchedMatrix.durationDays;
          targetPlanTier = anyMatchedMatrix.planTier;
        }
      }
    }

    const baseDate = sub.currentPeriodEnd && new Date(sub.currentPeriodEnd) > settlementDate
      ? new Date(sub.currentPeriodEnd)
      : settlementDate;

    const periodEnd = new Date(baseDate.getTime() + durationDays * 24 * 60 * 60 * 1000);
    const graceEnd = new Date(periodEnd.getTime() + 3 * 24 * 60 * 60 * 1000);
    const currentMonth = settlementDate.toISOString().slice(0, 7);

    await tx
      .update(subscriptions)
      .set({
        status: SubscriptionStatus.ACTIVE,
        planTier: targetPlanTier,
        currentPeriodStart: sub.currentPeriodStart || settlementDate,
        currentPeriodEnd: periodEnd,
        gracePeriodEnd: graceEnd,
        updatedAt: new Date(),
      })
      .where(eq(subscriptions.id, sub.id));

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
  }
}
