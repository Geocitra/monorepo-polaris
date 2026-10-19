import sharp from 'sharp';

export interface CropRegionSpec {
  id: string;
  leftRatio: number;   // 0.0 s/d 1.0 (Persentase dari lebar gambar)
  topRatio: number;    // 0.0 s/d 1.0 (Persentase dari tinggi gambar)
  widthRatio: number;  // 0.0 s/d 1.0
  heightRatio: number; // 0.0 s/d 1.0
  targetWidth?: number;
  targetHeight?: number;
  grayscale?: boolean;
}

/**
 * MultiRegionCropper
 * Utilitas pemotong gambar otomatis berbasis Sharp.
 * Mengimplementasikan "Single-Pass Multi-Crop Strategy" di mana 1 panggilan AI Image
 * (atau 1 aset kanvas luas) dipotong menjadi beberapa sub-zona visual secara lokal di server (Rp 0 & < 50ms),
 * tanpa perlu memanggil API DALL-E berkali-kali.
 */
export class MultiRegionCropper {
  public static async extractSubRegions(
    imageBuffer: Buffer,
    regions: CropRegionSpec[],
    galleryFallback?: string[]
  ): Promise<Record<string, string>> {
    const results: Record<string, string> = {};

    if (!imageBuffer || imageBuffer.length === 0) {
      return results;
    }

    try {
      const meta = await sharp(imageBuffer).metadata();
      const imgWidth = meta.width || 1080;
      const imgHeight = meta.height || 1350;

      for (let i = 0; i < regions.length; i++) {
        const spec = regions[i]!;

        // 1. Jika tersedia foto dari galeri dewan untuk slot ini, utamakan foto galeri
        if (galleryFallback && galleryFallback[i] && galleryFallback[i]!.startsWith('http')) {
          try {
            const resp = await fetch(galleryFallback[i]!);
            if (resp.ok) {
              const galleryBuffer = Buffer.from(await resp.arrayBuffer());
              let pipeline = sharp(galleryBuffer);
              if (spec.targetWidth && spec.targetHeight) {
                pipeline = pipeline.resize(spec.targetWidth, spec.targetHeight, { fit: 'cover' });
              }
              if (spec.grayscale) {
                pipeline = pipeline.grayscale();
              }
              const buf = await pipeline.png().toBuffer();
              results[spec.id] = `data:image/png;base64,${buf.toString('base64')}`;
              continue;
            }
          } catch {
            // Fallback ke pemotongan kanvas AI jika fetch galeri gagal
          }
        }

        // 2. Hitung koordinat piksel aman (Clamped)
        const left = Math.max(0, Math.min(imgWidth - 10, Math.round(spec.leftRatio * imgWidth)));
        const top = Math.max(0, Math.min(imgHeight - 10, Math.round(spec.topRatio * imgHeight)));
        const width = Math.max(10, Math.min(imgWidth - left, Math.round(spec.widthRatio * imgWidth)));
        const height = Math.max(10, Math.min(imgHeight - top, Math.round(spec.heightRatio * imgHeight)));

        let pipeline = sharp(imageBuffer).extract({ left, top, width, height });

        if (spec.targetWidth && spec.targetHeight) {
          pipeline = pipeline.resize(spec.targetWidth, spec.targetHeight, { fit: 'cover' });
        }
        if (spec.grayscale) {
          pipeline = pipeline.grayscale().linear(1.15, -10).sharpen();
        }

        const croppedBuffer = await pipeline.png().toBuffer();
        results[spec.id] = `data:image/png;base64,${croppedBuffer.toString('base64')}`;
      }
    } catch (err) {
      console.error('[MultiRegionCropper] Failed to extract sub-regions:', err);
    }

    return results;
  }
}
