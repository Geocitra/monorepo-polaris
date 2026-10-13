import {
  Injectable,
  BadRequestException,
  ForbiddenException,
  NotFoundException,
  Logger,
} from '@nestjs/common';
import * as crypto from 'node:crypto';
import { eq, and } from 'drizzle-orm';
import {
  db,
  connectedSocialAccounts,
  socialPublishingJobs,
  withTenantContext,
} from '@polaris/database';
import { SocialPlatform, SocialAccountStatus, PublishingJobStatus } from '@polaris/shared-types';
import { SocialTokenCrypto } from '@polaris/core-domain';
import { Queue } from 'bullmq';
import { Redis } from 'ioredis';
import {
  ThreadsAccountDetailDto,
  PublishThreadsDto,
} from './dto/threads.dto.js';

interface ThreadsShortLivedTokenResponse {
  access_token: string;
  user_id: string;
}

interface ThreadsLongLivedTokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
}

interface ThreadsProfileResponse {
  id: string;
  username: string;
  name?: string;
  threads_profile_picture_url?: string;
}

@Injectable()
export class ThreadsService {
  private readonly logger = new Logger(ThreadsService.name);

  private readonly appId = process.env.THREADS_APP_ID || '';
  private readonly appSecret = process.env.THREADS_APP_SECRET || '';
  private readonly redirectUri =
    process.env.THREADS_REDIRECT_URI ||
    'https://island-sum-fixtures-managing.trycloudflare.com/api/v1/social/threads/callback';
  private readonly stateSecret = process.env.JWT_SECRET || 'polaris-secret-state-2026';
  private readonly publishingQueue: Queue;

  constructor() {
    const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
    const redisClient = new Redis(redisUrl, { maxRetriesPerRequest: null });
    this.publishingQueue = new Queue('social-content-publishing-queue', {
      connection: redisClient,
    });
  }

  public generateSignedState(tenantId: string): string {
    const nonce = crypto.randomBytes(16).toString('hex');
    const timestamp = Date.now();
    const payload = JSON.stringify({ tenantId, nonce, timestamp });
    const signature = crypto
      .createHmac('sha256', this.stateSecret)
      .update(payload)
      .digest('hex');

    return Buffer.from(JSON.stringify({ payload, signature })).toString('base64url');
  }

  public verifyAndExtractState(encodedState: string): { tenantId: string } {
    try {
      const decoded = JSON.parse(Buffer.from(encodedState, 'base64url').toString('utf8'));
      const { payload, signature } = decoded;

      const expectedSig = crypto
        .createHmac('sha256', this.stateSecret)
        .update(payload)
        .digest('hex');

      if (signature !== expectedSig) {
        throw new ForbiddenException('State parameter OAuth telah dimanipulasi atau tidak sah.');
      }

      const { tenantId, timestamp } = JSON.parse(payload);
      const tenMinutes = 10 * 60 * 1000;
      if (Date.now() - timestamp > tenMinutes) {
        throw new ForbiddenException('Sesi otorisasi OAuth telah kedaluwarsa. Silakan ulangi.');
      }

      return { tenantId };
    } catch (err: any) {
      if (err instanceof ForbiddenException) throw err;
      throw new ForbiddenException('Format state parameter OAuth tidak valid.');
    }
  }

  public getAuthorizationUrl(tenantId: string): { authorizationUrl: string; state: string } {
    if (!this.appId) {
      throw new BadRequestException('THREADS_APP_ID belum dikonfigurasi pada server.');
    }

    const state = this.generateSignedState(tenantId);
    const scopes = 'threads_basic,threads_content_publish';

    const params = new URLSearchParams({
      client_id: this.appId,
      redirect_uri: this.redirectUri,
      response_type: 'code',
      scope: scopes,
      state,
    });

    const authorizationUrl = `https://threads.net/oauth/authorize?${params.toString()}`;
    return { authorizationUrl, state };
  }

