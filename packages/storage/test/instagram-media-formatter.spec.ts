import { describe, it, expect, vi, beforeEach } from 'vitest';
import sharp from 'sharp';
import { InstagramMediaFormatter } from '../src/instagram-media-formatter.js';

vi.mock('../src/storage.adapter.js', () => {
  return {
    CloudflareR2StorageAdapter: class {
      uploadBuffer = vi.fn().mockImplementation((buffer: Buffer, options: any) =>
        Promise.resolve({
          publicUrl: `https://assets.polaris.id/${options?.destinationPath || 'test.jpg'}`,
        })
      );
    },
  };
});

describe('InstagramMediaFormatter (Strict Aspect Ratio Invariants)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  async function createTestImageUri(width: number, height: number): Promise<string> {
    const buffer = await sharp({
      create: {
        width,
        height,
        channels: 3,
        background: { r: 37, g: 99, b: 235 },
      },
    })
      .png()
      .toBuffer();

    return `data:image/png;base64,${buffer.toString('base64')}`;
  }

  it('Invarian 1: Menyelaraskan poster DALL-E vertikal ekstrem (9:16 - 1024x1792) ke kanvas 4:5 (1080x1350 JPEG)', async () => {
    const rawUri = await createTestImageUri(1024, 1792);

    const res = await InstagramMediaFormatter.formatForFeed({
      sourceUrl: rawUri,
      tenantId: 'tenant-test-1',
      jobId: 'job-1',
    });

    expect(res.mimeType).toBe('image/jpeg');
    expect(res.width).toBe(1080);
    expect(res.height).toBe(1350);

    const ratio = res.width / res.height;
    expect(ratio).toBeCloseTo(0.8, 2); // Rasio 4:5 tepat 0.8
    expect(res.formattedUrl).toContain('.jpg');
  });

  it('Invarian 2: Mempertahankan gambar berasio 1:1 (Square - 1080x1080) tanpa merusak proporsi', async () => {
    const rawUri = await createTestImageUri(1080, 1080);

    const res = await InstagramMediaFormatter.formatForFeed({
      sourceUrl: rawUri,
      tenantId: 'tenant-test-1',
      jobId: 'job-2',
    });

    expect(res.mimeType).toBe('image/jpeg');
    const ratio = res.width / res.height;
    expect(ratio).toBeGreaterThanOrEqual(0.79);
    expect(ratio).toBeLessThanOrEqual(1.91);
  });

  it('Invarian 3: Menerima gambar horizontal/landscape (16:9 - 1920x1080) karena masih dalam rentang <= 1.91:1', async () => {
    const rawUri = await createTestImageUri(1920, 1080);

    const res = await InstagramMediaFormatter.formatForFeed({
      sourceUrl: rawUri,
      tenantId: 'tenant-test-1',
      jobId: 'job-3',
    });

    expect(res.mimeType).toBe('image/jpeg');
    const ratio = res.width / res.height;
    expect(ratio).toBeLessThanOrEqual(1.91);
  });
});
