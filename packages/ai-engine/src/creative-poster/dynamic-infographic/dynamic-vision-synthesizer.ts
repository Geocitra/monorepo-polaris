import fs from 'fs';
import path from 'path';
import { openaiClient } from '../../client.js';
import type { DynamicInfographicLayoutSpec } from './dynamic-layout.types.js';

export class DynamicVisionSynthesizer {
  /**
   * Menemukan template referensi lokal
   */
  public static resolveReferenceTemplatePath(templateIdOrPath?: string): string {
    const candidates = [
      templateIdOrPath,
      path.resolve(process.cwd(), 'uploads/references/infografis/template-03-radial-clock-chronicle.jpg'),
      path.resolve(process.cwd(), '../storage/assets/radial-clock/template-03-radial-clock-chronicle.jpg'),
      path.resolve(process.cwd(), 'uploads/references/infografis/template-02-biography-timeline-grid.jpg'),
    ].filter(Boolean) as string[];

    for (const p of candidates) {
      if (fs.existsSync(p)) return p;
    }
    return candidates[1];
  }

  /**
   * Menganalisis template referensi menggunakan GPT-4o Vision
   * untuk menghasilkan DynamicInfographicLayoutSpec secara otonom
   */
  public static async synthesizeLayoutFromTemplate(
    referencePath?: string,
    contentSummary?: { mainTitle: string; sectionCount: number }
  ): Promise<DynamicInfographicLayoutSpec> {
    const resolvedPath = this.resolveReferenceTemplatePath(referencePath);
    console.log(`[DynamicVisionSynthesizer] Menganalisis template referensi: ${resolvedPath}`);

    const imageBuffer = fs.readFileSync(resolvedPath);
    const base64Image = `data:image/jpeg;base64,${imageBuffer.toString('base64')}`;

    const titleText = contentSummary?.mainTitle || 'KESEHATAN';
    const sectionCount = contentSummary?.sectionCount || 6;

    const systemPrompt = `Kamu adalah AI Visual Architect dan Master Desainer Infografis.
Tugasmu adalah menganalisis gambar template referensi infografis yang diberikan dan merekonstruksi tata letak ruang koordinatnya untuk kanvas 1080 x 1350 piksel.

Karakteristik template referensi jam melingkar:
- Kanvas: 1080 x 1350 px, latar belakang bernuansa kertas vintage/parchment krem hangat (#F6F1EA) dengan border ganda vintage (#6D4C3D).
- Di sisi kiri: Pita judul vertikal besar (font Anton atau bold condensed), huruf-huruf tersusun dari atas ke bawah.
- Di tengah-kiri: Motif lingkaran jam dinding antik (center X: ~270, Y: ~520, diameter: ~310px).
- Sektor/irisan kipas SVG memancar dari pusat jam ke tepi kanan dan bawah dengan nuansa warna pastel lembut:
  * Sektor 1 (Atas): #F6F1EA
  * Sektor 2 (Kanan Atas): #EDF5EF
  * Sektor 3 (Kanan Tengah): #EBF3F8
  * Sektor 4 (Kanan Bawah Tengah): #FAF0E4
  * Sektor 5 (Bawah Kanan): #F8ECF0
  * Sektor 6 (Bawah Kiri): #EFEBE7
- Garis pemisah (divider lines) memancar dari pusat jam membagi tiap era.
- Tiap seksi memiliki:
  * Badge era menempel di perimeter jam dengan bayangan halus
  * Kotak teks (title + bullets) diletakkan di zona aman tanpa tumpang tindih
  * Kotak gambar ilustrasi tematik
- Di pojok kanan bawah: Kartu verifikasi/profil tokoh.

Format keluaran HARUS selalu JSON murni sesuai skema.`;

    const userPrompt = `Analisis template gambar ini untuk memuat judul "${titleText}" dengan ${sectionCount} seksi konten.
Hasilkan JSON DynamicInfographicLayoutSpec 1080x1350 piksel dengan koordinat zero-collision (tidak boleh ada badge atau teks yang bertubrukan).`;

    try {
      const response = await openaiClient.chat.completions.create({
        model: 'gpt-4o',
        messages: [
          { role: 'system', content: systemPrompt },
          {
            role: 'user',
            content: [
              { type: 'text', text: userPrompt },
              { type: 'image_url', image_url: { url: base64Image, detail: 'high' } },
            ],
          },
        ],
        temperature: 0.2,
        response_format: { type: 'json_object' },
      });

      const raw = response.choices[0]?.message?.content || '{}';
      const parsed = JSON.parse(raw);

      // Verifikasi struktur dasar
      if (parsed.canvas && parsed.sections && parsed.sections.length > 0) {
        return this.normalizeLayoutSpec(parsed, titleText);
      }
    } catch (visionErr: any) {
      console.warn(`[DynamicVisionSynthesizer] Vision call error (${visionErr.message}), beralih ke layout dinamis terkalibrasi...`);
    }

    return this.getCalibratedRadialClockLayout(titleText);
  }

