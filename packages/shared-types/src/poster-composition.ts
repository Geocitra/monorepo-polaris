/**
 * POLARIS Poster Composition Contracts & Shared Schemas
 * Single Source of Truth untuk kontrak arsitektur Adaptive Creative Poster.
 */

export type CreativePosterArchetype =
  | 'POP_OUT_HERO'
  | 'STREET_JOURNALISM'
  | 'STATEMENT_PROFILE'
  | 'RETRO_CAMPAIGN'
  | 'TORN_PAPER_NEWS'
  | 'RETRO_SPLIT_MITIGATION'
  | 'MODULAR_GRID_CARDS'
  | 'CONSTRUCTIVIST_BAUHAUS'
  | 'THRESHOLD_RISOGRAPH'
  | 'SWISS_DUOTONE_EDITORIAL'
  | 'ISOMETRIC_CREATIVE_COLLAGE'
  | 'STORYBOOK_ILLUSTRATED'
  | 'TYPOGRAPHIC_MASK'
  | 'KINETIC_MOTION'
  | 'EXECUTIVE_SEMINAR'
  | 'TORN_VISION'
  | 'GALLERY_EXHIBITION'
  | 'POP_MAGAZINE_COLLAGE'
  | 'POLAROID_ADVENTURE'
  | 'VINTAGE_PERSONA_GAZETTE'
  | 'BROADSHEET_NEWSPAPER'
  | 'TECHNICAL_GRID_CALLOUT';

export type PosterAspectRatio = '4:5' | '9:16' | '1:1' | '3:4' | '16:9';

export type SubjectCompositionMode =
  | 'PUBLIC_ADVOCACY'
  | 'FIGURE_CENTERPIECE'
  | 'FIGURE_SIDE_PROFILE'
  | 'TEXT_ACCENT_ONLY';

export type PosterLayoutVariant =
  | 'TOP_BANNER'
  | 'BOTTOM_ANCHOR'
  | 'EDITORIAL_SPLIT'
  | 'CENTERED_HERO';

export type PosterHeaderPlacement = 'top' | 'bottom' | 'center';

export type PosterCardArrangement =
  | 'stacked'
  | 'horizontal_split'
  | 'single_hero_card'
  | 'grid_compact';

export type SurfaceMode = 'NONE' | 'HAIRLINE' | 'SCRIM_GRADIENT' | 'SOLID_BAND';

export interface ZoneRect {
  x: number; // 0.0 s/d 1.0 (rasio relatif kanvas)
  y: number; // 0.0 s/d 1.0
  w: number; // 0.0 s/d 1.0
  h: number; // 0.0 s/d 1.0
}

export type CompositionZoneRole =
  | 'HEADLINE'
  | 'SUBHEADER'
  | 'EDITORIAL_BODY'
  | 'STAT_BADGES'
  | 'MEMBER_SIGNATURE'
  | 'OFFICIAL_EMBLEM'
  | 'VISUAL_FOCAL_POINT'
  | 'SUBJECT'
  | 'COLUMNS'
  | 'CARDS';

export interface CompositionZone {
  id: string;
  role: CompositionZoneRole;
  rect: ZoneRect;
  surface?: SurfaceMode;
  contrastTarget?: 'DARK_TEXT' | 'LIGHT_TEXT';
  zIndex?: number;
}

export interface CompositionPlan {
  blueprintId: string;
  archetype: CreativePosterArchetype;
  layoutVariant: PosterLayoutVariant;
  headerPlacement: PosterHeaderPlacement;
  cardArrangement: PosterCardArrangement;
  zones: CompositionZone[];
  primaryAccent: string;
  secondaryAccent: string;
  textColor: string;
  backgroundBase: string;
  surfaceMode: SurfaceMode;
  aspectRatio?: PosterAspectRatio;
  subjectBoundingBox?: {
    x: number;
    y: number;
    width?: number;
    height?: number;
    w?: number;
    h?: number;
  };
}

