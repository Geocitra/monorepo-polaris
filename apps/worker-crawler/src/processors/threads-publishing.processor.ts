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
import { MetaThreadsPublisherAdapter } from '../adapters/meta-threads-publisher.adapter.js';
import { ThreadsMediaFormatter } from '@polaris/storage';
import { SocialPublishingJobPayload } from '../queues/social-publishing.queue.js';
import { redisConnection } from '../config/redis.connection.js';

export class ThreadsPublishingProcessor {
  private static readonly publisher = new MetaThreadsPublisherAdapter();

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

  public static async process(job: Job<SocialPublishingJobPayload & { linkAttachmentUrl?: string }>): Promise<void> {
    const { publishingJobId, tenantId, accountId } = job.data;
    console.log(`[ThreadsWorker] Memproses publikasi Threads job #${job.id} (ID: ${publishingJobId})...`);

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
      const errorMsg = 'Akun Threads tidak aktif atau memerlukan otorisasi ulang.';
      await this.handleJobFailure(tenantId, publishingJobId, errorMsg);
      throw new Error(`[ThreadsWorkerError] ${errorMsg}`);
    }

    if (!publishingJob) {
      throw new Error(`[ThreadsWorkerError] Rekaman tugas ${publishingJobId} tidak ditemukan.`);
    }

    // Dekripsi accessToken menggunakan kunci HKDF milik tenant (UU PDP No. 27/2022)
    const accessToken = SocialTokenCrypto.decrypt(
      account.encryptedAccessToken,
      account.tokenIv,
      tenantId
    );

    try {
      await this.emitProgress(tenantId, publishingJobId, 20, 'Mempersiapkan naskah cuitan opini Threads...');

      let containerId: string;
      const hasImage = Boolean(publishingJob.originalMediaUrl && publishingJob.originalMediaUrl.trim().length > 0);

      if (hasImage) {
        await this.emitProgress(tenantId, publishingJobId, 30, 'Menyelaraskan berkas gambar ke format publik Threads...');
        let publicImageUrl = publishingJob.originalMediaUrl;
        try {
          const formatted = await ThreadsMediaFormatter.formatForThreads({
            sourceUrl: publishingJob.originalMediaUrl,
            tenantId,
            jobId: publishingJobId,
          });
          publicImageUrl = formatted.formattedUrl;
        } catch (formatErr: any) {
          console.warn(`[ThreadsWorker] Formatting media gagal (${formatErr.message}). Menggunakan fallback source URL.`);
        }

        await this.emitProgress(tenantId, publishingJobId, 50, 'Membuat container gambar di Meta Threads...');
        const uploadRes = await this.publisher.createImageContainer({
          externalAccountId: account.externalAccountId,
          accessToken,
          imageUrl: publicImageUrl,
          text: publishingJob.caption,
        });
        containerId = uploadRes.containerId;

        // Tunggu sebentar hingga server Meta selesai memproses media
        await this.emitProgress(tenantId, publishingJobId, 60, 'Memverifikasi status pemrosesan media...');
        let isReady = false;
        for (let attempt = 0; attempt < 5; attempt++) {
          await new Promise((r) => setTimeout(r, 2000));
          const check = await this.publisher.checkContainerStatus({ containerId, accessToken });
          if (check.status === 'FINISHED') {
            isReady = true;
            break;
          }
          if (check.status === 'ERROR') {
            throw new Error(check.errorMessage || 'Pemrosesan gambar Threads gagal di sisi server Meta.');
          }
        }
      } else {
        await this.emitProgress(tenantId, publishingJobId, 45, 'Membuat container teks & rich link card Threads...');
        const uploadRes = await this.publisher.createTextContainer({
          externalAccountId: account.externalAccountId,
          accessToken,
          text: publishingJob.caption,
          linkAttachment: job.data.linkAttachmentUrl,
        });
        containerId = uploadRes.containerId;
      }

      // Publikasikan container ke feed publik Threads
      await this.emitProgress(tenantId, publishingJobId, 80, 'Mempublikasikan cuitan resmi ke Meta Threads...');
      const publishRes = await this.publisher.publishContainer({
        externalAccountId: account.externalAccountId,
        accessToken,
        creationId: containerId,
      });

      // Update status di database menjadi PUBLISHED
      await withTenantContext(tenantId, async (tx) => {
        await tx
          .update(socialPublishingJobs)
          .set({
            status: PublishingJobStatus.PUBLISHED,
            metaContainerId: containerId,
            metaPostId: publishRes.postId,
            metaPermalink: publishRes.permalink,
            publishedAt: new Date(),
            updatedAt: new Date(),
          })
          .where(
            and(
              eq(socialPublishingJobs.id, publishingJobId),
              eq(socialPublishingJobs.tenantId, tenantId)
            )
          );
      });

      await this.emitProgress(
        tenantId,
        publishingJobId,
        100,
        'Cuitan berhasil diterbitkan ke Threads!',
        'COMPLETED',
        publishRes.permalink
      );

      await this.emitNotification(
        tenantId,
        'Cuitan Threads Berhasil Terbit',
        `Opini publik resmi dewan berhasil dipublikasikan ke Threads (@${account.accountHandle}).`,
        publishRes.permalink
      );

      console.log(`[ThreadsWorker] Sukses mempublikasikan postingan #${publishRes.postId}`);
    } catch (err: any) {
      console.error(`[ThreadsWorker] Gagal mempublikasikan: ${err.message}`);
      await this.handleJobFailure(tenantId, publishingJobId, err.message);
      throw err;
    }
  }

  private static async handleJobFailure(tenantId: string, publishingJobId: string, errorMsg: string) {
    await withTenantContext(tenantId, async (tx) => {
      await tx
        .update(socialPublishingJobs)
        .set({
          status: PublishingJobStatus.FAILED,
          lastErrorMessage: errorMsg,
          updatedAt: new Date(),
        })
        .where(
          and(
            eq(socialPublishingJobs.id, publishingJobId),
            eq(socialPublishingJobs.tenantId, tenantId)
          )
        );
    });

    await this.emitProgress(tenantId, publishingJobId, 100, `Gagal: ${errorMsg}`, 'FAILED');
  }
}
