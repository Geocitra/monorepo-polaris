import { describe, it, expect } from 'vitest';
import { TwoStageArticleEngine } from '../src/two-stage-article.engine.js';

describe('Master Editorial Rules Sanitizer & Formatting', () => {
  it('harus menghapus garis pemisah horizontal (---, ***, ===) di antara bab dan paragraf', () => {
    const rawInput = `## Bab I: Pendahuluan
--------------------------------
Ini adalah paragraf pertama tentang kebijakan daerah.

--------------------------------
## Bab II: Analisis Data
***
Ini adalah paragraf kedua setelah pemisah.
================================
Ini adalah paragraf penutup.`;

    const sanitized = TwoStageArticleEngine.normalizeFormattingSpaces(
      TwoStageArticleEngine.sanitizeMicroLinguistics(rawInput)
    );

    // Pastikan tidak ada karakter pemisah horizontal tersisa
    expect(sanitized).not.toContain('---');
    expect(sanitized).not.toContain('***');
    expect(sanitized).not.toContain('===');
    expect(sanitized).not.toContain('--------------------------------');

    // Pastikan bab diformat bersih tanpa titik dua dan tanpa em dash
    expect(sanitized).toContain('## Bab I. Pendahuluan');
    expect(sanitized).toContain('## Bab II. Analisis Data');
  });

  it('harus tetap menjaga keutuhan baris pemisah kolom pada tabel Markdown', () => {
    const inputWithTable = `## Bab II. Data Lapangan

Berikut adalah data perbandingan:

| Sektor | Target | Realisasi |
| :--- | :--- | :--- |
| Pertanian | 80% | 85% |
| Irigasi | 50% | 62% |

Paragraf setelah tabel harus tetap rapi.`;

    const sanitized = TwoStageArticleEngine.normalizeFormattingSpaces(inputWithTable);

    // Tabel tidak boleh rusak
    expect(sanitized).toContain('| :--- | :--- | :--- |');
    expect(sanitized).toContain('| Pertanian | 80% | 85% |');
  });

  it('harus menghapus em dash dan menggantinya dengan tanda baca alami', () => {
    const textWithEmDash = 'Pemerintah Daerah — melalui Dinas Pertanian — telah menyalurkan bantuan bibit.';
    const sanitized = TwoStageArticleEngine.sanitizeMicroLinguistics(textWithEmDash);

    expect(sanitized).not.toContain('—');
    expect(sanitized).toContain('Pemerintah Daerah, melalui Dinas Pertanian, telah menyalurkan bantuan bibit.');
  });

  it('harus memfilter kata terlarang "sekadar" dan "nyata" secara leksikal deterministik', () => {
    const textWithForbiddenWords = 'Pembangunan ini bukan sekadar retorika, melainkan langkah nyata dan bukti nyata demi dampak nyata warga.';
    const sanitized = TwoStageArticleEngine.sanitizeMicroLinguistics(textWithForbiddenWords);

    expect(sanitized).not.toContain('sekadar');
    expect(sanitized).not.toContain('nyata');
    expect(sanitized).toContain('tidak hanya retorika');
    expect(sanitized).toContain('langkah konkret');
    expect(sanitized).toContain('bukti konkret');
    expect(sanitized).toContain('dampak konkret');
  });
});
