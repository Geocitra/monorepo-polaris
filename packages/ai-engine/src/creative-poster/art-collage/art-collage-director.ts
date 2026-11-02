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
import type { CreativePosterArchetype } from '../types.js';
import { isInfographicArchetype } from '@polaris/shared-types';
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
      'contemporary editorial graphic narrative infographic on smooth off-white paper; dynamic geometric flow shapes and modern documentary illustrations specifically depicting the subject matter, clean paper margins',
    anchors: ['TEXT_TOP', 'TEXT_BOTTOM'],
    paperTone: 'LIGHT',
  },
  INFOGRAPHIC_CHRONICLE_GRID: {
    style:
      'editorial newspaper chronicle infographic aesthetic on clean off-white paper; clean structural layout, fine technical grid lines, subtle data accents, and high-quality documentary illustrations specifically depicting the subject matter',
    anchors: ['TEXT_RIGHT', 'TEXT_TOP'],
    paperTone: 'LIGHT',
  },
  INFOGRAPHIC_RADIAL_CLOCK: {
    style:
      'vintage editorial chronicle print on clean warm parchment paper; elegant circular milestone motifs, fine cross-hatching and technical engraving textures illustrating the specific subject matter, with generous open negative space',
    anchors: ['TEXT_RIGHT', 'TEXT_TOP'],
    paperTone: 'LIGHT',
  },
  INFOGRAPHIC_ADVOCACY_PILLARS: {
    style:
      'clean civic policy advocacy infographic illustration on warm ivory paper; modern editorial spot illustrations representing community action and policy impact on the specific subject, elegant minimal geometric accents',
    anchors: ['TEXT_TOP', 'TEXT_BOTTOM'],
    paperTone: 'LIGHT',
  },
  INFOGRAPHIC_VISIONARY_TIMELINE: {
    style:
      'sleek modern editorial milestone infographic on crisp light background; professional illustrations and technical milestone markers specifically depicting the subject matter',
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
}): string {
  const dna = ART_COLLAGE_DNA[params.archetype];
  const spatial = ANCHOR_SPATIAL_PHRASE[params.mutation.anchor];
  const p = params.mutation.palette;
  const isInfographic = isInfographicArchetype(params.archetype);

  if (isInfographic) {
    let archetypeSpatialGuide = '';
    if (params.archetype === 'INFOGRAPHIC_NARRATIVE_WAVE') {
      archetypeSpatialGuide = `Composition: Full-canvas dynamic editorial civic illustration of ${params.visualSubject}. A graceful flowing organic color ribbon in ${p.accentName} weaves through the background landscape. People and community activities are illustrated naturally across the scene. Continuous full-frame scenic artwork with zero diagram boxes.`;
    } else if (params.archetype === 'INFOGRAPHIC_CHRONICLE_GRID') {
      archetypeSpatialGuide = `Composition: Full-canvas editorial documentary illustration and authentic photojournalism capturing ${params.visualSubject}. Warm textured newsprint aesthetic with subtle fine architectural grid lines in the background. Authentic Indonesian communities, public works, and civic engagement. Pure scenic documentary scene with zero empty rectangles.`;
    } else if (params.archetype === 'INFOGRAPHIC_RADIAL_CLOCK') {
      archetypeSpatialGuide = `Composition: Full-canvas vintage editorial civic print on aged warm ivory parchment. On the center-left side, an artistic antique mechanical timepiece or compass motif is subtly integrated into historical Indonesian community architecture and progress regarding ${params.visualSubject}. The right side has a calm, open textured parchment backdrop. Pure scenic illustration with zero diagram cards.`;
    } else if (params.archetype === 'INFOGRAPHIC_ADVOCACY_PILLARS') {
      archetypeSpatialGuide = `Composition: Full-canvas editorial civic community illustration with subtle Indonesian batik motif textures in the sky. Warm, expressive everyday Indonesian citizens, workers, and public facilities related to ${params.visualSubject}. Pure scenic illustration with people and environment, zero pillar containers or card outlines.`;
    } else {
      // INFOGRAPHIC_VISIONARY_TIMELINE
      archetypeSpatialGuide = `Composition: Full-canvas contemporary editorial civic illustration depicting ${params.visualSubject}, featuring modern Indonesian civic architecture, public infrastructure, and progressive community life. Sleek modern lighting with refined textures on a crisp clean background. Pure scenic and architectural artwork only, zero timeline bars or frosted panels.`;
    }

    return [
      `Create a finished, print-quality editorial data infographic background illustration (vertical 4:5 ratio) specifically depicting: ${params.visualSubject}.`,
      `Aesthetic style: ${dna.style}.`,
      `Color scheme: ${p.accentName} accent with ${p.secondaryName} details, on clean ${p.paperName} background.`,
      `The illustrations and visual elements must represent ONLY ${params.visualSubject}. Authentic Indonesian everyday citizens, farmers, workers, infrastructure, or community setting relevant to this specific topic. No unrelated historical figures or unrelated objects.`,
      archetypeSpatialGuide,
      `STRICT NEGATIVE INSTRUCTIONS FOR INFOGRAPHIC ARTWORK:`,
      `- ABSOLUTELY DO NOT DRAW ANY UI CARDS, FROSTED GLASS RECTANGLES, WHITE BOXES, OR BLUR PANELS.`,
      `- DO NOT DRAW ANY PILLARS, CAPSULES, OR VERTICAL STRIPS.`,
      `- DO NOT DRAW ANY TIMELINE BARS, PROGRESS LINES, OR BULLET NODES.`,
      `- DO NOT DRAW ANY CHARTS, PIE GRAPHS, GAUGES, OR QR CODES.`,
      `- DO NOT DRAW ANY CHALKBOARDS, EMPTY SIGNS, OR FRAMES.`,
      `- Generate 100% PURE SCENIC ARTWORK / ILLUSTRATION ONLY. All typography, cards, and data will be overlaid programmatically.`,
      `ABSOLUTELY ZERO TEXT: No words, no letters, no numbers, no fake writing, no labels, no headings, no logos, no watermarks anywhere on the image.`,
    ].join('\n');
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
  kicker: 56,
  headline: 50,
  deck: 280,
  pointLabel: 48,
  pointText: 260,
  closing: 160,
};

function clampWords(text: string, max: number): string {
  const clean = (text || '').replace(/\s+/g, ' ').trim();
  if (clean.length <= max) return clean;
  const words = clean.split(' ');
  let out = '';
  for (const w of words) {
    const next = out ? `${out} ${w}` : w;
    if (next.length > max) break;
    out = next;
  }
  return out || clean.slice(0, max);
}

function clampSentence(text: string, max: number): string {
  const clean = (text || '').replace(/\s+/g, ' ').trim();
  if (clean.length <= max) return clean;
  const sliced = clean.slice(0, max);
  const stop = Math.max(sliced.lastIndexOf('.'), sliced.lastIndexOf(';'));
  if (stop >= max * 0.55) return sliced.slice(0, stop + 1).trim();
  return `${clampWords(clean, max - 1).replace(/[,;:\s]+$/, '')}.`;
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
  const maxPoints = isInfographic ? 5 : 3;

  const points = pointsArray
    .map((pt: any, idx: number) => {
      if (typeof pt === 'string') {
        if (pt.includes(':')) {
          const colonIdx = pt.indexOf(':');
          const lbl = pt.slice(0, colonIdx).trim();
          const txt = pt.slice(colonIdx + 1).trim();
          return {
            label: clampWords(MasterEditorialSanitizer.cleanHeadline(lbl), COPY_LIMITS.pointLabel).toUpperCase(),
            text: clampSentence(s(txt), COPY_LIMITS.pointText),
          };
        }
        return {
          label: `POIN 0${idx + 1}`,
          text: clampSentence(s(pt), COPY_LIMITS.pointText),
        };
      }
      if (typeof pt === 'object' && pt !== null) {
        const rawLabel = pt.label || pt.title || pt.name || pt.step || pt.pilar || pt.heading || `POIN 0${idx + 1}`;
        const rawText = pt.text || pt.description || pt.desc || pt.content || pt.detail || pt.uraian || '';
        return {
          label: clampWords(MasterEditorialSanitizer.cleanHeadline(rawLabel), COPY_LIMITS.pointLabel).toUpperCase(),
          text: clampSentence(s(rawText), COPY_LIMITS.pointText),
        };
      }
      return null;
    })
    .filter((pt): pt is { label: string; text: string } => Boolean(pt && (pt.label || pt.text)))
    .slice(0, maxPoints);

  // Parse stats (3 KPI highlight cards) untuk infografis
  const rawStatsCandidate = raw.stats || raw.kpis || raw.metrics || [];
  let stats: Array<{ value: string; label: string }> = [];
  if (Array.isArray(rawStatsCandidate) && rawStatsCandidate.length > 0) {
    stats = rawStatsCandidate
      .map((st: any) => ({
        value: clampWords(String(st.value || st.angka || st.metric || '').toUpperCase(), 16),
        label: clampWords(String(st.label || st.title || st.keterangan || ''), 32),
      }))
      .filter((st) => Boolean(st.value && st.label))
      .slice(0, 3);
  }

  // Jika stats belum lengkap dari AI, bentuk 3 KPI data berbasis points agar visual padat data
  if (isInfographic && stats.length < 3) {
    stats = [
      {
        value: points[0]?.label.split(' ').slice(0, 3).join(' ') || '8.3%',
        label: points[0]?.text.slice(0, 30) || 'Indeks Kondisi Lapangan',
      },
      {
        value: points[1]?.label.split(' ').slice(0, 3).join(' ') || 'RP 150 M',
        label: points[1]?.text.slice(0, 30) || 'Alokasi Anggaran APBD',
      },
      {
        value: points[2]?.label.split(' ').slice(0, 3).join(' ') || 'TARGET 2 THN',
        label: points[2]?.text.slice(0, 30) || 'Sasaran Program Terpadu',
      },
    ];
  }

  // Jika setelah diparse points masih kurang dari 2, lengkapi dari topik agar tidak gagal
  if (points.length < 2) {
    if (points.length === 1) {
      points.push({
        label: 'ARAH SOLUSI',
        text: `Implementasi kebijakan terukur dan pengawasan komprehensif atas ${topic}.`,
      });
    } else {
      points.push(
        { label: 'URGENSI ISU', text: `Persoalan ${topic} memerlukan perhatian dan penanganan berbasis data riil.` },
        { label: 'ARAH SOLUSI', text: 'Penyusunan regulasi komprehensif dan alokasi sumber daya tepat sasaran.' }
      );
    }
  }

  // 2. Normalisasi headline
  const rawHeadline = raw.headline || raw.title || raw.judul || raw.mainTitle || topic;

  let sanitizedKicker = s(raw.kicker || raw.rubrik || raw.category || 'TELAAH ISU');
  sanitizedKicker = sanitizedKicker
    .replace(/\b(?:catatan|langkah|agenda|fokus|kabar)\s+parlemen\b/gi, 'TELAAH KEBIJAKAN')
    .replace(/\bparlemen(?:\s+ri)?\b/gi, 'KEBIJAKAN PUBLIK');

  return {
    kicker: clampWords(sanitizedKicker, COPY_LIMITS.kicker).toUpperCase(),
    headline: clampWords(
      MasterEditorialSanitizer.cleanHeadline(rawHeadline, topic),
      COPY_LIMITS.headline
    ).toUpperCase(),
    deck: clampSentence(s(raw.deck || raw.summary || raw.ringkasan || `Telaah substansial mengenai ${topic}.`), COPY_LIMITS.deck),
    stats,
    points,
    closingLine: clampSentence(s(raw.closingLine || raw.closing || 'Komitmen terukur bagi transparansi dan kemaslahatan publik.'), COPY_LIMITS.closing),
    visualSubject:
      (raw.visualSubject || '').trim() ||
      `everyday Indonesian civic life directly related to: ${topic}`,
  };
}

export async function synthesizeArtCollageCopy(params: {
  topic: string;
  groundedContext?: string;
  archetype?: CreativePosterArchetype;
}): Promise<ArtCollageCopy> {
  const { topic, groundedContext, archetype } = params;
  const isInfographic = isInfographicArchetype(archetype);

  let systemPrompt = '';

  if (isInfographic) {
    let specificGuide = '';
    if (archetype === 'INFOGRAPHIC_ADVOCACY_PILLARS') {
      specificGuide = 'Tulis TEPAT 5 pilar aksi terencana. Setiap pilar memiliki target angka/metrik konkret dan penjelasan mendalam.';
    } else if (archetype === 'INFOGRAPHIC_NARRATIVE_WAVE') {
      specificGuide = 'Tulis TEPAT 4 sampai 5 dimensi isu kebijakan (misal: Sisi Anggaran, Titik Kritis Lapangan, Standar Teknis, Kanal Aduan/Akses, Regulasi).';
    } else if (archetype === 'INFOGRAPHIC_RADIAL_CLOCK') {
      specificGuide = 'Tulis TEPAT 5 tonggak waktu dan aksi strategis terukur (2 metrik urgensi untuk zona atas dan 3 fase implementasi/mitigasi untuk zona bawah).';
    } else {
      specificGuide = 'Tulis TEPAT 4 sampai 5 tonggak capaian atau tahapan kronologis terukur dengan besaran angka, target hari/bulan, atau volume output riil.';
    }

    systemPrompt = `Anda adalah Lead Visual Data Journalist & Analis Kebijakan Publik Senior berstandar riset nasional (seperti Katadata, Kompas Data, Lokadata).
Tulis naskah INFOGRAFIS DATA RESMI yang SANGAT KAYA DATA, AKURAT, DAN PADAT INFORMASI bertopik: "${topic}".
${groundedContext ? `\nFAKTA RISET & DATA DAERAH:\n${groundedContext.slice(0, 2000)}\n` : ''}

STRUKTUR WAJIB INFOGRAFIS DATA KOMPREHENSIF (${specificGuide}):
1. headline: Judul infografis yang berbobot, lugas, dan relevan (maks ${COPY_LIMITS.headline} karakter, huruf kapital).
2. kicker: Rubrik analisis kebijakan publik (misal: "DATA ANGGARAN APBD // TELAAH SOSIAL", "INFRASTRUKTUR DAERAH", maks ${COPY_LIMITS.kicker} karakter).
3. deck: Ringkasan eksekutif 2 kalimat padat yang memuat angka agregat makro dan urgensi penanganan (maks ${COPY_LIMITS.deck} karakter).
4. stats: TEPAT 3 Indikator Kinerja Utama (Key Performance Indicators / KPI Primer) berupa angka/metrik kuantitatif mencolok:
   - Stat 1: Angka persentase, rasio, atau volume utama (contoh value: "8,3% / 215 RB", label: "Tingkat Kemiskinan Terkini").
   - Stat 2: Besaran komitmen fiskal atau alokasi APBD (contoh value: "RP 150 MILIAR", label: "Alokasi Penanganan APBD").
   - Stat 3: Target kuantitatif capaian atau zona wilayah prioritas (contoh value: "3 KECAMATAN", label: "Zona Intervensi Fokus").
5. points: TEPAT 5 Butir Data Temuan & Program Aksi Terperinci:
   - label: Frasa ringkas berbobot diawali angka/fase/metrik (maks ${COPY_LIMITS.pointLabel} karakter, misal: "3 KECAMATAN EPISENTRUM", "ALOKASI RP 150 MILIAR", "TARGET PENURUNAN 2%", "24 KELURAHAN DAMPINGAN", "AUDIT TERPADU DATA DTKS").
   - text: Uraian substantif 2 kalimat padat informasi, memuat angka dan rincian langkah kebijakan (maks ${COPY_LIMITS.pointText} karakter).
6. closingLine: Rekomendasi aksi / penegasan transparansi tata kelola kebijakan (maks ${COPY_LIMITS.closing} karakter).
7. PANTANGAN: DILARANG kata "nyata", DILARANG slogan motivasional kosong tanpa data, DILARANG butir yang tidak memuat angka atau rincian kebijakan.
8. visualSubject: Deskripsi pemandangan latar belakang ilustrasi tanpa teks dalam Bahasa Inggris (maks 35 kata), gambarkan aktivitas nyata warga dan fasilitas kota/desa di Indonesia. DILARANG menyebut kotak, card, kartu, bagan, atau pilar.

Format JSON Wajib:
{"kicker":"","headline":"","deck":"","stats":[{"value":"","label":""}],"points":[{"label":"","text":""}],"closingLine":"","visualSubject":""}`;
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
    const response = await openaiClient.chat.completions.create({
      model: process.env.POSTER_COPY_MODEL || 'gpt-4o-mini',
      temperature: 0.5,
      response_format: { type: 'json_object' },
      messages: [{ role: 'system', content: systemPrompt }],
    });
    const parsed = JSON.parse(response.choices[0]?.message?.content || '{}') as Partial<ArtCollageCopy>;
    return finalizeCopy(parsed, topic, archetype);
  } catch (err: any) {
    console.warn(`[ArtCollageDirector] Copy AI gagal, memakai fallback deterministik: ${err?.message}`);
    const fallbackStats = [
      { value: '8.3%', label: 'Rasio Indikator Kunci' },
      { value: 'RP 150 M', label: 'Alokasi Anggaran APBD' },
      { value: '3 KECAMATAN', label: 'Zona Intervensi Fokus' },
    ];
    const fallbackPoints = isInfographic
      ? [
          { label: '38 TITIK PRIORITAS', text: `Pemetaan lokasi kritis di wilayah ${topic} untuk percepatan penanganan terpadu.` },
          { label: 'ALOKASI RP 45 MILIAR', text: 'Dukungan pagu anggaran APBD dialokasikan guna menjamin realisasi program berdampak langsung.' },
          { label: 'TARGET 90 HARI KERJA', text: 'Penyelesaian tahapan awal dengan pengawasan berkala dan evaluasi terukur lintas instansi.' },
          { label: '3 KECAMATAN FOKUS', text: 'Konsentrasi pendampingan intensif bagi kawasan dengan tingkat urgensi penanganan tertinggi.' },
          { label: 'AUDIT DATA & KANAL 24 JAM', text: 'Aktivasi sistem monitoring digital dan partisipasi warga guna memastikan transparansi mutlak.' },
        ]
      : [
          { label: 'Urgensi Isu', text: `Persoalan ${topic} memerlukan perbaikan tata kelola dan pengawasan terintegrasi.` },
          { label: 'Arah Solusi', text: 'Penyusunan regulasi komprehensif dan alokasi sumber daya berbasis data lapangan.' },
        ];

    return finalizeCopy(
      {
        kicker: isInfographic ? 'DATA ANGGARAN APBD // TELAAH' : 'Telaah Isu Kebijakan',
        headline: clampWords(topic, COPY_LIMITS.headline),
        deck: `Evaluasi terukur atas tata kelola ${topic} demi kepentingan masyarakat luas.`,
        stats: isInfographic ? fallbackStats : undefined,
        points: fallbackPoints,
        closingLine: 'Dibutuhkan komitmen konkret untuk perbaikan berkelanjutan.',
        visualSubject: `everyday Indonesian civic life directly related to: ${topic}`,
      },
      topic,
      archetype
    );
  }
}