  public async fetchShortLivedToken(code: string): Promise<ThreadsShortLivedTokenResponse> {
    const url = 'https://graph.threads.net/oauth/access_token';
    const body = new URLSearchParams({
      client_id: this.appId,
      client_secret: this.appSecret,
      grant_type: 'authorization_code',
      redirect_uri: this.redirectUri,
      code,
    });

    const res = await fetch(url, {
      method: 'POST',
      body,
    });

    const data = (await res.json().catch(() => ({}))) as any;

    if (!res.ok || !data.access_token) {
      const errMsg = data.error_message || data.error?.message || `HTTP ${res.status}: Gagal menukar kode otorisasi Threads.`;
      throw new BadRequestException(`[ThreadsOAuthError] ${errMsg}`);
    }

    return {
      access_token: data.access_token,
      user_id: String(data.user_id),
    };
  }

  public async exchangeToLongLivedToken(shortLivedToken: string): Promise<ThreadsLongLivedTokenResponse> {
    const url = `https://graph.threads.net/access_token?grant_type=th_exchange_token&client_secret=${encodeURIComponent(
      this.appSecret
    )}&access_token=${encodeURIComponent(shortLivedToken)}`;

    const res = await fetch(url);
    const data = (await res.json().catch(() => ({}))) as any;

    if (!res.ok || !data.access_token) {
      // Jika token generator sudah mengeluarkan long-lived token, gunakan token awal dengan default 60 hari
      this.logger.warn(`[ThreadsOAuth] Pertukaran ke long-lived token fallback ke token asli: ${data.error?.message}`);
      return {
        access_token: shortLivedToken,
        token_type: 'bearer',
        expires_in: 5184000, // 60 hari
      };
    }

    return {
      access_token: data.access_token,
      token_type: data.token_type || 'bearer',
      expires_in: Number(data.expires_in) || 5184000,
    };
  }

  public async fetchThreadsProfile(accessToken: string): Promise<ThreadsProfileResponse> {
    const url = `https://graph.threads.net/v1.0/me?fields=id,username,name,threads_profile_picture_url&access_token=${encodeURIComponent(
      accessToken
    )}`;

    const res = await fetch(url);
    const data = (await res.json().catch(() => ({}))) as any;

    if (!res.ok || !data.id) {
      const errMsg = data.error?.message || `HTTP ${res.status}: Gagal mengambil profil Threads.`;
      throw new BadRequestException(`[ThreadsProfileError] ${errMsg}`);
    }

    return {
      id: String(data.id),
      username: data.username || 'threads_user',
      name: data.name,
      threads_profile_picture_url: data.threads_profile_picture_url,
    };
  }

  public async saveAccountWithToken(
    tenantId: string,
    plainToken: string,
    expiresInSeconds: number = 5184000
  ): Promise<ThreadsAccountDetailDto> {
    const profile = await this.fetchThreadsProfile(plainToken);

    // Enkripsi Token dengan Kunci HKDF milik Tenant (UU PDP No. 27/2022)
    const { encryptedBuffer, ivHex } = SocialTokenCrypto.encrypt(plainToken, tenantId);
    const expiresAt = new Date(Date.now() + expiresInSeconds * 1000);

    const savedRecord = await withTenantContext(tenantId, async (tx) => {
      const [record] = await tx
        .insert(connectedSocialAccounts)
        .values({
          tenantId,
          platform: SocialPlatform.THREADS,
          accountType: 'CREATOR',
          externalAccountId: profile.id,
          accountHandle: profile.username.replace(/^@/, '').trim(),
          accountName: profile.name || profile.username,
          profilePictureUrl: profile.threads_profile_picture_url || null,
          encryptedAccessToken: encryptedBuffer,
          tokenIv: ivHex,
          tokenExpiresAt: expiresAt,
          tokenLastRefreshedAt: new Date(),
          status: SocialAccountStatus.ACTIVE,
          lastErrorMessage: null,
          updatedAt: new Date(),
        })
        .onConflictDoUpdate({
          target: [
            connectedSocialAccounts.tenantId,
            connectedSocialAccounts.platform,
            connectedSocialAccounts.externalAccountId,
          ],
          set: {
            accountHandle: profile.username.replace(/^@/, '').trim(),
            accountName: profile.name || profile.username,
            profilePictureUrl: profile.threads_profile_picture_url || null,
            encryptedAccessToken: encryptedBuffer,
            tokenIv: ivHex,
            tokenExpiresAt: expiresAt,
            tokenLastRefreshedAt: new Date(),
            status: SocialAccountStatus.ACTIVE,
            lastErrorMessage: null,
            updatedAt: new Date(),
          },
        })
        .returning();

      return record;
    });

    const daysRemaining = Math.max(
      0,
      Math.ceil((expiresAt.getTime() - Date.now()) / (24 * 60 * 60 * 1000))
    );

    return {
      id: savedRecord.id,
      platform: savedRecord.platform,
      accountType: savedRecord.accountType,
      accountHandle: savedRecord.accountHandle,
      accountName: savedRecord.accountName,
      profilePictureUrl: savedRecord.profilePictureUrl,
      status: savedRecord.status,
      tokenExpiresAt: savedRecord.tokenExpiresAt.toISOString(),
      daysRemaining,
      needsRefresh: daysRemaining <= 15,
      createdAt: savedRecord.createdAt.toISOString(),
    };
  }

