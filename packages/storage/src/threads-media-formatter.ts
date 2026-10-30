import sharp from 'sharp';
import * as fs from 'node:fs';
import * as path from 'node:path';
import { CloudflareR2StorageAdapter } from './storage.adapter.js';
import { CloudinaryStorageAdapter } from './cloudinary.adapter.js';

export interface FormattedThreadsMediaResult {
  formattedUrl: string;
  width: number;
  height: number;
  sizeBytes: number;
  mimeType: 'image/jpeg';
}

export interface FormatForThreadsParams {
  sourceUrl: string;
  tenantId: string;
  jobId: string;
}

export class ThreadsMediaFormatter {
  private static readonly storage = new CloudflareR2StorageAdapter();

  public static async formatForThreads(
    params: FormatForThreadsParams
  ): Promise<FormattedThreadsMediaResult> {
    // 1. Download buffer gambar asli
    let inputBuffer: Buffer;
    if (params.sourceUrl.startsWith('data:')) {
      const base64Data = params.sourceUrl.split(',')[1] || '';
      inputBuffer = Buffer.from(base64Data, 'base64');
    } else if (params.sourceUrl.startsWith('http://') || params.sourceUrl.startsWith('https://')) {
      const res = await fetch(params.sourceUrl);
      if (!res.ok) {
        throw new Error(`[ThreadsMediaFormatter] Gagal mengunduh gambar sumber: ${res.statusText}`);
      }
      inputBuffer = Buffer.from(await res.arrayBuffer());
    } else {
      // Relative path local
      const searchDirs = [
        path.resolve(process.cwd(), params.sourceUrl.replace(/^\//, '')),
        path.resolve(process.cwd(), 'uploads', params.sourceUrl.replace(/^\/uploads\//, '')),
        path.resolve('/home/pc/projects/polaris-platform', params.sourceUrl.replace(/^\//, '')),
      ];
      let foundPath: string | null = null;
      for (const p of searchDirs) {
        if (fs.existsSync(p)) {
          foundPath = p;
          break;
        }
      }
      if (!foundPath) {
        throw new Error(`[ThreadsMediaFormatter] Berkas gambar lokal tidak ditemukan: ${params.sourceUrl}`);
      }
      inputBuffer = fs.readFileSync(foundPath);
    }

    // 2. Metadata & resize jika ukuran terlalu ekstrem (> 2048px)
    const metadata = await sharp(inputBuffer).metadata();
    let sharpInstance = sharp(inputBuffer);

    if (metadata.width && metadata.width > 2048) {
      sharpInstance = sharpInstance.resize({ width: 2048, withoutEnlargement: true });
    }

    const outputBuffer = await sharpInstance
      .jpeg({ quality: 92, mozjpeg: true })
      .toBuffer();

    const outMeta = await sharp(outputBuffer).metadata();

    // 3. Simpan ke Cloudflare R2 atau Local Tunnel Storage
    const filename = `threads-${Date.now()}-${params.jobId}.jpg`;

    let formattedUrl: string | null = null;
    const cloudinary = new CloudinaryStorageAdapter();
    const isCloudinaryConfigured = cloudinary.isConfigured();

    const isR2Configured =
      process.env.R2_ACCOUNT_ID &&
      process.env.R2_ACCOUNT_ID !== 'your-cf-account-id' &&
      process.env.R2_ACCOUNT_ID !== 'mock-account-id' &&
      process.env.R2_ACCESS_KEY_ID &&
      process.env.R2_ACCESS_KEY_ID !== 'your-r2-access-key';

    // 3a. Prioritaskan Cloudinary untuk CDN publik berkecepatan tinggi
    if (isCloudinaryConfigured) {
      try {
        const safePublicId = `threads_${Date.now()}_${params.jobId}`.replace(/[^a-zA-Z0-9_-]/g, '_');
        const uploadResult = await cloudinary.uploadBuffer(outputBuffer, {
          folder: `polaris/social/${params.tenantId}`,
          publicId: safePublicId,
          contentType: 'image/jpeg',
          contentLength: outputBuffer.length,
        });
        formattedUrl = uploadResult.publicUrl;
      } catch (cldErr: any) {
        console.warn(`[ThreadsMediaFormatter] Gagal upload Cloudinary: ${cldErr.message}. Beralih ke fallback R2/Local.`);
      }
    }

    // 3b. Fallback ke Cloudflare R2
    if (!formattedUrl && isR2Configured) {
      try {
        const destinationPath = `social/${params.tenantId}/${filename}`;
        const uploadResult = await this.storage.uploadBuffer(outputBuffer, {
          destinationPath,
          contentType: 'image/jpeg',
          contentLength: outputBuffer.length,
        });
        formattedUrl = uploadResult.publicUrl;
      } catch (err: any) {
        console.warn(`[ThreadsMediaFormatter] Gagal upload R2: ${err.message}. Beralih ke local storage tunnel.`);
      }
    }

    // 3c. Fallback terakhir ke Local Storage terlayani via tunnel
    if (!formattedUrl) {
      formattedUrl = this.saveToLocalTunnelStorage(outputBuffer, filename);
    }

    return {
      formattedUrl,
      width: outMeta.width || 1080,
      height: outMeta.height || 1350,
      sizeBytes: outputBuffer.length,
      mimeType: 'image/jpeg',
    };
  }

  private static saveToLocalTunnelStorage(buffer: Buffer, filename: string): string {
    const searchDirs = [
      path.resolve(process.cwd(), 'uploads/social'),
      path.resolve(process.cwd(), '../../uploads/social'),
      '/home/pc/projects/polaris-platform/uploads/social',
    ];

    let targetDir = '/home/pc/projects/polaris-platform/uploads/social';
    for (const d of searchDirs) {
      if (fs.existsSync(d)) {
        targetDir = d;
        break;
      }
    }

    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true });
    }

    const filePath = path.join(targetDir, filename);
    fs.writeFileSync(filePath, buffer);

    const redirectUri =
      process.env.THREADS_REDIRECT_URI ||
      process.env.INSTAGRAM_REDIRECT_URI ||
      'https://island-sum-fixtures-managing.trycloudflare.com';

    const origin = new URL(redirectUri).origin;
    return `${origin}/api/v1/social/threads/media/${filename}`;
  }
}
