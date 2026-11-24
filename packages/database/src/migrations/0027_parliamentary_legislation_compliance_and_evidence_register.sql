-- ==============================================================================
-- POLARIS PHASE 3: LEGAL KNOWLEDGE VERSIONING, LEGISLATION WORKSPACE (8+ STAGES),
-- CLAUSE COMPLIANCE CRITIC, DIM, & PERFORMANCE EVIDENCE REGISTER
-- ==============================================================================

-- 1. ENUM TYPES
DO $$ BEGIN
  CREATE TYPE parliamentary_document_category_enum AS ENUM (
    'PRODUK_HUKUM',
    'KEPUTUSAN_KELEMBAGAAN',
    'DOKUMEN_PEMBAHASAN',
    'BAHAN_KOMUNIKASI'
  );
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE legislation_stage_enum AS ENUM (
    'IDENTIFIKASI_MASALAH',
    'PENENTUAN_INSTRUMEN',
    'PERENCANAAN',
    'KAJIAN_DAN_NASKAH_AKADEMIK',
    'PERUMUSAN_RANCANGAN',
    'PARTISIPASI_MASYARAKAT',
    'PEMERIKSAAN_DAN_PEMBAHASAN',
    'PENYELESAIAN_FORMAL',
    'PEMANTAUAN_PELAKSANAAN'
  );
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE clause_inspection_status_enum AS ENUM (
    'PERLU_DATA',
    'PERLU_TELAAH_HUKUM',
    'PERLU_KEPUTUSAN_KEBIJAKAN',
    'SIAP_PEMERIKSAAN_AKHIR'
  );
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE legal_rule_verification_status_enum AS ENUM (
    'VERIFIED_ACTIVE',
    'AMENDED',
    'REVOKED',
    'UNVERIFIED_NEEDS_CHECK'
  );
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE dim_entry_status_enum AS ENUM (
    'OPEN',
    'DISCUSSED',
    'AGREED',
    'DEFERRED',
    'REJECTED'
  );
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE performance_achievement_level_enum AS ENUM (
    'DIUSULKAN',
    'DIBAHAS',
    'DIREKOMENDASIKAN',
    'DISEPAKATI',
    'DILAKSANAKAN',
    'MENUNJUKKAN_HASIL'
  );
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE performance_contribution_scope_enum AS ENUM (
    'KONTRIBUSI_INDIVIDU',
    'SIKAP_FRAKSI_UNIT',
    'KEPUTUSAN_KOLEKTIF_LEMBAGA',
    'PELAKSANAAN_PEMERINTAH'
  );
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- 2. LEGAL KNOWLEDGE VERSIONS (BASIS PENGETAHUAN HUKUM TERVERSI)
CREATE TABLE IF NOT EXISTS legal_knowledge_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  rule_code VARCHAR(100) NOT NULL,
  title VARCHAR(255) NOT NULL,
  hierarchy_layer VARCHAR(100) NOT NULL,
  jurisdiction_region VARCHAR(120) NOT NULL DEFAULT 'NASIONAL',
  effective_date TIMESTAMPTZ NOT NULL,
  amendment_summary TEXT,
  verification_status legal_rule_verification_status_enum NOT NULL DEFAULT 'UNVERIFIED_NEEDS_CHECK',
  source_url TEXT,
  verified_by_admin_id UUID REFERENCES system_admins(id) ON DELETE SET NULL,
  verified_by_tenant_id UUID REFERENCES tenant_members(id) ON DELETE SET NULL,
  last_verified_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT unq_legal_knowledge_rule_region UNIQUE (rule_code, jurisdiction_region)
);

CREATE INDEX IF NOT EXISTS idx_legal_knowledge_status
  ON legal_knowledge_versions(verification_status, jurisdiction_region);

-- Seed Lapisan Pedoman Hukum Parlemen Standar Indonesia (sesuai dokumen PDF hal. 2-3, termasuk UU 1/2026)
INSERT INTO legal_knowledge_versions (
  rule_code, title, hierarchy_layer, jurisdiction_region, effective_date, amendment_summary, verification_status, last_verified_at
)
VALUES
  (
    'UUD-1945',
    'Undang-Undang Dasar Negara Republik Indonesia Tahun 1945',
    'KONSTITUSI',
    'NASIONAL',
    '1945-08-18T00:00:00Z',
    'Dasar kewenangan konstitusional lembaga legislatif & pemerintahan daerah.',
    'VERIFIED_ACTIVE',
    now()
  ),
  (
    'UU-12-2011-JO-UU-1-2026',
    'UU Pembentukan Peraturan Perundang-undangan (UU 12/2011 jo. UU 13/2022 jo. UU 1/2026)',
    'UNDANG_UNDANG_PPP',
    'NASIONAL',
    '2026-01-02T00:00:00Z',
    'Termasuk penguatan partisipasi masyarakat (Pasal 96 UU 13/2022) dan perubahan Pasal 15 mengenai ketentuan pidana melalui UU 1/2026.',
    'VERIFIED_ACTIVE',
    now()
  ),
  (
    'PP-12-2018',
    'PP Nomor 12 Tahun 2018 tentang Pedoman Penyusunan Tata Tertib DPRD',
    'TATA_TERTIB_DPRD',
    'NASIONAL',
    '2018-04-12T00:00:00Z',
    'Pedoman penyusunan Tata Tertib DPRD Provinsi, Kabupaten, dan Kota.',
    'VERIFIED_ACTIVE',
    now()
  ),
  (
    'PP-13-2019',
    'PP Nomor 13 Tahun 2019 tentang Laporan dan Evaluasi Penyelenggaraan Pemerintahan Daerah',
    'EVALUASI_LKPJ',
    'NASIONAL',
    '2019-03-13T00:00:00Z',
    'Penyampaian LKPJ paling lambat 3 bulan setelah TA berakhir dan pembahasan DPRD paling lambat 30 hari.',
    'VERIFIED_ACTIVE',
    now()
  ),
  (
    'PERMENDAGRI-80-2015-JO-120-2018',
    'Permendagri 80/2015 sebagaimana diubah Permendagri 120/2018 tentang Pembentukan Produk Hukum Daerah',
    'PRODUK_HUKUM_DAERAH',
    'NASIONAL',
    '2018-12-20T00:00:00Z',
    'Jalur penyusunan, fasilitasi, harmonisasi, dan evaluasi Raperda/Perkada.',
    'VERIFIED_ACTIVE',
    now()
  )
