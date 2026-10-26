import {
  ILLMProviderPort,
  GenerateArticleParams,
  GeneratedArticleResult,
  GeneratedSocialPackResult,
  GenerateCivicAnswerParams,
  GeneratePublicConciergeParams,
  GeneratedConciergeResult,
} from '@polaris/core-domain';
import { InfographicDataSpecDto } from '@polaris/shared-types';
import { openaiClient } from './client.js';
import { PromptTemplates } from './prompts.js';
import { PromptSanitizer } from './guardrails/prompt-sanitizer.js';
import { AiTelemetryService } from './telemetry/ai-telemetry.service.js';
import { TwoStageArticleEngine } from './two-stage-article.engine.js';
import {
  PosterBlueprintSelector,
  PosterPromptCompiler,
  CreativePosterArchetype,
  PreAnalyzedPosterBlueprint,
  CompiledPosterPrompt,
  ArtCollagePosterPipeline,
  ArtCollagePosterResult,
} from './creative-poster/index.js';
import { GoogleImagenAdapter } from './adapters/google-imagen.adapter.js';
import { getActiveImageProvider } from './config/image-provider.config.js';
import { MasterEditorialSanitizer } from './master-editorial-sanitizer.js';

export class OpenAIAIEngineAdapter implements ILLMProviderPort {
  private readonly googleImagenAdapter = new GoogleImagenAdapter();


  public async generatePublicConcierge(
    params: GeneratePublicConciergeParams
  ): Promise<GeneratedConciergeResult> {
    const inspection = PromptSanitizer.inspect(params.userMessage);

    // Jika tertolak oleh pre-inference guardrail, catat sebagai REFUSAL (0 token, 0 cost)
    if (!inspection.isValid) {
      const telemetry = AiTelemetryService.startTrace({
        operation: 'public-concierge-chat',
        model: 'heuristic-guardrail',
        metadata: { rejectionReason: inspection.rejectionReason },
      });

      await telemetry.endTrace({
        inputTokens: 0,
        outputTokens: 0,
        status: 'REFUSAL',
        errorMessage: inspection.rejectionReason,
        outputPreview: inspection.preBakedReply,
      });

      return {
        reply: inspection.preBakedReply || 'Pertanyaan tidak dapat diproses.',
        suggestedAction: inspection.suggestedAction,
        isSafeRefusal: true,
        tokensUsed: 0,
        canonicalTraceId: telemetry.canonicalTraceId,
      };
    }

    const telemetry = AiTelemetryService.startTrace({
      operation: 'public-concierge-chat',
      model: 'gpt-4o-mini',
      metadata: { rawInputLength: params.userMessage.length },
    });

    try {
      const historyContext = (params.history || [])
        .slice(-3)
        .map((h) => `${h.role === 'user' ? 'Pengunjung' : 'Asisten'}: ${h.content.slice(0, 150)}`)
        .join('\n');

      const systemPrompt = PromptTemplates.getPublicConciergePrompt(
        inspection.sanitizedText,
        historyContext
      );

      const response = await openaiClient.chat.completions.create({
        model: 'gpt-4o-mini',
        temperature: 0.25,
        max_tokens: 300,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: inspection.sanitizedText },
        ],
      });

      const reply = response.choices[0]?.message?.content?.trim() || '';
      const inputTokens = response.usage?.prompt_tokens || 0;
      const outputTokens = response.usage?.completion_tokens || 0;

      const isRefusal = reply.toLowerCase().includes('hanya dapat membantu menjawab pertanyaan seputar') ||
                        reply.toLowerCase().includes('diprogram khusus untuk memberikan informasi seputar');

      await telemetry.endTrace({
        inputTokens,
        outputTokens,
        status: isRefusal ? 'REFUSAL' : 'SUCCESS',
        outputPreview: reply,
      });

