import { SynthesizedEditorialCopy } from '../types.js';
import {
  wordSafeHeadlineTruncate,
  smartSentenceClamp,
} from '../core/adaptive-typography.js';
import { RADIAL_CLOCK_ASSETS } from './radial-clock-assets.js';

export interface InfographicRadialClockLayoutProps {
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
 * Pemecah kalimat cerdas untuk menghasilkan butir peluru (bullet points)
 * yang padat, bernas, dan tuntas tanpa ellipsis menggantung.
 */
function extractEpochBullets(rawText: string, fallbackBullets: string[], maxBullets = 3): string[] {
  if (!rawText) return fallbackBullets.slice(0, maxBullets);

  // 1. Jika teks dipisahkan oleh bullet atau enter
  const lines = rawText
    .split(/[\n\r]+|[•\-\*]\s+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 15);

  if (lines.length >= maxBullets) {
    return lines.slice(0, maxBullets).map((s) => smartSentenceClamp(s, 110));
  }

  // 2. Jika satu paragraf utuh, pecah berdasarkan kalimat (titik)
  const sentences = rawText
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 15);

  if (sentences.length >= maxBullets) {
    return sentences.slice(0, maxBullets).map((s) => smartSentenceClamp(s, 110));
  } else if (sentences.length > 0) {
    const res = sentences.map((s) => smartSentenceClamp(s, 105));
    while (res.length < maxBullets && fallbackBullets[res.length]) {
      res.push(fallbackBullets[res.length]!);
    }
    return res.slice(0, maxBullets);
  }

  return fallbackBullets.slice(0, maxBullets);
}

/**
 * INFOGRAPHIC_RADIAL_CLOCK (Jam Melingkar Kronik Historis)
 * 100% Exact 1:1 Reproduction of the iconic Philippine PANITIKAN historical chronicle infographic.
 *
 * Distinctive Architecture:
 * 1. Left Vertical Banner Column ('P A N I T I K A N' style) with antique drop-cap, faint map contour, & open book.
 * 2. Antique Pocket Watch Dial with Roman Numerals (I to XII) and filigree Victorian clock hands.
 * 3. 6 Curved Arc Badges (Katutubo, Kastila, Himagsikan, Amerikano, Hapon, Kasalukuyan).
 * 4. Sector 4 Warm Peach / Tan Wedge Background (#F5E8D8) with leatherbound book stack & folded news.
 * 5. Authentic Cutout Collages: Traditional Dancer, Rizal Statue with Megaphone callout, Red Crowd & Flag Patriots,
 *    Japanese WW2 Soldiers, Rizal Monument Obelisk, and Broken Handcuffs with Calligraphic Motto.
 */
