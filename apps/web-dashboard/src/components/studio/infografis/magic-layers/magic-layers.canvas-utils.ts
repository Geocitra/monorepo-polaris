import { FabricImage, Textbox, Shadow } from 'fabric';
import { ApiClient } from '@/lib/api-client';
import type { PosterLayerManifest } from '../poster-layer-builder';
import type { ComponentSliceDef, OCRTextDetection, PanopticLayoutBlock } from './magic-layers.types';
import { detectPosterLayout, getArchetypeComponentDefs } from './magic-layers.archetypes';

/**
 * Helper untuk membuat komponen interaktif Canva Fabric.js dengan:
 * - Bingkai ungu Canva (#7D2AE8) yang tegas dan rapi
 * - Latar belakang kartu yang solid (putih/krem)
 * - Teks tajam dengan kontras tinggi (Bukan stroke outline huruf berongga!)
 */
export function createCanvaComponent(options: {
  id: string;
  name: string;
  left: number;
  top: number;
  width: number;
  text: string;
  fontSize: number;
  fontFamily?: string;
  fontWeight?: string | number;
  fontStyle?: '' | 'normal' | 'italic';
  textAlign?: 'left' | 'center' | 'right';
  textColor?: string;
  cardBg?: string;
  borderColor?: string;
  borderWidth?: number;
  lineHeight?: number;
  padding?: number;
}): Textbox {
  const tb = new Textbox(options.text, {
    originX: 'left',
    originY: 'top',
    left: options.left,
    top: options.top,
    width: options.width,
    fontSize: options.fontSize,
    fontFamily: options.fontFamily || "'Inter', sans-serif",
    fontWeight: options.fontWeight || 'normal',
    fontStyle: options.fontStyle || 'normal',
    textAlign: options.textAlign || 'left',
    fill: options.textColor || '#0F172A',
    stroke: undefined,
    strokeWidth: 0,
    backgroundColor: options.cardBg || 'rgba(255, 255, 255, 0.96)',
    padding: options.padding ?? 8,
    cornerColor: '#FFFFFF',
    cornerStrokeColor: '#7D2AE8',
    borderColor: '#7D2AE8',
    cornerSize: 8,
    cornerStyle: 'circle',
    transparentCorners: false,
    borderScaleFactor: 2,
    editable: true,
    lineHeight: options.lineHeight || 1.3,
    splitByGrapheme: false,
    shadow: new Shadow({ color: 'rgba(0,0,0,0.06)', blur: 6, offsetX: 0, offsetY: 2 }),
  });

  tb.setCoords();
  (tb as any).customId = options.id;
  (tb as any).customData = {
    name: options.name,
    isCanvaComponent: true,
    cardBg: options.cardBg,
    borderColor: options.borderColor || '#7D2AE8',
    borderWidth: options.borderWidth || 2,
  };

  // Override _renderBackground untuk menggambar garis tepi ungu Canva mengelilingi kartu
  const origRenderBg = tb._renderBackground.bind(tb);
  tb._renderBackground = function (ctx: CanvasRenderingContext2D) {
    origRenderBg(ctx);
    const dim = (this as any)._getNonTransformedDimensions();
    const x = -dim.x / 2;
    const y = -dim.y / 2;
    const w = dim.x;
    const h = dim.y;

    ctx.save();
    ctx.strokeStyle = options.borderColor || '#7D2AE8';
    ctx.lineWidth = options.borderWidth || 2;
    if (typeof (ctx as any).roundRect === 'function') {
      ctx.beginPath();
      (ctx as any).roundRect(x, y, w, h, 6);
      ctx.stroke();
    } else {
      ctx.strokeRect(x, y, w, h);
    }
    ctx.restore();
  };

  return tb;
}

/**
 * Normalisasi URL untuk mengatasi batasan CORS antarlocalhost (3000 vs 4000).
 * Mengembalikan URL absolut yang aman diakses dari browser / web worker.
 */
export function resolveSafeImageUrl(url: string): string {
  if (!url) return '';
  const uploadsIdx = url.indexOf('/uploads/');
  if (uploadsIdx !== -1) {
    const relativePath = url.substring(uploadsIdx);
    if (typeof window !== 'undefined') {
      return `${window.location.origin}${relativePath}`;
    }
    return relativePath;
  }
  if (typeof window !== 'undefined' && url.startsWith('/')) {
    return `${window.location.origin}${url}`;
  }
  return url;
}

