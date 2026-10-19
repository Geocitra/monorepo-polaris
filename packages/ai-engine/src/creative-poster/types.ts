/**
 * POLARIS Creative Poster Engine v2.0 - Multi-Block Collage Contracts
 * Mendefinisikan tipe data kontrak untuk arketipe poster,
 * slot koordinat deterministik, multi-block editorial grid, dan prompt compiler.
 */

export type CreativePosterArchetype =
  | 'STREET_JOURNALISM'       // Inspirasi: "POSTER PKL", "OKE GAS" (Duotone, Risograph, Isu Kerakyatan)
  | 'POP_OUT_HERO'            // Inspirasi: "THE EDGE", "Fly High", "Polaroid" (Subjek Menembus Frame, Modern Bold)
  | 'STATEMENT_PROFILE'       // Inspirasi: "Steve Jobs", "Modern Typography" (Potret Karismatik, Glassmorphic, Kutipan Tegas)
  | 'RETRO_CAMPAIGN'          // Inspirasi: "Poster Acara" (Vintage 70s-80s, Badge, Edukasi Publik)
  | 'TORN_PAPER_NEWS'         // Inspirasi: "Techno Veritas" / "Night of Tremors" / "Malam Jago Merah" (Broadsheet, Torn Centerfold, Circular Badges)
  | 'RETRO_SPLIT_MITIGATION'  // Inspirasi: "EARTHQUAKE INFOGRAFIS RETRO STYLE" / Get To Know Earthquake (Split 2-kolom, Kaca Pembesar, Ikon Mitigasi)
  | 'MODULAR_GRID_CARDS'      // Inspirasi: "5 Modern Font Pairings" (5 Kartu Bernomor 01-05, Aksen Kotak Merah, Multi-Crop)
  | 'VINTAGE_PERSONA_GAZETTE'; // Inspirasi: "The S News" / "Biografi Singkat Steve Jobs" (Koran Antik, Multi-Photo Subjek, Narasi Panjang)

export type PosterAspectRatio = '4:5' | '9:16' | '1:1' | '3:4' | '16:9';

export type SubjectCompositionMode =
  | 'PUBLIC_ADVOCACY'      // Seperti Poster PKL/Sampah: Semua subjek foto adalah ilustrasi masyarakat, nama Dewan di Header/Footer
  | 'FIGURE_CENTERPIECE';  // Foto PNG asli Anggota Dewan masuk ke dalam kolase (di-filter sesuai tema)

export interface PosterSlotCoordinate {
  x: number; // 0.0 s/d 1.0 (Persentase dari lebar kanvas)
  y: number; // 0.0 s/d 1.0 (Persentase dari tinggi kanvas)
  w: number; // 0.0 s/d 1.0
  h?: number; // 0.0 s/d 1.0
  anchor?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'center';
}

/**
 * Definisi Slot Teks Multi-Blok (Untuk layout koran/infografis kompleks)
 */
export interface EditorialTextBlockSpec {
  slotId: string; // e.g., 'left_positive', 'left_negative_box', 'center_giant_title', 'center_story', 'right_cause', 'bottom_banner'
  role: 'COLUMN_SECTION' | 'SOLID_COLOR_BOX' | 'GIANT_STACKED_TITLE' | 'BOTTOM_FULL_BANNER';
  coordinate: PosterSlotCoordinate;
  typography: {
    headerFont: 'Anton' | 'Bebas Neue' | 'Oswald';
    headerSizePx: number;
    headerColor: string;
    bodyFont: 'Plus Jakarta Sans' | 'Space Mono' | 'Oswald';
    bodySizePx: number;
    bodyColor: string;
    boxBgColor?: string;
    textAlign: 'left' | 'justify' | 'center';
  };
  constraints: {
    headerMaxChars: number;
    bodyMinChars: number;
    bodyMaxChars: number;
  };
  defaultReferenceHeader: string;
}

/**
 * Aturan Substitusi Subjek Visual 1:1 (Amati, Tiru, Modifikasi)
 */
export interface VisualCutoutSlotSpec {
  slotId: string; // e.g., 'upper_right_cutout', 'mid_left_hero_cutout', 'bottom_street_scene'
  spatialZonePrompt: string;
  originalReferenceSubject: string;
  photoTreatment: 'BW_HALFTONE_CUTOUT' | 'DUOTONE_RED_BLACK' | 'VINTAGE_WARM';
}

