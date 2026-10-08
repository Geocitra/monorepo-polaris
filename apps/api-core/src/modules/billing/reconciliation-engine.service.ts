import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { eq, and, or, sql, desc, inArray } from 'drizzle-orm';
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
import {
  GatewaySettlementRecord,
  ReconciliationBatch,
  ReconciliationDiscrepancy,
} from '@polaris/core-domain';
import {
  ReconciliationBatchStatus,
  DiscrepancyType,
  DiscrepancyResolutionStatus,
  PaymentStatus,
  SubscriptionStatus,
} from '@polaris/shared-types';
import { MidtransFeeCalculator } from '@polaris/payment';
import { RedisService } from '../redis/redis.service.js';

export interface ExecuteReconciliationParams {
  reconDate: string; // YYYY-MM-DD
  gatewayRecords: GatewaySettlementRecord[];
  sourceGateway?: string;
  executedBy?: string;
  rawReportStorageUrl?: string | null;
  notes?: string | null;
}

const isUuid = (val?: string): boolean =>
  typeof val === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(val);

@Injectable()
export class ReconciliationEngineService {
  private readonly logger = new Logger(ReconciliationEngineService.name);

  constructor(private readonly redisService?: RedisService) {}

  /**
   * Menjalankan siklus audit rekonsiliasi kas harian menggunakan Algoritma 5-Arah.
   */
  async executeReconciliation(params: ExecuteReconciliationParams) {
    const { reconDate, gatewayRecords, sourceGateway = 'MIDTRANS', executedBy = 'SYSTEM_CRON' } = params;

    this.logger.log(`[ReconEngine] Memulai rekonsiliasi tanggal ${reconDate} (${gatewayRecords.length} mutasi gateway)...`);

    // DEDUP GUARD: Cegah batch duplikat untuk tanggal + gateway yang sama
    const [existingBatch] = await db
      .select({ id: reconciliationBatches.id, status: reconciliationBatches.status })
      .from(reconciliationBatches)
      .where(
        and(
          eq(reconciliationBatches.reconDate, reconDate),
          eq(reconciliationBatches.sourceGateway, sourceGateway)
        )
      )
      .orderBy(desc(reconciliationBatches.createdAt))
      .limit(1);

    if (existingBatch) {
      const skipStatuses = [
        ReconciliationBatchStatus.BALANCED,
        ReconciliationBatchStatus.RESOLVED,
      ];
      if (skipStatuses.includes(existingBatch.status as any)) {
        this.logger.warn(
          `[ReconEngine] Batch rekonsiliasi untuk ${reconDate}/${sourceGateway} sudah berstatus ${existingBatch.status}. Melewati eksekusi.`
        );
        throw new BadRequestException(
          `Batch rekonsiliasi tanggal ${reconDate} untuk ${sourceGateway} sudah berstatus ${existingBatch.status}. Tidak perlu dijalankan ulang.`
        );
      }
    }

    const dateStr = reconDate.replace(/-/g, '');
    const randomSuffix = Math.random().toString(36).substring(2, 6).toUpperCase();
    const batchNumber = `REC-${dateStr}-${randomSuffix}`;

    return await db.transaction(async (tx) => {
      // 1. Inisialisasi Batch Record di Database
      const [batchRecord] = await tx
        .insert(reconciliationBatches)
        .values({
          batchNumber,
          reconDate,
          sourceGateway,
          totalGatewayTransactions: gatewayRecords.length,
          status: ReconciliationBatchStatus.PROCESSING,
          rawReportStorageUrl: params.rawReportStorageUrl || null,
          executedBy,
          notes: params.notes || `Audit harian mutasi ${sourceGateway}`,
        })
        .returning();

      // 2. Query Transaksi Internal yang Relevan (Status PENDING atau SETTLEMENT di sekitar tanggal audit)
      const gatewayOrderIds = gatewayRecords.map((r) => r.gatewayOrderId);

      // Ambil transaksi internal yang cocok dengan Order ID gateway ATAU yang masih UNRECONCILED
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


      // Bentuk Indeks Hash O(1) untuk komparasi cepat
      const gatewayMap = new Map<string, GatewaySettlementRecord>(
        gatewayRecords.map((r) => [r.gatewayOrderId, r])
      );
      const internalMap = new Map<string, typeof invoiceTransactions.$inferSelect>(
        internalInvoices.map((i) => [i.gatewayOrderId, i])
      );

      // Himpunan seluruh Order ID unik (Union Set)
      const allOrderIds = new Set<string>([...gatewayMap.keys(), ...internalMap.keys()]);

      let matchedCount = 0;
      let totalGrossIdr = 0;
      let totalMdrIdr = 0;
      let totalNetIdr = 0;
      const discrepanciesToInsert: Array<typeof reconciliationDiscrepancies.$inferInsert> = [];

      // 3. Eksekusi 5-Way Matching
      for (const orderId of allOrderIds) {
        const gw = gatewayMap.get(orderId);
        const internal = internalMap.get(orderId);

        // KASUS 4: MISSING_IN_INTERNAL (Mutasi ada di gateway, tapi nihil di DB lokal)
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
            resolutionNotes: 'Dana berhasil ditarik di Midtrans namun tidak ada record tagihan internal.',
          });
          continue;
        }

        // KASUS 5: MISSING_IN_GATEWAY (Tercatat SETTLEMENT di lokal, tapi nihil di laporan gateway)
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
              resolutionNotes: 'Invoice berstatus lunas di database internal namun tidak ditemukan di settlement resmi gateway.',
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

        // Jika ada di kedua sisi (gw && internal)
        if (gw && internal) {
          const internalGross = Number(internal.grossAmountIdr || internal.amountIdr);
          const gwGross = gw.grossAmountIdr;
          const amountDiff = Math.abs(internalGross - gwGross);

          // KASUS 3: AMOUNT_MISMATCH (Selisih nominal > Rp 2)
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

          // KASUS 2: SELF-HEALING (Status Mismatch: Gateway Lunas, Internal Masih PENDING)
          if (gw.paymentStatus === 'SETTLEMENT' && internal.paymentStatus === PaymentStatus.PENDING) {
            this.logger.log(`[Recon Self-Healing] Memulihkan transaksi macet Order ID: ${orderId}...`);

            // Hitung pembukuan kas riil
            const feeCalc = MidtransFeeCalculator.calculate(gwGross, gw.paymentType);
            const settlementDate = gw.settlementTime || new Date();

            // 1. Update tagihan internal menjadi lunas
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

            // 2. Aktifkan langganan dewan
            await this.autoHealSubscription(tx, internal.subscriptionId, gwGross, settlementDate);

            // 3. Catat ke tabel selisih sebagai AUTO_RESOLVED untuk jejak audit
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
              resolutionNotes: 'Self-healed otomatis oleh mesin audit: Webhook macet dipulihkan dan lisensi diaktifkan.',
              resolvedAt: new Date(),
            });

            matchedCount++;
            totalGrossIdr += feeCalc.grossAmountIdr;
            totalMdrIdr += feeCalc.mdrFeeIdr + feeCalc.vatFeeIdr;
            totalNetIdr += feeCalc.netAmountIdr;
            continue;
          }

