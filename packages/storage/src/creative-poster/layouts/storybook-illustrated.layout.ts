import { SynthesizedEditorialCopy, CompositionPlan, ResolvedColorTokens, resolveColorAuthority } from '../types.js';
import { ParametricSatoriRenderer } from '../core/parametric-renderer.js';

export interface StorybookIllustratedLayoutParams {
  width: number;
  height: number;
  headline: string;
  quote?: string;
  copy: SynthesizedEditorialCopy;
  memberName: string;
  memberTitle: string;
  editionTag: string;
  primaryAccent: string;
  secondaryAccent?: string;
  logoDataUri?: string;
  compositionPlan?: CompositionPlan;
  resolvedColors?: ResolvedColorTokens;
}

/**
 * Layout Khusus STORYBOOK_ILLUSTRATED:
 * Terinspirasi dari "Fishing poster / Pastoral Ecology & Storybook Framing"
 * Ciri khas: Tipografi Serif anggun (DejaVu Serif) dipadu judul berwibawa
 * dan permukaan adaptif berbasis ParametricSatoriRenderer.
 */
export function buildStorybookIllustratedLayout(params: StorybookIllustratedLayoutParams): any {
  const {
    width,
    height,
    headline,
    quote,
    copy,
    memberName,
    memberTitle,
    editionTag,
    primaryAccent,
    secondaryAccent,
    logoDataUri,
    compositionPlan,
    resolvedColors,
  } = params;

  const colors =
    resolvedColors ||
    resolveColorAuthority({
      tenantBrandHex: primaryAccent || copy.primaryAccent,
      colorMoodAccent: copy.colorMood,
      blueprintPalette: {
        primaryAccent: primaryAccent || '#065F46',
        secondaryAccent: secondaryAccent || copy.secondaryAccent || '#10B981',
      },
    });

  return ParametricSatoriRenderer.renderParametricPoster({
    width,
    height,
    headline,
    quote,
    copy,
    memberName,
    memberTitle,
    editionTag,
    logoDataUri,
    compositionPlan,
    resolvedColors: colors,
    skinConfig: {
      structuralFamily: 'CINEMATIC_MINIMAL',
      mastheadStyle: 'VINTAGE_RIBBON',
      headlineFontFamily: 'DejaVu Serif',
      headlineMaxFontSize: 88,
      headlineSurface: 'SCRIM_GRADIENT',
      columnsSurface: 'HAIRLINE',
      signatureSurface: 'HAIRLINE',
      signatureBorderSide: 'left',
    },
  });
}
