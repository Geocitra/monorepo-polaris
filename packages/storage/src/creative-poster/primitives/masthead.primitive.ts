import { ResolvedColorTokens } from '../types.js';

export type MastheadStyle =
  | 'BROADSHEET_CLASSIC'
  | 'MODERN_MINIMAL'
  | 'BOLD_STAMP'
  | 'VINTAGE_RIBBON';

export interface MastheadPrimitiveParams {
  style?: MastheadStyle;
  title?: string;
  editionTag?: string;
  subTag?: string;
  logoDataUri?: string;
  colors?: ResolvedColorTokens;
  resolvedColors?: ResolvedColorTokens;
  isDark?: boolean;
}

/**
 * Masthead Primitive: Header navigasi, masthead koran, atau stempel edisi resmi.
 */
export function buildMastheadPrimitive(params: MastheadPrimitiveParams): any {
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
    style = 'MODERN_MINIMAL',
    editionTag = params.title || 'EDISI RESMI',
    subTag = 'EDISI RESMI // 2026',
    logoDataUri,
    isDark = colors.isDark !== false,
  } = params;

  const textPrimary = isDark ? '#FFFFFF' : '#0F172A';
  const textMuted = isDark ? 'rgba(255, 255, 255, 0.70)' : 'rgba(15, 23, 42, 0.65)';
  const borderSubtle = isDark ? 'rgba(255, 255, 255, 0.15)' : 'rgba(15, 23, 42, 0.12)';
  const accent = colors.primaryAccent;

  if (style === 'BROADSHEET_CLASSIC') {
    return {
      type: 'div',
      props: {
        style: {
          display: 'flex',
          flexDirection: 'column',
          width: '100%',
          borderTop: `2px solid ${textPrimary}`,
          borderBottom: `1px solid ${borderSubtle}`,
          padding: '8px 0px 10px 0px',
          gap: '6px',
        },
        children: [
          {
            type: 'div',
            props: {
              style: {
                display: 'flex',
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
              },
              children: [
                {
                  type: 'span',
                  props: {
                    style: {
                      fontFamily: 'DejaVu Serif',
                      fontSize: '11px',
                      fontStyle: 'italic',
                      color: textMuted,
                      letterSpacing: '0.05em',
                    },
                    children: subTag.toUpperCase(),
                  },
                },
                ...(logoDataUri
                  ? [
                      {
                        type: 'img',
                        props: {
                          src: logoDataUri,
                          style: { height: '24px', objectFit: 'contain' },
                        },
                      },
                    ]
                  : []),
                {
                  type: 'span',
                  props: {
                    style: {
                      fontFamily: 'DejaVu Serif',
                      fontSize: '11px',
                      fontWeight: 700,
                      color: textPrimary,
                      letterSpacing: '0.06em',
                    },
                    children: editionTag.toUpperCase(),
                  },
                },
              ],
            },
          },
        ],
      },
    };
  }

  if (style === 'BOLD_STAMP') {
    return {
      type: 'div',
      props: {
        style: {
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          width: '100%',
          backgroundColor: isDark ? '#09090B' : '#FFFFFF',
          border: `2px solid ${accent}`,
          padding: '8px 16px',
          boxShadow: `3px 3px 0px ${accent}`,
        },
        children: [
          {
            type: 'div',
            props: {
              style: { display: 'flex', alignItems: 'center', gap: '10px' },
              children: [
                ...(logoDataUri
                  ? [
                      {
                        type: 'img',
                        props: {
                          src: logoDataUri,
                          style: { height: '26px', objectFit: 'contain' },
                        },
                      },
                    ]
                  : []),
                {
                  type: 'span',
                  props: {
                    style: {
                      fontFamily: 'Anton',
                      fontSize: '15px',
                      color: accent,
                      letterSpacing: '0.08em',
                    },
                    children: editionTag.toUpperCase(),
                  },
                },
              ],
            },
          },
          {
            type: 'span',
            props: {
              style: {
                fontSize: '10.5px',
                fontWeight: 800,
                color: isDark ? '#FFFFFF' : '#0F172A',
                letterSpacing: '0.06em',
              },
              children: subTag.toUpperCase(),
            },
          },
        ],
      },
    };
  }

  if (style === 'VINTAGE_RIBBON') {
    return {
      type: 'div',
      props: {
        style: {
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          width: '100%',
          paddingBottom: '12px',
          borderBottom: `2px solid ${accent}`,
        },
        children: [
          {
            type: 'div',
            props: {
              style: { display: 'flex', alignItems: 'center', gap: '10px' },
              children: [
                ...(logoDataUri
                  ? [
                      {
                        type: 'img',
                        props: {
                          src: logoDataUri,
                          style: { height: '28px', objectFit: 'contain' },
                        },
                      },
                    ]
                  : []),
                {
                  type: 'span',
                  props: {
                    style: {
                      fontFamily: 'Anton',
                      fontSize: '16px',
                      color: textPrimary,
                      letterSpacing: '0.06em',
                    },
                    children: editionTag.toUpperCase(),
                  },
                },
              ],
            },
          },
          {
            type: 'span',
            props: {
              style: {
                fontSize: '11px',
                color: textMuted,
                letterSpacing: '0.05em',
              },
              children: subTag.toUpperCase(),
            },
          },
        ],
      },
    };
  }

  // MODERN_MINIMAL (Default)
  return {
    type: 'div',
    props: {
      style: {
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        width: '100%',
        paddingBottom: '12px',
        borderBottom: `1px solid ${borderSubtle}`,
      },
      children: [
        {
          type: 'div',
          props: {
            style: { display: 'flex', alignItems: 'center', gap: '10px' },
            children: [
              ...(logoDataUri
                ? [
                    {
                      type: 'img',
                      props: {
                        src: logoDataUri,
                        style: { height: '28px', objectFit: 'contain' },
                      },
                    },
                  ]
                : []),
              {
                type: 'span',
                props: {
                  style: {
                    fontFamily: 'Anton',
                    fontSize: '16px',
                    color: textPrimary,
                    letterSpacing: '0.06em',
                  },
                  children: editionTag.toUpperCase(),
                },
              },
            ],
          },
        },
        {
          type: 'span',
          props: {
            style: {
              fontSize: '10.5px',
              fontWeight: 700,
              color: '#FFFFFF',
              backgroundColor: accent,
              padding: '3px 8px',
              borderRadius: '3px',
              letterSpacing: '0.05em',
            },
            children: subTag.toUpperCase(),
          },
        },
      ],
    },
  };
}
