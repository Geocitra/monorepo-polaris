import { Queue } from 'bullmq';
import { redisConnection } from '../config/redis.connection.js';

export const RECONCILIATION_QUEUE_NAME = 'financial-reconciliation-queue';

export interface ReconciliationJobPayload {
  reconDate: string; // 'YESTERDAY' atau format 'YYYY-MM-DD'
  triggeredBy: 'SYSTEM_CRON' | 'MANUAL_SUPERADMIN';
  adminId?: string;
  csvContent?: string;
}

export const reconciliationQueue = new Queue<ReconciliationJobPayload>(
  RECONCILIATION_QUEUE_NAME,
  {
    connection: redisConnection,
    defaultJobOptions: {
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: 10000,
      },
      removeOnComplete: { count: 60 },
      removeOnFail: { count: 120 },
    },
  }
);

export async function registerScheduledReconciliationJobs() {
  // Jadwal otomatis setiap pukul 01.30 WIB (Pola cron: 30 menit, jam 1 dini hari)
  await reconciliationQueue.add(
    'daily-reconciliation-audit',
    {
      reconDate: 'YESTERDAY',
      triggeredBy: 'SYSTEM_CRON',
    },
    {
      repeat: {
        pattern: '30 1 * * *',
      },
    }
  );

  console.log('[ReconciliationQueue] Cron harian audit kas Midtrans (01.30 WIB) aktif di Redis.');
}