          // KASUS 1: MATCHED (Cocok Sempurna)
          if (gw.paymentStatus === 'SETTLEMENT' && internal.paymentStatus === PaymentStatus.SETTLEMENT) {
            // Jika internal MDR = 0, recalculate dari gateway data (perbaiki data lama yg belum terhitung fee)
            let mdr = Number(internal.mdrFeeIdr);
            let vat = Number(internal.vatFeeIdr);
            let net = Number(internal.netAmountIdr);

            if (mdr === 0 && vat === 0) {
              // Fee belum terhitung — rekalkulasi dari data gateway
              if (gw.mdrFeeIdr > 0) {
                mdr = gw.mdrFeeIdr;
                vat = gw.vatFeeIdr;
                net = gw.netAmountIdr;
              } else {
                // Fallback: Kalkulasi ulang menggunakan FeeCalculator
                const feeRecalc = MidtransFeeCalculator.calculate(gwGross, gw.paymentType || internal.paymentMethod || 'bank_transfer');
                mdr = feeRecalc.mdrFeeIdr;
                vat = feeRecalc.vatFeeIdr;
                net = feeRecalc.netAmountIdr;
              }
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

      // 4. Simpan Log Selisih jika ada
      if (discrepanciesToInsert.length > 0) {
        await tx.insert(reconciliationDiscrepancies).values(discrepanciesToInsert);
      }

      // Hitung selisih yang belum terselesaikan (unresolved)
      const unresolvedDiscrepancies = discrepanciesToInsert.filter(
        (d) => d.resolutionStatus === DiscrepancyResolutionStatus.UNRESOLVED
      );

      // Invariant Check: BALANCED jika dan hanya jika 0 selisih tak terselesaikan
      const finalStatus =
        unresolvedDiscrepancies.length === 0
          ? ReconciliationBatchStatus.BALANCED
          : ReconciliationBatchStatus.DISCREPANCY_DETECTED;

      // 5. Update Status Final Batch Rekonsiliasi
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

      // 6. Broadcast Alert ke Konsol Superadmin jika Ditemukan Selisih
      if (unresolvedDiscrepancies.length > 0 && this.redisService) {
        await this.redisService.publish('realtime:broadcast', {
          id: `recon_alert_${Date.now()}`,
          title: '⚠️ Peringatan Selisih Rekonsiliasi Kas!',
          message: `Batch ${batchNumber} (${reconDate}) mendeteksi ${unresolvedDiscrepancies.length} transaksi selisih. Mohon segera ditinjau di Konsol Superadmin.`,
          category: 'BILLING',
          link: '/superadmin/reconciliation',
          timestamp: Date.now(),
        });
      }

      this.logger.log(
        `[ReconEngine] Selesai: Batch ${batchNumber} Status = ${finalStatus} (Matched: ${matchedCount}, Discrepancies: ${unresolvedDiscrepancies.length}, Net Kas: Rp ${totalNetIdr.toLocaleString('id-ID')})`
      );

      return finalBatch;
    });
  }

  /**
   * Helper pemulihan otomatis lisensi dewan (Self-Healing).
   */
  private async autoHealSubscription(
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
        } else {
          this.logger.warn(
            `[ReconciliationEngine:AutoHeal] Tidak ada matriks harga pas untuk nominal Rp ${grossAmountIdr} (Tenant: ${sub.tenantId}). Menggunakan durasi 30 hari.`
          );
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

  /**
   * Mengambil riwayat batch rekonsiliasi untuk konsol audit superadmin.
   */
  async listBatches(query: { page?: number; limit?: number; status?: string }) {
    const page = Math.max(1, query.page || 1);
    const limit = Math.max(1, Math.min(50, query.limit || 10));
    const offset = (page - 1) * limit;

    let baseQuery = db.select().from(reconciliationBatches).$dynamic();

    if (query.status && query.status !== 'ALL') {
      baseQuery = baseQuery.where(eq(reconciliationBatches.status, query.status));
    }

    const rows = await baseQuery.orderBy(desc(reconciliationBatches.createdAt)).limit(limit).offset(offset);

    const [countResult] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(reconciliationBatches);

    return {
      items: rows,
      pagination: {
        page,
        limit,
        totalItems: countResult?.count || 0,
        totalPages: Math.ceil((countResult?.count || 0) / limit) || 1,
      },
    };
  }

  /**
   * Mengambil rincian batch dan daftar selisih transaksi terkait.
   */
  async getBatchDetail(batchId: string) {
    const [batch] = await db
      .select()
      .from(reconciliationBatches)
      .where(eq(reconciliationBatches.id, batchId))
      .limit(1);

    if (!batch) {
      throw new NotFoundException('Batch rekonsiliasi tidak ditemukan.');
    }

    const discrepancies = await db
      .select()
      .from(reconciliationDiscrepancies)
      .where(eq(reconciliationDiscrepancies.batchId, batchId))
      .orderBy(desc(reconciliationDiscrepancies.createdAt));

    const matchedInvoices = await db
      .select()
      .from(invoiceTransactions)
      .where(eq(invoiceTransactions.reconciliationBatchId, batchId))
      .orderBy(desc(invoiceTransactions.paidAt));

    return {
      batch,
      discrepancies,
      matchedInvoices,
    };
  }

  /**
   * Menyelesaikan selisih transaksi secara manual oleh Admin Finance.
   */
  async resolveDiscrepancy(
    discrepancyId: string,
    resolutionStatus: DiscrepancyResolutionStatus.MANUALLY_RESOLVED | DiscrepancyResolutionStatus.IGNORED,
    notes: string,
    adminId: string
  ) {
    const [disc] = await db
      .select()
      .from(reconciliationDiscrepancies)
      .where(eq(reconciliationDiscrepancies.id, discrepancyId))
      .limit(1);

    if (!disc) {
      throw new NotFoundException('Data selisih rekonsiliasi tidak ditemukan.');
    }

    return await db.transaction(async (tx) => {
      // 1. Update status selisih
      const [updated] = await tx
        .update(reconciliationDiscrepancies)
        .set({
          resolutionStatus,
          resolutionNotes: notes,
          resolvedBy: isUuid(adminId) ? adminId : null,
          resolvedAt: new Date(),
        })
        .where(eq(reconciliationDiscrepancies.id, discrepancyId))
        .returning();

      // 2. Evaluasi apakah seluruh selisih pada batch terkait telah tuntas
      const remainingUnresolved = await tx
        .select({ count: sql<number>`count(*)::int` })
        .from(reconciliationDiscrepancies)
        .where(
          and(
            eq(reconciliationDiscrepancies.batchId, disc.batchId),
            eq(reconciliationDiscrepancies.resolutionStatus, DiscrepancyResolutionStatus.UNRESOLVED)
          )
        );

      if ((remainingUnresolved[0]?.count || 0) === 0) {
        await tx
          .update(reconciliationBatches)
          .set({
            status: ReconciliationBatchStatus.RESOLVED,
            totalDiscrepancies: 0,
            updatedAt: new Date(),
          })
          .where(eq(reconciliationBatches.id, disc.batchId));
      }

      return updated;
    });
  }
}
