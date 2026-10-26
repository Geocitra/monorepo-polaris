import fs from 'fs';
import path from 'path';
import * as dotenv from 'dotenv';

// Load .env from root
dotenv.config({ path: path.resolve(process.cwd(), '../../.env') });
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

import { OpenAIAIEngineAdapter } from '@polaris/ai-engine';
import { CreativePosterCompositor } from '@polaris/storage';

async function testAirBersih() {
  console.log('=== MEMULAI TEST GENERASI POSTER: KELANGKAAN AIR BERSIH ===');
  const aiEngine = new OpenAIAIEngineAdapter();
  const topic = 'Krisis dan kelangkaan air bersih yang melanda permukiman padat warga pinggiran kota';

  const cacheBgPath = '/tmp/air_bersih_bg.png';
  let backgroundBuffer: Buffer;
  let archetype: any = 'STATEMENT_PROFILE';
  let primaryAccent = '#0284C7';

  if (fs.existsSync(cacheBgPath)) {
    console.log(`\n[Cache Hit] Memakai background AI yang sudah digenerate sebelumnya: ${cacheBgPath}`);
    backgroundBuffer = fs.readFileSync(cacheBgPath);
  } else {
    console.log(`\n[1/4] Memilih Blueprint & Menghasilkan Background AI Berseni (Clean Art)...`);
    console.log(`Topik: "${topic}"`);

    const bgResult = await aiEngine.generateCreativePosterBackground({
      topic,
      tenantBrandHex: '#0284C7',
    });

    archetype = bgResult.blueprint.archetype;
    primaryAccent = bgResult.blueprint.colorPalette.primaryAccent;
    console.log(`Blueprint Terpilih: ${bgResult.blueprint.name} (${archetype})`);

    console.log(`\n[2/4] Mengunduh background AI baru...`);
    if (bgResult.temporaryImageUrl.startsWith('data:')) {
      const base64 = bgResult.temporaryImageUrl.split(',')[1] || '';
      backgroundBuffer = Buffer.from(base64, 'base64');
    } else {
      const res = await fetch(bgResult.temporaryImageUrl);
      if (!res.ok) throw new Error(`Gagal download image dari OpenAI: ${res.statusText}`);
      backgroundBuffer = Buffer.from(await res.arrayBuffer());
    }
    fs.writeFileSync(cacheBgPath, backgroundBuffer);
  }

  console.log(`\n[3/4] Menyiapkan foto dewan asli dari avatar-dewan-budi.jpg...`);
  const rootDir = path.resolve(process.cwd(), '../..');
  const avatarPath = path.join(rootDir, 'apps/web-dashboard/public/images/avatar-dewan-budi.jpg');
  let subjectPhotoBuffer: Buffer | undefined;
  if (fs.existsSync(avatarPath)) {
    subjectPhotoBuffer = fs.readFileSync(avatarPath);
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
    archetype,
    primaryAccentColor: primaryAccent,
    canvasWidth: 1080,
    canvasHeight: 1350,
    editionTag: 'POLARIS SUARA RAKYAT // KRISIS AIR 2026',
    outputFormat: 'png',
  });

  const outPath = path.join(rootDir, 'uploads/poster_kelangkaan_air_bersih.png');
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
