export type SearchProviderName = 'SERPER' | 'TAVILY' | 'GOOGLE_NEWS_RSS';

export interface SearchDiscoveryOptions {
  query: string;
  locale?: 'id' | 'global';
  maxResults?: number;
  timeRange?: 'day' | 'week' | 'month';
  tenantId?: string;
}

export interface SearchDiscoveryItem {
  title: string;
  url: string;
  canonicalUrl: string;
  snippet: string;
  sourceName: string;
  publishedAt?: Date;
  provider: SearchProviderName;
  score?: number;
}

export interface SearchQuotaGuard {
  /**
   * Mengembalikan true jika kuota harian provider masih tersedia (dan mencatat 1 pemakaian).
   */
  tryConsume(provider: 'SERPER' | 'TAVILY'): Promise<boolean>;
}

export interface ISearchDiscoveryProvider {
  readonly providerName: SearchProviderName;
  searchNews(options: SearchDiscoveryOptions): Promise<SearchDiscoveryItem[]>;
}

