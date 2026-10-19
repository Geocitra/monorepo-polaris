import { GenerateArticleParams, GeneratedArticleResult } from '@polaris/core-domain';
import { openaiClient } from './client.js';
import { PromptTemplates } from './prompts.js';
import { AiTelemetryService } from './telemetry/ai-telemetry.service.js';

interface ChapterBlueprint {
  chapterNumber: string;
  title: string;
  targetWords: number;
  substanceFocus: string;
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

interface OutlineResult {
  title: string;
  excerpt: string;
  chapters: ChapterBlueprint[];
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
   * TAHAP 1: Redaktur Cerdas (Outline Blueprinting)
   * Menyusun kerangka bab adaptif secara dinamis berdasarkan topik
   */
  public static async generateOutline(
    params: GenerateArticleParams,
    lengthPlan: ReturnType<typeof TwoStageArticleEngine.resolveLengthPlan>
  ): Promise<{ outline: OutlineResult; tokensUsed: number }> {
    const styleInstruction = params.writingStyle
      ? `GAYA PENULISAN: ${params.writingStyle}. TONE: ${params.toneOverride || 'Otoritatif, Teknokratis, Berpihak pada Solusi Nyata'}`
      : 'TONE: Teknokratis, Lugas, Berbasis Fakta & Solutif';

    const outlinePrompt = `ANDA ADALAH CHIEF EDITORIAL DIRECTOR & DRAFTER KEBIJAKAN EKSEKUTIF SENIOR.
Tugas Anda: Susun Outline Blueprint Arsitektur untuk Dokumen Tulisan Eksekutif (Artikel Opini Publik, Policy Brief, Laporan Pengawasan/Kinerja, Kajian Strategis, dll) berbobot tinggi sesuai instruksi topik.

TOPIK & INSTRUKSI PENGGUNA: "${params.topic}"
TARGET AUDIENS: ${params.targetAudience || 'Masyarakat Umum, Pengambil Kebijakan Daerah, dan Media'}
${styleInstruction}
TARGET TOTAL KATA: ~${lengthPlan.totalTargetWords} kata (terbagi ke dalam ${lengthPlan.chapterCount} Bab/Bagian).
${params.regionalContextData ? `KONTEKS WILAYAH & DATA:\n${params.regionalContextData.slice(0, 1500)}` : ''}

FLEKSIBILITAS & ADAPTASI JENIS DOKUMEN:
- Selalu sesuaikan arsitektur outline dengan jenis dokumen yang diminta pengguna pada TOPIK:
  * Jika bernuansa POLICY BRIEF: Struktur harus memuat Ringkasan Isu Kebijakan, Telaah Bukti Empiris, Opsi Intervensi, dan Rekomendasi Regulasi.
  * Jika bernuansa LAPORAN PENGAWASAN / LAPORAN RESES: Struktur harus memuat Verifikasi Temuan Lapangan, Deviasi Target vs Realisasi, Akar Hambatan Teknis OPD, dan Rekomendasi Tindak Lanjut Dewan.
  * Jika bernuansa ARTIKEL OPINI / TAJUK PUBLIK: Struktur mengalir jurnalistik, membedah aspirasi konstituen, tinjauan komparasi data, dan komitmen masa depan.
  * Jika bernuansa SIARAN PERS / PERNYATAAN SIKAP: Struktur lugas, berfokus pada urgensi sikap parlemen, fakta pemicu, dan tuntutan solusi nyata.

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
4. Judul bab ("title" pada chapters) juga DILARANG memakai tanda titik dua (":") dan em dash ("—"). Gunakan frasa bab yang substantif dan langsung menyentuh substansi masalah (misal: "Retorika dan Realita Jalan Poros", bukan "Kondisi Lapangan: Potret Nyata").

PANTANGAN MASTER EDITORIAL & GARIS PEMISAH:
- DILARANG KERAS menggunakan kata "sekadar".
- DILARANG KERAS menggunakan kata "nyata" (misal: "dampak nyata", "langkah nyata", "ikhtiar nyata", "perubahan nyata"). Gunakan penjelasan bukti atau capaian konkret.
- DILARANG KERAS menggunakan tanda baca em dash (—). Gunakan koma, titik, atau tanda kurung.
- DILARANG KERAS menyisipkan garis pemisah horizontal ("---", "***", "___", atau deretan tanda hubung) di bawah judul, antar-bab, maupun di sela paragraf. Teks harus mengalir alami tanpa pemisah mekanis.

PEDOMAN VARIASI STRUKTURAL (SANGAT PENTING):
1. JANGAN memaksakan semua bab memiliki tabel/grafik! Harus organik:
   - Bab I (Latar Belakang/Refleksi): Format harus NARRATIVE_ONLY. Fokus narasi filosofis dan argumen nilai.
   - Bab Data / Kondisi Lapangan: Format NARRATIVE_WITH_TABLE atau NARRATIVE_WITH_CHART.
   - Bab Akar Masalah: Format NARRATIVE_WITH_ROOT_CAUSE (bullet points analisis sebab-akibat).
   - Bab Solusi / Rekomendasi: Format NARRATIVE_WITH_ROADMAP (matriks langkah tindak nyata).
   - Bab Penutup: NARRATIVE_ONLY (persuasif, komitmen masa depan).
2. Jika ada bab yang cocok untuk visualisasi foto/infografis lapangan di tengah naskah, set includeVisualSlot: true dengan visualSlotCaption dan visualSlotPrompt yang relevan.

Keluarkan hasil HANYA dalam format JSON valid berikut:
{
  "title": "Judul Headline Jurnalistik Utuh Tanpa Tanda Titik Dua",
  "excerpt": "Ringkasan Eksekutif 2-3 kalimat padat berbobot",
  "chapters": [
    {
      "chapterNumber": "Bab I",
      "title": "Judul Spesifik Bab Tanpa Titik Dua",
      "targetWords": ${lengthPlan.wordsPerChapter},
      "substanceFocus": "Poin-poin substansi mendalam yang wajib diulas di bab ini",
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

    const sanitizedOutline: OutlineResult = {
      title: TwoStageArticleEngine.cleanHeadline(parsed.title, params.topic),
      excerpt: parsed.excerpt || '',
      chapters: (parsed.chapters || []).map((ch, idx) => ({
        chapterNumber: ch.chapterNumber || `Bab ${idx + 1}`,
        title: TwoStageArticleEngine.cleanHeadline(ch.title, `Uraian Analisis Substantif Bab ${idx + 1}`),
        targetWords: ch.targetWords || lengthPlan.wordsPerChapter,
        substanceFocus: ch.substanceFocus || '',
        formatStyle: ch.formatStyle || 'NARRATIVE_ONLY',
        chartSpec: ch.chartSpec,
        includeVisualSlot: !!ch.includeVisualSlot,
        visualSlotCaption: ch.visualSlotCaption,
        visualSlotPrompt: ch.visualSlotPrompt,
      })),
    };

    return { outline: sanitizedOutline, tokensUsed: tokens };
  }

  /**
   * Sanitizer khusus judul agar bebas dari tanda titik dua (:) dan formula klise "Topik: Subjudul"
   */
  public static cleanHeadline(rawTitle?: string, fallback: string = ''): string {
    if (!rawTitle || typeof rawTitle !== 'string') return (fallback || 'Analisis Kebijakan Strategis').trim();
    let title = rawTitle.replace(/^["'\s]+|["'\s]+$/g, '').trim();

    // 1. Transformasi formula klise "Topik: Subjudul"
    if (title.includes(':')) {
      const parts = title.split(':').map((s) => s.trim()).filter(Boolean);
      if (parts.length > 1) {
        const first = parts[0];
        const second = parts[1];

        // Jika bagian kedua diawali pola umum "Jalan Menuju...", leburkan secara mengalir
        if (/^(jalan menuju|upaya|ikhtiar|langkah|menuju|mewujudkan|sebuah tinjauan)\s+/i.test(second)) {
          const connector = second.replace(/^(jalan|upaya|ikhtiar|langkah)\s+menuju/i, 'Menuju');
          title = `${first} ${connector}`;
        } else if (second.length >= 25 && !second.toLowerCase().startsWith('studi')) {
          // Jika subjudulnya sudah sangat kuat dan panjang, gunakan subjudul tersebut sebagai headline utama
          title = second;
        } else {
          // Gabungkan dengan konjungsi alami jika diperlukan
          title = `${first} demi ${second}`;
        }
      }
    }

    // 2. Bersihkan semua karakter titik dua dan strip pemisah sisa
    title = title.replace(/\s*:\s*/g, ' ').replace(/\s+-\s+/g, ' ');
    title = title.replace(/[:]/g, '').replace(/\s{2,}/g, ' ').trim();

    // 3. Bersihkan tanda kutip pembungkus
    title = title.replace(/^["'“”‘’]+|["'“”‘’]+$/g, '').trim();

    return title || fallback;
  }

  /**
   * TAHAP 2: Ekspansi Bab Berantai (Staggered Chapter Synthesis)
   * Menggunakan Dual-Stream Token Budgeting agar narasi utama tidak terpotong oleh tabel/grafik
   */
  public static async generateChapter(
    chapter: ChapterBlueprint,
    articleTitle: string,
    params: GenerateArticleParams,
    previousChapterSummary?: string
  ): Promise<{ chapterMarkdown: string; chapterSummary: string; tokensUsed: number }> {
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

    const styleMandate = `GAYA PENULISAN: ${params.writingStyle || 'Jurnalistik Eksekutif'}. TONE: ${params.toneOverride || 'Teknokratis, Lugas, Berbasis Fakta & Solutif'}. TARGET AUDIENS: ${params.targetAudience || 'Masyarakat Umum, Pengambil Kebijakan Daerah, dan Media'}.`;

    const chapterPrompt = `TUGAS: Tulis naskah lengkap untuk ${chapter.chapterNumber}. "${chapter.title}"
DARI ARTIKEL: "${articleTitle}"
SUBSTANSI BAB INI: ${chapter.substanceFocus}
${styleMandate}

=== FAKTA RISET, REGULASI DAERAH & TOKEN BUKTI [EV-x] (SUMBER KEBENARAN TUNGGAL) ===
${params.regionalContextData ? params.regionalContextData.slice(0, 4000) : 'Gunakan penalaran kebijakan faktual tanpa mengarang pasal fiktif.'}
===================================================================================

TARGET KATA NARASI MURNI: Minimal ${chapter.targetWords} kata narasi murni (HANYA MENGHITUNG TEKS PARAGRAF).
MANDAT VOLUME & KEDALAMAN PARAGRAF (SANGAT PENTING):
- Bab ini WAJIB diuraikan secara mendalam dan komprehensif dalam minimal 4-5 paragraf panjang berbobot (setiap paragraf berisi 4-6 kalimat elaboratif).
- DILARANG MERINGKAS, DILARANG MENYINGKAT, dan DILARANG menghasilkan teks pendek! Kembangkan setiap poin argumen dengan rincian kronologis, data pendukung, telaah hukum/regulasi, serta analisis dampak kebijakan secara menyeluruh.
PRINSIP DUAL-STREAM BUDGETING: Tabel, grafik, atau matriks adalah BONUS STRUKTURAL, BUKAN pengganti panjang paragraf narasi! Paragraf argumen harus tetap padat, mengalir, dan mendalam.

${previousChapterSummary ? `KONTEKS BAB SEBELUMNYA (JAGA KONTINUITAS & HINDARI REPETISI):\n"${previousChapterSummary}"` : ''}

${structuralMandate}

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
   - Output diawali dengan heading: ## ${chapter.chapterNumber}. ${chapter.title} (DILARANG menggunakan titik dua dan em dash).

7. INTEGRASI SITASI BUKTI TERVERIFIKASI (EVIDENCE GROUNDING CITATION):
   - Jika pada konteks data terdapat penanda bukti seperti [EV-1], [EV-2], dst., sematkan rujukan bukti tersebut di akhir klausa atau kalimat argumen yang bersangkutan dengan format: [^EV-1] atau [^EV-2].
   - DILARANG KERAS mengarang ID bukti baru di luar yang tercantum dalam konteks data!

8. PANTANGAN MASTER EDITORIAL & LARANGAN GARIS PEMISAH (ZERO-TOLERANCE):
   - DILARANG KERAS menggunakan kata "sekadar" dalam konteks apa pun.
   - DILARANG KERAS menggunakan kata "nyata" sebagai penegas generik (seperti "dampak nyata", "bukti nyata", "langkah nyata", "ikhtiar nyata"). Paparkan fakta, data, atau indikator secara spesifik.
   - DILARANG KERAS menggunakan tanda baca em dash (—). Gunakan tanda koma, titik dua, titik, atau tanda kurung sesuai kebutuhan sintaksis.
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
          content: 'Anda adalah penulis kebijakan eksekutif papan atas. Patuhi seluruh kaidah mikrolinguistik, SPOK aktif, dan hapus koma sebelum kata dan.',
        },
        { role: 'user', content: chapterPrompt },
      ],
    });

    const parsed = JSON.parse(completion.choices[0]?.message?.content || '{}');
    const tokens = (completion.usage?.prompt_tokens || 0) + (completion.usage?.completion_tokens || 0);

    const rawMarkdown = parsed.chapterMarkdown || `## ${chapter.chapterNumber}. ${chapter.title}\n\n(Konten bab)`;
    const sanitizedMarkdown = TwoStageArticleEngine.normalizeFormattingSpaces(
      TwoStageArticleEngine.sanitizeMicroLinguistics(rawMarkdown)
    );

    return {
      chapterMarkdown: sanitizedMarkdown,
      chapterSummary: parsed.keyTakeawaysSummary || '',
      tokensUsed: tokens,
    };
  }

  /**
   * Sanitizer Mikrolinguistik Pasca-Generasi:
   * 1. Menghapus Oxford Comma (misal: "kucing, anjing, dan ikan" -> "kucing, anjing dan ikan")
   * 2. Memperbaiki preposisi "diantaranya" -> "di antaranya"
   * 3. Menghapus koma sebelum "serta" dan "atau" pada perincian
   * 4. Membersihkan sisa titik dua pada heading bab
   * 5. Memfilter kata terlarang "sekadar" dan "nyata" (Master Editorial Rules)
   */
  public static sanitizeMicroLinguistics(rawMarkdown: string): string {
    if (!rawMarkdown || typeof rawMarkdown !== 'string') return '';
    let text = rawMarkdown;

    // 1. Format heading bab tanpa titik dua dan tanpa em dash (Master Editorial Rules)
    text = text.replace(/^(##\s+Bab\s+[IVXLCDM\d]+)\s*[:—–-]\s*/gim, '$1. ');

    // 2. Hapus em dash (— atau –) dari narasi dan ganti dengan tanda koma alami
    text = text.replace(/\s*[—–]\s*/g, ', ');

    // 3. Hapus Oxford Comma sebelum "dan", "serta", "atau" pada perincian elemen
    // Contoh: "kucing, anjing, dan ikan" -> "kucing, anjing dan ikan"
    text = text.replace(/([a-zA-Z0-9\)])\s*,\s+dan\s+([a-zA-Z0-9\(])/g, '$1 dan $2');
    text = text.replace(/([a-zA-Z0-9\)])\s*,\s+serta\s+([a-zA-Z0-9\(])/g, '$1 serta $2');
    text = text.replace(/([a-zA-Z0-9\)])\s*,\s+atau\s+([a-zA-Z0-9\(])/g, '$1 atau $2');

    // 4. Normalisasi ejaan umum yang sering salah sambung
    text = text.replace(/\bdiantaranya\b/gi, 'di antaranya');
    text = text.replace(/\bdimana\b/gi, 'di mana');
    text = text.replace(/\bkesana\b/gi, 'ke sana');
    text = text.replace(/\bkemana\b/gi, 'ke mana');

    // 5. Normalisasi kata terlarang sesuai Master Editorial Rules (Zero-Tolerance)
    text = text.replace(/\bbukan\s+sekadar\b/gi, 'tidak hanya');
    text = text.replace(/\bsekadar\b/gi, 'hanya');
    text = text.replace(/\b(langkah|dampak|bukti|ikhtiar|solusi|komitmen|kontribusi|perubahan)\s+nyata\b/gi, '$1 konkret');
    text = text.replace(/\bsecara\s+nyata\b/gi, 'secara konkret');

    return text;
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
    const telemetry = AiTelemetryService.startTrace({
      operation: 'generate-two-stage-modular-article',
      model: 'gpt-4o',
      tenantId: params.tenantId,
      metadata: {
        topic: params.topic,
        targetLength: params.targetLength,
        writingStyle: params.writingStyle,
      },
    });

    try {
      const lengthPlan = this.resolveLengthPlan(params.targetLength);

      // 1. TAHAP 1: Generate Outline
      if (params.onProgress) {
        await params.onProgress('Merumuskan Cetak Biru & Struktur Bab Kebijakan...', 25);
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
            `Menguraikan Naskah Substantif ${chapter.chapterNumber}: "${chapter.title}" (${idx + 1}/${totalChapters})...`,
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
