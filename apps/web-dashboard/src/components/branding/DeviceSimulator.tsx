'use client';

import { getRootDomain } from '@/lib/urls';

import {
  Globe,
  Monitor,
  Tablet,
  Smartphone,
  RefreshCw,
  ExternalLink,
  Maximize2,
  X,
  Lock,
} from 'lucide-react';
import { RefObject, useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';

interface DeviceSimulatorProps {
  previewUrl: string;
  previewDevice: 'desktop' | 'tablet' | 'mobile';
  onDeviceChange: (device: 'desktop' | 'tablet' | 'mobile') => void;
  onRefresh: () => void;
  iframeKey: number;
  iframeRef: RefObject<HTMLIFrameElement | null>;
}

export function DeviceSimulator({
  previewUrl,
  previewDevice,
  onDeviceChange,
  onRefresh,
  iframeKey,
  iframeRef,
}: DeviceSimulatorProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState<number>(480);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Dynamically observe container width to calculate real-time virtual desktop viewport scale
  useEffect(() => {
    if (!containerRef.current) return;
    const updateSize = () => {
      if (containerRef.current) {
        setContainerWidth(containerRef.current.clientWidth);
      }
    };
    updateSize();
    const observer = new ResizeObserver(updateSize);
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  // Handle ESC key to exit fullscreen modal
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape' && isFullscreen) {
        setIsFullscreen(false);
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isFullscreen]);

  // Target viewport dimensions
  // Desktop: 1280px x 800px (standard 16:10 desktop browser viewport)
  // Tablet: 768px x 1024px (standard iPad portrait)
  // Mobile: 390px x 844px (standard iPhone portrait)
  const targetWidth = previewDevice === 'desktop' ? 1280 : previewDevice === 'tablet' ? 768 : 390;
  const targetHeight = previewDevice === 'desktop' ? 800 : previewDevice === 'tablet' ? 1024 : 844;

  const maxDisplayHeight = 640;
  const widthScale = containerWidth > 0 ? containerWidth / targetWidth : 1;
  const heightScale = maxDisplayHeight / targetHeight;

  // For desktop: scale to fit container width cleanly (giving a 16:10 widescreen monitor aspect ratio)
  // For tablet & mobile: scale to fit both width and maxDisplayHeight so device fits within bounds
  const scale = previewDevice === 'desktop'
    ? widthScale
    : Math.min(widthScale, heightScale, 1);

  const displayHeight = Math.round(targetHeight * scale);

  // Clean URL hostname for address bar mockup
  let displayHost = `website-dewan.${getRootDomain()}`;
  try {
    const parsed = new URL(previewUrl);
    displayHost = parsed.hostname;
  } catch {}

  return (
    <div className="w-full sticky top-20 space-y-3">
      {/* ─── SIMULATOR HEADER TOOLBAR ─── */}
      <div className="flex items-center justify-between px-2">
        <div className="flex items-center gap-2">
          <span className="text-xs font-extrabold uppercase text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Simulator Website Live</span>
          </span>
          <span className="hidden sm:inline-block px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-[10px] font-bold text-slate-500">
            {previewDevice === 'desktop'
              ? `Desktop (1280x800 • ${Math.round(scale * 100)}%)`
              : previewDevice === 'tablet'
              ? `Tablet (768x1024 • ${Math.round(scale * 100)}%)`
              : `Mobile (390x844 • ${Math.round(scale * 100)}%)`}
          </span>
        </div>

        {/* DEVICE TOGGLE BUTTONS & ACTIONS */}
        <div className="flex items-center gap-1 bg-white dark:bg-slate-900 p-1 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <button
            type="button"
            onClick={() => onDeviceChange('desktop')}
            className={cn(
              'p-1.5 rounded-lg transition-colors cursor-pointer',
              previewDevice === 'desktop'
                ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 shadow-xs'
                : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
            )}
            title="Tampilan Desktop Widescreen (1280px)"
          >
            <Monitor className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => onDeviceChange('tablet')}
            className={cn(
              'p-1.5 rounded-lg transition-colors cursor-pointer',
              previewDevice === 'tablet'
                ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 shadow-xs'
                : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
            )}
            title="Tampilan Tablet (768px)"
          >
            <Tablet className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => onDeviceChange('mobile')}
            className={cn(
              'p-1.5 rounded-lg transition-colors cursor-pointer',
              previewDevice === 'mobile'
                ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 shadow-xs'
                : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
            )}
            title="Tampilan Smartphone (390px)"
          >
            <Smartphone className="h-4 w-4" />
          </button>
          
          <button
            type="button"
            onClick={onRefresh}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 border-l border-slate-100 dark:border-slate-800 ml-1 cursor-pointer"
            title="Muat Ulang Simulator"
          >
            <RefreshCw className="h-3.5 w-3.5" />
          </button>

          <button
            type="button"
            onClick={() => setIsFullscreen(true)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 cursor-pointer"
            title="Pratinjau Layar Penuh (100% Native)"
          >
            <Maximize2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* ─── FRAME CONTAINER (APPLE STUDIO DISPLAY BEZEL) ─── */}
      <div className="bg-slate-200/90 dark:bg-slate-900/80 p-2.5 sm:p-3.5 rounded-3xl border border-slate-300/80 dark:border-slate-800 shadow-inner flex flex-col overflow-hidden transition-all">
        
        {/* Browser Mock Address Bar */}
        <div className="mb-2 px-3 py-1.5 bg-slate-100 dark:bg-slate-800/90 rounded-xl flex items-center justify-between text-[11px] text-slate-500 font-mono select-none">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-400/80 inline-block" />
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400/80 inline-block" />
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400/80 inline-block" />
          </div>
          <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300 font-semibold text-xs">
            <Lock className="w-3 h-3 text-emerald-600" />
            <span>https://{displayHost}</span>
          </div>
          <a
            href={previewUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
            title="Buka Langsung di Tab Baru"
          >
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>

        {/* Viewport Frame with Virtual Desktop Scaling */}
        <div
          ref={containerRef}
          style={{
            height: `${displayHeight}px`,
          }}
          className="bg-white dark:bg-slate-950 rounded-2xl shadow-2xl overflow-hidden border border-slate-300 dark:border-slate-800 transition-all duration-300 flex justify-center w-full"
        >
          <div
            style={{
              width: `${targetWidth}px`,
              height: `${targetHeight}px`,
              transform: `scale(${scale})`,
              transformOrigin: 'top center',
            }}
            className="origin-top shrink-0"
          >
            <iframe
              key={iframeKey}
              ref={iframeRef}
              src={previewUrl}
              className="w-full h-full border-0 block"
              title="Live Preview Website Dewan"
            />
          </div>
        </div>
      </div>

      {/* ─── FULLSCREEN MODAL OVERLAY (SOLUSI 2: 100% NATIVE RESOLUTION PREVIEW) ─── */}
      {isFullscreen && (
        <div className="fixed inset-0 z-[100] bg-slate-950/90 backdrop-blur-md flex flex-col p-4 sm:p-6 animate-in fade-in duration-200">
          <div className="max-w-7xl w-full mx-auto flex-1 flex flex-col bg-white dark:bg-slate-900 rounded-3xl shadow-2xl overflow-hidden border border-slate-700">
            
            {/* Modal Header Bar */}
            <div className="px-5 py-3.5 bg-slate-100 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse" />
                <span className="font-bold text-sm text-slate-800 dark:text-slate-100 flex items-center gap-2">
                  <Lock className="w-4 h-4 text-emerald-600" />
                  <span>https://{displayHost}</span>
                </span>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 font-semibold">
                  Pratinjau Layar Penuh 1:1
                </span>
              </div>

              <div className="flex items-center gap-3">
                <a
                  href={previewUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-xs font-bold text-slate-700 dark:text-slate-200 transition-all"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Buka di Tab Baru</span>
                </a>

                <button
                  type="button"
                  onClick={() => setIsFullscreen(false)}
                  className="p-1.5 rounded-lg bg-slate-200 dark:bg-slate-700 hover:bg-rose-500 hover:text-white text-slate-600 dark:text-slate-300 transition-all cursor-pointer"
                  title="Tutup Layar Penuh (Esc)"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Native Fullscreen Iframe */}
            <div className="flex-1 w-full h-full bg-white dark:bg-slate-950 overflow-hidden">
              <iframe
                src={previewUrl}
                className="w-full h-full border-0"
                title="Fullscreen Preview"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
