import { DatahubCategory } from '@polaris/shared-types';
import { googleGenAiClient } from '../client.js';

export interface ClassificationResult {
  category: DatahubCategory;
  confidenceScore: number; // 0.0 to 1.0
  isDeterministic: boolean;
  reasoningSnippet: string;
  suggestedTitle?: string;
  needsReview: boolean;
}

export class DocumentClassifierService {
  /**
   * Circuit Breaker State untuk mencegah penumpukan request saat Gemini API gangguan
   */
  private static circuitState = {
    consecutiveFailures: 0,
    cooldownUntil: 0,
  };

  private static isCircuitOpen(): boolean {
    if (this.circuitState.consecutiveFailures >= 3) {
      if (Date.now() < this.circuitState.cooldownUntil) {
        return true;
      }
      // Cooldown berakhir, reset ke status setengah terbuka (half-open)
      this.circuitState.consecutiveFailures = 0;
    }
    return false;
  }

  private static recordSuccess(): void {
    this.circuitState.consecutiveFailures = 0;
    this.circuitState.cooldownUntil = 0;
  }

  private static recordFailure(err: any): void {
    this.circuitState.consecutiveFailures += 1;
    if (this.circuitState.consecutiveFailures >= 3) {
      this.circuitState.cooldownUntil = Date.now() + 60000; // 60 detik cooldown
      console.warn(
        `[DocumentClassifier] Circuit Breaker OPEN: 3 kegagalan berturut-turut pada Gemini API (${err.message}). Mengaktifkan fallback otomatis selama 60 detik.`
      );
    }
  }

  /**
   * Mengklasifikasikan dokumen dengan pendekatan AI-FIRST:
   * Tier 1: Gemini 2.5 Flash Semantic Classifier dengan Hard Timeout 3.0 detik
   * Tier 2: Deterministic Legal Pattern Matcher (Fallback jika AI timeout/offline)
   * Tier 3: Keyword Density & Domain Heuristics (Fallback darurat)
   */
  public static async classifyDocument(
    paramsOrFileName:
      | {
          fileName: string;
          extractedText: string;
          existingCategory?: DatahubCategory;
          customTitle?: string;
        }
      | string,
    extractedTextArg?: string,
    existingCategoryArg?: DatahubCategory
  ): Promise<ClassificationResult> {
    const params =
      typeof paramsOrFileName === 'string'
        ? {
            fileName: paramsOrFileName,
            extractedText: extractedTextArg || '',
            existingCategory: existingCategoryArg,
          }
        : paramsOrFileName;

    // Hard Token Cap: Batasi penggalan ke 2.000 karakter pembuka (kop surat, konsiderans, perihal)
    // untuk mencegah pembengkakan token dan menjaga latensi inferensi di bawah 350ms.
    const textSample = (params.extractedText || '').slice(0, 2000);
    const combinedSample = `${params.fileName}\n${params.customTitle || ''}\n${textSample}`;

    // =========================================================================
    // TIER 1 (PRIMARY): AI-First Semantic Classification via Gemini 2.5 Flash
    // =========================================================================
    const canUseGemini =
      Boolean(googleGenAiClient) &&
      textSample.trim().length >= 30 &&
      !this.isCircuitOpen() &&
      process.env.NODE_ENV !== 'test' &&
      !process.env.VITEST;

    if (canUseGemini) {
      try {
        const geminiResult = await this.classifyWithGeminiWithTimeout(
          params.fileName,
          textSample,
          params.customTitle,
          3000
        );

        if (geminiResult) {
          this.recordSuccess();
          return geminiResult;
        }
      } catch (aiErr: any) {
        this.recordFailure(aiErr);
        console.warn(
          `[DocumentClassifier] AI-First classification gagal (${aiErr.message}). Mengaktifkan graceful fallback.`
        );
      }
    }

    // =========================================================================
    // TIER 2 (FAILOVER): Deterministic Legal Pattern Matcher (Regex Resmi)
    // =========================================================================
    const deterministic = this.matchDeterministicPatterns(params.fileName, combinedSample);
    if (deterministic) {
      return deterministic;
    }

    // =========================================================================
    // TIER 3 (FAILOVER): Keyword Density & Domain Heuristics
    // =========================================================================
    const heuristic = this.classifyByKeywordDensity(params.fileName, combinedSample);
    return {
      ...heuristic,
      needsReview: true, // Beri tanda butuh review operator jika jatuh ke fallback heuristik
    };
  }