/**
 * Pemuat gambar Fabric.js yang kebal terhadap error CORS.
 * Menggunakan strategi bertingkat: blob lokal -> same-origin rewrite -> anonymous -> fallback.
 */
export async function loadResilientFabricImage(url: string): Promise<FabricImage> {
  const safeUrl = resolveSafeImageUrl(url);

  // Strategi 1: Jika sudah berupa blob lokal atau data URI
  if (safeUrl.startsWith('blob:') || safeUrl.startsWith('data:')) {
    return await FabricImage.fromURL(safeUrl);
  }

  // Strategi 2: Fetch sebagai blob lokal (100% same-origin, mencegah error CORS)
  try {
    const res = await fetch(safeUrl);
    if (res.ok) {
      const blob = await res.blob();
      const localBlobUrl = URL.createObjectURL(blob);
      return await FabricImage.fromURL(localBlobUrl);
    }
  } catch (err) {
    console.warn('[MagicLayers] Fetch blob lokal gagal, mencoba direct loader:', err);
  }

  // Strategi 3: Coba muat dengan same-origin rewrite / direct dengan crossOrigin
  try {
    return await FabricImage.fromURL(safeUrl, { crossOrigin: 'anonymous' });
  } catch (err) {
    console.warn('[MagicLayers] crossOrigin anonymous gagal, mencoba fallback standar:', err);
  }

  // Strategi 4: Tanpa crossOrigin
  try {
    return await FabricImage.fromURL(safeUrl);
  } catch {
    // Strategi 5: Menggunakan URL asli
    return await FabricImage.fromURL(url);
  }
}

/**
 * SOLUSI 4: ATURAN PENGGABUNGAN HEURISTIK (POST-PROCESSING GROUPING)
 * Menggabungkan mask kecil (misal: nomor badge + judul + kalimat paragraf + tombol indikator)
 * yang posisinya saling berdekatan dalam satu kolom/container menjadi 1 kartu komponen utuh.
 */
export function applyHeuristicComponentGrouping(
  ocrBlocks: OCRTextDetection[],
  layoutBlocks: PanopticLayoutBlock[],
  naturalW: number,
  naturalH: number
): ComponentSliceDef[] {
  const components: ComponentSliceDef[] = [];

  for (const block of layoutBlocks) {
    if (!block.isDraggableComponent) continue;

    // Ambil semua potongan OCR teks yang beririsan dengan layout container ini
    const containedTexts = ocrBlocks.filter((t) => {
      const centerX = t.bbox.x + t.bbox.w / 2;
      const centerY = t.bbox.y + t.bbox.h / 2;
      return (
        centerX >= block.bbox.x - 0.02 &&
        centerX <= block.bbox.x + block.bbox.w + 0.02 &&
        centerY >= block.bbox.y - 0.02 &&
        centerY <= block.bbox.y + block.bbox.h + 0.02
      );
    });

    containedTexts.sort((a, b) => a.bbox.y - b.bbox.y);
    const combinedText = containedTexts.map((t) => t.text).join('\n\n') || 'Komponen Desain';
    const primary = containedTexts[0];

    let name = 'Komponen Desain';
    if (block.semanticType === 'COLUMN_CONTAINER_CARD') {
      const titleItem = containedTexts.find((t) => t.semanticRole === 'card_title') || primary;
      name = `Kartu: ${titleItem?.text.replace(/\n/g, ' ').slice(0, 28) || 'Pilar'}`;
    } else if (block.semanticType === 'MASTHEAD_CARD') {
      name = 'Judul Utama (Masthead)';
    } else if (block.semanticType === 'STAT_METRIC_ROW') {
      name = `Metrik KPI: ${primary?.text.replace(/\n/g, ' ').slice(0, 22) || 'Statistik'}`;
    } else if (block.semanticType === 'ACCENT_BANNER') {
      name = `Banner: ${primary?.text.replace(/\n/g, ' ').slice(0, 25) || 'Aksi'}`;
    } else if (block.semanticType === 'FOOTER_BAR') {
      name = 'Identitas Dewan (Footer)';
    }

    components.push({
      id: `comp_${block.id}_${Date.now()}`,
      name,
      text: combinedText,
      x: block.bbox.x,
      y: block.bbox.y,
      w: block.bbox.w,
      h: block.bbox.h,
      cardBg: block.cardBg || '#FFFFFF',
      textColor: primary?.textColor || '#0F172A',
      fontSize: primary?.fontSize || Math.round(naturalW * 0.012),
      fontFamily: primary?.fontFamily || "'Inter', sans-serif",
      fontWeight: primary?.fontWeight || 'normal',
      textAlign: primary?.textAlign || 'left',
      padding: 8,
    });
  }

  return components;
}

