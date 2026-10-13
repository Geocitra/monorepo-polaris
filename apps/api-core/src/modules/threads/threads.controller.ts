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
import { ThreadsService } from './threads.service.js';
import {
  ThreadsCallbackQueryDto,
  ProgrammaticThreadsConnectDto,
  ThreadsAuthUrlResponseDto,
  ThreadsAccountDetailDto,
  PublishThreadsDto,
} from './dto/threads.dto.js';
import { Public } from '../../common/decorators/public.decorator.js';
import { CurrentTenant, AuthenticatedTenantPayload } from '../../common/decorators/current-tenant.decorator.js';
import { SubscriptionGuard } from '../../common/guards/subscription.guard.js';

@Controller('social/threads')
export class ThreadsController {
  private readonly logger = new Logger(ThreadsController.name);
  private readonly dashboardBaseUrl = process.env.DASHBOARD_URL || 'http://localhost:3000';

  constructor(private readonly threadsService: ThreadsService) {}

  @Get('auth-url')
  @UseGuards(SubscriptionGuard)
  @HttpCode(HttpStatus.OK)
  getAuthUrl(@CurrentTenant() user: AuthenticatedTenantPayload): ThreadsAuthUrlResponseDto {
    return this.threadsService.getAuthorizationUrl(user.tenantId);
  }

  @Public()
  @Get('callback')
  async handleOAuthCallback(
    @Query() query: ThreadsCallbackQueryDto,
    @Res() res: Response
  ): Promise<void> {
    const redirectTarget = `${this.dashboardBaseUrl}/branding`;

    // 1. Tangani jika dibatalkan oleh pengguna
    if (query.error || query.error_reason) {
      this.logger.warn(`[ThreadsOAuthCallback] Dibatalkan: ${query.error_description}`);
      return res.redirect(
        `${redirectTarget}?social_platform=threads&social_status=cancelled&reason=${encodeURIComponent(
          query.error_description || 'Dibatalkan'
        )}`
      );
    }

    // 2. Validasi parameter
    if (!query.code || !query.state) {
      return res.redirect(
        `${redirectTarget}?social_platform=threads&social_status=error&reason=parameter_kurang`
      );
    }

    try {
      const { account } = await this.threadsService.exchangeCodeAndSaveAccount(
        query.code,
        query.state
      );

      this.logger.log(`[ThreadsOAuthCallback] Akun Threads @${account.accountHandle} berhasil ditautkan.`);
      return res.redirect(
        `${redirectTarget}?social_platform=threads&social_status=connected&handle=${encodeURIComponent(
          account.accountHandle
        )}`
      );
    } catch (err: any) {
      this.logger.error(`[ThreadsOAuthCallback] Pertukaran token gagal: ${err.message}`);
      return res.redirect(
        `${redirectTarget}?social_platform=threads&social_status=error&reason=${encodeURIComponent(
          err.message
        )}`
      );
    }
  }

  @Post('connect')
  @UseGuards(SubscriptionGuard)
  @HttpCode(HttpStatus.OK)
  async programmaticConnect(
    @CurrentTenant() user: AuthenticatedTenantPayload,
    @Body() dto: ProgrammaticThreadsConnectDto
  ): Promise<ThreadsAccountDetailDto> {
    if (dto.accessToken) {
      return await this.threadsService.connectWithManualToken(user.tenantId, dto.accessToken);
    }

    if (dto.code && dto.state) {
      const { account } = await this.threadsService.exchangeCodeAndSaveAccount(dto.code, dto.state);
      return account;
    }

    throw new Error('Harap sertakan accessToken atau pasangan code & state untuk menghubungkan akun Threads.');
  }

  @Get('account')
  @HttpCode(HttpStatus.OK)
  async getConnectedAccount(
    @CurrentTenant() user: AuthenticatedTenantPayload
  ): Promise<ThreadsAccountDetailDto | null> {
    return await this.threadsService.getConnectedAccount(user.tenantId);
  }

  @Post('disconnect')
  @HttpCode(HttpStatus.OK)
  async disconnect(
    @CurrentTenant() user: AuthenticatedTenantPayload
  ): Promise<{ success: boolean; message: string }> {
    return await this.threadsService.disconnectAccount(user.tenantId);
  }

  @Post('refresh')
  @UseGuards(SubscriptionGuard)
  @HttpCode(HttpStatus.OK)
  async refresh(
    @CurrentTenant() user: AuthenticatedTenantPayload
  ): Promise<ThreadsAccountDetailDto> {
    return await this.threadsService.refreshLongLivedToken(user.tenantId);
  }

  @Post('publish')
  @UseGuards(SubscriptionGuard)
  @HttpCode(HttpStatus.ACCEPTED)
  async publishContent(
    @CurrentTenant() user: AuthenticatedTenantPayload,
    @Body() dto: PublishThreadsDto
  ) {
    return await this.threadsService.triggerPublishContent(user.tenantId, dto);
  }

  @Get('publish/status/:jobId')
  @UseGuards(SubscriptionGuard)
  async getPublishStatus(
    @CurrentTenant() user: AuthenticatedTenantPayload,
    @Param('jobId') jobId: string
  ) {
    return await this.threadsService.getPublishingJobStatus(user.tenantId, jobId);
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
