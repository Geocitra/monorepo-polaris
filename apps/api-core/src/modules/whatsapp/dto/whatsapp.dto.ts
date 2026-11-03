import {
  IsString,
  IsOptional,
  IsEnum,
  IsUUID,
  IsArray,
  IsBoolean,
  IsInt,
  Min,
  Max,
  MinLength,
  MaxLength,
  ArrayNotEmpty,
} from 'class-validator';
import { BriefUrgencyLevel, BriefTargetComponent } from '@polaris/shared-types';

export class AcceptBriefDto {
  @IsOptional()
  @IsEnum(BriefUrgencyLevel)
  operatorPriority?: BriefUrgencyLevel;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  operatorNotes?: string;
}

export class RejectBriefDto {
  @IsString()
  @MinLength(5)
  @MaxLength(500)
  reason!: string;
}

export class SendClarificationDto {
  @IsString()
  @MinLength(5)
  @MaxLength(1500)
  questionText!: string;
}

export class SubmitBriefReviewDto {
  @IsUUID()
  publicationId!: string;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  customNote?: string;

  @IsOptional()
  @IsBoolean()
  directPublishImmediately?: boolean;
}

export class MarkRevisionFaultDto {
  @IsUUID()
  messageId!: string;

  @IsBoolean()
  isInternalFault!: boolean;
}

export class PublicReviewRevisionDto {
  @IsArray()
  @ArrayNotEmpty()
  @IsEnum(BriefTargetComponent, { each: true })
  targetComponents!: BriefTargetComponent[];

  @IsString()
  @MinLength(5)
  @MaxLength(2000)
  feedbackText!: string;
}

export class UpdateTenantBriefLimitsDto {
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(14)
  weeklyRequestLimit?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(10)
  revisionLimit?: number;
}

