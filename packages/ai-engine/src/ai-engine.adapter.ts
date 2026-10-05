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

export class OpenAIAIEngineAdapter implements ILLMProviderPort {

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
        temperature: 0.1,
        max_tokens: 220,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: inspection.sanitizedText },
        ],
      });

      const reply = response.choices[0]?.message?.content?.trim() || '';
      const inputTokens = response.usage?.prompt_tokens || 0;
      const outputTokens = response.usage?.completion_tokens || 0;

      const isRefusal = reply.toLowerCase().includes('hanya dapat membantu menjawab pertanyaan seputar') ||
                        reply.toLowerCase().includes('mohon maaf');

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
    const telemetry = AiTelemetryService.startTrace({
      operation: 'generate-parliamentary-article-3000w',
      model: 'gpt-4o',
      tenantId: params.tenantId,
      metadata: { topic: params.topic, targetAudience: params.targetAudience },
    });

    const userPrompt = `TOPIK ANALISIS KEBIJAKAN: "${params.topic}"
${params.targetAudience ? `TARGET AUDIENS: ${params.targetAudience}` : ''}

${params.regionalContextData}
${params.comparisonContextData ? `\nDATA KOMPARASI: ${params.comparisonContextData}` : ''}
${params.memberWritingStyleSample ? `\nSAMPEL GAYA BAHASA: ${params.memberWritingStyleSample}` : ''}

Instruksikan: Susun artikel utuh, kaya data, kutip pasal yang tersedia, dan capai kedalaman analisis teknokratis setara kajian 3.000 kata.
Keluarkan hasil dalam format JSON:
{
  "title": "Judul Artikel",
  "excerpt": "Ringkasan Eksekutif 2 Kalimat",
  "contentMarkdown": "Isi lengkap artikel berformat Markdown..."
}`;

    try {
      const response = await openaiClient.chat.completions.create({
        model: 'gpt-4o',
        temperature: 0.3,
        response_format: { type: 'json_object' },
        messages: [
          { role: 'system', content: PromptTemplates.getArticleSystemPrompt() },
          { role: 'user', content: userPrompt },
        ],
      });

      const messageContent = response.choices[0]?.message?.content || '{}';
      const parsed = JSON.parse(messageContent);
      const inputTokens = response.usage?.prompt_tokens || 0;
      const outputTokens = response.usage?.completion_tokens || 0;
      const wordCount = (parsed.contentMarkdown || '').split(/\s+/).filter(Boolean).length;

      await telemetry.endTrace({
        inputTokens,
        outputTokens,
        status: 'SUCCESS',
        outputPreview: { title: parsed.title, wordCount },
      });

      return {
        title: parsed.title || params.topic,
        excerpt: parsed.excerpt || '',
        contentMarkdown: parsed.contentMarkdown || '',
        wordCount,
        totalTokensUsed: inputTokens + outputTokens,
        canonicalTraceId: telemetry.canonicalTraceId,
      };
    } catch (error: any) {
      await telemetry.endTrace({
        inputTokens: 0,
        outputTokens: 0,
        status: 'FAILED',
        errorMessage: error.message,
      });

      throw new Error(`[AIEngineArticleError] Gagal menghasilkan artikel: ${error.message}`);
    }
  }

  public async generateDalleImage(
    englishPrompt: string,
    tenantId?: string
  ): Promise<{ temporaryImageUrl: string; canonicalTraceId: string }> {
    const telemetry = AiTelemetryService.startTrace({
      operation: 'dalle-image-generation',
      model: 'dall-e-3',
      tenantId,
      metadata: { promptLength: englishPrompt.length },
    });

    try {
      const response = await openaiClient.images.generate({
        model: 'dall-e-3',
        prompt: englishPrompt,
        size: '1024x1792',
        quality: 'standard',
        n: 1,
      });

      const temporaryImageUrl = response.data?.[0]?.url;
      if (!temporaryImageUrl) {
        throw new Error('DALL-E tidak mengembalikan URL gambar yang valid.');
      }

      await telemetry.endTrace({
        inputTokens: 1000, // Alokasi perkiraan ekuivalensi token visual
        outputTokens: 0,
        status: 'SUCCESS',
        outputPreview: { temporaryImageUrl },
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
        errorMessage: error.message,
      });

      throw new Error(`[AIEngineDalleError] Gagal me-render poster DALL-E: ${error.message}`);
    }
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

    return JSON.parse(response.choices[0]?.message?.content || '{}');
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
