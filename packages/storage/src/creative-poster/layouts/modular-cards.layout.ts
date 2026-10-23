import { SynthesizedEditorialCopy } from '../types.js';
import {
  getAdaptiveFontSize,
  wordSafeHeadlineTruncate,
  smartSentenceClamp,
} from '../core/adaptive-typography.js';

export interface ModularCardsLayoutParams {
  width: number;
  height: number;
  headline: string;
  quote?: string;
  copy: SynthesizedEditorialCopy;
  memberName: string;
  memberTitle: string;
  editionTag: string;
  primaryAccent: string;
  croppedThumbnails?: Record<string, string>;
}

/**
 * Layout 3: MODULAR_GRID_CARDS (Inspirasi: 5 Modern Font Pairings & Structured Infographic Cards)
 * Memiliki Hero Visual Window terbuka di tengah atas agar ilustrasi AI terlihat megah,
 * dengan 5 kartu aksi dan footer terkelompok rapi di paruh bawah kanvas.
 */
export function buildModularCardsLayout(params: ModularCardsLayoutParams): any {
  const { width, height, headline, copy, memberName, memberTitle, editionTag, primaryAccent, croppedThumbnails = {} } = params;

  const rawTitle = copy.mainBannerTitle || headline || '5 POKOK REKOMENDASI';
  const displayTitle = wordSafeHeadlineTruncate(rawTitle, 32).toUpperCase();
  const titleFontSize = getAdaptiveFontSize(displayTitle, 56, 38, 18);

  const rawSubheader = copy.mainBannerSubheader || 'Kerangka Kerja Strategis Percepatan Solusi dan Advokasi Parlemen';
  const displaySubheader = smartSentenceClamp(rawSubheader, 75);

  const fallbackCards = [
    { number: '01', title: 'Audit Kebijakan', summary: 'Analisis menyeluruh terhadap tata kelola dan dampak lingkungan di lapangan.' },
    { number: '02', title: 'Respons Cepat', summary: 'Pengerahan tim terpadu untuk penanganan darurat tanpa hambatan birokrasi.' },
    { number: '03', title: 'Bantuan Terpadu', summary: 'Distribusi logistik, pangan bergizi, dan posko kesehatan terpadu bagi warga.' },
    { number: '04', title: 'Pemulihan Warga', summary: 'Fasilitasi penerbitan ulang dokumen kependudukan yang hangus dan rusak.' },
    { number: '05', title: 'Regulasi Tegas', summary: 'Mendorong perda pengawasan dan standar proteksi keselamatan lingkungan terpadu.' },
  ];

  const sourceCards = copy.numberedItems && copy.numberedItems.length >= 5
    ? copy.numberedItems
    : fallbackCards;

  const cards = sourceCards.map((c, i) => ({
    number: c.number || `0${i + 1}`,
    title: wordSafeHeadlineTruncate(c.title || `Langkah 0${i + 1}`, 26),
    summary: smartSentenceClamp(c.summary || fallbackCards[i]?.summary || '', 95),
  }));

  return {
    type: 'div',
    props: {
      style: {
        width: `${width}px`,
        height: `${height}px`,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: '38px 46px',
        boxSizing: 'border-box',
        fontFamily: 'Plus Jakarta Sans',
        position: 'relative',
      },
      children: [
        // 1. TOP HEADLINE CARD (Header & Judul Adaptif)
        {
          type: 'div',
          props: {
            style: {
              display: 'flex',
              flexDirection: 'column',
              backgroundColor: 'rgba(255, 255, 255, 0.96)',
              border: '1.5px solid #CBD5E1',
              borderRadius: '8px',
              padding: '16px 22px',
              boxShadow: '0 4px 14px rgba(0, 0, 0, 0.08)',
            },
            children: [
              {
                type: 'span',
                props: {
                  style: { fontSize: '11px', fontWeight: 700, color: primaryAccent || '#2563EB', letterSpacing: '0.08em', marginBottom: '4px' },
                  children: (editionTag || 'EDISI STRATEGIS').toUpperCase(),
                },
              },
              {
                type: 'span',
                props: {
                  style: { fontFamily: 'Anton', fontSize: `${titleFontSize}px`, lineHeight: 0.95, color: '#0F172A', letterSpacing: '0.02em' },
                  children: displayTitle,
                },
              },
              {
                type: 'span',
                props: {
                  style: { fontSize: '12.5px', color: '#475569', marginTop: '6px', lineHeight: 1.35 },
                  children: displaySubheader,
                },
              },
            ],
          },
        },

        // 2. HERO IMAGE WINDOW (~260px - 280px Open Canvas Space)
        // Dibiarkan terbuka tanpa kotak mengambang agar karya seni/fotografi Layer 1 terlihat megah
        {
          type: 'div',
          props: {
            style: {
              flex: 1,
              minHeight: '220px',
            },
          },
        },

        // 3. BOTTOM CARDS & FOOTER CLUSTER (Dikelompokkan rapat dengan gap 12px)
        {
          type: 'div',
          props: {
            style: {
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
            },
            children: [
              // 2x2 Grid (Cards 01 & 02, Cards 03 & 04)
              {
                type: 'div',
                props: {
                  style: {
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '10px',
                  },
                  children: [
                    // Row 1 (Cards 01 & 02)
                    {
                      type: 'div',
                      props: {
                        style: { display: 'flex', flexDirection: 'row', gap: '12px' },
                        children: cards.slice(0, 2).map((c, idx) => ({
                          type: 'div',
                          props: {
                            style: {
                              flex: 1,
                              backgroundColor: 'rgba(255, 255, 255, 0.96)',
                              border: '1.5px solid #CBD5E1',
                              borderRadius: '8px',
                              padding: '12px 14px',
                              display: 'flex',
                              flexDirection: 'row',
                              gap: '12px',
                              alignItems: 'center',
                              boxShadow: '0 4px 10px rgba(0, 0, 0, 0.05)',
                            },
                            children: [
                              ...(croppedThumbnails[`card${idx + 1}`]
                                ? [
                                    {
                                      type: 'img',
                                      props: {
                                        src: croppedThumbnails[`card${idx + 1}`],
                                        style: { width: '72px', height: '72px', objectFit: 'cover', borderRadius: '4px' },
                                      },
                                    },
                                  ]
                                : []),
                              {
                                type: 'div',
                                props: {
                                  style: { display: 'flex', flexDirection: 'column', flex: 1 },
                                  children: [
                                    { type: 'span', props: { style: { fontFamily: 'Anton', fontSize: '22px', color: primaryAccent || '#2563EB', lineHeight: 1 }, children: c.number } },
                                    { type: 'span', props: { style: { fontWeight: 700, fontSize: '12.5px', color: '#0F172A', margin: '2px 0' }, children: c.title } },
                                    { type: 'span', props: { style: { fontSize: '10px', color: '#475569', lineHeight: 1.35 }, children: c.summary } },
                                  ],
                                },
                              },
                            ],
                          },
                        })),
                      },
                    },

                    // Row 2 (Cards 03 & 04)
                    {
                      type: 'div',
                      props: {
                        style: { display: 'flex', flexDirection: 'row', gap: '12px' },
                        children: cards.slice(2, 4).map((c, idx) => ({
                          type: 'div',
                          props: {
                            style: {
                              flex: 1,
                              backgroundColor: 'rgba(255, 255, 255, 0.96)',
                              border: '1.5px solid #CBD5E1',
                              borderRadius: '8px',
                              padding: '12px 14px',
                              display: 'flex',
                              flexDirection: 'row',
                              gap: '12px',
                              alignItems: 'center',
                              boxShadow: '0 4px 10px rgba(0, 0, 0, 0.05)',
                            },
                            children: [
                              ...(croppedThumbnails[`card${idx + 3}`]
                                ? [
                                    {
                                      type: 'img',
                                      props: {
                                        src: croppedThumbnails[`card${idx + 3}`],
                                        style: { width: '72px', height: '72px', objectFit: 'cover', borderRadius: '4px' },
                                      },
                                    },
                                  ]
                                : []),
                              {
                                type: 'div',
                                props: {
                                  style: { display: 'flex', flexDirection: 'column', flex: 1 },
                                  children: [
                                    { type: 'span', props: { style: { fontFamily: 'Anton', fontSize: '22px', color: primaryAccent || '#2563EB', lineHeight: 1 }, children: c.number } },
                                    { type: 'span', props: { style: { fontWeight: 700, fontSize: '12.5px', color: '#0F172A', margin: '2px 0' }, children: c.title } },
                                    { type: 'span', props: { style: { fontSize: '10px', color: '#475569', lineHeight: 1.35 }, children: c.summary } },
                                  ],
                                },
                              },
                            ],
                          },
                        })),
                      },
                    },
                  ],
                },
              },

              // Card 05 (Wide Accent Card)
              {
                type: 'div',
                props: {
                  style: {
                    backgroundColor: '#0F172A',
                    color: '#FFFFFF',
                    borderRadius: '8px',
                    border: '1.5px solid #1E293B',
                    padding: '14px 20px',
                    display: 'flex',
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: '16px',
                    boxShadow: '0 6px 16px rgba(0, 0, 0, 0.16)',
                  },
                  children: [
                    { type: 'span', props: { style: { fontFamily: 'Anton', fontSize: '32px', color: primaryAccent || '#38BDF8', lineHeight: 1 }, children: cards[4]?.number || '05' } },
                    {
                      type: 'div',
                      props: {
                        style: { display: 'flex', flexDirection: 'column', flex: 1 },
                        children: [
                          { type: 'span', props: { style: { fontWeight: 700, fontSize: '14px', color: '#FFFFFF', marginBottom: '2px' }, children: cards[4]?.title || 'Regulasi Tegas' } },
                          { type: 'span', props: { style: { fontSize: '11px', color: '#94A3B8', lineHeight: 1.35 }, children: cards[4]?.summary || '' } },
                        ],
                      },
                    },
                  ],
                },
              },

              // Member Footer Signature
              {
                type: 'div',
                props: {
                  style: {
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    backgroundColor: 'rgba(255, 255, 255, 0.96)',
                    border: '1.5px solid #CBD5E1',
                    borderRadius: '8px',
                    padding: '10px 18px',
                    boxShadow: '0 4px 10px rgba(0, 0, 0, 0.05)',
                  },
                  children: [
                    {
                      type: 'div',
                      props: {
                        style: { display: 'flex', flexDirection: 'column' },
                        children: [
                          { type: 'span', props: { style: { fontFamily: 'Anton', fontSize: '17px', color: '#0F172A' }, children: memberName.slice(0, 35).toUpperCase() } },
                          { type: 'span', props: { style: { fontSize: '10.5px', color: '#64748B' }, children: memberTitle.slice(0, 45).toUpperCase() } },
                        ],
                      },
                    },
                    { type: 'span', props: { style: { fontSize: '10.5px', fontWeight: 700, color: primaryAccent || '#2563EB' }, children: 'POLARIS EXECUTIVE FRAMEWORK' } },
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
