import { Queue } from 'bullmq';
import { redisConnection } from '../config/redis.connection.js';

export const STUDIO_GENERATION_QUEUE_NAME = 'studio-content-generation-queue';

export interface StudioGenerationJobPayload {
  taskType?: 'GENERATE_ARTICLE' | 'FULL_CAMPAIGN' | 'INFOGRAPHIC_ONLY' | 'ARTICLE_ONLY' | 'REGENERATE_POSTER';
  jobId: string;
  tenantId: string;
  publicationId: string;
  topic: string;
  prompt?: string;
  headline?: string;
  forcedArchetype?: string;
  targetAudience?: string;
  toneOverride?: string;
  comparisonRegion?: string;
  framingStance?: string;
  generateDallePoster: boolean;
  style?: string;
  aspectRatio?: string;
  includeUserPhoto?: boolean;
  compositionMode?: 'PUBLIC_ADVOCACY' | 'FIGURE_CENTERPIECE';
  customPhotoUrl?: string;
  targetLength?: string;
  writingStyle?: string;
  externalUrls?: string[];
  referencedUrls?: string[];
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
