'use client';

import type React from 'react';
import { Loader2, Sparkles } from 'lucide-react';

interface MagicLayersCanvasStageProps {
  workspaceRef: React.RefObject<HTMLDivElement | null>;
  canvasElRef: React.RefObject<HTMLCanvasElement | null>;
  isLoading: boolean;
  displayDimensions: { width: number; height: number };
  isScanning: boolean;
  pipelineStep: number;
  pipelineStatusText: string;
}

export function MagicLayersCanvasStage({
  workspaceRef,
  canvasElRef,
  isLoading,
  displayDimensions,
  isScanning,
  pipelineStep,
  pipelineStatusText,
}: MagicLayersCanvasStageProps) {
  return (
    <main
      ref={workspaceRef}
      className="flex-1 min-w-0 min-h-0 bg-[#E9ECEF] relative flex overflow-auto p-6 sm:p-10 select-none"
    >
      {isLoading && (
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-white/80 backdrop-blur-xs gap-3">
          <Loader2 className="h-8 w-8 text-purple-600 animate-spin" />
          <span className="text-xs font-bold text-slate-700">Memuat Lembaran Poster...</span>
        </div>
      )}

      <div
        className="m-auto shadow-2xl ring-1 ring-slate-900/10 bg-white transition-all duration-75 overflow-hidden flex items-center justify-center shrink-0 relative"
        style={{
          width: displayDimensions.width > 0 ? `${displayDimensions.width}px` : 'auto',
          height: displayDimensions.height > 0 ? `${displayDimensions.height}px` : 'auto',
        }}
      >
        <canvas ref={canvasElRef} />

        {isScanning && (
          <div className="absolute inset-0 z-30 pointer-events-none overflow-hidden select-none">
            <div className="absolute inset-0 bg-purple-950/20 backdrop-brightness-95 transition-opacity duration-300" />

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
              <div className="absolute left-1/2 top-0 bottom-0 w-1 -translate-x-1/2 bg-cyan-200 shadow-[0_0_18px_5px_rgba(34,211,238,0.95)]" />
            </div>

            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-40 bg-slate-900/95 backdrop-blur-md text-white px-5 py-3.5 rounded-2xl border border-purple-500/40 shadow-2xl flex flex-col gap-2.5 min-w-[320px] max-w-sm animate-in fade-in slide-in-from-bottom-3 duration-200 pointer-events-auto">
              <div className="flex items-center justify-between border-b border-slate-700/60 pb-2">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-purple-400 animate-spin" strokeWidth={1.75} />
                  <span className="text-xs font-black tracking-wide text-purple-200 uppercase">Pipeline Magic Layers</span>
                </div>
                <span className="text-[10px] font-mono text-cyan-300 font-bold bg-cyan-950/80 px-2 py-0.5 rounded-full border border-cyan-800/60">
                  Tahap {pipelineStep || 1}/4
                </span>
              </div>

              <div className="space-y-1.5 text-[11px]">
                <div className={`flex items-center gap-2 ${pipelineStep >= 1 ? 'text-white' : 'text-slate-500'}`}>
                  <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-bold ${pipelineStep > 1 ? 'bg-emerald-500 text-white' : pipelineStep === 1 ? 'bg-cyan-400 text-slate-900 animate-pulse' : 'bg-slate-700 text-slate-400'}`}>
                    {pipelineStep > 1 ? '✓' : '1'}
                  </span>
                  <span className={pipelineStep === 1 ? 'font-bold text-cyan-200' : ''}>1. Deteksi Teks (OCR) & Isolasi Bounding Box</span>
                </div>

                <div className={`flex items-center gap-2 ${pipelineStep >= 2 ? 'text-white' : 'text-slate-500'}`}>
                  <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-bold ${pipelineStep > 2 ? 'bg-emerald-500 text-white' : pipelineStep === 2 ? 'bg-cyan-400 text-slate-900 animate-pulse' : 'bg-slate-700 text-slate-400'}`}>
                    {pipelineStep > 2 ? '✓' : '2'}
                  </span>
                  <span className={pipelineStep === 2 ? 'font-bold text-cyan-200' : ''}>2. Segmentasi Semantik & Panoptic Layout</span>
                </div>

                <div className={`flex items-center gap-2 ${pipelineStep >= 3 ? 'text-white' : 'text-slate-500'}`}>
                  <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-bold ${pipelineStep > 3 ? 'bg-emerald-500 text-white' : pipelineStep === 3 ? 'bg-cyan-400 text-slate-900 animate-pulse' : 'bg-slate-700 text-slate-400'}`}>
                    {pipelineStep > 3 ? '✓' : '3'}
                  </span>
                  <span className={pipelineStep === 3 ? 'font-bold text-cyan-200' : ''}>3. Penggabungan Heuristik (Post-Processing Grouping)</span>
                </div>

                <div className={`flex items-center gap-2 ${pipelineStep >= 4 ? 'text-white' : 'text-slate-500'}`}>
                  <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-bold ${pipelineStep === 4 ? 'bg-cyan-400 text-slate-900 animate-pulse' : 'bg-slate-700 text-slate-400'}`}>
                    4
                  </span>
                  <span className={pipelineStep === 4 ? 'font-bold text-cyan-200' : ''}>4. Inpainting Tekstur Latar Belakang & Layer Canva</span>
                </div>
              </div>

              {pipelineStatusText && (
                <p className="text-[10px] text-purple-300 italic truncate pt-1 border-t border-slate-800">
                  {pipelineStatusText}
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}

