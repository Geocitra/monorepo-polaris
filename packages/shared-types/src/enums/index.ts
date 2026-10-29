export enum LegislativeLevel {
  DPR_RI = 'DPR_RI',
  DPD_RI = 'DPD_RI',
  MPR_RI = 'MPR_RI',
  DPRD_PROVINSI = 'DPRD_PROVINSI',
  DPRD_KABUPATEN_KOTA = 'DPRD_KABUPATEN_KOTA',
  KEPALA_DAERAH_GUBERNUR = 'KEPALA_DAERAH_GUBERNUR',
  KEPALA_DAERAH_WALIKOTA_BUPATI = 'KEPALA_DAERAH_WALIKOTA_BUPATI',
  PEJABAT_BIROKRAT_DIRJEN_SEKJEN_OPD = 'PEJABAT_BIROKRAT_DIRJEN_SEKJEN_OPD',
  PIMPINAN_LEMBAGA_REKTOR_SWASTA = 'PIMPINAN_LEMBAGA_REKTOR_SWASTA',
}

export type PublicOfficeRole = LegislativeLevel;
export const PublicOfficeRole = LegislativeLevel;

export enum SuperadminRole {
  SUPERADMIN = 'SUPERADMIN',
  SUPPORT_OPERATOR = 'SUPPORT_OPERATOR',
  CONTENT_OPERATOR = 'CONTENT_OPERATOR',
  FINANCE_ADMIN = 'FINANCE_ADMIN',
}

export enum OperatorAssignmentStatus {
  ACTIVE = 'ACTIVE',
  PAUSED = 'PAUSED',
  REVOKED = 'REVOKED',
}

export enum ContentCreationContext {
  MEMBER = 'MEMBER',
  OPERATOR = 'OPERATOR',
  SYSTEM_AI = 'SYSTEM_AI',
}

export enum OperatorAuditAction {
  CONTENT_CREATE = 'CONTENT_CREATE',
  CONTENT_UPDATE = 'CONTENT_UPDATE',
  CONTENT_PUBLISH = 'CONTENT_PUBLISH',
  CONTENT_DELETE = 'CONTENT_DELETE',
  COMMENT_MODERATE = 'COMMENT_MODERATE',
  FEEDBACK_TRIAGE = 'FEEDBACK_TRIAGE',
}


export enum TenantAccountStatus {
  ACTIVE = 'ACTIVE',
  SUSPENDED = 'SUSPENDED',
  PENDING_VERIFICATION = 'PENDING_VERIFICATION',
}

export enum SubscriptionStatus {
  INACTIVE = 'INACTIVE',
  PENDING_PAYMENT = 'PENDING_PAYMENT',
  ACTIVE = 'ACTIVE',
  GRACE_PERIOD = 'GRACE_PERIOD',
  SUSPENDED = 'SUSPENDED',
  ARCHIVED = 'ARCHIVED',
}

export enum PlanTier {
  STARTER = 'STARTER',
  PRO = 'PRO',
}

export enum PaymentStatus {
  PENDING = 'PENDING',
  SETTLEMENT = 'SETTLEMENT',
  EXPIRED = 'EXPIRED',
  FAILED = 'FAILED',
}

export enum ContentStatus {
  GENERATING = 'GENERATING',
  DRAFT = 'DRAFT',
  UNDER_REVIEW = 'UNDER_REVIEW',
  PUBLISHED = 'PUBLISHED',
  UNPUBLISHED = 'UNPUBLISHED',
  ARCHIVED = 'ARCHIVED',
}

export enum AssetType {
  DALLE_POSTER = 'DALLE_POSTER',
  INFOGRAPHIC_PNG = 'INFOGRAPHIC_PNG',
  HEADER_IMAGE = 'HEADER_IMAGE',
}

