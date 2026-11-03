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
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/toast';

interface MagicLayersModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageUrl: string;
  initialTitle?: string;
  initialAuthor?: string;
  initialSubtitle?: string;
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
  '#E11D48',
  '#2563EB',
  '#059669',
  '#7C3AED',
  '#D97706',
  '#64748B',
];

const PRESET_BG_COLORS = [
  { label: 'Transparan', value: 'transparent' },
  { label: 'Kartu Gelap (85%)', value: 'rgba(15, 23, 42, 0.85)' },
  { label: 'Kartu Putih (95%)', value: 'rgba(255, 255, 255, 0.95)' },
  { label: 'Biru Navy', value: 'rgba(30, 58, 138, 0.90)' },
  { label: 'Emerald Hijau', value: 'rgba(6, 78, 59, 0.90)' },
  { label: 'Merah Bata', value: 'rgba(159, 18, 57, 0.90)' },
  { label: 'Oranye Terang', value: 'rgba(194, 65, 12, 0.90)' },
  { label: 'Ungu Canva', value: 'rgba(109, 40, 217, 0.90)' },
];

const PRESET_FONTS = [
  { label: 'Bebas Neue (Poster Bold)', value: "'Bebas Neue', sans-serif" },
  { label: 'Inter / Modern Sans', value: "'Inter', sans-serif" },
  { label: 'Montserrat (Geometris)', value: "'Montserrat', sans-serif" },
  { label: 'Playfair Display (Serif)', value: "'Playfair Display', serif" },
  { label: 'Plus Jakarta Sans', value: "'Plus Jakarta Sans', sans-serif" },
  { label: 'System Default', value: 'system-ui, sans-serif' },
  { label: 'Monospace', value: 'monospace' },
];

/**
 * Normalisasi URL untuk mengatasi batasan CORS antarlocalhost (3000 vs 4000).
 * Jika URL mengarah ke /uploads/ di backend server mana pun, kita alihkan ke same-origin /uploads/... via Next.js rewrite.
 */
function resolveSafeImageUrl(url: string): string {
  if (!url) return '';
  const uploadsIdx = url.indexOf('/uploads/');
  if (uploadsIdx !== -1 && (url.startsWith('http://') || url.startsWith('https://'))) {
    return url.substring(uploadsIdx);
  }
  return url;
}

/**
 * Pemuat gambar Fabric.js yang kebal terhadap error CORS.
 * Menggunakan strategi bertingkat: blob lokal -> same-origin rewrite -> anonymous -> fallback.
 */
async function loadResilientFabricImage(url: string): Promise<FabricImage> {
  const safeUrl = resolveSafeImageUrl(url);

  // Strategi 1: Jika sudah berupa blob lokal atau data URI
  if (safeUrl.startsWith('blob:') || safeUrl.startsWith('data:')) {
    return await FabricImage.fromURL(safeUrl);
  }

  // Strategi 2: Fetch sebagai blob lokal (100% same-origin, mencegah error CORS)
  try {
    const res = await fetch(safeUrl);
    if (res.ok) {
      const blob = await res.blob();
      const localBlobUrl = URL.createObjectURL(blob);
      return await FabricImage.fromURL(localBlobUrl);
    }
  } catch (err) {
    console.warn('[MagicLayers] Fetch blob lokal gagal, mencoba direct loader:', err);
  }

  // Strategi 3: Coba muat dengan same-origin rewrite / direct dengan crossOrigin
  try {
    return await FabricImage.fromURL(safeUrl, { crossOrigin: 'anonymous' });
  } catch (err) {
    console.warn('[MagicLayers] crossOrigin anonymous gagal, mencoba fallback standar:', err);
  }

  // Strategi 4: Tanpa crossOrigin
  try {
    return await FabricImage.fromURL(safeUrl);
  } catch {
    // Strategi 5: Menggunakan URL asli
    return await FabricImage.fromURL(url);
  }
}

