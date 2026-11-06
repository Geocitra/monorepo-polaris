-- =========================================================================
-- MIGRATION: 0018_live_chat_and_operator_kpi.sql
-- DESCRIPTION: Skema Sesi Diskusi Langsung (Live Chat) Dua Arah & Telemetri KPI
-- STANDAR: Zero-Orphan, Strict Relational Foreign Keys & Idempotent
-- =========================================================================

-- 1. Inisialisasi ENUM Status Sesi & Rating CSAT
DO $$ BEGIN
  CREATE TYPE live_chat_session_status AS ENUM (
    'WAITING_OPERATOR',
    'ACTIVE',
    'AWAITING_FEEDBACK',
    'CLOSED'
  );
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE live_chat_csat_rating AS ENUM (
    'SATISFIED',
    'DISSATISFIED'
  );
EXCEPTION WHEN duplicate_object THEN null;
END $$;

-- 2. Buat Tabel Sesi Diskusi Langsung (live_chat_sessions)
CREATE TABLE IF NOT EXISTS live_chat_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_code VARCHAR(30) NOT NULL UNIQUE,
  tenant_id UUID NOT NULL REFERENCES tenant_members(id) ON DELETE CASCADE,
  assigned_operator_id UUID REFERENCES system_admins(id) ON DELETE SET NULL,
  status live_chat_session_status NOT NULL DEFAULT 'WAITING_OPERATOR',
  is_off_hours BOOLEAN NOT NULL DEFAULT false,
  client_initial_topic TEXT,
  started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  accepted_at TIMESTAMPTZ,
  first_operator_response_at TIMESTAMPTZ,
  ended_at TIMESTAMPTZ,
  last_message_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  first_response_seconds INTEGER,
  total_duration_seconds INTEGER,
  csat_rating live_chat_csat_rating,
  csat_feedback_text TEXT,
  converted_to_brief_id UUID REFERENCES content_briefs(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_live_chat_sessions_tenant
  ON live_chat_sessions (tenant_id, status);

CREATE INDEX IF NOT EXISTS idx_live_chat_sessions_operator
  ON live_chat_sessions (assigned_operator_id, status);

CREATE INDEX IF NOT EXISTS idx_live_chat_sessions_started
  ON live_chat_sessions (started_at DESC);

-- 3. Buat Tabel Pesan Obrolan Dua Arah (live_chat_messages)
CREATE TABLE IF NOT EXISTS live_chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES live_chat_sessions(id) ON DELETE CASCADE,
  tenant_id UUID NOT NULL REFERENCES tenant_members(id) ON DELETE CASCADE,
  sender_type VARCHAR(20) NOT NULL,
  sender_operator_id UUID REFERENCES system_admins(id) ON DELETE SET NULL,
  wa_message_id VARCHAR(128),
  message_type VARCHAR(20) NOT NULL DEFAULT 'TEXT',
  text_body TEXT,
  media_r2_url TEXT,
  media_cdn_url TEXT,
  media_mime_type VARCHAR(100),
  media_file_name VARCHAR(255),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_live_chat_messages_session
  ON live_chat_messages (session_id, created_at ASC);

CREATE INDEX IF NOT EXISTS idx_live_chat_messages_tenant
  ON live_chat_messages (tenant_id);

