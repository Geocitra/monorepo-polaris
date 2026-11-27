import {
  LegislativeLevel,
  WorkspaceMode,
  OrganizationStatus,
  OrganizationContractStatus,
  OrganizationUnitType,
  OrganizationMemberRole,
  OrganizationUnitMemberRole,
  InstitutionalMembershipStatus,
  InstitutionalNoteVisibility,
  DatahubPrivacyScope,
  DatahubCategory,
} from '../enums/index.js';

export interface StandingOrdersConfigDto {
  lkpjDiscussionDaysLimit?: number;
  defaultDiscussionBodyType?: OrganizationUnitType;
  requireReviewerApprovalBeforeConsolidation?: boolean;
  quorumPercentage?: number;
  notes?: string;
}

export interface OrganizationDto {
  id: string;
  code: string;
  name: string;
  legislativeLevel: LegislativeLevel;
  regionName: string;
  provinceName: string;
  standingOrdersConfig: StandingOrdersConfigDto;
  status: OrganizationStatus;
  createdAt: string;
  updatedAt: string;
}

export interface OrganizationContractDto {
  id: string;
  organizationId: string;
  contractNumber: string;
  fiscalYear: number;
  status: OrganizationContractStatus;
  startDate: string;
  endDate: string;
  gracePeriodEnd?: string | null;
  maxSeats: number;
  maxStorageBytes: number;
  annualTokenPoolLimit: number;
  tokensConsumed: number;
  weeklyGenerateLimitPerMember: number;
  revisionLimitPerItem: number;
  contractValueIdr: number;
  notes?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface OrganizationUnitNodeDto {
  id: string;
  organizationId: string;
  parentUnitId?: string | null;
  unitType: OrganizationUnitType;
  code: string;
  name: string;
  description?: string | null;
  politicalPartyId?: string | null;
  politicalPartyName?: string | null;
  focusSectors: string[];
  partnerOpds: string[];
  isAdHoc: boolean;
  fiscalYear?: number | null;
  isActive: boolean;
  archivedAt?: string | null;
  memberCount: number;
  documentCount: number;
  children: OrganizationUnitNodeDto[];
}

export interface OrganizationMemberDto {
  membershipId: string;
  organizationId: string;
  tenantId: string;
  fullName: string;
  email: string;
  phoneNumber?: string;
  partyAffiliation?: string | null;
  photoUrl?: string | null;
  orgRole: OrganizationMemberRole;
  status: InstitutionalMembershipStatus;
  titleOrPosition?: string | null;
  joinedAt: string;
  assignedUnits: Array<{
    unitId: string;
    unitCode: string;
    unitName: string;
    unitType: OrganizationUnitType;
    parentUnitName?: string | null;
    unitRole: OrganizationUnitMemberRole;
    status: InstitutionalMembershipStatus;
  }>;
}

export interface WorkspaceSwitcherItemDto {
  workspaceMode: WorkspaceMode;
  organizationId?: string;
  organizationCode?: string;
  organizationName?: string;
  legislativeLevel?: LegislativeLevel;
  regionName?: string;
  orgRole?: OrganizationMemberRole;
  contractStatus?: OrganizationContractStatus;
  units: Array<{
    unitId: string;
    parentUnitId?: string | null;
    parentUnitName?: string | null;
    parentUnitType?: OrganizationUnitType | null;
    unitCode: string;
    unitName: string;
    unitType: OrganizationUnitType;
    unitRole: OrganizationUnitMemberRole;
    focusSectors: string[];
    partnerOpds: string[];
  }>;
}

export interface MyWorkspacesResponseDto {
  personalWorkspace: {
    workspaceMode: WorkspaceMode.PERSONAL;
    tenantId: string;
    fullName: string;
    email: string;
    legislativeLevel: LegislativeLevel;
    partyAffiliation?: string | null;
  };
  institutionalWorkspaces: WorkspaceSwitcherItemDto[];
}

export interface InstitutionalScopedDocumentDto {
  refId: string;
  fileId: string;
  title: string;
  originalFileName: string;
  mimeType: string;
  fileSizeBytes: number;
  totalPages: number;
  categoryTag: DatahubCategory | string;
  privacyScope: DatahubPrivacyScope;
  organizationId: string;
  organizationUnitId?: string | null;
  unitName?: string | null;
  uploadedByTenantId: string;
  uploadedByName: string;
  chunkCount: number;
  tokenCount: number;
  createdAt: string;
}

export interface InstitutionalSharedNoteDto {
  id: string;
  organizationId: string;
  unitId: string;
  unitName?: string;
  authorTenantId: string;
  authorName: string;
  title: string;
  contentMarkdown: string;
  visibility: InstitutionalNoteVisibility;
  sourceFileIds: string[];
  approvedByTenantId?: string | null;
  approvedByName?: string | null;
  approvedAt?: string | null;
  revisionUsed?: number;
  revisionLimit?: number;
  lastRevisionPrompt?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface InstitutionalUnitOverviewDto {
  organization: OrganizationDto;
  activeContract: OrganizationContractDto | null;
  unit: {
    id: string;
    parentUnitId?: string | null;
    parentUnitName?: string | null;
    parentUnitType?: OrganizationUnitType | null;
    unitType: OrganizationUnitType;
    code: string;
    name: string;
    description?: string | null;
    focusSectors: string[];
    partnerOpds: string[];
    isAdHoc: boolean;
    fiscalYear?: number | null;
  };
  myOrgRole: OrganizationMemberRole;
  myUnitRole: OrganizationUnitMemberRole;
  members: Array<{
    tenantId: string;
    fullName: string;
    email: string;
    partyAffiliation?: string | null;
    photoUrl?: string | null;
    unitRole: OrganizationUnitMemberRole;
    status: InstitutionalMembershipStatus;
  }>;
  knowledgeStats: {
    unitDocumentsCount: number;
    orgSharedDocumentsCount: number;
    unitNotesCount: number;
    totalScopedTokens: number;
  };
}

export interface InstitutionalAiAssistRequestDto {
  prompt: string;
  focusIssue?: string;
  includeOrgSharedDocuments?: boolean;
  includeNationalAndRegionalRegulations?: boolean;
  saveAsSharedNoteTitle?: string;
}

export interface InstitutionalAiAssistResponseDto {
  answerMarkdown: string;
  scopeIsolationSummary: {
    organizationId: string;
    organizationName: string;
    activeUnitId: string;
    activeUnitName: string;
    activeUnitType: OrganizationUnitType;
    parentUnitName?: string | null;
    unitChunksRetrieved: number;
    orgSharedChunksRetrieved: number;
    regulationChunksRetrieved: number;
    unitNotesRetrieved: number;
  };
  citations: Array<{
    sourceType: 'UNIT_BIDANG_DOC' | 'ORG_SHARED_DOC' | 'REGULATION' | 'UNIT_SHARED_NOTE';
    sourceId: string;
    title: string;
    reference: string;
    similarityScore: number;
    excerpt: string;
  }>;
  telemetry: {
    traceId: string;
    model: string;
    inputTokens: number;
    outputTokens: number;
    totalTokens: number;
  };
  savedNote?: InstitutionalSharedNoteDto | null;
}

export interface SuperadminInstitutionSummaryDto {
  organization: OrganizationDto;
  activeContract: OrganizationContractDto | null;
  totalMembers: number;
  activeSeatsUsed: number;
  totalUnits: number;
  totalBidang: number;
  totalDocuments: number;
  storageUsedBytes: number;
  monthlyAiUsage: {
    billingCycleMonth: string;
    totalRequests: number;
    totalTokensConsumed: number;
    totalCostIdr: number;
    openaiTokens: number;
    geminiTokens: number;
  };
}

export interface ProvisionedAdminCredentialsDto {
  tenantId: string;
  fullName: string;
  email: string;
  username: string;
  temporaryPassword: string;
}

export interface SuperadminInstitutionDetailDto extends SuperadminInstitutionSummaryDto {
  contracts: OrganizationContractDto[];
  unitTree: OrganizationUnitNodeDto[];
  members: OrganizationMemberDto[];
  unitUsageBreakdown: Array<{
    unitId: string | null;
    unitCode: string;
    unitName: string;
    unitType: OrganizationUnitType | 'ORG_GENERAL';
    parentUnitName?: string | null;
    totalRequests: number;
    totalTokensConsumed: number;
    totalCostIdr: number;
  }>;
  provisionedAdminCredentials?: ProvisionedAdminCredentialsDto | null;
}

export interface FeatureQuotaSummaryDto {
  weeklyLimit: number;
  weeklyUsed: number;
  remainingWeekly: number;
}

export interface OrganizationMemberQuotaDto {
  organizationId: string;
  tenantId: string;
  weeklyPeriodKey: string;
  featureScope?: string;
  weeklyLimit: number;
  weeklyUsed: number;
  remainingWeekly: number;
  totalGenerated: number;
  totalRevisions: number;
  revisionLimitPerItem: number;
  byFeature?: {
    COORDINATOR_CHAT: FeatureQuotaSummaryDto;
    LKPJ_EVALUATION: FeatureQuotaSummaryDto;
    LEGISLATION: FeatureQuotaSummaryDto;
  };
}

export interface InstitutionalMyUsageDto {
  organizationId: string;
  tenantId: string;
  billingCycleMonth: string;
  quota: OrganizationMemberQuotaDto;
  monthlySummary: {
    generateRequests: number;
    revisionRequests: number;
    totalRequests: number;
    totalTokensConsumed: number;
  };
  byUnit: Array<{
    unitId: string | null;
    unitName: string;
    totalRequests: number;
    totalTokensConsumed: number;
  }>;
}

export interface InstitutionalMemberUsageDto {
  tenantId: string;
  fullName: string;
  email: string;
  orgRole: OrganizationMemberRole;
  hasAssignedUnits?: boolean;
  billingCycleMonth: string;
  generateRequests: number;
  revisionRequests: number;
  totalRequests: number;
  totalTokensConsumed: number;
  totalCostIdr: number;
  weeklyUsed: number;
  weeklyLimit: number;
  byFeature?: {
    COORDINATOR_CHAT: FeatureQuotaSummaryDto;
    LKPJ_EVALUATION: FeatureQuotaSummaryDto;
    LEGISLATION: FeatureQuotaSummaryDto;
  };
}

export interface InstitutionalMyUsageDto {
  organizationId: string;
  tenantId: string;
  billingCycleMonth: string;
  quota: OrganizationMemberQuotaDto;
  monthlySummary: {
    generateRequests: number;
    revisionRequests: number;
    totalRequests: number;
    totalTokensConsumed: number;
  };
  byUnit: Array<{
    unitId: string | null;
    unitName: string;
    totalRequests: number;
    totalTokensConsumed: number;
  }>;
}

export interface InstitutionalUsageAnalyticsDto {
  organizationId: string;
  billingCycleMonth: string;
  weeklyPeriodKey: string;
  totals: {
    generateRequests: number;
    revisionRequests: number;
    totalRequests: number;
    totalTokensConsumed: number;
    totalCostIdr: number;
  };
  byUnit: Array<{
    unitId: string | null;
    unitCode: string;
    unitName: string;
    unitType: OrganizationUnitType | 'ORG_GENERAL';
    generateRequests: number;
    revisionRequests: number;
    totalRequests: number;
    totalTokensConsumed: number;
    totalCostIdr: number;
  }>;
  byMember: InstitutionalMemberUsageDto[];
  tokenPoolAlert?: {
    contractNumber?: string;
    fiscalYear?: number;
    annualTokenPoolLimit: number;
    tokensConsumed: number;
    usagePercentage: number;
    alertLevel: 'NORMAL' | 'WARNING_80' | 'CRITICAL_95' | 'EXCEEDED';
    message: string | null;
  };
}

export interface ProvisionedOrgMemberResultDto {
  member: OrganizationMemberDto;
  credentials: ProvisionedAdminCredentialsDto;
}

export type CoordinatorChatMode =
  | 'AUTO'
  | 'LKPJ_FINANCE'
  | 'LEGISLATION'
  | 'BRIEFING'
  | 'ARTICLE'
  | 'IMAGE';

export interface CoordinatorChatHistoryTurnDto {
  role: 'user' | 'assistant';
  content: string;
}

export interface CoordinatorGuidedInlineFieldDto {
  key: string;
  label: string;
  placeholder: string;
  multiline?: boolean;
}

export interface CoordinatorGuidedOptionDto {
  id: string;
  label: string;
  description?: string;
  recommended?: boolean;
  nextMessage: string;
  mode?: CoordinatorChatMode;
  requiresUpload?: boolean;
  requiresLibraryPick?: boolean;
  requiresInlineInput?: boolean;
  inlineInputTitle?: string;
  inlineInputFields?: CoordinatorGuidedInlineFieldDto[];
}

export interface CoordinatorGuidedQuestionDto {
  promptTitle: string;
  options: CoordinatorGuidedOptionDto[];
}

export interface CoordinatorLinkedActionDto {
  label: string;
  kind: 'OPEN_LKPJ' | 'OPEN_LEGISLATION' | 'EXPORT_CSV' | 'SAVE_NOTE' | 'DOWNLOAD_IMAGE';
  href?: string;
}

export interface ProactivePromptCardDto {
  id: string;
  category: 'NEWS' | 'LKPJ' | 'LEGISLATION' | 'IMAGE';
  badge: string;
  title: string;
  prompt: string;
  mode: CoordinatorChatMode;
}

export interface CoordinatorChatResponseDto {
  sessionId?: string;
  assistantMessage: string;
  routedAgents: string[];
  detectedMode: CoordinatorChatMode;
  generatedImageUrl?: string | null;
  imagePromptUsed?: string | null;
  usedCitations: Array<{ code: string; title: string; scope: string }>;
  quotaRemainingWeekly?: number;
  quotaWeeklyLimit?: number;
  savedNoteId?: string | null;
  guidedQuestion?: CoordinatorGuidedQuestionDto | null;
  linkedActions?: CoordinatorLinkedActionDto[];
}

export interface InstitutionalChatSessionDto {
  id: string;
  organizationId: string;
  unitId: string;
  tenantId: string;
  title: string;
  lastMessageAt: string;
  createdAt: string;
}

export interface InstitutionalChatMessageDto {
  id: string;
  sessionId: string;
  role: 'user' | 'assistant';
  content: string;
  detectedMode?: CoordinatorChatMode | null;
  routedAgents: string[];
  usedCitations: Array<{ code: string; title: string; scope: string }>;
  generatedImageUrl?: string | null;
  linkedActions?: CoordinatorLinkedActionDto[];
  createdAt: string;
}

export interface InstitutionalChatSessionDetailDto {
  session: InstitutionalChatSessionDto;
  messages: InstitutionalChatMessageDto[];
}
