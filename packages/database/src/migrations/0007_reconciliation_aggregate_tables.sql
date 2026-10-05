-- =========================================================================
-- MIGRATION: 0007_reconciliation_aggregate_tables.sql
-- DESCRIPTION: Tables for Financial Reconciliation Batches & Discrepancies
-- =========================================================================

-- 1. Tabel Batch Rekonsiliasi
CREATE TABLE IF NOT EXISTS reconciliation_batches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  batch_number VARCHAR(100) NOT NULL UNIQUE,
  recon_date DATE NOT NULL,
  source_gateway VARCHAR(50) DEFAULT 'MIDTRANS' NOT NULL,
  total_gateway_transactions INTEGER DEFAULT 0 NOT NULL,
  total_internal_transactions INTEGER DEFAULT 0 NOT NULL,
  total_matched_transactions INTEGER DEFAULT 0 NOT NULL,
  total_discrepancies INTEGER DEFAULT 0 NOT NULL,
  total_gross_amount_idr NUMERIC(15, 2) DEFAULT 0.00 NOT NULL,
  total_mdr_fee_idr NUMERIC(15, 2) DEFAULT 0.00 NOT NULL,
  total_net_amount_idr NUMERIC(15, 2) DEFAULT 0.00 NOT NULL,
  status VARCHAR(30) DEFAULT 'PROCESSING' NOT NULL,
  raw_report_storage_url TEXT,
  executed_by VARCHAR(100) DEFAULT 'SYSTEM_CRON' NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. Tabel Detail Selisih Rekonsiliasi (Discrepancy Log)
CREATE TABLE IF NOT EXISTS reconciliation_discrepancies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  batch_id UUID NOT NULL REFERENCES reconciliation_batches(id) ON DELETE CASCADE,
  invoice_id UUID REFERENCES invoice_transactions(id) ON DELETE SET NULL,
  gateway_order_id VARCHAR(150) NOT NULL,
  discrepancy_type VARCHAR(50) NOT NULL,
  internal_status VARCHAR(50),
  gateway_status VARCHAR(50),
  internal_amount_idr NUMERIC(12, 2) DEFAULT 0.00 NOT NULL,
  gateway_amount_idr NUMERIC(12, 2) DEFAULT 0.00 NOT NULL,
  discrepancy_amount_idr NUMERIC(12, 2) DEFAULT 0.00 NOT NULL,
  resolution_status VARCHAR(30) DEFAULT 'UNRESOLVED' NOT NULL,
  resolution_notes TEXT,
  resolved_by UUID,
  resolved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. Hubungkan invoice_transactions ke batch rekonsiliasi
DO $$ BEGIN
  ALTER TABLE invoice_transactions 
    ADD CONSTRAINT fk_invoice_recon_batch 
    FOREIGN KEY (reconciliation_batch_id) 
    REFERENCES reconciliation_batches(id) 
    ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- 4. Indeks Performa Audit Finansial
CREATE INDEX IF NOT EXISTS idx_recon_batch_date_status 
  ON reconciliation_batches (recon_date, status);

CREATE INDEX IF NOT EXISTS idx_recon_discrepancy_batch_res 
  ON reconciliation_discrepancies (batch_id, resolution_status);

CREATE INDEX IF NOT EXISTS idx_recon_discrepancy_gateway_order 
  ON reconciliation_discrepancies (gateway_order_id);

COMMENT ON TABLE reconciliation_batches IS 'Siklus sesi audit harian rekonsiliasi kas Midtrans vs Ledger POLARIS';
COMMENT ON TABLE reconciliation_discrepancies IS 'Rincian transaksi anomali, selisih nominal, atau selisih status audit';
