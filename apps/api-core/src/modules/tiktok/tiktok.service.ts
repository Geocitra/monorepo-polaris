import {
  Injectable,
  OnModuleDestroy,
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
import { RedisService } from '../redis/redis.service.js';
import {
  TikTokAuthUrlResponseDto,
  TikTokAccountDetailDto,
  PublishTikTokDto,
} from './dto/tiktok.dto.js';

interface TikTokOAuthTokenResponse {
  access_token: string;
  expires_in: number;
  open_id: string;
  refresh_token: string;
  refresh_expires_in: number;
  scope: string;
  token_type: string;
  error?: string;
  error_description?: string;
  message?: string;
}

interface TikTokUserInfoResponse {
  data: {
    user: {
      open_id: string;
      union_id?: string;
      avatar_url?: string;
      display_name?: string;
      username?: string;
    };
  };
  error?: {
    code: string;
    message: string;
  };
}

@Injectable()
export class TikTokService implements OnModuleDestroy {
  private readonly logger = new Logger(TikTokService.name);

  private readonly clientKey = process.env.TIKTOK_CLIENT_KEY || '';
  private readonly clientSecret = process.env.TIKTOK_CLIENT_SECRET || '';
  private readonly redirectUri =
    process.env.TIKTOK_REDIRECT_URI || 'https://api.polarismedia.id/api/v1/social/tiktok/callback';
  private readonly stateSecret = process.env.JWT_SECRET || 'polaris-secret-state-2026';
  private readonly redisClient: Redis;
  private readonly publishingQueue: Queue;

  constructor(private readonly redisService: RedisService) {
    const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
    this.redisClient = new Redis(redisUrl, { maxRetriesPerRequest: null });
    this.publishingQueue = new Queue('social-content-publishing-queue', {
      connection: this.redisClient,
    });
  }

  async onModuleDestroy(): Promise<void> {
    await this.publishingQueue.close();
    if (this.redisClient.status !== 'end') {
      await this.redisClient.quit();
    }
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
        throw new ForbiddenException('State parameter OAuth TikTok telah dimanipulasi.');
      }

      const { tenantId, timestamp } = JSON.parse(payload);
      const tenMinutes = 10 * 60 * 1000;
      if (Date.now() - timestamp > tenMinutes) {
        throw new ForbiddenException('Sesi otorisasi OAuth TikTok telah kedaluwarsa.');
      }

      return { tenantId };
    } catch (err: any) {
      if (err instanceof ForbiddenException) throw err;
      throw new ForbiddenException('Format state parameter OAuth TikTok tidak valid.');
    }
  }

  public async getAuthorizationUrl(tenantId: string): Promise<TikTokAuthUrlResponseDto> {
    if (!this.clientKey) {
      throw new BadRequestException('TIKTOK_CLIENT_KEY belum dikonfigurasi pada server.');
    }

    // PKCE standard
    const codeVerifier = crypto.randomBytes(32).toString('base64url');
    const codeChallenge = crypto
      .createHash('sha256')
      .update(codeVerifier)
      .digest('base64url');

    const state = this.generateSignedState(tenantId);

    // Simpan codeVerifier di Redis dengan TTL 10 menit
    await this.redisService.set(`oauth:tiktok:pkce:${state}`, codeVerifier, 600);

    const scopes = 'user.info.basic,video.upload,video.publish';

    const params = new URLSearchParams({
      client_key: this.clientKey,
      scope: scopes,
      response_type: 'code',
      redirect_uri: this.redirectUri,
      state,
      code_challenge: codeChallenge,
      code_challenge_method: 'S256',
    });

    const authorizationUrl = `https://www.tiktok.com/v2/auth/authorize/?${params.toString()}`;
    return { authorizationUrl, state };
  }

  public async exchangeCodeAndSaveAccount(
    code: string,
    state: string
  ): Promise<{ account: TikTokAccountDetailDto }> {
    const { tenantId } = this.verifyAndExtractState(state);

    const codeVerifier = await this.redisService.get<string>(`oauth:tiktok:pkce:${state}`);
    await this.redisService.del(`oauth:tiktok:pkce:${state}`);

    const tokenUrl = 'https://open.tiktokapis.com/v2/oauth/token/';
    const bodyParams = new URLSearchParams({
      client_key: this.clientKey,
      client_secret: this.clientSecret,
      code,
      grant_type: 'authorization_code',
      redirect_uri: this.redirectUri,
    });

    if (codeVerifier) {
      bodyParams.append('code_verifier', codeVerifier);
    }

    const tokenRes = await fetch(tokenUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Cache-Control': 'no-cache',
      },
      body: bodyParams.toString(),
    });

    const tokenData = (await tokenRes.json().catch(() => ({}))) as TikTokOAuthTokenResponse;

    if (!tokenRes.ok || !tokenData.access_token) {
      const errMsg =
        tokenData.error_description ||
        tokenData.message ||
        tokenData.error ||
        `HTTP ${tokenRes.status}: Gagal menukar kode otorisasi TikTok.`;
      this.logger.error(`[TikTokOAuthError] Pertukaran token gagal: ${errMsg}`);
      throw new BadRequestException(`[TikTokOAuthError] ${errMsg}`);
    }

    // Ambil data profil pengguna (/v2/user/info/)
    const userUrl =
      'https://open.tiktokapis.com/v2/user/info/?fields=open_id,union_id,avatar_url,display_name,username';
    const userRes = await fetch(userUrl, {
      headers: {
        Authorization: `Bearer ${tokenData.access_token}`,
      },
    });

    const userData = (await userRes.json().catch(() => ({}))) as TikTokUserInfoResponse;
    const userProfile = userData.data?.user;

    const externalAccountId = userProfile?.open_id || tokenData.open_id;
    const rawHandle = userProfile?.username || userProfile?.display_name || 'tiktok_creator';
    const accountHandle = `@${rawHandle.replace(/^@/, '')}`;
    const accountName = userProfile?.display_name || rawHandle;
    const profilePictureUrl = userProfile?.avatar_url || null;

    // Enkripsi token bundle via AES-256-GCM HKDF
    const tokenBundle = JSON.stringify({
      accessToken: tokenData.access_token,
      refreshToken: tokenData.refresh_token,
      openId: externalAccountId,
      scope: tokenData.scope,
    });

    const { encryptedBuffer, ivHex } = SocialTokenCrypto.encrypt(tokenBundle, tenantId);
    const tokenExpiresAt = new Date(Date.now() + (tokenData.expires_in || 86400) * 1000);

    const saved = await withTenantContext(tenantId, async (tx) => {
      const [record] = await tx
        .insert(connectedSocialAccounts)
        .values({
          tenantId,
          platform: SocialPlatform.TIKTOK,
          accountType: 'CREATOR',
          externalAccountId,
          accountHandle,
          accountName,
          profilePictureUrl,
          encryptedAccessToken: encryptedBuffer,
          tokenIv: ivHex,
          tokenExpiresAt,
          tokenLastRefreshedAt: new Date(),
          status: SocialAccountStatus.ACTIVE,
          lastErrorMessage: null,
        })
        .onConflictDoUpdate({
          target: [
            connectedSocialAccounts.tenantId,
            connectedSocialAccounts.platform,
            connectedSocialAccounts.externalAccountId,
          ],
          set: {
            accountHandle,
            accountName,
            profilePictureUrl,
            encryptedAccessToken: encryptedBuffer,
            tokenIv: ivHex,
            tokenExpiresAt,
            tokenLastRefreshedAt: new Date(),
            status: SocialAccountStatus.ACTIVE,
            lastErrorMessage: null,
            updatedAt: new Date(),
          },
        })
        .returning();

      return record;
    });

    return {
      account: {
        id: saved.id,
        platform: saved.platform,
        accountType: saved.accountType,
        accountHandle: saved.accountHandle,
        accountName: saved.accountName,
        profilePictureUrl: saved.profilePictureUrl,
        status: saved.status,
        tokenExpiresAt: saved.tokenExpiresAt.toISOString(),
        daysRemaining: Math.max(
          0,
          Math.ceil((saved.tokenExpiresAt.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
        ),
        needsRefresh: saved.tokenExpiresAt.getTime() - Date.now() < 3 * 24 * 60 * 60 * 1000,
        createdAt: saved.createdAt.toISOString(),
      },
    };
  }

  public async getConnectedAccount(tenantId: string): Promise<TikTokAccountDetailDto | null> {
    const [account] = await withTenantContext(tenantId, (tx) =>
      tx
        .select()
        .from(connectedSocialAccounts)
        .where(
          and(
            eq(connectedSocialAccounts.tenantId, tenantId),
            eq(connectedSocialAccounts.platform, SocialPlatform.TIKTOK),
            eq(connectedSocialAccounts.status, SocialAccountStatus.ACTIVE)
          )
        )
        .limit(1)
    );

    if (!account) return null;

    const expiresAt = account.tokenExpiresAt.getTime();
    const now = Date.now();
    const daysRemaining = Math.max(0, Math.ceil((expiresAt - now) / (1000 * 60 * 60 * 24)));
    const needsRefresh = expiresAt - now < 3 * 24 * 60 * 60 * 1000;

    return {
      id: account.id,
      platform: account.platform,
      accountType: account.accountType,
      accountHandle: account.accountHandle,
      accountName: account.accountName,
      profilePictureUrl: account.profilePictureUrl,
      status: account.status,
      tokenExpiresAt: account.tokenExpiresAt.toISOString(),
      daysRemaining,
      needsRefresh,
      createdAt: account.createdAt.toISOString(),
    };
  }

  public async disconnectAccount(tenantId: string): Promise<{ success: boolean }> {
    await withTenantContext(tenantId, (tx) =>
      tx
        .delete(connectedSocialAccounts)
        .where(
          and(
            eq(connectedSocialAccounts.tenantId, tenantId),
            eq(connectedSocialAccounts.platform, SocialPlatform.TIKTOK)
          )
        )
    );

    return { success: true };
  }

  public async enqueuePublishJob(tenantId: string, dto: PublishTikTokDto): Promise<{ jobId: string }> {
    const [account] = await withTenantContext(tenantId, (tx) =>
      tx
        .select()
        .from(connectedSocialAccounts)
        .where(
          and(
            eq(connectedSocialAccounts.id, dto.accountId),
            eq(connectedSocialAccounts.tenantId, tenantId),
            eq(connectedSocialAccounts.platform, SocialPlatform.TIKTOK),
            eq(connectedSocialAccounts.status, SocialAccountStatus.ACTIVE)
          )
        )
        .limit(1)
    );

    if (!account) {
      throw new NotFoundException('Akun TikTok tidak ditemukan atau statusnya tidak aktif.');
    }

    const mediaFormat = dto.mediaType === 'PHOTO' ? 'TIKTOK_PHOTO' : 'TIKTOK_VIDEO';

    const [jobRecord] = await withTenantContext(tenantId, (tx) =>
      tx
        .insert(socialPublishingJobs)
        .values({
          tenantId,
          accountId: account.id,
          publicationId: dto.publicationId || null,
          mediaFormat,
          originalMediaUrl: dto.mediaUrl,
          caption: dto.title,
          status: PublishingJobStatus.PENDING,
          scheduledAt: new Date(),
        })
        .returning()
    );

    await this.publishingQueue.add('publish-tiktok-post', {
      jobId: jobRecord.id,
      tenantId,
      accountId: account.id,
      platform: SocialPlatform.TIKTOK,
      title: dto.title,
      mediaUrl: dto.mediaUrl,
      mediaType: dto.mediaType || 'VIDEO',
      privacyLevel: dto.privacyLevel || 'PUBLIC_TO_EVERYONE',
      publicationId: dto.publicationId,
    });

    return { jobId: jobRecord.id };
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
      throw new NotFoundException('Tugas penerbitan TikTok tidak ditemukan.');
    }

    return { success: true, data: job };
  }
}

