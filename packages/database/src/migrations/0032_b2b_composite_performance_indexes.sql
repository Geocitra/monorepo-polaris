-- Fase 4: Composite Performance Indexes untuk tabel transaksi B2B/B2G
-- Mempercepat query analitik & listing berbasis (organization_id, unit_id, created_at)

CREATE INDEX IF NOT EXISTS idx_lkpj_materials_org_unit_created
  ON lkpj_evaluation_materials (organization_id, unit_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_lkpj_findings_org_unit_created
  ON lkpj_findings (organization_id, origin_unit_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_legislation_drafts_org_unit_created
  ON legislation_drafts (organization_id, unit_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_perf_evidence_org_unit_created
  ON performance_evidence_registers (organization_id, unit_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_inst_shared_notes_org_unit_created
  ON institutional_shared_notes (organization_id, unit_id, created_at DESC);
