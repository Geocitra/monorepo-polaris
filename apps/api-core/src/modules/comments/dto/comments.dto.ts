import { IsNotEmpty, IsString, IsOptional, MaxLength, IsEnum, IsBoolean } from 'class-validator';
import { CommentStatus } from '@polaris/shared-types';

export class GoogleAuthRequestDto {
  @IsOptional()
  @IsString()
  credential?: string; // JWT credential from Google Identity Services

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

export class CreateCommentRequestDto {
  @IsString()
  @IsNotEmpty({ message: 'Teks komentar tidak boleh kosong.' })
  @MaxLength(1000, { message: 'Teks komentar maksimal 1.000 karakter.' })
  commentText!: string;

  @IsOptional()
  @IsString()
  parentCommentId?: string | null;
}

export class ModerateCommentRequestDto {
  @IsEnum(CommentStatus, { message: 'Status moderasi komentar tidak valid.' })
  status!: CommentStatus;
}
