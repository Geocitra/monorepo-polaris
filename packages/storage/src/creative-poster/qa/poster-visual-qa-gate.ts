import sharp from 'sharp';
import {
  CompositionPlan,
  ResolvedColorTokens,
  PosterQAReport,
  PosterQAMetrics,
  PosterQARecommendation,
  SurfaceMode,
} from '../types.js';

export interface VisualQAEvaluationOptions {
  compositeBuffer: Buffer;
  plan?: CompositionPlan;
  resolvedColors: ResolvedColorTokens;
  surfaceMode?: SurfaceMode;
  canvasWidth?: number;
  canvasHeight?: number;
  visionAuditor?: (jpegBuffer: Buffer) => Promise<{
    score: number;
    issues: string[];
    needsRegeneration?: boolean;
    suggestedSurfaceMode?: SurfaceMode;
  }>;
}

/**
 * Menghitung relative luminance (WCAG 2.1 formula)
 */
function calculateRelativeLuminance(r: number, g: number, b: number): number {
  const rsRGB = r / 255;
  const gsRGB = g / 255;
  const bsRGB = b / 255;

  const rLinear = rsRGB <= 0.03928 ? rsRGB / 12.92 : Math.pow((rsRGB + 0.055) / 1.055, 2.4);
  const gLinear = gsRGB <= 0.03928 ? gsRGB / 12.92 : Math.pow((gsRGB + 0.055) / 1.055, 2.4);
  const bLinear = bsRGB <= 0.03928 ? bsRGB / 12.92 : Math.pow((bsRGB + 0.055) / 1.055, 2.4);

  return 0.2126 * rLinear + 0.7152 * gLinear + 0.0722 * bLinear;
}

/**
 * Mengonversi hex color string ke RGB [r, g, b]
 */
function hexToRgb(hex: string): [number, number, number] {
  const clean = hex.replace('#', '');
  if (clean.length === 3) {
    return [
      parseInt(clean[0] + clean[0], 16),
      parseInt(clean[1] + clean[1], 16),
      parseInt(clean[2] + clean[2], 16),
    ];
  }
  return [
    parseInt(clean.slice(0, 2), 16) || 255,
    parseInt(clean.slice(2, 4), 16) || 255,
    parseInt(clean.slice(4, 6), 16) || 255,
  ];
}

/**
 * Helper untuk normalisasi ZoneRect ke koordinat piksel absolut
 */
function getRectBounds(rect: any, canvasWidth: number, canvasHeight: number) {
  const rawX = rect?.x ?? 0;
  const rawY = rect?.y ?? 0;
  const rawW = rect?.w ?? rect?.width ?? 0;
  const rawH = rect?.h ?? rect?.height ?? 0;

  const x = rawX <= 1.0 ? rawX * canvasWidth : rawX;
  const y = rawY <= 1.0 ? rawY * canvasHeight : rawY;
  const width = rawW <= 1.0 ? rawW * canvasWidth : rawW;
  const height = rawH <= 1.0 ? rawH * canvasHeight : rawH;

  return { x, y, width, height };
}

/**
 * PosterVisualQAGate: Evaluator kualitas visual deterministik dan vision auditor
 * untuk mendeteksi low-contrast, text-subject collision, dan margin overflow.
 */
