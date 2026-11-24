-- ==============================================================================
-- POLARIS PHASE 1: INSTITUTIONAL FOUNDATION, HIERARCHY & SCOPED AI KNOWLEDGE
-- ==============================================================================

-- 1. ENUM TYPES FOR INSTITUTIONAL WORKSPACE
DO $$ BEGIN
  CREATE TYPE organization_status_enum AS ENUM ('ACTIVE', 'SUSPENDED', 'ARCHIVED');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE organization_contract_status_enum AS ENUM ('DRAFT', 'ACTIVE', 'GRACE_PERIOD', 'EXPIRED', 'SUSPENDED');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE organization_unit_type_enum AS ENUM (
    'BANGGAR',
    'FRAKSI',
    'KOMISI',
    'BAPEMPERDA',
    'BAMUS',
    'BK',
    'PANJA',
    'PANSUS',
    'SEKRETARIAT',
    'BIDANG'
  );
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE organization_member_role_enum AS ENUM (
    'ORG_ADMIN',
    'LEADERSHIP',
    'MEMBER',
    'EXPERT_STAFF',
    'SECRETARIAT_STAFF'
  );
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE organization_unit_member_role_enum AS ENUM (
    'UNIT_LEAD',
    'REVIEWER',
    'MEMBER',
    'EXPERT_STAFF'
  );
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE institutional_membership_status_enum AS ENUM ('ACTIVE', 'INACTIVE', 'REVOKED');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE institutional_note_visibility_enum AS ENUM (
    'PRIVATE_DRAFT',
    'UNIT_SHARED',
    'PARENT_UNIT_ENDORSED',
    'ORG_SHARED'
  );
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- 2. RLS HELPER FUNCTIONS FOR INSTITUTIONAL CONTEXT
CREATE OR REPLACE FUNCTION polaris_current_org_id()
RETURNS uuid
LANGUAGE plpgsql
STABLE
AS $$
BEGIN
  RETURN NULLIF(current_setting('app.current_org_id', true), '')::uuid;
EXCEPTION
  WHEN invalid_text_representation THEN RETURN NULL;
END;
$$;

CREATE OR REPLACE FUNCTION polaris_current_unit_id()
RETURNS uuid
LANGUAGE plpgsql
STABLE
AS $$
BEGIN
  RETURN NULLIF(current_setting('app.current_unit_id', true), '')::uuid;
EXCEPTION
  WHEN invalid_text_representation THEN RETURN NULL;
END;
$$;