      return {
        reply,
        suggestedAction: inspection.suggestedAction,
        isSafeRefusal: isRefusal,
        tokensUsed: inputTokens + outputTokens,
        canonicalTraceId: telemetry.canonicalTraceId,
      };
    } catch (error: any) {
      await telemetry.endTrace({
        inputTokens: 0,
        outputTokens: 0,
        status: 'FAILED',
        errorMessage: error.message,
      });

      return {
        reply: 'Mohon maaf, sistem asisten POLARIS sedang mengalami antrean jaringan. Silakan segarkan halaman.',
        suggestedAction: 'NONE',
        isSafeRefusal: true,
        tokensUsed: 0,
        canonicalTraceId: telemetry.canonicalTraceId,
      };
    }
  }

  public async generateArticle(params: GenerateArticleParams): Promise<GeneratedArticleResult> {
    return TwoStageArticleEngine.execute(params);
  }

  public async generateDalleImage(
    englishPrompt: string,
    tenantId?: string,
    size: '1024x1792' | '1024x1024' | '1792x1024' = '1024x1792'
  ): Promise<{ temporaryImageUrl: string; canonicalTraceId: string }> {
    const preferredModel = process.env.OPENAI_IMAGE_MODEL || 'chatgpt-image-latest';

    const telemetry = AiTelemetryService.startTrace({
      operation: 'dalle-image-generation',
      model: preferredModel,
      tenantId,
      metadata: { promptLength: englishPrompt.length, requestedSize: size },
    });

    // Urutan model yang dicoba secara adaptif jika model utama tidak tersedia pada API key
    const candidateModels = [preferredModel];
    if (preferredModel !== 'chatgpt-image-latest') {
      candidateModels.push('chatgpt-image-latest');
    }
    if (preferredModel !== 'dall-e-3') {
      candidateModels.push('dall-e-3');
    }

    let lastError: Error | null = null;
    let activeModel = preferredModel;

    for (const modelToTry of candidateModels) {
      try {
        activeModel = modelToTry;

        // Pemetaan dimensi yang didukung oleh masing-masing model
        let resolvedSize: any = size;
        if (modelToTry === 'chatgpt-image-latest') {
          if (size === '1024x1792') {
            resolvedSize = '1024x1536'; // Rasio tegak portrait poster didukung oleh chatgpt-image-latest
          } else if (size === '1792x1024') {
            resolvedSize = '1536x1024'; // Rasio lanskap didukung oleh chatgpt-image-latest
          } else {
            resolvedSize = '1024x1024';
          }
        }

        const requestParams: any = {
          model: modelToTry,
          prompt: englishPrompt,
          size: resolvedSize,
          n: 1,
        };

        // dall-e-3 mendukung opsi quality, chatgpt-image-latest menentukan kualitas secara dinamis
        if (modelToTry === 'dall-e-3') {
          requestParams.quality = 'standard';
        }

        const response = await openaiClient.images.generate(requestParams);
        const first = response.data?.[0];

        let temporaryImageUrl: string | undefined;
        if (first?.url) {
          temporaryImageUrl = first.url;
        } else if (first?.b64_json) {
          temporaryImageUrl = `data:image/png;base64,${first.b64_json}`;
        }

        if (!temporaryImageUrl) {
          throw new Error('AI Generator tidak mengembalikan URL atau data gambar yang valid.');
        }

        await telemetry.endTrace({
          inputTokens: 1000,
          outputTokens: 0,
          status: 'SUCCESS',
          outputPreview: { temporaryImageUrl: temporaryImageUrl.slice(0, 100), model: activeModel },
        });

        return {
          temporaryImageUrl,
          canonicalTraceId: telemetry.canonicalTraceId,
        };
      } catch (err: any) {
        lastError = err;
        console.warn(`[AIEngineAdapter] Model gambar '${modelToTry}' gagal: ${err.message}. Mencoba fallback berikutnya...`);
        // Jika error adalah model does not exist atau izin model, lanjutkan ke model berikutnya di loop
      }
    }

    const finalErrorMessage = lastError ? lastError.message : 'Semua model gambar gagal diinisialisasi.';
    await telemetry.endTrace({
      inputTokens: 0,
      outputTokens: 0,
      status: 'FAILED',
      errorMessage: finalErrorMessage,
    });

    throw new Error(`[AIEngineDalleError] Gagal me-render poster DALL-E: ${finalErrorMessage}`);
  }

  /**
   * Menghasilkan kanvas dasar menggunakan Google Imagen 3 (native 4:5 + negative prompt)
   */
  public async generateGoogleImagen(params: {
    prompt: string;
    aspectRatio?: '4:5' | '1:1' | '16:9' | '9:16' | '3:4' | '4:3';
    tenantId?: string;
    stylePromptSuffix?: string;
    imageNegativeAllow?: string[];
  }): Promise<{ temporaryImageUrl: string; canonicalTraceId: string }> {
    return await this.googleImagenAdapter.generateImage(params);
  }

  /**
   * generateCreativePosterBackground memilih template secara Constrained RNG,
   * mengompilasi prompt fotografi clean-art tanpa teks, dan menghasilkan background AI
   * menggunakan provider aktif (Google Imagen 3 atau OpenAI DALL-E) dengan failover otomatis.
   */
  public async generateCreativePosterBackground(params: {
    topic: string;
    groundedContextSummary?: string;
    compositionMode?: import('./creative-poster/types.js').SubjectCompositionMode;
    forcedArchetype?: CreativePosterArchetype;
    excludeBlueprintId?: string;
    tenantBrandHex?: string;
    tenantId?: string;
  }): Promise<{
    temporaryImageUrl: string;
    blueprint: PreAnalyzedPosterBlueprint;
    compiledPrompt: CompiledPosterPrompt;
    canonicalTraceId: string;
  }> {
    const blueprint = await PosterBlueprintSelector.selectBestBlueprintAsync({
      topic: params.topic,
      forcedArchetype: params.forcedArchetype,
      excludeBlueprintId: params.excludeBlueprintId,
      forcedBrandHex: params.tenantBrandHex,
    });

    const activeProvider = getActiveImageProvider();

    const compiledPrompt = await PosterPromptCompiler.compileScenePrompt({
      topic: params.topic,
      groundedContextSummary: params.groundedContextSummary,
      compositionMode: params.compositionMode,
      blueprint,
      tenantBrandHex: params.tenantBrandHex,
      imageProvider: activeProvider,
    });

    const targetSize =
      compiledPrompt.aspectRatio === '9:16' || compiledPrompt.aspectRatio === '4:5'
        ? '1024x1792'
        : '1024x1024';

    let imageResult: { temporaryImageUrl: string; canonicalTraceId: string };

    if (activeProvider === 'GOOGLE_IMAGEN') {
      try {
        console.log(
          `[AIEngineAdapter] Menghasilkan kanvas seni Layer 1 via Google Imagen 3 (aspek rasio: ${compiledPrompt.aspectRatio || '4:5'})...`
        );
        imageResult = await this.generateGoogleImagen({
          prompt: compiledPrompt.englishPrompt,
          aspectRatio: (compiledPrompt.aspectRatio as any) || '4:5',
          tenantId: params.tenantId,
          stylePromptSuffix: blueprint.scenePromptHint
            ? PosterPromptCompiler.sanitizeImageGenerationPrompt(blueprint.scenePromptHint)
            : undefined,
          imageNegativeAllow: blueprint.fixedConstraints?.imageNegativeAllow,
        });
      } catch (googleError: any) {
        console.warn(
          `[AIEngineAdapter] Google Imagen 3 gagal (${googleError.message}). Mengaktifkan failover otomatis ke OpenAI DALL-E...`
        );
        imageResult = await this.generateDalleImage(
          compiledPrompt.englishPrompt,
          params.tenantId,
          targetSize
        );
      }
    } else {
      console.log(
        `[AIEngineAdapter] Menghasilkan kanvas seni Layer 1 via OpenAI DALL-E (target size: ${targetSize})...`
      );
      imageResult = await this.generateDalleImage(
        compiledPrompt.englishPrompt,
        params.tenantId,
        targetSize
      );
    }

    return {
      temporaryImageUrl: imageResult.temporaryImageUrl,
      blueprint,
      compiledPrompt,
      canonicalTraceId: imageResult.canonicalTraceId,
    };
  }

  /**
   * Pipeline Baru: ART-COLLAGE POSTER GENERATION
   * Alur: AI Copywriter (teks) + AI Image (kolase seni utuh) -> AI Vision Layout Locator
   *       -> Satori Zero-Box (transparan, tanpa kotak) -> Sharp Ink-Blend.
   */
  public async generateArtCollagePoster(params: {
    topic: string;
    groundedContextSummary?: string;
    forcedArchetype?: CreativePosterArchetype;
    excludeBlueprintId?: string;
    tenantBrandHex?: string;
    tenantId?: string;
    variationKey?: string;
  }): Promise<ArtCollagePosterResult> {
    return ArtCollagePosterPipeline.generate(params);
  }

  public async generateCivicAnswer(
    params: GenerateCivicAnswerParams
  ): Promise<{ answer: string; canonicalTraceId: string }> {
    const telemetry = AiTelemetryService.startTrace({
      operation: 'generate-civic-answer-grounded',
      model: 'gpt-4o-mini',
      tenantId: params.tenantId,
      metadata: { representative: params.representativeName, dapil: params.dapilName },
    });

    try {
      const systemPrompt = PromptTemplates.getCivicAssistantPrompt(
        params.groundedRegulations,
        params.representativeName,
        params.partyAffiliation,
        params.dapilName
      );

      const response = await openaiClient.chat.completions.create({
        model: 'gpt-4o-mini',
        temperature: 0.2,
        max_tokens: 300,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: params.citizenQuestion },
        ],
      });

      const answer = response.choices[0]?.message?.content?.trim() || '';
      const inputTokens = response.usage?.prompt_tokens || 0;
      const outputTokens = response.usage?.completion_tokens || 0;

      await telemetry.endTrace({
        inputTokens,
        outputTokens,
        status: 'SUCCESS',
        outputPreview: answer,
      });

      return {
        answer,
        canonicalTraceId: telemetry.canonicalTraceId,
      };
    } catch (error: any) {
      await telemetry.endTrace({
        inputTokens: 0,
        outputTokens: 0,
        status: 'FAILED',
        errorMessage: error.message,
      });

      throw new Error(`[AIEngineCivicAnswerError] Gagal menyusun respon warga: ${error.message}`);
    }
  }

  public async generateEmbedding(
    text: string,
    tenantId?: string
  ): Promise<{ embedding: number[]; canonicalTraceId: string }> {
    const cleanText = text.trim();
    if (!cleanText) {
      throw new Error('[EmbeddingError] Teks input untuk embedding tidak boleh kosong.');
    }

    const telemetry = AiTelemetryService.startTrace({
      operation: 'text-embedding-rag',
      model: 'text-embedding-3-small',
      tenantId,
      metadata: { textLength: cleanText.length },
    });

    try {
      const response = await openaiClient.embeddings.create({
        model: 'text-embedding-3-small',
        input: cleanText,
      });

      const embedding = response.data[0]?.embedding;
      if (!embedding || embedding.length !== 1536) {
        throw new Error('Dimensi embedding yang dikembalikan tidak sesuai.');
      }

      await telemetry.endTrace({
        inputTokens: response.usage.total_tokens,
        outputTokens: 0,
        status: 'SUCCESS',
        outputPreview: { dimensions: embedding.length },
      });

      return {
        embedding,
        canonicalTraceId: telemetry.canonicalTraceId,
      };
    } catch (error: any) {
      await telemetry.endTrace({
        inputTokens: 0,
        outputTokens: 0,
        status: 'FAILED',
        errorMessage: error.message,
      });

      throw new Error(`[AIEngineEmbeddingError] Gagal menghasilkan embedding: ${error.message}`);
    }
  }

  public async generateInfographicSpec(articleContent: string, tenantId?: string): Promise<InfographicDataSpecDto> {
    const response = await openaiClient.chat.completions.create({
      model: 'gpt-4o-mini',
      temperature: 0.2,
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: PromptTemplates.getInfographicSystemPrompt() },
        { role: 'user', content: `Artikel rujukan:\n\n${articleContent}` },
      ],
    });

    return JSON.parse(response.choices[0]?.message?.content || '{}');
  }

  public async generateDallePrompt(infographicSpec: InfographicDataSpecDto): Promise<string> {
    return PromptTemplates.getDalleVisualPrompt(infographicSpec.headline, infographicSpec.policyTakeaway);
  }

  public async generateSocialSnippets(articleContent: string): Promise<GeneratedSocialPackResult> {
    const response = await openaiClient.chat.completions.create({
      model: 'gpt-4o-mini',
      temperature: 0.4,
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: PromptTemplates.getSocialSnippetSystemPrompt() },
        { role: 'user', content: `Artikel rujukan:\n\n${articleContent}` },
      ],
    });

    const parsed = JSON.parse(response.choices[0]?.message?.content || '{}') as GeneratedSocialPackResult;
    return {
      instagramCaption: MasterEditorialSanitizer.sanitize(parsed.instagramCaption || ''),
      twitterThreads: (parsed.twitterThreads || []).map((t) =>
        MasterEditorialSanitizer.sanitize(t || '')
      ),
      whatsappBroadcast: MasterEditorialSanitizer.sanitize(parsed.whatsappBroadcast || ''),
    };
  }

  public async performVisionOCR(params: {
    base64Data: string;
    mimeType: string;
    fileName: string;
  }): Promise<string> {
    const imageUrl = params.base64Data.startsWith('data:')
      ? params.base64Data
      : `data:${params.mimeType};base64,${params.base64Data}`;

    const response = await openaiClient.chat.completions.create({
      model: 'gpt-4o',
      temperature: 0.1,
      max_tokens: 2000,
      messages: [
        {
          role: 'system',
          content: 'Ekstrak seluruh teks dan data tabel dari dokumen lampiran ke dalam format Markdown rapi.',
        },
        {
          role: 'user',
          content: [
            { type: 'text', text: `Transkripsikan isi dokumen "${params.fileName}":` },
            { type: 'image_url', image_url: { url: imageUrl, detail: 'high' } },
          ],
        },
      ],
    });

    return response.choices[0]?.message?.content || 'Tidak ada teks yang terdeteksi.';
  }
}
