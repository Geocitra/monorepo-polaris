export interface ArticleLengthPlan {
  totalTargetWords: number;
  chapterCount: number;
  wordsPerChapter: number;
  subPointsPerChapter: number;
  maxTokensPerChapter: number;
}

/**
 * ArticleLengthPlanner
 * Memparsing target panjang kata (angka tunggal, rentang "3500-4500", atau label SHORT/MEDIUM/LONG)
 * dan menghitung distribusi bab, sub-poin paragraf, serta batas token yang proporsional.
 */
export class ArticleLengthPlanner {
  public static resolve(targetLength?: string): ArticleLengthPlan {
    const raw = (targetLength || '').trim().toUpperCase();

    let totalTargetWords = 3500;
    if (raw) {
      const normalizedNumText = raw.replace(/\.(?=\d{3}\b)/g, '').replace(/,/g, '');
      const matches = Array.from(normalizedNumText.matchAll(/\b(\d{3,5})\b/g)).map((m) =>
        Number.parseInt(m[1], 10)
      );

      if (matches.length >= 2) {
        const avg = Math.round((matches[0] + matches[1]) / 2);
        totalTargetWords = Math.min(8000, Math.max(500, avg));
      } else if (matches.length === 1) {
        totalTargetWords = Math.min(8000, Math.max(500, matches[0]));
      } else if (raw.includes('SHORT')) {
        totalTargetWords = 850;
      } else if (raw.includes('MEDIUM')) {
        totalTargetWords = 1750;
      } else if (raw.includes('LONG')) {
        totalTargetWords = 3500;
      }
    }

    let chapterCount = 5;
    if (totalTargetWords <= 950) {
      chapterCount = 2;
    } else if (totalTargetWords <= 1450) {
      chapterCount = 3;
    } else if (totalTargetWords <= 2200) {
      chapterCount = 4;
    } else if (totalTargetWords <= 3500) {
      chapterCount = 5;
    } else if (totalTargetWords <= 4800) {
      chapterCount = 6;
    } else {
      chapterCount = 7;
    }

    const wordsPerChapter = Math.ceil(totalTargetWords / chapterCount);
    const subPointsPerChapter = Math.min(8, Math.max(4, Math.ceil(wordsPerChapter / 115)));
    const maxTokensPerChapter = Math.min(6000, Math.max(2200, Math.ceil(wordsPerChapter * 4.5)));

    return {
      totalTargetWords,
      chapterCount,
      wordsPerChapter,
      subPointsPerChapter,
      maxTokensPerChapter,
    };
  }

  /**
   * Menghitung jumlah kata narasi murni (mengabaikan tabel Markdown, blok :::chart, dan komentar HTML).
   */
  public static countNarrativeWords(markdown: string): number {
    if (!markdown) return 0;
    const lines = markdown.split(/\r?\n/);
    const narrativeLines: string[] = [];
    let inSpecialBlock = false;

    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed.startsWith(':::')) {
        inSpecialBlock = !inSpecialBlock;
        continue;
      }
      if (inSpecialBlock) continue;
      if (trimmed.startsWith('|') || (trimmed.endsWith('|') && trimmed.includes('|'))) continue;
      if (trimmed.startsWith('<!--') && trimmed.endsWith('-->')) continue;
      if (trimmed.startsWith('#')) continue;
      narrativeLines.push(trimmed);
    }

    return narrativeLines.join(' ').split(/\s+/).filter(Boolean).length;
  }
}

