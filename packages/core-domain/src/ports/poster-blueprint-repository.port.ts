/**
 * Port Interface untuk Poster Blueprint Repository (DIP / Hexagonal Architecture).
 * Menyediakan abstraksi akses katalog blueprint poster visual bagi modul AI / Domain.
 */
export interface IPosterBlueprintRepositoryPort<TBlueprint = any> {
  /**
   * Mengambil katalog blueprint aktif (gabungan blueprint sistem statis dan kustom database yang disetujui).
   */
  getActiveCatalog(customDb?: any): Promise<TBlueprint[]>;

  /**
   * Menyimpan cetak biru kustom baru ke dalam repositori dengan status draft.
   */
  saveDraftBlueprint(blueprint: TBlueprint): Promise<void>;

  /**
   * Menyemai katalog statis ke dalam basis data (jika diperlukan).
   */
  seedStaticCatalog?(customDb?: any): Promise<{
    success: boolean;
    seededCount: number;
    inserted: number;
    skipped: number;
  }>;
}
