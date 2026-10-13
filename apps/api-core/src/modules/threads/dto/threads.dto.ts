import { IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export class ThreadsCallbackQueryDto {
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

export class ProgrammaticThreadsConnectDto {
  @IsOptional()
  @IsString()
  accessToken?: string;

  @IsOptional()
  @IsString()
  code?: string;

  @IsOptional()
  @IsString()
  state?: string;
}

export interface ThreadsAuthUrlResponseDto {
  authorizationUrl: string;
  state: string;
}

export interface ThreadsAccountDetailDto {
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

export class PublishThreadsDto {
  @IsString()
  @IsNotEmpty({ message: 'ID akun Threads wajib disertakan.' })
  accountId!: string;

  @IsOptional()
  @IsString()
  publicationId?: string;

  @IsString()
  @IsNotEmpty({ message: 'Teks cuitan Threads wajib disertakan.' })
  @MaxLength(500, { message: 'Teks cuitan Threads maksimal 500 karakter.' })
  text!: string;

  @IsOptional()
  @IsString()
  mediaUrl?: string;

  @IsOptional()
  @IsString()
  linkAttachment?: string;
}
