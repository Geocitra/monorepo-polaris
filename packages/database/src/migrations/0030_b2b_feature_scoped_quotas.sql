-- Migrasi 0030: Pemisahan Kuota Mingguan B2B per Fitur (Chat POLARIS 10x, LKPJ 3x, Legislasi 3x)

ALTER TABLE organization_member_quota_wallets
  ADD COLUMN IF NOT EXISTS feature_scope VARCHAR(32) NOT NULL DEFAULT 'GLOBAL';

ALTER TABLE organization_member_quota_wallets
  DROP CONSTRAINT IF EXISTS unq_org_member_quota_week;

ALTER TABLE organization_member_quota_wallets
  ADD CONSTRAINT unq_org_member_quota_week
  UNIQUE (organization_id, tenant_id, weekly_period_key, feature_scope);
