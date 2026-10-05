import sharp from 'sharp';

export interface OptimizedImageResult {
  buffer: Buffer;
  mimeType: 'image/webp';
  sizeBytes: number;
}

export class ImageOptimizer {
  /**
   * optimizePosterBuffer mengompresi gambar DALL-E ke WebP
   * untuk memangkas ukuran hingga 70% tanpa kehilangan ketajaman teks/grafis.
   */
  public static async optimizePosterBuffer(inputBuffer: Buffer): Promise<OptimizedImageResult> {
    const optimized = await sharp(inputBuffer)
      .webp({ quality: 85, effort: 4 })
      .toBuffer();

    return {
      buffer: optimized,
      mimeType: 'image/webp',
      sizeBytes: optimized.length,
    };
  }
}
