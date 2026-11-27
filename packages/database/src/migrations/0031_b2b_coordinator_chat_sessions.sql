-- Migrasi 0031: Persistensi Sesi & Pesan Chat Koordinator POLARIS B2B

CREATE TABLE IF NOT EXISTS institutional_chat_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  unit_id UUID NOT NULL REFERENCES organization_units(id) ON DELETE CASCADE,
  tenant_id UUID NOT NULL REFERENCES tenant_members(id) ON DELETE CASCADE,
  title VARCHAR(220) NOT NULL,
  last_message_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_inst_chat_sessions_lookup
  ON institutional_chat_sessions (organization_id, unit_id, tenant_id, last_message_at DESC);

CREATE TABLE IF NOT EXISTS institutional_chat_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id UUID NOT NULL REFERENCES institutional_chat_sessions(id) ON DELETE CASCADE,
  role VARCHAR(16) NOT NULL,
  content TEXT NOT NULL,
  detected_mode VARCHAR(32),
  routed_agents JSONB NOT NULL DEFAULT '[]'::jsonb,
  used_citations JSONB NOT NULL DEFAULT '[]'::jsonb,
  generated_image_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_inst_chat_messages_session
  ON institutional_chat_messages (session_id, created_at ASC);
