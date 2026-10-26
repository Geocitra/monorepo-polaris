import postgres from '../node_modules/.pnpm/postgres@3.4.9/node_modules/postgres/src/index.js';

async function seedJonan() {
  const sql = postgres('postgresql://postgres:admin123@localhost:5432/polaris');
  const jonanId = '940bbd1e-cf8d-4ae9-8c0c-c496307a88b9';
  const ahmadId = 'd5687fb8-a270-4445-a97e-017f56f96cff';

  const pubs = await sql`SELECT * FROM content_publications WHERE tenant_id = ${ahmadId} AND status = 'PUBLISHED'`;
  console.log('Found published pubs:', pubs.length);

  for (const p of pubs) {
    const newSlug = p.slug.replace(/-[a-f0-9]{8}$/, '') + '-jonan';
    const existing = await sql`SELECT id FROM content_publications WHERE tenant_id = ${jonanId} AND slug = ${newSlug}`;
    
    let pubId;
    if (existing.length > 0) {
      pubId = existing[0].id;
    } else {
      const [inserted] = await sql`
        INSERT INTO content_publications (
          tenant_id, title, slug, excerpt, body_content_markdown, 
          word_count, status, canonical_url, comment_count, published_at, created_at, updated_at
        ) VALUES (
          ${jonanId}, ${p.title}, ${newSlug}, ${p.excerpt}, ${p.body_content_markdown},
          ${p.word_count || 100}, 'PUBLISHED', ${'https://jonandabrahman.polaris.id/artikel/' + newSlug}, 0, now(), now(), now()
        )
        RETURNING id
      `;
      pubId = inserted.id;
    }

    const medias = await sql`SELECT * FROM media_assets WHERE publication_id = ${p.id}`;
    for (const med of medias) {
      const existMed = await sql`SELECT id FROM media_assets WHERE publication_id = ${pubId}`;
      if (existMed.length === 0) {
        await sql`
          INSERT INTO media_assets (
            publication_id, asset_type, r2_storage_url, cdn_public_url, prompt_used, mime_type, file_size_bytes, created_at
          ) VALUES (
            ${pubId}, ${med.asset_type}, ${med.r2_storage_url || 'https://assets.polaris.id/test.png'}, ${med.cdn_public_url}, ${med.prompt_used || ''}, ${med.mime_type || 'image/png'}, ${med.file_size_bytes || 1000}, now()
          )
        `;
      }
    }
  }

  const check = await sql`SELECT count(*) FROM content_publications WHERE tenant_id = ${jonanId}`;
  console.log('Jonan publications now:', check[0].count);
  await sql.end();
}

seedJonan().catch(console.error);
