import { ResolvedColorTokens, SurfaceMode } from '../types.js';
import { smartTruncate } from '../core/adaptive-typography.js';
import { EditorialSurface } from '../core/editorial-surface.js';

export interface MemberSignaturePrimitiveParams {
  memberName?: string;
  memberTitle?: string;
  name?: string;
  title?: string;
  affiliationTag?: string;
  qrCodeDataUri?: string;
  showBarcodeAccent?: boolean;
  surfaceMode?: SurfaceMode;
  colors?: ResolvedColorTokens;
  resolvedColors?: ResolvedColorTokens;
  isDark?: boolean;
  borderAccentSide?: 'left' | 'top' | 'none';
}

/**
 * MemberSignature Primitive: Merender blok identitas anggota dewan,
 * jabatan parlemen/dapil, dan kode QR resmi secara proporsional.
 */
export function buildMemberSignaturePrimitive(params: MemberSignaturePrimitiveParams): any {
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
    memberName = params.name || 'POLARIS MEMBER',
    memberTitle = params.title || 'ANGGOTA DEWAN',
    affiliationTag = 'DOKUMEN ADVOKASI PUBLIK',
    qrCodeDataUri,
    surfaceMode = 'SOLID_BAND',
    isDark = colors.isDark !== false,
    borderAccentSide = 'left',
  } = params;

  const textTokens = EditorialSurface.getTextColors(isDark, {
    brandHex: colors.primaryAccent,
    accentHex: colors.secondaryAccent,
  });

  const surfaceStyle = EditorialSurface.getTextSurface(surfaceMode, {
    isDark,
    accentHex: colors.primaryAccent,
    borderRadius: '2px',
    padding: '14px 22px',
  });

  const borderStyles: Record<string, string> = {};
  if (borderAccentSide === 'left') {
    borderStyles.borderLeft = `4px solid ${colors.primaryAccent}`;
  } else if (borderAccentSide === 'top') {
    borderStyles.borderTop = `3px solid ${colors.primaryAccent}`;
  }

  return {
    type: 'div',
    props: {
      style: {
        ...surfaceStyle,
        ...borderStyles,
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        width: '100%',
        boxSizing: 'border-box',
      },
      children: [
        {
          type: 'div',
          props: {
            style: { display: 'flex', flexDirection: 'column', gap: '3px' },
            children: [
              {
                type: 'span',
                props: {
                  style: {
                    fontFamily: 'Anton',
                    fontSize: '21px',
                    color: textTokens.textPrimary,
                    letterSpacing: '0.04em',
                  },
                  children: memberName.toUpperCase(),
                },
              },
              {
                type: 'span',
                props: {
                  style: {
                    fontSize: '11px',
                    color: colors.primaryAccent,
                    fontWeight: 600,
                    letterSpacing: '0.04em',
                  },
                  children: smartTruncate(memberTitle, 45).toUpperCase(),
                },
              },
            ],
          },
        },
        {
          type: 'div',
          props: {
            style: { display: 'flex', alignItems: 'center', gap: '12px' },
            children: [
              ...(qrCodeDataUri
                ? [
                    {
                      type: 'img',
                      props: {
                        src: qrCodeDataUri,
                        style: {
                          width: '44px',
                          height: '44px',
                          borderRadius: '2px',
                          border: `1px solid ${textTokens.borderSubtle}`,
                        },
                      },
                    },
                  ]
                : []),
              {
                type: 'div',
                props: {
                  style: {
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'flex-end',
                    gap: '2px',
                  },
                  children: [
                    {
                      type: 'span',
                      props: {
                        style: {
                          fontFamily: 'Space Mono',
                          fontSize: '9.5px',
                          color: textTokens.textMuted,
                          letterSpacing: '0.05em',
                        },
                        children: affiliationTag.toUpperCase(),
                      },
                    },
                    {
                      type: 'span',
                      props: {
                        style: {
                          fontSize: '10.5px',
                          color: colors.secondaryAccent,
                          fontWeight: 700,
                        },
                        children: 'POLARIS // GOV',
                      },
                    },
                  ],
                },
              },
            ],
          },
        },
      ],
    },
  };
}
