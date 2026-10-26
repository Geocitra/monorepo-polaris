import {
  CompositionPlan,
  CompositionZone,
  PosterLayoutVariant,
  PosterHeaderPlacement,
  PosterCardArrangement,
  SurfaceMode,
  SubjectCompositionMode,
  resolveColorAuthority,
} from '@polaris/shared-types';
import { PreAnalyzedPosterBlueprint, SynthesizedEditorialCopy } from './types.js';

export interface PlanCompositionOptions {
  blueprint: PreAnalyzedPosterBlueprint;
  copy: SynthesizedEditorialCopy;
  compositionMode?: SubjectCompositionMode;
  seed?: string | number;
  tenantBrandHex?: string;
  strictlyEnforceBrandColor?: boolean;
}

export class CompositionPlanner {
  /**
   * Merancang CompositionPlan deterministik & adaptif
   * berdasarkan variasi aturan blueprint dan keputusan Art Director AI.
   */
  public static planComposition(options: PlanCompositionOptions): CompositionPlan {
    const {
      blueprint,
      copy,
      compositionMode = 'PUBLIC_ADVOCACY',
      tenantBrandHex,
      strictlyEnforceBrandColor,
    } = options;

    const allowedVariants: PosterLayoutVariant[] =
      blueprint.variationRules?.allowedLayoutVariants || [
        'TOP_BANNER',
        'BOTTOM_ANCHOR',
        'EDITORIAL_SPLIT',
        'CENTERED_HERO',
      ];

    // 1. Tentukan layoutVariant yang valid
    let layoutVariant: PosterLayoutVariant = copy.layoutVariant || 'TOP_BANNER';
    if (!allowedVariants.includes(layoutVariant)) {
      layoutVariant = allowedVariants[0] || 'TOP_BANNER';
    }

    // 2. Tentukan headerPlacement & cardArrangement
    const allowedPlacements: PosterHeaderPlacement[] =
      blueprint.variationRules?.allowedHeaderPlacements || ['top', 'bottom', 'center'];
    let headerPlacement: PosterHeaderPlacement = copy.headerPlacement || 'top';
    if (!allowedPlacements.includes(headerPlacement)) {
      headerPlacement = layoutVariant === 'BOTTOM_ANCHOR' ? 'bottom' : 'top';
    }

    const allowedArrangements: PosterCardArrangement[] =
      blueprint.variationRules?.allowedCardArrangements || [
        'stacked',
        'horizontal_split',
        'single_hero_card',
        'grid_compact',
      ];
    let cardArrangement: PosterCardArrangement = copy.cardArrangement || 'stacked';
    if (!allowedArrangements.includes(cardArrangement)) {
      cardArrangement = allowedArrangements[0] || 'stacked';
    }

    // 3. Resolusi warna otoritas tunggal (Single Color Authority)
    const resolvedColors = resolveColorAuthority({
      blueprintPalette: blueprint.colorPalette,
      tenantBrandHex,
      strictlyEnforceBrandColor,
      colorMoodAccent: copy.primaryAccent,
      colorMoodSecondary: copy.secondaryAccent,
      canMutatePalette: blueprint.variationRules?.canMutatePalette ?? true,
    });

    // 4. Konstruksi Zona Spasial adaptif berdasarkan layoutVariant
    const zones = this.buildZones(
      layoutVariant,
      headerPlacement,
      cardArrangement,
      compositionMode
    );

    const defaultSurface: SurfaceMode =
      blueprint.fixedConstraints?.baseBackgroundTone === 'DARK'
        ? 'SCRIM_GRADIENT'
        : 'NONE';

    return {
      blueprintId: blueprint.id,
      archetype: blueprint.archetype,
      layoutVariant,
      headerPlacement,
      cardArrangement,
      zones,
      primaryAccent: resolvedColors.primaryAccent,
      secondaryAccent: resolvedColors.secondaryAccent,
      textColor: resolvedColors.textColor,
      backgroundBase: resolvedColors.backgroundBase,
      surfaceMode: defaultSurface,
    };
  }

