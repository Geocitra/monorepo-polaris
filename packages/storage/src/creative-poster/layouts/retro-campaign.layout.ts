import { SynthesizedEditorialCopy } from '../types.js';
import { getAdaptiveFontSize, smartTruncate } from '../core/adaptive-typography.js';

export interface RetroCampaignLayoutParams {
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
 * Layout Khusus RETRO_CAMPAIGN:
 * Terinspirasi dari "Poster Acara / Vintage Public Information Campaign 70s-80s"
 * Menggunakan border ganda retro, header pita vintage, 2 kartu ringkasan isu & solusi,
 * dan stempel pengesahan parlemen di bagian bawah dengan warna senada.
 */
export function buildRetroCampaignLayout(params: RetroCampaignLayoutParams): any {
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

  const rawTitle = copy.mainBannerTitle || headline || 'KAMPANYE KEBIJAKAN';
  const displayTitle = rawTitle.toUpperCase();
  const displaySubheader = copy.mainBannerSubheader || 'GERAKAN SOSIAL & ADVOKASI WARGA';
  const displayQuote = quote || copy.mainBannerDefinitionBody || 'Bersama membangun lingkungan dan pelayanan publik yang aman, tertib, dan berkelanjutan.';

  const secAccent = secondaryAccent || copy.secondaryAccent || '#F59E0B';
  const cardBg = copy.cardBackground || 'rgba(255, 251, 235, 0.94)';
  const cardBrd = copy.cardBorder || primaryAccent;

  const titleFontSize = getAdaptiveFontSize(displayTitle, 88, 52, 22);

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
        // 1. TOP RETRO BANNER (Vintage Pill Ribbon)
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
              // Ribbon bar
              {
                type: 'div',
                props: {
                  style: {
                    display: 'flex',
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    backgroundColor: '#FEF08A',
                    border: '2px solid #18181B',
                    padding: '8px 18px',
                    borderRadius: '6px',
                  },
                  children: [
                    {
                      type: 'div',
                      props: {
                        style: { display: 'flex', alignItems: 'center', gap: '8px' },
                        children: [
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
                                fontFamily: 'Anton',
                                fontSize: '15px',
                                color: '#18181B',
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
                          fontWeight: 800,
                          color: '#18181B',
                          letterSpacing: '0.05em',
                        },
                        children: 'SERI EDUKASI PUBLIK',
                      },
                    },
                  ],
                },
              },

              // Retro Headline Box
              {
                type: 'div',
                props: {
                  style: {
                    display: 'flex',
                    flexDirection: 'column',
                    backgroundColor: 'rgba(255, 255, 255, 0.94)',
                    border: `3px solid ${primaryAccent}`,
                    borderRadius: '8px',
                    padding: '16px 24px',
                    boxShadow: '4px 6px 0px rgba(0, 0, 0, 0.25)',
                  },
                  children: [
                    {
                      type: 'span',
                      props: {
                        style: {
                          fontSize: '12px',
                          fontWeight: 800,
                          color: primaryAccent,
                          letterSpacing: '0.08em',
                        },
                        children: smartTruncate(displaySubheader, 70).toUpperCase(),
                      },
                    },
                    {
                      type: 'div',
                      props: {
                        style: {
                          fontFamily: 'Anton',
                          fontSize: `${titleFontSize}px`,
                          color: '#18181B',
                          lineHeight: 1.02,
                          letterSpacing: '0.02em',
                        },
                        children: smartTruncate(displayTitle, 40),
                      },
                    },
                  ],
                },
              },
            ],
          },
        },

        // ===================================================================
        // 2. MIDDLE RETRO DUAL CARDS (Isu & Solusi)
        // ===================================================================
        {
          type: 'div',
          props: {
            style: {
              display: 'flex',
              flexDirection: 'row',
              gap: '16px',
            },
            children: [
              {
                type: 'div',
                props: {
                  style: {
                    flex: 1,
                    backgroundColor: 'rgba(255, 255, 255, 0.92)',
                    border: '2px solid #18181B',
                    borderRadius: '6px',
                    padding: '14px 18px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '6px',
                    boxShadow: '3px 4px 0px rgba(0, 0, 0, 0.2)',
                  },
                  children: [
                    {
                      type: 'span',
                      props: {
                        style: {
                          fontFamily: 'Anton',
                          fontSize: '14px',
                          color: primaryAccent,
                          letterSpacing: '0.06em',
                        },
                        children: 'FOKUS PERMASALAHAN',
                      },
                    },
                    {
                      type: 'span',
                      props: {
                        style: {
                          fontSize: '12px',
                          color: '#27272A',
                          lineHeight: 1.4,
                        },
                        children: smartTruncate(displayQuote, 130),
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
                    backgroundColor: 'rgba(255, 255, 255, 0.92)',
                    border: `2px solid ${primaryAccent}`,
                    borderRadius: '6px',
                    padding: '14px 18px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '6px',
                    boxShadow: '3px 4px 0px rgba(0, 0, 0, 0.2)',
                  },
                  children: [
                    {
                      type: 'span',
                      props: {
                        style: {
                          fontFamily: 'Anton',
                          fontSize: '14px',
                          color: '#18181B',
                          letterSpacing: '0.06em',
                        },
                        children: 'LANGKAH PARLEMEN',
                      },
                    },
                    {
                      type: 'span',
                      props: {
                        style: {
                          fontSize: '12px',
                          color: '#27272A',
                          lineHeight: 1.4,
                        },
                        children: 'Mendorong regulasi perlindungan hak warga dan pengawasan realisasi anggaran publik di lapangan.',
                      },
                    },
                  ],
                },
              },
            ],
          },
        },

        // ===================================================================
        // 3. BOTTOM VINTAGE STAMP FOOTER
        // ===================================================================
        {
          type: 'div',
          props: {
            style: {
              display: 'flex',
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              backgroundColor: '#18181B',
              border: `2px solid ${primaryAccent}`,
              borderRadius: '6px',
              padding: '14px 22px',
              boxShadow: '4px 6px 0px rgba(0, 0, 0, 0.3)',
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
                          fontSize: '19px',
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
                          color: '#FEF08A',
                          fontWeight: 700,
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
                    color: '#A1A1AA',
                    letterSpacing: '0.06em',
                  },
                  children: 'POLARIS CAMPAIGN ARCHIVE // 2026',
                },
              },
            ],
          },
        },
      ],
    },
  };
}
