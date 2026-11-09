import sharp from 'sharp';

export interface BakeAmbientTextureOptions {
  imageBuffer: Buffer;
  archetype?: string;
  palette?: {
    primaryHex?: string;
    accentHex?: string;
    secondaryHex?: string;
  };
  strength?: number; // 0.05 to 0.30 (default: 0.15)
  [key: string]: any;
}

export class PosterAmbientBaker {
  /**
   * Memanggang tekstur serat kertas, grain risograf, dan dispersi pencahayaan ambient
   * langsung ke dalam piksel kanvas poster sehingga elemen teks Chromium menyatu secara alami.
   */
  public static async bakeAmbientTexture(options: BakeAmbientTextureOptions): Promise<Buffer> {
    const { imageBuffer, archetype, strength = 0.15 } = options;

    try {
      const metadata = await sharp(imageBuffer).metadata();
      const width = metadata.width || 1080;
      const height = metadata.height || 1350;

      let baseFrequency = '0.65';
      let grainOpacity = Math.max(0.04, Math.min(0.25, strength));
      let vignetteOpacity = 0.08;

      if (archetype === 'INFOGRAPHIC_PUNK_ZINE') {
        baseFrequency = '0.45';
        grainOpacity = Math.max(0.08, Math.min(0.30, strength * 1.4));
      } else if (
        archetype === 'INFOGRAPHIC_HERITAGE_EDITORIAL' ||
        archetype === 'INFOGRAPHIC_HISTORICAL_EXPEDITION'
      ) {
        baseFrequency = '0.75';
        grainOpacity = Math.max(0.05, Math.min(0.20, strength * 1.1));
        vignetteOpacity = 0.12;
      } else if (archetype === 'INFOGRAPHIC_RETRO_SUNBURST') {
        baseFrequency = '0.55';
        grainOpacity = Math.max(0.06, Math.min(0.22, strength * 1.2));
      }

      const grainSvg = `
        <svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
          <filter id="ambientNoise">
            <feTurbulence type="fractalNoise" baseFrequency="${baseFrequency}" numOctaves="3" stitchTiles="stitch" />
            <feColorMatrix type="matrix" values="0.33 0.33 0.33 0 0  0.33 0.33 0.33 0 0  0.33 0.33 0.33 0 0  0 0 0 1 0" />
          </filter>
          <radialGradient id="vignette" cx="50%" cy="50%" r="70%">
            <stop offset="60%" stop-color="#000000" stop-opacity="0" />
            <stop offset="100%" stop-color="#000000" stop-opacity="${vignetteOpacity}" />
          </radialGradient>
          <rect width="100%" height="100%" filter="url(#ambientNoise)" opacity="${grainOpacity.toFixed(3)}" />
          <rect width="100%" height="100%" fill="url(#vignette)" />
        </svg>
      `;

      const baked = await sharp(imageBuffer)
        .composite([
          {
            input: Buffer.from(grainSvg),
            blend: 'soft-light',
          },
        ])
        .webp({ quality: 93 })
        .toBuffer();

      return baked;
    } catch (err: any) {
      console.warn(
        `[PosterAmbientBaker] Gagal memanggang tekstur ambient, mengembalikan buffer asli: ${err.message}`
      );
      return imageBuffer;
    }
  }

  /**
   * Menyiapkan input PNG tajam untuk Gemini Multimodal Re-Layout Pass.
   */
  public static async prepareSdxlInput(draftBuffer: Buffer): Promise<Buffer> {
    try {
      return await sharp(draftBuffer).png({ compressionLevel: 8 }).toBuffer();
    } catch {
      return draftBuffer;
    }
  }

  /**
   * Menormalisasi dan mempertajam hasil Gemini Master Re-Layout Pass ke dimensi target
   * (1080x1350 WebP kualitas tinggi) tanpa menumpuk layout lama di atasnya.
   */
  public static async harmonizeDiffusedWithCrispDraft(
    draftBuffer: Buffer,
    diffusedBuffer: Buffer
  ): Promise<Buffer> {
    try {
      const meta = await sharp(draftBuffer).metadata();
      const width = meta.width || 1080;
      const height = meta.height || 1350;

      return await sharp(diffusedBuffer)
        .resize(width, height, { fit: 'cover' })
        .sharpen({ sigma: 0.65 })
        .webp({ quality: 95 })
        .toBuffer();
    } catch (err: any) {
      console.warn(`[PosterAmbientBaker] Gagal memfinalisasi buffer Gemini Re-Layout: ${err.message}`);
      return diffusedBuffer;
    }
  }
}
