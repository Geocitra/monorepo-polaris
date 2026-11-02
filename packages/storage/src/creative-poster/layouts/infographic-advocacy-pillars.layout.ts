import { SynthesizedEditorialCopy } from '../types.js';
import {
  wordSafeHeadlineTruncate,
  smartSentenceClamp,
} from '../core/adaptive-typography.js';

export interface InfographicAdvocacyPillarsLayoutProps {
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
  backgroundDataUri?: string;
  qrCodeDataUri?: string;
}

/**
 * Layout Infografis 04: ADVOKASI DATA & 5 PILAR AKSI (Inspirasi Template PUTUS)
 * Struktur Visual 1:1:
 * - Top Headline: Judul Pop Bold Berwarna Kontras (Merah Bata / Oranye Tua)
 * - Baris Data:
 *   1. Kartu Stat Persentase Besar (e.g. 8,4% / Target Utama)
 *   2. Kartu Definisi / Fakta Tengah
 *   3. Kartu Faktor / Penyebab Masalah
 * - Area Tengah: Visual Warga / Foto Dokumentasi Isu
 * - Baris Bawah: 5 Pilar Kapsul Vertikal (P - U - T - U - S atau 5 Aksi Solutif)
 *   Masing-masing pilar memiliki huruf inisial bulat, judul aksi tebal, dan keterangan
 * - Sudut Kanan: Badge QR Code Sumber / Referensi
 */
