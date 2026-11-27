import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsArray,
  IsBoolean,
  IsNumber,
  ValidateNested,
  MaxLength,
} from 'class-validator';
import { Type } from 'class-transformer';

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
  visualFormat?: 'poster' | 'infographic';

  @IsOptional()
  @IsString()
  aspectRatio?: string;

  @IsOptional()
  @IsBoolean()
  generateDallePoster: boolean = true;

  @IsOptional()
  @IsString()
  taskType?: 'FULL_CAMPAIGN' | 'INFOGRAPHIC_ONLY' | 'ARTICLE_ONLY' | 'REGENERATE_POSTER' | 'POSTER_ONLY';

  @IsOptional()
  @IsString()
  briefId?: string;

  @IsOptional()
  @IsBoolean()
  isUrgentOverquota?: boolean;

  @IsOptional()
  @IsString()
  forcedArchetype?: string;

  @IsOptional()
  @IsNumber()
  layoutVariant?: number;

  @IsOptional()
  @IsBoolean()
  enableImg2ImgPass?: boolean;

  @IsOptional()
  @IsNumber()
  img2ImgDenoisingStrength?: number;
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

export class PublishInfographicDto {
  @IsString()
  @IsNotEmpty({ message: 'Judul infografis wajib diisi.' })
  title!: string;

  @IsString()
  @IsNotEmpty({ message: 'URL visual gambar infografis wajib diisi.' })
  imageUrl!: string;

  @IsOptional()
  @IsString()
  caption?: string;

  @IsOptional()
  @IsString()
  prompt?: string;

  @IsOptional()
  @IsString()
  aspectRatio?: string;

  @IsOptional()
  @IsString()
  style?: string;

  @IsOptional()
  @IsString()
  publicationId?: string;
}

export class ExtractPosterManifestDto {
  @IsString()
  @IsNotEmpty({ message: 'URL gambar poster wajib diisi.' })
  imageUrl!: string;

  @IsOptional()
  @IsString()
  publicationId?: string;

  @IsOptional()
  @IsNumber()
  naturalW?: number;

  @IsOptional()
  @IsNumber()
  naturalH?: number;

  @IsOptional()
  @IsBoolean()
  forceReExtract?: boolean;
}

export class InpaintComponentBoundDto {
  @IsNumber()
  x!: number;

  @IsNumber()
  y!: number;

  @IsNumber()
  w!: number;

  @IsNumber()
  h!: number;

  @IsOptional()
  @IsString()
  cardBg?: string;

  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  text?: string;
}

export class InpaintPosterDto {
  @IsString()
  @IsNotEmpty({ message: 'URL gambar poster wajib diisi.' })
  imageUrl!: string;

  @IsOptional()
  @IsNumber()
  naturalW?: number;

  @IsOptional()
  @IsNumber()
  naturalH?: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => InpaintComponentBoundDto)
  componentBounds!: InpaintComponentBoundDto[];

  @IsOptional()
  @IsString()
  archetype?: string;

  @IsOptional()
  @IsString()
  publicationId?: string;
}

export class SavePosterLayersDto {
  @IsString()
  @IsNotEmpty({ message: 'Data gambar PNG hasil edit wajib disertakan.' })
  @MaxLength(15_000_000, { message: 'Ukuran payload imageDataUrl melebihi batas maksimum.' })
  imageDataUrl!: string;

  @IsString()
  @IsNotEmpty({ message: 'Data JSON layer editor wajib disertakan.' })
  @MaxLength(2_000_000, { message: 'Ukuran payload layersJson melebihi batas maksimum.' })
  layersJson!: string;
}

export class UploadMagicLayerAssetDto {
  @IsString()
  @IsNotEmpty({ message: 'Data gambar base64 wajib disertakan.' })
  @MaxLength(15_000_000, { message: 'Ukuran payload imageDataUrl melebihi batas maksimum.' })
  imageDataUrl!: string;

  @IsString()
  @IsOptional()
  @MaxLength(120)
  filename?: string;
}
