import {
  PreAnalyzedPosterBlueprint,
  CompiledPosterPrompt,
  SynthesizedEditorialCopy,
  SubjectCompositionMode,
  PosterLayoutVariant,
  PosterHeaderPlacement,
  PosterCardArrangement,
  LAYOUT_BLOCK_SCHEMA,
  LayoutBlockSpec,
} from './types.js';
import { openaiClient } from '../client.js';
import { resolveHarmoniousPalette, getRandomHarmoniousPalette } from './palettes.js';
import { TwoStageArticleEngine } from '../two-stage-article.engine.js';
import { MasterEditorialSanitizer } from '../master-editorial-sanitizer.js';
import { CompositionPlanner } from './composition-planner.js';
import { getActiveImageProvider, ImageGeneratorProvider } from '../config/image-provider.config.js';

export interface CompilePosterPromptOptions {
  topic: string;
  groundedContextSummary?: string; // Diambil dari hasil AutonomousResearchOrchestrator
  blueprint: PreAnalyzedPosterBlueprint;
  compositionMode?: SubjectCompositionMode;
  tenantBrandHex?: string;
  imageProvider?: ImageGeneratorProvider;
}

/**
 * Konversi nilai RGB dari string HEX ke deskripsi warna alami fotografi/seni rupa.
 * Mencegah model difusi mencetak kode HEX literal (seperti #F8FAFC) di atas kanvas gambar.
 */
export function hexToNaturalColorName(hex?: string, fallbackName = 'neutral tone'): string {
  if (!hex || typeof hex !== 'string') return fallbackName;
  const cleanHex = hex.trim().replace(/^#/, '').toLowerCase();
  if (!/^[0-9a-f]{3}$|^[0-9a-f]{6}$/.test(cleanHex)) return fallbackName;

  const fullHex =
    cleanHex.length === 3
      ? cleanHex
          .split('')
          .map((c) => c + c)
          .join('')
      : cleanHex;

  // Exact map untuk palet dan token desain umum polaris
  const exactMap: Record<string, string> = {
    'dc2626': 'deep crimson red',
    '9e0b0f': 'deep maroon red',
    'ea580c': 'warm terracotta orange',
    'fb923c': 'soft amber orange',
    'f5b800': 'vibrant golden amber',
    '0f172a': 'deep midnight navy',
    '1e293b': 'dark slate navy',
    '0a0a0a': 'deep charcoal black',
    '111827': 'rich dark charcoal',
    '18181b': 'deep charcoal black',
    'f8fafc': 'clean alabaster white',
    'f6f3eb': 'warm ivory cream',
    'f5f5f0': 'warm off-white',
    'f4f1ea': 'warm vintage paper cream',
    'ffffff': 'pure white',
    '000000': 'pitch black',
    '059669': 'deep emerald green',
    '10b981': 'vibrant emerald green',
    '2563eb': 'rich royal cobalt blue',
    '4f46e5': 'deep royal indigo',
    '7c3aed': 'regal purple',
    'e11d48': 'vibrant rose red',
    '881337': 'deep burgundy',
    'd97706': 'rich vintage amber',
    '0d9488': 'deep nordic teal',
    '14b8a6': 'vibrant turquoise teal',
    'f97316': 'warm sunset coral',
    '84cc16': 'vibrant lime accent',
    '64748b': 'cool slate gray',
    '94a3b8': 'soft muted slate',
    'cbd5e1': 'light slate gray',
    'e2e8f0': 'pale soft gray',
  };

  if (exactMap[fullHex]) {
    return exactMap[fullHex]!;
  }

  // Fallback kalkulasi HSL dari RGB
  const r = parseInt(fullHex.slice(0, 2), 16) / 255;
  const g = parseInt(fullHex.slice(2, 4), 16) / 255;
  const b = parseInt(fullHex.slice(4, 6), 16) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r:
        h = ((g - b) / d + (g < b ? 6 : 0)) * 60;
        break;
      case g:
        h = ((b - r) / d + 2) * 60;
        break;
      case b:
        h = ((r - g) / d + 4) * 60;
        break;
    }
  }

  if (s < 0.12) {
    if (l > 0.88) return 'clean soft white';
    if (l > 0.70) return 'warm light off-white';
    if (l > 0.45) return 'neutral medium gray';
    if (l > 0.20) return 'dark muted slate';
    return 'deep charcoal shadow';
  }

  const lightnessPrefix = l > 0.72 ? 'pale ' : l < 0.28 ? 'deep ' : l > 0.55 ? 'warm ' : 'rich ';

  if (h >= 345 || h < 15) return `${lightnessPrefix}crimson red`;
  if (h >= 15 && h < 45) return `${lightnessPrefix}amber orange`;
  if (h >= 45 && h < 70) return `${lightnessPrefix}warm gold`;
  if (h >= 70 && h < 165) return `${lightnessPrefix}emerald green`;
  if (h >= 165 && h < 195) return `${lightnessPrefix}teal`;
  if (h >= 195 && h < 255) return `${lightnessPrefix}sapphire blue`;
  if (h >= 255 && h < 290) return `${lightnessPrefix}indigo violet`;
  if (h >= 290 && h < 345) return `${lightnessPrefix}magenta rose`;

  return fallbackName;
}

/**
 * Filter pemurni akhir yang deterministik untuk prompt difusi gambar Layer 1.
 * Menghilangkan seluruh pola HEX dan kata pemicu tipografi/UI agar tidak bocor ke model gambar.
 */
