import { GoogleGenAI } from '@google/genai';
import { googleGenAiClient } from '../client.js';
import { AiTelemetryService } from '../telemetry/ai-telemetry.service.js';

export interface GenerateGoogleImagenParams {
  prompt: string;
  aspectRatio?: '4:5' | '1:1' | '16:9' | '9:16' | '3:4' | '4:3';
  tenantId?: string;
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
      // Prompt conditioning untuk estetika editorial dokumen civic POLARIS
      const refinedPrompt = `${params.prompt}, atmospheric 35mm archival photography, editorial lighting, cinematic texture, high visual depth, clean empty negative space`;

      const response = await this.client.models.generateImages({
        model: preferredModel,
        prompt: refinedPrompt,
        config: {
          numberOfImages: 1,
          aspectRatio: aspectRatio as any,
          outputMimeType: 'image/jpeg',
          // Native negative prompt mutlak untuk menjamin kanvas bersih bebas polusi teks
          negativePrompt:
            'text, words, letters, typography, newspaper clippings, headlines, mastheads, numbers, logo, emblem, watermark, signature, banner, frame, border, cartoonish, low quality, oversaturated',
        },
      });

      const generated = response.generatedImages?.[0];
      const imageBytes = generated?.image?.imageBytes;

      if (!imageBytes) {
        throw new Error(
          'Google Imagen 3 tidak mengembalikan bytes gambar yang valid.'
        );
      }

      const temporaryImageUrl = `data:image/jpeg;base64,${imageBytes}`;

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
}
