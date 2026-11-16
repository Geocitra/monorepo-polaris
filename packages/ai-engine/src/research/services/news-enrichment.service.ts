import { PolicySector } from '@polaris/shared-types';
import {
  createGoogleGenAiClient,
  googleGenAiClient,
  normalizeGeminiModel,
  openaiClient,
} from '../../client.js';
import { AiTelemetryService } from '../../telemetry/ai-telemetry.service.js';

export interface NewsEnrichmentInput {
  title: string;
  bodyText: string;
  fallbackSector?: PolicySector | null;
  fallbackSentiment?: number;
  tenantId?: string;
}

export interface NewsEnrichmentOutput {
  cleanSummary: string;
  sentimentScore: number;
  sector: PolicySector | null;
  entities: {
    locations: string[];
    agencies: string[];
    figures: string[];
  };
  embedding: number[] | null;
}

export class NewsEnrichmentService {
  /**
   * Menghasilkan embedding 1536-dimensi untuk artikel berita menggunakan OpenAI text-embedding-3-small.
   * Mengembalikan null jika API key tidak tersedia atau gagal agar ingestion tetap berjalan.
   */
  public static async generateEmbedding(text: string): Promise<number[] | null> {
    const apiKey = process.env.OPENAI_API_KEY?.trim();
    if (!apiKey || apiKey === 'sk-mock-key' || !text.trim()) {
      return null;
    }

    try {
      const response = await openaiClient.embeddings.create({
        model: 'text-embedding-3-small',
        input: text.slice(0, 4000),
      });
      const vector = response.data?.[0]?.embedding;
      return Array.isArray(vector) && vector.length === 1536 ? vector : null;
    } catch (err: any) {
      console.warn(`[NewsEnrichmentService] Gagal membuat embedding berita: ${err?.message}`);
      return null;
    }
  }

  /**
   * Memperkaya berita dengan ringkasan netral, sentimen kontekstual, entitas kunci, dan vektor embedding.
   */
  public static async enrichArticle(input: NewsEnrichmentInput): Promise<NewsEnrichmentOutput> {
    const cleanBody = (input.bodyText || input.title).trim();
    const fallbackSummary = cleanBody.slice(0, 500);
    const fallbackSentiment = typeof input.fallbackSentiment === 'number' ? input.fallbackSentiment : 0;

    let cleanSummary = fallbackSummary;
    let sentimentScore = fallbackSentiment;
    let sector: PolicySector | null = input.fallbackSector ?? null;
    let entities = { locations: [] as string[], agencies: [] as string[], figures: [] as string[] };

    const client = googleGenAiClient ?? createGoogleGenAiClient();
    if (client && cleanBody.length >= 120) {
      const model = normalizeGeminiModel(process.env.GEMINI_LITE_MODEL || 'gemini-3.1-flash-lite');
      const prompt = `Analisislah berita berikut secara OBJEKTIF dan NETRAL dalam Bahasa Indonesia.
Kembalikan HANYA JSON murni tanpa markdown:
{
  "cleanSummary": "Ringkasan faktual netral 2-3 kalimat (maks 450 karakter)",
  "sentimentScore": angka -1.0 sampai 1.0 (negatif untuk krisis/keluhan/masalah, positif untuk capaian/solusi),
  "sector": salah satu dari [${Object.values(PolicySector).map((s) => `"${s}"`).join(', ')}] atau null,
  "entities": {
    "locations": ["nama daerah/kota/kabupaten/provinsi"],
    "agencies": ["nama kementerian/dinas/lembaga"],
    "figures": ["nama tokoh/pejabat yang disebut"]
  }
}

Judul: ${input.title}
Isi: ${cleanBody.slice(0, 3000)}`;

      const telemetry = AiTelemetryService.startTrace({
        operation: 'news-enrichment-gemini',
        model,
        tenantId: input.tenantId,
        inputPayload: { titleLength: input.title.length, bodyLength: cleanBody.length },
      });

      try {
        const response = await client.models.generateContent({
          model,
          contents: prompt,
        });
        const text = (response.text || '').trim();
        const usage = AiTelemetryService.extractGeminiUsage(response, prompt.length, text.length);
        await telemetry.endTrace({
          inputTokens: usage.inputTokens,
          outputTokens: usage.outputTokens,
          status: 'SUCCESS',
          outputSummary: text.slice(0, 200),
        });

        const parsed = JSON.parse(text.replace(/^```(json)?|```$/gi, '').trim());
        if (typeof parsed.cleanSummary === 'string' && parsed.cleanSummary.trim().length > 20) {
          cleanSummary = parsed.cleanSummary.trim().slice(0, 500);
        }
        if (typeof parsed.sentimentScore === 'number' && !Number.isNaN(parsed.sentimentScore)) {
          sentimentScore = Math.max(-1.0, Math.min(1.0, parsed.sentimentScore));
        }
        const validSectors = new Set<string>(Object.values(PolicySector));
        if (typeof parsed.sector === 'string' && validSectors.has(parsed.sector)) {
          sector = parsed.sector as PolicySector;
        }
        if (parsed.entities && typeof parsed.entities === 'object') {
          entities = {
            locations: Array.isArray(parsed.entities.locations) ? parsed.entities.locations.slice(0, 5).map(String) : [],
            agencies: Array.isArray(parsed.entities.agencies) ? parsed.entities.agencies.slice(0, 5).map(String) : [],
            figures: Array.isArray(parsed.entities.figures) ? parsed.entities.figures.slice(0, 5).map(String) : [],
          };
        }
      } catch (err: any) {
        await telemetry.endTrace({
          inputTokens: Math.ceil(prompt.length / 4),
          outputTokens: 0,
          status: 'FAILED',
          errorMessage: err?.message,
        }).catch(() => {});
      }
    }

    const embedding = await this.generateEmbedding(`${input.title}\n${cleanSummary}\n${cleanBody.slice(0, 1500)}`);

    return {
      cleanSummary,
      sentimentScore,
      sector,
      entities,
      embedding,
    };
  }
}

