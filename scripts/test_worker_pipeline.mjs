import fs from 'node:fs/promises';
import { ArtCollageCompositor } from '../packages/storage/dist/index.mjs';
import { ArtCollagePosterPipeline } from '../packages/ai-engine/dist/index.js';

async function testReal() {
  console.log('Testing ArtCollagePosterPipeline in worker environment...');
  try {
    const result = await ArtCollagePosterPipeline.generate({
      topic: 'Pemberian bibit padi dan pupuk subsidi bagi kelompok tani',
      groundedContextSummary: 'Dukungan ketahanan pangan melalui bibit padi dan pupuk subsidi di Jawa Barat.',
      tenantBrandHex: '#059669',
      tenantId: 'a28b7732-8960-4dff-a3c9-be70c15492b6',
      variationKey: 'test-real-1'
    });
    console.log('Pipeline succeeded! Blueprint:', result.blueprintId, 'Archetype:', result.archetype);
    console.log('Copy:', JSON.stringify(result.copy, null, 2));
    console.log('Layout:', JSON.stringify(result.layout, null, 2));
    console.log('Image buffer length:', result.imageBuffer?.length);

    console.log('Now testing Compositor...');
    const composed = await ArtCollageCompositor.compose({
      canvasBuffer: result.imageBuffer,
      copy: result.copy,
      zones: result.layout,
      palette: {
        accentHex: result.mutation.palette.accentHex,
        secondaryHex: result.mutation.palette.secondaryHex,
      },
      signature: 'RENO S NUGRAHA — KOMISI DPR RI // JAWA BARAT I',
      editionTag: 'POLARIS // JAWA BARAT I',
      textToneHint: result.layout.textTone,
    });
    console.log('Composed successfully! Size:', composed.sizeBytes);
    await fs.writeFile('uploads/test_renders/live_worker_test_result.webp', composed.buffer);
    console.log('Saved to uploads/test_renders/live_worker_test_result.webp');
  } catch (err) {
    console.error('ERROR in real pipeline:', err);
  }
}

testReal();
