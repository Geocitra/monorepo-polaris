import postgres from '../packages/database/node_modules/postgres/src/index.js';
import fs from 'fs';

const sql = postgres('postgresql://postgres:admin123@localhost:5432/polaris');

async function run() {
  const row = await sql`SELECT official_photo_url FROM portal_theme_settings WHERE portal_id = '58e67423-83b1-4fe1-a460-466f1c5b0d55'`;
  const base64Data = row[0].official_photo_url.replace(/^data:image\/[a-z]+;base64,/, '');
  fs.writeFileSync('C:/Users/Geocitra1/.gemini/antigravity-ide/brain/a09db1ca-208c-4f4f-95c9-10ee286d044d/real_ahmad_fauzi.jpg', Buffer.from(base64Data, 'base64'));
  console.log('Saved real_ahmad_fauzi.jpg, bytes:', fs.statSync('C:/Users/Geocitra1/.gemini/antigravity-ide/brain/a09db1ca-208c-4f4f-95c9-10ee286d044d/real_ahmad_fauzi.jpg').size);
  await sql.end();
}
run();