-- 3. MASTER ORGANIZATIONS (INSTANSI DPRD / DPR / DPD)
CREATE TABLE IF NOT EXISTS organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code VARCHAR(50) NOT NULL UNIQUE,
  name VARCHAR(200) NOT NULL,
  legislative_level legislative_level_enum NOT NULL,
  region_name VARCHAR(120) NOT NULL,
  province_name VARCHAR(100) NOT NULL,
  standing_orders_config JSONB NOT NULL DEFAULT '{}'::jsonb,
  status organization_status_enum NOT NULL DEFAULT 'ACTIVE',
  created_by_admin_id UUID REFERENCES system_admins(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_organizations_status_level ON organizations(status, legislative_level);
CREATE INDEX IF NOT EXISTS idx_organizations_region ON organizations(region_name);

-- 4. ORGANIZATION CONTRACTS (KONTRAK TAHUNAN B2G & POOLED QUOTA)
CREATE TABLE IF NOT EXISTS organization_contracts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  contract_number VARCHAR(100) NOT NULL UNIQUE,
  fiscal_year INTEGER NOT NULL,
  status organization_contract_status_enum NOT NULL DEFAULT 'DRAFT',
  start_date TIMESTAMPTZ NOT NULL,
  end_date TIMESTAMPTZ NOT NULL,
  grace_period_end TIMESTAMPTZ,
  max_seats INTEGER NOT NULL DEFAULT 50,
  max_storage_bytes BIGINT NOT NULL DEFAULT 10737418240,
  annual_token_pool_limit BIGINT NOT NULL DEFAULT 50000000,
  tokens_consumed BIGINT NOT NULL DEFAULT 0,
  contract_value_idr NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
  notes TEXT,
  created_by_admin_id UUID REFERENCES system_admins(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT chk_org_contracts_dates CHECK (end_date > start_date),
  CONSTRAINT chk_org_contracts_max_seats CHECK (max_seats > 0)
);

CREATE INDEX IF NOT EXISTS idx_org_contracts_org_status ON organization_contracts(organization_id, status, end_date);

-- 5. ORGANIZATION UNITS (HIERARKI BANGGAR, FRAKSI, KOMISI, PANJA, & BIDANG)
CREATE TABLE IF NOT EXISTS organization_units (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  parent_unit_id UUID REFERENCES organization_units(id) ON DELETE RESTRICT,
  unit_type organization_unit_type_enum NOT NULL,
  code VARCHAR(60) NOT NULL,
  name VARCHAR(180) NOT NULL,
  description TEXT,
  political_party_id UUID REFERENCES master_political_parties(id) ON DELETE SET NULL,
  focus_sectors TEXT[] NOT NULL DEFAULT '{}',
  partner_opds TEXT[] NOT NULL DEFAULT '{}',
  is_ad_hoc BOOLEAN NOT NULL DEFAULT false,
  fiscal_year INTEGER,
  is_active BOOLEAN NOT NULL DEFAULT true,
  archived_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT unq_org_units_org_code UNIQUE (organization_id, code),
  CONSTRAINT chk_org_units_no_self_parent CHECK (parent_unit_id IS NULL OR parent_unit_id != id)
);

CREATE INDEX IF NOT EXISTS idx_org_units_org_parent ON organization_units(organization_id, parent_unit_id, is_active);
CREATE INDEX IF NOT EXISTS idx_org_units_org_type ON organization_units(organization_id, unit_type);

-- 6. ORGANIZATION MEMBERSHIPS (ANGGOTA INSTANSI & ADMIN SEKRETARIAT)
CREATE TABLE IF NOT EXISTS organization_memberships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  tenant_id UUID NOT NULL REFERENCES tenant_members(id) ON DELETE CASCADE,
  org_role organization_member_role_enum NOT NULL DEFAULT 'MEMBER',
  status institutional_membership_status_enum NOT NULL DEFAULT 'ACTIVE',
  title_or_position VARCHAR(150),
  joined_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT unq_org_memberships_org_tenant UNIQUE (organization_id, tenant_id)
);

CREATE INDEX IF NOT EXISTS idx_org_memberships_tenant ON organization_memberships(tenant_id, status);
CREATE INDEX IF NOT EXISTS idx_org_memberships_org_role ON organization_memberships(organization_id, org_role, status);

