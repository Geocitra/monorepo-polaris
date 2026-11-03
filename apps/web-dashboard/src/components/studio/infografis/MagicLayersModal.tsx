'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import {
  Canvas as FabricCanvas,
  FabricImage,
  Textbox,
  Shadow,
  FabricObject,
} from 'fabric';
import {
  Layers,
  Type,
  Image as ImageIcon,
  Square,
  Trash2,
  Eye,
  EyeOff,
  Lock,
  Unlock,
  ArrowUp,
  ArrowDown,
  Wand2,
  Sparkles,
  Download,
  Save,
  Bold,
  Italic,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Plus,
  Loader2,
  Check,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Copy,
  ChevronRight,
  ArrowLeft,
  Edit3,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/toast';

interface MagicLayersModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageUrl: string;
  initialTitle?: string;
  initialAuthor?: string;
  initialSubtitle?: string;
  aspectRatio?: string;
  archetype?: string;
  publicationId?: string;
  savedLayersJson?: string;
  onApplyChanges: (renderedImageUrl: string, layersJson: string) => void;
}

export type PosterArchetype =
  | 'INFOGRAPHIC_ADVOCACY_PILLARS'
  | 'INFOGRAPHIC_NARRATIVE_WAVE'
  | 'INFOGRAPHIC_CHRONICLE_GRID'
  | 'INFOGRAPHIC_RADIAL_CLOCK'
  | 'INFOGRAPHIC_VISIONARY_TIMELINE'
  | 'GENERIC_INFOGRAPHIC';

/**
 * Deteksi tata letak poster secara cerdas berdasarkan archetype backend atau analisis judul/naskah.
 */
export function detectPosterLayout(
  archetype?: string,
  title?: string,
  subtitle?: string
): PosterArchetype {
  if (archetype) {
    if (archetype === 'INFOGRAPHIC_ADVOCACY_PILLARS') return 'INFOGRAPHIC_ADVOCACY_PILLARS';
    if (archetype === 'INFOGRAPHIC_NARRATIVE_WAVE') return 'INFOGRAPHIC_NARRATIVE_WAVE';
    if (archetype === 'INFOGRAPHIC_CHRONICLE_GRID') return 'INFOGRAPHIC_CHRONICLE_GRID';
    if (archetype === 'INFOGRAPHIC_RADIAL_CLOCK') return 'INFOGRAPHIC_RADIAL_CLOCK';
    if (archetype === 'INFOGRAPHIC_VISIONARY_TIMELINE') return 'INFOGRAPHIC_VISIONARY_TIMELINE';
  }

  const text = `${title || ''} ${subtitle || ''}`.toLowerCase();

  // 1. Poster 5 Pilar Advokasi (Kemiskinan Kota Bandung, Bantuan, APBD, dsb.)
  if (
    text.includes('kemiskinan') ||
    text.includes('5 pilar') ||
    text.includes('pilar aksi') ||
    text.includes('advocacy') ||
    text.includes('apbd') ||
    text.includes('bantuan langsung') ||
    text.includes('indikator')
  ) {
    return 'INFOGRAPHIC_ADVOCACY_PILLARS';
  }

  // 2. Poster Kronik & Rekam Jejak (Biografi Soedirman, Tokoh, Grid Arsip)
  if (
    text.includes('soedirman') ||
    text.includes('sudirman') ||
    text.includes('biografi') ||
    text.includes('guru teladan') ||
    text.includes('purbalingga') ||
    text.includes('kronik') ||
    text.includes('rekam jejak')
  ) {
    return 'INFOGRAPHIC_CHRONICLE_GRID';
  }

  // 3. Poster Jam Melingkar & Tonggak Sejarah (Radial Clock)
  if (
    text.includes('tonggak') ||
    text.includes('radial') ||
    text.includes('jam saku') ||
    text.includes('milestone')
  ) {
    return 'INFOGRAPHIC_RADIAL_CLOCK';
  }

  // 4. Poster Gelombang Naratif 4 Dimensi (Pelatihan Balai Kerja, Pengangguran, dsb.)
  if (
    text.includes('pengangguran') ||
    text.includes('pelatihan') ||
    text.includes('dimensi') ||
    text.includes('balai latihan') ||
    text.includes('gelombang') ||
    text.includes('s-curve')
  ) {
    return 'INFOGRAPHIC_NARRATIVE_WAVE';
  }

  // 5. Garis Waktu Visioner
  if (
    text.includes('visioner') ||
    text.includes('garis waktu') ||
    text.includes('timeline')
  ) {
    return 'INFOGRAPHIC_VISIONARY_TIMELINE';
  }

  return 'GENERIC_INFOGRAPHIC';
}

/**
 * Helper untuk membuat komponen interaktif Canva Fabric.js dengan:
 * - Bingkai ungu Canva (#7D2AE8) yang tegas dan rapi
 * - Latar belakang kartu yang solid (putih/krem)
 * - Teks tajam dengan kontras tinggi (Bukan stroke outline huruf berongga!)
 */
function createCanvaComponent(options: {
  id: string;
  name: string;
  left: number;
  top: number;
  width: number;
  text: string;
  fontSize: number;
  fontFamily?: string;
  fontWeight?: string | number;
  fontStyle?: '' | 'normal' | 'italic';
  textAlign?: 'left' | 'center' | 'right';
  textColor?: string;
  cardBg?: string;
  borderColor?: string;
  borderWidth?: number;
  lineHeight?: number;
  padding?: number;
}): Textbox {
  const tb = new Textbox(options.text, {
    originX: 'left',
    originY: 'top',
    left: options.left,
    top: options.top,
    width: options.width,
    fontSize: options.fontSize,
    fontFamily: options.fontFamily || "'Inter', sans-serif",
    fontWeight: options.fontWeight || 'normal',
    fontStyle: options.fontStyle || 'normal',
    textAlign: options.textAlign || 'left',
    fill: options.textColor || '#0F172A',
    stroke: undefined,
    strokeWidth: 0,
    backgroundColor: options.cardBg || 'rgba(255, 255, 255, 0.96)',
    padding: options.padding ?? 8,
    cornerColor: '#FFFFFF',
    cornerStrokeColor: '#7D2AE8',
    borderColor: '#7D2AE8',
    cornerSize: 8,
    cornerStyle: 'circle',
    transparentCorners: false,
    borderScaleFactor: 2,
    editable: true,
    lineHeight: options.lineHeight || 1.3,
    splitByGrapheme: false,
    shadow: new Shadow({ color: 'rgba(0,0,0,0.06)', blur: 6, offsetX: 0, offsetY: 2 }),
  });

  tb.setCoords();
  (tb as any).customId = options.id;
  (tb as any).customData = {
    name: options.name,
    isCanvaComponent: true,
    cardBg: options.cardBg,
    borderColor: options.borderColor || '#7D2AE8',
    borderWidth: options.borderWidth || 2,
  };

  // Override _renderBackground untuk menggambar garis tepi ungu Canva mengelilingi kartu
  const origRenderBg = tb._renderBackground.bind(tb);
  tb._renderBackground = function (ctx: CanvasRenderingContext2D) {
    origRenderBg(ctx);
    const dim = (this as any)._getNonTransformedDimensions();
    const x = -dim.x / 2;
    const y = -dim.y / 2;
    const w = dim.x;
    const h = dim.y;

    ctx.save();
    ctx.strokeStyle = options.borderColor || '#7D2AE8';
    ctx.lineWidth = options.borderWidth || 2;
    if (typeof (ctx as any).roundRect === 'function') {
      ctx.beginPath();
      (ctx as any).roundRect(x, y, w, h, 6);
      ctx.stroke();
    } else {
      ctx.strokeRect(x, y, w, h);
    }
    ctx.restore();
  };

  return tb;
}

interface LayerItem {
  id: string;
  name: string;
  type: string;
  visible: boolean;
  locked: boolean;
  object: FabricObject;
}

const PRESET_COLORS = [
  '#0F172A',
  '#FFFFFF',
  '#EA580C',
  '#C2410C',
  '#1E3A8A',
  '#065F46',
  '#7C3AED',
  '#64748B',
];

const PRESET_BG_COLORS = [
  { label: 'Transparan', value: 'transparent' },
  { label: 'Kertas Krem (#FAF8F5)', value: '#FAF8F5' },
  { label: 'Putih Bersih (#FFFFFF)', value: '#FFFFFF' },
  { label: 'Kartu Putih Transparan (90%)', value: 'rgba(255, 255, 255, 0.92)' },
  { label: 'Oranye Tonggak (#EA580C)', value: '#EA580C' },
  { label: 'Kartu Gelap (#0F172A)', value: 'rgba(15, 23, 42, 0.88)' },
  { label: 'Ungu Canva (#7C3AED)', value: '#7C3AED' },
];

const PRESET_FONTS = [
  { label: 'Inter / Modern Sans', value: "'Inter', sans-serif" },
  { label: 'Bebas Neue (Poster Bold)', value: "'Bebas Neue', sans-serif" },
  { label: 'Montserrat (Geometris)', value: "'Montserrat', sans-serif" },
  { label: 'Playfair Display (Serif)', value: "'Playfair Display', serif" },
  { label: 'Plus Jakarta Sans', value: "'Plus Jakarta Sans', sans-serif" },
  { label: 'System Default', value: 'system-ui, sans-serif' },
  { label: 'Monospace', value: 'monospace' },
];

/**
 * Normalisasi URL untuk mengatasi batasan CORS antarlocalhost (3000 vs 4000).
 * Mengembalikan URL absolut yang aman diakses dari browser / web worker.
 */
function resolveSafeImageUrl(url: string): string {
  if (!url) return '';
  const uploadsIdx = url.indexOf('/uploads/');
  if (uploadsIdx !== -1) {
    const relativePath = url.substring(uploadsIdx);
    if (typeof window !== 'undefined') {
      return `${window.location.origin}${relativePath}`;
    }
    return relativePath;
  }
  if (typeof window !== 'undefined' && url.startsWith('/')) {
    return `${window.location.origin}${url}`;
  }
  return url;
}

/**
 * Pemuat gambar Fabric.js yang kebal terhadap error CORS.
 * Menggunakan strategi bertingkat: blob lokal -> same-origin rewrite -> anonymous -> fallback.
 */
async function loadResilientFabricImage(url: string): Promise<FabricImage> {
  const safeUrl = resolveSafeImageUrl(url);

  // Strategi 1: Jika sudah berupa blob lokal atau data URI
  if (safeUrl.startsWith('blob:') || safeUrl.startsWith('data:')) {
    return await FabricImage.fromURL(safeUrl);
  }

  // Strategi 2: Fetch sebagai blob lokal (100% same-origin, mencegah error CORS)
  try {
    const res = await fetch(safeUrl);
    if (res.ok) {
      const blob = await res.blob();
      const localBlobUrl = URL.createObjectURL(blob);
      return await FabricImage.fromURL(localBlobUrl);
    }
  } catch (err) {
    console.warn('[MagicLayers] Fetch blob lokal gagal, mencoba direct loader:', err);
  }

  // Strategi 3: Coba muat dengan same-origin rewrite / direct dengan crossOrigin
  try {
    return await FabricImage.fromURL(safeUrl, { crossOrigin: 'anonymous' });
  } catch (err) {
    console.warn('[MagicLayers] crossOrigin anonymous gagal, mencoba fallback standar:', err);
  }

  // Strategi 4: Tanpa crossOrigin
  try {
    return await FabricImage.fromURL(safeUrl);
  } catch {
    // Strategi 5: Menggunakan URL asli
    return await FabricImage.fromURL(url);
  }
}

export interface ComponentSliceDef {
  id: string;
  name: string;
  text: string;
  x: number;
  y: number;
  w: number;
  h: number;
  textColor?: string;
  cardBg?: string;
  fontSize?: number;
  fontWeight?: string | number;
  fontStyle?: '' | 'normal' | 'italic';
  fontFamily?: string;
  textAlign?: 'left' | 'center' | 'right';
  padding?: number;
}

/**
 * Peta komponen per archetype untuk pemotongan irisan pixel-perfect dari poster asli.
 * Memastikan posisi, dimensi, dan isi teks 100% konsisten dengan desain poster.
 */
