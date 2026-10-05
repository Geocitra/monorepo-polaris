-- =========================================================================
-- MIGRATION: 0005_custom_domain_verification.sql
-- DESCRIPTION: Add custom domain verification state machine & DNS token
-- =========================================================================

ALTER TABLE portal_configs
  ADD COLUMN IF NOT EXISTS custom_domain_status VARCHAR(30) DEFAULT 'UNVERIFIED' NOT NULL,
  ADD COLUMN IF NOT EXISTS dns_verification_token VARCHAR(64),
  ADD COLUMN IF NOT EXISTS domain_verified_at TIMESTAMPTZ;

-- Backfill: Jika ada custom domain aktif lama, set ke VERIFIED sementara untuk menjaga kontinuitas
UPDATE portal_configs
SET 
  custom_domain_status = 'VERIFIED',
  domain_verified_at = now()
WHERE custom_domain IS NOT NULL AND custom_domain != '';

COMMENT ON COLUMN portal_configs.custom_domain_status IS 'Status verifikasi DNS domain: UNVERIFIED, PENDING_VERIFICATION, VERIFIED, FAILED';
COMMENT ON COLUMN portal_configs.dns_verification_token IS 'Token verifikasi TXT / CNAME unik untuk validasi kepemilikan DNS';
