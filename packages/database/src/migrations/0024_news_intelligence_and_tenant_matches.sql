-- ==============================================================================
-- POLARIS NEWS INTELLIGENCE, PGVECTOR EMBEDDING & TENANT ISSUE MATCHES
-- ==============================================================================

CREATE EXTENSION IF NOT EXISTS vector;

ALTER TABLE media_discourses
  ADD COLUMN IF NOT EXISTS canonical_url TEXT,
  ADD COLUMN IF NOT EXISTS content_hash VARCHAR(64),
  ADD COLUMN IF NOT EXISTS full_text_excerpt TEXT,
  ADD COLUMN IF NOT EXISTS entities JSONB DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS vector_embedding vector(1536),
  ADD COLUMN IF NOT EXISTS discovery_channel VARCHAR(30) NOT NULL DEFAULT 'RSS';

CREATE TABLE IF NOT EXISTS tenant_news_matches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenant_members(id) ON DELETE CASCADE,
  discourse_id UUID NOT NULL REFERENCES media_discourses(id) ON DELETE CASCADE,
  relevance_score REAL NOT NULL,
  matched_interest VARCHAR(150),
  is_read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT unq_tenant_news_matches_pair UNIQUE (tenant_id, discourse_id)
);

CREATE INDEX IF NOT EXISTS idx_media_discourses_canonical_url
  ON media_discourses (canonical_url);

CREATE INDEX IF NOT EXISTS idx_media_discourses_content_hash
  ON media_discourses (content_hash);

CREATE INDEX IF NOT EXISTS idx_tenant_news_matches_score
  ON tenant_news_matches (tenant_id, relevance_score DESC);

CREATE INDEX IF NOT EXISTS idx_media_discourses_vector
  ON media_discourses USING hnsw (vector_embedding vector_cosine_ops);

