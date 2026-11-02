import * as crypto from 'crypto';
import { db, aiTraceLogs, tenantQuotaLedgers, platformTokenPools, sql } from '@polaris/database';
import { AiCostCalculator } from '@polaris/core-domain';
import { langfuseClient } from '../client.js';

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export interface StartTelemetryParams {
  operation: string;
  model: string;
  tenantId?: string;
  metadata?: Record<string, any>;
  inputPayload?: Record<string, any>;
}

export interface EndTelemetryParams {
  inputTokens: number;
  outputTokens: number;
  status: 'SUCCESS' | 'FAILED' | 'REFUSAL';
  errorMessage?: string;
  outputPreview?: any;
  outputSummary?: any;
  actualModel?: string;
  imageCalls?: number;
}

export interface LangfuseRuntimeStatus {
  status: 'CONNECTED' | 'UNCONFIGURED' | 'DEGRADED';
  host: string;
  publicKey: string;
  sdkVersion: string;
  telemetryActive: boolean;
  traceUrl: string;
}

export class AiTelemetryService {
  private static lastFlushError: string | null = null;

  /**
   * Memeriksa apakah kredensial Langfuse valid dan telah dikonfigurasi
   */
  public static isLangfuseConfigured(): boolean {
    const pub = (process.env.LANGFUSE_PUBLIC_KEY || '').trim();
    const sec = (process.env.LANGFUSE_SECRET_KEY || '').trim();
    return pub.startsWith('pk-lf-') && pub.length > 12 && sec.startsWith('sk-lf-') && sec.length > 12;
  }

  /**
   * Mengembalikan status runtime Langfuse secara riil (bukan hardcoded)
   */
  public static getLangfuseStatus(): LangfuseRuntimeStatus {
    const host =
      process.env.LANGFUSE_BASE_URL ||
      process.env.LANGFUSE_HOST ||
      'https://cloud.langfuse.com';
    const rawPubKey = (process.env.LANGFUSE_PUBLIC_KEY || '').trim();
    const configured = this.isLangfuseConfigured();

    let status: 'CONNECTED' | 'UNCONFIGURED' | 'DEGRADED' = 'UNCONFIGURED';
    if (configured) {
      status = this.lastFlushError ? 'DEGRADED' : 'CONNECTED';
    }

    return {
      status,
      host,
      publicKey: configured ? `${rawPubKey.slice(0, 12)}••••••••` : 'BELUM DIKONFIGURASI',
      sdkVersion: '3.35.0',
      telemetryActive: configured,
      traceUrl: host,
    };
  }

  /**
   * Mengekstrak jumlah input & output token asli dari response Google GenAI (@google/genai)
   * dengan fallback estimasi deterministik jika endpoint tidak menyertakan usageMetadata.
   */
  public static extractGeminiUsage(
    response: any,
    promptFallback?: string | number,
    outputFallback?: string | number
  ): { inputTokens: number; outputTokens: number } {
    const meta = response?.usageMetadata;
    const promptCount = Number(meta?.promptTokenCount || 0);
    const candidatesCount = Number(meta?.candidatesTokenCount || 0);

    const promptChars =
      typeof promptFallback === 'number'
        ? promptFallback
        : typeof promptFallback === 'string'
          ? promptFallback.length
          : 0;
    const outputChars =
      typeof outputFallback === 'number'
        ? outputFallback
        : typeof outputFallback === 'string'
          ? outputFallback.length
          : 0;

    const inputTokens =
      promptCount > 0
        ? promptCount
        : promptChars > 0
          ? Math.max(1, Math.ceil(promptChars / 4))
          : 0;

    const outputTokens =
      candidatesCount > 0
        ? candidatesCount
        : outputChars > 0
          ? Math.max(1, Math.ceil(outputChars / 4))
          : 0;

    return { inputTokens, outputTokens };
  }

