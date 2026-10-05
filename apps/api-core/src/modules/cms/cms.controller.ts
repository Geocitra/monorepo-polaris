import {
  Controller,
  Get,
  Put,
  Post,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
  UseGuards,
  NotFoundException,
} from '@nestjs/common';
import { CmsService } from './cms.service.js';
import { UpdateThemeSettingsDto, UpdateDomainConfigDto } from './dto/cms.dto.js';
import { Public } from '../../common/decorators/public.decorator.js';
import { CurrentTenant, AuthenticatedTenantPayload } from '../../common/decorators/current-tenant.decorator.js';
import { SubscriptionGuard } from '../../common/guards/subscription.guard.js';

@Controller('cms')
export class CmsController {
  constructor(private readonly cmsService: CmsService) {}

  /**
   * Endpoint verifikasi On-Demand TLS untuk Caddy Server.
   * Mengembalikan HTTP 200 jika domain sah, atau HTTP 404 jika ditolak.
   */
  @Public()
  @Get('domain/check')
  @HttpCode(HttpStatus.OK)
  async checkDomainForCaddy(@Query('domain') domain: string) {
    const isAllowed = await this.cmsService.checkCustomDomainAllowed(domain);
    if (!isAllowed) {
      throw new NotFoundException(`Domain '${domain}' tidak diizinkan untuk penerbitan sertifikat SSL.`);
    }
    return { status: 'ALLOWED', domain };
  }

  @Get('my-portal')
  @HttpCode(HttpStatus.OK)
  async getMyPortal(@CurrentTenant() user: AuthenticatedTenantPayload) {
    return await this.cmsService.getMyPortalConfig(user.tenantId);
  }

  @UseGuards(SubscriptionGuard)
  @Put('theme')
  @HttpCode(HttpStatus.OK)
  async updateTheme(
    @CurrentTenant() user: AuthenticatedTenantPayload,
    @Body() dto: UpdateThemeSettingsDto
  ) {
    return await this.cmsService.updateThemeSettings(user.tenantId, dto);
  }

  @Put('domain')
  @HttpCode(HttpStatus.OK)
  async updateDomain(
    @CurrentTenant() user: AuthenticatedTenantPayload,
    @Body() dto: UpdateDomainConfigDto
  ) {
    return await this.cmsService.updateDomainConfig(user.tenantId, dto);
  }

  @UseGuards(SubscriptionGuard)
  @Post('domain/verify')
  @HttpCode(HttpStatus.OK)
  async verifyCustomDomain(@CurrentTenant() user: AuthenticatedTenantPayload) {
    return await this.cmsService.verifyCustomDomainDns(user.tenantId);
  }

  @Public()
  @Get('public/:slug')
  @HttpCode(HttpStatus.OK)
  async getPublicPortal(@Param('slug') slug: string) {
    return await this.cmsService.getPublicPortalBySlug(slug);
  }

  @Public()
  @Get('public/:slug/article/:articleSlug')
  @HttpCode(HttpStatus.OK)
  async getPublicArticle(
    @Param('slug') slug: string,
    @Param('articleSlug') articleSlug: string
  ) {
    return await this.cmsService.getPublicArticleBySlug(slug, articleSlug);
  }
}