export function getArchetypeComponentDefs(
  archetype: PosterArchetype,
  naturalW: number,
  naturalH: number,
  title?: string,
  subtitle?: string,
  author?: string
): ComponentSliceDef[] {
  if (archetype === 'INFOGRAPHIC_ADVOCACY_PILLARS') {
    const headlineText = (title || 'KEMISKINAN DI KOTA BANDUNG DEMI TANTANGAN KITA').toUpperCase();
    const deckText = subtitle || 'Infografik Publik: KEMISKINAN DI KOTA BANDUNG DEMI TANTANGAN KITA';
    const authorText = author || 'DR. JONANDA P. A. B // DPRD PROVINSI • DAPIL JABAR';

    return [
      // 1. Top Bar Tag Header
      {
        id: `slice_toptag_${Date.now()}`,
        name: 'Top Tag: POLARIS // DAPIL JABAR',
        text: 'POLARIS // DAPIL JABAR                       DOKUMEN ADVOKASI PUBLIK',
        x: 0.045,
        y: 0.016,
        w: 0.910,
        h: 0.026,
        textColor: '#64748B',
        fontWeight: 'bold',
        fontSize: Math.round(naturalW * 0.012),
        cardBg: 'transparent',
      },
      // 2. Masthead Header Card (Kicker + Judul + Narasi Ringkas)
      {
        id: `slice_masthead_${Date.now()}`,
        name: 'Judul Utama: Kemiskinan Kota Bandung',
        text: `DATA KEMISKINAN DI JABAR // ANALISIS STRATEGIS\n${headlineText}\n${deckText}`,
        x: 0.045,
        y: 0.046,
        w: 0.910,
        h: 0.125,
        textColor: '#0F172A',
        fontWeight: 'bold',
        fontFamily: "'Bebas Neue', 'Inter', sans-serif",
        fontSize: Math.round(naturalW * 0.032),
        cardBg: '#FFFFFF',
      },
      // 3. 4 Kotak Metrik KPI Kemiskinan
      {
        id: `slice_stat_0_${Date.now()}`,
        name: 'Metrik 01: 9,3%',
        text: '9,3%\nPERSENTASE PENDUDUK MISKIN',
        x: 0.045,
        y: 0.174,
        w: 0.220,
        h: 0.082,
        textColor: '#B91C1C',
        fontWeight: 'bold',
        textAlign: 'center',
        fontSize: Math.round(naturalW * 0.018),
        cardBg: '#FFFFFF',
      },
      {
        id: `slice_stat_1_${Date.now()}`,
        name: 'Metrik 02: RP 1 TRILIUN',
        text: 'RP 1 TRILIUN\nTOTAL ANGGARAN PENGENTASAN',
        x: 0.275,
        y: 0.174,
        w: 0.220,
        h: 0.082,
        textColor: '#B91C1C',
        fontWeight: 'bold',
        textAlign: 'center',
        fontSize: Math.round(naturalW * 0.018),
        cardBg: '#FFFFFF',
      },
      {
        id: `slice_stat_2_${Date.now()}`,
        name: 'Metrik 03: 15 KELURAHAN',
        text: '15 KELURAHAN\nKONSENTRASI WILAYAH TERBANYAK',
        x: 0.505,
        y: 0.174,
        w: 0.220,
        h: 0.082,
        textColor: '#B91C1C',
        fontWeight: 'bold',
        textAlign: 'center',
        fontSize: Math.round(naturalW * 0.018),
        cardBg: '#FFFFFF',
      },
      {
        id: `slice_stat_3_${Date.now()}`,
        name: 'Metrik 04: 50%',
        text: '50%\nTARGET PENGURANGAN KEMISKINAN',
        x: 0.735,
        y: 0.174,
        w: 0.220,
        h: 0.082,
        textColor: '#B91C1C',
        fontWeight: 'bold',
        textAlign: 'center',
        fontSize: Math.round(naturalW * 0.018),
        cardBg: '#FFFFFF',
      },
      // 4. Banner Section Tag
      {
        id: `slice_section_tag_${Date.now()}`,
        name: 'Banner: PILAR AKSI & ADVOKASI',
        text: 'PILAR AKSI & ADVOKASI BERKELANJUTAN',
        x: 0.045,
        y: 0.450,
        w: 0.315,
        h: 0.026,
        textColor: '#FFFFFF',
        fontWeight: 'bold',
        textAlign: 'center',
        fontSize: Math.round(naturalW * 0.011),
        cardBg: '#DC2626',
      },
      // 5. 5 Kartu Pilar Aksi Utuh (Tinggi ~500px: badge ◈ 01..05 + judul + isi + tag ✦ INDIKATOR)
      {
        id: `slice_pillar_0_${Date.now()}`,
        name: 'Pilar 01: 3 KEBIJAKAN STRATEGIS',
        text: '◈ 01\n3 KEBIJAKAN STRATEGIS\n\nPemerintah Kota Bandung meluncurkan 3 kebijakan strategis untuk mengurangi kemiskinan; pendidikan, kesehatan dan pemberdayaan ekonomi dengan alokasi Rp 500 miliar.\n\n✦ INDIKATOR 01',
        x: 0.045,
        y: 0.480,
        w: 0.176,
        h: 0.380,
        textColor: '#1E293B',
        fontSize: Math.round(naturalW * 0.010),
        cardBg: '#FFFFFF',
      },
      {
        id: `slice_pillar_1_${Date.now()}`,
        name: 'Pilar 02: 5.000 KELUARGA BANTUAN',
        text: '◈ 02\n5.000 KELUARGA BANTUAN\n\nSebanyak 5.000 keluarga miskin menerima bantuan langsung tunai sebesar Rp 1 juta per tahun untuk meningkatkan daya beli dan akses terhadap kebutuhan dasar.\n\n✦ INDIKATOR 02',
        x: 0.2285,
        y: 0.480,
        w: 0.176,
        h: 0.380,
        textColor: '#1E293B',
        fontSize: Math.round(naturalW * 0.010),
        cardBg: '#FFFFFF',
      },
      {
        id: `slice_pillar_2_${Date.now()}`,
        name: 'Pilar 03: TARGET PENDIDIKAN 2024',
        text: '◈ 03\nTARGET PENDIDIKAN 2024\n\nMeningkatkan anggaran pendidikan hingga 20% dari APBD untuk memastikan anak-anak usia sekolah mendapatkan akses pendidikan yang layak.\n\n✦ INDIKATOR 03',
        x: 0.412,
        y: 0.480,
        w: 0.176,
        h: 0.380,
        textColor: '#1E293B',
        fontSize: Math.round(naturalW * 0.010),
        cardBg: '#FFFFFF',
      },
      {
        id: `slice_pillar_3_${Date.now()}`,
        name: 'Pilar 04: PROGRAM KEWIRAUSAHAAN',
        text: '◈ 04\nPROGRAM KEWIRAUSAHAAN\n\nMeluncurkan program pelatihan wirausaha dengan target 2.000 UMKM baru yang didukung dengan pelatihan dan akses modal.\n\n✦ INDIKATOR 04',
        x: 0.5955,
        y: 0.480,
        w: 0.176,
        h: 0.380,
        textColor: '#1E293B',
        fontSize: Math.round(naturalW * 0.010),
        cardBg: '#FFFFFF',
      },
      {
        id: `slice_pillar_4_${Date.now()}`,
        name: 'Pilar 05: AUDIT KEBIJAKAN TAHUNAN',
        text: '◈ 05\nAUDIT KEBIJAKAN TAHUNAN\n\nMelakukan audit tahunan terhadap semua program pengentasan kemiskinan guna memastikan transparansi dan akuntabilitas penggunaan anggaran.\n\n✦ INDIKATOR 05',
        x: 0.779,
        y: 0.480,
        w: 0.176,
        h: 0.380,
        textColor: '#1E293B',
        fontSize: Math.round(naturalW * 0.010),
        cardBg: '#FFFFFF',
      },
      // 6. Closing Takeaway Banner
      {
        id: `slice_closing_${Date.now()}`,
        name: 'Sintesis Penutup Kebijakan',
        text: 'Transparansi dan kolaborasi antara pemerintah dan masyarakat kunci dalam mengatasi kemiskinan di Kota Bandung.',
        x: 0.045,
        y: 0.865,
        w: 0.910,
        h: 0.040,
        textColor: '#0F172A',
        fontWeight: 'bold',
        textAlign: 'center',
        fontSize: Math.round(naturalW * 0.012),
        cardBg: '#FFFFFF',
      },
      // 7. Footer Bar
      {
        id: `slice_footer_${Date.now()}`,
        name: 'Identitas Dewan (Footer)',
        text: `${authorText}                      2026`,
        x: 0.045,
        y: 0.915,
        w: 0.910,
        h: 0.040,
        textColor: '#0F172A',
        fontWeight: 'bold',
        fontSize: Math.round(naturalW * 0.012),
        cardBg: '#FFFFFF',
      },
    ];
  }

  if (archetype === 'INFOGRAPHIC_CHRONICLE_GRID') {
    return [
      // 1. Masthead Kiri Oranye
      {
        id: `slice_soedirman_masthead_${Date.now()}`,
        name: 'Banner Masthead Tokoh',
        text: 'SOEDIRMAN\n\nSANG GURU TELADAN YANG MENJADI JENDERAL BESAR BANGSA INDONESIA',
        x: 0.045,
        y: 0.035,
        w: 0.315,
        h: 0.450,
        textColor: '#FFFFFF',
        fontWeight: 'bold',
        fontFamily: "'Bebas Neue', 'Inter', sans-serif",
        fontSize: Math.round(naturalW * 0.024),
        cardBg: '#EA580C',
      },
      // 2. Biodata Bawah Kiri
      {
        id: `slice_soedirman_bio_${Date.now()}`,
        name: 'Biodata Raden Soedirman',
        text: 'Raden Soedirman\nLahir 24 Januari 1916 di Purbalingga.',
        x: 0.045,
        y: 0.590,
        w: 0.315,
        h: 0.360,
        textColor: '#1E293B',
        fontSize: Math.round(naturalW * 0.012),
        cardBg: '#FFFFFF',
      },
      // 3. 6 Kartu Rekam Jejak Kolom Kanan
      {
        id: `slice_chronicle_0_${Date.now()}`,
        name: 'Rekam Jejak 01: RIWAYAT PENDIDIKAN',
        text: 'RIWAYAT PENDIDIKAN\n\nRiwayat pendidikan yang tidak berjalan dengan lancar karena kendala ekonomi.',
        x: 0.380,
        y: 0.035,
        w: 0.575,
        h: 0.135,
        textColor: '#1E293B',
        fontSize: Math.round(naturalW * 0.012),
        cardBg: '#FFFFFF',
      },
      {
        id: `slice_chronicle_1_${Date.now()}`,
        name: 'Rekam Jejak 02: GURU TELADAN (1936)',
        text: 'GURU TELADAN (1936)\n\nMenjadi seorang guru di H.I.S Muhammadiyah Cilacap pada tahun 1936.',
        x: 0.380,
        y: 0.185,
        w: 0.575,
        h: 0.135,
        textColor: '#1E293B',
        fontSize: Math.round(naturalW * 0.012),
        cardBg: '#FFFFFF',
      },
      {
        id: `slice_chronicle_2_${Date.now()}`,
        name: 'Rekam Jejak 03: MILITER PETA',
        text: 'MILITER PETA\n\nMasuk ke militer di PETA dan membuktikan kepemimpinan hingga menjadi seorang Jenderal Besar.',
        x: 0.380,
        y: 0.335,
        w: 0.575,
        h: 0.135,
        textColor: '#1E293B',
        fontSize: Math.round(naturalW * 0.012),
        cardBg: '#FFFFFF',
      },
      {
        id: `slice_chronicle_3_${Date.now()}`,
        name: 'Rekam Jejak 04: PERANG GERILYA',
        text: 'PERANG GERILYA\n\nMenjadi pemimpin perang Gerilya yang tangguh dalam mempertahankan kemerdekaan Indonesia.',
        x: 0.380,
        y: 0.485,
        w: 0.575,
        h: 0.145,
        textColor: '#1E293B',
        fontSize: Math.round(naturalW * 0.012),
        cardBg: '#FFFFFF',
      },
      {
        id: `slice_chronicle_4_${Date.now()}`,
        name: 'Rekam Jejak 05: DITENGAH SAKIT',
        text: 'DITENGAH SAKIT\n\nDidiagnosa menderita tuberkulosis namun tetap memimpin pasukan dengan ditandu masuk keluar hutan.',
        x: 0.380,
        y: 0.645,
        w: 0.575,
        h: 0.145,
        textColor: '#1E293B',
        fontSize: Math.round(naturalW * 0.012),
        cardBg: '#FFFFFF',
      },
      {
        id: `slice_chronicle_5_${Date.now()}`,
        name: 'Rekam Jejak 06: AKHIR HAYAT',
        text: 'AKHIR HAYAT\n\nWafat setelah Belanda resmi mengakui kedaulatan penuh Republik Indonesia.',
        x: 0.380,
        y: 0.805,
        w: 0.575,
        h: 0.145,
        textColor: '#1E293B',
        fontSize: Math.round(naturalW * 0.012),
        cardBg: '#FFFFFF',
      },
    ];
  }

  if (archetype === 'INFOGRAPHIC_RADIAL_CLOCK') {
    const titleText = (title || 'PENURUNAN PENGANGGURAN MELALUI PELATIHAN').toUpperCase();
    const authorText = author || 'DR. JONANDA P. A. B // DPRD PROVINSI • DAPIL JABAR';

    return [
      // 1. Header Card
      {
        id: `slice_radial_header_${Date.now()}`,
        name: 'Judul Utama (Masthead)',
        text: `DATA PELATIHAN KERJA // ANALISIS KEBIJAKAN\n${titleText}`,
        x: 0.045,
        y: 0.045,
        w: 0.910,
        h: 0.125,
        textColor: '#0F172A',
        fontWeight: 'bold',
        fontSize: Math.round(naturalW * 0.032),
        cardBg: '#FFFFFF',
      },
      // 2. 3 KPIs di Atas Sayap Kanan
      {
        id: `slice_radial_stat_0_${Date.now()}`,
        name: 'Metrik 10%',
        text: '10%\nPENURUNAN PENGANGGURAN',
        x: 0.470,
        y: 0.180,
        w: 0.155,
        h: 0.075,
        textColor: '#EA580C',
        fontWeight: 'bold',
        textAlign: 'center',
        fontSize: Math.round(naturalW * 0.013),
        cardBg: '#FFFFFF',
      },
      {
        id: `slice_radial_stat_1_${Date.now()}`,
        name: 'Metrik Rp 200 Miliar',
        text: 'RP 200 MILIAR\nTOTAL ANGGARAN',
        x: 0.635,
        y: 0.180,
        w: 0.165,
        h: 0.075,
        textColor: '#EA580C',
        fontWeight: 'bold',
        textAlign: 'center',
        fontSize: Math.round(naturalW * 0.013),
        cardBg: '#FFFFFF',
      },
      {
        id: `slice_radial_stat_2_${Date.now()}`,
        name: 'Metrik 8 Kota',
        text: '8 KOTA\nKONSENTRASI DI JABAR',
        x: 0.810,
        y: 0.180,
        w: 0.145,
        h: 0.075,
        textColor: '#EA580C',
        fontWeight: 'bold',
        textAlign: 'center',
        fontSize: Math.round(naturalW * 0.013),
        cardBg: '#FFFFFF',
      },
      // 3. 5 Tonggak Sayap Kanan
      {
        id: `slice_milestone_0_${Date.now()}`,
        name: 'Tonggak 01: 15.000 PESERTA',
        text: 'TONGGAK 01: 15.000 PESERTA PELATIHAN\n\nBalai Latihan Kerja telah melatih 15.000 peserta dengan kurikulum industri.',
        x: 0.470,
        y: 0.265,
        w: 0.485,
        h: 0.115,
        textColor: '#1E293B',
        fontSize: Math.round(naturalW * 0.012),
        cardBg: '#FFFFFF',
      },
      {
        id: `slice_milestone_1_${Date.now()}`,
        name: 'Tonggak 02: RP 200 MILIAR',
        text: 'TONGGAK 02: RP 200 MILIAR DIANGGARKAN\n\nPemerintah Provinsi mengalokasikan anggaran untuk peningkatan fasilitas BLK.',
        x: 0.470,
        y: 0.390,
        w: 0.485,
        h: 0.115,
        textColor: '#1E293B',
        fontSize: Math.round(naturalW * 0.012),
        cardBg: '#FFFFFF',
      },
      {
        id: `slice_milestone_2_${Date.now()}`,
        name: 'Tonggak 03: 8 KOTA PRIORITAS',
        text: 'TONGGAK 03: 8 KOTA PRIORITAS\n\nPelatihan diprioritaskan di daerah dengan tingkat pengangguran terbuka tinggi.',
        x: 0.470,
        y: 0.515,
        w: 0.485,
        h: 0.115,
        textColor: '#1E293B',
        fontSize: Math.round(naturalW * 0.012),
        cardBg: '#FFFFFF',
      },
      {
        id: `slice_milestone_3_${Date.now()}`,
        name: 'Tonggak 04: 95% PENYERAPAN',
        text: 'TONGGAK 04: 95% PENYERAPAN TENAGA KERJA\n\nLulusan bersertifikasi berhasil diserap langsung ke sektor industri terkemuka.',
        x: 0.470,
        y: 0.640,
        w: 0.485,
        h: 0.115,
        textColor: '#1E293B',
        fontSize: Math.round(naturalW * 0.012),
        cardBg: '#FFFFFF',
      },
      {
        id: `slice_milestone_4_${Date.now()}`,
        name: 'Tonggak 05: KERJA SAMA INDUSTRI',
        text: 'TONGGAK 05: PROGRAM KERJA SAMA INDUSTRI\n\nMembangun kemitraan dengan 50 perusahaan manufaktur dan digital terkemuka.',
        x: 0.470,
        y: 0.765,
        w: 0.485,
        h: 0.115,
        textColor: '#1E293B',
        fontSize: Math.round(naturalW * 0.012),
        cardBg: '#FFFFFF',
      },
      // 4. Sintesis Kebijakan
      {
        id: `slice_radial_synth_${Date.now()}`,
        name: 'Sintesis Kebijakan',
        text: 'SINTESIS KEBIJAKAN\nPenting untuk terus mengevaluasi efektivitas program guna memastikan akuntabilitas anggaran.',
        x: 0.470,
        y: 0.890,
        w: 0.485,
        h: 0.045,
        textColor: '#0F172A',
        fontWeight: 'bold',
        fontSize: Math.round(naturalW * 0.011),
        cardBg: '#FFFFFF',
      },
      // 5. Footer
      {
        id: `slice_radial_footer_${Date.now()}`,
        name: 'Identitas Dewan (Footer)',
        text: `${authorText}                      2026`,
        x: 0.045,
        y: 0.945,
        w: 0.910,
        h: 0.040,
        textColor: '#0F172A',
        fontWeight: 'bold',
        fontSize: Math.round(naturalW * 0.012),
        cardBg: '#FFFFFF',
      },
    ];
  }

  // DEFAULT & NARRATIVE WAVE (Pelatihan Balai Kerja 4 Dimensi Zigzag)
  const titleText = (title || 'PENURUNAN PENGANGGURAN MELALUI PELATIHAN').toUpperCase();
  const subtitleText = subtitle || 'Program pelatihan di Balai Latihan Kerja Jawa Barat berhasil menurunkan angka pengangguran terbuka sebesar 12,5% di Kota Bandung. Dengan alokasi anggaran Rp 300 miliar, program ini mendukung 10.000 peserta pelatihan setiap tahun.';
  const authorText = author || 'DR. JONANDA P. A. B // DPRD PROVINSI • DAPIL JABAR';

  return [
    // 1. Top Bar Tag Header
    {
      id: `slice_toptag_${Date.now()}`,
      name: 'Top Tag: POLARIS // DAPIL JABAR',
      text: 'POLARIS // DAPIL JABAR                       DOKUMEN ADVOKASI PUBLIK',
      x: 0.082,
      y: 0.018,
      w: 0.836,
      h: 0.024,
      textColor: '#64748B',
      fontWeight: 'bold',
      fontSize: Math.round(naturalW * 0.012),
      cardBg: 'transparent',
    },
    // 2. Header Masthead (Title + Subtitle)
    {
      id: `slice_headline_${Date.now()}`,
      name: 'Judul Utama (Headline & Narasi)',
      text: `DATA PELATIHAN KERJA // STRATEGI EKONOMI\n${titleText}\n\n${subtitleText}`,
      x: 0.082,
      y: 0.045,
      w: 0.836,
      h: 0.175,
      textColor: '#0F172A',
      fontWeight: 'bold',
      fontSize: Math.round(naturalW * 0.032),
      cardBg: '#FFFFFF',
    },
    // 3. 4 KPIs
    {
      id: `slice_kpi_0_${Date.now()}`,
      name: 'Metrik 12,5%',
      text: '12,5%\nPENURUNAN PENGANGGURAN',
      x: 0.095,
      y: 0.225,
      w: 0.190,
      h: 0.075,
      textColor: '#065F46',
      fontWeight: 'bold',
      textAlign: 'center',
      fontSize: Math.round(naturalW * 0.011),
      cardBg: '#FFFFFF',
    },
    {
      id: `slice_kpi_1_${Date.now()}`,
      name: 'Metrik Rp 300 Miliar',
      text: 'RP 300 MILIAR\nTOTAL ANGGARAN',
      x: 0.300,
      y: 0.225,
      w: 0.190,
      h: 0.075,
      textColor: '#065F46',
      fontWeight: 'bold',
      textAlign: 'center',
      fontSize: Math.round(naturalW * 0.011),
      cardBg: '#FFFFFF',
    },
    {
      id: `slice_kpi_2_${Date.now()}`,
      name: 'Metrik 10.000 Peserta',
      text: '10.000 PESERTA\nKONSENTRASI PELATIHAN',
      x: 0.505,
      y: 0.225,
      w: 0.190,
      h: 0.075,
      textColor: '#065F46',
      fontWeight: 'bold',
      textAlign: 'center',
      fontSize: Math.round(naturalW * 0.011),
      cardBg: '#FFFFFF',
    },
    {
      id: `slice_kpi_3_${Date.now()}`,
      name: 'Metrik 95%',
      text: '95%\nTINGKAT PENYERAPAN',
      x: 0.710,
      y: 0.225,
      w: 0.190,
      h: 0.075,
      textColor: '#065F46',
      fontWeight: 'bold',
      textAlign: 'center',
      fontSize: Math.round(naturalW * 0.011),
      cardBg: '#FFFFFF',
    },
    // 4. 4 Dimensi Zigzag Cards
    {
      id: `slice_dimensi_0_${Date.now()}`,
      name: 'Kartu Dimensi 01: 5 BLK',
      text: 'DIMENSI 01: 5 BALAI LATIHAN KERJA\n\nTerdapat 5 Balai Latihan Kerja di Kota Bandung yang menyediakan berbagai program pelatihan sesuai kebutuhan industri lokal.',
      x: 0.505,
      y: 0.315,
      w: 0.413,
      h: 0.125,
      textColor: '#1E293B',
      fontSize: Math.round(naturalW * 0.012),
      cardBg: '#FFFFFF',
    },
    {
      id: `slice_dimensi_1_${Date.now()}`,
      name: 'Kartu Dimensi 02: 60% BERSERTIFIKAT',
      text: 'DIMENSI 02: 60% PESERTA BERSERTIFIKAT\n\nDari total peserta, 60% berhasil mendapatkan sertifikat kompetensi yang diakui industri, meningkatkan daya saing di pasar kerja.',
      x: 0.082,
      y: 0.450,
      w: 0.413,
      h: 0.125,
      textColor: '#1E293B',
      fontSize: Math.round(naturalW * 0.012),
      cardBg: '#FFFFFF',
    },
    {
      id: `slice_dimensi_2_${Date.now()}`,
      name: 'Kartu Dimensi 03: 3 SEKTOR PRIORITAS',
      text: 'DIMENSI 03: 3 SEKTOR PRIORITAS\n\nPelatihan difokuskan pada 3 sektor prioritas: teknologi informasi, industri kreatif dan manufaktur untuk mendukung pertumbuhan ekonomi.',
      x: 0.505,
      y: 0.585,
      w: 0.413,
      h: 0.125,
      textColor: '#1E293B',
      fontSize: Math.round(naturalW * 0.012),
      cardBg: '#FFFFFF',
    },
    {
      id: `slice_dimensi_3_${Date.now()}`,
      name: 'Kartu Dimensi 04: 30% PENINGKATAN',
      text: 'DIMENSI 04: 30% PENINGKATAN KETERAMPILAN\n\nPeserta pelatihan menunjukkan peningkatan keterampilan sebesar 30% setelah mengikuti program, berdasarkan evaluasi pasca-pelatihan.',
      x: 0.082,
      y: 0.720,
      w: 0.413,
      h: 0.125,
      textColor: '#1E293B',
      fontSize: Math.round(naturalW * 0.012),
      cardBg: '#FFFFFF',
    },
    // 5. Closing Takeaway Banner
    {
      id: `slice_closing_${Date.now()}`,
      name: 'Sintesis Penutup',
      text: 'Penting untuk terus memantau dan mengevaluasi efektivitas program pelatihan guna memastikan transparansi dan akuntabilitas dalam pengelolaan anggaran.',
      x: 0.082,
      y: 0.855,
      w: 0.836,
      h: 0.045,
      textColor: '#0F172A',
      fontWeight: 'bold',
      textAlign: 'center',
      fontSize: Math.round(naturalW * 0.011),
      cardBg: '#FFFFFF',
    },
    // 6. Footer
    {
      id: `slice_footer_${Date.now()}`,
      name: 'Identitas Dewan (Footer)',
      text: `${authorText}                      2026`,
      x: 0.082,
      y: 0.910,
      w: 0.836,
      h: 0.045,
      textColor: '#0F172A',
      fontWeight: 'bold',
      fontSize: Math.round(naturalW * 0.012),
      cardBg: '#FFFFFF',
    },
  ];
}

