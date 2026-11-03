/**
 * Poster Layer Manifest
 *
 * Saat poster dirender oleh Chromium, setiap elemen visual (kotak kartu, badge, judul,
 * paragraf, tag, garis pemisah) diekstrak LANGSUNG dari DOM beserta posisi, tipografi,
 * dan warnanya. Manifest ini disimpan bersama aset poster sehingga fitur Magic Layers
 * di Studio dapat membangun ulang poster sebagai komponen yang bisa diedit satu per satu
 * (gaya Canva) secara 1:1 — tanpa menebak posisi atau OCR.
 *
 * Koordinat dalam piksel ruang render (viewport `width` x `height`).
 */

export interface PosterLayerBorderSide {
  w: number;
  color: string;
}

export interface PosterLayerBorders {
  top: PosterLayerBorderSide | null;
  right: PosterLayerBorderSide | null;
  bottom: PosterLayerBorderSide | null;
  left: PosterLayerBorderSide | null;
}

export interface PosterLayerShadow {
  color: string;
  offsetX: number;
  offsetY: number;
  blur: number;
}

export interface PosterLayerBox {
  fill: string | null;
  radius: number;
  borders: PosterLayerBorders;
  shadow: PosterLayerShadow | null;
}

export interface PosterFrameLayer extends PosterLayerBox {
  kind: 'frame';
  id: string;
  role: string;
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface PosterTextLayer {
  kind: 'text';
  id: string;
  role: string;
  text: string;
  /** Kotak konten teks (tanpa padding). */
  x: number;
  y: number;
  w: number;
  h: number;
  fontFamily: string;
  fontSize: number;
  fontWeight: string;
  fontStyle: string;
  color: string;
  textAlign: 'left' | 'center' | 'right' | 'justify';
  lineHeightPx: number;
  letterSpacingPx: number;
  /** Latar milik teks itu sendiri (mis. badge/pill) — digambar mengikuti padding CSS. */
  box: (PosterLayerBox & { padding: { t: number; r: number; b: number; l: number } }) | null;
}

export type PosterLayer = PosterFrameLayer | PosterTextLayer;

export interface PosterLayerManifest {
  version: 1;
  width: number;
  height: number;
  layers: PosterLayer[];
}

/**
 * Script yang dievaluasi di dalam halaman Chromium (string agar tidak membutuhkan lib DOM
 * pada tsconfig Node). Mengembalikan PosterLayerManifest.
 */
export const POSTER_LAYER_EXTRACTOR_SCRIPT = String.raw`(() => {
  const VW = window.innerWidth;
  const VH = window.innerHeight;
  const root = document.querySelector('.ink-layer') || document.body;
  const layers = [];
  let seq = 0;

  const parseColor = (c) => {
    const m = /rgba?\(([^)]+)\)/.exec(c || '');
    if (!m) return null;
    const p = m[1].split(',').map((s) => parseFloat(s));
    return { a: p.length > 3 ? p[3] : 1 };
  };
  const isVisibleColor = (c) => {
    const p = parseColor(c);
    return !!p && p.a > 0.02;
  };
  const r1 = (n) => Math.round(n * 10) / 10;
  const roleOf = (el) => {
    const cls = typeof el.className === 'string' ? el.className.trim().split(/\s+/)[0] : '';
    return cls || el.tagName.toLowerCase();
  };
  const parseShadow = (s) => {
    if (!s || s === 'none') return null;
    const first = s.split(/,(?![^(]*\))/)[0];
    const colorM = /rgba?\([^)]*\)|#[0-9a-fA-F]{3,8}/.exec(first);
    const nums = first.replace(/rgba?\([^)]*\)|#[0-9a-fA-F]{3,8}/, '').match(/-?\d*\.?\d+px/g) || [];
    const v = nums.map((n) => parseFloat(n));
    return {
      color: colorM ? colorM[0] : 'rgba(0,0,0,0.1)',
      offsetX: v[0] || 0,
      offsetY: v[1] || 0,
      blur: v[2] || 0,
    };
  };
  const readBox = (cs, scale) => {
    const sides = ['Top', 'Right', 'Bottom', 'Left'].map((s) => {
      const w = parseFloat(cs['border' + s + 'Width']) || 0;
      const style = cs['border' + s + 'Style'];
      const color = cs['border' + s + 'Color'];
      return w > 0 && style !== 'none' && style !== 'hidden' && isVisibleColor(color)
        ? { w: r1(w * scale), color }
        : null;
    });
    const fill = isVisibleColor(cs.backgroundColor) ? cs.backgroundColor : null;
    return {
      fill,
      radius: r1((parseFloat(cs.borderTopLeftRadius) || 0) * scale),
      borders: { top: sides[0], right: sides[1], bottom: sides[2], left: sides[3] },
      shadow: parseShadow(cs.boxShadow),
      has: !!fill || sides.some(Boolean),
    };
  };

  const pushPseudo = (el, rect, which) => {
    const ps = getComputedStyle(el, which);
    if (!ps || ps.content === 'none' || ps.display === 'none') return;
    if (ps.position !== 'absolute' || !isVisibleColor(ps.backgroundColor)) return;
    const left = parseFloat(ps.left);
    const top = parseFloat(ps.top);
    const right = parseFloat(ps.right);
    let w = parseFloat(ps.width);
    const h = parseFloat(ps.height);
    if (!isFinite(left) || !isFinite(top) || !isFinite(h)) return;
    if (!isFinite(w)) w = isFinite(right) ? rect.width - left - right : NaN;
    if (!isFinite(w) || w <= 0 || h <= 0) return;
    layers.push({
      kind: 'frame', id: 'f' + seq++, role: roleOf(el) + which,
      x: r1(rect.left + left), y: r1(rect.top + top), w: r1(w), h: r1(h),
      fill: ps.backgroundColor, radius: r1(parseFloat(ps.borderTopLeftRadius) || 0),
      borders: { top: null, right: null, bottom: null, left: null }, shadow: null,
    });
  };

  const walk = (el) => {
    const cs = getComputedStyle(el);
    if (cs.display === 'none' || cs.visibility === 'hidden' || parseFloat(cs.opacity) === 0) return;
    const rect = el.getBoundingClientRect();
    const scale = el.offsetWidth ? rect.width / el.offsetWidth : 1;
    const box = readBox(cs, scale);
    const hasOwnText = Array.from(el.childNodes).some(
      (n) => n.nodeType === 3 && (n.textContent || '').trim().length > 0
    );

    if (hasOwnText && rect.width > 0 && rect.height > 0) {
      const text = (el.innerText || el.textContent || '').trim();
      if (text) {
        const pad = {
          t: (parseFloat(cs.paddingTop) + (parseFloat(cs.borderTopWidth) || 0)) * scale,
          r: (parseFloat(cs.paddingRight) + (parseFloat(cs.borderRightWidth) || 0)) * scale,
          b: (parseFloat(cs.paddingBottom) + (parseFloat(cs.borderBottomWidth) || 0)) * scale,
          l: (parseFloat(cs.paddingLeft) + (parseFloat(cs.borderLeftWidth) || 0)) * scale,
        };
        const fontSize = parseFloat(cs.fontSize) * scale;
        const lh = cs.lineHeight === 'normal' ? fontSize * 1.2 : parseFloat(cs.lineHeight) * scale;
        const ls = cs.letterSpacing === 'normal' ? 0 : (parseFloat(cs.letterSpacing) || 0) * scale;
        const align = cs.textAlign === 'center' ? 'center'
          : (cs.textAlign === 'right' || cs.textAlign === 'end') ? 'right'
          : cs.textAlign === 'justify' ? 'justify' : 'left';
        layers.push({
          kind: 'text', id: 't' + seq++, role: roleOf(el), text,
          x: r1(rect.left + pad.l), y: r1(rect.top + pad.t),
          w: r1(Math.max(1, rect.width - pad.l - pad.r)), h: r1(Math.max(1, rect.height - pad.t - pad.b)),
          fontFamily: cs.fontFamily, fontSize: r1(fontSize), fontWeight: String(cs.fontWeight),
          fontStyle: cs.fontStyle, color: cs.color, textAlign: align,
          lineHeightPx: r1(lh), letterSpacingPx: r1(ls),
          box: box.has
            ? { fill: box.fill, radius: box.radius, borders: box.borders, shadow: box.shadow,
                padding: { t: r1(pad.t), r: r1(pad.r), b: r1(pad.b), l: r1(pad.l) } }
            : null,
        });
        return; // anak inline sudah termasuk dalam innerText
      }
    }

    if (el !== root && box.has && rect.width > 0 && rect.height > 0) {
      layers.push({
        kind: 'frame', id: 'f' + seq++, role: roleOf(el),
        x: r1(rect.left), y: r1(rect.top), w: r1(rect.width), h: r1(rect.height),
        fill: box.fill, radius: box.radius, borders: box.borders, shadow: box.shadow,
      });
    }
    pushPseudo(el, rect, '::before');

    for (const child of Array.from(el.children)) walk(child);

    pushPseudo(el, rect, '::after');
  };

  walk(root);
  return { version: 1, width: VW, height: VH, layers };
})()`;

