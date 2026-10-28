'use client';

import React, { useEffect } from 'react';
import { Download, Loader2, X } from 'lucide-react';
import { Portal } from '@/components/ui/portal';

interface PosterLightboxProps {
  isOpen: boolean;
  onClose: () => void;
  imageUrl: string;
  title?: string;
  downloading: boolean;
  onDownload: () => void;
}

export function PosterLightbox({
  isOpen,
  onClose,
  imageUrl,
  title,
  downloading,
  onDownload,
}: PosterLightboxProps) {
  useEffect(() => {
    if (!isOpen) return;

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        onClose();
      }
    }

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen || !imageUrl) return null;

  return (
    <Portal>
      <div
        className="fixed inset-0 !m-0 z-[60] bg-slate-950/95 backdrop-blur-md flex flex-col items-center justify-between p-4 sm:p-6 animate-in fade-in duration-200 select-none"
        onClick={onClose}
      >
        {/* Header Lightbox */}
        <div
          className="w-full max-w-6xl flex items-center justify-between text-white pb-3 border-b border-slate-800"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-sm text-white truncate max-w-md">
              {title || 'Pratinjau Poster Utuh'}
            </span>
            <span className="text-xs text-blue-400 font-mono px-2 py-0.5 rounded-full bg-blue-950/60 border border-blue-800 shrink-0">
              Resolusi Asli Penuh
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onDownload}
              disabled={downloading}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs shadow-md cursor-pointer transition-colors disabled:opacity-60"
            >
              {downloading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Download className="h-4 w-4" />
              )}
              <span>{downloading ? 'Mengunduh...' : 'Unduh Poster'}</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
              title="Tutup (ESC)"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Frame Gambar Gede Penuh */}
        <div
          className="flex-1 w-full max-w-6xl flex items-center justify-center p-2 sm:p-4 overflow-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={imageUrl}
            alt={title || 'Poster Penuh'}
            className="max-h-[82vh] max-w-full object-contain rounded-xl shadow-2xl border border-slate-800"
          />
        </div>

        {/* Footer Info */}
        <div className="text-[11px] text-slate-400 pt-2 flex items-center gap-2">
          <span>Tekan tombol</span>
          <kbd className="px-1.5 py-0.5 bg-slate-800 border border-slate-700 rounded text-slate-300 font-mono text-[10px]">
            ESC
          </kbd>
          <span>atau klik di luar gambar untuk menutup tampilan penuh.</span>
        </div>
      </div>
    </Portal>
  );
}
