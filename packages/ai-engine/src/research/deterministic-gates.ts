export interface QuestionEvidenceStatus {
  questionId: string;
  questionText: string;
  minRequiredEvidence: number;
  actualEvidenceCount: number;
}

export interface EvidenceSufficiencyResult {
  isSufficient: boolean;
  totalEvidenceCount: number;
  unresolvedQuestions: QuestionEvidenceStatus[];
  gapAnalysisReason?: string;
}

export interface QualityControlResult {
  qcPassed: boolean;
  verifiedCitationsCount: number;
  rogueCitations: string[];
  failureReason?: string;
  citationIntegrityRate: number; // 0.0 - 1.0
}

export class DeterministicQualityGates {
  /**
   * GERBANG 1: Evidence Sufficient?
   * Memvalidasi kecukupan bukti secara deterministik di backend (bukan sekadar keputusan model AI).
   * Mencegah proses lanjut ke penulisan jika pertanyaan kunci belum memiliki bukti terdaftar.
   */
  public static verifyEvidenceSufficiency(
    questions: Array<{ id: string; question: string; minRequiredEvidence: number }>,
    evidenceCountPerQuestion: Record<string, number>,
    totalSpansAvailable: number
  ): EvidenceSufficiencyResult {
    const unresolvedQuestions: QuestionEvidenceStatus[] = [];

    for (const q of questions) {
      const actualCount = evidenceCountPerQuestion[q.id] || 0;
      if (actualCount < q.minRequiredEvidence) {
        unresolvedQuestions.push({
          questionId: q.id,
          questionText: q.question,
          minRequiredEvidence: q.minRequiredEvidence,
          actualEvidenceCount: actualCount,
        });
      }
    }

    // Syarat cukup:
    // 1. Total bukti konkret >= 2
    // 2. Maksimal hanya 1 pertanyaan sekunder yang boleh kurang (toleransi parsial), atau 0 jika pertanyaan < 3
    const maxAllowedUnresolved = questions.length >= 4 ? 1 : 0;
    const isSufficient =
      totalSpansAvailable >= 2 && unresolvedQuestions.length <= maxAllowedUnresolved;

    let gapAnalysisReason: string | undefined;
    if (!isSufficient) {
      gapAnalysisReason = `Bukti belum memadai: Terdapat ${unresolvedQuestions.length} pertanyaan riset tanpa dukungan data yang cukup (Total bukti terdaftar: ${totalSpansAvailable}). Membutuhkan targeted follow-up search.`;
    }

    return {
      isSufficient,
      totalEvidenceCount: totalSpansAvailable,
      unresolvedQuestions,
      gapAnalysisReason,
    };
  }

  /**
   * GERBANG 2: QC Passed? (Citation & Evidence Grounding Verification)
   * Backend memeriksa keaslian sitasi di naskah draf:
   * 1. Mengekstrak seluruh token sitasi (e.g. [^EV-...] atau [EV-...]).
   * 2. Mencocokkan dengan set ID bukti yang sah di database.
   * 3. Menolak naskah jika terdapat 'Rogue Citation' (sitasi buatan yang tidak ada di DB).
   */
  public static verifyCitationQualityControl(
    articleMarkdown: string,
    validEvidenceIds: Set<string>,
    minExpectedCitations: number = 2
  ): QualityControlResult {
    // Regex menangkap [^EV-xxx] atau [EV-xxx] atau [Bukti EV-xxx]
    const citationRegex = /\[(?:\^|Bukti:?\s*)?(EV-[a-zA-Z0-9_\-]+)\]/gi;
    const matches = Array.from(articleMarkdown.matchAll(citationRegex));

    const citedIds = Array.from(new Set(matches.map((m) => m[1])));
    const verifiedIds: string[] = [];
    const rogueCitations: string[] = [];

    for (const id of citedIds) {
      if (validEvidenceIds.has(id)) {
        verifiedIds.push(id);
      } else {
        rogueCitations.push(id);
      }
    }

    const verifiedCitationsCount = verifiedIds.length;
    const totalCitedCount = citedIds.length;
    const citationIntegrityRate =
      totalCitedCount > 0 ? verifiedCitationsCount / totalCitedCount : 0;

    // Kriteria Lulus QC:
    // 1. Tidak ada sitasi fiktif (rogueCitations == 0)
    // 2. Minimal jumlah sitasi terverifikasi terpenuhi (jika ada bukti terdaftar)
    let qcPassed = true;
    let failureReason: string | undefined;

    if (rogueCitations.length > 0) {
      qcPassed = false;
      failureReason = `QC Gagal: Ditemukan ${rogueCitations.length} token sitasi fiktif yang tidak terdaftar di basis data evidence: [${rogueCitations.join(', ')}].`;
    } else if (validEvidenceIds.size >= minExpectedCitations && verifiedCitationsCount < 1) {
      qcPassed = false;
      failureReason = `QC Gagal: Naskah tidak menyertakan sitasi eksplisit ke bukti yang telah disediakan sistem.`;
    }

    return {
      qcPassed,
      verifiedCitationsCount,
      rogueCitations,
      failureReason,
      citationIntegrityRate,
    };
  }
}