  public async exchangeCodeAndSaveAccount(
    code: string,
    state: string
  ): Promise<{ account: ThreadsAccountDetailDto; tenantId: string }> {
    const { tenantId } = this.verifyAndExtractState(state);
    this.logger.log(`[ThreadsOAuth] Menukar authorization code untuk Tenant: ${tenantId}`);

    const shortLived = await this.fetchShortLivedToken(code);
    const longLived = await this.exchangeToLongLivedToken(shortLived.access_token);
    const account = await this.saveAccountWithToken(tenantId, longLived.access_token, longLived.expires_in);

    return { account, tenantId };
  }

  public async connectWithManualToken(
    tenantId: string,
    manualToken: string
  ): Promise<ThreadsAccountDetailDto> {
    this.logger.log(`[ThreadsConnect] Menyimpan manual developer token untuk Tenant: ${tenantId}`);
    return await this.saveAccountWithToken(tenantId, manualToken, 5184000);
  }

  public async getConnectedAccount(tenantId: string): Promise<ThreadsAccountDetailDto | null> {
    const [record] = await withTenantContext(tenantId, async (tx) => {
      return await tx
        .select()
        .from(connectedSocialAccounts)
        .where(
          and(
            eq(connectedSocialAccounts.tenantId, tenantId),
            eq(connectedSocialAccounts.platform, SocialPlatform.THREADS)
          )
        )
        .limit(1);
    });

    if (!record || record.status === SocialAccountStatus.DISCONNECTED) {
      return null;
    }

    const daysRemaining = Math.max(
      0,
      Math.ceil((new Date(record.tokenExpiresAt).getTime() - Date.now()) / (24 * 60 * 60 * 1000))
    );

    return {
      id: record.id,
      platform: record.platform,
      accountType: record.accountType,
      accountHandle: record.accountHandle,
      accountName: record.accountName,
      profilePictureUrl: record.profilePictureUrl,
      status: record.status,
      tokenExpiresAt: record.tokenExpiresAt.toISOString(),
      daysRemaining,
      needsRefresh: daysRemaining <= 15,
      createdAt: record.createdAt.toISOString(),
    };
  }

  public async disconnectAccount(tenantId: string): Promise<{ success: boolean; message: string }> {
    await withTenantContext(tenantId, async (tx) => {
      await tx
        .update(connectedSocialAccounts)
        .set({
          status: SocialAccountStatus.DISCONNECTED,
          lastErrorMessage: 'Diputuskan oleh pengguna.',
          updatedAt: new Date(),
        })
        .where(
          and(
            eq(connectedSocialAccounts.tenantId, tenantId),
            eq(connectedSocialAccounts.platform, SocialPlatform.THREADS)
          )
        );
    });

    return { success: true, message: 'Akun Threads berhasil diputuskan.' };
  }

