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
import { Queue } from 'bullmq';
import { Redis } from 'ioredis';
import { InstagramTokenCryptoService } from './instagram-crypto.service.js';
import { InstagramAccountDetailDto } from './dto/instagram.dto.js';

interface MetaShortLivedTokenResponse {
  access_token: string;
  user_id: string;
  permissions?: string[];
}

interface MetaLongLivedTokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number; // detik (umumnya 5184000 = 60 hari)
}

interface InstagramProfileResponse {
  id: string;
  username: string;
  name?: string;
  profile_picture_url?: string;
  account_type?: string;
}

@Injectable()
export class InstagramService {
  private readonly logger = new Logger(InstagramService.name);

  private readonly appId = process.env.INSTAGRAM_APP_ID || process.env.META_APP_ID || '';
  private readonly appSecret = process.env.INSTAGRAM_APP_SECRET || process.env.META_APP_SECRET || '';
  private readonly redirectUri =
    process.env.INSTAGRAM_REDIRECT_URI ||
    'http://localhost:4000/api/v1/social/instagram/callback';
  private readonly stateSecret = process.env.JWT_SECRET || 'polaris-secret-state-2026';
  private readonly publishingQueue: Queue;

  constructor(private readonly cryptoService: InstagramTokenCryptoService) {
    const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
    const redisClient = new Redis(redisUrl, { maxRetriesPerRequest: null });
    this.publishingQueue = new Queue('social-content-publishing-queue', {
      connection: redisClient,
    });
  }

  public async triggerPublishContent(
    tenantId: string,
    dto: {
      accountId: string;
      publicationId?: string;
      caption: string;
      mediaUrl?: string;
      mediaUrls?: string[];
      framingMode?: 'crop' | 'blur';
    }
  ): Promise<{ success: boolean; jobId: string; publishingJobId: string }> {
    const primaryMediaUrl =
      dto.mediaUrls && dto.mediaUrls.length > 0 ? dto.mediaUrls[0] : dto.mediaUrl || '';

    // 1. Simpan record pekerjaan di database
    const [createdJob] = await withTenantContext(tenantId, async (tx) => {
      return await tx
        .insert(socialPublishingJobs)
        .values({
          tenantId,
          accountId: dto.accountId,
          publicationId: dto.publicationId || null,
          originalMediaUrl: primaryMediaUrl,
          caption: dto.caption,
          status: PublishingJobStatus.PENDING,
        })
        .returning();
    });

    const jobId = createdJob.id;

    // 2. Kirim ke antrean BullMQ
    await this.publishingQueue.add('publish-instagram-post', {
      publishingJobId: createdJob.id,
      tenantId,
      accountId: dto.accountId,
      publicationId: dto.publicationId,
      caption: dto.caption,
      originalMediaUrl: primaryMediaUrl,
      mediaUrls: dto.mediaUrls && dto.mediaUrls.length > 1 ? dto.mediaUrls : undefined,
      framingMode: dto.framingMode || 'crop',
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
      throw new NotFoundException('Tugas publikasi tidak ditemukan.');
    }

    return {
      success: true,
      data: job,
    };
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
      throw new BadRequestException('INSTAGRAM_APP_ID belum dikonfigurasi pada server.');
    }

    const state = this.generateSignedState(tenantId);
    const scopes = 'instagram_business_basic,instagram_business_content_publish';

    const params = new URLSearchParams({
      client_id: this.appId,
      redirect_uri: this.redirectUri,
      response_type: 'code',
      scope: scopes,
      state,
    });

    const authorizationUrl = `https://www.instagram.com/oauth/authorize?${params.toString()}`;
    return { authorizationUrl, state };
  }

