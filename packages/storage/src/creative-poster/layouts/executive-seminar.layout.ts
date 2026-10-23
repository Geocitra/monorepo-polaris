import { SynthesizedEditorialCopy, CompositionPlan, ResolvedColorTokens } from '../types.js';
import { getAdaptiveFontSize, wordSafeHeadlineTruncate, smartSentenceClamp, getProtectiveCardStyle } from '../core/adaptive-typography.js';

export interface ExecutiveSeminarLayoutParams {
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
 * Layout Khusus EXECUTIVE_SEMINAR:
 * Terinspirasi dari "download (3) / Seminar Nasional & Executive Symposium"
 * Ciri khas:
 * - Warna prestisius: Midnight Navy (#0F172A) & Burnished Gold (#D97706)
 * - Struktur grid simposium formal: Header Konferensi, Agenda Strategis, Panel Ahli
 * - Kartu pelindung berkelas diplomatik dengan kontras tinggi
 */
export function buildExecutiveSeminarLayout(params: ExecutiveSeminarLayoutParams): any {
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

  const gold = resolvedColors?.primaryAccent || primaryAccent || '#D97706';
  const navy = resolvedColors?.isDark !== false ? '#0F172A' : '#1E293B';
  const rawTitle = copy.mainBannerTitle || headline || 'SIMPOSIUM KEBIJAKAN NASIONAL';
  const displayTitle = rawTitle.toUpperCase();
  const displaySubheader = copy.mainBannerSubheader || 'FORUM DIALOG STRATEGIS & KONSULTASI PUBLIK 2026';
  const displayQuote = quote || copy.mainBannerDefinitionBody || 'Pertukaran gagasan ilmiah dan serapan aspirasi rakyat adalah fondasi kokoh lahirnya legislasi yang adil.';

  const blocks = copy.blocks || {};
  const topic1 = blocks['topic_1'] || { header: 'TRANSFORMASI EKONOMI', body: 'Strategi ketahanan fiskal daerah dan penguatan industri rakyat.' };
  const topic2 = blocks['topic_2'] || { header: 'TATA KELOLA PUBLIK', body: 'Digitalisasi layanan publik dan transparansi penganggaran daerah.' };

  const titleFontSize = getAdaptiveFontSize(displayTitle, 80, 48, 18);

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
        // 1. TOP DIPLOMATIC EMBLEM & SYMPOSIUM HEADER
        // ===================================================================
        {
          type: 'div',
          props: {
            style: {
              ...getProtectiveCardStyle({
                bgColor: 'rgba(15, 23, 42, 0.94)',
                borderColor: 'rgba(217, 119, 6, 0.4)',
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
                          fontSize: '18px',
                          color: '#FFFFFF',
                          letterSpacing: '0.06em',
                        },
                        children: 'FORUM LEGISLASI // SIMPOSIUM NASIONAL',
                      },
                    },
                  ],
                },
              },
              {
                type: 'span',
                props: {
                  style: {
                    backgroundColor: gold,
                    color: '#000000',
                    fontFamily: 'Anton',
                    fontSize: '12px',
                    padding: '3px 10px',
                    borderRadius: '2px',
                    letterSpacing: '0.06em',
                  },
                  children: editionTag.toUpperCase(),
                },
              },
            ],
          },
        },

        // ===================================================================
        // 2. CENTER SYMPOSIUM AGENDA & KEYNOTE MATRIX
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
              // Main Symposium Title Card
              {
                type: 'div',
                props: {
                  style: {
                    ...getProtectiveCardStyle({
                      bgColor: 'rgba(15, 23, 42, 0.92)',
                      borderColor: 'rgba(217, 119, 6, 0.5)',
                      padding: '24px 28px',
                    }),
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '10px',
                    borderLeft: `6px solid ${gold}`,
                  },
                  children: [
                    {
                      type: 'span',
                      props: {
                        style: {
                          fontSize: '12px',
                          fontWeight: 700,
                          color: gold,
                          letterSpacing: '0.08em',
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

              // Dual Policy Tracks (Seminar Matrix)
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
                                fontFamily: 'Anton',
                                fontSize: '16px',
                                color: gold,
                                letterSpacing: '0.04em',
                              },
                              children: wordSafeHeadlineTruncate(topic1.header, 26).toUpperCase(),
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
                              children: smartSentenceClamp(topic1.body, 110),
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
                                fontFamily: 'Anton',
                                fontSize: '16px',
                                color: '#FFFFFF',
                                letterSpacing: '0.04em',
                              },
                              children: wordSafeHeadlineTruncate(topic2.header, 26).toUpperCase(),
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
                              children: smartSentenceClamp(topic2.body, 110),
                            },
                          },
                        ],
                      },
                    },
                  ],
                },
              },

              // Keynote Quote Card
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
                          fontFamily: 'Anton',
                          fontSize: '28px',
                          color: gold,
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
        // 3. BOTTOM KEYNOTE SPEAKER & CONVENER FOOTER
        // ===================================================================
        {
          type: 'div',
          props: {
            style: {
              ...getProtectiveCardStyle({
                bgColor: 'rgba(15, 23, 42, 0.96)',
                borderColor: 'rgba(217, 119, 6, 0.3)',
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
                          color: gold,
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
                  children: 'INISIATIF KEBIJAKAN STRATEGIS // DPR RI',
                },
              },
            ],
          },
        },
      ],
    },
  };
}
