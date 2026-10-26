import postgres from '../packages/database/node_modules/postgres/src/index.js';
import fs from 'fs';

const sql = postgres('postgresql://postgres:admin123@localhost:5432/polaris');

async function run() {
  const members = await sql`SELECT id, email, full_name, photo_url FROM tenant_members`;
  for (const m of members) {
    console.log('Member:', m.email, m.full_name, 'photo_url length:', m.photo_url ? m.photo_url.length : 0);
    if (m.photo_url && m.photo_url.startsWith('data:')) {
      const b64 = m.photo_url.replace(/^data:image\/[a-z]+;base64,/, '');
      fs.writeFileSync(`C:/Users/Geocitra1/.gemini/antigravity-ide/brain/a09db1ca-208c-4f4f-95c9-10ee286d044d/member_${m.email}.jpg`, Buffer.from(b64, 'base64'));
    }
  }
  await sql.end();
}
run();
