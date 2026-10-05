import { ReconciliationBatchStatus, DiscrepancyResolutionStatus } from '@polaris/shared-types';
import { ReconciliationDiscrepancy } from './ReconciliationDiscrepancy.js';

export interface BatchProps {
  id: string;
  batchNumber: string;
  reconDate: string; // YYYY-MM-DD
  sourceGateway?: string;
  totalGatewayTransactions?: number;
  totalInternalTransactions?: number;
  totalMatchedTransactions?: number;
  totalDiscrepancies?: number;
  totalGrossAmountIdr?: number;
  totalMdrFeeIdr?: number;
  totalNetAmountIdr?: number;
  status?: ReconciliationBatchStatus;
  rawReportStorageUrl?: string | null;
  executedBy?: string;
  notes?: string | null;
  createdAt?: Date;
  updatedAt?: Date;
}

export class ReconciliationBatch {
  public readonly id: string;
  public readonly batchNumber: string;
  public readonly reconDate: string;
  public readonly sourceGateway: string;
  public totalGatewayTransactions: number;
  public totalInternalTransactions: number;
  public totalMatchedTransactions: number;
  public totalDiscrepancies: number;
  public totalGrossAmountIdr: number;
  public totalMdrFeeIdr: number;
  public totalNetAmountIdr: number;
  public status: ReconciliationBatchStatus;
  public rawReportStorageUrl: string | null;
  public executedBy: string;
  public notes: string | null;
  public readonly createdAt: Date;
  public updatedAt: Date;

  private discrepancies: Map<string, ReconciliationDiscrepancy> = new Map();

  constructor(props: BatchProps) {
    this.id = props.id;
    this.batchNumber = props.batchNumber;
    this.reconDate = props.reconDate;
    this.sourceGateway = props.sourceGateway || 'MIDTRANS';
    this.totalGatewayTransactions = props.totalGatewayTransactions || 0;
    this.totalInternalTransactions = props.totalInternalTransactions || 0;
    this.totalMatchedTransactions = props.totalMatchedTransactions || 0;
    this.totalDiscrepancies = props.totalDiscrepancies || 0;
    this.totalGrossAmountIdr = props.totalGrossAmountIdr || 0;
    this.totalMdrFeeIdr = props.totalMdrFeeIdr || 0;
    this.totalNetAmountIdr = props.totalNetAmountIdr || 0;
    this.status = props.status || ReconciliationBatchStatus.PROCESSING;
    this.rawReportStorageUrl = props.rawReportStorageUrl || null;
    this.executedBy = props.executedBy || 'SYSTEM_CRON';
    this.notes = props.notes || null;
    this.createdAt = props.createdAt || new Date();
    this.updatedAt = props.updatedAt || new Date();
  }

  /**
   * Menambahkan anomali selisih yang ditemukan saat komparasi.
   */
  public addDiscrepancy(discrepancy: ReconciliationDiscrepancy): void {
    this.discrepancies.set(discrepancy.id, discrepancy);
    this.totalDiscrepancies = this.discrepancies.size;
    this.status = ReconciliationBatchStatus.DISCREPANCY_DETECTED;
    this.updatedAt = new Date();
  }

  /**
   * Menyelesaikan evaluasi komparasi batch secara atomik.
   * Menjaga invarian: status BALANCED jika dan hanya jika totalDiscrepancies === 0.
   */
  public completeAudit(metrics: {
    totalGateway: number;
    totalInternal: number;
    totalMatched: number;
    grossIdr: number;
    mdrIdr: number;
    netIdr: number;
  }): void {
    this.totalGatewayTransactions = metrics.totalGateway;
    this.totalInternalTransactions = metrics.totalInternal;
    this.totalMatchedTransactions = metrics.totalMatched;
    this.totalGrossAmountIdr = metrics.grossIdr;
    this.totalMdrFeeIdr = metrics.mdrIdr;
    this.totalNetAmountIdr = metrics.netIdr;

    if (this.discrepancies.size === 0) {
      this.status = ReconciliationBatchStatus.BALANCED;
      this.totalDiscrepancies = 0;
    } else {
      this.status = ReconciliationBatchStatus.DISCREPANCY_DETECTED;
      this.totalDiscrepancies = this.discrepancies.size;
    }

    this.updatedAt = new Date();
  }

  /**
   * Menyelesaikan selisih secara manual atau via self-healing.
   */
  public resolveDiscrepancy(
    discrepancyId: string,
    resolution: DiscrepancyResolutionStatus.AUTO_RESOLVED | DiscrepancyResolutionStatus.MANUALLY_RESOLVED | DiscrepancyResolutionStatus.IGNORED,
    notes: string,
    resolvedBy?: string | null
  ): void {
    const item = this.discrepancies.get(discrepancyId);
    if (!item) {
      throw new Error(`[AggregateError] Discrepancy ID ${discrepancyId} tidak ditemukan pada batch ini.`);
    }

    item.resolve(resolution, notes, resolvedBy);

    // Cek apakah seluruh selisih sudah terselesaikan
    const unresolvedCount = Array.from(this.discrepancies.values()).filter(
      (d) => d.resolutionStatus === DiscrepancyResolutionStatus.UNRESOLVED
    ).length;

    if (unresolvedCount === 0) {
      this.status = ReconciliationBatchStatus.RESOLVED;
    }

    this.updatedAt = new Date();
  }

  public getDiscrepancies(): ReconciliationDiscrepancy[] {
    return Array.from(this.discrepancies.values());
  }
}
