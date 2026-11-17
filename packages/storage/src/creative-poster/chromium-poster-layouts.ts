import type { ChromiumPosterCopy, ChromiumPosterPoint } from './chromium-poster-compositor.js';

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

export interface RenderPosterArchetypeParams {
  archetype?: string;
  layoutVariant?: number;
  copy: ChromiumPosterCopy;
  headlineText: string;
  primaryColor: string;
  accentColor: string;
  secondaryColor: string;
  isLightPaper: boolean;
  textShadow: string;
  flowTop: number;
  flowLeft: number;
  safeFlowWidth: number;
  flowMaxHeight: number;
  titleFontSize: number;
  currentYear: number;
}

type PosterFamily =
  | 'KINETIC_HERO'
  | 'HIGHLIGHT_ZINE'
  | 'RISOGRAPH_GRID'
  | 'MINIMAL_MANIFESTO'
  | 'MAGAZINE_COVER'
  | 'VINTAGE_CHRONICLE';

function resolvePosterFamily(archetype?: string, variant: number = 0): PosterFamily {
  switch (archetype) {
    case 'KINETIC_MOTION':
    case 'POP_OUT_HERO':
    case 'TYPOGRAPHIC_MASK':
      return 'KINETIC_HERO';
    case 'POP_MAGAZINE_COLLAGE':
    case 'TORN_PAPER_NEWS':
    case 'TORN_VISION':
    case 'ISOMETRIC_CREATIVE_COLLAGE':
      return 'HIGHLIGHT_ZINE';
    case 'STREET_JOURNALISM':
    case 'THRESHOLD_RISOGRAPH':
    case 'RETRO_SPLIT_MITIGATION':
    case 'TECHNICAL_GRID_CALLOUT':
      return 'RISOGRAPH_GRID';
    case 'SWISS_DUOTONE_EDITORIAL':
    case 'CONSTRUCTIVIST_BAUHAUS':
    case 'MODULAR_GRID_CARDS':
      return 'MINIMAL_MANIFESTO';
    case 'STATEMENT_PROFILE':
    case 'EXECUTIVE_SEMINAR':
    case 'GALLERY_EXHIBITION':
      return 'MAGAZINE_COVER';
    case 'RETRO_CAMPAIGN':
    case 'VINTAGE_PERSONA_GAZETTE':
    case 'BROADSHEET_NEWSPAPER':
    case 'STORYBOOK_ILLUSTRATED':
    case 'POLAROID_ADVENTURE':
      return 'VINTAGE_CHRONICLE';
    default: {
      const families: PosterFamily[] = [
        'KINETIC_HERO',
        'HIGHLIGHT_ZINE',
        'RISOGRAPH_GRID',
        'MINIMAL_MANIFESTO',
        'MAGAZINE_COVER',
        'VINTAGE_CHRONICLE',
      ];
      return families[Math.abs(variant) % families.length];
    }
  }
}

/**
 * Memecah headline menjadi 2 bagian ekspresif:
 * Bagian 1 (aksen/script/highlight) dan Bagian 2 (display tebal raksasa).
 */
function splitExpressiveHeadline(headline: string): { lead: string; main: string } {
  const words = headline.trim().split(/\s+/).filter(Boolean);
  if (words.length <= 1) {
    return { lead: '', main: headline.trim() };
  }
  if (words.length === 2) {
    return { lead: words[0], main: words[1] };
  }
  const splitIdx = Math.ceil(words.length / 2);
  return {
    lead: words.slice(0, splitIdx - 1).join(' '),
    main: words.slice(splitIdx - 1).join(' '),
  };
}

