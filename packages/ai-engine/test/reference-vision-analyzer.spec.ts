import { describe, it, expect } from 'vitest';
import { PosterReferenceVisionAnalyzer } from '../src/creative-poster/reference-vision-analyzer.js';

describe('PosterReferenceVisionAnalyzer', () => {
  it('harus memvalidasi dan men-sanitasi payload mentah menjadi PreAnalyzedPosterBlueprint yang valid', () => {
    const rawAiOutput = {
      name: 'Modern Civic Action',
      archetype: 'STREET_JOURNALISM',
      description: 'Gaya foto aksi jurnalistik lapangan dengan tipografi tebal',
      tags: ['civic', 'street', 'fieldwork'],
      aspectRatio: '4:5',
      colorPalette: {
        primaryAccent: '#DC2626',
        secondaryAccent: '#FEF08A',
        backgroundBase: '#0F172A',
        textColor: '#FFFFFF',
        surfaceMode: 'SCRIM_GRADIENT',
      },
      scenePromptHint: 'documentary photo of city council member inspecting flood wall',
      negativeSpaceZone: 'clean space on upper 35% for text placement',
      slotManifest: {
        canvas: { width: 1080, height: 1350, aspectRatio: '4:5' },
        slots: {
          headlineBlock: { x: 0.05, y: 0.08, w: 0.90, fontSizePx: 92 },
        },
      },
      fixedConstraints: {
        primaryAccentLocked: true,
        baseBackgroundTone: 'DARK',
        requiredFontFamilies: {
          headline: 'Bebas Neue',
          body: 'Plus Jakarta Sans',
        },
        imageNegativeAllow: ['border'],
        toneSafety: 'SERIOUS_ONLY',
      },
      variationRules: {
        allowedLayoutVariants: ['TOP_BANNER'],
        allowedHeaderPlacements: ['top'],
        allowedCardArrangements: ['stacked'],
      },
    };

    const blueprint = (PosterReferenceVisionAnalyzer as any).validateAndSanitizeBlueprint(
      rawAiOutput,
      'test-ref-01.png'
    );

    expect(blueprint).toBeDefined();
    expect(blueprint.id).toContain('TPL-23-');
    expect(blueprint.referenceFile).toBe('test-ref-01.png');
    expect(blueprint.archetype).toBe('STREET_JOURNALISM');
    expect(blueprint.colorPalette.primaryAccent).toBe('#DC2626');
    expect(blueprint.fixedConstraints.baseBackgroundTone).toBe('DARK');
    expect(blueprint.variationRules.allowedLayoutVariants).toContain('TOP_BANNER');
  });

  it('harus jatuh ke fallback default jika output AI tidak menyertakan arketipe valid atau palet warna rusak', () => {
    const invalidOutput = {
      name: 'Unrecognized Style',
      archetype: 'ALIEN_FUTURISTIC_CYBERPUNK_INVALID',
      // colorPalette hilang
    };

    const blueprint = (PosterReferenceVisionAnalyzer as any).validateAndSanitizeBlueprint(
      invalidOutput,
      'corrupt-image.jpg'
    );

    expect(blueprint).toBeDefined();
    // Arketipe wajib fallback ke POP_OUT_HERO
    expect(blueprint.archetype).toBe('POP_OUT_HERO');
    // Palet warna harus terisi dengan nilai default
    expect(blueprint.colorPalette).toBeDefined();
    expect(blueprint.colorPalette.primaryAccent).toBe('#EA580C');
    expect(blueprint.colorPalette.backgroundBase).toBe('#0F172A');
    // Scene prompt hint wajib memiliki default yang mencegah teks dalam gambar
    expect(blueprint.scenePromptHint).toContain('zero text');
  });
});