export interface BlueprintFixedConstraints {
  primaryAccentLocked?: boolean;
  baseBackgroundTone: 'LIGHT' | 'DARK' | 'WARM_PAPER' | 'MONOCHROME';
  requiredFontFamilies: {
    headline: string;
    body: string;
  };
  imageNegativeAllow?: string[]; // e.g. ['banner', 'frame', 'border']
  toneSafety: 'SERIOUS_ONLY' | 'ALL_TOPICS' | 'VIRAL_ONLY';
}

export interface BlueprintVariationRules {
  allowedLayoutVariants: PosterLayoutVariant[];
  allowedHeaderPlacements: PosterHeaderPlacement[];
  allowedCardArrangements: PosterCardArrangement[];
  canMutatePalette?: boolean;
  allowedColorMoods?: string[];
}

export interface ResolvedColorTokens {
  primaryAccent: string;
  secondaryAccent: string;
  backgroundBase: string;
  textColor: string;
  subTextColor: string;
  cardBackground: string;
  cardBorder: string;
  source: 'BRAND' | 'BLUEPRINT' | 'COLOR_MOOD';
  isDark?: boolean;
}

/**
 * Resolusi Otoritas Tunggal Hierarki Warna (Satu sumber kebenaran Layer 1 & Layer 3)
 */
export function resolveColorAuthority(params: {
  blueprintPalette?: {
    primaryAccent?: string;
    secondaryAccent?: string;
    backgroundBase?: string;
    textColor?: string;
    subTextColor?: string;
    cardBackground?: string;
    cardBorder?: string;
  };
  tenantBrandHex?: string;
  strictlyEnforceBrandColor?: boolean;
  colorMoodAccent?: string;
  colorMoodSecondary?: string;
  canMutatePalette?: boolean;
}): ResolvedColorTokens {
  const {
    blueprintPalette = {},
    tenantBrandHex,
    strictlyEnforceBrandColor,
    colorMoodAccent,
    colorMoodSecondary,
    canMutatePalette,
  } = params || {};

  // 1. Brand Color Enforcement (Prioritas 1)
  if (strictlyEnforceBrandColor && tenantBrandHex) {
    const bg = blueprintPalette.backgroundBase || '#F4F1EA';
    const isDark = bg.startsWith('#0') || bg.startsWith('#1') || bg.startsWith('#2');
    return {
      primaryAccent: tenantBrandHex,
      secondaryAccent:
        blueprintPalette.secondaryAccent || colorMoodSecondary || '#FB923C',
      backgroundBase: bg,
      textColor: blueprintPalette.textColor || (isDark ? '#FFFFFF' : '#111827'),
      subTextColor: blueprintPalette.subTextColor || (isDark ? '#94A3B8' : '#4B5563'),
      cardBackground:
        blueprintPalette.cardBackground || (isDark ? 'rgba(8, 12, 24, 0.85)' : 'rgba(255, 255, 255, 0.85)'),
      cardBorder:
        blueprintPalette.cardBorder || (isDark ? 'rgba(255, 255, 255, 0.15)' : 'rgba(0, 0, 0, 0.12)'),
      source: 'BRAND',
      isDark,
    };
  }

  // 2. Blueprint Color Palette Asli (Prioritas 2 - Identitas Referensi Terjaga)
  if (!canMutatePalette || !colorMoodAccent) {
    const bg = blueprintPalette.backgroundBase || '#F6F3EB';
    const isDark = bg.startsWith('#0') || bg.startsWith('#1') || bg.startsWith('#2');
    return {
      primaryAccent: blueprintPalette.primaryAccent || '#EA580C',
      secondaryAccent:
        blueprintPalette.secondaryAccent || colorMoodSecondary || '#FB923C',
      backgroundBase: bg,
      textColor: blueprintPalette.textColor || (isDark ? '#FFFFFF' : '#111827'),
      subTextColor: blueprintPalette.subTextColor || (isDark ? '#94A3B8' : '#4B5563'),
      cardBackground:
        blueprintPalette.cardBackground || (isDark ? 'rgba(8, 12, 24, 0.85)' : 'rgba(255, 255, 255, 0.85)'),
      cardBorder:
        blueprintPalette.cardBorder || (isDark ? 'rgba(255, 255, 255, 0.15)' : 'rgba(0, 0, 0, 0.12)'),
      source: 'BLUEPRINT',
      isDark,
    };
  }

  // 3. Color Mood (Hanya jika blueprint mengizinkan variasi palet)
  const bg = blueprintPalette.backgroundBase || '#F6F3EB';
  const isDark = bg.startsWith('#0') || bg.startsWith('#1') || bg.startsWith('#2');
  return {
    primaryAccent: colorMoodAccent || blueprintPalette.primaryAccent || '#EA580C',
    secondaryAccent:
      colorMoodSecondary || blueprintPalette.secondaryAccent || '#FB923C',
    backgroundBase: bg,
    textColor: blueprintPalette.textColor || (isDark ? '#FFFFFF' : '#111827'),
    subTextColor: blueprintPalette.subTextColor || (isDark ? '#94A3B8' : '#4B5563'),
    cardBackground:
      blueprintPalette.cardBackground || (isDark ? 'rgba(8, 12, 24, 0.85)' : 'rgba(255, 255, 255, 0.85)'),
    cardBorder:
      blueprintPalette.cardBorder || (isDark ? 'rgba(255, 255, 255, 0.15)' : 'rgba(0, 0, 0, 0.12)'),
    source: 'COLOR_MOOD',
    isDark,
  };
}

