import sharp from 'sharp';
import satori from 'satori';
import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import QRCode from 'qrcode';
import { MultiRegionCropper } from './multi-region-cropper.js';

export type SubjectCompositionMode =
  | 'PUBLIC_ADVOCACY'
  | 'FIGURE_CENTERPIECE';

export interface SynthesizedEditorialCopy {
  mainBannerTitle: string;
  mainBannerSubheader: string;
  mainBannerDefinitionBody: string;
  blocks: Record<
    string,
    {
      header: string;
      body: string;
    }
  >;
  mappedVisualCutouts: Record<string, string>;
  statCircles?: Array<{ topLabel: string; value: string; description: string }>;
  numberedItems?: Array<{ number: string; title: string; subtitle?: string; summary: string }>;
}

export interface ComposeCreativePosterOptions {
  backgroundBuffer: Buffer;
  subjectPhotoBuffer?: Buffer;
  officialLogoBuffer?: Buffer;
  headline: string;
  quote?: string;
  memberName: string;
  memberTitle?: string;
  archetype?:
    | 'STREET_JOURNALISM'
    | 'POP_OUT_HERO'
    | 'STATEMENT_PROFILE'
    | 'RETRO_CAMPAIGN'
    | 'TORN_PAPER_NEWS'
    | 'RETRO_SPLIT_MITIGATION'
    | 'MODULAR_GRID_CARDS'
    | 'VINTAGE_PERSONA_GAZETTE';
  compositionMode?: SubjectCompositionMode;
  synthesizedCopy?: SynthesizedEditorialCopy;
  primaryAccentColor?: string;
  canvasWidth?: number;
  canvasHeight?: number;
  editionTag?: string;
  galleryPhotos?: string[];
  outputFormat?: 'webp' | 'png';
}

export interface ComposedPosterResult {
  buffer: Buffer;
  mimeType: 'image/webp' | 'image/png';
  sizeBytes: number;
  width: number;
  height: number;
}

export class CreativePosterCompositor {
  private static fontCache: Array<{
    name: string;
    data: Buffer;
    weight: 400 | 600 | 700 | 800;
    style: 'normal';
  }> | null = null;

  /**
   * Menemukan direktori assets/fonts secara dinamis
   */
  private static async findFontsDir(): Promise<string> {
    const candidates = [
      path.resolve(process.cwd(), 'assets/fonts'),
      path.resolve(process.cwd(), '../assets/fonts'),
      path.resolve(process.cwd(), '../../assets/fonts'),
      path.resolve(process.cwd(), '../../../assets/fonts'),
      '/home/pc/projects/polaris-platform/assets/fonts',
    ];

    for (const dir of candidates) {
      try {
        await fs.access(dir);
        return dir;
      } catch {
        // Coba kandidat berikutnya
      }
    }
    return path.resolve(process.cwd(), 'assets/fonts');
  }

  /**
   * Memuat file binary font lokal sekali ke memori (Singleton)
   * Menghindari bug fatal librsvg yang gagal memuat @import Google Fonts di Docker Linux
   */
  private static async getFonts() {
    if (this.fontCache) return this.fontCache;

    const fontsDir = await this.findFontsDir();

    const [antonData, bebasData, jakartaData, dejavuData, dejavuBoldData] = await Promise.all([
      fs.readFile(path.join(fontsDir, 'Anton-Regular.ttf')),
      fs.readFile(path.join(fontsDir, 'BebasNeue-Regular.ttf')),
      fs.readFile(path.join(fontsDir, 'PlusJakartaSans-SemiBold.ttf')),
      fs.readFile(path.join(fontsDir, 'DejaVuSerif.ttf')).catch(() => fs.readFile('/usr/share/fonts/truetype/dejavu/DejaVuSerif.ttf')),
      fs.readFile(path.join(fontsDir, 'DejaVuSerif-Bold.ttf')).catch(() => fs.readFile('/usr/share/fonts/truetype/dejavu/DejaVuSerif-Bold.ttf')),
    ]);

    this.fontCache = [
      { name: 'Anton', data: antonData, weight: 400, style: 'normal' },
      { name: 'Bebas Neue', data: bebasData, weight: 400, style: 'normal' },
      // Daftarkan Plus Jakarta Sans di berbagai weight agar Satori tidak pernah gagal mencocokkan
      { name: 'Plus Jakarta Sans', data: jakartaData, weight: 400, style: 'normal' },
      { name: 'Plus Jakarta Sans', data: jakartaData, weight: 600, style: 'normal' },
      { name: 'Plus Jakarta Sans', data: jakartaData, weight: 700, style: 'normal' },
      // Daftarkan DejaVu Serif untuk typography koran/broadsheet
      { name: 'DejaVu Serif', data: dejavuData, weight: 400, style: 'normal' },
      { name: 'DejaVu Serif', data: dejavuBoldData, weight: 700, style: 'normal' },
    ];

    return this.fontCache;
  }

  /**
   * Mengharmonisasikan foto cutout PNG Anggota Dewan agar menyatu dengan tekstur poster
   */
  private static async harmonizeSubjectPhoto(
    photoBuffer: Buffer,
    archetype: string,
    targetWidth: number,
    targetHeight: number
  ): Promise<Buffer> {
    let pipeline = sharp(photoBuffer).resize({
      width: targetWidth,
      height: targetHeight,
      fit: 'contain',
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    });

    if (archetype === 'STREET_JOURNALISM') {
      // Ubah ke High-Contrast B&W seperti foto Bapak PKL / Petugas Sampah di kolase
      pipeline = pipeline.grayscale().linear(1.28, -18).sharpen();
    }

    return await pipeline.png().toBuffer();
  }

