import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Query,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  Req,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { AuthGuard } from '../../common/guards/auth.guard.js';
import { DatahubService } from './datahub.service.js';
import { DatahubCategory, DatahubPrivacyScope } from '@polaris/shared-types';
import type { Request } from 'express';

interface AuthenticatedRequest extends Request {
  user: {
    tenantId: string;
    operatorId?: string;
    email: string;
    role: string;
    isSuperadmin?: boolean;
    isOperator?: boolean;
  };
}

@Controller('operator/datahub')
@UseGuards(AuthGuard)
export class OperatorDatahubController {
  constructor(private readonly datahubService: DatahubService) {}

  /**
   * Mengambil metrik statistik dokumen untuk tokoh dewan binaan operator
   */
  @Get('stats')
  async getStats(@Req() req: AuthenticatedRequest) {
    if (!req.user.isOperator && !req.user.isSuperadmin) {
      throw new ForbiddenException('Akses ini dikhususkan bagi staf operator Polaris.');
    }
    const operatorId = req.user.operatorId || req.user.tenantId;
    return await this.datahubService.getOperatorStats(operatorId, req.user.isSuperadmin);
  }

  /**
   * Mengambil daftar dokumen binaan yang dikelola oleh operator
   */
  @Get('documents')
  async getDocuments(
    @Req() req: AuthenticatedRequest,
    @Query('tenantId') tenantId?: string,
    @Query('search') search?: string,
    @Query('categoryTag') categoryTag?: string,
    @Query('privacyScope') privacyScope?: string
  ) {
    if (!req.user.isOperator && !req.user.isSuperadmin) {
      throw new ForbiddenException('Akses ini dikhususkan bagi staf operator Polaris.');
    }
    const operatorId = req.user.operatorId || req.user.tenantId;
    return await this.datahubService.getOperatorDocuments(
      operatorId,
      { tenantId, search, categoryTag, privacyScope },
      req.user.isSuperadmin
    );
  }

  /**
   * Mengunggah dokumen baru atas nama salah satu anggota dewan binaan
   */
  @Post('upload')
  @UseInterceptors(
    FileInterceptor('file', {
      limits: {
        fileSize: 25 * 1024 * 1024, // 25MB
      },
      fileFilter: (req, file, cb) => {
        if (
          file.originalname.match(
            /\.(pdf|docx|doc|xlsx|xls|csv|tsv|txt|md|png|jpg|jpeg|webp)$/i
          )
        ) {
          cb(null, true);
        } else {
          cb(
            new BadRequestException(
              'Format berkas tidak didukung. Harap unggah PDF, DOCX, XLSX, CSV, TXT, atau Scan Gambar (PNG/JPG).'
            ),
            false
          );
        }
      },
    })
  )
  async uploadDocument(
    @UploadedFile() file: Express.Multer.File,
    @Body()
    dto: {
      tenantId: string;
      customTitle?: string;
      categoryTag?: DatahubCategory;
      privacyScope?: DatahubPrivacyScope;
    },
    @Req() req: AuthenticatedRequest
  ) {
    if (!req.user.isOperator && !req.user.isSuperadmin) {
      throw new ForbiddenException('Akses ini dikhususkan bagi staf operator Polaris.');
    }
    if (!file) {
      throw new BadRequestException('Berkas lampiran dokumen wajib diunggah.');
    }
    const operatorId = req.user.operatorId || req.user.tenantId;
    return await this.datahubService.operatorUploadDocument(
      operatorId,
      file,
      dto,
      req.user.isSuperadmin
    );
  }

  /**
   * Operator: Memperbarui klasifikasi kategori, judul, atau hak akses dokumen binaan
   */
  @Patch('references/:refId')
  async updateClassification(
    @Param('refId') refId: string,
    @Body()
    dto: {
      customTitle?: string;
      categoryTag?: DatahubCategory;
      privacyScope?: DatahubPrivacyScope;
    },
    @Req() req: AuthenticatedRequest
  ) {
    if (!req.user.isOperator && !req.user.isSuperadmin) {
      throw new ForbiddenException('Akses ini dikhususkan bagi staf operator Polaris.');
    }
    const operatorId = req.user.operatorId || req.user.tenantId;
    return await this.datahubService.operatorUpdateReference(
      operatorId,
      refId,
      dto,
      req.user.isSuperadmin
    );
  }

  /**
   * Operator: Mencabut kaitan dokumen dari dewan binaan (Detach/Unlink aman)
   */
  @Delete('references/:refId')
  async detachReference(
    @Param('refId') refId: string,
    @Req() req: AuthenticatedRequest
  ) {
    if (!req.user.isOperator && !req.user.isSuperadmin) {
      throw new ForbiddenException('Akses ini dikhususkan bagi staf operator Polaris.');
    }
    const operatorId = req.user.operatorId || req.user.tenantId;
    return await this.datahubService.operatorDetachReference(
      operatorId,
      refId,
      req.user.isSuperadmin
    );
  }
}
