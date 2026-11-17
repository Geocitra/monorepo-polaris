import { POSTER_BLUEPRINT_CATALOG } from './catalog.js';
import { CreativePosterArchetype, PreAnalyzedPosterBlueprint } from './types.js';
import { isInfographicArchetype } from '@polaris/shared-types';

export interface SelectBlueprintOptions {
  topic?: string;
  groundedContextSummary?: string;
  forcedBlueprintId?: string;
  forcedArchetype?: CreativePosterArchetype;
  excludeBlueprintId?: string; // Untuk tombol "Acak Variasi Lain" agar tidak dapat yang sama persis
  forcedBrandHex?: string;
  strictlyEnforceBrandColor?: boolean;
  isInfographic?: boolean;
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
      groundedContextSummary = '',
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

    // 2. Kumpulan awal seluruh katalog dengan isolasi tegas: Infografis vs Poster
    let pool = [...catalog];

    const isInfographicMode = Boolean(options.isInfographic || isInfographicArchetype(forcedArchetype));
    if (isInfographicMode) {
      const infographicPool = pool.filter(
        (b) => isInfographicArchetype(b.archetype) || b.id.startsWith('INF-')
      );
      if (infographicPool.length > 0) {
        pool = infographicPool;
      }
    } else {
      const nonInfographicPool = pool.filter(
        (b) => !isInfographicArchetype(b.archetype) && !b.id.startsWith('INF-')
      );
      if (nonInfographicPool.length > 0) {
        pool = nonInfographicPool;
      }
    }

    // Exclude template sebelumnya (Anti-Repeat / Cooldown Memory)
    if (excludeBlueprintId && pool.length > 1) {
      const filtered = pool.filter((b) => b.id !== excludeBlueprintId);
      if (filtered.length > 0) {
        pool = filtered;
      }
    }

    // Jika dipaksakan arketipe tertentu (yang sesuai dengan mode aktif)
    if (forcedArchetype) {
      const archetypePool = pool.filter((b) => b.archetype === forcedArchetype);
      if (archetypePool.length > 0) {
        pool = archetypePool;
      }
    }

    // -------------------------------------------------------------------------
    // STEP 1: TONE GUARD / NEGATIVE FILTERING
    // -------------------------------------------------------------------------
    const combinedSignal = `${topic} ${groundedContextSummary.slice(0, 800)}`.toLowerCase();
    const normalizedTopic = topic.toLowerCase();
    const isCrisisOrGrave =
      /bencana|banjir|gempa|kebakaran|korupsi|meninggal|duka|darurat|krisis|evakuasi|wafat|longsor|tragedi/i.test(
        normalizedTopic
      );

    if (isCrisisOrGrave && pool.length > 4) {
      const safePool = pool.filter((b) => b.fixedConstraints?.toneSafety !== 'VIRAL_ONLY');
      if (safePool.length > 0) {
        pool = safePool;
      }
    }

    // -------------------------------------------------------------------------
    // STEP 2: CONTENT-SHAPE DETECTION & SEMANTIC SCORING
    // -------------------------------------------------------------------------
    const hasChronologyShape =
      /\b(19\d{2}|20\d{2}|kronologi|sejarah|tahap|tahapan|fase|periode|biografi|perjalanan|evolusi|abad|dekade|milestone|tonggak)\b/i.test(
        combinedSignal
      );
    const hasHeavyQuantitativeShape =
      /\b(rp\s?\d|\d+[.,]?\d*\s?%|miliar|triliun|apbd|apbn|anggaran|statistik|bps|survei|indeks|kuota|realisasi|pertumbuhan|defisit|inflasi)\b/i.test(
        combinedSignal
      );
    const hasMitigationOrActionShape =
      /\b(mitigasi|langkah|solusi|pencegahan|antisipasi|darurat|waspada|cara|panduan|prosedur|intervensi|penanganan|aksi)\b/i.test(
        combinedSignal
      );
    const hasCultureOrHeritageShape =
      /\b(budaya|adat|tradisi|warisan|sejarah|kearifan|lokal|nusantara|seni|festival|desa wisata|cagar)\b/i.test(
        combinedSignal
      );
    const hasProfileOrLeadershipShape =
      /\b(tokoh|sosok|kepemimpinan|visi|komitmen|pernyataan|sikap|integritas|biografi|profil|kiprah)\b/i.test(
        combinedSignal
      );

