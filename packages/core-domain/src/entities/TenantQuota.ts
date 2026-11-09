import { DynamicExchangeRate } from '../services/DynamicExchangeRate.js';

export type ResolvedAiProvider = 'OPENAI' | 'GEMINI' | 'SYSTEM';

export interface UsageRecordParams {
  tokensUsed: number;
  isDalleGenerated?: boolean;
  costUsd?: number;
  costIdr?: number;
  provider?: ResolvedAiProvider;
}

export interface DetailedModelCostBreakdown {
  provider: ResolvedAiProvider;
  inputCostUsd: number;
  outputCostUsd: number;
  imageCostUsd: number;
  totalCostUsd: number;
  fxRateApplied: number;
  inputCostIdr: number;
  outputCostIdr: number;
  imageCostIdr: number;
  totalCostIdr: number;
}

export class AiCostCalculator {
  // Tarif Resmi OpenAI & Google Cloud Vertex/Gemini API per 1 Juta Token (Input / Output) & Aset Visual
  public static readonly GPT4O_INPUT_PER_MILLION = 2.50;
  public static readonly GPT4O_OUTPUT_PER_MILLION = 10.00;
  public static readonly GPT4O_BLENDED_PER_MILLION = 12.00;
  public static readonly GPT4O_COST_PER_MILLION_TOKENS = 12.0;

  public static readonly GPT4O_MINI_INPUT_PER_MILLION = 0.15;
  public static readonly GPT4O_MINI_OUTPUT_PER_MILLION = 0.60;

  public static readonly GEMINI_FLASH_INPUT_PER_MILLION = 0.15;
  public static readonly GEMINI_FLASH_OUTPUT_PER_MILLION = 0.60;

  public static readonly GEMINI_FLASH_LITE_INPUT_PER_MILLION = 0.075;
  public static readonly GEMINI_FLASH_LITE_OUTPUT_PER_MILLION = 0.30;

  public static readonly GEMINI_PRO_INPUT_PER_MILLION = 1.25;
  public static readonly GEMINI_PRO_OUTPUT_PER_MILLION = 5.00;

  public static readonly EMBEDDING_PER_MILLION = 0.02; // text-embedding-3-small
  public static readonly DALLE3_COST_PER_IMAGE_USD = 0.08; // DALL-E 3 / chatgpt-image-latest Portrait
  public static readonly IMAGEN3_COST_PER_IMAGE_USD = 0.04; // Google Imagen 3 / Gemini Flash Image

  /**
   * Mengambil kurs USD -> IDR secara dinamis dari DynamicExchangeRate (bukan angka statis).
   */
  public static get USD_TO_IDR_RATE(): number {
    return DynamicExchangeRate.getCurrentRateSync();
  }

  /**
   * Mendeteksi provider utama (OPENAI, GEMINI, atau SYSTEM) dari nama model AI
   */
  public static resolveProvider(model: string): ResolvedAiProvider {
    const lower = (model || '').toLowerCase().trim();
    if (
      !lower ||
      lower === 'none' ||
      lower.includes('guardrail') ||
      lower.includes('deterministic') ||
      lower.includes('fallback')
    ) {
      return 'SYSTEM';
    }
    if (
      lower.includes('gemini') ||
      lower.includes('imagen') ||
      lower.includes('flash-image') ||
      lower.includes('vertex') ||
      lower.includes('veo')
    ) {
      return 'GEMINI';
    }
    return 'OPENAI';
  }

  /**
   * Mendeteksi apakah nama model merupakan model generator gambar / kanvas visual
   */
  public static isImageModel(model: string): boolean {
    const lower = (model || '').toLowerCase();
    return (
      lower.includes('dall-e') ||
      lower.includes('chatgpt-image') ||
      lower.includes('gpt-image') ||
      lower.includes('imagen-') ||
      lower.includes('flash-image')
    );
  }

  /**
   * Estimasi token presisi tinggi untuk teks Bahasa Indonesia (BPE Tokenizer / SentencePiece)
   * Mengatasi defisit 30-40% dari rumus naif chars/4 karena imbuhan (me-, pe-, -kan, -nya) di Bahasa Indonesia.
   */
  public static estimateIndonesianTokens(text: string | null | undefined): number {
    if (!text) return 0;
    const trimmed = text.trim();
    if (!trimmed) return 0;

    const charBasedEstimate = Math.ceil(trimmed.length / 2.5);
    const words = trimmed.split(/\s+/).filter(Boolean);
    let affixBonus = 0;
    for (const word of words) {
      if (word.length >= 9) {
        affixBonus += 0.45;
      } else if (word.length >= 6) {
        affixBonus += 0.25;
      }
    }
    const wordBasedEstimate = Math.ceil(words.length * 1.35 + affixBonus);
    return Math.max(1, charBasedEstimate, wordBasedEstimate);
  }

