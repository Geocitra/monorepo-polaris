import { describe, it, expect, vi } from 'vitest';
import {
  PosterBlueprintSelector,
  PosterPromptCompiler,
  POSTER_BLUEPRINT_CATALOG,
} from '../src/creative-poster/index.js';
import { openaiClient } from '../src/client.js';

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
    expect(compiled.englishPrompt).not.toMatch(/#[0-9a-fA-F]{3,6}\b/);
    expect(compiled.canvasDimensions.width).toBe(1080);
    expect(compiled.canvasDimensions.height).toBe(1350);
  }, 15000);

  it('harus mengonversi kode warna HEX ke nama warna alami tanpa mencetak #HEX', () => {
    expect(PosterPromptCompiler.hexToNaturalColorName('#DC2626')).toBe('deep crimson red');
    expect(PosterPromptCompiler.hexToNaturalColorName('#0F172A')).toBe('deep midnight navy');
    expect(PosterPromptCompiler.hexToNaturalColorName('#F8FAFC')).toBe('clean alabaster white');
    expect(PosterPromptCompiler.hexToNaturalColorName('#0A0A0A')).toBe('deep charcoal black');
    expect(PosterPromptCompiler.hexToNaturalColorName(undefined)).toBe('neutral tone');
  });

  it('harus membersihkan prompt dari istilah grafis dan kode HEX liar', () => {
    const dirtyPrompt =
      'The upper 45% of the canvas MUST be clean negative space for giant manifesto typography with accent (#DC2626) and editorial summary cards for newspaper headline.';
    const cleaned = PosterPromptCompiler.sanitizeImageGenerationPrompt(dirtyPrompt);

    expect(cleaned).not.toMatch(/#[0-9a-fA-F]{3,6}\b/);
    expect(cleaned).not.toMatch(/\btypography\b/i);
    expect(cleaned).not.toMatch(/\bcards\b/i);
    expect(cleaned).not.toMatch(/\bheadline\b/i);
    expect(cleaned).not.toMatch(/\bnewspaper\b/i);
  });

  it('harus memvalidasi Zero HEX Leak & Zero UI Trigger Leak untuk SELURUH 22 blueprint katalog', async () => {
    vi.spyOn(PosterPromptCompiler, 'synthesizeEditorialCopyAndVisuals').mockImplementation(
      async (topic, blueprint) => ({
        layoutVariant: 'TOP_BANNER',
        headerPlacement: 'top',
        cardArrangement: 'stacked',
        colorMood: 'EMERALD',
        primaryAccent: blueprint.colorPalette.primaryAccent,
        secondaryAccent: blueprint.colorPalette.secondaryAccent,
        mainBannerTitle: 'JUDUL UJI COBA',
        blocks: {},
      })
    );

    for (const blueprint of POSTER_BLUEPRINT_CATALOG) {
      const compiled = await PosterPromptCompiler.compileScenePrompt({
        topic: 'Modernisasi sistem irigasi persawahan berkelanjutan di pedesaan',
        blueprint,
        tenantBrandHex: '#DC2626',
      });

      // Asersi 1 (Zero HEX Leak): Pastikan TIDAK mengandung regex kode HEX (#...)
      expect(compiled.englishPrompt).not.toMatch(/#[0-9a-fA-F]{3,6}\b/);

      // Asersi 2 (Zero UI/Text Trigger Leak):
      // Ambil deskripsi adegan di luar blok mandat [CRITICAL ZERO-HUMAN / ZERO-TEXT / ZERO-COORDINATE MANDATE]
      const mandateHeader = '[CRITICAL ZERO-HUMAN / ZERO-TEXT / ZERO-COORDINATE MANDATE]';
      const scenePart = compiled.englishPrompt.split(mandateHeader)[0] || '';

      const forbiddenKeywords = [
        'headline',
        'headlines',
        'subheading',
        'typography',
        'typographic',
        'masthead',
        'card',
        'cards',
        'newspaper',
        'poster',
        'callout',
      ];

      for (const word of forbiddenKeywords) {
        const regex = new RegExp(`\\b${word}\\b`, 'i');
        const match = scenePart.match(regex);
        if (match) {
          throw new Error(
            `Prompt Leakage terdeteksi pada blueprint "${blueprint.name}" (${blueprint.archetype})! Kata terlarang ditemukan: "${match[0]}" di dalam prompt:\n${scenePart}`
          );
        }
        expect(scenePart).not.toMatch(regex);
      }
    }
    vi.restoreAllMocks();
  });

  describe('Fase 2: Grounding Data Nyata & Word-Safe Micro-Copywriting', () => {
    it('harus mempertahankan kata "INFRASTRUKTUR BERKELANJUTAN" (27 karakter) secara utuh tanpa terpotong "BERKELANJUTA"', () => {
      const title = 'INFRASTRUKTUR BERKELANJUTAN';
      const truncated = PosterPromptCompiler.wordSafeHeadlineTruncate(title, 34);
      expect(truncated).toBe('INFRASTRUKTUR BERKELANJUTAN');
      expect(truncated.endsWith('BERKELANJUTA')).toBe(false);
      expect(truncated.endsWith('BERKELANJUTAN')).toBe(true);
      expect(truncated).not.toContain('...');
    });

    it('harus memotong pada batas kata tanpa memotong tengah kata dan tanpa tanda ellipsis', () => {
      const longTitle = 'INFRASTRUKTUR BERKELANJUTAN MENUJU DAERAH MAJU DAN SEJAHTERA';
      const truncated = PosterPromptCompiler.wordSafeHeadlineTruncate(longTitle, 34);
      expect(truncated.length).toBeLessThanOrEqual(34);
      expect(truncated).toBe('INFRASTRUKTUR BERKELANJUTAN MENUJU');
      expect(truncated).not.toContain('...');
    });

    it('harus mengeliminasi angka kembar template "120+", "28 Unit", "1.450" dari fallback statCircles', async () => {
      vi.spyOn(openaiClient.chat.completions, 'create').mockRejectedValueOnce(
        new Error('Network timeout to test fallback')
      );

      const blueprint = POSTER_BLUEPRINT_CATALOG[0];
      const copy = await PosterPromptCompiler.synthesizeEditorialCopyAndVisuals(
        'Pengawasan Distribusi Pupuk Subsidi Petani Desa',
        blueprint
      );

      expect(copy.statCircles).toBeDefined();
      expect(copy.statCircles?.length).toBe(3);

      const allValues = copy.statCircles?.map((s) => s.value) || [];
      const allTopLabels = copy.statCircles?.map((s) => s.topLabel) || [];

      // Dilarang memuat nilai template 120+, 28, 1.450
      expect(allValues).not.toContain('120+');
      expect(allValues).not.toContain('28 Unit');
      expect(allValues).not.toContain('28');
      expect(allValues).not.toContain('1.450');

      // TopLabel harus 1 kata pendek tanpa titik-titik (...)
      for (const label of allTopLabels) {
        expect(label).not.toContain('...');
        expect(label.length).toBeLessThanOrEqual(11);
      }
    });

    it('harus memotong kalimat tuntas dengan smartSentenceClamp tanpa tanda titik-titik (...) menggantung', () => {
      const longText =
        'Kebijakan pengawasan distribusi pupuk subsidi bertujuan meningkatkan produktivitas hasil tani daerah konstituen secara berkesinambungan dan terpadu';
      const clamped = PosterPromptCompiler.smartSentenceClamp(longText, 85);
      expect(clamped.endsWith('.')).toBe(true);
      expect(clamped).not.toContain('...');
      expect(clamped.length).toBeLessThanOrEqual(86);
    });
  });

  describe('Fase 3: Crop Compensation Dinamis Berdasarkan Image Provider', () => {
    it('harus TIDAK menerapkan kompensasi +12% jika provider adalah GOOGLE_IMAGEN (native 4:5)', async () => {
      vi.spyOn(PosterPromptCompiler, 'synthesizeEditorialCopyAndVisuals').mockResolvedValueOnce({
        layoutVariant: 'TOP_BANNER',
        headerPlacement: 'top',
        cardArrangement: 'stacked',
        colorMood: 'EMERALD',
        primaryAccent: '#EA580C',
        secondaryAccent: '#FB923C',
        mainBannerTitle: 'JUDUL UJI COBA',
        blocks: {},
      });

      const compiled = await PosterPromptCompiler.compileScenePrompt({
        topic: 'Modernisasi sistem irigasi persawahan berkelanjutan di pedesaan',
        blueprint: POSTER_BLUEPRINT_CATALOG[0],
        imageProvider: 'GOOGLE_IMAGEN',
      });

      // Pada Google Imagen, upper clearance adalah native 35% dan bottom 22%, bukan 47% dan 34%
      expect(compiled.englishPrompt).toContain('The upper 35% of the canvas MUST be an uncluttered');
      expect(compiled.englishPrompt).toContain('The bottom 22% MUST provide a quiet');
      expect(compiled.englishPrompt).not.toContain('The upper 47% of the canvas');
      expect(compiled.englishPrompt).not.toContain('The bottom 34% MUST provide a quiet');
    });

    it('harus menerapkan kompensasi +12% jika provider adalah OPENAI_DALLE (pre-crop 9:16 -> 4:5)', async () => {
      vi.spyOn(PosterPromptCompiler, 'synthesizeEditorialCopyAndVisuals').mockResolvedValueOnce({
        layoutVariant: 'TOP_BANNER',
        headerPlacement: 'top',
        cardArrangement: 'stacked',
        colorMood: 'EMERALD',
        primaryAccent: '#EA580C',
        secondaryAccent: '#FB923C',
        mainBannerTitle: 'JUDUL UJI COBA',
        blocks: {},
      });

      const compiled = await PosterPromptCompiler.compileScenePrompt({
        topic: 'Modernisasi sistem irigasi persawahan berkelanjutan di pedesaan',
        blueprint: POSTER_BLUEPRINT_CATALOG[0],
        imageProvider: 'OPENAI_DALLE',
      });

      // Pada DALL-E, upper clearance dikompensasi +12% menjadi 47% (35% + 12%) dan bottom menjadi 34% (22% + 12%)
      expect(compiled.englishPrompt).toContain('The upper 47% of the canvas MUST be an uncluttered');
      expect(compiled.englishPrompt).toContain('The bottom 34% MUST provide a quiet');
    });

    it('harus membuang blueprint VIRAL_ONLY ketika topik bertema krisis, bencana, atau duka (Tone Guard)', () => {
      const crisisTopics = [
        'Bencana banjir bandang dan tanah longsor di kawasan pegunungan',
        'Duka cita mendalam atas wafatnya tokoh daerah',
        'Krisis darurat kesehatan dan evakuasi korban kebakaran',
      ];

      for (const topic of crisisTopics) {
        // Uji berulang untuk memastikan pool yang tersaring tidak pernah menghasilkan VIRAL_ONLY
        for (let i = 0; i < 5; i++) {
          const selected = PosterBlueprintSelector.selectBestBlueprint({ topic });
          expect(selected.fixedConstraints?.toneSafety).not.toBe('VIRAL_ONLY');
        }
      }
    });
  });
});

