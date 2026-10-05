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
import { eq, and, desc, sql, gte, or, isNotNull, inArray } from 'drizzle-orm';
import { Queue } from 'bullmq';
import { Redis } from 'ioredis';
import {
  db,
  contentPublications,
  mediaAssets,
  socialSyndicationPacks,
  portalConfigs,
  portalThemeSettings,
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
import { PolicySector } from '@polaris/shared-types';

function normalizeRegionAlias(region: string): string {
  return region
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/^(kabupaten|kab|kota)\s*/i, '')
    .replace(/[^a-z0-9]/g, '');
}

function resolvePolicySectors(interests: string[], commissionName: string | null): PolicySector[] {
  const memberFocus = normalizeRegionAlias(`${interests.join(' ')} ${commissionName || ''}`);
  const sectorTerms: Record<PolicySector, string[]> = {
    [PolicySector.FISKAL_ANGGARAN]: ['anggaran', 'fiskal', 'keuangan', 'apbd', 'apbn', 'pendapatan daerah'],
    [PolicySector.INFRASTRUKTUR_RUANG]: ['infrastruktur', 'pekerjaan umum', 'tata ruang', 'pupr', 'perhubungan'],
    [PolicySector.PANGAN_PERTANIAN]: ['pertanian', 'pangan', 'pupuk', 'nelayan', 'perikanan', 'perkebunan'],
    [PolicySector.SOSIAL_KEMISKINAN]: ['sosial', 'kemiskinan', 'bansos', 'stunting', 'perlindungan sosial'],
    [PolicySector.LAYANAN_DASAR]: ['pendidikan', 'kesehatan', 'bpjs', 'sekolah', 'puskesmas', 'rumah sakit'],
    [PolicySector.TATA_KELOLA_HUKUM]: ['hukum', 'pemerintahan', 'tata kelola', 'pengawasan', 'legislasi'],
    [PolicySector.EKONOMI_KETENAGAKERJAAN]: ['ekonomi', 'umkm', 'ketenagakerjaan', 'tenaga kerja', 'perdagangan'],
    [PolicySector.LINGKUNGAN_BENCANA]: ['lingkungan', 'bencana', 'sampah', 'banjir', 'iklim'],
  };

  return Object.entries(sectorTerms)
    .filter(([, terms]) => terms.some((term) => memberFocus.includes(normalizeRegionAlias(term))))
    .map(([sector]) => sector as PolicySector);
}

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
        personalCoverage: tenantMembers.personalCoverage,
        issueInterests: tenantMembers.issueInterests,
        commissionName: tenantMembers.commissionName,
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

    const regionCoverage = member.personalCoverage?.length
      ? member.personalCoverage
      : dapil?.regencyCoverage || [];
    const regionScope = regionCoverage[0] || 'NASIONAL';

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
          regency: constituentFeedbacks.regencyName,
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
    const pendingFollowUp = recentFeedbacks.filter(
      (f) => f.status === 'RECEIVED' || f.status === 'VERIFIED'
    ).length;
    const resolvedAspirasi = recentFeedbacks.filter((f) => f.status === 'RESPONDED').length;

    const categoryLabels: Record<string, string> = {
      INFRASTRUKTUR: 'Infrastruktur',
      PERTANIAN: 'Pertanian',
      PENDIDIKAN: 'Pendidikan',
      KESEHATAN: 'Kesehatan',
      BANSOS_UMKM: 'Bansos & UMKM',
      LAINNYA: 'Lainnya',
    };
    const issueGroups = new Map<string, {
      category: string;
      district: string;
      regency: string;
      frequency: number;
      pendingCount: number;
    }>();

    for (const feedback of recentFeedbacks) {
      const key = `${feedback.category}:${feedback.district}:${feedback.regency}`;
      const group = issueGroups.get(key) || {
        category: feedback.category,
        district: feedback.district,
        regency: feedback.regency,
        frequency: 0,
        pendingCount: 0,
      };
      group.frequency += 1;
      if (feedback.status === 'RECEIVED' || feedback.status === 'VERIFIED') {
        group.pendingCount += 1;
      }
      issueGroups.set(key, group);
    }

    const priorityIssues = [...issueGroups.values()]
      .sort((a, b) => b.frequency - a.frequency)
      .slice(0, 3)
      .map((group) => {
        const location = [group.district, group.regency].filter(Boolean).join(', ');
        return {
          id: `${group.category}-${group.district}-${group.regency}`,
          title: categoryLabels[group.category] || group.category,
          location: location || regionScope,
          frequency: group.frequency,
          status: group.pendingCount > 0
            ? `${group.pendingCount} perlu tindak lanjut`
            : 'Tidak ada laporan tertunda',
          description: `${group.frequency} aspirasi tercatat dalam 7 hari terakhir.`,
        };
      });

    const regionAliases = [...new Set([
      ...regionCoverage.map(normalizeRegionAlias),
      normalizeRegionAlias(dapil?.provinceName || ''),
    ].filter(Boolean))];
    const preferredSectors = resolvePolicySectors(member.issueInterests || [], member.commissionName);
    const normalizedNewsRegion = sql`regexp_replace(
      regexp_replace(lower(${mediaDiscourses.regionScope}), '^(kabupaten|kab|kota)', ''),
      '[^a-z0-9]', '', 'g'
    )`;
    const newsScopeConditions = [
      eq(mediaDiscourses.regionScope, 'NASIONAL'),
      ...regionAliases.map((alias) => sql`${normalizedNewsRegion} = ${alias}`),
    ];
    const recentNews = await db
      .select({
        id: mediaDiscourses.id,
        title: mediaDiscourses.articleTitle,
        portal: mediaDiscourses.newsPortalName,
        url: mediaDiscourses.originalUrl,
        summary: mediaDiscourses.cleanSummary,
        sentiment: mediaDiscourses.sentimentScore,
        publishedAt: mediaDiscourses.publishedAt,
        regionScope: mediaDiscourses.regionScope,
        sector: mediaDiscourses.sector,
        relevanceScore: mediaDiscourses.relevanceScore,
      })
      .from(mediaDiscourses)
      .where(and(
        gte(mediaDiscourses.publishedAt, sevenDaysAgo),
        or(...newsScopeConditions),
        isNotNull(mediaDiscourses.sector),
        gte(mediaDiscourses.relevanceScore, 0.65),
        ...(preferredSectors.length > 0
          ? [inArray(mediaDiscourses.sector, preferredSectors)]
          : [])
      ))
      .orderBy(
        sql`CASE WHEN ${mediaDiscourses.regionScope} = 'NASIONAL' THEN 1 ELSE 0 END`,
        desc(mediaDiscourses.relevanceScore),
        desc(mediaDiscourses.publishedAt)
      )
      .limit(5);

    const averageSentiment = recentNews.length
      ? recentNews.reduce((total, news) => total + news.sentiment, 0) / recentNews.length
      : null;
    const sentimentLabel = averageSentiment === null
      ? 'Belum ada data'
      : averageSentiment > 0.15
        ? 'Cenderung positif'
        : averageSentiment < -0.15
          ? 'Cenderung negatif'
          : 'Cenderung netral';
    const topIssue = priorityIssues[0];

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
        sentimentIndex: averageSentiment === null
          ? null
          : `${Math.round(((averageSentiment + 1) / 2) * 100)}%`,
        sentimentLabel,
      },
      priorityIssues,
      briefingNews: recentNews,
      todayAgenda: [],
      recommendation: topIssue
        ? `Tinjau isu ${topIssue.title.toLowerCase()} di ${topIssue.location}; ${topIssue.frequency} aspirasi masuk dalam 7 hari terakhir.`
        : 'Belum ada aspirasi terbaru yang perlu diprioritaskan. Periksa kembali setelah data aspirasi masuk.',
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
      const placeholderTitle = topicCharacters.length <= 255
        ? topicCharacters.join('')
        : `${topicCharacters.slice(0, 252).join('').trimEnd()}...`;
      const [created] = await tx
        .insert(contentPublications)
        .values({
          tenantId,
          title: placeholderTitle,
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

    let infographicData = null;
    if (asset?.promptUsed) {
      try {
        const parsed = JSON.parse(asset.promptUsed);
        if (parsed?.infographicSpec) {
          infographicData = parsed.infographicSpec;
        }
      } catch {
        // promptUsed is plain prompt string
      }
    }

    return {
      article,
      asset,
      socialPack: social,
      infographicData,
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
