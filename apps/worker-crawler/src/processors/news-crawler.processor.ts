import Parser from 'rss-parser';
import { eq } from 'drizzle-orm';
import { db, mediaDiscourses, electoralDistricts } from '@polaris/database';

export interface ScraperJobPayload {
  regionScope: string;
  feedUrl: string;
  sourceName: string;
}

const parser = new Parser({
  timeout: 10000,
  headers: {
    'User-Agent': 'POLARIS-Parliamentary-Crawler/1.0 (+https://polaris.id)',
  },
});

export class NewsCrawlerProcessor {
  /**
   * cleanHtmlText menghapus tag HTML dan spasi berlebih
   */
  private static cleanHtmlText(rawHtml: string): string {
    return rawHtml
      .replace(/<[^>]*>?/gm, '')
      .replace(/&nbsp;/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  /**
   * calculateQuickSentiment menghitung perkiraan polaritas sentimen dasar (-1.0 s/d +1.0)
   */
  private static calculateQuickSentiment(text: string): number {
    const lower = text.toLowerCase();
    const positiveKeywords = ['sukses', 'prestasi', 'bantuan', 'panen', 'pulih', 'turun', 'rampung', 'penghargaan'];
    const negativeKeywords = ['rusak', 'ambles', 'banjir', 'langka', 'demo', 'korupsi', 'gagal', 'keluhan', 'mahal'];

    let score = 0;
    positiveKeywords.forEach((w) => {
      if (lower.includes(w)) score += 0.2;
    });
    negativeKeywords.forEach((w) => {
      if (lower.includes(w)) score -= 0.25;
    });

    return Math.max(-1.0, Math.min(1.0, score));
  }

  /**
   * processFeedScraping mengonsumsi feed berita daerah dan menyimpannya ke PostgreSQL
   */
  public static async processFeedScraping(payload: ScraperJobPayload): Promise<{ insertedCount: number }> {
    console.log(`[NewsCrawler] Memulai penyerapan berita untuk wilayah: ${payload.regionScope} dari ${payload.sourceName}...`);

    let feed;
    try {
      feed = await parser.parseURL(payload.feedUrl);
    } catch (error: any) {
      console.warn(`[NewsCrawler] Gagal membaca feed ${payload.feedUrl}: ${error.message}`);
      return { insertedCount: 0 };
    }

    let insertedCount = 0;

    for (const item of feed.items) {
      if (!item.link || !item.title) continue;

      const cleanUrl = item.link.trim();
      const cleanTitle = item.title.trim();
      const rawContent = item.contentSnippet || item.content || cleanTitle;
      const cleanSummary = this.cleanHtmlText(rawContent).slice(0, 500);
      const sentimentScore = this.calculateQuickSentiment(`${cleanTitle} ${cleanSummary}`);
      const publishedAt = item.pubDate ? new Date(item.pubDate) : new Date();

      try {
        // Simpan berita dengan mekanisme ON CONFLICT DO NOTHING (Deduplikasi berbasis URL unik)
        const [inserted] = await db
          .insert(mediaDiscourses)
          .values({
            regionScope: payload.regionScope,
            newsPortalName: payload.sourceName,
            originalUrl: cleanUrl,
            articleTitle: cleanTitle,
            cleanSummary,
            sentimentScore,
            publishedAt,
          })
          .onConflictDoNothing({ target: mediaDiscourses.originalUrl })
          .returning({ id: mediaDiscourses.id });

        if (inserted) {
          insertedCount++;
        }
      } catch (err: any) {
        console.warn(`[NewsCrawler] Lewati artikel duplikat: ${cleanTitle}`);
      }
    }

    console.log(`[NewsCrawler] Selesai. ${insertedCount} berita baru tersimpan untuk wilayah ${payload.regionScope}.`);
    return { insertedCount };
  }
}