  /**
   * Menghitung rincian biaya lengkap (USD & IDR Dinamis) beserta resolusi Provider berdasarkan model spesifik
   */
  public static calculateDetailedModelCostUsd(params: {
    model: string;
    inputTokens: number;
    outputTokens: number;
    imageCalls?: number;
    fxRateIdr?: number;
  }): DetailedModelCostBreakdown {
    const { model, inputTokens = 0, outputTokens = 0, imageCalls, fxRateIdr } = params;
    const lowerModel = (model || '').toLowerCase();
    const provider = this.resolveProvider(lowerModel);
    const activeFxRate =
      fxRateIdr && fxRateIdr > 0 ? fxRateIdr : DynamicExchangeRate.getCurrentRateSync();

    if (provider === 'SYSTEM') {
      return {
        provider: 'SYSTEM',
        inputCostUsd: 0,
        outputCostUsd: 0,
        imageCostUsd: 0,
        totalCostUsd: 0,
        fxRateApplied: activeFxRate,
        inputCostIdr: 0,
        outputCostIdr: 0,
        imageCostIdr: 0,
        totalCostIdr: 0,
      };
    }

    let inputCost = 0;
    let outputCost = 0;
    let imageCost = 0;

    const isImgModel = this.isImageModel(lowerModel);
    const effectiveImageCalls =
      imageCalls !== undefined ? imageCalls : isImgModel ? 1 : 0;

    if (effectiveImageCalls > 0) {
      if (lowerModel.includes('imagen-') || lowerModel.includes('flash-image')) {
        imageCost = effectiveImageCalls * this.IMAGEN3_COST_PER_IMAGE_USD;
      } else {
        imageCost = effectiveImageCalls * this.DALLE3_COST_PER_IMAGE_USD;
      }
    }

    if (!isImgModel) {
      if (lowerModel.includes('gpt-4o-mini')) {
        inputCost = (inputTokens / 1_000_000) * this.GPT4O_MINI_INPUT_PER_MILLION;
        outputCost = (outputTokens / 1_000_000) * this.GPT4O_MINI_OUTPUT_PER_MILLION;
      } else if (lowerModel.includes('gpt-4o')) {
        inputCost = (inputTokens / 1_000_000) * this.GPT4O_INPUT_PER_MILLION;
        outputCost = (outputTokens / 1_000_000) * this.GPT4O_OUTPUT_PER_MILLION;
      } else if (lowerModel.includes('embedding')) {
        inputCost = ((inputTokens + outputTokens) / 1_000_000) * this.EMBEDDING_PER_MILLION;
        outputCost = 0;
      } else if (lowerModel.includes('flash-lite')) {
        inputCost = (inputTokens / 1_000_000) * this.GEMINI_FLASH_LITE_INPUT_PER_MILLION;
        outputCost = (outputTokens / 1_000_000) * this.GEMINI_FLASH_LITE_OUTPUT_PER_MILLION;
      } else if (lowerModel.includes('gemini') && lowerModel.includes('pro')) {
        inputCost = (inputTokens / 1_000_000) * this.GEMINI_PRO_INPUT_PER_MILLION;
        outputCost = (outputTokens / 1_000_000) * this.GEMINI_PRO_OUTPUT_PER_MILLION;
      } else if (lowerModel.includes('gemini') || lowerModel.includes('flash')) {
        inputCost = (inputTokens / 1_000_000) * this.GEMINI_FLASH_INPUT_PER_MILLION;
        outputCost = (outputTokens / 1_000_000) * this.GEMINI_FLASH_OUTPUT_PER_MILLION;
      } else {
        inputCost = (inputTokens / 1_000_000) * this.GPT4O_MINI_INPUT_PER_MILLION;
        outputCost = (outputTokens / 1_000_000) * this.GPT4O_MINI_OUTPUT_PER_MILLION;
      }
    }

    const rawTotal = inputCost + outputCost + imageCost;
    const totalCostUsd =
      rawTotal > 0 && rawTotal < 0.00001
        ? 0.00001
        : Number(rawTotal.toFixed(5));

    const inputCostIdr = inputCost > 0 ? Math.max(1, Math.round(inputCost * activeFxRate)) : 0;
    const outputCostIdr = outputCost > 0 ? Math.max(1, Math.round(outputCost * activeFxRate)) : 0;
    const imageCostIdr = imageCost > 0 ? Math.max(1, Math.round(imageCost * activeFxRate)) : 0;
    const rawTotalIdr = Math.round(rawTotal * activeFxRate);
    const totalCostIdr = rawTotal > 0 ? Math.max(1, rawTotalIdr) : 0;

    return {
      provider,
      inputCostUsd: Number(inputCost.toFixed(6)),
      outputCostUsd: Number(outputCost.toFixed(6)),
      imageCostUsd: Number(imageCost.toFixed(5)),
      totalCostUsd,
      fxRateApplied: activeFxRate,
      inputCostIdr,
      outputCostIdr,
      imageCostIdr,
      totalCostIdr,
    };
  }

