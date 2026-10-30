import sharp from 'sharp';
import * as fs from 'node:fs';
import * as path from 'node:path';
import { CloudflareR2StorageAdapter } from './storage.adapter.js';
import { CloudinaryStorageAdapter } from './cloudinary.adapter.js';

export interface FormattedMediaResult {
  formattedUrl: string;
  width: number;
  height: number;
  sizeBytes: number;
  mimeType: 'image/jpeg';
}

export interface FormatForFeedParams {
  sourceUrl: string;
  tenantId: string;
  jobId: string;
  framingMode?: 'crop' | 'blur';
}

export class InstagramMediaFormatter {
  private static readonly storage = new CloudflareR2StorageAdapter();

  // Dimensi optimal feed portrait Instagram: Rasio 4:5 (1080 x 1350 px)
  public static readonly TARGET_WIDTH = 1080;
  public static readonly TARGET_HEIGHT = 1350;
  public static readonly TARGET_ASPECT_RATIO = 4 / 5; // 0.8

  public static async formatForFeed(params: FormatForFeedParams): Promise<FormattedMediaResult> {
    const framingMode = params.framingMode || 'crop';

    // 1. Download buffer gambar asli
    let inputBuffer: Buffer;
    if (params.sourceUrl.startsWith('data:')) {
      const base64Data = params.sourceUrl.split(',')[1] || '';
      inputBuffer = Buffer.from(base64Data, 'base64');
    } else if (params.sourceUrl.startsWith('http://') || params.sourceUrl.startsWith('https://')) {
      const res = await fetch(params.sourceUrl);
      if (!res.ok) {
        throw new Error(`[InstagramMediaFormatter] Gagal mengunduh gambar sumber: ${res.statusText}`);
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
        throw new Error(`[InstagramMediaFormatter] Berkas gambar lokal tidak ditemukan: ${params.sourceUrl}`);
      }
      inputBuffer = fs.readFileSync(foundPath);
    }

    let outputBuffer: Buffer;

    if (framingMode === 'blur') {
      // ========================================================
      // MODE BLUR: Pertahankan gambar utuh dengan latar blur senada
      // ========================================================
      const blurredBackdrop = await sharp(inputBuffer)
        .resize(this.TARGET_WIDTH, this.TARGET_HEIGHT, { fit: 'cover', position: 'center' })
        .blur(35)
        .modulate({ brightness: 0.6, saturation: 1.15 })
        .toBuffer();

      const foregroundImage = await sharp(inputBuffer)
        .resize(this.TARGET_WIDTH, this.TARGET_HEIGHT, { fit: 'contain' })
        .toBuffer();

      outputBuffer = await sharp(blurredBackdrop)
        .composite([{ input: foregroundImage, gravity: 'center' }])
        .jpeg({ quality: 92, mozjpeg: true })
        .toBuffer();
    } else {
      // ========================================================
      // MODE CROP (DEFAULT): Full-Bleed 4:5 mengisi 100% kanvas feed
      // ========================================================
      outputBuffer = await sharp(inputBuffer)
        .resize(this.TARGET_WIDTH, this.TARGET_HEIGHT, {
          fit: 'cover',
          position: 'center',
        })
        .jpeg({ quality: 92, mozjpeg: true })
        .toBuffer();
    }

    // 3. Simpan ke Cloudflare R2 atau Local Storage terlayani via Tunnel
    const filename = `${Date.now()}-${params.jobId}.jpg`;

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
        const safePublicId = `ig_${Date.now()}_${params.jobId}`.replace(/[^a-zA-Z0-9_-]/g, '_');
        const uploadResult = await cloudinary.uploadBuffer(outputBuffer, {
          folder: `polaris/social/${params.tenantId}`,
          publicId: safePublicId,
          contentType: 'image/jpeg',
          contentLength: outputBuffer.length,
        });
        formattedUrl = uploadResult.publicUrl;
      } catch (cldErr: any) {
        console.warn(`[InstagramMediaFormatter] Gagal upload Cloudinary: ${cldErr.message}. Beralih ke fallback R2/Local.`);
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
        console.warn(`[InstagramMediaFormatter] Gagal upload R2: ${err.message}. Beralih ke local storage tunnel.`);
      }
    }

    // 3c. Fallback terakhir ke Local Storage terlayani via tunnel
    if (!formattedUrl) {
      formattedUrl = this.saveToLocalTunnelStorage(outputBuffer, filename);
    }

    return {
      formattedUrl,
      width: this.TARGET_WIDTH,
      height: this.TARGET_HEIGHT,
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
      process.env.INSTAGRAM_REDIRECT_URI ||
      'https://island-sum-fixtures-managing.trycloudflare.com/api/v1/social/instagram/callback';

    const origin = new URL(redirectUri).origin;
    return `${origin}/api/v1/social/instagram/media/${filename}`;
  }
}