export interface SynthesizedEditorialCopy {
  mainBannerTitle: string;
  mainBannerSubheader: string;
  mainBannerDefinitionBody: string;
  blocks: Record<
    string,
    {
      header: string;
      body: string;
    }
  >;
  mappedVisualCutouts: Record<string, string>; // slotId -> English visual description
  // Field pendukung arketipe infografis & statistik dinamis:
  statCircles?: Array<{ topLabel: string; value: string; description: string }>;
  numberedItems?: Array<{ number: string; title: string; subtitle?: string; summary: string }>;
}

export interface PosterSlotManifest {
  canvas: {
    width: number;
    height: number;
    aspectRatio: PosterAspectRatio;
  };
  editorialBlocks?: EditorialTextBlockSpec[];
  visualCutoutSlots?: VisualCutoutSlotSpec[];
  slots: {
    // Zona Subjek Tokoh Dewan (Layer 2)
    subjectPhoto: PosterSlotCoordinate & {
      popOutEffect?: boolean;       // Apakah kepala/bahu menembus bingkai luar
      popOutOverflowTopPx?: number; // Jarak tembus ke atas dalam pixel
      shadowOpacity?: number;       // 0.0 - 1.0
      shadowBlur?: number;          // Blur radius dalam pixel
      duotoneTint?: string;         // Hex warna jika menggunakan mode duotone
      harmonizeFilter?: 'GRAYSCALE_HIGH_CONTRAST' | 'NATURAL';
    };
    // Zona Judul Utama (Layer 3)
    headlineBlock: PosterSlotCoordinate & {
      maxLines: number;
      fontFamily: 'Bebas Neue' | 'Anton' | 'Oswald';
      fontSizePx: number;
      textColor: string;
      bgColor?: string;             // Jika menggunakan banner solid block
      isUppercase?: boolean;
      interlockingWithSubject?: boolean; // Menimpa atau berada di balik pundak
    };
    // Zona Pernyataan / Kutipan Ringkas
    quoteStatement?: PosterSlotCoordinate & {
      fontFamily: string;
      fontSizePx: number;
      textColor: string;
    };
    // Zona Identitas Anggota Dewan (Nama, Gelar, Jabatan)
    memberIdentity: PosterSlotCoordinate & {
      nameFontSizePx: number;
      titleFontSizePx: number;
      nameColor: string;
      titleColor: string;
      badgeStyle?: 'minimal' | 'glassmorphic' | 'solid-ribbon';
    };
    // Zona Logo Partai / Lembaga (Layer 4 - Corner Locked)
    officialEmblem: PosterSlotCoordinate & {
      maxHeightPx: number;
      placement: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
      showInstitutionBadge?: boolean; // Label teks pendamping (e.g., "KOMISI III // DPR RI")
    };
    // Aksen Editorial (Barcode, Stempel Edisi, Tanggal)
    editorialAccents?: {
      showBarcode?: boolean;
      barcodeCoordinate?: PosterSlotCoordinate;
      editionTag?: string;
      editionCoordinate?: PosterSlotCoordinate;
    };
  };
}

export interface PreAnalyzedPosterBlueprint {
  id: string;
  name: string;
  archetype: CreativePosterArchetype;
  referenceFile: string;
  description: string;
  tags: string[];
  aspectRatio: PosterAspectRatio;
  colorPalette: {
    primaryAccent: string;   // Warna sorotan utama (e.g., Crimson Red, Safety Orange, Gold)
    backgroundBase: string;  // Warna latar (e.g., Warm Cream #F5F2EB, Pure Black #111111)
    textColor: string;       // Warna teks utama (#FFFFFF atau #111111)
    subTextColor: string;    // Warna teks sekunder
  };
  scenePromptHint: string;   // Instruksi gaya visual untuk AI (Grain, lighting, shot perspective)
  negativeSpaceZone: string; // Instruksi ruang kosong agar tidak menabrak teks
  slotManifest: PosterSlotManifest;
}

export interface GenerateCreativePosterParams {
  topic: string;
  headline?: string;
  quote?: string;
  tenantId: string;
  memberName: string;
  memberTitle?: string;
  partyName?: string;
  partyLogoUrl?: string;
  institutionLogoUrl?: string;
  subjectPhotoUrl: string; // Foto cutout PNG transparan
  aspectRatio?: PosterAspectRatio;
  forcedArchetype?: CreativePosterArchetype;
  isOfficialDutyMode?: boolean; // True jika reses dinas (Logo DPR), False jika suara partai (Logo Partai)
}

export interface CompiledPosterPrompt {
  blueprintId: string;
  archetype: CreativePosterArchetype;
  englishPrompt: string;
  aspectRatio: PosterAspectRatio;
  canvasDimensions: { width: number; height: number };
  synthesizedCopy: SynthesizedEditorialCopy;
}
