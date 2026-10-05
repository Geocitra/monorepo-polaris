-- =========================================================================
-- MIGRATION: 0006_financial_accounting_schema.sql
-- DESCRIPTION: Multi-component financial ledger columns & recon indexing
-- =========================================================================

-- 1. Tambah kolom akuntansi multi-komponen
ALTER TABLE invoice_transactions
  ADD COLUMN IF NOT EXISTS gross_amount_idr NUMERIC(12, 2),
  ADD COLUMN IF NOT EXISTS mdr_fee_idr NUMERIC(12, 2) DEFAULT 0.00 NOT NULL,
  ADD COLUMN IF NOT EXISTS vat_fee_idr NUMERIC(12, 2) DEFAULT 0.00 NOT NULL,
  ADD COLUMN IF NOT EXISTS net_amount_idr NUMERIC(12, 2),
  ADD COLUMN IF NOT EXISTS settlement_time TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS reconciliation_status VARCHAR(30) DEFAULT 'UNRECONCILED' NOT NULL,
  ADD COLUMN IF NOT EXISTS reconciliation_batch_id UUID;

-- 2. Backfill data eksisting dari amount_idr
UPDATE invoice_transactions
SET
  gross_amount_idr = amount_idr,
  mdr_fee_idr = 0.00,
  vat_fee_idr = 0.00,
  net_amount_idr = amount_idr,
  settlement_time = paid_at
WHERE gross_amount_idr IS NULL;

-- 3. Pasang indeks komposit untuk optimasi query rekonsiliasi harian
CREATE INDEX IF NOT EXISTS idx_invoice_recon_status_time
  ON invoice_transactions (reconciliation_status, payment_status, settlement_time);

CREATE INDEX IF NOT EXISTS idx_invoice_gateway_order
  ON invoice_transactions (gateway_order_id);

COMMENT ON COLUMN invoice_transactions.gross_amount_idr IS 'Nominal kotor pembayaran tagihan dewan';
COMMENT ON COLUMN invoice_transactions.mdr_fee_idr IS 'Potongan biaya Merchant Discount Rate (MDR) gateway';
COMMENT ON COLUMN invoice_transactions.vat_fee_idr IS 'Pajak PPN 11% atas biaya transaksi gateway';
COMMENT ON COLUMN invoice_transactions.net_amount_idr IS 'Nominal bersih yang diterima kas platform POLARIS';
COMMENT ON COLUMN invoice_transactions.reconciliation_status IS 'Status rekonsiliasi: UNRECONCILED, MATCHED, DISCREPANCY';