/**
 * Pemuat HTMLImageElement tangguh yang mengatasi kendala CORS lintas port/origin.
 */
async function loadResilientHTMLImage(url: string): Promise<HTMLImageElement> {
  const safeUrl = resolveSafeImageUrl(url);

  // Strategi 1: Fetch sebagai Blob lokal (100% same-origin)
  try {
    const res = await fetch(safeUrl);
    if (res.ok) {
      const blob = await res.blob();
      const blobUrl = URL.createObjectURL(blob);
      return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = reject;
        img.src = blobUrl;
      });
    }
  } catch (err) {
    console.warn('[MagicLayers] fetch blob untuk HTMLImage gagal, fallback direct img:', err);
  }

  // Strategi 2: Direct image anonymous
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = safeUrl;
  });
}

/**
 * Memotong irisan elemen asli poster secara pixel-perfect menjadi FabricImage independen.
 * Mempertahankan 100% estetika, font asli, ornamen, badge diamond, dan tombol indikator.
 */
async function createCroppedComponentSlice(
  sourceImg: HTMLImageElement,
  crop: { x: number; y: number; w: number; h: number },
  options: {
    id: string;
    name: string;
    text: string;
    naturalW: number;
    naturalH: number;
    def?: ComponentSliceDef;
  }
): Promise<FabricImage> {
  const cropW = Math.max(1, Math.round(crop.w));
  const cropH = Math.max(1, Math.round(crop.h));

  const offCanvas = document.createElement('canvas');
  offCanvas.width = cropW;
  offCanvas.height = cropH;
  const ctx = offCanvas.getContext('2d');
  if (ctx) {
    const scaleX = (sourceImg.naturalWidth || sourceImg.width || options.naturalW) / options.naturalW;
    const scaleY = (sourceImg.naturalHeight || sourceImg.height || options.naturalH) / options.naturalH;

    const sx = Math.round(crop.x * scaleX);
    const sy = Math.round(crop.y * scaleY);
    const sw = Math.round(crop.w * scaleX);
    const sh = Math.round(crop.h * scaleY);

    ctx.drawImage(sourceImg, sx, sy, sw, sh, 0, 0, cropW, cropH);
  }

  const sliceDataUrl = offCanvas.toDataURL('image/png');
  const sliceImg = await FabricImage.fromURL(sliceDataUrl);

  sliceImg.set({
    originX: 'left',
    originY: 'top',
    left: Math.round(crop.x),
    top: Math.round(crop.y),
    stroke: '#7D2AE8', // Canva Purple outline
    strokeWidth: 2,
    strokeUniform: true,
    cornerColor: '#FFFFFF',
    cornerStrokeColor: '#7D2AE8',
    borderColor: '#7D2AE8',
    cornerSize: 8,
    cornerStyle: 'circle',
    transparentCorners: false,
    borderScaleFactor: 2,
    selectable: true,
    hasControls: true,
    hasBorders: true,
    shadow: new Shadow({ color: 'rgba(0,0,0,0.06)', blur: 4, offsetX: 0, offsetY: 2 }),
  });

  (sliceImg as any).customId = options.id;
  (sliceImg as any).customData = {
    name: options.name,
    text: options.text,
    isComponentSlice: true,
    cropRect: crop,
    originalX: crop.x,
    originalY: crop.y,
    def: options.def,
  };

  sliceImg.setCoords();
  return sliceImg;
}

/**
 * Menghasilkan gambar latar belakang yang BERSIH dari kartu & teks berdasarkan tata letak komponen.
 * - Foto kolase warga, foto dokumentasi, dan ornamen penting dipertahankan 100% utuh.
 * - Area kartu dan teks dibersihkan dengan warna kertas asli poster (inpainting) sehingga saat kartu digeser, tidak ada duplikat kartu lama.
 */
async function createCleanPosterBackground(
  rawImageUrl: string,
  naturalW: number,
  naturalH: number,
  componentDefs: ComponentSliceDef[]
): Promise<string> {
  const safeUrl = resolveSafeImageUrl(rawImageUrl);

  return new Promise((resolve) => {
    (async () => {
      let objectUrlToUse = safeUrl;
      let blobCreated = false;

      try {
        const response = await fetch(safeUrl);
        if (response.ok) {
          const blob = await response.blob();
          if (blob.type.startsWith('image/')) {
            objectUrlToUse = URL.createObjectURL(blob);
            blobCreated = true;
          }
        }
      } catch (e) {
        console.warn('[MagicLayers] fetch blob untuk clean background gagal, mencoba direct img:', e);
      }

      const img = new Image();
      img.crossOrigin = 'anonymous';

      img.onload = () => {
        try {
          const offCanvas = document.createElement('canvas');
          offCanvas.width = naturalW;
          offCanvas.height = naturalH;
          const ctx = offCanvas.getContext('2d');
          if (!ctx) {
            if (blobCreated) URL.revokeObjectURL(objectUrlToUse);
            resolve(safeUrl);
            return;
          }

          // 1. Gambar seluruh poster asli
          ctx.drawImage(img, 0, 0, naturalW, naturalH);

          // 2. Ambil sampel warna background kertas di margin kanan atas
          let paperColor = '#FAF8F5';
          try {
            const sampleX = Math.min(naturalW - 25, Math.floor(naturalW * 0.96));
            const sampleY = Math.floor(naturalH * 0.40);
            const pixel = ctx.getImageData(sampleX, sampleY, 1, 1).data;
            if (pixel[3] > 200 && pixel[0] > 180 && pixel[1] > 180) {
              paperColor = `rgb(${pixel[0]}, ${pixel[1]}, ${pixel[2]})`;
            }
          } catch {}

          // 3. Bersihkan area setiap komponen yang dipisahkan dengan warna kertas inpainting
          ctx.fillStyle = paperColor;
          for (const def of componentDefs) {
            const cropX = Math.round(def.x * naturalW);
            const cropY = Math.round(def.y * naturalH);
            const cropW = Math.round(def.w * naturalW);
            const cropH = Math.round(def.h * naturalH);
            ctx.fillRect(cropX, cropY, cropW, cropH);
          }

          const cleanDataUrl = offCanvas.toDataURL('image/png');
          if (blobCreated) URL.revokeObjectURL(objectUrlToUse);
          resolve(cleanDataUrl);
        } catch (canvasErr) {
          console.warn('[MagicLayers] Error saat memproses canvas clean background:', canvasErr);
          if (blobCreated) URL.revokeObjectURL(objectUrlToUse);
          resolve(safeUrl);
        }
      };

      img.onerror = () => {
        if (blobCreated) URL.revokeObjectURL(objectUrlToUse);
        resolve(safeUrl);
      };

      img.src = objectUrlToUse;
    })();
  });
}

