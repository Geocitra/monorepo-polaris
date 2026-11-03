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
  strategyUsed: 'CONTEXT_AWARE_TEXTURE_SYNTHESIS' | 'AI_GENERATIVE_INPAINTING';
}

export class PosterInpainter {
  /**
   * Menambal area kosong pada gambar poster dengan merekonstruksi tekstur asli:
   * - Untuk komponen di atas FOTO (misal: 4 kotak metrik KPI): menyambungkan foto pemandangan di atas & bawahnya (seamless patch).
   * - Untuk komponen di atas KERTAS (misal: judul utama): menambal dengan warna kertas bersih (#FFFFFF / #FAF8F5).
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

      // Deteksi apakah komponen ini berada di atas FOTO atau KERTAS
      // Di arketipe Advocacy Pillars, y antara 0.14 dan 0.45 menimpa foto permukiman warga
      const yFraction = by / naturalH;
      const isPhotoArea = (yFraction >= 0.14 && yFraction <= 0.48) || comp.name?.toLowerCase().includes('metrik');

      if (isPhotoArea) {
        // ─── INPAINTING TEKSTUR FOTO (Menyambungkan foto sekitar secara mulus) ───
        try {
          const sampleBelowY = Math.min(naturalH - 10, by + bh);
          const sampleH = Math.min(bh, naturalH - sampleBelowY);

          if (sampleH > 4) {
            // Ambil potongan foto langsung dari bawah kotak
            const belowPatch = await sharp(inputBuffer)
              .extract({ left: bx, top: sampleBelowY, width: bw, height: sampleH })
              .flip() // Balik vertikal agar batas foto menyambung sempurna
              .resize(bw, bh, { fit: 'fill' })
              .toBuffer();

            composites.push({
              input: belowPatch,
              left: bx,
              top: by,
              blend: 'over',
            });
          }
        } catch (photoErr) {
          console.warn('[PosterInpainter] Gagal mengekstrak patch foto:', photoErr);
        }
      } else {
        // ─── INPAINTING KERTAS PUTIH BERSIH (Untuk Header / Judul di atas kertas) ───
        try {
          const paperSvg = Buffer.from(`
            <svg width="${bw}" height="${bh}" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <linearGradient id="paperGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stop-color="#FFFFFF" />
                  <stop offset="60%" stop-color="#FAF8F5" />
                  <stop offset="100%" stop-color="#F5F3EF" />
                </linearGradient>
              </defs>
              <rect width="${bw}" height="${bh}" fill="url(#paperGrad)" />
            </svg>
          `);

          const paperPatch = await sharp(paperSvg)
            .resize(bw, bh)
            .png()
            .toBuffer();

          composites.push({
            input: paperPatch,
            left: bx,
            top: by,
            blend: 'over',
          });
        } catch (paperErr) {
          console.warn('[PosterInpainter] Gagal membuat patch kertas:', paperErr);
        }
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
