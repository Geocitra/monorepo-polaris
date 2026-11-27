'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import {
  Canvas as FabricCanvas,
  FabricImage,
  Textbox,
  Shadow,
  FabricObject,
} from 'fabric';
import {
  Layers,
  Type,
  Image as ImageIcon,
  Square,
  Trash2,
  Eye,
  EyeOff,
  Lock,
  Unlock,
  ArrowUp,
  ArrowDown,
  Wand2,
  Sparkles,
  Download,
  Save,
  Bold,
  Italic,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Plus,
  Loader2,
  Check,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Copy,
  ChevronRight,
  ArrowLeft,
  Edit3,
  Undo2,
  Redo2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/toast';
import { ApiClient } from '@/lib/api-client';
import {
  attachComponentOutlineOverlay,
  attachSnapGuides,
  buildAsyncMediaLayersFromManifest,
  buildGranularObjectsFromComponentDefs,
  buildObjectsFromManifest,
  ensurePosterFontsLoaded,
  fetchPosterLayerData,
  rehydrateMlObjects,
  type PosterLayerManifest,
} from './poster-layer-builder';
import {
  uploadEditorAssetToCdn,
  useCanvaShapeActions,
} from './magic-layers/useCanvaShapeActions';
import {
  type MagicLayersModalProps,
  type PosterArchetype,
  type LayerItem,
  type ComponentSliceDef,
  type OCRTextDetection,
  type PanopticLayoutBlock,
  PRESET_COLORS,
  PRESET_BG_COLORS,
  PRESET_FONTS,
} from './magic-layers/magic-layers.types';
import {
  detectPosterLayout,
  getArchetypeComponentDefs,
} from './magic-layers/magic-layers.archetypes';
import {
  createCanvaComponent,
  createCleanPosterBackground,
  resolveSafeImageUrl,
  loadResilientFabricImage,
  applyHeuristicComponentGrouping,
  smartTextureInpainting,
  extractInpaintBoundsFromManifest,
  placeImageCover,
} from './magic-layers/magic-layers.canvas-utils';
import { MagicLayersHeader } from './magic-layers/MagicLayersHeader';
import { MagicLayersFormattingBar } from './magic-layers/MagicLayersFormattingBar';
import { MagicLayersSidebar } from './magic-layers/MagicLayersSidebar';
import { MagicLayersCanvasStage } from './magic-layers/MagicLayersCanvasStage';

export {
  type PosterArchetype,
  type ComponentSliceDef,
  type OCRTextDetection,
  type PanopticLayoutBlock,
  detectPosterLayout,
  getArchetypeComponentDefs,
  applyHeuristicComponentGrouping,
  extractInpaintBoundsFromManifest,
};

export function MagicLayersModal({
  isOpen,
  onClose,
  imageUrl,
  initialTitle = '',
  initialAuthor = '',
  initialSubtitle = '',
  aspectRatio,
  archetype,
  publicationId,
  savedLayersJson,
  rawCanvasUrl,
  onApplyChanges,
}: MagicLayersModalProps) {
  const { toast } = useToast();
  const canvasElRef = useRef<HTMLCanvasElement | null>(null);
  const fabricRef = useRef<FabricCanvas | null>(null);
  // Saat ekspor, overlay garis bantu komponen (gaya Canva) tidak ikut dirender
  const isExportingRef = useRef(false);
  const workspaceRef = useRef<HTMLDivElement | null>(null);

  // Studio UI Navigation State
  const [activeTab, setActiveTab] = useState<'layers' | 'text' | 'elements' | 'magic'>('layers');
  const [layers, setLayers] = useState<LayerItem[]>([]);
  const [selectedLayerId, setSelectedLayerId] = useState<string | null>(null);
  const [selectedObject, setSelectedObject] = useState<FabricObject | null>(null);

  // Lembaran Canvas Native Dimensions (Disesuaikan 100% dari resolusi asli gambar via Ref)
  const canvasNaturalSizeRef = useRef({ width: 1080, height: 1350 });
  const [displayDimensions, setDisplayDimensions] = useState({ width: 0, height: 0 });

  // Viewport Zoom State
  const [zoomLevel, setZoomLevel] = useState<number>(1.0); // 1.0 = Fit to screen
  const [fitScale, setFitScale] = useState<number>(0.5);

  const [isLoading, setIsLoading] = useState(true);
  const [isDecomposed, setIsDecomposed] = useState<boolean>(!!savedLayersJson);
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [pipelineStep, setPipelineStep] = useState<number>(0);
  const [pipelineStatusText, setPipelineStatusText] = useState<string>('');
  const [isCuttingOut, setIsCuttingOut] = useState(false);
  const [cutoutSuccess, setCutoutSuccess] = useState(false);
  const [hasGrabbedText, setHasGrabbedText] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // ─── UNDO / REDO HISTORY STACK (CTRL+Z & CTRL+Y) ───
  const historyStackRef = useRef<string[]>([]);
  const historyIndexRef = useRef<number>(-1);
  const isRestoringHistoryRef = useRef<boolean>(false);
  const liveTextDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [canUndo, setCanUndo] = useState<boolean>(false);
  const [canRedo, setCanRedo] = useState<boolean>(false);

  // Text Styling & Live Sentence Editing State
  const [currentTextContent, setCurrentTextContent] = useState('');
  const [fontFamily, setFontFamily] = useState("'Inter', sans-serif");
  const [fontSize, setFontSize] = useState(36);
  const [fillColor, setFillColor] = useState('#0F172A');
  const [bgColor, setBgColor] = useState('transparent');
  const [isBold, setIsBold] = useState(false);
  const [isItalic, setIsItalic] = useState(false);
  const [textAlign, setTextAlign] = useState<'left' | 'center' | 'right'>('left');

  // Helper to refresh layer list from Fabric canvas
  const refreshLayersList = useCallback((canvas: FabricCanvas) => {
    if (!canvas || (canvas as any).isDisposed) return;
    try {
      const objects = canvas.getObjects();
      // Reverse objects so the topmost visual layer appears at the top of the UI list
      const mapped: LayerItem[] = [...objects].reverse().map((obj, revIdx) => {
        const idx = objects.indexOf(obj);
        const customData = (obj as any).customData || {};
        let name = customData.name;
        if (!name) {
          if (obj instanceof Textbox) {
            name = `Teks: "${obj.text?.slice(0, 24) || 'Kosong'}..."`;
          } else if (obj instanceof FabricImage) {
            name = customData.isCutout ? 'Objek Depan (Cutout)' : 'Poster Asli (Latar Belakang)';
          } else {
            name = `Layer ${objects.length - idx}`;
          }
        }

        return {
          id: (obj as any).customId || `obj_${idx}`,
          name,
          type: obj.type || 'object',
          visible: obj.visible !== false,
          locked: !!obj.lockMovementX,
          object: obj,
        };
      });

      setLayers(mapped);
    } catch (err) {
      console.warn('[MagicLayers] refreshLayersList error:', err);
    }
  }, []);

  const SERIALIZED_FABRIC_PROPS = [
    'customId',
    'customData',
    'selectable',
    'evented',
    'lockMovementX',
    'lockMovementY',
    'lockRotation',
    'lockScalingX',
    'lockScalingY',
    'hasControls',
    'hasBorders',
    'visible',
  ];

  const syncHistoryFlags = useCallback(() => {
    setCanUndo(historyIndexRef.current > 0);
    setCanRedo(historyIndexRef.current >= 0 && historyIndexRef.current < historyStackRef.current.length - 1);
  }, []);

  const pushHistorySnapshot = useCallback(
    (targetCanvas?: FabricCanvas | null, resetStack = false) => {
      const canvas = targetCanvas || fabricRef.current;
      if (!canvas || (canvas as any).isDisposed || isRestoringHistoryRef.current) return;
      try {
        const snapshot = JSON.stringify((canvas as any).toObject(SERIALIZED_FABRIC_PROPS));
        if (resetStack) {
          historyStackRef.current = [snapshot];
          historyIndexRef.current = 0;
          syncHistoryFlags();
          return;
        }
        const currentIdx = historyIndexRef.current;
        if (currentIdx >= 0 && historyStackRef.current[currentIdx] === snapshot) {
          return;
        }
        const nextStack = historyStackRef.current.slice(0, currentIdx + 1);
        nextStack.push(snapshot);
        if (nextStack.length > 50) {
          nextStack.shift();
        }
        historyStackRef.current = nextStack;
        historyIndexRef.current = nextStack.length - 1;
        syncHistoryFlags();
      } catch (err) {
        console.warn('[MagicLayers] Gagal menyimpan snapshot history:', err);
      }
    },
    [syncHistoryFlags]
  );

  const restoreHistoryAtIndex = useCallback(
    async (targetIdx: number) => {
      const canvas = fabricRef.current;
      if (!canvas || (canvas as any).isDisposed || isRestoringHistoryRef.current) return;
      if (targetIdx < 0 || targetIdx >= historyStackRef.current.length) return;

      const snapshot = historyStackRef.current[targetIdx];
      if (!snapshot) return;

      isRestoringHistoryRef.current = true;
      try {
        await canvas.loadFromJSON(snapshot);
        rehydrateMlObjects(canvas);
        canvas.getObjects().forEach((obj) => {
          if ((obj as any).customData?.isBackground) {
            obj.set({ selectable: false, evented: false });
          }
          obj.setCoords();
        });
        canvas.discardActiveObject();
        canvas.requestRenderAll();
        refreshLayersList(canvas);
        updateStylePanelFromObject(null);
        historyIndexRef.current = targetIdx;
        syncHistoryFlags();
      } catch (err) {
        console.warn('[MagicLayers] Gagal memulihkan state Undo/Redo:', err);
      } finally {
        isRestoringHistoryRef.current = false;
      }
    },
    [refreshLayersList, syncHistoryFlags]
  );

  const handleUndo = useCallback(() => {
    if (historyIndexRef.current <= 0 || isRestoringHistoryRef.current) return;
    void restoreHistoryAtIndex(historyIndexRef.current - 1);
  }, [restoreHistoryAtIndex]);

  const handleRedo = useCallback(() => {
    if (
      historyIndexRef.current < 0 ||
      historyIndexRef.current >= historyStackRef.current.length - 1 ||
      isRestoringHistoryRef.current
    ) {
      return;
    }
    void restoreHistoryAtIndex(historyIndexRef.current + 1);
  }, [restoreHistoryAtIndex]);

  // Update styling panel and sentence edit input when active object changes
  const updateStylePanelFromObject = (obj: FabricObject | null) => {
    setSelectedObject(obj);
    if (!obj) {
      setSelectedLayerId(null);
      setCurrentTextContent('');
      return;
    }

    setSelectedLayerId((obj as any).customId || null);

    if (obj instanceof Textbox) {
      setCurrentTextContent(obj.text || '');
      setFontFamily(obj.fontFamily || "'Inter', sans-serif");
      setFontSize(obj.fontSize || 36);
      setFillColor(typeof obj.fill === 'string' ? obj.fill : '#0F172A');
      const mlBoxFill = (obj as any).customData?.mlStyle?.box?.fill;
      const effectiveBg =
        typeof obj.backgroundColor === 'string' && obj.backgroundColor
          ? obj.backgroundColor
          : typeof mlBoxFill === 'string' && mlBoxFill
            ? mlBoxFill
            : 'transparent';
      setBgColor(effectiveBg);
      setIsBold(obj.fontWeight === 'bold' || (typeof obj.fontWeight === 'number' && obj.fontWeight >= 700));
      setIsItalic(obj.fontStyle === 'italic');
      setTextAlign((obj.textAlign as any) || 'left');
    } else if (obj && (obj as any).customData?.isComponentSlice) {
      const customData = (obj as any).customData;
      setCurrentTextContent(customData.text || '');
      const def = customData.def;
      if (def) {
        if (def.fontFamily) setFontFamily(def.fontFamily);
        if (def.fontSize) setFontSize(def.fontSize);
        if (def.textColor) setFillColor(def.textColor);
        if (def.cardBg) setBgColor(def.cardBg);
        if (def.fontWeight) setIsBold(def.fontWeight === 'bold' || (typeof def.fontWeight === 'number' && def.fontWeight >= 700));
        if (def.fontStyle) setIsItalic(def.fontStyle === 'italic');
        if (def.textAlign) setTextAlign(def.textAlign);
      }
    }
  };

  // ─── RESIZE & RESPONSIVE FIT ENGINE (100% RASIO PRESISI MENGGUNAKAN CSS DISPLAY) ───
  // Mempertahankan resolusi buffer asli gambar, hanya mengubah ukuran display CSS agar pas ke layar
  const updateResponsiveFit = useCallback(() => {
    const canvas = fabricRef.current;
    const container = workspaceRef.current;
    if (!canvas || !container || (canvas as any).isDisposed) return;

    const { clientWidth, clientHeight } = container;
    if (!clientWidth || !clientHeight) return;

    const naturalW = canvasNaturalSizeRef.current.width;
    const naturalH = canvasNaturalSizeRef.current.height;
    if (!naturalW || !naturalH) return;

    const paddingX = 64;
    const paddingY = 64;
    const availW = Math.max(120, clientWidth - paddingX);
    const availH = Math.max(120, clientHeight - paddingY);

    const calculatedFit = Math.min(availW / naturalW, availH / naturalH);
    setFitScale(calculatedFit);

    const effectiveScale = calculatedFit * zoomLevel;
    const dispW = Math.round(naturalW * effectiveScale);
    const dispH = Math.round(naturalH * effectiveScale);

    setDisplayDimensions({ width: dispW, height: dispH });

    try {
      // cssOnly: true menjaga buffer kanvas tetap 1080x1350 tanpa distorsi atau double scaling
      canvas.setDimensions(
        { width: `${dispW}px`, height: `${dispH}px` },
        { cssOnly: true }
      );
      canvas.renderAll();
    } catch (err) {
      console.warn('[MagicLayers] setDimensions error:', err);
    }
  }, [zoomLevel]);

  // Hook resize observer independently from canvas initialization
  useEffect(() => {
    if (!isOpen) return;
    updateResponsiveFit();
    window.addEventListener('resize', updateResponsiveFit);

    const wsEl = workspaceRef.current;
    const handleWheelZoom = (e: WheelEvent) => {
      if (!(e.ctrlKey || e.metaKey)) return;
      e.preventDefault();
      const delta = e.deltaY < 0 ? 0.1 : -0.1;
      setZoomLevel((prev) => Math.max(0.25, Math.min(3.0, Number((prev + delta).toFixed(2)))));
    };
    wsEl?.addEventListener('wheel', handleWheelZoom, { passive: false });

    let observer: ResizeObserver | null = null;
    if (wsEl) {
      observer = new ResizeObserver(() => updateResponsiveFit());
      observer.observe(wsEl);
    }

    return () => {
      window.removeEventListener('resize', updateResponsiveFit);
      wsEl?.removeEventListener('wheel', handleWheelZoom);
      observer?.disconnect();
    };
  }, [isOpen, updateResponsiveFit]);

  // Shortcut Keyboard Global: Ctrl+Z (Undo) & Ctrl+Y / Ctrl+Shift+Z (Redo)
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      const tag = target?.tagName?.toLowerCase();
      if (tag === 'input' || tag === 'textarea' || tag === 'select' || target?.isContentEditable) {
        return;
      }
      const activeObj = fabricRef.current?.getActiveObject();
      if (activeObj instanceof Textbox && (activeObj as any).isEditing) {
        return;
      }

      const isMod = e.ctrlKey || e.metaKey;
      if (!isMod) return;

      const key = e.key.toLowerCase();
      if (key === 'z' && !e.shiftKey) {
        e.preventDefault();
        e.stopPropagation();
        handleUndo();
      } else if (key === 'y' || (key === 'z' && e.shiftKey)) {
        e.preventDefault();
        e.stopPropagation();
        handleRedo();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, handleUndo, handleRedo]);

  // Set default Canva-style selection styling
  useEffect(() => {
    FabricObject.ownDefaults.originX = 'left';
    FabricObject.ownDefaults.originY = 'top';
    FabricObject.ownDefaults.transparentCorners = false;
    FabricObject.ownDefaults.cornerColor = '#FFFFFF';
    FabricObject.ownDefaults.cornerStrokeColor = '#7D2AE8'; // Canva purple
    FabricObject.ownDefaults.borderColor = '#7D2AE8';
    FabricObject.ownDefaults.cornerSize = 9;
    FabricObject.ownDefaults.cornerStyle = 'circle';
    FabricObject.ownDefaults.borderScaleFactor = 1.5;
    FabricObject.ownDefaults.padding = 4;
  }, []);

  // ─── INITIALIZE FABRIC CANVAS (100% PERSIS POSTER ASLI GAMBAR 2) ───
  useEffect(() => {
    if (!isOpen || !canvasElRef.current) return;

    setIsLoading(true);
    let isDisposed = false;

    // Dispose previous instance safely
    if (fabricRef.current) {
      try {
        (fabricRef.current as any).isDisposed = true;
        fabricRef.current.dispose();
      } catch { }
      fabricRef.current = null;
    }

    const initCanvasContent = async () => {
      try {
        // 1. Muat Poster Gambar Asli terlebih dahulu untuk mengetahui resolusi aslinya
        const rawImg = await loadResilientFabricImage(imageUrl);
        if (isDisposed || !canvasElRef.current) return;

        const naturalW = rawImg.width || 1080;
        const naturalH = rawImg.height || 1350;
        canvasNaturalSizeRef.current = { width: naturalW, height: naturalH };

        // 2. Inisialisasi Fabric Canvas LANGSUNG dengan resolusi asli poster
        const canvas = new FabricCanvas(canvasElRef.current, {
          width: naturalW,
          height: naturalH,
          backgroundColor: '#FFFFFF',
          preserveObjectStacking: true,
          selection: true,
        });

        fabricRef.current = canvas;

        // Canvas Event Listeners
        canvas.on('selection:created', (e) => updateStylePanelFromObject(e.selected?.[0] || null));
        canvas.on('selection:updated', (e) => updateStylePanelFromObject(e.selected?.[0] || null));
        canvas.on('selection:cleared', () => updateStylePanelFromObject(null));
        canvas.on('object:modified', () => {
          refreshLayersList(canvas);
          if (canvas.getActiveObject() instanceof Textbox) {
            updateStylePanelFromObject(canvas.getActiveObject() || null);
          }
          pushHistorySnapshot(canvas);
        });
        canvas.on('text:editing:exited', () => {
          pushHistorySnapshot(canvas);
        });
        canvas.on('object:added', () => refreshLayersList(canvas));
        canvas.on('object:removed', () => refreshLayersList(canvas));
        attachComponentOutlineOverlay(canvas, () => isExportingRef.current);
        attachSnapGuides(canvas, () => isExportingRef.current);
        canvas.on('text:changed', (e) => {
          if (e.target instanceof Textbox) {
            setCurrentTextContent(e.target.text || '');
            refreshLayersList(canvas);
          }
        });

        // 3. Tambahkan Latar Belakang Poster 1:1 Mengisi Penuh Kanvas Tanpa Distorsi (Poster Asli Utuh)
        const bgImg = await loadResilientFabricImage(imageUrl);

        bgImg.set({
          originX: 'left',
          originY: 'top',
          left: 0,
          top: 0,
          scaleX: naturalW / (bgImg.width || naturalW),
          scaleY: naturalH / (bgImg.height || naturalH),
          selectable: false,
          evented: false,
        });
        bgImg.setCoords();

        (bgImg as any).customId = 'layer_background';
        (bgImg as any).customData = { name: 'Poster Asli (Latar Belakang)', isBackground: true };
        canvas.add(bgImg);
        canvas.sendObjectToBack(bgImg);

        // 4. Jika ada sesi tersimpan sebelumnya, muat kembali susunan layernya
        if (savedLayersJson) {
          try {
            const sanitizedJson = savedLayersJson.replace(/https?:\/\/[^\/]+(?::\d+)?\/uploads\//g, '/uploads/');
            await canvas.loadFromJSON(sanitizedJson);
            // Pulihkan renderer dekorasi (kotak badge, border kartu) yang tidak ikut terserialisasi
            rehydrateMlObjects(canvas);
            // Pastikan layer background selalu terkunci & berada di paling belakang
            canvas.getObjects().forEach((o) => {
              if ((o as any).customData?.isBackground || (o as any).customId === 'layer_background') {
                o.set({ selectable: false, evented: false, lockMovementX: true, lockMovementY: true });
                canvas.sendObjectToBack(o);
              }
            });
            canvas.renderAll();
            if (!isDisposed) {
              refreshLayersList(canvas);
              pushHistorySnapshot(canvas, true);
              updateResponsiveFit();
              setTimeout(() => {
                if (!isDisposed) updateResponsiveFit();
              }, 60);
              setIsLoading(false);
              setIsDecomposed(true);
            }
            return;
          } catch (jsonErr) {
            console.warn('[MagicLayers] Sesi JSON tersimpan tidak dapat dimuat, menampilkan poster asli:', jsonErr);
          }
        }

        // Tampilan Awal: Tampilkan poster asli utuh terlebih dahulu (belum dipisahkan)
        canvas.renderAll();
        if (!isDisposed) {
          refreshLayersList(canvas);
          pushHistorySnapshot(canvas, true);
          updateResponsiveFit();
          setTimeout(() => {
            if (!isDisposed) updateResponsiveFit();
          }, 60);
          setIsLoading(false);
          setIsDecomposed(false);
        }
      } catch (err: any) {
        console.error('Error initializing Magic Layers canvas:', err);
        if (!isDisposed) {
          toast({
            type: 'error',
            title: 'Gagal memuat kanvas',
            description: err?.message || 'Tidak dapat memuat berkas gambar.',
          });
          setIsLoading(false);
        }
      }
    };

    initCanvasContent();

    return () => {
      isDisposed = true;
      if (fabricRef.current) {
        try {
          (fabricRef.current as any).isDisposed = true;
          fabricRef.current.dispose();
        } catch { }
        fabricRef.current = null;
      }
    };
  }, [isOpen, imageUrl, savedLayersJson]);

  // ─── 🪄 TRIGGER CANVA MAGIC LAYERS WITH 4-STAGE PIPELINE & LASER SCANNING ───
  const handleTriggerMagicLayers = async (forceReExtract: boolean | unknown = false) => {
    const isForce = typeof forceReExtract === 'boolean' ? forceReExtract : false;
    if (!fabricRef.current || isScanning || (isDecomposed && !isForce)) return;
    setIsScanning(true);

    try {
      const canvas = fabricRef.current;
      const { width: naturalW, height: naturalH } = canvasNaturalSizeRef.current;

      // ════════════════════════════════════════════════════════════════════════
      // JALUR UTAMA (BEST PRACTICE): LAYER MANIFEST DARI RENDER CHROMIUM
      // Setiap kotak kartu & teks (badge, judul, paragraf, tag) diekstrak dari DOM
      // saat poster dirender, lalu dibangun ulang sebagai komponen terpisah yang
      // bisa diedit langsung — 1:1 dengan poster, di atas Master Raw Canvas.
      // ════════════════════════════════════════════════════════════════════════
      setPipelineStep(1);
      setPipelineStatusText('1/4 Menganalisis elemen visual & OCR teks asli dari poster...');
      const layerData = await fetchPosterLayerData(imageUrl, publicationId, naturalW, naturalH, isForce);
      const effectiveRawCanvasUrl =
        rawCanvasUrl && rawCanvasUrl !== imageUrl
          ? rawCanvasUrl
          : layerData.rawCanvasUrl && layerData.rawCanvasUrl !== imageUrl
            ? layerData.rawCanvasUrl
            : undefined;

      if (layerData.manifest) {
        const manifest = layerData.manifest;

        setPipelineStep(2);
        setPipelineStatusText('2/4 Memuat tipografi asli poster...');
        await ensurePosterFontsLoaded(manifest);

        setPipelineStep(3);
        setPipelineStatusText('3/4 Memisahkan kotak kartu, gambar, dan setiap teks asli menjadi komponen mandiri...');
        const objects = buildObjectsFromManifest(manifest, naturalW, naturalH);
        const mediaObjects = await buildAsyncMediaLayersFromManifest(manifest, naturalW, naturalH);

        setPipelineStep(4);
        setPipelineStatusText('4/4 Inpainting cerdas latar belakang bersih (menghapus teks lama)...');
        const inpaintDefs = extractInpaintBoundsFromManifest(
          manifest,
          naturalW,
          naturalH,
          layerData.detectedArchetype || archetype
        );

        const hasImageLayers = manifest.layers.some((l) => l.kind === 'image');
        const cleanBgToUse =
          !isForce && !hasImageLayers && effectiveRawCanvasUrl
            ? effectiveRawCanvasUrl
            : await createCleanPosterBackground(
                imageUrl,
                naturalW,
                naturalH,
                inpaintDefs,
                layerData.detectedArchetype || archetype,
                publicationId,
                isForce || hasImageLayers ? undefined : effectiveRawCanvasUrl
              );

        const rawImg = await loadResilientFabricImage(resolveSafeImageUrl(cleanBgToUse));
        placeImageCover(rawImg, naturalW, naturalH);
        (rawImg as any).customId = 'layer_background';
        (rawImg as any).customData = { name: 'Latar Belakang Bersih (Tanpa Teks)', isBackground: true };

        canvas.discardActiveObject();
        canvas.getObjects().slice().forEach((o) => canvas.remove(o));
        canvas.add(rawImg);
        canvas.sendObjectToBack(rawImg);
        objects.forEach((o) => canvas.add(o));
        mediaObjects.forEach((o) => canvas.add(o));

        canvas.requestRenderAll();
        refreshLayersList(canvas);
        pushHistorySnapshot(canvas, true);
        setIsDecomposed(true);

        const textCount = objects.filter((o) => o instanceof Textbox).length;
        const totalNonText = objects.length - textCount + mediaObjects.length;
        toast({
          type: 'success',
          title: 'Magic Layers Selesai',
          description: `${textCount} teks dan ${totalNonText} elemen grafis/gambar berhasil dipisahkan sesuai isi konten asli poster Anda.`,
        });
        return;
      }

      setIsDecomposed(true);
      refreshLayersList(canvas);
      pushHistorySnapshot(canvas, true);

      toast({
        type: 'info',
        title: 'Ekstraksi Otomatis Tidak Menemukan Teks Terstruktur',
        description: 'Anda tetap dapat menambahkan teks, badge, atau mengunggah gambar secara manual di panel kiri.',
      });
    } catch (err: any) {
      console.error('[MagicLayers] Gagal mengurai layer:', err);
      toast({
        type: 'error',
        title: 'Gagal Mengurai Layer',
        description: err?.message || 'Kendala saat memproses pemisahan layer.',
      });
    } finally {
      setIsScanning(false);
      setPipelineStep(0);
      setPipelineStatusText('');
    }
  };

  // ─── RESET KEMBALI KE POSTER ASLI UTUH ───
  const handleResetToOriginal = async () => {
    if (!fabricRef.current) return;
    const canvas = fabricRef.current;
    canvas.clear();

    const naturalW = canvasNaturalSizeRef.current.width;
    const naturalH = canvasNaturalSizeRef.current.height;

    const bgImg = await loadResilientFabricImage(imageUrl);
    bgImg.set({
      originX: 'left',
      originY: 'top',
      left: 0,
      top: 0,
      scaleX: naturalW / (bgImg.width || naturalW),
      scaleY: naturalH / (bgImg.height || naturalH),
      selectable: false,
      evented: false,
    });
    bgImg.setCoords();
    (bgImg as any).customId = 'layer_background';
    (bgImg as any).customData = { name: 'Poster Asli (Latar Belakang)', isBackground: true };
    canvas.add(bgImg);
    canvas.sendObjectToBack(bgImg);
    canvas.renderAll();
    refreshLayersList(canvas);
    setIsDecomposed(false);

    toast({
      type: 'info',
      title: 'Kanvas Direset',
      description: 'Tampilan dikembalikan ke poster asli utuh.',
    });
  };

  // ─── MAGIC CUTOUT FUNCTION (KETIKA PENGGUNA MENGKLIK TOMBOL PISAHKAN OBJEK) ───
  const handleMagicCutout = async () => {
    if (!fabricRef.current || isCuttingOut) return;
    setIsCuttingOut(true);
    setCutoutSuccess(false);

    try {
      toast({
        type: 'info',
        title: 'Memproses Magic Cutout...',
        description: 'Mengekstrak subjek manusia/objek menjadi layer terpisah di depan. Harap tunggu sebentar.',
      });

      const safeUrl = resolveSafeImageUrl(imageUrl);

      // 1. Dapatkan Blob gambar poster murni (mencegah error Invalid format: text/html pada @imgly)
      let imageInput: Blob | null = null;
      try {
        const imgRes = await fetch(safeUrl);
        if (imgRes.ok) {
          const fetchedBlob = await imgRes.blob();
          if (fetchedBlob.type.startsWith('image/')) {
            imageInput = fetchedBlob;
          }
        }
      } catch (fetchErr) {
        console.warn('[MagicCutout] Fetch blob poster terlewati:', fetchErr);
      }

      // Fallback tangguh: Ambil data gambar langsung dari Fabric canvas jika network fetch gagal
      if (!imageInput && fabricRef.current) {
        const bgObj = fabricRef.current.getObjects().find((o) => (o as any).customData?.isBackground);
        if (bgObj) {
          const dataUrl = bgObj.toDataURL({ format: 'png', multiplier: 1.0 });
          const res = await fetch(dataUrl);
          imageInput = await res.blob();
        }
      }

      if (!imageInput) {
        throw new Error('Tidak dapat memproses berkas gambar poster.');
      }

      // 2. Jalankan pemisahan subjek depan AI (@imgly/background-removal)
      const { removeBackground } = await import('@imgly/background-removal');
      const blob = await removeBackground(imageInput);
      const dataUrl = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onload = () => resolve(String(reader.result || ''));
        reader.readAsDataURL(blob);
      });
      const cdnOrLocalUrl = dataUrl ? await uploadEditorAssetToCdn(dataUrl, 'cutout.png') : URL.createObjectURL(blob);

      const cutoutImg = await loadResilientFabricImage(cdnOrLocalUrl);
      if (!fabricRef.current) return;

      const naturalW = canvasNaturalSizeRef.current.width;
      const naturalH = canvasNaturalSizeRef.current.height;

      // Skala yang presisi agar pas 1:1 di atas gambar latar belakang
      const scaleX = naturalW / (cutoutImg.width || 1);
      const scaleY = naturalH / (cutoutImg.height || 1);

      cutoutImg.set({
        originX: 'left',
        originY: 'top',
        left: 0,
        top: 0,
        scaleX,
        scaleY,
        selectable: true,
      });
      cutoutImg.setCoords();

      (cutoutImg as any).customId = `cutout_${Date.now()}`;
      (cutoutImg as any).customData = { name: 'Objek Depan (Cutout Subjek)', isCutout: true };

      fabricRef.current.add(cutoutImg);
      fabricRef.current.bringObjectToFront(cutoutImg);
      fabricRef.current.renderAll();

      refreshLayersList(fabricRef.current);
      setCutoutSuccess(true);
      setActiveTab('layers');

      toast({
        type: 'success',
        title: 'Magic Cutout Berhasil!',
        description: 'Subjek berhasil dipisahkan menjadi layer di depan! Anda kini dapat menggesernya atau menaruh teks di belakangnya.',
      });
    } catch (err: any) {
      console.error('Magic Cutout error:', err);
      toast({
        type: 'error',
        title: 'Magic Cutout Belum Berhasil',
        description: err?.message || 'Gagal mengekstrak subjek objek.',
      });
    } finally {
      setIsCuttingOut(false);
    }
  };

  // ─── LIVE SENTENCE / TEXT EDITING HANDLER ───
  const handleLiveTextChange = (newText: string) => {
    setCurrentTextContent(newText);
    if (!fabricRef.current || !selectedObject) return;

    if (selectedObject instanceof Textbox) {
      selectedObject.set('text', newText);
      selectedObject.initDimensions();
      fabricRef.current.renderAll();
      refreshLayersList(fabricRef.current);
      if (liveTextDebounceRef.current) clearTimeout(liveTextDebounceRef.current);
      liveTextDebounceRef.current = setTimeout(() => {
        pushHistorySnapshot();
      }, 350);
      return;
    }

    if ((selectedObject as any).customData?.isComponentSlice) {
      const canvas = fabricRef.current;
      const sliceObj = selectedObject as FabricImage;
      const customData = (sliceObj as any).customData || {};
      const def: ComponentSliceDef | undefined = customData.def;

      const left = sliceObj.left ?? (def ? Math.round(def.x * canvasNaturalSizeRef.current.width) : 0);
      const top = sliceObj.top ?? (def ? Math.round(def.y * canvasNaturalSizeRef.current.height) : 0);
      const width = (sliceObj.width || 100) * (sliceObj.scaleX || 1);
      const naturalW = canvasNaturalSizeRef.current.width || 1080;

      const newTextbox = createCanvaComponent({
        id: (sliceObj as any).customId || `box_${Date.now()}`,
        name: customData.name || 'Komponen Teks',
        left,
        top,
        width,
        text: newText,
        fontSize: def?.fontSize || Math.round(naturalW * 0.012),
        fontFamily: def?.fontFamily || "'Inter', sans-serif",
        fontWeight: def?.fontWeight || 'normal',
        fontStyle: def?.fontStyle || 'normal',
        textAlign: def?.textAlign || 'left',
        textColor: def?.textColor || '#0F172A',
        cardBg: def?.cardBg || '#FFFFFF',
        padding: def?.padding || 8,
      });

      canvas.remove(sliceObj);
      canvas.add(newTextbox);
      canvas.setActiveObject(newTextbox);
      setSelectedObject(newTextbox);
      canvas.renderAll();
      refreshLayersList(canvas);
    }
  };

  // Apply Text Styling Changes
  const applyFontFamily = (font: string) => {
    setFontFamily(font);
    if (selectedObject && selectedObject instanceof Textbox) {
      selectedObject.set('fontFamily', font);
      selectedObject.initDimensions();
      fabricRef.current?.renderAll();
      pushHistorySnapshot();
    }
  };

  const applyFontSize = (size: number) => {
    setFontSize(size);
    if (selectedObject && selectedObject instanceof Textbox) {
      selectedObject.set('fontSize', size);
      selectedObject.initDimensions();
      fabricRef.current?.renderAll();
      pushHistorySnapshot();
    }
  };

  const applyFillColor = (color: string) => {
    setFillColor(color);
    if (selectedObject && selectedObject instanceof Textbox) {
      selectedObject.set('fill', color);
      fabricRef.current?.renderAll();
      pushHistorySnapshot();
    }
  };

  const applyBgColor = (color: string) => {
    setBgColor(color);
    if (selectedObject && selectedObject instanceof Textbox) {
      selectedObject.set('backgroundColor', color);
      fabricRef.current?.renderAll();
      pushHistorySnapshot();
    }
  };

  const toggleBold = () => {
    const next = !isBold;
    setIsBold(next);
    if (selectedObject && selectedObject instanceof Textbox) {
      selectedObject.set('fontWeight', next ? 'bold' : 'normal');
      selectedObject.initDimensions();
      fabricRef.current?.renderAll();
      pushHistorySnapshot();
    }
  };

  const toggleItalic = () => {
    const next = !isItalic;
    setIsItalic(next);
    if (selectedObject && selectedObject instanceof Textbox) {
      selectedObject.set('fontStyle', next ? 'italic' : 'normal');
      selectedObject.initDimensions();
      fabricRef.current?.renderAll();
      pushHistorySnapshot();
    }
  };

  const applyTextAlign = (align: 'left' | 'center' | 'right') => {
    setTextAlign(align);
    if (selectedObject && selectedObject instanceof Textbox) {
      selectedObject.set('textAlign', align);
      fabricRef.current?.renderAll();
      pushHistorySnapshot();
    }
  };

  // ─── 🪄 URAI TEKS MENJADI LAYER INTERAKTIF VIA AI VISION ───
  const handleGrabText = async () => {
    if (!fabricRef.current) return;
    await handleTriggerMagicLayers(true);
    setHasGrabbedText(true);
  };

  // ─── 🖼️ UNGGAH GAMBAR / FOTO KE KANVAS ───
  const handleUploadImageToCanvas = (file: File) => {
    if (!fabricRef.current) return;
    const reader = new FileReader();
    reader.onload = async () => {
      const dataUrl = reader.result as string;
      if (!dataUrl || !fabricRef.current) return;
      try {
        const assetUrl = await uploadEditorAssetToCdn(dataUrl, file.name);
        const img = await FabricImage.fromURL(assetUrl, { crossOrigin: 'anonymous' });
        const { width: canvasW, height: canvasH } = canvasNaturalSizeRef.current;
        const maxW = canvasW * 0.45;
        const maxH = canvasH * 0.45;
        const scale = Math.min(maxW / (img.width || 400), maxH / (img.height || 400), 1);
        img.set({
          left: canvasW / 2 - ((img.width || 400) * scale) / 2,
          top: canvasH / 2 - ((img.height || 400) * scale) / 2,
          scaleX: scale,
          scaleY: scale,
        });
        (img as any).customId = `uploaded_img_${Date.now()}`;
        (img as any).customData = { name: file.name.slice(0, 28) || 'Gambar Unggahan' };
        fabricRef.current.add(img);
        fabricRef.current.setActiveObject(img);
        fabricRef.current.renderAll();
        refreshLayersList(fabricRef.current);
        pushHistorySnapshot(fabricRef.current);
        toast({
          type: 'success',
          title: 'Gambar Ditambahkan ke Kanvas',
          description: 'Anda dapat menggeser, memperbesar, atau mengubah urutan layernya.',
        });
      } catch (err: any) {
        toast({
          type: 'error',
          title: 'Gagal Memuat Gambar',
          description: err?.message || 'Format gambar tidak dapat dibaca.',
        });
      }
    };
    reader.readAsDataURL(file);
  };

  // ─── ADD NEW ELEMENTS ───
  const addTextHeading = () => {
    if (!fabricRef.current) return;
    const txt = new Textbox('JUDUL BARU POSTER', {
      originX: 'left',
      originY: 'top',
      left: canvasNaturalSizeRef.current.width / 2 - 200,
      top: canvasNaturalSizeRef.current.height / 2 - 40,
      width: 400,
      fontSize: 42,
      fontFamily: "'Inter', sans-serif",
      fontWeight: 'bold',
      fill: '#0F172A',
      backgroundColor: '#FFFFFF',
      padding: 6,
      textAlign: 'center',
      shadow: new Shadow({ color: 'rgba(0,0,0,0.15)', blur: 6, offsetX: 0, offsetY: 1 }),
    });
    txt.setCoords();
    (txt as any).customId = `heading_${Date.now()}`;
    (txt as any).customData = { name: 'Judul Baru' };
    fabricRef.current.add(txt);
    fabricRef.current.setActiveObject(txt);
    fabricRef.current.renderAll();
    pushHistorySnapshot(fabricRef.current);
  };

  const addTextBody = () => {
    if (!fabricRef.current) return;
    const txt = new Textbox('Tuliskan poin narasi atau kalimat penjelasan kebijakan Anda di sini.', {
      originX: 'left',
      originY: 'top',
      left: canvasNaturalSizeRef.current.width / 2 - 220,
      top: canvasNaturalSizeRef.current.height / 2,
      width: 440,
      fontSize: 20,
      fontFamily: "'Inter', sans-serif",
      fill: '#1E293B',
      backgroundColor: '#FFFFFF',
      padding: 10,
      shadow: new Shadow({ color: 'rgba(0,0,0,0.12)', blur: 6, offsetX: 0, offsetY: 2 }),
    });
    txt.setCoords();
    (txt as any).customId = `body_${Date.now()}`;
    (txt as any).customData = { name: 'Poin Kalimat' };
    fabricRef.current.add(txt);
    fabricRef.current.setActiveObject(txt);
    fabricRef.current.renderAll();
    pushHistorySnapshot(fabricRef.current);
  };

  const addDimensiCard = () => {
    if (!fabricRef.current) return;
    const txt = new Textbox('TONGGAK BARU: NAMA AGENDA\nTuliskan uraian pencapaian atau kebijakan daerah di sini.', {
      originX: 'left',
      originY: 'top',
      left: canvasNaturalSizeRef.current.width / 2 - 220,
      top: canvasNaturalSizeRef.current.height / 2 - 50,
      width: 440,
      fontSize: 18,
      fontFamily: "'Inter', sans-serif",
      fill: '#1E293B',
      backgroundColor: '#FFFFFF',
      padding: 12,
      shadow: new Shadow({ color: 'rgba(0,0,0,0.15)', blur: 8, offsetX: 0, offsetY: 2 }),
    });
    txt.setCoords();
    (txt as any).customId = `dimensi_${Date.now()}`;
    (txt as any).customData = { name: 'Kartu Tonggak Baru' };
    fabricRef.current.add(txt);
    fabricRef.current.setActiveObject(txt);
    fabricRef.current.renderAll();
    pushHistorySnapshot(fabricRef.current);
  };

  const addBadgeShape = () => {
    if (!fabricRef.current) return;
    const txt = new Textbox('★ TONGGAK 01: PRIORITAS DAERAH ★', {
      originX: 'left',
      originY: 'top',
      left: canvasNaturalSizeRef.current.width / 2 - 180,
      top: canvasNaturalSizeRef.current.height / 2 + 50,
      width: 360,
      fontSize: 16,
      fontFamily: "'Inter', sans-serif",
      fontWeight: 'bold',
      fill: '#FFFFFF',
      backgroundColor: '#EA580C',
      padding: 8,
      textAlign: 'center',
      shadow: new Shadow({ color: 'rgba(0,0,0,0.2)', blur: 6, offsetX: 0, offsetY: 2 }),
    });
    txt.setCoords();
    (txt as any).customId = `badge_${Date.now()}`;
    (txt as any).customData = { name: 'Badge Oranye' };
    fabricRef.current.add(txt);
    fabricRef.current.setActiveObject(txt);
    fabricRef.current.renderAll();
    pushHistorySnapshot(fabricRef.current);
  };

  // Duplicate Object
  const handleDuplicateSelected = () => {
    if (!fabricRef.current || !selectedObject) return;
    selectedObject.clone().then((cloned: FabricObject) => {
      cloned.set({
        left: (cloned.left || 0) + 20,
        top: (cloned.top || 0) + 20,
      });
      const origData = (selectedObject as any).customData || {};
      (cloned as any).customId = `clone_${Date.now()}`;
      (cloned as any).customData = {
        ...origData,
        name: `Salinan ${origData?.name || 'Layer'}`,
      };
      fabricRef.current?.add(cloned);
      if (fabricRef.current) {
        rehydrateMlObjects(fabricRef.current);
      }
      fabricRef.current?.setActiveObject(cloned);
      fabricRef.current?.renderAll();
      pushHistorySnapshot();
    });
  };

  const {
    addBasicShape,
    addSvgPreset,
    applyShapeFill,
    applyShapeStroke,
    applyShapeStrokeWidth,
    applyShapeRadius,
    applyObjectOpacity,
    toggleFlipHorizontal,
    toggleImageCircleMask,
  } = useCanvaShapeActions({
    fabricRef,
    canvasNaturalSizeRef,
    selectedObject,
    refreshLayersList,
    pushHistorySnapshot,
    setSelectedObject,
  });

  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement | null)?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;
      const canvas = fabricRef.current;
      const active = canvas?.getActiveObject();
      if (!canvas || !active) return;
      if (active instanceof Textbox && active.isEditing) return;

      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'd') {
        e.preventDefault();
        handleDuplicateSelected();
        return;
      }
      if (e.key === 'Delete' || e.key === 'Backspace') {
        if (!(active as any).customData?.isBackground) {
          e.preventDefault();
          canvas.remove(active);
          canvas.discardActiveObject();
          canvas.renderAll();
          setSelectedObject(null);
          pushHistorySnapshot(canvas);
        }
        return;
      }
      const step = e.shiftKey ? 10 : 1;
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        active.set('left', (active.left || 0) - step);
        active.setCoords();
        canvas.renderAll();
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        active.set('left', (active.left || 0) + step);
        active.setCoords();
        canvas.renderAll();
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        active.set('top', (active.top || 0) - step);
        active.setCoords();
        canvas.renderAll();
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        active.set('top', (active.top || 0) + step);
        active.setCoords();
        canvas.renderAll();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isOpen, pushHistorySnapshot]);

  // Layer Operations
  const selectLayer = (layer: LayerItem) => {
    const isBgLayer =
      Boolean((layer.object as any)?.customData?.isBackground) || layer.id === 'layer_background';
    if (!fabricRef.current || isBgLayer) return;
    fabricRef.current.setActiveObject(layer.object);
    fabricRef.current.renderAll();
    updateStylePanelFromObject(layer.object);
  };

  const toggleLayerVisibility = (layer: LayerItem, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!fabricRef.current) return;
    layer.object.set('visible', !layer.visible);
    fabricRef.current.renderAll();
    refreshLayersList(fabricRef.current);
    pushHistorySnapshot();
  };

  const toggleLayerLock = (layer: LayerItem, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!fabricRef.current) return;
    const nextLocked = !layer.locked;
    layer.object.set({
      lockMovementX: nextLocked,
      lockMovementY: nextLocked,
      lockRotation: nextLocked,
      lockScalingX: nextLocked,
      lockScalingY: nextLocked,
      hasControls: !nextLocked,
    });
    fabricRef.current.renderAll();
    refreshLayersList(fabricRef.current);
  };

  const moveLayerUp = (layer: LayerItem, e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (!fabricRef.current) return;
    fabricRef.current.bringObjectForward(layer.object);
    fabricRef.current.renderAll();
    refreshLayersList(fabricRef.current);
    pushHistorySnapshot();
  };

  const moveLayerDown = (layer: LayerItem, e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (!fabricRef.current) return;
    fabricRef.current.sendObjectBackwards(layer.object);
    fabricRef.current.renderAll();
    refreshLayersList(fabricRef.current);
    pushHistorySnapshot();
  };

  const moveLayerToFront = () => {
    if (!fabricRef.current || !selectedObject) return;
    fabricRef.current.bringObjectToFront(selectedObject);
    fabricRef.current.renderAll();
    refreshLayersList(fabricRef.current);
    pushHistorySnapshot();
  };

  const moveLayerToBack = () => {
    if (!fabricRef.current || !selectedObject) return;
    fabricRef.current.sendObjectBackwards(selectedObject);
    const bg = fabricRef.current.getObjects().find((o) => (o as any).customData?.isBackground);
    if (bg) fabricRef.current.sendObjectToBack(bg);
    fabricRef.current.renderAll();
    refreshLayersList(fabricRef.current);
    pushHistorySnapshot();
  };

  const deleteSelectedObject = () => {
    if (!fabricRef.current || !selectedObject) return;
    if ((selectedObject as any).customData?.isBackground) {
      toast({ type: 'warning', title: 'Perhatian', description: 'Latar belakang utama tidak dapat dihapus.' });
      return;
    }
    fabricRef.current.remove(selectedObject);
    fabricRef.current.discardActiveObject();
    fabricRef.current.renderAll();
    setSelectedObject(null);
    pushHistorySnapshot();
  };

  // ─── SAVE & APPLY (PIXEL-PERFECT EXPORT) ───
  const handleSaveAndApply = async () => {
    if (!fabricRef.current) return;
    setIsSaving(true);
    try {
      const canvas = fabricRef.current;
      const sliceObjects = canvas.getObjects().filter((o) => (o as any).customData?.isComponentSlice);
      sliceObjects.forEach((o) => o.set('stroke', undefined));
      canvas.discardActiveObject();
      isExportingRef.current = true;
      canvas.renderAll();

      let renderedUrl = '';
      try {
        renderedUrl = canvas.toDataURL({
          format: 'png',
          multiplier: 1.0,
        });
      } finally {
        isExportingRef.current = false;
      }

      // Sertakan seluruh properti serialize (customId, customData, lock, visibility, selectability)
      const layersJson = JSON.stringify((fabricRef.current as any).toObject(SERIALIZED_FABRIC_PROPS));

      let finalUrl = renderedUrl;
      if (publicationId) {
        const saveRes = await ApiClient.request<{
          success: boolean;
          posterUrl: string;
        }>(`/studio/articles/${publicationId}/poster/save-layers`, {
          method: 'POST',
          body: JSON.stringify({
            imageDataUrl: renderedUrl,
            layersJson,
          }),
        });
        if (saveRes?.posterUrl) {
          finalUrl = saveRes.posterUrl;
        }
      }

      onApplyChanges(finalUrl, layersJson);

      toast({
        type: 'success',
        title: 'Desain Berhasil Disimpan',
        description: publicationId
          ? 'Perubahan layer & poster telah tersimpan permanen ke server.'
          : 'Perubahan layer visual berhasil diterapkan pada draf.',
      });

      onClose();
    } catch (err: any) {
      toast({
        type: 'error',
        title: 'Gagal Menyimpan',
        description: err?.message || 'Terjadi kendala saat mengekspor kanvas.',
      });
    } finally {
      setIsSaving(false);
    }
  };

  // ─── DOWNLOAD HIGH-RES HD ───
  const handleDownload = () => {
    if (!fabricRef.current) return;
    try {
      const canvas = fabricRef.current;
      const sliceObjects = canvas.getObjects().filter((o) => (o as any).customData?.isComponentSlice);
      sliceObjects.forEach((o) => o.set('stroke', undefined));
      canvas.discardActiveObject();
      isExportingRef.current = true;
      canvas.renderAll();

      let renderedUrl = '';
      try {
        renderedUrl = canvas.toDataURL({
          format: 'png',
          multiplier: 1.5,
        });
      } finally {
        isExportingRef.current = false;
      }

      const link = document.createElement('a');
      link.download = `polaris-magic-layers-${Date.now()}.png`;
      link.href = renderedUrl;
      link.click();

      toast({
        type: 'success',
        title: 'Unduhan Dimulai',
        description: 'Berkas gambar resolusi tinggi (HD) berhasil diunduh ke komputer Anda.',
      });
    } catch (err: any) {
      toast({
        type: 'error',
        title: 'Gagal Mengunduh',
        description: err?.message || 'Kendala saat mengunduh gambar.',
      });
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-[#F4F5F7] flex flex-col h-screen w-screen overflow-hidden text-slate-800 antialiased font-sans select-none animate-in fade-in duration-200">
      <MagicLayersHeader
        onClose={onClose}
        canvasWidth={canvasNaturalSizeRef.current.width}
        canvasHeight={canvasNaturalSizeRef.current.height}
        canUndo={canUndo}
        canRedo={canRedo}
        onUndo={handleUndo}
        onRedo={handleRedo}
        zoomLevel={zoomLevel}
        onZoomOut={() => setZoomLevel((prev) => Math.max(0.25, Number((prev - 0.15).toFixed(2))))}
        onZoomFit={() => setZoomLevel(1.0)}
        onZoomIn={() => setZoomLevel((prev) => Math.min(3.0, Number((prev + 0.15).toFixed(2))))}
        isDecomposed={isDecomposed}
        isScanning={isScanning}
        onTriggerMagicLayers={handleTriggerMagicLayers}
        onResetToOriginal={handleResetToOriginal}
        onDownload={handleDownload}
        onSaveAndApply={handleSaveAndApply}
      />

      <MagicLayersFormattingBar
        selectedObject={selectedObject}
        currentTextContent={currentTextContent}
        onLiveTextChange={handleLiveTextChange}
        fontFamily={fontFamily}
        onApplyFontFamily={applyFontFamily}
        fontSize={fontSize}
        onApplyFontSize={applyFontSize}
        isBold={isBold}
        onToggleBold={toggleBold}
        isItalic={isItalic}
        onToggleItalic={toggleItalic}
        textAlign={textAlign}
        onApplyTextAlign={applyTextAlign}
        fillColor={fillColor}
        onApplyFillColor={applyFillColor}
        bgColor={bgColor}
        onApplyBgColor={applyBgColor}
        onMoveLayerToFront={moveLayerToFront}
        onMoveLayerToBack={moveLayerToBack}
        onDuplicateSelected={handleDuplicateSelected}
        onDeleteSelectedObject={deleteSelectedObject}
        onApplyShapeFill={applyShapeFill}
        onApplyShapeStroke={applyShapeStroke}
        onApplyShapeStrokeWidth={applyShapeStrokeWidth}
        onApplyShapeRadius={applyShapeRadius}
        onApplyObjectOpacity={applyObjectOpacity}
        onToggleFlipHorizontal={toggleFlipHorizontal}
        onToggleImageCircleMask={toggleImageCircleMask}
        isCuttingOut={isCuttingOut}
      />

      <div className="flex-1 min-h-0 flex overflow-hidden">
        <MagicLayersSidebar
          activeTab={activeTab}
          onChangeTab={setActiveTab}
          layers={layers}
          selectedLayerId={selectedLayerId}
          onSelectLayer={selectLayer}
          onMoveLayerUp={moveLayerUp}
          onMoveLayerDown={moveLayerDown}
          onToggleLayerLock={toggleLayerLock}
          onToggleLayerVisibility={toggleLayerVisibility}
          selectedObject={selectedObject}
          currentTextContent={currentTextContent}
          onLiveTextChange={handleLiveTextChange}
          onAddTextHeading={addTextHeading}
          onAddTextBody={addTextBody}
          onAddDimensiCard={addDimensiCard}
          onAddBadgeShape={addBadgeShape}
          onAddBasicShape={addBasicShape}
          onAddSvgPreset={addSvgPreset}
          onUploadImage={handleUploadImageToCanvas}
          onMagicCutout={handleMagicCutout}
          isCuttingOut={isCuttingOut}
          cutoutSuccess={cutoutSuccess}
          onGrabText={handleGrabText}
          hasGrabbedText={hasGrabbedText}
        />

        <MagicLayersCanvasStage
          workspaceRef={workspaceRef}
          canvasElRef={canvasElRef}
          isLoading={isLoading}
          displayDimensions={displayDimensions}
          isScanning={isScanning}
          pipelineStep={pipelineStep}
          pipelineStatusText={pipelineStatusText}
        />
      </div>

      <style>{`
        @keyframes magicScannerSweep {
          0% {
            left: -35%;
            opacity: 0;
          }
          15% {
            opacity: 1;
          }
          85% {
            opacity: 1;
          }
          100% {
            left: 120%;
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
}
