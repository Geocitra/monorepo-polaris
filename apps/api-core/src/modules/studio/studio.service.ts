import {
  Injectable,
  BadRequestException,
  NotFoundException,
  ForbiddenException,
  Logger,
  OnModuleDestroy,
  ServiceUnavailableException,
} from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { eq, and, desc, sql, gte } from 'drizzle-orm';
import { Queue } from 'bullmq';
import { Redis } from 'ioredis';
import {
  db,
  contentPublications,
  mediaAssets,
  socialSyndicationPacks,
  portalConfigs,
  electoralDistricts,
  tenantMembers,
  mediaDiscourses,
  constituentFeedbacks,
  subscriptions,
  withTenantContext,
} from '@polaris/database';
import { ContentPublication, SubdomainSlug, CanonicalUrl } from '@polaris/core-domain';
import { ContentStatus, AssetType, SubscriptionStatus } from '@polaris/shared-types';
import { GenerateArticleRequestDto, UpdateDraftArticleDto } from './dto/studio.dto.js';
import { RedisService } from '../redis/redis.service.js';
import { UrlScraperService } from './url-scraper.service.js';
import { DocumentParserService } from './document-parser.service.js';

@Injectable()
export class StudioService implements OnModuleDestroy {
  private readonly logger = new Logger(StudioService.name);
  private readonly studioQueue: Queue;
  private readonly redisClient: Redis;

  constructor(
    private readonly redisService?: RedisService,
    private readonly urlScraperService?: UrlScraperService,
    private readonly documentParserService?: DocumentParserService,
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

  async getMorningBriefing(tenantId: string) {
    const [member] = await db
      .select({
        fullName: tenantMembers.fullName,
        party: tenantMembers.partyAffiliation,
        level: tenantMembers.legislativeLevel,
        dapilId: tenantMembers.electoralDistrictId,
        issueInterests: tenantMembers.issueInterests,
      })
      .from(tenantMembers)
      .where(eq(tenantMembers.id, tenantId))
      .limit(1);

    if (!member) {
      throw new NotFoundException('Data anggota dewan tidak ditemukan.');
    }

    const [dapil] = member.dapilId
      ? await db
        .select()
        .from(electoralDistricts)
        .where(eq(electoralDistricts.id, member.dapilId))
        .limit(1)
      : [null];

    const regionScope = dapil?.regencyCoverage?.[0] || 'NASIONAL';

    const [portal] = await db
      .select({ id: portalConfigs.id })
      .from(portalConfigs)
      .where(eq(portalConfigs.tenantId, tenantId))
      .limit(1);

    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const recentFeedbacks = portal
      ? await db
        .select({
          category: constituentFeedbacks.category,
          district: constituentFeedbacks.districtKecamatan,
          status: constituentFeedbacks.status,
        })
        .from(constituentFeedbacks)
        .where(
          and(
            eq(constituentFeedbacks.portalId, portal.id),
            gte(constituentFeedbacks.submittedAt, sevenDaysAgo)
          )
        )
      : [];

    const totalAspirasi = recentFeedbacks.length;
    const pendingFollowUp = recentFeedbacks.filter((f) => f.status === 'RECEIVED').length;
    const resolvedAspirasi = recentFeedbacks.filter((f) => f.status === 'RESPONDED').length;

    const recentNews = await db
      .select({
        id: mediaDiscourses.id,
        title: mediaDiscourses.articleTitle,
        portal: mediaDiscourses.newsPortalName,
        url: mediaDiscourses.originalUrl,
        summary: mediaDiscourses.cleanSummary,
        sentiment: mediaDiscourses.sentimentScore,
        publishedAt: mediaDiscourses.publishedAt,
      })
      .from(mediaDiscourses)
      .orderBy(desc(mediaDiscourses.publishedAt))
      .limit(5);

    const issueMap = [
      {
        id: 'issue-1',
        title: 'Kerusakan Jalan Poros & Ambles Akibat Cuaca',
        location: `Kec. Waled (${regionScope})`,
        frequency: 42,
        impact: 'TINGGI',
        status: 'Perlu Tindak Lanjut Komisi',
        description: 'Menghambat distribusi hasil panen hortikultura dan akses pelajar.',
      },
      {
        id: 'issue-2',
        title: 'Kelangkaan Alokasi Pupuk Bersubsidi',
        location: `Kec. Gebang (${regionScope})`,
        frequency: 28,
        impact: 'TINGGI',
        status: 'Investigasi Distribusi',
        description: 'Petani mengeluhkan kuota kios resmi tidak mencukupi musim tanam.',
      },
      {
        id: 'issue-3',
        title: 'Penyaluran Bantuan Modal Usaha Mikro (UMKM)',
        location: `Kec. Arjawinangun (${regionScope})`,
        frequency: 19,
        impact: 'SEDANG',
        status: 'Monitoring Program',
        description: 'Aspirasi masyarakat meminta transparansi penerima hibah peralatan usaha.',
      },
    ];

    const todayAgenda = [
      { time: '10:00 WIB', agenda: 'Rapat Dengar Pendapat (RDP) Komisi dengan Dinas Teknis', location: 'Ruang Sidang Paripurna' },
      { time: '14:00 WIB', agenda: 'Kunjungan Lapangan Advokasi Tanggul Sungai', location: 'Titik Rawan Bencana Dapil' },
    ];

    return {
      dateGreeting: new Intl.DateTimeFormat('id-ID', { dateStyle: 'full' }).format(new Date()),
      member: {
        fullName: member.fullName,
        party: member.party,
        dapilName: dapil?.dapilName || 'Dapil',
        regionScope,
        issueInterests: member.issueInterests || [],
      },
      metrics: {
        totalAspirasi,
        pendingFollowUp,
        resolvedAspirasi,
        sentimentIndex: '74% Positif',
      },
      priorityIssues: issueMap,
      briefingNews: recentNews,
      todayAgenda,
    };
  }

  async generateNewContentPackage(tenantId: string, dto: GenerateArticleRequestDto) {
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

      const [portal] = await tx
        .select({ subdomainSlug: portalConfigs.subdomainSlug })
        .from(portalConfigs)
        .where(eq(portalConfigs.tenantId, tenantId))
        .limit(1);

      if (!portal?.subdomainSlug) {
        throw new NotFoundException('Portal website dewan belum dikonfigurasi. Silakan lakukan setup di menu Branding terlebih dahulu.');
      }

      const baseSlug = ContentPublication.generateSlug(dto.topic.slice(0, 50));
      const finalSlug = `${baseSlug}-${randomUUID().slice(0, 8)}`;
      const canonicalUrlObj = new CanonicalUrl(new SubdomainSlug(portal.subdomainSlug), finalSlug);
      const [created] = await tx
        .insert(contentPublications)
        .values({
          tenantId,
          title: dto.topic,
          slug: finalSlug,
          excerpt: 'Sedang disintesis oleh Polaris AI Engine...',
          bodyContentMarkdown: '# Sedang Disintesis...\n\nNaskah kebijakan Anda sedang diproses oleh AI Agent di antrean server.',
          wordCount: 0,
          status: ContentStatus.GENERATING,
          canonicalUrl: canonicalUrlObj.getValue(),
        })
        .returning();

      return created;
    });

