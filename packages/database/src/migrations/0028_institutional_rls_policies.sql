-- ==============================================================================
-- POLARIS HARDENING TAHAP 1: POSTGRESQL ROW-LEVEL SECURITY (RLS) POLICIES
-- Enforces kernel-level isolation for Institutional, Bidang, LKPJ, & Parliamentary tables
-- ==============================================================================

CREATE OR REPLACE FUNCTION polaris_is_superadmin()
RETURNS boolean
LANGUAGE plpgsql
STABLE
AS $$
BEGIN
  RETURN COALESCE(NULLIF(current_setting('app.is_superadmin', true), ''), 'false') = 'true';
END;
$$;

-- 1. INSTITUTIONAL SHARED NOTES (Isolasi Org + Bidang + Author Private Draft)
ALTER TABLE institutional_shared_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE institutional_shared_notes FORCE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS institutional_shared_notes_org_unit_access ON institutional_shared_notes;
CREATE POLICY institutional_shared_notes_org_unit_access ON institutional_shared_notes
  FOR ALL
  USING (
    organization_id = polaris_current_org_id()
    AND unit_id = polaris_current_unit_id()
    AND (
      visibility != 'PRIVATE_DRAFT'
      OR author_tenant_id = polaris_current_tenant_id()
    )
  )
  WITH CHECK (
    organization_id = polaris_current_org_id()
    AND unit_id = polaris_current_unit_id()
    AND author_tenant_id = polaris_current_tenant_id()
  );

-- 2. DATAHUB DOCUMENT REFS (Isolasi Ketat Personal vs ORG_SHARED vs UNIT_BIDANG)
ALTER TABLE datahub_document_refs ENABLE ROW LEVEL SECURITY;
ALTER TABLE datahub_document_refs FORCE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS datahub_document_refs_select_access ON datahub_document_refs;
CREATE POLICY datahub_document_refs_select_access ON datahub_document_refs
  FOR SELECT
  USING (
    polaris_is_superadmin()
    OR privacy_scope = 'PUBLIC_SYSTEM'
    OR (
      polaris_current_org_id() IS NULL
      AND organization_id IS NULL
      AND (
        uploaded_by_tenant_id = polaris_current_tenant_id()
        OR privacy_scope IN ('DAPIL_SHARED', 'PARTY_CONFIDENTIAL')
        OR EXISTS (
          SELECT 1 FROM operator_tenant_assignments ota
          WHERE ota.operator_id = polaris_current_tenant_id()
            AND ota.tenant_id = datahub_document_refs.uploaded_by_tenant_id
            AND ota.status = 'ACTIVE'
        )
      )
    )
    OR (
      polaris_current_org_id() IS NOT NULL
      AND organization_id = polaris_current_org_id()
      AND (
        polaris_current_unit_id() IS NULL
        OR (privacy_scope = 'UNIT_BIDANG' AND organization_unit_id = polaris_current_unit_id())
        OR (privacy_scope = 'ORG_SHARED' AND organization_unit_id IS NULL)
      )
    )
  );

DROP POLICY IF EXISTS datahub_document_refs_insert_access ON datahub_document_refs;
CREATE POLICY datahub_document_refs_insert_access ON datahub_document_refs
  FOR INSERT
  WITH CHECK (
    polaris_is_superadmin()
    OR (
      uploaded_by_tenant_id = polaris_current_tenant_id()
      AND (
        (polaris_current_org_id() IS NULL AND organization_id IS NULL)
        OR (
          polaris_current_org_id() IS NOT NULL
          AND organization_id = polaris_current_org_id()
          AND (
            (privacy_scope = 'ORG_SHARED' AND organization_unit_id IS NULL)
            OR (
              privacy_scope = 'UNIT_BIDANG'
              AND organization_unit_id = polaris_current_unit_id()
            )
          )
        )
      )
    )
  );

DROP POLICY IF EXISTS datahub_document_refs_modify_access ON datahub_document_refs;
CREATE POLICY datahub_document_refs_modify_access ON datahub_document_refs
  FOR UPDATE
  USING (
    polaris_is_superadmin()
    OR (polaris_current_org_id() IS NULL AND organization_id IS NULL AND uploaded_by_tenant_id = polaris_current_tenant_id())
    OR (
      polaris_current_org_id() IS NOT NULL
      AND organization_id = polaris_current_org_id()
      AND (polaris_current_unit_id() IS NULL OR organization_unit_id = polaris_current_unit_id())
    )
  )
  WITH CHECK (
    polaris_is_superadmin()
    OR (polaris_current_org_id() IS NULL AND organization_id IS NULL AND uploaded_by_tenant_id = polaris_current_tenant_id())
    OR (
      polaris_current_org_id() IS NOT NULL
      AND organization_id = polaris_current_org_id()
      AND (polaris_current_unit_id() IS NULL OR organization_unit_id = polaris_current_unit_id())
    )
  );

