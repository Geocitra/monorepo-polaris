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
  kicker: 48,
  headline: 30,
  deck: 140,
  pointLabel: 22,
  pointText: 120,
  closing: 90,
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

function finalizeCopy(raw: Partial<ArtCollageCopy>, topic: string): ArtCollageCopy {
  const s = (t?: string) => MasterEditorialSanitizer.sanitize(t || '');
  const points = (Array.isArray(raw.points) ? raw.points : [])
    .filter((pt) => pt && (pt.label || pt.text))
    .slice(0, 3)
    .map((pt) => ({
      label: clampWords(MasterEditorialSanitizer.cleanHeadline(pt.label || ''), COPY_LIMITS.pointLabel).toUpperCase(),
      text: clampSentence(s(pt.text), COPY_LIMITS.pointText),
    }));

  return {
    kicker: clampWords(s(raw.kicker), COPY_LIMITS.kicker).toUpperCase(),
    headline: clampWords(
      MasterEditorialSanitizer.cleanHeadline(raw.headline || '', topic),
      COPY_LIMITS.headline
    ).toUpperCase(),
    deck: clampSentence(s(raw.deck), COPY_LIMITS.deck),
    points,
    closingLine: clampSentence(s(raw.closingLine), COPY_LIMITS.closing),
    visualSubject:
      (raw.visualSubject || '').trim() ||
      `everyday Indonesian civic life directly related to: ${topic}`,
  };
}

export async function synthesizeArtCollageCopy(params: {
  topic: string;
  groundedContext?: string;
}): Promise<ArtCollageCopy> {
  const { topic, groundedContext } = params;

  const systemPrompt = `Anda adalah copywriter poster advokasi kebijakan publik untuk anggota DPR/DPRD.
Tulis teks poster bertopik: "${topic}".
${groundedContext ? `\nFAKTA RISET (gunakan angka HANYA jika ada di sini, jangan mengarang angka):\n${groundedContext.slice(0, 1800)}\n` : ''}
ATURAN:
- Bahasa Indonesia baku jurnalistik, tegas, berwibawa, pro-warga. Bukan gaya brosur jualan.
- headline: 2 sampai 4 kata, maks ${COPY_LIMITS.headline} karakter.
- kicker: label rubrik singkat di atas judul, maks ${COPY_LIMITS.kicker} karakter.
- deck: 1 kalimat pengantar tuntas, maks ${COPY_LIMITS.deck} karakter.
- points: TEPAT 2 atau 3 item. label maks ${COPY_LIMITS.pointLabel} karakter, text 1 kalimat tuntas maks ${COPY_LIMITS.pointText} karakter.
- closingLine: 1 kalimat penutup/ajakan, maks ${COPY_LIMITS.closing} karakter.
- DILARANG kata "nyata" dan "sekadar". DILARANG em-dash/en-dash. DILARANG Oxford comma.
- visualSubject: deskripsi adegan visual dalam BAHASA INGGRIS (maks 40 kata) yang menggambarkan topik yang sama secara konkret di Indonesia (orang anonim, tempat, benda). Tanpa nama tokoh, tanpa teks/papan nama.

Keluarkan JSON murni:
{"kicker":"","headline":"","deck":"","points":[{"label":"","text":""}],"closingLine":"","visualSubject":""}`;

  try {
    const response = await openaiClient.chat.completions.create({
      model: process.env.POSTER_COPY_MODEL || 'gpt-4o-mini',
      temperature: 0.5,
      response_format: { type: 'json_object' },
      messages: [{ role: 'system', content: systemPrompt }],
    });
    const parsed = JSON.parse(response.choices[0]?.message?.content || '{}') as Partial<ArtCollageCopy>;
    const copy = finalizeCopy(parsed, topic);
    if (!copy.headline || copy.points.length < 2) {
      throw new Error('Copy AI tidak lengkap (headline/points).');
    }
    return copy;
  } catch (err: any) {
    console.warn(`[ArtCollageDirector] Copy AI gagal, memakai fallback deterministik: ${err?.message}`);
    return finalizeCopy(
      {
        kicker: 'Catatan Advokasi Publik',
        headline: clampWords(topic, COPY_LIMITS.headline),
        deck: `Pengawasan terukur atas isu ${topic} demi perlindungan kepentingan warga.`,
        points: [
          { label: 'Persoalan', text: `Isu ${topic} berdampak langsung pada kehidupan sehari-hari warga.` },
          { label: 'Langkah Parlemen', text: 'Mendorong evaluasi anggaran dan pengawasan lapangan secara berkala.' },
        ],
        closingLine: 'Kami kawal hingga tuntas bersama warga.',
        visualSubject: `everyday Indonesian civic life directly related to: ${topic}`,
      },
      topic
    );
  }
}
