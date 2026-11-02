import { SynthesizedEditorialCopy } from '../types.js';
import {
  wordSafeHeadlineTruncate,
  smartSentenceClamp,
} from '../core/adaptive-typography.js';

export interface InfographicVisionaryTimelineLayoutProps {
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
 * Layout Infografis 05: TIMELINE PROFIL VISIONER (Inspirasi Template Steve Jobs)
 * Struktur Visual 1:1:
 * - Bagian Atas: Kutipan Filosofis Inspiratif Tebal & Badge Pengenal
 * - Area Tengah:
 *   1. Tipografi Nama/Isu Raksasa (Bebas Neue)
 *   2. Potret Besar Tokoh Monokrom Bergaya Sketsa/Foto Riil (Anti-Kepotong)
 *   3. Kartu Frosted Glass Ringkasan Kiprah & Rekam Jejak
 * - Bagian Bawah: Pita Linimasa Gelap Horisontal dengan 4-5 Titik Balik Sejarah
 * - Footer: Tanda Tangan Resmi & QR Code
 */
export function buildInfographicVisionaryTimelineLayout(params: InfographicVisionaryTimelineLayoutProps): any {
  const {
    width,
    height,
    headline,
    quote,
    copy,
    memberName,
    memberTitle,
    editionTag,
    primaryAccent = '#111827',
    secondaryAccent = '#4B5563',
    subjectPhotoDataUri,
    croppedThumbnails = {},
    qrCodeDataUri,
  } = params;

  const bgStudio = '#F8FAFC';
  const textDark = '#0F172A';
  const darkTimeline = '#0B0F19';

  const rawTitle = (copy.mainBannerTitle || headline || 'KEPEMIMPINAN VISIONER').toUpperCase();
  const displayTitle = wordSafeHeadlineTruncate(rawTitle, 36);

  const pullQuote = copy.mainBannerSubheader || quote || 'Inovasi dan keteguhan bekerja menghadirkan perubahan nyata bagi masyarakat.';

  const bioSummary = smartSentenceClamp(
    copy.mainBannerDefinitionBody || 'Sosok berdedikasi tinggi yang konsisten memperjuangkan aspirasi rakyat, merumuskan kebijakan berbasis bukti, dan mewujudkan tata kelola publik transparan.',
    220
  );

  const defaultMilestones = [
    { year: 'TAHAP 1', title: 'Inisiasi & Awal Karya', desc: 'Merumuskan kerangka kerja dan mendengarkan aspirasi langsung warga.' },
    { year: 'TAHAP 2', title: 'Titik Balik Kebijakan', desc: 'Menghadapi tantangan regulasi dan memperjuangkan anggaran berpihak.' },
    { year: 'TAHAP 3', title: 'Revolusi Pelayanan', desc: 'Meluncurkan program unggulan berdaya jangkau luas ke pelosok daerah.' },
    { year: 'TAHAP 4', title: 'Warisan Keberlanjutan', desc: 'Menegakkan standar akuntabilitas publik untuk generasi mendatang.' },
  ];

  const milestones = [
    {
      year: 'FASE 1',
      title: copy.blocks?.['milestone_1']?.header || defaultMilestones[0].title,
      desc: smartSentenceClamp(copy.blocks?.['milestone_1']?.body || defaultMilestones[0].desc, 90),
    },
    {
      year: 'FASE 2',
      title: copy.blocks?.['milestone_2']?.header || defaultMilestones[1].title,
      desc: smartSentenceClamp(copy.blocks?.['milestone_2']?.body || defaultMilestones[1].desc, 90),
    },
    {
      year: 'FASE 3',
      title: copy.blocks?.['milestone_3']?.header || defaultMilestones[2].title,
      desc: smartSentenceClamp(copy.blocks?.['milestone_3']?.body || defaultMilestones[2].desc, 90),
    },
    {
      year: 'FASE 4',
      title: copy.blocks?.['milestone_4']?.header || defaultMilestones[3].title,
      desc: smartSentenceClamp(copy.blocks?.['milestone_4']?.body || defaultMilestones[3].desc, 90),
    },
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
        backgroundColor: bgStudio,
        boxSizing: 'border-box',
        position: 'relative',
        fontFamily: 'Plus Jakarta Sans',
        overflow: 'hidden',
      },
      children: [
        // =====================================================================
        // BAGIAN ATAS & TENGAH (PROFIL VISIONER)
        // =====================================================================
        {
          type: 'div',
          props: {
            style: {
              display: 'flex',
              flexDirection: 'column',
              padding: '28px 36px 14px 36px',
              flex: 1,
              justifyContent: 'space-between',
            },
            children: [
              // Header Atas: Kutipan + Tag Edisi
              {
                type: 'div',
                props: {
                  style: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' },
                  children: [
                    {
                      type: 'div',
                      props: {
                        style: { display: 'flex', flexDirection: 'column', maxWidth: '680px' },
                        children: [
                          {
                            type: 'span',
                            props: {
                              style: { fontSize: '20px', fontWeight: 800, color: textDark, fontStyle: 'italic', lineHeight: 1.3 },
                              children: `"${pullQuote}"`,
                            },
                          },
                          {
                            type: 'span',
                            props: {
                              style: { fontSize: '14px', fontWeight: 700, color: secondaryAccent, marginTop: '4px' },
                              children: `— ${memberName || 'Tokoh Kebijakan'}`,
                            },
                          },
                        ],
                      },
                    },
                    {
                      type: 'div',
                      props: {
                        style: {
                          backgroundColor: '#FFFFFF',
                          border: '2px solid #E2E8F0',
                          padding: '6px 16px',
                          borderRadius: '8px',
                          fontSize: '12.5px',
                          fontWeight: 800,
                          color: textDark,
                          letterSpacing: '1px',
                        },
                        children: (editionTag || 'POLARIS // VISIONER').toUpperCase(),
                      },
                    },
                  ],
                },
              },

              // Area Tengah: Nama Besar + Potret Hero + Kartu Frosted
              {
                type: 'div',
                props: {
                  style: {
                    display: 'flex',
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '24px',
                    margin: '14px 0',
                  },
                  children: [
                    // Kiri: Judul Besar
                    {
                      type: 'div',
                      props: {
                        style: { display: 'flex', flexDirection: 'column', maxWidth: '320px' },
                        children: [
                          {
                            type: 'span',
                            props: {
                              style: { fontFamily: 'Bebas Neue', fontSize: '76px', color: textDark, lineHeight: 0.9, letterSpacing: '1px' },
                              children: displayTitle,
                            },
                          },
                          {
                            type: 'div',
                            props: {
                              style: {
                                backgroundColor: '#111827',
                                color: '#FFFFFF',
                                padding: '6px 14px',
                                borderRadius: '4px',
                                fontSize: '13px',
                                fontWeight: 800,
                                marginTop: '12px',
                                display: 'inline-block',
                              },
                              children: memberTitle || 'PEMIMPIN INOVATIF & BERDEDIKASI',
                            },
                          },
                        ],
                      },
                    },

                    // Tengah: Potret Besar Tokoh (ANTI-KEPOTONG: 360px tall, top center)
                    {
                      type: 'div',
                      props: {
                        style: {
                          width: '320px',
                          height: '360px',
                          borderRadius: '160px 160px 0 0',
                          overflow: 'hidden',
                          border: '4px solid #0F172A',
                          backgroundColor: '#E2E8F0',
                          boxShadow: '0 12px 28px rgba(0,0,0,0.2)',
                          display: 'flex',
                          alignItems: 'flex-start',
                          justifyContent: 'center',
                        },
                        children: [
                          subjectPhotoDataUri
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
                                    fontSize: '36px',
                                    color: textDark,
                                  },
                                  children: 'PORTRAIT',
                                },
                              },
                        ],
                      },
                    },

                    // Kanan: Kartu Frosted Deskripsi Kiprah
                    {
                      type: 'div',
                      props: {
                        style: {
                          width: '280px',
                          backgroundColor: 'rgba(255,255,255,0.92)',
                          border: '2px solid #CBD5E1',
                          borderRadius: '14px',
                          padding: '18px',
                          boxShadow: '0 6px 18px rgba(0,0,0,0.1)',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '8px',
                        },
                        children: [
                          {
                            type: 'span',
                            props: {
                              style: { fontSize: '13.5px', fontWeight: 900, color: textDark, textTransform: 'uppercase', letterSpacing: '0.5px' },
                              children: 'REKAM KIPRAH & DEDIKASI',
                            },
                          },
                          {
                            type: 'span',
                            props: {
                              style: { fontSize: '12px', lineHeight: 1.45, color: '#334155' },
                              children: bioSummary,
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

        // =====================================================================
        // BAGIAN BAWAH: LINIMASA GELAP HORISONTAL (Height ~300px)
        // =====================================================================
        {
          type: 'div',
          props: {
            style: {
              backgroundColor: darkTimeline,
              color: '#FFFFFF',
              padding: '24px 36px',
              display: 'flex',
              flexDirection: 'column',
              gap: '14px',
            },
            children: [
              // Garis Hubung & 4 Titik Balik
              {
                type: 'div',
                props: {
                  style: { display: 'flex', flexDirection: 'row', justifyContent: 'space-between', gap: '16px' },
                  children: milestones.map((m, idx) => ({
                    type: 'div',
                    props: {
                      style: {
                        flex: 1,
                        display: 'flex',
                        flexDirection: 'column',
                        borderTop: '2px solid rgba(255,255,255,0.3)',
                        paddingTop: '10px',
                        position: 'relative',
                      },
                      children: [
                        {
                          type: 'span',
                          props: {
                            style: { fontSize: '13px', fontWeight: 900, color: '#38BDF8', letterSpacing: '1px' },
                            children: m.year,
                          },
                        },
                        {
                          type: 'span',
                          props: {
                            style: { fontSize: '13.5px', fontWeight: 800, color: '#FFFFFF', marginTop: '4px', lineHeight: 1.25 },
                            children: m.title,
                          },
                        },
                        {
                          type: 'span',
                          props: {
                            style: { fontSize: '11.5px', color: '#94A3B8', marginTop: '4px', lineHeight: 1.35 },
                            children: m.desc,
                          },
                        },
                      ],
                    },
                  })),
                },
              },

              // Baris Penutup & QR Code
              {
                type: 'div',
                props: {
                  style: {
                    display: 'flex',
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    borderTop: '1px solid rgba(255,255,255,0.15)',
                    paddingTop: '10px',
                  },
                  children: [
                    {
                      type: 'span',
                      props: {
                        style: { fontSize: '12px', color: '#94A3B8', letterSpacing: '0.5px' },
                        children: `Dokumentasi Resmi Advokasi Kebijakan // ${memberName || 'Anggota Dewan'}`,
                      },
                    },
                    qrCodeDataUri
                      ? {
                          type: 'img',
                          props: {
                            src: qrCodeDataUri,
                            style: { width: '48px', height: '48px', backgroundColor: '#FFFFFF', padding: '2px', borderRadius: '3px' },
                          },
                        }
                      : null,
                  ].filter(Boolean),
                },
              },
            ],
          },
        },
      ],
    },
  };
}
