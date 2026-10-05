-- =========================================================================
-- MIGRATION: 0003_metered_usage_accounting.sql
-- DESCRIPTION: Add cost metering column and clarify unlimited metered ledger
-- =========================================================================

ALTER TABLE tenant_quota_ledgers 
  ADD COLUMN IF NOT EXISTS estimated_cost_usd NUMERIC(10, 4) DEFAULT 0.0000 NOT NULL;

-- Default nilai batas menjadi 0 (indikator unconstrained/metered unlimited)
ALTER TABLE tenant_quota_ledgers 
  ALTER COLUMN article_limit SET DEFAULT 0,
  ALTER COLUMN dalle_limit SET DEFAULT 0;

COMMENT ON TABLE tenant_quota_ledgers IS 'Buku besar meteran konsumsi bulanan AI dewan (Unlimited Metered Ledger)';
COMMENT ON COLUMN tenant_quota_ledgers.estimated_cost_usd IS 'Akumulasi estimasi biaya riil API OpenAI dalam USD pada siklus bulan terkait';