/**
 * SOLUSI 3: Smart Texture Inpainting (Algoritma Penambalan Latar Belakang Bertekstur Cerdas)
 * Menambal area kosong di bawah komponen yang dipotong menggunakan sampling tekstur sekitar,
 * interpolasi gradien warna lokal, micro-grain noise, dan seam feathering.
 */
export function smartTextureInpainting(
  ctx: CanvasRenderingContext2D,
  rect: { x: number; y: number; w: number; h: number },
  naturalW: number,
  naturalH: number,
  paperColor: string = '#FAF8F5',
  def?: ComponentSliceDef
) {
  const rx = Math.max(0, Math.min(naturalW - 1, Math.round(rect.x)));
  const ry = Math.max(0, Math.min(naturalH - 1, Math.round(rect.y)));
  const rw = Math.max(1, Math.min(naturalW - rx, Math.round(rect.w)));
  const rh = Math.max(1, Math.min(naturalH - ry, Math.round(rect.h)));

  ctx.save();
  ctx.globalAlpha = 1.0; // 100% Solid Opaque (tidak pernah tembus pandang container)

  // ─── REKONSTRUKSI KERTAS/KARTU BERSIH SOLID (#FFFFFF / #FAF8F5) ───
  const isColoredCard = def?.cardBg && def.cardBg !== '#FFFFFF' && def.cardBg !== 'transparent' && !def.cardBg.startsWith('#FA');
  if (isColoredCard && def?.cardBg) {
    ctx.fillStyle = def.cardBg;
    ctx.fillRect(rx, ry, rw, rh);
    ctx.restore();
    return;
  }

  let pR = 252, pG = 250, pB = 247;
  const rgbMatch = paperColor.match(/\d+/g);
  if (rgbMatch && rgbMatch.length >= 3) {
    pR = Math.max(242, parseInt(rgbMatch[0], 10));
    pG = Math.max(240, parseInt(rgbMatch[1], 10));
    pB = Math.max(236, parseInt(rgbMatch[2], 10));
  }

  if (def?.cardBg === '#FFFFFF' || !def?.cardBg || def.cardBg === 'transparent') {
    pR = 255;
    pG = 255;
    pB = 255;
  }

  const grad = ctx.createLinearGradient(rx, ry, rx, ry + rh);
  grad.addColorStop(0, '#FFFFFF');
  grad.addColorStop(0.5, `rgb(${pR}, ${pG}, ${pB})`);
  grad.addColorStop(1, `rgb(${Math.max(242, pR - 3)}, ${Math.max(240, pG - 3)}, ${Math.max(236, pB - 3)})`);
  ctx.fillStyle = grad;
  ctx.fillRect(rx, ry, rw, rh);

  // Mikro-tekstur serat kertas organik
  try {
    const patch = ctx.getImageData(rx, ry, rw, rh);
    const pData = patch.data;
    for (let p = 0; p < pData.length; p += 4) {
      const noise = (Math.random() - 0.5) * 2;
      pData[p] = Math.min(255, Math.max(242, pData[p] + noise));
      pData[p + 1] = Math.min(255, Math.max(240, pData[p + 1] + noise));
      pData[p + 2] = Math.min(255, Math.max(236, pData[p + 2] + noise));
      pData[p + 3] = 255;
    }
    ctx.putImageData(patch, rx, ry);
  } catch {}

  // Edge softening
  ctx.filter = 'blur(3px)';
  ctx.strokeStyle = `rgb(${pR}, ${pG}, ${pB})`;
  ctx.lineWidth = 4;
  ctx.strokeRect(rx, ry, rw, rh);
  ctx.restore();
}

/**
 * Mengekstrak area bounding box komponen dari Layer Manifest untuk inpainting latar belakang.
 * Memastikan semua area teks (header, statistik, kolom kartu, closing, footer) dibersihkan dari background
 * sehingga saat komponen teks/kartu digeser, area di belakangnya 100% bersih tanpa teks lama/duplikat.
 */
