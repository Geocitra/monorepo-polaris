import sharp from 'sharp';
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
      headerTag,
      textToneHint,
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

    const blendModeUsed: 'multiply' | 'normal' = isLightPaper ? 'multiply' : 'normal';

    const primaryColor = isLightPaper ? '#111827' : '#FFFFFF';
    const accentColor = safeHex(palette.accentHex, isLightPaper ? '#DC2626' : '#FBBF24');
    const secondaryColor = safeHex(palette.secondaryHex, isLightPaper ? '#4B5563' : '#E2E8F0');
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
    const flowLeft = Math.max(40, Math.min(hlLeft, bdLeft));
    const flowTop = hlTop;
    const rawFlowWidth = Math.round(Math.max(hlWidth, bdWidth));
    const safeFlowWidth = Math.min(rawFlowWidth, 1040 - flowLeft);
    const flowMaxHeight = Math.max(250, ftTop - flowTop - 20);

    // Dynamic Font Sizing berdasarkan panjang judul
    const headlineText = (copy.headline || 'ADVOKASI PUBLIK').toUpperCase();
    const titleFontSize = headlineText.length > 28 ? 64 : headlineText.length > 18 ? 76 : 90;

    const bgMime =
      meta.format === 'png' ? 'image/png' : meta.format === 'jpeg' ? 'image/jpeg' : 'image/webp';
    const bgBase64 = `data:${bgMime};base64,${canvasBuffer.toString('base64')}`;
    const fontFaceCss = await ChromiumFontFace.getCss();

    // Bangun poin-poin HTML dinamis (semua teks di-escape)
    const pointsHtml = (copy.points || [])
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
      font-size: 14px;
      font-weight: 800;
      letter-spacing: 2.5px;
      color: ${accentColor};
      border-bottom: 2px solid ${accentColor}44;
      padding-bottom: 8px;
      text-transform: uppercase;
      text-shadow: ${textShadow};
    }

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
      font-size: 16px;
      font-weight: 700;
      color: ${accentColor};
      margin-top: 4px;
      border-left: 3px solid ${accentColor};
      padding-left: 12px;
      line-height: 1.35;
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
      <span>${esc(editionTag)}</span>
      <span>${esc(headerTag || 'DOKUMEN ADVOKASI PUBLIK')}</span>
    </div>

    <div class="editorial-flow-zone">
      <div class="kicker">${esc(copy.kicker || 'TELAAH KEBIJAKAN')}</div>
      <div class="headline">${esc(headlineText)}</div>
      ${copy.deck ? `<div class="deck">${esc(copy.deck)}</div>` : ''}
      <div class="points-container">
        ${pointsHtml}
      </div>
      ${copy.closingLine ? `<div class="closing-line">${esc(copy.closingLine)}</div>` : ''}
    </div>

    <div class="footer-zone">
      <div class="signature-title">${esc(signature)}</div>
      <div class="official-badge">OFFICIAL ADVOCACY // 2026</div>
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
