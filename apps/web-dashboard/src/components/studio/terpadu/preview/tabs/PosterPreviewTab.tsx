'use client';

import React from 'react';
import {
  Sparkles,
  RotateCw,
  Maximize2,
  Download,
  Loader2,
  Image as ImageIcon,
} from 'lucide-react';

interface PosterPreviewTabProps {
  selectedPosterUrl: string;
  generatedResult: any;
  regeneratingPoster: boolean;
  isBackgroundRenderingPoster: boolean;
  downloadingPoster: boolean;
  onRegeneratePoster: () => void;
  onDownloadPoster: (customName?: string) => void;
  onOpenLightbox: () => void;
}

export function PosterPreviewTab({
  selectedPosterUrl,
  generatedResult,
  regeneratingPoster,
  isBackgroundRenderingPoster,
  downloadingPoster,
  onRegeneratePoster,
  onDownloadPoster,
  onOpenLightbox,
}: PosterPreviewTabProps) {
  const posterUrl = selectedPosterUrl || generatedResult?.posterUrl;

  return (
    <div className="space-y-4">
      {/* HEADER & ACTION BAR */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-black text-slate-800 dark:text-slate-100 uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="h-4 w-4 text-blue-500" />
              <span>Poster Visual &amp; Infografis</span>
            </span>
            <span className="text-[10px] font-black font-mono px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
              RESOLUSI TINGGI
            </span>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
            Poster visual resolusi penuh yang siap diunduh dan dipublikasikan ke semua platform.
          </p>
        </div>

        {/* ACTION BUTTONS */}
        <div className="flex items-center flex-wrap gap-2">
          <button
            type="button"
            onClick={onRegeneratePoster}
            disabled={regeneratingPoster}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold text-xs border border-slate-200 dark:border-slate-700 shadow-2xs transition-colors cursor-pointer disabled:opacity-50"
          >
            <RotateCw className={`h-3.5 w-3.5 text-blue-500 ${regeneratingPoster ? 'animate-spin' : ''}`} />
            <span>Render Ulang</span>
          </button>

          {posterUrl && (
            <>
              <button
                type="button"
                onClick={onOpenLightbox}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold text-xs border border-slate-200 dark:border-slate-700 shadow-2xs transition-colors cursor-pointer"
              >
                <Maximize2 className="h-3.5 w-3.5 text-blue-500" />
                <span>Layar Penuh</span>
              </button>

              <button
                type="button"
                onClick={() => onDownloadPoster()}
                disabled={downloadingPoster}
                className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs shadow-md transition-colors cursor-pointer disabled:opacity-60"
              >
                {downloadingPoster ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Download className="h-3.5 w-3.5" />}
                <span>{downloadingPoster ? 'Mengunduh...' : 'Unduh Poster HD'}</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* MAIN POSTER DISPLAY */}
      <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 sm:p-6 space-y-4 shadow-sm">
        {posterUrl ? (
          <div className="space-y-3">
            {/* Frame Poster Tanpa Crop (Object Contain Presisi untuk Beragam Rasio) */}
            <div
              onClick={onOpenLightbox}
              className="relative rounded-2xl overflow-hidden border border-slate-800 bg-slate-950 flex items-center justify-center p-3 sm:p-6 shadow-xl cursor-zoom-in group select-none min-h-[420px]"
            >
              <img
                src={posterUrl}
                alt="Poster Visual Resolusi Tinggi"
                className="max-h-[640px] w-auto max-w-full object-contain rounded-xl shadow-2xl transition-transform duration-300 group-hover:scale-[1.01]"
              />
              <div className="absolute inset-0 bg-slate-950/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none rounded-2xl">
                <span className="px-4 py-2 rounded-xl bg-slate-900/90 text-white text-xs font-bold backdrop-blur-md border border-slate-700 shadow-xl flex items-center gap-2">
                  <Maximize2 className="h-4 w-4 text-blue-400" />
                  <span>Klik untuk Melihat Layar Penuh</span>
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 pt-1">
              <span>💡 Poster otomatis disesuaikan secara proporsional. Klik gambar untuk melihat resolusi penuh.</span>
              <button
                type="button"
                onClick={() => onDownloadPoster()}
                disabled={downloadingPoster}
                className="font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 cursor-pointer"
              >
                <Download className="h-3.5 w-3.5" />
                <span>Unduh File Gambar</span>
              </button>
            </div>
          </div>
        ) : (regeneratingPoster || isBackgroundRenderingPoster) ? (
          <div className="rounded-2xl border border-slate-700 bg-slate-950 p-12 text-center space-y-3">
            <Loader2 className="h-9 w-9 text-blue-400 animate-spin mx-auto opacity-90" />
            <p className="text-xs text-white font-bold">
              🎨 Sedang Merender Poster Resolusi Penuh...
            </p>
            <p className="text-[11px] text-slate-400 max-w-xs mx-auto">
              Visual sedang diproses di latar belakang dan akan muncul otomatis begitu selesai.
            </p>
          </div>
        ) : (
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 p-12 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-blue-500 flex items-center justify-center mx-auto mb-1">
              <ImageIcon className="h-6 w-6" />
            </div>
            <p className="text-xs text-slate-900 dark:text-white font-bold">
              Poster Resolusi Tinggi Belum Tersedia
            </p>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 max-w-xs mx-auto">
              Klik tombol di bawah untuk membuat poster visual dengan tipografi Satori.
            </p>
            <button
              type="button"
              onClick={onRegeneratePoster}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-black text-xs shadow-md transition-all cursor-pointer mt-1"
            >
              <RotateCw className="h-3.5 w-3.5" />
              <span>Buat Poster Visual Sekarang</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

