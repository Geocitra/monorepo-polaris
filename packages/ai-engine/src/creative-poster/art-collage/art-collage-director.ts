/**
 * POLARIS Art-Collage Director
 *
 * Otak 1 (Teks)   : synthesizeCopy()   -> headline, deck, poin, + visualSubject (topik sama).
 * Otak 2 (Visual) : compileImagePrompt() -> prompt kolase seni UTUH (tekstur, halftone, kuas)
 *                   dengan bidang kertas kosong yang dijelaskan dalam BAHASA ALAMI (tanpa angka
 *                   koordinat, supaya tidak tercetak di kanvas seperti kasus "x: 5%-38%").
 *
 * Anti-kembar 300 poster/hari: DNA gaya TETAP per arketipe, sedangkan anchor ruang teks dan
 * palet tinta DIMUTASI per generasi (seeded RNG, reproducible untuk audit).
 */

import { openaiClient, routerClient, normalizeGeminiModel } from '../../client.js';
import { MasterEditorialSanitizer } from '../../master-editorial-sanitizer.js';
import type { CreativePosterArchetype } from '../types.js';
import { isInfographicArchetype } from '@polaris/shared-types';
import { db, studioAiLearnedMemories, eq, and, desc, or } from '@polaris/database';
import type {
  ArtCollageAnchor,
  ArtCollageCopy,
  ArtCollageDna,
  ArtCollageInkPalette,
  ArtCollageMutation,
} from './art-collage.types.js';

// =============================================================================
// 1. DNA GAYA PER ARKETIPE (TETAP)
// =============================================================================
// Ditulis berdasarkan wujud visual file referensi di uploads/references/poster/,
// bukan dari deskripsi lama catalog.ts (yang terbukti melenceng untuk beberapa arketipe).
export const ART_COLLAGE_DNA: Record<CreativePosterArchetype, ArtCollageDna> = {
  POP_OUT_HERO: {
    style:
      'cinematic editorial print on warm grainy off-white paper with soft vignette; one rectangular documentary photograph placed as a clean panel, and the main subject physically breaking out of the photo frame edge, overlapping onto the paper with a soft contact shadow',
    anchors: ['TEXT_TOP', 'TEXT_BOTTOM'],
    paperTone: 'LIGHT',
  },
  STREET_JOURNALISM: {
    style:
      'retro street-journalism risograph collage on cream newsprint with faint ruled lines; black-and-white halftone photocopy cutouts of people and objects with rough scissor-cut edges, a bold distressed dry-brush paint splash behind the cutouts, fine topographic contour lines, and a strip of high-contrast halftone street buildings along one edge',
    anchors: ['TEXT_LEFT', 'TEXT_RIGHT', 'TEXT_TOP'],
    paperTone: 'LIGHT',
  },
  STATEMENT_PROFILE: {
    style:
      'dark moody biographical editorial print with heavy film grain; a single anonymous figure seen from behind or in silhouette standing in the center, a thin hand-drawn white timeline line curving across the lower area',
    anchors: ['TEXT_TOP', 'TEXT_BOTTOM'],
    paperTone: 'DARK',
  },
  RETRO_CAMPAIGN: {
    style:
      'textured blue vintage event poster with paper grain and subtle halftone; two anonymous figures as duotone photo cutouts, decorative retro ornaments, warm worn print texture',
    anchors: ['TEXT_TOP', 'TEXT_BOTTOM'],
    paperTone: 'DARK',
  },
  TORN_PAPER_NEWS: {
    style:
      'torn-paper broadsheet collage: a vertical rip through aged newsprint reveals a dramatic documentary photograph underneath, ragged white paper fibers along the torn edges, soft drop shadows, ink smudges and press grain',
    anchors: ['TEXT_LEFT', 'TEXT_RIGHT'],
    paperTone: 'LIGHT',
  },
  RETRO_SPLIT_MITIGATION: {
    style:
      'retro infographic print with horizontal color ribbons and a round magnifying-glass lens revealing a detailed halftone illustration, aged cream paper, 1970s offset printing texture',
    anchors: ['TEXT_TOP', 'TEXT_LEFT'],
    paperTone: 'LIGHT',
  },
  MODULAR_GRID_CARDS: {
    style:
      'cream paper editorial collage with several small black-and-white photographs arranged with generous gutters, each photo accented by a small solid color block, crisp offset print texture',
    anchors: ['TEXT_TOP', 'TEXT_LEFT'],
    paperTone: 'LIGHT',
  },
  CONSTRUCTIVIST_BAUHAUS: {
    style:
      'Bauhaus constructivist screenprint: bold geometric blocks, circles and diagonal bands, worn silkscreen texture with slight misregistration, aged paper',
    anchors: ['TEXT_TOP', 'TEXT_BOTTOM', 'TEXT_LEFT'],
    paperTone: 'LIGHT',
  },
  THRESHOLD_RISOGRAPH: {
    style:
      'comic-panel threshold print: three panels framed by thick black outlines, photos converted to hard threshold black-and-white with flat red and yellow fills, gritty photocopy noise',
    anchors: ['TEXT_TOP', 'TEXT_BOTTOM'],
    paperTone: 'LIGHT',
  },
  SWISS_DUOTONE_EDITORIAL: {
    style:
      'minimal black-and-white editorial: one half of the canvas is a high-contrast monochrome photograph, the other half is clean white paper, separated by a crisp vertical boundary',
    anchors: ['TEXT_LEFT', 'TEXT_RIGHT'],
    paperTone: 'LIGHT',
  },
  ISOMETRIC_CREATIVE_COLLAGE: {
    style:
      'top-down flat-lay of a creative work desk with tools and papers on a split diagonal background of black and cream, soft studio shadows, tactile paper texture',
    anchors: ['TEXT_BOTTOM', 'TEXT_RIGHT'],
    paperTone: 'LIGHT',
  },
  STORYBOOK_ILLUSTRATED: {
    style:
      'vintage hand-painted storybook illustration on old folded paper with crease marks, sketchy ink lines and soft gouache colors, wide open painted sky',
    anchors: ['TEXT_TOP'],
    paperTone: 'LIGHT',
  },
  TYPOGRAPHIC_MASK: {
    style:
      'ultra-minimal gallery print: one strong photograph occupying a compact area surrounded by large clean white paper margins, subtle paper grain',
    anchors: ['TEXT_TOP', 'TEXT_BOTTOM'],
    paperTone: 'LIGHT',
  },
  KINETIC_MOTION: {
    style:
      'grainy beige recycled-paper poster with dust specks; a rectangular photo panel of blue sky with white clouds and distressed print wear, a dynamic anonymous figure in mid-jump breaking out of the panel edge, a black grunge starburst shape and a small line-art globe icon on the paper',
    anchors: ['TEXT_TOP', 'TEXT_BOTTOM'],
    paperTone: 'LIGHT',
  },
  EXECUTIVE_SEMINAR: {
    style:
      'deep maroon seminar poster with a large faded double-exposure silhouette in the background, subtle grain and soft vignette, dignified and formal',
    anchors: ['TEXT_BOTTOM', 'TEXT_TOP'],
    paperTone: 'DARK',
  },
  TORN_VISION: {
    style:
      'horizontal torn-paper collage splitting two photographs, ragged white paper edges with fibers and shadows, high-contrast photographic treatment',
    anchors: ['TEXT_TOP', 'TEXT_BOTTOM'],
    paperTone: 'LIGHT',
  },
  GALLERY_EXHIBITION: {
    style:
      'classic damask wallpaper wall with an ornate gold picture frame, dramatic museum lighting, a shadow silhouette in front of the frame, rich warm tones',
    anchors: ['TEXT_BOTTOM', 'TEXT_TOP'],
    paperTone: 'DARK',
  },
  POP_MAGAZINE_COLLAGE: {
    style:
      'street-pop zine collage: halftone photo cutouts, sticker shapes, bold flat color blocks, tape strips and paper grain, energetic layered composition',
    anchors: ['TEXT_TOP', 'TEXT_BOTTOM', 'TEXT_LEFT'],
    paperTone: 'LIGHT',
  },
  POLAROID_ADVENTURE: {
    style:
      'adventure poster with a single white Polaroid-style instant photo frame tilted slightly on textured kraft paper, warm earth-tone landscape photo inside the frame, tape and soft shadows',
    anchors: ['TEXT_BOTTOM', 'TEXT_TOP'],
    paperTone: 'LIGHT',
  },
  VINTAGE_PERSONA_GAZETTE: {
    style:
      'antique cream newspaper page with sepia press texture, one framed central documentary photograph, wide empty paper columns on both sides, foxing stains and fold marks',
    anchors: ['TEXT_LEFT', 'TEXT_RIGHT'],
    paperTone: 'LIGHT',
  },
  BROADSHEET_NEWSPAPER: {
    style:
      'clean white newspaper page with a documentary photograph cropped inside a tilted diamond shape, fine ink press texture, generous empty paper margins',
    anchors: ['TEXT_TOP', 'TEXT_BOTTOM'],
    paperTone: 'LIGHT',
  },
    TECHNICAL_GRID_CALLOUT: {
    style:
      'off-white dotted grid paper; a black-and-white photo cutout of an anonymous figure at the bottom with a thick colored outline stroke around the silhouette, hand-drawn dashed curved arrows and highlighter marks',
    anchors: ['TEXT_TOP'],
    paperTone: 'LIGHT',
  },
  INFOGRAPHIC_NARRATIVE_WAVE: {
    style:
      'authentic Indonesian editorial broadsheet infographic artwork matching the gold reference standard (Humana / Sukabumi): warm textured cream newsprint paper (#F8F6F0), featuring a rich mixed-media editorial montage with 2 to 4 authentic Indonesian documentary photographs/cutouts: pure isolated silhouette cutout of citizen portrait at upper-left strictly a head/collar bust above Y=32% with zero rice stalks, zero crops, zero held plants, zero tools, zero books extending below chin, reaching hand at upper-right strictly at X >= 88% and above Y=30%, slender diagonal crowd faces ribbon across the center, and community figures in the lower section. The composition features dedicated content placement surfaces built directly into the artwork: a massive sweeping solid deep crimson-red color field (#991B1B) covering the right-hand flank with broad smooth ink surfaces prepared specifically for direct white typography without cards, and a completely flat clean cream paper clearing on the lower-left (Y: 32% down to 95%, X: 0% to 48%) strictly sterile and reserved for direct dark-ink data visualization and donut charts. The canvas has ZERO ghost numbers ("01", "02", "03", "04", "05", "06"), zero diagram digits ("1", "2", "3", "4"), zero watermark numerals, zero drawn horizontal bars, zero black stripes, zero floating cards, zero UI boxes, zero drop-shadow containers, zero text, zero numbers, and zero charts on the artwork background.',
    anchors: ['TEXT_TOP', 'TEXT_BOTTOM'],
    paperTone: 'LIGHT',
    allowMultiImage: true,
    targetPhotoCount: 3,
  },
  INFOGRAPHIC_CHRONICLE_GRID: {
    style:
      'authentic Indonesian newspaper chronicle multi-photo archival grid on warm cream newsprint paper matching template-02-biography-timeline-grid, featuring 4 distinct high-resolution authentic Indonesian documentary photographs arranged cleanly in a 2x2 quadrant grid (Top-Left, Top-Right, Bottom-Left, Bottom-Right) with clean thin cream borders and ZERO text on the photos',
    anchors: ['TEXT_RIGHT', 'TEXT_TOP'],
    paperTone: 'LIGHT',
    allowMultiImage: true,
    targetPhotoCount: 4,
  },
  INFOGRAPHIC_RADIAL_CLOCK: {
    style:
      'vintage educational radial chronicle multi-photo archival sheet on warm aged sepia parchment paper matching template-03-radial-clock-chronicle, featuring 4 distinct high-resolution authentic Indonesian documentary photographs arranged cleanly in a 2x2 quadrant grid (Top-Left, Top-Right, Bottom-Left, Bottom-Right) with warm parchment borders and ZERO text on the photos',
    anchors: ['TEXT_RIGHT', 'TEXT_TOP'],
    paperTone: 'LIGHT',
    allowMultiImage: true,
    targetPhotoCount: 4,
  },
  INFOGRAPHIC_ADVOCACY_PILLARS: {
    style:
      'civic advocacy editorial artwork on warm terracotta and golden amber backdrop (#C25E2B / #EA580C) with subtle traditional Indonesian batik motif watermark (zero generic outdoor drone scenery or empty rice terrace landscape), featuring a warm editorial illustration or portrait cutout of grassroots citizens anchored strictly in the middle-right window (between Y=32% and 56%), leaving the top 22%, middle-left, and entire lower 42% of the canvas as clean, unobstructed warm surfaces for direct data cards and 5 vertical action pillars',
    anchors: ['TEXT_TOP', 'TEXT_BOTTOM'],
    paperTone: 'DARK',
  },
  INFOGRAPHIC_VISIONARY_TIMELINE: {
    style:
      'contemporary minimal monochrome editorial artwork on cool light grey textured broadsheet paper with subtle horizontal milestone line, with ONLY 1 single compact documentary photograph anchored in the middle-left window (max 25% area), leaving 75% of the canvas (the entire top header band, lower half, and right-hand expanse) as a calm, clean, unobstructed open paper surface for direct timeline typography',
    anchors: ['TEXT_TOP', 'TEXT_BOTTOM'],
    paperTone: 'LIGHT',
  },
  INFOGRAPHIC_EDITORIAL_COLLAGE: {
    style:
      'risograph zine collage educational artwork on warm ivory paper with layered geometric teal and mustard color block accents, with ONLY 1 single compact documentary cutout anchored strictly in the middle-right margin (max 25% area), leaving 75% of the canvas (the entire top, entire lower section, and left-hand 70% of the canvas) as a clean, calm, unobstructed ivory paper surface for direct typography',
    anchors: ['TEXT_LEFT', 'TEXT_TOP'],
    paperTone: 'LIGHT',
  },
  INFOGRAPHIC_HISTORICAL_EXPEDITION: {
    style:
      'archival chronicle artwork on warm aged sepia parchment paper with an antique nautical compass and weathered cartographic textures, with ONLY 1 single compact documentary vignette in a subtle vintage frame in the middle-left window (max 25% area), leaving the entire top header/title/deck band, the entire right-hand column, and the entire lower parchment expanse (75% of the canvas) completely empty, clean, and unobstructed for direct archival ink typography',
    anchors: ['TEXT_RIGHT', 'TEXT_TOP'],
    paperTone: 'LIGHT',
  },
  INFOGRAPHIC_PUNK_ZINE: {
    style:
      'raw eco-punk zine halftone risograph artwork on deep charcoal textured paper with acid lime and hot pink ink splatters, ONLY 1 single compact high-contrast halftone documentary cutout anchored strictly in the lower-right corner (max 24% area), leaving 76% of the canvas (entire top, left, and center) as a clean, calm, unobstructed dark charcoal paper surface for direct typography',
    anchors: ['TEXT_LEFT', 'TEXT_TOP'],
    paperTone: 'DARK',
  },
  INFOGRAPHIC_HERITAGE_EDITORIAL: {
    style:
      'warm authentic Indonesian editorial documentary artwork on woven cream linen paper with elegant deep maroon borders, with ONLY 1 single compact documentary photograph neatly framed in the middle-left window (between 26% and 60% vertical height, max 25% total area), leaving 75% of the canvas (the entire top 25% header/headline/deck zone, the entire right-hand 58% column, and the entire lower 38% section) as a 100% flat, empty, clean, unobstructed warm cream linen paper surface for direct typography with zero corner ribbons and zero second photos',
    anchors: ['TEXT_LEFT', 'TEXT_TOP'],
    paperTone: 'LIGHT',
  },
  INFOGRAPHIC_INDIGENOUS_ADVOCACY: {
    style:
      'rich anthropological documentary editorial artwork on deep warm earthy espresso-brown textured paper with organic woven noken fiber accents, with ONLY 1 single authentic Indonesian community documentary cutout anchored strictly in the lower-left window (max 25% area), leaving 75% of the canvas (entire top header/deck band and entire right-hand expanse) as a calm, completely empty, unobstructed dark earth-toned paper surface for direct typography',
    anchors: ['TEXT_RIGHT', 'TEXT_TOP'],
    paperTone: 'DARK',
  },
  INFOGRAPHIC_CLASSICAL_MONUMENT: {
    style:
      'prestigious monumental editorial broadsheet on warm aged sandstone parchment paper with classical Roman arch and pillar textures, featuring ONLY 1 single authentic Indonesian documentary subject or civic architecture cutout anchored strictly in the lower-left corner (occupying at most 26% of the canvas area), leaving 74% of the canvas (the entire top header band, center, and entire right-hand expanse from top to bottom) as a completely empty, smooth, unobstructed warm sandstone parchment surface for direct typography',
    anchors: ['TEXT_RIGHT', 'TEXT_TOP'],
    paperTone: 'LIGHT',
  },
  INFOGRAPHIC_RETRO_SUNBURST: {
    style:
      'warm vintage chronicle editorial artwork on cream newsprint paper with bold radiating retro amber-orange sunburst rays, ONLY 1 single compact archival documentary cutout anchored strictly in the middle-left window (between 26% and 56% vertical height, max 25% area), leaving 75% of the canvas (entire top 25% band, entire right-hand half, and entire lower 42% half) as a clean, open, unobstructed warm cream paper surface for direct typography',
    anchors: ['TEXT_TOP', 'TEXT_BOTTOM'],
    paperTone: 'LIGHT',
  },
};

