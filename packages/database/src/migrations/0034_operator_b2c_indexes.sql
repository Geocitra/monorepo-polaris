-- Fase 3 (Operator <-> B2C): Performance Indexes untuk penugasan & audit log operator

CREATE INDEX IF NOT EXISTS idx_op_assign_operator_status
  ON operator_tenant_assignments (operator_id, status);

CREATE INDEX IF NOT EXISTS idx_op_assign_tenant_status
  ON operator_tenant_assignments (tenant_id, status);

CREATE INDEX IF NOT EXISTS idx_op_audit_operator_created
  ON operator_audit_logs (operator_id, created_at DESC);
