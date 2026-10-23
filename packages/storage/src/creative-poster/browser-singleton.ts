import { chromium, type Browser, type BrowserContext } from 'playwright-core';

export interface RenderHtmlOptions {
  width?: number;
  height?: number;
  quality?: number;
  timeoutMs?: number;
}

export class BrowserSingleton {
  private static browserInstance: Browser | null = null;
  private static isLaunching = false;

  public static async getBrowser(): Promise<Browser> {
    if (this.browserInstance && this.browserInstance.isConnected()) {
      return this.browserInstance;
    }

    if (this.isLaunching) {
      // Wait for existing launch to complete
      for (let i = 0; i < 50; i++) {
        await new Promise((r) => setTimeout(r, 100));
        if (this.browserInstance && this.browserInstance.isConnected()) {
          return this.browserInstance;
        }
      }
    }

    this.isLaunching = true;
    try {
      this.browserInstance = await chromium.launch({
        headless: true,
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-gpu',
          '--no-zygote',
          '--disable-extensions',
        ],
      });

      this.browserInstance.on('disconnected', () => {
        console.warn('[BrowserSingleton] Chromium browser disconnected. Akan diinisialisasi ulang saat request berikutnya.');
        BrowserSingleton.browserInstance = null;
      });

      return this.browserInstance;
    } finally {
      this.isLaunching = false;
    }
  }

  /**
   * Merender HTML string menjadi Buffer WebP beresolusi tinggi menggunakan Ephemeral Tab Context.
   */
  public static async renderHtml(
    html: string,
    options: RenderHtmlOptions = {}
  ): Promise<Buffer> {
    const { width = 1080, height = 1350, quality = 90, timeoutMs = 10000 } = options;
    const browser = await this.getBrowser();

    let context: BrowserContext | null = null;
    try {
      context = await browser.newContext({
        viewport: { width, height },
        deviceScaleFactor: 1,
      });

      const page = await context.newPage();
      page.setDefaultTimeout(timeoutMs);

      await page.setContent(html, { waitUntil: 'domcontentloaded' });

      // Tunggu hingga seluruh Google Fonts selesai dimuat di render tree
      try {
        await page.evaluateHandle('document.fonts.ready');
      } catch {
        // Fallback jika fonts.ready timeout
      }

      const screenshotBuffer = await page.screenshot({
        type: 'webp',
        quality,
        omitBackground: true,
      });

      return Buffer.from(screenshotBuffer);
    } finally {
      if (context) {
        await context.close().catch(() => {});
      }
    }
  }

  public static async close(): Promise<void> {
    if (this.browserInstance) {
      await this.browserInstance.close().catch(() => {});
      this.browserInstance = null;
    }
  }
}
