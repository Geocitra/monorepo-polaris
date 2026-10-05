import { IsNotEmpty, IsString, Matches, IsEnum, IsOptional } from 'class-validator';
import { DiscrepancyResolutionStatus } from '@polaris/shared-types';

export class TriggerReconciliationDto {
  @IsString()
  @IsNotEmpty({ message: 'Tanggal rekonsiliasi wajib disertakan.' })
  @Matches(/^\d{4}-\d{2}-\d{2}$/, { message: 'Format tanggal harus YYYY-MM-DD (contoh: 2026-10-02).' })
  reconDate!: string;

  @IsOptional()
  @IsString()
  notes?: string;
}

export class UploadSettlementCsvDto {
  @IsString()
  @IsNotEmpty({ message: 'Konten CSV wajib disertakan.' })
  csvContent!: string;

  @IsString()
  @IsNotEmpty({ message: 'Tanggal rekonsiliasi wajib disertakan.' })
  @Matches(/^\d{4}-\d{2}-\d{2}$/, { message: 'Format tanggal harus YYYY-MM-DD.' })
  reconDate!: string;

  @IsOptional()
  @IsString()
  notes?: string;
}

export class ResolveDiscrepancyDto {
  @IsEnum(DiscrepancyResolutionStatus, {
    message: 'Status resolusi harus MANUALLY_RESOLVED atau IGNORED.',
  })
  @IsNotEmpty()
  resolutionStatus!: DiscrepancyResolutionStatus.MANUALLY_RESOLVED | DiscrepancyResolutionStatus.IGNORED;

  @IsString()
  @IsNotEmpty({ message: 'Catatan resolusi wajib diisi untuk transparansi audit.' })
  resolutionNotes!: string;
}
