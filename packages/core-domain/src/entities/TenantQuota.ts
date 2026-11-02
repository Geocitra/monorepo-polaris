export interface UsageRecordParams {
  tokensUsed: number;
  isDalleGenerated?: boolean;
  costUsd?: number;
}

export interface DetailedModelCostBreakdown {
  inputCostUsd: number;
  outputCostUsd: number;
  imageCostUsd: number;
  totalCostUsd: number;
}

export class AiCostCalculator {
  // Tarif Resmi OpenAI & Google Cloud per 1 Juta Token (Input / Output) & Aset Visual
  public static readonly GPT4O_INPUT_PER_MILLION = 2.50;
  public static readonly GPT4O_OUTPUT_PER_MILLION = 10.00;
  public static readonly GPT4O_BLENDED_PER_MILLION = 12.00; // Rata-rata terbobot naskah panjang
  public static readonly GPT4O_COST_PER_MILLION_TOKENS = 12.0; // Backward-compatibility alias

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

  public static readonly USD_TO_IDR_RATE = 16250;

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
   * Menghitung rincian biaya (input, output, image, total) berdasarkan model spesifik
   */
  public static calculateDetailedModelCostUsd(params: {
    model: string;
    inputTokens: number;
    outputTokens: number;
    imageCalls?: number;
  }): DetailedModelCostBreakdown {
    const { model, inputTokens = 0, outputTokens = 0, imageCalls } = params;
    const lowerModel = (model || '').toLowerCase();

    if (
      lowerModel.includes('guardrail') ||
      lowerModel.includes('deterministic') ||
      lowerModel === 'none'
    ) {
      return { inputCostUsd: 0, outputCostUsd: 0, imageCostUsd: 0, totalCostUsd: 0 };
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
        // Fallback default konservatif setara GPT-4o-mini jika ada model teks lain
        inputCost = (inputTokens / 1_000_000) * this.GPT4O_MINI_INPUT_PER_MILLION;
        outputCost = (outputTokens / 1_000_000) * this.GPT4O_MINI_OUTPUT_PER_MILLION;
      }
    }

    const rawTotal = inputCost + outputCost + imageCost;
    // Pastikan panggilan berbayar mikro (misal embedding 100 token) tidak terbulatkan menjadi 0 pada numeric(10,5)
    const totalCostUsd =
      rawTotal > 0 && rawTotal < 0.00001
        ? 0.00001
        : Number(rawTotal.toFixed(5));

    return {
      inputCostUsd: Number(inputCost.toFixed(6)),
      outputCostUsd: Number(outputCost.toFixed(6)),
      imageCostUsd: Number(imageCost.toFixed(5)),
      totalCostUsd,
    };
  }

  /**
   * Menghitung biaya komprehensif berdasarkan model spesifik dan komposisi input/output token
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

  public static toIdr(costUsd: number): number {
    return Math.round(costUsd * this.USD_TO_IDR_RATE);
  }
}

export class TenantUsageLedger {
  constructor(
    public readonly tenantId: string,
    public readonly billingCycleMonth: string,
    public articleUsed: number = 0,
    public dalleUsed: number = 0,
    public totalTokensConsumed: number = 0,
    public estimatedCostUsd: number = 0.0,
  ) {
    if (this.articleUsed < 0 || this.dalleUsed < 0 || this.totalTokensConsumed < 0) {
      throw new Error('[DomainInvariantError] Metrik pembukuan penggunaan tidak boleh bernilai negatif.');
    }
  }

  public isUnlimited(): boolean {
    return true;
  }

  public recordArticleGeneration(tokenUsage: number, costUsd?: number): void {
    this.articleUsed += 1;
    this.totalTokensConsumed += tokenUsage;
    const additionalCost = costUsd ?? AiCostCalculator.calculateCostUsd(tokenUsage, 0);
    this.estimatedCostUsd = Number((this.estimatedCostUsd + additionalCost).toFixed(4));
  }

  public recordDalleGeneration(costUsd?: number): void {
    this.dalleUsed += 1;
    const additionalCost = costUsd ?? AiCostCalculator.DALLE3_COST_PER_IMAGE_USD;
    this.estimatedCostUsd = Number((this.estimatedCostUsd + additionalCost).toFixed(4));
  }

  public getEstimatedCostIdr(): number {
    return AiCostCalculator.toIdr(this.estimatedCostUsd);
  }

  public hasQuotaForArticle(): boolean {
    return true;
  }

  public hasQuotaForDalle(): boolean {
    return true;
  }

  public getArticleRemaining(): number {
    return 9999;
  }

  public getDalleRemaining(): number {
    return 9999;
  }
}

export const TenantQuota = TenantUsageLedger;
export type TenantQuota = TenantUsageLedger;
