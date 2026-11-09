/**
 * Vision Layout Locator
 *
 * Setelah kanvas kolase AI jadi, model Vision MELIHAT gambar tersebut dan mengembalikan
 * kotak ternormalisasi (0..1) area kertas kosong untuk headline, body, dan footer.
 * Satori lalu mencetak teks persis di kotak itu, sehingga tidak menabrak objek di kanvas.
 *
 * Urutan: Gemini Vision -> OpenAI Vision -> fallback berbasis anchor mutasi.
 * Hasil Vision SELALU divalidasi (clamp, ukuran minimum, tidak tumpang tindih) karena
 * output LLM bukan sumber kebenaran mutlak.
 */

import { googleGenAiClient, openaiClient } from '../../client.js';
import type {
  ArtCollageAnchor,
  NormalizedBox,
  VisionLayoutResult,
} from './art-collage.types.js';

const SAFE_MARGIN = 0.04;

/** Zona default bila Vision tidak tersedia: mengikuti instruksi anchor ke model gambar. */
export function anchorFallbackLayout(
  anchor: ArtCollageAnchor,
  paperTone: 'LIGHT' | 'DARK',
  isInfographic: boolean = false
): VisionLayoutResult {
  const textTone = paperTone === 'LIGHT' ? 'DARK' : 'LIGHT';
  const footer: NormalizedBox = { x: 0.05, y: 0.92, w: 0.90, h: 0.05 };

  if (isInfographic) {
    switch (anchor) {
      case 'TEXT_LEFT':
        return {
          headline: { x: 0.05, y: 0.06, w: 0.48, h: 0.16 },
          body: { x: 0.05, y: 0.23, w: 0.48, h: 0.67 },
          footer,
          obstacles: [],
          textTone,
          source: 'ANCHOR_FALLBACK',
        };
      case 'TEXT_RIGHT':
        return {
          headline: { x: 0.47, y: 0.06, w: 0.48, h: 0.16 },
          body: { x: 0.47, y: 0.23, w: 0.48, h: 0.67 },
          footer,
          obstacles: [],
          textTone,
          source: 'ANCHOR_FALLBACK',
        };
      case 'TEXT_BOTTOM':
        return {
          headline: { x: 0.05, y: 0.44, w: 0.90, h: 0.13 },
          body: { x: 0.05, y: 0.57, w: 0.90, h: 0.34 },
          footer,
          obstacles: [],
          textTone,
          source: 'ANCHOR_FALLBACK',
        };
      case 'TEXT_TOP':
      default:
        return {
          headline: { x: 0.05, y: 0.06, w: 0.90, h: 0.14 },
          body: { x: 0.05, y: 0.20, w: 0.90, h: 0.36 },
          footer,
          obstacles: [],
          textTone,
          source: 'ANCHOR_FALLBACK',
        };
    }
  }

  switch (anchor) {
    case 'TEXT_LEFT':
      return { headline: { x: 0.06, y: 0.07, w: 0.42, h: 0.3 }, body: { x: 0.06, y: 0.4, w: 0.4, h: 0.46 }, footer, obstacles: [], textTone, source: 'ANCHOR_FALLBACK' };
    case 'TEXT_RIGHT':
      return { headline: { x: 0.52, y: 0.07, w: 0.42, h: 0.3 }, body: { x: 0.54, y: 0.4, w: 0.4, h: 0.46 }, footer, obstacles: [], textTone, source: 'ANCHOR_FALLBACK' };
    case 'TEXT_BOTTOM':
      return { headline: { x: 0.06, y: 0.62, w: 0.88, h: 0.14 }, body: { x: 0.06, y: 0.77, w: 0.88, h: 0.13 }, footer: { x: 0.06, y: 0.92, w: 0.88, h: 0.05 }, obstacles: [], textTone, source: 'ANCHOR_FALLBACK' };
    case 'TEXT_TOP':
    default:
      return { headline: { x: 0.06, y: 0.05, w: 0.88, h: 0.16 }, body: { x: 0.06, y: 0.22, w: 0.88, h: 0.12 }, footer, obstacles: [], textTone, source: 'ANCHOR_FALLBACK' };
  }
}

