import { SynthesizedEditorialCopy, CompositionPlan, ResolvedColorTokens } from '../types.js';
import {
  getAdaptiveFontSize,
  wordSafeHeadlineTruncate,
  smartSentenceClamp,
} from '../core/adaptive-typography.js';
import { EditorialSurface } from '../core/editorial-surface.js';
import { VariantResolver } from '../core/variant-resolver.js';

export interface StatementProfileLayoutParams {
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
 * Layout Khusus STATEMENT_PROFILE:
 * Terinspirasi dari "Steve Jobs / Modern Typography Poster / Karismatik Profile"
 * Menghadirkan layout majalah editorial prestisius dengan fokus kutipan tegas (thought leadership),
 * aksen tipografi editorial, dan permukaan adaptif WCAG AA tanpa kotak dashboard kaku.
 */
export function buildStatementProfileLayout(params: StatementProfileLayoutParams): any {
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

  const rawTitle = copy.mainBannerTitle || headline || 'GAGASAN STRATEGIS';
  const displayTitle = wordSafeHeadlineTruncate(rawTitle, 36).toUpperCase();
  const displaySubheader = smartSentenceClamp(copy.mainBannerSubheader || 'SUARA PARLEMEN & REFORMASI KEBIJAKAN', 65);
  const displayQuote = smartSentenceClamp(
    quote ||
    copy.mainBannerDefinitionBody ||
    'Keberanian merumuskan kebijakan yang berpihak adalah fondasi keadilan bagi generasi mendatang.',
    220
  );

  const accentPrimary = resolvedColors?.primaryAccent || primaryAccent;
  const accentSecondary = resolvedColors?.secondaryAccent || secondaryAccent || copy.secondaryAccent || '#818CF8';

  const isDarkCanvas = resolvedColors?.isDark !== false;
  const textTokens = EditorialSurface.getTextColors(isDarkCanvas, {
    brandHex: accentPrimary,
    accentHex: accentSecondary,
  });

  const titleFontSize = getAdaptiveFontSize(displayTitle, 80, 48, 20);
  const quoteFontSize = getAdaptiveFontSize(displayQuote, 16, 12, 120);

  // Surface mode untuk area quote
  const quoteSurfaceStyle = EditorialSurface.getTextSurface(
    compositionPlan?.zones?.find((z) => z.role === 'EDITORIAL_BODY')?.surface || 'SCRIM_GRADIENT',
    {
      isDark: isDarkCanvas,
      accentHex: accentPrimary,
      padding: '24px 28px',
      borderRadius: '4px',
    }
  );

  const footerSurfaceStyle = EditorialSurface.getTextSurface(
    compositionPlan?.zones?.find((z) => z.role === 'MEMBER_SIGNATURE')?.surface || 'SOLID_BAND',
    {
      isDark: isDarkCanvas,
      accentHex: accentPrimary,
      padding: '16px 24px',
      borderRadius: '2px',
    }
  );

  // 1. Top Editorial Bar
  const topBar = {
    type: 'div',
    props: {
      style: {
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingBottom: '14px',
        borderBottom: `2px solid ${accentPrimary}`,
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
                        style: { height: '32px', objectFit: 'contain' },
                      },
                    },
                  ]
                : []),
              {
                type: 'span',
                props: {
                  style: {
                    fontFamily: 'Anton',
                    fontSize: '18px',
                    color: textTokens.textPrimary,
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
              fontFamily: 'Space Mono',
              fontSize: '11px',
              color: textTokens.textMuted,
              letterSpacing: '0.08em',
            },
            children: 'SPECIAL EDITION // 2026',
          },
        },
      ],
    },
  };

  // 2. Main Statement Content Block
  const statementBlock = {
    type: 'div',
    props: {
      style: {
        ...quoteSurfaceStyle,
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        maxWidth: layoutVariant === 'EDITORIAL_SPLIT' ? '56%' : '78%',
      },
      children: [
        {
          type: 'span',
          props: {
            style: {
              fontSize: '13px',
              fontWeight: 800,
              color: accentPrimary,
              letterSpacing: '0.1em',
            },
            children: displaySubheader.toUpperCase(),
          },
        },
        {
          type: 'div',
          props: {
            style: {
              fontFamily: 'Anton',
              fontSize: `${titleFontSize}px`,
              color: textTokens.textPrimary,
              lineHeight: 0.95,
              letterSpacing: '0.02em',
            },
            children: displayTitle,
          },
        },
        {
          type: 'div',
          props: {
            style: {
              display: 'flex',
              flexDirection: 'row',
              gap: '14px',
              marginTop: '8px',
              paddingTop: '12px',
              borderTop: `1px solid ${textTokens.borderSubtle}`,
            },
            children: [
              {
                type: 'span',
                props: {
                  style: {
                    fontFamily: 'Anton',
                    fontSize: '48px',
                    color: accentPrimary,
                    lineHeight: 0.8,
                  },
                  children: '“',
                },
              },
              {
                type: 'span',
                props: {
                  style: {
                    fontSize: `${quoteFontSize}px`,
                    color: textTokens.textPrimary,
                    lineHeight: 1.48,
                    fontStyle: 'italic',
                  },
                  children: displayQuote,
                },
              },
            ],
          },
        },
      ],
    },
  };

  // 3. Profile Identity Footer
  const footerBlock = {
    type: 'div',
    props: {
      style: {
        ...footerSurfaceStyle,
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderLeft: `5px solid ${accentPrimary}`,
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
                    fontSize: '22px',
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
                    fontSize: '11.5px',
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
          type: 'div',
          props: {
            style: { display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '3px' },
            children: [
              {
                type: 'span',
                props: {
                  style: {
                    fontFamily: 'Space Mono',
                    fontSize: '10px',
                    color: textTokens.textMuted,
                    letterSpacing: '0.05em',
                  },
                  children: 'DOKUMEN RESMI PARLEMEN',
                },
              },
              {
                type: 'span',
                props: {
                  style: {
                    fontSize: '11px',
                    color: accentSecondary,
                    fontWeight: 700,
                  },
                  children: 'SUARA PUBLIK',
                },
              },
            ],
          },
        },
      ],
    },
  };

  const isBottomAnchor = layoutVariant === 'BOTTOM_ANCHOR' || headerPlacement === 'bottom';
  const childrenNodes = isBottomAnchor
    ? [
        topBar,
        {
          type: 'div',
          props: {
            style: { display: 'flex', flexDirection: 'column', gap: '20px' },
            children: [statementBlock, footerBlock],
          },
        },
      ]
    : [
        {
          type: 'div',
          props: {
            style: { display: 'flex', flexDirection: 'column', gap: '24px' },
            children: [topBar, statementBlock],
          },
        },
        footerBlock,
      ];

  const rootStyles = VariantResolver.resolveRootContainer(layoutVariant, headerPlacement, '42px 48px');

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