export function extractInpaintBoundsFromManifest(
  manifest: PosterLayerManifest,
  naturalW: number,
  naturalH: number,
  fallbackArchetype?: string
): ComponentSliceDef[] {
  const defs: ComponentSliceDef[] = [];
  const mw = manifest.width || 1080;
  const mh = manifest.height || 1350;

  for (const layer of manifest.layers) {
    if (layer.kind === 'frame') {
      // Abaikan garis konektor tipis (h <= 4) atau divider tipis (w <= 4) atau titik bullet kecil (w <= 16)
      if (layer.w <= 16 || layer.h <= 4) continue;

      const pad = 3;
      const left = Math.max(0, layer.x - pad);
      const top = Math.max(0, layer.y - pad);
      const w = Math.min(mw - left, layer.w + pad * 2);
      const h = Math.min(mh - top, layer.h + pad * 2);

      defs.push({
        id: `inpaint_frame_${layer.id}`,
        name: layer.role,
        text: '',
        x: left / mw,
        y: top / mh,
        w: w / mw,
        h: h / mh,
        cardBg: layer.fill || '#FFFFFF',
      });
    } else if (layer.kind === 'text') {
      // INPAINT SEMUA TEKS: baik yang memiliki background box maupun teks mandiri (judul, kicker, kpi, desc, footer)
      // agar ketika teks digeser ke tempat lain, latar belakang di bawahnya bersih tanpa teks ganda/bekas lama!
      const p = layer.box?.padding || { t: 0, r: 0, b: 0, l: 0 };
      const pad = 2;
      const left = Math.max(0, layer.x - p.l - pad);
      const top = Math.max(0, layer.y - p.t - pad);
      const w = Math.min(mw - left, layer.w + p.l + p.r + pad * 2);
      const h = Math.min(mh - top, layer.h + p.t + p.b + pad * 2);

      defs.push({
        id: `inpaint_text_${layer.id}`,
        name: layer.role,
        text: layer.text,
        x: left / mw,
        y: top / mh,
        w: w / mw,
        h: h / mh,
        cardBg: layer.box?.fill || '#FFFFFF',
      });
    } else if (layer.kind === 'image') {
      const pad = 4;
      const left = Math.max(0, layer.x - pad);
      const top = Math.max(0, layer.y - pad);
      const w = Math.min(mw - left, layer.w + pad * 2);
      const h = Math.min(mh - top, layer.h + pad * 2);

      defs.push({
        id: `inpaint_image_${layer.id}`,
        name: layer.role,
        text: '',
        x: left / mw,
        y: top / mh,
        w: w / mw,
        h: h / mh,
        cardBg: '#FAF8F5',
      });
    }
  }

  return defs;
}

/**
 * Menghasilkan gambar latar belakang yang BERSIH dari kartu & teks berdasarkan tata letak komponen.
 * - Foto kolase warga, foto dokumentasi, dan ornamen penting dipertahankan 100% utuh.
 * - Area kartu dan teks dibersihkan dengan warna kertas asli poster (inpainting) sehingga saat kartu digeser, tidak ada duplikat kartu lama.
 */