export enum DocType {
  PERDA = 'PERDA',
  PERBUP = 'PERBUP',
  APBD = 'APBD',
  RPJMD = 'RPJMD',
  BPS_STATISTIC = 'BPS_STATISTIC',
  NOTULA_SIDANG = 'NOTULA_SIDANG',
  REPORT_TRIWULAN = 'REPORT_TRIWULAN',
  DRAFT_RUU = 'DRAFT_RUU',
  BULETIN = 'BULETIN',
  KAJIAN_AKADEMIS = 'KAJIAN_AKADEMIS',
  OTHER = 'OTHER',
}

export enum LegalStatus {
  BERLAKU = 'BERLAKU',
  DICABUT = 'DICABUT',
  DIUJI_MK = 'DIUJI_MK',
}

export enum SocialPlatform {
  INSTAGRAM = 'INSTAGRAM',
  THREADS = 'THREADS',
  X_TWITTER = 'X_TWITTER',
  TIKTOK = 'TIKTOK',
  YOUTUBE = 'YOUTUBE',
  WHATSAPP = 'WHATSAPP',
}

export enum FeedbackStatus {
  RECEIVED = 'RECEIVED',
  VERIFIED = 'VERIFIED',
  RESPONDED = 'RESPONDED',
  ARCHIVED = 'ARCHIVED',
}

export enum IssueCategory {
  INFRASTRUKTUR = 'INFRASTRUKTUR',
  PERTANIAN = 'PERTANIAN',
  PENDIDIKAN = 'PENDIDIKAN',
  KESEHATAN = 'KESEHATAN',
  BANSOS_UMKM = 'BANSOS_UMKM',
  LAINNYA = 'LAINNYA',
}

export enum PolicySector {
  FISKAL_ANGGARAN = 'FISKAL_ANGGARAN',
  INFRASTRUKTUR_RUANG = 'INFRASTRUKTUR_RUANG',
  PANGAN_PERTANIAN = 'PANGAN_PERTANIAN',
  SOSIAL_KEMISKINAN = 'SOSIAL_KEMISKINAN',
  LAYANAN_DASAR = 'LAYANAN_DASAR',
  TATA_KELOLA_HUKUM = 'TATA_KELOLA_HUKUM',
  EKONOMI_KETENAGAKERJAAN = 'EKONOMI_KETENAGAKERJAAN',
  LINGKUNGAN_BENCANA = 'LINGKUNGAN_BENCANA',
}

export enum CommentStatus {
  PUBLISHED = 'PUBLISHED',
  PENDING_REVIEW = 'PENDING_REVIEW',
  HIDDEN = 'HIDDEN',
  FLAGGED_SPAM = 'FLAGGED_SPAM',
}

export enum CustomDomainStatus {
  UNVERIFIED = 'UNVERIFIED',
  PENDING_VERIFICATION = 'PENDING_VERIFICATION',
  VERIFIED = 'VERIFIED',
  FAILED = 'FAILED',
}

export enum ReconciliationStatus {
  UNRECONCILED = 'UNRECONCILED',
  MATCHED = 'MATCHED',
  DISCREPANCY = 'DISCREPANCY',
}

export enum ReconciliationBatchStatus {
  PROCESSING = 'PROCESSING',
  BALANCED = 'BALANCED',
  DISCREPANCY_DETECTED = 'DISCREPANCY_DETECTED',
  RESOLVED = 'RESOLVED',
}

export enum DiscrepancyType {
  STATUS_MISMATCH = 'STATUS_MISMATCH',
  AMOUNT_MISMATCH = 'AMOUNT_MISMATCH',
  MISSING_IN_INTERNAL = 'MISSING_IN_INTERNAL',
  MISSING_IN_GATEWAY = 'MISSING_IN_GATEWAY',
  FEE_MISMATCH = 'FEE_MISMATCH',
}

export enum DiscrepancyResolutionStatus {
  UNRESOLVED = 'UNRESOLVED',
  AUTO_RESOLVED = 'AUTO_RESOLVED',
  MANUALLY_RESOLVED = 'MANUALLY_RESOLVED',
  IGNORED = 'IGNORED',
}

export enum InquiryStatus {
  NEW_LEAD = 'NEW_LEAD',
  MEETING_SCHEDULED = 'MEETING_SCHEDULED',
  PROPOSAL_SENT = 'PROPOSAL_SENT',
  DEAL_CONVERTED = 'DEAL_CONVERTED',
  REJECTED_DROPPED = 'REJECTED_DROPPED',
}

