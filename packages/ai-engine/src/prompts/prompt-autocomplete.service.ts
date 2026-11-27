import { getTextCompletionClient } from '../client.js';
import { AiTelemetryService } from '../telemetry/ai-telemetry.service.js';

export interface PromptAutocompleteParams {
  prefix: string;
  mode?: string;
  scope: 'B2B' | 'B2C';
  regionName?: string;
  unitName?: string;
  focusSectors?: string[];
  tenantId?: string;
  organizationId?: string;
  organizationUnitId?: string;
}

export interface PromptAutocompleteResult {
  completion: string;
  fullSuggestion: string;
}

/**
 * Shared Hybrid Smart Autocomplete Service untuk B2B dan B2C.
 * Menghasilkan sambungan kalimat pendek yang natural dengan model ringan (max_tokens: 45).
 */
export class PromptAutocompleteService {
  public static async complete(
    params: PromptAutocompleteParams
  ): Promise<PromptAutocompleteResult> {
    const rawPrefix = params.prefix || '';
    const trimmed = rawPrefix.trim();
    if (trimmed.length < 10) {
      return { completion: '', fullSuggestion: rawPrefix };
    }

    const { client, resolveModel } = getTextCompletionClient();
    const modelName = resolveModel('gpt-4o-mini', 'gemini-3.8-flash');
    const channel =
      params.scope === 'B2B' ? 'INSTITUTIONAL_WORKSPACE' : 'WEB_STUDIO';

    const telemetry = AiTelemetryService.startTrace({
      operation: 'prompt-autocomplete',
      model: modelName,
      tenantId: params.tenantId,
      organizationId: params.organizationId,
      organizationUnitId: params.organizationUnitId,
      channel,
      activityType: 'PROMPT_AUTOCOMPLETE',
      metadata: {
        scope: params.scope,
        mode: params.mode || 'AUTO',
        prefixLength: trimmed.length,
      },
    });

    const contextSummary = [
      params.regionName ? `Wilayah: ${params.regionName}` : '',
      params.unitName ? `Bidang/Unit: ${params.unitName}` : '',
      params.focusSectors && params.focusSectors.length > 0
        ? `Fokus: ${params.focusSectors.slice(0, 3).join(', ')}`
        : '',
      params.mode ? `Mode aktif: ${params.mode}` : '',
    ]
      .filter(Boolean)
      .join(' | ');

    const apiKey = process.env.OPENAI_API_KEY || '';
    const isMockKey =
      (!apiKey || apiKey.includes('sk-mock') || apiKey.length < 15) &&
      process.env.AI_USE_ROUTER !== 'true';

    if (isMockKey) {
      const regionPart = params.regionName ? ` di ${params.regionName}` : '';
      const unitPart = params.unitName ? ` untuk ${params.unitName}` : '';
      const needsSpace = !rawPrefix.endsWith(' ');
      const fallbackCompletion = `${needsSpace ? ' ' : ''}tentang prioritas program kerja dan serapan anggaran${regionPart}${unitPart} tahun berjalan.`;
      await telemetry.endTrace({ inputTokens: 0, outputTokens: 0, status: 'SUCCESS' });
      return {
        completion: fallbackCompletion,
        fullSuggestion: `${rawPrefix}${fallbackCompletion}`,
      };
    }

    try {
      const completionRes = await client.chat.completions.create({
        model: modelName,
        temperature: 0.45,
        max_tokens: 45,
        messages: [
          {
            role: 'system',
            content:
              `Anda adalah asisten pelengkap kalimat prompt berbahasa Indonesia untuk pimpinan/anggota DPRD.\n` +
              `Konteks: ${contextSummary || 'Ruang kerja parlemen Indonesia'}.\n` +
              `TUGAS: Lanjutkan potongan kalimat user menjadi 1 kalimat perintah yang spesifik, profesional, dan siap pakai (8-18 kata).\n` +
              `ATURAN KETAT:\n` +
              `1. Keluarkan HANYA teks sambungannya (lanjutan persis setelah huruf terakhir user). JANGAN ulangi teks awal user!\n` +
              `2. Jangan gunakan tanda kutip, bullet, atau penjelasan tambahan.\n` +
              `3. Sesuaikan dengan konteks wilayah/bidang jika relevan.`,
          },
          {
            role: 'user',
            content: rawPrefix,
          },
        ],
      });

      let suggestion = completionRes.choices[0]?.message?.content?.replace(/\r?\n/g, ' ') || '';
      // Hapus kutip luar jika model membungkusnya
      suggestion = suggestion.replace(/^["'`]+|["'`]+$/g, '');

      // Jika model tidak sengaja mengulang prefix user, potong bagian prefix-nya
      const lowerPrefix = rawPrefix.trimEnd().toLowerCase();
      if (suggestion.toLowerCase().startsWith(lowerPrefix)) {
        suggestion = suggestion.slice(rawPrefix.trimEnd().length);
      }

      // Pastikan spasi penghubung natural
      if (
        suggestion &&
        !rawPrefix.endsWith(' ') &&
        !/^[\s,.;:!?)]/.test(suggestion)
      ) {
        suggestion = ` ${suggestion}`;
      } else if (rawPrefix.endsWith(' ') && suggestion.startsWith(' ')) {
        suggestion = suggestion.trimStart();
      }

      await telemetry.endTrace({
        inputTokens: completionRes.usage?.prompt_tokens ?? 0,
        outputTokens: completionRes.usage?.completion_tokens ?? 0,
        status: 'SUCCESS',
        actualModel: completionRes.model || modelName,
      });

      return {
        completion: suggestion,
        fullSuggestion: `${rawPrefix}${suggestion}`,
      };
    } catch (err: any) {
      await telemetry.endTrace({
        inputTokens: 0,
        outputTokens: 0,
        status: 'FAILED',
        errorMessage: err?.message || 'Prompt autocomplete error',
      });
      return { completion: '', fullSuggestion: rawPrefix };
    }
  }
}
