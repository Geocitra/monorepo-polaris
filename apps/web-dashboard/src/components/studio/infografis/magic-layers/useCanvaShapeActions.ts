'use client';

import { useCallback } from 'react';
import {
  Circle,
  FabricImage,
  Line,
  Rect,
  Triangle,
  loadSVGFromString,
  util,
  type Canvas as FabricCanvas,
  type FabricObject,
} from 'fabric';
import { ApiClient } from '@/lib/api-client';

export const CANVA_SHAPE_CONTROLS = {
  cornerColor: '#FFFFFF',
  cornerStrokeColor: '#7D2AE8',
  borderColor: '#7D2AE8',
  cornerSize: 9,
  cornerStyle: 'circle' as const,
  transparentCorners: false,
  borderScaleFactor: 2,
};

export type CanvaBasicShapeKind = 'rect' | 'rounded-rect' | 'circle' | 'triangle' | 'line' | 'arrow' | 'pill';

export interface CanvaSvgPreset {
  id: string;
  label: string;
  svg: string;
}

export const CANVA_SVG_ICON_PRESETS: CanvaSvgPreset[] = [
  {
    id: 'star',
    label: 'Bintang',
    svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#EA580C"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>',
  },
  {
    id: 'check',
    label: 'Centang',
    svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#059669"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg>',
  },
  {
    id: 'quote',
    label: 'Kutipan',
    svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#7C3AED"><path d="M6 17h3l2-4V7H5v6h3zm8 0h3l2-4V7h-6v6h3z"/></svg>',
  },
  {
    id: 'pin',
    label: 'Lokasi',
    svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#DC2626"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5a2.5 2.5 0 010-5 2.5 2.5 0 010 5z"/></svg>',
  },
  {
    id: 'ribbon',
    label: 'Pita Highlight',
    svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 36" fill="#0F172A"><polygon points="0,0 120,0 108,18 120,36 0,36 12,18"/></svg>',
  },
];

/**
 * Mengunggah Data URI gambar ke endpoint backend Cloudinary/CDN agar
 * `editorLayersJson` tetap ringan dan bebas string base64 raksasa.
 */
export async function uploadEditorAssetToCdn(imageDataUrl: string, filename?: string): Promise<string> {
  try {
    const res = await ApiClient.request<{ success: boolean; url: string }>('/studio/magic-layers/upload-asset', {
      method: 'POST',
      body: JSON.stringify({ imageDataUrl, filename }),
    });
    if (res?.url) return res.url;
  } catch (err) {
    console.warn('[MagicLayers] Gagal upload aset ke CDN, fallback ke Data URI sementara:', err);
  }
  return imageDataUrl;
}

interface UseCanvaShapeActionsParams {
  fabricRef: React.MutableRefObject<FabricCanvas | null>;
  canvasNaturalSizeRef: React.MutableRefObject<{ width: number; height: number }>;
  selectedObject: FabricObject | null;
  refreshLayersList: (canvas: FabricCanvas) => void;
  pushHistorySnapshot: (canvas?: FabricCanvas | null) => void;
  setSelectedObject: (obj: FabricObject | null) => void;
}

/**
 * Hook modular untuk operasi Canva Vector Shapes, SVG Icons,
 * dan properti visual objek non-teks (fill, stroke, radius, opacity, flip, crop mask).
 */
