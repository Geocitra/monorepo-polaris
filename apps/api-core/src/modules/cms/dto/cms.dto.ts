import {
  IsString,
  IsNotEmpty,
  IsOptional,
  Matches,
  IsArray,
  ValidateNested,
  IsEnum,
  IsUrl,
  MaxLength,
  ValidateIf,
  registerDecorator,
  ValidationOptions,
  ValidationArguments,
} from 'class-validator';
import { Type } from 'class-transformer';
import { SocialPlatform } from '@polaris/shared-types';

/**
 * Validator kustom untuk URL gambar: menerima URL http/https, data URI (data:image/...),
 * dan path relatif (/images/...). Nilai kosong atau null diperbolehkan jika opsional.
 */
export function IsImageUriOrUrl(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      name: 'isImageUriOrUrl',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(value: any, _args: ValidationArguments) {
          if (value === null || value === undefined || value === '') {
            return true;
          }
          if (typeof value !== 'string') return false;
          const trimmed = value.trim();
          if (trimmed === '') return true;

          // 1. Data URI (contoh: data:image/png;base64,... atau data:image/jpeg;base64,...)
          if (/^data:image\/[a-zA-Z0-9.+_-]+;base64,/i.test(trimmed)) {
            return true;
          }

          // 2. Path relatif (contoh: /images/... atau /assets/...)
          if (/^\/[a-zA-Z0-9_\-\.\/]+$/i.test(trimmed)) {
            return true;
          }

          // 3. Web URL absolut (http:// atau https://)
          try {
            const url = new URL(trimmed);
            return url.protocol === 'http:' || url.protocol === 'https:';
          } catch {
            return false;
          }
        },
      },
    });
  };
}

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
  @IsImageUriOrUrl({ message: 'Hero banner harus berupa URL valid.' })
  heroBannerUrl?: string;

  @IsOptional()
  @IsImageUriOrUrl({ message: 'Foto resmi harus berupa URL valid.' })
  officialPhotoUrl?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  headlineTagline?: string;

  @IsOptional()
  @IsString()
  bioBiography?: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  layoutTemplateId?: string;

  @IsOptional()
  layoutSchema?: any;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SocialLinkItemDto)
  socialLinks?: SocialLinkItemDto[];
}

export class CreatePortalDocumentRequestDto {
  @IsString()
  @IsNotEmpty({ message: 'Judul dokumen tidak boleh kosong.' })
  @MaxLength(255)
  title!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  docType: string = 'REPORT_TRIWULAN';

  @IsOptional()
  @IsString()
  description?: string;

  @IsString()
  @IsNotEmpty({ message: 'URL berkas PDF wajib diisi.' })
  @IsUrl({}, { message: 'URL berkas harus berupa tautan yang valid.' })
  fileUrl!: string;

  @IsOptional()
  fileSizeBytes?: number;
}

export class UpdateDomainConfigDto {
  @IsOptional()
  @IsString()
  @Matches(/^[a-z0-9]+(-[a-z0-9]+)*$/, {
    message: 'Subdomain hanya boleh berisi huruf kecil, angka, dan strip (contoh: ahmad-fauzi).',
  })
  subdomainSlug?: string;

  @IsOptional()
  @ValidateIf((o) => o.customDomain !== '' && o.customDomain !== null && o.customDomain !== undefined)
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
