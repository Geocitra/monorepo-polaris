import { GenerateArticleParams, GeneratedArticleResult } from '@polaris/core-domain';
import { openaiClient } from './client.js';
import { PromptTemplates } from './prompts.js';
import { AiTelemetryService } from './telemetry/ai-telemetry.service.js';
import { MasterEditorialSanitizer } from './master-editorial-sanitizer.js';

export interface ChapterBlueprint {
  chapterNumber: string;
  title: string;
  targetWords: number;
  substanceFocus: string;
  coreThesis?: string;
  paragraphSubPoints?: string[];
  assignedEvidenceTokens?: string[];
  formatStyle:
    | 'NARRATIVE_ONLY'
    | 'NARRATIVE_WITH_TABLE'
    | 'NARRATIVE_WITH_CHART'
    | 'NARRATIVE_WITH_ROOT_CAUSE'
    | 'NARRATIVE_WITH_ROADMAP'
    | 'FULL_ANALYTICAL';
  tablePrompt?: string;
  chartSpec?: {
    title: string;
    type: 'bar' | 'line' | 'pie';
    unit: string;
    labels: string[];
    datasetLabel: string;
  };
  includeVisualSlot?: boolean;
  visualSlotCaption?: string;
  visualSlotPrompt?: string;
}

export interface OutlineResult {
  title: string;
  excerpt: string;
  chapters: ChapterBlueprint[];
}

export interface EditorialStyleProfile {
  style: 'AKADEMIS' | 'SOLUTIF' | 'KRITIS' | 'POPULER';
  label: string;
  chapterAnatomyDirectives: string[];
  headingFormat: 'FORMAL_NUMBERED' | 'JOURNALISTIC_FLOW';
  toneDirective: string;
  lexicalMandates: string[];
  framingMandate: string;
  chapterPromptGuidelines: string;
}

/**
 * EditorialStyleProfileResolver (GRASP: Information Expert & Polymorphism)
 *
 * Menerjemahkan kombinasi writingStyle ('AKADEMIS' | 'SOLUTIF' | 'KRITIS' | 'POPULER')
 * dan framingStance menjadi aturan deterministik: anatomi alur bab, aturan pemformatan heading,
 * rasio pembahasan masalah vs solusi, serta mandat leksikal dan pembobotan dewan.
 */
