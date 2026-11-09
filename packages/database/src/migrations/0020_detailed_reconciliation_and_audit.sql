-- Migration: 0020_detailed_reconciliation_and_audit.sql
-- Description: Menambahkan pelacakan operator, kegiatan (activity_type), correlation request ID, dan metadata ke ai_trace_logs dan tenant_quota_transactions untuk rekonsiliasi audit mendalam per user, per operator, per kegiatan, per request, dan chatbot.

DO $$
BEGIN
  -- 1. Tambah kolom ke ai_trace_logs
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'ai_trace_logs' AND column_name = 'operator_id'
  ) THEN
    ALTER TABLE ai_trace_logs ADD COLUMN operator_id UUID REFERENCES system_admins(id) ON DELETE SET NULL;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'ai_trace_logs' AND column_name = 'channel'
  ) THEN
    ALTER TABLE ai_trace_logs ADD COLUMN channel VARCHAR(30) NOT NULL DEFAULT 'WEB_STUDIO';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'ai_trace_logs' AND column_name = 'activity_type'
  ) THEN
    ALTER TABLE ai_trace_logs ADD COLUMN activity_type VARCHAR(60);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'ai_trace_logs' AND column_name = 'request_id'
  ) THEN
    ALTER TABLE ai_trace_logs ADD COLUMN request_id VARCHAR(100);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'ai_trace_logs' AND column_name = 'metadata'
  ) THEN
    ALTER TABLE ai_trace_logs ADD COLUMN metadata JSONB;
  END IF;

  -- 2. Tambah kolom ke tenant_quota_transactions
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'tenant_quota_transactions' AND column_name = 'operator_id'
  ) THEN
    ALTER TABLE tenant_quota_transactions ADD COLUMN operator_id UUID REFERENCES system_admins(id) ON DELETE SET NULL;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'tenant_quota_transactions' AND column_name = 'activity_type'
  ) THEN
    ALTER TABLE tenant_quota_transactions ADD COLUMN activity_type VARCHAR(60);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'tenant_quota_transactions' AND column_name = 'request_id'
  ) THEN
    ALTER TABLE tenant_quota_transactions ADD COLUMN request_id VARCHAR(100);
  END IF;
END $$;

-- 3. Indeks performa untuk query audit & rekonsiliasi
CREATE INDEX IF NOT EXISTS idx_ai_trace_operator ON ai_trace_logs (operator_id);
CREATE INDEX IF NOT EXISTS idx_ai_trace_channel_act ON ai_trace_logs (channel, activity_type);
CREATE INDEX IF NOT EXISTS idx_ai_trace_request_id ON ai_trace_logs (request_id);

CREATE INDEX IF NOT EXISTS idx_quota_tx_operator ON tenant_quota_transactions (operator_id);
CREATE INDEX IF NOT EXISTS idx_quota_tx_request ON tenant_quota_transactions (request_id);

