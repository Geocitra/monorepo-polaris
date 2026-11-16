import { AiTelemetryService } from '../../telemetry/ai-telemetry.service.js';
import { canonicalizeUrl } from '../utils/url-security.util.js';
import {
  ISearchDiscoveryProvider,
  SearchDiscoveryItem,
  SearchDiscoveryOptions,
  SearchQuotaGuard,
} from './search-discovery.types.js';

export class TavilySearchAdapter implements ISearchDiscoveryProvider {
  public readonly providerName = 'TAVILY' as const;
  private readonly quotaGuard?: SearchQuotaGuard;

  constructor(quotaGuard?: SearchQuotaGuard) {
    this.quotaGuard = quotaGuard;
  }

  public async searchNews(options: SearchDiscoveryOptions): Promise<SearchDiscoveryItem[]> {
    const apiKey = process.env.TAVILY_API_KEY?.trim();
    if (!apiKey || !options.query?.trim()) {
      return [];
    }

    if (this.quotaGuard) {
      const allowed = await this.quotaGuard.tryConsume('TAVILY');
      if (!allowed) {
        console.warn('[TavilySearchAdapter] Kuota harian Tavily tercapai, melewati pencarian.');
        return [];
      }
    }

    const days = options.timeRange === 'day' ? 1 : options.timeRange === 'month' ? 30 : 7;

    const telemetry = AiTelemetryService.startTrace({
      operation: 'tavily-news-discovery',
      model: 'tavily-basic-news',
      tenantId: options.tenantId,
      inputPayload: { query: options.query, locale: options.locale || 'id', days },
    });

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);

    try {
      const response = await fetch('https://api.tavily.com/search', {
        method: 'POST',
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          api_key: apiKey,
          query: options.query.trim(),
          topic: 'news',
          search_depth: 'basic',
          days,
          max_results: Math.min(options.maxResults || 5, 8),
          include_answer: false,
          include_raw_content: false,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const payload = (await response.json()) as {
        results?: Array<{
          title?: string;
          url?: string;
          content?: string;
          score?: number;
          published_date?: string;
        }>;
      };

      const items: SearchDiscoveryItem[] = [];
      for (const raw of payload.results || []) {
        if (!raw.url || !raw.title) continue;
        const canonical = canonicalizeUrl(raw.url);
        if (!canonical) continue;

        const parsedDate = raw.published_date ? new Date(raw.published_date) : undefined;
        items.push({
          title: raw.title.trim(),
          url: raw.url.trim(),
          canonicalUrl: canonical,
          snippet: (raw.content || '').trim().slice(0, 1200),
          sourceName: new URL(canonical).hostname.replace(/^www\./, ''),
          publishedAt: parsedDate && !Number.isNaN(parsedDate.getTime()) ? parsedDate : undefined,
          provider: 'TAVILY',
          score: typeof raw.score === 'number' ? raw.score : undefined,
        });
      }

      await telemetry.endTrace({
        inputTokens: 0,
        outputTokens: 0,
        status: 'SUCCESS',
        outputSummary: `Tavily returned ${items.length} news items`,
      });

      return items;
    } catch (err: any) {
      await telemetry.endTrace({
        inputTokens: 0,
        outputTokens: 0,
        status: 'FAILED',
        errorMessage: err?.message,
      });
      console.warn(`[TavilySearchAdapter] Gagal mencari berita: ${err?.message}`);
      return [];
    } finally {
      clearTimeout(timeout);
    }
  }
}