export class EditorialStyleProfileResolver {
  public static resolve(writingStyle?: string, framingStance?: string): EditorialStyleProfile {
    const rawStyle = (writingStyle || '').toUpperCase().trim();
    let style: 'AKADEMIS' | 'SOLUTIF' | 'KRITIS' | 'POPULER' = 'SOLUTIF';

    if (rawStyle.includes('AKADEMIS') || rawStyle.includes('RESEARCH') || rawStyle.includes('ILMIAH')) {
      style = 'AKADEMIS';
    } else if (rawStyle.includes('KRITIS') || rawStyle.includes('PENGAWASAN') || rawStyle.includes('AUDIT')) {
      style = 'KRITIS';
    } else if (rawStyle.includes('POPULER') || rawStyle.includes('WARGA') || rawStyle.includes('OPINI')) {
      style = 'POPULER';
    } else {
      style = 'SOLUTIF';
    }

    // BR-03: Sinergi Framing Stance
    let framingMandate = '';
    const rawFraming = (framingStance || '').toUpperCase();
    if (rawFraming.includes('ANGGARAN') || rawFraming.includes('FISKAL')) {
      framingMandate =
        'FOKUS FRAMING ANGGARAN: Minimal 1 sub-poin bab wajib membedah alokasi APBD/APBN, efisiensi belanja daerah, pos anggaran sektoral dinas, dan mitigasi pemborosan fiskal.';
    } else if (rawFraming.includes('PENGAWASAN') || rawFraming.includes('KRITIS')) {
      framingMandate =
        'FOKUS FRAMING PENGAWASAN & KRITIS: Sub-poin bab wajib menyoroti fungsi pengawasan komisi dewan terhadap deviasi target dinas/OPD mitra dan penegakan akuntabilitas birokrasi.';
    } else if (rawFraming.includes('HUMANIS') || rawFraming.includes('LAPANGAN')) {
      framingMandate =
        'FOKUS FRAMING HUMANIS & LAPANGAN: Sub-poin bab wajib menonjolkan dampak sosial-ekonomi langsung bagi warga, petani, nelayan, atau kelompok rentan di Dapil.';
    }

    if (style === 'AKADEMIS') {
      return {
        style: 'AKADEMIS',
        label: 'Akademis & Riset Kebijakan (Evidence-Based)',
        headingFormat: 'FORMAL_NUMBERED',
        chapterAnatomyDirectives: [
          'Bab 1: Kerangka Konseptual & Urgensi Masalah (NARRATIVE_ONLY) - telaah latar belakang teoretis dan justifikasi ilmiah.',
          'Bab 2: Bukti Empiris & Statistik Lapangan (NARRATIVE_WITH_TABLE atau NARRATIVE_WITH_CHART) - dekomposisi data sekunder & primer.',
          'Bab 3: Harmonisasi Regulasi & Tata Kelola (NARRATIVE_WITH_ROOT_CAUSE) - telaah yuridis, hierarki aturan, dan hambatan struktural.',
          'Bab 4+: Rekomendasi Kebijakan Institusional (NARRATIVE_WITH_ROADMAP) - kerangka intervensi berbasis kausalitas dan indikator terukur.',
        ],
        toneDirective: 'Objektif, Metodologis, Berimbang (Cover-Both-Sides), Teknokratis Tinggi.',
        lexicalMandates: [
          'Kepadatan sitasi bukti [^EV-x] maksimal untuk memvalidasi setiap postulat argumen.',
          'Gunakan penalaran deduktif-analitis dan terminologi kebijakan publik baku (signifikansi statistik, kausalitas, dekomposisi, benchmark nasional).',
          'Hindari klaim emosional tanpa sandaran data atau regulasi resmi.',
        ],
        framingMandate,
        chapterPromptGuidelines: `GAYA AKADEMIS & EVIDENCE-BASED:
- Format heading bab: ## Bab [Nomor]. [Judul Substantif Tanpa Titik Dua]
- Kepadatan sitasi [^EV-x] wajib maksimal. Tautkan setiap klaim data ke token bukti yang disediakan.
- Struktur kalimat deduktif, tenang, berwibawa, dan menyajikan analisis komparatif yang cermat.
- Tabel/grafik harus memuat perbandingan indikator atau variabel penelitian yang jelas.`,
      };
    }

    if (style === 'KRITIS') {
      return {
        style: 'KRITIS',
        label: 'Kritis & Pengawasan Kinerja Daerah (Investigatif)',
        headingFormat: 'FORMAL_NUMBERED',
        chapterAnatomyDirectives: [
          'Bab 1: Paradoks Klaim vs Realita Warga (NARRATIVE_ONLY) - kontras tajam antara janji dinas/klaim eksekutif dengan fakta lapangan.',
          'Bab 2: Audit Deviasi Target & Alokasi Anggaran (NARRATIVE_WITH_TABLE) - tabel audit perbandingan target RPJMD vs realisasi dinas.',
          'Bab 3: Anatomi Sumbatan Birokrasi & Tata Kelola (NARRATIVE_WITH_ROOT_CAUSE) - membedah akar kelalaian OPD dan celah pengawasan.',
          'Bab 4+: Ultimatum Evaluasi & Rekomendasi Parlemen (NARRATIVE_WITH_ROADMAP) - langkah pengawasan komisi, desakan audit khusus, dan timeline perbaikan.',
        ],
        toneDirective: 'Investigatif, Tajam, Kritis, Menuntut Akuntabilitas Teknis Sektoral.',
        lexicalMandates: [
          'Awali paragraf dengan kalimat pendek menohok (high burstiness) untuk menegaskan ketimpangan temuan.',
          'Gunakan verba evaluatif tajam: membedah deviasi, menguji kepatuhan, menelusuri kelalaian, menuntut pertanggungjawaban.',
          'Tabel wajib membandingkan Klaim Dinas vs Temuan Lapangan atau Deviasi Anggaran.',
        ],
        framingMandate,
        chapterPromptGuidelines: `GAYA KRITIS & PENGAWASAN PARLEMEN:
- Format heading bab: ## Bab [Nomor]. [Judul Investigatif Tanpa Titik Dua]
- Awali bab dengan membongkar paradoks atau jurang antara target dinas dengan kondisi riil warga.
- Sajikan tabel audit komparasi klaim vs fakta deviasi anggaran/target.
- Nada tegas wakil rakyat yang mengawal uang rakyat dan integritas pelayanan publik.`,
      };
    }

    if (style === 'POPULER') {
      return {
        style: 'POPULER',
        label: 'Populer & Suara Warga (Human Interest)',
        headingFormat: 'JOURNALISTIC_FLOW',
        chapterAnatomyDirectives: [
          'Bagian 1: Potret Keseharian & Suara Warga (NARRATIVE_ONLY) - cerita pembuka humanis tentang kondisi nyata di akar rumput.',
          'Bagian 2: Dampak Langsung bagi Keluarga & Komunitas (NARRATIVE_ONLY) - mengapa isu ini penting bagi kehidupan warga.',
          'Bagian 3: Fakta Ringkas di Balik Layar (NARRATIVE_WITH_TABLE atau NARRATIVE_WITH_CHART) - ringkasan data yang mudah dicerna.',
          'Bagian 4+: Langkah Bersama Mengawal Perubahan (NARRATIVE_WITH_ROADMAP) - ajakan partisipasi warga dan komitmen perjuangan dewan.',
        ],
        toneDirective: 'Komunikatif, Mengalir, Hangat, Ramah Pembaca HP, Berpihak pada Keseharian Warga.',
        lexicalMandates: [
          'DILARANG MENGGUNAKAN JARGON BIROKRASI KAKU (terjemahkan istilah dinas ke dalam bahasa percakapan cerdas sehari-hari).',
          'Gunakan format heading jurnalistik mengalir: ## [Judul Menarik] (DILARANG mencantumkan kata "Bab I", "Bab II", dll).',
          'Paragraf pendek dan bernapas (3-4 kalimat per paragraf), mengutamakan kenyamanan membaca di ponsel.',
          'Bab pembuka wajib menyajikan sketsa cerita / vignette warga di Dapil.',
        ],
        framingMandate,
        chapterPromptGuidelines: `GAYA POPULER & HUMAN INTEREST:
- Format heading: ## [Judul Subbab Jurnalistik Mengalir] (JANGAN GUNAKAN KATA "BAB I", "BAB II", dll!).
- Gaya bahasa komunikatif, lugas, segar, tanpa istilah birokratis yang membingungkan warga.
- Pembuka naskah wajib diawali dengan potret kehidupan warga sehari-hari.
- Jaga ritme bacaan tetap renyah, visual, dan memikat pembaca umum.`,
      };
    }

    // Default: SOLUTIF
    return {
      style: 'SOLUTIF',
      label: 'Solutif & Eksekutif (Quick Wins & Kebijakan Aksi)',
      headingFormat: 'FORMAL_NUMBERED',
      chapterAnatomyDirectives: [
        'Bab 1: Pemetaan Masalah & Urgensi Lapangan (NARRATIVE_ONLY) - identifikasi kendala prioritas yang membutuhkan intervensi cepat.',
        'Bab 2: Diagnosa Kapasitas Fiskal & Anggaran (NARRATIVE_WITH_TABLE) - tabel alokasi anggaran dan efisiensi belanja program.',
        'Bab 3: Terobosan Taktis Dewan & Solusi Cepat (NARRATIVE_WITH_CHART atau NARRATIVE_ONLY) - skema solusi dan quick wins.',
        'Bab 4+: Matriks Rencana Aksi & Peran OPD Mitra (NARRATIVE_WITH_ROADMAP) - pembagian tugas dinas, target waktu, dan indikator keberhasilan.',
      ],
      toneDirective: 'Eksekutif, Konstruktif, Berorientasi Solusi, Taktis, Lugas.',
      lexicalMandates: [
        'Rasio bahasan: 30% Masalah, 70% Solusi Konkret. Setiap kendala langsung dipasangkan dengan opsi solusi.',
        'Gunakan verba eksekusi aktif: mengalokasikan, memangkas hambatan, menginisiasi, mengeksekusi, menuntaskan.',
        'Fokus pada Quick Wins dan kepastian regulasi daerah.',
      ],
      framingMandate,
      chapterPromptGuidelines: `GAYA SOLUTIF & EKSEKUTIF:
- Format heading bab: ## Bab [Nomor]. [Judul Taktis Tanpa Titik Dua]
- Tekankan 30% identifikasi masalah dan 70% perumusan solusi konkret.
- Pastikan ada rekomendasi langkah cepat (quick wins) dan pembagian peran OPD mitra yang jelas.
- Verba aktif dan optimisme terukur dalam menggerakkan pembangunan daerah.`,
    };
  }
}

