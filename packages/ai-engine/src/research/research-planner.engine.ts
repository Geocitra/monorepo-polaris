import { openaiClient } from '../client.js';
import { AiTelemetryService } from '../telemetry/ai-telemetry.service.js';
import { QuestionIntent } from '@polaris/shared-types';

export interface ResearchPlanInput {
  userPrompt: string;
  targetRegion: string;
  attachedDocsSummary?: string;
  providedUrls?: string[];
  tenantId?: string;
}

export interface PlannedResearchQuestion {
  question: string;
  intentCategory: QuestionIntent;
  temporalBound?: string;
  geographicScope: string;
  minRequiredEvidence: number;
  searchQueries: string[];
}

export interface ResearchPlanOutput {
  mainTopic: string;
  coreProblemStatement: string;
  questions: PlannedResearchQuestion[];
  internalRetrievalPlan: {
    regulationKeywords: string[];
    mediaSector?: string;
    mediaKeywords: string[];
  };
  academicQueries: string[];
  externalWebQueries: string[];
}

export class ResearchPlannerEngine {
  /**
   * Merumuskan rencana riset terstruktur (Divide-and-Conquer) dari instruksi awal pengguna.
   * Mencegah query dangkal 1-2 kata dan mewajibkan causal question & parameter bukti.
   */
  public static async createPlan(input: ResearchPlanInput): Promise<ResearchPlanOutput> {
    const telemetry = AiTelemetryService.startTrace({
      operation: 'autonomous-research-planner',
      model: 'gpt-4o',
      tenantId: input.tenantId,
      metadata: { targetRegion: input.targetRegion, promptLength: input.userPrompt.length },
    });

    const systemPrompt = `Anda adalah "POLARIS Lead Research Planner & Policy Methodologist".
Tugas Anda adalah merumuskan rencana investigasi dan riset kebijakan yang mendalam dan terstruktur dari arahan pengguna.

=== PRINSIP PERUMUSAN RISET OTONOM POLARIS ===
1. PERTANYAAN KAUSAL & SUBSTANTIF (ANTI-SUPERFICIAL):
   - JANGAN membuat pertanyaan dangkal atau hanya mengandalkan 1-2 kata kunci terpisah.
   - Rumuskan 3 hingga 5 pertanyaan riset yang spesifik, memiliki hubungan sebab-akibat (causal), dan menguji klaim kebijakan.
2. KLASIFIKASI INTENSI:
   Tiap pertanyaan riset WAJIB dikategorikan ke salah satu intensi:
   - REGULATORY: Dasar hukum, perda, perbup, undang-undang, harmonisasi regulasi.
   - STATISTICAL_BENCHMARK: Angka APBD, BPS, capaian indikator makro, studi komparasi daerah.
   - PUBLIC_OPINION: Sentimen media massa lokal, keluhan warga, dinamika politik parlemen.
   - POLICY_EVALUATION: Analisis efektivitas program, hambatan lapangan, evaluasi belanja publik.
   - FACTUAL_VERIFICATION: Konfirmasi fakta konkret atas insiden/isu yang dilaporkan pengguna.
3. BATASAN WAKTU & WILAYAH (TEMPORAL & GEOGRAPHIC BOUND):
   - Nyatakan batasan waktu (misal: "2024-2026" atau "5 tahun terakhir").
   - Lingkup wilayah: "${input.targetRegion}" atau benchmark nasional yang relevan.
4. ATURAN JUDUL:
   - Judul riset utama (mainTopic) WAJIB bernas, profesional, dan DILARANG KERAS menggunakan tanda titik dua (":").
5. STRATEGI PENCARIAN GANDA (INTERNAL + AKADEMIK + WEB):
   - Siapkan query pencarian majemuk yang kaya kata kunci kontekstual (bukan 1 kata lepas).

Format Output WAJIB berupa JSON murni dengan skema:
{
  "mainTopic": "Judul investigasi tanpa tanda titik dua",
  "coreProblemStatement": "Ringkasan 2-3 kalimat mengenai akar masalah yang diselidiki",
  "questions": [
    {
      "question": "Kalimat pertanyaan riset lengkap dan berbobot",
      "intentCategory": "REGULATORY" | "STATISTICAL_BENCHMARK" | "PUBLIC_OPINION" | "POLICY_EVALUATION" | "FACTUAL_VERIFICATION",
      "temporalBound": "2023-2026",
      "geographicScope": "${input.targetRegion}",
      "minRequiredEvidence": 1,
      "searchQueries": ["query pencarian spesifik 1", "query pencarian spesifik 2"]
    }
  ],
  "internalRetrievalPlan": {
    "regulationKeywords": ["kata kunci perda/regulasi"],
    "mediaSector": "INFRASTRUKTUR" | "PERTANIAN" | "PENDIDIKAN" | "KESEHATAN" | "BANSOS_UMKM" | "LAINNYA",
    "mediaKeywords": ["kata kunci berita lokal"]
  },
  "academicQueries": ["query jurnal/penelitian komparatif"],
  "externalWebQueries": ["query portal berita nasional / data kementerian"]
}`;

    const userContent = `WILAYAH SASARAN: ${input.targetRegion}
ARAHAN / PROMPT PENGGUNA:
"""${input.userPrompt}"""
${input.attachedDocsSummary ? `\nRINGKASAN LAMPIRAN:\n${input.attachedDocsSummary}` : ''}
${input.providedUrls && input.providedUrls.length > 0 ? `\nTAUTAN DILAMPIRKAN:\n${input.providedUrls.join('\n')}` : ''}

Susun rencana riset otonom terlengkap sekarang.`;

    try {
      const response = await openaiClient.chat.completions.create({
        model: 'gpt-4o',
        temperature: 0.2,
        response_format: { type: 'json_object' },
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userContent },
        ],
      });

      const rawJson = response.choices[0]?.message?.content || '{}';
      const parsed = JSON.parse(rawJson) as ResearchPlanOutput;

      // Bersihkan tanda titik dua pada mainTopic jika model tergelincir
      if (parsed.mainTopic) {
        parsed.mainTopic = parsed.mainTopic.replace(/:/g, ' - ').replace(/\s+/g, ' ').trim();
      }

      await telemetry.endTrace({
        inputTokens: response.usage?.prompt_tokens || 0,
        outputTokens: response.usage?.completion_tokens || 0,
        status: 'SUCCESS',
        outputPreview: `Plan: ${parsed.mainTopic} (${parsed.questions?.length || 0} questions)`,
      });

      return parsed;
    } catch (err: any) {
      await telemetry.endTrace({
        inputTokens: 0,
        outputTokens: 0,
        status: 'FAILED',
        errorMessage: err.message,
      });

      throw new Error(`[ResearchPlannerEngine] Gagal merumuskan rencana riset: ${err.message}`);
    }
  }
}
