import { IsEmail, IsNotEmpty, IsString, MinLength, Matches, IsEnum, IsOptional } from 'class-validator';
import { LegislativeLevel, PlanTier } from '@polaris/shared-types';

export class RegisterRequestDto {
  @IsEmail({}, { message: 'Format email tidak valid.' })
  @IsNotEmpty({ message: 'Email tidak boleh kosong.' })
  email!: string;

  @IsString({ message: 'Password harus berupa teks.' })
  @MinLength(8, { message: 'Password minimal 8 karakter.' })
  password!: string;

  @IsString({ message: 'Nama lengkap harus berupa teks.' })
  @IsNotEmpty({ message: 'Nama lengkap tidak boleh kosong.' })
  fullName!: string;

  @IsString({ message: 'Nomor telepon harus berupa teks.' })
  @IsNotEmpty({ message: 'Nomor telepon tidak boleh kosong.' })
  phoneNumber!: string;

  @IsOptional()
  @IsString()
  partyAffiliation?: string;

  @IsOptional()
  @IsEnum(LegislativeLevel, {
    message: 'Peran jabatan publik tidak valid. Pilih dari klasifikasi resmi parlemen dan eksekutif.',
  })
  legislativeLevel?: LegislativeLevel;

  @IsOptional()
  @IsString()
  dapilId?: string;

  @IsOptional()
  @IsString()
  @Matches(/^[a-z0-9]+(-[a-z0-9]+)*$/, {
    message: 'Subdomain hanya boleh berisi huruf kecil, angka, dan strip (contoh: ahmad-fauzi).',
  })
  subdomainSlug?: string;

  @IsOptional()
  @IsEnum(PlanTier)
  planTier?: PlanTier = PlanTier.PRO;
}

export class LoginRequestDto {
  @IsOptional()
  @IsString()
  email?: string;

  @IsOptional()
  @IsString()
  identifier?: string;

  @IsString()
  @IsNotEmpty({ message: 'Password tidak boleh kosong.' })
  password!: string;
}

export interface LoginInitiateResponseDto {
  step: '2FA_REQUIRED';
  requireOtp: boolean;
  email: string;
  message: string;
}

export interface AuthResponseDto {
  accessToken: string;
  expiresIn: string;
  user: {
    id: string;
    email: string;
    username?: string | null;
    fullName: string;
    partyAffiliation?: string | null;
    subdomain: string;
    mustChangePassword?: boolean;
    legislativeLevel?: LegislativeLevel;
  };
}

export class ForceChangeInitialPasswordDto {
  @IsString({ message: 'Kata sandi saat ini harus berupa teks.' })
  @IsNotEmpty({ message: 'Kata sandi saat ini tidak boleh kosong.' })
  currentPassword!: string;

  @IsString({ message: 'Kata sandi baru harus berupa teks.' })
  @MinLength(8, { message: 'Kata sandi baru minimal 8 karakter.' })
  newPassword!: string;
}

export class SendOtpRequestDto {
  @IsEmail({}, { message: 'Format email tidak valid.' })
  @IsNotEmpty({ message: 'Email tidak boleh kosong.' })
  email!: string;
}

export class VerifyOtpRequestDto {
  @IsEmail({}, { message: 'Format email tidak valid.' })
  @IsNotEmpty({ message: 'Email tidak boleh kosong.' })
  email!: string;

  @IsString()
  @IsNotEmpty({ message: 'Kode OTP wajib disertakan.' })
  otpCode!: string;
}

export class UpdateProfileDto {
  @IsOptional()
  @IsString()
  username?: string;

  @IsOptional()
  @IsString()
  fullName?: string;

  @IsOptional()
  @IsString()
  phoneNumber?: string;

  @IsOptional()
  @IsString()
  partyAffiliation?: string;

  @IsOptional()
  @IsString()
  institutionPartyName?: string;

  // Catatan Arsitektur: legislativeLevel dan officeRole sengaja TIDAK dimasukkan di sini
  // untuk mencegah arbitrase harga (Protected Variations). Mutasi level hanya via Superadmin.

  @IsOptional()
  @IsString()
  dapilId?: string;

  @IsOptional()
  @IsString()
  provinceName?: string;

  @IsOptional()
  @IsString()
  dapilName?: string;

  @IsOptional()
  @IsString()
  dapilCode?: string;

  @IsOptional()
  regencyCoverage?: string[] | string;

  @IsOptional()
  @IsString()
  photoUrl?: string;

  @IsOptional()
  @IsString()
  gender?: string;

  @IsOptional()
  @IsString()
  birthDate?: string;

  @IsOptional()
  @IsString()
  education?: string;

  @IsOptional()
  @IsString()
  commissionId?: string;

  @IsOptional()
  @IsString()
  commissionName?: string;

  @IsOptional()
  courses?: string[] | string;

  @IsOptional()
  issueInterests?: string[] | string;
}

