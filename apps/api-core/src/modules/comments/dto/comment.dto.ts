import { IsNotEmpty, IsString, MaxLength, IsOptional, IsEnum, IsBoolean } from 'class-validator';

export class GoogleCitizenLoginDto {
  @IsOptional()
  @IsString()
  idToken?: string;

  @IsOptional()
  @IsString()
  credential?: string; // Dukungan alias dari Google Identity Services

  @IsOptional()
  @IsBoolean()
  isDevMock?: boolean;

  @IsOptional()
  @IsString()
  mockName?: string;

  @IsOptional()
  @IsString()
  mockEmail?: string;

  @IsOptional()
  @IsString()
  mockAvatar?: string;
}

export class CreateCommentDto {
  @IsString()
  @IsNotEmpty({ message: 'Isi komentar tidak boleh kosong.' })
  @MaxLength(1000, { message: 'Komentar maksimal 1.000 karakter.' })
  commentText!: string;

  @IsOptional()
  @IsString()
  parentCommentId?: string;
}

export class ModerateCommentDto {
  @IsEnum(['PUBLISHED', 'PENDING_REVIEW', 'HIDDEN', 'FLAGGED_SPAM'], {
    message: 'Status moderasi tidak valid.',
  })
  @IsNotEmpty()
  status!: 'PUBLISHED' | 'PENDING_REVIEW' | 'HIDDEN' | 'FLAGGED_SPAM';
}
