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
    // Standard Gold Reference: Zero Floating Cards / Pure Editorial Inked Broadsheet
    // Layout strictly conforms to the reference standard (Images 1-4):
    // 1. Top Masthead + Kicker + Condensed Big Headline + Context Deck + 4-Column KPI Hero Metric Bar
    // 2. Middle Section: Clean Documentary Photo (Zero text on photo) + S-Curve Red Wave (Points 01-03)
    // 3. Bottom Section: Section Heading + Pure SVG 2D Donut Chart (Proporsi 100%) + Points 04-06
    // 4. Footer Closing Callout Pill + Politician Identity Bar
    // ZERO CARD WRAPPERS, ZERO FROSTED GLASS BOXES around points/charts!

    const p1 = points[0] || { label: 'KONDISI INFRASTRUKTUR SAAT INI', text: 'Analisis kondisi lapangan menunjukkan perlunya akselerasi penanganan infrastruktur jalan yang terukur dan tepat sasaran.' };
    const p2 = points[1] || { label: 'WILAYAH PRIORITAS PERBAIKAN', text: 'Penetapan kecamatan prioritas dilakukan berdasarkan pemetaan tingkat kerusakan dan dampak langsung terhadap mobilitas ekonomi masyarakat.' };
    const p3 = points[2] || { label: 'MEKANISME PELAKSANAAN PROGRAM', text: 'Penyaluran alokasi anggaran dilakukan secara bertahap melalui kolaborasi lintas dinas dan pengawasan berkala.' };
    const p4 = points[3] || { label: 'PENINGKATAN KUALITAS FASILITAS', text: 'Standar perbaikan mencakup pengaspalan berkualitas dan pembenahan drainase penunjang guna memperpanjang usia pakai jalan.' };
    const p5 = points[4] || { label: 'TRANSPARANSI DATA & PENGAWASAN', text: 'Pemutakhiran berkala data progres fisik dan pelibatan publik diterapkan untuk memastikan akuntabilitas penggunaan anggaran.' };
    const p6 = points[5] || { label: 'DAMPAK JANGKA PANJANG PERBAIKAN', text: 'Peningkatan kemantapan ruas jalan ditargetkan menurunkan biaya logistik dan mempercepat pertumbuhan ekonomi daerah.' };

    const rawCleanStats = (statsList.length > 0 ? statsList : [
      { value: '60%', label: 'Jalan Mantap' },
      { value: 'RP 150 M', label: 'Total Anggaran' },
      { value: '10 KECAMATAN', label: 'Wilayah Prioritas' },
      { value: '> 500.000', label: 'Target Penerima Manfaat' },
    ]).slice(0, 4);

    const seenStatKeys = new Set<string>();
    const cleanStats: Array<{ value: string; label: string }> = [];
    for (const st of rawCleanStats) {
      const k = `${st.value.toLowerCase().replace(/[^a-z0-9]/g, '')}|${st.label.toLowerCase().replace(/[^a-z0-9]/g, '')}`;
      if (!seenStatKeys.has(k)) {
        seenStatKeys.add(k);
        cleanStats.push(st);
      }
    }
    const fallbackStatsPool = [
      { value: 'RP 150 M', label: 'Alokasi Pagu' },
      { value: '10 KECAMATAN', label: 'Cakupan Wilayah' },
      { value: '85%', label: 'Target Kemantapan' },
      { value: '> 500.000', label: 'Penerima Manfaat' },
    ];
    for (const fb of fallbackStatsPool) {
      if (cleanStats.length >= 4) break;
      const k = `${fb.value.toLowerCase().replace(/[^a-z0-9]/g, '')}|${fb.label.toLowerCase().replace(/[^a-z0-9]/g, '')}`;
      if (!seenStatKeys.has(k) && !cleanStats.some(s => s.value === fb.value)) {
        seenStatKeys.add(k);
        cleanStats.push(fb);
      }
    }

    const variantIndex = resolvedVariant % 4;
    const sectionHeading = copy.sectionHeading || 'STRATEGI PENANGANAN & TARGET CAPAIAN';

    const commonWaveCss = `
      .narrative-header {
        position: absolute;
        top: 36px;
        left: 48px;
        right: 48px;
        z-index: 10;
      }
      .narrative-kicker {
        font-size: 15px;
        font-weight: 900;
        letter-spacing: 2.4px;
        color: #991B1B;
        text-transform: uppercase;
        margin-bottom: 5px;
        text-shadow: 0 1px 2px rgba(255,255,255,0.9);
      }
      .narrative-title {
        font-family: 'Bebas Neue', sans-serif;
        font-size: ${headlineText.length > 32 ? 64 : headlineText.length > 22 ? 72 : 80}px;
        line-height: 0.94;
        letter-spacing: 1.2px;
        color: #0F172A;
        text-transform: uppercase;
        margin-bottom: 8px;
        text-shadow: 0 2px 4px rgba(255,255,255,0.95);
      }
      .narrative-deck {
        font-size: 14.5px;
        font-weight: 600;
        line-height: 1.55;
        color: #1E293B;
        max-width: 580px;
        margin-bottom: 12px;
        text-shadow: 0 1px 2px rgba(255,255,255,0.85);
      }

      /* Gold Pill Badges (Gold Reference Standard) */
      .gold-badge {
        display: inline-block;
        background: #D97706;
        color: #FFFFFF;
        font-size: 12px;
        font-weight: 900;
        letter-spacing: 1px;
        text-transform: uppercase;
        padding: 4px 10px;
        border-radius: 4px;
        margin-bottom: 4px;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.25);
      }

      /* Points on Red Wave (Upper Right: 01 & 02) */
      .wave-top-points {
        position: absolute;
        top: 175px;
        right: 48px;
        width: 480px;
        z-index: 20;
        display: flex;
        flex-direction: column;
        gap: 10px;
      }

      /* Horizontal KPI Metric Belt */
      .narrative-kpi-belt {
        position: absolute;
        top: 410px;
        left: 48px;
        right: 48px;
        max-width: 984px;
        z-index: 25;
        display: flex;
        background: rgba(15, 23, 42, 0.92);
        backdrop-filter: blur(8px);
        border-top: 1px solid rgba(255, 255, 255, 0.25);
        border-bottom: 1px solid rgba(255, 255, 255, 0.25);
        border-radius: 4px;
        padding: 6px 0;
        box-shadow: 0 4px 14px rgba(0, 0, 0, 0.2);
      }
      .kpi-belt-col {
        flex: 1;
        display: flex;
        flex-direction: column;
        align-items: flex-start;
        padding: 0 20px;
        border-right: 1px solid rgba(255, 255, 255, 0.15);
        box-sizing: border-box;
      }
      .kpi-belt-col:last-child {
        border-right: none;
      }
      .kpi-belt-tag {
        font-size: 10.5px;
        font-weight: 900;
        letter-spacing: 1.5px;
        color: #FCD34D;
        text-transform: uppercase;
        margin-bottom: 1px;
      }
      .kpi-belt-num {
        font-family: 'Bebas Neue', sans-serif;
        font-size: 42px;
        line-height: 0.95;
        color: #FFFFFF;
        letter-spacing: 1px;
        margin-bottom: 1px;
      }
      .kpi-belt-lbl {
        font-size: 11.5px;
        font-weight: 800;
        color: #E2E8F0;
        text-transform: uppercase;
        line-height: 1.2;
      }

      /* Lower Left: Cream Paper Zone (Donut Chart + Point 04) - Stretched to fill vertical space */
      .lower-left-zone {
        position: absolute;
        top: 520px;
        bottom: 175px;
        left: 48px;
        width: 430px;
        z-index: 20;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
      }

      /* Lower Right: Red Wave Flow (Points 03, 05, 06) - Stretched to fill vertical space */
      .lower-right-zone {
        position: absolute;
        top: 520px;
        bottom: 175px;
        right: 48px;
        width: 470px;
        z-index: 20;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
      }

      .wave-pt-item {
        display: flex;
        flex-direction: column;
        gap: 4px;
      }
      .wave-pt-head {
        font-family: 'Plus Jakarta Sans', sans-serif;
        font-size: 18px;
        font-weight: 900;
        color: #FFFFFF;
        text-transform: uppercase;
        line-height: 1.25;
        letter-spacing: 0.3px;
        text-shadow: 0 1px 3px rgba(0, 0, 0, 0.6);
      }
      .wave-pt-head .pt-num {
        color: #FEF3C7;
        font-weight: 900;
        margin-right: 5px;
        text-shadow: 0 1px 2px rgba(0, 0, 0, 0.7);
      }
      .wave-pt-body {
        font-size: 14px;
        line-height: 1.55;
        color: #FFFFFF;
        font-weight: 600;
        opacity: 0.98;
        text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
      }

      /* Points on Cream Paper */
      .paper-pt-item {
        display: flex;
        flex-direction: column;
        gap: 4px;
      }
      .paper-pt-head {
        font-family: 'Plus Jakarta Sans', sans-serif;
        font-size: 18px;
        font-weight: 900;
        color: #0F172A;
        text-transform: uppercase;
        line-height: 1.25;
        letter-spacing: 0.3px;
        text-shadow: 0 1px 2px rgba(255, 255, 255, 0.95);
      }
      .paper-pt-head .pt-num {
        color: #991B1B;
        font-weight: 900;
        margin-right: 5px;
      }
      .paper-pt-body {
        font-size: 14px;
        line-height: 1.55;
        color: #1E293B;
        font-weight: 600;
        text-shadow: 0 1px 2px rgba(255, 255, 255, 0.9);
      }

      .closing-pill {
        position: absolute;
        top: 1195px;
        left: 48px;
        right: 48px;
        background: rgba(15, 23, 42, 0.95);
        backdrop-filter: blur(8px);
        border-left: 4px solid #F59E0B;
        border-radius: 4px;
        padding: 9px 18px;
        color: #F8FAFC;
        font-size: 12.5px;
        font-weight: 600;
        line-height: 1.4;
        z-index: 15;
        box-shadow: 0 4px 12px rgba(0,0,0,0.25);
      }
      .closing-pill strong {
        color: #FCD34D;
        text-transform: uppercase;
        letter-spacing: 0.8px;
        font-weight: 800;
        margin-right: 6px;
      }

      /* Bento Metric Matrix Styles for Variant 1 */
      .bento-kpi-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 10px;
        background: rgba(255, 255, 255, 0.75);
        border: 1.5px solid rgba(153, 27, 27, 0.35);
        border-radius: 6px;
        padding: 10px;
        margin-bottom: 8px;
      }
      .bento-kpi-card {
        background: rgba(255, 255, 255, 0.95);
        border-radius: 4px;
        padding: 10px 12px;
        box-shadow: 0 1px 3px rgba(0,0,0,0.06);
      }
      .bento-kpi-tag {
        font-size: 11px;
        font-weight: 900;
        color: #991B1B;
        letter-spacing: 1px;
        text-transform: uppercase;
      }
      .bento-kpi-num {
        font-family: 'Bebas Neue', sans-serif;
        font-size: 42px;
        line-height: 0.95;
        color: #0F172A;
      }
      .bento-kpi-lbl {
        font-size: 11.5px;
        font-weight: 800;
        color: #475569;
        text-transform: uppercase;
      }

      /* Hero Metric Triad Styles for Variant 2 (Open-faced Broadsheet Rule, Zero Dark Box) */
      .hero-triad-box {
        display: flex;
        gap: 16px;
        align-items: center;
        background: rgba(255, 255, 255, 0.85);
        border-top: 2.5px solid #991B1B;
        border-bottom: 2.5px solid #991B1B;
        border-radius: 4px;
        padding: 12px 16px;
        margin-bottom: 10px;
        box-shadow: 0 1px 3px rgba(0,0,0,0.05);
      }
      .hero-triad-main {
        flex: 1.1;
        border-right: 1.5px solid rgba(153, 27, 27, 0.25);
        padding-right: 14px;
      }
      .hero-triad-main-num {
        font-family: 'Bebas Neue', sans-serif;
        font-size: 64px;
        line-height: 0.9;
        color: #991B1B;
      }
      .hero-triad-main-lbl {
        font-size: 12.5px;
        font-weight: 800;
        color: #0F172A;
        text-transform: uppercase;
      }
      .hero-triad-sub {
        display: flex;
        flex-direction: column;
        gap: 8px;
        flex: 1;
      }
      .hero-triad-sub-item {
        display: flex;
        flex-direction: column;
      }
      .hero-triad-sub-num {
        font-family: 'Bebas Neue', sans-serif;
        font-size: 30px;
        line-height: 0.95;
        color: #0F172A;
      }
      .hero-triad-sub-lbl {
        font-size: 11px;
        font-weight: 800;
        color: #475569;
        text-transform: uppercase;
      }
    `;

    let html = '';
    let css = commonWaveCss;

    const commonHeaderHtml = `
      <div class="narrative-header">
        <div class="narrative-kicker">${esc(copy.kicker || 'DATA INFRASTRUKTUR JALAN • ANALISIS KABUPATEN SUKABUMI')}</div>
        <div class="narrative-title">${esc(headlineText)}</div>
        <div class="narrative-deck">${esc(copy.deck || 'Komitmen advokasi anggaran dan pengawalan kebijakan berbasis transparansi dan akuntabilitas publik.')}</div>
      </div>
    `;

    const commonKpiBeltHtml = `
      <div class="narrative-kpi-belt">
        ${cleanStats.slice(0, 4).map((st, i) => `
          <div class="kpi-belt-col">
            <span class="kpi-belt-tag">KPI 0${i + 1}</span>
            <span class="kpi-belt-num">${esc(st.value)}</span>
            <span class="kpi-belt-lbl">${esc(st.label)}</span>
          </div>
        `).join('')}
      </div>
    `;

    const commonClosingHtml = copy.closingLine ? `
      <div class="closing-pill">
        <strong>CLOSING CALLOUT:</strong> ${esc(copy.closingLine)}
      </div>
    ` : '';

    if (variantIndex === 0) {
      // VARIAN 0: KLASIK S-CURVE MASTER REFERENCE (Pita Kanan Penuh, Sabuk 4 KPI Tengah, Donut Kiri Bawah)
      // Koordinat kurva aman (x = 535px) sehingga Donut Chart tidak akan pernah menabrak pita
      const safeWaveSvg = `
        <svg class="narrative-wave-vector" viewBox="0 0 1080 1350" style="position: absolute; top: 0; left: 0; width: 1080px; height: 1350px; pointer-events: none; z-index: 6;">
          <defs>
            <linearGradient id="waveCrimsonFlow0" x1="0%" y1="0%" x2="100%" y2="90%">
              <stop offset="0%" stop-color="#7F1D1D" />
              <stop offset="25%" stop-color="#991B1B" />
              <stop offset="70%" stop-color="#B91C1C" />
              <stop offset="100%" stop-color="#881337" />
            </linearGradient>
            <filter id="waveDepthGlow0" x="-15%" y="-15%" width="130%" height="130%">
              <feDropShadow dx="-5" dy="6" stdDeviation="14" flood-color="#000000" flood-opacity="0.25" />
            </filter>
          </defs>
          <path d="M 470 170 C 600 170, 780 180, 1080 180 L 1080 1190 C 800 1195, 660 1170, 530 1110 C 490 1020, 520 900, 550 800 C 575 720, 560 640, 535 560 C 490 450, 460 330, 470 170 Z" fill="url(#waveCrimsonFlow0)" filter="url(#waveDepthGlow0)" />
        </svg>
      `;

      html = `
        ${safeWaveSvg}
        ${commonHeaderHtml}

        <!-- Poin 01 & 02 pada Pita Merah Kanan Atas -->
        <div class="wave-top-points">
          <div class="wave-pt-item">
            <div><span class="gold-badge">${esc(p1.badge || 'INDIKATOR KUNCI')}</span></div>
            <div class="wave-pt-head"><span class="pt-num">01 •</span> ${esc(p1.label)}</div>
            <div class="wave-pt-body">${esc(p1.text)}</div>
          </div>
          <div class="wave-pt-item">
            <div class="wave-pt-head"><span class="pt-num">02 •</span> ${esc(p2.label)}</div>
            <div class="wave-pt-body">${esc(p2.text)}</div>
            <div style="margin-top: 3px;"><span class="gold-badge">${esc(p2.badge || 'PROGRAM INTERVENSI')}</span></div>
          </div>
        </div>

        <!-- Sabuk Metrik KPI Horizontal di Tengah -->
        ${commonKpiBeltHtml}

        <!-- Sisi Kiri Bawah: Kertas Krem (Donut Chart + Poin 04) - Mengisi Penuh dari Atas ke Bawah -->
        <div class="lower-left-zone">
          ${buildEditorialPieChartHtml({
            copy,
            accentColor: '#991B1B',
            titleColor: '#0F172A',
            bodyColor: '#334155',
            halo: 'none',
            sliceColors: ['#1E293B', '#991B1B', '#D97706', '#F59E0B'],
            sizePx: 145,
          })}

          <div style="padding-top: 14px; border-top: 2px solid rgba(153, 27, 27, 0.35); display: flex; flex-direction: column; gap: 8px;">
            <div style="font-family:'Bebas Neue',sans-serif;font-size:22px;letter-spacing:1.3px;color:#991B1B;text-transform:uppercase;">
              ✦ ${esc(copy.sectionHeading || 'TARGET & REALISASI KEBIJAKAN')}
            </div>
            <div><span class="gold-badge">${esc(p4.badge || 'TARGET PENURUNAN')}</span></div>
            <div class="paper-pt-item">
              <div class="paper-pt-head"><span class="pt-num">04 •</span> ${esc(p4.label)}</div>
              <div class="paper-pt-body">${esc(p4.text)}</div>
            </div>
            <div style="background: rgba(15, 23, 42, 0.92); border-left: 4px solid #D97706; border-radius: 4px; padding: 10px 14px; color: #FFFFFF; display: flex; flex-direction: column; gap: 3px; box-shadow: 0 2px 8px rgba(0,0,0,0.15); margin-top: 4px;">
              <div style="font-size: 11px; font-weight: 900; letter-spacing: 1.2px; color: #FCD34D; text-transform: uppercase;">✦ TARGET PRIORITAS STRATEGIS</div>
              <div style="font-size: 13px; font-weight: 700; color: #F1F5F9; line-height: 1.4;">${esc(cleanStats[3]?.label || 'Target Penerima')}: <strong style="color: #FFFFFF; font-size: 15px;">${esc(cleanStats[3]?.value || '> 500.000')}</strong> alokasi penerima manfaat riil di wilayah prioritas.</div>
            </div>
          </div>
        </div>

        <!-- Sisi Kanan Bawah: Pita Merah (Poin 03, 05, 06) - Terdistribusi Penuh ke Bawah (Zero Empty Void) -->
        <div class="lower-right-zone">
          <div class="wave-pt-item">
            <div class="wave-pt-head"><span class="pt-num">03 •</span> ${esc(p3.label)}</div>
            <div class="wave-pt-body">${esc(p3.text)}</div>
          </div>
          <div class="wave-pt-item">
            <div class="wave-pt-head"><span class="pt-num">05 •</span> ${esc(p5.label)}</div>
            <div class="wave-pt-body">${esc(p5.text)}</div>
          </div>
          <div class="wave-pt-item">
            <div class="wave-pt-head"><span class="pt-num">06 •</span> ${esc(p6.label)}</div>
            <div class="wave-pt-body">${esc(p6.text)}</div>
          </div>
        </div>

        ${commonClosingHtml}
      `;
    } else if (variantIndex === 1) {
      // VARIAN 1: BENTO METRIC MATRIX (2x2 Grid KPI + Inverted Flow)
      const bentoWaveSvg = `
        <svg class="narrative-wave-vector" viewBox="0 0 1080 1350" style="position: absolute; top: 0; left: 0; width: 1080px; height: 1350px; pointer-events: none; z-index: 6;">
          <defs>
            <linearGradient id="waveCrimsonFlow1" x1="0%" y1="0%" x2="100%" y2="90%">
              <stop offset="0%" stop-color="#881337" />
              <stop offset="35%" stop-color="#991B1B" />
              <stop offset="75%" stop-color="#DC2626" />
              <stop offset="100%" stop-color="#7F1D1D" />
            </linearGradient>
            <filter id="waveDepthGlow1" x="-15%" y="-15%" width="130%" height="130%">
              <feDropShadow dx="-5" dy="6" stdDeviation="14" flood-color="#000000" flood-opacity="0.25" />
            </filter>
          </defs>
          <path d="M 490 170 C 620 170, 780 180, 1080 180 L 1080 1190 C 820 1195, 680 1170, 540 1110 C 500 1020, 520 900, 555 800 C 580 720, 565 640, 540 560 C 500 450, 480 330, 490 170 Z" fill="url(#waveCrimsonFlow1)" filter="url(#waveDepthGlow1)" />
        </svg>
      `;

      html = `
        ${bentoWaveSvg}
        ${commonHeaderHtml}

        <!-- Poin 01 & 02 pada Pita Merah Kanan Atas -->
        <div class="wave-top-points">
          <div class="wave-pt-item">
            <div><span class="gold-badge">${esc(p1.badge || 'INDIKATOR KUNCI')}</span></div>
            <div class="wave-pt-head"><span class="pt-num">01 •</span> ${esc(p1.label)}</div>
            <div class="wave-pt-body">${esc(p1.text)}</div>
          </div>
          <div class="wave-pt-item">
            <div class="wave-pt-head"><span class="pt-num">02 •</span> ${esc(p2.label)}</div>
            <div class="wave-pt-body">${esc(p2.text)}</div>
            <div style="margin-top: 3px;"><span class="gold-badge">${esc(p2.badge || 'PROGRAM INTERVENSI')}</span></div>
          </div>
        </div>

        <!-- Kuadran Kiri: Bento Metric 2x2 Grid + Donut Chart + Poin 04 -->
        <div class="lower-left-zone" style="top: 415px;">
          <!-- Bento 2x2 Metric Grid -->
          <div class="bento-kpi-grid">
            ${cleanStats.slice(0, 4).map((st, i) => `
              <div class="bento-kpi-card">
                <div class="bento-kpi-tag">KPI 0${i + 1}</div>
                <div class="bento-kpi-num">${esc(st.value)}</div>
                <div class="bento-kpi-lbl">${esc(st.label)}</div>
              </div>
            `).join('')}
          </div>

          <!-- Donut Chart -->
          ${buildEditorialPieChartHtml({
            copy,
            accentColor: '#991B1B',
            titleColor: '#0F172A',
            bodyColor: '#334155',
            halo: 'none',
            sliceColors: ['#1E293B', '#991B1B', '#D97706', '#F59E0B'],
            sizePx: 130,
          })}

          <!-- Poin 04 -->
          <div style="padding-top: 10px; border-top: 2px solid rgba(153, 27, 27, 0.35); display: flex; flex-direction: column; gap: 6px;">
            <div><span class="gold-badge">${esc(p4.badge || 'TARGET PENURUNAN')}</span></div>
            <div class="paper-pt-item">
              <div class="paper-pt-head"><span class="pt-num">04 •</span> ${esc(p4.label)}</div>
              <div class="paper-pt-body">${esc(p4.text)}</div>
            </div>
            <div style="background: rgba(15, 23, 42, 0.92); border-left: 4px solid #D97706; border-radius: 4px; padding: 8px 12px; color: #FFFFFF; display: flex; flex-direction: column; gap: 2px; margin-top: 2px;">
              <div style="font-size: 10.5px; font-weight: 900; letter-spacing: 1px; color: #FCD34D; text-transform: uppercase;">✦ TARGET PRIORITAS</div>
              <div style="font-size: 12.5px; font-weight: 700; color: #F1F5F9; line-height: 1.35;">${esc(cleanStats[3]?.label)}: <strong style="color: #FFFFFF;">${esc(cleanStats[3]?.value)}</strong> penerima manfaat terdaftar.</div>
            </div>
          </div>
        </div>

        <!-- Kuadran Kanan: Pita Merah (Poin 03, 05, 06) -->
        <div class="lower-right-zone" style="top: 465px;">
          <div class="wave-pt-item">
            <div class="wave-pt-head"><span class="pt-num">03 •</span> ${esc(p3.label)}</div>
            <div class="wave-pt-body">${esc(p3.text)}</div>
          </div>
          <div class="wave-pt-item">
            <div class="wave-pt-head"><span class="pt-num">05 •</span> ${esc(p5.label)}</div>
            <div class="wave-pt-body">${esc(p5.text)}</div>
          </div>
          <div class="wave-pt-item">
            <div class="wave-pt-head"><span class="pt-num">06 •</span> ${esc(p6.label)}</div>
            <div class="wave-pt-body">${esc(p6.text)}</div>
          </div>
        </div>

        ${commonClosingHtml}
      `;
    } else if (variantIndex === 2) {
      // VARIAN 2: HERO METRIC TRIAD & STRATEGIC BANNER FOCUS (Open-faced Broadsheet Rule, Zero Dark Box)
      const hero = cleanStats[0] || { value: '85%', label: 'Cakupan Penyaluran' };
      const subA = cleanStats[1] || { value: 'RP 150 M', label: 'Total Anggaran' };
      const subB = cleanStats[2] || { value: '20 KECAMATAN', label: 'Wilayah Prioritas' };
      const targetStat = cleanStats[3] || { value: '> 300.000', label: 'Target Penerima Manfaat' };

      const triadWaveSvg = `
        <svg class="narrative-wave-vector" viewBox="0 0 1080 1350" style="position: absolute; top: 0; left: 0; width: 1080px; height: 1350px; pointer-events: none; z-index: 6;">
          <defs>
            <linearGradient id="waveCrimsonFlow2" x1="0%" y1="0%" x2="100%" y2="90%">
              <stop offset="0%" stop-color="#78350F" />
              <stop offset="30%" stop-color="#991B1B" />
              <stop offset="70%" stop-color="#B45309" />
              <stop offset="100%" stop-color="#881337" />
            </linearGradient>
            <filter id="waveDepthGlow2" x="-15%" y="-15%" width="130%" height="130%">
              <feDropShadow dx="-5" dy="6" stdDeviation="14" flood-color="#000000" flood-opacity="0.25" />
            </filter>
          </defs>
          <path d="M 480 170 C 610 170, 780 180, 1080 180 L 1080 1190 C 810 1195, 670 1170, 535 1110 C 495 1020, 515 900, 550 800 C 575 720, 560 640, 535 560 C 495 450, 470 330, 480 170 Z" fill="url(#waveCrimsonFlow2)" filter="url(#waveDepthGlow2)" />
        </svg>
      `;

      html = `
        ${triadWaveSvg}
        ${commonHeaderHtml}

        <!-- Poin 01 & 02 pada Pita Merah Kanan Atas -->
        <div class="wave-top-points">
          <div class="wave-pt-item">
            <div><span class="gold-badge">${esc(p1.badge || 'INDIKATOR KUNCI')}</span></div>
            <div class="wave-pt-head"><span class="pt-num">01 •</span> ${esc(p1.label)}</div>
            <div class="wave-pt-body">${esc(p1.text)}</div>
          </div>
          <div class="wave-pt-item">
            <div class="wave-pt-head"><span class="pt-num">02 •</span> ${esc(p2.label)}</div>
            <div class="wave-pt-body">${esc(p2.text)}</div>
            <div style="margin-top: 3px;"><span class="gold-badge">${esc(p2.badge || 'PROGRAM INTERVENSI')}</span></div>
          </div>
        </div>

        <!-- Kuadran Kiri: Hero Triad Box + Target Banner + Donut Chart + Poin 04 -->
        <div class="lower-left-zone" style="top: 415px;">
          <!-- Hero Metric Triad (Direct Broadsheet Inking) -->
          <div class="hero-triad-box">
            <div class="hero-triad-main">
              <div style="font-size: 11px; font-weight: 900; letter-spacing: 1px; color: #991B1B;">✦ HERO METRIC</div>
              <div class="hero-triad-main-num">${esc(hero.value)}</div>
              <div class="hero-triad-main-lbl">${esc(hero.label)}</div>
            </div>
            <div class="hero-triad-sub">
              <div class="hero-triad-sub-item">
                <div class="hero-triad-sub-num">${esc(subA.value)}</div>
                <div class="hero-triad-sub-lbl">${esc(subA.label)}</div>
              </div>
              <div class="hero-triad-sub-item">
                <div class="hero-triad-sub-num">${esc(subB.value)}</div>
                <div class="hero-triad-sub-lbl">${esc(subB.label)}</div>
              </div>
            </div>
          </div>

          <!-- Target Banner Bar (Metrik ke-4) -->
          <div style="display:flex; justify-content:space-between; align-items:center; background:#991B1B; color:#FFFFFF; padding:8px 16px; border-radius:4px; font-weight:800; font-size:12.5px;">
            <span style="letter-spacing:1px; text-transform:uppercase;">✦ TARGET STRATEGIS: ${esc(targetStat.label)}</span>
            <span style="font-family:'Bebas Neue',sans-serif; font-size:26px; color:#FCD34D; line-height:1;">${esc(targetStat.value)}</span>
          </div>

          <!-- Donut Chart -->
          ${buildEditorialPieChartHtml({
            copy,
            accentColor: '#991B1B',
            titleColor: '#0F172A',
            bodyColor: '#334155',
            halo: 'none',
            sliceColors: ['#1E293B', '#991B1B', '#D97706', '#F59E0B'],
            sizePx: 130,
          })}

          <!-- Poin 04 -->
          <div style="padding-top: 10px; border-top: 2px solid rgba(153, 27, 27, 0.35); display: flex; flex-direction: column; gap: 6px;">
            <div><span class="gold-badge">${esc(p4.badge || 'TARGET PENURUNAN')}</span></div>
            <div class="paper-pt-item">
              <div class="paper-pt-head"><span class="pt-num">04 •</span> ${esc(p4.label)}</div>
              <div class="paper-pt-body">${esc(p4.text)}</div>
            </div>
          </div>
        </div>

        <!-- Kuadran Kanan: Pita Merah (Poin 03, 05, 06) -->
        <div class="lower-right-zone" style="top: 465px;">
          <div class="wave-pt-item">
            <div class="wave-pt-head"><span class="pt-num">03 •</span> ${esc(p3.label)}</div>
            <div class="wave-pt-body">${esc(p3.text)}</div>
          </div>
          <div class="wave-pt-item">
            <div class="wave-pt-head"><span class="pt-num">05 •</span> ${esc(p5.label)}</div>
            <div class="wave-pt-body">${esc(p5.text)}</div>
          </div>
          <div class="wave-pt-item">
            <div class="wave-pt-head"><span class="pt-num">06 •</span> ${esc(p6.label)}</div>
            <div class="wave-pt-body">${esc(p6.text)}</div>
          </div>
        </div>

        ${commonClosingHtml}
      `;
    } else {
      // VARIAN 3: EXECUTIVE STRIP & BALANCED DUAL-PILLAR MATRIX
      const dualWaveSvg = `
        <svg class="narrative-wave-vector" viewBox="0 0 1080 1350" style="position: absolute; top: 0; left: 0; width: 1080px; height: 1350px; pointer-events: none; z-index: 6;">
          <defs>
            <linearGradient id="waveCrimsonFlow3" x1="0%" y1="0%" x2="100%" y2="90%">
              <stop offset="0%" stop-color="#701A75" />
              <stop offset="25%" stop-color="#991B1B" />
              <stop offset="70%" stop-color="#BE185D" />
              <stop offset="100%" stop-color="#881337" />
            </linearGradient>
            <filter id="waveDepthGlow3" x="-15%" y="-15%" width="130%" height="130%">
              <feDropShadow dx="-5" dy="6" stdDeviation="14" flood-color="#000000" flood-opacity="0.25" />
            </filter>
          </defs>
          <path d="M 500 270 C 640 260, 780 270, 1080 270 L 1080 1190 C 800 1195, 660 1170, 530 1110 C 490 1020, 520 900, 550 800 C 575 720, 560 640, 535 560 C 490 450, 480 340, 500 270 Z" fill="url(#waveCrimsonFlow3)" filter="url(#waveDepthGlow3)" />
        </svg>
      `;

      html = `
        ${dualWaveSvg}
        ${commonHeaderHtml}

        <!-- Sabuk Metrik KPI Horizontal di Bawah Header (Executive Strip) -->
        <div class="narrative-kpi-belt" style="top: 185px; padding: 6px 0;">
          ${cleanStats.slice(0, 4).map((st, i) => `
            <div class="kpi-belt-col">
              <span class="kpi-belt-tag">KPI 0${i + 1}</span>
              <span class="kpi-belt-num">${esc(st.value)}</span>
              <span class="kpi-belt-lbl">${esc(st.label)}</span>
            </div>
          `).join('')}
        </div>

        <!-- Poin 01 & 02 pada Pita Merah Kanan Atas (Mulai di y=275px) -->
        <div class="wave-top-points" style="top: 275px; gap: 8px;">
          <div class="wave-pt-item">
            <div><span class="gold-badge">${esc(p1.badge || 'INDIKATOR KUNCI')}</span></div>
            <div class="wave-pt-head"><span class="pt-num">01 •</span> ${esc(p1.label)}</div>
            <div class="wave-pt-body">${esc(p1.text)}</div>
          </div>
          <div class="wave-pt-item">
            <div class="wave-pt-head"><span class="pt-num">02 •</span> ${esc(p2.label)}</div>
            <div class="wave-pt-body">${esc(p2.text)}</div>
            <div style="margin-top: 3px;"><span class="gold-badge">${esc(p2.badge || 'PROGRAM INTERVENSI')}</span></div>
          </div>
        </div>

        <!-- Sisi Kiri Bawah (Kertas Krem, Lebar 430px): Donut Chart + Poin 04 + Target Bar -->
        <div class="lower-left-zone" style="top: 515px;">
          ${buildEditorialPieChartHtml({
            copy,
            accentColor: '#991B1B',
            titleColor: '#0F172A',
            bodyColor: '#334155',
            halo: 'none',
            sliceColors: ['#1E293B', '#991B1B', '#D97706', '#F59E0B'],
            sizePx: 145,
          })}

          <div style="padding-top: 14px; border-top: 2px solid rgba(153, 27, 27, 0.35); display: flex; flex-direction: column; gap: 8px;">
            <div style="font-family:'Bebas Neue',sans-serif;font-size:22px;letter-spacing:1.3px;color:#991B1B;text-transform:uppercase;">
              ✦ ${esc(copy.sectionHeading || 'TARGET & REALISASI KEBIJAKAN')}
            </div>
            <div><span class="gold-badge">${esc(p4.badge || 'TARGET PENURUNAN')}</span></div>
            <div class="paper-pt-item">
              <div class="paper-pt-head"><span class="pt-num">04 •</span> ${esc(p4.label)}</div>
              <div class="paper-pt-body">${esc(p4.text)}</div>
            </div>
            <div style="background: rgba(15, 23, 42, 0.92); border-left: 4px solid #D97706; border-radius: 4px; padding: 10px 14px; color: #FFFFFF; display: flex; flex-direction: column; gap: 3px; box-shadow: 0 2px 8px rgba(0,0,0,0.15); margin-top: 4px;">
              <div style="font-size: 11px; font-weight: 900; letter-spacing: 1.2px; color: #FCD34D; text-transform: uppercase;">✦ TARGET PRIORITAS STRATEGIS</div>
              <div style="font-size: 13px; font-weight: 700; color: #F1F5F9; line-height: 1.4;">${esc(cleanStats[3]?.label || 'Target Penerima')}: <strong style="color: #FFFFFF; font-size: 15px;">${esc(cleanStats[3]?.value || '> 500.000')}</strong> alokasi penerima manfaat terdata.</div>
            </div>
          </div>
        </div>

        <!-- Sisi Kanan Bawah (Pita Merah Imperial Crimson): Poin 03, 05, 06 Mengalir Penuh -->
        <div class="lower-right-zone" style="top: 515px;">
          <div class="wave-pt-item">
            <div class="wave-pt-head"><span class="pt-num">03 •</span> ${esc(p3.label)}</div>
            <div class="wave-pt-body">${esc(p3.text)}</div>
          </div>
          <div class="wave-pt-item">
            <div class="wave-pt-head"><span class="pt-num">05 •</span> ${esc(p5.label)}</div>
            <div class="wave-pt-body">${esc(p5.text)}</div>
          </div>
          <div class="wave-pt-item">
            <div class="wave-pt-head"><span class="pt-num">06 •</span> ${esc(p6.label)}</div>
            <div class="wave-pt-body">${esc(p6.text)}</div>
          </div>
        </div>

        ${commonClosingHtml}
      `;
    }

    return { html, css };
  }

  if (archetype === 'INFOGRAPHIC_CHRONICLE_GRID') {
    // Authentic Soedirman Broadsheet Chronicle Layout (template-02-biography-timeline-grid)
    // SISI KIRI (Left 310px): Solid Orange Pillar (#EA580C) with stacked white Bebas Neue typography, framed portrait window, forest green badge (#15803D), 2 Hero KPIs, and summary note.
    // SISI KANAN (Right 665px): Clean broadsheet cream paper divided into 3 distinct chronicle cards:
    //   - Card 1: Forest Green header + 2 Support KPIs + Points 01–03
    //   - Card 2: Vibrant Orange header + EXACTLY ONE Donut Chart with center dominant percentage
    //   - Card 3: Forest Green header + Points 04–06
    //   - Bottom: Dark closing statement strip
    const stats4 = statsList.slice(0, 4);
    const heroStats = stats4.slice(0, 2);
    const supportStats = stats4.slice(2, 4).length > 0 ? stats4.slice(2, 4) : stats4.slice(0, 2);

    // Split points strictly: 01-03 for Card 1, 04-06 for Card 3
    const phase1Points = points.slice(0, 3);
    const phase2Points = points.slice(3, 6).length > 0 ? points.slice(3, 6) : points.slice(0, 3);

    // Stacked headline words for the left orange pillar (like SOE / DIR / MAN)
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

    const phase1Html = phase1Points.map((p, idx) => `
      <div class="soedirman-point-item">
        <div class="soedirman-point-header">
          <span class="soedirman-point-chip">0${idx + 1}</span>
          <span class="soedirman-point-title">${esc(p.label)}</span>
        </div>
        <div class="soedirman-point-desc">${esc(p.text)}</div>
      </div>
    `).join('');

    const phase2Html = phase2Points.map((p, idx) => `
      <div class="soedirman-point-item">
        <div class="soedirman-point-header">
          <span class="soedirman-point-chip">0${idx + 4}</span>
          <span class="soedirman-point-title">${esc(p.label)}</span>
        </div>
        <div class="soedirman-point-desc">${esc(p.text)}</div>
      </div>
    `).join('');

    const html = `
      <!-- SISI KIRI: ICONIC SOLID ORANGE PILLAR (#EA580C) -->
      <div class="soedirman-left-pillar">
        <div class="soedirman-masthead-group">
          <div class="soedirman-stacked-title">
            ${stackedTitleHtml}
          </div>
          <div class="soedirman-pillar-deck">
            ${esc(copy.deck || headlineText)}
          </div>
        </div>

        <!-- Focal Portrait Window (transparent to show documentary subject from background artwork) -->
        <div class="soedirman-portrait-window">
          <div class="soedirman-window-border"></div>
        </div>

        <!-- Forest Green Identification Badge -->
        <div class="soedirman-hero-badge">
          ${esc(copy.kicker || 'DOKUMEN ADVOKASI PUBLIK')}
        </div>

        <!-- 2 Hero Key Metrics on Orange Pillar -->
        <div class="soedirman-pillar-kpis">
          <div class="soedirman-pkpi-card">
            <div class="soedirman-pkpi-val">${esc(heroStats[0]?.value || '85%')}</div>
            <div class="soedirman-pkpi-lbl">${esc(heroStats[0]?.label || 'CAKUPAN PROGRAM')}</div>
          </div>
          <div class="soedirman-pkpi-card">
            <div class="soedirman-pkpi-val">${esc(heroStats[1]?.value || 'RP 250 M')}</div>
            <div class="soedirman-pkpi-lbl">${esc(heroStats[1]?.label || 'TOTAL ANGGARAN')}</div>
          </div>
        </div>

        <!-- Pillar Bottom Context / Summary Note -->
        <div class="soedirman-pillar-note">
          ${esc(copy.closingLine || 'Pemerintah daerah diharapkan mengedepankan prinsip transparansi dan akuntabilitas dalam seluruh pelaksanaan program.')}
        </div>
      </div>

      <!-- SISI KANAN: 3 MODULAR CHRONICLE CARDS ON CLEAN CREAM BROADSHEET PAPER -->
      <div class="soedirman-right-grid">
        <!-- CARD 1: Analisis Capaian & Sebaran (Forest Green Header #15803D) -->
        <div class="soedirman-card card-green">
          <div class="soedirman-card-header green">
            <span class="sch-title">◈ ANALISIS CAPAIAN &amp; ALOKASI ANGGARAN</span>
            <span class="sch-badge">01 – 03</span>
          </div>
          <div class="soedirman-card-body">
            <div class="soedirman-support-kpis">
              <div class="soedirman-skpi">
                <div class="soedirman-skpi-val">${esc(supportStats[0]?.value || '27 KECAMATAN')}</div>
                <div class="soedirman-skpi-lbl">${esc(supportStats[0]?.label || 'WILAYAH INTERVENSI')}</div>
              </div>
              <div class="soedirman-skpi">
                <div class="soedirman-skpi-val">${esc(supportStats[1]?.value || '> 50.000')}</div>
                <div class="soedirman-skpi-lbl">${esc(supportStats[1]?.label || 'TARGET PENERIMA MANFAAT')}</div>
              </div>
            </div>
            <div class="soedirman-points-list">
              ${phase1Html}
            </div>
          </div>
        </div>

        <!-- CARD 2: Proporsi Alokasi Anggaran (Vibrant Orange Header #EA580C) - EXACTLY ONE CHART -->
        <div class="soedirman-card card-orange">
          <div class="soedirman-card-header orange">
            <span class="sch-title">◈ PROPORSI ALOKASI ANGGARAN &amp; PROGRAM (100%)</span>
          </div>
          <div class="soedirman-card-body chart-body">
            ${buildEditorialPieChartHtml({
              copy,
              accentColor: '#EA580C',
              titleColor: '#0F172A',
              bodyColor: '#334155',
              halo: universalInkHalo,
            })}
          </div>
        </div>

        <!-- CARD 3: Strategi Pelaksanaan & Target Jangka Panjang (Forest Green Header #15803D) -->
        <div class="soedirman-card card-green">
          <div class="soedirman-card-header green">
            <span class="sch-title">◈ ${esc(copy.sectionHeading || 'STRATEGI PELAKSANAAN & TARGET MANFAAT')}</span>
            <span class="sch-badge">04 – 06</span>
          </div>
          <div class="soedirman-card-body">
            <div class="soedirman-points-list">
              ${phase2Html}
            </div>
          </div>
        </div>

        <!-- Bottom Closing Statement Strip -->
        <div class="soedirman-closing-strip">
          <span class="scs-accent">✦</span> ${esc(copy.closingLine || 'Komitmen terukur bagi transparansi dan kemaslahatan publik.')}
        </div>
      </div>
    `;

    const css = `
      /* SISI KIRI: ICONIC SOLID ORANGE PILLAR (#EA580C) */
      .soedirman-left-pillar {
        position: absolute;
        top: 52px;
        left: 40px;
        width: 310px;
        bottom: 86px;
        background: linear-gradient(180deg, #EA580C 0%, #C2410C 100%);
        border-radius: 6px;
        padding: 24px 20px;
        box-sizing: border-box;
        display: flex;
        flex-direction: column;
        gap: 14px;
        z-index: 10;
        box-shadow: 0 8px 24px rgba(194, 65, 12, 0.28);
        color: #FFFFFF;
      }
      .soedirman-masthead-group {
        display: flex;
        flex-direction: column;
        gap: 6px;
        border-bottom: 2px solid rgba(255, 255, 255, 0.35);
        padding-bottom: 12px;
      }
      .soedirman-stacked-title {
        font-family: 'Bebas Neue', sans-serif;
        font-size: 50px;
        line-height: 0.88;
        letter-spacing: 1.5px;
        color: #FFFFFF;
        text-transform: uppercase;
        word-break: break-word;
      }
      .soedirman-stacked-word {
        display: block;
      }
      .soedirman-pillar-deck {
        font-family: 'Plus Jakarta Sans', sans-serif;
        font-size: 11px;
        font-weight: 800;
        line-height: 1.35;
        letter-spacing: 0.6px;
        color: #FEF08A;
        text-transform: uppercase;
      }

      /* Focal portrait window */
      .soedirman-portrait-window {
        width: 100%;
        height: 185px;
        border-radius: 4px;
        border: 2px solid rgba(255, 255, 255, 0.45);
        background: rgba(0, 0, 0, 0.12);
        box-sizing: border-box;
        position: relative;
        overflow: hidden;
      }
      .soedirman-window-border {
        position: absolute;
        top: 4px;
        left: 4px;
        right: 4px;
        bottom: 4px;
        border: 1px dashed rgba(255, 255, 255, 0.35);
        border-radius: 2px;
        pointer-events: none;
      }

      /* Forest Green Badge */
      .soedirman-hero-badge {
        background: #15803D;
        color: #FFFFFF;
        font-size: 11.5px;
        font-weight: 800;
        letter-spacing: 1.2px;
        text-transform: uppercase;
        padding: 7px 12px;
        border-radius: 4px;
        text-align: center;
        box-shadow: 0 3px 10px rgba(0, 0, 0, 0.2);
      }

      /* 2 Hero KPIs on Orange Pillar */
      .soedirman-pillar-kpis {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 8px;
        margin-top: 2px;
      }
      .soedirman-pkpi-card {
        background: rgba(0, 0, 0, 0.15);
        border-top: 2px solid #FEF08A;
        border-bottom: 1px solid rgba(255, 255, 255, 0.25);
        padding: 6px 8px;
        text-align: center;
        border-radius: 3px;
      }
      .soedirman-pkpi-val {
        font-family: 'Bebas Neue', sans-serif;
        font-size: 32px;
        line-height: 1;
        color: #FFFFFF;
        margin-bottom: 2px;
      }
      .soedirman-pkpi-lbl {
        font-size: 9.5px;
        font-weight: 800;
        color: #FED7AA;
        text-transform: uppercase;
        letter-spacing: 0.4px;
        line-height: 1.2;
      }

      /* Summary Note on Orange Pillar */
      .soedirman-pillar-note {
        font-size: 10.5px;
        line-height: 1.45;
        color: rgba(255, 255, 255, 0.95);
        font-weight: 500;
        border-top: 1px solid rgba(255, 255, 255, 0.3);
        padding-top: 10px;
        margin-top: auto;
      }

      /* SISI KANAN: 3 MODULAR CHRONICLE CARDS */
      .soedirman-right-grid {
        position: absolute;
        top: 52px;
        left: 366px;
        width: 674px;
        bottom: 86px;
        display: flex;
        flex-direction: column;
        gap: 12px;
        z-index: 10;
        pointer-events: none;
      }

      /* Modular Card Shell */
      .soedirman-card {
        background: rgba(255, 255, 255, 0.92);
        border-radius: 4px;
        box-shadow: 0 4px 16px rgba(15, 23, 42, 0.08);
        overflow: hidden;
        pointer-events: auto;
      }
      .soedirman-card.card-green {
        border: 1.5px solid #15803D;
      }
      .soedirman-card.card-orange {
        border: 1.5px solid #EA580C;
      }

      /* Card Headers */
      .soedirman-card-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 6px 14px;
        color: #FFFFFF;
      }
      .soedirman-card-header.green {
        background: #15803D;
      }
      .soedirman-card-header.orange {
        background: #EA580C;
      }
      .sch-title {
        font-size: 11.5px;
        font-weight: 900;
        letter-spacing: 1.2px;
        text-transform: uppercase;
      }
      .sch-badge {
        font-family: 'Bebas Neue', sans-serif;
        font-size: 15px;
        background: rgba(255, 255, 255, 0.22);
        padding: 1px 8px;
        border-radius: 3px;
        letter-spacing: 1px;
      }

      .soedirman-card-body {
        padding: 10px 14px;
        display: flex;
        flex-direction: column;
        gap: 8px;
      }
      .soedirman-card-body.chart-body {
        padding: 8px 14px;
      }

      /* Support KPIs in Card 1 */
      .soedirman-support-kpis {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 10px;
        border-bottom: 1px solid #CBD5E1;
        padding-bottom: 8px;
      }
      .soedirman-skpi {
        display: flex;
        flex-direction: column;
        align-items: center;
        text-align: center;
      }
      .soedirman-skpi-val {
        font-family: 'Bebas Neue', sans-serif;
        font-size: 26px;
        line-height: 1;
        color: #15803D;
      }
      .soedirman-skpi-lbl {
        font-size: 9.5px;
        font-weight: 800;
        color: #475569;
        text-transform: uppercase;
        letter-spacing: 0.5px;
      }

      /* Points List */
      .soedirman-points-list {
        display: flex;
        flex-direction: column;
        gap: 7px;
      }
      .soedirman-point-item {
        border-left: 3px solid #15803D;
        padding-left: 8px;
      }
      .soedirman-point-header {
        display: flex;
        align-items: center;
        gap: 6px;
        margin-bottom: 2px;
      }
      .soedirman-point-chip {
        font-family: 'Bebas Neue', sans-serif;
        font-size: 14px;
        line-height: 1;
        background: #15803D;
        color: #FFFFFF;
        padding: 1px 6px;
        border-radius: 2px;
      }
      .soedirman-point-title {
        font-size: 11px;
        font-weight: 800;
        color: #0F172A;
        text-transform: uppercase;
        letter-spacing: 0.3px;
      }
      .soedirman-point-desc {
        font-size: 10px;
        line-height: 1.35;
        color: #334155;
        font-weight: 500;
      }

      /* Bottom Closing Strip */
      .soedirman-closing-strip {
        background: #0F172A;
        color: #F8FAFC;
        font-size: 11px;
        font-weight: 700;
        padding: 8px 16px;
        border-radius: 4px;
        text-align: center;
        border-left: 4px solid #EA580C;
        margin-top: auto;
        letter-spacing: 0.4px;
        pointer-events: auto;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
      }
      .scs-accent {
        color: #EA580C;
      }
    `;

    return { html, css };
  }
