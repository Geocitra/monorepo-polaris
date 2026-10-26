import { Injectable, Logger } from '@nestjs/common';
import { PromptRefinerService } from '@polaris/ai-engine';
import { GenerateArticleRequestDto, UpdateDraftArticleDto, UploadArticleImageDto } from './dto/studio.dto.js';
import {
  StudioRadarService,
  StudioGeneratorService,
  StudioArticleService,
  StudioResearchService,
} from './services/index.js';

/**
 * StudioService (Facade Coordinator)
 *
 * Menerapkan pola Facade untuk mendelegasikan domain Studio ke sub-services:
 * - StudioRadarService (Radar Intelijen Daerah & Morning Briefing)
 * - StudioGeneratorService (Antrean BullMQ & Generasi Asinkron)
 * - StudioArticleService (Siklus Hidup Naskah, Publikasi Portal, Upload Foto)
 * - StudioResearchService (Audit Trail Riset, Sitasi, Sumber Terverifikasi)
 */
@Injectable()
export class StudioService {
  private readonly logger = new Logger(StudioService.name);

  constructor(
    private readonly radarService: StudioRadarService,
    private readonly generatorService: StudioGeneratorService,
    private readonly articleService: StudioArticleService,
    private readonly researchService: StudioResearchService,
  ) {}

  // --- Domain: Radar & Morning Briefing ---
  async getMorningBriefing(tenantId: string) {
    return await this.radarService.getMorningBriefing(tenantId);
  }

  async getTrendingDapilTopics(tenantId: string) {
    return await this.radarService.getTrendingDapilTopics(tenantId);
  }

  async generateNewContentPackage(
    tenantId: string,
    dto: GenerateArticleRequestDto,
    caller?: { isOperator?: boolean; operatorId?: string }
  ) {
    return await this.generatorService.generateNewContentPackage(tenantId, dto, caller);
  }

  async getJobStatus(jobId: string, tenantId: string) {
    return await this.generatorService.getJobStatus(jobId, tenantId);
  }

  async regenerateArticlePoster(tenantId: string, articleId: string) {
    return await this.generatorService.regenerateArticlePoster(tenantId, articleId);
  }

  // --- Domain: Manajemen Artikel & Siklus Publikasi ---
  async listArticles(tenantId: string) {
    return await this.articleService.listArticles(tenantId);
  }

  async getArticleDetail(tenantId: string, articleId: string) {
    return await this.articleService.getArticleDetail(tenantId, articleId);
  }

  async updateDraftArticle(tenantId: string, articleId: string, dto: UpdateDraftArticleDto) {
    return await this.articleService.updateDraftArticle(tenantId, articleId, dto);
  }

  async publishArticle(
    tenantId: string,
    articleId: string,
    caller?: { isOperator?: boolean; canDirectPublish?: boolean }
  ) {
    return await this.articleService.publishArticle(tenantId, articleId, caller);
  }

  async unpublishArticle(tenantId: string, articleId: string) {
    return await this.articleService.unpublishArticle(tenantId, articleId);
  }

  async deleteArticle(tenantId: string, articleId: string) {
    return await this.articleService.deleteArticle(tenantId, articleId);
  }

  async uploadArticleImage(tenantId: string, dto: UploadArticleImageDto) {
    return await this.articleService.uploadArticleImage(tenantId, dto);
  }

  // --- Domain: Jejak Audit Riset & Grounding Evidence ---
  async getArticleResearchAuditTrail(tenantId: string, articleId: string) {
    return await this.researchService.getArticleResearchAuditTrail(tenantId, articleId);
  }

  async addManualResearchSource(
    tenantId: string,
    articleId: string,
    dto: { url: string; title: string; publisherName: string; notes?: string }
  ) {
    return await this.researchService.addManualResearchSource(tenantId, articleId, dto);
  }

  async deleteResearchSource(tenantId: string, articleId: string, sourceId: string) {
    return await this.researchService.deleteResearchSource(tenantId, articleId, sourceId);
  }

  // --- Domain: Parafrase & Penyempurnaan Prompt Cerdas (Ultra-Hemat) ---
  async refinePrompt(
    tenantId: string,
    dto: {
      prompt: string;
      style?: 'poster' | 'infographic' | 'article_agenda';
      dapilName?: string;
      memberName?: string;
      partyAffiliation?: string;
      commissionName?: string;
    }
  ) {
    return await PromptRefinerService.refinePrompt({
      rawPrompt: dto.prompt,
      style: dto.style,
      dapilName: dto.dapilName,
      memberName: dto.memberName,
      partyAffiliation: dto.partyAffiliation,
      commissionName: dto.commissionName,
    });
  }
}