export enum BillingCycle {
  MONTHLY = 'MONTHLY',
  SEMESTER = 'SEMESTER',
  ANNUAL = 'ANNUAL',
}

export enum PortalTemplateId {
  STANDARD_DEFAULT = 'standard-default',
  EDITORIAL_PRESTIGE = 'editorial-prestige',
  BALIHO_HERO = 'baliho-hero',
  NEWSROOM_BRIEF = 'newsroom-brief',
  POLARIS_INSIGHT = 'polaris-insight',
  DARK_MODERN = 'dark-modern',
  BOLD_TYPOGRAPHY = 'bold-typography',
  NEON_GLOW = 'neon-glow',
  CREATIVE_WARM = 'creative-warm',
  CLEAN_EDITORIAL = 'clean-editorial',
  WARM_PORTFOLIO = 'warm-portfolio',
  MIDNIGHT_GOLD = 'midnight-gold',
  EMERALD_TECH = 'emerald-tech',
  QURIFOLIO = 'qurifolio',
  AMBER_PORTFOLIO = 'amber-portfolio',
  MIDNIGHT_LIME = 'midnight-lime',
  PLATINUM_SLATE = 'platinum-slate',
  CREATIX_LIME = 'creatix-lime',
  STUDIO_EDITORIAL = 'studio-editorial',
  FOLIOBLOX = 'folioblox',
  NAYA_EDITORIAL = 'naya-editorial',
  CRIMSON_NOIR = 'crimson-noir',
  GOLDEN_SPLIT = 'golden-split',
  BLUSH_EDITORIAL = 'blush-editorial',
  PARICHAY_AMBER = 'parichay-amber',
  ORIX_VIOLET = 'orix-violet',
  AGETHA_RUBY = 'agetha-ruby',
  WASHOSKI_CYAN = 'washoski-cyan',
  ARIK_NOIR = 'arik-noir',
  ANIVIOX_EMERALD = 'aniviox-emerald',
  LAILA_SAKURA = 'laila-sakura',
  NEXORA_VIOLET = 'nexora-violet',
  XENON_MINT = 'xenon-mint',
  TIARA_BURGUNDY = 'tiara-burgundy',
}

