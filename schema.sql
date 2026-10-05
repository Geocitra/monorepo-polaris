-- =========================================================================
-- POLARIS PLATFORM MASTER DATABASE SCHEMA (POSTGRESQL 16 + PGVECTOR)
-- =========================================================================

-- 1. Inisialisasi Ekstensi Wajib
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "vector";

-- 2. Definisi ENUM Global
DO $$ BEGIN
  CREATE TYPE legislative_level_enum AS ENUM (
    'DPR_RI',
    'DPD_RI',
    'MPR_RI',
    'DPRD_PROVINSI',
    'DPRD_KABUPATEN_KOTA',
    'KEPALA_DAERAH_GUBERNUR',
    'KEPALA_DAERAH_WALIKOTA_BUPATI',
    'PEJABAT_BIROKRAT_DIRJEN_SEKJEN_OPD',
    'PIMPINAN_LEMBAGA_REKTOR_SWASTA'
  );
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE superadmin_role_enum AS ENUM ('SUPERADMIN', 'SUPPORT_OPERATOR', 'FINANCE_ADMIN');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE subscription_status_enum AS ENUM ('INACTIVE', 'PENDING_PAYMENT', 'ACTIVE', 'GRACE_PERIOD', 'SUSPENDED', 'ARCHIVED');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE plan_tier_enum AS ENUM ('STARTER', 'PRO', 'VIP');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE payment_status_enum AS ENUM ('PENDING', 'SETTLEMENT', 'EXPIRED', 'FAILED');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE content_status_enum AS ENUM ('GENERATING', 'DRAFT', 'UNDER_REVIEW', 'PUBLISHED', 'UNPUBLISHED', 'ARCHIVED');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE asset_type_enum AS ENUM ('DALLE_POSTER', 'INFOGRAPHIC_PNG', 'HEADER_IMAGE');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE doc_type_enum AS ENUM ('PERDA', 'PERBUP', 'APBD', 'RPJMD', 'BPS_STATISTIC', 'NOTULA_SIDANG');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE legal_status_enum AS ENUM ('BERLAKU', 'DICABUT', 'DIUJI_MK');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE social_platform_enum AS ENUM ('INSTAGRAM', 'X_TWITTER', 'TIKTOK', 'YOUTUBE', 'WHATSAPP');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE feedback_status_enum AS ENUM ('RECEIVED', 'VERIFIED', 'RESPONDED', 'ARCHIVED');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE comment_status_enum AS ENUM ('PUBLISHED', 'PENDING_REVIEW', 'HIDDEN', 'FLAGGED_SPAM');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE issue_category_enum AS ENUM ('INFRASTRUKTUR', 'PERTANIAN', 'PENDIDIKAN', 'KESEHATAN', 'BANSOS_UMKM', 'LAINNYA');
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- 3. BOUNDED CONTEXT: IDENTITY & ELECTORAL
CREATE TABLE IF NOT EXISTS electoral_districts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dapil_code VARCHAR(50) NOT NULL UNIQUE,
  dapil_name VARCHAR(100) NOT NULL,
  province_name VARCHAR(100) NOT NULL,
  regency_coverage TEXT[] NOT NULL,
  total_voters INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS tenant_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  full_name VARCHAR(255) NOT NULL,
  phone_number VARCHAR(30) NOT NULL,
  party_affiliation VARCHAR(100),
  legislative_level legislative_level_enum NOT NULL,
  electoral_district_id UUID REFERENCES electoral_districts(id) ON DELETE RESTRICT,
  custom_dapil_name VARCHAR(100),
  personal_coverage TEXT[] DEFAULT ARRAY[]::TEXT[],
  commission_id UUID,
  commission_name VARCHAR(150),
  photo_url TEXT,
  gender VARCHAR(20),
  birth_date VARCHAR(30),
  education TEXT,
  courses TEXT[] DEFAULT ARRAY[]::TEXT[],
  issue_interests TEXT[] DEFAULT ARRAY[]::TEXT[],
  is_verified BOOLEAN NOT NULL DEFAULT false,
  account_status VARCHAR(30) NOT NULL DEFAULT 'ACTIVE',
  internal_notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 4. BOUNDED CONTEXT: BILLING & SUBSCRIPTIONS
