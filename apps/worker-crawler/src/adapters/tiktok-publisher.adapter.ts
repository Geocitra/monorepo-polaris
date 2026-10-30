import * as fs from 'fs';
import * as path from 'path';

export interface TikTokPublishResult {
  postId: string;
  permalink?: string;
}

export interface TikTokTokenRefreshResult {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export class TikTokPublisherAdapter {
  private readonly baseUrl = 'https://open.tiktokapis.com/v2';
  private readonly clientKey = process.env.TIKTOK_CLIENT_KEY || '';
  private readonly clientSecret = process.env.TIKTOK_CLIENT_SECRET || '';

  /**
   * Mengunggah dan menerbitkan video ke TikTok via Content Posting API (Direct Post - FILE_UPLOAD)
   */
  public async publishVideoDirect(params: {
    accessToken: string;
    title: string;
    videoBuffer: Buffer;
    privacyLevel?: 'PUBLIC_TO_EVERYONE' | 'MUTUAL_FOLLOW_FRIENDS' | 'SELF_ONLY';
  }): Promise<TikTokPublishResult> {
    const { accessToken, title, videoBuffer, privacyLevel = 'PUBLIC_TO_EVERYONE' } = params;

    // 1. Inisialisasi Posting Video
    const initUrl = `${this.baseUrl}/post/publish/video/init/`;
    const initPayload = {
      post_info: {
        title,
        privacy_level: privacyLevel,
        disable_duet: false,
        disable_stitch: false,
        disable_comment: false,
      },
      source_info: {
        source: 'FILE_UPLOAD',
        video_size: videoBuffer.length,
        chunk_size: videoBuffer.length,
        total_chunk_count: 1,
      },
    };

    const initRes = await fetch(initUrl, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(initPayload),
    });

    const initData = (await initRes.json().catch(() => ({}))) as any;
    if (!initRes.ok || initData.error?.code !== 'ok' || !initData.data?.publish_id) {
      const errMsg = initData.error?.message || `HTTP ${initRes.status}: Gagal inisialisasi video TikTok.`;
      throw new Error(`[TikTokPublishError] ${errMsg}`);
    }

    const { publish_id, upload_url } = initData.data;

    // 2. Stream Buffer Video ke Upload URL
    const uploadRes = await fetch(upload_url, {
      method: 'PUT',
      headers: {
        'Content-Type': 'video/mp4',
        'Content-Range': `bytes 0-${videoBuffer.length - 1}/${videoBuffer.length}`,
      },
      body: new Uint8Array(videoBuffer),
    });

    if (!uploadRes.ok) {
      throw new Error(`[TikTokPublishError] Gagal mengunggah buffer video ke TikTok: HTTP ${uploadRes.status}`);
    }

    // 3. Polling Status Pemrosesan Video (Max 5x per 3 detik)
    let finalPostId = publish_id;
    for (let attempt = 0; attempt < 5; attempt++) {
      await new Promise((r) => setTimeout(r, 3000));

      const statusRes = await fetch(`${this.baseUrl}/post/publish/status/fetch/`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ publish_id }),
      });

      const statusData = (await statusRes.json().catch(() => ({}))) as any;
      const status = statusData.data?.status;

      if (status === 'PUBLISH_COMPLETE') {
        const publicIds = statusData.data?.publicly_available_post_id;
        finalPostId = Array.isArray(publicIds) ? publicIds[0] || publish_id : publish_id;
        break;
      }

      if (status === 'FAILED') {
        throw new Error(
          `[TikTokPublishError] Publikasi video TikTok gagal: ${statusData.data?.fail_reason || 'Unknown'}`
        );
      }
    }

    return {
      postId: String(finalPostId),
      permalink: `https://www.tiktok.com/@tiktok_creator/video/${finalPostId}`,
    };
  }

  /**
   * Mengunggah konten foto / poster ke TikTok via Direct Post API
   */
  public async publishPhotoDirect(params: {
    accessToken: string;
    title: string;
    imageUrls: string[];
    privacyLevel?: 'PUBLIC_TO_EVERYONE' | 'MUTUAL_FOLLOW_FRIENDS' | 'SELF_ONLY';
  }): Promise<TikTokPublishResult> {
    const { accessToken, title, imageUrls, privacyLevel = 'PUBLIC_TO_EVERYONE' } = params;

    const initUrl = `${this.baseUrl}/post/publish/content/init/`;
    const payload = {
      post_info: {
        title,
        privacy_level: privacyLevel,
        disable_comment: false,
      },
      source_info: {
        source: 'PULL_FROM_URL',
        photo_cover_index: 1,
        photo_images: imageUrls,
      },
      post_mode: 'DIRECT_POST',
      media_type: 'PHOTO',
    };

    const res = await fetch(initUrl, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const data = (await res.json().catch(() => ({}))) as any;
    if (!res.ok || data.error?.code !== 'ok' || !data.data?.publish_id) {
      throw new Error(`[TikTokPhotoPublishError] ${data.error?.message || res.statusText}`);
    }

    return {
      postId: String(data.data.publish_id),
      permalink: `https://www.tiktok.com/@tiktok_creator/video/${data.data.publish_id}`,
    };
  }

  /**
   * Helper utama penerbitan ke TikTok (otomatis memilih mode video atau foto)
   */
  public async publish(params: {
    accessToken: string;
    caption: string;
    mediaUrl: string;
    mediaFormat?: string;
  }): Promise<TikTokPublishResult> {
    const { accessToken, caption, mediaUrl, mediaFormat = 'TIKTOK_VIDEO' } = params;

    if (mediaFormat === 'TIKTOK_PHOTO') {
      return await this.publishPhotoDirect({
        accessToken,
        title: caption,
        imageUrls: [mediaUrl],
      });
    }

    // Ambil Buffer video (dari URL atau local path)
    let videoBuffer: Buffer;
    if (mediaUrl.startsWith('http://') || mediaUrl.startsWith('https://')) {
      const res = await fetch(mediaUrl);
      if (!res.ok) throw new Error(`Gagal mengunduh file media dari URL: ${mediaUrl}`);
      videoBuffer = Buffer.from(await res.arrayBuffer());
    } else if (fs.existsSync(mediaUrl)) {
      videoBuffer = fs.readFileSync(mediaUrl);
    } else {
      throw new Error(`File media tidak ditemukan: ${mediaUrl}`);
    }

    return await this.publishVideoDirect({
      accessToken,
      title: caption,
      videoBuffer,
    });
  }

  /**
   * Segarkan token akses TikTok menggunakan refresh_token
   */
  public async refreshAccessToken(refreshToken: string): Promise<TikTokTokenRefreshResult> {
    const url = `${this.baseUrl}/oauth/token/`;
    const body = new URLSearchParams({
      client_key: this.clientKey,
      client_secret: this.clientSecret,
      grant_type: 'refresh_token',
      refresh_token: refreshToken,
    });

    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Cache-Control': 'no-cache',
      },
      body: body.toString(),
    });

    const data = (await res.json().catch(() => ({}))) as any;

    if (!res.ok || !data.access_token) {
      throw new Error(`[TikTokTokenRefreshError] Gagal refresh token: ${data.message || res.statusText}`);
    }

    return {
      accessToken: data.access_token,
      refreshToken: data.refresh_token || refreshToken,
      expiresIn: data.expires_in || 86400,
    };
  }
}

