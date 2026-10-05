ALTER TABLE portal_configs
  ADD COLUMN IF NOT EXISTS dns_verification_expires_at TIMESTAMPTZ;

UPDATE portal_configs
SET dns_verification_expires_at = now() + interval '48 hours'
WHERE custom_domain IS NOT NULL
  AND custom_domain_status = 'PENDING_VERIFICATION'
  AND dns_verification_token IS NOT NULL
  AND dns_verification_expires_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_portal_custom_domain_lookup
  ON portal_configs (custom_domain, custom_domain_status, is_active)
  WHERE custom_domain IS NOT NULL;

ALTER TABLE portal_configs
  DROP CONSTRAINT IF EXISTS chk_custom_domain_status;

ALTER TABLE portal_configs
  ADD CONSTRAINT chk_custom_domain_status
  CHECK (custom_domain_status IN ('UNVERIFIED', 'PENDING_VERIFICATION', 'VERIFIED', 'FAILED'));