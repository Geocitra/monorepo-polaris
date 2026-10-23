import { GoogleGenAI } from '@google/genai';
import { googleGenAiClient } from '../client.js';
import { AiTelemetryService } from '../telemetry/ai-telemetry.service.js';

export interface GenerateGoogleImagenParams {
  prompt: string;
  aspectRatio?: '4:5' | '1:1' | '16:9' | '9:16' | '3:4' | '4:3';
  tenantId?: string;
  stylePromptSuffix?: string;
  imageNegativeAllow?: string[];
}

export class GoogleImagenAdapter {
  private client: GoogleGenAI | null;

  constructor(apiKey?: string) {
    if (apiKey) {
      this.client = new GoogleGenAI({ apiKey });
    } else {
      this.client = googleGenAiClient;
    }
  }

  /**
   * Menghasilkan kanvas dasar fotografis/artistik Layer 1 menggunakan Google Imagen 3.
   * Dilengkapi native negative prompt untuk menjamin nol artefak teks & logo.
   */
  public async generateImage(
    params: GenerateGoogleImagenParams
  ): Promise<{ temporaryImageUrl: string; canonicalTraceId: string }> {
    const apiKey =
      process.env.GEMINI_API_KEY ||
      process.env.GOOGLE_API_KEY ||
      process.env.GOOGLE_GENAI_API_KEY;

    if (!this.client && apiKey) {
      this.client = new GoogleGenAI({ apiKey });
    }

    if (!this.client) {
      throw new Error(
        '[GoogleImagenAdapter] GEMINI_API_KEY belum disetel pada file environment (.env).'
      );
    }

    const preferredModel =
      process.env.GOOGLE_IMAGE_MODEL || 'imagen-3.0-generate-002';
    const aspectRatio = params.aspectRatio || '4:5';

    const telemetry = AiTelemetryService.startTrace({
      operation: 'google-imagen-generation',
      model: preferredModel,
      tenantId: params.tenantId,
      metadata: {
        promptLength: params.prompt.length,
        requestedAspectRatio: aspectRatio,
      },
    });

    try {
      // Prompt conditioning adaptif sesuai gaya blueprint
      const defaultSuffix = 'editorial lighting, authentic atmosphere, high visual depth, clean empty negative space';
      const suffix = params.stylePromptSuffix || defaultSuffix;
      const refinedPrompt = `${params.prompt}, ${suffix}`;
      let temporaryImageUrl: string | undefined;

      // Filter negative prompt yang menghormati elemen yang diizinkan blueprint
      const allowed = params.imageNegativeAllow || [];
      const negativeList = [
        'person in center',
        'human portrait in center',
        'floating body',
        'man in center',
        'double subject',
        'cropped head',
        'text',
        'words',
        'letters',
        'typography',
        'newspaper clippings',
        'headlines',
        'mastheads',
        'numbers',
        'logo',
        'emblem',
        'watermark',
        'signature',
        'cartoonish',
        'low quality',
        'oversaturated',
        'ui cards',
        'text boxes',
        'info cards',
        'rectangular overlays',
        'layout grids',
        'hex codes',
        'color swatches',
        'poster template',
        'graphic design layout',
        'labels',
        'captions',
        'gibberish text',
        'big bold headlines',
      ];
      if (!allowed.includes('banner')) negativeList.push('banner');
      if (!allowed.includes('frame')) negativeList.push('frame');
      if (!allowed.includes('border')) negativeList.push('border');

      const negativePrompt = negativeList.join(', ');

      // Jalur 1: Google AI Studio Multimodal Image Model (gemini-3.1-flash-image / Imagen via Developer API)
      const studioImageModel =
        process.env.GOOGLE_IMAGE_MODEL && !process.env.GOOGLE_IMAGE_MODEL.startsWith('imagen-')
          ? process.env.GOOGLE_IMAGE_MODEL
          : 'gemini-3.1-flash-image';

      try {
        const contentResponse = await this.client.models.generateContent({
          model: studioImageModel,
          contents: `${refinedPrompt}. Visual aspect ratio: ${aspectRatio}. Generate a pure, textless photograph or illustration artwork only. DO NOT design a poster, DO NOT draw any UI cards, boxes, frames, banners, or graphic layout templates, and DO NOT render any letters, words, numbers, or hex color codes anywhere in the image. Strict negative constraint: clean background, no text, no typography, no words, no human portrait in center, no double subjects.`,
        });

        const parts = contentResponse.candidates?.[0]?.content?.parts || [];
        for (const p of parts) {
          if (p.inlineData && p.inlineData.data) {
            const mime = p.inlineData.mimeType || 'image/jpeg';
            temporaryImageUrl = `data:${mime};base64,${p.inlineData.data}`;
            break;
          }
        }
      } catch (studioErr: any) {
        console.warn(
          `[GoogleImagenAdapter] Jalur AI Studio (${studioImageModel}) memberi sinyal: ${studioErr.message}. Beralih ke jalur Vertex Imagen...`
        );
      }

      // Jalur 2: Vertex AI Enterprise Imagen (imagen-3.0-generate-002 / imagen-4.0)
      if (!temporaryImageUrl) {
        const enterpriseModel =
          process.env.GOOGLE_IMAGE_MODEL && process.env.GOOGLE_IMAGE_MODEL.startsWith('imagen-')
            ? process.env.GOOGLE_IMAGE_MODEL
            : 'imagen-3.0-generate-002';

        const response = await this.client.models.generateImages({
          model: enterpriseModel,
          prompt: refinedPrompt,
          config: {
            numberOfImages: 1,
            aspectRatio: aspectRatio as any,
            outputMimeType: 'image/jpeg',
            negativePrompt,
          },
        });

        const generated = response.generatedImages?.[0];
        const imageBytes = generated?.image?.imageBytes;
        if (imageBytes) {
          temporaryImageUrl = `data:image/jpeg;base64,${imageBytes}`;
        }
      }

      if (!temporaryImageUrl) {
        throw new Error(
          'Google Imagen / Gemini AI tidak mengembalikan bytes gambar yang valid.'
        );
      }

      await telemetry.endTrace({
        inputTokens: 1000,
        outputTokens: 0,
        status: 'SUCCESS',
        outputPreview: {
          model: preferredModel,
          aspectRatio,
          dataUrlPrefix: temporaryImageUrl.slice(0, 50),
        },
      });

      return {
        temporaryImageUrl,
        canonicalTraceId: telemetry.canonicalTraceId,
      };
    } catch (error: any) {
      await telemetry.endTrace({
        inputTokens: 0,
        outputTokens: 0,
        status: 'FAILED',
        errorMessage: error.message || String(error),
      });

      throw new Error(
        `[GoogleImagenError] Gagal menghasilkan gambar Imagen 3: ${error.message || String(error)}`
      );
    }
  }

