import { 
  PlanTier, 
  ContentStatus, 
  IssueCategory, 
  SubscriptionStatus, 
  LegislativeLevel, 
  SocialPlatform, 
  PaymentStatus,
  FeedbackStatus,
  CommentStatus,
  ReconciliationStatus,
  ReconciliationBatchStatus,
  DiscrepancyType,
  DiscrepancyResolutionStatus,
  InquiryStatus,
  BillingCycle,
  PortalTemplateId,
} from '../enums/index.js';

// ==========================================
// 1. IDENTITY & TENANT DTOs
// ==========================================
export interface RegisterTenantDto {
  email: string;
  fullName: string;
  phoneNumber: string;
  partyAffiliation?: string | null;
  legislativeLevel: LegislativeLevel;
  electoralDistrictId: string;
  subdomainSlug: string;
  planTier: PlanTier;
}

export interface TenantProfileResponseDto {
  id: string;
  email: string;
  fullName: string;
  phoneNumber: string;
  partyAffiliation?: string | null;
  legislativeLevel: LegislativeLevel;
  dapilName: string;
  subdomain: string;
  subscriptionStatus: SubscriptionStatus;
  username?: string | null;
  mustChangePassword?: boolean;
  photoUrl?: string | null;
  gender?: string | null;
  birthDate?: string | null;
  education?: string | null;
  courses?: string[];
  issueInterests?: string[];
}

// ==========================================
// 2. STUDIO AI & CONTENT DTOs
// ==========================================
export interface GenerateArticleRequestDto {
  topic: string;
  targetAudience?: string;
  toneOverride?: string;
  comparisonRegion?: string; // Misal: Membandingkan Cirebon dengan Bandung
  generateDallePoster: boolean;
}

export interface InfographicDataSpecDto {
  headline: string;
  keyStatistics: Array<{
    label: string;
    value: string;
    context: string;
  }>;
  policyTakeaway: string;
  colorHexSuggestion: string;
}

export interface ContentPublicationDto {
  id: string;
  tenantId: string;
  title: string;
  slug: string;
  excerpt: string;
  bodyContentMarkdown: string; // 3.000 kata teknokratis
  wordCount: number;
  status: ContentStatus;
  canonicalUrl: string;
  commentCount: number;
  publishedAt?: string | null;
  dallePosterUrl?: string | null;
  socialSyndication?: {
    instagramCaption: string;
    twitterThreads: string[];
    whatsappBroadcastText: string;
  } | null;
}

// ==========================================
// 3. BILLING & QUOTA DTOs
// ==========================================
export interface QuotaBalanceDto {
  billingMonth: string;
  articleUsed: number;
  dalleUsed: number;
  totalTokensConsumed: number;
  estimatedCostUsd: number;
  estimatedCostIdr: number;
  isUnlimited: boolean;
  billingCycleMonth?: string;
  articleLimit?: number;
  articleRemaining?: number;
  dalleLimit?: number;
  dalleRemaining?: number;
}

export interface CyclePriceItemDto {
  matrixId: string;
  cycle: string;
  durationDays: number;
  amountIdr: number;
  priceFormatted: string;
  monthlyRateFormatted: string;
  savingsNote?: string;
}

export interface TierOfferingDto {
  tier: PlanTier;
  name: string;
  badge: string;
  tagline: string;
  isCurrentTier: boolean;
  entitlements: {
    thematicLayouts: boolean;
    customDomain: boolean;
    spkSupport: boolean;
    priorityQueue: boolean;
  };
  perks: string[];
  pricing: Record<string, CyclePriceItemDto>;
}

export interface BillingStatusDto {
  subscriptionStatus: string;
  planTier: string;
  currentPeriodEnd: string | null;
  quota: QuotaBalanceDto;
  legislativeLevel?: LegislativeLevel;
  availablePlans?: IsolatedPlanOptionDto[];
  tierOfferings?: TierOfferingDto[];
  gatewayConfig?: {
    clientKey: string;
    isProduction: boolean;
    snapScriptUrl: string;
  };
}

export interface CreateInvoiceResponseDto {
  invoiceNumber: string;
  amountIdr: number;
  snapToken: string;
  redirectUrl: string;
}