ON CONFLICT (rule_code, jurisdiction_region) DO NOTHING;

-- 3. LEGISLATION DRAFTS (RUANG KERJA LEGISLASI)
CREATE TABLE IF NOT EXISTS legislation_drafts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  origin_unit_id UUID REFERENCES organization_units(id) ON DELETE SET NULL,
  title VARCHAR(255) NOT NULL,
  document_category parliamentary_document_category_enum NOT NULL DEFAULT 'PRODUK_HUKUM',
  current_stage legislation_stage_enum NOT NULL DEFAULT 'IDENTIFIKASI_MASALAH',
  problem_statement TEXT,
  instrument_choice_rationale TEXT,
  academic_paper_summary TEXT,
  has_criminal_sanction_provision BOOLEAN NOT NULL DEFAULT false,
  legal_basis_verified_at TIMESTAMPTZ,
  created_by_tenant_id UUID NOT NULL REFERENCES tenant_members(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT unq_legislation_draft_id_org UNIQUE (id, organization_id)
);

CREATE INDEX IF NOT EXISTS idx_legislation_drafts_org_stage
  ON legislation_drafts(organization_id, document_category, current_stage);

-- 4. LEGISLATION CLAUSES (EDITOR BERBASIS PASAL + LEMBAR PEMERIKSAAN KUALITAS)
CREATE TABLE IF NOT EXISTS legislation_clauses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  draft_id UUID NOT NULL REFERENCES legislation_drafts(id) ON DELETE CASCADE,
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  clause_number VARCHAR(60) NOT NULL,
  clause_title VARCHAR(200),
  clause_text TEXT NOT NULL,
  explanation_text TEXT,
  problem_addressed TEXT,
  legal_authority_source TEXT,
  regulated_subjects TEXT,
  related_clauses TEXT,
  impact_assessment TEXT,
  implementation_supervision TEXT,
  interpretation_risks TEXT,
  compliance_critic_warnings JSONB NOT NULL DEFAULT '[]'::jsonb,
  inspection_status clause_inspection_status_enum NOT NULL DEFAULT 'PERLU_TELAAH_HUKUM',
  checked_by_tenant_id UUID REFERENCES tenant_members(id) ON DELETE SET NULL,
  checked_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT fk_legislation_clause_draft_org
    FOREIGN KEY (draft_id, organization_id)
    REFERENCES legislation_drafts(id, organization_id)
    ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_legislation_clauses_draft
  ON legislation_clauses(draft_id, inspection_status);

-- 5. LEGISLATION DIM ENTRIES (DAFTAR INVENTARISASI MASALAH & PARTISIPASI MASYARAKAT)
CREATE TABLE IF NOT EXISTS legislation_dim_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  draft_id UUID NOT NULL REFERENCES legislation_drafts(id) ON DELETE CASCADE,
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  source_party_name VARCHAR(180) NOT NULL,
  is_public_consultation BOOLEAN NOT NULL DEFAULT false,
  target_clause_ref VARCHAR(100) NOT NULL,
  issue_summary TEXT NOT NULL,
  proposed_amendment TEXT NOT NULL,
  response_and_followup TEXT,
  status dim_entry_status_enum NOT NULL DEFAULT 'OPEN',
  created_by_tenant_id UUID NOT NULL REFERENCES tenant_members(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT fk_legislation_dim_draft_org
    FOREIGN KEY (draft_id, organization_id)
    REFERENCES legislation_drafts(id, organization_id)
    ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_legislation_dim_draft
  ON legislation_dim_entries(draft_id, status);

-- 6. PERFORMANCE EVIDENCE REGISTERS (REGISTER BUKTI KINERJA -> STUDIO PUBLIKASI)
CREATE TABLE IF NOT EXISTS performance_evidence_registers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  unit_id UUID REFERENCES organization_units(id) ON DELETE SET NULL,
  tenant_id UUID NOT NULL REFERENCES tenant_members(id) ON DELETE CASCADE,
  lkpj_finding_id UUID REFERENCES lkpj_findings(id) ON DELETE SET NULL,
  legislation_draft_id UUID REFERENCES legislation_drafts(id) ON DELETE SET NULL,
  title VARCHAR(255) NOT NULL,
  achievement_level performance_achievement_level_enum NOT NULL DEFAULT 'DIUSULKAN',
  contribution_scope performance_contribution_scope_enum NOT NULL DEFAULT 'KONTRIBUSI_INDIVIDU',
  evidence_source_ref TEXT NOT NULL,
  summary_text TEXT NOT NULL,
  is_verified BOOLEAN NOT NULL DEFAULT false,
  verified_by_tenant_id UUID REFERENCES tenant_members(id) ON DELETE SET NULL,
  verified_at TIMESTAMPTZ,
  linked_publication_id UUID REFERENCES content_publications(id) ON DELETE SET NULL,
  generated_publication_draft_markdown TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_perf_evidence_org_unit
  ON performance_evidence_registers(organization_id, unit_id, is_verified);
