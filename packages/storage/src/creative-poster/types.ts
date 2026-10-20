export type PosterLayoutVariant = 'TOP_BANNER' | 'BOTTOM_ANCHOR' | 'EDITORIAL_SPLIT' | 'CENTERED_HERO';
export type PosterHeaderPlacement = 'top' | 'bottom' | 'center';
export type PosterCardArrangement = 'stacked' | 'horizontal_split' | 'single_hero_card' | 'grid_compact';

export interface SynthesizedEditorialCopy {
  mainBannerTitle: string;
  mainBannerSubheader: string;
  mainBannerDefinitionBody: string;
  blocks: Record<
    string,
    {
      header: string;
      body: string;
    }
  >;
  mappedVisualCutouts: Record<string, string>;
  statCircles?: Array<{ topLabel: string; value: string; description: string }>;
  numberedItems?: Array<{ number: string; title: string; subtitle?: string; summary: string }>;

  // Modifikasi Dinamis Layout & Warna Aktif oleh AI:
  layoutVariant?: PosterLayoutVariant;
  headerPlacement?: PosterHeaderPlacement;
  cardArrangement?: PosterCardArrangement;
  colorMood?: string;
  primaryAccent?: string;
  secondaryAccent?: string;
  cardBackground?: string;
  cardBorder?: string;
}

export type SubjectCompositionMode =
  | 'PUBLIC_ADVOCACY'
  | 'FIGURE_CENTERPIECE'
  | 'FIGURE_SIDE_PROFILE'
  | 'TEXT_ACCENT_ONLY';

export interface ComposeCreativePosterOptions {
  backgroundBuffer: Buffer;
  subjectPhotoBuffer?: Buffer;
  officialLogoBuffer?: Buffer;
  headline: string;
  quote?: string;
  memberName: string;
  memberTitle?: string;
  archetype?:
    | 'STREET_JOURNALISM'
    | 'POP_OUT_HERO'
    | 'STATEMENT_PROFILE'
    | 'RETRO_CAMPAIGN'
    | 'TORN_PAPER_NEWS'
    | 'RETRO_SPLIT_MITIGATION'
    | 'MODULAR_GRID_CARDS'
    | 'VINTAGE_PERSONA_GAZETTE';
  compositionMode?: SubjectCompositionMode;
  synthesizedCopy?: SynthesizedEditorialCopy;
  primaryAccentColor?: string;
  secondaryAccentColor?: string;
  canvasWidth?: number;
  canvasHeight?: number;
  editionTag?: string;
  outputFormat?: 'webp' | 'png' | 'jpeg';
  galleryPhotos?: string[];
  qrCodeUrl?: string;
}

export interface ComposedPosterResult {
  buffer: Buffer;
  mimeType: 'image/webp' | 'image/png' | 'image/jpeg';
  width: number;
  height: number;
  sizeBytes: number;
}
