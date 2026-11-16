import { AiTelemetryService } from '../../telemetry/ai-telemetry.service.js';
import { canonicalizeUrl } from '../utils/url-security.util.js';
import {
  ISearchDiscoveryProvider,
  SearchDiscoveryItem,
  SearchDiscoveryOptions,
  SearchQuotaGuard,
} from './search-discovery.types.js';

export class SerperSearchAdapter implements ISearchDiscoveryProvider {
  public readonly providerName = 'SERPER' as const;
  private readonly quotaGuard?: SearchQuotaGuard;

  constructor(quotaGuard?: SearchQuotaGuard) {
    this.quotaGuard = quotaGuard;
  }

  public async searchNews(options: SearchDiscoveryOptions): Promise<SearchDiscoveryItem[]> {
    const apiKey = process.env.SERPER_API_KEY?.trim();
    if (!apiKey || !options.query?.trim()) {
      return [];
    }

    if (this.quotaGuard) {
      const allowed = await this.quotaGuard.tryConsume('SERPER');
      if (!allowed) {
        console.warn('[SerperSearchAdapter] Kuota harian Serper tercapai, melewati pencarian.');
        return [];
      }
    }

    const locale = options.locale === 'global' ? 'global' : 'id';
    const gl = locale === 'global' ? 'us' : 'id';
    const hl = locale === 'global' ? 'en' : 'id';
    const tbs =
      options.timeRange === 'day'
        ? 'qdr:d'
        : options.timeRange === 'month'
          ? 'qdr:m'
          : 'qdr:w';

    const telemetry = AiTelemetryService.startTrace({
      operation: 'serper-news-discovery',
      model: 'serper-news-v1',
      tenantId: options.tenantId,
      inputPayload: { query: options.query, locale, maxResults: options.maxResults || 5 },
    });

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);

    try {
      const response = await fetch('https://google.serper.dev/news', {
        method: 'POST',
        signal: controller.signal,
        headers: {
          'X-API-KEY': apiKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          q: options.query.trim(),
          gl,
          hl,
          tbs,
          num: Math.min(options.maxResults || 5, 10),
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const payload = (await response.json()) as {
        news?: Array<{
          title?: string;
          link?: string;
          snippet?: string;
          source?: string;
          date?: string;
        }>;
      };

      const items: SearchDiscoveryItem[] = [];
      for (const raw of payload.news || []) {
        if (!raw.link || !raw.title) continue;
        const canonical = canonicalizeUrl(raw.link);
        if (!canonical) continue;

        const parsedDate = raw.date ? new Date(raw.date) : undefined;
        items.push({
          title: raw.title.trim(),
          url: raw.link.trim(),
          canonicalUrl: canonical,
          snippet: (raw.snippet || '').trim(),
          sourceName: (raw.source || new URL(canonical).hostname.replace(/^www\./, '')).trim(),
          publishedAt: parsedDate && !Number.isNaN(parsedDate.getTime()) ? parsedDate : undefined,
          provider: 'SERPER',
        });
      }

      await telemetry.endTrace({
        inputTokens: 0,
        outputTokens: 0,
        status: 'SUCCESS',
        outputSummary: `Serper returned ${items.length} news items`,
      });

      return items;
    } catch (err: any) {
      await telemetry.endTrace({
        inputTokens: 0,
        outputTokens: 0,
        status: 'FAILED',
        errorMessage: err?.message,
      });
      console.warn(`[SerperSearchAdapter] Gagal mencari berita: ${err?.message}`);
      return [];
    } finally {
      clearTimeout(timeout);
    }
  }
}

