import postgres from '../packages/database/node_modules/postgres/src/index.js';
import fs from 'fs';
import path from 'path';

const sql = postgres('postgresql://postgres:admin123@localhost:5432/polaris');

async function run() {
  const brainDir = 'C:/Users/Geocitra1/.gemini/antigravity-ide/brain/a09db1ca-208c-4f4f-95c9-10ee286d044d';
  const webpPath = path.join(brainDir, 'transparent_ahmad_fauzi.webp');
  const pngPath = path.join(brainDir, 'transparent_ahmad_fauzi.png');

  if (!fs.existsSync(webpPath) && !fs.existsSync(pngPath)) {
    console.error('Neither transparent_ahmad_fauzi.webp nor png found yet!');
    await sql.end();
    return;
  }

  const chosenPath = fs.existsSync(webpPath) ? webpPath : pngPath;
  const mime = chosenPath.endsWith('.webp') ? 'image/webp' : 'image/png';
  const base64 = fs.readFileSync(chosenPath).toString('base64');
  const dataUri = `data:${mime};base64,${base64}`;

  // Copy to public folders
  const portalDest = 'apps/web-portal/public/images/dewan-ahmad-fauzi-cutout.webp';
  fs.copyFileSync(chosenPath, portalDest);
  console.log(`Copied to ${portalDest}`);

  const dashDest = 'apps/web-dashboard/public/images/dewan-ahmad-fauzi-cutout.webp';
  fs.copyFileSync(chosenPath, dashDest);
  console.log(`Copied to ${dashDest}`);

  // Find portal_id for ahmadfauzi
  const portals = await sql`SELECT id FROM portal_configs WHERE subdomain_slug = 'ahmadfauzi'`;
  if (portals.length > 0) {
    const portalId = portals[0].id;
    await sql`
      UPDATE portal_theme_settings 
      SET official_photo_url = ${dataUri}, updated_at = now()
      WHERE portal_id = ${portalId}
    `;
    console.log(`Updated portal_theme_settings for portal ${portalId} with transparent photo (${dataUri.length} chars)`);
  }

  // Update tenant_members
  const resMember = await sql`
    UPDATE tenant_members
    SET photo_url = ${dataUri}, updated_at = now()
    WHERE email = 'dewan@polaris.id'
  `;
  console.log('Updated tenant_members dewan@polaris.id photo_url');

  await sql.end();
}
run();
