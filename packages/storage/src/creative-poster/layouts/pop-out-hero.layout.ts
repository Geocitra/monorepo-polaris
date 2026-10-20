import { SynthesizedEditorialCopy } from '../types.js';
import { getAdaptiveFontSize, smartTruncate, getProtectiveCardStyle } from '../core/adaptive-typography.js';

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
}

/**
 * Layout Khusus POP_OUT_HERO:
 * Terinspirasi dari "Minimal Poster Design with Bold Typography / Cinematic Layout"
 * Menampilkan Tipografi Raksasa Bebas Neue dengan perlindungan kontras dinamis,
 * variasi posisi (Top/Center/Bottom Anchor), dan kartu editorial modern berpalet senada.
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
  } = params;

  const rawTitle = copy.mainBannerTitle || headline || 'POLARIS HERO';
  const displayTitle = rawTitle.toUpperCase();
  const displaySubheader = copy.mainBannerSubheader || 'ASPIRASI & KEBIJAKAN PARLEMEN';
  const displayQuote = quote || copy.mainBannerDefinitionBody || 'Mewujudkan arah baru kebijakan publik yang transparan dan berkeadilan.';

  const secAccent = secondaryAccent || copy.secondaryAccent || '#FB923C';
  const cardBg = copy.cardBackground || 'rgba(8, 12, 24, 0.88)';
  const cardBrd = copy.cardBorder || 'rgba(255, 255, 255, 0.18)';

  // Adaptive Font Size: Mencegah teks judul kepotong/hilang di Satori
  const titleFontSize = getAdaptiveFontSize(displayTitle, 96, 56, 18);
  const quoteFontSize = getAdaptiveFontSize(displayQuote, 14, 11, 140);

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
        padding: '36px 44px',
        fontFamily: 'Plus Jakarta Sans',
      },
      children: [
        // ===================================================================
        // 1. TOP HEADER & MASSIVE HEADLINE (Hero Block)
        // ===================================================================
        {
          type: 'div',
          props: {
            style: {
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
            },
            children: [
              // Header Navigation Bar
              {
                type: 'div',
                props: {
                  style: {
                    display: 'flex',
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    paddingBottom: '12px',
                    borderBottom: '1.5px solid rgba(255, 255, 255, 0.2)',
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
                                color: primaryAccent,
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
                          backgroundColor: primaryAccent,
                          padding: '4px 10px',
                          borderRadius: '4px',
                          letterSpacing: '0.06em',
                        },
                        children: 'EDISI KHUSUS',
                      },
                    },
                  ],
                },
              },

              // Hero Title Container (Protected Contrast Bar)
              {
                type: 'div',
                props: {
                  style: {
                    ...getProtectiveCardStyle({
                      bgColor: cardBg,
                      borderColor: cardBrd,
                      padding: '18px 24px',
                    }),
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '6px',
                  },
                  children: [
                    {
                      type: 'span',
                      props: {
                        style: {
                          fontSize: '12px',
                          fontWeight: 700,
                          color: secAccent,
                          letterSpacing: '0.1em',
                        },
                        children: smartTruncate(displaySubheader, 70).toUpperCase(),
                      },
                    },
                    {
                      type: 'div',
                      props: {
                        style: {
                          fontFamily: 'Bebas Neue',
                          fontSize: `${titleFontSize}px`,
                          color: '#FFFFFF',
                          lineHeight: 0.92,
                          letterSpacing: '0.03em',
                          textShadow: '0 4px 20px rgba(0,0,0,0.8)',
                        },
                        children: smartTruncate(displayTitle, 36),
                      },
                    },
                  ],
                },
              },
            ],
          },
        },

        // ===================================================================
        // 2. BOTTOM GLASSMORPHIC EDITORIAL BANNER (Statement + Identitas)
        // ===================================================================
        {
          type: 'div',
          props: {
            style: {
              ...getProtectiveCardStyle({
                bgColor: cardBg,
                borderColor: cardBrd,
                padding: '20px 26px',
              }),
              display: 'flex',
              flexDirection: 'column',
              gap: '14px',
              borderTop: `4px solid ${primaryAccent}`,
            },
            children: [
              // Kutipan Pernyataan (Adaptive Size)
              {
                type: 'div',
                props: {
                  style: {
                    fontSize: `${quoteFontSize}px`,
                    color: '#F1F5F9',
                    lineHeight: 1.45,
                    borderLeft: `3px solid ${primaryAccent}`,
                    paddingLeft: '14px',
                  },
                  children: smartTruncate(displayQuote, 220),
                },
              },

              // Identitas Dewan & Atribusi
              {
                type: 'div',
                props: {
                  style: {
                    display: 'flex',
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    paddingTop: '10px',
                    borderTop: '1px solid rgba(255, 255, 255, 0.12)',
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
                                fontSize: '11px',
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
                      type: 'span',
                      props: {
                        style: {
                          fontFamily: 'Space Mono',
                          fontSize: '10px',
                          color: '#94A3B8',
                          letterSpacing: '0.06em',
                        },
                        children: 'POLARIS // ADVOCACY DISCOURSE 2026',
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
