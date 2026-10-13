import { Queue } from 'bullmq';
import { redisConnection } from '../config/redis.connection.js';

export const SOCIAL_PUBLISHING_QUEUE_NAME = 'social-content-publishing-queue';

export interface SocialPublishingJobPayload {
  publishingJobId: string;
  tenantId: string;
  accountId: string;
  publicationId?: string | null;
  caption: string;
  originalMediaUrl: string;
  mediaUrls?: string[];
  framingMode?: 'crop' | 'blur';
  scheduledAt?: string;
}

export const socialPublishingQueue = new Queue<SocialPublishingJobPayload>(
  SOCIAL_PUBLISHING_QUEUE_NAME,
  {
    connection: redisConnection,
    defaultJobOptions: {
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: 5000,
      },
      removeOnComplete: { count: 100 },
      removeOnFail: { count: 300 },
    },
  }
);
