export interface AttachedFileItem {
  id: string;
  name: string;
  size: number;
  type: string;
  base64: string;
}

export interface GeneratedFullResult {
  publication: {
    id: string;
    title: string;
    bodyContentMarkdown: string;
    excerpt?: string;
    status: string;
    slug?: string;
  };
  posterUrl?: string;
  socialPack?: {
    whatsappBroadcastText?: string;
    whatsappBroadcast?: string;
    instagramCaption?: string;
    twitterThreads?: string[];
  };
  infographicData?: any;
}

export interface AssignedTenant {
  assignmentId: string;
  canDirectPublish: boolean;
  assignmentStatus: string;
  tenantId: string;
  fullName: string;
  photoUrl: string | null;
  partyAffiliation: string | null;
  legislativeLevel: string;
  customDapilName: string | null;
  commissionName: string | null;
  subscriptionStatus?: string | null;
  todayStats: {
    totalToday: number;
    publishedToday: number;
    draftToday: number;
    hasPublishedToday: boolean;
  };
  briefStats?: {
    pendingBriefs: number;
    inProgressBriefs: number;
    revisionRequestedBriefs: number;
  };
}

export interface BriefMessageItem {
  id: string;
  briefId: string;
  tenantId: string;
  direction: 'INBOUND' | 'OUTBOUND';
  messageType: 'TEXT' | 'IMAGE' | 'DOCUMENT' | 'INTERACTIVE' | 'SYSTEM';
  waMessageId: string | null;
  textBody: string | null;
  mediaCdnUrl: string | null;
  mediaMimeType: string | null;
  mediaFileName: string | null;
  mediaFileSizeBytes: number | null;
  revisionRound: number;
  targetComponents: ('ARTICLE' | 'IMAGE' | 'CAPTION')[];
  isInternalFault: boolean;
  createdAt: string;
}

export interface ContentBriefItem {
  id: string;
  briefCode: string;
  tenantId: string;
  tenantFullName: string;
  tenantMaskedPhone: string;
  assignedOperatorId: string | null;
  status:
    | 'DRAFT_COLLECTING'
    | 'SUBMITTED'
    | 'QUEUED_NEXT_WEEK'
    | 'ACCEPTED'
    | 'NEED_CLARIFICATION'
    | 'IN_PROGRESS'
    | 'READY_FOR_REVIEW'
    | 'REVISION_REQUESTED'
    | 'APPROVED'
    | 'PUBLISHED'
    | 'REJECTED'
    | 'CANCELLED';
  clientUrgency: 'URGENT' | 'NORMAL';
  operatorPriority: 'URGENT' | 'NORMAL';
  packageType?: 'FULL_CAMPAIGN' | 'ARTICLE_ONLY' | 'POSTER_ONLY' | 'INFOGRAPHIC_ONLY';
  targetWindow?: 'TODAY_PRIORITY' | 'TODAY_REGULAR' | 'NEXT_DAY_MORNING';
  topicSummary: string;
  weeklyQuotaPeriod: string;
  weeklyRequestLimit: number;
  revisionUsed: number;
  revisionLimit: number;
  articleStatus: string;
  imageStatus: string;
  captionStatus: string;
  linkedPublicationId: string | null;
  acceptedAt: string | null;
  submittedForReviewAt: string | null;
  approvedAt: string | null;
  publishedAt: string | null;
  operatorNotes: string | null;
  createdAt: string;
  updatedAt: string;
  quotaCostDeducted?: number;
  isUrgentOverquota?: boolean;
  messages: BriefMessageItem[];
}

export interface TenantWeeklyBriefQuota {
  tenantId: string;
  weeklyQuotaPeriod: string;
  weeklyLimit: number;
  weeklyUsed: number;
  weeklyRemaining: number;
  queuedNextWeekCount: number;
  totalQuotaAllocated?: number;
  remainingQuota?: number;
  currentPeriodEnd?: string | null;
  isPeriodExpired?: boolean;
}

