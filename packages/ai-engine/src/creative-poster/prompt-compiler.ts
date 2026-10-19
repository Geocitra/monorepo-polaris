import {
  PreAnalyzedPosterBlueprint,
  CompiledPosterPrompt,
  SynthesizedEditorialCopy,
  SubjectCompositionMode,
} from './types.js';
import { openaiClient } from '../client.js';

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
          `- Slot ID "${b.slotId}" (Ref Asli: "${b.defaultReferenceHeader}"): Header maks ${b.constraints.headerMaxChars} karakter. Body WAJIB antara ${b.constraints.bodyMinChars} s/d ${b.constraints.bodyMaxChars} karakter.`
      )
      .join('\n');

    const visualSlotsText = (blueprint.slotManifest.visualCutoutSlots || [])
      .map(
        (v) =>
          `- Visual Slot ID "${v.slotId}": Objek referensi asli adalah "${v.originalReferenceSubject}". Terjemahkan ke objek dunia nyata di Indonesia yang relevan dengan topik "${topic}" dalam Bahasa Inggris.`
      )
      .join('\n');

    const systemPrompt = `Anda adalah Art Director & Copywriter Infografis Kebijakan POLARIS.
Tugas Anda adalah mengadaptasi tata letak poster referensi menjadi poster baru bertopik: "${topic}".

${groundedContext ? `FAKTA RISET & DATA PENDUKUNG:\n${groundedContext.slice(0, 1800)}\n` : ''}

ATURAN BISNIS MUTLAK (CHARACTER BUDGET INVARIANT):
1. Setiap blok teks harus padat, bernas, menggunakan Bahasa Indonesia baku jurnalistik.
2. PATUHI batas karakter untuk setiap Slot ID berikut agar tidak merusak grid desain:
${blockConstraintsText || '- Buat konten ringkas dan padat.'}

3. PEMETAAN OBJEK VISUAL 1:1 (DALAM BAHASA INGGRIS):
Ubah objek di poster lama menjadi objek yang relevan dengan "${topic}", namun pertahankan komposisi dan aktivitas manusianya:
${visualSlotsText}

Keluarkan output HANYA dalam format JSON murni:
{
  "mainBannerTitle": "JUDUL UTAMA 2-3 KATA TEGAS (Maks 22 karakter, contoh: CARA MENGATASI SAMPAH)",
  "mainBannerSubheader": "Subjudul pengantar di atas judul utama (Maks 65 karakter)",
  "mainBannerDefinitionBody": "Paragraf definisi/kesimpulan komprehensif di bagian paling bawah banner hitam (Wajib antara 280 s/d 360 karakter)",
  "blocks": {
    "left_positive": { "header": "...", "body": "..." },
    "left_negative_box": { "header": "...", "body": "..." },
    "center_giant_title": { "header": "2 KATA PENDEK (Maks 14 char, misal: SOLUSI NYATA)", "body": "..." },
    "right_cause": { "header": "2 KATA (Maks 20 char, misal: AKSI BERSAMA)", "body": "..." }
  },
  "statCircles": [
    { "topLabel": "Setidaknya", "value": "120+", "description": "titik lokasi terdampak langsung dalam 24 jam terakhir." },
    { "topLabel": "Armada Siaga", "value": "28 Unit", "description": "personel dan logistik darurat diterjunkan ke titik kritis." },
    { "topLabel": "Lebih dari", "value": "1.450", "description": "warga menerima bantuan terpadu di posko pelayanan." }
  ],
  "numberedItems": [
    { "number": "01", "title": "Audit Kelayakan", "subtitle": "Inspeksi Berkala", "summary": "Pemeriksaan teknis menyeluruh terhadap seluruh instalasi publik." },
    { "number": "02", "title": "Respons Cepat", "subtitle": "Satuan Reaksi 24 Jam", "summary": "Pengerahan tim terpadu untuk penanganan darurat tanpa hambatan birokrasi." },
    { "number": "03", "title": "Bantuan Terpadu", "subtitle": "Logistik & Medis", "summary": "Distribusi pangan, obat-obatan, dan posko kemanusiaan ramah keluarga." },
    { "number": "04", "title": "Pemulihan Sosial", "subtitle": "Pendampingan Warga", "summary": "Fasilitasi pemulihan dokumen kependudukan dan aset vital warga terdampak." },
    { "number": "05", "title": "Regulasi Tegas", "subtitle": "Payung Hukum Kuat", "summary": "Penerbitan perda pengawasan dan standar proteksi keselamatan lingkungan." }
  ],
  "mappedVisualCutouts": {
    "upper_right_cutout": "Indonesian sanitation workers sorting waste bins in front of a garbage collection truck",
    "mid_left_hero_cutout": "An Indonesian male sanitation worker wearing a cap and work boots, holding two large black plastic trash bags facing forward",
    "bottom_street_scene": "Indonesian urban neighborhood street scene with residents cleaning and a three-wheeled garbage collection motorcart"
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
      return this.enforceCharacterBudgets(parsed, blueprint);
    } catch (error) {
      // Fallback deterministik jika LLM timeout
      return {
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
            header: 'SOLUSI NYATA',
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
          { number: '03', title: 'Penyaluran Bantuan', subtitle: 'Logistik & Layanan', summary: 'Fasilitasi bantuan nyata dan advokasi birokrasi tepat sasaran bagi warga.' },
          { number: '04', title: 'Konsolidasi Warga', subtitle: 'Partisipasi Publik', summary: 'Membangun rukun warga tanggap dan forum aspirasi akar rumput yang berdaya.' },
          { number: '05', title: 'Regulasi Perlindungan', subtitle: 'Kepastian Hukum', summary: 'Mendorong pengesahan perda perlindungan hak publik dan anggaran berpihak.' },
        ],
        mappedVisualCutouts: {
          upper_right_cutout: `Indonesian field workers and equipment addressing ${topic}`,
          mid_left_hero_cutout: `Indonesian frontline worker or citizen actively involved in ${topic}`,
          bottom_street_scene: `Authentic Indonesian street environment showing community activity related to ${topic}`,
        },
      };
    }
  }

  /**
   * Guardrail deterministik untuk memotong kalimat secara rapi jika LLM melebihi batas karakter
   */
  private static enforceCharacterBudgets(
    copy: SynthesizedEditorialCopy,
    blueprint: PreAnalyzedPosterBlueprint
  ): SynthesizedEditorialCopy {
    // 1. Kunci properti global banner (Berlaku untuk SEMUA 8 Arketipe!)
    if (copy.mainBannerTitle && copy.mainBannerTitle.length > 26) {
      copy.mainBannerTitle = this.smartTruncate(copy.mainBannerTitle, 26, false);
    }
    if (copy.mainBannerSubheader && copy.mainBannerSubheader.length > 75) {
      copy.mainBannerSubheader = this.smartTruncate(copy.mainBannerSubheader, 75, true);
    }
    if (copy.mainBannerDefinitionBody && copy.mainBannerDefinitionBody.length > 360) {
      copy.mainBannerDefinitionBody = this.smartTruncate(copy.mainBannerDefinitionBody, 360, true);
    }

    // 2. Kunci numberedItems (untuk MODULAR_GRID_CARDS & RETRO_SPLIT_MITIGATION)
    if (Array.isArray(copy.numberedItems)) {
      copy.numberedItems = copy.numberedItems.map((item) => ({
        ...item,
        title: this.smartTruncate(item.title || '', 28, false),
        summary: this.smartTruncate(item.summary || '', 110, true),
      }));
    }

    // 3. Kunci statCircles (untuk TORN_PAPER_NEWS)
    if (Array.isArray(copy.statCircles)) {
      copy.statCircles = copy.statCircles.map((stat) => ({
        ...stat,
        topLabel: this.smartTruncate(stat.topLabel || '', 16, false),
        value: (stat.value || '').slice(0, 8),
        description: this.smartTruncate(stat.description || '', 65, true),
      }));
    }

    // 4. Kunci editorialBlocks (untuk STREET_JOURNALISM)
    for (const spec of blueprint.slotManifest.editorialBlocks || []) {
      const target = copy.blocks?.[spec.slotId];
      if (!target) continue;
      if (target.header) {
        target.header = this.smartTruncate(target.header, spec.constraints.headerMaxChars, false);
      }
      if (target.body) {
        target.body = this.smartTruncate(target.body, spec.constraints.bodyMaxChars, true);
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
      // Arketipe: TECHNO VERITAS / NIGHT OF TREMORS (Malam Jago Merah)
      englishPrompt = `
