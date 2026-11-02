import { SynthesizedEditorialCopy } from '../types.js';
import {
  wordSafeHeadlineTruncate,
  smartSentenceClamp,
} from '../core/adaptive-typography.js';

export interface InfographicNarrativeWaveLayoutProps {
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
  subjectPhotoDataUri?: string;
  croppedThumbnails?: Record<string, string>;
  qrCodeDataUri?: string;
}

/**
 * Layout Infografis 01: PITA NARASI GELOMBANG (Inspirasi Template Dimensi)
 * Struktur Visual 1:1:
 * - Header Atas: Tipografi Elegan Serif/Sans Kontras
 * - Pita Merah Gelombang S (Dynamic Curve Ribbon) yang membelah 4 dimensi narasi:
 *   1. Dimensi Struktural / Regulasi
 *   2. Dimensi Sosial / Komunitas
 *   3. Dimensi Emosional / Aspirasi
 *   4. Dimensi Strategis / Solusi Masa Depan
 * - Foto/Kolase Aksen Monokrom Klasik yang melayang di setiap lengkungan pita
 * - Footer: Tanda Tangan Anggota Dewan & QR Code
 */
export function buildInfographicNarrativeWaveLayout(params: InfographicNarrativeWaveLayoutProps): any {
  const {
    width,
    height,
    headline,
    quote,
    copy,
    memberName,
    memberTitle,
    editionTag,
    primaryAccent = '#A91B1B',
    secondaryAccent = '#1F2937',
    subjectPhotoDataUri,
    croppedThumbnails = {},
    qrCodeDataUri,
  } = params;

  const ribbonRed = primaryAccent || '#A91B1B';
  const paperCream = '#FAF7F2';
  const textDark = '#111827';
  const textMuted = '#4B5563';

  const rawTitle = (copy.mainBannerTitle || headline || 'DIMENSI KEBIJAKAN PUBLIK').toUpperCase();
  const displayTitle = wordSafeHeadlineTruncate(rawTitle, 36);

  const defaultStages = [
    {
      title: 'DIMENSI STRUKTURAL',
      body: 'Penguatan kerangka regulasi dan kepastian payung hukum untuk menjamin efektivitas program di tingkat daerah.',
    },
    {
      title: 'DIMENSI SOSIAL',
      body: 'Membangun partisipasi aktif warga dan keterlibatan komunitas akar rumput dalam mengawal pelaksanaan kebijakan.',
    },
    {
      title: 'DIMENSI RESPONSIF',
      body: 'Kepekaan terhadap aspirasi mendesak dan respons cepat terhadap persoalan nyata yang dihadapi masyarakat.',
    },
    {
      title: 'DIMENSI STRATEGIS',
      body: 'Langkah terpadu jangka panjang guna mewujudkan tata kelola berkelanjutan dan peningkatan kualitas hidup.',
    },
  ];

  const stages = [
    {
      title: copy.blocks?.['stage_1']?.header || defaultStages[0].title,
      body: smartSentenceClamp(copy.blocks?.['stage_1']?.body || defaultStages[0].body, 140),
    },
    {
      title: copy.blocks?.['stage_2']?.header || defaultStages[1].title,
      body: smartSentenceClamp(copy.blocks?.['stage_2']?.body || defaultStages[1].body, 140),
    },
    {
      title: copy.blocks?.['stage_3']?.header || defaultStages[2].title,
      body: smartSentenceClamp(copy.blocks?.['stage_3']?.body || defaultStages[2].body, 140),
    },
    {
      title: copy.blocks?.['stage_4']?.header || defaultStages[3].title,
      body: smartSentenceClamp(copy.blocks?.['stage_4']?.body || defaultStages[3].body, 140),
    },
  ];

  const photo1 = croppedThumbnails['thumb1'] || null;
  const photo2 = croppedThumbnails['thumb2'] || null;

  return {
    type: 'div',
    props: {
      style: {
        width: `${width}px`,
        height: `${height}px`,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        backgroundColor: paperCream,
        padding: '28px 34px',
        boxSizing: 'border-box',
        position: 'relative',
        fontFamily: 'Plus Jakarta Sans',
        overflow: 'hidden',
      },
      children: [
        // Headline Atas
        {
          type: 'div',
          props: {
            style: { display: 'flex', flexDirection: 'column', borderBottom: `3.5px solid ${ribbonRed}`, paddingBottom: '14px' },
            children: [
              {
                type: 'span',
                props: {
                  style: { fontSize: '14px', fontWeight: 800, color: ribbonRed, letterSpacing: '2px', textTransform: 'uppercase' },
                  children: editionTag || 'INFOGRAFIS ADVOKASI // 4 DIMENSI',
                },
              },
              {
                type: 'span',
                props: {
                  style: { fontFamily: 'Bebas Neue', fontSize: '70px', color: ribbonRed, lineHeight: 1.0, marginTop: '4px' },
                  children: displayTitle,
                },
              },
            ],
          },
        },

        // 4 Kartu Dimensi Bergelombang
        {
          type: 'div',
          props: {
            style: { display: 'flex', flexDirection: 'column', gap: '18px', margin: '16px 0', flex: 1, justifyContent: 'space-around' },
            children: stages.map((st, i) => {
              const isEven = i % 2 === 1;
              return {
                type: 'div',
                props: {
                  style: {
                    display: 'flex',
                    flexDirection: isEven ? 'row-reverse' : 'row',
                    alignItems: 'center',
                    gap: '24px',
                  },
                  children: [
                    // Kartu Teks Berlatar Merah Pita
                    {
                      type: 'div',
                      props: {
                        style: {
                          flex: 1,
                          backgroundColor: ribbonRed,
                          color: '#FFFFFF',
                          padding: '18px 24px',
                          borderRadius: isEven ? '28px 10px 10px 28px' : '10px 28px 28px 10px',
                          boxShadow: '0 6px 18px rgba(0,0,0,0.18)',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '8px',
                        },
                        children: [
                          {
                            type: 'span',
                            props: {
                              style: { fontSize: '16px', fontWeight: 900, color: '#FFFFFF', letterSpacing: '0.5px' },
                              children: st.title,
                            },
                          },
                          {
                            type: 'span',
                            props: {
                              style: { fontSize: '13.5px', lineHeight: 1.4, color: 'rgba(255,255,255,0.95)' },
                              children: st.body,
                            },
                          },
                        ],
                      },
                    },
                    // Foto Bulat / Aksen Monokrom
                    {
                      type: 'div',
                      props: {
                        style: {
                          width: '130px',
                          height: '130px',
                          borderRadius: '65px',
                          overflow: 'hidden',
                          border: `4px solid ${ribbonRed}`,
                          backgroundColor: '#E5E7EB',
                          flexShrink: 0,
                          boxShadow: '0 6px 14px rgba(0,0,0,0.18)',
                        },
                        children: [
                          (i === 0 && photo1) || (i === 1 && photo2)
                            ? {
                                type: 'img',
                                props: {
                                  src: i === 0 ? photo1 : photo2,
                                  style: { width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top center' },
                                },
                              }
                            : subjectPhotoDataUri && i === 0
                            ? {
                                type: 'img',
                                props: {
                                  src: subjectPhotoDataUri,
                                  style: { width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top center' },
                                },
                              }
                            : {
                                type: 'div',
                                props: {
                                  style: {
                                    width: '100%',
                                    height: '100%',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontFamily: 'Bebas Neue',
                                    fontSize: '34px',
                                    color: ribbonRed,
                                  },
                                  children: `0${i + 1}`,
                                },
                              },
                        ],
                      },
                    },
                  ],
                },
              };
            }),
          },
        },

        // Footer & Signature
        {
          type: 'div',
          props: {
            style: {
              display: 'flex',
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              borderTop: `2px solid ${ribbonRed}`,
              paddingTop: '12px',
            },
            children: [
              {
                type: 'div',
                props: {
                  style: { display: 'flex', flexDirection: 'column' },
                  children: [
                    {
                      type: 'span',
                      props: {
                        style: { fontSize: '14.5px', fontWeight: 900, color: textDark },
                        children: memberName || 'ANGGOTA DEWAN',
                      },
                    },
                    {
                      type: 'span',
                      props: {
                        style: { fontSize: '12px', color: textMuted, marginTop: '2px', fontWeight: 600 },
                        children: memberTitle || 'KOMISI DPR RI // PERWAKILAN DAERAH',
                      },
                    },
                  ],
                },
              },
              qrCodeDataUri
                ? {
                    type: 'img',
                    props: {
                      src: qrCodeDataUri,
                      style: { width: '65px', height: '65px', padding: '2px', backgroundColor: '#FFFFFF', borderRadius: '4px' },
                    },
                  }
                : null,
            ].filter(Boolean),
          },
        },
      ],
    },
  };
}
