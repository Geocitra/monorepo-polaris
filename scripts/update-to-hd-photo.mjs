import postgres from '../packages/database/node_modules/postgres/src/index.js';
import fs from 'fs';

const sql = postgres('postgresql://postgres:admin123@localhost:5432/polaris');

async function run() {
  const hdPath = 'C:/Users/Geocitra1/.gemini/antigravity-ide/brain/d714680e-b9a4-4a23-b725-170197bce921/scratch/bust_portrait_hd.png';
  const buf = fs.readFileSync(hdPath);
  const dataUri = `data:image/png;base64,${buf.toString('base64')}`;
  console.log(`HD Image size: ${buf.length} bytes, Data URI length: ${dataUri.length}`);

  // Copy to public folders
  fs.writeFileSync('apps/web-portal/public/images/dewan-ahmad-fauzi-cutout.webp', buf);
  fs.writeFileSync('apps/web-dashboard/public/images/dewan-ahmad-fauzi-cutout.webp', buf);

  await sql`
    UPDATE portal_theme_settings 
    SET official_photo_url = ${dataUri}, updated_at = now()
    WHERE portal_id IN (SELECT id FROM portal_configs WHERE subdomain_slug = 'ahmadfauzi')
  `;
  console.log('Updated portal_theme_settings for ahmadfauzi with HD photo');

  await sql`
    UPDATE tenant_members
    SET photo_url = ${dataUri}, updated_at = now()
    WHERE email = 'dewan@polaris.id'
  `;
  console.log('Updated tenant_members dewan@polaris.id with HD photo');

  await sql.end();
}

run().catch(console.error);
