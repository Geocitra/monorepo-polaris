'use client';

import {
  ArrowLeft,
  Download,
  Redo2,
  Save,
  Sparkles,
  Undo2,
  ZoomIn,
  ZoomOut,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

interface MagicLayersHeaderProps {
  onClose: () => void;
  canvasWidth: number;
  canvasHeight: number;
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
  zoomLevel: number;
  onZoomOut: () => void;
  onZoomFit: () => void;
  onZoomIn: () => void;
  isDecomposed: boolean;
  isScanning: boolean;
  onTriggerMagicLayers: (forceRescan: boolean) => void;
  onResetToOriginal: () => void;
  onDownload: () => void;
  onSaveAndApply: () => void;
}

export function MagicLayersHeader({
  onClose,
  canvasWidth,
  canvasHeight,
  canUndo,
  canRedo,
  onUndo,
  onRedo,
  zoomLevel,
  onZoomOut,
  onZoomFit,
  onZoomIn,
  isDecomposed,
  isScanning,
  onTriggerMagicLayers,
  onResetToOriginal,
  onDownload,
  onSaveAndApply,
}: MagicLayersHeaderProps) {
  return (
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
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-md bg-slate-100 text-slate-600 font-bold">
                {canvasWidth} × {canvasHeight} px
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* SISI TENGAH: UNDO / REDO & ZOOM CONTROLS */}
      <div className="hidden md:flex items-center gap-2">
        <div className="flex items-center gap-1 bg-slate-50 border border-slate-200 px-1.5 py-1 rounded-xl">
          <button
            type="button"
            onClick={onUndo}
            disabled={!canUndo}
            className="inline-flex items-center gap-1 px-2 py-1 text-xs font-bold text-slate-700 hover:text-purple-700 hover:bg-white rounded-lg transition-colors disabled:opacity-35 disabled:pointer-events-none cursor-pointer"
            title="Urungkan perubahan terakhir (Ctrl+Z)"
          >
            <Undo2 className="h-3.5 w-3.5" strokeWidth={2} />
            <span className="text-[11px]">Undo</span>
          </button>
          <div className="h-4 w-px bg-slate-200" />
          <button
            type="button"
            onClick={onRedo}
            disabled={!canRedo}
            className="inline-flex items-center gap-1 px-2 py-1 text-xs font-bold text-slate-700 hover:text-purple-700 hover:bg-white rounded-lg transition-colors disabled:opacity-35 disabled:pointer-events-none cursor-pointer"
            title="Ulangi perubahan (Ctrl+Y)"
          >
            <Redo2 className="h-3.5 w-3.5" strokeWidth={2} />
            <span className="text-[11px]">Redo</span>
          </button>
        </div>

        <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 px-2 py-1 rounded-xl">
          <button
            onClick={onZoomOut}
            className="p-1 text-slate-500 hover:text-slate-800 hover:bg-white rounded transition-colors"
            title="Perkecil Kanvas"
          >
            <ZoomOut className="h-3.5 w-3.5" strokeWidth={1.75} />
          </button>

          <button
            onClick={onZoomFit}
            className={`px-2 py-0.5 rounded text-[11px] font-bold font-mono transition-colors ${
              zoomLevel === 1.0 ? 'bg-white text-purple-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
            title="Sesuaikan Pas Layar (100% Konten Tampak)"
          >
            Fit ({Math.round(zoomLevel * 100)}%)
          </button>

          <button
            onClick={onZoomIn}
            className="p-1 text-slate-500 hover:text-slate-800 hover:bg-white rounded transition-colors"
            title="Perbesar Kanvas"
          >
            <ZoomIn className="h-3.5 w-3.5" strokeWidth={1.75} />
          </button>
        </div>
      </div>

      {/* SISI KANAN: UNDUH HD & TERAPKAN DESAIN */}
      <div className="flex items-center gap-2">
        {!isDecomposed ? (
          <button
            type="button"
            onClick={() => onTriggerMagicLayers(false)}
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
              onClick={() => onTriggerMagicLayers(true)}
              disabled={isScanning}
              className="px-2.5 py-1.5 rounded-lg border border-purple-200 bg-purple-50 hover:bg-purple-100 text-xs font-bold text-purple-700 transition-colors cursor-pointer inline-flex items-center gap-1 disabled:opacity-60"
              title="Ekstrak ulang teks dan elemen dari poster asli dengan AI Vision terbaru"
            >
              <Sparkles className="h-3 w-3 text-purple-600" />
              <span>Pindai Ulang</span>
            </button>
            <button
              type="button"
              onClick={onResetToOriginal}
              className="px-2.5 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-xs font-bold text-slate-600 transition-colors cursor-pointer"
              title="Kembalikan kanvas ke gambar poster asli"
            >
              Reset Poster
            </button>
          </div>
        )}

        <button
          type="button"
          onClick={onDownload}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-xs font-bold text-slate-700 transition-colors cursor-pointer"
          title="Unduh berkas gambar HD ke laptop/komputer"
        >
          <Download className="h-3.5 w-3.5 text-slate-500" strokeWidth={1.75} />
          <span className="hidden md:inline">Unduh HD</span>
        </button>

        <Button
          size="sm"
          onClick={onSaveAndApply}
          className="bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold gap-1.5 shadow-sm cursor-pointer"
          title="Simpan susunan layer dan terapkan ke infografis"
        >
          <Save className="h-3.5 w-3.5 text-white" strokeWidth={1.75} />
          <span>Terapkan Desain</span>
        </Button>
      </div>
    </header>
  );
}

