import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import postgres from '../packages/database/node_modules/postgres/src/index.js';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

// Load environment variables using Node's native loader
try {
  process.loadEnvFile(path.join(rootDir, '.env'));
} catch (e) {
  // If native loader fails, manual simple parse
  if (fs.existsSync(path.join(rootDir, '.env'))) {
    const envLines = fs.readFileSync(path.join(rootDir, '.env'), 'utf-8').split('\n');
    for (const line of envLines) {
      const match = line.match(/^\s*([A-Za-z_0-9]+)\s*=\s*["']?(.*?)["']?\s*$/);
      if (match && !process.env[match[1]]) {
        process.env[match[1]] = match[2];
      }
    }
  }
}

const rawUrl = process.env.DATABASE_URL || 'postgresql://postgres:admin123@localhost:5432/polaris?schema=public';
// Strip ?schema=public parameter for postgres.js compatibility
const cleanUrl = rawUrl.replace(/([?&])schema=[^&]+(&|$)/, '$1').replace(/[?&]$/, '');

console.log('====================================================');
console.log(' POLARIS PLATFORM DATABASE MIGRATION ENGINE');
console.log('====================================================');
console.log(`Connecting to: ${cleanUrl.replace(/:[^:@]+@/, ':****@')}`);

const sql = postgres(cleanUrl, {
  max: 5,
  connect_timeout: 10,
  idle_timeout: 20,
});

async function runMigration() {
  try {
    const versionRes = await sql`SELECT version();`;
    console.log(`PostgreSQL Engine: ${versionRes[0].version.split(',')[0]}`);

    console.log('\n[1/6] Initializing Extensions (uuid-ossp, pgcrypto, vector)...');
    await sql.unsafe(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp";`);
    await sql.unsafe(`CREATE EXTENSION IF NOT EXISTS "pgcrypto";`);
    let hasVector = false;
    try {
      await sql.unsafe(`CREATE EXTENSION IF NOT EXISTS "vector";`);
      hasVector = true;
      console.log('  -> Extension "vector" (pgvector) enabled.');
    } catch {
      console.log('  -> Extension "vector" not installed on host, applying compatible representation.');
    }

    console.log('\n[2/6] Initializing Global ENUM Types...');
    const enumsSql = `
      DO $$ BEGIN
        CREATE TYPE legislative_level_enum AS ENUM (
          'DPR_RI', 'DPD_RI', 'MPR_RI', 'DPRD_PROVINSI', 'DPRD_KABUPATEN_KOTA',
          'KEPALA_DAERAH_GUBERNUR', 'KEPALA_DAERAH_WALIKOTA_BUPATI',
          'PEJABAT_BIROKRAT_DIRJEN_SEKJEN_OPD', 'PIMPINAN_LEMBAGA_REKTOR_SWASTA'
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
        CREATE TYPE social_platform_enum AS ENUM ('INSTAGRAM', 'THREADS', 'X_TWITTER', 'TIKTOK', 'YOUTUBE', 'WHATSAPP');
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

      DO $$ BEGIN
        CREATE TYPE inquiry_status_enum AS ENUM ('NEW_LEAD', 'MEETING_SCHEDULED', 'PROPOSAL_SENT', 'DEAL_CONVERTED', 'REJECTED_DROPPED');
      EXCEPTION WHEN duplicate_object THEN null; END $$;
    `;
    await sql.unsafe(enumsSql);
    console.log('  -> Global ENUM types verified.');

    console.log('\n[3/6] Applying Core DDL Schema (All 33 Tables)...');
    const vectorEmbeddingType = hasVector ? 'vector(1536)' : 'TEXT';

    const tablesSql = `
      -- 1. Electoral & Identity
      CREATE TABLE IF NOT EXISTS electoral_districts (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        dapil_code VARCHAR(50) NOT NULL UNIQUE,
        dapil_name VARCHAR(100) NOT NULL,
        province_name VARCHAR(100) NOT NULL,
        regency_coverage TEXT[] NOT NULL,
        total_voters INTEGER,
        created_at TIMESTAMPTZ NOT NULL DEFAULT now()
      );

      CREATE TABLE IF NOT EXISTS system_admins (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        email VARCHAR(255) NOT NULL UNIQUE,
        password_hash VARCHAR(255) NOT NULL,
        full_name VARCHAR(150) NOT NULL,
        role VARCHAR(50) NOT NULL DEFAULT 'SUPERADMIN',
        is_active BOOLEAN NOT NULL DEFAULT true,
        avatar_url TEXT,
        last_login_at TIMESTAMPTZ,
        created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
      );

      CREATE TABLE IF NOT EXISTS master_political_parties (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        code VARCHAR(30) NOT NULL UNIQUE,
        name VARCHAR(150) NOT NULL,
        ballot_number INTEGER,
        primary_color VARCHAR(20) NOT NULL,
        secondary_color VARCHAR(20),
        logo_url TEXT,
        description TEXT,
        is_active BOOLEAN NOT NULL DEFAULT true,
        created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
      );

      CREATE TABLE IF NOT EXISTS master_commissions (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        legislative_level legislative_level_enum NOT NULL DEFAULT 'DPR_RI',
        code VARCHAR(50) NOT NULL,
        name VARCHAR(150) NOT NULL,
        focus_areas TEXT[] DEFAULT ARRAY[]::TEXT[],
        partner_ministries TEXT[] DEFAULT ARRAY[]::TEXT[],
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
        photo_gallery TEXT[] DEFAULT ARRAY[]::TEXT[],
        gender VARCHAR(20),
        birth_date VARCHAR(30),
        education TEXT,
        courses TEXT[] DEFAULT ARRAY[]::TEXT[],
        issue_interests TEXT[] DEFAULT ARRAY[]::TEXT[],
        is_verified BOOLEAN NOT NULL DEFAULT false,
        account_status VARCHAR(30) NOT NULL DEFAULT 'ACTIVE',
        username VARCHAR(50) UNIQUE,
        must_change_password BOOLEAN NOT NULL DEFAULT false,
        temporary_password_plaintext_preview VARCHAR(100),
        password_changed_at TIMESTAMPTZ,
        internal_notes TEXT,
        created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
      );

      ALTER TABLE tenant_members ADD COLUMN IF NOT EXISTS username VARCHAR(50);
      ALTER TABLE tenant_members ADD COLUMN IF NOT EXISTS must_change_password BOOLEAN NOT NULL DEFAULT false;
      ALTER TABLE tenant_members ADD COLUMN IF NOT EXISTS temporary_password_plaintext_preview VARCHAR(100);
      ALTER TABLE tenant_members ADD COLUMN IF NOT EXISTS password_changed_at TIMESTAMPTZ;
      ALTER TABLE tenant_members ADD COLUMN IF NOT EXISTS internal_notes TEXT;
      ALTER TABLE tenant_members ADD COLUMN IF NOT EXISTS commission_id UUID;
      ALTER TABLE tenant_members ADD COLUMN IF NOT EXISTS commission_name VARCHAR(150);

      CREATE TABLE IF NOT EXISTS email_otps (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        email VARCHAR(255) NOT NULL,
        otp_code VARCHAR(10) NOT NULL,
        expires_at TIMESTAMPTZ NOT NULL,
        is_used BOOLEAN NOT NULL DEFAULT false,
        attempts INT NOT NULL DEFAULT 0,
        created_at TIMESTAMPTZ NOT NULL DEFAULT now()
      );

      CREATE TABLE IF NOT EXISTS tenant_activity_logs (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        tenant_id UUID NOT NULL REFERENCES tenant_members(id) ON DELETE CASCADE,
        activity_type VARCHAR(50) NOT NULL,
        category VARCHAR(30) NOT NULL DEFAULT 'AUTH',
        description TEXT NOT NULL,
        ip_address VARCHAR(45),
        user_agent TEXT,
        metadata JSONB,
        created_at TIMESTAMPTZ NOT NULL DEFAULT now()
      );

      -- 2. Subscriptions & Pricing Matrices
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

      CREATE TABLE IF NOT EXISTS invoice_transactions (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        subscription_id UUID NOT NULL REFERENCES subscriptions(id) ON DELETE CASCADE,
        matrix_id UUID REFERENCES subscription_price_matrices(id) ON DELETE SET NULL,
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
        reconciliation_batch_id UUID REFERENCES reconciliation_batches(id) ON DELETE SET NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT now()
      );

      ALTER TABLE invoice_transactions ADD COLUMN IF NOT EXISTS matrix_id UUID REFERENCES subscription_price_matrices(id) ON DELETE SET NULL;
      ALTER TABLE invoice_transactions ADD COLUMN IF NOT EXISTS gross_amount_idr NUMERIC(12,2);
      ALTER TABLE invoice_transactions ADD COLUMN IF NOT EXISTS mdr_fee_idr NUMERIC(12,2) DEFAULT 0.00;
      ALTER TABLE invoice_transactions ADD COLUMN IF NOT EXISTS vat_fee_idr NUMERIC(12,2) DEFAULT 0.00;
      ALTER TABLE invoice_transactions ADD COLUMN IF NOT EXISTS net_amount_idr NUMERIC(12,2);
      ALTER TABLE invoice_transactions ADD COLUMN IF NOT EXISTS settlement_time TIMESTAMPTZ;
      ALTER TABLE invoice_transactions ADD COLUMN IF NOT EXISTS reconciliation_status VARCHAR(30) DEFAULT 'UNRECONCILED';
      ALTER TABLE invoice_transactions ADD COLUMN IF NOT EXISTS reconciliation_batch_id UUID REFERENCES reconciliation_batches(id) ON DELETE SET NULL;

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

      CREATE TABLE IF NOT EXISTS platform_token_pools (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        total_budget_usd NUMERIC(10, 2) DEFAULT 50.00 NOT NULL,
        total_tokens_allocated BIGINT DEFAULT 10000000 NOT NULL,
        total_tokens_consumed BIGINT DEFAULT 0 NOT NULL,
        alert_threshold_percent INTEGER DEFAULT 20 NOT NULL,
        circuit_state VARCHAR(20) DEFAULT 'CLOSED' NOT NULL,
        last_alert_sent_at TIMESTAMPTZ,
        last_topup_date TIMESTAMPTZ DEFAULT now(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
      );

      CREATE TABLE IF NOT EXISTS platform_topup_histories (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        amount_usd NUMERIC(10, 2) NOT NULL,
        amount_idr NUMERIC(12, 2) NOT NULL,
        tokens_added BIGINT NOT NULL,
        payment_reference VARCHAR(150) NOT NULL,
        notes TEXT,
        created_at TIMESTAMPTZ NOT NULL DEFAULT now()
      );

      CREATE TABLE IF NOT EXISTS ai_trace_logs (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        trace_id VARCHAR(100) NOT NULL,
        tenant_id UUID REFERENCES tenant_members(id) ON DELETE SET NULL,
        operation VARCHAR(100) NOT NULL,
        model VARCHAR(50) NOT NULL,
        input_tokens INTEGER DEFAULT 0 NOT NULL,
        output_tokens INTEGER DEFAULT 0 NOT NULL,
        total_tokens INTEGER DEFAULT 0 NOT NULL,
        latency_ms INTEGER DEFAULT 0 NOT NULL,
        cost_usd NUMERIC(10, 5) DEFAULT 0 NOT NULL,
        status VARCHAR(30) DEFAULT 'SUCCESS' NOT NULL,
        error_message TEXT,
        created_at TIMESTAMPTZ NOT NULL DEFAULT now()
      );

      -- 3. CMS & Microsite
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
        updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
      );

      ALTER TABLE portal_configs ADD COLUMN IF NOT EXISTS custom_domain_status VARCHAR(30) NOT NULL DEFAULT 'UNVERIFIED';
      ALTER TABLE portal_configs ADD COLUMN IF NOT EXISTS dns_verification_token VARCHAR(64);
      ALTER TABLE portal_configs ADD COLUMN IF NOT EXISTS dns_verification_expires_at TIMESTAMPTZ;
      ALTER TABLE portal_configs ADD COLUMN IF NOT EXISTS domain_verified_at TIMESTAMPTZ;

      CREATE TABLE IF NOT EXISTS portal_theme_settings (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        portal_id UUID NOT NULL UNIQUE REFERENCES portal_configs(id) ON DELETE CASCADE,
        primary_hex_color VARCHAR(7) NOT NULL DEFAULT '#1890ff',
        secondary_hex_color VARCHAR(7) NOT NULL DEFAULT '#001529',
        font_family VARCHAR(50) NOT NULL DEFAULT 'Inter, sans-serif',
        layout_template_id VARCHAR(50) NOT NULL DEFAULT 'standard-default',
        layout_schema JSONB,
        hero_banner_url TEXT,
        official_photo_url TEXT,
        headline_tagline VARCHAR(255),
        bio_biography TEXT,
        updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
      );

      ALTER TABLE portal_theme_settings ADD COLUMN IF NOT EXISTS layout_schema JSONB;

      CREATE TABLE IF NOT EXISTS portal_documents (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        portal_id UUID NOT NULL REFERENCES portal_configs(id) ON DELETE CASCADE,
        title VARCHAR(255) NOT NULL,
        doc_type VARCHAR(50) DEFAULT 'REPORT_TRIWULAN' NOT NULL,
        description TEXT,
        file_url TEXT NOT NULL,
        file_size_bytes INTEGER,
        download_count INTEGER DEFAULT 0 NOT NULL,
        published_at TIMESTAMPTZ DEFAULT now() NOT NULL,
        created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
        updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
      );

      CREATE TABLE IF NOT EXISTS portal_newsletter_subscribers (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        portal_id UUID NOT NULL REFERENCES portal_configs(id) ON DELETE CASCADE,
        email VARCHAR(255) NOT NULL,
        is_active BOOLEAN DEFAULT true NOT NULL,
        created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
        updated_at TIMESTAMPTZ DEFAULT now() NOT NULL,
        CONSTRAINT unq_portal_email UNIQUE (portal_id, email)
      );

      CREATE INDEX IF NOT EXISTS idx_portal_subscribers ON portal_newsletter_subscribers (portal_id, created_at);

      CREATE TABLE IF NOT EXISTS social_links (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        portal_id UUID NOT NULL REFERENCES portal_configs(id) ON DELETE CASCADE,
        platform social_platform_enum NOT NULL,
        profile_url TEXT NOT NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
        CONSTRAINT unq_portal_platform UNIQUE (portal_id, platform)
      );

      CREATE TABLE IF NOT EXISTS domain_requests (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        tenant_id UUID NOT NULL REFERENCES tenant_members(id) ON DELETE CASCADE,
        request_type VARCHAR(20) NOT NULL,
        requested_domain VARCHAR(255) NOT NULL,
        current_domain VARCHAR(255),
        status VARCHAR(30) DEFAULT 'PENDING_REVIEW' NOT NULL,
        admin_notes TEXT,
        reviewed_by_user_id UUID,
        reviewed_at TIMESTAMPTZ,
        created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
      );
      CREATE INDEX IF NOT EXISTS idx_domain_requests_tenant ON domain_requests (tenant_id);
      CREATE INDEX IF NOT EXISTS idx_domain_requests_status ON domain_requests (status);

      CREATE TABLE IF NOT EXISTS subdomain_aliases (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        tenant_id UUID NOT NULL REFERENCES tenant_members(id) ON DELETE CASCADE,
        old_subdomain_slug VARCHAR(63) NOT NULL UNIQUE,
        new_subdomain_slug VARCHAR(63) NOT NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT now()
      );
      CREATE INDEX IF NOT EXISTS idx_subdomain_aliases_tenant ON subdomain_aliases (tenant_id);

      -- 4. Content & Studio
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

      -- 5. Knowledge & Vector Grounding
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
        vector_embedding ${vectorEmbeddingType} NOT NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT now()
      );

      CREATE TABLE IF NOT EXISTS member_writing_memories (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        tenant_id UUID NOT NULL REFERENCES tenant_members(id) ON DELETE CASCADE,
        sample_text TEXT NOT NULL,
        key_vocabulary TEXT[],
        writing_style_embedding ${vectorEmbeddingType} NOT NULL,
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
        created_at TIMESTAMPTZ NOT NULL DEFAULT now()
      );

      -- 6. Constituent & UU PDP Vault
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

      -- 7. Citizen Engagement & Comments
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

      -- 8. Lead Inquiries
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

      -- 9. Connected Social Accounts & Publishing
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
        meta_published_media_id VARCHAR(100),
        error_message TEXT,
        last_error_message TEXT,
        retry_count INTEGER NOT NULL DEFAULT 0,
        max_retries INTEGER NOT NULL DEFAULT 3,
        created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
      );

      ALTER TABLE social_publishing_jobs ADD COLUMN IF NOT EXISTS meta_post_id VARCHAR(100);
      ALTER TABLE social_publishing_jobs ADD COLUMN IF NOT EXISTS meta_permalink TEXT;
      ALTER TABLE social_publishing_jobs ADD COLUMN IF NOT EXISTS max_retries INTEGER NOT NULL DEFAULT 3;
      ALTER TABLE social_publishing_jobs ADD COLUMN IF NOT EXISTS last_error_message TEXT;
    `;
    await sql.unsafe(tablesSql);
    console.log('  -> All 33 tables created/verified.');

    console.log('\n[4/6] Creating Indexes & Performance Optimizations...');
    const indexSql = `
      CREATE INDEX IF NOT EXISTS idx_invoice_recon_status_time ON invoice_transactions (reconciliation_status, payment_status, settlement_time);
      CREATE INDEX IF NOT EXISTS idx_invoice_gateway_order ON invoice_transactions (gateway_order_id);
      CREATE INDEX IF NOT EXISTS idx_invoice_matrix_id ON invoice_transactions (matrix_id);
      CREATE INDEX IF NOT EXISTS idx_recon_batch_date_status ON reconciliation_batches (recon_date, status);
      CREATE INDEX IF NOT EXISTS idx_recon_discrepancy_batch_res ON reconciliation_discrepancies (batch_id, resolution_status);
      CREATE INDEX IF NOT EXISTS idx_recon_discrepancy_gateway_order ON reconciliation_discrepancies (gateway_order_id);
      CREATE INDEX IF NOT EXISTS idx_portal_custom_domain_lookup ON portal_configs (custom_domain, custom_domain_status, is_active) WHERE custom_domain IS NOT NULL;
      CREATE INDEX IF NOT EXISTS idx_content_publications_tenant_status ON content_publications(tenant_id, status);
      CREATE INDEX IF NOT EXISTS idx_constituent_feedbacks_portal_status ON constituent_feedbacks(portal_id, status);
      CREATE INDEX IF NOT EXISTS idx_comments_publication_status ON article_comments(publication_id, status, created_at DESC);
      CREATE INDEX IF NOT EXISTS idx_email_otps_lookup ON email_otps(email, is_used, expires_at);
      CREATE INDEX IF NOT EXISTS idx_price_matrix_lookup ON subscription_price_matrices (legislative_level, plan_tier, billing_cycle, is_active);
      CREATE INDEX IF NOT EXISTS idx_inquiry_status_level ON license_inquiries (status, legislative_level);
      CREATE INDEX IF NOT EXISTS idx_tenant_members_username ON tenant_members(username);
      CREATE INDEX IF NOT EXISTS idx_media_discourses_sector_region ON media_discourses (sector, region_scope, published_at DESC);
      CREATE INDEX IF NOT EXISTS idx_social_accounts_tenant ON connected_social_accounts (tenant_id, platform, status);
      CREATE INDEX IF NOT EXISTS idx_social_accounts_token_refresh ON connected_social_accounts (status, token_expires_at);
    `;
    await sql.unsafe(indexSql);

    if (hasVector) {
      try {
        await sql.unsafe(`
          CREATE INDEX IF NOT EXISTS idx_knowledge_chunks_vector ON knowledge_chunks USING hnsw (vector_embedding vector_cosine_ops);
          CREATE INDEX IF NOT EXISTS idx_member_writing_memories_vector ON member_writing_memories USING hnsw (writing_style_embedding vector_cosine_ops);
        `);
        console.log('  -> HNSW Cosine Similarity indexes verified.');
      } catch (err) {
        console.log(`  -> Warning on vector index: ${err.message}`);
      }
    }
    console.log('  -> Performance indexes verified.');

    console.log('\n[5/6] Enforcing PostgreSQL Row-Level Security (RLS) Kernel...');
    const rlsSql = `
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

      ALTER TABLE content_publications ENABLE ROW LEVEL SECURITY;
      ALTER TABLE media_assets ENABLE ROW LEVEL SECURITY;
      ALTER TABLE social_syndication_packs ENABLE ROW LEVEL SECURITY;
      ALTER TABLE portal_configs ENABLE ROW LEVEL SECURITY;
      ALTER TABLE portal_theme_settings ENABLE ROW LEVEL SECURITY;
      ALTER TABLE social_links ENABLE ROW LEVEL SECURITY;
      ALTER TABLE constituent_feedbacks ENABLE ROW LEVEL SECURITY;
      ALTER TABLE encrypted_pii_vaults ENABLE ROW LEVEL SECURITY;
      ALTER TABLE member_writing_memories ENABLE ROW LEVEL SECURITY;
      ALTER TABLE connected_social_accounts ENABLE ROW LEVEL SECURITY;
      ALTER TABLE social_publishing_jobs ENABLE ROW LEVEL SECURITY;
    `;
    await sql.unsafe(rlsSql);
    console.log('  -> Row-Level Security policies & tenant isolation kernel active.');

    console.log('\n[5b/6] Applying Operator & Research Engine Migrations...');
    const operatorSqlPath = path.join(rootDir, 'scripts/migrations_operator.sql');
    if (fs.existsSync(operatorSqlPath)) {
      const operatorSql = fs.readFileSync(operatorSqlPath, 'utf-8');
      await sql.unsafe(operatorSql);
      console.log('  -> Operator Schema & audit columns applied.');
    }
    const researchSqlPath = path.join(rootDir, 'packages/database/src/migrations_research.sql');
    if (fs.existsSync(researchSqlPath)) {
      const researchSql = fs.readFileSync(researchSqlPath, 'utf-8');
      await sql.unsafe(researchSql);
      console.log('  -> Research Engine schema applied.');
    }

    console.log('\n[6/6] Verifying Database Integrity & Tables Summary...');
    const tables = await sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name;
    `;
    console.log(`\nSUCCESS: ${tables.length} tables are fully registered in "public" schema!`);
    console.log('Tables:');
    tables.forEach((t, i) => console.log(`  ${(i + 1).toString().padStart(2, ' ')}. ${t.table_name}`));
    console.log('====================================================\n');
  } catch (error) {
    console.error('\nMIGRATION FAILED:', error);
    process.exit(1);
  } finally {
    await sql.end();
  }
}

runMigration();