export const TEMPLATE_DEFAULT_COLORS: Record<string, { primary: string; secondary: string }> = {
  [PortalTemplateId.STANDARD_DEFAULT]: { primary: '#1890FF', secondary: '#001529' },
  [PortalTemplateId.POLARIS_INSIGHT]: { primary: '#1890FF', secondary: '#001529' },
  [PortalTemplateId.PLATINUM_SLATE]: { primary: '#94A3B8', secondary: '#0F172A' },
  [PortalTemplateId.DARK_MODERN]: { primary: '#1877F2', secondary: '#0F172A' },
  [PortalTemplateId.BOLD_TYPOGRAPHY]: { primary: '#DC2626', secondary: '#450A0A' },
  [PortalTemplateId.NEON_GLOW]: { primary: '#8B5CF6', secondary: '#2E1065' },
  [PortalTemplateId.CREATIVE_WARM]: { primary: '#F59E0B', secondary: '#78350F' },
  [PortalTemplateId.CLEAN_EDITORIAL]: { primary: '#6366F1', secondary: '#1E1B4B' },
  [PortalTemplateId.WARM_PORTFOLIO]: { primary: '#F59E0B', secondary: '#292524' },
  [PortalTemplateId.MIDNIGHT_GOLD]: { primary: '#FFBD39', secondary: '#1F1900' },
  [PortalTemplateId.EMERALD_TECH]: { primary: '#10B981', secondary: '#064E3B' },
  [PortalTemplateId.QURIFOLIO]: { primary: '#FF6B00', secondary: '#2D1200' },
  [PortalTemplateId.AMBER_PORTFOLIO]: { primary: '#EA580C', secondary: '#1C1917' },
  [PortalTemplateId.MIDNIGHT_LIME]: { primary: '#D4F63D', secondary: '#0B132B' },
  [PortalTemplateId.CREATIX_LIME]: { primary: '#84CC16', secondary: '#1A2E05' },
  [PortalTemplateId.STUDIO_EDITORIAL]: { primary: '#B45309', secondary: '#1C1917' },
  [PortalTemplateId.FOLIOBLOX]: { primary: '#FF4500', secondary: '#0F0F10' },
  [PortalTemplateId.NAYA_EDITORIAL]: { primary: '#65654E', secondary: '#2B2B20' },
  [PortalTemplateId.CRIMSON_NOIR]: { primary: '#D62828', secondary: '#0D0D0D' },
  [PortalTemplateId.GOLDEN_SPLIT]: { primary: '#FFA800', secondary: '#171717' },
  [PortalTemplateId.BLUSH_EDITORIAL]: { primary: '#D47A6A', secondary: '#261C1A' },
  [PortalTemplateId.PARICHAY_AMBER]: { primary: '#EA580C', secondary: '#1C1917' },
  [PortalTemplateId.ORIX_VIOLET]: { primary: '#7C3AED', secondary: '#1E085A' },
  [PortalTemplateId.AGETHA_RUBY]: { primary: '#E50914', secondary: '#0F0F0F' },
  [PortalTemplateId.WASHOSKI_CYAN]: { primary: '#05DFD7', secondary: '#000000' },
  [PortalTemplateId.ARIK_NOIR]: { primary: '#E8DCC4', secondary: '#0A0A0A' },
  [PortalTemplateId.ANIVIOX_EMERALD]: { primary: '#00F076', secondary: '#060A08' },
  [PortalTemplateId.LAILA_SAKURA]: { primary: '#FF4D8D', secondary: '#080D1A' },
  [PortalTemplateId.NEXORA_VIOLET]: { primary: '#7B61FF', secondary: '#0F0B1E' },
  [PortalTemplateId.XENON_MINT]: { primary: '#00E599', secondary: '#081018' },
  [PortalTemplateId.TIARA_BURGUNDY]: { primary: '#6B1724', secondary: '#20060A' },
  [PortalTemplateId.EDITORIAL_PRESTIGE]: { primary: '#1890FF', secondary: '#001529' },
  [PortalTemplateId.BALIHO_HERO]: { primary: '#1890FF', secondary: '#001529' },
  [PortalTemplateId.NEWSROOM_BRIEF]: { primary: '#1890FF', secondary: '#001529' },
};

export enum PortalSectionType {
  HERO_FEATURED_STORY = 'HERO_FEATURED_STORY',
  HERO_PARLIAMENT_STAND = 'HERO_PARLIAMENT_STAND',
  HERO_VIDEO_LOOP = 'HERO_VIDEO_LOOP',
  ARTICLES_FEATURED_GRID = 'ARTICLES_FEATURED_GRID',
  ARTICLES_TRENDING_SIDEBAR = 'ARTICLES_TRENDING_SIDEBAR',
  ARTICLES_CATEGORY_GRID = 'ARTICLES_CATEGORY_GRID',
  DOCUMENTS_LIBRARY = 'DOCUMENTS_LIBRARY',
  METRICS_INFOGRAPHIC_DOCK = 'METRICS_INFOGRAPHIC_DOCK',
  PHOTOJOURNALISM_GALLERY = 'PHOTOJOURNALISM_GALLERY',
  NEWSLETTER_SUBSCRIPTION = 'NEWSLETTER_SUBSCRIPTION',
  CIVIC_ASPIRATION_CTA = 'CIVIC_ASPIRATION_CTA',
}

export enum PortalDocumentType {
  REPORT_TRIWULAN = 'REPORT_TRIWULAN',
  DRAFT_RUU = 'DRAFT_RUU',
  BULETIN = 'BULETIN',
  KAJIAN_AKADEMIS = 'KAJIAN_AKADEMIS',
  OTHER = 'OTHER',
}

