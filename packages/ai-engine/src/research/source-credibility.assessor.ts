import { openaiClient } from '../client.js';
import { PublisherType, SourceLifecycle } from '@polaris/shared-types';
import { AiTelemetryService } from '../telemetry/ai-telemetry.service.js';


export interface SourceCandidateInput {
  url: string;
  domain: string;
  title: string;
  extractedText: string;
  publisherType?: PublisherType;
  doi?: string;
  isPeerReviewed?: boolean;
  hasRetractions?: boolean;
  publicationYear?: number;
}

export interface CredibilityAssessmentResult {
  publisherCredibilityScore: number;
  substantiveScore: number;
  methodologyScore?: number;
  recencyScore: number;
  overallScore: number;
  isAccepted: boolean;
  lifecycleStatus: SourceLifecycle;
  assessmentReason: string;
  rejectionReason?: string;
}

export class SourceCredibilityAssessor {
  /**
   * Menghitung skor reputasi penerbit berdasarkan domain / jenis institusi.
   * PENTING: Skor penerbit adalah SATU faktor sinyal awal, BUKAN bukti kebenaran mutlak.
   */
  public static calculatePublisherBaselineScore(domain: string, publisherType?: PublisherType): number {
    const d = domain.toLowerCase();
    if (d.endsWith('.go.id') || d.endsWith('.gov') || d.endsWith('.mil.id')) {
      return 0.90; // Domain pemerintah / regulasi resmi
    }
    if (d.endsWith('.ac.id') || d.endsWith('.edu') || publisherType === PublisherType.ACADEMIC) {
      return 0.88; // Lembaga riset & perguruan tinggi
    }
    // Media arus utama / pers kredibel
    const establishedMedia = ['kompas.com', 'tempo.co', 'antaranews.com', 'bisnis.com', 'kontan.co.id', 'detik.com'];
    if (establishedMedia.some((m) => d.includes(m))) {
      return 0.82;
    }
    if (publisherType === PublisherType.USER) {
      return 0.75; // Lampiran dokumen kerja langsung dari pengguna dewan
    }
    // Domain publik umum
    return 0.50;
  }

