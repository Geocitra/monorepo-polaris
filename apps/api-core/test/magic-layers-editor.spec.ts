import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BadRequestException, ForbiddenException } from '@nestjs/common';
import { AssetType } from '@polaris/shared-types';

const { mockSelectLimit, mockWhereResult, mockDbSelect, mockDbUpdate, mockUpdateSet } =
  vi.hoisted(() => {
    const mockSelectLimit = vi.fn();
    const mockWhereResult = vi.fn(() =>
      Object.assign(Promise.resolve([]), { limit: mockSelectLimit })
    );
    const mockDbSelect = vi.fn(() => ({
      from: vi.fn(() => ({
        where: mockWhereResult,
      })),
    }));
    const mockUpdateWhere = vi.fn().mockResolvedValue(undefined);
    const mockUpdateSet = vi.fn(() => ({ where: mockUpdateWhere }));
    const mockDbUpdate = vi.fn(() => ({ set: mockUpdateSet }));

    return { mockSelectLimit, mockWhereResult, mockDbSelect, mockDbUpdate, mockUpdateSet };
  });

vi.mock('@polaris/database', () => ({
  db: {
    select: mockDbSelect,
    update: mockDbUpdate,
  },
  contentPublications: { id: 'id', tenantId: 'tenant_id' },
  mediaAssets: { id: 'id', publicationId: 'publication_id' },
  eq: vi.fn((a, b) => ({ eq: [a, b] })),
  and: vi.fn((...args) => ({ and: args })),
}));

import { StudioMagicLayersService } from '../src/modules/studio/services/studio-magic-layers.service.js';
import { PosterVisionExtractorService } from '../src/modules/studio/services/poster-vision-extractor.service.js';

