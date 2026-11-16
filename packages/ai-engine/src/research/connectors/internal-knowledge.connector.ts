import {
  db,
  mediaDiscourses,
  findSimilarKnowledgeChunks,
  findSimilarMediaDiscourses,
  sql,
  desc,
} from '@polaris/database';
import { resolveRegionScopes } from '../utils/region-hierarchy.util.js';


export interface InternalRegulationMatch {
  chunkId: string;
  documentId: string;
  structuralReference: string;
  chunkContent: string;
  similarityScore: number;
}

export interface InternalMediaDiscourseMatch {
  id: string;
  portalName: string;
  articleTitle: string;
  cleanSummary: string;
  originalUrl: string;
  sentimentScore: number;
  sector: string | null;
  publishedAt: Date;
}

export interface InternalRetrievalParams {
  queryEmbedding?: number[];
  targetRegion: string;
  policySector?: string;
  keywords?: string[];
  maxRegulations?: number;
  maxNews?: number;
}

export interface InternalKnowledgeResult {
  regulations: InternalRegulationMatch[];
  news: InternalMediaDiscourseMatch[];
}

export class InternalKnowledgeConnector {
  /**
   * Mengambil pengetahuan internal: Regulasi Daerah (vektor HNSW) & Diskursus Berita Media (SQL filter)
   */
  public static async retrieveInternalKnowledge(
    params: InternalRetrievalParams
  ): Promise<InternalKnowledgeResult> {
    const maxRegulations = params.maxRegulations || 3;
    const maxNews = params.maxNews || 4;

    // 1. Ambil Regulasi via pgvector HNSW
    let regulations: InternalRegulationMatch[] = [];
    if (params.queryEmbedding && params.queryEmbedding.length === 1536) {
      try {
        const rawChunks = await findSimilarKnowledgeChunks(
          params.queryEmbedding,
          maxRegulations,
          params.targetRegion,
          0.55
        );
        regulations = rawChunks.map((c) => ({
          chunkId: c.id,
          documentId: c.documentId,
          structuralReference: c.structuralReference,
          chunkContent: c.chunkContent,
          similarityScore: c.similarityScore,
        }));
      } catch (err: any) {
        console.warn(`[InternalKnowledgeConnector] Gagal pencarian vektor regulasi: ${err.message}`);
      }
    }

    // 2. Ambil Diskursus Berita Media Lokal: Prioritaskan Vector Search (pgvector), lalu backfill SQL terbaru
    let news: InternalMediaDiscourseMatch[] = [];
    try {
      const regionScopes = resolveRegionScopes(params.targetRegion);
      const seenIds = new Set<string>();

      if (params.queryEmbedding && params.queryEmbedding.length === 1536) {
        const vectorNews = await findSimilarMediaDiscourses(
          params.queryEmbedding,
          regionScopes,
          params.policySector,
          maxNews,
          0.55
        );
        for (const item of vectorNews) {
          seenIds.add(item.id);
          news.push({
            id: item.id,
            portalName: item.portalName,
            articleTitle: item.articleTitle,
            cleanSummary: item.fullTextExcerpt || item.cleanSummary,
            originalUrl: item.originalUrl,
            sentimentScore: item.sentimentScore,
            sector: item.sector,
            publishedAt: new Date(item.publishedAt),
          });
        }
      }

      if (news.length < maxNews) {
        const remaining = maxNews - news.length;
        const whereClause = sql`
          ${mediaDiscourses.regionScope} IN (${sql.join(
            regionScopes.map((scope) => sql`${scope}`),
            sql`, `
          )})
          ${params.policySector ? sql`AND (${mediaDiscourses.sector} = ${params.policySector} OR ${mediaDiscourses.sector} IS NULL)` : sql``}
        `;

        const rows = await db
          .select({
            id: mediaDiscourses.id,
            portalName: mediaDiscourses.newsPortalName,
            articleTitle: mediaDiscourses.articleTitle,
            cleanSummary: mediaDiscourses.cleanSummary,
            fullTextExcerpt: mediaDiscourses.fullTextExcerpt,
            originalUrl: mediaDiscourses.originalUrl,
            sentimentScore: mediaDiscourses.sentimentScore,
            sector: mediaDiscourses.sector,
            publishedAt: mediaDiscourses.publishedAt,
          })
          .from(mediaDiscourses)
          .where(whereClause)
          .orderBy(desc(mediaDiscourses.publishedAt))
          .limit(remaining + seenIds.size);

        for (const row of rows) {
          if (seenIds.has(row.id) || news.length >= maxNews) continue;
          seenIds.add(row.id);
          news.push({
            id: row.id,
            portalName: row.portalName,
            articleTitle: row.articleTitle,
            cleanSummary: row.fullTextExcerpt || row.cleanSummary,
            originalUrl: row.originalUrl,
            sentimentScore: row.sentimentScore,
            sector: row.sector,
            publishedAt: row.publishedAt,
          });
        }
      }
    } catch (err: any) {
      console.warn(`[InternalKnowledgeConnector] Gagal mengambil media discourses: ${err.message}`);
    }

    return {
      regulations,
      news,
    };
  }
}
