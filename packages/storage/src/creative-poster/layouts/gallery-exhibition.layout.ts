import { SynthesizedEditorialCopy, CompositionPlan, ResolvedColorTokens } from '../types.js';
import { getAdaptiveFontSize, wordSafeHeadlineTruncate, smartSentenceClamp, getProtectiveCardStyle } from '../core/adaptive-typography.js';

export interface GalleryExhibitionLayoutParams {
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
  croppedThumbnails?: Record<string, string>;
  compositionPlan?: CompositionPlan;
  resolvedColors?: ResolvedColorTokens;
}

/**
 * Layout Khusus GALLERY_EXHIBITION:
 * Terinspirasi dari "download (5) / Chasing Portraits & Museum Exhibition Catalog"
 * Ciri khas:
 * - Estetika katalog museum/galeri seni yang berwibawa dan berkelas tinggi
 * - Tipografi Serif anggun dipadukan plakat museum (Caption Plaques)
 * - Kartu pelindung kontras museum grey & bone white
 */
export function buildGalleryExhibitionLayout(params: GalleryExhibitionLayoutParams): any {
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
    croppedThumbnails = {},
    compositionPlan,
    resolvedColors,
  } = params;

  const accentColor = resolvedColors?.primaryAccent || primaryAccent || '#CA8A04';
  const rawTitle = copy.mainBannerTitle || headline || 'REKAM JEJAK ADVOKASI';
  const displayTitle = rawTitle.toUpperCase();
  const displaySubheader = copy.mainBannerSubheader || 'DOKUMENTASI KERJA STRATEGIS & ASPIRASI KONSTITUEN';
  const displayQuote = quote || copy.mainBannerDefinitionBody || 'Setiap potret perjuangan warga adalah pengingat bahwa kekuasaan parlemen ada semata-mata untuk melayani.';

  const blocks = copy.blocks || {};
  const exhibit1 = blocks['exhibit_1'] || { header: 'DOKUMEN 01: ASPIRASI', body: 'Menyusuri wilayah konstituen untuk mencatat langsung keluhan riil.' };
  const exhibit2 = blocks['exhibit_2'] || { header: 'DOKUMEN 02: SOLUSI', body: 'Pengawalan alokasi anggaran hingga pembangunan selesai diresmikan.' };

  const titleFontSize = getAdaptiveFontSize(displayTitle, 78, 48, 20);

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
        padding: '40px 48px',
        fontFamily: 'Plus Jakarta Sans',
      },
      children: [
        // ===================================================================
        // 1. TOP MUSEUM CATALOG MASTHEAD
        // ===================================================================
        {
          type: 'div',
          props: {
            style: {
              ...getProtectiveCardStyle({
                bgColor: 'rgba(15, 23, 42, 0.94)',
                borderColor: 'rgba(255, 255, 255, 0.16)',
                padding: '12px 22px',
              }),
              display: 'flex',
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
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
                          fontFamily: 'DejaVu Serif',
                          fontSize: '17px',
                          fontWeight: 700,
                          color: '#FFFFFF',
                          letterSpacing: '0.04em',
                        },
                        children: 'POLARIS ARCHIVE // MONOGRAPH',
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
                    color: accentColor,
                    letterSpacing: '0.08em',
                  },
                  children: editionTag.toUpperCase(),
                },
              },
            ],
          },
        },

        // ===================================================================
        // 2. CENTER EXHIBITION CATALOG & CURATORIAL PLAQUES
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
              // Main Exhibition Headline Box
              {
                type: 'div',
                props: {
                  style: {
                    ...getProtectiveCardStyle({
                      bgColor: 'rgba(15, 23, 42, 0.92)',
                      borderColor: 'rgba(202, 138, 4, 0.4)',
                      padding: '24px 28px',
                    }),
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '10px',
                    borderLeft: `5px solid ${accentColor}`,
                  },
                  children: [
                    {
                      type: 'span',
                      props: {
                        style: {
                          fontSize: '11.5px',
                          fontWeight: 700,
                          color: accentColor,
                          letterSpacing: '0.1em',
                        },
                        children: displaySubheader.toUpperCase(),
                      },
                    },
                    {
                      type: 'span',
                      props: {
                        style: {
                          fontFamily: 'Anton',
                          fontSize: `${titleFontSize}px`,
                          color: '#FFFFFF',
                          lineHeight: 0.94,
                          letterSpacing: '0.02em',
                        },
                        children: displayTitle,
                      },
                    },
                  ],
                },
              },

              // Dual Curatorial Plaques
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
                          ...getProtectiveCardStyle({
                            bgColor: 'rgba(30, 41, 59, 0.94)',
                            borderColor: 'rgba(255, 255, 255, 0.14)',
                            padding: '16px 20px',
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
                                fontFamily: 'DejaVu Serif',
                                fontSize: '15px',
                                fontWeight: 700,
                                color: accentColor,
                              },
                              children: wordSafeHeadlineTruncate(exhibit1.header, 26).toUpperCase(),
                            },
                          },
                          {
                            type: 'span',
                            props: {
                              style: {
                                fontSize: '11.5px',
                                color: '#CBD5E1',
                                lineHeight: 1.38,
                              },
                              children: smartSentenceClamp(exhibit1.body, 110),
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
                          ...getProtectiveCardStyle({
                            bgColor: 'rgba(30, 41, 59, 0.94)',
                            borderColor: 'rgba(255, 255, 255, 0.14)',
                            padding: '16px 20px',
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
                                fontFamily: 'DejaVu Serif',
                                fontSize: '15px',
                                fontWeight: 700,
                                color: '#FFFFFF',
                              },
                              children: wordSafeHeadlineTruncate(exhibit2.header, 26).toUpperCase(),
                            },
                          },
                          {
                            type: 'span',
                            props: {
                              style: {
                                fontSize: '11.5px',
                                color: '#CBD5E1',
                                lineHeight: 1.38,
                              },
                              children: smartSentenceClamp(exhibit2.body, 110),
                            },
                          },
                        ],
                      },
                    },
                  ],
                },
              },

              // Curatorial Statement Card
              {
                type: 'div',
                props: {
                  style: {
                    ...getProtectiveCardStyle({
                      bgColor: 'rgba(15, 23, 42, 0.88)',
                      borderColor: 'rgba(255, 255, 255, 0.12)',
                      padding: '12px 20px',
                    }),
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                  },
                  children: [
                    {
                      type: 'span',
                      props: {
                        style: {
                          fontFamily: 'DejaVu Serif',
                          fontSize: '28px',
                          color: accentColor,
                          lineHeight: 0.8,
                        },
                        children: '“',
                      },
                    },
                    {
                      type: 'span',
                      props: {
                        style: {
                          fontSize: '12px',
                          fontStyle: 'italic',
                          color: '#E2E8F0',
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
        // 3. BOTTOM CURATORIAL MONOGRAPH FOOTER
        // ===================================================================
        {
          type: 'div',
          props: {
            style: {
              ...getProtectiveCardStyle({
                bgColor: 'rgba(15, 23, 42, 0.96)',
                borderColor: 'rgba(255, 255, 255, 0.18)',
                padding: '14px 22px',
              }),
              display: 'flex',
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
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
                          fontFamily: 'DejaVu Serif',
                          fontSize: '19px',
                          fontWeight: 700,
                          color: '#FFFFFF',
                          letterSpacing: '0.02em',
                        },
                        children: memberName.toUpperCase(),
                      },
                    },
                    {
                      type: 'span',
                      props: {
                        style: {
                          fontSize: '11px',
                          color: accentColor,
                          fontWeight: 600,
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
                    fontSize: '11px',
                    fontWeight: 700,
                    color: '#94A3B8',
                    letterSpacing: '0.06em',
                  },
                  children: 'CATALOGUE RAISONNÉ // REKAM KINERJA',
                },
              },
            ],
          },
        },
      ],
    },
  };
}
