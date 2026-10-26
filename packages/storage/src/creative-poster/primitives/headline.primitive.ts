import { ResolvedColorTokens, SurfaceMode } from '../types.js';
import { getAdaptiveFontSize, smartTruncate } from '../core/adaptive-typography.js';
import { EditorialSurface } from '../core/editorial-surface.js';

export interface HeadlinePrimitiveParams {
  title: string;
  subheader?: string;
  definitionBody?: string;
  fontFamily?: 'Bebas Neue' | 'Anton' | 'DejaVu Serif' | 'Plus Jakarta Sans';
  headline?: string;
  subHeader?: string;
  surface?: SurfaceMode;
  maxFontSize?: number;
  minFontSize?: number;
  maxCharThreshold?: number;
  surfaceMode?: SurfaceMode;
  colors?: ResolvedColorTokens;
  resolvedColors?: ResolvedColorTokens;
  isDark?: boolean;
  align?: 'left' | 'center' | 'right';
  maxWidth?: string;
}

/**
 * Headline Primitive: Merender judul utama, subheader, dan teaser definisi
 * dengan penyesuaian font adaptif dan perlakuan surface editorial.
 */
export function buildHeadlinePrimitive(params: HeadlinePrimitiveParams): any {
  const colors = params.colors || params.resolvedColors || {
    primaryAccent: '#EA580C',
    secondaryAccent: '#FED7AA',
    backgroundBase: '#0F172A',
    textColor: '#FFFFFF',
    subTextColor: '#94A3B8',
    cardBackground: 'rgba(0,0,0,0.5)',
    cardBorder: 'rgba(255,255,255,0.1)',
    source: 'BLUEPRINT' as const,
    isDark: true,
  };
  const {
    title = params.headline,
    subheader = params.subHeader,
    definitionBody,
    fontFamily = 'Bebas Neue',
    maxFontSize = 96,
    minFontSize = 52,
    maxCharThreshold = 20,
    surfaceMode = params.surface || 'NONE',
    isDark = colors.isDark !== false,
    align = 'left',
    maxWidth = '100%',
  } = params;

  const displayTitle = (title || 'POLARIS').toUpperCase();
  const titleFontSize = getAdaptiveFontSize(
    displayTitle,
    maxFontSize,
    minFontSize,
    maxCharThreshold
  );

  const textTokens = EditorialSurface.getTextColors(isDark, {
    brandHex: colors.primaryAccent,
    accentHex: colors.secondaryAccent,
  });

  const surfaceStyle = EditorialSurface.getTextSurface(surfaceMode, {
    isDark,
    accentHex: colors.primaryAccent,
  });

  const children: any[] = [];

  if (subheader) {
    children.push({
      type: 'span',
      props: {
        style: {
          fontSize: '12px',
          fontWeight: 800,
          color: colors.primaryAccent,
          letterSpacing: '0.12em',
          textTransform: 'uppercase',
          textAlign: align,
          textShadow: isDark ? '0 2px 8px rgba(0,0,0,0.8)' : 'none',
        },
        children: smartTruncate(subheader, 75).toUpperCase(),
      },
    });
  }

  children.push({
    type: 'div',
    props: {
      style: {
        fontFamily,
        fontSize: `${titleFontSize}px`,
        color: textTokens.textPrimary,
        lineHeight: fontFamily === 'DejaVu Serif' ? 1.05 : 0.92,
        letterSpacing: fontFamily === 'DejaVu Serif' ? '0.01em' : '0.03em',
        textAlign: align,
        textShadow: isDark
          ? '0 4px 24px rgba(0,0,0,0.95), 0 2px 8px rgba(0,0,0,0.85)'
          : 'none',
      },
      children: smartTruncate(displayTitle, 45),
    },
  });

  if (definitionBody) {
    children.push({
      type: 'div',
      props: {
        style: {
          fontSize: '13px',
          color: textTokens.textMuted,
          lineHeight: 1.42,
          marginTop: '6px',
          textAlign: align,
          maxWidth: '92%',
        },
        children: smartTruncate(definitionBody, 200),
      },
    });
  }

  return {
    type: 'div',
    props: {
      style: {
        ...surfaceStyle,
        display: 'flex',
        flexDirection: 'column',
        gap: '6px',
        alignItems: align === 'center' ? 'center' : align === 'right' ? 'flex-end' : 'flex-start',
        maxWidth,
      },
      children,
    },
  };
}
