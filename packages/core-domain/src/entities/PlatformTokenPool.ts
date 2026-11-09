import { DynamicExchangeRate } from '../services/DynamicExchangeRate.js';

export type CircuitState = 'CLOSED' | 'OPEN' | 'HALF_OPEN';
export type PoolProvider = 'OPENAI' | 'GEMINI';

export interface TokenPoolProps {
  id: string;
  provider?: PoolProvider;
  totalBudgetUsd: number;
  totalBudgetIdr?: number;
  consumedBudgetIdr?: number;
  totalTokensAllocated: number;
  totalTokensConsumed: number;
  totalImagesGenerated?: number;
  alertThresholdPercent: number;
  circuitState?: CircuitState;
  lastAlertSentAt?: Date | null;
  lastTopupDate?: Date | null;
}

export class PlatformTokenPool {
  public static readonly HARD_MINIMUM_SAFETY_BALANCE_USD = 2.00;
  public static readonly HARD_MINIMUM_SAFETY_BALANCE_IDR = 35000; // Ambang batas kritis Rp 35.000 per Vault Provider

  public readonly id: string;
  public readonly provider: PoolProvider;
  public totalBudgetUsd: number;
  public totalBudgetIdr: number;
  public consumedBudgetIdr: number;
  public totalTokensAllocated: number;
  public totalTokensConsumed: number;
  public totalImagesGenerated: number;
  public alertThresholdPercent: number;
  public circuitState: CircuitState;
  public lastAlertSentAt: Date | null;
  public lastTopupDate: Date | null;

  constructor(props: TokenPoolProps) {
    this.id = props.id;
    this.provider = props.provider || 'OPENAI';
    const fxRate = DynamicExchangeRate.getCurrentRateSync();
    this.totalBudgetUsd = props.totalBudgetUsd;
    this.totalBudgetIdr =
      props.totalBudgetIdr !== undefined && props.totalBudgetIdr > 0
        ? Math.round(props.totalBudgetIdr)
        : Math.round(props.totalBudgetUsd * fxRate);
    this.consumedBudgetIdr = Math.max(0, Math.round(props.consumedBudgetIdr ?? 0));
    this.totalTokensAllocated = props.totalTokensAllocated;
    this.totalTokensConsumed = props.totalTokensConsumed;
    this.totalImagesGenerated = props.totalImagesGenerated ?? 0;
    this.alertThresholdPercent = props.alertThresholdPercent || 20;
    this.circuitState = props.circuitState || 'CLOSED';
    this.lastAlertSentAt = props.lastAlertSentAt || null;
    this.lastTopupDate = props.lastTopupDate || null;
  }

  public isOperational(): boolean {
    return this.circuitState === 'CLOSED' || this.circuitState === 'HALF_OPEN';
  }

  public calculateRemainingUsd(currentEstimatedCostUsd: number): number {
    return Math.max(0, Number((this.totalBudgetUsd - currentEstimatedCostUsd).toFixed(4)));
  }

  public calculateRemainingIdr(currentConsumedIdr?: number): number {
    const consumed =
      currentConsumedIdr !== undefined ? currentConsumedIdr : this.consumedBudgetIdr;
    return Math.max(0, Math.round(this.totalBudgetIdr - consumed));
  }

  public calculateRemainingPercent(
    currentEstimatedCostUsd: number,
    currentConsumedIdr?: number,
  ): number {
    if (this.totalBudgetIdr > 0 && (currentConsumedIdr !== undefined || this.consumedBudgetIdr > 0)) {
      const remainingIdr = this.calculateRemainingIdr(currentConsumedIdr);
      return Math.max(
        0,
        Math.min(100, Math.round((remainingIdr / (this.totalBudgetIdr || 1)) * 100)),
      );
    }
    const remaining = this.calculateRemainingUsd(currentEstimatedCostUsd);
    return Math.max(0, Math.min(100, Math.round((remaining / (this.totalBudgetUsd || 1)) * 100)));
  }