DROP POLICY IF EXISTS datahub_document_refs_delete_access ON datahub_document_refs;
CREATE POLICY datahub_document_refs_delete_access ON datahub_document_refs
  FOR DELETE
  USING (
    polaris_is_superadmin()
    OR (polaris_current_org_id() IS NULL AND organization_id IS NULL AND uploaded_by_tenant_id = polaris_current_tenant_id())
    OR (
      polaris_current_org_id() IS NOT NULL
      AND organization_id = polaris_current_org_id()
      AND (polaris_current_unit_id() IS NULL OR organization_unit_id = polaris_current_unit_id())
    )
  );

-- 3. FASE 2: LKPJ EVALUATION WORKSPACE & FINDINGS MATRIX (Isolasi per Organisasi DPRD)
ALTER TABLE lkpj_evaluation_workspaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE lkpj_evaluation_workspaces FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS lkpj_workspaces_org_access ON lkpj_evaluation_workspaces;
CREATE POLICY lkpj_workspaces_org_access ON lkpj_evaluation_workspaces
  FOR ALL
  USING (organization_id = polaris_current_org_id())
  WITH CHECK (organization_id = polaris_current_org_id());

ALTER TABLE lkpj_evaluation_materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE lkpj_evaluation_materials FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS lkpj_materials_org_access ON lkpj_evaluation_materials;
CREATE POLICY lkpj_materials_org_access ON lkpj_evaluation_materials
  FOR ALL
  USING (organization_id = polaris_current_org_id())
  WITH CHECK (organization_id = polaris_current_org_id());

ALTER TABLE lkpj_findings ENABLE ROW LEVEL SECURITY;
ALTER TABLE lkpj_findings FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS lkpj_findings_org_access ON lkpj_findings;
CREATE POLICY lkpj_findings_org_access ON lkpj_findings
  FOR ALL
  USING (organization_id = polaris_current_org_id())
  WITH CHECK (organization_id = polaris_current_org_id());

ALTER TABLE lkpj_faction_proposals ENABLE ROW LEVEL SECURITY;
ALTER TABLE lkpj_faction_proposals FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS lkpj_faction_proposals_org_access ON lkpj_faction_proposals;
CREATE POLICY lkpj_faction_proposals_org_access ON lkpj_faction_proposals
  FOR ALL
  USING (organization_id = polaris_current_org_id())
  WITH CHECK (organization_id = polaris_current_org_id());

-- 4. FASE 3: PARLIAMENTARY LEGISLATION, LEGAL VERSIONS & EVIDENCE REGISTER
ALTER TABLE legal_knowledge_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE legal_knowledge_versions FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS legal_knowledge_versions_select ON legal_knowledge_versions;
CREATE POLICY legal_knowledge_versions_select ON legal_knowledge_versions
  FOR SELECT
  USING (
    polaris_is_superadmin()
    OR organization_id IS NULL
    OR organization_id = polaris_current_org_id()
  );
DROP POLICY IF EXISTS legal_knowledge_versions_modify ON legal_knowledge_versions;
CREATE POLICY legal_knowledge_versions_modify ON legal_knowledge_versions
  FOR ALL
  USING (polaris_is_superadmin() OR organization_id = polaris_current_org_id())
  WITH CHECK (polaris_is_superadmin() OR organization_id = polaris_current_org_id());

ALTER TABLE legislation_drafts ENABLE ROW LEVEL SECURITY;
ALTER TABLE legislation_drafts FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS legislation_drafts_org_access ON legislation_drafts;
CREATE POLICY legislation_drafts_org_access ON legislation_drafts
  FOR ALL
  USING (organization_id = polaris_current_org_id())
  WITH CHECK (organization_id = polaris_current_org_id());

ALTER TABLE legislation_clauses ENABLE ROW LEVEL SECURITY;
ALTER TABLE legislation_clauses FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS legislation_clauses_org_access ON legislation_clauses;
CREATE POLICY legislation_clauses_org_access ON legislation_clauses
  FOR ALL
  USING (organization_id = polaris_current_org_id())
  WITH CHECK (organization_id = polaris_current_org_id());

ALTER TABLE legislation_dim_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE legislation_dim_entries FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS legislation_dim_entries_org_access ON legislation_dim_entries;
CREATE POLICY legislation_dim_entries_org_access ON legislation_dim_entries
  FOR ALL
  USING (organization_id = polaris_current_org_id())
  WITH CHECK (organization_id = polaris_current_org_id());

ALTER TABLE performance_evidence_registers ENABLE ROW LEVEL SECURITY;
ALTER TABLE performance_evidence_registers FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS performance_evidence_registers_org_access ON performance_evidence_registers;
CREATE POLICY performance_evidence_registers_org_access ON performance_evidence_registers
  FOR ALL
  USING (organization_id = polaris_current_org_id())
  WITH CHECK (organization_id = polaris_current_org_id());
