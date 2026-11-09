import type { ChromiumPosterCopy } from './chromium-poster-compositor.js';

export interface InfographicExtendedParams {
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
}

export interface InfographicExtendedResult {
  html: string;
  css: string;
}

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

export function buildEditorialPieChartHtml(params: {
  copy: ChromiumPosterCopy;
  accentColor: string;
  titleColor: string;
  bodyColor: string;
  halo: string;
  sliceColors?: [string, string, string, string];
  sizePx?: number;
}): string {
  const rawSlices = params.copy.chart?.slices;
  const slices = (
    Array.isArray(rawSlices) && rawSlices.length >= 3
      ? rawSlices.slice(0, 4)
      : [
          { label: 'LAYANAN UTAMA', percentage: 45 },
          { label: 'BANTUAN SASARAN', percentage: 25 },
          { label: 'SARANA PENDUKUNG', percentage: 18 },
          { label: 'EVALUASI BERKALA', percentage: 12 },
        ]
  );

  const rawChartTitle =
    params.copy.chart?.title || 'PROPORSI DISTRIBUSI & ALOKASI PROGRAM';
  const chartTitle = rawChartTitle.replace(/\s*\(\s*100%\s*\)\s*/gi, '').trim();

  const colors: [string, string, string, string] = params.sliceColors || [
    params.accentColor,
    '#D97706',
    '#0E7490',
    '#475569',
  ];

  // Hitung kumulatif persentase untuk SVG circle stroke-dasharray (keliling r=15.9155 adalah tepat 100.0)
  let cumulative = 0;
  const svgCircles = slices
    .map((sl, idx) => {
      const pct = Math.max(2, Math.min(95, Number(sl.percentage) || 25));
      const offset = 25 - cumulative;
      cumulative += pct;
      const color = colors[idx % 4];
      return `<circle cx="21" cy="21" r="15.9154943" fill="transparent" stroke="${color}" stroke-width="7.2" stroke-dasharray="${pct} ${100 - pct}" stroke-dashoffset="${offset}" />`;
    })
    .join('');

  const dominantSlice = [...slices].sort(
    (a, b) => (Number(b.percentage) || 0) - (Number(a.percentage) || 0)
  )[0] || slices[0];
  const maxPct = params.copy.chart?.centerDominantNumber
    ? String(params.copy.chart.centerDominantNumber).replace(/%/g, '') + '%'
    : Math.round(Number(dominantSlice.percentage) || 0) + '%';

  const chartSize = params.sizePx || 88;
  const centerFontSize = Math.round(chartSize * 0.28);

  const legendItems = slices
    .map((sl, idx) => {
      const color = colors[idx % 4];
      const pct = Math.round(Number(sl.percentage) || 0);
      return `
        <div style="display:flex;flex-direction:column;gap:3px;">
          <div style="display:flex;align-items:center;gap:6px;">
            <span style="display:inline-block;width:10px;height:10px;border-radius:2px;background:${color};flex-shrink:0;"></span>
            <span style="font-family:'Bebas Neue',sans-serif;font-size:20px;line-height:1;color:${params.titleColor};text-shadow:${params.halo};">${pct}%</span>
            <span style="font-size:12px;font-weight:800;letter-spacing:0.3px;color:${params.bodyColor};text-transform:uppercase;line-height:1.2;text-shadow:${params.halo};">${esc(sl.label)}</span>
          </div>
          <div style="width:100%;height:4px;background:rgba(148,163,184,0.3);border-radius:2px;overflow:hidden;">
            <div style="width:${Math.min(100, pct)}%;height:100%;background:${color};border-radius:2px;"></div>
          </div>
        </div>
      `;
    })
    .join('');

  return `
    <div style="border-top:2px solid ${params.accentColor};border-bottom:2px solid ${params.accentColor};padding:12px 0;margin-top:2px;">
      <div style="font-family:'Bebas Neue',sans-serif;font-size:20px;letter-spacing:1.3px;color:${params.accentColor};text-transform:uppercase;margin-bottom:8px;text-shadow:${params.halo};">
        ✦ ${esc(chartTitle)} (100%)
      </div>
      <div style="display:flex;align-items:center;gap:14px;">
        <div style="position:relative;width:${chartSize}px;height:${chartSize}px;flex-shrink:0;">
          <svg viewBox="0 0 42 42" width="${chartSize}" height="${chartSize}" style="display:block;filter:drop-shadow(0 2px 4px rgba(0,0,0,0.12));">
            <circle cx="21" cy="21" r="15.9154943" fill="transparent" stroke="rgba(148,163,184,0.22)" stroke-width="7.2" />
            ${svgCircles}
          </svg>
          <div style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center;text-align:center;">
            <span style="font-family:'Bebas Neue',sans-serif;font-size:${centerFontSize}px;line-height:1;letter-spacing:0.5px;color:${params.titleColor};text-shadow:${params.halo};">${maxPct}</span>
          </div>
        </div>
        <div style="flex:1;display:grid;grid-template-columns:1fr 1fr;gap:7px 12px;">
          ${legendItems}
        </div>
      </div>
    </div>
  `;
}