CREATE TABLE IF NOT EXISTS subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL UNIQUE REFERENCES tenant_members(id) ON DELETE CASCADE,
  plan_tier plan_tier_enum NOT NULL DEFAULT 'PRO',
  status subscription_status_enum NOT NULL DEFAULT 'INACTIVE',
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  grace_period_end TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS invoice_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subscription_id UUID NOT NULL REFERENCES subscriptions(id) ON DELETE CASCADE,
  invoice_number VARCHAR(100) NOT NULL UNIQUE,
  amount_idr NUMERIC(12,2) NOT NULL,
  gross_amount_idr NUMERIC(12,2),
  mdr_fee_idr NUMERIC(12,2) DEFAULT 0.00 NOT NULL,
  vat_fee_idr NUMERIC(12,2) DEFAULT 0.00 NOT NULL,
  net_amount_idr NUMERIC(12,2),
  gateway_order_id VARCHAR(150) NOT NULL UNIQUE,
  payment_method VARCHAR(50),
  payment_status payment_status_enum NOT NULL DEFAULT 'PENDING',
  paid_at TIMESTAMPTZ,
  settlement_time TIMESTAMPTZ,
  reconciliation_status VARCHAR(30) DEFAULT 'UNRECONCILED' NOT NULL,
  reconciliation_batch_id UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_invoice_recon_status_time
  ON invoice_transactions (reconciliation_status, payment_status, settlement_time);

CREATE INDEX IF NOT EXISTS idx_invoice_gateway_order
  ON invoice_transactions (gateway_order_id);

CREATE TABLE IF NOT EXISTS reconciliation_batches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  batch_number VARCHAR(100) NOT NULL UNIQUE,
  recon_date DATE NOT NULL,
  source_gateway VARCHAR(50) DEFAULT 'MIDTRANS' NOT NULL,
  total_gateway_transactions INTEGER DEFAULT 0 NOT NULL,
  total_internal_transactions INTEGER DEFAULT 0 NOT NULL,
  total_matched_transactions INTEGER DEFAULT 0 NOT NULL,
  total_discrepancies INTEGER DEFAULT 0 NOT NULL,
  total_gross_amount_idr NUMERIC(15, 2) DEFAULT 0.00 NOT NULL,
  total_mdr_fee_idr NUMERIC(15, 2) DEFAULT 0.00 NOT NULL,
  total_net_amount_idr NUMERIC(15, 2) DEFAULT 0.00 NOT NULL,
  status VARCHAR(30) DEFAULT 'PROCESSING' NOT NULL,
  raw_report_storage_url TEXT,
  executed_by VARCHAR(100) DEFAULT 'SYSTEM_CRON' NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS reconciliation_discrepancies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  batch_id UUID NOT NULL REFERENCES reconciliation_batches(id) ON DELETE CASCADE,
  invoice_id UUID REFERENCES invoice_transactions(id) ON DELETE SET NULL,
  gateway_order_id VARCHAR(150) NOT NULL,
  discrepancy_type VARCHAR(50) NOT NULL,
  internal_status VARCHAR(50),
  gateway_status VARCHAR(50),
  internal_amount_idr NUMERIC(12, 2) DEFAULT 0.00 NOT NULL,
  gateway_amount_idr NUMERIC(12, 2) DEFAULT 0.00 NOT NULL,
  discrepancy_amount_idr NUMERIC(12, 2) DEFAULT 0.00 NOT NULL,
  resolution_status VARCHAR(30) DEFAULT 'UNRESOLVED' NOT NULL,
  resolution_notes TEXT,
  resolved_by UUID,
  resolved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_recon_batch_date_status 
  ON reconciliation_batches (recon_date, status);

CREATE INDEX IF NOT EXISTS idx_recon_discrepancy_batch_res 
  ON reconciliation_discrepancies (batch_id, resolution_status);


CREATE TABLE IF NOT EXISTS tenant_quota_ledgers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenant_members(id) ON DELETE CASCADE,
  billing_cycle_month VARCHAR(7) NOT NULL,
  article_limit INTEGER NOT NULL DEFAULT 0,
  article_used INTEGER NOT NULL DEFAULT 0,
  dalle_limit INTEGER NOT NULL DEFAULT 0,
  dalle_used INTEGER NOT NULL DEFAULT 0,
  total_tokens_consumed BIGINT NOT NULL DEFAULT 0,
  estimated_cost_usd NUMERIC(10, 4) NOT NULL DEFAULT 0.0000,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT unq_tenant_month UNIQUE (tenant_id, billing_cycle_month)
);