export function sanitizeImageGenerationPrompt(rawPrompt: string): string {
  if (!rawPrompt) return '';

  // 1. Pisahkan bagian mandat ZERO-TEXT agar larangan eksplisit tetap utuh
  const mandateHeader = '[CRITICAL ZERO-HUMAN / ZERO-TEXT / ZERO-COORDINATE MANDATE]';
  const mandateIndex = rawPrompt.indexOf(mandateHeader);

  let mainPart = rawPrompt;
  let mandatePart = '';

  if (mandateIndex !== -1) {
    mainPart = rawPrompt.slice(0, mandateIndex);
    mandatePart = rawPrompt.slice(mandateIndex);
  }

  // 2. Bersihkan seluruh kode HEX di seluruh bagian
  mainPart = mainPart.replace(/#[0-9a-fA-F]{3,8}\b/g, 'clean tone');
  mandatePart = mandatePart.replace(/#[0-9a-fA-F]{3,8}\b/g, '');

  // 3. Bersihkan pemicu tipografi / headline / teks di bagian adegan
  mainPart = mainPart.replace(
    /\b(for\s+)?(giant\s+|huge\s+|bold\s+|large\s+|sharp\s+|minimalist\s+|editorial\s+|formal\s+|organic\s+|serif\s+|sans-serif\s+)?(typography|typographic|headlines?|subheadlines?|subheadings?|mastheads?|text|titles?|fonts?|lettering)(\s+overlays?|\s+banners?|\s+blocks?)?\b/gi,
    'clean open space'
  );

  // 4. Bersihkan pemicu kartu / kotak / banner / callout / badge
  mainPart = mainPart.replace(
    /\b(editorial\s+|summary\s+|bulletin\s+|info\s+|callout\s+|ui\s+|analytical\s+|diagrammatic\s+)?(cards?|boxes|banners?|columns?|callouts?|badges?|stickers?|plakat)\b/gi,
    'clean visual zones'
  );

  // 5. Bersihkan istilah cetak / media grafis
  mainPart = mainPart.replace(
    /\b(newspaper|broadsheet|magazine|poster|zine|infographic|flyer|brochure)\b/gi,
    'editorial artwork'
  );

  // 6. Normalisasi spasi dan frasa berulang
  mainPart = mainPart
    .replace(/\b(clean open space)(\s+(clean open space|clean visual zones))+\b/gi, 'clean open space')
    .replace(/\b(clean visual zones)(\s+(clean visual zones|clean open space))+\b/gi, 'clean visual zones')
    .replace(/[ \t]{2,}/g, ' ');

  return `${mainPart}${mandatePart}`.trim();
}

export class PosterPromptCompiler {
  public static hexToNaturalColorName = hexToNaturalColorName;
  public static sanitizeImageGenerationPrompt = sanitizeImageGenerationPrompt;
  /**
   * TAHAP 1: Menyusun Naskah Multi-Blok & Analogi Objek Visual 1:1 menggunakan LLM (Structured JSON)
   * Menegakkan Business Rule BR-01 (Isomorfisme Panjang Karakter)
   */
  public static async synthesizeEditorialCopyAndVisuals(
    topic: string,
    blueprint: PreAnalyzedPosterBlueprint,
    groundedContext?: string
  ): Promise<SynthesizedEditorialCopy> {
    const blockSpecs: LayoutBlockSpec[] =
      LAYOUT_BLOCK_SCHEMA[blueprint.archetype] ||
      (blueprint.slotManifest.editorialBlocks || []).map((b) => ({
        slotId: b.slotId,
        roleDescription: 'Seksi blok editorial naskah',
        headerMaxChars: b.constraints.headerMaxChars,
        bodyMinChars: b.constraints.bodyMinChars,
        bodyMaxChars: b.constraints.bodyMaxChars,
        defaultHeader: b.defaultReferenceHeader,
      }));

    const blockConstraintsText =
      blockSpecs.length > 0
        ? blockSpecs
            .map(
              (b) =>
                `- Slot ID "${b.slotId}": Header maks ${b.headerMaxChars} karakter (${b.roleDescription}). Body WAJIB antara ${b.bodyMinChars} s/d ${b.bodyMaxChars} karakter.`
            )
            .join('\n')
        : '- Format teks naskah sesuai kebutuhan arketipe editorial.';

    const sampleBlocks: Record<string, { header: string; body: string }> = {};
    for (const b of blockSpecs) {
      sampleBlocks[b.slotId] = {
        header: b.defaultHeader,
        body: `Deskripsi terukur dan konkret terkait penanganan ${topic} di lapangan.`,
      };
    }

    const visualSlotsText = (blueprint.slotManifest.visualCutoutSlots || [])
      .map(
        (v) =>
          `- Visual Slot ID "${v.slotId}": Deskripsikan elemen visual dunia riil/faktual di Indonesia yang secara langsung menggambarkan topik "${topic}" (tulis dalam Bahasa Inggris).`
      )
      .join('\n');

    const systemPrompt = `Anda adalah Art Director & Copywriter Infografis Kebijakan POLARIS.
Tugas Anda adalah menyusun naskah dan konsep visual poster baru bertopik: "${topic}".
Ikuti struktur slot tata letak dan batasan karakter yang ditentukan di bawah ini secara presisi.

${groundedContext ? `FAKTA RISET & DATA PENDUKUNG:\n${groundedContext.slice(0, 1800)}\n` : ''}

ATURAN BISNIS MUTLAK:
1. Setiap blok teks harus padat, bernas, menggunakan Bahasa Indonesia baku jurnalistik mengenai topik "${topic}".
2. PATUHI batas karakter untuk setiap Slot ID berikut agar tidak merusak grid desain:
${blockConstraintsText}

3. ELEMEN VISUAL (DALAM BAHASA INGGRIS):
Untuk setiap slot visual, deskripsikan elemen visual dunia riil/faktual yang secara langsung menggambarkan "${topic}":
${visualSlotsText || `- Deskripsi visual realistis yang mencerminkan ${topic}`}

4. PANDUAN ART DIRECTOR DINAMIS (LAYOUT & WARNA SENADA):
Sebagai Art Director AI, Anda WAJIB menentukan variasi tata letak (layout) dan palet warna senada secara aktif agar desain unik, adaptif dengan isi artikel, dan tidak monoton bagi tiap pengguna:
- layoutVariant (Pilih salah satu persis):
  * "TOP_BANNER" : Judul tebal di posisi atas kanvas, kartu narasi & data di bagian bawah.
  * "BOTTOM_ANCHOR" : Judul masif berbobot di bagian bawah, kartu ringkasan mengambang di atas.
  * "EDITORIAL_SPLIT" : Tata letak asimetris majalah editorial (kolom kiri judul/naskah, kolom kanan kartu data).
  * "CENTERED_HERO" : Pernyataan inti tebal di tengah kanvas dengan framing aksen protektif.
- headerPlacement (Pilih salah satu persis): "top" | "bottom" | "center"
- cardArrangement (Pilih salah satu persis): "stacked" | "horizontal_split" | "single_hero_card" | "grid_compact"
- colorMood: Pilih salah satu palet yang paling harmonis dengan suasana topik:
  "EMERALD" (Lingkungan, pertanian, kesehatan),
  "ROYAL_INDIGO" (Tata kelola, inovasi digital, kebijakan formal),
  "CRIMSON_TERRACOTTA" (Tanggap darurat, peringatan dini, advokasi tegas),
  "MIDNIGHT_SAPPHIRE" (Infrastruktur, maritim, transportasi),
  "VINTAGE_AMBER" (Pasar tradisional, ekonomi kerakyatan, sejarah),
  "NORDIC_TEAL" (Pendidikan, transparansi, kesejahteraan sosial),
  "BURGUNDY_ROSE" (Perlindungan sosial, seni, hak asasi),
  "SUNSET_CORAL" (Pemuda, pariwisata, UMKM kreatif),
  "COBALT_GOLD" (Kedaulatan, prestasi nasional, kelembagaan tinggi),
  "CHARCOAL_LIME" (Teknologi masa depan, energi hijau modern),
  "MONOCHROME_MINIMAL" (Editorial hitam-putih prestisius, investigasi).

5. PANTANGAN MASTER EDITORIAL & ATURAN ANGKA FAKTA RISET:
- DILARANG KERAS menggunakan kata "nyata" (seperti "SOLUSI NYATA", "langkah nyata", "bantuan nyata", "dampak nyata"). Gunakan istilah "TERUKUR", "KONKRET", "LANGSUNG", atau "STRATEGIS".
- DILARANG KERAS menggunakan kata "sekadar" maupun "bukan sekadar". Gunakan kata "tidak hanya" atau kalimat lugas.
- DILARANG KERAS menggunakan tanda baca em-dash (—) maupun en-dash (–). Gunakan tanda koma atau tanda titik.
- DILARANG menggunakan Oxford comma (koma sebelum 'dan', 'serta', 'atau' pada perincian).
- ATURAN ANGKA & FAKTA RISET: Jika pada FAKTA RISET & DATA PENDUKUNG terdapat angka statistik riil (APBD, persentase, kuota, jumlah desa/kecamatan, tahun, atau nomor Perda/UU), WAJIB gunakan angka dan fakta riil tersebut ke dalam statCircles, blocks, dan numberedItems!
- LARANGAN KERAS ANGKA FIKTIF: DILARANG KERAS mengarang angka statistik fiktif (seperti 120+, 28 Unit, 1.450) jika angka tersebut tidak ada di dalam konteks fakta atau prompt pengguna! Jika tidak ada angka spesifik di konteks, gunakan nilai indikator kebijakan singkat yang relevan dengan topik (misal: "100%", "24 Jam", "Terpadu", "Prioritas", "5 Tahap", "Tepat Sasaran").
- ATURAN LABEL LINGKARAN (topLabel): topLabel pada statCircles WAJIB terdiri dari 1 KATA PENDEK SAJA (Maksimal 11 karakter, TANPA titik-titik), contoh: "SASARAN", "REALISASI", "ANGGARAN", "FOKUS", "TARGET", "DISTRIBUSI".
- ATURAN KALIMAT TUNTAS (ANTI-ELLIPSIS): Untuk setiap body pada blocks dan summary pada numberedItems, tulislah 1 atau 2 kalimat pendek yang PADAT dan TUNTAS (selalu berakhir dengan tanda titik '.') dengan panjang tepat di kisaran 85 s/d 135 karakter agar seluruh kalimat tampil utuh di poster tanpa pernah terpotong tanda titik-titik (...)!

Keluarkan output HANYA dalam format JSON murni:
{
  "layoutVariant": "TOP_BANNER",
  "headerPlacement": "top",
  "cardArrangement": "stacked",
  "colorMood": "EMERALD",
  "mainBannerTitle": "JUDUL UTAMA 2-4 KATA TEGAS (Maks 34 karakter)",
  "mainBannerSubheader": "Subjudul pengantar di atas judul utama (Maks 65 karakter)",
  "mainBannerDefinitionBody": "Paragraf definisi/kesimpulan komprehensif di bagian paling bawah banner (Wajib antara 280 s/d 360 karakter)",
  "blocks": ${JSON.stringify(sampleBlocks, null, 4)},
  "statCircles": [
    { "topLabel": "TARGET", "value": "100%", "description": "Fokus intervensi utama sesuai fakta topik." },
    { "topLabel": "PRIORITAS", "value": "Utama", "description": "Kawal realisasi kebijakan secara terukur." },
    { "topLabel": "CAKUPAN", "value": "Dapil", "description": "Pengawasan menyeluruh di wilayah konstituen." }
  ],
  "numberedItems": [
    { "number": "01", "title": "Audit Kelayakan", "subtitle": "Inspeksi Berkala", "summary": "Pemeriksaan teknis menyeluruh terhadap seluruh fasilitas dan regulasi terkait." },
    { "number": "02", "title": "Respons Cepat", "subtitle": "Satuan Reaksi 24 Jam", "summary": "Pengerahan tim terpadu untuk penanganan langsung tanpa hambatan birokrasi." },
    { "number": "03", "title": "Bantuan Terpadu", "subtitle": "Logistik & Layanan", "summary": "Distribusi dukungan langsung dan pelayanan terintegrasi bagi masyarakat." },
    { "number": "04", "title": "Partisipasi Warga", "subtitle": "Pendampingan Terbuka", "summary": "Membangun keterlibatan aktif komunitas dan forum aspirasi warga." },
    { "number": "05", "title": "Kepastian Regulasi", "subtitle": "Payung Hukum Tegas", "summary": "Penerbitan kebijakan standar perlindungan hak dan pelayanan publik." }
  ],
  "mappedVisualCutouts": {
    "upper_right_cutout": "Indonesian community members or professionals actively engaged in this field",
    "mid_left_hero_cutout": "An Indonesian citizen representative or frontline figure standing proudly looking forward",
    "bottom_street_scene": "Authentic Indonesian urban or regional environment showcasing daily civic life and activity related to the topic"
  }
}`;

    try {
      const response = await openaiClient.chat.completions.create({
        model: 'gpt-4o-mini',
        temperature: 0.25,
        response_format: { type: 'json_object' },
        messages: [{ role: 'system', content: systemPrompt }],
      });

      const parsed = JSON.parse(response.choices[0]?.message?.content || '{}') as SynthesizedEditorialCopy;

      // Resolusi palet warna senada aktif dari pilihan Art Director AI
      const resolvedPalette = resolveHarmoniousPalette(parsed.colorMood || blueprint.colorPalette.primaryAccent);
      parsed.primaryAccent = resolvedPalette.primaryAccent;
      parsed.secondaryAccent = resolvedPalette.secondaryAccent;
      parsed.cardBackground = resolvedPalette.cardBackground;
      parsed.cardBorder = resolvedPalette.cardBorder;

      // Validasi & Clamping Nilai Dinamis Layout
      const validVariants: PosterLayoutVariant[] = ['TOP_BANNER', 'BOTTOM_ANCHOR', 'EDITORIAL_SPLIT', 'CENTERED_HERO'];
      if (!parsed.layoutVariant || !validVariants.includes(parsed.layoutVariant)) {
        parsed.layoutVariant = 'TOP_BANNER';
      }

      const validPlacements: PosterHeaderPlacement[] = ['top', 'bottom', 'center'];
      if (!parsed.headerPlacement || !validPlacements.includes(parsed.headerPlacement)) {
        parsed.headerPlacement = parsed.layoutVariant === 'BOTTOM_ANCHOR' ? 'bottom' : 'top';
      }

      const validArrangements: PosterCardArrangement[] = ['stacked', 'horizontal_split', 'single_hero_card', 'grid_compact'];
      if (!parsed.cardArrangement || !validArrangements.includes(parsed.cardArrangement)) {
        parsed.cardArrangement = 'stacked';
      }

      return this.enforceCharacterBudgets(parsed, blueprint);
    } catch (error) {
      // Fallback deterministik kontekstual jika LLM timeout
      const randomPalette = getRandomHarmoniousPalette();
      const variants: PosterLayoutVariant[] = ['TOP_BANNER', 'BOTTOM_ANCHOR', 'EDITORIAL_SPLIT', 'CENTERED_HERO'];
      const fallbackVariant = variants[Math.floor(Math.random() * variants.length)];

      const fallbackBlocks: Record<string, { header: string; body: string }> = {};
      for (const spec of blockSpecs) {
        fallbackBlocks[spec.slotId] = {
          header: MasterEditorialSanitizer.cleanHeadline(spec.defaultHeader),
          body: MasterEditorialSanitizer.sanitize(
            `Secara substantif, penanganan isu ${topic} memerlukan pengawasan anggaran ketat dan respons terpadu di lapangan demi perlindungan warga.`
          ),
        };
      }

      const fallbackCopy: SynthesizedEditorialCopy = {
        layoutVariant: fallbackVariant,
        headerPlacement: fallbackVariant === 'BOTTOM_ANCHOR' ? 'bottom' : 'top',
        cardArrangement: 'stacked',
        colorMood: randomPalette.name,
        primaryAccent: randomPalette.primaryAccent,
        secondaryAccent: randomPalette.secondaryAccent,
        cardBackground: randomPalette.cardBackground,
        cardBorder: randomPalette.cardBorder,
        mainBannerTitle: this.wordSafeHeadlineTruncate(topic.toUpperCase(), 34),
        mainBannerSubheader: `PENGEMBANGAN KEBIJAKAN PUBLIK • Fokus kajian: ${topic.slice(0, 30)}`,
        mainBannerDefinitionBody: `Secara substantif, penanganan isu ${topic} membutuhkan kolaborasi terpadu antara regulasi pemerintah daerah, pengawasan anggaran parlemen, serta partisipasi aktif masyarakat secara berkelanjutan di tingkat akar rumput.`,
        blocks: fallbackBlocks,
        statCircles: [
          { topLabel: 'PRIORITAS', value: 'Utama', description: `Pengawalan aspirasi dan kebijakan terpadu terkait ${topic.slice(0, 24)}.` },
          { topLabel: 'SASARAN', value: '100%', description: 'Transparansi pelaksanaan program tepat sasaran di lapangan.' },
          { topLabel: 'KOMITMEN', value: 'Tegas', description: 'Pengawasan berkelanjutan demi perlindungan hak dan kesejahteraan warga.' },
        ],
        numberedItems: [
          { number: '01', title: 'Audit Kebijakan', subtitle: 'Evaluasi Komprehensif', summary: `Analisis menyeluruh terhadap tata kelola dan dampak ${topic.slice(0, 24)}.` },
          { number: '02', title: 'Aksi Lapangan', subtitle: 'Respons Langsung', summary: 'Turun ke lapangan meninjau titik kritis bersama masyarakat dan relawan.' },
          { number: '03', title: 'Penyaluran Bantuan', subtitle: 'Logistik & Layanan', summary: 'Fasilitasi bantuan langsung dan advokasi birokrasi tepat sasaran bagi warga.' },
          { number: '04', title: 'Konsolidasi Warga', subtitle: 'Partisipasi Publik', summary: 'Membangun rukun warga tanggap dan forum aspirasi akar rumput yang berdaya.' },
          { number: '05', title: 'Regulasi Perlindungan', subtitle: 'Kepastian Hukum', summary: 'Mendorong pengesahan perda perlindungan hak publik dan anggaran berpihak.' },
        ],
        mappedVisualCutouts: {
          upper_right_cutout: `Indonesian field workers and equipment addressing ${topic}`,
          mid_left_hero_cutout: `Indonesian frontline worker or citizen actively involved in ${topic}`,
          bottom_street_scene: `Authentic Indonesian street environment showing community activity related to ${topic}`,
        },
      };

      return this.enforceCharacterBudgets(fallbackCopy, blueprint);
    }
  }

  /**
   * Pemotongan judul kata-per-kata yang aman (Word-Safe Truncation).
   * DILARANG memotong huruf di tengah kata (seperti 'BERKELANJUTA') dan DILARANG menambah '...'.
   */
  public static wordSafeHeadlineTruncate(title: string, maxChars = 34): string {
    const clean = (title || '').trim();
    if (clean.length <= maxChars) return clean;
    const words = clean.split(/\s+/);
    let accumulated = '';
    for (const word of words) {
      const next = accumulated ? `${accumulated} ${word}` : word;
      if (next.length <= maxChars) {
        accumulated = next;
      } else {
        break;
      }
    }
    return accumulated || words[0] || clean;
  }

  /**
   * Pembatas kalimat cerdas anti-ellipsis menggantung (Clean Sentence Clamping).
   * Memotong pada tanda titik/titik koma terdekat jika posisi >= 55% teks,
   * atau memotong pada batas kata utuh dan mengakhiri dengan tanda titik yang tuntas.
   */
  public static smartSentenceClamp(text: string, maxChars: number): string {
    const clean = (text || '').trim();
    if (clean.length <= maxChars) return clean;

    const sliced = clean.slice(0, maxChars);
    const periodMatch = sliced.lastIndexOf('.');
    const semicolonMatch = sliced.lastIndexOf(';');
    const sentenceBoundary = Math.max(periodMatch, semicolonMatch);

    if (sentenceBoundary >= Math.floor(maxChars * 0.55)) {
      return clean.slice(0, sentenceBoundary + 1).trim();
    }

    const lastSpace = sliced.lastIndexOf(' ');
    const safeText = lastSpace > Math.floor(maxChars * 0.55) ? sliced.slice(0, lastSpace) : sliced;
    return `${safeText.trim().replace(/[,;:\-\s]+$/, '')}.`;
  }

  /**
   * Guardrail deterministik untuk memotong kalimat secara rapi jika LLM melebihi batas karakter
   * serta menyucikan teks dari mikrolinguistik terlarang (Zero-Tolerance: em-dash, Oxford comma, 'sekadar', 'nyata')
   */
  private static enforceCharacterBudgets(
    copy: SynthesizedEditorialCopy,
    blueprint: PreAnalyzedPosterBlueprint
  ): SynthesizedEditorialCopy {
    // 1. Sanitasi Mikrolinguistik Master Editorial untuk seluruh teks
    if (copy.mainBannerTitle) {
      copy.mainBannerTitle = this.wordSafeHeadlineTruncate(
        MasterEditorialSanitizer.cleanHeadline(copy.mainBannerTitle),
        34
      );
    }
    if (copy.mainBannerSubheader && copy.mainBannerSubheader.length > 85) {
      copy.mainBannerSubheader = this.smartSentenceClamp(
        MasterEditorialSanitizer.sanitize(copy.mainBannerSubheader),
        85
      );
    }
    if (copy.mainBannerDefinitionBody && copy.mainBannerDefinitionBody.length > 380) {
      copy.mainBannerDefinitionBody = this.smartSentenceClamp(
        MasterEditorialSanitizer.sanitize(copy.mainBannerDefinitionBody),
        380
      );
    }

    // 3. Kunci numberedItems (untuk MODULAR_GRID_CARDS & RETRO_SPLIT_MITIGATION)
    if (Array.isArray(copy.numberedItems)) {
      copy.numberedItems = copy.numberedItems.map((item) => ({
        ...item,
        title: this.wordSafeHeadlineTruncate(MasterEditorialSanitizer.sanitize(item.title || ''), 34),
        summary: this.smartSentenceClamp(MasterEditorialSanitizer.sanitize(item.summary || ''), 135),
      }));
    }

    // 4. Kunci statCircles
    if (Array.isArray(copy.statCircles)) {
      copy.statCircles = copy.statCircles.map((stat) => {
        const rawLabel = MasterEditorialSanitizer.sanitize(stat.topLabel || '').trim();
        const firstWord = rawLabel.split(/\s+/)[0] || 'TARGET';
        const cleanTopLabel = (firstWord.length <= 11 ? firstWord : firstWord.slice(0, 11)).toUpperCase();

        return {
          ...stat,
          topLabel: cleanTopLabel,
          value: (stat.value || '').trim().slice(0, 10),
          description: this.smartSentenceClamp(MasterEditorialSanitizer.sanitize(stat.description || ''), 85),
        };
      });
    }

    // 5. Kunci editorialBlocks untuk seluruh arketipe (LAYOUT_BLOCK_SCHEMA)
    const blockSpecs: LayoutBlockSpec[] =
      LAYOUT_BLOCK_SCHEMA[blueprint.archetype] ||
      (blueprint.slotManifest.editorialBlocks || []).map((b) => ({
        slotId: b.slotId,
        roleDescription: 'Seksi blok editorial naskah',
        headerMaxChars: b.constraints.headerMaxChars,
        bodyMinChars: b.constraints.bodyMinChars,
        bodyMaxChars: b.constraints.bodyMaxChars,
        defaultHeader: b.defaultReferenceHeader,
      }));

    if (!copy.blocks) copy.blocks = {};

    for (const spec of blockSpecs) {
      let target = copy.blocks[spec.slotId];
      if (!target) {
        target = {
          header: MasterEditorialSanitizer.cleanHeadline(spec.defaultHeader),
          body: MasterEditorialSanitizer.sanitize(
            `Penanganan isu memerlukan langkah konkret, respons terpadu, dan pengawasan anggaran ketat.`
          ),
        };
        copy.blocks[spec.slotId] = target;
      }
      if (target.header) {
        const sanitizedHeader = MasterEditorialSanitizer.cleanHeadline(target.header);
        target.header = this.wordSafeHeadlineTruncate(sanitizedHeader, spec.headerMaxChars);
      }
      if (target.body) {
        const sanitizedBody = MasterEditorialSanitizer.sanitize(target.body);
        target.body = this.smartSentenceClamp(sanitizedBody, Math.max(spec.bodyMaxChars, 135));
      }
    }
    return copy;
  }

  /**
   * TAHAP 2: Mengompilasi Prompt Kolase Visual (100% Tanpa Teks, Siap Di-overlay Satori)
   * Polymorphic Art Direction per Arketipe Desain
   */
  public static async compileScenePrompt(
    options: CompilePosterPromptOptions
  ): Promise<CompiledPosterPrompt> {
    const {
      topic,
      groundedContextSummary,
      blueprint,
      compositionMode = 'PUBLIC_ADVOCACY',
      tenantBrandHex,
    } = options;

    const synthesizedCopy = await this.synthesizeEditorialCopyAndVisuals(
      topic,
      blueprint,
      groundedContextSummary
    );

    const rawTopic = options.topic || '';
    const cleanTopic = rawTopic
      .replace(/^Infografis Publik:\s*/i, '')
      .replace(/^Poster Publik:\s*/i, '')
      .replace(/menampilkan\s+[^,.]+(dengan|yang|untuk)/gi, '$1')
      .replace(/tokoh\s+[^,.]+/gi, '')
      .replace(/dengan latar belakang/gi, 'berlatar')
      .trim();

    const rawAccentHex = tenantBrandHex || blueprint.colorPalette.primaryAccent || '#9E0B0F';
    const rawBaseHex = blueprint.colorPalette.backgroundBase || '#F4F1EA';
    const accentColorName = hexToNaturalColorName(rawAccentHex, 'vibrant accent tone');
    const baseColorName = hexToNaturalColorName(rawBaseHex, 'neutral paper tone');
    const cutouts = synthesizedCopy.mappedVisualCutouts || {};

    let englishPrompt = '';

    const zeroMandate = `
[CRITICAL ZERO-HUMAN / ZERO-TEXT / ZERO-COORDINATE MANDATE]
- Absolutely ZERO human faces, ZERO portraits, ZERO people, ZERO politicians, and ZERO human silhouettes.
- DO NOT generate any text, letters, numbers, words, headlines, coordinate labels, percentage values, axis markers (no "x:" or "y:"), signs, or watermarks.
- DO NOT generate any logos, emblems, or brand signatures.
- Absolutely ZERO coordinate labels (no "x:" or "y:").
- Output ONLY the clean visual background art and designated negative-space zones ready for programmatic SVG text compositing.
`.trim();

    if (blueprint.archetype === 'TORN_PAPER_NEWS') {
      // TPL-05: TECHNO VERITAS / TORN PAPER EDITORIAL
      englishPrompt = `
[ROLE & EDITORIAL PHOTOJOURNALISM ART DIRECTION]
A dramatic, high-impact photojournalistic documentary photograph in the style of prestigious editorial photojournalism covering: "${cleanTopic}".
In the center foreground, dramatic authentic environmental landscape, regional infrastructure, or civic setting directly representing: "${cleanTopic}".
Upper background features an atmospheric sky with subtle geometric glowing tint in ${accentColorName}.
Gritty 35mm film documentary texture, authentic cinematic lighting with rich highlights and deep contrast.

${zeroMandate}
      `.trim();
    } else if (blueprint.archetype === 'RETRO_SPLIT_MITIGATION') {
      // TPL-06: RETRO RISOGRAPH SPLIT-SCREEN
      englishPrompt = `
[ROLE & RETRO RISOGRAPH ART DIRECTION]
Vintage 1970s-1980s civic educational risograph illustration addressing: "${cleanTopic}".
In the center, an authentic stylized graphic architectural or symbolic illustration directly representing: "${cleanTopic}" in an Indonesian civic setting.
Aged warm paper background in ${baseColorName} with subtle halftone textures, tactile lithograph grain, muted retro color grading featuring ${accentColorName} accents and warm neutral tones.
Clean spatial layout leaving an expansive, calm, uncluttered open background with minimal noise.

${zeroMandate}
      `.trim();
    } else if (blueprint.archetype === 'MODULAR_GRID_CARDS') {
      // TPL-07: MODULAR GRID CARDS
      englishPrompt = `
[ROLE & EDITORIAL MINIMALIST ART DIRECTION]
High-end editorial documentary architectural background and civic infrastructure texture for: "${cleanTopic}".
Composition: Clean, balanced layout with ample negative space. A panoramic subtle photographic texture capturing Indonesian civic environments, modern public facilities, and community development representing: "${cleanTopic}".
Muted tones, authentic 35mm film grain, elegant lighting, completely flat and uncluttered with generous, calm, open negative space across the central and lower zones.

${zeroMandate}
      `.trim();
    } else if (blueprint.archetype === 'VINTAGE_PERSONA_GAZETTE') {
      // TPL-20: VINTAGE BROADSHEET GAZETTE
      englishPrompt = `
[ROLE & ARCHIVAL FINE ART ART DIRECTION]
Warm archival fine-art paper textured background for: "${cleanTopic}".
Vintage sepia-toned paper texture in ${baseColorName} with subtle tactile paper grain, aged print patina, and soft vignette along the edges.
Atmospheric and dignified civic mood representing: "${cleanTopic}".

${zeroMandate}
      `.trim();
    } else if (blueprint.archetype === 'POP_OUT_HERO') {
      // TPL-01: POP OUT HERO / CINEMATIC OVERLAY
      englishPrompt = `
[ROLE & CINEMATIC DOCUMENTARY ART DIRECTION]
Dramatic cinematic aerial or environmental documentary shot capturing: "${cleanTopic}".
High-end documentary photography art direction with authentic 35mm film grain.
Rich natural textures, soft atmospheric daylight, warm highlights, and subtle ${accentColorName} color grading.
The top 35% of the frame MUST be clean, uncluttered, or soft-focus atmospheric background providing expansive open space.

${zeroMandate}
      `.trim();
    } else if (blueprint.archetype === 'STREET_JOURNALISM') {
      // TPL-02: STREET JOURNALISM RISOGRAPH (POSTER PKL)
      const midLeftDirective = `- In the middle-left area: Paint a dramatic diagonal ${accentColorName} brush-stroke splash and subtle black wireframe wave lines on the cream paper. Leave this zone completely clean and empty of any human figures with an expansive open surface.`;

      englishPrompt = `
[ROLE & BRUTALIST EDITORIAL ART DIRECTION]
A vintage brutalist tactile paper collage artwork (vertical 4:5 ratio, 1080x1350px) for the topic: "${cleanTopic}".

[SPATIAL COLLAGE ART DIRECTION - NATURAL COMPOSITION]
1. PAPER BASE:
   - Textured vintage off-white paper in ${baseColorName} with subtle archival grain.
   - The top-left, top-center, and middle-right zones MUST be clean, solid, empty paper providing ample breathing room with quiet surfaces.

2. CUTOUT ARCHITECTURAL & CIVIC ACCENTS (BLACK & WHITE HALFTONE + ACCENT):
   - In the top-right corner: High-contrast black-and-white architectural/infrastructure cutout graphic representing: ${cutouts.upper_right_cutout || cleanTopic}, overlapping a geometric shape in ${accentColorName} on the right edge.
   ${midLeftDirective}
   - Across the lower-middle section: Gritty, high-contrast black-and-white Indonesian architectural and civic setting representing: ${cutouts.bottom_street_scene || cleanTopic}. Include a graphic accent wave in ${accentColorName} and fine topographic contour lines across the bottom-right corner.

3. SOLID DARK FOOTER BLOCK:
   - The bottom quarter of the canvas MUST be a flat, solid dark charcoal black horizontal band across the entire width.

${zeroMandate}
`.trim();
    } else if (blueprint.archetype === 'STATEMENT_PROFILE') {
      // TPL-03: THE STATEMENT PROFILE & LEGACY
      englishPrompt = `
[ROLE & PRESTIGIOUS EDITORIAL STUDIO ART DIRECTION]
A prestigious, high-end editorial documentary studio setting representing: "${cleanTopic}".
Deep dramatic low-key rim lighting, clean dark background in ${baseColorName}, subtle atmospheric ambient gradient in ${accentColorName}.
Rich 35mm film grain, sophisticated moody cinematic tone, pristine high-end studio quality.
The left 55% of the frame MUST be clean deep shadows and soft vignette providing an expansive, quiet negative space with subtle gradients and zero visual clutter.

${zeroMandate}
      `.trim();
    } else if (blueprint.archetype === 'RETRO_CAMPAIGN') {
      // TPL-04: RETRO PUBLIC INFORMATION CAMPAIGN
      englishPrompt = `
[ROLE & VINTAGE CIVIC CAMPAIGN ART DIRECTION]
Vintage 1970s-1980s Indonesian public educational campaign lithograph artwork for: "${cleanTopic}".
Warm aged paper texture in ${baseColorName} with subtle tactile grain and delicate decorative border margins.
Muted nostalgic retro color grading featuring ${accentColorName} accents and warm ochre tones.
Clean spatial composition leaving ample breathing room in the center and bottom with calm, uncluttered open surfaces.

${zeroMandate}
      `.trim();
    } else if (blueprint.archetype === 'CONSTRUCTIVIST_BAUHAUS') {
      // TPL-08: AVANT-GARDE EDITORIAL MANIFESTO
      englishPrompt = `
[ROLE & CONSTRUCTIVIST BAUHAUS ART DIRECTION]
Avant-garde constructivist and Bauhaus-inspired geometric artwork representing: "${cleanTopic}".
Bold geometric composition with strong diagonal planes, tactile craft textures, and raw industrial workshop aesthetic in ${baseColorName}.
High-contrast dynamic shapes and subtle risograph halftone patterns tinted in vibrant ${accentColorName}.
The upper 45% of the canvas MUST be clean, solid, uncluttered negative space with a smooth, uniform surface in soft directional light.

${zeroMandate}
      `.trim();
    } else if (blueprint.archetype === 'THRESHOLD_RISOGRAPH') {
      // TPL-09: HIGH-THRESHOLD NOIR GRAPHICS
      englishPrompt = `
[ROLE & HIGH-THRESHOLD NOIR ART DIRECTION]
Stark monochromatic high-threshold graphic silhouette art capturing: "${cleanTopic}".
Extreme high contrast, pure pitch-black shadows and crisp pure white highlights with zero mid-tones.
Dramatic geometric silhouette of Indonesian civic infrastructure, public development, or environmental landscape.
Subtle minimalist line accent in vivid ${accentColorName}.
Top 30% and bottom 20% MUST be flat solid negative space with calm, uncluttered open tones.

${zeroMandate}
      `.trim();
    } else if (blueprint.archetype === 'SWISS_DUOTONE_EDITORIAL') {
      // TPL-10: SWISS KINETIC GRID & MODERN TYPOGRAPHY
      englishPrompt = `
[ROLE & SWISS PRECISION EDITORIAL ART DIRECTION]
Precision Swiss Style architectural and civic documentary background for: "${cleanTopic}".
Clean architectural perspective, crisp structural lines, soft daylight shadows, and pristine minimalist paper texture in ${baseColorName}.
Elegant cool duotone color grade accented with vibrant ${accentColorName}.
The right 45% area and top horizontal zone MUST remain completely uncluttered open space with soft uniform tones.

${zeroMandate}
      `.trim();
    } else if (blueprint.archetype === 'ISOMETRIC_CREATIVE_COLLAGE') {
      // TPL-11: CREATIVE POP VIBRANT COLLAGE
      englishPrompt = `
[ROLE & MODERN CREATIVE POP ART DIRECTION]
Vibrant contemporary creative pop visual artwork representing: "${cleanTopic}".
Dynamic composition featuring layered floating geometric frames, playful ambient studio lighting, and crisp daylight textures.
Energetic modern color palette on clean base in ${baseColorName} with bright accent highlights in ${accentColorName}.
Top 30% and lower-left quadrant MUST provide generous negative space with an uncluttered, tranquil surface.

${zeroMandate}
      `.trim();
    } else if (blueprint.archetype === 'STORYBOOK_ILLUSTRATED') {
      // TPL-12: OUTDOOR WILDLIFE & ECOLOGY GAZETTE
      englishPrompt = `
[ROLE & NATURAL ECOLOGY EXPEDITION ART DIRECTION]
Breathtaking panoramic natural landscape or ecological conservation setting capturing: "${cleanTopic}".
National Geographic field expedition documentary style, organic textures, soft morning daylight, mist over pristine Indonesian geography.
Natural organic color grading on warm pastoral base in ${baseColorName} with lush accents in ${accentColorName}.
The top 35% of the frame MUST be soft open sky or gentle foliage providing a clean, expansive, misty atmosphere with minimal visual detail.

${zeroMandate}
      `.trim();
    } else if (blueprint.archetype === 'TYPOGRAPHIC_MASK') {
      // TPL-13: MINIMALIST MONOLINE FRAMING
      englishPrompt = `
[ROLE & MINIMALIST MONOLINE ART DIRECTION]
Ultra-clean modern architectural and civic landscape background for: "${cleanTopic}".
Pristine clarity, balanced soft daylight shadows, and high-end editorial tranquility on light base in ${baseColorName}.
Framed by clean perimeter margins with delicate accent tone in ${accentColorName}.
The entire center-top area MUST be expansive, uncluttered negative space with tranquil, low-contrast, open atmospheric sky.

${zeroMandate}
      `.trim();
    } else if (blueprint.archetype === 'KINETIC_MOTION') {
      // TPL-14: MODERN URBAN STREET NARRATIVE
      englishPrompt = `
[ROLE & KINETIC URBAN NARRATIVE ART DIRECTION]
Dynamic modern street-level documentary perspective capturing Indonesian civic movement and urban transit for: "${cleanTopic}".
Authentic 35mm street documentary photography with subtle kinetic motion blur lines along the diagonals.
Atmospheric daylight with rich contrast and sharp accent grading in ${accentColorName}.
The bottom 25% of the frame MUST be dark or deep tone with a calm, smooth, low-detail shadow surface.

${zeroMandate}
      `.trim();
    } else if (blueprint.archetype === 'EXECUTIVE_SEMINAR') {
      // TPL-15: EXECUTIVE LEADERSHIP & SYMPOSIUM
      englishPrompt = `
[ROLE & EXECUTIVE SYMPOSIUM ART DIRECTION]
High-level executive leadership symposium and civic policy background for: "${cleanTopic}".
Sophisticated deep midnight tone in ${baseColorName} with elegant geometric linear accents and subtle gold/brass framing in ${accentColorName}.
Soft ambient bokeh of a formal conference hall or parliamentary chamber in soft focus in the background.
Top 40% MUST be clean, dark, uncluttered negative space with a quiet, smooth, low-contrast dark gradient.

${zeroMandate}
      `.trim();
    } else if (blueprint.archetype === 'TORN_VISION') {
      // TPL-16: GRUNGE STREET TORN-PAPER URBAN
      englishPrompt = `
[ROLE & STREET TORN-PAPER URBAN ART DIRECTION]
Gritty urban tactile mixed-media artwork with dramatic diagonal ripped-paper collage aesthetic for: "${cleanTopic}".
Authentic distressed concrete wall, weathered textured wall layers, and tactile ripped paper edges.
High-contrast documentary photography of Indonesian civic infrastructure tinted with bold accent in ${accentColorName}.
Upper-right and bottom-left zones provide flat clean negative space with quiet, flat, uncluttered textures.

${zeroMandate}
      `.trim();
    } else if (blueprint.archetype === 'GALLERY_EXHIBITION') {
      // TPL-17: MINIMALIST ART GALLERY & EXHIBITION
      englishPrompt = `
[ROLE & CONTEMPORARY GALLERY EXHIBITION ART DIRECTION]
Contemporary art gallery and museum monograph background representing: "${cleanTopic}".
Clean, minimalist white museum gallery wall in ${baseColorName}, soft architectural gallery spotlights casting gentle shadows.
Pristine architectural geometry, tranquil atmosphere, completely free of clutter.
Ample negative space across 60% of the canvas featuring an expansive, quiet, serene gallery interior with minimal visual distraction.

${zeroMandate}
      `.trim();
    } else if (blueprint.archetype === 'POP_MAGAZINE_COLLAGE') {
      // TPL-18: POP MAGAZINE COLLAGE
      englishPrompt = `
[ROLE & TRENDY POP MAGAZINE ART DIRECTION]
Trendy contemporary mixed-media collage artwork for: "${cleanTopic}".
Vibrant modern collage aesthetic with subtle dot-matrix halftone patterns, colorful cutout geometric shapes in ${accentColorName}, and dynamic urban rhythm.
Clean paper base in ${baseColorName} with rich visual hierarchy.
Top 25% and bottom 20% designated as clean negative space providing calm, quiet, open negative space with soft neutral tones.

${zeroMandate}
      `.trim();
    } else if (blueprint.archetype === 'POLAROID_ADVENTURE') {
      // TPL-19: VINTAGE FIELD NOTES & POLAROID ADVENTURE
      englishPrompt = `
[ROLE & FIELD EXPEDITION POLAROID ART DIRECTION]
Nostalgic field expedition and civic field-work journal aesthetic for: "${cleanTopic}".
Warm aged photographic paper texture in ${baseColorName}, soft sun-drenched documentary atmosphere, authentic analog 35mm warmth.
Subtle tape and paper clip framing accents with warm earth-tone highlights in ${accentColorName}.
Spacious negative space in the central upper section with a soft-focus, uncluttered, warm background.

${zeroMandate}
      `.trim();
    } else if (blueprint.archetype === 'BROADSHEET_NEWSPAPER') {
      // TPL-21: CIVIC BROADSHEET CHRONICLE
      englishPrompt = `
[ROLE & CIVIC BROADSHEET CHRONICLE ART DIRECTION]
Dignified archival documentary artwork for: "${cleanTopic}".
Fine multi-column archival tactile paper texture in ${baseColorName} with subtle ink press patina and soft vignette.
Atmospheric documentary civic infrastructure setting with authentic journalistic seriousness.
Top 20% and column margins preserved as clean off-white paper with clean, uncluttered, soft open space.

${zeroMandate}
      `.trim();
    } else if (blueprint.archetype === 'TECHNICAL_GRID_CALLOUT') {
      // TPL-22: TECHNICAL BLUEPRINT & ARCHITECTURAL CALLOUT
      englishPrompt = `
[ROLE & TECHNICAL BLUEPRINT CALLOUT ART DIRECTION]
Technical engineering blueprint and architectural drafting background for: "${cleanTopic}".
Crisp structural drafting aesthetic with fine isometric grid lines and subtle technical markings on base in ${baseColorName}.
Accent highlights in high-visibility drafting tone in ${accentColorName}.
Spacious structured negative space zones featuring calm, low-contrast, open drafted surfaces with minimal visual distraction.

${zeroMandate}
      `.trim();
    } else {
      // DYNAMIC FALLBACK: Memanfaatkan blueprint.scenePromptHint & blueprint.negativeSpaceZone secara cerdas
      const sceneHint =
        blueprint.scenePromptHint ||
        `High-impact documentary photographic background capturing: "${cleanTopic}".`;
      const negSpace =
        blueprint.negativeSpaceZone ||
        `Generous clean negative space with tranquil open surfaces and low visual distraction.`;

      englishPrompt = `
[ROLE & EDITORIAL FINE ART ART DIRECTION]
A sophisticated documentary photographic or illustration artwork (vertical 4:5 ratio) capturing the topic: "${cleanTopic}".
Artistic Direction: ${sceneHint}
Color Tone: Base tone in ${baseColorName} with sophisticated accent highlights in ${accentColorName}.
Composition Guidelines: ${negSpace}

${zeroMandate}
`.trim();
    }

    const { width, height } = blueprint.slotManifest.canvas;
    const activeProvider = options.imageProvider || getActiveImageProvider();
    const isPreCrop916 = blueprint.aspectRatio === '4:5' && activeProvider === 'OPENAI_DALLE';
    const compositionPlan = CompositionPlanner.planComposition({
      blueprint,
      copy: synthesizedCopy,
      compositionMode,
      tenantBrandHex,
    });

    const spatialNegativeDirectives = CompositionPlanner.zonesToSpatialPrompt(
      compositionPlan,
      blueprint,
      isPreCrop916
    );

    const rawUnifiedEnglishPrompt = `${spatialNegativeDirectives}\n\n${englishPrompt}`.trim();
    const sanitizedEnglishPrompt = sanitizeImageGenerationPrompt(rawUnifiedEnglishPrompt);

    return {
      blueprintId: blueprint.id,
      archetype: blueprint.archetype,
      englishPrompt: sanitizedEnglishPrompt,
      aspectRatio: blueprint.aspectRatio,
      canvasDimensions: { width, height },
      synthesizedCopy,
      compositionPlan,
    };
  }
}
