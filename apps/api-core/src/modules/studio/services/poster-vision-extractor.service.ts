import { Injectable, Logger } from '@nestjs/common';
import * as fs from 'fs';
import { openaiClient } from '@polaris/ai-engine';
import type { PosterLayerManifest, PosterLayer } from '@polaris/storage';

export interface ExtractedPosterElement {
  id: string;
  kind: 'frame' | 'text';
  role: string;
  name?: string;
  text?: string;
  box_2d: [number, number, number, number]; // [ymin, xmin, ymax, xmax] 0-1000
  fill?: string;
  textColor?: string;
  fontSize?: number;
  fontWeight?: string;
  textAlign?: 'left' | 'center' | 'right';
  bgFill?: string;
}

export interface ExtractedPosterContent {
  detectedArchetype:
    | 'INFOGRAPHIC_VISIONARY_TIMELINE'
    | 'INFOGRAPHIC_ADVOCACY_PILLARS'
    | 'INFOGRAPHIC_NARRATIVE_WAVE'
    | 'INFOGRAPHIC_CHRONICLE_GRID'
    | 'INFOGRAPHIC_RADIAL_CLOCK'
    | 'GENERIC_INFOGRAPHIC'
    | string;
  elements?: ExtractedPosterElement[];
  topBar?: { left: string; right: string };
  kicker?: string;
  headline: string;
  deck?: string;
  stats?: Array<{ value: string; label: string }>;
  banner?: string;
  cards?: Array<{
    badge: string;
    title: string;
    desc: string;
    tag?: string;
  }>;
  closing?: string;
  footer?: {
    signature: string;
    year: string;
  };
}

@Injectable()
export class PosterVisionExtractorService {
  private readonly logger = new Logger(PosterVisionExtractorService.name);

