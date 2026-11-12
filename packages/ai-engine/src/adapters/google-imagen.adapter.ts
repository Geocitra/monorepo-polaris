import { GoogleGenAI } from '@google/genai';
import {
  googleGenAiClient,
  createGoogleGenAiClient,
  routerClient,
  normalizeGeminiModel,
  isRouterEnabled,
} from '../client.js';
import { AiTelemetryService } from '../telemetry/ai-telemetry.service.js';
import { sanitizeImageGenerationPrompt } from '../creative-poster/prompt-compiler.js';

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
      this.client = createGoogleGenAiClient(apiKey);
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
    if (!this.client) {
      this.client = googleGenAiClient;
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
      // Prompt conditioning adaptif sesuai gaya blueprint yang disanitasi
      const defaultSuffix = 'editorial lighting, authentic atmosphere, high visual depth, clean empty negative space';
      const rawSuffix = params.stylePromptSuffix || defaultSuffix;
      const suffix = sanitizeImageGenerationPrompt(rawSuffix);
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

      // Jalur Eksklusif: 9Router Images Generations API (TIDAK BOLEH OpenAI)
      const studioImageModel =
        process.env.GOOGLE_IMAGE_MODEL && !process.env.GOOGLE_IMAGE_MODEL.startsWith('imagen-')
          ? process.env.GOOGLE_IMAGE_MODEL
          : 'ag/gemini-3.1-flash-image';

      if (isRouterEnabled && routerClient) {
        try {
          const routerImageModel = normalizeGeminiModel(studioImageModel);
          console.log(`[GoogleImagenAdapter] Menghasilkan kanvas dasar via 9Router (${routerImageModel})...`);
          const routerRes = await routerClient.images.generate({
            model: routerImageModel,
            prompt: `${refinedPrompt}. Strict negative constraint: clean background, no text, no typography.`,
          });
          const b64 = routerRes.data?.[0]?.b64_json;
          if (b64) {
            temporaryImageUrl = `data:image/jpeg;base64,${b64}`;
          }
        } catch (routerErr: any) {
          console.error(
            `[GoogleImagenAdapter] 9Router image generation gagal: ${routerErr.message}`
          );
          throw new Error(
            `[9RouterImageError] Gagal generate gambar via 9Router (${studioImageModel}): ${routerErr.message}`
          );
        }
      } else {
        throw new Error(
          '[GoogleImagenAdapter] 9Router tidak aktif atau routerClient tidak tersedia. Pembuatan gambar hanya diizinkan via 9Router.'
        );
      }

      if (!temporaryImageUrl) {
        throw new Error(
          '9Router tidak mengembalikan data gambar yang valid.'
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
    if (!this.client) {
      this.client = googleGenAiClient;
    }

    const aspectRatio = params.aspectRatio || '4:5';
    const geminiModel = normalizeGeminiModel(
      process.env.POSTER_COLLAGE_IMAGE_MODEL || 'gemini-3.1-flash-image'
    );
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

    try {
      let result: { imageBuffer: Buffer; mimeType: string } | undefined;
      let provider = geminiModel;
      let usedStyleReference = false;

      // Jalur Eksklusif: 9Router Images Generations API (Dilarang OpenAI)
      if (routerClient) {
        try {
          console.log(`[GoogleImagenAdapter] Render kanvas art-collage via 9Router (${geminiModel})...`);
          const routerRes = await routerClient.images.generate({
            model: geminiModel,
            prompt: `CRITICAL INSTRUCTION: Do NOT render any text, words, letters, signatures, numbers, typography, headings, or captions anywhere on this image canvas. DO NOT draw any frosted glass cards, blur rectangles, UI boxes, empty capsules, blank pillar shapes, timeline bars with dots, flowchart containers, blank chalkboards, or fake QR codes. DO NOT draw cartoons, anime, 3D CGI renders, vector clipart, sketches, or drawings.
CRITICAL FULL-BLEED ZERO-MOCKUP MANDATE: The composition MUST BE 100% FULL BLEED EDGE-TO-EDGE across the entire image frame. ABSOLUTELY ZERO white borders, ZERO white padding, ZERO outer margins, ZERO surrounding white frame, ZERO drop shadow canvas edges, and ZERO poster mockup perspective! DO NOT draw a sheet of paper lying on a white background, desk, or studio table! The background paper texture (#F8F6F0) and the deep crimson red wave (#991B1B) must bleed all the way to the absolute pixel edges of the image (coordinates 0,0 to 100%,100%) without any surrounding white border or desk! The clearing area must remain completely flat, plain, and clean.\n\n${params.prompt}`,
          });
          const b64 = routerRes.data?.[0]?.b64_json;
          if (b64) {
            result = decode(b64, 'image/jpeg');
            provider = `9router:${geminiModel}`;
            console.log('[GoogleImagenAdapter] Sukses generate kanvas melalui 9Router!');
          }
        } catch (routerErr: any) {
          console.error(
            `[GoogleImagenAdapter] 9Router image model (${geminiModel}) gagal: ${routerErr.message}`
          );
          throw new Error(
            `[ArtCollageImageError] 9Router image generation gagal (${geminiModel}): ${routerErr.message}`
          );
        }
      } else {
        throw new Error(
          '[GoogleImagenAdapter] 9Router client tidak tersedia. Image generation hanya diizinkan via 9Router.'
        );
      }

      if (!result) {
        throw new Error('9Router gagal mengembalikan kanvas gambar yang valid.');
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

