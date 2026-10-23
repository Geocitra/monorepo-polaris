import fs from 'node:fs/promises';
import { ChromiumPosterCompositor } from '../packages/storage/dist/index.mjs';

async function test() {
  console.log('Testing ChromiumPosterCompositor...');
  const canvasBuffer = await fs.readFile('uploads/test_renders/test_art_collage_result.webp');

  const copy = {
    kicker: 'UPAYA INFRASTRUKTUR DAERAH',
    headline: 'PERBAIKAN JALAN SUKABUMI',
    deck: 'Pengawasan berkala dan realisasi anggaran perbaikan jalur logistik vital Jawa Barat I.',
    points: [
      {
        label: 'INSPEKSI KELAYAKAN',
        text: 'Audit fisik berkala dan penertiban muatan berlebih di ruas jalur penghubung.',
      },
      {
        label: 'TRANSPARANSI ANGGARAN',
        text: 'Setiap pos pengalokasian dana dilaporkan terbuka kepada publik dan konstituen.',
      },
    ],
    closingLine: 'Komitmen mengawal keselamatan berkendara dan percepatan mobilitas warga.',
  };

  const zones = {
    headline: { x: 0.08, y: 0.08, w: 0.84, h: 0.18 },
    body: { x: 0.08, y: 0.28, w: 0.84, h: 0.26 },
    footer: { x: 0.08, y: 0.88, w: 0.84, h: 0.06 },
    textTone: 'DARK',
  };

  const start = Date.now();
  const result = await ChromiumPosterCompositor.compose({
    canvasBuffer,
    copy,
    zones,
    palette: {
      accentHex: '#D97706',
      secondaryHex: '#374151',
    },
    signature: 'RENO S NUGRAHA — KOMISI DPR RI // JAWA BARAT I',
    editionTag: 'POLARIS // JAWA BARAT I',
  });

  console.log('Composed successfully in', Date.now() - start, 'ms!');
  console.log('Output size:', result.sizeBytes, 'bytes');
  console.log('Detected luminance:', result.detectedLuminance);
  console.log('Blend mode used:', result.blendModeUsed);

  await fs.writeFile('uploads/test_renders/test_chromium_output.webp', result.buffer);
  console.log('Saved to uploads/test_renders/test_chromium_output.webp');
}

test().catch(console.error);