export async function createCleanPosterBackground(
  rawImageUrl: string,
  naturalW: number,
  naturalH: number,
  componentDefs: ComponentSliceDef[],
  archetype?: string,
  publicationId?: string,
  rawCanvasUrl?: string
): Promise<string> {
  // ════════════════════════════════════════════════════════════════════════
  // 1. JIKA MASTER RAW CANVAS ASLI TERSEDIA, GUNAKAN LANGSUNG 100%!
  // ════════════════════════════════════════════════════════════════════════
  if (rawCanvasUrl && rawCanvasUrl.trim().length > 0 && rawCanvasUrl !== rawImageUrl) {
    console.log('[MagicLayers] Menggunakan Master Raw Canvas Asli:', rawCanvasUrl);
    return resolveSafeImageUrl(rawCanvasUrl);
  }

  const safeUrl = resolveSafeImageUrl(rawImageUrl);

  return new Promise((resolve) => {
    (async () => {
      // ════════════════════════════════════════════════════════════════════════
      // 2. Panggil Backend Inpainting Engine (Mengecek DB / R2 untuk Raw Canvas)
      // ════════════════════════════════════════════════════════════════════════
      try {
        const backendRes = await ApiClient.request<{
          success: boolean;
          cleanBackgroundUrl: string;
          strategyUsed?: string;
        }>('/studio/magic-layers/inpaint', {
          method: 'POST',
          body: JSON.stringify({
            imageUrl: safeUrl,
            naturalW,
            naturalH,
            componentBounds: componentDefs,
            archetype,
            publicationId,
          }),
        });

        if (backendRes?.success && backendRes?.cleanBackgroundUrl) {
          console.log('[MagicLayers] Inpainted via Backend:', backendRes.strategyUsed, backendRes.cleanBackgroundUrl);
          resolve(backendRes.cleanBackgroundUrl);
          return;
        }
      } catch (backendErr) {
        console.warn('[MagicLayers] Backend inpainting fallback ke client-side synthesis:', backendErr);
      }
      let objectUrlToUse = safeUrl;
      let blobCreated = false;

      try {
        const response = await fetch(safeUrl);
        if (response.ok) {
          const blob = await response.blob();
          if (blob.type.startsWith('image/')) {
            objectUrlToUse = URL.createObjectURL(blob);
            blobCreated = true;
          }
        }
      } catch (e) {
        console.warn('[MagicLayers] fetch blob untuk clean background gagal, mencoba direct img:', e);
      }

      const img = new Image();
      img.crossOrigin = 'anonymous';

      img.onload = () => {
        try {
          const offCanvas = document.createElement('canvas');
          offCanvas.width = naturalW;
          offCanvas.height = naturalH;
          const ctx = offCanvas.getContext('2d');
          if (!ctx) {
            if (blobCreated) URL.revokeObjectURL(objectUrlToUse);
            resolve(safeUrl);
            return;
          }

          // 1. SOLUSI 2: Pastikan layer latar belakang memiliki dasar putih solid 100% opaque (mencegah tembus pandang abu-abu)
          ctx.fillStyle = '#FFFFFF';
          ctx.fillRect(0, 0, naturalW, naturalH);
          ctx.drawImage(img, 0, 0, naturalW, naturalH);

          // 2. Ambil sampel warna background kertas di margin kanan atas
          let paperColor = '#FAF8F5';
          try {
            const sampleX = Math.min(naturalW - 25, Math.floor(naturalW * 0.96));
            const sampleY = Math.floor(naturalH * 0.40);
            const pixel = ctx.getImageData(sampleX, sampleY, 1, 1).data;
            if (pixel[3] > 200 && pixel[0] > 180 && pixel[1] > 180) {
              paperColor = `rgb(${pixel[0]}, ${pixel[1]}, ${pixel[2]})`;
            }
          } catch {}

          // 3. SOLUSI 3: Inpainting Cerdas Tekstur Latar Belakang (Bebas dari blok abu-abu)
          for (const def of componentDefs) {
            const cropX = Math.round(def.x * naturalW);
            const cropY = Math.round(def.y * naturalH);
            const cropW = Math.round(def.w * naturalW);
            const cropH = Math.round(def.h * naturalH);
            smartTextureInpainting(ctx, { x: cropX, y: cropY, w: cropW, h: cropH }, naturalW, naturalH, paperColor, def);
          }

          const cleanDataUrl = offCanvas.toDataURL('image/png');
          if (blobCreated) URL.revokeObjectURL(objectUrlToUse);
          resolve(cleanDataUrl);
        } catch (canvasErr) {
          console.warn('[MagicLayers] Error saat memproses canvas clean background:', canvasErr);
          if (blobCreated) URL.revokeObjectURL(objectUrlToUse);
          resolve(safeUrl);
        }
      };

      img.onerror = () => {
        if (blobCreated) URL.revokeObjectURL(objectUrlToUse);
        resolve(safeUrl);
      };

      img.src = objectUrlToUse;
    })();
  });
}

/**
 * Menempatkan gambar latar dengan aturan `background-size: cover; background-position: center`
 * — identik dengan cara Chromium menempatkan raw canvas saat merender poster, sehingga
 * komponen hasil manifest jatuh tepat di posisi aslinya.
 */
export function placeImageCover(img: FabricImage, targetW: number, targetH: number) {
  const iw = img.width || targetW;
  const ih = img.height || targetH;
  const scale = Math.max(targetW / iw, targetH / ih);
  img.set({
    originX: 'left',
    originY: 'top',
    left: (targetW - iw * scale) / 2,
    top: (targetH - ih * scale) / 2,
    scaleX: scale,
    scaleY: scale,
    selectable: false,
    evented: false,
  });
  img.setCoords();
}
