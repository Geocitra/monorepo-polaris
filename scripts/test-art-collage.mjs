import fs from 'node:fs/promises';
import path from 'node:path';
import { ArtCollageCompositor } from '../packages/storage/dist/index.mjs';
import {
  ART_COLLAGE_DNA,
  pickArtCollageMutation,
  compileArtCollageImagePrompt,
  anchorFallbackLayout,
} from '../packages/ai-engine/dist/index.js';

async function run() {
  console.log('--- 1. Testing Art-Collage Mutation & Prompt Compilation ---');
  const archetype = 'STREET_JOURNALISM';
  const mutation1 = pickArtCollageMutation(archetype, 101);
  const mutation2 = pickArtCollageMutation(archetype, 202);

  console.log('Mutation 1:', mutation1.anchor, mutation1.palette.name || mutation1.palette.id);
  console.log('Mutation 2:', mutation2.anchor, mutation2.palette.name || mutation2.palette.id);

  const prompt = compileArtCollageImagePrompt({
    archetype,
    mutation: mutation1,
    visualSubject: 'Indonesian workers repairing asphalt roads in rainy weather',
    withStyleReference: false,
  });

  console.log('\nGenerated Image Prompt Sample:\n', prompt);

  // Verifikasi: DILARANG ada kebocoran koordinat x: atau y:
  if (/x:\s*\d|y:\s*\d/i.test(prompt)) {
    throw new Error('FAILED: Terdeteksi kebocoran koordinat x: y: pada prompt!');
  }
  console.log('VERIFIED: Zero coordinate leakage in image prompt.');

  console.log('\n--- 2. Testing ArtCollageCompositor (Zero-Box Satori + Sharp Ink-Blend) ---');
  // Muat kanvas latar belakang contoh dari uploads/
  const baseCanvas = await fs.readFile('./uploads/poster_kelangkaan_air_bersih.png');

  const layout = anchorFallbackLayout(mutation1.anchor, ART_COLLAGE_DNA[archetype].paperTone);

  const copy = {
    kicker: 'CATATAN ADVOKASI PUBLIK',
    headline: 'PERBAIKAN JALAN RUSAK',
    deck: 'Pengawasan anggaran infrastruktur dan percepatan penanganan jalur logistik warga.',
    points: [
      {
        label: 'KENDALA LAPANGAN',
        text: 'Kerusakan jalan aspal menghambat distribusi pangan dan membahayakan pengendara motor.',
      },
      {
        label: 'RESPONS PARLEMEN',
        text: 'Mendorong pencairan dana tanggap darurat dan pengawasan berkala bersama dinas bina marga.',
      },
    ],
    closingLine: 'Kawal pemerataan pembangunan bersama warga.',
  };

  const composed = await ArtCollageCompositor.compose({
    canvasBuffer: baseCanvas,
    copy,
    zones: layout,
    palette: {
      accentHex: mutation1.palette.accentHex,
      secondaryHex: mutation1.palette.secondaryHex,
    },
    signature: 'DR. H. AHMAD FAUZI, M.SI — KOMISI V DPR RI // DAPIL JABAR VII',
    editionTag: 'POLARIS // ADVOKASI WARGA',
    canvasWidth: 1080,
    canvasHeight: 1350,
    outputFormat: 'webp',
  });

  const outDir = path.resolve('uploads/test_renders');
  await fs.mkdir(outDir, { recursive: true });
  const outPath = path.join(outDir, 'test_art_collage_result.webp');
  await fs.writeFile(outPath, composed.buffer);

  console.log(`\nSUCCESS! Poster Art-Collage tersimpan di: ${outPath}`);
  console.log(`Dimensions: ${composed.width}x${composed.height}px, Size: ${(composed.sizeBytes / 1024).toFixed(1)} KB`);
  console.log(`Detected Paper Luminance: ${composed.detectedLuminance.toFixed(3)}`);
  console.log(`Blend Mode Used: ${composed.blendModeUsed}`);
}

run().catch((err) => {
  console.error('Test run error:', err);
  process.exit(1);
});