// =============================================================================
// 2. PALET TINTA CETAK (DIMUTASI)
// =============================================================================
export const ART_COLLAGE_INK_PALETTES: ArtCollageInkPalette[] = [
  { id: 'INK-TERRACOTTA', accentName: 'terracotta red', secondaryName: 'charcoal black', paperName: 'warm cream', accentHex: '#B83A1B', secondaryHex: '#1C1917' },
  { id: 'INK-OCHRE', accentName: 'ochre gold', secondaryName: 'charcoal black', paperName: 'aged ivory', accentHex: '#C98A12', secondaryHex: '#1C1917' },
  { id: 'INK-EMERALD', accentName: 'forest emerald green', secondaryName: 'deep ink black', paperName: 'warm sand', accentHex: '#1F6F50', secondaryHex: '#14201B' },
  { id: 'INK-COBALT', accentName: 'cobalt blue', secondaryName: 'deep navy', paperName: 'alabaster white', accentHex: '#1E4FA8', secondaryHex: '#0F1A33' },
  { id: 'INK-TEAL-MUSTARD', accentName: 'vintage teal', secondaryName: 'mustard yellow', paperName: 'soft beige', accentHex: '#1B6B6B', secondaryHex: '#D4A017' },
  { id: 'INK-BURGUNDY', accentName: 'burgundy red', secondaryName: 'bone white', paperName: 'bone white', accentHex: '#7A1E2C', secondaryHex: '#2A1A1C' },
  { id: 'INK-ORANGE-OLIVE', accentName: 'burnt orange', secondaryName: 'vintage olive', paperName: 'kraft beige', accentHex: '#D2601A', secondaryHex: '#4B5320' },
  { id: 'INK-SIGNAL-RED', accentName: 'signal red', secondaryName: 'jet black', paperName: 'grainy beige', accentHex: '#D7261E', secondaryHex: '#111111' },
];

