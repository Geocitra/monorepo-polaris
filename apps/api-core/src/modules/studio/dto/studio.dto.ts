import { IsString, IsNotEmpty, IsOptional, IsBoolean } from 'class-validator';

export class GenerateArticleRequestDto {
  @IsString()
  @IsNotEmpty({ message: 'Topik artikel kebijakan wajib diisi.' })
  topic!: string;

  @IsOptional()
  @IsString()
  targetAudience?: string;

  @IsOptional()
  @IsString()
  toneOverride?: string;

  @IsOptional()
  @IsString()
  comparisonRegion?: string; // Misal: Membandingkan Cirebon dengan Bandung

  @IsOptional()
  @IsString()
  framingStance?: string; // Misal: 'Solutif & Anggaran' | 'Pengawasan & Kritis' | 'Humanis & Lapangan'

  @IsOptional()
  externalUrls?: string[]; // Kumpulan tautan web rujukan

  @IsOptional()
  attachments?: Array<{
    name: string;
    type: string;
    base64: string;
  }>;

  @IsOptional()
  @IsString()
  targetLength?: string;

  @IsOptional()
  @IsString()
  writingStyle?: string;

  @IsOptional()
  @IsString()
  style?: string;

  @IsOptional()
  @IsString()
  aspectRatio?: string;

  @IsOptional()
  @IsBoolean()
  generateDallePoster: boolean = true;

  @IsOptional()
  @IsString()
  taskType?: 'FULL_CAMPAIGN' | 'INFOGRAPHIC_ONLY' | 'ARTICLE_ONLY' | 'REGENERATE_POSTER';
}

export class UpdateDraftArticleDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  excerpt?: string;

  @IsOptional()
  @IsString()
  bodyContentMarkdown?: string;
}

export class UploadArticleImageDto {
  @IsString()
  @IsNotEmpty({ message: 'Data gambar wajib disertakan.' })
  base64!: string;

  @IsOptional()
  @IsString()
  filename?: string;

  @IsOptional()
  @IsString()
  caption?: string;
}

