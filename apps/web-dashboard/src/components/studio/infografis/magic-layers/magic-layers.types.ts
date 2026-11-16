import type { FabricObject } from 'fabric';

export interface MagicLayersModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageUrl: string;
  initialTitle?: string;
  initialAuthor?: string;
  initialSubtitle?: string;
  aspectRatio?: string;
  archetype?: string;
  publicationId?: string;
  savedLayersJson?: string;
  rawCanvasUrl?: string;
  onApplyChanges: (renderedImageUrl: string, layersJson: string) => void;
}

export type PosterArchetype =
  | 'INFOGRAPHIC_ADVOCACY_PILLARS'
  | 'INFOGRAPHIC_NARRATIVE_WAVE'
  | 'INFOGRAPHIC_CHRONICLE_GRID'
  | 'INFOGRAPHIC_RADIAL_CLOCK'
  | 'INFOGRAPHIC_VISIONARY_TIMELINE'
  | 'GENERIC_INFOGRAPHIC';

export interface LayerItem {
  id: string;
  name: string;
  type: string;
  visible: boolean;
  locked: boolean;
  object: FabricObject;
}

export const PRESET_COLORS = [
  '#0F172A',
  '#FFFFFF',
  '#EA580C',
  '#C2410C',
  '#1E3A8A',
  '#065F46',
  '#7C3AED',
  '#64748B',
];

export const PRESET_BG_COLORS = [
  { label: 'Transparan', value: 'transparent' },
  { label: 'Kertas Krem (#FAF8F5)', value: '#FAF8F5' },
  { label: 'Putih Bersih (#FFFFFF)', value: '#FFFFFF' },
  { label: 'Kartu Putih Transparan (90%)', value: 'rgba(255, 255, 255, 0.92)' },
  { label: 'Oranye Tonggak (#EA580C)', value: '#EA580C' },
  { label: 'Kartu Gelap (#0F172A)', value: 'rgba(15, 23, 42, 0.88)' },
  { label: 'Ungu Canva (#7C3AED)', value: '#7C3AED' },
];

export const PRESET_FONTS = [
  { label: 'Inter / Modern Sans', value: "'Inter', sans-serif" },
  { label: 'Bebas Neue (Poster Bold)', value: "'Bebas Neue', sans-serif" },
  { label: 'Montserrat (Geometris)', value: "'Montserrat', sans-serif" },
  { label: 'Playfair Display (Serif)', value: "'Playfair Display', serif" },
  { label: 'Plus Jakarta Sans', value: "'Plus Jakarta Sans', sans-serif" },
  { label: 'System Default', value: 'system-ui, sans-serif' },
  { label: 'Monospace', value: 'monospace' },
];

export interface ComponentSliceDef {
  id: string;
  name: string;
  text: string;
  x: number;
  y: number;
  w: number;
  h: number;
  textColor?: string;
  cardBg?: string;
  fontSize?: number;
  fontWeight?: string | number;
  fontStyle?: '' | 'normal' | 'italic';
  fontFamily?: string;
  textAlign?: 'left' | 'center' | 'right';
  padding?: number;
}

/**
 * Peta komponen per archetype untuk pemotongan irisan pixel-perfect dari poster asli.
 * Memastikan posisi, dimensi, dan isi teks 100% konsisten dengan desain poster.
 */

/**
 * SOLUSI 1: DETEKSI TEKS (OCR) & ISOLASI BOUNDING BOX
 * Mendeteksi kotak koordinat teks sebelum segmentasi visual objek,
 * sehingga teks tidak tercampur atau terdistorsi dengan objek grafis latar belakang.
 */
export interface OCRTextDetection {
  id: string;
  text: string;
  bbox: { x: number; y: number; w: number; h: number };
  confidence: number;
  semanticRole:
    | 'kicker'
    | 'headline'
    | 'deck'
    | 'stat_val'
    | 'stat_lbl'
    | 'badge'
    | 'card_title'
    | 'card_body'
    | 'card_tag'
    | 'footer'
    | 'banner';
  fontSize?: number;
  fontWeight?: string | number;
  textColor?: string;
  fontFamily?: string;
  textAlign?: 'left' | 'center' | 'right';
}

/**
 * SOLUSI 2: SEGMENTASI SEMANTIK & PANOPTIC DOCUMENT LAYOUT
 * Mendeteksi struktur dokumen berhierarki (kotak kartu, bingkai foto hero, baris metrik, banner penegas).
 */
export interface PanopticLayoutBlock {
  id: string;
  semanticType:
    | 'MASTHEAD_CARD'
    | 'STAT_METRIC_ROW'
    | 'COLUMN_CONTAINER_CARD'
    | 'ACCENT_BANNER'
    | 'HERO_PHOTO_FRAME'
    | 'FOOTER_BAR';
  bbox: { x: number; y: number; w: number; h: number };
  cardBg?: string;
  isDraggableComponent: boolean;
}
