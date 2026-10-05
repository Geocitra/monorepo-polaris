import { describe, it, expect } from 'vitest';
import { ReconciliationBatch } from '../src/entities/ReconciliationBatch.js';
import { ReconciliationDiscrepancy } from '../src/entities/ReconciliationDiscrepancy.js';
import { ReconciliationBatchStatus, DiscrepancyType, DiscrepancyResolutionStatus } from '@polaris/shared-types';

describe('ReconciliationBatch Aggregate Root', () => {
  it('harus menandai status BALANCED jika tidak ada selisih', () => {
    const batch = new ReconciliationBatch({
      id: 'batch-1',
      batchNumber: 'REC-20261002-TEST',
      reconDate: '2026-10-02',
    });

    batch.completeAudit({
      totalGateway: 5,
      totalInternal: 5,
      totalMatched: 5,
      grossIdr: 50000000,
      mdrIdr: 20000,
      netIdr: 49980000,
    });

    expect(batch.status).toBe(ReconciliationBatchStatus.BALANCED);
    expect(batch.totalDiscrepancies).toBe(0);
  });

  it('harus menandai status DISCREPANCY_DETECTED jika terdapat anomali transaksi', () => {
    const batch = new ReconciliationBatch({
      id: 'batch-2',
      batchNumber: 'REC-20261002-DISC',
      reconDate: '2026-10-02',
    });

    const disc = new ReconciliationDiscrepancy({
      id: 'disc-1',
      batchId: batch.id,
      gatewayOrderId: 'INV-UNKNOWN',
      discrepancyType: DiscrepancyType.MISSING_IN_INTERNAL,
      internalAmountIdr: 0,
      gatewayAmountIdr: 2000000,
    });

    batch.addDiscrepancy(disc);
    batch.completeAudit({
      totalGateway: 6,
      totalInternal: 5,
      totalMatched: 5,
      grossIdr: 52000000,
      mdrIdr: 24000,
      netIdr: 51976000,
    });

    expect(batch.status).toBe(ReconciliationBatchStatus.DISCREPANCY_DETECTED);
    expect(batch.totalDiscrepancies).toBe(1);
  });

  it('harus mengubah status menjadi RESOLVED setelah seluruh selisih diselesaikan manual', () => {
    const batch = new ReconciliationBatch({
      id: 'batch-3',
      batchNumber: 'REC-20261002-RES',
      reconDate: '2026-10-02',
    });

    const disc = new ReconciliationDiscrepancy({
      id: 'disc-2',
      batchId: batch.id,
      gatewayOrderId: 'INV-DIFF',
      discrepancyType: DiscrepancyType.AMOUNT_MISMATCH,
      internalAmountIdr: 2000000,
      gatewayAmountIdr: 2050000,
    });

    batch.addDiscrepancy(disc);
    batch.completeAudit({
      totalGateway: 1,
      totalInternal: 1,
      totalMatched: 0,
      grossIdr: 2050000,
      mdrIdr: 4000,
      netIdr: 2046000,
    });

    expect(batch.status).toBe(ReconciliationBatchStatus.DISCREPANCY_DETECTED);

    batch.resolveDiscrepancy('disc-2', DiscrepancyResolutionStatus.MANUALLY_RESOLVED, 'Selisih transfer telah dikonfirmasi manual via bukti mutasi');
    expect(batch.status).toBe(ReconciliationBatchStatus.RESOLVED);
  });
});