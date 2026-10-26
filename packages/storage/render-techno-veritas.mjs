import fs from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';
import satori from 'satori';
import QRCode from 'qrcode';

async function main() {
  console.log('=== RENDERING HIGH-FIDELITY EDITORIAL BROADSHEET POSTER (TECHNO VERITAS REPLICATION) ===');
  const canvasWidth = 1080;
  const canvasHeight = 1650;

  // Left & right column widths
  const leftColWidth = 270;
  const centerColWidth = 540;
  const rightColWidth = 270;

  // 1. Generate QR Code
  console.log('[1/7] Generating QR code for emergency aid portal...');
  const qrCodeDataUrl = await QRCode.toDataURL('https://polaris.gov.id/tanggap-bencana/kebakaran-oktober-2026', {
    width: 140,
    margin: 1,
    color: {
      dark: '#111827',
      light: '#FAF8F5',
    },
  });

  // 2. Load Fonts
  console.log('[2/7] Loading typography fonts...');
  const [anton, bebas, jakarta, dejavuSerif, dejavuSerifBold] = await Promise.all([
    fs.readFile('../../assets/fonts/Anton-Regular.ttf'),
    fs.readFile('../../assets/fonts/BebasNeue-Regular.ttf'),
    fs.readFile('../../assets/fonts/PlusJakartaSans-SemiBold.ttf'),
    fs.readFile('/usr/share/fonts/truetype/dejavu/DejaVuSerif.ttf'),
    fs.readFile('/usr/share/fonts/truetype/dejavu/DejaVuSerif-Bold.ttf'),
  ]);

  const fonts = [
    { name: 'Anton', data: anton, weight: 400, style: 'normal' },
    { name: 'Bebas Neue', data: bebas, weight: 400, style: 'normal' },
    { name: 'Plus Jakarta Sans', data: jakarta, weight: 600, style: 'normal' },
    { name: 'DejaVu Serif', data: dejavuSerif, weight: 400, style: 'normal' },
    { name: 'DejaVu Serif', data: dejavuSerifBold, weight: 700, style: 'normal' },
  ];

  // 3. Prepare AI Raw Background and crops
  console.log('[3/7] Preparing central AI documentary photo & thumbnails...');
  const rawAiBuffer = await fs.readFile('../../uploads/fire_disaster_raw_ai.png');

  // Center photo covers canvas
  const centerPhotoBuffer = await sharp(rawAiBuffer)
    .resize(canvasWidth, canvasHeight, { fit: 'cover', position: 'center' })
    .png()
    .toBuffer();

  // Create thumbnail 1: cropped charred ruins
  const thumb1 = await sharp(rawAiBuffer)
    .extract({ left: 100, top: 400, width: 400, height: 260 })
    .resize(160, 100)
    .png()
    .toBuffer();
  const thumb1DataUrl = `data:image/png;base64,${thumb1.toString('base64')}`;

  // Create thumbnail 2: cropped fire equipment / embers
  const thumb2 = await sharp(rawAiBuffer)
    .extract({ left: 30, top: 1200, width: 400, height: 260 })
    .resize(160, 100)
    .png()
    .toBuffer();
  const thumb2DataUrl = `data:image/png;base64,${thumb2.toString('base64')}`;

  // 4. Generate Torn Paper SVG Overlay
  console.log('[4/7] Generating realistic torn paper wings...');

  // Left torn edge: stays around x ≈ 270 (from 264 to 276)
  function generateLeftTornPoints() {
    const points = [];
    const steps = 110;
    for (let i = 0; i <= steps; i++) {
      const y = Math.round((i / steps) * canvasHeight);
      const t = i / steps;
      // Gentle broadsheet curve
      const macro = 270 - 10 * Math.sin(t * Math.PI) + 6 * Math.sin(t * 3 * Math.PI);
      // High-frequency realistic paper fiber tear
      const micro = ((i * 37) % 9) - 4 + (((i * 17) % 5) - 2);
      const x = Math.round(macro + micro);
      points.push(`${x},${y}`);
    }
    return points;
  }

  // Right torn edge: stays around x ≈ 810 (from 804 to 816)
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

  const tornPaperSvg = `
  <svg width="${canvasWidth}" height="${canvasHeight}" viewBox="0 0 ${canvasWidth} ${canvasHeight}" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <!-- Shadow for left torn wing -->
      <filter id="shadowLeft" x="-10%" y="-5%" width="150%" height="110%">
        <feDropShadow dx="6" dy="1" stdDeviation="5" flood-color="#000000" flood-opacity="0.5" />
      </filter>
      <!-- Shadow for right torn wing -->
      <filter id="shadowRight" x="-30%" y="-5%" width="150%" height="110%">
        <feDropShadow dx="-6" dy="1" stdDeviation="5" flood-color="#000000" flood-opacity="0.5" />
      </filter>
      <!-- Subtle vintage newsprint paper gradient -->
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
      <!-- Bottom rich dark card gradient behind headline -->
      <linearGradient id="bottomDarkCard" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="#09090B" stop-opacity="0" />
        <stop offset="18%" stop-color="#09090B" stop-opacity="0.88" />
        <stop offset="40%" stop-color="#09090B" stop-opacity="0.99" />
        <stop offset="100%" stop-color="#060608" stop-opacity="1" />
      </linearGradient>
      <!-- Top subtle vignette behind masthead -->
      <linearGradient id="topDarkVignette" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="#000000" stop-opacity="0.85" />
        <stop offset="70%" stop-color="#000000" stop-opacity="0.45" />
        <stop offset="100%" stop-color="#000000" stop-opacity="0" />
      </linearGradient>
    </defs>

    <!-- Top dark vignette for masthead legibility -->
    <rect x="250" y="0" width="580" height="200" fill="url(#topDarkVignette)" />

    <!-- Bottom dark gradient card over center photo -->
    <rect x="250" y="1030" width="580" height="620" fill="url(#bottomDarkCard)" />

    <!-- Left Paper Wing with Drop Shadow -->
    <polygon points="${leftPolygonPoints}" fill="url(#paperGradLeft)" filter="url(#shadowLeft)" />
    <!-- Left Torn Fiber Highlight Lip -->
    <polyline points="${leftPoints.join(' ')}" fill="none" stroke="#FFFFFF" stroke-width="2.5" opacity="0.95" />

    <!-- Right Paper Wing with Drop Shadow -->
    <polygon points="${rightPolygonPoints}" fill="url(#paperGradRight)" filter="url(#shadowRight)" />
    <!-- Right Torn Fiber Highlight Lip -->
    <polyline points="${rightPoints.join(' ')}" fill="none" stroke="#FFFFFF" stroke-width="2.5" opacity="0.95" />
  </svg>
  `.trim();

  const tornPaperBuffer = Buffer.from(tornPaperSvg);

  // 5. Render Satori Vector Typography & Editorial Layout
  console.log('[5/7] Building Satori editorial tree with strict style-encapsulated props...');

  const satoriVNode = {
    type: 'div',
    props: {
      style: {
        width: `${canvasWidth}px`,
        height: `${canvasHeight}px`,
        display: 'flex',
        flexDirection: 'row',
        position: 'relative',
        fontFamily: 'Plus Jakarta Sans',
      },
      children: [
        // =====================================================================
        // COLUMN 1: LEFT EDITORIAL COLUMN (White Newsprint Wing, width 270px)
        // =====================================================================
        {
          type: 'div',
          props: {
            style: {
              width: `${leftColWidth}px`,
              height: `${canvasHeight}px`,
              display: 'flex',
              flexDirection: 'column',
              padding: '36px 18px 28px 24px',
              boxSizing: 'border-box',
              justifyContent: 'space-between',
            },
            children: [
              // Top Article Section
              {
                type: 'div',
                props: {
                  style: { display: 'flex', flexDirection: 'column' },
                  children: [
                    // Red category tag
                    {
                      type: 'div',
                      props: {
                        style: {
                          backgroundColor: '#DC2626',
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
                    // Kicker
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
                    // Main Story Title
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
                        children: 'BPBD dan Dinsos Dirikan Posko Terpadu serta Dapur Umum 24 Jam',
                      },
                    },
                    // Byline
                    {
                      type: 'span',
                      props: {
                        style: {
                          fontSize: '8.5px',
                          fontStyle: 'italic',
                          color: '#6B7280',
                          marginBottom: '10px',
                        },
                        children: 'oleh TIM JURNALISME WARGA // POLARIS',
                      },
                    },
                    // Paragraph 1
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
                        children:
                          'Pemerintah daerah bersama Badan Penanggulangan Bencana Daerah (BPBD) bergerak cepat mendirikan posko pengungsian terpadu dan posko logistik mandiri menyusul musibah kebakaran besar yang melanda kawasan permukiman padat.',
                      },
                    },
                    // Paragraph 2
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
                        children:
                          'Posko kesehatan darurat telah disiagakan untuk menangani warga lansia dan anak-anak yang mengalami sesak napas akibat paparan asap pekat. Bantuan logistik berupa selimut, air bersih, pakaian layak pakai, dan makanan siap santap mulai disalurkan secara bertahap.',
                      },
                    },
                    // Paragraph 3
                    {
                      type: 'p',
                      props: {
                        style: {
                          fontFamily: 'DejaVu Serif',
                          fontSize: '9.5px',
                          lineHeight: 1.4,
                          color: '#1F2937',
                          margin: '0',
                          textAlign: 'justify',
                        },
                        children:
                          'Kepala pelaksana penanggulangan bencana mengimbau seluruh elemen masyarakat dan relawan untuk berkoordinasi satu pintu agar alur evakuasi serta distribusi logistik tidak terhambat.',
                      },
                    },
                  ],
                },
              },

              // Bottom "POKOK ADVOKASI" (What's Inside) Box
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
                    // Badge Header
                    {
                      type: 'div',
                      props: {
                        style: {
                          backgroundColor: '#DC2626',
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
                        style: { display: 'flex', flexDirection: 'column', marginBottom: '12px' },
                        children: [
                          {
                            type: 'div',
                            props: {
                              style: { display: 'flex', alignItems: 'center', gap: '5px', marginBottom: '4px' },
                              children: [
                                {
                                  type: 'span',
                                  props: { style: { color: '#DC2626', fontSize: '11px' }, children: '▶' },
                                },
                                {
                                  type: 'span',
                                  props: {
                                    style: {
                                      fontFamily: 'DejaVu Serif',
                                      fontWeight: 700,
                                      fontSize: '10px',
                                      color: '#111827',
                                      lineHeight: 1.2,
                                    },
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
                                {
                                  type: 'img',
                                  props: {
                                    src: thumb1DataUrl,
                                    style: { width: '75px', height: '48px', objectFit: 'cover', borderRadius: '2px', border: '1px solid #D1D5DB' },
                                  },
                                },
                                {
                                  type: 'span',
                                  props: {
                                    style: {
                                      fontFamily: 'DejaVu Serif',
                                      fontSize: '8.5px',
                                      lineHeight: 1.35,
                                      color: '#4B5563',
                                    },
                                    children: 'Layanan jemput bola Dukcapil cetak ulang KTP, KK, dan ijazah sekolah gratis.',
                                  },
                                },
                              ],
                            },
                          },
                          {
                            type: 'span',
                            props: {
                              style: { fontSize: '8.5px', fontWeight: 700, color: '#6B7280', marginTop: '3px', letterSpacing: '0.05em' },
                              children: 'HALAMAN 2',
                            },
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
                                {
                                  type: 'span',
                                  props: { style: { color: '#DC2626', fontSize: '11px' }, children: '▶' },
                                },
                                {
                                  type: 'span',
                                  props: {
                                    style: {
                                      fontFamily: 'DejaVu Serif',
                                      fontWeight: 700,
                                      fontSize: '10px',
                                      color: '#111827',
                                      lineHeight: 1.2,
                                    },
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
                                {
                                  type: 'img',
                                  props: {
                                    src: thumb2DataUrl,
                                    style: { width: '75px', height: '48px', objectFit: 'cover', borderRadius: '2px', border: '1px solid #D1D5DB' },
                                  },
                                },
                                {
                                  type: 'span',
                                  props: {
                                    style: {
                                      fontFamily: 'DejaVu Serif',
                                      fontSize: '8.5px',
                                      lineHeight: 1.35,
                                      color: '#4B5563',
                                    },
                                    children: 'Evaluasi kesiapan hidran pemukiman dan pengadaan pompa portabel di setiap RW.',
                                  },
                                },
                              ],
                            },
                          },
                          {
                            type: 'span',
                            props: {
                              style: { fontSize: '8.5px', fontWeight: 700, color: '#6B7280', marginTop: '3px', letterSpacing: '0.05em' },
                              children: 'HALAMAN 4',
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
        // COLUMN 2: CENTER COLUMN (The Centerfold Window & Main Story, width 540px)
        // =====================================================================
        {
          type: 'div',
          props: {
            style: {
              width: `${centerColWidth}px`,
              height: `${canvasHeight}px`,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '24px 20px 32px 20px',
              boxSizing: 'border-box',
            },
            children: [
              // 1. TOP MASTHEAD & EMBLEM (Sitting over the dark sky & concentric heat rings)
              {
                type: 'div',
                props: {
                  style: {
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    marginTop: '4px',
                  },
                  children: [
                    // Classical Veritas Torch Emblem SVG
                    {
                      type: 'svg',
                      props: {
                        width: '42',
                        height: '42',
                        viewBox: '0 0 36 36',
                        fill: 'none',
                        style: { marginBottom: '4px' },
                        children: [
                          // Torch base & handle
                          {
                            type: 'path',
                            props: {
                              d: 'M16 18h4l-1 12h-2l-1-12z',
                              fill: '#FFFFFF',
                              stroke: '#F59E0B',
                              strokeWidth: '1',
                            },
                          },
                          // Torch bowl / cup
                          {
                            type: 'path',
                            props: {
                              d: 'M13 15h10l-2 4h-6l-2-4z',
                              fill: '#F59E0B',
                            },
                          },
                          // Radiant Flames
                          {
                            type: 'path',
                            props: {
                              d: 'M18 5c1 3-2 5-1 7 1-2 3-3 3-5 2 3 2 6-1 8 0-2-1-3-1-3s-1 1-1 3c-3-2-3-5-1-8 0 2 2 3 3 5-1-2-4-4-2-7z',
                              fill: '#EF4444',
                            },
                          },
                          // Laurel branch left
                          {
                            type: 'path',
                            props: {
                              d: 'M9 25c-3-5-1-12 5-16',
                              stroke: '#FFFFFF',
                              strokeWidth: '1.5',
                              strokeLinecap: 'round',
                            },
                          },
                          // Laurel branch right
                          {
                            type: 'path',
                            props: {
                              d: 'M27 25c3-5 1-12-5-16',
                              stroke: '#FFFFFF',
                              strokeWidth: '1.5',
                              strokeLinecap: 'round',
                            },
                          },
                        ],
                      },
                    },
                    // Masthead Title: POLARIS VERITAS
                    {
                      type: 'div',
                      props: {
                        style: { display: 'flex', flexDirection: 'row', alignItems: 'center', gap: '8px' },
                        children: [
                          {
                            type: 'span',
                            props: {
                              style: {
                                fontFamily: 'DejaVu Serif',
                                fontWeight: 700,
                                fontSize: '30px',
                                letterSpacing: '0.04em',
                                color: '#FFFFFF',
                              },
                              children: 'POLARIS',
                            },
                          },
                          {
                            type: 'span',
                            props: {
                              style: {
                                fontFamily: 'DejaVu Serif',
                                fontWeight: 700,
                                fontSize: '30px',
                                letterSpacing: '0.04em',
                                color: '#EF4444',
                              },
                              children: 'VERITAS',
                            },
                          },
                        ],
                      },
                    },
                    // Dateline text
                    {
                      type: 'span',
                      props: {
                        style: {
                          fontSize: '9.5px',
                          color: '#E5E7EB',
                          letterSpacing: '0.06em',
                          marginTop: '2px',
                        },
                        children: 'Publikasi Advokasi Kebijakan & Kemanusiaan | Vol. 1 Edisi 1 | OKTOBER 2026',
                      },
                    },
                  ],
                },
              },

              // 2. BOTTOM HERO HEADLINE CARD (Sitting over the solid black gradient)
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
                    // Giant Condensed Red Headline: MALAM JAGO MERAH
                    {
                      type: 'span',
                      props: {
                        style: {
                          fontFamily: 'Bebas Neue',
                          fontSize: '70px',
                          lineHeight: 0.95,
                          letterSpacing: '0.03em',
                          color: '#EF4444',
                          textAlign: 'center',
                          marginBottom: '6px',
                        },
                        children: 'MALAM JAGO MERAH',
                      },
                    },
                    // Subtitle
                    {
                      type: 'span',
                      props: {
                        style: {
                          fontFamily: 'DejaVu Serif',
                          fontWeight: 700,
                          fontSize: '16px',
                          lineHeight: 1.25,
                          color: '#FFFFFF',
                          textAlign: 'center',
                          marginBottom: '6px',
                          maxWidth: '480px',
                        },
                        children: 'Kebakaran Landa Pemukiman Padat; Ribuan Jiwa Kehilangan Tempat Tinggal',
                      },
                    },
                    // Red Divider
                    {
                      type: 'div',
                      props: {
                        style: {
                          width: '60px',
                          height: '2px',
                          backgroundColor: '#DC2626',
                          marginBottom: '8px',
                        },
                      },
                    },
                    // Byline
                    {
                      type: 'span',
                      props: {
                        style: {
                          fontSize: '9.5px',
                          color: '#9CA3AF',
                          letterSpacing: '0.08em',
                          marginBottom: '8px',
                          fontWeight: 600,
                        },
                        children: 'LAPORAN INVESTIGASI // TIM REDAKSI POLARIS',
                      },
                    },
                    // Lead paragraph
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
                        children:
                          'Kobaran api dahsyat melahap permukiman padat warga pada Selasa malam pukul 21:45 WIB. Sebanyak 28 unit armada pemadam dikerahkan menembus lorong gang sempit untuk menyelamatkan ratusan keluarga yang terperangkap.',
                      },
                    },
                    // Continue Button Pill
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

        // =====================================================================
        // COLUMN 3: RIGHT EDITORIAL COLUMN (White Newsprint Wing, width 270px)
        // =====================================================================
        {
          type: 'div',
          props: {
            style: {
              width: `${rightColWidth}px`,
              height: `${canvasHeight}px`,
              display: 'flex',
              flexDirection: 'column',
              padding: '36px 24px 28px 18px',
              boxSizing: 'border-box',
              justifyContent: 'space-between',
            },
            children: [
              // Top QR Code & Instruction Block
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
                    {
                      type: 'img',
                      props: {
                        src: qrCodeDataUrl,
                        style: {
                          width: '68px',
                          height: '68px',
                          borderRadius: '3px',
                          border: '1px solid #E5E7EB',
                        },
                      },
                    },
                    {
                      type: 'span',
                      props: {
                        style: {
                          fontFamily: 'DejaVu Serif',
                          fontSize: '8.5px',
                          lineHeight: 1.35,
                          color: '#374151',
                          flex: 1,
                        },
                        children: 'Pindai barcode untuk akses peta posko evakuasi, kebutuhan logistik mendesak, dan nomor darurat keluarga.',
                      },
                    },
                  ],
                },
              },

              // Middle: Circular Data Badges & Infographics
              {
                type: 'div',
                props: {
                  style: {
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '12px',
                    margin: '6px 0',
                  },
                  children: [
                    // Small section title
                    {
                      type: 'span',
                      props: {
                        style: {
                          fontSize: '8.5px',
                          fontWeight: 700,
                          color: '#6B7280',
                          letterSpacing: '0.08em',
                          alignSelf: 'flex-start',
                          marginBottom: '2px',
                        },
                        children: 'DATA & STATISTIK LAPANGAN',
                      },
                    },

                    // Badge 1 (120+ RUMAH)
                    {
                      type: 'div',
                      props: {
                        style: {
                          width: '105px',
                          height: '105px',
                          borderRadius: '53px',
                          border: '2.5px solid #DC2626',
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
                          {
                            type: 'span',
                            props: { style: { fontSize: '8.5px', color: '#DC2626', fontWeight: 700 }, children: 'Setidaknya' },
                          },
                          {
                            type: 'span',
                            props: {
                              style: {
                                fontFamily: 'Bebas Neue',
                                fontSize: '38px',
                                lineHeight: 0.9,
                                color: '#DC2626',
                              },
                              children: '120+',
                            },
                          },
                          {
                            type: 'span',
                            props: {
                              style: { fontSize: '7px', color: '#4B5563', textAlign: 'center', lineHeight: 1.15 },
                              children: 'rumah hangus terbakar dalam waktu 3 jam.',
                            },
                          },
                        ],
                      },
                    },

                    // Badge 2 (28 UNIT DAMKAR with "DALAM ANGKA" Pill)
                    {
                      type: 'div',
                      props: {
                        style: {
                          display: 'flex',
                          flexDirection: 'row',
                          alignItems: 'center',
                          gap: '8px',
                          width: '100%',
                        },
                        children: [
                          {
                            type: 'div',
                            props: {
                              style: {
                                width: '74px',
                                height: '74px',
                                borderRadius: '37px',
                                backgroundColor: '#DC2626',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: '#FFFFFF',
                                boxShadow: '0 4px 10px rgba(220, 38, 38, 0.25)',
                                flexShrink: 0,
                              },
                              children: [
                                {
                                  type: 'span',
                                  props: {
                                    style: {
                                      fontFamily: 'Bebas Neue',
                                      fontSize: '26px',
                                      lineHeight: 0.9,
                                    },
                                    children: '28',
                                  },
                                },
                                {
                                  type: 'span',
                                  props: {
                                    style: { fontSize: '7.5px', fontWeight: 700, letterSpacing: '0.04em' },
                                    children: 'UNIT DAMKAR',
                                  },
                                },
                              ],
                            },
                          },
                          {
                            type: 'div',
                            props: {
                              style: { display: 'flex', flexDirection: 'column', flex: 1 },
                              children: [
                                {
                                  type: 'span',
                                  props: {
                                    style: {
                                      fontSize: '7.5px',
                                      fontWeight: 700,
                                      color: '#DC2626',
                                      letterSpacing: '0.08em',
                                      marginBottom: '2px',
                                    },
                                    children: 'DALAM ANGKA',
                                  },
                                },
                                {
                                  type: 'span',
                                  props: {
                                    style: {
                                      fontFamily: 'DejaVu Serif',
                                      fontSize: '8.5px',
                                      lineHeight: 1.3,
                                      color: '#1F2937',
                                    },
                                    children: 'Data Posko Lapangan: 28 unit mobil pemadam dan 150 personel relawan dikerahkan.',
                                  },
                                },
                              ],
                            },
                          },
                        ],
                      },
                    },

                    // Badge 3 (1.450+ PENGUNGSI)
                    {
                      type: 'div',
                      props: {
                        style: {
                          width: '105px',
                          height: '105px',
                          borderRadius: '53px',
                          border: '2.5px solid #DC2626',
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
                          {
                            type: 'span',
                            props: { style: { fontSize: '8.5px', color: '#DC2626', fontWeight: 700 }, children: 'Lebih dari' },
                          },
                          {
                            type: 'span',
                            props: {
                              style: {
                                fontFamily: 'Bebas Neue',
                                fontSize: '34px',
                                lineHeight: 0.9,
                                color: '#DC2626',
                              },
                              children: '1.450',
                            },
                          },
                          {
                            type: 'span',
                            props: {
                              style: { fontSize: '7px', color: '#4B5563', textAlign: 'center', lineHeight: 1.15 },
                              children: 'jiwa warga kini berada di posko darurat.',
                            },
                          },
                        ],
                      },
                    },
                  ],
                },
              },

              // Bottom Policy Column Article
              {
                type: 'div',
                props: {
                  style: {
                    display: 'flex',
                    flexDirection: 'column',
                    borderTop: '2px solid #111827',
                    paddingTop: '10px',
                  },
                  children: [
                    // Red category pill
                    {
                      type: 'div',
                      props: {
                        style: {
                          backgroundColor: '#DC2626',
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
                    // Kicker
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
                        children: 'EVALUASI TATA RUANG',
                      },
                    },
                    // Headline
                    {
                      type: 'span',
                      props: {
                        style: {
                          fontFamily: 'DejaVu Serif',
                          fontWeight: 700,
                          fontSize: '14px',
                          lineHeight: 1.25,
                          color: '#111827',
                          marginBottom: '5px',
                        },
                        children: 'Kaji Ulang Proteksi Api dan Jalur Hidran di Pemukiman Padat',
                      },
                    },
                    // Byline
                    {
                      type: 'span',
                      props: {
                        style: {
                          fontSize: '8.5px',
                          fontStyle: 'italic',
                          color: '#6B7280',
                          marginBottom: '6px',
                        },
                        children: 'oleh TIM ADVOKASI KEBIJAKAN POLARIS',
                      },
                    },
                    // Body text
                    {
                      type: 'p',
                      props: {
                        style: {
                          fontFamily: 'DejaVu Serif',
                          fontSize: '9px',
                          lineHeight: 1.38,
                          color: '#1F2937',
                          margin: '0',
                          textAlign: 'justify',
                        },
                        children:
                          'Inspeksi menemukan 70% hidran terdekat tidak memiliki debit air memadai. Pemerintah daerah didesak mempercepat pengadaan pompa air mandiri bertekanan tinggi di tiap RW serta membuka koridor steril evakuasi darurat.',
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
  };

  const typographySvgString = await satori(satoriVNode, {
    width: canvasWidth,
    height: canvasHeight,
    fonts,
  });

  const typographyBuffer = Buffer.from(typographySvgString);

  // 6. Composite Layers with Sharp
  console.log('[6/7] Compositing all layers (Base AI Photo + Torn Paper Wings + Satori Typography)...');
  const composed = await sharp(centerPhotoBuffer)
    .composite([
      { input: tornPaperBuffer, top: 0, left: 0 },
      { input: typographyBuffer, top: 0, left: 0 },
    ])
    .png({ quality: 95, compressionLevel: 8 })
    .toBuffer();

  // 7. Save outputs
  console.log('[7/7] Writing output files to uploads and artifacts...');
  const outPathWSL = '../../uploads/poster_techno_veritas_kebakaran.png';
  await fs.writeFile(outPathWSL, composed);

  const outArtifactPath = '/mnt/c/Users/PC/.gemini/antigravity-ide/brain/20183ae9-093f-4958-af8d-9d39f692ed3c/poster_techno_veritas_kebakaran.png';
  try {
    await fs.writeFile(outArtifactPath, composed);
  } catch (err) {
    console.warn('Could not write directly to WSL mnt path:', err.message);
  }

  const meta = await sharp(composed).metadata();
  console.log('=== RENDER SUCCESSFUL! ===');
  console.log(`Saved to: ${outPathWSL}`);
  console.log(`Dimensions: ${meta.width}x${meta.height}px, Size: ${(composed.length / 1024).toFixed(1)} KB`);
}

main().catch((err) => {
  console.error('[FATAL COMPOSITING ERROR]:', err);
  process.exit(1);
});
