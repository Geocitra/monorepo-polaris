import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class InstagramCallbackQueryDto {
  @IsOptional()
  @IsString()
  code?: string;

  @IsOptional()
  @IsString()
  state?: string;

  @IsOptional()
  @IsString()
  error?: string;

  @IsOptional()
  @IsString()
  error_reason?: string;

  @IsOptional()
  @IsString()
  error_description?: string;
}

export class ProgrammaticExchangeDto {
  @IsString()
  @IsNotEmpty({ message: 'Authorization code Meta wajib disertakan.' })
  code!: string;

  @IsString()
  @IsNotEmpty({ message: 'State parameter wajib disertakan untuk verifikasi keamanan.' })
  state!: string;
}

export interface InstagramAuthUrlResponseDto {
  authorizationUrl: string;
  state: string;
}

export interface InstagramAccountDetailDto {
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

export class PublishInstagramDto {
  @IsString()
  @IsNotEmpty({ message: 'ID akun Instagram wajib disertakan.' })
  accountId!: string;

  @IsOptional()
  @IsString()
  publicationId?: string;

  @IsString()
  @IsNotEmpty({ message: 'Teks caption wajib disertakan.' })
  caption!: string;

  @IsOptional()
  @IsString()
  mediaUrl?: string;

  @IsOptional()
  mediaUrls?: string[];

  @IsOptional()
  @IsString()
  framingMode?: 'crop' | 'blur';
}