export interface PaymentWebhookPayloadDto {
  orderId: string;
  statusCode: string;
  grossAmount: string;
  signatureKey: string;
  transactionStatus: string;
  fraudStatus?: string;
  paymentType: string;
  settlementTime?: string;
}

// ==========================================
// 4. CMS & MICROSITE DTOs
// ==========================================
export interface UpdatePortalThemeDto {
  primaryHexColor: string;
  secondaryHexColor: string;
  fontFamily: string;
  heroBannerUrl?: string;
  officialPhotoUrl?: string;
  headlineTagline: string;
  bioBiography: string;
  layoutTemplateId?: string | PortalTemplateId;
  socialLinks?: Array<{
    platform: SocialPlatform;
    profileUrl: string;
  }>;
}

export interface PublicPortalDataDto {
  subdomainSlug: string;
  customDomain?: string | null;
  officialName: string;
  partyAffiliation?: string | null;
  dapilName: string;
  theme: {
    primaryColor: string;
    secondaryColor: string;
    fontFamily: string;
    heroBannerUrl?: string | null;
    officialPhotoUrl?: string | null;
    tagline?: string | null;
    bio?: string | null;
    layoutTemplateId?: string;
  };
  socialLinks: Array<{
    platform: SocialPlatform;
    profileUrl: string;
  }>;
  recentArticles: Array<{
    title: string;
    slug: string;
    excerpt: string;
    publishedAt: string;
    thumbnailUrl?: string | null;
  }>;
}

// ==========================================
// 5. CONSTITUENT FEEDBACK DTOs (UU PDP)
// ==========================================
export interface SubmitFeedbackDto {
  subdomainSlug: string;
  citizenName: string;
  phoneNumber: string;
  regencyName: string;
  districtKecamatan: string;
  category: IssueCategory;
  aspirationMessage: string;
  turnstileToken: string; // Token verifikasi Captcha Cloudflare
}

export interface FeedbackTicketResponseDto {
  trackingTicketCode: string;
  submittedAt: string;
  status: FeedbackStatus;
  message: string;
}

// ==========================================
// 6. CITIZEN COMMENTS & GOOGLE AUTH DTOs
// ==========================================
export interface GoogleAuthDto {
  credential?: string; // ID Token dari Google Identity Services
  isDevMock?: boolean;
  mockName?: string;
  mockEmail?: string;
  mockAvatar?: string;
}

export interface CitizenProfileDto {
  id: string;
  googleId: string;
  email: string;
  fullName: string;
  avatarUrl?: string | null;
  isBanned: boolean;
}

export interface CitizenAuthResponseDto {
  token: string;
  citizen: CitizenProfileDto;
}

export interface CreateCommentDto {
  commentText: string;
  parentCommentId?: string | null;
}

export interface CommentItemDto {
  id: string;
  publicationId: string;
  parentCommentId: string | null;
  commentText: string;
  status: CommentStatus;
  likesCount: number;
  createdAt: string;
  updatedAt: string;
  citizen: {
    id: string;
    fullName: string;
    avatarUrl?: string | null;
  };
  replies?: CommentItemDto[];
}

export interface ModerateCommentDto {
  status: CommentStatus;
}

// ==========================================
// 7. FINANCIAL ACCOUNTING & RECONCILIATION DTOs
// ==========================================
export interface InvoiceTransactionItemDto {
  id: string;
  invoiceNumber: string;
  amountIdr: number;
  grossAmountIdr: number;
  mdrFeeIdr: number;
  vatFeeIdr: number;
  netAmountIdr: number;
  gatewayOrderId: string;
  paymentMethod: string | null;
  paymentStatus: string;
  paidAt: string | null;
  settlementTime: string | null;
  reconciliationStatus: 'UNRECONCILED' | 'MATCHED' | 'DISCREPANCY';
  createdAt: string;
}

