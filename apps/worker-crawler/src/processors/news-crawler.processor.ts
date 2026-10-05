import Parser from 'rss-parser';
import { db, mediaDiscourses } from '@polaris/database';
import { CivicRelevanceGatekeeper } from './civic-relevance-gatekeeper.js';

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
  public static async processFeedScraping(payload: ScraperJobPayload): Promise<{
    insertedCount: number;
    rejectedCount: number;
  }> {
    console.log(`[NewsCrawler] Memulai penyerapan berita untuk wilayah: ${payload.regionScope} dari ${payload.sourceName}...`);

    let feed;
    try {
      feed = await parser.parseURL(payload.feedUrl);
    } catch (error: any) {
      const message = error instanceof Error ? error.message : String(error);
      console.warn(`[NewsCrawler] Gagal membaca feed ${payload.feedUrl}: ${message}`);
      throw error;
    }

    let insertedCount = 0;
    let rejectedCount = 0;

    for (const item of feed.items) {
      if (!item.link || !item.title?.trim()) {
        rejectedCount++;
        continue;
      }

      let articleUrl: URL;
      try {
        articleUrl = new URL(item.link.trim());
      } catch {
        rejectedCount++;
        continue;
      }
      if (articleUrl.protocol !== 'http:' && articleUrl.protocol !== 'https:') {
        rejectedCount++;
        continue;
      }

      const cleanUrl = articleUrl.toString();
      const cleanTitle = Array.from(item.title.trim()).slice(0, 255).join('');
      const rawContent = item.contentSnippet || item.content || cleanTitle;
      const cleanSummary = this.cleanHtmlText(rawContent).slice(0, 500);
      const assessment = CivicRelevanceGatekeeper.assess(cleanTitle, cleanSummary);
      if (!assessment.accepted || !assessment.sector) {
        rejectedCount++;
        continue;
      }

      const publishedAt = new Date(item.isoDate || item.pubDate || '');
      if (Number.isNaN(publishedAt.getTime())) {
        rejectedCount++;
        continue;
      }

      const [inserted] = await db
        .insert(mediaDiscourses)
        .values({
          regionScope: payload.regionScope,
          newsPortalName: payload.sourceName,
          originalUrl: cleanUrl,
          articleTitle: cleanTitle,
          cleanSummary,
          sentimentScore: this.calculateQuickSentiment(`${cleanTitle} ${cleanSummary}`),
          sector: assessment.sector,
          relevanceScore: assessment.relevanceScore,
          primaryKeywords: assessment.matchedKeywords,
          publishedAt,
        })
        .onConflictDoNothing({ target: mediaDiscourses.originalUrl })
        .returning({ id: mediaDiscourses.id });

      if (inserted) {
        insertedCount++;
      }
    }

    console.log(
      `[NewsCrawler] Selesai untuk ${payload.regionScope}: ${insertedCount} berita relevan baru disimpan, ${rejectedCount} item ditolak.`
    );
    return { insertedCount, rejectedCount };
  }
}
