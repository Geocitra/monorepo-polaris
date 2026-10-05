import { describe, it, expect } from 'vitest';
import { MidtransFeeCalculator } from '../src/fee-calculator.js';

describe('MidtransFeeCalculator', () => {
  it('harus menghitung potongan fee QRIS secara tepat (0.7% MDR + 11% PPN)', () => {
    const gross = 2000000;
    const res = MidtransFeeCalculator.calculate(gross, 'qris');

    // MDR = 2.000.000 * 0.007 = 14.000
    expect(res.mdrFeeIdr).toBe(14000);
    // PPN = 14.000 * 0.11 = 1.540
    expect(res.vatFeeIdr).toBe(1540);
    // Total potongan = 15.540
    expect(res.totalDeductionIdr).toBe(15540);
    // Kas Bersih (Net) = 1.984.460
    expect(res.netAmountIdr).toBe(1984460);
    expect(res.channelCategory).toBe('QRIS');
  });

  it('harus menghitung potongan fee Virtual Account Bank (Flat Rp 4.000 + 11% PPN)', () => {
    const gross = 10000000;
    const res = MidtransFeeCalculator.calculate(gross, 'bank_transfer');

    // MDR VA = Flat 4.000
    expect(res.mdrFeeIdr).toBe(4000);
    // PPN = 4.000 * 0.11 = 440
    expect(res.vatFeeIdr).toBe(440);
    // Total potongan = 4.440
    expect(res.totalDeductionIdr).toBe(4440);
    // Kas Bersih (Net) = 9.995.560
    expect(res.netAmountIdr).toBe(9995560);
    expect(res.channelCategory).toBe('VIRTUAL_ACCOUNT');
  });

  it('harus menghitung transaksi offline B2B / SPK dengan 0% gateway fee', () => {
    const gross = 20000000;
    const res = MidtransFeeCalculator.calculate(gross, 'offline_spk_b2b');

    expect(res.mdrFeeIdr).toBe(0);
    expect(res.vatFeeIdr).toBe(0);
    expect(res.netAmountIdr).toBe(20000000);
    expect(res.channelCategory).toBe('DIRECT_B2B');
  });

  it('harus menjamin Gross = Net + Total Deductions pada sembarang nilai acak', () => {
    const testCases = [1500000, 2500000, 7750000, 15000000, 24000000];

    for (const gross of testCases) {
      const qris = MidtransFeeCalculator.calculate(gross, 'qris');
      expect(qris.grossAmountIdr).toBe(qris.netAmountIdr + qris.totalDeductionIdr);

      const va = MidtransFeeCalculator.calculate(gross, 'echannel');
      expect(va.grossAmountIdr).toBe(va.netAmountIdr + va.totalDeductionIdr);
    }
  });
});