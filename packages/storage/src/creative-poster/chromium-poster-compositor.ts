import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';
import { isInfographicArchetype } from '@polaris/shared-types';
import { BrowserSingleton } from './browser-singleton.js';
import { ChromiumFontFace } from './chromium-font-face.js';
import type { PosterLayerManifest } from './poster-layer-manifest.js';
import { PosterColorHarmonizer, isColorDark } from './poster-color-harmonizer.js';
import { renderExtendedInfographicLayout, buildEditorialPieChartHtml } from './infographic-templates-extended.js';

/** Escape teks dinamis (hasil AI / input user) sebelum disisipkan ke HTML. */
function esc(value: unknown): string {
  return String(value ?? '')
    .replace(/\s*\/\/+\s*/g, ' • ')
    .replace(/\(\s*POIN\s*0?\d+\s*[-–—]\s*POIN\s*0?\d+\s*\)/gi, '')
    .replace(/\s*(?:&|\/|-|•)\s*$/g, '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/** Validasi warna hex agar nilai dari AI tidak bisa menyuntik CSS. */
function safeHex(value: string | undefined, fallback: string): string {
  return value && /^#[0-9a-fA-F]{3,8}$/.test(value) ? value : fallback;
}

export interface ChromiumPosterPoint {
  label: string;
  text: string;
  badge?: string;
  metric?: string;
}

export interface ChromiumPosterStat {
  value: string;
  label: string;
}

export interface ChromiumPosterChartSlice {
  label: string;
  percentage: number;
}

export interface ChromiumPosterChartData {
  title: string;
  type?: 'PIE' | 'DONUT';
  centerDominantNumber?: string;
  centerDominantLabel?: string;
  slices: ChromiumPosterChartSlice[];
}

export interface ChromiumPosterCopy {
  kicker?: string;
  headline: string;
  deck?: string;
  stats?: ChromiumPosterStat[];
  chart?: ChromiumPosterChartData;
  sectionHeading?: string;
  points?: ChromiumPosterPoint[];
  closingLine?: string;
  banner?: string;
  callout?: string;
}

export interface ChromiumPosterBox {
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface ChromiumPosterComposeParams {
  canvasBuffer: Buffer;
  copy: ChromiumPosterCopy;
  zones: {
    headline?: ChromiumPosterBox;
    body?: ChromiumPosterBox;
    footer?: ChromiumPosterBox;
    textTone?: 'LIGHT' | 'DARK';
  };
  palette?: {
    accentHex?: string;
    secondaryHex?: string;
  };
  signature?: string;
  editionTag?: string;
  headerTag?: string;
  badgeTag?: string;
  textToneHint?: 'LIGHT' | 'DARK';
  archetype?: string;
  layoutVariant?: number;
  secondaryCanvasBuffers?: Buffer[];
}

export interface ChromiumPosterComposeResult {
  buffer: Buffer;
  sizeBytes: number;
  detectedLuminance: number;
  blendModeUsed: 'multiply' | 'normal';
  /** Peta elemen poster (kartu, badge, judul, paragraf) untuk Magic Layers. Null bila gagal diekstrak. */
  layoutManifest: PosterLayerManifest | null;
}

interface InfographicLayoutConfig {
  html: string;
  css: string;
}

function renderInfographicArchetypeLayout(params: {
  archetype?: string;
  layoutVariant?: number;
  copy: ChromiumPosterCopy;
  headlineText: string;
  primaryColor: string;
  accentColor: string;
  secondaryColor: string;
  isLightPaper: boolean;
  textShadow: string;
  currentYear: number;
  bgBase64?: string;
  photoSlots?: [string, string, string, string];
  signature?: string;
  editionTag?: string;
  headerTag?: string;
}): InfographicLayoutConfig {
  const extendedLayout = renderExtendedInfographicLayout(params);
  if (extendedLayout) {
    return extendedLayout;
  }

  const {
    archetype,
    copy,
    headlineText,
    primaryColor,
    accentColor,
    secondaryColor,
    isLightPaper,
    textShadow,
    currentYear,
    editionTag,
    headerTag,
  } = params;

  // Resolusi 4 Varian Tata Letak Dinamis per Arketipe (Layout Mutation Engine)
  // Menjamin setiap user dan setiap generate menghasilkan penempatan kartu yang bervariasi dan tidak identik
  const resolvedVariant = typeof params.layoutVariant === 'number'
    ? Math.abs(params.layoutVariant) % 4
    : (() => {
        let hash = 0;
        const seed = `${params.headlineText}:${params.copy.kicker || ''}:${params.copy.points?.[0]?.label || ''}`;
        for (let i = 0; i < seed.length; i++) {
          hash = ((hash << 5) - hash) + seed.charCodeAt(i);
          hash |= 0;
        }
        return Math.abs(hash) % 4;
      })();

  const points = copy.points || [];

  // Solid, 100% Opaque High-Contrast Editorial Surfaces (NO INVALID HEX, NO MUDDY BLUR)
  // Adaptif terhadap tema poster: Kertas Terang vs Kertas Gelap (Dark Mode)
  const isDarkSecondary = secondaryColor && isColorDark(secondaryColor);
  const darkCardBg = isDarkSecondary ? secondaryColor : '#0F172A';

  // Direct Editorial Ink Print (ZERO FLOATING CARDS: background transparent)
  const cardBgSolid = 'transparent';
  const headerBgSolid = 'transparent';
  const pillBgSolid = 'transparent';
  const borderRuleColor = isLightPaper ? `${accentColor}44` : `${accentColor}66`;

  // 100% Guaranteed High-Contrast Typography (Crisp and legible on any screen)
  const titleColor = isLightPaper ? '#0F172A' : '#FFFFFF';
  const bodyTextColor = isLightPaper ? '#1E293B' : '#F1F5F9';
  const deckTextColor = isLightPaper ? '#334155' : '#CBD5E1';
  const mutedTextColor = isLightPaper ? '#64748B' : '#94A3B8';
  const universalInkHalo = isLightPaper
    ? '0 1px 2px rgba(255,255,255,0.95), 0 0 10px rgba(255,255,255,0.88), 0 0 22px rgba(251,247,240,0.82)'
    : '0 2px 4px rgba(0,0,0,0.95), 0 0 12px rgba(0,0,0,0.88), 0 0 24px rgba(0,0,0,0.80)';

  // Helper KPI Stats Primer (4 Metrik Angka Kunci Kredibel)
  const defaultStatValues = ['15,2%', 'RP 1,2 T', '5 KOTA', '100%'];
  const defaultStatLabels = ['Rasio Indikator Kunci', 'Alokasi Pagu Anggaran', 'Wilayah Prioritas', 'Kepatuhan Pelaporan'];
  const statsList = (copy.stats && copy.stats.length >= 3) ? copy.stats : [
    {
      value: points[0]?.label.match(/(?:RP\s*[\d.,]+[BMK]?|[\d.,]+%|\d+\s*(?:KECAMATAN|TITIK|HARI|RUAS|DESA|RIBU|JT|M|KOTA))/i)?.[0] || points[0]?.label.split(' ').slice(0, 2).join(' ') || defaultStatValues[0],
      label: points[0]?.label.replace(/(?:RP\s*[\d.,]+[BMK]?|[\d.,]+%|\d+\s*(?:KECAMATAN|TITIK|HARI|RUAS|DESA|RIBU|JT|M|KOTA))/i, '').trim() || defaultStatLabels[0],
    },
    {
      value: points[1]?.label.match(/(?:RP\s*[\d.,]+[BMK]?|[\d.,]+%|\d+\s*(?:KECAMATAN|TITIK|HARI|RUAS|DESA|RIBU|JT|M|KOTA))/i)?.[0] || points[1]?.label.split(' ').slice(0, 2).join(' ') || defaultStatValues[1],
      label: points[1]?.label.replace(/(?:RP\s*[\d.,]+[BMK]?|[\d.,]+%|\d+\s*(?:KECAMATAN|TITIK|HARI|RUAS|DESA|RIBU|JT|M|KOTA))/i, '').trim() || defaultStatLabels[1],
    },
    {
      value: points[2]?.label.match(/(?:RP\s*[\d.,]+[BMK]?|[\d.,]+%|\d+\s*(?:KECAMATAN|TITIK|HARI|RUAS|DESA|RIBU|JT|M|KOTA))/i)?.[0] || points[2]?.label.split(' ').slice(0, 2).join(' ') || defaultStatValues[2],
      label: points[2]?.label.replace(/(?:RP\s*[\d.,]+[BMK]?|[\d.,]+%|\d+\s*(?:KECAMATAN|TITIK|HARI|RUAS|DESA|RIBU|JT|M|KOTA))/i, '').trim() || defaultStatLabels[2],
    },
    {
      value: points[3]?.label.match(/(?:RP\s*[\d.,]+[BMK]?|[\d.,]+%|\d+\s*(?:KECAMATAN|TITIK|HARI|RUAS|DESA|RIBU|JT|M|KOTA))/i)?.[0] || points[3]?.label.split(' ').slice(0, 2).join(' ') || defaultStatValues[3],
      label: points[3]?.label.replace(/(?:RP\s*[\d.,]+[BMK]?|[\d.,]+%|\d+\s*(?:KECAMATAN|TITIK|HARI|RUAS|DESA|RIBU|JT|M|KOTA))/i, '').trim() || defaultStatLabels[3],
    },
  ];

  if (archetype === 'INFOGRAPHIC_NARRATIVE_WAVE') {
    // =========================================================================
    // AUTHENTIC HUMANA NARRATIVE WAVE (SUKABUMI & PERTANIAN GOLD STANDARD)
    // 100% Sesuai Gambar Referensi Emas (media_1794280714361_bf7b797b.webp & template-01):
    // 1. Full-Bleed Vintage Newsprint Masthead: Kicker merah marun, Title tebal
    //    kondensasi Bebas Neue (58px) navy gelap (#0F172A), Deck 2-3 baris narasi utuh.
    // 2. Kiri Atas: Subjek foto kakek koran / dokumenter nyata menyatu di atas kertas krem.
    // 3. Kanan Atas: Ombak Merah Marun menaungi 2 Kolom Poin Hero (Poin 02 & 01)
    //    dengan badge emas (PROGRAM INTERVENSI & INDIKATOR KUNCI) dan tangan menjangkau di kanan.
    // 4. Sabuk Horizontal KPI Tengah: 4 Kolom metrik gelap transparan (KPI 01 s/d KPI 04)
    //    melintang rapi di tengah kanvas (Y=492px - 576px).
    // 5. Kiri Bawah: Kartu Kertas Krem (#F8F6F0) memuat Donut Chart 100% SVG (angka dominan
    //    di tengah + swatch warna) serta Poin 04 (Peningkatan Mutu/Fasilitas).
    // 6. Kanan Bawah: Ombak Merah mengalir menaungi 3 Kartu Marun Elegan (Poin 03, 05, 06)
    //    dengan badge emas (MEKANISME, AKUNTABILITAS, DAMPAK KEBIJAKAN).
    // 7. Pusat Montase: Gadis duduk dengan buket bunga dan montase kerumunan diagonal.
    // 8. Bawah: Closing callout pill biru dongker dan footer identitas resmi dewan.
    // =========================================================================

    // Load background canvas: prefer AI-generated canvas (params.bgBase64), fallback to master template if empty
    let masterCanvasBg = params.bgBase64 || '';
    if (!masterCanvasBg) {
      try {
        const searchDirs = [
          process.cwd(),
          path.resolve(process.cwd(), '..'),
          path.resolve(process.cwd(), '../..'),
          __dirname,
          path.resolve(__dirname, '..'),
          path.resolve(__dirname, '../../..'),
          path.resolve(__dirname, '../../../../..'),
        ];
        for (const dir of searchDirs) {
          const c1 = path.resolve(dir, 'uploads/references/infografis/template-01-clean-canvas.webp');
          if (fs.existsSync(c1)) {
            const buf = fs.readFileSync(c1);
            masterCanvasBg = `data:image/webp;base64,${buf.toString('base64')}`;
            break;
          }
          const c2 = path.resolve(dir, 'apps/web-dashboard/public/templates/infografis/template-01-clean-canvas.webp');
          if (fs.existsSync(c2)) {
            const buf = fs.readFileSync(c2);
            masterCanvasBg = `data:image/webp;base64,${buf.toString('base64')}`;
            break;
          }
        }
      } catch {
        // fallback
      }
    }

    const p1 = points[0] || { label: 'KONDISI INFRASTRUKTUR SAAT INI', text: 'Kondisi infrastruktur wilayah menunjukkan 60% kemantapan, dengan sejumlah ruas krusial memerlukan percepatan penanganan berkala demi kelancaran mobilitas warga.', badge: 'INDIKATOR KUNCI' };
    const p2 = points[1] || { label: 'WILAYAH PRIORITAS PENANGANAN', text: 'Penetapan sentra dan koridor prioritas difokuskan pada titik intervensi strategis guna menjamin konektivitas antarwilayah dan pemerataan distribusi sarana publik.', badge: 'PROGRAM INTERVENSI' };
    const p3 = points[2] || { label: 'MEKANISME PELAKSANAAN PROGRAM', text: 'Pelaksanaan program terpadu melibatkan kolaborasi lintas dinas teknis dan mitra pelaksana dengan jadwal pemeliharaan terukur dan pengawasan berkala.', badge: 'MEKANISME PELAKSANAAN' };
    const p4 = points[3] || { label: 'PENINGKATAN FASILITAS PUBLIK', text: 'Optimalisasi fasilitas penunjang diarahkan pada standar pemenuhan sarana yang aman, nyaman, serta mampu memangkas waktu tempuh mobilitas warga secara signifikan.', badge: 'TARGET PENURUNAN' };
    const p5 = points[4] || { label: 'TRANSPARANSI DATA PENERIMA MANFAAT', text: 'Pemutakhiran data capaian dan penerima manfaat dimonitor secara berkala melalui sistem advokasi terpadu untuk memastikan akuntabilitas anggaran tepat sasaran.', badge: 'AKUNTABILITAS' };
    const p6 = points[5] || { label: 'DAMPAK JANGKA PANJANG KEBIJAKAN', text: 'Dampak berkelanjutan kebijakan mencakup peningkatan stabilitas ekonomi lokal, efisiensi logistik, dan pemerataan kesejahteraan masyarakat daerah.', badge: 'DAMPAK KEBIJAKAN' };

    const rawCleanStats = (statsList.length > 0 ? statsList : [
      { value: '85%', label: 'Persentase Kemantapan' },
      { value: 'RP 150 M', label: 'Total Alokasi Anggaran' },
      { value: '200 KM', label: 'Ruas Jalur Ditangani' },
      { value: '> 300.000', label: 'Target Penerima Manfaat' },
    ]).slice(0, 4);

    const cleanStats = rawCleanStats.length >= 4 ? rawCleanStats : [
      { value: '85%', label: 'Persentase Kemantapan' },
      { value: 'RP 150 M', label: 'Total Alokasi Anggaran' },
      { value: '200 KM', label: 'Ruas Jalur Ditangani' },
      { value: '> 300.000', label: 'Target Penerima Manfaat' },
    ];

    const buildWaveDonutSvg = () => {
      const rawSlices = copy.chart?.slices;
      const slices = (
        Array.isArray(rawSlices) && rawSlices.length >= 3
          ? rawSlices.slice(0, 4)
          : [
              { label: 'PEMBANGUNAN UTAMA', percentage: 50 },
              { label: 'PERBAIKAN BERKALA', percentage: 30 },
              { label: 'PEMELIHARAAN RUTIN', percentage: 15 },
              { label: 'STUDI KELAYAKAN', percentage: 5 },
            ]
      );
      const chartTitle = (copy.chart?.title || 'PROPORSI ALOKASI ANGGARAN').replace(/\s*\(\s*100%\s*\)\s*/gi, '').trim();
      const colors = ['#1E293B', accentColor, '#D97706', '#0284C7'];

      let cumulative = 0;
      const svgCircles = slices.map((sl, idx) => {
        const pct = Math.max(2, Math.min(95, Number(sl.percentage) || 25));
        const offset = 25 - cumulative;
        cumulative += pct;
        const color = colors[idx % 4];
        return `<circle cx="21" cy="21" r="15.9154943" fill="transparent" stroke="${color}" stroke-width="7.5" stroke-dasharray="${pct} ${100 - pct}" stroke-dashoffset="${offset}" />`;
      }).join('');

      const dominantSlice = [...slices].sort(
        (a, b) => (Number(b.percentage) || 0) - (Number(a.percentage) || 0)
      )[0] || slices[0];
      const maxPct = copy.chart?.centerDominantNumber
        ? String(copy.chart.centerDominantNumber).replace(/%/g, '') + '%'
        : Math.round(Number(dominantSlice.percentage) || 0) + '%';

      const legendItems = slices.map((sl, idx) => {
        const color = colors[idx % 4];
        const pct = Math.round(Number(sl.percentage) || 0);
        return `
          <div style="display:flex;align-items:center;gap:6px;">
            <span style="display:inline-block;width:9px;height:9px;background:${color};border-radius:2px;flex-shrink:0;"></span>
            <span style="letter-spacing:0.2px;line-height:1.2;"><strong style="color:#0F172A;font-size:12px;">${pct}%</strong> <span style="font-size:11px;font-weight:700;color:#334155;">${esc(sl.label)}</span></span>
          </div>
        `;
      }).join('');

      return `
        <div class="wave-chart-block">
          <div style="font-family:'Bebas Neue',sans-serif;font-size:18px;line-height:1.15;letter-spacing:0.8px;color:#0F172A;text-transform:uppercase;margin-bottom:8px;border-bottom:1.5px solid #CBD5E1;padding-bottom:4px;display:flex;align-items:center;justify-content:space-between;">
            <span><span style="color:${accentColor};margin-right:4px;">✦</span> ${esc(chartTitle)}</span>
            <span style="font-size:10px;font-family:'Plus Jakarta Sans',sans-serif;font-weight:800;letter-spacing:0.8px;color:#64748B;">DISTRIBUSI DATA</span>
          </div>
          <div style="display:flex;align-items:center;gap:12px;">
            <div style="position:relative;width:116px;height:116px;flex-shrink:0;">
              <svg viewBox="0 0 42 42" width="116" height="116" style="display:block;filter:drop-shadow(0 2px 6px rgba(0,0,0,0.12));">
                <circle cx="21" cy="21" r="15.9154943" fill="transparent" stroke="rgba(148,163,184,0.22)" stroke-width="7.5" />
                ${svgCircles}
              </svg>
              <div style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center;text-align:center;">
                <span style="font-family:'Bebas Neue',sans-serif;font-size:32px;line-height:1;color:#0F172A;letter-spacing:0.5px;">${maxPct}</span>
              </div>
            </div>
            <div style="display:flex;flex-direction:column;gap:5px;font-weight:800;text-transform:uppercase;flex:1;min-width:0;">
              ${legendItems}
            </div>
          </div>
        </div>
      `;
    };

    // Komponen Visualisasi Data Dinamis: Berganti antara Donut Chart & Horizontal Progress Bars
    const buildWaveDataVisualization = () => {
      if (resolvedVariant % 3 === 1) {
        const rawSlices = copy.chart?.slices;
        const slices = (
          Array.isArray(rawSlices) && rawSlices.length >= 3
            ? rawSlices.slice(0, 4)
            : [
                { label: 'PEMBANGUNAN UTAMA', percentage: 50 },
                { label: 'PERBAIKAN BERKALA', percentage: 30 },
                { label: 'PEMELIHARAAN RUTIN', percentage: 15 },
                { label: 'STUDI KELAYAKAN', percentage: 5 },
              ]
        );
        const chartTitle = (copy.chart?.title || 'TARGET CAPAIAN & REALISASI KEBIJAKAN').replace(/\s*\(\s*100%\s*\)\s*/gi, '').trim();
        const colors = [accentColor, '#1E293B', '#D97706', '#0284C7'];

        const progressBars = slices.map((sl, idx) => {
          const pct = Math.max(5, Math.min(100, Number(sl.percentage) || 25));
          const color = colors[idx % 4];
          return `
            <div style="margin-bottom: 6px;">
              <div style="display:flex; justify-content:space-between; align-items:baseline; margin-bottom: 2px;">
                <span style="font-size: 11px; font-weight: 800; color: #1E293B; letter-spacing: 0.3px; text-transform: uppercase;">${esc(sl.label)}</span>
                <span style="font-family:'Bebas Neue',sans-serif; font-size: 16px; color: ${color}; font-weight: 900;">${pct}%</span>
              </div>
              <div style="width: 100%; height: 7px; background: rgba(203, 213, 225, 0.45); border-radius: 4px; overflow: hidden;">
                <div style="width: ${pct}%; height: 100%; background: ${color}; border-radius: 4px;"></div>
              </div>
            </div>
          `;
        }).join('');

        return `
          <div class="wave-chart-block">
            <div style="font-family:'Bebas Neue',sans-serif;font-size:18px;line-height:1.15;letter-spacing:0.8px;color:#0F172A;text-transform:uppercase;margin-bottom:8px;border-bottom:1.5px solid #CBD5E1;padding-bottom:4px;display:flex;align-items:center;justify-content:space-between;">
              <span><span style="color:${accentColor};margin-right:4px;">✦</span> ${esc(chartTitle)}</span>
              <span style="font-size:10px;font-family:'Plus Jakarta Sans',sans-serif;font-weight:800;letter-spacing:0.8px;color:#64748B;">TARGET</span>
            </div>
            ${progressBars}
          </div>
        `;
      }
      return buildWaveDonutSvg();
    };

    const css = `
      .edition-tag, .footer-zone {
        display: none !important;
      }
      .wave-broadsheet-container {
        position: absolute;
        top: 0;
        left: 0;
        width: 1080px;
        height: 1350px;
        background: #F8F6F0;
        font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        color: #1E293B;
        box-sizing: border-box;
        overflow: hidden;
        z-index: 10;
      }
      .master-canvas-bg {
        position: absolute;
        top: 0;
        left: 0;
        width: 1080px;
        height: 1350px;
        object-fit: cover;
        z-index: 1;
      }
      .paper-grain {
        position: absolute;
        top: 0; left: 0; width: 100%; height: 100%;
        opacity: 0.035;
        background-image: radial-gradient(#000 1px, transparent 1px);
        background-size: 8px 8px;
        pointer-events: none;
        z-index: 45;
      }
      .masthead-broadsheet-backing {
        position: absolute;
        top: 0;
        left: 0;
        width: 1080px;
        height: 202px;
        background: #F8F6F0;
        z-index: 15;
        border-bottom: 2px solid #0F172A;
      }
      .wave-topbar {
        position: absolute;
        top: 14px;
        left: 48px;
        right: 48px;
        display: flex;
        justify-content: space-between;
        align-items: center;
        font-size: 11px;
        font-weight: 800;
        letter-spacing: 1.5px;
        text-transform: uppercase;
        color: #475569;
        border-bottom: 1.5px solid rgba(15, 23, 42, 0.15);
        padding-bottom: 6px;
        z-index: 25;
      }
      .narrative-header {
        position: absolute;
        top: 46px;
        left: 48px;
        right: 48px;
        z-index: 25;
      }
      .narrative-kicker {
        font-size: 11px;
        font-weight: 900;
        letter-spacing: 1.8px;
        color: ${accentColor};
        text-transform: uppercase;
        margin-bottom: 4px;
        display: flex;
        align-items: center;
        gap: 8px;
      }
      .kicker-pill {
        background: ${accentColor};
        color: #FFFFFF;
        font-size: 9.5px;
        font-weight: 900;
        letter-spacing: 1px;
        padding: 2px 7px;
        border-radius: 2px;
      }
      .narrative-title {
        font-family: 'Bebas Neue', sans-serif;
        font-size: 52px;
        line-height: 0.94;
        letter-spacing: 0.8px;
        color: #0F172A;
        text-transform: uppercase;
        margin-bottom: 6px;
        text-wrap: balance;
      }
      .narrative-deck {
        font-size: 13px;
        font-weight: 600;
        line-height: 1.42;
        color: #334155;
        max-width: 960px;
      }
      .gold-badge {
        display: inline-block;
        background: #D97706;
        color: #FFFFFF;
        font-size: 10px;
        font-weight: 900;
        letter-spacing: 0.8px;
        text-transform: uppercase;
        padding: 3px 8px;
        border-radius: 3px;
        margin-bottom: 4px;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.25);
      }
      .frosted-badge {
        display: inline-block;
        background: rgba(255, 255, 255, 0.22);
        border: 1px solid rgba(255, 255, 255, 0.4);
        color: #FFFFFF;
        font-size: 10px;
        font-weight: 900;
        letter-spacing: 0.8px;
        text-transform: uppercase;
        padding: 3px 8px;
        border-radius: 3px;
        margin-bottom: 4px;
        backdrop-filter: blur(4px);
      }
      .amber-badge {
        display: inline-block;
        background: #B45309;
        color: #FFFFFF;
        font-size: 10px;
        font-weight: 900;
        letter-spacing: 0.8px;
        text-transform: uppercase;
        padding: 3px 8px;
        border-radius: 3px;
        margin-bottom: 4px;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.25);
      }
      .upper-right-zone {
        position: absolute;
        top: 236px;
        right: 32px;
        width: 580px;
        z-index: 20;
        display: grid;
        grid-template-columns: 1.05fr 0.95fr;
        gap: 18px;
      }
      .wave-pt-item {
        display: flex;
        flex-direction: column;
        gap: 3px;
        color: #FFFFFF;
        background: transparent !important;
        padding: 0 !important;
        border: none !important;
        box-shadow: none !important;
      }
      .wave-pt-head {
        font-size: 16.5px;
        font-weight: 900;
        letter-spacing: 0.4px;
        text-transform: uppercase;
        color: #FFFFFF;
        line-height: 1.25;
        text-shadow: 0 1px 3px rgba(0, 0, 0, 0.95), 0 2px 6px rgba(0, 0, 0, 0.85);
      }
      .wave-pt-head .pt-num {
        color: #FEF3C7;
        margin-right: 5px;
      }
      .wave-pt-body {
        font-size: 13.5px;
        line-height: 1.48;
        color: #FFFFFF;
        font-weight: 500;
        text-shadow: 0 1px 3px rgba(0, 0, 0, 0.95), 0 2px 6px rgba(0, 0, 0, 0.85);
      }
      .narrative-kpi-belt {
        position: absolute;
        top: 486px;
        left: 48px;
        right: 48px;
        height: 72px;
        z-index: 25;
        display: flex;
        background: rgba(15, 23, 42, 0.92);
        border-top: 2px solid #F59E0B;
        border-bottom: 1px solid rgba(255, 255, 255, 0.15);
        border-radius: 4px;
        padding: 2px 0;
        box-shadow: 0 4px 16px rgba(0, 0, 0, 0.22);
        backdrop-filter: blur(8px);
      }
      .kpi-belt-col {
        flex: 1;
        display: flex;
        flex-direction: column;
        align-items: flex-start;
        padding: 0 20px;
        border-right: 1px solid rgba(255, 255, 255, 0.15);
        justify-content: center;
      }
      .kpi-belt-col:last-child {
        border-right: none;
      }
      .kpi-belt-tag {
        font-size: 9px;
        font-weight: 900;
        letter-spacing: 1.2px;
        color: #FCD34D;
        text-transform: uppercase;
        margin-bottom: 1px;
      }
      .kpi-belt-num {
        font-family: 'Bebas Neue', sans-serif;
        font-size: 32px;
        line-height: 0.95;
        color: #FFFFFF;
        letter-spacing: 0.8px;
      }
      .kpi-belt-lbl {
        font-size: 9.5px;
        font-weight: 700;
        color: #CBD5E1;
        text-transform: capitalize;
        white-space: nowrap;
      }
      .lower-left-zone {
        position: absolute;
        top: 576px;
        left: 48px;
        width: 320px;
        height: 660px;
        z-index: 20;
        background: transparent !important;
        border: none !important;
        padding: 0 !important;
        box-shadow: none !important;
        display: flex;
        flex-direction: column;
        justify-content: flex-start;
        gap: 16px;
      }
      .paper-pt-item {
        display: flex;
        flex-direction: column;
        gap: 3px;
        border-left: 3px solid ${accentColor};
        padding-left: 10px;
        box-sizing: border-box;
        width: 100%;
      }
      .paper-kicker {
        font-size: 11px;
        font-weight: 800;
        letter-spacing: 1px;
        text-transform: uppercase;
      }
      .paper-pt-head {
        font-size: 16.5px;
        font-weight: 900;
        letter-spacing: 0.3px;
        text-transform: uppercase;
        color: #0F172A;
        line-height: 1.25;
      }
      .paper-pt-head .pt-num {
        margin-right: 4px;
      }
      .paper-pt-body {
        font-size: 13.5px;
        line-height: 1.48;
        color: #1E293B;
        font-weight: 500;
      }
      .lower-right-zone {
        position: absolute;
        top: 576px;
        right: 28px;
        width: 325px;
        height: 660px;
        z-index: 20;
        display: flex;
        flex-direction: column;
        justify-content: space-around;
      }
      .wave-footer-bar {
        position: absolute;
        top: 1262px;
        left: 48px;
        right: 48px;
        height: 54px;
        background: #0F172A;
        border-radius: 4px;
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 0 24px;
        color: #FFFFFF;
        z-index: 25;
      }
      .wfb-sig {
        font-family: 'Bebas Neue', sans-serif;
        font-size: 24px;
        letter-spacing: 1.2px;
        color: #FFFFFF;
      }
      .wfb-year {
        font-family: 'Bebas Neue', sans-serif;
        font-size: 20px;
        letter-spacing: 1.2px;
        color: #94A3B8;
      }
    `;

    const variantIndex = resolvedVariant % 3;
    let middleContentHtml = '';

    if (variantIndex === 0) {
      // =======================================================================
      // VARIAN 0: BALANCED BROADSHEET SPLIT (01-02 ATAS, 03-04 KIRI, 05-06 KANAN)
      // Kiri Bawah: Donut Chart SVG + Poin 03 & 04 (Direct Ink di atas Kertas Krem)
      // Kanan Bawah: Poin 05 & 06 (Direct White Ink di atas Ombak Berwarna)
      // ZERO DUPLICATE TEXT! ZERO WHITE CARDS! ZERO DEAD VOIDS!
      // =======================================================================
      middleContentHtml = `
        <!-- UPPER-RIGHT WAVE: POIN 01 & POIN 02 -->
        <div class="upper-right-zone">
          <div class="wave-pt-item" style="max-width: 285px;">
            <div><span class="gold-badge">${esc(p1.badge || 'INDIKATOR KUNCI')}</span></div>
            <div class="wave-pt-head"><span class="pt-num">01 •</span> ${esc(p1.label)}</div>
            <div class="wave-pt-body">${esc(p1.text)}</div>
          </div>
          <div class="wave-pt-item" style="max-width: 275px; padding-right: 10px;">
            <div><span class="gold-badge">${esc(p2.badge || 'PROGRAM INTERVENSI')}</span></div>
            <div class="wave-pt-head"><span class="pt-num">02 •</span> ${esc(p2.label)}</div>
            <div class="wave-pt-body">${esc(p2.text)}</div>
          </div>
        </div>

        <!-- MIDDLE HORIZONTAL KPI BELT (4 COLUMNS) -->
        <div class="narrative-kpi-belt">
          ${cleanStats.slice(0, 4).map((st, idx) => `
            <div class="kpi-belt-col">
              <span class="kpi-belt-tag">KPI 0${idx + 1}</span>
              <span class="kpi-belt-num">${esc(st.value)}</span>
              <span class="kpi-belt-lbl">${esc(st.label)}</span>
            </div>
          `).join('')}
        </div>

        <!-- LOWER-LEFT ZONE: DONUT CHART + POIN 03 & POIN 04 (DIRECT INK ON PAPER) -->
        <div class="lower-left-zone">
          ${buildWaveDonutSvg()}

          <!-- POIN 03 PADA KERTAS KREM -->
          <div class="paper-pt-item" style="border-left: 3px solid #2563EB;">
            <div class="paper-kicker" style="color: #2563EB;">${esc(p3.badge || 'MEKANISME PELAKSANAAN')}</div>
            <div class="paper-pt-head"><span class="pt-num" style="color: #2563EB;">03 •</span> ${esc(p3.label)}</div>
            <div class="paper-pt-body">${esc(p3.text)}</div>
          </div>

          <!-- POIN 04 PADA KERTAS KREM -->
          <div class="paper-pt-item" style="border-left: 3px solid #059669;">
            <div class="paper-kicker" style="color: #059669;">${esc(p4.badge || 'TARGET CAPAIAN')}</div>
            <div class="paper-pt-head"><span class="pt-num" style="color: #059669;">04 •</span> ${esc(p4.label)}</div>
            <div class="paper-pt-body">${esc(p4.text)}</div>
          </div>
        </div>

        <!-- LOWER-RIGHT ZONE: POIN 05 & POIN 06 (SPACIOUS HERO IMPACT POINTS DI KANAN) -->
        <div class="lower-right-zone">
          <div class="wave-pt-item" style="border-left: 3px solid rgba(255, 255, 255, 0.7); padding-left: 12px !important;">
            <div style="font-size: 11px; font-weight: 800; letter-spacing: 1px; color: #FCD34D; text-transform: uppercase;">${esc(p5.badge || 'AKUNTABILITAS')}</div>
            <div class="wave-pt-head" style="font-size: 17.5px; line-height: 1.25;"><span class="pt-num">05 •</span> ${esc(p5.label)}</div>
            <div class="wave-pt-body" style="font-size: 13.5px; line-height: 1.48;">${esc(p5.text)}</div>
          </div>

          <div class="wave-pt-item" style="border-left: 3px solid #F59E0B; padding-left: 12px !important;">
            <div style="font-size: 11px; font-weight: 800; letter-spacing: 1px; color: #FCD34D; text-transform: uppercase;">${esc(p6.badge || 'DAMPAK KEBIJAKAN')}</div>
            <div class="wave-pt-head" style="font-size: 17.5px; line-height: 1.25;"><span class="pt-num">06 •</span> ${esc(p6.label)}</div>
            <div class="wave-pt-body" style="font-size: 13.5px; line-height: 1.48;">${esc(p6.text)}</div>
          </div>
        </div>
      `;
    } else if (variantIndex === 1) {
      // =======================================================================
      // VARIAN 1: PROGRESS BARS EDITORIAL SPLIT (01-02 ATAS, 03-04 KIRI, 05-06 KANAN)
      // Kiri Bawah: Horizontal Progress Bars + Poin 03 & Poin 04 Berurutan Vertikal
      // Kanan Bawah: Poin 05 & Poin 06 Berurutan Vertikal di Ombak
      // =======================================================================
      middleContentHtml = `
        <!-- UPPER-RIGHT WAVE: POIN 01 & POIN 02 -->
        <div class="upper-right-zone">
          <div class="wave-pt-item" style="max-width: 285px;">
            <div><span class="gold-badge">${esc(p1.badge || 'INDIKATOR KUNCI')}</span></div>
            <div class="wave-pt-head"><span class="pt-num">01 •</span> ${esc(p1.label)}</div>
            <div class="wave-pt-body">${esc(p1.text)}</div>
          </div>
          <div class="wave-pt-item" style="max-width: 275px; padding-right: 10px;">
            <div><span class="gold-badge">${esc(p2.badge || 'PROGRAM INTERVENSI')}</span></div>
            <div class="wave-pt-head"><span class="pt-num">02 •</span> ${esc(p2.label)}</div>
            <div class="wave-pt-body">${esc(p2.text)}</div>
          </div>
        </div>

        <!-- MIDDLE HORIZONTAL KPI BELT (4 COLUMNS) -->
        <div class="narrative-kpi-belt">
          ${cleanStats.slice(0, 4).map((st, idx) => `
            <div class="kpi-belt-col">
              <span class="kpi-belt-tag">KPI 0${idx + 1}</span>
              <span class="kpi-belt-num">${esc(st.value)}</span>
              <span class="kpi-belt-lbl">${esc(st.label)}</span>
            </div>
          `).join('')}
        </div>

        <!-- LOWER-LEFT ZONE: PROGRESS BARS + POIN 03 & POIN 04 -->
        <div class="lower-left-zone">
          ${buildWaveDataVisualization()}

          <!-- POIN 03 PADA KERTAS KREM -->
          <div class="paper-pt-item" style="border-left: 3px solid #2563EB;">
            <div class="paper-kicker" style="color: #2563EB;">${esc(p3.badge || 'MEKANISME PELAKSANAAN')}</div>
            <div class="paper-pt-head"><span class="pt-num" style="color: #2563EB;">03 •</span> ${esc(p3.label)}</div>
            <div class="paper-pt-body">${esc(p3.text)}</div>
          </div>

          <!-- POIN 04 PADA KERTAS KREM -->
          <div class="paper-pt-item" style="border-left: 3px solid #059669;">
            <div class="paper-kicker" style="color: #059669;">${esc(p4.badge || 'TARGET CAPAIAN')}</div>
            <div class="paper-pt-head"><span class="pt-num" style="color: #059669;">04 •</span> ${esc(p4.label)}</div>
            <div class="paper-pt-body">${esc(p4.text)}</div>
          </div>
        </div>

        <!-- LOWER-RIGHT ZONE: POIN 05 & POIN 06 -->
        <div class="lower-right-zone">
          <div class="wave-pt-item" style="border-left: 3px solid rgba(255, 255, 255, 0.7); padding-left: 12px !important;">
            <div style="font-size: 11px; font-weight: 800; letter-spacing: 1px; color: #FCD34D; text-transform: uppercase;">${esc(p5.badge || 'AKUNTABILITAS')}</div>
            <div class="wave-pt-head" style="font-size: 17.5px; line-height: 1.25;"><span class="pt-num">05 •</span> ${esc(p5.label)}</div>
            <div class="wave-pt-body" style="font-size: 13.5px; line-height: 1.48;">${esc(p5.text)}</div>
          </div>

          <div class="wave-pt-item" style="border-left: 3px solid #F59E0B; padding-left: 12px !important;">
            <div style="font-size: 11px; font-weight: 800; letter-spacing: 1px; color: #FCD34D; text-transform: uppercase;">${esc(p6.badge || 'DAMPAK KEBIJAKAN')}</div>
            <div class="wave-pt-head" style="font-size: 17.5px; line-height: 1.25;"><span class="pt-num">06 •</span> ${esc(p6.label)}</div>
            <div class="wave-pt-body" style="font-size: 13.5px; line-height: 1.48;">${esc(p6.text)}</div>
          </div>
        </div>
      `;
    } else {
      // =======================================================================
      // VARIAN 2: COLUMNAR PROGRESSION (01 + CHART ATAS, 02-03-04 KIRI, 05-06 KANAN)
      // Atas Kanan: Poin 01 & Grafik Data Kompak Berdampingan
      // Kiri Bawah: Poin 02, 03, 04 Mengalir Vertikal Berurutan di Kertas Krem
      // Kanan Bawah: Poin 05, 06 Mengalir Vertikal Berurutan di Ombak
      // =======================================================================
      middleContentHtml = `
        <!-- UPPER-RIGHT RED WAVE: 01 & COMPACT DATA VISUALIZATION -->
        <div class="upper-right-zone" style="grid-template-columns: 1.05fr 0.95fr; gap: 14px;">
          <div class="wave-pt-item">
            <div><span class="gold-badge">${esc(p1.badge || 'INDIKATOR KUNCI')}</span></div>
            <div class="wave-pt-head"><span class="pt-num">01 •</span> ${esc(p1.label)}</div>
            <div class="wave-pt-body">${esc(p1.text)}</div>
          </div>
          <div style="max-width: 275px;">
            ${buildWaveDonutSvg()}
          </div>
        </div>

        <!-- MIDDLE HORIZONTAL KPI BELT (4 COLUMNS) -->
        <div class="narrative-kpi-belt">
          ${cleanStats.slice(0, 4).map((st, idx) => `
            <div class="kpi-belt-col">
              <span class="kpi-belt-tag">KPI 0${idx + 1}</span>
              <span class="kpi-belt-num">${esc(st.value)}</span>
              <span class="kpi-belt-lbl">${esc(st.label)}</span>
            </div>
          `).join('')}
        </div>

        <!-- LOWER-LEFT ZONE: POIN 02, 03, 04 (3 POIN BERURUTAN DI KIRI!) -->
        <div class="lower-left-zone" style="justify-content: space-around;">
          <div class="paper-pt-item" style="border-left: 3px solid #D97706;">
            <div class="paper-kicker" style="color: #D97706;">${esc(p2.badge || 'PROGRAM INTERVENSI')}</div>
            <div class="paper-pt-head"><span class="pt-num" style="color: #D97706;">02 •</span> ${esc(p2.label)}</div>
            <div class="paper-pt-body">${esc(p2.text)}</div>
          </div>

          <div class="paper-pt-item" style="border-left: 3px solid #2563EB;">
            <div class="paper-kicker" style="color: #2563EB;">${esc(p3.badge || 'MEKANISME PELAKSANAAN')}</div>
            <div class="paper-pt-head"><span class="pt-num" style="color: #2563EB;">03 •</span> ${esc(p3.label)}</div>
            <div class="paper-pt-body">${esc(p3.text)}</div>
          </div>

          <div class="paper-pt-item" style="border-left: 3px solid #059669;">
            <div class="paper-kicker" style="color: #059669;">${esc(p4.badge || 'TARGET CAPAIAN')}</div>
            <div class="paper-pt-head"><span class="pt-num" style="color: #059669;">04 •</span> ${esc(p4.label)}</div>
            <div class="paper-pt-body">${esc(p4.text)}</div>
          </div>
        </div>

        <!-- LOWER-RIGHT ZONE: POIN 05 & 06 (2 HERO IMPACT POINTS DI KANAN) -->
        <div class="lower-right-zone">
          <div class="wave-pt-item" style="border-left: 3px solid rgba(255, 255, 255, 0.7); padding-left: 12px !important;">
            <div style="font-size: 11px; font-weight: 800; letter-spacing: 1px; color: #FCD34D; text-transform: uppercase;">${esc(p5.badge || 'AKUNTABILITAS')}</div>
            <div class="wave-pt-head" style="font-size: 17.5px; line-height: 1.25;"><span class="pt-num">05 •</span> ${esc(p5.label)}</div>
            <div class="wave-pt-body" style="font-size: 13.5px; line-height: 1.48;">${esc(p5.text)}</div>
          </div>

          <div class="wave-pt-item" style="border-left: 3px solid #F59E0B; padding-left: 12px !important;">
            <div style="font-size: 11px; font-weight: 800; letter-spacing: 1px; color: #FCD34D; text-transform: uppercase;">${esc(p6.badge || 'DAMPAK KEBIJAKAN')}</div>
            <div class="wave-pt-head" style="font-size: 17.5px; line-height: 1.25;"><span class="pt-num">06 •</span> ${esc(p6.label)}</div>
            <div class="wave-pt-body" style="font-size: 13.5px; line-height: 1.48;">${esc(p6.text)}</div>
          </div>
        </div>
      `;
    }

    const html = `
      <div class="wave-broadsheet-container">
        ${masterCanvasBg ? `<img src="${masterCanvasBg}" class="master-canvas-bg" alt="" />` : ''}
        <div class="paper-grain"></div>
        <div class="masthead-broadsheet-backing"></div>

        <!-- TOP CLASSIFICATION BAR -->
        <div class="wave-topbar">
          <div>${esc(editionTag || 'POLARIS • DAPIL JABAR')}</div>
          <div>${esc(headerTag || 'DOKUMEN ADVOKASI PUBLIK')}</div>
        </div>

        <!-- TOP MASTHEAD -->
        <div class="narrative-header">
          <div class="narrative-kicker">
            <span class="kicker-pill">DATA ADVOKASI</span>
            <span>${esc(copy.kicker || 'DATA ADVOKASI KEBIJAKAN • ANALISIS PRIORITAS DAERAH')}</span>
          </div>
          <div class="narrative-title">${esc(headlineText)}</div>
          <div class="narrative-deck">
            ${esc(copy.deck || 'Komitmen advokasi anggaran dan pengawalan kebijakan berbasis transparansi dan akuntabilitas publik demi kesejahteraan masyarakat.')}
          </div>
        </div>

        ${middleContentHtml}

        <!-- SINGLE UNIFIED OFFICIAL FOOTER BAR -->
        <div class="wave-footer-bar">
          <div class="wfb-sig">${esc(params.signature || 'DR. JONANDA P. A. B • DPRD PROVINSI • DAPIL JABAR')}</div>
          <div class="wfb-year">${currentYear} // ${esc(headerTag || 'DOKUMEN ADVOKASI PUBLIK')}</div>
        </div>
      </div>
    `;

    return {
      css,
      html,
    };
  }
  if (archetype === 'INFOGRAPHIC_CHRONICLE_GRID') {
    // =========================================================================
    // AUTHENTIC SOEDIRMAN BROADSHEET CHRONICLE (template-02-biography-timeline-grid)
    // 100% Sesuai Gambar Referensi Emas:
    // 1. Full-Bleed Solid Broadsheet: Background kanvas solid krem newsprint (#F8F6F0),
    //    sama sekali ZERO CANVAS BACKGROUND LEAK di balik celah kartu.
    // 2. Real Photo Slots Injection: Semua 4-6 foto dokumenter dari photoSlots terpasang
    //    nyata ke dalam frame foto bertag <img> (ZERO EMPTY ORANGE BOXES).
    // 3. Kolom Kiri Ikonik Soedirman (Solid Orange Pillar #EA580C + Krim Bawah):
    //    - Atas: Tipografi judul raksasa bertumpuk, kicker, FOTO POTRET UTAMA (rPhoto0),
    //      dan 2 KPI hero tepat di bawah foto.
    //    - Bawah: Header hijau tua, 4 poin latar belakang dengan bullet kotak oranye,
    //      FOTO ARSIP SUDUT BAWAH (rPhoto1), kutipan komitmen, dan identitas resmi dewan.
    // 4. Kolom Kanan Modular Chronicle Cards (5-Row Stack Mengisi Penuh 1290px):
    //    - Card 1: Header hijau (#15803D), Poin 01-02, dan FOTO DOKUMENTER 1 (rPhoto2).
    //    - Card 2: Header oranye (#EA580C), DONUT CHART 100% proporsi alokasi anggaran.
    //    - Card 3: Header hijau (#15803D), FOTO DOKUMENTER 2 (rPhoto3), dan Poin 03-04.
    //    - Card 4: Header oranye (#EA580C), Poin 05-06, dan FOTO DOKUMENTER 3 (rPhoto1).
    //    - Card 5: Dual split bottom cards (Target Kemantapan & Akuntabilitas Berstempel).
    // =========================================================================

    const variantIndex = resolvedVariant; // 0, 1, 2, 3
    const signature = params.signature || 'DR. JONANDA P. A. B • DPRD PROVINSI • DAPIL JABAR';

    const fallbackPhoto = params.bgBase64 || '';
    const [rPhoto0, rPhoto1, rPhoto2, rPhoto3] = params.photoSlots || [
      fallbackPhoto,
      fallbackPhoto,
      fallbackPhoto,
      fallbackPhoto,
    ];

    // Deduplikasi & penyiapan 4 KPI unik
    const cleanStats: Array<{ value: string; label: string }> = [];
    const seenStatValues = new Set<string>();
    for (const st of statsList) {
      const valKey = String(st.value || '').toUpperCase().replace(/\s+/g, '');
      if (valKey && !seenStatValues.has(valKey)) {
        seenStatValues.add(valKey);
        cleanStats.push({
          value: String(st.value || '').trim(),
          label: String(st.label || '').trim(),
        });
      }
    }
    const defaultStats = [
      { value: '85%', label: 'KEMANTAPAN JALUR' },
      { value: 'RP 380 M', label: 'ALOKASI PENANGANAN' },
      { value: '47 WILAYAH', label: 'CAKUPAN KECAMATAN' },
      { value: '218 KM', label: 'REKONSTRUKSI JALUR' },
    ];
    while (cleanStats.length < 4) {
      cleanStats.push(defaultStats[cleanStats.length]!);
    }

    // Split headline words for iconic stacked title (like SOE / DIR / MAN)
    const words = headlineText.split(/\s+/).filter(Boolean);
    let stackedWords: string[] = [];
    if (words.length >= 3) {
      stackedWords = words.slice(0, 3);
    } else if (words.length === 2) {
      stackedWords = [words[0], words[1]];
    } else {
      stackedWords = [headlineText];
    }
    const stackedTitleHtml = stackedWords
      .map((w) => `<div class="soedirman-stacked-word">${esc(w)}</div>`)
      .join('');

    // Safe bullet renderer
    const renderChroniclePoint = (pt: ChromiumPosterPoint, numBadge: string, bulletColor = '#15803D') => `
      <div class="cgrid-point-item" style="border-left-color: ${bulletColor};">
        <div class="cgrid-point-header">
          <span class="cgrid-num-badge" style="background: ${bulletColor};">${numBadge}</span>
          <span class="cgrid-point-title">${esc(pt.label)}</span>
        </div>
        <div class="cgrid-point-desc">${esc(pt.text)}</div>
      </div>
    `;

    // Render Framed Real Image
    const renderFramedPhoto = (imgSrc: string, captionTag: string, widthPx: number, heightPx: number, tagBg = '#EA580C') => `
      <div class="cgrid-photo-frame" style="width: ${widthPx}px; height: ${heightPx}px;">
        <div class="cgrid-photo-tag" style="background: ${tagBg};">${captionTag}</div>
        <img src="${imgSrc}" class="cgrid-photo-img" alt="" />
      </div>
    `;

    let html = '';

    if (variantIndex === 0) {
      // =======================================================================
      // VARIAN 0: CLASSIC LEFT SOEDIRMAN (ORANGE PILLAR LEFT, 5-CARD GRID RIGHT)
      // =======================================================================
      html = `
        <div class="cgrid-broadsheet-container">
          <!-- Top Classification Bar -->
          <div class="cgrid-topbar">
            <div class="cgt-left">${esc(params.signature ? params.signature.split('•')[0] : 'POLARIS')} • DAPIL JABAR</div>
            <div class="cgt-right">DOKUMEN ADVOKASI PUBLIK • EDISI KHUSUS ${currentYear}</div>
          </div>

          <!-- SISI KIRI: KOLOM IKONIK SOEDIRMAN (330px, left: 20px, height: 1290px) -->
          <div class="cgrid-left-pillar" style="left: 20px; width: 330px; height: 1290px;">
            <!-- Seksi Oranye Atas (550px) -->
            <div class="clp-orange-block" style="height: 550px;">
              <div class="clp-stacked-headline">
                ${stackedTitleHtml}
              </div>
              <div class="clp-deck">
                ${esc(copy.deck || headlineText)}
              </div>

              <!-- FOTO POTRET UTAMA (REAL IMAGE rPhoto0) -->
              ${renderFramedPhoto(rPhoto0, '✦ DOKUMENTASI UTAMA', 296, 210, '#15803D')}

              <!-- 2 Hero Key Metrics tepat di bawah foto -->
              <div class="clp-kpi-row" style="margin-top: 10px;">
                <div class="clp-kpi-box-orange">
                  <div class="ckb-val-white">${esc(cleanStats[0]?.value)}</div>
                  <div class="ckb-lbl-white">${esc(cleanStats[0]?.label)}</div>
                </div>
                <div class="clp-kpi-box-orange">
                  <div class="ckb-val-white">${esc(cleanStats[1]?.value)}</div>
                  <div class="ckb-lbl-white">${esc(cleanStats[1]?.label)}</div>
                </div>
              </div>
            </div>

            <!-- Seksi Latar Belakang & Foto Arsip Bawah (740px) -->
            <div class="clp-cream-block" style="height: 740px;">
              <div class="clp-subhead-green">
                <span>✦</span> ${esc(copy.kicker || 'LATAR BELAKANG & DATA DASAR')}
              </div>

              <!-- 4 Poin Padat dengan Bullet Kotak Oranye Sesuai Referensi Soedirman -->
              <div class="clp-facts-list">
                <div class="clp-fact-item">
                  <span class="clp-bullet">■</span>
                  <div class="clp-fact-text">${esc(points[0]?.text ? points[0].text.slice(0, 110) + '...' : 'Identifikasi komprehensif terhadap degradasi jalan logistik di koridor selatan.')}</div>
                </div>
                <div class="clp-fact-item">
                  <span class="clp-bullet">■</span>
                  <div class="clp-fact-text">Cakupan sasaran mencakup <strong>${esc(cleanStats[2]?.value)}</strong> (${esc(cleanStats[2]?.label)}) dengan target <strong>${esc(cleanStats[3]?.value)}</strong>.</div>
                </div>
                <div class="clp-fact-item">
                  <span class="clp-bullet">■</span>
                  <div class="clp-fact-text">Alokasi anggaran terpadu sebesar <strong>${esc(cleanStats[1]?.value)}</strong> guna menjamin pemulihan konektivitas warga secara berkelanjutan.</div>
                </div>
                <div class="clp-fact-item">
                  <span class="clp-bullet">■</span>
                  <div class="clp-fact-text">Target indeks kemantapan jalur ditargetkan menembus <strong>${esc(cleanStats[0]?.value)}</strong> pada akhir tahun anggaran berjalan.</div>
                </div>
              </div>

              <!-- FOTO ARSIP SUDUT BAWAH (REAL IMAGE rPhoto1) -->
              <div style="margin-top: 10px;">
                ${renderFramedPhoto(rPhoto1, '■ ARSIP LAPANGAN DAERAH', 296, 175, '#EA580C')}
              </div>

              <!-- Kutipan Penutup Kolom Kiri -->
              <div class="clp-pillar-quote" style="margin-top: 10px;">
                ${esc(copy.closingLine ? copy.closingLine.slice(0, 110) + '...' : 'Komitmen transparansi penanganan infrastruktur berkelanjutan bagi kemaslahatan warga.')}
              </div>

              <!-- Tanda Tangan & Stempel Resmi Dewan -->
              <div class="clp-sig-box" style="margin-top: 10px;">
                <div class="csb-name">${esc(signature.split('•')[0] || signature)}</div>
                <div class="csb-sub">${esc(signature.split('•').slice(1).join('•') || 'DPRD PROVINSI')} • ${currentYear}</div>
              </div>
            </div>
          </div>

          <!-- SISI KANAN: 5 MODULAR CHRONICLE CARDS (694px, left: 366px, PADAT 1290px) -->
          <div class="cgrid-right-col" style="left: 366px; width: 694px; height: 1290px; display: flex; flex-direction: column; gap: 12px;">
            <!-- CARD 1: Tinjauan Lapangan (Header Hijau) - Height: 225px -->
            <div class="cgrid-card card-green" style="height: 225px; box-sizing: border-box;">
              <div class="cg-header green">
                <span class="cgh-title">✦ 01. TINJAUAN LAPANGAN &amp; KORIDOR PRIORITAS</span>
                <span class="cgh-badge">${esc(cleanStats[2]?.value)}</span>
              </div>
              <div class="cg-body row-split" style="padding: 12px 14px; gap: 14px;">
                <div class="cg-points-col" style="flex: 1.3;">
                  ${renderChroniclePoint(points[1] || { label: 'ZONA PRIORITAS INTERVENSI', text: 'Penetapan wilayah penanganan difokuskan pada koridor logistik utama warga antardesa.' }, '01', '#15803D')}
                  ${renderChroniclePoint(points[2] || { label: 'INTEGRASI REHABILITASI TEKNIS', text: 'Standarisasi spesifikasi material agar konstruksi beton berdaya tahan tinggi dan tahan banjir.' }, '02', '#15803D')}
                </div>
                <div class="cg-photo-col" style="flex: 0.9;">
                  ${renderFramedPhoto(rPhoto2, 'LOKASI PRIORITAS', 255, 160, '#EA580C')}
                </div>
              </div>
            </div>

            <!-- CARD 2: Proporsi Alokasi Anggaran (Header Oranye) - EXACTLY ONE DONUT CHART - Height: 245px -->
            <div class="cgrid-card card-orange" style="height: 245px; box-sizing: border-box;">
              <div class="cg-header orange">
                <span class="cgh-title">✦ PROPORSI ALOKASI ANGGARAN &amp; PROGRAM INFRASTRUKTUR (100%)</span>
                <span class="cgh-badge">DISTRIBUSI</span>
              </div>
              <div class="cg-body chart-body" style="padding: 10px 14px; height: 195px; box-sizing: border-box;">
                ${buildEditorialPieChartHtml({
                  copy,
                  accentColor: '#EA580C',
                  titleColor: '#0F172A',
                  bodyColor: '#334155',
                  halo: universalInkHalo,
                })}
              </div>
            </div>

            <!-- CARD 3: Pengawasan Mutu & Akselerasi (Header Hijau) - Height: 225px -->
            <div class="cgrid-card card-green" style="height: 225px; box-sizing: border-box;">
              <div class="cg-header green">
                <span class="cgh-title">✦ 02. AKSELERASI PENANGANAN &amp; PENGAWASAN MUTU</span>
                <span class="cgh-badge">${esc(cleanStats[3]?.value)}</span>
              </div>
              <div class="cg-body row-split" style="padding: 12px 14px; gap: 14px;">
                <div class="cg-photo-col" style="flex: 0.9;">
                  ${renderFramedPhoto(rPhoto3, 'PENGAWASAN MUTU', 255, 160, '#15803D')}
                </div>
                <div class="cg-points-col" style="flex: 1.3;">
                  ${renderChroniclePoint(points[3] || { label: 'PENEGAKAN STANDAR BEBAN', text: 'Pengawasan tonase kendaraan berat guna melindungi usia pakai konstruksi jalan baru.' }, '03', '#15803D')}
                  ${renderChroniclePoint(points[4] || { label: 'AUDIT BERKALA & POS ADUAN', text: 'Kanal pengaduan warga dibuka langsung untuk memantau ketepatan mutu pengerjaan fisik.' }, '04', '#15803D')}
                </div>
              </div>
            </div>

            <!-- CARD 4: Dampak & Keberlanjutan Konektivitas (Header Oranye) - Height: 225px -->
            <div class="cgrid-card card-orange" style="height: 225px; box-sizing: border-box;">
              <div class="cg-header orange">
                <span class="cgh-title">✦ 03. PEMULIHAN KONEKTIVITAS &amp; DAMPAK EKONOMI</span>
                <span class="cgh-badge">MANFAAT</span>
              </div>
              <div class="cg-body row-split" style="padding: 12px 14px; gap: 14px;">
                <div class="cg-points-col" style="flex: 1.3;">
                  ${renderChroniclePoint(points[5] || { label: 'EFISIENSI WAKTU TEMPUH', text: 'Preservasi jalur memangkas biaya angkut logistik hingga 40% dan membuka akses pasar warga.' }, '05', '#EA580C')}
                  ${renderChroniclePoint({ label: 'STABILISASI DISTRIBUSI PANGAN', text: 'Kelancaran akses menjamin pasokan komoditas pertanian dan sembako ke pelosok tetap aman.' }, '06', '#EA580C')}
                </div>
                <div class="cg-photo-col" style="flex: 0.9;">
                  ${renderFramedPhoto(rPhoto1, 'DAMPAK WARGA', 255, 160, '#EA580C')}
                </div>
              </div>
            </div>

            <!-- CARD 5: Dual Split Bottom Cards (Evaluasi & Komitmen Berstempel) - Height: 335px -->
            <div class="cgrid-bottom-dual" style="height: 335px; display: flex; gap: 12px;">
              <!-- Sub-card Kiri: Evaluasi Dampak (341px) -->
              <div class="cgrid-card card-green" style="flex: 1; height: 335px; box-sizing: border-box;">
                <div class="cg-header green">
                  <span class="cgh-title">✦ 04. TARGET KEMANTAPAN 2026</span>
                  <span class="cgh-badge">${esc(cleanStats[0]?.value)}</span>
                </div>
                <div class="cg-body" style="padding: 12px 14px; display: flex; flex-direction: column; justify-content: space-between; height: 285px; box-sizing: border-box;">
                  ${renderFramedPhoto(rPhoto0, 'KEMANTAPAN HASIL', 310, 145, '#15803D')}
                  <div style="margin-top: 8px;">
                    ${renderChroniclePoint({ label: 'STANDAR INDEKS JALUR', text: 'Pencapaian target indeks kemantapan ditopang evaluasi berkala lintas instansi teknis terkait.' }, '07', '#15803D')}
                  </div>
                </div>
              </div>

              <!-- Sub-card Kanan: Komitmen Advokasi & Stempel Resmi (341px) -->
              <div class="cgrid-card card-orange" style="flex: 1; height: 335px; box-sizing: border-box;">
                <div class="cg-header orange">
                  <span class="cgh-title">✦ 05. AKUNTABILITAS RESMI</span>
                  <span class="cgh-badge">DEWAN</span>
                </div>
                <div class="cg-body" style="padding: 12px 14px; display: flex; flex-direction: column; justify-content: space-between; height: 285px; box-sizing: border-box;">
                  ${renderFramedPhoto(rPhoto2, 'PENGAWALAN DEWAN', 310, 145, '#EA580C')}
                  <div class="cgb-quote" style="margin-top: 8px; font-size: 10.5px; line-height: 1.35; color: #334155;">
                    "${esc(copy.closingLine || 'Transparansi pengawasan anggaran dan partisipasi warga adalah fondasi utama infrastruktur bermutu.')}"
                  </div>
                  <div class="cgb-seal" style="background: #0F172A; color: #FFFFFF; font-size: 9px; font-weight: 800; padding: 6px 10px; border-radius: 4px; text-align: center; letter-spacing: 0.8px;">
                    VERIFIKASI RESMI • DOKUMEN PUBLIK ${currentYear}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      `;
    } else if (variantIndex === 1) {
      // =======================================================================
      // VARIAN 1: MIRROR RIGHT SOEDIRMAN (5-CARD GRID LEFT, ORANGE PILLAR RIGHT)
      // =======================================================================
      html = `
        <div class="cgrid-broadsheet-container">
          <div class="cgrid-topbar">
            <div class="cgt-left">${esc(params.signature ? params.signature.split('•')[0] : 'POLARIS')} • DAPIL JABAR</div>
            <div class="cgt-right">DOKUMEN ADVOKASI PUBLIK • EDISI KHUSUS ${currentYear}</div>
          </div>

          <!-- SISI KIRI: 5 MODULAR CHRONICLE CARDS GRID (694px, left: 20px, height: 1290px) -->
          <div class="cgrid-right-col" style="left: 20px; width: 694px; height: 1290px; display: flex; flex-direction: column; gap: 12px;">
            <!-- CARD 1: Tinjauan Lapangan (Header Hijau) -->
            <div class="cgrid-card card-green" style="height: 225px; box-sizing: border-box;">
              <div class="cg-header green">
                <span class="cgh-title">✦ 01. TINJAUAN LAPANGAN &amp; CAKUPAN SASARAN</span>
                <span class="cgh-badge">${esc(cleanStats[2]?.value)}</span>
              </div>
              <div class="cg-body row-split" style="padding: 12px 14px; gap: 14px;">
                <div class="cg-photo-col" style="flex: 0.9;">
                  ${renderFramedPhoto(rPhoto2, 'TINJAUAN LOKASI', 255, 160, '#EA580C')}
                </div>
                <div class="cg-points-col" style="flex: 1.3;">
                  ${renderChroniclePoint(points[1] || { label: 'ZONA PRIORITAS INTERVENSI', text: 'Penetapan wilayah penanganan difokuskan pada koridor logistik utama warga antardesa.' }, '01', '#15803D')}
                  ${renderChroniclePoint(points[2] || { label: 'INTEGRASI REHABILITASI TEKNIS', text: 'Standarisasi spesifikasi material agar konstruksi berdaya tahan tinggi dan tahan cuaca ekstrem.' }, '02', '#15803D')}
                </div>
              </div>
            </div>

            <!-- CARD 2: Proporsi Alokasi Anggaran (Header Oranye) - EXACTLY ONE DONUT CHART -->
            <div class="cgrid-card card-orange" style="height: 245px; box-sizing: border-box;">
              <div class="cg-header orange">
                <span class="cgh-title">✦ PROPORSI ALOKASI ANGGARAN &amp; PROGRAM (100%)</span>
                <span class="cgh-badge">DISTRIBUSI</span>
              </div>
              <div class="cg-body chart-body" style="padding: 10px 14px; height: 195px; box-sizing: border-box;">
                ${buildEditorialPieChartHtml({
                  copy,
                  accentColor: '#EA580C',
                  titleColor: '#0F172A',
                  bodyColor: '#334155',
                  halo: universalInkHalo,
                })}
              </div>
            </div>

            <!-- CARD 3: Pengawasan Mutu & Akselerasi (Header Hijau) -->
            <div class="cgrid-card card-green" style="height: 225px; box-sizing: border-box;">
              <div class="cg-header green">
                <span class="cgh-title">✦ 02. AKSELERASI PENANGANAN &amp; PENGAWASAN MUTU</span>
                <span class="cgh-badge">${esc(cleanStats[3]?.value)}</span>
              </div>
              <div class="cg-body row-split" style="padding: 12px 14px; gap: 14px;">
                <div class="cg-points-col" style="flex: 1.3;">
                  ${renderChroniclePoint(points[3] || { label: 'PENEGAKAN STANDAR BEBAN', text: 'Pengawasan tonase kendaraan berat guna melindungi usia pakai konstruksi jalan baru.' }, '03', '#15803D')}
                  ${renderChroniclePoint(points[4] || { label: 'AUDIT BERKALA & POS ADUAN', text: 'Kanal pengaduan warga dibuka untuk memastikan ketepatan progres fisik secara transparan.' }, '04', '#15803D')}
                </div>
                <div class="cg-photo-col" style="flex: 0.9;">
                  ${renderFramedPhoto(rPhoto3, 'PENGAWASAN MUTU', 255, 160, '#15803D')}
                </div>
              </div>
            </div>

            <!-- CARD 4: Dampak & Keberlanjutan Konektivitas (Header Oranye) -->
            <div class="cgrid-card card-orange" style="height: 225px; box-sizing: border-box;">
              <div class="cg-header orange">
                <span class="cgh-title">✦ 03. PEMULIHAN KONEKTIVITAS &amp; DAMPAK EKONOMI</span>
                <span class="cgh-badge">MANFAAT</span>
              </div>
              <div class="cg-body row-split" style="padding: 12px 14px; gap: 14px;">
                <div class="cg-photo-col" style="flex: 0.9;">
                  ${renderFramedPhoto(rPhoto1, 'DAMPAK WARGA', 255, 160, '#EA580C')}
                </div>
                <div class="cg-points-col" style="flex: 1.3;">
                  ${renderChroniclePoint(points[5] || { label: 'EFISIENSI WAKTU TEMPUH', text: 'Preservasi jalur memangkas biaya angkut logistik dan membuka keterisolasian ekonomi warga.' }, '05', '#EA580C')}
                  ${renderChroniclePoint({ label: 'STABILISASI DISTRIBUSI PANGAN', text: 'Kelancaran jalur memastikan pasokan bahan pokok antardesa tetap terjangkau dan stabil.' }, '06', '#EA580C')}
                </div>
              </div>
            </div>

            <!-- CARD 5: Dual Split Bottom Cards (Evaluasi & Komitmen Berstempel) -->
            <div class="cgrid-bottom-dual" style="height: 335px; display: flex; gap: 12px;">
              <!-- Sub-card Kiri -->
              <div class="cgrid-card card-green" style="flex: 1; height: 335px; box-sizing: border-box;">
                <div class="cg-header green">
                  <span class="cgh-title">✦ 04. TARGET KEMANTAPAN 2026</span>
                  <span class="cgh-badge">${esc(cleanStats[0]?.value)}</span>
                </div>
                <div class="cg-body" style="padding: 12px 14px; display: flex; flex-direction: column; justify-content: space-between; height: 285px; box-sizing: border-box;">
                  ${renderFramedPhoto(rPhoto0, 'KEMANTAPAN HASIL', 310, 145, '#15803D')}
                  <div style="margin-top: 8px;">
                    ${renderChroniclePoint({ label: 'STANDAR INDEKS JALUR', text: 'Pencapaian target indeks kemantapan ditopang evaluasi berkala lintas instansi teknis terkait.' }, '07', '#15803D')}
                  </div>
                </div>
              </div>

              <!-- Sub-card Kanan -->
              <div class="cgrid-card card-orange" style="flex: 1; height: 335px; box-sizing: border-box;">
                <div class="cg-header orange">
                  <span class="cgh-title">✦ 05. AKUNTABILITAS RESMI</span>
                  <span class="cgh-badge">DEWAN</span>
                </div>
                <div class="cg-body" style="padding: 12px 14px; display: flex; flex-direction: column; justify-content: space-between; height: 285px; box-sizing: border-box;">
                  ${renderFramedPhoto(rPhoto2, 'PENGAWALAN DEWAN', 310, 145, '#EA580C')}
                  <div class="cgb-quote" style="margin-top: 8px; font-size: 10.5px; line-height: 1.35; color: #334155;">
                    "${esc(copy.closingLine || 'Transparansi pengawasan anggaran dan partisipasi warga adalah fondasi utama infrastruktur bermutu.')}"
                  </div>
                  <div class="cgb-seal" style="background: #0F172A; color: #FFFFFF; font-size: 9px; font-weight: 800; padding: 6px 10px; border-radius: 4px; text-align: center; letter-spacing: 0.8px;">
                    VERIFIKASI RESMI • DOKUMEN PUBLIK ${currentYear}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- SISI KANAN: KOLOM IKONIK SOEDIRMAN (330px, left: 726px, height: 1290px) -->
          <div class="cgrid-left-pillar" style="left: 726px; width: 330px; height: 1290px;">
            <!-- Seksi Oranye Atas (550px) -->
            <div class="clp-orange-block" style="height: 550px;">
              <div class="clp-stacked-headline">
                ${stackedTitleHtml}
              </div>
              <div class="clp-deck">
                ${esc(copy.deck || headlineText)}
              </div>

              <!-- FOTO POTRET UTAMA (REAL IMAGE rPhoto0) -->
              ${renderFramedPhoto(rPhoto0, '✦ DOKUMENTASI UTAMA', 296, 210, '#15803D')}

              <!-- 2 Hero Key Metrics -->
              <div class="clp-kpi-row" style="margin-top: 10px;">
                <div class="clp-kpi-box-orange">
                  <div class="ckb-val-white">${esc(cleanStats[0]?.value)}</div>
                  <div class="ckb-lbl-white">${esc(cleanStats[0]?.label)}</div>
                </div>
                <div class="clp-kpi-box-orange">
                  <div class="ckb-val-white">${esc(cleanStats[1]?.value)}</div>
                  <div class="ckb-lbl-white">${esc(cleanStats[1]?.label)}</div>
                </div>
              </div>
            </div>

            <!-- Seksi Krim Bawah (740px) -->
            <div class="clp-cream-block" style="height: 740px;">
              <div class="clp-subhead-green">
                <span>✦</span> ${esc(copy.kicker || 'LATAR BELAKANG & DATA DASAR')}
              </div>

              <div class="clp-facts-list">
                <div class="clp-fact-item">
                  <span class="clp-bullet">■</span>
                  <div class="clp-fact-text">${esc(points[0]?.text ? points[0].text.slice(0, 110) + '...' : 'Identifikasi menyeluruh terhadap kondisi jalur logistik warga.')}</div>
                </div>
                <div class="clp-fact-item">
                  <span class="clp-bullet">■</span>
                  <div class="clp-fact-text">Cakupan sasaran mencakup <strong>${esc(cleanStats[2]?.value)}</strong> (${esc(cleanStats[2]?.label)}) dengan target <strong>${esc(cleanStats[3]?.value)}</strong>.</div>
                </div>
                <div class="clp-fact-item">
                  <span class="clp-bullet">■</span>
                  <div class="clp-fact-text">Alokasi anggaran daerah sebesar <strong>${esc(cleanStats[1]?.value)}</strong> guna percepatan rekonstruksi.</div>
                </div>
                <div class="clp-fact-item">
                  <span class="clp-bullet">■</span>
                  <div class="clp-fact-text">Target indeks kemantapan jalur ditargetkan menembus <strong>${esc(cleanStats[0]?.value)}</strong> pada akhir tahun anggaran berjalan.</div>
                </div>
              </div>

              <div style="margin-top: 10px;">
                ${renderFramedPhoto(rPhoto1, '■ ARSIP LAPANGAN DAERAH', 296, 175, '#EA580C')}
              </div>

              <div class="clp-pillar-quote" style="margin-top: 10px;">
                ${esc(copy.closingLine ? copy.closingLine.slice(0, 110) + '...' : 'Komitmen transparansi penanganan infrastruktur berkelanjutan bagi kemaslahatan warga.')}
              </div>

              <div class="clp-sig-box" style="margin-top: 10px;">
                <div class="csb-name">${esc(signature.split('•')[0] || signature)}</div>
                <div class="csb-sub">${esc(signature.split('•').slice(1).join('•') || 'DPRD PROVINSI')} • ${currentYear}</div>
              </div>
            </div>
          </div>
        </div>
      `;
    } else if (variantIndex === 2) {
      // =======================================================================
      // VARIAN 2: TOP HERO BANNER + DONUT BAR + 2x2 DENSE CARDS GRID (PADAT 1290PX)
      // =======================================================================
      html = `
        <div class="cgrid-broadsheet-container">
          <div class="cgrid-topbar">
            <div class="cgt-left">${esc(params.signature ? params.signature.split('•')[0] : 'POLARIS')} • DAPIL JABAR</div>
            <div class="cgt-right">DOKUMEN ADVOKASI PUBLIK • EDISI KHUSUS ${currentYear}</div>
          </div>

          <!-- Top Hero Broadside Banner (1040 x 250px, top: 38px) -->
          <div class="cgrid-top-hero" style="left: 20px; top: 38px; width: 1040px; height: 250px;">
            <div class="cth-left" style="flex: 1.4;">
              <div class="cth-kicker">✦ KRONIK ADVOKASI DAERAH • DATA BINA MARGA</div>
              <div class="cth-headline" style="font-size: 52px; line-height: 0.92;">${esc(headlineText)}</div>
              <div class="cth-deck" style="font-size: 12.5px; margin-top: 6px;">${esc(copy.deck || '')}</div>
              <div class="cth-kpi-belt" style="margin-top: 12px;">
                ${cleanStats.slice(0, 4).map((st) => `
                  <div class="cth-kpi">
                    <div class="ckb-val">${esc(st.value)}</div>
                    <div class="ckb-lbl">${esc(st.label)}</div>
                  </div>
                `).join('')}
              </div>
            </div>
            <div class="cth-right" style="flex: 0.9; display: flex; justify-content: flex-end;">
              ${renderFramedPhoto(rPhoto0, '✦ DOKUMENTASI UTAMA', 380, 215, '#15803D')}
            </div>
          </div>

          <!-- Middle Donut Chart Bar (1040 x 240px, top: 300px) -->
          <div class="cgrid-card card-orange" style="position: absolute; left: 20px; top: 300px; width: 1040px; height: 240px; box-sizing: border-box;">
            <div class="cg-header orange">
              <span class="cgh-title">✦ PROPORSI ALOKASI ANGGARAN &amp; PROGRAM INFRASTRUKTUR (100%)</span>
              <span class="cgh-badge">DISTRIBUSI APBD &amp; INPRES</span>
            </div>
            <div class="cg-body chart-body" style="padding: 10px 24px; height: 190px; box-sizing: border-box;">
              ${buildEditorialPieChartHtml({
                copy,
                accentColor: '#EA580C',
                titleColor: '#0F172A',
                bodyColor: '#334155',
                halo: universalInkHalo,
              })}
            </div>
          </div>

          <!-- Bottom 2x2 Dense Cards Grid (1040 x 775px, top: 552px to 1327px) -->
          <div style="position: absolute; left: 20px; top: 552px; width: 1040px; display: grid; grid-template-columns: 514px 514px; gap: 12px;">
            <!-- Top-Left Card (380px) -->
            <div class="cgrid-card card-green" style="height: 380px; box-sizing: border-box;">
              <div class="cg-header green">
                <span class="cgh-title">✦ 01. TINJAUAN LAPANGAN &amp; KORIDOR PRIORITAS</span>
                <span class="cgh-badge">${esc(cleanStats[2]?.value)}</span>
              </div>
              <div class="cg-body" style="padding: 12px 16px; display: flex; flex-direction: column; justify-content: space-between; height: 330px; box-sizing: border-box;">
                ${renderFramedPhoto(rPhoto2, 'LOKASI PRIORITAS', 480, 175, '#EA580C')}
                <div style="margin-top: 8px;">
                  ${renderChroniclePoint(points[1] || { label: 'ZONA PRIORITAS INTERVENSI', text: 'Penetapan wilayah penanganan difokuskan pada koridor logistik utama warga antardesa.' }, '01', '#15803D')}
                  ${renderChroniclePoint(points[2] || { label: 'INTEGRASI REHABILITASI TEKNIS', text: 'Standarisasi spesifikasi material agar konstruksi berdaya tahan tinggi terhadap beban tonase.' }, '02', '#15803D')}
                </div>
              </div>
            </div>

            <!-- Top-Right Card (380px) -->
            <div class="cgrid-card card-orange" style="height: 380px; box-sizing: border-box;">
              <div class="cg-header orange">
                <span class="cgh-title">✦ 02. AKSELERASI PENANGANAN &amp; PENGAWASAN MUTU</span>
                <span class="cgh-badge">${esc(cleanStats[3]?.value)}</span>
              </div>
              <div class="cg-body" style="padding: 12px 16px; display: flex; flex-direction: column; justify-content: space-between; height: 330px; box-sizing: border-box;">
                ${renderFramedPhoto(rPhoto3, 'PENGAWASAN MUTU', 480, 175, '#15803D')}
                <div style="margin-top: 8px;">
                  ${renderChroniclePoint(points[3] || { label: 'PENEGAKAN STANDAR BEBAN', text: 'Pengawasan tonase kendaraan berat guna melindungi usia pakai konstruksi jalan baru.' }, '03', '#EA580C')}
                  ${renderChroniclePoint(points[4] || { label: 'AUDIT BERKALA & POS ADUAN', text: 'Kanal pengaduan warga dibuka untuk memastikan ketepatan progres fisik secara langsung.' }, '04', '#EA580C')}
                </div>
              </div>
            </div>

            <!-- Bottom-Left Card (380px) -->
            <div class="cgrid-card card-green" style="height: 380px; box-sizing: border-box;">
              <div class="cg-header green">
                <span class="cgh-title">✦ 03. PEMULIHAN KONEKTIVITAS &amp; DAMPAK EKONOMI</span>
                <span class="cgh-badge">LOGISTIK</span>
              </div>
              <div class="cg-body" style="padding: 12px 16px; display: flex; flex-direction: column; justify-content: space-between; height: 330px; box-sizing: border-box;">
                ${renderFramedPhoto(rPhoto1, 'DAMPAK MOBILITAS', 480, 175, '#EA580C')}
                <div style="margin-top: 8px;">
                  ${renderChroniclePoint(points[5] || { label: 'EFISIENSI WAKTU TEMPUH', text: 'Preservasi jalur memangkas biaya logistik hingga 40% dan mempercepat mobilitas antardesa.' }, '05', '#15803D')}
                  ${renderChroniclePoint({ label: 'STABILISASI DISTRIBUSI PANGAN', text: 'Kelancaran akses memastikan harga sembako dan hasil panen warga tetap stabil terjaga.' }, '06', '#15803D')}
                </div>
              </div>
            </div>

            <!-- Bottom-Right Card (380px) -->
            <div class="cgrid-card card-orange" style="height: 380px; box-sizing: border-box;">
              <div class="cg-header orange">
                <span class="cgh-title">✦ 04. TARGET KEMANTAPAN &amp; AKUNTABILITAS PUBLIK</span>
                <span class="cgh-badge">${esc(cleanStats[0]?.value)}</span>
              </div>
              <div class="cg-body" style="padding: 12px 16px; display: flex; flex-direction: column; justify-content: space-between; height: 330px; box-sizing: border-box;">
                ${renderFramedPhoto(rPhoto0, 'KEMANTAPAN HASIL', 480, 175, '#15803D')}
                <div class="cgb-quote" style="margin-top: 6px; font-size: 11px; line-height: 1.35; color: #334155;">
                  "${esc(copy.closingLine || 'Transparansi pengawasan anggaran dan partisipasi warga adalah fondasi utama infrastruktur bermutu.')}"
                </div>
                <div class="cgb-seal" style="background: #0F172A; color: #FFFFFF; font-size: 9px; font-weight: 800; padding: 6px 12px; border-radius: 4px; text-align: center; letter-spacing: 0.8px;">
                  VERIFIKASI RESMI • DOKUMEN PUBLIK ${currentYear} • ${esc(signature)}
                </div>
              </div>
            </div>
          </div>
        </div>
      `;
    } else {
      // =======================================================================
      // VARIAN 3: 3-COLUMN DENSE BROADSHEET NEWSPAPER CHRONICLE (PADAT 1290PX)
      // =======================================================================
      html = `
        <div class="cgrid-broadsheet-container">
          <div class="cgrid-topbar">
            <div class="cgt-left">${esc(params.signature ? params.signature.split('•')[0] : 'POLARIS')} • DAPIL JABAR</div>
            <div class="cgt-right">DOKUMEN ADVOKASI PUBLIK • EDISI KHUSUS ${currentYear}</div>
          </div>

          <!-- Header Broadsheet Koran Kuno Atas (1040 x 140px, top: 38px) -->
          <div style="position: absolute; left: 20px; top: 38px; width: 1040px; height: 140px; background: #EA580C; border-radius: 4px; padding: 14px 24px; box-sizing: border-box; display: flex; align-items: center; justify-content: space-between; color: #FFFFFF; border-bottom: 4px solid #9A3412;">
            <div>
              <div style="font-size: 11px; font-weight: 800; color: #FEF08A; letter-spacing: 1.5px; text-transform: uppercase;">✦ DOKUMEN ADVOKASI PUBLIK • LAPORAN KHUSUS DAERAH</div>
              <div style="font-family: 'Bebas Neue', sans-serif; font-size: 46px; line-height: 0.95; letter-spacing: 1.2px;">${esc(headlineText)}</div>
              <div style="font-size: 11.5px; font-weight: 500; color: #FFFDF9; max-width: 650px; margin-top: 4px;">${esc(copy.deck || '')}</div>
            </div>
            <div style="display: flex; gap: 8px;">
              ${cleanStats.slice(0, 4).map((st) => `
                <div style="background: rgba(0,0,0,0.25); border: 1px solid rgba(254,240,138,0.4); border-radius: 4px; padding: 6px 10px; text-align: center; min-width: 75px;">
                  <div style="font-family: 'Bebas Neue', sans-serif; font-size: 24px; color: #FEF08A; line-height: 1;">${esc(st.value)}</div>
                  <div style="font-size: 7.5px; font-weight: 800; color: #FFFFFF; text-transform: uppercase;">${esc(st.label)}</div>
                </div>
              `).join('')}
            </div>
          </div>

          <!-- 3 Kolom Kronik Berita Arsip (left: 20px, top: 190px, width: 1040px, height: 1135px) -->
          <div style="position: absolute; left: 20px; top: 190px; width: 1040px; display: grid; grid-template-columns: 338px 340px 338px; gap: 12px;">
            <!-- KOLOM 1: LATAR BELAKANG & PRIORITAS (Height: 1135px) -->
            <div style="display: flex; flex-direction: column; gap: 12px;">
              <!-- Card 1A: Tinjauan Awal (Height: 365px) -->
              <div class="cgrid-card card-green" style="height: 365px; box-sizing: border-box;">
                <div class="cg-header green">
                  <span class="cgh-title">✦ IDENTIFIKASI KORIDOR</span>
                  <span class="cgh-badge">FOKUS</span>
                </div>
                <div class="cg-body" style="padding: 10px 12px; display: flex; flex-direction: column; justify-content: space-between; height: 320px; box-sizing: border-box;">
                  ${renderFramedPhoto(rPhoto0, 'KONDISI AWAL', 312, 165, '#EA580C')}
                  <div style="margin-top: 6px;">
                    ${renderChroniclePoint(points[0] || { label: 'BEBAN JALUR LOGISTIK', text: 'Beban tonase truk tambang mempercepat laju kerusakan jalan kabupaten.' }, '01', '#15803D')}
                  </div>
                </div>
              </div>

              <!-- Card 1B: Koridor Selatan (Height: 365px) -->
              <div class="cgrid-card card-orange" style="height: 365px; box-sizing: border-box;">
                <div class="cg-header orange">
                  <span class="cgh-title">✦ PRIORITAS KORIDOR SELATAN</span>
                  <span class="cgh-badge">SASARAN</span>
                </div>
                <div class="cg-body" style="padding: 10px 12px; display: flex; flex-direction: column; justify-content: space-between; height: 320px; box-sizing: border-box;">
                  ${renderFramedPhoto(rPhoto1, 'RUAS UTAMA', 312, 165, '#15803D')}
                  <div style="margin-top: 6px;">
                    ${renderChroniclePoint(points[1] || { label: 'URAT NADI EKONOMI', text: 'Jalur penghubung vital Jampang Tengah, Sagaranten, dan Cikidang diprioritaskan.' }, '02', '#EA580C')}
                  </div>
                </div>
              </div>

              <!-- Card 1C: Tanda Tangan & Komitmen (Height: 380px) -->
              <div class="cgrid-card card-green" style="height: 380px; box-sizing: border-box;">
                <div class="cg-header green">
                  <span class="cgh-title">✦ INTEGRASI KEBIJAKAN</span>
                  <span class="cgh-badge">KOMITMEN</span>
                </div>
                <div class="cg-body" style="padding: 10px 12px; display: flex; flex-direction: column; justify-content: space-between; height: 335px; box-sizing: border-box;">
                  ${renderFramedPhoto(rPhoto2, 'DOKUMENTASI DEWAN', 312, 160, '#EA580C')}
                  <div class="clp-pillar-quote" style="margin-top: 6px; font-size: 10px;">
                    "${esc(copy.closingLine ? copy.closingLine.slice(0, 100) + '...' : 'Komitmen transparansi penanganan infrastruktur bagi kemaslahatan warga.')}"
                  </div>
                  <div class="clp-sig-box" style="margin-top: 6px;">
                    <div class="csb-name">${esc(signature.split('•')[0] || signature)}</div>
                    <div class="csb-sub">${esc(signature.split('•').slice(1).join('•') || 'DPRD PROVINSI')} • ${currentYear}</div>
                  </div>
                </div>
              </div>
            </div>

            <!-- KOLOM 2: DONUT CHART & REHABILITASI FISIK (Height: 1135px) -->
            <div style="display: flex; flex-direction: column; gap: 12px;">
              <!-- Card 2A: DONUT CHART 100% PROPORSI ALOKASI ANGGARAN (Height: 365px) -->
              <div class="cgrid-card card-orange" style="height: 365px; box-sizing: border-box;">
                <div class="cg-header orange">
                  <span class="cgh-title">✦ PROPORSI ALOKASI ANGGARAN (100%)</span>
                  <span class="cgh-badge">ANGGARAN</span>
                </div>
                <div class="cg-body chart-body" style="padding: 8px 12px; height: 320px; box-sizing: border-box;">
                  ${buildEditorialPieChartHtml({
                    copy,
                    accentColor: '#EA580C',
                    titleColor: '#0F172A',
                    bodyColor: '#334155',
                    halo: universalInkHalo,
                  })}
                </div>
              </div>

              <!-- Card 2B: Standarisasi Beton (Height: 365px) -->
              <div class="cgrid-card card-green" style="height: 365px; box-sizing: border-box;">
                <div class="cg-header green">
                  <span class="cgh-title">✦ MUTU BETON &amp; DRAINASE</span>
                  <span class="cgh-badge">TEKNIS</span>
                </div>
                <div class="cg-body" style="padding: 10px 12px; display: flex; flex-direction: column; justify-content: space-between; height: 320px; box-sizing: border-box;">
                  ${renderFramedPhoto(rPhoto3, 'PERKERASAN RIGID', 314, 165, '#15803D')}
                  <div style="margin-top: 6px;">
                    ${renderChroniclePoint(points[2] || { label: 'STANDARISASI RIGID FS 45', text: 'Konstruksi beton bertulang setebal 25 cm menjamin ketahanan terhadap muatan berat.' }, '03', '#15803D')}
                  </div>
                </div>
              </div>

              <!-- Card 2C: Target Kemantapan (Height: 380px) -->
              <div class="cgrid-card card-orange" style="height: 380px; box-sizing: border-box;">
                <div class="cg-header orange">
                  <span class="cgh-title">✦ TARGET KEMANTAPAN 2026</span>
                  <span class="cgh-badge">${esc(cleanStats[0]?.value)}</span>
                </div>
                <div class="cg-body" style="padding: 10px 12px; display: flex; flex-direction: column; justify-content: space-between; height: 335px; box-sizing: border-box;">
                  ${renderFramedPhoto(rPhoto0, 'KEMANTAPAN HASIL', 314, 160, '#EA580C')}
                  <div style="margin-top: 6px;">
                    ${renderChroniclePoint({ label: 'PENGAWASAN MUATAN TRUK', text: 'Pemasangan timbangan portabel gabungan di titik rawan mencegah beban berlebih.' }, '04', '#EA580C')}
                  </div>
                  <div class="cgb-seal" style="background: #0F172A; color: #FFFFFF; font-size: 8.5px; font-weight: 800; padding: 5px 8px; border-radius: 4px; text-align: center;">
                    DOKUMEN RESMI TERVERIFIKASI
                  </div>
                </div>
              </div>
            </div>

            <!-- KOLOM 3: DAMPAK WARGA & AKUNTABILITAS (Height: 1135px) -->
            <div style="display: flex; flex-direction: column; gap: 12px;">
              <!-- Card 3A: Pengawasan Lapangan (Height: 365px) -->
              <div class="cgrid-card card-green" style="height: 365px; box-sizing: border-box;">
                <div class="cg-header green">
                  <span class="cgh-title">✦ PENGAWASAN LAPANGAN</span>
                  <span class="cgh-badge">MUTU</span>
                </div>
                <div class="cg-body" style="padding: 10px 12px; display: flex; flex-direction: column; justify-content: space-between; height: 320px; box-sizing: border-box;">
                  ${renderFramedPhoto(rPhoto1, 'INSPEKSI FISIK', 312, 165, '#EA580C')}
                  <div style="margin-top: 6px;">
                    ${renderChroniclePoint(points[3] || { label: 'UJI LAB KELAIKAN STRUKTUR', text: 'Setiap segmen beton diuji ketahanan tekan sebelum dibuka untuk operasional umum.' }, '05', '#15803D')}
                  </div>
                </div>
              </div>

              <!-- Card 3B: Dampak Ekonomi (Height: 365px) -->
              <div class="cgrid-card card-orange" style="height: 365px; box-sizing: border-box;">
                <div class="cg-header orange">
                  <span class="cgh-title">✦ DISTRIBUSI LOGISTIK</span>
                  <span class="cgh-badge">EKONOMI</span>
                </div>
                <div class="cg-body" style="padding: 10px 12px; display: flex; flex-direction: column; justify-content: space-between; height: 320px; box-sizing: border-box;">
                  ${renderFramedPhoto(rPhoto2, 'KELANCARAN ARUS', 312, 165, '#15803D')}
                  <div style="margin-top: 6px;">
                    ${renderChroniclePoint(points[4] || { label: 'EFISIENSI BIAYA DISTRIBUSI', text: 'Waktu tempuh terpangkas sehingga biaya angkut hasil bumi petani turun signifikan.' }, '06', '#EA580C')}
                  </div>
                </div>
              </div>

              <!-- Card 3C: Verifikasi & Sinergi (Height: 380px) -->
              <div class="cgrid-card card-green" style="height: 380px; box-sizing: border-box;">
                <div class="cg-header green">
                  <span class="cgh-title">✦ AKUNTABILITAS PUBLIK</span>
                  <span class="cgh-badge">SINERGI</span>
                </div>
                <div class="cg-body" style="padding: 10px 12px; display: flex; flex-direction: column; justify-content: space-between; height: 335px; box-sizing: border-box;">
                  ${renderFramedPhoto(rPhoto3, 'SINERGI WARGA', 312, 160, '#EA580C')}
                  <div style="margin-top: 6px;">
                    ${renderChroniclePoint({ label: 'KANAL ADUAN 24 JAM', text: 'Warga dapat memantau progres kontraktor dan menyampaikan aduan melalui pos resmi.' }, '07', '#15803D')}
                  </div>
                  <div class="cgb-seal" style="background: #15803D; color: #FFFFFF; font-size: 8.5px; font-weight: 800; padding: 5px 8px; border-radius: 4px; text-align: center;">
                    VERIFIKASI RESMI • DOKUMEN PUBLIK ${currentYear}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      `;
    }

    const css = `
      /* FULL-BLEED ZERO MARGIN 1080 x 1350 CONTAINER (NO CANVAS BLEED) */
      .edition-tag, .footer-zone {
        display: none !important;
      }
      .cgrid-broadsheet-container {
        position: absolute;
        top: 0;
        left: 0;
        width: 1080px;
        height: 1350px;
        background: #F8F6F0; /* Solid Clean Newspaper Broadsheet Cream */
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
        color: #1E293B;
        box-sizing: border-box;
        overflow: hidden;
        margin: 0 !important;
        padding: 0 !important;
        border: none !important;
        z-index: 10;
      }

      /* Top Classification Header */
      .cgrid-topbar {
        position: absolute;
        top: 10px;
        left: 20px;
        right: 20px;
        display: flex;
        justify-content: space-between;
        align-items: center;
        font-size: 11px;
        font-weight: 800;
        letter-spacing: 1.2px;
        text-transform: uppercase;
        color: #64748B;
        border-bottom: 1.5px solid #CBD5E1;
        padding-bottom: 6px;
      }

      /* KOLOM KIRI IKONIK SOEDIRMAN (Pillar 330px x 1290px) */
      .cgrid-left-pillar {
        position: absolute;
        top: 38px;
        border-radius: 4px;
        overflow: hidden;
        border: 1.5px solid #CBD5E1;
        box-shadow: 0 4px 12px rgba(0,0,0,0.06);
        box-sizing: border-box;
        display: flex;
        flex-direction: column;
      }
      .clp-orange-block {
        background: #EA580C;
        padding: 14px 16px;
        box-sizing: border-box;
        color: #FFFFFF;
        display: flex;
        flex-direction: column;
      }
      .clp-stacked-headline {
        display: flex;
        flex-direction: column;
        line-height: 0.88;
      }
      .soedirman-stacked-word {
        font-family: 'Bebas Neue', -apple-system, sans-serif;
        font-size: 54px;
        color: #FFFFFF;
        text-transform: uppercase;
        letter-spacing: 1.2px;
      }
      .clp-deck {
        font-size: 11px;
        font-weight: 500;
        line-height: 1.35;
        color: #FFF7ED;
        margin-top: 8px;
        margin-bottom: 10px;
      }
      .clp-kpi-row {
        display: flex;
        gap: 8px;
      }
      .clp-kpi-box-orange {
        flex: 1;
        background: rgba(0, 0, 0, 0.22);
        border: 1px solid rgba(255, 255, 255, 0.35);
        border-radius: 4px;
        padding: 6px 8px;
        text-align: center;
      }
      .ckb-val-white {
        font-family: 'Bebas Neue', sans-serif;
        font-size: 28px;
        color: #FFFFFF;
        line-height: 1;
      }
      .ckb-lbl-white {
        font-size: 8px;
        font-weight: 800;
        color: #FEF08A;
        text-transform: uppercase;
        letter-spacing: 0.5px;
        margin-top: 2px;
      }

      /* Seksi Krim Bawah Kolom Kiri */
      .clp-cream-block {
        background: #FFFFFF;
        padding: 12px 16px;
        box-sizing: border-box;
        border-top: 4px solid #15803D;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
      }
      .clp-subhead-green {
        font-size: 10.5px;
        font-weight: 800;
        color: #15803D;
        text-transform: uppercase;
        letter-spacing: 0.8px;
        margin-bottom: 8px;
      }
      .clp-facts-list {
        display: flex;
        flex-direction: column;
        gap: 6px;
      }
      .clp-fact-item {
        display: flex;
        gap: 8px;
        align-items: flex-start;
      }
      .clp-bullet {
        color: #EA580C;
        font-size: 10px;
        line-height: 1.2;
        margin-top: 2px;
      }
      .clp-fact-text {
        font-size: 10px;
        line-height: 1.35;
        color: #334155;
      }
      .clp-pillar-quote {
        font-size: 10px;
        font-style: italic;
        line-height: 1.35;
        color: #475569;
        border-left: 3px solid #EA580C;
        padding-left: 8px;
      }
      .clp-sig-box {
        background: #0F172A;
        border-radius: 4px;
        padding: 8px 12px;
        text-align: center;
        color: #FFFFFF;
      }
      .csb-name {
        font-family: 'Bebas Neue', sans-serif;
        font-size: 19px;
        letter-spacing: 1px;
        color: #FFFFFF;
        line-height: 1.1;
      }
      .csb-sub {
        font-size: 8px;
        font-weight: 800;
        color: #94A3B8;
        letter-spacing: 0.8px;
        text-transform: uppercase;
        margin-top: 2px;
      }

      /* SISI KANAN: MODULAR CHRONICLE CARDS */
      .cgrid-right-col {
        position: absolute;
        top: 38px;
      }
      .cgrid-card {
        background: #FFFFFF;
        border: 1.5px solid #CBD5E1;
        border-radius: 4px;
        overflow: hidden;
        box-shadow: 0 3px 8px rgba(0,0,0,0.04);
        box-sizing: border-box;
      }
      .cgrid-card.card-green {
        border-top: 4px solid #15803D;
      }
      .cgrid-card.card-orange {
        border-top: 4px solid #EA580C;
      }
      .cg-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 7px 14px;
        color: #FFFFFF;
        font-size: 11px;
        font-weight: 800;
        letter-spacing: 0.8px;
        text-transform: uppercase;
      }
      .cg-header.green {
        background: #15803D;
      }
      .cg-header.orange {
        background: #EA580C;
      }
      .cgh-badge {
        background: rgba(0,0,0,0.25);
        color: #FEF08A;
        font-size: 9px;
        font-weight: 800;
        padding: 2px 7px;
        border-radius: 3px;
        letter-spacing: 0.5px;
      }
      .cg-body.row-split {
        display: flex;
        align-items: center;
      }
      .cg-points-col {
        display: flex;
        flex-direction: column;
        gap: 8px;
      }
      .cgrid-point-item {
        border-left: 3px solid #15803D;
        padding-left: 8px;
      }
      .cgrid-point-header {
        display: flex;
        align-items: center;
        gap: 6px;
      }
      .cgrid-num-badge {
        color: #FFFFFF;
        font-size: 8.5px;
        font-weight: 800;
        padding: 1px 5px;
        border-radius: 2px;
      }
      .cgrid-point-title {
        font-size: 10.5px;
        font-weight: 800;
        color: #0F172A;
        letter-spacing: 0.3px;
      }
      .cgrid-point-desc {
        font-size: 10px;
        line-height: 1.35;
        color: #334155;
        margin-top: 2px;
      }

      /* FRAMED PHOTO CONTAINER */
      .cgrid-photo-frame {
        position: relative;
        border: 2px solid #E2E8F0;
        border-radius: 4px;
        overflow: hidden;
        background: #0F172A;
        flex-shrink: 0;
      }
      .cgrid-photo-img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        display: block;
      }
      .cgrid-photo-tag {
        position: absolute;
        top: 6px;
        left: 6px;
        color: #FFFFFF;
        font-size: 8px;
        font-weight: 800;
        padding: 2px 6px;
        border-radius: 2px;
        letter-spacing: 0.5px;
        text-transform: uppercase;
        z-index: 2;
        box-shadow: 0 1px 3px rgba(0,0,0,0.4);
      }

      /* VARIAN 2: TOP HERO BANNER */
      .cgrid-top-hero {
        position: absolute;
        background: #EA580C;
        border-radius: 4px;
        padding: 16px 20px;
        box-sizing: border-box;
        display: flex;
        align-items: center;
        justify-content: space-between;
        color: #FFFFFF;
        border-bottom: 4px solid #9A3412;
      }
      .cth-kicker {
        font-size: 10.5px;
        font-weight: 800;
        color: #FEF08A;
        letter-spacing: 1.2px;
        text-transform: uppercase;
      }
      .cth-headline {
        font-family: 'Bebas Neue', sans-serif;
        color: #FFFFFF;
        letter-spacing: 1.2px;
      }
      .cth-deck {
        font-weight: 500;
        color: #FFF7ED;
        line-height: 1.35;
      }
      .cth-kpi-belt {
        display: flex;
        gap: 8px;
      }
      .cth-kpi {
        background: rgba(0,0,0,0.25);
        border: 1px solid rgba(254,240,138,0.4);
        border-radius: 4px;
        padding: 6px 12px;
        text-align: center;
      }
      .cth-kpi .ckb-val {
        font-family: 'Bebas Neue', sans-serif;
        font-size: 26px;
        color: #FEF08A;
        line-height: 1;
      }
      .cth-kpi .ckb-lbl {
        font-size: 8px;
        font-weight: 800;
        color: #FFFFFF;
        text-transform: uppercase;
      }
    `;

    return { html, css };
  }

  if (archetype === 'INFOGRAPHIC_RADIAL_CLOCK') {
    // =========================================================================
    // AUTHENTIC RADIAL CLOCK CHRONICLE (template-03-radial-clock-chronicle.jpg)
    // OPSI D: 4 CENTERPIECE SIMBOLIK KEBIJAKAN PUBLIK (KOMPAS, SEGEL, GAUGE, HUB)
    // + ALUR FOTO ORBITAL S-CURVE DINAMIS + BOTTOM ACCOUNTABILITY BELT PADAT
    // =========================================================================

    const variantIndex = resolvedVariant; // 0, 1, 2, 3
    const signature = params.signature || 'DR. JONANDA P. A. B • DPRD PROVINSI • DAPIL JABAR';

    const fallbackPhoto = params.bgBase64 || '';
    const [rPhoto0, rPhoto1, rPhoto2, rPhoto3] = params.photoSlots || [
      fallbackPhoto,
      fallbackPhoto,
      fallbackPhoto,
      fallbackPhoto,
    ];

    // Deduplikasi & penyiapan 4 KPI unik
    const cleanStats: Array<{ value: string; label: string }> = [];
    const seenStatValues = new Set<string>();
    for (const st of statsList) {
      const valKey = String(st.value || '').toUpperCase().replace(/\s+/g, '');
      if (valKey && !seenStatValues.has(valKey)) {
        seenStatValues.add(valKey);
        cleanStats.push({
          value: String(st.value || '').trim(),
          label: String(st.label || '').trim(),
        });
      }
    }
    const defaultStats = [
      { value: '95,4%', label: 'CAPAIAN UTAMA' },
      { value: 'RP 18,5 M', label: 'PAGU ANGGARAN' },
      { value: '12 KECAMATAN', label: 'SEBARAN WILAYAH' },
      { value: '4.500 WARGA', label: 'PENERIMA MANFAAT' },
    ];
    while (cleanStats.length < 4) {
      cleanStats.push(defaultStats[cleanStats.length]!);
    }

    // 6 Sektor Pancaran Tahapan Kebijakan (100% dinamis dari copy.points)
    const fallbackSectors = [
      {
        label: 'PEMETAAN KONDISI LAPANGAN',
        text: copy.deck || `Identifikasi menyeluruh terhadap kondisi faktual dan kebutuhan mendesak masyarakat terkait ${headlineText}.`,
      },
      {
        label: 'PENETAPAN ZONA PRIORITAS',
        text: `Penyaluran intervensi difokuskan pada wilayah sasaran (${cleanStats[2]?.value}) guna mempercepat pemerataan layanan publik.`,
      },
      {
        label: 'PELAKSANAAN TEKNIS TERPADU',
        text: `Alokasi anggaran sebesar ${cleanStats[1]?.value} dioptimalkan melalui standar teknis terukur dan pendampingan petugas lapangan.`,
      },
      {
        label: 'STANDARISASI SARANA PUBLIK',
        text: `Peningkatan mutu fasilitas penunjang dan infrastruktur pelayanan agar memenuhi target capaian ${cleanStats[0]?.value}.`,
      },
      {
        label: 'PENGAWASAN & AUDIT BERKALA',
        text: `Evaluasi realisasi program dilakukan secara transparan bersama masyarakat guna menjamin ketepatan sasaran bagi ${cleanStats[3]?.value}.`,
      },
      {
        label: 'KEBERLANJUTAN MANFAAT WARGA',
        text: copy.closingLine || `Penguatan tata kelola kebijakan publik yang berdampak langsung pada peningkatan kesejahteraan masyarakat daerah.`,
      },
    ];

    const rPoints = [0, 1, 2, 3, 4, 5].map((i) => ({
      label: String(points[i]?.label || fallbackSectors[i]!.label)
        .replace(/^(?:0?\d+\s*[•.\-:]\s*)/, '')
        .trim(),
      text: String(points[i]?.text || fallbackSectors[i]!.text).trim(),
    }));

    const splitBullets = (txt: string): string[] => {
      const sentences = String(txt || '')
        .split(/(?<=[.!?])\s+/)
        .map((s) => s.trim())
        .filter((s) => s.length > 8);
      if (sentences.length >= 2) return sentences.slice(0, 2);
      return [txt];
    };

    // Ambil kata kunci utama untuk spine vertikal (maks 10 huruf)
    const stopWords = new Set(['DAN', 'DI', 'KE', 'DARI', 'UNTUK', 'PADA', 'DALAM', 'ATAS', 'BAGI', 'YANG', 'INI', 'ITU']);
    const titleWords = headlineText
      .replace(/[^A-Z0-9\s]/gi, ' ')
      .split(/\s+/)
      .map((w) => w.trim().toUpperCase())
      .filter((w) => w.length >= 4 && !stopWords.has(w));
    const spineWord = (titleWords[0] || headlineText.replace(/[^A-Z]/gi, '').slice(0, 10) || 'ADVOKASI').slice(0, 10);
    const halfIdx = Math.ceil(spineWord.length / 2);
    const topSpineChars = spineWord.slice(0, halfIdx).split('');
    const botSpineChars = spineWord.slice(halfIdx).split('');

    // Konfigurasi 6 Stempel Bersejarah & Sektor
    const stampConfigs = [
      { roman: 'TAHAP I', stageName: 'INVENTARIS', stampBg: '#6D28D9', sectorBg: '#FAF5ED', borderHex: '#6D28D9' },
      { roman: 'TAHAP II', stageName: 'PRIORITAS', stampBg: '#15803D', sectorBg: '#F0F8EE', borderHex: '#15803D' },
      { roman: 'TAHAP III', stageName: 'TEKNIS', stampBg: '#0284C7', sectorBg: '#EBF5FA', borderHex: '#0284C7' },
      { roman: 'TAHAP IV', stageName: 'LOGISTIK', stampBg: '#D97706', sectorBg: '#FCF2E8', borderHex: '#D97706' },
      { roman: 'TAHAP V', stageName: 'AUDIT', stampBg: '#DC2626', sectorBg: '#FAEAEB', borderHex: '#DC2626' },
      { roman: 'TAHAP VI', stageName: 'KEMANTAPAN', stampBg: '#1E293B', sectorBg: '#F8F3ED', borderHex: '#1E293B' },
    ];

    // =========================================================================
    // OPSI D: 4 CENTERPIECES SIMBOLIK KEBIJAKAN PUBLIK (SVG MURNI)
    // =========================================================================

    // VARIAN 0: KOMPAS NAVIGASI KEBIJAKAN (Policy Navigation Compass)
    const renderCompassSvg = (sizePx = 280) => `
      <svg viewBox="0 0 280 280" width="${sizePx}" height="${sizePx}" xmlns="http://www.w3.org/2000/svg" style="display: block; filter: drop-shadow(0 14px 32px rgba(42, 24, 13, 0.45));">
        <defs>
          <radialGradient id="compassDialGrad" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stop-color="#FFFDF9" />
            <stop offset="68%" stop-color="#F8EED9" />
            <stop offset="92%" stop-color="#E7D2AE" />
            <stop offset="100%" stop-color="#D5BD93" />
          </radialGradient>
          <linearGradient id="compassBezelGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#8C5C32" />
            <stop offset="35%" stop-color="#4A2A12" />
            <stop offset="70%" stop-color="#6B4423" />
            <stop offset="100%" stop-color="#2D1708" />
          </linearGradient>
        </defs>
        <path d="M130 16 C130 6 150 6 150 16" stroke="#6B4423" stroke-width="4" fill="none"/>
        <circle cx="140" cy="11" r="10" stroke="#8C5C32" stroke-width="3" fill="none"/>
        <circle cx="140" cy="140" r="135" fill="url(#compassBezelGrad)" stroke="#1F120A" stroke-width="4" />
        <circle cx="140" cy="140" r="126" fill="none" stroke="#D97706" stroke-width="2" stroke-dasharray="4 3" />
        <circle cx="140" cy="140" r="121" fill="#3D210F" stroke="#1F120A" stroke-width="1.5" />
        <circle cx="140" cy="140" r="118" fill="url(#compassDialGrad)" stroke="#4A2A12" stroke-width="3" />
        <circle cx="140" cy="140" r="108" fill="none" stroke="#6B4423" stroke-width="1.2" />
        <circle cx="140" cy="140" r="98" fill="none" stroke="#3A2010" stroke-width="0.8" />
        ${Array.from({ length: 72 })
          .map((_, i) => {
            const deg = i * 5;
            const isMajor = i % 9 === 0;
            const isMid = i % 3 === 0;
            const len = isMajor ? 12 : isMid ? 8 : 4;
            return `<line x1="140" y1="${24}" x2="140" y2="${24 + len}" stroke="#3A2010" stroke-width="${isMajor ? 2.5 : isMid ? 1.5 : 0.8}" transform="rotate(${deg}, 140, 140)" />`;
          })
          .join('')}
        <!-- 8-Point Compass Rose -->
        <polygon points="140,140 140,65 147,133" fill="#D97706" transform="rotate(45, 140, 140)" />
        <polygon points="140,140 140,65 133,133" fill="#FDE68A" transform="rotate(45, 140, 140)" />
        <polygon points="140,140 140,65 147,133" fill="#D97706" transform="rotate(135, 140, 140)" />
        <polygon points="140,140 140,65 133,133" fill="#FDE68A" transform="rotate(135, 140, 140)" />
        <polygon points="140,140 140,65 147,133" fill="#D97706" transform="rotate(225, 140, 140)" />
        <polygon points="140,140 140,65 133,133" fill="#FDE68A" transform="rotate(225, 140, 140)" />
        <polygon points="140,140 140,65 147,133" fill="#D97706" transform="rotate(315, 140, 140)" />
        <polygon points="140,140 140,65 133,133" fill="#FDE68A" transform="rotate(315, 140, 140)" />
        <polygon points="140,140 140,45 149,131" fill="#78350F" transform="rotate(90, 140, 140)" />
        <polygon points="140,140 140,45 131,131" fill="#D97706" transform="rotate(90, 140, 140)" />
        <polygon points="140,140 140,45 149,131" fill="#78350F" transform="rotate(180, 140, 140)" />
        <polygon points="140,140 140,45 131,131" fill="#D97706" transform="rotate(180, 140, 140)" />
        <polygon points="140,140 140,45 149,131" fill="#78350F" transform="rotate(270, 140, 140)" />
        <polygon points="140,140 140,45 131,131" fill="#D97706" transform="rotate(270, 140, 140)" />
        <polygon points="140,140 140,38 150,130" fill="#451A03" />
        <polygon points="140,140 140,38 130,130" fill="#DC2626" />
        <text x="140" y="32" text-anchor="middle" font-family="Georgia, serif" font-size="17" font-weight="900" fill="#991B1B">U</text>
        <text x="252" y="146" text-anchor="middle" font-family="Georgia, serif" font-size="15" font-weight="900" fill="#451A03">T</text>
        <text x="140" y="260" text-anchor="middle" font-family="Georgia, serif" font-size="15" font-weight="900" fill="#451A03">S</text>
        <text x="28" y="146" text-anchor="middle" font-family="Georgia, serif" font-size="15" font-weight="900" fill="#451A03">B</text>
        <circle cx="140" cy="140" r="76" fill="none" stroke="#8C5C32" stroke-width="1.5" stroke-dasharray="3 2" />
        <g transform="rotate(-38, 140, 140)">
          <polygon points="140,65 145,140 140,152 135,140" fill="#DC2626" stroke="#7F1D1D" stroke-width="1.5" />
          <polygon points="140,215 145,140 140,128 135,140" fill="#1E293B" stroke="#0F172A" stroke-width="1.5" />
        </g>
        <circle cx="140" cy="140" r="13" fill="#B45309" stroke="#1F120A" stroke-width="2.5" />
        <circle cx="140" cy="140" r="6" fill="#FEF08A" stroke="#78350F" stroke-width="1" />
      </svg>
    `;

    // VARIAN 1: SEGEL MEDALI EMAS RESMI (Official Embossed Legislative Seal)
    const renderSealSvg = (sizePx = 280) => `
      <svg viewBox="0 0 280 280" width="${sizePx}" height="${sizePx}" xmlns="http://www.w3.org/2000/svg" style="display: block; filter: drop-shadow(0 14px 32px rgba(42, 24, 13, 0.45));">
        <defs>
          <radialGradient id="sealGoldGrad" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stop-color="#FFFBEB" />
            <stop offset="30%" stop-color="#FDE68A" />
            <stop offset="70%" stop-color="#D97706" />
            <stop offset="92%" stop-color="#B45309" />
            <stop offset="100%" stop-color="#78350F" />
          </radialGradient>
          <linearGradient id="sealBezelGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#D97706" />
            <stop offset="30%" stop-color="#78350F" />
            <stop offset="70%" stop-color="#B45309" />
            <stop offset="100%" stop-color="#451A03" />
          </linearGradient>
        </defs>
        ${Array.from({ length: 48 })
          .map((_, i) => {
            const deg = i * 7.5;
            return `<polygon points="140,6 144,18 136,18" fill="#B45309" stroke="#451A03" stroke-width="0.8" transform="rotate(${deg}, 140, 140)" />`;
          })
          .join('')}
        <circle cx="140" cy="140" r="130" fill="url(#sealBezelGrad)" stroke="#351403" stroke-width="4" />
        <circle cx="140" cy="140" r="122" fill="none" stroke="#FEF08A" stroke-width="2" stroke-dasharray="3 2" />
        <circle cx="140" cy="140" r="116" fill="url(#sealGoldGrad)" stroke="#78350F" stroke-width="3" />
        <circle cx="140" cy="140" r="106" fill="none" stroke="#451A03" stroke-width="1.8" />
        <circle cx="140" cy="140" r="78" fill="none" stroke="#78350F" stroke-width="2" stroke-dasharray="4 2" />
        <circle cx="140" cy="140" r="72" fill="#FDF6B2" stroke="#B45309" stroke-width="2" />
        <text x="140" y="115" text-anchor="middle" font-size="28" fill="#B45309">★</text>
        <text x="140" y="142" text-anchor="middle" font-family="'Bebas Neue', sans-serif" font-size="21" font-weight="900" letter-spacing="2.5" fill="#451A03">SEGEL RESMI</text>
        <text x="140" y="162" text-anchor="middle" font-family="'Bebas Neue', sans-serif" font-size="14" font-weight="800" letter-spacing="1.5" fill="#B45309">ADVOKASI PUBLIK</text>
        <text x="140" y="178" text-anchor="middle" font-size="11" font-weight="900" fill="#78350F">✦ DEWAN DAERAH ✦</text>
      </svg>
    `;

    // VARIAN 2: DIAL GAUGE CAPAIAN KINERJA (Progress Performance Meter)
    const renderGaugeSvg = (sizePx = 280, valStr = '85%') => `
      <svg viewBox="0 0 280 280" width="${sizePx}" height="${sizePx}" xmlns="http://www.w3.org/2000/svg" style="display: block; filter: drop-shadow(0 14px 32px rgba(42, 24, 13, 0.45));">
        <defs>
          <linearGradient id="gaugeBezel" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#475569" />
            <stop offset="50%" stop-color="#1E293B" />
            <stop offset="100%" stop-color="#0F172A" />
          </linearGradient>
          <radialGradient id="gaugeDial" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stop-color="#FFFFFF" />
            <stop offset="75%" stop-color="#F8FAFC" />
            <stop offset="100%" stop-color="#E2E8F0" />
          </radialGradient>
        </defs>
        <circle cx="140" cy="140" r="135" fill="url(#gaugeBezel)" stroke="#0F172A" stroke-width="4" />
        <circle cx="140" cy="140" r="124" fill="none" stroke="#D97706" stroke-width="2" />
        <circle cx="140" cy="140" r="118" fill="url(#gaugeDial)" stroke="#334155" stroke-width="3" />
        <path d="M50 175 A 100 100 0 0 1 95 65" fill="none" stroke="#EA580C" stroke-width="12" stroke-linecap="round" />
        <path d="M102 60 A 100 100 0 0 1 178 60" fill="none" stroke="#F59E0B" stroke-width="12" />
        <path d="M185 65 A 100 100 0 0 1 230 175" fill="none" stroke="#16A34A" stroke-width="12" stroke-linecap="round" />
        <text x="56" y="195" font-family="'Bebas Neue', sans-serif" font-size="14" font-weight="900" fill="#64748B">0%</text>
        <text x="86" y="80" font-family="'Bebas Neue', sans-serif" font-size="14" font-weight="900" fill="#64748B">50%</text>
        <text x="210" y="195" font-family="'Bebas Neue', sans-serif" font-size="14" font-weight="900" fill="#16A34A">100%</text>
        <rect x="85" y="145" width="110" height="42" rx="4" fill="#0F172A" stroke="#16A34A" stroke-width="2" />
        <text x="140" y="172" text-anchor="middle" font-family="'Bebas Neue', sans-serif" font-size="28" font-weight="900" fill="#4ADE80" letter-spacing="1">${valStr}</text>
        <text x="140" y="205" text-anchor="middle" font-family="'Bebas Neue', sans-serif" font-size="12" font-weight="800" fill="#334155" letter-spacing="1.5">INDIKATOR CAPAIAN</text>
        <g transform="rotate(50, 140, 140)">
          <polygon points="140,40 144,140 140,152 136,140" fill="#DC2626" stroke="#991B1B" stroke-width="1.5" />
        </g>
        <circle cx="140" cy="140" r="10" fill="#0F172A" stroke="#E2E8F0" stroke-width="3" />
      </svg>
    `;

    // VARIAN 3: HUB SIKLUS TAHAPAN MELINGKAR (Radial Milestone Cycle Hub)
    const renderHubSvg = (sizePx = 280) => `
      <svg viewBox="0 0 280 280" width="${sizePx}" height="${sizePx}" xmlns="http://www.w3.org/2000/svg" style="display: block; filter: drop-shadow(0 14px 32px rgba(42, 24, 13, 0.45));">
        <defs>
          <radialGradient id="hubGrad" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stop-color="#1E293B" />
            <stop offset="85%" stop-color="#0F172A" />
            <stop offset="100%" stop-color="#020617" />
          </radialGradient>
        </defs>
        <circle cx="140" cy="140" r="135" fill="url(#hubGrad)" stroke="#B45309" stroke-width="4" />
        <circle cx="140" cy="140" r="124" fill="none" stroke="#FEF08A" stroke-width="2" stroke-dasharray="4 2" />
        <circle cx="140" cy="140" r="95" fill="none" stroke="rgba(254,240,138,0.3)" stroke-width="24" />
        ${[
          { angle: 0, label: '01' },
          { angle: 90, label: '02' },
          { angle: 180, label: '03' },
          { angle: 270, label: '04' },
        ]
          .map(({ angle, label }) => `
            <g transform="rotate(${angle}, 140, 140)">
              <circle cx="140" cy="45" r="16" fill="#D97706" stroke="#FEF08A" stroke-width="2" />
              <text x="140" y="50" text-anchor="middle" font-family="'Bebas Neue', sans-serif" font-size="14" font-weight="900" fill="#FFFFFF">${label}</text>
            </g>
          `)
          .join('')}
        <circle cx="140" cy="140" r="48" fill="#B45309" stroke="#FEF08A" stroke-width="2.5" />
        <text x="140" y="136" text-anchor="middle" font-family="'Bebas Neue', sans-serif" font-size="20" font-weight="900" fill="#FFFFFF" letter-spacing="1">SIKLUS</text>
        <text x="140" y="152" text-anchor="middle" font-family="'Bebas Neue', sans-serif" font-size="12" font-weight="800" fill="#FEF08A" letter-spacing="1">TERPADU</text>
      </svg>
    `;

    // Render Foto Menyatu Organik Tanpa Bingkai Kotak (Soft Feathered Masking & Multiply Blend)
    const renderOrganicPhoto = (uri: string, widthPx: number, heightPx: number, extraStyle = '') => `
      <div class="rsec-organic-photo" style="width: ${widthPx}px; height: ${heightPx}px; ${extraStyle}">
        <img src="${uri}" class="rsec-organic-img" alt="" />
      </div>
    `;

    const renderSectorBullets = (idx: number) => {
      const pt = rPoints[idx]!;
      const cfg = stampConfigs[idx % 6]!;
      const bullets = splitBullets(pt.text);
      return `
        <div class="rsec-point-head" style="color: ${cfg.stampBg};">❖ ${esc(pt.label)}</div>
        <ul class="rsec-list">
          ${bullets.map((b) => `<li>${esc(b)}</li>`).join('')}
        </ul>
      `;
    };

    let html = '';

    if (variantIndex === 0) {
      // =======================================================================
      // VARIAN 0: POLICY NAVIGATION COMPASS (KOMPAS KEBIJAKAN - S-CURVE DYNAMIC)
      // =======================================================================
      // - Pusat: Kompas Navigasi Kebijakan
      // - Alur Foto S-Curve Orbital (Kanan Atas -> Kiri Tengah -> Kanan Luar -> Kiri Bawah -> Kanan Bawah Jangkar)
      // - Bawah: Diisi Foto Jangkar Bawah + Bottom Accountability Belt padat!
      html = `
        <div class="rclock-container">
          <svg class="rclock-svg-wedges" viewBox="0 0 1080 1350" xmlns="http://www.w3.org/2000/svg">
            <polygon points="185,600 185,0 1080,0 1080,260 320,260" fill="#FAF5ED" />
            <polygon points="320,260 1080,260 1080,490 345,490" fill="#F0F8EE" />
            <polygon points="345,490 1080,490 1080,735 340,735" fill="#EBF5FA" />
            <polygon points="340,735 1080,735 1080,980 310,980" fill="#FCF2E8" />
            <polygon points="185,600 310,980 1080,980 1080,1350 185,1350" fill="#F8F3ED" />

            <line x1="320" y1="260" x2="1080" y2="260" stroke="#6E4423" stroke-width="4.5" />
            <line x1="345" y1="490" x2="1080" y2="490" stroke="#6E4423" stroke-width="4.5" />
            <line x1="340" y1="735" x2="1080" y2="735" stroke="#6E4423" stroke-width="4.5" />
            <line x1="310" y1="980" x2="1080" y2="980" stroke="#6E4423" stroke-width="4.5" />
          </svg>

          <!-- Spine Kiri Elegan -->
          <div class="rclock-spine" style="left: 0; width: 185px;">
            <svg class="rsp-map-bg" viewBox="0 0 185 1350" xmlns="http://www.w3.org/2000/svg">
              <path d="M40 80 Q90 120 70 200 T110 350 Q80 480 120 600 T60 850 Q100 1000 70 1200" fill="none" stroke="rgba(254, 240, 138, 0.14)" stroke-width="3" stroke-dasharray="6 4" />
              <path d="M120 150 Q150 280 130 420 T150 700 Q130 920 160 1100" fill="none" stroke="rgba(254, 240, 138, 0.08)" stroke-width="2" />
            </svg>

            <div class="rsp-tag">KOMPAS KEBIJAKAN</div>
            <div class="rsp-chars">
              ${topSpineChars.map((c) => `<span class="rsp-char">${esc(c)}</span>`).join('')}
              <div class="rsp-gap"></div>
              ${botSpineChars.map((c) => `<span class="rsp-char">${esc(c)}</span>`).join('')}
            </div>

            <div class="rsp-bottom">
              <svg width="48" height="34" viewBox="0 0 48 36" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M4 8C14 4 20 8 24 10C28 8 34 4 44 8V30C34 26 28 30 24 32C20 30 14 26 4 30V8Z" fill="#F5EEDC" stroke="#D97706" stroke-width="2"/>
                <path d="M24 10V32" stroke="#451A03" stroke-width="2"/>
              </svg>
              <div class="rsp-sig-title">${esc(signature.split('•')[0] || signature)}</div>
              <div class="rsp-sig-sub">${esc(signature.split('•').slice(1).join('•') || 'DPRD PROVINSI')} • ${currentYear}</div>
              <div class="rsp-kpi-grid">
                <div class="rsp-kpi">
                  <div class="rsp-val">${esc(cleanStats[0]?.value)}</div>
                  <div class="rsp-lbl">${esc(cleanStats[0]?.label)}</div>
                </div>
                <div class="rsp-kpi">
                  <div class="rsp-val">${esc(cleanStats[1]?.value)}</div>
                  <div class="rsp-lbl">${esc(cleanStats[1]?.label)}</div>
                </div>
              </div>
            </div>
          </div>

          <!-- Kompas Navigasi Kebijakan di Kiri -->
          <div class="rclock-watch-pos" style="left: 185px; top: 600px;">
            ${renderCompassSvg(280)}
          </div>

          <!-- Stempel Tahapan -->
          <div class="rclock-stamp" style="left: 235px; top: 440px; transform: rotate(-32deg);">
            <span class="rcs-badge" style="background: ${stampConfigs[0]!.stampBg};">TAHAP I</span>
            <span class="rcs-text">${stampConfigs[0]!.stageName}</span>
          </div>
          <div class="rclock-stamp" style="left: 310px; top: 485px; transform: rotate(-10deg);">
            <span class="rcs-badge" style="background: ${stampConfigs[1]!.stampBg};">TAHAP II</span>
            <span class="rcs-text">${stampConfigs[1]!.stageName}</span>
          </div>
          <div class="rclock-stamp" style="left: 330px; top: 600px;">
            <span class="rcs-badge" style="background: ${stampConfigs[2]!.stampBg};">TAHAP III</span>
            <span class="rcs-text">${stampConfigs[2]!.stageName}</span>
          </div>
          <div class="rclock-stamp" style="left: 310px; top: 715px; transform: rotate(18deg);">
            <span class="rcs-badge" style="background: ${stampConfigs[3]!.stampBg};">TAHAP IV</span>
            <span class="rcs-text">${stampConfigs[3]!.stageName}</span>
          </div>
          <div class="rclock-stamp" style="left: 235px; top: 760px; transform: rotate(45deg);">
            <span class="rcs-badge" style="background: ${stampConfigs[4]!.stampBg};">TAHAP V</span>
            <span class="rcs-text">${stampConfigs[4]!.stageName}</span>
          </div>

          <!-- SEKTOR 0: Teks Kiri + FOTO 0 KANAN ATAS -->
          <div class="rsector-content" style="left: 215px; top: 20px; width: 485px;">
            <div class="rsec-header">
              <div class="rsec-kicker">◈ KRONIK TAHAPAN KEBIJAKAN PUBLIK</div>
              <div class="rsec-headline-sub">${esc(headlineText)}</div>
              <div class="rsec-deck">${esc(copy.deck || '')}</div>
            </div>
            ${renderSectorBullets(0)}
          </div>
          ${renderOrganicPhoto(rPhoto0, 335, 225, 'left: 720px; top: 18px;')}

          <!-- SEKTOR 1 (S-CURVE): FOTO 1 KIRI DEKAT KOMPAS + Teks Kanan -->
          ${renderOrganicPhoto(rPhoto1, 290, 195, 'left: 350px; top: 275px;')}
          <div class="rsector-content" style="left: 665px; top: 285px; width: 385px;">
            ${renderSectorBullets(1)}
          </div>

          <!-- SEKTOR 2 (S-CURVE): Teks Kiri Dekat Kompas + FOTO 2 KANAN LUAR -->
          <div class="rsector-content" style="left: 360px; top: 515px; width: 345px;">
            ${renderSectorBullets(2)}
            <div class="rsec-kpi-pill">
              <span class="rkp-badge">TARGET: ${esc(cleanStats[3]?.value)}</span>
              <span class="rkp-note">${esc(cleanStats[1]?.value)}</span>
            </div>
          </div>
          ${renderOrganicPhoto(rPhoto2, 335, 215, 'left: 720px; top: 505px;')}

          <!-- SEKTOR 3 (S-CURVE): FOTO 3 KIRI DEKAT KOMPAS + Teks Kanan -->
          ${renderOrganicPhoto(rPhoto3, 290, 205, 'left: 350px; top: 750px;')}
          <div class="rsector-content" style="left: 665px; top: 760px; width: 385px;">
            ${renderSectorBullets(3)}
          </div>

          <!-- SEKTOR 4 & 5 (BAGIAN BAWAH PADAT): Teks Kiri + FOTO JANGKAR BAWAH KANAN -->
          <div class="rsector-content" style="left: 215px; top: 1000px; width: 440px;">
            ${renderSectorBullets(4)}
          </div>
          <div class="rsector-content" style="left: 215px; top: 1115px; width: 440px;">
            ${renderSectorBullets(5)}
          </div>
          ${renderOrganicPhoto(rPhoto0, 360, 215, 'left: 685px; top: 995px;')}

          <!-- PITA AKUNTABILITAS BAWAH (BOTTOM ACCOUNTABILITY BELT PADAT) -->
          <div class="rclock-bottom-belt" style="left: 215px; top: 1235px; width: 835px;">
            <div class="rbb-left">
              <div class="rbb-badge">✦ VERIFIKASI RESMI • DOKUMEN ADVOKASI PUBLIK ✦</div>
              <div class="rbb-quote">${esc(copy.closingLine || 'Kesinambungan kebijakan publik dirasakan langsung oleh masyarakat daerah.')}</div>
            </div>
            <div class="rbb-right">
              <div class="rbb-stat">
                <div class="rbb-val">${esc(cleanStats[2]?.value)}</div>
                <div class="rbb-lbl">${esc(cleanStats[2]?.label)}</div>
              </div>
              <div class="rbb-stat">
                <div class="rbb-val">${esc(cleanStats[3]?.value)}</div>
                <div class="rbb-lbl">${esc(cleanStats[3]?.label)}</div>
              </div>
            </div>
          </div>
        </div>
      `;
    } else if (variantIndex === 1) {
      // =======================================================================
      // VARIAN 1: OFFICIAL LEGISLATIVE SEAL (SEGEL MEDALI EMAS RESMI - RIGHT SPINE)
      // =======================================================================
      // - Pusat: Segel Medali Emas Resmi
      // - Spine di Kanan, Alur Foto S-Curve Dinamis di Kiri-Tengah
      // - Bawah: Foto Jangkar Bawah Kiri + Bottom Accountability Belt padat!
      html = `
        <div class="rclock-container">
          <svg class="rclock-svg-wedges" viewBox="0 0 1080 1350" xmlns="http://www.w3.org/2000/svg">
            <polygon points="895,600 895,0 0,0 0,260 760,260" fill="#FAF5ED" />
            <polygon points="760,260 0,260 0,490 735,490" fill="#F0F8EE" />
            <polygon points="735,490 0,490 0,735 740,735" fill="#EBF5FA" />
            <polygon points="740,735 0,735 0,980 770,980" fill="#FCF2E8" />
            <polygon points="895,600 770,980 0,980 0,1350 895,1350" fill="#F8F3ED" />

            <line x1="760" y1="260" x2="0" y2="260" stroke="#6E4423" stroke-width="4.5" />
            <line x1="735" y1="490" x2="0" y2="490" stroke="#6E4423" stroke-width="4.5" />
            <line x1="740" y1="735" x2="0" y2="735" stroke="#6E4423" stroke-width="4.5" />
            <line x1="770" y1="980" x2="0" y2="980" stroke="#6E4423" stroke-width="4.5" />
          </svg>

          <!-- Spine Kanan Elegan -->
          <div class="rclock-spine" style="right: 0; width: 185px; border-left: 3.5px solid #150A03; border-right: none;">
            <div class="rsp-tag">SEGEL RESMI</div>
            <div class="rsp-chars">
              ${topSpineChars.map((c) => `<span class="rsp-char">${esc(c)}</span>`).join('')}
              <div class="rsp-gap"></div>
              ${botSpineChars.map((c) => `<span class="rsp-char">${esc(c)}</span>`).join('')}
            </div>
            <div class="rsp-bottom">
              <div class="rsp-sig-title">${esc(signature.split('•')[0] || signature)}</div>
              <div class="rsp-sig-sub">${esc(signature.split('•').slice(1).join('•') || 'DPRD PROVINSI')} • ${currentYear}</div>
              <div class="rsp-kpi-grid">
                <div class="rsp-kpi">
                  <div class="rsp-val">${esc(cleanStats[2]?.value)}</div>
                  <div class="rsp-lbl">${esc(cleanStats[2]?.label)}</div>
                </div>
                <div class="rsp-kpi">
                  <div class="rsp-val">${esc(cleanStats[3]?.value)}</div>
                  <div class="rsp-lbl">${esc(cleanStats[3]?.label)}</div>
                </div>
              </div>
            </div>
          </div>

          <!-- Segel Medali Emas Resmi di Kanan -->
          <div class="rclock-watch-pos" style="left: 895px; top: 600px;">
            ${renderSealSvg(280)}
          </div>

          <!-- Stempel Tahapan Segel -->
          <div class="rclock-stamp" style="right: 235px; top: 440px; transform: rotate(32deg);">
            <span class="rcs-badge" style="background: ${stampConfigs[0]!.stampBg};">TAHAP I</span>
            <span class="rcs-text">${stampConfigs[0]!.stageName}</span>
          </div>
          <div class="rclock-stamp" style="right: 310px; top: 485px; transform: rotate(10deg);">
            <span class="rcs-badge" style="background: ${stampConfigs[1]!.stampBg};">TAHAP II</span>
            <span class="rcs-text">${stampConfigs[1]!.stageName}</span>
          </div>
          <div class="rclock-stamp" style="right: 330px; top: 600px;">
            <span class="rcs-badge" style="background: ${stampConfigs[2]!.stampBg};">TAHAP III</span>
            <span class="rcs-text">${stampConfigs[2]!.stageName}</span>
          </div>
          <div class="rclock-stamp" style="right: 310px; top: 715px; transform: rotate(-18deg);">
            <span class="rcs-badge" style="background: ${stampConfigs[3]!.stampBg};">TAHAP IV</span>
            <span class="rcs-text">${stampConfigs[3]!.stageName}</span>
          </div>
          <div class="rclock-stamp" style="right: 235px; top: 760px; transform: rotate(-45deg);">
            <span class="rcs-badge" style="background: ${stampConfigs[4]!.stampBg};">TAHAP V</span>
            <span class="rcs-text">${stampConfigs[4]!.stageName}</span>
          </div>

          <!-- SEKTOR 0 (MIRROR): FOTO 0 KIRI ATAS + Teks Kanan -->
          ${renderOrganicPhoto(rPhoto0, 335, 225, 'left: 25px; top: 18px;')}
          <div class="rsector-content" style="left: 385px; top: 20px; width: 480px;">
            <div class="rsec-header">
              <div class="rsec-kicker">◈ KRONIK TAHAPAN KEBIJAKAN PUBLIK</div>
              <div class="rsec-headline-sub">${esc(headlineText)}</div>
              <div class="rsec-deck">${esc(copy.deck || '')}</div>
            </div>
            ${renderSectorBullets(0)}
          </div>

          <!-- SEKTOR 1 (MIRROR S-CURVE): Teks Kiri + FOTO 1 KANAN DEKAT SEGEL -->
          <div class="rsector-content" style="left: 25px; top: 285px; width: 385px;">
            ${renderSectorBullets(1)}
          </div>
          ${renderOrganicPhoto(rPhoto1, 290, 195, 'left: 435px; top: 275px;')}

          <!-- SEKTOR 2 (MIRROR S-CURVE): FOTO 2 KIRI LUAR + Teks Kanan Dekat Segel -->
          ${renderOrganicPhoto(rPhoto2, 335, 215, 'left: 25px; top: 505px;')}
          <div class="rsector-content" style="left: 385px; top: 515px; width: 345px;">
            ${renderSectorBullets(2)}
            <div class="rsec-kpi-pill" style="margin-left: 0;">
              <span class="rkp-badge">TARGET: ${esc(cleanStats[3]?.value)}</span>
              <span class="rkp-note">${esc(cleanStats[1]?.value)}</span>
            </div>
          </div>

          <!-- SEKTOR 3 (MIRROR S-CURVE): Teks Kiri + FOTO 3 KANAN DEKAT SEGEL -->
          <div class="rsector-content" style="left: 25px; top: 760px; width: 385px;">
            ${renderSectorBullets(3)}
          </div>
          ${renderOrganicPhoto(rPhoto3, 290, 205, 'left: 435px; top: 750px;')}

          <!-- SEKTOR 4 & 5 (BAGIAN BAWAH PADAT): FOTO JANGKAR KIRI + Teks Kanan -->
          ${renderOrganicPhoto(rPhoto0, 360, 215, 'left: 25px; top: 995px;')}
          <div class="rsector-content" style="left: 415px; top: 1000px; width: 450px;">
            ${renderSectorBullets(4)}
          </div>
          <div class="rsector-content" style="left: 415px; top: 1115px; width: 450px;">
            ${renderSectorBullets(5)}
          </div>

          <!-- PITA AKUNTABILITAS BAWAH (BOTTOM ACCOUNTABILITY BELT PADAT) -->
          <div class="rclock-bottom-belt" style="left: 25px; top: 1235px; width: 840px;">
            <div class="rbb-left">
              <div class="rbb-badge">✦ VERIFIKASI RESMI • DOKUMEN ADVOKASI PUBLIK ✦</div>
              <div class="rbb-quote">${esc(copy.closingLine || 'Kesinambungan kebijakan publik dirasakan langsung oleh masyarakat daerah.')}</div>
            </div>
            <div class="rbb-right">
              <div class="rbb-stat">
                <div class="rbb-val">${esc(cleanStats[0]?.value)}</div>
                <div class="rbb-lbl">${esc(cleanStats[0]?.label)}</div>
              </div>
              <div class="rbb-stat">
                <div class="rbb-val">${esc(cleanStats[1]?.value)}</div>
                <div class="rbb-lbl">${esc(cleanStats[1]?.label)}</div>
              </div>
            </div>
          </div>
        </div>
      `;
    } else if (variantIndex === 2) {
      // =======================================================================
      // VARIAN 2: PROGRESS PERFORMANCE METER (DIAL GAUGE KINERJA CAPAIAN)
      // =======================================================================
      // - Pusat: Dial Gauge Speedometer Kinerja Capaian % Riil
      // - Alur Foto S-Curve Zig-Zag Dinamis
      // - Bawah: Diisi Foto Jangkar Bawah + Bottom Metric Dashboard padat!
      html = `
        <div class="rclock-container">
          <svg class="rclock-svg-wedges" viewBox="0 0 1080 1350" xmlns="http://www.w3.org/2000/svg">
            <polygon points="185,600 185,0 1080,0 1080,260 320,260" fill="#FAF5ED" />
            <polygon points="320,260 1080,260 1080,490 345,490" fill="#F0F8EE" />
            <polygon points="345,490 1080,490 1080,735 340,735" fill="#EBF5FA" />
            <polygon points="340,735 1080,735 1080,980 310,980" fill="#FCF2E8" />
            <polygon points="185,600 310,980 1080,980 1080,1350 185,1350" fill="#F8F3ED" />

            <line x1="320" y1="260" x2="1080" y2="260" stroke="#6E4423" stroke-width="4.5" />
            <line x1="345" y1="490" x2="1080" y2="490" stroke="#6E4423" stroke-width="4.5" />
            <line x1="340" y1="735" x2="1080" y2="735" stroke="#6E4423" stroke-width="4.5" />
            <line x1="310" y1="980" x2="1080" y2="980" stroke="#6E4423" stroke-width="4.5" />
          </svg>

          <!-- Spine Kiri -->
          <div class="rclock-spine" style="left: 0; width: 185px;">
            <div class="rsp-tag">INDIKATOR KINERJA</div>
            <div class="rsp-chars">
              ${topSpineChars.map((c) => `<span class="rsp-char">${esc(c)}</span>`).join('')}
              <div class="rsp-gap"></div>
              ${botSpineChars.map((c) => `<span class="rsp-char">${esc(c)}</span>`).join('')}
            </div>
            <div class="rsp-bottom">
              <div class="rsp-sig-title">${esc(signature.split('•')[0] || signature)}</div>
              <div class="rsp-sig-sub">${esc(signature.split('•').slice(1).join('•') || 'DPRD PROVINSI')} • ${currentYear}</div>
              <div class="rsp-kpi-grid">
                <div class="rsp-kpi">
                  <div class="rsp-val">${esc(cleanStats[0]?.value)}</div>
                  <div class="rsp-lbl">${esc(cleanStats[0]?.label)}</div>
                </div>
                <div class="rsp-kpi">
                  <div class="rsp-val">${esc(cleanStats[1]?.value)}</div>
                  <div class="rsp-lbl">${esc(cleanStats[1]?.label)}</div>
                </div>
              </div>
            </div>
          </div>

          <!-- Dial Gauge Speedometer di Kiri -->
          <div class="rclock-watch-pos" style="left: 185px; top: 600px;">
            ${renderGaugeSvg(280, cleanStats[0]?.value || '85%')}
          </div>

          <!-- Stempel Indikator -->
          <div class="rclock-stamp" style="left: 235px; top: 440px; transform: rotate(-32deg);">
            <span class="rcs-badge" style="background: ${stampConfigs[0]!.stampBg};">TAHAP I</span>
            <span class="rcs-text">${stampConfigs[0]!.stageName}</span>
          </div>
          <div class="rclock-stamp" style="left: 310px; top: 485px; transform: rotate(-10deg);">
            <span class="rcs-badge" style="background: ${stampConfigs[1]!.stampBg};">TAHAP II</span>
            <span class="rcs-text">${stampConfigs[1]!.stageName}</span>
          </div>
          <div class="rclock-stamp" style="left: 330px; top: 600px;">
            <span class="rcs-badge" style="background: ${stampConfigs[2]!.stampBg};">TAHAP III</span>
            <span class="rcs-text">${stampConfigs[2]!.stageName}</span>
          </div>
          <div class="rclock-stamp" style="left: 310px; top: 715px; transform: rotate(18deg);">
            <span class="rcs-badge" style="background: ${stampConfigs[3]!.stampBg};">TAHAP IV</span>
            <span class="rcs-text">${stampConfigs[3]!.stageName}</span>
          </div>
          <div class="rclock-stamp" style="left: 235px; top: 760px; transform: rotate(45deg);">
            <span class="rcs-badge" style="background: ${stampConfigs[4]!.stampBg};">TAHAP V</span>
            <span class="rcs-text">${stampConfigs[4]!.stageName}</span>
          </div>

          <!-- Sektor 0: Teks Kiri + FOTO 0 KANAN ATAS -->
          <div class="rsector-content" style="left: 215px; top: 20px; width: 485px;">
            <div class="rsec-header">
              <div class="rsec-kicker">◈ AUDIT KINERJA PROGRAM PUBLIK</div>
              <div class="rsec-headline-sub">${esc(headlineText)}</div>
              <div class="rsec-deck">${esc(copy.deck || '')}</div>
            </div>
            ${renderSectorBullets(0)}
          </div>
          ${renderOrganicPhoto(rPhoto0, 335, 225, 'left: 720px; top: 18px;')}

          <!-- Sektor 1 (ZIG-ZAG): FOTO 1 KIRI + Teks Kanan -->
          ${renderOrganicPhoto(rPhoto1, 290, 195, 'left: 350px; top: 275px;')}
          <div class="rsector-content" style="left: 665px; top: 285px; width: 385px;">
            ${renderSectorBullets(1)}
          </div>

          <!-- Sektor 2 (ZIG-ZAG): Teks Kiri + FOTO 2 KANAN -->
          <div class="rsector-content" style="left: 360px; top: 515px; width: 345px;">
            ${renderSectorBullets(2)}
            <div class="rsec-kpi-pill">
              <span class="rkp-badge">REALISASI: ${esc(cleanStats[0]?.value)}</span>
              <span class="rkp-note">${esc(cleanStats[1]?.value)}</span>
            </div>
          </div>
          ${renderOrganicPhoto(rPhoto2, 335, 215, 'left: 720px; top: 505px;')}

          <!-- Sektor 3 (ZIG-ZAG): FOTO 3 KIRI + Teks Kanan -->
          ${renderOrganicPhoto(rPhoto3, 290, 205, 'left: 350px; top: 750px;')}
          <div class="rsector-content" style="left: 665px; top: 760px; width: 385px;">
            ${renderSectorBullets(3)}
          </div>

          <!-- Sektor 4 & 5 (BAGIAN BAWAH PADAT): Teks Kiri + FOTO JANGKAR BAWAH KANAN -->
          <div class="rsector-content" style="left: 215px; top: 1000px; width: 440px;">
            ${renderSectorBullets(4)}
          </div>
          <div class="rsector-content" style="left: 215px; top: 1115px; width: 440px;">
            ${renderSectorBullets(5)}
          </div>
          ${renderOrganicPhoto(rPhoto0, 360, 215, 'left: 685px; top: 995px;')}

          <!-- PITA AKUNTABILITAS BAWAH (BOTTOM ACCOUNTABILITY BELT PADAT) -->
          <div class="rclock-bottom-belt" style="left: 215px; top: 1235px; width: 835px;">
            <div class="rbb-left">
              <div class="rbb-badge">✦ EVALUASI AKHIR & STANDAR KELAYAKAN ✦</div>
              <div class="rbb-quote">${esc(copy.closingLine || 'Kesinambungan kebijakan publik dirasakan langsung oleh masyarakat daerah.')}</div>
            </div>
            <div class="rbb-right">
              <div class="rbb-stat">
                <div class="rbb-val">${esc(cleanStats[2]?.value)}</div>
                <div class="rbb-lbl">${esc(cleanStats[2]?.label)}</div>
              </div>
              <div class="rbb-stat">
                <div class="rbb-val">${esc(cleanStats[3]?.value)}</div>
                <div class="rbb-lbl">${esc(cleanStats[3]?.label)}</div>
              </div>
            </div>
          </div>
        </div>
      `;
    } else {
      // =======================================================================
      // VARIAN 3: RADIAL MILESTONE CYCLE HUB (PUSAT RODA SIKLUS TERPADU)
      // =======================================================================
      // - Pusat: Hub Roda Siklus 4 Tahap Terpadu
      // - Header Mewah Melintang + 4 Kuadran Seimbang
      // - Bawah: Konsolidasi Dampak Melintang Penuh (Zero Void)
      html = `
        <div class="rclock-container">
          <svg class="rclock-svg-wedges" viewBox="0 0 1080 1350" xmlns="http://www.w3.org/2000/svg">
            <polygon points="0,110 540,110 540,690 0,690" fill="#FAF5ED" />
            <polygon points="540,110 1080,110 1080,690 540,690" fill="#F0F8EE" />
            <polygon points="0,690 540,690 540,1190 0,1190" fill="#EBF5FA" />
            <polygon points="540,690 1080,690 1080,1190 540,1190" fill="#FCF2E8" />
            <polygon points="0,1190 1080,1190 1080,1350 0,1350" fill="#F8F3ED" />

            <line x1="540" y1="110" x2="540" y2="1190" stroke="#6E4423" stroke-width="4.5" />
            <line x1="0" y1="690" x2="1080" y2="690" stroke="#6E4423" stroke-width="4.5" />
            <line x1="0" y1="1190" x2="1080" y2="1190" stroke="#6E4423" stroke-width="4.5" />
          </svg>

          <!-- Header Mewah Atas (1080 x 110) -->
          <div style="position: absolute; top: 0; left: 0; right: 0; height: 110px; background: linear-gradient(180deg, #3A2010 0%, #241308 100%); border-bottom: 3.5px solid #150A03; display: flex; align-items: center; justify-content: space-between; padding: 14px 36px; z-index: 20; box-sizing: border-box;">
            <div>
              <div style="font-size: 10px; font-weight: 800; color: #FEF08A; letter-spacing: 1.5px; text-transform: uppercase;">◈ KRONIK ADVOKASI PUBLIK • SIKLUS KEBIJAKAN TERPADU</div>
              <div style="font-family: 'Bebas Neue', sans-serif; font-size: 38px; color: #FFFFFF; letter-spacing: 1.2px; line-height: 1;">${esc(headlineText)}</div>
            </div>
            <div style="display: flex; gap: 8px;">
              ${cleanStats.slice(0, 4).map((st) => `
                <div style="background: rgba(0,0,0,0.4); border: 1px solid rgba(254,240,138,0.4); border-radius: 3px; padding: 3px 10px; text-align: center;">
                  <div style="font-family: 'Bebas Neue', sans-serif; font-size: 18px; color: #FEF08A; line-height: 1;">${esc(st.value)}</div>
                  <div style="font-size: 7px; font-weight: 800; color: #FFFFFF; text-transform: uppercase;">${esc(st.label)}</div>
                </div>
              `).join('')}
            </div>
          </div>

          <!-- Hub Siklus Terpadu di Pusat Persilangan (540, 690) -->
          <div class="rclock-watch-pos" style="left: 540px; top: 690px; z-index: 30;">
            ${renderHubSvg(260)}
          </div>

          <!-- Stempel di 4 Titik Hub -->
          <div class="rclock-stamp" style="left: 360px; top: 580px; transform: rotate(-25deg);">
            <span class="rcs-badge" style="background: ${stampConfigs[0]!.stampBg};">TAHAP I</span>
            <span class="rcs-text">${stampConfigs[0]!.stageName}</span>
          </div>
          <div class="rclock-stamp" style="left: 600px; top: 580px; transform: rotate(25deg);">
            <span class="rcs-badge" style="background: ${stampConfigs[1]!.stampBg};">TAHAP II</span>
            <span class="rcs-text">${stampConfigs[1]!.stageName}</span>
          </div>
          <div class="rclock-stamp" style="left: 360px; top: 780px; transform: rotate(25deg);">
            <span class="rcs-badge" style="background: ${stampConfigs[2]!.stampBg};">TAHAP III</span>
            <span class="rcs-text">${stampConfigs[2]!.stageName}</span>
          </div>
          <div class="rclock-stamp" style="left: 600px; top: 780px; transform: rotate(-25deg);">
            <span class="rcs-badge" style="background: ${stampConfigs[3]!.stampBg};">TAHAP IV</span>
            <span class="rcs-text">${stampConfigs[3]!.stageName}</span>
          </div>

          <!-- Kuadran 1 (Kiri Atas) -->
          <div class="rsector-content" style="left: 36px; top: 130px; width: 460px;">
            ${renderSectorBullets(0)}
          </div>
          ${renderOrganicPhoto(rPhoto0, 250, 180, 'left: 250px; top: 370px;')}

          <!-- Kuadran 2 (Kanan Atas) -->
          <div class="rsector-content" style="left: 576px; top: 130px; width: 460px;">
            ${renderSectorBullets(1)}
          </div>
          ${renderOrganicPhoto(rPhoto1, 250, 180, 'left: 790px; top: 370px;')}

          <!-- Kuadran 3 (Kiri Tengah Bawah) -->
          ${renderOrganicPhoto(rPhoto2, 250, 180, 'left: 40px; top: 730px;')}
          <div class="rsector-content" style="left: 40px; top: 930px; width: 460px;">
            ${renderSectorBullets(2)}
          </div>

          <!-- Kuadran 4 (Kanan Tengah Bawah) -->
          ${renderOrganicPhoto(rPhoto3, 250, 180, 'left: 790px; top: 730px;')}
          <div class="rsector-content" style="left: 576px; top: 930px; width: 460px;">
            ${renderSectorBullets(3)}
          </div>

          <!-- SEKSI BAWAH MELINTANG PADAT: EVALUASI & AKUNTABILITAS SIKLUS -->
          <div class="rclock-bottom-belt" style="left: 36px; top: 1205px; width: 1008px;">
            <div class="rbb-left" style="flex: 1;">
              <div class="rbb-badge">✦ EVALUASI & DAMPAK KEBIJAKAN BERKELANJUTAN ✦</div>
              <div class="rbb-quote">${esc(rPoints[4]?.text || copy.deck || '')}</div>
              <div style="font-size: 10px; font-weight: 700; color: #FDE68A; margin-top: 4px;">${esc(copy.closingLine || '')}</div>
            </div>
            <div class="rbb-right" style="border-left: 1px solid rgba(254, 240, 138, 0.3); padding-left: 20px;">
              <div class="rbb-stat">
                <div class="rbb-val">${esc(cleanStats[0]?.value)}</div>
                <div class="rbb-lbl">${esc(cleanStats[0]?.label)}</div>
              </div>
              <div class="rbb-stat">
                <div class="rbb-val">${esc(cleanStats[1]?.value)}</div>
                <div class="rbb-lbl">${esc(cleanStats[1]?.label)}</div>
              </div>
            </div>
          </div>
        </div>
      `;
    }

    const css = `
      /* FULL-BLEED ZERO MARGIN 1080 x 1350 INFOGRAPHIC CONTAINER */
      .edition-tag, .footer-zone {
        display: none !important;
      }
      .rclock-container {
        position: absolute;
        top: 0;
        left: 0;
        width: 1080px;
        height: 1350px;
        background: #FFFDF9;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
        color: #1E293B;
        box-sizing: border-box;
        overflow: hidden;
        margin: 0 !important;
        padding: 0 !important;
        border: none !important;
        z-index: 10;
      }

      /* SVG Pure Sunburst Wedges Full-Bleed 1080 x 1350 */
      .rclock-svg-wedges {
        position: absolute;
        top: 0;
        left: 0;
        width: 1080px;
        height: 1350px;
        z-index: 1;
      }

      /* Centerpiece Anchor */
      .rclock-watch-pos {
        position: absolute;
        z-index: 25;
        transform: translate(-50%, -50%);
      }

      /* Vertical Wooden/Parchment Spine Full Height 1350px */
      .rclock-spine {
        position: absolute;
        top: 0;
        bottom: 0;
        background: linear-gradient(180deg, #3A2010 0%, #241308 55%, #150A03 100%);
        border-right: 3.5px solid #150A03;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: space-between;
        padding: 24px 8px 18px 8px;
        z-index: 10;
        box-shadow: 6px 0 20px rgba(0, 0, 0, 0.4);
        box-sizing: border-box;
      }
      .rsp-map-bg {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 1350px;
        pointer-events: none;
        z-index: 1;
      }
      .rsp-tag {
        font-size: 9.5px;
        font-weight: 900;
        letter-spacing: 2px;
        color: #FEF08A;
        background: rgba(0, 0, 0, 0.45);
        padding: 4px 10px;
        border-radius: 3px;
        border: 1px solid rgba(254, 240, 138, 0.45);
        text-transform: uppercase;
        text-align: center;
        z-index: 5;
      }
      .rsp-chars {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: space-between;
        flex: 1;
        padding: 12px 0;
        z-index: 5;
      }
      .rsp-char {
        font-family: Georgia, 'Times New Roman', serif;
        font-size: 44px;
        font-weight: 900;
        color: #FFFFFF;
        text-shadow: 0 4px 10px rgba(0, 0, 0, 0.7), 2px 2px 0 #78350F;
        line-height: 0.95;
      }
      .rsp-gap {
        height: 270px;
      }
      .rsp-bottom {
        width: 100%;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 6px;
        z-index: 5;
      }
      .rsp-sig-title {
        font-family: 'Bebas Neue', sans-serif;
        font-size: 17px;
        color: #FFFFFF;
        letter-spacing: 1.2px;
        text-align: center;
      }
      .rsp-sig-sub {
        font-size: 7.5px;
        font-weight: 800;
        color: #FDE68A;
        letter-spacing: 0.5px;
        text-align: center;
      }
      .rsp-kpi-grid {
        width: 100%;
        display: flex;
        flex-direction: column;
        gap: 4px;
        margin-top: 4px;
      }
      .rsp-kpi {
        background: rgba(0, 0, 0, 0.45);
        border: 1px solid rgba(254, 240, 138, 0.35);
        border-radius: 3px;
        padding: 3px 6px;
        text-align: center;
      }
      .rsp-val {
        font-family: 'Bebas Neue', sans-serif;
        font-size: 17px;
        color: #FEF08A;
        line-height: 1;
        letter-spacing: 0.5px;
      }
      .rsp-lbl {
        font-size: 6.5px;
        font-weight: 800;
        color: #FFFFFF;
        letter-spacing: 0.4px;
        text-transform: uppercase;
      }

      /* Curved Stamping Badges along Dial Perimeter */
      .rclock-stamp {
        position: absolute;
        display: inline-flex;
        align-items: center;
        background: #FFFFFF;
        border: 2px solid #2D1708;
        border-radius: 4px;
        padding: 2.5px 7px;
        gap: 5px;
        box-shadow: 0 4px 10px rgba(0,0,0,0.22);
        z-index: 28;
        white-space: nowrap;
      }
      .rcs-badge {
        font-family: 'Bebas Neue', sans-serif;
        font-size: 13px;
        color: #FFFFFF;
        padding: 1px 5px;
        border-radius: 2px;
        letter-spacing: 0.8px;
      }
      .rcs-text {
        font-size: 9px;
        font-weight: 900;
        color: #1F2937;
        letter-spacing: 0.8px;
        text-transform: uppercase;
      }

      /* Organic Blended Documentary Photos (Feathered Silhouette / No Square Frames) */
      .rsec-organic-photo {
        position: absolute;
        z-index: 8;
        display: flex;
        align-items: center;
        justify-content: center;
        overflow: hidden;
        border: none !important;
        background: transparent !important;
        box-shadow: none !important;
      }
      .rsec-organic-img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        mask-image: radial-gradient(ellipse at center, rgba(0,0,0,1) 42%, rgba(0,0,0,0.85) 60%, rgba(0,0,0,0) 90%);
        -webkit-mask-image: radial-gradient(ellipse at center, rgba(0,0,0,1) 42%, rgba(0,0,0,0.85) 60%, rgba(0,0,0,0) 90%);
        mix-blend-mode: multiply;
        filter: contrast(1.18) sepia(0.2) brightness(0.96);
      }

      /* Sector Text Blocks */
      .rsector-content {
        position: absolute;
        z-index: 15;
        box-sizing: border-box;
      }
      .rsec-header {
        margin-bottom: 8px;
      }
      .rsec-kicker {
        font-size: 10px;
        font-weight: 800;
        color: #B45309;
        letter-spacing: 1px;
        text-transform: uppercase;
        margin-bottom: 2px;
      }
      .rsec-headline-sub {
        font-family: 'Bebas Neue', sans-serif;
        font-size: 34px;
        line-height: 0.95;
        color: #1E293B;
        letter-spacing: 1px;
        margin-bottom: 4px;
      }
      .rsec-deck {
        font-size: 10.5px;
        line-height: 1.35;
        color: #475569;
        font-weight: 500;
        margin-bottom: 6px;
      }
      .rsec-point-head {
        font-size: 12px;
        font-weight: 900;
        letter-spacing: 0.6px;
        text-transform: uppercase;
        margin-bottom: 4px;
      }
      .rsec-list {
        margin: 0;
        padding-left: 14px;
        list-style-type: square;
      }
      .rsec-list li {
        font-size: 11px;
        line-height: 1.38;
        color: #1F2937;
        font-weight: 600;
        margin-bottom: 4px;
      }

      .rsec-kpi-pill {
        display: inline-flex;
        align-items: center;
        gap: 8px;
        background: rgba(2, 132, 199, 0.14);
        border: 1px solid #0284C7;
        border-radius: 3px;
        padding: 3px 10px;
        width: fit-content;
        margin-top: 6px;
        margin-left: 140px;
      }
      .rkp-badge {
        font-family: 'Bebas Neue', sans-serif;
        font-size: 16px;
        color: #0369A1;
        letter-spacing: 0.8px;
      }
      .rkp-note {
        font-size: 10px;
        font-weight: 700;
        color: #0F172A;
      }

      /* PITA AKUNTABILITAS BAWAH (BOTTOM ACCOUNTABILITY BELT PADAT) */
      .rclock-bottom-belt {
        position: absolute;
        z-index: 22;
        background: linear-gradient(135deg, #1E293B 0%, #0F172A 100%);
        border: 2px solid #D97706;
        border-radius: 6px;
        padding: 10px 18px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 16px;
        box-shadow: 0 8px 24px rgba(0, 0, 0, 0.35);
        box-sizing: border-box;
      }
      .rbb-left {
        display: flex;
        flex-direction: column;
        gap: 3px;
      }
      .rbb-badge {
        font-size: 9px;
        font-weight: 900;
        letter-spacing: 1.5px;
        color: #FEF08A;
        text-transform: uppercase;
      }
      .rbb-quote {
        font-size: 11px;
        line-height: 1.35;
        font-weight: 600;
        color: #F8FAFC;
        max-width: 540px;
      }
      .rbb-right {
        display: flex;
        align-items: center;
        gap: 12px;
      }
      .rbb-stat {
        background: rgba(255, 255, 255, 0.08);
        border: 1px solid rgba(254, 240, 138, 0.35);
        border-radius: 4px;
        padding: 4px 10px;
        text-align: center;
        min-width: 80px;
      }
      .rbb-val {
        font-family: 'Bebas Neue', sans-serif;
        font-size: 20px;
        line-height: 1;
        color: #FEF08A;
        letter-spacing: 0.8px;
      }
      .rbb-lbl {
        font-size: 7px;
        font-weight: 800;
        color: #FFFFFF;
        letter-spacing: 0.5px;
        text-transform: uppercase;
        margin-top: 2px;
      }
    `;

    return { html, css };
  }
  if (archetype === 'INFOGRAPHIC_ADVOCACY_PILLARS') {
    // =========================================================================
    // TEMPLATE 04: ADVOKASI DATA & 5 PILAR AKSI KERAKYATAN
    // Standar Master Emas: Background Batik Terracotta, Header Tengah Monumental,
    // Kartu Statistik Hijau Pejal (#14532D) di Tengah, Banner Aksi,
    // dan 5 Pilar Kapsul Vertikal Berdampingan (P-U-T-U-S / 01-05).
    // =========================================================================

    // Acronym letters / badges for the 5 pillars (Default to P-U-T-U-S if applicable, or 01-05)
    const defaultPillarLetters = ['P', 'U', 'T', 'U', 'S'];
    const masterCanvasBg = params.bgBase64 || '';
    const secondaryCanvasBg = (params.photoSlots && params.photoSlots[0]) ? params.photoSlots[0] : '';
    const signature = params.signature || 'DR. JONANDA P. A. B • DPRD PROVINSI • DAPIL JABAR';
    const pillarIcons = [
      // 1. Peduli / Heart / Solidarity
      `<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#F59E0B" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>`,
      // 2. Keadilan / Scale of Justice
      `<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#F59E0B" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="m16 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z"/><path d="m2 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z"/><path d="M7 21h10"/><path d="M12 3v18"/><path d="M3 7h2c2 0 5-1 7-2 2 1 5 2 7 2h2"/></svg>`,
      // 3. Tolong / Hands Giving / Aid
      `<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#F59E0B" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 15h2a2 2 0 1 0 0-4h-3c-.6 0-1.1.2-1.4.6L3 17"/><path d="m7 21 1.6-1.4c.3-.4.8-.6 1.4-.6h4c1.1 0 2.1-.4 2.8-1.2l4.6-4.4a2 2 0 0 0-2.8-2.8L15 14"/><path d="M14 9V5a2 2 0 0 0-2-2h-1c-.6 0-1.1.2-1.4.6L6 8"/></svg>`,
      // 4. Ubah / Growth / Trending Up
      `<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#F59E0B" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="m22 7-8.5 8.5-5-5L2 17"/><path d="M16 7h6v6"/></svg>`,
      // 5. Satukan / Shield / Unity
      `<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#F59E0B" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/><path d="m9 12 2 2 4-4"/></svg>`
    ];

    const pillarBottomEmblems = [
      // 1. Solidaritas / Sahabat merangkul
      `<svg width="56" height="56" viewBox="0 0 48 48" fill="none">
        <circle cx="24" cy="24" r="22" fill="#FFFFFF" stroke="#F59E0B" stroke-width="2.5"/>
        <circle cx="17" cy="18" r="5" fill="#F59E0B"/>
        <circle cx="31" cy="18" r="5" fill="#EA580C"/>
        <path d="M10 36c0-5 3.5-9 9-9 1.8 0 3.5.5 5 1.4 1.5-.9 3.2-1.4 5-1.4 5.5 0 9 4 9 9v2H10v-2z" fill="#047857"/>
        <path d="M19 28c3 2 7 2 10 0" stroke="#FDE68A" stroke-width="2.5" stroke-linecap="round"/>
      </svg>`,
      // 2. Keadilan / Timbangan hukum emas
      `<svg width="56" height="56" viewBox="0 0 48 48" fill="none">
        <circle cx="24" cy="24" r="22" fill="#FFFFFF" stroke="#F59E0B" stroke-width="2.5"/>
        <path d="M24 10v26M18 36h12" stroke="#B45309" stroke-width="2.5" stroke-linecap="round"/>
        <path d="M12 16h24" stroke="#B45309" stroke-width="2.5" stroke-linecap="round"/>
        <path d="M12 16l-4 9h8l-4-9zM36 16l-4 9h8l-4-9z" fill="#F59E0B" stroke="#B45309" stroke-width="1.8"/>
      </svg>`,
      // 3. Tolong Warga / Tangan memberi bantuan
      `<svg width="56" height="56" viewBox="0 0 48 48" fill="none">
        <circle cx="24" cy="24" r="22" fill="#FFFFFF" stroke="#F59E0B" stroke-width="2.5"/>
        <path d="M13 22h22v4a9 9 0 0 1-9 9h-4a9 9 0 0 1-9-9v-4z" fill="#EA580C" stroke="#B45309" stroke-width="1.8"/>
        <path d="M20 13c0 2-2 3-2 5M24 11c0 2.5-2 3.5-2 6M28 13c0 2-2 3-2 5" stroke="#F59E0B" stroke-width="2.2" stroke-linecap="round"/>
        <path d="M16 38h16" stroke="#047857" stroke-width="2.5" stroke-linecap="round"/>
      </svg>`,
      // 4. Ubah Hidup / Hati & Keluarga Sejahtera
      `<svg width="56" height="56" viewBox="0 0 48 48" fill="none">
        <circle cx="24" cy="24" r="22" fill="#FFFFFF" stroke="#F59E0B" stroke-width="2.5"/>
        <path d="M24 35l-9-9c-3-3-3-8 1-11 3-2 7-1 8 2 1-3 5-4 8-2 4 3 4 8 1 11l-9 9z" fill="#DC2626"/>
        <path d="M24 19v6M21 22h6" stroke="#FFFFFF" stroke-width="2.5" stroke-linecap="round"/>
      </svg>`,
      // 5. Satukan Langkah / Tangan-tangan bersatu
      `<svg width="56" height="56" viewBox="0 0 48 48" fill="none">
        <circle cx="24" cy="24" r="22" fill="#FFFFFF" stroke="#F59E0B" stroke-width="2.5"/>
        <path d="M16 26l6-6 4 4 6-6" stroke="#047857" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
        <circle cx="16" cy="16" r="3.5" fill="#EA580C"/>
        <circle cx="24" cy="13" r="3.5" fill="#F59E0B"/>
        <circle cx="32" cy="16" r="3.5" fill="#B45309"/>
        <path d="M12 34h24" stroke="#B45309" stroke-width="2.5" stroke-linecap="round"/>
      </svg>`
    ];

    const pillarEmblemTags = [
      'SOLIDARITAS',
      'KEADILAN',
      'BANTUAN NYATA',
      'KESEJAHTERAAN',
      'GOTONG ROYONG'
    ];

    const pillars = points.slice(0, 5);
    const pillarsHtml = pillars.map((p, idx) => {
      const letter = (p.badge && p.badge.length === 1) ? p.badge.toUpperCase() : (defaultPillarLetters[idx] || `0${idx + 1}`);
      const iconSvg = pillarIcons[idx % pillarIcons.length];
      const bottomEmblemSvg = pillarBottomEmblems[idx % pillarBottomEmblems.length];
      const bottomEmblemTag = pillarEmblemTags[idx % pillarEmblemTags.length];
      const metricText = p.metric || (statsList[idx]?.value ? `TARGET: ${statsList[idx].value}` : `PRIORITAS 100%`);

      return `
        <div class="apillar-card">
          <div class="apillar-top-cluster">
            <div class="apillar-badge-circle">${letter}</div>
            <div class="apillar-icon-wrap">${iconSvg}</div>
            <div class="apillar-title">${esc(p.label)}</div>
            <div class="apillar-desc">${esc(p.text)}</div>
          </div>

          <!-- BOTTOM EMBLEM & ILLUSTRATION (ELIMINATES EMPTY VOID) -->
          <div class="apillar-bottom-cluster">
            <div class="apillar-bottom-emblem-wrap">
              <div class="apillar-bottom-emblem-svg">${bottomEmblemSvg}</div>
              <div class="apillar-bottom-emblem-tag">${esc(bottomEmblemTag)}</div>
            </div>
            <div class="apillar-metric-pill">${esc(metricText)}</div>
          </div>
        </div>
      `;
    }).join('');

    // Middle Stats & Data Breakdown
    const mainStat = statsList[0] || { value: '8,4%', label: 'WARGA DI BAWAH GARIS KEMISKINAN' };
    const stat2 = statsList[1] || { value: 'RP 14,8 T', label: 'ALOKASI JARING PENGAMAN SOSIAL' };
    const stat3 = statsList[2] || { value: '27 KOTA/KAB', label: 'SEBARAN PROGRAM BANTUAN' };

    const actionBannerText = copy.sectionHeading || '✦ MARI BERSAMA-SAMA PUTUSKAN RANTAI KEMISKINAN ✦';

    const html = `
      <div class="apillars-container">
        ${masterCanvasBg ? `<img src="${masterCanvasBg}" class="apillars-canvas-bg" alt="" />` : ''}
        
        <!-- SUBTLE BATIK OVERLAY WATERMARK -->
        <div class="apillars-batik-watermark"></div>
        <div class="apillars-ambient-tint"></div>

        <!-- TOP BAR CLASSIFICATION -->
        <div class="apillars-topbar">
          <div>${esc(editionTag || 'POLARIS • DAPIL JABAR')}</div>
          <div>${esc(headerTag || 'DOKUMEN ADVOKASI PUBLIK')}</div>
        </div>

        <!-- TOP MASTHEAD (CENTERED MONUMENTAL BROADSHEET) -->
        <div class="apillars-masthead">
          <div class="apillars-kicker-wrap">
            <span class="ap-kicker-badge">DATA ADVOKASI</span>
            <span class="ap-kicker-text">${esc(copy.kicker || 'DATA SOSIAL DAERAH • ADVOKASI KEBIJAKAN KERAKYATAN')}</span>
          </div>
          <div class="apillars-headline">${esc(headlineText)}</div>
          <div class="apillars-deck">
            ${esc(copy.deck || 'Analisis terpadu disparitas sosial dan komitmen advokasi anggaran kerakyatan guna mewujudkan pemerataan kesejahteraan masyarakat Jawa Barat.')}
          </div>
        </div>

        <!-- MIDDLE SECTION: STAT CARDS (LEFT) & CONTEXT / IMPACT (RIGHT) -->
        <div class="apillars-mid-section">
          <!-- LEFT COLUMN: STATS AND DATA CARDS -->
          <div class="apillars-mid-left">
            <!-- HERO STAT BOX -->
            <div class="apillars-hero-stat-card">
              <div class="ap-hero-stat-top">
                <span class="ap-hero-stat-num">${esc(mainStat.value)}</span>
                <span class="ap-hero-stat-badge">INDIKATOR UTAMA</span>
              </div>
              <div class="ap-hero-stat-lbl">${esc(mainStat.label)}</div>
              <div class="ap-hero-stat-sub">
                ${esc(copy.callout || 'Intervensi kebijakan afirmatif diarahkan untuk memangkas angka kemiskinan ekstrem melalui perlindungan sosial adaptif dan padat karya.')}
              </div>
            </div>

            <!-- KLUSTER 3 KAPSUL ORANYE DAMPAK (SESUAI TEMPLATE REFERENSI 04) -->
            <div class="apillars-dampak-cluster">
              <div class="ap-dampak-header-pill">
                <span>✦ DAMPAK KRITIS KEBIJAKAN</span>
                <span class="ap-dampak-count">3 PRIORITAS</span>
              </div>
              <div class="ap-dampak-pills-list">
                <div class="ap-dampak-pill">
                  <span class="ap-dp-bullet">●</span>
                  <span>Menghambat konektivitas logistik komoditas pangan & pertanian</span>
                </div>
                <div class="ap-dampak-pill">
                  <span class="ap-dp-bullet">●</span>
                  <span>Melipatgandakan beban ongkos transportasi harian warga kecil</span>
                </div>
                <div class="ap-dampak-pill">
                  <span class="ap-dp-bullet">●</span>
                  <span>Memperlebar disparitas kesejahteraan & kesenjangan antarwilayah</span>
                </div>
              </div>
            </div>
          </div>

          <!-- RIGHT COLUMN: DOCUMENTARY WINDOW & CRITICAL IMPACTS -->
          <div class="apillars-mid-right">
            ${secondaryCanvasBg ? `
              <div class="apillars-doc-window">
                <img src="${secondaryCanvasBg}" class="ap-doc-img" alt="" />
                <div class="ap-doc-caption">SUBJEK ADVOKASI KEBIJAKAN</div>
              </div>
            ` : `
              <div class="apillars-citizen-art-card">
                <div class="ap-citizen-art-inner">
                  <div class="ap-citizen-icon-circle">
                    <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="#F59E0B" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                      <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/>
                      <circle cx="12" cy="7" r="4"/>
                      <path d="M12 11c1.5 1.5 3 2 4.5 2"/>
                    </svg>
                  </div>
                  <div class="ap-citizen-text-wrap">
                    <div class="ap-citizen-quote-tag">JANGKAR ADVOKASI KERAKYATAN</div>
                    <div class="ap-citizen-quote-text">
                      "Anggaran daerah harus berpihak nyata kepada warga rentan dan keluarga prasejahtera."
                    </div>
                  </div>
                </div>
                <div class="ap-doc-caption">SUBJEK ADVOKASI KEBIJAKAN</div>
              </div>
            `}

            <!-- IMPACT CARD -->
            <div class="apillars-impact-card">
              <div class="ap-impact-head">
                <span class="ap-impact-tag">DAMPAK KRITIS</span>
                <span class="ap-impact-title">URGENSI PENANGANAN</span>
              </div>
              <div class="ap-impact-body">
                Keterlambatan intervensi memperlebar kesenjangan antarwilayah serta mengikis daya beli rumah tangga pekerja rentan di Jawa Barat.
              </div>
            </div>
          </div>
        </div>

        <!-- TRANSITION ACTION BANNER -->
        <div class="apillars-action-banner">
          <div class="ap-action-banner-text">${esc(actionBannerText)}</div>
          <div class="ap-action-banner-tag">STRATEGI KERAKYATAN 2026</div>
        </div>

        <!-- 5 VERTICAL SOLUTION PILLARS (P-U-T-U-S) -->
        <div class="apillars-grid-container">
          ${pillarsHtml}
        </div>

        <!-- OFFICIAL LEGISLATIVE FOOTER BAR -->
        <div class="apillars-footer-bar">
          <div class="ap-footer-sig">${esc(signature || 'DR. JONANDA P. A. B • DPRD PROVINSI • DAPIL JABAR')}</div>
          <div class="ap-footer-year">2026 // ADVOKASI KERAKYATAN</div>
        </div>
      </div>
    `;

    const css = `
      .edition-tag, .footer-zone {
        display: none !important;
      }
      .apillars-container {
        position: absolute;
        top: 0;
        left: 0;
        width: 1080px;
        height: 1350px;
        background: linear-gradient(180deg, #EA580C 0%, #D97706 35%, #C25E2B 70%, #9A3412 100%);
        font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        color: #FFFFFF;
        box-sizing: border-box;
        overflow: hidden;
        z-index: 10;
      }
      .apillars-canvas-bg {
        position: absolute;
        top: 0;
        left: 0;
        width: 1080px;
        height: 1350px;
        object-fit: cover;
        z-index: 1;
      }
      .apillars-batik-watermark {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        opacity: 0.10;
        background-image: radial-gradient(#FFF 1.5px, transparent 1.5px), radial-gradient(#F59E0B 1px, transparent 1px);
        background-size: 24px 24px;
        background-position: 0 0, 12px 12px;
        pointer-events: none;
        z-index: 3;
      }
      .apillars-ambient-tint {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: linear-gradient(180deg, rgba(234, 88, 12, 0.65) 0%, rgba(217, 119, 6, 0.45) 40%, rgba(194, 65, 12, 0.75) 100%);
        mix-blend-mode: multiply;
        pointer-events: none;
        z-index: 4;
      }
      .apillars-topbar {
        position: absolute;
        top: 14px;
        left: 48px;
        right: 48px;
        display: flex;
        justify-content: space-between;
        align-items: center;
        font-size: 11px;
        font-weight: 800;
        letter-spacing: 1.8px;
        text-transform: uppercase;
        color: #FEF3C7;
        border-bottom: 1.5px solid rgba(254, 243, 199, 0.25);
        padding-bottom: 6px;
        z-index: 25;
      }
      .apillars-masthead {
        position: absolute;
        top: 44px;
        left: 48px;
        right: 48px;
        text-align: center;
        z-index: 25;
      }
      .apillars-kicker-wrap {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
        margin-bottom: 4px;
      }
      .ap-kicker-badge {
        background: #F59E0B;
        color: #0F172A;
        font-size: 10px;
        font-weight: 900;
        letter-spacing: 1px;
        padding: 3px 8px;
        border-radius: 3px;
        text-transform: uppercase;
      }
      .ap-kicker-text {
        font-size: 11.5px;
        font-weight: 900;
        letter-spacing: 1.8px;
        color: #FEF3C7;
        text-transform: uppercase;
      }
      .apillars-headline {
        font-family: 'Anton', 'Bebas Neue', sans-serif;
        font-size: 64px;
        line-height: 0.95;
        letter-spacing: 1.8px;
        color: #DC2626;
        -webkit-text-stroke: 4px #FFFFFF;
        paint-order: stroke fill;
        text-transform: uppercase;
        text-shadow: 0 4px 18px rgba(0, 0, 0, 0.75), 0 2px 6px rgba(0,0,0,0.85);
        margin: 4px 0 6px;
      }
      .apillars-deck {
        font-family: 'Plus Jakarta Sans', sans-serif;
        font-size: 14px;
        line-height: 1.45;
        color: #FEF3C7;
        font-weight: 600;
        max-width: 940px;
        margin: 0 auto;
        text-shadow: 0 2px 8px rgba(0, 0, 0, 0.7);
      }
      .apillars-mid-section {
        position: absolute;
        top: 236px;
        left: 48px;
        right: 48px;
        display: grid;
        grid-template-columns: 1.15fr 0.85fr;
        gap: 16px;
        z-index: 25;
      }
      .apillars-mid-left {
        display: flex;
        flex-direction: column;
        gap: 10px;
      }
      .apillars-hero-stat-card {
        background: #15803D;
        border: 2.5px solid rgba(255, 255, 255, 0.38);
        border-radius: 20px;
        padding: 16px 20px;
        box-shadow: 0 6px 20px rgba(0, 0, 0, 0.35);
      }
      .ap-hero-stat-top {
        display: flex;
        justify-content: space-between;
        align-items: baseline;
      }
      .ap-hero-stat-num {
        font-family: 'Bebas Neue', sans-serif;
        font-size: 64px;
        line-height: 0.95;
        color: #F59E0B;
        text-shadow: 0 2px 8px rgba(0, 0, 0, 0.5);
      }
      .ap-hero-stat-badge {
        background: rgba(245, 158, 11, 0.2);
        border: 1px solid #F59E0B;
        color: #FDE68A;
        font-size: 10px;
        font-weight: 900;
        letter-spacing: 1px;
        padding: 3px 8px;
        border-radius: 4px;
        text-transform: uppercase;
      }
      .ap-hero-stat-lbl {
        font-size: 14.5px;
        font-weight: 900;
        color: #FFFFFF;
        text-transform: uppercase;
        letter-spacing: 0.5px;
        margin: 4px 0 2px;
      }
      .ap-hero-stat-sub {
        font-size: 12.5px;
        line-height: 1.42;
        color: #FEF3C7;
        font-weight: 500;
      }
      .apillars-dampak-cluster {
        display: flex;
        flex-direction: column;
        gap: 6px;
      }
      .ap-dampak-header-pill {
        background: #15803D;
        border: 2px solid rgba(255, 255, 255, 0.35);
        color: #FFFFFF;
        font-size: 11px;
        font-weight: 900;
        letter-spacing: 0.8px;
        padding: 5px 12px;
        border-radius: 14px;
        display: flex;
        justify-content: space-between;
        align-items: center;
        text-transform: uppercase;
      }
      .ap-dampak-count {
        background: #F59E0B;
        color: #0F172A;
        font-size: 9px;
        font-weight: 900;
        padding: 1px 6px;
        border-radius: 8px;
      }
      .ap-dampak-pills-list {
        display: flex;
        flex-direction: column;
        gap: 5px;
      }
      .ap-dampak-pill {
        background: linear-gradient(90deg, #EA580C 0%, #C2410C 100%);
        border: 1.5px solid rgba(254, 243, 199, 0.4);
        border-radius: 14px;
        padding: 6px 12px;
        color: #FFFFFF;
        font-size: 11.5px;
        font-weight: 700;
        line-height: 1.35;
        display: flex;
        align-items: center;
        gap: 8px;
        box-shadow: 0 3px 10px rgba(0, 0, 0, 0.25);
      }
      .ap-dp-bullet {
        color: #FDE68A;
        font-size: 10px;
        flex-shrink: 0;
      }
      .apillars-mid-right {
        display: flex;
        flex-direction: column;
        gap: 12px;
      }
      .apillars-doc-window {
        position: relative;
        height: 185px;
        border-radius: 20px;
        overflow: hidden;
        border: 2.5px solid rgba(255, 255, 255, 0.38);
        box-shadow: 0 6px 20px rgba(0, 0, 0, 0.35);
      }
      .ap-doc-img {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }
      .ap-doc-caption {
        position: absolute;
        bottom: 8px;
        left: 10px;
        background: rgba(15, 23, 42, 0.85);
        color: #FDE68A;
        font-size: 9.5px;
        font-weight: 900;
        letter-spacing: 1px;
        padding: 3px 8px;
        border-radius: 3px;
        text-transform: uppercase;
      }
      .apillars-citizen-art-card {
        background: #15803D;
        border: 2.5px solid rgba(255, 255, 255, 0.38);
        border-radius: 20px;
        padding: 16px 18px;
        box-shadow: 0 6px 20px rgba(0, 0, 0, 0.35);
        display: flex;
        flex-direction: column;
        justify-content: center;
        min-height: 140px;
        position: relative;
      }
      .ap-citizen-art-inner {
        display: flex;
        align-items: center;
        gap: 14px;
      }
      .ap-citizen-icon-circle {
        width: 60px;
        height: 60px;
        border-radius: 50%;
        background: rgba(245, 158, 11, 0.2);
        border: 2px solid #F59E0B;
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
      }
      .ap-citizen-text-wrap {
        display: flex;
        flex-direction: column;
        gap: 4px;
      }
      .ap-citizen-quote-tag {
        color: #F59E0B;
        font-size: 10.5px;
        font-weight: 900;
        letter-spacing: 1px;
        text-transform: uppercase;
      }
      .ap-citizen-quote-text {
        font-size: 13px;
        line-height: 1.45;
        color: #FFFFFF;
        font-style: italic;
        font-weight: 600;
      }
      .apillars-impact-card {
        background: #15803D;
        border: 2px solid rgba(255, 255, 255, 0.3);
        border-radius: 16px;
        padding: 12px 16px;
        box-shadow: 0 4px 14px rgba(0, 0, 0, 0.25);
      }
      .ap-impact-head {
        display: flex;
        align-items: center;
        gap: 8px;
        margin-bottom: 4px;
      }
      .ap-impact-tag {
        background: #DC2626;
        color: #FFFFFF;
        font-size: 9.5px;
        font-weight: 900;
        letter-spacing: 0.8px;
        padding: 2px 6px;
        border-radius: 3px;
      }
      .ap-impact-title {
        font-size: 11.5px;
        font-weight: 900;
        letter-spacing: 0.8px;
        color: #FFFFFF;
        text-transform: uppercase;
      }
      .ap-impact-body {
        font-size: 11.5px;
        line-height: 1.4;
        color: #FEF3C7;
        font-weight: 500;
      }
      .apillars-action-banner {
        position: absolute;
        top: 642px;
        left: 48px;
        right: 48px;
        height: 44px;
        background: linear-gradient(90deg, #F59E0B 0%, #D97706 100%);
        border: 1.5px solid #FDE68A;
        border-radius: 6px;
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 0 20px;
        box-shadow: 0 4px 16px rgba(0, 0, 0, 0.35);
        z-index: 25;
      }
      .ap-action-banner-text {
        font-family: 'Bebas Neue', sans-serif;
        font-size: 24px;
        letter-spacing: 1.5px;
        color: #0F172A;
        text-transform: uppercase;
        font-weight: 900;
      }
      .ap-action-banner-tag {
        font-size: 11px;
        font-weight: 900;
        letter-spacing: 1px;
        color: #0F172A;
        background: #FEF3C7;
        padding: 3px 10px;
        border-radius: 4px;
        text-transform: uppercase;
      }
      .apillars-grid-container {
        position: absolute;
        top: 692px;
        left: 48px;
        right: 48px;
        height: 545px;
        display: grid;
        grid-template-columns: repeat(5, 1fr);
        gap: 12px;
        z-index: 25;
      }
      .apillar-card {
        background: #15803D;
        border: 2.5px solid rgba(255, 255, 255, 0.42);
        border-radius: 24px;
        padding: 14px 10px 12px;
        display: flex;
        flex-direction: column;
        align-items: center;
        text-align: center;
        box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4);
        position: relative;
        justify-content: space-between;
      }
      .apillar-top-cluster {
        display: flex;
        flex-direction: column;
        align-items: center;
        width: 100%;
      }
      .apillar-badge-circle {
        width: 44px;
        height: 44px;
        border-radius: 50%;
        border: 2.5px solid #FFFFFF;
        background: #F59E0B;
        color: #0F172A;
        font-family: 'Bebas Neue', sans-serif;
        font-size: 28px;
        font-weight: 900;
        display: flex;
        align-items: center;
        justify-content: center;
        margin-bottom: 6px;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.4);
      }
      .apillar-icon-wrap {
        width: 32px;
        height: 32px;
        display: flex;
        align-items: center;
        justify-content: center;
        margin-bottom: 6px;
      }
      .apillar-title {
        font-size: 14px;
        font-weight: 900;
        color: #FFFFFF;
        text-transform: uppercase;
        line-height: 1.25;
        margin-bottom: 6px;
        padding-bottom: 6px;
        border-bottom: 1.5px solid rgba(245, 158, 11, 0.45);
        width: 100%;
        text-align: center;
      }
      .apillar-desc {
        font-size: 11.5px;
        line-height: 1.45;
        color: #FEF3C7;
        font-weight: 500;
        text-align: left;
        width: 100%;
      }
      .apillar-bottom-cluster {
        display: flex;
        flex-direction: column;
        align-items: center;
        width: 100%;
        margin-top: 8px;
      }
      .apillar-bottom-emblem-wrap {
        display: flex;
        flex-direction: column;
        align-items: center;
        margin-bottom: 6px;
      }
      .apillar-bottom-emblem-svg {
        filter: drop-shadow(0 3px 6px rgba(0, 0, 0, 0.35));
      }
      .apillar-bottom-emblem-tag {
        font-size: 9.5px;
        font-weight: 900;
        letter-spacing: 0.8px;
        color: #FEF3C7;
        margin-top: 4px;
        text-transform: uppercase;
      }
      .apillar-metric-pill {
        background: rgba(245, 158, 11, 0.2);
        border: 1px solid #F59E0B;
        color: #FDE68A;
        font-size: 10px;
        font-weight: 900;
        letter-spacing: 0.5px;
        padding: 4px 6px;
        border-radius: 4px;
        width: 88%;
        text-align: center;
        text-transform: uppercase;
      }
      .apillars-footer-bar {
        position: absolute;
        top: 1252px;
        left: 48px;
        right: 48px;
        height: 52px;
        background: #0F172A;
        border-top: 2px solid #F59E0B;
        border-radius: 4px;
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 0 24px;
        color: #FFFFFF;
        z-index: 25;
      }
      .ap-footer-sig {
        font-family: 'Bebas Neue', sans-serif;
        font-size: 24px;
        letter-spacing: 1.2px;
        color: #FFFFFF;
      }
      .ap-footer-year {
        font-family: 'Bebas Neue', sans-serif;
        font-size: 20px;
        letter-spacing: 1.2px;
        color: #F59E0B;
      }
    `;

    return { html, css };
  }
  if (archetype === 'INFOGRAPHIC_EDITORIAL_COLLAGE') {
    // Risograph Zine Cutout Editorial: Tilted banner blocks, 3 modular Q&A cards on left, fun facts at bottom, footer quote banner
    const words = headlineText.split(' ');
    const titlePart1 = words.slice(0, Math.ceil(words.length / 3)).join(' ') || headlineText;
    const titlePart2 = words.slice(Math.ceil(words.length / 3), Math.ceil((words.length * 2) / 3)).join(' ') || 'FOKUS';
    const titlePart3 = words.slice(Math.ceil((words.length * 2) / 3)).join(' ') || 'STRATEGIS';

    const card1 = points[0] || { label: 'BAGAIMANA INI BEKERJA?', text: copy.deck || 'Analisis mekanisme dan langkah terukur implementasi kebijakan di lapangan.' };
    const card2 = points[1] || { label: 'DI MANA KITA MENEMUKANNYA?', text: 'Pengawasan berkala dilakukan di seluruh titik fasilitas umum dan sentra pelayanan publik.' };
    const card3 = points[2] || { label: 'MENGAPA INI PENTING?', text: 'Menjamin akuntabilitas, transparansi anggaran, serta dampak langsung bagi kesejahteraan warga.' };
    const funFactPoints = points.slice(3, 6);

    const html = `
      <div class="collage-layout">
        <div class="collage-header">
          <div class="collage-title-blocks">
            <div class="collage-block block-teal">${esc(titlePart1)}</div>
            <div class="collage-block block-amber">${esc(titlePart2)}</div>
            <div class="collage-block block-navy">${esc(titlePart3)}</div>
          </div>
          ${copy.kicker ? `<div class="collage-subtitle-pill">${esc(copy.kicker)}</div>` : ''}
          ${copy.deck ? `<div class="collage-deck-box">${esc(copy.deck)}</div>` : ''}
        </div>

        <div class="collage-body">
          <div class="collage-left-col">
            <div class="collage-card card-teal">
              <div class="collage-card-heading">${esc(card1.label)}</div>
              <div class="collage-card-content">${esc(card1.text)}</div>
            </div>

            <div class="collage-card card-amber">
              <div class="collage-card-heading dark-text">${esc(card2.label)}</div>
              <div class="collage-card-content dark-text">${esc(card2.text)}</div>
            </div>

            <div class="collage-card card-dark-teal">
              <div class="collage-card-heading">${esc(card3.label)}</div>
              <div class="collage-card-content">${esc(card3.text)}</div>
            </div>
          </div>

          <div class="collage-right-col">
            <!-- Hero Cutout Zone (Lightbulb + Plant Shadow underlying AI visual artwork) -->
          </div>
        </div>

        <div class="collage-bottom-section">
          <div class="collage-facts-card">
            <div class="collage-facts-header">FAKTA MENARIK &amp; DATA KUNCI</div>
            <div class="collage-facts-grid">
              ${statsList.slice(0, 3).map((st, i) => `
                <div class="collage-fact-item">
                  <div class="collage-fact-val">${esc(st.value)}</div>
                  <div class="collage-fact-lbl">${esc(st.label || (funFactPoints[i]?.text ? funFactPoints[i].text.slice(0, 50) : ''))}</div>
                </div>
              `).join('')}
            </div>
          </div>

          <div class="collage-quote-tape">
            <span class="collage-quote-mark">&#8220;</span>
            <div class="collage-quote-body">${esc(copy.closingLine || 'Kebijakan yang baik berpijak pada data nyata dan keterbukaan publik.')}</div>
          </div>
        </div>

        <div class="collage-footer-banner">
          <div class="collage-footer-motto">${esc(copy.banner || 'Transparansi Kebijakan. Keberpihakan Nyata. Membangun Bersama.')}</div>
        </div>
      </div>
    `;

    const css = `
      .collage-layout {
        position: absolute;
        top: 60px;
        left: 48px;
        right: 48px;
        height: 1180px;
        display: flex;
        flex-direction: column;
        gap: 16px;
        text-shadow: ${universalInkHalo};
      }
      .collage-header {
        max-width: 540px;
        margin-bottom: 8px;
      }
      .collage-title-blocks {
        display: flex;
        flex-direction: column;
        gap: 6px;
        align-items: flex-start;
      }
      .collage-block {
        font-family: 'Anton', sans-serif;
        font-size: 52px;
        line-height: 1.0;
        letter-spacing: 1px;
        padding: 4px 14px;
        text-transform: uppercase;
        display: inline-block;
        box-shadow: 2px 3px 8px rgba(0,0,0,0.15);
      }
      .block-teal {
        background: #0E7490;
        color: #FFFFFF;
        transform: rotate(-1deg);
      }
      .block-amber {
        background: #D97706;
        color: #1E293B;
        transform: rotate(1deg);
        margin-left: 24px;
      }
      .block-navy {
        background: #0F172A;
        color: #FFFFFF;
        transform: rotate(-0.5deg);
      }
      .collage-subtitle-pill {
        display: inline-block;
        background: #0E7490;
        color: #FFFFFF;
        font-family: 'Playfair Display', serif;
        font-style: italic;
        font-size: 16px;
        font-weight: 700;
        padding: 4px 18px;
        border-radius: 20px;
        margin-top: 8px;
        letter-spacing: 0.5px;
      }
      .collage-deck-box {
        margin-top: 10px;
        font-size: 13.5px;
        line-height: 1.4;
        color: #1E293B;
        font-weight: 600;
        background: transparent;
        border-top: 2px solid #0E7490;
        border-bottom: 1.5px solid rgba(14, 116, 144, 0.35);
        padding: 8px 0;
      }
      .collage-body {
        display: flex;
        gap: 24px;
        flex: 1;
        margin-top: 8px;
      }
      .collage-left-col {
        width: 520px;
        display: flex;
        flex-direction: column;
        gap: 14px;
      }
      .collage-right-col {
        flex: 1;
      }
      .collage-card {
        padding: 10px 0 10px 14px;
        background: transparent;
        border-bottom: 1px dashed rgba(15, 23, 42, 0.25);
      }
      .card-teal {
        border-left: 4px solid #0E7490;
        color: #0F172A;
      }
      .card-amber {
        border-left: 4px solid #D97706;
        color: #1E293B;
      }
      .card-dark-teal {
        border-left: 4px solid #115E59;
        color: #0F172A;
      }
      .collage-card-heading {
        font-family: 'Anton', sans-serif;
        font-size: 18px;
        letter-spacing: 1px;
        text-transform: uppercase;
        margin-bottom: 4px;
        color: #0E7490;
      }
      .collage-card-heading.dark-text {
        color: #B45309;
      }
      .collage-card-content {
        font-size: 12.8px;
        line-height: 1.42;
        font-weight: 600;
        color: #1E293B;
      }
      .collage-card-content.dark-text {
        color: #1E293B;
      }
      .collage-bottom-section {
        display: flex;
        gap: 16px;
        margin-top: 12px;
      }
      .collage-facts-card {
        flex: 1.4;
        background: transparent;
        border-top: 2.5px solid #0E7490;
        border-bottom: 2px solid #0E7490;
        padding: 10px 0;
      }
      .collage-facts-header {
        font-family: 'Anton', sans-serif;
        font-size: 16px;
        color: #0E7490;
        letter-spacing: 1px;
        margin-bottom: 8px;
        text-transform: uppercase;
      }
      .collage-facts-grid {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 8px;
      }
      .collage-fact-item {
        border-right: 1px solid rgba(14, 116, 144, 0.3);
        padding-right: 6px;
      }
      .collage-fact-item:last-child {
        border-right: none;
      }
      .collage-fact-val {
        font-family: 'Bebas Neue', sans-serif;
        font-size: 24px;
        color: #0E7490;
        line-height: 1.0;
        margin-bottom: 2px;
      }
      .collage-fact-lbl {
        font-size: 10.5px;
        color: #1E293B;
        line-height: 1.25;
        font-weight: 700;
      }
      .collage-quote-tape {
        flex: 1;
        background: transparent;
        border-left: 3.5px solid #D97706;
        padding: 8px 12px;
        display: flex;
        align-items: center;
        gap: 8px;
      }
      .collage-quote-mark {
        font-family: 'Playfair Display', serif;
        font-size: 36px;
        line-height: 1;
        color: #D97706;
        font-weight: bold;
      }
      .collage-quote-body {
        font-size: 12px;
        line-height: 1.35;
        font-style: italic;
        color: #78350F;
        font-weight: 600;
      }
      .collage-footer-banner {
        margin-top: 10px;
        background: #0E7490;
        color: #FFFFFF;
        padding: 8px 18px;
        border-radius: 4px;
        text-align: center;
        box-shadow: 0 3px 10px rgba(0,0,0,0.12);
      }
      .collage-footer-motto {
        font-family: 'Playfair Display', serif;
        font-style: italic;
        font-size: 14px;
        letter-spacing: 0.8px;
      }
    `;

    return { html, css };
  }

  if (archetype === 'INFOGRAPHIC_HISTORICAL_EXPEDITION') {
    // Archival Historical Biography & Expedition (Template 07): Antique map, brass compass, gilded baroque frames, quill & aged parchments
    // OPTION A (DIRECT EDITORIAL INK PRINT - ZERO FLOATING UI CARDS)
    // Area tengah (potret pemimpin dalam bingkai emas oval & foto dokumen sejarah dalam bingkai emas kotak) 100% BEBAS DARI ELEMEN TEKS.
    // Teks dicetak langsung (direct archival ink) ke lembaran perkamen robek kiri bawah dan gulungan perkamen kanan bawah.
    // 4 Varian Tata Letak Dinamis (resolvedVariant: 0, 1, 2, 3) menjamin hasil generate tidak monoton dan bervariasi antar user.
    const p1 = points[0] || { label: '10.000 KELUARGA DIBANTU', text: 'Program bantuan langsung tunai menyasar keluarga di daerah terdampak guna meningkatkan daya beli.' };
    const p2 = points[1] || { label: 'PENYULUHAN 50 KAMPUNG', text: 'Melalui program edukasi terpadu, penyuluhan diadakan di 50 titik untuk meningkatkan literasi dan akses ke layanan publik.' };
    const p3 = points[2] || { label: 'TARGET PENURUNAN 2%', text: 'Pemerintah daerah menargetkan percepatan penurunan kemiskinan melalui kolaborasi terpadu lintas sektor.' };
    const p4 = points[3] || { label: 'AUDIT PROGRAM 6 BULAN', text: 'Audit berkala setiap 6 bulan dilakukan untuk memastikan akuntabilitas dan efisiensi penyaluran dana publik.' };
    const p5 = points[4] || { label: 'PENYEDIAAN LAPANGAN KERJA', text: 'Penciptaan ribuan lapangan kerja baru difokuskan pada sektor UMKM binaan dan ekonomi kreatif daerah.' };

    const stats3 = statsList.slice(0, 3);
    const expDeck = copy.deck || 'Rekam jejak implementasi kebijakan publik dan pemantauan berkala program advokasi masyarakat demi percepatan kesejahteraan.';
    const expSynthesis = copy.closingLine || 'Pemerintah diharapkan terus menjaga transparansi anggaran demi percepatan pengentasan kemiskinan dan keadilan sosial.';

    // Common Safe Header: Masthead ditempatkan tepat di papan kayu mahoni sebelah kanan kompas kuno
    const headerHtml = `
      <div class="exp-masthead-direct">
        <div class="exp-kicker-line">${esc(copy.kicker || 'DATA KEBIJAKAN PUBLIK // ANALISIS KEBIJAKAN')}</div>
        <div class="exp-headline-title">${esc(headlineText)}</div>
        <div class="exp-badge-strip">
          <span class="exp-badge-pill">${esc(copy.banner || `DOKUMEN ANALISIS & ADVOKASI PUBLIK • TAHUN ${currentYear}`)}</span>
        </div>
      </div>
    `;

    // 4 Dynamic Variations (resolvedVariant: 0, 1, 2, 3)
    let bodyHtml = '';

    if (resolvedVariant === 0) {
      // VARIAN 0: DUAL-WING HISTORICAL ARCHIVE (Klasik Arsip Laporan)
      // Sayap Kiri (Perkamen Robek Kiri): Dokumen & Indikator + Poin 1 & 2
      // Sayap Kanan (Gulungan Perkamen Kanan): Agenda Aksi (Poin 3, 4, 5) + Sintesis Kebijakan
      bodyHtml = `
        <div class="exp-left-sheet exp-v0-left">
          <div class="exp-parchment-title">DOKUMEN &amp; INDIKATOR UTAMA</div>
          <div class="exp-ink-deck">${esc(expDeck)}</div>
          
          <div class="exp-stamp-grid">
            ${stats3.map((st) => `
              <div class="exp-archival-stamp">
                <div class="stamp-val">${esc(st.value)}</div>
                <div class="stamp-lbl">${esc(st.label)}</div>
              </div>
            `).join('')}
          </div>

          <div class="exp-ink-point">
            <div class="point-ink-title">01 • ${esc(p1.label)}</div>
            <div class="point-ink-text">${esc(p1.text)}</div>
          </div>

          <div class="exp-ink-point">
            <div class="point-ink-title">02 • ${esc(p2.label)}</div>
            <div class="point-ink-text">${esc(p2.text)}</div>
          </div>
        </div>

        <div class="exp-lower-scroll exp-v0-right">
          <div class="exp-scroll-header">AGENDA REALISASI &amp; AKSI</div>

          <div class="exp-scroll-point">
            <div class="scroll-point-title">${esc(p3.label)}</div>
            <div class="scroll-point-text">${esc(p3.text)}</div>
          </div>

          <div class="exp-scroll-point">
            <div class="scroll-point-title">${esc(p4.label)}</div>
            <div class="scroll-point-text">${esc(p4.text)}</div>
          </div>

          <div class="exp-scroll-point">
            <div class="scroll-point-title">${esc(p5.label)}</div>
            <div class="scroll-point-text">${esc(p5.text)}</div>
          </div>

          <div class="exp-proclamation-box">
            <div class="proclamation-label">SINTESIS KEBIJAKAN</div>
            <div class="proclamation-text">${esc(expSynthesis)}</div>
          </div>
        </div>
      `;
    } else if (resolvedVariant === 1) {
      // VARIAN 1: STRATEGIC CHARTER & STEPPED MILESTONES (Piagam Capaian & Log Bertahap)
      const heroStat = stats3[0] || { value: '100%', label: 'Capaian Program' };
      const subStats = stats3.slice(1, 3);
      bodyHtml = `
        <div class="exp-left-sheet exp-v1-left">
          <div class="exp-parchment-title">PIAGAM CAPAIAN DAERAH</div>
          <div class="exp-ink-deck">${esc(expDeck)}</div>
          <div class="exp-seal-row">
            <div class="exp-hero-seal">
              <div class="seal-inner">
                <div class="seal-val">${esc(heroStat.value)}</div>
                <div class="seal-lbl">${esc(heroStat.label)}</div>
              </div>
            </div>
            <div class="exp-stamp-col">
              ${subStats.map((st) => `
                <div class="exp-sub-stamp">
                  <span class="sub-stamp-lbl">${esc(st.label)}</span>
                  <span class="sub-stamp-val">${esc(st.value)}</span>
                </div>
              `).join('')}
            </div>
          </div>

          <div class="exp-ink-point">
            <div class="point-ink-title">${esc(p1.label)}</div>
            <div class="point-ink-text">${esc(p1.text)}</div>
          </div>

          <div class="exp-ink-point">
            <div class="point-ink-title">${esc(p2.label)}</div>
            <div class="point-ink-text">${esc(p2.text)}</div>
          </div>
        </div>

        <div class="exp-lower-scroll exp-v1-right">
          <div class="exp-scroll-header">TAHAPAN STRATEGIS &amp; LOG AKSI</div>

          <div class="exp-stepped-log">
            <div class="stepped-item">
              <div class="step-num">01</div>
              <div class="step-content">
                <div class="step-title">${esc(p3.label)}</div>
                <div class="step-desc">${esc(p3.text)}</div>
              </div>
            </div>
            <div class="stepped-item">
              <div class="step-num">02</div>
              <div class="step-content">
                <div class="step-title">${esc(p4.label)}</div>
                <div class="step-desc">${esc(p4.text)}</div>
              </div>
            </div>
            <div class="stepped-item">
              <div class="step-num">03</div>
              <div class="step-content">
                <div class="step-title">${esc(p5.label)}</div>
                <div class="step-desc">${esc(p5.text)}</div>
              </div>
            </div>
          </div>

          <div class="exp-proclamation-box">
            <div class="proclamation-label">KESIMPULAN ADVOKASI</div>
            <div class="proclamation-text">${esc(expSynthesis)}</div>
          </div>
        </div>
      `;
    } else if (resolvedVariant === 2) {
      // VARIAN 2: ARCHIVAL BENTO MANIFEST (Manifes Arsip Tabular)
      bodyHtml = `
        <div class="exp-left-sheet exp-v2-left">
          <div class="exp-parchment-title">PIAGAM ADVOKASI DAERAH</div>
          <div class="exp-ink-deck">${esc(expDeck)}</div>

          <div class="exp-ink-point">
            <div class="point-ink-title">${esc(p1.label)}</div>
            <div class="point-ink-text">${esc(p1.text)}</div>
          </div>

          <div class="exp-ink-point">
            <div class="point-ink-title">${esc(p2.label)}</div>
            <div class="point-ink-text">${esc(p2.text)}</div>
          </div>

          <div class="exp-mini-ticker">
            ${stats3.map((st) => `
              <div class="ticker-col">
                <span class="ticker-v">${esc(st.value)}</span>
                <span class="ticker-l">${esc(st.label)}</span>
              </div>
            `).join('')}
          </div>
        </div>

        <div class="exp-lower-scroll exp-v2-right">
          <div class="exp-target-highlight">
            <div class="target-flag">FOKUS UTAMA</div>
            <div class="target-title">${esc(p3.label)}</div>
            <div class="target-desc">${esc(p3.text)}</div>
          </div>

          <div class="exp-scroll-point">
            <div class="scroll-point-title">${esc(p4.label)}</div>
            <div class="scroll-point-text">${esc(p4.text)}</div>
          </div>

          <div class="exp-scroll-point">
            <div class="scroll-point-title">${esc(p5.label)}</div>
            <div class="scroll-point-text">${esc(p5.text)}</div>
          </div>

          <div class="exp-proclamation-box">
            <div class="proclamation-label">REKOMENDASI KEBIJAKAN</div>
            <div class="proclamation-text">${esc(expSynthesis)}</div>
          </div>
        </div>
      `;
    } else {
      // VARIAN 3: HISTORICAL FIELD DISPATCH (Warta Ekspedisi Lapangan & Triad Klasik)
      bodyHtml = `
        <div class="exp-left-sheet exp-v3-left">
          <div class="exp-dispatch-tag">LAPORAN LAPANGAN RESMI</div>
          <div class="exp-ink-deck">${esc(expDeck)}</div>

          <div class="exp-classic-triad">
            ${stats3.map((st) => `
              <div class="triad-box">
                <div class="triad-val">${esc(st.value)}</div>
                <div class="triad-lbl">${esc(st.label)}</div>
              </div>
            `).join('')}
          </div>

          <div class="exp-ink-point">
            <div class="point-ink-title">${esc(p1.label)}</div>
            <div class="point-ink-text">${esc(p1.text)}</div>
          </div>

          <div class="exp-ink-point">
            <div class="point-ink-title">${esc(p2.label)}</div>
            <div class="point-ink-text">${esc(p2.text)}</div>
          </div>
        </div>

        <div class="exp-lower-scroll exp-v3-right">
          <div class="exp-scroll-header">STRATEGI PENGENTASAN &amp; AUDIT</div>

          <div class="exp-scroll-point">
            <div class="scroll-point-title">${esc(p3.label)}</div>
            <div class="scroll-point-text">${esc(p3.text)}</div>
          </div>

          <div class="exp-scroll-point">
            <div class="scroll-point-title">${esc(p4.label)}</div>
            <div class="scroll-point-text">${esc(p4.text)}</div>
          </div>

          <div class="exp-scroll-point">
            <div class="scroll-point-title">${esc(p5.label)}</div>
            <div class="scroll-point-text">${esc(p5.text)}</div>
          </div>

          <div class="exp-proclamation-box">
            <div class="proclamation-label">KOMITMEN PENUTUP</div>
            <div class="proclamation-text">${esc(expSynthesis)}</div>
          </div>
        </div>
      `;
    }

    const html = `
      ${headerHtml}
      ${bodyHtml}
    `;

    const css = `
      /* Masthead: Fixed to wood bar on the right of the antique brass compass */
      .exp-masthead-direct {
        position: absolute;
        top: 32px;
        left: 330px;
        width: 690px;
        z-index: 20;
      }
      .exp-kicker-line {
        font-family: 'Playfair Display', serif;
        font-style: italic;
        font-size: 13.5px;
        letter-spacing: 2px;
        color: #FDE68A;
        text-transform: uppercase;
        margin-bottom: 2px;
        text-shadow: 0 1px 4px rgba(0,0,0,0.8);
      }
      .exp-headline-title {
        font-family: 'Playfair Display', Georgia, serif;
        font-size: 44px;
        font-weight: 900;
        color: #FFFBEB;
        line-height: 1.06;
        letter-spacing: 1px;
        text-shadow: 2px 3px 10px rgba(0,0,0,0.9), 0 0 20px rgba(217,119,6,0.35);
        margin-bottom: 6px;
      }
      .exp-badge-strip {
        display: flex;
        align-items: center;
        gap: 10px;
      }
      .exp-badge-pill {
        display: inline-block;
        background: #451A03;
        border: 1.5px solid #D97706;
        color: #FDE68A;
        font-size: 11.5px;
        font-weight: 700;
        padding: 3px 14px;
        border-radius: 16px;
        letter-spacing: 0.8px;
        box-shadow: 0 2px 6px rgba(0,0,0,0.5);
      }

      /* Lower-Left Torn Parchment Sheet: y: 790px - 1250px, x: 45px - 410px */
      .exp-left-sheet {
        position: absolute;
        top: 790px;
        left: 45px;
        width: 360px;
        height: 460px;
        display: flex;
        flex-direction: column;
        justify-content: flex-start;
        gap: 8px;
        z-index: 10;
      }

      /* Lower-Right Vertical Unrolled Scroll: y: 875px - 1240px, x: 640px - 900px */
      .exp-lower-scroll {
        position: absolute;
        top: 875px;
        left: 640px;
        width: 260px;
        height: 365px;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        z-index: 10;
      }

      /* Direct Editorial Ink Styling on Parchment */
      .exp-parchment-title, .exp-scroll-header {
        font-family: 'Playfair Display', Georgia, serif;
        font-size: 14px;
        font-weight: 900;
        color: #78350F;
        letter-spacing: 1.2px;
        text-transform: uppercase;
        border-bottom: 1.5px solid #92400E;
        padding-bottom: 3px;
        margin-bottom: 1px;
      }
      .exp-dispatch-tag {
        font-family: 'Playfair Display', serif;
        font-size: 13px;
        font-weight: 800;
        letter-spacing: 1.2px;
        color: #92400E;
        text-transform: uppercase;
        border-bottom: 1px dashed #78350F;
        padding-bottom: 2px;
      }
      .exp-ink-deck, .exp-scroll-deck {
        font-family: 'Plus Jakarta Sans', sans-serif;
        font-style: normal;
        font-size: 11.5px;
        line-height: 1.4;
        color: #381A07;
        font-weight: 600;
      }
      
      /* Archival Stamp Grid */
      .exp-stamp-grid {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 6px;
        margin: 3px 0;
      }
      .exp-archival-stamp {
        border: 1.2px solid rgba(120, 53, 15, 0.55);
        background: rgba(120, 53, 15, 0.06);
        border-radius: 3px;
        padding: 5px 2px;
        text-align: center;
      }
      .stamp-val {
        font-family: 'Bebas Neue', sans-serif;
        font-size: 21px;
        color: #78350F;
        line-height: 1;
      }
      .stamp-lbl {
        font-size: 8.5px;
        font-weight: 700;
        color: #451A03;
        line-height: 1.12;
        text-transform: uppercase;
        margin-top: 1px;
      }

      /* Points printed directly on paper */
      .exp-ink-point {
        display: flex;
        flex-direction: column;
        gap: 2px;
        border-top: 1px dashed rgba(120, 53, 15, 0.35);
        padding-top: 6px;
      }
      .point-num-tag {
        font-family: 'Playfair Display', serif;
        font-size: 9px;
        font-weight: 800;
        color: #B45309;
        letter-spacing: 0.8px;
      }
      .point-ink-title {
        font-family: 'Playfair Display', serif;
        font-size: 12.5px;
        font-weight: 800;
        color: #78350F;
        text-transform: uppercase;
        line-height: 1.18;
      }
      .point-ink-text {
        font-size: 10.8px;
        line-height: 1.35;
        color: #381A07;
        font-weight: 600;
      }

      /* Scroll items */
      .exp-scroll-point {
        display: flex;
        flex-direction: column;
        gap: 1.5px;
        border-left: 2px solid #92400E;
        padding-left: 7px;
      }
      .scroll-point-title {
        font-family: 'Playfair Display', Georgia, serif;
        font-size: 11.8px;
        font-weight: 800;
        color: #78350F;
        text-transform: uppercase;
        line-height: 1.16;
      }
      .scroll-point-text {
        font-size: 10px;
        line-height: 1.3;
        color: #381A07;
        font-weight: 600;
      }

      /* Proclamation Box on Scroll Base */
      .exp-proclamation-box {
        border: 1.2px solid #92400E;
        background: rgba(146, 64, 14, 0.08);
        border-radius: 3px;
        padding: 5px 8px;
      }
      .proclamation-label {
        font-family: 'Playfair Display', serif;
        font-size: 9px;
        font-weight: 800;
        color: #92400E;
        letter-spacing: 0.8px;
        text-transform: uppercase;
        margin-bottom: 1px;
      }
      .proclamation-text {
        font-size: 10px;
        line-height: 1.28;
        color: #381A07;
        font-weight: 600;
      }

      /* Varian 1 Specials */
      .exp-seal-row {
        display: flex;
        align-items: center;
        gap: 8px;
        margin: 1px 0 3px 0;
      }
      .exp-hero-seal {
        display: flex;
        justify-content: center;
      }
      .seal-inner {
        border: 2px solid #78350F;
        border-radius: 50%;
        width: 76px;
        height: 76px;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        background: rgba(120, 53, 15, 0.08);
        box-shadow: inset 0 0 8px rgba(120, 53, 15, 0.15);
        text-align: center;
        padding: 3px;
        box-sizing: border-box;
      }
      .seal-val {
        font-family: 'Bebas Neue', sans-serif;
        font-size: 23px;
        color: #78350F;
        line-height: 1;
      }
      .seal-lbl {
        font-size: 7.5px;
        font-weight: 700;
        color: #451A03;
        line-height: 1.1;
        text-transform: uppercase;
      }
      .exp-stamp-col {
        flex: 1;
        display: flex;
        flex-direction: column;
        gap: 4px;
      }
      .exp-sub-stamp {
        border: 1px solid rgba(120, 53, 15, 0.5);
        background: rgba(120, 53, 15, 0.05);
        border-radius: 3px;
        padding: 3px 6px;
        display: flex;
        justify-content: space-between;
        align-items: center;
      }
      .sub-stamp-val {
        font-family: 'Bebas Neue', sans-serif;
        font-size: 16px;
        color: #78350F;
        line-height: 1;
      }
      .sub-stamp-lbl {
        font-size: 8px;
        font-weight: 700;
        color: #451A03;
        line-height: 1.1;
        text-transform: uppercase;
      }
      .exp-stepped-log {
        display: flex;
        flex-direction: column;
        gap: 5px;
        margin: 2px 0;
      }
      .stepped-item {
        display: flex;
        gap: 8px;
        align-items: flex-start;
      }
      .step-num {
        font-family: 'Bebas Neue', sans-serif;
        font-size: 17px;
        color: #92400E;
        background: rgba(146, 64, 14, 0.12);
        border: 1px solid #92400E;
        border-radius: 3px;
        padding: 1px 5px;
        line-height: 1;
      }
      .step-content {
        flex: 1;
      }
      .step-title {
        font-family: 'Playfair Display', serif;
        font-size: 11.5px;
        font-weight: 800;
        color: #78350F;
        text-transform: uppercase;
      }
      .step-desc {
        font-size: 10px;
        line-height: 1.28;
        color: #381A07;
        font-weight: 600;
      }

      /* Varian 2 Specials */
      .exp-mini-ticker {
        display: flex;
        border-top: 1.2px solid #78350F;
        border-bottom: 1.2px solid #78350F;
        padding: 4px 0;
        margin-top: auto;
      }
      .ticker-col {
        flex: 1;
        display: flex;
        flex-direction: column;
        align-items: center;
        text-align: center;
        border-right: 1px dashed rgba(120, 53, 15, 0.4);
        padding: 0 3px;
      }
      .ticker-col:last-child {
        border-right: none;
      }
      .ticker-v {
        font-family: 'Bebas Neue', sans-serif;
        font-size: 17px;
        color: #78350F;
        line-height: 1;
      }
      .ticker-l {
        font-size: 8px;
        font-weight: 700;
        color: #451A03;
        line-height: 1.1;
        text-transform: uppercase;
      }
      .exp-target-highlight {
        border: 1.2px solid #92400E;
        background: rgba(146, 64, 14, 0.08);
        border-radius: 3px;
        padding: 5px 7px;
        position: relative;
      }
      .target-flag {
        display: inline-block;
        background: #78350F;
        color: #FEF3C7;
        font-size: 8px;
        font-weight: 800;
        padding: 1px 5px;
        border-radius: 2px;
        letter-spacing: 0.8px;
        margin-bottom: 2px;
      }
      .target-title {
        font-family: 'Playfair Display', serif;
        font-size: 11.8px;
        font-weight: 800;
        color: #78350F;
        text-transform: uppercase;
      }
      .target-desc {
        font-size: 10px;
        line-height: 1.28;
        color: #381A07;
        font-weight: 600;
      }

      /* Varian 3 Specials */
      .exp-classic-triad {
        display: flex;
        gap: 5px;
        margin: 3px 0;
      }
      .triad-box {
        flex: 1;
        border-top: 1px solid #78350F;
        border-bottom: 1px solid #78350F;
        padding: 3px 2px;
        text-align: center;
      }
      .triad-val {
        font-family: 'Bebas Neue', sans-serif;
        font-size: 18px;
        color: #78350F;
        line-height: 1;
      }
      .triad-lbl {
        font-size: 8px;
        font-weight: 700;
        color: #451A03;
        line-height: 1.1;
        text-transform: uppercase;
      }
    `;

    return { html, css };
  }

  // INFOGRAPHIC_VISIONARY_TIMELINE (OPTION A: DIRECT EDITORIAL INK PRINT - ZERO FLOATING CARDS)
  // Menyatukan seluruh teks langsung ke dalam kanvas seni poster tanpa kotak kartu tempelan (No UI Cards)
  // Menghasilkan estetika cetak majalah/broadsheet profesional seperti template Steve Jobs aslinya.
  const nodeCount = Math.min(5, Math.max(3, points.length));
  const stats4V = statsList.slice(0, 4);

  // Common Safe Header: Top-Left Masthead (Direct typography on canvas, no solid box)
  const commonMastheadHtml = `
    <div class="vt-masthead-direct">
      <div class="vt-meta-bar">
        <span class="vt-kicker-tag">${esc(copy.kicker || 'DATA KEBIJAKAN PUBLIK // STRATEGI')}</span>
        <span class="vt-meta-edition">EDISI ADVOKASI PUBLIK • ${currentYear}</span>
      </div>
      <div class="vt-headline">${esc(headlineText)}</div>
      ${copy.deck ? `<div class="vt-deck">${esc(copy.deck)}</div>` : ''}
    </div>
  `;

  // Common Safe Stats: Top-Right Typography Strip (Direct typography with accent hairline)
  const commonStatsStripHtml = `
    <div class="vt-stats-strip">
      ${stats4V.map((st) => `
        <div class="vt-stat-unit">
          <div class="vt-stat-val">${esc(st.value)}</div>
          <div class="vt-stat-lbl">${esc(st.label)}</div>
        </div>
      `).join('')}
    </div>
  `;

  // Floating Chest Pill (framing the central visionary leader/subject)
  const chestPillHtml = `
    <div class="vt-chest-pill">
      ✦ ${esc(copy.kicker || 'DOKUMEN ANALISIS & CAPAIAN PROGRAM STRATEGIS')}
    </div>
  `;

  let html = '';

  if (resolvedVariant === 0) {
    // =========================================================================
    // VARIAN 0: DIRECT S-LOOP VECTOR TIMELINE RAIL (Steve Jobs Masterpiece)
    // Garis rel vektor berkelanjutan yang meliuk 2 baris menyatu langsung dengan visual
    // =========================================================================
    const half = Math.min(3, Math.ceil(points.length / 2));
    const row1 = points.slice(0, half);
    const row2 = points.slice(half, 5);

    html = `
      <div class="vt-top-ink-vignette"></div>
      <div class="vt-bottom-ink-bed"></div>

      ${commonMastheadHtml}
      ${commonStatsStripHtml}
      ${chestPillHtml}

      <div class="vt-timeline-rail-zone">
        <div class="vt-section-bar">
          <span class="vt-section-title">◈ ${esc(copy.sectionHeading || 'PETA JALAN TARGET & REALISASI CAPAIAN')}</span>
          <span class="vt-section-badge">01 – 0${points.length}</span>
        </div>

        <div class="vt-rail-rows-wrapper">
          <!-- Row 1: 3 Nodes -->
          <div class="vt-rail-row-1">
            ${row1.map((p, idx) => `
              <div class="vt-rail-node">
                <div class="vt-node-bullet"><div class="vt-node-inner-dot"></div></div>
                <div class="vt-node-chip">0${idx + 1}</div>
                <div class="vt-node-title">${esc(p.label)}</div>
                <div class="vt-node-desc">${esc(p.text)}</div>
              </div>
            `).join('')}
          </div>

          <!-- Continuity Track Divider -->
          <div class="vt-continuity-track">
            <div class="vt-track-line"></div>
            <span class="vt-track-label">KONTINUITAS IMPLEMENTASI KEBIJAKAN ➔</span>
            <div class="vt-track-line"></div>
          </div>

          <!-- Row 2: 2 Nodes + Direct Policy Synthesis -->
          <div class="vt-rail-row-2">
            ${row2.map((p, idx) => `
              <div class="vt-rail-node">
                <div class="vt-node-bullet"><div class="vt-node-inner-dot"></div></div>
                <div class="vt-node-chip">0${idx + row1.length + 1}</div>
                <div class="vt-node-title">${esc(p.label)}</div>
                <div class="vt-node-desc">${esc(p.text)}</div>
              </div>
            `).join('')}
            <div class="vt-policy-direct">
              <div class="vt-policy-tag">✦ SINTESIS KEBIJAKAN &amp; AKUNTABILITAS</div>
              <div class="vt-policy-text">"${esc(copy.closingLine || 'Penting untuk terus meningkatkan transparansi dan akuntabilitas dalam setiap kebijakan untuk memperkuat kepercayaan publik.')}"</div>
            </div>
          </div>
        </div>
      </div>
    `;
  } else if (resolvedVariant === 1) {
    // =========================================================================
    // VARIAN 1: BENTO ROADMAP DIRECT (Batas Garis Halus Organik, Tanpa Kotak Tebal)
    // =========================================================================
    const heroPoint = points[0] || { label: 'PROGRAM UTAMA STRATEGIS', text: headlineText };
    const subPoints = points.slice(1, 5);

    html = `
      <div class="vt-top-ink-vignette"></div>
      <div class="vt-bottom-ink-bed"></div>

      ${commonMastheadHtml}
      ${commonStatsStripHtml}
      ${chestPillHtml}

      <div class="vt-bento-direct-zone">
        <!-- Left Hero Phase -->
        <div class="vt-bento-hero-direct">
          <div>
            <div class="vt-bento-hero-meta">
              <span class="vt-hero-pill">01</span>
              <span class="vt-bento-badge">FOKUS UTAMA</span>
            </div>
            <div class="vt-bento-hero-title">${esc(heroPoint.label)}</div>
            <div class="vt-bento-hero-desc">${esc(heroPoint.text)}</div>
          </div>
          <div class="vt-policy-direct" style="margin-top: 14px;">
            <div class="vt-policy-tag">✦ IMPLIKASI KEBIJAKAN</div>
            <div class="vt-policy-text">${esc(copy.closingLine || 'Transparansi anggaran menjadi prioritas percepatan pembangunan.')}</div>
          </div>
        </div>

        <!-- Right 2x2 Sub-Milestones Grid -->
        <div class="vt-bento-subgrid-direct">
          ${subPoints.map((p, idx) => `
            <div class="vt-bento-subnode">
              <div class="vt-node-chip">0${idx + 2}</div>
              <div class="vt-node-title">${esc(p.label)}</div>
              <div class="vt-node-desc">${esc(p.text)}</div>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  } else if (resolvedVariant === 2) {
    // =========================================================================
    // VARIAN 2: DIRECT ELEVATED STEPPERS (5 Kolom Tanpa Background Kotak)
    // =========================================================================
    html = `
      <div class="vt-top-ink-vignette"></div>
      <div class="vt-bottom-ink-bed"></div>

      ${commonMastheadHtml}
      ${commonStatsStripHtml}
      ${chestPillHtml}

      <div class="vt-columns-direct-zone">
        <div class="vt-section-bar">
          <span class="vt-section-title">◈ ${esc(copy.sectionHeading || 'STRATEGI IMPLEMENTASI & TARGET CAPAIAN')}</span>
          <span class="vt-section-badge">01 – 0${points.length}</span>
        </div>

        <div class="vt-cols-direct-grid">
          ${points.slice(0, 5).map((p, idx) => `
            <div class="vt-col-direct-item">
              <div class="vt-col-header">
                <span class="vt-col-step-tag">0${idx + 1}</span>
                <span class="vt-col-bead"></span>
              </div>
              <div class="vt-col-title">${esc(p.label)}</div>
              <div class="vt-col-desc">${esc(p.text)}</div>
            </div>
          `).join('')}
        </div>

        <div class="vt-policy-direct" style="margin-top: 12px;">
          <div class="vt-policy-text">
            <strong style="color: ${accentColor}; text-transform: uppercase; margin-right: 6px;">✦ SINTESIS KEBIJAKAN:</strong>
            ${esc(copy.closingLine || 'Penting untuk terus meningkatkan akuntabilitas publik.')}
          </div>
        </div>
      </div>
    `;
  } else {
    // =========================================================================
    // VARIAN 3: ASYMMETRIC VERTICAL CHRONICLE SPINE
    // Tulang Punggung Vertikal Tipis di Sisi Kanan Tanpa Kotak Tebal
    // =========================================================================
    html = `
      <div class="vt-top-ink-vignette"></div>
      <div class="vt-bottom-ink-bed"></div>

      <div class="vt-spine-direct-left">
        ${commonMastheadHtml}
        ${commonStatsStripHtml}
        <div class="vt-policy-direct" style="margin-top: 16px;">
          <div class="vt-policy-tag">✦ KOMITMEN AUDIT PUBLIK</div>
          <div class="vt-policy-text">"${esc(copy.closingLine || 'Integritas dan pengawasan masyarakat menjadi pilar suksesnya tata kelola pembangunan daerah.')}"</div>
        </div>
      </div>

      <div class="vt-spine-direct-right">
        <div class="vt-section-bar">
          <span class="vt-section-title">◈ ${esc(copy.sectionHeading || 'STRATEGI IMPLEMENTASI & TARGET CAPAIAN')}</span>
          <span class="vt-section-badge">01 – 0${points.length}</span>
        </div>
        <div class="vt-spine-nodes-list">
          ${points.slice(0, 5).map((p, idx) => `
            <div class="vt-spine-node-direct">
              <div class="vt-spine-node-meta">
                <span class="vt-node-chip">0${idx + 1}</span>
                <span class="vt-spine-node-title">${esc(p.label)}</span>
              </div>
              <div class="vt-node-desc">${esc(p.text)}</div>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }

  const css = `
    /* SEAMLESS INK WASH OVERLAYS (NO CARD BOUNDARIES) */
    .vt-top-ink-vignette {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 320px;
      background: linear-gradient(180deg, rgba(11,15,25,0.92) 0%, rgba(11,15,25,0.72) 60%, transparent 100%);
      z-index: 2;
      pointer-events: none;
    }
    .vt-bottom-ink-bed {
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      height: 780px;
      background: linear-gradient(0deg, rgba(11,15,25,0.98) 0%, rgba(11,15,25,0.93) 65%, rgba(11,15,25,0.72) 90%, transparent 100%);
      z-index: 2;
      pointer-events: none;
    }

    /* DIRECT MASTHEAD (NO SOLID CARD) */
    .vt-masthead-direct {
      position: absolute;
      top: 56px;
      left: 48px;
      width: 580px;
      z-index: 10;
    }
    .vt-meta-bar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 1px solid rgba(255,255,255,0.15);
      padding-bottom: 5px;
      margin-bottom: 6px;
    }
    .vt-kicker-tag {
      font-size: 11.5px;
      font-weight: 900;
      letter-spacing: 1.8px;
      color: ${accentColor};
      text-transform: uppercase;
    }
    .vt-meta-edition {
      font-size: 10px;
      font-weight: 800;
      letter-spacing: 0.8px;
      color: #E2E8F0;
      opacity: 0.85;
    }
    .vt-headline {
      font-family: 'Bebas Neue', sans-serif;
      font-size: 52px;
      line-height: 0.94;
      letter-spacing: 1.2px;
      color: #FFFFFF;
      text-transform: uppercase;
      margin-bottom: 6px;
      word-break: break-word;
      text-shadow: 0 2px 10px rgba(0,0,0,0.8);
    }
    .vt-deck {
      font-family: 'Plus Jakarta Sans', sans-serif;
      font-style: normal;
      font-size: 13.8px;
      line-height: 1.44;
      font-weight: 600;
      color: #E2E8F0;
      text-shadow: 0 1px 6px rgba(0,0,0,0.8);
    }

    /* DIRECT STATS STRIP (NO SOLID CARD) */
    .vt-stats-strip {
      position: absolute;
      top: 56px;
      right: 48px;
      width: 380px;
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 12px;
      z-index: 10;
    }
    .vt-stat-unit {
      border-left: 2.5px solid ${accentColor};
      padding-left: 10px;
    }
    .vt-stat-val {
      font-family: 'Bebas Neue', sans-serif;
      font-size: 34px;
      line-height: 0.95;
      color: ${accentColor};
      text-shadow: 0 2px 8px rgba(0,0,0,0.8);
    }
    .vt-stat-lbl {
      font-size: 10px;
      font-weight: 800;
      color: #E2E8F0;
      text-transform: uppercase;
      letter-spacing: 0.8px;
      line-height: 1.25;
      margin-top: 2px;
    }

    /* CHEST RIBBON (FOCAL HIGHLIGHT) */
    .vt-chest-pill {
      position: absolute;
      top: 555px;
      left: 50%;
      transform: translateX(-50%);
      background: rgba(11, 15, 25, 0.88);
      border: 1px solid ${accentColor}88;
      border-radius: 20px;
      padding: 6px 22px;
      font-size: 11px;
      font-weight: 900;
      letter-spacing: 1.5px;
      color: #FFFFFF;
      text-transform: uppercase;
      box-shadow: 0 4px 20px rgba(0,0,0,0.6);
      backdrop-filter: blur(4px);
      z-index: 10;
      white-space: nowrap;
    }

    /* COMMON DIRECT COMPONENTS */
    .vt-section-bar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 1.5px solid ${accentColor};
      padding-bottom: 6px;
      margin-bottom: 16px;
    }
    .vt-section-title {
      font-family: 'Bebas Neue', sans-serif;
      font-size: 22px;
      letter-spacing: 1.5px;
      color: #FFFFFF;
      text-transform: uppercase;
    }
    .vt-section-badge {
      font-size: 10.5px;
      font-weight: 800;
      color: ${accentColor};
      letter-spacing: 1px;
      text-transform: uppercase;
    }
    .vt-node-chip {
      font-family: 'Bebas Neue', sans-serif;
      font-size: 14px;
      color: ${accentColor};
      letter-spacing: 1px;
      margin-bottom: 2px;
    }
    .vt-node-title {
      font-size: 13.5px;
      font-weight: 800;
      color: #FFFFFF;
      text-transform: uppercase;
      line-height: 1.25;
      margin-bottom: 4px;
    }
    .vt-node-desc {
      font-size: 11px;
      line-height: 1.45;
      color: #CBD5E1;
      font-weight: 400;
    }
    .vt-policy-direct {
      border-left: 3px solid ${accentColor};
      padding-left: 14px;
      display: flex;
      flex-direction: column;
      justify-content: center;
    }
    .vt-policy-tag {
      font-size: 10.5px;
      font-weight: 900;
      color: ${accentColor};
      letter-spacing: 1.2px;
      text-transform: uppercase;
      margin-bottom: 4px;
    }
    .vt-policy-text {
      font-size: 12px;
      line-height: 1.5;
      color: #FFFFFF;
      font-weight: 600;
    }

    /* VARIAN 0: S-LOOP RAIL */
    .vt-timeline-rail-zone {
      position: absolute;
      top: 610px;
      left: 48px;
      right: 48px;
      bottom: 115px;
      z-index: 10;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
    }
    .vt-rail-rows-wrapper {
      display: flex;
      flex-direction: column;
      gap: 18px;
    }
    .vt-rail-row-1 {
      display: grid;
      grid-template-columns: 1fr 1fr 1fr;
      gap: 20px;
      position: relative;
    }
    .vt-rail-row-1::before {
      content: '';
      position: absolute;
      top: 10px;
      left: 20px;
      right: 20px;
      height: 2px;
      background: linear-gradient(90deg, ${accentColor}, ${accentColor}cc);
      z-index: 1;
    }
    .vt-rail-node {
      position: relative;
      z-index: 2;
    }
    .vt-node-bullet {
      width: 20px;
      height: 20px;
      border-radius: 10px;
      background: ${accentColor};
      border: 3px solid #0B0F19;
      box-shadow: 0 0 10px ${accentColor};
      margin-bottom: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .vt-node-inner-dot {
      width: 6px;
      height: 6px;
      border-radius: 3px;
      background: #FFFFFF;
    }
    .vt-continuity-track {
      display: flex;
      align-items: center;
      gap: 12px;
      margin: 2px 0;
    }
    .vt-track-line {
      flex: 1;
      height: 1px;
      background: rgba(255,255,255,0.15);
    }
    .vt-track-label {
      font-size: 10px;
      font-weight: 900;
      letter-spacing: 1.5px;
      color: ${accentColor};
      text-transform: uppercase;
    }
    .vt-rail-row-2 {
      display: grid;
      grid-template-columns: 1fr 1fr 1.3fr;
      gap: 20px;
      position: relative;
    }
    .vt-rail-row-2::before {
      content: '';
      position: absolute;
      top: 10px;
      left: 20px;
      width: 60%;
      height: 2px;
      background: linear-gradient(90deg, ${accentColor}, ${accentColor}cc);
      z-index: 1;
    }

    /* VARIAN 1: BENTO DIRECT */
    .vt-bento-direct-zone {
      position: absolute;
      top: 610px;
      left: 48px;
      right: 48px;
      bottom: 115px;
      display: grid;
      grid-template-columns: 380px 1fr;
      gap: 24px;
      z-index: 10;
    }
    .vt-bento-hero-direct {
      border-right: 1px solid rgba(255,255,255,0.15);
      padding-right: 20px;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
    }
    .vt-bento-hero-meta {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 8px;
    }
    .vt-hero-pill {
      font-family: 'Bebas Neue', sans-serif;
      font-size: 16px;
      background: ${accentColor};
      color: #FFF;
      padding: 2px 8px;
      border-radius: 3px;
    }
    .vt-bento-badge {
      font-size: 10.5px;
      font-weight: 800;
      color: ${accentColor};
      letter-spacing: 1px;
    }
    .vt-bento-hero-title {
      font-family: 'Bebas Neue', sans-serif;
      font-size: 36px;
      line-height: 1.05;
      color: #FFFFFF;
      text-transform: uppercase;
      margin-bottom: 10px;
    }
    .vt-bento-hero-desc {
      font-size: 13.5px;
      line-height: 1.55;
      color: #CBD5E1;
      font-weight: 400;
    }
    .vt-bento-subgrid-direct {
      display: grid;
      grid-template-columns: 1fr 1fr;
      grid-template-rows: 1fr 1fr;
      gap: 18px;
    }
    .vt-bento-subnode {
      border-left: 2px solid ${accentColor};
      padding-left: 12px;
    }

    /* VARIAN 2: COLUMNS DIRECT */
    .vt-columns-direct-zone {
      position: absolute;
      top: 610px;
      left: 48px;
      right: 48px;
      bottom: 115px;
      z-index: 10;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
    }
    .vt-cols-direct-grid {
      display: grid;
      grid-template-columns: repeat(5, 1fr);
      gap: 16px;
      flex: 1;
    }
    .vt-col-direct-item {
      border-top: 2.5px solid ${accentColor};
      padding-top: 10px;
    }
    .vt-col-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 6px;
    }
    .vt-col-step-tag {
      font-family: 'Bebas Neue', sans-serif;
      font-size: 16px;
      color: ${accentColor};
    }
    .vt-col-bead {
      width: 6px;
      height: 6px;
      border-radius: 3px;
      background: ${accentColor};
    }
    .vt-col-title {
      font-size: 12px;
      font-weight: 800;
      color: #FFFFFF;
      text-transform: uppercase;
      margin-bottom: 6px;
      line-height: 1.25;
    }
    .vt-col-desc {
      font-size: 10.5px;
      line-height: 1.42;
      color: #CBD5E1;
    }

    /* VARIAN 3: SPINE DIRECT */
    .vt-spine-direct-left {
      position: absolute;
      top: 56px;
      left: 48px;
      width: 440px;
      bottom: 115px;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      z-index: 10;
    }
    .vt-spine-direct-left .vt-masthead-direct {
      position: static;
      width: 100%;
    }
    .vt-spine-direct-left .vt-stats-strip {
      position: static;
      width: 100%;
      margin-top: 14px;
    }
    .vt-spine-direct-right {
      position: absolute;
      top: 56px;
      right: 48px;
      width: 500px;
      bottom: 115px;
      z-index: 10;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
    }
    .vt-spine-nodes-list {
      display: flex;
      flex-direction: column;
      gap: 14px;
      flex: 1;
      justify-content: space-between;
    }
    .vt-spine-node-direct {
      border-left: 2.5px solid ${accentColor};
      padding-left: 12px;
    }
    .vt-spine-node-meta {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 2px;
    }
    .vt-spine-node-title {
      font-size: 12.5px;
      font-weight: 800;
      color: #FFFFFF;
      text-transform: uppercase;
    }
  `;

  return { html, css };
}


async function extractInfographicPhotoSlots(
  mainBuffer: Buffer,
  bgBase64: string,
  secondaryBuffers?: Buffer[]
): Promise<[string, string, string, string]> {
  try {
    if (secondaryBuffers && secondaryBuffers.length >= 3) {
      const p0 = bgBase64;
      const p1 = `data:image/webp;base64,${(await sharp(secondaryBuffers[0]).resize(540, 675, { fit: 'cover' }).webp({ quality: 85 }).toBuffer()).toString('base64')}`;
      const p2 = `data:image/webp;base64,${(await sharp(secondaryBuffers[1]).resize(540, 675, { fit: 'cover' }).webp({ quality: 85 }).toBuffer()).toString('base64')}`;
      const p3 = `data:image/webp;base64,${(await sharp(secondaryBuffers[2]).resize(540, 675, { fit: 'cover' }).webp({ quality: 85 }).toBuffer()).toString('base64')}`;
      return [p0, p1, p2, p3];
    }
    const meta = await sharp(mainBuffer).metadata();
    const w = meta.width || 1080;
    const h = meta.height || 1350;
    const halfW = Math.floor(w / 2);
    const halfH = Math.floor(h / 2);

    const [q0, q1, q2, q3] = await Promise.all([
      sharp(mainBuffer).extract({ left: 0, top: 0, width: halfW, height: halfH }).webp({ quality: 85 }).toBuffer(),
      sharp(mainBuffer).extract({ left: halfW, top: 0, width: halfW, height: halfH }).webp({ quality: 85 }).toBuffer(),
      sharp(mainBuffer).extract({ left: 0, top: halfH, width: halfW, height: halfH }).webp({ quality: 85 }).toBuffer(),
      sharp(mainBuffer).extract({ left: halfW, top: halfH, width: halfW, height: halfH }).webp({ quality: 85 }).toBuffer(),
    ]);

    return [
      `data:image/webp;base64,${q0.toString('base64')}`,
      `data:image/webp;base64,${q1.toString('base64')}`,
      `data:image/webp;base64,${q2.toString('base64')}`,
      `data:image/webp;base64,${q3.toString('base64')}`,
    ];
  } catch {
    return [bgBase64, bgBase64, bgBase64, bgBase64];
  }
}

export class ChromiumPosterCompositor {
  public static async compose(
    params: ChromiumPosterComposeParams
  ): Promise<ChromiumPosterComposeResult> {
    const {
      canvasBuffer,
      copy,
      zones,
      palette = {},
      signature = 'POLARIS // REPUBLIK INDONESIA',
      editionTag = 'POLARIS // EDISI KHUSUS',
      headerTag,
      badgeTag,
      textToneHint,
      archetype,
    } = params;

    // 0. Auto-Trim White Mockup Margins: Pastikan kanvas selalu 100% FULL-BLEED tanpa border putih
    let effectiveCanvasBuffer = canvasBuffer;
    try {
      const origMeta = await sharp(canvasBuffer).metadata();
      if (origMeta.width && origMeta.height) {
        const trimmed = await sharp(canvasBuffer)
          .trim({ background: { r: 255, g: 255, b: 255 }, threshold: 30 })
          .toBuffer({ resolveWithObject: true });
        if (
          origMeta.width - trimmed.info.width > 15 ||
          origMeta.height - trimmed.info.height > 15
        ) {
          // Crop 6px ke dalam untuk membersihkan sisa drop shadow, fringe putih, atau mockup border
          const cropInset = 6;
          const cropW = Math.max(10, trimmed.info.width - cropInset * 2);
          const cropH = Math.max(10, trimmed.info.height - cropInset * 2);
          effectiveCanvasBuffer = await sharp(trimmed.data)
            .extract({ left: cropInset, top: cropInset, width: cropW, height: cropH })
            .resize(1080, 1350, { fit: 'cover' })
            .webp({ quality: 95 })
            .toBuffer();
        }
      }
    } catch {
      // Fallback aman ke canvasBuffer asli
    }

    // 1. Deteksi Luminansi Rata-rata Kanvas menggunakan Sharp
    const [stats, meta] = await Promise.all([
      sharp(effectiveCanvasBuffer).stats(),
      sharp(effectiveCanvasBuffer).metadata(),
    ]);
    const [r, g, b] = stats.channels.map((c) => c.mean);
    const luminance = 0.299 * r + 0.587 * g + 0.114 * b;

    const isLightPaper = textToneHint
      ? textToneHint === 'DARK'
      : luminance > 135;

    const isInfographic = isInfographicArchetype(archetype);
    const blendModeUsed: 'multiply' | 'normal' = isInfographic
      ? 'normal'
      : isLightPaper
      ? 'multiply'
      : 'normal';

    const primaryColor = isLightPaper ? '#111827' : '#FFFFFF';
    const accentColor = safeHex(palette.accentHex, isLightPaper ? '#DC2626' : '#FBBF24');
    const secondaryColor = safeHex(palette.secondaryHex, isLightPaper ? '#334155' : '#E2E8F0');
    const textShadow = isLightPaper
      ? 'none'
      : '0 2px 14px rgba(0, 0, 0, 0.85), 0 1px 3px rgba(0, 0, 0, 0.9)';

    // Bounding Box Koordinat Aman dari AI Vision (persen -> pixel)
    const hl = zones.headline || { x: 0.08, y: 0.06, w: 0.84, h: 0.18 };
    const bd = zones.body || { x: 0.08, y: 0.26, w: 0.84, h: 0.28 };
    const ft = zones.footer || { x: 0.08, y: 0.88, w: 0.84, h: 0.07 };

    const hlTop = Math.round(hl.y * 1350);
    const hlLeft = Math.round(hl.x * 1080);
    const hlWidth = Math.round(hl.w * 1080);

    const bdLeft = Math.round(bd.x * 1080);
    const bdWidth = Math.round(bd.w * 1080);

    const ftTop = isInfographic ? 1250 : Math.round(ft.y * 1350);
    const ftLeft = isInfographic ? 54 : Math.round(ft.x * 1080);
    const ftWidth = isInfographic ? 972 : Math.round(ft.w * 1080);

    // Unified Editorial Column bounds (mencegah collision antar elemen 100%):
    let flowLeft = Math.max(40, Math.min(hlLeft, bdLeft));
    let flowTop = isInfographic
      ? (hl.y >= 0.35 ? Math.min(hlTop, 600) : Math.max(70, hlTop))
      : Math.max(105, hlTop);

    let rawFlowWidth = Math.round(Math.max(hlWidth, bdWidth));
    if (isInfographic && rawFlowWidth > 700) {
      // Infografis top/bottom: beri ruang lebar simetris dan lega
      flowLeft = Math.min(flowLeft, 54);
      rawFlowWidth = Math.max(rawFlowWidth, 972);
    }
    const safeFlowWidth = Math.min(rawFlowWidth, 1040 - flowLeft);
    const flowMaxHeight = isInfographic
      ? Math.max(620, ftTop - flowTop - 15)
      : Math.max(250, ftTop - flowTop - 20);

    // Dynamic Font Sizing berdasarkan panjang judul
    const headlineText = (copy.headline || 'ADVOKASI PUBLIK').toUpperCase();
    const titleFontSize = isInfographic
      ? (headlineText.length > 28 ? 48 : headlineText.length > 18 ? 58 : 68)
      : (headlineText.length > 28 ? 64 : headlineText.length > 18 ? 76 : 90);

    const bgMime =
      meta.format === 'png' ? 'image/png' : meta.format === 'jpeg' ? 'image/jpeg' : 'image/webp';
    const bgBase64 = `data:${bgMime};base64,${effectiveCanvasBuffer.toString('base64')}`;
    const fontFaceCss = await ChromiumFontFace.getCss();
    const currentYear = new Date().getFullYear();
    const resolvedBadgeTag = badgeTag || `TELAAH PUBLIK // ${currentYear}`;

    // Bangun poin-poin HTML dan CSS dinamis adaptif terhadap arketipe
    let mainContentHtml = '';
    let customLayoutCss = '';

    if (isInfographic) {
      const photoSlots =
        archetype === 'INFOGRAPHIC_CHRONICLE_GRID' ||
        archetype === 'INFOGRAPHIC_RADIAL_CLOCK' ||
        archetype === 'INFOGRAPHIC_NARRATIVE_WAVE'
          ? await extractInfographicPhotoSlots(effectiveCanvasBuffer, bgBase64, params.secondaryCanvasBuffers)
          : undefined;

      const infoLayout = renderInfographicArchetypeLayout({
        layoutVariant: params.layoutVariant,
        archetype,
        copy,
        headlineText,
        primaryColor,
        accentColor,
        secondaryColor,
        isLightPaper,
        textShadow,
        currentYear,
        bgBase64,
        photoSlots,
        signature: params.signature,
        editionTag: params.editionTag,
        headerTag: params.headerTag,
      });
      mainContentHtml = infoLayout.html;
      customLayoutCss = infoLayout.css;
    } else {
      const posterPoints = (copy.points || [])
        .map(
          (p: ChromiumPosterPoint) => `
          <div class="point-item">
            <div class="point-label">
              ✦ ${esc(p.label)}
            </div>
            <div class="point-text">
              ${esc(p.text)}
            </div>
          </div>
        `
        )
        .join('');

      customLayoutCss = `
        /* Unified Editorial Flow Column: Menjamin teks tidak bertumpuk */
        .editorial-flow-zone {
          position: absolute;
          top: ${flowTop}px;
          left: ${flowLeft}px;
          width: ${safeFlowWidth}px;
          max-height: ${flowMaxHeight}px;
          box-sizing: border-box;
          display: flex;
          flex-direction: column;
          text-shadow: ${textShadow};
        }

        .kicker {
          font-size: 15px;
          font-weight: 800;
          color: ${accentColor};
          letter-spacing: 2.5px;
          text-transform: uppercase;
          margin-bottom: 6px;
        }

        .headline {
          font-family: 'Bebas Neue', 'Anton', sans-serif;
          font-size: ${titleFontSize}px;
          line-height: 0.94;
          color: ${primaryColor};
          letter-spacing: 1.5px;
          margin-bottom: 12px;
          word-break: break-word;
        }

        .deck {
          font-family: 'Playfair Display', serif;
          font-size: 21px;
          line-height: 1.35;
          color: ${secondaryColor};
          font-style: italic;
          font-weight: 500;
          max-width: 96%;
          margin-bottom: 16px;
        }

        .points-container {
          display: flex;
          flex-direction: column;
          gap: 12px;
          margin-bottom: 12px;
        }

        .point-item {
          display: flex;
          flex-direction: column;
        }

        .point-label {
          font-size: 14px;
          font-weight: 800;
          color: ${accentColor};
          letter-spacing: 1.5px;
          text-transform: uppercase;
          margin-bottom: 2px;
        }

        .point-text {
          font-size: 17px;
          line-height: 1.35;
          color: ${secondaryColor};
          font-weight: 500;
        }

        .closing-line {
          font-size: 14.5px;
          font-weight: 700;
          color: ${primaryColor};
          margin-top: 6px;
          background: ${isLightPaper ? 'rgba(255, 255, 255, 0.92)' : 'rgba(15, 23, 42, 0.88)'};
          border-left: 4px solid ${accentColor};
          padding: 8px 14px;
          border-radius: 6px;
          line-height: 1.35;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
        }
      `;

      mainContentHtml = `
        <div class="editorial-flow-zone">
          <div class="kicker">${esc(copy.kicker || 'TELAAH KEBIJAKAN')}</div>
          <div class="headline">${esc(headlineText)}</div>
          ${copy.deck ? `<div class="deck">${esc(copy.deck)}</div>` : ''}
          <div class="points-container">
            ${posterPoints}
          </div>
          ${copy.closingLine ? `<div class="closing-line">${esc(copy.closingLine)}</div>` : ''}
        </div>
      `;
    }

    const html = `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="utf-8">
  <style>
    ${fontFaceCss}

    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }

    body {
      width: 1080px;
      height: 1350px;
      overflow: hidden;
      position: relative;
      background-image: url('${bgBase64}');
      background-size: cover;
      background-position: center;
      font-family: 'Plus Jakarta Sans', sans-serif;
      -webkit-font-smoothing: antialiased;
    }

    /* Container Tipografi Zero-Box: Tinta Meresap Langsung ke Kertas */
    .ink-layer {
      position: absolute;
      top: 0;
      left: 0;
      width: 1080px;
      height: 1350px;
      mix-blend-mode: ${blendModeUsed};
      pointer-events: none;
    }

    /* Top Running Header / Edition Tag */
    .edition-tag {
      position: absolute;
      top: ${archetype === 'INFOGRAPHIC_HISTORICAL_EXPEDITION' ? '14px' : (archetype === 'INFOGRAPHIC_NARRATIVE_WAVE' ? '16px' : (isInfographic ? '24px' : '36px'))};
      left: ${archetype === 'INFOGRAPHIC_HISTORICAL_EXPEDITION' ? '330px' : (isInfographic ? '48px' : '86px')};
      right: ${isInfographic ? '48px' : '86px'};
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 12px;
      font-weight: 800;
      letter-spacing: 2px;
      color: ${archetype === 'INFOGRAPHIC_NARRATIVE_WAVE' ? '#0F172A' : (isInfographic ? '#FFFFFF' : (isLightPaper ? '#0F172A' : '#FFFFFF'))};
      text-transform: uppercase;
      z-index: 20;
    }

    ${customLayoutCss}

    /* Footer Zone */
    .footer-zone {
      position: absolute;
      top: ${ftTop}px;
      left: ${ftLeft}px;
      width: ${ftWidth}px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      background: ${isInfographic ? 'rgba(11, 15, 25, 0.94)' : (isLightPaper ? 'rgba(255, 255, 255, 0.95)' : 'rgba(15, 23, 42, 0.92)')};
      border: 1px solid ${isInfographic ? `${accentColor}55` : (isLightPaper ? 'rgba(0,0,0,0.1)' : 'rgba(255,255,255,0.12)')};
      border-radius: 6px;
      padding: 8px 18px;
      box-shadow: 0 4px 16px rgba(0, 0, 0, 0.3);
      backdrop-filter: blur(8px);
      z-index: 20;
    }

    .signature-title {
      font-family: 'Bebas Neue', sans-serif;
      font-size: 22px;
      letter-spacing: 1.5px;
      color: ${isInfographic ? '#FFFFFF' : (isLightPaper ? '#0F172A' : '#FFFFFF')};
    }

    .footer-year {
      font-family: 'Bebas Neue', sans-serif;
      font-size: 24px;
      letter-spacing: 2px;
      color: ${accentColor};
    }

    /* Master Paper Grain Overlay (Menghilangkan kesan plastik pada kotak HTML) */
    .master-noise-overlay {
      position: absolute;
      top: 0;
      left: 0;
      width: 1080px;
      height: 1350px;
      pointer-events: none;
      mix-blend-mode: multiply;
      z-index: 99;
    }
  </style>
</head>
<body>
  <!-- Master Paper Grain & Fiber Noise Overlay (Bakes into every card, text, and photo) -->
  <svg class="master-noise-overlay" width="1080" height="1350" xmlns="http://www.w3.org/2000/svg">
    <filter id="paperGrain">
      <feTurbulence type="fractalNoise" baseFrequency="0.75" numOctaves="3" stitchTiles="stitch" />
      <feColorMatrix type="matrix" values="0.33 0.33 0.33 0 0  0.33 0.33 0.33 0 0  0.33 0.33 0.33 0 0  0 0 0 1 0" />
    </filter>
    <rect width="100%" height="100%" filter="url(#paperGrain)" opacity="0.035" />
  </svg>

  <div class="ink-layer">
    <div class="edition-tag">
      <span style="color: ${accentColor}; font-weight: 900; background: ${archetype === 'INFOGRAPHIC_NARRATIVE_WAVE' ? 'rgba(255,255,255,0.85)' : 'transparent'}; padding: ${archetype === 'INFOGRAPHIC_NARRATIVE_WAVE' ? '2px 8px' : '0'}; border-radius: 3px;">${esc(editionTag)}</span>
      <span style="color: ${archetype === 'INFOGRAPHIC_NARRATIVE_WAVE' ? '#0F172A' : (isLightPaper ? '#475569' : '#CBD5E1')}; font-weight: 800; background: ${archetype === 'INFOGRAPHIC_NARRATIVE_WAVE' ? 'rgba(255,255,255,0.85)' : 'transparent'}; padding: ${archetype === 'INFOGRAPHIC_NARRATIVE_WAVE' ? '2px 8px' : '0'}; border-radius: 3px;">${esc(headerTag || 'DOKUMEN ANALISIS PUBLIK')}</span>
    </div>

    ${mainContentHtml}

    <div class="footer-zone">
      <div class="signature-title">${esc(signature)}</div>
      <div class="footer-year">${currentYear}</div>
    </div>
  </div>

  <script>
    (function() {
      function fitEditorialFlow() {
        const flow = document.querySelector('.editorial-flow-zone');
        if (!flow) return;
        flow.style.transform = 'none';
        flow.style.width = '${safeFlowWidth}px';

        const maxH = ${flowMaxHeight};
        const baseW = ${safeFlowWidth};
        if (flow.scrollHeight > maxH) {
          const ratio = Math.max(0.65, (maxH / flow.scrollHeight) * 0.98);
          flow.style.transform = 'scale(' + ratio + ')';
          flow.style.transformOrigin = 'top left';
          flow.style.width = (baseW / ratio) + 'px';
        }
      }
      fitEditorialFlow();
      if (document.fonts) {
        document.fonts.ready.then(fitEditorialFlow);
      }
    })();
  </script>
</body>
</html>`;

    // 2. Render melalui Singleton Chromium Ephemeral Context
    const { buffer: renderedWebpBuffer, layoutManifest } = await BrowserSingleton.renderHtmlWithLayers(html, {
      width: 1080,
      height: 1350,
      quality: 90,
    });

    return {
      buffer: renderedWebpBuffer,
      sizeBytes: renderedWebpBuffer.length,
      detectedLuminance: luminance,
      blendModeUsed,
      layoutManifest: layoutManifest || null,
    };
  }
}
