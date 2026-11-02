import { openaiClient } from '../client.js';
import { AiTelemetryService } from '../telemetry/ai-telemetry.service.js';

export class DatahubEmbedderService {
  /**
   * Menghasilkan vector embedding (1536 dimensi) untuk sekumpulan teks chunk secara batch.
   * Batching 50-100 chunk per request menghemat network overhead dan menghindari rate limit.
   */
  public static async generateBatchEmbeddings(
    texts: string[],
    batchSize: number = 50,
    tenantId?: string
  ): Promise<number[][]> {
    if (!texts || texts.length === 0) {
      return [];
    }

    const embeddings: number[][] = [];

    for (let i = 0; i < texts.length; i += batchSize) {
      const batch = texts.slice(i, i + batchSize).map((t) => {
        // Truncate text jika melebihi batas token embedding (~8191 tokens)
        return t.slice(0, 15000);
      });

      const apiKey = process.env.OPENAI_API_KEY || '';
      if (!apiKey || apiKey.includes('sk-mock') || apiKey.length < 15) {
        console.warn(`[DatahubEmbedder] OPENAI_API_KEY mock/kosong terdeteksi. Menggunakan vektor deterministik dev lokal.`);
        for (let k = 0; k < batch.length; k++) {
          const mockVec = new Array(1536).fill(0).map((_, idx) => Math.sin(idx + k + i) * 0.05);
          embeddings.push(mockVec);
        }
        continue;
      }

      const telemetry = AiTelemetryService.startTrace({
        operation: 'datahub-batch-embedding',
        model: 'text-embedding-3-small',
        tenantId,
        metadata: { batchIndex: i, chunkCount: batch.length },
      });

      try {
        const response = await openaiClient.embeddings.create({
          model: 'text-embedding-3-small',
          input: batch,
        });

        await telemetry.endTrace({
          inputTokens: response.usage?.prompt_tokens || batch.reduce((acc, t) => acc + Math.ceil(t.length / 4), 0),
          outputTokens: 0,
          status: 'SUCCESS',
          outputSummary: `Embedded ${batch.length} chunks`,
        });

        // Urutkan kembali berdasarkan index response
        const sorted = response.data.sort((a, b) => a.index - b.index);
        for (const item of sorted) {
          if (!item.embedding || item.embedding.length !== 1536) {
            throw new Error(`Dimensi embedding vektor tidak valid: ${item.embedding?.length}`);
          }
          embeddings.push(item.embedding);
        }
      } catch (err) {
        await telemetry.endTrace({
          inputTokens: batch.reduce((acc, t) => acc + Math.ceil(t.length / 4), 0),
          outputTokens: 0,
          status: 'FAILED',
          errorMessage: (err as Error).message,
        });
        console.error(`[DatahubEmbedder] Gagal menghasilkan embedding batch ${i}:`, err);
        throw new Error(`Gagal menghasilkan vector embedding dokumen: ${(err as Error).message}`);
      }
    }

    return embeddings;
  }
}
