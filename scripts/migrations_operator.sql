-- Migration: Polaris Operator Roles & Assignments

DO $$ BEGIN
  ALTER TYPE superadmin_role_enum ADD VALUE IF NOT EXISTS 'CONTENT_OPERATOR';
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE operator_assignment_status_enum AS ENUM ('ACTIVE', 'PAUSED', 'REVOKED');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE content_creation_context_enum AS ENUM ('MEMBER', 'OPERATOR', 'SYSTEM_AI');
EXCEPTION WHEN duplicate_object THEN null; END $$;

CREATE TABLE IF NOT EXISTS operator_tenant_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  operator_id UUID NOT NULL REFERENCES system_admins(id) ON DELETE CASCADE,
  tenant_id UUID NOT NULL REFERENCES tenant_members(id) ON DELETE CASCADE,
  can_direct_publish BOOLEAN NOT NULL DEFAULT false,
  status operator_assignment_status_enum NOT NULL DEFAULT 'ACTIVE',
  notes TEXT,
  assigned_by_admin_id UUID REFERENCES system_admins(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT unq_operator_tenant UNIQUE (operator_id, tenant_id)
);

CREATE TABLE IF NOT EXISTS operator_audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  operator_id UUID NOT NULL REFERENCES system_admins(id) ON DELETE CASCADE,
  tenant_id UUID REFERENCES tenant_members(id) ON DELETE SET NULL,
  action VARCHAR(100) NOT NULL,
  target_entity VARCHAR(50) NOT NULL,
  target_entity_id UUID,
  details JSONB,
  ip_address VARCHAR(50),
  user_agent TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Tambahkan kolom audit operator ke content_publications jika belum ada
DO $$ BEGIN
  ALTER TABLE content_publications ADD COLUMN IF NOT EXISTS created_by_operator_id UUID REFERENCES system_admins(id) ON DELETE SET NULL;
  ALTER TABLE content_publications ADD COLUMN IF NOT EXISTS created_context content_creation_context_enum NOT NULL DEFAULT 'MEMBER';
EXCEPTION WHEN others THEN null; END $$;