    const scoredPool = pool.map((blueprint) => {
      let score = 0;
      const textToMatch = `${blueprint.name} ${blueprint.description} ${blueprint.tags.join(' ')}`.toLowerCase();
      const topicWords = normalizedTopic.split(/\s+/).filter((w) => w.length > 3);

      for (const word of topicWords) {
        if (textToMatch.includes(word)) score += 3;
      }

      // Kecocokan Content-Shape (Bentuk Informasi)
      if (hasChronologyShape) {
        if (
          /TIMELINE|CHRONICLE|RADIAL_CLOCK|HISTORICAL|SUNBURST|GAZETTE/i.test(blueprint.archetype) ||
          blueprint.tags.some((t) => /jam|radial|waktu|evolusi|sejarah|kronik|biografi|timeline/i.test(t))
        ) {
          score += 6;
        }
      }
      if (hasHeavyQuantitativeShape) {
        if (
          /NARRATIVE_WAVE|ADVOCACY_PILLARS|TECHNICAL_GRID|MODULAR_GRID|BROADSHEET/i.test(blueprint.archetype) ||
          blueprint.tags.some((t) => /infografis|data|grid|broadsheet|anggaran|pilar/i.test(t))
        ) {
          score += 6;
        }
      }
      if (hasMitigationOrActionShape) {
        if (
          /ADVOCACY_PILLARS|RETRO_SPLIT_MITIGATION|STREET_JOURNALISM|THRESHOLD_RISOGRAPH|KINETIC_MOTION/i.test(
            blueprint.archetype
          ) ||
          blueprint.tags.some((t) => /advokasi|pilar|solusi|investigatif|aksi/i.test(t))
        ) {
          score += 5;
        }
      }
      if (hasCultureOrHeritageShape) {
        if (
          /HERITAGE|INDIGENOUS|CLASSICAL_MONUMENT|STORYBOOK|POLAROID|GALLERY/i.test(blueprint.archetype) ||
          blueprint.tags.some((t) => /budaya|tradisional|adat|klasik|heritage|nusantara/i.test(t))
        ) {
          score += 6;
        }
      }
      if (hasProfileOrLeadershipShape) {
        if (
          /STATEMENT_PROFILE|POP_OUT_HERO|EXECUTIVE_SEMINAR|SWISS_DUOTONE|VISIONARY_TIMELINE/i.test(
            blueprint.archetype
          ) ||
          blueprint.tags.some((t) => /tokoh|profil|kutipan|kepemimpinan|visioner|hero/i.test(t))
        ) {
          score += 5;
        }
      }

      // Skor kecocokan domain spesifik
      if (/jalan|jembatan|infrastruktur|bangunan|gedung|konstruksi/i.test(normalizedTopic)) {
        if (blueprint.tags.some((t) => /infrastruktur|sinematik|modern|arsitektur|teknis/i.test(t))) score += 4;
      }
      if (/pasar|pedagang|sembako|umkm|tani|pupuk|nelayan|ekonomi/i.test(normalizedTopic)) {
        if (blueprint.tags.some((t) => /kolase|investigatif|risograph|vintage|kerakyatan/i.test(t))) score += 4;
      }
      if (/lingkungan|iklim|sampah|polusi|energi|hutan|air/i.test(normalizedTopic)) {
        if (blueprint.tags.some((t) => /lingkungan|iklim|eco-punk|risograf|organik/i.test(t))) score += 5;
      }

      return { blueprint, score };
    });

    // Urutkan berdasarkan skor relevansi
    scoredPool.sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      return 0.5 - Math.random();
    });

    // Ambil Top 4 kandidat paling relevan dengan bentuk konten + 1 Wildcard untuk variasi ATM
    const topCandidates = scoredPool.slice(0, Math.min(4, scoredPool.length)).map((s) => s.blueprint);
    const remaining = scoredPool.slice(topCandidates.length).map((s) => s.blueprint);
    const candidatePool = [...topCandidates];
    if (remaining.length > 0) {
      const randomWildcard = remaining[Math.floor(Math.random() * remaining.length)];
      if (randomWildcard) candidatePool.push(randomWildcard);
    }

    // -------------------------------------------------------------------------
    // STEP 3: WEIGHTED DRAW DI DALAM TOP CONTENT-SHAPE POOL
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
