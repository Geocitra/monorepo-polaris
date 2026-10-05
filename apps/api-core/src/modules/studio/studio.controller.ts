import {
  Controller,
  Post,
  Get,
  Put,
  Body,
  Param,
  HttpCode,
  HttpStatus,
  UseGuards
} from '@nestjs/common';
import { StudioService } from './studio.service.js';
import { GenerateArticleRequestDto, UpdateDraftArticleDto } from './dto/studio.dto.js';
import { CurrentTenant, AuthenticatedTenantPayload } from '../../common/decorators/current-tenant.decorator.js';
import { SubscriptionGuard } from '../../common/guards/subscription.guard.js';
import { TokenCircuitBreakerGuard } from '../../common/guards/token-circuit-breaker.guard.js';
import { SkipRlsContext } from '../../common/decorators/skip-rls-context.decorator.js';

@Controller('studio')
export class StudioController {
  constructor(private readonly studioService: StudioService) { }

  // Pengecualian: morning-briefing dapat dibaca anggota terdaftar tanpa error 403
  @Get('morning-briefing')
  @HttpCode(HttpStatus.OK)
  async getMorningBriefing(@CurrentTenant() user: AuthenticatedTenantPayload) {
    return await this.studioService.getMorningBriefing(user.tenantId);
  }

  // Generate konten AI WAJIB memiliki status langganan ACTIVE (Bebas Kuota Unlimited)
  @Post('generate')
  @SkipRlsContext()
  @UseGuards(SubscriptionGuard, TokenCircuitBreakerGuard)
  @HttpCode(HttpStatus.ACCEPTED) // HTTP 202 Accepted: Non-blocking asynchronous task
  async generateContent(
    @CurrentTenant() user: AuthenticatedTenantPayload,
    @Body() dto: GenerateArticleRequestDto
  ) {
    return await this.studioService.generateNewContentPackage(user.tenantId, dto);
  }

  @Get('jobs/:jobId')
  @HttpCode(HttpStatus.OK)
  async checkJobStatus(
    @CurrentTenant() user: AuthenticatedTenantPayload,
    @Param('jobId') jobId: string
  ) {
    return await this.studioService.getJobStatus(jobId, user.tenantId);
  }

  @Get('articles')
  @HttpCode(HttpStatus.OK)
  async listArticles(@CurrentTenant() user: AuthenticatedTenantPayload) {
    return await this.studioService.listArticles(user.tenantId);
  }

  @Get('articles/:id')
  @HttpCode(HttpStatus.OK)
  async getArticleDetail(
    @CurrentTenant() user: AuthenticatedTenantPayload,
    @Param('id') id: string
  ) {
    return await this.studioService.getArticleDetail(user.tenantId, id);
  }

  @Post('articles/:id/poster/regenerate')
  @SkipRlsContext()
  @UseGuards(SubscriptionGuard)
  @HttpCode(HttpStatus.ACCEPTED)
  async regeneratePoster(
    @CurrentTenant() user: AuthenticatedTenantPayload,
    @Param('id') id: string
  ) {
    return await this.studioService.regenerateArticlePoster(user.tenantId, id);
  }

  @Put('articles/:id')
  @UseGuards(SubscriptionGuard)
  @HttpCode(HttpStatus.OK)
  async updateDraft(
    @CurrentTenant() user: AuthenticatedTenantPayload,
    @Param('id') id: string,
    @Body() dto: UpdateDraftArticleDto
  ) {
    return await this.studioService.updateDraftArticle(user.tenantId, id, dto);
  }

  @Post('articles/:id/publish')
  @UseGuards(SubscriptionGuard)
  @HttpCode(HttpStatus.OK)
  async publishArticle(
    @CurrentTenant() user: AuthenticatedTenantPayload,
    @Param('id') id: string
  ) {
    return await this.studioService.publishArticle(user.tenantId, id);
  }

  @Post('articles/:id/unpublish')
  @UseGuards(SubscriptionGuard)
  @HttpCode(HttpStatus.OK)
  async unpublishArticle(
    @CurrentTenant() user: AuthenticatedTenantPayload,
    @Param('id') id: string
  ) {
    return await this.studioService.unpublishArticle(user.tenantId, id);
  }
}