  /**
   * Membangun pohon elemen Flexbox/Grid (Satori VNode) yang mereplikasi 100% struktur POSTER PKL
   */
  private static buildStreetJournalismCollageVNode(params: {
    width: number;
    height: number;
    copy: SynthesizedEditorialCopy;
    memberName: string;
    memberTitle: string;
    editionTag: string;
    primaryAccent: string;
    logoDataUri?: string;
  }): any {
    const { width, height, copy, memberName, memberTitle, editionTag, primaryAccent, logoDataUri } = params;

    const leftPos = copy.blocks['left_positive'] || { header: 'DAMPAK BURUK', body: '' };
    const leftNeg = copy.blocks['left_negative_box'] || { header: 'MANFAAT PENGELOLAAN', body: '' };
    const centerStory = copy.blocks['center_giant_title'] || { header: 'SOLUSI NYATA', body: '' };
    const rightCause = copy.blocks['right_cause'] || { header: 'AKSI BERSAMA', body: '' };

    const giantWords = (centerStory.header || 'SOLUSI NYATA').trim().split(/\s+/);

    return {
      type: 'div',
      props: {
        style: {
          width: `${width}px`,
          height: `${height}px`,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          position: 'relative',
          fontFamily: 'Plus Jakarta Sans',
        },
        children: [
          // ===================================================================
          // 1. TOP HEADER BAR (Logo + Identitas Komisi/Kelompok)
          // ===================================================================
          {
            type: 'div',
            props: {
              style: {
                display: 'flex',
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                margin: '28px 48px 0 48px',
                paddingBottom: '10px',
                borderBottom: '2px solid #18181B',
              },
              children: [
                {
                  type: 'div',
                  props: {
                    style: { display: 'flex', alignItems: 'center', gap: '12px' },
                    children: [
                      ...(logoDataUri
                        ? [
                            {
                              type: 'img',
                              props: {
                                src: logoDataUri,
                                style: { height: '30px', objectFit: 'contain' },
                              },
                            },
                          ]
                        : []),
                      {
                        type: 'span',
                        props: {
                          style: {
                            fontFamily: 'Anton',
                            fontSize: '18px',
                            color: primaryAccent,
                            letterSpacing: '0.06em',
                          },
                          children: `${editionTag} — ${memberName.toUpperCase()}`,
                        },
                      },
                    ],
                  },
                },
                {
                  type: 'span',
                  props: {
                    style: {
                      fontSize: '12px',
                      fontWeight: 700,
                      color: '#27272A',
                      letterSpacing: '0.05em',
                    },
                    children: (memberTitle || 'PUBLIKASI EDUKASI PARLEMEN').toUpperCase(),
                  },
                },
              ],
            },
          },

          // ===================================================================
          // 2. UPPER 3-COLUMN EDITORIAL GRID (Persis Struktur Poster PKL)
          // ===================================================================
          {
            type: 'div',
            props: {
              style: {
                display: 'flex',
                flexDirection: 'row',
                padding: '16px 48px',
                gap: '24px',
                flex: 1,
              },
              children: [
                // --- KOLOM KIRI (Dampak Buruk + Kotak Merah Manfaat) ---
                {
                  type: 'div',
                  props: {
                    style: {
                      width: '340px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '14px',
                    },
                    children: [
                      {
                        type: 'div',
                        props: {
                          style: {
                            fontSize: '12px',
                            fontWeight: 700,
                            color: '#18181B',
                            borderBottom: '1.5px solid #18181B',
                            paddingBottom: '6px',
                          },
                          children: 'TINJAUAN DAMPAK DAPAT DIAMATI DARI DUA SISI, YAKNI:',
                        },
                      },
                      // Blok 1: Dampak Buruk (Teks Merah di Atas Kertas Krem)
                      {
                        type: 'div',
                        props: {
                          style: { display: 'flex', flexDirection: 'column', gap: '6px' },
                          children: [
                            {
                              type: 'div',
                              props: {
                                style: {
                                  fontFamily: 'Anton',
                                  fontSize: '36px',
                                  color: primaryAccent,
                                  lineHeight: 1.05,
                                },
                                children: leftPos.header.toUpperCase(),
                              },
                            },
                            {
                              type: 'div',
                              props: {
                                style: {
                                  fontSize: '12.5px',
                                  color: '#18181B',
                                  lineHeight: 1.38,
                                  textAlign: 'justify',
                                },
                                children: leftPos.body.toUpperCase(),
                              },
                            },
                          ],
                        },
                      },
                      // Blok 2: Kotak Solid Merah (Manfaat Pengelolaan)
                      {
                        type: 'div',
                        props: {
                          style: {
                            display: 'flex',
                            flexDirection: 'column',
                            backgroundColor: primaryAccent,
                            padding: '16px 18px',
                            gap: '8px',
                          },
                          children: [
                            {
                              type: 'div',
                              props: {
                                style: {
                                  fontFamily: 'Anton',
                                  fontSize: '32px',
                                  color: '#FFFFFF',
                                  lineHeight: 1.05,
                                },
                                children: leftNeg.header.toUpperCase(),
                              },
                            },
                            {
                              type: 'div',
                              props: {
                                style: {
                                  fontSize: '12px',
                                  color: '#FFFFFF',
                                  lineHeight: 1.38,
                                  textAlign: 'justify',
                                  paddingRight: '55px', // Memberi ruang bagi bahu foto cutout di kanan bawah kotak
                                },
                                children: leftNeg.body.toUpperCase(),
                              },
                            },
                          ],
                        },
                      },
                    ],
                  },
                },

                // --- KOLOM TENGAH (Judul Raksasa Bersusun "SOLUSI NYATA" + Paragraf) ---
                {
                  type: 'div',
                  props: {
                    style: {
                      width: '235px',
                      display: 'flex',
                      flexDirection: 'column',
                      borderLeft: '1.5px solid #27272A',
                      borderRight: '1.5px solid #27272A',
                      paddingLeft: '18px',
                      paddingRight: '18px',
                      gap: '14px',
                      height: '580px',
                    },
                    children: [
                      {
                        type: 'div',
                        props: {
                          style: {
                            display: 'flex',
                            flexDirection: 'column',
                            fontFamily: 'Bebas Neue',
                            fontSize: '92px',
                            color: primaryAccent,
                            lineHeight: 0.88,
                            letterSpacing: '0.02em',
                            borderBottom: '1.5px solid #27272A',
                            paddingBottom: '12px',
                          },
                          children: giantWords.map((word: string) => ({
                            type: 'span',
                            props: { children: word.toUpperCase() },
                          })),
                        },
                      },
                      {
                        type: 'div',
                        props: {
                          style: {
                            fontSize: '12.5px',
                            color: '#18181B',
                            lineHeight: 1.4,
                            textAlign: 'justify',
                          },
                          children: centerStory.body.toUpperCase(),
                        },
                      },
                    ],
                  },
                },

                // --- KOLOM KANAN (Ruang Kosong di Atas untuk Cutout + Teks di Tengah) ---
                {
                  type: 'div',
                  props: {
                    style: {
                      flex: 1,
                      display: 'flex',
                      flexDirection: 'column',
                      paddingTop: '275px', // Area y: 0-275px dibiarkan transparan agar foto Cutout Kanan Atas terlihat utuh!
                      gap: '8px',
                    },
                    children: [
                      {
                        type: 'div',
                        props: {
                          style: {
                            fontFamily: 'Anton',
                            fontSize: '42px',
                            color: primaryAccent,
                            lineHeight: 1.05,
                          },
                          children: rightCause.header.toUpperCase(),
                        },
                      },
                      {
                        type: 'div',
                        props: {
                          style: {
                            fontSize: '12.5px',
                            color: '#18181B',
                            lineHeight: 1.38,
                            textAlign: 'justify',
                          },
                          children: rightCause.body.toUpperCase(),
                        },
                      },
                    ],
                  },
                },
              ],
            },
          },

          // ===================================================================
          // 3. BOTTOM BLACK BANNER (Judul Raksasa Putih + Definisi + Atribusi)
          // ===================================================================
          {
            type: 'div',
            props: {
              style: {
                width: `${width}px`,
                height: `${Math.round(height * 0.25)}px`,
                backgroundColor: '#0A0A0A',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                padding: '24px 52px',
                gap: '8px',
              },
              children: [
                {
                  type: 'div',
                  props: {
                    style: {
                      fontSize: '15px',
                      color: '#E4E4E7',
                      letterSpacing: '0.04em',
                    },
                    children: copy.mainBannerSubheader,
                  },
                },
                {
                  type: 'div',
                  props: {
                    style: {
                      fontFamily: 'Bebas Neue',
                      fontSize: '112px',
                      color: '#FFFFFF',
                      lineHeight: 0.92,
                      letterSpacing: '0.02em',
                    },
                    children: copy.mainBannerTitle.toUpperCase(),
                  },
                },
                {
                  type: 'div',
                  props: {
                    style: {
                      fontSize: '13.5px',
                      color: '#F4F4F5',
                      lineHeight: 1.38,
                      textAlign: 'justify',
                      marginTop: '4px',
                    },
                    children: copy.mainBannerDefinitionBody.toUpperCase(),
                  },
                },
                {
                  type: 'div',
                  props: {
                    style: {
                      fontSize: '11px',
                      color: '#A1A1AA',
                      marginTop: '6px',
                    },
                    children: `POLARIS GOV • Advokasi Kebijakan Publik & Lingkungan | Diinisiasi oleh: ${memberName} (${memberTitle || 'Parlemen'})`,
                  },
                },
              ],
            },
          },
        ],
      },
    };
  }

