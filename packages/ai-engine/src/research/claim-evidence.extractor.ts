import { openaiClient } from '../client.js';
import { ClaimStatus, SupportType } from '@polaris/shared-types';
import { AiTelemetryService } from '../telemetry/ai-telemetry.service.js';


export interface VerifiedSourceInput {
  sourceId: string;
  sourceVersionId?: string;
  title: string;
  publisherName?: string;
  url: string;
  extractedText: string;
}

export interface ExtractedEvidenceSpan {
  sourceId: string;
  sourceVersionId?: string;
  verbatimQuote: string;
  contextSnippet: string;
  sectionOrPage?: string;
  confidenceScore: number;
}

export interface ExtractedClaimWithEvidence {
  questionIndex?: number;
  claimStatement: string;
  status: ClaimStatus;
  confidenceScore: number;
  evidenceItems: Array<{
    verbatimQuote: string;
    contextSnippet: string;
    sectionOrPage?: string;
    supportType: SupportType;
    relationshipExplanation: string;
    sourceId: string;
  }>;
}

export class ClaimEvidenceExtractor {
  /**
   * Mengekstrak klaim faktual terverifikasi dan cuplikan kutipan bukti (evidence spans)
   * dari sekumpulan sumber yang telah lolos asesmen kredibilitas.
   */
  public static async extractClaimsAndEvidence(
    researchTopic: string,
    questions: Array<{ index: number; question: string }>,
    sources: VerifiedSourceInput[]
  ): Promise<ExtractedClaimWithEvidence[]> {
    if (sources.length === 0) return [];

    const sourcesContext = sources.map((s, idx) => `[SUMBER #${idx + 1} | ID: ${s.sourceId}]
Judul: ${s.title} (${s.publisherName || s.url})
Teks Rujukan:
"""${s.extractedText.slice(0, 2500)}"""`).join('\n\n');

    const questionsContext = questions
      .map((q) => `Pertanyaan ${q.index}: ${q.question}`)
      .join('\n');

    const extractionPrompt = `Anda adalah "POLARIS Senior Fact Extraction Specialist".
Tugas Anda adalah memetakan fakta konkret, angka, regulasi, dan peristiwa dari SUMBER TERVERIFIKASI untuk menjawab PERTANYAAN RISET.

TOPIK: "${researchTopic}"

PERTANYAAN RISET YANG HARUS DIJAWAB:
${questionsContext}

SUMBER-SUMBER TERVERIFIKASI:
${sourcesContext}

PANDUAN EKSTRAKSI BUKTI RIGID (ZERO HALLUCINATION):
1. Setiap klaim (claimStatement) HARUS didukung oleh KUTIPAN KATA PER KATA (verbatimQuote) yang benar-benar ada di teks rujukan.
2. DILARANG membuat kutipan fiktif. Jika sebuah pertanyaan riset tidak terjawab oleh sumber yang ada, JANGAN mengarang klaim.
3. Cantumkan [ID: ...] sumber yang menjadi rujukan kutipan secara presisi.
4. supportType: 'SUPPORTS' (mendukung klaim), 'REFUTES' (membantah klaim), atau 'NEUTRAL_CONTEXT'.

Hasilkan JSON murni dengan format:
{
  "claims": [
    {
      "questionIndex": 1,
      "claimStatement": "Pernyataan fakta konkret / temuan kebijakan yang didapat dari sumber",
      "status": "VERIFIED" | "PARTIALLY_SUPPORTED",
      "confidenceScore": 0.95,
      "evidenceItems": [
        {
          "sourceId": "ID dari header SUMBER rujukan",
          "verbatimQuote": "Kutipan persis kata-per-kata dari teks sumber",
          "contextSnippet": "1-2 kalimat konteks di sekitar kutipan",
          "sectionOrPage": "Bab II / Paragraf 3 / Rilis Pers",
          "supportType": "SUPPORTS",
          "relationshipExplanation": "Mengapa kutipan ini membuktikan klaim tersebut"
        }
      ]
    }
  ]
}`;

    const telemetry = AiTelemetryService.startTrace({
      operation: 'claim-evidence-extraction',
      model: 'gpt-4o',
      metadata: { researchTopic, sourcesCount: sources.length, questionsCount: questions.length },
    });

    try {
      const response = await openaiClient.chat.completions.create({
        model: 'gpt-4o',
        temperature: 0.1,
        response_format: { type: 'json_object' },
        messages: [{ role: 'user', content: extractionPrompt }],
      });

      const parsed = JSON.parse(response.choices[0]?.message?.content || '{}');
      const rawClaims = Array.isArray(parsed.claims) ? parsed.claims : [];

      await telemetry.endTrace({
        inputTokens: response.usage?.prompt_tokens || 0,
        outputTokens: response.usage?.completion_tokens || 0,
        status: 'SUCCESS',
        outputPreview: `Extracted ${rawClaims.length} claims`,
      });

      return rawClaims.map((c: any) => ({
        questionIndex: c.questionIndex,
        claimStatement: c.claimStatement || '',
        status: (c.status as ClaimStatus) || ClaimStatus.VERIFIED,
        confidenceScore: Number(c.confidenceScore) || 0.9,
        evidenceItems: (c.evidenceItems || []).map((ev: any) => ({
          verbatimQuote: ev.verbatimQuote || '',
          contextSnippet: ev.contextSnippet || ev.verbatimQuote || '',
          sectionOrPage: ev.sectionOrPage,
          supportType: (ev.supportType as SupportType) || SupportType.SUPPORTS,
          relationshipExplanation: ev.relationshipExplanation || '',
          sourceId: ev.sourceId || sources[0].sourceId,
        })),
      }));
    } catch (err: any) {
      await telemetry.endTrace({
        inputTokens: 0,
        outputTokens: 0,
        status: 'FAILED',
        errorMessage: err.message,
      });

      console.warn(`[ClaimEvidenceExtractor] Ekstraksi klaim gagal: ${err.message}`);
      return [];
    }

  }
}
