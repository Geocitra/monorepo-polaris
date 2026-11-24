import {
  IsString,
  IsOptional,
  IsEnum,
  IsInt,
  IsNumber,
  IsBoolean,
  IsUUID,
  IsDateString,
  Min,
  Max,
  MaxLength,
  IsIn,
} from 'class-validator';
import { Transform } from 'class-transformer';
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
} from '@polaris/shared-types';

export class CreateLkpjWorkspaceRequestDto {
  @IsInt()
  @Min(2020)
  fiscalYear!: number;

  @IsOptional()
  @IsString()
  @MaxLength(220)
  title?: string;

  @IsDateString()
  lkpjSubmittedAt!: string;

  @IsOptional()
  @IsDateString()
  discussionDeadlineAt?: string;

  @IsOptional()
  @IsUUID()
  assignedDiscussionUnitId?: string | null;

  @IsOptional()
  @IsString()
  standingOrdersNotes?: string;
}

export class UpdateLkpjWorkspaceStatusRequestDto {
  @IsEnum(LkpjWorkspaceStatus)
  status!: LkpjWorkspaceStatus;

  @IsOptional()
  @IsUUID()
  assignedDiscussionUnitId?: string | null;

  @IsOptional()
  @IsDateString()
  prePlenaryAt?: string;

  @IsOptional()
  @IsDateString()
  finalPlenaryAt?: string;
}

export class RegisterLkpjMaterialRequestDto {
  @IsEnum(LkpjMaterialCategory)
  materialCategory!: LkpjMaterialCategory;

  @IsString()
  @MaxLength(255)
  title!: string;

  @IsOptional()
  @IsString()
  @MaxLength(80)
  documentVersion?: string;

  @IsInt()
  @Min(2015)
  sourceYear!: number;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  pageOrArticleRange?: string;

  @IsOptional()
  @IsUUID()
  originUnitId?: string | null;

  @IsOptional()
  @IsUUID()
  datahubRefId?: string | null;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(1)
  extractionConfidence?: number;

  @IsOptional()
  @IsString()
  doubtfulQueueNotes?: string;

  @IsOptional()
  @IsString()
  summaryExcerpt?: string;
}

export class VerifyLkpjMaterialRequestDto {
  @IsEnum(LkpjExtractionVerificationStatus)
  verificationStatus!: LkpjExtractionVerificationStatus;

  @IsOptional()
  @IsString()
  doubtfulQueueNotes?: string;
}

export class UpsertLkpjFindingRequestDto {
  @IsOptional()
  @IsUUID()
  id?: string;

  @IsOptional()
  @IsUUID()
  originUnitId?: string | null;

  @IsString()
  @MaxLength(160)
  governmentAffair!: string;

  @IsString()
  @MaxLength(180)
  opdName!: string;

  @IsOptional()
  @IsString()
  @MaxLength(240)
  programOrActivity?: string;

  @IsString()
  indicatorOrIssue!: string;

  @IsOptional()
  @IsString()
  @MaxLength(60)
  indicatorUnit?: string;

  @IsOptional()
  @IsEnum(LkpjIndicatorDirection)
  indicatorDirection?: LkpjIndicatorDirection;

  @IsOptional()
  @IsBoolean()
  compatibilityVerified?: boolean;

  @IsOptional()
  @IsString()
  compatibilityNotes?: string;

  @IsOptional()
  @IsString()
  rpjmdCommitmentBaseline?: string;

  @IsOptional()
  @IsNumber()
  targetValue?: number | null;

  @IsOptional()
  @IsNumber()
  realizationValue?: number | null;

  @IsOptional()
  @IsNumber()
  budgetCeilingIdr?: number | null;

  @IsOptional()
  @IsNumber()
  budgetRealizationIdr?: number | null;

  @IsOptional()
  @IsString()
  locationCoverage?: string;

  @IsString()
  sourceEvidenceRef!: string;

  @IsOptional()
  @IsUUID()
  sourceMaterialId?: string | null;

  @IsOptional()
  @IsString()
  citizenAspirationSummary?: string;

  @IsOptional()
  @IsString()
  opdClarificationQuestion?: string;

  @IsOptional()
  @IsString()
  opdResponse?: string;

  @IsOptional()
  @IsEnum(LkpjEvidenceStatus)
  evidenceStatus?: LkpjEvidenceStatus;

  @IsOptional()
  @IsString()
  missingEvidenceNotes?: string;

  @IsOptional()
  @IsString()
  proposedRecommendation?: string;

  @IsOptional()
  @IsString()
  legalBasisRef?: string;

  @IsOptional()
  @IsString()
  @MaxLength(180)
  responsibleOpd?: string;

  @IsOptional()
  @IsDateString()
  followupDeadline?: string;

  @IsOptional()
  @IsString()
  completionIndicator?: string;
}

export class ReviewLkpjFindingRequestDto {
  @IsEnum(LkpjFindingReviewStatus)
  reviewStatus!: LkpjFindingReviewStatus;

  @IsOptional()
  @IsEnum(LkpjEvidenceStatus)
  evidenceStatus?: LkpjEvidenceStatus;

  @IsOptional()
  @IsString()
  proposedRecommendation?: string;

  @IsOptional()
  @IsString()
  legalBasisRef?: string;
}

export class UpdateLkpjFindingFollowupRequestDto {
  @IsEnum(LkpjFollowupStatus)
  followupStatus!: LkpjFollowupStatus;

  @IsOptional()
  @IsString()
  followupResponsePemda?: string;

  @IsOptional()
  @IsString()
  followupProofRef?: string;
}

export class SubmitLkpjFactionProposalRequestDto {
  @IsUUID()
  findingId!: string;

  @IsUUID()
  factionUnitId!: string;

  @IsOptional()
  @IsIn(['HIGH', 'MEDIUM', 'LOW'])
  priorityLevel?: 'HIGH' | 'MEDIUM' | 'LOW';

  @IsEnum(LkpjFactionStance)
  stancePosition!: LkpjFactionStance;

  @IsOptional()
  @IsString()
  supervisionPriorityNotes?: string;

  @IsString()
  proposedRedaction!: string;
}

export class RunLkpjSpecialistAiRequestDto {
  @IsEnum(LkpjAiSpecialistRole)
  specialistRole!: LkpjAiSpecialistRole;

  @IsOptional()
  @IsUUID()
  targetFindingId?: string;

  @IsOptional()
  @IsUUID()
  activeUnitId?: string;

  @IsOptional()
  @IsString()
  customInstruction?: string;
}

export class GenerateLkpjMeetingPackageQueryDto {
  @IsEnum(LkpjMeetingPackageType)
  packageType!: LkpjMeetingPackageType;
}

export class UploadLkpjMaterialMetaRequestDto {
  @IsEnum(LkpjMaterialCategory)
  materialCategory!: LkpjMaterialCategory;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  title?: string;

  @IsOptional()
  @IsString()
  @MaxLength(80)
  documentVersion?: string;

  @IsOptional()
  @Transform(({ value }) => (value !== undefined && value !== '' ? Number(value) : undefined))
  @IsInt()
  @Min(2015)
  sourceYear?: number;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  pageOrArticleRange?: string;

  @IsOptional()
  @IsUUID()
  originUnitId?: string;

  @IsOptional()
  @Transform(({ value }) => value === true || value === 'true' || value === '1')
  @IsBoolean()
  autoExtractFindings?: boolean;
}
