import { describe, it, expect } from 'vitest';
import { LkpjIndicatorDirection } from '@polaris/shared-types';
import { LkpjEvaluationAiService } from '../lkpj-evaluation-ai.service.js';

describe('LkpjEvaluationAiService (Deterministic Metrics & Material Analysis)', () => {
  describe('calculateDeterministicMetrics', () => {
    it('menghitung HIGHER_IS_BETTER dengan akurat', () => {
      const res = LkpjEvaluationAiService.calculateDeterministicMetrics({
        targetValue: 80,
        realizationValue: 90,
        indicatorDirection: LkpjIndicatorDirection.HIGHER_IS_BETTER,
        budgetCeilingIdr: 1_000_000_000,
        budgetRealizationIdr: 850_000_000,
      });

      expect(res.achievementGap).toBe(10);
      expect(res.achievementPercentage).toBe(112.5);
      expect(res.budgetAbsorptionPercentage).toBe(85);
    });

    it('menghitung LOWER_IS_BETTER (contoh: angka kemiskinan / stunting) dengan akurat', () => {
      const res = LkpjEvaluationAiService.calculateDeterministicMetrics({
        targetValue: 8,
        realizationValue: 7,
        indicatorDirection: LkpjIndicatorDirection.LOWER_IS_BETTER,
      });

      expect(res.achievementGap).toBe(1);
      expect(res.achievementPercentage).toBe(114.29);
      expect(res.budgetAbsorptionPercentage).toBeNull();
    });

    it('menghitung LOWER_IS_BETTER saat realisasi 0 (target tercapai 100%)', () => {
      const res = LkpjEvaluationAiService.calculateDeterministicMetrics({
        targetValue: 5,
        realizationValue: 0,
        indicatorDirection: LkpjIndicatorDirection.LOWER_IS_BETTER,
      });

      expect(res.achievementGap).toBe(5);
      expect(res.achievementPercentage).toBe(100);
    });

    it('menghitung TARGET_BAND berdasarkan deviasi terhadap target', () => {
      const res = LkpjEvaluationAiService.calculateDeterministicMetrics({
        targetValue: 100,
        realizationValue: 95,
        indicatorDirection: LkpjIndicatorDirection.TARGET_BAND,
      });

      expect(res.achievementGap).toBe(-5);
      expect(res.achievementPercentage).toBe(95);
    });

    it('menangani pagu anggaran 0 atau null tanpa pembagian nol', () => {
      const res = LkpjEvaluationAiService.calculateDeterministicMetrics({
        targetValue: 0,
        realizationValue: 50,
        budgetCeilingIdr: 0,
        budgetRealizationIdr: 100,
      });

      expect(res.achievementGap).toBe(50);
      expect(res.achievementPercentage).toBeNull();
      expect(res.budgetAbsorptionPercentage).toBeNull();
    });
  });

  describe('analyzeUploadedEvaluationMaterial', () => {
    it('menandai teks terlalu pendek (<80 karakter) ke antrean verifikasi manual (confidence 0.45)', () => {
      const result = LkpjEvaluationAiService.analyzeUploadedEvaluationMaterial({
        extractedText: 'Scan LKPJ halaman 1',
        fileName: 'scan-lkpj.pdf',
        mimeType: 'application/pdf',
        materialTitle: 'Scan LKPJ 2025',
      });

      expect(result.extractionConfidence).toBe(0.45);
      expect(result.doubtfulQueueNotes).toBeTruthy();
    });

    it('memberi confidence 0.68 untuk PDF ringkas (<250 karakter)', () => {
      const shortPdfText = 'Laporan Keterangan Pertanggungjawaban Kepala Daerah Tahun Anggaran 2025 Dinas Pekerjaan Umum dan Penataan Ruang mencakup capaian jalan mantap sebesar 78% dengan serapan anggaran sebesar 84%.';
      const result = LkpjEvaluationAiService.analyzeUploadedEvaluationMaterial({
        extractedText: shortPdfText,
        fileName: 'ringkasan.pdf',
        mimeType: 'application/pdf',
        materialTitle: 'Ringkasan LKPJ',
      });

      expect(result.extractionConfidence).toBe(0.68);
      expect(result.doubtfulQueueNotes).toBeTruthy();
    });

    it('memberi confidence 0.92 dan tanpa catatan ragu jika ekstraksi memadai', () => {
      const fullText = 'A'.repeat(300);
      const result = LkpjEvaluationAiService.analyzeUploadedEvaluationMaterial({
        extractedText: fullText,
        fileName: 'dokumen-lengkap.pdf',
        mimeType: 'application/pdf',
        materialTitle: 'Dokumen LKPJ Lengkap',
      });

      expect(result.extractionConfidence).toBe(0.92);
      expect(result.doubtfulQueueNotes).toBeNull();
    });
  });
});
