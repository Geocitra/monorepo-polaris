import postgres from '../packages/database/node_modules/postgres/src/index.js';
const sql = postgres('postgresql://postgres:admin123@localhost:5432/polaris');

async function run() {
  const members = await sql`SELECT id, tenant_id, full_name, photo_url FROM tenant_members WHERE tenant_id = 'd5687fb8-a270-4445-a97e-017f56f96cff'`;
  console.log('tenant_members:', members.map(m => ({ id: m.id, name: m.full_name, photo: m.photo_url?.slice(0, 50) })));
  await sql.end();
}
run();
