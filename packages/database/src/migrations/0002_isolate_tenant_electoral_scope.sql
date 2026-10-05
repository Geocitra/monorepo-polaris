-- =========================================================================
-- MIGRATION: 0002_isolate_tenant_electoral_scope.sql
-- DESCRIPTION: Isolate personal working territory from shared master dapil
-- =========================================================================

-- 1. Tambah kolom wilayah personal dewan pada tenant_members
ALTER TABLE tenant_members 
  ADD COLUMN IF NOT EXISTS custom_dapil_name VARCHAR(100),
  ADD COLUMN IF NOT EXISTS personal_coverage TEXT[] DEFAULT ARRAY[]::TEXT[];

-- 2. Backfill data eksisting: jika anggota sudah terhubung ke dapil, wariskan nama dan cakupan
UPDATE tenant_members tm
SET 
  custom_dapil_name = ed.dapil_name,
  personal_coverage = ed.regency_coverage
FROM electoral_districts ed
WHERE tm.electoral_district_id = ed.id
  AND (tm.custom_dapil_name IS NULL OR tm.personal_coverage = ARRAY[]::TEXT[]);

COMMENT ON COLUMN tenant_members.custom_dapil_name IS 'Nama dapil atau wilayah kerja representasi personal dewan';
COMMENT ON COLUMN tenant_members.personal_coverage IS 'Daftar wilayah kabupaten/kota/kecamatan fokus kerja binaan personal';
