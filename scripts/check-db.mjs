import pg from 'pg';
import dotenv from 'dotenv';
dotenv.config();

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL || 'postgres://polaris_user:polaris_secure_pass_2026@localhost:5432/polaris_db' });

async function check() {
  const p = await pool.query('SELECT id, title, created_at, updated_at FROM content_publications ORDER BY created_at DESC LIMIT 3');
  console.log('PUBS:', JSON.stringify(p.rows, null, 2));

  const m = await pool.query('SELECT id, publication_id, asset_type, cdn_public_url, created_at FROM media_assets ORDER BY created_at DESC LIMIT 3');
  console.log('MEDIA:', JSON.stringify(m.rows, null, 2));

  await pool.end();
}

check().catch(console.error);
