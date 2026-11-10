-- ==============================================================================
-- POLARIS DATAHUB & INTELLIGENT KNOWLEDGE REPOSITORY MIGRATION
-- ==============================================================================

CREATE EXTENSION IF NOT EXISTS vector;

-- 1. BERKAS UTAMA DATAHUB (DEDUPLIKASI KONTEN SHA-256)
CREATE TABLE IF NOT EXISTS datahub_files (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content_sha256 VARCHAR(64) NOT NULL UNIQUE,
  original_file_name VARCHAR(255) NOT NULL,
  mime_type VARCHAR(100) NOT NULL,
  file_size_bytes INTEGER NOT NULL,
  storage_path TEXT NOT NULL,
  extraction_status VARCHAR(30) NOT NULL DEFAULT 'COMPLETED',
  total_pages INTEGER DEFAULT 1,
  extracted_raw_text TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_datahub_files_sha256 ON datahub_files(content_sha256);

-- 2. REFERENSI DOKUMEN PER TENANT / TOKOH DEWAN
CREATE TABLE IF NOT EXISTS datahub_document_refs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  file_id UUID NOT NULL REFERENCES datahub_files(id) ON DELETE CASCADE,
  uploaded_by_tenant_id UUID NOT NULL REFERENCES tenant_members(id) ON DELETE CASCADE,
  custom_title VARCHAR(255),
  dapil_code VARCHAR(50),
  party_affiliation VARCHAR(100),
  branch_type VARCHAR(50),
  legislative_level legislative_level_enum,
  privacy_scope VARCHAR(50) NOT NULL DEFAULT 'PRIVATE_TENANT',
  category_tag VARCHAR(50) NOT NULL DEFAULT 'DOKUMEN_INTERNAL',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_datahub_refs_tenant ON datahub_document_refs(uploaded_by_tenant_id);
CREATE INDEX IF NOT EXISTS idx_datahub_refs_dapil ON datahub_document_refs(dapil_code);
CREATE INDEX IF NOT EXISTS idx_datahub_refs_party ON datahub_document_refs(party_affiliation);

-- 3. CHUNKS DOKUMEN & VEKTOR EMBEDDING (RAG DOKUMEN KEBIJAKAN)
CREATE TABLE IF NOT EXISTS datahub_document_chunks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  file_id UUID NOT NULL REFERENCES datahub_files(id) ON DELETE CASCADE,
  chunk_index INTEGER NOT NULL,
  section_title VARCHAR(255),
  chunk_content TEXT NOT NULL,
  contextual_header TEXT,
  token_count INTEGER NOT NULL,
  vector_embedding vector(1536) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_datahub_chunks_file ON datahub_document_chunks(file_id);

