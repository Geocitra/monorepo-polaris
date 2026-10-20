import { describe, it, expect } from 'vitest';
import { TwoStageArticleEngine, EditorialStyleProfileResolver } from '../src/two-stage-article.engine.js';
import { MasterEditorialSanitizer } from '../src/master-editorial-sanitizer.js';

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

  it('tidak boleh merusak kata berimbuhan seperti "menyatakan", "pernyataan", "kenyataan", "ternyata"', () => {
    const text = 'Bupati menyatakan bahwa kenyataan di lapangan ternyata berbeda dengan pernyataan dinas.';
    const sanitized = MasterEditorialSanitizer.sanitize(text);

    expect(sanitized).toContain('menyatakan');
    expect(sanitized).toContain('kenyataan');
    expect(sanitized).toContain('ternyata');
    expect(sanitized).toContain('pernyataan');
  });

  it('harus membersihkan kamus hitam AI slop (angin segar, garda terdepan, tonggak bersejarah, dll)', () => {
    const slopText = 'Program ini membawa angin segar dan menjadi tonggak bersejarah bagi dinas di garda terdepan. Pada hakikatnya seyogianya niscaya berhasil melalui sinergi yang komprehensif.';
    const sanitized = MasterEditorialSanitizer.sanitize(slopText);

    expect(sanitized).not.toContain('angin segar');
    expect(sanitized).not.toContain('tonggak bersejarah');
    expect(sanitized).not.toContain('garda terdepan');
    expect(sanitized).not.toContain('pada hakikatnya');
    expect(sanitized).not.toContain('seyogianya');
    expect(sanitized).not.toContain('niscaya');
    expect(sanitized).not.toContain('sinergi yang komprehensif');
    expect(sanitized).toContain('peluang baru');
    expect(sanitized).toContain('capaian penting');
    expect(sanitized).toContain('lini utama');
  });

  it('harus membersihkan judul dari titik dua dan formula klise "Topik: Subjudul"', () => {
    const rawHeadline = 'Transformasi Pertanian: Langkah Menuju Kemakmuran Petani';
    const cleaned = MasterEditorialSanitizer.cleanHeadline(rawHeadline);

    expect(cleaned).not.toContain(':');
    expect(cleaned).toContain('Transformasi Pertanian Menuju Kemakmuran Petani');
  });

  it('harus menyucikan naskah poster sintetis dan sosial dari em dash, sekadar, dan kata nyata', () => {
    const rawPosterTitle = 'SOLUSI NYATA — BUKAN SEKADAR JANJI';
    const rawPosterBody = 'Langkah nyata pemerintah, dinas terkait, dan masyarakat untuk hasil nyata.';

    const sanitizedTitle = TwoStageArticleEngine.sanitizeMicroLinguistics(rawPosterTitle);
    const sanitizedBody = TwoStageArticleEngine.sanitizeMicroLinguistics(rawPosterBody);

    expect(sanitizedTitle).not.toContain('—');
    expect(sanitizedTitle).not.toContain('NYATA');
    expect(sanitizedTitle).not.toContain('SEKADAR');
    expect(sanitizedTitle).toContain('SOLUSI KONKRET');

    expect(sanitizedBody).not.toContain('nyata');
    expect(sanitizedBody).toContain('Langkah konkret');
    expect(sanitizedBody).not.toContain(', dan'); // Oxford comma removed
  });
});

describe('EditorialStyleProfileResolver (BR-01 & BR-03)', () => {
  it('harus mengembalikan profil POPULER dengan heading format JOURNALISTIC_FLOW', () => {
    const profile = EditorialStyleProfileResolver.resolve('POPULER', 'Humanis & Lapangan');

    expect(profile.style).toBe('POPULER');
    expect(profile.headingFormat).toBe('JOURNALISTIC_FLOW');
    expect(profile.framingMandate).toContain('HUMANIS & LAPANGAN');
    expect(profile.lexicalMandates.some((m) => m.includes('DILARANG MENGGUNAKAN JARGON BIROKRASI KAKU'))).toBe(true);
  });

  it('harus mengembalikan profil AKADEMIS dengan heading format FORMAL_NUMBERED dan mandat sitasi bukti', () => {
    const profile = EditorialStyleProfileResolver.resolve('AKADEMIS');

    expect(profile.style).toBe('AKADEMIS');
    expect(profile.headingFormat).toBe('FORMAL_NUMBERED');
    expect(profile.lexicalMandates.some((m) => m.includes('[^EV-x]'))).toBe(true);
  });

  it('harus mengembalikan profil KRITIS dengan tabel audit klaim vs fakta deviasi', () => {
    const profile = EditorialStyleProfileResolver.resolve('KRITIS', 'Pengawasan & Kritis');

    expect(profile.style).toBe('KRITIS');
    expect(profile.headingFormat).toBe('FORMAL_NUMBERED');
    expect(profile.framingMandate).toContain('PENGAWASAN & KRITIS');
  });

  it('harus mengembalikan profil SOLUTIF dengan rasio 30% masalah dan 70% solusi konkret', () => {
    const profile = EditorialStyleProfileResolver.resolve('SOLUTIF', 'Solutif & Anggaran');

    expect(profile.style).toBe('SOLUTIF');
    expect(profile.headingFormat).toBe('FORMAL_NUMBERED');
    expect(profile.framingMandate).toContain('ANGGARAN');
    expect(profile.lexicalMandates.some((m) => m.includes('30% Masalah, 70% Solusi Konkret'))).toBe(true);
  });
});
