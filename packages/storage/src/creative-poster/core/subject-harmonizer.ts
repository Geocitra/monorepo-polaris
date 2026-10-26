import sharp from 'sharp';

export class SubjectHarmonizer {
  /**
   * Mengharmonisasikan foto cutout PNG Anggota Dewan agar menyatu dengan estetika poster.
   * Menggunakan Bottom-Anchored alignment dan Soft Gradient Feathering di tepi bawah
   * agar tubuh subjek tidak pernah terlihat melayang atau terpotong kaku.
   */
  public static async harmonizeSubjectPhoto(
    photoBuffer: Buffer,
    archetype: string,
    targetWidth: number,
    targetHeight: number
  ): Promise<Buffer> {
    // 1. Resize foto dengan fit: 'contain' dan posisi 'bottom'
    let pipeline = sharp(photoBuffer).resize({
      width: targetWidth,
      height: targetHeight,
      fit: 'contain',
      position: 'bottom',
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    });

    if (archetype === 'STREET_JOURNALISM') {
      // Ubah ke High-Contrast B&W jurnalisme risograph
      pipeline = pipeline.grayscale().linear(1.22, -14).sharpen();
    } else if (archetype === 'VINTAGE_PERSONA_GAZETTE' || archetype === 'RETRO_CAMPAIGN') {
      // Sedikit tone hangat vintage
      pipeline = pipeline.modulate({ brightness: 1.02, saturation: 0.95 });
    }

    const resizedBuffer = await pipeline.png().toBuffer();

    // 2. Terapkan Soft Bottom Gradient Feathering (14% bagian bawah meluruh lembut ke transparan)
    // Menghilangkan efek "potongan pinggang kaku / melayang di udara"
    try {
      const featherSvg = Buffer.from(`
        <svg width="${targetWidth}" height="${targetHeight}" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="bottomFeather" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stop-color="#ffffff" stop-opacity="1" />
              <stop offset="86%" stop-color="#ffffff" stop-opacity="1" />
              <stop offset="100%" stop-color="#ffffff" stop-opacity="0" />
            </linearGradient>
          </defs>
          <rect width="${targetWidth}" height="${targetHeight}" fill="url(#bottomFeather)" />
        </svg>
      `);

      return await sharp(resizedBuffer)
        .composite([{ input: featherSvg, blend: 'dest-in' }])
        .png()
        .toBuffer();
    } catch {
      return resizedBuffer;
    }
  }
}