  /**
   * Menormalisasi spec hasil generate AI agar koordinatnya aman dan rapi
   */
  private static normalizeLayoutSpec(
    spec: any,
    titleText: string
  ): DynamicInfographicLayoutSpec {
    return {
      styleName: spec.styleName || 'AUTONOMOUS_RADIAL_CLOCK',
      canvas: {
        backgroundColor: spec.canvas?.backgroundColor || '#F6F1EA',
        borderColor: spec.canvas?.borderColor || '#6D4C3D',
        borderWidth: spec.canvas?.borderWidth || 4,
      },
      leftRibbon: {
        x: spec.leftRibbon?.x || 26,
        y: spec.leftRibbon?.y || 40,
        w: spec.leftRibbon?.w || 90,
        h: spec.leftRibbon?.h || 1100,
        titleLetters: spec.leftRibbon?.titleLetters || titleText.replace(/\s+/g, '').slice(0, 10).split(''),
        fontSize: spec.leftRibbon?.fontSize || 56,
        color: spec.leftRibbon?.color || '#4A3525',
        hasOpenBookIcon: true,
      },
      motif: {
        type: 'clock',
        x: spec.motif?.x || 115,
        y: spec.motif?.y || 365,
        size: spec.motif?.size || 310,
        borderRadius: spec.motif?.borderRadius || 155,
      },
      wedges: spec.wedges || this.getDefaultWedges(),
      dividerLines: spec.dividerLines || this.getDefaultDividerLines(),
      sections: spec.sections.map((s: any, idx: number) => ({
        id: s.id || `sec-${idx + 1}`,
        badge: s.badge,
        textBox: s.textBox,
        imageBox: s.imageBox,
      })),
      profileBox: spec.profileBox || {
        x: 690,
        y: 1215,
        w: 360,
        h: 70,
      },
    };
  }

  /**
   * Layout terkalibrasi zero-collision presisi 1:1
   */
  public static getCalibratedRadialClockLayout(titleText: string): DynamicInfographicLayoutSpec {
    return {
      styleName: 'CALIBRATED_RADIAL_CLOCK',
      canvas: {
        backgroundColor: '#F6F1EA',
        borderColor: '#6D4C3D',
        borderWidth: 4,
      },
      leftRibbon: {
        x: 26,
        y: 40,
        w: 90,
        h: 1100,
        titleLetters: titleText.replace(/\s+/g, '').slice(0, 10).split(''),
        fontSize: 56,
        color: '#4A3525',
        hasOpenBookIcon: true,
      },
      motif: {
        type: 'clock',
        x: 115,
        y: 365,
        size: 310,
        borderRadius: 155,
      },
      wedges: this.getDefaultWedges(),
      dividerLines: this.getDefaultDividerLines(),
      sections: [
        {
          id: 'sec-1',
          badge: { x: 250, y: 330, text: 'ERA AWAL // INISIASI', color: '#7B1FA2' },
          textBox: { x: 145, y: 32, w: 310, h: 220 },
          imageBox: { x: 460, y: 25, w: 170, h: 190 },
        },
        {
          id: 'sec-2',
          badge: { x: 375, y: 365, text: 'KASTILA // REGULASI', color: '#2E7D32' },
          textBox: { x: 860, y: 32, w: 200, h: 220 },
          imageBox: { x: 665, y: 30, w: 185, h: 240 },
        },
        {
          id: 'sec-3',
          badge: { x: 425, y: 445, text: 'GERAKAN // MOBILISASI', color: '#0288D1' },
          textBox: { x: 570, y: 400, w: 240, h: 180 },
          imageBox: { x: 820, y: 340, w: 235, h: 220 },
        },
        {
          id: 'sec-4',
          badge: { x: 425, y: 565, text: 'MODERN // 1898-1946', color: '#E65100' },
          textBox: { x: 570, y: 620, w: 200, h: 180 },
          imageBox: { x: 780, y: 560, w: 280, h: 250 },
        },
        {
          id: 'sec-5',
          badge: { x: 375, y: 670, text: 'PERJUANGAN // 1942-1945', color: '#C2185B' },
          textBox: { x: 825, y: 800, w: 230, h: 200 },
          imageBox: { x: 585, y: 770, w: 225, h: 240 },
        },
        {
          id: 'sec-6',
          badge: { x: 235, y: 700, text: 'KONTEMPORER // 2026', color: '#37474F' },
          textBox: { x: 145, y: 750, w: 200, h: 240 },
          imageBox: { x: 305, y: 800, w: 165, h: 290 },
        },
      ],
      profileBox: {
        x: 690,
        y: 1215,
        w: 360,
        h: 70,
      },
    };
  }

  private static getDefaultWedges() {
    const cx = 270;
    const cy = 520;
    return [
      { points: `${cx},${cy} 620,0 1080,0 1080,360`, fill: '#EDF5EF', opacity: 0.85 },
      { points: `${cx},${cy} 1080,360 1080,590`, fill: '#EBF3F8', opacity: 0.85 },
      { points: `${cx},${cy} 1080,590 1080,820`, fill: '#FAF0E4', opacity: 0.9 },
      { points: `${cx},${cy} 1080,820 1080,1180 520,1350`, fill: '#F8ECF0', opacity: 0.85 },
    ];
  }

  private static getDefaultDividerLines() {
    const cx = 270;
    const cy = 520;
    return [
      { x1: cx, y1: cy, x2: 1080, y2: 360, stroke: '#D7CCC8', strokeWidth: 1.5 },
      { x1: cx, y1: cy, x2: 1080, y2: 590, stroke: '#D7CCC8', strokeWidth: 1.5 },
      { x1: cx, y1: cy, x2: 1080, y2: 820, stroke: '#D7CCC8', strokeWidth: 1.5 },
      { x1: cx, y1: cy, x2: 520, y2: 1350, stroke: '#D7CCC8', strokeWidth: 1.5 },
    ];
  }
}
