import { POSTER_BLUEPRINT_CATALOG } from './catalog.js';
import { CreativePosterArchetype, PreAnalyzedPosterBlueprint } from './types.js';

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
   * 3-Step Filtered Roulette RNG Selection Engine:
   * 1. Negative Filtering (Tone Guard): Menjaga isu krisis/duka dari template pop/komedi.
   * 2. Broad Candidate Pool: Mengambil Top 8-10 relevan + 2-3 Wildcard (Candidate Pool 8-12).
   * 3. Random Draw di dalam Pool: Menjamin variasi luas tanpa kebosanan Max-Score.
   */
  public static async selectBestBlueprintAsync(
    options: SelectBlueprintOptions = {}
  ): Promise<PreAnalyzedPosterBlueprint> {
    const { PosterBlueprintRepository } = await import('./blueprint-repository.js');
    const catalog = await PosterBlueprintRepository.getActiveCatalog();
    return this.selectBestBlueprint(options, catalog);
  }

  public static selectBestBlueprint(
    options: SelectBlueprintOptions = {},
    catalog: PreAnalyzedPosterBlueprint[] = POSTER_BLUEPRINT_CATALOG
  ): PreAnalyzedPosterBlueprint {
    const {
      topic = '',
      forcedBlueprintId,
      forcedArchetype,
      excludeBlueprintId,
      forcedBrandHex,
      strictlyEnforceBrandColor,
    } = options;

    // 1. Jika pemanggil memaksakan ID template tertentu secara eksplisit
    if (forcedBlueprintId) {
      const explicitMatch = catalog.find((b) => b.id === forcedBlueprintId);
      if (explicitMatch) {
        return this.applyBrandColor(explicitMatch, forcedBrandHex, strictlyEnforceBrandColor);
      }
    }

    // 2. Kumpulan awal seluruh katalog
    let pool = [...catalog];

    // Exclude template sebelumnya (Anti-Repeat / Cooldown Memory)
    if (excludeBlueprintId && pool.length > 1) {
      const filtered = pool.filter((b) => b.id !== excludeBlueprintId);
      if (filtered.length > 0) {
        pool = filtered;
      }
    }

    // Jika dipaksakan arketipe tertentu
    if (forcedArchetype) {
      const archetypePool = pool.filter((b) => b.archetype === forcedArchetype);
      if (archetypePool.length > 0) {
        pool = archetypePool;
      }
    }

    // -------------------------------------------------------------------------
    // STEP 1: TONE GUARD / NEGATIVE FILTERING
    // -------------------------------------------------------------------------
    const normalizedTopic = topic.toLowerCase();
    const isCrisisOrGrave =
      /bencana|banjir|gempa|kebakaran|korupsi|meninggal|duka|darurat|krisis|evakuasi|wafat|longsor|tragedi/i.test(
        normalizedTopic
      );

    if (isCrisisOrGrave && pool.length > 4) {
      // Buang template pop/komedi yang tidak pantas untuk isu berduka/kritis
      const popTemplateIds = [
        'TPL-11-CREATIVE-POP-COLLAGE',
        'TPL-18-POP-ZINE-COLLAGE',
        'TPL-22-POP-CULTURE-COMMENTARY',
      ];
      const safePool = pool.filter((b) => !popTemplateIds.includes(b.id));
      if (safePool.length > 0) {
        pool = safePool;
      }
    }

    // -------------------------------------------------------------------------
    // STEP 2: BROAD RELEVANCE POOL (Top 8-10) + WILDCARD (2-3)
    // -------------------------------------------------------------------------
    const scoredPool = pool.map((blueprint) => {
      let score = 0;
      const textToMatch = `${blueprint.name} ${blueprint.description} ${blueprint.tags.join(' ')}`.toLowerCase();
      const topicWords = normalizedTopic.split(/\s+/).filter((w) => w.length > 3);

      for (const word of topicWords) {
        if (textToMatch.includes(word)) score += 3;
      }

      // Skor kecocokan tag tematik
      if (/jalan|jembatan|infrastruktur|bangunan|gedung/i.test(normalizedTopic)) {
        if (blueprint.tags.some((t) => /infrastruktur|sinematik|modern|arsitektur/i.test(t))) score += 4;
      }
      if (/pasar|pedagang|sembako|umkm|tani|pupuk|nelayan/i.test(normalizedTopic)) {
        if (blueprint.tags.some((t) => /kolase|investigatif|risograph|vintage/i.test(t))) score += 4;
      }
      if (/anggaran|apbd|apbn|audit|keuangan|dana/i.test(normalizedTopic)) {
        if (blueprint.tags.some((t) => /infografis|data|grid|broadsheet/i.test(t))) score += 4;
      }

      return { blueprint, score };
    });

    // Urutkan berdasarkan skor relevansi
    scoredPool.sort((a, b) => b.score - a.score);

    // Ambil kandidat relevan teratas (Top 8 - 10)
    const topCandidates = scoredPool.slice(0, Math.min(8, scoredPool.length)).map((s) => s.blueprint);

    // Ambil 2 - 3 Wildcard dari sisa pool yang belum masuk untuk menjaga keanekaragaman
    const remaining = scoredPool.slice(topCandidates.length).map((s) => s.blueprint);
    const wildcards: PreAnalyzedPosterBlueprint[] = [];
    if (remaining.length > 0) {
      const shuffledRemaining = [...remaining].sort(() => 0.5 - Math.random());
      wildcards.push(...shuffledRemaining.slice(0, Math.min(3, shuffledRemaining.length)));
    }

    const candidatePool = [...topCandidates, ...wildcards];

    // -------------------------------------------------------------------------
    // STEP 3: TRUE RANDOM DRAW DI DALAM CANDIDATE POOL (8-12 Variasi)
    // -------------------------------------------------------------------------
    const randomIndex = Math.floor(Math.random() * candidatePool.length);
    const chosen = candidatePool[randomIndex] || pool[0];

    return this.applyBrandColor(chosen, forcedBrandHex, strictlyEnforceBrandColor);
  }

  /**
   * Menjaga identitas warna asli blueprint, hanya menimpa primaryAccent jika brand diwajibkan
   */
  private static applyBrandColor(
    blueprint: PreAnalyzedPosterBlueprint,
    forcedBrandHex?: string,
    strictlyEnforceBrandColor?: boolean
  ): PreAnalyzedPosterBlueprint {
    if (strictlyEnforceBrandColor && forcedBrandHex) {
      return {
        ...blueprint,
        colorPalette: {
          ...blueprint.colorPalette,
          primaryAccent: forcedBrandHex,
        },
      };
    }
    return blueprint;
  }
}
