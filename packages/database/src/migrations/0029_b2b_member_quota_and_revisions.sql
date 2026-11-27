-- ============================================================================
-- MIGRATION 0029: B2B Member Weekly Generate Quota, 3x Item Revisions, &
--                 Bottom-Up Telemetry Granularity (Anggota -> Bidang -> Instansi)
-- ============================================================================

-- 1. Tambah konfigurasi kuota per anggota & revisi per item di organization_contracts
ALTER TABLE organization_contracts
  ADD COLUMN IF NOT EXISTS weekly_generate_limit_per_member INTEGER NOT NULL DEFAULT 3,
  ADD COLUMN IF NOT EXISTS revision_limit_per_item INTEGER NOT NULL DEFAULT 3;

DO $$ BEGIN
  ALTER TABLE organization_contracts
    ADD CONSTRAINT chk_org_contracts_weekly_gen_limit CHECK (weekly_generate_limit_per_member > 0);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE organization_contracts
    ADD CONSTRAINT chk_org_contracts_rev_limit CHECK (revision_limit_per_item >= 0);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- 2. Tabel Kuota Mingguan per Anggota Instansi (terpisah dari tenant_quota_wallets B2C)
CREATE TABLE IF NOT EXISTS organization_member_quota_wallets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  tenant_id UUID NOT NULL REFERENCES tenant_members(id) ON DELETE CASCADE,
  weekly_period_key VARCHAR(16) NOT NULL,
  weekly_limit INTEGER NOT NULL DEFAULT 3 CHECK (weekly_limit > 0),
  weekly_used INTEGER NOT NULL DEFAULT 0 CHECK (weekly_used >= 0),
  total_generated INTEGER NOT NULL DEFAULT 0 CHECK (total_generated >= 0),
  total_revisions INTEGER NOT NULL DEFAULT 0 CHECK (total_revisions >= 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT unq_org_member_quota_week UNIQUE (organization_id, tenant_id, weekly_period_key)
);

CREATE INDEX IF NOT EXISTS idx_org_member_quota_org_week
  ON organization_member_quota_wallets(organization_id, weekly_period_key);

-- 3. Perluas organization_quota_ledgers agar mencatat hingga level Anggota (tenant_id)
--    dan membedakan generate_requests vs revision_requests
ALTER TABLE organization_quota_ledgers
  ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES tenant_members(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS generate_requests INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS revision_requests INTEGER NOT NULL DEFAULT 0;

CREATE INDEX IF NOT EXISTS idx_org_quota_ledgers_member_month
  ON organization_quota_ledgers(organization_id, billing_cycle_month, unit_id, tenant_id);

-- Unique index NULLS NOT DISTINCT untuk mencegah duplikasi baris saat concurrent upsert
CREATE UNIQUE INDEX IF NOT EXISTS unq_org_quota_ledgers_org_unit_tenant_month
  ON organization_quota_ledgers (organization_id, unit_id, tenant_id, billing_cycle_month) NULLS NOT DISTINCT;

-- 4. Tambah tracking revisi (3x gratis per output) pada entitas hasil AI Instansi
ALTER TABLE institutional_shared_notes
  ADD COLUMN IF NOT EXISTS revision_used INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS revision_limit INTEGER NOT NULL DEFAULT 3,
  ADD COLUMN IF NOT EXISTS last_revision_prompt TEXT;

ALTER TABLE lkpj_findings
  ADD COLUMN IF NOT EXISTS revision_used INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS revision_limit INTEGER NOT NULL DEFAULT 3,
  ADD COLUMN IF NOT EXISTS last_revision_prompt TEXT;

ALTER TABLE legislation_clauses
  ADD COLUMN IF NOT EXISTS revision_used INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS revision_limit INTEGER NOT NULL DEFAULT 3,
  ADD COLUMN IF NOT EXISTS last_revision_prompt TEXT;
