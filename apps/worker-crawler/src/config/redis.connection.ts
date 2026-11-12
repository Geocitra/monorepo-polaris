import { Redis } from 'ioredis';
import * as dotenv from 'dotenv';

import * as path from 'path';

dotenv.config();
dotenv.config({ path: path.resolve(process.cwd(), '.env') });
dotenv.config({ path: path.resolve(process.cwd(), '../../.env') });

const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';

/**
 * redisConnection adalah instance koneksi Redis bersama untuk BullMQ
 */
export const redisConnection = new Redis(redisUrl, {
  maxRetriesPerRequest: null, // Wajib diset null untuk BullMQ v5
  enableReadyCheck: false,
  retryStrategy(times) {
    const delay = Math.min(times * 50, 2000);
    return delay;
  },
});

redisConnection.on('error', (err) => {
  console.error('[RedisConnectionError] Kegagalan koneksi Redis:', err.message);
});

redisConnection.on('connect', () => {
  console.log('[RedisConnection] Berhasil terhubung ke Redis Server (Local/WSL).');
});
