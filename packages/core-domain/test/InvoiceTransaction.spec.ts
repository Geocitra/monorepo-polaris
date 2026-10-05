import { describe, it, expect } from 'vitest';
import { InvoiceTransaction } from '../src/entities/InvoiceTransaction.js';
import { PaymentStatus } from '@polaris/shared-types';

describe('InvoiceTransaction Domain Entity (Accounting Invariants)', () => {
  it('harus berhasil membuat instance transaksi PENDING tanpa memicu invariant check', () => {
    const tx = new InvoiceTransaction(
      'tx-1',
      'sub-1',
      'INV-2026-001',
      10000000,
      0,
      0,
      0,
      'ORDER-001',
      'bank_transfer',
      PaymentStatus.PENDING
    );

    expect(tx.paymentStatus).toBe(PaymentStatus.PENDING);
    expect(tx.reconciliationStatus).toBe('UNRECONCILED');
  });

  it('harus memvalidasi persamaan akuntansi lunas: Gross = Net + MDR + VAT', () => {
    // Simulasi Virtual Account: Gross 10 Jt, MDR 4000, PPN 440, Net 9.995.560
    const tx = new InvoiceTransaction(
      'tx-2',
      'sub-1',
      'INV-2026-002',
      10000000,
      4000,
      440,
      9995560,
      'ORDER-002',
      'bank_transfer',
      PaymentStatus.SETTLEMENT
    );

    expect(() => tx.validateAccountingInvariant()).not.toThrow();
  });

  it('harus melempar AccountingInvariantError jika selisih pembukuan melebihi Rp 2', () => {
    // Simulasi pembukuan tidak seimbang: Gross 10 Jt, tapi Net + MDR + VAT hanya 9.990.000 (selisih Rp 10.000)
    expect(() => {
      new InvoiceTransaction(
        'tx-3',
        'sub-1',
        'INV-2026-003',
        10000000,
        4000,
        440,
        9985560, // Nilai net salah/kurang
        'ORDER-003',
        'bank_transfer',
        PaymentStatus.SETTLEMENT
      );
    }).toThrowError(/\[AccountingInvariantError\] Buku kas tidak seimbang/);
  });

  it('harus memperbarui status transaksi saat metode settle() dipanggil', () => {
    const tx = new InvoiceTransaction(
      'tx-4',
      'sub-1',
      'INV-2026-004',
      2000000,
      0,
      0,
      0,
      'ORDER-004',
      'qris',
      PaymentStatus.PENDING
    );

    const settleTime = new Date('2026-10-02T10:00:00Z');
    // QRIS 0.7% MDR = 14.000, PPN 11% = 1.540, Net = 1.984.460
    tx.settle({
      grossAmountIdr: 2000000,
      mdrFeeIdr: 14000,
      vatFeeIdr: 1540,
      netAmountIdr: 1984460,
      settlementTime: settleTime,
      paymentMethod: 'qris',
    });

    expect(tx.paymentStatus).toBe(PaymentStatus.SETTLEMENT);
    expect(tx.grossAmountIdr).toBe(2000000);
    expect(tx.netAmountIdr).toBe(1984460);
    expect(tx.settlementTime).toEqual(settleTime);
    expect(tx.reconciliationStatus).toBe('UNRECONCILED');
  });

  it('harus memperbarui pointer batch rekonsiliasi saat markReconciled dipanggil', () => {
    const tx = new InvoiceTransaction(
      'tx-5',
      'sub-1',
      'INV-2026-005',
      2000000,
      14000,
      1540,
      1984460,
      'ORDER-005',
      'qris',
      PaymentStatus.SETTLEMENT
    );

    tx.markReconciled('batch-uuid-99');
    expect(tx.reconciliationStatus).toBe('MATCHED');
    expect(tx.reconciliationBatchId).toBe('batch-uuid-99');
  });
});