  /**
   * Mengekstrak 100% teks dan struktur asli dari gambar poster menggunakan Vision AI.
   * Tidak pernah menggunakan data dummy atau template statis.
   */
  async extractContentFromImage(imageUrl: string): Promise<ExtractedPosterContent> {
    this.logger.log(`[VisionExtractor] Menjalankan OCR AI Vision pada gambar: ${imageUrl.slice(0, 80)}...`);

    let targetDataUrl = imageUrl;

    // 1. Cek jika file path lokal atau file:// atau URL lokal /uploads/...
    const cleanLocalPath = imageUrl.replace(/^file:\/\/\/?/, '').replace(/^https?:\/\/[^/]+\//, '').replace(/^\//, '');
    if (cleanLocalPath && fs.existsSync(cleanLocalPath)) {
      try {
        const buf = fs.readFileSync(cleanLocalPath);
        const ext = cleanLocalPath.toLowerCase().split('.').pop();
        const mime = ext === 'png' ? 'image/png' : ext === 'webp' ? 'image/webp' : 'image/jpeg';
        targetDataUrl = `data:${mime};base64,${buf.toString('base64')}`;
        this.logger.log(`[VisionExtractor] Berhasil membaca file lokal langsung: ${cleanLocalPath} (${buf.length} bytes)`);
      } catch (fsErr) {
        this.logger.warn(`[VisionExtractor] Gagal membaca path lokal: ${fsErr}`);
      }
    } else if (imageUrl.startsWith('file://') || /^[a-zA-Z]:\\/.test(imageUrl) || imageUrl.startsWith('/')) {
      try {
        const cleanPath = imageUrl.replace(/^file:\/\/\/?/, '');
        if (fs.existsSync(cleanPath)) {
          const buf = fs.readFileSync(cleanPath);
          const ext = cleanPath.toLowerCase().split('.').pop();
          const mime = ext === 'png' ? 'image/png' : ext === 'webp' ? 'image/webp' : 'image/jpeg';
          targetDataUrl = `data:${mime};base64,${buf.toString('base64')}`;
          this.logger.log(`[VisionExtractor] Berhasil membaca file lokal: ${cleanPath} (${buf.length} bytes)`);
        }
      } catch (fsErr) {
        this.logger.warn(`[VisionExtractor] Gagal membaca path lokal: ${fsErr}`);
      }
    }

    // 2. Jika URL HTTP/HTTPS remote, download dan convert ke data URL
    if (!targetDataUrl.startsWith('data:') && (imageUrl.startsWith('http://') || imageUrl.startsWith('https://'))) {
      try {
        const fetchRes = await fetch(imageUrl);
        if (fetchRes.ok) {
          const ab = await fetchRes.arrayBuffer();
          const b64 = Buffer.from(ab).toString('base64');
          const mime = fetchRes.headers.get('content-type') || 'image/jpeg';
          targetDataUrl = `data:${mime};base64,${b64}`;
        }
      } catch (err) {
        this.logger.warn(`[VisionExtractor] Gagal mendownload gambar via fetch: ${err}`);
      }
    }

    const prompt = `Anda adalah Document Layout OCR & Visual Extractor AI tingkat mahir untuk poster/infografis editorial Polaris.
Tugas Anda adalah membaca gambar poster ini dan mendeteksi SEMUA elemen visual (kotak kartu/container frame dan teks) yang ADA SECARA NYATA pada gambar poster, beserta koordinat bounding box aslinya [ymin, xmin, ymax, xmax] (skala 0 sampai 1000).

PERINGATAN KERAS & ATURAN MUTLAK:
1. 100% DINAMIS & VERBATIM: Deteksi HANYA apa yang ada di gambar poster! JANGAN MEMBUAT ELEMEN FIKTIF!
   - JANGAN PERNAH menambahkan teks dummy seperti "PETA JALAN TARGET & REALISASI CAPAIAN" atau "+ TAHAP 01" jika tidak tertulis di gambar!
   - JANGAN PERNAH menambahkan garis timeline jika di gambar aslinya tidak ada!
2. PERHATIKAN KOLOM & POSISI HORISONTAL (xmin, xmax) SECARA PRESISI:
   - Jika kotak judul berada di sebelah KIRI (misal separuh lebar poster), catat xmin ~ 45 dan xmax ~ 460. JANGAN PERNAH merentangkan kotak ke lebar penuh (xmax: 950) jika di gambar hanya separuh atau di kanannya ada elemen lain!
   - Jika di sebelah KANAN atas ada kartu metrik / kpi / cards, catat posisi xmin dan xmax aslinya di sisi kanan (misal xmin ~ 480 s.d. xmax ~ 950).
   - Jika ada kartu-kartu berjejer ke samping (horizontal) di bagian bawah atau tengah, catat setiap kartu secara terpisah dengan xmin dan xmax masing-masing kartu!
   - Jika poster memiliki kartu bergelombang / zigzag bersilang (DIMENSI 01..04), catat posisi koordinat kotak dan teksnya di lokasi aslinya masing-masing!
3. DETEKSI SETIAP ELEMEN VISUAL KE DALAM ARRAY "elements":
   Untuk setiap elemen (kotak kartu atau teks), berikan objek:
   - id: string unik ("el_1", "el_2", ...)
   - kind: "frame" (untuk kotak container / kartu) atau "text" (untuk teks)
   - role: peran elemen (misal: "topbar", "kicker", "headline", "deck", "kpi-card", "kpi-val", "kpi-lbl", "card-box", "card-badge", "card-title", "card-desc", "banner", "synthesis-box", "synthesis-text", "footer-box", "signature", "year")
   - text: teks persis kata per kata (hanya jika kind === "text")
   - box_2d: [ymin, xmin, ymax, xmax] koordinat bounding box dalam skala normalisasi 0 sampai 1000
   - fill: warna latar jika ada container frame (misal "#FFFFFF", "#3B4A3C", atau null)
   - textColor: warna teks hex (misal "#0F172A", "#FFFFFF", "#EA580C", "#334155")
   - fontSize: estimasi ukuran font pt
   - fontWeight: "bold" atau "normal"
   - bgFill: warna latar badge teks jika teks memiliki latar tombol/pill sendiri (misal "#EA580C")
4. JUGA EKSTRAK STRUKTUR RINGKASAN:
   - detectedArchetype: "INFOGRAPHIC_NARRATIVE_WAVE" | "INFOGRAPHIC_VISIONARY_TIMELINE" | "INFOGRAPHIC_ADVOCACY_PILLARS" | "INFOGRAPHIC_CHRONICLE_GRID" | "INFOGRAPHIC_RADIAL_CLOCK" | "INFOGRAPHIC_CUSTOM_DYNAMIC"
   - topBar: { left, right }
   - kicker, headline, deck
   - stats: [ { value, label } ]
   - banner: judul banner tengah JIKA ADA di poster (kosongkan jika tidak ada)
   - cards: [ { badge, title, desc, tag } ]
   - closing, footer: { signature, year }

Format JSON yang wajib dihasilkan (hanya JSON murni):
{
  "detectedArchetype": "...",
  "elements": [
    {
      "id": "e_1",
      "kind": "frame",
      "role": "card-box",
      "box_2d": [ymin, xmin, ymax, xmax],
      "fill": "#FFFFFF"
    },
    {
      "id": "e_2",
      "kind": "text",
      "role": "headline",
      "text": "...",
      "box_2d": [ymin, xmin, ymax, xmax],
      "textColor": "#0F172A",
      "fontSize": 48,
      "fontWeight": "bold"
    }
  ],
  "topBar": { "left": "...", "right": "..." },
  "kicker": "...",
  "headline": "...",
  "deck": "...",
  "stats": [ { "value": "...", "label": "..." } ],
  "cards": [ { "badge": "...", "title": "...", "desc": "...", "tag": "..." } ],
  "footer": { "signature": "...", "year": "..." }
}`;

    let rawJson = '{}';
    try {
      const completion = await openaiClient.chat.completions.create({
        model: 'gpt-4o',
        response_format: { type: 'json_object' },
        messages: [
          {
            role: 'user',
            content: [
              { type: 'text', text: prompt },
              { type: 'image_url', image_url: { url: targetDataUrl } },
            ],
          },
        ],
        temperature: 0.1,
      });
      rawJson = completion.choices[0]?.message?.content || '{}';
    } catch (gpt4Err) {
      this.logger.warn(`[VisionExtractor] GPT-4o gagal, fallback ke GPT-4o-mini: ${gpt4Err}`);
      const completion = await openaiClient.chat.completions.create({
        model: 'gpt-4o-mini',
        response_format: { type: 'json_object' },
        messages: [
          {
            role: 'user',
            content: [
              { type: 'text', text: prompt },
              { type: 'image_url', image_url: { url: targetDataUrl } },
            ],
          },
        ],
        temperature: 0.1,
      });
      rawJson = completion.choices[0]?.message?.content || '{}';
    }

    const parsed: ExtractedPosterContent = JSON.parse(rawJson);
    this.logger.log(
      `[VisionExtractor] Sukses mengekstrak poster: "${parsed.headline}", archetype=${parsed.detectedArchetype}, elements=${parsed.elements?.length || 0}, stats=${parsed.stats?.length || 0}, cards=${parsed.cards?.length || 0}`
    );
    return parsed;
  }

  /**
   * Mengubah konten hasil ekstraksi Vision AI menjadi PosterLayerManifest dengan koordinat piksel nyata.
   * Prioritas 1: Menggunakan koordinat 2D nyata (box_2d) langsung dari Vision AI untuk akurasi dinamis 100%.
   */
  convertContentToManifest(
    content: ExtractedPosterContent,
    width = 1080,
    height = 1350,
    fallbackArchetype?: string
  ): PosterLayerManifest {
    // 1. PRIORITAS UTAMA: Jika Vision AI menghasilkan array elemen dinamis dengan koordinat 2D nyata (box_2d),
    // bangun layer manifest secara 100% DINAMIS langsung dari posisi visual sebenarnya!
    // Ini memastikan komponen mengikuti gambar secara akurat tanpa template statis.
    if (content.elements && content.elements.length >= 3) {
      this.logger.log(
        `[VisionExtractor] Membangun manifest 100% DINAMIS dari ${content.elements.length} elemen visual nyata gambar.`
      );
      return this.buildDynamicManifestFromElements(content.elements, width, height, content);
    }

    const cards = content.cards || [];
    let archetype = content.detectedArchetype || fallbackArchetype || 'INFOGRAPHIC_VISIONARY_TIMELINE';

    // Heuristik cerdas bila model OCR salah mendeteksi atau generic
    const allText = `${content.kicker || ''} ${content.headline || ''} ${content.deck || ''} ${content.banner || ''} ${cards.map((c) => `${c.badge} ${c.title} ${c.tag}`).join(' ')}`.toLowerCase();

    if (
      cards.some((c) => /DIMENSI/i.test(c.badge || '')) ||
      allText.includes('dimensi') ||
      allText.includes('karhutla') ||
      allText.includes('s-curve') ||
      allText.includes('gelombang')
    ) {
      archetype = 'INFOGRAPHIC_NARRATIVE_WAVE';
    } else if (
      cards.some((c) => /FASE/i.test(c.badge || '')) ||
      allText.includes('peta jalan') ||
      cards.some((c) => /TAHAP/i.test(c.tag || ''))
    ) {
      archetype = 'INFOGRAPHIC_VISIONARY_TIMELINE';
    } else if (
      cards.some((c) => /◆|◈/i.test(c.badge || '')) ||
      allText.includes('pilar') ||
      cards.some((c) => /INDIKATOR/i.test(c.tag || ''))
    ) {
      archetype = 'INFOGRAPHIC_ADVOCACY_PILLARS';
    } else if (
      cards.some((c) => /TONGGAK/i.test(c.badge || '')) ||
      allText.includes('tonggak') ||
      allText.includes('radial')
    ) {
      archetype = 'INFOGRAPHIC_RADIAL_CLOCK';
    } else if (
      allText.includes('soedirman') ||
      allText.includes('biografi') ||
      allText.includes('kronik') ||
      allText.includes('rekam jejak')
    ) {
      archetype = 'INFOGRAPHIC_CHRONICLE_GRID';
    }

    if (archetype === 'INFOGRAPHIC_NARRATIVE_WAVE') {
      return this.buildNarrativeWaveManifest(content, width, height);
    }
    if (archetype === 'INFOGRAPHIC_ADVOCACY_PILLARS') {
      return this.buildAdvocacyPillarsManifest(content, width, height);
    }
    if (archetype === 'INFOGRAPHIC_CHRONICLE_GRID') {
      return this.buildChronicleGridManifest(content, width, height);
    }
    if (archetype === 'INFOGRAPHIC_RADIAL_CLOCK') {
      return this.buildRadialClockManifest(content, width, height);
    }

    // Default: INFOGRAPHIC_VISIONARY_TIMELINE
    return this.buildVisionaryTimelineManifest(content, width, height);
  }

  /**
   * Archetype: DINAMIS 100% (Dynamic 2D Bounding Box Extraction)
   * Mengubah elemen-elemen visual asli poster hasil deteksi Vision AI menjadi PosterLayerManifest
   * dengan koordinat piksel nyata 1:1 mengikuti gambar aslinya.
   * Tidak ada template statis, tidak ada koordinat hardcode, tidak ada teks fiktif.
   */
  private buildDynamicManifestFromElements(
    elements: ExtractedPosterElement[],
    width: number,
    height: number,
    content: ExtractedPosterContent
  ): PosterLayerManifest {
    const layers: PosterLayer[] = [];
    let seq = 0;

    const frameElements = elements.filter((e) => e.kind === 'frame');
    const textElements = elements.filter((e) => e.kind === 'text');

    const toPixels = (box_2d: [number, number, number, number]) => {
      const ymin = Math.max(0, Math.min(1000, box_2d[0]));
      const xmin = Math.max(0, Math.min(1000, box_2d[1]));
      const ymax = Math.max(0, Math.min(1000, box_2d[2]));
      const xmax = Math.max(0, Math.min(1000, box_2d[3]));

      const x = Math.round((xmin / 1000) * width);
      const y = Math.round((ymin / 1000) * height);
      const w = Math.max(16, Math.round(((xmax - xmin) / 1000) * width));
      const h = Math.max(14, Math.round(((ymax - ymin) / 1000) * height));
      return { x, y, w, h };
    };

    // 1. Render Frame Layers (Latar Kartu, Kotak Metrik, Header Container)
    for (const el of frameElements) {
      if (!el.box_2d || el.box_2d.length < 4) continue;
      const { x, y, w, h } = toPixels(el.box_2d);
      if (w < 10 || h < 10) continue;

      layers.push({
        kind: 'frame',
        id: el.id || `f_${seq++}`,
        role: el.role || 'card-box',
        x,
        y,
        w,
        h,
        fill: el.fill || '#FFFFFF',
        radius: 4,
        borders: {
          top: { w: 1, color: '#E2E8F0' },
          right: { w: 1, color: '#E2E8F0' },
          bottom: { w: 1, color: '#E2E8F0' },
          left: { w: 1, color: '#E2E8F0' },
        },
        shadow: { color: 'rgba(0,0,0,0.06)', offsetX: 0, offsetY: 2, blur: 8 },
      });
    }

    // Jika Vision AI tidak mengekstrak kotak frame secara eksplisit, sintesiskan kotak frame solid #FFFFFF
    // di belakang teks kartu dan judul agar teks tidak pernah mengambang di atas foto!
    if (frameElements.length === 0 && textElements.length > 0) {
      // a. Sintesis kotak header jika ada kicker/headline/deck
      const headerTexts = textElements.filter((e) =>
        e.role.includes('headline') || e.role.includes('kicker') || e.role.includes('deck')
      );
      if (headerTexts.length > 0) {
        const boxes = headerTexts.map((e) => toPixels(e.box_2d));
        const minX = Math.max(20, Math.min(...boxes.map((b) => b.x)) - 20);
        const minY = Math.max(20, Math.min(...boxes.map((b) => b.y)) - 16);
        const maxX = Math.min(width - 20, Math.max(...boxes.map((b) => b.x + b.w)) + 20);
        const maxY = Math.min(height - 20, Math.max(...boxes.map((b) => b.y + b.h)) + 16);
        layers.push({
          kind: 'frame',
          id: `f_auto_header_${seq++}`,
          role: 'header-box',
          x: minX,
          y: minY,
          w: maxX - minX,
          h: maxY - minY,
          fill: '#FFFFFF',
          radius: 4,
          borders: { top: { w: 3.5, color: '#D7261E' }, right: null, bottom: { w: 1.5, color: '#E2E8F0' }, left: null },
          shadow: { color: 'rgba(0,0,0,0.06)', offsetX: 0, offsetY: 4, blur: 18 },
        });
      }

      // b. Sintesis kotak kartu untuk setiap card-box atau card cluster
      const cardTexts = textElements.filter((e) =>
        e.role.includes('card') || e.role.includes('desc') || e.role.includes('body')
      );
      // Kelompokkan berdasarkan posisi vertikal berdekatan (selisih < 120px)
      const sortedCards = [...cardTexts].sort((a, b) => a.box_2d[0] - b.box_2d[0]);
      const cardClusters: ExtractedPosterElement[][] = [];
      let currentCluster: ExtractedPosterElement[] = [];
      for (const el of sortedCards) {
        if (currentCluster.length === 0) {
          currentCluster.push(el);
        } else {
          const prevY = currentCluster[currentCluster.length - 1].box_2d[2];
          if (el.box_2d[0] - prevY < 120) {
            currentCluster.push(el);
          } else {
            cardClusters.push(currentCluster);
            currentCluster = [el];
          }
        }
      }
      if (currentCluster.length > 0) cardClusters.push(currentCluster);

      for (const cluster of cardClusters) {
        const boxes = cluster.map((e) => toPixels(e.box_2d));
        const minX = Math.max(20, Math.min(...boxes.map((b) => b.x)) - 16);
        const minY = Math.max(20, Math.min(...boxes.map((b) => b.y)) - 14);
        const maxX = Math.min(width - 20, Math.max(...boxes.map((b) => b.x + b.w)) + 16);
        const maxY = Math.min(height - 20, Math.max(...boxes.map((b) => b.y + b.h)) + 14);
        layers.push({
          kind: 'frame',
          id: `f_auto_card_${seq++}`,
          role: 'card-box',
          x: minX,
          y: minY,
          w: maxX - minX,
          h: maxY - minY,
          fill: '#FFFFFF',
          radius: 4,
          borders: { top: { w: 1, color: '#E2E8F0' }, right: { w: 1, color: '#E2E8F0' }, bottom: { w: 1, color: '#E2E8F0' }, left: { w: 1, color: '#E2E8F0' } },
          shadow: { color: 'rgba(0,0,0,0.06)', offsetX: 0, offsetY: 2, blur: 12 },
        });
      }
    }

    // 2. Render Text Layers (Judul, Subjudul, Kartu, KPI, Footer)
    for (const el of textElements) {
      if (!el.box_2d || el.box_2d.length < 4 || !el.text?.trim()) continue;
      const { x, y, w, h } = toPixels(el.box_2d);
      if (w < 10 || h < 8) continue;

      const isHeadline = el.role.includes('headline') || el.role.includes('title');
      const isKpiVal = el.role.includes('kpi-val') || el.role.includes('stat-val');
      const isDeck = el.role.includes('deck');
      const isBadge = el.role.includes('badge') || Boolean(el.bgFill);

      let fontFamily = "'Plus Jakarta Sans', sans-serif";
      if (isHeadline) {
        fontFamily = "'Bebas Neue', sans-serif";
      } else if (isDeck) {
        fontFamily = "'Playfair Display', serif";
      }

      const calculatedFontSize =
        el.fontSize && el.fontSize > 6
          ? el.fontSize
          : isHeadline
            ? 44
            : isKpiVal
              ? 28
              : isDeck
                ? 14
                : 12.5;

      layers.push({
        kind: 'text',
        id: el.id || `t_${seq++}`,
        role: el.role || 'text',
        text: el.text,
        x,
        y,
        w,
        h,
        fontFamily,
        fontSize: calculatedFontSize,
        fontWeight: el.fontWeight || (isHeadline || isKpiVal || isBadge ? 'bold' : 'normal'),
        fontStyle: isDeck ? 'italic' : 'normal',
        color: el.textColor || '#0F172A',
        textAlign: el.textAlign || (isKpiVal ? 'center' : 'left'),
        lineHeightPx: Math.round(calculatedFontSize * 1.2),
        letterSpacingPx: isHeadline ? 1.5 : 0.5,
        box: el.bgFill
          ? {
              fill: el.bgFill,
              radius: 3,
              borders: { top: null, right: null, bottom: null, left: null },
              shadow: null,
              padding: { t: 4, r: 10, b: 4, l: 10 },
            }
          : null,
      });
    }

    return { version: 1, width, height, layers };
  }

  /**
   * Archetype: INFOGRAPHIC_NARRATIVE_WAVE
   * Alur bergelombang S-Curve dengan 4 kartu staggered (kanan atas, kiri tengah, kanan tengah, kiri bawah).
   */
  private buildNarrativeWaveManifest(content: ExtractedPosterContent, width: number, height: number): PosterLayerManifest {
    const layers: PosterLayer[] = [];
    let seq = 0;
    const accentColor = '#D7261E';

    // 1. Top Bar Tag
    this.addTopBarLayers(layers, content, accentColor, () => seq++);

    // 2. Header Masthead Card (Kicker + Headline + Deck + Row 4 KPI di dalamnya)
    const headerW = 972;
    const hasDeck = Boolean(content.deck);
    const kpiY = hasDeck ? 190 : 166;
    const headerH = kpiY + 54 - 76;

    layers.push({
      kind: 'frame',
      id: `f_${seq++}`,
      role: 'wave-header-block',
      x: 54,
      y: 76,
      w: headerW,
      h: headerH,
      fill: '#FFFFFF',
      radius: 4,
      borders: {
        top: { w: 3.5, color: accentColor },
        right: null,
        bottom: { w: 1.5, color: '#E2E8F0' },
        left: null,
      },
      shadow: { color: 'rgba(0,0,0,0.06)', offsetX: 0, offsetY: 4, blur: 18 },
    });

    // Kicker
    if (content.kicker) {
      layers.push({
        kind: 'text',
        id: `t_${seq++}`,
        role: 'wave-kicker',
        text: content.kicker,
        x: 76,
        y: 92,
        w: headerW - 44,
        h: 17,
        fontFamily: "'Plus Jakarta Sans', sans-serif",
        fontSize: 13.5,
        fontWeight: '900',
        fontStyle: 'normal',
        color: accentColor,
        textAlign: 'left',
        lineHeightPx: 17,
        letterSpacingPx: 2.5,
        box: null,
      });
    }

    // Headline
    if (content.headline) {
      layers.push({
        kind: 'text',
        id: `t_${seq++}`,
        role: 'wave-headline',
        text: content.headline,
        x: 76,
        y: 112,
        w: headerW - 44,
        h: 50,
        fontFamily: "'Bebas Neue', sans-serif",
        fontSize: 50,
        fontWeight: '400',
        fontStyle: 'normal',
        color: '#0F172A',
        textAlign: 'left',
        lineHeightPx: 50,
        letterSpacingPx: 1.5,
        box: null,
      });
    }

    // Deck
    if (content.deck) {
      layers.push({
        kind: 'text',
        id: `t_${seq++}`,
        role: 'wave-deck',
        text: content.deck,
        x: 76,
        y: 164,
        w: headerW - 44,
        h: 22,
        fontFamily: "'Playfair Display', serif",
        fontSize: 15,
        fontWeight: '600',
        fontStyle: 'italic',
        color: '#334155',
        textAlign: 'left',
        lineHeightPx: 22,
        letterSpacingPx: 0,
        box: null,
      });
    }

    // Baris 4 Kotak KPI di dalam Header Block
    const statsList = content.stats || [];
    if (statsList.length > 0) {
      const statCount = Math.max(1, Math.min(4, statsList.length));
      const statW = Math.round(928 / statCount);

      // Garis horizontal pembatas KPI
      layers.push({
        kind: 'frame',
        id: `f_${seq++}`,
        role: 'wave-kpi-divider-top',
        x: 76,
        y: kpiY,
        w: 928,
        h: 1.5,
        fill: '#E2E8F0',
        radius: 0,
        borders: { top: null, right: null, bottom: null, left: null },
        shadow: null,
      });
      layers.push({
        kind: 'frame',
        id: `f_${seq++}`,
        role: 'wave-kpi-divider-bottom',
        x: 76,
        y: kpiY + 50,
        w: 928,
        h: 1.5,
        fill: '#E2E8F0',
        radius: 0,
        borders: { top: null, right: null, bottom: null, left: null },
        shadow: null,
      });

      statsList.slice(0, statCount).forEach((st, idx) => {
        const statX = 76 + idx * statW;

        if (idx < statCount - 1) {
          layers.push({
            kind: 'frame',
            id: `f_${seq++}`,
            role: 'wave-kpi-divider-v',
            x: statX + statW - 1,
            y: kpiY + 6,
            w: 1,
            h: 38,
            fill: '#E2E8F0',
            radius: 0,
            borders: { top: null, right: null, bottom: null, left: null },
            shadow: null,
          });
        }

        layers.push({
          kind: 'text',
          id: `t_${seq++}`,
          role: 'wave-kpi-val',
          text: st.value,
          x: statX,
          y: kpiY + 6,
          w: statW,
          h: 26,
          fontFamily: "'Bebas Neue', sans-serif",
          fontSize: 26,
          fontWeight: '400',
          fontStyle: 'normal',
          color: accentColor,
          textAlign: 'center',
          lineHeightPx: 26,
          letterSpacingPx: 1,
          box: null,
        });

        layers.push({
          kind: 'text',
          id: `t_${seq++}`,
          role: 'wave-kpi-lbl',
          text: st.label,
          x: statX,
          y: kpiY + 32,
          w: statW,
          h: 14,
          fontFamily: "'Plus Jakarta Sans', sans-serif",
          fontSize: 10.5,
          fontWeight: '800',
          fontStyle: 'normal',
          color: '#475569',
          textAlign: 'center',
          lineHeightPx: 14,
          letterSpacingPx: 0.5,
          box: null,
        });
      });
    }

    // 3. 4 Kartu Bersilang Zigzag Bergelombang (DIMENSI 01..04)
    const cards = content.cards || [];
    const cardPositions = [
      { x: 586, y: 270, isRight: true, roleSuffix: 'wave-pos-0' },
      { x: 54,  y: 490, isRight: false, roleSuffix: 'wave-pos-1' },
      { x: 586, y: 710, isRight: true, roleSuffix: 'wave-pos-2' },
      { x: 54,  y: 930, isRight: false, roleSuffix: 'wave-pos-3' },
    ];

    cards.slice(0, 4).forEach((card, idx) => {
      const pos = cardPositions[idx];
      const cardW = 440;
      const cardH = 180;

      // Frame Kartu
      layers.push({
        kind: 'frame',
        id: `f_${seq++}`,
        role: `wave-stagger-card ${pos.roleSuffix}`,
        x: pos.x,
        y: pos.y,
        w: cardW,
        h: cardH,
        fill: '#FFFFFF',
        radius: 4,
        borders: {
          top: { w: 1.5, color: '#E2E8F0' },
          right: pos.isRight ? { w: 1.5, color: '#E2E8F0' } : { w: 6, color: accentColor },
          bottom: { w: 1.5, color: '#E2E8F0' },
          left: pos.isRight ? { w: 6, color: accentColor } : { w: 1.5, color: '#E2E8F0' },
        },
        shadow: { color: 'rgba(0,0,0,0.08)', offsetX: 0, offsetY: 4, blur: 18 },
      });

      // Badge DIMENSI
      const badgeText = card.badge || `DIMENSI 0${idx + 1}`;
      const badgeW = Math.min(180, Math.max(90, badgeText.length * 8 + 24));
      layers.push({
        kind: 'text',
        id: `t_${seq++}`,
        role: 'wave-card-badge',
        text: badgeText,
        x: pos.x + 18,
        y: pos.y + 14,
        w: badgeW,
        h: 22,
        fontFamily: "'Plus Jakarta Sans', sans-serif",
        fontSize: 11,
        fontWeight: '900',
        fontStyle: 'normal',
        color: '#FFFFFF',
        textAlign: 'center',
        lineHeightPx: 16,
        letterSpacingPx: 1.2,
        box: {
          fill: accentColor,
          radius: 3,
          borders: { top: null, right: null, bottom: null, left: null },
          shadow: null,
          padding: { t: 3, r: 10, b: 3, l: 10 },
        },
      });

      // Judul Kartu
      layers.push({
        kind: 'text',
        id: `t_${seq++}`,
        role: 'wave-card-title',
        text: card.title,
        x: pos.x + 18,
        y: pos.y + 44,
        w: cardW - 36,
        h: 36,
        fontFamily: "'Plus Jakarta Sans', sans-serif",
        fontSize: 17,
        fontWeight: '800',
        fontStyle: 'normal',
        color: '#0F172A',
        textAlign: 'left',
        lineHeightPx: 20,
        letterSpacingPx: 0.5,
        box: null,
      });

      // Divider di bawah judul
      layers.push({
        kind: 'frame',
        id: `f_${seq++}`,
        role: 'wave-card-title-divider',
        x: pos.x + 18,
        y: pos.y + 82,
        w: cardW - 36,
        h: 1,
        fill: '#E2E8F0',
        radius: 0,
        borders: { top: null, right: null, bottom: null, left: null },
        shadow: null,
      });

      // Deskripsi Kartu
      layers.push({
        kind: 'text',
        id: `t_${seq++}`,
        role: 'wave-card-desc',
        text: card.desc,
        x: pos.x + 18,
        y: pos.y + 88,
        w: cardW - 36,
        h: 78,
        fontFamily: "'Plus Jakarta Sans', sans-serif",
        fontSize: 13.5,
        fontWeight: '600',
        fontStyle: 'normal',
        color: '#334155',
        textAlign: 'left',
        lineHeightPx: 19,
        letterSpacingPx: 0,
        box: null,
      });
    });

    // 4. Closing Banner
    this.addClosingBannerLayers(layers, content, accentColor, headerW, () => seq++);

    // 5. Footer Zone
    this.addFooterLayers(layers, content, accentColor, headerW, () => seq++);

    return { version: 1, width, height, layers };
  }

  /**
   * Archetype: INFOGRAPHIC_ADVOCACY_PILLARS
   * Header atas + 4 kotak metrik statistik + area foto tengah terbuka + 5 pilar kartu tegak berdampingan.
   */
  private buildAdvocacyPillarsManifest(content: ExtractedPosterContent, width: number, height: number): PosterLayerManifest {
    const layers: PosterLayer[] = [];
    let seq = 0;
    const accentColor = '#D7261E';
    const headerW = 972;

    this.addTopBarLayers(layers, content, accentColor, () => seq++);
    this.addMastheadHeaderLayers(layers, content, accentColor, headerW, 'apillars', () => seq++);
    this.addStatRowLayers(layers, content, accentColor, headerW, 'apillars-stat', () => seq++);

    // Banner Section Tag (Tengah) - Hanya jika benar-benar ada di konten gambar poster
    if (content.banner && content.banner.trim().length > 0) {
      const bannerText = content.banner.trim();
      const bannerW = Math.min(520, Math.max(300, bannerText.length * 9.5 + 36));
      layers.push({
        kind: 'text',
        id: `t_${seq++}`,
        role: 'apillars-section-tag',
        text: bannerText,
        x: 54,
        y: 626,
        w: bannerW,
        h: 26,
        fontFamily: "'Plus Jakarta Sans', sans-serif",
        fontSize: 12,
        fontWeight: '800',
        fontStyle: 'normal',
        color: '#FFFFFF',
        textAlign: 'center',
        lineHeightPx: 16,
        letterSpacingPx: 1.5,
        box: {
          fill: accentColor,
          radius: 4,
          borders: { top: null, right: null, bottom: null, left: null },
          shadow: { color: 'rgba(0,0,0,0.1)', offsetX: 0, offsetY: 2, blur: 8 },
          padding: { t: 5, r: 16, b: 5, l: 16 },
        },
      });
    }

    // 5 Pilar Kartu Berjejer Kolom
    const cards = content.cards || [];
    if (cards.length > 0) {
      const cardCount = Math.min(5, Math.max(1, cards.length));
      const colContainerW = headerW;
      const colContainerH = 504;
      const colContainerY = 662;

      layers.push({
        kind: 'frame',
        id: `f_${seq++}`,
        role: 'apillars-cols-container',
        x: 54,
        y: colContainerY,
        w: colContainerW,
        h: colContainerH,
        fill: '#FFFFFF',
        radius: 4,
        borders: {
          top: { w: 1.5, color: `${accentColor}33` },
          right: { w: 1.5, color: `${accentColor}33` },
          bottom: { w: 4, color: accentColor },
          left: { w: 1.5, color: `${accentColor}33` },
        },
        shadow: { color: 'rgba(0,0,0,0.06)', offsetX: 0, offsetY: 4, blur: 18 },
      });

      const colW = Math.round((colContainerW - 20) / cardCount);

      cards.slice(0, cardCount).forEach((card, idx) => {
        const colX = 64 + idx * colW;

        if (idx < cardCount - 1) {
          layers.push({
            kind: 'frame',
            id: `f_${seq++}`,
            role: 'apillar-divider',
            x: colX + colW - 1,
            y: colContainerY + 16,
            w: 1,
            h: colContainerH - 32,
            fill: `${accentColor}26`,
            radius: 0,
            borders: { top: null, right: null, bottom: null, left: null },
            shadow: null,
          });
        }

        // Badge pill solid merah: ◆ 01
        const badgeText = card.badge || `◆ 0${idx + 1}`;
        layers.push({
          kind: 'text',
          id: `t_${seq++}`,
          role: 'apillar-badge',
          text: badgeText,
          x: colX + 12,
          y: colContainerY + 20,
          w: colW - 24,
          h: 22,
          fontFamily: "'Plus Jakarta Sans', sans-serif",
          fontSize: 11.5,
          fontWeight: '900',
          fontStyle: 'normal',
          color: '#FFFFFF',
          textAlign: 'center',
          lineHeightPx: 16,
          letterSpacingPx: 1.2,
          box: {
            fill: accentColor,
            radius: 3,
            borders: { top: null, right: null, bottom: null, left: null },
            shadow: null,
            padding: { t: 3, r: 10, b: 3, l: 10 },
          },
        });

        let innerY = colContainerY + 52;
        if (card.title) {
          layers.push({
            kind: 'text',
            id: `t_${seq++}`,
            role: 'apillar-name',
            text: card.title,
            x: colX + 12,
            y: innerY,
            w: colW - 24,
            h: 46,
            fontFamily: "'Plus Jakarta Sans', sans-serif",
            fontSize: 14.5,
            fontWeight: '800',
            fontStyle: 'normal',
            color: '#0F172A',
            textAlign: 'center',
            lineHeightPx: 18,
            letterSpacingPx: 0.5,
            box: null,
          });
          innerY += 56;
        }

        if (card.desc) {
          layers.push({
            kind: 'text',
            id: `t_${seq++}`,
            role: 'apillar-desc',
            text: card.desc,
            x: colX + 12,
            y: innerY,
            w: colW - 24,
            h: Math.max(80, colContainerY + colContainerH - 52 - innerY),
            fontFamily: "'Plus Jakarta Sans', sans-serif",
            fontSize: 12.5,
            fontWeight: '600',
            fontStyle: 'normal',
            color: '#1E293B',
            textAlign: 'left',
            lineHeightPx: 18,
            letterSpacingPx: 0,
            box: null,
          });
        }

        const tagText = card.tag || `✦ INDIKATOR 0${idx + 1}`;
        layers.push({
          kind: 'text',
          id: `t_${seq++}`,
          role: 'apillar-metric-tag',
          text: tagText,
          x: colX + 14,
          y: colContainerY + colContainerH - 42,
          w: colW - 28,
          h: 18,
          fontFamily: "'Plus Jakarta Sans', sans-serif",
          fontSize: 10.5,
          fontWeight: '800',
          fontStyle: 'normal',
          color: accentColor,
          textAlign: 'center',
          lineHeightPx: 16,
          letterSpacingPx: 1,
          box: {
            fill: `${accentColor}18`,
            radius: 4,
            borders: {
              top: { w: 1, color: `${accentColor}33` },
              right: { w: 1, color: `${accentColor}33` },
              bottom: { w: 1, color: `${accentColor}33` },
              left: { w: 1, color: `${accentColor}33` },
            },
            shadow: null,
            padding: { t: 4, r: 8, b: 4, l: 8 },
          },
        });
      });
    }

    this.addClosingBannerLayers(layers, content, accentColor, headerW, () => seq++);
    this.addFooterLayers(layers, content, accentColor, headerW, () => seq++);

    return { version: 1, width, height, layers };
  }

  /**
   * Archetype: INFOGRAPHIC_VISIONARY_TIMELINE
   * Header atas + 4 kotak statistik + area foto tengah terbuka + deretan kartu FASE dengan timeline connector dots.
   */
  private buildVisionaryTimelineManifest(content: ExtractedPosterContent, width: number, height: number): PosterLayerManifest {
    const layers: PosterLayer[] = [];
    let seq = 0;
    const accentColor = '#7A1E2C';
    const headerW = 972;

    this.addTopBarLayers(layers, content, accentColor, () => seq++);
    this.addMastheadHeaderLayers(layers, content, accentColor, headerW, 'vtimeline', () => seq++);
    this.addStatRowLayers(layers, content, accentColor, headerW, 'vtimeline-stat', () => seq++);

    // Banner Bar Tag (Tengah) - Hanya jika benar-benar ada di konten gambar poster
    if (content.banner && content.banner.trim().length > 0) {
      const bannerText = content.banner.trim();
      const bannerW = Math.min(520, Math.max(300, bannerText.length * 10 + 36));
      layers.push({
        kind: 'text',
        id: `t_${seq++}`,
        role: 'vtimeline-bar-tag',
        text: bannerText,
        x: 54,
        y: 626,
        w: bannerW,
        h: 26,
        fontFamily: "'Plus Jakarta Sans', sans-serif",
        fontSize: 12,
        fontWeight: '800',
        fontStyle: 'normal',
        color: '#FFFFFF',
        textAlign: 'center',
        lineHeightPx: 16,
        letterSpacingPx: 1.5,
        box: {
          fill: accentColor,
          radius: 4,
          borders: { top: null, right: null, bottom: null, left: null },
          shadow: { color: 'rgba(0,0,0,0.1)', offsetX: 0, offsetY: 2, blur: 8 },
          padding: { t: 5, r: 16, b: 5, l: 16 },
        },
      });
    }

    // Steps Grid Container
    const cards = content.cards || [];
    if (cards.length > 0) {
      const cardCount = Math.min(5, Math.max(1, cards.length));
      const colContainerW = headerW;
      const colContainerH = 504;
      const colContainerY = 662;

      layers.push({
        kind: 'frame',
        id: `f_${seq++}`,
        role: 'vtimeline-steps-grid',
        x: 54,
        y: colContainerY,
        w: colContainerW,
        h: colContainerH,
        fill: '#FFFFFF',
        radius: 4,
        borders: {
          top: { w: 1.5, color: `${accentColor}33` },
          right: { w: 1.5, color: `${accentColor}33` },
          bottom: { w: 4, color: accentColor },
          left: { w: 1.5, color: `${accentColor}33` },
        },
        shadow: { color: 'rgba(0,0,0,0.06)', offsetX: 0, offsetY: 4, blur: 18 },
      });

      const colW = Math.round((colContainerW - 20) / cardCount);

      // Garis Penghubung Horizontal Timeline
      if (cardCount > 1) {
        const dotCenterX0 = 64 + 14 + 7;
        const dotCenterXLast = 64 + (cardCount - 1) * colW + 14 + 7;
        layers.push({
          kind: 'frame',
          id: `f_${seq++}`,
          role: 'vstep-bullet::after',
          x: dotCenterX0,
          y: colContainerY + 23,
          w: dotCenterXLast - dotCenterX0,
          h: 2,
          fill: `${accentColor}66`,
          radius: 0,
          borders: { top: null, right: null, bottom: null, left: null },
          shadow: null,
        });
      }

      cards.slice(0, cardCount).forEach((card, idx) => {
        const colX = 64 + idx * colW;

        if (idx < cardCount - 1) {
          layers.push({
            kind: 'frame',
            id: `f_${seq++}`,
            role: 'vstep-divider',
            x: colX + colW - 1,
            y: colContainerY + 16,
            w: 1,
            h: colContainerH - 32,
            fill: `${accentColor}26`,
            radius: 0,
            borders: { top: null, right: null, bottom: null, left: null },
            shadow: null,
          });
        }

        // Titik Bulat Timeline
        layers.push({
          kind: 'frame',
          id: `f_${seq++}`,
          role: 'vstep-dot',
          x: colX + 14,
          y: colContainerY + 16,
          w: 14,
          h: 14,
          fill: accentColor,
          radius: 7,
          borders: {
            top: { w: 2, color: '#FFFFFF' },
            right: { w: 2, color: '#FFFFFF' },
            bottom: { w: 2, color: '#FFFFFF' },
            left: { w: 2, color: '#FFFFFF' },
          },
          shadow: { color: accentColor, offsetX: 0, offsetY: 0, blur: 6 },
        });

        // Badge teks bersih maroon: FASE 01
        const badgeText = card.badge || `FASE 0${idx + 1}`;
        layers.push({
          kind: 'text',
          id: `t_${seq++}`,
          role: 'vstep-tag',
          text: badgeText,
          x: colX + 12,
          y: colContainerY + 38,
          w: colW - 24,
          h: 16,
          fontFamily: "'Plus Jakarta Sans', sans-serif",
          fontSize: 12,
          fontWeight: '900',
          fontStyle: 'normal',
          color: accentColor,
          textAlign: 'left',
          lineHeightPx: 16,
          letterSpacingPx: 1.5,
          box: null,
        });

        let innerY = colContainerY + 60;
        if (card.title) {
          layers.push({
            kind: 'text',
            id: `t_${seq++}`,
            role: 'vstep-label',
            text: card.title,
            x: colX + 12,
            y: innerY,
            w: colW - 24,
            h: 46,
            fontFamily: "'Plus Jakarta Sans', sans-serif",
            fontSize: 14.5,
            fontWeight: '800',
            fontStyle: 'normal',
            color: '#0F172A',
            textAlign: 'left',
            lineHeightPx: 19,
            letterSpacingPx: 0.5,
            box: null,
          });
          innerY += 56;
        }

        if (card.desc) {
          layers.push({
            kind: 'text',
            id: `t_${seq++}`,
            role: 'vstep-desc',
            text: card.desc,
            x: colX + 12,
            y: innerY,
            w: colW - 24,
            h: Math.max(80, colContainerY + colContainerH - 52 - innerY),
            fontFamily: "'Plus Jakarta Sans', sans-serif",
            fontSize: 12.5,
            fontWeight: '600',
            fontStyle: 'normal',
            color: '#1E293B',
            textAlign: 'left',
            lineHeightPx: 18,
            letterSpacingPx: 0,
            box: null,
          });
        }

        if (card.tag && card.tag.trim().length > 0) {
          const tagText = card.tag.trim();
          layers.push({
            kind: 'text',
            id: `t_${seq++}`,
            role: 'vstep-metric-tag',
            text: tagText,
            x: colX + 14,
            y: colContainerY + colContainerH - 42,
            w: colW - 28,
            h: 18,
            fontFamily: "'Plus Jakarta Sans', sans-serif",
            fontSize: 10.5,
            fontWeight: '800',
            fontStyle: 'normal',
            color: accentColor,
            textAlign: 'center',
            lineHeightPx: 16,
            letterSpacingPx: 1,
            box: {
              fill: `${accentColor}18`,
              radius: 4,
              borders: {
                top: { w: 1, color: `${accentColor}33` },
                right: { w: 1, color: `${accentColor}33` },
                bottom: { w: 1, color: `${accentColor}33` },
                left: { w: 1, color: `${accentColor}33` },
              },
              shadow: null,
              padding: { t: 4, r: 8, b: 4, l: 8 },
            },
          });
        }
      });
    }

    this.addClosingBannerLayers(layers, content, accentColor, headerW, () => seq++);
    this.addFooterLayers(layers, content, accentColor, headerW, () => seq++);

    return { version: 1, width, height, layers };
  }

  /**
   * Archetype: INFOGRAPHIC_CHRONICLE_GRID
   * Asymmetric 2-wing split: Sayap kiri (masthead + 2 hero KPIs + foto), Sayap kanan (2 support KPIs + ledger modules + breakdown bar).
   */
  private buildChronicleGridManifest(content: ExtractedPosterContent, width: number, height: number): PosterLayerManifest {
    const layers: PosterLayer[] = [];
    let seq = 0;
    const accentColor = '#EA580C';

    this.addTopBarLayers(layers, content, accentColor, () => seq++);

    // Sayap Kiri: Masthead (x: 54, y: 76, w: 460, h: 200)
    layers.push({
      kind: 'frame',
      id: `f_${seq++}`,
      role: 'cgrid-masthead-box',
      x: 54,
      y: 76,
      w: 460,
      h: 200,
      fill: '#FFFFFF',
      radius: 4,
      borders: { top: { w: 3.5, color: accentColor }, right: null, bottom: null, left: null },
      shadow: { color: 'rgba(0,0,0,0.06)', offsetX: 0, offsetY: 4, blur: 18 },
    });
    if (content.kicker) {
      layers.push({
        kind: 'text',
        id: `t_${seq++}`,
        role: 'cgrid-kicker-tag',
        text: content.kicker,
        x: 70,
        y: 92,
        w: 428,
        h: 16,
        fontFamily: "'Plus Jakarta Sans', sans-serif",
        fontSize: 12,
        fontWeight: '900',
        fontStyle: 'normal',
        color: accentColor,
        textAlign: 'left',
        lineHeightPx: 16,
        letterSpacingPx: 2,
        box: null,
      });
    }
    if (content.headline) {
      layers.push({
        kind: 'text',
        id: `t_${seq++}`,
        role: 'cgrid-main-headline',
        text: content.headline,
        x: 70,
        y: 112,
        w: 428,
        h: 56,
        fontFamily: "'Bebas Neue', sans-serif",
        fontSize: 48,
        fontWeight: '400',
        fontStyle: 'normal',
        color: '#0F172A',
        textAlign: 'left',
        lineHeightPx: 48,
        letterSpacingPx: 1,
        box: null,
      });
    }
    if (content.deck) {
      layers.push({
        kind: 'text',
        id: `t_${seq++}`,
        role: 'cgrid-main-deck',
        text: content.deck,
        x: 70,
        y: 172,
        w: 428,
        h: 90,
        fontFamily: "'Playfair Display', serif",
        fontSize: 14,
        fontWeight: '600',
        fontStyle: 'italic',
        color: '#334155',
        textAlign: 'left',
        lineHeightPx: 20,
        letterSpacingPx: 0,
        box: null,
      });
    }

    // Hero KPIs Sayap Kiri
    const stats = content.stats || [];
    if (stats[0]) {
      layers.push({
        kind: 'frame',
        id: `f_${seq++}`,
        role: 'cgrid-left-kpi-card',
        x: 54,
        y: 290,
        w: 224,
        h: 70,
        fill: '#FFFFFF',
        radius: 4,
        borders: { top: null, right: null, bottom: null, left: { w: 4, color: accentColor } },
        shadow: { color: 'rgba(0,0,0,0.06)', offsetX: 0, offsetY: 2, blur: 10 },
      });
      layers.push({
        kind: 'text',
        id: `t_${seq++}`,
        role: 'cgrid-left-kpi-val',
        text: stats[0].value,
        x: 68,
        y: 298,
        w: 196,
        h: 28,
        fontFamily: "'Bebas Neue', sans-serif",
        fontSize: 28,
        fontWeight: '400',
        fontStyle: 'normal',
        color: accentColor,
        textAlign: 'left',
        lineHeightPx: 28,
        letterSpacingPx: 1,
        box: null,
      });
      layers.push({
        kind: 'text',
        id: `t_${seq++}`,
        role: 'cgrid-left-kpi-lbl',
        text: stats[0].label,
        x: 68,
        y: 330,
        w: 196,
        h: 14,
        fontFamily: "'Plus Jakarta Sans', sans-serif",
        fontSize: 10,
        fontWeight: '800',
        fontStyle: 'normal',
        color: '#475569',
        textAlign: 'left',
        lineHeightPx: 14,
        letterSpacingPx: 0.5,
        box: null,
      });
    }

    if (stats[1]) {
      layers.push({
        kind: 'frame',
        id: `f_${seq++}`,
        role: 'cgrid-left-kpi-card',
        x: 290,
        y: 290,
        w: 224,
        h: 70,
        fill: '#FFFFFF',
        radius: 4,
        borders: { top: null, right: null, bottom: null, left: { w: 4, color: accentColor } },
        shadow: { color: 'rgba(0,0,0,0.06)', offsetX: 0, offsetY: 2, blur: 10 },
      });
      layers.push({
        kind: 'text',
        id: `t_${seq++}`,
        role: 'cgrid-left-kpi-val',
        text: stats[1].value,
        x: 304,
        y: 298,
        w: 196,
        h: 28,
        fontFamily: "'Bebas Neue', sans-serif",
        fontSize: 28,
        fontWeight: '400',
        fontStyle: 'normal',
        color: accentColor,
        textAlign: 'left',
        lineHeightPx: 28,
        letterSpacingPx: 1,
        box: null,
      });
      layers.push({
        kind: 'text',
        id: `t_${seq++}`,
        role: 'cgrid-left-kpi-lbl',
        text: stats[1].label,
        x: 304,
        y: 330,
        w: 196,
        h: 14,
        fontFamily: "'Plus Jakarta Sans', sans-serif",
        fontSize: 10,
        fontWeight: '800',
        fontStyle: 'normal',
        color: '#475569',
        textAlign: 'left',
        lineHeightPx: 14,
        letterSpacingPx: 0.5,
        box: null,
      });
    }

    // Sayap Kanan: Ledger Sheet Container
    const cards = content.cards || [];
    const rightWingW = 496;
    const rightWingX = 530;

    layers.push({
      kind: 'frame',
      id: `f_${seq++}`,
      role: 'cgrid-ledger-sheet',
      x: rightWingX,
      y: 76,
      w: rightWingW,
      h: 1080,
      fill: '#FFFFFF',
      radius: 4,
      borders: { top: { w: 3.5, color: accentColor }, right: null, bottom: null, left: null },
      shadow: { color: 'rgba(0,0,0,0.06)', offsetX: 0, offsetY: 4, blur: 18 },
    });

    cards.slice(0, 6).forEach((card, idx) => {
      const cardY = 100 + idx * 160;
      layers.push({
        kind: 'text',
        id: `t_${seq++}`,
        role: 'cgrid-mod-chip',
        text: card.badge || `0${idx + 1}`,
        x: rightWingX + 16,
        y: cardY,
        w: 36,
        h: 20,
        fontFamily: "'Plus Jakarta Sans', sans-serif",
        fontSize: 11,
        fontWeight: '900',
        fontStyle: 'normal',
        color: '#FFFFFF',
        textAlign: 'center',
        lineHeightPx: 16,
        letterSpacingPx: 1,
        box: {
          fill: accentColor,
          radius: 3,
          borders: { top: null, right: null, bottom: null, left: null },
          shadow: null,
          padding: { t: 2, r: 6, b: 2, l: 6 },
        },
      });

      layers.push({
        kind: 'text',
        id: `t_${seq++}`,
        role: 'cgrid-mod-title',
        text: card.title,
        x: rightWingX + 60,
        y: cardY,
        w: rightWingW - 76,
        h: 22,
        fontFamily: "'Plus Jakarta Sans', sans-serif",
        fontSize: 15,
        fontWeight: '800',
        fontStyle: 'normal',
        color: '#0F172A',
        textAlign: 'left',
        lineHeightPx: 18,
        letterSpacingPx: 0.5,
        box: null,
      });

      layers.push({
        kind: 'text',
        id: `t_${seq++}`,
        role: 'cgrid-mod-desc',
        text: card.desc,
        x: rightWingX + 16,
        y: cardY + 28,
        w: rightWingW - 32,
        h: 110,
        fontFamily: "'Plus Jakarta Sans', sans-serif",
        fontSize: 12.5,
        fontWeight: '600',
        fontStyle: 'normal',
        color: '#334155',
        textAlign: 'left',
        lineHeightPx: 18,
        letterSpacingPx: 0,
        box: null,
      });
    });

    this.addFooterLayers(layers, content, accentColor, 972, () => seq++);
    return { version: 1, width, height, layers };
  }

  /**
   * Archetype: INFOGRAPHIC_RADIAL_CLOCK
   */
  private buildRadialClockManifest(content: ExtractedPosterContent, width: number, height: number): PosterLayerManifest {
    const layers: PosterLayer[] = [];
    let seq = 0;
    const accentColor = '#EA580C';
    const headerW = 972;

    this.addTopBarLayers(layers, content, accentColor, () => seq++);
    this.addMastheadHeaderLayers(layers, content, accentColor, headerW, 'radial', () => seq++);

    // Milestones di Sayap Kanan
    const cards = content.cards || [];
    cards.slice(0, 5).forEach((card, idx) => {
      const cardY = 250 + idx * 160;
      layers.push({
        kind: 'frame',
        id: `f_${seq++}`,
        role: 'rclock-satellite-card',
        x: 510,
        y: cardY,
        w: 516,
        h: 140,
        fill: '#FFFFFF',
        radius: 4,
        borders: { top: null, right: null, bottom: null, left: { w: 5, color: accentColor } },
        shadow: { color: 'rgba(0,0,0,0.06)', offsetX: 0, offsetY: 2, blur: 12 },
      });

      layers.push({
        kind: 'text',
        id: `t_${seq++}`,
        role: 'rclock-milestone-title',
        text: card.title,
        x: 528,
        y: cardY + 12,
        w: 480,
        h: 24,
        fontFamily: "'Plus Jakarta Sans', sans-serif",
        fontSize: 15,
        fontWeight: '800',
        fontStyle: 'normal',
        color: '#0F172A',
        textAlign: 'left',
        lineHeightPx: 20,
        letterSpacingPx: 0.5,
        box: null,
      });

      layers.push({
        kind: 'text',
        id: `t_${seq++}`,
        role: 'rclock-milestone-desc',
        text: card.desc,
        x: 528,
        y: cardY + 40,
        w: 480,
        h: 88,
        fontFamily: "'Plus Jakarta Sans', sans-serif",
        fontSize: 12.5,
        fontWeight: '600',
        fontStyle: 'normal',
        color: '#334155',
        textAlign: 'left',
        lineHeightPx: 18,
        letterSpacingPx: 0,
        box: null,
      });
    });

    this.addClosingBannerLayers(layers, content, accentColor, headerW, () => seq++);
    this.addFooterLayers(layers, content, accentColor, headerW, () => seq++);

    return { version: 1, width, height, layers };
  }

  // ─── HELPER METODE UNTUK MENGURANGI REPETISI STRUKTUR POSTER ───

  private addTopBarLayers(layers: PosterLayer[], content: ExtractedPosterContent, accentColor: string, nextSeq: () => number) {
    if (!content.topBar) return;
    layers.push({
      kind: 'frame',
      id: `f_${nextSeq()}`,
      role: 'edition-tag',
      x: 54,
      y: 26,
      w: 972,
      h: 30,
      fill: '#FFFFFF',
      radius: 6,
      borders: {
        top: { w: 1, color: `${accentColor}33` },
        right: { w: 1, color: `${accentColor}33` },
        bottom: { w: 1, color: `${accentColor}33` },
        left: { w: 1, color: `${accentColor}33` },
      },
      shadow: { color: 'rgba(0,0,0,0.06)', offsetX: 0, offsetY: 2, blur: 8 },
    });

    if (content.topBar.left) {
      layers.push({
        kind: 'text',
        id: `t_${nextSeq()}`,
        role: 'edition-tag-left',
        text: content.topBar.left,
        x: 68,
        y: 33,
        w: 450,
        h: 16,
        fontFamily: "'Plus Jakarta Sans', sans-serif",
        fontSize: 13,
        fontWeight: '900',
        fontStyle: 'normal',
        color: accentColor,
        textAlign: 'left',
        lineHeightPx: 16,
        letterSpacingPx: 1.5,
        box: null,
      });
    }

    if (content.topBar.right) {
      layers.push({
        kind: 'text',
        id: `t_${nextSeq()}`,
        role: 'edition-tag-right',
        text: content.topBar.right,
        x: 550,
        y: 33,
        w: 460,
        h: 16,
        fontFamily: "'Plus Jakarta Sans', sans-serif",
        fontSize: 13,
        fontWeight: '800',
        fontStyle: 'normal',
        color: '#475569',
        textAlign: 'right',
        lineHeightPx: 16,
        letterSpacingPx: 1.5,
        box: null,
      });
    }
  }

  private addMastheadHeaderLayers(layers: PosterLayer[], content: ExtractedPosterContent, accentColor: string, headerW: number, rolePrefix: string, nextSeq: () => number) {
    const headerH = content.deck ? 144 : 110;
    layers.push({
      kind: 'frame',
      id: `f_${nextSeq()}`,
      role: `${rolePrefix}-header`,
      x: 54,
      y: 76,
      w: headerW,
      h: headerH,
      fill: '#FFFFFF',
      radius: 4,
      borders: {
        top: { w: 3.5, color: accentColor },
        right: null,
        bottom: { w: 1.5, color: `${accentColor}33` },
        left: null,
      },
      shadow: { color: 'rgba(0,0,0,0.06)', offsetX: 0, offsetY: 4, blur: 18 },
    });

    let currentHeaderY = 92;
    if (content.kicker) {
      layers.push({
        kind: 'text',
        id: `t_${nextSeq()}`,
        role: `${rolePrefix}-kicker`,
        text: content.kicker,
        x: 76,
        y: currentHeaderY,
        w: headerW - 44,
        h: 17,
        fontFamily: "'Plus Jakarta Sans', sans-serif",
        fontSize: 13.5,
        fontWeight: '900',
        fontStyle: 'normal',
        color: accentColor,
        textAlign: 'left',
        lineHeightPx: 17,
        letterSpacingPx: 2,
        box: null,
      });
      currentHeaderY += 21;
    }

    if (content.headline) {
      layers.push({
        kind: 'text',
        id: `t_${nextSeq()}`,
        role: `${rolePrefix}-headline`,
        text: content.headline,
        x: 76,
        y: currentHeaderY,
        w: headerW - 44,
        h: 52,
        fontFamily: "'Bebas Neue', sans-serif",
        fontSize: 54,
        fontWeight: '400',
        fontStyle: 'normal',
        color: '#0F172A',
        textAlign: 'left',
        lineHeightPx: 52,
        letterSpacingPx: 1.5,
        box: null,
      });
      currentHeaderY += 56;
    }

    if (content.deck) {
      layers.push({
        kind: 'text',
        id: `t_${nextSeq()}`,
        role: `${rolePrefix}-deck`,
        text: content.deck,
        x: 76,
        y: currentHeaderY,
        w: headerW - 50,
        h: 40,
        fontFamily: "'Playfair Display', serif",
        fontSize: 15.5,
        fontWeight: '600',
        fontStyle: 'italic',
        color: '#334155',
        textAlign: 'left',
        lineHeightPx: 22,
        letterSpacingPx: 0,
        box: null,
      });
    }
  }

  private addStatRowLayers(layers: PosterLayer[], content: ExtractedPosterContent, accentColor: string, headerW: number, rolePrefix: string, nextSeq: () => number) {
    const statsList = content.stats || [];
    if (statsList.length === 0) return;

    const statCount = Math.min(4, Math.max(1, statsList.length));
    const gap = 12;
    const statW = Math.round((headerW - (statCount - 1) * gap) / statCount);
    const statY = 231;

    statsList.slice(0, statCount).forEach((st, idx) => {
      const statX = 54 + idx * (statW + gap);
      layers.push({
        kind: 'frame',
        id: `f_${nextSeq()}`,
        role: `${rolePrefix}-pill`,
        x: statX,
        y: statY,
        w: statW,
        h: 68,
        fill: '#FFFFFF',
        radius: 4,
        borders: {
          top: { w: 1.5, color: `${accentColor}33` },
          right: { w: 1.5, color: `${accentColor}33` },
          bottom: { w: 1.5, color: `${accentColor}33` },
          left: { w: 1.5, color: `${accentColor}33` },
        },
        shadow: { color: 'rgba(0,0,0,0.05)', offsetX: 0, offsetY: 4, blur: 14 },
      });

      layers.push({
        kind: 'text',
        id: `t_${nextSeq()}`,
        role: `${rolePrefix}-val`,
        text: st.value,
        x: statX + 10,
        y: statY + 10,
        w: statW - 20,
        h: 28,
        fontFamily: "'Bebas Neue', sans-serif",
        fontSize: 28,
        fontWeight: '400',
        fontStyle: 'normal',
        color: accentColor,
        textAlign: 'center',
        lineHeightPx: 28,
        letterSpacingPx: 1,
        box: null,
      });

      layers.push({
        kind: 'text',
        id: `t_${nextSeq()}`,
        role: `${rolePrefix}-lbl`,
        text: st.label,
        x: statX + 10,
        y: statY + 42,
        w: statW - 20,
        h: 14,
        fontFamily: "'Plus Jakarta Sans', sans-serif",
        fontSize: 11,
        fontWeight: '800',
        fontStyle: 'normal',
        color: '#334155',
        textAlign: 'center',
        lineHeightPx: 14,
        letterSpacingPx: 0.5,
        box: null,
      });
    });
  }

  private addClosingBannerLayers(layers: PosterLayer[], content: ExtractedPosterContent, accentColor: string, headerW: number, nextSeq: () => number) {
    if (!content.closing) return;
    const closingY = 1180;
    layers.push({
      kind: 'frame',
      id: `f_${nextSeq()}`,
      role: 'vtimeline-closing-banner',
      x: 54,
      y: closingY,
      w: headerW,
      h: 46,
      fill: '#FFFFFF',
      radius: 4,
      borders: {
        top: null,
        right: null,
        bottom: null,
        left: { w: 5, color: accentColor },
      },
      shadow: { color: 'rgba(0,0,0,0.06)', offsetX: 0, offsetY: 4, blur: 14 },
    });

    layers.push({
      kind: 'text',
      id: `t_${nextSeq()}`,
      role: 'vtimeline-closing-text',
      text: content.closing,
      x: 74,
      y: closingY + 13,
      w: headerW - 40,
      h: 20,
      fontFamily: "'Plus Jakarta Sans', sans-serif",
      fontSize: 13.5,
      fontWeight: '700',
      fontStyle: 'normal',
      color: '#0F172A',
      textAlign: 'left',
      lineHeightPx: 20,
      letterSpacingPx: 0,
      box: null,
    });
  }

  private addFooterLayers(layers: PosterLayer[], content: ExtractedPosterContent, accentColor: string, headerW: number, nextSeq: () => number) {
    if (!content.footer) return;
    const footerY = 1240;
    layers.push({
      kind: 'frame',
      id: `f_${nextSeq()}`,
      role: 'footer-zone',
      x: 54,
      y: footerY,
      w: headerW,
      h: 48,
      fill: '#FFFFFF',
      radius: 8,
      borders: {
        top: { w: 1, color: `${accentColor}33` },
        right: { w: 1, color: `${accentColor}33` },
        bottom: { w: 1, color: `${accentColor}33` },
        left: { w: 1, color: `${accentColor}33` },
      },
      shadow: { color: 'rgba(0,0,0,0.12)', offsetX: 0, offsetY: 3, blur: 12 },
    });

    layers.push({
      kind: 'text',
      id: `t_${nextSeq()}`,
      role: 'signature-title',
      text: content.footer.signature,
      x: 72,
      y: footerY + 12,
      w: headerW - 140,
      h: 24,
      fontFamily: "'Bebas Neue', sans-serif",
      fontSize: 24,
      fontWeight: '400',
      fontStyle: 'normal',
      color: '#0F172A',
      textAlign: 'left',
      lineHeightPx: 24,
      letterSpacingPx: 2,
      box: null,
    });

    layers.push({
      kind: 'text',
      id: `t_${nextSeq()}`,
      role: 'footer-year',
      text: content.footer.year || '2026',
      x: 54 + headerW - 80,
      y: footerY + 12,
      w: 60,
      h: 24,
      fontFamily: "'Bebas Neue', sans-serif",
      fontSize: 24,
      fontWeight: '400',
      fontStyle: 'normal',
      color: accentColor,
      textAlign: 'right',
      lineHeightPx: 24,
      letterSpacingPx: 2,
      box: null,
    });
  }
}
