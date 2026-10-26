import fs from 'fs';
import path from 'path';
import * as dotenv from 'dotenv';
import sharp from 'sharp';

// Load .env from root
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

import { OpenAIAIEngineAdapter } from '../packages/ai-engine/src/ai-engine.adapter.js';
import { CreativePosterCompositor } from '../packages/storage/src/creative-poster-compositor.js';

async function testAirBersih() {
  console.log('=== MEMULAI TEST GENERASI POSTER: KELANGKAAN AIR BERSIH ===');
  const aiEngine = new OpenAIAIEngineAdapter();
  const topic = 'Krisis dan kelangkaan air bersih yang melanda permukiman padat warga pinggiran kota';

  console.log(`\n[1/4] Memilih Blueprint & Menghasilkan Background AI Berseni (Clean Art)...`);
  console.log(`Topik: "${topic}"`);

  const bgResult = await aiEngine.generateCreativePosterBackground({
    topic,
    tenantBrandHex: '#0284C7', // Sky Blue Accent
  });

  console.log(`Blueprint Terpilih: ${bgResult.blueprint.name} (${bgResult.blueprint.archetype})`);
  console.log(`Temporary URL AI: ${bgResult.temporaryImageUrl.slice(0, 80)}...`);

  console.log(`\n[2/4] Mengunduh background AI baru...`);
  let backgroundBuffer: Buffer;
  if (bgResult.temporaryImageUrl.startsWith('data:')) {
    const base64 = bgResult.temporaryImageUrl.split(',')[1] || '';
    backgroundBuffer = Buffer.from(base64, 'base64');
  } else {
    const res = await fetch(bgResult.temporaryImageUrl);
    if (!res.ok) throw new Error(`Gagal download image dari OpenAI: ${res.statusText}`);
    backgroundBuffer = Buffer.from(await res.arrayBuffer());
  }

  console.log(`\n[3/4] Menyiapkan foto dewan asli dari avatar-dewan-budi.jpg...`);
  const avatarPath = path.join(process.cwd(), 'apps/web-dashboard/public/images/avatar-dewan-budi.jpg');
  let subjectPhotoBuffer: Buffer | undefined;
  if (fs.existsSync(avatarPath)) {
    // Berikan border radius halus / crop untuk simulasi potret dewan
    subjectPhotoBuffer = await sharp(avatarPath)
      .resize(480, 600, { fit: 'cover' })
      .png()
      .toBuffer();
    console.log(`Foto dewan berhasil dimuat dari: ${avatarPath}`);
  }

  console.log(`\n[4/4] Merakit 3-Layer Compositing (Latar AI Baru + Foto Asli + Tipografi)...`);
  const composed = await CreativePosterCompositor.composePoster({
    backgroundBuffer,
    subjectPhotoBuffer,
    headline: 'DARURAT AIR BERSIH DI PEMUKIMAN',
    quote: 'Akses air bersih adalah hak paling mendasar setiap warga yang wajib dijamin negara tanpa alasan birokrasi.',
    memberName: 'H. BUDI PRASETYO, S.T.',
    memberTitle: 'Komisi V DPR RI // Pengawasan Infrastruktur Air',
    archetype: bgResult.blueprint.archetype,
    primaryAccentColor: bgResult.blueprint.colorPalette.primaryAccent,
    canvasWidth: 1080,
    canvasHeight: 1350,
    editionTag: 'POLARIS SUARA RAKYAT // KRISIS AIR 2026',
    outputFormat: 'png',
  });

  const outPath = path.join(process.cwd(), 'uploads/poster_kelangkaan_air_bersih.png');
  fs.writeFileSync(outPath, composed.buffer);

  // Salin ke artifacts folder antigravity ide
  const artifactPath = '/mnt/c/Users/PC/.gemini/antigravity-ide/brain/20183ae9-093f-4958-af8d-9d39f692ed3c/poster_kelangkaan_air_bersih.png';
  try {
    fs.copyFileSync(outPath, artifactPath);
  } catch {}

  console.log(`\n=== SUKSES BESAR! ===`);
  console.log(`File tersimpan di: ${outPath}`);
  console.log(`Resolusi: ${composed.width}x${composed.height}px, Ukuran: ${(composed.sizeBytes / 1024).toFixed(1)} KB`);
}

testAirBersih().catch((err) => {
  console.error('\n[TEST FAILED]:', err);
  process.exit(1);
});
