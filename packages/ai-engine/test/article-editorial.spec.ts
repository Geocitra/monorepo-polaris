import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ArticleLengthPlanner } from '../src/editorial/article-length.planner.js';
import { EditorialStyleProfileResolver } from '../src/editorial/editorial-style.resolver.js';
import { TwoStageArticleEngine } from '../src/two-stage-article.engine.js';
import * as clientModule from '../src/client.js';

describe('ArticleLengthPlanner, EditorialStyleProfileResolver & TwoStageArticleEngine', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('ArticleLengthPlanner.resolve harus memparsing target angka tunggal, rentang, dan batas aman', () => {
    const p4000 = ArticleLengthPlanner.resolve('4000 kata');
    expect(p4000.totalTargetWords).toBe(4000);
    expect(p4000.chapterCount).toBe(6);
    expect(p4000.wordsPerChapter).toBe(667);
    expect(p4000.subPointsPerChapter).toBeGreaterThanOrEqual(6);

    const pRange = ArticleLengthPlanner.resolve('3500-4500');
    expect(pRange.totalTargetWords).toBe(4000);
    expect(pRange.chapterCount).toBe(6);

    const p2500 = ArticleLengthPlanner.resolve('2.500');
    expect(p2500.totalTargetWords).toBe(2500);
    expect(p2500.chapterCount).toBe(5);

    const pShort = ArticleLengthPlanner.resolve('SHORT');
    expect(pShort.totalTargetWords).toBe(850);
    expect(pShort.chapterCount).toBe(2);

    const pClamped = ArticleLengthPlanner.resolve('50000');
    expect(pClamped.totalTargetWords).toBe(8000);
  });

  it('ArticleLengthPlanner.countNarrativeWords hanya menghitung kata narasi murni di luar tabel dan chart', () => {
    const md = `## Bab 1. Masalah Distribusi

Pemerintah daerah mencatat keterlambatan pasokan pupuk di lima kecamatan selama kuartal pertama tahun ini.

| Wilayah | Alokasi | Realisasi |
| --- | --- | --- |
| Bandung | 100 | 70 |

:::chart
{"type":"bar","title":"Data","labels":["A"],"datasets":[{"label":"X","data":[1]}]}
:::

<!-- VISUAL_SLOT: {"type":"INFOGRAPHIC"} -->`;

    const count = ArticleLengthPlanner.countNarrativeWords(md);
    expect(count).toBe(14);
  });

  it('EditorialStyleProfileResolver harus mendukung gaya FEATURE/MAJALAH dan OPINI ke profil JOURNALISTIC_FLOW', () => {
    const profile = EditorialStyleProfileResolver.resolve('FEATURE_MAJALAH', 'HUMANIS');
    expect(profile.style).toBe('POPULER');
    expect(profile.headingFormat).toBe('JOURNALISTIC_FLOW');
    expect(profile.framingMandate).toContain('HUMANIS');
  });

  it('TwoStageArticleEngine.generateChapter harus memicu maksimal 1x expansion pass jika narasi < 75% target', async () => {
    const shortParagraph = Array.from({ length: 80 }, () => 'kata').join(' ');
    const expansionParagraph = Array.from({ length: 450 }, () => 'analisis').join(' ');

    const mockCreate = vi
      .fn()
      .mockResolvedValueOnce({
        choices: [
          {
            message: {
              content: `## Bab I. Uji Panjang\n\n${shortParagraph}\n<!-- CHAPTER_SUMMARY: Ringkasan bab uji. -->`,
            },
          },
        ],
        usage: { prompt_tokens: 100, completion_tokens: 120 },
      })
      .mockResolvedValueOnce({
        choices: [
          {
            message: {
              content: expansionParagraph,
            },
          },
        ],
        usage: { prompt_tokens: 150, completion_tokens: 550 },
      });

    vi.spyOn(clientModule, 'getTextCompletionClient').mockReturnValue({
      client: { chat: { completions: { create: mockCreate } } } as any,
      isRouter: false,
      resolveModel: (m: string) => m,
    });

    const result = await TwoStageArticleEngine.generateChapter(
      {
        chapterNumber: 'Bab I',
        title: 'Uji Panjang',
        targetWords: 680,
        substanceFocus: 'Uji ekspansi',
        formatStyle: 'NARRATIVE_ONLY',
      },
      'Judul Uji Artikel',
      {
        topic: 'Uji Panjang',
        regionalContextData: 'Data uji',
      }
    );

    expect(mockCreate).toHaveBeenCalledTimes(2);
    expect(result.chapterSummary).toBe('Ringkasan bab uji.');
    expect(result.chapterMarkdown).not.toContain('CHAPTER_SUMMARY');
    expect(ArticleLengthPlanner.countNarrativeWords(result.chapterMarkdown)).toBeGreaterThanOrEqual(500);
  });
});

