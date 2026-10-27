import sharp from 'sharp';
import { chromium, type Browser, type BrowserContext, type Page } from 'playwright-core';

export interface RenderHtmlOptions {
  width?: number;
  height?: number;
  quality?: number;
  timeoutMs?: number;
}

/**
 * BrowserSingleton — runtime Chromium headless untuk render poster (HTML/CSS -> WebP).
 *
 * Best practice yang diterapkan:
 * 1. Satu proses browser per worker (launch mahal), satu BrowserContext ephemeral per render
 *    (isolasi cookie/cache/memori antar job).
 * 2. Launch de-duplication via shared Promise (tidak ada polling / double-launch).
 * 3. Concurrency cap (semaphore) agar container tidak OOM saat banyak job paralel.
 * 4. Crash recovery: jika browser/tab crash, browser di-reset dan render dicoba ulang
 *    SEKALI — tanpa mengulang generate gambar AI yang berbayar.
 * 5. Network lockdown: semua request eksternal diblokir (aset sudah inline/data URI)
 *    -> deterministik, cepat, dan aman dari SSRF lewat konten AI.
 * 6. Browser di-recycle setelah N render untuk membatasi kebocoran memori jangka panjang.
 * 7. Graceful shutdown pada SIGTERM/SIGINT (container stop) agar tidak ada zombie process.
 *
 * Konfigurasi ENV:
 * - CHROMIUM_EXECUTABLE_PATH : path binary Chromium sistem (wajib di Docker Alpine,
 *                              mis. /usr/bin/chromium-browser). Jika kosong, pakai
 *                              Chromium bawaan Playwright (~/.cache/ms-playwright).
 * - POSTER_RENDER_CONCURRENCY: maksimum render paralel per worker (default 2).
 * - POSTER_BROWSER_RECYCLE_AFTER: recycle browser setelah N render (default 200).
 */
export class BrowserSingleton {
  private static browserInstance: Browser | null = null;
  private static launchPromise: Promise<Browser> | null = null;
  private static renderCount = 0;
  private static activeRenders = 0;
  private static waitQueue: Array<() => void> = [];
  private static shutdownHooked = false;

  private static get maxConcurrency(): number {
    const n = Number(process.env.POSTER_RENDER_CONCURRENCY);
    return Number.isFinite(n) && n > 0 ? n : 2;
  }

  private static get recycleAfter(): number {
    const n = Number(process.env.POSTER_BROWSER_RECYCLE_AFTER);
    return Number.isFinite(n) && n > 0 ? n : 200;
  }

  public static async getBrowser(): Promise<Browser> {
    if (this.browserInstance?.isConnected()) {
      return this.browserInstance;
    }
    if (!this.launchPromise) {
      this.launchPromise = this.launch().finally(() => {
        this.launchPromise = null;
      });
    }
    return this.launchPromise;
  }

