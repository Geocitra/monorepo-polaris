-- ==============================================================================
-- POLARIS PHASE 2: LKPJ EVALUATION WORKSPACE, 8 EVALUATION MATERIALS,
-- DETERMINISTIC FINDINGS MATRIX & FACTION CONSOLIDATION
-- ==============================================================================

-- 1. ENUM TYPES FOR LKPJ EVALUATION
DO $$ BEGIN
  CREATE TYPE lkpj_workspace_status_enum AS ENUM (
    'REGISTERED',
    'IN_DISCUSSION',
    'PRE_PLENARY_CONSOLIDATION',
    'PLENARY_ADOPTED',
    'POST_PLENARY_MONITORING'
  );
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE lkpj_material_category_enum AS ENUM (
    'LKPJ_PEMDA',
    'RPJMD_RKPD_APBD',
    'ASPIRASI_MASYARAKAT',
    'KELUARAN_PANJA',
    'REKOMENDASI_FRAKSI',
    'ANALISIS_TENAGA_AHLI',
    'LAPORAN_PENDUKUNG',
    'PERATURAN_BERLAKU'
  );
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE lkpj_extraction_verification_status_enum AS ENUM (
    'PENDING_VERIFICATION',
    'VERIFIED',
    'FLAGGED_DOUBTFUL'
  );
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE lkpj_indicator_direction_enum AS ENUM (
    'HIGHER_IS_BETTER',
    'LOWER_IS_BETTER',
    'TARGET_BAND'
  );
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE lkpj_evidence_status_enum AS ENUM (
    'INSUFFICIENT_OPEN',
    'STILL_OPEN_AT_CLOSING',
    'SUFFICIENT_VERIFIED'
  );
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE lkpj_finding_review_status_enum AS ENUM (
    'DRAFT',
    'NEEDS_REVISION',
    'APPROVED_FOR_DISCUSSION',
    'CONSOLIDATED_FOR_PLENARY',
    'OFFICIAL_RECOMMENDATION'
  );
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE lkpj_followup_status_enum AS ENUM (
    'OPEN',
    'IN_PROGRESS',
    'COMPLETED_VERIFIED',
    'CARRIED_TO_NEXT_EVALUATION'
  );
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE lkpj_faction_stance_enum AS ENUM (
    'CONCUR_WITH_PANJA',
    'PROPOSE_AMENDMENT',
    'DISSENT_NEED_DECISION'
  );
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- 2. LKPJ EVALUATION WORKSPACES (1 RUANG KERJA PER PEMDA / INSTANSI & TAHUN ANGGARAN)
CREATE TABLE IF NOT EXISTS lkpj_evaluation_workspaces (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  fiscal_year INTEGER NOT NULL,
  title VARCHAR(220) NOT NULL,
  status lkpj_workspace_status_enum NOT NULL DEFAULT 'REGISTERED',
  assigned_discussion_unit_id UUID REFERENCES organization_units(id) ON DELETE SET NULL,
  lkpj_submitted_at TIMESTAMPTZ NOT NULL,
  discussion_deadline_at TIMESTAMPTZ NOT NULL,
  pre_plenary_at TIMESTAMPTZ,
  final_plenary_at TIMESTAMPTZ,
  standing_orders_notes TEXT,
  created_by_tenant_id UUID REFERENCES tenant_members(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT unq_lkpj_workspace_org_year UNIQUE (organization_id, fiscal_year),
  CONSTRAINT unq_lkpj_workspace_id_org UNIQUE (id, organization_id),
  CONSTRAINT chk_lkpj_workspace_deadline CHECK (discussion_deadline_at >= lkpj_submitted_at)
);

CREATE INDEX IF NOT EXISTS idx_lkpj_workspaces_org_status
  ON lkpj_evaluation_workspaces(organization_id, status, fiscal_year);

-- 3. LKPJ EVALUATION MATERIALS (8 BAHAN EVALUASI & ANTREAN VERIFIKASI PENELAAH)
CREATE TABLE IF NOT EXISTS lkpj_evaluation_materials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES lkpj_evaluation_workspaces(id) ON DELETE CASCADE,
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  origin_unit_id UUID REFERENCES organization_units(id) ON DELETE SET NULL,
  material_category lkpj_material_category_enum NOT NULL,
  title VARCHAR(255) NOT NULL,
  document_version VARCHAR(80) NOT NULL DEFAULT 'FINAL-V1',
  source_year INTEGER NOT NULL,
  page_or_article_range VARCHAR(120),
  datahub_ref_id UUID REFERENCES datahub_document_refs(id) ON DELETE SET NULL,
  datahub_file_id UUID REFERENCES datahub_files(id) ON DELETE SET NULL,
  extraction_confidence REAL NOT NULL DEFAULT 0.95,
  verification_status lkpj_extraction_verification_status_enum NOT NULL DEFAULT 'VERIFIED',
  doubtful_queue_notes TEXT,
  verified_by_tenant_id UUID REFERENCES tenant_members(id) ON DELETE SET NULL,
  verified_at TIMESTAMPTZ,
  summary_excerpt TEXT,
  uploaded_by_tenant_id UUID NOT NULL REFERENCES tenant_members(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT fk_lkpj_material_workspace_org
    FOREIGN KEY (workspace_id, organization_id)
    REFERENCES lkpj_evaluation_workspaces(id, organization_id)
    ON DELETE CASCADE,
  CONSTRAINT chk_lkpj_material_confidence
    CHECK (extraction_confidence >= 0 AND extraction_confidence <= 1)
);

CREATE INDEX IF NOT EXISTS idx_lkpj_materials_ws_cat
  ON lkpj_evaluation_materials(workspace_id, material_category, verification_status);

-- 4. LKPJ FINDINGS (MATRIKS TEMUAN TERSTRUKTUR & DETERMINISTIK)
CREATE TABLE IF NOT EXISTS lkpj_findings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES lkpj_evaluation_workspaces(id) ON DELETE CASCADE,
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  origin_unit_id UUID REFERENCES organization_units(id) ON DELETE SET NULL,
  fiscal_year INTEGER NOT NULL,
  government_affair VARCHAR(160) NOT NULL,
  opd_name VARCHAR(180) NOT NULL,
  program_or_activity VARCHAR(240),
  indicator_or_issue TEXT NOT NULL,
  indicator_unit VARCHAR(60) NOT NULL DEFAULT '%',
  indicator_direction lkpj_indicator_direction_enum NOT NULL DEFAULT 'HIGHER_IS_BETTER',
  compatibility_verified BOOLEAN NOT NULL DEFAULT true,
  compatibility_notes TEXT,
  rpjmd_commitment_baseline TEXT,
  target_value NUMERIC(18, 4),
  realization_value NUMERIC(18, 4),
  achievement_gap NUMERIC(18, 4),
  achievement_percentage NUMERIC(10, 2),
  budget_ceiling_idr BIGINT,
  budget_realization_idr BIGINT,
  budget_absorption_percentage NUMERIC(10, 2),
  location_coverage TEXT,
  source_evidence_ref TEXT NOT NULL,
  source_material_id UUID REFERENCES lkpj_evaluation_materials(id) ON DELETE SET NULL,
  citizen_aspiration_summary TEXT,
  opd_clarification_question TEXT,
  opd_response TEXT,
  evidence_status lkpj_evidence_status_enum NOT NULL DEFAULT 'INSUFFICIENT_OPEN',
  missing_evidence_notes TEXT,
  review_status lkpj_finding_review_status_enum NOT NULL DEFAULT 'DRAFT',
  proposed_recommendation TEXT,
  legal_basis_ref TEXT,
  responsible_opd VARCHAR(180),
  followup_deadline TIMESTAMPTZ,
  completion_indicator TEXT,
  followup_status lkpj_followup_status_enum NOT NULL DEFAULT 'OPEN',
  followup_response_pemda TEXT,
  followup_proof_ref TEXT,
  created_by_tenant_id UUID NOT NULL REFERENCES tenant_members(id) ON DELETE CASCADE,
  reviewed_by_tenant_id UUID REFERENCES tenant_members(id) ON DELETE SET NULL,
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT fk_lkpj_finding_workspace_org
    FOREIGN KEY (workspace_id, organization_id)
    REFERENCES lkpj_evaluation_workspaces(id, organization_id)
    ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_lkpj_findings_ws_opd
  ON lkpj_findings(workspace_id, opd_name, evidence_status, review_status);

CREATE INDEX IF NOT EXISTS idx_lkpj_findings_ws_affair
  ON lkpj_findings(workspace_id, government_affair);

-- 5. LKPJ FACTION PROPOSALS (MATRIKS USULAN FRAKSI, TITIK TEMU & PERBEDAAN)
CREATE TABLE IF NOT EXISTS lkpj_faction_proposals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES lkpj_evaluation_workspaces(id) ON DELETE CASCADE,
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  finding_id UUID NOT NULL REFERENCES lkpj_findings(id) ON DELETE CASCADE,
  faction_unit_id UUID NOT NULL REFERENCES organization_units(id) ON DELETE CASCADE,
  priority_level VARCHAR(20) NOT NULL DEFAULT 'HIGH',
  stance_position lkpj_faction_stance_enum NOT NULL DEFAULT 'CONCUR_WITH_PANJA',
  supervision_priority_notes TEXT,
  proposed_redaction TEXT NOT NULL,
  submitted_by_tenant_id UUID NOT NULL REFERENCES tenant_members(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT unq_lkpj_faction_proposal_finding_unit UNIQUE (finding_id, faction_unit_id),
  CONSTRAINT fk_lkpj_faction_prop_workspace_org
    FOREIGN KEY (workspace_id, organization_id)
    REFERENCES lkpj_evaluation_workspaces(id, organization_id)
    ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_lkpj_faction_proposals_ws
  ON lkpj_faction_proposals(workspace_id, finding_id);
