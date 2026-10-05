import { Queue } from 'bullmq';
import { redisConnection } from '../config/redis.connection.js';

export const DALLE_QUEUE_NAME = 'dalle-image-processing-queue';

export interface DalleJobPayload {
  publicationId: string;
  tenantId: string;
  temporaryImageUrl: string;
  promptUsed: string;
  articleSlug: string;
}

export const dalleQueue = new Queue<DalleJobPayload>(DALLE_QUEUE_NAME, {
  connection: redisConnection,
  defaultJobOptions: {
    attempts: 3, // Coba ulang maksimal 3 kali jika terjadi gangguan jaringan
    backoff: {
      type: 'exponential',
      delay: 2000, // 2s, 4s, 8s
    },
    removeOnComplete: {
      count: 100, // Simpan 100 riwayat tugas terakhir untuk log
    },
    removeOnFail: {
      count: 500, // Simpan tugas gagal untuk investigasi
    },
  },
});
