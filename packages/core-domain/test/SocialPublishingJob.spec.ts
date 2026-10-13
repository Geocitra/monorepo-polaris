import { describe, it, expect } from 'vitest';
import { SocialPublishingJob } from '../src/entities/SocialPublishingJob.js';
import { PublishingJobStatus } from '@polaris/shared-types';

describe('SocialPublishingJob Domain State Machine (FSM & Idempotency)', () => {
  it('harus mengalirkan status secara linier dari PENDING -> CONTAINER_CREATED -> PUBLISHED', () => {
    const job = new SocialPublishingJob({
      id: 'job-1',
      tenantId: 'tenant-1',
      accountId: 'acc-1',
      originalMediaUrl: 'https://assets.polaris.id/posters/test.webp',
      caption: 'Kajian Kebijakan Pupuk Bersubsidi 2026',
    });

    expect(job.status).toBe(PublishingJobStatus.PENDING);

    job.markContainerCreated('container_meta_999');
    expect(job.status).toBe(PublishingJobStatus.CONTAINER_CREATED);
    expect(job.metaContainerId).toBe('container_meta_999');

    job.markPublished('post_meta_888', 'https://instagram.com/p/ABCXYZ');
    expect(job.status).toBe(PublishingJobStatus.PUBLISHED);
    expect(job.metaPostId).toBe('post_meta_888');
    expect(job.metaPermalink).toBe('https://instagram.com/p/ABCXYZ');
    expect(job.publishedAt).toBeInstanceOf(Date);
  });

  it('harus membatasi transisi mutasi jika job sudah PUBLISHED', () => {
    const job = new SocialPublishingJob({
      id: 'job-2',
      tenantId: 'tenant-1',
      accountId: 'acc-1',
      originalMediaUrl: 'https://assets.polaris.id/posters/test.webp',
      caption: 'Evaluasi APBD',
      status: PublishingJobStatus.PUBLISHED,
    });

    expect(() => job.markContainerCreated('new_container')).toThrow(
      '[InvalidStateTransitionError]'
    );
  });
});