  /**
   * Pembungkus panggilan Gemini dengan Hard Timeout 3.0 detik
   */
  private static async classifyWithGeminiWithTimeout(
    fileName: string,
    textSample: string,
    customTitle?: string,
    timeoutMs = 3000
  ): Promise<ClassificationResult | null> {
    let timer: NodeJS.Timeout | undefined;

    const timeoutPromise = new Promise<never>((_, reject) => {
      timer = setTimeout(() => {
        reject(new Error(`Batas waktu klasifikasi AI ${timeoutMs}ms terlampaui`));
      }, timeoutMs);
      if (typeof timer.unref === 'function') timer.unref();
    });

    try {
      return await Promise.race([
        this.classifyWithGemini(fileName, textSample, customTitle),
        timeoutPromise,
      ]);
    } finally {
      if (timer) clearTimeout(timer);
    }
  }

  /**
   * Pemanggilan Semantik Gemini 2.5 Flash dengan JSON Terstruktur
   */
  private static async classifyWithGemini(
    fileName: string,
    textSample: string,
    customTitle?: string
  ): Promise<ClassificationResult | null> {
    if (!googleGenAiClient) return null;

    const prompt = `Anda adalah sistem AI data-steward untuk platform keparlemenan dan pemerintahan POLARIS.
Tugas Anda adalah membaca ringkasan pembuka dokumen berikut dan menentukan KATEGORI serta JUDUL RESMI yang paling akurat.

Nama Berkas: "${fileName}"
Judul Kustom Pengunggah: "${customTitle || '-'}"
Penggalan Konten Dokumen (Kop/Preamble/Konsiderans):
"""
${textSample.slice(0, 2000)}
"""

Pilihan Kategori Valid (Pilih PERSIS satu):
- REGULASI_DAERAH: Perda, Perwal, Perbup, Pergub, Keputusan Kepala Daerah, UU, atau aturan hukum formal yang telah/sedang disahkan.
- ANGGARAN_APBD: DPA, RKA, Lampiran APBD, Laporan Realisasi Anggaran, alokasi dana belanja/pendapatan daerah.
- NOTULA_SIDANG: Risalah rapat komisi, notulen rapat fraksi, catatan rapat paripurna dewan, tanya-jawab hearing/RDP.
- KAJIAN_AKADEMIS: Naskah akademik raperda, policy brief, studi kelayakan, riset universitas/litbang.
- ASPIRASI_KONSTITUEN: Rekap hasil reses, surat aduan warga, pokir dewan, keluhan bantuan masyarakat.
- DOKUMEN_INTERNAL: Memo tim, draf pidato pribadi, rilis pers umum, materi presentasi.

Kembalikan format JSON persis seperti ini (tanpa markdown backtick):
{
  "category": "REGULASI_DAERAH",
  "confidenceScore": 0.95,
  "reasoningSnippet": "Kutipan satu kalimat alasan dokumen ini masuk ke kategori tersebut",
  "suggestedTitle": "Judul resmi yang rapi dan deskriptif"
}`;

    const modelName = process.env.GEMINI_TEXT_MODEL || 'gemini-2.5-flash';
    const response = await googleGenAiClient.models.generateContent({
      model: modelName,
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
    });

    const responseText = response.text || '';
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Respon Gemini tidak memuat objek JSON yang valid.');
    }

    const parsed = JSON.parse(jsonMatch[0]);

    const validCategories = Object.values(DatahubCategory);
    const category = validCategories.includes(parsed.category)
      ? (parsed.category as DatahubCategory)
      : DatahubCategory.DOKUMEN_INTERNAL;

    const confidenceScore = Math.max(0.5, Math.min(1.0, Number(parsed.confidenceScore) || 0.85));

