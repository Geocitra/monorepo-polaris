export interface GatewaySettlementRecord {
  gatewayOrderId: string;
  grossAmountIdr: number;
  mdrFeeIdr: number;
  vatFeeIdr: number;
  netAmountIdr: number;
  paymentType: string;
  paymentStatus: 'SETTLEMENT' | 'PENDING' | 'EXPIRED' | 'FAILED';
  transactionTime: Date;
  settlementTime: Date;
  rawGatewayData?: Record<string, any>;
}

export interface IPaymentReportPort {
  /**
   * Mengurai konten string CSV mutasi settlement gateway menjadi record terstruktur.
   */
  parseSettlementCsv(csvContent: string): Promise<GatewaySettlementRecord[]>;

  /**
   * Mengambil daftar penyelesaian transaksi resmi berdasarkan tanggal (YYYY-MM-DD).
   */
  fetchSettlementListByDate(dateStr: string): Promise<GatewaySettlementRecord[]>;
}
