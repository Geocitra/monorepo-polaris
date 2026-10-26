import fs from 'node:fs/promises';
import path from 'node:path';
import { ArtCollageCompositor } from '../packages/storage/dist/index.mjs';

async function testPaper() {
  // 1x1 Cream PNG buffer (akan di-resize otomatis oleh Sharp di compositor ke 1080x1350)
  const creamPaper = Buffer.from(
    'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==',
    'base64'
  );

  const zones = {
    headline: { x: 0.08, y: 0.12, w: 0.50, h: 0.24 },
    body: { x: 0.08, y: 0.40, w: 0.48, h: 0.42 },
    footer: { x: 0.08, y: 0.90, w: 0.84, h: 0.05 },
  };

  const copy = {
    kicker: 'ADVOKASI INFRASTRUKTUR PARLEMEN',
    headline: 'UPAYA TERUKUR JALAN LOGISTIK',
    deck: 'Pengawasan alokasi pemeliharaan jalan daerah dan percepatan penanganan jalur produksi warga.',
    points: [
      {
        label: 'AKAR MASALAH',
        text: 'Kerusakan jalan aspal menghambat distribusi pangan dan memicu lonjakan ongkos angkut hasil bumi.',
      },
      {
        label: 'LANGKAH PARLEMEN',
        text: 'Mendorong percepatan pencairan dana alokasi khusus dan pengawasan berkala bersama dinas bina marga.',
      },
    ],
    closingLine: 'Kawal pemerataan pembangunan bersama warga.',
  };

  const composed = await ArtCollageCompositor.compose({
    canvasBuffer: creamPaper,
    copy,
    zones,
    palette: {
      accentHex: '#B83A1B', // Terracotta Red
      secondaryHex: '#1C1917',
    },
    signature: 'DR. H. AHMAD FAUZI, M.SI — KOMISI V DPR RI // DAPIL JABAR VII',
    editionTag: 'POLARIS // ADVOKASI WARGA',
    canvasWidth: 1080,
    canvasHeight: 1350,
    outputFormat: 'webp',
  });

  const outPath = path.resolve('uploads/test_renders/test_art_collage_paper_ink.webp');
  await fs.writeFile(outPath, composed.buffer);
  console.log(`Saved paper ink test to: ${outPath}`);
  console.log(`Luminance: ${composed.detectedLuminance.toFixed(3)}, Blend: ${composed.blendModeUsed}`);
}

testPaper().catch(console.error);
