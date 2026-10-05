'use client';

import Image from 'next/image';
import {
  History,
  X,
  Sparkles,
  RotateCcw,
  CheckCircle2,
  Clock,
  ArrowRight,
  Eye,
  Sliders,
} from 'lucide-react';
import { InfographicIteration } from './InfographicTypes';
import { formatDateIndonesian } from '@/lib/utils';

interface InfographicVersionDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  iterations: InfographicIteration[];
  activeIterationId: string;
  onSelectIteration: (iterationId: string) => void;
  onRestoreIteration: (iteration: InfographicIteration) => void;
}

export function InfographicVersionDrawer({
  isOpen,
  onClose,
  iterations,
  activeIterationId,
  onSelectIteration,
  onRestoreIteration,
}: InfographicVersionDrawerProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden flex justify-end animate-in fade-in duration-200">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      <div className="relative w-full max-w-sm sm:max-w-md bg-white dark:bg-slate-900 shadow-2xl flex flex-col h-full border-l border-slate-200 dark:border-slate-800 z-10">
        {/* HEADER */}
        <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center">
              <History className="h-4 w-4" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-white">
                Riwayat Versi & Iterasi
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                {iterations.length} iterasi visual dalam sesi ini
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* DAFTAR ITERASI */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {iterations.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center px-6 text-center">
              <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-2xl bg-purple-50 text-purple-600 dark:bg-purple-950/60 dark:text-purple-400">
                <Sparkles className="h-5 w-5" />
              </div>
              <p className="text-xs font-bold text-slate-700 dark:text-slate-200">
                Belum ada versi
              </p>
              <p className="mt-1 text-[11px] leading-relaxed text-slate-500 dark:text-slate-400">
                Versi 1 akan muncul setelah Anda mengirim prompt dan AI berhasil membuat infografis.
              </p>
            </div>
          ) : iterations.map((it) => {
            const isActive = it.id === activeIterationId;

            return (
              <div
                key={it.id}
                onClick={() => onSelectIteration(it.id)}
                className={`p-3.5 rounded-2xl border transition-all cursor-pointer relative ${
                  isActive
                    ? 'border-blue-600 bg-blue-50/50 dark:bg-blue-950/40 shadow-xs ring-2 ring-blue-500/20'
                    : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-900/60 hover:bg-slate-50/50 dark:hover:bg-slate-800/40'
                }`}
              >
                <div className="flex items-start gap-3">
                  {/* THUMBNAIL PREVIEW */}
                  <div className="relative w-16 h-16 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 shrink-0">
                    <Image
                      src={it.imageUrl}
                      alt={it.title}
                      fill
                      unoptimized
                      className="object-cover"
                    />
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-1 mb-1">
                      <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                        Versi {it.versionNumber}
                      </span>
                      {isActive && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-black text-blue-600 dark:text-blue-400">
                          <CheckCircle2 className="h-3 w-3" />
                          <span>Aktif</span>
                        </span>
                      )}
                    </div>

                    <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 line-clamp-1">
                      {it.title}
                    </h4>

                    <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2 mt-1 italic">
                      &quot;{it.prompt}&quot;
                    </p>

                    <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-100 dark:border-slate-800/80 text-[10px] text-slate-400">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        <span>{formatDateIndonesian(it.timestamp)}</span>
                      </span>

                      {!isActive && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onRestoreIteration(it);
                            onClose();
                          }}
                          className="inline-flex items-center gap-1 font-bold text-blue-600 dark:text-blue-400 hover:underline"
                        >
                          <RotateCcw className="h-3 w-3" />
                          <span>Pilih Versi Ini</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
