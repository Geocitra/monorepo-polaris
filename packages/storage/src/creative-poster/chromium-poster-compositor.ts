import sharp from 'sharp';
import { BrowserSingleton } from './browser-singleton.js';

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
  textToneHint?: 'LIGHT' | 'DARK';
  archetype?: string;
}

export interface ChromiumPosterComposeResult {
  buffer: Buffer;
  sizeBytes: number;
  detectedLuminance: number;
  blendModeUsed: 'multiply' | 'normal';
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
      textToneHint,
    } = params;

    // 1. Deteksi Luminansi Rata-rata Kanvas menggunakan Sharp
    const stats = await sharp(canvasBuffer).stats();
    const [r, g, b] = stats.channels.map((c) => c.mean);
    const luminance = 0.299 * r + 0.587 * g + 0.114 * b;

    const isLightPaper = textToneHint
      ? textToneHint === 'DARK'
      : luminance > 135;

    const blendModeUsed: 'multiply' | 'normal' = isLightPaper ? 'multiply' : 'normal';

    const primaryColor = isLightPaper ? '#111827' : '#FFFFFF';
    const accentColor = palette.accentHex || (isLightPaper ? '#DC2626' : '#FBBF24');
    const secondaryColor = palette.secondaryHex || (isLightPaper ? '#4B5563' : '#E2E8F0');
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

    const bdTop = Math.round(bd.y * 1350);
    const bdLeft = Math.round(bd.x * 1080);
    const bdWidth = Math.round(bd.w * 1080);

    const ftTop = Math.round(ft.y * 1350);
    const ftLeft = Math.round(ft.x * 1080);
    const ftWidth = Math.round(ft.w * 1080);

    // Dynamic Font Sizing berdasarkan panjang judul
    const headlineText = (copy.headline || 'ADVOKASI PUBLIK').toUpperCase();
    const titleFontSize = headlineText.length > 28 ? 64 : headlineText.length > 18 ? 78 : 92;

    const bgBase64 = `data:image/webp;base64,${canvasBuffer.toString('base64')}`;

    // Bangun poin-poin HTML dinamis
    const pointsHtml = (copy.points || [])
      .map(
        (p: ChromiumPosterPoint) => `
        <div style="margin-bottom: 14px; display: flex; flex-direction: column;">
          <div style="font-size: 15px; font-weight: 800; color: ${accentColor}; letter-spacing: 1.5px; text-transform: uppercase; margin-bottom: 2px;">
            ✦ ${p.label}
          </div>
          <div style="font-size: 18px; line-height: 1.35; color: ${secondaryColor}; font-weight: 500;">
            ${p.text}
          </div>
        </div>
      `
      )
      .join('');

    const html = `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="utf-8">
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Anton&family=Bebas+Neue&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Playfair+Display:ital,wght@0,600;0,700;1,500&display=swap');

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
      font-size: 14px;
      font-weight: 800;
      letter-spacing: 2.5px;
      color: ${accentColor};
      border-bottom: 2px solid ${accentColor}44;
      padding-bottom: 8px;
      text-transform: uppercase;
      text-shadow: ${textShadow};
    }

    /* Headline Area */
    .headline-zone {
      position: absolute;
      top: ${hlTop}px;
      left: ${hlLeft}px;
      width: ${hlWidth}px;
      display: flex;
      flex-direction: column;
      text-shadow: ${textShadow};
    }

    .kicker {
      font-size: 16px;
      font-weight: 800;
      color: ${accentColor};
      letter-spacing: 3px;
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
    }

    .deck {
      font-family: 'Playfair Display', serif;
      font-size: 22px;
      line-height: 1.35;
      color: ${secondaryColor};
      font-style: italic;
      font-weight: 500;
      max-width: 95%;
    }

    /* Body Editorial Zone */
    .body-zone {
      position: absolute;
      top: ${bdTop}px;
      left: ${bdLeft}px;
      width: ${bdWidth}px;
      display: flex;
      flex-direction: column;
      text-shadow: ${textShadow};
    }

    .closing-line {
      font-size: 17px;
      font-weight: 700;
      color: ${accentColor};
      margin-top: 6px;
      border-left: 3px solid ${accentColor};
      padding-left: 12px;
      line-height: 1.3;
    }

    /* Footer Zone */
    .footer-zone {
      position: absolute;
      top: ${ftTop}px;
      left: ${ftLeft}px;
      width: ${ftWidth}px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      border-top: 1.5px solid ${primaryColor}33;
      padding-top: 12px;
      text-shadow: ${textShadow};
    }

    .signature-title {
      font-family: 'Bebas Neue', sans-serif;
      font-size: 24px;
      letter-spacing: 2px;
      color: ${primaryColor};
    }

    .official-badge {
      font-size: 12px;
      font-weight: 800;
      color: ${accentColor};
      letter-spacing: 2px;
      text-transform: uppercase;
    }
  </style>
</head>
<body>
  <div class="ink-layer">
    <div class="edition-tag">
      <span>${editionTag}</span>
      <span>DOKUMEN ADVOKASI PUBLIK // PARLEMEN</span>
    </div>

    <div class="headline-zone">
      <div class="kicker">${copy.kicker || 'PROGRAM KERJA LEGISLATIF'}</div>
      <div class="headline">${headlineText}</div>
      ${copy.deck ? `<div class="deck">${copy.deck}</div>` : ''}
    </div>

    <div class="body-zone">
      ${pointsHtml}
      ${copy.closingLine ? `<div class="closing-line">${copy.closingLine}</div>` : ''}
    </div>

    <div class="footer-zone">
      <div class="signature-title">${signature}</div>
      <div class="official-badge">OFFICIAL ADVOCACY // 2026</div>
    </div>
  </div>
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
