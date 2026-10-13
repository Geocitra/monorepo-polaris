-- =========================================================================
-- MIGRATION: 0015_connected_social_distribution.sql
-- DESCRIPTION: Skema Akun Sosial Terhubung, Job Penerbitan & Penegakan RLS
-- STANDAR: ISO 27001 & UU PDP No. 27/2022
-- =========================================================================

CREATE OR REPLACE FUNCTION polaris_current_tenant_id()
RETURNS uuid
LANGUAGE plpgsql
STABLE
AS $$
BEGIN
  RETURN NULLIF(current_setting('app.current_tenant_id', true), '')::uuid;
EXCEPTION
  WHEN invalid_text_representation THEN RETURN NULL;
END;
$$;

-- 1. Tabel connected_social_accounts
CREATE TABLE IF NOT EXISTS connected_social_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenant_members(id) ON DELETE CASCADE,
  platform social_platform_enum NOT NULL DEFAULT 'INSTAGRAM',
  account_type VARCHAR(30) NOT NULL DEFAULT 'BUSINESS',
  external_account_id VARCHAR(100) NOT NULL,
  facebook_page_id VARCHAR(100),
  account_handle VARCHAR(100) NOT NULL,
  account_name VARCHAR(150),
  profile_picture_url TEXT,
  encrypted_access_token BYTEA NOT NULL,
  token_iv VARCHAR(32) NOT NULL,
  token_expires_at TIMESTAMPTZ NOT NULL,
  token_last_refreshed_at TIMESTAMPTZ,
  status VARCHAR(30) NOT NULL DEFAULT 'ACTIVE',
  last_error_message TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT unq_tenant_platform_account UNIQUE (tenant_id, platform, external_account_id)
);

CREATE INDEX IF NOT EXISTS idx_social_accounts_tenant 
  ON connected_social_accounts (tenant_id, platform, status);

CREATE INDEX IF NOT EXISTS idx_social_accounts_token_refresh 
  ON connected_social_accounts (status, token_expires_at);

-- 2. Tabel social_publishing_jobs
CREATE TABLE IF NOT EXISTS social_publishing_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenant_members(id) ON DELETE CASCADE,
  account_id UUID NOT NULL REFERENCES connected_social_accounts(id) ON DELETE CASCADE,
  publication_id UUID REFERENCES content_publications(id) ON DELETE SET NULL,
  media_format VARCHAR(30) NOT NULL DEFAULT 'FEED_IMAGE',
  original_media_url TEXT NOT NULL,
  formatted_media_url TEXT,
  caption TEXT NOT NULL,
  scheduled_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  published_at TIMESTAMPTZ,
  status VARCHAR(30) NOT NULL DEFAULT 'PENDING',
  meta_container_id VARCHAR(100),
  meta_post_id VARCHAR(100),
  meta_permalink TEXT,
  retry_count INTEGER NOT NULL DEFAULT 0,
  max_retries INTEGER NOT NULL DEFAULT 3,
  last_error_message TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_publishing_jobs_schedule 
  ON social_publishing_jobs (status, scheduled_at);

CREATE INDEX IF NOT EXISTS idx_publishing_jobs_tenant 
  ON social_publishing_jobs (tenant_id, status);

-- 3. Penegakan Row-Level Security (RLS) PostgreSQL Kernel
ALTER TABLE connected_social_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE connected_social_accounts FORCE ROW LEVEL SECURITY;

ALTER TABLE social_publishing_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE social_publishing_jobs FORCE ROW LEVEL SECURITY;

-- 4. Kebijakan RLS (Isolasi Mutlak Antar-Tenant)
DROP POLICY IF EXISTS connected_social_accounts_tenant_isolation ON connected_social_accounts;
CREATE POLICY connected_social_accounts_tenant_isolation ON connected_social_accounts
  FOR ALL
  USING (tenant_id = polaris_current_tenant_id())
  WITH CHECK (tenant_id = polaris_current_tenant_id());

DROP POLICY IF EXISTS social_publishing_jobs_tenant_isolation ON social_publishing_jobs;
CREATE POLICY social_publishing_jobs_tenant_isolation ON social_publishing_jobs
  FOR ALL
  USING (tenant_id = polaris_current_tenant_id())
  WITH CHECK (tenant_id = polaris_current_tenant_id());

COMMENT ON TABLE connected_social_accounts IS 'Vault kredensial token terenkripsi akun media sosial resmi per tenant';
COMMENT ON TABLE social_publishing_jobs IS 'Antrean tugas penerbitan konten terpadu ke media sosial';