  /**
   * Menghitung biaya dalam Rupiah (IDR) secara langsung berdasarkan model dan token
   */
  public static calculateModelCostIdr(params: {
    model: string;
    inputTokens: number;
    outputTokens: number;
    imageCalls?: number;
    fxRateIdr?: number;
  }): number {
    return this.calculateDetailedModelCostUsd(params).totalCostIdr;
  }

  /**
   * Menghitung biaya komprehensif (USD) berdasarkan model spesifik dan komposisi input/output token
   */
  public static calculateModelCostUsd(params: {
    model: string;
    inputTokens: number;
    outputTokens: number;
    imageCalls?: number;
  }): number {
    return this.calculateDetailedModelCostUsd(params).totalCostUsd;
  }

  public static calculateCostUsd(tokens: number, dalleCalls: number = 0): number {
    const tokenCost = (tokens / 1_000_000) * this.GPT4O_BLENDED_PER_MILLION;
    const dalleCost = dalleCalls * this.DALLE3_COST_PER_IMAGE_USD;
    return Number((tokenCost + dalleCost).toFixed(4));
  }

  public static toIdr(costUsd: number, customFxRate?: number): number {
    if (!costUsd || costUsd <= 0) return 0;
    const rate =
      customFxRate && customFxRate > 0
        ? customFxRate
        : DynamicExchangeRate.getCurrentRateSync();
    return Math.max(1, Math.round(costUsd * rate));
  }

  public static toUsd(amountIdr: number, customFxRate?: number): number {
    if (!amountIdr || amountIdr <= 0) return 0;
    const rate =
      customFxRate && customFxRate > 0
        ? customFxRate
        : DynamicExchangeRate.getCurrentRateSync();
    return Number((amountIdr / rate).toFixed(4));
  }
}

export interface TenantUsageLedgerOptions {
  totalQuotaAllocated?: number;
  remainingQuota?: number;
  weeklyAllowanceLimit?: number;
  weeklyUsed?: number;
  openaiInputTokens?: number;
  openaiOutputTokens?: number;
  openaiTotalTokens?: number;
  openaiImageCalls?: number;
  openaiCostIdr?: number;
  geminiInputTokens?: number;
  geminiOutputTokens?: number;
  geminiTotalTokens?: number;
  geminiImageCalls?: number;
  geminiCostIdr?: number;
  totalCostIdr?: number;
}

export class TenantUsageLedger {
  public totalQuotaAllocated: number;
  public remainingQuota: number;
  public weeklyAllowanceLimit: number;
  public weeklyUsed: number;

  public openaiInputTokens: number;
  public openaiOutputTokens: number;
  public openaiTotalTokens: number;
  public openaiImageCalls: number;
  public openaiCostIdr: number;

  public geminiInputTokens: number;
  public geminiOutputTokens: number;
  public geminiTotalTokens: number;
  public geminiImageCalls: number;
  public geminiCostIdr: number;

  public totalCostIdr: number;

