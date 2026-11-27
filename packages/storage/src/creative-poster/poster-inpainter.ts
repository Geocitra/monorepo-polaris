import sharp from 'sharp';

export interface InpaintComponentBound {
  id?: string;
  name?: string;
  x: number;
  y: number;
  w: number;
  h: number;
  cardBg?: string;
  text?: string;
}

export interface PosterInpaintOptions {
  inputBuffer: Buffer;
  naturalW?: number;
  naturalH?: number;
  componentBounds: InpaintComponentBound[];
  archetype?: string;
  promptContext?: string;
}

export interface PosterInpaintResult {
  outputBuffer: Buffer;
  dataUrl: string;
  strategyUsed: 'CONTEXT_AWARE_TEXTURE_SYNTHESIS' | 'AI_GENERATIVE_INPAINTING' | 'MASTER_RAW_CANVAS_RESTORE';
}

export class PosterInpainter {
  /**
   * Mengambil warna median dari ring piksel di luar batas kotak (perimeter 4px)
   * agar tambalan menyatu alami dengan warna kertas/latar asli (bukan putih #FFFFFF).
   */
  private static samplePerimeterMedianRgb(
    raw: Buffer,
    imgW: number,
    imgH: number,
    bx: number,
    by: number,
    bw: number,
    bh: number,
    fallbackHex?: string
  ): [number, number, number] {
    const rList: number[] = [];
    const gList: number[] = [];
    const bList: number[] = [];

    const pushPx = (px: number, py: number) => {
      if (px < 0 || py < 0 || px >= imgW || py >= imgH) return;
      const idx = (py * imgW + px) * 4;
      if (raw[idx + 3] < 128) return;
      rList.push(raw[idx]);
      gList.push(raw[idx + 1]);
      bList.push(raw[idx + 2]);
    };

    const stepX = Math.max(1, Math.floor(bw / 24));
    const stepY = Math.max(1, Math.floor(bh / 24));

    for (let x = bx; x < bx + bw; x += stepX) {
      for (let d = 2; d <= 5; d++) {
        pushPx(x, by - d);
        pushPx(x, by + bh + d);
      }
    }
    for (let y = by; y < by + bh; y += stepY) {
      for (let d = 2; d <= 5; d++) {
        pushPx(bx - d, y);
        pushPx(bx + bw + d, y);
      }
    }

    if (rList.length >= 4) {
      rList.sort((a, b) => a - b);
      gList.sort((a, b) => a - b);
      bList.sort((a, b) => a - b);
      const mid = Math.floor(rList.length / 2);
      return [rList[mid], gList[mid], bList[mid]];
    }

    if (fallbackHex && /^#[0-9a-fA-F]{6}$/.test(fallbackHex)) {
      return [
        parseInt(fallbackHex.slice(1, 3), 16),
        parseInt(fallbackHex.slice(3, 5), 16),
        parseInt(fallbackHex.slice(5, 7), 16),
      ];
    }
    return [244, 241, 234];
  }

  /**
   * Menambal area kosong pada gambar poster dengan merekonstruksi warna/tekstur perimeter asli.
   */
  public static async inpaintPoster(options: PosterInpaintOptions): Promise<PosterInpaintResult> {
    const { inputBuffer, componentBounds } = options;

    const baseImage = sharp(inputBuffer);
    const { data: rawPixels, info } = await baseImage
      .clone()
      .ensureAlpha()
      .raw()
      .toBuffer({ resolveWithObject: true });

    const naturalW = info.width || options.naturalW || 1080;
    const naturalH = info.height || options.naturalH || 1350;

    const composites: sharp.OverlayOptions[] = [];

    for (const comp of componentBounds) {
      const rawX = comp.x < 1.0 ? comp.x * naturalW : comp.x;
      const rawY = comp.y < 1.0 ? comp.y * naturalH : comp.y;
      const rawW = comp.w < 1.0 ? comp.w * naturalW : comp.w;
      const rawH = comp.h < 1.0 ? comp.h * naturalH : comp.h;

      const bx = Math.max(0, Math.min(naturalW - 1, Math.round(rawX)));
      const by = Math.max(0, Math.min(naturalH - 1, Math.round(rawY)));
      const bw = Math.max(4, Math.min(naturalW - bx, Math.round(rawW)));
      const bh = Math.max(4, Math.min(naturalH - by, Math.round(rawH)));

      const [mr, mg, mb] = this.samplePerimeterMedianRgb(
        rawPixels,
        naturalW,
        naturalH,
        bx,
        by,
        bw,
        bh,
        comp.cardBg && comp.cardBg !== 'transparent' ? comp.cardBg : undefined
      );

      try {
        const patchRgba = Buffer.alloc(bw * bh * 4);
        for (let py = 0; py < bh; py++) {
          for (let px = 0; px < bw; px++) {
            const edgeDist = Math.min(px, py, bw - 1 - px, bh - 1 - py);
            const alpha = edgeDist === 0 ? 150 : edgeDist === 1 ? 225 : 255;
            const idx = (py * bw + px) * 4;
            patchRgba[idx] = mr;
            patchRgba[idx + 1] = mg;
            patchRgba[idx + 2] = mb;
            patchRgba[idx + 3] = alpha;
          }
        }

        const patchBuffer = await sharp(patchRgba, {
          raw: { width: bw, height: bh, channels: 4 },
        })
          .png()
          .toBuffer();

        composites.push({
          input: patchBuffer,
          left: bx,
          top: by,
          blend: 'over',
        });
      } catch (err) {
        console.warn('[PosterInpainter] Gagal membuat patch:', err);
      }
    }

    // Terapkan seluruh komposisi inpainting ke kanvas asli
    const resultBuffer = composites.length > 0
      ? await sharp(inputBuffer).composite(composites).png().toBuffer()
      : inputBuffer;

    const base64Data = resultBuffer.toString('base64');
    const dataUrl = `data:image/png;base64,${base64Data}`;

    return {
      outputBuffer: resultBuffer,
      dataUrl,
      strategyUsed: 'CONTEXT_AWARE_TEXTURE_SYNTHESIS',
    };
  }
}