    // 4. Deteksi URL eksternal jika ada
    const detectedUrls = this.urlScraperService ? this.urlScraperService.extractUrlsFromText(dto.topic) : [];
    const allUrls = Array.from(new Set([...detectedUrls, ...(dto.externalUrls || [])]));

    // 5. Masukkan Job ke Antrean BullMQ
    try {
      await this.studioQueue.add('generate-content-package', {
        jobId,
        tenantId,
        publicationId: publication.id,
        topic: dto.topic,
        targetAudience: dto.targetAudience,
        toneOverride: dto.toneOverride,
        comparisonRegion: dto.comparisonRegion,
        framingStance: dto.framingStance,
        generateDallePoster: dto.generateDallePoster ?? true,
        externalUrls: allUrls,
        attachments: dto.attachments,
      }, {
        jobId,
        attempts: 3,
        backoff: { type: 'exponential', delay: 3000 },
        removeOnComplete: { count: 100 },
        removeOnFail: { count: 200 },
      });
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
          .where(and(
            eq(contentPublications.id, publication.id),
            eq(contentPublications.tenantId, tenantId)
          ))
      ).catch((cleanupError: unknown) => {
        const cleanupMessage = cleanupError instanceof Error ? cleanupError.message : String(cleanupError);
        this.logger.error(`Failed to release orphan generation placeholder ${publication.id}: ${cleanupMessage}`);
      });
      throw new ServiceUnavailableException('Antrean pemrosesan sedang tidak tersedia. Silakan coba kembali.');
    }

    // 6. Emisi Progres Awal via Redis Pub/Sub
    const initialProgress = {
      jobId,
      percent: 5,
      step: 'Tugas telah dijadwalkan di antrean server...',
      status: 'RUNNING',
      timestamp: Date.now(),
    } as const;
    await Promise.all([
      this.redisService?.set(`job:progress:${tenantId}:${jobId}`, initialProgress, 3600),
      this.redisService?.emitUserProgress(tenantId, initialProgress),
    ].map((operation) => operation?.catch((error: unknown) => {
      const message = error instanceof Error ? error.message : String(error);
      this.logger.warn(`Unable to publish initial studio progress for ${jobId}: ${message}`);
    })));

    // 7. Kembalikan Respons Instan (< 200ms) dengan HTTP 202 Accepted semantics
    return {
      success: true,
      message: 'Permintaan penyusunan naskah kebijakan telah diterima dan dijadwalkan di antrean server.',
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
        .where(and(
          eq(contentPublications.id, articleId),
          eq(contentPublications.tenantId, tenantId)
        ))
        .limit(1);
      return record;
    });

    if (!article || !article.bodyContentMarkdown.trim()) {
      throw new NotFoundException('Naskah artikel tidak ditemukan atau belum siap untuk dibuatkan poster.');
    }

    const jobId = randomUUID();
    try {
      await this.studioQueue.add('regenerate-article-poster', {
        taskType: 'REGENERATE_POSTER',
        jobId,
        tenantId,
        publicationId: article.id,
        topic: article.title,
        generateDallePoster: true,
      }, {
        jobId,
        attempts: 3,
        backoff: { type: 'exponential', delay: 3000 },
        removeOnComplete: { count: 100 },
        removeOnFail: { count: 200 },
      });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      this.logger.error(`Failed to enqueue poster regeneration ${jobId}: ${message}`);
      throw new ServiceUnavailableException('Antrean pembuatan poster sedang tidak tersedia. Silakan coba kembali.');
    }

    const progress = {
      jobId,
      percent: 5,
      step: 'Pembuatan ulang poster telah dijadwalkan...',
      status: 'RUNNING',
      timestamp: Date.now(),
    } as const;
    await Promise.all([
      this.redisService?.set(`job:progress:${tenantId}:${jobId}`, progress, 3600),
      this.redisService?.emitUserProgress(tenantId, progress),
    ].map((operation) => operation?.catch((error: unknown) => {
      const message = error instanceof Error ? error.message : String(error);
      this.logger.warn(`Unable to publish poster regeneration progress ${jobId}: ${message}`);
    })));

    return { success: true, jobId, publicationId: article.id, status: 'GENERATING_POSTER' };
  }

  async listArticles(tenantId: string) {
    return await db
      .select({
        id: contentPublications.id,
        title: contentPublications.title,
        slug: contentPublications.slug,
        excerpt: contentPublications.excerpt,
        status: contentPublications.status,
        wordCount: contentPublications.wordCount,
        publishedAt: contentPublications.publishedAt,
        createdAt: contentPublications.createdAt,
      })
      .from(contentPublications)
      .where(eq(contentPublications.tenantId, tenantId))
      .orderBy(desc(contentPublications.createdAt));
  }

  async getArticleDetail(tenantId: string, articleId: string) {
    const [article] = await db
      .select()
      .from(contentPublications)
      .where(
        and(
          eq(contentPublications.id, articleId),
          eq(contentPublications.tenantId, tenantId)
        )
      )
      .limit(1);

    if (!article) {
      throw new NotFoundException('Artikel tidak ditemukan.');
    }

    const [asset] = await db
      .select()
      .from(mediaAssets)
      .where(and(
        eq(mediaAssets.publicationId, article.id),
        eq(mediaAssets.assetType, AssetType.DALLE_POSTER)
      ))
      .limit(1);

    const [social] = await db
      .select()
      .from(socialSyndicationPacks)
      .where(eq(socialSyndicationPacks.publicationId, article.id))
      .limit(1);

    return {
      article,
      asset,
      socialPack: social,
    };
  }

  async updateDraftArticle(tenantId: string, articleId: string, dto: UpdateDraftArticleDto) {
    const [article] = await db
      .select()
      .from(contentPublications)
      .where(
        and(
          eq(contentPublications.id, articleId),
          eq(contentPublications.tenantId, tenantId)
        )
      )
      .limit(1);

    if (!article) {
      throw new NotFoundException('Artikel tidak ditemukan.');
    }

    const updates: Partial<typeof contentPublications.$inferInsert> = {
      updatedAt: new Date(),
    };

    if (dto.title) updates.title = dto.title;
    if (dto.excerpt) updates.excerpt = dto.excerpt;
    if (dto.bodyContentMarkdown) {
      updates.bodyContentMarkdown = dto.bodyContentMarkdown;
      updates.wordCount = dto.bodyContentMarkdown.split(/\s+/).filter(Boolean).length;
    }

    await db
      .update(contentPublications)
      .set(updates)
      .where(eq(contentPublications.id, article.id));

    return { message: 'Draf artikel berhasil diperbarui.' };
  }

  async publishArticle(tenantId: string, articleId: string) {
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

    const [article] = await db
      .select()
      .from(contentPublications)
      .where(
        and(
          eq(contentPublications.id, articleId),
          eq(contentPublications.tenantId, tenantId)
        )
      )
      .limit(1);

    if (!article) {
      throw new NotFoundException('Artikel tidak ditemukan.');
    }

    await db
      .update(contentPublications)
      .set({
        status: ContentStatus.PUBLISHED,
        publishedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(contentPublications.id, article.id));

    return {
      message: 'Artikel resmi dipublikasikan ke Website Pribadi Dewan.',
      canonicalUrl: article.canonicalUrl,
    };
  }

  async unpublishArticle(tenantId: string, articleId: string) {
    const [article] = await db
      .select()
      .from(contentPublications)
      .where(
        and(
          eq(contentPublications.id, articleId),
          eq(contentPublications.tenantId, tenantId)
        )
      )
      .limit(1);

    if (!article) {
      throw new NotFoundException('Artikel tidak ditemukan.');
    }

    await db
      .update(contentPublications)
      .set({
        status: ContentStatus.UNPUBLISHED,
        updatedAt: new Date(),
      })
      .where(eq(contentPublications.id, article.id));

    return { message: 'Artikel berhasil ditarik dari tayangan publik (Status: UNPUBLISHED).' };
  }
}
