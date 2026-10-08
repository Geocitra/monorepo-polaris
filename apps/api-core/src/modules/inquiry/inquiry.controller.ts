import {
  Controller,
  Post,
  Get,
  Patch,
  Body,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
  Request,
} from '@nestjs/common';
import { InquiryService } from './inquiry.service.js';
import {
  SubmitInquiryRequestDto,
  ScheduleMeetRequestDto,
  UpdateInquiryStatusRequestDto,
  ConvertInquiryLeadDto,
} from './dto/inquiry.dto.js';
import { Public } from '../../common/decorators/public.decorator.js';
import { SuperadminGuard } from '../../common/guards/superadmin.guard.js';
import { InquiryStatus, LegislativeLevel } from '@polaris/shared-types';

@Controller('inquiries')
export class InquiryController {
  constructor(private readonly inquiryService: InquiryService) {}

  /**
   * Endpoint Publik: Pengunjung mengisi form di landing page /pricing
   */
  @Public()
  @Post('submit')
  @HttpCode(HttpStatus.CREATED)
  async submit(@Body() dto: SubmitInquiryRequestDto) {
    return await this.inquiryService.submitInquiry(dto);
  }

  /**
   * Superadmin Console: Ambil seluruh daftar lead/inquiry
   */
  @UseGuards(SuperadminGuard)
  @Get()
  @HttpCode(HttpStatus.OK)
  async getAll(
    @Query('status') status?: InquiryStatus,
    @Query('level') level?: LegislativeLevel,
  ) {
    return await this.inquiryService.getAllInquiries(status, level);
  }

  /**
   * Superadmin Console: Ambil detail lead berdasarkan ID
   */
  @UseGuards(SuperadminGuard)
  @Get(':id')
  @HttpCode(HttpStatus.OK)
  async getById(@Param('id') id: string) {
    return await this.inquiryService.getInquiryById(id);
  }

  /**
   * Superadmin Console: Setel jadwal demo Google Meet
   */
  @UseGuards(SuperadminGuard)
  @Post(':id/schedule-meet')
  @HttpCode(HttpStatus.OK)
  async scheduleMeet(
    @Param('id') id: string,
    @Body() dto: ScheduleMeetRequestDto,
    @Request() req: any,
  ) {
    const adminId = req.user?.adminId || req.user?.sub;
    return await this.inquiryService.scheduleMeeting(id, dto, adminId);
  }

  /**
   * Superadmin Console: Perbarui status lead
   */
  @UseGuards(SuperadminGuard)
  @Patch(':id/status')
  @HttpCode(HttpStatus.OK)
  async updateStatus(
    @Param('id') id: string,
    @Body() dto: UpdateInquiryStatusRequestDto,
    @Request() req: any,
  ) {
    const adminId = req.user?.adminId || req.user?.sub;
    return await this.inquiryService.updateStatus(id, dto, adminId);
  }

  /**
   * Superadmin Console: Konversi lead inquiry menjadi akun dewan aktif
   */
  @UseGuards(SuperadminGuard)
  @Post(':id/convert-tenant')
  @HttpCode(HttpStatus.CREATED)
  async convertTenant(
    @Param('id') id: string,
    @Body() dto: ConvertInquiryLeadDto,
    @Request() req: any,
  ) {
    const adminId = req.user?.adminId || req.user?.sub;
    return await this.inquiryService.convertInquiryToTenant(id, dto, adminId);
  }
}
