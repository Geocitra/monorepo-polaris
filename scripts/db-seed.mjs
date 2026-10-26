import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import postgres from '../packages/database/node_modules/postgres/src/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

// Load environment variables using Node's native loader
try {
  process.loadEnvFile(path.join(rootDir, '.env'));
} catch (e) {
  if (fs.existsSync(path.join(rootDir, '.env'))) {
    const envLines = fs.readFileSync(path.join(rootDir, '.env'), 'utf-8').split('\n');
    for (const line of envLines) {
      const match = line.match(/^\s*([A-Za-z_0-9]+)\s*=\s*["']?(.*?)["']?\s*$/);
      if (match && !process.env[match[1]]) {
        process.env[match[1]] = match[2];
      }
    }
  }
}

const rawUrl = process.env.DATABASE_URL || 'postgresql://postgres:admin123@localhost:5432/polaris?schema=public';
const cleanUrl = rawUrl.replace(/([?&])schema=[^&]+(&|$)/, '$1').replace(/[?&]$/, '');

console.log('====================================================');
console.log(' POLARIS PLATFORM DATABASE SEEDER ENGINE');
console.log('====================================================');
console.log(`Connecting to: ${cleanUrl.replace(/:[^:@]+@/, ':****@')}`);

const sql = postgres(cleanUrl, {
  max: 5,
  connect_timeout: 10,
  idle_timeout: 20,
});

async function runSeed() {
  try {
    console.log('\n[1/6] Seeding Super Administrator (admin@polaris.id)...');
    await sql.unsafe(`
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
        is_active = true,
        updated_at = now();
    `);
    console.log('  -> Superadmin seed ready: admin@polaris.id / polaris_admin_2026');

    console.log('\n[2/6] Seeding Master Partai Politik (11 Partai Utama)...');
    await sql.unsafe(`
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
        description = EXCLUDED.description,
        updated_at = now();
    `);
    const partyCount = await sql`SELECT count(*) FROM master_political_parties;`;
    console.log(`  -> ${partyCount[0].count} master political parties seeded.`);

    console.log('\n[3/6] Seeding Master Komisi DPR RI...');
    await sql.unsafe(`
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
    `);
    const commissionCount = await sql`SELECT count(*) FROM master_commissions;`;
    console.log(`  -> ${commissionCount[0].count} master commissions seeded.`);

    console.log('\n[4/6] Seeding Master Daerah Pemilihan (Electoral Districts)...');
    await sql.unsafe(`
      INSERT INTO electoral_districts (dapil_code, dapil_name, province_name, regency_coverage, total_voters)
      VALUES
        ('DAPIL-DKI-1', 'DKI JAKARTA I', 'DKI JAKARTA', ARRAY['Kota Jakarta Timur'], 2383972),
        ('DAPIL-DKI-2', 'DKI JAKARTA II', 'DKI JAKARTA', ARRAY['Kota Jakarta Pusat', 'Kota Jakarta Selatan', 'Luar Negeri'], 4346875),
        ('DAPIL-DKI-3', 'DKI JAKARTA III', 'DKI JAKARTA', ARRAY['Kota Jakarta Barat', 'Kota Jakarta Utara', 'Kabupaten Kepulauan Seribu'], 2448356),
        ('DAPIL-JABAR-1', 'JAWA BARAT I', 'JAWA BARAT', ARRAY['Kota Bandung', 'Kota Cimahi'], 2484674),
        ('DAPIL-JABAR-2', 'JAWA BARAT II', 'JAWA BARAT', ARRAY['Kabupaten Bandung', 'Kabupaten Bandung Barat'], 3658210),
        ('DAPIL-JATIM-1', 'JAWA TIMUR I', 'JAWA TIMUR', ARRAY['Kota Surabaya', 'Kabupaten Sidoarjo'], 3678540),
        ('DAPIL-JATENG-1', 'JAWA TENGAH I', 'JAWA TENGAH', ARRAY['Kota Semarang', 'Kabupaten Semarang', 'Kabupaten Kendal', 'Kota Salatiga'], 3209840)
      ON CONFLICT (dapil_code) DO UPDATE SET
        dapil_name = EXCLUDED.dapil_name,
        province_name = EXCLUDED.province_name,
        regency_coverage = EXCLUDED.regency_coverage,
        total_voters = EXCLUDED.total_voters;
    `);
    const dapilCount = await sql`SELECT count(*) FROM electoral_districts;`;
    console.log(`  -> ${dapilCount[0].count} electoral districts seeded.`);

    console.log('\n[5/6] Seeding Dynamic Subscription Pricing Matrices (54 Active Matrices)...');
    await sql.unsafe(`
      INSERT INTO subscription_price_matrices (legislative_level, plan_tier, billing_cycle, duration_days, amount_idr, is_active)
      VALUES
        -- 1. DPR RI
        ('DPR_RI', 'STARTER', 'MONTHLY', 30, 3500000.00, true),
        ('DPR_RI', 'STARTER', 'SEMESTER', 180, 18000000.00, true),
        ('DPR_RI', 'STARTER', 'ANNUAL', 365, 32000000.00, true),
        ('DPR_RI', 'PRO', 'MONTHLY', 30, 6000000.00, true),
        ('DPR_RI', 'PRO', 'SEMESTER', 180, 30000000.00, true),
        ('DPR_RI', 'PRO', 'ANNUAL', 365, 55000000.00, true),

        -- 2. DPD RI
        ('DPD_RI', 'STARTER', 'MONTHLY', 30, 3000000.00, true),
        ('DPD_RI', 'STARTER', 'SEMESTER', 180, 15000000.00, true),
        ('DPD_RI', 'STARTER', 'ANNUAL', 365, 28000000.00, true),
        ('DPD_RI', 'PRO', 'MONTHLY', 30, 5000000.00, true),
        ('DPD_RI', 'PRO', 'SEMESTER', 180, 25000000.00, true),
        ('DPD_RI', 'PRO', 'ANNUAL', 365, 45000000.00, true),

        -- 3. MPR RI
        ('MPR_RI', 'STARTER', 'MONTHLY', 30, 3500000.00, true),
        ('MPR_RI', 'STARTER', 'SEMESTER', 180, 18000000.00, true),
        ('MPR_RI', 'STARTER', 'ANNUAL', 365, 32000000.00, true),
        ('MPR_RI', 'PRO', 'MONTHLY', 30, 6000000.00, true),
        ('MPR_RI', 'PRO', 'SEMESTER', 180, 30000000.00, true),
        ('MPR_RI', 'PRO', 'ANNUAL', 365, 55000000.00, true),

        -- 4. KEPALA DAERAH GUBERNUR
        ('KEPALA_DAERAH_GUBERNUR', 'STARTER', 'MONTHLY', 30, 4000000.00, true),
        ('KEPALA_DAERAH_GUBERNUR', 'STARTER', 'SEMESTER', 180, 20000000.00, true),
        ('KEPALA_DAERAH_GUBERNUR', 'STARTER', 'ANNUAL', 365, 36000000.00, true),
        ('KEPALA_DAERAH_GUBERNUR', 'PRO', 'MONTHLY', 30, 7500000.00, true),
        ('KEPALA_DAERAH_GUBERNUR', 'PRO', 'SEMESTER', 180, 38000000.00, true),
        ('KEPALA_DAERAH_GUBERNUR', 'PRO', 'ANNUAL', 365, 70000000.00, true),

        -- 5. DPRD PROVINSI
        ('DPRD_PROVINSI', 'STARTER', 'MONTHLY', 30, 2000000.00, true),
        ('DPRD_PROVINSI', 'STARTER', 'SEMESTER', 180, 10000000.00, true),
        ('DPRD_PROVINSI', 'STARTER', 'ANNUAL', 365, 18000000.00, true),
        ('DPRD_PROVINSI', 'PRO', 'MONTHLY', 30, 3500000.00, true),
        ('DPRD_PROVINSI', 'PRO', 'SEMESTER', 180, 18000000.00, true),
        ('DPRD_PROVINSI', 'PRO', 'ANNUAL', 365, 32000000.00, true),

        -- 6. KEPALA DAERAH WALIKOTA / BUPATI
        ('KEPALA_DAERAH_WALIKOTA_BUPATI', 'STARTER', 'MONTHLY', 30, 2500000.00, true),
        ('KEPALA_DAERAH_WALIKOTA_BUPATI', 'STARTER', 'SEMESTER', 180, 12500000.00, true),
        ('KEPALA_DAERAH_WALIKOTA_BUPATI', 'STARTER', 'ANNUAL', 365, 22000000.00, true),
        ('KEPALA_DAERAH_WALIKOTA_BUPATI', 'PRO', 'MONTHLY', 30, 4500000.00, true),
        ('KEPALA_DAERAH_WALIKOTA_BUPATI', 'PRO', 'SEMESTER', 180, 22500000.00, true),
        ('KEPALA_DAERAH_WALIKOTA_BUPATI', 'PRO', 'ANNUAL', 365, 40000000.00, true),

        -- 7. DPRD KABUPATEN / KOTA
        ('DPRD_KABUPATEN_KOTA', 'STARTER', 'MONTHLY', 30, 1500000.00, true),
        ('DPRD_KABUPATEN_KOTA', 'STARTER', 'SEMESTER', 180, 7500000.00, true),
        ('DPRD_KABUPATEN_KOTA', 'STARTER', 'ANNUAL', 365, 14000000.00, true),
        ('DPRD_KABUPATEN_KOTA', 'PRO', 'MONTHLY', 30, 2500000.00, true),
        ('DPRD_KABUPATEN_KOTA', 'PRO', 'SEMESTER', 180, 12500000.00, true),
        ('DPRD_KABUPATEN_KOTA', 'PRO', 'ANNUAL', 365, 23000000.00, true),

        -- 8. PEJABAT BIROKRAT DIRJEN / SEKJEN / OPD
        ('PEJABAT_BIROKRAT_DIRJEN_SEKJEN_OPD', 'STARTER', 'MONTHLY', 30, 2000000.00, true),
        ('PEJABAT_BIROKRAT_DIRJEN_SEKJEN_OPD', 'STARTER', 'SEMESTER', 180, 10000000.00, true),
        ('PEJABAT_BIROKRAT_DIRJEN_SEKJEN_OPD', 'STARTER', 'ANNUAL', 365, 18000000.00, true),
        ('PEJABAT_BIROKRAT_DIRJEN_SEKJEN_OPD', 'PRO', 'MONTHLY', 30, 3500000.00, true),
        ('PEJABAT_BIROKRAT_DIRJEN_SEKJEN_OPD', 'PRO', 'SEMESTER', 180, 18000000.00, true),
        ('PEJABAT_BIROKRAT_DIRJEN_SEKJEN_OPD', 'PRO', 'ANNUAL', 365, 32000000.00, true),

        -- 9. PIMPINAN LEMBAGA / REKTOR / SWASTA
        ('PIMPINAN_LEMBAGA_REKTOR_SWASTA', 'STARTER', 'MONTHLY', 30, 2000000.00, true),
        ('PIMPINAN_LEMBAGA_REKTOR_SWASTA', 'STARTER', 'SEMESTER', 180, 10000000.00, true),
        ('PIMPINAN_LEMBAGA_REKTOR_SWASTA', 'STARTER', 'ANNUAL', 365, 18000000.00, true),
        ('PIMPINAN_LEMBAGA_REKTOR_SWASTA', 'PRO', 'MONTHLY', 30, 3500000.00, true),
        ('PIMPINAN_LEMBAGA_REKTOR_SWASTA', 'PRO', 'SEMESTER', 180, 18000000.00, true),
        ('PIMPINAN_LEMBAGA_REKTOR_SWASTA', 'PRO', 'ANNUAL', 365, 32000000.00, true)
      ON CONFLICT (legislative_level, plan_tier, billing_cycle)
      DO UPDATE SET
        duration_days = EXCLUDED.duration_days,
        amount_idr = EXCLUDED.amount_idr,
        is_active = EXCLUDED.is_active,
        updated_at = now();
    `);
    const matrixCount = await sql`SELECT count(*) FROM subscription_price_matrices WHERE is_active = true;`;
    console.log(`  -> ${matrixCount[0].count} subscription pricing matrices active.`);

    console.log('\n[6/6] Seeding Initial Platform Token Pool (Circuit-Breaker)...');
    await sql.unsafe(`
      INSERT INTO platform_token_pools (
        total_budget_usd,
        total_tokens_allocated,
        total_tokens_consumed,
        alert_threshold_percent,
        circuit_state
      )
      SELECT 50.00, 10000000, 0, 20, 'CLOSED'
      WHERE NOT EXISTS (SELECT 1 FROM platform_token_pools);
    `);
    const poolRes = await sql`SELECT circuit_state, total_tokens_allocated, total_budget_usd FROM platform_token_pools LIMIT 1;`;
    console.log(`  -> Token pool status: State=${poolRes[0].circuit_state}, Budget=$${poolRes[0].total_budget_usd}, Tokens=${poolRes[0].total_tokens_allocated}`);

    console.log('\n[7/7] Seeding Demo Dewan Members (admin@polaris.id & dewan@polaris.id)...');
    const [dapil] = await sql`SELECT id FROM electoral_districts LIMIT 1;`;
    const dapilId = dapil?.id;

    // 1. Seed Dewan Member: admin@polaris.id
    await sql.unsafe(`
      INSERT INTO tenant_members (
        email, password_hash, full_name, phone_number, party_affiliation,
        legislative_level, electoral_district_id, custom_dapil_name,
        is_verified, account_status, username
      ) VALUES (
        'admin@polaris.id',
        crypt('polaris_admin_2026', gen_salt('bf')),
        'POLARIS Administrator Dewan',
        '081234567890',
        'GOLKAR',
        'DPR_RI',
        ${dapilId ? `'${dapilId}'` : 'NULL'},
        'DKI JAKARTA I',
        true,
        'ACTIVE',
        'admin'
      )
      ON CONFLICT (email) DO UPDATE SET
        password_hash = crypt('polaris_admin_2026', gen_salt('bf')),
        is_verified = true,
        account_status = 'ACTIVE',
        updated_at = now();
    `);

    const [adminMember] = await sql.unsafe(`SELECT id FROM tenant_members WHERE email = 'admin@polaris.id' LIMIT 1;`);
    if (adminMember) {
      await sql.unsafe(`
        INSERT INTO portal_configs (tenant_id, subdomain_slug, is_active, meta_title)
        VALUES ('${adminMember.id}', 'admin', true, 'Portal Eksekutif Dewan POLARIS')
        ON CONFLICT (tenant_id) DO NOTHING;

        INSERT INTO subscriptions (tenant_id, plan_tier, status, current_period_start, current_period_end)
        VALUES ('${adminMember.id}', 'PRO', 'ACTIVE', now(), now() + interval '365 days')
        ON CONFLICT (tenant_id) DO NOTHING;

        INSERT INTO tenant_quota_ledgers (tenant_id, billing_cycle_month, article_limit, article_used, dalle_limit, dalle_used)
        VALUES ('${adminMember.id}', to_char(now(), 'YYYY-MM'), 0, 0, 0, 0)
        ON CONFLICT (tenant_id, billing_cycle_month) DO NOTHING;
      `);

      const [portal] = await sql.unsafe(`SELECT id FROM portal_configs WHERE tenant_id = '${adminMember.id}' LIMIT 1;`);
      if (portal) {
        await sql.unsafe(`
          INSERT INTO portal_theme_settings (portal_id, primary_hex_color, secondary_hex_color, font_family, layout_template_id)
          VALUES ('${portal.id}', '#1890ff', '#001529', 'Inter, sans-serif', 'standard-default')
          ON CONFLICT (portal_id) DO NOTHING;
        `);
      }
    }

    // 2. Seed Dewan Member: dewan@polaris.id
    await sql.unsafe(`
      INSERT INTO tenant_members (
        email, password_hash, full_name, phone_number, party_affiliation,
        legislative_level, electoral_district_id, custom_dapil_name,
        is_verified, account_status, username
      ) VALUES (
        'dewan@polaris.id',
        crypt('polaris_admin_2026', gen_salt('bf')),
        'Dr. H. Ahmad Fauzi, M.Si',
        '081298765432',
        'PDIP',
        'DPR_RI',
        ${dapilId ? `'${dapilId}'` : 'NULL'},
        'DKI JAKARTA I',
        true,
        'ACTIVE',
        'ahmadfauzi'
      )
      ON CONFLICT (email) DO UPDATE SET
        password_hash = crypt('polaris_admin_2026', gen_salt('bf')),
        is_verified = true,
        account_status = 'ACTIVE',
        updated_at = now();
    `);

    const [dewanMember] = await sql.unsafe(`SELECT id FROM tenant_members WHERE email = 'dewan@polaris.id' LIMIT 1;`);
    if (dewanMember) {
      await sql.unsafe(`
        INSERT INTO portal_configs (tenant_id, subdomain_slug, is_active, meta_title)
        VALUES ('${dewanMember.id}', 'ahmadfauzi', true, 'Portal Resmi Dr. H. Ahmad Fauzi, M.Si')
        ON CONFLICT (tenant_id) DO NOTHING;

        INSERT INTO subscriptions (tenant_id, plan_tier, status, current_period_start, current_period_end)
        VALUES ('${dewanMember.id}', 'PRO', 'ACTIVE', now(), now() + interval '365 days')
        ON CONFLICT (tenant_id) DO NOTHING;

        INSERT INTO tenant_quota_ledgers (tenant_id, billing_cycle_month, article_limit, article_used, dalle_limit, dalle_used)
        VALUES ('${dewanMember.id}', to_char(now(), 'YYYY-MM'), 0, 0, 0, 0)
        ON CONFLICT (tenant_id, billing_cycle_month) DO NOTHING;
      `);

      const [portalDewan] = await sql.unsafe(`SELECT id FROM portal_configs WHERE tenant_id = '${dewanMember.id}' LIMIT 1;`);
      if (portalDewan) {
        await sql.unsafe(`
          INSERT INTO portal_theme_settings (portal_id, primary_hex_color, secondary_hex_color, font_family, layout_template_id)
          VALUES ('${portalDewan.id}', '#dc2626', '#111827', 'Inter, sans-serif', 'editorial-prestige')
          ON CONFLICT (portal_id) DO NOTHING;
        `);
      }
    }

    console.log('  -> Demo dewan members seeded: admin@polaris.id & dewan@polaris.id (Password: polaris_admin_2026)');

    console.log('\n====================================================');
    console.log(' ALL SEEDERS COMPLETED SUCCESSFULLY!');
    console.log('====================================================\n');
  } catch (error) {
    console.error('\nSEEDING FAILED:', error);
    process.exit(1);
  } finally {
    await sql.end();
  }
}

runSeed();
