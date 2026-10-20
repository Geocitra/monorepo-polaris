import sharp from 'sharp';

export class SubjectHarmonizer {
  /**
   * Mengharmonisasikan foto cutout PNG Anggota Dewan agar menyatu dengan tekstur poster
   */
  public static async harmonizeSubjectPhoto(
    photoBuffer: Buffer,
    archetype: string,
    targetWidth: number,
    targetHeight: number
  ): Promise<Buffer> {
    let pipeline = sharp(photoBuffer).resize({
      width: targetWidth,
      height: targetHeight,
      fit: 'contain',
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    });

    if (archetype === 'STREET_JOURNALISM') {
      // Ubah ke High-Contrast B&W seperti foto Bapak PKL / Petugas Sampah di kolase
      pipeline = pipeline.grayscale().linear(1.28, -18).sharpen();
    }

    return await pipeline.png().toBuffer();
  }
}
