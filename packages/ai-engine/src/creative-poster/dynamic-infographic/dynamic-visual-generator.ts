import fs from 'fs';
import path from 'path';
import { openaiClient } from '../../client.js';

export interface VisualAssetsBundle {
  motifImageBuffer?: Buffer;
  sectionImageBuffers: Record<string, Buffer>;
  decorations: Record<string, Buffer>;
}

export class DynamicVisualGenerator {
  /**
   * Cari lokasi folder aset radial-clock lokal
   */
  private static findAssetDir(): string {
    const candidates = [
      path.resolve(process.cwd(), 'packages/storage/assets/radial-clock'),
      path.resolve(process.cwd(), '../storage/assets/radial-clock'),
      path.resolve(process.cwd(), '../../packages/storage/assets/radial-clock'),
      path.resolve(process.cwd(), 'assets/radial-clock'),
    ];
    for (const dir of candidates) {
      if (fs.existsSync(dir)) return dir;
    }
    return candidates[0];
  }

  /**
   * Generate atau ambil motif jam antik
   */
  public static async resolveMotifImage(motifType: 'clock' | 'circle' | 'emblem' = 'clock'): Promise<Buffer | undefined> {
    const assetDir = this.findAssetDir();
    const localClockFile = path.resolve(assetDir, 'clock_dial.jpg');

    // Cek apakah ada cache hasil generate AI sebelumnya di scratch
    const scratchClock = path.resolve('scratch/test-clock.png');
    if (fs.existsSync(scratchClock)) {
      return fs.readFileSync(scratchClock);
    }

    // Coba generate via chatgpt-image-latest
    try {
      if (process.env.OPENAI_API_KEY) {
        console.log('[DynamicVisualGenerator] Mengenerate motif jam antik via chatgpt-image-latest...');
        const res = await openaiClient.images.generate({
          model: 'chatgpt-image-latest',
          prompt: 'Vintage antique pocket clock face with roman numerals, front view, isolated on white background, no text',
          n: 1,
        });
        const b64 = (res.data?.[0] as any)?.b64_json;
        if (b64) {
          const buf = Buffer.from(b64, 'base64');
          try {
            fs.writeFileSync(scratchClock, buf);
          } catch {}
          return buf;
        }
      }
    } catch (err: any) {
      console.warn(`[DynamicVisualGenerator] AI motif generation skipped: ${err.message}`);
    }

    // Fallback ke aset clock_dial.jpg lokal
    if (fs.existsSync(localClockFile)) {
      return fs.readFileSync(localClockFile);
    }
    return undefined;
  }

  /**
   * Mengumpulkan aset visual tematik untuk tiap seksi & dekorasi kanvas
   */
  public static async prepareVisualAssets(): Promise<VisualAssetsBundle> {
    const assetDir = this.findAssetDir();
    const decorations: Record<string, Buffer> = {};
    const sectionImageBuffers: Record<string, Buffer> = {};

    const loadBuf = (fileName: string): Buffer | undefined => {
      const p = path.resolve(assetDir, fileName);
      if (fs.existsSync(p)) {
        return fs.readFileSync(p);
      }
      return undefined;
    };

    // 1. Muat ilustrasi seksi 1 - 6
    const dancer = loadBuf('dancer_clean.jpg') || loadBuf('dancer.jpg');
    const statue = loadBuf('statue_clean.jpg') || loadBuf('statue.jpg');
    const patriots = loadBuf('flag_patriots_clean.jpg') || loadBuf('flag_patriots.jpg');
    const bookStack = loadBuf('book_stack_clean.jpg') || loadBuf('book_stack.jpg');
    const soldiers = loadBuf('soldiers_clean.jpg') || loadBuf('soldiers.jpg');
    const monument = loadBuf('monument_clean.jpg') || loadBuf('monument.jpg');

    if (dancer) sectionImageBuffers['sec-1'] = dancer;
    if (statue) sectionImageBuffers['sec-2'] = statue;
    if (patriots) sectionImageBuffers['sec-3'] = patriots;
    if (bookStack) sectionImageBuffers['sec-4'] = bookStack;
    if (soldiers) sectionImageBuffers['sec-5'] = soldiers;
    if (monument) sectionImageBuffers['sec-6'] = monument;

    // 2. Muat dekorasi pendukung
    const openBook = loadBuf('open_book.jpg');
    const megaphone = loadBuf('megaphone.jpg');
    const theNews = loadBuf('the_news.jpg');
    const scroll = loadBuf('declaration_scroll.jpg');
    const chains = loadBuf('broken_chains.jpg');

    if (openBook) decorations['open_book'] = openBook;
    if (megaphone) decorations['megaphone'] = megaphone;
    if (theNews) decorations['the_news'] = theNews;
    if (scroll) decorations['scroll'] = scroll;
    if (chains) decorations['chains'] = chains;

    // 3. Muat motif utama (jam)
    const motifImageBuffer = await this.resolveMotifImage('clock');

    return {
      motifImageBuffer,
      sectionImageBuffers,
      decorations,
    };
  }
}
