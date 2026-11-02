-- =========================================================================
-- MIGRATION: 0016_platform_feature_flags.sql
-- DESCRIPTION: Skema Sakelar Fitur Platform Global (Feature Flags)
-- STANDAR: Fail-Closed Security & Central Superadmin Governance
-- CATATAN: Tabel tingkat platform, non-tenant (tidak menggunakan RLS).
-- =========================================================================

CREATE TABLE IF NOT EXISTS platform_feature_flags (
  flag_key VARCHAR(100) PRIMARY KEY,
  enabled BOOLEAN NOT NULL DEFAULT false,
  updated_by VARCHAR(255),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Inisialisasi sakelar auto-publish untuk semua platform (default OFF / false)
INSERT INTO platform_feature_flags (flag_key, enabled)
VALUES
  ('AUTO_PUBLISH_INSTAGRAM', false),
  ('AUTO_PUBLISH_THREADS', false),
  ('AUTO_PUBLISH_TIKTOK', false),
  ('AUTO_PUBLISH_X_TWITTER', false)
ON CONFLICT (flag_key) DO NOTHING;
