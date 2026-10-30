import * as crypto from 'node:crypto';
import { IStoragePort, UploadStreamOptions } from '@polaris/core-domain';
import { ImageOptimizer } from './image-optimizer.js';

export interface CloudinaryUploadOptions {
  destinationPath?: string;
  folder?: string;
  publicId?: string;
}

export class CloudinaryStorageAdapter implements IStoragePort {
  private get cloudName(): string {
    return process.env.CLOUDINARY_CLOUD_NAME || '';
  }

  private get apiKey(): string {
    return process.env.CLOUDINARY_API_KEY || '';
  }

  private get apiSecret(): string {
    return process.env.CLOUDINARY_API_SECRET || '';
  }

  public isConfigured(): boolean {
    const cn = this.cloudName;
    const ak = this.apiKey;
    const as = this.apiSecret;
    return Boolean(
      cn &&
      cn !== 'your-cloudinary-name' &&
      ak &&
      ak !== 'your-cloudinary-key' &&
      as &&
      as !== 'your-cloudinary-secret'
    );
  }

  /**
   * Mengunggah buffer gambar secara aman ke Cloudinary menggunakan REST API (Multipart).
   */
  public async uploadBuffer(
    buffer: Buffer,
    options: Partial<UploadStreamOptions> & CloudinaryUploadOptions = {}
  ): Promise<{ publicUrl: string; sizeBytes?: number }> {
    if (!this.isConfigured()) {
      throw new Error('[Cloudinary] Kredensial Cloudinary belum dikonfigurasi di environment.');
    }

    const timestamp = Math.floor(Date.now() / 1000);
    const folder = options.folder || 'polaris/social';

    const paramsToSign: Record<string, string> = {
      folder,
      timestamp: String(timestamp),
    };

    if (options.publicId) {
      paramsToSign.public_id = options.publicId;
    }

    // Cloudinary signature: parameter berurutan secara alfabetis + api_secret
    const sortedKeys = Object.keys(paramsToSign).sort();
    const stringToSign = sortedKeys.map((k) => `${k}=${paramsToSign[k]}`).join('&') + this.apiSecret;
    const signature = crypto.createHash('sha1').update(stringToSign).digest('hex');

    const mime = options.contentType || 'image/jpeg';
    const base64Data = `data:${mime};base64,${buffer.toString('base64')}`;

    const formData = new FormData();
    formData.append('file', base64Data);
    formData.append('api_key', this.apiKey);
    formData.append('timestamp', String(timestamp));
    formData.append('signature', signature);
    formData.append('folder', folder);

    if (options.publicId) {
      formData.append('public_id', options.publicId);
    }

    const endpoint = `https://api.cloudinary.com/v1_1/${this.cloudName}/image/upload`;
    const res = await fetch(endpoint, {
      method: 'POST',
      body: formData,
    });

    const data = (await res.json().catch(() => ({}))) as any;

    if (!res.ok || !data.secure_url) {
      const errMsg = data.error?.message || `HTTP ${res.status}: Gagal mengunggah gambar ke Cloudinary`;
      throw new Error(`[CloudinaryError] ${errMsg}`);
    }

    return {
      publicUrl: data.secure_url,
      sizeBytes: data.bytes || buffer.length,
    };
  }

  /**
   * Mengunggah gambar dari URL sumber (misal DALL-E) langsung ke Cloudinary
   */
  public async uploadFromUrl(
    sourceUrl: string,
    destinationPath: string
  ): Promise<{ publicUrl: string; sizeBytes: number }> {
    let rawBuffer: Buffer;
    if (sourceUrl.startsWith('data:')) {
      const base64Part = sourceUrl.split(',')[1] || '';
      rawBuffer = Buffer.from(base64Part, 'base64');
    } else {
      const response = await fetch(sourceUrl);
      if (!response.ok) {
        throw new Error(`[CloudinaryFetchError] Gagal mengunduh aset dari URL: ${response.statusText}`);
      }
      const arrayBuffer = await response.arrayBuffer();
      rawBuffer = Buffer.from(arrayBuffer);
    }

    const optimized = await ImageOptimizer.optimizePosterBuffer(rawBuffer);

    const folder = 'polaris/posters';
    const cleanName = destinationPath
      .replace(/^\//, '')
      .replace(/[^a-zA-Z0-9_-]/g, '_')
      .replace(/\.[^/.]+$/, '');

    const uploaded = await this.uploadBuffer(optimized.buffer, {
      destinationPath,
      folder,
      publicId: cleanName,
      contentType: optimized.mimeType,
      contentLength: optimized.sizeBytes,
    });

    return {
      publicUrl: uploaded.publicUrl,
      sizeBytes: optimized.sizeBytes,
    };
  }

  public async deleteFile(destinationPath: string): Promise<void> {
    // Implementasi opsional destroy aset Cloudinary jika dibutuhkan
  }
}
