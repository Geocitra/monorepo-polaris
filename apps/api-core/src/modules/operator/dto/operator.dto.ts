import { IsString, IsNotEmpty, IsOptional, IsBoolean, IsUUID, IsEnum } from 'class-validator';
import { OperatorAssignmentStatus } from '@polaris/shared-types';

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

export class UpdateAssignmentStatusDto {
  @IsEnum(OperatorAssignmentStatus, { message: 'Status penugasan tidak valid.' })
  @IsNotEmpty({ message: 'Status tidak boleh kosong.' })
  status!: OperatorAssignmentStatus;

  @IsBoolean()
  @IsOptional()
  canDirectPublish?: boolean;

  @IsString()
  @IsOptional()
  notes?: string;
}

export class CreateOperatorAccountDto {
  @IsNotEmpty({ message: 'Email tidak boleh kosong.' })
  email!: string;

  @IsNotEmpty({ message: 'Password tidak boleh kosong.' })
  password!: string;

  @IsNotEmpty({ message: 'Nama lengkap tidak boleh kosong.' })
  fullName!: string;

  @IsOptional()
  avatarUrl?: string;
}

export class UpdateOperatorAccountDto {
  @IsString({ message: 'Nama lengkap harus berupa teks.' })
  @IsOptional()
  fullName?: string;

  @IsString({ message: 'Email harus berupa teks.' })
  @IsOptional()
  email?: string;

  @IsString({ message: 'Password harus berupa teks.' })
  @IsOptional()
  password?: string;

  @IsBoolean({ message: 'isActive harus berupa boolean.' })
  @IsOptional()
  isActive?: boolean;

  @IsString({ message: 'Avatar URL harus berupa teks.' })
  @IsOptional()
  avatarUrl?: string;
}