export function renderExtendedInfographicLayout(
  params: InfographicExtendedParams
): InfographicExtendedResult | null {
  const {
    archetype,
    copy,
    headlineText,
    isLightPaper,
  } = params;

  if (
    archetype !== 'INFOGRAPHIC_PUNK_ZINE' &&
    archetype !== 'INFOGRAPHIC_HERITAGE_EDITORIAL' &&
    archetype !== 'INFOGRAPHIC_INDIGENOUS_ADVOCACY' &&
    archetype !== 'INFOGRAPHIC_CLASSICAL_MONUMENT' &&
    archetype !== 'INFOGRAPHIC_RETRO_SUNBURST'
  ) {
    return null;
  }

  const points = copy.points || [];
  const p1 = points[0] || { label: 'CAKUPAN AKSES LAYANAN', text: 'Analisis substansi dan pemetaan indikator kunci berdasarkan data lapangan terkini.' };
  const p2 = points[1] || { label: 'PRIORITAS WILAYAH SASARAN', text: 'Evaluasi sebaran akses layanan dan rasio pemenuhan standar pelayanan publik.' };
  const p3 = points[2] || { label: 'MEKANISME PELAKSANAAN PROGRAM', text: 'Penetapan wilayah fokus intervensi untuk percepatan pemerataan pembangunan daerah.' };
  const p4 = points[3] || { label: 'PENINGKATAN SARANA PUBLIK', text: 'Penguatan dukungan anggaran dan fasilitas teknis secara terukur serta transparan.' };
  const p5 = points[4] || { label: 'PEMANTAUAN DATA BERKALA', text: 'Sinkronisasi lintas instansi dan pelibatan komunitas dalam pengawasan berkala.' };
  const p6 = points[5] || { label: 'TARGET MANFAAT MASYARAKAT', text: 'Komitmen pencapaian indikator kinerja utama demi peningkatan kesejahteraan warga.' };

  const sectionHeadingText =
    copy.sectionHeading || 'STRATEGI IMPLEMENTASI & TARGET CAPAIAN PROGRAM';

  const stats = (copy.stats && copy.stats.length > 0 ? copy.stats : [
    { value: '85%', label: 'Capaian Indikator' },
    { value: '1:1.500', label: 'Rasio Pelayanan' },
    { value: '10 KOTA', label: 'Zona Prioritas' },
    { value: '100%', label: 'Target Transparansi' },
  ]).slice(0, 4);

  // Halo pelindung teks adaptif agar tipografi cetak langsung (Zero-Card Direct Ink)
  // selalu 100% tajam dan terbaca di atas tekstur kertas/kanvas tanpa kotak latar
  const lightPaperHalo =
    '0 1px 2px rgba(255,255,255,0.95), 0 0 10px rgba(255,255,255,0.88), 0 0 22px rgba(251,247,240,0.82)';
  const darkPaperHalo =
    '0 2px 4px rgba(0,0,0,0.95), 0 0 12px rgba(0,0,0,0.88), 0 0 24px rgba(0,0,0,0.80)';

  // ===========================================================================
  // 1. INFOGRAPHIC_PUNK_ZINE (Template 08: Direct Zine Ink Print - Zero Floating Cards)
  // Visual Subject: Lower-Right Corner. Open Space: Top, Left 62%, Upper-Right.
  // ===========================================================================
  if (archetype === 'INFOGRAPHIC_PUNK_ZINE') {
    const pink = '#FF2E93';
    const lime = '#BEF264';
    const inkLight = isLightPaper ? '#09090B' : '#F8FAFC';
    const bodyInk = isLightPaper ? '#18181B' : '#E4E4E7';
    const halo = isLightPaper ? lightPaperHalo : darkPaperHalo;

    const css = `
      .pz-root {
        position: absolute;
        inset: 0;
        width: 1080px;
        height: 1350px;
        pointer-events: none;
        font-family: 'Plus Jakarta Sans', sans-serif;
      }
      .pz-masthead {
        position: absolute;
        top: 52px;
        left: 54px;
        right: 54px;
        border-bottom: 3px solid ${pink};
        padding-bottom: 14px;
        z-index: 25;
      }
      .pz-kicker {
        display: inline-block;
        background: ${lime};
        color: #09090B;
        font-size: 12.5px;
        font-weight: 900;
        letter-spacing: 2px;
        padding: 3px 10px;
        text-transform: uppercase;
        margin-bottom: 8px;
      }
      .pz-title {
        font-family: 'Anton', sans-serif;
        font-size: 50px;
        line-height: 0.94;
        letter-spacing: 1.5px;
        color: ${inkLight};
        text-transform: uppercase;
        text-shadow: ${halo};
      }
      .pz-deck {
        margin-top: 8px;
        font-size: 13.8px;
        font-weight: 700;
        line-height: 1.42;
        color: ${bodyInk};
        max-width: 920px;
        text-shadow: ${halo};
      }
      /* Left Column Direct Ink Points (p1..p5) — Safe width 500px so lower-right artwork is 100% clear */
      .pz-left-stream {
        position: absolute;
        top: 282px;
        left: 54px;
        width: 500px;
        display: flex;
        flex-direction: column;
        gap: 15px;
        z-index: 22;
      }
      .pz-ink-item {
        border-left: 4px solid ${lime};
        padding-left: 14px;
        border-bottom: 1px dashed rgba(190, 242, 100, 0.35);
        padding-bottom: 10px;
      }
      .pz-ink-item:nth-child(even) {
        border-left-color: ${pink};
      }
      .pz-item-meta {
        font-size: 11px;
        font-weight: 900;
        letter-spacing: 1.8px;
        color: ${pink};
        text-transform: uppercase;
        text-shadow: ${halo};
        margin-bottom: 2px;
      }
      .pz-item-head {
        font-family: 'Anton', sans-serif;
        font-size: 22px;
        letter-spacing: 1.4px;
        color: ${inkLight};
        text-transform: uppercase;
        line-height: 1.08;
        margin-bottom: 4px;
        text-shadow: ${halo};
      }
      .pz-item-body {
        font-size: 13.5px;
        line-height: 1.42;
        font-weight: 700;
        color: ${bodyInk};
        text-shadow: ${halo};
      }
      /* Upper-Right Direct Ink KPI Metrics + Point 6 (Leaving lower-right open for artwork) */
      .pz-right-metrics {
        position: absolute;
        top: 282px;
        right: 54px;
        width: 380px;
        display: flex;
        flex-direction: column;
        gap: 16px;
        z-index: 22;
      }
      .pz-kpi-section {
        border-top: 3px solid ${lime};
        border-bottom: 2px solid ${pink};
        padding: 12px 0;
      }
      .pz-kpi-header {
        font-family: 'Anton', sans-serif;
        font-size: 18px;
        letter-spacing: 1.2px;
        color: ${lime};
        text-transform: uppercase;
        margin-bottom: 10px;
        text-shadow: ${halo};
      }
      .pz-kpi-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 12px 16px;
      }
      .pz-kpi-cell {
        border-left: 3px solid ${pink};
        padding-left: 10px;
      }
      .pz-kpi-val {
        font-family: 'Anton', sans-serif;
        font-size: 30px;
        line-height: 1;
        color: ${inkLight};
        text-shadow: ${halo};
      }
      .pz-kpi-lbl {
        font-size: 12.5px;
        font-weight: 800;
        color: ${bodyInk};
        text-transform: uppercase;
        letter-spacing: 0.4px;
        line-height: 1.25;
        margin-top: 3px;
        text-shadow: ${halo};
      }
      .pz-bottom-strip {
        position: absolute;
        top: 1192px;
        left: 54px;
        right: 54px;
        border-top: 2.5px solid ${lime};
        border-bottom: 2.5px solid ${pink};
        padding: 8px 12px;
        text-align: center;
        font-size: 13px;
        font-weight: 900;
        letter-spacing: 1.2px;
        color: ${inkLight};
        text-transform: uppercase;
        text-shadow: ${halo};
        z-index: 25;
      }
    `;

    const html = `
      <div class="pz-root">
        <div class="pz-masthead">
          <div class="pz-kicker">${esc(copy.kicker || 'LAPORAN DATA & ANALISIS KEBIJAKAN')}</div>
          <div class="pz-title">${esc(headlineText)}</div>
          ${copy.deck ? `<div class="pz-deck">${esc(copy.deck)}</div>` : ''}
        </div>

        <div class="pz-left-stream">
          ${[p1, p2, p3, p4, p5].map((pt, i) => `
            <div class="pz-ink-item">
              <div class="pz-item-head">0${i + 1} • ${esc(pt.label)}</div>
              <div class="pz-item-body">${esc(pt.text)}</div>
            </div>
          `).join('')}
        </div>

        <div class="pz-right-metrics">
          <div class="pz-kpi-section">
            <div class="pz-kpi-header">✦ DATA &amp; METRIK KUNCI</div>
            <div class="pz-kpi-grid">
              ${stats.map(st => `
                <div class="pz-kpi-cell">
                  <div class="pz-kpi-val">${esc(st.value)}</div>
                  <div class="pz-kpi-lbl">${esc(st.label)}</div>
                </div>
              `).join('')}
            </div>
          </div>

          <div class="pz-ink-item">
            <div class="pz-item-head">06 • ${esc(p6.label)}</div>
            <div class="pz-item-body">${esc(p6.text)}</div>
          </div>

          ${buildEditorialPieChartHtml({
            copy,
            accentColor: lime,
            titleColor: inkLight,
            bodyColor: bodyInk,
            halo,
            sliceColors: [lime, pink, '#38BDF8', '#A855F7'],
          })}
        </div>

        <div class="pz-bottom-strip">
          ✦ ${esc(copy.closingLine || 'TRANSPARANSI DATA DAN AKUNTABILITAS KEBIJAKAN UNTUK KEPENTINGAN PUBLIK')} ✦
        </div>
      </div>
    `;

    return { html, css };
  }

  // ===========================================================================
  // 2. INFOGRAPHIC_HERITAGE_EDITORIAL (Template 09: Direct Linen Ink Print - Zero Cards)
  // Visual Subject: Upper-Left/Mid-Left. Open Space: Top, Right 58%, Bottom Half.
  // ===========================================================================
  if (archetype === 'INFOGRAPHIC_HERITAGE_EDITORIAL') {
    const maroon = '#991B1B';
    const darkInk = isLightPaper ? '#0F172A' : '#F8FAFC';
    const bodyInk = isLightPaper ? '#1E293B' : '#E2E8F0';
    const accentInk = isLightPaper ? maroon : '#FCA5A5';
    const halo = isLightPaper ? lightPaperHalo : darkPaperHalo;

    const css = `
      .he-root {
        position: absolute;
        inset: 0;
        width: 1080px;
        height: 1350px;
        pointer-events: none;
        font-family: 'Plus Jakarta Sans', sans-serif;
      }
      .he-top-rubric {
        position: absolute;
        top: 50px;
        left: 64px;
        right: 64px;
        border-top: 2.5px solid ${accentInk};
        border-bottom: 1.5px solid ${accentInk};
        padding: 6px 0;
        display: flex;
        justify-content: space-between;
        align-items: center;
        color: ${accentInk};
        font-size: 12.5px;
        font-weight: 900;
        letter-spacing: 2px;
        text-transform: uppercase;
        text-shadow: ${halo};
        z-index: 25;
      }
      .he-masthead {
        position: absolute;
        top: 98px;
        left: 64px;
        right: 64px;
        z-index: 25;
      }
      .he-title-bold {
        font-family: 'Bebas Neue', sans-serif;
        font-size: 50px;
        line-height: 0.94;
        letter-spacing: 1.5px;
        color: ${darkInk};
        text-transform: uppercase;
        text-shadow: ${halo};
      }
      .he-deck-direct {
        margin-top: 6px;
        font-family: 'Plus Jakarta Sans', sans-serif;
        font-style: normal;
        font-size: 13.8px;
        line-height: 1.42;
        color: ${bodyInk};
        font-weight: 700;
        max-width: 940px;
        text-shadow: ${halo};
      }
      /* Right Column Open Expanse (top: 274px -> generous vertical clearance + fits KPI + 01-03 + Pie Chart above y=892px!) */
      .he-right-column {
        position: absolute;
        top: 274px;
        right: 56px;
        width: 470px;
        display: flex;
        flex-direction: column;
        gap: 11px;
        z-index: 22;
      }
      .he-kpi-strip {
        display: grid;
        grid-template-columns: repeat(4, 1fr);
        gap: 10px;
        border-top: 2px solid ${accentInk};
        border-bottom: 2px solid ${accentInk};
        padding: 8px 0;
      }
      .he-kpi-item {
        border-right: 1px solid rgba(153, 27, 27, 0.3);
        padding-right: 8px;
      }
      .he-kpi-item:last-child {
        border-right: none;
      }
      .he-kpi-val {
        font-family: 'Bebas Neue', sans-serif;
        font-size: 27px;
        line-height: 1;
        color: ${accentInk};
        text-shadow: ${halo};
      }
      .he-kpi-lbl {
        font-size: 12px;
        font-weight: 800;
        color: ${bodyInk};
        text-transform: uppercase;
        letter-spacing: 0.4px;
        line-height: 1.2;
        margin-top: 2px;
        text-shadow: ${halo};
      }
      .he-ink-block {
        border-left: 3.5px solid ${accentInk};
        padding-left: 14px;
      }
      .he-ink-tag {
        font-family: 'Bebas Neue', sans-serif;
        font-size: 19.5px;
        letter-spacing: 1.4px;
        color: ${accentInk};
        text-transform: uppercase;
        line-height: 1.05;
        margin-bottom: 2px;
        text-shadow: ${halo};
      }
      .he-ink-body {
        font-size: 12.6px;
        line-height: 1.38;
        color: ${bodyInk};
        font-weight: 700;
        text-shadow: ${halo};
      }
      /* Lower Full-Width 3-Column Direct Ink Grid (04, 05, 06) */
      .he-lower-section {
        position: absolute;
        top: 890px;
        left: 64px;
        right: 64px;
        border-top: 2.5px solid ${accentInk};
        padding-top: 16px;
        z-index: 25;
      }
      .he-lower-heading {
        font-family: 'Bebas Neue', sans-serif;
        font-size: 22px;
        letter-spacing: 1.5px;
        color: ${accentInk};
        text-transform: uppercase;
        margin-bottom: 12px;
        text-shadow: ${halo};
      }
      .he-steps-grid {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 22px;
      }
      .he-step-col {
        border-top: 1.5px solid rgba(153, 27, 27, 0.4);
        padding-top: 10px;
      }
      .he-step-num {
        display: inline-block;
        background: ${maroon};
        color: #FFFFFF;
        font-family: 'Bebas Neue', sans-serif;
        font-size: 15px;
        letter-spacing: 1px;
        padding: 2px 9px;
        border-radius: 3px;
        margin-bottom: 5px;
      }
      .he-step-title {
        font-family: 'Bebas Neue', sans-serif;
        font-size: 19.5px;
        letter-spacing: 1.4px;
        color: ${darkInk};
        text-transform: uppercase;
        line-height: 1.1;
        margin-bottom: 4px;
        text-shadow: ${halo};
      }
      .he-step-text {
        font-size: 13.5px;
        line-height: 1.42;
        color: ${bodyInk};
        font-weight: 700;
        text-shadow: ${halo};
      }
      .he-footer-rule {
        position: absolute;
        top: 1192px;
        left: 64px;
        right: 64px;
        border-top: 2px solid ${accentInk};
        border-bottom: 2px solid ${accentInk};
        padding: 8px 12px;
        text-align: center;
        font-size: 12.5px;
        font-weight: 800;
        letter-spacing: 1px;
        color: ${darkInk};
        text-transform: uppercase;
        text-shadow: ${halo};
        z-index: 25;
      }
    `;

    const html = `
      <div class="he-root">
        <div class="he-top-rubric">
          <span>◈ ${esc(copy.kicker || 'TELAAH DATA & KEBIJAKAN PUBLIK')}</span>
          <span>DOKUMEN ANALISIS TERPADU</span>
        </div>

        <div class="he-masthead">
          <div class="he-title-bold">${esc(headlineText)}</div>
          ${copy.deck ? `<div class="he-deck-direct">${esc(copy.deck)}</div>` : ''}
        </div>

        <div class="he-right-column">
          <div class="he-kpi-strip">
            ${stats.map(st => `
              <div class="he-kpi-item">
                <div class="he-kpi-val">${esc(st.value)}</div>
                <div class="he-kpi-lbl">${esc(st.label)}</div>
              </div>
            `).join('')}
          </div>

          <div class="he-ink-block">
            <div class="he-ink-tag">01 • ${esc(p1.label)}</div>
            <div class="he-ink-body">${esc(p1.text)}</div>
          </div>

          <div class="he-ink-block">
            <div class="he-ink-tag">02 • ${esc(p2.label)}</div>
            <div class="he-ink-body">${esc(p2.text)}</div>
          </div>

          <div class="he-ink-block">
            <div class="he-ink-tag">03 • ${esc(p3.label)}</div>
            <div class="he-ink-body">${esc(p3.text)}</div>
          </div>

          ${buildEditorialPieChartHtml({
            copy,
            accentColor: accentInk,
            titleColor: darkInk,
            bodyColor: bodyInk,
            halo,
            sliceColors: [accentInk, '#D97706', '#0E7490', '#334155'],
          })}
        </div>

        <div class="he-lower-section">
          <div class="he-lower-heading">✦ ${esc(sectionHeadingText)}</div>
          <div class="he-steps-grid">
            <div class="he-step-col">
              <div class="he-step-num">04</div>
              <div class="he-step-title">${esc(p4.label)}</div>
              <div class="he-step-text">${esc(p4.text)}</div>
            </div>
            <div class="he-step-col">
              <div class="he-step-num">05</div>
              <div class="he-step-title">${esc(p5.label)}</div>
              <div class="he-step-text">${esc(p5.text)}</div>
            </div>
            <div class="he-step-col">
              <div class="he-step-num">06</div>
              <div class="he-step-title">${esc(p6.label)}</div>
              <div class="he-step-text">${esc(p6.text)}</div>
            </div>
          </div>
        </div>

        <div class="he-footer-rule">
          ✦ ${esc(copy.closingLine || 'PENGUATAN TATA KELOLA DAN AKSES LAYANAN PUBLIK YANG MERATA BAGI MASYARAKAT')} ✦
        </div>
      </div>
    `;

    return { html, css };
  }

  // ===========================================================================
  // 3. INFOGRAPHIC_INDIGENOUS_ADVOCACY (Template 10: Direct Earth Ink Print - Zero Cards)
  // Visual Subject: Lower-Left Corner. Open Space: Top Band + Right 60% Expanse.
  // ===========================================================================
  if (archetype === 'INFOGRAPHIC_INDIGENOUS_ADVOCACY') {
    const amber = isLightPaper ? '#B45309' : '#FBBF24';
    const greenAccent = isLightPaper ? '#15803D' : '#86EFAC';
    const titleInk = isLightPaper ? '#1C1917' : '#FFFFFF';
    const bodyInk = isLightPaper ? '#292524' : '#FEF3C7';
    const halo = isLightPaper ? lightPaperHalo : darkPaperHalo;

    const css = `
      .ia-root {
        position: absolute;
        inset: 0;
        width: 1080px;
        height: 1350px;
        pointer-events: none;
        font-family: 'Plus Jakarta Sans', sans-serif;
      }
      .ia-header {
        position: absolute;
        top: 52px;
        left: 54px;
        right: 54px;
        border-bottom: 2.5px solid ${amber};
        padding-bottom: 14px;
        z-index: 25;
      }
      .ia-kicker {
        font-size: 13px;
        font-weight: 900;
        letter-spacing: 2.5px;
        color: ${greenAccent};
        text-transform: uppercase;
        margin-bottom: 4px;
        text-shadow: ${halo};
      }
      .ia-headline {
        font-family: 'Anton', sans-serif;
        font-size: 50px;
        line-height: 0.94;
        color: ${titleInk};
        text-transform: uppercase;
        letter-spacing: 1.5px;
        text-shadow: ${halo};
      }
      .ia-deck {
        margin-top: 8px;
        font-size: 13.8px;
        line-height: 1.42;
        color: ${bodyInk};
        font-weight: 600;
        max-width: 940px;
        text-shadow: ${halo};
      }
      /* Left Upper KPI Grid + Poin 01 (Above the lower-left visual subject) */
      .ia-left-kpis {
        position: absolute;
        top: 282px;
        left: 54px;
        width: 410px;
        display: flex;
        flex-direction: column;
        gap: 14px;
        z-index: 22;
      }
      .ia-kpi-title {
        font-family: 'Anton', sans-serif;
        font-size: 18px;
        letter-spacing: 1.2px;
        color: ${amber};
        text-transform: uppercase;
        border-bottom: 1.5px solid ${amber};
        padding-bottom: 4px;
        margin-bottom: 2px;
        text-shadow: ${halo};
      }
      .ia-kpi-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 12px;
      }
      .ia-kpi-box {
        border-left: 3px solid ${greenAccent};
        padding-left: 10px;
      }
      .ia-kpi-val {
        font-family: 'Anton', sans-serif;
        font-size: 28px;
        line-height: 1;
        color: ${titleInk};
        text-shadow: ${halo};
      }
      .ia-kpi-lbl {
        font-size: 12.5px;
        font-weight: 800;
        color: ${bodyInk};
        text-transform: uppercase;
        letter-spacing: 0.4px;
        line-height: 1.25;
        margin-top: 3px;
        text-shadow: ${halo};
      }
      /* Right Wing Open Expanse (x >= 576px, 100% clear of lower-left subject): Poin 02..06 Printed Directly */
      .ia-right-stream {
        position: absolute;
        top: 282px;
        right: 54px;
        width: 450px;
        display: flex;
        flex-direction: column;
        gap: 15px;
        z-index: 22;
      }
      .ia-point {
        border-left: 3.5px solid ${amber};
        padding-left: 14px;
        border-bottom: 1px dashed rgba(251, 191, 36, 0.3);
        padding-bottom: 9px;
      }
      .ia-point:nth-child(even) {
        border-left-color: ${greenAccent};
      }
      .ia-point-tag {
        font-family: 'Anton', sans-serif;
        font-size: 20px;
        letter-spacing: 1.4px;
        color: ${amber};
        text-transform: uppercase;
        margin-bottom: 3px;
        text-shadow: ${halo};
      }
      .ia-point:nth-child(even) .ia-point-tag {
        color: ${greenAccent};
      }
      .ia-point-body {
        font-size: 13px;
        line-height: 1.42;
        color: ${bodyInk};
        font-weight: 700;
        text-shadow: ${halo};
      }
      .ia-banner-bottom {
        position: absolute;
        top: 1192px;
        left: 54px;
        right: 54px;
        border-top: 2px solid ${amber};
        border-bottom: 2px solid ${greenAccent};
        padding: 8px 16px;
        text-align: center;
        font-size: 13px;
        font-weight: 800;
        letter-spacing: 1px;
        color: ${titleInk};
        text-transform: uppercase;
        text-shadow: ${halo};
        z-index: 25;
      }
    `;

    const html = `
      <div class="ia-root">
        <div class="ia-header">
          <div class="ia-kicker">✦ ${esc(copy.kicker || 'ADVOKASI KEBIJAKAN & DATA PUBLIK')}</div>
          <div class="ia-headline">${esc(headlineText)}</div>
          ${copy.deck ? `<div class="ia-deck">${esc(copy.deck)}</div>` : ''}
        </div>

        <div class="ia-left-kpis">
          <div class="ia-kpi-title">INDIKATOR CAPAIAN UTAMA</div>
          <div class="ia-kpi-grid">
            ${stats.map(st => `
              <div class="ia-kpi-box">
                <div class="ia-kpi-val">${esc(st.value)}</div>
                <div class="ia-kpi-lbl">${esc(st.label)}</div>
              </div>
            `).join('')}
          </div>
          <div class="ia-point" style="margin-top: 6px;">
            <div class="ia-point-tag">01 • ${esc(p1.label)}</div>
            <div class="ia-point-body">${esc(p1.text)}</div>
          </div>
          ${buildEditorialPieChartHtml({
            copy,
            accentColor: amber,
            titleColor: titleInk,
            bodyColor: bodyInk,
            halo,
            sliceColors: [amber, greenAccent, '#38BDF8', '#F43F5E'],
          })}
        </div>

        <div class="ia-right-stream">
          ${[p2, p3, p4, p5, p6].map((pt, idx) => `
            <div class="ia-point">
              <div class="ia-point-tag">0${idx + 2} • ${esc(pt.label)}</div>
              <div class="ia-point-body">${esc(pt.text)}</div>
            </div>
          `).join('')}
        </div>

        <div class="ia-banner-bottom">
          ✦ ${esc(copy.closingLine || 'PEMERATAAN AKSES DAN KEADILAN SOSIAL BERBASIS DATA LAPANGAN')} ✦
        </div>
      </div>
    `;

    return { html, css };
  }

  // ===========================================================================
  // 4. INFOGRAPHIC_CLASSICAL_MONUMENT (Template 11: Direct Parchment Ink Print - Zero Cards)
  // Visual Subject: Strictly Lower-Left Corner.
  // Open Space: Entire Top Header + Entire Right-Hand 62% Expanse.
  // ===========================================================================
  if (archetype === 'INFOGRAPHIC_CLASSICAL_MONUMENT') {
    const amber = isLightPaper ? '#854D0E' : '#FBBF24';
    const darkStone = isLightPaper ? '#1C1917' : '#F8FAFC';
    const bodyStone = isLightPaper ? '#292524' : '#E7E5E4';
    const ruleColor = isLightPaper ? 'rgba(133, 77, 14, 0.45)' : 'rgba(251, 191, 36, 0.45)';
    const halo = isLightPaper ? lightPaperHalo : darkPaperHalo;

    const css = `
      .cm-root {
        position: absolute;
        inset: 0;
        width: 1080px;
        height: 1350px;
        pointer-events: none;
        font-family: 'Plus Jakarta Sans', sans-serif;
      }
      /* Top-Left Header, Executive Deck & Upper-Left Points in natural flow (Zero Overlap!) */
      .cm-header-box {
        position: absolute;
        top: 62px;
        left: 68px;
        width: 530px;
        z-index: 25;
      }
      .cm-kicker {
        font-size: 13px;
        font-weight: 900;
        letter-spacing: 3px;
        color: ${amber};
        text-transform: uppercase;
        margin-bottom: 4px;
        text-shadow: ${halo};
      }
      .cm-headline {
        font-family: 'Bebas Neue', sans-serif;
        font-size: 48px;
        line-height: 0.94;
        letter-spacing: 1.5px;
        color: ${darkStone};
        text-transform: uppercase;
        text-shadow: ${halo};
      }
      .cm-deck {
        font-family: 'Plus Jakarta Sans', sans-serif;
        font-style: normal;
        font-size: 13.5px;
        line-height: 1.42;
        color: ${bodyStone};
        font-weight: 700;
        margin-top: 8px;
        padding-top: 8px;
        border-top: 1.5px solid ${ruleColor};
        max-width: 480px;
        text-shadow: ${halo};
      }
      /* Upper-Left Open Parchment Zone (Flows naturally right below .cm-deck, above lower-left subject) */
      .cm-left-upper-points {
        margin-top: 18px;
        width: 420px;
        display: flex;
        flex-direction: column;
        gap: 16px;
      }
      /* Top-Right Direct Ink KPI Ledger (Zero Background Box) */
      .cm-kpi-ledger {
        position: absolute;
        top: 62px;
        right: 56px;
        width: 440px;
        border-top: 3px solid ${amber};
        border-bottom: 2px solid ${amber};
        padding: 10px 0;
        z-index: 25;
      }
      .cm-kpi-title {
        font-family: 'Bebas Neue', sans-serif;
        font-size: 21px;
        letter-spacing: 1.5px;
        color: ${amber};
        text-transform: uppercase;
        margin-bottom: 8px;
        border-bottom: 1px solid ${ruleColor};
        padding-bottom: 4px;
        text-shadow: ${halo};
      }
      .cm-kpi-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 8px 16px;
      }
      .cm-kpi-item {
        border-left: 2.5px solid ${amber};
        padding-left: 8px;
      }
      .cm-kpi-val {
        font-family: 'Bebas Neue', sans-serif;
        font-size: 26px;
        line-height: 1;
        color: ${darkStone};
        text-shadow: ${halo};
      }
      .cm-kpi-lbl {
        font-size: 12.5px;
        font-weight: 800;
        color: ${bodyStone};
        text-transform: uppercase;
        letter-spacing: 0.4px;
        line-height: 1.25;
        text-shadow: ${halo};
      }
      /* Right-Hand Open Parchment Expanse (x >= 584px, 100% clear of lower-left roof/subject; balanced 22px gap!) */
      .cm-right-column {
        position: absolute;
        top: 252px;
        right: 56px;
        width: 440px;
        display: flex;
        flex-direction: column;
        gap: 22px;
        z-index: 22;
      }
      .cm-direct-point {
        border-left: 3.5px solid ${amber};
        padding-left: 14px;
        border-bottom: 1px dashed ${ruleColor};
        padding-bottom: 12px;
      }
      .cm-bar-track {
        margin-top: 7px;
        height: 4px;
        width: 100%;
        background: ${ruleColor};
        border-radius: 2px;
        overflow: hidden;
      }
      .cm-bar-fill {
        height: 100%;
        background: ${amber};
        border-radius: 2px;
      }
      .cm-point-header {
        display: flex;
        align-items: baseline;
        gap: 8px;
        margin-bottom: 4px;
      }
      .cm-point-num {
        font-family: 'Bebas Neue', sans-serif;
        font-size: 19px;
        color: ${amber};
        letter-spacing: 1px;
        text-shadow: ${halo};
      }
      .cm-point-tag {
        font-family: 'Bebas Neue', sans-serif;
        font-size: 22px;
        letter-spacing: 1.4px;
        color: ${darkStone};
        text-transform: uppercase;
        line-height: 1.05;
        text-shadow: ${halo};
      }
      .cm-point-body {
        font-size: 13.2px;
        line-height: 1.44;
        color: ${bodyStone};
        font-weight: 700;
        text-shadow: ${halo};
      }
      .cm-bottom-banner {
        border-top: 2.5px solid ${amber};
        border-bottom: 2.5px solid ${amber};
        padding: 12px 4px;
        text-align: left;
        font-size: 12.5px;
        font-weight: 800;
        line-height: 1.42;
        letter-spacing: 0.8px;
        color: ${darkStone};
        text-transform: uppercase;
        text-shadow: ${halo};
      }
    `;

    const html = `
      <div class="cm-root">
        <div class="cm-header-box">
          <div class="cm-kicker">${esc(copy.kicker || 'DATA LAYANAN PUBLIK • ANALISIS DAERAH')}</div>
          <div class="cm-headline">${esc(headlineText)}</div>
          ${copy.deck ? `<div class="cm-deck">${esc(copy.deck)}</div>` : ''}

          <div class="cm-left-upper-points">
            ${[p1, p2].map((pt, idx) => `
              <div class="cm-direct-point" style="padding-bottom: 8px;">
                <div class="cm-point-header">
                  <span class="cm-point-num">0${idx + 1} •</span>
                  <span class="cm-point-tag" style="font-size: 19px;">${esc(pt.label)}</span>
                </div>
                <div class="cm-point-body" style="font-size: 12.5px; line-height: 1.38;">${esc(pt.text)}</div>
              </div>
            `).join('')}
            ${buildEditorialPieChartHtml({
              copy,
              accentColor: amber,
              titleColor: darkStone,
              bodyColor: bodyStone,
              halo,
              sliceColors: [amber, '#991B1B', '#0E7490', '#44403C'],
            })}
          </div>
        </div>

        <div class="cm-kpi-ledger">
          <div class="cm-kpi-title">✦ INDIKATOR &amp; CAPAIAN UTAMA</div>
          <div class="cm-kpi-grid">
            ${stats.map(st => `
              <div class="cm-kpi-item">
                <div class="cm-kpi-val">${esc(st.value)}</div>
                <div class="cm-kpi-lbl">${esc(st.label)}</div>
              </div>
            `).join('')}
          </div>
        </div>

        <div class="cm-right-column">
          ${[p3, p4, p5, p6].map((pt, idx) => `
            <div class="cm-direct-point">
              <div class="cm-point-header">
                <span class="cm-point-num">0${idx + 3} •</span>
                <span class="cm-point-tag">${esc(pt.label)}</span>
              </div>
              <div class="cm-point-body">${esc(pt.text)}</div>
              <div class="cm-bar-track"><div class="cm-bar-fill" style="width: ${[88, 74, 80, 92][idx] || 78}%;"></div></div>
            </div>
          `).join('')}

          <div class="cm-bottom-banner" style="margin-top: 4px;">
            ✦ ${esc(copy.closingLine || 'PENGUATAN TRANSPARANSI DAN AKUNTABILITAS ANGGARAN DEMI PEMERATAAN LAYANAN PUBLIK')}
          </div>
        </div>
      </div>
    `;

    return { html, css };
  }

  // ===========================================================================
  // 5. INFOGRAPHIC_RETRO_SUNBURST (Template 12: Direct Sunburst Ink Print - Zero Cards)
  // Visual Subject: Middle-Left Margin. Open Space: Top, Right 58%, Lower Half.
  // ===========================================================================
  if (archetype === 'INFOGRAPHIC_RETRO_SUNBURST') {
    const orange = isLightPaper ? '#C2410C' : '#FB923C';
    const rust = isLightPaper ? '#431407' : '#FEF3C7';
    const bodyRust = isLightPaper ? '#292524' : '#FDE68A';
    const ruleRust = isLightPaper ? 'rgba(67, 20, 7, 0.35)' : 'rgba(254, 243, 199, 0.35)';
    const halo = isLightPaper ? lightPaperHalo : darkPaperHalo;

    const css = `
      .rs-root {
        position: absolute;
        inset: 0;
        width: 1080px;
        height: 1350px;
        pointer-events: none;
        font-family: 'Plus Jakarta Sans', sans-serif;
      }
      .rs-headline-box {
        position: absolute;
        top: 50px;
        left: 54px;
        width: 500px;
        z-index: 25;
      }
      .rs-top-tag {
        display: inline-block;
        background: ${orange};
        color: #FFFFFF;
        font-size: 12px;
        font-weight: 900;
        padding: 4px 10px;
        border-radius: 3px;
        letter-spacing: 1.8px;
        text-transform: uppercase;
        margin-bottom: 6px;
      }
      .rs-title {
        font-family: 'Anton', sans-serif;
        font-size: 56px;
        line-height: 0.93;
        color: ${rust};
        text-transform: uppercase;
        letter-spacing: 1.5px;
        text-shadow: ${halo};
      }
      .rs-deck {
        margin-top: 8px;
        font-size: 13.5px;
        line-height: 1.42;
        color: ${bodyRust};
        font-weight: 700;
        text-shadow: ${halo};
      }
      /* Right Wing Direct Ink (Top & Mid Right) */
      .rs-right-wing {
        position: absolute;
        top: 52px;
        right: 54px;
        width: 445px;
        display: flex;
        flex-direction: column;
        gap: 16px;
        z-index: 22;
      }
      .rs-kpi-row {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 10px 14px;
        border-top: 3px solid ${orange};
        border-bottom: 2px solid ${rust};
        padding: 10px 0;
      }
      .rs-kpi-cell {
        border-left: 3px solid ${orange};
        padding-left: 8px;
      }
      .rs-kpi-val {
        font-family: 'Anton', sans-serif;
        font-size: 26px;
        line-height: 1;
        color: ${orange};
        text-shadow: ${halo};
      }
      .rs-kpi-lbl {
        font-size: 12.5px;
        font-weight: 800;
        color: ${rust};
        text-transform: uppercase;
        letter-spacing: 0.4px;
        line-height: 1.25;
        margin-top: 3px;
        text-shadow: ${halo};
      }
      .rs-ink-block {
        border-left: 3.5px solid ${rust};
        padding-left: 14px;
        border-bottom: 1px dashed ${ruleRust};
        padding-bottom: 10px;
      }
      .rs-ink-tag {
        font-family: 'Anton', sans-serif;
        font-size: 19px;
        letter-spacing: 1.4px;
        color: ${orange};
        margin-bottom: 3px;
        text-transform: uppercase;
        text-shadow: ${halo};
      }
      .rs-ink-body {
        font-size: 13.5px;
        line-height: 1.42;
        color: ${bodyRust};
        font-weight: 700;
        text-shadow: ${halo};
      }
      /* Lower Full-Width 3-Column Direct Ink Dossier Grid (p4, p5, p6) */
      .rs-trio-box {
        position: absolute;
        top: 860px;
        left: 54px;
        right: 54px;
        border-top: 2.5px solid ${rust};
        border-bottom: 2px solid ${rust};
        padding: 16px 0;
        display: grid;
        grid-template-columns: 1fr 1fr 1fr;
        gap: 20px;
        z-index: 25;
      }
      .rs-trio-cell {
        border-right: 1.5px dashed ${ruleRust};
        padding-right: 14px;
      }
      .rs-trio-cell:last-child {
        border-right: none;
        padding-right: 0;
      }
      .rs-footer-strip {
        position: absolute;
        top: 1192px;
        left: 54px;
        right: 54px;
        border-top: 2.5px solid ${orange};
        border-bottom: 2px solid ${rust};
        padding: 8px 18px;
        text-align: center;
        font-size: 12.5px;
        font-weight: 800;
        letter-spacing: 1.2px;
        color: ${rust};
        text-transform: uppercase;
        text-shadow: ${halo};
        z-index: 25;
      }
    `;

    const html = `
      <div class="rs-root">
        <div class="rs-headline-box">
          <div class="rs-top-tag">${esc(copy.kicker || 'TELAAH DATA & KEBIJAKAN')}</div>
          <div class="rs-title">${esc(headlineText)}</div>
          ${copy.deck ? `<div class="rs-deck">${esc(copy.deck)}</div>` : ''}
        </div>

        <div class="rs-right-wing">
          <div class="rs-kpi-row">
            ${stats.map(st => `
              <div class="rs-kpi-cell">
                <div class="rs-kpi-val">${esc(st.value)}</div>
                <div class="rs-kpi-lbl">${esc(st.label)}</div>
              </div>
            `).join('')}
          </div>

          <div class="rs-ink-block">
            <div class="rs-ink-tag">01 • ${esc(p1.label)}</div>
            <div class="rs-ink-body">${esc(p1.text)}</div>
          </div>

          <div class="rs-ink-block">
            <div class="rs-ink-tag">02 • ${esc(p2.label)}</div>
            <div class="rs-ink-body">${esc(p2.text)}</div>
          </div>

          <div class="rs-ink-block">
            <div class="rs-ink-tag">03 • ${esc(p3.label)}</div>
            <div class="rs-ink-body">${esc(p3.text)}</div>
          </div>

          ${buildEditorialPieChartHtml({
            copy,
            accentColor: orange,
            titleColor: rust,
            bodyColor: bodyRust,
            halo,
            sliceColors: [orange, '#991B1B', '#0E7490', '#44403C'],
          })}
        </div>

        <div class="rs-trio-box">
          <div class="rs-trio-cell">
            <div class="rs-ink-tag">04 • ${esc(p4.label)}</div>
            <div class="rs-ink-body">${esc(p4.text)}</div>
          </div>
          <div class="rs-trio-cell">
            <div class="rs-ink-tag">05 • ${esc(p5.label)}</div>
            <div class="rs-ink-body">${esc(p5.text)}</div>
          </div>
          <div class="rs-trio-cell">
            <div class="rs-ink-tag">06 • ${esc(p6.label)}</div>
            <div class="rs-ink-body">${esc(p6.text)}</div>
          </div>
        </div>

        <div class="rs-footer-strip">
          ✦ ${esc(copy.closingLine || 'KOMITMEN TRANSPARANSI DAN AKUNTABILITAS KEBIJAKAN PUBLIK')} ✦
        </div>
      </div>
    `;

    return { html, css };
  }

  return null;
}