export function MagicLayersModal({
  isOpen,
  onClose,
  imageUrl,
  initialTitle = '',
  initialAuthor = '',
  initialSubtitle = '',
  aspectRatio = '4:5',
  savedLayersJson,
  onApplyChanges,
}: MagicLayersModalProps) {
  const { toast } = useToast();
  const canvasElRef = useRef<HTMLCanvasElement | null>(null);
  const fabricRef = useRef<FabricCanvas | null>(null);
  const workspaceRef = useRef<HTMLDivElement | null>(null);

  // Studio UI Navigation State
  const [activeTab, setActiveTab] = useState<'text' | 'elements' | 'layers' | 'magic'>('layers');
  const [layers, setLayers] = useState<LayerItem[]>([]);
  const [selectedLayerId, setSelectedLayerId] = useState<string | null>(null);
  const [selectedObject, setSelectedObject] = useState<FabricObject | null>(null);

  // Canvas Viewport & Zoom State
  const [zoomLevel, setZoomLevel] = useState<number>(1.0); // 1.0 = Fit to screen
  const [fitScale, setFitScale] = useState<number>(0.5);

  const [isLoading, setIsLoading] = useState(true);
  const [isCuttingOut, setIsCuttingOut] = useState(false);
  const [cutoutSuccess, setCutoutSuccess] = useState(false);

  // Text Styling & Live Sentence Editing State
  const [currentTextContent, setCurrentTextContent] = useState('');
  const [fontFamily, setFontFamily] = useState("'Bebas Neue', sans-serif");
  const [fontSize, setFontSize] = useState(48);
  const [fillColor, setFillColor] = useState('#FFFFFF');
  const [bgColor, setBgColor] = useState('transparent');
  const [isBold, setIsBold] = useState(false);
  const [isItalic, setIsItalic] = useState(false);
  const [textAlign, setTextAlign] = useState<'left' | 'center' | 'right'>('left');

  // Compute base native canvas dimensions based on chosen aspect ratio
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
    // Reverse objects so the topmost visual layer appears at the top of the UI list
    const mapped: LayerItem[] = [...objects].reverse().map((obj, revIdx) => {
      const idx = objects.indexOf(obj);
      const customData = (obj as any).customData || {};
      let name = customData.name;
      if (!name) {
        if (obj instanceof Textbox) {
          name = `Teks: "${obj.text?.slice(0, 24) || 'Kosong'}..."`;
        } else if (obj instanceof FabricImage) {
          name = customData.isCutout ? '✨ Objek Depan (Cutout)' : '🖼️ Latar Belakang';
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
      setFillColor(typeof obj.fill === 'string' ? obj.fill : '#FFFFFF');
      setBgColor(typeof obj.backgroundColor === 'string' ? obj.backgroundColor : 'transparent');
      setIsBold(obj.fontWeight === 'bold' || (typeof obj.fontWeight === 'number' && obj.fontWeight >= 700));
      setIsItalic(obj.fontStyle === 'italic');
      setTextAlign((obj.textAlign as any) || 'left');
    }
  };

  // ─── RESIZE & RESPONSIVE FIT ENGINE ───
  // Menjamin seluruh konten poster/infografis 100% tampak tanpa terpotong sesuai rasio
  const handleUpdateDimensions = useCallback(() => {
    if (!workspaceRef.current || !fabricRef.current) return;
    const { clientWidth, clientHeight } = workspaceRef.current;
    if (!clientWidth || !clientHeight) return;

    // Spacing padding yang nyaman di sekeliling kanvas
    const paddingX = 64;
    const paddingY = 64;
    const availW = Math.max(120, clientWidth - paddingX);
    const availH = Math.max(120, clientHeight - paddingY);

    const calculatedFit = Math.min(availW / nativeWidth, availH / nativeHeight);
    setFitScale(calculatedFit);

    const effectiveZoom = calculatedFit * zoomLevel;
    const displayW = Math.round(nativeWidth * effectiveZoom);
    const displayH = Math.round(nativeHeight * effectiveZoom);

    fabricRef.current.setDimensions({ width: displayW, height: displayH });
    fabricRef.current.setZoom(effectiveZoom);
    fabricRef.current.renderAll();
  }, [nativeWidth, nativeHeight, zoomLevel]);

  useEffect(() => {
    if (!isOpen) return;
    handleUpdateDimensions();
    window.addEventListener('resize', handleUpdateDimensions);

    let observer: ResizeObserver | null = null;
    if (workspaceRef.current) {
      observer = new ResizeObserver(() => handleUpdateDimensions());
      observer.observe(workspaceRef.current);
    }

    return () => {
      window.removeEventListener('resize', handleUpdateDimensions);
      observer?.disconnect();
    };
  }, [isOpen, handleUpdateDimensions]);

  // Set default Canva-style selection styling
  useEffect(() => {
    FabricObject.ownDefaults.transparentCorners = false;
    FabricObject.ownDefaults.cornerColor = '#FFFFFF';
    FabricObject.ownDefaults.cornerStrokeColor = '#7D2AE8'; // Canva purple
    FabricObject.ownDefaults.borderColor = '#7D2AE8';
    FabricObject.ownDefaults.cornerSize = 9;
    FabricObject.ownDefaults.cornerStyle = 'circle';
    FabricObject.ownDefaults.borderScaleFactor = 1.5;
    FabricObject.ownDefaults.padding = 6;
  }, []);

  // Initialize Fabric Canvas
  useEffect(() => {
    if (!isOpen || !canvasElRef.current) return;

    setIsLoading(true);
    let isMounted = true;

    if (fabricRef.current) {
      fabricRef.current.dispose();
      fabricRef.current = null;
    }

    const canvas = new FabricCanvas(canvasElRef.current, {
      width: nativeWidth,
      height: nativeHeight,
      backgroundColor: '#FFFFFF',
      preserveObjectStacking: true,
      selection: true,
    });

    fabricRef.current = canvas;

    // Canvas Events
    canvas.on('selection:created', (e) => updateStylePanelFromObject(e.selected?.[0] || null));
    canvas.on('selection:updated', (e) => updateStylePanelFromObject(e.selected?.[0] || null));
    canvas.on('selection:cleared', () => updateStylePanelFromObject(null));
    canvas.on('object:modified', () => {
      refreshLayersList(canvas);
      if (canvas.getActiveObject() instanceof Textbox) {
        updateStylePanelFromObject(canvas.getActiveObject() || null);
      }
    });
    canvas.on('object:added', () => refreshLayersList(canvas));
    canvas.on('object:removed', () => refreshLayersList(canvas));
    canvas.on('text:changed', (e) => {
      if (e.target instanceof Textbox) {
        setCurrentTextContent(e.target.text || '');
        refreshLayersList(canvas);
      }
    });

    const initCanvasContent = async () => {
      try {
        if (savedLayersJson) {
          try {
            // Bersihkan URL backend di JSON menjadi relative same-origin agar tidak memicu error CORS saat deserialisasi
            const sanitizedJson = savedLayersJson.replace(/https?:\/\/[^\/]+(?::\d+)?\/uploads\//g, '/uploads/');
            await canvas.loadFromJSON(sanitizedJson);
            canvas.renderAll();
            if (isMounted) {
              refreshLayersList(canvas);
              handleUpdateDimensions();
              setIsLoading(false);
            }
            return;
          } catch (jsonErr) {
            console.warn('[MagicLayers] Sesi JSON tersimpan tidak dapat dimuat, inisialisasi ulang kanvas:', jsonErr);
          }
        }

        // ─── INISIALISASI DASAR KANVAS ───
        // 1. Muat Latar Belakang Gambar Utama
        const bgImg = await loadResilientFabricImage(imageUrl);
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

        // 2. Tambah Komponen Teks Lengkap Siap Diedit & Digeser
        // Masthead Header Tag
        const masthead = new Textbox('POLARIS GOV // DOKUMEN ADVOKASI PUBLIK', {
          left: 70,
          top: 60,
          width: nativeWidth - 140,
          fontSize: 18,
          fontFamily: "'Inter', sans-serif",
          fontWeight: 'bold',
          fill: '#38BDF8',
          backgroundColor: 'rgba(15, 23, 42, 0.85)',
          padding: 8,
          editable: true,
          shadow: new Shadow({ color: 'rgba(0,0,0,0.5)', blur: 6, offsetX: 0, offsetY: 2 }),
        });
        (masthead as any).customId = 'layer_masthead';
        (masthead as any).customData = { name: '🏷️ Tag Header / Dokumen' };
        canvas.add(masthead);

        // Judul Utama (Headline)
        const headlineText = initialTitle || 'PENURUNAN PENGANGGURAN MELALUI PELATIHAN';
        const headline = new Textbox(headlineText.toUpperCase(), {
          left: 70,
          top: 110,
          width: nativeWidth - 140,
          fontSize: 52,
          fontFamily: "'Bebas Neue', sans-serif",
          fontWeight: 'bold',
          fill: '#FFFFFF',
          editable: true,
          shadow: new Shadow({ color: 'rgba(0,0,0,0.85)', blur: 14, offsetX: 0, offsetY: 3 }),
        });
        (headline as any).customId = 'layer_headline';
        (headline as any).customData = { name: '📝 Judul Utama (Headline)' };
        canvas.add(headline);

        // Subjudul / Ringkasan Narasi
        const subText =
          initialSubtitle ||
          'Program pelatihan di Balai Latihan Kerja berhasil meningkatkan daya saing tenaga kerja dan menurunkan angka pengangguran terbuka.';
        const leadText = new Textbox(subText, {
          left: 70,
          top: 190,
          width: nativeWidth - 140,
          fontSize: 22,
          fontFamily: "'Inter', sans-serif",
          fontWeight: 'normal',
          fontStyle: 'italic',
          fill: '#E2E8F0',
          editable: true,
          shadow: new Shadow({ color: 'rgba(0,0,0,0.8)', blur: 8, offsetX: 0, offsetY: 2 }),
        });
        (leadText as any).customId = 'layer_lead';
        (leadText as any).customData = { name: '📑 Intisari Narasi Kebijakan' };
        canvas.add(leadText);

        // Kartu Dimensi 01 (Interaktif & Dapat Digeser)
        const card1 = new Textbox(
          'DIMENSI 01: 5 BALAI LATIHAN KERJA\nTerdapat 5 Balai Latihan Kerja di Jawa Barat dengan fasilitas kejuruan terpadu.',
          {
            left: 70,
            top: nativeHeight * 0.40,
            width: 440,
            fontSize: 18,
            fontFamily: "'Inter', sans-serif",
            fontWeight: 'normal',
            fill: '#FFFFFF',
            backgroundColor: 'rgba(15, 23, 42, 0.88)',
            padding: 12,
            editable: true,
            shadow: new Shadow({ color: 'rgba(0,0,0,0.5)', blur: 8, offsetX: 0, offsetY: 3 }),
          }
        );
        (card1 as any).customId = 'layer_dimensi_1';
        (card1 as any).customData = { name: '📌 Kartu Dimensi 01' };
        canvas.add(card1);

        // Kartu Dimensi 02 (Interaktif & Dapat Digeser)
        const card2 = new Textbox(
          'DIMENSI 02: 60% PESERTA BERSERTIFIKAT\nMayoritas peserta berhasil memperoleh sertifikasi kompetensi industri resmi.',
          {
            left: 70,
            top: nativeHeight * 0.58,
            width: 440,
            fontSize: 18,
            fontFamily: "'Inter', sans-serif",
            fontWeight: 'normal',
            fill: '#FFFFFF',
            backgroundColor: 'rgba(15, 23, 42, 0.88)',
            padding: 12,
            editable: true,
            shadow: new Shadow({ color: 'rgba(0,0,0,0.5)', blur: 8, offsetX: 0, offsetY: 3 }),
          }
        );
        (card2 as any).customId = 'layer_dimensi_2';
        (card2 as any).customData = { name: '📌 Kartu Dimensi 02' };
        canvas.add(card2);

        // Highlight Metrik Angka
        const statPill = new Textbox('95% TINGKAT PENYERAPAN KERJA', {
          left: nativeWidth - 420,
          top: nativeHeight * 0.40,
          width: 350,
          fontSize: 20,
          fontFamily: "'Inter', sans-serif",
          fontWeight: 'bold',
          fill: '#FCD34D',
          backgroundColor: 'rgba(15, 23, 42, 0.90)',
          padding: 10,
          editable: true,
          shadow: new Shadow({ color: 'rgba(0,0,0,0.6)', blur: 8, offsetX: 0, offsetY: 2 }),
        });
        (statPill as any).customId = 'layer_stat';
        (statPill as any).customData = { name: '📊 Kapsul Statistik Kunci' };
        canvas.add(statPill);

        // Footer Atribusi / Penulis
        const authorText = initialAuthor || 'DR. JONANDA P. A. B // DPRD PROVINSI • DAPIL JABAR 2026';
        const authorBadge = new Textbox(authorText, {
          left: 70,
          top: nativeHeight - 90,
          width: nativeWidth - 140,
          fontSize: 20,
          fontFamily: "'Inter', sans-serif",
          fontWeight: 'bold',
          fill: '#FFFFFF',
          backgroundColor: 'rgba(15, 23, 42, 0.85)',
          padding: 8,
          editable: true,
          shadow: new Shadow({ color: 'rgba(0,0,0,0.7)', blur: 8, offsetX: 0, offsetY: 2 }),
        });
        (authorBadge as any).customId = 'layer_author';
        (authorBadge as any).customData = { name: '👤 Atribusi / Tanda Tangan' };
        canvas.add(authorBadge);

        canvas.renderAll();
        if (isMounted) {
          refreshLayersList(canvas);
          handleUpdateDimensions();
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
  }, [isOpen, imageUrl, nativeWidth, nativeHeight, savedLayersJson, initialTitle, initialAuthor, initialSubtitle, refreshLayersList, handleUpdateDimensions, toast]);

  // ─── LIVE SENTENCE / TEXT EDITING HANDLER ───
  // Mengubah kalimat langsung dari input bar atau kanvas
  const handleLiveTextChange = (newText: string) => {
    setCurrentTextContent(newText);
    if (!fabricRef.current || !selectedObject || !(selectedObject instanceof Textbox)) return;
    selectedObject.set('text', newText);
    selectedObject.initDimensions();
    fabricRef.current.renderAll();
    refreshLayersList(fabricRef.current);
  };

  // Apply Text Styling Changes
  const applyFontFamily = (font: string) => {
    setFontFamily(font);
    if (selectedObject && selectedObject instanceof Textbox) {
      selectedObject.set('fontFamily', font);
      selectedObject.initDimensions();
      fabricRef.current?.renderAll();
    }
  };

  const applyFontSize = (size: number) => {
    setFontSize(size);
    if (selectedObject && selectedObject instanceof Textbox) {
      selectedObject.set('fontSize', size);
      selectedObject.initDimensions();
      fabricRef.current?.renderAll();
    }
  };

  const applyFillColor = (color: string) => {
    setFillColor(color);
    if (selectedObject && selectedObject instanceof Textbox) {
      selectedObject.set('fill', color);
      fabricRef.current?.renderAll();
    }
  };

  const applyBgColor = (color: string) => {
    setBgColor(color);
    if (selectedObject && selectedObject instanceof Textbox) {
      selectedObject.set('backgroundColor', color);
      fabricRef.current?.renderAll();
    }
  };

  const toggleBold = () => {
    const next = !isBold;
    setIsBold(next);
    if (selectedObject && selectedObject instanceof Textbox) {
      selectedObject.set('fontWeight', next ? 'bold' : 'normal');
      selectedObject.initDimensions();
      fabricRef.current?.renderAll();
    }
  };

  const toggleItalic = () => {
    const next = !isItalic;
    setIsItalic(next);
    if (selectedObject && selectedObject instanceof Textbox) {
      selectedObject.set('fontStyle', next ? 'italic' : 'normal');
      selectedObject.initDimensions();
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

  // ─── ADD NEW ELEMENTS ───
  const addTextHeading = () => {
    if (!fabricRef.current) return;
    const txt = new Textbox('JUDUL BARU BESAR', {
      left: nativeWidth / 2 - 200,
      top: nativeHeight / 2 - 40,
      width: 400,
      fontSize: 48,
      fontFamily: "'Bebas Neue', sans-serif",
      fontWeight: 'bold',
      fill: '#FFFFFF',
      textAlign: 'center',
      shadow: new Shadow({ color: 'rgba(0,0,0,0.85)', blur: 12, offsetX: 0, offsetY: 3 }),
    });
    (txt as any).customId = `heading_${Date.now()}`;
    (txt as any).customData = { name: '📝 Judul Baru' };
    fabricRef.current.add(txt);
    fabricRef.current.setActiveObject(txt);
    fabricRef.current.renderAll();
  };

  const addTextBody = () => {
    if (!fabricRef.current) return;
    const txt = new Textbox('Tuliskan poin narasi atau kalimat penjelasan kebijakan Anda di sini.', {
      left: nativeWidth / 2 - 220,
      top: nativeHeight / 2,
      width: 440,
      fontSize: 22,
      fontFamily: "'Inter', sans-serif",
      fill: '#FFFFFF',
      backgroundColor: 'rgba(15, 23, 42, 0.85)',
      padding: 10,
      shadow: new Shadow({ color: 'rgba(0,0,0,0.6)', blur: 8, offsetX: 0, offsetY: 2 }),
    });
    (txt as any).customId = `body_${Date.now()}`;
    (txt as any).customData = { name: '📄 Poin Kalimat' };
    fabricRef.current.add(txt);
    fabricRef.current.setActiveObject(txt);
    fabricRef.current.renderAll();
  };

  const addDimensiCard = () => {
    if (!fabricRef.current) return;
    const txt = new Textbox('DIMENSI BARU: NAMA TOPIK\nTuliskan uraian solusi dan implementasi program di sini.', {
      left: nativeWidth / 2 - 220,
      top: nativeHeight / 2 - 50,
      width: 440,
      fontSize: 18,
      fontFamily: "'Inter', sans-serif",
      fill: '#FFFFFF',
      backgroundColor: 'rgba(15, 23, 42, 0.88)',
      padding: 12,
      shadow: new Shadow({ color: 'rgba(0,0,0,0.7)', blur: 10, offsetX: 0, offsetY: 3 }),
    });
    (txt as any).customId = `dimensi_${Date.now()}`;
    (txt as any).customData = { name: '📌 Kartu Dimensi Baru' };
    fabricRef.current.add(txt);
    fabricRef.current.setActiveObject(txt);
    fabricRef.current.renderAll();
  };

  const addBadgeShape = () => {
    if (!fabricRef.current) return;
    const txt = new Textbox('★ LENCANA REKOMENDASI UTAMA ★', {
      left: nativeWidth / 2 - 180,
      top: nativeHeight / 2 + 50,
      width: 360,
      fontSize: 16,
      fontFamily: "'Inter', sans-serif",
      fontWeight: 'bold',
      fill: '#0F172A',
      backgroundColor: '#FCD34D',
      padding: 8,
      textAlign: 'center',
      shadow: new Shadow({ color: 'rgba(0,0,0,0.4)', blur: 6, offsetX: 0, offsetY: 2 }),
    });
    (txt as any).customId = `badge_${Date.now()}`;
    (txt as any).customData = { name: '🏷️ Lencana / Badge' };
    fabricRef.current.add(txt);
    fabricRef.current.setActiveObject(txt);
    fabricRef.current.renderAll();
  };

  // Duplicate Object
  const handleDuplicateSelected = () => {
    if (!fabricRef.current || !selectedObject) return;
    selectedObject.clone().then((cloned: FabricObject) => {
      cloned.set({
        left: (cloned.left || 0) + 20,
        top: (cloned.top || 0) + 20,
      });
      (cloned as any).customId = `clone_${Date.now()}`;
      (cloned as any).customData = { name: `Salinan ${(selectedObject as any).customData?.name || 'Layer'}` };
      fabricRef.current?.add(cloned);
      fabricRef.current?.setActiveObject(cloned);
      fabricRef.current?.renderAll();
    });
  };

  // Layer Operations
  const selectLayer = (layer: LayerItem) => {
    if (!fabricRef.current) return;
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
  };

  const moveLayerDown = (layer: LayerItem, e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (!fabricRef.current) return;
    fabricRef.current.sendObjectBackwards(layer.object);
    fabricRef.current.renderAll();
    refreshLayersList(fabricRef.current);
  };

  const moveLayerToFront = () => {
    if (!fabricRef.current || !selectedObject) return;
    fabricRef.current.bringObjectToFront(selectedObject);
    fabricRef.current.renderAll();
    refreshLayersList(fabricRef.current);
  };

  const moveLayerToBack = () => {
    if (!fabricRef.current || !selectedObject) return;
    fabricRef.current.sendObjectToBack(selectedObject);
    // Ensure background stays at the absolute bottom
    const bg = fabricRef.current.getObjects().find((o) => (o as any).customData?.isBackground);
    if (bg) fabricRef.current.sendObjectToBack(bg);
    fabricRef.current.renderAll();
    refreshLayersList(fabricRef.current);
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
  };

  // ─── MAGIC CUTOUT AI (CANVA MAGIC LAYERS FOREGROUND EXTRACT) ───
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
      const { removeBackground } = await import('@imgly/background-removal');
      const blob = await removeBackground(safeUrl);
      const cutoutUrl = URL.createObjectURL(blob);

      const cutoutImg = await loadResilientFabricImage(cutoutUrl);

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
      setActiveTab('layers');

      toast({
        type: 'success',
        title: 'Magic Cutout Berhasil!',
        description: 'Subjek berhasil dipisahkan! Anda kini dapat menempatkan teks di belakang subjek dengan menurunkan urutan layer teks.',
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

  // ─── SAVE & APPLY (PIXEL-PERFECT EXPORT) ───
  const handleSaveAndApply = () => {
    if (!fabricRef.current) return;
    try {
      // Deselect handles for pristine export
      fabricRef.current.discardActiveObject();

      // Temporarily restore native resolution for ultra-sharp HD export
      const currentZoom = fabricRef.current.getZoom();
      const currentW = fabricRef.current.getWidth();
      const currentH = fabricRef.current.getHeight();

      fabricRef.current.setDimensions({ width: nativeWidth, height: nativeHeight });
      fabricRef.current.setZoom(1.0);
      fabricRef.current.renderAll();

      const renderedUrl = fabricRef.current.toDataURL({
        format: 'png',
        multiplier: 1.0, // Crisp 1080p native resolution
      });

      const layersJson = JSON.stringify(fabricRef.current.toJSON());

      // Restore viewport scale
      fabricRef.current.setDimensions({ width: currentW, height: currentH });
      fabricRef.current.setZoom(currentZoom);
      fabricRef.current.renderAll();

      onApplyChanges(renderedUrl, layersJson);

      toast({
        type: 'success',
        title: 'Desain Berhasil Diterapkan',
        description: 'Perubahan layer dan kalimat berhasil disimpan ke infografis Anda.',
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

  // ─── DOWNLOAD HIGH-RES HD ───
  const handleDownload = () => {
    if (!fabricRef.current) return;
    try {
      fabricRef.current.discardActiveObject();

      const currentZoom = fabricRef.current.getZoom();
      const currentW = fabricRef.current.getWidth();
      const currentH = fabricRef.current.getHeight();

      fabricRef.current.setDimensions({ width: nativeWidth, height: nativeHeight });
      fabricRef.current.setZoom(1.0);
      fabricRef.current.renderAll();

      const renderedUrl = fabricRef.current.toDataURL({
        format: 'png',
        multiplier: 1.5, // 1.5x HD export
      });

      fabricRef.current.setDimensions({ width: currentW, height: currentH });
      fabricRef.current.setZoom(currentZoom);
      fabricRef.current.renderAll();

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
      
      {/* ─── 1. TOP HEADER (CANVA PURE WHITE STUDIO BAR) ─── */}
      <header className="h-14 bg-white border-b border-slate-200 flex items-center justify-between px-4 sm:px-6 shrink-0 z-30 shadow-xs">
        
        {/* SISI KIRI: TOMBOL KEMBALI & INFORMASI DOKUMEN */}
        <div className="flex items-center gap-3">
          <button
            onClick={onClose}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-xs font-bold text-slate-700 transition-colors cursor-pointer"
            title="Keluar dari Magic Layers Studio"
          >
            <ArrowLeft className="h-4 w-4 text-slate-500" />
            <span className="hidden sm:inline">Selesai / Tutup</span>
          </button>

          <div className="h-5 w-px bg-slate-200" />

          <div className="flex items-center gap-2">
            <div className="h-7 w-7 rounded-lg bg-gradient-to-tr from-purple-600 via-indigo-600 to-blue-600 flex items-center justify-center shadow-xs">
              <Sparkles className="h-3.5 w-3.5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-black text-slate-900 tracking-tight">Magic Layers Studio</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-purple-50 text-purple-700 border border-purple-200 font-bold">
                  Canva AI
                </span>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-md bg-slate-100 text-slate-500 font-bold">
                  Rasio {aspectRatio}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* SISI TENGAH: ZOOM CONTROLS (FIT TO SCREEN) */}
        <div className="hidden md:flex items-center gap-1.5 bg-slate-50 border border-slate-200 px-2 py-1 rounded-xl">
          <button
            onClick={() => setZoomLevel((prev) => Math.max(0.5, prev - 0.15))}
            className="p-1 text-slate-500 hover:text-slate-800 hover:bg-white rounded transition-colors"
            title="Perkecil Kanvas"
          >
            <ZoomOut className="h-3.5 w-3.5" />
          </button>
          
          <button
            onClick={() => setZoomLevel(1.0)}
            className={`px-2 py-0.5 rounded text-[11px] font-bold font-mono transition-colors ${
              zoomLevel === 1.0 ? 'bg-white text-purple-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
            title="Sesuaikan Pas Layar (100% Konten Tampak)"
          >
            Fit ({Math.round(zoomLevel * 100)}%)
          </button>

          <button
            onClick={() => setZoomLevel((prev) => Math.min(2.5, prev + 0.15))}
            className="p-1 text-slate-500 hover:text-slate-800 hover:bg-white rounded transition-colors"
            title="Perbesar Kanvas"
          >
            <ZoomIn className="h-3.5 w-3.5" />
          </button>
        </div>

        {/* SISI KANAN: TOMBOL MAGIC CUTOUT, UNDUH HD & TERAPKAN DESAIN */}
        <div className="flex items-center gap-2">
          {/* TOMBOL MAGIC CUTOUT (PISAHKAN OBJEK DEPAN) */}
          <Button
            size="sm"
            onClick={handleMagicCutout}
            disabled={isCuttingOut}
            className={`text-xs font-bold gap-1.5 shadow-xs transition-all cursor-pointer ${
              cutoutSuccess
                ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                : 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white'
            }`}
            title="Pisahkan subjek/orang dari latar belakang agar teks bisa berada di belakangnya"
          >
            {isCuttingOut ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : cutoutSuccess ? (
              <Check className="h-3.5 w-3.5 text-emerald-100" />
            ) : (
              <Wand2 className="h-3.5 w-3.5 text-purple-200" />
            )}
            <span className="hidden sm:inline">
              {isCuttingOut ? 'Mengekstrak Subjek AI...' : cutoutSuccess ? 'Objek Terpisah!' : '🪄 Pisahkan Objek Depan'}
            </span>
          </Button>

          {/* UNDUH HD */}
          <button
            type="button"
            onClick={handleDownload}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-xs font-bold text-slate-700 transition-colors cursor-pointer"
            title="Unduh berkas gambar HD ke laptop/komputer"
          >
            <Download className="h-3.5 w-3.5 text-slate-500" />
            <span className="hidden md:inline">Unduh HD</span>
          </button>

          {/* TERAPKAN & SIMPAN */}
          <Button
            size="sm"
            onClick={handleSaveAndApply}
            className="bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold gap-1.5 shadow-sm cursor-pointer"
            title="Simpan susunan layer dan terapkan ke infografis"
          >
            <Save className="h-3.5 w-3.5" />
            <span>Terapkan Desain</span>
          </Button>
        </div>
      </header>

      {/* ─── 2. CONTEXTUAL FORMATTING BAR (CANVA WHITE SUBHEADER) ─── */}
      <div className="h-12 bg-white border-b border-slate-200 flex items-center justify-between px-4 sm:px-6 shrink-0 z-20 gap-3 overflow-x-auto shadow-2xs">
        {selectedObject && selectedObject instanceof Textbox ? (
          <div className="flex items-center gap-2.5 shrink-0 w-full animate-in fade-in duration-150">
            
            {/* INPUT LANGSUNG UBAH KALIMAT */}
            <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1 flex-1 max-w-sm">
              <Edit3 className="h-3.5 w-3.5 text-purple-600 shrink-0" />
              <input
                type="text"
                value={currentTextContent}
                onChange={(e) => handleLiveTextChange(e.target.value)}
                placeholder="Ubah isi kalimat di sini..."
                className="bg-transparent border-none text-xs text-slate-800 font-medium focus:outline-hidden w-full"
              />
            </div>

            <div className="h-5 w-px bg-slate-200" />

            {/* FONT SELECT */}
            <select
              value={fontFamily}
              onChange={(e) => applyFontFamily(e.target.value)}
              className="bg-white border border-slate-200 text-slate-700 text-xs rounded-lg px-2.5 py-1.5 font-medium outline-hidden hover:border-slate-300"
            >
              {PRESET_FONTS.map((f) => (
                <option key={f.value} value={f.value}>
                  {f.label}
                </option>
              ))}
            </select>

            {/* FONT SIZE CONTROLS */}
            <div className="flex items-center bg-slate-50 border border-slate-200 rounded-lg overflow-hidden">
              <button
                onClick={() => applyFontSize(Math.max(12, fontSize - 4))}
                className="px-2 py-1 text-xs text-slate-600 hover:bg-slate-200 font-bold"
              >
                -
              </button>
              <span className="text-xs font-mono font-bold text-slate-800 px-2">{fontSize}</span>
              <button
                onClick={() => applyFontSize(fontSize + 4)}
                className="px-2 py-1 text-xs text-slate-600 hover:bg-slate-200 font-bold"
              >
                +
              </button>
            </div>

            {/* BOLD & ITALIC */}
            <div className="flex items-center gap-0.5 bg-slate-50 p-0.5 rounded-lg border border-slate-200">
              <button
                onClick={toggleBold}
                className={`p-1.5 rounded transition-colors ${isBold ? 'bg-purple-600 text-white' : 'text-slate-600 hover:bg-white'}`}
                title="Tebal (Bold)"
              >
                <Bold className="h-3.5 w-3.5" />
              </button>
              <button
                onClick={toggleItalic}
                className={`p-1.5 rounded transition-colors ${isItalic ? 'bg-purple-600 text-white' : 'text-slate-600 hover:bg-white'}`}
                title="Miring (Italic)"
              >
                <Italic className="h-3.5 w-3.5" />
              </button>
            </div>

            {/* ALIGNMENT */}
            <div className="flex items-center gap-0.5 bg-slate-50 p-0.5 rounded-lg border border-slate-200">
              <button
                onClick={() => applyTextAlign('left')}
                className={`p-1.5 rounded transition-colors ${textAlign === 'left' ? 'bg-purple-600 text-white' : 'text-slate-600 hover:bg-white'}`}
                title="Rata Kiri"
              >
                <AlignLeft className="h-3.5 w-3.5" />
              </button>
              <button
                onClick={() => applyTextAlign('center')}
                className={`p-1.5 rounded transition-colors ${textAlign === 'center' ? 'bg-purple-600 text-white' : 'text-slate-600 hover:bg-white'}`}
                title="Rata Tengah"
              >
                <AlignCenter className="h-3.5 w-3.5" />
              </button>
              <button
                onClick={() => applyTextAlign('right')}
                className={`p-1.5 rounded transition-colors ${textAlign === 'right' ? 'bg-purple-600 text-white' : 'text-slate-600 hover:bg-white'}`}
                title="Rata Kanan"
              >
                <AlignRight className="h-3.5 w-3.5" />
              </button>
            </div>

            {/* COLOR SWATCH */}
            <div className="flex items-center gap-1 bg-slate-50 px-2 py-1 rounded-lg border border-slate-200" title="Warna Teks">
              <span className="text-[10px] font-bold text-slate-500 uppercase mr-1">Teks:</span>
              {PRESET_COLORS.map((col) => (
                <button
                  key={col}
                  onClick={() => applyFillColor(col)}
                  className={`h-4 w-4 rounded-full border border-slate-300 transition-transform hover:scale-125 ${
                    fillColor === col ? 'ring-2 ring-purple-600 scale-110' : ''
                  }`}
                  style={{ backgroundColor: col }}
                  title={`Warna: ${col}`}
                />
              ))}
            </div>

            {/* CARD BACKGROUND SELECT */}
            <select
              value={bgColor}
              onChange={(e) => applyBgColor(e.target.value)}
              className="bg-white border border-slate-200 text-slate-700 text-xs rounded-lg px-2.5 py-1.5 font-medium outline-hidden hover:border-slate-300"
              title="Latar Belakang Kotak / Kartu Teks"
            >
              {PRESET_BG_COLORS.map((bg) => (
                <option key={bg.value} value={bg.value}>
                  {bg.label}
                </option>
              ))}
            </select>

            <div className="h-5 w-px bg-slate-200" />

            {/* LAYER ORDER SHORTCUTS */}
            <div className="flex items-center gap-1">
              <button
                onClick={moveLayerToFront}
                className="px-2 py-1 rounded border border-slate-200 hover:bg-slate-50 text-[11px] font-bold text-slate-700 transition-colors"
                title="Bawa teks ke lapisan paling depan"
              >
                Paling Depan
              </button>
              <button
                onClick={moveLayerToBack}
                className="px-2 py-1 rounded border border-slate-200 hover:bg-slate-50 text-[11px] font-bold text-slate-700 transition-colors"
                title="Kirim teks ke belakang subjek / objek"
              >
                Ke Belakang
              </button>
            </div>

            {/* DUPLICATE & DELETE */}
            <div className="flex items-center gap-1 ml-auto">
              <button
                onClick={handleDuplicateSelected}
                className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-600 transition-colors"
                title="Gandakan Elemen Ini"
              >
                <Copy className="h-3.5 w-3.5" />
              </button>
              <button
                onClick={deleteSelectedObject}
                className="p-1.5 rounded-lg border border-red-200 hover:bg-red-50 text-red-600 transition-colors"
                title="Hapus Elemen Ini"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>

          </div>
        ) : selectedObject ? (
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-700">
                Layer Terpilih: {(selectedObject as any).customData?.name || 'Objek Kanvas'}
              </span>
              <span className="text-[11px] text-slate-400">
                (Tarik sudut untuk mengubah ukuran, atau geser untuk memindahkan posisi)
              </span>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                onClick={moveLayerToFront}
                className="px-2.5 py-1 rounded-lg border border-slate-200 hover:bg-slate-50 text-xs font-bold text-slate-700"
              >
                Ke Depan
              </button>
              <button
                onClick={moveLayerToBack}
                className="px-2.5 py-1 rounded-lg border border-slate-200 hover:bg-slate-50 text-xs font-bold text-slate-700"
              >
                Ke Belakang
              </button>
              <button
                onClick={deleteSelectedObject}
                className="p-1.5 rounded-lg border border-red-200 hover:bg-red-50 text-red-600 transition-colors"
                title="Hapus Elemen Ini"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-between w-full text-xs text-slate-500">
            <div className="flex items-center gap-2">
              <Sparkles className="h-3.5 w-3.5 text-purple-600" />
              <span>
                <strong>Mode Magic Layers:</strong> Klik elemen teks atau kartu di kanvas untuk menggeser, atau klik ganda (double-click) untuk mengubah kalimat.
              </span>
            </div>
            <div className="text-[11px] text-slate-400 font-medium">
              Shortcut: Gunakan panah atau mouse drag untuk memindahkan posisi elemen
            </div>
          </div>
        )}
      </div>

      {/* ─── 3. MAIN WORKSPACE: SIDEBAR + CENTER CANVAS ─── */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* SISI KIRI: TAB ICON NAVIGATOR (CANVA STYLE) */}
        <aside className="w-16 bg-white border-r border-slate-200 flex flex-col items-center py-3 gap-2 shrink-0 z-10 shadow-2xs">
          <button
            onClick={() => setActiveTab('layers')}
            className={`flex flex-col items-center justify-center w-12 h-12 rounded-xl transition-all ${
              activeTab === 'layers'
                ? 'bg-purple-50 text-purple-700 font-bold'
                : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
            }`}
            title="Susunan Lapisan (Z-Index)"
          >
            <Layers className="h-5 w-5" />
            <span className="text-[9.5px] mt-0.5">Lapisan</span>
          </button>

          <button
            onClick={() => setActiveTab('text')}
            className={`flex flex-col items-center justify-center w-12 h-12 rounded-xl transition-all ${
              activeTab === 'text'
                ? 'bg-purple-50 text-purple-700 font-bold'
                : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
            }`}
            title="Tambah Elemen Teks"
          >
            <Type className="h-5 w-5" />
            <span className="text-[9.5px] mt-0.5">Teks</span>
          </button>

          <button
            onClick={() => setActiveTab('elements')}
            className={`flex flex-col items-center justify-center w-12 h-12 rounded-xl transition-all ${
              activeTab === 'elements'
                ? 'bg-purple-50 text-purple-700 font-bold'
                : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
            }`}
            title="Tambah Bentuk & Kartu Dimensi"
          >
            <Square className="h-5 w-5" />
            <span className="text-[9.5px] mt-0.5">Elemen</span>
          </button>

          <button
            onClick={() => setActiveTab('magic')}
            className={`flex flex-col items-center justify-center w-12 h-12 rounded-xl transition-all ${
              activeTab === 'magic'
                ? 'bg-purple-50 text-purple-700 font-bold'
                : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
            }`}
            title="Fitur AI Magic Layers"
          >
            <Wand2 className="h-5 w-5" />
            <span className="text-[9.5px] mt-0.5">Magic AI</span>
          </button>
        </aside>

        {/* DRAWER KONTEN SIDEBAR */}
        <div className="w-72 bg-white border-r border-slate-200 flex flex-col shrink-0 overflow-y-auto">
          {/* TAB 1: SUSUNAN LAPISAN (LAYERS) */}
          {activeTab === 'layers' && (
            <div className="flex flex-col h-full">
              <div className="px-4 py-3.5 border-b border-slate-100 flex items-center justify-between bg-slate-50/60">
                <span className="text-xs font-black uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                  <Layers className="h-4 w-4 text-purple-600" />
                  <span>Susunan Lapisan ({layers.length})</span>
                </span>
                <span className="text-[10px] text-slate-400 font-mono">Atas ➔ Bawah</span>
              </div>

              <div className="flex-1 overflow-y-auto p-2.5 space-y-1.5">
                {layers.map((layer, index) => {
                  const isSelected = selectedLayerId === layer.id;
                  const isBg = (layer.object as any).customData?.isBackground;
                  const isCutout = (layer.object as any).customData?.isCutout;

                  return (
                    <div
                      key={layer.id}
                      onClick={() => selectLayer(layer)}
                      className={`flex items-center justify-between p-2.5 rounded-xl text-xs transition-all cursor-pointer border ${
                        isSelected
                          ? 'bg-purple-50/80 border-purple-300 text-purple-950 font-bold shadow-2xs'
                          : isCutout
                          ? 'bg-purple-50/40 border-purple-200 text-purple-800 font-semibold'
                          : isBg
                          ? 'bg-slate-50 border-slate-200 text-slate-500'
                          : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-700'
                      }`}
                    >
                      <div className="flex items-center gap-2 overflow-hidden mr-2">
                        {isCutout ? (
                          <Sparkles className="h-3.5 w-3.5 text-purple-600 shrink-0" />
                        ) : layer.object instanceof Textbox ? (
                          <Type className="h-3.5 w-3.5 text-blue-600 shrink-0" />
                        ) : layer.object instanceof FabricImage ? (
                          <ImageIcon className="h-3.5 w-3.5 text-slate-500 shrink-0" />
                        ) : (
                          <Square className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                        )}
                        <span className="truncate text-xs">{layer.name}</span>
                      </div>

                      {/* LAYER ACTION BUTTONS */}
                      <div className="flex items-center gap-1 shrink-0">
                        {/* MOVE UP */}
                        <button
                          onClick={(e) => moveLayerUp(layer, e)}
                          disabled={index === 0 || isBg}
                          className="p-1 rounded text-slate-400 hover:text-slate-800 hover:bg-slate-100 disabled:opacity-20"
                          title="Naikkan Layer (Ke Depan)"
                        >
                          <ArrowUp className="h-3.5 w-3.5" />
                        </button>

                        {/* MOVE DOWN */}
                        <button
                          onClick={(e) => moveLayerDown(layer, e)}
                          disabled={index === layers.length - 1 || isBg}
                          className="p-1 rounded text-slate-400 hover:text-slate-800 hover:bg-slate-100 disabled:opacity-20"
                          title="Turunkan Layer (Ke Belakang)"
                        >
                          <ArrowDown className="h-3.5 w-3.5" />
                        </button>

                        {/* LOCK */}
                        <button
                          onClick={(e) => toggleLayerLock(layer, e)}
                          className={`p-1 rounded hover:bg-slate-100 ${layer.locked ? 'text-amber-600' : 'text-slate-400'}`}
                          title={layer.locked ? 'Kunci Dibuka' : 'Kunci Posisi'}
                        >
                          {layer.locked ? <Lock className="h-3.5 w-3.5" /> : <Unlock className="h-3.5 w-3.5" />}
                        </button>

                        {/* VISIBILITY */}
                        <button
                          onClick={(e) => toggleLayerVisibility(layer, e)}
                          className={`p-1 rounded hover:bg-slate-100 ${layer.visible ? 'text-slate-500' : 'text-slate-300'}`}
                          title={layer.visible ? 'Sembunyikan' : 'Tampilkan'}
                        >
                          {layer.visible ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* TIPS HELPER BAWAH */}
              <div className="p-3.5 border-t border-slate-100 bg-slate-50/80 text-[11px] text-slate-500 space-y-1.5">
                <span className="font-bold text-slate-700 block">💡 Efek Layer Seperti Canva:</span>
                <p>1. Klik <strong>🪄 Pisahkan Objek Depan</strong> di kanan atas.</p>
                <p>2. Tekan tombol <strong>⬇️ Turunkan</strong> pada layer teks.</p>
                <p className="text-purple-700 font-bold">➔ Kalimat otomatis berada di belakang figur/orang!</p>
              </div>
            </div>
          )}

          {/* TAB 2: TAMBAH TEKS */}
          {activeTab === 'text' && (
            <div className="p-4 space-y-4">
              <div>
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-800">Tambahkan Teks</h3>
                <p className="text-[11px] text-slate-400">Klik untuk menyisipkan teks yang dapat digeser bebas</p>
              </div>

              <div className="space-y-2.5">
                <button
                  onClick={addTextHeading}
                  className="w-full text-left p-3 rounded-xl border border-slate-200 hover:border-purple-300 hover:bg-purple-50/50 transition-all cursor-pointer group"
                >
                  <span className="block font-black text-base text-slate-900 group-hover:text-purple-700">
                    + Tambah Judul Utama
                  </span>
                  <span className="text-[11px] text-slate-400">Gaya huruf tebal poster (Headline)</span>
                </button>

                <button
                  onClick={addTextBody}
                  className="w-full text-left p-3 rounded-xl border border-slate-200 hover:border-purple-300 hover:bg-purple-50/50 transition-all cursor-pointer group"
                >
                  <span className="block font-bold text-sm text-slate-800 group-hover:text-purple-700">
                    + Tambah Poin Narasi
                  </span>
                  <span className="text-[11px] text-slate-400">Kalimat isi atau paragraf kebijakan</span>
                </button>

                <button
                  onClick={addDimensiCard}
                  className="w-full text-left p-3 rounded-xl border border-slate-200 hover:border-purple-300 hover:bg-purple-50/50 transition-all cursor-pointer group"
                >
                  <span className="block font-bold text-sm text-slate-800 group-hover:text-purple-700">
                    + Kartu Dimensi / Solusi
                  </span>
                  <span className="text-[11px] text-slate-400">Kotak kartu berlatar gelap semi-transparan</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB 3: ELEMEN & KARTU */}
          {activeTab === 'elements' && (
            <div className="p-4 space-y-4">
              <div>
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-800">Elemen Visual</h3>
                <p className="text-[11px] text-slate-400">Sisipkan lencana, kartu, dan bentuk penegas</p>
              </div>

              <div className="space-y-2.5">
                <button
                  onClick={addBadgeShape}
                  className="w-full text-left p-3 rounded-xl border border-slate-200 hover:border-purple-300 hover:bg-purple-50/50 transition-all cursor-pointer group"
                >
                  <span className="block font-bold text-xs uppercase text-amber-700 bg-amber-50 px-2 py-1 rounded inline-block mb-1">
                    ★ Lencana Status
                  </span>
                  <span className="block text-xs font-semibold text-slate-700">Pita penanda poin kunci</span>
                </button>

                <button
                  onClick={addDimensiCard}
                  className="w-full text-left p-3 rounded-xl border border-slate-200 hover:border-purple-300 hover:bg-purple-50/50 transition-all cursor-pointer group"
                >
                  <span className="block font-bold text-xs text-slate-800">Kartu Data Transparan</span>
                  <span className="text-[11px] text-slate-400">Untuk menaruh statistik atau rangkuman</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB 4: MAGIC AI */}
          {activeTab === 'magic' && (
            <div className="p-4 space-y-4">
              <div>
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                  <Sparkles className="h-4 w-4 text-purple-600" />
                  <span>Fitur Cerdas AI</span>
                </h3>
                <p className="text-[11px] text-slate-400">Otomasi pemisahan layer visual seperti di Canva Pro</p>
              </div>

              <div className="space-y-3">
                <div className="p-3.5 rounded-xl border border-purple-200 bg-purple-50/50 space-y-2">
                  <div className="flex items-center gap-2">
                    <Wand2 className="h-4 w-4 text-purple-600" />
                    <span className="text-xs font-bold text-purple-900">Magic Subject Cutout</span>
                  </div>
                  <p className="text-[11px] text-slate-600 leading-relaxed">
                    Mengekstrak manusia atau objek utama ke lapisan depan terpisah sehingga teks judul bisa Anda selipkan di belakang kepala/bahu objek.
                  </p>
                  <Button
                    size="sm"
                    onClick={handleMagicCutout}
                    disabled={isCuttingOut}
                    className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs"
                  >
                    {isCuttingOut ? 'Sedang Memproses AI...' : 'Jalankan Magic Cutout'}
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ─── CENTER CANVAS WORKSPACE (LIGHT CLEAN DESK WITH RATIO-AWARE FIT) ─── */}
        <main
          ref={workspaceRef}
          className="flex-1 bg-[#F1F3F5] relative flex items-center justify-center p-6 overflow-auto"
        >
          {isLoading && (
            <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-white/80 backdrop-blur-xs gap-3">
              <Loader2 className="h-8 w-8 text-purple-600 animate-spin" />
              <span className="text-xs font-bold text-slate-700">Menyiapkan Kanvas Magic Layers...</span>
            </div>
          )}

          {/* POSTER CARD WITH SOFT SHADOW & PRECISE RATIO */}
          <div
            className="relative shadow-2xl rounded-xs ring-1 ring-slate-900/10 bg-white transition-all duration-150"
            style={{
              aspectRatio: `${nativeWidth}/${nativeHeight}`,
            }}
          >
            <canvas ref={canvasElRef} />
          </div>
        </main>

      </div>

    </div>
  );
}
