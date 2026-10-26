import { SynthesizedEditorialCopy, CompositionPlan, ResolvedColorTokens } from '../types.js';
import { getAdaptiveFontSize, wordSafeHeadlineTruncate, smartSentenceClamp } from '../core/adaptive-typography.js';

export interface ThresholdRisographLayoutParams {
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
 * Layout Khusus THRESHOLD_RISOGRAPH:
 * Terinspirasi dari "Design poster (treshold) / Oke Gas / Street Action"
 * Ciri khas:
 * - Warna kontras ekstrem: Caution Yellow (#FACC15), Heavy Black (#09090B), Bold Red
 * - Stensil sudut tajam, badge peringatan dinamis, tipografi industrial
 * - 100% perlindungan kontras melalui kartu pelindung solid bertekstur
 */
export function buildThresholdRisographLayout(params: ThresholdRisographLayoutParams): any {
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
  const rawTitle = copy.mainBannerTitle || headline || 'AKSI KONKRET PARLEMEN';
  const displayTitle = rawTitle.toUpperCase();
  const displaySubheader = copy.mainBannerSubheader || 'GERAK CEPAT // ADVOKASI MASYARAKAT';
  const displayQuote = quote || copy.mainBannerDefinitionBody || 'Tidak ada waktu untuk berdiam diri. Kebijakan harus bergerak cepat menjawab persoalan rakyat.';

  const blocks = copy.blocks || {};
  const blockA = blocks['action_1'] || { header: 'TARGET CEPAT', body: 'Penyaluran bantuan sosial dan penanganan infrastruktur mendesak.' };
  const blockB = blocks['action_2'] || { header: 'PENGAWASAN', body: 'Audit lapangan langsung untuk memastikan dana desa tepat sasaran.' };

  const titleFontSize = getAdaptiveFontSize(displayTitle, 88, 54, 16);

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
        padding: '36px 42px',
        fontFamily: 'Plus Jakarta Sans',
      },
      children: [
        // ===================================================================
        // 1. TOP INDUSTRIAL BANNER & STENCIL HEADER
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
                              children: 'POLARIS // RISOGRAPH SERIES',
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

              // Hazard Subtitle Tag
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
        // 2. CENTERPIECE MASSIVE STENCIL HEADLINE & IMPACT BLOCKS
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
              // Stencil Title Box
              {
                type: 'div',
                props: {
                  style: {
                    backgroundColor: black,
                    borderLeft: `8px solid ${yellow}`,
                    padding: '18px 24px',
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

              // Dual Action Cards
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
                          backgroundColor: 'rgba(250, 204, 21, 0.95)',
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
                              children: wordSafeHeadlineTruncate(blockA.header, 26).toUpperCase(),
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
                              children: smartSentenceClamp(blockA.body, 110),
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
                              children: wordSafeHeadlineTruncate(blockB.header, 26).toUpperCase(),
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
                              children: smartSentenceClamp(blockB.body, 110),
                            },
                          },
                        ],
                      },
                    },
                  ],
                },
              },

              // Quote Box
              {
                type: 'div',
                props: {
                  style: {
                    backgroundColor: 'rgba(9, 9, 11, 0.92)',
                    border: '1.5px solid rgba(255, 255, 255, 0.2)',
                    padding: '12px 18px',
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
                          fontSize: '12px',
                          fontStyle: 'italic',
                          color: '#F4F4F5',
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
        // 3. BOTTOM INDUSTRIAL FOOTER
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
                  children: 'KERJA CEPAT • BUKTI TERUKUR',
                },
              },
            ],
          },
        },
      ],
    },
  };
}
