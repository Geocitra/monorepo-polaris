import { SynthesizedEditorialCopy, CompositionPlan, ResolvedColorTokens, resolveColorAuthority } from '../types.js';
import { ParametricSatoriRenderer } from '../core/parametric-renderer.js';

export interface SwissDuotoneEditorialLayoutParams {
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
 * Layout Khusus SWISS_DUOTONE_EDITORIAL:
 * Terinspirasi dari Swiss International Typographic Style (grid ketat, kontras monokrom tinggi)
 * dirombak menggunakan ParametricSatoriRenderer & EditorialSurface.
 */
export function buildSwissDuotoneEditorialLayout(
  params: SwissDuotoneEditorialLayoutParams
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
        primaryAccent: primaryAccent || '#2563EB',
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
      structuralFamily: 'EDITORIAL_MAGAZINE',
      mastheadStyle: 'MODERN_MINIMAL',
      headlineFontFamily: 'Bebas Neue',
      headlineMaxFontSize: 84,
      headlineSurface: 'NONE',
      columnsSurface: 'HAIRLINE',
      signatureSurface: 'SOLID_BAND',
      signatureBorderSide: 'left',
    },
  });
}
