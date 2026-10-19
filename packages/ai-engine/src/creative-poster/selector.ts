import { POSTER_BLUEPRINT_CATALOG } from './catalog.js';
import { CreativePosterArchetype, PreAnalyzedPosterBlueprint } from './types.js';

export interface SelectBlueprintOptions {
  topic: string;
  forcedArchetype?: CreativePosterArchetype;
  excludeBlueprintId?: string; // Untuk tombol "Acak Variasi Lain" agar tidak dapat yang sama persis
}

export class PosterBlueprintSelector {
  /**
   * selectBestBlueprint melakukan Constrained RNG:
   * 1. Jika forcedArchetype diberikan, filter berdasarkan arketipe tersebut.
   * 2. Jika tidak, hitung skor relevansi berdasarkan tag blueprint terhadap topik user.
   * 3. Ambil kandidat dengan skor terbaik, lalu pilih secara acak (RNG) agar bervariasi.
   */
  public static selectBestBlueprint(options: SelectBlueprintOptions): PreAnalyzedPosterBlueprint {
    const { topic, forcedArchetype, excludeBlueprintId } = options;
    const lowerTopic = (topic || '').toLowerCase();

    // 1. Filter awal (exclude template sebelumnya jika sedang di-roll ulang)
    let pool = POSTER_BLUEPRINT_CATALOG.filter((b) => b.id !== excludeBlueprintId);
    if (pool.length === 0) {
      pool = POSTER_BLUEPRINT_CATALOG;
    }

    // 2. Jika ada forcedArchetype, prioritaskan arketipe tersebut
    if (forcedArchetype) {
      const archetypePool = pool.filter((b) => b.archetype === forcedArchetype);
      if (archetypePool.length > 0) {
        const randomIndex = Math.floor(Math.random() * archetypePool.length);
        return archetypePool[randomIndex];
      }
    }

    // 3. Keyword Scoring: Hitung kecocokan kata kunci di topik dengan tag di catalog
    const scoredPool = pool.map((blueprint) => {
      let score = 0;
      for (const tag of blueprint.tags) {
        if (lowerTopic.includes(tag.toLowerCase())) {
          score += 2;
        }
      }
      return { blueprint, score };
    });

    // 4. Cari skor tertinggi
    const maxScore = Math.max(...scoredPool.map((s) => s.score));

    // Jika ada yang cocok (score > 0), ambil semua kandidat dengan skor tertinggi
    let candidatePool = scoredPool
      .filter((s) => (maxScore > 0 ? s.score === maxScore : true))
      .map((s) => s.blueprint);

    if (candidatePool.length === 0) {
      candidatePool = pool;
    }

    // 5. Constrained Random Selection (Kocok di antara kandidat terbaik)
    const pickedIndex = Math.floor(Math.random() * candidatePool.length);
    return candidatePool[pickedIndex];
  }
}