  /**
   * Menghasilkan daftar zona spasial berkoordinat normalisasi (0.0 - 1.0)
   */
  private static buildZones(
    layoutVariant: PosterLayoutVariant,
    headerPlacement: PosterHeaderPlacement,
    cardArrangement: PosterCardArrangement,
    compositionMode: SubjectCompositionMode
  ): CompositionZone[] {
    const zones: CompositionZone[] = [];

    // Official Emblem (Corner Locked)
    zones.push({
      id: 'official_emblem',
      role: 'OFFICIAL_EMBLEM',
      rect: { x: 0.82, y: 0.03, w: 0.12, h: 0.05 },
      zIndex: 10,
    });

    if (layoutVariant === 'BOTTOM_ANCHOR') {
      // Judul di bawah, visual focal di atas
      zones.push({
        id: 'visual_focal',
        role: 'VISUAL_FOCAL_POINT',
        rect: { x: 0.05, y: 0.08, w: 0.90, h: 0.48 },
        zIndex: 1,
      });
      zones.push({
        id: 'editorial_body',
        role: 'EDITORIAL_BODY',
        rect: { x: 0.08, y: 0.58, w: 0.84, h: 0.16 },
        zIndex: 5,
      });
      zones.push({
        id: 'headline',
        role: 'HEADLINE',
        rect: { x: 0.08, y: 0.75, w: 0.84, h: 0.16 },
        zIndex: 6,
      });
      zones.push({
        id: 'member_signature',
        role: 'MEMBER_SIGNATURE',
        rect: { x: 0.08, y: 0.92, w: 0.84, h: 0.05 },
        zIndex: 7,
      });
    } else if (layoutVariant === 'EDITORIAL_SPLIT') {
      // Split kolom kiri (naskah & judul) vs kolom kanan (visual)
      zones.push({
        id: 'headline',
        role: 'HEADLINE',
        rect: { x: 0.06, y: 0.10, w: 0.44, h: 0.22 },
        zIndex: 6,
      });
      zones.push({
        id: 'editorial_body',
        role: 'EDITORIAL_BODY',
        rect: { x: 0.06, y: 0.34, w: 0.44, h: 0.54 },
        zIndex: 5,
      });
      zones.push({
        id: 'visual_focal',
        role: 'VISUAL_FOCAL_POINT',
        rect: { x: 0.52, y: 0.10, w: 0.42, h: 0.78 },
        zIndex: 1,
      });
      zones.push({
        id: 'member_signature',
        role: 'MEMBER_SIGNATURE',
        rect: { x: 0.06, y: 0.90, w: 0.88, h: 0.06 },
        zIndex: 7,
      });
    } else if (layoutVariant === 'CENTERED_HERO') {
      // Pernyataan berpusat di tengah kanvas
      zones.push({
        id: 'subheader',
        role: 'SUBHEADER',
        rect: { x: 0.10, y: 0.12, w: 0.80, h: 0.06 },
        zIndex: 5,
      });
      zones.push({
        id: 'headline',
        role: 'HEADLINE',
        rect: { x: 0.08, y: 0.36, w: 0.84, h: 0.24 },
        zIndex: 6,
      });
      zones.push({
        id: 'editorial_body',
        role: 'EDITORIAL_BODY',
        rect: { x: 0.10, y: 0.65, w: 0.80, h: 0.20 },
        zIndex: 5,
      });
      zones.push({
        id: 'member_signature',
        role: 'MEMBER_SIGNATURE',
        rect: { x: 0.10, y: 0.90, w: 0.80, h: 0.05 },
        zIndex: 7,
      });
    } else {
      // TOP_BANNER (Default Klasik)
      zones.push({
        id: 'subheader',
        role: 'SUBHEADER',
        rect: { x: 0.08, y: 0.05, w: 0.84, h: 0.04 },
        zIndex: 5,
      });
      zones.push({
        id: 'headline',
        role: 'HEADLINE',
        rect: { x: 0.08, y: 0.09, w: 0.84, h: 0.18 },
        zIndex: 6,
      });
      zones.push({
        id: 'visual_focal',
        role: 'VISUAL_FOCAL_POINT',
        rect: { x: 0.05, y: 0.29, w: 0.90, h: 0.44 },
        zIndex: 1,
      });
      zones.push({
        id: 'editorial_body',
        role: 'EDITORIAL_BODY',
        rect: { x: 0.08, y: 0.74, w: 0.84, h: 0.16 },
        zIndex: 5,
      });
      zones.push({
        id: 'member_signature',
        role: 'MEMBER_SIGNATURE',
        rect: { x: 0.08, y: 0.92, w: 0.84, h: 0.05 },
        zIndex: 7,
      });
    }

    // Jika mode Tokoh (FIGURE_CENTERPIECE) diaktifkan
    if (compositionMode === 'FIGURE_CENTERPIECE') {
      zones.push({
        id: 'subject_figure',
        role: 'SUBJECT',
        rect: { x: 0.50, y: 0.32, w: 0.46, h: 0.68 },
        zIndex: 4,
      });
    }

    return zones;
  }