export function buildInfographicRadialClockLayout({
  width,
  height,
  headline,
  quote,
  copy,
  memberName,
  memberTitle,
  editionTag,
  primaryAccent = '#78350F',
  secondaryAccent = '#1D4ED8',
  subjectPhotoDataUri,
  croppedThumbnails = {},
  qrCodeDataUri,
}: InfographicRadialClockLayoutProps): any {
  // Palet Warna Vintage Otentik 1:1
  const parchmentBg = '#FAF6EE';
  const bronzeBorder = '#6B421E';
  const bronzeFrame = '#C5A059';
  const textDark = '#1C1917';
  const textMuted = '#475569';

  // Penentuan Judul Vertikal Kolom Kiri
  const rawTitle = (copy.mainBannerTitle || headline || 'PANITIKAN').replace(/[^a-zA-Z0-9]/g, '');
  const verticalTitle = rawTitle.length >= 4 ? rawTitle.toUpperCase() : 'PANITIKAN';
  const letters = verticalTitle.split('');

  // Fallback Data 6 Sektor Historis
  const defaultEpoch1Bullets = [
    'Pasalita (oral tradition, alaala at bibig)',
    'Pampanitikan at panrelihiyon (kaugnay ng ritwal at paniniwala)',
    'Kolektibo at komunal (gabay sa buhay at pagkakaisa)',
  ];
  const defaultEpoch2Bullets = [
    'Panitikan → sandata sa Kristiyanismo at kolonisasyon',
    'Pinalitan ang Baybayin → Alpabetong Romano',
    'Katutubong anyo → naging maka-relihiyon at didaktiko',
  ];
  const defaultEpoch3Bullets = [
    'Nag-udyok ng damdaming makabayan, puno ng tapang at diwa ng nasyonalismo',
    'Nakatuon sa pagkakaisa at paglaban sa kolonyalismo',
    'Ginamit ang sariling wika para maunawaan ng masa',
  ];
  const defaultEpoch4Bullets = [
    'Pagpapakilala ng pampublikong edukasyon (Ingles bilang midyum)',
    'Pahayagan & magasin (Philippine Free Press, Liwayway)',
    'Umusbong: nobela, tula, maikling kwento (Tagalog & Ingles)',
  ];
  const defaultEpoch5Bullets = [
    'Pagsuspinde ng Ingles bilang wika ng panitikan.',
    'Wikang Tagalog at iba pang katutubong wika ang ginamit sa panitikan.',
    'Pagtutok sa maikling kwento at tula sapagkat madaling ipalimbag at basahin.',
  ];
  const defaultEpoch6Bullets = [
    'Panitikan bilang salamin ng kasaysayan at lipunan',
    'Mula sa mithiin ng kalayaan naging boses laban sa katiwalian, kahirapan, at pang-aabuso.',
  ];

  // Sektor 1: Katutubo
  const sector1 = {
    title: (copy.blocks?.['epoch_1']?.header || 'KATUTUBO').toUpperCase(),
    period: 'BAGO ANG 1521',
    color: '#6D28D9',
    bullets: extractEpochBullets(copy.blocks?.['epoch_1']?.body || '', defaultEpoch1Bullets, 3),
  };

  // Sektor 2: Kastila
  const sector2 = {
    title: (copy.blocks?.['epoch_2']?.header || 'KASTILA').toUpperCase(),
    period: '1565–1898',
    color: '#15803D',
    bullets: extractEpochBullets(copy.blocks?.['epoch_2']?.body || '', defaultEpoch2Bullets, 3),
  };

  // Sektor 3: Himagsikan
  const sector3 = {
    title: (copy.blocks?.['epoch_3']?.header || 'HIMAGSIKAN').toUpperCase(),
    period: '1896–1898',
    color: '#0284C7',
    bullets: extractEpochBullets(copy.blocks?.['epoch_3']?.body || '', defaultEpoch3Bullets, 3),
  };

  // Sektor 4: Amerikano
  const sector4 = {
    title: (copy.blocks?.['epoch_4']?.header || 'AMERIKANO').toUpperCase(),
    period: '1898–1946',
    color: '#EA580C',
    bullets: extractEpochBullets(copy.blocks?.['epoch_4']?.body || '', defaultEpoch4Bullets, 3),
  };

  // Sektor 5: Hapon
  const sector5 = {
    title: (copy.blocks?.['epoch_5']?.header || 'HAPON').toUpperCase(),
    period: '1942–1945',
    color: '#DC2626',
    bullets: extractEpochBullets(copy.blocks?.['epoch_5']?.body || '', defaultEpoch5Bullets, 3),
  };

  // Sektor 6: Kasalukuyan
  const sector6 = {
    title: (copy.blocks?.['epoch_6']?.header || 'KASALUKUYAN').toUpperCase(),
    period: '1946–2026',
    color: '#1E293B',
    bullets: extractEpochBullets(copy.blocks?.['epoch_6']?.body || '', defaultEpoch6Bullets, 2),
  };

  // Visual Assets Otentik 1:1
  const photoTradition = croppedThumbnails['clock_tradition_custom'] || RADIAL_CLOCK_ASSETS.dancer;
  const photoStatue = croppedThumbnails['clock_statue_custom'] || RADIAL_CLOCK_ASSETS.statue;
  const photoAction = croppedThumbnails['clock_action_custom'] || RADIAL_CLOCK_ASSETS.flag_patriots;
  const photoBooks = croppedThumbnails['clock_books_custom'] || RADIAL_CLOCK_ASSETS.book_stack;
  const photoSoldiers = croppedThumbnails['clock_soldiers_custom'] || RADIAL_CLOCK_ASSETS.soldiers;
  const photoMonument = croppedThumbnails['clock_monument_custom'] || RADIAL_CLOCK_ASSETS.monument;
  const photoCrowdRed = RADIAL_CLOCK_ASSETS.crowd_red;
  const photoTheNews = RADIAL_CLOCK_ASSETS.the_news;
  const photoMegaphone = RADIAL_CLOCK_ASSETS.megaphone;
  const photoBrokenChains = RADIAL_CLOCK_ASSETS.broken_chains;
  const photoOpenBook = RADIAL_CLOCK_ASSETS.open_book;
  const photoScroll = RADIAL_CLOCK_ASSETS.declaration_scroll;

  // 12 Angka Romawi Antik (Center: 147.5, 147.5; radius: 104px)
  const romanNumerals = [
    { num: 'XII', x: 147.5, y: 58, size: '20px' },
    { num: 'I', x: 200, y: 72, size: '17px' },
    { num: 'II', x: 236, y: 108, size: '17px' },
    { num: 'III', x: 250, y: 147.5, size: '18px' },
    { num: 'IV', x: 236, y: 187, size: '16.5px' },
    { num: 'V', x: 200, y: 223, size: '17px' },
    { num: 'VI', x: 147.5, y: 237, size: '20px' },
    { num: 'VII', x: 95, y: 223, size: '16.5px' },
    { num: 'VIII', x: 59, y: 187, size: '15.5px' },
    { num: 'IX', x: 45, y: 147.5, size: '18px' },
    { num: 'X', x: 59, y: 108, size: '17px' },
    { num: 'XI', x: 95, y: 72, size: '16.5px' },
  ];

  return {
    type: 'div',
    props: {
      style: {
        width: `${width}px`,
        height: `${height}px`,
        backgroundColor: parchmentBg,
        boxSizing: 'border-box',
        position: 'relative',
        fontFamily: 'Plus Jakarta Sans',
        overflow: 'hidden',
        border: `7px solid ${bronzeBorder}`,
        display: 'flex',
      },
      children: [
        // =====================================================================
        // LAYER 1: FRAME VINTAGE INTERIOR & GARIS TEPI GANDA
        // =====================================================================
        {
          type: 'div',
          props: {
            style: {
              position: 'absolute',
              top: '8px',
              left: '8px',
              right: '8px',
              bottom: '8px',
              border: `1.5px solid ${bronzeFrame}`,
              pointerEvents: 'none',
              boxSizing: 'border-box',
            },
          },
        },

        // =====================================================================
        // LAYER 2: DIAGONAL WEDGES & DIVIDER LINES (Sektor 2, 3, 4, 5)
        // =====================================================================
        // 2A: Soft Green Wedge Sektor 2
        {
          type: 'div',
          props: {
            style: {
              position: 'absolute',
              top: '8px',
              right: '8px',
              width: '600px',
              height: '350px',
              backgroundColor: '#EFF6EE',
              opacity: 0.65,
              pointerEvents: 'none',
            },
          },
        },

        // 2B: Diagonal Divider Lines
        {
          type: 'svg',
          props: {
            width: '1080',
            height: '1350',
            viewBox: '0 0 1080 1350',
            style: { position: 'absolute', top: '0', left: '0', pointerEvents: 'none' },
            children: [
              // Garis Pembatas Sektor 2 -> Sektor 3
              {
                type: 'line',
                props: {
                  x1: '450',
                  y1: '450',
                  x2: '1072',
                  y2: '260',
                  stroke: '#A8734A',
                  strokeWidth: '2.5',
                },
              },
              // Garis Pembatas Sektor 3 -> Sektor 4
              {
                type: 'line',
                props: {
                  x1: '425',
                  y1: '640',
                  x2: '1072',
                  y2: '640',
                  stroke: '#A8734A',
                  strokeWidth: '2.5',
                },
              },
              // Garis Pembatas Sektor 4 -> Sektor 5
              {
                type: 'line',
                props: {
                  x1: '375',
                  y1: '780',
                  x2: '1072',
                  y2: '890',
                  stroke: '#A8734A',
                  strokeWidth: '2.5',
                },
              },
            ],
          },
        },

        // 2C: WARM PEACH / TAN TINTED WEDGE SEKTOR 4 (AMERIKANO)
        {
          type: 'div',
          props: {
            style: {
              position: 'absolute',
              top: '642px',
              left: '425px',
              right: '8px',
              height: '246px',
              backgroundColor: '#F5E8D8',
              boxSizing: 'border-box',
              pointerEvents: 'none',
            },
          },
        },

        // =====================================================================
        // LAYER 3: KOLOM JUDUL VERTIKAL 'PANITIKAN' (KIRI)
        // =====================================================================
        {
          type: 'div',
          props: {
            style: {
              position: 'absolute',
              top: '8px',
              left: '8px',
              width: '138px',
              bottom: '8px',
              backgroundColor: '#F3EDE2',
              borderRight: `2.5px solid ${bronzeBorder}`,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              boxSizing: 'border-box',
              padding: '10px 4px',
              zIndex: 10,
            },
            children: [
              // Garis Kontur Peta Arsip Kepulauan di Belakang Huruf
              {
                type: 'svg',
                props: {
                  width: '138',
                  height: '1180',
                  viewBox: '0 0 138 1180',
                  style: { position: 'absolute', top: '10px', left: '0', pointerEvents: 'none' },
                  children: [
                    {
                      type: 'path',
                      props: {
                        d: 'M 25 150 Q 80 110 115 180 T 90 310 T 125 430 T 70 570 T 110 710 T 60 850 T 100 1000',
                        fill: 'none',
                        stroke: '#C5A059',
                        strokeWidth: '1.5',
                        strokeDasharray: '3 3',
                        opacity: 0.65,
                      },
                    },
                  ],
                },
              },

              // Container Huruf Vertikal
              {
                type: 'div',
                props: {
                  style: {
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    width: '100%',
                    flex: 1,
                    paddingTop: '16px',
                    paddingBottom: '6px',
                  },
                  children: [
                    // Huruf Pertama: Ornate Drop-Cap (P)
                    {
                      type: 'div',
                      props: {
                        style: {
                          width: '78px',
                          height: '92px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          position: 'relative',
                        },
                        children: [
                          {
                            type: 'span',
                            props: {
                              children: letters[0] || 'P',
                              style: {
                                fontFamily: 'Plus Jakarta Sans',
                                fontSize: '84px',
                                fontWeight: 900,
                                color: '#FFFFFF',
                                textShadow: '3px 4px 0px #4A2E16, -2px -2px 0px #C5A059, 2px 2px 8px rgba(0,0,0,0.5)',
                                lineHeight: 1,
                              },
                            },
                          },
                        ],
                      },
                    },

                    // Sisa Huruf Vertikal (A, N, I, T, I, K, A, N)
                    ...letters.slice(1).map((char) => ({
                      type: 'div',
                      props: {
                        style: {
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          height: '70px',
                        },
                        children: [
                          {
                            type: 'span',
                            props: {
                              children: char,
                              style: {
                                fontFamily: 'Plus Jakarta Sans',
                                fontSize: '64px',
                                fontWeight: 900,
                                color: '#FFFFFF',
                                textShadow: '2.5px 3.5px 0px #4A2E16, -1.5px -1.5px 0px #C5A059, 1px 1px 6px rgba(0,0,0,0.4)',
                                lineHeight: 1,
                              },
                            },
                          },
                        ],
                      },
                    })),
                  ],
                },
              },

              // Visual Open Book Antik di Bawah Huruf Terakhir
              {
                type: 'div',
                props: {
                  style: {
                    width: '126px',
                    height: '66px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: '8px',
                  },
                  children: [
                    {
                      type: 'img',
                      props: {
                        src: photoOpenBook,
                        style: { width: '100%', height: '100%', objectFit: 'contain' },
                      },
                    },
                  ],
                },
              },
            ],
          },
        },

        // =====================================================================
        // LAYER 4: JAM SAKU KLASIK & 6 ARC PERIMETER TABS
        // =====================================================================
        // 4A: Crown Ring Gantungan Jam di Atas (Jam 12)
        {
          type: 'div',
          props: {
            style: {
              position: 'absolute',
              top: '488px',
              left: '260px',
              width: '46px',
              height: '38px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 14,
            },
            children: [
              {
                type: 'svg',
                props: {
                  width: '46',
                  height: '38',
                  viewBox: '0 0 46 38',
                  children: [
                    {
                      type: 'circle',
                      props: {
                        cx: '23',
                        cy: '17',
                        r: '13',
                        fill: 'none',
                        stroke: '#8C5523',
                        strokeWidth: '4.5',
                      },
                    },
                    {
                      type: 'rect',
                      props: {
                        x: '17',
                        y: '27',
                        width: '12',
                        height: '11',
                        fill: '#8C5523',
                        rx: '2',
                      },
                    },
                  ],
                },
              },
            ],
          },
        },

        // 4B: Piringan Jam Saku (Dial Face)
        {
          type: 'div',
          props: {
            style: {
              position: 'absolute',
              top: '520px',
              left: '135px',
              width: '295px',
              height: '295px',
              borderRadius: '50%',
              backgroundColor: '#FDFBF7',
              border: '9px solid #8C5523',
              boxShadow: '0 10px 25px rgba(60,35,15,0.35)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 15,
            },
            children: [
              // Cincin Bezel Internal Ganda
              {
                type: 'div',
                props: {
                  style: {
                    position: 'absolute',
                    top: '6px',
                    left: '6px',
                    right: '6px',
                    bottom: '6px',
                    borderRadius: '50%',
                    border: '1.5px solid #C5A059',
                  },
                },
              },
              {
                type: 'div',
                props: {
                  style: {
                    position: 'absolute',
                    top: '12px',
                    left: '12px',
                    right: '12px',
                    bottom: '12px',
                    borderRadius: '50%',
                    border: '1px solid #DFCC9F',
                  },
                },
              },

              // 12 Angka Romawi Antik
              ...romanNumerals.map((r) => ({
                type: 'div',
                props: {
                  style: {
                    position: 'absolute',
                    left: `${r.x}px`,
                    top: `${r.y}px`,
                    transform: 'translate(-50%, -50%)',
                    fontFamily: 'Plus Jakarta Sans',
                    fontSize: r.size,
                    fontWeight: 800,
                    color: '#2A1A0A',
                    lineHeight: 1,
                  },
                  children: [r.num],
                },
              })),

              // Jarum Jam Ornate Victorian
              {
                type: 'svg',
                props: {
                  width: '295',
                  height: '295',
                  viewBox: '0 0 295 295',
                  style: { position: 'absolute', top: '0', left: '0' },
                  children: [
                    // Jarum Jam Pendek (Menunjuk ke ~2:15)
                    {
                      type: 'line',
                      props: {
                        x1: '147.5',
                        y1: '147.5',
                        x2: '206',
                        y2: '124',
                        stroke: '#2A1A0A',
                        strokeWidth: '4.8',
                        strokeLinecap: 'round',
                      },
                    },
                    // Jarum Menit Panjang (Menunjuk ke ~4:25)
                    {
                      type: 'line',
                      props: {
                        x1: '147.5',
                        y1: '147.5',
                        x2: '222',
                        y2: '201',
                        stroke: '#2A1A0A',
                        strokeWidth: '3.4',
                        strokeLinecap: 'round',
                      },
                    },
                    // Poros Pivot Pusat Jam
                    {
                      type: 'circle',
                      props: {
                        cx: '147.5',
                        cy: '147.5',
                        r: '8',
                        fill: '#C5A059',
                        stroke: '#2A1A0A',
                        strokeWidth: '2.5',
                      },
                    },
                  ],
                },
              },
            ],
          },
        },

        // 4C: 6 Arc Perimeter Badges
        // Tab 1: Katutubo
        {
          type: 'div',
          props: {
            style: {
              position: 'absolute',
              top: '420px',
              left: '345px',
              width: '145px',
              height: '42px',
              backgroundColor: sector1.color,
              borderRadius: '21px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 3px 8px rgba(0,0,0,0.25)',
              zIndex: 16,
              padding: '2px 8px',
            },
            children: [
              {
                type: 'span',
                props: {
                  children: sector1.period,
                  style: { fontSize: '9px', fontWeight: 700, color: '#FEF08A', letterSpacing: '0.04em' },
                },
              },
              {
                type: 'span',
                props: {
                  children: sector1.title,
                  style: { fontSize: '13px', fontWeight: 900, color: '#FFFFFF', letterSpacing: '0.05em' },
                },
              },
            ],
          },
        },

        // Tab 2: Kastila
        {
          type: 'div',
          props: {
            style: {
              position: 'absolute',
              top: '490px',
              left: '400px',
              width: '145px',
              height: '42px',
              backgroundColor: sector2.color,
              borderRadius: '21px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 3px 8px rgba(0,0,0,0.25)',
              zIndex: 16,
              padding: '2px 8px',
            },
            children: [
              {
                type: 'span',
                props: {
                  children: sector2.period,
                  style: { fontSize: '9px', fontWeight: 700, color: '#FEF08A', letterSpacing: '0.04em' },
                },
              },
              {
                type: 'span',
                props: {
                  children: sector2.title,
                  style: { fontSize: '13px', fontWeight: 900, color: '#FFFFFF', letterSpacing: '0.05em' },
                },
              },
            ],
          },
        },

        // Tab 3: Himagsikan
        {
          type: 'div',
          props: {
            style: {
              position: 'absolute',
              top: '565px',
              left: '415px',
              width: '148px',
              height: '42px',
              backgroundColor: sector3.color,
              borderRadius: '21px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 3px 8px rgba(0,0,0,0.25)',
              zIndex: 16,
              padding: '2px 8px',
            },
            children: [
              {
                type: 'span',
                props: {
                  children: sector3.period,
                  style: { fontSize: '9px', fontWeight: 700, color: '#E0F2FE', letterSpacing: '0.04em' },
                },
              },
              {
                type: 'span',
                props: {
                  children: sector3.title,
                  style: { fontSize: '13px', fontWeight: 900, color: '#FFFFFF', letterSpacing: '0.05em' },
                },
              },
            ],
          },
        },

        // Tab 4: Amerikano
        {
          type: 'div',
          props: {
            style: {
              position: 'absolute',
              top: '640px',
              left: '405px',
              width: '148px',
              height: '42px',
              backgroundColor: sector4.color,
              borderRadius: '21px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 3px 8px rgba(0,0,0,0.25)',
              zIndex: 16,
              padding: '2px 8px',
            },
            children: [
              {
                type: 'span',
                props: {
                  children: sector4.period,
                  style: { fontSize: '9px', fontWeight: 700, color: '#FEF08A', letterSpacing: '0.04em' },
                },
              },
              {
                type: 'span',
                props: {
                  children: sector4.title,
                  style: { fontSize: '13px', fontWeight: 900, color: '#FFFFFF', letterSpacing: '0.05em' },
                },
              },
            ],
          },
        },

        // Tab 5: Hapon
        {
          type: 'div',
          props: {
            style: {
              position: 'absolute',
              top: '715px',
              left: '360px',
              width: '145px',
              height: '42px',
              backgroundColor: sector5.color,
              borderRadius: '21px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 3px 8px rgba(0,0,0,0.25)',
              zIndex: 16,
              padding: '2px 8px',
            },
            children: [
              {
                type: 'span',
                props: {
                  children: sector5.period,
                  style: { fontSize: '9px', fontWeight: 700, color: '#FEF08A', letterSpacing: '0.04em' },
                },
              },
              {
                type: 'span',
                props: {
                  children: sector5.title,
                  style: { fontSize: '13px', fontWeight: 900, color: '#FFFFFF', letterSpacing: '0.05em' },
                },
              },
            ],
          },
        },

        // Tab 6: Kasalukuyan
        {
          type: 'div',
          props: {
            style: {
              position: 'absolute',
              top: '785px',
              left: '245px',
              width: '160px',
              height: '42px',
              backgroundColor: sector6.color,
              borderRadius: '21px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 3px 8px rgba(0,0,0,0.25)',
              zIndex: 16,
              padding: '2px 8px',
            },
            children: [
              {
                type: 'span',
                props: {
                  children: sector6.period,
                  style: { fontSize: '9px', fontWeight: 700, color: '#94A3B8', letterSpacing: '0.04em' },
                },
              },
              {
                type: 'span',
                props: {
                  children: sector6.title,
                  style: { fontSize: '13px', fontWeight: 900, color: '#FFFFFF', letterSpacing: '0.05em' },
                },
              },
            ],
          },
        },

        // =====================================================================
        // LAYER 5: SEKTOR 1 - TRADISI LISAN & KATUTUBO (ATAS KIRI)
        // =====================================================================
        // 5A: Butir Peluru Teks Sektor 1 (Di Kiri Penari)
        {
          type: 'div',
          props: {
            style: {
              position: 'absolute',
              top: '22px',
              left: '165px',
              width: '225px',
              display: 'flex',
              flexDirection: 'column',
              zIndex: 12,
            },
            children: sector1.bullets.map((b) => ({
              type: 'div',
              props: {
                style: {
                  display: 'flex',
                  flexDirection: 'row',
                  alignItems: 'flex-start',
                  marginBottom: '10px',
                },
                children: [
                  {
                    type: 'div',
                    props: {
                      style: {
                        width: '8px',
                        height: '8px',
                        borderRadius: '50%',
                        backgroundColor: sector1.color,
                        marginTop: '6px',
                        marginRight: '8px',
                        flexShrink: 0,
                      },
                    },
                  },
                  {
                    type: 'span',
                    props: {
                      children: b,
                      style: {
                        fontFamily: 'Plus Jakarta Sans',
                        fontSize: '14px',
                        fontWeight: 600,
                        lineHeight: 1.45,
                        color: textDark,
                      },
                    },
                  },
                ],
              },
            })),
          },
        },

        // 5B: Visual Cutout Penari Tradisional Katutubo (Di Kanan Butir Peluru)
        {
          type: 'div',
          props: {
            style: {
              position: 'absolute',
              top: '115px',
              left: '280px',
              width: '205px',
              height: '275px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 11,
            },
            children: [
              {
                type: 'img',
                props: {
                  src: photoTradition,
                  style: { width: '100%', height: '100%', objectFit: 'contain' },
                },
              },
            ],
          },
        },

        // =====================================================================
        // LAYER 6: SEKTOR 2 - KODIFIKASI & PROPAGANDA KASTILA (ATAS KANAN)
        // =====================================================================
        // 6A: Patung Monumen Jose Rizal
        {
          type: 'div',
          props: {
            style: {
              position: 'absolute',
              top: '35px',
              left: '575px',
              width: '225px',
              height: '280px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 11,
            },
            children: [
              {
                type: 'img',
                props: {
                  src: photoStatue,
                  style: { width: '100%', height: '100%', objectFit: 'contain' },
                },
              },
            ],
          },
        },

        // 6B: Butir Peluru Teks Sektor 2 (Atas Kanan, Di Kanan Patung)
        {
          type: 'div',
          props: {
            style: {
              position: 'absolute',
              top: '22px',
              left: '775px',
              width: '285px',
              display: 'flex',
              flexDirection: 'column',
              zIndex: 12,
            },
            children: sector2.bullets.map((b) => ({
              type: 'div',
              props: {
                style: {
                  display: 'flex',
                  flexDirection: 'row',
                  alignItems: 'flex-start',
                  marginBottom: '10px',
                },
                children: [
                  {
                    type: 'div',
                    props: {
                      style: {
                        width: '8px',
                        height: '8px',
                        borderRadius: '50%',
                        backgroundColor: sector2.color,
                        marginTop: '6px',
                        marginRight: '8px',
                        flexShrink: 0,
                      },
                    },
                  },
                  {
                    type: 'span',
                    props: {
                      children: b,
                      style: {
                        fontFamily: 'Plus Jakarta Sans',
                        fontSize: '14.5px',
                        fontWeight: 600,
                        lineHeight: 1.45,
                        color: textDark,
                      },
                    },
                  },
                ],
              },
            })),
          },
        },

        // 6C: Callout Megaphone & Panitikang Propaganda (Di Bawah Patung)
        {
          type: 'div',
          props: {
            style: {
              position: 'absolute',
              top: '315px',
              left: '460px',
              display: 'flex',
              flexDirection: 'row',
              alignItems: 'center',
              zIndex: 13,
            },
            children: [
              {
                type: 'div',
                props: {
                  style: {
                    width: '75px',
                    height: '88px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginRight: '10px',
                  },
                  children: [
                    {
                      type: 'img',
                      props: {
                        src: photoMegaphone,
                        style: { width: '100%', height: '100%', objectFit: 'contain' },
                      },
                    },
                  ],
                },
              },
              {
                type: 'div',
                props: {
                  style: {
                    display: 'flex',
                    flexDirection: 'column',
                  },
                  children: [
                    {
                      type: 'span',
                      props: {
                        children: 'Panitikang Propaganda (1800s):',
                        style: {
                          fontFamily: 'Plus Jakarta Sans',
                          fontSize: '14px',
                          fontWeight: 800,
                          color: textDark,
                          marginBottom: '3px',
                        },
                      },
                    },
                    {
                      type: 'span',
                      props: {
                        children: '• Noli Me Tangere (1887)',
                        style: {
                          fontFamily: 'Plus Jakarta Sans',
                          fontSize: '13px',
                          fontWeight: 600,
                          color: textMuted,
                        },
                      },
                    },
                    {
                      type: 'span',
                      props: {
                        children: '• El Filibusterismo (1891)',
                        style: {
                          fontFamily: 'Plus Jakarta Sans',
                          fontSize: '13px',
                          fontWeight: 600,
                          color: textMuted,
                        },
                      },
                    },
                  ],
                },
              },
            ],
          },
        },

        // =====================================================================
        // LAYER 7: SEKTOR 3 - HIMAGSIKAN & PANITIKANG MAKABAYAN (TENGAH KANAN)
        // =====================================================================
        // 7A: Judul & Butir Peluru Teks Sektor 3
        {
          type: 'div',
          props: {
            style: {
              position: 'absolute',
              top: '450px',
              left: '565px',
              width: '265px',
              display: 'flex',
              flexDirection: 'column',
              zIndex: 12,
            },
            children: [
              {
                type: 'span',
                props: {
                  children: 'Panitikang Makabayan',
                  style: {
                    fontFamily: 'Plus Jakarta Sans',
                    fontSize: '20px',
                    fontWeight: 900,
                    color: '#0F172A',
                    letterSpacing: '0.01em',
                    marginBottom: '8px',
                  },
                },
              },
              ...sector3.bullets.map((b) => ({
                type: 'div',
                props: {
                  style: {
                    display: 'flex',
                    flexDirection: 'row',
                    alignItems: 'flex-start',
                    marginBottom: '8px',
                  },
                  children: [
                    {
                      type: 'div',
                      props: {
                        style: {
                          width: '7.5px',
                          height: '7.5px',
                          borderRadius: '50%',
                          backgroundColor: sector3.color,
                          marginTop: '6px',
                          marginRight: '8px',
                          flexShrink: 0,
                        },
                      },
                    },
                    {
                      type: 'span',
                      props: {
                        children: b,
                        style: {
                          fontFamily: 'Plus Jakarta Sans',
                          fontSize: '13.5px',
                          fontWeight: 600,
                          lineHeight: 1.45,
                          color: textDark,
                        },
                      },
                    },
                  ],
                },
              })),
            ],
          },
        },

        // 7B: Visual Siluet Merah Massa Revolusi & Pengibar Bendera
        {
          type: 'div',
          props: {
            style: {
              position: 'absolute',
              top: '320px',
              left: '835px',
              width: '235px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              zIndex: 12,
            },
            children: [
              // Siluet Merah Massa
              {
                type: 'div',
                props: {
                  style: {
                    width: '120px',
                    height: '58px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: '4px',
                    alignSelf: 'flex-start',
                    marginLeft: '10px',
                  },
                  children: [
                    {
                      type: 'img',
                      props: {
                        src: photoCrowdRed,
                        style: { width: '100%', height: '100%', objectFit: 'contain' },
                      },
                    },
                  ],
                },
              },
              // Pengibar Bendera Patriots
              {
                type: 'div',
                props: {
                  style: {
                    width: '235px',
                    height: '285px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  },
                  children: [
                    {
                      type: 'img',
                      props: {
                        src: photoAction,
                        style: { width: '100%', height: '100%', objectFit: 'contain' },
                      },
                    },
                  ],
                },
              },
            ],
          },
        },

        // =====================================================================
        // LAYER 8: SEKTOR 4 - AMERIKANO & EDUKASI PUBLIK (TENGAH PEACH WEDGE)
        // =====================================================================
        // 8A: Butir Peluru Teks Sektor 4
        {
          type: 'div',
          props: {
            style: {
              position: 'absolute',
              top: '655px',
              left: '565px',
              width: '265px',
              display: 'flex',
              flexDirection: 'column',
              zIndex: 12,
            },
            children: [
              ...sector4.bullets.map((b) => ({
                type: 'div',
                props: {
                  style: {
                    display: 'flex',
                    flexDirection: 'row',
                    alignItems: 'flex-start',
                    marginBottom: '8px',
                  },
                  children: [
                    {
                      type: 'div',
                      props: {
                        style: {
                          width: '7.5px',
                          height: '7.5px',
                          borderRadius: '50%',
                          backgroundColor: sector4.color,
                          marginTop: '6px',
                          marginRight: '8px',
                          flexShrink: 0,
                        },
                      },
                    },
                    {
                      type: 'span',
                      props: {
                        children: b,
                        style: {
                          fontFamily: 'Plus Jakarta Sans',
                          fontSize: '13.5px',
                          fontWeight: 600,
                          lineHeight: 1.45,
                          color: textDark,
                        },
                      },
                    },
                  ],
                },
              })),
              // Koran Lipat 'THE NEWS' di Bawah Butir ke-3
              {
                type: 'div',
                props: {
                  style: {
                    width: '105px',
                    height: '65px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    alignSelf: 'flex-end',
                    marginTop: '4px',
                    marginRight: '20px',
                  },
                  children: [
                    {
                      type: 'img',
                      props: {
                        src: photoTheNews,
                        style: { width: '100%', height: '100%', objectFit: 'contain' },
                      },
                    },
                  ],
                },
              },
            ],
          },
        },

        // 8B: Tumpukan Buku Kulit Antik (Book Stack)
        {
          type: 'div',
          props: {
            style: {
              position: 'absolute',
              top: '645px',
              left: '835px',
              width: '235px',
              height: '305px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 12,
            },
            children: [
              {
                type: 'img',
                props: {
                  src: photoBooks,
                  style: { width: '100%', height: '100%', objectFit: 'contain' },
                },
              },
            ],
          },
        },

        // =====================================================================
        // LAYER 9: SEKTOR 5 - HAPON & PERTAHANAN (BAWAH KANAN)
        // =====================================================================
        // 9A: Butir Peluru Kiri Sektor 5
        {
          type: 'div',
          props: {
            style: {
              position: 'absolute',
              top: '900px',
              left: '435px',
              width: '205px',
              display: 'flex',
              flexDirection: 'column',
              zIndex: 12,
            },
            children: [
              ...sector5.bullets.map((b) => ({
                type: 'div',
                props: {
                  style: {
                    display: 'flex',
                    flexDirection: 'row',
                    alignItems: 'flex-start',
                    marginBottom: '8px',
                  },
                  children: [
                    {
                      type: 'div',
                      props: {
                        style: {
                          width: '7.5px',
                          height: '7.5px',
                          borderRadius: '50%',
                          backgroundColor: sector5.color,
                          marginTop: '6px',
                          marginRight: '8px',
                          flexShrink: 0,
                        },
                      },
                    },
                    {
                      type: 'span',
                      props: {
                        children: b,
                        style: {
                          fontFamily: 'Plus Jakarta Sans',
                          fontSize: '13.5px',
                          fontWeight: 600,
                          lineHeight: 1.4,
                          color: textDark,
                        },
                      },
                    },
                  ],
                },
              })),
              // Naskah Gulungan Piagam Deklarasi
              {
                type: 'div',
                props: {
                  style: {
                    width: '80px',
                    height: '62px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    alignSelf: 'flex-end',
                    marginTop: '4px',
                    marginRight: '15px',
                  },
                  children: [
                    {
                      type: 'img',
                      props: {
                        src: photoScroll,
                        style: { width: '100%', height: '100%', objectFit: 'contain' },
                      },
                    },
                  ],
                },
              },
            ],
          },
        },

        // 9B: Visual Tentara Maju Berderap (Soldiers Cutout)
        {
          type: 'div',
          props: {
            style: {
              position: 'absolute',
              top: '915px',
              left: '645px',
              width: '235px',
              height: '240px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 12,
            },
            children: [
              {
                type: 'img',
                props: {
                  src: photoSoldiers,
                  style: { width: '100%', height: '100%', objectFit: 'contain' },
                },
              },
            ],
          },
        },

        // 9C: Butir Peluru Kanan Sektor 5 (Di Kanan Tentara)
        {
          type: 'div',
          props: {
            style: {
              position: 'absolute',
              top: '990px',
              left: '885px',
              width: '175px',
              display: 'flex',
              flexDirection: 'row',
              alignItems: 'flex-start',
              zIndex: 12,
            },
            children: [
              {
                type: 'div',
                props: {
                  style: {
                    width: '7.5px',
                    height: '7.5px',
                    borderRadius: '50%',
                    backgroundColor: sector5.color,
                    marginTop: '6px',
                    marginRight: '8px',
                    flexShrink: 0,
                  },
                },
              },
              {
                type: 'span',
                props: {
                  children:
                    'Pag-usbong ng mga kilalang makata at manunulat tulad nina Jose Ma. Hernandez at Francisco Rodrigo.',
                  style: {
                    fontFamily: 'Plus Jakarta Sans',
                    fontSize: '13.5px',
                    fontWeight: 600,
                    lineHeight: 1.45,
                    color: textDark,
                  },
                },
              },
            ],
          },
        },

        // =====================================================================
        // LAYER 10: SEKTOR 6 - KASALUKUYAN & MONUMEN LUNETA (BAWAH KIRI-TENGAH)
        // =====================================================================
        // 10A: Butir Peluru Teks Sektor 6 (Di Bawah Jam Saku)
        {
          type: 'div',
          props: {
            style: {
              position: 'absolute',
              top: '840px',
              left: '165px',
              width: '135px',
              display: 'flex',
              flexDirection: 'column',
              zIndex: 12,
            },
            children: sector6.bullets.map((b) => ({
              type: 'div',
              props: {
                style: {
                  display: 'flex',
                  flexDirection: 'row',
                  alignItems: 'flex-start',
                  marginBottom: '10px',
                },
                children: [
                  {
                    type: 'div',
                    props: {
                      style: {
                        width: '7.5px',
                        height: '7.5px',
                        borderRadius: '50%',
                        backgroundColor: sector6.color,
                        marginTop: '6px',
                        marginRight: '8px',
                        flexShrink: 0,
                      },
                    },
                  },
                  {
                    type: 'span',
                    props: {
                      children: b,
                      style: {
                        fontFamily: 'Plus Jakarta Sans',
                        fontSize: '13px',
                        fontWeight: 600,
                        lineHeight: 1.38,
                        color: textDark,
                      },
                    },
                  },
                ],
              },
            })),
          },
        },

        // 10B: Monumen Obelisk Luneta Rizal Park
        {
          type: 'div',
          props: {
            style: {
              position: 'absolute',
              top: '860px',
              left: '305px',
              width: '135px',
              height: '265px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 12,
            },
            children: [
              {
                type: 'img',
                props: {
                  src: photoMonument,
                  style: { width: '100%', height: '100%', objectFit: 'contain' },
                },
              },
            ],
          },
        },

        // 10C: Borgol Putus & Motto Kebebasan
        {
          type: 'div',
          props: {
            style: {
              position: 'absolute',
              top: '1100px',
              left: '445px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'flex-start',
              zIndex: 13,
            },
            children: [
              {
                type: 'div',
                props: {
                  style: {
                    width: '80px',
                    height: '52px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: '4px',
                  },
                  children: [
                    {
                      type: 'img',
                      props: {
                        src: photoBrokenChains,
                        style: { width: '100%', height: '100%', objectFit: 'contain' },
                      },
                    },
                  ],
                },
              },
              {
                type: 'span',
                props: {
                  children: 'Malaya, makulay, at malikhaing pagsulat',
                  style: {
                    fontFamily: 'Plus Jakarta Sans',
                    fontSize: '13.5px',
                    fontWeight: 800,
                    color: '#0F172A',
                    lineHeight: 1.25,
                    width: '140px',
                  },
                },
              },
            ],
          },
        },

        // =====================================================================
        // LAYER 11: WATERMARK DISKRET RESMI DI GARIS BAWAH
        // =====================================================================
        {
          type: 'div',
          props: {
            style: {
              position: 'absolute',
              bottom: '12px',
              left: '165px',
              right: '25px',
              display: 'flex',
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              borderTop: '1px solid rgba(140, 85, 35, 0.25)',
              paddingTop: '6px',
              zIndex: 15,
            },
            children: [
              {
                type: 'span',
                props: {
                  children: editionTag || 'POLARIS HISTORIKA // REKAM JEJAK ASPIRASI',
                  style: {
                    fontFamily: 'Plus Jakarta Sans',
                    fontSize: '11px',
                    fontWeight: 700,
                    letterSpacing: '0.08em',
                    color: '#8C5523',
                  },
                },
              },
              {
                type: 'div',
                props: {
                  style: { display: 'flex', flexDirection: 'row', alignItems: 'center' },
                  children: [
                    ...(qrCodeDataUri
                      ? [
                          {
                            type: 'img',
                            props: {
                              src: qrCodeDataUri,
                              style: { width: '24px', height: '24px', marginRight: '8px' },
                            },
                          },
                        ]
                      : []),
                    {
                      type: 'span',
                      props: {
                        children: `${memberName} • ${memberTitle}`,
                        style: {
                          fontFamily: 'Plus Jakarta Sans',
                          fontSize: '11px',
                          fontWeight: 700,
                          color: '#475569',
                          letterSpacing: '0.04em',
                        },
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
}
