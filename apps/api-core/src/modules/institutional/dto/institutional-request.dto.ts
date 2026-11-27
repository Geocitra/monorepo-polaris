import {
  IsString,
  IsOptional,
  IsEnum,
  IsInt,
  IsNumber,
  IsBoolean,
  IsArray,
  IsUUID,
  IsDateString,
  IsEmail,
  IsIn,
  ValidateNested,
  Min,
  MaxLength,
  IsObject,
} from 'class-validator';
import { Type } from 'class-transformer';
import {
  LegislativeLevel,
  OrganizationStatus,
  OrganizationContractStatus,
  OrganizationUnitType,
  OrganizationMemberRole,
  OrganizationUnitMemberRole,
  InstitutionalNoteVisibility,
  DatahubCategory,
  type StandingOrdersConfigDto,
} from '@polaris/shared-types';

export class CreateInitialOrgAdminDto {
  @IsString()
  @MaxLength(150)
  fullName!: string;

  @IsEmail()
  @MaxLength(180)
  email!: string;

  @IsOptional()
  @IsString()
  @MaxLength(30)
  phoneNumber?: string;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  titleOrPosition?: string;
}

export class CreateInstitutionRequestDto {
  @IsOptional()
  @IsString()
  @MaxLength(50)
  code?: string;

  @IsString()
  @MaxLength(200)
  name!: string;

  @IsEnum(LegislativeLevel)
  legislativeLevel!: LegislativeLevel;

  @IsString()
  @MaxLength(120)
  regionName!: string;

  @IsString()
  @MaxLength(100)
  provinceName!: string;

  @IsOptional()
  @IsObject()
  standingOrdersConfig?: StandingOrdersConfigDto;

  // Initial B2G Annual Contract
  @IsOptional()
  @IsString()
  @MaxLength(100)
  contractNumber?: string;

  @IsInt()
  @Min(2024)
  fiscalYear!: number;

  @IsDateString()
  startDate!: string;

  @IsDateString()
  endDate!: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  maxSeats?: number;

  @IsOptional()
  @IsNumber()
  @Min(1000000)
  maxStorageBytes?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  annualTokenPoolLimit?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  weeklyGenerateLimitPerMember?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  revisionLimitPerItem?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  contractValueIdr?: number;

  @IsOptional()
  @IsUUID()
  initialOrgAdminTenantId?: string;

  @IsOptional()
  @IsEmail()
  initialOrgAdminEmail?: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => CreateInitialOrgAdminDto)
  createInitialOrgAdmin?: CreateInitialOrgAdminDto;
}

export class UpdateInstitutionRequestDto {
  @IsOptional()
  @IsString()
  @MaxLength(200)
  name?: string;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  regionName?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  provinceName?: string;

  @IsOptional()
  @IsEnum(OrganizationStatus)
  status?: OrganizationStatus;

  @IsOptional()
  @IsObject()
  standingOrdersConfig?: StandingOrdersConfigDto;
}

export class UpsertOrganizationContractRequestDto {
  @IsString()
  @MaxLength(100)
  contractNumber!: string;

  @IsInt()
  @Min(2024)
  fiscalYear!: number;

  @IsEnum(OrganizationContractStatus)
  status!: OrganizationContractStatus;

  @IsDateString()
  startDate!: string;

  @IsDateString()
  endDate!: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  maxSeats?: number;

  @IsOptional()
  @IsNumber()
  @Min(1000000)
  maxStorageBytes?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  annualTokenPoolLimit?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  weeklyGenerateLimitPerMember?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  revisionLimitPerItem?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  contractValueIdr?: number;

  @IsOptional()
  @IsString()
  notes?: string;
}

export class ReviseInstitutionalItemDto {
  @IsString()
  @MaxLength(2000)
  revisionInstruction!: string;
}

export class AssignOrganizationMemberRequestDto {
  @IsOptional()
  @IsUUID()
  tenantId?: string;

  @IsOptional()
  @IsString()
  email?: string;

  @IsEnum(OrganizationMemberRole)
  orgRole!: OrganizationMemberRole;

  @IsOptional()
  @IsString()
  @MaxLength(150)
  titleOrPosition?: string;
}

export class CreateOrganizationMemberAccountDto {
  @IsString()
  @MaxLength(150)
  fullName!: string;

  @IsEmail()
  @MaxLength(180)
  email!: string;

