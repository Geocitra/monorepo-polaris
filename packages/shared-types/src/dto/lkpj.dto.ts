import {
  LkpjWorkspaceStatus,
  LkpjMaterialCategory,
  LkpjExtractionVerificationStatus,
  LkpjIndicatorDirection,
  LkpjEvidenceStatus,
  LkpjFindingReviewStatus,
  LkpjFollowupStatus,
  LkpjFactionStance,
  LkpjAiSpecialistRole,
  LkpjMeetingPackageType,
  OrganizationUnitType,
} from '../enums/index.js';

export interface LkpjEvaluationWorkspaceDto {
  id: string;
  organizationId: string;
  organizationName?: string;
  fiscalYear: number;
  title: string;
  status: LkpjWorkspaceStatus;
  assignedDiscussionUnitId?: string | null;
  assignedDiscussionUnitName?: string | null;
  assignedDiscussionUnitType?: OrganizationUnitType | null;
  lkpjSubmittedAt: string;
  discussionDeadlineAt: string;
  prePlenaryAt?: string | null;
  finalPlenaryAt?: string | null;
  daysRemainingForDiscussion: number;
  standingOrdersNotes?: string | null;
  createdByTenantId?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface LkpjEvaluationMaterialDto {
  id: string;
  workspaceId: string;
  organizationId: string;
  originUnitId?: string | null;
  originUnitName?: string | null;
  materialCategory: LkpjMaterialCategory;
  title: string;
  documentVersion: string;
  sourceYear: number;
  pageOrArticleRange?: string | null;
  datahubRefId?: string | null;
  datahubFileId?: string | null;
  extractionConfidence: number;
  verificationStatus: LkpjExtractionVerificationStatus;
  doubtfulQueueNotes?: string | null;
  verifiedByTenantId?: string | null;
  verifiedByName?: string | null;
  verifiedAt?: string | null;
  summaryExcerpt?: string | null;
  uploadedByTenantId: string;
  uploadedByName?: string;
  createdAt: string;
  updatedAt: string;
}

export interface LkpjFindingDto {
  id: string;
  workspaceId: string;
  organizationId: string;
  originUnitId?: string | null;
  originUnitName?: string | null;
  originUnitType?: OrganizationUnitType | null;
  fiscalYear: number;
  governmentAffair: string;
  opdName: string;
  programOrActivity?: string | null;
  indicatorOrIssue: string;
  indicatorUnit: string;
  indicatorDirection: LkpjIndicatorDirection;
  compatibilityVerified: boolean;
  compatibilityNotes?: string | null;
  rpjmdCommitmentBaseline?: string | null;
  targetValue: number | null;
  realizationValue: number | null;
  achievementGap: number | null;
  achievementPercentage: number | null;
  budgetCeilingIdr: number | null;
  budgetRealizationIdr: number | null;
  budgetAbsorptionPercentage: number | null;
  locationCoverage?: string | null;
  sourceEvidenceRef: string;
  sourceMaterialId?: string | null;
  citizenAspirationSummary?: string | null;
  opdClarificationQuestion?: string | null;
  opdResponse?: string | null;
  evidenceStatus: LkpjEvidenceStatus;
  missingEvidenceNotes?: string | null;
  reviewStatus: LkpjFindingReviewStatus;
  proposedRecommendation?: string | null;
  legalBasisRef?: string | null;
  responsibleOpd?: string | null;
  followupDeadline?: string | null;
  completionIndicator?: string | null;
  followupStatus: LkpjFollowupStatus;
  followupResponsePemda?: string | null;
  followupProofRef?: string | null;
  createdByTenantId: string;
  createdByName?: string;
  reviewedByTenantId?: string | null;
  reviewedByName?: string | null;
  reviewedAt?: string | null;
  factionProposalsCount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface LkpjFactionProposalDto {
  id: string;
  workspaceId: string;
  organizationId: string;
  findingId?: string | null;
  findingIndicatorOrIssue?: string | null;
  factionUnitId: string;
  factionUnitName: string;
  factionUnitCode: string;
  priorityLevel: 'HIGH' | 'MEDIUM' | 'LOW';
  stancePosition: LkpjFactionStance;
  supervisionPriorityNotes?: string | null;
  proposedRedaction: string;
  submittedByTenantId: string;
  submittedByName?: string;
  createdAt: string;
  updatedAt: string;
}

export interface LkpjFactionConsolidationItemDto {
  findingId: string;
  governmentAffair: string;
  opdName: string;
  indicatorOrIssue: string;
  panjaBaseRecommendation: string | null;
  consensusStatus: 'UNANIMOUS_CONSENSUS' | 'HAS_AMENDMENTS' | 'REQUIRES_MEETING_DECISION';
  totalFactionsResponded: number;
  concurCount: number;
  amendmentCount: number;
  dissentCount: number;
  factionProposals: LkpjFactionProposalDto[];
}

export interface LkpjWorkspaceDashboardDto {
  workspace: LkpjEvaluationWorkspaceDto;
  materialsByCategoryCount: Record<LkpjMaterialCategory, number>;
  verificationQueueCount: number;
  findingsSummary: {
    totalFindings: number;
    insufficientEvidenceCount: number;
    stillOpenAtClosingCount: number;
    sufficientVerifiedCount: number;
    approvedForDiscussionCount: number;
    officialRecommendationCount: number;
    followupOpenCount: number;
    followupCompletedCount: number;
  };
  materials: LkpjEvaluationMaterialDto[];
  findings: LkpjFindingDto[];
  factionConsolidationMatrix: LkpjFactionConsolidationItemDto[];
}

export interface LkpjSpecialistAiResponseDto {
  specialistRole: LkpjAiSpecialistRole;
  specialistLabel: string;
  analysisMarkdown: string;
  suggestedRecommendationDraft?: string | null;
  suggestedClarificationQuestions: string[];
  deterministicMetricsUsed: {
    findingsAnalyzedCount: number;
    materialsAnalyzedCount: number;
    openEvidenceCount: number;
  };
  telemetry: {
    traceId: string;
    model: string;
    inputTokens: number;
    outputTokens: number;
    totalTokens: number;
  };
}

export interface LkpjMeetingPackageResponseDto {
  packageType: LkpjMeetingPackageType;
  packageTitle: string;
  workspaceId: string;
  organizationName: string;
  fiscalYear: number;
  generatedAt: string;
  executiveSummaryMarkdown: string;
  includedFindings: LkpjFindingDto[];
  openDataRequests: Array<{
    findingId: string;
    opdName: string;
    indicatorOrIssue: string;
    evidenceStatus: LkpjEvidenceStatus;
    missingEvidenceNotes: string;
    opdClarificationQuestion: string;
  }>;
  factionMatrix: LkpjFactionConsolidationItemDto[];
  officialRecommendationsRegister: Array<{
    findingId: string;
    governmentAffair: string;
    responsibleOpd: string;
    recommendationText: string;
    legalBasisRef: string;
    followupDeadline: string | null;
    completionIndicator: string;
    followupStatus: LkpjFollowupStatus;
    followupResponsePemda: string | null;
    followupProofRef: string | null;
  }>;
}

export interface UploadLkpjMaterialResultDto {
  material: LkpjEvaluationMaterialDto;
  datahubFileId: string;
  datahubRefId: string | null;
  extractionConfidence: number;
  extractedFindingsCount: number;
  queuedForVerification: boolean;
}
