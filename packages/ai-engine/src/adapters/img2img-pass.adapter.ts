import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';
import { googleGenAiClient } from '../client.js';
import { AiTelemetryService } from '../telemetry/ai-telemetry.service.js';
import type { ArtCollageCopy } from '../creative-poster/art-collage/art-collage.types.js';

export interface Img2ImgPassOptions {
  imageBuffer: Buffer;
  sdxlInputBuffer?: Buffer;
  prompt: string;
  denoisingStrength?: number;
  archetype?: string;
  layoutVariant?: number;
  palette?: {
    primaryHex?: string;
    accentHex?: string;
    secondaryHex?: string;
  };
  copy?: ArtCollageCopy;
  signature?: string;
  headerTag?: string;
  editionTag?: string;
  tenantId?: string;
}

export interface Img2ImgPassResult {
  buffer: Buffer;
  providerUsed: 'gemini-relayout' | 'fal-ai' | 'replicate' | 'custom-http' | 'skipped';
  denoisingStrengthUsed: number;
  durationMs: number;
  compiledRelayoutPrompt?: string;
}

function ensureEnvLoaded(): void {
  const candidates = [
    path.resolve(process.cwd(), '.env'),
    path.resolve(process.cwd(), '../.env'),
    path.resolve(process.cwd(), '../../.env'),
    path.resolve(process.cwd(), '../../../.env'),
  ];
  for (const envPath of candidates) {
    if (fs.existsSync(envPath)) {
      dotenv.config({ path: envPath, override: true });
      break;
    }
  }
}

function detectImageMimeAndExt(buf: Buffer): { mime: string; ext: string } {
  if (
    buf.length >= 12 &&
    buf.subarray(0, 4).toString('ascii') === 'RIFF' &&
    buf.subarray(8, 12).toString('ascii') === 'WEBP'
  ) {
    return { mime: 'image/webp', ext: 'webp' };
  }
  if (buf.length >= 8 && buf[0] === 0x89 && buf[1] === 0x50 && buf[2] === 0x4e && buf[3] === 0x47) {
    return { mime: 'image/png', ext: 'png' };
  }
  return { mime: 'image/jpeg', ext: 'jpg' };
}

