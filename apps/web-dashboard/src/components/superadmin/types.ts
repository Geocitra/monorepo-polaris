export interface DashboardStats {
  totalTenants: number;
  activeSubscriptions: number;
  totalArticles: number;
  totalFeedbacks: number;
  totalParties: number;
}

export interface RecentTenant {
  id: string;
  fullName: string;
  email: string;
  partyAffiliation: string;
  legislativeLevel: string;
  isVerified: boolean;
  accountStatus: string;
  createdAt: string;
}

export interface TenantRow {
  id: string;
  fullName: string;
  email: string;
  username?: string | null;
  mustChangePassword?: boolean;
  temporaryPasswordPlaintextPreview?: string | null;
  passwordChangedAt?: string | null;
  phoneNumber: string;
  partyAffiliation: string;
  legislativeLevel: string;
  isVerified: boolean;
  accountStatus: string;
  internalNotes: string | null;
  createdAt: string;
  subdomainSlug: string | null;
  customDomain: string | null;
  subscriptionStatus: string | null;
  planTier: string | null;
  periodEnd: string | null;
  dapilName: string | null;
  provinceName: string | null;
  commissionId: string | null;
  commissionName: string | null;
}

export interface PricingMatrixRow {
  id: string;
  legislativeLevel: string;
  planTier: string;
  billingCycle: string;
  durationDays: number;
  amountIdr: number;
  isActive: boolean;
  updatedAt: string;
}

export interface InquiryRow {
  id: string;
  fullName: string;
  phoneNumber: string;
  officialEmail: string;
  partyAffiliation: string | null;
  legislativeLevel: string;
  targetRegion: string;
  preferredCycle: string;
  preferredTier: string;
  meetingDatetime: string | null;
  meetingUrl: string | null;
  adminNotes: string | null;
  status: 'NEW_LEAD' | 'MEETING_SCHEDULED' | 'PROPOSAL_SENT' | 'DEAL_CONVERTED' | 'REJECTED_DROPPED';
  handledByAdminId: string | null;
  convertedTenantId: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface PoliticalParty {
  id: string;
  code: string;
  name: string;
  ballotNumber: number | null;
  primaryColor: string;
  secondaryColor: string | null;
  logoUrl: string | null;
  description: string | null;
  isActive: boolean;
}

export interface DapilItem {
  id: string;
  dapilCode: string;
  dapilName: string;
  provinceName: string;
  regencyCoverage: string[];
  totalVoters: number | null;
}

export interface CommissionItem {
  id: string;
  code: string;
  name: string;
  legislativeLevel: string;
  focusAreas: string[] | null;
  partnerMinistries: string[] | null;
}