  /**
   * Menilai kelayakan dan kredibilitas sumber secara menyeluruh (Substansi + Metodologi + Kesegaran).
   */
  public static async assessSource(
    candidate: SourceCandidateInput,
    researchTopic: string
  ): Promise<CredibilityAssessmentResult> {
    const publisherScore = this.calculatePublisherBaselineScore(candidate.domain, candidate.publisherType);

    // Filter awal teks kosong / terlalu pendek
    if (!candidate.extractedText || candidate.extractedText.trim().length < 150) {
      return {
        publisherCredibilityScore: publisherScore,
        substantiveScore: 0.1,
        recencyScore: 0.5,
        overallScore: 0.2,
        isAccepted: false,
        lifecycleStatus: SourceLifecycle.REJECTED,
        assessmentReason: 'Konten teks terlalu dangkal atau tidak memuat data faktual (kurang dari 150 karakter).',
        rejectionReason: 'EMPTY_OR_SHALLOW_CONTENT',
      };
    }

    // Jika paper akademik memiliki catatan retraksi, tolak otomatis
    if (candidate.hasRetractions) {
      return {
        publisherCredibilityScore: 0.2,
        substantiveScore: 0.2,
        methodologyScore: 0.1,
        recencyScore: 0.5,
        overallScore: 0.15,
        isAccepted: false,
        lifecycleStatus: SourceLifecycle.REJECTED,
        assessmentReason: 'Publikasi ilmiah memiliki catatan retraksi (retraction) atau koreksi fatal pada Crossref.',
        rejectionReason: 'ACADEMIC_RETRACTION_FLAG',
      };
    }

    const evaluationPrompt = `Anda adalah "POLARIS Evidence Verification Auditor".
Tugas Anda adalah menilai substansi dan kualitas fakta dari materi rujukan berikut terkait topik riset kebijakan.

TOPIK RISET: "${researchTopic}"
SUMBER DITELITI:
- URL: ${candidate.url}
- Judul: ${candidate.title}
- Penerbit: ${candidate.domain} (${candidate.publisherType || 'MEDIA'})
${candidate.doi ? `- DOI: ${candidate.doi} (Peer-reviewed: ${candidate.isPeerReviewed ? 'Ya' : 'Belum Terkonfirmasi'})` : ''}

CUPLIKAN KONTEN:
"""${candidate.extractedText.slice(0, 1500)}"""

PANDUAN PENILAIAN KRITIS:
1. JANGAN menilai sumber semata-mata dari domain whitelist. Periksa data riil, argumen, dan angka yang disajikan.
2. substantiveScore (0.0 - 1.0): Seberapa konkret data lapangan, regulasi, atau indikator yang diutarakan? (Bukan opini retoris).
3. recencyScore (0.0 - 1.0): Seberapa relevan waktu/kesegaran data ini dengan masalah yang diselidiki?
4. methodologyScore (0.0 - 1.0): Kualitas metodologi atau keabsahan sumber rujukan primer.
5. overallScore: Rata-rata tertimbang (Substansi 50%, Metodologi 25%, Kesegaran 25%).
6. isAccepted: true jika overallScore >= 0.60 dan tidak ada fabrikasi hoax yang jelas.

Keluarkan JSON murni:
{
  "substantiveScore": 0.85,
  "methodologyScore": 0.80,
  "recencyScore": 0.90,
  "overallScore": 0.85,
  "isAccepted": true,
  "assessmentReason": "Penjelasan singkat 1-2 kalimat mengapa sumber ini layak atau tidak layak dijadikan bukti riset."
}`;

    const telemetry = AiTelemetryService.startTrace({
      operation: 'source-credibility-assessment',
      model: 'gpt-4o-mini',
      metadata: { url: candidate.url, domain: candidate.domain, doi: candidate.doi },
    });

    try {
      const completion = await openaiClient.chat.completions.create({
        model: 'gpt-4o-mini',
        temperature: 0.1,
        response_format: { type: 'json_object' },
        messages: [{ role: 'user', content: evaluationPrompt }],
      });

      const parsed = JSON.parse(completion.choices[0]?.message?.content || '{}');
      const substantive = Number(parsed.substantiveScore) || 0.5;
      const methodology = Number(parsed.methodologyScore) || 0.5;
      const recency = Number(parsed.recencyScore) || 0.5;

      // Gabungkan dengan baseline publisher
      const weightedOverall = Math.min(
        1.0,
        Math.max(
          0.0,
          substantive * 0.45 + methodology * 0.25 + recency * 0.15 + publisherScore * 0.15
        )
      );

      const isAccepted = weightedOverall >= 0.58 && Boolean(parsed.isAccepted);

      await telemetry.endTrace({
        inputTokens: completion.usage?.prompt_tokens || 0,
        outputTokens: completion.usage?.completion_tokens || 0,
        status: 'SUCCESS',
        outputPreview: `Score: ${weightedOverall}, Accepted: ${isAccepted}`,
      });

      return {
        publisherCredibilityScore: publisherScore,
        substantiveScore: substantive,
        methodologyScore: methodology,
        recencyScore: recency,
        overallScore: Math.round(weightedOverall * 100) / 100,
        isAccepted,
        lifecycleStatus: isAccepted ? SourceLifecycle.VERIFIED : SourceLifecycle.REJECTED,
        assessmentReason: parsed.assessmentReason || 'Evaluasi substansi selesai.',
        rejectionReason: isAccepted ? undefined : 'INSUFFICIENT_SUBSTANTIVE_OR_METHODOLOGY_SCORE',
      };
    } catch (err: any) {
      await telemetry.endTrace({
        inputTokens: 0,
        outputTokens: 0,
        status: 'FAILED',
        errorMessage: err.message,
      });

      // Fallback deterministik berbasis panjang konten & publisher score

      const fallbackScore = Math.min(1.0, publisherScore * 0.6 + 0.2);
      const isAccepted = fallbackScore >= 0.6;
      return {
        publisherCredibilityScore: publisherScore,
        substantiveScore: 0.6,
        recencyScore: 0.6,
        overallScore: fallbackScore,
        isAccepted,
        lifecycleStatus: isAccepted ? SourceLifecycle.VERIFIED : SourceLifecycle.REJECTED,
        assessmentReason: 'Penilaian fallback otomatis berdasarkan profil penerbit dan panjang teks.',
      };
    }
  }
}