function buildVerbatimContentTranscript(options: Img2ImgPassOptions): string {
  const copy = options.copy;
  if (!copy) return '';

  const stripSlashes = (val?: string) =>
    String(val || '')
      .replace(/\s*\/\/+\s*/g, ' • ')
      .replace(/\(\s*POIN\s*0?\d+\s*[-–—]\s*POIN\s*0?\d+\s*\)/gi, '')
      .replace(/\s*(?:&|\/|-|•)\s*$/g, '')
      .trim();

  const lines: string[] = [
    '====================================================================',
    'MANDATORY VERBATIM CONTENT TRANSCRIPT (EACH ITEM MUST APPEAR EXACTLY ONCE — ZERO DUPLICATION, NO "//" SYMBOLS, NO "(POIN 04 - POIN 06)" META-LABELS):',
    '====================================================================',
  ];

  if (options.headerTag || options.editionTag) {
    lines.push(
      `- TOP HEADER TAG (appear 1x only at the very top of the poster): "${stripSlashes(options.editionTag || options.headerTag)}" | "DOKUMEN ADVOKASI PUBLIK"`
    );
  }
  if (copy.kicker) {
    lines.push(`- KICKER / RUBRIK (appear 1x only): "${stripSlashes(copy.kicker)}"`);
  }
  if (copy.headline) {
    lines.push(`- MAIN HEADLINE (appear 1x only): "${stripSlashes(copy.headline)}"`);
  }
  if (copy.deck) {
    lines.push(`- EXECUTIVE SUMMARY DECK (appear 1x only, upright sans-serif): "${stripSlashes(copy.deck)}"`);
  }

  const isNarrativeWave = options.archetype === 'INFOGRAPHIC_NARRATIVE_WAVE';
  const isAdvocacyPillars = options.archetype === 'INFOGRAPHIC_ADVOCACY_PILLARS';

  if (isNarrativeWave) {
    if (Array.isArray(copy.stats) && copy.stats.length > 0) {
      lines.push(`- 4 MACRO KPI STATS (appear 1x only in the single middle horizontal belt spanning across canvas):`);
      copy.stats.slice(0, 4).forEach((st, idx) => {
        lines.push(`  * KPI 0${idx + 1}: "${stripSlashes(st.value)}" — "${stripSlashes(st.label)}"`);
      });
    }
  } else if (Array.isArray(copy.stats) && copy.stats.length > 0) {
    lines.push(`- 4 MACRO KPI STATS (each KPI must appear 1x only in the KPI strip):`);
    copy.stats.forEach((st, idx) => {
      lines.push(`  * KPI 0${idx + 1}: "${stripSlashes(st.value)}" — "${stripSlashes(st.label)}"`);
    });
  }

  // Chart: STRICTLY FORBIDDEN ON ADVOCACY PILLARS & RADIAL CLOCK
  if (
    !isAdvocacyPillars &&
    options.archetype !== 'INFOGRAPHIC_RADIAL_CLOCK' &&
    copy.chart &&
    Array.isArray(copy.chart.slices) &&
    copy.chart.slices.length > 0
  ) {
    const dominantSlice = [...copy.chart.slices].sort(
      (a, b) => (Number(b.percentage) || 0) - (Number(a.percentage) || 0)
    )[0] || copy.chart.slices[0];
    const topPct = Math.round(Number(dominantSlice.percentage) || 0);
    lines.push(
      `- 1 DATA VISUALIZATION PIE / DONUT CHART (LOWER-LEFT CLEAN CREAM PAPER ZONE — RENDER THIS DONUT CHART & ITS 4 COLOR-CODED LEGEND ITEMS ONCE; INSIDE THE DONUT CENTER HOLE RENDER ONLY "${topPct}%" (THE DOMINANT MAXIMUM PERCENTAGE) WITH ZERO SUB-TEXT; OUTSIDE THE DONUT RING RENDER ONLY THE 4 COLOR LEGENDS WITH TEXT LABELS — ZERO CARDS/CONTAINERS):`
    );
    lines.push(`  * Chart Heading: "✦ ${stripSlashes(copy.chart.title)} (100%)"`);
    copy.chart.slices.forEach((sl, idx) => {
      lines.push(`  * Segment 0${idx + 1}: ${sl.percentage}% — "${stripSlashes(sl.label)}"`);
    });
  }

  if (copy.sectionHeading && !isNarrativeWave) {
    lines.push(
      `- LOWER SECTION HEADING (appear 1x only above Points 04–06, NEVER add "(POIN 04 - POIN 06)"): "✦ ${stripSlashes(copy.sectionHeading)}"`
    );
  }

  if (isNarrativeWave) {
    const pts = copy.points || [];
    const p1 = pts[0] || { label: 'KONDISI INFRASTRUKTUR SAAT INI', text: '' };
    const p2 = pts[1] || { label: 'WILAYAH PRIORITAS PERBAIKAN', text: '' };
    const p3 = pts[2] || { label: 'MEKANISME PELAKSANAAN PROGRAM', text: '' };
    const p4 = pts[3] || { label: 'PENINGKATAN KUALITAS FASILITAS', text: '' };
    const p5 = pts[4] || { label: 'TRANSPARANSI DATA PENERIMA MANFAAT', text: '' };
    const p6 = pts[5] || { label: 'DAMPAK JANGKA PANJANG PERBAIKAN', text: '' };

    lines.push(
      `- EXACTLY 6 NARRATIVE DIMENSION POINTS (FAITHFULLY MATCHING GOLD REFERENCE DUAL-QUADRANT LAYOUT — ZERO DUPLICATION, ZERO FLOATING CARDS):`,
      `  * UPPER-RIGHT CRIMSON RED RIBBON ZONE (SOLID WHITE INK):`,
      `    - [${p1.badge || 'INDIKATOR KUNCI'}] 01 • ${stripSlashes(p1.label)}: "${stripSlashes(p1.text)}"`,
      `    - 02 • ${stripSlashes(p2.label)} [${p2.badge || 'PROGRAM INTERVENSI'}]: "${stripSlashes(p2.text)}"`,
      `  * LOWER-LEFT CLEAN CREAM PAPER ZONE (DARK SLATE INK DIRECTLY ON PAPER — ZERO CARDS):`,
      `    - ✦ ${stripSlashes(copy.sectionHeading || 'TARGET DAN REALISASI KEBIJAKAN')} [${p4.badge || 'TARGET PENURUNAN'}]`,
      `    - 04 • ${stripSlashes(p4.label)}: "${stripSlashes(p4.text)}"`,
      `  * LOWER-RIGHT CRIMSON RED RIBBON ZONE (SOLID WHITE INK):`,
      `    - 03 • ${stripSlashes(p3.label)}: "${stripSlashes(p3.text)}"`,
      `    - 05 • ${stripSlashes(p5.label)}: "${stripSlashes(p5.text)}"`,
      `    - 06 • ${stripSlashes(p6.label)}: "${stripSlashes(p6.text)}"`
    );
  } else if (Array.isArray(copy.points) && copy.points.length > 0) {
    const half = Math.ceil(copy.points.length / 2);
    lines.push(
      `- ${copy.points.length} UNIQUE ANALYSIS POINTS (CRITICAL: EACH POINT 01 TO 0${copy.points.length} MUST APPEAR EXACTLY ONCE — NEVER DUPLICATE POINTS 01–03 IN THE LOWER SECTION! NEVER USE "//", AND NEVER WRITE "POIN 01" OR "(POIN 04 - POIN 06)"):`
    );
    lines.push(`  * PHASE 1 / UPPER ANALYSIS BLOCK (POINTS 01 TO 0${half}):`);
    copy.points.slice(0, half).forEach((pt, idx) => {
      lines.push(`    - 0${idx + 1} • ${stripSlashes(pt.label)}: "${stripSlashes(pt.text)}"`);
    });
    if (copy.points.length > half) {
      lines.push(`  * PHASE 2 / LOWER ACTION SECTION (POINTS 0${half + 1} TO 0${copy.points.length} ONLY — STRICTLY FORBIDDEN TO RE-RENDER POINTS 01–03 HERE!):`);
      copy.points.slice(half).forEach((pt, idx) => {
        lines.push(`    - 0${idx + half + 1} • ${stripSlashes(pt.label)}: "${stripSlashes(pt.text)}"`);
      });
    }
  }

  if (copy.closingLine) {
    lines.push(`- CLOSING CALLOUT (appear 1x only): "${stripSlashes(copy.closingLine)}"`);
  }

  if (options.signature) {
    lines.push(
      `- BOTTOM OFFICIAL FOOTER BAR (appear 1x only at the very bottom dark bar; leave 100% empty paper below this bar with ZERO extra text): "${stripSlashes(options.signature)}" | "${new Date().getFullYear()}"`
    );
  }

  return lines.join('\n');
}

