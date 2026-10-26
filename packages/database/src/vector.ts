import { sql } from 'drizzle-orm';
import { db } from './client.js';

export interface SimilarChunkResult {
  id: string;
  documentId: string;
  structuralReference: string;
  chunkContent: string;
  similarityScore: number;
}

let isPgVectorAvailable: boolean | null = null;

async function checkPgVectorSupport(): Promise<boolean> {
  if (isPgVectorAvailable !== null) return isPgVectorAvailable;
  try {
    const res = await db.execute(sql`
      SELECT 1 FROM pg_extension WHERE extname = 'vector'
    `);
    const rows = (res as any)?.rows || res;
    isPgVectorAvailable = Array.isArray(rows) && rows.length > 0;
  } catch {
    isPgVectorAvailable = false;
  }
  return isPgVectorAvailable;
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

  const hasVector = await checkPgVectorSupport();
  if (!hasVector) {
    return [];
  }

  try {
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
  } catch (err: any) {
    console.warn(`[VectorQuery] Query vektor dilewati karena batasan pgvector: ${err?.message || err}`);
    return [];
  }
}

export interface DatahubSimilarChunkResult {
  id: string;
  fileId: string;
  chunkIndex: number;
  sectionTitle: string | null;
  chunkContent: string;
  contextualHeader: string | null;
  similarityScore: number;
}

export interface FindDatahubChunksParams {
  queryEmbedding: number[];
  tenantId: string;
  dapilCode?: string | null;
  partyAffiliation?: string | null;
  legislativeLevel?: string | null;
  branchType?: string | null;
  limit?: number;
  minSimilarityScore?: number;
}

/**
 * Mencari potongan dokumen DataHub yang relevan dengan isolasi multi-tenant ketat
 * (Hanya mengambil dokumen milik tenant, dapil yang sama, partai yang sama, serta tingkat lembaga yang sama).
 */
export async function findSimilarDatahubChunks(
  params: FindDatahubChunksParams
): Promise<DatahubSimilarChunkResult[]> {
  const {
    queryEmbedding,
    tenantId,
    dapilCode,
    partyAffiliation,
    legislativeLevel,
    branchType,
    limit = 5,
    minSimilarityScore = 0.65,
  } = params;

  if (!Array.isArray(queryEmbedding) || queryEmbedding.length !== 1536) {
    throw new Error(`[VectorQueryError] Dimensi embedding tidak valid. Diterima: ${queryEmbedding?.length}, Diperlukan: 1536.`);
  }

  const sanitizedVectorString = `[${queryEmbedding.map((n) => (isNaN(n) ? 0 : n)).join(',')}]`;

  const results = await db.execute(sql`
    WITH filtered_files AS (
      SELECT DISTINCT ref.file_id
      FROM datahub_document_refs ref
      WHERE
        -- 1. Private to this tenant
        (ref.privacy_scope = 'PRIVATE_TENANT' AND ref.uploaded_by_tenant_id = ${tenantId}::uuid)
        -- 2. Shared in same Dapil and same Branch (Eksekutif vs Legislatif)
        ${dapilCode ? sql`OR (
          ref.privacy_scope = 'DAPIL_SHARED' 
          AND ref.dapil_code = ${dapilCode}
          ${branchType ? sql`AND (ref.branch_type IS NULL OR ref.branch_type = ${branchType})` : sql``}
        )` : sql``}
        -- 3. Party confidential for same party AND same legislative level (DPRD tidak bisa intip DPR RI)
        ${partyAffiliation ? sql`OR (
          ref.privacy_scope = 'PARTY_CONFIDENTIAL' 
          AND ref.party_affiliation = ${partyAffiliation}
          ${legislativeLevel ? sql`AND (ref.legislative_level IS NULL OR ref.legislative_level = ${legislativeLevel}::legislative_level_enum)` : sql``}
        )` : sql``}
        -- 4. Public system
        OR (ref.privacy_scope = 'PUBLIC_SYSTEM')
    ),
    vector_matches AS (
      SELECT
        c.id,
        c.file_id AS "fileId",
        c.chunk_index AS "chunkIndex",
        c.section_title AS "sectionTitle",
        c.chunk_content AS "chunkContent",
        c.contextual_header AS "contextualHeader",
        (1 - (c.vector_embedding <=> ${sanitizedVectorString}::vector)) AS "similarityScore"
      FROM datahub_document_chunks c
      JOIN filtered_files ff ON c.file_id = ff.file_id
    )
    SELECT *
    FROM vector_matches
    WHERE "similarityScore" >= ${minSimilarityScore}
    ORDER BY "similarityScore" DESC
    LIMIT ${limit};
  `);

  return (results as unknown as DatahubSimilarChunkResult[]) || [];
}
