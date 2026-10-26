import { ResolvedColorTokens } from '../types.js';
import { smartTruncate, safeEditorialText, cleanCircleLabel, smartSentenceClamp } from '../core/adaptive-typography.js';
import { EditorialSurface } from '../core/editorial-surface.js';

export interface StatCircleItem {
  topLabel: string;
  value: string;
  description: string;
}

export interface NumberedListItem {
  number: string;
  title: string;
  subtitle?: string;
  summary: string;
}

export interface StatBadgesPrimitiveParams {
  statCircles?: StatCircleItem[];
  stats?: StatCircleItem[];
  displayMode?: 'stat_circles' | 'numbered_items' | 'pill_badges';
  numberedItems?: NumberedListItem[];
  variant?: 'CIRCLES' | 'NUMBERED_STREAM' | 'PILL_BADGES';
  colors?: ResolvedColorTokens;
  resolvedColors?: ResolvedColorTokens;
  isDark?: boolean;
}

/**
 * StatBadges Primitive: Merender lingkaran statistik (statCircles)
 * atau daftar bernomor (numberedItems 01-05) secara modular.
 */
export function buildStatBadgesPrimitive(params: StatBadgesPrimitiveParams): any {
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
  const statCircles = params.statCircles || params.stats;
  const variant =
    params.variant ||
    (params.displayMode === 'stat_circles' ? 'CIRCLES' : undefined) ||
    (statCircles && statCircles.length > 0 ? 'CIRCLES' : 'NUMBERED_STREAM');
  const {
    numberedItems,
    isDark = colors.isDark !== false,
  } = params;

  const textTokens = EditorialSurface.getTextColors(isDark, {
    brandHex: colors.primaryAccent,
    accentHex: colors.secondaryAccent,
  });

  if (variant === 'CIRCLES' && statCircles && statCircles.length > 0) {
    const circleNodes = statCircles.slice(0, 3).map((item, idx) => {
      const isFirst = idx === 0;
      const borderCol = isFirst ? colors.primaryAccent : colors.secondaryAccent;

      return {
        type: 'div',
        props: {
          style: {
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            width: '120px',
            height: '120px',
            borderRadius: '60px',
            border: `2px solid ${borderCol}`,
            backgroundColor: isDark ? 'rgba(15, 23, 42, 0.70)' : 'rgba(255, 255, 255, 0.85)',
            padding: '10px',
            boxSizing: 'border-box',
          },
          children: [
            {
              type: 'span',
              props: {
                style: {
                  fontSize: '9px',
                  fontWeight: 700,
                  color: isFirst ? colors.primaryAccent : colors.secondaryAccent,
                  letterSpacing: '0.06em',
                  textTransform: 'uppercase',
                },
                children: cleanCircleLabel(safeEditorialText(item.topLabel || 'CAPAIAN'), 11),
              },
            },
            {
              type: 'span',
              props: {
                style: {
                  fontFamily: 'Anton',
                  fontSize: '26px',
                  color: textTokens.textPrimary,
                  lineHeight: 1.1,
                  margin: '2px 0',
                },
                children: item.value,
              },
            },
            {
              type: 'span',
              props: {
                style: {
                  fontSize: '8.5px',
                  color: textTokens.textMuted,
                  textAlign: 'center',
                  lineHeight: 1.2,
                },
                children: smartSentenceClamp(safeEditorialText(item.description || ''), 48),
              },
            },
          ],
        },
      };
    });

    return {
      type: 'div',
      props: {
        style: {
          display: 'flex',
          flexDirection: 'row',
          gap: '16px',
          alignItems: 'center',
        },
        children: circleNodes,
      },
    };
  }

  if (numberedItems && numberedItems.length > 0) {
    const itemNodes = numberedItems.slice(0, 4).map((item, idx) => {
      const num = item.number || `0${idx + 1}`;
      return {
        type: 'div',
        props: {
          style: {
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'flex-start',
            gap: '12px',
            paddingBottom: '8px',
            borderBottom: `1px solid ${textTokens.borderSubtle}`,
          },
          children: [
            {
              type: 'span',
              props: {
                style: {
                  fontFamily: 'Anton',
                  fontSize: '20px',
                  color: idx === 0 ? colors.primaryAccent : colors.secondaryAccent,
                  lineHeight: 1,
                  minWidth: '28px',
                },
                children: num,
              },
            },
            {
              type: 'div',
              props: {
                style: { display: 'flex', flexDirection: 'column', gap: '2px', flex: '1' },
                children: [
                  {
                    type: 'span',
                    props: {
                      style: {
                        fontSize: '11.5px',
                        fontWeight: 700,
                        color: textTokens.textPrimary,
                        letterSpacing: '0.04em',
                      },
                      children: smartTruncate(safeEditorialText(item.title), 40).toUpperCase(),
                    },
                  },
                  {
                    type: 'span',
                    props: {
                      style: {
                        fontSize: '10.5px',
                        color: textTokens.textMuted,
                        lineHeight: 1.35,
                      },
                      children: smartTruncate(safeEditorialText(item.summary), 100),
                    },
                  },
                ],
              },
            },
          ],
        },
      };
    });

    return {
      type: 'div',
      props: {
        style: {
          display: 'flex',
          flexDirection: 'column',
          gap: '10px',
          width: '100%',
        },
        children: itemNodes,
      },
    };
  }

  return null;
}
