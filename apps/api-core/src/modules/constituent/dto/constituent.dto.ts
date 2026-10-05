import { 
  IsString, 
  IsNotEmpty, 
  IsEnum, 
  MaxLength, 
  IsOptional 
} from 'class-validator';
import { IssueCategory, FeedbackStatus } from '@polaris/shared-types';

export class SubmitAspirationDto {
  @IsString()
  @IsNotEmpty({ message: 'Subdomain tujuan wajib disertakan.' })
  subdomainSlug!: string;

  @IsString()
  @IsNotEmpty({ message: 'Nama lengkap wajib diisi.' })
  @MaxLength(100)
  citizenName!: string;

  @IsString()
  @IsNotEmpty({ message: 'Nomor WhatsApp wajib diisi.' })
  phoneNumber!: string;

  @IsString()
  @IsNotEmpty({ message: 'Kabupaten/Kota wajib diisi.' })
  regencyName!: string;

  @IsString()
  @IsNotEmpty({ message: 'Kecamatan wajib diisi.' })
  districtKecamatan!: string;

  @IsEnum(IssueCategory, { message: 'Kategori isu tidak valid.' })
  @IsNotEmpty()
  category!: IssueCategory;

  @IsString()
  @IsNotEmpty({ message: 'Pesan aspirasi / keluhan wajib diisi.' })
  @MaxLength(3000)
  aspirationMessage!: string;

  @IsOptional()
  @IsString()
  turnstileToken?: string;
}

export class AskCivicQuestionDto {
  @IsString()
  @IsNotEmpty()
  subdomainSlug!: string;

  @IsString()
  @IsNotEmpty({ message: 'Pertanyaan warga tidak boleh kosong.' })
  @MaxLength(500)
  question!: string;
}

export class UpdateFeedbackStatusDto {
  @IsEnum(FeedbackStatus)
  @IsNotEmpty()
  status!: FeedbackStatus;
}