  @IsOptional()
  @IsString()
  @MaxLength(30)
  phoneNumber?: string;

  @IsEnum(OrganizationMemberRole)
  orgRole!: OrganizationMemberRole;

  @IsOptional()
  @IsString()
  @MaxLength(150)
  titleOrPosition?: string;

  @IsOptional()
  @IsUUID()
  initialUnitId?: string;

  @IsOptional()
  @IsEnum(OrganizationUnitMemberRole)
  initialUnitRole?: OrganizationUnitMemberRole;
}

export class CreateOrganizationUnitRequestDto {
  @IsOptional()
  @IsUUID()
  parentUnitId?: string | null;

  @IsEnum(OrganizationUnitType)
  unitType!: OrganizationUnitType;

  @IsString()
  @MaxLength(60)
  code!: string;

  @IsString()
  @MaxLength(180)
  name!: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsUUID()
  politicalPartyId?: string | null;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  focusSectors?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  partnerOpds?: string[];

  @IsOptional()
  @IsBoolean()
  isAdHoc?: boolean;

  @IsOptional()
  @IsInt()
  fiscalYear?: number | null;
}

export class UpdateOrganizationUnitRequestDto {
  @IsOptional()
  @IsString()
  @MaxLength(180)
  name?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  focusSectors?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  partnerOpds?: string[];

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class AssignUnitMemberRequestDto {
  @IsUUID()
  tenantId!: string;

  @IsEnum(OrganizationUnitMemberRole)
  unitRole!: OrganizationUnitMemberRole;
}

export class CreateSharedNoteRequestDto {
  @IsString()
  @MaxLength(255)
  title!: string;

  @IsString()
  contentMarkdown!: string;

  @IsOptional()
  @IsEnum(InstitutionalNoteVisibility)
  visibility?: InstitutionalNoteVisibility;

  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true })
  sourceFileIds?: string[];
}

export class PromoteSharedNoteVisibilityRequestDto {
  @IsEnum(InstitutionalNoteVisibility)
  targetVisibility!: InstitutionalNoteVisibility;
}

export class InstitutionalDocumentUploadMetaDto {
  @IsOptional()
  @IsString()
  @MaxLength(255)
  customTitle?: string;

  @IsOptional()
  @IsEnum(DatahubCategory)
  categoryTag?: DatahubCategory;
}

export class InstitutionalAiAssistBodyDto {
  @IsString()
  prompt!: string;

  @IsOptional()
  @IsString()
  focusIssue?: string;

  @IsOptional()
  @IsBoolean()
  includeOrgSharedDocuments?: boolean;

  @IsOptional()
  @IsBoolean()
  includeNationalAndRegionalRegulations?: boolean;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  saveAsSharedNoteTitle?: string;

  @IsOptional()
  @IsBoolean()
  skipClarification?: boolean;
}

export class CoordinatorChatTurnDto {
  @IsString()
  @IsIn(['user', 'assistant'])
  role!: 'user' | 'assistant';

  @IsString()
  @MaxLength(12000)
  content!: string;
}

export class CoordinatorChatRequestDto {
  @IsOptional()
  @IsUUID('4')
  sessionId?: string;

  @IsString()
  @MaxLength(6000)
  message!: string;

  @IsOptional()
  @IsIn(['AUTO', 'LKPJ_FINANCE', 'LEGISLATION', 'BRIEFING', 'ARTICLE', 'IMAGE'])
  mode?: 'AUTO' | 'LKPJ_FINANCE' | 'LEGISLATION' | 'BRIEFING' | 'ARTICLE' | 'IMAGE';

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CoordinatorChatTurnDto)
  history?: CoordinatorChatTurnDto[];

  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true })
  selectedFileIds?: string[];

  @IsOptional()
  @IsBoolean()
  includeOrgSharedDocuments?: boolean;

  @IsOptional()
  @IsBoolean()
  includeNationalAndRegionalRegulations?: boolean;

  @IsOptional()
  @IsIn(['1:1', '4:5', '16:9', '9:16'])
  imageAspectRatio?: '1:1' | '4:5' | '16:9' | '9:16';

  @IsOptional()
  @IsString()
  @MaxLength(80)
  imageArchetype?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  saveAsSharedNoteTitle?: string;

  @IsOptional()
  @IsBoolean()
  skipClarification?: boolean;
}
