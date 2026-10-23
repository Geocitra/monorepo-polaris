import { db, posterReferenceBlueprints, eq } from '@polaris/database';
import { POSTER_BLUEPRINT_CATALOG } from './catalog.js';
import { PreAnalyzedPosterBlueprint } from './types.js';

export class PosterBlueprintRepository {
  private static cachedCatalog: PreAnalyzedPosterBlueprint[] | null = null;
  private static lastCachedAt: number = 0;
  private static CACHE_TTL_MS = 60_000; // 60 detik

  /**
   * Mengambil katalog blueprint aktif.
   * Menggabungkan katalog statis (22 blueprint) dengan blueprint kustom yang berstatus APPROVED dari DB.
   * Wajib aman (resilient) dengan graceful fallback ke katalog statis jika DB belum siap/migrasi belum berjalan.
   */
  public static async getActiveCatalog(customDb?: any): Promise<PreAnalyzedPosterBlueprint[]> {
    const database = customDb || db;
    const now = Date.now();
    if (this.cachedCatalog && now - this.lastCachedAt < this.CACHE_TTL_MS) {
      return this.cachedCatalog;
    }

    try {
      const dbBlueprints = await database
        .select()
        .from(posterReferenceBlueprints)
        .where(eq(posterReferenceBlueprints.status, 'APPROVED'));

      if (!dbBlueprints || dbBlueprints.length === 0) {
        this.cachedCatalog = POSTER_BLUEPRINT_CATALOG;
        this.lastCachedAt = now;
        return this.cachedCatalog;
      }

      // Gabungkan blueprint statis dan DB menggunakan Map (ID unik)
      const catalogMap = new Map<string, PreAnalyzedPosterBlueprint>();
      for (const bp of POSTER_BLUEPRINT_CATALOG) {
        catalogMap.set(bp.id, bp);
      }

      for (const row of dbBlueprints) {
        catalogMap.set(row.id, {
          id: row.id,
          name: row.name,
          archetype: row.archetype as any,
          referenceFile: row.referenceFile,
          description: row.description,
          tags: row.tags,
          aspectRatio: row.aspectRatio as any,
          colorPalette: row.colorPalette as any,
          scenePromptHint: row.scenePromptHint,
          negativeSpaceZone: row.negativeSpaceZone,
          slotManifest: row.slotManifest as any,
          fixedConstraints: row.fixedConstraints as any,
          variationRules: row.variationRules as any,
        });
      }

      this.cachedCatalog = Array.from(catalogMap.values());
      this.lastCachedAt = now;
      return this.cachedCatalog;
    } catch (err: any) {
      console.warn(
        `[PosterBlueprintRepository] Query database blueprint gagal (${err?.message || err}). Menggunakan fallback katalog statis.`
      );
      return POSTER_BLUEPRINT_CATALOG;
    }
  }

  /**
   * Menyimpan blueprint hasil analisis referensi baru ke DB dengan status DRAFT
   */
  public static async saveDraftBlueprint(
    blueprint: PreAnalyzedPosterBlueprint
  ): Promise<void> {
    try {
      await db
        .insert(posterReferenceBlueprints)
        .values({
          id: blueprint.id,
          name: blueprint.name,
          archetype: blueprint.archetype,
          referenceFile: blueprint.referenceFile,
          description: blueprint.description,
          tags: blueprint.tags,
          aspectRatio: blueprint.aspectRatio,
          colorPalette: blueprint.colorPalette,
          scenePromptHint: blueprint.scenePromptHint,
          negativeSpaceZone: blueprint.negativeSpaceZone,
          slotManifest: blueprint.slotManifest,
          fixedConstraints: blueprint.fixedConstraints,
          variationRules: blueprint.variationRules,
          status: 'DRAFT',
          version: 1,
        })
        .onConflictDoUpdate({
          target: posterReferenceBlueprints.id,
          set: {
            name: blueprint.name,
            archetype: blueprint.archetype,
            referenceFile: blueprint.referenceFile,
            description: blueprint.description,
            tags: blueprint.tags,
            colorPalette: blueprint.colorPalette,
            scenePromptHint: blueprint.scenePromptHint,
            negativeSpaceZone: blueprint.negativeSpaceZone,
            slotManifest: blueprint.slotManifest,
            fixedConstraints: blueprint.fixedConstraints,
            variationRules: blueprint.variationRules,
            updatedAt: new Date(),
          },
        });

      // Invalidate cache
      this.cachedCatalog = null;
    } catch (err: any) {
      console.error(
        `[PosterBlueprintRepository] Gagal menyimpan draft blueprint ${blueprint.id}:`,
        err
      );
      throw err;
    }
  }

  /**
   * Menyemai (seed) ke-22 blueprint statis ke database jika tabel masih kosong
   */
  public static async seedStaticCatalogToDb(customDb?: any): Promise<{
    success: boolean;
    seededCount: number;
    inserted: number;
    skipped: number;
  }> {
    const database = customDb || db;
    let inserted = 0;
    let skipped = 0;

    for (const bp of POSTER_BLUEPRINT_CATALOG) {
      try {
        const existing = await database
          .select({ id: posterReferenceBlueprints.id })
          .from(posterReferenceBlueprints)
          .where(eq(posterReferenceBlueprints.id, bp.id));

        if (existing.length > 0) {
          skipped++;
          continue;
        }

        await database.insert(posterReferenceBlueprints).values({
          id: bp.id,
          name: bp.name,
          archetype: bp.archetype,
          referenceFile: bp.referenceFile,
          description: bp.description,
          tags: bp.tags,
          aspectRatio: bp.aspectRatio,
          colorPalette: bp.colorPalette,
          scenePromptHint: bp.scenePromptHint,
          negativeSpaceZone: bp.negativeSpaceZone,
          slotManifest: bp.slotManifest,
          fixedConstraints: bp.fixedConstraints,
          variationRules: bp.variationRules,
          status: 'APPROVED',
          version: 1,
        });

        inserted++;
      } catch (err: any) {
        console.warn(`[PosterBlueprintRepository] Gagal menyemai ${bp.id}:`, err?.message);
        skipped++;
      }
    }

    this.cachedCatalog = null;
    return { success: true, seededCount: inserted, inserted, skipped };
  }

  /**
   * Reset cache memori (untuk keperluan testing)
   */
  public static clearCache(): void {
    this.cachedCatalog = null;
    this.lastCachedAt = 0;
  }
}
