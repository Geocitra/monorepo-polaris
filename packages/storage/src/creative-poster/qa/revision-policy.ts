import {
  PosterQAReport,
  CompositionPlan,
  SurfaceMode,
  PosterHeaderPlacement,
  CreativePosterArchetype,
} from '../types.js';

export interface RevisionDecision {
  action: 'NONE' | 'RE_RENDER_SATORI' | 'REGENERATE_IMAGE';
  healed: boolean;
  reason: string;
  newSurfaceMode?: SurfaceMode;
  newHeaderPlacement?: PosterHeaderPlacement;
  scrimBoost?: number;
  alternativeArchetype?: CreativePosterArchetype;
}

export interface EvaluateRevisionOptions {
  report: PosterQAReport;
  currentPlan?: CompositionPlan;
  currentSurfaceMode?: SurfaceMode;
  imageRegenerationCount?: number;
  maxImageRegenerations?: number;
}

/**
 * RevisionPolicy: Kebijakan koreksi mandiri (Self-Healing) berprinsip Zero-Waste.
 * Mengutamakan perbaikan deterministik Satori/CSS sebelum memutuskan regenerasi gambar AI.
 */
export class RevisionPolicy {
  public static evaluateDecision(options: EvaluateRevisionOptions): RevisionDecision {
    const {
      report,
      currentPlan,
      currentSurfaceMode = 'NONE',
      imageRegenerationCount = 0,
      maxImageRegenerations = 1,
    } = options;

    // 1. Jika poster lulus QA, tidak ada revisi yang diperlukan
    if (report.passed) {
      return {
        action: 'NONE',
        healed: false,
        reason: 'Poster memenuhi standar kualitas visual QA',
      };
    }

    const { action, suggestedSurfaceMode, reason } = report.recommendation;

    // 2. Jika benturan visual berat memerlukan regenerasi gambar AI
    if (action === 'REGENERATE_IMAGE') {
      // Pembatasan Keras: Maksimal 1 kali regenerasi gambar untuk mencegah loop tak terbatas
      if (imageRegenerationCount >= maxImageRegenerations) {
        console.warn(
          `[RevisionPolicy] Batas maksimal regenerasi gambar (${maxImageRegenerations}x) tercapai. Menerapkan fallback perlindungan solid band satori.`
        );
        return {
          action: 'RE_RENDER_SATORI',
          healed: true,
          newSurfaceMode: 'SOLID_BAND',
          newHeaderPlacement: currentPlan?.headerPlacement === 'top' ? 'bottom' : 'top',
          reason: 'Fallback darurat: Penerapan Solid Band setelah batas regenerasi AI tercapai',
        };
      }

      return {
        action: 'REGENERATE_IMAGE',
        healed: false,
        reason: reason || 'Benturan elemen visual berat menuntut komposisi gambar AI baru',
      };
    }

    // 3. Zero-Waste Healing: Koreksi deterministik via Satori (< 200ms) tanpa regenerasi gambar
    const targetSurface: SurfaceMode =
      suggestedSurfaceMode ||
      (currentSurfaceMode === 'NONE'
        ? 'SCRIM_GRADIENT'
        : currentSurfaceMode === 'HAIRLINE'
          ? 'SCRIM_GRADIENT'
          : 'SOLID_BAND');

    // Jika subjek foto berada di bagian atas dan menabrak headline, geser penempatan header
    let targetHeaderPlacement = currentPlan?.headerPlacement;
    if (
      report.metrics.subjectCollisionScore > 0.35 &&
      currentPlan?.subjectBoundingBox &&
      currentPlan.subjectBoundingBox.y < 0.4
    ) {
      targetHeaderPlacement = 'bottom';
    }

    return {
      action: 'RE_RENDER_SATORI',
      healed: true,
      newSurfaceMode: targetSurface,
      newHeaderPlacement: targetHeaderPlacement,
      scrimBoost: report.recommendation.scrimOpacityBoost || 0.25,
      reason:
        reason ||
        'Koreksi keterbacaan tipografi melalui penyesuaian deterministik Editorial Surface',
    };
  }

  /**
   * Helper untuk mengaplikasikan pembaruan SurfaceMode & HeaderPlacement ke CompositionPlan
   */
  public static applyHealingToPlan(
    plan: CompositionPlan,
    decision: RevisionDecision
  ): CompositionPlan {
    if (!decision.healed) return plan;

    return {
      ...plan,
      headerPlacement: decision.newHeaderPlacement || plan.headerPlacement,
      layoutVariant:
        decision.newHeaderPlacement === 'bottom'
          ? 'BOTTOM_ANCHOR'
          : decision.newHeaderPlacement === 'top'
            ? 'TOP_BANNER'
            : plan.layoutVariant,
    };
  }
}
