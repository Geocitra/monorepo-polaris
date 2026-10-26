import { SynthesizedEditorialCopy, CompositionPlan, ResolvedColorTokens } from '../types.js';
import {
  getAdaptiveFontSize,
  wordSafeHeadlineTruncate,
  smartSentenceClamp,
} from '../core/adaptive-typography.js';

export interface StreetJournalismLayoutParams {
  width: number;
  height: number;
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
 * Membangun pohon elemen Flexbox/Grid (Satori VNode) yang mereplikasi struktur POSTER PKL
 * dengan dukungan tata letak dinamis (TOP_BANNER, BOTTOM_ANCHOR, dsb.) dan palet warna senada.
 */
export function buildStreetJournalismLayout(params: StreetJournalismLayoutParams): any {
  const {
    width,
    height,
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

  const leftPos = copy.blocks['left_positive'] || { header: 'DAMPAK BURUK', body: '' };
  const leftNeg = copy.blocks['left_negative_box'] || { header: 'MANFAAT PENGELOLAAN', body: '' };
  const centerStory = copy.blocks['center_giant_title'] || { header: 'SOLUSI KONKRET', body: '' };
  const rightCause = copy.blocks['right_cause'] || { header: 'AKSI BERSAMA', body: '' };

  const rawBannerTitle = copy.mainBannerTitle || 'POLARIS';
  const bannerTitle = wordSafeHeadlineTruncate(rawBannerTitle, 30).toUpperCase();
  const bannerTitleFontSize = getAdaptiveFontSize(bannerTitle, 108, 58, 16);
  const giantWords = (centerStory.header || 'SOLUSI KONKRET').trim().split(/\s+/);
  const giantWordFontSize = giantWords.some((w: string) => w.length > 7) ? 68 : 88;
  const accentPrimary = resolvedColors?.primaryAccent || primaryAccent;
  const accentSecondary = resolvedColors?.secondaryAccent || secondaryAccent || copy.secondaryAccent || primaryAccent;


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
        fontFamily: 'Plus Jakarta Sans',
      },
      children: [
        // ===================================================================
        // 1. TOP HEADER BAR (Logo + Identitas Komisi/Kelompok)
        // ===================================================================
        {
          type: 'div',
          props: {
            style: {
              display: 'flex',
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              margin: '28px 48px 0 48px',
              paddingBottom: '10px',
              borderBottom: '2px solid #18181B',
            },
            children: [
              {
                type: 'div',
                props: {
                  style: { display: 'flex', alignItems: 'center', gap: '12px' },
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
                          color: primaryAccent,
                          letterSpacing: '0.06em',
                        },
                        children: `${editionTag} — ${memberName.toUpperCase()}`,
                      },
                    },
                  ],
                },
              },
              {
                type: 'span',
                props: {
                  style: {
                    fontSize: '12px',
                    fontWeight: 700,
                    color: '#27272A',
                    letterSpacing: '0.05em',
                  },
                  children: (memberTitle || 'PUBLIKASI EDUKASI PARLEMEN').toUpperCase(),
                },
              },
            ],
          },
        },

        // ===================================================================
        // 2. UPPER 3-COLUMN EDITORIAL GRID (Persis Struktur Poster PKL)
        // ===================================================================
        {
          type: 'div',
          props: {
            style: {
              display: 'flex',
              flexDirection: 'row',
              padding: '16px 48px',
              gap: '24px',
              flex: 1,
            },
            children: [
              // --- KOLOM KIRI (Dampak Buruk + Kotak Merah Manfaat) ---
              {
                type: 'div',
                props: {
                  style: {
                    width: '340px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '14px',
                  },
                  children: [
                    {
                      type: 'div',
                      props: {
                        style: {
                          fontSize: '12px',
                          fontWeight: 700,
                          color: '#18181B',
                          borderBottom: '1.5px solid #18181B',
                          paddingBottom: '6px',
                        },
                        children: 'TINJAUAN DAMPAK DAPAT DIAMATI DARI DUA SISI, YAKNI:',
                      },
                    },
                    // Blok 1: Dampak Buruk (Teks Merah di Atas Kertas Krem)
                    {
                      type: 'div',
                      props: {
                        style: {
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '6px',
                          backgroundColor: 'rgba(247, 245, 240, 0.95)',
                          padding: '12px 14px',
                          borderRadius: '6px',
                          border: '1px solid rgba(24, 24, 27, 0.15)',
                        },
                        children: [
                          {
                            type: 'div',
                            props: {
                              style: {
                                fontFamily: 'Anton',
                                fontSize: '36px',
                                color: primaryAccent,
                                lineHeight: 1.05,
                              },
                              children: leftPos.header.toUpperCase(),
                            },
                          },
                          {
                            type: 'div',
                            props: {
                              style: {
                                fontSize: '12.5px',
                                color: '#18181B',
                                lineHeight: 1.38,
                                textAlign: 'justify',
                              },
                              children: smartSentenceClamp(leftPos.body, 140).toUpperCase(),
                            },
                          },
                        ],
                      },
                    },
                    // Blok 2: Kotak Solid Merah (Manfaat Pengelolaan)
                    {
                      type: 'div',
                      props: {
                        style: {
                          display: 'flex',
                          flexDirection: 'column',
                          backgroundColor: primaryAccent,
                          padding: '16px 18px',
                          borderRadius: '6px',
                          gap: '8px',
                          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                        },
                        children: [
                          {
                            type: 'div',
                            props: {
                              style: {
                                fontFamily: 'Anton',
                                fontSize: '32px',
                                color: '#FFFFFF',
                                lineHeight: 1.05,
                              },
                              children: leftNeg.header.toUpperCase(),
                            },
                          },
                          {
                            type: 'div',
                            props: {
                              style: {
                                fontSize: '12px',
                                color: '#FFFFFF',
                                lineHeight: 1.38,
                                textAlign: 'justify',
                                paddingRight: '15px',
                              },
                              children: smartSentenceClamp(leftNeg.body, 140).toUpperCase(),
                            },
                          },
                        ],
                      },
                    },
                  ],
                },
              },

              // --- KOLOM TENGAH (Judul Raksasa Bersusun "SOLUSI KONKRET" + Paragraf) ---
              {
                type: 'div',
                props: {
                  style: {
                    width: '235px',
                    display: 'flex',
                    flexDirection: 'column',
                    backgroundColor: 'rgba(247, 245, 240, 0.95)',
                    border: '1.5px solid #27272A',
                    borderRadius: '6px',
                    padding: '16px 18px',
                    gap: '14px',
                    flex: 1,
                    minHeight: '0px',
                    boxShadow: '0 4px 14px rgba(0, 0, 0, 0.12)',
                  },
                  children: [
                    {
                      type: 'div',
                      props: {
                        style: {
                          display: 'flex',
                          flexDirection: 'column',
                          fontFamily: 'Bebas Neue',
                          fontSize: `${giantWordFontSize}px`,
                          color: primaryAccent,
                          lineHeight: 0.88,
                          letterSpacing: '0.02em',
                          borderBottom: '1.5px solid #27272A',
                          paddingBottom: '12px',
                        },
                        children: giantWords.map((word: string) => ({
                          type: 'span',
                          props: { children: word.toUpperCase() },
                        })),
                      },
                    },
                    {
                      type: 'div',
                      props: {
                        style: {
                          fontSize: '12.5px',
                          color: '#18181B',
                          lineHeight: 1.4,
                          textAlign: 'justify',
                        },
                        children: smartSentenceClamp(centerStory.body, 140).toUpperCase(),
                      },
                    },
                  ],
                },
              },

              // --- KOLOM KANAN (Ruang Kosong di Atas untuk Cutout + Teks di Tengah) ---
              {
                type: 'div',
                props: {
                  style: {
                    flex: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    paddingTop: '250px',
                    gap: '8px',
                  },
                  children: [
                    {
                      type: 'div',
                      props: {
                        style: {
                          display: 'flex',
                          flexDirection: 'column',
                          backgroundColor: 'rgba(247, 245, 240, 0.95)',
                          border: '1.5px solid #27272A',
                          borderRadius: '6px',
                          padding: '16px 18px',
                          gap: '8px',
                          boxShadow: '0 4px 14px rgba(0, 0, 0, 0.12)',
                        },
                        children: [
                          {
                            type: 'div',
                            props: {
                              style: {
                                fontFamily: 'Anton',
                                fontSize: '40px',
                                color: primaryAccent,
                                lineHeight: 1.05,
                              },
                              children: rightCause.header.toUpperCase(),
                            },
                          },
                          {
                            type: 'div',
                            props: {
                              style: {
                                fontSize: '12.5px',
                                color: '#18181B',
                                lineHeight: 1.38,
                                textAlign: 'justify',
                              },
                              children: smartSentenceClamp(rightCause.body, 140).toUpperCase(),
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
        },

        // ===================================================================
        // 3. BOTTOM BLACK BANNER (Judul Raksasa Putih + Definisi + Atribusi)
        // ===================================================================
        {
          type: 'div',
          props: {
            style: {
              width: `${width}px`,
              height: `${Math.round(height * 0.25)}px`,
              backgroundColor: '#0A0A0A',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              padding: '24px 52px',
              gap: '8px',
            },
            children: [
              {
                type: 'div',
                props: {
                  style: {
                    fontSize: '15px',
                    color: '#E4E4E7',
                    letterSpacing: '0.04em',
                  },
                  children: smartSentenceClamp(copy.mainBannerSubheader || '', 75),
                },
              },
              {
                type: 'div',
                props: {
                  style: {
                    fontFamily: 'Bebas Neue',
                    fontSize: `${bannerTitleFontSize}px`,
                    color: '#FFFFFF',
                    lineHeight: 0.92,
                    letterSpacing: '0.02em',
                  },
                  children: bannerTitle,
                },
              },
              {
                type: 'div',
                props: {
                  style: {
                    fontSize: '13px',
                    color: '#F4F4F5',
                    lineHeight: 1.38,
                    textAlign: 'justify',
                    marginTop: '4px',
                  },
                  children: smartSentenceClamp(copy.mainBannerDefinitionBody || '', 220).toUpperCase(),
                },
              },
              {
                type: 'div',
                props: {
                  style: {
                    fontSize: '11px',
                    color: '#A1A1AA',
                    marginTop: '6px',
                  },
                  children: `POLARIS GOV • Advokasi Kebijakan Publik & Lingkungan | Diinisiasi oleh: ${memberName} (${memberTitle || 'Parlemen'})`,
                },
              },
            ],
          },
        },
      ],
    },
  };
}
