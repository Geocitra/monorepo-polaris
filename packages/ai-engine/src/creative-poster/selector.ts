import { POSTER_BLUEPRINT_CATALOG } from './catalog.js';
import { CreativePosterArchetype, PreAnalyzedPosterBlueprint } from './types.js';
import { getRandomHarmoniousPalette } from './palettes.js';

export interface SelectBlueprintOptions {
  topic?: string;
  forcedBlueprintId?: string;
  forcedArchetype?: CreativePosterArchetype;
  excludeBlueprintId?: string; // Untuk tombol "Acak Variasi Lain" agar tidak dapat yang sama persis
  forcedBrandHex?: string;
  strictlyEnforceBrandColor?: boolean;
}

export class PosterBlueprintSelector {
  /**
   * Pemilihan Template MURNI PAKE ID & TRUE RNG (Random Number Generator).
   * - TIDAK ADA analisa kalimat/topik/kata kunci sama sekali.
   * - Template diundi murni dari kumpulan ID template yang tersedia.
   * - Palet warna senada (Harmonious Palette) dipilih dinamis agar tidak monoton.
   * - AI tidak diberikan informasi konteks kegunaan referensi asli gambar tersebut.
   */
  public static selectBestBlueprint(options: SelectBlueprintOptions = {}): PreAnalyzedPosterBlueprint {
    const { forcedBlueprintId, forcedArchetype, excludeBlueprintId, forcedBrandHex, strictlyEnforceBrandColor } = options;

    // 1. Jika pemanggil memaksakan ID template tertentu secara eksplisit
    if (forcedBlueprintId) {
      const explicitMatch = POSTER_BLUEPRINT_CATALOG.find((b) => b.id === forcedBlueprintId);
      if (explicitMatch) {
        console.log(`[PosterBlueprintSelector] Memilih template eksplisit by ID: '${explicitMatch.id}' (${explicitMatch.name})`);
        return explicitMatch;
      }
    }

    // 2. Kumpulan template yang tersedia (exclude template sebelumnya jika reroll)
    let pool = POSTER_BLUEPRINT_CATALOG;
    if (excludeBlueprintId && pool.length > 1) {
      const filtered = pool.filter((b) => b.id !== excludeBlueprintId);
      if (filtered.length > 0) {
        pool = filtered;
      }
    }

    // 3. Jika ada batasan arketipe visual tertentu
    if (forcedArchetype) {
      const archetypePool = pool.filter((b) => b.archetype === forcedArchetype);
      if (archetypePool.length > 0) {
        pool = archetypePool;
      }
    }

    // 4. MURNI RANDOM NUMBER GENERATOR (RNG) BY ID / INDEX
    // Sama sekali tidak membaca kalimat topik, hanya melempar dadu index ID
    const randomIndex = Math.floor(Math.random() * pool.length);
    const chosen = pool[randomIndex];

    // 5. VARIASI WARNA SENADA (HARMONIOUS COLOR PALETTES):
    // Memilih palet warna senada secara acak (Emerald, Indigo, Terracotta, Sapphire, Teal, Amber, dsb.)
    // agar visual tidak monoton pada satu warna merah/oranye.
    const dynamicPalette = getRandomHarmoniousPalette();
    const primaryAccent = strictlyEnforceBrandColor && forcedBrandHex ? forcedBrandHex : dynamicPalette.primaryAccent;

    const variedBlueprint: PreAnalyzedPosterBlueprint = {
      ...chosen,
      colorPalette: {
        ...chosen.colorPalette,
        primaryAccent,
        secondaryAccent: dynamicPalette.secondaryAccent,
        backgroundBase: dynamicPalette.backgroundBase,
        textColor: dynamicPalette.textColor,
        subTextColor: dynamicPalette.subTextColor,
        cardBackground: dynamicPalette.cardBackground,
        cardBorder: dynamicPalette.cardBorder,
      },
    };

    console.log(
      `[PosterBlueprintSelector] RNG Murni (By Template ID): Terpilih '${chosen.id}' (${chosen.name}) dengan Palet Warna Senada '${dynamicPalette.name}' (${primaryAccent}). (Tanpa analisa kalimat/topik).`
    );

    return variedBlueprint;
  }
}

