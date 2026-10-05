import {
  IPaymentReportPort,
  GatewaySettlementRecord,
} from '@polaris/core-domain';
import { MidtransFeeCalculator } from './fee-calculator.js';
import { coreApiClient } from './midtrans.client.js';

export class MidtransReportAdapter implements IPaymentReportPort {
  /**
   * Mengurai string CSV settlement resmi Midtrans menjadi array GatewaySettlementRecord terstandarisasi.
   */
  public async parseSettlementCsv(csvContent: string): Promise<GatewaySettlementRecord[]> {
    if (!csvContent || csvContent.trim().length === 0) {
      return [];
    }

    // 1. Bersihkan UTF-8 BOM dan normalisasi pemisah baris
    const cleanContent = csvContent.replace(/^\uFEFF/, '').trim();
    const rawLines = cleanContent.split(/\r?\n/).filter((l) => l.trim().length > 0);

    if (rawLines.length < 2) {
      throw new Error('[CsvParserError] File CSV tidak memiliki baris data.');
    }

    // 2. Deteksi pemisah (koma atau titik koma)
    const headerLine = rawLines[0];
    const delimiter = headerLine.includes(';') ? ';' : ',';

    const headers = this.parseCsvRow(headerLine, delimiter).map((h) =>
      h.toLowerCase().trim().replace(/[^a-z0-9_]/g, '')
    );

    // Pemetaan indeks kolom fleksibel (Bahasa Indonesia & Bahasa Inggris)
    const orderIdIdx = this.findHeaderIndex(headers, ['order_id', 'orderid', 'idpesanan', 'invoice', 'nomororder']);
    const grossAmountIdx = this.findHeaderIndex(headers, ['gross_amount', 'grossamount', 'amount', 'jumlahkotor', 'total']);
    const paymentTypeIdx = this.findHeaderIndex(headers, ['payment_type', 'paymenttype', 'metode', 'metodepembayaran', 'channel']);
    const statusIdx = this.findHeaderIndex(headers, ['transaction_status', 'status', 'statustransaksi']);
    const settlementTimeIdx = this.findHeaderIndex(headers, ['settlement_time', 'settlementtime', 'waktupenyelesaian', 'paidat', 'waktubayar']);
    const transactionTimeIdx = this.findHeaderIndex(headers, ['transaction_time', 'transactiontime', 'waktutransaksi', 'createdat']);
    const mdrFeeIdx = this.findHeaderIndex(headers, ['mdr_fee', 'mdr', 'fee', 'biayagui', 'biaya']);
    const netAmountIdx = this.findHeaderIndex(headers, ['net_amount', 'netamount', 'jumlahbersih', 'diterima']);

    if (orderIdIdx === -1 || grossAmountIdx === -1) {
      throw new Error('[CsvParserError] Kolom wajib (Order ID / Gross Amount) tidak ditemukan pada header CSV.');
    }

    const records: GatewaySettlementRecord[] = [];

    // 3. Iterasi setiap baris data
    for (let i = 1; i < rawLines.length; i++) {
      const cells = this.parseCsvRow(rawLines[i], delimiter);
      if (cells.length < 2) continue;

      const rawOrderId = cells[orderIdIdx]?.trim();
      if (!rawOrderId) continue;

      const rawGross = cells[grossAmountIdx] || '0';
      const grossAmountIdr = this.parseCurrency(rawGross);
      if (grossAmountIdr <= 0) continue;

      const paymentType = (paymentTypeIdx !== -1 && cells[paymentTypeIdx]) ? cells[paymentTypeIdx].trim() : 'qris';
      const rawStatus = (statusIdx !== -1 && cells[statusIdx]) ? cells[statusIdx].toLowerCase().trim() : 'settlement';
      
      const paymentStatus = ['settlement', 'capture', 'success'].includes(rawStatus)
        ? 'SETTLEMENT'
        : ['pending'].includes(rawStatus)
        ? 'PENDING'
        : ['expire', 'expired', 'cancel'].includes(rawStatus)
        ? 'EXPIRED'
        : 'FAILED';

      const now = new Date();
      const settlementTime = settlementTimeIdx !== -1 && cells[settlementTimeIdx]
        ? this.parseDate(cells[settlementTimeIdx])
        : now;
      const transactionTime = transactionTimeIdx !== -1 && cells[transactionTimeIdx]
        ? this.parseDate(cells[transactionTimeIdx])
        : settlementTime;

      // Evaluasi MDR Fee dan Net Kas
      let mdrFeeIdr = 0;
      let vatFeeIdr = 0;
      let netAmountIdr = 0;

      if (mdrFeeIdx !== -1 && cells[mdrFeeIdx]) {
        mdrFeeIdr = this.parseCurrency(cells[mdrFeeIdx]);
        vatFeeIdr = Math.round(mdrFeeIdr * MidtransFeeCalculator.VAT_RATE);
        netAmountIdr = netAmountIdx !== -1 && cells[netAmountIdx]
          ? this.parseCurrency(cells[netAmountIdx])
          : grossAmountIdr - (mdrFeeIdr + vatFeeIdr);
      } else {
        // Fallback: Hitung menggunakan MidtransFeeCalculator
        const calc = MidtransFeeCalculator.calculate(grossAmountIdr, paymentType);
        mdrFeeIdr = calc.mdrFeeIdr;
        vatFeeIdr = calc.vatFeeIdr;
        netAmountIdr = calc.netAmountIdr;
      }

      records.push({
        gatewayOrderId: rawOrderId,
        grossAmountIdr,
        mdrFeeIdr,
        vatFeeIdr,
        netAmountIdr,
        paymentType,
        paymentStatus,
        transactionTime,
        settlementTime,
      });
    }

    return records;
  }