  /**
   * Membangun pohon elemen Flexbox/Grid untuk arketipe non-Street Journalism (POP_OUT_HERO, STATEMENT_PROFILE, RETRO_CAMPAIGN)
   */
  private static buildStandardEditorialVNode(params: {
    width: number;
    height: number;
    headline: string;
    quote?: string;
    copy: SynthesizedEditorialCopy;
    memberName: string;
    memberTitle: string;
    editionTag: string;
    primaryAccent: string;
    archetype: string;
    logoDataUri?: string;
  }): any {
    const {
      width,
      height,
      headline,
      quote,
      copy,
      memberName,
      memberTitle,
      editionTag,
      primaryAccent,
      archetype,
      logoDataUri,
    } = params;

    const displayTitle = (copy.mainBannerTitle || headline || 'POLARIS EDITORIAL').toUpperCase();
    const displaySubheader = copy.mainBannerSubheader || 'ASPIRASI & KEBIJAKAN PARLEMEN';
    const displayQuote =
      quote ||
      copy.mainBannerDefinitionBody ||
      'Mewujudkan tata kelola kebijakan publik yang transparan, akuntabel, dan berkeadilan bagi seluruh rakyat.';

    const isRetro = archetype === 'RETRO_CAMPAIGN';
    const isProfile = archetype === 'STATEMENT_PROFILE';

    return {
      type: 'div',
      props: {
        style: {
          width: `${width}px`,
          height: `${height}px`,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          position: 'relative',
          padding: '40px 48px',
          fontFamily: 'Plus Jakarta Sans',
        },
        children: [
          // 1. HEADER (Logo + Edition Tag + Member Title)
          {
            type: 'div',
            props: {
              style: {
                display: 'flex',
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                paddingBottom: '16px',
                borderBottom: `2px solid ${isRetro ? primaryAccent : '#E4E4E7'}`,
              },
              children: [
                {
                  type: 'div',
                  props: {
                    style: { display: 'flex', alignItems: 'center', gap: '12px' },
                    children: [
                      ...(logoDataUri
                        ? [
                            {
                              type: 'img',
                              props: {
                                src: logoDataUri,
                                style: { height: '32px', objectFit: 'contain' },
                              },
                            },
                          ]
                        : []),
                      {
                        type: 'span',
                        props: {
                          style: {
                            fontFamily: 'Anton',
                            fontSize: '18px',
                            color: primaryAccent,
                            letterSpacing: '0.06em',
                          },
                          children: editionTag.toUpperCase(),
                        },
                      },
                    ],
                  },
                },
                {
                  type: 'span',
                  props: {
                    style: {
                      fontSize: '12px',
                      fontWeight: 700,
                      color: isRetro ? '#18181B' : '#F4F4F5',
                      letterSpacing: '0.06em',
                      backgroundColor: isRetro ? '#FEF08A' : 'rgba(0, 0, 0, 0.45)',
                      padding: '4px 10px',
                      borderRadius: '4px',
                    },
                    children: memberTitle.toUpperCase(),
                  },
                },
              ],
            },
          },

          // 2. HERO HEADLINE & TOP SUBHEADER
          {
            type: 'div',
            props: {
              style: {
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
                marginTop: '12px',
              },
              children: [
                {
                  type: 'span',
                  props: {
                    style: {
                      fontSize: '14px',
                      fontWeight: 700,
                      color: primaryAccent,
                      letterSpacing: '0.08em',
                    },
                    children: displaySubheader.toUpperCase(),
                  },
                },
                {
                  type: 'div',
                  props: {
                    style: {
                      fontFamily: isProfile ? 'Anton' : 'Bebas Neue',
                      fontSize: displayTitle.length > 20 ? '84px' : '108px',
                      color: '#FFFFFF',
                      lineHeight: 0.92,
                      letterSpacing: '0.02em',
                      textShadow: '0 4px 18px rgba(0,0,0,0.6)',
                    },
                    children: displayTitle,
                  },
                },
              ],
            },
          },

          // 3. MIDDLE AREA (Spacer for subject cutout)
          {
            type: 'div',
            props: {
              style: {
                flex: 1,
                display: 'flex',
              },
            },
          },

          // 4. BOTTOM STATEMENT CARD & MEMBER FOOTER
          {
            type: 'div',
            props: {
              style: {
                display: 'flex',
                flexDirection: 'column',
                gap: '14px',
              },
              children: [
                // Quote Card (Glassmorphism / Solid Card)
                {
                  type: 'div',
                  props: {
                    style: {
                      display: 'flex',
                      flexDirection: 'column',
                      backgroundColor: isRetro ? '#FFFFFF' : 'rgba(15, 23, 42, 0.82)',
                      borderLeft: `5px solid ${primaryAccent}`,
                      borderRadius: '8px',
                      padding: '18px 24px',
                      boxShadow: '0 10px 25px rgba(0, 0, 0, 0.35)',
                    },
                    children: [
                      {
                        type: 'span',
                        props: {
                          style: {
                            fontSize: '14px',
                            color: isRetro ? '#1F2937' : '#F1F5F9',
                            lineHeight: 1.45,
                            textAlign: 'justify',
                          },
                          children: displayQuote,
                        },
                      },
                    ],
                  },
                },

                // Member Identity Banner
                {
                  type: 'div',
                  props: {
                    style: {
                      display: 'flex',
                      flexDirection: 'row',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      backgroundColor: 'rgba(0, 0, 0, 0.9)',
                      padding: '12px 20px',
                      borderRadius: '6px',
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
                                fontFamily: 'Anton',
                                fontSize: '20px',
                                color: '#FFFFFF',
                                letterSpacing: '0.04em',
                              },
                              children: memberName.toUpperCase(),
                            },
                            {
                              type: 'span',
                              props: {
                                fontSize: '11px',
                                color: '#94A3B8',
                                letterSpacing: '0.04em',
                              },
                              children: memberTitle.toUpperCase(),
                            },
                          ],
                        },
                      },
                      {
                        type: 'span',
                        props: {
                          style: {
                            fontSize: '11px',
                            color: primaryAccent,
                            fontWeight: 700,
                            letterSpacing: '0.05em',
                          },
                          children: 'POLARIS OFFICIAL MEDIA',
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

  /**
   * Menghasilkan Layer SVG Mask Sobekan Kertas (Torn Paper Wings)
   * Menyediakan tekstur robekan kertas kiri & kanan dengan serat putih dan bayangan lembut
   */
  public static buildTornPaperWingsSvg(canvasWidth: number, canvasHeight: number): Buffer {
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
  private static buildTornPaperVeritasVNode(params: {
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
  }): any {
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

  /**
   * Layout 2: RETRO_SPLIT_MITIGATION (Inspirasi: Earthquake Retro Style / Get To Know)
   */
  private static buildRetroMitigationVNode(params: {
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
    logoDataUri?: string;
  }): any {
    const { width, height, headline, copy, memberName, memberTitle, editionTag, primaryAccent, croppedThumbnails = {}, logoDataUri } = params;

    const items = copy.numberedItems && copy.numberedItems.length >= 4
      ? copy.numberedItems
      : [
          { number: '01', title: 'Perlindungan Diri', summary: 'Cari tempat berlindung kokoh dan jauhi instalasi kaca atau kabel terbuka.' },
          { number: '02', title: 'Putus Aliran Listrik', summary: 'Segera matikan meteran listrik dan kompor untuk cegah korsleting dan api.' },
          { number: '03', title: 'Jalur Evakuasi Terbuka', summary: 'Gunakan tangga darurat dan jangan gunakan lift selama status bahaya.' },
          { number: '04', title: 'Titik Kumpul Lapangan', summary: 'Menuju ruang terbuka dan koordinasi dengan posko tanggap darurat RT/RW.' },
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
                    style: { fontFamily: 'Anton', fontSize: '64px', lineHeight: 0.95, color: '#1C1917', letterSpacing: '0.02em' },
                    children: (copy.mainBannerTitle || headline || 'PANDUAN KESELAMATAN BENCANA').toUpperCase(),
                  },
                },
                {
                  type: 'span',
                  props: {
                    style: { fontSize: '15px', fontWeight: 700, color: primaryAccent },
                    children: copy.mainBannerSubheader || 'TANGGAP DARURAT & MITIGASI RISIKO LINGKUNGAN',
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
                          children: copy.mainBannerDefinitionBody || 'Edukasi dan kesiapsiagaan warga adalah garda terdepan penyelamatan jiwa saat musibah terjadi.',
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

  /**
   * Layout 3: MODULAR_GRID_CARDS (Inspirasi: 5 Modern Font Pairings)
   */
  private static buildModularCardsVNode(params: {
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
  }): any {
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
          // Top Headline & Subtitle
          {
            type: 'div',
            props: {
              style: { display: 'flex', flexDirection: 'column', borderBottom: '2px solid #18181B', paddingBottom: '16px' },
              children: [
                {
                  type: 'span',
                  props: { style: { fontSize: '11px', fontWeight: 700, color: primaryAccent, letterSpacing: '0.08em', marginBottom: '4px' }, children: editionTag.toUpperCase() },
                },
                {
                  type: 'span',
                  props: {
                    style: { fontFamily: 'Anton', fontSize: '64px', lineHeight: 0.95, color: '#18181B', letterSpacing: '0.02em' },
                    children: (copy.mainBannerTitle || headline || '5 POKOK REKOMENDASI').toUpperCase(),
                  },
                },
                {
                  type: 'span',
                  props: {
                    style: { fontSize: '14px', color: '#52525B', marginTop: '6px' },
                    children: copy.mainBannerSubheader || 'Kerangka Kerja Strategis Percepatan Solusi dan Advokasi Parlemen',
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
                          backgroundColor: '#F8FAFC',
                          border: '1.5px solid #E2E8F0',
                          borderRadius: '8px',
                          padding: '16px',
                          display: 'flex',
                          flexDirection: 'row',
                          gap: '12px',
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
                                { type: 'span', props: { style: { fontWeight: 700, fontSize: '13px', color: '#0F172A', marginBottom: '4px' }, children: c.title } },
                                { type: 'span', props: { style: { fontSize: '10px', color: '#64748B', lineHeight: 1.35 }, children: c.summary } },
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
                          backgroundColor: '#F8FAFC',
                          border: '1.5px solid #E2E8F0',
                          borderRadius: '8px',
                          padding: '16px',
                          display: 'flex',
                          flexDirection: 'row',
                          gap: '12px',
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
                                { type: 'span', props: { style: { fontWeight: 700, fontSize: '13px', color: '#0F172A', marginBottom: '4px' }, children: c.title } },
                                { type: 'span', props: { style: { fontSize: '10px', color: '#64748B', lineHeight: 1.35 }, children: c.summary } },
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
                      padding: '18px 24px',
                      display: 'flex',
                      flexDirection: 'row',
                      alignItems: 'center',
                      gap: '18px',
                    },
                    children: [
                      { type: 'span', props: { style: { fontFamily: 'Anton', fontSize: '36px', color: primaryAccent }, children: cards[4]?.number || '05' } },
                      {
                        type: 'div',
                        props: {
                          style: { display: 'flex', flexDirection: 'column' },
                          children: [
                            { type: 'span', props: { style: { fontWeight: 700, fontSize: '15px', color: '#FFFFFF', marginBottom: '2px' }, children: cards[4]?.title || 'Regulasi Tegas' } },
                            { type: 'span', props: { style: { fontSize: '11px', color: '#94A3B8', lineHeight: 1.35 }, children: cards[4]?.summary || 'Mendorong perda pengawasan dan alokasi anggaran berkeadilan.' } },
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
              style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '2px solid #18181B', paddingTop: '14px' },
              children: [
                {
                  type: 'div',
                  props: {
                    style: { display: 'flex', flexDirection: 'column' },
                    children: [
                      { type: 'span', props: { style: { fontFamily: 'Anton', fontSize: '18px', color: '#18181B' }, children: memberName.toUpperCase() } },
                      { type: 'span', props: { style: { fontSize: '11px', color: '#71717A' }, children: memberTitle.toUpperCase() } },
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

  /**
   * Layout 4: VINTAGE_PERSONA_GAZETTE (Inspirasi: Biografi Steve Jobs / The S News)
   */
  private static buildVintageGazetteVNode(params: {
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
  }): any {
    const { width, height, headline, quote, copy, memberName, memberTitle, editionTag, primaryAccent, croppedThumbnails = {} } = params;

    return {
      type: 'div',
      props: {
        style: {
          width: `${width}px`,
          height: `${height}px`,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '38px 44px',
          boxSizing: 'border-box',
          fontFamily: 'DejaVu Serif',
        },
        children: [
          // Top Gazette Masthead
          {
            type: 'div',
            props: {
              style: { display: 'flex', flexDirection: 'column', alignItems: 'center', borderBottom: '3px double #111827', paddingBottom: '12px' },
              children: [
                {
                  type: 'span',
                  props: {
                    style: { fontFamily: 'DejaVu Serif', fontWeight: 700, fontSize: '28px', color: '#111827', letterSpacing: '0.06em' },
                    children: editionTag || 'POLARIS HISTORICAL GAZETTE',
                  },
                },
                {
                  type: 'span',
                  props: {
                    style: { fontSize: '10px', fontStyle: 'italic', color: '#4B5563', marginTop: '2px' },
                    children: 'Edisi Khusus Pemikiran & Refleksi Kebijakan Publik // Terbit Berkala',
                  },
                },
              ],
            },
          },

          // Giant Headline
          {
            type: 'div',
            props: {
              style: { display: 'flex', flexDirection: 'column', alignItems: 'center', margin: '14px 0', textAlign: 'center' },
              children: [
                {
                  type: 'span',
                  props: {
                    style: { fontFamily: 'Bebas Neue', fontSize: '76px', lineHeight: 0.95, color: '#111827', letterSpacing: '0.03em' },
                    children: (copy.mainBannerTitle || headline || 'DEDIKASI UNTUK RAKYAT').toUpperCase(),
                  },
                },
                {
                  type: 'span',
                  props: {
                    style: { fontWeight: 700, fontSize: '15px', color: primaryAccent, marginTop: '4px' },
                    children: copy.mainBannerSubheader || 'Gagasan Besar dan Perjalanan Mengawal Hak-Hak Konstitusional Warga',
                  },
                },
              ],
            },
          },

          // Middle Split Columns
          {
            type: 'div',
            props: {
              style: { display: 'flex', flexDirection: 'row', gap: '20px', flex: 1, margin: '10px 0' },
              children: [
                // Left Column
                {
                  type: 'div',
                  props: {
                    style: { flex: 1, display: 'flex', flexDirection: 'column' },
                    children: [
                      {
                        type: 'p',
                        props: {
                          style: { fontSize: '10.5px', lineHeight: 1.45, color: '#1F2937', textAlign: 'justify', margin: '0 0 10px 0' },
                          children: copy.blocks?.['left_positive']?.body || copy.mainBannerDefinitionBody || 'Kepemimpinan sejati diuji bukan saat situasi nyaman, melainkan saat krisis menghadang dan suara rakyat membutuhkan pembelaan nyata di parlemen.',
                        },
                      },
                      ...(croppedThumbnails.subPhoto
                        ? [
                            {
                              type: 'img',
                              props: {
                                src: croppedThumbnails.subPhoto,
                                style: { width: '100%', height: '110px', objectFit: 'cover', borderRadius: '2px', border: '1px solid #D1D5DB' },
                              },
                            },
                          ]
                        : []),
                    ],
                  },
                },

                // Right Column with Quote Box
                {
                  type: 'div',
                  props: {
                    style: { flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' },
                    children: [
                      {
                        type: 'div',
                        props: {
                          style: { backgroundColor: '#FEF3C7', borderLeft: `4px solid ${primaryAccent}`, padding: '14px 18px', borderRadius: '4px' },
                          children: [
                            {
                              type: 'span',
                              props: {
                                style: { fontStyle: 'italic', fontSize: '12px', lineHeight: 1.4, color: '#78350F' },
                                children: `"${quote || copy.mainBannerDefinitionBody || 'Amanah rakyat tidak boleh diperjualbelikan demi kenyamanan kekuasaan.'}"`,
                              },
                            },
                          ],
                        },
                      },
                      {
                        type: 'p',
                        props: {
                          style: { fontSize: '10.5px', lineHeight: 1.45, color: '#1F2937', textAlign: 'justify', margin: '10px 0 0 0' },
                          children: copy.blocks?.['right_cause']?.body || 'Melalui pengawasan ketat dan transparansi kebijakan, setiap rupiah uang negara harus kembali menjadi kesejahteraan konkret bagi masyarakat.',
                        },
                      },
                    ],
                  },
                },
              ],
            },
          },

          // Member Footer Signature
          {
            type: 'div',
            props: {
              style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '2px solid #111827', paddingTop: '12px' },
              children: [
                {
                  type: 'div',
                  props: {
                    style: { display: 'flex', flexDirection: 'column' },
                    children: [
                      { type: 'span', props: { style: { fontWeight: 700, fontSize: '18px', color: '#111827' }, children: memberName.toUpperCase() } },
                      { type: 'span', props: { style: { fontSize: '11px', color: '#4B5563' }, children: memberTitle.toUpperCase() } },
                    ],
                  },
                },
                { type: 'span', props: { style: { fontSize: '11px', fontWeight: 700, color: primaryAccent }, children: 'POLARIS HISTORICAL ARCHIVE' } },
              ],
            },
          },
        ],
      },
    };
  }

  /**
   * composePoster: Merakit Kolase AI + Subjek Harmonized + Tipografi Vektor Satori
   */
  public static async composePoster(
    options: ComposeCreativePosterOptions
  ): Promise<ComposedPosterResult> {
    const {
      backgroundBuffer,
      subjectPhotoBuffer,
      officialLogoBuffer,
      headline,
      quote,
      memberName,
      memberTitle = 'ANGGOTA PARLEMEN',
      archetype = 'STREET_JOURNALISM',
      compositionMode = 'PUBLIC_ADVOCACY',
      synthesizedCopy,
      primaryAccentColor = '#9E0B0F',
      canvasWidth = 1080,
      canvasHeight = 1350,
      editionTag = 'POLARIS ADVOKASI',
      outputFormat = 'webp',
    } = options;

    // 1. Normalisasi Kanvas Dasar AI
    const baseCanvas = sharp(backgroundBuffer).resize({
      width: canvasWidth,
      height: canvasHeight,
      fit: 'cover',
      position: 'center',
    });

    const compositeLayers: sharp.OverlayOptions[] = [];

    // 2. Siapkan Logo Partai/Lembaga (Layer Terkunci)
    let logoDataUri: string | undefined;
    if (officialLogoBuffer && officialLogoBuffer.length > 0) {
      logoDataUri = `data:image/png;base64,${officialLogoBuffer.toString('base64')}`;
    }

    // 3. Render Layer Tipografi Vektor via Satori (Polymorphic Layout Builder)
    const fonts = await this.getFonts();
    const copyData: SynthesizedEditorialCopy = synthesizedCopy || {
      mainBannerTitle: headline.slice(0, 22),
      mainBannerSubheader: `PENGEMBANGAN KEBIJAKAN PUBLIK • Get to Know More`,
      mainBannerDefinitionBody: quote || headline,
      blocks: {},
      mappedVisualCutouts: {},
    };

    // 3.5. Jika TORN_PAPER_NEWS, tambahkan Layer Mask Sobekan Kertas (Torn Paper Wings)
    // sebelum foto tokoh dan tipografi Satori agar sobekan berada di atas foto background AI
    if (archetype === 'TORN_PAPER_NEWS') {
      const tornPaperMask = this.buildTornPaperWingsSvg(canvasWidth, canvasHeight);
      compositeLayers.push({
        input: tornPaperMask,
        left: 0,
        top: 0,
      });
    }

    // Percabangan Polimorfik: Dispatch ke Layout Builder yang sesuai dengan arketipe
    let vnode: any;

    if (archetype === 'STREET_JOURNALISM') {
      vnode = this.buildStreetJournalismCollageVNode({
        width: canvasWidth,
        height: canvasHeight,
        copy: copyData,
        memberName,
        memberTitle,
        editionTag,
        primaryAccent: primaryAccentColor,
        logoDataUri,
      });
    } else if (archetype === 'TORN_PAPER_NEWS') {
      const croppedThumbnails = await MultiRegionCropper.extractSubRegions(
        backgroundBuffer,
        [
          { id: 'thumb1', leftRatio: 0.05, topRatio: 0.25, widthRatio: 0.35, heightRatio: 0.20, targetWidth: 160, targetHeight: 100 },
          { id: 'thumb2', leftRatio: 0.05, topRatio: 0.70, widthRatio: 0.35, heightRatio: 0.20, targetWidth: 160, targetHeight: 100 },
        ],
        options.galleryPhotos
      );

      let qrCodeDataUri: string | undefined;
      try {
        qrCodeDataUri = await QRCode.toDataURL(
          'https://polaris.gov.id/advokasi/tanggap-darurat',
          { width: 140, margin: 1, color: { dark: '#111827', light: '#FAF8F5' } }
        );
      } catch {
        // Fallback gracefully
      }

      vnode = this.buildTornPaperVeritasVNode({
        width: canvasWidth,
        height: canvasHeight,
        headline,
        quote,
        copy: copyData,
        memberName,
        memberTitle,
        editionTag,
        primaryAccent: primaryAccentColor,
        croppedThumbnails,
        qrCodeDataUri,
      });
    } else if (archetype === 'RETRO_SPLIT_MITIGATION') {
      const croppedThumbnails = await MultiRegionCropper.extractSubRegions(
        backgroundBuffer,
        [
          { id: 'insetCircle', leftRatio: 0.30, topRatio: 0.20, widthRatio: 0.40, heightRatio: 0.40, targetWidth: 260, targetHeight: 260 },
        ],
        options.galleryPhotos
      );

      vnode = this.buildRetroMitigationVNode({
        width: canvasWidth,
        height: canvasHeight,
        headline,
        quote,
        copy: copyData,
        memberName,
        memberTitle,
        editionTag,
        primaryAccent: primaryAccentColor,
        croppedThumbnails,
        logoDataUri,
      });
    } else if (archetype === 'MODULAR_GRID_CARDS') {
      const croppedThumbnails = await MultiRegionCropper.extractSubRegions(
        backgroundBuffer,
        [
          { id: 'card1', leftRatio: 0.05, topRatio: 0.05, widthRatio: 0.45, heightRatio: 0.40, targetWidth: 280, targetHeight: 180, grayscale: true },
          { id: 'card2', leftRatio: 0.50, topRatio: 0.05, widthRatio: 0.45, heightRatio: 0.40, targetWidth: 280, targetHeight: 180, grayscale: true },
          { id: 'card3', leftRatio: 0.05, topRatio: 0.50, widthRatio: 0.45, heightRatio: 0.40, targetWidth: 280, targetHeight: 180, grayscale: true },
          { id: 'card4', leftRatio: 0.50, topRatio: 0.50, widthRatio: 0.45, heightRatio: 0.40, targetWidth: 280, targetHeight: 180, grayscale: true },
          { id: 'card5', leftRatio: 0.25, topRatio: 0.35, widthRatio: 0.50, heightRatio: 0.30, targetWidth: 280, targetHeight: 180, grayscale: true },
        ],
        options.galleryPhotos
      );

      vnode = this.buildModularCardsVNode({
        width: canvasWidth,
        height: canvasHeight,
        headline,
        quote,
        copy: copyData,
        memberName,
        memberTitle,
        editionTag,
        primaryAccent: primaryAccentColor,
        croppedThumbnails,
      });
    } else if (archetype === 'VINTAGE_PERSONA_GAZETTE') {
      const croppedThumbnails = await MultiRegionCropper.extractSubRegions(
        backgroundBuffer,
        [
          { id: 'subPhoto', leftRatio: 0.05, topRatio: 0.15, widthRatio: 0.45, heightRatio: 0.35, targetWidth: 320, targetHeight: 200 },
        ],
        options.galleryPhotos
      );

      vnode = this.buildVintageGazetteVNode({
        width: canvasWidth,
        height: canvasHeight,
        headline,
        quote,
        copy: copyData,
        memberName,
        memberTitle,
        editionTag,
        primaryAccent: primaryAccentColor,
        croppedThumbnails,
      });
    } else {
      vnode = this.buildStandardEditorialVNode({
        width: canvasWidth,
        height: canvasHeight,
        headline,
        quote,
        copy: copyData,
        memberName,
        memberTitle,
        editionTag,
        primaryAccent: primaryAccentColor,
        archetype,
        logoDataUri,
      });
    }

    const svgString = await satori(vnode, {
      width: canvasWidth,
      height: canvasHeight,
      fonts,
    });

    // 4. Jika Mode FIGURE_CENTERPIECE dan foto PNG Anggota Dewan tersedia:
    //    Harmonisasi foto dan masukkan ke compositeLayers SEBELUM layer tipografi SVG Satori!
    //    Sehingga teks tipografi dan kotak informasi selalu berada di Z-INDEX PALING ATAS.
    if (
      compositionMode === 'FIGURE_CENTERPIECE' &&
      subjectPhotoBuffer &&
      subjectPhotoBuffer.length > 0
    ) {
      if (archetype === 'STREET_JOURNALISM') {
        // Pada STREET_JOURNALISM: ukuran dan koordinat disesuaikan agar tidak menutupi kotak merah
        const targetW = Math.round(canvasWidth * 0.26);
        const targetH = Math.round(canvasHeight * 0.38);
        const harmonizedSubject = await this.harmonizeSubjectPhoto(
          subjectPhotoBuffer,
          archetype,
          targetW,
          targetH
        );

        compositeLayers.push({
          input: harmonizedSubject,
          left: Math.round(canvasWidth * 0.24),
          top: Math.round(canvasHeight * 0.30),
        });
      } else {
        // Pada arketipe HERO / STATEMENT / RETRO: letakkan tokoh secara proporsional di tengah kanvas
        const targetW = Math.round(canvasWidth * 0.44);
        const targetH = Math.round(canvasHeight * 0.60);
        const harmonizedSubject = await this.harmonizeSubjectPhoto(
          subjectPhotoBuffer,
          archetype,
          targetW,
          targetH
        );

        compositeLayers.push({
          input: harmonizedSubject,
          left: Math.round(canvasWidth * 0.28),
          top: Math.round(canvasHeight * 0.24),
        });
      }
    }

    // 5. Masukkan Layer Tipografi Vektor Satori (Z-Index paling depan / on top)
    compositeLayers.push({
      input: Buffer.from(svgString),
      top: 0,
      left: 0,
    });

    // 6. Eksekusi Komposisi Akhir
    const finalPipeline = baseCanvas.composite(compositeLayers);

    const outputBuffer =
      outputFormat === 'png'
        ? await finalPipeline.png().toBuffer()
        : await finalPipeline.webp({ quality: 92, effort: 4 }).toBuffer();

    return {
      buffer: outputBuffer,
      mimeType: outputFormat === 'png' ? 'image/png' : 'image/webp',
      sizeBytes: outputBuffer.length,
      width: canvasWidth,
      height: canvasHeight,
    };
  }
}
