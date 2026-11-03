import { Injectable, Logger } from '@nestjs/common';
import * as fs from 'fs';
import { openaiClient } from '@polaris/ai-engine';
import type { PosterLayerManifest, PosterLayer } from '@polaris/storage';

export interface ExtractedPosterContent {
  detectedArchetype:
    | 'INFOGRAPHIC_VISIONARY_TIMELINE'
    | 'INFOGRAPHIC_ADVOCACY_PILLARS'
    | 'INFOGRAPHIC_NARRATIVE_WAVE'
    | 'INFOGRAPHIC_CHRONICLE_GRID'
    | 'INFOGRAPHIC_RADIAL_CLOCK'
    | 'GENERIC_INFOGRAPHIC'
    | string;
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

    // 1. Cek jika file path lokal atau file://
    if (imageUrl.startsWith('file://') || /^[a-zA-Z]:\\/.test(imageUrl) || imageUrl.startsWith('/')) {
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

    // 2. Jika URL HTTP/HTTPS, download dan convert ke data URL
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
Tugas Anda adalah membaca gambar poster ini dan mengekstrak SEMUA teks dan angka statistik yang BENAR-BENAR ADA di gambar poster secara 100% VERBATIM (PERSIS KATA PER KATA, HURUF BESAR/KECIL, DAN TANDA BACA ASLI).
JANGAN PERNAH MENGARANG ATAU MENAMBAHKAN TEKS DUMMY!

ATURAN STRUKTUR POSTER YANG SANGAT KRUSIAL:

1. TOP BAR (Paling atas):
   - Kiri: teks seperti "POLARIS // DAPIL JABAR"
   - Kanan: teks seperti "DOKUMEN ADVOKASI PUBLIK"

2. HEADER UTAMA:
   - kicker: Kategori teks kecil di atas judul (misal: "DATA KEMISKINAN JABAR // ANALISIS SOSIAL"). Wajib pertahankan tanda "//".
   - headline: Judul utama besar (misal: "KEMISKINAN DI KOTA BANDUNG MENURUN").
   - deck: Paragraf pengantar / subjudul narasi di bawah judul (cetak miring/serif).

3. BARIS KOTAK STATISTIK (SANGAT PENTING - WAJIB EKSTRAK SEMUANYA!):
   - Terletak tepat di bawah narasi/judul, di atas foto / kolase gambar.
   - Terdiri dari deretan horizontal 3 sampai 4 kotak statistik.
   - Anda WAJIB mengekstrak SEMUA kotak statistik tersebut ke dalam array "stats"!
   - Setiap kotak memiliki angka/persentase/rupiah ("value") dan label teks di bawahnya ("label").
   - Contoh nyata yang WAJIB lengkap:
     [
       { "value": "7,8%", "label": "PERSENTASE PENDUDUK MISKIN" },
       { "value": "RP 500 MILIAR", "label": "ANGGARAN PENANGANAN KEMISKINAN" },
       { "value": "3 KECAMATAN", "label": "ZONA PRIORITAS PENANGANAN" },
       { "value": "95%", "label": "TARGET PEMBERDAYAAN MASYARAKAT" }
     ]
   - PERINGATAN KERAS: JANGAN PERNAH memasukkan kotak angka statistik ke dalam field "banner"!

4. PITA BANNER TENGAH (PETA JALAN / PILAR):
   - Pita strip kecil berwarna merah/maroon yang berada DI TENGAH poster, persis di antara foto dan deretan kartu kolom bawah.
   - Contoh teks banner yang benar: "PETA JALAN TARGET & REALISASI CAPAIAN" atau "PILAR AKSI & ADVOKASI BERKELANJUTAN".
   - PERINGATAN KERAS: Pita banner HANYA berisi judul seksi tersebut, BUKAN angka statistik!

5. DERETAN KARTU KOLOM BAWAH (Biasanya 4 atau 5 kartu sejajar):
   - Anda WAJIB mengekstrak SEMUA kartu kolom (misal FASE 01 sampai FASE 05).
   - badge: teks penanda tahap/fase (misal "FASE 01", "FASE 02", dst., atau "◆ 01", dst.).
   - title: judul kartu tebal (misal "5,2% PENURUNAN ANGKA KEMISKINAN", "RP 500 MILIAR UNTUK PROGRAM SOSIAL", "3 KECAMATAN PRIORITAS", dst.).
   - desc: paragraf kalimat isi kartu secara lengkap tanpa terpotong.
   - tag: tag kecil di bagian bawah kartu (misal "✦ TAHAP 01", "✦ TAHAP 02", dst., atau "✦ INDIKATOR 01").

6. CLOSING & FOOTER:
   - closing: satu kalimat penutup bergaris tebal di bawah kolom kartu (misal: "Diperlukan sinergi antara pemerintah dan masyarakat untuk terus menurunkan angka kemiskinan di Kota Bandung secara berkelanjutan.").
   - footer.signature: nama dewan/jabatan (misal "DR. JONANDA P. A. B // DPRD PROVINSI • DAPIL JABAR").
   - footer.year: tahun (misal "2026").

7. DETECTED ARCHETYPE:
   - Jika terdapat garis horizontal dengan titik-titik bulat timeline di atas FASE 01..05, set "INFOGRAPHIC_VISIONARY_TIMELINE".
   - Jika menggunakan lencana kotak merah tebal dengan simbol ◆ 01..05 dan tag INDIKATOR, set "INFOGRAPHIC_ADVOCACY_PILLARS".
   - Lainnya sesuaikan.

Format JSON yang wajib dihasilkan (hanya JSON murni):
{
  "detectedArchetype": "INFOGRAPHIC_VISIONARY_TIMELINE",
  "topBar": { "left": "...", "right": "..." },
  "kicker": "...",
  "headline": "...",
  "deck": "...",
  "stats": [
    { "value": "...", "label": "..." }
  ],
  "banner": "...",
  "cards": [
    { "badge": "...", "title": "...", "desc": "...", "tag": "..." }
  ],
  "closing": "...",
  "footer": { "signature": "...", "year": "..." }
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
    this.logger.log(
      `[VisionExtractor] Sukses mengekstrak poster: "${parsed.headline}", archetype=${parsed.detectedArchetype}, stats=${parsed.stats?.length || 0}, cards=${parsed.cards?.length || 0}`
    );
    return parsed;
  }

  /**
   * Mengubah konten hasil ekstraksi Vision AI menjadi PosterLayerManifest dengan koordinat piksel nyata.
   * Mendukung penuh INFOGRAPHIC_VISIONARY_TIMELINE, INFOGRAPHIC_ADVOCACY_PILLARS, dsb.
   */
  convertContentToManifest(content: ExtractedPosterContent, width = 1080, height = 1350): PosterLayerManifest {
    const layers: PosterLayer[] = [];
    let seq = 0;

    const cards = content.cards || [];
    const isTimeline =
      content.detectedArchetype === 'INFOGRAPHIC_VISIONARY_TIMELINE' ||
      cards.some((c) => /FASE/i.test(c.badge || '')) ||
      /PETA JALAN/i.test(content.banner || '') ||
      cards.some((c) => /TAHAP/i.test(c.tag || ''));

    const accentColor = isTimeline ? '#7A1E2C' : '#D7261E';

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
          id: `t_${seq++}`,
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

    // 2. Header Masthead Card (Kicker + Headline + Deck)
    const headerW = 972;
    const headerH = content.deck ? 144 : 110;
    layers.push({
      kind: 'frame',
      id: `f_${seq++}`,
      role: 'vtimeline-header',
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
        role: 'vtimeline-kicker',
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
        role: 'vtimeline-headline',
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
        role: 'vtimeline-deck',
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

    // 3. Baris Kotak Metrik Statistik (Presisi 4 Kolom)
    const statsList = content.stats || [];
    if (statsList.length > 0) {
      const statCount = Math.min(4, Math.max(1, statsList.length));
      const gap = 12;
      const statW = Math.round((headerW - (statCount - 1) * gap) / statCount);
      const statY = 231; // 76px + 155px persis seperti di CSS compositor

      statsList.slice(0, statCount).forEach((st, idx) => {
        const statX = 54 + idx * (statW + gap);
        layers.push({
          kind: 'frame',
          id: `f_${seq++}`,
          role: 'vtimeline-stat-pill',
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
          role: 'vtimeline-stat-val',
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
          role: 'vtimeline-stat-lbl',
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

    // 4. Banner Penegas / Peta Jalan Tengah (Tepat di atas kolom kartu)
    const bannerText = content.banner || (isTimeline ? 'PETA JALAN TARGET & REALISASI CAPAIAN' : 'PILAR AKSI & ADVOKASI BERKELANJUTAN');
    const bannerW = Math.min(520, Math.max(300, bannerText.length * 10 + 36));
    const bannerY = 626; // 76px + 550px persis seperti di CSS compositor

    layers.push({
      kind: 'text',
      id: `t_${seq++}`,
      role: 'vtimeline-bar-tag',
      text: bannerText,
      x: 54,
      y: bannerY,
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

    // 5. Container Kolom Kartu (Timeline Steps Grid atau Advocacy Pillars Grid)
    if (cards.length > 0) {
      const cardCount = Math.min(5, Math.max(1, cards.length));
      const colContainerW = headerW;
      const colContainerH = 504;
      const colContainerY = 662;

      // Box Pembungkus Utama Kartu
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

      // Garis Penghubung Horizontal Timeline (Connector Line antar Titik Bulat)
      if (isTimeline && cardCount > 1) {
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

        // Garis Pembatas Vertikal Antar Kolom
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

        // Titik Bulat Timeline (Bullet Dot)
        if (isTimeline) {
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
        }

        let innerY = isTimeline ? colContainerY + 38 : colContainerY + 22;

        // Badge: FASE 01 (tanpa kotak merah) atau ◆ 01 (kotak pill merah)
        if (card.badge) {
          if (isTimeline) {
            // Pada Timeline: Teks maroon bersih tanpa background solid
            layers.push({
              kind: 'text',
              id: `t_${seq++}`,
              role: 'vstep-tag',
              text: card.badge,
              x: colX + 12,
              y: innerY,
              w: colW - 24,
              h: 16,
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              fontSize: 11,
              fontWeight: '900',
              fontStyle: 'normal',
              color: accentColor,
              textAlign: 'left',
              lineHeightPx: 16,
              letterSpacingPx: 1.5,
              box: null,
            });
            innerY += 22;
          } else {
            // Pada Pillars: Lencana pill merah dengan teks putih
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
        }

        // Judul Kartu dengan Kalkulasi Tinggi Dinamis (Mencegah teks bertumpuk / overlap)
        if (card.title) {
          const titleLen = card.title.length;
          const titleLines = titleLen > 30 ? 3 : titleLen > 15 ? 2 : 1;
          const titleH = titleLines * 20;

          layers.push({
            kind: 'text',
            id: `t_${seq++}`,
            role: isTimeline ? 'vstep-label' : 'apillar-name',
            text: card.title,
            x: colX + 12,
            y: innerY,
            w: colW - 24,
            h: titleH,
            fontFamily: "'Plus Jakarta Sans', sans-serif",
            fontSize: 15,
            fontWeight: '800',
            fontStyle: 'normal',
            color: '#0F172A',
            textAlign: isTimeline ? 'left' : 'center',
            lineHeightPx: 19,
            letterSpacingPx: 0.5,
            box: null,
          });

          // Garis tipis pemisah di bawah judul kartu
          layers.push({
            kind: 'frame',
            id: `f_${seq++}`,
            role: 'vstep-title-divider',
            x: colX + 12,
            y: innerY + titleH + 4,
            w: colW - 24,
            h: 1.5,
            fill: `${accentColor}33`,
            radius: 0,
            borders: { top: null, right: null, bottom: null, left: null },
            shadow: null,
          });

          innerY += titleH + 12; // Jarak aman bebas tubrukan
        }

        // Isi Paragraf Kartu
        if (card.desc) {
          const descMaxH = Math.max(80, Math.min(270, colContainerY + colContainerH - 52 - innerY));
          layers.push({
            kind: 'text',
            id: `t_${seq++}`,
            role: isTimeline ? 'vstep-desc' : 'apillar-desc',
            text: card.desc,
            x: colX + 12,
            y: innerY,
            w: colW - 24,
            h: descMaxH,
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

        // Tag Indikator Bawah (✦ TAHAP 01 atau ✦ INDIKATOR 01)
        if (card.tag) {
          layers.push({
            kind: 'text',
            id: `t_${seq++}`,
            role: isTimeline ? 'vstep-metric-tag' : 'apillar-metric-tag',
            text: card.tag,
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

    // 6. Closing Banner
    if (content.closing) {
      const closingY = 1180;
      layers.push({
        kind: 'frame',
        id: `f_${seq++}`,
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
        id: `t_${seq++}`,
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


