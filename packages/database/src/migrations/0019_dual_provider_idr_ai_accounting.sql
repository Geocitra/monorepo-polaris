-- Migration 0019: Dual-Provider (OPENAI vs GEMINI) AI Accounting, Dynamic IDR Currency Conversion,
-- Omnichannel Quota Enforcement, and Full Referential Integrity

-- 1. Upgrade content_publications with Web Studio revision tracking & BullMQ stage checkpoints
ALTER TABLE content_publications
  ADD COLUMN IF NOT EXISTS revision_used INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS revision_limit INTEGER NOT NULL DEFAULT 3,
  ADD COLUMN IF NOT EXISTS quota_cost_deducted INTEGER NOT NULL DEFAULT 1,
  ADD COLUMN IF NOT EXISTS generation_checkpoints JSONB NOT NULL DEFAULT '{}'::jsonb;

-- 2. Upgrade tenant_quota_ledgers with separated OpenAI & Gemini token/image/IDR columns
ALTER TABLE tenant_quota_ledgers
  ADD COLUMN IF NOT EXISTS openai_input_tokens BIGINT NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS openai_output_tokens BIGINT NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS openai_total_tokens BIGINT NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS openai_image_calls INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS openai_cost_idr BIGINT NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS gemini_input_tokens BIGINT NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS gemini_output_tokens BIGINT NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS gemini_total_tokens BIGINT NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS gemini_image_calls INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS gemini_cost_idr BIGINT NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS total_cost_idr BIGINT NOT NULL DEFAULT 0;

-- Backfill total_cost_idr from estimated_cost_usd if not yet populated
UPDATE tenant_quota_ledgers
SET total_cost_idr = ROUND(estimated_cost_usd * 16350)::BIGINT
WHERE total_cost_idr = 0 AND estimated_cost_usd > 0;

