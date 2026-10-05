import { sql } from 'drizzle-orm';
import { db } from './client.js';

export interface SimilarChunkResult {
  id: string;
  documentId: string;
  structuralReference: string;
  chunkContent: string;
  similarityScore: number;
}

/**
 * Mencari potongan regulasi (knowledge chunks) yang relevan berdasarkan kedekatan semantik vektor.
 * Menggunakan indeks HNSW dengan metrik Cosine Distance (<=>).
 */
export async function findSimilarKnowledgeChunks(
  queryEmbedding: number[],
  limit: number = 3,
  regionScope?: string,
  minSimilarityScore: number = 0.60
): Promise<SimilarChunkResult[]> {
  // Validasi format embedding vektor (1536 float numbers)
  if (!Array.isArray(queryEmbedding) || queryEmbedding.length !== 1536) {
    throw new Error(`[VectorQueryError] Dimensi embedding tidak valid. Diterima: ${queryEmbedding?.length}, Diperlukan: 1536.`);
  }

  const sanitizedVectorString = `[${queryEmbedding.map((n) => (isNaN(n) ? 0 : n)).join(',')}]`;

  const results = await db.execute(sql`
    WITH vector_matches AS (
      SELECT
        kc.id,
        kc.document_id AS "documentId",
        kc.structural_reference AS "structuralReference",
        kc.chunk_content AS "chunkContent",
        (1 - (kc.vector_embedding <=> ${sanitizedVectorString}::vector)) AS "similarityScore"
      FROM knowledge_chunks kc
      JOIN knowledge_documents kd ON kc.document_id = kd.id
      WHERE kd.legal_status = 'BERLAKU'
      ${
        regionScope && regionScope !== 'ALL' && regionScope !== 'NASIONAL'
          ? sql`AND (kd.jurisdiction_region = ${regionScope} OR kd.jurisdiction_region = 'NASIONAL')`
          : sql``
      }
    )
    SELECT *
    FROM vector_matches
    WHERE "similarityScore" >= ${minSimilarityScore}
    ORDER BY "similarityScore" DESC
    LIMIT ${limit};
  `);

  return (results as unknown as SimilarChunkResult[]) || [];
}