export function MagicLayersModal({
  isOpen,
  onClose,
  imageUrl,
  initialTitle = '',
  initialAuthor = '',
  initialSubtitle = '',
  aspectRatio,
  archetype,
  publicationId,
  savedLayersJson,
  onApplyChanges,
}: MagicLayersModalProps) {
  const { toast } = useToast();
  const canvasElRef = useRef<HTMLCanvasElement | null>(null);
  const fabricRef = useRef<FabricCanvas | null>(null);
  const workspaceRef = useRef<HTMLDivElement | null>(null);

  // Studio UI Navigation State
  const [activeTab, setActiveTab] = useState<'layers' | 'text' | 'elements' | 'magic'>('layers');
  const [layers, setLayers] = useState<LayerItem[]>([]);
  const [selectedLayerId, setSelectedLayerId] = useState<string | null>(null);
  const [selectedObject, setSelectedObject] = useState<FabricObject | null>(null);

  // Lembaran Canvas Native Dimensions (Disesuaikan 100% dari resolusi asli gambar via Ref)
  const canvasNaturalSizeRef = useRef({ width: 1080, height: 1350 });
  const [displayDimensions, setDisplayDimensions] = useState({ width: 0, height: 0 });

  // Viewport Zoom State
  const [zoomLevel, setZoomLevel] = useState<number>(1.0); // 1.0 = Fit to screen
  const [fitScale, setFitScale] = useState<number>(0.5);

  const [isLoading, setIsLoading] = useState(true);
  const [isDecomposed, setIsDecomposed] = useState<boolean>(!!savedLayersJson);
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [pipelineStep, setPipelineStep] = useState<number>(0);
  const [pipelineStatusText, setPipelineStatusText] = useState<string>('');
  const [isCuttingOut, setIsCuttingOut] = useState(false);
  const [cutoutSuccess, setCutoutSuccess] = useState(false);
  const [hasGrabbedText, setHasGrabbedText] = useState(false);

  // Text Styling & Live Sentence Editing State
  const [currentTextContent, setCurrentTextContent] = useState('');
  const [fontFamily, setFontFamily] = useState("'Inter', sans-serif");
  const [fontSize, setFontSize] = useState(36);
  const [fillColor, setFillColor] = useState('#0F172A');
  const [bgColor, setBgColor] = useState('transparent');
  const [isBold, setIsBold] = useState(false);
  const [isItalic, setIsItalic] = useState(false);
  const [textAlign, setTextAlign] = useState<'left' | 'center' | 'right'>('left');

  // Helper to refresh layer list from Fabric canvas
  const refreshLayersList = useCallback((canvas: FabricCanvas) => {
    if (!canvas || (canvas as any).isDisposed) return;
    try {
      const objects = canvas.getObjects();
      // Reverse objects so the topmost visual layer appears at the top of the UI list
      const mapped: LayerItem[] = [...objects].reverse().map((obj, revIdx) => {
        const idx = objects.indexOf(obj);
        const customData = (obj as any).customData || {};
        let name = customData.name;
        if (!name) {
          if (obj instanceof Textbox) {
            name = `Teks: "${obj.text?.slice(0, 24) || 'Kosong'}..."`;
          } else if (obj instanceof FabricImage) {
            name = customData.isCutout ? 'Objek Depan (Cutout)' : 'Poster Asli (Latar Belakang)';
          } else {
            name = `Layer ${objects.length - idx}`;
          }
        }

        return {
          id: (obj as any).customId || `obj_${idx}`,
          name,
          type: obj.type || 'object',
          visible: obj.visible !== false,
          locked: !!obj.lockMovementX,
          object: obj,
        };
      });

      setLayers(mapped);
    } catch (err) {
      console.warn('[MagicLayers] refreshLayersList error:', err);
    }
  }, []);

  // Update styling panel and sentence edit input when active object changes
  const updateStylePanelFromObject = (obj: FabricObject | null) => {
    setSelectedObject(obj);
    if (!obj) {
      setSelectedLayerId(null);
      setCurrentTextContent('');
      return;
    }

    setSelectedLayerId((obj as any).customId || null);

    if (obj instanceof Textbox) {
      setCurrentTextContent(obj.text || '');
      setFontFamily(obj.fontFamily || "'Inter', sans-serif");
      setFontSize(obj.fontSize || 36);
      setFillColor(typeof obj.fill === 'string' ? obj.fill : '#0F172A');
      setBgColor(typeof obj.backgroundColor === 'string' ? obj.backgroundColor : 'transparent');
      setIsBold(obj.fontWeight === 'bold' || (typeof obj.fontWeight === 'number' && obj.fontWeight >= 700));
      setIsItalic(obj.fontStyle === 'italic');
      setTextAlign((obj.textAlign as any) || 'left');
    } else if (obj && (obj as any).customData?.isComponentSlice) {
      const customData = (obj as any).customData;
      setCurrentTextContent(customData.text || '');
      const def = customData.def;
      if (def) {
        if (def.fontFamily) setFontFamily(def.fontFamily);
        if (def.fontSize) setFontSize(def.fontSize);
        if (def.textColor) setFillColor(def.textColor);
        if (def.cardBg) setBgColor(def.cardBg);
        if (def.fontWeight) setIsBold(def.fontWeight === 'bold' || (typeof def.fontWeight === 'number' && def.fontWeight >= 700));
        if (def.fontStyle) setIsItalic(def.fontStyle === 'italic');
        if (def.textAlign) setTextAlign(def.textAlign);
      }
    }
  };

  // ─── RESIZE & RESPONSIVE FIT ENGINE (100% RASIO PRESISI MENGGUNAKAN CSS DISPLAY) ───
  // Mempertahankan resolusi buffer asli gambar, hanya mengubah ukuran display CSS agar pas ke layar
  const updateResponsiveFit = useCallback(() => {
    const canvas = fabricRef.current;
    const container = workspaceRef.current;
    if (!canvas || !container || (canvas as any).isDisposed) return;

    const { clientWidth, clientHeight } = container;
    if (!clientWidth || !clientHeight) return;

    const naturalW = canvasNaturalSizeRef.current.width;
    const naturalH = canvasNaturalSizeRef.current.height;
    if (!naturalW || !naturalH) return;

    const paddingX = 48;
    const paddingY = 48;
    const availW = Math.max(100, clientWidth - paddingX);
    const availH = Math.max(100, clientHeight - paddingY);

    const calculatedFit = Math.min(availW / naturalW, availH / naturalH);
    setFitScale(calculatedFit);

    const effectiveScale = calculatedFit * zoomLevel;
    const dispW = Math.round(naturalW * effectiveScale);
    const dispH = Math.round(naturalH * effectiveScale);

    setDisplayDimensions({ width: dispW, height: dispH });

    try {
      // cssOnly: true menjaga buffer kanvas tetap 1080x1350 tanpa distorsi atau double scaling
      canvas.setDimensions(
        { width: `${dispW}px`, height: `${dispH}px` },
        { cssOnly: true }
      );
      canvas.renderAll();
    } catch (err) {
      console.warn('[MagicLayers] setDimensions error:', err);
    }
  }, [zoomLevel]);

  // Hook resize observer independently from canvas initialization
  useEffect(() => {
    if (!isOpen) return;
    updateResponsiveFit();
    window.addEventListener('resize', updateResponsiveFit);

    let observer: ResizeObserver | null = null;
    if (workspaceRef.current) {
      observer = new ResizeObserver(() => updateResponsiveFit());
      observer.observe(workspaceRef.current);
    }

    return () => {
      window.removeEventListener('resize', updateResponsiveFit);
      observer?.disconnect();
    };
  }, [isOpen, updateResponsiveFit]);

  // Set default Canva-style selection styling
  useEffect(() => {
    FabricObject.ownDefaults.originX = 'left';
    FabricObject.ownDefaults.originY = 'top';
    FabricObject.ownDefaults.transparentCorners = false;
    FabricObject.ownDefaults.cornerColor = '#FFFFFF';
    FabricObject.ownDefaults.cornerStrokeColor = '#7D2AE8'; // Canva purple
    FabricObject.ownDefaults.borderColor = '#7D2AE8';
    FabricObject.ownDefaults.cornerSize = 9;
    FabricObject.ownDefaults.cornerStyle = 'circle';
    FabricObject.ownDefaults.borderScaleFactor = 1.5;
    FabricObject.ownDefaults.padding = 4;
  }, []);

  // ─── INITIALIZE FABRIC CANVAS (100% PERSIS POSTER ASLI GAMBAR 2) ───
  useEffect(() => {
    if (!isOpen || !canvasElRef.current) return;

    setIsLoading(true);
    let isDisposed = false;

    // Dispose previous instance safely
    if (fabricRef.current) {
      try {
        (fabricRef.current as any).isDisposed = true;
        fabricRef.current.dispose();
      } catch {}
      fabricRef.current = null;
    }

    const initCanvasContent = async () => {
      try {
        // 1. Muat Poster Gambar Asli terlebih dahulu untuk mengetahui resolusi aslinya
        const rawImg = await loadResilientFabricImage(imageUrl);
        if (isDisposed || !canvasElRef.current) return;

        const naturalW = rawImg.width || 1080;
        const naturalH = rawImg.height || 1350;
        canvasNaturalSizeRef.current = { width: naturalW, height: naturalH };

        // 2. Inisialisasi Fabric Canvas LANGSUNG dengan resolusi asli poster
        const canvas = new FabricCanvas(canvasElRef.current, {
          width: naturalW,
          height: naturalH,
          backgroundColor: '#FAF8F5',
          preserveObjectStacking: true,
          selection: true,
        });

        fabricRef.current = canvas;

        // Canvas Event Listeners
        canvas.on('selection:created', (e) => updateStylePanelFromObject(e.selected?.[0] || null));
        canvas.on('selection:updated', (e) => updateStylePanelFromObject(e.selected?.[0] || null));
        canvas.on('selection:cleared', () => updateStylePanelFromObject(null));
        canvas.on('object:modified', () => {
          refreshLayersList(canvas);
          if (canvas.getActiveObject() instanceof Textbox) {
            updateStylePanelFromObject(canvas.getActiveObject() || null);
          }
        });
        canvas.on('object:added', () => refreshLayersList(canvas));
        canvas.on('object:removed', () => refreshLayersList(canvas));
        canvas.on('text:changed', (e) => {
          if (e.target instanceof Textbox) {
            setCurrentTextContent(e.target.text || '');
            refreshLayersList(canvas);
          }
        });

        // 3. Tambahkan Latar Belakang Poster 1:1 Mengisi Penuh Kanvas Tanpa Distorsi (Poster Asli Utuh)
        const bgImg = await loadResilientFabricImage(imageUrl);

        bgImg.set({
          originX: 'left',
          originY: 'top',
          left: 0,
          top: 0,
          scaleX: naturalW / (bgImg.width || naturalW),
          scaleY: naturalH / (bgImg.height || naturalH),
          selectable: false,
          evented: false,
        });
        bgImg.setCoords();

        (bgImg as any).customId = 'layer_background';
        (bgImg as any).customData = { name: 'Poster Asli (Latar Belakang)', isBackground: true };
        canvas.add(bgImg);
        canvas.sendObjectToBack(bgImg);

        // 4. Jika ada sesi tersimpan sebelumnya, muat kembali susunan layernya
        if (savedLayersJson) {
          try {
            const sanitizedJson = savedLayersJson.replace(/https?:\/\/[^\/]+(?::\d+)?\/uploads\//g, '/uploads/');
            await canvas.loadFromJSON(sanitizedJson);
            canvas.renderAll();
            if (!isDisposed) {
              refreshLayersList(canvas);
              updateResponsiveFit();
              setTimeout(() => {
                if (!isDisposed) updateResponsiveFit();
              }, 60);
              setIsLoading(false);
              setIsDecomposed(true);
            }
            return;
          } catch (jsonErr) {
            console.warn('[MagicLayers] Sesi JSON tersimpan tidak dapat dimuat, menampilkan poster asli:', jsonErr);
          }
        }

        // Tampilan Awal: Tampilkan poster asli utuh terlebih dahulu (belum dipisahkan)
        canvas.renderAll();
        if (!isDisposed) {
          refreshLayersList(canvas);
          updateResponsiveFit();
          setTimeout(() => {
            if (!isDisposed) updateResponsiveFit();
          }, 60);
          setIsLoading(false);
          setIsDecomposed(false);
        }
      } catch (err: any) {
        console.error('Error initializing Magic Layers canvas:', err);
        if (!isDisposed) {
          toast({
            type: 'error',
            title: 'Gagal memuat kanvas',
            description: err?.message || 'Tidak dapat memuat berkas gambar.',
          });
          setIsLoading(false);
        }
      }
    };

    initCanvasContent();

    return () => {
      isDisposed = true;
      if (fabricRef.current) {
        try {
          (fabricRef.current as any).isDisposed = true;
          fabricRef.current.dispose();
        } catch {}
        fabricRef.current = null;
      }
    };
  }, [isOpen, imageUrl, savedLayersJson]);

  // ─── 🪄 TRIGGER CANVA MAGIC LAYERS WITH 4-STAGE PIPELINE & LASER SCANNING ───
  const handleTriggerMagicLayers = async () => {
    if (!fabricRef.current || isScanning || isDecomposed) return;
    setIsScanning(true);

    try {
      const canvas = fabricRef.current;
      const { width: naturalW, height: naturalH } = canvasNaturalSizeRef.current;

      // ════════════════════════════════════════════════════════════════════════
      // TAHAP 1: DETEKSI & SEGMENTASI OBJEK (OBJECT SEGMENTATION & ALPHA MASKING)
      // ════════════════════════════════════════════════════════════════════════
      setPipelineStep(1);
      setPipelineStatusText('Mendeteksi objek visual, batas kartu, dan zona subjek...');
      const layoutArchetype = detectPosterLayout(archetype, initialTitle, initialSubtitle);
      const componentDefs = getArchetypeComponentDefs(
        layoutArchetype,
        naturalW,
        naturalH,
        initialTitle,
        initialSubtitle,
        initialAuthor
      );
      await new Promise((resolve) => setTimeout(resolve, 600));

      // ════════════════════════════════════════════════════════════════════════
      // TAHAP 2: PEMISAHAN TEKS & TIPOGRAFI (TEXT DETECTION & OCR RECONSTRUCTION)
      // ════════════════════════════════════════════════════════════════════════
      setPipelineStep(2);
      setPipelineStatusText('Mengekstrak bounding box teks, hirarki headline, dan metrik...');
      await new Promise((resolve) => setTimeout(resolve, 600));

      // ════════════════════════════════════════════════════════════════════════
      // TAHAP 3: PEMULIHAN LATAR BELAKANG (SMART INPAINTING & BACKGROUND COMPLETION)
      // ════════════════════════════════════════════════════════════════════════
      setPipelineStep(3);
      setPipelineStatusText('Melukis ulang area latar belakang yang tertutup (Inpainting AI)...');
      const cleanBgUrl = await createCleanPosterBackground(
        imageUrl,
        naturalW,
        naturalH,
        componentDefs
      );
      await new Promise((resolve) => setTimeout(resolve, 600));

      // ════════════════════════════════════════════════════════════════════════
      // TAHAP 4: VEKTORISASI & STRUKTUR DOKUMEN BERLAPIS (LAYER STRUCTURING)
      // ════════════════════════════════════════════════════════════════════════
      setPipelineStep(4);
      setPipelineStatusText('Menyusun layer vektor, kartu komponen, dan teks digital interaktif...');
      await new Promise((resolve) => setTimeout(resolve, 500));

      // Perbarui latar belakang kanvas dengan hasil inpainting AI yang bersih
      const cleanImg = await loadResilientFabricImage(cleanBgUrl);
      const existingBg = canvas.getObjects().find((o) => (o as any).customData?.isBackground);
      if (existingBg) {
        canvas.remove(existingBg);
      }
      cleanImg.set({
        originX: 'left',
        originY: 'top',
        left: 0,
        top: 0,
        scaleX: naturalW / (cleanImg.width || naturalW),
        scaleY: naturalH / (cleanImg.height || naturalH),
        selectable: false,
        evented: false,
      });
      cleanImg.setCoords();
      (cleanImg as any).customId = 'layer_background';
      (cleanImg as any).customData = { name: 'Poster Bersih (Latar Belakang Inpainted)', isBackground: true };
      canvas.add(cleanImg);
      canvas.sendObjectToBack(cleanImg);

      // Muat gambar sumber HTMLImageElement untuk pemotongan irisan komponen secara pixel-perfect
      const sourceImg = await loadResilientHTMLImage(imageUrl);

      // Ekstrak dan tambahkan setiap irisan komponen (pixel-perfect slice) ke kanvas
      for (const def of componentDefs) {
        const cropX = Math.round(def.x * naturalW);
        const cropY = Math.round(def.y * naturalH);
        const cropW = Math.round(def.w * naturalW);
        const cropH = Math.round(def.h * naturalH);

        const sliceImg = await createCroppedComponentSlice(
          sourceImg,
          { x: cropX, y: cropY, w: cropW, h: cropH },
          {
            id: def.id,
            name: def.name,
            text: def.text,
            naturalW,
            naturalH,
            def,
          }
        );
        canvas.add(sliceImg);
      }

      canvas.renderAll();
      refreshLayersList(canvas);
      setIsDecomposed(true);

      toast({
        type: 'success',
        title: 'Magic Layers Selesai (4 Tahap Sukses)',
        description: 'Segmentasi objek, deteksi teks, inpainting latar belakang, dan struktur layer Canva telah terbentuk sempurna.',
      });
    } catch (err: any) {
      console.error('[MagicLayers] Gagal mengurai layer:', err);
      toast({
        type: 'error',
        title: 'Gagal Mengurai Layer',
        description: err?.message || 'Kendala saat memproses pemisahan layer.',
      });
    } finally {
      setIsScanning(false);
      setPipelineStep(0);
      setPipelineStatusText('');
    }
  };

  // ─── RESET KEMBALI KE POSTER ASLI UTUH ───
  const handleResetToOriginal = async () => {
    if (!fabricRef.current) return;
    const canvas = fabricRef.current;
    canvas.clear();

    const naturalW = canvasNaturalSizeRef.current.width;
    const naturalH = canvasNaturalSizeRef.current.height;

    const bgImg = await loadResilientFabricImage(imageUrl);
    bgImg.set({
      originX: 'left',
      originY: 'top',
      left: 0,
      top: 0,
      scaleX: naturalW / (bgImg.width || naturalW),
      scaleY: naturalH / (bgImg.height || naturalH),
      selectable: false,
      evented: false,
    });
    bgImg.setCoords();
    (bgImg as any).customId = 'layer_background';
    (bgImg as any).customData = { name: 'Poster Asli (Latar Belakang)', isBackground: true };
    canvas.add(bgImg);
    canvas.sendObjectToBack(bgImg);
    canvas.renderAll();
    refreshLayersList(canvas);
    setIsDecomposed(false);

    toast({
      type: 'info',
      title: 'Kanvas Direset',
      description: 'Tampilan dikembalikan ke poster asli utuh.',
    });
  };

  // ─── MAGIC CUTOUT FUNCTION (KETIKA PENGGUNA MENGKLIK TOMBOL PISAHKAN OBJEK) ───
  const handleMagicCutout = async () => {
    if (!fabricRef.current || isCuttingOut) return;
    setIsCuttingOut(true);
    setCutoutSuccess(false);

    try {
      toast({
        type: 'info',
        title: 'Memproses Magic Cutout...',
        description: 'Mengekstrak subjek manusia/objek menjadi layer terpisah di depan. Harap tunggu sebentar.',
      });

      const safeUrl = resolveSafeImageUrl(imageUrl);

      // 1. Dapatkan Blob gambar poster murni (mencegah error Invalid format: text/html pada @imgly)
      let imageInput: Blob | null = null;
      try {
        const imgRes = await fetch(safeUrl);
        if (imgRes.ok) {
          const fetchedBlob = await imgRes.blob();
          if (fetchedBlob.type.startsWith('image/')) {
            imageInput = fetchedBlob;
          }
        }
      } catch (fetchErr) {
        console.warn('[MagicCutout] Fetch blob poster terlewati:', fetchErr);
      }

      // Fallback tangguh: Ambil data gambar langsung dari Fabric canvas jika network fetch gagal
      if (!imageInput && fabricRef.current) {
        const bgObj = fabricRef.current.getObjects().find((o) => (o as any).customData?.isBackground);
        if (bgObj) {
          const dataUrl = bgObj.toDataURL({ format: 'png', multiplier: 1.0 });
          const res = await fetch(dataUrl);
          imageInput = await res.blob();
        }
      }

      if (!imageInput) {
        throw new Error('Tidak dapat memproses berkas gambar poster.');
      }

      // 2. Jalankan pemisahan subjek depan AI (@imgly/background-removal)
      const { removeBackground } = await import('@imgly/background-removal');
      const blob = await removeBackground(imageInput);
      const cutoutUrl = URL.createObjectURL(blob);

      const cutoutImg = await loadResilientFabricImage(cutoutUrl);
      if (!fabricRef.current) return;

      const naturalW = canvasNaturalSizeRef.current.width;
      const naturalH = canvasNaturalSizeRef.current.height;

      // Skala yang presisi agar pas 1:1 di atas gambar latar belakang
      const scaleX = naturalW / (cutoutImg.width || 1);
      const scaleY = naturalH / (cutoutImg.height || 1);

      cutoutImg.set({
        originX: 'left',
        originY: 'top',
        left: 0,
        top: 0,
        scaleX,
        scaleY,
        selectable: true,
      });
      cutoutImg.setCoords();

      (cutoutImg as any).customId = `cutout_${Date.now()}`;
      (cutoutImg as any).customData = { name: 'Objek Depan (Cutout Subjek)', isCutout: true };

      fabricRef.current.add(cutoutImg);
      fabricRef.current.bringObjectToFront(cutoutImg);
      fabricRef.current.renderAll();

      refreshLayersList(fabricRef.current);
      setCutoutSuccess(true);
      setActiveTab('layers');

      toast({
        type: 'success',
        title: 'Magic Cutout Berhasil!',
        description: 'Subjek berhasil dipisahkan menjadi layer di depan! Anda kini dapat menggesernya atau menaruh teks di belakangnya.',
      });
    } catch (err: any) {
      console.error('Magic Cutout error:', err);
      toast({
        type: 'error',
        title: 'Magic Cutout Belum Berhasil',
        description: err?.message || 'Gagal mengekstrak subjek objek.',
      });
    } finally {
      setIsCuttingOut(false);
    }
  };

  // ─── LIVE SENTENCE / TEXT EDITING HANDLER ───
  const handleLiveTextChange = (newText: string) => {
    setCurrentTextContent(newText);
    if (!fabricRef.current || !selectedObject) return;

    if (selectedObject instanceof Textbox) {
      selectedObject.set('text', newText);
      selectedObject.initDimensions();
      fabricRef.current.renderAll();
      refreshLayersList(fabricRef.current);
      return;
    }

    if ((selectedObject as any).customData?.isComponentSlice) {
      const canvas = fabricRef.current;
      const sliceObj = selectedObject as FabricImage;
      const customData = (sliceObj as any).customData || {};
      const def: ComponentSliceDef | undefined = customData.def;

      const left = sliceObj.left ?? (def ? Math.round(def.x * canvasNaturalSizeRef.current.width) : 0);
      const top = sliceObj.top ?? (def ? Math.round(def.y * canvasNaturalSizeRef.current.height) : 0);
      const width = (sliceObj.width || 100) * (sliceObj.scaleX || 1);
      const naturalW = canvasNaturalSizeRef.current.width || 1080;

      const newTextbox = createCanvaComponent({
        id: (sliceObj as any).customId || `box_${Date.now()}`,
        name: customData.name || 'Komponen Teks',
        left,
        top,
        width,
        text: newText,
        fontSize: def?.fontSize || Math.round(naturalW * 0.012),
        fontFamily: def?.fontFamily || "'Inter', sans-serif",
        fontWeight: def?.fontWeight || 'normal',
        fontStyle: def?.fontStyle || 'normal',
        textAlign: def?.textAlign || 'left',
        textColor: def?.textColor || '#0F172A',
        cardBg: def?.cardBg || '#FFFFFF',
        padding: def?.padding || 8,
      });

      canvas.remove(sliceObj);
      canvas.add(newTextbox);
      canvas.setActiveObject(newTextbox);
      setSelectedObject(newTextbox);
      canvas.renderAll();
      refreshLayersList(canvas);
    }
  };

  // Apply Text Styling Changes
  const applyFontFamily = (font: string) => {
    setFontFamily(font);
    if (selectedObject && selectedObject instanceof Textbox) {
      selectedObject.set('fontFamily', font);
      selectedObject.initDimensions();
      fabricRef.current?.renderAll();
    }
  };

  const applyFontSize = (size: number) => {
    setFontSize(size);
    if (selectedObject && selectedObject instanceof Textbox) {
      selectedObject.set('fontSize', size);
      selectedObject.initDimensions();
      fabricRef.current?.renderAll();
    }
  };

  const applyFillColor = (color: string) => {
    setFillColor(color);
    if (selectedObject && selectedObject instanceof Textbox) {
      selectedObject.set('fill', color);
      fabricRef.current?.renderAll();
    }
  };

  const applyBgColor = (color: string) => {
    setBgColor(color);
    if (selectedObject && selectedObject instanceof Textbox) {
      selectedObject.set('backgroundColor', color);
      fabricRef.current?.renderAll();
    }
  };

  const toggleBold = () => {
    const next = !isBold;
    setIsBold(next);
    if (selectedObject && selectedObject instanceof Textbox) {
      selectedObject.set('fontWeight', next ? 'bold' : 'normal');
      selectedObject.initDimensions();
      fabricRef.current?.renderAll();
    }
  };

  const toggleItalic = () => {
    const next = !isItalic;
    setIsItalic(next);
    if (selectedObject && selectedObject instanceof Textbox) {
      selectedObject.set('fontStyle', next ? 'italic' : 'normal');
      selectedObject.initDimensions();
      fabricRef.current?.renderAll();
    }
  };

  const applyTextAlign = (align: 'left' | 'center' | 'right') => {
    setTextAlign(align);
    if (selectedObject && selectedObject instanceof Textbox) {
      selectedObject.set('textAlign', align);
      fabricRef.current?.renderAll();
    }
  };

  // ─── 🪄 URAI TEKS MENJADI LAYER INTERAKTIF (CANVA GRAB TEXT) ───
  const handleGrabText = () => {
    if (!fabricRef.current) return;
    const canvas = fabricRef.current;
    const { width: w, height: h } = canvasNaturalSizeRef.current;

    const titleText = initialTitle || 'PENURUNAN PENGANGGURAN MELALUI PELATIHAN';

    // 1. Layer Judul Utama yang rapi dan sesuai gaya poster Gambar 2
    const headline = new Textbox(titleText.toUpperCase(), {
      originX: 'left',
      originY: 'top',
      left: w * 0.07,
      top: h * 0.08,
      width: w * 0.86,
      fontSize: Math.round(w * 0.042),
      fontFamily: "'Inter', sans-serif",
      fontWeight: 'bold',
      fill: '#0F172A',
      backgroundColor: '#FAF8F5',
      padding: 6,
      editable: true,
      shadow: new Shadow({ color: 'rgba(0,0,0,0.1)', blur: 4, offsetX: 0, offsetY: 1 }),
    });
    headline.setCoords();
    (headline as any).customId = `grabbed_headline_${Date.now()}`;
    (headline as any).customData = { name: 'Judul Utama (Dapat Diedit)' };
    canvas.add(headline);

    // 2. Kartu Tonggak Pembahasan (Gaya Kartu Putih & Badge Oranye persis Gambar 2)
    const cardTonggak = new Textbox('TONGGAK 01: 15.000 PESERTA PELATIHAN\nBalai Latihan Kerja telah melatih 15.000 peserta dengan kurikulum kebutuhan industri.', {
      originX: 'left',
      originY: 'top',
      left: w * 0.50,
      top: h * 0.28,
      width: w * 0.44,
      fontSize: Math.round(w * 0.018),
      fontFamily: "'Inter', sans-serif",
      fontWeight: 'normal',
      fill: '#1E293B',
      backgroundColor: '#FFFFFF',
      padding: 10,
      editable: true,
      shadow: new Shadow({ color: 'rgba(0,0,0,0.12)', blur: 8, offsetX: 0, offsetY: 2 }),
    });
    cardTonggak.setCoords();
    (cardTonggak as any).customId = `grabbed_tonggak_${Date.now()}`;
    (cardTonggak as any).customData = { name: 'Kartu Tonggak (Dapat Diedit)' };
    canvas.add(cardTonggak);

    canvas.setActiveObject(headline);
    canvas.renderAll();
    refreshLayersList(canvas);
    setHasGrabbedText(true);

    toast({
      type: 'success',
      title: 'Teks Berhasil Diurai!',
      description: 'Elemen teks kini dapat digeser bebas atau diklik ganda untuk mengubah kalimatnya.',
    });
  };

  // ─── ADD NEW ELEMENTS ───
  const addTextHeading = () => {
    if (!fabricRef.current) return;
    const txt = new Textbox('JUDUL BARU POSTER', {
      originX: 'left',
      originY: 'top',
      left: canvasNaturalSizeRef.current.width / 2 - 200,
      top: canvasNaturalSizeRef.current.height / 2 - 40,
      width: 400,
      fontSize: 42,
      fontFamily: "'Inter', sans-serif",
      fontWeight: 'bold',
      fill: '#0F172A',
      backgroundColor: '#FAF8F5',
      padding: 6,
      textAlign: 'center',
      shadow: new Shadow({ color: 'rgba(0,0,0,0.15)', blur: 6, offsetX: 0, offsetY: 1 }),
    });
    txt.setCoords();
    (txt as any).customId = `heading_${Date.now()}`;
    (txt as any).customData = { name: 'Judul Baru' };
    fabricRef.current.add(txt);
    fabricRef.current.setActiveObject(txt);
    fabricRef.current.renderAll();
  };

  const addTextBody = () => {
    if (!fabricRef.current) return;
    const txt = new Textbox('Tuliskan poin narasi atau kalimat penjelasan kebijakan Anda di sini.', {
      originX: 'left',
      originY: 'top',
      left: canvasNaturalSizeRef.current.width / 2 - 220,
      top: canvasNaturalSizeRef.current.height / 2,
      width: 440,
      fontSize: 20,
      fontFamily: "'Inter', sans-serif",
      fill: '#1E293B',
      backgroundColor: '#FFFFFF',
      padding: 10,
      shadow: new Shadow({ color: 'rgba(0,0,0,0.12)', blur: 6, offsetX: 0, offsetY: 2 }),
    });
    txt.setCoords();
    (txt as any).customId = `body_${Date.now()}`;
    (txt as any).customData = { name: 'Poin Kalimat' };
    fabricRef.current.add(txt);
    fabricRef.current.setActiveObject(txt);
    fabricRef.current.renderAll();
  };

  const addDimensiCard = () => {
    if (!fabricRef.current) return;
    const txt = new Textbox('TONGGAK BARU: NAMA AGENDA\nTuliskan uraian pencapaian atau kebijakan daerah di sini.', {
      originX: 'left',
      originY: 'top',
      left: canvasNaturalSizeRef.current.width / 2 - 220,
      top: canvasNaturalSizeRef.current.height / 2 - 50,
      width: 440,
      fontSize: 18,
      fontFamily: "'Inter', sans-serif",
      fill: '#1E293B',
      backgroundColor: '#FFFFFF',
      padding: 12,
      shadow: new Shadow({ color: 'rgba(0,0,0,0.15)', blur: 8, offsetX: 0, offsetY: 2 }),
    });
    txt.setCoords();
    (txt as any).customId = `dimensi_${Date.now()}`;
    (txt as any).customData = { name: 'Kartu Tonggak Baru' };
    fabricRef.current.add(txt);
    fabricRef.current.setActiveObject(txt);
    fabricRef.current.renderAll();
  };

  const addBadgeShape = () => {
    if (!fabricRef.current) return;
    const txt = new Textbox('★ TONGGAK 01: PRIORITAS DAERAH ★', {
      originX: 'left',
      originY: 'top',
      left: canvasNaturalSizeRef.current.width / 2 - 180,
      top: canvasNaturalSizeRef.current.height / 2 + 50,
      width: 360,
      fontSize: 16,
      fontFamily: "'Inter', sans-serif",
      fontWeight: 'bold',
      fill: '#FFFFFF',
      backgroundColor: '#EA580C',
      padding: 8,
      textAlign: 'center',
      shadow: new Shadow({ color: 'rgba(0,0,0,0.2)', blur: 6, offsetX: 0, offsetY: 2 }),
    });
    txt.setCoords();
    (txt as any).customId = `badge_${Date.now()}`;
    (txt as any).customData = { name: 'Badge Oranye' };
    fabricRef.current.add(txt);
    fabricRef.current.setActiveObject(txt);
    fabricRef.current.renderAll();
  };

  // Duplicate Object
  const handleDuplicateSelected = () => {
    if (!fabricRef.current || !selectedObject) return;
    selectedObject.clone().then((cloned: FabricObject) => {
      cloned.set({
        left: (cloned.left || 0) + 20,
        top: (cloned.top || 0) + 20,
      });
      (cloned as any).customId = `clone_${Date.now()}`;
      (cloned as any).customData = { name: `Salinan ${(selectedObject as any).customData?.name || 'Layer'}` };
      fabricRef.current?.add(cloned);
      fabricRef.current?.setActiveObject(cloned);
      fabricRef.current?.renderAll();
    });
  };

  // Layer Operations
  const selectLayer = (layer: LayerItem) => {
    if (!fabricRef.current) return;
    fabricRef.current.setActiveObject(layer.object);
    fabricRef.current.renderAll();
    updateStylePanelFromObject(layer.object);
  };

  const toggleLayerVisibility = (layer: LayerItem, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!fabricRef.current) return;
    layer.object.set('visible', !layer.visible);
    fabricRef.current.renderAll();
    refreshLayersList(fabricRef.current);
  };

  const toggleLayerLock = (layer: LayerItem, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!fabricRef.current) return;
    const nextLocked = !layer.locked;
    layer.object.set({
      lockMovementX: nextLocked,
      lockMovementY: nextLocked,
      lockRotation: nextLocked,
      lockScalingX: nextLocked,
      lockScalingY: nextLocked,
      hasControls: !nextLocked,
    });
    fabricRef.current.renderAll();
    refreshLayersList(fabricRef.current);
  };

  const moveLayerUp = (layer: LayerItem, e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (!fabricRef.current) return;
    fabricRef.current.bringObjectForward(layer.object);
    fabricRef.current.renderAll();
    refreshLayersList(fabricRef.current);
  };

  const moveLayerDown = (layer: LayerItem, e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (!fabricRef.current) return;
    fabricRef.current.sendObjectBackwards(layer.object);
    fabricRef.current.renderAll();
    refreshLayersList(fabricRef.current);
  };

  const moveLayerToFront = () => {
    if (!fabricRef.current || !selectedObject) return;
    fabricRef.current.bringObjectToFront(selectedObject);
    fabricRef.current.renderAll();
    refreshLayersList(fabricRef.current);
  };

  const moveLayerToBack = () => {
    if (!fabricRef.current || !selectedObject) return;
    fabricRef.current.sendObjectBackwards(selectedObject);
    const bg = fabricRef.current.getObjects().find((o) => (o as any).customData?.isBackground);
    if (bg) fabricRef.current.sendObjectToBack(bg);
    fabricRef.current.renderAll();
    refreshLayersList(fabricRef.current);
  };

  const deleteSelectedObject = () => {
    if (!fabricRef.current || !selectedObject) return;
    if ((selectedObject as any).customData?.isBackground) {
      toast({ type: 'warning', title: 'Perhatian', description: 'Latar belakang utama tidak dapat dihapus.' });
      return;
    }
    fabricRef.current.remove(selectedObject);
    fabricRef.current.discardActiveObject();
    fabricRef.current.renderAll();
    setSelectedObject(null);
  };

  // ─── SAVE & APPLY (PIXEL-PERFECT EXPORT) ───
  const handleSaveAndApply = () => {
    if (!fabricRef.current) return;
    try {
      const canvas = fabricRef.current;
      const sliceObjects = canvas.getObjects().filter((o) => (o as any).customData?.isComponentSlice);
      sliceObjects.forEach((o) => o.set('stroke', undefined));
      canvas.discardActiveObject();
      canvas.renderAll();

      const renderedUrl = canvas.toDataURL({
        format: 'png',
        multiplier: 1.0,
      });

      sliceObjects.forEach((o) => o.set('stroke', '#7D2AE8'));
      canvas.renderAll();

      const layersJson = JSON.stringify(fabricRef.current.toJSON());

      onApplyChanges(renderedUrl, layersJson);

      toast({
        type: 'success',
        title: 'Desain Berhasil Diterapkan',
        description: 'Perubahan layer dan kalimat berhasil disimpan ke infografis Anda.',
      });

      onClose();
    } catch (err: any) {
      toast({
        type: 'error',
        title: 'Gagal Menyimpan',
        description: err?.message || 'Terjadi kendala saat mengekspor kanvas.',
      });
    }
  };

  // ─── DOWNLOAD HIGH-RES HD ───
  const handleDownload = () => {
    if (!fabricRef.current) return;
    try {
      const canvas = fabricRef.current;
      const sliceObjects = canvas.getObjects().filter((o) => (o as any).customData?.isComponentSlice);
      sliceObjects.forEach((o) => o.set('stroke', undefined));
      canvas.discardActiveObject();
      canvas.renderAll();

      const renderedUrl = canvas.toDataURL({
        format: 'png',
        multiplier: 1.5,
      });

      sliceObjects.forEach((o) => o.set('stroke', '#7D2AE8'));
      canvas.renderAll();

      const link = document.createElement('a');
      link.download = `polaris-magic-layers-${Date.now()}.png`;
      link.href = renderedUrl;
      link.click();

      toast({
        type: 'success',
        title: 'Unduhan Dimulai',
        description: 'Berkas gambar resolusi tinggi (HD) berhasil diunduh ke komputer Anda.',
      });
    } catch (err: any) {
      toast({
        type: 'error',
        title: 'Gagal Mengunduh',
        description: err?.message || 'Kendala saat mengunduh gambar.',
      });
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-[#F4F5F7] flex flex-col h-screen w-screen overflow-hidden text-slate-800 antialiased font-sans select-none animate-in fade-in duration-200">
      
      {/* ─── 1. TOP HEADER (CANVA PURE WHITE STUDIO BAR) ─── */}
      <header className="h-14 bg-white border-b border-slate-200 flex items-center justify-between px-4 sm:px-6 shrink-0 z-30 shadow-xs">
        
        {/* SISI KIRI: TOMBOL KEMBALI & INFORMASI DOKUMEN */}
        <div className="flex items-center gap-3">
          <button
            onClick={onClose}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-xs font-bold text-slate-700 transition-colors cursor-pointer"
            title="Keluar dari Magic Layers Studio"
          >
            <ArrowLeft className="h-4 w-4 text-slate-500" strokeWidth={1.75} />
            <span className="hidden sm:inline">Selesai / Tutup</span>
          </button>

          <div className="h-5 w-px bg-slate-200" />

          <div className="flex items-center gap-2">
            <div className="h-7 w-7 rounded-lg border border-purple-200 bg-purple-50 flex items-center justify-center text-purple-700">
              <Sparkles className="h-4 w-4" strokeWidth={1.75} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-black text-slate-900 tracking-tight">Magic Layers Studio</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-purple-50 text-purple-700 border border-purple-200 font-bold">
                  Canva AI
                </span>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-md bg-slate-100 text-slate-600 font-bold">
                  {canvasNaturalSizeRef.current.width} × {canvasNaturalSizeRef.current.height} px
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* SISI TENGAH: ZOOM CONTROLS (FIT TO SCREEN) */}
        <div className="hidden md:flex items-center gap-1.5 bg-slate-50 border border-slate-200 px-2 py-1 rounded-xl">
          <button
            onClick={() => setZoomLevel((prev) => Math.max(0.4, prev - 0.15))}
            className="p-1 text-slate-500 hover:text-slate-800 hover:bg-white rounded transition-colors"
            title="Perkecil Kanvas"
          >
            <ZoomOut className="h-3.5 w-3.5" strokeWidth={1.75} />
          </button>
          
          <button
            onClick={() => setZoomLevel(1.0)}
            className={`px-2 py-0.5 rounded text-[11px] font-bold font-mono transition-colors ${
              zoomLevel === 1.0 ? 'bg-white text-purple-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
            title="Sesuaikan Pas Layar (100% Konten Tampak)"
          >
            Fit ({Math.round(zoomLevel * 100)}%)
          </button>

          <button
            onClick={() => setZoomLevel((prev) => Math.min(2.5, prev + 0.15))}
            className="p-1 text-slate-500 hover:text-slate-800 hover:bg-white rounded transition-colors"
            title="Perbesar Kanvas"
          >
            <ZoomIn className="h-3.5 w-3.5" strokeWidth={1.75} />
          </button>
        </div>

        {/* SISI KANAN: UNDUH HD & TERAPKAN DESAIN */}
        <div className="flex items-center gap-2">
          {/* TOMBOL MAGIC LAYERS (DI SEBELAH KIRI UNDUH HD) */}
          {!isDecomposed ? (
            <button
              type="button"
              onClick={handleTriggerMagicLayers}
              disabled={isScanning}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all shadow-xs cursor-pointer bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white disabled:opacity-60"
              title="Pindai dan urai teks serta kartu menjadi komponen interaktif seperti di Canva"
            >
              <Sparkles
                className={`h-3.5 w-3.5 ${isScanning ? 'animate-spin text-cyan-300' : 'text-yellow-300'}`}
                strokeWidth={1.75}
              />
              <span>{isScanning ? 'Memindai Komponen...' : '✨ Magic Layers'}</span>
            </button>
          ) : (
            <div className="flex items-center gap-1.5">
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-purple-50 text-purple-700 border border-purple-200">
                <Sparkles className="h-3.5 w-3.5 text-purple-600" strokeWidth={1.75} />
                <span>Komponen Terurai</span>
              </span>
              <button
                type="button"
                onClick={handleResetToOriginal}
                className="px-2.5 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-xs font-bold text-slate-600 transition-colors cursor-pointer"
                title="Kembalikan kanvas ke gambar poster asli"
              >
                Reset Poster
              </button>
            </div>
          )}

          {/* UNDUH HD */}
          <button
            type="button"
            onClick={handleDownload}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-xs font-bold text-slate-700 transition-colors cursor-pointer"
            title="Unduh berkas gambar HD ke laptop/komputer"
          >
            <Download className="h-3.5 w-3.5 text-slate-500" strokeWidth={1.75} />
            <span className="hidden md:inline">Unduh HD</span>
          </button>

          {/* TERAPKAN & SIMPAN */}
          <Button
            size="sm"
            onClick={handleSaveAndApply}
            className="bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold gap-1.5 shadow-sm cursor-pointer"
            title="Simpan susunan layer dan terapkan ke infografis"
          >
            <Save className="h-3.5 w-3.5 text-white" strokeWidth={1.75} />
            <span>Terapkan Desain</span>
          </Button>
        </div>
      </header>

      {/* ─── 2. CONTEXTUAL FORMATTING BAR (CANVA WHITE SUBHEADER) ─── */}
      <div className="h-12 bg-white border-b border-slate-200 flex items-center justify-between px-4 sm:px-6 shrink-0 z-20 gap-3 overflow-x-auto shadow-2xs">
        {selectedObject && (selectedObject instanceof Textbox || (selectedObject as any).customData?.isComponentSlice) ? (
          <div className="flex items-center gap-2.5 shrink-0 w-full animate-in fade-in duration-150">
            
            {/* INPUT LANGSUNG UBAH KALIMAT */}
            <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1 flex-1 max-w-sm">
              <Edit3 className="h-3.5 w-3.5 text-purple-600 shrink-0" strokeWidth={1.75} />
              <input
                type="text"
                value={currentTextContent}
                onChange={(e) => handleLiveTextChange(e.target.value)}
                placeholder="Ubah isi kalimat di sini..."
                className="bg-transparent border-none text-xs text-slate-800 font-medium focus:outline-hidden w-full"
              />
            </div>

            <div className="h-5 w-px bg-slate-200" />

            {/* FONT SELECT */}
            <select
              value={fontFamily}
              onChange={(e) => applyFontFamily(e.target.value)}
              className="bg-white border border-slate-200 text-slate-700 text-xs rounded-lg px-2.5 py-1.5 font-medium outline-hidden hover:border-slate-300"
            >
              {PRESET_FONTS.map((f) => (
                <option key={f.value} value={f.value}>
                  {f.label}
                </option>
              ))}
            </select>

            {/* FONT SIZE CONTROLS */}
            <div className="flex items-center bg-slate-50 border border-slate-200 rounded-lg overflow-hidden">
              <button
                onClick={() => applyFontSize(Math.max(12, fontSize - 4))}
                className="px-2 py-1 text-xs text-slate-600 hover:bg-slate-200 font-bold"
              >
                -
              </button>
              <span className="text-xs font-mono font-bold text-slate-800 px-2">{fontSize}</span>
              <button
                onClick={() => applyFontSize(fontSize + 4)}
                className="px-2 py-1 text-xs text-slate-600 hover:bg-slate-200 font-bold"
              >
                +
              </button>
            </div>

            {/* BOLD & ITALIC */}
            <div className="flex items-center gap-0.5 bg-slate-50 p-0.5 rounded-lg border border-slate-200">
              <button
                onClick={toggleBold}
                className={`p-1.5 rounded transition-colors ${isBold ? 'bg-purple-600 text-white' : 'text-slate-600 hover:bg-white'}`}
                title="Tebal (Bold)"
              >
                <Bold className="h-3.5 w-3.5" strokeWidth={1.75} />
              </button>
              <button
                onClick={toggleItalic}
                className={`p-1.5 rounded transition-colors ${isItalic ? 'bg-purple-600 text-white' : 'text-slate-600 hover:bg-white'}`}
                title="Miring (Italic)"
              >
                <Italic className="h-3.5 w-3.5" strokeWidth={1.75} />
              </button>
            </div>

            {/* ALIGNMENT */}
            <div className="flex items-center gap-0.5 bg-slate-50 p-0.5 rounded-lg border border-slate-200">
              <button
                onClick={() => applyTextAlign('left')}
                className={`p-1.5 rounded transition-colors ${textAlign === 'left' ? 'bg-purple-600 text-white' : 'text-slate-600 hover:bg-white'}`}
                title="Rata Kiri"
              >
                <AlignLeft className="h-3.5 w-3.5" strokeWidth={1.75} />
              </button>
              <button
                onClick={() => applyTextAlign('center')}
                className={`p-1.5 rounded transition-colors ${textAlign === 'center' ? 'bg-purple-600 text-white' : 'text-slate-600 hover:bg-white'}`}
                title="Rata Tengah"
              >
                <AlignCenter className="h-3.5 w-3.5" strokeWidth={1.75} />
              </button>
              <button
                onClick={() => applyTextAlign('right')}
                className={`p-1.5 rounded transition-colors ${textAlign === 'right' ? 'bg-purple-600 text-white' : 'text-slate-600 hover:bg-white'}`}
                title="Rata Kanan"
              >
                <AlignRight className="h-3.5 w-3.5" strokeWidth={1.75} />
              </button>
            </div>

            {/* COLOR SWATCH */}
            <div className="flex items-center gap-1 bg-slate-50 px-2 py-1 rounded-lg border border-slate-200" title="Warna Teks">
              <span className="text-[10px] font-bold text-slate-500 uppercase mr-1">Teks:</span>
              {PRESET_COLORS.map((col) => (
                <button
                  key={col}
                  onClick={() => applyFillColor(col)}
                  className={`h-4 w-4 rounded-full border border-slate-300 transition-transform hover:scale-125 ${
                    fillColor === col ? 'ring-2 ring-purple-600 scale-110' : ''
                  }`}
                  style={{ backgroundColor: col }}
                  title={`Warna: ${col}`}
                />
              ))}
            </div>

            {/* CARD BACKGROUND SELECT */}
            <select
              value={bgColor}
              onChange={(e) => applyBgColor(e.target.value)}
              className="bg-white border border-slate-200 text-slate-700 text-xs rounded-lg px-2.5 py-1.5 font-medium outline-hidden hover:border-slate-300"
              title="Latar Belakang Kotak / Kartu Teks"
            >
              {PRESET_BG_COLORS.map((bg) => (
                <option key={bg.value} value={bg.value}>
                  {bg.label}
                </option>
              ))}
            </select>

            <div className="h-5 w-px bg-slate-200" />

            {/* LAYER ORDER SHORTCUTS */}
            <div className="flex items-center gap-1">
              <button
                onClick={moveLayerToFront}
                className="px-2 py-1 rounded border border-slate-200 hover:bg-slate-50 text-[11px] font-bold text-slate-700 transition-colors"
                title="Bawa teks ke lapisan paling depan"
              >
                Paling Depan
              </button>
              <button
                onClick={moveLayerToBack}
                className="px-2 py-1 rounded border border-slate-200 hover:bg-slate-50 text-[11px] font-bold text-slate-700 transition-colors"
                title="Kirim teks ke belakang subjek / orang"
              >
                Ke Belakang
              </button>
            </div>

            {/* DUPLICATE & DELETE */}
            <div className="flex items-center gap-1 ml-auto">
              <button
                onClick={handleDuplicateSelected}
                className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-600 transition-colors"
                title="Gandakan Elemen Ini"
              >
                <Copy className="h-3.5 w-3.5" strokeWidth={1.75} />
              </button>
              <button
                onClick={deleteSelectedObject}
                className="p-1.5 rounded-lg border border-red-200 hover:bg-red-50 text-red-600 transition-colors"
                title="Hapus Elemen Ini"
              >
                <Trash2 className="h-3.5 w-3.5" strokeWidth={1.75} />
              </button>
            </div>

          </div>
        ) : selectedObject ? (
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-700">
                Layer Terpilih: {(selectedObject as any).customData?.name || 'Objek Kanvas'}
              </span>
              <span className="text-[11px] text-slate-400">
                (Tarik sudut untuk mengubah ukuran, atau geser untuk memindahkan posisi objek)
              </span>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                onClick={moveLayerToFront}
                className="px-2.5 py-1 rounded-lg border border-slate-200 hover:bg-slate-50 text-xs font-bold text-slate-700"
              >
                Ke Depan
              </button>
              <button
                onClick={moveLayerToBack}
                className="px-2.5 py-1 rounded-lg border border-slate-200 hover:bg-slate-50 text-xs font-bold text-slate-700"
              >
                Ke Belakang
              </button>
              <button
                onClick={deleteSelectedObject}
                className="p-1.5 rounded-lg border border-red-200 hover:bg-red-50 text-red-600 transition-colors"
                title="Hapus Elemen Ini"
              >
                <Trash2 className="h-3.5 w-3.5" strokeWidth={1.75} />
              </button>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-between w-full text-xs text-slate-500">
            <div className="flex items-center gap-2">
              <Sparkles className="h-3.5 w-3.5 text-purple-600" strokeWidth={1.75} />
              <span>
                <strong>Mode Magic Layers:</strong> Semua elemen telah otomatis diurai menjadi komponen. Klik langsung pada teks atau objek di kanvas untuk menggeser, mengubah ukuran, atau mengedit kalimatnya.
              </span>
            </div>
            {isCuttingOut && (
              <div className="flex items-center gap-1.5 text-purple-700 font-semibold bg-purple-50 px-2.5 py-0.5 rounded-full border border-purple-200 text-[11px]">
                <Loader2 className="h-3 w-3 animate-spin" strokeWidth={1.75} />
                <span>Mengekstrak subjek objek depan...</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ─── 3. MAIN WORKSPACE: SIDEBAR + CENTER CANVAS ─── */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* SISI KIRI: TAB ICON NAVIGATOR (CANVA STYLE) */}
        <aside className="w-16 bg-white border-r border-slate-200 flex flex-col items-center py-3 gap-2 shrink-0 z-10 shadow-2xs">
          <button
            onClick={() => setActiveTab('layers')}
            className={`flex flex-col items-center justify-center w-12 h-12 rounded-xl transition-all ${
              activeTab === 'layers'
                ? 'bg-purple-50 text-purple-700 font-bold'
                : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
            }`}
            title="Susunan Lapisan (Z-Index)"
          >
            <Layers className="h-5 w-5" strokeWidth={1.75} />
            <span className="text-[9.5px] mt-0.5">Lapisan</span>
          </button>

          <button
            onClick={() => setActiveTab('text')}
            className={`flex flex-col items-center justify-center w-12 h-12 rounded-xl transition-all ${
              activeTab === 'text'
                ? 'bg-purple-50 text-purple-700 font-bold'
                : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
            }`}
            title="Tambah Elemen Teks"
          >
            <Type className="h-5 w-5" strokeWidth={1.75} />
            <span className="text-[9.5px] mt-0.5">Teks</span>
          </button>

          <button
            onClick={() => setActiveTab('elements')}
            className={`flex flex-col items-center justify-center w-12 h-12 rounded-xl transition-all ${
              activeTab === 'elements'
                ? 'bg-purple-50 text-purple-700 font-bold'
                : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
            }`}
            title="Tambah Bentuk & Kartu Tonggak"
          >
            <Square className="h-5 w-5" strokeWidth={1.75} />
            <span className="text-[9.5px] mt-0.5">Elemen</span>
          </button>

          <button
            onClick={() => setActiveTab('magic')}
            className={`flex flex-col items-center justify-center w-12 h-12 rounded-xl transition-all ${
              activeTab === 'magic'
                ? 'bg-purple-50 text-purple-700 font-bold'
                : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
            }`}
            title="Fitur AI Magic Layers"
          >
            <Wand2 className="h-5 w-5" strokeWidth={1.75} />
            <span className="text-[9.5px] mt-0.5">Magic AI</span>
          </button>
        </aside>

        {/* DRAWER KONTEN SIDEBAR */}
        <div className="w-72 bg-white border-r border-slate-200 flex flex-col shrink-0 overflow-y-auto">
          {/* TAB 1: SUSUNAN LAPISAN (LAYERS) */}
          {activeTab === 'layers' && (
            <div className="flex flex-col h-full">
              <div className="px-4 py-3.5 border-b border-slate-100 flex items-center justify-between bg-slate-50/60">
                <span className="text-xs font-black uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                  <Layers className="h-4 w-4 text-purple-600" strokeWidth={1.75} />
                  <span>Susunan Lapisan ({layers.length})</span>
                </span>
                <span className="text-[10px] text-slate-400 font-mono">Atas ke Bawah</span>
              </div>

              <div className="flex-1 overflow-y-auto p-2.5 space-y-1.5">
                {layers.map((layer, index) => {
                  const isSelected = selectedLayerId === layer.id;
                  const isBg = (layer.object as any).customData?.isBackground;
                  const isCutout = (layer.object as any).customData?.isCutout;

                  return (
                    <div
                      key={layer.id}
                      onClick={() => selectLayer(layer)}
                      className={`flex items-center justify-between p-2.5 rounded-xl text-xs transition-all cursor-pointer border ${
                        isSelected
                          ? 'bg-purple-50/80 border-purple-300 text-purple-950 font-bold shadow-2xs'
                          : isCutout
                          ? 'bg-purple-50/40 border-purple-200 text-purple-800 font-semibold'
                          : isBg
                          ? 'bg-slate-50 border-slate-200 text-slate-500'
                          : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-700'
                      }`}
                    >
                      <div className="flex items-center gap-2 overflow-hidden mr-2">
                        {isCutout ? (
                          <Sparkles className="h-3.5 w-3.5 text-purple-600 shrink-0" strokeWidth={1.75} />
                        ) : layer.object instanceof Textbox ? (
                          <Type className="h-3.5 w-3.5 text-blue-600 shrink-0" strokeWidth={1.75} />
                        ) : layer.object instanceof FabricImage ? (
                          <ImageIcon className="h-3.5 w-3.5 text-slate-500 shrink-0" strokeWidth={1.75} />
                        ) : (
                          <Square className="h-3.5 w-3.5 text-emerald-600 shrink-0" strokeWidth={1.75} />
                        )}
                        <span className="truncate text-xs">{layer.name}</span>
                      </div>

                      {/* LAYER ACTION BUTTONS */}
                      <div className="flex items-center gap-1 shrink-0">
                        {/* MOVE UP */}
                        <button
                          onClick={(e) => moveLayerUp(layer, e)}
                          disabled={index === 0 || isBg}
                          className="p-1 rounded text-slate-400 hover:text-slate-800 hover:bg-slate-100 disabled:opacity-20"
                          title="Naikkan Layer (Ke Depan)"
                        >
                          <ArrowUp className="h-3.5 w-3.5" strokeWidth={1.75} />
                        </button>

                        {/* MOVE DOWN */}
                        <button
                          onClick={(e) => moveLayerDown(layer, e)}
                          disabled={index === layers.length - 1 || isBg}
                          className="p-1 rounded text-slate-400 hover:text-slate-800 hover:bg-slate-100 disabled:opacity-20"
                          title="Turunkan Layer (Ke Belakang)"
                        >
                          <ArrowDown className="h-3.5 w-3.5" strokeWidth={1.75} />
                        </button>

                        {/* LOCK */}
                        <button
                          onClick={(e) => toggleLayerLock(layer, e)}
                          className={`p-1 rounded hover:bg-slate-100 ${layer.locked ? 'text-amber-600' : 'text-slate-400'}`}
                          title={layer.locked ? 'Kunci Dibuka' : 'Kunci Posisi'}
                        >
                          {layer.locked ? <Lock className="h-3.5 w-3.5" strokeWidth={1.75} /> : <Unlock className="h-3.5 w-3.5" strokeWidth={1.75} />}
                        </button>

                        {/* VISIBILITY */}
                        <button
                          onClick={(e) => toggleLayerVisibility(layer, e)}
                          className={`p-1 rounded hover:bg-slate-100 ${layer.visible ? 'text-slate-500' : 'text-slate-300'}`}
                          title={layer.visible ? 'Sembunyikan' : 'Tampilkan'}
                        >
                          {layer.visible ? <Eye className="h-3.5 w-3.5" strokeWidth={1.75} /> : <EyeOff className="h-3.5 w-3.5" strokeWidth={1.75} />}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* LIVE SENTENCE EDITOR UNTUK LAYER TERPILIH */}
              {selectedObject && (selectedObject instanceof Textbox || (selectedObject as any).customData?.isComponentSlice) && (
                <div className="p-3 bg-purple-50/70 border-t border-purple-200 mt-auto shrink-0 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-purple-950 flex items-center gap-1.5">
                      <Edit3 className="h-3.5 w-3.5 text-purple-600" strokeWidth={1.75} />
                      <span>Ubah Isi Kalimat Kartu</span>
                    </span>
                    <span className="text-[10px] text-purple-700 font-semibold bg-purple-100/80 px-1.5 py-0.5 rounded">
                      Live Sync
                    </span>
                  </div>
                  <textarea
                    rows={4}
                    value={currentTextContent}
                    onChange={(e) => handleLiveTextChange(e.target.value)}
                    className="w-full text-xs p-2 rounded-lg border border-purple-200 bg-white text-slate-800 focus:outline-hidden focus:ring-1 focus:ring-purple-500 font-medium leading-relaxed resize-none"
                    placeholder="Ketik kalimat atau ubah isi teks kartu di sini..."
                  />
                  <p className="text-[10px] text-slate-500 leading-tight">
                    💡 Anda juga dapat mengklik ganda (double-click) langsung pada kartu di kanvas untuk mengeditnya di tempat.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: TAMBAH TEKS */}
          {activeTab === 'text' && (
            <div className="p-4 space-y-4">
              <div>
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-800">Tambahkan Teks</h3>
                <p className="text-[11px] text-slate-400">Klik untuk menyisipkan teks yang dapat digeser bebas</p>
              </div>

              <div className="space-y-2.5">
                <button
                  onClick={addTextHeading}
                  className="w-full text-left p-3 rounded-xl border border-slate-200 hover:border-purple-300 hover:bg-purple-50/50 transition-all cursor-pointer group"
                >
                  <span className="block font-black text-base text-slate-900 group-hover:text-purple-700">
                    + Tambah Judul Utama
                  </span>
                  <span className="text-[11px] text-slate-400">Teks judul tegas bergaya poster</span>
                </button>

                <button
                  onClick={addTextBody}
                  className="w-full text-left p-3 rounded-xl border border-slate-200 hover:border-purple-300 hover:bg-purple-50/50 transition-all cursor-pointer group"
                >
                  <span className="block font-bold text-sm text-slate-800 group-hover:text-purple-700">
                    + Tambah Poin Narasi
                  </span>
                  <span className="text-[11px] text-slate-400">Kalimat isi atau paragraf kebijakan</span>
                </button>

                <button
                  onClick={addDimensiCard}
                  className="w-full text-left p-3 rounded-xl border border-slate-200 hover:border-purple-300 hover:bg-purple-50/50 transition-all cursor-pointer group"
                >
                  <span className="block font-bold text-sm text-slate-800 group-hover:text-purple-700">
                    + Kartu Tonggak / Dimensi
                  </span>
                  <span className="text-[11px] text-slate-400">Kotak kartu berlatar putih bersih</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB 3: ELEMEN & KARTU */}
          {activeTab === 'elements' && (
            <div className="p-4 space-y-4">
              <div>
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-800">Elemen Visual</h3>
                <p className="text-[11px] text-slate-400">Sisipkan lencana dan kartu penegas</p>
              </div>

              <div className="space-y-2.5">
                <button
                  onClick={addBadgeShape}
                  className="w-full text-left p-3 rounded-xl border border-slate-200 hover:border-purple-300 hover:bg-purple-50/50 transition-all cursor-pointer group"
                >
                  <span className="block font-bold text-xs uppercase text-white bg-orange-600 px-2 py-0.5 rounded inline-block mb-1">
                    TONGGAK 01
                  </span>
                  <span className="block text-xs font-semibold text-slate-700">Badge oranye penanda poin</span>
                </button>

                <button
                  onClick={addDimensiCard}
                  className="w-full text-left p-3 rounded-xl border border-slate-200 hover:border-purple-300 hover:bg-purple-50/50 transition-all cursor-pointer group"
                >
                  <span className="block font-bold text-xs text-slate-800">Kartu Putih Elegan</span>
                  <span className="text-[11px] text-slate-400">Untuk menaruh kutipan atau rangkuman data</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB 4: MAGIC AI */}
          {activeTab === 'magic' && (
            <div className="p-4 space-y-4">
              <div>
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                  <Sparkles className="h-4 w-4 text-purple-600" strokeWidth={1.75} />
                  <span>Fitur Cerdas AI</span>
                </h3>
                <p className="text-[11px] text-slate-400">Otomasi pemisahan layer visual seperti di Canva Pro</p>
              </div>

              <div className="space-y-3">
                <div className="p-3.5 rounded-xl border border-purple-200 bg-purple-50/50 space-y-2">
                  <div className="flex items-center gap-2">
                    <Wand2 className="h-4 w-4 text-purple-600" strokeWidth={1.75} />
                    <span className="text-xs font-bold text-purple-900">Pisahkan Objek Depan (Cutout)</span>
                  </div>
                  <p className="text-[11px] text-slate-600 leading-relaxed">
                    Mengekstrak figur orang atau subjek utama menjadi layer terpisah di depan menggunakan AI.
                  </p>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleMagicCutout}
                    disabled={isCuttingOut}
                    className="w-full border-purple-300 bg-white hover:bg-purple-50 text-purple-700 font-bold text-xs"
                  >
                    {isCuttingOut ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" strokeWidth={1.75} />
                    ) : (
                      <Wand2 className="h-3.5 w-3.5 mr-1.5 text-purple-600" strokeWidth={1.75} />
                    )}
                    {isCuttingOut ? 'Mengekstrak Subjek AI...' : cutoutSuccess ? 'Objek Terpisah' : 'Pisahkan Objek Depan'}
                  </Button>
                </div>

                <div className="p-3.5 rounded-xl border border-purple-200 bg-purple-50/50 space-y-2">
                  <div className="flex items-center gap-2">
                    <Type className="h-4 w-4 text-purple-600" strokeWidth={1.75} />
                    <span className="text-xs font-bold text-purple-900">Urai Teks (Magic Grab Text)</span>
                  </div>
                  <p className="text-[11px] text-slate-600 leading-relaxed">
                    Mengubah judul dan kartu pembahasan pada poster menjadi teks interaktif yang dapat digeser dan diubah kata-katanya.
                  </p>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleGrabText}
                    className="w-full border-purple-300 bg-white hover:bg-purple-50 text-purple-700 font-bold text-xs"
                  >
                    <Type className="h-3.5 w-3.5 mr-1.5 text-purple-600" strokeWidth={1.75} />
                    {hasGrabbedText ? 'Teks Terurai' : 'Jalankan Grab Text'}
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ─── CENTER CANVAS WORKSPACE (100% PERSIS UKURAN POSTER ASLI GAMBAR 2) ─── */}
        <main
          ref={workspaceRef}
          className="flex-1 bg-[#F1F3F5] relative flex items-center justify-center p-4 sm:p-8 overflow-auto"
        >
          {isLoading && (
            <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-white/80 backdrop-blur-xs gap-3">
              <Loader2 className="h-8 w-8 text-purple-600 animate-spin" />
              <span className="text-xs font-bold text-slate-700">Memuat Lembaran Poster...</span>
            </div>
          )}

          {/* POSTER CARD (UKURAN LEMBARAN TEPAT MENGIKUTI POSTER) */}
          <div
            className="shadow-2xl ring-1 ring-slate-900/10 bg-white transition-all duration-75 overflow-hidden flex items-center justify-center shrink-0 relative"
            style={{
              width: displayDimensions.width > 0 ? `${displayDimensions.width}px` : 'auto',
              height: displayDimensions.height > 0 ? `${displayDimensions.height}px` : 'auto',
            }}
          >
            <canvas ref={canvasElRef} />

            {/* ─── EFEK ANIMASI SCANNING SEPERTI PADA GAMBAR REFERENSI (CANVA MAGIC LAYERS SCANNER) ─── */}
            {isScanning && (
              <div className="absolute inset-0 z-30 pointer-events-none overflow-hidden select-none">
                {/* Background Dim Tint saat Scanning */}
                <div className="absolute inset-0 bg-purple-950/20 backdrop-brightness-95 transition-opacity duration-300" />

                {/* Sinar Laser Scanner Menyapu dari Kiri ke Kanan dengan Glow Gradasi Ungu-Cyan */}
                <div
                  className="absolute top-0 bottom-0 pointer-events-none"
                  style={{
                    width: '35%',
                    animation: 'magicScannerSweep 1.8s ease-in-out infinite',
                    background:
                      'linear-gradient(90deg, rgba(125,42,232,0) 0%, rgba(125,42,232,0.3) 25%, rgba(6,182,212,0.65) 50%, rgba(125,42,232,0.3) 75%, rgba(125,42,232,0) 100%)',
                    boxShadow: '0 0 45px 15px rgba(6, 182, 212, 0.5), 0 0 70px 25px rgba(125, 42, 232, 0.35)',
                  }}
                >
                  {/* Garis Pusat Laser Neon Terang */}
                  <div className="absolute left-1/2 top-0 bottom-0 w-1 -translate-x-1/2 bg-cyan-200 shadow-[0_0_18px_5px_rgba(34,211,238,0.95)]" />
                </div>

                {/* ─── 4-STAGE PIPELINE PROGRESS HUD (SESUAI LANGKAH CANVA MAGIC LAYERS) ─── */}
                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-40 bg-slate-900/95 backdrop-blur-md text-white px-5 py-3.5 rounded-2xl border border-purple-500/40 shadow-2xl flex flex-col gap-2.5 min-w-[320px] max-w-sm animate-in fade-in slide-in-from-bottom-3 duration-200 pointer-events-auto">
                  <div className="flex items-center justify-between border-b border-slate-700/60 pb-2">
                    <div className="flex items-center gap-2">
                      <Sparkles className="h-4 w-4 text-purple-400 animate-spin" strokeWidth={1.75} />
                      <span className="text-xs font-black tracking-wide text-purple-200 uppercase">Pipeline Magic Layers</span>
                    </div>
                    <span className="text-[10px] font-mono text-cyan-300 font-bold bg-cyan-950/80 px-2 py-0.5 rounded-full border border-cyan-800/60">
                      Tahap {pipelineStep || 1}/4
                    </span>
                  </div>

                  <div className="space-y-1.5 text-[11px]">
                    <div className={`flex items-center gap-2 ${pipelineStep >= 1 ? 'text-white' : 'text-slate-500'}`}>
                      <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-bold ${pipelineStep > 1 ? 'bg-emerald-500 text-white' : pipelineStep === 1 ? 'bg-cyan-400 text-slate-900 animate-pulse' : 'bg-slate-700 text-slate-400'}`}>
                        {pipelineStep > 1 ? '✓' : '1'}
                      </span>
                      <span className={pipelineStep === 1 ? 'font-bold text-cyan-200' : ''}>1. Deteksi & Segmentasi Objek (Alpha Mask)</span>
                    </div>

                    <div className={`flex items-center gap-2 ${pipelineStep >= 2 ? 'text-white' : 'text-slate-500'}`}>
                      <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-bold ${pipelineStep > 2 ? 'bg-emerald-500 text-white' : pipelineStep === 2 ? 'bg-cyan-400 text-slate-900 animate-pulse' : 'bg-slate-700 text-slate-400'}`}>
                        {pipelineStep > 2 ? '✓' : '2'}
                      </span>
                      <span className={pipelineStep === 2 ? 'font-bold text-cyan-200' : ''}>2. Pemisahan Teks & Rekonstruksi Tipografi</span>
                    </div>

                    <div className={`flex items-center gap-2 ${pipelineStep >= 3 ? 'text-white' : 'text-slate-500'}`}>
                      <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-bold ${pipelineStep > 3 ? 'bg-emerald-500 text-white' : pipelineStep === 3 ? 'bg-cyan-400 text-slate-900 animate-pulse' : 'bg-slate-700 text-slate-400'}`}>
                        {pipelineStep > 3 ? '✓' : '3'}
                      </span>
                      <span className={pipelineStep === 3 ? 'font-bold text-cyan-200' : ''}>3. Pemulihan Latar Belakang (Inpainting AI)</span>
                    </div>

                    <div className={`flex items-center gap-2 ${pipelineStep >= 4 ? 'text-white' : 'text-slate-500'}`}>
                      <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-bold ${pipelineStep === 4 ? 'bg-cyan-400 text-slate-900 animate-pulse' : 'bg-slate-700 text-slate-400'}`}>
                        4
                      </span>
                      <span className={pipelineStep === 4 ? 'font-bold text-cyan-200' : ''}>4. Vektorisasi & Struktur Dokumen Berlapis</span>
                    </div>
                  </div>

                  {pipelineStatusText && (
                    <p className="text-[10px] text-purple-300 italic truncate pt-1 border-t border-slate-800">
                      {pipelineStatusText}
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* ─── BINGKAI SELEKSI UNGU KHAS CANVA (PERSIS GAMBAR 1) ─── */}
            {isDecomposed && !isScanning && (
              <div className="absolute inset-0 pointer-events-none border-2 border-dashed border-[#7D2AE8] z-20">
                {/* 4 Handle Lingkaran di Sudut */}
                <div className="absolute -top-2.5 -left-2.5 w-5 h-5 rounded-full bg-white border-2 border-[#7D2AE8] shadow-md pointer-events-auto cursor-nwse-resize" />
                <div className="absolute -top-2.5 -right-2.5 w-5 h-5 rounded-full bg-white border-2 border-[#7D2AE8] shadow-md pointer-events-auto cursor-nesw-resize" />
                <div className="absolute -bottom-2.5 -left-2.5 w-5 h-5 rounded-full bg-white border-2 border-[#7D2AE8] shadow-md pointer-events-auto cursor-nesw-resize" />
                <div className="absolute -bottom-2.5 -right-2.5 w-5 h-5 rounded-full bg-white border-2 border-[#7D2AE8] shadow-md pointer-events-auto cursor-nwse-resize" />

                {/* 4 Handle Pill di Sisi Tengah */}
                <div className="absolute top-1/2 -left-2 -translate-y-1/2 w-3.5 h-6 rounded-full bg-white border-2 border-[#7D2AE8] shadow-md pointer-events-auto cursor-ew-resize" />
                <div className="absolute top-1/2 -right-2 -translate-y-1/2 w-3.5 h-6 rounded-full bg-white border-2 border-[#7D2AE8] shadow-md pointer-events-auto cursor-ew-resize" />
                <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-6 h-3.5 rounded-full bg-white border-2 border-[#7D2AE8] shadow-md pointer-events-auto cursor-ns-resize" />
                <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-6 h-3.5 rounded-full bg-white border-2 border-[#7D2AE8] shadow-md pointer-events-auto cursor-ns-resize" />
              </div>
            )}
          </div>
        </main>

      </div>

      <style>{`
        @keyframes magicScannerSweep {
          0% {
            left: -35%;
            opacity: 0;
          }
          15% {
            opacity: 1;
          }
          85% {
            opacity: 1;
          }
          100% {
            left: 120%;
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
}
