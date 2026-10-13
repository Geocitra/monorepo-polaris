import sharp from 'sharp';
import pg from 'pg';

const client = new pg.Client({
  connectionString: 'postgresql://polaris_admin:polaris_secret_2026@localhost:5432/polaris_db'
});
await client.connect();
await client.query("SET app.current_tenant_id = 'a28b7732-8960-4dff-a3c9-be70c15492b6'");
const res = await client.query("SELECT original_media_url FROM social_publishing_jobs WHERE id = '6d620860-9015-40ca-9540-6d7bf9478724'");
const url = res.rows[0].original_media_url;
const b64 = url.split(',')[1];
const buf = Buffer.from(b64, 'base64');
const meta = await sharp(buf).metadata();
console.log('ORIGINAL META:', meta.width, meta.height, 'RATIO:', (meta.width/meta.height).toFixed(3));
await client.end();
