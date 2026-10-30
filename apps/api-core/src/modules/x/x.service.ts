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
  XAuthUrlResponseDto,
  XAccountDetailDto,
  PublishXDto,
} from './dto/x.dto.js';

interface XOAuth2TokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  scope: string;
  refresh_token?: string;
}

interface XUserMeResponse {
  data: {
    id: string;
    name: string;
    username: string;
    profile_image_url?: string;
  };
}

@Injectable()
export class XService implements OnModuleDestroy {
  private readonly logger = new Logger(XService.name);

  private readonly clientId = process.env.X_CLIENT_ID || '';
  private readonly clientSecret = process.env.X_CLIENT_SECRET || '';
  private readonly redirectUri =
    process.env.X_REDIRECT_URI || 'https://api.polarismedia.id/api/v1/social/x/callback';
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
        throw new ForbiddenException('State parameter OAuth X telah dimanipulasi atau tidak sah.');
      }

      const { tenantId, timestamp } = JSON.parse(payload);
      const tenMinutes = 10 * 60 * 1000;
      if (Date.now() - timestamp > tenMinutes) {
        throw new ForbiddenException('Sesi otorisasi OAuth X telah kedaluwarsa. Silakan ulangi.');
      }

      return { tenantId };
    } catch (err: any) {
      if (err instanceof ForbiddenException) throw err;
      throw new ForbiddenException('Format state parameter OAuth X tidak valid.');
    }
  }

  public async getAuthorizationUrl(tenantId: string): Promise<XAuthUrlResponseDto> {
    if (!this.clientId) {
      throw new BadRequestException('X_CLIENT_ID belum dikonfigurasi pada server.');
    }

    // PKCE standard RFC 7636
    const codeVerifier = crypto.randomBytes(32).toString('base64url');
    const codeChallenge = crypto
      .createHash('sha256')
      .update(codeVerifier)
      .digest('base64url');

    const state = this.generateSignedState(tenantId);

    // Simpan codeVerifier di Redis dengan TTL 10 menit
    await this.redisService.set(`oauth:x:pkce:${state}`, codeVerifier, 600);

    const scopes = 'tweet.read tweet.write users.read offline.access';

    const params = new URLSearchParams({
      response_type: 'code',
      client_id: this.clientId,
      redirect_uri: this.redirectUri,
      scope: scopes,
      state,
      code_challenge: codeChallenge,
      code_challenge_method: 'S256',
    });

    const authorizationUrl = `https://twitter.com/i/oauth2/authorize?${params.toString()}`;
    return { authorizationUrl, state };
  }

  public async exchangeCodeAndSaveAccount(
    code: string,
    state: string
  ): Promise<{ account: XAccountDetailDto }> {
    const { tenantId } = this.verifyAndExtractState(state);

    // Ambil code_verifier yang tersimpan dari Redis
    const codeVerifier = await this.redisService.get<string>(`oauth:x:pkce:${state}`);
    if (!codeVerifier) {
      throw new BadRequestException(
        '[XOAuthError] Verifier sesi OAuth X tidak ditemukan atau sudah kedaluwarsa.'
      );
    }
    await this.redisService.del(`oauth:x:pkce:${state}`);

    // Tukar Authorization Code dengan Token
    const tokenUrl = 'https://api.twitter.com/2/oauth2/token';
    const credentials = Buffer.from(`${this.clientId}:${this.clientSecret}`).toString('base64');

    const bodyParams = new URLSearchParams({
      code,
      grant_type: 'authorization_code',
      client_id: this.clientId,
      redirect_uri: this.redirectUri,
      code_verifier: codeVerifier,
    });

    const tokenRes = await fetch(tokenUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Authorization: `Basic ${credentials}`,
      },
      body: bodyParams.toString(),
    });

    const tokenData = (await tokenRes.json().catch(() => ({}))) as any;

    if (!tokenRes.ok || !tokenData.access_token) {
      const errMsg =
        tokenData.error_description ||
        tokenData.error ||
        `HTTP ${tokenRes.status}: Gagal menukar kode otorisasi X.`;
      this.logger.error(`[XOAuthError] Pertukaran token gagal: ${errMsg}`);
      throw new BadRequestException(`[XOAuthError] ${errMsg}`);
    }

    const tokenPayload: XOAuth2TokenResponse = tokenData;

    // Ambil profil akun X yang terautentikasi (/2/users/me)
    const userMeUrl =
      'https://api.twitter.com/2/users/me?user.fields=profile_image_url,name,username';
    const userRes = await fetch(userMeUrl, {
      headers: {
        Authorization: `Bearer ${tokenPayload.access_token}`,
      },
    });

    const userData = (await userRes.json().catch(() => ({}))) as XUserMeResponse;

    if (!userRes.ok || !userData.data?.id) {
      this.logger.error(
        `[XOAuthError] Gagal mengambil profil /2/users/me: ${JSON.stringify(userData)}`
      );
      throw new BadRequestException('Gagal mengambil data profil pengguna dari X API.');
    }

    const { id: externalAccountId, name: accountName, username: rawHandle, profile_image_url } = userData.data;
    const accountHandle = `@${rawHandle.replace(/^@/, '')}`;

    // Enkripsi token bundle (access_token + refresh_token) via AES-256-GCM HKDF
    const tokenBundle = JSON.stringify({
      accessToken: tokenPayload.access_token,
      refreshToken: tokenPayload.refresh_token,
      scope: tokenPayload.scope,
    });

    const { encryptedBuffer, ivHex } = SocialTokenCrypto.encrypt(tokenBundle, tenantId);
    const tokenExpiresAt = new Date(Date.now() + (tokenPayload.expires_in || 7200) * 1000);

    const saved = await withTenantContext(tenantId, async (tx) => {
      const [record] = await tx
        .insert(connectedSocialAccounts)
        .values({
          tenantId,
          platform: SocialPlatform.X_TWITTER,
          accountType: 'PUBLIC_PROFILE',
          externalAccountId,
          accountHandle,
          accountName: accountName || rawHandle,
          profilePictureUrl: profile_image_url || null,
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
            accountName: accountName || rawHandle,
            profilePictureUrl: profile_image_url || null,
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
        needsRefresh: saved.tokenExpiresAt.getTime() - Date.now() < 30 * 60 * 1000,
        createdAt: saved.createdAt.toISOString(),
      },
    };
  }

  public async getConnectedAccount(tenantId: string): Promise<XAccountDetailDto | null> {
    const [account] = await withTenantContext(tenantId, (tx) =>
      tx
        .select()
        .from(connectedSocialAccounts)
        .where(
          and(
            eq(connectedSocialAccounts.tenantId, tenantId),
            eq(connectedSocialAccounts.platform, SocialPlatform.X_TWITTER),
            eq(connectedSocialAccounts.status, SocialAccountStatus.ACTIVE)
          )
        )
        .limit(1)
    );

    if (!account) return null;

    const expiresAt = account.tokenExpiresAt.getTime();
    const now = Date.now();
    const daysRemaining = Math.max(0, Math.ceil((expiresAt - now) / (1000 * 60 * 60 * 24)));
    const needsRefresh = expiresAt - now < 30 * 60 * 1000;

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
            eq(connectedSocialAccounts.platform, SocialPlatform.X_TWITTER)
          )
        )
    );

    return { success: true };
  }

  public async enqueuePublishJob(tenantId: string, dto: PublishXDto): Promise<{ jobId: string }> {
    const [account] = await withTenantContext(tenantId, (tx) =>
      tx
        .select()
        .from(connectedSocialAccounts)
        .where(
          and(
            eq(connectedSocialAccounts.id, dto.accountId),
            eq(connectedSocialAccounts.tenantId, tenantId),
            eq(connectedSocialAccounts.platform, SocialPlatform.X_TWITTER),
            eq(connectedSocialAccounts.status, SocialAccountStatus.ACTIVE)
          )
        )
        .limit(1)
    );

    if (!account) {
      throw new NotFoundException('Akun X tidak ditemukan atau statusnya tidak aktif.');
    }

    const [jobRecord] = await withTenantContext(tenantId, (tx) =>
      tx
        .insert(socialPublishingJobs)
        .values({
          tenantId,
          accountId: account.id,
          publicationId: dto.publicationId || null,
          mediaFormat: dto.mediaUrls && dto.mediaUrls.length > 0 ? 'TWEET_MEDIA' : 'TWEET_TEXT',
          originalMediaUrl: dto.mediaUrls?.[0] || '',
          caption: dto.text,
          status: PublishingJobStatus.PENDING,
          scheduledAt: new Date(),
        })
        .returning()
    );

    await this.publishingQueue.add('publish-x-post', {
      jobId: jobRecord.id,
      tenantId,
      accountId: account.id,
      platform: SocialPlatform.X_TWITTER,
      text: dto.text,
      mediaUrls: dto.mediaUrls || [],
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
      throw new NotFoundException('Tugas penerbitan X tidak ditemukan.');
    }

    return { success: true, data: job };
  }
}

