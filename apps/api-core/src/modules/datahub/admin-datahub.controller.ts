import {
  Controller,
  Get,
  Patch,
  Delete,
  Param,
  Body,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { SuperadminGuard } from '../../common/guards/superadmin.guard.js';
import { DatahubService } from './datahub.service.js';

@Controller('admin/datahub')
@UseGuards(SuperadminGuard)
export class AdminDatahubController {
  constructor(private readonly datahubService: DatahubService) {}

  /**
   * Mengambil metrik global repositori dokumen untuk Superadmin
   */
  @Get('stats')
  async getStats() {
    return await this.datahubService.getAdminStats();
  }

  /**
   * Mengambil daftar master dokumen dan relasi dewan pengunggah
   */
  @Get('documents')
  async getDocuments(
    @Query('search') search?: string,
    @Query('partyAffiliation') partyAffiliation?: string,
    @Query('categoryTag') categoryTag?: string,
    @Query('privacyScope') privacyScope?: string
  ) {
    return await this.datahubService.getAdminDocuments({
      search,
      partyAffiliation,
      categoryTag,
      privacyScope,
    });
  }

  /**
   * Memperbarui klasifikasi 5 lapis dokumen atau hak akses AI
   */
  @Patch('references/:refId')
  async updateClassification(
    @Param('refId') refId: string,
    @Body()
    dto: {
      customTitle?: string;
      categoryTag?: string;
      privacyScope?: string;
      partyAffiliation?: string;
      dapilCode?: string;
      branchType?: string;
      legislativeLevel?: any;
    }
  ) {
    return await this.datahubService.updateReferenceClassification(refId, dto);
  }

  /**
   * Menghapus berkas master dan seluruh vektor pgvector dari sistem
   */
  @Delete('files/:fileId')
  @HttpCode(HttpStatus.OK)
  async deleteFile(@Param('fileId') fileId: string) {
    return await this.datahubService.deleteMasterFile(fileId);
  }
}
