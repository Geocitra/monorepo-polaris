export interface AcademicPaperResult {
  title: string;
  doi: string;
  journalTitle?: string;
  authors: string[];
  publicationYear?: number;
  url: string;
  abstractSnippet?: string;
  isPeerReviewed: boolean;
  hasRetractionsOrCorrections: boolean;
  citationCount: number;
}

export class AcademicDiscoveryConnector {
  private static readonly CROSSREF_API_BASE = 'https://api.crossref.org/works';

  /**
   * Mencari metadata publikasi ilmiah dari Crossref API.
   * Crossref menyediakan REST API terbuka dengan metadata DOI resmi,
   * status jurnal, penerbit, dan riwayat pembaruan/retraksi.
   */
  public static async searchCrossref(query: string, maxRows: number = 3): Promise<AcademicPaperResult[]> {
    if (!query || query.trim().length === 0) return [];

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 6000);

    try {
      const searchUrl = new URL(this.CROSSREF_API_BASE);
      searchUrl.searchParams.set('query', query.trim());
      searchUrl.searchParams.set('rows', String(Math.min(maxRows, 5)));
      searchUrl.searchParams.set('sort', 'relevance');
      searchUrl.searchParams.set('mailto', 'polaris-research@polaris.id');

      const response = await fetch(searchUrl.toString(), {
        signal: controller.signal,
        headers: {
          'User-Agent': 'POLARIS-Academic-Connector/1.0 (mailto:polaris-research@polaris.id)',
          Accept: 'application/json',
        },
      });

      if (!response.ok) {
        return [];
      }

      const json = (await response.json()) as any;
      const items = json?.message?.items || [];
      const results: AcademicPaperResult[] = [];


      for (const item of items) {
        const title = Array.isArray(item.title) ? item.title[0] : item.title;
        if (!title || !item.DOI) continue;

        // Ambil tahun terbit
        const dateParts =
          item['published-print']?.['date-parts']?.[0] ||
          item['published-online']?.['date-parts']?.[0] ||
          item['created']?.['date-parts']?.[0];
        const publicationYear = dateParts ? dateParts[0] : undefined;

        // Ekstrak nama penulis
        const authors: string[] = (item.author || []).map(
          (a: any) => `${a.given ? a.given + ' ' : ''}${a.family || ''}`.trim()
        ).filter(Boolean);

        const journalTitle = Array.isArray(item['container-title'])
          ? item['container-title'][0]
          : item['container-title'];

        // Evaluasi status peer review:
        // Tipe journal-article pada Crossref terbit di jurnal ilmiah bereputasi
        const isJournal = item.type === 'journal-article' || item.type === 'proceedings-article';

        // Deteksi apakah ada sinyal koreksi atau retraksi dari field update-to
        const hasRetractionsOrCorrections = Boolean(
          item['update-to'] && Array.isArray(item['update-to']) && item['update-to'].length > 0
        );

        results.push({
          title,
          doi: item.DOI,
          journalTitle: journalTitle || item.publisher,
          authors,
          publicationYear,
          url: item.URL || `https://doi.org/${item.DOI}`,
          abstractSnippet: item.abstract ? item.abstract.replace(/<[^>]+>/g, '').slice(0, 500) : undefined,
          isPeerReviewed: isJournal,
          hasRetractionsOrCorrections,
          citationCount: item['is-referenced-by-count'] || 0,
        });
      }

      return results;
    } catch {
      return [];
    } finally {
      clearTimeout(timeout);
    }
  }
}
