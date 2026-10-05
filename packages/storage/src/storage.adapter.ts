import { PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { IStoragePort, UploadStreamOptions } from '@polaris/core-domain';
import { r2Client, R2_CONFIG } from './r2.client.js';
import { ImageOptimizer } from './image-optimizer.js';

export class CloudflareR2StorageAdapter implements IStoragePort {
  /**
   * uploadFromUrl menyedot gambar sementara dari OpenAI DALL-E 3,
   * mengompresnya ke WebP, dan menyimpannya secara permanen ke R2.
   */
  public async uploadFromUrl(
    sourceUrl: string,
    destinationPath: string
  ): Promise<{ publicUrl: string; sizeBytes: number }> {
    // 1. Fetch binary data dari URL sementara DALL-E
    const response = await fetch(sourceUrl);
    if (!response.ok) {
      throw new Error(`[StorageFetchError] Gagal mengunduh aset dari URL: ${response.statusText}`);
    }

    const arrayBuffer = await response.arrayBuffer();
    const rawBuffer = Buffer.from(arrayBuffer);

    // 2. Kompresi otomatis menggunakan Sharp ke format WebP
    const optimized = await ImageOptimizer.optimizePosterBuffer(rawBuffer);

    // 3. Pastikan ekstensi file di path tujuan berakhiran .webp
    const finalPath = destinationPath.endsWith('.webp') 
      ? destinationPath 
      : `${destinationPath.replace(/\.[^/.]+$/, '')}.webp`;

    // 4. Unggah buffer teroptimasi ke Cloudflare R2
    const command = new PutObjectCommand({
      Bucket: R2_CONFIG.bucketName,
      Key: finalPath,
      Body: optimized.buffer,
      ContentType: optimized.mimeType,
      ContentLength: optimized.sizeBytes,
    });

    await r2Client.send(command);

    // 5. Kembalikan URL publik yang dapat diakses pengunjung
    const cleanPublicBaseUrl = R2_CONFIG.publicBaseUrl.replace(/\/$/, '');
    const cleanFinalPath = finalPath.replace(/^\//, '');

    return {
      publicUrl: `${cleanPublicBaseUrl}/${cleanFinalPath}`,
      sizeBytes: optimized.sizeBytes,
    };
  }

  /**
   * uploadBuffer mengunggah file buffer generik ke Cloudflare R2
   */
  public async uploadBuffer(
    buffer: Buffer,
    options: UploadStreamOptions
  ): Promise<{ publicUrl: string }> {
    const command = new PutObjectCommand({
      Bucket: R2_CONFIG.bucketName,
      Key: options.destinationPath,
      Body: buffer,
      ContentType: options.contentType,
      ContentLength: options.contentLength || buffer.length,
    });

    await r2Client.send(command);

    const cleanPublicBaseUrl = R2_CONFIG.publicBaseUrl.replace(/\/$/, '');
    const cleanFinalPath = options.destinationPath.replace(/^\//, '');

    return {
      publicUrl: `${cleanPublicBaseUrl}/${cleanFinalPath}`,
    };
  }

  /**
   * deleteFile menghapus aset dari Cloudflare R2
   */
  public async deleteFile(destinationPath: string): Promise<void> {
    const command = new DeleteObjectCommand({
      Bucket: R2_CONFIG.bucketName,
      Key: destinationPath,
    });

    await r2Client.send(command);
  }
}
