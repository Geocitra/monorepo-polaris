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
        title: title.slice(0, 2200),
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
        'Content-Type': 'application/json; charset=UTF-8',
      },
      body: JSON.stringify(initPayload),
    });

    let initData = (await initRes.json().catch(() => ({}))) as any;

    // Jika ditolak karena app masih unaudited/development mode (memerlukan SELF_ONLY & akun privat)
    const isUnauditedVideo =
      initData.error?.code === 'unaudited_client_can_only_post_to_private_accounts' ||
      initData.error?.message?.includes('content-sharing-guidelines');

    if (isUnauditedVideo && privacyLevel !== 'SELF_ONLY') {
      initPayload.post_info.privacy_level = 'SELF_ONLY';
      const retryRes = await fetch(initUrl, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json; charset=UTF-8',
        },
        body: JSON.stringify(initPayload),
      });
      initData = (await retryRes.json().catch(() => ({}))) as any;
    }

    if (!initRes.ok || initData.error?.code !== 'ok' || !initData.data?.publish_id) {
      if (
        initData.error?.code === 'unaudited_client_can_only_post_to_private_accounts' ||
        initData.error?.message?.includes('content-sharing-guidelines')
      ) {
        throw new Error(
          '[TikTokPublishError] Aplikasi TikTok Developer Anda masih berstatus Uji Coba (Unaudited). Sesuai aturan TikTok: 1) Di aplikasi TikTok HP Anda, ubah akun menjadi "Akun Privat" (Pengaturan -> Privasi -> Akun Privat ON), dan 2) Konten diunggah sebagai "Hanya Saya" (SELF_ONLY) hingga App diverifikasi publik oleh tim TikTok.'
        );
      }
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
   * Mengunggah konten foto / poster ke TikTok via Direct Post API (Content Posting API v2)
   */
  public async publishPhotoDirect(params: {
    accessToken: string;
    caption: string;
    title?: string;
    imageUrls: string[];
    privacyLevel?: 'PUBLIC_TO_EVERYONE' | 'MUTUAL_FOLLOW_FRIENDS' | 'FOLLOWER_OF_CREATOR' | 'SELF_ONLY';
  }): Promise<TikTokPublishResult> {
    const { accessToken, caption, title, imageUrls, privacyLevel = 'PUBLIC_TO_EVERYONE' } = params;

    const sanitizedUrls = imageUrls.map((u) => u.trim()).filter(Boolean);
    if (sanitizedUrls.length === 0) {
      throw new Error('[TikTokPhotoPublishError] Daftar URL gambar tidak boleh kosong.');
    }

    // TikTok API v2:
    // post_info.title: Headline singkat (Maks 90 UTF-16 karakter)
    // post_info.description: Deskripsi lengkap / caption hingga 4.000 karakter
    const cleanCaption = (caption || '').trim();
    const shortTitle = (title || cleanCaption.split('\n')[0] || 'Konten Polaris')
      .replace(/[\r\n]+/g, ' ')
      .trim()
      .slice(0, 85);

    const fullDescription = cleanCaption.slice(0, 4000);

    const initUrl = `${this.baseUrl}/post/publish/content/init/`;
    const payload = {
      post_mode: 'DIRECT_POST',
      media_type: 'PHOTO',
      post_info: {
        title: shortTitle,
        description: fullDescription,
        privacy_level: privacyLevel,
        disable_comment: false,
        auto_add_music: true,
      },
      source_info: {
        source: 'PULL_FROM_URL',
        photo_cover_index: 0,
        photo_images: sanitizedUrls,
      },
    };

    console.log('[TikTokPublisher] Mengirim init payload foto ke TikTok:', JSON.stringify(payload));

    let res = await fetch(initUrl, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json; charset=UTF-8',
      },
      body: JSON.stringify(payload),
    });

    let data = (await res.json().catch(() => ({}))) as any;
    console.log('[TikTokPublisher] Respon init TikTok foto:', JSON.stringify(data));

    // Jika ditolak karena app masih unaudited/development mode (memerlukan SELF_ONLY & akun privat)
    const isUnaudited =
      data.error?.code === 'unaudited_client_can_only_post_to_private_accounts' ||
      data.error?.message?.includes('content-sharing-guidelines');

    if (isUnaudited && privacyLevel !== 'SELF_ONLY') {
      console.log(
        '[TikTokAdapter] App berstatus unaudited/development; mencoba posting foto otomatis dengan privacy_level SELF_ONLY...'
      );
      payload.post_info.privacy_level = 'SELF_ONLY';
      res = await fetch(initUrl, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json; charset=UTF-8',
        },
        body: JSON.stringify(payload),
      });
      data = (await res.json().catch(() => ({}))) as any;
    }

    if (!res.ok || data.error?.code !== 'ok' || !data.data?.publish_id) {
      if (
        data.error?.code === 'unaudited_client_can_only_post_to_private_accounts' ||
        data.error?.message?.includes('content-sharing-guidelines')
      ) {
        throw new Error(
          '[TikTokPhotoPublishError] Aplikasi TikTok Developer Anda masih berstatus Uji Coba (Unaudited). Sesuai aturan TikTok: 1) Di aplikasi TikTok HP Anda, ubah akun menjadi "Akun Privat" (Pengaturan -> Privasi -> Akun Privat ON), dan 2) Konten diunggah sebagai "Hanya Saya" (SELF_ONLY) hingga App diverifikasi publik oleh tim TikTok.'
        );
      }
      const errMsg = data.error?.message || `HTTP ${res.status}: Gagal inisialisasi posting foto TikTok.`;
      throw new Error(`[TikTokPhotoPublishError] ${errMsg}`);
    }

    const { publish_id } = data.data;

    // Polling Status Pemrosesan Foto (Max 6x per 3 detik)
    let finalPostId = publish_id;
    for (let attempt = 0; attempt < 6; attempt++) {
      await new Promise((r) => setTimeout(r, 3000));

      const statusRes = await fetch(`${this.baseUrl}/post/publish/status/fetch/`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json; charset=UTF-8',
        },
        body: JSON.stringify({ publish_id }),
      });

      const statusData = (await statusRes.json().catch(() => ({}))) as any;
      const status = statusData.data?.status;

      if (status === 'PUBLISH_COMPLETE') {
        const publicIds = statusData.data?.publicly_available_post_id;
        finalPostId = Array.isArray(publicIds) && publicIds.length > 0 ? publicIds[0] : publish_id;
        break;
      }

      if (status === 'FAILED') {
        throw new Error(
          `[TikTokPhotoPublishError] Publikasi foto TikTok gagal: ${statusData.data?.fail_reason || 'Unknown'}`
        );
      }
    }

    return {
      postId: String(finalPostId),
      permalink: `https://www.tiktok.com/@tiktok_creator/video/${finalPostId}`,
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
        caption,
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

