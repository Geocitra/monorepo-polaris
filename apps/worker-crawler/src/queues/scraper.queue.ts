import { Queue } from 'bullmq';
import { redisConnection } from '../config/redis.connection.js';
import { ScraperJobPayload } from '../processors/news-crawler.processor.js';

export const SCRAPER_QUEUE_NAME = 'regional-news-crawler-queue';

export const scraperQueue = new Queue<ScraperJobPayload>(SCRAPER_QUEUE_NAME, {
  connection: redisConnection,
  defaultJobOptions: {
    attempts: 2,
    backoff: {
      type: 'fixed',
      delay: 5000,
    },
    removeOnComplete: { count: 50 },
    removeOnFail: { count: 100 },
  },
});

/**
 * registerScheduledCrawlers mendaftarkan antrean berkala ke Redis
 * Mengambil berita lokal secara proaktif 3 kali sehari (03:00, 11:00, 17:00 WIB)
 */
export async function registerScheduledCrawlers() {
  // Daftar feed berita daerah resmi & terverifikasi (Contoh: Wilayah Jabar & Nasional)
  const defaultFeeds: ScraperJobPayload[] = [
    {
      regionScope: 'KAB_CIREBON',
      sourceName: 'Radar Cirebon RSS',
      feedUrl: 'https://radarcirebon.disway.id/rss',
    },
    {
      regionScope: 'KOTA_BANDUNG',
      sourceName: 'Antara News Jabar',
      feedUrl: 'https://jabar.antaranews.com/rss/terkini.xml',
    },
    {
      regionScope: 'NASIONAL',
      sourceName: 'Antara News Nasional',
      feedUrl: 'https://www.antaranews.com/rss/terkini.xml',
    },
  ];

  for (const feed of defaultFeeds) {
    // Daftarkan sebagai tugas berulang (cron setiap 6 jam)
    await scraperQueue.add(`crawl-${feed.regionScope}`, feed, {
      repeat: {
        pattern: '0 3,11,17 * * *', // Jam 03:00, 11:00, 17:00 setiap hari
      },
    });

    // Pemicu awal instan saat daemon pertama kali menyala (Initial Bootstrap)
    await scraperQueue.add(`initial-crawl-${feed.regionScope}`, feed, {
      jobId: `init-${feed.regionScope}-${new Date().toISOString().slice(0, 10)}`,
    });
  }

  console.log('[ScraperQueue] Jadwal penyerapan berita daerah 3x sehari berhasil didaftarkan ke Redis.');
}
