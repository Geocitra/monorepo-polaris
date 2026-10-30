import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Query,
  Param,
  Res,
  UseGuards,
  UsePipes,
  ValidationPipe,
  HttpCode,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import type { Response } from 'express';
import { XService } from './x.service.js';
import {
  XCallbackQueryDto,
  XAuthUrlResponseDto,
  XAccountDetailDto,
  PublishXDto,
} from './dto/x.dto.js';
import { Public } from '../../common/decorators/public.decorator.js';
import { CurrentTenant, AuthenticatedTenantPayload } from '../../common/decorators/current-tenant.decorator.js';
import { SubscriptionGuard } from '../../common/guards/subscription.guard.js';

@Controller('social/x')
export class XController {
  private readonly logger = new Logger(XController.name);
  private readonly dashboardBaseUrl = process.env.DASHBOARD_URL || 'https://app.polarismedia.id';

  constructor(private readonly xService: XService) { }

  @Get('auth-url')
  @UseGuards(SubscriptionGuard)
  @HttpCode(HttpStatus.OK)
  async getAuthUrl(@CurrentTenant() user: AuthenticatedTenantPayload): Promise<XAuthUrlResponseDto> {
    return await this.xService.getAuthorizationUrl(user.tenantId);
  }

  @Public()
  @Get('callback')
  @UsePipes(new ValidationPipe({ whitelist: false, forbidNonWhitelisted: false }))
  async handleOAuthCallback(
    @Query() query: XCallbackQueryDto,
    @Res() res: Response
  ): Promise<void> {
    const redirectTarget = `${this.dashboardBaseUrl}/profile`;

    // 1. Tangani jika dibatalkan oleh pengguna
    if (query.error) {
      this.logger.warn(`[XOAuthCallback] Otorisasi X dibatalkan: ${query.error_description || query.error}`);
      return res.redirect(
        `${redirectTarget}?social_platform=x&social_status=cancelled&reason=${encodeURIComponent(
          query.error_description || 'Dibatalkan oleh pengguna'
        )}`
      );
    }

    // 2. Validasi kelengkapan parameter
    if (!query.code || !query.state) {
      return res.redirect(
        `${redirectTarget}?social_platform=x&social_status=error&reason=parameter_kurang`
      );
    }

    try {
      const { account } = await this.xService.exchangeCodeAndSaveAccount(
        query.code,
        query.state
      );

      this.logger.log(`[XOAuthCallback] Akun X ${account.accountHandle} berhasil ditautkan.`);
      return res.redirect(
        `${redirectTarget}?social_platform=x&social_status=connected&handle=${encodeURIComponent(
          account.accountHandle
        )}`
      );
    } catch (err: any) {
      this.logger.error(`[XOAuthCallback] Pertukaran token X gagal: ${err.message}`);
      return res.redirect(
        `${redirectTarget}?social_platform=x&social_status=error&reason=${encodeURIComponent(
          err.message
        )}`
      );
    }
  }

  @Get('account')
  @UseGuards(SubscriptionGuard)
  @HttpCode(HttpStatus.OK)
  async getConnectedAccount(
    @CurrentTenant() user: AuthenticatedTenantPayload
  ): Promise<XAccountDetailDto | null> {
    return await this.xService.getConnectedAccount(user.tenantId);
  }

  @Delete('disconnect')
  @UseGuards(SubscriptionGuard)
  @HttpCode(HttpStatus.OK)
  async disconnectAccount(
    @CurrentTenant() user: AuthenticatedTenantPayload
  ): Promise<{ success: boolean }> {
    return await this.xService.disconnectAccount(user.tenantId);
  }

  @Post('publish')
  @UseGuards(SubscriptionGuard)
  @HttpCode(HttpStatus.ACCEPTED)
  async publishPost(
    @CurrentTenant() user: AuthenticatedTenantPayload,
    @Body() dto: PublishXDto
  ): Promise<{ jobId: string }> {
    return await this.xService.enqueuePublishJob(user.tenantId, dto);
  }

  @Get('publish/status/:jobId')
  @UseGuards(SubscriptionGuard)
  @HttpCode(HttpStatus.OK)
  async getPublishStatus(
    @CurrentTenant() user: AuthenticatedTenantPayload,
    @Param('jobId') jobId: string
  ): Promise<{ success: boolean; data: any }> {
    return await this.xService.getPublishingJobStatus(user.tenantId, jobId);
  }
}

