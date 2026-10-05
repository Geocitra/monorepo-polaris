export interface FeeBreakdownResult {
  grossAmountIdr: number;
  mdrFeeIdr: number;
  vatFeeIdr: number;
  totalDeductionIdr: number;
  netAmountIdr: number;
  feePercentage: number;
  channelCategory: 'QRIS' | 'VIRTUAL_ACCOUNT' | 'CREDIT_CARD' | 'E_WALLET' | 'DIRECT_B2B' | 'UNKNOWN';
}

export class MidtransFeeCalculator {
  // PPN 11% atas jasa transaksi payment gateway (UU HPP No. 7/2021)
  public static readonly VAT_RATE = 0.11;

  /**
   * Menghitung rincian biaya MDR, PPN, dan kas bersih yang diterima POLARIS.
   * Menjamin invarian: Gross = Net + MDR + VAT.
   */
  public static calculate(
    grossAmountIdr: number,
    paymentType?: string | null
  ): FeeBreakdownResult {
    const gross = Math.max(0, Math.round(grossAmountIdr));
    const type = (paymentType || '').toLowerCase().trim();

    let mdrBeforeVat = 0;
    let category: FeeBreakdownResult['channelCategory'] = 'UNKNOWN';
    let feePct = 0;

    // 1. QRIS (Tarif Standar Bank Indonesia: 0.7% MDR)
    if (type.includes('qris') || type.includes('gopay') || type.includes('shopeepay')) {
      category = 'QRIS';
      feePct = 0.007; // 0.7%
      mdrBeforeVat = Math.round(gross * feePct);
    }
    // 2. Virtual Account Bank (BCA, Mandiri, BNI, BRI, Permata - Rata-rata Flat Rp 4.000)
    else if (
      type.includes('va') ||
      type.includes('bank_transfer') ||
      type.includes('echannel') ||
      type.includes('bca') ||
      type.includes('bni') ||
      type.includes('bri') ||
      type.includes('mandiri') ||
      type.includes('permata')
    ) {
      category = 'VIRTUAL_ACCOUNT';
      mdrBeforeVat = 4000; // Flat Rp 4.000
      feePct = Number((mdrBeforeVat / (gross || 1)).toFixed(4));
    }
    // 3. Kartu Kredit (2.9% + Rp 2.000)
    else if (type.includes('credit_card') || type.includes('card')) {
      category = 'CREDIT_CARD';
      feePct = 0.029;
      mdrBeforeVat = Math.round(gross * feePct) + 2000;
    }
    // 4. Pembayaran Manual / Offline SPK B2B (Bebas Biaya Gateway)
    else if (type.includes('manual') || type.includes('spk') || type.includes('b2b')) {
      category = 'DIRECT_B2B';
      mdrBeforeVat = 0;
      feePct = 0;
    }
    // 5. Default / Fallback
    else {
      category = 'VIRTUAL_ACCOUNT';
      mdrBeforeVat = 4000;
      feePct = Number((mdrBeforeVat / (gross || 1)).toFixed(4));
    }

    // Hitung PPN 11% atas biaya jasa gateway
    const vatBeforeCap = Math.round(mdrBeforeVat * this.VAT_RATE);
    const mdrFee = Math.min(gross, mdrBeforeVat);
    const vatFee = Math.min(gross - mdrFee, vatBeforeCap);
    const totalDeduction = mdrFee + vatFee;
    const netAmount = gross - totalDeduction;

    return {
      grossAmountIdr: gross,
      mdrFeeIdr: mdrFee,
      vatFeeIdr: vatFee,
      totalDeductionIdr: totalDeduction,
      netAmountIdr: netAmount,
      feePercentage: feePct,
      channelCategory: category,
    };
  }
}
