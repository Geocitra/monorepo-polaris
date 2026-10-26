import {
  Injectable,
  Logger,
  OnModuleDestroy,
  ForbiddenException,
  NotFoundException,
  ServiceUnavailableException,
} from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { eq, and } from 'drizzle-orm';
import { Queue } from 'bullmq';
import { Redis } from 'ioredis';
import {
  db,
  contentPublications,
  subscriptions,
  portalConfigs,
  portalThemeSettings,
  tenantMembers,
  withTenantContext,
} from '@polaris/database';
import { ContentPublication, SubdomainSlug, CanonicalUrl } from '@polaris/core-domain';
import { ContentStatus, SubscriptionStatus, ContentCreationContext } from '@polaris/shared-types';
import { GenerateArticleRequestDto } from '../dto/studio.dto.js';
import { RedisService } from '../../redis/redis.service.js';
import { UrlScraperService } from '../url-scraper.service.js';

@Injectable()
export class StudioGeneratorService implements OnModuleDestroy {
  private readonly logger = new Logger(StudioGeneratorService.name);
  private readonly studioQueue: Queue;
  private readonly redisClient: Redis;

  constructor(
    private readonly redisService?: RedisService,
    private readonly urlScraperService?: UrlScraperService,
  ) {
    const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
    this.redisClient = new Redis(redisUrl, { maxRetriesPerRequest: null });
    this.studioQueue = new Queue('studio-content-generation-queue', {
      connection: this.redisClient,
      defaultJobOptions: {
        attempts: 3,
        backoff: { type: 'exponential', delay: 3000 },
        removeOnComplete: { count: 100 },
        removeOnFail: { count: 200 },
      },
    });
  }

  async onModuleDestroy(): Promise<void> {
    await this.studioQueue.close();
    if (this.redisClient.status !== 'end') await this.redisClient.quit();
  }

