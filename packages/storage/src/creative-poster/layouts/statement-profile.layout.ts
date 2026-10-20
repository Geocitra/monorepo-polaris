import { SynthesizedEditorialCopy } from '../types.js';
import { getAdaptiveFontSize, smartTruncate, getProtectiveCardStyle } from '../core/adaptive-typography.js';

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
}

/**
 * Layout Khusus STATEMENT_PROFILE:
 * Terinspirasi dari "Steve Jobs / Modern Typography Poster / Karismatik Profile"
 * Menghadirkan layout majalah editorial prestisius dengan fokus kutipan tegas (thought leadership),
 * aksen tipografi vertikal/editorial, dan kartu profil glassmorphic berpalet senada.
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
  } = params;

  const rawTitle = copy.mainBannerTitle || headline || 'GAGASAN STRATEGIS';
  const displayTitle = rawTitle.toUpperCase();
  const displaySubheader = copy.mainBannerSubheader || 'SUARA PARLEMEN & REFORMASI KEBIJAKAN';
  const displayQuote = quote || copy.mainBannerDefinitionBody || 'Keberanian merumuskan kebijakan yang berpihak adalah fondasi keadilan bagi generasi mendatang.';

  const secAccent = secondaryAccent || copy.secondaryAccent || '#818CF8';
  const cardBg = copy.cardBackground || 'rgba(8, 12, 22, 0.86)';
  const cardBrd = copy.cardBorder || 'rgba(255, 255, 255, 0.16)';

  const titleFontSize = getAdaptiveFontSize(displayTitle, 80, 48, 20);
  const quoteFontSize = getAdaptiveFontSize(displayQuote, 16, 12, 120);

  return {
    type: 'div',
    props: {
      style: {
        width: `${width}px`,
        height: `${height}px`,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        position: 'relative',
        padding: '42px 48px',
        fontFamily: 'Plus Jakarta Sans',
      },
      children: [
        // ===================================================================
        // 1. TOP EDITORIAL BAR (Edition + Logo)
        // ===================================================================
        {
          type: 'div',
          props: {
            style: {
              display: 'flex',
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              paddingBottom: '14px',
              borderBottom: `2px solid ${primaryAccent}`,
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
                          color: '#FFFFFF',
                          letterSpacing: '0.06em',
                        },
                        children: 'POLARIS LEADERSHIP SERIES',
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
                    color: primaryAccent,
                    letterSpacing: '0.08em',
                  },
                  children: editionTag.toUpperCase(),
                },
              },
            ],
          },
        },

        // ===================================================================
        // 2. CENTERPIECE STATEMENT & HEADLINE CARD (Thought Leadership)
        // ===================================================================
        {
          type: 'div',
          props: {
            style: {
              ...getProtectiveCardStyle({
                bgColor: 'rgba(8, 12, 22, 0.86)',
                borderColor: 'rgba(255, 255, 255, 0.16)',
                padding: '24px 30px',
              }),
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
              maxWidth: '820px',
            },
            children: [
              // Subheader Kategori
              {
                type: 'span',
                props: {
                  style: {
                    fontSize: '12px',
                    fontWeight: 700,
                    color: primaryAccent,
                    letterSpacing: '0.1em',
                  },
                  children: smartTruncate(displaySubheader, 65).toUpperCase(),
                },
              },

              // Judul Profil Anton
              {
                type: 'div',
                props: {
                  style: {
                    fontFamily: 'Anton',
                    fontSize: `${titleFontSize}px`,
                    color: '#FFFFFF',
                    lineHeight: 1.02,
                    letterSpacing: '0.02em',
                  },
                  children: smartTruncate(displayTitle, 40),
                },
              },

              // Tanda Kutip Raksasa + Pernyataan Karismatik
              {
                type: 'div',
                props: {
                  style: {
                    display: 'flex',
                    flexDirection: 'row',
                    gap: '14px',
                    marginTop: '8px',
                    paddingTop: '12px',
                    borderTop: '1px solid rgba(255, 255, 255, 0.12)',
                  },
                  children: [
                    {
                      type: 'span',
                      props: {
                        style: {
                          fontFamily: 'Anton',
                          fontSize: '48px',
                          color: primaryAccent,
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
                          color: '#E2E8F0',
                          lineHeight: 1.48,
                          fontStyle: 'italic',
                        },
                        children: smartTruncate(displayQuote, 240),
                      },
                    },
                  ],
                },
              },
            ],
          },
        },

        // ===================================================================
        // 3. BOTTOM PROFILE IDENTITY FOOTER
        // ===================================================================
        {
          type: 'div',
          props: {
            style: {
              ...getProtectiveCardStyle({
                bgColor: 'rgba(15, 23, 42, 0.92)',
                borderColor: 'rgba(255, 255, 255, 0.18)',
                padding: '16px 24px',
              }),
              display: 'flex',
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              borderLeft: `5px solid ${primaryAccent}`,
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
                          color: '#FFFFFF',
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
                          color: primaryAccent,
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
                  style: {
                    display: 'flex',
                    alignItems: 'center',
                    backgroundColor: 'rgba(255, 255, 255, 0.08)',
                    padding: '6px 14px',
                    borderRadius: '4px',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                  },
                  children: [
                    {
                      type: 'span',
                      props: {
                        style: {
                          fontSize: '11px',
                          fontWeight: 700,
                          color: '#E2E8F0',
                          letterSpacing: '0.05em',
                        },
                        children: 'KOMITMEN & INTEGRITAS PUBLIK',
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
