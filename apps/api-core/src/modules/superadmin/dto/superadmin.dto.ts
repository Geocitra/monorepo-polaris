import { IsString, IsEmail, IsNotEmpty, IsOptional, IsNumber, IsBoolean, IsArray, IsEnum } from 'class-validator';
import { LegislativeLevel, SubscriptionStatus, PlanTier } from '@polaris/shared-types';

export class SuperadminLoginDto {
  @IsEmail({}, { message: 'Format email tidak valid.' })
  @IsNotEmpty({ message: 'Email tidak boleh kosong.' })
  email!: string;

  @IsString({ message: 'Password harus berupa teks.' })
  @IsNotEmpty({ message: 'Password tidak boleh kosong.' })
  password!: string;
}

export class SuperadminSendOtpDto {
  @IsEmail({}, { message: 'Format email tidak valid.' })
  @IsNotEmpty({ message: 'Email tidak boleh kosong.' })
  email!: string;
}

export class SuperadminVerifyOtpDto {
  @IsEmail({}, { message: 'Format email tidak valid.' })
  @IsNotEmpty({ message: 'Email tidak boleh kosong.' })
  email!: string;

  @IsString({ message: 'Kode OTP harus berupa teks.' })
  @IsNotEmpty({ message: 'Kode OTP tidak boleh kosong.' })
  otpCode!: string;
}

export class UpdateTenantStatusDto {
  @IsString()
  @IsNotEmpty()
  status!: 'ACTIVE' | 'SUSPENDED' | 'PENDING_VERIFICATION';

  @IsString()
  @IsOptional()
  internalNotes?: string;
}

export class VerifyTenantDto {
  @IsBoolean()
  isVerified!: boolean;
}

export class ManualLicenseGrantDto {
  @IsNumber()
  additionalDays!: number; // e.g. 30, 180, 365

  @IsEnum(PlanTier)
  @IsOptional()
  planTier?: PlanTier;

  @IsString()
  @IsOptional()
  referenceNumber?: string; // Nomor SPK / Invoice Offline
}

export class CreatePartyDto {
  @IsString()
  @IsNotEmpty()
  code!: string;

  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsNumber()
  @IsOptional()
  ballotNumber?: number;

  @IsString()
  @IsNotEmpty()
  primaryColor!: string;

  @IsString()
  @IsOptional()
  secondaryColor?: string;

  @IsString()
  @IsOptional()
  logoUrl?: string;

  @IsString()
  @IsOptional()
  description?: string;
}

export class UpdatePartyDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsNumber()
  @IsOptional()
  ballotNumber?: number;

  @IsString()
  @IsOptional()
  primaryColor?: string;

  @IsString()
  @IsOptional()
  secondaryColor?: string;

  @IsString()
  @IsOptional()
  logoUrl?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}

export class CreateDapilDto {
  @IsString()
  @IsNotEmpty()
  dapilCode!: string;

  @IsString()
  @IsNotEmpty()
  dapilName!: string;

  @IsString()
  @IsNotEmpty()
  provinceName!: string;

  @IsArray()
  regencyCoverage!: string[];

  @IsNumber()
  @IsOptional()
  totalVoters?: number;
}

export class TopupTokenPoolDto {
  @IsNumber()
  @IsNotEmpty()
  amountUsd!: number;

  @IsNumber()
  @IsOptional()
  amountIdr?: number;

  @IsNumber()
  @IsOptional()
  tokensAdded?: number;

  @IsString()
  @IsOptional()
  paymentReference?: string;

  @IsString()
  @IsOptional()
  notes?: string;
}

export class AdminCreateTenantDto {
  @IsEmail({}, { message: 'Format email tidak valid.' })
  @IsNotEmpty({ message: 'Email tidak boleh kosong.' })
  email!: string;

  @IsOptional()
  @IsString()
  username?: string;

  @IsString({ message: 'Nama lengkap tidak boleh kosong.' })
  @IsNotEmpty()
  fullName!: string;

  @IsString({ message: 'Nomor telepon tidak boleh kosong.' })
  @IsNotEmpty()
  phoneNumber!: string;

  @IsOptional()
  @IsString()
  partyAffiliation?: string;

  @IsEnum(LegislativeLevel, { message: 'Tingkat legislatif tidak valid.' })
  @IsNotEmpty()
  legislativeLevel!: LegislativeLevel;

  @IsOptional()
  @IsString()
  electoralDistrictId?: string;

  @IsOptional()
  @IsString()
  customDapilName?: string;

  @IsString()
  @IsNotEmpty({ message: 'Subdomain slug tidak boleh kosong.' })
  subdomainSlug!: string;

  @IsEnum(PlanTier)
  @IsOptional()
  planTier?: PlanTier = PlanTier.PRO;

  @IsOptional()
  @IsString()
  billingCycle?: string = 'SEMESTER';

  @IsOptional()
  @IsBoolean()
  generatePrepaidInvoice?: boolean = false;

  @IsOptional()
  @IsString()
  inquiryId?: string;
}

export class AdminUpdateLegislativeLevelDto {
  @IsEnum(LegislativeLevel, { message: 'Tingkat legislatif baru tidak valid.' })
  @IsNotEmpty()
  legislativeLevel!: LegislativeLevel;

  @IsOptional()
  @IsString()
  verificationNotes?: string;
}

export class AdminResetTenantPasswordDto {
  @IsOptional()
  @IsString()
  newPassword?: string;
}

export class AdminUpdatePricingMatrixDto {
  @IsNumber()
  @IsNotEmpty()
  amountIdr!: number;

  @IsOptional()
  @IsNumber()
  durationDays?: number;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