export interface TenantContextData {
  tenant: {
    id: string;
    fullName: string;
    partyAffiliation: string | null;
    legislativeLevel: string;
    customDapilName: string | null;
    commissionName: string | null;
    photoUrl: string | null;
    issueInterests: string[] | null;
    education: string | null;
  };
  subscriptionStatus?: string | null;
  quota: {
    articleLimit: number;
    articleUsed: number;
    dalleLimit: number;
    dalleUsed: number;
    totalTokensConsumed: number;
    billingCycleMonth: string;
  } | null;
}

export type OperatorTabType =
  | 'CONTENT'
  | 'BRIEFS'
  | 'ARTICLES'
  | 'KNOWLEDGE'
  | 'PROFILE'
  | 'ASPIRASI'
  | 'COMMENTS';

export type OperatorViewMode = 'WORKSPACE' | 'DIRECTORY';

export const DEFAULT_TOPICS = [
  'Distribusi Pupuk Bersubsidi & Bantuan Petani Daerah',
  'Perbaikan Jalan Rusak & Infrastruktur Desa',
  'Layanan Rujukan BPJS & Kualitas Faskes Daerah',
  'Akses Modal Usaha UMKM & Lapangan Kerja Pemuda',
];

export function getPartyBranding(party?: string | null) {
  const p = (party || '').toUpperCase();
  if (p.includes('GOLKAR') || p.includes('HANURA')) {
    return {
      accent: 'amber',
      gradient: 'from-amber-500/15 via-yellow-500/5 to-transparent',
      border: 'border-amber-500/40',
      badge: 'bg-amber-100/80 text-amber-900 dark:bg-amber-950/60 dark:text-amber-300 border-amber-300 dark:border-amber-700/60',
      pill: 'bg-amber-500 text-white',
      avatarRing: 'ring-amber-500',
    };
  }
  if (p.includes('PDI') || p.includes('PSI')) {
    return {
      accent: 'rose',
      gradient: 'from-rose-500/15 via-red-500/5 to-transparent',
      border: 'border-rose-500/40',
      badge: 'bg-rose-100/80 text-rose-900 dark:bg-rose-950/60 dark:text-rose-300 border-rose-300 dark:border-rose-700/60',
      pill: 'bg-rose-600 text-white',
      avatarRing: 'ring-rose-500',
    };
  }
  if (p.includes('GERINDRA') || p.includes('DEMOKRAT')) {
    return {
      accent: 'blue',
      gradient: 'from-blue-600/15 via-indigo-500/5 to-transparent',
      border: 'border-blue-500/40',
      badge: 'bg-blue-100/80 text-blue-900 dark:bg-blue-950/60 dark:text-blue-300 border-blue-300 dark:border-blue-700/60',
      pill: 'bg-blue-600 text-white',
      avatarRing: 'ring-blue-500',
    };
  }
  if (p.includes('PKB') || p.includes('PPP') || p.includes('PKS')) {
    return {
      accent: 'emerald',
      gradient: 'from-emerald-600/15 via-teal-500/5 to-transparent',
      border: 'border-emerald-500/40',
      badge: 'bg-emerald-100/80 text-emerald-900 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-300 dark:border-emerald-700/60',
      pill: 'bg-emerald-600 text-white',
      avatarRing: 'ring-emerald-500',
    };
  }
  if (p.includes('NASDEM')) {
    return {
      accent: 'sky',
      gradient: 'from-sky-500/15 via-blue-600/5 to-transparent',
      border: 'border-sky-500/40',
      badge: 'bg-sky-100/80 text-sky-900 dark:bg-sky-950/60 dark:text-sky-300 border-sky-300 dark:border-sky-700/60',
      pill: 'bg-sky-600 text-white',
      avatarRing: 'ring-sky-500',
    };
  }
  return {
    accent: 'indigo',
    gradient: 'from-indigo-600/15 via-slate-500/5 to-transparent',
    border: 'border-indigo-500/40',
    badge: 'bg-indigo-100/80 text-indigo-900 dark:bg-indigo-950/60 dark:text-indigo-300 border-indigo-300 dark:border-indigo-700/60',
    pill: 'bg-indigo-600 text-white',
    avatarRing: 'ring-indigo-500',
  };
}

