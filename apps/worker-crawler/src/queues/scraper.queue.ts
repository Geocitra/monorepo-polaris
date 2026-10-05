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

const VERIFIED_NEWS_FEEDS = [
  {
    id: 'antara-jabar-terkini',
    regionScope: 'JAWA_BARAT',
    sourceName: 'ANTARA News Jawa Barat',
    feedUrl: 'https://jabar.antaranews.com/rss/jabar-terkini.xml',
  },
  {
    id: 'antara-nasional-politik',
    regionScope: 'NASIONAL',
    sourceName: 'ANTARA News Politik',
    feedUrl: 'https://www.antaranews.com/rss/politik.xml',
  },
  {
    id: 'antara-nasional-hukum',
    regionScope: 'NASIONAL',
    sourceName: 'ANTARA News Hukum',
    feedUrl: 'https://www.antaranews.com/rss/hukum.xml',
  },
  {
    id: 'antara-nasional-ekonomi',
    regionScope: 'NASIONAL',
    sourceName: 'ANTARA News Ekonomi',
    feedUrl: 'https://www.antaranews.com/rss/ekonomi.xml',
  },
  {
    id: 'detik-nasional',
    regionScope: 'NASIONAL',
    sourceName: 'Detik News',
    feedUrl: 'https://news.detik.com/berita/rss',
  },
  {
    id: 'detik-finance',
    regionScope: 'NASIONAL',
    sourceName: 'Detik Finance',
    feedUrl: 'https://finance.detik.com/rss',
  },
  {
    id: 'detik-jabar',
    regionScope: 'JAWA_BARAT',
    sourceName: 'Detik Jawa Barat',
    feedUrl: 'https://www.detik.com/jabar/berita/rss',
  },
  {
    id: 'detik-jateng',
    regionScope: 'JAWA_TENGAH',
    sourceName: 'Detik Jawa Tengah',
    feedUrl: 'https://www.detik.com/jateng/berita/rss',
  },
  {
    id: 'detik-jatim',
    regionScope: 'JAWA_TIMUR',
    sourceName: 'Detik Jawa Timur',
    feedUrl: 'https://www.detik.com/jatim/berita/rss',
  },
  {
    id: 'detik-sulsel',
    regionScope: 'SULAWESI_SELATAN',
    sourceName: 'Detik Sulawesi Selatan',
    feedUrl: 'https://www.detik.com/sulsel/berita/rss',
  },
  {
    id: 'detik-sumut',
    regionScope: 'SUMATERA_UTARA',
    sourceName: 'Detik Sumatera Utara',
    feedUrl: 'https://www.detik.com/sumut/berita/rss',
  },
  {
    id: 'cnn-indonesia',
    regionScope: 'NASIONAL',
    sourceName: 'CNN Indonesia',
    feedUrl: 'https://www.cnnindonesia.com/rss/',
  },
  {
    id: 'katadata',
    regionScope: 'NASIONAL',
    sourceName: 'Katadata',
    feedUrl: 'https://katadata.co.id/rss',
  },
] satisfies Array<ScraperJobPayload & { id: string }>;

/**
 * Register verified RSS feeds and remove obsolete recurring crawler jobs.
 */
export async function registerScheduledCrawlers() {
  const scheduledFeedNames = new Set(VERIFIED_NEWS_FEEDS.map(({ id }) => `crawl-${id}`));
  const repeatableJobs = await scraperQueue.getRepeatableJobs();
  for (const repeatableJob of repeatableJobs) {
    if (repeatableJob.name.startsWith('crawl-') && !scheduledFeedNames.has(repeatableJob.name)) {
      await scraperQueue.removeRepeatableByKey(repeatableJob.key);
    }
  }

  for (const { id, ...feed } of VERIFIED_NEWS_FEEDS) {
    const jobName = `crawl-${id}`;
    await scraperQueue.add(jobName, feed, {
      repeat: {
        pattern: '0 3,11,17 * * *',
        tz: 'Asia/Jakarta',
      },
    });

    await scraperQueue.add(`initial-${id}`, feed, {
      jobId: `init-${id}-${new Date().toISOString().slice(0, 10)}`,
    });
  }

  console.log(`[ScraperQueue] ${VERIFIED_NEWS_FEEDS.length} feed berita terverifikasi dijadwalkan.`);
}