[ROLE & EDITORIAL PHOTOJOURNALISM ART DIRECTION]
A dramatic, high-impact photojournalistic documentary photograph in the style of Time Magazine / Reuters covering: "${topic}".
In the center foreground, emotional Indonesian community residents and emergency responders or field workers are supporting each other with deep human empathy amidst an authentic environmental or urban setting.
Behind them in the upper background, dark moody smoke-filled or atmospheric sky with glowing crimson red (${accentHex}) and amber concentric heatwave ripple rings radiating outwards.
Gritty 35mm film documentary texture, authentic cinematic lighting with rich warm embers/accents and cool twilight contrast.

[CRITICAL ZERO-TEXT / ZERO-LOGO MANDATE]
- Absolutely ZERO text, ZERO letters, ZERO words, ZERO headlines, ZERO numbers, ZERO newspaper clippings, ZERO logos, and ZERO watermarks anywhere on the image.
- Pure dramatic documentary photography only.
      `.trim();
    } else if (blueprint.archetype === 'RETRO_SPLIT_MITIGATION') {
      // Arketipe: EARTHQUAKE INFOGRAFIS RETRO STYLE (Get To Know Mitigation)
      englishPrompt = `
[ROLE & RETRO RISOGRAPH ART DIRECTION]
Vintage 1970s-1980s public safety educational risograph illustration addressing: "${topic}".
In the center, an authentic detailed illustration of Indonesian architecture, civic infrastructure, and disaster/incident response mechanisms.
Aged warm paper background (${baseHex}) with subtle halftone textures, tactile lithograph grain, muted retro color grading featuring teal (${accentHex}) and warm ochre tones.
Clean spatial layout leaving ample breathing room for diagrammatic callouts.

