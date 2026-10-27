import fs from 'fs/promises';
import path from 'path';
import { FontLoader } from './core/font-loader.js';

/**
 * ChromiumFontFace
 *
 * Membangun blok CSS `@font-face` dari file font LOKAL (assets/fonts) yang di-embed
 * sebagai data URI base64. Alasan best-practice:
 * - Deterministik: render tidak bergantung pada fonts.googleapis.com (offline-safe di Docker).
 * - Tidak ada race condition "font belum termuat" -> fallback ke Arial/Times.
 * - Di-cache sekali per proses (font hanya dibaca dari disk satu kali).
 */
interface FontFaceSpec {
  family: string;
  file: string;
  weight: string; // bisa range untuk variable font, mis. "200 800"
  style: 'normal' | 'italic';
  optional?: boolean;
}

const FONT_FACES: FontFaceSpec[] = [
  { family: 'Anton', file: 'Anton-Regular.ttf', weight: '400', style: 'normal' },
  { family: 'Bebas Neue', file: 'BebasNeue-Regular.ttf', weight: '400', style: 'normal' },
  // Variable font: seluruh weight 200..800 dalam satu file
  { family: 'Plus Jakarta Sans', file: 'PlusJakartaSans-Variable.ttf', weight: '200 800', style: 'normal', optional: true },
  { family: 'Plus Jakarta Sans', file: 'PlusJakartaSans-SemiBold.ttf', weight: '600', style: 'normal' },
  { family: 'Playfair Display', file: 'PlayfairDisplay-Variable.ttf', weight: '400 900', style: 'normal', optional: true },
  { family: 'Playfair Display', file: 'PlayfairDisplay-Italic-Variable.ttf', weight: '400 900', style: 'italic', optional: true },
  { family: 'DejaVu Serif', file: 'DejaVuSerif.ttf', weight: '400', style: 'normal', optional: true },
  { family: 'DejaVu Serif', file: 'DejaVuSerif-Bold.ttf', weight: '700', style: 'normal', optional: true },
];

export class ChromiumFontFace {
  private static cssCache: Promise<string> | null = null;

  /** Mengembalikan CSS @font-face (di-cache per proses). */
  public static getCss(): Promise<string> {
    if (!this.cssCache) {
      this.cssCache = this.build().catch((err) => {
        // Jangan cache kegagalan agar request berikutnya bisa mencoba lagi
        this.cssCache = null;
        throw err;
      });
    }
    return this.cssCache;
  }

  private static async build(): Promise<string> {
    const fontsDir = await FontLoader.findFontsDir();
    const blocks: string[] = [];
    const missingRequired: string[] = [];

    for (const spec of FONT_FACES) {
      try {
        const data = await fs.readFile(path.join(fontsDir, spec.file));
        blocks.push(
          `@font-face{font-family:'${spec.family}';src:url(data:font/ttf;base64,${data.toString('base64')}) format('truetype');font-weight:${spec.weight};font-style:${spec.style};font-display:block;}`
        );
      } catch {
        if (!spec.optional) missingRequired.push(spec.file);
      }
    }

    if (missingRequired.length > 0) {
      throw new Error(
        `[ChromiumFontFace] Font wajib tidak ditemukan di ${fontsDir}: ${missingRequired.join(', ')}`
      );
    }

    return blocks.join('\n');
  }
}