export class TwoStageArticleEngine {
  /**
   * Mengatur target panjang naskah & distribusi kata per bab
   */
  private static resolveLengthPlan(targetLength?: string): {
    totalTargetWords: number;
    chapterCount: number;
    wordsPerChapter: number;
  } {
    const raw = (targetLength || '').toUpperCase();
    if (raw.includes('750') || raw.includes('SHORT')) {
      return { totalTargetWords: 850, chapterCount: 2, wordsPerChapter: 450 };
    }
    if (raw.includes('1500') || raw.includes('1.500') || raw.includes('MEDIUM')) {
      return { totalTargetWords: 1750, chapterCount: 4, wordsPerChapter: 450 };
    }
    // Default LONG: 3.000 - 3.500 kata (5 Bab eksekutif)
    return { totalTargetWords: 3500, chapterCount: 5, wordsPerChapter: 700 };
  }

  /**
   * TAHAP 1: Redaktur Cerdas (Outline Blueprinting dengan Auto-Detail Expansion)
   * Menyusun kerangka bab adaptif secara dinamis berdasarkan topik, profil gaya penulisan, dan dekomposisi paragraf
   */
  public static async generateOutline(
    params: GenerateArticleParams,
    lengthPlan: ReturnType<typeof TwoStageArticleEngine.resolveLengthPlan>
  ): Promise<{ outline: OutlineResult; tokensUsed: number }> {
    const profile = EditorialStyleProfileResolver.resolve(params.writingStyle, params.framingStance);

    const outlinePrompt = `ANDA ADALAH CHIEF EDITORIAL DIRECTOR & DRAFTER KEBIJAKAN EKSEKUTIF SENIOR.
Tugas Anda: Susun Outline Blueprint Arsitektur untuk Dokumen Tulisan Eksekutif (Artikel Opini Publik, Policy Brief, Laporan Pengawasan/Kinerja, Kajian Strategis, dll) berbobot tinggi sesuai instruksi topik dan profil gaya penulisan terpilih.

TOPIK & INSTRUKSI PENGGUNA: "${params.topic}"
TARGET AUDIENS: ${params.targetAudience || 'Masyarakat Umum, Pengambil Kebijakan Daerah, dan Media'}
PROFIL GAYA PENULISAN: ${profile.label} (${profile.style})
TONE & KARAKTER: ${params.toneOverride || profile.toneDirective}
TARGET TOTAL KATA: ~${lengthPlan.totalTargetWords} kata (terbagi ke dalam ${lengthPlan.chapterCount} Bab/Bagian).
${profile.framingMandate ? `${profile.framingMandate}\n` : ''}${params.regionalContextData ? `KONTEKS WILAYAH & DATA:\n${params.regionalContextData.slice(0, 2000)}` : ''}

ANATOMI ALUR BAB YANG DIHARUSKAN UNTUK GAYA ${profile.style}:
${profile.chapterAnatomyDirectives.map((d) => `- ${d}`).join('\n')}

PEDOMAN FORMAT HEADING BAB (BR-01):
${
  profile.headingFormat === 'JOURNALISTIC_FLOW'
    ? '- GAYA POPULER: DILARANG menggunakan kata "Bab I", "Bab II", dst pada "chapterNumber" maupun "title"! Gunakan judul subbab jurnalistik mengalir yang memikat (misal: "Menanti Janji di Ujung Aspal", "Antara Kuota Pupuk dan Keringat Petani"). Set "chapterNumber" menjadi "Bagian 1", "Bagian 2", dst.'
    : '- GAYA FORMAL/TEKNOKRATIS: Gunakan penomoran "chapterNumber": "Bab I", "Bab II", dst, dengan "title" yang substantif tanpa tanda titik dua.'
}

DEKOMPOSISI DETAIL BERTINGKAT (AUTO-DETAIL EXPANSION - BR-02):
Untuk setiap bab pada "chapters", Anda WAJIB membedah rencana penulisan ke dalam sub-elemen berikut:
1. "coreThesis": 1 kalimat proposisi pokok yang ingin dibuktikan atau diargumentasikan di bab tersebut.
2. "paragraphSubPoints": Array berisi 3-4 string rencana alur bahasan rinci dari paragraf pertama hingga paragraf penutup bab (misal: ["Paragraf 1: Potret situasi di lapangan...", "Paragraf 2: Tinjauan data alokasi kuota...", "Paragraf 3: Evaluasi regulasi Perda terkait...", "Paragraf 4: Sikap rekomendasi komisi dewan..."]).
3. "assignedEvidenceTokens": Array string berisi token bukti (misal: ["EV-1", "EV-2"]) yang relevan untuk dikutip di bab ini dari konteks data riset agar sitasi tersebar proporsional.

PEDOMAN PERUMUSAN JUDUL (SANGAT PENTING - WAJIB DIPATUHI):
1. DILARANG KERAS MENGGUNAKAN TANDA TITIK DUA (":") baik pada judul artikel maupun judul bab!
2. HINDARI FORMULA KLISE AKADEMIS/MAKALAH seperti pola "Topik: Subjudul Penjelas".
   Contoh DILARANG: "Transformasi Infrastruktur Desa: Jalan Menuju Kemajuan Berkelanjutan" (Ini sangat kaku, malas, dan terkesan seperti skripsi!).
3. Buatlah judul artikel sebagai SATU KESATUAN TAJUK (HEADLINE) JURNALISTIK EKSEKUTIF yang utuh, bertenaga, mengalir alami, dan memikat (seperti tajuk investigasi Tempo, kolom opini Kompas, The Economist, atau Project Syndicate).
   - Pola judul yang SANGAT DIANJURKAN:
     * "Menepis Sengkarut Infrastruktur Demi Masa Depan Warga Desa"
     * "Mengapa Pemerataan Pembangunan Desa Tak Boleh Lagi Ditunda"
     * "Membangun Desa Tanpa Menumpuk Beban Utang Daerah"
     * "Langkah Taktis Membuka Urat Nadi Ekonomi dari Pelosok"
     * "Menata Ulang Tata Kelola Logistik Pedesaan Menuju Ketahanan Pangan"
4. Judul bab ("title" pada chapters) juga DILARANG memakai tanda titik dua (":") dan em dash ("—"). Gunakan frasa bab yang substantif dan langsung menyentuh substansi masalah.

PANTANGAN MASTER EDITORIAL & GARIS PEMISAH (ZERO-TOLERANCE):
- DILARANG KERAS menggunakan kata "sekadar".
- DILARANG KERAS menggunakan kata "nyata" (misal: "dampak nyata", "langkah nyata", "ikhtiar nyata", "perubahan nyata"). Gunakan penjelasan bukti atau capaian konkret.
- DILARANG KERAS menggunakan tanda baca em dash (—). Gunakan koma, titik, atau tanda kurung.
- DILARANG KERAS menyisipkan garis pemisah horizontal ("---", "***", "___", atau deretan tanda hubung) di bawah judul, antar-bab, maupun di sela paragraf. Teks harus mengalir alami tanpa pemisah mekanis.

PEDOMAN VARIASI STRUKTURAL ORGANIK:
- Bab I / Bagian 1 (Latar Belakang / Refleksi Awal): Format NARRATIVE_ONLY.
- Bab Data / Kondisi Lapangan: Format NARRATIVE_WITH_TABLE atau NARRATIVE_WITH_CHART.
- Bab Akar Masalah: Format NARRATIVE_WITH_ROOT_CAUSE (bullet points analisis sebab-akibat).
- Bab Solusi / Rekomendasi: Format NARRATIVE_WITH_ROADMAP (matriks langkah tindak konkret).
- Bab Penutup: NARRATIVE_ONLY (persuasif, komitmen masa depan).
Jika ada bab yang cocok untuk visualisasi foto/infografis lapangan di tengah naskah, set includeVisualSlot: true dengan visualSlotCaption dan visualSlotPrompt yang relevan.

Keluarkan hasil HANYA dalam format JSON valid berikut:
{
  "title": "Judul Headline Jurnalistik Utuh Tanpa Tanda Titik Dua",
  "excerpt": "Ringkasan Eksekutif 2-3 kalimat padat berbobot",
  "chapters": [
    {
      "chapterNumber": "${profile.headingFormat === 'JOURNALISTIC_FLOW' ? 'Bagian 1' : 'Bab I'}",
      "title": "Judul Spesifik Bab Tanpa Titik Dua",
      "targetWords": ${lengthPlan.wordsPerChapter},
      "substanceFocus": "Poin-poin substansi mendalam yang wajib diulas di bab ini",
      "coreThesis": "Proposisi utama yang dibuktikan pada bab ini dalam satu kalimat tegas",
      "paragraphSubPoints": [
        "Paragraf 1: Potret situasi faktual dan identifikasi urgensi pokok",
        "Paragraf 2: Tinjauan data lapangan, evaluasi anggaran, atau dasar regulasi pendukung",
        "Paragraf 3: Telaah hambatan teknis dan dampak langsung terhadap warga",
        "Paragraf 4: Rekomendasi langkah taktis, mitigasi risiko, atau sikap komisi dewan"
      ],
      "assignedEvidenceTokens": ["EV-1"],
      "formatStyle": "NARRATIVE_ONLY",
      "includeVisualSlot": false
    }
  ]
}`;

    const completion = await openaiClient.chat.completions.create({
      model: 'gpt-4o',
      temperature: 0.35,
      response_format: { type: 'json_object' },
      messages: [
        {
          role: 'system',
          content: 'Anda adalah perancang outline naskah eksekutif terkemuka. Keluarkan output JSON valid tanpa titik dua pada judul.',
        },
        { role: 'user', content: outlinePrompt },
      ],
    });

    const parsed = JSON.parse(completion.choices[0]?.message?.content || '{}') as OutlineResult;
    const tokens = (completion.usage?.prompt_tokens || 0) + (completion.usage?.completion_tokens || 0);

    // Defensive Fallback Mapping (RISK-01)
    const sanitizedChapters: ChapterBlueprint[] = (parsed.chapters || []).map((ch, idx) => {
      const chapterNum =
        profile.headingFormat === 'JOURNALISTIC_FLOW'
          ? ch.chapterNumber || `Bagian ${idx + 1}`
          : ch.chapterNumber || `Bab ${idx + 1}`;

      const coreThesis =
        ch.coreThesis || ch.substanceFocus || `Analisis komprehensif terkait ${ch.title || params.topic}`;

      let paragraphSubPoints =
        Array.isArray(ch.paragraphSubPoints) && ch.paragraphSubPoints.length > 0
          ? ch.paragraphSubPoints.filter(Boolean)
          : [];

      if (paragraphSubPoints.length === 0 && ch.substanceFocus && ch.substanceFocus.includes('.')) {
        paragraphSubPoints = ch.substanceFocus
          .split('.')
          .map((s) => s.trim())
          .filter((s) => s.length > 10);
      }

      if (paragraphSubPoints.length < 3) {
        paragraphSubPoints = [
          `Paragraf 1: Potret situasi faktual dan identifikasi urgensi pokok di Dapil terkait ${params.topic}`,
          `Paragraf 2: Tinjauan data lapangan, evaluasi anggaran, atau dasar regulasi pendukung`,
          `Paragraf 3: Telaah hambatan teknis dan dampak langsung terhadap kesejahteraan warga`,
          `Paragraf 4: Rekomendasi langkah taktis, mitigasi risiko, serta sikap pengawalan dewan`,
        ];
      }

      const assignedEvidenceTokens =
        Array.isArray(ch.assignedEvidenceTokens) && ch.assignedEvidenceTokens.length > 0
          ? ch.assignedEvidenceTokens.filter(Boolean)
          : [];

      return {
        chapterNumber: chapterNum,
        title: MasterEditorialSanitizer.cleanHeadline(ch.title, `Uraian Analisis Substantif Bagian ${idx + 1}`),
        targetWords: ch.targetWords || lengthPlan.wordsPerChapter,
        substanceFocus: ch.substanceFocus || coreThesis,
        coreThesis,
        paragraphSubPoints,
        assignedEvidenceTokens,
        formatStyle: ch.formatStyle || 'NARRATIVE_ONLY',
        chartSpec: ch.chartSpec,
        includeVisualSlot: !!ch.includeVisualSlot,
        visualSlotCaption: ch.visualSlotCaption,
        visualSlotPrompt: ch.visualSlotPrompt,
      };
    });

    const sanitizedOutline: OutlineResult = {
      title: MasterEditorialSanitizer.cleanHeadline(parsed.title, params.topic),
      excerpt: parsed.excerpt ? MasterEditorialSanitizer.sanitize(parsed.excerpt) : '',
      chapters: sanitizedChapters,
    };

    return { outline: sanitizedOutline, tokensUsed: tokens };
  }

