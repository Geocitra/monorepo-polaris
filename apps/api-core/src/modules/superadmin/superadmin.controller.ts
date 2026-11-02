import {
  Controller,
  Post,
  Get,
  Put,
  Patch,
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
  AdminCreateTenantDto,
  AdminUpdateLegislativeLevelDto,
  AdminResetTenantPasswordDto,
  AdminUpdatePricingMatrixDto,
  RejectDomainRequestDto,
  UpdatePlatformFeatureFlagDto,
} from './dto/superadmin.dto.js';
import { Public } from '../../common/decorators/public.decorator.js';
import { SuperadminGuard } from '../../common/guards/superadmin.guard.js';
import { LegislativeLevel } from '@polaris/shared-types';

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
    const adminId = req.user.operatorId || req.user.tenantId;
    return await this.superadminService.getProfile(adminId);
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
  @Post('tenants/create')
  @HttpCode(HttpStatus.CREATED)
  async createTenantWithCredentials(@Body() dto: AdminCreateTenantDto) {
    return await this.superadminService.createTenantWithCredentials(dto);
  }

  @UseGuards(SuperadminGuard)
  @Patch('tenants/:id/legislative-level')
  @HttpCode(HttpStatus.OK)
  async updateTenantLegislativeLevel(
    @Param('id') id: string,
    @Body() dto: AdminUpdateLegislativeLevelDto,
  ) {
    return await this.superadminService.updateTenantLegislativeLevel(id, dto);
  }

  @UseGuards(SuperadminGuard)
  @Patch('tenants/:id/reset-password')
  @HttpCode(HttpStatus.OK)
  async resetTenantPassword(
    @Param('id') id: string,
    @Body() dto: AdminResetTenantPasswordDto,
  ) {
    return await this.superadminService.resetTenantPassword(id, dto);
  }

  @UseGuards(SuperadminGuard)
  @Patch('tenants/:id/verify')
  @HttpCode(HttpStatus.OK)
  async verifyTenant(@Param('id') id: string, @Body() dto: VerifyTenantDto) {
    return await this.superadminService.verifyTenant(id, dto);
  }

  @UseGuards(SuperadminGuard)
  @Patch('tenants/:id/status')
  @HttpCode(HttpStatus.OK)
  async updateTenantStatus(
    @Param('id') id: string,
    @Body() dto: UpdateTenantStatusDto,
  ) {
    return await this.superadminService.updateTenantStatus(id, dto);
  }

  @UseGuards(SuperadminGuard)
  @Post('tenants/:id/license')
  @HttpCode(HttpStatus.OK)
  async grantManualLicense(
    @Param('id') id: string,
    @Body() dto: ManualLicenseGrantDto,
  ) {
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
  @Get('dapils')
  @HttpCode(HttpStatus.OK)
  async getDapils(@Query('search') search?: string) {
    return await this.superadminService.getDapils(search);
  }

  @UseGuards(SuperadminGuard)
  @Post('dapils')
  @HttpCode(HttpStatus.CREATED)
  async createDapil(@Body() dto: CreateDapilDto) {
    return await this.superadminService.createDapil(dto);
  }

  @UseGuards(SuperadminGuard)
  @Get('commissions')
  @HttpCode(HttpStatus.OK)
  async getCommissions(@Query('level') level?: LegislativeLevel) {
    return await this.superadminService.getCommissions(level);
  }

  @UseGuards(SuperadminGuard)
  @Get('pricing-matrices')
  @HttpCode(HttpStatus.OK)
  async getPricingMatrices(@Query('level') level?: LegislativeLevel) {
    return await this.superadminService.getPricingMatrices(level);
  }

  @UseGuards(SuperadminGuard)
  @Patch('pricing-matrices/:id')
  @HttpCode(HttpStatus.OK)
  async updatePricingMatrix(
    @Param('id') id: string,
    @Body() dto: AdminUpdatePricingMatrixDto,
  ) {
    return await this.superadminService.updatePricingMatrix(id, dto);
  }

  @UseGuards(SuperadminGuard)
  @Get('ai-monitoring/metrics')
  @HttpCode(HttpStatus.OK)
  async getObservabilityMetrics(@Query('days') days?: string) {
    return await this.superadminService.getObservabilityMetrics(days ? Number(days) : 7);
  }

  @UseGuards(SuperadminGuard)
  @Get('ai-monitoring/traces')
  @HttpCode(HttpStatus.OK)
  async getAiTraces(
    @Query('limit') limit?: string,
    @Query('operation') operation?: string,
    @Query('status') status?: string,
  ) {
    return await this.superadminService.getAiTraces(
      limit ? Number(limit) : 50,
      operation,
      status,
    );
  }

  @UseGuards(SuperadminGuard)
  @Get('ai-monitoring/token-pool')
  @HttpCode(HttpStatus.OK)
  async getTokenPool() {
    return await this.superadminService.getTokenPool();
  }

  @UseGuards(SuperadminGuard)
  @Post('ai-monitoring/token-pool/topup')
  @HttpCode(HttpStatus.OK)
  async topupTokenPool(@Body() dto: TopupTokenPoolDto) {
    return await this.superadminService.topupTokenPool(dto);
  }

  @UseGuards(SuperadminGuard)
  @Get('ai-monitoring/tenants-breakdown')
  @HttpCode(HttpStatus.OK)
  async getTenantQuotaBreakdown(@Query('month') month?: string) {
    return await this.superadminService.getTenantQuotaBreakdown(month);
  }

  @UseGuards(SuperadminGuard)
  @Get('ai-monitoring/topup-history')
  @HttpCode(HttpStatus.OK)
  async getHistoricalTopups() {
    return await this.superadminService.getHistoricalTopups();
  }

  @UseGuards(SuperadminGuard)
  @Get('audit-logs')
  @HttpCode(HttpStatus.OK)
  async getAuditLogs(
    @Query('tenantId') tenantId?: string,
    @Query('category') category?: string,
    @Query('activityType') activityType?: string,
    @Query('search') search?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return await this.superadminService.getAuditLogs({
      tenantId,
      category,
      activityType,
      search,
      startDate,
      endDate,
      page: page ? Number(page) : 1,
      limit: limit ? Number(limit) : 20,
    });
  }

  @UseGuards(SuperadminGuard)
  @Get('activity-summary')
  @HttpCode(HttpStatus.OK)
  async getMemberActivitySummary(
    @Query('search') search?: string,
    @Query('legislativeLevel') legislativeLevel?: string,
    @Query('commissionId') commissionId?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return await this.superadminService.getMemberActivitySummary({
      search,
      legislativeLevel,
      commissionId,
      page: page ? Number(page) : 1,
      limit: limit ? Number(limit) : 15,
    });
  }

  @UseGuards(SuperadminGuard)
  @Get('activity-summary/:id')
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

  // --- Domain: Pengelolaan Tiket Pengajuan Domain ---
  @UseGuards(SuperadminGuard)
  @Get('domain-requests')
  @HttpCode(HttpStatus.OK)
  async getDomainRequests(@Query('status') status?: string) {
    return await this.superadminService.getDomainRequests(status);
  }

  @UseGuards(SuperadminGuard)
  @Get('domain-requests/:id/dns-check')
  @HttpCode(HttpStatus.OK)
  async checkDnsForDomainRequest(@Param('id') id: string) {
    return await this.superadminService.checkDnsForDomainRequest(id);
  }

  @UseGuards(SuperadminGuard)
  @Patch('domain-requests/:id/approve')
  @HttpCode(HttpStatus.OK)
  async approveDomainRequest(@Param('id') id: string, @Request() req: any) {
    const adminUserId = req.user.tenantId;
    return await this.superadminService.approveDomainRequest(id, adminUserId);
  }

  @UseGuards(SuperadminGuard)
  @Patch('domain-requests/:id/reject')
  @HttpCode(HttpStatus.OK)
  async rejectDomainRequest(
    @Param('id') id: string,
    @Body() dto: RejectDomainRequestDto,
    @Request() req: any,
  ) {
    const adminUserId = req.user.tenantId;
    return await this.superadminService.rejectDomainRequest(id, dto.adminNotes, adminUserId);
  }

  // --- Domain: Pengaturan Platform & Feature Flags ---
  @UseGuards(SuperadminGuard)
  @Get('platform-settings/flags')
  @HttpCode(HttpStatus.OK)
  async getPlatformFeatureFlags() {
    return await this.superadminService.getPlatformFeatureFlags();
  }

  @UseGuards(SuperadminGuard)
  @Patch('platform-settings/flags/:flagKey')
  @HttpCode(HttpStatus.OK)
  async updatePlatformFeatureFlag(
    @Param('flagKey') flagKey: string,
    @Body() dto: UpdatePlatformFeatureFlagDto,
    @Request() req: any,
  ) {
    const adminUser = req.user?.email || req.user?.fullName || 'SUPERADMIN';
    return await this.superadminService.updatePlatformFeatureFlag(flagKey, dto.enabled, adminUser);
  }
}