-- 7. ORGANIZATION UNIT MEMBERSHIPS (MANY-TO-MANY PENUGASAN KE UNIT / BIDANG)
CREATE TABLE IF NOT EXISTS organization_unit_memberships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  unit_id UUID NOT NULL REFERENCES organization_units(id) ON DELETE CASCADE,
  tenant_id UUID NOT NULL REFERENCES tenant_members(id) ON DELETE CASCADE,
  unit_role organization_unit_member_role_enum NOT NULL DEFAULT 'MEMBER',
  status institutional_membership_status_enum NOT NULL DEFAULT 'ACTIVE',
  assigned_by_tenant_id UUID REFERENCES tenant_members(id) ON DELETE SET NULL,
  assigned_by_admin_id UUID REFERENCES system_admins(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT unq_org_unit_memberships_unit_tenant UNIQUE (unit_id, tenant_id),
  CONSTRAINT fk_unit_membership_org_member
    FOREIGN KEY (organization_id, tenant_id)
    REFERENCES organization_memberships(organization_id, tenant_id)
    ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_org_unit_memberships_tenant ON organization_unit_memberships(tenant_id, organization_id, status);
CREATE INDEX IF NOT EXISTS idx_org_unit_memberships_unit ON organization_unit_memberships(unit_id, status);

-- 8. ORGANIZATION QUOTA LEDGERS (REKAP PEMAKAIAN TOKEN AI PER INSTANSI & BIDANG)
CREATE TABLE IF NOT EXISTS organization_quota_ledgers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  unit_id UUID REFERENCES organization_units(id) ON DELETE SET NULL,
  billing_cycle_month VARCHAR(7) NOT NULL,
  total_requests INTEGER NOT NULL DEFAULT 0,
  openai_input_tokens BIGINT NOT NULL DEFAULT 0,
  openai_output_tokens BIGINT NOT NULL DEFAULT 0,
  openai_total_tokens BIGINT NOT NULL DEFAULT 0,
  openai_cost_idr BIGINT NOT NULL DEFAULT 0,
  gemini_input_tokens BIGINT NOT NULL DEFAULT 0,
  gemini_output_tokens BIGINT NOT NULL DEFAULT 0,
  gemini_total_tokens BIGINT NOT NULL DEFAULT 0,
  gemini_cost_idr BIGINT NOT NULL DEFAULT 0,
  total_tokens_consumed BIGINT NOT NULL DEFAULT 0,
  total_cost_idr BIGINT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_org_quota_ledgers_org_month ON organization_quota_ledgers(organization_id, billing_cycle_month);
CREATE INDEX IF NOT EXISTS idx_org_quota_ledgers_unit_month ON organization_quota_ledgers(organization_id, unit_id, billing_cycle_month);

-- 9. INSTITUTIONAL SHARED NOTES (CATATAN KERJA & ANALISIS AI DALAM BIDANG)
CREATE TABLE IF NOT EXISTS institutional_shared_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  unit_id UUID NOT NULL REFERENCES organization_units(id) ON DELETE CASCADE,
  author_tenant_id UUID NOT NULL REFERENCES tenant_members(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  content_markdown TEXT NOT NULL,
  visibility institutional_note_visibility_enum NOT NULL DEFAULT 'UNIT_SHARED',
  source_file_ids UUID[] NOT NULL DEFAULT '{}',
  approved_by_tenant_id UUID REFERENCES tenant_members(id) ON DELETE SET NULL,
  approved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_inst_shared_notes_org_unit ON institutional_shared_notes(organization_id, unit_id, visibility);

-- 10. INSTITUTIONAL AUDIT LOGS
CREATE TABLE IF NOT EXISTS institutional_audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  unit_id UUID REFERENCES organization_units(id) ON DELETE SET NULL,
  actor_tenant_id UUID REFERENCES tenant_members(id) ON DELETE SET NULL,
  actor_admin_id UUID REFERENCES system_admins(id) ON DELETE SET NULL,
  action VARCHAR(100) NOT NULL,
  target_entity VARCHAR(60) NOT NULL,
  target_entity_id UUID,
  details JSONB DEFAULT '{}'::jsonb,
  ip_address VARCHAR(50),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_inst_audit_logs_org_created ON institutional_audit_logs(organization_id, created_at DESC);

-- 11. ADDITIVE COLUMNS & CHECK CONSTRAINTS ON EXISTING TABLES
ALTER TABLE datahub_document_refs
  ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;

ALTER TABLE datahub_document_refs
  ADD COLUMN IF NOT EXISTS organization_unit_id UUID REFERENCES organization_units(id) ON DELETE CASCADE;

CREATE INDEX IF NOT EXISTS idx_datahub_refs_org_unit_scope
  ON datahub_document_refs(organization_id, organization_unit_id, privacy_scope);

DO $$ BEGIN
  ALTER TABLE datahub_document_refs
    ADD CONSTRAINT chk_datahub_refs_institutional_scope CHECK (
      (privacy_scope = 'UNIT_BIDANG' AND organization_id IS NOT NULL AND organization_unit_id IS NOT NULL)
      OR (privacy_scope = 'ORG_SHARED' AND organization_id IS NOT NULL AND organization_unit_id IS NULL)
      OR (privacy_scope IN ('PRIVATE_TENANT', 'PARTY_CONFIDENTIAL', 'DAPIL_SHARED', 'PUBLIC_SYSTEM'))
    );
EXCEPTION WHEN duplicate_object THEN null; END $$;

ALTER TABLE ai_trace_logs
  ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE SET NULL;

ALTER TABLE ai_trace_logs
  ADD COLUMN IF NOT EXISTS organization_unit_id UUID REFERENCES organization_units(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_ai_trace_org_unit_created
  ON ai_trace_logs(organization_id, organization_unit_id, created_at DESC);
