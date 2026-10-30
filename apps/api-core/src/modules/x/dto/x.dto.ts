import { IsNotEmpty, IsOptional, IsString, MaxLength, IsArray } from 'class-validator';

export class XCallbackQueryDto {
  @IsOptional()
  @IsString()
  code?: string;

  @IsOptional()
  @IsString()
  state?: string;

  @IsOptional()
  @IsString()
  scope?: string;

  @IsOptional()
  @IsString()
  error?: string;

  @IsOptional()
  @IsString()
  error_description?: string;
}

export class ProgrammaticXConnectDto {
  @IsOptional()
  @IsString()
  accessToken?: string;

  @IsOptional()
  @IsString()
  refreshToken?: string;

  @IsOptional()
  @IsString()
  code?: string;

  @IsOptional()
  @IsString()
  state?: string;
}

export interface XAuthUrlResponseDto {
  authorizationUrl: string;
  state: string;
}

export interface XAccountDetailDto {
  id: string;
  platform: string;
  accountType: string;
  accountHandle: string;
  accountName: string | null;
  profilePictureUrl: string | null;
  status: string;
  tokenExpiresAt: string;
  daysRemaining: number;
  needsRefresh: boolean;
  createdAt: string;
}

export class PublishXDto {
  @IsString()
  @IsNotEmpty({ message: 'ID akun X wajib disertakan.' })
  accountId!: string;

  @IsOptional()
  @IsString()
  publicationId?: string;

  @IsString()
  @IsNotEmpty({ message: 'Teks cuitan X (tweet) wajib disertakan.' })
  @MaxLength(4000, { message: 'Teks cuitan X melebihi batas thread maksimum (4000 karakter).' })
  text!: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  mediaUrls?: string[];
}

