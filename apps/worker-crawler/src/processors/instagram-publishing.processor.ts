import { Job } from 'bullmq';
import { eq, and } from 'drizzle-orm';
import {
  db,
  connectedSocialAccounts,
  socialPublishingJobs,
  withTenantContext,
} from '@polaris/database';
import { SocialTokenCrypto } from '@polaris/core-domain';
import { SocialAccountStatus, PublishingJobStatus } from '@polaris/shared-types';
import { InstagramMediaFormatter } from '@polaris/storage';
import { MetaInstagramPublisherAdapter } from '../adapters/meta-instagram-publisher.adapter.js';
import { SocialPublishingJobPayload } from '../queues/social-publishing.queue.js';
import { redisConnection } from '../config/redis.connection.js';

export class InstagramPublishingProcessor {
  private static readonly publisher = new MetaInstagramPublisherAdapter();

  private static async emitProgress(
    tenantId: string,
    jobId: string,
    percent: number,
    step: string,
    status: 'RUNNING' | 'COMPLETED' | 'FAILED' = 'RUNNING',
    resultUrl?: string
  ) {
    const payload = {
      jobId,
      percent,
      step,
      status,
      resultUrl,
      timestamp: Date.now(),
    };
    const serialized = JSON.stringify(payload);
    await Promise.all([
      redisConnection.publish(`realtime:progress:${tenantId}`, serialized).catch(() => null),
      redisConnection.set(`job:progress:${tenantId}:${jobId}`, serialized, 'EX', 3600).catch(() => null),
    ]);
  }

  private static async emitNotification(
    tenantId: string,
    title: string,
    message: string,
    link: string = '/studio'
  ) {
    const payload = {
      id: `notif_${Date.now()}`,
      title,
      message,
      category: 'SOCIAL_PUBLISH',
      link,
      timestamp: Date.now(),
    };
    const serialized = JSON.stringify(payload);
    await Promise.all([
      redisConnection.publish(`realtime:notifications:${tenantId}`, serialized).catch(() => null),
      redisConnection.lpush(`history:notifications:${tenantId}`, serialized).catch(() => null),
      redisConnection.ltrim(`history:notifications:${tenantId}`, 0, 19).catch(() => null),
    ]);
  }

