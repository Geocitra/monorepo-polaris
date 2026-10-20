import { SynthesizedEditorialCopy } from '../types.js';

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
 * Layout 3: MODULAR_GRID_CARDS (Inspirasi: 5 Modern Font Pairings)
 */
export function buildModularCardsLayout(params: ModularCardsLayoutParams): any {
  const { width, height, headline, copy, memberName, memberTitle, editionTag, primaryAccent, croppedThumbnails = {} } = params;

  const cards = copy.numberedItems && copy.numberedItems.length >= 5
    ? copy.numberedItems
    : [
        { number: '01', title: 'Audit Kebijakan', summary: 'Analisis menyeluruh terhadap tata kelola dan dampak lingkungan.' },
        { number: '02', title: 'Respons Cepat', summary: 'Pengerahan tim terpadu untuk penanganan darurat tanpa hambatan birokrasi.' },
        { number: '03', title: 'Bantuan Nyata', summary: 'Distribusi logistik, pangan bergizi, dan posko kesehatan terpadu.' },
        { number: '04', title: 'Pemulihan Warga', summary: 'Fasilitasi penerbitan ulang dokumen kependudukan yang hangus.' },
        { number: '05', title: 'Regulasi Tegas', summary: 'Mendorong perda pengawasan dan standar proteksi keselamatan lingkungan.' },
      ];

  return {
    type: 'div',
    props: {
      style: {
        width: `${width}px`,
        height: `${height}px`,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: '40px 48px',
        boxSizing: 'border-box',
        fontFamily: 'Plus Jakarta Sans',
      },
      children: [
        // Top Headline & Subtitle Card (Wrapped in solid high-contrast card)
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
              boxShadow: '0 4px 14px rgba(0, 0, 0, 0.06)',
            },
            children: [
              {
                type: 'span',
                props: { style: { fontSize: '11px', fontWeight: 700, color: primaryAccent, letterSpacing: '0.08em', marginBottom: '4px' }, children: editionTag.toUpperCase() },
              },
              {
                type: 'span',
                props: {
                  style: { fontFamily: 'Anton', fontSize: '60px', lineHeight: 0.95, color: '#0F172A', letterSpacing: '0.02em' },
                  children: (copy.mainBannerTitle || headline || '5 POKOK REKOMENDASI').slice(0, 32).toUpperCase(),
                },
              },
              {
                type: 'span',
                props: {
                  style: { fontSize: '13px', color: '#475569', marginTop: '6px' },
                  children: (copy.mainBannerSubheader || 'Kerangka Kerja Strategis Percepatan Solusi dan Advokasi Parlemen').slice(0, 75),
                },
              },
            ],
          },
        },

        // 2x2 Grid + 1 Bottom Wide Card
        {
          type: 'div',
          props: {
            style: { display: 'flex', flexDirection: 'column', gap: '14px', margin: '14px 0' },
            children: [
              // Row 1 (Cards 01 & 02)
              {
                type: 'div',
                props: {
                  style: { display: 'flex', flexDirection: 'row', gap: '14px' },
                  children: cards.slice(0, 2).map((c, idx) => ({
                    type: 'div',
                    props: {
                      style: {
                        flex: 1,
                        backgroundColor: '#FFFFFF',
                        border: '1.5px solid #CBD5E1',
                        borderRadius: '8px',
                        padding: '16px',
                        display: 'flex',
                        flexDirection: 'row',
                        gap: '12px',
                        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
                      },
                      children: [
                        ...(croppedThumbnails[`card${idx + 1}`]
                          ? [
                              {
                                type: 'img',
                                props: {
                                  src: croppedThumbnails[`card${idx + 1}`],
                                  style: { width: '80px', height: '80px', objectFit: 'cover', borderRadius: '4px' },
                                },
                              },
                            ]
                          : []),
                        {
                          type: 'div',
                          props: {
                            style: { display: 'flex', flexDirection: 'column', flex: 1 },
                            children: [
                              { type: 'span', props: { style: { fontFamily: 'Anton', fontSize: '24px', color: primaryAccent }, children: c.number } },
                              { type: 'span', props: { style: { fontWeight: 700, fontSize: '13px', color: '#0F172A', marginBottom: '4px' }, children: c.title.slice(0, 30) } },
                              { type: 'span', props: { style: { fontSize: '10px', color: '#475569', lineHeight: 1.35 }, children: c.summary.slice(0, 85) } },
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
                  style: { display: 'flex', flexDirection: 'row', gap: '14px' },
                  children: cards.slice(2, 4).map((c, idx) => ({
                    type: 'div',
                    props: {
                      style: {
                        flex: 1,
                        backgroundColor: '#FFFFFF',
                        border: '1.5px solid #CBD5E1',
                        borderRadius: '8px',
                        padding: '16px',
                        display: 'flex',
                        flexDirection: 'row',
                        gap: '12px',
                        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
                      },
                      children: [
                        ...(croppedThumbnails[`card${idx + 3}`]
                          ? [
                              {
                                type: 'img',
                                props: {
                                  src: croppedThumbnails[`card${idx + 3}`],
                                  style: { width: '80px', height: '80px', objectFit: 'cover', borderRadius: '4px' },
                                },
                              },
                            ]
                          : []),
                        {
                          type: 'div',
                          props: {
                            style: { display: 'flex', flexDirection: 'column', flex: 1 },
                            children: [
                              { type: 'span', props: { style: { fontFamily: 'Anton', fontSize: '24px', color: primaryAccent }, children: c.number } },
                              { type: 'span', props: { style: { fontWeight: 700, fontSize: '13px', color: '#0F172A', marginBottom: '4px' }, children: c.title.slice(0, 30) } },
                              { type: 'span', props: { style: { fontSize: '10px', color: '#475569', lineHeight: 1.35 }, children: c.summary.slice(0, 85) } },
                            ],
                          },
                        },
                      ],
                    },
                  })),
                },
              },

              // Card 05 (Wide Card)
              {
                type: 'div',
                props: {
                  style: {
                    backgroundColor: '#0F172A',
                    color: '#FFFFFF',
                    borderRadius: '8px',
                    border: '1.5px solid #1E293B',
                    padding: '18px 24px',
                    display: 'flex',
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: '18px',
                    boxShadow: '0 6px 18px rgba(0, 0, 0, 0.15)',
                  },
                  children: [
                    { type: 'span', props: { style: { fontFamily: 'Anton', fontSize: '36px', color: primaryAccent }, children: cards[4]?.number || '05' } },
                    {
                      type: 'div',
                      props: {
                        style: { display: 'flex', flexDirection: 'column' },
                        children: [
                          { type: 'span', props: { style: { fontWeight: 700, fontSize: '15px', color: '#FFFFFF', marginBottom: '2px' }, children: (cards[4]?.title || 'Regulasi Tegas').slice(0, 35) } },
                          { type: 'span', props: { style: { fontSize: '11px', color: '#94A3B8', lineHeight: 1.35 }, children: (cards[4]?.summary || 'Mendorong perda pengawasan dan alokasi anggaran berkeadilan.').slice(0, 110) } },
                        ],
                      },
                    },
                  ],
                },
              },
            ],
          },
        },

        // Member Footer (Protected Container)
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
              padding: '12px 20px',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
            },
            children: [
              {
                type: 'div',
                props: {
                  style: { display: 'flex', flexDirection: 'column' },
                  children: [
                    { type: 'span', props: { style: { fontFamily: 'Anton', fontSize: '18px', color: '#0F172A' }, children: memberName.toUpperCase() } },
                    { type: 'span', props: { style: { fontSize: '11px', color: '#64748B' }, children: memberTitle.toUpperCase() } },
                  ],
                },
              },
              { type: 'span', props: { style: { fontSize: '11px', fontWeight: 700, color: primaryAccent }, children: 'POLARIS EXECUTIVE FRAMEWORK' } },
            ],
          },
        },
      ],
    },
  };
}
