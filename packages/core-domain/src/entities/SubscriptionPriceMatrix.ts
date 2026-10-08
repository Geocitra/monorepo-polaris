import { LegislativeLevel, PlanTier, BillingCycle } from '@polaris/shared-types';

export class SubscriptionPriceMatrix {
  constructor(
    public readonly id: string,
    public readonly legislativeLevel: LegislativeLevel,
    public readonly planTier: PlanTier,
    public readonly billingCycle: BillingCycle | string,
    public durationDays: number,
    public amountIdr: number,
    public isActive: boolean = true,
    public updatedAt: Date = new Date(),
  ) {}

  public updatePrice(newAmountIdr: number, newDurationDays?: number): void {
    if (newAmountIdr <= 0) {
      throw new Error(`[InvalidPriceError] Harga harus lebih besar dari 0.`);
    }
    this.amountIdr = newAmountIdr;
    if (newDurationDays && newDurationDays > 0) {
      this.durationDays = newDurationDays;
    }
    this.updatedAt = new Date();
  }

  public toggleActive(status: boolean): void {
    this.isActive = status;
    this.updatedAt = new Date();
  }

  public getMonthlyEquivalentPrice(): number {
    if (this.durationDays <= 0) return this.amountIdr;
    const months = this.durationDays / 30;
    return Math.round(this.amountIdr / months);
  }
}
