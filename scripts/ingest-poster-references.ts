import fs from 'fs/promises';
import path from 'path';
import {
  POSTER_BLUEPRINT_CATALOG,
  PosterBlueprintRepository,
  PosterReferenceVisionAnalyzer,
} from '../packages/ai-engine/dist/index.js';

async function main() {
  console.log('=== POLARIS REFERENCE VISION INGESTION & SEED UTILITY ===\n');

  const args = process.argv.slice(2);
  const isSeedOnly = args.includes('--seed-only');

  // 1. Seed Static Catalog ke Database jika diminta atau otomatis
  console.log('[1/2] Menyemai katalog statis ke database...');
  try {
    const seedResult = await PosterBlueprintRepository.seedStaticCatalogToDb();
    console.log(
      `✓ Seed selesai: ${seedResult.inserted} blueprint baru disemai, ${seedResult.skipped} sudah ada di DB.\n`
    );
  } catch (err: any) {
    console.warn(`! Peringatan Seed DB: ${err.message}. Melanjutkan pemindaian lokal...\n`);
  }

  if (isSeedOnly) {
    console.log('Mode --seed-only selesai.');
    return;
  }

  // 2. Scan direktori uploads/references/poster/
  console.log('[2/2] Memindai direktori referensi lokal untuk file baru...');
  const referencesDir = path.resolve(process.cwd(), 'uploads/references/poster');

  let files: string[] = [];
  try {
    files = await fs.readdir(referencesDir);
  } catch (err: any) {
    console.error(`Gagal membaca direktori ${referencesDir}:`, err.message);
    return;
  }

  const imageFiles = files.filter((f) =>
    /\.(jpg|jpeg|png|webp)$/i.test(f)
  );

  console.log(`Ditemukan ${imageFiles.length} file gambar di ${referencesDir}.`);

  const activeCatalog = await PosterBlueprintRepository.getActiveCatalog();
  const catalogFileSet = new Set(activeCatalog.map((b) => b.referenceFile));

  const uncatalogedFiles = imageFiles.filter((f) => !catalogFileSet.has(f));

  if (uncatalogedFiles.length === 0) {
    console.log('✓ Seluruh file referensi sudah terdaftar di katalog blueprint. Tidak ada file baru yang perlu dianalisis.');
    return;
  }

  console.log(`\nMenemukan ${uncatalogedFiles.length} file referensi baru yang belum terdaftar:`);
  for (const newFile of uncatalogedFiles) {
    console.log(` - ${newFile}`);
  }

  if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY === 'sk-mock-key') {
    console.log('\n[INFO] OPENAI_API_KEY tidak dikonfigurasi. Lewati inferensi Vision langsung.');
    return;
  }

  for (const file of uncatalogedFiles) {
    console.log(`\nMenganalisis via GPT-4o Vision: ${file}...`);
    try {
      const filePath = path.join(referencesDir, file);
      const buffer = await fs.readFile(filePath);

      const blueprint = await PosterReferenceVisionAnalyzer.analyzePosterReference({
        imageBuffer: buffer,
        referenceFileName: file,
      });

      console.log(`✓ Berhasil mengekstrak blueprint: "${blueprint.name}" (Archetype: ${blueprint.archetype})`);

      await PosterBlueprintRepository.saveDraftBlueprint(blueprint);
      console.log(`✓ Blueprint ${blueprint.id} tersimpan sebagai DRAFT di database.`);
    } catch (ingestErr: any) {
      console.error(`! Gagal menganalisis ${file}:`, ingestErr.message);
    }
  }

  console.log('\n=== PROSES INGESTION SELESAI ===');
}

main().catch((err) => {
  console.error('Fatal Error:', err);
  process.exit(1);
});