// =============================================================================
// 3. MESIN MUTASI (SEEDED RNG)
// =============================================================================
function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function seedFromString(input: string): number {
  let h = 2166136261;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

export function pickArtCollageMutation(
  archetype: CreativePosterArchetype,
  seed: number = Math.floor(Math.random() * 2 ** 31),
  options?: { forcedPaletteId?: string; topic?: string }
): ArtCollageMutation {
  const rng = mulberry32(seed);
  const dna = ART_COLLAGE_DNA[archetype];
  const anchors = dna.anchors.length > 0 ? dna.anchors : (['TEXT_TOP'] as ArtCollageAnchor[]);
  const anchor = anchors[Math.floor(rng() * anchors.length)] ?? 'TEXT_TOP';
  
  let forced = options?.forcedPaletteId
    ? ART_COLLAGE_INK_PALETTES.find((p) => p.id === options.forcedPaletteId)
    : undefined;

  // Cerdas kontekstual & anti-monoton: pilih palet berdasarkan domain topik jika tidak dipaksa
  if (!forced && options?.topic) {
    const t = options.topic.toLowerCase();
    if (/pangan|tani|panen|produksi|swasembada|bibit|pupuk|sawah|hutan|lingkungan|iklim|hijau|alam/.test(t)) {
      // Pertanian / Pangan / Lingkungan -> Forest Emerald Green (#1F6F50), Burnt Orange Olive (#D2601A), atau Ochre Gold
      const greenPalettes = ['INK-EMERALD', 'INK-ORANGE-OLIVE', 'INK-OCHRE'];
      const pickId = greenPalettes[Math.floor(rng() * greenPalettes.length)];
      forced = ART_COLLAGE_INK_PALETTES.find((p) => p.id === pickId);
    } else if (/sekolah|guru|siswa|kuliah|didik|pendidikan|beasiswa|riset|laut|maritim|air|nelayan|bahari/.test(t)) {
      // Pendidikan / Riset / Kelautan -> Cobalt Blue (#1E4FA8) atau Vintage Teal (#1B6B6B)
      const bluePalettes = ['INK-COBALT', 'INK-TEAL-MUSTARD'];
      const pickId = bluePalettes[Math.floor(rng() * bluePalettes.length)];
      forced = ART_COLLAGE_INK_PALETTES.find((p) => p.id === pickId);
    } else if (/jalan|rusak|jembatan|aspal|infrastruktur|transportasi|konstruksi|proyek|tata ruang/.test(t)) {
      // Infrastruktur / Jalan / Konstruksi -> Burgundy Red (#7A1E2C) atau Signal Red (#D7261E)
      const redPalettes = ['INK-BURGUNDY', 'INK-SIGNAL-RED', 'INK-TERRACOTTA'];
      const pickId = redPalettes[Math.floor(rng() * redPalettes.length)];
      forced = ART_COLLAGE_INK_PALETTES.find((p) => p.id === pickId);
    } else if (/umkm|pasar|ekonomi|anggaran|dana|pajak|investasi|dagang|wisata|budaya|seni/.test(t)) {
      // Ekonomi / UMKM / Budaya -> Terracotta (#B83A1B) atau Ochre Gold (#C98A12)
      const warmPalettes = ['INK-TERRACOTTA', 'INK-OCHRE', 'INK-BURGUNDY'];
      const pickId = warmPalettes[Math.floor(rng() * warmPalettes.length)];
      forced = ART_COLLAGE_INK_PALETTES.find((p) => p.id === pickId);
    }
  }

  const palette =
    forced ?? ART_COLLAGE_INK_PALETTES[Math.floor(rng() * ART_COLLAGE_INK_PALETTES.length)]!;
  return { seed, anchor, palette };
}

// =============================================================================
// 4. BAHASA SPASIAL ALAMI (TANPA ANGKA)
// =============================================================================
const ANCHOR_SPATIAL_PHRASE: Record<ArtCollageAnchor, { art: string; clearing: string }> = {
  TEXT_LEFT: {
    art: 'Concentrate all imagery, cutouts and paint marks in the right half of the composition.',
    clearing:
      'The entire left half is a calm, wide, empty stretch of the plain paper itself: no figures, no objects, no paint, no lines, no marks.',
  },
  TEXT_RIGHT: {
    art: 'Concentrate all imagery, cutouts and paint marks in the left half of the composition.',
    clearing:
      'The entire right half is a calm, wide, empty stretch of the plain paper itself: no figures, no objects, no paint, no lines, no marks.',
  },
  TEXT_TOP: {
    art: 'Concentrate all imagery, cutouts and paint marks in the lower part of the composition.',
    clearing:
      'The upper part, roughly the top third, is a calm, wide, empty band of the plain paper itself: no figures, no objects, no paint, no lines, no marks.',
  },
  TEXT_BOTTOM: {
    art: 'Concentrate all imagery, cutouts and paint marks in the upper part of the composition.',
    clearing:
      'The lower part, roughly the bottom third, is a calm, wide, empty band of the plain paper itself: no figures, no objects, no paint, no lines, no marks.',
  },
};

export function compileArtCollageImagePrompt(params: {
  archetype: CreativePosterArchetype;
  mutation: ArtCollageMutation;
  visualSubject: string;
  withStyleReference: boolean;
  remedyPrompt?: string;
}): string {
  const dna = ART_COLLAGE_DNA[params.archetype];
  const spatial = ANCHOR_SPATIAL_PHRASE[params.mutation.anchor];
  const p = params.mutation.palette;
  const isInfographic = isInfographicArchetype(params.archetype);

  const remedyClause = params.remedyPrompt
    ? `CRITICAL CORRECTIVE MANDATE FROM AI CRITIC (PRIORITY OVERRIDE):\n${params.remedyPrompt}\n`
    : '';

  if (isInfographic) {
    if (params.archetype === 'INFOGRAPHIC_CHRONICLE_GRID' || params.archetype === 'INFOGRAPHIC_RADIAL_CLOCK') {
      const isRadialClock = params.archetype === 'INFOGRAPHIC_RADIAL_CLOCK';
      const chronicleRefClause = params.withStyleReference
        ? isRadialClock
          ? 'The attached reference image (template-03-radial-clock-chronicle.jpg) is a MULTI-IMAGE RADIAL CLOCK CHRONICLE reference. Borrow its authentic warm archival documentary photography mood, rich editorial storytelling, and multi-scene visual depth. Do NOT copy any foreign flags, foreign soldiers, text, letters, or numbers from the reference.'
          : 'The attached reference image (template-02-biography-timeline-grid.jpg) is a MULTI-PHOTO BROADSHEET CHRONICLE reference. Borrow its authentic vintage Indonesian archival documentary photography mood, warm cream newsprint tone, and multi-photo journalistic storytelling. Do NOT copy any text, letters, numbers, or QR codes from the reference.'
        : '';

      return [
        remedyClause,
        `Create a high-resolution, print-quality 2x2 MULTI-PHOTO ARCHIVAL DOCUMENTARY CONTACT SHEET (vertical 4:5 ratio) specifically about: ${params.visualSubject}.`,
        `Artistic Style & Surface: ${dna.style}.`,
        `MULTI-IMAGE GENERATION MANDATE FOR ${isRadialClock ? 'RADIAL CLOCK CHRONICLE (TEMPLATE 03)' : 'CHRONICLE BROADSHEET GRID (TEMPLATE 02)'}:`,
        `- MULTIPLE DOCUMENTARY PHOTOS REQUIRED (4 DISTINCT SCENES IN A 2x2 QUADRANT GRID): Unlike single-photo templates, this template REQUIRES 4 distinct, authentic Indonesian documentary photographs arranged cleanly in 4 equal quadrants (Top-Left, Top-Right, Bottom-Left, Bottom-Right) separated by thin warm parchment/cream borders (#F4EFE6):`,
        `  1. TOP-LEFT QUADRANT (Photo 1 - Hero Field Portrait): Close-up or medium-shot authentic Indonesian documentary photograph of citizens, field workers, or technical officers actively engaged in: ${params.visualSubject}.`,
        `  2. TOP-RIGHT QUADRANT (Photo 2 - Site & Infrastructure Overview): Wide-angle documentary photograph showing the real-world Indonesian location, public facility, road/building/land, or regional environment of: ${params.visualSubject}.`,
        `  3. BOTTOM-LEFT QUADRANT (Photo 3 - Technical Implementation & Action): Documentary photograph capturing the operational process, equipment, service delivery, or hands-on work in progress for: ${params.visualSubject}.`,
        `  4. BOTTOM-RIGHT QUADRANT (Photo 4 - Community Impact & Oversight): Documentary photograph showing local Indonesian residents, beneficiaries, or joint field inspection benefiting from: ${params.visualSubject}.`,
        chronicleRefClause,
        `STRICT QUALITY & PURITY MANDATES:`,
        `- Each of the 4 quadrants MUST contain a complete, sharp, realistic photojournalistic documentary photograph (NO empty boxes, NO blank paper quadrants, NO cartoon/anime/3D clipart).`,
        `- ABSOLUTELY ZERO TEXT OR SIGNAGE: No words, no letters, no numbers, no charts, no UI cards, no banners, no logos, and no watermarks anywhere on any of the 4 photographs.`,
      ].filter(Boolean).join('\n');
    }

    const referenceClause = params.withStyleReference
      ? 'The attached image is a COLOR PALETTE, PAPER TEXTURE, AND ARTISTIC MOOD reference ONLY. Do NOT copy its scattered multi-box layout, small circular frames, or multiple photo panels, and do NOT copy any irrelevant foreign statues or subjects from the reference! Instead, depict ONLY authentic Indonesian subjects related to the topic strictly confined to a compact 25% to 30% focal corner/margin, and leave 70% of the canvas as a completely empty, clean, unobstructed paper clearing reserved for direct typography.'
      : '';

    let negativeSpaceMandate = '';
    if (
      params.archetype === 'INFOGRAPHIC_CLASSICAL_MONUMENT' ||
      params.archetype === 'INFOGRAPHIC_INDIGENOUS_ADVOCACY'
    ) {
      negativeSpaceMandate = [
        `CRITICAL NEGATIVE SPACE MANDATE (74% OPEN CANVAS FOR DIRECT TYPOGRAPHY):`,
        `- Visual Subject Placement: Place ONLY 1 compact documentary visual cutout/vignette strictly in the LOWER-LEFT corner (occupying AT MOST 24% to 26% of the canvas area, and NEVER extending horizontally past 36% of the canvas width from the left edge — all roofs, eaves, trees, and objects must fade smoothly into empty paper well before the horizontal midpoint).`,
        `- Dedicated Open Space: The ENTIRE TOP HEADER BAND (top 50% on the left) AND the ENTIRE RIGHT-HAND 62% OF THE CANVAS (from top to bottom) MUST be a 100% EMPTY, CALM, UNOBSTRUCTED, EVENLY-LIT paper/parchment surface with ZERO photos, ZERO cutouts, ZERO stone reliefs, ZERO maps, ZERO circles, and ZERO objects. Infographic text and data will be printed directly onto this open paper surface without any cards.`,
      ].join('\n');
    } else if (
      params.archetype === 'INFOGRAPHIC_EDITORIAL_COLLAGE' ||
      params.archetype === 'INFOGRAPHIC_PUNK_ZINE'
    ) {
      negativeSpaceMandate = [
        `CRITICAL NEGATIVE SPACE MANDATE (74% OPEN CANVAS FOR DIRECT TYPOGRAPHY):`,
        `- Visual Subject Placement: Place ONLY 1 compact documentary visual cutout strictly in the LOWER-RIGHT corner (occupying AT MOST 24% to 26% of the canvas area, and NEVER extending horizontally past 36% of the canvas width from the right edge).`,
        `- Dedicated Open Space: The ENTIRE TOP BAND AND the ENTIRE LEFT-HAND 64% OF THE CANVAS (from top to bottom) MUST be a 100% EMPTY, CALM, UNOBSTRUCTED, EVENLY-LIT paper surface with ZERO photos, ZERO cutouts, and ZERO clutter. Infographic text and data will be printed directly onto this open surface without any cards.`,
      ].join('\n');
    } else if (params.archetype === 'INFOGRAPHIC_ADVOCACY_PILLARS') {
      negativeSpaceMandate = [
        `CRITICAL ARCHITECTURAL MANDATE FOR 5-PILLAR ADVOCACY (TEMPLATE 04 GOLD STANDARD):`,
        `- FULL BLEED EDGE-TO-EDGE: 100% full bleed with ZERO white borders, ZERO margins, and ZERO frame perspective mockup!`,
        `- GHOST NUMBERS & DIGITS BAN: ABSOLUTELY ZERO painted digits ("01", "02", "03", "04", "05", "1", "2", "3", "4", "5"), ZERO letters ("P", "U", "T", "U", "S"), ZERO badges, and ZERO text on the background!`,
        `- WARM TERRACOTTA BATIK BACKDROP: Base background is a rich warm terracotta, burnt ochre, and golden amber earth tone (#C25E2B / #B45309) with delicate traditional Indonesian batik pattern watermark subtly textured into the backdrop.`,
        `- DOCUMENTARY SUBJECT IN CENTER-RIGHT: Anchored in the center-right window (between Y=32% and Y=56%, width approx 40%), feature a poignant, respectful, dignified documentary scene of Indonesian grassroots citizens, workers, farmers, or community members in natural daylight.`,
        `- DEDICATED OPEN SURFACES FOR COMPOSITING: Top 22% (masthead), middle-left zone (Y=24% to 58%, X=0% to 55% for green data cards), and lower 42% (Y=58% to 100% across full width for the 5 vertical solution pillars) MUST be clean, unobstructed, calm surfaces with ZERO clutter.`,
      ].join('\n');
    } else if (params.archetype === 'INFOGRAPHIC_NARRATIVE_WAVE') {
      negativeSpaceMandate = [
        `CRITICAL ARCHITECTURAL MANDATE FOR S-CURVE NARRATIVE WAVE (GOLD REFERENCE STANDARD):`,
        `- TOP 18% HEADER ZONE IS 100% STERILIZED BLANK CREAM BROADSHEET PAPER: The entire top 18% of the canvas (from vertical 0% down to 18%, across full width) MUST be completely blank, unprinted, flat warm cream paper (#F8F6F0) with ZERO photos, ZERO ribbons, and ZERO text. The masthead headline, kicker, and deck will be printed programmatically here.`,
        `- MULTIPLE DOCUMENTARY PHOTOGRAPHS PERMITTED (2 TO 4 HUMAN CUTOUTS): You are explicitly authorized and encouraged to use MORE THAN 1 IMAGE (2 to 4 high-contrast black-and-white or muted documentary photo cutouts) seamlessly integrated into the editorial montage: A PURE ISOLATED SILHOUETTE CUTOUT of Indonesian citizen/worker/student at upper-left floating directly on cream paper with ZERO rectangular background photo boxes and ZERO room backgrounds, strictly above Y=34%; reaching hand at upper-right strictly above Y=30% and at extreme far-right X >= 88%; NARROW SLENDER diagonal black-and-white crowd ribbon across the center (strictly confined between X: 34% and X: 48%, and STRICTLY starting BELOW Y=38%); and a small compact community figure in the center-bottom. NEVER draw giant vehicle chassis, full-bleed landscape rectangles, or room background boxes! NEVER label the figures with digits or diagram numbers!`,
        `- UPPER-RIGHT RED WAVE IS 100% SOLID CRIMSON RED (X: 42% to 85%, Y: 18% to 38%): The upper red wave MUST be 100% pure, solid, smooth crimson-red ink (#991B1B) with ABSOLUTELY ZERO crowd faces, ZERO heads, and ZERO cutouts! The crowd faces ribbon MUST strictly start BELOW Y=38% (below the middle horizontal KPI belt)! This guarantees 100% pristine readability for Point 01 and Point 02 white typography.`,
        `- SWEEPING SOLID CRIMSON COLOR FIELD (ENTIRE RIGHT FLANK): A bold, graceful, deep crimson-red color field (#991B1B) flows continuously down the right-hand half of the canvas (from vertical 18% down to 92% height, occupying the right 52% width from X=48% to 100%). The crimson surface must be a smooth, solid deep crimson ink clearing prepared specifically for direct white typography without any cards and ZERO crowd faces on the right!`,
        `- CRITICAL GHOST NUMBERS & DIGIT BAN: ABSOLUTELY ZERO NUMBERS, ZERO DIGITS, ZERO NUMBERED WATERMARKS, ZERO GHOST TEXT ("01", "02", "03", "04", "05", "06", etc.) PAINTED ANYWHERE ON THE ARTWORK! The crimson-red color field MUST be 100% solid, smooth, pure unnumbered red ink. ZERO airbrushed numbers, zero decorative numerals, zero ghost digits!`,
        `- NO DRAWN HORIZONTAL BARS OR STRIPES: ABSOLUTELY ZERO horizontal dark bars, zero black stripes, zero lines, and zero rectangular boxes drawn on the canvas! The artwork must be a pure natural blend of warm cream newsprint paper, flowing crimson organic wave, and photo cutouts.`,
        `- PRISTINE LOWER-LEFT DATA CLEARING (vertical 36% to 92%, horizontal 0% to 46% width): The entire lower-left area MUST be 100% COMPLETELY BLANK, CLEAN, FLAT, UNPRINTED WARM CREAM BROADSHEET PAPER (#F8F6F0). ABSOLUTELY ZERO vehicle parts, ZERO roller wheels, ZERO machinery, ZERO red ribbons, ZERO dark bars, ZERO dirt/grain spills, ZERO photo cutouts, and ZERO text anywhere in this clearing! It is strictly reserved for programmatic donut charts and data typography.`,
        `- BALANCED DENSITY & ZERO AWKWARD EMPTY SPACE: Every quadrant of the poster must be purposeful, active, and dense matching the Humana master reference: Upper-left has the portrait cutout and title, upper-right has the solid red wave with Points 01-02, middle has the KPI belt, lower-left has the data clearing with donut chart and Point 04, lower-right has Points 03, 05, 06 in the crimson wave, and lower-center has the citizen anchor cutout.`,
        `- ZERO FLOATING CARDS MANDATE: ABSOLUTELY ZERO floating cards, zero white boxes, zero container rectangles, zero drop shadows! The artwork itself must provide the flat ink surfaces so typography can be printed directly on the canvas.`,
        `- FOOTER MARGIN (y=90% to 100%): Clean flat margin for closing callout and official signature.`,
        `- ABSOLUTELY NO CARTOON STICK FIGURES OR DOODLES: Zero stick figures, zero tiny human sketches, zero random floating silhouettes anywhere on the canvas.`,
      ].join('\n');
    } else {
      // INFOGRAPHIC_HERITAGE_EDITORIAL, INFOGRAPHIC_RETRO_SUNBURST, INFOGRAPHIC_NARRATIVE_WAVE, INFOGRAPHIC_VISIONARY_TIMELINE, INFOGRAPHIC_HISTORICAL_EXPEDITION
      negativeSpaceMandate = [
        `CRITICAL NEGATIVE SPACE MANDATE (75% OPEN CANVAS FOR DIRECT TYPOGRAPHY):`,
        `- SINGLE VISUAL WINDOW ONLY (NO STACKED OR DUPLICATE PHOTOS): Place ONLY 1 single compact, authentic Indonesian documentary photograph/cutout strictly in the MIDDLE-LEFT window (between 26% and 58% vertical height, and NEVER extending horizontally past 38% of the canvas width from the left edge).`,
        `- STRICT FORBIDDEN ZONES FOR PHOTOGRAPHS: NEVER draw a second photograph in the lower half of the canvas! NEVER let any photograph rise into the top 25% header/headline/deck zone, and NEVER let any photograph extend below 60% vertical height (the entire lower 40% from left to right is reserved for 3-column text Points 04-06 and must be 100% plain empty paper!).`,
        `- Dedicated Open Space: At least 75% of the canvas (the entire top 25% header/title/deck expanse, the entire right-hand 60% width, and the entire lower 40% full-width reading area) MUST be a 100% EMPTY, FLAT, CALM, UNOBSTRUCTED, EVENLY-LIT paper/parchment surface with ZERO photos, ZERO cutouts, ZERO ribbons, and ZERO boxes.`,
      ].join('\n');
    }

    const isNarrativeWave = params.archetype === 'INFOGRAPHIC_NARRATIVE_WAVE';
    const pal = params.mutation.palette;
    const waveColorName = pal?.accentName || 'deep crimson-red';
    const waveHex = pal?.accentHex || '#991B1B';

    const dynamicReferenceClause = isNarrativeWave
      ? `CRITICAL REFERENCE MANDATE: The attached image is the MASTER STRUCTURAL & ARTISTIC REFERENCE (Humana y sus Dimensiones / S-Curve Narrative Wave). FAITHFULLY REPRODUCE ITS EXACT SPATIAL ARCHITECTURE: (1) warm unprinted textured cream newsprint paper background (#F8F6F0), (2) sweeping, massive, solid deep ${waveColorName} color field (${waveHex}) covering the right flank with smooth unencumbered colored surfaces for typography, (3) a lower-left clean cream clearing for data charts, and (4) black-and-white documentary photo cutouts tailored to the given topic. Do NOT invent a different layout!`
      : referenceClause;

    if (isNarrativeWave) {
      return [
        remedyClause,
        `Master Fine-Art Mixed-Media Editorial Collage Background (vertical 4:5 ratio) on authentic warm textured cream broadsheet paper (#F8F6F0) specifically about: ${params.visualSubject}.`,
        `CRITICAL FULL-BLEED ZERO-MOCKUP MANDATE: The composition MUST BE 100% FULL BLEED EDGE-TO-EDGE across the entire image frame. ABSOLUTELY ZERO white borders, ZERO white padding, ZERO outer margins, ZERO surrounding white frame, ZERO drop shadow canvas edges, and ZERO poster mockup perspective! DO NOT draw a sheet of paper lying on a white background, desk, or studio table! The background paper texture (#F8F6F0) and the deep ${waveColorName} wave (${waveHex}) must bleed all the way to the absolute pixel edges of the image (coordinates 0,0 to 100%,100%) without any surrounding white border or desk!`,
        `Grounded Reference Architecture: Exact spatial composition of the master infographic reference (Humana y sus Dimensiones / template-01):`,
        `1. BASE CANVAS: Warm unprinted textured cream newsprint paper (#F8F6F0) with subtle paper fiber grain bleeding to all edges. Top 18% header band (full width) and the entire lower-left quadrant (from Y=38% down to 92%, horizontal 0% to 46% width) MUST remain 100% flat, clean, unprinted, pristine cream paper.`,
        `2. SWEEPING SOLID ${waveColorName.toUpperCase()} COLOR FIELD (RIGHT FLANK): A massive, bold, organic deep ${waveColorName} color field (${waveHex}) sweeping down the entire right-hand half of the canvas (from vertical 18% down to 92% height, covering the right 52% width from X=48% to 100% FULL BLEED TO THE RIGHT EDGE). The ${waveColorName} field MUST have wide, smooth, unencumbered solid colored surfaces prepared for direct white typography. It must bleed all the way to the right border of the canvas with ZERO white margin on the right!`,
        `3. PHOTO COLLAGE MONTAGE (2 TO 4 HIGH-CONTRAST B&W CUTOUTS - ZERO NUMBER LABELS): Integrate 2 to 4 authentic documentary black-and-white or muted duotone photographic cutouts relating to: ${params.visualSubject}:`,
        `   - Citizen Portrait Cutout (Upper-Left Quadrant, strictly X: 5% to 35%, Y: 14% to 34% height MAX): Authentic high-contrast black-and-white documentary photo cutout of a smiling Indonesian citizen, student, or worker (real photographic portrait cutout with visible realistic facial features and clothing texture — NOT a flat black shadow silhouette!). Head and collar/chest only, floating seamlessly on cream paper. ABSOLUTELY NO RECTANGULAR BOX BACKGROUND PHOTOS (no classroom/library room photo box, no furniture), strictly above Y=34%.`,
        `   - Marginal Detail Cutout (Upper-Right Margin, strictly X: 88% to 98%, Y: 18% to 30% height): A small photographic cutout detail (such as a hand reaching, small tool, or botanical element) strictly hugging the extreme far-right border and strictly above Y=30%. MUST NEVER EXTEND BELOW Y=30% or to the left past X=88% so it stays completely away from Point 02 text and the middle KPI belt!`,
        `   - Center Crowd Montage Ribbon (strictly X: 34% to 48%, strictly Y: 38% to 65%): CRITICAL: MUST START STRICTLY BELOW Y=38% (below the middle horizontal KPI belt)! MUST BE A THIN, NARROW, SLENDER diagonal ribbon of black-and-white crowd faces / everyday Indonesian citizens (maximum 14% canvas width). NEVER RISE ABOVE Y=38% INTO THE UPPER WAVE! NEVER FAN OUT WIDE TO THE RIGHT! NEVER DRAW CROWD FACES PAST X=50%! The entire right flank (from X: 52% to 100%, and Y: 38% down to 92%) MUST BE 100% UNBROKEN, SOLID, SMOOTH DEEP ${waveColorName.toUpperCase()} COLOR FIELD (${waveHex}) WITH ZERO FACES, ZERO HEADS, AND ZERO BODIES! Narrative text will be printed programmatically here, so this surface must be 100% clear, completely blank, and unnumbered.`,
        `   - Base Grounding Motif (Lower-Center, strictly X: 44% to 56%, Y: 80% to 92%): A small, low-profile seated citizen figure or symbolic botanical mixed-media cutout. Must not spread to the left or right.`,
        `4. DEDICATED CONTENT CLEARINGS (ZERO TEXT & ZERO CARDS ON ARTWORK):`,
        `   - Top 18%: Completely unprinted cream paper for headline and deck.`,
        `   - Upper-right wave (X: 42% to 85%, Y: 18% to 38%): Smooth, blank, 100% solid deep ${waveColorName} surface reserved for direct white typography. ABSOLUTELY ZERO CROWD FACES, ZERO HEADS, ZERO CUTOUTS, AND ZERO NUMBERS HERE!`,
        `   - Entire lower-left quadrant (X: 0% to 46%, Y: 34% to 92%): MUST BE 100% PURE, CLEAN, FLAT, COMPLETELY BLANK UNPRINTED WARM CREAM BROADSHEET PAPER (#F8F6F0). ABSOLUTELY ZERO PHOTOS, ZERO WORKERS, ZERO PEOPLE, ZERO ASPHALT, ZERO ROAD SURFACES, ZERO MACHINERY, ZERO VEHICLES, ZERO DIRT, ZERO LINES, and ZERO PHOTO SPILLS IN THIS ENTIRE LOWER-LEFT HALF! ONLY the upper-left portrait cutout (strictly above Y=34%) is permitted on the left half of the poster. Below Y=34% on the left, the paper is 100% STERILE AND EMPTY, reserved strictly for programmatically rendered donut charts and data typography.`,
        `   - Entire lower-right wave (X: 52% to 100%, Y: 42% to 92%): Completely solid, smooth ${waveColorName} surface with ZERO crowd faces reserved for narrative text. DO NOT DRAW ANY NUMBERS OR LABELS HERE.`,
        `CRITICAL GHOST NUMBERS & DIGIT BAN: ABSOLUTELY ZERO NUMBERS, ZERO DIGITS, ZERO NUMBERED WATERMARKS, ZERO GHOST TEXT ("01", "02", "03", "04", "05", "06", etc.) AND ZERO DIAGRAM LABELS ("1", "2", "3", "4") PAINTED ANYWHERE ON THE ARTWORK! The ${waveColorName} color field MUST be 100% solid, smooth, pure unnumbered ink. ZERO airbrushed numbers, zero decorative numerals, zero ghost digits! The canvas must be 100% sterile of all typography, letters, digits, and numbers.`,
        `ABSOLUTELY ZERO TEXT, ZERO LETTERS, ZERO NUMBERS, ZERO WORDS ANYWHERE ON THE ARTWORK.`,
        `ABSOLUTELY ZERO FLOATING CARDS, ZERO UI CONTAINERS, ZERO DROP-SHADOW BOXES.`,
        `ABSOLUTELY NO DRAWN HORIZONTAL DARK BARS OR BLACK STRIPES ACROSS THE CANVAS.`,
        `ABSOLUTELY NO FULL-BLEED FULL-COLOR LANDSCAPE PHOTOS. ALL PHOTOGRAPHIC ELEMENTS MUST BE BLACK-AND-WHITE CUTOUTS INTEGRATED INTO THE CREAM AND ${waveColorName.toUpperCase()} COLLAGE.`,
        dynamicReferenceClause,
      ].filter(Boolean).join('\n');
    }

    return [
      remedyClause,
      `Create a high-resolution, print-quality editorial infographic background ARTWORK (vertical 4:5 ratio) specifically about: ${params.visualSubject}.`,
      `Artistic Style & Surface: ${dna.style}.`,
      `Subject Mandate: Depict ONLY 1 single scene of authentic Indonesian people, public facilities, or real-world settings directly related to ${params.visualSubject}. Do NOT include any unrelated statues, foreign monuments, or random icons.`,
      negativeSpaceMandate,
      referenceClause,
      `STRICT COMPOSITION MANDATES:`,
      `- SINGLE PHOTO ONLY (EXCEPT NARRATIVE WAVE, CHRONICLE GRID & RADIAL CLOCK): For archetypes other than INFOGRAPHIC_NARRATIVE_WAVE, INFOGRAPHIC_CHRONICLE_GRID, and INFOGRAPHIC_RADIAL_CLOCK, render only 1 single documentary photograph. For INFOGRAPHIC_NARRATIVE_WAVE, multiple documentary photo cutouts (2 to 4 images) are explicitly authorized for the editorial collage.`,
      `- Leave 75% of the canvas as clean, open, flat, unencumbered textured paper/surface specifically designed to hold direct editorial typography without needing any cards or boxes.`,
      `- NO CORNER RIBBONS OR FLAGS: Do NOT draw any red-and-white ribbons, flags, or banners at the top or bottom corners of the canvas.`,
      `- Keep all architectural roofs, trees, and objects strictly inside their single compact window so they never touch or intrude into the top headline/deck, the right-hand text column, or the bottom 3-column text zone.`,
      `- ABSOLUTELY NO ANIMATION, NO ANIME, NO CARTOON, NO 3D RENDER, NO ISOMETRIC VECTOR ART, NO CLIPART, NO STICK FIGURES, NO DOODLE CHARACTERS, NO WALKING SILHOUETTES IN HEADER OR FOOTER.`,
      `- DO NOT DRAW ANY UI CARDS, FROSTED GLASS RECTANGLES, WHITE BOXES, CIRCLES, OR CONTAINERS.`,
      `- DO NOT DRAW ANY CHARTS, MAPS, ICONS, OR QR CODES.`,
      `- DO NOT DRAW ANY DONUT CHARTS, PIE CHARTS, OR SCORECARD METRICS IN THE BACKGROUND.`,
      `ABSOLUTELY ZERO TEXT OR SIGNAGE: No words, no letters, no numbers, no building signboards, no roof plaques, no nameplates on walls, no banners, no labels, no logos, no watermarks anywhere on the artwork. Buildings must have clean unlettered facades.`,
    ].filter(Boolean).join('\n');
  }

  const referenceClause = params.withStyleReference
    ? 'The attached image is a STYLE reference only. Borrow its printing technique, paper texture, photo treatment and mood. Do NOT copy its layout, its subjects, or any of its text. Create a new, different composition.'
    : '';

  return [
    `Create a finished, print-quality graphic poster ARTWORK (vertical 4:5) about: ${params.visualSubject}.`,
    `Visual style: ${dna.style}.`,
    `Ink palette: ${p.accentName} as the dominant accent with ${p.secondaryName}, printed on ${p.paperName} paper.`,
    `People, if any, are anonymous everyday Indonesian citizens or workers. No recognizable public figures, no politicians, no officials posing.`,
    `Composition: ${spatial.art} ${spatial.clearing} This empty paper area is reserved for typography that will be printed later, so keep it quiet and evenly lit.`,
    referenceClause,
    'Absolutely no text of any kind anywhere: no letters, no words, no numbers, no signage, no labels, no logos, no watermarks, no fake writing.',
  ]
    .filter(Boolean)
    .join('\n');
}

// =============================================================================
// 5. OTAK TEKS: COPY AI DARI TOPIK YANG SAMA
// =============================================================================
const COPY_LIMITS = {
  kicker: 64,
  headline: 58,
  deck: 380,
  pointLabel: 54,
  pointText: 350,
  closing: 220,
};

function stripTrailingConnectors(text: string): string {
  return text
    .replace(/\s*(?:&|\/|-|•|,|:|;|\bdan\b|\batau\b|\bdi\b|\bke\b|\bdari\b|\buntuk\b|\bpada\b|\bdengan\b|\bbagi\b|\bdalam\b|\boleh\b|\bserta\b|\byang\b)\s*$/gi, '')
    .trim();
}

function clampWords(text: string, max: number): string {
  const clean = (text || '').replace(/\s+/g, ' ').trim();
  if (clean.length <= max) return stripTrailingConnectors(clean) || clean;
  const words = clean.split(' ');
  let out = '';
  for (const w of words) {
    const next = out ? `${out} ${w}` : w;
    if (next.length > max) break;
    out = next;
  }
  const stripped = stripTrailingConnectors(out);
  return stripped || out || clean.slice(0, max);
}

function clampSentence(text: string, max: number): string {
  const clean = (text || '').replace(/\s+/g, ' ').trim();
  if (clean.length <= max) return clean;
  const sliced = clean.slice(0, max);
  const stop = Math.max(sliced.lastIndexOf('.'), sliced.lastIndexOf(';'));
  if (stop >= max * 0.55) return sliced.slice(0, stop + 1).trim();
  return `${clampWords(clean, max - 1).replace(/[,;:\s]+$/, '')}.`;
}

/**
 * Membersihkan judul poin (label) dari kata-kata instruksi template / meta-label kaku
 * agar judul poin selalu terdengar alami, luwes, jurnalistik, dan relevan langsung dengan topik.
 */
function cleanEditorialPointLabel(rawLabel: string, fallbackIdx: number, topic?: string): string {
  const safeTopic = String(topic || 'Advokasi');
  let cleaned = String(rawLabel || '')
    .replace(/\s*\/\/+\s*/g, ' ')
    .replace(/^\s*(?:POIN|INDIKATOR|TONGGAK|FASE|TAHAP|DIMENSI|PILAR|FOKUS|BUTIR)\s*(?:0?\d+|[IVX]+)\s*[:.•\-–—]*\s*/i, '')
    .replace(/^\s*0?\d+\s*[:.•\-–—]+\s*/, '')
    .replace(/\(\s*POIN\s*0?\d+\s*[-–—]\s*POIN\s*0?\d+\s*\)/gi, '')
    .replace(/\b(?:CLOSINGLINE|CLOSING\s*LINE|VISUALSUBJECT|VISUAL\s*SUBJECT|PROMPT)\b/gi, '')
    .trim();

  // Hilangkan frasa meta-prompt kaku bila AI tidak sengaja menyalinnya
  const metaReplacements: Array<[RegExp, string]> = [
    [/^DIAGNOSA\s+MASALAH\s+(?:DAN\s+KESENJANGAN\s*)?/i, 'PEMETAAN KEBUTUHAN '],
    [/^PETA\s+SEBARAN\s+WILAYAH\s+PRIORITAS$/i, `FOKUS WILAYAH ${safeTopic.split(' ').slice(0, 2).join(' ')}`],
    [/^PETA\s+SEBARAN\s+/i, 'CAKUPAN WILAYAH '],
    [/^SKEMA\s+PROGRAM\s+INTERVENSI\s*/i, 'MEKANISME LAYANAN '],
    [/^PROYEKSI\s+DAMPAK\s+JANGKA\s+PANJANG$/i, `TARGET KEBERHASILAN ${safeTopic.split(' ').slice(0, 2).join(' ')}`],
    [/^PROYEKSI\s+DAMPAK\s+/i, 'TARGET CAPAIAN '],
    [/^LANJUTAN\s+ANALISIS\s*(?:&\s*RENCANA\s+AKSI)?\s*/i, 'STRATEGI PELAKSANAAN '],
  ];

  for (const [pattern, replacement] of metaReplacements) {
    if (pattern.test(cleaned)) {
      cleaned = cleaned.replace(pattern, replacement).trim();
    }
  }

  cleaned = MasterEditorialSanitizer.cleanHeadline(cleaned);
  if (!cleaned || cleaned.length < 4) {
    const topicShort = clampWords(MasterEditorialSanitizer.cleanHeadline(safeTopic), 24).toUpperCase();
    const naturalFallbacks = [
      `AKSES & KEBUTUHAN ${topicShort}`,
      `PRIORITAS WILAYAH SASARAN`,
      `MEKANISME PELAKSANAAN PROGRAM`,
      `PENINGKATAN FASILITAS LAYANAN`,
      `PENGAWASAN & AKUNTABILITAS DATA`,
      `TARGET MANFAAT MASYARAKAT`,
    ];
    cleaned = naturalFallbacks[fallbackIdx % naturalFallbacks.length]!;
  }

  return clampWords(cleaned, COPY_LIMITS.pointLabel).toUpperCase();
}

function cleanEditorialSectionHeading(rawHeading: string | undefined, topic?: string): string {
  const safeTopic = String(topic || 'Advokasi');
  let cleaned = String(rawHeading || '')
    .replace(/\s*\/\/+\s*/g, ' ')
    .replace(/\(\s*POIN\s*0?\d+\s*[-–—]\s*POIN\s*0?\d+\s*\)/gi, '')
    .replace(/\bLANJUTAN\s+ANALISIS\s*(?:&|DAN)?\s*RENCANA\s+AKSI\b/gi, '')
    .replace(/\bPOIN\s*0?\d+\b/gi, '')
    .replace(/^[\s✦◈•:.\-–—]+|[\s✦◈•:.\-–—]+$/g, '')
    .trim();

  if (!cleaned || cleaned.length < 6) {
    const topicCore = clampWords(MasterEditorialSanitizer.cleanHeadline(safeTopic), 28).toUpperCase();
    cleaned = `STRATEGI IMPLEMENTASI & TARGET ${topicCore}`;
  }
  return clampWords(cleaned, 52).toUpperCase();
}

function finalizeCopy(
  raw: Partial<ArtCollageCopy> & Record<string, any>,
  topic: string,
  archetype?: CreativePosterArchetype
): ArtCollageCopy {
  const s = (t?: string) => MasterEditorialSanitizer.sanitize(t || '');

  // 1. Ambil array points dari berbagai kemungkinan key (points, items, pillars, steps, keyPoints, butir)
  const rawPointsCandidate =
    raw.points || raw.items || raw.pillars || raw.steps || raw.keyPoints || raw.butir || [];

  const pointsArray = Array.isArray(rawPointsCandidate)
    ? rawPointsCandidate
    : typeof rawPointsCandidate === 'object' && rawPointsCandidate !== null
    ? Object.values(rawPointsCandidate)
    : [];

  const isInfographic = isInfographicArchetype(archetype);
  const isAdvocacyPillars = archetype === 'INFOGRAPHIC_ADVOCACY_PILLARS';
  const targetPoints = isAdvocacyPillars ? 5 : (isInfographic ? 6 : 3);
  const maxPoints = targetPoints;

  const points = pointsArray
    .map((pt: any, idx: number) => {
      if (typeof pt === 'string') {
        if (pt.includes(':')) {
          const colonIdx = pt.indexOf(':');
          const lbl = pt.slice(0, colonIdx).trim();
          const txt = pt.slice(colonIdx + 1).trim();
          return {
            label: cleanEditorialPointLabel(lbl, idx, topic),
            text: clampSentence(s(txt), COPY_LIMITS.pointText),
          };
        }
        return {
          label: cleanEditorialPointLabel('', idx, topic),
          text: clampSentence(s(pt), COPY_LIMITS.pointText),
        };
      }
      if (typeof pt === 'object' && pt !== null) {
        const rawLabel = String(pt.label || pt.title || pt.name || pt.step || pt.pilar || pt.heading || '').replace(/\s*\/\/+\s*/g, ' ');
        const rawText = String(pt.text || pt.description || pt.desc || pt.content || pt.detail || pt.uraian || '').replace(/\s*\/\/+\s*/g, ' ');
        return {
          label: cleanEditorialPointLabel(rawLabel, idx, topic),
          text: clampSentence(s(rawText), COPY_LIMITS.pointText),
        };
      }
      return null;
    })
    .filter((pt): pt is { label: string; text: string } => {
      if (!pt || (!pt.label && !pt.text)) return false;
      const lblLower = (pt.label || '').toLowerCase();
      const txtLower = (pt.text || '').toLowerCase();
      if (
        lblLower.includes('closingline') ||
        lblLower.includes('closing line') ||
        lblLower.includes('visualsubject') ||
        lblLower.includes('visual subject') ||
        lblLower.includes('prompt') ||
        txtLower.includes('closingline') ||
        txtLower.includes('visualsubject') ||
        txtLower.includes('a farmer inspecting') ||
        txtLower.includes('documentary photograph')
      ) {
        return false;
      }
      return true;
    });

  // Parse stats (3 sampai 4 KPI highlight metrics) untuk infografis — label ringkas 2-3 kata (maks 24 karakter) agar tidak berdesakan
  const rawStatsCandidate = raw.stats || raw.kpis || raw.metrics || [];
  let stats: Array<{ value: string; label: string }> = [];
  if (Array.isArray(rawStatsCandidate) && rawStatsCandidate.length > 0) {
    const seenStatValues = new Set<string>();
    stats = rawStatsCandidate
      .map((st: any) => ({
        value: clampWords(String(st.value || st.angka || st.metric || '').replace(/\s*\/\/+\s*/g, ' ').toUpperCase(), 14),
        label: clampWords(String(st.label || st.title || st.keterangan || '').replace(/\s*\/\/+\s*/g, ' '), 24),
      }))
      .filter((st) => {
        if (!st.value || !st.label) return false;
        const key = `${st.value}|${st.label.toLowerCase()}`;
        if (seenStatValues.has(key)) return false;
        seenStatValues.add(key);
        return true;
      })
      .slice(0, 4);
  }

  // Jika stats belum lengkap dari AI, gunakan indikator makro yang BEDA dari points
  if (isInfographic && stats.length < 4) {
    const fallbackMacroStats = [
      { value: '27 KAB/KOTA', label: 'Cakupan Evaluasi Wilayah' },
      { value: 'TRIWULAN IV', label: 'Siklus Pemantauan Data' },
      { value: 'PRIORITAS A', label: 'Klasifikasi Intervensi' },
      { value: 'TERPADU', label: 'Integrasi Lintas Sektor' },
    ];
    for (const fb of fallbackMacroStats) {
      if (stats.length >= 4) break;
      if (!stats.some((s) => s.value === fb.value)) {
        stats.push(fb);
      }
    }
  }

  // DEDUPLIKASI KETAT ANTAR POINTS & ANTARA STATS VS POINTS
  const statTokens = new Set(
    stats.map((st) => `${st.value} ${st.label}`.toUpperCase().replace(/[^A-Z0-9%.,]/g, ' ').trim())
  );
  const seenLabels = new Set<string>();
  const seenTexts = new Set<string>();
  const uniquePoints: Array<{ label: string; text: string; badge?: string }> = [];

  for (const pt of points) {
    const normLabel = pt.label.toUpperCase().replace(/[^A-Z0-9]/g, '');
    const normText = pt.text.toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 55);
    if (!normLabel || !normText) continue;
    if (seenLabels.has(normLabel) || seenTexts.has(normText)) {
      continue; // Buang poin duplikat!
    }
    // Cek apakah label poin persis menyalin salah satu KPI stat
    let finalLabel = pt.label;
    for (const st of stats) {
      if (
        st.value.length >= 2 &&
        finalLabel.includes(st.value) &&
        finalLabel.toLowerCase().includes(st.label.split(' ')[0]?.toLowerCase() || '___')
      ) {
        // Ubah fokus judul poin agar tidak kembar dengan KPI di atas
        finalLabel = clampWords(
          `PEMERATAAN ${finalLabel.replace(st.value, '').replace(/^[\s•/-]+/, '').trim()}`,
          COPY_LIMITS.pointLabel
        ).toUpperCase();
      }
    }
    seenLabels.add(normLabel);
    seenTexts.add(normText);
    uniquePoints.push({ label: finalLabel, text: pt.text, badge: (pt as any).badge });
    if (uniquePoints.length >= maxPoints) break;
  }

  const finalPoints = uniquePoints;

  // Jika butir data unik kurang dari targetPoints, lengkapi dengan dimensi analisis berbeda yang lengkap, relevan & alami
  if (isInfographic && finalPoints.length < targetPoints) {
    const topicShort = clampWords(MasterEditorialSanitizer.cleanHeadline(topic), 22).toUpperCase();
    const supplementals: Array<{ label: string; text: string; badge?: string }> = [
      {
        label: `CAKUPAN AKSES & PRIORITAS WILAYAH`,
        text: `Identifikasi kecamatan dan desa dengan tingkat kebutuhan tertinggi terkait ${topic} guna memastikan distribusi kuota program dan intervensi anggaran tersalurkan tepat sasaran ke wilayah yang paling membutuhkan.`,
        badge: 'INDIKATOR KUNCI',
      },
      {
        label: `VALIDASI DATA PENERIMA MANFAAT`,
        text: 'Pemutakhiran basis data warga sasaran secara berkala setiap semester lintas instansi daerah untuk menutup celah ketidaktepatan penyaluran serta menjamin akurasi layanan di lapangan.',
        badge: 'PROGRAM INTERVENSI',
      },
      {
        label: `STANDARISASI SARANA & FASILITAS`,
        text: 'Peningkatan kapasitas fasilitas pelayanan publik, rehabilitasi sarana penunjang, serta pemerataan akses konektivitas warga di zona prioritas agar standar pelayanan minimum terpenuhi secara merata.',
      },
      {
        label: `PENGAWASAN REALISASI ANGGARAN`,
        text: 'Pelaksanaan pengawasan berlapis terhadap serapan pagu anggaran daerah dan capaian fisik program agar setiap alokasi dana memberikan dampak terukur bagi peningkatan kesejahteraan warga.',
        badge: 'TARGET PENURUNAN',
      },
      {
        label: `PELIBATAN WARGA & KANAL PENGADUAN`,
        text: 'Pembukaan kanal pelaporan masyarakat dan pelibatan komunitas lokal secara transparan dalam mengawal mutu pelaksanaan program serta mempercepat tindak lanjut kendala teknis di lapangan.',
      },
      {
        label: `TARGET KEBERLANJUTAN ${topicShort}`,
        text: 'Pengukuran indikator kinerja utama secara berkala sebagai landasan penyempurnaan regulasi daerah, perluasan cakupan manfaat, dan penguatan kemandirian masyarakat jangka panjang.',
      },
    ];
    for (const sup of supplementals) {
      if (finalPoints.length >= targetPoints) break;
      const normLbl = sup.label.replace(/[^A-Z0-9]/g, '');
      if (!seenLabels.has(normLbl)) {
        seenLabels.add(normLbl);
        finalPoints.push(sup);
      }
    }
  }

  // Lengkapi badge tematik untuk arketipe Gelombang Naratif Merah jika belum disediakan oleh AI
  if (archetype === 'INFOGRAPHIC_NARRATIVE_WAVE') {
    if (finalPoints[0] && !finalPoints[0].badge) finalPoints[0].badge = 'INDIKATOR KUNCI';
    if (finalPoints[1] && !finalPoints[1].badge) finalPoints[1].badge = 'PROGRAM INTERVENSI';
    if (finalPoints[3] && !finalPoints[3].badge) {
      const t = `${topic} ${finalPoints[3].label || ''}`.toLowerCase();
      if (/stunting|kemiskinan|rusak|sampah|pengangguran|kriminal|inflasi|banjir/.test(t)) {
        finalPoints[3].badge = 'TARGET PENURUNAN';
      } else if (/pangan|tani|panen|produksi|swasembada|bibit|pupuk|sawah/.test(t)) {
        finalPoints[3].badge = 'TARGET PRODUKSI & DISTRIBUSI';
      } else if (/sekolah|guru|siswa|kuliah|didik|pendidikan/.test(t)) {
        finalPoints[3].badge = 'STANDAR MUTU PENDIDIKAN';
      } else if (/sehat|rsud|puskesmas|medis|kesehatan/.test(t)) {
        finalPoints[3].badge = 'STANDAR LAYANAN MEDIS';
      } else if (/anggaran|dana|hibah|bansos|bantuan/.test(t)) {
        finalPoints[3].badge = 'ALOKASI SASARAN BANTUAN';
      } else {
        finalPoints[3].badge = 'SASARAN PRIORITAS';
      }
    }
  }

  // Jika setelah diparse finalPoints masih kurang dari 2, lengkapi dari topik agar tidak gagal
  if (finalPoints.length < 2) {
    if (finalPoints.length === 1) {
      finalPoints.push({
        label: 'ARAH SOLUSI KEBIJAKAN',
        text: `Implementasi kebijakan terukur dan pengawasan komprehensif atas ${topic}.`,
      });
    } else {
      finalPoints.push(
        { label: 'URGENSI PENANGANAN ISU', text: `Persoalan ${topic} memerlukan perhatian dan penanganan berbasis data riil.` },
        { label: 'ARAH SOLUSI KEBIJAKAN', text: 'Penyusunan regulasi komprehensif dan alokasi sumber daya tepat sasaran.' }
      );
    }
  }

  // 2. Normalisasi headline
  const rawHeadline = raw.headline || raw.title || raw.judul || raw.mainTitle || topic;

  let sanitizedKicker = s(raw.kicker || raw.rubrik || raw.category || 'TELAAH ISU');
  sanitizedKicker = sanitizedKicker
    .replace(/\s*\/\/+\s*/g, ' • ')
    .replace(/\b(?:catatan|langkah|agenda|fokus|kabar)\s+parlemen\b/gi, 'TELAAH KEBIJAKAN')
    .replace(/\bparlemen(?:\s+ri)?\b/gi, 'KEBIJAKAN PUBLIK');

  // 3. Parse & normalisasi chart (Pie / Donut Chart 4 segmen yang jumlahnya 100%)
  // PANTANGAN: DILARANG MEMBUAT CHART UNTUK TEMPLATE TANPA DIAGRAM (ADVOCACY PILLARS, RADIAL CLOCK)
  const allowsChart =
    isInfographic &&
    !isAdvocacyPillars &&
    archetype !== 'INFOGRAPHIC_RADIAL_CLOCK';
  const rawChartCandidate = (raw as any).chart || (raw as any).pieChart || (raw as any).grafik;
  let chart: ArtCollageCopy['chart'] = undefined;
  if (allowsChart) {
    const rawSlices = Array.isArray(rawChartCandidate?.slices || rawChartCandidate?.data || rawChartCandidate?.items)
      ? rawChartCandidate.slices || rawChartCandidate.data || rawChartCandidate.items
      : [];
    const parsedSlices = rawSlices
      .map((sl: any) => ({
        label: clampWords(String(sl.label || sl.name || sl.kategori || '').replace(/\s*\/\/+\s*/g, ' '), 24).toUpperCase(),
        percentage: Math.max(5, Math.round(Number(String(sl.percentage ?? sl.value ?? sl.persen ?? 0).replace(/[^0-9.]/g, '')) || 0)),
      }))
      .filter((sl: { label: string; percentage: number }) => Boolean(sl.label) && sl.percentage > 0)
      .slice(0, 4);

    if (parsedSlices.length >= 3) {
      const sum = parsedSlices.reduce((acc: number, s: { percentage: number }) => acc + s.percentage, 0) || 100;
      const normalized = parsedSlices.map((s: { label: string; percentage: number }) => ({
        label: s.label,
        percentage: Math.max(5, Math.round((s.percentage / sum) * 100)),
      }));
      const diff = 100 - normalized.reduce((acc: number, s: { percentage: number }) => acc + s.percentage, 0);
      if (normalized[0]) normalized[0].percentage += diff;

      // Ensure all slice percentages are strictly unique to prevent duplicate chart numbers
      const seenPcts = new Set<number>();
      for (let i = 0; i < normalized.length; i++) {
        while (seenPcts.has(normalized[i]!.percentage)) {
          normalized[i]!.percentage += 1;
          if (normalized[0] && i !== 0 && normalized[0]!.percentage > 10) normalized[0]!.percentage -= 1;
        }
        seenPcts.add(normalized[i]!.percentage);
      }

      chart = {
        title: clampWords(
          String(rawChartCandidate?.title || 'PROPORSI DISTRIBUSI & ALOKASI PROGRAM').replace(/\s*\/\/+\s*/g, ' '),
          38
        ).toUpperCase(),
        type: 'DONUT',
        slices: normalized,
      };
    } else {
      chart = {
        title: 'PROPORSI ALOKASI & FOKUS INTERVENSI',
        type: 'DONUT',
        slices: [
          { label: 'LAYANAN UTAMA', percentage: 44 },
          { label: 'BANTUAN SASARAN', percentage: 26 },
          { label: 'SARANA PENDUKUNG', percentage: 18 },
          { label: 'EVALUASI BERKALA', percentage: 12 },
        ],
      };
    }
  }

  const sectionHeading = isInfographic
    ? cleanEditorialSectionHeading((raw as any).sectionHeading || (raw as any).subHeading || (raw as any).lowerHeading, topic)
    : undefined;

  return {
    kicker: clampWords(sanitizedKicker, COPY_LIMITS.kicker).toUpperCase(),
    headline: clampWords(
      MasterEditorialSanitizer.cleanHeadline(rawHeadline, topic),
      COPY_LIMITS.headline
    ).toUpperCase(),
    deck: clampSentence(s(raw.deck || raw.summary || raw.ringkasan || `Telaah substansial mengenai ${topic}.`), COPY_LIMITS.deck),
    stats,
    chart,
    sectionHeading,
    points: finalPoints,
    closingLine: clampSentence(s(raw.closingLine || raw.closing || 'Komitmen terukur bagi transparansi dan kemaslahatan publik.'), COPY_LIMITS.closing),
    visualSubject:
      (raw.visualSubject || '').trim() ||
      (isInfographic
        ? `authentic realistic documentary photograph of everyday Indonesian citizens, workers, and public environment directly related to: ${topic}`
        : `everyday Indonesian civic life directly related to: ${topic}`),
  };
}