-- 5. BOUNDED CONTEXT: CMS & MICROSITE
CREATE TABLE IF NOT EXISTS portal_configs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL UNIQUE REFERENCES tenant_members(id) ON DELETE CASCADE,
  subdomain_slug VARCHAR(63) NOT NULL UNIQUE,
  custom_domain VARCHAR(255) UNIQUE,
  custom_domain_status VARCHAR(30) NOT NULL DEFAULT 'UNVERIFIED',
  dns_verification_token VARCHAR(64),
  dns_verification_expires_at TIMESTAMPTZ,
  domain_verified_at TIMESTAMPTZ,
  is_active BOOLEAN NOT NULL DEFAULT true,
  meta_title VARCHAR(150),
  meta_description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT chk_custom_domain_status CHECK (custom_domain_status IN ('UNVERIFIED', 'PENDING_VERIFICATION', 'VERIFIED', 'FAILED'))
);

CREATE INDEX IF NOT EXISTS idx_portal_custom_domain_lookup
  ON portal_configs (custom_domain, custom_domain_status, is_active)
  WHERE custom_domain IS NOT NULL;

CREATE TABLE IF NOT EXISTS portal_theme_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  portal_id UUID NOT NULL UNIQUE REFERENCES portal_configs(id) ON DELETE CASCADE,
  primary_hex_color VARCHAR(7) NOT NULL DEFAULT '#1890ff',
  secondary_hex_color VARCHAR(7) NOT NULL DEFAULT '#001529',
  font_family VARCHAR(50) NOT NULL DEFAULT 'Inter, sans-serif',
  hero_banner_url TEXT,
  official_photo_url TEXT,
  headline_tagline VARCHAR(255),
  bio_biography TEXT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS social_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  portal_id UUID NOT NULL REFERENCES portal_configs(id) ON DELETE CASCADE,
  platform social_platform_enum NOT NULL,
  profile_url TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT unq_portal_platform UNIQUE (portal_id, platform)
);

-- 6. BOUNDED CONTEXT: CONTENT & STUDIO AI
CREATE TABLE IF NOT EXISTS content_publications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenant_members(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  slug VARCHAR(255) NOT NULL,
  excerpt TEXT NOT NULL,
  body_content_markdown TEXT NOT NULL,
  word_count INTEGER NOT NULL,
  status content_status_enum NOT NULL DEFAULT 'DRAFT',
  canonical_url TEXT NOT NULL,
  comment_count INTEGER NOT NULL DEFAULT 0,
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT unq_tenant_slug UNIQUE (tenant_id, slug)
);

CREATE TABLE IF NOT EXISTS media_assets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  publication_id UUID NOT NULL REFERENCES content_publications(id) ON DELETE CASCADE,
  asset_type asset_type_enum NOT NULL,
  r2_storage_url TEXT NOT NULL,
  cdn_public_url TEXT NOT NULL,
  prompt_used TEXT,
  mime_type VARCHAR(50) NOT NULL DEFAULT 'image/webp',
  file_size_bytes BIGINT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS social_syndication_packs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  publication_id UUID NOT NULL UNIQUE REFERENCES content_publications(id) ON DELETE CASCADE,
  instagram_caption TEXT,
  twitter_threads JSONB,
  whatsapp_broadcast_text TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 7. BOUNDED CONTEXT: KNOWLEDGE & VECTOR GROUNDING (RAG)
