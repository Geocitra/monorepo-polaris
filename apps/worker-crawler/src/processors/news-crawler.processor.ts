import Parser from 'rss-parser';
import {
  db,
  mediaDiscourses,
  tenantMembers,
  electoralDistricts,
  tenantNewsMatches,
  eq,
  desc,
} from '@polaris/database';
import {
  canonicalizeUrl,
  WebDiscoveryConnector,
  NewsEnrichmentService,
  NewsDiscoveryCoordinator,
  resolveRegionScopes,
} from '@polaris/ai-engine';
import { CivicRelevanceGatekeeper } from './civic-relevance-gatekeeper.js';
import { redisSearchQuotaGuard } from '../services/search-quota.guard.js';

export interface ScraperJobPayload {
  jobType?: 'RSS_FEED' | 'INTEREST_CLUSTER_DISCOVERY';
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

      const cleanUrl = canonicalizeUrl(item.link.trim());
      if (!cleanUrl) {
        rejectedCount++;
        continue;
      }
      const cleanTitle = Array.from(item.title.trim()).slice(0, 255).join('');
      const rawContent = item.contentSnippet || item.content || cleanTitle;
      const snippetSummary = this.cleanHtmlText(rawContent).slice(0, 500);
      const assessment = CivicRelevanceGatekeeper.assess(cleanTitle, snippetSummary);
      if (!assessment.accepted || !assessment.sector) {
        rejectedCount++;
        continue;
      }

      const publishedAt = new Date(item.isoDate || item.pubDate || '');
      if (Number.isNaN(publishedAt.getTime())) {
        rejectedCount++;
        continue;
      }

      // Fetch artikel penuh + AI enrichment (fallback aman ke snippet RSS bila portal memblokir fetch)
      const fetched = await WebDiscoveryConnector.fetchUrl(cleanUrl);
      const bodyText = fetched?.extractedText && fetched.extractedText.length >= 120
        ? fetched.extractedText
        : snippetSummary;

      const enriched = await NewsEnrichmentService.enrichArticle({
        title: cleanTitle,
        bodyText,
        fallbackSector: assessment.sector,
        fallbackSentiment: this.calculateQuickSentiment(`${cleanTitle} ${snippetSummary}`),
      });

