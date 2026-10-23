import {
  Controller,
  Post,
  Get,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  Body,
  HttpCode,
  HttpStatus,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { AuthGuard } from '../../common/guards/auth.guard.js';
import { CurrentTenant, AuthenticatedTenantPayload } from '../../common/decorators/current-tenant.decorator.js';
import { DatahubService } from './datahub.service.js';
import { DatahubUploadDto } from './dto/datahub-upload.dto.js';

@Controller('datahub')
@UseGuards(AuthGuard)
export class DatahubController {
  constructor(private readonly datahubService: DatahubService) {}

  /**
   * Endpoint Dropzone Blind Ingestion.
   * Menerima berkas dokumen/gambar, menghitung hash SHA-256,
   * melakukan deduplikasi, ekstraksi multimodal, chunking semantik, dan pgvector embedding.
   */
  @Post('upload')
  @HttpCode(HttpStatus.OK)
  @UseInterceptors(
    FileInterceptor('file', {
      limits: {
        fileSize: 25 * 1024 * 1024, // Maksimal 25MB per berkas
      },
      fileFilter: (req, file, cb) => {
        // Validasi ekstensi dan MIME type dokumen & gambar
        const allowedMimes = [
          'application/pdf',
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          'application/msword',
          'text/plain',
          'text/markdown',
          'text/csv',
          'image/png',
          'image/jpeg',
          'image/webp',
        ];
        if (
          allowedMimes.includes(file.mimetype) ||
          file.originalname.match(/\.(pdf|docx|doc|txt|md|csv|png|jpg|jpeg|webp)$/i)
        ) {
          cb(null, true);
        } else {
          cb(
            new BadRequestException(
              'Format berkas tidak didukung. Harap unggah PDF, DOCX, TXT, Markdown, atau Gambar (PNG/JPG).'
            ),
            false
          );
        }
      },
    })
  )
  async uploadDocument(
    @CurrentTenant() user: AuthenticatedTenantPayload,
    @UploadedFile() file: Express.Multer.File,
    @Body() dto: DatahubUploadDto
  ) {
    if (!file) {
      throw new BadRequestException('Berkas tidak ditemukan dalam permintaan unggah.');
    }

    return await this.datahubService.processUpload(user.tenantId, file, dto);
  }

  /**
   * Mengambil metrik agregat Knowledge Base milik tenant (jumlah dokumen & token terindeks).
   * Tetap menjaga privasi tanpa menampilkan daftar isi arsip.
   */
  @Get('metrics')
  async getMetrics(@CurrentTenant() user: AuthenticatedTenantPayload) {
    return await this.datahubService.getTenantKnowledgeMetrics(user.tenantId);
  }
}
