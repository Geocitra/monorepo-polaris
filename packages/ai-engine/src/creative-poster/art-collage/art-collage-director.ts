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

import { openaiClient } from '../../client.js';
import { MasterEditorialSanitizer } from '../../master-editorial-sanitizer.js';
import { AiTelemetryService } from '../../telemetry/ai-telemetry.service.js';
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
      'authentic Indonesian editorial broadsheet infographic artwork matching the gold reference standard: warm textured cream newsprint paper (#F8F6F0), featuring ONLY 1 single black-and-white documentary photo cutout of an Indonesian worker or citizen anchored in the upper-left quadrant (max 30% area), a sweeping bold crimson-red ribbon wave (#991B1B) flowing down the entire right-hand flank from top to bottom, and leaving the lower-left quadrant as an empty, calm, flat cream paper clearing reserved for data visualization, with ABSOLUTELY ZERO text, zero numbers, and zero charts on the artwork background. ABSOLUTELY ZERO silhouettes, zero people, and zero stick figures in the top 18% header or bottom footer area - top 18% must be pure clean unprinted cream paper.',
    anchors: ['TEXT_TOP', 'TEXT_BOTTOM'],
    paperTone: 'LIGHT',
  },
  INFOGRAPHIC_CHRONICLE_GRID: {
    style:
      'authentic Indonesian newspaper chronicle editorial infographic on warm newsprint paper matching the classic Soedirman biography layout, featuring a prominent solid orange vertical masthead pillar on the left (width 30% of canvas) with a single compact documentary portrait photo framed inside this left column, leaving the entire right-hand 68% of the canvas as a completely empty, flat, clean cream paper surface for the newspaper chronicle card grid with ZERO photos and ZERO clutter in the right column',
    anchors: ['TEXT_RIGHT', 'TEXT_TOP'],
    paperTone: 'LIGHT',
  },
  INFOGRAPHIC_RADIAL_CLOCK: {
    style:
      'vintage educational chronicle artwork on warm aged parchment paper featuring an ornate antique pocket watch dial and radial time sectors in the left margin: ONLY 1 single compact documentary photo cutout anchored strictly in the middle-left margin (max 26% area), leaving the entire top header/title/deck band, the entire lower 36% section, and the entire right-hand 65% of the canvas as a completely empty, clean, unobstructed warm parchment paper expanse for direct typography',
    anchors: ['TEXT_RIGHT', 'TEXT_TOP'],
    paperTone: 'LIGHT',
  },
  INFOGRAPHIC_ADVOCACY_PILLARS: {
    style:
      'documentary photography editorial artwork on warm alabaster paper with subtle traditional Indonesian batik motif watermark in the background, featuring ONLY 1 single compact horizontal documentary scene strictly in the narrow mid-upper band (around 24% height), leaving the entire top masthead zone and the entire lower 58% of the canvas as a completely empty, clean, unobstructed warm paper surface for direct 5-column pillar typography',
    anchors: ['TEXT_TOP', 'TEXT_BOTTOM'],
    paperTone: 'LIGHT',
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
  options?: { forcedPaletteId?: string }
): ArtCollageMutation {
  const rng = mulberry32(seed);
  const dna = ART_COLLAGE_DNA[archetype];
  const anchors = dna.anchors.length > 0 ? dna.anchors : (['TEXT_TOP'] as ArtCollageAnchor[]);
  const anchor = anchors[Math.floor(rng() * anchors.length)] ?? 'TEXT_TOP';
  const forced = options?.forcedPaletteId
    ? ART_COLLAGE_INK_PALETTES.find((p) => p.id === options.forcedPaletteId)
    : undefined;
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
    const referenceClause = params.withStyleReference
      ? 'The attached image is a COLOR PALETTE, PAPER TEXTURE, AND ARTISTIC MOOD reference ONLY. Do NOT copy its scattered multi-box layout, small circular frames, or multiple photo panels, and do NOT copy any irrelevant foreign statues or subjects from the reference! Instead, depict ONLY authentic Indonesian subjects related to the topic strictly confined to a compact 25% to 30% focal corner/margin, and leave 70% of the canvas as a completely empty, clean, unobstructed paper clearing reserved for direct typography.'
      : '';

    let negativeSpaceMandate = '';
    if (params.archetype === 'INFOGRAPHIC_CHRONICLE_GRID') {
      negativeSpaceMandate = [
        `CRITICAL COMPOSITION MANDATE FOR CHRONICLE GRID (TEMPLATE 02 - SOEDIRMAN ARCHIVAL LAYOUT):`,
        `- Left Orange Pillar & Focal Portrait: The left column (width ~30% from the left edge) features the iconic prominent solid vibrant orange masthead pillar. Inside this left column, place ONLY 1 single authentic Indonesian documentary subject photo/cutout neatly framed in the dedicated oval or rounded portrait window.`,
        `- 100% EMPTY RIGHT COLUMN (STRICT NO-PHOTO ZONE): The entire right-hand 68% of the canvas (from top to bottom, across full height) MUST be a 100% EMPTY, FLAT, UNOBSTRUCTED, CLEAN CREAM NEWSPRINT PAPER SURFACE with ZERO photos, ZERO people, ZERO landscapes, and ZERO clutter. All newspaper chronicle cards, text points, and metrics will be printed onto this clean paper on the right.`,
        `- NEVER let any photograph or visual subject extend horizontally past 32% of the canvas width!`,
      ].join('\n');
    } else if (
      params.archetype === 'INFOGRAPHIC_CLASSICAL_MONUMENT' ||
      params.archetype === 'INFOGRAPHIC_RADIAL_CLOCK' ||
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
        `CRITICAL NEGATIVE SPACE MANDATE (74% OPEN CANVAS FOR DIRECT TYPOGRAPHY):`,
        `- Visual Subject Placement: Place a compact horizontal documentary vignette strictly in the narrow mid-upper band (between 24% and 40% vertical height).`,
        `- Dedicated Open Space: The ENTIRE TOP 24% MASTHEAD ZONE and the ENTIRE LOWER 58% OF THE CANVAS MUST be a 100% EMPTY, CALM, UNOBSTRUCTED, EVENLY-LIT paper surface with ZERO photos and ZERO clutter so 5-column infographic data can be printed directly onto the paper without cards.`,
      ].join('\n');
    } else if (params.archetype === 'INFOGRAPHIC_NARRATIVE_WAVE') {
      negativeSpaceMandate = [
        `CRITICAL ARCHITECTURAL MANDATE FOR S-CURVE NARRATIVE WAVE (GOLD REFERENCE STANDARD):`,
        `- TOP 18% HEADER ZONE IS 100% STERILIZED BLANK CREAM BROADSHEET PAPER: The entire top 18% of the canvas (from vertical 0% down to 18%, across full width) MUST be completely blank, unprinted, flat warm cream paper (#F8F6F0) with ZERO photos, ZERO ribbons, and ZERO text. ABSOLUTELY ZERO people, zero walking silhouettes, zero pedestrians, zero figures, zero trees, and zero buildings in the top 18% header zone! The masthead headline, kicker, and deck will be printed programmatically here.`,
        `- SINGLE COMPACT DOCUMENTARY PHOTO CUTOUT ONLY: In the upper-left quadrant (strictly between 18% and 42% vertical height, occupying the left 44% width), place ONLY 1 single black-and-white or muted documentary photograph of authentic Indonesian workers/citizens related to the topic. Do NOT add any second photo, and NEVER draw any cards, scorecards, numbers, or UI boxes!`,
        `- SWEEPING CRIMSON S-CURVE RIBBON (ENTIRE RIGHT FLANK): A bold, graceful, deep crimson-red ribbon wave (#991B1B) flows continuously down the right-hand half of the canvas (from vertical 18% down to 90% height, occupying the right 50% width). The ribbon surface must be smooth, solid deep crimson ink for white typography.`,
        `- LOWER-LEFT 44% IS 100% BLANK CREAM BROADSHEET PAPER (DATA CLEARING): The entire lower-left area (from vertical 44% down to 90%, occupying the left 48% width) MUST be 100% COMPLETELY BLANK, CLEAN, FLAT, UNPRINTED WARM CREAM BROADSHEET PAPER (#F8F6F0). ABSOLUTELY ZERO red ribbons, ZERO charts, ZERO pie charts, ZERO metric boxes, ZERO scorecards, and ZERO text anywhere in this clearing! All charts and text will be rendered programmatically by our compositor.`,
        `- FOOTER MARGIN (y=90% to 100%): Clean flat margin for closing callout and official signature. ABSOLUTELY ZERO stick figures, zero doodle characters, zero walking silhouettes anywhere at the bottom or near the footer!`,
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

    return [
      remedyClause,
      `Create a high-resolution, print-quality editorial infographic background ARTWORK (vertical 4:5 ratio) specifically about: ${params.visualSubject}.`,
      `Artistic Style & Surface: ${dna.style}.`,
      `Subject Mandate: Depict ONLY 1 single scene of authentic Indonesian people, public facilities, or real-world settings directly related to ${params.visualSubject}. Do NOT include any unrelated statues, foreign monuments, or random icons.`,
      negativeSpaceMandate,
      referenceClause,
      `STRICT COMPOSITION MANDATES:`,
      `- SINGLE PHOTO ONLY: Render ONLY 1 single documentary photograph/illustration on the entire canvas. NEVER render 2 stacked photos (top and bottom) and NEVER place a second photo in the bottom-left or bottom-right.`,
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
function cleanEditorialPointLabel(rawLabel: string, fallbackIdx: number, topic: string): string {
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
    [/^PETA\s+SEBARAN\s+WILAYAH\s+PRIORITAS$/i, `FOKUS WILAYAH ${topic.split(' ').slice(0, 2).join(' ')}`],
    [/^PETA\s+SEBARAN\s+/i, 'CAKUPAN WILAYAH '],
    [/^SKEMA\s+PROGRAM\s+INTERVENSI\s*/i, 'MEKANISME LAYANAN '],
    [/^PROYEKSI\s+DAMPAK\s+JANGKA\s+PANJANG$/i, `TARGET KEBERHASILAN ${topic.split(' ').slice(0, 2).join(' ')}`],
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
    const topicShort = clampWords(MasterEditorialSanitizer.cleanHeadline(topic), 24).toUpperCase();
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

function cleanEditorialSectionHeading(rawHeading: string | undefined, topic: string): string {
  let cleaned = String(rawHeading || '')
    .replace(/\s*\/\/+\s*/g, ' ')
    .replace(/\(\s*POIN\s*0?\d+\s*[-–—]\s*POIN\s*0?\d+\s*\)/gi, '')
    .replace(/\bLANJUTAN\s+ANALISIS\s*(?:&|DAN)?\s*RENCANA\s+AKSI\b/gi, '')
    .replace(/\bPOIN\s*0?\d+\b/gi, '')
    .replace(/^[\s✦◈•:.\-–—]+|[\s✦◈•:.\-–—]+$/g, '')
    .trim();

  if (!cleaned || cleaned.length < 6) {
    const topicCore = clampWords(MasterEditorialSanitizer.cleanHeadline(topic), 28).toUpperCase();
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

  // Lengkapi badge tematik untuk arketipe Gelombang Naratif Merah
  if (archetype === 'INFOGRAPHIC_NARRATIVE_WAVE') {
    if (finalPoints[0] && !finalPoints[0].badge) finalPoints[0].badge = 'INDIKATOR KUNCI';
    if (finalPoints[1] && !finalPoints[1].badge) finalPoints[1].badge = 'PROGRAM INTERVENSI';
    if (finalPoints[3] && !finalPoints[3].badge) finalPoints[3].badge = 'TARGET PENURUNAN';
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
  tenantId?: string;
}): Promise<ArtCollageCopy> {
  const { topic, groundedContext, archetype, tenantId } = params;
  const isInfographic = isInfographicArchetype(archetype);
  const modelName = process.env.POSTER_COPY_MODEL || 'gpt-4o-mini';

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
3. Strategi Variasi Subjek Visual (visualSubject) yang Beragam:
   Untuk mencegah hasil visual yang monoton atau berulang antar sesi generate, rencanakan sudut pandang fotografi dokumenter yang berbeda dan segar. Pilih salah satu dari skenario otentik berikut sesuai topik:
   - Skenario A: Tim teknisi & pengawas proyek membawa waterpass/theodolite dan lembar gambar kerja di tepi proyek jalan.
   - Skenario B: Alat berat tandem road roller memadatkan aspal hitam pekat di bawah terik matahari pagi bersama kru berompi pengaman oranye.
   - Skenario C: Dialog interaktif petugas teknis dinas bersama tokoh warga desa meninjau jembatan atau drainase baru.
   - Skenario D: Sudut pandang sinematik jalan aspal baru yang membentang mulus melintasi kontur perbukitan perdesaan asri dengan rambu lalu lintas.
   - Skenario E: Pekerja konstruksi merapikan trotoar batu andesit atau dinding penahan tebing (bronjong) di tikungan rawan longsor.
   Deskripsikan subjek terpilih secara konkret dalam Bahasa Inggris untuk visualSubject (maks 35 kata).

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
10. visualSubject: Deskripsi 1 subjek visual fotografi dokumenter Indonesia yang konkret, otentik, dan relevan langsung dengan topik "${topic}" dalam Bahasa Inggris (maks 35 kata), ditempatkan secara ringkas di satu jendela fokus dengan menyisakan 75% ruang kosong kertas bersih (open negative space) untuk teks infografis. PANTANGAN MUTLAK: DILARANG multi-panel kolase ramai, DILARANG 2 foto bertumpuk, DILARANG patung asing/Yunani, DILARANG animasi, DILARANG kartun, DILARANG 3D render, DILARANG menyebut kotak/card/bagan/teks.

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

  const telemetry = AiTelemetryService.startTrace({
    operation: 'art-collage-copywriter',
    model: modelName,
    tenantId,
    inputPayload: { topic },
  });

  try {
    let userInstruction = '';
    if (archetype === 'INFOGRAPHIC_NARRATIVE_WAVE') {
      userInstruction = `Susun naskah infografis GELOMBANG NARATIF MERAH (S-CURVE NARRATIVE WAVE) untuk topik "${topic}".
Arketipe ini berstandar editorial data journalism presisi tinggi tanpa card/kotak.
PANDUAN STRUKTUR WAJIB:
- headline: Tajam, ringkas (maks 5-7 kata), bernas dan langsung pada pokok masalah dalam huruf kapital.
- kicker: Rubrik ringkas kebijakan publik (misal: "DATA INFRASTRUKTUR JALAN • ANALISIS KABUPATEN SUKABUMI").
- deck: Ringkasan eksekutif 2-3 kalimat lengkap yang kaya konteks dan data riil (besaran anggaran, persentase kemantapan, cakupan wilayah).
- stats: Tepat 4 KPI makro terukur:
  * KPI 01: Hero Metric persentase capaian/kondisi utama (misal value: "60%", label: "Jalan Mantap").
  * KPI 02: Total anggaran atau nilai alokasi dana (misal value: "RP 150 M", label: "Total Anggaran").
  * KPI 03: Cakupan wilayah/zona prioritas (misal value: "10 KECAMATAN", label: "Wilayah Prioritas").
  * KPI 04: Target penerima manfaat/sasaran output (misal value: "> 500.000", label: "Target Penerima Manfaat").
- sectionHeading: Judul seksi strategi bawah (misal: "STRATEGI PENANGANAN INFRASTRUKTUR JALAN").
- points: TEPAT 6 BUTIR ANALISIS LENGKAP (Point 01 s/d Point 06). DILARANG HANYA 4 BUTIR! WAJIB 6 BUTIR:
  * 01: Kondisi eksisting dan tantangan lapangan saat ini. Wajib beri badge tematik singkat (misal: "INDIKATOR KUNCI" atau "KONDISI RIIL").
  * 02: Fokus wilayah/kecamatan prioritas intervensi. Wajib beri badge tematik singkat (misal: "PROGRAM INTERVENSI" atau "PRIORITAS WILAYAH").
  * 03: Mekanisme pelaksanaan program & koordinasi dinas.
  * 04: Peningkatan kualitas fasilitas & sarana fisik / target penurunan. Wajib beri badge tematik singkat (misal: "TARGET PENURUNAN" atau "STANDAR LAYANAN").
  * 05: Pemutakhiran data berkala & sistem pengawasan akuntabel.
  * 06: Dampak jangka panjang & peningkatan kesejahteraan warga.
  Setiap butir wajib memuat 2 kalimat padat data, judul tematik tanpa kata "Poin", badge tematik (khusus butir 1, 2, dan 4), dan 100% berbeda satu sama lain!
  PANTANGAN MUTLAK: DILARANG MEMBUNGKUS TEKS DALAM CARD/KOTAK. Teks akan dicetak langsung di kanvas kertas dan pita gelombang merah.
- chart: TEPAT 1 GRAFIK DONUT PROPORSI 100% (WAJIB ADA). Berisi title spesifik topik (misal: "PROPORSI KONDISI JALAN KABUPATEN") dan 4 slices proporsi (label 2 kata tanpa "&", percentage bilangan bulat yang bila dijumlahkan TEPAT = 100). PANTANGAN DUPLIKASI DATA: Setiap persentase pada ke-4 slice WAJIB berbeda satu sama lain (misal 45%, 28%, 17%, 10%), dilarang membuat angka kembar/duplikat seperti 50% dan 50%! Angka di chart dan label KPI tidak boleh berulang!
- closingLine: 1 kalimat kesimpulan komitmen advokasi kebijakan publik.`;
    } else if (archetype === 'INFOGRAPHIC_ADVOCACY_PILLARS') {
      userInstruction = `Susun naskah infografis 5 PILAR ADVOKASI untuk topik "${topic}". Arketipe ini memiliki 5 pilar vertikal data.
Pastikan points terdiri dari TEPAT 5 PILAR (PILAR 01 s/d PILAR 05) dengan label tematik dan teks padat 2 kalimat, 4 stats KPI makro, dan chart HARUS null / tidak ada diagram lingkaran.`;
    } else if (isInfographic) {
      userInstruction = `Susun naskah infografis yang SANGAT LENGKAP, BANYAK, MENDALAM, DAN KAYA DATA untuk topik "${topic}". Pastikan seluruh pilihan kata (headline, sectionHeading, dan keenam label points) 100% relevan dan spesifik membahas substansi "${topic}" (JANGAN memakai istilah template kaku seperti "Diagnosa Masalah", "Peta Sebaran", "Skema Program", atau "Lanjutan Analisis (Poin 04 - Poin 06)"). Pastikan deck terdiri dari 2-3 kalimat lengkap, 4 stats KPI makro yang spesifik, 1 chart proporsi (4 segmen utuh tanpa "&"), serta 6 points analisis yang masing-masing terdiri dari 2-3 kalimat utuh tanpa ada satu pun poin yang diulang.`;
    } else {
      userInstruction = `Susun naskah poster editorial yang tajam dan berbobot untuk topik "${topic}".`;
    }

    const response = await openaiClient.chat.completions.create({
      model: modelName,
      temperature: 0.45,
      max_tokens: 1800,
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userInstruction },
      ],
    });
    const content = response.choices[0]?.message?.content || '{}';
    await telemetry.endTrace({
      inputTokens: response.usage?.prompt_tokens || Math.ceil(systemPrompt.length / 4),
      outputTokens: response.usage?.completion_tokens || Math.ceil(content.length / 4),
      status: 'SUCCESS',
      outputSummary: content.slice(0, 200),
    });

    const parsed = JSON.parse(content) as Partial<ArtCollageCopy>;
    const copy = finalizeCopy(parsed, topic, archetype);
    if (!copy.headline || copy.points.length < 2) {
      throw new Error('Copy AI tidak lengkap (headline/points).');
    }
    return copy;
  } catch (err: any) {
    await telemetry.endTrace({
      inputTokens: Math.ceil(systemPrompt.length / 4),
      outputTokens: 0,
      status: 'FAILED',
      errorMessage: err?.message,
    });
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
