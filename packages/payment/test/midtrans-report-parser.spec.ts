import { describe, it, expect } from 'vitest';
import { MidtransReportAdapter } from '../src/midtrans-report.adapter.js';

describe('MidtransReportAdapter (CSV Settlement Parser)', () => {
  const adapter = new MidtransReportAdapter();

  it('harus berhasil mem-parsing string CSV settlement resmi Midtrans', async () => {
    const csvSample = `Order ID,Gross Amount,Payment Type,Transaction Status,Settlement Time
INV-20261002-001,2000000,bank_transfer,settlement,2026-10-02 10:30:00
INV-20261002-002,10000000,qris,settlement,2026-10-02 11:15:00`;

    const records = await adapter.parseSettlementCsv(csvSample);

    expect(records.length).toBe(2);
    expect(records[0].gatewayOrderId).toBe('INV-20261002-001');
    expect(records[0].grossAmountIdr).toBe(2000000);
    expect(records[0].paymentStatus).toBe('SETTLEMENT');
    expect(records[0].mdrFeeIdr).toBe(4000);

    expect(records[1].gatewayOrderId).toBe('INV-20261002-002');
    expect(records[1].grossAmountIdr).toBe(10000000);
    expect(records[1].mdrFeeIdr).toBe(70000); // 0.7% dari 10 Jt
  });

  it('harus melempar error jika kolom wajib tidak ditemukan pada header CSV', async () => {
    const invalidCsv = `Nama Kolom Salah,Tanggal,Keterangan
Data 1,2026-10-02,Test`;

    await expect(adapter.parseSettlementCsv(invalidCsv)).rejects.toThrowError(
      /Kolom wajib \(Order ID \/ Gross Amount\) tidak ditemukan/
    );
  });
});