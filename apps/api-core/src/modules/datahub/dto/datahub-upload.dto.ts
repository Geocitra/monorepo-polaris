import { IsOptional, IsString, IsEnum } from 'class-validator';
import { DatahubPrivacyScope, DatahubCategory } from '@polaris/shared-types';

export class DatahubUploadDto {
  @IsOptional()
  @IsString()
  customTitle?: string;

  @IsOptional()
  @IsEnum(DatahubCategory)
  categoryTag?: DatahubCategory;

  @IsOptional()
  @IsEnum(DatahubPrivacyScope)
  privacyScope?: DatahubPrivacyScope;
}
