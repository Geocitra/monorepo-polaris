import { describe, it, expect } from 'vitest';
import {
  getAdaptiveFontSize,
  wordSafeHeadlineTruncate,
  cleanCircleLabel,
  smartSentenceClamp,
  smartTruncate,
} from '../src/creative-poster/core/adaptive-typography.js';

describe('Adaptive Typography & Word-Safe Micro-Copywriting', () => {
  describe('wordSafeHeadlineTruncate', () => {
    it('harus mempertahankan kata "INFRASTRUKTUR BERKELANJUTAN" (27 karakter) secara utuh tanpa terpotong', () => {
      const title = 'INFRASTRUKTUR BERKELANJUTAN';
      const result = wordSafeHeadlineTruncate(title, 34);
      expect(result).toBe('INFRASTRUKTUR BERKELANJUTAN');
      expect(result.endsWith('BERKELANJUTA')).toBe(false);
      expect(result.endsWith('BERKELANJUTAN')).toBe(true);
      expect(result).not.toContain('...');
    });

    it('harus memotong pada batas kata tanpa memecah huruf tengah kata dan tanpa tanda ellipsis', () => {
      const longTitle = 'INFRASTRUKTUR BERKELANJUTAN MENUJU DAERAH MAJU DAN SEJAHTERA';
      const result = wordSafeHeadlineTruncate(longTitle, 34);
      expect(result.length).toBeLessThanOrEqual(34);
      expect(result).toBe('INFRASTRUKTUR BERKELANJUTAN MENUJU');
      expect(result).not.toContain('...');

      // Jika batasnya 30 karakter, kata MENUJU tidak boleh masuk dan tidak boleh terpotong tengah kata
      const result30 = wordSafeHeadlineTruncate(longTitle, 30);
      expect(result30).toBe('INFRASTRUKTUR BERKELANJUTAN');
      expect(result30.length).toBeLessThanOrEqual(30);
      expect(result30).not.toContain('...');
    });

    it('harus mempertahankan kata pertama jika kata pertama sudah sangat panjang', () => {
      const singleLongWord = 'PERTANGGUNGJAWABAN';
      const result = wordSafeHeadlineTruncate(singleLongWord, 10);
      expect(result).toBe('PERTANGGUNGJAWABAN');
    });
  });

  describe('cleanCircleLabel', () => {
    it('harus menghasilkan 1 kata pendek tanpa ellipsis untuk "Cakupan Layanan"', () => {
      const result = cleanCircleLabel('Cakupan Layanan', 11);
      expect(result).toBe('CAKUPAN');
      expect(result).not.toContain('...');
      expect(result).not.toContain(' ');
    });

    it('harus menghasilkan 1 kata pendek untuk "Fasilitas Siaga"', () => {
      const result = cleanCircleLabel('Fasilitas Siaga', 11);
      expect(result).toBe('FASILITAS');
      expect(result).not.toContain('...');
    });

    it('harus membersihkan titik di ujung label', () => {
      const result = cleanCircleLabel('Setidaknya...', 11);
      expect(result).toBe('SETIDAKNYA');
      expect(result).not.toContain('.');
    });
  });

  describe('smartSentenceClamp', () => {
    it('harus memotong pada akhir kalimat utuh terdekat (. atau ;) jika posisi berada di >= 55% batas', () => {
      const text =
        'Pembangunan jalan desa telah rampung tepat waktu. Seluruh warga kini menikmati akses transportasi yang jauh lebih lancar dan aman untuk perekonomian lokal.';
      const clamped = smartSentenceClamp(text, 70);
      expect(clamped).toBe('Pembangunan jalan desa telah rampung tepat waktu.');
      expect(clamped.endsWith('.')).toBe(true);
      expect(clamped).not.toContain('...');
    });

    it('harus mengakhiri kalimat dengan titik bersih jika terpaksa memotong pada batas kata', () => {
      const longSentence =
        'Kebijakan pengawasan distribusi pupuk subsidi bertujuan meningkatkan produktivitas hasil tani daerah konstituen secara berkesinambungan dan terpadu';
      const clamped = smartSentenceClamp(longSentence, 80);
      expect(clamped.length).toBeLessThanOrEqual(81);
      expect(clamped.endsWith('.')).toBe(true);
      expect(clamped).not.toContain('...');
    });
  });

  describe('getAdaptiveFontSize', () => {
    it('harus menurunkan ukuran font secara proporsional jika teks memuat kata panjang >= 13 karakter', () => {
      const baseSize = 88;
      const minSize = 48;
      const sizeNormal = getAdaptiveFontSize('PEMBANGUNAN DESA', baseSize, minSize, 20);
      const sizeLongWord = getAdaptiveFontSize('INFRASTRUKTUR BERKELANJUTAN', baseSize, minSize, 20);

      expect(sizeLongWord).toBeLessThan(sizeNormal);
      expect(sizeLongWord).toBeGreaterThanOrEqual(52);
      expect(sizeLongWord).toBeLessThanOrEqual(68);
    });
  });

  describe('smartTruncate fallback', () => {
    it('harus mengalihkan teks paragraf panjang (>= 60 char) ke smartSentenceClamp tanpa ellipsis menggantung', () => {
      const paragraph =
        'Pemerintah daerah bersama dinas terkait melakukan inspeksi berkala. Pengawalan terus berlanjut hingga seluruh program terlaksana secara optimal.';
      const truncated = smartTruncate(paragraph, 85);
      expect(truncated.endsWith('.')).toBe(true);
      expect(truncated).not.toContain('...');
    });
  });
});
