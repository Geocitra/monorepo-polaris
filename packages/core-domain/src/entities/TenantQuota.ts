export interface UsageRecordParams {
  tokensUsed: number;
  isDalleGenerated?: boolean;
  costUsd?: number;
}

export class AiCostCalculator {
  // Tarif Resmi OpenAI per 1 Juta Token (Input / Output) & Aset Visual
  public static readonly GPT4O_INPUT_PER_MILLION = 2.50;
  public static readonly GPT4O_OUTPUT_PER_MILLION = 10.00;
  public static readonly GPT4O_BLENDED_PER_MILLION = 12.00; // Rata-rata terbobot naskah panjang
  public static readonly GPT4O_COST_PER_MILLION_TOKENS = 12.0; // Backward-compatibility alias

  public static readonly GPT4O_MINI_INPUT_PER_MILLION = 0.15;
  public static readonly GPT4O_MINI_OUTPUT_PER_MILLION = 0.60;

  public static readonly EMBEDDING_PER_MILLION = 0.02; // text-embedding-3-small
  public static readonly DALLE3_COST_PER_IMAGE_USD = 0.08; // 1024x1792 Standard Portrait

  public static readonly USD_TO_IDR_RATE = 16250;

  /**
   * Menghitung biaya komprehensif berdasarkan model spesifik dan komposisi input/output token
   */
  public static calculateModelCostUsd(params: {
    model: string;
    inputTokens: number;
    outputTokens: number;
    imageCalls?: number;
  }): number {
    const { model, inputTokens, outputTokens, imageCalls = 0 } = params;
    const lowerModel = model.toLowerCase();

    let cost = 0;

    if (lowerModel.includes('gpt-4o-mini')) {
      const inCost = (inputTokens / 1_000_000) * this.GPT4O_MINI_INPUT_PER_MILLION;
      const outCost = (outputTokens / 1_000_000) * this.GPT4O_MINI_OUTPUT_PER_MILLION;
      cost = inCost + outCost;
    } else if (lowerModel.includes('gpt-4o')) {
      const inCost = (inputTokens / 1_000_000) * this.GPT4O_INPUT_PER_MILLION;
      const outCost = (outputTokens / 1_000_000) * this.GPT4O_OUTPUT_PER_MILLION;
      cost = inCost + outCost;
    } else if (lowerModel.includes('embedding')) {
      cost = ((inputTokens + outputTokens) / 1_000_000) * this.EMBEDDING_PER_MILLION;
    }

    if (imageCalls > 0 || lowerModel.includes('dall-e')) {
      cost += (imageCalls || 1) * this.DALLE3_COST_PER_IMAGE_USD;
    }

    return Number(cost.toFixed(5));
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
