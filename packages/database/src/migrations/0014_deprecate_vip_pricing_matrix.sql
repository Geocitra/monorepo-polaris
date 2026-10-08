-- Migration 0014: Deprecate VIP plan tier from active subscription price matrices
-- Ensures exactly 54 active matrices (9 Legislative Levels x 2 Tiers [STARTER, PRO] x 3 Billing Cycles)

UPDATE subscription_price_matrices
SET is_active = false
WHERE plan_tier = 'VIP';
