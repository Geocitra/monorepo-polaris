import { SynthesizedEditorialCopy } from '../types.js';
import {
  getAdaptiveFontSize,
  wordSafeHeadlineTruncate,
  smartSentenceClamp,
} from '../core/adaptive-typography.js';

export interface RetroMitigationLayoutParams {
  width: number;
  height: number;
  headline: string;
  copy: SynthesizedEditorialCopy;
  memberName: string;
  memberTitle: string;
  editionTag: string;
  primaryAccent: string;
  croppedThumbnails?: Record<string, string>;
  logoDataUri?: string;
}

/**
 * Layout 2: RETRO_SPLIT_MITIGATION (Inspirasi: Earthquake Retro Style / Get To Know)
 */
export function buildRetroMitigationLayout(params: RetroMitigationLayoutParams): any {
  const { width, height, headline, copy, memberName, memberTitle, editionTag, primaryAccent, croppedThumbnails = {}, logoDataUri } = params;

  const rawTitle = copy.mainBannerTitle || headline || 'PANDUAN KESELAMATAN BENCANA';
  const displayTitle = wordSafeHeadlineTruncate(rawTitle, 32).toUpperCase();
  const titleFontSize = getAdaptiveFontSize(displayTitle, 64, 40, 18);

  const displaySubheader = smartSentenceClamp(copy.mainBannerSubheader || 'TANGGAP DARURAT & MITIGASI RISIKO LINGKUNGAN', 70).toUpperCase();
  const displayDefinition = smartSentenceClamp(copy.mainBannerDefinitionBody || 'Edukasi dan kesiapsiagaan warga adalah garda terdepan penyelamatan jiwa saat musibah terjadi.', 140);

  const sourceItems = copy.numberedItems && copy.numberedItems.length >= 4
    ? copy.numberedItems
    : [
        { number: '01', title: 'Perlindungan Diri', summary: 'Cari tempat berlindung kokoh dan jauhi instalasi kaca atau kabel terbuka.' },
        { number: '02', title: 'Putus Aliran Listrik', summary: 'Segera matikan meteran listrik dan kompor untuk cegah korsleting dan api.' },
        { number: '03', title: 'Jalur Evakuasi Terbuka', summary: 'Gunakan tangga darurat dan jangan gunakan lift selama status bahaya.' },
        { number: '04', title: 'Titik Kumpul Lapangan', summary: 'Menuju ruang terbuka dan koordinasi dengan posko tanggap darurat RT/RW.' },
      ];

  const items = sourceItems.map((it) => ({
    number: it.number,
    title: wordSafeHeadlineTruncate(it.title, 26),
    summary: smartSentenceClamp(it.summary, 75),
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
        padding: '36px 42px',
        boxSizing: 'border-box',
        fontFamily: 'Plus Jakarta Sans',
      },
      children: [
        // Header Capsule Badge
        {
          type: 'div',
          props: {
            style: { display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderBottom: `2.5px solid ${primaryAccent}`, paddingBottom: '12px' },
            children: [
              {
                type: 'div',
                props: {
                  style: { display: 'flex', alignItems: 'center', gap: '10px' },
                  children: [
                    ...(logoDataUri ? [{ type: 'img', props: { src: logoDataUri, style: { height: '28px', objectFit: 'contain' } } }] : []),
                    { type: 'span', props: { style: { fontFamily: 'Anton', fontSize: '18px', color: primaryAccent }, children: editionTag.toUpperCase() } },
                  ],
                },
              },
              {
                type: 'span',
                props: {
                  style: { backgroundColor: '#FEF08A', color: '#1C1917', fontSize: '11px', fontWeight: 700, padding: '4px 10px', borderRadius: '4px' },
                  children: memberTitle.toUpperCase(),
                },
              },
            ],
          },
        },

        // Giant Title & Subheader
        {
          type: 'div',
          props: {
            style: { display: 'flex', flexDirection: 'column', gap: '6px', margin: '14px 0' },
            children: [
              {
                type: 'span',
                props: {
                  style: { fontFamily: 'Anton', fontSize: `${titleFontSize}px`, lineHeight: 0.95, color: '#1C1917', letterSpacing: '0.02em' },
                  children: displayTitle,
                },
              },
              {
                type: 'span',
                props: {
                  style: { fontSize: '15px', fontWeight: 700, color: primaryAccent },
                  children: displaySubheader,
                },
              },
            ],
          },
        },

        // Middle Split: Deskripsi Kebijakan + Circular Image Inset
        {
          type: 'div',
          props: {
            style: { display: 'flex', flexDirection: 'row', gap: '20px', alignItems: 'center', margin: '8px 0' },
            children: [
              {
                type: 'div',
                props: {
                  style: {
                    flex: 1,
                    backgroundColor: 'rgba(255, 255, 255, 0.9)',
                    borderLeft: `5px solid ${primaryAccent}`,
                    borderRadius: '8px',
                    padding: '16px 20px',
                  },
                  children: [
                    {
                      type: 'span',
                      props: {
                        style: { fontFamily: 'DejaVu Serif', fontSize: '13px', lineHeight: 1.45, color: '#292524' },
                        children: displayDefinition,
                      },
                    },
                  ],
                },
              },
              ...(croppedThumbnails.insetCircle
                ? [
                    {
                      type: 'img',
                      props: {
                        src: croppedThumbnails.insetCircle,
                        style: { width: '130px', height: '130px', borderRadius: '65px', border: `4px solid ${primaryAccent}`, objectFit: 'cover' },
                      },
                    },
                  ]
                : []),
            ],
          },
        },

        // Lower Section: Split 2 Kolom (Mitigasi 4 Poin + Langkah Wajib)
        {
          type: 'div',
          props: {
            style: { display: 'flex', flexDirection: 'row', gap: '24px', margin: '10px 0' },
            children: [
              // Kolom Kiri: 4 Poin Mitigasi
              {
                type: 'div',
                props: {
                  style: { flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' },
                  children: [
                    {
                      type: 'div',
                      props: {
                        style: { backgroundColor: primaryAccent, color: '#FFFFFF', padding: '6px 12px', fontSize: '12px', fontWeight: 700, borderRadius: '4px' },
                        children: 'LANGKAH MITIGASI',
                      },
                    },
                    ...items.slice(0, 4).map((it) => ({
                      type: 'div',
                      props: {
                        style: { display: 'flex', gap: '8px', alignItems: 'flex-start', backgroundColor: '#FFFFFF', padding: '8px 12px', borderRadius: '4px', border: '1px solid #E2E8F0' },
                        children: [
                          { type: 'span', props: { style: { fontFamily: 'Anton', fontSize: '14px', color: primaryAccent }, children: it.number } },
                          {
                            type: 'div',
                            props: {
                              style: { display: 'flex', flexDirection: 'column' },
                              children: [
                                { type: 'span', props: { style: { fontWeight: 700, fontSize: '11px', color: '#1E293B' }, children: it.title } },
                                { type: 'span', props: { style: { fontSize: '9px', color: '#64748B', lineHeight: 1.3 }, children: it.summary } },
                              ],
                            },
                          },
                        ],
                      },
                    })),
                  ],
                },
              },

              // Kolom Kanan: 3 Status Band
              {
                type: 'div',
                props: {
                  style: { width: '280px', display: 'flex', flexDirection: 'column', gap: '10px' },
                  children: [
                    {
                      type: 'div',
                      props: {
                        style: { backgroundColor: '#1E293B', color: '#FFFFFF', padding: '6px 12px', fontSize: '12px', fontWeight: 700, borderRadius: '4px' },
                        children: 'AKSI TANGGAP WAJIB',
                      },
                    },
                    {
                      type: 'div',
                      props: {
                        style: { backgroundColor: '#EF4444', color: '#FFFFFF', padding: '10px 14px', borderRadius: '6px', display: 'flex', flexDirection: 'column' },
                        children: [
                          { type: 'span', props: { style: { fontFamily: 'Anton', fontSize: '16px' }, children: 'PRIORITAS 1: EVAKUASI WARGA' } },
                          { type: 'span', props: { style: { fontSize: '9px', opacity: 0.9 }, children: 'Dahulukan lansia, ibu hamil, dan anak-anak ke titik aman.' } },
                        ],
                      },
                    },
                    {
                      type: 'div',
                      props: {
                        style: { backgroundColor: '#F59E0B', color: '#FFFFFF', padding: '10px 14px', borderRadius: '6px', display: 'flex', flexDirection: 'column' },
                        children: [
                          { type: 'span', props: { style: { fontFamily: 'Anton', fontSize: '16px' }, children: 'PRIORITAS 2: LOGISTIK & MEDIS' } },
                          { type: 'span', props: { style: { fontSize: '9px', opacity: 0.9 }, children: 'Salurkan makanan siap saji, air bersih, dan pertolongan pertama.' } },
                        ],
                      },
                    },
                    {
                      type: 'div',
                      props: {
                        style: { backgroundColor: '#10B981', color: '#FFFFFF', padding: '10px 14px', borderRadius: '6px', display: 'flex', flexDirection: 'column' },
                        children: [
                          { type: 'span', props: { style: { fontFamily: 'Anton', fontSize: '16px' }, children: 'PRIORITAS 3: REKONSTRUKSI' } },
                          { type: 'span', props: { style: { fontSize: '9px', opacity: 0.9 }, children: 'Pemulihan dokumen kependudukan dan audit jalur pipa air mandiri.' } },
                        ],
                      },
                    },
                  ],
                },
              },
            ],
          },
        },

        // Member Footer
        {
          type: 'div',
          props: {
            style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#1E293B', padding: '12px 20px', borderRadius: '6px' },
            children: [
              {
                type: 'div',
                props: {
                  style: { display: 'flex', flexDirection: 'column' },
                  children: [
                    { type: 'span', props: { style: { fontFamily: 'Anton', fontSize: '18px', color: '#FFFFFF' }, children: memberName.toUpperCase() } },
                    { type: 'span', props: { style: { fontSize: '11px', color: '#94A3B8' }, children: memberTitle.toUpperCase() } },
                  ],
                },
              },
              { type: 'span', props: { style: { fontSize: '11px', fontWeight: 700, color: primaryAccent }, children: 'POLARIS ADVOKASI PUBLIK' } },
            ],
          },
        },
      ],
    },
  };
}
