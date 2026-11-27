/**
 * Poster Layer Builder (Magic Layers — Canva-style)
 *
 * Membangun ulang poster menjadi komponen Fabric.js yang bisa diedit satu per satu
 * berdasarkan Layer Manifest yang diekstrak dari DOM Chromium saat poster dirender:
 * - Kotak kartu / panel / garis pemisah  -> Rect (bisa digeser, diubah warna)
 * - Badge, judul, paragraf, tag, label    -> Textbox (bisa diedit langsung di kanvas)
 *
 * Karena posisi, tipografi, dan warna berasal dari render asli, hasilnya 1:1 dengan poster.
 */
import {
  Circle,
  FabricImage,
  Line,
  Rect,
  Textbox,
  Triangle,
  loadSVGFromString,
  util,
  type Canvas as FabricCanvas,
  type FabricObject,
} from 'fabric';
import type {
  PosterLayerBorderSide as MlBorderSide,
  PosterLayerBorders as MlBorders,
  PosterLayerShadow as MlShadow,
  PosterLayerBox as MlBox,
  PosterFrameLayer as MlFrameLayer,
  PosterTextLayer as MlTextLayer,
  PosterImageLayer as MlImageLayer,
  PosterShapeLayer as MlShapeLayer,
  PosterLayer as MlLayer,
  PosterLayerManifest,
} from '@polaris/shared-types';
import { ApiClient } from '@/lib/api-client';

export type {
  MlBorderSide,
  MlBorders,
  MlShadow,
  MlBox,
  MlFrameLayer,
  MlTextLayer,
  MlImageLayer,
  MlShapeLayer,
  MlLayer,
  PosterLayerManifest,
};

export interface MlPadding {
  t: number;
  r: number;
  b: number;
  l: number;
}

/** Gaya dekorasi yang disimpan di customData agar bisa dipulihkan setelah loadFromJSON. */
interface MlRenderStyle {
  kind: 'frame' | 'text';
  box: MlBox | null;
  padding?: MlPadding;
}

/** Konstanta tinggi glyph Fabric (Text._fontSizeMult). */
const FABRIC_FONT_SIZE_MULT = 1.13;

const CANVA_CONTROLS = {
  cornerColor: '#FFFFFF',
  cornerStrokeColor: '#7D2AE8',
  borderColor: '#7D2AE8',
  cornerSize: 9,
  cornerStyle: 'circle' as const,
  transparentCorners: false,
  borderScaleFactor: 2,
};

// ─── Util warna ───
function cssColorToHex(color: string): string {
  const m = /rgba?\(([^)]+)\)/.exec(color || '');
  if (!m) return color;
  const p = m[1].split(',').map((s) => parseFloat(s));
  if (p.length > 3 && p[3] < 1) return color;
  const hex = (n: number) => Math.max(0, Math.min(255, Math.round(n))).toString(16).padStart(2, '0');
  return `#${hex(p[0])}${hex(p[1])}${hex(p[2])}`.toUpperCase();
}

function isPaintable(color: unknown): color is string {
  if (typeof color !== 'string' || !color || color === 'transparent') return false;
  const m = /rgba\(([^)]+)\)/.exec(color);
  if (m) {
    const a = parseFloat(m[1].split(',')[3] ?? '1');
    return a > 0.01;
  }
  return true;
}

// ─── Penggambar kotak (fill + border per sisi + shadow) ───
function traceRoundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  const rr = Math.max(0, Math.min(r, w / 2, h / 2));
  ctx.beginPath();
  if (rr > 0 && typeof (ctx as any).roundRect === 'function') {
    (ctx as any).roundRect(x, y, w, h, rr);
  } else {
    ctx.rect(x, y, w, h);
  }
}

