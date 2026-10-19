import { PreAnalyzedPosterBlueprint } from './types.js';

/**
 * POLARIS Pre-Analyzed Poster Blueprint Catalog
 * Ekstraksi terstruktur dari koleksi referensi di uploads/references/poster.
 * Menyimpan palet warna, rasio grid, instruksi negative space, dan prompt hint.
 */
export const POSTER_BLUEPRINT_CATALOG: PreAnalyzedPosterBlueprint[] = [
  // ---------------------------------------------------------------------------
  // 1. POP-OUT HERO (THE EDGE / CINEMATIC OVERLAY)
  // ---------------------------------------------------------------------------
  {
    id: 'TPL-POP-OUT-HERO-01',
    name: 'The Cinematic Pop-Out Hero',
    archetype: 'POP_OUT_HERO',
    referenceFile: 'Minimal Poster Design with Bold Typography _ Cinematic Layout & Editorial Style.jpg',
    description: 'Bingkai framed cream vintage dengan subjek menerobos kotak foto dan memotong judul condensed tebal di belakangnya.',
    tags: ['visi', 'kepemimpinan', 'modern', 'pemuda', 'outdoor', 'inovasi', 'keberanian', 'editorial'],
    aspectRatio: '4:5',
    colorPalette: {
      primaryAccent: '#EA580C', // Bright Safety Orange
      backgroundBase: '#F6F3EB', // Warm Vintage Cream
      textColor: '#111827',     // Dark Charcoal
      subTextColor: '#4B5563',  // Slate Gray
    },
    scenePromptHint: 'Dramatic cinematic aerial/landscape shot with authentic 35mm film grain. Soft atmospheric daylight. High-end editorial magazine art direction, National Geographic outdoor aesthetic. Natural organic textures.',
    negativeSpaceZone: 'The top 35% of the frame MUST be uncluttered, clean, or soft-focus background for large typography overlay. The central lower section houses the environment.',
    slotManifest: {
      canvas: { width: 1080, height: 1350, aspectRatio: '4:5' },
      slots: {
        subjectPhoto: {
          x: 0.28,
          y: 0.22,
          w: 0.44,
          h: 0.65,
          anchor: 'center',
          popOutEffect: true,
          popOutOverflowTopPx: 75,
          shadowOpacity: 0.45,
          shadowBlur: 25,
        },
        headlineBlock: {
          x: 0.08,
          y: 0.08,
          w: 0.84,
          maxLines: 1,
          fontFamily: 'Bebas Neue',
          fontSizePx: 140,
          textColor: '#EA580C',
          isUppercase: true,
          interlockingWithSubject: true,
        },
        quoteStatement: {
          x: 0.15,
          y: 0.38,
          w: 0.70,
          fontFamily: 'Plus Jakarta Sans',
          fontSizePx: 16,
          textColor: '#374151',
        },
        memberIdentity: {
          x: 0.10,
          y: 0.88,
          w: 0.45,
          nameFontSizePx: 20,
          titleFontSizePx: 13,
          nameColor: '#111827',
          titleColor: '#6B7280',
          badgeStyle: 'minimal',
        },
        officialEmblem: {
          x: 0.08,
          y: 0.03,
          w: 0.12,
          maxHeightPx: 42,
          placement: 'top-left',
          showInstitutionBadge: true,
        },
        editorialAccents: {
          showBarcode: true,
          barcodeCoordinate: { x: 0.42, y: 0.92, w: 0.16 },
          editionTag: 'POLARIS FIELD NOTES // EDITION 2026',
          editionCoordinate: { x: 0.60, y: 0.035, w: 0.32 },
        },
      },
    },
  },

  // ---------------------------------------------------------------------------
  // 2. STREET JOURNALISM / RISOGRAPH (POSTER PKL & OKE GAS)
  // ---------------------------------------------------------------------------
  {
    id: 'TPL-STREET-JOURNALISM-01',
    name: 'Street Journalism Risograph',
    archetype: 'STREET_JOURNALISM',
    referenceFile: 'POSTER PKL.jpg',
    description: 'Grid jurnalisme investigatif dengan montase foto jalanan/pasar, kontras duotone merah-hitam, dan kotak judul solid block.',
    tags: ['ekonomi', 'pasar', 'rakyat', 'umkm', 'sosial', 'kritik', 'lapangan', 'reses', 'kesejahteraan'],
    aspectRatio: '4:5',
    colorPalette: {
      primaryAccent: '#DC2626', // Crimson Red
      backgroundBase: '#F5F5F0', // Newsprint Off-White
      textColor: '#0A0A0A',     // Pitch Black
      subTextColor: '#333333',
    },
    scenePromptHint: 'Raw, gritty Indonesian street scene documentary photography. Authentic street stalls, wet market life, public transportation, or daily civilian perseverance. Black and white high-contrast reportage with subtle risograph halftone dot texture.',
    negativeSpaceZone: 'The left 50% and bottom 25% should have structured architecture or dark shadow zones suitable for solid text banners.',
    slotManifest: {
      canvas: { width: 1080, height: 1350, aspectRatio: '4:5' },
      editorialBlocks: [
        {
          slotId: 'left_positive',
          role: 'COLUMN_SECTION',
          coordinate: { x: 0.05, y: 0.08, w: 0.32 },
          typography: {
            headerFont: 'Anton',
            headerSizePx: 36,
            headerColor: '#9E0B0F',
            bodyFont: 'Plus Jakarta Sans',
            bodySizePx: 12,
            bodyColor: '#18181B',
            textAlign: 'justify',
          },
          constraints: { headerMaxChars: 18, bodyMinChars: 160, bodyMaxChars: 230 },
          defaultReferenceHeader: 'DAMPAK POSITIF',
        },
        {
          slotId: 'left_negative_box',
          role: 'SOLID_COLOR_BOX',
          coordinate: { x: 0.05, y: 0.22, w: 0.32 },
          typography: {
            headerFont: 'Anton',
            headerSizePx: 32,
            headerColor: '#FFFFFF',
            bodyFont: 'Plus Jakarta Sans',
            bodySizePx: 12,
            bodyColor: '#FFFFFF',
            boxBgColor: '#9E0B0F',
            textAlign: 'justify',
          },
          constraints: { headerMaxChars: 20, bodyMinChars: 180, bodyMaxChars: 250 },
          defaultReferenceHeader: 'DAMPAK NEGATIF',
        },
        {
          slotId: 'center_giant_title',
          role: 'GIANT_STACKED_TITLE',
          coordinate: { x: 0.40, y: 0.06, w: 0.22 },
          typography: {
            headerFont: 'Bebas Neue',
            headerSizePx: 92,
            headerColor: '#9E0B0F',
            bodyFont: 'Plus Jakarta Sans',
            bodySizePx: 12,
            bodyColor: '#18181B',
            textAlign: 'justify',
          },
          constraints: { headerMaxChars: 14, bodyMinChars: 190, bodyMaxChars: 260 },
          defaultReferenceHeader: 'ASAL USUL',
        },
        {
          slotId: 'right_cause',
          role: 'COLUMN_SECTION',
          coordinate: { x: 0.64, y: 0.28, w: 0.31 },
          typography: {
            headerFont: 'Anton',
            headerSizePx: 42,
            headerColor: '#9E0B0F',
            bodyFont: 'Plus Jakarta Sans',
            bodySizePx: 12,
            bodyColor: '#18181B',
            textAlign: 'justify',
          },
          constraints: { headerMaxChars: 22, bodyMinChars: 180, bodyMaxChars: 250 },
          defaultReferenceHeader: 'PENYEBAB KEMUNCULAN',
        },
      ],
      visualCutoutSlots: [
        {
          slotId: 'upper_right_cutout',
          spatialZonePrompt: 'Upper-right quadrant cutout overlapping a red geometric shape',
          originalReferenceSubject: 'Indonesian street vendor with traditional food cart (gerobak)',
          photoTreatment: 'BW_HALFTONE_CUTOUT',
        },
        {
          slotId: 'mid_left_hero_cutout',
          spatialZonePrompt: 'Middle-left foreground standing over a crimson red brush splash',
          originalReferenceSubject: 'Indonesian street vendor carrying goods looking forward',
          photoTreatment: 'BW_HALFTONE_CUTOUT',
        },
        {
          slotId: 'bottom_street_scene',
          spatialZonePrompt: 'Lower-middle full-bleed urban street level architecture',
          originalReferenceSubject: 'Indonesian Chinatown/street shophouses with street stalls and cars',
          photoTreatment: 'BW_HALFTONE_CUTOUT',
        },
      ],
      slots: {
        subjectPhoto: {
          x: 0.58,
          y: 0.20,
          w: 0.38,
          h: 0.58,
          anchor: 'bottom-right',
          popOutEffect: false,
          shadowOpacity: 0.35,
          shadowBlur: 15,
        },
        headlineBlock: {
          x: 0.06,
          y: 0.12,
          w: 0.52,
          maxLines: 2,
          fontFamily: 'Anton',
          fontSizePx: 72,
          textColor: '#FFFFFF',
          bgColor: '#DC2626',
          isUppercase: true,
        },
        quoteStatement: {
          x: 0.06,
          y: 0.32,
          w: 0.48,
          fontFamily: 'Plus Jakarta Sans',
          fontSizePx: 18,
          textColor: '#1F2937',
        },
        memberIdentity: {
          x: 0.06,
          y: 0.82,
          w: 0.50,
          nameFontSizePx: 22,
          titleFontSizePx: 14,
          nameColor: '#FFFFFF',
          titleColor: '#E5E7EB',
          badgeStyle: 'solid-ribbon',
        },
        officialEmblem: {
          x: 0.06,
          y: 0.03,
          w: 0.14,
          maxHeightPx: 45,
          placement: 'top-left',
          showInstitutionBadge: true,
        },
        editorialAccents: {
          showBarcode: true,
          barcodeCoordinate: { x: 0.78, y: 0.92, w: 0.16 },
          editionTag: 'LAPORAN ADVOKASI ASPIRASI // POLARIS',
          editionCoordinate: { x: 0.40, y: 0.035, w: 0.50 },
        },
      },
    },
  },

  // ---------------------------------------------------------------------------
  // 3. THE STATEMENT PROFILE (STEVE JOBS / TIME MAGAZINE)
  // ---------------------------------------------------------------------------
  {
    id: 'TPL-STATEMENT-PROFILE-01',
    name: 'The Statement Profile & Legacy',
    archetype: 'STATEMENT_PROFILE',
    referenceFile: 'Biografi Singkat Steve Jobs.jpg',
    description: 'Potret karismatik dominan di tengah dengan nama tokoh besar di kiri-kanan kepala, kartu kaca glassmorphism, dan kutipan visi.',
    tags: ['profil', 'tokoh', 'statement', 'opini', 'wibawa', 'gagasan', 'kebijakan', 'integritas', 'biografi'],
    aspectRatio: '4:5',
    colorPalette: {
      primaryAccent: '#2563EB', // Royal Blue
      backgroundBase: '#0F172A', // Slate Deep Navy
      textColor: '#FFFFFF',
      subTextColor: '#94A3B8',
    },
    scenePromptHint: 'Subtle atmospheric architectural studio background with soft directional rim-lighting. Deep elegant shadows, cinematic bokeh, minimalist clean luxury environment. 85mm portrait lens depth of field.',
    negativeSpaceZone: 'Clean gradient and subtle textures behind the center subject to accommodate surrounding typographic blocks and frosted glass cards.',
    slotManifest: {
      canvas: { width: 1080, height: 1350, aspectRatio: '4:5' },
      slots: {
        subjectPhoto: {
          x: 0.22,
          y: 0.14,
          w: 0.56,
          h: 0.76,
          anchor: 'center',
          popOutEffect: false,
          shadowOpacity: 0.50,
          shadowBlur: 30,
        },
        headlineBlock: {
          x: 0.08,
          y: 0.10,
          w: 0.84,
          maxLines: 2,
          fontFamily: 'Bebas Neue',
          fontSizePx: 88,
          textColor: '#FFFFFF',
          isUppercase: true,
          interlockingWithSubject: true,
        },
        quoteStatement: {
          x: 0.10,
          y: 0.72,
          w: 0.80,
          fontFamily: 'Plus Jakarta Sans',
          fontSizePx: 20,
          textColor: '#F8FAFC',
        },
        memberIdentity: {
          x: 0.10,
          y: 0.86,
          w: 0.50,
          nameFontSizePx: 22,
          titleFontSizePx: 14,
          nameColor: '#FFFFFF',
          titleColor: '#38BDF8',
          badgeStyle: 'glassmorphic',
        },
        officialEmblem: {
          x: 0.82,
          y: 0.03,
          w: 0.14,
          maxHeightPx: 45,
          placement: 'top-right',
          showInstitutionBadge: false,
        },
        editorialAccents: {
          showBarcode: false,
          editionTag: 'POLARIS EXECUTIVE LEADERSHIP BRIEF',
          editionCoordinate: { x: 0.08, y: 0.035, w: 0.45 },
        },
      },
    },
  },

  // ---------------------------------------------------------------------------
  // 4. RETRO PUBLIC CAMPAIGN (EARTHQUAKE RETRO / POSTER ACARA)
  // ---------------------------------------------------------------------------
  {
    id: 'TPL-RETRO-CAMPAIGN-01',
    name: 'Retro Public Information Campaign',
    archetype: 'RETRO_CAMPAIGN',
    referenceFile: 'EARTHQUAKE INFOGRAFIS RETRO STYLE.jpg',
    description: 'Format edukasi publik vintage 70s-80s dengan badge judul retro, kartu info bertingkat, dan ilustrasi kontekstual.',
    tags: ['edukasi', 'bencana', 'peringatan', 'kampanye', 'lingkungan', 'kesehatan', 'masyarakat', 'retro'],
    aspectRatio: '4:5',
    colorPalette: {
      primaryAccent: '#0D9488', // Vintage Teal
      backgroundBase: '#EDE8D5', // Aged Paper Yellow/Beige
      textColor: '#1C1917',     // Warm Black
      subTextColor: '#44403C',
    },
    scenePromptHint: '1970s warm retro documentary setting with vintage color grading (kodachrome warmth, warm greens, muted earth tones). Subtle paper crease lines and archival print textures.',
    negativeSpaceZone: 'Top 25% reserved for arched retro badge. Lower 60% contains partitioned informative visual planes.',
    slotManifest: {
      canvas: { width: 1080, height: 1350, aspectRatio: '4:5' },
      slots: {
        subjectPhoto: {
          x: 0.55,
          y: 0.35,
          w: 0.40,
          h: 0.55,
          anchor: 'bottom-right',
          popOutEffect: false,
          shadowOpacity: 0.30,
          shadowBlur: 10,
        },
        headlineBlock: {
          x: 0.10,
          y: 0.06,
          w: 0.80,
          maxLines: 2,
          fontFamily: 'Anton',
          fontSizePx: 64,
          textColor: '#1C1917',
          bgColor: '#F59E0B',
          isUppercase: true,
        },
        quoteStatement: {
          x: 0.08,
          y: 0.32,
          w: 0.45,
          fontFamily: 'Plus Jakarta Sans',
          fontSizePx: 17,
          textColor: '#292524',
        },
        memberIdentity: {
          x: 0.08,
          y: 0.85,
          w: 0.45,
          nameFontSizePx: 19,
          titleFontSizePx: 13,
          nameColor: '#1C1917',
          titleColor: '#0D9488',
          badgeStyle: 'minimal',
        },
        officialEmblem: {
          x: 0.08,
          y: 0.02,
          w: 0.12,
          maxHeightPx: 40,
          placement: 'top-left',
          showInstitutionBadge: true,
        },
        editorialAccents: {
          showBarcode: true,
          barcodeCoordinate: { x: 0.76, y: 0.92, w: 0.16 },
          editionTag: 'PANDUAN INFORMASI PUBLIK // PARLEMEN',
          editionCoordinate: { x: 0.35, y: 0.025, w: 0.50 },
        },
      },
    },
  },

  // ---------------------------------------------------------------------------
  // 5. TORN PAPER VERITAS (TECHNO VERITAS / NIGHT OF TREMORS)
  // ---------------------------------------------------------------------------
  {
    id: 'TPL-TORN-PAPER-VERITAS-01',
    name: 'Techno Veritas Broadsheet (Torn Paper)',
    archetype: 'TORN_PAPER_NEWS',
    referenceFile: 'Techno Veritas Volume 1 Issue 1.jpg',
    description: '3-kolom broadsheet zine dengan bukaan robekan kertas vertikal di tengah, cincin konsentris di langit malam, 3 lingkaran data statistik, dan blok headline merah tebal.',
    tags: ['bencana', 'investigasi', 'darurat', 'koran', 'data', 'advokasi', 'humanis', 'kebijakan', 'zine', 'kebakaran'],
    aspectRatio: '4:5',
    colorPalette: {
      primaryAccent: '#DC2626', // Crimson Red
      backgroundBase: '#FCFAF6', // Warm Newsprint
      textColor: '#111827',     // Deep Ink Charcoal
      subTextColor: '#4B5563',  // Slate
    },
    scenePromptHint: 'Dramatic high-impact photojournalistic documentary photograph in the style of Time Magazine / Reuters. Concentric glowing heatwave ripple rings radiating in upper sky.',
    negativeSpaceZone: 'Center 50% framed by torn paper edges, lower section contains deep black gradient for headline overlay.',
    slotManifest: {
      canvas: { width: 1080, height: 1350, aspectRatio: '4:5' },
      slots: {
        subjectPhoto: {
          x: 0.28,
          y: 0.25,
          w: 0.44,
          h: 0.50,
          anchor: 'center',
          popOutEffect: false,
          shadowOpacity: 0.4,
          shadowBlur: 20,
        },
        headlineBlock: {
          x: 0.26,
          y: 0.68,
          w: 0.48,
          maxLines: 2,
          fontFamily: 'Bebas Neue',
          fontSizePx: 72,
          textColor: '#EF4444',
          isUppercase: true,
        },
        quoteStatement: {
          x: 0.27,
          y: 0.78,
          w: 0.46,
          fontFamily: 'DejaVu Serif',
          fontSizePx: 14,
          textColor: '#FFFFFF',
        },
        memberIdentity: {
          x: 0.05,
          y: 0.90,
          w: 0.22,
          nameFontSizePx: 14,
          titleFontSizePx: 10,
          nameColor: '#111827',
          titleColor: '#6B7280',
          badgeStyle: 'minimal',
        },
        officialEmblem: {
          x: 0.46,
          y: 0.02,
          w: 0.08,
          maxHeightPx: 38,
          placement: 'top-left',
          showInstitutionBadge: false,
        },
        editorialAccents: {
          showBarcode: true,
          barcodeCoordinate: { x: 0.80, y: 0.03, w: 0.15 },
          editionTag: 'POLARIS VERITAS // EDISI ADVOKASI',
          editionCoordinate: { x: 0.35, y: 0.08, w: 0.30 },
        },
      },
    },
  },

  // ---------------------------------------------------------------------------
  // 6. RETRO PUBLIC SAFETY & MITIGATION (GET TO KNOW EARTHQUAKE)
  // ---------------------------------------------------------------------------
  {
    id: 'TPL-RETRO-MITIGATION-01',
    name: 'Retro Public Safety & Mitigation Guide',
    archetype: 'RETRO_SPLIT_MITIGATION',
    referenceFile: 'EARTHQUAKE INFOGRAFIS RETRO STYLE.jpg',
    description: 'Format infografis edukasi keselamatan dan mitigasi publik: Banner atas kapsul, 2 kartu horizontal di tengah dengan circular inset image, dan split 2 kolom bawah (Mitigasi 4 poin & Langkah Aksi).',
    tags: ['mitigasi', 'edukasi', 'bencana', 'panduan', 'keselamatan', 'lingkungan', 'tataruang', 'retro'],
    aspectRatio: '4:5',
    colorPalette: {
      primaryAccent: '#0D9488', // Vintage Teal
      backgroundBase: '#F5EFEB', // Aged Paper
      textColor: '#1E293B',     // Deep Slate
      subTextColor: '#475569',
    },
    scenePromptHint: 'Vintage 1970s public safety educational risograph illustration with aged paper grain, muted teal and warm ochre tones.',
    negativeSpaceZone: 'Central graphic area accommodates circular magnifying glass inset and segmented informational bands.',
    slotManifest: {
      canvas: { width: 1080, height: 1350, aspectRatio: '4:5' },
      slots: {
        subjectPhoto: {
          x: 0.58,
          y: 0.28,
          w: 0.36,
          h: 0.38,
          anchor: 'center',
          popOutEffect: false,
        },
        headlineBlock: {
          x: 0.08,
          y: 0.04,
          w: 0.84,
          maxLines: 2,
          fontFamily: 'Anton',
          fontSizePx: 64,
          textColor: '#FFFFFF',
          bgColor: '#0D9488',
          isUppercase: true,
        },
        quoteStatement: {
          x: 0.08,
          y: 0.24,
          w: 0.44,
          fontFamily: 'Plus Jakarta Sans',
          fontSizePx: 15,
          textColor: '#1E293B',
        },
        memberIdentity: {
          x: 0.08,
          y: 0.90,
          w: 0.40,
          nameFontSizePx: 18,
          titleFontSizePx: 12,
          nameColor: '#1E293B',
          titleColor: '#0D9488',
          badgeStyle: 'minimal',
        },
        officialEmblem: {
          x: 0.08,
          y: 0.02,
          w: 0.12,
          maxHeightPx: 36,
          placement: 'top-left',
          showInstitutionBadge: true,
        },
        editorialAccents: {
          showBarcode: true,
          barcodeCoordinate: { x: 0.78, y: 0.92, w: 0.16 },
          editionTag: 'PANDUAN KESELAMATAN WARGA // POLARIS',
          editionCoordinate: { x: 0.40, y: 0.02, w: 0.40 },
        },
      },
    },
  },

  // ---------------------------------------------------------------------------
  // 7. 5 MODERN MODULAR FRAMEWORK CARDS (5 MODERN FONT PAIRINGS)
  // ---------------------------------------------------------------------------
  {
    id: 'TPL-MODULAR-CARDS-01',
    name: '5 Modern Modular Framework Cards',
    archetype: 'MODULAR_GRID_CARDS',
    referenceFile: '5 Modern Font Pairings for Graphic Designers.jpg',
    description: 'Judul besar di atas ("5 POKOK REKOMENDASI"), diikuti grid 5 kartu bernomor 01-05 dengan foto monokrom multi-crop, aksen blok merah tebal, dan tipografi modern presisi.',
    tags: ['rekomendasi', 'kebijakan', 'framework', 'poin', 'modern', 'inovasi', 'regulasi', 'minimalis'],
    aspectRatio: '4:5',
    colorPalette: {
      primaryAccent: '#DC2626', // Crimson Red
      backgroundBase: '#FFFFFF', // Pure Clean White
      textColor: '#18181B',     // Matte Charcoal
      subTextColor: '#52525B',  // Zinc Gray
    },
    scenePromptHint: 'Minimalist high-contrast black and white architectural and infrastructure photo contact sheet.',
    negativeSpaceZone: 'Modular grid structure cleanly dividing the 5 analytical points.',
    slotManifest: {
      canvas: { width: 1080, height: 1350, aspectRatio: '4:5' },
      slots: {
        subjectPhoto: {
          x: 0.60,
          y: 0.05,
          w: 0.35,
          h: 0.20,
          anchor: 'top-right',
        },
        headlineBlock: {
          x: 0.06,
          y: 0.05,
          w: 0.60,
          maxLines: 2,
          fontFamily: 'Anton',
          fontSizePx: 68,
          textColor: '#18181B',
          isUppercase: true,
        },
        quoteStatement: {
          x: 0.06,
          y: 0.16,
          w: 0.55,
          fontFamily: 'Plus Jakarta Sans',
          fontSizePx: 14,
          textColor: '#52525B',
        },
        memberIdentity: {
          x: 0.06,
          y: 0.92,
          w: 0.40,
          nameFontSizePx: 16,
          titleFontSizePx: 12,
          nameColor: '#18181B',
          titleColor: '#DC2626',
          badgeStyle: 'minimal',
        },
        officialEmblem: {
          x: 0.85,
          y: 0.92,
          w: 0.10,
          maxHeightPx: 36,
          placement: 'bottom-right',
          showInstitutionBadge: false,
        },
        editorialAccents: {
          showBarcode: false,
          editionTag: 'FRAMEWORK KEBIJAKAN STRATEGIS // POLARIS',
          editionCoordinate: { x: 0.06, y: 0.02, w: 0.50 },
        },
      },
    },
  },

  // ---------------------------------------------------------------------------
  // 8. VINTAGE PERSONA GAZETTE (THE S NEWS / BIOGRAFI TOKOH)
  // ---------------------------------------------------------------------------
  {
    id: 'TPL-VINTAGE-GAZETTE-01',
    name: 'Vintage Persona Gazette',
    archetype: 'VINTAGE_PERSONA_GAZETTE',
    referenceFile: 'Biografi Singkat Steve Jobs.jpg',
    description: 'Koran broadsheet klasik dengan judul tabloid besar di atas, potret tokoh dominan di tengah, dan kolom narasi kebijakan diapit foto pendukung.',
    tags: ['tokoh', 'profil', 'biografi', 'opini', 'integritas', 'wawancara', 'gagasan', 'gazette'],
    aspectRatio: '4:5',
    colorPalette: {
      primaryAccent: '#1E3A8A', // Vintage Navy
      backgroundBase: '#F4F0E8', // Aged Newsprint
      textColor: '#111827',     // Classic Charcoal
      subTextColor: '#4B5563',
    },
    scenePromptHint: 'Archival broadsheet newspaper portrait setting with vintage sepia-toned darkroom lighting.',
    negativeSpaceZone: 'Central subject portrait area framed by structured editorial narrative columns.',
    slotManifest: {
      canvas: { width: 1080, height: 1350, aspectRatio: '4:5' },
      slots: {
        subjectPhoto: {
          x: 0.28,
          y: 0.20,
          w: 0.44,
          h: 0.60,
          anchor: 'center',
          popOutEffect: false,
          shadowOpacity: 0.35,
          shadowBlur: 18,
        },
        headlineBlock: {
          x: 0.06,
          y: 0.05,
          w: 0.88,
          maxLines: 2,
          fontFamily: 'Bebas Neue',
          fontSizePx: 96,
          textColor: '#111827',
          isUppercase: true,
        },
        quoteStatement: {
          x: 0.10,
          y: 0.76,
          w: 0.80,
          fontFamily: 'DejaVu Serif',
          fontSizePx: 16,
          textColor: '#1F2937',
        },
        memberIdentity: {
          x: 0.06,
          y: 0.88,
          w: 0.45,
          nameFontSizePx: 20,
          titleFontSizePx: 13,
          nameColor: '#111827',
          titleColor: '#1E3A8A',
          badgeStyle: 'minimal',
        },
        officialEmblem: {
          x: 0.82,
          y: 0.02,
          w: 0.12,
          maxHeightPx: 40,
          placement: 'top-right',
          showInstitutionBadge: true,
        },
        editorialAccents: {
          showBarcode: true,
          barcodeCoordinate: { x: 0.78, y: 0.90, w: 0.16 },
          editionTag: 'POLARIS HISTORICAL GAZETTE',
          editionCoordinate: { x: 0.06, y: 0.02, w: 0.40 },
        },
      },
    },
  },
];
