import {
  Controller,
  Post,
  Get,
  Put,
  Body,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
  Request,
} from '@nestjs/common';
import { SuperadminService } from './superadmin.service.js';
import {
  SuperadminLoginDto,
  SuperadminSendOtpDto,
  SuperadminVerifyOtpDto,
  UpdateTenantStatusDto,
  VerifyTenantDto,
  ManualLicenseGrantDto,
  CreatePartyDto,
  UpdatePartyDto,
  CreateDapilDto,
  TopupTokenPoolDto,
} from './dto/superadmin.dto.js';
import { Public } from '../../common/decorators/public.decorator.js';
import { SuperadminGuard } from '../../common/guards/superadmin.guard.js';

@Controller('admin')
export class SuperadminController {
  constructor(private readonly superadminService: SuperadminService) {}

  @Public()
  @Post('auth/login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() dto: SuperadminLoginDto) {
    return await this.superadminService.login(dto);
  }

  @Public()
  @Post('auth/otp/send')
  @HttpCode(HttpStatus.OK)
  async sendOtp(@Body() dto: SuperadminSendOtpDto) {
    return await this.superadminService.sendOtp(dto);
  }

  @Public()
  @Post('auth/otp/verify')
  @HttpCode(HttpStatus.OK)
  async verifyOtp(@Body() dto: SuperadminVerifyOtpDto) {
    return await this.superadminService.verifyOtp(dto);
  }

  @UseGuards(SuperadminGuard)
  @Get('auth/me')
  @HttpCode(HttpStatus.OK)
  async getProfile(@Request() req: any) {
    return await this.superadminService.getProfile(req.user.tenantId);
  }

  @UseGuards(SuperadminGuard)
  @Get('dashboard/stats')
  @HttpCode(HttpStatus.OK)
  async getDashboardStats() {
    return await this.superadminService.getDashboardStats();
  }

  @UseGuards(SuperadminGuard)
  @Get('tenants')
  @HttpCode(HttpStatus.OK)
  async getTenants(@Query('search') search?: string, @Query('party') party?: string) {
    return await this.superadminService.getTenants(search, party);
  }

  @UseGuards(SuperadminGuard)
  @Post('tenants/:id/verify')
  @HttpCode(HttpStatus.OK)
  async verifyTenant(@Param('id') id: string, @Body() dto: VerifyTenantDto) {
    return await this.superadminService.verifyTenant(id, dto);
  }

  @UseGuards(SuperadminGuard)
  @Post('tenants/:id/status')
  @HttpCode(HttpStatus.OK)
  async updateTenantStatus(@Param('id') id: string, @Body() dto: UpdateTenantStatusDto) {
    return await this.superadminService.updateTenantStatus(id, dto);
  }

  @UseGuards(SuperadminGuard)
  @Post('tenants/:id/license')
  @HttpCode(HttpStatus.OK)
  async grantManualLicense(@Param('id') id: string, @Body() dto: ManualLicenseGrantDto) {
    return await this.superadminService.grantManualLicense(id, dto);
  }

  @UseGuards(SuperadminGuard)
  @Get('parties')
  @HttpCode(HttpStatus.OK)
  async getParties() {
    return await this.superadminService.getParties();
  }

  @UseGuards(SuperadminGuard)
  @Post('parties')
  @HttpCode(HttpStatus.CREATED)
  async createParty(@Body() dto: CreatePartyDto) {
    return await this.superadminService.createParty(dto);
  }

  @UseGuards(SuperadminGuard)
  @Put('parties/:id')
  @HttpCode(HttpStatus.OK)
  async updateParty(@Param('id') id: string, @Body() dto: UpdatePartyDto) {
    return await this.superadminService.updateParty(id, dto);
  }

  @UseGuards(SuperadminGuard)
  @Get('dapil')
  @HttpCode(HttpStatus.OK)
  async getDapils() {
    return await this.superadminService.getDapils();
  }

  @UseGuards(SuperadminGuard)
  @Post('dapil')
  @HttpCode(HttpStatus.CREATED)
  async createDapil(@Body() dto: CreateDapilDto) {
    return await this.superadminService.createDapil(dto);
  }

  @UseGuards(SuperadminGuard)
  @Get('commissions')
  @HttpCode(HttpStatus.OK)
  async getCommissions(@Query('level') level?: string) {
    return await this.superadminService.getCommissions(level);
  }

  @UseGuards(SuperadminGuard)
  @Post('commissions')
  @HttpCode(HttpStatus.CREATED)
  async createCommission(@Body() dto: any) {
    return await this.superadminService.createCommission(dto);
  }

  @UseGuards(SuperadminGuard)
  @Put('commissions/:id')
  @HttpCode(HttpStatus.OK)
  async updateCommission(@Param('id') id: string, @Body() dto: any) {
    return await this.superadminService.updateCommission(id, dto);
  }

  @UseGuards(SuperadminGuard)
  @Get('ai/observability')
  @HttpCode(HttpStatus.OK)
  async getAiObservability() {
    return await this.superadminService.getAiObservability();
  }

  @UseGuards(SuperadminGuard)
  @Get('ai/traces')
  @HttpCode(HttpStatus.OK)
  async getAiTraces(@Query('limit') limit?: string) {
    return await this.superadminService.getAiTraces(Number(limit) || 20);
  }

  @UseGuards(SuperadminGuard)
  @Post('ai/topup')
  @HttpCode(HttpStatus.CREATED)
  async topupTokenPool(@Body() dto: TopupTokenPoolDto) {
    return await this.superadminService.topupMasterTokenPool(dto);
  }

  @UseGuards(SuperadminGuard)
  @Get('members/activity-summary')
  @HttpCode(HttpStatus.OK)
  async getMemberActivitySummary(
    @Query('search') search?: string,
    @Query('dapilId') dapilId?: string,
    @Query('party') party?: string,
    @Query('commissionId') commissionId?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return await this.superadminService.getMemberActivitySummary({
      search,
      dapilId,
      party,
      commissionId,
      page: page ? Number(page) : 1,
      limit: limit ? Number(limit) : 10,
    });
  }

  @UseGuards(SuperadminGuard)
  @Get('members/:id/activity-logs')
  @HttpCode(HttpStatus.OK)
  async getMemberActivityLogs(
    @Param('id') id: string,
    @Query('category') category?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return await this.superadminService.getMemberActivityLogs(id, {
      category,
      page: page ? Number(page) : 1,
      limit: limit ? Number(limit) : 15,
    });
  }
}