  public static async process(job: Job<SocialPublishingJobPayload>): Promise<void> {
    const { publishingJobId, tenantId, accountId } = job.data;
    console.log(`[InstagramWorker] Memproses publikasi job #${job.id} (ID: ${publishingJobId})...`);

    // 1. Ambil data akun dan tugas penerbitan secara terisolasi RLS
    const [account, publishingJob] = await withTenantContext(tenantId, async (tx) => {
      const [acc] = await tx
        .select()
        .from(connectedSocialAccounts)
        .where(
          and(
            eq(connectedSocialAccounts.id, accountId),
            eq(connectedSocialAccounts.tenantId, tenantId)
          )
        )
        .limit(1);

      const [pJob] = await tx
        .select()
        .from(socialPublishingJobs)
        .where(
          and(
            eq(socialPublishingJobs.id, publishingJobId),
            eq(socialPublishingJobs.tenantId, tenantId)
          )
        )
        .limit(1);

      return [acc, pJob];
    });

    if (!account || account.status !== SocialAccountStatus.ACTIVE) {
      const errorMsg = 'Akun Instagram tidak aktif atau memerlukan otorisasi ulang.';
      await this.handleJobFailure(tenantId, publishingJobId, errorMsg);
      throw new Error(`[InstagramWorkerError] ${errorMsg}`);
    }

    if (!publishingJob) {
      throw new Error(`[InstagramWorkerError] Rekaman tugas ${publishingJobId} tidak ditemukan.`);
    }

    // Dekripsi accessToken menggunakan kunci HKDF milik tenant
    const accessToken = SocialTokenCrypto.decrypt(
      account.encryptedAccessToken,
      account.tokenIv,
      tenantId
    );

    try {
      // ========================================================
      // TAHAP 1: PRE-FLIGHT FORMATTING MEDIA (RASIO 4:5 SHARP)
      const mediaUrlsToFormat =
        Array.isArray(job.data.mediaUrls) && job.data.mediaUrls.length > 1
          ? job.data.mediaUrls
          : [publishingJob.originalMediaUrl];
      const isCarousel = mediaUrlsToFormat.length > 1;

      // ========================================================
      // TAHAP 1: PRE-FLIGHT FORMATTING MEDIA (RASIO 4:5 SHARP)
      // ========================================================
      let formattedUrls: string[] = [];

      await this.emitProgress(
        tenantId,
        publishingJobId,
        25,
        isCarousel
          ? `Menyelaraskan ${mediaUrlsToFormat.length} slide karusel ke rasio 4:5 Instagram...`
          : 'Menyelaraskan kanvas gambar ke rasio 4:5 Instagram Feed...'
      );

      for (let i = 0; i < mediaUrlsToFormat.length; i++) {
        const src = mediaUrlsToFormat[i];
        try {
          const formatted = await InstagramMediaFormatter.formatForFeed({
            sourceUrl: src,
            tenantId,
            jobId: `${publishingJobId}-${i}`,
            framingMode: job.data.framingMode || 'crop',
          });
          formattedUrls.push(formatted.formattedUrl);
        } catch (formatErr: any) {
          console.warn(`[InstagramWorker] Formatting 4:5 slide #${i} gagal (${formatErr.message}). Fallback ke source URL.`);
          formattedUrls.push(src);
        }
      }

      await withTenantContext(tenantId, async (tx) => {
        await tx
          .update(socialPublishingJobs)
          .set({
            formattedMediaUrl: formattedUrls[0],
            status: PublishingJobStatus.PREPARING_MEDIA,
            updatedAt: new Date(),
          })
          .where(eq(socialPublishingJobs.id, publishingJobId));
      });

      // ========================================================
      // TAHAP 2: PEMBUATAN CONTAINER META (SINGLE ATAU CAROUSEL)
      // ========================================================
      let containerId = publishingJob.metaContainerId;

      if (!containerId) {
        if (isCarousel) {
          await this.emitProgress(tenantId, publishingJobId, 45, `Mendaftarkan ${formattedUrls.length} media container slide ke Meta...`);

          const childContainerIds: string[] = [];
          for (let i = 0; i < formattedUrls.length; i++) {
            const childRes = await this.publisher.createCarouselItem({
              externalAccountId: account.externalAccountId,
              accessToken,
              imageUrl: formattedUrls[i],
            });
            childContainerIds.push(childRes.containerId);
          }

          await this.emitProgress(tenantId, publishingJobId, 55, 'Menggabungkan slide menjadi album Karusel resmi...');

          const parentRes = await this.publisher.createCarouselContainer({
            externalAccountId: account.externalAccountId,
            accessToken,
            children: childContainerIds,
            caption: publishingJob.caption,
          });

          containerId = parentRes.containerId;
        } else {
          await this.emitProgress(tenantId, publishingJobId, 50, 'Mendaftarkan media container di server Meta...');

          const uploadRes = await this.publisher.createImageContainer({
            externalAccountId: account.externalAccountId,
            accessToken,
            imageUrl: formattedUrls[0],
            caption: publishingJob.caption,
          });

          containerId = uploadRes.containerId;
        }

        await withTenantContext(tenantId, async (tx) => {
          await tx
            .update(socialPublishingJobs)
            .set({
              metaContainerId: containerId,
              status: PublishingJobStatus.CONTAINER_CREATED,
              updatedAt: new Date(),
            })
            .where(eq(socialPublishingJobs.id, publishingJobId));
        });
      }

      // ========================================================
      // TAHAP 3: POLLING STATUS CONTAINER META HINGGA FINISHED
      // ========================================================
      await this.emitProgress(tenantId, publishingJobId, 70, 'Menunggu validasi grafis di sistem Meta...');

      let isContainerReady = false;
      const maxPollAttempts = 6;
      const pollDelayMs = 3000;

      for (let attempt = 1; attempt <= maxPollAttempts; attempt++) {
        await new Promise((resolve) => setTimeout(resolve, pollDelayMs));
        const statusRes = await this.publisher.checkContainerStatus({
          containerId,
          accessToken,
        });

        if (statusRes.status === 'FINISHED') {
          isContainerReady = true;
          break;
        }

        if (statusRes.status === 'ERROR' || statusRes.status === 'EXPIRED') {
          throw new Error(statusRes.errorMessage || 'Meta menolak pemrosesan media container.');
        }

        console.log(`[InstagramWorker] Polling container ${containerId} ke-${attempt}: ${statusRes.status}`);
      }

      if (!isContainerReady) {
        throw new Error('Timeout: Validasi media container di server Meta melebihi batas waktu.');
      }

      // ========================================================
      // TAHAP 4: EKSEKUSI PENERBITAN (PUBLISH COMMITMENT)
      // ========================================================
      await this.emitProgress(tenantId, publishingJobId, 85, 'Mempublikasikan naskah ke timeline resmi dewan...');

      const publishRes = await this.publisher.publishMedia({
        externalAccountId: account.externalAccountId,
        accessToken,
        creationId: containerId,
      });

      // Update status menjadi PUBLISHED
      await withTenantContext(tenantId, async (tx) => {
        await tx
          .update(socialPublishingJobs)
          .set({
            metaPostId: publishRes.postId,
            metaPermalink: publishRes.permalink || null,
            status: PublishingJobStatus.PUBLISHED,
            publishedAt: new Date(),
            lastErrorMessage: null,
            updatedAt: new Date(),
          })
          .where(eq(socialPublishingJobs.id, publishingJobId));
      });

      // ========================================================
      // TAHAP 5: EVENT NOTIFIKASI REAL-TIME
      // ========================================================
      await this.emitProgress(
        tenantId,
        publishingJobId,
        100,
        'Konten berhasil terbit di Instagram!',
        'COMPLETED',
        publishRes.permalink
      );

      await this.emitNotification(
        tenantId,
        'Postingan Instagram Berhasil Terbit!',
        `Konten Anda resmi mengudara di akun @${account.accountHandle}.`,
        publishRes.permalink || '/studio'
      );

      console.log(`[InstagramWorker] Berhasil menerbitkan Post ID: ${publishRes.postId}`);
    } catch (err: any) {
      console.error(`[InstagramWorkerError] Kegagalan publish: ${err.message}`);
      await this.handleJobFailure(tenantId, publishingJobId, err.message);
      throw err;
    }
  }

  private static async handleJobFailure(
    tenantId: string,
    publishingJobId: string,
    errorMsg: string
  ): Promise<void> {
    await withTenantContext(tenantId, async (tx) => {
      await tx
        .update(socialPublishingJobs)
        .set({
          status: PublishingJobStatus.FAILED,
          lastErrorMessage: errorMsg,
          updatedAt: new Date(),
        })
        .where(eq(socialPublishingJobs.id, publishingJobId));
    }).catch(() => null);

    await this.emitProgress(
      tenantId,
      publishingJobId,
      100,
      `Penerbitan gagal: ${errorMsg}`,
      'FAILED'
    );
  }
}
