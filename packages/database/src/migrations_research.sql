-- ==============================================================================
-- POLARIS AUTONOMOUS RESEARCH & EVIDENCE ENGINE SCHEMA MIGRATION
-- ==============================================================================

DO $$ BEGIN
  CREATE TYPE research_job_status_enum AS ENUM (
    'PENDING', 'PLANNING', 'SEARCHING', 'EVALUATING', 'EXTRACTING', 'WRITING', 'COMPLETED', 'FAILED'
  );
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE question_intent_enum AS ENUM (
    'REGULATORY', 'STATISTICAL_BENCHMARK', 'PUBLIC_OPINION', 'POLICY_EVALUATION', 'FACTUAL_VERIFICATION'
  );
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE question_status_enum AS ENUM (
    'UNRESOLVED', 'PARTIAL', 'RESOLVED'
  );
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE source_type_enum AS ENUM (
    'INTERNAL_REGULATION', 'INTERNAL_NEWS', 'EXTERNAL_WEB', 'ACADEMIC_PAPER', 'USER_ATTACHMENT'
  );
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE publisher_type_enum AS ENUM (
    'GOVERNMENT', 'MEDIA', 'ACADEMIC', 'INDUSTRY', 'USER'
  );
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE source_lifecycle_enum AS ENUM (
    'DISCOVERED', 'FETCHED', 'ASSESSED', 'VERIFIED', 'REJECTED', 'STALE'
  );
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE claim_status_enum AS ENUM (
    'UNSUPPORTED', 'PARTIALLY_SUPPORTED', 'VERIFIED', 'CONTRADICTED'
  );
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE support_type_enum AS ENUM (
    'SUPPORTS', 'REFUTES', 'NEUTRAL_CONTEXT'
  );
EXCEPTION WHEN duplicate_object THEN null;
END $$;

-- 1. RESEARCH JOBS
CREATE TABLE IF NOT EXISTS research_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenant_members(id) ON DELETE CASCADE,
  topic VARCHAR(255) NOT NULL,
  user_prompt TEXT NOT NULL,
  target_region VARCHAR(100) NOT NULL,
  status research_job_status_enum NOT NULL DEFAULT 'PENDING',
  evidence_sufficient BOOLEAN NOT NULL DEFAULT false,
  qc_passed BOOLEAN NOT NULL DEFAULT false,
  summary_report TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_research_jobs_tenant_status ON research_jobs(tenant_id, status);

-- 2. RESEARCH QUESTIONS
CREATE TABLE IF NOT EXISTS research_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  research_job_id UUID NOT NULL REFERENCES research_jobs(id) ON DELETE CASCADE,
  question TEXT NOT NULL,
  intent_category question_intent_enum NOT NULL DEFAULT 'POLICY_EVALUATION',
  temporal_bound VARCHAR(50),
  geographic_scope VARCHAR(100),
  min_required_evidence INTEGER NOT NULL DEFAULT 1,
  status question_status_enum NOT NULL DEFAULT 'UNRESOLVED',
  resolution_summary TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_research_questions_job ON research_questions(research_job_id);

-- 3. SOURCES
CREATE TABLE IF NOT EXISTS sources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  url TEXT NOT NULL,
  canonical_url TEXT,
  source_type source_type_enum NOT NULL,
  publisher_name VARCHAR(255),
  publisher_type publisher_type_enum NOT NULL DEFAULT 'MEDIA',
  publisher_credibility_score REAL NOT NULL DEFAULT 0.5,
  doi VARCHAR(100),
  is_peer_reviewed BOOLEAN,
  has_retractions_or_corrections BOOLEAN NOT NULL DEFAULT false,
  lifecycle_status source_lifecycle_enum NOT NULL DEFAULT 'DISCOVERED',
  rejection_reason TEXT,
  retrieved_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_sources_url ON sources(url);
CREATE INDEX IF NOT EXISTS idx_sources_lifecycle ON sources(lifecycle_status);

-- 4. RESEARCH JOB SOURCES
CREATE TABLE IF NOT EXISTS research_job_sources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  research_job_id UUID NOT NULL REFERENCES research_jobs(id) ON DELETE CASCADE,
  source_id UUID NOT NULL REFERENCES sources(id) ON DELETE CASCADE,
  relevance_score REAL NOT NULL DEFAULT 0.5,
  query_used TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_research_job_sources_pair ON research_job_sources(research_job_id, source_id);

-- 5. SOURCE VERSIONS
CREATE TABLE IF NOT EXISTS source_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source_id UUID NOT NULL REFERENCES sources(id) ON DELETE CASCADE,
  content_hash VARCHAR(64) NOT NULL,
  title TEXT NOT NULL,
  raw_content TEXT,
  extracted_text TEXT NOT NULL,
  http_status INTEGER NOT NULL DEFAULT 200,
  fetched_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_source_versions_source_hash ON source_versions(source_id, content_hash);

-- 6. SOURCE ASSESSMENTS
CREATE TABLE IF NOT EXISTS source_assessments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source_id UUID NOT NULL REFERENCES sources(id) ON DELETE CASCADE,
  substantive_score REAL NOT NULL,
  methodology_score REAL,
  recency_score REAL NOT NULL,
  overall_score REAL NOT NULL,
  assessment_reason TEXT NOT NULL,
  is_accepted BOOLEAN NOT NULL,
  evaluated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 7. EVIDENCE SPANS
CREATE TABLE IF NOT EXISTS evidence_spans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source_id UUID NOT NULL REFERENCES sources(id) ON DELETE CASCADE,
  source_version_id UUID REFERENCES source_versions(id) ON DELETE SET NULL,
  verbatim_quote TEXT NOT NULL,
  context_snippet TEXT NOT NULL,
  section_or_page VARCHAR(100),
  confidence_score REAL NOT NULL DEFAULT 1.0,
  is_verified BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_evidence_spans_source ON evidence_spans(source_id);

-- 8. CLAIMS
CREATE TABLE IF NOT EXISTS claims (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  research_job_id UUID NOT NULL REFERENCES research_jobs(id) ON DELETE CASCADE,
  research_question_id UUID REFERENCES research_questions(id) ON DELETE SET NULL,
  claim_statement TEXT NOT NULL,
  status claim_status_enum NOT NULL DEFAULT 'UNSUPPORTED',
  confidence_score REAL NOT NULL DEFAULT 0.0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_claims_job ON claims(research_job_id);

-- 9. CLAIM EVIDENCE
CREATE TABLE IF NOT EXISTS claim_evidence (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  claim_id UUID NOT NULL REFERENCES claims(id) ON DELETE CASCADE,
  evidence_span_id UUID NOT NULL REFERENCES evidence_spans(id) ON DELETE CASCADE,
  support_type support_type_enum NOT NULL DEFAULT 'SUPPORTS',
  relationship_explanation TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_claim_evidence_pair ON claim_evidence(claim_id, evidence_span_id);

-- 10. RESEARCH OUTPUTS
CREATE TABLE IF NOT EXISTS research_outputs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  research_job_id UUID NOT NULL REFERENCES research_jobs(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  executive_summary TEXT NOT NULL,
  markdown_body TEXT NOT NULL,
  bibliography_json JSONB NOT NULL,
  qc_report JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 11. LINK CONTENT PUBLICATIONS TO RESEARCH JOBS
DO $$ BEGIN
  ALTER TABLE content_publications ADD COLUMN IF NOT EXISTS research_job_id UUID REFERENCES research_jobs(id) ON DELETE SET NULL;
EXCEPTION WHEN undefined_column THEN null;
END $$;
