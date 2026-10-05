export type CircuitState = 'CLOSED' | 'OPEN' | 'HALF_OPEN';

export interface TokenPoolProps {
  id: string;
  totalBudgetUsd: number;
  totalTokensAllocated: number;
  totalTokensConsumed: number;
  alertThresholdPercent: number;
  circuitState?: CircuitState;
  lastAlertSentAt?: Date | null;
  lastTopupDate?: Date | null;
}

export class PlatformTokenPool {
  public static readonly HARD_MINIMUM_SAFETY_BALANCE_USD = 2.00; // Ambang batas kritis

  public readonly id: string;
  public totalBudgetUsd: number;
  public totalTokensAllocated: number;
  public totalTokensConsumed: number;
  public alertThresholdPercent: number;
  public circuitState: CircuitState;
  public lastAlertSentAt: Date | null;
  public lastTopupDate: Date | null;

  constructor(props: TokenPoolProps) {
    this.id = props.id;
    this.totalBudgetUsd = props.totalBudgetUsd;
    this.totalTokensAllocated = props.totalTokensAllocated;
    this.totalTokensConsumed = props.totalTokensConsumed;
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

  public calculateRemainingPercent(currentEstimatedCostUsd: number): number {
    const remaining = this.calculateRemainingUsd(currentEstimatedCostUsd);
    return Math.max(0, Math.min(100, Math.round((remaining / (this.totalBudgetUsd || 1)) * 100)));
  }

  /**
   * Mengevaluasi kondisi saldo dan mengubah status circuit jika melewati batas kritis
   */
  public evaluateState(currentEstimatedCostUsd: number): {
    shouldTrip: boolean;
    isWarning: boolean;
    remainingUsd: number;
    percentRemaining: number;
  } {
    const remainingUsd = this.calculateRemainingUsd(currentEstimatedCostUsd);
    const percentRemaining = this.calculateRemainingPercent(currentEstimatedCostUsd);

    // 1. Kondisi Trip Mutlak: Sisa saldo <= $2.00
    if (remainingUsd <= PlatformTokenPool.HARD_MINIMUM_SAFETY_BALANCE_USD) {
      this.circuitState = 'OPEN';
      return { shouldTrip: true, isWarning: true, remainingUsd, percentRemaining };
    }

    // 2. Kondisi Peringatan Ambang Batas: Sisa <= alertThresholdPercent (misal 20%)
    const isWarning = percentRemaining <= this.alertThresholdPercent;

    if (this.circuitState === 'OPEN' && remainingUsd > PlatformTokenPool.HARD_MINIMUM_SAFETY_BALANCE_USD) {
      this.circuitState = 'HALF_OPEN';
    }

    return { shouldTrip: false, isWarning, remainingUsd, percentRemaining };
  }

  /**
   * Mereset status sirkuit menjadi CLOSED setelah Superadmin berhasil melakukan top-up
   */
  public recordTopup(addedUsd: number, newTotalTokens: number): void {
    if (addedUsd <= 0) {
      throw new Error('[DomainInvariantError] Nominal top-up harus lebih besar dari 0.');
    }
    this.totalBudgetUsd = Number((this.totalBudgetUsd + addedUsd).toFixed(2));
    this.totalTokensAllocated += newTotalTokens;
    this.circuitState = 'CLOSED';
    this.lastTopupDate = new Date();
  }
}
