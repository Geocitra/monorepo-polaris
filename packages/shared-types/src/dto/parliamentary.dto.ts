import {
  ParliamentaryDocumentCategory,
  LegislationStage,
  ClauseInspectionStatus,
  LegalRuleVerificationStatus,
  DimEntryStatus,
  PerformanceAchievementLevel,
  PerformanceContributionScope,
} from '../enums/index.js';

export interface LegalKnowledgeVersionDto {
  id: string;
  organizationId?: string | null;
  ruleCode: string;
  title: string;
  hierarchyLayer: string;
  jurisdictionRegion: string;
  effectiveDate: string;
  amendmentSummary?: string | null;
  verificationStatus: LegalRuleVerificationStatus;
  sourceUrl?: string | null;
  lastVerifiedAt?: string | null;
  isFinalLegalBasisAllowed: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface LegislationClauseDto {
  id: string;
  draftId: string;
  organizationId: string;
  clauseNumber: string;
  clauseTitle?: string | null;
  clauseText: string;
  explanationText?: string | null;
  problemAddressed?: string | null;
  legalAuthoritySource?: string | null;
  regulatedSubjects?: string | null;
  relatedClauses?: string | null;
  impactAssessment?: string | null;
  implementationSupervision?: string | null;
  interpretationRisks?: string | null;
  complianceCriticWarnings: string[];
  inspectionStatus: ClauseInspectionStatus;
  checkedByTenantId?: string | null;
  checkedByName?: string | null;
  checkedAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface LegislationDimEntryDto {
  id: string;
  draftId: string;
  organizationId: string;
  sourcePartyName: string;
  isPublicConsultation: boolean;
  targetClauseRef: string;
  issueSummary: string;
  proposedAmendment: string;
  responseAndFollowup?: string | null;
  status: DimEntryStatus;
  createdByTenantId: string;
  createdByName?: string;
  createdAt: string;
  updatedAt: string;
}

export interface LegislationDraftDto {
  id: string;
  organizationId: string;
  originUnitId?: string | null;
  originUnitName?: string | null;
  title: string;
  documentCategory: ParliamentaryDocumentCategory;
  currentStage: LegislationStage;
  problemStatement?: string | null;
  instrumentChoiceRationale?: string | null;
  academicPaperSummary?: string | null;
  hasCriminalSanctionProvision: boolean;
  legalBasisVerifiedAt?: string | null;
  clausesCount: number;
  dimEntriesCount: number;
  clauses?: LegislationClauseDto[];
  dimEntries?: LegislationDimEntryDto[];
  createdByTenantId: string;
  createdByName?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PerformanceEvidenceRegisterDto {
  id: string;
  organizationId: string;
  unitId?: string | null;
  unitName?: string | null;
  tenantId: string;
  authorName?: string;
  lkpjFindingId?: string | null;
  legislationDraftId?: string | null;
  title: string;
  achievementLevel: PerformanceAchievementLevel;
  contributionScope: PerformanceContributionScope;
  evidenceSourceRef: string;
  summaryText: string;
  isVerified: boolean;
  verifiedByTenantId?: string | null;
  verifiedByName?: string | null;
  verifiedAt?: string | null;
  linkedPublicationId?: string | null;
  generatedPublicationDraftMarkdown?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ClauseComplianceCriticResponseDto {
  clauseId: string;
  passedAutomaticChecks: boolean;
  recommendedInspectionStatus: ClauseInspectionStatus;
  warnings: string[];
  criticNarrativeMarkdown: string;
  requiresCriminalLawReviewUu12026: boolean;
  unverifiedLegalBasisDetected: boolean;
  telemetry: {
    traceId: string;
    model: string;
    totalTokens: number;
  };
}

export interface DailyMemberBriefingResponseDto {
  generatedForDate: string;
  organizationName: string;
  unitName: string;
  agendaAndRequiredDecisions: string[];
  keyIssuesAndLatestData: string[];
  verifiedLegalBases: Array<{
    ruleCode: string;
    title: string;
    verificationStatus: LegalRuleVerificationStatus;
    warningNote?: string | null;
  }>;
  stanceOptionsAndConsequences: string[];
  keyQuestionsAndFollowups: string[];
  briefingMarkdown: string;
  telemetry: {
    traceId: string;
    model: string;
    totalTokens: number;
  };
}

export interface PerformancePublicationDraftResponseDto {
  evidenceId: string;
  claimGuardrailPassed: boolean;
  enforcedAchievementLevel: PerformanceAchievementLevel;
  enforcedContributionScope: PerformanceContributionScope;
  pressReleaseMarkdown: string;
  socialCaptionDraft: string;
  telemetry: {
    traceId: string;
    model: string;
    totalTokens: number;
  };
}