  private static async launch(): Promise<Browser> {
    this.hookShutdown();
    const executablePath = process.env.CHROMIUM_EXECUTABLE_PATH || undefined;

    try {
      const browser = await chromium.launch({
        headless: true,
        executablePath,
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-gpu',
          '--no-zygote',
          '--disable-extensions',
          '--disable-background-networking',
          '--disable-default-apps',
          '--disable-sync',
          '--mute-audio',
          '--hide-scrollbars',
          '--font-render-hinting=none',
        ],
      });

      browser.on('disconnected', () => {
        console.warn('[BrowserSingleton] Chromium terputus. Akan diluncurkan ulang pada render berikutnya.');
        if (BrowserSingleton.browserInstance === browser) {
          BrowserSingleton.browserInstance = null;
        }
      });

      this.browserInstance = browser;
      this.renderCount = 0;
      console.log(
        `[BrowserSingleton] Chromium siap (${executablePath || 'playwright-bundled'}, v${browser.version()}).`
      );
      return browser;
    } catch (err: any) {
      throw new Error(
        `[BrowserSingleton] Gagal meluncurkan Chromium (${executablePath || 'playwright-bundled'}). ` +
          `Pastikan Chromium terpasang (Docker: apk add chromium + CHROMIUM_EXECUTABLE_PATH, ` +
          `lokal: npx playwright install chromium). Detail: ${err?.message || err}`
      );
    }
  }

  private static async acquireSlot(): Promise<void> {
    if (this.activeRenders < this.maxConcurrency) {
      this.activeRenders++;
      return;
    }
    await new Promise<void>((resolve) => this.waitQueue.push(resolve));
    this.activeRenders++;
  }

  private static releaseSlot(): void {
    this.activeRenders--;
    const next = this.waitQueue.shift();
    if (next) next();
  }

  /**
   * Merender HTML string menjadi Buffer WebP menggunakan Ephemeral BrowserContext.
   * Retry 1x otomatis bila browser crash di tengah render.
   */
  public static async renderHtml(html: string, options: RenderHtmlOptions = {}): Promise<Buffer> {
    await this.acquireSlot();
    try {
      try {
        return await this.renderOnce(html, options);
      } catch (firstErr: any) {
        const message = String(firstErr?.message || firstErr);
        const isCrash = /closed|crash|disconnected|Target page|has been closed|Protocol error/i.test(message);
        if (!isCrash) throw firstErr;

        console.warn(`[BrowserSingleton] Render gagal karena crash (${message}). Reset browser & retry 1x...`);
        await this.resetBrowser();
        return await this.renderOnce(html, options);
      }
    } finally {
      this.releaseSlot();
      await this.maybeRecycle();
    }
  }

  private static async renderOnce(html: string, options: RenderHtmlOptions): Promise<Buffer> {
    const { width = 1080, height = 1350, quality = 90, timeoutMs = 20000 } = options;
    const browser = await this.getBrowser();

    let context: BrowserContext | null = null;
    let page: Page | null = null;
    try {
      context = await browser.newContext({
        viewport: { width, height },
        deviceScaleFactor: 1,
      });

      // Network lockdown: hanya izinkan data:/about: (semua aset sudah inline)
      await context.route('**/*', (route) => {
        const url = route.request().url();
        if (url.startsWith('data:') || url.startsWith('about:')) {
          return route.continue();
        }
        return route.abort('blockedbyclient');
      });

      page = await context.newPage();
      page.setDefaultTimeout(timeoutMs);

      await page.setContent(html, { waitUntil: 'load', timeout: timeoutMs });

      // Pastikan seluruh @font-face sudah ter-decode sebelum screenshot
      await page.evaluate('document.fonts.ready').catch(() => undefined);

      const screenshot = await page.screenshot({
        type: 'png',
        fullPage: false,
        timeout: timeoutMs,
      });

      this.renderCount++;
      // Konversi PNG -> WebP di sisi Sharp memberi kontrol kualitas yang konsisten
      return await sharp(screenshot).webp({ quality, effort: 4 }).toBuffer();
    } finally {
      if (page) await page.close().catch(() => {});
      if (context) await context.close().catch(() => {});
    }
  }

  private static async maybeRecycle(): Promise<void> {
    if (this.renderCount >= this.recycleAfter && this.activeRenders === 0) {
      console.log(`[BrowserSingleton] Recycle Chromium setelah ${this.renderCount} render.`);
      await this.resetBrowser();
    }
  }

  private static async resetBrowser(): Promise<void> {
    const old = this.browserInstance;
    this.browserInstance = null;
    if (old) await old.close().catch(() => {});
  }

  private static hookShutdown(): void {
    if (this.shutdownHooked) return;
    this.shutdownHooked = true;
    const shutdown = () => {
      void this.close();
    };
    process.once('SIGTERM', shutdown);
    process.once('SIGINT', shutdown);
    process.once('beforeExit', shutdown);
  }

  public static async close(): Promise<void> {
    await this.resetBrowser();
  }
}