export function buildInfographicAdvocacyPillarsLayout(params: InfographicAdvocacyPillarsLayoutProps): any {
  const {
    width,
    height,
    headline,
    quote,
    copy,
    memberName,
    memberTitle,
    editionTag,
    primaryAccent = '#2E7D32',
    secondaryAccent = '#D97706',
    subjectPhotoDataUri,
    croppedThumbnails = {},
    backgroundDataUri,
    qrCodeDataUri,
  } = params;

  const bgBase = '#B45309';
  const greenPillar = primaryAccent || '#2E7D32';
  const amberAccent = secondaryAccent || '#D97706';

  const rawTitle = (copy.mainBannerTitle || headline || 'MISKIN DI NEGERI KAYA').toUpperCase();
  const displayTitle = wordSafeHeadlineTruncate(rawTitle, 36);

  // Data Statistik
  const statVal = copy.statCircles?.[0]?.value || '8,4%';
  const statDesc = copy.statCircles?.[0]?.description || 'Warga terdampak langsung membutuhkan intervensi kebijakan prioritas.';

  const defHeader = copy.blocks?.['definition']?.header || 'FOKUS MASALAH';
  const defBody = smartSentenceClamp(
    copy.blocks?.['definition']?.body || copy.mainBannerDefinitionBody || 'Keadaan di mana pemenuhan kebutuhan dasar warga terhambat oleh disparitas ekonomi dan keterbatasan akses publik.',
    130
  );

  const factorHeader = copy.blocks?.['factor']?.header || 'FAKTOR PENYEBAB';
  const factorBody = smartSentenceClamp(
    copy.blocks?.['factor']?.body || 'Tantangan lapangan mencakup keterbatasan lapangan kerja, beban hidup tinggi, serta tata kelola bansos yang belum optimal.',
    130
  );

  // 5 Pilar Aksi
  const pillarLetters = ['P', 'U', 'T', 'U', 'S'];
  const defaultPillars = [
    { letter: 'P', label: 'Peduli sesama', desc: 'Gotong royong warga' },
    { letter: 'U', label: 'Utamakan keadilan', desc: 'Bansos tepat sasaran' },
    { letter: 'T', label: 'Tolong warga rentan', desc: 'Pendampingan langsung' },
    { letter: 'U', label: 'Ubah hidup mandiri', desc: 'Pemberdayaan UMKM' },
    { letter: 'S', label: 'Satukan langkah aksi', desc: 'Kawal anggaran APBD' },
  ];

  const pillars = defaultPillars.map((p, idx) => {
    const slotKey = `pillar_${idx + 1}`;
    const block = copy.blocks?.[slotKey];
    return {
      letter: pillarLetters[idx] || `${idx + 1}`,
      label: block?.header || p.label,
      desc: block?.body ? smartSentenceClamp(block.body, 50) : p.desc,
    };
  });

  const heroPhoto = backgroundDataUri || croppedThumbnails['hero_photo'] || croppedThumbnails['thumb1'] || null;

  return {
    type: 'div',
    props: {
      style: {
        width: `${width}px`,
        height: `${height}px`,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        backgroundColor: bgBase,
        padding: '24px 28px',
        boxSizing: 'border-box',
        position: 'relative',
        fontFamily: 'Plus Jakarta Sans',
        overflow: 'hidden',
      },
      children: [
        // =====================================================================
        // HEADER ATAS
        // =====================================================================
        {
          type: 'div',
          props: {
            style: { display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' },
            children: [
              {
                type: 'span',
                props: {
                  style: {
                    fontFamily: 'Anton',
                    fontSize: '72px',
                    color: '#9E1B1E',
                    lineHeight: 1.0,
                    letterSpacing: '1.5px',
                    textShadow: '0 3px 0 #FFFFFF, 0 6px 12px rgba(0,0,0,0.3)',
                    textTransform: 'uppercase',
                  },
                  children: displayTitle,
                },
              },
              {
                type: 'div',
                props: {
                  style: {
                    display: 'flex',
                    flexDirection: 'row',
                    gap: '12px',
                    alignItems: 'center',
                    marginTop: '8px',
                  },
                  children: [
                    {
                      type: 'div',
                      props: {
                        style: {
                          backgroundColor: '#2E7D32',
                          color: '#FFFFFF',
                          padding: '4px 14px',
                          borderRadius: '14px',
                          fontSize: '13px',
                          fontWeight: 800,
                        },
                        children: '🔍 TAHUKAH ANDA?',
                      },
                    },
                    {
                      type: 'span',
                      props: {
                        style: { fontSize: '13px', color: '#FEF3C7', fontWeight: 800 },
                        children: editionTag || 'POLARIS CIVIC ADVOCACY',
                      },
                    },
                  ],
                },
              },
            ],
          },
        },

        // =====================================================================
        // BARIS DATA STATISTIK & FAKTOR
        // =====================================================================
        {
          type: 'div',
          props: {
            style: { display: 'flex', flexDirection: 'row', gap: '14px', margin: '10px 0' },
            children: [
              // Kartu 1: Persentase
              {
                type: 'div',
                props: {
                  style: {
                    width: '270px',
                    backgroundColor: '#FFFFFF',
                    borderRadius: '12px',
                    padding: '16px',
                    border: '3px solid #2E7D32',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    textAlign: 'center',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                  },
                  children: [
                    {
                      type: 'span',
                      props: {
                        style: { fontFamily: 'Anton', fontSize: '56px', color: '#2E7D32', lineHeight: 1.0 },
                        children: statVal,
                      },
                    },
                    {
                      type: 'span',
                      props: {
                        style: { fontSize: '12px', color: '#1F2937', fontWeight: 700, marginTop: '6px', lineHeight: 1.35 },
                        children: statDesc,
                      },
                    },
                  ],
                },
              },
              // Kartu 2: Definisi
              {
                type: 'div',
                props: {
                  style: {
                    flex: 1,
                    backgroundColor: '#2E7D32',
                    borderRadius: '12px',
                    padding: '14px 18px',
                    color: '#FFFFFF',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                  },
                  children: [
                    {
                      type: 'span',
                      props: {
                        style: { fontSize: '14px', fontWeight: 900, color: '#FEF3C7', marginBottom: '6px', textTransform: 'uppercase' },
                        children: defHeader,
                      },
                    },
                    {
                      type: 'span',
                      props: {
                        style: { fontSize: '12.5px', lineHeight: 1.4, color: '#FFFFFF' },
                        children: defBody,
                      },
                    },
                  ],
                },
              },
              // Kartu 3: Faktor Penyebab
              {
                type: 'div',
                props: {
                  style: {
                    flex: 1,
                    backgroundColor: '#2E7D32',
                    borderRadius: '12px',
                    padding: '14px 18px',
                    color: '#FFFFFF',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                  },
                  children: [
                    {
                      type: 'span',
                      props: {
                        style: { fontSize: '14px', fontWeight: 900, color: '#FEF3C7', marginBottom: '6px', textTransform: 'uppercase' },
                        children: factorHeader,
                      },
                    },
                    {
                      type: 'span',
                      props: {
                        style: { fontSize: '12.5px', lineHeight: 1.4, color: '#FFFFFF' },
                        children: factorBody,
                      },
                    },
                  ],
                },
              },
            ],
          },
        },

        // =====================================================================
        // AREA TENGAH: FOTO / ILUSTRASI DOKUMENTASI (Height ~420px)
        // =====================================================================
        {
          type: 'div',
          props: {
            style: {
              width: '100%',
              height: '420px',
              borderRadius: '16px',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'row',
              gap: '14px',
              margin: '8px 0',
            },
            children: [
              // Hero Photo
              {
                type: 'div',
                props: {
                  style: { flex: 1, height: '100%', borderRadius: '14px', overflow: 'hidden', position: 'relative' },
                  children: [
                    heroPhoto
                      ? {
                          type: 'img',
                          props: {
                            src: heroPhoto,
                            style: { width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top center' },
                          },
                        }
                      : subjectPhotoDataUri
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
                              backgroundColor: 'rgba(0,0,0,0.2)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              color: '#FFFFFF',
                              fontSize: '15px',
                              fontWeight: 700,
                            },
                            children: 'DOKUMENTASI WARGA & KEBIJAKAN LAPANGAN',
                          },
                        },
                  ],
                },
              },
              // QR Code Box Sumber
              {
                type: 'div',
                props: {
                  style: {
                    width: '180px',
                    height: '100%',
                    backgroundColor: '#FFFFFF',
                    borderRadius: '14px',
                    border: '3px solid #2E7D32',
                    padding: '14px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '10px',
                    textAlign: 'center',
                  },
                  children: [
                    {
                      type: 'div',
                      props: {
                        style: {
                          backgroundColor: '#2E7D32',
                          color: '#FFFFFF',
                          padding: '4px 12px',
                          borderRadius: '8px',
                          fontSize: '13px',
                          fontWeight: 800,
                        },
                        children: 'SUMBER RESMI',
                      },
                    },
                    qrCodeDataUri
                      ? {
                          type: 'img',
                          props: {
                            src: qrCodeDataUri,
                            style: { width: '120px', height: '120px', padding: '4px', backgroundColor: '#FFFFFF' },
                          },
                        }
                      : {
                          type: 'div',
                          props: { style: { width: '120px', height: '120px', backgroundColor: '#E5E7EB' } },
                        },
                    {
                      type: 'span',
                      props: {
                        style: { fontSize: '11px', color: '#4B5563', lineHeight: 1.3, fontWeight: 600 },
                        children: 'Pindai barcode untuk akses portal aspirasi & data anggaran resmi.',
                      },
                    },
                  ],
                },
              },
            ],
          },
        },

        // =====================================================================
        // BAGIAN BAWAH: 5 PILAR AKSI (P - U - T - U - S)
        // =====================================================================
        {
          type: 'div',
          props: {
            style: { display: 'flex', flexDirection: 'column', gap: '8px' },
            children: [
              {
                type: 'div',
                props: {
                  style: { display: 'flex', justifyContent: 'center' },
                  children: [
                    {
                      type: 'div',
                      props: {
                        style: {
                          backgroundColor: '#D97706',
                          color: '#FFFFFF',
                          padding: '6px 22px',
                          borderRadius: '18px',
                          fontSize: '14px',
                          fontWeight: 900,
                          letterSpacing: '0.05em',
                        },
                        children: 'MARI BERSAMA-SAMA PUTUS RANTAI PERSOALAN WARGA',
                      },
                    },
                  ],
                },
              },
              {
                type: 'div',
                props: {
                  style: { display: 'flex', flexDirection: 'row', gap: '10px', width: '100%' },
                  children: pillars.map((pl) => ({
                    type: 'div',
                    props: {
                      style: {
                        flex: 1,
                        backgroundColor: greenPillar,
                        border: '3px solid #FFFFFF',
                        borderRadius: '24px 24px 14px 14px',
                        padding: '12px 10px',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        textAlign: 'center',
                        color: '#FFFFFF',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
                      },
                      children: [
                        // Lingkaran Huruf Inisial
                        {
                          type: 'div',
                          props: {
                            style: {
                              width: '46px',
                              height: '46px',
                              borderRadius: '50%',
                              backgroundColor: '#FFFFFF',
                              color: '#9E1B1E',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontFamily: 'Anton',
                              fontSize: '28px',
                              fontWeight: 900,
                              marginBottom: '8px',
                              boxShadow: '0 2px 6px rgba(0,0,0,0.2)',
                            },
                            children: pl.letter,
                          },
                        },
                        // Label Aksi
                        {
                          type: 'span',
                          props: {
                            style: { fontSize: '13.5px', fontWeight: 800, color: '#FFFFFF', lineHeight: 1.25, marginBottom: '4px' },
                            children: pl.label,
                          },
                        },
                        // Deskripsi Singkat
                        {
                          type: 'span',
                          props: {
                            style: { fontSize: '11px', color: '#FEF3C7', lineHeight: 1.3 },
                            children: pl.desc,
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
      ],
    },
  };
}