    return {
      category,
      confidenceScore,
      isDeterministic: false,
      reasoningSnippet: parsed.reasoningSnippet || 'Dianalisis secara semantik oleh Gemini.',
      suggestedTitle: parsed.suggestedTitle || undefined,
      needsReview: confidenceScore < 0.85,
    };
  }

  /**
   * Tier 2 (Fallback): Pattern Matcher Nomenklatur Dokumen Hukum & Pemerintahan Resmi Indonesia
   */
  private static matchDeterministicPatterns(
    fileName: string,
    sample: string
  ): ClassificationResult | null {
    // 1. KAJIAN AKADEMIS / POLICY BRIEF (Evaluasi pertama agar naskah akademik Raperda tidak terklasifikasi sebagai perda)
    const naskahAkademikMatch = sample.match(
      /(?:naskah[\s_\-]+akademik|kajian[\s_\-]+akademis|policy[\s_\-]+brief|studi[\s_\-]+kelayakan|feasibility[\s_\-]+study|karya[\s_\-]+tulis[\s_\-]+ilmiah|pusat[\s_\-]+studi|hasil[\s_\-]+penelitian[\s_\-]+hukum)\b/i
    );
    if (naskahAkademikMatch) {
      const matchText = naskahAkademikMatch[0].trim();
      return {
        category: DatahubCategory.KAJIAN_AKADEMIS,
        confidenceScore: 0.98,
        isDeterministic: true,
        reasoningSnippet: `Teridentifikasi kajian akademis / policy brief: "${matchText}".`,
        needsReview: false,
      };
    }

    // 2. NOTULA / RISALAH SIDANG & RAPAT KOMISI (Evaluasi sebelum regulasi agar risalah pembahasan Raperda tidak terklasifikasi sebagai perda)
    const notulaMatch = sample.match(
      /(?:risalah[\s_\-]+(?:rapat|sidang)|notulen[\s_\-]+rapat|notula[\s_\-]+sidang|catatan[\s_\-]+sidang|rapat[\s_\-]+paripurna|rapat[\s_\-]+dengar[\s_\-]+pendapat|rdp[\s_\-]+komisi|pansus[\s_\-]+dprd|bapemperda[\s_\-]+dprd|badan[\s_\-]+anggaran[\s_\-]+dprd)\b/i
    );
    if (notulaMatch) {
      const matchText = notulaMatch[0].trim();
      return {
        category: DatahubCategory.NOTULA_SIDANG,
        confidenceScore: 0.98,
        isDeterministic: true,
        reasoningSnippet: `Teridentifikasi risalah rapat parlemen/komisi: "${matchText}".`,
        needsReview: false,
      };
    }

    // 3. ASPIRASI KONSTITUEN / HASIL RESES
    const aspirasiMatch = sample.match(
      /(?:laporan[\s_\-]+hasil[\s_\-]+reses|hasil[\s_\-]+reses|pokok[\s_\-]+pokok[\s_\-]+pikiran(?:\s*\(pokir\))?(?:[\s_\-]+dprd)?|\bpokir\b|jaring[\s_\-]+aspirasi[\s_\-]+masyarakat|surat[\s_\-]+keluhan[\s_\-]+warga|musrenbang[\s_\-]+(?:kelurahan|kecamatan|desa|kabupaten|kota)|aspirasi[\s_\-]+(?:warga|konstituen|masyarakat))\b/i
    );
    if (aspirasiMatch) {
      const matchText = aspirasiMatch[0].trim();
      return {
        category: DatahubCategory.ASPIRASI_KONSTITUEN,
        confidenceScore: 0.98,
        isDeterministic: true,
        reasoningSnippet: `Teridentifikasi dokumen aspirasi warga/reses dewan: "${matchText}".`,
        needsReview: false,
      };
    }

    // 4. ANGGARAN APBD / KEUANGAN
    const apbdMatch = sample.match(
      /(?:dokumen[\s_\-]+pelaksanaan[\s_\-]+anggaran|dpa[\s_\-]+skpd|dpa[\s_\-]+opd|rka[\s_\-]+skpd|rka[\s_\-]+opd|rencana[\s_\-]+kerja[\s_\-]+dan[\s_\-]+anggaran|laporan[\s_\-]+realisasi[\s_\-]+anggaran|apbd[\s_\-]+perubahan|apbd[\s_\-]+p|ringkasan[\s_\-]+apbd|nota[\s_\-]+keuangan[\s_\-]+apbd)\b/i
    );
    if (apbdMatch) {
      const matchText = apbdMatch[0].trim();
      return {
        category: DatahubCategory.ANGGARAN_APBD,
        confidenceScore: 0.98,
        isDeterministic: true,
        reasoningSnippet: `Teridentifikasi nomenklatur keuangan/anggaran APBD: "${matchText}".`,
        needsReview: false,
      };
    }

    // 5. REGULASI DAERAH / NASIONAL
    const perdaMatch =
      sample.match(
        /(?:peraturan[\s_\-]+(?:daerah|wali[\s_\-]*kota|bupati|gubernur|desa|menteri|pemerintah)|perda|perwal|perbup|pergub|undang[\s_\-]+undang|uu[\s_\-]+ri|keputusan[\s_\-]+(?:bupati|wali[\s_\-]*kota|gubernur|kepala[\s_\-]+daerah))[\s_\-]+(?:nomor|no\.?)[\s_\-]*([0-9A-Za-z\/\-_]+?)(?:tahun|\btahun\b|\.|\n|$)/i
      ) ||
      sample.match(
        /(?:peraturan[\s_\-]+(?:daerah|wali[\s_\-]*kota|bupati|gubernur|desa|pemerintah)|rancangan[\s_\-]+peraturan[\s_\-]+daerah|raperda)\b/i
      );

    if (perdaMatch) {
      const matchText = perdaMatch[0].trim().replace(/\s+/g, ' ');
      return {
        category: DatahubCategory.REGULASI_DAERAH,
        confidenceScore: 0.99,
        isDeterministic: true,
        reasoningSnippet: `Teridentifikasi pola regulasi perundang-undangan resmi: "${matchText}".`,
        suggestedTitle: matchText.length < 90 ? matchText : undefined,
        needsReview: false,
      };
    }

    return null;
  }

  /**
   * Tier 3 (Fallback): Analisis Kepadatan Kata Kunci Domain Parlemen & Kebijakan Publik
   */
  private static classifyByKeywordDensity(fileName: string, sample: string): ClassificationResult {
    const lower = sample.toLowerCase();

    const scoreCategory = (keywords: string[]): number => {
      let count = 0;
      for (const kw of keywords) {
        const regex = new RegExp(`\\b${kw}\\b`, 'gi');
        const matches = lower.match(regex);
        if (matches) count += matches.length;
      }
      return count;
    };

    const regulasiScore = scoreCategory([
      'pasal', 'ayat', 'ketentuan', 'menimbang', 'mengingat', 'memutuskan', 'ditetapkan', 'lembaran daerah', 'tambahan lembaran',
    ]);
    const anggaranScore = scoreCategory([
      'rupiah', 'belanja', 'pendapatan', 'pembiayaan', 'anggaran', 'alokasi', 'realisasi', 'subkegiatan', 'rekening', 'keuangan',
    ]);
    const notulaScore = scoreCategory([
      'pimpinan rapat', 'anggota hadir', 'interupsi', 'agenda rapat', 'tanya jawab', 'kesimpulan rapat', 'daftar hadir', 'skors',
    ]);
    const aspirasiScore = scoreCategory([
      'aspirasi', 'konstituen', 'warga', 'keluhan', 'pokir', 'permohonan bantuan', 'fasum', 'jalan rusak', 'drainase', 'reses',
    ]);
    const akademisScore = scoreCategory([
      'metodologi', 'latar belakang', 'abstrak', 'daftar pustaka', 'kesimpulan', 'rekomendasi kebijakan', 'analisis komparatif', 'literatur',
    ]);

    const scores = [
      { cat: DatahubCategory.REGULASI_DAERAH, score: regulasiScore, snippet: 'Kepadatan istilah perundang-undangan & pasal hukum' },
      { cat: DatahubCategory.ANGGARAN_APBD, score: anggaranScore, snippet: 'Kepadatan istilah anggaran belanja & keuangan daerah' },
      { cat: DatahubCategory.NOTULA_SIDANG, score: notulaScore, snippet: 'Kepadatan istilah risalah sidang parlemen & daftar hadir' },
      { cat: DatahubCategory.ASPIRASI_KONSTITUEN, score: aspirasiScore, snippet: 'Kepadatan istilah aspirasi warga & keluhan konstituen' },
      { cat: DatahubCategory.KAJIAN_AKADEMIS, score: akademisScore, snippet: 'Kepadatan struktur artikel ilmiah & metodologi kajian' },
    ];

    scores.sort((a, b) => b.score - a.score);
    const top = scores[0];

    if (top.score >= 5) {
      return {
        category: top.cat,
        confidenceScore: Math.min(0.88, 0.70 + top.score * 0.02),
        isDeterministic: false,
        reasoningSnippet: `${top.snippet} (skor frekuensi: ${top.score}).`,
        needsReview: false,
      };
    } else if (top.score >= 2) {
      return {
        category: top.cat,
        confidenceScore: 0.72,
        isDeterministic: false,
        reasoningSnippet: `${top.snippet} ditemukan dalam intensitas sedang (skor: ${top.score}).`,
        needsReview: true,
      };
    }

    return {
      category: DatahubCategory.DOKUMEN_INTERNAL,
      confidenceScore: 0.60,
      isDeterministic: false,
      reasoningSnippet: 'Dokumen bersifat umum / memo internal tanpa nomenklatur hukum formal yang dominan.',
      needsReview: true,
    };
  }
}