  /**
   * Sanitizer khusus judul (delegasi murni ke MasterEditorialSanitizer)
   */
  public static cleanHeadline(rawTitle?: string, fallback: string = ''): string {
    return MasterEditorialSanitizer.cleanHeadline(rawTitle, fallback);
  }

  /**
   * TAHAP 2: Ekspansi Bab Berantai (Staggered Chapter Synthesis)
   * Menggunakan Dual-Stream Token Budgeting dan rencana alur paragraf bertingkat (Auto-Detail Expansion)
   */
  public static async generateChapter(
    chapter: ChapterBlueprint,
    articleTitle: string,
    params: GenerateArticleParams,
    previousChapterSummary?: string
  ): Promise<{ chapterMarkdown: string; chapterSummary: string; tokensUsed: number }> {
    const profile = EditorialStyleProfileResolver.resolve(params.writingStyle, params.framingStance);

    let structuralMandate = '';

    if (chapter.formatStyle === 'NARRATIVE_WITH_TABLE') {
      structuralMandate += `
- WAJIB SERTAKAN 1 TABEL DATA MARKDOWN: Buat tabel komparasi/indikator data realistis minimal 3 kolom dan 3-4 baris. Letakkan di tengah atau akhir pembahasan data.`;
    } else if (chapter.formatStyle === 'NARRATIVE_WITH_CHART' && chapter.chartSpec) {
      const spec = chapter.chartSpec;
      structuralMandate += `
- WAJIB SERTAKAN 1 BLOK GRAFIK (FORMAT TIPTAP):
Sertakan blok grafik persis seperti contoh format ini di dalam Markdown:
:::chart
{
  "type": "${spec.type || 'bar'}",
  "title": "${spec.title || 'Grafik Indikator Kebijakan'}",
  "unit": "${spec.unit || 'Indeks/Unit'}",
  "labels": ${JSON.stringify(spec.labels || ['2023', '2024', '2025 Target'])},
  "datasets": [
    {
      "label": "${spec.datasetLabel || 'Realisasi'}",
      "data": [45, 68, 85]
    }
  ]
}
:::`;
    } else if (chapter.formatStyle === 'NARRATIVE_WITH_ROOT_CAUSE') {
      structuralMandate += `
- WAJIB SERTAKAN ANALISIS AKAR MASALAH: Gunakan poin-poin struktural (Bullet Points) yang membedah Dimensi Regulasi, Dimensi Anggaran, dan Dimensi Pelaksanaan Lapangan.`;
    } else if (chapter.formatStyle === 'NARRATIVE_WITH_ROADMAP') {
      structuralMandate += `
- WAJIB SERTAKAN MATRIKS RENCANA AKSI (ROADMAP): Buat tabel Markdown yang memetakan Prioritas Aksi, Waktu Eksekusi, Output Konkret, dan Pemangku Kepentingan Terkait.`;
    }

    if (chapter.includeVisualSlot && chapter.visualSlotCaption) {
      structuralMandate += `
- WAJIB SERTAKAN 1 SLOT VISUAL DI TENGAH BAB:
Sematkan baris penanda slot gambar berikut pada posisi paragraf yang paling relevan:
<!-- VISUAL_SLOT: {"type": "INFOGRAPHIC", "caption": "${chapter.visualSlotCaption}", "prompt": "${chapter.visualSlotPrompt || chapter.visualSlotCaption}"} -->`;
    }

    const headingDirective =
      profile.headingFormat === 'JOURNALISTIC_FLOW'
        ? `## ${chapter.title}`
        : `## ${chapter.chapterNumber}. ${chapter.title}`;

    const subPointsDirective =
      Array.isArray(chapter.paragraphSubPoints) && chapter.paragraphSubPoints.length > 0
        ? chapter.paragraphSubPoints.map((sp, idx) => `  * Paragraf ${idx + 1}: ${sp}`).join('\n')
        : `  * Paragraf 1-4: Kembangkan substansi "${chapter.substanceFocus}" secara mendalam dan berbobot.`;

    const evidenceDirective =
      Array.isArray(chapter.assignedEvidenceTokens) && chapter.assignedEvidenceTokens.length > 0
        ? `TOKEN BUKTI DITUGASKAN UNTUK BAB INI: WAJIB tautkan sitasi [^${chapter.assignedEvidenceTokens.join('], [^')}] pada klausa/argumen data yang relevan.`
        : 'Jika terdapat fakta pendukung pada konteks riset yang relevan, tautkan sitasi [^EV-x] yang bersangkutan.';

    const chapterPrompt = `TUGAS: Tulis naskah lengkap untuk ${profile.headingFormat === 'JOURNALISTIC_FLOW' ? `subbab "${chapter.title}"` : `${chapter.chapterNumber}. "${chapter.title}"`}
DARI ARTIKEL: "${articleTitle}"
PROPOSISI POKOK BAB (CORE THESIS): ${chapter.coreThesis || chapter.substanceFocus}
GAYA PENULISAN AKTIF: ${profile.label} (${profile.style})
TONE & SIKAP: ${params.toneOverride || profile.toneDirective}
TARGET AUDIENS: ${params.targetAudience || 'Masyarakat Umum, Pengambil Kebijakan Daerah, dan Media'}
${profile.framingMandate ? `${profile.framingMandate}\n` : ''}
RENCANA ALUR PARAGRAF WAJIB (AUTO-DETAIL EXPANSION - BR-02):
${subPointsDirective}

${evidenceDirective}

=== FAKTA RISET, REGULASI DAERAH & TOKEN BUKTI [EV-x] (SUMBER KEBENARAN TUNGGAL) ===
${params.regionalContextData ? params.regionalContextData.slice(0, 4000) : 'Gunakan penalaran kebijakan faktual tanpa mengarang pasal fiktif.'}
===================================================================================

TARGET KATA NARASI MURNI: Minimal ${chapter.targetWords} kata narasi murni (HANYA MENGHITUNG TEKS PARAGRAF).
MANDAT VOLUME & KEDALAMAN PARAGRAF (SANGAT PENTING):
- Bab ini WAJIB diuraikan secara mendalam mengikuti panduan rencana alur paragraf di atas secara berurutan.
- DILARANG MERINGKAS, DILARANG MENYINGKAT, dan DILARANG menghasilkan teks pendek! Kembangkan setiap poin argumen dengan rincian kronologis, data pendukung, telaah hukum/regulasi, serta analisis dampak kebijakan secara menyeluruh.
PRINSIP DUAL-STREAM BUDGETING: Tabel, grafik, atau matriks adalah BONUS STRUKTURAL, BUKAN pengganti panjang paragraf narasi! Paragraf argumen harus tetap padat, mengalir, dan mendalam.

${previousChapterSummary ? `KONTEKS BAB SEBELUMNYA (JAGA KONTINUITAS & HINDARI REPETISI):\n"${previousChapterSummary}"` : ''}

${structuralMandate}

ATURAN KHUSUS PROFIL ${profile.style}:
${profile.chapterPromptGuidelines}

ATURAN TATA BAHASA, EJAAN & MIKROLINGUISTIK (SANGAT PENTING - WAJIB DIPATUHI):
1. PENEGAKAN STRUKTUR SPOK AKTIF (ACTOR-DRIVEN SYNTAX):
   - Setiap klausa argumen WAJIB mencantumkan subjek pelaku/aktor kebijakan yang jelas di depan (contoh: "Pemerintah Daerah", "DPRD", "Dinas Bina Marga", "Badan Anggaran", "Warga petani").
   - DILARANG KERAS menggunakan kalimat pasif mengambang tanpa subjek seperti:
     * DILARANG: "Diharapkan program ini dapat berjalan optimal..." -> WAJIB: "Pemerintah Daerah harus memastikan program ini berjalan optimal..."
     * DILARANG: "Perlu dilakukan evaluasi mendalam..." -> WAJIB: "Komisi Terkait mendesak evaluasi mendalam..."
     * DILARANG: "Melalui langkah ini dinilai mampu mendorong..." -> WAJIB: "Alokasi anggaran ini mendorong percepatan..."

2. LARANGAN OXFORD COMMA PADA PERINCIAN ELEMEN (GAYA JURNALISTIK ALAMI):
   - Pada perincian 3 elemen atau lebih, DILARANG meletakkan tanda koma sebelum kata sambung "dan", "atau", "serta".
   - CONTOH SALAH (GAYA AI KLISE): "...kucing, anjing, dan ikan" / "...pendidikan, kesehatan, dan infrastruktur"
   - CONTOH BENAR (GAYA ALAMI): "...kucing, anjing dan ikan" / "...pendidikan, kesehatan dan infrastruktur"

3. PANDUAN KATA BAKU & PREPOSISI ALAMI:
   - Penulisan preposisi tempat wajib dipisah spasi: "di antaranya" (BUKAN "diantaranya"), "di mana", "ke depan".
   - Gunakan kata baku yang wajar, komunikatif, dan mengalir natural, tidak kaku seperti mesin terjemahan.

4. KAMUS HITAM DIKSI KLISE AI (AI SLOP BLACKLIST):
   - DILARANG KERAS menggunakan metafora basi yang diobral AI:
     * "angin segar"
     * "tonggak bersejarah" / "tonggak penting"
     * "garda terdepan"
     * "menatap masa depan yang gemilang" / "merajut asa" / "membuka tabir"
     * "sinergi yang komprehensif"
     * "pada hakikatnya" / "seyogianya" / "niscaya"
     * Pola berulang: "bukan sekadar... melainkan juga..."
   - GANTI dengan verba tindakan teknokratis terukur: memitigasi, meninjau ulang, memangkas deviasi, mengalokasikan, mengaudit, mengesahkan, mengevaluasi.

5. RITME KALIMAT VARIATIF (SENTENCE BURSTINESS):
   - Selingi naskah dengan kalimat pendek tegas (5-8 kata) sebagai penegasan tesis, lalu lanjutkan dengan kalimat analisis elaboratif (15-20 kata). JANGAN membuat semua kalimat sama panjangnya!

6. LARANGAN KALIMAT PEMBUKA KLISE:
   - Dilarang membuka bab dengan: "Dalam era globalisasi saat ini...", "Sebagaimana kita ketahui bersama...", "Seiring dengan perkembangan zaman...".
   - Awali langsung dengan proposisi tajam, data lapangan, atau situasi riil warga.
   - Output WAJIB diawali dengan heading: ${headingDirective} (DILARANG menggunakan titik dua dan em dash).

7. INTEGRASI SITASI BUKTI TERVERIFIKASI (EVIDENCE GROUNDING CITATION):
   - Jika pada konteks data terdapat penanda bukti seperti [EV-1], [EV-2], dst., sematkan rujukan bukti tersebut di akhir klausa atau kalimat argumen yang bersangkutan dengan format: [^EV-1] atau [^EV-2].
   - DILARANG KERAS mengarang ID bukti baru di luar yang tercantum dalam konteks data!

8. PANTANGAN MASTER EDITORIAL & LARANGAN GARIS PEMISAH (ZERO-TOLERANCE):
   - DILARANG KERAS menggunakan kata "sekadar" dalam konteks apa pun.
   - DILARANG KERAS menggunakan kata "nyata" sebagai penegas generik (seperti "dampak nyata", "bukti nyata", "langkah nyata", "ikhtiar nyata"). Paparkan fakta, data, atau indikator secara spesifik dengan istilah konkret.
   - DILARANG KERAS menggunakan tanda baca em dash (—). Gunakan tanda koma atau tanda kurung sesuai kebutuhan sintaksis.
   - DILARANG KERAS MENYISIPKAN GARIS PEMISAH HORIZONTAL (seperti "---", "***", "___", atau deretan tanda hubung "------") di bawah judul bab, di antara subbab, maupun di sela-sela paragraf narasi. Transisi antar-paragraf dan antar-bab wajib murni mengalir alami melalui spasi paragraf normal tanpa garis pemisah mekanis.

Keluarkan hasil dalam format JSON:

{
  "chapterMarkdown": "Isi lengkap bab dalam format Markdown...",
  "keyTakeawaysSummary": "Ringkasan 2 kalimat fakta kunci & argumen bab ini untuk dioper ke bab berikutnya"
}`;

    const completion = await openaiClient.chat.completions.create({
      model: 'gpt-4o',
      temperature: 0.35,
      max_tokens: 3500,
      response_format: { type: 'json_object' },
      messages: [
        {
          role: 'system',
          content:
            'Anda adalah penulis kebijakan eksekutif papan atas. Patuhi seluruh kaidah mikrolinguistik, SPOK aktif, dan hapus koma sebelum kata dan.',
        },
        { role: 'user', content: chapterPrompt },
      ],
    });

    const parsed = JSON.parse(completion.choices[0]?.message?.content || '{}');
    const tokens = (completion.usage?.prompt_tokens || 0) + (completion.usage?.completion_tokens || 0);

    const rawMarkdown = parsed.chapterMarkdown || `${headingDirective}\n\n(Konten bab)`;
    const sanitizedMarkdown = TwoStageArticleEngine.normalizeFormattingSpaces(
      MasterEditorialSanitizer.sanitize(rawMarkdown)
    );

    return {
      chapterMarkdown: sanitizedMarkdown,
      chapterSummary: parsed.keyTakeawaysSummary ? MasterEditorialSanitizer.sanitize(parsed.keyTakeawaysSummary) : '',
      tokensUsed: tokens,
    };
  }