  /**
   * Flush antrean Langfuse secara non-blocking dengan timeout 1.5 detik
   */
  private static async flushLangfuseSafe(): Promise<void> {
    if (!this.isLangfuseConfigured() || !langfuseClient) return;
    let timer: NodeJS.Timeout | undefined;
    try {
      await Promise.race([
        langfuseClient.flushAsync(),
        new Promise<void>((resolve) => {
          timer = setTimeout(resolve, 1500);
          if (typeof timer.unref === 'function') timer.unref();
        }),
      ]);
      this.lastFlushError = null;
    } catch (err: any) {
      this.lastFlushError = err?.message || 'Flush failed';
      console.warn(`[AiTelemetryWarning] Gagal flush Langfuse: ${this.lastFlushError}`);
    } finally {
      if (timer) clearTimeout(timer);
    }
  }

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
   * Memulai session trace ganda (Langfuse SDK + In-Memory Timer + Database Ledger Sync)
   */
  public static startTrace(params: StartTelemetryParams): {
    canonicalTraceId: string;
    startTime: number;
    endTrace: (endParams: EndTelemetryParams) => Promise<void>;
  } {
    const canonicalTraceId = this.generateCanonicalTraceId();
    const startTime = Date.now();
    const rawTenantId = params.tenantId?.trim() || undefined;
    const validTenantUuid = rawTenantId && UUID_REGEX.test(rawTenantId) ? rawTenantId : null;

    // 1. Inisialisasi SDK Langfuse Cloud dengan Trace ID yang identik
    let langfuseTrace: any = null;
    let generationSpan: any = null;
    if (this.isLangfuseConfigured()) {
      try {
        langfuseTrace = langfuseClient.trace({
          id: canonicalTraceId,
          name: params.operation,
          userId: rawTenantId || 'PUBLIC_VISITOR',
          metadata: {
            ...params.metadata,
            ...params.inputPayload,
            canonicalTraceId,
            environment: process.env.NODE_ENV || 'production',
          },
        });

        generationSpan = langfuseTrace.generation({
          name: `${params.model}-generation`,
          model: params.model,
          input: params.metadata?.inputPrompt || params.inputPayload || params.metadata || 'Structured Prompt',
        });
      } catch (lfErr: any) {
        console.warn(`[AiTelemetryWarning] Gagal inisialisasi Langfuse trace: ${lfErr?.message}`);
      }
    }

    // 2. Closure untuk menutup trace dan mengeksekusi penulisan database secara non-blocking
    const endTrace = async (endParams: EndTelemetryParams): Promise<void> => {
      const latencyMs = Math.max(1, Date.now() - startTime);
      const safeInputTokens = Math.max(0, Math.round(Number(endParams.inputTokens) || 0));
      const safeOutputTokens = Math.max(0, Math.round(Number(endParams.outputTokens) || 0));
      const totalTokens = safeInputTokens + safeOutputTokens;
      const resolvedModel = (endParams.actualModel || params.model || 'unknown').slice(0, 50);

      const isSuccess = endParams.status === 'SUCCESS';
      const costBreakdown = isSuccess
        ? AiCostCalculator.calculateDetailedModelCostUsd({
          model: resolvedModel,
          inputTokens: safeInputTokens,
          outputTokens: safeOutputTokens,
          imageCalls: endParams.imageCalls,
        })
        : { inputCostUsd: 0, outputCostUsd: 0, imageCostUsd: 0, totalCostUsd: 0 };

      const costUsd = costBreakdown.totalCostUsd;

      // A. Tutup span di Langfuse SDK dengan usage + costDetails akurat
      try {
        if (generationSpan) {
          generationSpan.end({
            model: resolvedModel,
            output: endParams.outputPreview ?? endParams.outputSummary,
            usage: {
              input: safeInputTokens,
              output: safeOutputTokens,
              total: totalTokens,
              unit: 'TOKENS',
            },
            costDetails: {
              input: costBreakdown.inputCostUsd,
              output: Number((costBreakdown.outputCostUsd + costBreakdown.imageCostUsd).toFixed(6)),
              total: costUsd,
            },
            level:
              endParams.status === 'FAILED'
                ? 'ERROR'
                : endParams.status === 'REFUSAL'
                  ? 'WARNING'
                  : 'DEFAULT',
            statusMessage: endParams.errorMessage,
          });
        }
        await this.flushLangfuseSafe();
      } catch (lfEndErr: any) {
        console.warn(`[AiTelemetryWarning] Gagal menutup Langfuse span: ${lfEndErr?.message}`);
      }

      // B. Persistensi ke basis data lokal PostgreSQL ai_trace_logs
      try {
        await db.insert(aiTraceLogs).values({
          traceId: canonicalTraceId,
          tenantId: validTenantUuid,
          operation: params.operation.slice(0, 100),
          model: resolvedModel,
          inputTokens: safeInputTokens,
          outputTokens: safeOutputTokens,
          totalTokens,
          latencyMs,
          costUsd: costUsd.toFixed(5),
          status: endParams.status,
          errorMessage: endParams.errorMessage || null,
        });
      } catch (dbErr: any) {
        console.warn(`[AiTelemetryWarning] Gagal menyimpan log trace ${canonicalTraceId} ke database: ${dbErr?.message}`);
      }

      // C. Single Source of Truth Sync: Update tenant_quota_ledgers & platform_token_pools secara atomik
      if (isSuccess && (totalTokens > 0 || costUsd > 0)) {
        if (validTenantUuid) {
          try {
            const currentMonth = new Date().toISOString().slice(0, 7);
            const roundedLedgerCost = Number(costUsd.toFixed(4));
            if (typeof (db as any).insert === 'function') {
              const insertQuery = db.insert(tenantQuotaLedgers).values({
                tenantId: validTenantUuid,
                billingCycleMonth: currentMonth,
                articleLimit: 0,
                articleUsed: 0,
                dalleLimit: 0,
                dalleUsed: 0,
                totalTokensConsumed: totalTokens,
                estimatedCostUsd: roundedLedgerCost.toFixed(4),
              });
              if (typeof (insertQuery as any).onConflictDoUpdate === 'function') {
                await insertQuery.onConflictDoUpdate({
                  target: [tenantQuotaLedgers.tenantId, tenantQuotaLedgers.billingCycleMonth],
                  set: {
                    totalTokensConsumed: sql`${tenantQuotaLedgers.totalTokensConsumed} + ${totalTokens}`,
                    estimatedCostUsd: sql`${tenantQuotaLedgers.estimatedCostUsd} + ${roundedLedgerCost}`,
                    updatedAt: new Date(),
                  },
                });
              }
            }
          } catch (ledgerErr: any) {
            console.warn(`[AiTelemetryWarning] Gagal sinkronisasi tenant_quota_ledgers: ${ledgerErr?.message}`);
          }
        }

        if (totalTokens > 0) {
          try {
            if (typeof (db as any).update === 'function') {
              await db
                .update(platformTokenPools)
                .set({
                  totalTokensConsumed: sql`${platformTokenPools.totalTokensConsumed} + ${totalTokens}`,
                  updatedAt: new Date(),
                });
            }
          } catch (poolErr: any) {
            console.warn(`[AiTelemetryWarning] Gagal sinkronisasi platform_token_pools: ${poolErr?.message}`);
          }
        }
      }
    };

    return {
      canonicalTraceId,
      startTime,
      endTrace,
    };
  }

