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
  HttpCode,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import type { Response } from 'express';
import { TikTokService } from './tiktok.service.js';
import {
  TikTokCallbackQueryDto,
  TikTokAuthUrlResponseDto,
  TikTokAccountDetailDto,
  PublishTikTokDto,
} from './dto/tiktok.dto.js';
import { Public } from '../../common/decorators/public.decorator.js';
import { CurrentTenant, AuthenticatedTenantPayload } from '../../common/decorators/current-tenant.decorator.js';
import { SubscriptionGuard } from '../../common/guards/subscription.guard.js';

@Controller('social/tiktok')
export class TikTokController {
  private readonly logger = new Logger(TikTokController.name);
  private readonly dashboardBaseUrl = process.env.DASHBOARD_URL || 'https://app.polarismedia.id';

  constructor(private readonly tiktokService: TikTokService) {}

  @Get('auth-url')
  @UseGuards(SubscriptionGuard)
  @HttpCode(HttpStatus.OK)
  async getAuthUrl(
    @CurrentTenant() user: AuthenticatedTenantPayload
  ): Promise<TikTokAuthUrlResponseDto> {
    return await this.tiktokService.getAuthorizationUrl(user.tenantId);
  }

  @Public()
  @Get('callback')
  async handleOAuthCallback(
    @Query() query: TikTokCallbackQueryDto,
    @Res() res: Response
  ): Promise<void> {
    const redirectTarget = `${this.dashboardBaseUrl}/profile`;

    // 1. Tangani jika dibatalkan oleh pengguna
    if (query.error) {
      this.logger.warn(
        `[TikTokOAuthCallback] Otorisasi TikTok dibatalkan: ${query.error_description || query.error}`
      );
      return res.redirect(
        `${redirectTarget}?social_platform=tiktok&social_status=cancelled&reason=${encodeURIComponent(
          query.error_description || 'Dibatalkan oleh pengguna'
        )}`
      );
    }

    // 2. Validasi kelengkapan parameter
    if (!query.code || !query.state) {
      return res.redirect(
        `${redirectTarget}?social_platform=tiktok&social_status=error&reason=parameter_kurang`
      );
    }

    try {
      const { account } = await this.tiktokService.exchangeCodeAndSaveAccount(
        query.code,
        query.state
      );

      this.logger.log(
        `[TikTokOAuthCallback] Akun TikTok ${account.accountHandle} berhasil ditautkan.`
      );
      return res.redirect(
        `${redirectTarget}?social_platform=tiktok&social_status=connected&handle=${encodeURIComponent(
          account.accountHandle
        )}`
      );
    } catch (err: any) {
      this.logger.error(`[TikTokOAuthCallback] Pertukaran token TikTok gagal: ${err.message}`);
      return res.redirect(
        `${redirectTarget}?social_platform=tiktok&social_status=error&reason=${encodeURIComponent(
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
  ): Promise<TikTokAccountDetailDto | null> {
    return await this.tiktokService.getConnectedAccount(user.tenantId);
  }

  @Delete('disconnect')
  @UseGuards(SubscriptionGuard)
  @HttpCode(HttpStatus.OK)
  async disconnectAccount(
    @CurrentTenant() user: AuthenticatedTenantPayload
  ): Promise<{ success: boolean }> {
    return await this.tiktokService.disconnectAccount(user.tenantId);
  }

  @Post('publish')
  @UseGuards(SubscriptionGuard)
  @HttpCode(HttpStatus.ACCEPTED)
  async publishPost(
    @CurrentTenant() user: AuthenticatedTenantPayload,
    @Body() dto: PublishTikTokDto
  ): Promise<{ jobId: string }> {
    return await this.tiktokService.enqueuePublishJob(user.tenantId, dto);
  }

  @Get('publish/status/:jobId')
  @UseGuards(SubscriptionGuard)
  @HttpCode(HttpStatus.OK)
  async getPublishStatus(
    @CurrentTenant() user: AuthenticatedTenantPayload,
    @Param('jobId') jobId: string
  ): Promise<{ success: boolean; data: any }> {
    return await this.tiktokService.getPublishingJobStatus(user.tenantId, jobId);
  }
}

