import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsBoolean,
  IsUUID,
  IsArray,
  IsEmail,
  MinLength,
  IsIn,
} from 'class-validator';

export class AssignOperatorDto {
  @IsUUID('4', { message: 'Operator ID harus berupa UUID v4 yang valid.' })
  @IsNotEmpty({ message: 'Operator ID tidak boleh kosong.' })
  operatorId!: string;

  @IsUUID('4', { message: 'Tenant ID harus berupa UUID v4 yang valid.' })
  @IsNotEmpty({ message: 'Tenant ID tidak boleh kosong.' })
  tenantId!: string;

  @IsBoolean({ message: 'canDirectPublish harus berupa boolean.' })
  @IsOptional()
  canDirectPublish?: boolean;

  @IsString({ message: 'Catatan harus berupa teks.' })
  @IsOptional()
  notes?: string;
}

export class UnassignOperatorDto {
  @IsUUID('4', { message: 'Operator ID harus berupa UUID v4 yang valid.' })
  @IsNotEmpty({ message: 'Operator ID tidak boleh kosong.' })
  operatorId!: string;

  @IsUUID('4', { message: 'Tenant ID harus berupa UUID v4 yang valid.' })
  @IsNotEmpty({ message: 'Tenant ID tidak boleh kosong.' })
  tenantId!: string;
}

export class CreateOperatorAccountDto {
  @IsEmail({}, { message: 'Format email tidak valid.' })
  @IsNotEmpty({ message: 'Email tidak boleh kosong.' })
  email!: string;

  @IsString({ message: 'Password harus berupa teks.' })
  @MinLength(6, { message: 'Password minimal 6 karakter.' })
  @IsNotEmpty({ message: 'Password tidak boleh kosong.' })
  password!: string;

  @IsString({ message: 'Nama lengkap harus berupa teks.' })
  @IsNotEmpty({ message: 'Nama lengkap tidak boleh kosong.' })
  fullName!: string;

  @IsOptional()
  @IsIn(['CONTENT_OPERATOR', 'SUPPORT_OPERATOR'], {
    message: 'Role operator harus CONTENT_OPERATOR atau SUPPORT_OPERATOR.',
  })
  role?: 'CONTENT_OPERATOR' | 'SUPPORT_OPERATOR';

  @IsOptional()
  @IsString()
  avatarUrl?: string;
}

export class UpdateOperatorAccountDto {
  @IsString({ message: 'Nama lengkap harus berupa teks.' })
  @IsOptional()
  fullName?: string;

  @IsEmail({}, { message: 'Format email tidak valid.' })
  @IsOptional()
  email?: string;

  @IsString({ message: 'Password harus berupa teks.' })
  @MinLength(6, { message: 'Password baru minimal 6 karakter.' })
  @IsOptional()
  password?: string;

  @IsBoolean({ message: 'isActive harus berupa boolean.' })
  @IsOptional()
  isActive?: boolean;

  @IsString({ message: 'Avatar URL harus berupa teks.' })
  @IsOptional()
  avatarUrl?: string;
}

export class OperatorUpdateTenantProfileDto {
  @IsOptional()
  @IsString()
  fullName?: string;

  @IsOptional()
  @IsString()
  partyAffiliation?: string;

  @IsOptional()
  @IsString()
  customDapilName?: string;

  @IsOptional()
  @IsString()
  commissionName?: string;

  @IsOptional()
  @IsString()
  photoUrl?: string;

  @IsOptional()
  @IsString()
  education?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  issueInterests?: string[];
}