if (archetype === 'INFOGRAPHIC_RADIAL_CLOCK') {
    // Authentic Radial Clock Chronicle Layout (Matching template-03-radial-clock-chronicle):
    // 1. Top Editorial Masthead (Compact, leaving left side open for clock artwork & cutouts)
    // 2. Left Expanse (left: 0, width: 440px): 100% UNOBSTRUCTED for the clock, historical figures, & topic cutouts
    // 3. Right-Wing Unified Radial Chronicle Ledger (Continuous editorial column, NO floating web cards):
    //    - 3-Column KPI Metric Strip
    //    - Unified Radial Epochs Ledger (5 chronological points with dashed dividers and era badges)
    //    - Bottom Takeaway Policy Banner
    const kpiHtml = statsList.slice(0, 3).map((st) => `
      <div class="rclock-kpi-pill">
        <div class="rclock-kpi-val">${esc(st.value)}</div>
        <div class="rclock-kpi-lbl">${esc(st.label)}</div>
      </div>
    `).join('');

    const tiers = points.slice(0, 5);
    const tiersHtml = tiers.map((p, idx) => `
      <div class="rclock-tier-item tier-${idx}">
        <div class="rclock-tier-ribbon">
          <span class="rclock-tier-badge">0${idx + 1}</span>
          <span class="rclock-tier-title">${esc(p.label)}</span>
        </div>
        <div class="rclock-tier-desc"><span class="rclock-bullet">•</span> ${esc(p.text)}</div>
      </div>
    `).join('');

    const html = `
      <div class="rclock-sheet">
        <!-- Top Broadsheet Masthead -->
        <div class="rclock-masthead">
          <div class="rclock-kicker">${esc(copy.kicker || 'DATA ANGGARAN APBD • TELAAH')}</div>
          <div class="rclock-headline">${esc(headlineText)}</div>
          ${copy.deck ? `<div class="rclock-deck">${esc(copy.deck)}</div>` : ''}
        </div>

        <!-- Right-Wing Unified Radial Chronicle Ledger -->
        <div class="rclock-right-wing">
          <!-- KPI Indicator Strip -->
          <div class="rclock-kpi-row">
            ${kpiHtml}
          </div>

          <!-- Unified Radial Epochs Ledger (Continuous Editorial Column, Zero Floating Cards) -->
          <div class="rclock-chronicle-ledger">
            <div class="rclock-ledger-header">
              <span class="rclock-ledger-tag">◈ ${esc(copy.sectionHeading || 'STRATEGI IMPLEMENTASI & CAPAIAN PROGRAM')}</span>
              <span class="rclock-ledger-count">01 – 05</span>
            </div>
            ${tiersHtml}
          </div>

          ${buildEditorialPieChartHtml({
            copy,
            accentColor,
            titleColor,
            bodyColor: deckTextColor,
            halo: universalInkHalo,
          })}

          <!-- Policy Takeaway Banner -->
          <div class="rclock-takeaway-bar">
            <span class="rclock-takeaway-tag">SINTESIS KEBIJAKAN</span>
            <span class="rclock-takeaway-text">${esc(copy.closingLine || 'Pembangunan berkelanjutan menjamin keselamatan dan percepatan roda ekonomi daerah.')}</span>
          </div>
        </div>
      </div>
    `;

    const css = `
      .rclock-sheet {
        position: absolute;
        top: 76px;
        left: 54px;
        right: 54px;
        height: 1150px;
        box-sizing: border-box;
        text-shadow: ${universalInkHalo};
      }
      .rclock-masthead {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        background: transparent;
        border-top: 3.5px solid ${accentColor};
        border-bottom: 1.5px solid ${borderRuleColor};
        padding: 12px 0;
      }
      .rclock-kicker {
        font-size: 13.5px;
        font-weight: 900;
        color: ${accentColor};
        letter-spacing: 2px;
        text-transform: uppercase;
        margin-bottom: 4px;
      }
      .rclock-headline {
        font-family: 'Bebas Neue', sans-serif;
        font-size: 48px;
        line-height: 0.95;
        letter-spacing: 1.2px;
        color: ${titleColor};
        margin-bottom: 6px;
      }
      .rclock-deck {
        font-family: 'Plus Jakarta Sans', sans-serif;
        font-style: normal;
        font-size: 13.8px;
        line-height: 1.42;
        color: ${deckTextColor};
        font-weight: 600;
        max-width: 96%;
      }
      .rclock-right-wing {
        position: absolute;
        top: 215px;
        left: 470px;
        right: 0;
        display: flex;
        flex-direction: column;
        gap: 10px;
      }
      .rclock-kpi-row {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 8px;
        margin-bottom: 2px;
      }
      .rclock-kpi-pill {
        background: transparent;
        border-top: 3px solid ${accentColor};
        border-bottom: 1.5px solid ${borderRuleColor};
        padding: 8px 6px;
        text-align: center;
      }
      .rclock-kpi-val {
        font-family: 'Bebas Neue', sans-serif;
        font-size: 26px;
        color: ${accentColor};
        line-height: 1;
        margin-bottom: 2px;
      }
      .rclock-kpi-lbl {
        font-size: 12px;
        font-weight: 800;
        color: ${deckTextColor};
        text-transform: uppercase;
        line-height: 1.25;
      }

      /* Unified Radial Chronicle Ledger */
      .rclock-chronicle-ledger {
        background: transparent;
        border-top: 2.5px solid ${accentColor};
        border-bottom: 2px solid ${borderRuleColor};
        padding: 12px 0;
        display: flex;
        flex-direction: column;
        gap: 8px;
      }
      .rclock-ledger-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        border-bottom: 1.5px solid ${accentColor}44;
        padding-bottom: 6px;
        margin-bottom: 4px;
      }
      .rclock-ledger-tag {
        font-size: 11.5px;
        font-weight: 900;
        color: ${accentColor};
        letter-spacing: 1.5px;
        text-transform: uppercase;
      }
      .rclock-ledger-count {
        font-size: 10.5px;
        font-weight: 800;
        background: ${accentColor}18;
        color: ${accentColor};
        padding: 2px 8px;
        border-radius: 3px;
        letter-spacing: 0.8px;
      }
      .rclock-tier-item {
        padding: 6px 0;
        border-bottom: 1px dashed ${borderRuleColor};
      }
      .rclock-tier-item:last-child {
        border-bottom: none;
        padding-bottom: 2px;
      }
      .rclock-tier-ribbon {
        display: flex;
        align-items: center;
        gap: 8px;
        margin-bottom: 3px;
      }
      .rclock-tier-badge {
        font-family: 'Bebas Neue', sans-serif;
        font-size: 13.5px;
        background: ${accentColor};
        color: #FFFFFF;
        padding: 2px 7px;
        border-radius: 3px;
        letter-spacing: 0.8px;
        white-space: nowrap;
      }
      .rclock-tier-title {
        font-size: 14.5px;
        font-weight: 800;
        color: ${titleColor};
        text-transform: uppercase;
        letter-spacing: 0.3px;
      }
      .rclock-tier-desc {
        font-size: 12.5px;
        line-height: 1.42;
        color: ${bodyTextColor};
        font-weight: 600;
        padding-left: 2px;
      }
      .rclock-bullet {
        color: ${accentColor};
        font-weight: 900;
        margin-right: 2px;
      }

      /* Policy Takeaway Bar */
      .rclock-takeaway-bar {
        background: transparent;
        border-left: 5px solid ${accentColor};
        padding: 8px 0 8px 14px;
        display: flex;
        align-items: center;
        gap: 12px;
      }
      .rclock-takeaway-tag {
        font-size: 10.5px;
        font-weight: 900;
        background: ${accentColor};
        color: #FFFFFF;
        padding: 4px 8px;
        border-radius: 3px;
        letter-spacing: 1px;
        white-space: nowrap;
        text-transform: uppercase;
      }
      .rclock-takeaway-text {
        font-size: 12.5px;
        font-weight: 700;
        color: ${titleColor};
        line-height: 1.35;
      }
    `;

    return { html, css };
  }

  if (archetype === 'INFOGRAPHIC_ADVOCACY_PILLARS') {
    // Advocacy Hero: Top Headline + 4 Stats Middle + 5 Action Pillars Lower Half
    const letterBadges = ['01', '02', '03', '04', '05'];
    const pillarsHtml = points.slice(0, 5).map((p, idx) => `
      <div class="apillar-col">
        <div class="apillar-badge">◈ ${letterBadges[idx] || (idx + 1)}</div>
        <div class="apillar-name">${esc(p.label)}</div>
        <div class="apillar-desc">${esc(p.text)}</div>
      </div>
    `).join('');

    const stats4 = statsList.slice(0, 4);
    const html = `
      <div class="apillars-layout">
        <div class="apillars-header">
          <div class="apillars-kicker">${esc(copy.kicker || 'DATA ANGGARAN APBD • ADVOKASI')}</div>
          <div class="apillars-headline">${esc(headlineText)}</div>
          ${copy.deck ? `<div class="apillars-deck">${esc(copy.deck)}</div>` : ''}
        </div>

        <div class="apillars-stats-row">
          ${stats4.map((st) => `
            <div class="apillars-stat-box">
              <div class="apillars-stat-val">${esc(st.value)}</div>
              <div class="apillars-stat-lbl">${esc(st.label)}</div>
            </div>
          `).join('')}
        </div>

        <div class="apillars-bottom-section">
          <div class="apillars-section-tag">${esc(copy.sectionHeading || 'STRATEGI IMPLEMENTASI & TARGET CAPAIAN PROGRAM')}</div>
          <div class="apillars-cols-container">
            ${pillarsHtml}
          </div>
          ${copy.closingLine ? `
            <div class="apillars-closing-banner">
              ${esc(copy.closingLine)}
            </div>
          ` : ''}
        </div>
      </div>
    `;

    const css = `
      .apillars-layout {
        position: absolute;
        top: 76px;
        left: 54px;
        right: 54px;
        height: 1150px;
        text-shadow: ${universalInkHalo};
      }
      .apillars-header {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        background: transparent;
        border-top: 3.5px solid ${accentColor};
        border-bottom: 1.5px solid ${borderRuleColor};
        padding: 12px 0;
      }
      .apillars-kicker {
        font-size: 13.5px;
        font-weight: 900;
        color: ${accentColor};
        letter-spacing: 2px;
        text-transform: uppercase;
        margin-bottom: 4px;
      }
      .apillars-headline {
        font-family: 'Bebas Neue', sans-serif;
        font-size: 48px;
        line-height: 0.95;
        letter-spacing: 1.5px;
        color: ${titleColor};
        margin-bottom: 6px;
      }
      .apillars-deck {
        font-family: 'Plus Jakarta Sans', sans-serif;
        font-style: normal;
        font-size: 13.8px;
        line-height: 1.42;
        color: ${deckTextColor};
        font-weight: 600;
        max-width: 96%;
      }
      .apillars-stats-row {
        position: absolute;
        top: 196px;
        left: 0;
        right: 0;
        display: grid;
        grid-template-columns: repeat(${stats4.length}, 1fr);
        gap: 12px;
      }
      .apillars-stat-box {
        background: transparent;
        border-left: 3.5px solid ${accentColor};
        padding: 6px 0 6px 12px;
      }
      .apillars-stat-val {
        font-family: 'Bebas Neue', sans-serif;
        font-size: 28px;
        color: ${accentColor};
        letter-spacing: 1px;
        line-height: 1.05;
        margin-bottom: 4px;
      }
      .apillars-stat-lbl {
        font-size: 11px;
        font-weight: 800;
        color: ${deckTextColor};
        text-transform: uppercase;
      }
      .apillars-bottom-section {
        position: absolute;
        top: 550px;
        left: 0;
        right: 0;
      }
      .apillars-section-tag {
        display: inline-block;
        background: ${accentColor};
        color: #FFFFFF;
        padding: 5px 16px;
        border-radius: 4px;
        font-size: 12px;
        font-weight: 800;
        letter-spacing: 1.5px;
        margin-bottom: 12px;
        text-transform: uppercase;
        box-shadow: 0 2px 8px rgba(0,0,0,0.1);
      }
      .apillars-cols-container {
        display: grid;
        grid-template-columns: repeat(${Math.min(5, points.length)}, 1fr);
        background: transparent;
        border-top: 2.5px solid ${accentColor};
        border-bottom: 4px solid ${accentColor};
        padding: 16px 0;
        margin-bottom: 14px;
      }
      .apillar-col {
        border-right: 1px solid ${borderRuleColor};
        padding: 10px 10px;
        display: flex;
        flex-direction: column;
        align-items: center;
        text-align: center;
        min-height: 480px;
      }
      .apillar-col:last-child {
        border-right: none;
      }
      .apillar-badge {
        font-size: 13.5px;
        font-weight: 900;
        background: ${accentColor};
        color: #FFFFFF;
        padding: 4px 12px;
        border-radius: 4px;
        letter-spacing: 1.5px;
        margin-bottom: 10px;
      }
      .apillar-name {
        font-size: 16px;
        font-weight: 800;
        color: ${titleColor};
        text-transform: uppercase;
        line-height: 1.25;
        margin-bottom: 8px;
        padding-bottom: 6px;
        border-bottom: 2px solid ${accentColor}44;
        width: 100%;
      }
      .apillar-desc {
        font-size: 13.5px;
        line-height: 1.48;
        color: ${bodyTextColor};
        font-weight: 600;
        flex-grow: 1;
      }
      .apillar-metric-tag {
        margin-top: 10px;
        font-size: 10.5px;
        font-weight: 800;
        letter-spacing: 1px;
        color: ${accentColor};
        background: ${accentColor}18;
        padding: 4px 8px;
        border-radius: 4px;
        border: 1px solid ${accentColor}33;
        width: 90%;
      }
      .apillars-closing-banner {
        background: transparent;
        border-left: 5px solid ${accentColor};
        padding: 8px 0 8px 16px;
        font-size: 14px;
        font-weight: 700;
        color: ${titleColor};
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

    // 1. Deteksi Luminansi Rata-rata Kanvas menggunakan Sharp
    const [stats, meta] = await Promise.all([
      sharp(canvasBuffer).stats(),
      sharp(canvasBuffer).metadata(),
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
    const bgBase64 = `data:${bgMime};base64,${canvasBuffer.toString('base64')}`;
    const fontFaceCss = await ChromiumFontFace.getCss();
    const currentYear = new Date().getFullYear();
    const resolvedBadgeTag = badgeTag || `TELAAH PUBLIK // ${currentYear}`;

    // Bangun poin-poin HTML dan CSS dinamis adaptif terhadap arketipe
    let mainContentHtml = '';
    let customLayoutCss = '';

    if (isInfographic) {
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
      <span style="color: ${archetype === 'INFOGRAPHIC_NARRATIVE_WAVE' ? '#991B1B' : accentColor}; font-weight: 900; background: ${archetype === 'INFOGRAPHIC_NARRATIVE_WAVE' ? 'rgba(255,255,255,0.85)' : 'transparent'}; padding: ${archetype === 'INFOGRAPHIC_NARRATIVE_WAVE' ? '2px 8px' : '0'}; border-radius: 3px;">${esc(editionTag)}</span>
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
