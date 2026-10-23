import { SynthesizedEditorialCopy, CompositionPlan, ResolvedColorTokens, resolveColorAuthority } from '../types.js';
import { ParametricSatoriRenderer } from '../core/parametric-renderer.js';

export interface IsometricCreativeCollageLayoutParams {
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
 * Layout Khusus ISOMETRIC_CREATIVE_COLLAGE:
 * Terinspirasi dari "creative Poster / Modern Tech & Creative Dashboard"
 * Ciri khas: Estetika modern kreatif dan tata letak adaptif berbasis ParametricSatoriRenderer.
 */
export function buildIsometricCreativeCollageLayout(
  params: IsometricCreativeCollageLayoutParams
): any {
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
        primaryAccent: primaryAccent || '#6366F1',
        secondaryAccent: secondaryAccent || copy.secondaryAccent || '#06B6D4',
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
      structuralFamily: 'BOLD_MANIFESTO',
      mastheadStyle: 'MODERN_MINIMAL',
      headlineFontFamily: 'Bebas Neue',
      headlineMaxFontSize: 82,
      headlineSurface: 'SCRIM_GRADIENT',
      columnsSurface: 'HAIRLINE',
      signatureSurface: 'SOLID_BAND',
      signatureBorderSide: 'left',
    },
  });
}