export class Img2ImgPassAdapter {
  /**
   * Mengirimkan draf infografis/poster yang sudah disusun Chromium beserta seluruh transkrip kontennya
   * kembali ke Google Gemini Multimodal Image (`gemini-3.1-flash-image`) untuk di-generate ulang
   * menjadi tata letak (layout) yang jauh lebih rapi, proporsional, gambar dan seluruh isi kontennya
   * terlihat sangat tajam, jelas, dan 100% BEBAS DUPLIKASI DATA.
   */
  public static async executePass(options: Img2ImgPassOptions): Promise<Img2ImgPassResult> {
    const startTime = Date.now();
    ensureEnvLoaded();

    const denoisingStrength =
      typeof options.denoisingStrength === 'number'
        ? Math.max(0.1, Math.min(0.35, options.denoisingStrength))
        : 0.2;

    const geminiApiKey =
      process.env.GEMINI_API_KEY ||
      process.env.GOOGLE_GENAI_API_KEY ||
      process.env.GOOGLE_API_KEY;

    const transcriptBlock = buildVerbatimContentTranscript(options);
    const isNarrativeWave = options.archetype === 'INFOGRAPHIC_NARRATIVE_WAVE';
    const isAdvocacyPillars = options.archetype === 'INFOGRAPHIC_ADVOCACY_PILLARS';
    const isChronicleGrid = options.archetype === 'INFOGRAPHIC_CHRONICLE_GRID';
    const totalPoints = isNarrativeWave ? 6 : (isAdvocacyPillars ? 5 : (options.copy?.points?.length || 6));
    const layoutVariant = typeof options.layoutVariant === 'number' ? options.layoutVariant : 0;

    const dominantChartPct =
      options.copy?.chart?.slices && options.copy.chart.slices.length > 0
        ? Math.round(
            Number(
              [...options.copy.chart.slices].sort(
                (a, b) => (Number(b.percentage) || 0) - (Number(a.percentage) || 0)
              )[0]?.percentage
            ) || 40
          )
        : 40;

    const narrativeWaveRules = isNarrativeWave
      ? [
          `   - SPECIAL MASTER RULES FOR S-CURVE NARRATIVE RED WAVE (GOLD REFERENCE STANDARD):`,
          `     * DUAL-QUADRANT EDITORIAL SPATIAL ARCHITECTURE (CRITICAL):`,
          `       1. TOP HEADER ZONE (0% to 18%): Left Tag "POLARIS • DAPIL JABAR" | Right Tag "DOKUMEN ADVOKASI PUBLIK", Kicker in uppercase red ink, massive bold condensed black Headline (Bebas Neue), and 2-sentence Executive Summary Deck on clean cream paper (#F8F6F0).`,
          `       2. UPPER-LEFT QUADRANT (18% to 42%, left 46%): Authentic documentary cutout photograph of Indonesian citizen/worker. 100% CLEAN — NEVER PRINT ANY TEXT OR CARDS ACROSS THE PHOTO!`,
          `       3. UPPER-RIGHT CRIMSON WAVE (18% to 42%, right 50%): Bold sweeping crimson red ribbon (#991B1B) containing:`,
          `          - Point 01 with gold badge [INDIKATOR KUNCI] in crisp white typography.`,
          `          - Point 02 with gold badge [PROGRAM INTERVENSI] in crisp white typography.`,
          `       4. MIDDLE HORIZONTAL BELT (43% to 52%, spanning across canvas width): Single sleek 4-column metric belt (KPI 01, KPI 02, KPI 03, KPI 04) with dark semi-transparent glass backdrop and thin vertical dividers. Zero duplicate KPI blocks anywhere else!`,
          `       5. LOWER-LEFT QUADRANT (53% to 90%, left 46%): 100% CLEAN WARM CREAM BROADSHEET PAPER (#F8F6F0) containing:`,
          `          - Heading "✦ PROPORSI ALOKASI ANGGARAN PERBAIKAN (100%)" or topic-specific equivalent.`,
          `          - Exactly 1 circular Donut Chart with dominant maximum percentage "${dominantChartPct}%" in bold center hole, outer callouts, and 4 color-coded legend swatches.`,
          `          - Subhead "✦ TARGET DAN REALISASI KEBIJAKAN" + gold badge [TARGET PENURUNAN].`,
          `          - Point 04 in crisp dark slate typography directly inked on cream paper.`,
          `          - ABSOLUTE ZERO FLOATING CARDS, ZERO WHITE BOXES, ZERO DROP-SHADOW CONTAINERS!`,
          `       6. LOWER-RIGHT CRIMSON WAVE (53% to 90%, right 50%): Flowing crimson ribbon with vintage collage texture containing Points 03, 05, and 06 in solid crisp white typography (#FFFFFF):`,
          `          - Point 03 in crisp white.`,
          `          - Point 05 in crisp white.`,
          `          - Point 06 in crisp white.`,
          `       7. BOTTOM ZONE (91% to 100%): Dark capsule pill banner with amber leading highlight + official footer bar with legislator signature and year "${new Date().getFullYear()}".`,
          `     * EXACTLY 6 NARRATIVE POINTS (01 TO 06 COMPLETE — ZERO DUPLICATION, ZERO OMISSION): Render all 6 points from the transcript. Points 01 & 02 upper-right; Point 04 lower-left; Points 03, 05, 06 lower-right!`,
        ].join('\n')
      : '';

    const chronicleGridRules = isChronicleGrid
      ? [
          `   - SPECIAL RULES FOR CHRONICLE GRID (TEMPLATE 02 - SOEDIRMAN BROADSHEET):`,
          `     * The left column (width ~30%) is a prominent SOLID VIBRANT ORANGE vertical column (#EA580C) with bold white Bebas Neue stacked typography, a framed portrait window, a forest green badge (#15803D), and 2 Hero KPIs.`,
          `     * The right 68% of the canvas consists of 3 distinct chronicle cards with green (#15803D) and orange (#EA580C) banners on clean, warm cream broadsheet paper. NEVER draw photos across the right column cards!`,
        ].join('\n')
      : '';

    const chartRule =
      isAdvocacyPillars || options.archetype === 'INFOGRAPHIC_RADIAL_CLOCK'
        ? [
            `5. DATA VISUALIZATION & PIE/DONUT CHART RULES (CONDITIONAL BY ARCHETYPE):`,
            `   - ABSOLUTE ZERO PIE/DONUT CHART: For this template (${options.archetype}), DRAWING ANY PIE CHART, DONUT CHART, BAR GRAPH, OR CIRCULAR DIAGRAM IS STRICTLY FORBIDDEN! Leave the designated paper area clean for typography and metric text.`,
          ].join('\n')
        : [
            `5. DATA VISUALIZATION & PIE/DONUT CHART RULES (CONDITIONAL BY ARCHETYPE):`,
            `   - Render EXACTLY ONE (1) clean, editorial PIE / DONUT CHART on the entire poster inside its dedicated chart card/panel. NEVER draw a second chart anywhere else (especially NEVER in the bottom-left corner or lower margin)!`,
            `   - Inside the center hole of the Donut ring, render ONLY the single bold percentage number corresponding to the LARGEST / DOMINANT slice from the transcript (e.g., "${dominantChartPct}%") — NEVER write any sub-text inside the Donut center!`,
            `   - Outside the donut ring, render ONLY the 4 color-coded legend swatches with their textual category labels (e.g., "BIBIT PADI", "PUPUK ORGANIK").`,
            `   - ABSOLUTE ZERO DUPLICATE PERCENTAGE OUTSIDE THE RING: NEVER repeat "${dominantChartPct}%" or any percentage number outside next to the donut ring! The percentage appears ONLY ONCE inside the donut center hole.`,
            `   - Ensure every chart slice label is a complete, uncut Indonesian phrase (never ending with a dangling "&").`,
          ].join('\n');

    const relayoutPrompt = [
      `You are a Master Editorial Art Director, Swiss Grid Typographer, and Senior Indonesian Publication Designer.`,
      `Look carefully at the attached infographic/poster draft image. Your task is to RE-GENERATE and REFINE this image into a MUCH CLEANER, PERFECTLY BALANCED, MUSEUM-GRADE 4:5 EDITORIAL INFOGRAPHIC while preserving 100% of its unique information and visual subject.`,
      ``,
      `STRICT MASTER EDITORIAL RE-LAYOUT RULES FOR ALL TEMPLATES (MANDATORY):`,
      `1. FAITHFULLY PRESERVE & ENHANCE THE UNIQUE TEMPLATE ARCHITECTURE & VISUAL STYLE:`,
      `   - Faithfully respect the distinctive visual composition, background art, and structure of the attached draft image (whether it is an S-curve Narrative Red Wave, a Broadsheet Chronicle Grid, a Radial Clock dial, 5 Vertical Pillars, a Retro Sunburst, or a Dark Eco-Punk Zine).`,
      narrativeWaveRules,
      chronicleGridRules,
      `   - Render ONLY 1 neatly-framed authentic documentary photograph or illustration inside its designated focal window from the draft.`,
      `   - NEVER render duplicate stacked photographs in the lower text area! If the draft has empty paper in the lower section, preserve that entire lower area as 100% clean, flat, unobstructed paper for text.`,
      `   - NEVER let the photograph rise into the top headline/deck zone! The MAIN HEADLINE and EXECUTIVE SUMMARY DECK MUST sit on 100% clean, flat paper matching the draft's paper tone.`,
      `   - EVERY SINGLE TEXT BLOCK (Headline, Deck, KPI/Hero Stats, Points 01–0${totalPoints}, Closing Callout, and Footer Bar) MUST sit on 100% clean, legible, high-contrast background paper matching the draft's paper tone — NEVER print text across a photograph!`,
      `2. ZERO VERTICAL CROWDING OR COLLISION BETWEEN EXECUTIVE DECK AND KPI STRIP (CRITICAL):`,
      `   - Always maintain a generous, clean vertical gap (at least 24px to 30px of empty paper) between the last line of the Executive Summary Deck paragraph and the top horizontal rule of the 4 KPI stats (or first content column)!`,
      `   - NEVER let the last words of the Executive Summary Deck touch, crowd, or overlap the top of the first KPI number!`,
      `3. CLEAN UPRIGHT SANS-SERIF TYPOGRAPHY & 100% INDONESIAN SPELLING PRECISION (ZERO TYPOS):`,
      `   - Render the EXECUTIVE SUMMARY DECK, all KPI sub-labels, and all Points 01–0${totalPoints} headings and body paragraphs using a CLEAN, UPRIGHT, MODERN GEOMETRIC SANS-SERIF TYPEFACE (never cursive or swash italic serif!).`,
      `   - Cross-check every single word, number, and sub-label against the MANDATORY VERBATIM CONTENT TRANSCRIPT below and spell every Indonesian word 100% accurately, character for character!`,
      `   - Pay special attention to Indonesian consonant/vowel pairs so there are ZERO letter mutations:`,
      `     * P vs B (always spell "PETA" / "PEMETAAN" / "PRIORITAS" / "PUSKESMAS" / "PROGRAM", NEVER "BETA")`,
      `     * K vs R (always spell "KESEHATAN" / "KECAMATAN" / "KUALITAS", NEVER "RESEHATAN")`,
      `     * D vs O (always spell "DATA" / "DESA" / "DAERAH", NEVER "OATA")`,
      `     * L vs I (always spell "LANSIA" / "LAYANAN", NEVER "ansia")`,
      `     * G vs H & M vs N (always spell "ANGGARAN" never "AHOGARAN", "AFIRMASI" never "AFIBMASI")`,
      `     * I vs L (always spell "EKONOMI" with letter 'i', NEVER "ekonoml"; "KUALITAS", "PARTISIPASI", "AKSESIBILITAS", "FASILITAS")`,
      `     * K vs H (always spell "PEMERIKSAAN", "MASYARAKAT", "KEBIJAKAN").`,
      `4. NO REPEATED NUMBER PREFIXES ("FOKUS 01", "DIMENSI 01") & NO DOUBLE SLASHES ("//"):`,
      `   - NEVER stack duplicate numbering like "FOKUS 01" directly above "01 • ...".`,
      `   - If a category badge appears above a point, render ONLY the thematic label (e.g., "INDIKATOR KUNCI", "PROGRAM INTERVENSI", "WILAYAH PRIORITAS", "TARGET PENURUNAN") without any duplicate number or "FOKUS" prefix!`,
      `   - Number each point cleanly once as "01 • ...", "02 • ...", "03 • ...", "04 • ..." without the word "POIN" or "//"!`,
      chartRule,
      `6. ABSOLUTELY ZERO DUPLICATE DATA, STRICT ${totalPoints}-POINT LIMIT (01 TO 0${totalPoints} ONLY) & ZERO SYSTEM VARIABLE LEAKAGE:`,
      `   - Every numbered point (01 through 0${totalPoints}), every KPI stat, and designated card MUST appear EXACTLY ONCE on the entire canvas.`,
      `   - The poster contains STRICTLY points 01 to 0${totalPoints}. For INFOGRAPHIC_NARRATIVE_WAVE this is EXACTLY 6 points (01 to 06: Points 01 & 02 upper-right; Point 04 lower-left; Points 03, 05, 06 lower-right). NEVER invent, number, or render points beyond 0${totalPoints}!`,
      `   - ABSOLUTELY FORBIDDEN TO PRINT SYSTEM VARIABLES OR PROMPT METADATA AS POINTS! Never print words like "CLOSINGLINE", "VISUALSUBJECT", "PROMPT", or English image briefs on the poster.`,
      `   - NEVER repeat Points 01–03 in the lower section! The lower section must ONLY contain its designated points.`,
      `   - The dark BOTTOM OFFICIAL FOOTER BAR (containing the legislator name on the left and the year "${new Date().getFullYear()}" on the right) is the absolute lowest element on the poster. Leave the narrow paper margin below the dark footer bar 100% EMPTY — NEVER repeat "POLARIS • DAPIL JABAR" below the bottom footer bar!`,
      `   - Do NOT draw red-and-white ribbons, flags, or corner banners at the four corners of the canvas.`,
      `7. COMPLETE VERBATIM CONTENT RETENTION & ARCHETYPE HARMONY:`,
      `   - Include 100% of all unique items from the transcript below in full: 1 top header bar, 1 rubric/kicker, 1 main headline, 1 full executive summary deck, 4 KPI metrics, ${
        isAdvocacyPillars || options.archetype === 'INFOGRAPHIC_RADIAL_CLOCK'
          ? '0 charts (ZERO PIE/DONUT CHART)'
          : options.copy?.chart
          ? '1 Pie/Donut Chart with 4 slices'
          : '0 charts'
      }, ${totalPoints} full multi-sentence analysis points (01 to 0${totalPoints}), 1 full closing callout strip, and 1 bottom official attribution bar.`,
      `   - DO NOT abbreviate, summarize, or cut off any sentence in points 01 through 0${totalPoints} or the Deck! Render the complete, rich, detailed Indonesian explanations from the transcript neatly inside their columns.`,
      `8. RAZOR-SHARP SOLID CONTRAST FOR ALL TEXT ON COLORED BANDS OR RIBBONS (ZERO BACKGROUND SMUDGES):`,
      `   - When text sits on a dark colored surface (such as the crimson narrative wave, dark badge, or accent panel), render the letters in 100% PURE, CRISP, OPAQUE SOLID WHITE (#FFFFFF) with razor-sharp glyph edges.`,
      `   - DO NOT draw fuzzy black drop shadows, dark smudges, or texture halos behind the white letters! The colored ribbon background behind the letters must remain smooth and clean.`,
      transcriptBlock ? `\n${transcriptBlock}` : '',
    ]
      .filter(Boolean)
      .join('\n');

    // =========================================================================
    // 1. GOOGLE GEMINI MULTIMODAL IMAGE RE-LAYOUT PASS (PRIORITAS UTAMA #1)
    // =========================================================================
    if (geminiApiKey) {
      const client = googleGenAiClient || new GoogleGenAI({ apiKey: geminiApiKey });
      const primaryModel =
        process.env.POSTER_COLLAGE_IMAGE_MODEL ||
        process.env.GOOGLE_IMAGE_MODEL ||
        'gemini-3.1-flash-image';

      const modelsToTry = Array.from(
        new Set([
          primaryModel,
          'gemini-3.1-flash-image',
          'gemini-3.1-flash-image-preview',
        ])
      ).filter((m) => !m.startsWith('imagen-'));

      const { mime } = detectImageMimeAndExt(options.imageBuffer);
      const base64Draft = options.imageBuffer.toString('base64');

      for (const modelName of modelsToTry) {
        const telemetry = AiTelemetryService.startTrace({
          operation: 'poster-gemini-relayout-pass',
          model: modelName,
          tenantId: options.tenantId,
          metadata: {
            archetype: options.archetype || 'DEFAULT',
            layoutVariant,
          },
        });
        try {
          console.log(
            `[GeminiRelayoutPass] Mengirim draf + transkrip anti-duplikasi ke ${modelName} untuk penyempurnaan layout...`
          );

          const res = await client.models.generateContent({
            model: modelName,
            contents: [
              {
                role: 'user',
                parts: [
                  {
                    inlineData: {
                      mimeType: mime,
                      data: base64Draft,
                    },
                  },
                  {
                    text: relayoutPrompt,
                  },
                ],
              },
            ],
            config: {
              responseModalities: ['IMAGE'],
              imageConfig: { aspectRatio: '4:5' },
            } as any,
          });

          const usage = AiTelemetryService.extractGeminiUsage(res, relayoutPrompt);
          const parts = res.candidates?.[0]?.content?.parts || [];
          for (const p of parts) {
            if (p.inlineData && p.inlineData.data) {
              const outBuffer = Buffer.from(p.inlineData.data, 'base64');
              if (outBuffer.length > 2048) {
                await telemetry.endTrace({
                  inputTokens: usage.inputTokens,
                  outputTokens: usage.outputTokens,
                  status: 'SUCCESS',
                  actualModel: modelName,
                  imageCalls: 1,
                  outputPreview: { bytes: outBuffer.length, archetype: options.archetype },
                });
                console.log(
                  `[GeminiRelayoutPass] Berhasil menyempurnakan layout bebas duplikasi via ${modelName} (${outBuffer.length} bytes, ${Date.now() - startTime}ms)`
                );
                return {
                  buffer: outBuffer,
                  providerUsed: 'gemini-relayout',
                  denoisingStrengthUsed: denoisingStrength,
                  durationMs: Date.now() - startTime,
                  compiledRelayoutPrompt: relayoutPrompt,
                };
              }
            }
          }
          await telemetry.endTrace({
            inputTokens: usage.inputTokens,
            outputTokens: usage.outputTokens,
            status: 'FAILED',
            actualModel: modelName,
            errorMessage: 'Output gambar Gemini relayout kosong atau di bawah batas ukuran minimum.',
          });
        } catch (gemErr: any) {
          await telemetry.endTrace({
            inputTokens: 0,
            outputTokens: 0,
            status: 'FAILED',
            actualModel: modelName,
            errorMessage: gemErr.message || String(gemErr),
          });
          console.warn(
            `[GeminiRelayoutPass] Model ${modelName} gagal (${gemErr.message}), mencoba model berikutnya...`
          );
        }
      }
    }

    // Fallback jika semua model Gemini Image sedang sibuk/limit
    console.log(
      `[GeminiRelayoutPass] Melewati relayout eksternal, mempertahankan draf Chromium tajam.`
    );
    return {
      buffer: options.imageBuffer,
      providerUsed: 'skipped',
      denoisingStrengthUsed: denoisingStrength,
      durationMs: Date.now() - startTime,
      compiledRelayoutPrompt: relayoutPrompt,
    };
  }
}
