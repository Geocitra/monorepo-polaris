import fs from 'fs/promises';
import path from 'path';

export interface SatoriFontConfig {
  name: string;
  data: Buffer;
  weight: 400 | 600 | 700;
  style: 'normal' | 'italic';
}

export class FontLoader {
  private static fontCache: SatoriFontConfig[] | null = null;

  /**
   * Menemukan direktori assets/fonts secara dinamis
   */
  public static async findFontsDir(): Promise<string> {
    const candidates = [
      process.env.FONTS_DIR,
      path.resolve(process.cwd(), 'assets/fonts'),
      path.resolve(process.cwd(), '../assets/fonts'),
      path.resolve(process.cwd(), '../../assets/fonts'),
      path.resolve(process.cwd(), '../../../assets/fonts'),
      '/app/assets/fonts',
      '/home/pc/projects/polaris-platform/assets/fonts',
    ].filter(Boolean) as string[];

    for (const dir of candidates) {
      try {
        await fs.access(dir);
        return dir;
      } catch {
        // Coba kandidat berikutnya
      }
    }
    return path.resolve(process.cwd(), 'assets/fonts');
  }

  /**
   * Memuat file binary font lokal sekali ke memori (Singleton)
   * Menghindari bug fatal librsvg yang gagal memuat @import Google Fonts di Docker Linux
   */
  public static async getFonts(): Promise<SatoriFontConfig[]> {
    if (this.fontCache) return this.fontCache;

    const fontsDir = await this.findFontsDir();

    try {
      const [antonData, bebasData, jakartaData, dejavuData, dejavuBoldData] = await Promise.all([
        fs.readFile(path.join(fontsDir, 'Anton-Regular.ttf')),
        fs.readFile(path.join(fontsDir, 'BebasNeue-Regular.ttf')),
        fs.readFile(path.join(fontsDir, 'PlusJakartaSans-SemiBold.ttf')),
        fs.readFile(path.join(fontsDir, 'DejaVuSerif.ttf')).catch(() => fs.readFile('/usr/share/fonts/truetype/dejavu/DejaVuSerif.ttf')),
        fs.readFile(path.join(fontsDir, 'DejaVuSerif-Bold.ttf')).catch(() => fs.readFile('/usr/share/fonts/truetype/dejavu/DejaVuSerif-Bold.ttf')),
      ]);

      this.fontCache = [
        { name: 'Anton', data: antonData, weight: 400, style: 'normal' },
        { name: 'Bebas Neue', data: bebasData, weight: 400, style: 'normal' },
        // Daftarkan Plus Jakarta Sans di berbagai weight agar Satori tidak pernah gagal mencocokkan
        { name: 'Plus Jakarta Sans', data: jakartaData, weight: 400, style: 'normal' },
        { name: 'Plus Jakarta Sans', data: jakartaData, weight: 600, style: 'normal' },
        { name: 'Plus Jakarta Sans', data: jakartaData, weight: 700, style: 'normal' },
        // Daftarkan DejaVu Serif untuk typography koran/broadsheet
        { name: 'DejaVu Serif', data: dejavuData, weight: 400, style: 'normal' },
        { name: 'DejaVu Serif', data: dejavuBoldData, weight: 700, style: 'normal' },
      ];

      return this.fontCache;
    } catch (err: any) {
      console.error(`[FontLoader] Gagal memuat font dari direktori: ${fontsDir}. Error: ${err.message}`);
      throw new Error(`[FontLoader] File font tidak ditemukan di ${fontsDir}. Pastikan folder assets/fonts ter-mount dan memiliki permission 755: ${err.message}`);
    }
  }
}
