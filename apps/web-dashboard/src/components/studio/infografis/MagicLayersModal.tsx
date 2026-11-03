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
  archetype?: string;
  publicationId?: string;
  savedLayersJson?: string;
  onApplyChanges: (renderedImageUrl: string, layersJson: string) => void;
}

export type PosterArchetype =
  | 'INFOGRAPHIC_ADVOCACY_PILLARS'
  | 'INFOGRAPHIC_NARRATIVE_WAVE'
  | 'INFOGRAPHIC_CHRONICLE_GRID'
  | 'INFOGRAPHIC_RADIAL_CLOCK'
  | 'INFOGRAPHIC_VISIONARY_TIMELINE'
  | 'GENERIC_INFOGRAPHIC';

/**
 * Deteksi tata letak poster secara cerdas berdasarkan archetype backend atau analisis judul/naskah.
 */
export function detectPosterLayout(
  archetype?: string,
  title?: string,
  subtitle?: string
): PosterArchetype {
  if (archetype) {
    if (archetype === 'INFOGRAPHIC_ADVOCACY_PILLARS') return 'INFOGRAPHIC_ADVOCACY_PILLARS';
    if (archetype === 'INFOGRAPHIC_NARRATIVE_WAVE') return 'INFOGRAPHIC_NARRATIVE_WAVE';
    if (archetype === 'INFOGRAPHIC_CHRONICLE_GRID') return 'INFOGRAPHIC_CHRONICLE_GRID';
    if (archetype === 'INFOGRAPHIC_RADIAL_CLOCK') return 'INFOGRAPHIC_RADIAL_CLOCK';
    if (archetype === 'INFOGRAPHIC_VISIONARY_TIMELINE') return 'INFOGRAPHIC_VISIONARY_TIMELINE';
  }

  const text = `${title || ''} ${subtitle || ''}`.toLowerCase();

  // 1. Poster 5 Pilar Advokasi (Kemiskinan Kota Bandung, Bantuan, APBD, dsb.)
  if (
    text.includes('kemiskinan') ||
    text.includes('5 pilar') ||
    text.includes('pilar aksi') ||
    text.includes('advocacy') ||
    text.includes('apbd') ||
    text.includes('bantuan langsung') ||
    text.includes('indikator')
  ) {
    return 'INFOGRAPHIC_ADVOCACY_PILLARS';
  }

  // 2. Poster Kronik & Rekam Jejak (Biografi Soedirman, Tokoh, Grid Arsip)
  if (
    text.includes('soedirman') ||
    text.includes('sudirman') ||
    text.includes('biografi') ||
    text.includes('guru teladan') ||
    text.includes('purbalingga') ||
    text.includes('kronik') ||
    text.includes('rekam jejak')
  ) {
    return 'INFOGRAPHIC_CHRONICLE_GRID';
  }

  // 3. Poster Jam Melingkar & Tonggak Sejarah (Radial Clock)
  if (
    text.includes('tonggak') ||
    text.includes('radial') ||
    text.includes('jam saku') ||
    text.includes('milestone')
  ) {
    return 'INFOGRAPHIC_RADIAL_CLOCK';
  }

  // 4. Poster Gelombang Naratif 4 Dimensi (Pelatihan Balai Kerja, Pengangguran, dsb.)
  if (
    text.includes('pengangguran') ||
    text.includes('pelatihan') ||
    text.includes('dimensi') ||
    text.includes('balai latihan') ||
    text.includes('gelombang') ||
    text.includes('s-curve')
  ) {
    return 'INFOGRAPHIC_NARRATIVE_WAVE';
  }

  // 5. Garis Waktu Visioner
  if (
    text.includes('visioner') ||
    text.includes('garis waktu') ||
    text.includes('timeline')
  ) {
    return 'INFOGRAPHIC_VISIONARY_TIMELINE';
  }

  return 'GENERIC_INFOGRAPHIC';
}

/**
 * Helper untuk membuat komponen interaktif Canva Fabric.js dengan:
 * - Bingkai ungu Canva (#7D2AE8) yang tegas dan rapi
 * - Latar belakang kartu yang solid (putih/krem)
 * - Teks tajam dengan kontras tinggi (Bukan stroke outline huruf berongga!)
 */
function createCanvaComponent(options: {
  id: string;
  name: string;
  left: number;
  top: number;
  width: number;
  text: string;
  fontSize: number;
  fontFamily?: string;
  fontWeight?: string | number;
  fontStyle?: '' | 'normal' | 'italic';
  textAlign?: 'left' | 'center' | 'right';
  textColor?: string;
  cardBg?: string;
  borderColor?: string;
  borderWidth?: number;
  lineHeight?: number;
  padding?: number;
}): Textbox {
  const tb = new Textbox(options.text, {
    originX: 'left',
    originY: 'top',
    left: options.left,
    top: options.top,
    width: options.width,
    fontSize: options.fontSize,
    fontFamily: options.fontFamily || "'Inter', sans-serif",
    fontWeight: options.fontWeight || 'normal',
    fontStyle: options.fontStyle || 'normal',
    textAlign: options.textAlign || 'left',
    fill: options.textColor || '#0F172A',
    stroke: undefined,
    strokeWidth: 0,
    backgroundColor: options.cardBg || 'rgba(255, 255, 255, 0.96)',
    padding: options.padding ?? 8,
    cornerColor: '#FFFFFF',
    cornerStrokeColor: '#7D2AE8',
    borderColor: '#7D2AE8',
    cornerSize: 8,
    cornerStyle: 'circle',
    transparentCorners: false,
    borderScaleFactor: 2,
    editable: true,
    lineHeight: options.lineHeight || 1.3,
    splitByGrapheme: false,
    shadow: new Shadow({ color: 'rgba(0,0,0,0.06)', blur: 6, offsetX: 0, offsetY: 2 }),
  });

  tb.setCoords();
  (tb as any).customId = options.id;
  (tb as any).customData = {
    name: options.name,
    isCanvaComponent: true,
    cardBg: options.cardBg,
    borderColor: options.borderColor || '#7D2AE8',
    borderWidth: options.borderWidth || 2,
  };

  // Override _renderBackground untuk menggambar garis tepi ungu Canva mengelilingi kartu
  const origRenderBg = tb._renderBackground.bind(tb);
  tb._renderBackground = function (ctx: CanvasRenderingContext2D) {
    origRenderBg(ctx);
    const dim = (this as any)._getNonTransformedDimensions();
    const x = -dim.x / 2;
    const y = -dim.y / 2;
    const w = dim.x;
    const h = dim.y;

    ctx.save();
    ctx.strokeStyle = options.borderColor || '#7D2AE8';
    ctx.lineWidth = options.borderWidth || 2;
    if (typeof (ctx as any).roundRect === 'function') {
      ctx.beginPath();
      (ctx as any).roundRect(x, y, w, h, 6);
      ctx.stroke();
    } else {
      ctx.strokeRect(x, y, w, h);
    }
    ctx.restore();
  };

  return tb;
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
  '#0F172A',
  '#FFFFFF',
  '#EA580C',
  '#C2410C',
  '#1E3A8A',
  '#065F46',
  '#7C3AED',
  '#64748B',
];

const PRESET_BG_COLORS = [
  { label: 'Transparan', value: 'transparent' },
  { label: 'Kertas Krem (#FAF8F5)', value: '#FAF8F5' },
  { label: 'Putih Bersih (#FFFFFF)', value: '#FFFFFF' },
  { label: 'Kartu Putih Transparan (90%)', value: 'rgba(255, 255, 255, 0.92)' },
  { label: 'Oranye Tonggak (#EA580C)', value: '#EA580C' },
  { label: 'Kartu Gelap (#0F172A)', value: 'rgba(15, 23, 42, 0.88)' },
  { label: 'Ungu Canva (#7C3AED)', value: '#7C3AED' },
];

const PRESET_FONTS = [
  { label: 'Inter / Modern Sans', value: "'Inter', sans-serif" },
  { label: 'Bebas Neue (Poster Bold)', value: "'Bebas Neue', sans-serif" },
  { label: 'Montserrat (Geometris)', value: "'Montserrat', sans-serif" },
  { label: 'Playfair Display (Serif)', value: "'Playfair Display', serif" },
  { label: 'Plus Jakarta Sans', value: "'Plus Jakarta Sans', sans-serif" },
  { label: 'System Default', value: 'system-ui, sans-serif' },
  { label: 'Monospace', value: 'monospace' },
];

