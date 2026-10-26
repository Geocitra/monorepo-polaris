import { SynthesizedEditorialCopy, CompositionPlan, ResolvedColorTokens, resolveColorAuthority } from '../types.js';
import { ParametricSatoriRenderer } from '../core/parametric-renderer.js';

export interface TornVisionLayoutParams {
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
 * Layout Khusus TORN_VISION:
 * Terinspirasi dari "Hold Your Vision & Diagonal Paper Contrast"
 * Ciri khas: Tipografi inspiratif berbobot tebal dan kontras adaptif
 * dirombak menggunakan ParametricSatoriRenderer & EditorialSurface.
 */
export function buildTornVisionLayout(params: TornVisionLayoutParams): any {
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
        primaryAccent: primaryAccent || '#3B82F6',
        secondaryAccent: secondaryAccent || copy.secondaryAccent || '#60A5FA',
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
      mastheadStyle: 'VINTAGE_RIBBON',
      headlineFontFamily: 'Bebas Neue',
      headlineMaxFontSize: 86,
      headlineSurface: 'SCRIM_GRADIENT',
      columnsSurface: 'HAIRLINE',
      signatureSurface: 'SOLID_BAND',
      signatureBorderSide: 'left',
    },
  });
}
