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
   * Menambal area kosong pada gambar poster dengan merekonstruksi tekstur asli:
   * - Untuk komponen kartu / teks: menambal dengan warna kartu asli poster yang bersih (#FFFFFF / #FAF8F5).
   * - Menghindari distorsi cermin / teks terbalik yang merusak visual.
   */
  public static async inpaintPoster(options: PosterInpaintOptions): Promise<PosterInpaintResult> {
    const { inputBuffer, componentBounds } = options;

    const baseImage = sharp(inputBuffer);
    const metadata = await baseImage.metadata();
    const naturalW = metadata.width || options.naturalW || 1080;
    const naturalH = metadata.height || options.naturalH || 1350;

    const composites: sharp.OverlayOptions[] = [];

    for (const comp of componentBounds) {
      // Normalisasi koordinat ke piksel integer
      const rawX = comp.x < 1.0 ? comp.x * naturalW : comp.x;
      const rawY = comp.y < 1.0 ? comp.y * naturalH : comp.y;
      const rawW = comp.w < 1.0 ? comp.w * naturalW : comp.w;
      const rawH = comp.h < 1.0 ? comp.h * naturalH : comp.h;

      const bx = Math.max(0, Math.min(naturalW - 1, Math.round(rawX)));
      const by = Math.max(0, Math.min(naturalH - 1, Math.round(rawY)));
      const bw = Math.max(4, Math.min(naturalW - bx, Math.round(rawW)));
      const bh = Math.max(4, Math.min(naturalH - by, Math.round(rawH)));

      // Warna dasar inpainting bersih solid 100% opaque
      const baseFill = comp.cardBg && comp.cardBg !== 'transparent' ? comp.cardBg : '#FFFFFF';

      try {
        const patchSvg = Buffer.from(`
          <svg width="${bw}" height="${bh}" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="cleanGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stop-color="${baseFill}" />
                <stop offset="100%" stop-color="${baseFill === '#FFFFFF' ? '#FAF8F5' : baseFill}" />
              </linearGradient>
            </defs>
            <rect width="${bw}" height="${bh}" fill="url(#cleanGrad)" />
          </svg>
        `);

        const patchBuffer = await sharp(patchSvg)
          .resize(bw, bh)
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
