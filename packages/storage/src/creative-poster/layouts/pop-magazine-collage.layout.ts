import { SynthesizedEditorialCopy, CompositionPlan, ResolvedColorTokens, resolveColorAuthority } from '../types.js';
import { ParametricSatoriRenderer } from '../core/parametric-renderer.js';

export interface PopMagazineCollageLayoutParams {
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
 * Layout Khusus POP_MAGAZINE_COLLAGE:
 * Terinspirasi dari majalah jalanan urban kontemporer (Neo-Tokyo / Street Zine)
 * dirombak menggunakan ParametricSatoriRenderer & EditorialSurface.
 */
export function buildPopMagazineCollageLayout(params: PopMagazineCollageLayoutParams): any {
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
        primaryAccent: primaryAccent || '#F43F5E',
        secondaryAccent: secondaryAccent || copy.secondaryAccent || '#14B8A6',
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
      structuralFamily: 'DATA_INFOGRAPHIC',
      mastheadStyle: 'BOLD_STAMP',
      headlineFontFamily: 'Bebas Neue',
      headlineMaxFontSize: 88,
      headlineSurface: 'SOLID_BAND',
      columnsSurface: 'HAIRLINE',
      signatureSurface: 'SOLID_BAND',
      signatureBorderSide: 'left',
    },
  });
}