function paintBox(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  box: MlBox,
  fillOverride?: unknown
) {
  const isExplicitTransparent = fillOverride === 'transparent';
  const fill = isExplicitTransparent
    ? undefined
    : isPaintable(fillOverride)
      ? fillOverride
      : box.fill;

  if (fill) {
    ctx.save();
    if (box.shadow) {
      ctx.shadowColor = box.shadow.color;
      ctx.shadowBlur = box.shadow.blur;
      ctx.shadowOffsetX = box.shadow.offsetX;
      ctx.shadowOffsetY = box.shadow.offsetY;
    }
    traceRoundRect(ctx, x, y, w, h, box.radius);
    ctx.fillStyle = fill;
    ctx.fill();
    ctx.restore();
  }

  const b = box.borders;
  if (b && (b.top || b.right || b.bottom || b.left)) {
    ctx.save();
    if (
      b.top &&
      b.right &&
      b.bottom &&
      b.left &&
      b.top.w === b.bottom.w &&
      b.top.w === b.left.w &&
      b.top.w === b.right.w &&
      b.top.color === b.bottom.color &&
      b.top.color === b.left.color &&
      b.top.color === b.right.color
    ) {
      ctx.lineWidth = b.top.w;
      ctx.strokeStyle = b.top.color;
      traceRoundRect(ctx, x + b.top.w / 2, y + b.top.w / 2, w - b.top.w, h - b.top.w, Math.max(0, box.radius - b.top.w / 2));
      ctx.stroke();
    } else {
      traceRoundRect(ctx, x, y, w, h, box.radius);
      ctx.clip();
      if (b.top) {
        ctx.fillStyle = b.top.color;
        ctx.fillRect(x, y, w, b.top.w);
      }
      if (b.bottom) {
        ctx.fillStyle = b.bottom.color;
        ctx.fillRect(x, y + h - b.bottom.w, w, b.bottom.w);
      }
      if (b.left) {
        ctx.fillStyle = b.left.color;
        ctx.fillRect(x, y, b.left.w, h);
      }
      if (b.right) {
        ctx.fillStyle = b.right.color;
        ctx.fillRect(x + w - b.right.w, y, b.right.w, h);
      }
    }
    ctx.restore();
  }
}

function scaleBox<T extends MlBox>(box: T, s: number): T {
  const side = (v: MlBorderSide | null) => (v ? { w: Math.max(0.5, v.w * s), color: v.color } : null);
  return {
    ...box,
    radius: box.radius * s,
    borders: {
      top: side(box.borders?.top ?? null),
      right: side(box.borders?.right ?? null),
      bottom: side(box.borders?.bottom ?? null),
      left: side(box.borders?.left ?? null),
    },
    shadow: box.shadow
      ? {
        color: box.shadow.color,
        offsetX: box.shadow.offsetX * s,
        offsetY: box.shadow.offsetY * s,
        blur: box.shadow.blur * s,
      }
      : null,
  };
}

/**
 * Memasang renderer dekorasi pada objek Fabric berdasarkan customData.mlStyle.
 * Dipanggil saat objek dibuat DAN setelah sesi dimuat ulang dari JSON.
 */
export function installMlRenderer(obj: FabricObject): void {
  const style: MlRenderStyle | undefined = (obj as any).customData?.mlStyle;
  if (!style) return;
  (obj as any).objectCaching = false; // shadow & padding badge tidak terpotong cache

  if (style.kind === 'frame' && style.box) {
    const box = style.box;
    (obj as any)._render = function (ctx: CanvasRenderingContext2D) {
      const w = this.width as number;
      const h = this.height as number;
      paintBox(ctx, -w / 2, -h / 2, w, h, box, this.fill);
    };
    return;
  }

  if (style.kind === 'text' && style.box) {
    const box = style.box;
    const pad = style.padding || { t: 0, r: 0, b: 0, l: 0 };
    (obj as any)._renderBackground = function (ctx: CanvasRenderingContext2D) {
      const w = this.width as number;
      const h = this.height as number;
      paintBox(ctx, -w / 2 - pad.l, -h / 2 - pad.t, w + pad.l + pad.r, h + pad.t + pad.b, box, this.backgroundColor);
    };
  }
}

/** Memulihkan renderer dekorasi untuk seluruh objek di kanvas (setelah loadFromJSON). */
export function rehydrateMlObjects(canvas: FabricCanvas): void {
  canvas.getObjects().forEach((o) => installMlRenderer(o));
}

// ─── Penamaan layer yang ramah pengguna ───
const ROLE_LABELS: Array<[RegExp, string]> = [
  [/::(after|before)/, 'Garis Konektor'],
  [/badge/, 'Badge'],
  [/kicker/, 'Kicker'],
  [/headline/, 'Judul Utama'],
  [/deck/, 'Deskripsi'],
  [/stat-val|metric-val|val$/, 'Nilai Statistik'],
  [/stat-lbl|lbl$|label$/, 'Label'],
  [/metric-tag|tag$/, 'Tag'],
  [/name|title/, 'Judul Kartu'],
  [/desc|text|body/, 'Isi Paragraf'],
  [/closing|synth/, 'Kalimat Penutup'],
  [/signature/, 'Identitas Dewan'],
  [/year/, 'Tahun'],
  [/dot|bullet/, 'Titik'],
  [/edition-tag/, 'Bar Atas'],
  [/footer/, 'Kotak Footer'],
  [/header|masthead/, 'Kotak Judul'],
  [/stat|pill/, 'Kotak Statistik'],
  [/col|card|container|grid|box|item/, 'Kotak Kartu'],
];

