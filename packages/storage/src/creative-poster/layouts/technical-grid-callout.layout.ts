import { SynthesizedEditorialCopy, CompositionPlan, ResolvedColorTokens } from '../types.js';
import { getAdaptiveFontSize, wordSafeHeadlineTruncate, smartSentenceClamp } from '../core/adaptive-typography.js';

export interface TechnicalGridCalloutLayoutParams {
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
 * Layout Khusus TECHNICAL_GRID_CALLOUT:
 * Terinspirasi dari Callout Publik Tegas & Editorial Viral
 * Ciri khas:
 * - Gaya komunikasi viral & diskursus publik yang lugas dan mengena
 * - Gelembung kutipan (Speech Callout Card) dengan aksen garis hazard & grid terminal
 * - Warna kontras tinggi (Electric Yellow #FACC15, Charcoal Black #09090B) menjamin 100% keterbacaan
 */
export function buildTechnicalGridCalloutLayout(params: TechnicalGridCalloutLayoutParams): any {
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
    logoDataUri,
    compositionPlan,
    resolvedColors,
  } = params;

  const yellow = resolvedColors?.primaryAccent || primaryAccent || '#FACC15';
  const black = resolvedColors?.isDark !== false ? '#09090B' : '#0F172A';
  const rawTitle = copy.mainBannerTitle || headline || 'KOMITMEN TERUKUR PARLEMEN';
  const displayTitle = rawTitle.toUpperCase();
  const displaySubheader = copy.mainBannerSubheader || 'SUARA REALITAS // DIALOG TERBUKA RAKYAT';
  const displayQuote = quote || copy.mainBannerDefinitionBody || 'Komitmen kebijakan publik harus diwujudkan melalui pengawasan anggaran ketat dan tindakan terarah di lapangan.';

  const blocks = copy.blocks || {};
  const punch1 = blocks['punch_1'] || { header: 'FAKTA LAPANGAN', body: 'Harga kebutuhan pokok harus ditekan melalui efisiensi rantai pasok.' };
  const punch2 = blocks['punch_2'] || { header: 'AKSI PARLEMEN', body: 'Menekan pemerintah daerah menindak tegas mafia penimbunan komoditas.' };

  const titleFontSize = getAdaptiveFontSize(displayTitle, 86, 52, 16);

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
        padding: '38px 44px',
        fontFamily: 'Plus Jakarta Sans',
      },
      children: [
        // ===================================================================
        // 1. TOP VIRAL CALLOUT HEADER & HAZARD TAG
        // ===================================================================
        {
          type: 'div',
          props: {
            style: {
              display: 'flex',
              flexDirection: 'column',
              gap: '10px',
            },
            children: [
              // Header Card
              {
                type: 'div',
                props: {
                  style: {
                    display: 'flex',
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    backgroundColor: black,
                    border: `2px solid ${yellow}`,
                    padding: '10px 18px',
                    boxShadow: `4px 4px 0px ${yellow}`,
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
                                fontSize: '18px',
                                color: yellow,
                                letterSpacing: '0.08em',
                              },
                              children: 'POLARIS // VIRAL DISCOURSE',
                            },
                          },
                        ],
                      },
                    },
                    {
                      type: 'div',
                      props: {
                        style: {
                          backgroundColor: yellow,
                          color: black,
                          fontFamily: 'Anton',
                          fontSize: '12px',
                          padding: '4px 8px',
                          letterSpacing: '0.05em',
                        },
                        children: editionTag.toUpperCase(),
                      },
                    },
                  ],
                },
              },

              // Subheader Warning Ribbon
              {
                type: 'div',
                props: {
                  style: {
                    backgroundColor: yellow,
                    color: black,
                    fontFamily: 'Anton',
                    fontSize: '13px',
                    padding: '4px 12px',
                    width: 'fit-content',
                    letterSpacing: '0.08em',
                    boxShadow: `3px 3px 0px ${black}`,
                  },
                  children: displaySubheader.toUpperCase(),
                },
              },
            ],
          },
        },

        // ===================================================================
        // 2. CENTER SPEECH BUBBLE HERO & PUNCHLINE CARDS
        // ===================================================================
        {
          type: 'div',
          props: {
            style: {
              display: 'flex',
              flexDirection: 'column',
              gap: '14px',
              maxWidth: '640px',
            },
            children: [
              // Main Speech Headline Box
              {
                type: 'div',
                props: {
                  style: {
                    backgroundColor: black,
                    borderLeft: `8px solid ${yellow}`,
                    padding: '20px 26px',
                    boxShadow: '6px 8px 0px rgba(0,0,0,0.6)',
                  },
                  children: [
                    {
                      type: 'span',
                      props: {
                        style: {
                          fontFamily: 'Bebas Neue',
                          fontSize: `${titleFontSize}px`,
                          color: '#FFFFFF',
                          lineHeight: 0.9,
                          letterSpacing: '0.03em',
                        },
                        children: displayTitle,
                      },
                    },
                  ],
                },
              },

              // Dual Punch Cards
              {
                type: 'div',
                props: {
                  style: {
                    display: 'flex',
                    flexDirection: 'row',
                    gap: '12px',
                  },
                  children: [
                    {
                      type: 'div',
                      props: {
                        style: {
                          flex: 1,
                          backgroundColor: 'rgba(250, 204, 21, 0.96)',
                          border: `2px solid ${black}`,
                          padding: '14px 16px',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '4px',
                          boxShadow: `4px 4px 0px ${black}`,
                        },
                        children: [
                          {
                            type: 'span',
                            props: {
                              style: {
                                fontFamily: 'Anton',
                                fontSize: '17px',
                                color: black,
                                letterSpacing: '0.04em',
                              },
                              children: wordSafeHeadlineTruncate(punch1.header, 26).toUpperCase(),
                            },
                          },
                          {
                            type: 'span',
                            props: {
                              style: {
                                fontSize: '11.5px',
                                color: '#18181B',
                                lineHeight: 1.35,
                                fontWeight: 600,
                              },
                              children: smartSentenceClamp(punch1.body, 110),
                            },
                          },
                        ],
                      },
                    },
                    {
                      type: 'div',
                      props: {
                        style: {
                          flex: 1,
                          backgroundColor: black,
                          border: `2px solid ${yellow}`,
                          padding: '14px 16px',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '4px',
                          boxShadow: `4px 4px 0px ${yellow}`,
                        },
                        children: [
                          {
                            type: 'span',
                            props: {
                              style: {
                                fontFamily: 'Anton',
                                fontSize: '17px',
                                color: yellow,
                                letterSpacing: '0.04em',
                              },
                              children: wordSafeHeadlineTruncate(punch2.header, 26).toUpperCase(),
                            },
                          },
                          {
                            type: 'span',
                            props: {
                              style: {
                                fontSize: '11.5px',
                                color: '#E4E4E7',
                                lineHeight: 1.35,
                              },
                              children: smartSentenceClamp(punch2.body, 110),
                            },
                          },
                        ],
                      },
                    },
                  ],
                },
              },

              // Speech Callout Quote Card
              {
                type: 'div',
                props: {
                  style: {
                    backgroundColor: 'rgba(9, 9, 11, 0.94)',
                    border: '1.5px solid rgba(255, 255, 255, 0.2)',
                    padding: '14px 20px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                  },
                  children: [
                    {
                      type: 'span',
                      props: {
                        style: {
                          fontFamily: 'Anton',
                          fontSize: '32px',
                          color: yellow,
                          lineHeight: 0.8,
                        },
                        children: '“',
                      },
                    },
                    {
                      type: 'span',
                      props: {
                        style: {
                          fontSize: '12.5px',
                          fontStyle: 'italic',
                          color: '#FFFFFF',
                          lineHeight: 1.4,
                        },
                        children: smartSentenceClamp(displayQuote, 160),
                      },
                    },
                  ],
                },
              },
            ],
          },
        },

        // ===================================================================
        // 3. BOTTOM HAZARD CALLOUT FOOTER
        // ===================================================================
        {
          type: 'div',
          props: {
            style: {
              backgroundColor: yellow,
              border: `2.5px solid ${black}`,
              padding: '12px 20px',
              display: 'flex',
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              boxShadow: `4px 4px 0px ${black}`,
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
                          color: black,
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
                          color: '#451A03',
                          fontWeight: 700,
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
                    fontFamily: 'Bebas Neue',
                    fontSize: '16px',
                    color: black,
                    letterSpacing: '0.08em',
                  },
                  children: 'VIRAL DIALOG // SUARA LANTANG RAKYAT',
                },
              },
            ],
          },
        },
      ],
    },
  };
}
