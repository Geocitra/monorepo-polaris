-- =========================================================================
-- MIGRATION: 0017_quota_wallets_and_ledger.sql
-- DESCRIPTION: Skema Dompet Kuota Interaktif & Buku Besar Mutasi (Double-Entry Ledger)
-- STANDAR: Zero-Orphan, Strict Relational Foreign Keys & Idempotent
-- =========================================================================

-- 1. Inisialisasi ENUM Tipe Transaksi Kuota
DO $$ BEGIN
  CREATE TYPE quota_transaction_type_enum AS ENUM (
    'PACKAGE_PURCHASE',
    'REGULAR_CONSUME',
    'URGENT_SURGE_CONSUME',
    'REFUND_CANCELLED',
    'REFUND_REJECTED',
    'EXPIRED_FLUSH',
    'ADMIN_ADJUSTMENT'
  );
EXCEPTION WHEN duplicate_object THEN null;
END $$;

-- 2. Buat Tabel Dompet Kuota Klien (Tenant Quota Wallets)
CREATE TABLE IF NOT EXISTS tenant_quota_wallets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL UNIQUE REFERENCES tenant_members(id) ON DELETE CASCADE,
  total_quota_allocated INTEGER NOT NULL DEFAULT 12,
  remaining_quota INTEGER NOT NULL DEFAULT 0,
  weekly_allowance_limit INTEGER NOT NULL DEFAULT 3,
  current_period_end TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_quota_wallet_tenant 
  ON tenant_quota_wallets (tenant_id);

-- 3. Buat Tabel Buku Besar Mutasi Kuota (Immutable Transaction Ledger)
CREATE TABLE IF NOT EXISTS tenant_quota_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenant_members(id) ON DELETE CASCADE,
  brief_id UUID REFERENCES content_briefs(id) ON DELETE SET NULL,
  invoice_id UUID REFERENCES invoice_transactions(id) ON DELETE SET NULL,
  reference_code VARCHAR(100),
  transaction_type quota_transaction_type_enum NOT NULL,
  amount_delta INTEGER NOT NULL,
  balance_after INTEGER NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_quota_tx_tenant_created 
  ON tenant_quota_transactions (tenant_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_quota_tx_brief 
  ON tenant_quota_transactions (brief_id);

-- 4. Modifikasi Tabel Content Briefs (Pelacakan Biaya Kuota Riil & Status Darurat)
DO $$ BEGIN
  ALTER TABLE content_briefs 
    ADD COLUMN IF NOT EXISTS quota_cost_deducted INTEGER NOT NULL DEFAULT 1;
EXCEPTION WHEN duplicate_column THEN null;
END $$;

DO $$ BEGIN
  ALTER TABLE content_briefs 
    ADD COLUMN IF NOT EXISTS is_urgent_overquota BOOLEAN NOT NULL DEFAULT false;
EXCEPTION WHEN duplicate_column THEN null;
END $$;

-- 5. Modifikasi Tabel Matriks Harga (Kapasitas Kuota per Siklus Paket)
DO $$ BEGIN
  ALTER TABLE subscription_price_matrices 
    ADD COLUMN IF NOT EXISTS quota_requests INTEGER NOT NULL DEFAULT 12;
EXCEPTION WHEN duplicate_column THEN null;
END $$;

-- Perbarui matriks yang ada sesuai durasi:
UPDATE subscription_price_matrices 
SET quota_requests = CASE 
  WHEN billing_cycle = 'ANNUAL' THEN 144
  WHEN billing_cycle = 'SEMESTER' THEN 72
  ELSE 12
END
WHERE quota_requests = 12 OR quota_requests IS NULL;

-- 6. Backfill Data: Inisialisasi Dompet Kuota untuk Semua Akun Klien yang Sudah Ada
INSERT INTO tenant_quota_wallets (
  tenant_id,
  total_quota_allocated,
  remaining_quota,
  weekly_allowance_limit,
  current_period_end,
  created_at,
  updated_at
)
SELECT 
  tm.id AS tenant_id,
  CASE 
    WHEN s.current_period_end IS NOT NULL AND s.current_period_start IS NOT NULL AND s.current_period_end - s.current_period_start >= interval '300 days' THEN 144
    WHEN s.current_period_end IS NOT NULL AND s.current_period_start IS NOT NULL AND s.current_period_end - s.current_period_start >= interval '150 days' THEN 72
    ELSE 12
  END AS total_quota_allocated,
  CASE 
    WHEN s.status = 'ACTIVE' AND s.current_period_end > now() THEN 12
    ELSE 0
  END AS remaining_quota,
  3 AS weekly_allowance_limit,
  s.current_period_end,
  now() AS created_at,
  now() AS updated_at
FROM tenant_members tm
LEFT JOIN subscriptions s ON s.tenant_id = tm.id
ON CONFLICT (tenant_id) DO NOTHING;

-- Catat entri mutasi awal di buku besar untuk akun-akun aktif
INSERT INTO tenant_quota_transactions (
  tenant_id,
  transaction_type,
  amount_delta,
  balance_after,
  notes,
  created_at
)
SELECT 
  w.tenant_id,
  'PACKAGE_PURCHASE'::quota_transaction_type_enum,
  w.remaining_quota,
  w.remaining_quota,
  'Inisialisasi saldo kuota migrasi sistem baru',
  now()
FROM tenant_quota_wallets w
WHERE w.remaining_quota > 0
  AND NOT EXISTS (
    SELECT 1 FROM tenant_quota_transactions tqt 
    WHERE tqt.tenant_id = w.tenant_id
  );

