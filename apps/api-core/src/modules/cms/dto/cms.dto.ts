import {
  IsString,
  IsNotEmpty,
  IsOptional,
  Matches,
  IsArray,
  ValidateNested,
  IsEnum,
  IsUrl,
  MaxLength
} from 'class-validator';
import { Type } from 'class-transformer';
import { SocialPlatform } from '@polaris/shared-types';

export class SocialLinkItemDto {
  @IsEnum(SocialPlatform, { message: 'Platform media sosial tidak valid.' })
  @IsNotEmpty()
  platform!: SocialPlatform;

  @IsUrl({}, { message: 'URL profil media sosial harus berupa tautan valid.' })
  @IsNotEmpty()
  profileUrl!: string;
}

export class UpdateThemeSettingsDto {
  @IsString()
  @Matches(/^#[0-9A-F]{6}$/i, { message: 'Warna primer harus berupa kode HEX valid (contoh: #1890FF).' })
  primaryHexColor!: string;

  @IsString()
  @Matches(/^#[0-9A-F]{6}$/i, { message: 'Warna sekunder harus berupa kode HEX valid (contoh: #001529).' })
  secondaryHexColor!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  fontFamily: string = 'Inter, sans-serif';

  @IsOptional()
  @IsUrl({}, { message: 'Hero banner harus berupa URL valid.' })
  heroBannerUrl?: string;

  @IsOptional()
  @IsUrl({}, { message: 'Foto resmi harus berupa URL valid.' })
  officialPhotoUrl?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  headlineTagline?: string;

  @IsOptional()
  @IsString()
  bioBiography?: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SocialLinkItemDto)
  socialLinks?: SocialLinkItemDto[];
}

export class UpdateDomainConfigDto {
  @IsOptional()
  @IsString()
  @Matches(/^[a-z0-9]+(-[a-z0-9]+)*$/, {
    message: 'Subdomain hanya boleh berisi huruf kecil, angka, dan strip (contoh: ahmad-fauzi).',
  })
  subdomainSlug?: string;

  @IsOptional()
  @IsString()
  @MaxLength(253)
  @Matches(/^(?=.{1,253}$)(?:[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?$/, {
    message: 'Format custom domain harus FQDN tanpa skema, port, path, atau alamat IP.',
  })
  customDomain?: string;

  @IsOptional()
  @IsString()
  @MaxLength(150)
  metaTitle?: string;

  @IsOptional()
  @IsString()
  metaDescription?: string;
}