  /**
   * Mengambil status transaksi dari Midtrans Core API berdasarkan daftar Order ID internal.
   * 
   * Strategi: Karena Midtrans Node.js SDK tidak menyediakan endpoint bulk "list by date",
   * kita query setiap order ID secara individual via coreApiClient.transaction.status(orderId).
   * Ini memastikan seluruh transaksi yang diketahui sistem lokal diverifikasi terhadap gateway.
   *
   * @param _dateStr - Tanggal rekonsiliasi (untuk referensi log, tidak digunakan untuk query API)
   * @param orderIds - Daftar Order ID internal yang perlu diverifikasi terhadap Midtrans
   */
  public async fetchSettlementListByDate(
    _dateStr: string,
    orderIds: string[] = []
  ): Promise<GatewaySettlementRecord[]> {
    if (!orderIds || orderIds.length === 0) {
      return [];
    }

    const records: GatewaySettlementRecord[] = [];

    // Iterasi setiap Order ID dan query status individual ke Midtrans Core API
    for (const orderId of orderIds) {
      try {
        const response = await coreApiClient.transaction.status(orderId).catch(() => null);

        if (!response || !response.order_id) continue;

        // Hanya proses transaksi yang sudah settlement
        const rawStatus = (response.transaction_status || '').toLowerCase();
        if (!['settlement', 'capture'].includes(rawStatus)) continue;

        const gross = parseFloat(response.gross_amount || '0');
        if (gross <= 0) continue;

        const paymentType = response.payment_type || 'bank_transfer';
        const calc = MidtransFeeCalculator.calculate(gross, paymentType);

        records.push({
          gatewayOrderId: response.order_id,
          grossAmountIdr: gross,
          mdrFeeIdr: calc.mdrFeeIdr,
          vatFeeIdr: calc.vatFeeIdr,
          netAmountIdr: calc.netAmountIdr,
          paymentType,
          paymentStatus: 'SETTLEMENT',
          transactionTime: response.transaction_time ? new Date(response.transaction_time) : new Date(),
          settlementTime: response.settlement_time ? new Date(response.settlement_time) : new Date(),
          rawGatewayData: response,
        });
      } catch {
        // Log senyap: Midtrans mungkin menolak query untuk order ID yang tidak dikenali
        continue;
      }
    }

    return records;
  }

  // =========================================================================
  // HELPER METHODS (ROBUST PARSING UTILITIES)
  // =========================================================================

  private parseCsvRow(row: string, delimiter: string): string[] {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < row.length; i++) {
      const char = row[i];
      if (char === '"') {
        if (inQuotes && row[i + 1] === '"') {
          current += '"';
          i++;
        } else {
          inQuotes = !inQuotes;
        }
      } else if (char === delimiter && !inQuotes) {
        result.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    result.push(current.trim());
    return result;
  }

  private findHeaderIndex(headers: string[], candidates: string[]): number {
    for (const candidate of candidates) {
      const idx = headers.findIndex((h) => h === candidate || h.includes(candidate));
      if (idx !== -1) return idx;
    }
    return -1;
  }

  private parseCurrency(raw: string): number {
    if (!raw) return 0;
    let clean = raw.replace(/[^0-9.,-]/g, '').trim();
    if (!clean) return 0;

    const hasComma = clean.includes(',');
    const hasDot = clean.includes('.');

    if (hasComma && hasDot) {
      const lastComma = clean.lastIndexOf(',');
      const lastDot = clean.lastIndexOf('.');
      if (lastDot > lastComma) {
        // Format US / Midtrans: 10,000,000.00 -> buang koma ribuan
        clean = clean.replace(/,/g, '');
      } else {
        // Format Indonesia / Eropa: 10.000.000,00 -> buang titik ribuan, ganti koma dengan titik
        clean = clean.replace(/\./g, '').replace(',', '.');
      }
    } else if (hasComma) {
      const parts = clean.split(',');
      if (parts.length > 2) {
        // Banyak koma ribuan, e.g. 10,000,000
        clean = clean.replace(/,/g, '');
      } else if (parts.length === 2) {
        if (parts[1].length === 3) {
          // Koma ribuan tunggal: 10,000
          clean = clean.replace(/,/g, '');
        } else {
          // Koma desimal: 10000,00
          clean = parts[0] + '.' + parts[1];
        }
      }
    } else if (hasDot) {
      const parts = clean.split('.');
      if (parts.length > 2) {
        // Banyak titik ribuan: 10.000.000
        clean = clean.replace(/\./g, '');
      } else if (parts.length === 2) {
        // Jika 3 digit di belakang titik dan depan <= 3 digit, e.g. 10.000 (ribuan ID)
        if (parts[1].length === 3 && parts[0].length <= 3) {
          clean = clean.replace(/\./g, '');
        }
        // Desimal standar: 10000.00 dibiarkan apa adanya
      }
    }

    const val = parseFloat(clean);
    return isNaN(val) ? 0 : val;
  }

  private parseDate(rawDate: string): Date {
    try {
      const parsed = new Date(rawDate.trim());
      if (!isNaN(parsed.getTime())) {
        return parsed;
      }
    } catch {}
    return new Date();
  }
}
