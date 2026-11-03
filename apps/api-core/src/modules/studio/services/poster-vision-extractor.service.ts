import { Injectable, Logger } from '@nestjs/common';
import { db, mediaAssets, contentPublications } from '@polaris/database';
import { eq, desc } from 'drizzle-orm';
import { AssetType } from '@polaris/shared-types';
import { openaiClient } from '@polaris/ai-engine';
import type { PosterLayerManifest, PosterLayer } from '@polaris/storage';

export interface ExtractedPosterContent {
  detectedArchetype: string;
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
    if (!imageUrl.startsWith('data:')) {
      try {
        const fetchRes = await fetch(imageUrl);
        if (fetchRes.ok) {
          const ab = await fetchRes.arrayBuffer();
          const b64 = Buffer.from(ab).toString('base64');
          const mime = fetchRes.headers.get('content-type') || 'image/jpeg';
          targetDataUrl = `data:${mime};base64,${b64}`;
        }
      } catch (err) {
        this.logger.warn(`[VisionExtractor] Gagal mendownload gambar untuk Vision AI: ${err}`);
      }
    }

    const prompt = `Anda adalah OCR & Document Layout Vision AI tingkat mahir untuk poster/infografis editorial Polaris.
Baca gambar ini dan ekstrak SEMUA elemen teks dan statistik yang BENAR-BENAR ADA di gambar poster ini secara 100% VERBATIM (PERSIS KATA PER KATA).
JANGAN PERNAH MENAMBAHKAN TEKS DUMMY ATAU MENGARANG! Ekstrak teks asli apa adanya secara lengkap.

Format JSON yang harus dihasilkan:
{
  "detectedArchetype": "INFOGRAPHIC_VISIONARY_TIMELINE" | "INFOGRAPHIC_ADVOCACY_PILLARS" | "INFOGRAPHIC_NARRATIVE_WAVE" | "INFOGRAPHIC_CHRONICLE_GRID" | "INFOGRAPHIC_RADIAL_CLOCK" | "GENERIC_INFOGRAPHIC",
  "topBar": {
    "left": "Teks bar atas kiri",
    "right": "Teks bar atas kanan"
  },
  "kicker": "Kategori teks kecil di atas judul",
  "headline": "Judul utama besar poster",
  "deck": "Kalimat narasi/penjelasan di bawah judul",
  "stats": [
    { "value": "7,8%", "label": "PERSENTASE PENDUDUK MISKIN" }
  ],
  "banner": "Teks pada pita/banner penegas di atas kolom kartu",
  "cards": [
    {
      "badge": "FASE 01 atau ◈ 01",
      "title": "Judul kartu",
      "desc": "Teks paragraf isi kartu secara lengkap",
      "tag": "✦ TAHAP 01 atau ✦ INDIKATOR 01"
    }
  ],
  "closing": "Kalimat penutup di atas footer",
  "footer": {
    "signature": "Nama dewan/lembaga di footer",
    "year": "2026"
  }
}`;

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

