import { Queue } from 'bullmq';
import { redisConnection } from '../config/redis.connection.js';

export const MAINTENANCE_QUEUE_NAME = 'billing-maintenance-queue';

export interface MaintenanceJobPayload {
  taskType: 'AUDIT_SUBSCRIPTIONS' | 'ROLLOVER_QUOTAS';
}

export const maintenanceQueue = new Queue<MaintenanceJobPayload>(MAINTENANCE_QUEUE_NAME, {
  connection: redisConnection,
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: 'fixed',
      delay: 10000,
    },
    removeOnComplete: { count: 30 },
    removeOnFail: { count: 100 },
  },
});

/**
 * registerScheduledMaintenanceJobs mendaftarkan cron pemeliharaan ke Redis
 */
export async function registerScheduledMaintenanceJobs() {
  // 1. Audit status langganan setiap malam jam 00:05 WIB
  await maintenanceQueue.add(
    'daily-subscription-audit',
    { taskType: 'AUDIT_SUBSCRIPTIONS' },
    {
      repeat: {
        pattern: '5 0 * * *', // Setiap hari pukul 00:05
      },
    }
  );

  // 2. Rollover kuota baru setiap tanggal 1 awal bulan jam 00:01 WIB
  await maintenanceQueue.add(
    'monthly-quota-rollover',
    { taskType: 'ROLLOVER_QUOTAS' },
    {
      repeat: {
        pattern: '1 0 1 * *', // Tanggal 1 setiap bulan pukul 00:01
      },
    }
  );

  // Trigger pemicu pemeriksaan awal saat worker pertama kali booting (Bootstrap Check)
  await maintenanceQueue.add(
    'bootstrap-subscription-audit',
    { taskType: 'AUDIT_SUBSCRIPTIONS' },
    { jobId: `bootstrap-audit-${new Date().toISOString().slice(0, 10)}` }
  );

  console.log('[MaintenanceQueue] Jadwal pemeliharaan billing harian & reset kuota bulanan aktif di Redis.');
}
