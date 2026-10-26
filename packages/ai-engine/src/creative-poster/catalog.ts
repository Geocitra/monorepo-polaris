import { PreAnalyzedPosterBlueprint } from './types.js';

/**
 * POLARIS Pre-Analyzed Poster Blueprint Catalog (22 Variasi Lengkap)
 * Seluruh 22 file referensi dari uploads/references/poster/ dipetakan ke dalam
 * cetak biru desain struktural dengan rasio 4:5 (1080x1350px), slot tipografi adaptif,
 * dan panduan ruang negatif (negative space) untuk komposisi AI.
 */
export const POSTER_BLUEPRINT_CATALOG: PreAnalyzedPosterBlueprint[] = [
  // ---------------------------------------------------------------------------
  // 1. THE CINEMATIC POP-OUT HERO
  // ---------------------------------------------------------------------------
  {
    id: 'TPL-01-POP-OUT-HERO',
    name: 'The Cinematic Pop-Out Hero',
    archetype: 'POP_OUT_HERO',
    referenceFile: 'Minimal Poster Design with Bold Typography _ Cinematic Layout & Editorial Style.jpg',
    description: 'Bingkai framed cream vintage dengan subjek menerobos kotak foto dan memotong judul condensed tebal di belakangnya.',
    tags: ['sinematik', 'bold', 'hero', 'pop-out', 'modern', 'editorial'],
    aspectRatio: '4:5',
    colorPalette: {
      primaryAccent: '#EA580C',
      secondaryAccent: '#FB923C',
      backgroundBase: '#F6F3EB',
      textColor: '#111827',
      subTextColor: '#4B5563',
    },
    scenePromptHint: 'Dramatic cinematic aerial or environmental documentary shot with authentic 35mm film grain, soft atmospheric daylight, high-end editorial magazine art direction.',
    negativeSpaceZone: 'The top 35% of the frame MUST be an uncluttered, soft-focus atmospheric open sky with low detail. The central lower section houses the authentic environmental scenery.',
    slotManifest: {
      canvas: { width: 1080, height: 1350, aspectRatio: '4:5' },
      slots: {
        subjectPhoto: { x: 0.28, y: 0.22, w: 0.44, h: 0.65, anchor: 'center', popOutEffect: true, popOutOverflowTopPx: 75, shadowOpacity: 0.45, shadowBlur: 25 },
        headlineBlock: { x: 0.08, y: 0.08, w: 0.84, maxLines: 1, fontFamily: 'Bebas Neue', fontSizePx: 96, textColor: '#EA580C', isUppercase: true, interlockingWithSubject: true },
        quoteStatement: { x: 0.15, y: 0.38, w: 0.70, fontFamily: 'Plus Jakarta Sans', fontSizePx: 16, textColor: '#374151' },
        memberIdentity: { x: 0.10, y: 0.88, w: 0.45, nameFontSizePx: 20, titleFontSizePx: 13, nameColor: '#111827', titleColor: '#6B7280', badgeStyle: 'minimal' },
        officialEmblem: { x: 0.08, y: 0.03, w: 0.12, maxHeightPx: 42, placement: 'top-left', showInstitutionBadge: true },
        editorialAccents: { showBarcode: true, barcodeCoordinate: { x: 0.42, y: 0.92, w: 0.16 }, editionTag: 'POLARIS FIELD NOTES // EDITION 2026', editionCoordinate: { x: 0.60, y: 0.035, w: 0.32 } },
      },
    },

    fixedConstraints: {
      baseBackgroundTone: 'WARM_PAPER',
      requiredFontFamilies: {
        headline: 'Bebas Neue',
        body: 'Plus Jakarta Sans',
      },
      imageNegativeAllow: ['banner', 'frame', 'border'],
      toneSafety: 'ALL_TOPICS',
    },
    variationRules: {
      allowedLayoutVariants: ['TOP_BANNER', 'BOTTOM_ANCHOR', 'EDITORIAL_SPLIT', 'CENTERED_HERO'],
      allowedHeaderPlacements: ['top', 'bottom', 'center'],
      allowedCardArrangements: ['stacked', 'horizontal_split', 'single_hero_card', 'grid_compact'],
      canMutatePalette: true,
    },
  },

  // ---------------------------------------------------------------------------
  // 2. STREET JOURNALISM RISOGRAPH
  // ---------------------------------------------------------------------------
  {
    id: 'TPL-02-STREET-JOURNALISM',
    name: 'Street Journalism Risograph',
    archetype: 'STREET_JOURNALISM',
    referenceFile: 'POSTER PKL.jpg',
    description: 'Grid jurnalisme investigatif dengan montase foto lapangan, kontras duotone merah-hitam, dan kotak judul solid block.',
    tags: ['investigatif', 'duotone', 'risograph', 'kolase', 'brutalis'],
    aspectRatio: '4:5',
    colorPalette: {
      primaryAccent: '#DC2626',
      secondaryAccent: '#F87171',
      backgroundBase: '#F5F5F0',
      textColor: '#0A0A0A',
      subTextColor: '#333333',
    },
    scenePromptHint: 'Raw, gritty documentary photography with authentic atmospheric contrast. High-contrast reportage with subtle risograph halftone dot texture.',
    negativeSpaceZone: 'The left 50% and bottom 25% feature quiet architectural depth and deep shadow zones with smooth, low-contrast surfaces.',
    slotManifest: {
      canvas: { width: 1080, height: 1350, aspectRatio: '4:5' },
      editorialBlocks: [
        { slotId: 'left_positive', role: 'COLUMN_SECTION', coordinate: { x: 0.05, y: 0.08, w: 0.32 }, typography: { headerFont: 'Anton', headerSizePx: 36, headerColor: '#9E0B0F', bodyFont: 'Plus Jakarta Sans', bodySizePx: 12, bodyColor: '#18181B', textAlign: 'justify' }, constraints: { headerMaxChars: 20, bodyMinChars: 180, bodyMaxChars: 250 }, defaultReferenceHeader: 'TINJAUAN POSITIF' },
        { slotId: 'left_negative_box', role: 'SOLID_COLOR_BOX', coordinate: { x: 0.05, y: 0.22, w: 0.32 }, typography: { headerFont: 'Anton', headerSizePx: 32, headerColor: '#FFFFFF', bodyFont: 'Plus Jakarta Sans', bodySizePx: 12, bodyColor: '#FFFFFF', boxBgColor: '#9E0B0F', textAlign: 'justify' }, constraints: { headerMaxChars: 20, bodyMinChars: 180, bodyMaxChars: 250 }, defaultReferenceHeader: 'TINJAUAN TANTANGAN' },
        { slotId: 'center_giant_title', role: 'GIANT_STACKED_TITLE', coordinate: { x: 0.40, y: 0.08, w: 0.22 }, typography: { headerFont: 'Bebas Neue', headerSizePx: 88, headerColor: '#9E0B0F', bodyFont: 'Plus Jakarta Sans', bodySizePx: 12, bodyColor: '#18181B', textAlign: 'justify' }, constraints: { headerMaxChars: 14, bodyMinChars: 120, bodyMaxChars: 180 }, defaultReferenceHeader: 'SOLUSI KONKRET' },
        { slotId: 'right_cause', role: 'COLUMN_SECTION', coordinate: { x: 0.65, y: 0.32, w: 0.30 }, typography: { headerFont: 'Anton', headerSizePx: 42, headerColor: '#9E0B0F', bodyFont: 'Plus Jakarta Sans', bodySizePx: 12, bodyColor: '#18181B', textAlign: 'justify' }, constraints: { headerMaxChars: 20, bodyMinChars: 150, bodyMaxChars: 220 }, defaultReferenceHeader: 'AKSI BERSAMA' },
      ],
      slots: {
        subjectPhoto: { x: 0.58, y: 0.20, w: 0.38, h: 0.58, anchor: 'bottom-right', popOutEffect: false, shadowOpacity: 0.35, shadowBlur: 15 },
        headlineBlock: { x: 0.06, y: 0.12, w: 0.52, maxLines: 2, fontFamily: 'Anton', fontSizePx: 72, textColor: '#FFFFFF', bgColor: '#DC2626', isUppercase: true },
        quoteStatement: { x: 0.06, y: 0.88, w: 0.88, fontFamily: 'Plus Jakarta Sans', fontSizePx: 14, textColor: '#FFFFFF' },
        memberIdentity: { x: 0.06, y: 0.94, w: 0.45, nameFontSizePx: 18, titleFontSizePx: 12, nameColor: '#FFFFFF', titleColor: '#DC2626' },
        officialEmblem: { x: 0.82, y: 0.04, w: 0.12, maxHeightPx: 38, placement: 'top-right' },
      },
    },

    fixedConstraints: {
      baseBackgroundTone: 'WARM_PAPER',
      requiredFontFamilies: {
        headline: 'Anton',
        body: 'Plus Jakarta Sans',
      },
      imageNegativeAllow: ['banner', 'frame', 'border'],
      toneSafety: 'ALL_TOPICS',
    },
    variationRules: {
      allowedLayoutVariants: ['TOP_BANNER', 'BOTTOM_ANCHOR', 'EDITORIAL_SPLIT', 'CENTERED_HERO'],
      allowedHeaderPlacements: ['top', 'bottom', 'center'],
      allowedCardArrangements: ['stacked', 'horizontal_split', 'single_hero_card', 'grid_compact'],
      canMutatePalette: false,
    },
  },

  // ---------------------------------------------------------------------------
  // 3. THE STATEMENT PROFILE & LEGACY
  // ---------------------------------------------------------------------------
  {
    id: 'TPL-03-STATEMENT-PROFILE',
    name: 'The Statement Profile & Legacy',
    archetype: 'STATEMENT_PROFILE',
    referenceFile: 'Biografi Singkat Steve Jobs.jpg',
    description: 'Potret tokoh karismatik berwibawa dengan kutipan tegas, tipografi elegan berbobot tinggi, dan kartu identitas kepemimpinan.',
    tags: ['tokoh', 'profil', 'kutipan', 'integritas', 'kepemimpinan', 'wawancara'],
    aspectRatio: '4:5',
    colorPalette: {
      primaryAccent: '#4F46E5',
      secondaryAccent: '#818CF8',
      backgroundBase: '#111827',
      textColor: '#FFFFFF',
      subTextColor: '#9CA3AF',
    },
    scenePromptHint: 'Studio portrait setting with dramatic low-key rim lighting, clean dark background, authentic 35mm film grain, high-end editorial magazine cover style.',
    negativeSpaceZone: 'The left 55% of the frame consists of calm, clean deep shadows and a soft ambient gradient with minimal noise.',
    slotManifest: {
      canvas: { width: 1080, height: 1350, aspectRatio: '4:5' },
      slots: {
        subjectPhoto: { x: 0.50, y: 0.15, w: 0.48, h: 0.75, anchor: 'center', popOutEffect: false, shadowOpacity: 0.5, shadowBlur: 30 },
        headlineBlock: { x: 0.08, y: 0.18, w: 0.55, maxLines: 2, fontFamily: 'Anton', fontSizePx: 80, textColor: '#FFFFFF', isUppercase: true },
        quoteStatement: { x: 0.08, y: 0.48, w: 0.50, fontFamily: 'Plus Jakarta Sans', fontSizePx: 16, textColor: '#E5E7EB' },
        memberIdentity: { x: 0.08, y: 0.85, w: 0.45, nameFontSizePx: 22, titleFontSizePx: 13, nameColor: '#FFFFFF', titleColor: '#818CF8', badgeStyle: 'glassmorphic' },
        officialEmblem: { x: 0.82, y: 0.05, w: 0.12, maxHeightPx: 40, placement: 'top-right' },
      },
    },

    fixedConstraints: {
      baseBackgroundTone: 'DARK',
      requiredFontFamilies: {
        headline: 'Anton',
        body: 'Plus Jakarta Sans',
      },
      imageNegativeAllow: ['banner', 'frame', 'border'],
      toneSafety: 'ALL_TOPICS',
    },
    variationRules: {
      allowedLayoutVariants: ['TOP_BANNER', 'BOTTOM_ANCHOR', 'EDITORIAL_SPLIT', 'CENTERED_HERO'],
      allowedHeaderPlacements: ['top', 'bottom', 'center'],
      allowedCardArrangements: ['stacked', 'horizontal_split', 'single_hero_card', 'grid_compact'],
      canMutatePalette: true,
    },
  },

  // ---------------------------------------------------------------------------
  // 4. RETRO PUBLIC INFORMATION CAMPAIGN
  // ---------------------------------------------------------------------------
  {
    id: 'TPL-04-RETRO-CAMPAIGN',
    name: 'Retro Public Information Campaign',
    archetype: 'RETRO_CAMPAIGN',
    referenceFile: 'Poster Acara.jpg',
    description: 'Desain poster edukasi publik klasik 70s-80s dengan pita vintage, border berbingkai, dan kotak ganda isu & solusi.',
    tags: ['vintage', 'retro', 'kampanye', 'edukasi', '70s', '80s'],
    aspectRatio: '4:5',
    colorPalette: {
      primaryAccent: '#D97706',
      secondaryAccent: '#FBBF24',
      backgroundBase: '#FFFBEB',
      textColor: '#18181B',
      subTextColor: '#52525B',
    },
    scenePromptHint: 'Vintage 1970s public educational lithograph illustration with muted retro color grading, tactile paper grain, and authentic nostalgic atmosphere.',
    negativeSpaceZone: 'The central visual field maintains a tranquil, warm aged paper texture with ample breathing room.',
    slotManifest: {
      canvas: { width: 1080, height: 1350, aspectRatio: '4:5' },
      slots: {
        subjectPhoto: { x: 0.50, y: 0.35, w: 0.45, h: 0.45, anchor: 'center' },
        headlineBlock: { x: 0.08, y: 0.08, w: 0.84, maxLines: 2, fontFamily: 'Anton', fontSizePx: 84, textColor: '#18181B', isUppercase: true },
        memberIdentity: { x: 0.08, y: 0.90, w: 0.50, nameFontSizePx: 20, titleFontSizePx: 12, nameColor: '#FFFFFF', titleColor: '#FEF08A' },
        officialEmblem: { x: 0.82, y: 0.04, w: 0.12, maxHeightPx: 36, placement: 'top-right' },
      },
    },

    fixedConstraints: {
      baseBackgroundTone: 'WARM_PAPER',
      requiredFontFamilies: {
        headline: 'Anton',
        body: 'Plus Jakarta Sans',
      },
      imageNegativeAllow: ['banner', 'frame', 'border'],
      toneSafety: 'ALL_TOPICS',
    },
    variationRules: {
      allowedLayoutVariants: ['TOP_BANNER', 'BOTTOM_ANCHOR', 'EDITORIAL_SPLIT', 'CENTERED_HERO'],
      allowedHeaderPlacements: ['top', 'bottom', 'center'],
      allowedCardArrangements: ['stacked', 'horizontal_split', 'single_hero_card', 'grid_compact'],
      canMutatePalette: true,
    },
  },

  // ---------------------------------------------------------------------------
  // 5. TECHNO VERITAS BROADSHEET (TORN PAPER)
  // ---------------------------------------------------------------------------
  {
    id: 'TPL-05-TORN-PAPER-NEWS',
    name: 'Techno Veritas Broadsheet (Torn Paper)',
    archetype: 'TORN_PAPER_NEWS',
    referenceFile: 'Techno Veritas Volume 1 Issue 1.jpg',
    description: 'Koran investigatif antik dengan robekan kertas melintang (torn paper centerfold), lencana statistik bulat, dan kode QR.',
    tags: ['koran', 'broadsheet', 'torn-paper', 'arsip', 'investigasi', 'editorial'],
    aspectRatio: '4:5',
    colorPalette: {
      primaryAccent: '#9E0B0F',
      secondaryAccent: '#F87171',
      backgroundBase: '#F4F1EA',
      textColor: '#18181B',
      subTextColor: '#52525B',
    },
    scenePromptHint: 'High-impact photojournalistic documentary photograph in the style of Time Magazine / Reuters, atmospheric background, 35mm film documentary texture.',
    negativeSpaceZone: 'The upper and lower margins remain quiet, soft-focus atmospheric space with low visual clutter.',
    slotManifest: {
      canvas: { width: 1080, height: 1350, aspectRatio: '4:5' },
      slots: {
        subjectPhoto: { x: 0.50, y: 0.30, w: 0.50, h: 0.45, anchor: 'center' },
        headlineBlock: { x: 0.06, y: 0.08, w: 0.88, maxLines: 2, fontFamily: 'Anton', fontSizePx: 82, textColor: '#18181B', isUppercase: true },
        memberIdentity: { x: 0.06, y: 0.90, w: 0.45, nameFontSizePx: 18, titleFontSizePx: 12, nameColor: '#18181B', titleColor: '#9E0B0F' },
        officialEmblem: { x: 0.82, y: 0.02, w: 0.10, maxHeightPx: 38, placement: 'top-right' },
      },
    },

    fixedConstraints: {
      baseBackgroundTone: 'WARM_PAPER',
      requiredFontFamilies: {
        headline: 'Anton',
        body: 'Plus Jakarta Sans',
      },
      imageNegativeAllow: ['banner', 'frame', 'border'],
      toneSafety: 'ALL_TOPICS',
    },
    variationRules: {
      allowedLayoutVariants: ['TOP_BANNER', 'BOTTOM_ANCHOR', 'EDITORIAL_SPLIT', 'CENTERED_HERO'],
      allowedHeaderPlacements: ['top', 'bottom', 'center'],
      allowedCardArrangements: ['stacked', 'horizontal_split', 'single_hero_card', 'grid_compact'],
      canMutatePalette: true,
    },
  },

  // ---------------------------------------------------------------------------
  // 6. RETRO SAFETY & MITIGATION GUIDE
  // ---------------------------------------------------------------------------
  {
    id: 'TPL-06-RETRO-MITIGATION',
    name: 'Retro Safety & Mitigation Guide',
    archetype: 'RETRO_SPLIT_MITIGATION',
    referenceFile: 'EARTHQUAKE INFOGRAFIS RETRO STYLE.jpg',
    description: 'Format infografis edukasi keselamatan publik: Banner atas kapsul, 2 kartu horizontal di tengah dengan circular inset image, dan split 2 kolom bawah.',
    tags: ['edukasi', 'panduan', 'infografis', 'keselamatan', 'split', 'retro'],
    aspectRatio: '4:5',
    colorPalette: {
      primaryAccent: '#0D9488',
      secondaryAccent: '#2DD4BF',
      backgroundBase: '#F5EFEB',
      textColor: '#1E293B',
      subTextColor: '#475569',
    },
    scenePromptHint: 'Vintage 1970s public educational risograph illustration with aged paper grain, muted teal and warm ochre tones, clean spatial layout.',
    negativeSpaceZone: 'The central and lower composition preserves an open, tranquil plane with minimal visual distraction.',
    slotManifest: {
      canvas: { width: 1080, height: 1350, aspectRatio: '4:5' },
      slots: {
        subjectPhoto: { x: 0.58, y: 0.28, w: 0.36, h: 0.38, anchor: 'center' },
        headlineBlock: { x: 0.08, y: 0.04, w: 0.84, maxLines: 2, fontFamily: 'Anton', fontSizePx: 64, textColor: '#FFFFFF', bgColor: '#0D9488', isUppercase: true },
        memberIdentity: { x: 0.08, y: 0.90, w: 0.40, nameFontSizePx: 18, titleFontSizePx: 12, nameColor: '#1E293B', titleColor: '#0D9488' },
        officialEmblem: { x: 0.08, y: 0.02, w: 0.12, maxHeightPx: 36, placement: 'top-left' },
      },
    },

    fixedConstraints: {
      baseBackgroundTone: 'WARM_PAPER',
      requiredFontFamilies: {
        headline: 'Anton',
        body: 'Plus Jakarta Sans',
      },
      imageNegativeAllow: ['banner', 'frame', 'border'],
      toneSafety: 'SERIOUS_ONLY',
    },
    variationRules: {
      allowedLayoutVariants: ['TOP_BANNER', 'BOTTOM_ANCHOR', 'EDITORIAL_SPLIT', 'CENTERED_HERO'],
      allowedHeaderPlacements: ['top', 'bottom', 'center'],
      allowedCardArrangements: ['stacked', 'horizontal_split', 'single_hero_card', 'grid_compact'],
      canMutatePalette: true,
    },
  },

  // ---------------------------------------------------------------------------
  // 7. 5 MODERN MODULAR FRAMEWORK CARDS
  // ---------------------------------------------------------------------------
  {
    id: 'TPL-07-MODULAR-CARDS',
    name: '5 Modern Modular Framework Cards',
    archetype: 'MODULAR_GRID_CARDS',
    referenceFile: '5 Modern Font Pairings for Graphic Designers.jpg',
    description: 'Judul besar di atas ("5 POKOK REKOMENDASI"), diikuti grid 5 kartu bernomor 01-05 dengan foto monokrom multi-crop dan aksen warna tebal.',
    tags: ['rekomendasi', 'framework', '5-kartu', 'modular', 'modern', 'minimalis'],
    aspectRatio: '4:5',
    colorPalette: {
      primaryAccent: '#DC2626',
      secondaryAccent: '#F87171',
      backgroundBase: '#FFFFFF',
      textColor: '#18181B',
      subTextColor: '#52525B',
    },
    scenePromptHint: 'Minimalist high-contrast architectural and infrastructure panoramic photographic backdrop with ample negative space.',
    negativeSpaceZone: 'Balanced panoramic composition with generous, uncluttered negative space across the central and lower zones.',
    slotManifest: {
      canvas: { width: 1080, height: 1350, aspectRatio: '4:5' },
      slots: {
        subjectPhoto: { x: 0.60, y: 0.05, w: 0.35, h: 0.20, anchor: 'top-right' },
        headlineBlock: { x: 0.06, y: 0.05, w: 0.60, maxLines: 2, fontFamily: 'Anton', fontSizePx: 68, textColor: '#18181B', isUppercase: true },
        memberIdentity: { x: 0.06, y: 0.92, w: 0.40, nameFontSizePx: 16, titleFontSizePx: 12, nameColor: '#18181B', titleColor: '#DC2626' },
        officialEmblem: { x: 0.85, y: 0.92, w: 0.10, maxHeightPx: 36, placement: 'bottom-right' },
      },
    },

    fixedConstraints: {
      baseBackgroundTone: 'WARM_PAPER',
      requiredFontFamilies: {
        headline: 'Anton',
        body: 'Plus Jakarta Sans',
      },
      imageNegativeAllow: ['banner', 'frame', 'border'],
      toneSafety: 'ALL_TOPICS',
    },
    variationRules: {
      allowedLayoutVariants: ['TOP_BANNER', 'BOTTOM_ANCHOR', 'EDITORIAL_SPLIT', 'CENTERED_HERO'],
      allowedHeaderPlacements: ['top', 'bottom', 'center'],
      allowedCardArrangements: ['stacked', 'horizontal_split', 'single_hero_card', 'grid_compact'],
      canMutatePalette: true,
    },
  },

  // ---------------------------------------------------------------------------
  // 8. AVANT-GARDE EDITORIAL MANIFESTO (DESIGN TRENDS 2026)
  // ---------------------------------------------------------------------------
  {
    id: 'TPL-08-AVANT-GARDE-MANIFESTO',
    name: 'Avant-Garde Editorial Manifesto',
    archetype: 'CONSTRUCTIVIST_BAUHAUS',
    referenceFile: 'Design Trends 2026! Imperfection, Rebellion, and the Return of Human Work.jpg',
    description: 'Tipografi manifesto berani yang menantang kemapanan dengan tekstur kertas kasar, aksen stiker tebal, dan tipografi ekspresif.',
    tags: ['manifesto', 'avant-garde', 'human-work', 'rebellion', 'bold', 'modern'],
    aspectRatio: '4:5',
    colorPalette: {
      primaryAccent: '#84CC16',
      secondaryAccent: '#A3E635',
      backgroundBase: '#18181B',
      textColor: '#FFFFFF',
      subTextColor: '#A1A1AA',
    },
    scenePromptHint: 'Raw tactile craft and industrial workshop background, experimental studio lighting, rich analog textures, imperfections and grain.',
    negativeSpaceZone: 'The upper 45% of the frame consists of an uncluttered, smooth surface with directional studio lighting and minimal detail.',
    slotManifest: {
      canvas: { width: 1080, height: 1350, aspectRatio: '4:5' },
      slots: {
        subjectPhoto: { x: 0.50, y: 0.55, w: 0.60, h: 0.40, anchor: 'center' },
        headlineBlock: { x: 0.06, y: 0.08, w: 0.88, maxLines: 2, fontFamily: 'Anton', fontSizePx: 86, textColor: '#FFFFFF', isUppercase: true },
        memberIdentity: { x: 0.06, y: 0.92, w: 0.50, nameFontSizePx: 18, titleFontSizePx: 12, nameColor: '#FFFFFF', titleColor: '#84CC16' },
        officialEmblem: { x: 0.82, y: 0.04, w: 0.12, maxHeightPx: 38, placement: 'top-right' },
      },
    },

    fixedConstraints: {
      baseBackgroundTone: 'DARK',
      requiredFontFamilies: {
        headline: 'Anton',
        body: 'Plus Jakarta Sans',
      },
      imageNegativeAllow: ['banner', 'frame', 'border'],
      toneSafety: 'ALL_TOPICS',
    },
    variationRules: {
      allowedLayoutVariants: ['TOP_BANNER', 'BOTTOM_ANCHOR', 'EDITORIAL_SPLIT', 'CENTERED_HERO'],
      allowedHeaderPlacements: ['top', 'bottom', 'center'],
      allowedCardArrangements: ['stacked', 'horizontal_split', 'single_hero_card', 'grid_compact'],
      canMutatePalette: true,
    },
  },

  // ---------------------------------------------------------------------------
  // 9. HIGH-THRESHOLD NOIR GRAPHICS
  // ---------------------------------------------------------------------------
  {
    id: 'TPL-09-THRESHOLD-NOIR',
    name: 'High-Threshold Monochromatic Noir',
    archetype: 'THRESHOLD_RISOGRAPH',
    referenceFile: 'Design poster (treshold).jpg',
    description: 'Gaya threshold hitam-putih kontras tinggi yang tajam (stark b&w silhouette) dengan aksen merah minimalis dan framing geometris.',
    tags: ['noir', 'threshold', 'siluet', 'monokrom', 'kontras-tinggi'],
    aspectRatio: '4:5',
    colorPalette: {
      primaryAccent: '#EF4444',
      secondaryAccent: '#F87171',
      backgroundBase: '#09090B',
      textColor: '#FFFFFF',
      subTextColor: '#71717A',
    },
    scenePromptHint: 'Stark high-contrast black and white threshold silhouette photograph, dramatic graphic shadow silhouettes, zero grays, pure pitch black and bright white.',
    negativeSpaceZone: 'The top 30% and bottom 20% feature calm, flat, high-contrast monochrome space free of clutter.',
    slotManifest: {
      canvas: { width: 1080, height: 1350, aspectRatio: '4:5' },
      slots: {
        subjectPhoto: { x: 0.50, y: 0.50, w: 0.55, h: 0.55, anchor: 'center' },
        headlineBlock: { x: 0.08, y: 0.08, w: 0.84, maxLines: 2, fontFamily: 'Anton', fontSizePx: 80, textColor: '#FFFFFF', isUppercase: true },
        memberIdentity: { x: 0.08, y: 0.90, w: 0.45, nameFontSizePx: 18, titleFontSizePx: 12, nameColor: '#FFFFFF', titleColor: '#EF4444' },
        officialEmblem: { x: 0.82, y: 0.04, w: 0.10, maxHeightPx: 36, placement: 'top-right' },
      },
    },

    fixedConstraints: {
      baseBackgroundTone: 'DARK',
      requiredFontFamilies: {
        headline: 'Anton',
        body: 'Plus Jakarta Sans',
      },
      imageNegativeAllow: ['banner', 'frame', 'border'],
      toneSafety: 'ALL_TOPICS',
    },
    variationRules: {
      allowedLayoutVariants: ['TOP_BANNER', 'BOTTOM_ANCHOR', 'EDITORIAL_SPLIT', 'CENTERED_HERO'],
      allowedHeaderPlacements: ['top', 'bottom', 'center'],
      allowedCardArrangements: ['stacked', 'horizontal_split', 'single_hero_card', 'grid_compact'],
      canMutatePalette: false,
    },
  },

  // ---------------------------------------------------------------------------
  // 10. SWISS KINETIC GRID & MODERN TYPOGRAPHY
  // ---------------------------------------------------------------------------
  {
    id: 'TPL-10-SWISS-KINETIC-GRID',
    name: 'Swiss Kinetic Grid & Modern Typography',
    archetype: 'SWISS_DUOTONE_EDITORIAL',
    referenceFile: 'Modern Typography Poster Design _ Creative Black and White Poster.jpg',
    description: 'Sistem grid presisi ala Swiss Style dengan tipografi tegas, garis pemisah halus (hairline rules), dan tata letak geometris asimetris.',
    tags: ['swiss-style', 'minimalis', 'grid', 'modern', 'hitam-putih', 'presisi'],
    aspectRatio: '4:5',
    colorPalette: {
      primaryAccent: '#0284C7',
      secondaryAccent: '#38BDF8',
      backgroundBase: '#F8FAFC',
      textColor: '#0F172A',
      subTextColor: '#475569',
    },
    scenePromptHint: 'Clean architectural perspective and structural lines, soft daylight shadows, modern minimalist textures, authentic documentary framing.',
    negativeSpaceZone: 'The right 45% area and top horizontal margin remain an uncluttered, serene plane in soft uniform daylight.',
    slotManifest: {
      canvas: { width: 1080, height: 1350, aspectRatio: '4:5' },
      slots: {
        subjectPhoto: { x: 0.50, y: 0.35, w: 0.50, h: 0.50, anchor: 'center' },
        headlineBlock: { x: 0.08, y: 0.08, w: 0.84, maxLines: 2, fontFamily: 'Anton', fontSizePx: 82, textColor: '#0F172A', isUppercase: true },
        memberIdentity: { x: 0.08, y: 0.90, w: 0.45, nameFontSizePx: 18, titleFontSizePx: 12, nameColor: '#0F172A', titleColor: '#0284C7' },
        officialEmblem: { x: 0.82, y: 0.04, w: 0.12, maxHeightPx: 38, placement: 'top-right' },
      },
    },

    fixedConstraints: {
      baseBackgroundTone: 'WARM_PAPER',
      requiredFontFamilies: {
        headline: 'Anton',
        body: 'Plus Jakarta Sans',
      },
      imageNegativeAllow: ['banner', 'frame', 'border'],
      toneSafety: 'ALL_TOPICS',
    },
    variationRules: {
      allowedLayoutVariants: ['TOP_BANNER', 'BOTTOM_ANCHOR', 'EDITORIAL_SPLIT', 'CENTERED_HERO'],
      allowedHeaderPlacements: ['top', 'bottom', 'center'],
      allowedCardArrangements: ['stacked', 'horizontal_split', 'single_hero_card', 'grid_compact'],
      canMutatePalette: false,
    },
  },

  // ---------------------------------------------------------------------------
  // 11. CREATIVE POP VIBRANT COLLAGE
  // ---------------------------------------------------------------------------
  {
    id: 'TPL-11-CREATIVE-POP-COLLAGE',
    name: 'Creative Pop Vibrant Collage',
    archetype: 'ISOMETRIC_CREATIVE_COLLAGE',
    referenceFile: 'creative Poster😇.jpg',
    description: 'Komposisi pop modern dengan lapisan bingkai foto geometris, stiker aksen, dan gradasi warna yang ceria namun tetap profesional.',
    tags: ['pop', 'vibrant', 'ceria', 'kreatif', 'kolase-modern'],
    aspectRatio: '4:5',
    colorPalette: {
      primaryAccent: '#8B5CF6',
      secondaryAccent: '#A78BFA',
      backgroundBase: '#F5F3FF',
      textColor: '#1E1B4B',
      subTextColor: '#4338CA',
    },
    scenePromptHint: 'Vibrant modern creative scene with rich playful lighting, colorful ambient accents, clean pop editorial styling, 35mm crisp photography.',
    negativeSpaceZone: 'The top 30% and lower-left quadrant feature a tranquil, open atmospheric background with minimal visual distraction.',
    slotManifest: {
      canvas: { width: 1080, height: 1350, aspectRatio: '4:5' },
      slots: {
        subjectPhoto: { x: 0.50, y: 0.40, w: 0.50, h: 0.55, anchor: 'center', popOutEffect: true },
        headlineBlock: { x: 0.08, y: 0.08, w: 0.84, maxLines: 2, fontFamily: 'Bebas Neue', fontSizePx: 92, textColor: '#8B5CF6', isUppercase: true },
        memberIdentity: { x: 0.08, y: 0.88, w: 0.45, nameFontSizePx: 20, titleFontSizePx: 13, nameColor: '#1E1B4B', titleColor: '#8B5CF6' },
        officialEmblem: { x: 0.82, y: 0.04, w: 0.12, maxHeightPx: 40, placement: 'top-right' },
      },
    },

    fixedConstraints: {
      baseBackgroundTone: 'WARM_PAPER',
      requiredFontFamilies: {
        headline: 'Bebas Neue',
        body: 'Plus Jakarta Sans',
      },
      imageNegativeAllow: ['banner', 'frame', 'border'],
      toneSafety: 'VIRAL_ONLY',
    },
    variationRules: {
      allowedLayoutVariants: ['TOP_BANNER', 'BOTTOM_ANCHOR', 'EDITORIAL_SPLIT', 'CENTERED_HERO'],
      allowedHeaderPlacements: ['top', 'bottom', 'center'],
      allowedCardArrangements: ['stacked', 'horizontal_split', 'single_hero_card', 'grid_compact'],
      canMutatePalette: true,
    },
  },

  // ---------------------------------------------------------------------------
  // 12. OUTDOOR WILDLIFE & ECOLOGY GAZETTE (FISHING POSTER)
  // ---------------------------------------------------------------------------
  {
    id: 'TPL-12-ECOLOGY-WILDLIFE-GAZETTE',
    name: 'Outdoor Wildlife & Ecology Gazette',
    archetype: 'STORYBOOK_ILLUSTRATED',
    referenceFile: 'Fishing poster.jpg',
    description: 'Estetika jurnal petualangan alam & ekologi dengan bingkai sketsa organik, tipografi serif vintage, dan nuansa pelestarian lingkungan.',
    tags: ['ekologi', 'lingkungan', 'alam', 'outdoor', 'konservasi', 'vintage'],
    aspectRatio: '4:5',
    colorPalette: {
      primaryAccent: '#15803D',
      secondaryAccent: '#4ADE80',
      backgroundBase: '#F0FDF4',
      textColor: '#14532D',
      subTextColor: '#166534',
    },
    scenePromptHint: 'Breathtaking natural landscape or ecological environment, organic textures, soft morning fog, National Geographic field expedition style.',
    negativeSpaceZone: 'The top 35% features expansive, soft-focus open sky with morning mist and low visual detail.',
    slotManifest: {
      canvas: { width: 1080, height: 1350, aspectRatio: '4:5' },
      slots: {
        subjectPhoto: { x: 0.50, y: 0.35, w: 0.50, h: 0.50, anchor: 'center' },
        headlineBlock: { x: 0.08, y: 0.08, w: 0.84, maxLines: 2, fontFamily: 'Anton', fontSizePx: 78, textColor: '#15803D', isUppercase: true },
        memberIdentity: { x: 0.08, y: 0.90, w: 0.45, nameFontSizePx: 18, titleFontSizePx: 12, nameColor: '#14532D', titleColor: '#15803D' },
        officialEmblem: { x: 0.82, y: 0.04, w: 0.12, maxHeightPx: 38, placement: 'top-right' },
      },
    },

    fixedConstraints: {
      baseBackgroundTone: 'WARM_PAPER',
      requiredFontFamilies: {
        headline: 'Anton',
        body: 'Plus Jakarta Sans',
      },
      imageNegativeAllow: ['banner', 'frame', 'border'],
      toneSafety: 'ALL_TOPICS',
    },
    variationRules: {
      allowedLayoutVariants: ['TOP_BANNER', 'BOTTOM_ANCHOR', 'EDITORIAL_SPLIT', 'CENTERED_HERO'],
      allowedHeaderPlacements: ['top', 'bottom', 'center'],
      allowedCardArrangements: ['stacked', 'horizontal_split', 'single_hero_card', 'grid_compact'],
      canMutatePalette: true,
    },
  },

  // ---------------------------------------------------------------------------
  // 13. MINIMALIST MONOLINE FRAMING (POSTER 1)
  // ---------------------------------------------------------------------------
  {
    id: 'TPL-13-MINIMAL-MONOLINE',
    name: 'Minimalist Monoline Framing',
    archetype: 'TYPOGRAPHIC_MASK',
    referenceFile: 'poster (1).jpg',
    description: 'Garis batas tunggal (monoline border) yang elegan mengelilingi visual tengah dengan judul ramping dan ruang nafas luas.',
    tags: ['monoline', 'minimalis', 'elegan', 'frame-tipis', 'modern'],
    aspectRatio: '4:5',
    colorPalette: {
      primaryAccent: '#0369A1',
      secondaryAccent: '#38BDF8',
      backgroundBase: '#F8FAFC',
      textColor: '#0F172A',
      subTextColor: '#64748B',
    },
    scenePromptHint: 'Ultra-clean modern civic architectural composition, balanced soft shadows, pristine clarity, high editorial elegance.',
    negativeSpaceZone: 'The entire center-top area features an expansive, tranquil atmospheric open space in soft daylight.',
    slotManifest: {
      canvas: { width: 1080, height: 1350, aspectRatio: '4:5' },
      slots: {
        subjectPhoto: { x: 0.50, y: 0.40, w: 0.50, h: 0.55, anchor: 'center', popOutEffect: false },
        headlineBlock: { x: 0.10, y: 0.10, w: 0.80, maxLines: 2, fontFamily: 'Anton', fontSizePx: 76, textColor: '#0F172A', isUppercase: true },
        memberIdentity: { x: 0.10, y: 0.88, w: 0.45, nameFontSizePx: 18, titleFontSizePx: 12, nameColor: '#0F172A', titleColor: '#0369A1' },
        officialEmblem: { x: 0.80, y: 0.05, w: 0.10, maxHeightPx: 36, placement: 'top-right' },
      },
    },

    fixedConstraints: {
      baseBackgroundTone: 'WARM_PAPER',
      requiredFontFamilies: {
        headline: 'Anton',
        body: 'Plus Jakarta Sans',
      },
      imageNegativeAllow: ['banner', 'frame', 'border'],
      toneSafety: 'ALL_TOPICS',
    },
    variationRules: {
      allowedLayoutVariants: ['TOP_BANNER', 'BOTTOM_ANCHOR', 'EDITORIAL_SPLIT', 'CENTERED_HERO'],
      allowedHeaderPlacements: ['top', 'bottom', 'center'],
      allowedCardArrangements: ['stacked', 'horizontal_split', 'single_hero_card', 'grid_compact'],
      canMutatePalette: true,
    },
  },

  // ---------------------------------------------------------------------------
  // 14. MODERN URBAN STREET NARRATIVE (POSTER.JPG)
  // ---------------------------------------------------------------------------
  {
    id: 'TPL-14-URBAN-STREET-NARRATIVE',
    name: 'Modern Urban Street Narrative',
    archetype: 'KINETIC_MOTION',
    referenceFile: 'poster.jpg',
    description: 'Komposisi dokumenter perkotaan modern dengan pita judul hitam tebal di bawah dan kontras foto jalanan yang sinematik.',
    tags: ['urban', 'tata-kota', 'jalanan', 'jurnalisme', 'dokumenter'],
    aspectRatio: '4:5',
    colorPalette: {
      primaryAccent: '#EA580C',
      secondaryAccent: '#FB923C',
      backgroundBase: '#0F172A',
      textColor: '#FFFFFF',
      subTextColor: '#94A3B8',
    },
    scenePromptHint: 'Atmospheric Indonesian street-level perspective, authentic public transport or community development setting, 35mm street documentary texture.',
    negativeSpaceZone: 'The bottom 25% of the frame features a calm, deep shadow zone with smooth, low-contrast pavement texture.',
    slotManifest: {
      canvas: { width: 1080, height: 1350, aspectRatio: '4:5' },
      slots: {
        subjectPhoto: { x: 0.50, y: 0.35, w: 0.60, h: 0.50, anchor: 'center' },
        headlineBlock: { x: 0.06, y: 0.10, w: 0.88, maxLines: 2, fontFamily: 'Anton', fontSizePx: 82, textColor: '#FFFFFF', isUppercase: true },
        memberIdentity: { x: 0.06, y: 0.90, w: 0.45, nameFontSizePx: 18, titleFontSizePx: 12, nameColor: '#FFFFFF', titleColor: '#EA580C' },
        officialEmblem: { x: 0.82, y: 0.04, w: 0.12, maxHeightPx: 38, placement: 'top-right' },
      },
    },

    fixedConstraints: {
      baseBackgroundTone: 'DARK',
      requiredFontFamilies: {
        headline: 'Anton',
        body: 'Plus Jakarta Sans',
      },
      imageNegativeAllow: ['banner', 'frame', 'border'],
      toneSafety: 'ALL_TOPICS',
    },
    variationRules: {
      allowedLayoutVariants: ['TOP_BANNER', 'BOTTOM_ANCHOR', 'EDITORIAL_SPLIT', 'CENTERED_HERO'],
      allowedHeaderPlacements: ['top', 'bottom', 'center'],
      allowedCardArrangements: ['stacked', 'horizontal_split', 'single_hero_card', 'grid_compact'],
      canMutatePalette: true,
    },
  },

  // ---------------------------------------------------------------------------
  // 15. DYNAMIC DIAGONAL MOTION (DOWNLOAD 3)
  // ---------------------------------------------------------------------------
  {
    id: 'TPL-15-DYNAMIC-DIAGONAL-MOTION',
    name: 'Dynamic Diagonal Motion',
    archetype: 'EXECUTIVE_SEMINAR',
    referenceFile: 'download (3).jpg',
    description: 'Potongan diagonal berenergi tinggi yang membelah kanvas secara dinamis, mengarahkan mata pada aksi kebijakan yang bergerak cepat.',
    tags: ['diagonal', 'dinamis', 'aksi', 'gerakan-cepat', 'enerjik'],
    aspectRatio: '4:5',
    colorPalette: {
      primaryAccent: '#2563EB',
      secondaryAccent: '#60A5FA',
      backgroundBase: '#EFF6FF',
      textColor: '#1E3A8A',
      subTextColor: '#3B82F6',
    },
    scenePromptHint: 'Dynamic forward-moving action scene, diagonal perspective lines, energetic atmospheric lighting, modern crisp documentary photo.',
    negativeSpaceZone: 'The upper 40% features an uncluttered, deep midnight shadow gradient with gentle ambient bokeh.',
    slotManifest: {
      canvas: { width: 1080, height: 1350, aspectRatio: '4:5' },
      slots: {
        subjectPhoto: { x: 0.50, y: 0.40, w: 0.50, h: 0.55, anchor: 'center', popOutEffect: true },
        headlineBlock: { x: 0.08, y: 0.08, w: 0.84, maxLines: 2, fontFamily: 'Bebas Neue', fontSizePx: 94, textColor: '#2563EB', isUppercase: true },
        memberIdentity: { x: 0.08, y: 0.88, w: 0.45, nameFontSizePx: 20, titleFontSizePx: 13, nameColor: '#1E3A8A', titleColor: '#2563EB' },
        officialEmblem: { x: 0.82, y: 0.04, w: 0.12, maxHeightPx: 40, placement: 'top-right' },
      },
    },

    fixedConstraints: {
      baseBackgroundTone: 'LIGHT',
      requiredFontFamilies: {
        headline: 'Bebas Neue',
        body: 'Plus Jakarta Sans',
      },
      imageNegativeAllow: ['banner', 'frame', 'border'],
      toneSafety: 'ALL_TOPICS',
    },
    variationRules: {
      allowedLayoutVariants: ['TOP_BANNER', 'BOTTOM_ANCHOR', 'EDITORIAL_SPLIT', 'CENTERED_HERO'],
      allowedHeaderPlacements: ['top', 'bottom', 'center'],
      allowedCardArrangements: ['stacked', 'horizontal_split', 'single_hero_card', 'grid_compact'],
      canMutatePalette: true,
    },
  },

  // ---------------------------------------------------------------------------
  // 16. MINIMALIST DUOTONE PORTRAITURE (DOWNLOAD 4)
  // ---------------------------------------------------------------------------
  {
    id: 'TPL-16-DUOTONE-PORTRAITURE',
    name: 'Minimalist Duotone Portraiture',
    archetype: 'TORN_VISION',
    referenceFile: 'download (4).jpg',
    description: 'Potret subjek hitam-putih di atas latar belakang blok warna solid cerah, menghasilkan identitas visual yang ikonik dan kontemporer.',
    tags: ['duotone', 'portrait', 'solid-color', 'ikonik', 'bold'],
    aspectRatio: '4:5',
    colorPalette: {
      primaryAccent: '#7C3AED',
      secondaryAccent: '#A78BFA',
      backgroundBase: '#1E1B4B',
      textColor: '#FFFFFF',
      subTextColor: '#DDD6FE',
    },
    scenePromptHint: 'Studio portrait with clean solid duotone color background, high contrast lighting, pure silhouette edge definition, editorial polish.',
    negativeSpaceZone: 'The upper-right and lower-left zones provide quiet, flat, low-contrast textured surfaces with minimal detail.',
    slotManifest: {
      canvas: { width: 1080, height: 1350, aspectRatio: '4:5' },
      slots: {
        subjectPhoto: { x: 0.50, y: 0.35, w: 0.50, h: 0.65, anchor: 'center' },
        headlineBlock: { x: 0.08, y: 0.15, w: 0.84, maxLines: 2, fontFamily: 'Anton', fontSizePx: 82, textColor: '#FFFFFF', isUppercase: true },
        memberIdentity: { x: 0.08, y: 0.88, w: 0.45, nameFontSizePx: 20, titleFontSizePx: 12, nameColor: '#FFFFFF', titleColor: '#A78BFA' },
        officialEmblem: { x: 0.82, y: 0.04, w: 0.12, maxHeightPx: 38, placement: 'top-right' },
      },
    },

    fixedConstraints: {
      baseBackgroundTone: 'DARK',
      requiredFontFamilies: {
        headline: 'Anton',
        body: 'Plus Jakarta Sans',
      },
      imageNegativeAllow: ['banner', 'frame', 'border'],
      toneSafety: 'ALL_TOPICS',
    },
    variationRules: {
      allowedLayoutVariants: ['TOP_BANNER', 'BOTTOM_ANCHOR', 'EDITORIAL_SPLIT', 'CENTERED_HERO'],
      allowedHeaderPlacements: ['top', 'bottom', 'center'],
      allowedCardArrangements: ['stacked', 'horizontal_split', 'single_hero_card', 'grid_compact'],
      canMutatePalette: true,
    },
  },

  // ---------------------------------------------------------------------------
  // 17. RETRO HALFTONE RISOPRINT (DOWNLOAD 5)
  // ---------------------------------------------------------------------------
  {
    id: 'TPL-17-RETRO-HALFTONE-RISO',
    name: 'Retro Halftone Risoprint',
    archetype: 'GALLERY_EXHIBITION',
    referenceFile: 'download (5).jpg',
    description: 'Cetak risograph vintage dengan tekstur titik halftone kentara, warna tinta berlapis (overprint), dan nuansa advokasi akar rumput.',
    tags: ['risograph', 'halftone', 'retro', 'akar-rumput', 'advokasi'],
    aspectRatio: '4:5',
    colorPalette: {
      primaryAccent: '#C026D3',
      secondaryAccent: '#E879F9',
      backgroundBase: '#FDF4FF',
      textColor: '#701A75',
      subTextColor: '#86198F',
    },
    scenePromptHint: 'Vintage risograph two-color print with authentic visible halftone dots, ink bleed along edges, tactile aged paper grain.',
    negativeSpaceZone: 'The top 30% and bottom 20% provide calm, quiet open negative space with soft neutral tones.',
    slotManifest: {
      canvas: { width: 1080, height: 1350, aspectRatio: '4:5' },
      slots: {
        subjectPhoto: { x: 0.50, y: 0.45, w: 0.50, h: 0.45, anchor: 'center' },
        headlineBlock: { x: 0.08, y: 0.08, w: 0.84, maxLines: 2, fontFamily: 'Anton', fontSizePx: 80, textColor: '#701A75', isUppercase: true },
        memberIdentity: { x: 0.08, y: 0.90, w: 0.45, nameFontSizePx: 18, titleFontSizePx: 12, nameColor: '#701A75', titleColor: '#C026D3' },
        officialEmblem: { x: 0.82, y: 0.04, w: 0.12, maxHeightPx: 36, placement: 'top-right' },
      },
    },

    fixedConstraints: {
      baseBackgroundTone: 'WARM_PAPER',
      requiredFontFamilies: {
        headline: 'Anton',
        body: 'Plus Jakarta Sans',
      },
      imageNegativeAllow: ['banner', 'frame', 'border'],
      toneSafety: 'ALL_TOPICS',
    },
    variationRules: {
      allowedLayoutVariants: ['TOP_BANNER', 'BOTTOM_ANCHOR', 'EDITORIAL_SPLIT', 'CENTERED_HERO'],
      allowedHeaderPlacements: ['top', 'bottom', 'center'],
      allowedCardArrangements: ['stacked', 'horizontal_split', 'single_hero_card', 'grid_compact'],
      canMutatePalette: true,
    },
  },

  // ---------------------------------------------------------------------------
  // 18. COMPACT INFORMATIONAL BULLETIN (DOWNLOAD 6)
  // ---------------------------------------------------------------------------
  {
    id: 'TPL-18-COMPACT-BULLETIN',
    name: 'Compact Informational Bulletin',
    archetype: 'POP_MAGAZINE_COLLAGE',
    referenceFile: 'download (6).jpg',
    description: 'Tata letak buletin 3-tingkat yang padat dan informatif, menyajikan poin kebijakan penting secara terstruktur dalam kartu kompak.',
    tags: ['buletin', 'kompak', 'informasi-publik', '3-tingkat', 'resmi'],
    aspectRatio: '4:5',
    colorPalette: {
      primaryAccent: '#059669',
      secondaryAccent: '#34D399',
      backgroundBase: '#F0FDF4',
      textColor: '#064E3B',
      subTextColor: '#047857',
    },
    scenePromptHint: 'Organized civic environment, clear architecture, soft neutral daylight, documentary credibility.',
    negativeSpaceZone: 'The upper-center section features an expansive, soft-focus warm paper texture with gentle daylight.',
    slotManifest: {
      canvas: { width: 1080, height: 1350, aspectRatio: '4:5' },
      slots: {
        subjectPhoto: { x: 0.50, y: 0.30, w: 0.40, h: 0.35, anchor: 'center' },
        headlineBlock: { x: 0.08, y: 0.06, w: 0.84, maxLines: 2, fontFamily: 'Anton', fontSizePx: 72, textColor: '#FFFFFF', bgColor: '#059669', isUppercase: true },
        memberIdentity: { x: 0.08, y: 0.90, w: 0.45, nameFontSizePx: 18, titleFontSizePx: 12, nameColor: '#064E3B', titleColor: '#059669' },
        officialEmblem: { x: 0.08, y: 0.02, w: 0.12, maxHeightPx: 34, placement: 'top-left' },
      },
    },

    fixedConstraints: {
      baseBackgroundTone: 'WARM_PAPER',
      requiredFontFamilies: {
        headline: 'Anton',
        body: 'Plus Jakarta Sans',
      },
      imageNegativeAllow: ['banner', 'frame', 'border'],
      toneSafety: 'VIRAL_ONLY',
    },
    variationRules: {
      allowedLayoutVariants: ['TOP_BANNER', 'BOTTOM_ANCHOR', 'EDITORIAL_SPLIT', 'CENTERED_HERO'],
      allowedHeaderPlacements: ['top', 'bottom', 'center'],
      allowedCardArrangements: ['stacked', 'horizontal_split', 'single_hero_card', 'grid_compact'],
      canMutatePalette: true,
    },
  },

  // ---------------------------------------------------------------------------
  // 19. CINEMATIC PANORAMIC VISTA (DOWNLOAD 7)
  // ---------------------------------------------------------------------------
  {
    id: 'TPL-19-CINEMATIC-VISTA',
    name: 'Vintage Field Expedition (Polaroid)',
    archetype: 'POLAROID_ADVENTURE',
    referenceFile: 'download (7).jpg',
    description: 'Jurnal ekspedisi blusukan daerah dengan bingkai foto polaroid lapangan, catatan riset analog hangat, dan narasi langsung dari warga.',
    tags: ['blusukan', 'ekspedisi', 'polaroid', 'lapangan', 'daerah', 'analog'],
    aspectRatio: '4:5',
    colorPalette: {
      primaryAccent: '#E11D48',
      secondaryAccent: '#FB7185',
      backgroundBase: '#FFF1F2',
      textColor: '#881337',
      subTextColor: '#9F1239',
    },
    scenePromptHint: 'Epic panoramic landscape or major public infrastructure vista, dramatic wide-angle perspective, cinematic letterbox framing, rich sunset or golden hour lighting.',
    negativeSpaceZone: 'The upper 35% features an uncluttered, soft-focus archival warm paper patina with minimal detail.',
    slotManifest: {
      canvas: { width: 1080, height: 1350, aspectRatio: '4:5' },
      slots: {
        subjectPhoto: { x: 0.50, y: 0.45, w: 0.55, h: 0.50, anchor: 'center', popOutEffect: true },
        headlineBlock: { x: 0.08, y: 0.08, w: 0.84, maxLines: 2, fontFamily: 'Bebas Neue', fontSizePx: 96, textColor: '#E11D48', isUppercase: true },
        memberIdentity: { x: 0.08, y: 0.90, w: 0.45, nameFontSizePx: 18, titleFontSizePx: 12, nameColor: '#881337', titleColor: '#E11D48' },
        officialEmblem: { x: 0.82, y: 0.04, w: 0.12, maxHeightPx: 38, placement: 'top-right' },
      },
    },

    fixedConstraints: {
      baseBackgroundTone: 'WARM_PAPER',
      requiredFontFamilies: {
        headline: 'Bebas Neue',
        body: 'Plus Jakarta Sans',
      },
      imageNegativeAllow: ['banner', 'frame', 'border'],
      toneSafety: 'ALL_TOPICS',
    },
    variationRules: {
      allowedLayoutVariants: ['TOP_BANNER', 'BOTTOM_ANCHOR', 'EDITORIAL_SPLIT', 'CENTERED_HERO'],
      allowedHeaderPlacements: ['top', 'bottom', 'center'],
      allowedCardArrangements: ['stacked', 'horizontal_split', 'single_hero_card', 'grid_compact'],
      canMutatePalette: true,
    },
  },

  // ---------------------------------------------------------------------------
  // 20. CONTEMPORARY EDITORIAL LOOKBOOK (DOWNLOAD 8)
  // ---------------------------------------------------------------------------
  {
    id: 'TPL-20-CONTEMPORARY-LOOKBOOK',
    name: 'Contemporary Editorial Lookbook',
    archetype: 'VINTAGE_PERSONA_GAZETTE',
    referenceFile: 'download (8).jpg',
    description: 'Tata letak majalah seni kontemporer dengan ruang putih (white space) yang lapang, tipografi sans modern, dan komposisi asimetris bernilai seni tinggi.',
    tags: ['lookbook', 'editorial-seni', 'white-space', 'asimetris', 'kontemporer'],
    aspectRatio: '4:5',
    colorPalette: {
      primaryAccent: '#0D9488',
      secondaryAccent: '#2DD4BF',
      backgroundBase: '#FAFAFA',
      textColor: '#18181B',
      subTextColor: '#71717A',
    },
    scenePromptHint: 'Museum gallery aesthetic, pristine white spaces, subtle architectural daylight, clean minimalist sophistication, high fashion editorial tone.',
    negativeSpaceZone: 'Pristine white museum gallery wall with soft ambient daylight, providing 60% calm open negative space.',
    slotManifest: {
      canvas: { width: 1080, height: 1350, aspectRatio: '4:5' },
      slots: {
        subjectPhoto: { x: 0.50, y: 0.38, w: 0.45, h: 0.55, anchor: 'center' },
        headlineBlock: { x: 0.08, y: 0.10, w: 0.84, maxLines: 2, fontFamily: 'Anton', fontSizePx: 76, textColor: '#18181B', isUppercase: true },
        memberIdentity: { x: 0.08, y: 0.88, w: 0.45, nameFontSizePx: 18, titleFontSizePx: 12, nameColor: '#18181B', titleColor: '#0D9488' },
        officialEmblem: { x: 0.82, y: 0.04, w: 0.12, maxHeightPx: 36, placement: 'top-right' },
      },
    },

    fixedConstraints: {
      baseBackgroundTone: 'WARM_PAPER',
      requiredFontFamilies: {
        headline: 'Anton',
        body: 'Plus Jakarta Sans',
      },
      imageNegativeAllow: ['banner', 'frame', 'border'],
      toneSafety: 'ALL_TOPICS',
    },
    variationRules: {
      allowedLayoutVariants: ['TOP_BANNER', 'BOTTOM_ANCHOR', 'EDITORIAL_SPLIT', 'CENTERED_HERO'],
      allowedHeaderPlacements: ['top', 'bottom', 'center'],
      allowedCardArrangements: ['stacked', 'horizontal_split', 'single_hero_card', 'grid_compact'],
      canMutatePalette: true,
    },
  },

  // ---------------------------------------------------------------------------
  // 21. VERTICAL SKYSCRAPER INFOGRAPHIC (DOWNLOAD 9)
  // ---------------------------------------------------------------------------
  {
    id: 'TPL-21-SKYSCRAPER-INFOGRAPHIC',
    name: 'Civic Broadsheet Chronicle',
    archetype: 'BROADSHEET_NEWSPAPER',
    referenceFile: 'download (9).jpg',
    description: 'Format koran investigasi kebijakan publik multi-kolom dengan tipografi gazette padat dan rekam analisis mendalam.',
    tags: ['koran', 'broadsheet', 'investigasi', 'kolom', 'kebijakan', 'analisis'],
    aspectRatio: '4:5',
    colorPalette: {
      primaryAccent: '#0284C7',
      secondaryAccent: '#38BDF8',
      backgroundBase: '#F0F9FF',
      textColor: '#0C4A6E',
      subTextColor: '#0369A1',
    },
    scenePromptHint: 'Vertical upward perspective of civic progress, clean structural lines, bright blue sky background, progressive momentum.',
    negativeSpaceZone: 'The top 25% and side margins remain clean, calm, archival off-white paper space.',
    slotManifest: {
      canvas: { width: 1080, height: 1350, aspectRatio: '4:5' },
      slots: {
        subjectPhoto: { x: 0.50, y: 0.25, w: 0.40, h: 0.30, anchor: 'center' },
        headlineBlock: { x: 0.06, y: 0.06, w: 0.88, maxLines: 2, fontFamily: 'Anton', fontSizePx: 70, textColor: '#0C4A6E', isUppercase: true },
        memberIdentity: { x: 0.06, y: 0.92, w: 0.45, nameFontSizePx: 16, titleFontSizePx: 12, nameColor: '#0C4A6E', titleColor: '#0284C7' },
        officialEmblem: { x: 0.85, y: 0.92, w: 0.10, maxHeightPx: 36, placement: 'bottom-right' },
      },
    },

    fixedConstraints: {
      baseBackgroundTone: 'WARM_PAPER',
      requiredFontFamilies: {
        headline: 'Anton',
        body: 'Plus Jakarta Sans',
      },
      imageNegativeAllow: ['banner', 'frame', 'border'],
      toneSafety: 'ALL_TOPICS',
    },
    variationRules: {
      allowedLayoutVariants: ['TOP_BANNER', 'BOTTOM_ANCHOR', 'EDITORIAL_SPLIT', 'CENTERED_HERO'],
      allowedHeaderPlacements: ['top', 'bottom', 'center'],
      allowedCardArrangements: ['stacked', 'horizontal_split', 'single_hero_card', 'grid_compact'],
      canMutatePalette: true,
    },
  },

  // ---------------------------------------------------------------------------
  // 22. POP CULTURE & VIRAL DISCOURSE
  // ---------------------------------------------------------------------------
  {
    id: 'TPL-22-POP-CULTURE-COMMENTARY',
    name: 'Pop Culture & Viral Discourse',
    archetype: 'TECHNICAL_GRID_CALLOUT',
    referenceFile: '“Yeh marketing nahi chhoti cheez hai babu bhaiya… digital hai digital!”.jpg',
    description: 'Gaya visual pop komunikatif yang berani dengan kutipan viral santai namun mengena, warna-warna pop kontras, dan pesan lugas untuk anak muda.',
    tags: ['pop-culture', 'viral', 'anak-muda', 'komunikatif', 'santai', 'bold'],
    aspectRatio: '4:5',
    colorPalette: {
      primaryAccent: '#EAB308',
      secondaryAccent: '#FACC15',
      backgroundBase: '#18181B',
      textColor: '#FFFFFF',
      subTextColor: '#FEF08A',
    },
    scenePromptHint: 'Modern viral pop culture setting, bold dynamic lighting, expressive energetic atmosphere, cinematic pop art colors.',
    negativeSpaceZone: 'Spacious, calm, low-contrast drafting surfaces with minimal visual distraction.',
    slotManifest: {
      canvas: { width: 1080, height: 1350, aspectRatio: '4:5' },
      slots: {
        subjectPhoto: { x: 0.50, y: 0.45, w: 0.50, h: 0.45, anchor: 'center' },
        headlineBlock: { x: 0.08, y: 0.08, w: 0.84, maxLines: 2, fontFamily: 'Anton', fontSizePx: 82, textColor: '#EAB308', isUppercase: true },
        memberIdentity: { x: 0.08, y: 0.90, w: 0.45, nameFontSizePx: 18, titleFontSizePx: 12, nameColor: '#FFFFFF', titleColor: '#EAB308' },
        officialEmblem: { x: 0.82, y: 0.04, w: 0.12, maxHeightPx: 38, placement: 'top-right' },
      },
    },

    fixedConstraints: {
      baseBackgroundTone: 'DARK',
      requiredFontFamilies: {
        headline: 'Anton',
        body: 'Plus Jakarta Sans',
      },
      imageNegativeAllow: ['banner', 'frame', 'border'],
      toneSafety: 'VIRAL_ONLY',
    },
    variationRules: {
      allowedLayoutVariants: ['TOP_BANNER', 'BOTTOM_ANCHOR', 'EDITORIAL_SPLIT', 'CENTERED_HERO'],
      allowedHeaderPlacements: ['top', 'bottom', 'center'],
      allowedCardArrangements: ['stacked', 'horizontal_split', 'single_hero_card', 'grid_compact'],
      canMutatePalette: true,
    },
  },
];