function buildVisionPrompt(anchor: ArtCollageAnchor, isInfographic: boolean = false): string {
  if (isInfographic) {
    return `You are a senior data infographic layout director. Look at this textless infographic artwork.
Rich editorial typography, headline, data cards, and statistics will be printed on top of the clean paper area.
The artist was instructed to leave an open paper expanse of at least 50% on the ${anchor.replace('TEXT_', '').toLowerCase()} side.

Find the largest, contiguous clean paper area for:
1. "headline": the top section of the clean area for kicker, headline, and deck summary.
2. "body": the generous data section for 4-5 structured infographic cards, pillars, or timeline blocks.
3. "footer": a clean strip near the bottom for the authority signature line.

Return ONLY JSON, all values normalized 0..1 relative to image width (x,w) and height (y,h):
{
  "headline": {"x":0,"y":0,"w":0,"h":0},
  "body": {"x":0,"y":0,"w":0,"h":0},
  "footer": {"x":0,"y":0,"w":0,"h":0},
  "obstacles": [{"x":0,"y":0,"w":0,"h":0}],
  "textTone": "DARK" or "LIGHT",
  "notes": "short reason"
}
Rules:
- For ${anchor}: Ensure headline and body together cover the full ${anchor.replace('TEXT_', '').toLowerCase()} half of the canvas (combined height >= 0.45 or width >= 0.45).
- Never place a box over an obstacle.`;
  }

  return `You are a senior poster layout designer. Look at this textless poster artwork.
Typography will be printed on top of it later. Find where text can sit WITHOUT covering any person, face, object, paint mark or important detail.
The artist was asked to leave empty paper on the ${anchor.replace('TEXT_', '').toLowerCase()} side, but verify with your own eyes.

Return ONLY JSON, all values normalized 0..1 relative to image width (x,w) and height (y,h):
{
  "headline": {"x":0,"y":0,"w":0,"h":0},   // largest clean area for a big 2-4 word title
  "body": {"x":0,"y":0,"w":0,"h":0},       // clean area for 3 short paragraphs, must not overlap headline
  "footer": {"x":0,"y":0,"w":0,"h":0},     // thin clean strip for a signature line, usually near bottom
  "obstacles": [{"x":0,"y":0,"w":0,"h":0}],// boxes around people, faces and key objects
  "textTone": "DARK" or "LIGHT",            // DARK ink if the clean areas are light paper, LIGHT if dark
  "notes": "short reason"
}
Rules: boxes must stay inside the image with at least 0.03 margin from edges; headline w >= 0.35 and h >= 0.10; body w >= 0.30 and h >= 0.10; never place a box over an obstacle.`;
}

function clampBox(b: any): NormalizedBox | null {
  if (!b || typeof b !== 'object') return null;
  let x = Number(b.x), y = Number(b.y), w = Number(b.w), h = Number(b.h);
  if (![x, y, w, h].every((v) => Number.isFinite(v))) return null;
  // Toleransi model yang mengembalikan persen 0..100
  if (x > 1 || y > 1 || w > 1 || h > 1) {
    x /= 100; y /= 100; w /= 100; h /= 100;
  }
  x = Math.max(SAFE_MARGIN, Math.min(1 - SAFE_MARGIN, x));
  y = Math.max(SAFE_MARGIN * 0.75, Math.min(1 - SAFE_MARGIN, y));
  w = Math.max(0, Math.min(1 - SAFE_MARGIN - x, w));
  h = Math.max(0, Math.min(1 - SAFE_MARGIN * 0.5 - y, h));
  return { x, y, w, h };
}

function overlapRatio(a: NormalizedBox, b: NormalizedBox): number {
  const ix = Math.max(0, Math.min(a.x + a.w, b.x + b.w) - Math.max(a.x, b.x));
  const iy = Math.max(0, Math.min(a.y + a.h, b.y + b.h) - Math.max(a.y, b.y));
  const inter = ix * iy;
  const area = a.w * a.h;
  return area > 0 ? inter / area : 1;
}

export function validateVisionLayout(
  raw: any,
  source: VisionLayoutResult['source'],
  fallback: VisionLayoutResult
): VisionLayoutResult | null {
  const headline = clampBox(raw?.headline);
  const body = clampBox(raw?.body);
  if (!headline || !body) return null;
  if (headline.w < 0.25 || headline.h < 0.06) return null;
  if (body.w < 0.22 || body.h < 0.06) return null;

  // Jika body sedikit bertumpuk secara vertikal dengan headline, geser body ke bawah secara otomatis
  if (overlapRatio(body, headline) > 0.12 && body.y >= headline.y) {
    const newBodyY = Math.min(0.82, headline.y + headline.h + 0.015);
    const bottomEdge = Math.max(newBodyY + 0.10, body.y + body.h);
    body.y = newBodyY;
    body.h = Math.min(1 - SAFE_MARGIN - newBodyY, bottomEdge - newBodyY);
  }

  const obstacles = (Array.isArray(raw?.obstacles) ? raw.obstacles : [])
    .map(clampBox)
    .filter((b: NormalizedBox | null): b is NormalizedBox => !!b && b.w > 0.02 && b.h > 0.02);

  // Tolak hanya jika teks menabrak bagian tengah obstacle secara signifikan (> 35%)
  for (const ob of obstacles) {
    if (overlapRatio(headline, ob) > 0.35 || overlapRatio(body, ob) > 0.35) return null;
  }

  const footer = clampBox(raw?.footer);
  const safeFooter =
    footer && footer.w >= 0.3 && footer.h >= 0.025 && overlapRatio(footer, body) < 0.2 && overlapRatio(footer, headline) < 0.2
      ? footer
      : fallback.footer;

  return {
    headline,
    body,
    footer: safeFooter,
    obstacles,
    textTone: raw?.textTone === 'LIGHT' ? 'LIGHT' : raw?.textTone === 'DARK' ? 'DARK' : fallback.textTone,
    source,
    notes: typeof raw?.notes === 'string' ? raw.notes.slice(0, 200) : undefined,
  };
}

