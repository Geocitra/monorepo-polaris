import { db, mediaDiscourses } from '@polaris/database';
import { GoogleNewsRssAdapter } from '../connectors/google-news-rss.adapter.js';
import { SerperSearchAdapter } from '../connectors/serper-search.adapter.js';
import { TavilySearchAdapter } from '../connectors/tavily-search.adapter.js';
import {
  SearchDiscoveryItem,
  SearchQuotaGuard,
} from '../connectors/search-discovery.types.js';
import { FetchedWebContent, WebDiscoveryConnector } from '../connectors/web-discovery.connector.js';
import { canonicalizeUrl } from '../utils/url-security.util.js';

export interface TieredDiscoveryParams {
  queries: string[];
  locale?: 'id' | 'global';
  targetRegion?: string;
  tenantId?: string;
  maxUrlsToFetch?: number;
  allowPaidFallback?: boolean;
  preferredPaidProvider?: 'TAVILY' | 'SERPER';
  quotaGuard?: SearchQuotaGuard;
  cacheToMediaDiscourses?: boolean;
}

export class NewsDiscoveryCoordinator {
  /**
   * Menjalankan pencarian berita berjenjang:
   * 1) Google News RSS (gratis) terlebih dahulu
   * 2) Fallback berbayar (Tavily / Serper) hanya jika hasil gratis kurang & allowPaidFallback=true
   * 3) Fetch artikel penuh via WebDiscoveryConnector + opsional simpan ke media_discourses
   */
  public static async discoverAndFetchArticles(
    params: TieredDiscoveryParams
  ): Promise<{
    discoveredItems: SearchDiscoveryItem[];
    fetchedArticles: FetchedWebContent[];
  }> {
    const cleanQueries = Array.from(new Set(params.queries.map((q) => q.trim()).filter(Boolean))).slice(0, 2);
    if (cleanQueries.length === 0) {
      return { discoveredItems: [], fetchedArticles: [] };
    }

    const locale = params.locale === 'global' ? 'global' : 'id';
    const maxUrls = Math.min(params.maxUrlsToFetch || 4, 6);
    const seenUrls = new Set<string>();
    const discoveredItems: SearchDiscoveryItem[] = [];

    const addUnique = (items: SearchDiscoveryItem[]) => {
      for (const item of items) {
        if (!seenUrls.has(item.canonicalUrl)) {
          seenUrls.add(item.canonicalUrl);
          discoveredItems.push(item);
        }
      }
    };

    // Tier 1: Google News RSS (Gratis)
    const rssAdapter = new GoogleNewsRssAdapter();
    for (const q of cleanQueries) {
      const rssResults = await rssAdapter.searchNews({
        query: q,
        locale,
        maxResults: maxUrls,
      });
      addUnique(rssResults);
      if (discoveredItems.length >= maxUrls) break;
    }

    // Tier 2: Paid Search Fallback (Tavily / Serper) hanya jika hasil Tier 1 kurang
    if (params.allowPaidFallback && discoveredItems.length < 2) {
      const preferred = params.preferredPaidProvider || 'TAVILY';
      const primaryAdapter =
        preferred === 'SERPER'
          ? new SerperSearchAdapter(params.quotaGuard)
          : new TavilySearchAdapter(params.quotaGuard);
      const secondaryAdapter =
        preferred === 'SERPER'
          ? new TavilySearchAdapter(params.quotaGuard)
          : new SerperSearchAdapter(params.quotaGuard);

      const primaryResults = await primaryAdapter.searchNews({
        query: cleanQueries[0],
        locale,
        maxResults: maxUrls,
        tenantId: params.tenantId,
      });
      addUnique(primaryResults);

      if (discoveredItems.length < 2) {
        const secondaryResults = await secondaryAdapter.searchNews({
          query: cleanQueries[0],
          locale,
          maxResults: maxUrls,
          tenantId: params.tenantId,
        });
        addUnique(secondaryResults);
      }
    }

    const urlsToFetch = discoveredItems.slice(0, maxUrls).map((i) => i.url);
    const fetchedArticles =
      urlsToFetch.length > 0 ? await WebDiscoveryConnector.fetchMultipleUrls(urlsToFetch) : [];

    // Opsional: Cache hasil fetch ke media_discourses sebagai shared corpus (0 biaya untuk riset berikutnya)
    if (params.cacheToMediaDiscourses && fetchedArticles.length > 0) {
      const itemByCanonical = new Map(discoveredItems.map((i) => [i.canonicalUrl, i]));
      const regionScope = (params.targetRegion || 'NASIONAL')
        .toUpperCase()
        .replace(/[^A-Z0-9]+/g, '_')
        .slice(0, 100) || 'NASIONAL';

      for (const article of fetchedArticles) {
        if (!article.extractedText || article.extractedText.length < 100) continue;
        const matchedMeta = itemByCanonical.get(article.canonicalUrl);
        const canonical = canonicalizeUrl(article.canonicalUrl) || article.canonicalUrl;

        try {
          await db
            .insert(mediaDiscourses)
            .values({
              regionScope,
              newsPortalName: (article.publisherName || article.domain).slice(0, 100),
              originalUrl: canonical,
              canonicalUrl: canonical,
              contentHash: article.contentHash,
              articleTitle: article.title.slice(0, 255),
              cleanSummary: (matchedMeta?.snippet || article.extractedText).slice(0, 500),
              fullTextExcerpt: article.extractedText.slice(0, 4000),
              sentimentScore: 0,
              discoveryChannel: matchedMeta?.provider || 'SERPER',
              publishedAt: matchedMeta?.publishedAt || new Date(),
            })
            .onConflictDoNothing({ target: mediaDiscourses.originalUrl });
        } catch (err: any) {
          console.warn(`[NewsDiscoveryCoordinator] Gagal cache artikel ke media_discourses: ${err?.message}`);
        }
      }
    }

    return { discoveredItems, fetchedArticles };
  }
}

