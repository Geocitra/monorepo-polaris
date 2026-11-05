import {
  Injectable,
  Logger,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import {
  db,
  eq,
  desc,
  tenantQuotaWallets,
  tenantQuotaTransactions,
  contentBriefs,
  subscriptions,
} from '@polaris/database';
import { QuotaTransactionType } from '@polaris/shared-types';

export interface DeductQuotaParams {
  tenantId: string;
  cost: number;
  briefId?: string;
  referenceCode?: string;
  isUrgentOverquota?: boolean;
}

export interface RefundQuotaParams {
  tenantId: string;
  briefId: string;
  reason?: string;
  isCancelledByClient?: boolean;
}

export interface AllocatePackageQuotaParams {
  tenantId: string;
  quotaAmount: number;
  periodEnd: Date;
  referenceCode?: string;
  notes?: string;
}

@Injectable()
export class QuotaWalletService {
  private readonly logger = new Logger(QuotaWalletService.name);

  /**
   * Mengambil saldo dompet kuota tenant dengan mekanisme self-healing.
   * Jika tenant belum memiliki record dompet, inisialisasi otomatis dari status subscriptions.
   */
  public async getTenantQuotaWallet(tenantId: string) {
    let [wallet] = await db
      .select()
      .from(tenantQuotaWallets)
      .where(eq(tenantQuotaWallets.tenantId, tenantId))
      .limit(1);

    if (!wallet) {
      // Self-healing: buat dompet baru jika belum ada
      const [sub] = await db
        .select()
        .from(subscriptions)
        .where(eq(subscriptions.tenantId, tenantId))
        .limit(1);

      const now = new Date();
      const isActive = sub?.status === 'ACTIVE' && sub.currentPeriodEnd && new Date(sub.currentPeriodEnd) > now;
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

      wallet = inserted || (await db
        .select()
        .from(tenantQuotaWallets)
        .where(eq(tenantQuotaWallets.tenantId, tenantId))
        .limit(1)
        .then((r) => r[0]));
    }

    const now = new Date();
    const isExpired = wallet.currentPeriodEnd ? new Date(wallet.currentPeriodEnd) <= now : true;
    const effectiveRemaining = isExpired ? 0 : wallet.remainingQuota;

    return {
      ...wallet,
      isExpired,
      effectiveRemaining,
    };
  }

  /**
   * Alokasi kuota paket internet (Aktivasi Baru, Perpanjangan SPK, atau Midtrans Settlement).
   * Menjamin konsistensi atomik antara saldo dompet dan buku besar mutasi (Ledger).
   */
  public async allocatePackageQuota(params: AllocatePackageQuotaParams): Promise<{
    totalQuotaAllocated: number;
    remainingQuota: number;
  }> {
    const { tenantId, quotaAmount, periodEnd, referenceCode, notes } = params;

    return await db.transaction(async (tx) => {
      const now = new Date();
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

      await tx.insert(tenantQuotaTransactions).values({
        tenantId,
        referenceCode: referenceCode || null,
        transactionType: QuotaTransactionType.PACKAGE_PURCHASE,
        amountDelta: quotaAmount,
        balanceAfter: newRemaining,
        notes: notes || `Pembelian / aktivasi paket lisensi (+${quotaAmount} kuota request)`,
        createdAt: now,
      });

      this.logger.log(
        `[QuotaWallet] Alokasi kuota paket berhasil: Tenant=${tenantId}, +${quotaAmount} request, Saldo=${newRemaining}`
      );

      return {
        totalQuotaAllocated: newAllocated,
        remainingQuota: newRemaining,
      };
    });
  }

  /**
   * Pemotongan kuota secara atomik dengan Row-Level Lock (SELECT ... FOR UPDATE).
   * Mencegah race condition dan memastikan saldo tidak pernah menjadi minus.
   */
  public async deductQuota(params: DeductQuotaParams): Promise<{
    success: boolean;
    remainingQuota: number;
  }> {
    const { tenantId, cost, briefId, referenceCode, isUrgentOverquota } = params;

    return await db.transaction(async (tx) => {
      // 1. Kunci baris dompet tenant dengan FOR UPDATE
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
          'Masa aktif paket lisensi Anda telah berakhir. Silakan lakukan perpanjangan paket untuk request baru.'
        );
      }

      if (wallet.remainingQuota < cost) {
        throw new ForbiddenException(
          `Saldo kuota Anda tidak mencukupi (Tersisa: ${wallet.remainingQuota}, Dibutuhkan: ${cost}).`
        );
      }

      const newRemaining = wallet.remainingQuota - cost;

      // 2. Mutasi saldo dompet
      await tx
        .update(tenantQuotaWallets)
        .set({
          remainingQuota: newRemaining,
          updatedAt: now,
        })
        .where(eq(tenantQuotaWallets.id, wallet.id));

      // 3. Catat di Buku Besar Transaksi (Immutable Ledger)
      const txType = isUrgentOverquota
        ? QuotaTransactionType.URGENT_SURGE_CONSUME
        : QuotaTransactionType.REGULAR_CONSUME;

      await tx.insert(tenantQuotaTransactions).values({
        tenantId,
        briefId: briefId || null,
        referenceCode: referenceCode || null,
        transactionType: txType,
        amountDelta: -cost,
        balanceAfter: newRemaining,
        notes: isUrgentOverquota
          ? `Pengajuan darurat over-quota jatah mingguan (biaya x2)`
          : `Pengajuan materi reguler`,
        createdAt: now,
      });

      this.logger.log(
        `[QuotaWallet] Pemotongan berhasil: Tenant=${tenantId}, Cost=${cost}, Sisa=${newRemaining}, Jenis=${txType}`
      );

      return {
        success: true,
        remainingQuota: newRemaining,
      };
    });
  }

  /**
   * Pengembalian kuota (Refund) secara atomik saat tiket ditolak operator atau dibatalkan sah.
   * Nilai kuota yang dikembalikan membaca riwayat asli tiket (mengembalikan 1 atau 2 kuota secara presisi).
   */
  public async refundQuota(params: RefundQuotaParams): Promise<{
    refundedCost: number;
    remainingQuota: number;
  }> {
    const { tenantId, briefId, reason, isCancelledByClient } = params;

    return await db.transaction(async (tx) => {
      // 1. Ambil data brief untuk mengetahui biaya kuota riil yang pernah dipotong
      const [brief] = await tx
        .select({
          id: contentBriefs.id,
          briefCode: contentBriefs.briefCode,
          quotaCostDeducted: contentBriefs.quotaCostDeducted,
        })
        .from(contentBriefs)
        .where(eq(contentBriefs.id, briefId))
        .limit(1);

      const refundCost = brief?.quotaCostDeducted || 1;

      // 2. Kunci baris dompet tenant dengan FOR UPDATE
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
        wallet.remainingQuota + refundCost
      );

      // 3. Tambahkan kembali saldo ke dompet
      await tx
        .update(tenantQuotaWallets)
        .set({
          remainingQuota: newRemaining,
          updatedAt: now,
        })
        .where(eq(tenantQuotaWallets.id, wallet.id));

      // 4. Catat di Buku Besar Transaksi (Immutable Ledger)
      const txType = isCancelledByClient
        ? QuotaTransactionType.REFUND_CANCELLED
        : QuotaTransactionType.REFUND_REJECTED;

      await tx.insert(tenantQuotaTransactions).values({
        tenantId,
        briefId: brief?.id || null,
        referenceCode: brief?.briefCode || null,
        transactionType: txType,
        amountDelta: refundCost,
        balanceAfter: newRemaining,
        notes: reason || (isCancelledByClient ? 'Pembatalan tiket oleh klien' : 'Penolakan tiket oleh redaksi'),
        createdAt: now,
      });

      this.logger.log(
        `[QuotaWallet] Refund berhasil: Tenant=${tenantId}, Brief=${brief?.briefCode}, Refund=+${refundCost}, Saldo=${newRemaining}`
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

