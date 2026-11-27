import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import postgres from '../node_modules/.pnpm/postgres@3.4.9/node_modules/postgres/src/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

try {
  process.loadEnvFile(path.join(rootDir, '.env'));
} catch {
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

function getCurrentWibWeeklyPeriod(referenceDate = new Date()) {
  const wibOffsetMs = 7 * 60 * 60 * 1000;
  const wibDate = new Date(referenceDate.getTime() + wibOffsetMs);
  const target = new Date(Date.UTC(wibDate.getUTCFullYear(), wibDate.getUTCMonth(), wibDate.getUTCDate()));
  const dayNr = (target.getUTCDay() + 6) % 7;
  target.setUTCDate(target.getUTCDate() - dayNr + 3);
  const firstThursday = target.valueOf();
  target.setUTCMonth(0, 1);
  if (target.getUTCDay() !== 4) {
    target.setUTCMonth(0, 1 + ((4 - target.getUTCDay() + 7) % 7));
  }
  const weekNo = 1 + Math.ceil((firstThursday - target.valueOf()) / 604800000);
  return `${target.getUTCFullYear()}-W${String(weekNo).padStart(2, '0')}`;
}

const sql = postgres(cleanUrl, { max: 5, connect_timeout: 10, idle_timeout: 20 });

async function runB2bSeed() {
  const currentMonth = new Date().toISOString().slice(0, 7);
  const currentWeek = getCurrentWibWeeklyPeriod();
  const defaultPassword = 'password123';

  console.log('====================================================');
  console.log(' POLARIS B2B INSTITUTIONAL TESTING SEEDER');
  console.log('====================================================');

  try {
    // 1. Seed 2 Instansi B2B
    const [orgKbb] = await sql`
      INSERT INTO organizations (code, name, legislative_level, region_name, province_name, status)
      VALUES (
        'DPRD-KAB-BANDUNG-BARAT',
        'DPRD Kabupaten Bandung Barat',
        'DPRD_KABUPATEN_KOTA',
        'Kabupaten Bandung Barat',
        'Jawa Barat',
        'ACTIVE'
      )
      ON CONFLICT (code) DO UPDATE SET
        name = EXCLUDED.name,
        status = 'ACTIVE',
        updated_at = now()
      RETURNING id, code, name;
    `;

    const [orgJabar] = await sql`
      INSERT INTO organizations (code, name, legislative_level, region_name, province_name, status)
      VALUES (
        'DPRD-PROV-JABAR',
        'DPRD Provinsi Jawa Barat',
        'DPRD_PROVINSI',
        'Jawa Barat',
        'Jawa Barat',
        'ACTIVE'
      )
      ON CONFLICT (code) DO UPDATE SET
        name = EXCLUDED.name,
        status = 'ACTIVE',
        updated_at = now()
      RETURNING id, code, name;
    `;
    console.log(`[1/6] Instansi seeded: ${orgKbb.name}, ${orgJabar.name}`);

    // 2. Seed Kontrak B2G Aktif
    await sql`
      INSERT INTO organization_contracts (
        organization_id, contract_number, fiscal_year, status,
        start_date, end_date, max_seats, max_storage_bytes,
        annual_token_pool_limit, weekly_generate_limit_per_member, revision_limit_per_item,
        contract_value_idr, notes
      )
      VALUES
        (
          ${orgKbb.id}, 'SPK/POLARIS/DPRD-KBB/2026/001', 2026, 'ACTIVE',
          '2026-01-01T00:00:00Z', '2026-12-31T23:59:59Z', 50, 10737418240,
          0, 3, 3, 250000000.00, 'Kontrak B2G Testing DPRD Kabupaten Bandung Barat'
        ),
        (
          ${orgJabar.id}, 'SPK/POLARIS/DPRD-JABAR/2026/001', 2026, 'ACTIVE',
          '2026-01-01T00:00:00Z', '2026-12-31T23:59:59Z', 100, 26843545600,
          0, 3, 3, 600000000.00, 'Kontrak B2G Testing DPRD Provinsi Jawa Barat'
        )
      ON CONFLICT (contract_number) DO UPDATE SET
        status = 'ACTIVE',
        weekly_generate_limit_per_member = 3,
        revision_limit_per_item = 3,
        updated_at = now();
    `;
    console.log('[2/6] Kontrak B2G Aktif (3x generate/minggu, 3x revisi/item) seeded.');

    // 3. Seed Unit & Bidang di DPRD KBB
    const upsertUnit = async (orgId, parentUnitId, unitType, code, name, focusSectors, partnerOpds, isAdHoc = false) => {
      const [row] = await sql`
        INSERT INTO organization_units (
          organization_id, parent_unit_id, unit_type, code, name,
          focus_sectors, partner_opds, is_ad_hoc, fiscal_year, is_active
        )
        VALUES (
          ${orgId}, ${parentUnitId}, ${unitType}, ${code}, ${name},
          ${focusSectors}, ${partnerOpds}, ${isAdHoc}, 2026, true
        )
        ON CONFLICT (organization_id, code) DO UPDATE SET
          name = EXCLUDED.name,
          parent_unit_id = EXCLUDED.parent_unit_id,
          is_active = true,
          updated_at = now()
        RETURNING id, code, name;
      `;
      return row;
    };

    const uSekretariat = await upsertUnit(orgKbb.id, null, 'SEKRETARIAT', 'SEKRETARIAT', 'Sekretariat DPRD KBB', ['Tata Kelola', 'Administrasi'], ['Setwan']);
    const uBanggar = await upsertUnit(orgKbb.id, null, 'BANGGAR', 'BANGGAR', 'Badan Anggaran DPRD KBB', ['APBD', 'PAD'], ['BPKAD', 'Bappelitbangda']);
    const uBapemperda = await upsertUnit(orgKbb.id, null, 'BAPEMPERDA', 'BAPEMPERDA', 'Bapemperda DPRD KBB', ['Propemperda', 'Raperda'], ['Bagian Hukum Setda']);
    const uKomisiA = await upsertUnit(orgKbb.id, null, 'KOMISI', 'KOMISI-A', 'Komisi I - Pemerintahan & Hukum', ['Pemerintahan', 'Hukum'], ['Inspektorat', 'Disdukcapil']);
    const uBidangHukum = await upsertUnit(orgKbb.id, uKomisiA.id, 'BIDANG', 'BIDANG-HUKUM-PEM', 'Bidang Hukum & Tata Pemerintahan', ['Perda', 'Kepatuhan'], ['Bagian Hukum']);
    const uKomisiC = await upsertUnit(orgKbb.id, null, 'KOMISI', 'KOMISI-C', 'Komisi III - Pembangunan & Infrastruktur', ['Infrastruktur', 'Lingkungan'], ['Dinas PUPR', 'DLH']);
    const uBidangInfra = await upsertUnit(orgKbb.id, uKomisiC.id, 'BIDANG', 'BIDANG-INFRA', 'Bidang Infrastruktur & Pekerjaan Umum', ['Jalan', 'Irigasi'], ['Dinas PUPR']);
    const uPanjaLkpj = await upsertUnit(orgKbb.id, uBanggar.id, 'PANJA', 'PANJA-LKPJ-2026', 'Panja Pembahasan LKPJ 2026', ['Evaluasi LKPJ'], ['Seluruh OPD'], true);
    const uSekretariatJabar = await upsertUnit(orgJabar.id, null, 'SEKRETARIAT', 'SEKRETARIAT', 'Sekretariat DPRD Jabar', ['Tata Kelola'], ['Setwan Jabar']);
    console.log('[3/6] Struktur AKD & Bidang (9 unit) seeded.');

    // 4. Seed 8 Akun User Testing
    const usersSpec = [
      { email: 'sekwan.kbb@polaris.id', username: 'sekwan-kbb', fullName: 'Drs. H. Ahmad Fauzi (Sekwan KBB)', level: 'DPRD_KABUPATEN_KOTA', region: 'Kabupaten Bandung Barat', orgId: orgKbb.id, orgRole: 'ORG_ADMIN', pos: 'Sekretaris DPRD / Admin Instansi', units: [] },
      { email: 'pimpinan.kbb@polaris.id', username: 'pimpinan-kbb', fullName: 'H. Dedi Suryana (Ketua DPRD KBB)', level: 'DPRD_KABUPATEN_KOTA', region: 'Kabupaten Bandung Barat', orgId: orgKbb.id, orgRole: 'LEADERSHIP', pos: 'Ketua DPRD', units: [[uBanggar.id, 'UNIT_LEAD']] },
      { email: 'ketua.komisi1.kbb@polaris.id', username: 'ketua-komisi1-kbb', fullName: 'Ir. Rina Kartika (Ketua Komisi I)', level: 'DPRD_KABUPATEN_KOTA', region: 'Kabupaten Bandung Barat', orgId: orgKbb.id, orgRole: 'MEMBER', pos: 'Ketua Komisi I', units: [[uKomisiA.id, 'UNIT_LEAD'], [uBidangHukum.id, 'UNIT_LEAD']] },
      { email: 'reviewer.banggar.kbb@polaris.id', username: 'reviewer-banggar-kbb', fullName: 'Dr. Hendra Wijaya (Reviewer Banggar)', level: 'DPRD_KABUPATEN_KOTA', region: 'Kabupaten Bandung Barat', orgId: orgKbb.id, orgRole: 'MEMBER', pos: 'Anggota Banggar & Panja LKPJ', units: [[uBanggar.id, 'REVIEWER'], [uPanjaLkpj.id, 'REVIEWER']] },
      { email: 'anggota.infra.kbb@polaris.id', username: 'anggota-infra-kbb', fullName: 'Budi Pratama (Anggota Komisi III)', level: 'DPRD_KABUPATEN_KOTA', region: 'Kabupaten Bandung Barat', orgId: orgKbb.id, orgRole: 'MEMBER', pos: 'Anggota Komisi III', units: [[uKomisiC.id, 'MEMBER'], [uBidangInfra.id, 'MEMBER']] },
      { email: 'ta.hukum.kbb@polaris.id', username: 'ta-hukum-kbb', fullName: 'Siti Nurhaliza, S.H., M.H. (Tenaga Ahli)', level: 'DPRD_KABUPATEN_KOTA', region: 'Kabupaten Bandung Barat', orgId: orgKbb.id, orgRole: 'EXPERT_STAFF', pos: 'Tenaga Ahli Hukum & Legislasi', units: [[uKomisiA.id, 'EXPERT_STAFF'], [uBapemperda.id, 'EXPERT_STAFF'], [uBidangHukum.id, 'EXPERT_STAFF']] },
      { email: 'staf.sekretariat.kbb@polaris.id', username: 'staf-sekretariat-kbb', fullName: 'Agus Setiawan (Staf Sekretariat)', level: 'DPRD_KABUPATEN_KOTA', region: 'Kabupaten Bandung Barat', orgId: orgKbb.id, orgRole: 'SECRETARIAT_STAFF', pos: 'Staf Risalah & Dokumentasi', units: [[uSekretariat.id, 'MEMBER']] },
      { email: 'sekwan.jabar@polaris.id', username: 'sekwan-jabar', fullName: 'Dr. Wahyu Nugroho (Sekwan Jabar)', level: 'DPRD_PROVINSI', region: 'Jawa Barat', orgId: orgJabar.id, orgRole: 'ORG_ADMIN', pos: 'Admin Instansi DPRD Jabar', units: [[uSekretariatJabar.id, 'UNIT_LEAD']] },
    ];

    const userIds = {};
    for (const u of usersSpec) {
      const [member] = await sql`
        INSERT INTO tenant_members (
          email, username, password_hash, full_name, phone_number,
          party_affiliation, legislative_level, custom_dapil_name,
          is_verified, account_status, must_change_password
        )
        VALUES (
          ${u.email}, ${u.username}, crypt(${defaultPassword}, gen_salt('bf')),
          ${u.fullName}, '081234567890', 'Sekretariat / Instansi', ${u.level}, ${u.region},
          true, 'ACTIVE', false
        )
        ON CONFLICT (email) DO UPDATE SET
          password_hash = crypt(${defaultPassword}, gen_salt('bf')),
          is_verified = true,
          account_status = 'ACTIVE',
          must_change_password = false,
          updated_at = now()
        RETURNING id, email;
      `;
      userIds[u.email] = member.id;

      await sql`
        INSERT INTO subscriptions (tenant_id, status, plan_tier, current_period_start, current_period_end)
        SELECT ${member.id}, 'ACTIVE', 'PRO', '2026-01-01T00:00:00Z', '2026-12-31T23:59:59Z'
        WHERE NOT EXISTS (SELECT 1 FROM subscriptions WHERE tenant_id = ${member.id});
      `;

      await sql`
        INSERT INTO organization_memberships (organization_id, tenant_id, org_role, status, title_or_position)
        VALUES (${u.orgId}, ${member.id}, ${u.orgRole}, 'ACTIVE', ${u.pos})
        ON CONFLICT (organization_id, tenant_id) DO UPDATE SET
          org_role = EXCLUDED.org_role,
          status = 'ACTIVE',
          title_or_position = EXCLUDED.title_or_position,
          updated_at = now();
      `;

      for (const [unitId, unitRole] of u.units) {
        await sql`
          INSERT INTO organization_unit_memberships (organization_id, unit_id, tenant_id, unit_role, status)
          VALUES (${u.orgId}, ${unitId}, ${member.id}, ${unitRole}, 'ACTIVE')
          ON CONFLICT (unit_id, tenant_id) DO UPDATE SET
            unit_role = EXCLUDED.unit_role,
            status = 'ACTIVE',
            updated_at = now();
        `;
      }
    }
    console.log(`[4/6] ${usersSpec.length} akun B2B testing seeded (password: ${defaultPassword}).`);

    // 5. Seed Shared Notes, LKPJ Workspace & Findings, Legislation Draft (dengan konteks RLS)
    await sql.begin(async (tx) => {
      await tx`SELECT set_config('app.is_superadmin', 'true', true)`;
      await tx`SELECT set_config('app.current_org_id', ${orgKbb.id}, true)`;

      const noteInfraTitle = 'Evaluasi Serapan Proyek Jalan Lingkar Padalarang';
      const [existingNote] = await tx`
        SELECT id FROM institutional_shared_notes WHERE organization_id = ${orgKbb.id} AND title = ${noteInfraTitle} LIMIT 1;
      `;
      if (!existingNote) {
        await tx`SELECT set_config('app.current_unit_id', ${uBidangInfra.id}, true)`;
        await tx`SELECT set_config('app.current_tenant_id', ${userIds['anggota.infra.kbb@polaris.id']}, true)`;
        await tx`
          INSERT INTO institutional_shared_notes (
            organization_id, unit_id, author_tenant_id, title, content_markdown,
            visibility, revision_used, revision_limit, last_revision_prompt
          )
          VALUES (
            ${orgKbb.id}, ${uBidangInfra.id}, ${userIds['anggota.infra.kbb@polaris.id']},
            ${noteInfraTitle},
            ${'### Ringkasan Telaah Bidang Infrastruktur\n1. Realisasi fisik proyek jalan lingkar baru mencapai **68%** hingga triwulan III.\n2. Diperlukan klarifikasi teknis dari Dinas PUPR terkait keterlambatan lelang paket pemeliharaan.\n3. Rekomendasi sementara: percepat evaluasi kontraktual sebelum akhir tahun anggaran.'},
            'UNIT_SHARED', 1, 3, 'Pertajam poin klarifikasi untuk Dinas PUPR'
          );
        `;

        await tx`SELECT set_config('app.current_unit_id', ${uBidangHukum.id}, true)`;
        await tx`SELECT set_config('app.current_tenant_id', ${userIds['ta.hukum.kbb@polaris.id']}, true)`;
        await tx`
          INSERT INTO institutional_shared_notes (
            organization_id, unit_id, author_tenant_id, title, content_markdown,
            visibility, revision_used, revision_limit, last_revision_prompt
          )
          VALUES (
            ${orgKbb.id}, ${uBidangHukum.id}, ${userIds['ta.hukum.kbb@polaris.id']},
            'Kajian Sinkronisasi Perda Ketertiban Umum',
            ${'### Catatan Tenaga Ahli Hukum\n- Pasal 14 perlu diselaraskan dengan PP Nomor 16 Tahun 2018 tentang Satpol PP.\n- Sanksi administratif diprioritaskan sebelum ketentuan pidana.'},
            'PARENT_UNIT_ENDORSED', 0, 3, NULL
          );
        `;
      }

      let [wsLkpj] = await tx`
        SELECT id FROM lkpj_evaluation_workspaces WHERE organization_id = ${orgKbb.id} AND fiscal_year = 2025 LIMIT 1;
      `;
      if (!wsLkpj) {
        await tx`SELECT set_config('app.current_unit_id', ${uPanjaLkpj.id}, true)`;
        await tx`SELECT set_config('app.current_tenant_id', ${userIds['sekwan.kbb@polaris.id']}, true)`;
        [wsLkpj] = await tx`
          INSERT INTO lkpj_evaluation_workspaces (
            organization_id, fiscal_year, title, status, assigned_discussion_unit_id,
            lkpj_submitted_at, discussion_deadline_at, created_by_tenant_id
          )
          VALUES (
            ${orgKbb.id}, 2025, 'Evaluasi LKPJ Bupati Bandung Barat TA 2025', 'IN_DISCUSSION', ${uPanjaLkpj.id},
            now() - interval '7 days', now() + interval '23 days', ${userIds['sekwan.kbb@polaris.id']}
          )
          RETURNING id;
        `;

        await tx`
          INSERT INTO lkpj_findings (
            workspace_id, organization_id, origin_unit_id, fiscal_year, government_affair, opd_name,
            program_or_activity, indicator_or_issue, indicator_unit, target_value, realization_value,
            achievement_gap, achievement_percentage, budget_ceiling_idr, budget_realization_idr,
            budget_absorption_percentage, source_evidence_ref, evidence_status, review_status,
            proposed_recommendation, legal_basis_ref, responsible_opd, created_by_tenant_id
          )
          VALUES
            (
              ${wsLkpj.id}, ${orgKbb.id}, ${uBidangInfra.id}, 2025, 'Pekerjaan Umum & Penataan Ruang', 'Dinas PUPR',
              'Peningkatan Jalan Kabupaten', 'Persentase jalan kabupaten kondisi mantap', '%',
              85.0000, 72.5000, -12.5000, 85.29, 45000000000, 34200000000, 76.00,
              'Buku LKPJ Bab IV Hal. 112', 'SUFFICIENT_VERIFIED', 'APPROVED_FOR_DISCUSSION',
              'Mendorong percepatan lelang dini pada triwulan I serta audit kontrak pemeliharaan jalan strategis.',
              'PP Nomor 13 Tahun 2019 Pasal 19', 'Dinas PUPR', ${userIds['anggota.infra.kbb@polaris.id']}
            ),
            (
              ${wsLkpj.id}, ${orgKbb.id}, ${uPanjaLkpj.id}, 2025, 'Kesehatan', 'Dinas Kesehatan',
              'Penurunan Angka Stunting', 'Prevalensi balita stunting kabupaten', '%',
              14.0000, 16.8000, 2.8000, 83.33, 18500000000, 16200000000, 87.57,
              'Buku LKPJ Bab IV Hal. 68', 'INSUFFICIENT_OPEN', 'DRAFT',
              NULL, 'Perpres 72 Tahun 2021', 'Dinas Kesehatan', ${userIds['reviewer.banggar.kbb@polaris.id']}
            );
        `;
      }

      const draftTitle = 'Raperda Pengelolaan Sampah & Ekonomi Sirkular Kabupaten Bandung Barat';
      let [legDraft] = await tx`
        SELECT id FROM legislation_drafts WHERE organization_id = ${orgKbb.id} AND title = ${draftTitle} LIMIT 1;
      `;
      if (!legDraft) {
        await tx`SELECT set_config('app.current_unit_id', ${uBapemperda.id}, true)`;
        await tx`SELECT set_config('app.current_tenant_id', ${userIds['ta.hukum.kbb@polaris.id']}, true)`;
        [legDraft] = await tx`
          INSERT INTO legislation_drafts (
            organization_id, origin_unit_id, title, document_category, current_stage,
            problem_statement, created_by_tenant_id
          )
          VALUES (
            ${orgKbb.id}, ${uBapemperda.id}, ${draftTitle}, 'PRODUK_HUKUM', 'PEMERIKSAAN_DAN_PEMBAHASAN',
            'Tingginya timbulan sampah rumah tangga yang belum terpilah dari sumbernya dan keterbatasan kapasitas TPA.',
            ${userIds['ta.hukum.kbb@polaris.id']}
          )
          RETURNING id;
        `;

        await tx`
          INSERT INTO legislation_clauses (
            draft_id, organization_id, clause_number, clause_title, clause_text,
            legal_authority_source, inspection_status
          )
          VALUES (
            ${legDraft.id}, ${orgKbb.id}, 'Pasal 12', 'Kewajiban Pemilahan Sampah Rumah Tangga',
            'Setiap pengelola kawasan permukiman dan rumah tangga wajib melakukan pemilahan sampah organik dan anorganik sebelum diangkut ke TPS.',
            'UU Nomor 18 Tahun 2008 tentang Pengelolaan Sampah', 'PERLU_TELAAH_HUKUM'
          );
        `;

        await tx`
          INSERT INTO legislation_dim_entries (
            draft_id, organization_id, source_party_name, is_public_consultation,
            target_clause_ref, issue_summary, proposed_amendment, status, created_by_tenant_id
          )
          VALUES (
            ${legDraft.id}, ${orgKbb.id}, 'Fraksi Partai Golkar & Forum Bank Sampah KBB', true,
            'Pasal 12', 'Perlu insentif pengurangan retribusi bagi RW yang aktif mengelola bank sampah.',
            'Tambahkan ayat (2) mengenai insentif pengurangan retribusi kebersihan daerah.', 'OPEN',
            ${userIds['ta.hukum.kbb@polaris.id']}
          );
        `;
      }
    });
    console.log('[5/6] Shared Notes, LKPJ Workspace & Findings, dan Draft Raperda seeded.');

    // 6. Seed Kuota Mingguan & Ledger AI Usage (untuk tes indikator kuota & panel analitik)
    await sql`
      INSERT INTO organization_member_quota_wallets (
        organization_id, tenant_id, weekly_period_key, weekly_limit, weekly_used, total_generated, total_revisions
      )
      VALUES
        (${orgKbb.id}, ${userIds['anggota.infra.kbb@polaris.id']}, ${currentWeek}, 3, 1, 1, 1),
        (${orgKbb.id}, ${userIds['ta.hukum.kbb@polaris.id']}, ${currentWeek}, 3, 2, 2, 0),
        (${orgKbb.id}, ${userIds['reviewer.banggar.kbb@polaris.id']}, ${currentWeek}, 3, 0, 0, 0)
      ON CONFLICT (organization_id, tenant_id, weekly_period_key) DO UPDATE SET
        weekly_used = EXCLUDED.weekly_used,
        total_generated = EXCLUDED.total_generated,
        total_revisions = EXCLUDED.total_revisions,
        updated_at = now();
    `;

    await sql`
      INSERT INTO organization_quota_ledgers (
        organization_id, unit_id, tenant_id, billing_cycle_month,
        total_requests, generate_requests, revision_requests,
        openai_input_tokens, openai_output_tokens, openai_total_tokens, openai_cost_idr,
        total_tokens_consumed, total_cost_idr
      )
      VALUES
        (${orgKbb.id}, ${uBidangInfra.id}, ${userIds['anggota.infra.kbb@polaris.id']}, ${currentMonth}, 2, 1, 1, 4200, 1800, 6000, 18500, 6000, 18500),
        (${orgKbb.id}, ${uBidangHukum.id}, ${userIds['ta.hukum.kbb@polaris.id']}, ${currentMonth}, 2, 2, 0, 5800, 2400, 8200, 25400, 8200, 25400)
      ON CONFLICT (organization_id, unit_id, tenant_id, billing_cycle_month) DO NOTHING;
    `;
    console.log('[6/6] Kuota mingguan & ledger analitik AI seeded.');

    console.log('\n====================================================');
    console.log(' SEEDER B2B SELESAI! DAFTAR AKUN TESTING (NO OTP):');
    console.log('====================================================');
    console.log(`Password semua akun B2B : ${defaultPassword}`);
    for (const u of usersSpec) {
      console.log(` - ${u.email.padEnd(32)} [${u.orgRole}] -> ${u.fullName}`);
    }
    console.log('====================================================');
  } catch (err) {
    console.error('Seeder B2B gagal:', err);
    process.exitCode = 1;
  } finally {
    await sql.end();
  }
}

runB2bSeed();
