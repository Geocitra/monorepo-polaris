import { describe, it, expect, vi } from 'vitest';
import sharp from 'sharp';
import {
  PosterVisualQAGate,
  RevisionPolicy,
  CreativePosterCompositor,
} from '../src/index.js';
import { CompositionPlan, ResolvedColorTokens } from '@polaris/shared-types';

describe('Fase 3: Visual Quality Evaluation & Self-Healing Revision Loop', () => {
  const dummyColors: ResolvedColorTokens = {
    primaryAccent: '#DC2626',
    secondaryAccent: '#FEF08A',
    backgroundBase: '#0F172A',
    textColor: '#FFFFFF',
    subTextColor: '#94A3B8',
    cardBackground: 'rgba(15, 23, 42, 0.75)',
    cardBorder: 'rgba(220, 38, 38, 0.3)',
    source: 'BLUEPRINT',
    isDark: true,
  };

  const samplePlan: CompositionPlan = {
    blueprintId: 'TPL-01-HERO',
    archetype: 'POP_OUT_HERO',
    layoutVariant: 'TOP_BANNER',
    headerPlacement: 'top',
    cardArrangement: 'stacked',
    zones: [
      {
        role: 'PRIMARY_HEADLINE' as any,
        rect: { x: 54, y: 80, w: 972, h: 260 },
      },
    ],
    primaryAccent: '#DC2626',
    secondaryAccent: '#FEF08A',
    textColor: '#FFFFFF',
    backgroundBase: '#0F172A',
    surfaceMode: 'NONE',
    subjectBoundingBox: { x: 0.5, y: 0.4, w: 0.45, h: 0.6 },
  };

  describe('1. PosterVisualQAGate (Deterministik & Multimodal)', () => {
    it('harus meluluskan poster jika kontras teks tinggi dan margin aman', async () => {
      // Background gelap pekat (Luminance ~0) dengan teks putih (Luminance ~1.0) -> Kontras sangat tinggi
      const darkBuffer = await sharp({
        create: {
          width: 1080,
          height: 1350,
          channels: 3,
          background: { r: 15, g: 23, b: 42 },
        },
      })
        .png()
        .toBuffer();

      const report = await PosterVisualQAGate.evaluateQuality({
        compositeBuffer: darkBuffer,
        plan: samplePlan,
        resolvedColors: dummyColors, // Teks putih
        surfaceMode: 'NONE',
      });

      expect(report.passed).toBe(true);
      expect(report.score).toBeGreaterThanOrEqual(0.70);
      expect(report.metrics.contrastRatio).toBeGreaterThan(4.5);
      expect(report.metrics.overflowDetected).toBe(false);
      expect(report.recommendation.action).toBe('NONE');
    });

    it('harus mendeteksi LOW_CONTRAST_HEADLINE dan merekomendasikan ADJUST_SURFACE', async () => {
      // Background putih terang dengan teks putih tanpa scrim -> Kontras sangat rendah (< 1.5:1)
      const brightBuffer = await sharp({
        create: {
          width: 1080,
          height: 1350,
          channels: 3,
          background: { r: 250, g: 250, b: 250 },
        },
      })
        .png()
        .toBuffer();

      const report = await PosterVisualQAGate.evaluateQuality({
        compositeBuffer: brightBuffer,
        plan: samplePlan,
        resolvedColors: dummyColors, // Teks putih pada latar putih
        surfaceMode: 'NONE',
      });

      expect(report.passed).toBe(false);
      expect(report.issues.some((i) => i.includes('LOW_CONTRAST_HEADLINE'))).toBe(true);
      expect(report.recommendation.action).toBe('ADJUST_SURFACE');
      expect(report.recommendation.suggestedSurfaceMode).toBe('SCRIM_GRADIENT');
    });

    it('harus mendeteksi ZONE_CANVAS_OVERFLOW jika koordinat zona keluar kanvas', async () => {
      const normalBuffer = await sharp({
        create: {
          width: 1080,
          height: 1350,
          channels: 3,
          background: { r: 20, g: 20, b: 30 },
        },
      })
        .png()
        .toBuffer();

      const overflowPlan: CompositionPlan = {
        ...samplePlan,
        zones: [
          {
            role: 'PRIMARY_HEADLINE' as any,
            rect: { x: 50, y: 1200, w: 1000, h: 300 }, // 1200 + 300 = 1500 > 1350 (OVERFLOW!)
          },
        ],
      };

      const report = await PosterVisualQAGate.evaluateQuality({
        compositeBuffer: normalBuffer,
        plan: overflowPlan,
        resolvedColors: dummyColors,
      });

      expect(report.passed).toBe(false);
      expect(report.metrics.overflowDetected).toBe(true);
      expect(report.issues.some((i) => i.includes('ZONE_CANVAS_OVERFLOW'))).toBe(true);
    });

    it('harus mendeteksi MAJOR_SUBJECT_OCCLUSION dan merekomendasikan REGENERATE_IMAGE', async () => {
      const normalBuffer = await sharp({
        create: {
          width: 1080,
          height: 1350,
          channels: 3,
          background: { r: 20, g: 20, b: 30 },
        },
      })
        .png()
        .toBuffer();

      const severeCollisionPlan: CompositionPlan = {
        ...samplePlan,
        // Subjek foto menempati posisi yang sama persis dengan headline
        subjectBoundingBox: { x: 54, y: 80, w: 972, h: 260 },
      };

      const report = await PosterVisualQAGate.evaluateQuality({
        compositeBuffer: normalBuffer,
        plan: severeCollisionPlan,
        resolvedColors: dummyColors,
      });

      expect(report.passed).toBe(false);
      expect(report.metrics.subjectCollisionScore).toBeGreaterThan(0.65);
      expect(report.recommendation.action).toBe('REGENERATE_IMAGE');
    });

    it('harus memadukan evaluasi Multimodal Vision Auditor dan bertahan anggun jika vision gagal', async () => {
      const normalBuffer = await sharp({
        create: {
          width: 1080,
          height: 1350,
          channels: 3,
          background: { r: 20, g: 20, b: 30 },
        },
      })
        .png()
        .toBuffer();

      // Mock Vision Auditor berhasil
      const mockVisionAuditor = vi.fn().mockResolvedValue({
        score: 0.95,
        issues: [],
      });

      const report = await PosterVisualQAGate.evaluateQuality({
        compositeBuffer: normalBuffer,
        plan: samplePlan,
        resolvedColors: dummyColors,
        visionAuditor: mockVisionAuditor,
      });

      expect(report.stage).toBe('VISION_AUDIT');
      expect(mockVisionAuditor).toHaveBeenCalled();
      expect(report.passed).toBe(true);

      // Mock Vision Auditor melempar error koneksi -> harus graceful fallback ke deterministik
      const failingVision = vi.fn().mockRejectedValue(new Error('Rate limit exceeded'));
      const fallbackReport = await PosterVisualQAGate.evaluateQuality({
        compositeBuffer: normalBuffer,
        plan: samplePlan,
        resolvedColors: dummyColors,
        visionAuditor: failingVision,
      });

      expect(fallbackReport).toBeDefined();
      expect(fallbackReport.score).toBeGreaterThan(0);
    });
  });

  describe('2. RevisionPolicy (Zero-Waste Self-Healing Logic)', () => {
    it('harus mengembalikan action NONE jika poster telah lulus QA', () => {
      const decision = RevisionPolicy.evaluateDecision({
        report: {
          passed: true,
          score: 0.92,
          stage: 'DETERMINISTIC',
          issues: [],
          metrics: {
            marginIntegrityScore: 1.0,
            contrastRatio: 6.5,
            overflowDetected: false,
            subjectCollisionScore: 0.1,
          },
          recommendation: { action: 'NONE' },
        },
      });

      expect(decision.action).toBe('NONE');
      expect(decision.healed).toBe(false);
    });

    it('harus memutuskan RE_RENDER_SATORI dengan SCRIM_GRADIENT untuk isu kontras rendah', () => {
      const decision = RevisionPolicy.evaluateDecision({
        report: {
          passed: false,
          score: 0.65,
          stage: 'DETERMINISTIC',
          issues: ['LOW_CONTRAST_HEADLINE'],
          metrics: {
            marginIntegrityScore: 1.0,
            contrastRatio: 2.2,
            overflowDetected: false,
            subjectCollisionScore: 0.0,
          },
          recommendation: {
            action: 'ADJUST_SURFACE',
            suggestedSurfaceMode: 'SCRIM_GRADIENT',
          },
        },
        currentSurfaceMode: 'NONE',
      });

      expect(decision.action).toBe('RE_RENDER_SATORI');
      expect(decision.healed).toBe(true);
      expect(decision.newSurfaceMode).toBe('SCRIM_GRADIENT');
    });

    it('harus mengizinkan REGENERATE_IMAGE hanya 1 kali jika terjadi benturan berat', () => {
      // Percobaan pertama (imageRegenerationCount === 0) -> Boleh regenerate AI
      const firstDecision = RevisionPolicy.evaluateDecision({
        report: {
          passed: false,
          score: 0.40,
          stage: 'DETERMINISTIC',
          issues: ['MAJOR_SUBJECT_OCCLUSION'],
          metrics: {
            marginIntegrityScore: 1.0,
            contrastRatio: 4.5,
            overflowDetected: false,
            subjectCollisionScore: 0.85,
          },
          recommendation: {
            action: 'REGENERATE_IMAGE',
            reason: 'Subjek menutupi headline',
          },
        },
        imageRegenerationCount: 0,
        maxImageRegenerations: 1,
      });

      expect(firstDecision.action).toBe('REGENERATE_IMAGE');
      expect(firstDecision.healed).toBe(false);

      // Percobaan kedua (imageRegenerationCount >= 1) -> DILARANG looping! Wajib fallback ke SOLID_BAND satori
      const secondDecision = RevisionPolicy.evaluateDecision({
        report: {
          passed: false,
          score: 0.40,
          stage: 'DETERMINISTIC',
          issues: ['MAJOR_SUBJECT_OCCLUSION'],
          metrics: {
            marginIntegrityScore: 1.0,
            contrastRatio: 4.5,
            overflowDetected: false,
            subjectCollisionScore: 0.85,
          },
          recommendation: {
            action: 'REGENERATE_IMAGE',
            reason: 'Subjek masih menutupi headline',
          },
        },
        imageRegenerationCount: 1,
        maxImageRegenerations: 1,
      });

      expect(secondDecision.action).toBe('RE_RENDER_SATORI');
      expect(secondDecision.healed).toBe(true);
      expect(secondDecision.newSurfaceMode).toBe('SOLID_BAND');
    });
  });

  describe('3. End-to-End Self-Healing di CreativePosterCompositor', () => {
    it('harus otomatis menyembuhkan kontras rendah melalui re-render Satori saat autoHealContrast aktif', async () => {
      // Buat background putih terang
      const brightBackground = await sharp({
        create: {
          width: 1000,
          height: 1000,
          channels: 3,
          background: { r: 252, g: 252, b: 252 },
        },
      })
        .jpeg()
        .toBuffer();

      // Jalankan composePoster dengan teks putih pada background putih (kontras rendah)
      // tetapi dengan autoHealContrast: true
      const result = await CreativePosterCompositor.composePoster({
        backgroundBuffer: brightBackground,
        headline: 'ADVOKASI ANGGARAN RAKYAT',
        quote: 'Keterbukaan informasi demi keadilan sosial.',
        memberName: 'AHMAD FAUZI',
        memberTitle: 'KOMISI IV DPR RI',
        archetype: 'SWISS_DUOTONE_EDITORIAL',
        primaryAccentColor: '#DC2626',
        resolvedColors: {
          ...dummyColors,
          textColor: '#FFFFFF', // Teks putih pada latar terang -> memicu self-healing
          backgroundBase: '#FFFFFF',
        },
        canvasWidth: 1080,
        canvasHeight: 1350,
        outputFormat: 'webp',
        enableVisualQA: true,
        autoHealContrast: true,
      });

      expect(result).toBeDefined();
      expect(result.qaReport).toBeDefined();
      expect(result.qaReport?.recommendation.reason).toContain('Self-healed via Satori');
    });
  });
});