  /**
   * Jalur ART-COLLAGE: AI diizinkan (dan diminta) menggambar KARYA POSTER UTUH
   * (tekstur kertas, halftone cutout, sapuan kuas, sobekan) tanpa teks apa pun.
   * Berbeda dengan generateImage(), jalur ini TIDAK menambahkan "DO NOT design a poster"
   * dan bisa menerima gambar referensi gaya secara multimodal (Gemini image model).
   */
  public async generateArtCollage(params: {
    prompt: string;
    aspectRatio?: '4:5' | '1:1' | '9:16' | '3:4';
    tenantId?: string;
    styleReference?: { mimeType: string; base64: string };
  }): Promise<{ imageBuffer: Buffer; mimeType: string; provider: string; usedStyleReference: boolean }> {
    const apiKey =
      process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || process.env.GOOGLE_GENAI_API_KEY;
    if (!this.client && apiKey) this.client = new GoogleGenAI({ apiKey });
    if (!this.client) {
      throw new Error('[GoogleImagenAdapter] GEMINI_API_KEY belum disetel pada file environment (.env).');
    }

    const aspectRatio = params.aspectRatio || '4:5';
    const geminiModel = process.env.POSTER_COLLAGE_IMAGE_MODEL || 'gemini-3.1-flash-image';
    const telemetry = AiTelemetryService.startTrace({
      operation: 'art-collage-generation',
      model: geminiModel,
      tenantId: params.tenantId,
      metadata: { promptLength: params.prompt.length, withStyleReference: !!params.styleReference },
    });

    const decode = (dataB64: string, mime: string) => ({
      imageBuffer: Buffer.from(dataB64, 'base64'),
      mimeType: mime,
    });

    // Jalur 1: Gemini multimodal image (prompt + referensi gaya opsional)
    const tryGemini = async (withReference: boolean) => {
      const parts: any[] = [];
      if (withReference && params.styleReference) {
        parts.push({ inlineData: { mimeType: params.styleReference.mimeType, data: params.styleReference.base64 } });
      }
      parts.push({ text: params.prompt });
      const res = await this.client!.models.generateContent({
        model: geminiModel,
        contents: [{ role: 'user', parts }],
        config: { responseModalities: ['IMAGE'], imageConfig: { aspectRatio } } as any,
      });
      for (const p of res.candidates?.[0]?.content?.parts || []) {
        if (p.inlineData?.data) return decode(p.inlineData.data, p.inlineData.mimeType || 'image/png');
      }
      throw new Error('Gemini image tidak mengembalikan bytes gambar.');
    };

    try {
      let result: { imageBuffer: Buffer; mimeType: string } | undefined;
      let provider = geminiModel;
      let usedStyleReference = false;

      if (params.styleReference) {
        try {
          result = await tryGemini(true);
          usedStyleReference = true;
        } catch (err: any) {
          console.warn(`[GoogleImagenAdapter] Art-collage dengan referensi gagal (${err.message}); mencoba tanpa referensi.`);
        }
      }
      if (!result) {
        try {
          result = await tryGemini(false);
        } catch (err: any) {
          console.warn(`[GoogleImagenAdapter] Art-collage Gemini gagal (${err.message}); beralih ke Imagen.`);
        }
      }

      // Jalur 2: Imagen (tanpa referensi gambar); negative prompt hanya melarang teks & identitas
      if (!result) {
        provider = process.env.POSTER_COLLAGE_IMAGEN_MODEL || 'imagen-3.0-generate-002';
        const response = await this.client.models.generateImages({
          model: provider,
          prompt: params.prompt,
          config: {
            numberOfImages: 1,
            aspectRatio: aspectRatio as any,
            outputMimeType: 'image/png',
            negativePrompt:
              'text, letters, words, numbers, typography, captions, signage, labels, logo, emblem, watermark, signature, fake writing, gibberish text, politician, recognizable public figure',
          },
        });
        const bytes = response.generatedImages?.[0]?.image?.imageBytes;
        if (!bytes) throw new Error('Imagen tidak mengembalikan bytes gambar.');
        result = decode(bytes, 'image/png');
      }

      await telemetry.endTrace({
        inputTokens: 1000,
        outputTokens: 0,
        status: 'SUCCESS',
        outputPreview: { provider, usedStyleReference, bytes: result.imageBuffer.length },
      });
      return { ...result, provider, usedStyleReference };
    } catch (error: any) {
      await telemetry.endTrace({
        inputTokens: 0,
        outputTokens: 0,
        status: 'FAILED',
        errorMessage: error.message || String(error),
      });
      throw new Error(`[ArtCollageImageError] ${error.message || String(error)}`);
    }
  }
}

