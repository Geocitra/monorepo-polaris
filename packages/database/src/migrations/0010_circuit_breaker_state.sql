-- =========================================================================
-- MIGRATION: 0010_circuit_breaker_state.sql
-- DESCRIPTION: Circuit-Breaker State Machine & Alert Cooldown Tracking
-- =========================================================================

ALTER TABLE platform_token_pools
  ADD COLUMN IF NOT EXISTS circuit_state VARCHAR(20) DEFAULT 'CLOSED' NOT NULL,
  ADD COLUMN IF NOT EXISTS last_alert_sent_at TIMESTAMPTZ;

COMMENT ON COLUMN platform_token_pools.circuit_state IS 'Status Circuit Breaker: CLOSED (Normal), OPEN (Tripped/Depleted), HALF_OPEN (Testing)';
COMMENT ON COLUMN platform_token_pools.last_alert_sent_at IS 'Waktu terakhir notifikasi darurat saldo dikirim ke Superadmin (cooldown 4 jam)';
