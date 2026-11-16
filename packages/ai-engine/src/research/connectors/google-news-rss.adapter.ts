import { canonicalizeUrl } from '../utils/url-security.util.js';
import {
  ISearchDiscoveryProvider,
  SearchDiscoveryItem,
  SearchDiscoveryOptions,
} from './search-discovery.types.js';

function decodeXmlEntities(text: string): string {
  return text
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .trim();
}

export class GoogleNewsRssAdapter implements ISearchDiscoveryProvider {
  public readonly providerName = 'GOOGLE_NEWS_RSS' as const;

  public async searchNews(options: SearchDiscoveryOptions): Promise<SearchDiscoveryItem[]> {
    const query = options.query?.trim();
    if (!query) return [];

    const locale = options.locale === 'global' ? 'global' : 'id';
    const hl = locale === 'global' ? 'en-US' : 'id';
    const gl = locale === 'global' ? 'US' : 'ID';
    const ceid = locale === 'global' ? 'US:en' : 'ID:id';
    const feedUrl = `https://news.google.com/rss/search?q=${encodeURIComponent(query)}&hl=${hl}&gl=${gl}&ceid=${ceid}`;

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);

    try {
      const response = await fetch(feedUrl, {
        signal: controller.signal,
        headers: {
          'User-Agent': 'POLARIS-News-Discovery/1.0 (+https://polaris.id)',
          Accept: 'application/rss+xml, application/xml, text/xml',
        },
      });

      if (!response.ok) return [];
      const xml = await response.text();
      const maxResults = Math.min(options.maxResults || 6, 15);
      const itemMatches = xml.match(/<item>[\s\S]*?<\/item>/gi) || [];

      const items: SearchDiscoveryItem[] = [];
      for (const block of itemMatches.slice(0, maxResults)) {
        const titleMatch = block.match(/<title>([\s\S]*?)<\/title>/i);
        const linkMatch = block.match(/<link>([\s\S]*?)<\/link>/i);
        const pubDateMatch = block.match(/<pubDate>([\s\S]*?)<\/pubDate>/i);
        const sourceMatch = block.match(/<source[^>]*>([\s\S]*?)<\/source>/i);

        const rawTitle = titleMatch ? decodeXmlEntities(titleMatch[1]) : '';
        const rawLink = linkMatch ? decodeXmlEntities(linkMatch[1]) : '';
        const canonical = canonicalizeUrl(rawLink);
        if (!rawTitle || !canonical) continue;

        const parsedDate = pubDateMatch ? new Date(pubDateMatch[1].trim()) : undefined;
        items.push({
          title: rawTitle,
          url: rawLink,
          canonicalUrl: canonical,
          snippet: rawTitle,
          sourceName: sourceMatch ? decodeXmlEntities(sourceMatch[1]) : 'Google News',
          publishedAt: parsedDate && !Number.isNaN(parsedDate.getTime()) ? parsedDate : undefined,
          provider: 'GOOGLE_NEWS_RSS',
        });
      }

      return items;
    } catch (err: any) {
      console.warn(`[GoogleNewsRssAdapter] Gagal membaca RSS query "${query}": ${err?.message}`);
      return [];
    } finally {
      clearTimeout(timeout);
    }
  }
}

