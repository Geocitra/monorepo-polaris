import { SynthesizedEditorialCopy } from '../types.js';

export interface TornPaperVeritasLayoutParams {
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
  qrCodeDataUri?: string;
}

/**
 * Menghasilkan Layer SVG Mask Sobekan Kertas (Torn Paper Wings)
 * Menyediakan tekstur robekan kertas kiri & kanan dengan serat putih dan bayangan lembut
 */
export function buildTornPaperWingsSvg(canvasWidth: number, canvasHeight: number): Buffer {
  function generateLeftTornPoints() {
    const points = [];
    const steps = 110;
    for (let i = 0; i <= steps; i++) {
      const y = Math.round((i / steps) * canvasHeight);
      const t = i / steps;
      const macro = 270 - 10 * Math.sin(t * Math.PI) + 6 * Math.sin(t * 3 * Math.PI);
      const micro = ((i * 37) % 9) - 4 + (((i * 17) % 5) - 2);
      const x = Math.round(macro + micro);
      points.push(`${x},${y}`);
    }
    return points;
  }

  function generateRightTornPoints() {
    const points = [];
    const steps = 110;
    for (let i = 0; i <= steps; i++) {
      const y = Math.round((i / steps) * canvasHeight);
      const t = i / steps;
      const macro = 810 + 10 * Math.sin(t * Math.PI) - 6 * Math.cos(t * 2 * Math.PI);
      const micro = ((i * 41) % 9) - 4 + (((i * 23) % 5) - 2);
      const x = Math.round(macro + micro);
      points.push(`${x},${y}`);
    }
    return points;
  }

  const leftPoints = generateLeftTornPoints();
  const rightPoints = generateRightTornPoints();

  const leftPolygonPoints = `0,0 ${leftPoints.join(' ')} 0,${canvasHeight}`;
  const rightPolygonPoints = `${canvasWidth},0 ${rightPoints.join(' ')} ${canvasWidth},${canvasHeight}`;

  const darkTopHeight = Math.round(canvasHeight * 0.12);
  const darkBottomTop = Math.round(canvasHeight * 0.62);
  const darkBottomHeight = canvasHeight - darkBottomTop;

  const svg = `
  <svg width="${canvasWidth}" height="${canvasHeight}" viewBox="0 0 ${canvasWidth} ${canvasHeight}" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <filter id="shadowLeft" x="-10%" y="-5%" width="150%" height="110%">
        <feDropShadow dx="6" dy="1" stdDeviation="5" flood-color="#000000" flood-opacity="0.5" />
      </filter>
      <filter id="shadowRight" x="-30%" y="-5%" width="150%" height="110%">
        <feDropShadow dx="-6" dy="1" stdDeviation="5" flood-color="#000000" flood-opacity="0.5" />
      </filter>
      <linearGradient id="paperGradLeft" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stop-color="#FCFAF6" />
        <stop offset="85%" stop-color="#F8F5EE" />
        <stop offset="100%" stop-color="#EFEBE0" />
      </linearGradient>
      <linearGradient id="paperGradRight" x1="100%" y1="0%" x2="0%" y2="0%">
        <stop offset="0%" stop-color="#FCFAF6" />
        <stop offset="85%" stop-color="#F8F5EE" />
        <stop offset="100%" stop-color="#EFEBE0" />
      </linearGradient>
      <linearGradient id="bottomDarkCard" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="#09090B" stop-opacity="0" />
        <stop offset="18%" stop-color="#09090B" stop-opacity="0.88" />
        <stop offset="40%" stop-color="#09090B" stop-opacity="0.99" />
        <stop offset="100%" stop-color="#060608" stop-opacity="1" />
      </linearGradient>
      <linearGradient id="topDarkVignette" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="#000000" stop-opacity="0.85" />
        <stop offset="70%" stop-color="#000000" stop-opacity="0.45" />
        <stop offset="100%" stop-color="#000000" stop-opacity="0" />
      </linearGradient>
    </defs>

    <!-- Top dark vignette for masthead legibility -->
    <rect x="250" y="0" width="${canvasWidth - 500}" height="${darkTopHeight}" fill="url(#topDarkVignette)" />

    <!-- Bottom dark gradient card over center photo -->
    <rect x="250" y="${darkBottomTop}" width="${canvasWidth - 500}" height="${darkBottomHeight}" fill="url(#bottomDarkCard)" />

    <!-- Left Paper Wing with Drop Shadow -->
    <polygon points="${leftPolygonPoints}" fill="url(#paperGradLeft)" filter="url(#shadowLeft)" />
    <polyline points="${leftPoints.join(' ')}" fill="none" stroke="#FFFFFF" stroke-width="2.5" opacity="0.95" />

    <!-- Right Paper Wing with Drop Shadow -->
    <polygon points="${rightPolygonPoints}" fill="url(#paperGradRight)" filter="url(#shadowRight)" />
    <polyline points="${rightPoints.join(' ')}" fill="none" stroke="#FFFFFF" stroke-width="2.5" opacity="0.95" />
  </svg>
  `.trim();

  return Buffer.from(svg);
}

