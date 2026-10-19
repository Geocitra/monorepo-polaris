import fs from 'fs';
import path from 'path';
import sharp from 'sharp';
import { PosterBlueprintSelector, PosterPromptCompiler } from '../packages/ai-engine/src/creative-poster/index.js';
import { CreativePosterCompositor } from '../packages/storage/src/creative-poster-compositor.js';

async function runTest() {
  console.log('--- 1. Testing Constrained RNG Selector ---');
  const topic = 'Kritik tajam kenaikan harga kebutuhan pokok dan revitalisasi pasar tradisional';
  const selectedBlueprint = PosterBlueprintSelector.selectBestBlueprint({ topic });
  console.log(`Topic: "${topic}"`);
  console.log(`Selected Blueprint: ${selectedBlueprint.name} (${selectedBlueprint.id})`);
  console.log(`Archetype: ${selectedBlueprint.archetype}`);
  console.log(`Tags:`, selectedBlueprint.tags);

  console.log('\n--- 2. Testing Prompt Compiler ---');
  const compiledPrompt = PosterPromptCompiler.compileScenePrompt({
    topic,
    blueprint: selectedBlueprint,
    tenantBrandHex: selectedBlueprint.colorPalette.primaryAccent,
  });
  console.log('Compiled Prompt snippet:');
  console.log(compiledPrompt.englishPrompt.slice(0, 300) + '...\n');

  console.log('--- 3. Testing Real Image Compositing (Sharp Engine) ---');
  // Gunakan gambar referensi asli atau buat kanvas realistis
  const refPath = path.join(process.cwd(), 'uploads/references/poster', selectedBlueprint.referenceFile);
  let bgBuffer: Buffer;
  if (fs.existsSync(refPath)) {
    console.log(`Using base reference texture from: ${selectedBlueprint.referenceFile}`);
    bgBuffer = fs.readFileSync(refPath);
  } else {
    bgBuffer = await sharp({
      create: { width: 1080, height: 1350, channels: 3, background: { r: 35, g: 39, b: 47 } }
    }).jpeg().toBuffer();
  }

  // Buat mockup cutout tokoh dewan
  const subjectCutout = await sharp({
    create: {
      width: 450,
      height: 600,
      channels: 4,
      background: { r: 220, g: 38, b: 38, alpha: 0.85 }
    }
  }).png().toBuffer();

  const composedResult = await CreativePosterCompositor.composePoster({
    backgroundBuffer: bgBuffer,
    subjectPhotoBuffer: subjectCutout,
    headline: 'PASAR TRADISIONAL HARUS DILINDUNGI',
    quote: 'Pedagang kecil butuh kepastian pasokan dan perlindungan dari gempuran ritel modern.',
    memberName: 'H. AHMAD FAUZI, S.T.',
    memberTitle: 'Ketua Komisi VI DPR RI // Fraksi Rakyat',
    archetype: selectedBlueprint.archetype,
    primaryAccentColor: selectedBlueprint.colorPalette.primaryAccent,
    canvasWidth: 1080,
    canvasHeight: 1350,
    editionTag: 'POLARIS SUARA RAKYAT // EDISI 2026',
    outputFormat: 'png',
  });

  const outDir = path.join(process.cwd(), 'uploads');
  const outPath = path.join(outDir, 'sample_rendered_poster.png');
  fs.writeFileSync(outPath, composedResult.buffer);
  console.log(`\nSUCCESS! Composed poster saved to: ${outPath}`);
  console.log(`Dimensions: ${composedResult.width}x${composedResult.height}px, Size: ${(composedResult.sizeBytes / 1024).toFixed(1)} KB`);
}

runTest().catch((err) => {
  console.error('Error running test:', err);
  process.exit(1);
});
