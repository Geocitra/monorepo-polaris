import { SynthesizedEditorialCopy } from '../types.js';
import {
  getAdaptiveFontSize,
  wordSafeHeadlineTruncate,
  smartSentenceClamp,
} from '../core/adaptive-typography.js';

export interface VintageGazetteLayoutParams {
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
 * Layout 4: VINTAGE_PERSONA_GAZETTE (Inspirasi: Biografi Steve Jobs / The S News / Classic Broadsheet)
 * Structural Family: EDITORIAL_MAGAZINE
 * Ciri khas:
 * - Masthead koran vintage dengan double rule
 * - Area tengah terbuka untuk visual hero
 * - Bagian bawah: 2 kolom artikel berdampingan (flexDirection: 'row', 50% kiri & 50% kanan) dipisahkan garis vertikal tipis
 * - Bebas dari lingkaran/kotak statistik palsu
 */
export function buildVintageGazetteLayout(params: VintageGazetteLayoutParams): any {
  const { width, height, headline, quote, copy, memberName, memberTitle, editionTag, primaryAccent } = params;

  const rawTitle = copy.mainBannerTitle || headline || 'DEDIKASI UNTUK RAKYAT';
  const displayTitle = wordSafeHeadlineTruncate(rawTitle, 32).toUpperCase();
  const titleFontSize = getAdaptiveFontSize(displayTitle, 64, 42, 18);

  const rawSubheader = copy.mainBannerSubheader || 'Tinjauan Strategis & Pengawalan Hak-Hak Konstitusional Warga';
  const displaySubheader = smartSentenceClamp(rawSubheader, 72).toUpperCase();

  const leadQuote = smartSentenceClamp(
    quote || copy.mainBannerDefinitionBody || 'Amanah publik adalah tanggung jawab moral tertinggi yang diwujudkan melalui kerja konkret.',
    110
  );

  const leftBody = smartSentenceClamp(
    copy.blocks?.['left_positive']?.body ||
      copy.blocks?.['overview']?.body ||
      'Melalui pengawasan intensif dan advokasi berkelanjutan, program kerja daerah difokuskan untuk menjawab kebutuhan riil masyarakat di seluruh pelosok wilayah.',
    140
  );

  const rightBody = smartSentenceClamp(
    copy.blocks?.['right_cause']?.body ||
      copy.blocks?.['impact']?.body ||
      'Setiap alokasi kebijakan diarahkan secara terukur demi mewujudkan transparansi tata kelola serta peningkatan kesejahteraan masyarakat secara konkret dan merata.',
    140
  );

  return {
    type: 'div',
    props: {
      style: {
        width: `${width}px`,
        height: `${height}px`,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: '36px 42px',
        boxSizing: 'border-box',
        fontFamily: 'DejaVu Serif',
        position: 'relative',
      },
      children: [
        // 1. Top Gazette Masthead (Classic Double Rule)
        {
          type: 'div',
          props: {
            style: {
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              borderTop: '3px solid #111827',
              borderBottom: '1.5px solid #111827',
              padding: '8px 0',
              backgroundColor: 'rgba(253, 251, 247, 0.92)',
            },
            children: [
              {
                type: 'div',
                props: {
                  style: { display: 'flex', width: '100%', justifyContent: 'space-between', alignItems: 'center', padding: '0 8px' },
                  children: [
                    { type: 'span', props: { style: { fontSize: '10px', fontWeight: 700, color: '#4B5563', letterSpacing: '0.06em' }, children: 'VOL. XXIV • EDISI KHUSUS' } },
                    {
                      type: 'span',
                      props: {
                        style: { fontFamily: 'DejaVu Serif', fontWeight: 700, fontSize: '24px', color: '#111827', letterSpacing: '0.08em' },
                        children: (editionTag || 'POLARIS HISTORICAL GAZETTE').toUpperCase(),
                      },
                    },
                    { type: 'span', props: { style: { fontSize: '10px', fontWeight: 700, color: primaryAccent || '#B45309', letterSpacing: '0.06em' }, children: 'PUBLIKASI RESMI' } },
                  ],
                },
              },
              {
                type: 'span',
                props: {
                  style: { fontSize: '10px', fontStyle: 'italic', color: '#6B7280', marginTop: '3px' },
                  children: 'Edisi Khusus Tinjauan Strategis, Refleksi Kebijakan Publik & Pengawalan Hak Rakyat',
                },
              },
            ],
          },
        },

        // 2. Headline & Subheader (Protective Gazette Container)
        {
          type: 'div',
          props: {
            style: {
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              backgroundColor: 'rgba(253, 251, 247, 0.95)',
              border: '1.5px solid #111827',
              borderRadius: '4px',
              padding: '12px 20px',
              margin: '8px 0',
              textAlign: 'center',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
            },
            children: [
              {
                type: 'span',
                props: {
                  style: { fontWeight: 700, fontSize: '11px', color: primaryAccent || '#B45309', letterSpacing: '0.06em', marginBottom: '4px' },
                  children: displaySubheader,
                },
              },
              {
                type: 'span',
                props: {
                  style: { fontFamily: 'Bebas Neue', fontSize: `${titleFontSize}px`, lineHeight: 0.95, color: '#111827', letterSpacing: '0.02em' },
                  children: displayTitle,
                },
              },
            ],
          },
        },

        // 3. Middle Open Canvas Spacer (Hero Window for background photography / art)
        {
          type: 'div',
          props: {
            style: {
              flex: 1,
              minHeight: '120px',
            },
          },
        },

        // 4. Magazine Columns: 2 Kolom Artikel Berdampingan Secara Horizontal (50% kiri & 50% kanan)
        {
          type: 'div',
          props: {
            style: {
              display: 'flex',
              flexDirection: 'column',
              backgroundColor: 'rgba(253, 251, 247, 0.97)',
              border: '2px solid #111827',
              borderRadius: '4px',
              padding: '16px 20px',
              boxShadow: '0 8px 24px rgba(0, 0, 0, 0.12)',
              margin: '8px 0',
            },
            children: [
              {
                type: 'div',
                props: {
                  style: {
                    display: 'flex',
                    flexDirection: 'row',
                    gap: '20px',
                  },
                  children: [
                    // Kolom Kiri: Lead Story & Quote
                    {
                      type: 'div',
                      props: {
                        style: {
                          flex: 1,
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '8px',
                        },
                        children: [
                          {
                            type: 'span',
                            props: {
                              style: {
                                fontSize: '10px',
                                fontWeight: 700,
                                color: primaryAccent || '#B45309',
                                letterSpacing: '0.08em',
                                borderBottom: '1px solid #111827',
                                paddingBottom: '3px',
                              },
                              children: 'LAPORAN UTAMA & KOMITMEN',
                            },
                          },
                          {
                            type: 'div',
                            props: {
                              style: {
                                borderLeft: `3px solid ${primaryAccent || '#B45309'}`,
                                paddingLeft: '8px',
                                fontStyle: 'italic',
                                fontSize: '11px',
                                lineHeight: 1.4,
                                color: '#374151',
                              },
                              children: `"${leadQuote}"`,
                            },
                          },
                          {
                            type: 'p',
                            props: {
                              style: {
                                fontSize: '10px',
                                lineHeight: 1.45,
                                color: '#1F2937',
                                margin: 0,
                                textAlign: 'justify',
                              },
                              children: leftBody,
                            },
                          },
                        ],
                      },
                    },

                    // Hairline Divider Vertikal
                    {
                      type: 'div',
                      props: {
                        style: {
                          width: '1px',
                          backgroundColor: '#9CA3AF',
                          alignSelf: 'stretch',
                        },
                      },
                    },

                    // Kolom Kanan: Analisis & Catatan Kebijakan
                    {
                      type: 'div',
                      props: {
                        style: {
                          flex: 1,
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '8px',
                        },
                        children: [
                          {
                            type: 'span',
                            props: {
                              style: {
                                fontSize: '10px',
                                fontWeight: 700,
                                color: '#111827',
                                letterSpacing: '0.08em',
                                borderBottom: '1px solid #111827',
                                paddingBottom: '3px',
                              },
                              children: 'TELAAH KEBIJAKAN PUBLIK',
                            },
                          },
                          {
                            type: 'p',
                            props: {
                              style: {
                                fontSize: '10px',
                                lineHeight: 1.45,
                                color: '#1F2937',
                                margin: 0,
                                textAlign: 'justify',
                              },
                              children: rightBody,
                            },
                          },
                          {
                            type: 'div',
                            props: {
                              style: {
                                backgroundColor: '#F3F4F6',
                                border: '1px dashed #9CA3AF',
                                padding: '6px 10px',
                                borderRadius: '2px',
                                fontSize: '9px',
                                color: '#4B5563',
                              },
                              children: 'Transparansi anggaran & pengawasan publik berkala.',
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

        // 5. Member Footer Signature (Classic Gazette Signature Strip)
        {
          type: 'div',
          props: {
            style: {
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              backgroundColor: 'rgba(253, 251, 247, 0.98)',
              border: '2px solid #111827',
              borderRadius: '4px',
              padding: '10px 18px',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
            },
            children: [
              {
                type: 'div',
                props: {
                  style: { display: 'flex', flexDirection: 'column' },
                  children: [
                    { type: 'span', props: { style: { fontWeight: 700, fontSize: '16px', color: '#111827' }, children: memberName.slice(0, 35).toUpperCase() } },
                    { type: 'span', props: { style: { fontSize: '10px', color: '#4B5563' }, children: memberTitle.slice(0, 45).toUpperCase() } },
                  ],
                },
              },
              { type: 'span', props: { style: { fontSize: '10.5px', fontWeight: 700, color: primaryAccent || '#B45309' }, children: 'DOKUMEN RESMI PARLEMEN' } },
            ],
          },
        },
      ],
    },
  };
}