  /**
   * Sanitizer Mikrolinguistik Pasca-Generasi (Delegasi ke MasterEditorialSanitizer untuk backward-compatibility)
   */
  public static sanitizeMicroLinguistics(rawMarkdown: string): string {
    return MasterEditorialSanitizer.sanitize(rawMarkdown);
  }

  /**
   * Normalisasi spasi dan jarak antar-paragraf agar rapi, padat, dan best-practices:
   * 1. Melindungi tabel Markdown (| ... | dan | --- |) agar tidak pecah/hancur
   * 2. Melindungi blok diagram / chart / visual slot (:::chart, :::metric, <!-- VISUAL_SLOT -->)
   * 3. Menghilangkan spasi ganda dan trailing whitespace pada baris teks biasa
   * 4. Merapikan tanda baca pada kalimat narasi tanpa merusak format tabel
   * 5. MENGHILANGKAN garis pembatas mandiri (---, ***, ___, ====) di antara bab atau paragraf (Master Editorial Rules)
   * 6. Membatasi penumpukan baris kosong berlebih (maksimal 2 newline berturut-turut \n\n)
   */
  public static normalizeFormattingSpaces(rawText: string): string {
    if (!rawText || typeof rawText !== 'string') return '';

    const lines = rawText.split(/\r?\n/);
    const processedLines: string[] = [];

    let inSpecialBlock = false;

    for (let i = 0; i < lines.length; i++) {
      let line = lines[i];
      const trimmed = line.trim();

      // Cek apakah ini blok chart / metric
      if (trimmed.startsWith(':::')) {
        inSpecialBlock = !inSpecialBlock;
        processedLines.push(line.trimEnd());
        continue;
      }
      if (inSpecialBlock) {
        processedLines.push(line.trimEnd());
        continue;
      }

      // Lindungi baris tabel Markdown (yang diawali atau memuat karakter '|')
      const isTableRow = trimmed.startsWith('|') || (trimmed.endsWith('|') && trimmed.includes('|'));
      if (isTableRow) {
        // Baris tabel: HINDARI regex tanda baca & penggantian '---' yang merusak delimiter kolom
        processedLines.push(trimmed);
        continue;
      }

      // Lindungi penanda visual slot HTML comment
      if (trimmed.startsWith('<!--') && trimmed.endsWith('-->')) {
        processedLines.push(trimmed);
        continue;
      }

      // Cek apakah baris ini adalah horizontal rule / garis pemisah mandiri (---, ***, ___, ====, dsb.)
      // Master Editorial Rules: buang garis pemisah ini agar transisi bab/paragraf mengalir alami
      if (/^[ \t]*[-*_=]{3,}[ \t]*$/.test(line)) {
        continue; // Buang garis pemisah horizontal
      }

      // Normalisasi teks narasi / paragraf biasa:
      line = line.trimEnd();

      // Satukan spasi horizontal berlebih di dalam baris
      line = line.replace(/([^\t ])[ \t]{2,}([^\t ])/g, '$1 $2');

      // Hapus spasi sebelum tanda baca
      line = line.replace(/\s+([,.:;?!])/g, '$1');

      // Pastikan ada tepat 1 spasi setelah tanda baca jika diikuti huruf/kata
      line = line.replace(/([,;?!])([a-zA-Z])/g, '$1 $2');
      line = line.replace(/\.([a-zA-Z]{2,})/g, '. $1');

      // Rapikan spasi di dalam tanda kurung
      line = line.replace(/\(\s+/g, '(').replace(/\s+\)/g, ')');

      processedLines.push(line);
    }

    // Gabungkan kembali
    let result = processedLines.join('\n');

    // Rampingkan baris kosong berlebih: maksimal 2 newline (\n\n) agar tidak ada kekosongan masif
    result = result.replace(/\n{3,}/g, '\n\n');

    return result.trim();
  }

