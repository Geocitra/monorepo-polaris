import { SearchQuotaGuard } from '@polaris/ai-engine';
import { redisConnection } from '../config/redis.connection.js';

/**
 * Penjaga kuota harian Serper & Tavily di Redis agar tetap aman di bawah batas free tier (~1.500/bulan).
 */
export class RedisSearchQuotaGuard implements SearchQuotaGuard {
  public async tryConsume(provider: 'SERPER' | 'TAVILY'): Promise<boolean> {
    const defaultCap = provider === 'SERPER' ? 30 : 25;
    const envRaw =
      provider === 'SERPER'
        ? process.env.SERPER_DAILY_QUOTA_CAP
        : process.env.TAVILY_DAILY_QUOTA_CAP;
    const dailyCap = Math.max(0, Number.parseInt(envRaw || String(defaultCap), 10) || defaultCap);

    if (dailyCap <= 0) {
      return false;
    }

    const today = new Date().toISOString().slice(0, 10);
    const key = `polaris:search-quota:${provider}:${today}`;

    try {
      const count = await redisConnection.incr(key);
      if (count === 1) {
        await redisConnection.expire(key, 48 * 3600);
      }
      return count <= dailyCap;
    } catch (err: any) {
      console.warn(`[RedisSearchQuotaGuard] Gagal memeriksa kuota ${provider}: ${err?.message}`);
      return false;
    }
  }
}

export const redisSearchQuotaGuard = new RedisSearchQuotaGuard();

