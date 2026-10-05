import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { Redis } from 'ioredis';

export interface UserProgressEvent {
  jobId: string;
  percent: number;
  step: string;
  status: 'RUNNING' | 'COMPLETED' | 'FAILED';
  resultUrl?: string;
  data?: any;
  timestamp?: number;
}

export interface UserNotificationEvent {
  id: string;
  title: string;
  message: string;
  category?: 'ARTICLE' | 'EXPORT' | 'CRAWLER' | 'BILLING' | 'SYSTEM';
  link?: string;
  timestamp?: number;
}

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(RedisService.name);
  private client!: Redis;
  private subClient!: Redis;
  private channelHandlers = new Map<string, Set<(data: any) => void>>();

  onModuleInit() {
    const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
    this.logger.log(`Menghubungkan ke Redis instance: ${redisUrl}`);

    this.client = new Redis(redisUrl, {
      maxRetriesPerRequest: null,
      enableReadyCheck: false,
    });

    this.subClient = new Redis(redisUrl, {
      maxRetriesPerRequest: null,
      enableReadyCheck: false,
    });

    this.client.on('connect', () => this.logger.log('Redis Publisher Client terhubung.'));
    this.client.on('error', (err) => this.logger.error('Redis Publisher Error:', err));

    this.subClient.on('connect', () => this.logger.log('Redis Subscriber Client terhubung.'));
    this.subClient.on('error', (err) => this.logger.error('Redis Subscriber Error:', err));

    // Router sentral untuk pesan pub/sub yang masuk
    this.subClient.on('message', (channel, message) => {
      const handlers = this.channelHandlers.get(channel);
      if (handlers && handlers.size > 0) {
        try {
          const parsed = JSON.parse(message);
          handlers.forEach((fn) => fn(parsed));
        } catch {
          handlers.forEach((fn) => fn(message));
        }
      }
    });
  }

  async onModuleDestroy() {
    this.logger.log('Menutup koneksi Redis...');
    try {
      await this.subClient.quit();
      await this.client.quit();
    } catch (err) {
      this.logger.warn('Error saat menutup Redis:', err);
    }
  }

  /**
   * Publikasikan event ke channel Redis
   */
  async publish(channel: string, data: any): Promise<number> {
    const payload = typeof data === 'string' ? data : JSON.stringify(data);
    return this.client.publish(channel, payload);
  }

  /**
   * Subscribe ke channel Redis dengan callback handler
   */
  async subscribe(channel: string, handler: (data: any) => void): Promise<void> {
    let handlers = this.channelHandlers.get(channel);
    if (!handlers) {
      handlers = new Set();
      this.channelHandlers.set(channel, handlers);
      await this.subClient.subscribe(channel);
    }
    handlers.add(handler);
  }

  /**
   * Unsubscribe handler tertentu dari channel Redis
   */
  async unsubscribe(channel: string, handler: (data: any) => void): Promise<void> {
    const handlers = this.channelHandlers.get(channel);
    if (handlers) {
      handlers.delete(handler);
      if (handlers.size === 0) {
        this.channelHandlers.delete(channel);
        await this.subClient.unsubscribe(channel);
      }
    }
  }

  /**
   * Simpan cache key-value dengan opsi TTL (detik)
   */
  async set(key: string, value: any, ttlSeconds?: number): Promise<void> {
    const str = typeof value === 'string' ? value : JSON.stringify(value);
    if (ttlSeconds && ttlSeconds > 0) {
      await this.client.set(key, str, 'EX', ttlSeconds);
    } else {
      await this.client.set(key, str);
    }
  }

  /**
   * Ambil data dari cache Redis
   */
  async get<T = any>(key: string): Promise<T | null> {
    const data = await this.client.get(key);
    if (!data) return null;
    try {
      return JSON.parse(data) as T;
    } catch {
      return data as unknown as T;
    }
  }

  /**
   * Hapus key dari Redis
   */
  async del(key: string): Promise<number> {
    return this.client.del(key);
  }

  async incrementRateLimit(key: string, ttlSeconds: number): Promise<number> {
    if (!Number.isInteger(ttlSeconds) || ttlSeconds < 1) {
      throw new Error('Rate-limit TTL must be a positive integer.');
    }

    const result = await this.client.eval(
      "local count = redis.call('INCR', KEYS[1]); if count == 1 then redis.call('EXPIRE', KEYS[1], ARGV[1]); end; return count;",
      1,
      key,
      ttlSeconds
    );

    return Number(result);
  }

  /**
   * Helper Enterprise: Mengirim live progress job ke pengguna tertentu
   */
  async emitUserProgress(tenantId: string, progress: UserProgressEvent): Promise<void> {
    const channel = `realtime:progress:${tenantId}`;
    const payload: UserProgressEvent = {
      ...progress,
      timestamp: progress.timestamp || Date.now(),
    };
    await this.publish(channel, payload);
  }

  /**
   * Helper Enterprise: Mengirim notifikasi penting ke pengguna tertentu
   */
  async emitUserNotification(tenantId: string, notification: UserNotificationEvent): Promise<void> {
    const channel = `realtime:notifications:${tenantId}`;
    const payload: UserNotificationEvent = {
      ...notification,
      timestamp: notification.timestamp || Date.now(),
    };
    await this.publish(channel, payload);

    // Simpan juga 10 notifikasi terakhir di Redis list untuk history
    const historyKey = `history:notifications:${tenantId}`;
    await this.client.lpush(historyKey, JSON.stringify(payload));
    await this.client.ltrim(historyKey, 0, 19); // simpan 20 notifikasi terbaru
  }

  /**
   * Ambil riwayat notifikasi tersimpan dari Redis
   */
  async getNotificationHistory(tenantId: string): Promise<UserNotificationEvent[]> {
    const historyKey = `history:notifications:${tenantId}`;
    const list = await this.client.lrange(historyKey, 0, 19);
    return list.map((item) => {
      try {
        return JSON.parse(item);
      } catch {
        return null;
      }
    }).filter(Boolean);
  }
}
