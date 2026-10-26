import { SynthesizedEditorialCopy, CompositionPlan, ResolvedColorTokens, resolveColorAuthority } from '../types.js';
import { ParametricSatoriRenderer } from '../core/parametric-renderer.js';

export interface TypographicMaskLayoutParams {
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
 * Layout Khusus TYPOGRAPHIC_MASK:
 * Terinspirasi dari "poster (1) / Beautiful & Typographic Monoline Mask"
 * Ciri khas: Tipografi minimalis ultra-modern dengan white space lapang,
 * dirombak menggunakan ParametricSatoriRenderer & EditorialSurface.
 */
export function buildTypographicMaskLayout(params: TypographicMaskLayoutParams): any {
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
        primaryAccent: primaryAccent || '#EC4899',
        secondaryAccent: secondaryAccent || copy.secondaryAccent || '#F472B6',
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
      mastheadStyle: 'MODERN_MINIMAL',
      headlineFontFamily: 'Bebas Neue',
      headlineMaxFontSize: 96,
      headlineSurface: 'NONE',
      columnsSurface: 'HAIRLINE',
      signatureSurface: 'HAIRLINE',
      signatureBorderSide: 'left',
    },
  });
}
