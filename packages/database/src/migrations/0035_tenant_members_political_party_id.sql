-- Sinkronkan kolom political_party_id pada tenant_members agar selaras dengan skema Drizzle (identity.ts)
ALTER TABLE tenant_members
  ADD COLUMN IF NOT EXISTS political_party_id UUID REFERENCES master_political_parties(id) ON DELETE SET NULL;