  async generateNewContentPackage(
    tenantId: string,
    dto: GenerateArticleRequestDto,
    caller?: { isOperator?: boolean; operatorId?: string }
  ) {
    const jobId = randomUUID();
    const publication = await withTenantContext(tenantId, async (tx) => {
      const [sub] = await tx
        .select({ status: subscriptions.status })
        .from(subscriptions)
        .where(eq(subscriptions.tenantId, tenantId))
        .limit(1);

      if (!sub || sub.status !== SubscriptionStatus.ACTIVE) {
        throw new ForbiddenException(
          'Akses AI Generator dibatasi: Selesaikan pembayaran lisensi untuk mengaktifkan AI Studio.'
        );
      }

      let [portal] = await tx
        .select({ subdomainSlug: portalConfigs.subdomainSlug })
        .from(portalConfigs)
        .where(eq(portalConfigs.tenantId, tenantId))
        .limit(1);

      let subdomainSlug = portal?.subdomainSlug;
      if (!subdomainSlug) {
        const [member] = await tx
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

        const [createdPortal] = await tx
          .insert(portalConfigs)
          .values({
            tenantId,
            subdomainSlug,
            isActive: true,
            metaTitle: `Portal Resmi ${member?.fullName || 'Wakil Rakyat'}`,
            metaDescription: `Portal transparansi kebijakan dan aspirasi konstituen.`,
          })
          .onConflictDoNothing()
          .returning();

        if (createdPortal) {
          await tx
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

      const baseSlug = ContentPublication.generateSlug(dto.topic.slice(0, 50));
      const finalSlug = `${baseSlug}-${randomUUID().slice(0, 8)}`;
      const canonicalUrlObj = new CanonicalUrl(new SubdomainSlug(subdomainSlug), finalSlug);
      const topicCharacters = Array.from(dto.topic.trim());
      const placeholderTitle =
        topicCharacters.length <= 255
          ? topicCharacters.join('')
          : `${topicCharacters.slice(0, 252).join('').trimEnd()}...`;
      const [created] = await tx
        .insert(contentPublications)
        .values({
          tenantId,
          title: placeholderTitle,
          slug: finalSlug,
          excerpt: 'Sedang disintesis oleh Polaris AI Engine...',
          bodyContentMarkdown:
            '# Sedang Disintesis...\n\nNaskah kebijakan Anda sedang diproses oleh AI Agent di antrean server.',
          wordCount: 0,
          status: ContentStatus.GENERATING,
          canonicalUrl: canonicalUrlObj.getValue(),
          createdByOperatorId: caller?.isOperator && caller.operatorId ? caller.operatorId : null,
          createdContext: caller?.isOperator ? ContentCreationContext.OPERATOR : ContentCreationContext.MEMBER,
        })
        .returning();

      return created;
    });

    // 4. Deteksi URL eksternal jika ada
    const detectedUrls = this.urlScraperService
      ? this.urlScraperService.extractUrlsFromText(dto.topic)
      : [];
    const allUrls = Array.from(new Set([...detectedUrls, ...(dto.externalUrls || [])]));

    // Pemetaan gaya visual dari UI ke Arketipe Desain POLARIS
    let forcedArchetype: string | undefined = undefined;
    if (dto.style === 'infographic') {
      forcedArchetype = 'MODULAR_GRID_CARDS';
    } else if (dto.style === 'poster') {
      forcedArchetype = undefined; // Otomatis dipilihkan arketipe poster terbaik dari katalog blueprint
    } else if (dto.style === 'photo') {
      forcedArchetype = 'POP_OUT_HERO';
    } else if (dto.style === 'illustration') {
      forcedArchetype = 'RETRO_CAMPAIGN';
    }

    // 5. Masukkan Job ke Antrean BullMQ
    const effectiveTaskType =
      dto.taskType ||
      (dto.topic.startsWith('Infografis Publik:') ||
      dto.topic.startsWith('Poster Publik:') ||
      (dto.generateDallePoster && !dto.writingStyle && !dto.targetLength)
        ? 'INFOGRAPHIC_ONLY'
        : 'FULL_CAMPAIGN');

    try {
      await this.studioQueue.add(
        'generate-content-package',
        {
          taskType: effectiveTaskType,
          jobId,
          tenantId,
          publicationId: publication.id,
          topic: dto.topic,
          targetAudience: dto.targetAudience,
          toneOverride: dto.toneOverride,
          comparisonRegion: dto.comparisonRegion,
          framingStance: dto.framingStance,
          generateDallePoster: dto.generateDallePoster ?? true,
          style: dto.style,
          aspectRatio: dto.aspectRatio,
          forcedArchetype,
          includeUserPhoto: dto.includeUserPhoto,
          compositionMode: dto.compositionMode,
          customPhotoUrl: dto.customPhotoUrl,
          targetLength: dto.targetLength,
          writingStyle: dto.writingStyle,
          externalUrls: allUrls,
          attachments: dto.attachments,
          operatorId: caller?.isOperator ? caller.operatorId : undefined,
        },
        {
          jobId,
          attempts: 3,
          backoff: { type: 'exponential', delay: 3000 },
          removeOnComplete: { count: 100 },
          removeOnFail: { count: 200 },
        }
      );
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      this.logger.error(`Failed to enqueue studio job ${jobId}: ${message}`);
      await withTenantContext(tenantId, (tx) =>
        tx
          .update(contentPublications)
          .set({
            status: ContentStatus.DRAFT,
            excerpt: 'Permintaan belum masuk antrean. Silakan coba kembali.',
            updatedAt: new Date(),
          })
          .where(
            and(
              eq(contentPublications.id, publication.id),
              eq(contentPublications.tenantId, tenantId)
            )
          )
      ).catch((cleanupError: unknown) => {
        const cleanupMessage =
          cleanupError instanceof Error ? cleanupError.message : String(cleanupError);
        this.logger.error(
          `Failed to release orphan generation placeholder ${publication.id}: ${cleanupMessage}`
        );
      });
      throw new ServiceUnavailableException(
        'Antrean pemrosesan sedang tidak tersedia. Silakan coba kembali.'
      );
    }

    // 6. Emisi Progres Awal via Redis Pub/Sub
    const initialProgress = {
      jobId,
      percent: 5,
      step: 'Tugas telah dijadwalkan di antrean server...',
      status: 'RUNNING',
      timestamp: Date.now(),
    } as const;
    await Promise.all(
      [
        this.redisService?.set(`job:progress:${tenantId}:${jobId}`, initialProgress, 3600),
        this.redisService?.emitUserProgress(tenantId, initialProgress),
      ].map((operation) =>
        operation?.catch((error: unknown) => {
          const message = error instanceof Error ? error.message : String(error);
          this.logger.warn(`Unable to publish initial studio progress for ${jobId}: ${message}`);
        })
      )
    );

    // 7. Kembalikan Respons Instan (< 200ms) dengan HTTP 202 Accepted semantics
    return {
      success: true,
      message:
        'Permintaan penyusunan naskah kebijakan telah diterima dan dijadwalkan di antrean server.',
      jobId,
      publicationId: publication.id,
      status: ContentStatus.GENERATING,
    };
  }

  async getJobStatus(jobId: string, tenantId: string) {
    const progressKey = `job:progress:${tenantId}:${jobId}`;
    const cached = await this.redisService?.get<Record<string, unknown>>(progressKey);
    if (cached) return cached;

    const job = await this.studioQueue.getJob(jobId);
    if (!job || job.data.tenantId !== tenantId) {
      throw new NotFoundException('Tugas tidak ditemukan.');
    }

    const state = await job.getState();
    return {
      jobId,
      state,
      progress: job.progress,
      status: state === 'completed' ? 'COMPLETED' : state === 'failed' ? 'FAILED' : 'RUNNING',
      failedReason: state === 'failed' ? job.failedReason : undefined,
    };
  }

  async regenerateArticlePoster(tenantId: string, articleId: string) {
    const article = await withTenantContext(tenantId, async (tx) => {
      const [record] = await tx
        .select({
          id: contentPublications.id,
          title: contentPublications.title,
          bodyContentMarkdown: contentPublications.bodyContentMarkdown,
        })
        .from(contentPublications)
        .where(
          and(
            eq(contentPublications.id, articleId),
            eq(contentPublications.tenantId, tenantId)
          )
        )
        .limit(1);
      return record;
    });

    if (!article || !article.bodyContentMarkdown.trim()) {
      throw new NotFoundException(
        'Naskah artikel tidak ditemukan atau belum siap untuk dibuatkan poster.'
      );
    }

    const jobId = randomUUID();
    try {
      await this.studioQueue.add(
        'regenerate-article-poster',
        {
          taskType: 'REGENERATE_POSTER',
          jobId,
          tenantId,
          publicationId: article.id,
          topic: article.title,
          generateDallePoster: true,
        },
        {
          jobId,
          attempts: 3,
          backoff: { type: 'exponential', delay: 3000 },
          removeOnComplete: { count: 100 },
          removeOnFail: { count: 200 },
        }
      );
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      this.logger.error(`Failed to enqueue poster regeneration ${jobId}: ${message}`);
      throw new ServiceUnavailableException(
        'Antrean pembuatan poster sedang tidak tersedia. Silakan coba kembali.'
      );
    }

    const progress = {
      jobId,
      percent: 5,
      step: 'Pembuatan ulang poster telah dijadwalkan...',
      status: 'RUNNING',
      timestamp: Date.now(),
    } as const;
    await Promise.all(
      [
        this.redisService?.set(`job:progress:${tenantId}:${jobId}`, progress, 3600),
        this.redisService?.emitUserProgress(tenantId, progress),
      ].map((operation) =>
        operation?.catch((error: unknown) => {
          const message = error instanceof Error ? error.message : String(error);
          this.logger.warn(`Unable to publish poster regeneration progress ${jobId}: ${message}`);
        })
      )
    );

    return { success: true, jobId, publicationId: article.id, status: 'GENERATING_POSTER' };
  }
}
