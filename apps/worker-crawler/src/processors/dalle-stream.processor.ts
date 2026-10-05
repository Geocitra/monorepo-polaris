import { Job } from 'bullmq';
import { eq } from 'drizzle-orm';
import { db, mediaAssets, contentPublications, withTenantContext } from '@polaris/database';
import { CloudflareR2StorageAdapter } from '@polaris/storage';
import { AssetType } from '@polaris/shared-types';
import { DalleJobPayload } from '../queues/dalle.queue.js';

const storageAdapter = new CloudflareR2StorageAdapter();

export async function processDalleStreamJob(job: Job<DalleJobPayload>): Promise<{ assetUrl: string }> {
  const { publicationId, tenantId, temporaryImageUrl, promptUsed, articleSlug } = job.data;

  console.log(`[DalleProcessor] Memproses tugas #${job.id} untuk publikasi ID: ${publicationId}...`);

  // 1. Tentukan path permanen di Cloudflare R2
  const timestamp = Date.now();
  const destinationPath = `posters/${tenantId}/${timestamp}-${articleSlug}.webp`;

  // 2. Stream & Kompresi WebP langsung ke Cloudflare R2 via Storage Adapter
  const uploadResult = await storageAdapter.uploadFromUrl(temporaryImageUrl, destinationPath);

  console.log(`[DalleProcessor] Berhasil mengunggah poster ke R2: ${uploadResult.publicUrl} (${uploadResult.sizeBytes} bytes)`);

  // 3. Simpan atau perbarui record di PostgreSQL (Atomic)
  await withTenantContext(tenantId, async (tx) => {
    // Masukkan record ke mediaAssets
    await tx.insert(mediaAssets).values({
      publicationId,
      assetType: AssetType.DALLE_POSTER,
      r2StorageUrl: uploadResult.publicUrl,
      cdnPublicUrl: uploadResult.publicUrl,
      promptUsed,
      mimeType: 'image/webp',
      fileSizeBytes: uploadResult.sizeBytes,
    });
  });

  return { assetUrl: uploadResult.publicUrl };
}