  /**
   * Eksekusi End-to-End Two-Stage Pipeline
   */
  public static async execute(params: GenerateArticleParams): Promise<GeneratedArticleResult> {
    const profile = EditorialStyleProfileResolver.resolve(params.writingStyle, params.framingStance);

    const telemetry = AiTelemetryService.startTrace({
      operation: 'generate-two-stage-modular-article',
      model: 'gpt-4o',
      tenantId: params.tenantId,
      metadata: {
        topic: params.topic,
        targetLength: params.targetLength,
        writingStyle: profile.style,
        framingStance: params.framingStance,
      },
    });

    try {
      const lengthPlan = this.resolveLengthPlan(params.targetLength);

      // 1. TAHAP 1: Generate Outline
      if (params.onProgress) {
        await params.onProgress(
          `Merumuskan Cetak Biru Naskah (${profile.label})...`,
          25
        );
      }
      const { outline, tokensUsed: outlineTokens } = await this.generateOutline(params, lengthPlan);

      let totalTokens = outlineTokens;
      const chapterContents: string[] = [];
      let runningSummary = '';

      // 2. TAHAP 2: Ekspansi Bab Berantai (Staggered Context Chaining)
      const totalChapters = outline.chapters.length;
      for (let idx = 0; idx < totalChapters; idx++) {
        const chapter = outline.chapters[idx];
        const progressPercent = 30 + Math.round(((idx + 1) / totalChapters) * 35); // 30% -> 65%

        if (params.onProgress) {
          await params.onProgress(
            `Menguraikan Naskah ${chapter.chapterNumber}: "${chapter.title}" (${idx + 1}/${totalChapters})...`,
            progressPercent
          );
        }

        const chapterResult = await this.generateChapter(
          chapter,
          outline.title,
          params,
          runningSummary
        );

        chapterContents.push(chapterResult.chapterMarkdown);
        runningSummary = chapterResult.chapterSummary;
        totalTokens += chapterResult.tokensUsed;
      }

      // Gabungkan keseluruhan naskah secara bersih dan padat
      const rawCombined = [
        `# ${outline.title}`,
        `> **Ringkasan Eksekutif:** ${outline.excerpt}`,
        ...chapterContents,
      ].join('\n\n');

      const fullMarkdown = TwoStageArticleEngine.normalizeFormattingSpaces(rawCombined);

      const wordCount = fullMarkdown.split(/\s+/).filter(Boolean).length;

      if (params.onProgress) {
        await params.onProgress('Menyelesaikan Konsolidasi Naskah & Pemeriksaan Integritas Data...', 68);
      }

      await telemetry.endTrace({
        inputTokens: Math.round(totalTokens * 0.4),
        outputTokens: Math.round(totalTokens * 0.6),
        status: 'SUCCESS',
        outputPreview: {
          title: outline.title,
          wordCount,
          chaptersGenerated: totalChapters,
          style: profile.style,
        },
      });

      return {
        title: outline.title,
        excerpt: outline.excerpt,
        contentMarkdown: fullMarkdown,
        wordCount,
        totalTokensUsed: totalTokens,
        canonicalTraceId: telemetry.canonicalTraceId,
      };
    } catch (error: any) {
      await telemetry.endTrace({
        inputTokens: 0,
        outputTokens: 0,
        status: 'FAILED',
        errorMessage: error.message,
      });
      throw new Error(`[TwoStageArticleEngineError] Gagal menyusun naskah artikel: ${error.message}`);
    }
  }
}
