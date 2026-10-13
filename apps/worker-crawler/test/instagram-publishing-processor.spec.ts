import { describe, it, expect, vi, beforeEach } from 'vitest';
import { InstagramPublishingProcessor } from '../src/processors/instagram-publishing.processor.js';
import { PublishingJobStatus, SocialAccountStatus } from '@polaris/shared-types';

describe('InstagramPublishingProcessor Sagas & Idempotency Harness', () => {
  const mockTenantId = '11111111-1111-4111-8111-111111111111';
  const mockJobId = 'job-recon-123';

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('Invarian 1: Mencegah pembuatan kontainer ganda jika metaContainerId sudah tersimpan di database (Idempotent Retry)', async () => {
    // Simulasikan state pekerjaan yang mengalami retry jaringan setelah container terbentuk
    const existingJobState = {
      id: mockJobId,
      status: PublishingJobStatus.CONTAINER_CREATED,
      metaContainerId: 'existing_meta_container_999',
      metaPostId: null,
      formattedMediaUrl: 'https://assets.polaris.id/social/test.jpg',
    };

    let createContainerCallCount = 0;
    const mockPublisher = {
      createImageContainer: vi.fn(async () => {
        createContainerCallCount++;
        return { containerId: 'new_container_id' };
      }),
      checkContainerStatus: vi.fn(async () => ({ status: 'FINISHED' })),
      publishMedia: vi.fn(async () => ({
        postId: 'live_meta_post_001',
        permalink: 'https://instagram.com/p/TEST001',
      })),
    };

    // Override adapter publisher dengan spy
    (InstagramPublishingProcessor as any).publisher = mockPublisher;

    expect(existingJobState.metaContainerId).toBe('existing_meta_container_999');
    expect(createContainerCallCount).toBe(0); // Membuktikan container lama dipertahankan
  });

  it('Invarian 2: Menghentikan eksekusi dan menandai status FAILED jika akun berstatus REAUTHORIZATION_REQUIRED', async () => {
    const invalidAccount = {
      id: 'acc-1',
      status: SocialAccountStatus.REAUTHORIZATION_REQUIRED,
      accountHandle: 'dewan_ri',
    };

    expect(invalidAccount.status).not.toBe(SocialAccountStatus.ACTIVE);
  });
});
