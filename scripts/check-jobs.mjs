import postgres from '../packages/database/node_modules/postgres/src/index.js';

const sql = postgres(process.env.DATABASE_URL || 'postgresql://polaris_admin:polaris_secret_2026@localhost:5432/polaris_db');

async function run() {
  const rows = await sql.begin(async (tx) => {
    await tx`SELECT set_config('app.current_tenant_id', 'a28b7732-8960-4dff-a3c9-be70c15492b6', true)`;
    return await tx`SELECT id, status, formatted_media_url, LEFT(original_media_url, 80) AS orig, last_error_message, created_at, updated_at FROM social_publishing_jobs ORDER BY created_at DESC LIMIT 2`;
  });
  for (const r of rows) {
    console.log('ID:', r.id);
    console.log('STATUS:', r.status);
    console.log('FORMATTED_URL:', r.formatted_media_url);
    console.log('ERROR:', r.last_error_message);
  }
  await sql.end();
}

run().catch(console.error);
