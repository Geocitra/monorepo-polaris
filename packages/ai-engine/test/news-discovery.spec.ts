import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { SerperSearchAdapter } from '../src/research/connectors/serper-search.adapter.js';
import { TavilySearchAdapter } from '../src/research/connectors/tavily-search.adapter.js';
import { GoogleNewsRssAdapter } from '../src/research/connectors/google-news-rss.adapter.js';
import { NewsDiscoveryCoordinator } from '../src/research/services/news-discovery.coordinator.js';
import { WebDiscoveryConnector } from '../src/research/connectors/web-discovery.connector.js';
import { SearchQuotaGuard } from '../src/research/connectors/search-discovery.types.js';

describe('Fase 2 & 3 News Discovery - Serper, Tavily, Google News RSS & Quota Guard', () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    vi.restoreAllMocks();
    process.env.SERPER_API_KEY = 'test-serper-key';
    process.env.TAVILY_API_KEY = 'test-tavily-key';
  });

  afterEach(() => {
    process.env = { ...originalEnv };
  });

  it('SerperSearchAdapter harus mematuhi QuotaGuard dan mengirim gl=id/hl=id secara default', async () => {
    const mockFetch = vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(
      new Response(
        JSON.stringify({
          news: [
            {
              title: 'Pupuk Subsidi Jawa Barat Lancar',
              link: 'https://jabar.antaranews.com/berita/1?utm_source=test',
              snippet: 'Distribusi pupuk subsidi meningkat.',
              source: 'ANTARA Jabar',
            },
          ],
        }),
        { status: 200 }
      )
    );

    const guard: SearchQuotaGuard = { tryConsume: vi.fn().mockResolvedValue(true) };
    const adapter = new SerperSearchAdapter(guard);
    const items = await adapter.searchNews({ query: 'pupuk subsidi jawa barat', locale: 'id' });

    expect(guard.tryConsume).toHaveBeenCalledWith('SERPER');
    const serperCalls = mockFetch.mock.calls.filter(([url]) => url === 'https://google.serper.dev/news');
    expect(serperCalls).toHaveLength(1);
    const body = JSON.parse((serperCalls[0][1] as RequestInit).body as string);
    expect(body.gl).toBe('id');
    expect(body.hl).toBe('id');
    expect(items[0].canonicalUrl).toBe('https://jabar.antaranews.com/berita/1');
  });

  it('TavilySearchAdapter harus berhenti tanpa memanggil API jika QuotaGuard menolak', async () => {
    const mockFetch = vi.spyOn(globalThis, 'fetch');
    const guard: SearchQuotaGuard = { tryConsume: vi.fn().mockResolvedValue(false) };

    const adapter = new TavilySearchAdapter(guard);
    const items = await adapter.searchNews({ query: 'tarif ekspor cpo' });

    expect(items).toEqual([]);
    const tavilyCalls = mockFetch.mock.calls.filter(([url]) => url === 'https://api.tavily.com/search');
    expect(tavilyCalls).toHaveLength(0);
  });

  it('NewsDiscoveryCoordinator harus memprioritaskan Google News RSS dan TIDAK memanggil API berbayar jika hasil gratis cukup', async () => {
    vi.spyOn(GoogleNewsRssAdapter.prototype, 'searchNews').mockResolvedValueOnce([
      {
        title: 'Berita 1',
        url: 'https://news.detik.com/1',
        canonicalUrl: 'https://news.detik.com/1',
        snippet: 'Snippet 1',
        sourceName: 'Detik',
        provider: 'GOOGLE_NEWS_RSS',
      },
      {
        title: 'Berita 2',
        url: 'https://antaranews.com/2',
        canonicalUrl: 'https://antaranews.com/2',
        snippet: 'Snippet 2',
        sourceName: 'ANTARA',
        provider: 'GOOGLE_NEWS_RSS',
      },
    ]);

    const tavilySpy = vi.spyOn(TavilySearchAdapter.prototype, 'searchNews');
    const serperSpy = vi.spyOn(SerperSearchAdapter.prototype, 'searchNews');
    vi.spyOn(WebDiscoveryConnector, 'fetchMultipleUrls').mockResolvedValueOnce([]);

    const result = await NewsDiscoveryCoordinator.discoverAndFetchArticles({
      queries: ['pupuk subsidi'],
      allowPaidFallback: true,
    });

    expect(result.discoveredItems).toHaveLength(2);
    expect(tavilySpy).not.toHaveBeenCalled();
    expect(serperSpy).not.toHaveBeenCalled();
  });

  it('NewsDiscoveryCoordinator harus memanggil Tavily fallback hanya jika hasil Google News RSS < 2', async () => {
    vi.spyOn(GoogleNewsRssAdapter.prototype, 'searchNews').mockResolvedValueOnce([]);
    const tavilySpy = vi.spyOn(TavilySearchAdapter.prototype, 'searchNews').mockResolvedValueOnce([
      {
        title: 'Berita Tavily',
        url: 'https://katadata.co.id/berita/1',
        canonicalUrl: 'https://katadata.co.id/berita/1',
        snippet: 'Analisis mendalam.',
        sourceName: 'Katadata',
        provider: 'TAVILY',
      },
    ]);
    vi.spyOn(SerperSearchAdapter.prototype, 'searchNews').mockResolvedValueOnce([]);
    vi.spyOn(WebDiscoveryConnector, 'fetchMultipleUrls').mockResolvedValueOnce([]);

    const result = await NewsDiscoveryCoordinator.discoverAndFetchArticles({
      queries: ['kebijakan energi bersih'],
      allowPaidFallback: true,
      preferredPaidProvider: 'TAVILY',
    });

    expect(tavilySpy).toHaveBeenCalledTimes(1);
    expect(result.discoveredItems).toHaveLength(1);
    expect(result.discoveredItems[0].provider).toBe('TAVILY');
  });
});

