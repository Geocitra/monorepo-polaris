import { PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { IStoragePort, UploadStreamOptions } from '@polaris/core-domain';
import * as fs from 'fs';
import * as path from 'path';
import { r2Client, R2_CONFIG } from './r2.client.js';
import { ImageOptimizer } from './image-optimizer.js';

function saveBufferLocally(buffer: Buffer, relativePath: string): string {
  try {
    const cleanPath = relativePath.replace(/^\//, '');
    const possibleRoots = [
      path.resolve(process.cwd(), 'uploads'),
      path.resolve(process.cwd(), '../../uploads'),
      '/home/pc/projects/polaris-platform/uploads',
    ];
    let written = false;
    for (const root of possibleRoots) {
      try {
        const fullPath = path.resolve(root, cleanPath);
        fs.mkdirSync(path.dirname(fullPath), { recursive: true });
        fs.writeFileSync(fullPath, buffer);
        written = true;
      } catch {
        // coba root berikutnya
      }
    }
    const publicHost = process.env.NEXT_PUBLIC_API_URL
      ? process.env.NEXT_PUBLIC_API_URL.replace(/\/api\/v1\/?$/, '')
      : 'http://localhost:4000';
    return `${publicHost}/uploads/${cleanPath}`;
  } catch (err) {
    return `data:image/webp;base64,${buffer.toString('base64')}`;
  }
}

function isDummyR2Account(): boolean {
  const accountId = process.env.R2_ACCOUNT_ID || '';
  return !accountId || accountId.includes('your-cf-') || accountId.includes('mock-');
}

export class CloudflareR2StorageAdapter implements IStoragePort {
  /**
   * uploadFromUrl menyedot gambar sementara dari OpenAI DALL-E 3,
   * mengompresnya ke WebP, dan menyimpannya secara permanen ke R2 atau penyimpanan lokal.
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
        throw new Error(`[StorageFetchError] Gagal mengunduh aset dari URL: ${response.statusText}`);
      }
      const arrayBuffer = await response.arrayBuffer();
      rawBuffer = Buffer.from(arrayBuffer);
    }

    // 2. Kompresi otomatis menggunakan Sharp ke format WebP
    const optimized = await ImageOptimizer.optimizePosterBuffer(rawBuffer);

    // 3. Pastikan ekstensi file di path tujuan berakhiran .webp
    const finalPath = destinationPath.endsWith('.webp') 
      ? destinationPath 
      : `${destinationPath.replace(/\.[^/.]+$/, '')}.webp`;
    const cleanFinalPath = finalPath.replace(/^\//, '');

    // 4. Unggah buffer teroptimasi ke Cloudflare R2 jika kredensial aktif
    if (!isDummyR2Account()) {
      try {
        const command = new PutObjectCommand({
          Bucket: R2_CONFIG.bucketName,
          Key: cleanFinalPath,
          Body: optimized.buffer,
          ContentType: optimized.mimeType,
          ContentLength: optimized.sizeBytes,
        });

        await r2Client.send(command);

        const cleanPublicBaseUrl = R2_CONFIG.publicBaseUrl.replace(/\/$/, '');
        return {
          publicUrl: `${cleanPublicBaseUrl}/${cleanFinalPath}`,
          sizeBytes: optimized.sizeBytes,
        };
      } catch (r2Err) {
        console.warn(`[StorageAdapter] R2 uploadFromUrl gagal, beralih ke penyimpanan lokal:`, r2Err);
      }
    }

    // Fallback: simpan ke disk lokal
    const localUrl = saveBufferLocally(optimized.buffer, cleanFinalPath);
    return {
      publicUrl: localUrl,
      sizeBytes: optimized.sizeBytes,
    };
  }

  /**
   * uploadBuffer mengunggah file buffer generik ke Cloudflare R2 atau fallback lokal
   */
  public async uploadBuffer(
    buffer: Buffer,
    options: UploadStreamOptions
  ): Promise<{ publicUrl: string }> {
    const cleanFinalPath = options.destinationPath.replace(/^\//, '');

    if (!isDummyR2Account()) {
      try {
        const command = new PutObjectCommand({
          Bucket: R2_CONFIG.bucketName,
          Key: cleanFinalPath,
          Body: buffer,
          ContentType: options.contentType,
          ContentLength: options.contentLength || buffer.length,
        });

        await r2Client.send(command);

        const cleanPublicBaseUrl = R2_CONFIG.publicBaseUrl.replace(/\/$/, '');
        return {
          publicUrl: `${cleanPublicBaseUrl}/${cleanFinalPath}`,
        };
      } catch (r2Err) {
        console.warn(`[StorageAdapter] R2 uploadBuffer gagal, beralih ke penyimpanan lokal:`, r2Err);
      }
    }

    // Fallback: simpan ke disk lokal
    const localUrl = saveBufferLocally(buffer, cleanFinalPath);
    return {
      publicUrl: localUrl,
    };
  }

  /**
   * deleteFile menghapus aset dari Cloudflare R2
   */
  public async deleteFile(destinationPath: string): Promise<void> {
    if (!isDummyR2Account()) {
      try {
        const command = new DeleteObjectCommand({
          Bucket: R2_CONFIG.bucketName,
          Key: destinationPath,
        });

        await r2Client.send(command);
      } catch (err) {
        console.warn(`[StorageAdapter] Gagal menghapus file dari R2:`, err);
      }
    }
  }
}