export async function synthesizeArtCollageCopy(params: {
  topic: string;
  groundedContext?: string;
  archetype?: CreativePosterArchetype;
}): Promise<ArtCollageCopy> {
  const { topic, groundedContext, archetype } = params;
  const isInfographic = isInfographicArchetype(archetype);

  let learnedMemoriesText = '';
  try {
    if (archetype) {
      const mems = await db
        .select({ ruleInstruction: studioAiLearnedMemories.ruleInstruction })
        .from(studioAiLearnedMemories)
        .where(
          and(
            or(
              eq(studioAiLearnedMemories.archetype, archetype),
              eq(studioAiLearnedMemories.archetype, 'GLOBAL')
            ),
            eq(studioAiLearnedMemories.isActive, true)
          )
        )
        .orderBy(desc(studioAiLearnedMemories.triggerCount))
        .limit(15);

      if (mems && mems.length > 0) {
        learnedMemoriesText = `\nATURAN KUALITAS & POLA YANG TELAH DIPELAJARI AI DARI DATABASE (CRITICAL LEARNED RULES - WAJIB PATUH 100%):\n${mems
          .map((m, i) => `${i + 1}. ${m.ruleInstruction}`)
          .join('\n')}\n`;
      }
    }
  } catch (err: any) {
    console.warn(`[ArtCollageDirector] Gagal membaca active learned memories: ${err?.message}`);
  }

  let systemPrompt = '';

  if (isInfographic) {
    const specificGuide =
      'Tulis TEPAT 6 butir analisis mendalam, temuan data lapangan, rincian mekanisme kebijakan, dan langkah strategis terukur yang SANGAT LENGKAP, BANYAK, DAN PADAT INFORMASI (masing-masing poin wajib 2 sampai 3 kalimat utuh / 24-38 kata per poin) dengan besaran angka, persentase, alokasi anggaran, lokasi/wilayah fokus, serta target capaian riil yang relevan 100% dengan topik infografis.';

    systemPrompt = `Anda adalah Lead Visual Data Journalist & Analis Kebijakan Publik Senior berstandar riset nasional (seperti Katadata, Kompas Data, Lokadata, Tempo Data Science).
Tugas Anda adalah menyusun naskah isi konten INFOGRAFIS DATA RESMI yang JAUH LEBIH LENGKAP, MENDALAM, BANYAK, KAYA DATA KUANTITATIF, DAN 100% RELEVAN dengan topik: "${topic}".
${groundedContext ? `\nFAKTA RISET, ARTIKEL & DATA DAERAH RUJUKAN:\n${groundedContext.slice(0, 4500)}\n` : ''}${learnedMemoriesText}

TAHAP DEEP THINKING, REASONING & AUDIT MANDIRI SEBELUM GENERASI (WAJIB DILAKUKAN SECARA MENDALAM):
Sebelum mengeluarkan format JSON, Anda WAJIB berpikir mendalam dan menganalisis secara cermat:
1. Analisis Kebutuhan Topik: Selidiki topik "${topic}" secara spesifik. Identifikasi data kuantitatif, nominal anggaran, persentase kemantapan, dan kebutuhan wilayah riil di lapangan.
2. Verifikasi Kepatuhan Menyeluruh terhadap Setiap Aturan di tabel 'studio_ai_learned_memories' di atas:
   - Pastikan TIDAK ADA pembungkus card/kotak/glass container (Zero-Card Direct Inking).
   - Pastikan HANYA ADA 1 baris KPI tunggal (4 metrik makro) di bawah judul, DILARANG ada KPI bar kedua di bawah foto.
   - Pastikan TEPAT 1 Donut Chart proporsi 100% dengan 4 slices utuh (sum = 100).
   - Pastikan TEPAT 6 butir analisis substantif yang 100% berbeda tanpa pengulangan (Poin 01-03 zona atas, Poin 04-06 zona bawah).
   - Pastikan foto dokumenter bebas dari teks atau kartu.
3. Strategi Variasi Subjek Visual (visualSubject) yang Beragam & Sesuai Topik "${topic}":
   Untuk mencegah hasil visual yang monoton, deskripsikan adegan fotografi dokumenter Indonesia yang 100% sesuai dengan substansi "${topic}" dalam Bahasa Inggris (maks 45 kata):
   - KHUSUS TEMPLATE 'INFOGRAPHIC_CHRONICLE_GRID' (Template 02) DAN 'INFOGRAPHIC_RADIAL_CLOCK' (Jam Melingkar Radial / Template 03): Template ini WAJIB memiliki BANYAK GAMBAR DOKUMENTER (4 adegan foto berbeda dalam grid 2x2: (1) potret petugas/warga di lapangan, (2) kondisi lokasi/fasilitas utama, (3) proses pelaksanaan teknis/pelayanan, (4) dampak langsung bagi masyarakat).
   - UNTUK TEMPLATE LAINNYA: Deskripsikan 1 adegan fokus fotografi dokumenter Indonesia yang otentik dan relevan langsung dengan topik "${topic}".

PEDOMAN UTAMA KELENGKAPAN, RELEVANSI DIKSI & KEDALAMAN KONTEN INFOGRAFIS (${specificGuide}):
1. Gunakan Bahasa Indonesia jurnalistik yang luwes, kontekstual, tajam, dan langsung berbicara tentang substansi topik "${topic}".
2. PANTANGAN MUTLAK KATA META-TEMPLATE (CRITICAL — JANGAN PERNAH DILANGGAR):
   - DILARANG KERAS menulis kalimat atau sub-judul kaku yang terdengar seperti instruksi form/template seperti:
     * "LANJUTAN ANALISIS & RENCANA AKSI (POIN 04 – POIN 06)"
     * "(POIN 04 - POIN 06)" atau "(POIN 01 - POIN 03)"
     * "POIN 01", "POIN 02", "INDIKATOR 01", "TONGGAK 01", "FASE 01" di dalam teks/label
     * Judul generik kaku seperti "DIAGNOSA MASALAH...", "PETA SEBARAN WILAYAH...", "SKEMA PROGRAM INTERVENSI...", "PENGUATAN INFRASTRUKTUR...", "INTEGRASI BASIS DATA...", atau "PROYEKSI DAMPAK JANGKA PANJANG".
   - Sebagai gantinya, setiap sub-judul poin (label) dan judul seksi bawah (sectionHeading) WAJIB menggunakan diksi substantif yang spesifik sesuai kosakata topik "${topic}"!
     * Contoh sub-judul (label) yang BAIK & RELEVAN (misal topik Puskesmas Lansia): "AKSES PEMERIKSAAN LANSIA DESA", "PRIORITAS CIDADAP & UJUNGBERUNG", "JADWAL KUNJUNGAN TIM MEDIS", "REHABILITASI 50 PUSKESMAS PEMBANTU", "PEMANTAUAN KESEHATAN TIAP SEMESTER", "PENURUNAN RISIKO PENYAKIT KRONIS".
     * Contoh sub-judul (label) yang BAIK & RELEVAN (misal topik Beasiswa Pendidikan): "KESENJANGAN AKSES SISWA PRAPSEJAHTERA", "KUOTA PRIORITAS 12 KECAMATAN", "SELEKSI PRESTASI & TRANSFER LANGSUNG", "PEMENUHAN LABORATORIUM & RUANG KELAS", "AUDIT TERBUKA PENERIMA BEASISWA", "PENINGKATAN LULUSAN PERGURUAN TINGGI".

STRUKTUR WAJIB INFOGRAFIS DATA LENGKAP:
1. headline: Judul utama infografis yang tegas, spesifik, berbobot, dan langsung mencerminkan inti topik (maks 42 karakter agar proporsional di bagian atas, huruf kapital).
2. kicker: Rubrik klasifikasi dokumen riset/kebijakan di bagian atas TANPA simbol "//" (misal: "DATA LAYANAN KESEHATAN • ANALISIS KOMPREHENSIF DAERAH", "DATA ANGGARAN APBD • TELAAH KEBIJAKAN PENDIDIKAN", maks ${COPY_LIMITS.kicker} karakter).
3. deck: Ringkasan Eksekutif Komprehensif sepanjang 2 sampai 3 kalimat lengkap (minimal 28-40 kata, maks ${COPY_LIMITS.deck} karakter) yang merangkum potret besar topik: besaran anggaran/indikator makro, perbandingan tren/baseline sebelumnya, cakupan wilayah sasaran, serta urgensi strategis kebijakan.
4. stats: TEPAT 4 Indikator Makro Ringkas (Key Performance Indicators / KPI Primer) berupa metrik agregat tingkat tinggi yang paling krusial dan relevan dengan topik:
   - Stat 1: Indikator persentase/rasio capaian atau tren utama (contoh value: "85%", label: "Cakupan Layanan").
   - Stat 2: Total alokasi anggaran / nilai ekonomi makro (contoh value: "RP 500 M", label: "Total Anggaran Program").
   - Stat 3: Cakupan geografis / wilayah fokus intervensi (contoh value: "15 KECAMATAN", label: "Wilayah Operasional").
   - Stat 4: Target penerima manfaat atau sasaran output terukur (contoh value: "> 100.000", label: "Target Penerima Manfaat").
   * Setiap label KPI wajib SINGKAT, PADAT, DAN TEGAS (2 sampai 3 kata saja, maksimal 22 karakter) dengan ejaan Bahasa Indonesia baku agar hurufnya besar dan tidak berdesakan di kolom KPI!
5. sectionHeading: Judul sub-bagian bawah yang alami, spesifik, dan relevan 100% dengan topik "${topic}" (3 sampai 6 kata, maks 48 karakter, TANPA kata "LANJUTAN ANALISIS", TANPA "(POIN 04 - POIN 06)"). Contoh: "STRATEGI PENINGKATAN FASILITAS & TARGET LAYANAN LANSIA" atau "PEMERATAAN SARANA SEKOLAH & AKUNTABILITAS BEASISWA".
6. points: TEPAT 6 Butir Analisis Komprehensif & Strategi Pelaksanaan yang MENDALAM, LENGKAP, DAN 100% BERBEDA SATU SAMA LAIN (TANPA SIMBOL "//" DAN TANPA KATA "POIN 01"):
   - ATURAN PANJANG & KELENGKAPAN TIAP POIN (WAJIB DIPATUHI):
     * Setiap item pada points (urutan 1 s/d 6) DILARANG hanya berisi 1 kalimat pendek!
     * Setiap poin WAJIB berisi 2 sampai 3 kalimat utuh dan padat (sekitar 24 sampai 38 kata, atau 190 sampai ${COPY_LIMITS.pointText} karakter per poin) yang memuat:
       (a) Data kuantitatif / angka / persentase / fakta riil di lapangan,
       (b) Penjelasan mekanisme teknis / rincian alokasi / lokasi wilayah fokus / instrumen kebijakan, dan
       (c) Target hasil atau dampak konkret yang dirasakan oleh masyarakat.
     * Setiap label poin (3 sampai 5 kata, maks ${COPY_LIMITS.pointLabel} karakter) WAJIB berupa judul jurnalistik yang alami dan spesifik sesuai topik (DILARANG menyalin nama kategori prompt, DILARANG memakai simbol "//", dan DILARANG menulis "POIN 01" di dalam label).
   - 6 CAKUPAN SUBSTANSI YANG HARUS DIULAS SECARA ALAMI (SESUAIKAN JUDUL LABEL DENGAN TOPIK "${topic}"):
     * Butir 1: Mengulas kondisi riil di lapangan, angka kesenjangan akses saat ini, serta kebutuhan mendesak warga terkait ${topic}.
     * Butir 2: Mengulas fokus wilayah/kecamatan/desa prioritas beserta alasan pemilihan lokasi dan proporsi penyaluran kuota/anggaran.
     * Butir 3: Mengulas mekanisme operasional pelaksanaan program di lapangan, jadwal/tahapan layanan, serta kolaborasi petugas/instansi terkait.
     * Butir 4: Mengulas peningkatan kualitas fasilitas, ketersediaan sarana pendukung, serta target rehabilitasi atau pemenuhan standar pelayanan.
     * Butir 5: Mengulas mekanisme pemutakhiran data penerima manfaat, pengawasan berkala, serta pelibatan masyarakat dalam menjaga transparansi.
     * Butir 6: Mengulas target keberhasilan jangka menengah-panjang serta dampak nyata program terhadap peningkatan kualitas hidup warga.
   - ATURAN ANTI-DUPLIKASI MUTLAK (ZERO DUPLICATION):
     * DILARANG KERAS menyalin/mengulang metrik yang sudah ada di stats (KPI 1-4) menjadi judul points!
     * Keenam item points WAJIB memiliki label dan text yang 100% berbeda satu sama lain. DILARANG ada dua poin dengan angka, judul, atau isi kalimat yang sama/mirip!
7. chart: Data Grafik Pie / Donut Chart Proporsi (WAJIB ADA) yang relevan 100% dengan topik "${topic}":
   - title: Judul grafik proporsi yang spesifik sesuai topik (maks 36 karakter, contoh: "PROPORSI ALOKASI ANGGARAN PUSKESMAS", "KOMPOSISI DANA PENDIDIKAN DAERAH").
   - slices: TEPAT 4 segmen proporsi. Setiap label segmen WAJIB berupa frasa benda utuh 2 kata (maks 20 karakter, TANPA kata sambung "&" atau "DAN" agar tidak terpotong, contoh: "LAYANAN MEDIS", "PROMOSI KESEHATAN", "PELATIHAN TENAGA", "EVALUASI PROGRAM"), dan percentage berupa angka bulat yang jika dijumlahkan ke-4 segmennya TEPAT = 100 (contoh: 40, 30, 20, 10).
8. closingLine: Sintesis Rekomendasi Kebijakan sepanjang 1 sampai 2 kalimat lengkap dan tegas (18-28 kata, maks ${COPY_LIMITS.closing} karakter) yang merangkum urgensi transparansi, pengawasan berlapis, dan target keberhasilan bagi masyarakat luas.
9. PANTANGAN: DILARANG kata "nyata", DILARANG simbol "//", DILARANG menulis "(POIN 04 - POIN 06)" atau "LANJUTAN ANALISIS", DILARANG membuat poin yang pendek/menggantung.
10. visualSubject: ${
      archetype === 'INFOGRAPHIC_CHRONICLE_GRID' || archetype === 'INFOGRAPHIC_RADIAL_CLOCK'
        ? `Deskripsi 4 adegan fotografi dokumenter Indonesia yang berbeda namun saling berkaitan (4-panel archival documentary photography: field portrait, facility overview, technical action, and community benefit) khusus untuk topik "${topic}" dalam Bahasa Inggris (maks 45 kata). PANTANGAN: DILARANG patung asing, DILARANG kartun/3D render, DILARANG teks di dalam foto.`
        : `Deskripsi 1 subjek visual fotografi dokumenter Indonesia yang konkret, otentik, dan relevan langsung dengan topik "${topic}" dalam Bahasa Inggris (maks 35 kata), ditempatkan secara ringkas di satu jendela fokus dengan menyisakan 75% ruang kosong kertas bersih (open negative space) untuk teks infografis. PANTANGAN MUTLAK: DILARANG multi-panel kolase ramai, DILARANG 2 foto bertumpuk, DILARANG patung asing/Yunani, DILARANG animasi, DILARANG kartun, DILARANG 3D render, DILARANG menyebut kotak/card/bagan/teks.`
    }

Format JSON Wajib:
{"kicker":"","headline":"","deck":"","stats":[{"value":"","label":""}],"chart":{"title":"","slices":[{"label":"","percentage":40},{"label":"","percentage":30},{"label":"","percentage":20},{"label":"","percentage":10}]},"sectionHeading":"","points":[{"label":"","text":""}],"closingLine":"","visualSubject":""}`;
  } else {
    const posterGuide = archetype === 'RETRO_CAMPAIGN' ? '\nTeks poster kampanye persuasif lugas.\n' : '';

    systemPrompt = `Anda adalah copywriter editorial kebijakan publik profesional berstandar tinggi (mengikuti Master Editorial Rules).
Tulis teks poster ringkas bertopik: "${topic}".
${posterGuide}${groundedContext ? `\nFAKTA RISET:\n${groundedContext.slice(0, 1800)}\n` : ''}
PEDOMAN MASTER EDITORIAL RULES (WAJIB DIPATUHI):
- Bahasa Indonesia baku, modern, matang, berbobot substantif, bukan gaya birokrasi kaku atau brosur jualan.
- headline: 2 sampai 4 kata spesifik dan kontemporer, maks ${COPY_LIMITS.headline} karakter.
- kicker: label rubrik ringkas di atas judul (misal: "TELAAH ISU", "KEBIJAKAN KESEHATAN", "INFRASTRUKTUR WILAYAH"), maks ${COPY_LIMITS.kicker} karakter.
- deck: 1 kalimat pengantar tuntas yang memperjelas tesis persoalan (bukan mengulang judul), maks ${COPY_LIMITS.deck} karakter.
- points: TEPAT 2 atau 3 butir analisis konkret. label maks ${COPY_LIMITS.pointLabel} karakter, text 1 kalimat analitis tuntas maks ${COPY_LIMITS.pointText} karakter.
- closingLine: 1 kalimat sintesis arah tindak lanjut terukur, maks ${COPY_LIMITS.closing} karakter.
- visualSubject: deskripsi adegan visual dalam BAHASA INGGRIS (maks 40 kata) yang menggambarkan topik yang sama secara konkret di Indonesia.

Keluarkan JSON murni:
{"kicker":"","headline":"","deck":"","stats":[{"value":"","label":""}],"points":[{"label":"","text":""}],"closingLine":"","visualSubject":""}`;
  }

  try {
    let userInstruction = '';
    if (archetype === 'INFOGRAPHIC_NARRATIVE_WAVE') {
      userInstruction = `Susun naskah infografis GELOMBANG NARATIF MERAH (S-CURVE NARRATIVE WAVE) khusus untuk topik "${topic}".
Arketipe ini berstandar editorial data journalism presisi tinggi tanpa card/kotak.

PANTANGAN MUTLAK & LARANGAN KERAS:
- DILARANG MENYALIN ISTILAH CONTOH! Seluruh isi naskah (kicker, headline, deck, stats, badge pada poin, dan butir analisis) WAJIB 100% DISESUAIKAN DENGAN SUBSTANSI TOPIK "${topic}".
- JANGAN PERNAH menyalin kata "infrastruktur", "jalan rusak", atau "penurunan kerusakan" bila topik yang sedang dibahas adalah pertanian, ketahanan pangan, kesehatan, pendidikan, bansos, UMKM, lingkungan hidup, dsb!

PANDUAN STRUKTUR WAJIB:
- headline: Tajam, ringkas (maks 5-7 kata), bernas dan langsung pada pokok masalah dalam huruf kapital.
- kicker: Rubrik ringkas kebijakan publik sesuai topik (misal jika pangan: "DATA KETAHANAN PANGAN DAERAH • ANALISIS PERTANIAN DAERAH", jika pendidikan: "DATA PENDIDIKAN DAERAH • ANALISIS MUTU SEKOLAH").
- deck: Ringkasan eksekutif 2-3 kalimat lengkap yang kaya konteks dan data riil sesuai topik (besaran anggaran, sasaran kuota, cakupan wilayah penerima manfaat).
- stats: Tepat 4 KPI makro terukur:
  * KPI 01: Hero Metric persentase capaian/kondisi utama (misal: "92%", label sesuai topik seperti "Tingkat Serapan Kuota" / "Tingkat Kelulusan").
  * KPI 02: Total anggaran atau nilai alokasi dana (misal: "RP 14,2 M", label sesuai topik seperti "Alokasi Subsidi Tani" / "Bantuan Operasional").
  * KPI 03: Cakupan wilayah/zona prioritas (misal: "8 KECAMATAN", label sesuai topik seperti "Kawasan Sentra Aktif").
  * KPI 04: Target penerima manfaat/sasaran output (misal: "3.450 PETANI", label sesuai topik seperti "Sasaran Penerima Manfaat").
- sectionHeading: Judul seksi strategi bawah yang 100% relevan dengan substansi topik (misal jika pertanian: "AKSELERASI PRODUKTIVITAS DAN AKUNTABILITAS", jika kesehatan: "AKSELERASI LAYANAN DAN FASILITAS KESEHATAN").
- points: TEPAT 6 BUTIR ANALISIS LENGKAP (Point 01 s/d Point 06). DILARANG HANYA 4 BUTIR! WAJIB 6 BUTIR:
  * 01: Kondisi eksisting dan tantangan lapangan saat ini. Wajib sertakan badge tematik singkat (misal: "INDIKATOR KUNCI" atau "KONDISI RIIL").
  * 02: Fokus wilayah/sasaran prioritas intervensi. Wajib sertakan badge tematik singkat (misal: "PROGRAM INTERVENSI" atau "SASARAN PRIORITAS").
  * 03: Mekanisme pelaksanaan program & koordinasi dinas/stakeholder.
  * 04: Standar mutu sarana/layanan atau target capaian spesifik topik. Wajib sertakan badge tematik singkat yang RELEVAN DENGAN TOPIK (misal jika pertanian/pangan: "TARGET PRODUKSI & DISTRIBUSI", jika kesehatan: "STANDAR LAYANAN", jika penurunan masalah: "TARGET PENURUNAN", jika umum: "SASARAN STRATEGIS").
  * 05: Pemutakhiran data berkala & sistem pengawasan akuntabel.
  * 06: Dampak jangka panjang & peningkatan kesejahteraan warga.
  Setiap butir wajib memuat 2 kalimat padat data, judul tematik tanpa kata "Poin", badge tematik (khusus butir 1, 2, dan 4), dan 100% berbeda satu sama lain!
  PANTANGAN MUTLAK: DILARANG MEMBUNGKUS TEKS DALAM CARD/KOTAK. Teks akan dicetak langsung di kanvas kertas dan pita gelombang merah.
- chart: TEPAT 1 GRAFIK DONUT PROPORSI 100% (WAJIB ADA). Berisi title spesifik topik (misal: "ALOKASI VOLUME PUPUK SUBSIDI KOTA" jika pertanian, atau "PROPORSI ALOKASI DANA BOS" jika pendidikan) dan 4 slices proporsi (label 2 kata tanpa "&", percentage bilangan bulat yang bila dijumlahkan TEPAT = 100). PANTANGAN DUPLIKASI DATA: Setiap persentase pada ke-4 slice WAJIB berbeda satu sama lain (misal 45%, 30%, 15%, 10%), dilarang membuat angka kembar/duplikat! Angka di chart dan label KPI tidak boleh berulang!
- closingLine: 1 kalimat kesimpulan komitmen advokasi kebijakan publik.`;
    } else if (archetype === 'INFOGRAPHIC_CHRONICLE_GRID') {
      userInstruction = `Susun naskah infografis KRONIK BROADSHEET GRID (TEMPLATE 02 - MULTI-PHOTO ARCHIVAL CHRONICLE) khusus untuk topik "${topic}".
Arketipe ini mengadopsi standar emas referensi koran kronik multi-foto (seperti infografis kronik Jenderal Soedirman) dengan blok aksen Oranye Terakota (#EA580C), Hijau Hutan (#15803D), kertas krem hangat, dan BANYAK BINGKAI FOTO DOKUMENTER.

ATURAN WAJIB & PANTANGAN MUTLAK:
1. 100% RELEVAN DENGAN TOPIK "${topic}" (ZERO HARDCODE LINTAS TOPIK):
   - DILARANG KERAS menulis istilah pertanian ("hasil panen", "kartu tani", "pupuk subsidi", "benih") jika topik adalah infrastruktur jalan, kesehatan, pendidikan, dsb.!
   - Sebaliknya, DILARANG menulis istilah jalan/aspal jika topik adalah pertanian, kesehatan, atau pendidikan!
2. ZERO DUPLIKASI KPI & JUDUL:
   - Pastikan ke-4 stats KPI memiliki angka (value) dan keterangan (label) yang 100% unik dan tidak diulang di dalam judul points.
   - Pastikan sectionHeading, chart.title, dan ke-6 points[i].label semuanya berbeda satu sama lain (jangan pernah membuat judul poin yang kembar dengan judul seksi/kartu).
3. IZIN GENERATE LEBIH DARI 1 GAMBAR (MULTI-PHOTO VISUAL SUBJECT):
   - Untuk template INFOGRAPHIC_CHRONICLE_GRID ini, AI DIIZINKAN DAN DIWAJIBKAN men-generate 4 adegan foto dokumenter berbeda dalam 1 kanvas grid 2x2.
   - Tuliskan visualSubject dalam Bahasa Inggris yang mendeskripsikan 4 foto dokumenter Indonesia yang relevan langsung dengan "${topic}" (Scene 1: potret petugas/warga di lapangan, Scene 2: potret infrastruktur/lokasi sasaran, Scene 3: aktivitas pelaksanaan teknis, Scene 4: manfaat bagi warga lokal).
4. KELENGKAPAN DATA:
   - Tepat 4 stats KPI makro, 1 chart Donut 100% (4 slices unik yang jumlahnya = 100), dan 6 points analisis mendalam (masing-masing 2-3 kalimat padat data kuantitatif, tanpa simbol "//" dan tanpa kata "Poin 01").`;
    } else if (archetype === 'INFOGRAPHIC_RADIAL_CLOCK') {
      userInstruction = `Susun naskah infografis KRONIK MELINGKAR TAHAPAN KEBIJAKAN (TEMPLATE 03 - RADIAL CHRONICLE / OPSI D) khusus untuk topik "${topic}".
Arketipe ini mengadopsi standar emas referensi kronik radial kebijakan publik dengan elemen pusat simbolik berwibawa (Kompas Navigasi Kebijakan, Segel Medali Emas Resmi, Dial Gauge Capaian Kinerja, atau Hub Siklus Tahapan), 6 sektor pancaran tahapan program, dan 4-5 foto dokumenter menyatu alami yang mengalir dinamis secara orbital S-curve.

ATURAN WAJIB & PANTANGAN MUTLAK HASIL EVALUASI DESAIN:
1. 100% RELEVAN DENGAN TOPIK "${topic}" (ZERO HARDCODE LINTAS TOPIK):
   - Seluruh isi naskah (kicker, headline, deck, stats, dan keenam points sektor radial) WAJIB 100% relevan dengan substansi "${topic}".
   - DILARANG KERAS menulis istilah lintas topik yang tidak berkaitan!
2. ZERO DUPLIKASI KPI & JUDUL SEKTOR:
   - Pastikan ke-4 stats KPI memiliki angka (value) dan keterangan (label) yang 100% unik dan tidak diulang di dalam judul points.
   - Pastikan ke-6 points[i].label (judul sektor pancaran) semuanya berbeda satu sama lain dan singkat-tegas (3-5 kata).
3. IZIN GENERATE LEBIH DARI 1 GAMBAR & PENGATURAN ALUR S-CURVE DINAMIS:
   - AI DIIZINKAN DAN DIWAJIBKAN men-generate 4 adegan foto dokumenter berbeda dalam grid 2x2.
   - Foto-foto ini akan disusun secara orbital S-curve meliuk (bukan sejajar lurus vertikal):
     * Scene 1: Top Hero Photo (Kanan Atas / Kiri Atas)
     * Scene 2: Lapangan & Aksi Intervensi Dekat Pusat Simbolik (Kiri / Kanan Dalam)
     * Scene 3: Fasilitas Fisik & Infrastruktur Pelayanan Nyata (Kanan / Kiri Luar)
     * Scene 4: Foto Penutup Jangkar Lapangan (Kanan / Kiri Bawah) yang mengisi kokoh paruh bawah poster.
   - Tuliskan visualSubject dalam Bahasa Inggris yang mendeskripsikan 4 adegan fotografi dokumenter Indonesia yang tajam dan relevan langsung dengan "${topic}".
4. PENGISIAN PADAT PARUH BAWAH KANVAS (ANTI-BOTTOM VOID):
   - Poin 05 (Pengawasan/Audit Berkala) dan Poin 06 (Keberlanjutan Manfaat Warga / Target Kemantapan) serta closingLine WAJIB ditulis dengan kalimat substantif yang berbobot agar mengisi penuh ruang bawah bersama Pita Akuntabilitas Publik dan foto jangkar bawah.
5. KELENGKAPAN DATA:
   - Tepat 4 stats KPI makro, dan TEPAT 6 points sektor radial (masing-masing 2 kalimat utuh dan padat data kuantitatif, tanpa simbol "//" dan tanpa kata "Poin 01").`;
    } else if (archetype === 'INFOGRAPHIC_ADVOCACY_PILLARS') {
      userInstruction = `Susun naskah infografis advokasi kerakyatan 5 PILAR AKSI (Template 04 Gold Standard) untuk topik "${topic}".
1. HEADLINE: Judul besar monumental, tegas, dan menggugah nurani (contoh: "MISKIN DI NEGERI KAYA" atau "PUTUSKAN RANTAI KEMISKINAN DAERAH" atau disesuaikan dengan topik "${topic}").
2. KICKER: "DATA ADVOKASI SOSIAL • STRATEGI 5 PILAR KERAKYATAN".
3. DECK: 2-3 kalimat analisis kritis yang mendalam mengenai urgensi kebijakan publik dan keadilan sosial bagi warga.
4. STATS: 3 metrik makro spesifik. Stats pertama WAJIB berupa persentase angka besar dominan (contoh: "8,4%" atau "22,5%" atau besaran APBD triliun rupiah) dengan label masalah riil.
5. SECTION HEADING / SLOGAN AKSI: Satu baris slogan aksi yang kuat (contoh: "✦ MARI BERSAMA-SAMA PUTUSKAN RANTAI KEMISKINAN ✦" atau "✦ 5 PILAR AKSI STRATEGIS ADVOKASI KERAKYATAN ✦").
6. POINTS (5 PILAR AKSI): TEPAT 5 PILAR (PILAR 01 s/d PILAR 05). Masing-masing pilar WAJIB memiliki:
   - badge: 1 huruf akronim yang membentuk kata bermakna (contoh: P, U, T, U, S atau A, K, S, I, !) ATAU kode angka "01", "02", "03", "04", "05".
   - label: Judul pilar aksi yang lugas (contoh: "PEDULI SESAMA", "UTAMAKAN KEADILAN", "TOLONG KELUARGA RENTAN", "UBAH KUALITAS HIDUP", "SATUKAN LANGKAH ADVOKASI").
   - text: 2 kalimat terukur mengenai implementasi nyata kebijakan di lapangan.
   - metric: Target capaian konkret (contoh: "TARGET 100%", "98% TERCAPAI", "ALOKASI RP 4,2 M").
Chart HARUS null.`;
    } else if (isInfographic) {
      userInstruction = `Susun naskah infografis yang SANGAT LENGKAP, BANYAK, MENDALAM, DAN KAYA DATA untuk topik "${topic}". Pastikan seluruh pilihan kata (headline, sectionHeading, dan keenam label points) 100% relevan dan spesifik membahas substansi "${topic}" (JANGAN memakai istilah template kaku seperti "Diagnosa Masalah", "Peta Sebaran", "Skema Program", atau "Lanjutan Analisis (Poin 04 - Poin 06)"). Pastikan deck terdiri dari 2-3 kalimat lengkap, 4 stats KPI makro yang spesifik, 1 chart proporsi (4 segmen utuh tanpa "&"), serta 6 points analisis yang masing-masing terdiri dari 2-3 kalimat utuh tanpa ada satu pun poin yang diulang.`;
    } else {
      userInstruction = `Susun naskah poster editorial yang tajam dan berbobot untuk topik "${topic}".`;
    }

    const clientToUse = routerClient || openaiClient;
    const rawCopyModel =
      process.env.POSTER_COPY_MODEL ||
      (routerClient ? 'ag/gemini-3.8-flash' : 'gpt-4o-mini');
    const copyModel = routerClient ? normalizeGeminiModel(rawCopyModel) : rawCopyModel;

    const response = await clientToUse.chat.completions.create({
      model: copyModel,
      stream: false,
      temperature: 0.45,
      max_tokens: 1800,
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userInstruction },
      ],
    });
    const rawContent = response.choices[0]?.message?.content || '{}';
    const cleanedJson = rawContent.replace(/```json/gi, '').replace(/```/g, '').trim();
    const parsed = JSON.parse(cleanedJson) as Partial<ArtCollageCopy>;
    return finalizeCopy(parsed, topic, archetype);
  } catch (err: any) {
    console.warn(`[ArtCollageDirector] Copy AI gagal, memakai fallback deterministik: ${err?.message}`);
    const fallbackStats = [
      { value: '15,2%', label: 'Capaian Indikator Utama' },
      { value: 'RP 1,2 T', label: 'Alokasi Pagu Anggaran' },
      { value: '10 WILAYAH', label: 'Cakupan Wilayah Fokus' },
      { value: '100%', label: 'Target Akuntabilitas Data' },
    ];
    const fallbackPoints = isInfographic
      ? [
          {
            label: 'PEMETAAN KEBUTUHAN LAYANAN WARGA',
            text: `Identifikasi komprehensif terhadap kebutuhan masyarakat terkait ${topic} menunjukkan perlunya percepatan pemerataan akses dan peningkatan kualitas pelayanan bagi kelompok warga sasaran.`,
          },
          {
            label: 'PRIORITAS KECAMATAN & DESA SASARAN',
            text: 'Penetapan wilayah fokus pelaksanaan program dilakukan berbasis tingkat kebutuhan daerah agar distribusi kuota layanan dan pendampingan teknis menjangkau warga secara proporsional.',
          },
          {
            label: 'MEKANISME PELAKSANAAN & PENYALURAN',
            text: 'Dukungan pagu anggaran daerah dialokasikan secara bertahap dengan jadwal operasional serta mekanisme layanan terukur guna memastikan manfaat program dirasakan langsung oleh masyarakat.',
          },
          {
            label: 'PENINGKATAN FASILITAS & SARANA PUBLIK',
            text: 'Penguatan kapasitas infrastruktur dasar dan rehabilitasi fasilitas pelayanan publik diprioritaskan pada wilayah sasaran untuk menjamin terpenuhinya standar pelayanan prima.',
          },
          {
            label: 'PEMANTAUAN DATA & AUDIT BERKALA',
            text: 'Pemutakhiran data penerima manfaat dilakukan setiap semester disertai pengawasan lintas instansi dan pelibatan masyarakat guna menjamin ketepatan sasaran program.',
          },
          {
            label: 'TARGET DAMPAK & KUALITAS HIDUP WARGA',
            text: 'Pengukuran capaian kinerja program diarahkan pada peningkatan kesejahteraan masyarakat secara berkelanjutan serta penguatan tata kelola pelayanan publik di daerah.',
          },
        ]
      : [
          { label: 'Urgensi Isu', text: `Persoalan ${topic} memerlukan perbaikan tata kelola dan pengawasan terintegrasi.` },
          { label: 'Arah Solusi', text: 'Penyusunan regulasi komprehensif dan alokasi sumber daya berbasis data lapangan.' },
        ];

    return finalizeCopy(
      {
        kicker: isInfographic ? 'DATA KEBIJAKAN PUBLIK • ANALISIS DAERAH' : 'Telaah Isu Kebijakan',
        headline: clampWords(topic, COPY_LIMITS.headline),
        deck: `Evaluasi terukur atas tata kelola ${topic} demi kepentingan masyarakat luas.`,
        stats: isInfographic ? fallbackStats : undefined,
        points: fallbackPoints,
        closingLine: 'Dibutuhkan komitmen konkret untuk perbaikan berkelanjutan.',
        visualSubject: isInfographic
          ? `realistic photojournalistic documentary photograph of everyday Indonesian citizens, public facilities, and infrastructure related to: ${topic}`
          : `everyday Indonesian civic life directly related to: ${topic}`,
      },
      topic,
      archetype
    );
  }
}
