-- =========================================================================
-- SUPERADMIN & MASTER DATA SCHEMA EXTENSION (POLARIS PLATFORM)
-- =========================================================================

-- 1. Enum Role Superadmin
DO $$ BEGIN
  CREATE TYPE superadmin_role_enum AS ENUM ('SUPERADMIN', 'SUPPORT_OPERATOR', 'FINANCE_ADMIN');
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- 2. Tabel System Admins (Internal Polaris Operators)
CREATE TABLE IF NOT EXISTS system_admins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  full_name VARCHAR(150) NOT NULL,
  role superadmin_role_enum NOT NULL DEFAULT 'SUPERADMIN',
  is_active BOOLEAN NOT NULL DEFAULT true,
  avatar_url TEXT,
  last_login_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. Tambahkan kolom status & verifikasi pada tenant_members jika belum ada
ALTER TABLE tenant_members ADD COLUMN IF NOT EXISTS is_verified BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE tenant_members ADD COLUMN IF NOT EXISTS account_status VARCHAR(30) NOT NULL DEFAULT 'ACTIVE';
ALTER TABLE tenant_members ADD COLUMN IF NOT EXISTS internal_notes TEXT;

-- 4. Tabel Master Partai Politik
CREATE TABLE IF NOT EXISTS master_political_parties (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code VARCHAR(30) NOT NULL UNIQUE,
  name VARCHAR(150) NOT NULL,
  ballot_number INTEGER,
  primary_color VARCHAR(20) NOT NULL,
  secondary_color VARCHAR(20),
  logo_url TEXT,
  description TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 5. Tabel Master Komisi & Alat Kelengkapan Dewan (AKD)
CREATE TABLE IF NOT EXISTS master_commissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  legislative_level legislative_level_enum NOT NULL DEFAULT 'DPR_RI',
  code VARCHAR(50) NOT NULL,
  name VARCHAR(150) NOT NULL,
  focus_areas TEXT[] DEFAULT ARRAY[]::TEXT[],
  partner_ministries TEXT[] DEFAULT ARRAY[]::TEXT[],
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 6. Seed Superadmin Awal (Password: polaris_admin_2026)
INSERT INTO system_admins (email, password_hash, full_name, role, is_active)
VALUES (
  'admin@polaris.id',
  crypt('polaris_admin_2026', gen_salt('bf')),
  'POLARIS Super Administrator',
  'SUPERADMIN',
  true
)
ON CONFLICT (email) DO UPDATE SET
  password_hash = crypt('polaris_admin_2026', gen_salt('bf')),
  full_name = 'POLARIS Super Administrator',
  is_active = true;

-- 7. Seed Master Partai Politik Utama Indonesia (Lengkap dengan Hex Color Resmi & Nomor Urut)
INSERT INTO master_political_parties (code, name, ballot_number, primary_color, secondary_color, description)
VALUES 
  ('PKB', 'Partai Kebangkitan Bangsa', 1, '#059669', '#10B981', 'Fraksi Partai Kebangkitan Bangsa'),
  ('GERINDRA', 'Partai Gerakan Indonesia Raya', 2, '#991B1B', '#B91C1C', 'Fraksi Partai Gerindra'),
  ('PDIP', 'Partai Demokrasi Indonesia Perjuangan', 3, '#DC2626', '#EF4444', 'Fraksi Partai Demokrasi Indonesia Perjuangan'),
  ('GOLKAR', 'Partai Golongan Karya', 4, '#EAB308', '#F59E0B', 'Fraksi Partai Golongan Karya'),
  ('NASDEM', 'Partai NasDem', 5, '#1E3A8A', '#F59E0B', 'Fraksi Partai NasDem'),
  ('PKS', 'Partai Keadilan Sejahtera', 8, '#EA580C', '#FB923C', 'Fraksi Partai Keadilan Sejahtera'),
  ('PAN', 'Partai Amanat Nasional', 12, '#2563EB', '#60A5FA', 'Fraksi Partai Amanat Nasional'),
  ('DEMOKRAT', 'Partai Demokrat', 14, '#1D4ED8', '#3B82F6', 'Fraksi Partai Demokrat'),
  ('PSI', 'Partai Solidaritas Indonesia', 15, '#E11D48', '#FB7185', 'Partai Solidaritas Indonesia'),
  ('PERINDO', 'Partai Persatuan Indonesia', 16, '#0284C7', '#38BDF8', 'Partai Persatuan Indonesia'),
  ('PPP', 'Partai Persatuan Pembangunan', 17, '#16A34A', '#22C55E', 'Fraksi Partai Persatuan Pembangunan')
ON CONFLICT (code) DO UPDATE SET
  name = EXCLUDED.name,
  ballot_number = EXCLUDED.ballot_number,
  primary_color = EXCLUDED.primary_color,
  secondary_color = EXCLUDED.secondary_color,
  description = EXCLUDED.description;

-- 8. Seed Master Komisi DPR RI (Contoh Representatif)
INSERT INTO master_commissions (legislative_level, code, name, focus_areas, partner_ministries)
VALUES
  ('DPR_RI', 'KOMISI_I', 'Komisi I (Pertahanan, Luar Negeri, Intelijen, Kominfo)', 
   ARRAY['Pertahanan Nasional', 'Diplomasi Internasional', 'Keamanan Siber & Intelijen', 'Penyiaran & Komunikasi'], 
   ARRAY['Kemenhan', 'Kemenlu', 'Kemenkominfo', 'BIN', 'TNI', 'BSSN']),
  ('DPR_RI', 'KOMISI_II', 'Komisi II (Pemerintahan Dalam Negeri, Otonomi Daerah, Pemilu)', 
   ARRAY['Otonomi Daerah', 'Birokrasi & ASN', 'Kepemiluan & Pilkada', 'Agraria & Tata Ruang'], 
   ARRAY['Kemendagri', 'KemenPAN-RB', 'KPU', 'Bawaslu', 'ATR/BPN']),
  ('DPR_RI', 'KOMISI_III', 'Komisi III (Hukum, HAM, dan Keamanan)', 
   ARRAY['Penegakan Hukum', 'Perundang-undangan', 'Hak Asasi Manusia', 'Pemberantasan Korupsi'], 
   ARRAY['Kemenkumham', 'Polri', 'Kejaksaan Agung', 'KPK', 'Mahkamah Agung', 'Mahkamah Konstitusi']),
  ('DPR_RI', 'KOMISI_IV', 'Komisi IV (Pertanian, Lingkungan Hidup, Kehutanan, Kelautan)', 
   ARRAY['Ketahanan Pangan', 'Kelautan & Perikanan', 'Konservasi Sumber Daya Alam', 'Kesejahteraan Petani'], 
   ARRAY['Kementan', 'KLHK', 'KKP', 'Bapanas', 'Perum BULOG']),
  ('DPR_RI', 'KOMISI_V', 'Komisi V (Infrastruktur dan Perhubungan)', 
   ARRAY['Jalan & Jembatan', 'Transportasi Darat/Laut/Udara', 'Perumahan Rakyat', 'Meteorologi & SAR'], 
   ARRAY['KemenPUPR', 'Kemenhub', 'BMKG', 'Basarnas']),
  ('DPR_RI', 'KOMISI_VI', 'Komisi VI (Perdagangan, Koperasi, UMKM, BUMN)', 
   ARRAY['Tata Niaga Pasar', 'BUMN & Investasi', 'Pemberdayaan Koperasi & UMKM', 'Persaingan Usaha'], 
   ARRAY['Kemendag', 'KemenkopUKM', 'KemenBUMN', 'KPPU']),
  ('DPR_RI', 'KOMISI_X', 'Komisi X (Pendidikan, Riset, Olahraga, Pariwisata)', 
   ARRAY['Kurikulum & Guru', 'Pariwisata & Budaya', 'Ekonomi Kreatif', 'Perpustakaan Nasional'], 
   ARRAY['Kemendikbudristek', 'Kemenparekraf', 'Kemenpora', 'Perpusnas']),
  ('DPR_RI', 'KOMISI_XI', 'Komisi XI (Keuangan, Perencanaan Pembangunan, Perbankan)', 
   ARRAY['APBN & Kebijakan Fiskal', 'Stabilitas Moneter', 'Sektor Jasa Keuangan', 'Lembaga Keuangan'], 
   ARRAY['Kemenkeu', 'Bappenas', 'Bank Indonesia', 'OJK', 'LPS', 'BPK'])
ON CONFLICT DO NOTHING;
