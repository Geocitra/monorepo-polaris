import { db, mediaDiscourses, findSimilarKnowledgeChunks, SimilarChunkResult, sql, desc } from '@polaris/database';


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

    // 2. Ambil Diskursus Berita Media Lokal dari tabel media_discourses
    let news: InternalMediaDiscourseMatch[] = [];
    try {
      const region = params.targetRegion.toUpperCase();
      const whereClause = sql`
        (${mediaDiscourses.regionScope} = ${region} OR ${mediaDiscourses.regionScope} = 'NASIONAL' OR ${mediaDiscourses.regionScope} = 'ALL')
        ${params.policySector ? sql`AND (${mediaDiscourses.sector} = ${params.policySector} OR ${mediaDiscourses.sector} IS NULL)` : sql``}
      `;

      const rows = await db
        .select({
          id: mediaDiscourses.id,
          portalName: mediaDiscourses.newsPortalName,
          articleTitle: mediaDiscourses.articleTitle,
          cleanSummary: mediaDiscourses.cleanSummary,
          originalUrl: mediaDiscourses.originalUrl,
          sentimentScore: mediaDiscourses.sentimentScore,
          sector: mediaDiscourses.sector,
          publishedAt: mediaDiscourses.publishedAt,
        })
        .from(mediaDiscourses)
        .where(whereClause)
        .orderBy(desc(mediaDiscourses.publishedAt))
        .limit(maxNews);

      news = rows;
    } catch (err: any) {
      console.warn(`[InternalKnowledgeConnector] Gagal mengambil media discourses: ${err.message}`);
    }

    return {
      regulations,
      news,
    };
  }
}
