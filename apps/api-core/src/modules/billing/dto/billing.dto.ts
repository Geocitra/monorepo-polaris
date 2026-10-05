import { IsOptional, IsString } from 'class-validator';

export class CreateCheckoutDto {
  @IsOptional()
  @IsString()
  billingCycle?: 'MONTHLY' | 'SEMESTER' | 'ANNUAL';

  @IsOptional()
  @IsString()
  planTier?: string;
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