  /**
   * Mengonversi CompositionPlan menjadi instruksi spasial optik dan pencahayaan murni
   * untuk model difusi (Imagen / DALL-E).
   * Dilarang keras menyebut nama komponen UI, tipografi, atau kode HEX.
   * Dilengkapi kompensasi crop (+12% padding) jika target kanvas 9:16 dipotong ke 4:5.
   */
  public static zonesToSpatialPrompt(
    plan: CompositionPlan,
    blueprint: PreAnalyzedPosterBlueprint,
    isPreCrop916 = false
  ): string {
    const compensation = isPreCrop916 ? 0.12 : 0.0;
    const { layoutVariant } = plan;

    let spatialDirectives = '';

    if (layoutVariant === 'BOTTOM_ANCHOR') {
      const bottomClearancePct = Math.round((0.38 + compensation) * 100);
      spatialDirectives = `
[SPATIAL COMPOSITION - BOTTOM-WEIGHTED CALM COMPOSITION]
- The upper 60% of the frame features the primary authentic environmental focal point, architectural depth, or landscape.
- The bottom ${bottomClearancePct}% of the canvas MUST be an uncluttered, quiet, low-contrast negative space with soft directional shadows, a smooth dark gradient, or a calm uniform surface with minimal visual detail.
`.trim();
    } else if (layoutVariant === 'EDITORIAL_SPLIT') {
      spatialDirectives = `
[SPATIAL COMPOSITION - ASYMMETRICAL EDITORIAL COMPOSITION]
- The left 50% of the canvas MUST be a calm, uniform, low-detail atmospheric field with soft ambient lighting and minimal visual noise.
- The right 50% of the canvas features the rich contextual documentary environment, architectural depth, and authentic textures.
`.trim();
    } else if (layoutVariant === 'CENTERED_HERO') {
      spatialDirectives = `
[SPATIAL COMPOSITION - CENTERED COMPOSITION]
- The central 40% horizontal band and upper margins MUST remain clean, expansive, and spacious negative space with minimal visual noise and a gentle atmospheric field.
- Surrounding outer borders carry soft ambient vignette and organic depth without cluttering the center.
`.trim();
    } else {
      // TOP_BANNER / Default
      const topClearancePct = Math.round((0.35 + compensation) * 100);
      const bottomClearancePct = Math.round((0.22 + compensation) * 100);
      spatialDirectives = `
[SPATIAL COMPOSITION - TOP-FOCUSED OPEN COMPOSITION]
- The upper ${topClearancePct}% of the canvas MUST be an uncluttered, soft-focus atmospheric open sky or calm uniform surface with minimal visual detail and clean breathing room.
- The central section houses the primary documentary environment, authentic regional infrastructure, or landscape depth.
- The bottom ${bottomClearancePct}% MUST provide a quiet, softly lit foreground with gentle shadows and minimal visual distraction.
`.trim();
    }

    return spatialDirectives;
  }
}
