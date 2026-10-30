import * as fs from 'fs';
import * as path from 'path';

export interface XPublishResult {
  postId: string;
  permalink: string;
}

export interface XTokenRefreshResult {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export class XPublisherAdapter {
  private readonly apiUrl = 'https://api.twitter.com/2';
  private readonly uploadUrl = 'https://upload.twitter.com/1.1/media/upload.json';
  private readonly clientId = process.env.X_CLIENT_ID || '';
  private readonly clientSecret = process.env.X_CLIENT_SECRET || '';

  /**
   * Mengunggah buffer media (gambar atau video) langsung ke Twitter Media Upload API (Chunked)
   */
  public async uploadMedia(params: {
    accessToken: string;
    mediaBuffer: Buffer;
    mimeType: string;
  }): Promise<string> {
    const { accessToken, mediaBuffer, mimeType } = params;
    const isVideo = mimeType.startsWith('video/');
    const mediaCategory = isVideo ? 'tweet_video' : 'tweet_image';

    // 1. INIT
    const initParams = new URLSearchParams({
      command: 'INIT',
      total_bytes: String(mediaBuffer.length),
      media_type: mimeType,
      media_category: mediaCategory,
    });

    const initRes = await fetch(this.uploadUrl, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: initParams.toString(),
    });

    const initData = (await initRes.json().catch(() => ({}))) as any;
    if (!initRes.ok || !initData.media_id_string) {
      throw new Error(
        `[XMediaUploadError] INIT gagal: ${initData.errors?.[0]?.message || initRes.statusText}`
      );
    }

    const mediaId = initData.media_id_string;

    // 2. APPEND (Chunked upload)
    const chunkSize = 4 * 1024 * 1024; // 4MB per chunk
    let segmentIndex = 0;
    for (let offset = 0; offset < mediaBuffer.length; offset += chunkSize) {
      const chunk = mediaBuffer.subarray(offset, Math.min(offset + chunkSize, mediaBuffer.length));
      const formData = new FormData();
      formData.append('command', 'APPEND');
      formData.append('media_id', mediaId);
      formData.append('segment_index', String(segmentIndex));
      formData.append('media', new Blob([chunk], { type: mimeType }));

      const appendRes = await fetch(this.uploadUrl, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        body: formData,
      });

      if (!appendRes.ok) {
        throw new Error(`[XMediaUploadError] APPEND segmen #${segmentIndex} gagal: HTTP ${appendRes.status}`);
      }
      segmentIndex++;
    }

    // 3. FINALIZE
    const finalizeParams = new URLSearchParams({
      command: 'FINALIZE',
      media_id: mediaId,
    });