export interface LayoutBlockSpec {
  slotId: string;
  roleDescription: string;
  headerMaxChars: number;
  bodyMinChars: number;
  bodyMaxChars: number;
  defaultHeader: string;
}

/**
 * Peta Skema Blok Editorial Lengkap untuk Seluruh 22 Arketipe Desain.
 * Menjamin 100% keselarasan antara prompt LLM dan pembacaan blok di layout Satori.
 */
export const LAYOUT_BLOCK_SCHEMA: Record<CreativePosterArchetype, LayoutBlockSpec[]> = {
  STREET_JOURNALISM: [
    { slotId: 'left_positive', roleDescription: 'Tinjauan dampak/kondisi positif di lapangan', headerMaxChars: 20, bodyMinChars: 140, bodyMaxChars: 250, defaultHeader: 'TINJAUAN UTAMA' },
    { slotId: 'left_negative_box', roleDescription: 'Tantangan kritis atau masalah yang dihadapi', headerMaxChars: 20, bodyMinChars: 140, bodyMaxChars: 250, defaultHeader: 'TANTANGAN LAPANGAN' },
    { slotId: 'center_giant_title', roleDescription: 'Solusi inti 2 kata tegas', headerMaxChars: 16, bodyMinChars: 100, bodyMaxChars: 180, defaultHeader: 'SOLUSI KONKRET' },
    { slotId: 'right_cause', roleDescription: 'Langkah advokasi bersama masyarakat', headerMaxChars: 20, bodyMinChars: 130, bodyMaxChars: 220, defaultHeader: 'AKSI BERSAMA' },
  ],
  BROADSHEET_NEWSPAPER: [
    { slotId: 'col_1', roleDescription: 'Kolom analisis isu pertama', headerMaxChars: 24, bodyMinChars: 120, bodyMaxChars: 220, defaultHeader: 'ANALISIS KEBIJAKAN' },
    { slotId: 'col_2', roleDescription: 'Kolom fakta lapangan kedua', headerMaxChars: 24, bodyMinChars: 120, bodyMaxChars: 220, defaultHeader: 'FAKTA LAPANGAN' },
  ],
  SWISS_DUOTONE_EDITORIAL: [
    { slotId: 'col_1', roleDescription: 'Poin struktural kebijakan pertama', headerMaxChars: 24, bodyMinChars: 120, bodyMaxChars: 220, defaultHeader: 'STRUKTUR REGULASI' },
    { slotId: 'col_2', roleDescription: 'Poin dampak terukur kedua', headerMaxChars: 24, bodyMinChars: 120, bodyMaxChars: 220, defaultHeader: 'IMPLIKASI PUBLIK' },
  ],
  CONSTRUCTIVIST_BAUHAUS: [
    { slotId: 'point_1', roleDescription: 'Manifesto langkah strategis pertama', headerMaxChars: 24, bodyMinChars: 80, bodyMaxChars: 180, defaultHeader: '01. REFORMASI STRATEGIS' },
    { slotId: 'point_2', roleDescription: 'Manifesto langkah strategis kedua', headerMaxChars: 24, bodyMinChars: 80, bodyMaxChars: 180, defaultHeader: '02. TRANSPARANSI TOTAL' },
  ],
  EXECUTIVE_SEMINAR: [
    { slotId: 'topic_1', roleDescription: 'Fokus panel simposium pertama', headerMaxChars: 26, bodyMinChars: 100, bodyMaxChars: 190, defaultHeader: 'ARAH KEBIJAKAN NASIONAL' },
    { slotId: 'topic_2', roleDescription: 'Fokus panel simposium kedua', headerMaxChars: 26, bodyMinChars: 100, bodyMaxChars: 190, defaultHeader: 'TRANSFORMASI STRATEGIS' },
  ],
  GALLERY_EXHIBITION: [
    { slotId: 'exhibit_1', roleDescription: 'Kurasi dokumentasi program lapangan', headerMaxChars: 26, bodyMinChars: 100, bodyMaxChars: 190, defaultHeader: 'KURASI ADVOKASI' },
    { slotId: 'exhibit_2', roleDescription: 'Kurasi pencapaian kerja legislasi', headerMaxChars: 26, bodyMinChars: 100, bodyMaxChars: 190, defaultHeader: 'REKAM CAPAIAN' },
  ],
  ISOMETRIC_CREATIVE_COLLAGE: [
    { slotId: 'card_1', roleDescription: 'Kartu inisiatif pemuda/kreatif', headerMaxChars: 24, bodyMinChars: 90, bodyMaxChars: 180, defaultHeader: 'INISIATIF PUBLIK' },
    { slotId: 'card_2', roleDescription: 'Kartu fasilitas dan pendampingan', headerMaxChars: 24, bodyMinChars: 90, bodyMaxChars: 180, defaultHeader: 'DUKUNGAN FASILITAS' },
  ],
  KINETIC_MOTION: [
    { slotId: 'speed_1', roleDescription: 'Aksi akselerasi kebijakan tahap satu', headerMaxChars: 24, bodyMinChars: 90, bodyMaxChars: 180, defaultHeader: 'AKSELERASI PROGRAM' },
    { slotId: 'speed_2', roleDescription: 'Aksi percepatan pelayanan publik', headerMaxChars: 24, bodyMinChars: 90, bodyMaxChars: 180, defaultHeader: 'LAYANAN PRIORITAS' },
  ],
  POLAROID_ADVENTURE: [
    { slotId: 'trail_1', roleDescription: 'Catatan lapangan blusukan daerah pertama', headerMaxChars: 24, bodyMinChars: 90, bodyMaxChars: 180, defaultHeader: 'CATATAN WILAYAH' },
    { slotId: 'trail_2', roleDescription: 'Catatan aspirasi masyarakat setempat', headerMaxChars: 24, bodyMinChars: 90, bodyMaxChars: 180, defaultHeader: 'ASPIRASI WARGA' },
  ],
  POP_MAGAZINE_COLLAGE: [
    { slotId: 'note_1', roleDescription: 'Sorotan isu tren publik pertama', headerMaxChars: 22, bodyMinChars: 90, bodyMaxChars: 170, defaultHeader: 'SOROTAN TREN' },
    { slotId: 'note_2', roleDescription: 'Sorotan dialog pemuda kedua', headerMaxChars: 22, bodyMinChars: 90, bodyMaxChars: 170, defaultHeader: 'DIALOG TERBUKA' },
  ],
  STORYBOOK_ILLUSTRATED: [
    { slotId: 'pillar_1', roleDescription: 'Pilar ekologi & kelestarian lingkungan', headerMaxChars: 24, bodyMinChars: 90, bodyMaxChars: 180, defaultHeader: 'KONSERVASI LINGKUNGAN' },
    { slotId: 'pillar_2', roleDescription: 'Pilar ketahanan ruang hidup masyarakat', headerMaxChars: 24, bodyMinChars: 90, bodyMaxChars: 180, defaultHeader: 'RUANG HIDUP BERKELANJUTAN' },
  ],
  TECHNICAL_GRID_CALLOUT: [
    { slotId: 'punch_1', roleDescription: 'Pernyataan fakta tajam pertama', headerMaxChars: 24, bodyMinChars: 80, bodyMaxChars: 170, defaultHeader: 'FAKTA LAPANGAN' },
    { slotId: 'punch_2', roleDescription: 'Tindakan legislasi pengawasan terarah', headerMaxChars: 24, bodyMinChars: 80, bodyMaxChars: 170, defaultHeader: 'PENGAWASAN STRATEGIS' },
  ],
  THRESHOLD_RISOGRAPH: [
    { slotId: 'action_1', roleDescription: 'Aksi penanganan krisis mendesak', headerMaxChars: 24, bodyMinChars: 80, bodyMaxChars: 170, defaultHeader: 'RESPONS CEPAT' },
    { slotId: 'action_2', roleDescription: 'Pengawasan anggaran dan regulasi', headerMaxChars: 24, bodyMinChars: 80, bodyMaxChars: 170, defaultHeader: 'AUDIT TERPADU' },
  ],
  TORN_VISION: [
    { slotId: 'vision_a', roleDescription: 'Visi transformasi kebijakan', headerMaxChars: 24, bodyMinChars: 90, bodyMaxChars: 180, defaultHeader: 'VISI TRANSFORMASI' },
    { slotId: 'vision_b', roleDescription: 'Komitmen langkah masa depan', headerMaxChars: 24, bodyMinChars: 90, bodyMaxChars: 180, defaultHeader: 'KOMITMEN TERUKUR' },
  ],
  TYPOGRAPHIC_MASK: [
    { slotId: 'vision_1', roleDescription: 'Fokus arah pembangunan utama', headerMaxChars: 24, bodyMinChars: 90, bodyMaxChars: 180, defaultHeader: 'ARAH PRIORITAS' },
    { slotId: 'vision_2', roleDescription: 'Kerangka regulasi penopang', headerMaxChars: 24, bodyMinChars: 90, bodyMaxChars: 180, defaultHeader: 'KERANGKA REGULASI' },
  ],
  // Arketipe yang berorientasi pada banner hero / numbered cards / stat circles
  POP_OUT_HERO: [],
  STATEMENT_PROFILE: [],
  RETRO_CAMPAIGN: [],
  TORN_PAPER_NEWS: [],
  RETRO_SPLIT_MITIGATION: [],
  MODULAR_GRID_CARDS: [],
  VINTAGE_PERSONA_GAZETTE: [],
};

export interface PosterQAMetrics {
  marginIntegrityScore: number;
  contrastRatio: number;
  overflowDetected: boolean;
  subjectCollisionScore: number;
}

export interface PosterQARecommendation {
  action: 'NONE' | 'ADJUST_SURFACE' | 'REGENERATE_IMAGE';
  suggestedSurfaceMode?: SurfaceMode;
  scrimOpacityBoost?: number;
  reason?: string;
}

export interface PosterQAReport {
  passed: boolean;
  score: number; // 0.0 - 1.0 (>= 0.70 lulus)
  stage: 'DETERMINISTIC' | 'VISION_AUDIT';
  issues: string[];
  metrics: PosterQAMetrics;
  recommendation: PosterQARecommendation;
}
