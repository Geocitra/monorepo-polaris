import { IsNotEmpty, IsOptional, IsString, MaxLength, IsIn } from 'class-validator';

export class TikTokCallbackQueryDto {
  @IsOptional()
  @IsString()
  code?: string;

  @IsOptional()
  @IsString()
  state?: string;

  @IsOptional()
  @IsString()
  scopes?: string;

  @IsOptional()
  @IsString()
  scope?: string;

  @IsOptional()
  @IsString()
  error?: string;

  @IsOptional()
  @IsString()
  error_description?: string;

  @IsOptional()
  @IsString()
  error_code?: string;
}

export interface TikTokAuthUrlResponseDto {
  authorizationUrl: string;
  state: string;
}

export interface TikTokAccountDetailDto {
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

export class PublishTikTokDto {
  @IsString()
  @IsNotEmpty({ message: 'ID akun TikTok wajib disertakan.' })
  accountId!: string;

  @IsOptional()
  @IsString()
  publicationId?: string;

  @IsString()
  @IsNotEmpty({ message: 'Judul / caption video TikTok wajib disertakan.' })
  @MaxLength(2200, { message: 'Caption video TikTok maksimal 2200 karakter.' })
  title!: string;

  @IsString()
  @IsNotEmpty({ message: 'URL media (video / foto) wajib disertakan.' })
  mediaUrl!: string;

  @IsOptional()
  @IsString()
  @IsIn(['VIDEO', 'PHOTO'], { message: 'Tipe media harus VIDEO atau PHOTO.' })
  mediaType?: 'VIDEO' | 'PHOTO';

  @IsOptional()
  @IsString()
  @IsIn(['PUBLIC_TO_EVERYONE', 'MUTUAL_FOLLOW_FRIENDS', 'SELF_ONLY'])
  privacyLevel?: 'PUBLIC_TO_EVERYONE' | 'MUTUAL_FOLLOW_FRIENDS' | 'SELF_ONLY';
}

