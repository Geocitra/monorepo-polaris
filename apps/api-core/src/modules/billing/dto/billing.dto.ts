import { IsOptional, IsString } from 'class-validator';
import { TierOfferingDto } from '@polaris/shared-types';

export class CreateCheckoutDto {
  @IsOptional()
  @IsString()
  billingCycle?: 'MONTHLY' | 'SEMESTER' | 'ANNUAL';

  @IsOptional()
  @IsString()
  planTier?: string;

  @IsOptional()
  @IsString()
  matrixId?: string;
}

export interface CheckoutResponseDto {
  invoiceNumber: string;
  amountIdr: number;
  snapToken: string;
  redirectUrl: string;
}

export interface RecentInvoiceSummaryDto {
  invoiceNumber: string;
  grossAmountIdr: number;
  netAmountIdr: number;
  paymentMethod: string | null;
  paymentStatus: string;
  settlementTime: string | null;
  reconciliationStatus: string;
}

export interface BillingStatusDto {
  subscriptionStatus: string;
  planTier: string;
  currentPeriodEnd: string | null;
  legislativeLevel?: string;
  tierOfferings?: TierOfferingDto[];
  availablePlans?: Array<{
    id: string;
    matrixId?: string;
    name?: string;
    durationLabel?: string;
    badge?: string;
    badgeClass?: string;
    tier: string;
    cycle: string;
    durationDays: number;
    amountIdr: number;
    priceFormatted?: string;
    originalPriceFormatted?: string | null;
    rateNote?: string;
    tagline?: string;
    savings?: string | null;
    highlight?: boolean;
    perks?: string[];
  }>;
  quota: {
    billingMonth: string;
    articleLimit: number;
    articleUsed: number;
    articleRemaining: number;
    dalleLimit: number;
    dalleUsed: number;
    dalleRemaining: number;
    totalTokensConsumed: number;
    estimatedCostUsd: number;
    estimatedCostIdr: number;
    isUnlimited: boolean;
  };
  recentInvoice?: RecentInvoiceSummaryDto | null;
  gatewayConfig?: {
    clientKey: string;
    isProduction: boolean;
    snapScriptUrl: string;
  };
}
