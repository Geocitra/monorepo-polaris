import { describe, it, expect, vi, beforeEach } from 'vitest';
import { PosterBlueprintRepository } from '../src/creative-poster/blueprint-repository.js';
import { POSTER_BLUEPRINT_CATALOG } from '../src/creative-poster/catalog.js';

describe('PosterBlueprintRepository', () => {
  beforeEach(() => {
    PosterBlueprintRepository.clearCache();
  });

  it('harus jatuh ke fallback katalog statis jika koneksi database error atau belum termigrasi', async () => {
    // Mock DB yang melempar error koneksi
    const mockFaultyDb = {
      select: vi.fn().mockImplementation(() => {
        throw new Error('relation "poster_reference_blueprints" does not exist');
      }),
    } as any;

    const catalog = await PosterBlueprintRepository.getActiveCatalog(mockFaultyDb);

    // Harus tetap berhasil mengembalikan katalog tanpa melempar exception!
    expect(catalog).toBeDefined();
    expect(catalog.length).toBe(POSTER_BLUEPRINT_CATALOG.length);
    expect(catalog.length).toBeGreaterThanOrEqual(22);
    expect(catalog[0].id).toBe(POSTER_BLUEPRINT_CATALOG[0].id);
  });

  it('harus mengembalikan katalog statis jika database mengembalikan 0 baris APPROVED', async () => {
    const mockEmptyDb = {
      select: vi.fn().mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockResolvedValue([]),
        }),
      }),
    } as any;

    const catalog = await PosterBlueprintRepository.getActiveCatalog(mockEmptyDb);

    expect(catalog).toBeDefined();
    expect(catalog.length).toBe(POSTER_BLUEPRINT_CATALOG.length);
  });

  it('harus menggunakan in-memory cache jika dipanggil berulang dalam 60 detik', async () => {
    const mockDb = {
      select: vi.fn().mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockResolvedValue([]),
        }),
      }),
    } as any;

    const catalogFirst = await PosterBlueprintRepository.getActiveCatalog(mockDb);
    const catalogSecond = await PosterBlueprintRepository.getActiveCatalog(mockDb);

    expect(catalogFirst).toBe(catalogSecond); // Referensi objek identik dari cache
    expect(mockDb.select).toHaveBeenCalledTimes(1); // DB hanya diquery 1 kali!
  });

  it('harus menggabungkan blueprint APPROVED dari database dengan katalog statis', async () => {
    const mockApprovedRow = {
      id: 'TPL-99-CUSTOM-COMMUNITY',
      name: 'Custom Community Advocate',
      referenceFile: 'custom-advocate.png',
      archetype: 'POP_OUT_HERO',
      description: 'Template kustom hasil vision ingestion',
      tags: ['custom', 'advocacy'],
      aspectRatio: '4:5',
      colorPalette: {
        primaryAccent: '#059669',
        secondaryAccent: '#A7F3D0',
        textColor: '#FFFFFF',
        backgroundBase: '#064E3B',
        surfaceMode: 'SOLID_BAND',
      },
      scenePromptHint: 'clean community meeting background',
      negativeSpaceZone: 'top negative space',
      slotManifest: POSTER_BLUEPRINT_CATALOG[0].slotManifest,
      fixedConstraints: POSTER_BLUEPRINT_CATALOG[0].fixedConstraints,
      variationRules: POSTER_BLUEPRINT_CATALOG[0].variationRules,
      status: 'APPROVED',
      version: 1,
    };

    const mockDbWithApproved = {
      select: vi.fn().mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockResolvedValue([mockApprovedRow]),
        }),
      }),
    } as any;

    const catalog = await PosterBlueprintRepository.getActiveCatalog(mockDbWithApproved);

    expect(catalog.length).toBe(POSTER_BLUEPRINT_CATALOG.length + 1);
    const customBlueprint = catalog.find((b) => b.id === 'TPL-99-CUSTOM-COMMUNITY');
    expect(customBlueprint).toBeDefined();
    expect(customBlueprint?.name).toBe('Custom Community Advocate');
  });

  it('harus menangani seeding katalog statis ke database secara idempotent', async () => {
    const mockInsert = vi.fn().mockReturnValue({
      values: vi.fn().mockReturnValue({
        onConflictDoNothing: vi.fn().mockResolvedValue({ rowCount: 22 }),
      }),
    });

    const mockDb = {
      select: vi.fn().mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockResolvedValue([]),
        }),
      }),
      insert: mockInsert,
    } as any;

    const result = await PosterBlueprintRepository.seedStaticCatalogToDb(mockDb);

    expect(result.success).toBe(true);
    expect(result.seededCount).toBe(POSTER_BLUEPRINT_CATALOG.length);
  });

  it('harus memprioritaskan implementasi IPosterBlueprintRepositoryPort yang disuntikkan (Dependency Injection)', async () => {
    const mockCustomCatalog = [
      {
        ...POSTER_BLUEPRINT_CATALOG[0],
        id: 'INJECTED-CUSTOM-01',
        name: 'Injected Custom Blueprint',
      },
    ];

    const mockPortRepository = {
      getActiveCatalog: vi.fn().mockResolvedValue(mockCustomCatalog),
      saveDraftBlueprint: vi.fn().mockResolvedValue(undefined),
    };

    // Inject custom repository
    PosterBlueprintRepository.setRepository(mockPortRepository);

    const catalog = await PosterBlueprintRepository.getActiveCatalog();

    expect(mockPortRepository.getActiveCatalog).toHaveBeenCalled();
    expect(catalog).toEqual(mockCustomCatalog);
    expect(catalog[0].id).toBe('INJECTED-CUSTOM-01');

    // Bersihkan repositori kustom
    PosterBlueprintRepository.clearRepository();
  });
});

