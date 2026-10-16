import { createHash } from 'node:crypto';

export interface FetchedWebContent {
  url: string;
  canonicalUrl: string;
  domain: string;
  title: string;
  rawContent: string;
  extractedText: string;
  contentHash: string;
  httpStatus: number;
  publisherName?: string;
}

export class WebDiscoveryConnector {
  /**
   * Menghitung hash SHA-256 dari teks untuk deteksi versi konten
   */
  public static hashContent(content: string): string {
    return createHash('sha256').update(content).digest('hex');
  }

  /**
   * Mengambil dan mengekstrak teks substantif dari sebuah URL
   */
  public static async fetchUrl(targetUrl: string): Promise<FetchedWebContent | null> {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 7000);

    try {
      const parsedUrl = new URL(targetUrl);
      const response = await fetch(targetUrl, {
        signal: controller.signal,
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36 PolarisResearchBot/2.0',
          Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        },
      });

      const httpStatus = response.status;
      if (!response.ok) {
        return null;
      }

      const html = await response.text();
      const titleMatch = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
      const title = titleMatch ? titleMatch[1].replace(/\s+/g, ' ').trim() : parsedUrl.hostname;

      // Pembersihan tag skrip, stylesheet, navigasi, dan footer
      const cleanHtml = html
        .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, ' ')
        .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, ' ')
        .replace(/<svg\b[^<]*(?:(?!<\/svg>)<[^<]*)*<\/svg>/gi, ' ')
        .replace(/<nav\b[^<]*(?:(?!<\/nav>)<[^<]*)*<\/nav>/gi, ' ')
        .replace(/<footer\b[^<]*(?:(?!<\/footer>)<[^<]*)*<\/footer>/gi, ' ')
        .replace(/<header\b[^<]*(?:(?!<\/header>)<[^<]*)*<\/header>/gi, ' ')
        .replace(/<aside\b[^<]*(?:(?!<\/aside>)<[^<]*)*<\/aside>/gi, ' ');

      // Targetkan tag konten utama
      const articleMatch = cleanHtml.match(/<article[^>]*>([\s\S]*?)<\/article>/i);
      const mainMatch = cleanHtml.match(/<main[^>]*>([\s\S]*?)<\/main>/i);
      const rawBody = articleMatch ? articleMatch[1] : mainMatch ? mainMatch[1] : cleanHtml;

      const extractedText = rawBody
        .replace(/<\/p>|<\/div>|<br\s*\/?>/gi, '\n')
        .replace(/<[^>]+>/g, ' ')
        .replace(/&nbsp;/g, ' ')
        .replace(/&amp;/g, '&')
        .replace(/&quot;/g, '"')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/[ \t]+/g, ' ')
        .replace(/\n\s*\n+/g, '\n\n')
        .trim();

      // Batasi 6.000 karakter representatif
      const cappedText = extractedText.slice(0, 6000);
      const contentHash = this.hashContent(cappedText);

      return {
        url: targetUrl,
        canonicalUrl: targetUrl.split('#')[0].split('?')[0],
        domain: parsedUrl.hostname,
        title,
        rawContent: html.slice(0, 8000),
        extractedText: cappedText,
        contentHash,
        httpStatus,
        publisherName: parsedUrl.hostname.replace(/^www\./, ''),
      };
    } catch {
      return null;
    } finally {
      clearTimeout(timeout);
    }
  }

  /**
   * Mengambil sekumpulan URL secara paralel dengan konkurensi terkontrol
   */
  public static async fetchMultipleUrls(urls: string[]): Promise<FetchedWebContent[]> {
    const validUrls = Array.from(
      new Set(urls.filter((u) => u && (u.startsWith('http://') || u.startsWith('https://'))))
    ).slice(0, 6);

    const settled = await Promise.allSettled(validUrls.map((u) => this.fetchUrl(u)));
    const results: FetchedWebContent[] = [];

    for (const item of settled) {
      if (item.status === 'fulfilled' && item.value) {
        results.push(item.value);
      }
    }

    return results;
  }
}
