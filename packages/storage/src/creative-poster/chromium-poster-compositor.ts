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

export interface ChromiumPosterCopy {
  kicker?: string;
  headline: string;
  deck?: string;
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
  } = params;

  const points = copy.points || [];
  const cardBg = isLightPaper ? 'rgba(255, 255, 255, 0.96)' : 'rgba(17, 24, 39, 0.94)';

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
        top: 85px;
        left: 70px;
        right: 70px;
        text-align: left;
        text-shadow: ${textShadow};
      }
      .wave-kicker {
        font-size: 15px;
        font-weight: 900;
        letter-spacing: 2.5px;
        color: ${accentColor};
        text-transform: uppercase;
        margin-bottom: 6px;
      }
      .wave-headline {
        font-family: 'Bebas Neue', sans-serif;
        font-size: 58px;
        line-height: 0.95;
        letter-spacing: 1.5px;
        color: ${primaryColor};
        margin-bottom: 8px;
      }
      .wave-deck {
        font-family: 'Playfair Display', serif;
        font-style: italic;
        font-size: 17px;
        line-height: 1.4;
        color: ${secondaryColor};
        font-weight: 600;
        max-width: 92%;
      }
      .wave-stagger-card {
        position: absolute;
        width: 470px;
        background: ${cardBg};
        border: 2px solid ${accentColor}66;
        border-radius: 14px;
        padding: 16px 18px;
        box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
        backdrop-filter: blur(10px);
        display: flex;
        flex-direction: column;
      }
      .wave-pos-0 {
        top: 240px;
        right: 60px;
        border-left: 6px solid ${accentColor};
      }
      .wave-pos-1 {
        top: 470px;
        left: 60px;
        border-right: 6px solid ${accentColor};
      }
      .wave-pos-2 {
        top: 700px;
        right: 60px;
        border-left: 6px solid ${accentColor};
      }
      .wave-pos-3 {
        top: 930px;
        left: 60px;
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
        border-radius: 4px;
        letter-spacing: 1.2px;
        margin-bottom: 6px;
      }
      .wave-card-title {
        font-size: 15.5px;
        font-weight: 800;
        color: ${primaryColor};
        text-transform: uppercase;
        line-height: 1.25;
        margin-bottom: 6px;
        padding-bottom: 4px;
        border-bottom: 1.5px solid ${accentColor}33;
      }
      .wave-card-desc {
        font-size: 13.5px;
        line-height: 1.45;
        color: ${secondaryColor};
        font-weight: 600;
      }
      .wave-closing-banner {
        position: absolute;
        top: 1180px;
        left: 60px;
        right: 60px;
        background: ${cardBg};
        border-left: 5px solid ${accentColor};
        border-radius: 8px;
        padding: 12px 18px;
        font-size: 15px;
        font-weight: 700;
        color: ${primaryColor};
        box-shadow: 0 4px 14px rgba(0,0,0,0.08);
      }
    `;

    return { html, css };
  }

  if (archetype === 'INFOGRAPHIC_CHRONICLE_GRID') {
    // Split Newspaper Format: Bold Left Masthead Column + Right Chronicle Grid
    const cardsHtml = points.slice(0, 4).map((p, idx) => `
      <div class="cgrid-card">
        <div class="cgrid-badge">TONGGAK 0${idx + 1}</div>
        <div class="cgrid-title">${esc(p.label)}</div>
        <div class="cgrid-desc">${esc(p.text)}</div>
      </div>
    `).join('');

    const html = `
      <div class="cgrid-layout">
        <div class="cgrid-left-masthead">
          <div class="cgrid-masthead-tag">${esc(copy.kicker || 'CHRONICLE INVESTIGASI')}</div>
          <div class="cgrid-giant-headline">${esc(headlineText)}</div>
          ${copy.deck ? `<div class="cgrid-masthead-deck">${esc(copy.deck)}</div>` : ''}
          <div class="cgrid-masthead-box">
            <div class="cgrid-box-title">CATATAN URGENSI</div>
            <div class="cgrid-box-desc">${esc(copy.closingLine || 'Kebijakan berbasis data konkret demi kepentingan publik.')}</div>
          </div>
        </div>

        <div class="cgrid-right-timeline">
          <div class="cgrid-cards-stack">
            ${cardsHtml}
          </div>
          ${copy.closingLine ? `
            <div class="cgrid-closing-banner">
              ${esc(copy.closingLine)}
            </div>
          ` : ''}
        </div>
      </div>
    `;

    const css = `
      .cgrid-layout {
        position: absolute;
        top: 80px;
        left: 50px;
        right: 50px;
        height: 1150px;
      }
      .cgrid-left-masthead {
        position: absolute;
        top: 0;
        left: 0;
        width: 320px;
        height: 1150px;
        background: ${accentColor};
        color: #FFFFFF;
        border-radius: 16px;
        padding: 30px 24px;
        display: flex;
        flex-direction: column;
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
        box-sizing: border-box;
      }
      .cgrid-masthead-tag {
        font-size: 13px;
        font-weight: 800;
        letter-spacing: 2px;
        opacity: 0.9;
        margin-bottom: 12px;
        text-transform: uppercase;
      }
      .cgrid-giant-headline {
        font-family: 'Bebas Neue', sans-serif;
        font-size: 54px;
        line-height: 0.92;
        letter-spacing: 1.5px;
        margin-bottom: 16px;
        text-transform: uppercase;
        word-break: break-word;
      }
      .cgrid-masthead-deck {
        font-family: 'Playfair Display', serif;
        font-style: italic;
        font-size: 16px;
        line-height: 1.4;
        opacity: 0.95;
        margin-bottom: 24px;
      }
      .cgrid-masthead-box {
        margin-top: auto;
        background: rgba(0, 0, 0, 0.25);
        border: 1px solid rgba(255, 255, 255, 0.2);
        border-radius: 10px;
        padding: 16px;
      }
      .cgrid-box-title {
        font-size: 12px;
        font-weight: 900;
        letter-spacing: 1.5px;
        margin-bottom: 6px;
        color: #FDE047;
      }
      .cgrid-box-desc {
        font-size: 13px;
        line-height: 1.4;
        opacity: 0.95;
      }
      .cgrid-right-timeline {
        position: absolute;
        top: 0;
        left: 350px;
        right: 0;
        height: 1150px;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
      }
      .cgrid-cards-stack {
        display: flex;
        flex-direction: column;
        gap: 16px;
      }
      .cgrid-card {
        background: ${cardBg};
        border: 2px solid ${accentColor}55;
        border-left: 6px solid ${accentColor};
        border-radius: 12px;
        padding: 16px 20px;
        box-shadow: 0 6px 20px rgba(0, 0, 0, 0.1);
        display: flex;
        flex-direction: column;
      }
      .cgrid-badge {
        display: inline-block;
        align-self: flex-start;
        font-size: 11px;
        font-weight: 900;
        background: ${accentColor};
        color: #FFFFFF;
        padding: 3px 10px;
        border-radius: 4px;
        margin-bottom: 6px;
        letter-spacing: 1px;
      }
      .cgrid-title {
        font-size: 15.5px;
        font-weight: 800;
        color: ${primaryColor};
        text-transform: uppercase;
        line-height: 1.25;
        margin-bottom: 6px;
        padding-bottom: 4px;
        border-bottom: 1.5px solid ${accentColor}33;
      }
      .cgrid-desc {
        font-size: 13.5px;
        line-height: 1.45;
        color: ${secondaryColor};
        font-weight: 600;
      }
      .cgrid-closing-banner {
        background: ${cardBg};
        border-left: 5px solid ${accentColor};
        border-radius: 8px;
        padding: 12px 18px;
        font-size: 14.5px;
        font-weight: 700;
        color: ${primaryColor};
        box-shadow: 0 4px 14px rgba(0,0,0,0.08);
      }
    `;

    return { html, css };
  }

  if (archetype === 'INFOGRAPHIC_RADIAL_CLOCK') {
    // Vintage Clock Dial Layout: Left Vertical Masthead Ribbon + Right Epoch Cards
    const cardsHtml = points.slice(0, 4).map((p, idx) => `
      <div class="rclock-card">
        <div class="rclock-epoch-tag">FASE 0${idx + 1}</div>
        <div class="rclock-title">${esc(p.label)}</div>
        <div class="rclock-desc">${esc(p.text)}</div>
      </div>
    `).join('');

    const html = `
      <div class="rclock-layout">
        <div class="rclock-vertical-ribbon">
          <span>K</span><span>R</span><span>O</span><span>N</span><span>I</span><span>K</span>
          <span class="ribbon-sep">•</span>
          <span>W</span><span>A</span><span>K</span><span>T</span><span>U</span>
        </div>

        <div class="rclock-header">
          <div class="rclock-kicker">${esc(copy.kicker || 'TELAAH SEJARAH & KRONOLOGI')}</div>
          <div class="rclock-headline">${esc(headlineText)}</div>
          ${copy.deck ? `<div class="rclock-deck">${esc(copy.deck)}</div>` : ''}
        </div>

        <div class="rclock-cards-stack">
          ${cardsHtml}
        </div>

        ${copy.closingLine ? `
          <div class="rclock-closing-banner">
            ${esc(copy.closingLine)}
          </div>
        ` : ''}
      </div>
    `;

    const css = `
      .rclock-layout {
        position: absolute;
        top: 80px;
        left: 45px;
        right: 50px;
        height: 1150px;
      }
      .rclock-vertical-ribbon {
        position: absolute;
        top: 0;
        left: 0;
        width: 48px;
        height: 1150px;
        background: ${accentColor};
        color: #FFFFFF;
        border-radius: 10px;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: space-around;
        font-family: 'Bebas Neue', sans-serif;
        font-size: 24px;
        letter-spacing: 2px;
        box-shadow: 0 6px 18px rgba(0,0,0,0.15);
      }
      .ribbon-sep {
        font-size: 28px;
        color: #FDE047;
      }
      .rclock-header {
        position: absolute;
        top: 0;
        left: 80px;
        right: 0;
      }
      .rclock-kicker {
        font-size: 15px;
        font-weight: 900;
        color: ${accentColor};
        letter-spacing: 2px;
        text-transform: uppercase;
        margin-bottom: 4px;
      }
      .rclock-headline {
        font-family: 'Bebas Neue', sans-serif;
        font-size: 54px;
        line-height: 0.95;
        letter-spacing: 1.5px;
        color: ${primaryColor};
        margin-bottom: 6px;
      }
      .rclock-deck {
        font-family: 'Playfair Display', serif;
        font-style: italic;
        font-size: 16.5px;
        line-height: 1.4;
        color: ${secondaryColor};
        font-weight: 600;
        max-width: 90%;
      }
      .rclock-cards-stack {
        position: absolute;
        top: 170px;
        left: 390px;
        right: 0;
        display: flex;
        flex-direction: column;
        gap: 16px;
      }
      .rclock-card {
        background: ${cardBg};
        border: 2px solid ${accentColor}66;
        border-left: 6px solid ${accentColor};
        border-radius: 12px;
        padding: 16px 20px;
        box-shadow: 0 6px 20px rgba(0, 0, 0, 0.1);
        display: flex;
        flex-direction: column;
      }
      .rclock-epoch-tag {
        display: inline-block;
        align-self: flex-start;
        font-size: 11px;
        font-weight: 900;
        background: ${accentColor};
        color: #FFFFFF;
        padding: 3px 10px;
        border-radius: 4px;
        margin-bottom: 6px;
        letter-spacing: 1.2px;
      }
      .rclock-title {
        font-size: 15.5px;
        font-weight: 800;
        color: ${primaryColor};
        text-transform: uppercase;
        line-height: 1.25;
        margin-bottom: 6px;
        padding-bottom: 4px;
        border-bottom: 1.5px solid ${accentColor}33;
      }
      .rclock-desc {
        font-size: 13.5px;
        line-height: 1.45;
        color: ${secondaryColor};
        font-weight: 600;
      }
      .rclock-closing-banner {
        position: absolute;
        top: 1090px;
        left: 80px;
        right: 0;
        background: ${cardBg};
        border-left: 5px solid ${accentColor};
        border-radius: 8px;
        padding: 12px 18px;
        font-size: 14.5px;
        font-weight: 700;
        color: ${primaryColor};
        box-shadow: 0 4px 14px rgba(0,0,0,0.08);
      }
    `;

    return { html, css };
  }

  if (archetype === 'INFOGRAPHIC_ADVOCACY_PILLARS') {
    // Advocacy Hero: Top Headline + 3 Stats Middle + 5 Action Pillars Bottom
    const letterBadges = ['P', 'U', 'T', 'U', 'S'];
    const pillarsHtml = points.slice(0, 5).map((p, idx) => `
      <div class="apillar-col">
        <div class="apillar-badge">${letterBadges[idx] || (idx + 1)}</div>
        <div class="apillar-name">${esc(p.label)}</div>
        <div class="apillar-desc">${esc(p.text)}</div>
      </div>
    `).join('');

    const stat1 = points[0] || { label: 'PRIORITAS APBD', text: 'Alokasi anggaran terarah.' };
    const stat2 = points[1] || { label: 'URGENSI LAPANGAN', text: 'Fokus pemenuhan kebutuhan warga.' };
    const stat3 = points[2] || { label: 'TARGET CAPAIAN', text: 'Penyelesaian program tepat waktu.' };

    const html = `
      <div class="apillars-layout">
        <div class="apillars-header">
          <div class="apillars-kicker">${esc(copy.kicker || 'DATA ANGGARAN APBD // ADVOKASI')}</div>
          <div class="apillars-headline">${esc(headlineText)}</div>
          ${copy.deck ? `<div class="apillars-deck">${esc(copy.deck)}</div>` : ''}
        </div>

        <div class="apillars-stats-row">
          <div class="apillars-stat-box">
            <div class="apillars-stat-val">${esc(stat1.label)}</div>
            <div class="apillars-stat-lbl">${esc(stat1.text.slice(0, 80))}...</div>
          </div>
          <div class="apillars-stat-box">
            <div class="apillars-stat-val">${esc(stat2.label)}</div>
            <div class="apillars-stat-lbl">${esc(stat2.text.slice(0, 80))}...</div>
          </div>
          <div class="apillars-stat-box">
            <div class="apillars-stat-val">${esc(stat3.label)}</div>
            <div class="apillars-stat-lbl">${esc(stat3.text.slice(0, 80))}...</div>
          </div>
        </div>

        <div class="apillars-bottom-section">
          <div class="apillars-section-tag">PROGRAM AKSI ADVOKASI BERKELANJUTAN</div>
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
        top: 75px;
        left: 54px;
        right: 54px;
        height: 1160px;
      }
      .apillars-header {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
      }
      .apillars-kicker {
        font-size: 15px;
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
        font-size: 16.5px;
        line-height: 1.4;
        color: ${secondaryColor};
        font-weight: 600;
        max-width: 95%;
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
        background: ${cardBg};
        border: 2px solid ${accentColor}66;
        border-radius: 12px;
        padding: 12px 14px;
        box-shadow: 0 4px 14px rgba(0, 0, 0, 0.08);
      }
      .apillars-stat-val {
        font-size: 14.5px;
        font-weight: 900;
        color: ${accentColor};
        text-transform: uppercase;
        margin-bottom: 4px;
      }
      .apillars-stat-lbl {
        font-size: 12px;
        line-height: 1.38;
        color: ${secondaryColor};
        font-weight: 600;
      }
      .apillars-bottom-section {
        position: absolute;
        top: 735px;
        left: 0;
        right: 0;
      }
      .apillars-section-tag {
        display: inline-block;
        background: ${accentColor};
        color: #FFFFFF;
        padding: 5px 16px;
        border-radius: 6px;
        font-size: 12px;
        font-weight: 800;
        letter-spacing: 1.2px;
        margin-bottom: 12px;
        text-transform: uppercase;
      }
      .apillars-cols-container {
        display: grid;
        grid-template-columns: repeat(${Math.min(5, points.length)}, 1fr);
        gap: 12px;
        margin-bottom: 12px;
      }
      .apillar-col {
        background: ${cardBg};
        border: 2px solid ${accentColor}77;
        border-radius: 14px;
        padding: 16px 12px 18px 12px;
        display: flex;
        flex-direction: column;
        align-items: center;
        text-align: center;
        min-height: 250px;
        box-shadow: 0 6px 20px rgba(0, 0, 0, 0.12);
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
        font-size: 14px;
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
        font-size: 12.5px;
        line-height: 1.42;
        color: ${secondaryColor};
        font-weight: 600;
        flex-grow: 1;
      }
      .apillars-closing-banner {
        background: ${cardBg};
        border-left: 5px solid ${accentColor};
        border-radius: 8px;
        padding: 10px 16px;
        font-size: 14px;
        font-weight: 700;
        color: ${primaryColor};
        box-shadow: 0 4px 12px rgba(0,0,0,0.08);
      }
    `;

    return { html, css };
  }

  // INFOGRAPHIC_VISIONARY_TIMELINE
  // Top Visionary Quote + Frosted Card + Connected Bottom Timeline Bar
  const nodeCount = Math.min(5, points.length);
  const stepsHtml = points.slice(0, nodeCount).map((p, idx) => `
    <div class="vstep-col">
      <div class="vstep-bullet">
        <span class="vstep-dot"></span>
      </div>
      <div class="vstep-tag">FASE 0${idx + 1}</div>
      <div class="vstep-label">${esc(p.label)}</div>
      <div class="vstep-desc">${esc(p.text)}</div>
    </div>
  `).join('');

  const html = `
    <div class="vtimeline-layout">
      <div class="vtimeline-header">
        <div class="vtimeline-quote">"Inovasi dan Integritas untuk Kesejahteraan Publik"</div>
        <div class="vtimeline-headline">${esc(headlineText)}</div>
      </div>

      <div class="vtimeline-summary-card">
        <div class="vtimeline-card-kicker">${esc(copy.kicker || 'AGENDA AKSI STRATEGIS')}</div>
        ${copy.deck ? `<div class="vtimeline-card-deck">${esc(copy.deck)}</div>` : ''}
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
      top: 75px;
      left: 54px;
      right: 54px;
      height: 1160px;
    }
    .vtimeline-header {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
    }
    .vtimeline-quote {
      font-family: 'Playfair Display', serif;
      font-style: italic;
      font-size: 18px;
      color: ${accentColor};
      font-weight: 700;
      margin-bottom: 4px;
    }
    .vtimeline-headline {
      font-family: 'Bebas Neue', sans-serif;
      font-size: 56px;
      line-height: 0.95;
      letter-spacing: 1.5px;
      color: ${primaryColor};
    }
    .vtimeline-summary-card {
      position: absolute;
      top: 135px;
      left: 0;
      width: 480px;
      background: ${cardBg};
      border: 2px solid ${accentColor}66;
      border-radius: 14px;
      padding: 16px 20px;
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
      backdrop-filter: blur(10px);
    }
    .vtimeline-card-kicker {
      font-size: 12.5px;
      font-weight: 800;
      color: ${accentColor};
      letter-spacing: 1.5px;
      margin-bottom: 6px;
      text-transform: uppercase;
    }
    .vtimeline-card-deck {
      font-size: 15px;
      line-height: 1.45;
      color: ${secondaryColor};
      font-weight: 600;
    }
    .vtimeline-bottom-bar {
      position: absolute;
      top: 740px;
      left: 0;
      right: 0;
    }
    .vtimeline-bar-tag {
      display: inline-block;
      background: ${accentColor};
      color: #FFFFFF;
      padding: 5px 16px;
      border-radius: 6px;
      font-size: 12px;
      font-weight: 800;
      letter-spacing: 1.2px;
      margin-bottom: 12px;
      text-transform: uppercase;
    }
    .vtimeline-steps-grid {
      display: grid;
      grid-template-columns: repeat(${nodeCount}, 1fr);
      gap: 12px;
      margin-bottom: 12px;
      position: relative;
    }
    .vstep-col {
      background: ${cardBg};
      border: 2px solid ${accentColor}77;
      border-radius: 14px;
      padding: 16px 12px 18px 12px;
      display: flex;
      flex-direction: column;
      min-height: 240px;
      box-shadow: 0 6px 20px rgba(0, 0, 0, 0.12);
      position: relative;
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
      border: 2.5px solid #FFFFFF;
      z-index: 2;
      box-shadow: 0 0 0 2px ${accentColor};
    }
    .vstep-tag {
      font-size: 11.5px;
      font-weight: 900;
      color: ${accentColor};
      letter-spacing: 1.2px;
      margin-bottom: 4px;
    }
    .vstep-label {
      font-size: 14px;
      font-weight: 800;
      color: ${primaryColor};
      text-transform: uppercase;
      line-height: 1.25;
      margin-bottom: 6px;
      padding-bottom: 4px;
      border-bottom: 2px solid ${accentColor}33;
    }
    .vstep-desc {
      font-size: 12.5px;
      line-height: 1.42;
      color: ${secondaryColor};
      font-weight: 600;
      flex-grow: 1;
    }
    .vtimeline-closing-banner {
      background: ${cardBg};
      border-left: 5px solid ${accentColor};
      border-radius: 8px;
      padding: 10px 16px;
      font-size: 14px;
      font-weight: 700;
      color: ${primaryColor};
      box-shadow: 0 4px 12px rgba(0,0,0,0.08);
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

    const ftTop = Math.round(ft.y * 1350);
    const ftLeft = Math.round(ft.x * 1080);
    const ftWidth = Math.round(ft.w * 1080);

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
      top: 36px;
      left: 86px;
      right: 86px;
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