    const finalizeRes = await fetch(this.uploadUrl, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: finalizeParams.toString(),
    });

    const finalizeData = (await finalizeRes.json().catch(() => ({}))) as any;
    if (!finalizeRes.ok) {
      throw new Error(
        `[XMediaUploadError] FINALIZE gagal: ${finalizeData.errors?.[0]?.message || finalizeRes.statusText}`
      );
    }

    // 4. STATUS (khusus video yang butuh encoding asinkron)
    if (finalizeData.processing_info) {
      let state = finalizeData.processing_info.state;
      let checkAfterSecs = finalizeData.processing_info.check_after_secs || 1;

      while (state === 'pending' || state === 'in_progress') {
        await new Promise((r) => setTimeout(r, checkAfterSecs * 1000));

        const statusRes = await fetch(
          `${this.uploadUrl}?command=STATUS&media_id=${mediaId}`,
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          }
        );
        const statusData = (await statusRes.json().catch(() => ({}))) as any;
        state = statusData.processing_info?.state;
        checkAfterSecs = statusData.processing_info?.check_after_secs || 2;

        if (state === 'failed') {
          throw new Error(
            `[XMediaUploadError] Encoding video gagal: ${statusData.processing_info?.error?.message || 'Unknown'}`
          );
        }
      }
    }

    return mediaId;
  }

  /**
   * Buat satu tweet tunggal
   */
  public async createSingleTweet(params: {
    accessToken: string;
    text: string;
    mediaIds?: string[];
    inReplyToTweetId?: string;
  }): Promise<{ id: string; text: string }> {
    const url = `${this.apiUrl}/tweets`;

    const payload: any = {
      text: params.text,
    };

    if (params.mediaIds && params.mediaIds.length > 0) {
      payload.media = {
        media_ids: params.mediaIds,
      };
    }

    if (params.inReplyToTweetId) {
      payload.reply = {
        in_reply_to_tweet_id: params.inReplyToTweetId,
      };
    }

    const res = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${params.accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const data = (await res.json().catch(() => ({}))) as any;

    if (!res.ok || !data.data?.id) {
      const errMsg = data.detail || data.title || JSON.stringify(data);
      throw new Error(`[XTweetError] Gagal menerbitkan cuitan: ${errMsg}`);
    }

    return {
      id: data.data.id,
      text: data.data.text,
    };
  }

  /**
   * Publikasikan Post / Thread lengkap ke X
   */
  public async publish(params: {
    accessToken: string;
    text: string;
    mediaUrls?: string[];
    accountHandle?: string;
  }): Promise<XPublishResult> {
    const { accessToken, text, mediaUrls = [], accountHandle = 'i' } = params;

    // 1. Upload media jika tersedia
    const mediaIds: string[] = [];
    for (const mediaUrl of mediaUrls) {
      try {
        let buffer: Buffer;
        let mimeType = 'image/jpeg';

        if (mediaUrl.startsWith('data:')) {
          const match = mediaUrl.match(/^data:([^;]+);base64,(.+)$/);
          if (match) {
            mimeType = match[1];
            buffer = Buffer.from(match[2], 'base64');
          } else {
            continue;
          }
        } else if (mediaUrl.startsWith('http://') || mediaUrl.startsWith('https://')) {
          const fetched = await fetch(mediaUrl);
          if (!fetched.ok) continue;
          mimeType = fetched.headers.get('content-type') || 'image/jpeg';
          buffer = Buffer.from(await fetched.arrayBuffer());
        } else {
          // File path lokal
          if (!fs.existsSync(mediaUrl)) continue;
          buffer = fs.readFileSync(mediaUrl);
          const ext = path.extname(mediaUrl).toLowerCase();
          mimeType = ext === '.png' ? 'image/png' : ext === '.mp4' ? 'video/mp4' : 'image/jpeg';
        }

        const id = await this.uploadMedia({
          accessToken,
          mediaBuffer: buffer,
          mimeType,
        });
        mediaIds.push(id);
      } catch (uploadErr: any) {
        console.warn(`[XPublisher] Upload media dilewati: ${uploadErr.message}`);
      }
    }

    // 2. Pemotongan Teks Jika Melebihi 280 Karakter (Thread Mode)
    const tweetChunks = this.splitIntoTweetChunks(text);

    // Tweet Pertama (membawa lampiran media)
    const firstTweet = await this.createSingleTweet({
      accessToken,
      text: tweetChunks[0] || text.slice(0, 280),
      mediaIds: mediaIds.slice(0, 4), // X mengizinkan maksimal 4 gambar
    });

    // Cuitan Lanjutan (Thread Chain)
    let previousId = firstTweet.id;
    for (let i = 1; i < tweetChunks.length; i++) {
      const continuation = await this.createSingleTweet({
        accessToken,
        text: tweetChunks[i],
        inReplyToTweetId: previousId,
      });
      previousId = continuation.id;
    }

    const cleanHandle = accountHandle.replace(/^@/, '');
    const permalink = `https://x.com/${cleanHandle}/status/${firstTweet.id}`;

    return {
      postId: firstTweet.id,
      permalink,
    };
  }

  /**
   * Segarkan token akses OAuth 2.0 menggunakan refresh_token
   */
  public async refreshAccessToken(refreshToken: string): Promise<XTokenRefreshResult> {
    const url = 'https://api.twitter.com/2/oauth2/token';
    const credentials = Buffer.from(`${this.clientId}:${this.clientSecret}`).toString('base64');

    const body = new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: refreshToken,
      client_id: this.clientId,
    });

    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Authorization: `Basic ${credentials}`,
      },
      body: body.toString(),
    });

    const data = (await res.json().catch(() => ({}))) as any;

    if (!res.ok || !data.access_token) {
      throw new Error(`[XTokenRefreshError] Gagal refresh token: ${data.error_description || res.statusText}`);
    }

    return {
      accessToken: data.access_token,
      refreshToken: data.refresh_token || refreshToken,
      expiresIn: data.expires_in || 7200,
    };
  }

  private splitIntoTweetChunks(fullText: string, maxLen = 270): string[] {
    if (fullText.length <= 280) return [fullText];

    const words = fullText.split(' ');
    const chunks: string[] = [];
    let current = '';

    for (const w of words) {
      if ((current + ' ' + w).trim().length <= maxLen) {
        current = (current + ' ' + w).trim();
      } else {
        if (current) chunks.push(current);
        current = w;
      }
    }
    if (current) chunks.push(current);

    // Tambahkan nomor thread jika lebih dari 1
    if (chunks.length > 1) {
      return chunks.map((c, idx) => `${c} (${idx + 1}/${chunks.length})`);
    }

    return chunks;
  }
}