export interface ReconciliationBatchSummaryDto {
  id: string;
  batchNumber: string;
  reconDate: string;
  sourceGateway: string;
  totalGatewayTransactions: number;
  totalInternalTransactions: number;
  totalMatchedTransactions: number;
  totalDiscrepancies: number;
  totalGrossAmountIdr: number;
  totalMdrFeeIdr: number;
  totalNetAmountIdr: number;
  status: ReconciliationBatchStatus;
  rawReportStorageUrl?: string | null;
  executedBy: string;
  notes?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ReconciliationDiscrepancyDto {
  id: string;
  batchId: string;
  invoiceId?: string | null;
  gatewayOrderId: string;
  discrepancyType: DiscrepancyType;
  internalStatus?: string | null;
  gatewayStatus?: string | null;
  internalAmountIdr: number;
  gatewayAmountIdr: number;
  discrepancyAmountIdr: number;
  resolutionStatus: DiscrepancyResolutionStatus;
  resolutionNotes?: string | null;
  resolvedBy?: string | null;
  resolvedAt?: string | null;
  createdAt: string;
}

export interface ResolveDiscrepancyRequestDto {
  resolutionStatus: DiscrepancyResolutionStatus.MANUALLY_RESOLVED | DiscrepancyResolutionStatus.IGNORED;
  resolutionNotes: string;
}

export interface GatewaySettlementRecordDto {
  gatewayOrderId: string;
  grossAmountIdr: number;
  mdrFeeIdr: number;
  vatFeeIdr: number;
  netAmountIdr: number;
  paymentType: string;
  paymentStatus: string;
  transactionTime: string;
  settlementTime: string;
}

// ==========================================
// 8. LICENSE INQUIRIES & LEAD CRM DTOs
// ==========================================
export interface SubmitInquiryDto {
  fullName: string;
  phoneNumber: string;
  officialEmail: string;
  partyAffiliation?: string | null;
  legislativeLevel: LegislativeLevel;
  targetRegion: string;
  preferredCycle?: BillingCycle | string;
  preferredTier?: PlanTier;
}

export interface ScheduleMeetDto {
  inquiryId: string;
  meetingDatetime: string;
  meetingUrl: string;
  adminNotes?: string;
}

export interface UpdateInquiryStatusDto {
  status: InquiryStatus;
  adminNotes?: string;
}

export interface InquiryItemDto {
  id: string;
  fullName: string;
  phoneNumber: string;
  officialEmail: string;
  partyAffiliation: string | null;
  legislativeLevel: LegislativeLevel;
  targetRegion: string;
  preferredCycle: string;
  preferredTier: PlanTier;
  meetingDatetime: string | null;
  meetingUrl: string | null;
  adminNotes: string | null;
  status: InquiryStatus;
  handledByAdminId: string | null;
  convertedTenantId: string | null;
  createdAt: string;
  updatedAt: string;
}

// ==========================================
// 9. DYNAMIC PRICING MATRIX DTOs
// ==========================================
export interface PricingMatrixItemDto {
  id: string;
  legislativeLevel: LegislativeLevel;
  planTier: PlanTier;
  billingCycle: BillingCycle | string;
  durationDays: number;
  amountIdr: number;
  isActive: boolean;
  updatedAt: string;
}

export interface IsolatedPlanOptionDto {
  tier: PlanTier;
  cycle: BillingCycle | string;
  durationDays: number;
  amountIdr: number;
  pricePerMonthIdr: number;
  discountPercent?: number;
}

export interface UpdatePricingMatrixDto {
  amountIdr?: number;
  durationDays?: number;
  isActive?: boolean;
}

// ==========================================
// 10. IDENTITY SECURITY & ADMIN CREDENTIAL DTOs
// ==========================================
export interface ForceChangeInitialPasswordDto {
  currentPassword: string;
  newPassword: string;
}

export interface AdminCreateTenantWithCredentialDto {
  email: string;
  username?: string;
  fullName: string;
  phoneNumber: string;
  partyAffiliation?: string | null;
  legislativeLevel: LegislativeLevel;
  electoralDistrictId?: string | null;
  customDapilName?: string | null;
  subdomainSlug: string;
  planTier: PlanTier;
  billingCycle?: BillingCycle | string;
  generatePrepaidInvoice?: boolean;
}

export interface AdminResetPasswordDto {
  tenantId: string;
  newPassword?: string;
}

export interface AdminCreatedTenantResponseDto {
  id: string;
  email: string;
  username: string;
  fullName: string;
  temporaryPasswordPlaintext: string;
  subdomainSlug: string;
  legislativeLevel: LegislativeLevel;
  planTier: PlanTier;
  prepaidInvoice?: {
    orderId: string;
    amountIdr: number;
    paymentType?: string;
    snapToken?: string;
    redirectUrl?: string;
  } | null;
}




