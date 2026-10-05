import { PaymentStatus } from '@polaris/shared-types';

export interface FinancialSettlementParams {
  grossAmountIdr: number;
  mdrFeeIdr: number;
  vatFeeIdr: number;
  netAmountIdr: number;
  settlementTime: Date;
  paymentMethod: string;
}

export class InvoiceTransaction {
  constructor(
    public readonly id: string,
    public readonly subscriptionId: string,
    public readonly invoiceNumber: string,
    public grossAmountIdr: number,
    public mdrFeeIdr: number = 0,
    public vatFeeIdr: number = 0,
    public netAmountIdr: number = 0,
    public readonly gatewayOrderId: string,
    public paymentMethod?: string | null,
    public paymentStatus: PaymentStatus = PaymentStatus.PENDING,
    public paidAt?: Date | null,
    public settlementTime?: Date | null,
    public reconciliationStatus: 'UNRECONCILED' | 'MATCHED' | 'DISCREPANCY' = 'UNRECONCILED',
    public reconciliationBatchId?: string | null,
    public readonly createdAt: Date = new Date()
  ) {
    this.validateAccountingInvariant();
  }

  /**
   * Menjaga invarian akuntansi: Gross = Net + MDR + VAT pada transaksi yang lunas.
   */
  public validateAccountingInvariant(): void {
    if (this.paymentStatus === PaymentStatus.SETTLEMENT) {
      const calculatedGross = this.netAmountIdr + this.mdrFeeIdr + this.vatFeeIdr;
      const difference = Math.abs(this.grossAmountIdr - calculatedGross);

      // Toleransi pembulatan maksimal Rp 2
      if (difference > 2) {
        throw new Error(
          `[AccountingInvariantError] Buku kas tidak seimbang: Gross (${this.grossAmountIdr}) != Net (${this.netAmountIdr}) + MDR (${this.mdrFeeIdr}) + VAT (${this.vatFeeIdr}). Selisih: ${difference}`
        );
      }
    }
  }

  /**
   * Mengesahkan pelunasan transaksi dengan rincian biaya riil.
   */
  public settle(params: FinancialSettlementParams): void {
    const calculatedGross = params.netAmountIdr + params.mdrFeeIdr + params.vatFeeIdr;
    const difference = Math.abs(params.grossAmountIdr - calculatedGross);
    if (difference > 2) {
      throw new Error(
        `[AccountingInvariantError] Buku kas tidak seimbang: Gross (${params.grossAmountIdr}) != Net (${params.netAmountIdr}) + MDR (${params.mdrFeeIdr}) + VAT (${params.vatFeeIdr}). Selisih: ${difference}`
      );
    }

    this.paymentStatus = PaymentStatus.SETTLEMENT;
    this.grossAmountIdr = params.grossAmountIdr;
    this.mdrFeeIdr = params.mdrFeeIdr;
    this.vatFeeIdr = params.vatFeeIdr;
    this.netAmountIdr = params.netAmountIdr;
    this.settlementTime = params.settlementTime;
    this.paidAt = params.settlementTime;
    this.paymentMethod = params.paymentMethod;
    this.reconciliationStatus = 'UNRECONCILED';

  }

  /**
   * Menandai transaksi telah berhasil dicocokkan pada batch audit rekonsiliasi.
   */
  public markReconciled(batchId: string): void {
    this.reconciliationStatus = 'MATCHED';
    this.reconciliationBatchId = batchId;
  }

  /**
   * Menandai transaksi mengalami selisih data.
   */
  public markDiscrepancy(batchId: string): void {
    this.reconciliationStatus = 'DISCREPANCY';
    this.reconciliationBatchId = batchId;
  }
}
