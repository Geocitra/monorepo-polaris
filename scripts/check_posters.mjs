import { db, studioPosters } from '../packages/database/dist/index.mjs';
import { desc } from 'drizzle-orm';

async function main() {
  const posters = await db.select().from(studioPosters).orderBy(desc(studioPosters.updatedAt)).limit(8);
  for (const p of posters) {
    console.log(JSON.stringify({
      id: p.id,
      title: p.title,
      topic: p.topic,
      status: p.status,
      archetypeId: p.archetypeId,
      filePath: p.filePath,
      updatedAt: p.updatedAt
    }, null, 2));
  }
  process.exit(0);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
