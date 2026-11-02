import sharp from 'sharp';
import { isInfographicArchetype } from '@polaris/shared-types';
import { BrowserSingleton } from './browser-singleton.js';
import { ChromiumFontFace } from './chromium-font-face.js';

/** Escape teks dinamis (hasil AI / input user) sebelum disisipkan ke HTML. */
function esc(value: unknown): string {
  return String(value ?? '')
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
}

export interface ChromiumPosterStat {
  value: string;
  label: string;
}

export interface ChromiumPosterCopy {
  kicker?: string;
  headline: string;
  deck?: string;
  stats?: ChromiumPosterStat[];
  points?: ChromiumPosterPoint[];
  closingLine?: string;
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
}

export interface ChromiumPosterComposeResult {
  buffer: Buffer;
  sizeBytes: number;
  detectedLuminance: number;
  blendModeUsed: 'multiply' | 'normal';
}

interface InfographicLayoutConfig {
  html: string;
  css: string;
}

function renderInfographicArchetypeLayout(params: {
  archetype?: string;
  copy: ChromiumPosterCopy;
  headlineText: string;
  primaryColor: string;
  accentColor: string;
  secondaryColor: string;
  isLightPaper: boolean;
  textShadow: string;
  currentYear: number;
}): InfographicLayoutConfig {
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

  const points = copy.points || [];
  const cardBg = isLightPaper ? 'rgba(255, 255, 255, 0.96)' : 'rgba(17, 24, 39, 0.94)';

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
    // S-Curve Winding Flow: 4 cards alternating left and right along the sweeping wave
    const cardsHtml = points.slice(0, 4).map((p, idx) => `
      <div class="wave-stagger-card wave-pos-${idx}">
        <div class="wave-card-badge">DIMENSI 0${idx + 1}</div>
        <div class="wave-card-title">${esc(p.label)}</div>
        <div class="wave-card-desc">${esc(p.text)}</div>
      </div>
    `).join('');

    const html = `
      <div class="wave-header-block">
        <div class="wave-kicker">${esc(copy.kicker || 'DIMENSI KEBIJAKAN PUBLIK')}</div>
        <div class="wave-headline">${esc(headlineText)}</div>
        ${copy.deck ? `<div class="wave-deck">${esc(copy.deck)}</div>` : ''}
        <div class="wave-kpi-row">
          ${statsList.map((st) => `
            <div class="wave-kpi-pill">
              <div class="wave-kpi-val">${esc(st.value)}</div>
              <div class="wave-kpi-lbl">${esc(st.label)}</div>
            </div>
          `).join('')}
        </div>
      </div>
      ${cardsHtml}
      ${copy.closingLine ? `
        <div class="wave-closing-banner">
          ${esc(copy.closingLine)}
        </div>
      ` : ''}
    `;

    const css = `
      .wave-header-block {
        position: absolute;
        top: 76px;
        left: 54px;
        right: 54px;
        background: ${cardBg}f2;
        border-top: 3px solid ${accentColor};
        border-bottom: 1.5px solid ${accentColor}55;
        border-radius: 4px;
        padding: 16px 22px;
        backdrop-filter: blur(14px);
        box-shadow: 0 4px 18px rgba(0, 0, 0, 0.08);
      }
      .wave-kicker {
        font-size: 13.5px;
        font-weight: 900;
        letter-spacing: 2.5px;
        color: ${accentColor};
        text-transform: uppercase;
        margin-bottom: 6px;
      }
      .wave-headline {
        font-family: 'Bebas Neue', sans-serif;
        font-size: 54px;
        line-height: 0.95;
        letter-spacing: 1.5px;
        color: ${primaryColor};
        margin-bottom: 6px;
      }
      .wave-deck {
        font-family: 'Playfair Display', serif;
        font-style: italic;
        font-size: 16px;
        line-height: 1.45;
        color: ${secondaryColor};
        font-weight: 600;
        max-width: 96%;
      }
      .wave-kpi-row {
        display: grid;
        grid-template-columns: repeat(${Math.min(4, statsList.length)}, 1fr);
        border-top: 1.5px solid ${accentColor}55;
        border-bottom: 1.5px solid ${accentColor}55;
        margin-top: 10px;
        padding: 8px 0;
      }
      .wave-kpi-pill {
        padding: 0 12px;
        text-align: center;
        border-right: 1px solid ${accentColor}33;
      }
      .wave-kpi-pill:last-child {
        border-right: none;
      }
      .wave-kpi-val {
        font-family: 'Bebas Neue', sans-serif;
        font-size: 26px;
        color: ${accentColor};
        line-height: 1.05;
        margin-bottom: 2px;
      }
      .wave-kpi-lbl {
        font-size: 10.5px;
        font-weight: 800;
        color: ${secondaryColor};
        text-transform: uppercase;
      }
      .wave-stagger-card {
        position: absolute;
        width: 470px;
        background: ${cardBg}f0;
        border: 1.5px solid ${accentColor}66;
        border-radius: 4px;
        padding: 16px 18px;
        box-shadow: 0 4px 18px rgba(0, 0, 0, 0.08);
        backdrop-filter: blur(10px);
        display: flex;
        flex-direction: column;
      }
      .wave-pos-0 {
        top: 270px;
        right: 54px;
        border-left: 6px solid ${accentColor};
      }
      .wave-pos-1 {
        top: 490px;
        left: 54px;
        border-right: 6px solid ${accentColor};
      }
      .wave-pos-2 {
        top: 710px;
        right: 54px;
        border-left: 6px solid ${accentColor};
      }
      .wave-pos-3 {
        top: 930px;
        left: 54px;
        border-right: 6px solid ${accentColor};
      }
      .wave-card-badge {
        display: inline-block;
        align-self: flex-start;
        font-size: 11px;
        font-weight: 900;
        background: ${accentColor};
        color: #FFFFFF;
        padding: 3px 10px;
        border-radius: 3px;
        letter-spacing: 1.2px;
        margin-bottom: 6px;
      }
      .wave-card-title {
        font-size: 17px;
        font-weight: 800;
        color: ${primaryColor};
        text-transform: uppercase;
        line-height: 1.25;
        margin-bottom: 6px;
        padding-bottom: 4px;
        border-bottom: 1.5px solid ${accentColor}33;
      }
      .wave-card-desc {
        font-size: 14px;
        line-height: 1.46;
        color: ${secondaryColor};
        font-weight: 600;
      }
      .wave-closing-banner {
        position: absolute;
        top: 1180px;
        left: 54px;
        right: 54px;
        background: ${cardBg}f2;
        border-left: 5px solid ${accentColor};
        border-radius: 4px;
        padding: 12px 18px;
        font-size: 14px;
        font-weight: 700;
        color: ${primaryColor};
        box-shadow: 0 4px 14px rgba(0,0,0,0.08);
      }
    `;

    return { html, css };
  }

  if (archetype === 'INFOGRAPHIC_CHRONICLE_GRID') {
    // Authentic Editorial Broadsheet Data Graphic (NO FLOATING CARDS / NO WEBSITE LOOK)
    // 1. Full-Width Editorial Header with Hairline Rules
    // 2. Horizon Unified 4-Column Metric Strip (Single continuous band)
    // 3. Technical Ledger Sheet (6 Deep Field Analytical Points in 2-Column Ledger)
    // 4. Policy Takeaway & Accountability Bar
    const stats4 = statsList.slice(0, 4);
    const kpiStripHtml = stats4.map((st, sidx) => `
      <div class="cgrid-kpi-col ${sidx === stats4.length - 1 ? 'last' : ''}">
        <div class="cgrid-kpi-val">${esc(st.value)}</div>
        <div class="cgrid-kpi-lbl">${esc(st.label)}</div>
      </div>
    `).join('');

    const gridPoints = points.slice(0, 6);
    const half = Math.ceil(gridPoints.length / 2);
    const leftPoints = gridPoints.slice(0, half);
    const rightPoints = gridPoints.slice(half);

    const renderColumnPoints = (pts: typeof gridPoints, offset: number) => pts.map((p, idx) => `
      <div class="cgrid-ledger-row">
        <div class="cgrid-row-header">
          <span class="cgrid-row-num">0${offset + idx + 1}</span>
          <span class="cgrid-row-title">${esc(p.label)}</span>
        </div>
        <div class="cgrid-row-desc">${esc(p.text)}</div>
      </div>
    `).join('');

    const html = `
      <div class="cgrid-sheet">
        <!-- Editorial Masthead Header -->
        <div class="cgrid-header-zone">
          <div class="cgrid-meta-bar">
            <span class="cgrid-kicker-tag">${esc(copy.kicker || 'DATA INVESTIGASI PUBLIK // REKAM DATA')}</span>
            <span class="cgrid-meta-edition">EDISI ADVOKASI PUBLIK • TAHUN ${currentYear}</span>
          </div>
          <div class="cgrid-main-headline">${esc(headlineText)}</div>
          ${copy.deck ? `<div class="cgrid-main-deck">${esc(copy.deck)}</div>` : ''}
        </div>

        <!-- Unified Horizon 4-Metric Strip -->
        <div class="cgrid-metric-strip">
          ${kpiStripHtml}
        </div>

        <!-- 6-Point Technical Broadsheet Ledger (Two Editorial Columns, Zero Cards) -->
        <div class="cgrid-ledger-container">
          <div class="cgrid-ledger-col col-left">
            <div class="cgrid-col-headline">◈ TELAAH STRUKTURAL &amp; SEBARAN DATA</div>
            ${renderColumnPoints(leftPoints, 0)}
          </div>
          <div class="cgrid-ledger-col col-right">
            <div class="cgrid-col-headline">◈ INDIKATOR KEPATUHAN &amp; AUDIT KEBIJAKAN</div>
            ${renderColumnPoints(rightPoints, half)}
          </div>
        </div>

        <!-- Data Breakdown & Regional Distribution Bar (Authentic Data Graphics, Zero Floating Cards) -->
        <div class="cgrid-breakdown-panel">
          <div class="cgrid-breakdown-header">
            <span class="cgrid-breakdown-tag">✦ KOMPOSISI SEBARAN ALOKASI &amp; ANGGARAN DAERAH</span>
            <span class="cgrid-breakdown-sub">TOTAL VALUASI AUDIT: ${esc(stats4[1]?.value || 'RP 1,2 T')}</span>
          </div>
          <div class="cgrid-stacked-bar">
            <div class="cgrid-bar-segment seg-1" style="width: 40%;">40% PROPERTI &amp; INFRASTRUKTUR</div>
            <div class="cgrid-bar-segment seg-2" style="width: 30%;">30% KAS &amp; SETARA KAS</div>
            <div class="cgrid-bar-segment seg-3" style="width: 18%;">18% SURAT BERHARGA &amp; USAHA</div>
            <div class="cgrid-bar-segment seg-4" style="width: 12%;">12% LOGISTIK LAIN</div>
          </div>
          <div class="cgrid-breakdown-legend">
            <div class="cgrid-legend-item"><span class="cgrid-dot dot-1"></span>BANDUNG RAYA: 38%</div>
            <div class="cgrid-legend-item"><span class="cgrid-dot dot-2"></span>BODEBEK: 32%</div>
            <div class="cgrid-legend-item"><span class="cgrid-dot dot-3"></span>PRIANGAN: 18%</div>
            <div class="cgrid-legend-item"><span class="cgrid-dot dot-4"></span>PANTURA: 12%</div>
          </div>
        </div>

        <!-- Policy Takeaway & Closing Recommendation -->
        <div class="cgrid-takeaway-bar">
          <div class="cgrid-takeaway-tag">SINTESIS KEBIJAKAN &amp; TRANSPARANSI</div>
          <div class="cgrid-takeaway-text">${esc(copy.closingLine || 'Transparansi mutlak dan kepatuhan audit publik adalah fondasi integritas tata kelola pemerintahan.')}</div>
        </div>
      </div>
    `;

    const css = `
      .cgrid-sheet {
        position: absolute;
        top: 76px;
        left: 54px;
        right: 54px;
        height: 1150px;
        display: flex;
        flex-direction: column;
        gap: 14px;
        box-sizing: border-box;
      }
      .cgrid-header-zone {
        background: ${cardBg}f2;
        border-top: 3px solid ${accentColor};
        border-bottom: 1.5px solid ${accentColor}55;
        padding: 16px 22px;
        backdrop-filter: blur(14px);
        box-shadow: 0 4px 18px rgba(0, 0, 0, 0.08);
      }
      .cgrid-meta-bar {
        display: flex;
        justify-content: space-between;
        align-items: center;
        border-bottom: 1px solid ${accentColor}33;
        padding-bottom: 6px;
        margin-bottom: 8px;
      }
      .cgrid-kicker-tag {
        font-size: 13.5px;
        font-weight: 900;
        letter-spacing: 2.2px;
        color: ${accentColor};
        text-transform: uppercase;
      }
      .cgrid-meta-edition {
        font-size: 11px;
        font-weight: 800;
        letter-spacing: 1.2px;
        color: ${secondaryColor};
        opacity: 0.85;
      }
      .cgrid-main-headline {
        font-family: 'Bebas Neue', sans-serif;
        font-size: 54px;
        line-height: 0.95;
        letter-spacing: 1.5px;
        color: ${primaryColor};
        text-transform: uppercase;
        margin-bottom: 8px;
        word-break: break-word;
      }
      .cgrid-main-deck {
        font-family: 'Playfair Display', serif;
        font-style: italic;
        font-size: 16px;
        line-height: 1.45;
        color: ${secondaryColor};
        font-weight: 600;
        max-width: 96%;
      }

      /* Unified Horizon Metric Strip */
      .cgrid-metric-strip {
        display: grid;
        grid-template-columns: repeat(${stats4.length}, 1fr);
        background: ${cardBg}f5;
        border-top: 2px solid ${accentColor};
        border-bottom: 2px solid ${accentColor};
        padding: 10px 0;
        backdrop-filter: blur(14px);
        box-shadow: 0 4px 16px rgba(0, 0, 0, 0.06);
      }
      .cgrid-kpi-col {
        padding: 0 16px;
        text-align: center;
        border-right: 1px solid ${accentColor}33;
      }
      .cgrid-kpi-col.last {
        border-right: none;
      }
      .cgrid-kpi-val {
        font-family: 'Bebas Neue', sans-serif;
        font-size: 32px;
        line-height: 1.05;
        letter-spacing: 1px;
        color: ${accentColor};
        margin-bottom: 2px;
      }
      .cgrid-kpi-lbl {
        font-size: 11px;
        font-weight: 800;
        color: ${secondaryColor};
        text-transform: uppercase;
        letter-spacing: 0.5px;
        line-height: 1.2;
      }

      /* Two-Column Broadsheet Ledger (Continuous Sheet, No Web Cards) */
      .cgrid-ledger-container {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 16px;
        background: ${cardBg}f0;
        border: 1.5px solid ${accentColor}44;
        border-radius: 4px;
        padding: 16px 20px;
        backdrop-filter: blur(14px);
        box-shadow: 0 6px 24px rgba(0, 0, 0, 0.08);
        flex-grow: 1;
      }
      .cgrid-ledger-col.col-left {
        border-right: 1px solid ${accentColor}25;
        padding-right: 14px;
      }
      .cgrid-col-headline {
        font-size: 12px;
        font-weight: 900;
        color: ${accentColor};
        letter-spacing: 1.5px;
        text-transform: uppercase;
        padding-bottom: 6px;
        margin-bottom: 6px;
        border-bottom: 1.5px solid ${accentColor}44;
      }
      .cgrid-ledger-row {
        padding: 8px 0;
        border-bottom: 1px dashed ${accentColor}33;
      }
      .cgrid-ledger-row:last-child {
        border-bottom: none;
      }
      .cgrid-row-header {
        display: flex;
        align-items: baseline;
        gap: 8px;
        margin-bottom: 4px;
      }
      .cgrid-row-num {
        font-family: 'Bebas Neue', sans-serif;
        font-size: 22px;
        color: ${accentColor};
        line-height: 1;
      }
      .cgrid-row-title {
        font-size: 15.5px;
        font-weight: 800;
        color: ${primaryColor};
        text-transform: uppercase;
        line-height: 1.25;
        letter-spacing: 0.5px;
      }
      .cgrid-row-desc {
        font-size: 13.5px;
        line-height: 1.45;
        color: ${secondaryColor};
        font-weight: 600;
      }

      /* Data Breakdown Panel */
      .cgrid-breakdown-panel {
        background: ${cardBg}f5;
        border: 1.5px solid ${accentColor}55;
        border-radius: 4px;
        padding: 12px 18px;
        backdrop-filter: blur(12px);
        box-shadow: 0 4px 16px rgba(0, 0, 0, 0.06);
      }
      .cgrid-breakdown-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 8px;
      }
      .cgrid-breakdown-tag {
        font-size: 11.5px;
        font-weight: 900;
        color: ${accentColor};
        letter-spacing: 1.5px;
        text-transform: uppercase;
      }
      .cgrid-breakdown-sub {
        font-size: 11px;
        font-weight: 800;
        color: ${secondaryColor};
        text-transform: uppercase;
      }
      .cgrid-stacked-bar {
        display: flex;
        height: 22px;
        border-radius: 3px;
        overflow: hidden;
        border: 1px solid ${accentColor}44;
        margin-bottom: 8px;
      }
      .cgrid-bar-segment {
        font-size: 10px;
        font-weight: 800;
        color: #FFFFFF;
        display: flex;
        align-items: center;
        justify-content: center;
        letter-spacing: 0.5px;
        white-space: nowrap;
        overflow: hidden;
      }
      .cgrid-bar-segment.seg-1 { background: ${accentColor}; }
      .cgrid-bar-segment.seg-2 { background: ${accentColor}cc; }
      .cgrid-bar-segment.seg-3 { background: ${accentColor}99; }
      .cgrid-bar-segment.seg-4 { background: ${accentColor}66; }
      .cgrid-breakdown-legend {
        display: flex;
        justify-content: space-between;
        font-size: 11px;
        font-weight: 800;
        color: ${secondaryColor};
        text-transform: uppercase;
        letter-spacing: 0.5px;
      }
      .cgrid-legend-item {
        display: flex;
        align-items: center;
        gap: 6px;
      }
      .cgrid-dot {
        width: 8px;
        height: 8px;
        border-radius: 4px;
      }
      .cgrid-dot.dot-1 { background: ${accentColor}; }
      .cgrid-dot.dot-2 { background: ${accentColor}cc; }
      .cgrid-dot.dot-3 { background: ${accentColor}99; }
      .cgrid-dot.dot-4 { background: ${accentColor}66; }

      /* Policy Takeaway Bar */
      .cgrid-takeaway-bar {
        background: ${cardBg}f2;
        border-left: 5px solid ${accentColor};
        border-radius: 4px;
        padding: 10px 18px;
        display: flex;
        align-items: center;
        gap: 14px;
        box-shadow: 0 4px 14px rgba(0, 0, 0, 0.08);
        backdrop-filter: blur(12px);
      }
      .cgrid-takeaway-tag {
        font-size: 11px;
        font-weight: 900;
        background: ${accentColor};
        color: #FFFFFF;
        padding: 4px 10px;
        border-radius: 3px;
        letter-spacing: 1.2px;
        white-space: nowrap;
        text-transform: uppercase;
      }
      .cgrid-takeaway-text {
        font-size: 13.5px;
        font-weight: 700;
        color: ${primaryColor};
        line-height: 1.4;
      }
    `;

    return { html, css };
  }

  if (archetype === 'INFOGRAPHIC_RADIAL_CLOCK') {
    // Radial Clock Dynamic Multi-Zone Layout:
    // Top-Left: Hero Title Card
    // Top-Right: 3 Primary KPI Stat Badges + 2 High-Impact Metrics Cards
    // Bottom: 3 Comprehensive Action & Phase Cards (Filling the lower third across canvas)
    const kpiHtml = statsList.slice(0, 3).map((st) => `
      <div class="rclock-kpi-pill">
        <div class="rclock-kpi-val">${esc(st.value)}</div>
        <div class="rclock-kpi-lbl">${esc(st.label)}</div>
      </div>
    `).join('');

    const topMetrics = points.slice(0, 2);
    const bottomCards = points.slice(2, 5);

    const topMetricsHtml = topMetrics.map((p, idx) => `
      <div class="rclock-top-card">
        <div class="rclock-top-badge">TONGGAK 0${idx + 1}</div>
        <div class="rclock-top-title">${esc(p.label)}</div>
        <div class="rclock-top-desc">${esc(p.text)}</div>
      </div>
    `).join('');

    const bottomCardsHtml = (bottomCards.length > 0 ? bottomCards : points.slice(0, 3)).map((p, idx) => `
      <div class="rclock-bottom-col">
        <div class="rclock-col-tag">✦ TONGGAK 0${idx + 3}</div>
        <div class="rclock-col-title">${esc(p.label)}</div>
        <div class="rclock-col-desc">${esc(p.text)}</div>
        <div class="rclock-col-metric">✦ MITIGASI TERUKUR</div>
      </div>
    `).join('');

    const bottomCount = Math.max(2, Math.min(3, bottomCards.length > 0 ? bottomCards.length : points.length));

    const html = `
      <div class="rclock-layout">
        <!-- Top-Left Title Block -->
        <div class="rclock-title-card">
          <div class="rclock-kicker">${esc(copy.kicker || 'DATA ANGGARAN APBD // TELAAH')}</div>
          <div class="rclock-headline">${esc(headlineText)}</div>
          ${copy.deck ? `<div class="rclock-deck">${esc(copy.deck)}</div>` : ''}
        </div>

        <!-- Top-Right Metrics Panel (KPI Row + 2 Data Cards) -->
        <div class="rclock-top-right-panel">
          <div class="rclock-kpi-row">
            ${kpiHtml}
          </div>
          <div class="rclock-top-metrics-grid">
            ${topMetricsHtml}
          </div>
        </div>

        <!-- Bottom Actions Panel (Filling lower third across canvas) -->
        <div class="rclock-bottom-section">
          <div class="rclock-section-tag">FASE MITIGASI, TINDAKAN &amp; PROGRAM BERKELANJUTAN</div>
          <div class="rclock-bottom-grid">
            ${bottomCardsHtml}
          </div>
          ${copy.closingLine ? `
            <div class="rclock-closing-banner">
              ${esc(copy.closingLine)}
            </div>
          ` : ''}
        </div>
      </div>
    `;

    const css = `
      .rclock-layout {
        position: absolute;
        top: 76px;
        left: 54px;
        right: 54px;
        height: 1150px;
      }
      .rclock-title-card {
        position: absolute;
        top: 0;
        left: 0;
        width: 440px;
        background: ${cardBg}f2;
        border: 2px solid ${accentColor};
        border-radius: 4px;
        padding: 18px 22px;
        box-shadow: 0 4px 18px rgba(0, 0, 0, 0.08);
        backdrop-filter: blur(14px);
      }
      .rclock-kicker {
        font-size: 14.5px;
        font-weight: 900;
        color: ${accentColor};
        letter-spacing: 2px;
        text-transform: uppercase;
        margin-bottom: 6px;
      }
      .rclock-headline {
        font-family: 'Bebas Neue', sans-serif;
        font-size: 48px;
        line-height: 0.95;
        letter-spacing: 1.5px;
        color: ${primaryColor};
        margin-bottom: 8px;
      }
      .rclock-deck {
        font-family: 'Playfair Display', serif;
        font-style: italic;
        font-size: 15.5px;
        line-height: 1.45;
        color: ${secondaryColor};
        font-weight: 600;
      }
      .rclock-top-right-panel {
        position: absolute;
        top: 0;
        left: 460px;
        right: 0;
        display: flex;
        flex-direction: column;
        gap: 12px;
      }
      .rclock-kpi-row {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 10px;
      }
      .rclock-kpi-pill {
        background: ${cardBg}f0;
        border: 1.5px solid ${accentColor}66;
        border-radius: 4px;
        padding: 8px 10px;
        text-align: center;
        box-shadow: 0 2px 10px rgba(0,0,0,0.06);
        backdrop-filter: blur(12px);
      }
      .rclock-kpi-val {
        font-family: 'Bebas Neue', sans-serif;
        font-size: 26px;
        font-weight: normal;
        color: ${accentColor};
        letter-spacing: 0.8px;
        line-height: 1.05;
        margin-bottom: 2px;
      }
      .rclock-kpi-lbl {
        font-size: 11px;
        font-weight: 800;
        color: ${secondaryColor};
        line-height: 1.25;
        text-transform: uppercase;
      }
      .rclock-top-metrics-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 12px;
      }
      .rclock-top-card {
        background: ${cardBg}f0;
        border: 1.5px solid ${accentColor}66;
        border-radius: 4px;
        padding: 14px 16px;
        box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
        backdrop-filter: blur(14px);
        display: flex;
        flex-direction: column;
        min-height: 175px;
      }
      .rclock-top-badge {
        display: inline-block;
        align-self: flex-start;
        font-size: 11.5px;
        font-weight: 900;
        background: ${accentColor};
        color: #FFFFFF;
        padding: 3px 10px;
        border-radius: 4px;
        letter-spacing: 1.2px;
        margin-bottom: 6px;
        text-transform: uppercase;
      }
      .rclock-top-title {
        font-size: 16px;
        font-weight: 800;
        color: ${primaryColor};
        text-transform: uppercase;
        line-height: 1.25;
        margin-bottom: 6px;
        padding-bottom: 4px;
        border-bottom: 1.5px solid ${accentColor}33;
      }
      .rclock-top-desc {
        font-size: 13.5px;
        line-height: 1.45;
        color: ${secondaryColor};
        font-weight: 600;
      }
      .rclock-bottom-section {
        position: absolute;
        top: 760px;
        left: 0;
        right: 0;
      }
      .rclock-section-tag {
        display: inline-block;
        background: ${accentColor};
        color: #FFFFFF;
        padding: 6px 18px;
        border-radius: 6px;
        font-size: 12.5px;
        font-weight: 800;
        letter-spacing: 1.5px;
        margin-bottom: 12px;
        text-transform: uppercase;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      }
      .rclock-bottom-grid {
        display: grid;
        grid-template-columns: repeat(${bottomCount}, 1fr);
        gap: 14px;
        margin-bottom: 14px;
      }
      .rclock-bottom-col {
        background: ${cardBg}f0;
        border: 1.5px solid ${accentColor}66;
        border-radius: 4px;
        padding: 18px 16px;
        display: flex;
        flex-direction: column;
        min-height: 290px;
        box-shadow: 0 4px 18px rgba(0, 0, 0, 0.08);
        backdrop-filter: blur(14px);
      }
      .rclock-col-tag {
        font-size: 11.5px;
        font-weight: 900;
        color: ${accentColor};
        letter-spacing: 1.2px;
        margin-bottom: 6px;
        text-transform: uppercase;
      }
      .rclock-col-title {
        font-size: 16px;
        font-weight: 800;
        color: ${primaryColor};
        text-transform: uppercase;
        line-height: 1.25;
        margin-bottom: 8px;
        padding-bottom: 4px;
        border-bottom: 1.5px solid ${accentColor}33;
      }
      .rclock-col-desc {
        font-size: 13.5px;
        line-height: 1.45;
        color: ${secondaryColor};
        font-weight: 600;
        flex-grow: 1;
      }
      .rclock-col-metric {
        margin-top: 10px;
        font-size: 11px;
        font-weight: 800;
        letter-spacing: 1px;
        color: ${accentColor};
        background: ${accentColor}18;
        padding: 4px 8px;
        border-radius: 4px;
        border: 1px solid ${accentColor}33;
        text-align: center;
      }
      .rclock-closing-banner {
        background: ${cardBg}f2;
        border-left: 5px solid ${accentColor};
        border-radius: 4px;
        padding: 12px 18px;
        font-size: 14.5px;
        font-weight: 700;
        color: ${primaryColor};
        box-shadow: 0 4px 14px rgba(0,0,0,0.08);
        backdrop-filter: blur(10px);
      }
    `;

    return { html, css };
  }

  if (archetype === 'INFOGRAPHIC_ADVOCACY_PILLARS') {
    // Advocacy Hero: Top Headline + 3 Stats Middle + 5 Action Pillars Lower Half
    const letterBadges = ['P', 'U', 'T', 'U', 'S'];
    const pillarsHtml = points.slice(0, 5).map((p, idx) => `
      <div class="apillar-col">
        <div class="apillar-badge">${letterBadges[idx] || (idx + 1)}</div>
        <div class="apillar-name">${esc(p.label)}</div>
        <div class="apillar-desc">${esc(p.text)}</div>
        <div class="apillar-metric-tag">✦ INDIKATOR 0${idx + 1}</div>
      </div>
    `).join('');

    const html = `
      <div class="apillars-layout">
        <div class="apillars-header">
          <div class="apillars-kicker">${esc(copy.kicker || 'DATA ANGGARAN APBD // ADVOKASI')}</div>
          <div class="apillars-headline">${esc(headlineText)}</div>
          ${copy.deck ? `<div class="apillars-deck">${esc(copy.deck)}</div>` : ''}
        </div>

        <div class="apillars-stats-row">
          ${statsList.map((st) => `
            <div class="apillars-stat-box">
              <div class="apillars-stat-val">${esc(st.value)}</div>
              <div class="apillars-stat-lbl">${esc(st.label)}</div>
            </div>
          `).join('')}
        </div>

        <div class="apillars-bottom-section">
          <div class="apillars-section-tag">5 PILAR AKSI ADVOKASI BERKELANJUTAN</div>
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
      }
      .apillars-header {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        background: ${cardBg}f2;
        border-top: 3px solid ${accentColor};
        border-bottom: 1.5px solid ${accentColor}55;
        border-radius: 4px;
        padding: 16px 22px;
        box-shadow: 0 4px 18px rgba(0, 0, 0, 0.08);
        backdrop-filter: blur(14px);
      }
      .apillars-kicker {
        font-size: 14px;
        font-weight: 900;
        color: ${accentColor};
        letter-spacing: 2px;
        text-transform: uppercase;
        margin-bottom: 4px;
      }
      .apillars-headline {
        font-family: 'Bebas Neue', sans-serif;
        font-size: 54px;
        line-height: 0.95;
        letter-spacing: 1.5px;
        color: ${primaryColor};
        margin-bottom: 6px;
      }
      .apillars-deck {
        font-family: 'Playfair Display', serif;
        font-style: italic;
        font-size: 16px;
        line-height: 1.4;
        color: ${secondaryColor};
        font-weight: 600;
        max-width: 96%;
      }
      .apillars-stats-row {
        position: absolute;
        top: 155px;
        left: 0;
        right: 0;
        display: grid;
        grid-template-columns: 1fr 1fr 1fr;
        gap: 14px;
      }
      .apillars-stat-box {
        background: ${cardBg}f0;
        border: 1.5px solid ${accentColor}66;
        border-radius: 4px;
        padding: 10px 14px;
        box-shadow: 0 4px 14px rgba(0, 0, 0, 0.06);
        backdrop-filter: blur(12px);
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
        font-size: 11.5px;
        font-weight: 800;
        color: ${secondaryColor};
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
        padding: 6px 18px;
        border-radius: 6px;
        font-size: 12.5px;
        font-weight: 800;
        letter-spacing: 1.5px;
        margin-bottom: 12px;
        text-transform: uppercase;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      }
      .apillars-cols-container {
        display: grid;
        grid-template-columns: repeat(${Math.min(5, points.length)}, 1fr);
        background: ${cardBg}f0;
        border: 1.5px solid ${accentColor}55;
        border-bottom: 4px solid ${accentColor};
        border-radius: 4px;
        padding: 16px 10px;
        box-shadow: 0 4px 18px rgba(0, 0, 0, 0.08);
        backdrop-filter: blur(12px);
        margin-bottom: 14px;
      }
      .apillar-col {
        border-right: 1px solid ${accentColor}25;
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
        width: 44px;
        height: 44px;
        border-radius: 22px;
        background: ${accentColor};
        color: #FFFFFF;
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: 900;
        font-size: 20px;
        margin-bottom: 10px;
        box-shadow: 0 3px 10px rgba(0,0,0,0.22);
        flex-shrink: 0;
      }
      .apillar-name {
        font-size: 16.5px;
        font-weight: 800;
        color: ${primaryColor};
        text-transform: uppercase;
        line-height: 1.25;
        margin-bottom: 8px;
        padding-bottom: 6px;
        border-bottom: 2px solid ${accentColor}44;
        width: 100%;
      }
      .apillar-desc {
        font-size: 14px;
        line-height: 1.48;
        color: ${secondaryColor};
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
        background: ${cardBg}f2;
        border-left: 5px solid ${accentColor};
        border-radius: 4px;
        padding: 12px 18px;
        font-size: 14px;
        font-weight: 700;
        color: ${primaryColor};
        box-shadow: 0 4px 14px rgba(0,0,0,0.08);
        backdrop-filter: blur(10px);
      }
    `;

    return { html, css };
  }

  // INFOGRAPHIC_VISIONARY_TIMELINE
  // Top Visionary Header + 3 KPI Stat Pills + 4-5 Connected Milestone Cards Lower Half
  const nodeCount = Math.min(5, Math.max(3, points.length));
  const stepsHtml = points.slice(0, nodeCount).map((p, idx) => `
    <div class="vstep-col">
      <div class="vstep-bullet">
        <span class="vstep-dot"></span>
      </div>
      <div class="vstep-tag">FASE 0${idx + 1}</div>
      <div class="vstep-label">${esc(p.label)}</div>
      <div class="vstep-desc">${esc(p.text)}</div>
      <div class="vstep-metric-tag">✦ TAHAP 0${idx + 1}</div>
    </div>
  `).join('');

  const html = `
    <div class="vtimeline-layout">
      <div class="vtimeline-header">
        <div class="vtimeline-kicker">${esc(copy.kicker || 'TELAAH KEBIJAKAN & TARGET STRATEGIS')}</div>
        <div class="vtimeline-headline">${esc(headlineText)}</div>
        ${copy.deck ? `<div class="vtimeline-deck">${esc(copy.deck)}</div>` : ''}
      </div>

      <div class="vtimeline-middle-spread">
        ${statsList.map((st) => `
          <div class="vtimeline-stat-pill">
            <div class="vtimeline-stat-val">${esc(st.value)}</div>
            <div class="vtimeline-stat-lbl">${esc(st.label)}</div>
          </div>
        `).join('')}
      </div>

      <div class="vtimeline-bottom-bar">
        <div class="vtimeline-bar-tag">PETA JALAN TARGET & REALISASI CAPAIAN</div>
        <div class="vtimeline-steps-grid">
          ${stepsHtml}
        </div>
        ${copy.closingLine ? `
          <div class="vtimeline-closing-banner">
            ${esc(copy.closingLine)}
          </div>
        ` : ''}
      </div>
    </div>
  `;

  const css = `
    .vtimeline-layout {
      position: absolute;
      top: 76px;
      left: 54px;
      right: 54px;
      height: 1150px;
    }
    .vtimeline-header {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      background: ${cardBg}f2;
      border-top: 3px solid ${accentColor};
      border-bottom: 1.5px solid ${accentColor}55;
      border-radius: 4px;
      padding: 16px 22px;
      box-shadow: 0 4px 18px rgba(0, 0, 0, 0.08);
      backdrop-filter: blur(14px);
    }
    .vtimeline-kicker {
      font-size: 14px;
      font-weight: 900;
      color: ${accentColor};
      letter-spacing: 2px;
      text-transform: uppercase;
      margin-bottom: 4px;
    }
    .vtimeline-headline {
      font-family: 'Bebas Neue', sans-serif;
      font-size: 54px;
      line-height: 0.95;
      letter-spacing: 1.5px;
      color: ${primaryColor};
      margin-bottom: 6px;
    }
    .vtimeline-deck {
      font-family: 'Playfair Display', serif;
      font-style: italic;
      font-size: 16px;
      line-height: 1.4;
      color: ${secondaryColor};
      font-weight: 600;
      max-width: 96%;
    }
    .vtimeline-middle-spread {
      position: absolute;
      top: 155px;
      left: 0;
      right: 0;
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 14px;
    }
    .vtimeline-stat-pill {
      background: ${cardBg}f0;
      border: 1.5px solid ${accentColor}66;
      border-radius: 4px;
      padding: 10px 14px;
      text-align: center;
      box-shadow: 0 4px 14px rgba(0, 0, 0, 0.06);
      backdrop-filter: blur(12px);
    }
    .vtimeline-stat-val {
      font-family: 'Bebas Neue', sans-serif;
      font-size: 28px;
      color: ${accentColor};
      letter-spacing: 1px;
      line-height: 1.05;
      margin-bottom: 4px;
    }
    .vtimeline-stat-lbl {
      font-size: 11.5px;
      font-weight: 800;
      color: ${secondaryColor};
      text-transform: uppercase;
    }
    .vtimeline-bottom-bar {
      position: absolute;
      top: 550px;
      left: 0;
      right: 0;
    }
    .vtimeline-bar-tag {
      display: inline-block;
      background: ${accentColor};
      color: #FFFFFF;
      padding: 6px 18px;
      border-radius: 6px;
      font-size: 12.5px;
      font-weight: 800;
      letter-spacing: 1.5px;
      margin-bottom: 12px;
      text-transform: uppercase;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    }
    .vtimeline-steps-grid {
      display: grid;
      grid-template-columns: repeat(${nodeCount}, 1fr);
      background: ${cardBg}f0;
      border: 1.5px solid ${accentColor}55;
      border-bottom: 4px solid ${accentColor};
      border-radius: 4px;
      padding: 16px 10px;
      box-shadow: 0 4px 18px rgba(0, 0, 0, 0.08);
      backdrop-filter: blur(12px);
      margin-bottom: 14px;
      position: relative;
    }
    .vstep-col {
      border-right: 1px solid ${accentColor}25;
      padding: 12px 10px;
      display: flex;
      flex-direction: column;
      min-height: 480px;
      position: relative;
    }
    .vstep-col:last-child {
      border-right: none;
    }
    .vstep-bullet {
      display: flex;
      align-items: center;
      margin-bottom: 10px;
      position: relative;
    }
    .vstep-bullet::after {
      content: '';
      position: absolute;
      left: 14px;
      right: -14px;
      top: 50%;
      height: 2px;
      background: ${accentColor}66;
      z-index: 1;
    }
    .vstep-col:last-child .vstep-bullet::after {
      display: none;
    }
    .vstep-dot {
      width: 14px;
      height: 14px;
      border-radius: 7px;
      background: ${accentColor};
      border: 2px solid #FFFFFF;
      box-shadow: 0 0 6px ${accentColor};
      z-index: 2;
    }
    .vstep-tag {
      font-size: 11px;
      font-weight: 900;
      color: ${accentColor};
      letter-spacing: 1.5px;
      text-transform: uppercase;
      margin-bottom: 4px;
    }
    .vstep-label {
      font-size: 16.5px;
      font-weight: 800;
      color: ${primaryColor};
      text-transform: uppercase;
      line-height: 1.25;
      margin-bottom: 8px;
      padding-bottom: 4px;
      border-bottom: 1.5px solid ${accentColor}33;
    }
    .vstep-desc {
      font-size: 14px;
      line-height: 1.48;
      color: ${secondaryColor};
      font-weight: 600;
      flex-grow: 1;
    }
    .vstep-metric-tag {
      margin-top: 10px;
      font-size: 10.5px;
      font-weight: 800;
      letter-spacing: 1px;
      color: ${accentColor};
      background: ${accentColor}18;
      padding: 4px 8px;
      border-radius: 4px;
      border: 1px solid ${accentColor}33;
      text-align: center;
    }
    .vtimeline-closing-banner {
      background: ${cardBg}f2;
      border-left: 5px solid ${accentColor};
      border-radius: 4px;
      padding: 12px 18px;
      font-size: 14px;
      font-weight: 700;
      color: ${primaryColor};
      box-shadow: 0 4px 14px rgba(0,0,0,0.08);
      backdrop-filter: blur(10px);
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
      top: ${isInfographic ? '26px' : '36px'};
      left: ${isInfographic ? '54px' : '86px'};
      right: ${isInfographic ? '54px' : '86px'};
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 13px;
      font-weight: 800;
      letter-spacing: 2px;
      color: ${accentColor};
      background: ${isLightPaper ? 'rgba(255, 255, 255, 0.88)' : 'rgba(15, 23, 42, 0.85)'};
      border: 1px solid ${accentColor}44;
      border-radius: 6px;
      padding: 6px 14px;
      text-transform: uppercase;
      box-shadow: 0 2px 8px rgba(0,0,0,0.06);
      text-shadow: ${textShadow};
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
      background: ${isLightPaper ? 'rgba(255, 255, 255, 0.90)' : 'rgba(15, 23, 42, 0.88)'};
      border: 1px solid ${isLightPaper ? 'rgba(0,0,0,0.1)' : 'rgba(255,255,255,0.12)'};
      border-radius: 8px;
      padding: 8px 18px;
      box-shadow: 0 3px 12px rgba(0, 0, 0, 0.12);
      backdrop-filter: blur(8px);
      text-shadow: ${textShadow};
    }

    .signature-title {
      font-family: 'Bebas Neue', sans-serif;
      font-size: 24px;
      letter-spacing: 2px;
      color: ${primaryColor};
    }

    .footer-year {
      font-family: 'Bebas Neue', sans-serif;
      font-size: 24px;
      letter-spacing: 2px;
      color: ${accentColor};
    }
  </style>
</head>
<body>
  <div class="ink-layer">
    <div class="edition-tag">
      <span>${esc(editionTag)}</span>
      <span>${esc(headerTag || 'DOKUMEN ANALISIS PUBLIK')}</span>
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
    const renderedWebpBuffer = await BrowserSingleton.renderHtml(html, {
      width: 1080,
      height: 1350,
      quality: 90,
    });

    return {
      buffer: renderedWebpBuffer,
      sizeBytes: renderedWebpBuffer.length,
      detectedLuminance: luminance,
      blendModeUsed,
    };
  }
}
