/**
 * POLARIS Poster Layer Manifest Contract (Single Source of Truth)
 *
 * Digunakan bersama oleh:
 * - `@polaris/storage` (ekstraktor DOM Chromium & color harmonizer)
 * - `@polaris/api-core` (Vision AI decomposition & persistence)
 * - `@polaris/web-dashboard` (Fabric.js Canva-style editor)
 *
 * Koordinat dalam piksel ruang render (`width` x `height`).
 */

export interface PosterLayerBorderSide {
  w: number;
  color: string;
}

export interface PosterLayerBorders {
  top: PosterLayerBorderSide | null;
  right: PosterLayerBorderSide | null;
  bottom: PosterLayerBorderSide | null;
  left: PosterLayerBorderSide | null;
}

export interface PosterLayerShadow {
  color: string;
  offsetX: number;
  offsetY: number;
  blur: number;
}

export interface PosterLayerBox {
  fill: string | null;
  radius: number;
  borders: PosterLayerBorders;
  shadow: PosterLayerShadow | null;
}

export interface PosterFrameLayer extends PosterLayerBox {
  kind: 'frame';
  id: string;
  role: string;
  x: number;
  y: number;
  w: number;
  h: number;
  opacity?: number;
}

export interface PosterTextLayer {
  kind: 'text';
  id: string;
  role: string;
  text: string;
  /** Kotak konten teks (tanpa padding). */
  x: number;
  y: number;
  w: number;
  h: number;
  fontFamily: string;
  fontSize: number;
  fontWeight: string;
  fontStyle: string;
  color: string;
  textAlign: 'left' | 'center' | 'right' | 'justify';
  lineHeightPx: number;
  letterSpacingPx: number;
  /** Latar milik teks itu sendiri (mis. badge/pill) — digambar mengikuti padding CSS. */
  box: (PosterLayerBox & { padding: { t: number; r: number; b: number; l: number } }) | null;
  opacity?: number;
}

export interface PosterImageLayer {
  kind: 'image';
  id: string;
  role: string;
  /** URL CDN atau path gambar terpotong; hindari data URI permanen di DB. */
  src: string;
  x: number;
  y: number;
  w: number;
  h: number;
  radius?: number;
  opacity?: number;
  objectFit?: 'cover' | 'contain' | 'fill';
}

export type PosterShapeVariant = 'rect' | 'circle' | 'triangle' | 'line' | 'arrow' | 'svg';

export interface PosterShapeLayer {
  kind: 'shape';
  id: string;
  role: string;
  shapeType: PosterShapeVariant;
  x: number;
  y: number;
  w: number;
  h: number;
  fill: string | null;
  stroke?: string | null;
  strokeWidth?: number;
  radius?: number;
  opacity?: number;
  /** Markup SVG mentah jika `shapeType === 'svg'` */
  svgMarkup?: string;
}

export type PosterLayer =
  | PosterFrameLayer
  | PosterTextLayer
  | PosterImageLayer
  | PosterShapeLayer;

export interface PosterLayerManifest {
  version: 1 | 2;
  width: number;
  height: number;
  layers: PosterLayer[];
}
