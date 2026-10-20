import { SynthesizedEditorialCopy } from '../types.js';

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
 * Layout 4: VINTAGE_PERSONA_GAZETTE (Inspirasi: Biografi Steve Jobs / The S News)
 */
export function buildVintageGazetteLayout(params: VintageGazetteLayoutParams): any {
  const { width, height, headline, quote, copy, memberName, memberTitle, editionTag, primaryAccent } = params;

  const stats = copy.statCircles && copy.statCircles.length >= 3
    ? copy.statCircles.slice(0, 3)
    : [
        { topLabel: 'ALOKASI PRIORITAS', value: '20%', description: 'Mandat anggaran pendidikan & fasilitas publik daerah.' },
        { topLabel: 'TARGET PENERIMA', value: '1.450+', description: 'Keluarga dan siswa terdata menerima manfaat langsung.' },
        { topLabel: 'AUDIT EVALUASI', value: '100%', description: 'Pengawasan berkala untuk cegah kebocoran birokrasi.' },
      ];

  const actionSteps = copy.numberedItems && copy.numberedItems.length >= 3
    ? copy.numberedItems.slice(0, 3)
    : [
        { number: '01', title: 'Audit Kebijakan', summary: 'Evaluasi menyeluruh regulasi dan pengalokasian pos anggaran.' },
        { number: '02', title: 'Aksi Lapangan', summary: 'Peninjauan langsung ke titik prioritas bersama warga masyarakat.' },
        { number: '03', title: 'Advokasi Parlemen', summary: 'Pengawalan legislasi dan penyaluran bantuan tepat sasaran.' },
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
        padding: '34px 40px',
        boxSizing: 'border-box',
        fontFamily: 'DejaVu Serif',
      },
      children: [
        // 1. Top Gazette Masthead
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
            },
            children: [
              {
                type: 'div',
                props: {
                  style: { display: 'flex', width: '100%', justifyContent: 'space-between', alignItems: 'center' },
                  children: [
                    { type: 'span', props: { style: { fontSize: '9.5px', fontWeight: 700, color: '#4B5563', letterSpacing: '0.06em' }, children: 'VOL. XXIV • EDISI KHUSUS' } },
                    {
                      type: 'span',
                      props: {
                        style: { fontFamily: 'DejaVu Serif', fontWeight: 700, fontSize: '24px', color: '#111827', letterSpacing: '0.08em' },
                        children: (editionTag || 'POLARIS HISTORICAL GAZETTE').toUpperCase(),
                      },
                    },
                    { type: 'span', props: { style: { fontSize: '9.5px', fontWeight: 700, color: primaryAccent, letterSpacing: '0.06em' }, children: 'PUBLIKASI RESMI' } },
                  ],
                },
              },
              {
                type: 'span',
                props: {
                  style: { fontSize: '9.5px', fontStyle: 'italic', color: '#6B7280', marginTop: '2px' },
                  children: 'Edisi Khusus Tinjauan Strategis, Refleksi Kebijakan Publik & Pengawalan Hak Rakyat',
                },
              },
            ],
          },
        },

        // 2. Giant Headline & Subheader (Protective container)
        {
          type: 'div',
          props: {
            style: {
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              backgroundColor: 'rgba(255, 255, 255, 0.96)',
              border: '1.5px solid #111827',
              borderRadius: '6px',
              padding: '14px 20px',
              margin: '8px 0',
              textAlign: 'center',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.06)',
            },
            children: [
              {
                type: 'span',
                props: {
                  style: { fontWeight: 700, fontSize: '12px', color: primaryAccent, letterSpacing: '0.06em', marginBottom: '4px' },
                  children: (copy.mainBannerSubheader || 'Gagasan Besar dan Perjalanan Mengawal Hak-Hak Konstitusional Warga').slice(0, 70).toUpperCase(),
                },
              },
              {
                type: 'span',
                props: {
                  style: { fontFamily: 'Bebas Neue', fontSize: '64px', lineHeight: 0.95, color: '#111827', letterSpacing: '0.02em' },
                  children: (copy.mainBannerTitle || headline || 'DEDIKASI UNTUK RAKYAT').slice(0, 32).toUpperCase(),
                },
              },
            ],
          },
        },

        // 3. Hero Metrics Row (3 High-Impact Stat Boxes)
        {
          type: 'div',
          props: {
            style: { display: 'flex', flexDirection: 'row', gap: '10px', margin: '6px 0' },
            children: stats.map((st) => ({
              type: 'div',
              props: {
                style: {
                  flex: 1,
                  backgroundColor: '#FFFFFF',
                  border: '1.5px solid #111827',
                  borderRadius: '4px',
                  padding: '10px 12px',
                  display: 'flex',
                  flexDirection: 'column',
                  boxShadow: '0 2px 6px rgba(0, 0, 0, 0.04)',
                },
                children: [
                  { type: 'span', props: { style: { fontSize: '9px', fontWeight: 700, color: '#4B5563', letterSpacing: '0.04em' }, children: (st.topLabel || 'INDIKATOR').toUpperCase().slice(0, 18) } },
                  { type: 'span', props: { style: { fontFamily: 'Anton', fontSize: '26px', color: primaryAccent, lineHeight: 1.1, margin: '2px 0' }, children: (st.value || '100%').slice(0, 14) } },
                  { type: 'span', props: { style: { fontSize: '9px', color: '#1F2937', lineHeight: 1.35 }, children: (st.description || '').slice(0, 55) } },
                ],
              },
            })),
          },
        },

        // 4. Middle Split: Action Steps (Left) + Editorial Quote Box (Right)
        {
          type: 'div',
          props: {
            style: { display: 'flex', flexDirection: 'row', gap: '14px', flex: 1, margin: '6px 0' },
            children: [
              // Left Column: 3 Numbered Action Steps
              {
                type: 'div',
                props: {
                  style: { flex: 1.15, display: 'flex', flexDirection: 'column', gap: '7px' },
                  children: actionSteps.map((step) => ({
                    type: 'div',
                    props: {
                      style: {
                        backgroundColor: 'rgba(255, 255, 255, 0.96)',
                        border: '1px solid #D1D5DB',
                        borderRadius: '4px',
                        padding: '8px 12px',
                        display: 'flex',
                        flexDirection: 'row',
                        alignItems: 'center',
                        gap: '10px',
                        boxShadow: '0 2px 5px rgba(0, 0, 0, 0.03)',
                      },
                      children: [
                        {
                          type: 'div',
                          props: {
                            style: {
                              backgroundColor: '#111827',
                              color: '#FFFFFF',
                              fontFamily: 'Anton',
                              fontSize: '14px',
                              padding: '4px 8px',
                              borderRadius: '3px',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                            },
                            children: (step.number || '01').slice(0, 3),
                          },
                        },
                        {
                          type: 'div',
                          props: {
                            style: { display: 'flex', flexDirection: 'column', flex: 1 },
                            children: [
                              { type: 'span', props: { style: { fontWeight: 700, fontSize: '11px', color: '#111827' }, children: (step.title || '').slice(0, 30) } },
                              { type: 'span', props: { style: { fontSize: '9.5px', color: '#4B5563', lineHeight: 1.3 }, children: (step.summary || '').slice(0, 65) } },
                            ],
                          },
                        },
                      ],
                    },
                  })),
                },
              },

              // Right Column with Quote Box + Analytical Summary
              {
                type: 'div',
                props: {
                  style: { flex: 1, display: 'flex', flexDirection: 'column', gap: '7px', justifyContent: 'space-between' },
                  children: [
                    {
                      type: 'div',
                      props: {
                        style: { backgroundColor: '#FEF3C7', borderLeft: `4px solid ${primaryAccent}`, border: '1px solid #FDE68A', padding: '12px 14px', borderRadius: '4px' },
                        children: [
                          {
                            type: 'span',
                            props: {
                              style: { fontStyle: 'italic', fontSize: '11px', lineHeight: 1.4, color: '#78350F' },
                              children: `"${(quote || copy.mainBannerDefinitionBody || 'Amanah rakyat tidak boleh diperjualbelikan demi kenyamanan kekuasaan.').slice(0, 110)}"`,
                            },
                          },
                        ],
                      },
                    },
                    {
                      type: 'div',
                      props: {
                        style: {
                          backgroundColor: 'rgba(255, 255, 255, 0.96)',
                          border: '1px solid #D1D5DB',
                          borderRadius: '4px',
                          padding: '10px 14px',
                          boxShadow: '0 2px 5px rgba(0, 0, 0, 0.03)',
                        },
                        children: [
                          {
                            type: 'p',
                            props: {
                              style: { fontSize: '9.5px', lineHeight: 1.4, color: '#1F2937', textAlign: 'justify', margin: 0 },
                              children: (copy.blocks?.['right_cause']?.body || copy.blocks?.['left_positive']?.body || 'Melalui pengawasan ketat dan transparansi kebijakan, setiap rupiah alokasi anggaran daerah harus kembali menjadi kesejahteraan konkret bagi masyarakat.').slice(0, 150),
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

        // 5. Member Footer Signature (Protective solid white container)
        {
          type: 'div',
          props: {
            style: {
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              backgroundColor: 'rgba(255, 255, 255, 0.96)',
              border: '2px solid #111827',
              borderRadius: '6px',
              padding: '10px 18px',
              marginTop: '6px',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.06)',
            },
            children: [
              {
                type: 'div',
                props: {
                  style: { display: 'flex', flexDirection: 'column' },
                  children: [
                    { type: 'span', props: { style: { fontWeight: 700, fontSize: '17px', color: '#111827' }, children: memberName.slice(0, 35).toUpperCase() } },
                    { type: 'span', props: { style: { fontSize: '10.5px', color: '#4B5563' }, children: memberTitle.slice(0, 45).toUpperCase() } },
                  ],
                },
              },
              { type: 'span', props: { style: { fontSize: '10.5px', fontWeight: 700, color: primaryAccent }, children: 'DOKUMEN RESMI PARLEMEN' } },
            ],
          },
        },
      ],
    },
  };
}
