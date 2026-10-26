import postgres from './node_modules/.pnpm/postgres@3.4.9/node_modules/postgres/src/index.js';

const sql = postgres('postgresql://postgres:admin123@localhost:5432/polaris');

async function main() {
  const themes = await sql`SELECT SUBSTRING(official_photo_url, 30, 30) as photo FROM portal_theme_settings WHERE portal_id = '58e67423-83b1-4fe1-a460-466f1c5b0d55'`;
  console.log('Themes photo slice:', themes[0].photo);

  const members = await sql`SELECT SUBSTRING(photo_url, 30, 30) as photo FROM tenant_members WHERE email = 'dewan@polaris.id'`;
  console.log('Members photo slice:', members[0].photo);

  await sql.end();
}

main().catch(console.error);
