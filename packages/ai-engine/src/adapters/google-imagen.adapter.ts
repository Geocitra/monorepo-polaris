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
  operatorId?: string;
  publicationId?: string;
  channel?: string;
  activityType?: string;
  requestId?: string;
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
      operatorId: params.operatorId,
      publicationId: params.publicationId,
      channel: params.channel || 'WEB_STUDIO',
      activityType: params.activityType || 'STUDIO_INFOGRAPHIC_GENERATION',
      requestId: params.requestId,
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

      const rawStudioModel =
        process.env.GOOGLE_IMAGE_MODEL && !process.env.GOOGLE_IMAGE_MODEL.startsWith('imagen-')
          ? process.env.GOOGLE_IMAGE_MODEL
          : 'gemini-3.1-flash-image';
      const studioImageModel = normalizeGeminiModel(rawStudioModel);

      let activeModel = preferredModel;
      let usageTokens = { inputTokens: 0, outputTokens: 0 };

      if (isRouterEnabled && routerClient) {
        try {
          activeModel = studioImageModel;
          console.log(`[GoogleImagenAdapter] Menghasilkan kanvas dasar via 9Router (${studioImageModel})...`);
          const routerRes = await routerClient.images.generate({
            model: studioImageModel,
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
        if (!this.client) {
          throw new Error(
            '[GoogleImagenAdapter] GEMINI_API_KEY tidak tersedia untuk generate gambar via Google Gemini.'
          );
        }

        // Selaraskan larangan Jalur 1 agar menghormati elemen yang diizinkan (allowed: banner, frame, border)
        const forbiddenLayoutTerms = ['UI cards', 'boxes', 'graphic layout templates'];
        if (!allowed.includes('frame')) forbiddenLayoutTerms.push('frames');
        if (!allowed.includes('banner')) forbiddenLayoutTerms.push('banners');
        if (!allowed.includes('border')) forbiddenLayoutTerms.push('borders');
        const forbiddenLayoutStr = forbiddenLayoutTerms.join(', ');

        // Jalur 1: Gemini AI Studio Image Generation
        try {
          activeModel = studioImageModel;
          const contentResponse = await this.client.models.generateContent({
            model: studioImageModel,
            contents: `${refinedPrompt}. Visual aspect ratio: ${aspectRatio}. Generate a pure, textless photograph or illustration artwork only. DO NOT design a poster, DO NOT draw any ${forbiddenLayoutStr}, and DO NOT render any letters, words, numbers, or hex color codes anywhere in the image. Strict negative constraint: clean background, no text, no typography, no words, no human portrait in center, no double subjects.`,
          });
          usageTokens = AiTelemetryService.extractGeminiUsage(contentResponse, refinedPrompt);

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

          activeModel = enterpriseModel;
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
      }

      if (!temporaryImageUrl) {
        throw new Error(
          'Google Imagen / Gemini tidak mengembalikan data gambar yang valid.'
        );
      }

      await telemetry.endTrace({
        inputTokens: usageTokens.inputTokens,
        outputTokens: usageTokens.outputTokens,
        status: 'SUCCESS',
        actualModel: activeModel,
        imageCalls: 1,
        outputPreview: {
          model: activeModel,
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

    let usageTokens = { inputTokens: 0, outputTokens: 0 };

    const artCollageGuardrailPrefix = [
      'CRITICAL TEXTLESS & FULL-BLEED MANDATE: Do NOT render any text, words, letters, signatures, numbers, typography, headings, captions, logos, or watermarks anywhere on this canvas.',
      'DO NOT draw fake UI boxes, empty frosted glass rectangles, blank flowchart containers, or fake QR codes.',
      'The artwork MUST be 100% full-bleed edge-to-edge across the entire frame (0,0 to 100%,100%) with ZERO outer mockup margins, ZERO studio desk background, and ZERO perspective frame.',
      'Follow the exact artistic medium, texture, collage/cutout treatment, color palette, and negative-space clearing specified below:',
    ].join(' ');

    // Jalur Production: Gemini multimodal image langsung (prompt + referensi gaya opsional)
    const tryGemini = async (withReference: boolean) => {
      if (!this.client) {
        throw new Error('[GoogleImagenAdapter] GEMINI_API_KEY tidak tersedia untuk generate art-collage.');
      }
      const parts: any[] = [];
      if (withReference && params.styleReference) {
        parts.push({ inlineData: { mimeType: params.styleReference.mimeType, data: params.styleReference.base64 } });
      }
      parts.push({
        text: `${artCollageGuardrailPrefix}\n\n${params.prompt}`,
      });
      const res = await this.client.models.generateContent({
        model: geminiModel,
        contents: [{ role: 'user', parts }],
        config: { responseModalities: ['IMAGE'], imageConfig: { aspectRatio } } as any,
      });
      usageTokens = AiTelemetryService.extractGeminiUsage(res, params.prompt);
      for (const p of res.candidates?.[0]?.content?.parts || []) {
        if (p.inlineData?.data) return decode(p.inlineData.data, p.inlineData.mimeType || 'image/png');
      }
      throw new Error('Gemini image tidak mengembalikan bytes gambar.');
    };

    try {
      let result: { imageBuffer: Buffer; mimeType: string } | undefined;
      let provider = geminiModel;
      let usedStyleReference = false;

      if (isRouterEnabled && routerClient) {
        try {
          console.log(`[GoogleImagenAdapter] Render kanvas art-collage via 9Router (${geminiModel})...`);
          const routerRes = await routerClient.images.generate({
            model: geminiModel,
            prompt: `${artCollageGuardrailPrefix}\n\n${params.prompt}`,
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
        if (params.styleReference) {
          try {
            result = await tryGemini(true);
            usedStyleReference = true;
          } catch (refErr: any) {
            console.warn(`[GoogleImagenAdapter] Gemini multimodal dengan styleReference gagal (${refErr.message}), mencoba tanpa referensi...`);
            result = await tryGemini(false);
          }
        } else {
          result = await tryGemini(false);
        }
      }

      if (!result) {
        throw new Error('Gemini / 9Router gagal mengembalikan kanvas gambar yang valid.');
      }

      await telemetry.endTrace({
        inputTokens: usageTokens.inputTokens,
        outputTokens: usageTokens.outputTokens,
        status: 'SUCCESS',
        actualModel: provider,
        imageCalls: 1,
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