describe('Magic Layers Editor (Save Layers R2/DB & Dynamic Manifest)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSelectLimit.mockReset();
    mockWhereResult.mockImplementation(() =>
      Object.assign(Promise.resolve([]), { limit: mockSelectLimit })
    );
  });

  describe('StudioMagicLayersService.saveEditedPosterLayers', () => {
    it('menolak (403 Forbidden) jika publicationId milik tenant lain', async () => {
      const service = new StudioMagicLayersService({} as any);
      mockSelectLimit.mockResolvedValueOnce([{ id: 'pub-1', tenantId: 'tenant-a' }]);

      await expect(
        service.saveEditedPosterLayers('tenant-b', 'pub-1', {
          imageDataUrl: 'data:image/png;base64,iVBORw0KGgo=',
          layersJson: '{"objects":[]}',
        })
      ).rejects.toThrow(ForbiddenException);
    });

    it('menolak (400 BadRequest) jika imageDataUrl bukan base64 data URI gambar', async () => {
      const service = new StudioMagicLayersService({} as any);
      mockSelectLimit.mockResolvedValueOnce([{ id: 'pub-1', tenantId: 'tenant-a' }]);

      await expect(
        service.saveEditedPosterLayers('tenant-a', 'pub-1', {
          imageDataUrl: 'https://evil.example.com/fake.png',
          layersJson: '{"objects":[]}',
        })
      ).rejects.toThrow(BadRequestException);
    });

    it('mempertahankan rawCanvasUrl & layoutManifest saat menyimpan editorLayersJson', async () => {
      const service = new StudioMagicLayersService({} as any);
      // 1. contentPublications -> owned by tenant-a
      mockSelectLimit.mockResolvedValueOnce([{ id: 'pub-1', tenantId: 'tenant-a' }]);
      // 2. mediaAssets -> existing poster asset with rawCanvasUrl & layoutManifest
      mockWhereResult
        .mockImplementationOnce(() => Object.assign(Promise.resolve([]), { limit: mockSelectLimit }))
        .mockResolvedValueOnce([
          {
            id: 'asset-1',
            assetType: AssetType.INFOGRAPHIC_PNG,
            promptUsed: JSON.stringify({
              rawCanvasUrl: 'https://cdn.example.com/raw.png',
              layoutManifest: { width: 1080, height: 1350, layers: [] },
            }),
          },
        ]);

      const res = await service.saveEditedPosterLayers('tenant-a', 'pub-1', {
        imageDataUrl: 'data:image/png;base64,iVBORw0KGgo=',
        layersJson: '{"version":"7.4.0","objects":[]}',
      });

      expect(res.success).toBe(true);
      expect(res.posterUrl).toContain('/uploads/posters/tenant-a/');

      const updateArg = mockUpdateSet.mock.calls[0][0];
      const savedPrompt = JSON.parse(updateArg.promptUsed);
      expect(savedPrompt.rawCanvasUrl).toBe('https://cdn.example.com/raw.png');
      expect(savedPrompt.layoutManifest).toEqual({ width: 1080, height: 1350, layers: [] });
      expect(savedPrompt.editorLayersJson).toBe('{"version":"7.4.0","objects":[]}');
    });
  });

  describe('PosterVisionExtractorService.convertContentToManifest', () => {
    it('menggunakan ukuran kanvas dinamis (misal 1920x1080 untuk 16:9) bukan hardcoded 1080x1350', () => {
      const extractor = new PosterVisionExtractorService();
      const manifest = extractor.convertContentToManifest(
        {
          detectedArchetype: 'GENERIC_INFOGRAPHIC',
          headline: 'Judul Kebijakan 16:9',
          elements: [
            {
              id: 'e_1',
              kind: 'text',
              role: 'headline',
              text: 'Judul Kebijakan 16:9',
              box_2d: [100, 100, 200, 900],
            },
          ],
          stats: [],
          cards: [],
        },
        1920,
        1080
      );

      expect(manifest.width).toBe(1920);
      expect(manifest.height).toBe(1080);
    });

    it('mengekstrak elemen gambar subjek (kind: image) menjadi manifest v2 dan mengabaikan full-canvas background', () => {
      const extractor = new PosterVisionExtractorService();
      const manifest = extractor.convertContentToManifest(
        {
          detectedArchetype: 'GENERIC_INFOGRAPHIC',
          headline: 'Judul Poster',
          elements: [
            { id: 'f_1', kind: 'frame', role: 'header-card', box_2d: [50, 50, 200, 950], fill: '#FFFFFF' },
            { id: 't_1', kind: 'text', role: 'headline', text: 'Judul Poster', box_2d: [80, 80, 170, 900] },
            { id: 'i_bg', kind: 'image', role: 'background', box_2d: [0, 0, 1000, 1000] },
            { id: 'i_sub', kind: 'image', role: 'subject-photo', box_2d: [300, 150, 750, 550] },
          ],
        },
        1080,
        1350
      );

      expect(manifest.version).toBe(2);
      const imageLayers = manifest.layers.filter((l) => l.kind === 'image');
      expect(imageLayers).toHaveLength(1);
      expect(imageLayers[0]).toMatchObject({
        kind: 'image',
        role: 'subject-photo',
      });
    });
  });

  describe('StudioMagicLayersService.uploadEditorAsset', () => {
    it('menolak (400 BadRequest) jika imageDataUrl bukan Data URI gambar valid', async () => {
      const service = new StudioMagicLayersService({} as any);
      await expect(
        service.uploadEditorAsset('tenant-a', { imageDataUrl: 'not-a-data-uri' })
      ).rejects.toThrow(BadRequestException);
    });

    it('mengunggah aset gambar valid ke storage dan mengembalikan URL CDN/lokal', async () => {
      const service = new StudioMagicLayersService({} as any);
      const res = await service.uploadEditorAsset('tenant-a', {
        imageDataUrl: 'data:image/png;base64,iVBORw0KGgo=',
        filename: 'logo.png',
      });

      expect(res.success).toBe(true);
      expect(res.url).toContain('/uploads/posters/tenant-a/');
    });
  });

  describe('PosterVisionExtractorService local uploads & SSRF guard', () => {
    it('tetap menolak URL localhost non-uploads dan path traversal di luar uploads/', async () => {
      const extractor = new PosterVisionExtractorService();
      await expect(
        extractor.extractContentFromImage('http://localhost:4000/api/v1/health')
      ).rejects.toThrow(BadRequestException);

      await expect(
        extractor.extractContentFromImage('http://localhost:4000/uploads/../../etc/passwd')
      ).rejects.toThrow(BadRequestException);
    });

    it('berhasil me-resolve file resmi di root monorepo uploads/ walaupun cwd berada di apps/api-core', async () => {
      const fs = await import('node:fs');
      const path = await import('node:path');
      const extractor = new PosterVisionExtractorService();

      const rootUploads = path.resolve(process.cwd(), '../../uploads/posters/test-tenant');
      fs.mkdirSync(rootUploads, { recursive: true });
      const testFile = path.join(rootUploads, 'ssrf-local-test.png');
      fs.writeFileSync(testFile, Buffer.from('iVBORw0KGgo=', 'base64'));

      try {
        const resolved = (extractor as any).resolveSafeLocalUploadPath(
          'http://localhost:4000/uploads/posters/test-tenant/ssrf-local-test.png?v=123'
        );
        expect(resolved).toBe(testFile);
      } finally {
        fs.rmSync(testFile, { force: true });
      }
    });
  });
});
