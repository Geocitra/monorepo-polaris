import * as crypto from 'crypto';
import { db, aiTraceLogs, tenantQuotaLedgers, platformTokenPools, eq, sql } from '@polaris/database';
import { AiCostCalculator, DynamicExchangeRate } from '@polaris/core-domain';
import { langfuseClient } from '../client.js';

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export interface StartTelemetryParams {
  operation: string;
  model: string;
  tenantId?: string;
  publicationId?: string;
  visitorIpHash?: string;
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
  publicationId?: string;
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
   * dengan fallback tokenizer Bahasa Indonesia presisi tinggi (~2.5 karakter/token + bobot imbuhan)
   * jika endpoint tidak menyertakan usageMetadata.
   */
  public static extractGeminiUsage(
    response: any,
    promptFallback?: string | number,
    outputFallback?: string | number,
  ): { inputTokens: number; outputTokens: number } {
    const meta = response?.usageMetadata;
    const promptCount = Number(meta?.promptTokenCount || 0);
    const candidatesCount = Number(meta?.candidatesTokenCount || 0);

    const estimateFallback = (val?: string | number): number => {
      if (typeof val === 'string') {
        return AiCostCalculator.estimateIndonesianTokens(val);
      }
      if (typeof val === 'number' && val > 0) {
        return Math.max(1, Math.ceil(val / 2.5));
      }
      return 0;
    };

    const inputTokens = promptCount > 0 ? promptCount : estimateFallback(promptFallback);
    const outputTokens = candidatesCount > 0 ? candidatesCount : estimateFallback(outputFallback);

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
   * Memulai session trace ganda (Langfuse SDK + In-Memory Timer + Dual-Provider IDR Ledger Sync)
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
    const rawPubId = (params.publicationId || params.metadata?.publicationId || '')
      .toString()
      .trim();
    const initialPubUuid = rawPubId && UUID_REGEX.test(rawPubId) ? rawPubId : null;
    const visitorIpHash =
      (params.visitorIpHash || params.metadata?.visitorIpHash || '').toString().trim().slice(0, 64) ||
      null;

    // 1. Inisialisasi SDK Langfuse Cloud dengan Trace ID yang identik
    let langfuseTrace: any = null;
    let generationSpan: any = null;
    if (this.isLangfuseConfigured()) {
      try {
        langfuseTrace = langfuseClient.trace({
          id: canonicalTraceId,
          name: params.operation,
          userId: rawTenantId || (visitorIpHash ? `VISITOR_${visitorIpHash.slice(0, 12)}` : 'PUBLIC_VISITOR'),
          metadata: {
            ...params.metadata,
            ...params.inputPayload,
            canonicalTraceId,
            publicationId: initialPubUuid,
            visitorIpHash,
            environment: process.env.NODE_ENV || 'production',
          },
        });

        generationSpan = langfuseTrace.generation({
          name: `${params.model}-generation`,
          model: params.model,
          input:
            params.metadata?.inputPrompt ||
            params.inputPayload ||
            params.metadata ||
            'Structured Prompt',
        });
      } catch (lfErr: any) {
        console.warn(`[AiTelemetryWarning] Gagal inisialisasi Langfuse trace: ${lfErr?.message}`);
      }
    }

    // 2. Closure untuk menutup trace dan mengeksekusi penulisan database secara atomik
    const endTrace = async (endParams: EndTelemetryParams): Promise<void> => {
      const latencyMs = Math.max(1, Date.now() - startTime);
      const resolvedModel = (endParams.actualModel || params.model || 'unknown').slice(0, 50);
      const isImgModel = AiCostCalculator.isImageModel(resolvedModel);
      const isPureFlatImageModel =
        resolvedModel.toLowerCase().includes('dall-e') ||
        resolvedModel.toLowerCase().includes('chatgpt-image') ||
        resolvedModel.toLowerCase().includes('gpt-image') ||
        resolvedModel.toLowerCase().includes('imagen-');

      // Pisahkan satuan gambar flat-rate dari token teks agar metrik akurasi token tidak tercemar
      const safeInputTokens = isPureFlatImageModel
        ? 0
        : Math.max(0, Math.round(Number(endParams.inputTokens) || 0));
      const safeOutputTokens = isPureFlatImageModel
        ? 0
        : Math.max(0, Math.round(Number(endParams.outputTokens) || 0));
      const totalTokens = safeInputTokens + safeOutputTokens;

      const isSuccess = endParams.status === 'SUCCESS';
      const effectiveImageCalls = isSuccess
        ? endParams.imageCalls !== undefined
          ? Math.max(0, Math.round(endParams.imageCalls))
          : isImgModel
            ? 1
            : 0
        : 0;

      // Ambil kurs dinamis USD -> IDR secara real-time (dengan cache 1 jam)
      const fxSnapshot = await DynamicExchangeRate.getLiveUsdToIdrSnapshot();
      const fxRateApplied = fxSnapshot.rateIdrPerUsd;
      const resolvedProvider = AiCostCalculator.resolveProvider(resolvedModel);

      const costBreakdown = isSuccess
        ? AiCostCalculator.calculateDetailedModelCostUsd({
            model: resolvedModel,
            inputTokens: safeInputTokens,
            outputTokens: safeOutputTokens,
            imageCalls: effectiveImageCalls,
            fxRateIdr: fxRateApplied,
          })
        : {
            provider: resolvedProvider,
            inputCostUsd: 0,
            outputCostUsd: 0,
            imageCostUsd: 0,
            totalCostUsd: 0,
            fxRateApplied,
            inputCostIdr: 0,
            outputCostIdr: 0,
            imageCostIdr: 0,
            totalCostIdr: 0,
          };

      const costUsd = costBreakdown.totalCostUsd;
      const costIdr = costBreakdown.totalCostIdr;

      const endPubRaw = (endParams.publicationId || '').trim();
      const validPublicationUuid =
        endPubRaw && UUID_REGEX.test(endPubRaw) ? endPubRaw : initialPubUuid;

      // A. Tutup span di Langfuse SDK dengan usage + costDetails + metadata IDR
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
            metadata: {
              provider: resolvedProvider,
              fxRateApplied,
              costIdr,
              imageCalls: effectiveImageCalls,
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

      // B. Single Source of Truth Sync: Update tenant_quota_ledgers terlebih dahulu untuk mendapatkan ledgerId
      let syncedLedgerId: string | null = null;
      if (isSuccess && validTenantUuid && (totalTokens > 0 || costIdr > 0 || effectiveImageCalls > 0)) {
        try {
          const currentMonth = new Date().toISOString().slice(0, 7);
          const roundedLedgerCostUsd = Number(costUsd.toFixed(4));
          const isOpenAi = resolvedProvider === 'OPENAI';
          const isGemini = resolvedProvider === 'GEMINI';

          const oaiIn = isOpenAi ? safeInputTokens : 0;
          const oaiOut = isOpenAi ? safeOutputTokens : 0;
          const oaiTot = isOpenAi ? totalTokens : 0;
          const oaiImg = isOpenAi ? effectiveImageCalls : 0;
          const oaiIdr = isOpenAi ? costIdr : 0;

          const gemIn = isGemini ? safeInputTokens : 0;
          const gemOut = isGemini ? safeOutputTokens : 0;
          const gemTot = isGemini ? totalTokens : 0;
          const gemImg = isGemini ? effectiveImageCalls : 0;
          const gemIdr = isGemini ? costIdr : 0;

          if (typeof (db as any).insert === 'function') {
            const insertQuery = db.insert(tenantQuotaLedgers).values({
              tenantId: validTenantUuid,
              billingCycleMonth: currentMonth,
              articleLimit: 0,
              articleUsed: 0,
              dalleLimit: 0,
              dalleUsed: effectiveImageCalls,
              totalTokensConsumed: totalTokens,
              estimatedCostUsd: roundedLedgerCostUsd.toFixed(4),
              openaiInputTokens: oaiIn,
              openaiOutputTokens: oaiOut,
              openaiTotalTokens: oaiTot,
              openaiImageCalls: oaiImg,
              openaiCostIdr: oaiIdr,
              geminiInputTokens: gemIn,
              geminiOutputTokens: gemOut,
              geminiTotalTokens: gemTot,
              geminiImageCalls: gemImg,
              geminiCostIdr: gemIdr,
              totalCostIdr: costIdr,
            });
            if (typeof (insertQuery as any).onConflictDoUpdate === 'function') {
              const conflictQuery = insertQuery.onConflictDoUpdate({
                target: [tenantQuotaLedgers.tenantId, tenantQuotaLedgers.billingCycleMonth],
                set: {
                  dalleUsed: sql`${tenantQuotaLedgers.dalleUsed} + ${effectiveImageCalls}`,
                  totalTokensConsumed: sql`${tenantQuotaLedgers.totalTokensConsumed} + ${totalTokens}`,
                  estimatedCostUsd: sql`${tenantQuotaLedgers.estimatedCostUsd} + ${roundedLedgerCostUsd}`,
                  openaiInputTokens: sql`${tenantQuotaLedgers.openaiInputTokens} + ${oaiIn}`,
                  openaiOutputTokens: sql`${tenantQuotaLedgers.openaiOutputTokens} + ${oaiOut}`,
                  openaiTotalTokens: sql`${tenantQuotaLedgers.openaiTotalTokens} + ${oaiTot}`,
                  openaiImageCalls: sql`${tenantQuotaLedgers.openaiImageCalls} + ${oaiImg}`,
                  openaiCostIdr: sql`${tenantQuotaLedgers.openaiCostIdr} + ${oaiIdr}`,
                  geminiInputTokens: sql`${tenantQuotaLedgers.geminiInputTokens} + ${gemIn}`,
                  geminiOutputTokens: sql`${tenantQuotaLedgers.geminiOutputTokens} + ${gemOut}`,
                  geminiTotalTokens: sql`${tenantQuotaLedgers.geminiTotalTokens} + ${gemTot}`,
                  geminiImageCalls: sql`${tenantQuotaLedgers.geminiImageCalls} + ${gemImg}`,
                  geminiCostIdr: sql`${tenantQuotaLedgers.geminiCostIdr} + ${gemIdr}`,
                  totalCostIdr: sql`${tenantQuotaLedgers.totalCostIdr} + ${costIdr}`,
                  updatedAt: new Date(),
                },
              });
              if (typeof (conflictQuery as any).returning === 'function') {
                const rows = await conflictQuery.returning({ id: tenantQuotaLedgers.id });
                syncedLedgerId = rows?.[0]?.id || null;
              } else {
                await conflictQuery;
              }
            }
          }
        } catch (ledgerErr: any) {
          console.warn(
            `[AiTelemetryWarning] Gagal sinkronisasi tenant_quota_ledgers: ${ledgerErr?.message}`,
          );
        }
      }

      // C. Persistensi ke basis data lokal PostgreSQL ai_trace_logs (lengkap dengan relasi FK & IDR)
      try {
        await db.insert(aiTraceLogs).values({
          traceId: canonicalTraceId,
          tenantId: validTenantUuid,
          publicationId: validPublicationUuid,
          ledgerId: syncedLedgerId,
          provider: resolvedProvider,
          operation: params.operation.slice(0, 100),
          model: resolvedModel,
          inputTokens: safeInputTokens,
          outputTokens: safeOutputTokens,
          totalTokens,
          imageCalls: effectiveImageCalls,
          latencyMs,
          costUsd: costUsd.toFixed(5),
          fxRateApplied: fxRateApplied.toFixed(2),
          costIdr,
          visitorIpHash,
          status: endParams.status,
          errorMessage: endParams.errorMessage || null,
        });
      } catch (dbErr: any) {
        console.warn(
          `[AiTelemetryWarning] Gagal menyimpan log trace ${canonicalTraceId} ke database: ${dbErr?.message}`,
        );
      }

      // D. Update platform_token_pools terpisah sesuai provider ('OPENAI' vs 'GEMINI')
      if (
        isSuccess &&
        (resolvedProvider === 'OPENAI' || resolvedProvider === 'GEMINI') &&
        (totalTokens > 0 || costIdr > 0 || effectiveImageCalls > 0)
      ) {
        try {
          if (typeof (db as any).insert === 'function') {
            const poolInsert = db.insert(platformTokenPools).values({
              provider: resolvedProvider,
              totalBudgetUsd: '61.16',
              totalBudgetIdr: 1000000,
              consumedBudgetIdr: costIdr,
              totalTokensAllocated: resolvedProvider === 'GEMINI' ? 25000000 : 10000000,
              totalTokensConsumed: totalTokens,
              totalImagesGenerated: effectiveImageCalls,
              alertThresholdPercent: 20,
              circuitState: 'CLOSED',
            });
            if (typeof (poolInsert as any).onConflictDoUpdate === 'function') {
              await poolInsert.onConflictDoUpdate({
                target: [platformTokenPools.provider],
                set: {
                  totalTokensConsumed: sql`${platformTokenPools.totalTokensConsumed} + ${totalTokens}`,
                  consumedBudgetIdr: sql`${platformTokenPools.consumedBudgetIdr} + ${costIdr}`,
                  totalImagesGenerated: sql`${platformTokenPools.totalImagesGenerated} + ${effectiveImageCalls}`,
                  updatedAt: new Date(),
                },
              });
            } else if (typeof (db as any).update === 'function') {
              await db
                .update(platformTokenPools)
                .set({
                  totalTokensConsumed: sql`${platformTokenPools.totalTokensConsumed} + ${totalTokens}`,
                  consumedBudgetIdr: sql`${platformTokenPools.consumedBudgetIdr} + ${costIdr}`,
                  totalImagesGenerated: sql`${platformTokenPools.totalImagesGenerated} + ${effectiveImageCalls}`,
                  updatedAt: new Date(),
                })
                .where(eq(platformTokenPools.provider, resolvedProvider));
            }
          }
        } catch (poolErr: any) {
          console.warn(
            `[AiTelemetryWarning] Gagal sinkronisasi platform_token_pools (${resolvedProvider}): ${poolErr?.message}`,
          );
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
    publicationId?: string;
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
    const rawPubId = params.publicationId?.trim() || undefined;
    const validPubUuid = rawPubId && UUID_REGEX.test(rawPubId) ? rawPubId : null;

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

    const fxRate = DynamicExchangeRate.getCurrentRateSync();

    try {
      await db.insert(aiTraceLogs).values({
        traceId,
        tenantId: validTenantUuid,
        publicationId: validPubUuid,
        provider: 'SYSTEM',
        operation: 'poster_visual_qa',
        model: 'deterministic-qa-gate',
        inputTokens: 0,
        outputTokens: 0,
        totalTokens: 0,
        imageCalls: 0,
        latencyMs: 15,
        costUsd: '0.00000',
        fxRateApplied: fxRate.toFixed(2),
        costIdr: 0,
        status: params.passed ? 'SUCCESS' : 'REFUSAL',
        errorMessage: params.passed ? null : params.issues.join('; '),
      });
    } catch (dbErr: any) {
      console.warn(`[AiTelemetryWarning] Gagal menyimpan log QA ${traceId} ke database: ${dbErr?.message}`);
    }
  }
}
