import { Queue } from 'bullmq';
import { redisConnection } from '../config/redis.connection.js';

export const STUDIO_GENERATION_QUEUE_NAME = 'studio-content-generation-queue';

export interface StudioGenerationJobPayload {
  taskType?: 'GENERATE_ARTICLE' | 'REGENERATE_POSTER';
  jobId: string;
  tenantId: string;
  publicationId: string;
  topic: string;
  targetAudience?: string;
  toneOverride?: string;
  comparisonRegion?: string;
  framingStance?: string;
  generateDallePoster: boolean;
  externalUrls?: string[];
  attachments?: Array<{
    name: string;
    type: string;
    base64: string;
  }>;
}

export const studioGenerationQueue = new Queue<StudioGenerationJobPayload>(
  STUDIO_GENERATION_QUEUE_NAME,
  {
    connection: redisConnection,
    defaultJobOptions: {
      attempts: 2,
      backoff: {
        type: 'exponential',
        delay: 5000,
      },
      removeOnComplete: { count: 100 },
      removeOnFail: { count: 200 },
    },
  }
);