-- 3. Upgrade tenant_quota_transactions with publication_id, ledger_id, channel, and weekly_quota_period
ALTER TABLE tenant_quota_transactions
  ADD COLUMN IF NOT EXISTS publication_id UUID REFERENCES content_publications(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS ledger_id UUID REFERENCES tenant_quota_ledgers(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS channel VARCHAR(30) NOT NULL DEFAULT 'WHATSAPP',
  ADD COLUMN IF NOT EXISTS weekly_quota_period VARCHAR(15);

CREATE INDEX IF NOT EXISTS idx_quota_tx_publication ON tenant_quota_transactions (publication_id);
CREATE INDEX IF NOT EXISTS idx_quota_tx_ledger ON tenant_quota_transactions (ledger_id);
CREATE INDEX IF NOT EXISTS idx_quota_tx_tenant_week ON tenant_quota_transactions (tenant_id, weekly_quota_period);

-- 4. Ensure ai_trace_logs exists and has provider, publication_id, ledger_id, image_calls, fx_rate_applied, cost_idr, visitor_ip_hash
CREATE TABLE IF NOT EXISTS ai_trace_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trace_id VARCHAR(100) NOT NULL,
  tenant_id UUID REFERENCES tenant_members(id) ON DELETE SET NULL,
  publication_id UUID REFERENCES content_publications(id) ON DELETE SET NULL,
  ledger_id UUID REFERENCES tenant_quota_ledgers(id) ON DELETE SET NULL,
  provider VARCHAR(20) NOT NULL DEFAULT 'OPENAI',
  operation VARCHAR(100) NOT NULL,
  model VARCHAR(50) NOT NULL,
  input_tokens INTEGER NOT NULL DEFAULT 0,
  output_tokens INTEGER NOT NULL DEFAULT 0,
  total_tokens INTEGER NOT NULL DEFAULT 0,
  image_calls INTEGER NOT NULL DEFAULT 0,
  latency_ms INTEGER NOT NULL DEFAULT 0,
  cost_usd NUMERIC(10, 5) NOT NULL DEFAULT 0,
  fx_rate_applied NUMERIC(10, 2) NOT NULL DEFAULT 16350.00,
  cost_idr BIGINT NOT NULL DEFAULT 0,
  visitor_ip_hash VARCHAR(64),
  status VARCHAR(30) NOT NULL DEFAULT 'SUCCESS',
  error_message TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE ai_trace_logs
  ADD COLUMN IF NOT EXISTS publication_id UUID REFERENCES content_publications(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS ledger_id UUID REFERENCES tenant_quota_ledgers(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS provider VARCHAR(20) NOT NULL DEFAULT 'OPENAI',
  ADD COLUMN IF NOT EXISTS image_calls INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS fx_rate_applied NUMERIC(10, 2) NOT NULL DEFAULT 16350.00,
  ADD COLUMN IF NOT EXISTS cost_idr BIGINT NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS visitor_ip_hash VARCHAR(64);

-- Backfill provider, image_calls, and cost_idr on existing ai_trace_logs rows
UPDATE ai_trace_logs
SET
  provider = CASE
    WHEN LOWER(model) LIKE '%gemini%' OR LOWER(model) LIKE '%imagen%' OR LOWER(model) LIKE '%flash-image%' THEN 'GEMINI'
    WHEN LOWER(model) LIKE '%guardrail%' OR LOWER(model) LIKE '%deterministic%' OR LOWER(model) = 'none' THEN 'SYSTEM'
    ELSE 'OPENAI'
  END,
  image_calls = CASE
    WHEN LOWER(model) LIKE '%dall-e%' OR LOWER(model) LIKE '%chatgpt-image%' OR LOWER(model) LIKE '%gpt-image%' OR LOWER(model) LIKE '%imagen%' OR LOWER(model) LIKE '%flash-image%' THEN 1
    ELSE 0
  END,
  cost_idr = CASE
    WHEN cost_idr = 0 AND cost_usd > 0 THEN GREATEST(1, ROUND(cost_usd * 16350)::BIGINT)
    ELSE cost_idr
  END;

CREATE INDEX IF NOT EXISTS idx_ai_trace_tenant_created ON ai_trace_logs (tenant_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ai_trace_provider_created ON ai_trace_logs (provider, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ai_trace_publication ON ai_trace_logs (publication_id);

-- 5. Upgrade platform_token_pools for Dual-Provider Vaults (OPENAI & GEMINI) in IDR
CREATE TABLE IF NOT EXISTS platform_token_pools (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider VARCHAR(20) NOT NULL DEFAULT 'OPENAI',
  total_budget_usd NUMERIC(10, 2) NOT NULL DEFAULT 50.00,
  total_budget_idr BIGINT NOT NULL DEFAULT 1000000,
  consumed_budget_idr BIGINT NOT NULL DEFAULT 0,
  total_tokens_allocated BIGINT NOT NULL DEFAULT 10000000,
  total_tokens_consumed BIGINT NOT NULL DEFAULT 0,
  total_images_generated INTEGER NOT NULL DEFAULT 0,
  alert_threshold_percent INTEGER NOT NULL DEFAULT 20,
  circuit_state VARCHAR(20) NOT NULL DEFAULT 'CLOSED',
  last_alert_sent_at TIMESTAMPTZ,
  last_topup_date TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE platform_token_pools
  ADD COLUMN IF NOT EXISTS provider VARCHAR(20) NOT NULL DEFAULT 'OPENAI',
  ADD COLUMN IF NOT EXISTS total_budget_idr BIGINT NOT NULL DEFAULT 1000000,
  ADD COLUMN IF NOT EXISTS consumed_budget_idr BIGINT NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS total_images_generated INTEGER NOT NULL DEFAULT 0;

-- Ensure unique constraint on provider
DO $$ BEGIN
  ALTER TABLE platform_token_pools ADD CONSTRAINT unq_platform_token_pools_provider UNIQUE (provider);
EXCEPTION WHEN duplicate_table OR duplicate_object THEN NULL;
END $$;

-- Seed both OPENAI and GEMINI vaults if not present
INSERT INTO platform_token_pools (provider, total_budget_usd, total_budget_idr, consumed_budget_idr, total_tokens_allocated, total_tokens_consumed, total_images_generated, alert_threshold_percent, circuit_state)
VALUES
  ('OPENAI', 61.16, 1000000, 0, 10000000, 0, 0, 20, 'CLOSED'),
  ('GEMINI', 61.16, 1000000, 0, 25000000, 0, 0, 20, 'CLOSED')
ON CONFLICT (provider) DO NOTHING;

-- 6. Upgrade platform_topup_histories with pool_id, provider, and fx_rate_applied
CREATE TABLE IF NOT EXISTS platform_topup_histories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pool_id UUID REFERENCES platform_token_pools(id) ON DELETE SET NULL,
  provider VARCHAR(20) NOT NULL DEFAULT 'OPENAI',
  amount_usd NUMERIC(10, 2) NOT NULL,
  amount_idr NUMERIC(12, 2) NOT NULL,
  fx_rate_applied NUMERIC(10, 2) NOT NULL DEFAULT 16350.00,
  tokens_added BIGINT NOT NULL,
  payment_reference VARCHAR(150) NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE platform_topup_histories
  ADD COLUMN IF NOT EXISTS pool_id UUID REFERENCES platform_token_pools(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS provider VARCHAR(20) NOT NULL DEFAULT 'OPENAI',
  ADD COLUMN IF NOT EXISTS fx_rate_applied NUMERIC(10, 2) NOT NULL DEFAULT 16350.00;

