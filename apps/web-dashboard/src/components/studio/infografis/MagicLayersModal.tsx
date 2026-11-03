'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import {
  Canvas as FabricCanvas,
  FabricImage,
  Textbox,
  Rect,
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
  X,
  Bold,
  Italic,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Plus,
  Loader2,
  Check,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/toast';

interface MagicLayersModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageUrl: string;
  initialTitle?: string;
  initialAuthor?: string;
  aspectRatio?: string;
  savedLayersJson?: string;
  onApplyChanges: (renderedImageUrl: string, layersJson: string) => void;
}

interface LayerItem {
  id: string;
  name: string;
  type: string;
  visible: boolean;
  locked: boolean;
  object: FabricObject;
}

const PRESET_COLORS = [
  '#FFFFFF',
  '#0F172A',
  '#F97316',
  '#D97706',
  '#059669',
  '#2563EB',
  '#DC2626',
  '#7C3AED',
  '#E2E8F0',
];

const PRESET_FONTS = [
  { label: 'Sans Default', value: 'system-ui, sans-serif' },
  { label: 'Bebas Neue (Poster)', value: "'Bebas Neue', sans-serif" },
  { label: 'Playfair Display (Serif)', value: "'Playfair Display', serif" },
  { label: 'Inter / Modern', value: "'Inter', sans-serif" },
  { label: 'Monospace', value: 'monospace' },
];

