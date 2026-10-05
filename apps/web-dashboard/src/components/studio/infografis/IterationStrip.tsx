'use client';

import Image from 'next/image';
import { History, Sparkles, Plus, Check } from 'lucide-react';
import { InfographicIteration } from './InfographicTypes';

interface IterationStripProps {
  iterations: InfographicIteration[];
  activeIterationId: string;
  onSelectIteration: (id: string) => void;
  onOpenHistoryDrawer: () => void;
}

export function IterationStrip({
  iterations,
  activeIterationId,
  onSelectIteration,
  onOpenHistoryDrawer,
}: IterationStripProps) {
  return (
    <div className="flex items-center justify-between gap-3 p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs">
      <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0 scrollbar-none flex-1">
        <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500 shrink-0 ml-1 mr-1">
          Iterasi:
        </span>

        {iterations.map((it) => {
          const isActive = it.id === activeIterationId;

          return (
            <button
              key={it.id}
              type="button"
              onClick={() => onSelectIteration(it.id)}
              className={`flex items-center gap-2 px-2.5 py-1.5 rounded-xl border text-xs font-bold transition-all shrink-0 cursor-pointer ${
                isActive
                  ? 'border-blue-600 bg-blue-50/70 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 shadow-xs ring-2 ring-blue-500/20'
                  : 'border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 text-slate-600 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-700 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <div className="relative w-5 h-5 rounded-md overflow-hidden bg-slate-200 dark:bg-slate-700 shrink-0">
                <Image
                  src={it.imageUrl}
                  alt={`V${it.versionNumber}`}
                  fill
                  unoptimized
                  className="object-cover"
                />
              </div>

              <span>Versi {it.versionNumber}</span>

              {isActive && <Check className="h-3 w-3 text-blue-600 dark:text-blue-400" />}
            </button>
          );
        })}
      </div>

      <button
        type="button"
        onClick={onOpenHistoryDrawer}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors shrink-0 cursor-pointer"
        title="Buka riwayat linimasa versi lengkap"
      >
        <History className="h-3.5 w-3.5" />
        <span className="hidden sm:inline">Semua Versi ({iterations.length})</span>
      </button>
    </div>
  );
}
