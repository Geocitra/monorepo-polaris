import { SynthesizedEditorialCopy, CompositionPlan, ResolvedColorTokens } from '../types.js';
import {
  getAdaptiveFontSize,
  wordSafeHeadlineTruncate,
  smartSentenceClamp,
} from '../core/adaptive-typography.js';
import { EditorialSurface } from '../core/editorial-surface.js';
import { VariantResolver } from '../core/variant-resolver.js';

export interface PopOutHeroLayoutParams {
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
 * Layout Khusus POP_OUT_HERO:
 * Terinspirasi dari "Minimal Poster Design with Bold Typography / Cinematic Layout"
 * Menampilkan Tipografi Raksasa Bebas Neue dengan adaptasi varian tata letak
 * (TOP_BANNER, BOTTOM_ANCHOR, EDITORIAL_SPLIT, CENTERED_HERO) dan permukaan editorial dinamis.
 */
export function buildPopOutHeroLayout(params: PopOutHeroLayoutParams): any {
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

  const layoutVariant = compositionPlan?.layoutVariant || copy.layoutVariant || 'TOP_BANNER';
  const headerPlacement = compositionPlan?.headerPlacement || copy.headerPlacement || 'top';

  const rawTitle = copy.mainBannerTitle || headline || 'POLARIS HERO';
  const displayTitle = wordSafeHeadlineTruncate(rawTitle, 34).toUpperCase();
  const displaySubheader = smartSentenceClamp(copy.mainBannerSubheader || 'ASPIRASI & KEBIJAKAN PARLEMEN', 70);
  const displayQuote = smartSentenceClamp(
    quote ||
    copy.mainBannerDefinitionBody ||
    'Mewujudkan arah baru kebijakan publik yang transparan dan berkeadilan.',
    220
  );

  const accentPrimary = resolvedColors?.primaryAccent || primaryAccent;
  const accentSecondary = resolvedColors?.secondaryAccent || secondaryAccent || copy.secondaryAccent || '#FB923C';

  // Penentuan kontras dan palet warna adaptif
  const isDarkCanvas = resolvedColors?.isDark !== false;
  const textTokens = EditorialSurface.getTextColors(isDarkCanvas, {
    brandHex: accentPrimary,
    accentHex: accentSecondary,
  });

  const titleFontSize = getAdaptiveFontSize(displayTitle, 96, 56, 18);
  const quoteFontSize = getAdaptiveFontSize(displayQuote, 14, 11, 140);

  // Permukaan dinamis untuk quote banner
  const bannerSurfaceStyle = EditorialSurface.getTextSurface(
    compositionPlan?.zones?.find((z) => z.role === 'EDITORIAL_BODY')?.surface || 'SCRIM_GRADIENT',
    {
      isDark: isDarkCanvas,
      accentHex: accentPrimary,
      padding: '20px 24px',
      borderRadius: '8px',
    }
  );

  // Komponen Header & Judul Hero
  const heroBlock = {
    type: 'div',
    props: {
      style: {
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
        padding: '8px 0px',
      },
      children: [
        {
          type: 'span',
          props: {
            style: {
              fontSize: '13px',
              fontWeight: 800,
              color: accentPrimary,
              letterSpacing: '0.12em',
              textShadow: isDarkCanvas ? '0 2px 10px rgba(0,0,0,0.85)' : 'none',
            },
            children: displaySubheader.toUpperCase(),
          },
        },
        {
          type: 'div',
          props: {
            style: {
              fontFamily: 'Bebas Neue',
              fontSize: `${titleFontSize}px`,
              color: textTokens.textPrimary,
              lineHeight: 0.92,
              letterSpacing: '0.04em',
              textShadow: isDarkCanvas
                ? '0 4px 24px rgba(0,0,0,0.95), 0 2px 8px rgba(0,0,0,0.85)'
                : 'none',
            },
            children: displayTitle,
          },
        },
      ],
    },
  };

  // Komponen Navigasi / Bar Identitas Atas
  const topNav = {
    type: 'div',
    props: {
      style: {
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingBottom: '12px',
        borderBottom: `1.5px solid ${textTokens.borderSubtle}`,
        width: '100%',
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
                        style: { height: '30px', objectFit: 'contain' },
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
                    color: accentPrimary,
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
              fontSize: '11px',
              fontWeight: 700,
              color: '#FFFFFF',
              backgroundColor: accentPrimary,
              padding: '4px 10px',
              borderRadius: '4px',
              letterSpacing: '0.06em',
            },
            children: 'EDISI KHUSUS',
          },
        },
      ],
    },
  };

  // Komponen Kutipan & Identitas Anggota
  const quoteFooterBlock = {
    type: 'div',
    props: {
      style: {
        ...bannerSurfaceStyle,
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        borderBottom: `3px solid ${accentPrimary}`,
      },
      children: [
        {
          type: 'div',
          props: {
            style: {
              fontSize: `${quoteFontSize}px`,
              color: textTokens.textPrimary,
              lineHeight: 1.45,
              borderLeft: `3px solid ${accentPrimary}`,
              paddingLeft: '14px',
              textShadow: isDarkCanvas ? '0 2px 8px rgba(0,0,0,0.7)' : 'none',
            },
            children: displayQuote,
          },
        },
        {
          type: 'div',
          props: {
            style: {
              display: 'flex',
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              paddingTop: '10px',
              borderTop: `1px solid ${textTokens.borderSubtle}`,
            },
            children: [
              {
                type: 'div',
                props: {
                  style: { display: 'flex', flexDirection: 'column', gap: '2px' },
                  children: [
                    {
                      type: 'span',
                      props: {
                        style: {
                          fontFamily: 'Anton',
                          fontSize: '20px',
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
                          color: accentPrimary,
                          fontWeight: 600,
                          letterSpacing: '0.04em',
                        },
                        children: memberTitle.toUpperCase(),
                      },
                    },
                  ],
                },
              },
              {
                type: 'span',
                props: {
                  style: {
                    fontFamily: 'Space Mono',
                    fontSize: '10px',
                    color: textTokens.textMuted,
                    letterSpacing: '0.06em',
                  },
                  children: 'POLARIS // ADVOCACY DISCOURSE',
                },
              },
            ],
          },
        },
      ],
    },
  };

  // Susun hirarki layout berdasarkan variant
  const isBottomAnchor = layoutVariant === 'BOTTOM_ANCHOR' || headerPlacement === 'bottom';

  const childrenNodes = isBottomAnchor
    ? [
        topNav,
        {
          type: 'div',
          props: {
            style: { display: 'flex', flexDirection: 'column', gap: '16px' },
            children: [heroBlock, quoteFooterBlock],
          },
        },
      ]
    : [
        {
          type: 'div',
          props: {
            style: { display: 'flex', flexDirection: 'column', gap: '12px' },
            children: [topNav, heroBlock],
          },
        },
        quoteFooterBlock,
      ];

  const rootStyles = VariantResolver.resolveRootContainer(layoutVariant, headerPlacement, '36px 44px');

  return {
    type: 'div',
    props: {
      style: {
        width: `${width}px`,
        height: `${height}px`,
        ...rootStyles,
        position: 'relative',
        fontFamily: 'Plus Jakarta Sans',
      },
      children: childrenNodes,
    },
  };
}
