import * as bcrypt from 'bcrypt';
import pg from 'pg';
import dotenv from 'dotenv';
import path from 'node:path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const connectionString = process.env.DATABASE_URL || 'postgresql://polaris_admin:polaris_secret_2026@localhost:5432/polaris_db';
const client = new pg.Client({ connectionString });

async function seedOperator() {
  await client.connect();
  console.log('Terhubung ke database...');

  const operatorEmail = 'operator@polaris.id';
  const operatorPlainPassword = 'OperatorPolaris2026!';
  const operatorName = 'Budi Santoso (Operator Konten Polaris)';

  const passwordHash = await bcrypt.hash(operatorPlainPassword, 10);

  // 1. Upsert Operator ke system_admins
  const adminRes = await client.query(
    `INSERT INTO system_admins (email, password_hash, full_name, role, is_active)
     VALUES ($1, $2, $3, 'CONTENT_OPERATOR', true)
     ON CONFLICT (email) DO UPDATE 
     SET password_hash = $2, full_name = $3, role = 'CONTENT_OPERATOR', is_active = true
     RETURNING id, email, full_name, role;`,
    [operatorEmail, passwordHash, operatorName]
  );

  const operator = adminRes.rows[0];
  console.log('✅ Operator Account Ready:', operator);

  // 2. Ambil semua tenant members yang ada di database
  const tenantsRes = await client.query(`SELECT id, full_name, legislative_level, party_affiliation FROM tenant_members`);
  console.log(`Menemukan ${tenantsRes.rows.length} Dewan di database.`);

  // 3. Hubungkan operator ke seluruh dewan yang ada
  for (const tenant of tenantsRes.rows) {
    await client.query(
      `INSERT INTO operator_tenant_assignments (operator_id, tenant_id, can_direct_publish, status, notes)
       VALUES ($1, $2, true, 'ACTIVE', 'Penugasan inisial dewan binaan operator oleh Superadmin')
       ON CONFLICT (operator_id, tenant_id) DO UPDATE
       SET status = 'ACTIVE', can_direct_publish = true, updated_at = now();`,
      [operator.id, tenant.id]
    );
    console.log(`🔗 Berhasil menugaskan dewan: ${tenant.full_name} (${tenant.party_affiliation}) ke operator.`);
  }

  console.log('\n======================================================');
  console.log('🎉 SEEDING SELESAI!');
  console.log('Email Login    :', operatorEmail);
  console.log('Password Login :', operatorPlainPassword);
  console.log('Total Dewan    :', tenantsRes.rows.length);
  console.log('======================================================\n');

  await client.end();
}

seedOperator().catch((err) => {
  console.error('Gagal seed operator:', err);
  process.exit(1);
});