export class PosterVisualQAGate {
  public static async evaluateQuality(
    options: VisualQAEvaluationOptions
  ): Promise<PosterQAReport> {
    const {
      compositeBuffer,
      plan,
      resolvedColors,
      surfaceMode = 'NONE',
      canvasWidth = 1080,
      canvasHeight = 1350,
      visionAuditor,
    } = options;

    const issues: string[] = [];
    let marginIntegrityScore = 1.0;
    let overflowDetected = false;
    let contrastRatio = 4.5;
    let subjectCollisionScore = 0.0;

    // -------------------------------------------------------------
    // TAHAP 1: Evaluasi Deterministik Cepat (< 50ms)
    // -------------------------------------------------------------

    // 1. Pemeriksaan Integritas Margin & Overflow
    const zones = plan?.zones || [
      {
        role: 'PRIMARY_HEADLINE' as const,
        rect: { x: 54, y: 80, w: canvasWidth - 108, h: 260 },
      },
    ];

    let invalidZones = 0;
    for (const zone of zones) {
      const { x, y, width, height } = getRectBounds(zone.rect, canvasWidth, canvasHeight);

      // Cek overflow kanvas
      if (x < 0 || y < 0 || x + width > canvasWidth || y + height > canvasHeight) {
        overflowDetected = true;
        issues.push(`ZONE_CANVAS_OVERFLOW: ${zone.role} keluar batas kanvas`);
      }

      // Cek batas margin aman (min 20px)
      if (x < 20 || y < 20 || x + width > canvasWidth - 20 || y + height > canvasHeight - 20) {
        invalidZones++;
      }
    }

    if (zones.length > 0) {
      marginIntegrityScore = Math.max(0, 1.0 - (invalidZones / zones.length) * 0.5);
      if (marginIntegrityScore < 0.8) {
        issues.push('MARGIN_TOO_TIGHT: Elemen teks berada terlalu dekat ke tepi kanvas');
      }
    }

    // 2. Analisis Kontras Luminansi pada Zona Headline Utama
    const headlineZone =
      zones.find((z) => z.role === 'PRIMARY_HEADLINE') || zones[0];
    const headlineBounds = getRectBounds(headlineZone.rect, canvasWidth, canvasHeight);

    try {
      const extractLeft = Math.max(0, Math.min(canvasWidth - 50, Math.floor(headlineBounds.x)));
      const extractTop = Math.max(0, Math.min(canvasHeight - 50, Math.floor(headlineBounds.y)));
      const extractWidth = Math.max(50, Math.min(canvasWidth - extractLeft, Math.floor(headlineBounds.width)));
      const extractHeight = Math.max(50, Math.min(canvasHeight - extractTop, Math.floor(headlineBounds.height)));

      const stats = await sharp(compositeBuffer)
        .extract({
          left: extractLeft,
          top: extractTop,
          width: extractWidth,
          height: extractHeight,
        })
        .stats();

      const bgR = stats.channels[0]?.mean ?? 128;
      const bgG = stats.channels[1]?.mean ?? 128;
      const bgB = stats.channels[2]?.mean ?? 128;

      const bgLum = calculateRelativeLuminance(bgR, bgG, bgB);

      const [tR, tG, tB] = hexToRgb(resolvedColors.textColor || (resolvedColors.isDark ? '#FFFFFF' : '#0F172A'));
      const textLum = calculateRelativeLuminance(tR, tG, tB);

      const maxLum = Math.max(bgLum, textLum);
      const minLum = Math.min(bgLum, textLum);
      contrastRatio = Number(((maxLum + 0.05) / (minLum + 0.05)).toFixed(2));

      // Jika kontras < 3.0:1 dan tidak menggunakan surface protektif
      if (contrastRatio < 3.0 && surfaceMode === 'NONE') {
        issues.push(`LOW_CONTRAST_HEADLINE: Rasio kontras teks hanya ${contrastRatio}:1 (min 3.0:1)`);
      }
    } catch (err: any) {
      // Fallback aman jika ekstraksi gagal
      contrastRatio = 4.5;
    }

    // 3. Deteksi Benturan Subjek Foto & Zona Teks (Geometric Intersection)
    if (plan?.subjectBoundingBox) {
      const sub = getRectBounds(plan.subjectBoundingBox, canvasWidth, canvasHeight);
      const hl = headlineBounds;

      const interX1 = Math.max(sub.x, hl.x);
      const interY1 = Math.max(sub.y, hl.y);
      const interX2 = Math.min(sub.x + sub.width, hl.x + hl.width);
      const interY2 = Math.min(sub.y + sub.height, hl.y + hl.height);

      if (interX2 > interX1 && interY2 > interY1) {
        const interArea = (interX2 - interX1) * (interY2 - interY1);
        const headlineArea = hl.width * hl.height;
        const overlapRatio = interArea / headlineArea;

        subjectCollisionScore = Number(overlapRatio.toFixed(2));

        if (overlapRatio > 0.65) {
          issues.push(`MAJOR_SUBJECT_OCCLUSION: Subjek menutupi ${(overlapRatio * 100).toFixed(0)}% area headline`);
        } else if (overlapRatio > 0.30 && surfaceMode === 'NONE') {
          issues.push(`TEXT_SUBJECT_OVERLAP: Teks bersinggungan ${(overlapRatio * 100).toFixed(0)}% dengan subjek tanpa scrim`);
        }
      }
    }

    // Hitung Skor Deterministik (0.0 - 1.0)
    let score = 1.0;
    if (contrastRatio < 3.0 && surfaceMode === 'NONE') score -= 0.35;
    if (subjectCollisionScore > 0.65) score -= 0.40;
    else if (subjectCollisionScore > 0.30 && surfaceMode === 'NONE') score -= 0.20;
    if (marginIntegrityScore < 0.8) score -= 0.20;
    if (overflowDetected) score -= 0.50;

    score = Math.max(0.0, Math.min(1.0, Number(score.toFixed(2))));
    let passed = score >= 0.70 && !overflowDetected;
    let recommendationAction: 'NONE' | 'ADJUST_SURFACE' | 'REGENERATE_IMAGE' = 'NONE';
    let suggestedSurfaceMode: SurfaceMode | undefined = undefined;
    let scrimOpacityBoost: number | undefined = undefined;
    let reason: string | undefined = undefined;

    if (subjectCollisionScore > 0.65) {
      recommendationAction = 'REGENERATE_IMAGE';
      reason = 'Subjek foto terlalu dominan dan memblokir zona judul secara masif';
    } else if (contrastRatio < 3.0 || (subjectCollisionScore > 0.25 && surfaceMode === 'NONE')) {
      recommendationAction = 'ADJUST_SURFACE';
      suggestedSurfaceMode = 'SCRIM_GRADIENT';
      scrimOpacityBoost = 0.25;
      reason = 'Tingkatkan keterbacaan teks dengan menerapkan scrim gradient tanpa regenerasi gambar';
    }

    // -------------------------------------------------------------
    // TAHAP 2: Multimodal Vision Auditor (Opsional & Non-blocking)
    // -------------------------------------------------------------
    if (visionAuditor) {
      try {
        const thumbnail = await sharp(compositeBuffer)
          .resize({ width: 540, withoutEnlargement: true })
          .jpeg({ quality: 80 })
          .toBuffer();

        const visionResult = await visionAuditor(thumbnail);
        if (visionResult && typeof visionResult.score === 'number') {
          // Gabungkan hasil vision dengan deterministik
          score = Number(((score * 0.6) + (visionResult.score * 0.4)).toFixed(2));
          if (visionResult.issues && visionResult.issues.length > 0) {
            issues.push(...visionResult.issues);
          }
          if (visionResult.needsRegeneration && recommendationAction !== 'REGENERATE_IMAGE') {
            recommendationAction = 'REGENERATE_IMAGE';
            reason = visionResult.issues[0] || 'Vision audit mendeteksi benturan visual berat';
          } else if (visionResult.suggestedSurfaceMode && recommendationAction === 'NONE') {
            recommendationAction = 'ADJUST_SURFACE';
            suggestedSurfaceMode = visionResult.suggestedSurfaceMode;
          }
          passed = score >= 0.70 && recommendationAction !== 'REGENERATE_IMAGE';
        }
      } catch (err: any) {
        console.warn(`[PosterVisualQAGate] Vision audit dilewati setelah gagal: ${err?.message}`);
        // Fallback anggun: gunakan hasil deterministik
      }
    }

    const metrics: PosterQAMetrics = {
      marginIntegrityScore,
      contrastRatio,
      overflowDetected,
      subjectCollisionScore,
    };

    const recommendation: PosterQARecommendation = {
      action: recommendationAction,
      suggestedSurfaceMode,
      scrimOpacityBoost,
      reason,
    };

    return {
      passed,
      score,
      stage: visionAuditor ? 'VISION_AUDIT' : 'DETERMINISTIC',
      issues,
      metrics,
      recommendation,
    };
  }
}
