import {
  PreAnalyzedPosterBlueprint,
  CompiledPosterPrompt,
  SynthesizedEditorialCopy,
  SubjectCompositionMode,
  PosterLayoutVariant,
} from './types.js';
import { openaiClient } from '../client.js';
import { resolveHarmoniousPalette, getRandomHarmoniousPalette } from './palettes.js';
import { TwoStageArticleEngine } from '../two-stage-article.engine.js';
import { MasterEditorialSanitizer } from '../master-editorial-sanitizer.js';

export interface CompilePosterPromptOptions {
  topic: string;
  groundedContextSummary?: string; // Diambil dari hasil AutonomousResearchOrchestrator
  blueprint: PreAnalyzedPosterBlueprint;
  compositionMode?: SubjectCompositionMode;
  tenantBrandHex?: string;
}

export class PosterPromptCompiler {
  /**
   * TAHAP 1: Menyusun Naskah Multi-Blok & Analogi Objek Visual 1:1 menggunakan LLM (Structured JSON)
   * Menegakkan Business Rule BR-01 (Isomorfisme Panjang Karakter)
   */
  public static async synthesizeEditorialCopyAndVisuals(
    topic: string,
    blueprint: PreAnalyzedPosterBlueprint,
    groundedContext?: string
  ): Promise<SynthesizedEditorialCopy> {
    const blockConstraintsText = (blueprint.slotManifest.editorialBlocks || [])
      .map(
        (b) =>
          `- Slot ID "${b.slotId}": Header maks ${b.constraints.headerMaxChars} karakter. Body WAJIB antara ${b.constraints.bodyMinChars} s/d ${b.constraints.bodyMaxChars} karakter.`
      )
      .join('\n');

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
${blockConstraintsText || '- Buat konten ringkas dan padat.'}

3. ELEMEN VISUAL (DALAM BAHASA INGGRIS):
Untuk setiap slot visual, deskripsikan elemen visual dunia riil/faktual yang secara langsung menggambarkan "${topic}":
${visualSlotsText || `- Deskripsi visual realistis yang mencerminkan ${topic}`}

4. PANDUAN ART DIRECTOR DINAMIS (LAYOUT & WARNA SENADA):
Sebagai Art Director AI, Anda WAJIB menentukan variasi tata letak (layout) dan palet warna senada secara aktif agar desain unik, adaptif dengan isi artikel, dan tidak monoton bagi tiap pengguna:
- layoutVariant:
  * "TOP_BANNER" : Judul tebal di posisi atas kanvas, kartu narasi & data di bagian bawah.
  * "BOTTOM_ANCHOR" : Judul masif berbobot di bagian bawah, kartu ringkasan mengambang di atas.
  * "EDITORIAL_SPLIT" : Tata letak asimetris majalah editorial (kolom kiri judul/naskah, kolom kanan kartu data).
  * "CENTERED_HERO" : Pernyataan inti tebal di tengah kanvas dengan framing aksen protektif.
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

5. PANTANGAN MASTER EDITORIAL (ZERO-TOLERANCE):
- DILARANG KERAS menggunakan kata "nyata" (seperti "SOLUSI NYATA", "langkah nyata", "bantuan nyata", "dampak nyata"). Gunakan istilah "TERUKUR", "KONKRET", "LANGSUNG", atau "STRATEGIS".
- DILARANG KERAS menggunakan kata "sekadar" maupun "bukan sekadar". Gunakan kata "tidak hanya" atau kalimat lugas.
- DILARANG KERAS menggunakan tanda baca em-dash (—) maupun en-dash (–). Gunakan tanda koma atau tanda titik.
- DILARANG menggunakan Oxford comma (koma sebelum 'dan', 'serta', 'atau' pada perincian).

Keluarkan output HANYA dalam format JSON murni:
{
  "layoutVariant": "TOP_BANNER",
  "headerPlacement": "top",
  "cardArrangement": "stacked",
  "colorMood": "EMERALD",
  "mainBannerTitle": "JUDUL UTAMA 2-3 KATA TEGAS (Maks 22 karakter)",
  "mainBannerSubheader": "Subjudul pengantar di atas judul utama (Maks 65 karakter)",
  "mainBannerDefinitionBody": "Paragraf definisi/kesimpulan komprehensif di bagian paling bawah banner (Wajib antara 280 s/d 360 karakter)",
  "blocks": {
    "left_positive": { "header": "...", "body": "..." },
    "left_negative_box": { "header": "...", "body": "..." },
    "center_giant_title": { "header": "2 KATA PENDEK (Maks 14 char)", "body": "..." },
    "right_cause": { "header": "2 KATA (Maks 20 char)", "body": "..." }
  },
  "statCircles": [
    { "topLabel": "Cakupan Layanan", "value": "120+", "description": "titik pantau dan wilayah intervensi utama di lapangan." },
    { "topLabel": "Fasilitas Siaga", "value": "28 Unit", "description": "sarana pendukung operasional yang beroperasi penuh." },
    { "topLabel": "Penerima Manfaat", "value": "1.450", "description": "warga terlayani melalui program advokasi terpadu." }
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

      if (!parsed.layoutVariant) {
        const variants: PosterLayoutVariant[] = ['TOP_BANNER', 'BOTTOM_ANCHOR', 'EDITORIAL_SPLIT', 'CENTERED_HERO'];
        parsed.layoutVariant = variants[Math.floor(Math.random() * variants.length)];
      }

      return this.enforceCharacterBudgets(parsed, blueprint);
    } catch (error) {
      // Fallback deterministik jika LLM timeout
      const randomPalette = getRandomHarmoniousPalette();
      const variants: PosterLayoutVariant[] = ['TOP_BANNER', 'BOTTOM_ANCHOR', 'EDITORIAL_SPLIT', 'CENTERED_HERO'];
      const fallbackVariant = variants[Math.floor(Math.random() * variants.length)];

      const fallbackCopy: SynthesizedEditorialCopy = {
        layoutVariant: fallbackVariant,
        headerPlacement: 'top',
        colorMood: randomPalette.name,
        primaryAccent: randomPalette.primaryAccent,
        secondaryAccent: randomPalette.secondaryAccent,
        cardBackground: randomPalette.cardBackground,
        cardBorder: randomPalette.cardBorder,
        mainBannerTitle: topic.toUpperCase().slice(0, 22),
        mainBannerSubheader: `PENGEMBANGAN KEBIJAKAN PUBLIK • Fokuskajian: ${topic.slice(0, 30)}`,
        mainBannerDefinitionBody: `Secara substantif, penanganan isu ${topic} membutuhkan kolaborasi terpadu antara regulasi pemerintah daerah, pengawasan anggaran parlemen, serta partisipasi aktif masyarakat secara berkelanjutan di tingkat akar rumput.`,
        blocks: {
          left_positive: {
            header: 'DAMPAK BURUK',
            body: `Kurangnya penanganan sistematis terhadap ${topic} memicu penurunan kualitas hidup warga, menghambat produktivitas ekonomi lokal, serta memperburuk kerentanan lingkungan di wilayah terdampak.`,
          },
          left_negative_box: {
            header: 'MANFAAT PENGELOLAAN',
            body: `Tata kelola yang terstruktur mampu membuka peluang ekonomi baru, menjaga kelestarian fungsi ruang publik, meningkatkan kesehatan masyarakat, serta memperkuat ketahanan sosial daerah.`,
          },
          center_giant_title: {
            header: 'SOLUSI TERUKUR',
            body: `Langkah penanganan wajib dimulai dari pembenahan hulu hingga hilir melalui penyediaan infrastruktur memadai, edukasi warga secara masif, serta penegakan perda yang konsisten di lapangan.`,
          },
          right_cause: {
            header: 'AKSI BERSAMA',
            body: `Sinergi antara masyarakat, komunitas lokal, dan pemerintah daerah menjadi kunci utama dalam mengakselerasi perubahan perilaku serta memastikan keberlanjutan program di setiap kelurahan.`,
          },
        },
        statCircles: [
          { topLabel: 'Setidaknya', value: '120+', description: `lokasi atau titik krusial terdampak isu ${topic.slice(0, 20)}.` },
          { topLabel: 'Armada Siaga', value: '28 Unit', description: 'satuan tugas dan personel lapangan dikerahkan penuh.' },
          { topLabel: 'Lebih dari', value: '1.450', description: 'warga memperoleh manfaat advokasi langsung di posko.' },
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
   * Guardrail deterministik untuk memotong kalimat secara rapi jika LLM melebihi batas karakter
   * serta menyucikan teks dari mikrolinguistik terlarang (Zero-Tolerance: em-dash, Oxford comma, 'sekadar', 'nyata')
   */
  private static enforceCharacterBudgets(
    copy: SynthesizedEditorialCopy,
    blueprint: PreAnalyzedPosterBlueprint
  ): SynthesizedEditorialCopy {
    // 1. Sanitasi Mikrolinguistik Master Editorial untuk seluruh teks
    if (copy.mainBannerTitle) {
      copy.mainBannerTitle = MasterEditorialSanitizer.cleanHeadline(copy.mainBannerTitle);
    }
    if (copy.mainBannerSubheader) {
      copy.mainBannerSubheader = MasterEditorialSanitizer.sanitize(copy.mainBannerSubheader);
    }
    if (copy.mainBannerDefinitionBody) {
      copy.mainBannerDefinitionBody = MasterEditorialSanitizer.sanitize(copy.mainBannerDefinitionBody);
    }

    // 2. Kunci properti global banner (Berlaku untuk SEMUA Arketipe)
    if (copy.mainBannerTitle && copy.mainBannerTitle.length > 26) {
      copy.mainBannerTitle = this.smartTruncate(copy.mainBannerTitle, 26, false);
    }
    if (copy.mainBannerSubheader && copy.mainBannerSubheader.length > 75) {
      copy.mainBannerSubheader = this.smartTruncate(copy.mainBannerSubheader, 75, true);
    }
    if (copy.mainBannerDefinitionBody && copy.mainBannerDefinitionBody.length > 360) {
      copy.mainBannerDefinitionBody = this.smartTruncate(copy.mainBannerDefinitionBody, 360, true);
    }

    // 3. Kunci numberedItems (untuk MODULAR_GRID_CARDS & RETRO_SPLIT_MITIGATION)
    if (Array.isArray(copy.numberedItems)) {
      copy.numberedItems = copy.numberedItems.map((item) => ({
        ...item,
        title: this.smartTruncate(MasterEditorialSanitizer.sanitize(item.title || ''), 28, false),
        summary: this.smartTruncate(MasterEditorialSanitizer.sanitize(item.summary || ''), 110, true),
      }));
    }

    // 4. Kunci statCircles (untuk TORN_PAPER_NEWS)
    if (Array.isArray(copy.statCircles)) {
      copy.statCircles = copy.statCircles.map((stat) => ({
        ...stat,
        topLabel: this.smartTruncate(MasterEditorialSanitizer.sanitize(stat.topLabel || ''), 16, false),
        value: (stat.value || '').slice(0, 8),
        description: this.smartTruncate(MasterEditorialSanitizer.sanitize(stat.description || ''), 65, true),
      }));
    }

    // 5. Kunci editorialBlocks (untuk STREET_JOURNALISM)
    for (const spec of blueprint.slotManifest.editorialBlocks || []) {
      const target = copy.blocks?.[spec.slotId];
      if (!target) continue;
      if (target.header) {
        const sanitizedHeader = MasterEditorialSanitizer.cleanHeadline(target.header);
        target.header = this.smartTruncate(sanitizedHeader, spec.constraints.headerMaxChars, false);
      }
      if (target.body) {
        const sanitizedBody = MasterEditorialSanitizer.sanitize(target.body);
        target.body = this.smartTruncate(sanitizedBody, spec.constraints.bodyMaxChars, true);
      }
    }
    return copy;
  }

  private static smartTruncate(text: string, maxChars: number, addEllipsis = true): string {
    const clean = text.trim();
    if (clean.length <= maxChars) return clean;
    const limit = addEllipsis ? Math.max(3, maxChars - 3) : maxChars;
    const sliced = clean.slice(0, limit);
    const lastSpace = sliced.lastIndexOf(' ');
    const safeText = lastSpace > limit * 0.6 ? sliced.slice(0, lastSpace) : sliced;
    return addEllipsis ? `${safeText.trim()}...` : safeText.trim();
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

    const accentHex = tenantBrandHex || blueprint.colorPalette.primaryAccent || '#9E0B0F';
    const baseHex = blueprint.colorPalette.backgroundBase || '#F4F1EA';
    const cutouts = synthesizedCopy.mappedVisualCutouts || {};

    let englishPrompt = '';

    if (blueprint.archetype === 'TORN_PAPER_NEWS') {
      // Arketipe: TECHNO VERITAS / TORN PAPER EDITORIAL
      englishPrompt = `
[ROLE & EDITORIAL PHOTOJOURNALISM ART DIRECTION]
A dramatic, high-impact photojournalistic documentary photograph in the style of Time Magazine / Reuters covering: "${topic}".
In the center foreground, authentic Indonesian citizens and professionals actively engaged in real-world activity directly addressing: "${topic}".
Upper background features an atmospheric sky with subtle geometric glowing tint in accent (${accentHex}).
Gritty 35mm film documentary texture, authentic cinematic lighting with rich highlights and deep contrast.

[CRITICAL ZERO-TEXT / ZERO-LOGO MANDATE]
- Absolutely ZERO text, ZERO letters, ZERO words, ZERO headlines, ZERO numbers, ZERO newspaper clippings, ZERO logos, and ZERO watermarks anywhere on the image.
- Pure dramatic documentary photography only.
      `.trim();
    } else if (blueprint.archetype === 'RETRO_SPLIT_MITIGATION') {
      // Arketipe: RETRO RISOGRAPH SPLIT-SCREEN
      englishPrompt = `
[ROLE & RETRO RISOGRAPH ART DIRECTION]
Vintage 1970s-1980s civic educational risograph illustration addressing: "${topic}".
In the center, an authentic stylized graphic illustration directly representing: "${topic}" in an Indonesian civic setting.
Aged warm paper background (${baseHex}) with subtle halftone textures, tactile lithograph grain, muted retro color grading featuring accent tint (${accentHex}) and warm neutral tones.
Clean spatial layout leaving ample breathing room for diagrammatic callouts.

[CRITICAL ZERO-TEXT / ZERO-LOGO MANDATE]
- DO NOT generate any text, letters, titles, signs, diagrams, numbers, or logos.
- Pure illustrative artwork only.
      `.trim();
    } else if (blueprint.archetype === 'MODULAR_GRID_CARDS') {
      // Arketipe: MODULAR GRID CARDS
      englishPrompt = `
[ROLE & EDITORIAL MINIMALIST ART DIRECTION]
High-end editorial documentary architectural background and civic infrastructure texture for: "${topic}".
Composition: Clean, balanced layout with ample negative space. A panoramic subtle photographic texture capturing Indonesian civic environments, modern public facilities, and community development representing: "${topic}".
Muted tones, authentic 35mm film grain, elegant lighting, completely flat and uncluttered in the designated content card zones.

[CRITICAL ZERO-TEXT & CLEAN NEGATIVE SPACE MANDATE]
- DO NOT draw any people in the center of the frame.
- DO NOT generate any numbers, text, letters, typography, diagrams, or watermarks.
- Pure photographic backdrop and textured negative space ready for external UI card overlay.
      `.trim();
    } else if (blueprint.archetype === 'VINTAGE_PERSONA_GAZETTE') {
      // Arketipe: VINTAGE BROADSHEET GAZETTE
      englishPrompt = `
[ROLE & ARCHIVAL BROADSHEET ART DIRECTION]
Warm archival broadsheet newspaper textured background for: "${topic}".
Vintage sepia-toned paper texture with subtle newsprint grain, aged print patina, and soft vignette along the edges.
Atmospheric and dignified civic mood representing: "${topic}".

[CRITICAL ZERO-TEXT & ZERO-PERSON MANDATE]
- DO NOT draw any large portrait, person, or figure sitting in the center. The canvas MUST be clean aged newsprint paper texture with subtle atmospheric framing.
- DO NOT generate any headlines, newsprint letters, mastheads, numbers, or logos.
      `.trim();
    } else if (blueprint.archetype === 'POP_OUT_HERO') {
      // Arketipe: POP OUT HERO / CINEMATIC OVERLAY
      englishPrompt = `
[ROLE & CINEMATIC EDITORIAL ART DIRECTION]
Dramatic cinematic aerial or environmental documentary shot capturing: "${topic}".
High-end editorial magazine art direction, National Geographic outdoor aesthetic with authentic 35mm film grain.
Rich natural textures, soft atmospheric daylight, warm highlights, and subtle accent (${accentHex}) color grading.
The top 35% of the frame MUST be clean, uncluttered, or soft-focus atmospheric background providing negative space.

[CRITICAL ZERO-TEXT / ZERO-LOGO MANDATE]
- DO NOT generate any text, letters, words, headlines, numbers, or watermarks.
- DO NOT generate any logos, emblems, or brand signatures.
- Pure cinematic documentary photography only.
      `.trim();
    } else {
      // Arketipe: STREET_JOURNALISM / BRUTALIST COLLAGE DEFAULT
      const midLeftDirective =
        compositionMode === 'FIGURE_CENTERPIECE'
          ? `- MIDDLE-LEFT ZONE (x: 15%-45%, y: 28%-70%): Paint ONLY a dramatic diagonal accent (${accentHex}) brush-stroke splash and subtle black wireframe wave lines on the cream paper. Leave the center of this brush splash EMPTY without any person so an external portrait cutout can be placed on top.`
          : `- MIDDLE-LEFT FOREGROUND (x: 15%-45%, y: 28%-72%): A striking high-contrast black-and-white halftone cutout photograph of ${cutouts.mid_left_hero_cutout || 'an Indonesian citizen or worker involved in ' + topic}, standing prominently in front of a bold diagonal accent (${accentHex}) brush-stroke splash.`;

      englishPrompt = `
[ROLE & BRUTALIST EDITORIAL ART DIRECTION]
Act as a master Indonesian graphic designer creating a vintage brutalist newspaper collage poster background (vertical 4:5 ratio, 1080x1350px) for the topic: "${topic}".

[EXACT SPATIAL COLLAGE BLUEPRINT - FOLLOW COORDINATES STRICTLY]
1. PAPER BASE (UPPER 74% OF CANVAS):
   - Textured vintage off-white newsprint paper (${baseHex}) with subtle archival grain.
   - Completely clean, empty paper zones in the Top-Left (x: 5%-38%, y: 5%-36%), Top-Center (x: 40%-58%, y: 5%-46%), and Middle-Right (x: 60%-94%, y: 28%-48%) to serve as clean negative space for external typography overlays.

2. CUTOUT PHOTOGRAPHY & GRAPHIC ACCENTS (BLACK & WHITE HALFTONE + ACCENT):
   - UPPER-RIGHT QUADRANT (x: 60%-96%, y: 4%-27%): High-contrast black-and-white documentary cutout photo representing: ${cutouts.upper_right_cutout || topic}, overlapping a geometric shape (${accentHex}) on the right edge.
   ${midLeftDirective}
   - LOWER-MIDDLE STREET MONTAGE (x: 0%-100%, y: 48%-74%): Gritty, high-contrast black-and-white Indonesian architectural and civic setting representing: ${cutouts.bottom_street_scene || topic}. Include a graphic accent wave (${accentHex}) and fine topographic contour lines across the bottom-right corner.

3. SOLID BLACK FOOTER BLOCK (BOTTOM 26% OF CANVAS):
   - The bottom section (y: 74%-100%) MUST be a flat, solid pitch-black (#0A0A0A) rectangular banner across the entire width.

[CRITICAL ZERO-TEXT / ZERO-LOGO MANDATE]
- DO NOT generate any text, letters, numbers, newspaper headlines, signboards, license plates, or typography anywhere on the image.
- DO NOT generate any logos, emblems, or watermarks.
- Output ONLY the clean visual collage art and empty negative-space zones ready for programmatic SVG text compositing.
`.trim();
    }

    const { width, height } = blueprint.slotManifest.canvas;

    return {
      blueprintId: blueprint.id,
      archetype: blueprint.archetype,
      englishPrompt,
      aspectRatio: blueprint.aspectRatio,
      canvasDimensions: { width, height },
      synthesizedCopy,
    };
  }
}
