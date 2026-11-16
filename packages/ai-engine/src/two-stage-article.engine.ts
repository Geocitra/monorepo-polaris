import { GenerateArticleParams, GeneratedArticleResult } from '@polaris/core-domain';
import { getTextCompletionClient } from './client.js';
import { PromptTemplates } from './prompts.js';
import { AiTelemetryService } from './telemetry/ai-telemetry.service.js';
import { MasterEditorialSanitizer } from './master-editorial-sanitizer.js';
import { PartyIdeologyResolver } from './party/party-ideology.resolver.js';
import { ArticleLengthPlan, ArticleLengthPlanner } from './editorial/article-length.planner.js';
import {
  EditorialStyleProfile,
  EditorialStyleProfileResolver,
  MASTER_EDITORIAL_CORE_RULES,
} from './editorial/editorial-style.resolver.js';

export { EditorialStyleProfile, EditorialStyleProfileResolver, ArticleLengthPlanner };

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

export class TwoStageArticleEngine {
  /**
   * Mengatur target panjang naskah & distribusi kata per bab secara dinamis
   */
  public static resolveLengthPlan(targetLength?: string): ArticleLengthPlan {
    return ArticleLengthPlanner.resolve(targetLength);
  }

  /**
   * TAHAP 1: Redaktur Cerdas (Outline Blueprinting dengan Auto-Detail Expansion)
   * Menyusun kerangka bab adaptif secara dinamis berdasarkan topik, profil gaya penulisan, dan dekomposisi paragraf
   */
  public static async generateOutline(
    params: GenerateArticleParams,
    lengthPlan: ReturnType<typeof TwoStageArticleEngine.resolveLengthPlan>,
    ideologyDirective?: string
  ): Promise<{ outline: OutlineResult; tokensUsed: number; inputTokens: number; outputTokens: number }> {
    const profile = EditorialStyleProfileResolver.resolve(params.writingStyle, params.framingStance);

    const outlinePrompt = `ANDA ADALAH CHIEF EDITORIAL DIRECTOR & DRAFTER KEBIJAKAN EKSEKUTIF SENIOR.
Tugas Anda: Susun Outline Blueprint Arsitektur untuk Dokumen Tulisan Eksekutif (Artikel Opini Publik, Policy Brief, Laporan Pengawasan/Kinerja, Kajian Strategis, dll) berbobot tinggi sesuai instruksi topik dan profil gaya penulisan terpilih.

TOPIK & INSTRUKSI PENGGUNA: "${params.topic}"
TARGET AUDIENS: ${params.targetAudience || 'Masyarakat Umum, Pengambil Kebijakan Daerah, dan Media'}
PROFIL GAYA PENULISAN: ${profile.label} (${profile.style})
TONE & KARAKTER: ${params.toneOverride || profile.toneDirective}
TARGET TOTAL KATA: ~${lengthPlan.totalTargetWords} kata (terbagi ke dalam ${lengthPlan.chapterCount} Bab/Bagian).
${ideologyDirective ? `\n=== DOKTRIN & HALUAN PARTAI/FRAKSI ===\n${ideologyDirective}\n(Pastikan rancangan kerangka bab mencerminkan sikap dan keberpihakan ideologi partai di atas tanpa menjadi propaganda murahan!)\n======================================\n` : ''}${profile.framingMandate ? `${profile.framingMandate}\n` : ''}${params.regionalContextData ? `KONTEKS WILAYAH & DATA:\n${params.regionalContextData.slice(0, 2000)}` : ''}

ANATOMI ALUR BAB YANG DIHARUSKAN UNTUK GAYA ${profile.style}:
${profile.chapterAnatomyDirectives.map((d) => `- ${d}`).join('\n')}

PEDOMAN FORMAT HEADING BAB (BR-01):
${profile.headingFormat === 'JOURNALISTIC_FLOW'
        ? '- GAYA POPULER: DILARANG menggunakan kata "Bab I", "Bab II", dst pada "chapterNumber" maupun "title"! Gunakan judul subbab jurnalistik mengalir yang memikat (misal: "Menanti Janji di Ujung Aspal", "Antara Kuota Pupuk dan Keringat Petani"). Set "chapterNumber" menjadi "Bagian 1", "Bagian 2", dst.'
        : '- GAYA FORMAL/TEKNOKRATIS: Gunakan penomoran "chapterNumber": "Bab I", "Bab II", dst, dengan "title" yang substantif tanpa tanda titik dua.'
      }

DEKOMPOSISI DETAIL BERTINGKAT (AUTO-DETAIL EXPANSION - BR-02):
Untuk setiap bab pada "chapters" (WAJIB tepat ${lengthPlan.chapterCount} bab/bagian), bedah rencana penulisan ke dalam sub-elemen berikut:
1. "coreThesis": 1 kalimat proposisi pokok yang ingin dibuktikan atau diargumentasikan di bab tersebut.
2. "paragraphSubPoints": Array berisi tepat ${lengthPlan.subPointsPerChapter} string rencana alur bahasan rinci dari paragraf pertama hingga paragraf penutup bab agar mencapai target ~${lengthPlan.wordsPerChapter} kata per bab.
3. "assignedEvidenceTokens": Array string berisi token bukti (misal: ["EV-1", "EV-2"]) yang relevan untuk dikutip di bab ini dari konteks data riset agar sitasi tersebar proporsional.

${MASTER_EDITORIAL_CORE_RULES}

PEDOMAN PERUMUSAN JUDUL (SANGAT PENTING - WAJIB DIPATUHI):
1. DILARANG KERAS MENGGUNAKAN TANDA TITIK DUA (":") baik pada judul artikel maupun judul bab!
2. DILARANG pola judul dua frasa yang digabung dengan koma (misal "Membangun Desa, Menjaga Masa Depan") dan judul puitis abstrak ("Perjalanan yang Belum Selesai").
3. HINDARI FORMULA KLISE AKADEMIS/MAKALAH seperti pola "Topik: Subjudul Penjelas".
4. Buatlah judul artikel sebagai SATU KESATUAN TAJUK (HEADLINE) JURNALISTIK EKSEKUTIF yang spesifik, menunjukkan persoalan/kebijakan/aktor utama, dan mengalir alami.
5. Judul bab ("title" pada chapters) juga DILARANG memakai tanda titik dua (":") dan em dash ("—").

PEDOMAN VARIASI STRUKTURAL ORGANIK:
- Bab I / Bagian 1 (Menetapkan Persoalan): Format NARRATIVE_ONLY.
- Bab Data / Kondisi Lapangan: Format NARRATIVE_WITH_TABLE atau NARRATIVE_WITH_CHART.
- Bab Akar Masalah & Mekanisme Kebijakan: Format NARRATIVE_WITH_ROOT_CAUSE atau NARRATIVE_ONLY.
- Bab Solusi / Implikasi: Format NARRATIVE_WITH_ROADMAP atau NARRATIVE_ONLY.
- Bab Penutup (Sintesis Analitis): NARRATIVE_ONLY (akhiri dengan sintesis implikasi kebijakan konkret, DILARANG slogan motivasional).
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

    const { client, resolveModel } = getTextCompletionClient();
    const model = resolveModel('gpt-4o', 'gemini-2.5-pro');
    const completion = await client.chat.completions.create({
      model,
      temperature: 0.35,
      response_format: { type: 'json_object' },
      messages: [
        {
          role: 'system',
          content: 'Anda adalah perancang outline naskah eksekutif terkemuka. Keluarkan output JSON valid tanpa titik dua dan tanpa pola koma dua-frasa pada judul.',
        },
        { role: 'user', content: outlinePrompt },
      ],
    });

    const parsed = JSON.parse(completion.choices[0]?.message?.content || '{}') as OutlineResult;
    const inputTokens = completion.usage?.prompt_tokens || 0;
    const outputTokens = completion.usage?.completion_tokens || 0;
    const tokens = inputTokens + outputTokens;

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

    return { outline: sanitizedOutline, tokensUsed: tokens, inputTokens, outputTokens };
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
    previousChapterSummary?: string,
    ideologyDirective?: string
  ): Promise<{
    chapterMarkdown: string;
    chapterSummary: string;
    tokensUsed: number;
    inputTokens: number;
    outputTokens: number;
  }> {
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
${ideologyDirective ? `\n=== DOKTRIN KEBIJAKAN & DIKSI KHAS PARTAI/FRAKSI ===\n${ideologyDirective}\n(Selaraskan argumen bab dengan doktrin di atas, sematkan diksi pilihan secara natural, dan patuhi seluruh pantangan narasi!)\n====================================================\n` : ''}${profile.framingMandate ? `${profile.framingMandate}\n` : ''}
RENCANA ALUR PARAGRAF WAJIB (AUTO-DETAIL EXPANSION - BR-02):
${subPointsDirective}

${evidenceDirective}

=== FAKTA RISET, REGULASI DAERAH & TOKEN BUKTI [EV-x] (SUMBER KEBENARAN TUNGGAL) ===
${params.regionalContextData ? params.regionalContextData.slice(0, 4000) : 'Gunakan penalaran kebijakan faktual tanpa mengarang pasal fiktif.'}
===================================================================================

TARGET KATA NARASI MURNI: Minimal ${chapter.targetWords} kata narasi murni (HANYA MENGHITUNG TEKS PARAGRAF, bukan tabel/grafik).
MANDAT VOLUME & KEDALAMAN PARAGRAF (WAJIB):
- Uraikan setiap sub-poin paragraf di atas menjadi paragraf penuh yang padat (minimal 100-130 kata per sub-poin) agar total bab mencapai minimal ${chapter.targetWords} kata.
- Jelaskan mekanisme kerja kebijakan, aktor yang terlibat, sumber daya/anggaran, insentif, konsekuensi, serta perspektif tandingan bila relevan.
- DILARANG MERINGKAS atau menghasilkan teks pendek! Tabel, grafik, atau matriks adalah BONUS STRUKTURAL, bukan pengganti panjang paragraf narasi.

${previousChapterSummary ? `KONTEKS BAB SEBELUMNYA (JAGA KONTINUITAS & HINDARI REPETISI):\n"${previousChapterSummary}"` : ''}

${structuralMandate}

${MASTER_EDITORIAL_CORE_RULES}

ATURAN KHUSUS PROFIL ${profile.style}:
${profile.chapterPromptGuidelines}

ATURAN TATA BAHASA, EJAAN & MIKROLINGUISTIK:
1. PENEGAKAN STRUKTUR SPOK AKTIF: Cantumkan subjek pelaku/aktor kebijakan yang jelas di depan klausa.
2. LARANGAN OXFORD COMMA: Pada perincian 3+ elemen, dilarang koma sebelum "dan", "atau", "serta".
3. PREPOSISI ALAMI: "di antaranya", "di mana", "ke depan" (dipisah spasi).
4. KAMUS HITAM DIKSI KLISE AI: Dilarang "angin segar", "tonggak bersejarah", "garda terdepan", "merajut asa", "sinergi yang komprehensif", "pada hakikatnya", "seyogianya", "niscaya", "bukan sekadar... melainkan juga...".
5. RITME KALIMAT VARIATIF: Selingi kalimat pendek tegas (5-8 kata) dengan kalimat analisis elaboratif (15-20 kata).
6. LARANGAN PEMBUKA KLISE: Dilarang "Dalam era globalisasi...", "Sebagaimana kita ketahui...", "Seiring perkembangan zaman...".
7. SITASI BUKTI: Sematkan [^EV-x] sesuai konteks data; jangan mengarang ID bukti fiktif.

FORMAT OUTPUT WAJIB:
- Keluarkan LANGSUNG dalam format Markdown murni (JANGAN bungkus dengan JSON atau code block \`\`\`markdown).
- Awali tepat dengan heading: ${headingDirective}
- Di baris paling akhir setelah seluruh paragraf selesai, tambahkan tepat 1 baris penanda ringkasan:
<!-- CHAPTER_SUMMARY: Ringkasan 2 kalimat fakta kunci dan argumen bab ini -->`;

    const { client, resolveModel } = getTextCompletionClient();
    const model = resolveModel('gpt-4o', 'gemini-2.5-pro');
    const maxTokens = Math.min(6000, Math.max(2400, Math.ceil(chapter.targetWords * 4.5)));

    const completion = await client.chat.completions.create({
      model,
      temperature: 0.35,
      max_tokens: maxTokens,
      messages: [
        {
          role: 'system',
          content:
            'Anda adalah penulis kebijakan & editorial eksekutif papan atas. Tulis Markdown langsung secara mendalam sesuai target kata tanpa membungkus JSON.',
        },
        { role: 'user', content: chapterPrompt },
      ],
    });

    let rawContent = (completion.choices[0]?.message?.content || '').trim();
    let inputTokens = completion.usage?.prompt_tokens || 0;
    let outputTokens = completion.usage?.completion_tokens || 0;

    // Ekstrak dan bersihkan marker ringkasan bab
    let extractedSummary = '';
    const summaryMatch = rawContent.match(/<!--\s*CHAPTER_SUMMARY:\s*([\s\S]*?)-->/i);
    if (summaryMatch) {
      extractedSummary = summaryMatch[1].trim();
      rawContent = rawContent.replace(/<!--\s*CHAPTER_SUMMARY:[\s\S]*?-->/gi, '').trim();
    }

    let sanitizedMarkdown = TwoStageArticleEngine.normalizeFormattingSpaces(
      MasterEditorialSanitizer.sanitize(rawContent || `${headingDirective}\n\n(Konten bab)`)
    );

    // Mitigasi Panjang Kata: Maksimal 1x Expansion Pass jika narasi murni masih < 75% target bab
    const currentNarrativeWords = ArticleLengthPlanner.countNarrativeWords(sanitizedMarkdown);
    const minAcceptableWords = Math.floor(chapter.targetWords * 0.75);
    if (chapter.targetWords >= 400 && currentNarrativeWords < minAcceptableWords) {
      const deficitWords = chapter.targetWords - currentNarrativeWords;
      const expandPrompt = `Bab berikut baru memiliki ~${currentNarrativeWords} kata narasi, sedangkan target minimumnya adalah ${chapter.targetWords} kata (kurang ~${deficitWords} kata).
Lanjutkan dan perdalam pembahasan bab ini dengan menambahkan ${Math.max(200, deficitWords)} kata narasi baru berupa analisis mekanisme implementasi, perspektif tandingan yang terukur, dan implikasi jangka menengah tanpa mengulang kalimat yang sudah ada.
Kembalikan HANYA paragraf Markdown tambahan (tanpa mengulang heading bab atau menulis ringkasan).

Naskah Bab Saat Ini:
${sanitizedMarkdown.slice(0, 5000)}`;

      try {
        const expandCompletion = await client.chat.completions.create({
          model,
          temperature: 0.35,
          max_tokens: Math.min(3500, Math.max(1200, Math.ceil(deficitWords * 4.5))),
          messages: [
            {
              role: 'system',
              content:
                'Anda adalah editor substansi senior. Perdalam analisis bab tanpa basa-basi, patuhi SPOK aktif, tanpa kata "sekadar", "nyata", em dash, atau garis pemisah.',
            },
            { role: 'user', content: expandPrompt },
          ],
        });

        const expandedText = (expandCompletion.choices[0]?.message?.content || '').trim();
        inputTokens += expandCompletion.usage?.prompt_tokens || 0;
        outputTokens += expandCompletion.usage?.completion_tokens || 0;

        if (expandedText.length >= 100) {
          const cleanExpansion = TwoStageArticleEngine.normalizeFormattingSpaces(
            MasterEditorialSanitizer.sanitize(expandedText)
          );
          sanitizedMarkdown = TwoStageArticleEngine.normalizeFormattingSpaces(
            `${sanitizedMarkdown}\n\n${cleanExpansion}`
          );
        }
      } catch (expandErr: any) {
        console.warn(`[TwoStageArticleEngine] Gagal menjalankan expansion pass bab: ${expandErr?.message}`);
      }
    }

    const tokens = inputTokens + outputTokens;

    return {
      chapterMarkdown: sanitizedMarkdown,
      chapterSummary: extractedSummary ? MasterEditorialSanitizer.sanitize(extractedSummary) : '',
      tokensUsed: tokens,
      inputTokens,
      outputTokens,
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

      // Resolusi Doktrin & Ideologi Partai (jika ada partyAffiliation atau direktif eksplisit)
      let ideologyDirective = params.partyIdeologyDirective || '';
      if (!ideologyDirective && params.partyAffiliation) {
        try {
          const resolved = await PartyIdeologyResolver.resolveDirective({
            partyAffiliation: params.partyAffiliation,
            topic: params.topic,
          });
          ideologyDirective = resolved.promptInstructions;
        } catch (ideologyErr: any) {
          console.warn(`[TwoStageArticleEngine] Gagal resolve party ideology: ${ideologyErr.message}`);
        }
      }

      // 1. TAHAP 1: Generate Outline
      if (params.onProgress) {
        await params.onProgress(
          `Merumuskan Cetak Biru Naskah (${profile.label})...`,
          25
        );
      }
      const outlineRes = await this.generateOutline(params, lengthPlan, ideologyDirective);
      const { outline, tokensUsed: outlineTokens } = outlineRes;

      let totalTokens = outlineTokens;
      let totalInputTokens =
        outlineRes.inputTokens !== undefined
          ? outlineRes.inputTokens
          : Math.round(outlineTokens * 0.4);
      let totalOutputTokens =
        outlineRes.outputTokens !== undefined
          ? outlineRes.outputTokens
          : outlineTokens - totalInputTokens;

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
          runningSummary,
          ideologyDirective
        );

        chapterContents.push(chapterResult.chapterMarkdown);
        runningSummary = chapterResult.chapterSummary;
        totalTokens += chapterResult.tokensUsed;
        const chIn =
          chapterResult.inputTokens !== undefined
            ? chapterResult.inputTokens
            : Math.round(chapterResult.tokensUsed * 0.4);
        const chOut =
          chapterResult.outputTokens !== undefined
            ? chapterResult.outputTokens
            : chapterResult.tokensUsed - chIn;
        totalInputTokens += chIn;
        totalOutputTokens += chOut;
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
        inputTokens: totalInputTokens,
        outputTokens: totalOutputTokens,
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
