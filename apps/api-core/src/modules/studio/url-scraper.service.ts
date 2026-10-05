import { Injectable, Logger } from '@nestjs/common';

export interface ScrapedWebSource {
  url: string;
  title: string;
  content: string;
  sourceDomain: string;
}

@Injectable()
export class UrlScraperService {
  private readonly logger = new Logger(UrlScraperService.name);

  /**
   * Ekstrak seluruh tautan HTTP/HTTPS dari string prompt bebas pengguna
   */
  public extractUrlsFromText(text: string): string[] {
    if (!text) return [];
    const urlRegex = /(https?:\/\/[^\s]+)/gi;
    const matches = text.match(urlRegex) || [];
    // Bersihkan karakter penutup seperti tanda kurung atau titik
    return Array.from(
      new Set(
        matches.map((u) => u.replace(/[.,;!?)\]}>]+$/, ''))
      )
    );
  }

  /**
   * Mengikis dan membersihkan konten teks dari sekumpulan URL secara paralel
   */
  public async scrapeMultipleUrls(urls: string[]): Promise<ScrapedWebSource[]> {
    if (!urls || urls.length === 0) return [];

    const uniqueUrls = Array.from(new Set(urls.filter((u) => u.startsWith('http://') || u.startsWith('https://'))));
    const results: ScrapedWebSource[] = [];

    await Promise.all(
      uniqueUrls.slice(0, 5).map(async (url) => {
        try {
          const scraped = await this.scrapeSingleUrl(url);
          if (scraped) {
            results.push(scraped);
          }
        } catch (err: any) {
          this.logger.warn(`Gagal mengambil konten dari URL ${url}: ${err.message}`);
        }
      })
    );

    return results;
  }

  /**
   * Mengambil dan mengekstrak teks utama dari 1 URL
   */
  public async scrapeSingleUrl(targetUrl: string): Promise<ScrapedWebSource | null> {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 6000); // 6 detik batas timeout

    try {
      const parsedUrl = new URL(targetUrl);
      const res = await fetch(targetUrl, {
        signal: controller.signal,
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36 PolarisPolicyBot/1.0',
          Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        },
      });

      if (!res.ok) {
        return null;
      }

      const html = await res.text();
      const titleMatch = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
      const title = titleMatch ? titleMatch[1].replace(/\s+/g, ' ').trim() : parsedUrl.hostname;

      // Hapus script, style, svg, header, footer, nav
      let clean = html
        .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, ' ')
        .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, ' ')
        .replace(/<svg\b[^<]*(?:(?!<\/svg>)<[^<]*)*<\/svg>/gi, ' ')
        .replace(/<nav\b[^<]*(?:(?!<\/nav>)<[^<]*)*<\/nav>/gi, ' ')
        .replace(/<footer\b[^<]*(?:(?!<\/footer>)<[^<]*)*<\/footer>/gi, ' ')
        .replace(/<header\b[^<]*(?:(?!<\/header>)<[^<]*)*<\/header>/gi, ' ')
        .replace(/<aside\b[^<]*(?:(?!<\/aside>)<[^<]*)*<\/aside>/gi, ' ');

      // Cari tag article atau main jika ada
      const articleMatch = clean.match(/<article[^>]*>([\s\S]*?)<\/article>/i);
      const mainMatch = clean.match(/<main[^>]*>([\s\S]*?)<\/main>/i);
      const rawBody = articleMatch ? articleMatch[1] : mainMatch ? mainMatch[1] : clean;

      // Konversi tag paragraf dan baris
      const text = rawBody
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

      // Ambil 1.500 karakter pertama yang padat informasi
      const truncatedText = text.slice(0, 1800);

      return {
        url: targetUrl,
        title,
        content: truncatedText || 'Tidak ada teks yang dapat diekstrak.',
        sourceDomain: parsedUrl.hostname,
      };
    } catch {
      return null;
    } finally {
      clearTimeout(timeout);
    }
  }
}
