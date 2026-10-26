import { SynthesizedEditorialCopy, CompositionPlan, ResolvedColorTokens, resolveColorAuthority } from '../types.js';
import { ParametricSatoriRenderer } from '../core/parametric-renderer.js';

export interface ConstructivistBauhausLayoutParams {
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
 * Layout Khusus CONSTRUCTIVIST_BAUHAUS:
 * Terinspirasi dari manifesto konstruktivis / Bauhaus yang berani
 * dirombak menggunakan ParametricSatoriRenderer & EditorialSurface.
 */
export function buildConstructivistBauhausLayout(
  params: ConstructivistBauhausLayoutParams
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
        primaryAccent: primaryAccent || '#DC2626',
        secondaryAccent: secondaryAccent || copy.secondaryAccent || '#0A0A0A',
        backgroundBase: '#111827',
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
      mastheadStyle: 'BOLD_STAMP',
      headlineFontFamily: 'Anton',
      headlineMaxFontSize: 86,
      headlineSurface: 'SOLID_BAND',
      columnsSurface: 'HAIRLINE',
      signatureSurface: 'SOLID_BAND',
      signatureBorderSide: 'top',
    },
  });
}
