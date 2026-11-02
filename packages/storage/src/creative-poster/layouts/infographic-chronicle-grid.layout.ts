import { SynthesizedEditorialCopy } from '../types.js';
import {
  wordSafeHeadlineTruncate,
  smartSentenceClamp,
} from '../core/adaptive-typography.js';

export interface InfographicChronicleGridLayoutProps {
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
 * Layout Infografis 02: KRONIK TOKOH & GRID SEJARAH (Inspirasi Template Soedirman)
 * Struktur Visual 1:1:
 * - Kolom Kiri (~32% lebar, 340px, Solid Terracotta Orange / Brand Accent):
 *   1. Tipografi Judul Masif Vertikal Stacked (Bebas Neue 80-90px)
 *   2. Subtitle / Tagline Putih Tebal (14.5px)
 *   3. Foto Potret Tokoh / Profil Anggota Dewan (Cutout Setengah Lingkaran Atas, Wajah Utuh 375px)
 *   4. Kartu Profil / Fakta Kunci (Header Hijau 16.5px + 4 Poin Huruf Besar 15px / 13px)
 *   5. Kartu Foto Aksen Bawah (Foto Arsip Lapangan 78px + Keterangan 13px)
 * - Kolom Kanan (~68% lebar, 740px, Warm Newsprint #FBF9F4):
 *   1. Tier 1: Header Hijau + Foto Fasilitas (180px) + 4 Timeline Poin (Tahun & Uraian 16px / 14px)
 *   2. Tier 2: 3 Poin Aksi Lapangan (15.5px) + Header Hijau + Foto Kegiatan (175px)
 *   3. Tier 3: Header Banner Lebar (16.5px) + 2 Foto Sisi (200px) + 5 Milestones (14.5px)
 *   4. Tier 4: Header Rute (16px) + Diagram Rute (15px / 13.5px) + Foto Dokumenter (195px)
 *   5. Tier 5: 2 Kartu Evaluasi & Capaian (14.5px / 13.5px) + Kartu QR Code Referensi (95px)
 */
export function buildInfographicChronicleGridLayout(params: InfographicChronicleGridLayoutProps): any {
  const {
    width,
    height,
    headline,
    quote,
    copy,
    memberName,
    memberTitle,
    editionTag,
    primaryAccent = '#E25822',
    secondaryAccent = '#2C5E43',
    subjectPhotoDataUri,
    croppedThumbnails = {},
    qrCodeDataUri,
  } = params;

  // Warna Konsisten Template
  const colLeftBg = primaryAccent || '#E25822';
  const headerGreen = secondaryAccent || '#2C5E43';
  const paperBg = '#FBF9F4';
  const textDark = '#111827';
  const textMuted = '#374151';

  // 1. Ekstrak Judul Stacked Kolom Kiri
  const rawTitle = (copy.mainBannerTitle || headline || 'POLARIS PUBLIK').trim().toUpperCase();
  const words = rawTitle.split(/\s+/).filter(Boolean);
  let titleLines: string[] = [];
  if (words.length >= 3) {
    titleLines = [words[0], words[1], words.slice(2).join(' ')];
  } else if (words.length === 2) {
    titleLines = [words[0], words[1]];
  } else {
    const w = words[0] || 'POLARIS';
    if (w.length >= 7) {
      const part1 = w.slice(0, Math.ceil(w.length / 3));
      const part2 = w.slice(Math.ceil(w.length / 3), Math.ceil((w.length * 2) / 3));
      const part3 = w.slice(Math.ceil((w.length * 2) / 3));
      titleLines = [part1, part2, part3];
    } else if (w.length >= 5) {
      titleLines = [w.slice(0, 3), w.slice(3)];
    } else {
      titleLines = [w];
    }
  }

  // 2. Tagline Subtitle & Topik Bersih
  const subhead = smartSentenceClamp(
    copy.mainBannerSubheader || quote || 'TRANSPARANSI KEBIJAKAN & ADVOKASI ASPIRASI WARGA',
    75
  ).toUpperCase();
  const topicClean = (headline || rawTitle || 'Kebijakan Publik').trim();

  // 3. Poin Profil Kolom Kiri (100% DINAMIS MENGGUNAKAN TOPIK USER & PROFIL DEWAN)
  const bioTitle = copy.blocks?.['bio_name']?.header || memberName || 'Tokoh Kebijakan';
  const bioPoints = [
    {
      label: copy.blocks?.['bio_1']?.header || 'Lokasi & Sasaran Wilayah',
      desc: copy.blocks?.['bio_1']?.body || `Fokus penanganan intensif terkait ${topicClean} di seluruh wilayah konstituen binaan.`,
    },
    {
      label: copy.blocks?.['bio_2']?.header || 'Latar Belakang Kebijakan',
      desc: copy.blocks?.['bio_2']?.body || `Berakar dari aspirasi warga serta kebutuhan mendesak masyarakat dalam pemenuhan fasilitas publik.`,
    },
    {
      label: copy.blocks?.['bio_3']?.header || 'Regulasi & Alokasi Dana',
      desc: copy.blocks?.['bio_3']?.body || `Didukung kepastian payung hukum standar serta pengawalan anggaran daerah yang transparan.`,
    },
    {
      label: copy.blocks?.['bio_4']?.header || 'Pengawasan Berkelanjutan',
      desc: copy.blocks?.['bio_4']?.body || `Komitmen pemantauan lapangan terpadu secara berkala guna memastikan program tuntas.`,
    },
  ];

  // 4. Data 5 Tier Kolom Kanan (100% DINAMIS MENGGUNAKAN TOPIK USER)
  // --- TIER 1 ---
  const tier1Header = copy.blocks?.['chronicle_1']?.header || 'RIWAYAT & LATAR BELAKANG';
  const tier1Items = (copy.numberedItems && copy.numberedItems.length >= 4)
    ? copy.numberedItems.slice(0, 4)
    : [
        { number: '01', title: 'Audit Kelayakan', summary: `Pemeriksaan teknis menyeluruh terhadap fasilitas dan regulasi terkait ${topicClean}.` },
        { number: '02', title: 'Respons Cepat', summary: 'Pengerahan tim terpadu untuk penanganan langsung di lapangan tanpa birokrasi berbelit.' },
        { number: '03', title: 'Bantuan Terpadu', summary: 'Distribusi dukungan langsung dan pelayanan terintegrasi bagi seluruh warga.' },
        { number: '04', title: 'Partisipasi Warga', summary: 'Membangun keterlibatan aktif komunitas dan forum aspirasi warga tingkat akar rumput.' },
      ];

  // --- TIER 2 ---
  const tier2Header = copy.blocks?.['chronicle_2']?.header || 'PERJUANGAN & KARIER';
  const tier2BodyRaw = copy.blocks?.['chronicle_2']?.body || '';
  let tier2Bullets: string[] = [];
  if (tier2BodyRaw) {
    const rawSentences = tier2BodyRaw
      .split(/(?<=[.!?])\s+/)
      .map((s) => s.trim().replace(/\.$/, ''))
      .filter((s) => s.length > 15);
    if (rawSentences.length >= 3) {
      tier2Bullets = rawSentences.slice(0, 3).map((s) => `${s}.`);
    } else if (rawSentences.length === 2) {
      tier2Bullets = [
        `${rawSentences[0]}.`,
        `${rawSentences[1]}.`,
        `Pemberian pendampingan intensif untuk memastikan realisasi ${topicClean} dirasakan langsung oleh masyarakat.`,
      ];
    } else {
      tier2Bullets = [
        `${rawSentences[0] || `Pengerahan unit layanan langsung ke titik pemukiman warga terkait ${topicClean}`}.`,
        `Penguatan alokasi fasilitas dan dukungan operasional terpadu di lapangan.`,
        `Pemberian pendampingan intensif untuk memastikan manfaat dirasakan langsung oleh masyarakat.`,
      ];
    }
  } else {
    tier2Bullets = [
      `Pemerintah daerah berkomitmen meningkatkan mutu pelayanan dan infrastruktur terkait ${topicClean}.`,
      `Alokasi anggaran difokuskan pada pemenuhan kebutuhan mendesak masyarakat secara tepat sasaran.`,
      `Pemberian pendampingan intensif untuk memastikan manfaat program dirasakan langsung oleh warga.`,
    ];
  }

  // --- TIER 3 ---
  const tier3Header = copy.blocks?.['chronicle_3']?.header || 'MOMENTUM KRUSIAL';
  const tier3BodyRaw = copy.blocks?.['chronicle_3']?.body || '';
  let tier3Milestones: string[] = [
    'Tahap 1: Identifikasi Kebutuhan Mendesak & Pemetaan Sasaran Lapangan',
    'Tahap 2: Pengesahan Regulasi & Dukungan Anggaran Operasional Terpadu',
    'Tahap 3: Mobilisasi Fasilitas & Distribusi Perlengkapan Pelayanan Warga',
    'Tahap 4: Pelaksanaan Layanan Langsung Terintegrasi untuk Masyarakat',
    'Tahap 5: Pengawasan Berkala & Evaluasi Mutu Mutlak Berkelanjutan',
  ];
  if (tier3BodyRaw) {
    const rawSentences = tier3BodyRaw
      .split(/(?<=[.!?])\s+/)
      .map((s) => s.trim().replace(/\.$/, ''))
      .filter((s) => s.length > 12);
    if (rawSentences.length >= 4) {
      tier3Milestones = rawSentences.slice(0, 5).map((s, idx) => `Tahap ${idx + 1}: ${s}`);
    }
  }

  // --- TIER 4 ---
  const tier4Header = copy.blocks?.['chronicle_4']?.header || 'PENGAWASAN & PENANGANAN';
  const tier4BodyRaw = copy.blocks?.['chronicle_4']?.body || '';
  let tier4Points: string[] = [
    `Mobilisasi unit reaksi cepat menyisir titik sasaran warga secara berkala dan terukur.`,
    `Pemberian respons langsung terhadap kendala teknis dan aduan mendesak masyarakat.`,
    `Konsolidasi rutin bersama aparatur wilayah guna menjaga kesinambungan program.`,
  ];
  if (tier4BodyRaw) {
    const rawSentences = tier4BodyRaw
      .split(/(?<=[.!?])\s+/)
      .map((s) => s.trim().replace(/\.$/, ''))
      .filter((s) => s.length > 12);
    if (rawSentences.length >= 3) {
      tier4Points = rawSentences.slice(0, 3).map((s) => `${s}.`);
    }
  }
  const tier4Route = {
    start: 'Posko Wilayah',
    end: 'Titik Sasaran Warga',
    dist: 'Cakupan 100%',
    points: tier4Points,
  };

  // --- TIER 5 ---
  const tier5Header1 = copy.blocks?.['chronicle_5']?.header || 'TANTANGAN LAPANGAN';
  const tier5Body1 = copy.blocks?.['chronicle_5']?.body
    ? smartSentenceClamp(copy.blocks['chronicle_5'].body, 100)
    : `Tantangan utama adalah memastikan distribusi bantuan dan fasilitas ${topicClean} terlaksana secara merata.`;

  const tier5Header2 = copy.blocks?.['chronicle_6']?.header || 'CAPAIAN AKHIR & HARAPAN';
  const tier5Body2 = copy.blocks?.['chronicle_6']?.body
    ? smartSentenceClamp(copy.blocks['chronicle_6'].body, 100)
    : `Dengan pengawalan anggaran yang tepat, diharapkan manfaat ${topicClean} terus berkelanjutan bagi seluruh warga.`;

  // Resolusi Foto-foto Thumbnail
  const photoTier1 = croppedThumbnails['tier1_photo'] || croppedThumbnails['thumb1'] || null;
  const photoTier2 = croppedThumbnails['tier2_photo'] || croppedThumbnails['thumb2'] || null;
  const photoTier3Left = croppedThumbnails['tier3_photo1'] || null;
  const photoTier3Right = croppedThumbnails['tier3_photo2'] || null;
  const photoTier4 = croppedThumbnails['tier4_photo'] || null;
  const photoTier5Left = croppedThumbnails['tier5_photo1'] || null;
  const photoTier5Right = croppedThumbnails['tier5_photo2'] || null;
  const photoBottomLeft = croppedThumbnails['bottom_left_thumb'] || null;

  return {
    type: 'div',
    props: {
      style: {
        width: `${width}px`,
        height: `${height}px`,
        display: 'flex',
        flexDirection: 'row',
        backgroundColor: paperBg,
        boxSizing: 'border-box',
        overflow: 'hidden',
        position: 'relative',
        fontFamily: 'Plus Jakarta Sans',
      },
      children: [
        // =====================================================================
        // KOLOM KIRI (LEBAR ~32%, 340px, SOLID ORANGE / ACCENT TONE)
        // =====================================================================
        {
          type: 'div',
          props: {
            style: {
              width: '340px',
              height: '100%',
              backgroundColor: colLeftBg,
              display: 'flex',
              flexDirection: 'column',
              padding: '36px 18px 18px 18px',
              boxSizing: 'border-box',
              color: '#FFFFFF',
              justifyContent: 'space-between',
              borderRight: '2.5px solid rgba(0,0,0,0.15)',
            },
            children: [
              // Bagian Atas: Judul Stacked & Subhead
              {
                type: 'div',
                props: {
                  style: { display: 'flex', flexDirection: 'column' },
                  children: [
                    // Giant Stacked Headline
                    {
                      type: 'div',
                      props: {
                        style: {
                          display: 'flex',
                          flexDirection: 'column',
                          fontFamily: 'Bebas Neue',
                          fontSize: titleLines.length >= 3 ? '78px' : '90px',
                          lineHeight: '0.85',
                          fontWeight: 900,
                          letterSpacing: '0.5px',
                          color: '#FFFFFF',
                          textShadow: '0 2px 6px rgba(0,0,0,0.3)',
                        },
                        children: titleLines.map((line) => ({
                          type: 'span',
                          props: { children: line },
                        })),
                      },
                    },
                    // Subhead Deskriptif
                    {
                      type: 'div',
                      props: {
                        style: {
                          fontSize: '15px',
                          fontWeight: 800,
                          lineHeight: 1.35,
                          marginTop: '10px',
                          color: '#FFFFFF',
                          letterSpacing: '0.04em',
                          borderTop: '2.5px solid rgba(255,255,255,0.45)',
                          paddingTop: '8px',
                        },
                        children: subhead,
                      },
                    },
                  ],
                },
              },

              // Hero Portrait Cutout Tokoh / Pengguna (ANTI-KEPOTONG: 415px, top center)
              {
                type: 'div',
                props: {
                  style: {
                    width: '304px',
                    height: '415px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '4px 0',
                    position: 'relative',
                  },
                  children: [
                    subjectPhotoDataUri
                      ? {
                          type: 'div',
                          props: {
                            style: {
                              width: '294px',
                              height: '410px',
                              borderRadius: '147px 147px 0 0',
                              border: '4.5px solid #FFFFFF',
                              overflow: 'hidden',
                              backgroundColor: '#E5E7EB',
                              display: 'flex',
                              alignItems: 'flex-start',
                              justifyContent: 'center',
                              boxShadow: '0 10px 26px rgba(0,0,0,0.35)',
                            },
                            children: [
                              {
                                type: 'img',
                                props: {
                                  src: subjectPhotoDataUri,
                                  style: {
                                    width: '100%',
                                    height: '100%',
                                    objectFit: 'cover',
                                    objectPosition: 'top center',
                                  },
                                },
                              },
                            ],
                          },
                        }
                      : {
                          // Fallback Stylized Silhouette / Medal Profile
                          type: 'div',
                          props: {
                            style: {
                              width: '294px',
                              height: '410px',
                              borderRadius: '147px 147px 0 0',
                              border: '4.5px solid #FFFFFF',
                              backgroundColor: 'rgba(255,255,255,0.18)',
                              display: 'flex',
                              flexDirection: 'column',
                              alignItems: 'center',
                              justifyContent: 'center',
                              padding: '24px',
                              textAlign: 'center',
                            },
                            children: [
                              {
                                type: 'span',
                                props: {
                                  style: { fontFamily: 'Bebas Neue', fontSize: '42px', color: '#FFFFFF' },
                                  children: 'TOKOH KEBIJAKAN',
                                },
                              },
                              {
                                type: 'span',
                                props: {
                                  style: { fontSize: '14px', color: 'rgba(255,255,255,0.9)', marginTop: '8px', fontWeight: 700 },
                                  children: memberTitle || 'Dedikasi Nyata untuk Warga',
                                },
                              },
                            ],
                          },
                        },
                  ],
                },
              },

              // Kartu Profil & Fakta Kunci (FONT BESAR, JELAS & PADAT: 15.5px / 14px)
              {
                type: 'div',
                props: {
                  style: {
                    backgroundColor: '#FFFFFF',
                    borderRadius: '10px',
                    padding: '16px 16px',
                    color: textDark,
                    boxShadow: '0 6px 16px rgba(0,0,0,0.18)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '12px',
                  },
                  children: [
                    // Badge Header Hijau
                    {
                      type: 'div',
                      props: {
                        style: {
                          backgroundColor: headerGreen,
                          color: '#FFFFFF',
                          padding: '8px 14px',
                          borderRadius: '5px',
                          fontSize: '17px',
                          fontWeight: 900,
                          textAlign: 'center',
                          letterSpacing: '0.04em',
                        },
                        children: bioTitle,
                      },
                    },
                    // 4 Poin Biodata / Fakta
                    ...bioPoints.map((pt) => ({
                      type: 'div',
                      props: {
                        style: { display: 'flex', flexDirection: 'row', alignItems: 'flex-start', gap: '9px' },
                        children: [
                          {
                            type: 'div',
                            props: {
                              style: {
                                width: '9px',
                                height: '9px',
                                backgroundColor: colLeftBg,
                                marginTop: '5px',
                                flexShrink: 0,
                              },
                            },
                          },
                          {
                            type: 'div',
                            props: {
                              style: { display: 'flex', flexDirection: 'column' },
                              children: [
                                {
                                  type: 'span',
                                  props: {
                                    style: { fontSize: '15.5px', fontWeight: 900, color: textDark, lineHeight: 1.25 },
                                    children: pt.label,
                                  },
                                },
                                {
                                  type: 'span',
                                  props: {
                                    style: { fontSize: '14px', color: '#1F2937', lineHeight: 1.38, marginTop: '3px', fontWeight: 600 },
                                    children: pt.desc,
                                  },
                                },
                              ],
                            },
                          },
                        ],
                      },
                    })),
                  ],
                },
              },

              // Aksen Foto Bawah Kolom Kiri
              {
                type: 'div',
                props: {
                  style: {
                    display: 'flex',
                    flexDirection: 'row',
                    gap: '12px',
                    alignItems: 'center',
                    backgroundColor: 'rgba(0,0,0,0.28)',
                    padding: '12px',
                    borderRadius: '8px',
                    marginTop: '4px',
                  },
                  children: [
                    photoBottomLeft
                      ? {
                          type: 'img',
                          props: {
                            src: photoBottomLeft,
                            style: { width: '84px', height: '84px', objectFit: 'cover', borderRadius: '6px' },
                          },
                        }
                      : {
                          type: 'div',
                          props: {
                            style: {
                              width: '84px',
                              height: '84px',
                              backgroundColor: 'rgba(255,255,255,0.2)',
                              borderRadius: '6px',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: '12px',
                              fontWeight: 900,
                              textAlign: 'center',
                            },
                            children: 'DOKUMEN',
                          },
                        },
                    {
                      type: 'span',
                      props: {
                        style: { fontSize: '13.5px', lineHeight: 1.4, color: '#FFFFFF', flex: 1, fontWeight: 600 },
                        children: copy.mainBannerDefinitionBody
                          ? smartSentenceClamp(copy.mainBannerDefinitionBody, 85)
                          : 'Dokumentasi arsip dan rekam jejak perjuangan yang menjadi inspirasi kebijakan.',
                      },
                    },
                  ],
                },
              },
            ],
          },
        },

        // =====================================================================
        // KOLOM KANAN (LEBAR ~68%, 740px, DENSE STRUCTURED CHRONICLE GRID)
        // =====================================================================
        {
          type: 'div',
          props: {
            style: {
              width: '740px',
              height: '100%',
              backgroundColor: paperBg,
              display: 'flex',
              flexDirection: 'column',
              padding: '14px 20px 14px 20px',
              boxSizing: 'border-box',
              justifyContent: 'space-between',
            },
            children: [
              // ---------------------------------------------------------------
              // TIER 1: PENDIDIKAN / LATAR BELAKANG (Height ~255px)
              // ---------------------------------------------------------------
              {
                type: 'div',
                props: {
                  style: {
                    display: 'flex',
                    flexDirection: 'row',
                    gap: '16px',
                    paddingBottom: '8px',
                    borderBottom: '2px solid #CBD5E1',
                    alignItems: 'stretch',
                  },
                  children: [
                    // Sisi Kiri Tier 1: Header + Foto
                    {
                      type: 'div',
                      props: {
                        style: { width: '320px', display: 'flex', flexDirection: 'column', gap: '6px' },
                        children: [
                          {
                            type: 'div',
                            props: {
                              style: {
                                backgroundColor: headerGreen,
                                color: '#FFFFFF',
                                padding: '8px 14px',
                                borderRadius: '4px',
                                fontSize: '16.5px',
                                fontWeight: 900,
                                lineHeight: 1.3,
                                letterSpacing: '0.02em',
                              },
                              children: tier1Header,
                            },
                          },
                          photoTier1
                            ? {
                                type: 'img',
                                props: {
                                  src: photoTier1,
                                  style: { width: '100%', height: '205px', objectFit: 'cover', borderRadius: '4px' },
                                },
                              }
                            : {
                                type: 'div',
                                props: {
                                  style: {
                                    width: '100%',
                                    height: '205px',
                                    backgroundColor: '#E5E7EB',
                                    borderRadius: '4px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: '13px',
                                    color: textMuted,
                                    fontWeight: 800,
                                  },
                                  children: 'DOKUMENTASI FASE AWAL',
                                },
                              },
                        ],
                      },
                    },
                    // Sisi Kanan Tier 1: 4 Timeline Bullets (FONT BESAR: 16px / 14.5px)
                    {
                      type: 'div',
                      props: {
                        style: { flex: 1, display: 'flex', flexDirection: 'column', gap: '10px', justifyContent: 'center' },
                        children: tier1Items.map((item) => ({
                          type: 'div',
                          props: {
                            style: { display: 'flex', flexDirection: 'row', gap: '9px', alignItems: 'flex-start' },
                            children: [
                              {
                                type: 'div',
                                props: {
                                  style: { width: '10px', height: '10px', backgroundColor: colLeftBg, marginTop: '4px', flexShrink: 0 },
                                },
                              },
                              {
                                type: 'div',
                                props: {
                                  style: { display: 'flex', flexDirection: 'column' },
                                  children: [
                                    {
                                      type: 'span',
                                      props: {
                                        style: { fontSize: '16px', fontWeight: 900, color: textDark },
                                        children: `${item.title} (${item.number})`,
                                      },
                                    },
                                    {
                                      type: 'span',
                                      props: {
                                        style: { fontSize: '14.5px', color: '#1F2937', lineHeight: 1.38, marginTop: '2px', fontWeight: 500 },
                                        children: item.summary,
                                      },
                                    },
                                  ],
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

              // ---------------------------------------------------------------
              // TIER 2: PENGABDIAN & KARIER AWAL (Height ~245px)
              // ---------------------------------------------------------------
              {
                type: 'div',
                props: {
                  style: {
                    display: 'flex',
                    flexDirection: 'row',
                    gap: '16px',
                    paddingBottom: '8px',
                    borderBottom: '2px solid #CBD5E1',
                    alignItems: 'stretch',
                  },
                  children: [
                    // Sisi Kiri Tier 2: 3 Bullets Penjelasan (FONT BESAR: 15.5px)
                    {
                      type: 'div',
                      props: {
                        style: { flex: 1, display: 'flex', flexDirection: 'column', gap: '16px', justifyContent: 'center' },
                        children: tier2Bullets.map((txt) => ({
                          type: 'div',
                          props: {
                            style: { display: 'flex', flexDirection: 'row', gap: '10px', alignItems: 'flex-start' },
                            children: [
                              {
                                type: 'div',
                                props: {
                                  style: { width: '10px', height: '10px', backgroundColor: colLeftBg, marginTop: '5px', flexShrink: 0 },
                                },
                              },
                              {
                                type: 'span',
                                props: {
                                  style: { fontSize: '15.5px', color: textDark, lineHeight: 1.45, fontWeight: 700 },
                                  children: txt,
                                },
                              },
                            ],
                          },
                        })),
                      },
                    },
                    // Sisi Kanan Tier 2: Header + Foto Gedung
                    {
                      type: 'div',
                      props: {
                        style: { width: '320px', display: 'flex', flexDirection: 'column', gap: '6px' },
                        children: [
                          {
                            type: 'div',
                            props: {
                              style: {
                                backgroundColor: headerGreen,
                                color: '#FFFFFF',
                                padding: '8px 14px',
                                borderRadius: '4px',
                                fontSize: '16.5px',
                                fontWeight: 900,
                                lineHeight: 1.3,
                                letterSpacing: '0.02em',
                              },
                              children: tier2Header,
                            },
                          },
                          photoTier2
                            ? {
                                type: 'img',
                                props: {
                                  src: photoTier2,
                                  style: { width: '100%', height: '195px', objectFit: 'cover', borderRadius: '4px' },
                                },
                              }
                            : {
                                type: 'div',
                                props: {
                                  style: {
                                    width: '100%',
                                    height: '195px',
                                    backgroundColor: '#E5E7EB',
                                    borderRadius: '4px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: '13px',
                                    color: textMuted,
                                    fontWeight: 800,
                                  },
                                  children: 'DOKUMENTASI PROGRAM',
                                },
                              },
                        ],
                      },
                    },
                  ],
                },
              },

              // ---------------------------------------------------------------
              // TIER 3: FASE PUNCAK / STRATEGIS (Height ~285px)
              // ---------------------------------------------------------------
              {
                type: 'div',
                props: {
                  style: {
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '8px',
                    paddingBottom: '8px',
                    borderBottom: '2px solid #CBD5E1',
                  },
                  children: [
                    // Header Banner Lebar
                    {
                      type: 'div',
                      props: {
                        style: {
                          backgroundColor: headerGreen,
                          color: '#FFFFFF',
                          padding: '8px 16px',
                          borderRadius: '4px',
                          fontSize: '17px',
                          fontWeight: 900,
                          letterSpacing: '0.02em',
                        },
                        children: tier3Header,
                      },
                    },
                    // Konten: Foto Kiri + Milestones Tengah + Foto Kanan
                    {
                      type: 'div',
                      props: {
                        style: { display: 'flex', flexDirection: 'row', gap: '14px', alignItems: 'center' },
                        children: [
                          photoTier3Left
                            ? {
                                type: 'img',
                                props: {
                                  src: photoTier3Left,
                                  style: { width: '185px', height: '220px', objectFit: 'cover', borderRadius: '4px' },
                                },
                              }
                            : {
                                type: 'div',
                                props: {
                                  style: {
                                    width: '185px',
                                    height: '220px',
                                    backgroundColor: '#E5E7EB',
                                    borderRadius: '4px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: '13px',
                                    color: textMuted,
                                    textAlign: 'center',
                                    padding: '8px',
                                    fontWeight: 800,
                                  },
                                  children: 'DOKUMENTASI PERSIAPAN',
                                },
                              },
                          // 5 Milestones Bullet Tengah (FONT BESAR: 15px)
                          {
                            type: 'div',
                            props: {
                              style: { flex: 1, display: 'flex', flexDirection: 'column', gap: '10px' },
                              children: tier3Milestones.map((ms) => ({
                                type: 'div',
                                props: {
                                  style: { display: 'flex', flexDirection: 'row', gap: '9px', alignItems: 'center' },
                                  children: [
                                    {
                                      type: 'div',
                                      props: {
                                        style: { width: '9px', height: '9px', backgroundColor: colLeftBg, flexShrink: 0 },
                                      },
                                    },
                                    {
                                      type: 'span',
                                      props: {
                                        style: { fontSize: '15px', fontWeight: 800, color: textDark, lineHeight: 1.38 },
                                        children: ms,
                                      },
                                    },
                                  ],
                                },
                              })),
                            },
                          },
                          photoTier3Right
                            ? {
                                type: 'img',
                                props: {
                                  src: photoTier3Right,
                                  style: { width: '185px', height: '220px', objectFit: 'cover', borderRadius: '4px' },
                                },
                              }
                            : {
                                type: 'div',
                                props: {
                                  style: {
                                    width: '185px',
                                    height: '220px',
                                    backgroundColor: '#E5E7EB',
                                    borderRadius: '4px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: '13px',
                                    color: textMuted,
                                    textAlign: 'center',
                                    padding: '8px',
                                    fontWeight: 800,
                                  },
                                  children: 'DOKUMENTASI PELAKSANAAN',
                                },
                              },
                        ],
                      },
                    },
                  ],
                },
              },

              // ---------------------------------------------------------------
              // TIER 4: TAKTIK & RUTE PERJALANAN / PENGAWASAN (Height ~265px)
              // ---------------------------------------------------------------
              {
                type: 'div',
                props: {
                  style: {
                    display: 'flex',
                    flexDirection: 'row',
                    gap: '16px',
                    paddingBottom: '8px',
                    borderBottom: '2px solid #CBD5E1',
                    alignItems: 'stretch',
                  },
                  children: [
                    // Kiri: Header + Diagram Rute
                    {
                      type: 'div',
                      props: {
                        style: { flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' },
                        children: [
                          {
                            type: 'div',
                            props: {
                              style: {
                                backgroundColor: headerGreen,
                                color: '#FFFFFF',
                                padding: '8px 14px',
                                borderRadius: '4px',
                                fontSize: '16.5px',
                                fontWeight: 900,
                              },
                              children: tier4Header,
                            },
                          },
                          // Rute Callout Box (FONT BESAR: 16px / 14.5px)
                          {
                            type: 'div',
                            props: {
                              style: {
                                backgroundColor: '#F1F5F9',
                                borderRadius: '8px',
                                padding: '14px 16px',
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '10px',
                              },
                              children: [
                                {
                                  type: 'div',
                                  props: {
                                    style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
                                    children: [
                                      {
                                        type: 'span',
                                        props: {
                                          style: { fontSize: '16px', fontWeight: 900, color: colLeftBg },
                                          children: `📍 ${tier4Route.start} ➔ ${tier4Route.end}`,
                                        },
                                      },
                                      {
                                        type: 'span',
                                        props: {
                                          style: { fontSize: '14.5px', fontWeight: 800, color: '#334155' },
                                          children: tier4Route.dist,
                                        },
                                      },
                                    ],
                                  },
                                },
                                ...tier4Route.points.map((pt) => ({
                                  type: 'span',
                                  props: {
                                    style: { fontSize: '14.5px', color: '#1E293B', lineHeight: 1.42, fontWeight: 600 },
                                    children: `• ${pt}`,
                                  },
                                })),
                              ],
                            },
                          },
                        ],
                      },
                    },
                    // Kanan: Foto Lapangan (Besar 320x210px)
                    photoTier4
                      ? {
                          type: 'img',
                          props: {
                            src: photoTier4,
                            style: { width: '320px', height: '210px', objectFit: 'cover', borderRadius: '4px' },
                          },
                        }
                      : {
                          type: 'div',
                          props: {
                            style: {
                              width: '320px',
                              height: '210px',
                              backgroundColor: '#E5E7EB',
                              borderRadius: '4px',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: '13px',
                              color: textMuted,
                              textAlign: 'center',
                              padding: '10px',
                              fontWeight: 800,
                            },
                            children: 'DOKUMENTASI AKSI LAPANGAN',
                          },
                        },
                  ],
                },
              },

              // ---------------------------------------------------------------
              // TIER 5: FASE AKHIR & KARTU REFERENSI QR CODE (Height ~235px)
              // ---------------------------------------------------------------
              {
                type: 'div',
                props: {
                  style: { display: 'flex', flexDirection: 'row', gap: '14px', alignItems: 'stretch' },
                  children: [
                    // Box 1 (Tantangan)
                    {
                      type: 'div',
                      props: {
                        style: { flex: 1, display: 'flex', flexDirection: 'column', gap: '6px' },
                        children: [
                          {
                            type: 'div',
                            props: {
                              style: {
                                backgroundColor: headerGreen,
                                color: '#FFFFFF',
                                padding: '7px 12px',
                                borderRadius: '4px',
                                fontSize: '15.5px',
                                fontWeight: 900,
                              },
                              children: tier5Header1,
                            },
                          },
                          {
                            type: 'div',
                            props: {
                              style: { display: 'flex', flexDirection: 'row', gap: '10px', alignItems: 'center' },
                              children: [
                                photoTier5Left
                                  ? {
                                      type: 'img',
                                      props: {
                                        src: photoTier5Left,
                                        style: { width: '115px', height: '115px', objectFit: 'cover', borderRadius: '4px' },
                                      },
                                    }
                                  : {
                                      type: 'div',
                                      props: {
                                        style: { width: '115px', height: '115px', backgroundColor: '#E5E7EB', borderRadius: '4px' },
                                      },
                                    },
                                {
                                  type: 'span',
                                  props: {
                                    style: { fontSize: '14px', color: '#1E293B', lineHeight: 1.42, flex: 1, fontWeight: 600 },
                                    children: tier5Body1,
                                  },
                                },
                              ],
                            },
                          },
                        ],
                      },
                    },
                    // Box 2 (Capaian Akhir)
                    {
                      type: 'div',
                      props: {
                        style: { flex: 1, display: 'flex', flexDirection: 'column', gap: '6px' },
                        children: [
                          {
                            type: 'div',
                            props: {
                              style: {
                                backgroundColor: headerGreen,
                                color: '#FFFFFF',
                                padding: '7px 12px',
                                borderRadius: '4px',
                                fontSize: '15.5px',
                                fontWeight: 900,
                              },
                              children: tier5Header2,
                            },
                          },
                          {
                            type: 'div',
                            props: {
                              style: { display: 'flex', flexDirection: 'row', gap: '10px', alignItems: 'center' },
                              children: [
                                photoTier5Right
                                  ? {
                                      type: 'img',
                                      props: {
                                        src: photoTier5Right,
                                        style: { width: '115px', height: '115px', objectFit: 'cover', borderRadius: '4px' },
                                      },
                                    }
                                  : {
                                      type: 'div',
                                      props: {
                                        style: { width: '115px', height: '115px', backgroundColor: '#E5E7EB', borderRadius: '4px' },
                                      },
                                    },
                                {
                                  type: 'span',
                                  props: {
                                    style: { fontSize: '14px', color: '#1E293B', lineHeight: 1.42, flex: 1, fontWeight: 600 },
                                    children: tier5Body2,
                                  },
                                },
                              ],
                            },
                          },
                        ],
                      },
                    },
                    // Box 3: REFERENSI QR CODE RESMI (Besar 140px, QR 95px)
                    {
                      type: 'div',
                      props: {
                        style: {
                          width: '150px',
                          backgroundColor: colLeftBg,
                          borderRadius: '8px',
                          padding: '12px',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '8px',
                          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                        },
                        children: [
                          {
                            type: 'span',
                            props: {
                              style: { fontSize: '15px', fontWeight: 900, color: '#FFFFFF', letterSpacing: '0.04em' },
                              children: 'Referensi',
                            },
                          },
                          qrCodeDataUri
                            ? {
                                type: 'img',
                                props: {
                                  src: qrCodeDataUri,
                                  style: {
                                    width: '100px', height: '100px',
                                    backgroundColor: '#FFFFFF',
                                    padding: '4px',
                                    borderRadius: '6px',
                                  },
                                },
                              }
                            : {
                                type: 'div',
                                props: { style: { width: '100px', height: '100px', backgroundColor: '#FFFFFF', borderRadius: '6px' } },
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
      ],
    },
  };
}
