-- Fase 4: B2C Billing & Reconciliation Foreign Keys + Performance Indexes

-- 1. Hapus index redundan pada gateway_order_id (sudah tercakup oleh constraint UNIQUE)
DROP INDEX IF EXISTS idx_invoice_gateway_order;

-- 2. Tambah Foreign Key reconciliation_batch_id -> reconciliation_batches(id)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'fk_invoice_reconciliation_batch'
  ) THEN
    ALTER TABLE invoice_transactions
      ADD CONSTRAINT fk_invoice_reconciliation_batch
      FOREIGN KEY (reconciliation_batch_id)
      REFERENCES reconciliation_batches(id)
      ON DELETE SET NULL;
  END IF;
END $$;

-- 3. Tambah Foreign Key resolved_by -> system_admins(id)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'fk_recon_discrepancy_resolved_by'
  ) THEN
    ALTER TABLE reconciliation_discrepancies
      ADD CONSTRAINT fk_recon_discrepancy_resolved_by
      FOREIGN KEY (resolved_by)
      REFERENCES system_admins(id)
      ON DELETE SET NULL;
  END IF;
END $$;

-- 4. Index untuk kolom FK yang sering di-query di Billing & Reconciliation
CREATE INDEX IF NOT EXISTS idx_invoice_subscription_id
  ON invoice_transactions (subscription_id);

CREATE INDEX IF NOT EXISTS idx_invoice_recon_batch_id
  ON invoice_transactions (reconciliation_batch_id);

CREATE INDEX IF NOT EXISTS idx_quota_tx_invoice_id
  ON tenant_quota_transactions (invoice_id);

CREATE INDEX IF NOT EXISTS idx_recon_discrepancy_invoice_id
  ON reconciliation_discrepancies (invoice_id);