export function renderPosterArchetypeLayout(params: RenderPosterArchetypeParams): {
  html: string;
  css: string;
} {
  const {
    archetype,
    layoutVariant = 0,
    copy,
    headlineText,
    primaryColor,
    accentColor,
    secondaryColor,
    isLightPaper,
    textShadow,
    flowTop,
    flowLeft,
    safeFlowWidth,
    flowMaxHeight,
    titleFontSize,
    currentYear,
  } = params;

  const variant = Math.abs(layoutVariant) % 4;
  const family = resolvePosterFamily(archetype, variant);
  const { lead, main } = splitExpressiveHeadline(headlineText);
  const points = (copy.points || []).slice(0, 3);
  const primaryStat = copy.stats?.[0];
  const secondaryStat = copy.stats?.[1];
  const yearShort = `'${String(currentYear).slice(-2)}`;

  const cardSurfaceBg = isLightPaper
    ? 'rgba(255, 255, 255, 0.90)'
    : 'rgba(15, 23, 42, 0.88)';
  const cardBorderColor = isLightPaper
    ? 'rgba(15, 23, 42, 0.14)'
    : 'rgba(255, 255, 255, 0.18)';
  const inverseTextOnAccent = '#FFFFFF';

  // ===========================================================================
  // 1. KINETIC HERO (Fly High / One Step / Billie Eilish Style)
  // ===========================================================================
  if (family === 'KINETIC_HERO') {
    const heroGiantSize = Math.min(134, Math.round(titleFontSize * 1.32));
    const isRightAligned = variant === 1 || variant === 3;
    const pillsHtml = points
      .slice(0, 2)
      .map(
        (p: ChromiumPosterPoint, idx: number) => `
        <div class="kh-pill">
          <span class="kh-pill-num">0${idx + 1}</span>
          <div class="kh-pill-body">
            <div class="kh-pill-label">${esc(p.label)}</div>
            <div class="kh-pill-text">${esc(p.text)}</div>
          </div>
        </div>`
      )
      .join('');

    const css = `
      .editorial-flow-zone {
        position: absolute;
        top: ${flowTop}px;
        left: ${flowLeft}px;
        width: ${safeFlowWidth}px;
        max-height: ${flowMaxHeight}px;
        display: flex;
        flex-direction: column;
        align-items: ${isRightAligned ? 'flex-end' : 'flex-start'};
        text-align: ${isRightAligned ? 'right' : 'left'};
        box-sizing: border-box;
      }
      .kh-header-row {
        display: flex;
        align-items: center;
        gap: 12px;
        margin-bottom: 8px;
      }
      .kh-kicker-badge {
        background: ${accentColor};
        color: ${inverseTextOnAccent};
        font-size: 13px;
        font-weight: 900;
        letter-spacing: 2.5px;
        padding: 5px 14px;
        text-transform: uppercase;
        border-radius: 999px;
      }
      .kh-starburst-year {
        font-family: 'Anton', 'Bebas Neue', sans-serif;
        font-size: 24px;
        color: ${primaryColor};
        border: 2px solid ${primaryColor};
        border-radius: 50%;
        width: 48px;
        height: 48px;
        display: flex;
        align-items: center;
        justify-content: center;
        transform: rotate(${isRightAligned ? '12deg' : '-10deg'});
      }
      .kh-script-lead {
        font-family: 'Playfair Display', Georgia, serif;
        font-style: italic;
        font-weight: 800;
        font-size: ${Math.round(heroGiantSize * 0.56)}px;
        line-height: 0.92;
        color: ${accentColor};
        margin-bottom: -8px;
        z-index: 2;
        text-shadow: ${textShadow};
      }
      .kh-giant-main {
        font-family: 'Anton', 'Bebas Neue', sans-serif;
        font-size: ${heroGiantSize}px;
        line-height: 0.88;
        letter-spacing: 2px;
        color: ${primaryColor};
        text-transform: uppercase;
        margin-bottom: 16px;
        text-shadow: ${textShadow};
        word-break: break-word;
      }
      .kh-manifesto-quote {
        font-size: 20px;
        font-weight: 700;
        line-height: 1.35;
        color: ${primaryColor};
        background: ${cardSurfaceBg};
        border-${isRightAligned ? 'right' : 'left'}: 6px solid ${accentColor};
        padding: 12px 18px;
        max-width: 88%;
        margin-bottom: 16px;
        box-shadow: 0 10px 28px rgba(0,0,0,0.12);
      }
      .kh-pills-grid {
        display: grid;
        grid-template-columns: repeat(${Math.max(1, Math.min(2, points.length))}, 1fr);
        gap: 12px;
        width: 100%;
      }
      .kh-pill {
        display: flex;
        align-items: flex-start;
        gap: 10px;
        background: ${cardSurfaceBg};
        border: 1px solid ${cardBorderColor};
        padding: 10px 14px;
        border-radius: 8px;
        text-align: left;
      }
      .kh-pill-num {
        font-family: 'Bebas Neue', sans-serif;
        font-size: 28px;
        line-height: 1;
        color: ${accentColor};
        font-weight: 900;
      }
      .kh-pill-label {
        font-size: 13px;
        font-weight: 900;
        letter-spacing: 1.2px;
        text-transform: uppercase;
        color: ${primaryColor};
        margin-bottom: 2px;
      }
      .kh-pill-text {
        font-size: 14.5px;
        line-height: 1.3;
        color: ${secondaryColor};
        font-weight: 600;
      }
    `;

    const html = `
      <div class="editorial-flow-zone">
        <div class="kh-header-row">
          <span class="kh-kicker-badge">${esc(copy.kicker || 'SOROTAN UTAMA')}</span>
          <span class="kh-starburst-year">${esc(primaryStat?.value || yearShort)}</span>
        </div>
        ${lead ? `<div class="kh-script-lead">${esc(lead)}</div>` : ''}
        <div class="kh-giant-main">${esc(lead ? main : headlineText)}</div>
        ${copy.deck ? `<div class="kh-manifesto-quote">&ldquo;${esc(copy.deck)}&rdquo;</div>` : ''}
        ${pillsHtml ? `<div class="kh-pills-grid">${pillsHtml}</div>` : ''}
      </div>
    `;
    return { html, css };
  }

  // ===========================================================================
  // 2. HIGHLIGHT ZINE COLLAGE (The Substance / Progress Shouldn't Dry Us Out Style)
  // ===========================================================================
  if (family === 'HIGHLIGHT_ZINE') {
    const words = headlineText.split(/\s+/).filter(Boolean);
    const highlightedHeadlineHtml = words
      .map((w, i) => {
        const isHighlighted = i % 2 === (variant % 2);
        const tilt = i % 2 === 0 ? '-1.4deg' : '1.2deg';
        return isHighlighted
          ? `<span class="hz-word-strip" style="transform: rotate(${tilt});">${esc(w)}</span>`
          : `<span class="hz-word-plain">${esc(w)}</span>`;
      })
      .join(' ');

    const zineCardsHtml = points
      .map(
        (p: ChromiumPosterPoint, idx: number) => `
        <div class="hz-callout-card" style="transform: rotate(${idx % 2 === 0 ? '-0.6deg' : '0.7deg'});">
          <div class="hz-card-tag">${esc(p.label)}</div>
          <div class="hz-card-text">${esc(p.text)}</div>
        </div>`
      )
      .join('');

    const css = `
      .editorial-flow-zone {
        position: absolute;
        top: ${flowTop}px;
        left: ${flowLeft}px;
        width: ${safeFlowWidth}px;
        max-height: ${flowMaxHeight}px;
        display: flex;
        flex-direction: column;
        box-sizing: border-box;
      }
      .hz-kicker-tape {
        align-self: flex-start;
        background: #0F172A;
        color: #FFFFFF;
        font-size: 13px;
        font-weight: 900;
        letter-spacing: 2.2px;
        padding: 4px 12px;
        text-transform: uppercase;
        margin-bottom: 10px;
        transform: rotate(-1deg);
      }
      .hz-headline-wrap {
        display: flex;
        flex-wrap: wrap;
        gap: 8px 10px;
        align-items: baseline;
        margin-bottom: 16px;
      }
      .hz-word-strip {
        display: inline-block;
        font-family: 'Anton', 'Bebas Neue', sans-serif;
        font-size: ${Math.min(86, Math.round(titleFontSize * 0.98))}px;
        line-height: 0.96;
        background: ${accentColor};
        color: ${inverseTextOnAccent};
        padding: 4px 14px;
        box-shadow: 4px 4px 0px rgba(15, 23, 42, 0.85);
      }
      .hz-word-plain {
        display: inline-block;
        font-family: 'Anton', 'Bebas Neue', sans-serif;
        font-size: ${Math.min(86, Math.round(titleFontSize * 0.98))}px;
        line-height: 0.96;
        color: ${primaryColor};
        text-shadow: ${textShadow};
      }
      .hz-deck-sticker {
        background: ${isLightPaper ? '#FEF08A' : 'rgba(254, 240, 138, 0.95)'};
        color: #0F172A;
        font-size: 18px;
        font-weight: 800;
        line-height: 1.32;
        padding: 10px 16px;
        border: 2px solid #0F172A;
        box-shadow: 5px 5px 0px #0F172A;
        margin-bottom: 16px;
        max-width: 92%;
      }
      .hz-cards-row {
        display: grid;
        grid-template-columns: repeat(${Math.max(1, Math.min(3, points.length))}, 1fr);
        gap: 12px;
      }
      .hz-callout-card {
        background: ${cardSurfaceBg};
        border: 2px solid #0F172A;
        box-shadow: 4px 4px 0px ${accentColor};
        padding: 10px 12px;
      }
      .hz-card-tag {
        display: inline-block;
        background: ${accentColor};
        color: #FFFFFF;
        font-size: 12px;
        font-weight: 900;
        letter-spacing: 1px;
        padding: 2px 8px;
        text-transform: uppercase;
        margin-bottom: 6px;
      }
      .hz-card-text {
        font-size: 14.5px;
        line-height: 1.32;
        color: ${primaryColor};
        font-weight: 700;
      }
    `;

    const html = `
      <div class="editorial-flow-zone">
        <div class="hz-kicker-tape">✦ ${esc(copy.kicker || 'CATATAN LAPANGAN')}</div>
        <div class="hz-headline-wrap">${highlightedHeadlineHtml}</div>
        ${copy.deck ? `<div class="hz-deck-sticker">${esc(copy.deck)}</div>` : ''}
        ${zineCardsHtml ? `<div class="hz-cards-row">${zineCardsHtml}</div>` : ''}
      </div>
    `;
    return { html, css };
  }

  // ===========================================================================
  // 3. RISOGRAPH STREET GRID (Oke Gas / False Memory / Poster PKL Style)
  // ===========================================================================
  if (family === 'RISOGRAPH_GRID') {
    const gridItemsHtml = points
      .map(
        (p: ChromiumPosterPoint, idx: number) => `
        <div class="rg-cell ${idx === 0 ? 'rg-cell-accent' : ''}">
          <div class="rg-cell-header">
            <span class="rg-cell-idx">0${idx + 1}</span>
            <span class="rg-cell-title">${esc(p.label)}</span>
          </div>
          <div class="rg-cell-text">${esc(p.text)}</div>
        </div>`
      )
      .join('');

    const css = `
      .editorial-flow-zone {
        position: absolute;
        top: ${flowTop}px;
        left: ${flowLeft}px;
        width: ${safeFlowWidth}px;
        max-height: ${flowMaxHeight}px;
        display: flex;
        flex-direction: column;
        box-sizing: border-box;
      }
      .rg-banner-box {
        background: ${accentColor};
        color: #FFFFFF;
        border: 3px solid #09090B;
        padding: 12px 18px;
        margin-bottom: 12px;
        box-shadow: 6px 6px 0px #09090B;
      }
      .rg-kicker-line {
        font-size: 13px;
        font-weight: 900;
        letter-spacing: 3px;
        text-transform: uppercase;
        opacity: 0.92;
        margin-bottom: 4px;
      }
      .rg-headline {
        font-family: 'Anton', 'Bebas Neue', sans-serif;
        font-size: ${Math.min(92, Math.round(titleFontSize * 1.04))}px;
        line-height: 0.92;
        letter-spacing: 1.5px;
        text-transform: uppercase;
        color: #FFFFFF;
      }
      .rg-sub-bar {
        background: #09090B;
        color: #FAFAFA;
        font-size: 16.5px;
        font-weight: 700;
        line-height: 1.34;
        padding: 10px 16px;
        margin-bottom: 12px;
        border-left: 6px solid ${accentColor};
      }
      .rg-grid {
        display: grid;
        grid-template-columns: repeat(${Math.max(1, Math.min(3, points.length))}, 1fr);
        gap: 10px;
      }
      .rg-cell {
        background: ${cardSurfaceBg};
        border: 2.5px solid #09090B;
        padding: 10px 12px;
      }
      .rg-cell-accent {
        background: ${accentColor};
        color: #FFFFFF;
      }
      .rg-cell-header {
        display: flex;
        align-items: center;
        gap: 6px;
        margin-bottom: 4px;
        border-bottom: 1.5px solid currentColor;
        padding-bottom: 4px;
      }
      .rg-cell-idx {
        font-family: 'Bebas Neue', sans-serif;
        font-size: 22px;
        font-weight: 900;
      }
      .rg-cell-title {
        font-size: 13px;
        font-weight: 900;
        text-transform: uppercase;
        letter-spacing: 1px;
      }
      .rg-cell-text {
        font-size: 14px;
        line-height: 1.3;
        font-weight: 600;
      }
    `;

    const html = `
      <div class="editorial-flow-zone">
        <div class="rg-banner-box">
          <div class="rg-kicker-line">${esc(copy.kicker || 'LAPORAN INVESTIGASI & AKSI')}</div>
          <div class="rg-headline">${esc(headlineText)}</div>
        </div>
        ${copy.deck ? `<div class="rg-sub-bar">${esc(copy.deck)}</div>` : ''}
        ${gridItemsHtml ? `<div class="rg-grid">${gridItemsHtml}</div>` : ''}
      </div>
    `;
    return { html, css };
  }

  // ===========================================================================
  // 4. MINIMAL MANIFESTO & SWISS SHADOW (A Better Tomorrow / 365 Work More Style)
  // ===========================================================================
  if (family === 'MINIMAL_MANIFESTO') {
    const watermarkText = primaryStat?.value || yearShort;
    const swissColsHtml = points
      .map(
        (p: ChromiumPosterPoint, idx: number) => `
        <div class="mm-col">
          <div class="mm-col-num">0${idx + 1} / ${esc(p.label)}</div>
          <div class="mm-col-text">${esc(p.text)}</div>
        </div>`
      )
      .join('');

    const css = `
      .editorial-flow-zone {
        position: absolute;
        top: ${flowTop}px;
        left: ${flowLeft}px;
        width: ${safeFlowWidth}px;
        max-height: ${flowMaxHeight}px;
        display: flex;
        flex-direction: column;
        box-sizing: border-box;
      }
      .mm-watermark {
        position: absolute;
        top: -28px;
        right: 0;
        font-family: 'Anton', 'Bebas Neue', sans-serif;
        font-size: 165px;
        line-height: 0.8;
        color: ${accentColor};
        opacity: 0.16;
        pointer-events: none;
        z-index: 0;
      }
      .mm-kicker {
        font-size: 13px;
        font-weight: 900;
        letter-spacing: 3.5px;
        text-transform: uppercase;
        color: ${accentColor};
        margin-bottom: 10px;
        z-index: 1;
      }
      .mm-headline {
        font-family: 'Plus Jakarta Sans', sans-serif;
        font-weight: 900;
        font-size: ${Math.min(78, Math.round(titleFontSize * 0.92))}px;
        line-height: 0.98;
        letter-spacing: -1.5px;
        color: ${primaryColor};
        margin-bottom: 14px;
        text-shadow: ${textShadow};
        z-index: 1;
      }
      .mm-headline-accent {
        color: ${accentColor};
      }
      .mm-deck {
        font-size: 20px;
        font-weight: 600;
        line-height: 1.38;
        color: ${secondaryColor};
        max-width: 86%;
        margin-bottom: 18px;
        text-shadow: ${textShadow};
        z-index: 1;
      }
      .mm-hairline-grid {
        display: grid;
        grid-template-columns: repeat(${Math.max(1, Math.min(3, points.length))}, 1fr);
        gap: 16px;
        border-top: 2px solid ${accentColor};
        padding-top: 12px;
        background: ${cardSurfaceBg};
        padding: 12px 16px;
        border-radius: 6px;
        z-index: 1;
      }
      .mm-col-num {
        font-size: 12px;
        font-weight: 900;
        letter-spacing: 1.5px;
        text-transform: uppercase;
        color: ${accentColor};
        margin-bottom: 4px;
      }
      .mm-col-text {
        font-size: 14.5px;
        line-height: 1.34;
        color: ${primaryColor};
        font-weight: 600;
      }
    `;

    const html = `
      <div class="editorial-flow-zone">
        <div class="mm-watermark">${esc(watermarkText)}</div>
        <div class="mm-kicker">${esc(copy.kicker || 'MANIFESTO KEBIJAKAN')}</div>
        <div class="mm-headline">
          ${lead ? `${esc(lead)} <span class="mm-headline-accent">${esc(main)}</span>` : esc(headlineText)}
        </div>
        ${copy.deck ? `<div class="mm-deck">${esc(copy.deck)}</div>` : ''}
        ${swissColsHtml ? `<div class="mm-hairline-grid">${swissColsHtml}</div>` : ''}
      </div>
    `;
    return { html, css };
  }

  // ===========================================================================
  // 5. EDITORIAL MAGAZINE COVER (Silence Holds Shape / Broken / Jazz Style)
  // ===========================================================================
  if (family === 'MAGAZINE_COVER') {
    const magPillsHtml = points
      .slice(0, 3)
      .map(
        (p: ChromiumPosterPoint) => `
        <div class="mc-feature-item">
          <div class="mc-feature-label">✦ ${esc(p.label)}</div>
          <div class="mc-feature-text">${esc(p.text)}</div>
        </div>`
      )
      .join('');

    const css = `
      .editorial-flow-zone {
        position: absolute;
        top: ${flowTop}px;
        left: ${flowLeft}px;
        width: ${safeFlowWidth}px;
        max-height: ${flowMaxHeight}px;
        display: flex;
        flex-direction: column;
        align-items: center;
        text-align: center;
        box-sizing: border-box;
      }
      .mc-rubric {
        font-size: 13px;
        font-weight: 800;
        letter-spacing: 4px;
        text-transform: uppercase;
        color: ${accentColor};
        border-bottom: 1.5px solid ${accentColor};
        padding-bottom: 4px;
        margin-bottom: 10px;
      }
      .mc-title {
        font-family: 'Playfair Display', Georgia, serif;
        font-weight: 900;
        font-size: ${Math.min(96, Math.round(titleFontSize * 1.08))}px;
        line-height: 0.92;
        letter-spacing: -0.5px;
        color: ${primaryColor};
        text-transform: uppercase;
        margin-bottom: 14px;
        text-shadow: ${textShadow};
      }
      .mc-quote-box {
        font-family: 'Playfair Display', Georgia, serif;
        font-style: italic;
        font-size: 21px;
        line-height: 1.36;
        color: ${primaryColor};
        background: ${cardSurfaceBg};
        border-top: 2px solid ${accentColor};
        border-bottom: 2px solid ${accentColor};
        padding: 10px 22px;
        max-width: 90%;
        margin-bottom: 16px;
      }
      .mc-features-row {
        display: grid;
        grid-template-columns: repeat(${Math.max(1, Math.min(3, points.length))}, 1fr);
        gap: 12px;
        width: 100%;
        text-align: left;
      }
      .mc-feature-item {
        background: ${cardSurfaceBg};
        border-left: 3px solid ${accentColor};
        padding: 8px 12px;
        border-radius: 4px;
      }
      .mc-feature-label {
        font-size: 12.5px;
        font-weight: 900;
        letter-spacing: 1.2px;
        color: ${accentColor};
        text-transform: uppercase;
        margin-bottom: 3px;
      }
      .mc-feature-text {
        font-size: 14px;
        line-height: 1.3;
        color: ${primaryColor};
        font-weight: 600;
      }
    `;

    const html = `
      <div class="editorial-flow-zone">
        <div class="mc-rubric">${esc(copy.kicker || 'EDISI KHUSUS • PROFIL & GAGASAN')}</div>
        <div class="mc-title">${esc(headlineText)}</div>
        ${copy.deck ? `<div class="mc-quote-box">&ldquo;${esc(copy.deck)}&rdquo;</div>` : ''}
        ${magPillsHtml ? `<div class="mc-features-row">${magPillsHtml}</div>` : ''}
      </div>
    `;
    return { html, css };
  }

  // ===========================================================================
  // 6. VINTAGE CHRONICLE & RETRO FRAME (Gazette / Polaroid / Broadsheet Style)
  // ===========================================================================
  const vintageTicketsHtml = points
    .map(
      (p: ChromiumPosterPoint, idx: number) => `
      <div class="vc-ticket">
        <div class="vc-ticket-badge">BAGIAN 0${idx + 1}</div>
        <div class="vc-ticket-label">${esc(p.label)}</div>
        <div class="vc-ticket-text">${esc(p.text)}</div>
      </div>`
    )
    .join('');

  const css = `
    .editorial-flow-zone {
      position: absolute;
      top: ${flowTop}px;
      left: ${flowLeft}px;
      width: ${safeFlowWidth}px;
      max-height: ${flowMaxHeight}px;
      display: flex;
      flex-direction: column;
      box-sizing: border-box;
      background: ${cardSurfaceBg};
      border: 2px solid ${primaryColor};
      outline: 1px solid ${accentColor};
      outline-offset: -6px;
      padding: 18px 22px;
    }
    .vc-ribbon-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 2px double ${primaryColor};
      padding-bottom: 6px;
      margin-bottom: 10px;
    }
    .vc-kicker {
      font-size: 13px;
      font-weight: 900;
      letter-spacing: 2.5px;
      color: ${accentColor};
      text-transform: uppercase;
    }
    .vc-stat-stamp {
      font-family: 'Bebas Neue', sans-serif;
      font-size: 20px;
      background: ${accentColor};
      color: #FFFFFF;
      padding: 2px 10px;
      letter-spacing: 1px;
    }
    .vc-headline {
      font-family: 'Bebas Neue', 'Anton', sans-serif;
      font-size: ${Math.min(88, Math.round(titleFontSize * 0.98))}px;
      line-height: 0.92;
      color: ${primaryColor};
      letter-spacing: 1.5px;
      margin-bottom: 10px;
      text-transform: uppercase;
    }
    .vc-deck {
      font-family: 'Playfair Display', Georgia, serif;
      font-style: italic;
      font-size: 19px;
      line-height: 1.35;
      color: ${secondaryColor};
      margin-bottom: 14px;
    }
    .vc-tickets-grid {
      display: grid;
      grid-template-columns: repeat(${Math.max(1, Math.min(3, points.length))}, 1fr);
      gap: 12px;
      border-top: 1px solid ${cardBorderColor};
      padding-top: 12px;
    }
    .vc-ticket {
      display: flex;
      flex-direction: column;
    }
    .vc-ticket-badge {
      font-size: 11px;
      font-weight: 900;
      letter-spacing: 1.5px;
      color: ${accentColor};
      margin-bottom: 2px;
    }
    .vc-ticket-label {
      font-size: 14px;
      font-weight: 900;
      color: ${primaryColor};
      text-transform: uppercase;
      margin-bottom: 3px;
    }
    .vc-ticket-text {
      font-size: 14px;
      line-height: 1.32;
      color: ${secondaryColor};
      font-weight: 600;
    }
  `;

  const html = `
    <div class="editorial-flow-zone">
      <div class="vc-ribbon-row">
        <span class="vc-kicker">${esc(copy.kicker || 'ARSIP & SOROTAN PUBLIK')}</span>
        ${primaryStat ? `<span class="vc-stat-stamp">${esc(primaryStat.value)} • ${esc(primaryStat.label)}</span>` : `<span class="vc-stat-stamp">EDISI ${currentYear}</span>`}
      </div>
      <div class="vc-headline">${esc(headlineText)}</div>
      ${copy.deck ? `<div class="vc-deck">${esc(copy.deck)}</div>` : ''}
      ${vintageTicketsHtml ? `<div class="vc-tickets-grid">${vintageTicketsHtml}</div>` : ''}
    </div>
  `;
  return { html, css };
}
