import type {
  CreativePosterArchetype,
  PosterAspectRatio,
  SubjectCompositionMode,
  PosterLayoutVariant,
  PosterHeaderPlacement,
  PosterCardArrangement,
  ZoneRect,
  SurfaceMode,
  CompositionZone,
  CompositionPlan,
  BlueprintFixedConstraints,
  BlueprintVariationRules,
  ResolvedColorTokens,
  LayoutBlockSpec,
  PosterQAMetrics,
  PosterQARecommendation,
  PosterQAReport,
} from '@polaris/shared-types';
import {
  resolveColorAuthority,
  LAYOUT_BLOCK_SCHEMA,
} from '@polaris/shared-types';

export type {
  CreativePosterArchetype,
  PosterAspectRatio,
  SubjectCompositionMode,
  PosterLayoutVariant,
  PosterHeaderPlacement,
  PosterCardArrangement,
  ZoneRect,
  SurfaceMode,
  CompositionZone,
  CompositionPlan,
  BlueprintFixedConstraints,
  BlueprintVariationRules,
  ResolvedColorTokens,
  LayoutBlockSpec,
  PosterQAMetrics,
  PosterQARecommendation,
  PosterQAReport,
};
export {
  resolveColorAuthority,
  LAYOUT_BLOCK_SCHEMA,
};

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

export interface ComposeCreativePosterOptions {
  backgroundBuffer: Buffer;
  subjectPhotoBuffer?: Buffer;
  officialLogoBuffer?: Buffer;
  headline: string;
  quote?: string;
  memberName: string;
  memberTitle?: string;
  archetype?: CreativePosterArchetype;
  compositionMode?: SubjectCompositionMode;
  synthesizedCopy?: SynthesizedEditorialCopy;
  compositionPlan?: CompositionPlan;
  resolvedColors?: ResolvedColorTokens;
  primaryAccentColor?: string;
  secondaryAccentColor?: string;
  canvasWidth?: number;
  canvasHeight?: number;
  editionTag?: string;
  outputFormat?: 'webp' | 'png' | 'jpeg';
  galleryPhotos?: string[];
  qrCodeUrl?: string;
  enableVisualQA?: boolean;
  autoHealContrast?: boolean;
}

export interface ComposedPosterResult {
  buffer: Buffer;
  mimeType: 'image/webp' | 'image/png' | 'image/jpeg';
  width: number;
  height: number;
  sizeBytes: number;
  qaReport?: PosterQAReport;
}