  public async exchangeCodeAndSaveAccount(
    code: string,
    state: string
  ): Promise<{ account: InstagramAccountDetailDto; tenantId: string }> {
    const { tenantId } = this.verifyAndExtractState(state);
    this.logger.log(`[InstagramOAuth] Menukar authorization code untuk Tenant: ${tenantId}`);

    // 1. Tukar Code -> Short-Lived Token
    const shortLived = await this.fetchShortLivedToken(code);

    // 2. Tukar Short-Lived -> Long-Lived Token (60 Hari)
    const longLived = await this.exchangeToLongLivedToken(shortLived.access_token);

    // 3. Ambil data profil akun Instagram
    const profile = await this.fetchInstagramProfile(longLived.access_token);

    // 4. Enkripsi Token dengan Kunci HKDF milik Tenant
    const { encryptedBuffer, ivHex } = this.cryptoService.encryptToken(
      longLived.access_token,
      tenantId
    );

    const expiresAt = new Date(Date.now() + longLived.expires_in * 1000);

    // 5. Simpan secara transaksional di balik RLS Tenant
    const savedRecord = await withTenantContext(tenantId, async (tx) => {
      const [record] = await tx
        .insert(connectedSocialAccounts)
        .values({
          tenantId,
          platform: SocialPlatform.INSTAGRAM,
          accountType: (profile.account_type || 'BUSINESS').toUpperCase(),
          externalAccountId: profile.id,
          accountHandle: profile.username.replace(/^@/, '').trim(),
          accountName: profile.name || profile.username,
          profilePictureUrl: profile.profile_picture_url || null,
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
            profilePictureUrl: profile.profile_picture_url || null,
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

    const accountDto: InstagramAccountDetailDto = {
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

    return { account: accountDto, tenantId };
  }

  public async getConnectedAccount(tenantId: string): Promise<InstagramAccountDetailDto | null> {
    const [record] = await withTenantContext(tenantId, async (tx) => {
      return await tx
        .select()
        .from(connectedSocialAccounts)
        .where(
          and(
            eq(connectedSocialAccounts.tenantId, tenantId),
            eq(connectedSocialAccounts.platform, SocialPlatform.INSTAGRAM)
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
    const updated = await withTenantContext(tenantId, async (tx) => {
      const [res] = await tx
        .update(connectedSocialAccounts)
        .set({
          status: SocialAccountStatus.DISCONNECTED,
          lastErrorMessage: 'Koneksi diputus secara manual oleh pengguna di dashboard.',
          updatedAt: new Date(),
        })
        .where(
          and(
            eq(connectedSocialAccounts.tenantId, tenantId),
            eq(connectedSocialAccounts.platform, SocialPlatform.INSTAGRAM)
          )
        )
        .returning({ id: connectedSocialAccounts.id });
      return res;
    });

    if (!updated) {
      throw new NotFoundException('Tidak ada akun Instagram aktif yang terhubung pada sesi ini.');
    }

    return {
      success: true,
      message: 'Koneksi akun Instagram berhasil diputus.',
    };
  }

  public async refreshLongLivedToken(tenantId: string): Promise<InstagramAccountDetailDto> {
    const [record] = await withTenantContext(tenantId, async (tx) => {
      return await tx
        .select()
        .from(connectedSocialAccounts)
        .where(
          and(
            eq(connectedSocialAccounts.tenantId, tenantId),
            eq(connectedSocialAccounts.platform, SocialPlatform.INSTAGRAM)
          )
        )
        .limit(1);
    });

    if (!record) {
      throw new NotFoundException('Akun Instagram tidak ditemukan.');
    }

    const currentToken = this.cryptoService.decryptToken(
      record.encryptedAccessToken,
      record.tokenIv,
      tenantId
    );

    const refreshed = await this.callRefreshApi(currentToken);
    const { encryptedBuffer, ivHex } = this.cryptoService.encryptToken(
      refreshed.access_token,
      tenantId
    );

    const newExpiresAt = new Date(Date.now() + refreshed.expires_in * 1000);

    const [updatedRecord] = await withTenantContext(tenantId, async (tx) => {
      return await tx
        .update(connectedSocialAccounts)
        .set({
          encryptedAccessToken: encryptedBuffer,
          tokenIv: ivHex,
          tokenExpiresAt: newExpiresAt,
          tokenLastRefreshedAt: new Date(),
          status: SocialAccountStatus.ACTIVE,
          lastErrorMessage: null,
          updatedAt: new Date(),
        })
        .where(eq(connectedSocialAccounts.id, record.id))
        .returning();
    });

    const daysRemaining = Math.max(
      0,
      Math.ceil((newExpiresAt.getTime() - Date.now()) / (24 * 60 * 60 * 1000))
    );

    return {
      id: updatedRecord.id,
      platform: updatedRecord.platform,
      accountType: updatedRecord.accountType,
      accountHandle: updatedRecord.accountHandle,
      accountName: updatedRecord.accountName,
      profilePictureUrl: updatedRecord.profilePictureUrl,
      status: updatedRecord.status,
      tokenExpiresAt: updatedRecord.tokenExpiresAt.toISOString(),
      daysRemaining,
      needsRefresh: daysRemaining <= 15,
      createdAt: updatedRecord.createdAt.toISOString(),
    };
  }

  // ==========================================
  // METODE KOMUNIKASI HTTP KE META GRAPH API
  // ==========================================

  private async fetchShortLivedToken(code: string): Promise<MetaShortLivedTokenResponse> {
    const formData = new URLSearchParams({
      client_id: this.appId,
      client_secret: this.appSecret,
      grant_type: 'authorization_code',
      redirect_uri: this.redirectUri,
      code,
    });

    const res = await fetch('https://api.instagram.com/oauth/access_token', {
      method: 'POST',
      body: formData,
    });

    const data = (await res.json().catch(() => ({}))) as any;

    if (!res.ok || !data.access_token) {
      const errDetail = data.error_message || data.error?.message || 'Gagal menukar authorization code.';
      this.logger.error(`[MetaOAuthError] Pertukaran short-lived token gagal: ${errDetail}`);
      throw new BadRequestException(`Autentikasi Meta gagal: ${errDetail}`);
    }

    return data as MetaShortLivedTokenResponse;
  }

  private async exchangeToLongLivedToken(shortToken: string): Promise<MetaLongLivedTokenResponse> {
    const params = new URLSearchParams({
      grant_type: 'ig_exchange_token',
      client_secret: this.appSecret,
      access_token: shortToken,
    });

    const res = await fetch(`https://graph.instagram.com/access_token?${params.toString()}`);
    const data = (await res.json().catch(() => ({}))) as any;

    if (!res.ok || !data.access_token) {
      const errDetail = data.error?.message || 'Gagal menukar token ke long-lived.';
      this.logger.error(`[MetaOAuthError] Pertukaran long-lived token gagal: ${errDetail}`);
      throw new BadRequestException(`Gagal mengamankan token 60 hari Meta: ${errDetail}`);
    }

    return data as MetaLongLivedTokenResponse;
  }

  private async fetchInstagramProfile(accessToken: string): Promise<InstagramProfileResponse> {
    const res = await fetch(
      `https://graph.instagram.com/v21.0/me?fields=id,username,name,profile_picture_url,account_type&access_token=${accessToken}`
    );
    const data = (await res.json().catch(() => ({}))) as any;

    if (!res.ok || !data.id || !data.username) {
      const errDetail = data.error?.message || 'Gagal mengambil data profil Instagram.';
      this.logger.error(`[MetaGraphError] Gagal membaca profil akun IG: ${errDetail}`);
      throw new BadRequestException(`Gagal memuat detail akun Instagram: ${errDetail}`);
    }

    return data as InstagramProfileResponse;
  }

  private async callRefreshApi(longLivedToken: string): Promise<MetaLongLivedTokenResponse> {
    const params = new URLSearchParams({
      grant_type: 'ig_refresh_token',
      access_token: longLivedToken,
    });

    const res = await fetch(`https://graph.instagram.com/refresh_access_token?${params.toString()}`);
    const data = (await res.json().catch(() => ({}))) as any;

    if (!res.ok || !data.access_token) {
      const errDetail = data.error?.message || 'Gagal memperpanjang masa aktif token Meta.';
      this.logger.error(`[MetaGraphError] Refresh token gagal: ${errDetail}`);
      throw new BadRequestException(`Gagal refresh token Instagram: ${errDetail}`);
    }

    return data as MetaLongLivedTokenResponse;
  }
}
