import { describe, it, expect } from 'vitest';
import {
  PosterBlueprintSelector,
  PosterPromptCompiler,
  POSTER_BLUEPRINT_CATALOG,
} from '../src/creative-poster/index.js';

describe('POLARIS Creative Poster Engine', () => {
  it('harus memuat katalog blueprint pre-analyzed lengkap dengan slot manifest', () => {
    expect(POSTER_BLUEPRINT_CATALOG.length).toBe(22);

    const streetTemplate = POSTER_BLUEPRINT_CATALOG.find((b) => b.archetype === 'STREET_JOURNALISM');
    expect(streetTemplate).toBeDefined();
    expect(streetTemplate?.slotManifest.slots.headlineBlock.fontFamily).toBe('Anton');
    expect(streetTemplate?.colorPalette.primaryAccent).toBe('#DC2626');

    const heroTemplate = POSTER_BLUEPRINT_CATALOG.find((b) => b.archetype === 'POP_OUT_HERO');
    expect(heroTemplate).toBeDefined();
    expect(heroTemplate?.slotManifest.slots.subjectPhoto.popOutEffect).toBe(true);
  });

  it('harus memilih blueprint secara acak (RNG) dan mematuhi excludeBlueprintId', () => {
    const picked1 = PosterBlueprintSelector.selectBestBlueprint({
      topic: 'Kritik kenaikan harga sembako di pasar tradisional pedagang kaki lima',
    });
    expect(picked1).toBeDefined();
    expect(POSTER_BLUEPRINT_CATALOG.map((b) => b.id)).toContain(picked1.id);

    // Roll kedua dengan exclude template sebelumnya harus menghasilkan template yang berbeda
    const picked2 = PosterBlueprintSelector.selectBestBlueprint({
      topic: 'Kritik kenaikan harga sembako di pasar tradisional pedagang kaki lima',
      excludeBlueprintId: picked1.id,
    });
    expect(picked2.id).not.toBe(picked1.id);
  });

  it('harus memilih blueprint POP_OUT_HERO jika dipaksa forcedArchetype', () => {
    const picked = PosterBlueprintSelector.selectBestBlueprint({
      topic: 'Topik umum apa saja',
      forcedArchetype: 'POP_OUT_HERO',
    });

    expect(picked.archetype).toBe('POP_OUT_HERO');
  });

  it('harus mengompilasi prompt dengan larangan keras teks dan instruksi zero-logo', async () => {
    const blueprint = POSTER_BLUEPRINT_CATALOG[0];
    const compiled = await PosterPromptCompiler.compileScenePrompt({
      topic: 'Pembangunan infrastruktur jalan desa terpencil',
      blueprint,
      tenantBrandHex: '#EA580C',
    });

    expect(compiled.englishPrompt).toContain('DO NOT generate any text');
    expect(compiled.englishPrompt).toContain('DO NOT generate any logos');
    expect(compiled.englishPrompt).toContain('#EA580C');
    expect(compiled.canvasDimensions.width).toBe(1080);
    expect(compiled.canvasDimensions.height).toBe(1350);
  }, 15000);
});