/**
 * Layout 1: TORN_PAPER_VERITAS (Inspirasi: Techno Veritas / Night of Tremors / Malam Jago Merah)
 */
export function buildTornPaperVeritasLayout(params: TornPaperVeritasLayoutParams): any {
  const {
    width,
    height,
    headline,
    copy,
    memberName,
    memberTitle,
    editionTag,
    primaryAccent,
    croppedThumbnails = {},
    qrCodeDataUri,
  } = params;

  const leftColW = Math.round(width * 0.25);
  const centerColW = Math.round(width * 0.50);
  const rightColW = width - leftColW - centerColW;

  const displayTitle = (copy.mainBannerTitle || headline || 'MALAM JAGO MERAH').toUpperCase();
  const displaySub = copy.mainBannerSubheader || 'Kebakaran Landa Pemukiman Padat; Ribuan Jiwa Kehilangan Tempat Tinggal';
  const displayBody =
    copy.mainBannerDefinitionBody ||
    'Kobaran api dahsyat melahap permukiman padat warga pada Selasa malam. Sebanyak 28 unit armada pemadam dikerahkan menembus lorong gang sempit untuk menyelamatkan ratusan keluarga yang terperangkap.';

  const stats = copy.statCircles && copy.statCircles.length >= 3
    ? copy.statCircles
    : [
        { topLabel: 'Setidaknya', value: '120+', description: 'rumah hangus terbakar dalam waktu 3 jam.' },
        { topLabel: 'Armada Siaga', value: '28', description: 'Data Posko Lapangan: 28 unit armada pemadam dikerahkan.' },
        { topLabel: 'Lebih dari', value: '1.450', description: 'jiwa warga kini berada di posko darurat.' },
      ];

  const leftNews = copy.blocks?.['left_positive'] || {
    header: 'BPBD dan Dinsos Dirikan Posko Terpadu serta Dapur Umum 24 Jam',
    body: 'Pemerintah daerah bersama Badan Penanggulangan Bencana Daerah (BPBD) bergerak cepat mendirikan posko pengungsian terpadu dan posko logistik mandiri menyusul musibah kebakaran besar yang melanda kawasan permukiman padat.',
  };

  const rightPolicy = copy.blocks?.['right_cause'] || {
    header: 'Kaji Ulang Proteksi Api dan Jalur Hidran di Pemukiman Padat',
    body: 'Inspeksi menemukan 70% hidran terdekat tidak memiliki debit air memadai. Pemerintah daerah didesak mempercepat pengadaan pompa air mandiri bertekanan tinggi di tiap RW serta membuka koridor steril evakuasi darurat.',
  };

  return {
    type: 'div',
    props: {
      style: {
        width: `${width}px`,
        height: `${height}px`,
        display: 'flex',
        flexDirection: 'row',
        position: 'relative',
        fontFamily: 'Plus Jakarta Sans',
      },
      children: [
        // ===================================================================
        // KOLOM 1: KIRI (Koran Berita Daerah + Pokok Advokasi)
        // ===================================================================
        {
          type: 'div',
          props: {
            style: {
              width: `${leftColW}px`,
              height: `${height}px`,
              display: 'flex',
              flexDirection: 'column',
              padding: '36px 18px 28px 24px',
              boxSizing: 'border-box',
              justifyContent: 'space-between',
            },
            children: [
              {
                type: 'div',
                props: {
                  style: { display: 'flex', flexDirection: 'column' },
                  children: [
                    {
                      type: 'div',
                      props: {
                        style: {
                          backgroundColor: primaryAccent,
                          color: '#FFFFFF',
                          fontSize: '10px',
                          fontWeight: 700,
                          letterSpacing: '0.08em',
                          padding: '3px 7px',
                          alignSelf: 'flex-start',
                          marginBottom: '8px',
                          borderRadius: '2px',
                        },
                        children: 'BERITA DAERAH',
                      },
                    },
                    {
                      type: 'span',
                      props: {
                        style: {
                          fontSize: '10.5px',
                          fontWeight: 700,
                          color: '#374151',
                          letterSpacing: '0.05em',
                          marginBottom: '4px',
                        },
                        children: 'TANGGAP DARURAT BENCANA',
                      },
                    },
                    {
                      type: 'span',
                      props: {
                        style: {
                          fontFamily: 'DejaVu Serif',
                          fontWeight: 700,
                          fontSize: '15px',
                          lineHeight: 1.25,
                          color: '#111827',
                          marginBottom: '6px',
                        },
                        children: leftNews.header,
                      },
                    },
                    {
                      type: 'span',
                      props: {
                        style: {
                          fontSize: '8.5px',
                          fontStyle: 'italic',
                          color: '#6B7280',
                          marginBottom: '10px',
                        },
                        children: `oleh TIM JURNALISME WARGA // ${memberName.slice(0, 15)}`,
                      },
                    },
                    {
                      type: 'p',
                      props: {
                        style: {
                          fontFamily: 'DejaVu Serif',
                          fontSize: '9.5px',
                          lineHeight: 1.4,
                          color: '#1F2937',
                          margin: '0 0 8px 0',
                          textAlign: 'justify',
                        },
                        children: leftNews.body,
                      },
                    },
                  ],
                },
              },

              // POKOK ADVOKASI
              {
                type: 'div',
                props: {
                  style: {
                    display: 'flex',
                    flexDirection: 'column',
                    borderTop: '2px solid #111827',
                    paddingTop: '10px',
                    marginTop: '8px',
                  },
                  children: [
                    {
                      type: 'div',
                      props: {
                        style: {
                          backgroundColor: primaryAccent,
                          color: '#FFFFFF',
                          fontSize: '10px',
                          fontWeight: 700,
                          letterSpacing: '0.08em',
                          padding: '3px 8px',
                          alignSelf: 'flex-start',
                          marginBottom: '10px',
                        },
                        children: 'POKOK ADVOKASI',
                      },
                    },
                    // Teaser 1
                    {
                      type: 'div',
                      props: {
                        style: { display: 'flex', flexDirection: 'column', marginBottom: '10px' },
                        children: [
                          {
                            type: 'div',
                            props: {
                              style: { display: 'flex', alignItems: 'center', gap: '5px', marginBottom: '4px' },
                              children: [
                                { type: 'span', props: { style: { color: primaryAccent, fontSize: '11px' }, children: '▶' } },
                                {
                                  type: 'span',
                                  props: {
                                    fontFamily: 'DejaVu Serif',
                                    style: { fontWeight: 700, fontSize: '10px', color: '#111827', lineHeight: 1.2 },
                                    children: 'Pemulihan Dokumen Warga Terdampak',
                                  },
                                },
                              ],
                            },
                          },
                          {
                            type: 'div',
                            props: {
                              style: { display: 'flex', gap: '8px', alignItems: 'center' },
                              children: [
                                ...(croppedThumbnails.thumb1
                                  ? [
                                      {
                                        type: 'img',
                                        props: {
                                          src: croppedThumbnails.thumb1,
                                          style: { width: '75px', height: '48px', objectFit: 'cover', borderRadius: '2px', border: '1px solid #D1D5DB' },
                                        },
                                      },
                                    ]
                                  : []),
                                {
                                  type: 'span',
                                  props: {
                                    fontFamily: 'DejaVu Serif',
                                    style: { fontSize: '8.5px', lineHeight: 1.35, color: '#4B5563' },
                                    children: 'Layanan jemput bola Dukcapil cetak ulang KTP, KK, dan ijazah sekolah gratis.',
                                  },
                                },
                              ],
                            },
                          },
                          {
                            type: 'span',
                            props: { style: { fontSize: '8.5px', fontWeight: 700, color: '#6B7280', marginTop: '3px', letterSpacing: '0.05em' }, children: 'HALAMAN 2' },
                          },
                        ],
                      },
                    },
                    // Teaser 2
                    {
                      type: 'div',
                      props: {
                        style: { display: 'flex', flexDirection: 'column' },
                        children: [
                          {
                            type: 'div',
                            props: {
                              style: { display: 'flex', alignItems: 'center', gap: '5px', marginBottom: '4px' },
                              children: [
                                { type: 'span', props: { style: { color: primaryAccent, fontSize: '11px' }, children: '▶' } },
                                {
                                  type: 'span',
                                  props: {
                                    fontFamily: 'DejaVu Serif',
                                    style: { fontWeight: 700, fontSize: '10px', color: '#111827', lineHeight: 1.2 },
                                    children: 'Audit Instalasi Hidran & Gang Sempit',
                                  },
                                },
                              ],
                            },
                          },
                          {
                            type: 'div',
                            props: {
                              style: { display: 'flex', gap: '8px', alignItems: 'center' },
                              children: [
                                ...(croppedThumbnails.thumb2
                                  ? [
                                      {
                                        type: 'img',
                                        props: {
                                          src: croppedThumbnails.thumb2,
                                          style: { width: '75px', height: '48px', objectFit: 'cover', borderRadius: '2px', border: '1px solid #D1D5DB' },
                                        },
                                      },
                                    ]
                                  : []),
                                {
                                  type: 'span',
                                  props: {
                                    fontFamily: 'DejaVu Serif',
                                    style: { fontSize: '8.5px', lineHeight: 1.35, color: '#4B5563' },
                                    children: 'Evaluasi kesiapan hidran pemukiman dan pengadaan pompa portabel di setiap RW.',
                                  },
                                },
                              ],
                            },
                          },
                          {
                            type: 'span',
                            props: { style: { fontSize: '8.5px', fontWeight: 700, color: '#6B7280', marginTop: '3px', letterSpacing: '0.05em' }, children: 'HALAMAN 4' },
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
        // KOLOM 2: TENGAH (Bukaan Robekan Foto + Masthead + Judul Raksasa)
        // ===================================================================
        {
          type: 'div',
          props: {
            style: {
              width: `${centerColW}px`,
              height: `${height}px`,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '24px 20px 32px 20px',
              boxSizing: 'border-box',
            },
            children: [
              // Top Masthead
              {
                type: 'div',
                props: {
                  style: { display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: '4px' },
                  children: [
                    // Torch & Laurel Emblem
                    {
                      type: 'svg',
                      props: {
                        width: '40',
                        height: '40',
                        viewBox: '0 0 36 36',
                        fill: 'none',
                        style: { marginBottom: '4px' },
                        children: [
                          { type: 'path', props: { d: 'M16 18h4l-1 12h-2l-1-12z', fill: '#FFFFFF', stroke: '#F59E0B', strokeWidth: '1' } },
                          { type: 'path', props: { d: 'M13 15h10l-2 4h-6l-2-4z', fill: '#F59E0B' } },
                          { type: 'path', props: { d: 'M18 5c1 3-2 5-1 7 1-2 3-3 3-5 2 3 2 6-1 8 0-2-1-3-1-3s-1 1-1 3c-3-2-3-5-1-8 0 2 2 3 3 5-1-2-4-4-2-7z', fill: primaryAccent } },
                          { type: 'path', props: { d: 'M9 25c-3-5-1-12 5-16', stroke: '#FFFFFF', strokeWidth: '1.5', strokeLinecap: 'round' } },
                          { type: 'path', props: { d: 'M27 25c3-5 1-12-5-16', stroke: '#FFFFFF', strokeWidth: '1.5', strokeLinecap: 'round' } },
                        ],
                      },
                    },
                    // Title POLARIS VERITAS
                    {
                      type: 'div',
                      props: {
                        style: { display: 'flex', flexDirection: 'row', alignItems: 'center', gap: '8px' },
                        children: [
                          {
                            type: 'span',
                            props: {
                              style: { fontFamily: 'DejaVu Serif', fontWeight: 700, fontSize: '30px', letterSpacing: '0.04em', color: '#FFFFFF' },
                              children: 'POLARIS',
                            },
                          },
                          {
                            type: 'span',
                            props: {
                              style: { fontFamily: 'DejaVu Serif', fontWeight: 700, fontSize: '30px', letterSpacing: '0.04em', color: primaryAccent },
                              children: 'VERITAS',
                            },
                          },
                        ],
                      },
                    },
                    // Dateline
                    {
                      type: 'span',
                      props: {
                        style: { fontSize: '9.5px', color: '#E5E7EB', letterSpacing: '0.06em', marginTop: '2px' },
                        children: editionTag || 'Publikasi Advokasi Kebijakan & Kemanusiaan | Vol. 1 Edisi 1 | OKTOBER 2026',
                      },
                    },
                  ],
                },
              },

              // Bottom Headline Block
              {
                type: 'div',
                props: {
                  style: {
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    width: '100%',
                    padding: '0 16px',
                    boxSizing: 'border-box',
                    textAlign: 'center',
                  },
                  children: [
                    {
                      type: 'span',
                      props: {
                        style: {
                          fontFamily: 'Bebas Neue',
                          fontSize: '68px',
                          lineHeight: 0.95,
                          letterSpacing: '0.03em',
                          color: primaryAccent,
                          textAlign: 'center',
                          marginBottom: '6px',
                        },
                        children: displayTitle,
                      },
                    },
                    {
                      type: 'span',
                      props: {
                        style: {
                          fontFamily: 'DejaVu Serif',
                          fontWeight: 700,
                          fontSize: '15px',
                          lineHeight: 1.25,
                          color: '#FFFFFF',
                          textAlign: 'center',
                          marginBottom: '6px',
                          maxWidth: '480px',
                        },
                        children: displaySub,
                      },
                    },
                    {
                      type: 'div',
                      props: {
                        style: { width: '60px', height: '2px', backgroundColor: primaryAccent, marginBottom: '8px' },
                      },
                    },
                    {
                      type: 'span',
                      props: {
                        style: { fontSize: '9.5px', color: '#9CA3AF', letterSpacing: '0.08em', marginBottom: '8px', fontWeight: 600 },
                        children: `LAPORAN INVESTIGASI // ${memberName.toUpperCase()}`,
                      },
                    },
                    {
                      type: 'p',
                      props: {
                        style: {
                          fontFamily: 'DejaVu Serif',
                          fontSize: '11px',
                          lineHeight: 1.45,
                          color: '#E5E7EB',
                          textAlign: 'justify',
                          margin: '0 0 14px 0',
                          padding: '0 8px',
                          maxWidth: '470px',
                        },
                        children: displayBody,
                      },
                    },
                    {
                      type: 'div',
                      props: {
                        style: {
                          backgroundColor: '#FFFFFF',
                          color: '#09090B',
                          borderRadius: '20px',
                          padding: '7px 22px',
                          fontSize: '10.5px',
                          fontWeight: 700,
                          letterSpacing: '0.08em',
                          display: 'flex',
                          alignItems: 'center',
                          boxShadow: '0 4px 12px rgba(0,0,0,0.4)',
                        },
                        children: 'LANJUT KE HALAMAN 2 ▶',
                      },
                    },
                  ],
                },
              },
            ],
          },
        },

        // ===================================================================
        // KOLOM 3: KANAN (Infografik Lingkaran + Kolom Kebijakan)
        // ===================================================================
        {
          type: 'div',
          props: {
            style: {
              width: `${rightColW}px`,
              height: `${height}px`,
              display: 'flex',
              flexDirection: 'column',
              padding: '36px 24px 28px 18px',
              boxSizing: 'border-box',
              justifyContent: 'space-between',
            },
            children: [
              // QR Code
              {
                type: 'div',
                props: {
                  style: {
                    display: 'flex',
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: '10px',
                    borderBottom: '1px solid #D1D5DB',
                    paddingBottom: '14px',
                  },
                  children: [
                    ...(qrCodeDataUri
                      ? [
                          {
                            type: 'img',
                            props: {
                              src: qrCodeDataUri,
                              style: { width: '64px', height: '64px', borderRadius: '3px', border: '1px solid #E5E7EB' },
                            },
                          },
                        ]
                      : []),
                    {
                      type: 'span',
                      props: {
                        fontFamily: 'DejaVu Serif',
                        style: { fontSize: '8.5px', lineHeight: 1.35, color: '#374151', flex: 1 },
                        children: 'Pindai barcode untuk akses peta posko terpadu, logistik mendesak, dan nomor darurat keluarga.',
                      },
                    },
                  ],
                },
              },

              // 3 Circular Badges
              {
                type: 'div',
                props: {
                  style: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', margin: '6px 0' },
                  children: [
                    {
                      type: 'span',
                      props: {
                        style: { fontSize: '8.5px', fontWeight: 700, color: '#6B7280', letterSpacing: '0.08em', alignSelf: 'flex-start' },
                        children: 'DATA & STATISTIK LAPANGAN',
                      },
                    },
                    // Badge 1
                    {
                      type: 'div',
                      props: {
                        style: {
                          width: '100px',
                          height: '100px',
                          borderRadius: '50px',
                          border: `2.5px solid ${primaryAccent}`,
                          backgroundColor: '#FFFFFF',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          justifyContent: 'center',
                          padding: '6px',
                          boxShadow: '0 4px 10px rgba(0,0,0,0.06)',
                          boxSizing: 'border-box',
                        },
                        children: [
                          { type: 'span', props: { style: { fontSize: '8.5px', color: primaryAccent, fontWeight: 700 }, children: stats[0]?.topLabel || 'Setidaknya' } },
                          { type: 'span', props: { style: { fontFamily: 'Bebas Neue', fontSize: '36px', lineHeight: 0.9, color: primaryAccent }, children: stats[0]?.value || '120+' } },
                          { type: 'span', props: { style: { fontSize: '7px', color: '#4B5563', textAlign: 'center', lineHeight: 1.15 }, children: stats[0]?.description || 'titik terdampak.' } },
                        ],
                      },
                    },
                    // Badge 2
                    {
                      type: 'div',
                      props: {
                        style: { display: 'flex', flexDirection: 'row', alignItems: 'center', gap: '8px', width: '100%' },
                        children: [
                          {
                            type: 'div',
                            props: {
                              style: {
                                width: '70px',
                                height: '70px',
                                borderRadius: '35px',
                                backgroundColor: primaryAccent,
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: '#FFFFFF',
                                boxShadow: '0 4px 10px rgba(220, 38, 38, 0.25)',
                                flexShrink: 0,
                              },
                              children: [
                                { type: 'span', props: { style: { fontFamily: 'Bebas Neue', fontSize: '24px', lineHeight: 0.9 }, children: stats[1]?.value || '28' } },
                                { type: 'span', props: { style: { fontSize: '7px', fontWeight: 700, letterSpacing: '0.04em' }, children: stats[1]?.topLabel || 'UNIT DAMKAR' } },
                              ],
                            },
                          },
                          {
                            type: 'div',
                            props: {
                              style: { display: 'flex', flexDirection: 'column', flex: 1 },
                              children: [
                                { type: 'span', props: { style: { fontSize: '7.5px', fontWeight: 700, color: primaryAccent, letterSpacing: '0.08em', marginBottom: '2px' }, children: 'DALAM ANGKA' } },
                                { type: 'span', props: { style: { fontFamily: 'DejaVu Serif', fontSize: '8.5px', lineHeight: 1.3, color: '#1F2937' }, children: stats[1]?.description || 'personel siaga.' } },
                              ],
                            },
                          },
                        ],
                      },
                    },
                    // Badge 3
                    {
                      type: 'div',
                      props: {
                        style: {
                          width: '100px',
                          height: '100px',
                          borderRadius: '50px',
                          border: `2.5px solid ${primaryAccent}`,
                          backgroundColor: '#FFFFFF',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          justifyContent: 'center',
                          padding: '6px',
                          boxShadow: '0 4px 10px rgba(0,0,0,0.06)',
                          boxSizing: 'border-box',
                        },
                        children: [
                          { type: 'span', props: { style: { fontSize: '8.5px', color: primaryAccent, fontWeight: 700 }, children: stats[2]?.topLabel || 'Lebih dari' } },
                          { type: 'span', props: { style: { fontFamily: 'Bebas Neue', fontSize: '32px', lineHeight: 0.9, color: primaryAccent }, children: stats[2]?.value || '1.450' } },
                          { type: 'span', props: { style: { fontSize: '7px', color: '#4B5563', textAlign: 'center', lineHeight: 1.15 }, children: stats[2]?.description || 'warga di posko.' } },
                        ],
                      },
                    },
                  ],
                },
              },

              // Bottom Policy Story
              {
                type: 'div',
                props: {
                  style: { display: 'flex', flexDirection: 'column', borderTop: '2px solid #111827', paddingTop: '10px' },
                  children: [
                    {
                      type: 'div',
                      props: {
                        style: {
                          backgroundColor: primaryAccent,
                          color: '#FFFFFF',
                          fontSize: '10px',
                          fontWeight: 700,
                          letterSpacing: '0.08em',
                          padding: '3px 7px',
                          alignSelf: 'flex-start',
                          marginBottom: '6px',
                          borderRadius: '2px',
                        },
                        children: 'KOLOM KEBIJAKAN',
                      },
                    },
                    {
                      type: 'span',
                      props: { style: { fontSize: '10.5px', fontWeight: 700, color: '#374151', letterSpacing: '0.05em', marginBottom: '4px' }, children: 'EVALUASI TATA RUANG' },
                    },
                    {
                      type: 'span',
                      props: { style: { fontFamily: 'DejaVu Serif', fontWeight: 700, fontSize: '14px', lineHeight: 1.25, color: '#111827', marginBottom: '5px' }, children: rightPolicy.header },
                    },
                    {
                      type: 'span',
                      props: { style: { fontSize: '8.5px', fontStyle: 'italic', color: '#6B7280', marginBottom: '6px' }, children: `oleh TIM ADVOKASI // ${memberTitle}` },
                    },
                    {
                      type: 'p',
                      props: { style: { fontFamily: 'DejaVu Serif', fontSize: '9px', lineHeight: 1.38, color: '#1F2937', margin: '0', textAlign: 'justify' }, children: rightPolicy.body },
                    },
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