function labelForRole(role: string, fallback: string): string {
  const r = (role || '').toLowerCase();
  for (const [re, label] of ROLE_LABELS) {
    if (re.test(r)) return label;
  }
  return fallback;
}

// ─── Pemuatan font (wajib sebelum Textbox mengukur lebar teks) ───
const POSTER_FONTS_HREF =
  'https://fonts.googleapis.com/css2?family=Anton&family=Bebas+Neue' +
  '&family=Plus+Jakarta+Sans:ital,wght@0,200..800;1,200..800' +
  '&family=Playfair+Display:ital,wght@0,400..900;1,400..900&display=block';

function primaryFamily(fontFamily: string): string {
  return (fontFamily.split(',')[0] || '').trim().replace(/^["']|["']$/g, '');
}

export async function ensurePosterFontsLoaded(manifest: PosterLayerManifest, timeoutMs = 5000): Promise<void> {
  if (typeof document === 'undefined') return;
  if (!document.querySelector('link[data-polaris-poster-fonts]')) {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = POSTER_FONTS_HREF;
    link.setAttribute('data-polaris-poster-fonts', 'true');
    document.head.appendChild(link);
    await new Promise<void>((resolve) => {
      link.onload = () => resolve();
      link.onerror = () => resolve();
      setTimeout(resolve, timeoutMs);
    });
  }

  const specs = new Set<string>();
  for (const l of manifest.layers) {
    if (l.kind !== 'text') continue;
    const fam = primaryFamily(l.fontFamily);
    if (fam) specs.add(`${l.fontStyle === 'italic' ? 'italic ' : ''}${l.fontWeight || 400} 16px "${fam}"`);
  }

  const loads = Array.from(specs).map((spec) => document.fonts.load(spec).catch(() => []));
  await Promise.race([Promise.all(loads), new Promise((r) => setTimeout(r, timeoutMs))]);
}

// ─── Pengambilan manifest dari aset poster ───
export async function fetchPosterLayerData(
  imageUrl: string,
  publicationId?: string,
  naturalW?: number,
  naturalH?: number,
  forceReExtract?: boolean
): Promise<{ manifest: PosterLayerManifest | null; rawCanvasUrl?: string; detectedArchetype?: string }> {
  // 1. Panggil backend AI Vision OCR Extractor & Manifest Provider
  try {
    const res = await ApiClient.request<{
      success: boolean;
      manifest: PosterLayerManifest | null;
      rawCanvasUrl?: string;
      detectedArchetype?: string;
    }>('/studio/magic-layers/extract-manifest', {
      method: 'POST',
      body: JSON.stringify({
        imageUrl,
        publicationId,
        naturalW,
        naturalH,
        forceReExtract,
      }),
    });

    if (res?.manifest && Array.isArray(res.manifest.layers) && res.manifest.layers.length > 0) {
      return {
        manifest: res.manifest,
        rawCanvasUrl: res.rawCanvasUrl,
        detectedArchetype: res.detectedArchetype,
      };
    }
  } catch (err) {
    console.warn('[MagicLayers] extract-manifest endpoint error:', err);
  }

  // 2. Fallback sekunder: Coba ambil dari detail artikel di DB
  if (publicationId) {
    try {
      const detail = await ApiClient.request<any>(`/studio/articles/${publicationId}`);
      const raw = detail?.asset?.promptUsed;
      const parsed = typeof raw === 'string' ? JSON.parse(raw) : raw;
      const m = parsed?.layoutManifest;
      const valid = !!m && Array.isArray(m.layers) && m.layers.length > 0 && m.width > 0 && m.height > 0;
      return {
        manifest: valid ? (m as PosterLayerManifest) : null,
        rawCanvasUrl: parsed?.rawCanvasUrl || detail?.rawCanvasUrl || undefined,
        detectedArchetype: parsed?.archetype,
      };
    } catch { }
  }

  return { manifest: null };
}

// ─── Builder utama ───
export function buildObjectsFromManifest(
  manifest: PosterLayerManifest,
  naturalW: number,
  naturalH: number
): FabricObject[] {
  const sx = naturalW / manifest.width;
  const sy = naturalH / manifest.height;
  const objects: FabricObject[] = [];

  manifest.layers.forEach((layer, idx) => {
    if (layer.kind === 'frame') {
      if (layer.w < 1 || layer.h < 1) return;
      const box = scaleBox(layer, sx);
      const rect = new Rect({
        originX: 'left',
        originY: 'top',
        left: layer.x * sx,
        top: layer.y * sy,
        width: layer.w * sx,
        height: layer.h * sy,
        fill: box.fill ? cssColorToHex(box.fill) : 'rgba(0,0,0,0)',
        strokeWidth: 0,
        ...CANVA_CONTROLS,
      });
      (rect as any).customId = `ml_${layer.id}_${idx}`;
      (rect as any).customData = {
        name: labelForRole(layer.role, 'Elemen Grafis'),
        isMlComponent: true,
        mlRole: layer.role,
        mlStyle: { kind: 'frame', box } satisfies MlRenderStyle,
      };
      installMlRenderer(rect);
      rect.setCoords();
      objects.push(rect);
      return;
    }

    if (layer.kind === 'shape') {
      if (layer.w < 1 || layer.h < 1 || layer.shapeType === 'svg') return;
      const common = {
        originX: 'left' as const,
        originY: 'top' as const,
        left: layer.x * sx,
        top: layer.y * sy,
        fill: layer.fill ? cssColorToHex(layer.fill) : 'transparent',
        stroke: layer.stroke ? cssColorToHex(layer.stroke) : undefined,
        strokeWidth: layer.strokeWidth || 0,
        opacity: layer.opacity ?? 1,
        ...CANVA_CONTROLS,
      };
      let shapeObj: FabricObject;
      if (layer.shapeType === 'circle') {
        shapeObj = new Circle({
          ...common,
          radius: Math.max(4, (Math.min(layer.w, layer.h) * sx) / 2),
        });
      } else if (layer.shapeType === 'triangle') {
        shapeObj = new Triangle({
          ...common,
          width: layer.w * sx,
          height: layer.h * sy,
        });
      } else if (layer.shapeType === 'line') {
        shapeObj = new Line([0, 0, layer.w * sx, 0], {
          ...common,
          stroke: layer.stroke ? cssColorToHex(layer.stroke) : layer.fill ? cssColorToHex(layer.fill) : '#0F172A',
          strokeWidth: Math.max(2, layer.strokeWidth || 4),
        });
      } else {
        shapeObj = new Rect({
          ...common,
          width: layer.w * sx,
          height: layer.h * sy,
          rx: (layer.radius || 0) * sx,
          ry: (layer.radius || 0) * sy,
        });
      }
      (shapeObj as any).customId = `ml_${layer.id}_${idx}`;
      (shapeObj as any).customData = {
        name: labelForRole(layer.role, 'Bentuk Vektor'),
        isMlComponent: true,
        mlRole: layer.role,
      };
      shapeObj.setCoords();
      objects.push(shapeObj);
      return;
    }

    if (layer.kind !== 'text') return;

    // ─── Teks ───
    const fontSize = layer.fontSize * sx;
    const lineHeightPx = (layer.lineHeightPx || layer.fontSize * 1.2) * sy;
    const glyphH = fontSize * FABRIC_FONT_SIZE_MULT;
    // CSS menaruh half-leading di atas baris pertama; Fabric tidak.
    const halfLeading = (lineHeightPx - glyphH) / 2;
    const slack = 2 * sx; // toleransi pembulatan lebar agar tidak wrap lebih awal
    const weightNum = parseInt(layer.fontWeight, 10);

    const tb = new Textbox(layer.text, {
      originX: 'left',
      originY: 'top',
      left: layer.x * sx - (layer.textAlign === 'center' ? slack / 2 : layer.textAlign === 'right' ? slack : 0),
      top: layer.y * sy + halfLeading,
      width: layer.w * sx + slack,
      fontSize,
      fontFamily: layer.fontFamily,
      fontWeight: Number.isFinite(weightNum) ? weightNum : layer.fontWeight,
      fontStyle: layer.fontStyle === 'italic' ? 'italic' : 'normal',
      fill: cssColorToHex(layer.color),
      textAlign: layer.textAlign,
      lineHeight: Math.max(0.5, lineHeightPx / glyphH),
      charSpacing: layer.fontSize > 0 ? (layer.letterSpacingPx / layer.fontSize) * 1000 : 0,
      backgroundColor: '',
      editable: true,
      splitByGrapheme: false,
      ...CANVA_CONTROLS,
    });

    let mlStyle: MlRenderStyle = { kind: 'text', box: null };
    if (layer.box) {
      const box = scaleBox(layer.box, sx);
      const p = layer.box.padding;
      const cssContentH = layer.h * sy;
      const fabricH = tb.height || glyphH;
      mlStyle = {
        kind: 'text',
        box,
        padding: {
          t: p.t * sy + halfLeading,
          r: p.r * sx - (layer.textAlign === 'center' ? slack / 2 : layer.textAlign === 'right' ? 0 : slack),
          b: Math.max(0, p.b * sy + (cssContentH - fabricH - halfLeading)),
          l: p.l * sx - (layer.textAlign === 'center' ? slack / 2 : layer.textAlign === 'right' ? slack : 0),
        },
      };
    }

    const label = labelForRole(layer.role, 'Teks');
    (tb as any).customId = `ml_${layer.id}_${idx}`;
    (tb as any).customData = {
      name: `${label}: ${layer.text.replace(/\s+/g, ' ').slice(0, 26)}`,
      isMlComponent: true,
      mlRole: layer.role,
      mlStyle,
    };
    installMlRenderer(tb);
    tb.setCoords();
    objects.push(tb);
  });

  return objects;
}

/**
 * Memuat layer gambar (`kind: 'image'`) dan SVG (`kind: 'shape'` + `shapeType: 'svg'`)
 * secara asinkron dari PosterLayerManifest v2.
 */
export async function buildAsyncMediaLayersFromManifest(
  manifest: PosterLayerManifest,
  naturalW: number,
  naturalH: number
): Promise<FabricObject[]> {
  const sx = naturalW / manifest.width;
  const sy = naturalH / manifest.height;
  const objects: FabricObject[] = [];

  for (let idx = 0; idx < manifest.layers.length; idx++) {
    const layer = manifest.layers[idx];
    if (layer.kind === 'image' && layer.src) {
      try {
        const img = await FabricImage.fromURL(layer.src, { crossOrigin: 'anonymous' });
        const targetW = Math.max(12, layer.w * sx);
        const targetH = Math.max(12, layer.h * sy);
        img.set({
          originX: 'left',
          originY: 'top',
          left: layer.x * sx,
          top: layer.y * sy,
          scaleX: targetW / (img.width || targetW),
          scaleY: targetH / (img.height || targetH),
          opacity: layer.opacity ?? 1,
          ...CANVA_CONTROLS,
        });
        if (layer.radius && layer.radius > 0) {
          const r = layer.radius * sx;
          img.set(
            'clipPath',
            new Rect({
              originX: 'center',
              originY: 'center',
              width: img.width || targetW,
              height: img.height || targetH,
              rx: r / (img.scaleX || 1),
              ry: r / (img.scaleY || 1),
            })
          );
        }
        (img as any).customId = `ml_${layer.id}_${idx}`;
        (img as any).customData = {
          name: labelForRole(layer.role, 'Gambar / Subjek'),
          isMlComponent: true,
          mlRole: layer.role,
        };
        img.setCoords();
        objects.push(img);
      } catch (err) {
        console.warn('[MagicLayers] Gagal memuat image layer manifest:', layer.id, err);
      }
    } else if (layer.kind === 'shape' && layer.shapeType === 'svg' && layer.svgMarkup) {
      try {
        const parsed = await loadSVGFromString(layer.svgMarkup);
        const validObjs = (parsed.objects || []).filter(Boolean) as FabricObject[];
        if (validObjs.length === 0) continue;
        const grouped = util.groupSVGElements(validObjs, parsed.options);
        const targetW = Math.max(8, layer.w * sx);
        const targetH = Math.max(8, layer.h * sy);
        grouped.set({
          originX: 'left',
          originY: 'top',
          left: layer.x * sx,
          top: layer.y * sy,
          scaleX: targetW / (grouped.width || targetW),
          scaleY: targetH / (grouped.height || targetH),
          opacity: layer.opacity ?? 1,
          ...CANVA_CONTROLS,
        });
        (grouped as any).customId = `ml_${layer.id}_${idx}`;
        (grouped as any).customData = {
          name: labelForRole(layer.role, 'Ikon / Grafis SVG'),
          isMlComponent: true,
          mlRole: layer.role,
          isSvgIcon: true,
        };
        grouped.setCoords();
        objects.push(grouped);
      } catch (err) {
        console.warn('[MagicLayers] Gagal memuat SVG layer manifest:', layer.id, err);
      }
    }
  }

  return objects;
}

/**
 * Smart Magnetic Snap & Alignment Guides ala Canva:
 * Menempelkan objek yang digeser ke garis tengah kanvas (X/Y) atau tepi/tengah objek lain (threshold 6px),
 * serta menggambar garis bantu ungu (#7D2AE8) saat drag berlangsung.
 */
export function attachSnapGuides(canvas: FabricCanvas, isExporting: () => boolean): void {
  const THRESHOLD = 6;
  let activeGuides: Array<{ x1: number; y1: number; x2: number; y2: number }> = [];

  canvas.on('object:moving', (opt: any) => {
    const target = opt.target as FabricObject | undefined;
    if (!target || isExporting()) return;

    const canvasW = canvas.getWidth();
    const canvasH = canvas.getHeight();
    const bound = target.getBoundingRect();
    const tCenterX = bound.left + bound.width / 2;
    const tCenterY = bound.top + bound.height / 2;

    const xTargets: number[] = [canvasW / 2];
    const yTargets: number[] = [canvasH / 2];

    for (const obj of canvas.getObjects()) {
      if (obj === target || (obj as any).customData?.isBackground || obj.visible === false) continue;
      const b = obj.getBoundingRect();
      xTargets.push(b.left, b.left + b.width / 2, b.left + b.width);
      yTargets.push(b.top, b.top + b.height / 2, b.top + b.height);
    }

    const nextGuides: Array<{ x1: number; y1: number; x2: number; y2: number }> = [];

    // Cek snap horizontal (left, center, right)
    const xPoints = [
      { pos: bound.left, offset: 0 },
      { pos: tCenterX, offset: bound.width / 2 },
      { pos: bound.left + bound.width, offset: bound.width },
    ];
    for (const xt of xTargets) {
      const hit = xPoints.find((xp) => Math.abs(xp.pos - xt) <= THRESHOLD);
      if (hit) {
        const dx = xt - hit.pos;
        target.set('left', (target.left || 0) + dx);
        nextGuides.push({ x1: xt, y1: 0, x2: xt, y2: canvasH });
        break;
      }
    }

    // Cek snap vertikal (top, center, bottom)
    const yPoints = [
      { pos: bound.top, offset: 0 },
      { pos: tCenterY, offset: bound.height / 2 },
      { pos: bound.top + bound.height, offset: bound.height },
    ];
    for (const yt of yTargets) {
      const hit = yPoints.find((yp) => Math.abs(yp.pos - yt) <= THRESHOLD);
      if (hit) {
        const dy = yt - hit.pos;
        target.set('top', (target.top || 0) + dy);
        nextGuides.push({ x1: 0, y1: yt, x2: canvasW, y2: yt });
        break;
      }
    }

    target.setCoords();
    activeGuides = nextGuides;
  });

  const clearGuides = () => {
    if (activeGuides.length > 0) {
      activeGuides = [];
      canvas.requestRenderAll();
    }
  };
  canvas.on('object:modified', clearGuides);
  canvas.on('mouse:up', clearGuides);

  canvas.on('after:render', () => {
    if (isExporting() || activeGuides.length === 0) return;
    const ctx = canvas.getContext();
    if (!ctx) return;
    ctx.save();
    ctx.strokeStyle = '#7D2AE8';
    ctx.lineWidth = 1.25;
    ctx.setLineDash([5, 4]);
    for (const g of activeGuides) {
      ctx.beginPath();
      ctx.moveTo(g.x1, g.y1);
      ctx.lineTo(g.x2, g.y2);
      ctx.stroke();
    }
    ctx.restore();
  });
}

/**
 * Penanda komponen cerdas (gaya Canva / Figma):
 * - Garis pembatas komponen TIDAK ditampilkan secara permanen pada seluruh elemen agar kanvas bersih murni.
 * - Garis pembatas halus (dashed purple) HANYA muncul saat kursor mouse melayang (hover) di atas suatu komponen.
 * - Saat komponen diklik/dipilih oleh user, Fabric.js otomatis menampilkan bounding box ungu Canva (#7D2AE8) beserta titik kontrol sudutnya.
 * - Saat user mengklik komponen lain atau mengklik area kosong, garis pembatas komponen sebelumnya otomatis hilang secara bersih.
 */
export function attachComponentOutlineOverlay(canvas: FabricCanvas, isExporting: () => boolean): void {
  let hoveredObject: FabricObject | null = null;

  canvas.on('mouse:over', (opt: any) => {
    if (isExporting()) return;
    const target = opt.target as FabricObject | undefined;
    if (
      target &&
      (target as any).customData?.isMlComponent &&
      !canvas.getActiveObjects().includes(target)
    ) {
      hoveredObject = target;
      canvas.requestRenderAll();
    }
  });

  canvas.on('mouse:out', (opt: any) => {
    if (hoveredObject) {
      hoveredObject = null;
      canvas.requestRenderAll();
    }
  });

  canvas.on('selection:created', () => {
    hoveredObject = null;
  });
  canvas.on('selection:updated', () => {
    hoveredObject = null;
  });
  canvas.on('selection:cleared', () => {
    hoveredObject = null;
  });

  canvas.on('after:render', (opt: any) => {
    if (isExporting()) return;
    const ctx: CanvasRenderingContext2D | undefined = opt?.ctx;
    if (!ctx) return;

    // HANYA gambar outline putus-putus pada objek yang sedang di-hover dan BUKAN objek yang sedang aktif dipilih
    if (hoveredObject && hoveredObject.visible && !canvas.getActiveObjects().includes(hoveredObject)) {
      const vpt = canvas.viewportTransform;
      ctx.save();
      ctx.transform(vpt[0], vpt[1], vpt[2], vpt[3], vpt[4], vpt[5]);
      ctx.strokeStyle = '#7D2AE8';
      ctx.lineWidth = 1.5;
      ctx.setLineDash([4, 4]); // Garis putus-putus halus pembeda status hover
      const r = hoveredObject.getBoundingRect();
      ctx.strokeRect(r.left + 0.5, r.top + 0.5, Math.max(1, r.width - 1), Math.max(1, r.height - 1));
      ctx.restore();
    }
  });
}


/**
 * Memecah definisi kartu archetype (ComponentSliceDef) menjadi komponen granular ala Canva:
 * 1. Kotak Latar Kartu (Rect) sebagai layer terpisah
 * 2. Setiap bagian teks di dalam kartu (Badge, Judul Kartu, Isi Paragraf, Indikator/Tag)
 *    menjadi Textbox independen yang bisa diklik dan diedit langsung kalimatnya di dalam kotaknya.
 */
export function buildGranularObjectsFromComponentDefs(
  defs: Array<{
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
    fontFamily?: string;
    textAlign?: 'left' | 'center' | 'right';
  }>,
  naturalW: number,
  naturalH: number
): FabricObject[] {
  const objects: FabricObject[] = [];

  defs.forEach((def, defIdx) => {
    const cardLeft = Math.round(def.x * naturalW);
    const cardTop = Math.round(def.y * naturalH);
    const cardWidth = Math.round(def.w * naturalW);
    const cardHeight = Math.round(def.h * naturalH);
    const isTransparent = !def.cardBg || def.cardBg === 'transparent';

    // 1. Buat Kotak Latar Kartu (Rect) terpisah jika bukan transparan
    if (!isTransparent) {
      const box: MlBox = {
        fill: def.cardBg || '#FFFFFF',
        radius: 6,
        borders: {
          top: { w: 1.5, color: 'rgba(220, 38, 38, 0.25)' },
          right: { w: 1.5, color: 'rgba(15, 23, 42, 0.12)' },
          bottom: { w: 3, color: '#DC2626' },
          left: { w: 1.5, color: 'rgba(15, 23, 42, 0.12)' },
        },
        shadow: { color: 'rgba(0,0,0,0.08)', offsetX: 0, offsetY: 3, blur: 10 },
      };

      const frameRect = new Rect({
        originX: 'left',
        originY: 'top',
        left: cardLeft,
        top: cardTop,
        width: cardWidth,
        height: cardHeight,
        fill: def.cardBg || '#FFFFFF',
        strokeWidth: 0,
        ...CANVA_CONTROLS,
      });
      (frameRect as any).customId = `${def.id}_frame_${defIdx}`;
      (frameRect as any).customData = {
        name: `Kotak Kartu: ${def.name}`,
        isMlComponent: true,
        mlRole: 'card-container',
        mlStyle: { kind: 'frame', box } satisfies MlRenderStyle,
      };
      installMlRenderer(frameRect);
      frameRect.setCoords();
      objects.push(frameRect);
    }

    // 2. Pecah isi teks di dalam kartu menjadi sub-komponen Textbox mandiri (Badge, Judul, Paragraf, Tag)
    const rawBlocks = def.text
      .split(/\n\s*\n|\n/)
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

    if (rawBlocks.length === 0) return;

    const padX = Math.max(8, Math.round(cardWidth * 0.06));
    const padY = Math.max(6, Math.round(cardHeight * 0.05));
    const innerW = Math.max(40, cardWidth - padX * 2);
    let cursorY = cardTop + padY;

    rawBlocks.forEach((lineText, lineIdx) => {
      const isBadge =
        /^(◈|✦|DIMENSI|FASE|TONGGAK|TAHAP|INDIKATOR)/i.test(lineText) && lineText.length <= 28;
      const isBottomTag = lineIdx === rawBlocks.length - 1 && /^✦\s*(INDIKATOR|TAHAP)/i.test(lineText);
      const isHeader =
        !isBadge &&
        !isBottomTag &&
        (lineIdx === 0 || (lineIdx === 1 && /^(◈|DATA|TELAAH)/i.test(rawBlocks[0]))) &&
        lineText.length <= 85;

      let fSize = def.fontSize || Math.round(naturalW * 0.012);
      let fWeight: string | number = def.fontWeight || 'normal';
      let fColor = def.textColor || '#0F172A';
      let fFamily = def.fontFamily || "'Plus Jakarta Sans', 'Inter', sans-serif";
      let tAlign: 'left' | 'center' | 'right' = def.textAlign || 'left';
      let subRole = 'body';
      let subLabel = 'Isi Konten';
      let textBoxStyle: MlRenderStyle = { kind: 'text', box: null };

      if (isBottomTag) {
        fSize = Math.max(10, Math.round(naturalW * 0.0095));
        fWeight = '800';
        fColor = '#DC2626';
        tAlign = 'center';
        subRole = 'metric-tag';
        subLabel = 'Tag Indikator';
        cursorY = Math.max(cursorY, cardTop + cardHeight - padY - Math.round(fSize * 2.2));
        textBoxStyle = {
          kind: 'text',
          box: {
            fill: 'rgba(220, 38, 38, 0.10)',
            radius: 4,
            borders: {
              top: { w: 1, color: 'rgba(220, 38, 38, 0.28)' },
              right: { w: 1, color: 'rgba(220, 38, 38, 0.28)' },
              bottom: { w: 1, color: 'rgba(220, 38, 38, 0.28)' },
              left: { w: 1, color: 'rgba(220, 38, 38, 0.28)' },
            },
            shadow: null,
          },
          padding: { t: 4, r: 6, b: 4, l: 6 },
        };
      } else if (isBadge) {
        fSize = Math.max(11, Math.round(naturalW * 0.011));
        fWeight = '800';
        fColor = def.cardBg === '#DC2626' ? '#FFFFFF' : '#FFFFFF';
        tAlign = 'center';
        subRole = 'badge';
        subLabel = 'Badge';
        textBoxStyle = {
          kind: 'text',
          box: {
            fill: '#DC2626',
            radius: 4,
            borders: { top: null, right: null, bottom: null, left: null },
            shadow: null,
          },
          padding: { t: 3, r: 8, b: 3, l: 8 },
        };
      } else if (isHeader) {
        const isMainHeadline = def.id.includes('masthead') || def.id.includes('headline') || def.id.includes('header');
        fSize = isMainHeadline
          ? lineIdx === 0 && rawBlocks.length > 1
            ? Math.round(naturalW * 0.012)
            : Math.round(naturalW * 0.032)
          : Math.max(13, Math.round((def.fontSize || naturalW * 0.013) * 1.18));
        fWeight = '800';
        fColor =
          lineIdx === 0 && isMainHeadline && rawBlocks.length > 1
            ? '#DC2626'
            : def.textColor || '#0F172A';
        if (isMainHeadline && lineIdx === 1) {
          fFamily = "'Bebas Neue', 'Plus Jakarta Sans', sans-serif";
        }
        subRole = isMainHeadline ? 'headline' : 'card-title';
        subLabel = isMainHeadline && lineIdx === 0 ? 'Kicker' : isMainHeadline ? 'Judul Utama' : 'Judul Kartu';
      } else {
        fSize = Math.max(11, Math.round(naturalW * 0.0115));
        fWeight = '600';
        fColor = def.textColor || '#1E293B';
        subRole = 'card-body';
        subLabel = 'Kalimat Isi';
      }

      const tb = new Textbox(lineText, {
        originX: 'left',
        originY: 'top',
        left: cardLeft + padX,
        top: cursorY,
        width: innerW,
        fontSize: fSize,
        fontFamily: fFamily,
        fontWeight: fWeight,
        fill: fColor,
        textAlign: tAlign,
        lineHeight: isHeader ? 1.12 : 1.38,
        backgroundColor: '',
        editable: true,
        splitByGrapheme: false,
        ...CANVA_CONTROLS,
      });

      (tb as any).customId = `${def.id}_txt_${lineIdx}`;
      (tb as any).customData = {
        name: `${subLabel}: ${lineText.slice(0, 26)}`,
        isMlComponent: true,
        mlRole: subRole,
        mlStyle: textBoxStyle,
      };
      installMlRenderer(tb);
      tb.setCoords();
      objects.push(tb);

      const renderedH = tb.calcTextHeight ? tb.calcTextHeight() : (tb.height || fSize * 1.4);
      cursorY += Math.round(renderedH + Math.max(6, fSize * 0.55));
    });
  });

  return objects;
}
