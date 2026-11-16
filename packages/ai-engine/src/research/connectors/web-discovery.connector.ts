import { createHash } from 'node:crypto';
import { Readability } from '@mozilla/readability';
import { parseHTML } from 'linkedom';
import { assertSafePublicUrl, canonicalizeUrl } from '../utils/url-security.util.js';

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
   * Mengekstrak judul dan teks artikel bersih dari HTML menggunakan @mozilla/readability + linkedom,
   * dengan fallback pembersihan tag HTML jika struktur halaman non-standar.
   */
  public static extractReadableArticle(
    html: string,
    pageUrl: string
  ): { title: string; extractedText: string; siteName?: string } {
    const parsedUrl = new URL(pageUrl);

    try {
      const { document } = parseHTML(html);
      const reader = new Readability(document as unknown as ConstructorParameters<typeof Readability>[0]);
      const article = reader.parse();
      const readableText = (article?.textContent || '')
        .replace(/[ \t]+/g, ' ')
        .replace(/\n\s*\n+/g, '\n\n')
        .trim();

      if (readableText.length >= 120) {
        return {
          title: (article?.title || parsedUrl.hostname).replace(/\s+/g, ' ').trim(),
          extractedText: readableText.slice(0, 6000),
          siteName: article?.siteName?.trim() || undefined,
        };
      }
    } catch {
      // Lanjut ke fallback pembersihan tag HTML
    }

    const titleMatch = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
    const title = titleMatch ? titleMatch[1].replace(/\s+/g, ' ').trim() : parsedUrl.hostname;

    const cleanHtml = html
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, ' ')
      .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, ' ')
      .replace(/<svg\b[^<]*(?:(?!<\/svg>)<[^<]*)*<\/svg>/gi, ' ')
      .replace(/<nav\b[^<]*(?:(?!<\/nav>)<[^<]*)*<\/nav>/gi, ' ')
      .replace(/<footer\b[^<]*(?:(?!<\/footer>)<[^<]*)*<\/footer>/gi, ' ')
      .replace(/<header\b[^<]*(?:(?!<\/header>)<[^<]*)*<\/header>/gi, ' ')
      .replace(/<aside\b[^<]*(?:(?!<\/aside>)<[^<]*)*<\/aside>/gi, ' ');

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

    return {
      title,
      extractedText: extractedText.slice(0, 6000),
    };
  }

  /**
   * Mengambil dan mengekstrak teks substantif dari sebuah URL publik yang tervalidasi SSRF
   */
  public static async fetchUrl(targetUrl: string): Promise<FetchedWebContent | null> {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 7000);

    try {
      const parsedUrl = await assertSafePublicUrl(targetUrl);
      const safeUrl = parsedUrl.toString();

      const response = await fetch(safeUrl, {
        signal: controller.signal,
        redirect: 'follow',
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

      const finalUrl = response.url ? canonicalizeUrl(response.url) || safeUrl : safeUrl;
      const finalParsed = await assertSafePublicUrl(finalUrl);

      const html = await response.text();
      const { title, extractedText, siteName } = this.extractReadableArticle(html, finalUrl);
      const contentHash = this.hashContent(extractedText);

      return {
        url: safeUrl,
        canonicalUrl: finalUrl,
        domain: finalParsed.hostname,
        title,
        rawContent: html.slice(0, 8000),
        extractedText,
        contentHash,
        httpStatus,
        publisherName: siteName || finalParsed.hostname.replace(/^www\./, ''),
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