  public async refreshLongLivedToken(tenantId: string): Promise<ThreadsAccountDetailDto> {
    const [record] = await withTenantContext(tenantId, async (tx) => {
      return await tx
        .select()
        .from(connectedSocialAccounts)
        .where(
          and(
            eq(connectedSocialAccounts.tenantId, tenantId),
            eq(connectedSocialAccounts.platform, SocialPlatform.THREADS),
            eq(connectedSocialAccounts.status, SocialAccountStatus.ACTIVE)
          )
        )
        .limit(1);
    });

    if (!record) {
      throw new NotFoundException('Akun Threads aktif tidak ditemukan.');
    }

    const currentToken = SocialTokenCrypto.decrypt(
      record.encryptedAccessToken,
      record.tokenIv,
      tenantId
    );

    const refreshUrl = `https://graph.threads.net/refresh_access_token?grant_type=th_refresh_token&access_token=${encodeURIComponent(
      currentToken
    )}`;

    const res = await fetch(refreshUrl);
    const data = (await res.json().catch(() => ({}))) as any;

    if (!res.ok || !data.access_token) {
      const errMsg = data.error?.message || 'Gagal memperpanjang token Threads.';
      throw new BadRequestException(`[ThreadsRefreshError] ${errMsg}`);
    }

    const newExpiresIn = Number(data.expires_in) || 5184000;
    return await this.saveAccountWithToken(tenantId, data.access_token, newExpiresIn);
  }

  public async triggerPublishContent(
    tenantId: string,
    dto: PublishThreadsDto
  ): Promise<{ success: boolean; jobId: string; publishingJobId: string }> {
    // 1. Simpan record pekerjaan di database
    const [createdJob] = await withTenantContext(tenantId, async (tx) => {
      return await tx
        .insert(socialPublishingJobs)
        .values({
          tenantId,
          accountId: dto.accountId,
          publicationId: dto.publicationId || null,
          mediaFormat: dto.mediaUrl ? 'THREADS_IMAGE' : 'THREADS_TEXT',
          originalMediaUrl: dto.mediaUrl || '',
          caption: dto.text,
          status: PublishingJobStatus.PENDING,
        })
        .returning();
    });

    const jobId = createdJob.id;

    // 2. Kirim ke antrean BullMQ
    await this.publishingQueue.add('publish-threads-post', {
      publishingJobId: createdJob.id,
      tenantId,
      accountId: dto.accountId,
      publicationId: dto.publicationId,
      caption: dto.text,
      originalMediaUrl: dto.mediaUrl || '',
      linkAttachmentUrl: dto.linkAttachment,
    });

    return {
      success: true,
      jobId,
      publishingJobId: createdJob.id,
    };
  }

  public async getPublishingJobStatus(
    tenantId: string,
    jobId: string
  ): Promise<{ success: boolean; data: any }> {
    const [job] = await withTenantContext(tenantId, async (tx) => {
      return await tx
        .select({
          id: socialPublishingJobs.id,
          status: socialPublishingJobs.status,
          metaContainerId: socialPublishingJobs.metaContainerId,
          metaPostId: socialPublishingJobs.metaPostId,
          metaPermalink: socialPublishingJobs.metaPermalink,
          lastErrorMessage: socialPublishingJobs.lastErrorMessage,
          createdAt: socialPublishingJobs.createdAt,
          updatedAt: socialPublishingJobs.updatedAt,
        })
        .from(socialPublishingJobs)
        .where(
          and(
            eq(socialPublishingJobs.id, jobId),
            eq(socialPublishingJobs.tenantId, tenantId)
          )
        )
        .limit(1);
    });

    if (!job) {
      throw new NotFoundException('Tugas publikasi Threads tidak ditemukan.');
    }

    return {
      success: true,
      data: job,
    };
  }
}