[CRITICAL ZERO-TEXT / ZERO-LOGO MANDATE]
- DO NOT generate any text, letters, titles, signs, diagrams, numbers, or logos.
- Pure illustrative artwork only.
      `.trim();
    } else if (blueprint.archetype === 'MODULAR_GRID_CARDS') {
      // Arketipe: 5 MODERN FONT PAIRINGS (Modular 5 Cards)
      englishPrompt = `
[ROLE & MODERN MONOCHROME MINIMALIST ART DIRECTION]
High-end editorial architectural and documentary contact sheet in high-contrast black and white for: "${topic}".
A panoramic or quadrant composition capturing modern Indonesian civic infrastructure, public spaces, environmental protection facilities, and community collaboration.
Crisp Hasselblad monochrome photography, razor-sharp focus, rich deep blacks and clean highlights, subtle cinematic film grain.

[CRITICAL ZERO-TEXT / ZERO-LOGO MANDATE]
- DO NOT generate any numbers, text, letters, labels, or watermarks.
- Pure photographic visual texture only.
      `.trim();
    } else if (blueprint.archetype === 'VINTAGE_PERSONA_GAZETTE') {
      // Arketipe: THE S NEWS / BIOGRAFI TOKOH
      englishPrompt = `
[ROLE & ARCHIVAL BROADSHEET ART DIRECTION]
Warm archival broadsheet newspaper background texture and environmental portrait setting for: "${topic}".
Vintage sepia-toned darkroom lighting with subtle paper grain, aged print patina, and soft vignette.
Atmospheric and dignified civic leadership mood.

[CRITICAL ZERO-TEXT / ZERO-LOGO MANDATE]
- DO NOT generate any headlines, newsprint letters, mastheads, or logos.
      `.trim();
    } else {
      // Arketipe: STREET_JOURNALISM (Poster PKL / Risograph Default)
      const midLeftDirective =
        compositionMode === 'FIGURE_CENTERPIECE'
          ? `- MIDDLE-LEFT ZONE (x: 15%-45%, y: 28%-70%): Paint ONLY a dramatic diagonal crimson red (${accentHex}) brush-stroke splash and subtle black wireframe wave lines on the cream paper. Leave the center of this brush splash EMPTY without any person so an external portrait cutout can be placed on top.`
          : `- MIDDLE-LEFT FOREGROUND (x: 15%-45%, y: 28%-72%): A striking high-contrast black-and-white halftone cutout photograph of ${cutouts.mid_left_hero_cutout || 'an Indonesian community worker'}, standing prominently in front of a bold diagonal crimson red (${accentHex}) brush-stroke splash.`;

      englishPrompt = `
[ROLE & BRUTALIST EDITORIAL ART DIRECTION]
Act as a master Indonesian graphic designer creating a vintage brutalist newspaper collage poster background (vertical 4:5 ratio, 1080x1350px) for the topic: "${topic}".

[EXACT SPATIAL COLLAGE BLUEPRINT - FOLLOW COORDINATES STRICTLY]
1. PAPER BASE (UPPER 74% OF CANVAS):
   - Textured vintage off-white newsprint paper (${baseHex}) with subtle archival grain.
   - Completely clean, empty paper zones in the Top-Left (x: 5%-38%, y: 5%-36%), Top-Center (x: 40%-58%, y: 5%-46%), and Middle-Right (x: 60%-94%, y: 28%-48%) to serve as clean negative space for external typography overlays.

2. CUTOUT PHOTOGRAPHY & GRAPHIC ACCENTS (BLACK & WHITE HALFTONE + CRIMSON RED):
   - UPPER-RIGHT QUADRANT (x: 60%-96%, y: 4%-27%): High-contrast black-and-white documentary cutout photo of ${cutouts.upper_right_cutout || 'Indonesian public service activity'}, overlapping a geometric crimson red (${accentHex}) shape on the right edge.
   ${midLeftDirective}
   - LOWER-MIDDLE STREET MONTAGE (x: 0%-100%, y: 48%-74%): Gritty, high-contrast black-and-white Indonesian architectural street scene featuring ${cutouts.bottom_street_scene || 'urban civic life'}. Include a flowing crimson red (${accentHex}) ribbon wave and fine black topographic contour lines across the bottom-right street corner.

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
