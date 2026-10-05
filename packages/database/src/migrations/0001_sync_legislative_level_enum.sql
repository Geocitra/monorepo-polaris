-- =========================================================================
-- MIGRATION: 0001_sync_legislative_level_enum.sql
-- DESCRIPTION: Non-destructive additive sync for legislative_level_enum
-- TARGET: PostgreSQL 16+
-- =========================================================================

-- Tambahkan nilai enum baru jika belum ada
ALTER TYPE legislative_level_enum ADD VALUE IF NOT EXISTS 'DPD_RI';
ALTER TYPE legislative_level_enum ADD VALUE IF NOT EXISTS 'MPR_RI';
ALTER TYPE legislative_level_enum ADD VALUE IF NOT EXISTS 'KEPALA_DAERAH_GUBERNUR';
ALTER TYPE legislative_level_enum ADD VALUE IF NOT EXISTS 'KEPALA_DAERAH_WALIKOTA_BUPATI';
ALTER TYPE legislative_level_enum ADD VALUE IF NOT EXISTS 'PEJABAT_BIROKRAT_DIRJEN_SEKJEN_OPD';
ALTER TYPE legislative_level_enum ADD VALUE IF NOT EXISTS 'PIMPINAN_LEMBAGA_REKTOR_SWASTA';

COMMENT ON TYPE legislative_level_enum IS 'Klasifikasi peran jabatan representasi publik dan legislatif nasional hingga daerah';
