import { IsEmail, IsNotEmpty, IsString, IsEnum, IsOptional } from 'class-validator';
import { LegislativeLevel, PlanTier, InquiryStatus, BillingCycle } from '@polaris/shared-types';

export class SubmitInquiryRequestDto {
  @IsString({ message: 'Nama lengkap wajib berupa teks.' })
  @IsNotEmpty({ message: 'Nama lengkap tidak boleh kosong.' })
  fullName!: string;

  @IsString({ message: 'Nomor WhatsApp wajib berupa teks.' })
  @IsNotEmpty({ message: 'Nomor WhatsApp tidak boleh kosong.' })
  phoneNumber!: string;

  @IsEmail({}, { message: 'Format email dinas/resmi tidak valid.' })
  @IsNotEmpty({ message: 'Email tidak boleh kosong.' })
  officialEmail!: string;

  @IsOptional()
  @IsString()
  partyAffiliation?: string;

  @IsEnum(LegislativeLevel, { message: 'Tingkat jabatan legislatif/eksekutif tidak valid.' })
  @IsNotEmpty({ message: 'Tingkat jabatan wajib dipilih.' })
  legislativeLevel!: LegislativeLevel;

  @IsString({ message: 'Asal wilayah / dapil wajib diisi.' })
  @IsNotEmpty({ message: 'Asal wilayah tidak boleh kosong.' })
  targetRegion!: string;

  @IsOptional()
  @IsString()
  preferredCycle?: string = 'SEMESTER';

  @IsOptional()
  @IsEnum(PlanTier)
  preferredTier?: PlanTier = PlanTier.PRO;
}

export class ScheduleMeetRequestDto {
  @IsString({ message: 'Waktu pertemuan Google Meet wajib diisi.' })
  @IsNotEmpty({ message: 'Waktu pertemuan tidak boleh kosong.' })
  meetingDatetime!: string;

  @IsString({ message: 'Tautan Google Meet wajib diisi.' })
  @IsNotEmpty({ message: 'Tautan Google Meet tidak boleh kosong.' })
  meetingUrl!: string;

  @IsOptional()
  @IsString()
  adminNotes?: string;
}

export class UpdateInquiryStatusRequestDto {
  @IsEnum(InquiryStatus, { message: 'Status lead tidak valid.' })
  @IsNotEmpty({ message: 'Status lead tidak boleh kosong.' })
  status!: InquiryStatus;

  @IsOptional()
  @IsString()
  adminNotes?: string;
}

export class ConvertInquiryLeadDto {
  @IsString({ message: 'Subdomain slug tidak boleh kosong.' })
  @IsNotEmpty()
  subdomainSlug!: string;

  @IsOptional()
  @IsString()
  username?: string;

  @IsOptional()
  @IsEnum(PlanTier)
  planTier?: PlanTier;

  @IsOptional()
  @IsString()
  billingCycle?: string;

  @IsOptional()
  @IsString()
  customDapilName?: string;
}

