import fs from 'node:fs/promises';
import { ArtCollagePosterPipeline } from '../packages/ai-engine/dist/index.js';
import { ChromiumPosterCompositor } from '../packages/storage/dist/index.mjs';

async function testFullPipeline() {
  console.log('--- Running Full Chromium Art-Collage Pipeline ---');
  const start = Date.now();

  const artCollage = await ArtCollagePosterPipeline.generate({
    topic: 'Percepatan perbaikan jalan berlubang dan penertiban truk logistik di jalur Sukabumi',
    groundedContextSummary: 'Transparansi kebijakan dan pengawalan anggaran penanganan infrastruktur jalan di Jawa Barat I.',
    tenantBrandHex: '#D97706',
    tenantId: 'a28b7732-8960-4dff-a3c9-be70c15492b6',
    variationKey: `live-chromium-${Date.now()}`,
  });

  console.log('AI Image & Copy generated in', Date.now() - start, 'ms!');
  console.log('Blueprint:', artCollage.blueprintId, 'Archetype:', artCollage.archetype);
  console.log('Headline:', artCollage.copy.headline);

  const tCompose = Date.now();
  const composed = await ChromiumPosterCompositor.compose({
    canvasBuffer: artCollage.imageBuffer,
    copy: artCollage.copy,
    zones: artCollage.layout,
    palette: {
      accentHex: artCollage.mutation.palette.accentHex,
      secondaryHex: artCollage.mutation.palette.secondaryHex,
    },
    signature: 'RENO S NUGRAHA — KOMISI DPR RI // JAWA BARAT I',
    editionTag: 'POLARIS // JAWA BARAT I',
    textToneHint: artCollage.layout.textTone,
  });

  console.log('Chromium rendered in', Date.now() - tCompose, 'ms!');
  console.log('Total pipeline time:', Date.now() - start, 'ms');
  console.log('Output size:', composed.sizeBytes, 'bytes');

  await fs.writeFile('uploads/test_renders/live_chromium_sukabumi.webp', composed.buffer);
  console.log('Saved to uploads/test_renders/live_chromium_sukabumi.webp');
}

testFullPipeline().catch(console.error);