CREATE TABLE IF NOT EXISTS knowledge_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  jurisdiction_region VARCHAR(100) NOT NULL,
  doc_type doc_type_enum NOT NULL,
  doc_number VARCHAR(50) NOT NULL,
  doc_year INTEGER NOT NULL,
  title VARCHAR(255) NOT NULL,
  legal_status legal_status_enum NOT NULL DEFAULT 'BERLAKU',
  source_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS knowledge_chunks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id UUID NOT NULL REFERENCES knowledge_documents(id) ON DELETE CASCADE,
  structural_reference VARCHAR(100) NOT NULL,
  chunk_content TEXT NOT NULL,
  vector_embedding vector(1536) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS member_writing_memories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenant_members(id) ON DELETE CASCADE,
  sample_text TEXT NOT NULL,
  key_vocabulary TEXT[],
  writing_style_embedding vector(1536) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS media_discourses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  region_scope VARCHAR(100) NOT NULL,
  news_portal_name VARCHAR(100) NOT NULL,
  original_url TEXT NOT NULL UNIQUE,
  article_title VARCHAR(255) NOT NULL,
  clean_summary TEXT NOT NULL,
  sentiment_score REAL NOT NULL,
  sector VARCHAR(50),
  relevance_score REAL,
  primary_keywords TEXT[],
  published_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT chk_media_discourses_policy_sector CHECK (
    sector IS NULL OR sector IN (
      'FISKAL_ANGGARAN',
      'INFRASTRUKTUR_RUANG',
      'PANGAN_PERTANIAN',
      'SOSIAL_KEMISKINAN',
      'LAYANAN_DASAR',
      'TATA_KELOLA_HUKUM',
      'EKONOMI_KETENAGAKERJAAN',
      'LINGKUNGAN_BENCANA'
    )
  ),
  CONSTRAINT chk_media_discourses_relevance_score CHECK (
    relevance_score IS NULL OR relevance_score BETWEEN 0 AND 1
  )
);

CREATE INDEX IF NOT EXISTS idx_media_discourses_sector_region
  ON media_discourses (sector, region_scope, published_at DESC);

-- 8. BOUNDED CONTEXT: CONSTITUENT & UU PDP VAULT
CREATE TABLE IF NOT EXISTS constituent_feedbacks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  portal_id UUID NOT NULL REFERENCES portal_configs(id) ON DELETE CASCADE,
  tracking_ticket_code VARCHAR(30) NOT NULL UNIQUE,
  regency_name VARCHAR(100) NOT NULL,
  district_kecamatan VARCHAR(100) NOT NULL,
  category issue_category_enum NOT NULL,
  aspiration_message TEXT NOT NULL,
  status feedback_status_enum NOT NULL DEFAULT 'RECEIVED',
  submitted_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS encrypted_pii_vaults (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  feedback_id UUID NOT NULL UNIQUE REFERENCES constituent_feedbacks(id) ON DELETE CASCADE,
  encrypted_citizen_name BYTEA NOT NULL,
  encrypted_phone_number BYTEA NOT NULL,
  iv_vector VARCHAR(64) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 9. BOUNDED CONTEXT: CITIZEN ENGAGEMENT & ARTICLE COMMENTS
CREATE TABLE IF NOT EXISTS citizen_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  google_id VARCHAR(100) NOT NULL UNIQUE,
  email VARCHAR(255) NOT NULL,
  full_name VARCHAR(150) NOT NULL,
  avatar_url TEXT,
  is_banned BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS article_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  publication_id UUID NOT NULL REFERENCES content_publications(id) ON DELETE CASCADE,
  citizen_id UUID NOT NULL REFERENCES citizen_users(id) ON DELETE CASCADE,
  parent_comment_id UUID REFERENCES article_comments(id) ON DELETE CASCADE,
  comment_text TEXT NOT NULL,
  status comment_status_enum NOT NULL DEFAULT 'PUBLISHED',
  likes_count INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 10. INDEKS KINERJA & HNSW COSINE SIMILARITY
CREATE INDEX IF NOT EXISTS idx_knowledge_chunks_vector 
  ON knowledge_chunks USING hnsw (vector_embedding vector_cosine_ops);

CREATE INDEX IF NOT EXISTS idx_member_writing_memories_vector 
  ON member_writing_memories USING hnsw (writing_style_embedding vector_cosine_ops);

CREATE INDEX IF NOT EXISTS idx_content_publications_tenant_status 
  ON content_publications(tenant_id, status);

CREATE INDEX IF NOT EXISTS idx_constituent_feedbacks_portal_status 
  ON constituent_feedbacks(portal_id, status);

CREATE INDEX IF NOT EXISTS idx_comments_publication_status 
  ON article_comments(publication_id, status, created_at DESC);

-- 11. TABEL VERIFIKASI KODE OTP EMAIL DEWAN
CREATE TABLE IF NOT EXISTS email_otps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) NOT NULL,
  otp_code VARCHAR(10) NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  is_used BOOLEAN NOT NULL DEFAULT false,
  attempts INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_email_otps_lookup ON email_otps(email, is_used, expires_at);
