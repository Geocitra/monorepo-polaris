import * as crypto from 'crypto';
import { db, aiTraceLogs } from '@polaris/database';
import { AiCostCalculator } from '@polaris/core-domain';
import { langfuseClient } from '../client.js';

export interface StartTelemetryParams {
  operation: string;
  model: string;
  tenantId?: string;
  metadata?: Record<string, any>;
}

export interface EndTelemetryParams {
  inputTokens: number;
  outputTokens: number;
  status: 'SUCCESS' | 'FAILED' | 'REFUSAL';
  errorMessage?: string;
  outputPreview?: any;
}

export class AiTelemetryService {
  /**
   * Menghasilkan Canonical Trace ID berstandar OpenTelemetry
   * Format: tr_[timestamp]_[8_char_random_hex]
   */
  public static generateCanonicalTraceId(): string {
    const timestamp = Date.now();
    const entropy = crypto.randomBytes(4).toString('hex');
    return `tr_${timestamp}_${entropy}`;
  }

  /**
   * Memulai session trace ganda (Langfuse SDK + In-Memory Timer)
   */
  public static startTrace(params: StartTelemetryParams): {
    canonicalTraceId: string;
    startTime: number;
    endTrace: (endParams: EndTelemetryParams) => Promise<void>;
  } {
    const canonicalTraceId = this.generateCanonicalTraceId();
    const startTime = Date.now();

    // 1. Inisialisasi SDK Langfuse Cloud dengan Trace ID yang identik
    let langfuseTrace: any = null;
    let generationSpan: any = null;
    try {
      langfuseTrace = langfuseClient.trace({
        id: canonicalTraceId,
        name: params.operation,
        userId: params.tenantId || 'PUBLIC_VISITOR',
        metadata: {
          ...params.metadata,
          canonicalTraceId,
          environment: process.env.NODE_ENV || 'production',
        },
      });

      generationSpan = langfuseTrace.generation({
        name: `${params.model}-generation`,
        model: params.model,
        input: params.metadata?.inputPrompt || 'Structured Prompt',
      });
    } catch (lfErr: any) {
      console.warn(`[AiTelemetryWarning] Gagal inisialisasi Langfuse trace: ${lfErr?.message}`);
    }

    // 2. Closure untuk menutup trace dan mengeksekusi penulisan database secara non-blocking
    const endTrace = async (endParams: EndTelemetryParams): Promise<void> => {
      const latencyMs = Math.max(1, Date.now() - startTime);
      const totalTokens = endParams.inputTokens + endParams.outputTokens;

      const costUsd = AiCostCalculator.calculateModelCostUsd({
        model: params.model,
        inputTokens: endParams.inputTokens,
        outputTokens: endParams.outputTokens,
        imageCalls: params.model.toLowerCase().includes('dall-e') ? 1 : 0,
      });

      // A. Tutup span di Langfuse SDK
      try {
        if (generationSpan) {
          generationSpan.end({
            output: endParams.outputPreview,
            usage: {
              input: endParams.inputTokens,
              output: endParams.outputTokens,
              total: totalTokens,
            },
            level: endParams.status === 'FAILED' ? 'ERROR' : 'DEFAULT',
            statusMessage: endParams.errorMessage,
          });
        }
      } catch (lfEndErr: any) {
        console.warn(`[AiTelemetryWarning] Gagal menutup Langfuse span: ${lfEndErr?.message}`);
      }

      // B. Persistensi ke basis data lokal PostgreSQL ai_trace_logs
      try {
        await db.insert(aiTraceLogs).values({
          traceId: canonicalTraceId,
          tenantId: params.tenantId || null,
          operation: params.operation,
          model: params.model,
          inputTokens: endParams.inputTokens,
          outputTokens: endParams.outputTokens,
          totalTokens,
          latencyMs,
          costUsd: costUsd.toString(),
          status: endParams.status,
          errorMessage: endParams.errorMessage || null,
        });
      } catch (dbErr: any) {
        // Logging fail-safe agar kegagalan write log tidak menghentikan respon pengguna
        console.warn(`[AiTelemetryWarning] Gagal menyimpan log trace ${canonicalTraceId} ke database: ${dbErr?.message}`);
      }
    };

    return {
      canonicalTraceId,
      startTime,
      endTrace,
    };
  }
}