/**
 * Normalisasi URL untuk mengatasi batasan CORS antarlocalhost (3000 vs 4000).
 * Mengembalikan URL absolut yang aman diakses dari browser / web worker.
 */
function resolveSafeImageUrl(url: string): string {
  if (!url) return '';
  const uploadsIdx = url.indexOf('/uploads/');
  if (uploadsIdx !== -1) {
    const relativePath = url.substring(uploadsIdx);
    if (typeof window !== 'undefined') {
      return `${window.location.origin}${relativePath}`;
    }
    return relativePath;
  }
  if (typeof window !== 'undefined' && url.startsWith('/')) {
    return `${window.location.origin}${url}`;
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

/**
 * Menghasilkan gambar latar belakang yang BERSIH dari kartu & teks berdasarkan tata letak archetype.
 * - Foto kolase warga, foto dokumentasi, dan ornamen penting dipertahankan 100% utuh.
 * - Area kartu dan teks dibersihkan dengan warna kertas asli poster sehingga saat kartu digeser, tidak ada bayangan/duplikat kartu lama.
 */
async function createCleanPosterBackground(
  rawImageUrl: string,
  naturalW: number,
  naturalH: number,
  archetype: PosterArchetype
): Promise<string> {
  const safeUrl = resolveSafeImageUrl(rawImageUrl);

  return new Promise((resolve) => {
    (async () => {
      let objectUrlToUse = safeUrl;
      let blobCreated = false;

      try {
        const response = await fetch(safeUrl);
        if (response.ok) {
          const blob = await response.blob();
          if (blob.type.startsWith('image/')) {
            objectUrlToUse = URL.createObjectURL(blob);
            blobCreated = true;
          }
        }
      } catch (e) {
        console.warn('[MagicLayers] fetch blob untuk clean background gagal, mencoba direct img:', e);
      }

      const img = new Image();
      img.crossOrigin = 'anonymous';

      img.onload = () => {
        try {
          const offCanvas = document.createElement('canvas');
          offCanvas.width = naturalW;
          offCanvas.height = naturalH;
          const ctx = offCanvas.getContext('2d');
          if (!ctx) {
            if (blobCreated) URL.revokeObjectURL(objectUrlToUse);
            resolve(safeUrl);
            return;
          }

          // 1. Gambar seluruh poster asli
          ctx.drawImage(img, 0, 0, naturalW, naturalH);

          // 2. Ambil sampel warna background kertas di margin kanan atas
          let paperColor = '#FAF8F5';
          try {
            const sampleX = Math.min(naturalW - 25, Math.floor(naturalW * 0.96));
            const sampleY = Math.floor(naturalH * 0.40);
            const pixel = ctx.getImageData(sampleX, sampleY, 1, 1).data;
            if (pixel[3] > 200 && pixel[0] > 180 && pixel[1] > 180) {
              paperColor = `rgb(${pixel[0]}, ${pixel[1]}, ${pixel[2]})`;
            }
          } catch {}

          // 3. Bersihkan area kartu & teks berdasarkan archetype yang terdeteksi
          if (archetype === 'INFOGRAPHIC_ADVOCACY_PILLARS') {
            // Header box: 4.5% s/d 95.5%, y: 5.0% s/d 17.5%
            ctx.fillStyle = paperColor;
            ctx.fillRect(naturalW * 0.045, naturalH * 0.050, naturalW * 0.910, naturalH * 0.125);
            // 4 Baris KPI: y: 17.5% s/d 26.2%
            ctx.fillRect(naturalW * 0.045, naturalH * 0.175, naturalW * 0.910, naturalH * 0.088);
            // CATATAN: SISI TENGAH (FOTO WARGA BANDUNG) 100% UTUH! (y: 26.5% s/d 48.0%)
            // 5 Kartu Pilar Aksi: y: 48.0% s/d 86.5%
            ctx.fillRect(naturalW * 0.045, naturalH * 0.480, naturalW * 0.910, naturalH * 0.385);
            // Closing banner & footer: y: 86.5% s/d 96.5%
            ctx.fillRect(naturalW * 0.045, naturalH * 0.865, naturalW * 0.910, naturalH * 0.100);
          } else if (archetype === 'INFOGRAPHIC_CHRONICLE_GRID') {
            // Kolom kanan berisi grid 6 kartu rekam jejak
            ctx.fillStyle = paperColor;
            ctx.fillRect(naturalW * 0.370, naturalH * 0.030, naturalW * 0.590, naturalH * 0.935);
          } else if (archetype === 'INFOGRAPHIC_RADIAL_CLOCK') {
            // Header Box atas
            ctx.fillStyle = paperColor;
            ctx.fillRect(naturalW * 0.045, naturalH * 0.052, naturalW * 0.910, naturalH * 0.128);
            // Kolom kartu kanan (3 KPI + 5 Tonggak + Sintesis)
            ctx.fillRect(naturalW * 0.470, naturalH * 0.182, naturalW * 0.490, naturalH * 0.755);
            // Footer
            ctx.fillRect(naturalW * 0.045, naturalH * 0.940, naturalW * 0.910, naturalH * 0.045);
          } else if (archetype === 'INFOGRAPHIC_NARRATIVE_WAVE') {
            // Header box
            ctx.fillStyle = paperColor;
            ctx.fillRect(naturalW * 0.075, naturalH * 0.050, naturalW * 0.850, naturalH * 0.180);
            // 4 Baris KPI
            ctx.fillRect(naturalW * 0.090, naturalH * 0.230, naturalW * 0.820, naturalH * 0.080);
            // 4 Slot kartu Dimensi zigzag
            ctx.fillRect(naturalW * 0.495, naturalH * 0.315, naturalW * 0.430, naturalH * 0.130);
            ctx.fillRect(naturalW * 0.075, naturalH * 0.450, naturalW * 0.430, naturalH * 0.130);
            ctx.fillRect(naturalW * 0.495, naturalH * 0.585, naturalW * 0.430, naturalH * 0.130);
            ctx.fillRect(naturalW * 0.075, naturalH * 0.720, naturalW * 0.430, naturalH * 0.130);
            // Penutup & Footer
            ctx.fillRect(naturalW * 0.075, naturalH * 0.855, naturalW * 0.850, naturalH * 0.115);
          } else {
            // Generic Fallback
            ctx.fillStyle = paperColor;
            ctx.fillRect(naturalW * 0.050, naturalH * 0.050, naturalW * 0.900, naturalH * 0.180);
            ctx.fillRect(naturalW * 0.050, naturalH * 0.850, naturalW * 0.900, naturalH * 0.110);
          }

          const cleanDataUrl = offCanvas.toDataURL('image/png');
          if (blobCreated) URL.revokeObjectURL(objectUrlToUse);
          resolve(cleanDataUrl);
        } catch (canvasErr) {
          console.warn('[MagicLayers] Error saat memproses canvas clean background:', canvasErr);
          if (blobCreated) URL.revokeObjectURL(objectUrlToUse);
          resolve(safeUrl);
        }
      };

      img.onerror = () => {
        if (blobCreated) URL.revokeObjectURL(objectUrlToUse);
        resolve(safeUrl);
      };

      img.src = objectUrlToUse;
    })();
  });
}

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
  onApplyChanges,
}: MagicLayersModalProps) {
  const { toast } = useToast();
  const canvasElRef = useRef<HTMLCanvasElement | null>(null);
  const fabricRef = useRef<FabricCanvas | null>(null);
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
  const [isCuttingOut, setIsCuttingOut] = useState(false);
  const [cutoutSuccess, setCutoutSuccess] = useState(false);
  const [hasGrabbedText, setHasGrabbedText] = useState(false);

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
      setBgColor(typeof obj.backgroundColor === 'string' ? obj.backgroundColor : 'transparent');
      setIsBold(obj.fontWeight === 'bold' || (typeof obj.fontWeight === 'number' && obj.fontWeight >= 700));
      setIsItalic(obj.fontStyle === 'italic');
      setTextAlign((obj.textAlign as any) || 'left');
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

    const paddingX = 48;
    const paddingY = 48;
    const availW = Math.max(100, clientWidth - paddingX);
    const availH = Math.max(100, clientHeight - paddingY);

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

    let observer: ResizeObserver | null = null;
    if (workspaceRef.current) {
      observer = new ResizeObserver(() => updateResponsiveFit());
      observer.observe(workspaceRef.current);
    }

    return () => {
      window.removeEventListener('resize', updateResponsiveFit);
      observer?.disconnect();
    };
  }, [isOpen, updateResponsiveFit]);

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
      } catch {}
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
          backgroundColor: '#FAF8F5',
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
        });
        canvas.on('object:added', () => refreshLayersList(canvas));
        canvas.on('object:removed', () => refreshLayersList(canvas));
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
            canvas.renderAll();
            if (!isDisposed) {
              refreshLayersList(canvas);
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
        } catch {}
        fabricRef.current = null;
      }
    };
  }, [isOpen, imageUrl, savedLayersJson]);

  // ─── 🪄 TRIGGER CANVA MAGIC LAYERS WITH LASER SCANNING ANIMATION ───
  const handleTriggerMagicLayers = async () => {
    if (!fabricRef.current || isScanning || isDecomposed) return;
    setIsScanning(true);

    try {
      const canvas = fabricRef.current;
      const { width: naturalW, height: naturalH } = canvasNaturalSizeRef.current;

      // 1. Deteksi tata letak poster secara cerdas
      const layoutArchetype = detectPosterLayout(archetype, initialTitle, initialSubtitle);

      // 2. Bersihkan latar belakang kanvas secara proporsional sesuai layout
      const cleanBgUrl = await createCleanPosterBackground(
        imageUrl,
        naturalW,
        naturalH,
        layoutArchetype
      );

      // 3. Durasi animasi scanning laser menyapu kanvas (1.6 detik)
      await new Promise((resolve) => setTimeout(resolve, 1600));

      // 4. Perbarui latar belakang kanvas dengan poster bersih agar saat kartu digeser, tidak berbekas
      const cleanImg = await loadResilientFabricImage(cleanBgUrl);
      const existingBg = canvas.getObjects().find((o) => (o as any).customData?.isBackground);
      if (existingBg) {
        canvas.remove(existingBg);
      }
      cleanImg.set({
        originX: 'left',
        originY: 'top',
        left: 0,
        top: 0,
        scaleX: naturalW / (cleanImg.width || naturalW),
        scaleY: naturalH / (cleanImg.height || naturalH),
        selectable: false,
        evented: false,
      });
      cleanImg.setCoords();
      (cleanImg as any).customId = 'layer_background';
      (cleanImg as any).customData = { name: 'Poster Bersih (Latar Belakang)', isBackground: true };
      canvas.add(cleanImg);
      canvas.sendObjectToBack(cleanImg);

      // 5. URAI KOMPONEN SESUAI TATA LETAK & KONTEN POSTER ASLI
      if (layoutArchetype === 'INFOGRAPHIC_ADVOCACY_PILLARS') {
        // ─── POSTER 5 PILAR ADVOKASI (KEMISKINAN KOTA BANDUNG) ───
        
        // 1. Top Bar Tag Header
        const topTag = createCanvaComponent({
          id: `box_toptag_${Date.now()}`,
          name: 'Top Tag: POLARIS // DAPIL JABAR',
          left: Math.round(naturalW * 0.045),
          top: Math.round(naturalH * 0.020),
          width: Math.round(naturalW * 0.910),
          text: 'POLARIS // DAPIL JABAR                       DOKUMEN ADVOKASI PUBLIK',
          fontSize: Math.round(naturalW * 0.012),
          textColor: '#64748B',
          fontWeight: 'bold',
          cardBg: 'transparent',
          padding: 4,
        });
        canvas.add(topTag);

        // 2. Masthead Box (Kicker + Judul Utama)
        const headlineText = (initialTitle || 'KEMISKINAN DI KOTA BANDUNG DEMI TANTANGAN KITA').toUpperCase();
        const masthead = createCanvaComponent({
          id: `box_masthead_${Date.now()}`,
          name: 'Judul Utama: Kemiskinan Kota Bandung',
          left: Math.round(naturalW * 0.045),
          top: Math.round(naturalH * 0.052),
          width: Math.round(naturalW * 0.910),
          text: `DATA KEMISKINAN DI JABAR // ANALISIS STRATEGIS\n${headlineText}`,
          fontSize: Math.round(naturalW * 0.034),
          fontFamily: "'Bebas Neue', 'Inter', sans-serif",
          fontWeight: 'bold',
          textColor: '#0F172A',
          cardBg: '#FFFFFF',
          lineHeight: 1.15,
          padding: 10,
        });
        canvas.add(masthead);

        // 3. Subjudul & Narasi Ringkasan
        const deckText = initialSubtitle || 'Infografik Publik: KEMISKINAN DI KOTA BANDUNG DEMI TANTANGAN KITA';
        const deck = createCanvaComponent({
          id: `box_deck_${Date.now()}`,
          name: 'Subjudul & Narasi Isu',
          left: Math.round(naturalW * 0.045),
          top: Math.round(naturalH * 0.138),
          width: Math.round(naturalW * 0.910),
          text: deckText,
          fontSize: Math.round(naturalW * 0.013),
          fontFamily: "'Playfair Display', serif",
          fontStyle: 'italic',
          textColor: '#475569',
          cardBg: 'transparent',
          padding: 6,
        });
        canvas.add(deck);

        // 4. 4 Kotak Metrik KPI Kemiskinan
        const statsPoverty = [
          { val: '9,3%', lbl: 'PERSENTASE PENDUDUK MISKIN', left: 0.045 },
          { val: 'RP 1 TRILIUN', lbl: 'TOTAL ANGGARAN PENGENTASAN', left: 0.278 },
          { val: '15 KELURAHAN', lbl: 'KONSENTRASI WILAYAH TERBANYAK', left: 0.511 },
          { val: '50%', lbl: 'TARGET PENGURANGAN KEMISKINAN', left: 0.744 },
        ];
        statsPoverty.forEach((st, idx) => {
          const statBox = createCanvaComponent({
            id: `box_stat_${idx}_${Date.now()}`,
            name: `Metrik 0${idx + 1}: ${st.val}`,
            left: Math.round(naturalW * st.left),
            top: Math.round(naturalH * 0.178),
            width: Math.round(naturalW * 0.211),
            text: `${st.val}\n${st.lbl}`,
            fontSize: Math.round(naturalW * 0.018),
            fontWeight: 'bold',
            textAlign: 'center',
            textColor: '#B91C1C',
            cardBg: '#FFFFFF',
            padding: 8,
            lineHeight: 1.25,
          });
          canvas.add(statBox);
        });

        // 5. Banner Section Tag
        const sectionTag = createCanvaComponent({
          id: `box_section_tag_${Date.now()}`,
          name: 'Banner: PILAR AKSI & ADVOKASI',
          left: Math.round(naturalW * 0.045),
          top: Math.round(naturalH * 0.485),
          width: Math.round(naturalW * 0.320),
          text: 'PILAR AKSI & ADVOKASI BERKELANJUTAN',
          fontSize: Math.round(naturalW * 0.011),
          fontWeight: 'bold',
          textAlign: 'center',
          textColor: '#FFFFFF',
          cardBg: '#DC2626',
          padding: 6,
        });
        canvas.add(sectionTag);

        // 6. 5 Kartu Kolom Pilar Aksi
        const pillars = [
          {
            badge: '◈ 01',
            title: '3 KEBIJAKAN STRATEGIS',
            desc: 'Pemerintah Kota Bandung meluncurkan 3 kebijakan strategis untuk mengurangi kemiskinan; pendidikan, kesehatan dan pemberdayaan ekonomi dengan alokasi Rp 500 miliar.',
            tag: '✦ INDIKATOR 01',
            left: 0.045,
          },
          {
            badge: '◈ 02',
            title: '5.000 KELUARGA BANTUAN',
            desc: 'Sebanyak 5.000 keluarga miskin menerima bantuan langsung tunai sebesar Rp 1 juta per tahun untuk meningkatkan daya beli dan akses terhadap kebutuhan dasar.',
            tag: '✦ INDIKATOR 02',
            left: 0.228,
          },
          {
            badge: '◈ 03',
            title: 'TARGET PENDIDIKAN 2024',
            desc: 'Meningkatkan anggaran pendidikan hingga 20% dari APBD untuk memastikan anak-anak usia sekolah mendapatkan akses pendidikan yang layak.',
            tag: '✦ INDIKATOR 03',
            left: 0.411,
          },
          {
            badge: '◈ 04',
            title: 'PROGRAM KEWIRAUSAHAAN',
            desc: 'Meluncurkan program pelatihan wirausaha dengan target 2.000 UMKM baru yang didukung dengan pelatihan dan akses modal.',
            tag: '✦ INDIKATOR 04',
            left: 0.594,
          },
          {
            badge: '◈ 05',
            title: 'AUDIT KEBIJAKAN TAHUNAN',
            desc: 'Melakukan audit tahunan terhadap semua program pengentasan kemiskinan guna memastikan transparansi dan akuntabilitas penggunaan anggaran.',
            tag: '✦ INDIKATOR 05',
            left: 0.777,
          },
        ];
        pillars.forEach((p, idx) => {
          const card = createCanvaComponent({
            id: `box_pillar_${idx}_${Date.now()}`,
            name: `Pilar 0${idx + 1}: ${p.title}`,
            left: Math.round(naturalW * p.left),
            top: Math.round(naturalH * 0.520),
            width: Math.round(naturalW * 0.178),
            text: `${p.badge}\n${p.title}\n\n${p.desc}\n\n${p.tag}`,
            fontSize: Math.round(naturalW * 0.010),
            fontFamily: "'Inter', sans-serif",
            textColor: '#1E293B',
            cardBg: '#FFFFFF',
            padding: 8,
            lineHeight: 1.3,
          });
          canvas.add(card);
        });

        // 7. Closing Takeaway Banner
        const closingBanner = createCanvaComponent({
          id: `box_closing_${Date.now()}`,
          name: 'Sintesis Penutup Kebijakan',
          left: Math.round(naturalW * 0.045),
          top: Math.round(naturalH * 0.868),
          width: Math.round(naturalW * 0.910),
          text: 'Transparansi dan kolaborasi antara pemerintah dan masyarakat kunci dalam mengatasi kemiskinan di Kota Bandung.',
          fontSize: Math.round(naturalW * 0.012),
          fontWeight: 'bold',
          textAlign: 'center',
          textColor: '#0F172A',
          cardBg: 'rgba(255, 255, 255, 0.95)',
          padding: 8,
        });
        canvas.add(closingBanner);

        // 8. Footer Bar
        const footerBar = createCanvaComponent({
          id: `box_footer_${Date.now()}`,
          name: 'Identitas Dewan (Footer)',
          left: Math.round(naturalW * 0.045),
          top: Math.round(naturalH * 0.925),
          width: Math.round(naturalW * 0.910),
          text: initialAuthor || 'DR. JONANDA P. A. B • Golkar // DPRD PROVINSI • DAPIL JABAR                      2026',
          fontSize: Math.round(naturalW * 0.012),
          fontWeight: 'bold',
          textColor: '#0F172A',
          cardBg: 'rgba(255, 255, 255, 0.95)',
          padding: 6,
        });
        canvas.add(footerBar);

      } else if (layoutArchetype === 'INFOGRAPHIC_CHRONICLE_GRID') {
        // ─── POSTER KRONIK & REKAM JEJAK (SOEDIRMAN) ───

        // 1. Masthead Kiri Oranye
        const leftMasthead = createCanvaComponent({
          id: `box_soedirman_masthead_${Date.now()}`,
          name: 'Banner Masthead Tokoh',
          left: Math.round(naturalW * 0.045),
          top: Math.round(naturalH * 0.035),
          width: Math.round(naturalW * 0.315),
          text: 'SOEDIRMAN\n\nSANG GURU TELADAN YANG MENJADI JENDERAL BESAR BANGSA INDONESIA\n\nRaden Soedirman\nLahir 24 Januari 1916 di Purbalingga.',
          fontSize: Math.round(naturalW * 0.018),
          fontFamily: "'Bebas Neue', 'Inter', sans-serif",
          fontWeight: 'bold',
          textColor: '#FFFFFF',
          cardBg: 'rgba(234, 88, 12, 0.92)',
          padding: 12,
          lineHeight: 1.3,
        });
        canvas.add(leftMasthead);

        // 2. 6 Kartu Rekam Jejak Kolom Kanan
        const chronicleCards = [
          { title: 'RIWAYAT PENDIDIKAN', text: 'Riwayat pendidikan yang tidak berjalan dengan lancar karena kendala ekonomi.', top: 0.035 },
          { title: 'GURU TELADAN (1936)', text: 'Menjadi seorang guru di H.I.S Muhammadiyah Cilacap pada tahun 1936.', top: 0.185 },
          { title: 'MILITER PETA', text: 'Masuk ke militer di PETA dan membuktikan kepemimpinan hingga menjadi seorang Jenderal Besar.', top: 0.335 },
          { title: 'PERANG GERILYA', text: 'Menjadi pemimpin perang Gerilya yang tangguh dalam mempertahankan kemerdekaan Indonesia.', top: 0.485 },
          { title: 'DITENGAH SAKIT', text: 'Didiagnosa menderita tuberkulosis namun tetap memimpin pasukan dengan ditandu masuk keluar hutan.', top: 0.650 },
          { title: 'AKHIR HAYAT', text: 'Wafat setelah Belanda resmi mengakui kedaulatan penuh Republik Indonesia.', top: 0.800 },
        ];

        chronicleCards.forEach((c, idx) => {
          const card = createCanvaComponent({
            id: `box_chronicle_${idx}_${Date.now()}`,
            name: `Rekam Jejak 0${idx + 1}: ${c.title}`,
            left: Math.round(naturalW * 0.380),
            top: Math.round(naturalH * c.top),
            width: Math.round(naturalW * 0.575),
            text: `${c.title}\n\n${c.text}`,
            fontSize: Math.round(naturalW * 0.012),
            textColor: '#1E293B',
            cardBg: '#FFFFFF',
            padding: 10,
            lineHeight: 1.35,
          });
          canvas.add(card);
        });

      } else if (layoutArchetype === 'INFOGRAPHIC_RADIAL_CLOCK') {
        // ─── POSTER JAM MELINGKAR / TONGGAK TIER (RADIAL CLOCK) ───

        // 1. Header Box Atas
        const titleText = (initialTitle || 'PENURUNAN PENGANGGURAN MELALUI PELATIHAN').toUpperCase();
        const headerCard = createCanvaComponent({
          id: `box_radial_header_${Date.now()}`,
          name: 'Judul Utama (Masthead)',
          left: Math.round(naturalW * 0.045),
          top: Math.round(naturalH * 0.052),
          width: Math.round(naturalW * 0.910),
          text: `DATA PELATIHAN KERJA // ANALISIS KEBIJAKAN\n${titleText}`,
          fontSize: Math.round(naturalW * 0.034),
          fontWeight: 'bold',
          textColor: '#0F172A',
          cardBg: '#FFFFFF',
          padding: 10,
        });
        canvas.add(headerCard);

        // 2. 3 KPI Stats di Atas Sayap Kanan
        const statsRadial = [
          { val: '10%', lbl: 'PENURUNAN PENGANGGURAN', left: 0.470, w: 0.155 },
          { val: 'RP 200 MILIAR', lbl: 'TOTAL ANGGARAN PELATIHAN', left: 0.635, w: 0.165 },
          { val: '8 KOTA', lbl: 'KONSENTRASI DI JABAR', left: 0.810, w: 0.145 },
        ];
        statsRadial.forEach((st, idx) => {
          const sBox = createCanvaComponent({
            id: `box_radial_stat_${idx}_${Date.now()}`,
            name: `Stat ${st.val}`,
            left: Math.round(naturalW * st.left),
            top: Math.round(naturalH * 0.185),
            width: Math.round(naturalW * st.w),
            text: `${st.val}\n${st.lbl}`,
            fontSize: Math.round(naturalW * 0.014),
            fontWeight: 'bold',
            textAlign: 'center',
            textColor: '#EA580C',
            cardBg: '#FFFFFF',
            padding: 6,
          });
          canvas.add(sBox);
        });

        // 3. 5 Kartu Tonggak Sayap Kanan
        const milestones = [
          { title: 'TONGGAK 01: 15.000 PESERTA PELATIHAN', desc: 'Balai Latihan Kerja telah melatih 15.000 peserta dengan kurikulum industri.', top: 0.265 },
          { title: 'TONGGAK 02: RP 200 MILIAR DIANGGARKAN', desc: 'Pemerintah Provinsi mengalokasikan anggaran untuk peningkatan fasilitas BLK.', top: 0.390 },
          { title: 'TONGGAK 03: 8 KOTA PRIORITAS', desc: 'Pelatihan diprioritaskan di daerah dengan tingkat pengangguran terbuka tinggi.', top: 0.515 },
          { title: 'TONGGAK 04: 95% PENYERAPAN TENAGA KERJA', desc: 'Lulusan bersertifikasi berhasil diserap langsung ke sektor industri terkemuka.', top: 0.640 },
          { title: 'TONGGAK 05: PROGRAM KERJA SAMA INDUSTRI', desc: 'Membangun kemitraan dengan 50 perusahaan manufaktur dan digital terkemuka.', top: 0.765 },
        ];
        milestones.forEach((m, idx) => {
          const mCard = createCanvaComponent({
            id: `box_milestone_${idx}_${Date.now()}`,
            name: `Tonggak 0${idx + 1}`,
            left: Math.round(naturalW * 0.470),
            top: Math.round(naturalH * m.top),
            width: Math.round(naturalW * 0.490),
            text: `${m.title}\n${m.desc}`,
            fontSize: Math.round(naturalW * 0.012),
            textColor: '#1E293B',
            cardBg: '#FFFFFF',
            padding: 8,
          });
          canvas.add(mCard);
        });

        // 4. Sintesis Kebijakan
        const synthCard = createCanvaComponent({
          id: `box_radial_synth_${Date.now()}`,
          name: 'Sintesis Kebijakan',
          left: Math.round(naturalW * 0.470),
          top: Math.round(naturalH * 0.890),
          width: Math.round(naturalW * 0.490),
          text: 'SINTESIS KEBIJAKAN\nPenting untuk terus mengevaluasi efektivitas program guna memastikan akuntabilitas anggaran.',
          fontSize: Math.round(naturalW * 0.010),
          textColor: '#0F172A',
          cardBg: '#FFFFFF',
          padding: 6,
        });
        canvas.add(synthCard);

        // 5. Footer
        const footerCard = createCanvaComponent({
          id: `box_radial_footer_${Date.now()}`,
          name: 'Footer',
          left: Math.round(naturalW * 0.045),
          top: Math.round(naturalH * 0.945),
          width: Math.round(naturalW * 0.910),
          text: initialAuthor || 'DR. JONANDA P. A. B // DPRD PROVINSI • DAPIL JABAR                      2026',
          fontSize: Math.round(naturalW * 0.012),
          fontWeight: 'bold',
          textColor: '#0F172A',
          cardBg: 'rgba(255, 255, 255, 0.95)',
          padding: 4,
        });
        canvas.add(footerCard);

      } else {
        // ─── POSTER GELOMBANG NARATIF 4 DIMENSI (NARRATIVE WAVE & DEFAULT) ───

        // 1. Top Bar Tag Header
        const topTag = createCanvaComponent({
          id: `box_toptag_${Date.now()}`,
          name: 'Top Tag: POLARIS // DAPIL JABAR',
          left: Math.round(naturalW * 0.082),
          top: Math.round(naturalH * 0.022),
          width: Math.round(naturalW * 0.836),
          text: 'POLARIS // DAPIL JABAR                       DOKUMEN ADVOKASI PUBLIK',
          fontSize: Math.round(naturalW * 0.012),
          textColor: '#64748B',
          fontWeight: 'bold',
          cardBg: 'transparent',
          padding: 4,
        });
        canvas.add(topTag);

        // 2. Headline Masthead
        const titleText = (initialTitle || 'PENURUNAN PENGANGGURAN MELALUI PELATIHAN').toUpperCase();
        const headlineBox = createCanvaComponent({
          id: `box_headline_${Date.now()}`,
          name: 'Judul Utama (Headline)',
          left: Math.round(naturalW * 0.082),
          top: Math.round(naturalH * 0.068),
          width: Math.round(naturalW * 0.836),
          text: `DATA PELATIHAN KERJA // STRATEGI EKONOMI\n${titleText}`,
          fontSize: Math.round(naturalW * 0.034),
          fontWeight: 'bold',
          textColor: '#0F172A',
          cardBg: '#FFFFFF',
          padding: 10,
        });
        canvas.add(headlineBox);

        // 3. Subjudul / Deck
        const deckText = initialSubtitle || 'Program pelatihan di Balai Latihan Kerja Jawa Barat berhasil menurunkan angka pengangguran terbuka sebesar 12,5% di Kota Bandung. Dengan alokasi anggaran Rp 300 miliar, program ini mendukung 10.000 peserta pelatihan setiap tahun.';
        const deckBox = createCanvaComponent({
          id: `box_deck_${Date.now()}`,
          name: 'Subjudul & Narasi',
          left: Math.round(naturalW * 0.082),
          top: Math.round(naturalH * 0.156),
          width: Math.round(naturalW * 0.836),
          text: deckText,
          fontSize: Math.round(naturalW * 0.013),
          textColor: '#334155',
          cardBg: 'rgba(255, 255, 255, 0.90)',
          padding: 8,
          lineHeight: 1.35,
        });
        canvas.add(deckBox);

        // 4. 4 Kotak Metrik KPI
        const kpis = [
          { left: 0.100, text: '12,5%\nPENURUNAN PENGANGGURAN', name: 'Metrik 12,5%' },
          { left: 0.305, text: 'RP 300 MILIAR\nTOTAL ANGGARAN', name: 'Metrik Rp 300 Miliar' },
          { left: 0.510, text: '10.000 PESERTA\nKONSENTRASI PELATIHAN', name: 'Metrik 10.000 Peserta' },
          { left: 0.715, text: '95%\nTINGKAT PENYERAPAN', name: 'Metrik 95%' },
        ];
        kpis.forEach((k, idx) => {
          const kBox = createCanvaComponent({
            id: `box_kpi_${idx}_${Date.now()}`,
            name: k.name,
            left: Math.round(naturalW * k.left),
            top: Math.round(naturalH * 0.244),
            width: Math.round(naturalW * 0.185),
            text: k.text,
            fontSize: Math.round(naturalW * 0.011),
            fontWeight: 'bold',
            textAlign: 'center',
            textColor: '#065F46',
            cardBg: '#FFFFFF',
            padding: 6,
          });
          canvas.add(kBox);
        });

        // 5. 4 Kartu Dimensi (Pola Zig-zag Alternating)
        const dimensiCards = [
          {
            left: 0.505,
            top: 0.325,
            text: 'DIMENSI 01: 5 BALAI LATIHAN KERJA\n\nTerdapat 5 Balai Latihan Kerja di Kota Bandung yang menyediakan berbagai program pelatihan sesuai kebutuhan industri lokal.',
            name: 'Kartu Dimensi 01',
          },
          {
            left: 0.082,
            top: 0.460,
            text: 'DIMENSI 02: 60% PESERTA BERSERTIFIKAT\n\nDari total peserta, 60% berhasil mendapatkan sertifikat kompetensi yang diakui industri, meningkatkan daya saing di pasar kerja.',
            name: 'Kartu Dimensi 02',
          },
          {
            left: 0.505,
            top: 0.595,
            text: 'DIMENSI 03: 3 SEKTOR PRIORITAS\n\nPelatihan difokuskan pada 3 sektor prioritas: teknologi informasi, industri kreatif dan manufaktur untuk mendukung pertumbuhan ekonomi.',
            name: 'Kartu Dimensi 03',
          },
          {
            left: 0.082,
            top: 0.730,
            text: 'DIMENSI 04: 30% PENINGKATAN KETERAMPILAN\n\nPeserta pelatihan menunjukkan peningkatan keterampilan sebesar 30% setelah mengikuti program, berdasarkan evaluasi pasca-pelatihan.',
            name: 'Kartu Dimensi 04',
          },
        ];
        dimensiCards.forEach((c, idx) => {
          const cBox = createCanvaComponent({
            id: `box_dimensi_${idx}_${Date.now()}`,
            name: c.name,
            left: Math.round(naturalW * c.left),
            top: Math.round(naturalH * c.top),
            width: Math.round(naturalW * 0.413),
            text: c.text,
            fontSize: Math.round(naturalW * 0.012),
            textColor: '#1E293B',
            cardBg: '#FFFFFF',
            padding: 8,
            lineHeight: 1.35,
          });
          canvas.add(cBox);
        });

        // 6. Sintesis Kebijakan
        const policyBox = createCanvaComponent({
          id: `box_policy_${Date.now()}`,
          name: 'Sintesis Kebijakan',
          left: Math.round(naturalW * 0.082),
          top: Math.round(naturalH * 0.865),
          width: Math.round(naturalW * 0.836),
          text: 'Penting untuk terus memantau dan mengevaluasi efektivitas program pelatihan guna memastikan transparansi dan akuntabilitas dalam pengelolaan anggaran.',
          fontSize: Math.round(naturalW * 0.011),
          textColor: '#0F172A',
          cardBg: 'rgba(255, 255, 255, 0.95)',
          padding: 6,
        });
        canvas.add(policyBox);

        // 7. Footer
        const footerBox = createCanvaComponent({
          id: `box_footer_${Date.now()}`,
          name: 'Identitas Dewan (Footer)',
          left: Math.round(naturalW * 0.082),
          top: Math.round(naturalH * 0.925),
          width: Math.round(naturalW * 0.836),
          text: initialAuthor || 'DR. JONANDA P. A. B // DPRD PROVINSI • DAPIL JABAR                      2026',
          fontSize: Math.round(naturalW * 0.012),
          fontWeight: 'bold',
          textColor: '#0F172A',
          cardBg: 'rgba(255, 255, 255, 0.95)',
          padding: 6,
        });
        canvas.add(footerBox);
      }

      canvas.renderAll();
      refreshLayersList(canvas);
      setIsDecomposed(true);

      toast({
        type: 'success',
        title: 'Magic Layers Berhasil Diurai!',
        description: 'Seluruh kartu, teks, dan metrik telah terurai menjadi komponen Canva mandiri yang dapat digeser dan diedit.',
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
      const cutoutUrl = URL.createObjectURL(blob);

      const cutoutImg = await loadResilientFabricImage(cutoutUrl);
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

  // ─── 🪄 URAI TEKS MENJADI LAYER INTERAKTIF (CANVA GRAB TEXT) ───
  const handleGrabText = () => {
    if (!fabricRef.current) return;
    const canvas = fabricRef.current;
    const { width: w, height: h } = canvasNaturalSizeRef.current;

    const titleText = initialTitle || 'PENURUNAN PENGANGGURAN MELALUI PELATIHAN';

    // 1. Layer Judul Utama yang rapi dan sesuai gaya poster Gambar 2
    const headline = new Textbox(titleText.toUpperCase(), {
      originX: 'left',
      originY: 'top',
      left: w * 0.07,
      top: h * 0.08,
      width: w * 0.86,
      fontSize: Math.round(w * 0.042),
      fontFamily: "'Inter', sans-serif",
      fontWeight: 'bold',
      fill: '#0F172A',
      backgroundColor: '#FAF8F5',
      padding: 6,
      editable: true,
      shadow: new Shadow({ color: 'rgba(0,0,0,0.1)', blur: 4, offsetX: 0, offsetY: 1 }),
    });
    headline.setCoords();
    (headline as any).customId = `grabbed_headline_${Date.now()}`;
    (headline as any).customData = { name: 'Judul Utama (Dapat Diedit)' };
    canvas.add(headline);

    // 2. Kartu Tonggak Pembahasan (Gaya Kartu Putih & Badge Oranye persis Gambar 2)
    const cardTonggak = new Textbox('TONGGAK 01: 15.000 PESERTA PELATIHAN\nBalai Latihan Kerja telah melatih 15.000 peserta dengan kurikulum kebutuhan industri.', {
      originX: 'left',
      originY: 'top',
      left: w * 0.50,
      top: h * 0.28,
      width: w * 0.44,
      fontSize: Math.round(w * 0.018),
      fontFamily: "'Inter', sans-serif",
      fontWeight: 'normal',
      fill: '#1E293B',
      backgroundColor: '#FFFFFF',
      padding: 10,
      editable: true,
      shadow: new Shadow({ color: 'rgba(0,0,0,0.12)', blur: 8, offsetX: 0, offsetY: 2 }),
    });
    cardTonggak.setCoords();
    (cardTonggak as any).customId = `grabbed_tonggak_${Date.now()}`;
    (cardTonggak as any).customData = { name: 'Kartu Tonggak (Dapat Diedit)' };
    canvas.add(cardTonggak);

    canvas.setActiveObject(headline);
    canvas.renderAll();
    refreshLayersList(canvas);
    setHasGrabbedText(true);

    toast({
      type: 'success',
      title: 'Teks Berhasil Diurai!',
      description: 'Elemen teks kini dapat digeser bebas atau diklik ganda untuk mengubah kalimatnya.',
    });
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
      backgroundColor: '#FAF8F5',
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
    fabricRef.current.sendObjectBackwards(selectedObject);
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

  // ─── SAVE & APPLY (PIXEL-PERFECT EXPORT) ───
  const handleSaveAndApply = () => {
    if (!fabricRef.current) return;
    try {
      fabricRef.current.discardActiveObject();

      const renderedUrl = fabricRef.current.toDataURL({
        format: 'png',
        multiplier: 1.0,
      });

      const layersJson = JSON.stringify(fabricRef.current.toJSON());

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

      const renderedUrl = fabricRef.current.toDataURL({
        format: 'png',
        multiplier: 1.5,
      });

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
            <ArrowLeft className="h-4 w-4 text-slate-500" strokeWidth={1.75} />
            <span className="hidden sm:inline">Selesai / Tutup</span>
          </button>

          <div className="h-5 w-px bg-slate-200" />

          <div className="flex items-center gap-2">
            <div className="h-7 w-7 rounded-lg border border-purple-200 bg-purple-50 flex items-center justify-center text-purple-700">
              <Sparkles className="h-4 w-4" strokeWidth={1.75} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-black text-slate-900 tracking-tight">Magic Layers Studio</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-purple-50 text-purple-700 border border-purple-200 font-bold">
                  Canva AI
                </span>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-md bg-slate-100 text-slate-600 font-bold">
                  {canvasNaturalSizeRef.current.width} × {canvasNaturalSizeRef.current.height} px
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* SISI TENGAH: ZOOM CONTROLS (FIT TO SCREEN) */}
        <div className="hidden md:flex items-center gap-1.5 bg-slate-50 border border-slate-200 px-2 py-1 rounded-xl">
          <button
            onClick={() => setZoomLevel((prev) => Math.max(0.4, prev - 0.15))}
            className="p-1 text-slate-500 hover:text-slate-800 hover:bg-white rounded transition-colors"
            title="Perkecil Kanvas"
          >
            <ZoomOut className="h-3.5 w-3.5" strokeWidth={1.75} />
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
            <ZoomIn className="h-3.5 w-3.5" strokeWidth={1.75} />
          </button>
        </div>

        {/* SISI KANAN: UNDUH HD & TERAPKAN DESAIN */}
        <div className="flex items-center gap-2">
          {/* TOMBOL MAGIC LAYERS (DI SEBELAH KIRI UNDUH HD) */}
          {!isDecomposed ? (
            <button
              type="button"
              onClick={handleTriggerMagicLayers}
              disabled={isScanning}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all shadow-xs cursor-pointer bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white disabled:opacity-60"
              title="Pindai dan urai teks serta kartu menjadi komponen interaktif seperti di Canva"
            >
              <Sparkles
                className={`h-3.5 w-3.5 ${isScanning ? 'animate-spin text-cyan-300' : 'text-yellow-300'}`}
                strokeWidth={1.75}
              />
              <span>{isScanning ? 'Memindai Komponen...' : '✨ Magic Layers'}</span>
            </button>
          ) : (
            <div className="flex items-center gap-1.5">
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-purple-50 text-purple-700 border border-purple-200">
                <Sparkles className="h-3.5 w-3.5 text-purple-600" strokeWidth={1.75} />
                <span>Komponen Terurai</span>
              </span>
              <button
                type="button"
                onClick={handleResetToOriginal}
                className="px-2.5 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-xs font-bold text-slate-600 transition-colors cursor-pointer"
                title="Kembalikan kanvas ke gambar poster asli"
              >
                Reset Poster
              </button>
            </div>
          )}

          {/* UNDUH HD */}
          <button
            type="button"
            onClick={handleDownload}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-xs font-bold text-slate-700 transition-colors cursor-pointer"
            title="Unduh berkas gambar HD ke laptop/komputer"
          >
            <Download className="h-3.5 w-3.5 text-slate-500" strokeWidth={1.75} />
            <span className="hidden md:inline">Unduh HD</span>
          </button>

          {/* TERAPKAN & SIMPAN */}
          <Button
            size="sm"
            onClick={handleSaveAndApply}
            className="bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold gap-1.5 shadow-sm cursor-pointer"
            title="Simpan susunan layer dan terapkan ke infografis"
          >
            <Save className="h-3.5 w-3.5 text-white" strokeWidth={1.75} />
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
              <Edit3 className="h-3.5 w-3.5 text-purple-600 shrink-0" strokeWidth={1.75} />
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
                <Bold className="h-3.5 w-3.5" strokeWidth={1.75} />
              </button>
              <button
                onClick={toggleItalic}
                className={`p-1.5 rounded transition-colors ${isItalic ? 'bg-purple-600 text-white' : 'text-slate-600 hover:bg-white'}`}
                title="Miring (Italic)"
              >
                <Italic className="h-3.5 w-3.5" strokeWidth={1.75} />
              </button>
            </div>

            {/* ALIGNMENT */}
            <div className="flex items-center gap-0.5 bg-slate-50 p-0.5 rounded-lg border border-slate-200">
              <button
                onClick={() => applyTextAlign('left')}
                className={`p-1.5 rounded transition-colors ${textAlign === 'left' ? 'bg-purple-600 text-white' : 'text-slate-600 hover:bg-white'}`}
                title="Rata Kiri"
              >
                <AlignLeft className="h-3.5 w-3.5" strokeWidth={1.75} />
              </button>
              <button
                onClick={() => applyTextAlign('center')}
                className={`p-1.5 rounded transition-colors ${textAlign === 'center' ? 'bg-purple-600 text-white' : 'text-slate-600 hover:bg-white'}`}
                title="Rata Tengah"
              >
                <AlignCenter className="h-3.5 w-3.5" strokeWidth={1.75} />
              </button>
              <button
                onClick={() => applyTextAlign('right')}
                className={`p-1.5 rounded transition-colors ${textAlign === 'right' ? 'bg-purple-600 text-white' : 'text-slate-600 hover:bg-white'}`}
                title="Rata Kanan"
              >
                <AlignRight className="h-3.5 w-3.5" strokeWidth={1.75} />
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
                title="Kirim teks ke belakang subjek / orang"
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
                <Copy className="h-3.5 w-3.5" strokeWidth={1.75} />
              </button>
              <button
                onClick={deleteSelectedObject}
                className="p-1.5 rounded-lg border border-red-200 hover:bg-red-50 text-red-600 transition-colors"
                title="Hapus Elemen Ini"
              >
                <Trash2 className="h-3.5 w-3.5" strokeWidth={1.75} />
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
                (Tarik sudut untuk mengubah ukuran, atau geser untuk memindahkan posisi objek)
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
                <Trash2 className="h-3.5 w-3.5" strokeWidth={1.75} />
              </button>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-between w-full text-xs text-slate-500">
            <div className="flex items-center gap-2">
              <Sparkles className="h-3.5 w-3.5 text-purple-600" strokeWidth={1.75} />
              <span>
                <strong>Mode Magic Layers:</strong> Semua elemen telah otomatis diurai menjadi komponen. Klik langsung pada teks atau objek di kanvas untuk menggeser, mengubah ukuran, atau mengedit kalimatnya.
              </span>
            </div>
            {isCuttingOut && (
              <div className="flex items-center gap-1.5 text-purple-700 font-semibold bg-purple-50 px-2.5 py-0.5 rounded-full border border-purple-200 text-[11px]">
                <Loader2 className="h-3 w-3 animate-spin" strokeWidth={1.75} />
                <span>Mengekstrak subjek objek depan...</span>
              </div>
            )}
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
            <Layers className="h-5 w-5" strokeWidth={1.75} />
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
            <Type className="h-5 w-5" strokeWidth={1.75} />
            <span className="text-[9.5px] mt-0.5">Teks</span>
          </button>

          <button
            onClick={() => setActiveTab('elements')}
            className={`flex flex-col items-center justify-center w-12 h-12 rounded-xl transition-all ${
              activeTab === 'elements'
                ? 'bg-purple-50 text-purple-700 font-bold'
                : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
            }`}
            title="Tambah Bentuk & Kartu Tonggak"
          >
            <Square className="h-5 w-5" strokeWidth={1.75} />
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
            <Wand2 className="h-5 w-5" strokeWidth={1.75} />
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
                  <Layers className="h-4 w-4 text-purple-600" strokeWidth={1.75} />
                  <span>Susunan Lapisan ({layers.length})</span>
                </span>
                <span className="text-[10px] text-slate-400 font-mono">Atas ke Bawah</span>
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
                          <Sparkles className="h-3.5 w-3.5 text-purple-600 shrink-0" strokeWidth={1.75} />
                        ) : layer.object instanceof Textbox ? (
                          <Type className="h-3.5 w-3.5 text-blue-600 shrink-0" strokeWidth={1.75} />
                        ) : layer.object instanceof FabricImage ? (
                          <ImageIcon className="h-3.5 w-3.5 text-slate-500 shrink-0" strokeWidth={1.75} />
                        ) : (
                          <Square className="h-3.5 w-3.5 text-emerald-600 shrink-0" strokeWidth={1.75} />
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
                          <ArrowUp className="h-3.5 w-3.5" strokeWidth={1.75} />
                        </button>

                        {/* MOVE DOWN */}
                        <button
                          onClick={(e) => moveLayerDown(layer, e)}
                          disabled={index === layers.length - 1 || isBg}
                          className="p-1 rounded text-slate-400 hover:text-slate-800 hover:bg-slate-100 disabled:opacity-20"
                          title="Turunkan Layer (Ke Belakang)"
                        >
                          <ArrowDown className="h-3.5 w-3.5" strokeWidth={1.75} />
                        </button>

                        {/* LOCK */}
                        <button
                          onClick={(e) => toggleLayerLock(layer, e)}
                          className={`p-1 rounded hover:bg-slate-100 ${layer.locked ? 'text-amber-600' : 'text-slate-400'}`}
                          title={layer.locked ? 'Kunci Dibuka' : 'Kunci Posisi'}
                        >
                          {layer.locked ? <Lock className="h-3.5 w-3.5" strokeWidth={1.75} /> : <Unlock className="h-3.5 w-3.5" strokeWidth={1.75} />}
                        </button>

                        {/* VISIBILITY */}
                        <button
                          onClick={(e) => toggleLayerVisibility(layer, e)}
                          className={`p-1 rounded hover:bg-slate-100 ${layer.visible ? 'text-slate-500' : 'text-slate-300'}`}
                          title={layer.visible ? 'Sembunyikan' : 'Tampilkan'}
                        >
                          {layer.visible ? <Eye className="h-3.5 w-3.5" strokeWidth={1.75} /> : <EyeOff className="h-3.5 w-3.5" strokeWidth={1.75} />}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* LIVE SENTENCE EDITOR UNTUK LAYER TERPILIH */}
              {selectedObject && selectedObject instanceof Textbox && (
                <div className="p-3 bg-purple-50/70 border-t border-purple-200 mt-auto shrink-0 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-purple-950 flex items-center gap-1.5">
                      <Edit3 className="h-3.5 w-3.5 text-purple-600" strokeWidth={1.75} />
                      <span>Ubah Isi Kalimat Kartu</span>
                    </span>
                    <span className="text-[10px] text-purple-700 font-semibold bg-purple-100/80 px-1.5 py-0.5 rounded">
                      Live Sync
                    </span>
                  </div>
                  <textarea
                    rows={4}
                    value={currentTextContent}
                    onChange={(e) => handleLiveTextChange(e.target.value)}
                    className="w-full text-xs p-2 rounded-lg border border-purple-200 bg-white text-slate-800 focus:outline-hidden focus:ring-1 focus:ring-purple-500 font-medium leading-relaxed resize-none"
                    placeholder="Ketik kalimat atau ubah isi teks kartu di sini..."
                  />
                  <p className="text-[10px] text-slate-500 leading-tight">
                    💡 Anda juga dapat mengklik ganda (double-click) langsung pada kartu di kanvas untuk mengeditnya di tempat.
                  </p>
                </div>
              )}
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
                  <span className="text-[11px] text-slate-400">Teks judul tegas bergaya poster</span>
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
                    + Kartu Tonggak / Dimensi
                  </span>
                  <span className="text-[11px] text-slate-400">Kotak kartu berlatar putih bersih</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB 3: ELEMEN & KARTU */}
          {activeTab === 'elements' && (
            <div className="p-4 space-y-4">
              <div>
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-800">Elemen Visual</h3>
                <p className="text-[11px] text-slate-400">Sisipkan lencana dan kartu penegas</p>
              </div>

              <div className="space-y-2.5">
                <button
                  onClick={addBadgeShape}
                  className="w-full text-left p-3 rounded-xl border border-slate-200 hover:border-purple-300 hover:bg-purple-50/50 transition-all cursor-pointer group"
                >
                  <span className="block font-bold text-xs uppercase text-white bg-orange-600 px-2 py-0.5 rounded inline-block mb-1">
                    TONGGAK 01
                  </span>
                  <span className="block text-xs font-semibold text-slate-700">Badge oranye penanda poin</span>
                </button>

                <button
                  onClick={addDimensiCard}
                  className="w-full text-left p-3 rounded-xl border border-slate-200 hover:border-purple-300 hover:bg-purple-50/50 transition-all cursor-pointer group"
                >
                  <span className="block font-bold text-xs text-slate-800">Kartu Putih Elegan</span>
                  <span className="text-[11px] text-slate-400">Untuk menaruh kutipan atau rangkuman data</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB 4: MAGIC AI */}
          {activeTab === 'magic' && (
            <div className="p-4 space-y-4">
              <div>
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                  <Sparkles className="h-4 w-4 text-purple-600" strokeWidth={1.75} />
                  <span>Fitur Cerdas AI</span>
                </h3>
                <p className="text-[11px] text-slate-400">Otomasi pemisahan layer visual seperti di Canva Pro</p>
              </div>

              <div className="space-y-3">
                <div className="p-3.5 rounded-xl border border-purple-200 bg-purple-50/50 space-y-2">
                  <div className="flex items-center gap-2">
                    <Wand2 className="h-4 w-4 text-purple-600" strokeWidth={1.75} />
                    <span className="text-xs font-bold text-purple-900">Pisahkan Objek Depan (Cutout)</span>
                  </div>
                  <p className="text-[11px] text-slate-600 leading-relaxed">
                    Mengekstrak figur orang atau subjek utama menjadi layer terpisah di depan menggunakan AI.
                  </p>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleMagicCutout}
                    disabled={isCuttingOut}
                    className="w-full border-purple-300 bg-white hover:bg-purple-50 text-purple-700 font-bold text-xs"
                  >
                    {isCuttingOut ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" strokeWidth={1.75} />
                    ) : (
                      <Wand2 className="h-3.5 w-3.5 mr-1.5 text-purple-600" strokeWidth={1.75} />
                    )}
                    {isCuttingOut ? 'Mengekstrak Subjek AI...' : cutoutSuccess ? 'Objek Terpisah' : 'Pisahkan Objek Depan'}
                  </Button>
                </div>

                <div className="p-3.5 rounded-xl border border-purple-200 bg-purple-50/50 space-y-2">
                  <div className="flex items-center gap-2">
                    <Type className="h-4 w-4 text-purple-600" strokeWidth={1.75} />
                    <span className="text-xs font-bold text-purple-900">Urai Teks (Magic Grab Text)</span>
                  </div>
                  <p className="text-[11px] text-slate-600 leading-relaxed">
                    Mengubah judul dan kartu pembahasan pada poster menjadi teks interaktif yang dapat digeser dan diubah kata-katanya.
                  </p>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleGrabText}
                    className="w-full border-purple-300 bg-white hover:bg-purple-50 text-purple-700 font-bold text-xs"
                  >
                    <Type className="h-3.5 w-3.5 mr-1.5 text-purple-600" strokeWidth={1.75} />
                    {hasGrabbedText ? 'Teks Terurai' : 'Jalankan Grab Text'}
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ─── CENTER CANVAS WORKSPACE (100% PERSIS UKURAN POSTER ASLI GAMBAR 2) ─── */}
        <main
          ref={workspaceRef}
          className="flex-1 bg-[#F1F3F5] relative flex items-center justify-center p-4 sm:p-8 overflow-auto"
        >
          {isLoading && (
            <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-white/80 backdrop-blur-xs gap-3">
              <Loader2 className="h-8 w-8 text-purple-600 animate-spin" />
              <span className="text-xs font-bold text-slate-700">Memuat Lembaran Poster...</span>
            </div>
          )}

          {/* POSTER CARD (UKURAN LEMBARAN TEPAT MENGIKUTI POSTER) */}
          <div
            className="shadow-2xl ring-1 ring-slate-900/10 bg-white transition-all duration-75 overflow-hidden flex items-center justify-center shrink-0 relative"
            style={{
              width: displayDimensions.width > 0 ? `${displayDimensions.width}px` : 'auto',
              height: displayDimensions.height > 0 ? `${displayDimensions.height}px` : 'auto',
            }}
          >
            <canvas ref={canvasElRef} />

            {/* ─── EFEK ANIMASI SCANNING SEPERTI PADA GAMBAR REFERENSI (CANVA MAGIC LAYERS SCANNER) ─── */}
            {isScanning && (
              <div className="absolute inset-0 z-30 pointer-events-none overflow-hidden select-none">
                {/* Background Dim Tint saat Scanning */}
                <div className="absolute inset-0 bg-purple-950/20 backdrop-brightness-95 transition-opacity duration-300" />

                {/* Sinar Laser Scanner Menyapu dari Kiri ke Kanan dengan Glow Gradasi Ungu-Cyan */}
                <div
                  className="absolute top-0 bottom-0 pointer-events-none"
                  style={{
                    width: '35%',
                    animation: 'magicScannerSweep 1.8s ease-in-out infinite',
                    background:
                      'linear-gradient(90deg, rgba(125,42,232,0) 0%, rgba(125,42,232,0.3) 25%, rgba(6,182,212,0.65) 50%, rgba(125,42,232,0.3) 75%, rgba(125,42,232,0) 100%)',
                    boxShadow: '0 0 45px 15px rgba(6, 182, 212, 0.5), 0 0 70px 25px rgba(125, 42, 232, 0.35)',
                  }}
                >
                  {/* Garis Pusat Laser Neon Terang */}
                  <div className="absolute left-1/2 top-0 bottom-0 w-1 -translate-x-1/2 bg-cyan-200 shadow-[0_0_18px_5px_rgba(34,211,238,0.95)]" />
                </div>

                {/* Status Floating Pill Di Bawah Poster */}
                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-40 bg-slate-900/90 backdrop-blur-md text-white px-4 py-2 rounded-full border border-purple-400/50 shadow-2xl flex items-center gap-2.5 animate-in fade-in slide-in-from-bottom-2 duration-200">
                  <Sparkles className="h-4 w-4 text-cyan-400 animate-spin" strokeWidth={1.75} />
                  <span className="text-xs font-bold tracking-wide">Memindai & Mengurai Magic Layers...</span>
                </div>
              </div>
            )}

            {/* ─── BINGKAI SELEKSI UNGU KHAS CANVA (PERSIS GAMBAR 1) ─── */}
            {isDecomposed && !isScanning && (
              <div className="absolute inset-0 pointer-events-none border-2 border-dashed border-[#7D2AE8] z-20">
                {/* 4 Handle Lingkaran di Sudut */}
                <div className="absolute -top-2.5 -left-2.5 w-5 h-5 rounded-full bg-white border-2 border-[#7D2AE8] shadow-md pointer-events-auto cursor-nwse-resize" />
                <div className="absolute -top-2.5 -right-2.5 w-5 h-5 rounded-full bg-white border-2 border-[#7D2AE8] shadow-md pointer-events-auto cursor-nesw-resize" />
                <div className="absolute -bottom-2.5 -left-2.5 w-5 h-5 rounded-full bg-white border-2 border-[#7D2AE8] shadow-md pointer-events-auto cursor-nesw-resize" />
                <div className="absolute -bottom-2.5 -right-2.5 w-5 h-5 rounded-full bg-white border-2 border-[#7D2AE8] shadow-md pointer-events-auto cursor-nwse-resize" />

                {/* 4 Handle Pill di Sisi Tengah */}
                <div className="absolute top-1/2 -left-2 -translate-y-1/2 w-3.5 h-6 rounded-full bg-white border-2 border-[#7D2AE8] shadow-md pointer-events-auto cursor-ew-resize" />
                <div className="absolute top-1/2 -right-2 -translate-y-1/2 w-3.5 h-6 rounded-full bg-white border-2 border-[#7D2AE8] shadow-md pointer-events-auto cursor-ew-resize" />
                <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-6 h-3.5 rounded-full bg-white border-2 border-[#7D2AE8] shadow-md pointer-events-auto cursor-ns-resize" />
                <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-6 h-3.5 rounded-full bg-white border-2 border-[#7D2AE8] shadow-md pointer-events-auto cursor-ns-resize" />
              </div>
            )}
          </div>
        </main>

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
