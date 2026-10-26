import {
  Injectable,
  Logger,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { eq, and, desc, inArray } from 'drizzle-orm';
import {
  db,
  contentPublications,
  mediaAssets,
  portalConfigs,
  portalThemeSettings,
  tenantMembers,
  subscriptions,
} from '@polaris/database';
import { ContentPublication, SubdomainSlug, CanonicalUrl } from '@polaris/core-domain';
import { ContentStatus, AssetType, SubscriptionStatus } from '@polaris/shared-types';
import { PromptRefinerService } from '@polaris/ai-engine';
import {
  GenerateArticleRequestDto,
  UpdateDraftArticleDto,
  UploadArticleImageDto,
  PublishInfographicDto,
} from './dto/studio.dto.js';
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
 * Serta mengelola siklus hidup publikasi visual infografis dewan.
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

  // --- Domain: Generasi Konten Asinkron BullMQ ---
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

  // --- Domain: Infografis Publikasi & Manajemen ---
  async publishInfographic(tenantId: string, dto: PublishInfographicDto) {
    const [sub] = await db
      .select({ status: subscriptions.status })
      .from(subscriptions)
      .where(eq(subscriptions.tenantId, tenantId))
      .limit(1);

    if (!sub || sub.status !== SubscriptionStatus.ACTIVE) {
      throw new ForbiddenException(
        'Publikasi ke portal resmi dibatasi: Akun Anda belum diaktivasi. Silakan selesaikan pembayaran lisensi di menu Billing.'
      );
    }

    let [portal] = await db
      .select({
        subdomainSlug: portalConfigs.subdomainSlug,
        customDomain: portalConfigs.customDomain,
        customDomainStatus: portalConfigs.customDomainStatus,
      })
      .from(portalConfigs)
      .where(eq(portalConfigs.tenantId, tenantId))
      .limit(1);

    let subdomainSlug = portal?.subdomainSlug;
    if (!subdomainSlug) {
      const [member] = await db
        .select({ fullName: tenantMembers.fullName })
        .from(tenantMembers)
        .where(eq(tenantMembers.id, tenantId))
        .limit(1);

      const rawSlug = (member?.fullName || 'wakil-rakyat')
        .toLowerCase()
        .replace(/[^a-z0-9]/g, '-')
        .replace(/-+/g, '-')
        .slice(0, 30);
      subdomainSlug = `${rawSlug}-${tenantId.slice(0, 4)}`;

      const [createdPortal] = await db
        .insert(portalConfigs)
        .values({
          tenantId,
          subdomainSlug,
          isActive: true,
          metaTitle: `Portal Resmi ${member?.fullName || 'Wakil Rakyat'}`,
          metaDescription: 'Portal transparansi kebijakan dan aspirasi konstituen.',
        })
        .onConflictDoNothing()
        .returning();

      if (createdPortal) {
        await db
          .insert(portalThemeSettings)
          .values({
            portalId: createdPortal.id,
            primaryHexColor: '#1890ff',
            secondaryHexColor: '#001529',
            fontFamily: 'Inter, sans-serif',
          })
          .onConflictDoNothing();
      }
    }

    // Check if existing publication is being published
    let existingPublication = null;
    if (dto.publicationId) {
      const [found] = await db
        .select()
        .from(contentPublications)
        .where(
          and(
            eq(contentPublications.id, dto.publicationId),
            eq(contentPublications.tenantId, tenantId)
          )
        )
        .limit(1);
      existingPublication = found;
    }

    if (existingPublication) {
      const bodyContentMarkdown =
        existingPublication.bodyContentMarkdown &&
        !existingPublication.bodyContentMarkdown.startsWith('# Sedang')
          ? existingPublication.bodyContentMarkdown
          : `# ${dto.title}\n\n![${dto.title}](${dto.imageUrl})\n\n${dto.caption || dto.prompt || 'Infografis visualisasi data capaian kebijakan dan akuntabilitas publik.'}\n\n*Dipublikasikan secara resmi melalui Studio Infografis POLARIS.*`;

      await db
        .update(contentPublications)
        .set({
          title: dto.title,
          status: ContentStatus.PUBLISHED,
          excerpt: (
            dto.caption ||
            dto.prompt ||
            existingPublication.excerpt ||
            'Infografis visualisasi data capaian kinerja dan akuntabilitas publik.'
          ).slice(0, 200),
          bodyContentMarkdown,
          publishedAt: existingPublication.publishedAt || new Date(),
          updatedAt: new Date(),
        })
        .where(eq(contentPublications.id, existingPublication.id));

      const [existingMedia] = await db
        .select()
        .from(mediaAssets)
        .where(eq(mediaAssets.publicationId, existingPublication.id))
        .limit(1);

      if (existingMedia) {
        await db
          .update(mediaAssets)
          .set({
            cdnPublicUrl: dto.imageUrl,
            r2StorageUrl: dto.imageUrl,
            promptUsed: dto.prompt || dto.caption || existingMedia.promptUsed,
          })
          .where(eq(mediaAssets.id, existingMedia.id));
      } else {
        await db.insert(mediaAssets).values({
          publicationId: existingPublication.id,
          assetType: AssetType.INFOGRAPHIC_PNG,
          r2StorageUrl: dto.imageUrl,
          cdnPublicUrl: dto.imageUrl,
          promptUsed: dto.prompt || dto.caption || null,
          mimeType: 'image/webp',
          fileSizeBytes: 0,
        });
      }

      return {
        success: true,
        message: 'Infografis resmi dipublikasikan ke Website Pribadi Dewan.',
        publicationId: existingPublication.id,
        slug: existingPublication.slug,
        canonicalUrl: existingPublication.canonicalUrl,
        publishedAt: existingPublication.publishedAt || new Date(),
      };
    }

    // New Publication
    const baseSlug = ContentPublication.generateSlug(dto.title.slice(0, 50));
    const finalSlug = `${baseSlug}-${randomUUID().slice(0, 8)}`;
    const canonicalUrlObj = new CanonicalUrl(new SubdomainSlug(subdomainSlug!), finalSlug);
    const canonicalUrl = canonicalUrlObj.getValue();

    const bodyContentMarkdown = `# ${dto.title}\n\n![${dto.title}](${dto.imageUrl})\n\n${dto.caption || dto.prompt || 'Infografis visualisasi data capaian kebijakan dan akuntabilitas publik.'}\n\n*Dipublikasikan secara resmi melalui Studio Infografis POLARIS.*`;
    const wordCount = bodyContentMarkdown.split(/\s+/).filter(Boolean).length;

    const [pub] = await db
      .insert(contentPublications)
      .values({
        tenantId,
        title: dto.title,
        slug: finalSlug,
        excerpt: (
          dto.caption ||
          dto.prompt ||
          'Infografis visualisasi data capaian kinerja dan akuntabilitas publik.'
        ).slice(0, 200),
        bodyContentMarkdown,
        wordCount,
        status: ContentStatus.PUBLISHED,
        canonicalUrl,
        publishedAt: new Date(),
      })
      .returning();

    await db.insert(mediaAssets).values({
      publicationId: pub.id,
      assetType: AssetType.INFOGRAPHIC_PNG,
      r2StorageUrl: dto.imageUrl,
      cdnPublicUrl: dto.imageUrl,
      promptUsed: dto.prompt || dto.caption || null,
      mimeType: 'image/webp',
      fileSizeBytes: 0,
    });

    return {
      success: true,
      message: 'Infografis resmi dipublikasikan ke Website Pribadi Dewan.',
      publicationId: pub.id,
      slug: pub.slug,
      canonicalUrl: pub.canonicalUrl,
      publishedAt: pub.publishedAt,
    };
  }

  async unpublishInfographic(tenantId: string, id: string) {
    const [pub] = await db
      .select()
      .from(contentPublications)
      .where(
        and(
          eq(contentPublications.id, id),
          eq(contentPublications.tenantId, tenantId)
        )
      )
      .limit(1);

    if (!pub) {
      throw new NotFoundException('Infografis tidak ditemukan.');
    }

    await db
      .update(contentPublications)
      .set({
        status: ContentStatus.UNPUBLISHED,
        updatedAt: new Date(),
      })
      .where(eq(contentPublications.id, pub.id));

    return { message: 'Infografis berhasil ditarik dari tayangan publik (Status: UNPUBLISHED).' };
  }

  async listInfographics(tenantId: string) {
    const items = await db
      .select({
        id: contentPublications.id,
        title: contentPublications.title,
        slug: contentPublications.slug,
        excerpt: contentPublications.excerpt,
        status: contentPublications.status,
        publishedAt: contentPublications.publishedAt,
        createdAt: contentPublications.createdAt,
      })
      .from(contentPublications)
      .where(eq(contentPublications.tenantId, tenantId))
      .orderBy(desc(contentPublications.createdAt));

    const pubIds = items.map((i) => i.id);
    const mediaMap = new Map<string, string>();
    if (pubIds.length > 0) {
      const medias = await db
        .select({
          publicationId: mediaAssets.publicationId,
          cdnPublicUrl: mediaAssets.cdnPublicUrl,
        })
        .from(mediaAssets)
        .where(
          and(
            inArray(mediaAssets.publicationId, pubIds),
            inArray(mediaAssets.assetType, [AssetType.INFOGRAPHIC_PNG, AssetType.DALLE_POSTER])
          )
        );
      for (const m of medias) {
        if (!mediaMap.has(m.publicationId)) {
          mediaMap.set(m.publicationId, m.cdnPublicUrl);
        }
      }
    }

    return items.map((item) => ({
      ...item,
      imageUrl: mediaMap.get(item.id) || null,
    }));
  }

  async getInfographicDetail(tenantId: string, id: string) {
    const [article] = await db
      .select()
      .from(contentPublications)
      .where(
        and(
          eq(contentPublications.id, id),
          eq(contentPublications.tenantId, tenantId)
        )
      )
      .limit(1);

    if (!article) {
      throw new NotFoundException('Infografis tidak ditemukan.');
    }

    const [asset] = await db
      .select()
      .from(mediaAssets)
      .where(eq(mediaAssets.publicationId, article.id))
      .limit(1);

    return {
      infographic: article,
      asset,
    };
  }
}
