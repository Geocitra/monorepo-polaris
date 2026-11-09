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
import { BriefUrgencyLevel, BriefTargetComponent, LiveChatCsatRating } from '@polaris/shared-types';

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
  @MinLength(2)
  @MaxLength(1500)
  questionText!: string;

  @IsOptional()
  @IsBoolean()
  requiresClientAnswer?: boolean;
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

export interface ParagraphRevisionItem {
  paragraphIndex: number;
  feedbackText: string;
  originalText?: string;
}

export class PublicReviewRevisionDto {
  @IsArray()
  @ArrayNotEmpty()
  @IsEnum(BriefTargetComponent, { each: true })
  targetComponents!: BriefTargetComponent[];

  @IsString()
  @MinLength(3)
  @MaxLength(3000)
  feedbackText!: string;

  @IsOptional()
  @IsArray()
  paragraphRevisions?: ParagraphRevisionItem[];
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

export class DispatchPackageDto {
  @IsUUID()
  tenantId!: string;

  @IsOptional()
  @IsUUID()
  publicationId?: string;

  @IsOptional()
  @IsString()
  packageText?: string;

  @IsOptional()
  @IsString()
  posterUrl?: string;
}



export class SendLiveChatMessageDto {
  @IsString()
  @MinLength(1)
  @MaxLength(2000)
  textBody!: string;
}

export class LiveChatCsatFeedbackDto {
  @IsEnum(LiveChatCsatRating)
  rating!: LiveChatCsatRating;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  feedbackText?: string;
}