  /**
   * Mengevaluasi kondisi saldo dalam Rupiah (IDR) & USD dan mengubah status circuit jika melewati batas kritis
   */
  public evaluateState(
    currentEstimatedCostUsd: number,
    currentConsumedIdr?: number,
  ): {
    shouldTrip: boolean;
    isWarning: boolean;
    remainingUsd: number;
    remainingIdr: number;
    percentRemaining: number;
  } {
    const fxRate = DynamicExchangeRate.getCurrentRateSync();
    const effectiveConsumedIdr =
      currentConsumedIdr !== undefined
        ? currentConsumedIdr
        : this.consumedBudgetIdr > 0
          ? this.consumedBudgetIdr
          : Math.round(currentEstimatedCostUsd * fxRate);

    const remainingIdr = this.calculateRemainingIdr(effectiveConsumedIdr);
    const remainingUsd = this.calculateRemainingUsd(currentEstimatedCostUsd);
    const percentRemaining = this.calculateRemainingPercent(
      currentEstimatedCostUsd,
      effectiveConsumedIdr,
    );

    // 1. Kondisi Trip Mutlak: Sisa saldo <= Rp 35.000 (atau <= $2.00)
    if (
      remainingIdr <= PlatformTokenPool.HARD_MINIMUM_SAFETY_BALANCE_IDR ||
      remainingUsd <= PlatformTokenPool.HARD_MINIMUM_SAFETY_BALANCE_USD
    ) {
      this.circuitState = 'OPEN';
      return {
        shouldTrip: true,
        isWarning: true,
        remainingUsd,
        remainingIdr,
        percentRemaining,
      };
    }

    // 2. Kondisi Peringatan Ambang Batas: Sisa <= alertThresholdPercent (misal 20%)
    const isWarning = percentRemaining <= this.alertThresholdPercent;

    if (
      this.circuitState === 'OPEN' &&
      remainingIdr > PlatformTokenPool.HARD_MINIMUM_SAFETY_BALANCE_IDR
    ) {
      this.circuitState = 'HALF_OPEN';
    }

    return {
      shouldTrip: false,
      isWarning,
      remainingUsd,
      remainingIdr,
      percentRemaining,
    };
  }

  /**
   * Mereset status sirkuit menjadi CLOSED setelah Superadmin berhasil melakukan top-up (IDR / USD)
   */
  public recordTopup(addedUsd: number, newTotalTokens: number, addedIdr?: number): void {
    const fxRate = DynamicExchangeRate.getCurrentRateSync();
    const resolvedAddedIdr =
      addedIdr !== undefined && addedIdr > 0
        ? Math.round(addedIdr)
        : Math.round(addedUsd * fxRate);
    const resolvedAddedUsd =
      addedUsd > 0 ? addedUsd : Number((resolvedAddedIdr / fxRate).toFixed(2));

    if (resolvedAddedIdr <= 0 && resolvedAddedUsd <= 0) {
      throw new Error('[DomainInvariantError] Nominal top-up harus lebih besar dari Rp 0.');
    }

    this.totalBudgetUsd = Number((this.totalBudgetUsd + resolvedAddedUsd).toFixed(2));
    this.totalBudgetIdr += resolvedAddedIdr;
    this.totalTokensAllocated += newTotalTokens;
    this.circuitState = 'CLOSED';
    this.lastTopupDate = new Date();
  }

  /**
   * Mencatat top-up langsung dalam mata uang Rupiah (IDR)
   */
  public recordTopupIdr(addedIdr: number, fxRate?: number, newTotalTokens: number = 0): void {
    const rate = fxRate && fxRate > 0 ? fxRate : DynamicExchangeRate.getCurrentRateSync();
    const addedUsd = Number((addedIdr / rate).toFixed(2));
    this.recordTopup(addedUsd, newTotalTokens, addedIdr);
  }
}