export enum SocialAccountStatus {
  ACTIVE = 'ACTIVE',
  REAUTHORIZATION_REQUIRED = 'REAUTHORIZATION_REQUIRED',
  REVOKED = 'REVOKED',
  DISCONNECTED = 'DISCONNECTED',
}

export enum PublishingJobStatus {
  PENDING = 'PENDING',
  QUEUED = 'QUEUED',
  PREPARING_MEDIA = 'PREPARING_MEDIA',
  CONTAINER_CREATED = 'CONTAINER_CREATED',
  PUBLISHING = 'PUBLISHING',
  PUBLISHED = 'PUBLISHED',
  FAILED = 'FAILED',
  CANCELLED = 'CANCELLED',
}

export enum SocialMediaFormat {
  FEED_IMAGE = 'FEED_IMAGE',
  REELS_VIDEO = 'REELS_VIDEO',
  CAROUSEL = 'CAROUSEL',
}

export enum ResearchJobStatus {
  PENDING = 'PENDING',
  PLANNING = 'PLANNING',
  SEARCHING = 'SEARCHING',
  EVALUATING = 'EVALUATING',
  EXTRACTING = 'EXTRACTING',
  WRITING = 'WRITING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
}

export enum QuestionIntent {
  REGULATORY = 'REGULATORY',
  STATISTICAL_BENCHMARK = 'STATISTICAL_BENCHMARK',
  PUBLIC_OPINION = 'PUBLIC_OPINION',
  POLICY_EVALUATION = 'POLICY_EVALUATION',
  FACTUAL_VERIFICATION = 'FACTUAL_VERIFICATION',
}

export enum QuestionStatus {
  UNRESOLVED = 'UNRESOLVED',
  PARTIAL = 'PARTIAL',
  RESOLVED = 'RESOLVED',
}

export enum SourceType {
  INTERNAL_REGULATION = 'INTERNAL_REGULATION',
  INTERNAL_NEWS = 'INTERNAL_NEWS',
  EXTERNAL_WEB = 'EXTERNAL_WEB',
  ACADEMIC_PAPER = 'ACADEMIC_PAPER',
  USER_ATTACHMENT = 'USER_ATTACHMENT',
}

export enum PublisherType {
  GOVERNMENT = 'GOVERNMENT',
  MEDIA = 'MEDIA',
  ACADEMIC = 'ACADEMIC',
  INDUSTRY = 'INDUSTRY',
  USER = 'USER',
}

export enum SourceLifecycle {
  DISCOVERED = 'DISCOVERED',
  FETCHED = 'FETCHED',
  ASSESSED = 'ASSESSED',
  VERIFIED = 'VERIFIED',
  REJECTED = 'REJECTED',
  STALE = 'STALE',
}

export enum ClaimStatus {
  UNSUPPORTED = 'UNSUPPORTED',
  PARTIALLY_SUPPORTED = 'PARTIALLY_SUPPORTED',
  VERIFIED = 'VERIFIED',
  CONTRADICTED = 'CONTRADICTED',
}

export enum SupportType {
  SUPPORTS = 'SUPPORTS',
  REFUTES = 'REFUTES',
  NEUTRAL_CONTEXT = 'NEUTRAL_CONTEXT',
}

export enum DatahubPrivacyScope {
  PRIVATE_TENANT = 'PRIVATE_TENANT',
  PARTY_CONFIDENTIAL = 'PARTY_CONFIDENTIAL',
  DAPIL_SHARED = 'DAPIL_SHARED',
  PUBLIC_SYSTEM = 'PUBLIC_SYSTEM',
}

export enum DatahubCategory {
  REGULASI_DAERAH = 'REGULASI_DAERAH',
  ANGGARAN_APBD = 'ANGGARAN_APBD',
  NOTULA_SIDANG = 'NOTULA_SIDANG',
  KAJIAN_AKADEMIS = 'KAJIAN_AKADEMIS',
  ASPIRASI_KONSTITUEN = 'ASPIRASI_KONSTITUEN',
  DOKUMEN_INTERNAL = 'DOKUMEN_INTERNAL',
}



