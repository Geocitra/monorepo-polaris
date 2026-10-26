import { SynthesizedEditorialCopy, CompositionPlan, ResolvedColorTokens, resolveColorAuthority } from '../types.js';
import { ParametricSatoriRenderer } from '../core/parametric-renderer.js';

export interface BroadsheetNewspaperLayoutParams {
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
 * Layout Khusus BROADSHEET_NEWSPAPER:
 * Terinspirasi dari "Epoch Times & Broadsheet Investigative Newspaper"
 * Ciri khas: Format koran harian investigasi berwibawa tinggi dengan tipografi Serif
 * dirombak menggunakan ParametricSatoriRenderer & EditorialSurface.
 */
export function buildBroadsheetNewspaperLayout(params: BroadsheetNewspaperLayoutParams): any {
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
        primaryAccent: primaryAccent || '#1E3A8A',
        secondaryAccent: secondaryAccent || copy.secondaryAccent || '#3B82F6',
        backgroundBase: '#F4EFE6',
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
      mastheadStyle: 'BROADSHEET_CLASSIC',
      headlineFontFamily: 'DejaVu Serif',
      headlineMaxFontSize: 82,
      headlineSurface: 'NONE',
      columnsSurface: 'HAIRLINE',
      signatureSurface: 'SOLID_BAND',
      signatureBorderSide: 'top',
    },
  });
}
