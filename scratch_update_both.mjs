import postgres from './node_modules/.pnpm/postgres@3.4.9/node_modules/postgres/src/index.js';
import fs from 'fs';

const sql = postgres('postgresql://postgres:admin123@localhost:5432/polaris');

async function main() {
  const pngPath = 'C:/Users/Geocitra1/.gemini/antigravity-ide/brain/d714680e-b9a4-4a23-b725-170197bce921/scratch/bust_portrait.png';
  const buf = fs.readFileSync(pngPath);
  const dataUri = `data:image/png;base64,${buf.toString('base64')}`;
  console.log('New dataUri slice:', dataUri.slice(30, 60));

  // 1. Update portal_theme_settings for ahmadfauzi
  const portals = await sql`SELECT id FROM portal_configs WHERE subdomain_slug = 'ahmadfauzi'`;
  if (portals.length > 0) {
    const portalId = portals[0].id;
    await sql`
      UPDATE portal_theme_settings 
      SET official_photo_url = ${dataUri}, updated_at = now()
      WHERE portal_id = ${portalId}
    `;
    console.log(`Updated portal_theme_settings for portal ${portalId}`);
  }

  // 2. Update tenant_members for dewan@polaris.id
  await sql`
    UPDATE tenant_members
    SET photo_url = ${dataUri}, updated_at = now()
    WHERE email = 'dewan@polaris.id'
  `;
  console.log('Updated tenant_members dewan@polaris.id');

  // Verify
  const themes = await sql`SELECT SUBSTRING(official_photo_url, 30, 30) as photo FROM portal_theme_settings WHERE portal_id = ${portals[0].id}`;
  console.log('Verified Themes photo slice:', themes[0].photo);

  const members = await sql`SELECT SUBSTRING(photo_url, 30, 30) as photo FROM tenant_members WHERE email = 'dewan@polaris.id'`;
  console.log('Verified Members photo slice:', members[0].photo);

  await sql.end();
}

main().catch(console.error);