      const [inserted] = await db
        .insert(mediaDiscourses)
        .values({
          regionScope: payload.regionScope,
          newsPortalName: payload.sourceName,
          originalUrl: cleanUrl,
          canonicalUrl: fetched?.canonicalUrl || cleanUrl,
          contentHash: fetched?.contentHash || WebDiscoveryConnector.hashContent(bodyText),
          articleTitle: cleanTitle,
          cleanSummary: enriched.cleanSummary,
          fullTextExcerpt: bodyText.slice(0, 4000),
          sentimentScore: enriched.sentimentScore,
          sector: enriched.sector || assessment.sector,
          relevanceScore: assessment.relevanceScore,
          primaryKeywords: assessment.matchedKeywords,
          entities: enriched.entities,
          vectorEmbedding: enriched.embedding,
          discoveryChannel: 'RSS',
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

  /**
   * Mengagregasi minat isu (issueInterests) + wilayah seluruh tenant aktif,
   * mencari berita secara hemat kuota (Google News RSS + Serper fallback), lalu mencatat kecocokan ke tenant_news_matches.
   */
  public static async processInterestClusterDiscovery(): Promise<{
    insertedCount: number;
    rejectedCount: number;
  }> {
    const activeMembers = await db
      .select({
        tenantId: tenantMembers.id,
        issueInterests: tenantMembers.issueInterests,
        personalCoverage: tenantMembers.personalCoverage,
        provinceName: electoralDistricts.provinceName,
      })
      .from(tenantMembers)
      .leftJoin(electoralDistricts, eq(tenantMembers.electoralDistrictId, electoralDistricts.id))
      .where(eq(tenantMembers.accountStatus, 'ACTIVE'));

    // Deduplikasi cluster (interest + region) lintas tenant agar tidak boros kuota
    const clusters = new Map<string, { interest: string; region: string }>();
    for (const member of activeMembers) {
      const interests = (member.issueInterests || []).map((i) => i.trim()).filter(Boolean);
      const region = member.provinceName || member.personalCoverage?.[0] || 'Indonesia';
      for (const interest of interests.slice(0, 3)) {
        const key = `${interest.toLowerCase()}::${region.toLowerCase()}`;
        if (!clusters.has(key)) {
          clusters.set(key, { interest, region });
        }
      }
    }

    let insertedCount = 0;
    let rejectedCount = 0;

    // Batasi maksimal 8 cluster per siklus terjadwal untuk menjaga efisiensi
    for (const cluster of Array.from(clusters.values()).slice(0, 8)) {
      const query = `${cluster.interest} ${cluster.region}`.trim();
      const discovery = await NewsDiscoveryCoordinator.discoverAndFetchArticles({
        queries: [query],
        locale: 'id',
        targetRegion: cluster.region,
        maxUrlsToFetch: 3,
        allowPaidFallback: true,
        preferredPaidProvider: 'SERPER',
        quotaGuard: redisSearchQuotaGuard,
        cacheToMediaDiscourses: false,
      });

      const regionScope =
        cluster.region.toUpperCase().replace(/[^A-Z0-9]+/g, '_').slice(0, 100) || 'NASIONAL';

      for (const article of discovery.fetchedArticles) {
        if (!article.extractedText || article.extractedText.length < 120) {
          rejectedCount++;
          continue;
        }

        const assessment = CivicRelevanceGatekeeper.assess(article.title, article.extractedText.slice(0, 600));
        const enriched = await NewsEnrichmentService.enrichArticle({
          title: article.title,
          bodyText: article.extractedText,
          fallbackSector: assessment.sector,
          fallbackSentiment: this.calculateQuickSentiment(`${article.title} ${article.extractedText.slice(0, 400)}`),
        });

        const [inserted] = await db
          .insert(mediaDiscourses)
          .values({
            regionScope,
            newsPortalName: (article.publisherName || article.domain).slice(0, 100),
            originalUrl: article.canonicalUrl,
            canonicalUrl: article.canonicalUrl,
            contentHash: article.contentHash,
            articleTitle: article.title.slice(0, 255),
            cleanSummary: enriched.cleanSummary,
            fullTextExcerpt: article.extractedText.slice(0, 4000),
            sentimentScore: enriched.sentimentScore,
            sector: enriched.sector || assessment.sector,
            relevanceScore: assessment.relevanceScore || 0.7,
            primaryKeywords: assessment.matchedKeywords,
            entities: enriched.entities,
            vectorEmbedding: enriched.embedding,
            discoveryChannel: 'SERPER',
            publishedAt: new Date(),
          })
          .onConflictDoNothing({ target: mediaDiscourses.originalUrl })
          .returning({ id: mediaDiscourses.id });

        if (inserted) {
          insertedCount++;
        }
      }
    }

    // Sinkronkan kecocokan berita terbaru ke tenant_news_matches untuk radar isu tiap user
    const recentNews = await db
      .select({
        id: mediaDiscourses.id,
        regionScope: mediaDiscourses.regionScope,
        articleTitle: mediaDiscourses.articleTitle,
        cleanSummary: mediaDiscourses.cleanSummary,
      })
      .from(mediaDiscourses)
      .orderBy(desc(mediaDiscourses.publishedAt))
      .limit(50);

    for (const member of activeMembers) {
      const interests = (member.issueInterests || []).map((i) => i.trim()).filter(Boolean);
      if (interests.length === 0) continue;
      const memberRegion = member.provinceName || member.personalCoverage?.[0] || 'NASIONAL';
      const allowedScopes = new Set(resolveRegionScopes(memberRegion));

      for (const news of recentNews) {
        if (!allowedScopes.has(news.regionScope)) continue;
        const haystack = `${news.articleTitle} ${news.cleanSummary}`.toLowerCase();
        const matchedInterest = interests.find((interest) =>
          haystack.includes(interest.toLowerCase())
        );
        if (!matchedInterest) continue;

        await db
          .insert(tenantNewsMatches)
          .values({
            tenantId: member.tenantId,
            discourseId: news.id,
            relevanceScore: 0.85,
            matchedInterest: matchedInterest.slice(0, 150),
          })
          .onConflictDoNothing();
      }
    }

    console.log(
      `[InterestClusterDiscovery] Selesai: ${insertedCount} berita baru, ${rejectedCount} dilewati.`
    );
    return { insertedCount, rejectedCount };
  }
}
