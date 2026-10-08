-- Migration 0012: Dynamic Pricing Matrices, License Inquiries, and Identity Security Hardening

-- 1. Create inquiry_status_enum
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'inquiry_status_enum') THEN
    CREATE TYPE inquiry_status_enum AS ENUM (
      'NEW_LEAD',
      'MEETING_SCHEDULED',
      'PROPOSAL_SENT',
      'DEAL_CONVERTED',
      'REJECTED_DROPPED'
    );
  END IF;
END $$;

-- 2. Create license_inquiries table
CREATE TABLE IF NOT EXISTS license_inquiries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name VARCHAR(150) NOT NULL,
  phone_number VARCHAR(30) NOT NULL,
  official_email VARCHAR(255) NOT NULL,
  party_affiliation VARCHAR(100),
  legislative_level legislative_level_enum NOT NULL,
  target_region VARCHAR(100) NOT NULL,
  preferred_cycle VARCHAR(20) NOT NULL DEFAULT 'SEMESTER',
  preferred_tier plan_tier_enum NOT NULL DEFAULT 'PRO',
  meeting_datetime TIMESTAMPTZ,
  meeting_url TEXT,
  admin_notes TEXT,
  status inquiry_status_enum NOT NULL DEFAULT 'NEW_LEAD',
  handled_by_admin_id UUID REFERENCES system_admins(id) ON DELETE SET NULL,
  converted_tenant_id UUID REFERENCES tenant_members(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_inquiry_status_level 
  ON license_inquiries (status, legislative_level);

-- 3. Create subscription_price_matrices table
CREATE TABLE IF NOT EXISTS subscription_price_matrices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  legislative_level legislative_level_enum NOT NULL,
  plan_tier plan_tier_enum NOT NULL,
  billing_cycle VARCHAR(20) NOT NULL,
  duration_days INTEGER NOT NULL,
  amount_idr NUMERIC(12, 2) NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT unq_level_tier_cycle UNIQUE (legislative_level, plan_tier, billing_cycle)
);

CREATE INDEX IF NOT EXISTS idx_price_matrix_lookup 
  ON subscription_price_matrices (legislative_level, plan_tier, billing_cycle, is_active);

-- 4. Alter tenant_members for username and password change enforcement
ALTER TABLE tenant_members
  ADD COLUMN IF NOT EXISTS username VARCHAR(50) UNIQUE,
  ADD COLUMN IF NOT EXISTS must_change_password BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS temporary_password_plaintext_preview VARCHAR(100),
  ADD COLUMN IF NOT EXISTS password_changed_at TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS idx_tenant_members_username 
  ON tenant_members(username);

-- 5. Alter portal_theme_settings for layout_template_id
ALTER TABLE portal_theme_settings
  ADD COLUMN IF NOT EXISTS layout_template_id VARCHAR(50) NOT NULL DEFAULT 'standard-default';

COMMENT ON COLUMN portal_theme_settings.layout_template_id IS 
'ID template visual (standard-default, editorial-prestige, baliho-hero, newsroom-brief)';
