import {
  IsString,
  IsOptional,
  IsEnum,
  IsBoolean,
  IsUUID,
  IsDateString,
  MaxLength,
} from 'class-validator';
import {
  ParliamentaryDocumentCategory,
  LegislationStage,
  ClauseInspectionStatus,
  LegalRuleVerificationStatus,
  DimEntryStatus,
  PerformanceAchievementLevel,
  PerformanceContributionScope,
} from '@polaris/shared-types';

export class UpsertLegalKnowledgeVersionRequestDto {
  @IsString()
  @MaxLength(100)
  ruleCode!: string;

  @IsString()
  @MaxLength(255)
  title!: string;

  @IsString()
  @MaxLength(100)
  hierarchyLayer!: string;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  jurisdictionRegion?: string;

  @IsDateString()
  effectiveDate!: string;

  @IsOptional()
  @IsString()
  amendmentSummary?: string;

  @IsEnum(LegalRuleVerificationStatus)
  verificationStatus!: LegalRuleVerificationStatus;

  @IsOptional()
  @IsString()
  sourceUrl?: string;
}

export class CreateLegislationDraftRequestDto {
  @IsOptional()
  @IsUUID()
  originUnitId?: string | null;

  @IsString()
  @MaxLength(255)
  title!: string;

  @IsEnum(ParliamentaryDocumentCategory)
  documentCategory!: ParliamentaryDocumentCategory;

  @IsOptional()
  @IsEnum(LegislationStage)
  currentStage?: LegislationStage;

  @IsOptional()
  @IsString()
  problemStatement?: string;

  @IsOptional()
  @IsString()
  instrumentChoiceRationale?: string;

  @IsOptional()
  @IsString()
  academicPaperSummary?: string;

  @IsOptional()
  @IsBoolean()
  hasCriminalSanctionProvision?: boolean;
}

export class UpdateLegislationStageRequestDto {
  @IsEnum(LegislationStage)
  currentStage!: LegislationStage;

  @IsOptional()
  @IsString()
  instrumentChoiceRationale?: string;

  @IsOptional()
  @IsString()
  academicPaperSummary?: string;
}

export class UpsertLegislationClauseRequestDto {
  @IsOptional()
  @IsUUID()
  id?: string;

  @IsString()
  @MaxLength(60)
  clauseNumber!: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  clauseTitle?: string;

  @IsString()
  clauseText!: string;

  @IsOptional()
  @IsString()
  explanationText?: string;

  @IsOptional()
  @IsString()
  problemAddressed?: string;

  @IsOptional()
  @IsString()
  legalAuthoritySource?: string;

  @IsOptional()
  @IsString()
  regulatedSubjects?: string;

  @IsOptional()
  @IsString()
  relatedClauses?: string;

  @IsOptional()
  @IsString()
  impactAssessment?: string;

  @IsOptional()
  @IsString()
  implementationSupervision?: string;

  @IsOptional()
  @IsString()
  interpretationRisks?: string;

  @IsOptional()
  @IsEnum(ClauseInspectionStatus)
  inspectionStatus?: ClauseInspectionStatus;
}

export class AddLegislationDimEntryRequestDto {
  @IsString()
  @MaxLength(180)
  sourcePartyName!: string;

  @IsOptional()
  @IsBoolean()
  isPublicConsultation?: boolean;

  @IsString()
  @MaxLength(100)
  targetClauseRef!: string;

  @IsString()
  issueSummary!: string;

  @IsString()
  proposedAmendment!: string;

  @IsOptional()
  @IsString()
  responseAndFollowup?: string;

  @IsOptional()
  @IsEnum(DimEntryStatus)
  status?: DimEntryStatus;
}

export class GenerateDailyBriefingRequestDto {
  @IsUUID()
  unitId!: string;

  @IsString()
  @MaxLength(255)
  agendaTitle!: string;
}

export class RegisterPerformanceEvidenceRequestDto {
  @IsOptional()
  @IsUUID()
  unitId?: string | null;

  @IsOptional()
  @IsUUID()
  lkpjFindingId?: string | null;

  @IsOptional()
  @IsUUID()
  legislationDraftId?: string | null;

  @IsString()
  @MaxLength(255)
  title!: string;

  @IsEnum(PerformanceAchievementLevel)
  achievementLevel!: PerformanceAchievementLevel;

  @IsEnum(PerformanceContributionScope)
  contributionScope!: PerformanceContributionScope;

  @IsString()
  evidenceSourceRef!: string;

  @IsString()
  summaryText!: string;
}

export class DraftPerformancePublicationBodyDto {
  @IsOptional()
  @IsBoolean()
  createStudioDraft?: boolean;
}

export class UpdateLegislationDimEntryRequestDto {
  @IsEnum(DimEntryStatus)
  status!: DimEntryStatus;

  @IsOptional()
  @IsString()
  responseAndFollowup?: string;
}