export function useCanvaShapeActions({
  fabricRef,
  canvasNaturalSizeRef,
  selectedObject,
  refreshLayersList,
  pushHistorySnapshot,
  setSelectedObject,
}: UseCanvaShapeActionsParams) {
  const addVectorObjectToCenter = useCallback(
    (obj: FabricObject, name: string, extraData?: Record<string, unknown>) => {
      const canvas = fabricRef.current;
      if (!canvas) return;
      (obj as any).customId = `shape_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
      (obj as any).customData = {
        name,
        isVectorShape: true,
        ...extraData,
      };
      obj.setCoords();
      canvas.add(obj);
      canvas.setActiveObject(obj);
      canvas.bringObjectToFront(obj);
      canvas.renderAll();
      setSelectedObject(obj);
      refreshLayersList(canvas);
      pushHistorySnapshot(canvas);
    },
    [fabricRef, pushHistorySnapshot, refreshLayersList, setSelectedObject]
  );

  const addBasicShape = useCallback(
    (kind: CanvaBasicShapeKind) => {
      const { width: cw, height: ch } = canvasNaturalSizeRef.current;
      const baseSize = Math.round(Math.min(cw, ch) * 0.22);
      const cx = Math.round(cw / 2 - baseSize / 2);
      const cy = Math.round(ch / 2 - baseSize / 2);

      if (kind === 'rect') {
        const rect = new Rect({
          originX: 'left',
          originY: 'top',
          left: cx,
          top: cy,
          width: baseSize,
          height: baseSize,
          fill: '#7C3AED',
          stroke: '#0F172A',
          strokeWidth: 0,
          rx: 0,
          ry: 0,
          ...CANVA_SHAPE_CONTROLS,
        });
        addVectorObjectToCenter(rect, 'Kotak Vektor');
        return;
      }

      if (kind === 'rounded-rect' || kind === 'pill') {
        const isPill = kind === 'pill';
        const w = isPill ? Math.round(baseSize * 1.45) : baseSize;
        const h = isPill ? Math.round(baseSize * 0.42) : Math.round(baseSize * 0.78);
        const radius = isPill ? Math.round(h / 2) : 20;
        const rect = new Rect({
          originX: 'left',
          originY: 'top',
          left: Math.round(cw / 2 - w / 2),
          top: Math.round(ch / 2 - h / 2),
          width: w,
          height: h,
          fill: isPill ? '#EA580C' : '#FFFFFF',
          stroke: isPill ? undefined : '#CBD5E1',
          strokeWidth: isPill ? 0 : 2,
          rx: radius,
          ry: radius,
          ...CANVA_SHAPE_CONTROLS,
        });
        addVectorObjectToCenter(rect, isPill ? 'Pil / Kapsul' : 'Kotak Sudut Tumpul');
        return;
      }

      if (kind === 'circle') {
        const circle = new Circle({
          originX: 'left',
          originY: 'top',
          left: cx,
          top: cy,
          radius: Math.round(baseSize / 2),
          fill: '#EA580C',
          stroke: '#0F172A',
          strokeWidth: 0,
          ...CANVA_SHAPE_CONTROLS,
        });
        addVectorObjectToCenter(circle, 'Lingkaran');
        return;
      }

      if (kind === 'triangle') {
        const tri = new Triangle({
          originX: 'left',
          originY: 'top',
          left: cx,
          top: cy,
          width: baseSize,
          height: baseSize,
          fill: '#1E3A8A',
          stroke: '#0F172A',
          strokeWidth: 0,
          ...CANVA_SHAPE_CONTROLS,
        });
        addVectorObjectToCenter(tri, 'Segitiga');
        return;
      }

      if (kind === 'line') {
        const lineW = Math.round(cw * 0.36);
        const line = new Line([0, 0, lineW, 0], {
          originX: 'left',
          originY: 'top',
          left: Math.round(cw / 2 - lineW / 2),
          top: Math.round(ch / 2),
          stroke: '#0F172A',
          strokeWidth: 6,
          ...CANVA_SHAPE_CONTROLS,
        });
        addVectorObjectToCenter(line, 'Garis Pemisah');
        return;
      }

      if (kind === 'arrow') {
        const arrowSvg =
          '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 40" fill="#EA580C"><path d="M0 15h88V5l32 15-32 15V25H0z"/></svg>';
        void loadSVGFromString(arrowSvg).then((parsed) => {
          const valid = (parsed.objects || []).filter(Boolean) as FabricObject[];
          if (valid.length === 0) return;
          const group = util.groupSVGElements(valid, parsed.options);
          const scale = Math.round(cw * 0.24) / (group.width || 120);
          group.set({
            originX: 'left',
            originY: 'top',
            left: Math.round(cw / 2 - (cw * 0.24) / 2),
            top: Math.round(ch / 2 - 20),
            scaleX: scale,
            scaleY: scale,
            ...CANVA_SHAPE_CONTROLS,
          });
          addVectorObjectToCenter(group, 'Panah Vektor', { isSvgIcon: true });
        });
      }
    },
    [addVectorObjectToCenter, canvasNaturalSizeRef]
  );

  const addSvgPreset = useCallback(
    async (preset: CanvaSvgPreset) => {
      const { width: cw, height: ch } = canvasNaturalSizeRef.current;
      const parsed = await loadSVGFromString(preset.svg);
      const valid = (parsed.objects || []).filter(Boolean) as FabricObject[];
      if (valid.length === 0) return;
      const group = util.groupSVGElements(valid, parsed.options);
      const targetSize = Math.round(Math.min(cw, ch) * 0.14);
      const scale = targetSize / Math.max(1, group.width || 24);
      group.set({
        originX: 'left',
        originY: 'top',
        left: Math.round(cw / 2 - targetSize / 2),
        top: Math.round(ch / 2 - targetSize / 2),
        scaleX: scale,
        scaleY: scale,
        ...CANVA_SHAPE_CONTROLS,
      });
      addVectorObjectToCenter(group, `Ikon: ${preset.label}`, { isSvgIcon: true });
    },
    [addVectorObjectToCenter, canvasNaturalSizeRef]
  );

  const applyShapeFill = useCallback(
    (color: string) => {
      if (!selectedObject || !fabricRef.current) return;
      if (selectedObject instanceof Line) {
        selectedObject.set('stroke', color);
      } else if ((selectedObject as any).customData?.isSvgIcon && typeof (selectedObject as any).getObjects === 'function') {
        (selectedObject as any).getObjects().forEach((child: FabricObject) => child.set('fill', color));
      } else {
        selectedObject.set('fill', color);
      }
      fabricRef.current.renderAll();
      pushHistorySnapshot(fabricRef.current);
    },
    [fabricRef, pushHistorySnapshot, selectedObject]
  );

  const applyShapeStroke = useCallback(
    (color: string) => {
      if (!selectedObject || !fabricRef.current) return;
      selectedObject.set('stroke', color);
      if (!selectedObject.strokeWidth) {
        selectedObject.set('strokeWidth', 3);
      }
      fabricRef.current.renderAll();
      pushHistorySnapshot(fabricRef.current);
    },
    [fabricRef, pushHistorySnapshot, selectedObject]
  );

  const applyShapeStrokeWidth = useCallback(
    (width: number) => {
      if (!selectedObject || !fabricRef.current) return;
      selectedObject.set('strokeWidth', width);
      if (width > 0 && !selectedObject.stroke) {
        selectedObject.set('stroke', '#0F172A');
      }
      fabricRef.current.renderAll();
      pushHistorySnapshot(fabricRef.current);
    },
    [fabricRef, pushHistorySnapshot, selectedObject]
  );

  const applyShapeRadius = useCallback(
    (radius: number) => {
      if (!selectedObject || !fabricRef.current) return;
      if (selectedObject instanceof Rect) {
        selectedObject.set({ rx: radius, ry: radius });
        fabricRef.current.renderAll();
        pushHistorySnapshot(fabricRef.current);
      }
    },
    [fabricRef, pushHistorySnapshot, selectedObject]
  );

  const applyObjectOpacity = useCallback(
    (opacity: number) => {
      if (!selectedObject || !fabricRef.current) return;
      selectedObject.set('opacity', Math.max(0.05, Math.min(1, opacity)));
      fabricRef.current.renderAll();
      pushHistorySnapshot(fabricRef.current);
    },
    [fabricRef, pushHistorySnapshot, selectedObject]
  );

  const toggleFlipHorizontal = useCallback(() => {
    if (!selectedObject || !fabricRef.current) return;
    selectedObject.set('flipX', !selectedObject.flipX);
    fabricRef.current.renderAll();
    pushHistorySnapshot(fabricRef.current);
  }, [fabricRef, pushHistorySnapshot, selectedObject]);

  const toggleImageCircleMask = useCallback(() => {
    if (!selectedObject || !fabricRef.current || !(selectedObject instanceof FabricImage)) return;
    const hasClip = Boolean(selectedObject.clipPath);
    if (hasClip) {
      selectedObject.set('clipPath', undefined);
    } else {
      const w = selectedObject.width || 100;
      const h = selectedObject.height || 100;
      selectedObject.set(
        'clipPath',
        new Circle({
          originX: 'center',
          originY: 'center',
          radius: Math.min(w, h) / 2,
        })
      );
    }
    fabricRef.current.renderAll();
    pushHistorySnapshot(fabricRef.current);
  }, [fabricRef, pushHistorySnapshot, selectedObject]);

  return {
    addBasicShape,
    addSvgPreset,
    applyShapeFill,
    applyShapeStroke,
    applyShapeStrokeWidth,
    applyShapeRadius,
    applyObjectOpacity,
    toggleFlipHorizontal,
    toggleImageCircleMask,
  };
}