  /**
   * Mencatat metrik evaluasi visual poster QA gate secara non-blocking
   */
  public static async recordPosterQAMetrics(params: {
    tenantId?: string;
    archetype: string;
    score: number;
    passed: boolean;
    issues: string[];
    metrics: Record<string, any>;
    recommendation?: Record<string, any>;
  }): Promise<void> {
    const traceId = this.generateCanonicalTraceId();
    const rawTenantId = params.tenantId?.trim() || undefined;
    const validTenantUuid = rawTenantId && UUID_REGEX.test(rawTenantId) ? rawTenantId : null;

    if (this.isLangfuseConfigured()) {
      try {
        const trace = langfuseClient.trace({
          id: traceId,
          name: 'poster-visual-qa-audit',
          userId: rawTenantId || 'PUBLIC_VISITOR',
          metadata: {
            archetype: params.archetype,
            score: params.score,
            passed: params.passed,
            issues: params.issues,
            metrics: params.metrics,
            recommendation: params.recommendation,
          },
        });
        trace.event({
          name: 'qa-evaluation-result',
          metadata: {
            score: params.score,
            passed: params.passed,
          },
        });
        await this.flushLangfuseSafe();
      } catch (lfErr: any) {
        console.warn(`[AiTelemetryWarning] Gagal mencatat Langfuse QA event: ${lfErr?.message}`);
      }
    }

    try {
      await db.insert(aiTraceLogs).values({
        traceId,
        tenantId: validTenantUuid,
        operation: 'poster_visual_qa',
        model: 'deterministic-qa-gate',
        inputTokens: 0,
        outputTokens: 0,
        totalTokens: 0,
        latencyMs: 15,
        costUsd: '0.00000',
        status: params.passed ? 'SUCCESS' : 'REFUSAL',
        errorMessage: params.passed ? null : params.issues.join('; '),
      });
    } catch (dbErr: any) {
      console.warn(`[AiTelemetryWarning] Gagal menyimpan log QA ${traceId} ke database: ${dbErr?.message}`);
    }
  }
}
