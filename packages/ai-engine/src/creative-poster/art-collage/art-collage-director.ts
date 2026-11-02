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
      'editorial graphic narrative infographic on textured warm cream paper; an organic crimson red S-curve ribbon flows across the canvas separating distinct thematic sections, black-and-white halftone cutouts of everyday people and surreal botanical accents, clean paper background margins',
    anchors: ['TEXT_TOP', 'TEXT_BOTTOM'],
    paperTone: 'LIGHT',
  },
  INFOGRAPHIC_CHRONICLE_GRID: {
    style:
      'vintage newspaper chronicle infographic on clean off-white newsprint; a solid orange vertical masthead column along the left with a prominent monochrome portrait bust cutout, and clean structured grid milestone cards with aged archival photos and forest green accent tags on the right',
    anchors: ['TEXT_RIGHT', 'TEXT_TOP'],
    paperTone: 'LIGHT',
  },
  INFOGRAPHIC_RADIAL_CLOCK: {
    style:
      'vintage antique chronicle poster on aged parchment paper; an ornate pocket-watch clock dial on the left with radial epoch time sectors radiating outward, vintage book stacks, historical copperplate engravings, sepia ink wash texture',
    anchors: ['TEXT_RIGHT', 'TEXT_TOP'],
    paperTone: 'LIGHT',
  },
  INFOGRAPHIC_ADVOCACY_PILLARS: {
    style:
      'civic advocacy cartoon data infographic with subtle Indonesian batik cloud pattern backdrop; high-contrast percentage statistic badge, expressive citizen illustrations, and five clean rounded vertical solution pillar cards with small icon circles at the bottom, warm wood and earthy tones',
    anchors: ['TEXT_TOP', 'TEXT_BOTTOM'],
    paperTone: 'LIGHT',
  },
  INFOGRAPHIC_VISIONARY_TIMELINE: {
    style:
      'modern high-contrast editorial visionary profile on pure light background; centered artistic portrait sketch or cutout, frosted glassmorphism cards with crisp edges, pull quote styling, and a clean dark horizontal milestone timeline bar running across the bottom',
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
  headline: 42,
  deck: 180,
  pointLabel: 32,
  pointText: 160,
  closing: 120,
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
  const maxPoints =
    archetype === 'INFOGRAPHIC_ADVOCACY_PILLARS' || archetype === 'INFOGRAPHIC_VISIONARY_TIMELINE'
      ? 5
      : isInfographic
      ? 4
      : 3;

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
          label: `POIN ${idx + 1}`,
          text: clampSentence(s(pt), COPY_LIMITS.pointText),
        };
      }
      if (typeof pt === 'object' && pt !== null) {
        const rawLabel = pt.label || pt.title || pt.name || pt.step || pt.pilar || pt.heading || `POIN ${idx + 1}`;
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
      specificGuide = 'Tulis TEPAT 5 pilar aksi terencana. Setiap pilar memiliki target angka/metrik konkret.';
    } else if (archetype === 'INFOGRAPHIC_NARRATIVE_WAVE') {
      specificGuide = 'Tulis TEPAT 4 dimensi isu kebijakan (misal: Sisi Anggaran, Titik Kritis Lapangan, Standar Teknis, Kanal Aduan/Akses).';
    } else {
      specificGuide = 'Tulis TEPAT 4 tonggak capaian atau tahapan kronologis terukur dengan besaran angka, target hari/bulan, atau volume output riil.';
    }

    systemPrompt = `Anda adalah visual data journalist dan analis kebijakan publik senior.
Tulis naskah INFOGRAFIS DATA EDUKATIF yang KAYA ANGKA, KREDIBEL, dan PADAT DATA TERUKUR bertopik: "${topic}".
${groundedContext ? `\nFAKTA RISET & KONTEKS DAERAH:\n${groundedContext.slice(0, 1800)}\n` : ''}

PANDUAN STRUKTUR INFOGRAFIS (${specificGuide}):
1. Tulis 4 sampai 5 butir data konkret (points).
2. SETIAP BUTIR WAJIB MEMUAT ANGKA, METRIK, ATAU INDIKATOR TERUKUR yang realistis dan sangat relevan dengan isu (misalnya: besaran alokasi anggaran dalam Rp/Miliar, jumlah kilometer atau titik ruas, target durasi hari/bulan pengerjaan, persentase peningkatan, indeks capaian, atau nama kecamatan/wilayah spesifik).
3. headline: Judul infografis yang lugas, padat, dan berbobot (maks ${COPY_LIMITS.headline} karakter).
4. kicker: Rubrik kebijakan spesifik (misal: "INFRASTRUKTUR DAERAH", "DATA ANGGARAN APBD", "INDIKATOR KESEHATAN").
5. deck: 1-2 kalimat ringkasan data inti dan urgensi masalah (maks ${COPY_LIMITS.deck} karakter).
6. points: Daftar 4 atau 5 butir data terstruktur:
   - label: Frasa metrik ringkas bertuliskan angka/indikator (maks ${COPY_LIMITS.pointLabel} karakter, misal: "42 TITIK KRITIS", "ALOKASI RP 48,5 M", "TARGET 90 HARI", "STANDAR HOTMIX 6 CM", "3 KECAMATAN PRIORITAS").
   - text: Penjelasan data konkret dan terukur (1-2 kalimat padat informasi substantif, maks ${COPY_LIMITS.pointText} karakter).
7. closingLine: 1 kalimat sintesis arah tindak lanjut terukur (maks ${COPY_LIMITS.closing} karakter).
8. PANTANGAN: DILARANG kata "nyata", DILARANG slogan motivasional klise, DILARANG kalimat kosong tanpa data.
9. visualSubject: Deskripsi pemandangan visual tanpa teks dalam Bahasa Inggris (maks 40 kata) untuk latar belakang ilustrasi.

Keluarkan JSON murni:
{"kicker":"","headline":"","deck":"","points":[{"label":"","text":""}],"closingLine":"","visualSubject":""}`;
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
{"kicker":"","headline":"","deck":"","points":[{"label":"","text":""}],"closingLine":"","visualSubject":""}`;
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
    const fallbackPoints = isInfographic
      ? [
          { label: '38 TITIK PRIORITAS', text: `Pemetaan ruas jalan rusak kritis di wilayah ${topic} untuk penanganan segera.` },
          { label: 'ALOKASI RP 45 M', text: 'Dukungan anggaran pemeliharaan berkala infrastruktur melalui APBD terpadu.' },
          { label: 'TARGET 90 HARI', text: 'Penyelesaian perbaikan aspal hotmix terstandar dengan pengawasan berkala.' },
          { label: 'KANAL ADUAN 24/7', text: 'Aktivasi sistem monitoring dan penerimaan aspirasi warga berbasis digital.' },
        ]
      : [
          { label: 'Urgensi Isu', text: `Persoalan ${topic} memerlukan perbaikan tata kelola dan pengawasan terintegrasi.` },
          { label: 'Arah Solusi', text: 'Penyusunan regulasi komprehensif dan alokasi sumber daya berbasis data lapangan.' },
        ];

    return finalizeCopy(
      {
        kicker: isInfographic ? 'Data Kebijakan Daerah' : 'Telaah Isu Kebijakan',
        headline: clampWords(topic, COPY_LIMITS.headline),
        deck: `Evaluasi terukur atas tata kelola ${topic} demi kepentingan masyarakat luas.`,
        points: fallbackPoints,
        closingLine: 'Dibutuhkan komitmen konkret untuk perbaikan berkelanjutan.',
        visualSubject: `everyday Indonesian civic life directly related to: ${topic}`,
      },
      topic,
      archetype
    );
  }
}