export function MagicLayersModal({
  isOpen,
  onClose,
  imageUrl,
  initialTitle = '',
  initialAuthor = '',
  aspectRatio = '4:5',
  savedLayersJson,
  onApplyChanges,
}: MagicLayersModalProps) {
  const { toast } = useToast();
  const canvasElRef = useRef<HTMLCanvasElement | null>(null);
  const fabricRef = useRef<FabricCanvas | null>(null);

  const [layers, setLayers] = useState<LayerItem[]>([]);
  const [selectedLayerId, setSelectedLayerId] = useState<string | null>(null);
  const [selectedObject, setSelectedObject] = useState<FabricObject | null>(null);

  const [isLoading, setIsLoading] = useState(true);
  const [isCuttingOut, setIsCuttingOut] = useState(false);
  const [cutoutSuccess, setCutoutSuccess] = useState(false);

  // Text Styling State
  const [fontFamily, setFontFamily] = useState('system-ui, sans-serif');
  const [fontSize, setFontSize] = useState(36);
  const [fillColor, setFillColor] = useState('#FFFFFF');
  const [isBold, setIsBold] = useState(false);
  const [isItalic, setIsItalic] = useState(false);
  const [textAlign, setTextAlign] = useState<'left' | 'center' | 'right'>('left');

  // Compute base canvas dimensions
  const getCanvasDimensions = () => {
    switch (aspectRatio) {
      case '1:1':
        return { width: 1080, height: 1080 };
      case '9:16':
        return { width: 1080, height: 1920 };
      case '16:9':
        return { width: 1920, height: 1080 };
      case '4:3':
        return { width: 1440, height: 1080 };
      case '3:4':
        return { width: 1080, height: 1440 };
      case '4:5':
      default:
        return { width: 1080, height: 1350 };
    }
  };

  const { width: nativeWidth, height: nativeHeight } = getCanvasDimensions();

  // Helper to refresh layer list from Fabric canvas
  const refreshLayersList = useCallback((canvas: FabricCanvas) => {
    const objects = canvas.getObjects();
    // Reverse objects so the top visual layer appears at the top of the UI list
    const mapped: LayerItem[] = [...objects].reverse().map((obj, revIdx) => {
      const idx = objects.indexOf(obj);
      const customData = (obj as any).customData || {};
      let name = customData.name;
      if (!name) {
        if (obj instanceof Textbox) {
          name = `Teks: "${obj.text?.slice(0, 20) || 'Kosong'}..."`;
        } else if (obj instanceof FabricImage) {
          name = customData.isCutout ? '✨ Objek Depan (Cutout)' : 'Latar Belakang';
        } else if (obj instanceof Rect) {
          name = 'Bentuk Kotak / Lencana';
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
  }, []);

  // Update styling panel when active object changes
  const updateStylePanelFromObject = (obj: FabricObject | null) => {
    setSelectedObject(obj);
    if (!obj) {
      setSelectedLayerId(null);
      return;
    }

    setSelectedLayerId((obj as any).customId || null);

    if (obj instanceof Textbox) {
      setFontFamily(obj.fontFamily || 'system-ui, sans-serif');
      setFontSize(obj.fontSize || 36);
      setFillColor(typeof obj.fill === 'string' ? obj.fill : '#FFFFFF');
      setIsBold(obj.fontWeight === 'bold' || (typeof obj.fontWeight === 'number' && obj.fontWeight >= 700));
      setIsItalic(obj.fontStyle === 'italic');
      setTextAlign((obj.textAlign as any) || 'left');
    }
  };

  // Initialize Fabric Canvas
  useEffect(() => {
    if (!isOpen || !canvasElRef.current) return;

    setIsLoading(true);
    let isMounted = true;

    // Dispose previous instance if any
    if (fabricRef.current) {
      fabricRef.current.dispose();
      fabricRef.current = null;
    }

    const canvas = new FabricCanvas(canvasElRef.current, {
      width: nativeWidth,
      height: nativeHeight,
      backgroundColor: '#0F172A',
      preserveObjectStacking: true,
      selection: true,
    });

    fabricRef.current = canvas;

    // Event listeners
    canvas.on('selection:created', (e) => updateStylePanelFromObject(e.selected?.[0] || null));
    canvas.on('selection:updated', (e) => updateStylePanelFromObject(e.selected?.[0] || null));
    canvas.on('selection:cleared', () => updateStylePanelFromObject(null));
    canvas.on('object:modified', () => refreshLayersList(canvas));
    canvas.on('object:added', () => refreshLayersList(canvas));
    canvas.on('object:removed', () => refreshLayersList(canvas));

    const initCanvasContent = async () => {
      try {
        if (savedLayersJson) {
          // Restore saved session
          await canvas.loadFromJSON(savedLayersJson);
          canvas.renderAll();
          if (isMounted) {
            refreshLayersList(canvas);
            setIsLoading(false);
          }
          return;
        }

        // Fresh initialization: Load base background image
        const bgImg = await FabricImage.fromURL(imageUrl, { crossOrigin: 'anonymous' });
        
        // Scale background image to fit canvas exactly
        const scaleX = nativeWidth / (bgImg.width || 1);
        const scaleY = nativeHeight / (bgImg.height || 1);

        bgImg.set({
          left: 0,
          top: 0,
          scaleX,
          scaleY,
          selectable: false,
          evented: false,
        });

        (bgImg as any).customId = 'layer_background';
        (bgImg as any).customData = { name: '🖼️ Latar Belakang (Base Art)', isBackground: true };

        canvas.add(bgImg);
        canvas.sendObjectToBack(bgImg);

        // Add Headline Textbox
        if (initialTitle) {
          const headline = new Textbox(initialTitle, {
            left: 80,
            top: 100,
            width: nativeWidth - 160,
            fontSize: 48,
            fontFamily: "'Bebas Neue', sans-serif",
            fontWeight: 'bold',
            fill: '#FFFFFF',
            shadow: new Shadow({ color: 'rgba(0,0,0,0.8)', blur: 12, offsetX: 0, offsetY: 3 }),
            editable: true,
          });
          (headline as any).customId = 'layer_headline';
          (headline as any).customData = { name: '📝 Judul Utama (Headline)' };
          canvas.add(headline);
        }

        // Add Attribution / Signature Layer
        if (initialAuthor) {
          const authorBadge = new Textbox(initialAuthor, {
            left: 80,
            top: nativeHeight - 90,
            width: nativeWidth - 160,
            fontSize: 22,
            fontFamily: "'Inter', sans-serif",
            fontWeight: 'bold',
            fill: '#F1F5F9',
            shadow: new Shadow({ color: 'rgba(0,0,0,0.7)', blur: 8, offsetX: 0, offsetY: 2 }),
            editable: true,
          });
          (authorBadge as any).customId = 'layer_author';
          (authorBadge as any).customData = { name: '👤 Atribusi / Tanda Tangan' };
          canvas.add(authorBadge);
        }

        canvas.renderAll();
        if (isMounted) {
          refreshLayersList(canvas);
          setIsLoading(false);
        }
      } catch (err: any) {
        console.error('Error initializing Magic Layers canvas:', err);
        if (isMounted) {
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
      isMounted = false;
      canvas.dispose();
      fabricRef.current = null;
    };
  }, [isOpen, imageUrl, nativeWidth, nativeHeight, savedLayersJson, initialTitle, initialAuthor, refreshLayersList, toast]);

  // Apply Text Styling Changes
  const applyFontFamily = (font: string) => {
    setFontFamily(font);
    if (selectedObject && selectedObject instanceof Textbox) {
      selectedObject.set('fontFamily', font);
      fabricRef.current?.renderAll();
    }
  };

  const applyFontSize = (size: number) => {
    setFontSize(size);
    if (selectedObject && selectedObject instanceof Textbox) {
      selectedObject.set('fontSize', size);
      fabricRef.current?.renderAll();
    }
  };

  const applyFillColor = (color: string) => {
    setFillColor(color);
    if (selectedObject) {
      selectedObject.set('fill', color);
      fabricRef.current?.renderAll();
    }
  };

  const toggleBold = () => {
    const next = !isBold;
    setIsBold(next);
    if (selectedObject && selectedObject instanceof Textbox) {
      selectedObject.set('fontWeight', next ? 'bold' : 'normal');
      fabricRef.current?.renderAll();
    }
  };

  const toggleItalic = () => {
    const next = !isItalic;
    setIsItalic(next);
    if (selectedObject && selectedObject instanceof Textbox) {
      selectedObject.set('fontStyle', next ? 'italic' : 'normal');
      fabricRef.current?.renderAll();
    }
  };

  const applyTextAlign = (align: 'left' | 'center' | 'right') => {
    setTextAlign(align);
    if (selectedObject && selectedObject instanceof Textbox) {
      selectedObject.set('textAlign', align);
      fabricRef.current?.renderAll();
    }
  };

  // Add Elements
  const addTextHeading = () => {
    if (!fabricRef.current) return;
    const text = new Textbox('JUDUL BARU', {
      left: 100,
      top: 200,
      width: 600,
      fontSize: 44,
      fontFamily: "'Bebas Neue', sans-serif",
      fontWeight: 'bold',
      fill: '#FFFFFF',
      shadow: new Shadow({ color: 'rgba(0,0,0,0.8)', blur: 10, offsetX: 0, offsetY: 3 }),
    });
    (text as any).customId = `text_${Date.now()}`;
    (text as any).customData = { name: '📝 Teks Judul' };
    fabricRef.current.add(text);
    fabricRef.current.setActiveObject(text);
    fabricRef.current.renderAll();
  };

  const addTextBody = () => {
    if (!fabricRef.current) return;
    const text = new Textbox('Tuliskan butir poin penjelasan atau keterangan data di sini...', {
      left: 100,
      top: 300,
      width: 500,
      fontSize: 24,
      fontFamily: "'Inter', sans-serif",
      fontWeight: 'normal',
      fill: '#F8FAFC',
      lineHeight: 1.3,
      shadow: new Shadow({ color: 'rgba(0,0,0,0.8)', blur: 6, offsetX: 0, offsetY: 2 }),
    });
    (text as any).customId = `text_${Date.now()}`;
    (text as any).customData = { name: '📄 Teks Poin / Keterangan' };
    fabricRef.current.add(text);
    fabricRef.current.setActiveObject(text);
    fabricRef.current.renderAll();
  };

  const addBadgeShape = () => {
    if (!fabricRef.current) return;
    const rect = new Rect({
      left: 100,
      top: 150,
      width: 260,
      height: 48,
      fill: '#D97706',
      rx: 6,
      ry: 6,
      shadow: new Shadow({ color: 'rgba(0,0,0,0.4)', blur: 8, offsetX: 0, offsetY: 3 }),
    });
    (rect as any).customId = `shape_${Date.now()}`;
    (rect as any).customData = { name: '🏷️ Pita Lencana (Badge)' };
    fabricRef.current.add(rect);
    fabricRef.current.setActiveObject(rect);
    fabricRef.current.renderAll();
  };

  // Layer Operations
  const selectLayer = (layer: LayerItem) => {
    if (!fabricRef.current) return;
    fabricRef.current.setActiveObject(layer.object);
    fabricRef.current.renderAll();
  };

  const toggleLayerVisibility = (layer: LayerItem, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!fabricRef.current) return;
    layer.object.set('visible', !layer.visible);
    fabricRef.current.renderAll();
    refreshLayersList(fabricRef.current);
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

  const moveLayerUp = (layer: LayerItem, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!fabricRef.current) return;
    fabricRef.current.bringObjectForward(layer.object);
    fabricRef.current.renderAll();
    refreshLayersList(fabricRef.current);
  };

  const moveLayerDown = (layer: LayerItem, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!fabricRef.current) return;
    fabricRef.current.sendObjectBackwards(layer.object);
    fabricRef.current.renderAll();
    refreshLayersList(fabricRef.current);
  };

  const deleteSelectedObject = () => {
    if (!fabricRef.current || !selectedObject) return;
    if ((selectedObject as any).customData?.isBackground) {
      toast({ type: 'warning', title: 'Perhatian', description: 'Layer latar belakang utama tidak dapat dihapus.' });
      return;
    }
    fabricRef.current.remove(selectedObject);
    fabricRef.current.discardActiveObject();
    fabricRef.current.renderAll();
    setSelectedObject(null);
  };

  // Magic Cutout: Extract subject using @imgly/background-removal
  const handleMagicCutout = async () => {
    if (!fabricRef.current || isCuttingOut) return;
    setIsCuttingOut(true);
    setCutoutSuccess(false);

    try {
      toast({
        type: 'info',
        title: 'Memproses Magic Layers...',
        description: 'Mengekstrak subjek objek menjadi layer terpisah. Harap tunggu sebentar.',
      });

      // Dynamic import
      const { removeBackground } = await import('@imgly/background-removal');
      const blob = await removeBackground(imageUrl);
      const cutoutUrl = URL.createObjectURL(blob);

      const cutoutImg = await FabricImage.fromURL(cutoutUrl, { crossOrigin: 'anonymous' });

      const scaleX = nativeWidth / (cutoutImg.width || 1);
      const scaleY = nativeHeight / (cutoutImg.height || 1);

      cutoutImg.set({
        left: 0,
        top: 0,
        scaleX,
        scaleY,
        selectable: true,
      });

      (cutoutImg as any).customId = `cutout_${Date.now()}`;
      (cutoutImg as any).customData = { name: '✨ Objek Depan (Magic Cutout)', isCutout: true };

      fabricRef.current.add(cutoutImg);
      fabricRef.current.bringObjectToFront(cutoutImg);
      fabricRef.current.setActiveObject(cutoutImg);
      fabricRef.current.renderAll();

      refreshLayersList(fabricRef.current);
      setCutoutSuccess(true);

      toast({
        type: 'success',
        title: 'Magic Cutout Berhasil!',
        description: 'Subjek berhasil dipisahkan! Anda kini dapat menempatkan teks di belakang subjek dengan menurunkan layer teks.',
      });
    } catch (err: any) {
      console.error('Magic Cutout error:', err);
      toast({
        type: 'error',
        title: 'Magic Cutout Belum Berhasil',
        description: err?.message || 'Browser tidak mendukung pemrosesan AI lokal atau berkas tidak dapat dipotong.',
      });
    } finally {
      setIsCuttingOut(false);
    }
  };

  // Save & Apply Changes
  const handleSaveAndApply = () => {
    if (!fabricRef.current) return;
    try {
      // Deselect any active handles for clean export
      fabricRef.current.discardActiveObject();
      fabricRef.current.renderAll();

      // Render high-res PNG
      const renderedUrl = fabricRef.current.toDataURL({
        format: 'png',
        multiplier: 1.25,
      });

      const layersJson = JSON.stringify(fabricRef.current.toJSON());
      onApplyChanges(renderedUrl, layersJson);

      toast({
        type: 'success',
        title: 'Desain Berhasil Disimpan',
        description: 'Perubahan layer berhasil diterapkan ke infografis Anda.',
      });

      onClose();
    } catch (err: any) {
      toast({
        type: 'error',
        title: 'Gagal Menyimpan',
        description: err?.message || 'Terjadi kendala saat mengekspor kanvas.',
      });
    }
  };

  // Download High-Res
  const handleDownload = () => {
    if (!fabricRef.current) return;
    try {
      fabricRef.current.discardActiveObject();
      fabricRef.current.renderAll();

      const renderedUrl = fabricRef.current.toDataURL({
        format: 'png',
        multiplier: 2.0, // Crisp 2x export
      });

      const link = document.createElement('a');
      link.download = `polaris-magic-layers-${Date.now()}.png`;
      link.href = renderedUrl;
      link.click();

      toast({
        type: 'success',
        title: 'Unduhan Dimulai',
        description: 'Berkas gambar resolusi tinggi (HD) berhasil diunduh.',
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-2 sm:p-4 animate-in fade-in duration-200">
      <div className="flex flex-col w-full h-[95vh] max-w-7xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden">
        
        {/* ─── MODAL HEADER ─── */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-slate-800 bg-slate-950/80">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-tr from-purple-600 via-indigo-600 to-blue-600 flex items-center justify-center shadow-md">
              <Layers className="h-4 w-4 text-white" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-extrabold text-white flex items-center gap-2">
                <span>Magic Layers Studio</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-purple-950/70 text-purple-300 border border-purple-800/60 uppercase">
                  Canva AI Style
                </span>
              </h2>
              <p className="text-[11px] text-slate-400">
                Geser, susun z-index, atau pisahkan objek dari latar untuk menempatkan teks di belakangnya
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* MAGIC CUTOUT BUTTON */}
            <Button
              size="sm"
              onClick={handleMagicCutout}
              disabled={isCuttingOut}
              className={`text-xs font-bold gap-1.5 shadow-sm transition-all ${
                cutoutSuccess
                  ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                  : 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white'
              }`}
            >
              {isCuttingOut ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : cutoutSuccess ? (
                <Check className="h-3.5 w-3.5 text-emerald-200" />
              ) : (
                <Wand2 className="h-3.5 w-3.5 text-purple-200" />
              )}
              <span>{isCuttingOut ? 'Mengekstrak Objek AI...' : cutoutSuccess ? 'Objek Terpisah!' : '🪄 Pisahkan Objek Depan'}</span>
            </Button>

            {/* DOWNLOAD HD BUTTON */}
            <Button
              size="sm"
              variant="outline"
              onClick={handleDownload}
              className="text-xs font-bold gap-1.5 border-slate-700 text-slate-200 hover:bg-slate-800"
            >
              <Download className="h-3.5 w-3.5 text-blue-400" />
              <span>Unduh HD</span>
            </Button>

            {/* SAVE & APPLY BUTTON */}
            <Button
              size="sm"
              onClick={handleSaveAndApply}
              className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold gap-1.5 shadow-sm"
            >
              <Save className="h-3.5 w-3.5" />
              <span>Terapkan Desain</span>
            </Button>

            {/* CLOSE BUTTON */}
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors ml-1"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* ─── TOP TOOLBAR: ADD ELEMENTS & ACTIVE OBJECT PROPS ─── */}
        <div className="flex items-center justify-between px-5 py-2.5 bg-slate-900 border-b border-slate-800/80 gap-3 overflow-x-auto">
          {/* ADD ELEMENT BUTTONS */}
          <div className="flex items-center gap-1.5 shrink-0">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mr-1">Tambah:</span>
            <button
              onClick={addTextHeading}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-white transition-colors"
            >
              <Type className="h-3.5 w-3.5 text-blue-400" />
              <span>+ Judul</span>
            </button>
            <button
              onClick={addTextBody}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-white transition-colors"
            >
              <Type className="h-3.5 w-3.5 text-amber-400" />
              <span>+ Poin Teks</span>
            </button>
            <button
              onClick={addBadgeShape}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-white transition-colors"
            >
              <Square className="h-3.5 w-3.5 text-emerald-400" />
              <span>+ Lencana</span>
            </button>
          </div>

          {/* ACTIVE OBJECT CONTROLS */}
          {selectedObject ? (
            <div className="flex items-center gap-2 shrink-0 animate-in fade-in duration-150">
              <span className="text-[11px] font-bold text-purple-400 uppercase tracking-wider">Format:</span>

              {/* FONT SELECT (IF TEXT) */}
              {selectedObject instanceof Textbox && (
                <>
                  <select
                    value={fontFamily}
                    onChange={(e) => applyFontFamily(e.target.value)}
                    className="bg-slate-800 border border-slate-700 text-white text-xs rounded-lg px-2 py-1 outline-hidden"
                  >
                    {PRESET_FONTS.map((f) => (
                      <option key={f.value} value={f.value}>
                        {f.label}
                      </option>
                    ))}
                  </select>

                  {/* FONT SIZE CONTROLS */}
                  <div className="flex items-center gap-1 bg-slate-800 px-1.5 py-0.5 rounded-lg border border-slate-700">
                    <button
                      onClick={() => applyFontSize(Math.max(12, fontSize - 4))}
                      className="px-1.5 text-xs text-slate-300 hover:text-white font-bold"
                    >
                      -
                    </button>
                    <span className="text-xs font-mono font-bold text-white px-1">{fontSize}</span>
                    <button
                      onClick={() => applyFontSize(fontSize + 4)}
                      className="px-1.5 text-xs text-slate-300 hover:text-white font-bold"
                    >
                      +
                    </button>
                  </div>

                  {/* BOLD & ITALIC */}
                  <div className="flex items-center gap-0.5 bg-slate-800 p-0.5 rounded-lg border border-slate-700">
                    <button
                      onClick={toggleBold}
                      className={`p-1 rounded ${isBold ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'}`}
                      title="Tebal"
                    >
                      <Bold className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={toggleItalic}
                      className={`p-1 rounded ${isItalic ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'}`}
                      title="Miring"
                    >
                      <Italic className="h-3.5 w-3.5" />
                    </button>
                  </div>

                  {/* ALIGNMENT */}
                  <div className="flex items-center gap-0.5 bg-slate-800 p-0.5 rounded-lg border border-slate-700">
                    <button
                      onClick={() => applyTextAlign('left')}
                      className={`p-1 rounded ${textAlign === 'left' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'}`}
                      title="Rata Kiri"
                    >
                      <AlignLeft className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => applyTextAlign('center')}
                      className={`p-1 rounded ${textAlign === 'center' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'}`}
                      title="Rata Tengah"
                    >
                      <AlignCenter className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => applyTextAlign('right')}
                      className={`p-1 rounded ${textAlign === 'right' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'}`}
                      title="Rata Kanan"
                    >
                      <AlignRight className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </>
              )}

              {/* COLOR SWATCHES */}
              <div className="flex items-center gap-1 bg-slate-800 px-2 py-1 rounded-lg border border-slate-700">
                {PRESET_COLORS.map((col) => (
                  <button
                    key={col}
                    onClick={() => applyFillColor(col)}
                    className="h-4 w-4 rounded-full border border-slate-600 transition-transform hover:scale-125"
                    style={{ backgroundColor: col }}
                    title={col}
                  />
                ))}
              </div>

              {/* DELETE OBJECT */}
              <button
                onClick={deleteSelectedObject}
                className="p-1.5 rounded-lg bg-red-950/60 hover:bg-red-900 border border-red-800 text-red-300 hover:text-white transition-colors"
                title="Hapus elemen ini"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          ) : (
            <div className="text-[11px] text-slate-500 italic">
              Klik salah satu elemen di kanvas untuk mengedit ukuran, font, atau warna
            </div>
          )}
        </div>

        {/* ─── MAIN WORKSPACE (CANVAS + LAYER PANEL) ─── */}
        <div className="flex-1 flex overflow-hidden">
          
          {/* CENTER CANVAS AREA */}
          <div className="flex-1 flex items-center justify-center p-4 bg-slate-950 overflow-auto relative">
            {isLoading && (
              <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-slate-950/80 backdrop-blur-xs gap-3">
                <Loader2 className="h-8 w-8 text-blue-500 animate-spin" />
                <span className="text-xs font-bold text-slate-300">Menyiapkan Kanvas Lapisan...</span>
              </div>
            )}

            <div
              className="relative shadow-2xl rounded-lg overflow-hidden border border-slate-800"
              style={{
                maxHeight: '100%',
                maxWidth: '100%',
                aspectRatio: `${nativeWidth}/${nativeHeight}`,
              }}
            >
              <canvas ref={canvasElRef} />
            </div>
          </div>

          {/* RIGHT SIDEBAR: LAYERS MANAGER */}
          <div className="w-72 bg-slate-900 border-l border-slate-800 flex flex-col shrink-0">
            <div className="px-4 py-3 border-b border-slate-800 flex items-center justify-between bg-slate-950/40">
              <span className="text-xs font-black uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                <Layers className="h-3.5 w-3.5 text-blue-400" />
                <span>Susunan Lapisan ({layers.length})</span>
              </span>
              <span className="text-[10px] text-slate-500">Z-Index (Atas ➔ Bawah)</span>
            </div>

            {/* LAYER LIST */}
            <div className="flex-1 overflow-y-auto p-2 space-y-1">
              {layers.map((layer, index) => {
                const isSelected = selectedLayerId === layer.id;
                const isBg = (layer.object as any).customData?.isBackground;
                const isCutout = (layer.object as any).customData?.isCutout;

                return (
                  <div
                    key={layer.id}
                    onClick={() => selectLayer(layer)}
                    className={`flex items-center justify-between p-2 rounded-xl text-xs transition-all cursor-pointer border ${
                      isSelected
                        ? 'bg-blue-600/20 border-blue-500/60 text-white font-bold'
                        : isCutout
                        ? 'bg-purple-950/30 border-purple-800/40 text-purple-200'
                        : isBg
                        ? 'bg-slate-950/40 border-slate-800/60 text-slate-400'
                        : 'bg-slate-800/50 hover:bg-slate-800 border-slate-700/50 text-slate-200'
                    }`}
                  >
                    <div className="flex items-center gap-2 overflow-hidden mr-2">
                      {isCutout ? (
                        <Sparkles className="h-3.5 w-3.5 text-purple-400 shrink-0" />
                      ) : layer.object instanceof Textbox ? (
                        <Type className="h-3.5 w-3.5 text-blue-400 shrink-0" />
                      ) : layer.object instanceof FabricImage ? (
                        <ImageIcon className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                      ) : (
                        <Square className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                      )}
                      <span className="truncate text-[11px]">{layer.name}</span>
                    </div>

                    {/* LAYER ACTION BUTTONS */}
                    <div className="flex items-center gap-1 shrink-0">
                      {/* MOVE UP */}
                      <button
                        onClick={(e) => moveLayerUp(layer, e)}
                        disabled={index === 0 || isBg}
                        className="p-1 rounded text-slate-400 hover:text-white disabled:opacity-30 disabled:hover:text-slate-400"
                        title="Naikkan Layer (Bawa ke Depan)"
                      >
                        <ArrowUp className="h-3 w-3" />
                      </button>

                      {/* MOVE DOWN */}
                      <button
                        onClick={(e) => moveLayerDown(layer, e)}
                        disabled={index === layers.length - 1 || isBg}
                        className="p-1 rounded text-slate-400 hover:text-white disabled:opacity-30 disabled:hover:text-slate-400"
                        title="Turunkan Layer (Kirim ke Belakang)"
                      >
                        <ArrowDown className="h-3 w-3" />
                      </button>

                      {/* LOCK */}
                      <button
                        onClick={(e) => toggleLayerLock(layer, e)}
                        className={`p-1 rounded ${layer.locked ? 'text-amber-400' : 'text-slate-400 hover:text-white'}`}
                        title={layer.locked ? 'Kunci Dibuka' : 'Kunci Posisi'}
                      >
                        {layer.locked ? <Lock className="h-3 w-3" /> : <Unlock className="h-3 w-3" />}
                      </button>

                      {/* VISIBILITY */}
                      <button
                        onClick={(e) => toggleLayerVisibility(layer, e)}
                        className={`p-1 rounded ${layer.visible ? 'text-slate-400 hover:text-white' : 'text-slate-600'}`}
                        title={layer.visible ? 'Sembunyikan' : 'Tampilkan'}
                      >
                        {layer.visible ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* QUICK GUIDE HELPER */}
            <div className="p-3 border-t border-slate-800 bg-slate-950/60 text-[11px] text-slate-400 space-y-1.5">
              <span className="font-bold text-slate-300 block">💡 Tips Efek Magic Layers:</span>
              <p>
                1. Klik tombol <strong>"🪄 Pisahkan Objek Depan"</strong> di kanan atas.
              </p>
              <p>
                2. Pilih layer teks Anda, lalu klik tombol panah <strong>⬇️ Turunkan</strong> di samping layer tersebut.
              </p>
              <p className="text-purple-300 font-medium">
                ➔ Teks akan otomatis berada di belakang figur/objek utama kanvas!
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
