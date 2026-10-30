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
import { TikTokPublisherAdapter } from '../adapters/tiktok-publisher.adapter.js';
import { redisConnection } from '../config/redis.connection.js';

export interface TikTokPublishingJobPayload {
  jobId: string;
  tenantId: string;
  accountId: string;
  title: string;
  mediaUrl: string;
  mediaType?: 'VIDEO' | 'PHOTO';
  privacyLevel?: 'PUBLIC_TO_EVERYONE' | 'MUTUAL_FOLLOW_FRIENDS' | 'SELF_ONLY';
  publicationId?: string;
}

export class TikTokPublishingProcessor {
  private static readonly publisher = new TikTokPublisherAdapter();

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

  public static async process(job: Job<TikTokPublishingJobPayload>): Promise<void> {
    const { jobId: publishingJobId, tenantId, accountId } = job.data;
    console.log(`[TikTokWorker] Memproses publikasi TikTok job #${job.id} (ID: ${publishingJobId})...`);

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
      const errorMsg = 'Akun TikTok tidak aktif atau memerlukan otorisasi ulang.';
      await this.handleJobFailure(tenantId, publishingJobId, errorMsg);
      throw new Error(`[TikTokWorkerError] ${errorMsg}`);
    }

    if (!publishingJob) {
      throw new Error(`[TikTokWorkerError] Tugas penerbitan ${publishingJobId} tidak ditemukan.`);
    }

    try {
      await this.emitProgress(tenantId, publishingJobId, 20, 'Mendekripsi token otorisasi akun TikTok...');

      // 2. Dekripsi token bundle
      const decryptedString = SocialTokenCrypto.decrypt(
        account.encryptedAccessToken,
        account.tokenIv,
        tenantId
      );

      let tokenBundle: { accessToken: string; refreshToken?: string; openId?: string };
      try {
        tokenBundle = JSON.parse(decryptedString);
      } catch {
        tokenBundle = { accessToken: decryptedString };
      }

      let activeAccessToken = tokenBundle.accessToken;

      // 3. Auto Refresh Token jika hampir kedaluwarsa (< 2 jam)
      const expiresAt = account.tokenExpiresAt.getTime();
      const now = Date.now();
      if (tokenBundle.refreshToken && expiresAt - now < 2 * 60 * 60 * 1000) {
        console.log(`[TikTokWorker] Token TikTok mendekati kedaluwarsa; memperbarui token via refresh_token...`);
        try {
          const refreshRes = await this.publisher.refreshAccessToken(tokenBundle.refreshToken);
          activeAccessToken = refreshRes.accessToken;

          const updatedBundle = JSON.stringify({
            accessToken: refreshRes.accessToken,
            refreshToken: refreshRes.refreshToken,
            openId: tokenBundle.openId,
          });

          const { encryptedBuffer, ivHex } = SocialTokenCrypto.encrypt(updatedBundle, tenantId);
          const newExpiresAt = new Date(Date.now() + refreshRes.expiresIn * 1000);

          await withTenantContext(tenantId, (tx) =>
            tx
              .update(connectedSocialAccounts)
              .set({
                encryptedAccessToken: encryptedBuffer,
                tokenIv: ivHex,
                tokenExpiresAt: newExpiresAt,
                tokenLastRefreshedAt: new Date(),
                updatedAt: new Date(),
              })
              .where(eq(connectedSocialAccounts.id, account.id))
          );
        } catch (refreshErr: any) {
          console.warn(`[TikTokWorker] Gagal refresh token otomatis: ${refreshErr.message}`);
        }
      }

      // 4. Publikasikan Konten ke TikTok
      await this.emitProgress(tenantId, publishingJobId, 60, 'Mengunggah dan memproses media di TikTok...');

      const publishResult = await this.publisher.publish({
        accessToken: activeAccessToken,
        caption: publishingJob.caption,
        mediaUrl: publishingJob.originalMediaUrl,
        mediaFormat: publishingJob.mediaFormat,
      });

      // 5. Update Status Database Menjadi PUBLISHED
      await withTenantContext(tenantId, (tx) =>
        tx
          .update(socialPublishingJobs)
          .set({
            status: PublishingJobStatus.PUBLISHED,
            publishedAt: new Date(),
            metaPostId: publishResult.postId,
            metaPermalink: publishResult.permalink,
            updatedAt: new Date(),
          })
          .where(eq(socialPublishingJobs.id, publishingJobId))
      );

      await this.emitProgress(
        tenantId,
        publishingJobId,
        100,
        'Konten berhasil diterbitkan ke TikTok!',
        'COMPLETED',
        publishResult.permalink
      );

      await this.emitNotification(
        tenantId,
        'Publikasi TikTok Berhasil',
        `Konten Anda telah resmi terbit di akun TikTok ${account.accountHandle}.`,
        publishResult.permalink
      );

      console.log(`[TikTokWorker] Sukses menerbitkan ke TikTok: ${publishResult.postId}`);
    } catch (err: any) {
      console.error(`[TikTokWorkerError] Kegagalan penerbitan ke TikTok: ${err.message}`);
      await this.handleJobFailure(tenantId, publishingJobId, err.message);
      throw err;
    }
  }

  private static async handleJobFailure(
    tenantId: string,
    publishingJobId: string,
    errorMessage: string
  ): Promise<void> {
    await withTenantContext(tenantId, (tx) =>
      tx
        .update(socialPublishingJobs)
        .set({
          status: PublishingJobStatus.FAILED,
          lastErrorMessage: errorMessage,
          updatedAt: new Date(),
        })
        .where(eq(socialPublishingJobs.id, publishingJobId))
    );

    await this.emitProgress(
      tenantId,
      publishingJobId,
      100,
      `Gagal menerbitkan ke TikTok: ${errorMessage}`,
      'FAILED'
    );

    await this.emitNotification(
      tenantId,
      'Publikasi TikTok Gagal',
      `Terjadi kendala saat menerbitkan ke TikTok: ${errorMessage}`
    );
  }
}

