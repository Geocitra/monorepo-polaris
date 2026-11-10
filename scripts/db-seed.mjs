import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import postgres from '../packages/database/node_modules/postgres/src/index.js';
import { MASTER_COMMISSIONS_DATA, ELECTORAL_DISTRICTS_DATA } from './seed-dapil-commissions.mjs';

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

    console.log('\n[3/6] Seeding Master Komisi (DPR RI, DPRD Provinsi, DPRD Kab/Kota)...');
    for (const comm of MASTER_COMMISSIONS_DATA) {
      await sql.unsafe(`
        INSERT INTO master_commissions (legislative_level, code, name, focus_areas, partner_ministries)
        SELECT 
          $1::legislative_level, 
          $2, 
          $3, 
          $4::text[], 
          $5::text[]
        WHERE NOT EXISTS (
          SELECT 1 FROM master_commissions 
          WHERE legislative_level = $1::legislative_level AND code = $2
        );
      `, [comm.legislative_level, comm.code, comm.name, comm.focus_areas, comm.partner_ministries]);
    }
    const commissionCount = await sql`SELECT count(*) FROM master_commissions;`;
    console.log(`  -> ${commissionCount[0].count} master commissions & AKD seeded.`);

    console.log('\n[4/6] Seeding Master Daerah Pemilihan (Electoral Districts)...');
    for (const dapil of ELECTORAL_DISTRICTS_DATA) {
      await sql.unsafe(`
        INSERT INTO electoral_districts (dapil_code, dapil_name, province_name, regency_coverage, total_voters)
        VALUES ($1, $2, $3, $4::text[], $5)
        ON CONFLICT (dapil_code) DO UPDATE SET
          dapil_name = EXCLUDED.dapil_name,
          province_name = EXCLUDED.province_name,
          regency_coverage = EXCLUDED.regency_coverage,
          total_voters = EXCLUDED.total_voters;
      `, [dapil.dapil_code, dapil.dapil_name, dapil.province_name, dapil.regency_coverage, dapil.total_voters]);
    }
    const dapilCount = await sql`SELECT count(*) FROM electoral_districts;`;
    console.log(`  -> ${dapilCount[0].count} electoral districts seeded.`);

    console.log('\n[5/6] Seeding Dynamic Subscription Pricing Matrices (54 Active Matrices)...');
    await sql.unsafe(`
      INSERT INTO subscription_price_matrices (legislative_level, plan_tier, billing_cycle, duration_days, amount_idr, quota_requests, is_active)
      VALUES
        -- 1. DPR RI
        ('DPR_RI', 'STARTER', 'MONTHLY', 30, 3500000.00, 12, true),
        ('DPR_RI', 'STARTER', 'SEMESTER', 180, 18000000.00, 72, true),
        ('DPR_RI', 'STARTER', 'ANNUAL', 365, 32000000.00, 144, true),
        ('DPR_RI', 'PRO', 'MONTHLY', 30, 6000000.00, 12, true),
        ('DPR_RI', 'PRO', 'SEMESTER', 180, 30000000.00, 72, true),
        ('DPR_RI', 'PRO', 'ANNUAL', 365, 55000000.00, 144, true),

        -- 2. DPD RI
        ('DPD_RI', 'STARTER', 'MONTHLY', 30, 3000000.00, 12, true),
        ('DPD_RI', 'STARTER', 'SEMESTER', 180, 15000000.00, 72, true),
        ('DPD_RI', 'STARTER', 'ANNUAL', 365, 28000000.00, 144, true),
        ('DPD_RI', 'PRO', 'MONTHLY', 30, 5000000.00, 12, true),
        ('DPD_RI', 'PRO', 'SEMESTER', 180, 25000000.00, 72, true),
        ('DPD_RI', 'PRO', 'ANNUAL', 365, 45000000.00, 144, true),

        -- 3. MPR RI
        ('MPR_RI', 'STARTER', 'MONTHLY', 30, 3500000.00, 12, true),
        ('MPR_RI', 'STARTER', 'SEMESTER', 180, 18000000.00, 72, true),
        ('MPR_RI', 'STARTER', 'ANNUAL', 365, 32000000.00, 144, true),
        ('MPR_RI', 'PRO', 'MONTHLY', 30, 6000000.00, 12, true),
        ('MPR_RI', 'PRO', 'SEMESTER', 180, 30000000.00, 72, true),
        ('MPR_RI', 'PRO', 'ANNUAL', 365, 55000000.00, 144, true),

        -- 4. KEPALA DAERAH GUBERNUR
        ('KEPALA_DAERAH_GUBERNUR', 'STARTER', 'MONTHLY', 30, 4000000.00, 12, true),
        ('KEPALA_DAERAH_GUBERNUR', 'STARTER', 'SEMESTER', 180, 20000000.00, 72, true),
        ('KEPALA_DAERAH_GUBERNUR', 'STARTER', 'ANNUAL', 365, 36000000.00, 144, true),
        ('KEPALA_DAERAH_GUBERNUR', 'PRO', 'MONTHLY', 30, 7500000.00, 12, true),
        ('KEPALA_DAERAH_GUBERNUR', 'PRO', 'SEMESTER', 180, 38000000.00, 72, true),
        ('KEPALA_DAERAH_GUBERNUR', 'PRO', 'ANNUAL', 365, 70000000.00, 144, true),

        -- 5. DPRD PROVINSI
        ('DPRD_PROVINSI', 'STARTER', 'MONTHLY', 30, 2000000.00, 12, true),
        ('DPRD_PROVINSI', 'STARTER', 'SEMESTER', 180, 10000000.00, 72, true),
        ('DPRD_PROVINSI', 'STARTER', 'ANNUAL', 365, 18000000.00, 144, true),
        ('DPRD_PROVINSI', 'PRO', 'MONTHLY', 30, 3500000.00, 12, true),
        ('DPRD_PROVINSI', 'PRO', 'SEMESTER', 180, 18000000.00, 72, true),
        ('DPRD_PROVINSI', 'PRO', 'ANNUAL', 365, 32000000.00, 144, true),

        -- 6. KEPALA DAERAH WALIKOTA / BUPATI
        ('KEPALA_DAERAH_WALIKOTA_BUPATI', 'STARTER', 'MONTHLY', 30, 2500000.00, 12, true),
        ('KEPALA_DAERAH_WALIKOTA_BUPATI', 'STARTER', 'SEMESTER', 180, 12500000.00, 72, true),
        ('KEPALA_DAERAH_WALIKOTA_BUPATI', 'STARTER', 'ANNUAL', 365, 22000000.00, 144, true),
        ('KEPALA_DAERAH_WALIKOTA_BUPATI', 'PRO', 'MONTHLY', 30, 4500000.00, 12, true),
        ('KEPALA_DAERAH_WALIKOTA_BUPATI', 'PRO', 'SEMESTER', 180, 22500000.00, 72, true),
        ('KEPALA_DAERAH_WALIKOTA_BUPATI', 'PRO', 'ANNUAL', 365, 40000000.00, 144, true),

        -- 7. DPRD KABUPATEN / KOTA
        ('DPRD_KABUPATEN_KOTA', 'STARTER', 'MONTHLY', 30, 1500000.00, 12, true),
        ('DPRD_KABUPATEN_KOTA', 'STARTER', 'SEMESTER', 180, 7500000.00, 72, true),
        ('DPRD_KABUPATEN_KOTA', 'STARTER', 'ANNUAL', 365, 14000000.00, 144, true),
        ('DPRD_KABUPATEN_KOTA', 'PRO', 'MONTHLY', 30, 2500000.00, 12, true),
        ('DPRD_KABUPATEN_KOTA', 'PRO', 'SEMESTER', 180, 12500000.00, 72, true),
        ('DPRD_KABUPATEN_KOTA', 'PRO', 'ANNUAL', 365, 23000000.00, 144, true),

        -- 8. PEJABAT BIROKRAT DIRJEN / SEKJEN / OPD
        ('PEJABAT_BIROKRAT_DIRJEN_SEKJEN_OPD', 'STARTER', 'MONTHLY', 30, 2000000.00, 12, true),
        ('PEJABAT_BIROKRAT_DIRJEN_SEKJEN_OPD', 'STARTER', 'SEMESTER', 180, 10000000.00, 72, true),
        ('PEJABAT_BIROKRAT_DIRJEN_SEKJEN_OPD', 'STARTER', 'ANNUAL', 365, 18000000.00, 144, true),
        ('PEJABAT_BIROKRAT_DIRJEN_SEKJEN_OPD', 'PRO', 'MONTHLY', 30, 3500000.00, 12, true),
        ('PEJABAT_BIROKRAT_DIRJEN_SEKJEN_OPD', 'PRO', 'SEMESTER', 180, 18000000.00, 72, true),
        ('PEJABAT_BIROKRAT_DIRJEN_SEKJEN_OPD', 'PRO', 'ANNUAL', 365, 32000000.00, 144, true),

        -- 9. PIMPINAN LEMBAGA / REKTOR / SWASTA
        ('PIMPINAN_LEMBAGA_REKTOR_SWASTA', 'STARTER', 'MONTHLY', 30, 2000000.00, 12, true),
        ('PIMPINAN_LEMBAGA_REKTOR_SWASTA', 'STARTER', 'SEMESTER', 180, 10000000.00, 72, true),
        ('PIMPINAN_LEMBAGA_REKTOR_SWASTA', 'STARTER', 'ANNUAL', 365, 18000000.00, 144, true),
        ('PIMPINAN_LEMBAGA_REKTOR_SWASTA', 'PRO', 'MONTHLY', 30, 3500000.00, 12, true),
        ('PIMPINAN_LEMBAGA_REKTOR_SWASTA', 'PRO', 'SEMESTER', 180, 18000000.00, 72, true),
        ('PIMPINAN_LEMBAGA_REKTOR_SWASTA', 'PRO', 'ANNUAL', 365, 32000000.00, 144, true)
      ON CONFLICT (legislative_level, plan_tier, billing_cycle)
      DO UPDATE SET
        duration_days = EXCLUDED.duration_days,
        amount_idr = EXCLUDED.amount_idr,
        quota_requests = EXCLUDED.quota_requests,
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

        INSERT INTO tenant_quota_wallets (tenant_id, total_quota_allocated, remaining_quota, weekly_allowance_limit, current_period_end)
        VALUES ('${adminMember.id}', 144, 12, 3, now() + interval '365 days')
        ON CONFLICT (tenant_id) DO NOTHING;

        INSERT INTO tenant_quota_transactions (tenant_id, transaction_type, amount_delta, balance_after, notes)
        VALUES ('${adminMember.id}', 'PACKAGE_PURCHASE', 12, 12, 'Inisialisasi paket akun demo PRO Annual')
        ON CONFLICT DO NOTHING;
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

        INSERT INTO tenant_quota_wallets (tenant_id, total_quota_allocated, remaining_quota, weekly_allowance_limit, current_period_end)
        VALUES ('${dewanMember.id}', 144, 12, 3, now() + interval '365 days')
        ON CONFLICT (tenant_id) DO NOTHING;

        INSERT INTO tenant_quota_transactions (tenant_id, transaction_type, amount_delta, balance_after, notes)
        VALUES ('${dewanMember.id}', 'PACKAGE_PURCHASE', 12, 12, 'Inisialisasi paket akun demo PRO Annual')
        ON CONFLICT DO NOTHING;
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
