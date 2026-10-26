import { SynthesizedEditorialCopy, CompositionPlan, ResolvedColorTokens, resolveColorAuthority } from '../types.js';
import { ParametricSatoriRenderer } from '../core/parametric-renderer.js';

export interface PolaroidAdventureLayoutParams {
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
 * Layout Khusus POLAROID_ADVENTURE:
 * Terinspirasi dari "Go Wild & Outdoor Expedition Polaroid"
 * Ciri khas: Estetika ekspedisi alam terbuka dan penjelajahan konstituen
 * dirombak menggunakan ParametricSatoriRenderer.
 */
export function buildPolaroidAdventureLayout(params: PolaroidAdventureLayoutParams): any {
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
        primaryAccent: primaryAccent || '#4D7C0F',
        secondaryAccent: secondaryAccent || copy.secondaryAccent || '#84CC16',
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
      mastheadStyle: 'BOLD_STAMP',
      headlineFontFamily: 'Anton',
      headlineMaxFontSize: 88,
      headlineSurface: 'SOLID_BAND',
      columnsSurface: 'HAIRLINE',
      signatureSurface: 'HAIRLINE',
      signatureBorderSide: 'left',
      defaultPhotoStyle: 'POLAROID',
    },
  });
}
