/**
 * POLARIS Art-Collage Pipeline — Kontrak Data
 *
 * Alur: Copy AI (teks) + Kanvas Kolase AI (seni utuh) -> Vision Layout Locator
 *       -> Satori transparan (tanpa kotak) -> Sharp ink-blend.
 */

import type { CreativePosterArchetype } from '../types.js';

/** Sisi kanvas yang disisakan AI sebagai bidang kertas kosong untuk teks. */
export type ArtCollageAnchor = 'TEXT_LEFT' | 'TEXT_RIGHT' | 'TEXT_TOP' | 'TEXT_BOTTOM';

export interface ArtCollageInkPalette {
  id: string;
  /** Nama natural untuk prompt gambar (tanpa kode HEX agar tidak bocor ke kanvas). */
  accentName: string;
  secondaryName: string;
  paperName: string;
  /** HEX untuk Satori. */
  accentHex: string;
  secondaryHex: string;
}

export interface ArtCollageDna {
  /** Gaya tetap (tekstur, teknik cetak, perlakuan foto) yang diwarisi dari referensi. */
  style: string;
  /** Anchor yang masuk akal untuk gaya ini (dipakai mutasi). */
  anchors: ArtCollageAnchor[];
  /** Perkiraan nada kertas: menentukan default warna tinta bila Vision gagal. */
  paperTone: 'LIGHT' | 'DARK';
}

export interface ArtCollageMutation {
  seed: number;
  anchor: ArtCollageAnchor;
  palette: ArtCollageInkPalette;
}

export interface ArtCollageCopy {
  kicker: string;
  headline: string;
  deck: string;
  points: Array<{ label: string; text: string }>;
  closingLine: string;
  /** Deskripsi visual bahasa Inggris dari topik yang sama (dipakai Otak Visual). */
  visualSubject: string;
}

/** Kotak ternormalisasi 0..1 terhadap lebar/tinggi kanvas. */
export interface NormalizedBox {
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface VisionLayoutResult {
  headline: NormalizedBox;
  body: NormalizedBox;
  footer: NormalizedBox;
  obstacles: NormalizedBox[];
  /** Saran nada teks dari Vision; compositor tetap memverifikasi via sampling piksel. */
  textTone: 'DARK' | 'LIGHT';
  source: 'GEMINI_VISION' | 'OPENAI_VISION' | 'ANCHOR_FALLBACK';
  notes?: string;
}

export interface ArtCollagePosterResult {
  imageBuffer: Buffer;
  imageMimeType: string;
  archetype: CreativePosterArchetype;
  blueprintId: string;
  referenceFile: string;
  usedStyleReference: boolean;
  mutation: ArtCollageMutation;
  copy: ArtCollageCopy;
  layout: VisionLayoutResult;
  imagePrompt: string;
  imageProvider: string;
}
