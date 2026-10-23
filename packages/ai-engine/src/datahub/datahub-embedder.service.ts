import { openaiClient } from '../client.js';

export class DatahubEmbedderService {
  /**
   * Menghasilkan vector embedding (1536 dimensi) untuk sekumpulan teks chunk secara batch.
   * Batching 50-100 chunk per request menghemat network overhead dan menghindari rate limit.
   */
  public static async generateBatchEmbeddings(
    texts: string[],
    batchSize: number = 50
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

      try {
        const response = await openaiClient.embeddings.create({
          model: 'text-embedding-3-small',
          input: batch,
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
        console.error(`[DatahubEmbedder] Gagal menghasilkan embedding batch ${i}:`, err);
        throw new Error(`Gagal menghasilkan vector embedding dokumen: ${(err as Error).message}`);
      }
    }

    return embeddings;
  }
}
