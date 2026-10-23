import { SynthesizedEditorialCopy, CompositionPlan, ResolvedColorTokens, resolveColorAuthority } from '../types.js';
import { ParametricSatoriRenderer } from '../core/parametric-renderer.js';

export interface KineticMotionLayoutParams {
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
 * Layout Khusus KINETIC_MOTION:
 * Terinspirasi dari "Fly High & Dynamic Slanted Typography"
 * Ciri khas: Tipografi bertenaga yang mengomunikasikan akselerasi kerja
 * dirombak menggunakan ParametricSatoriRenderer & EditorialSurface.
 */
export function buildKineticMotionLayout(params: KineticMotionLayoutParams): any {
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
        primaryAccent: primaryAccent || '#EA580C',
        secondaryAccent: secondaryAccent || copy.secondaryAccent || '#F59E0B',
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
      headlineFontFamily: 'Bebas Neue',
      headlineMaxFontSize: 92,
      headlineSurface: 'SCRIM_GRADIENT',
      columnsSurface: 'HAIRLINE',
      signatureSurface: 'SOLID_BAND',
      signatureBorderSide: 'left',
    },
  });
}
