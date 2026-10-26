import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  Param,
  Res,
  UseGuards,
  HttpCode,
  HttpStatus,
  NotFoundException,
  Logger,
} from '@nestjs/common';
import * as fs from 'node:fs';
import * as path from 'node:path';
import type { Response } from 'express';
import { InstagramService } from './instagram.service.js';
import {
  InstagramCallbackQueryDto,
  ProgrammaticExchangeDto,
  InstagramAuthUrlResponseDto,
  InstagramAccountDetailDto,
  PublishInstagramDto,
} from './dto/instagram.dto.js';
import { Public } from '../../common/decorators/public.decorator.js';
import { CurrentTenant, AuthenticatedTenantPayload } from '../../common/decorators/current-tenant.decorator.js';
import { SubscriptionGuard } from '../../common/guards/subscription.guard.js';

@Controller('social/instagram')
export class InstagramController {
  private readonly logger = new Logger(InstagramController.name);
  private readonly dashboardBaseUrl = process.env.DASHBOARD_URL || 'http://localhost:3000';

  constructor(private readonly instagramService: InstagramService) {}

  @Get('auth-url')
  @UseGuards(SubscriptionGuard)
  @HttpCode(HttpStatus.OK)
  getAuthUrl(@CurrentTenant() user: AuthenticatedTenantPayload): InstagramAuthUrlResponseDto {
    return this.instagramService.getAuthorizationUrl(user.tenantId);
  }

  @Public()
  @Get('callback')
  async handleOAuthCallback(
    @Query() query: InstagramCallbackQueryDto,
    @Res() res: Response
  ): Promise<void> {
    const redirectTarget = `${this.dashboardBaseUrl}/profile`;

    // 1. Tangani jika dewan membatalkan persetujuan di layar Meta
    if (query.error || query.error_reason) {
      this.logger.warn(`[InstagramOAuthCallback] Dibatalkan oleh pengguna: ${query.error_description}`);
      return res.redirect(
        `${redirectTarget}?social_status=cancelled&reason=${encodeURIComponent(query.error_description || 'Dibatalkan')}`
      );
    }

    // 2. Validasi kelengkapan parameter
    if (!query.code || !query.state) {
      return res.redirect(`${redirectTarget}?social_status=error&reason=parameter_kurang`);
    }

    try {
      const { account } = await this.instagramService.exchangeCodeAndSaveAccount(
        query.code,
        query.state
      );

      this.logger.log(`[InstagramOAuthCallback] Akun @${account.accountHandle} berhasil ditautkan.`);
      return res.redirect(
        `${redirectTarget}?social_status=connected&handle=${encodeURIComponent(account.accountHandle)}`
      );
    } catch (err: any) {
      this.logger.error(`[InstagramOAuthCallback] Pertukaran token gagal: ${err.message}`);
      return res.redirect(
        `${redirectTarget}?social_status=error&reason=${encodeURIComponent(err.message)}`
      );
    }
  }

  @Post('exchange')
  @UseGuards(SubscriptionGuard)
  @HttpCode(HttpStatus.OK)
  async programmaticExchange(
    @Body() dto: ProgrammaticExchangeDto
  ): Promise<InstagramAccountDetailDto> {
    const { account } = await this.instagramService.exchangeCodeAndSaveAccount(
      dto.code,
      dto.state
    );
    return account;
  }

  @Get('account')
  @HttpCode(HttpStatus.OK)
  async getConnectedAccount(
    @CurrentTenant() user: AuthenticatedTenantPayload
  ): Promise<InstagramAccountDetailDto | null> {
    return await this.instagramService.getConnectedAccount(user.tenantId);
  }

  @Post('disconnect')
  @HttpCode(HttpStatus.OK)
  async disconnect(
    @CurrentTenant() user: AuthenticatedTenantPayload
  ): Promise<{ success: boolean; message: string }> {
    return await this.instagramService.disconnectAccount(user.tenantId);
  }

  @Post('refresh')
  @UseGuards(SubscriptionGuard)
  @HttpCode(HttpStatus.OK)
  async refresh(
    @CurrentTenant() user: AuthenticatedTenantPayload
  ): Promise<InstagramAccountDetailDto> {
    return await this.instagramService.refreshLongLivedToken(user.tenantId);
  }

  @Post('publish')
  @UseGuards(SubscriptionGuard)
  @HttpCode(HttpStatus.ACCEPTED)
  async publishContent(
    @CurrentTenant() user: AuthenticatedTenantPayload,
    @Body() dto: PublishInstagramDto
  ) {
    return await this.instagramService.triggerPublishContent(user.tenantId, dto);
  }

  @Get('publish/status/:jobId')
  @UseGuards(SubscriptionGuard)
  async getPublishStatus(
    @CurrentTenant() user: AuthenticatedTenantPayload,
    @Param('jobId') jobId: string
  ) {
    return await this.instagramService.getPublishingJobStatus(user.tenantId, jobId);
  }

  @Public()
  @Get('media/:filename')
  serveMedia(@Param('filename') filename: string, @Res() res: Response) {
    const safeFilename = path.basename(filename);
    const searchDirs = [
      path.resolve(process.cwd(), 'uploads/social'),
      path.resolve(process.cwd(), '../../uploads/social'),
      '/home/pc/projects/polaris-platform/uploads/social',
    ];

    let foundPath: string | null = null;
    for (const dir of searchDirs) {
      const p = path.join(dir, safeFilename);
      if (fs.existsSync(p)) {
        foundPath = p;
        break;
      }
    }

    if (!foundPath) {
      throw new NotFoundException('Media tidak ditemukan');
    }

    res.setHeader('Content-Type', 'image/jpeg');
    res.setHeader('Cache-Control', 'public, max-age=86400');
    fs.createReadStream(foundPath).pipe(res);
  }
}