function extractJson(text: string): any {
  const cleaned = text.replace(/```json|```/g, '').trim();
  const start = cleaned.indexOf('{');
  const end = cleaned.lastIndexOf('}');
  if (start === -1 || end === -1) throw new Error('Respons Vision tanpa JSON.');
  return JSON.parse(cleaned.slice(start, end + 1));
}

async function locateWithGemini(imageBase64: string, mimeType: string, prompt: string): Promise<any> {
  if (!googleGenAiClient) throw new Error('Gemini client tidak tersedia.');
  const response = await googleGenAiClient.models.generateContent({
    model: process.env.POSTER_VISION_MODEL || process.env.GEMINI_TEXT_MODEL || 'gemini-3.8-flash',
    contents: [
      {
        role: 'user',
        parts: [{ inlineData: { mimeType, data: imageBase64 } }, { text: prompt }],
      },
    ],
    config: { responseMimeType: 'application/json', temperature: 0.1 } as any,
  });
  const text = (response as any).text ?? response.candidates?.[0]?.content?.parts?.map((p: any) => p.text || '').join('') ?? '';
  return extractJson(String(text));
}

async function locateWithOpenAI(imageBase64: string, mimeType: string, prompt: string): Promise<any> {
  const response = await openaiClient.chat.completions.create({
    model: process.env.POSTER_VISION_OPENAI_MODEL || 'gpt-4o-mini',
    temperature: 0.1,
    response_format: { type: 'json_object' },
    messages: [
      {
        role: 'user',
        content: [
          { type: 'text', text: prompt },
          { type: 'image_url', image_url: { url: `data:${mimeType};base64,${imageBase64}`, detail: 'low' } },
        ],
      },
    ],
  });
  return extractJson(response.choices[0]?.message?.content || '{}');
}

export class VisionLayoutLocator {
  public static async locate(params: {
    imageBuffer: Buffer;
    mimeType?: string;
    anchor: ArtCollageAnchor;
    paperTone: 'LIGHT' | 'DARK';
    isInfographic?: boolean;
  }): Promise<VisionLayoutResult> {
    const isInfographic = params.isInfographic ?? false;
    const fallback = anchorFallbackLayout(params.anchor, params.paperTone, isInfographic);

    // Untuk Infografis (12 arketipe), tata letak kolom & ruang kosong 74% sudah presisi deterministik
    // di ChromiumPosterCompositor + luminansi kertas diukur langsung via Sharp.
    // Lewati panggilan LLM Vision ganda agar lebih cepat (hemat 4-6 detik) dan hemat token Gemini/OpenAI.
    if (isInfographic) {
      return fallback;
    }

    const mimeType = params.mimeType || 'image/png';
    const b64 = params.imageBuffer.toString('base64');
    const prompt = buildVisionPrompt(params.anchor, isInfographic);

    const attempts: Array<{ source: VisionLayoutResult['source']; run: () => Promise<any> }> = [
      { source: 'GEMINI_VISION', run: () => locateWithGemini(b64, mimeType, prompt) },
      { source: 'OPENAI_VISION', run: () => locateWithOpenAI(b64, mimeType, prompt) },
    ];

    for (const attempt of attempts) {
      try {
        const raw = await attempt.run();
        const validated = validateVisionLayout(raw, attempt.source, fallback);
        if (validated) return validated;
        console.warn(`[VisionLayoutLocator] ${attempt.source} mengembalikan zona tidak valid, mencoba berikutnya.`);
      } catch (err: any) {
        console.warn(`[VisionLayoutLocator] ${attempt.source} gagal: ${err?.message}`);
      }
    }
    return fallback;
  }
}