    const rawJson = completion.choices[0]?.message?.content || '{}';
    const parsed: ExtractedPosterContent = JSON.parse(rawJson);
    this.logger.log(`[VisionExtractor] Sukses mengekstrak poster: "${parsed.headline}", archetype=${parsed.detectedArchetype}, ${parsed.cards?.length || 0} kartu`);
    return parsed;
  }

  /**
   * Mengubah konten hasil ekstraksi Vision AI menjadi PosterLayerManifest dengan koordinat piksel nyata.
   */
  convertContentToManifest(content: ExtractedPosterContent, width = 1080, height = 1350): PosterLayerManifest {
    const layers: PosterLayer[] = [];
    let seq = 0;

    const accentColor = content.detectedArchetype === 'INFOGRAPHIC_VISIONARY_TIMELINE' ? '#7A1E2C' : '#D7261E';

    // 1. Top Bar Tag
    if (content.topBar) {
      layers.push({
        kind: 'frame',
        id: `f_${seq++}`,
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
          id: `t_${seq++}`,
          role: 'edition-tag',
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
          id: `t_${seq++}`,
          role: 'edition-tag',
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

    // 2. Header Masthead Card (Kicker + Headline + Deck)
    const headerW = 972;
    const headerH = content.deck ? 140 : 110;
    layers.push({
      kind: 'frame',
      id: `f_${seq++}`,
      role: 'apillars-header',
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
        id: `t_${seq++}`,
        role: 'apillars-kicker',
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
        id: `t_${seq++}`,
        role: 'apillars-headline',
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
        id: `t_${seq++}`,
        role: 'apillars-deck',
        text: content.deck,
        x: 76,
        y: currentHeaderY,
        w: headerW - 50,
        h: 24,
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

    // 3. 4 Baris Metrik Statistik
    const statsList = content.stats || [];
    if (statsList.length > 0) {
      const statCount = Math.min(4, statsList.length);
      const statW = Math.round((headerW - (statCount - 1) * 12) / statCount);
      const statY = 231;

      statsList.slice(0, statCount).forEach((st, idx) => {
        const statX = 54 + idx * (statW + 12);
        layers.push({
          kind: 'frame',
          id: `f_${seq++}`,
          role: 'apillars-stat-box',
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
          id: `t_${seq++}`,
          role: 'apillars-stat-val',
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
          id: `t_${seq++}`,
          role: 'apillars-stat-lbl',
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

    // 4. Banner Penegas
    if (content.banner) {
      layers.push({
        kind: 'text',
        id: `t_${seq++}`,
        role: 'apillars-section-tag',
        text: content.banner,
        x: 70,
        y: 631,
        w: 320,
        h: 18,
        fontFamily: "'Plus Jakarta Sans', sans-serif",
        fontSize: 12,
        fontWeight: '800',
        fontStyle: 'normal',
        color: '#FFFFFF',
        textAlign: 'center',
        lineHeightPx: 18,
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

    // 5. Container Kolom Kartu (Pilar / Timeline / Steps)
    const cards = content.cards || [];
    if (cards.length > 0) {
      const cardCount = Math.min(5, cards.length);
      const colContainerW = headerW;
      const colContainerH = 500;
      const colContainerY = 663;

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

        let innerY = colContainerY + 22;

        // Badge Pill
        if (card.badge) {
          layers.push({
            kind: 'text',
            id: `t_${seq++}`,
            role: 'apillar-badge',
            text: card.badge,
            x: colX + 16,
            y: innerY,
            w: colW - 32,
            h: 18,
            fontFamily: "'Plus Jakarta Sans', sans-serif",
            fontSize: 12.5,
            fontWeight: '900',
            fontStyle: 'normal',
            color: '#FFFFFF',
            textAlign: 'center',
            lineHeightPx: 18,
            letterSpacingPx: 1.5,
            box: {
              fill: accentColor,
              radius: 4,
              borders: { top: null, right: null, bottom: null, left: null },
              shadow: null,
              padding: { t: 4, r: 10, b: 4, l: 10 },
            },
          });
          innerY += 34;
        }

        // Judul Kartu
        if (card.title) {
          layers.push({
            kind: 'text',
            id: `t_${seq++}`,
            role: 'apillar-name',
            text: card.title,
            x: colX + 12,
            y: innerY,
            w: colW - 24,
            h: 36,
            fontFamily: "'Plus Jakarta Sans', sans-serif",
            fontSize: 15,
            fontWeight: '800',
            fontStyle: 'normal',
            color: '#0F172A',
            textAlign: 'center',
            lineHeightPx: 18,
            letterSpacingPx: 0.5,
            box: null,
          });
          innerY += 46;
        }

        // Isi Paragraf
        if (card.desc) {
          layers.push({
            kind: 'text',
            id: `t_${seq++}`,
            role: 'apillar-desc',
            text: card.desc,
            x: colX + 12,
            y: innerY,
            w: colW - 24,
            h: 220,
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

        // Tag Indikator Bawah
        if (card.tag) {
          layers.push({
            kind: 'text',
            id: `t_${seq++}`,
            role: 'apillar-metric-tag',
            text: card.tag,
            x: colX + 14,
            y: colContainerY + colContainerH - 42,
            w: colW - 28,
            h: 16,
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

    // 6. Closing Banner
    if (content.closing) {
      const closingY = 1176;
      layers.push({
        kind: 'frame',
        id: `f_${seq++}`,
        role: 'apillars-closing-banner',
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
        id: `t_${seq++}`,
        role: 'apillars-closing-text',
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

    // 7. Footer Zone
    if (content.footer) {
      const footerY = 1240;
      layers.push({
        kind: 'frame',
        id: `f_${seq++}`,
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
        id: `t_${seq++}`,
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
        id: `t_${seq++}`,
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

    return {
      version: 1,
      width,
      height,
      layers,
    };
  }
}

