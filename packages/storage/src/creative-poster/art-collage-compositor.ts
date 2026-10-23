/**
 * Art-Collage Compositor (Zero-Box Policy + Sharp Ink-Blend)
 *
 * Menggabungkan kanvas kolase AI dengan layer tipografi Satori transparan:
 * 1. Mengukur luminansi riil pada zona teks menggunakan Sharp.
 * 2. Merender tipografi Satori (tanpa kartu, tanpa kotak, 100% transparan).
 * 3. Menyatukan layer teks ke atas kertas kolase AI menggunakan Sharp:
 *    - Untuk kertas terang: blend mode 'multiply' (efek tinta menyerap ke serat kertas).
 *    - Untuk latar gelap: blend mode 'over' dengan text-shadow halus.
 * 4. TIDAK MENEMPEL FOTO SUBJEK USER (Sesuai keputusan desain mutlak).
 */

import sharp from 'sharp';
import satori from 'satori';
import { FontLoader } from './core/font-loader.js';
import {
  buildArtCollageOverlayLayout,
  ArtCollageBox,
  ArtCollageOverlayCopy,
  ArtCollageInk,
} from './layouts/art-collage-overlay.layout.js';

export interface ComposeArtCollageOptions {
  canvasBuffer: Buffer;
  copy: ArtCollageOverlayCopy;
  zones: {
    headline: ArtCollageBox;
    body: ArtCollageBox;
    footer: ArtCollageBox;
  };
  palette: {
    accentHex: string;
    secondaryHex?: string;
  };
  signature: string;
  editionTag?: string;
  officialLogoBuffer?: Buffer;
  canvasWidth?: number;
  canvasHeight?: number;
  outputFormat?: 'webp' | 'png' | 'jpeg';
  textToneHint?: 'DARK' | 'LIGHT';
}

export interface ComposedArtCollageResult {
  buffer: Buffer;
  mimeType: 'image/webp' | 'image/png' | 'image/jpeg';
  width: number;
  height: number;
  sizeBytes: number;
  detectedLuminance: number;
  blendModeUsed: 'multiply' | 'over';
}

export class ArtCollageCompositor {
  /**
   * Mengukur luminansi rata-rata pada area kanvas tertentu
   */
  private static async sampleLuminance(
    imageBuffer: Buffer,
    box: ArtCollageBox,
    imgWidth: number,
    imgHeight: number
  ): Promise<number> {
    try {
      const left = Math.max(0, Math.min(imgWidth - 1, Math.round(box.x * imgWidth)));
      const top = Math.max(0, Math.min(imgHeight - 1, Math.round(box.y * imgHeight)));
      const width = Math.max(1, Math.min(imgWidth - left, Math.round(box.w * imgWidth)));
      const height = Math.max(1, Math.min(imgHeight - top, Math.round(box.h * imgHeight)));

      const stats = await sharp(imageBuffer)
        .extract({ left, top, width, height })
        .stats();

      const r = stats.channels[0]?.mean ?? 128;
      const g = stats.channels[1]?.mean ?? 128;
      const b = stats.channels[2]?.mean ?? 128;

      // Standar Luminansi Relatif ITU-R BT.601
      return (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    } catch {
      return 0.8; // Fallback ke asumsi kertas terang
    }
  }

  /**
   * Merender dan mengomposit poster kolase seni utuh
   */
  public static async compose(
    options: ComposeArtCollageOptions
  ): Promise<ComposedArtCollageResult> {
    const {
      canvasBuffer,
      copy,
      zones,
      palette,
      signature,
      editionTag,
      officialLogoBuffer,
      canvasWidth = 1080,
      canvasHeight = 1350,
      outputFormat = 'webp',
      textToneHint,
    } = options;

    // 1. Ukur luminansi riil pada zona headline & body
    const [headlineLum, bodyLum] = await Promise.all([
      this.sampleLuminance(canvasBuffer, zones.headline, canvasWidth, canvasHeight),
      this.sampleLuminance(canvasBuffer, zones.body, canvasWidth, canvasHeight),
    ]);

    const avgLuminance = (headlineLum + bodyLum) / 2;
    // Tentukan apakah kanvas terang (kertas krem/putih) atau gelap (navy/marun/hitam)
    const isLightCanvas = textToneHint
      ? textToneHint === 'DARK'
      : avgLuminance >= 0.45;

    // 2. Konfigurasi Tinta Cetak Vektor Satori (Tanpa Kotak Kartu!)
    let ink: ArtCollageInk;
    let blendMode: 'multiply' | 'over';

    if (isLightCanvas) {
      // Kertas Terang: Tinta hitam pekat + aksen warna, menyerap ke serat kertas
      ink = {
        headline: '#141416',
        body: '#222226',
        accent: palette.accentHex || '#B83A1B',
        rule: 'rgba(20, 20, 22, 0.22)',
      };
      // Mode 'multiply' membuat tinta menyatu fisik dengan serat dan tekstur AI di bawahnya
      blendMode = 'multiply';
    } else {
      // Latar Gelap: Tinta terang kontras dengan bayangan halus
      ink = {
        headline: '#FAF9F6',
        body: '#E4E4E7',
        accent: palette.accentHex || '#F59E0B',
        rule: 'rgba(250, 249, 246, 0.25)',
        softShadow: '0 2px 10px rgba(0, 0, 0, 0.85)',
      };
      blendMode = 'over';
    }

    // 3. Konversi Logo Resmi jika ada
    let logoDataUri: string | undefined;
    if (officialLogoBuffer && officialLogoBuffer.length > 0) {
      logoDataUri = `data:image/png;base64,${officialLogoBuffer.toString('base64')}`;
    }

    // 4. Siapkan Font & Bangun Satori VNode
    const fonts = await FontLoader.getFonts();
    const vnode = buildArtCollageOverlayLayout({
      width: canvasWidth,
      height: canvasHeight,
      copy,
      zones,
      ink,
      signature,
      editionTag,
      logoDataUri,
    });

    const svgString = await satori(vnode, {
      width: canvasWidth,
      height: canvasHeight,
      fonts,
    });

    // 5. Normalisasi Kanvas Dasar AI
    const baseCanvas = sharp(canvasBuffer).resize({
      width: canvasWidth,
      height: canvasHeight,
      fit: 'cover',
      position: 'center',
    });

    // 6. Komposit Layer Tipografi Vektor (ZERO SUBJECT PHOTO OVERLAY)
    const compositePipeline = baseCanvas.composite([
      {
        input: Buffer.from(svgString),
        top: 0,
        left: 0,
        blend: blendMode,
      },
    ]);

    // 7. Ekspor Hasil
    let finalBuffer: Buffer;
    let mimeType: 'image/webp' | 'image/png' | 'image/jpeg';

    if (outputFormat === 'png') {
      finalBuffer = await compositePipeline.png().toBuffer();
      mimeType = 'image/png';
    } else if (outputFormat === 'jpeg') {
      finalBuffer = await compositePipeline.jpeg({ quality: 94 }).toBuffer();
      mimeType = 'image/jpeg';
    } else {
      finalBuffer = await compositePipeline
        .webp({ quality: 94, effort: 4 })
        .toBuffer();
      mimeType = 'image/webp';
    }

    return {
      buffer: finalBuffer,
      mimeType,
      width: canvasWidth,
      height: canvasHeight,
      sizeBytes: finalBuffer.length,
      detectedLuminance: avgLuminance,
      blendModeUsed: blendMode,
    };
  }
}
