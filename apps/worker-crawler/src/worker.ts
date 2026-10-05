import { Worker } from 'bullmq';
import { redisConnection } from './config/redis.connection.js';
import { DALLE_QUEUE_NAME, DalleJobPayload } from './queues/dalle.queue.js';
import { SCRAPER_QUEUE_NAME, registerScheduledCrawlers } from './queues/scraper.queue.js';
import { 
  MAINTENANCE_QUEUE_NAME, 
  MaintenanceJobPayload, 
  registerScheduledMaintenanceJobs 
} from './queues/maintenance.queue.js';
import { processDalleStreamJob } from './processors/dalle-stream.processor.js';
import { NewsCrawlerProcessor, ScraperJobPayload } from './processors/news-crawler.processor.js';
import { BillingMaintenanceProcessor } from './processors/billing-maintenance.processor.js';
import { STUDIO_GENERATION_QUEUE_NAME, StudioGenerationJobPayload } from './queues/studio.queue.js';
import { StudioGenerationProcessor } from './processors/studio-generation.processor.js';
import {
  RECONCILIATION_QUEUE_NAME,
  ReconciliationJobPayload,
  registerScheduledReconciliationJobs,
} from './queues/reconciliation.queue.js';
import { ReconciliationProcessor } from './processors/reconciliation.processor.js';

console.log('====================================================');
console.log(' POLARIS ASYNCHRONOUS BACKGROUND DAEMON WORKER     ');
console.log('====================================================');

// 1. Worker Antrean Render Poster DALL-E 3 (Concurrency 5)
const dalleWorker = new Worker<DalleJobPayload>(
  DALLE_QUEUE_NAME,
  async (job) => {
    return await processDalleStreamJob(job);
  },
  { connection: redisConnection, concurrency: 5 }
);

dalleWorker.on('completed', (job, result) => {
  console.log(`[Worker DALL-E] Tugas #${job.id} tuntas. URL: ${result.assetUrl}`);
});

dalleWorker.on('failed', (job, err) => {
  console.error(`[Worker DALL-E] Tugas #${job?.id} gagal: ${err.message}`);
});

// 2. Worker Antrean Penyerapan Berita Daerah (Concurrency 2)
const scraperWorker = new Worker<ScraperJobPayload>(
  SCRAPER_QUEUE_NAME,
  async (job) => {
    return await NewsCrawlerProcessor.processFeedScraping(job.data);
  },
  { connection: redisConnection, concurrency: 2 }
);

scraperWorker.on('completed', (job, result) => {
  console.log(`[Worker Scraper] Tugas #${job.id} selesai. Berita baru: ${result.insertedCount}`);
});

scraperWorker.on('failed', (job, err) => {
  console.warn(`[Worker Scraper] Tugas #${job?.id} dilewati/gagal: ${err.message}`);
});

// 3. Worker Pemeliharaan Billing & Kuota (Concurrency 1 - Sekuensial)
const maintenanceWorker = new Worker<MaintenanceJobPayload>(
  MAINTENANCE_QUEUE_NAME,
  async (job) => {
    if (job.data.taskType === 'AUDIT_SUBSCRIPTIONS') {
      return await BillingMaintenanceProcessor.processSubscriptionLifecycle();
    }
    if (job.data.taskType === 'ROLLOVER_QUOTAS') {
      return await BillingMaintenanceProcessor.processMonthlyQuotaRollover();
    }
  },
  { connection: redisConnection, concurrency: 1 }
);

maintenanceWorker.on('completed', (job) => {
  console.log(`[Worker Maintenance] Tugas ${job.data.taskType} #${job.id} selesai dijalankan.`);
});

maintenanceWorker.on('failed', (job, err) => {
  console.error(`[Worker Maintenance] Tugas #${job?.id} gagal: ${err.message}`);
});

// 4. Worker Pemrosesan Konten AI Studio Asinkron (Concurrency 3)
const studioWorker = new Worker<StudioGenerationJobPayload>(
  STUDIO_GENERATION_QUEUE_NAME,
  async (job) => {
    return await StudioGenerationProcessor.process(job);
  },
  { connection: redisConnection, concurrency: 3 }
);

studioWorker.on('completed', (job) => {
  console.log(`[Worker Studio] Tugas #${job.id} selesai diproses.`);
});

studioWorker.on('failed', (job, err) => {
  console.error(`[Worker Studio] Tugas #${job?.id} gagal: ${err.message}`);
});

// 5. Worker Audit Rekonsiliasi Kas Midtrans (Concurrency 1 - Sekuensial Atomik)
const reconWorker = new Worker<ReconciliationJobPayload>(
  RECONCILIATION_QUEUE_NAME,
  async (job) => {
    return await ReconciliationProcessor.process(job);
  },
  { connection: redisConnection, concurrency: 1 }
);

reconWorker.on('completed', (job) => {
  console.log(`[Worker Recon] Audit rekonsiliasi #${job.id} selesai.`);
});

reconWorker.on('failed', (job, err) => {
  console.error(`[Worker Recon] Audit rekonsiliasi #${job?.id} gagal: ${err.message}`);
});

// Inisialisasi Seluruh Penjadwalan Cron ke Redis
async function initSchedulers() {
  await registerScheduledCrawlers();
  await registerScheduledMaintenanceJobs();
  await registerScheduledReconciliationJobs();
}

initSchedulers().catch((err) => {
  console.error('[Worker Scheduler] Gagal mendaftarkan cron:', err.message);
});

// Penanganan Graceful Shutdown
async function shutdown(signal: string) {
  console.log(`\n[Worker Shutdown] Menerima sinyal ${signal}. Menutup seluruh worker antrean...`);
  await dalleWorker.close();
  await scraperWorker.close();
  await maintenanceWorker.close();
  await studioWorker.close();
  await reconWorker.close();
  await redisConnection.quit();
  console.log('[Worker Shutdown] Seluruh background worker berhasil dimatikan dengan aman. Keluar.');
  process.exit(0);
}

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