  constructor(
    public readonly tenantId: string,
    public readonly billingCycleMonth: string,
    public articleUsed: number = 0,
    public dalleUsed: number = 0,
    public totalTokensConsumed: number = 0,
    public estimatedCostUsd: number = 0.0,
    options: TenantUsageLedgerOptions = {},
  ) {
    if (this.articleUsed < 0 || this.dalleUsed < 0 || this.totalTokensConsumed < 0) {
      throw new Error('[DomainInvariantError] Metrik pembukuan penggunaan tidak boleh bernilai negatif.');
    }

    this.totalQuotaAllocated = options.totalQuotaAllocated ?? 12;
    this.remainingQuota =
      options.remainingQuota ?? Math.max(0, this.totalQuotaAllocated - this.articleUsed);
    this.weeklyAllowanceLimit = options.weeklyAllowanceLimit ?? 3;
    this.weeklyUsed = options.weeklyUsed ?? 0;

    this.openaiInputTokens = options.openaiInputTokens ?? 0;
    this.openaiOutputTokens = options.openaiOutputTokens ?? 0;
    this.openaiTotalTokens = options.openaiTotalTokens ?? 0;
    this.openaiImageCalls = options.openaiImageCalls ?? 0;
    this.openaiCostIdr = options.openaiCostIdr ?? 0;

    this.geminiInputTokens = options.geminiInputTokens ?? 0;
    this.geminiOutputTokens = options.geminiOutputTokens ?? 0;
    this.geminiTotalTokens = options.geminiTotalTokens ?? 0;
    this.geminiImageCalls = options.geminiImageCalls ?? 0;
    this.geminiCostIdr = options.geminiCostIdr ?? 0;

    this.totalCostIdr =
      options.totalCostIdr ??
      (this.openaiCostIdr + this.geminiCostIdr > 0
        ? this.openaiCostIdr + this.geminiCostIdr
        : AiCostCalculator.toIdr(this.estimatedCostUsd));
  }

  /**
   * Tidak ada lagi mode Unlimited bodong. Semua tenant tunduk pada kuota paket (Wallet) & batas mingguan.
   */
  public isUnlimited(): boolean {
    return false;
  }

  public recordArticleGeneration(
    tokenUsage: number,
    costUsd?: number,
    provider: ResolvedAiProvider = 'OPENAI',
    costIdr?: number,
  ): void {
    this.articleUsed += 1;
    this.remainingQuota = Math.max(0, this.remainingQuota - 1);
    this.totalTokensConsumed += tokenUsage;
    const additionalCostUsd = costUsd ?? AiCostCalculator.calculateCostUsd(tokenUsage, 0);
    const additionalCostIdr = costIdr ?? AiCostCalculator.toIdr(additionalCostUsd);
    this.estimatedCostUsd = Number((this.estimatedCostUsd + additionalCostUsd).toFixed(4));
    this.totalCostIdr += additionalCostIdr;

    if (provider === 'GEMINI') {
      this.geminiTotalTokens += tokenUsage;
      this.geminiCostIdr += additionalCostIdr;
    } else if (provider === 'OPENAI') {
      this.openaiTotalTokens += tokenUsage;
      this.openaiCostIdr += additionalCostIdr;
    }
  }

  public recordDalleGeneration(
    costUsd?: number,
    provider: ResolvedAiProvider = 'OPENAI',
    costIdr?: number,
  ): void {
    this.dalleUsed += 1;
    const defaultUsd =
      provider === 'GEMINI'
        ? AiCostCalculator.IMAGEN3_COST_PER_IMAGE_USD
        : AiCostCalculator.DALLE3_COST_PER_IMAGE_USD;
    const additionalCostUsd = costUsd ?? defaultUsd;
    const additionalCostIdr = costIdr ?? AiCostCalculator.toIdr(additionalCostUsd);
    this.estimatedCostUsd = Number((this.estimatedCostUsd + additionalCostUsd).toFixed(4));
    this.totalCostIdr += additionalCostIdr;

    if (provider === 'GEMINI') {
      this.geminiImageCalls += 1;
      this.geminiCostIdr += additionalCostIdr;
    } else if (provider === 'OPENAI') {
      this.openaiImageCalls += 1;
      this.openaiCostIdr += additionalCostIdr;
    }
  }

  public getEstimatedCostIdr(): number {
    if (this.totalCostIdr > 0) {
      return this.totalCostIdr;
    }
    return AiCostCalculator.toIdr(this.estimatedCostUsd);
  }

  public hasQuotaForArticle(): boolean {
    return this.remainingQuota > 0;
  }

  public hasWeeklyAllowanceAvailable(): boolean {
    return this.weeklyUsed < this.weeklyAllowanceLimit;
  }

  public hasQuotaForDalle(): boolean {
    return this.remainingQuota > 0;
  }

  public getArticleRemaining(): number {
    return Math.max(0, this.remainingQuota);
  }

  public getWeeklyRemaining(): number {
    return Math.max(0, this.weeklyAllowanceLimit - this.weeklyUsed);
  }

  public getDalleRemaining(): number {
    return Math.max(0, this.remainingQuota);
  }
}

export const TenantQuota = TenantUsageLedger;
export type TenantQuota = TenantUsageLedger;
