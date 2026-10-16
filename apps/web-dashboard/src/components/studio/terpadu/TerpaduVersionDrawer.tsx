'use client';

import { useState } from 'react';
import {
  History,
  X,
  Sparkles,
  RotateCcw,
  Clock,
  Eye,
  ArrowLeft,
  CheckCircle2,
  FileText,
  FileCheck,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export interface StudioIteration {
  id: string;
  versionNumber: number;
  timestamp: string;
  promptUsed: string;
  actionSummary: string;
  wordCount: number;
  deltaWords: number;
  articleTitle: string;
  articleMarkdown: string;
  posterUrl?: string;
  socialPack?: any;
}

interface TerpaduVersionDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  iterations: StudioIteration[];
  currentVersionNumber: number;
  previewVersion: StudioIteration | null;
  onPreviewVersion: (version: StudioIteration) => void;
  onRestoreVersion: (version: StudioIteration) => void;
  onExitPreview: () => void;
}

export function TerpaduVersionDrawer({
  isOpen,
  onClose,
  iterations,
  currentVersionNumber,
  previewVersion,
  onPreviewVersion,
  onRestoreVersion,
  onExitPreview,
}: TerpaduVersionDrawerProps) {
  if (!isOpen) return null;

  function formatTime(isoString: string) {
    try {
      const d = new Date(isoString);
      return new Intl.DateTimeFormat('id-ID', {
        day: 'numeric',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit',
      }).format(d);
    } catch {
      return isoString;
    }
  }

  return (
    <div className="fixed inset-0 z-50 overflow-hidden flex justify-end animate-in fade-in duration-200">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Drawer Panel */}
      <div className="relative w-full max-w-md bg-white dark:bg-slate-900 h-full shadow-2xl border-l border-slate-200 dark:border-slate-800 flex flex-col z-10 animate-in slide-in-from-right duration-250">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/70 dark:bg-slate-800/40">
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-xs">
              <History className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-sm font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
                <span>Riwayat Iterasi & Snapshot</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300">
                  {iterations.length} Versi
                </span>
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Setiap revisi otomatis tersimpan sebagai snapshot terpisah
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Preview Alert Banner */}
        {previewVersion && (
          <div className="p-3 bg-amber-500/10 border-b border-amber-500/20 text-amber-900 dark:text-amber-200 text-xs flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5">
              <Eye className="h-3.5 w-3.5 text-amber-600 shrink-0" />
              <span>
                Melihat snapshot: <strong>Versi v{previewVersion.versionNumber}</strong>
              </span>
            </div>
            <button
              type="button"
              onClick={onExitPreview}
              className="font-bold underline hover:text-amber-600 text-[11px] cursor-pointer"
            >
              Kembali ke Draf Aktif
            </button>
          </div>
        )}

        {/* List Iterasi Versi */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {iterations.length === 0 ? (
            <div className="text-center py-12 px-4 space-y-2">
              <div className="h-10 w-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto text-slate-400">
                <History className="w-5 h-5" />
              </div>
              <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Belum Ada Snapshot Iterasi
              </h4>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Snapshot versi baru akan otomatis dibuat setiap kali Anda memberikan instruksi revisi.
              </p>
            </div>
          ) : (
            iterations
              .slice()
              .reverse()
              .map((iter) => {
                const isCurrent = iter.versionNumber === currentVersionNumber;
                const isPreviewingThis = previewVersion?.id === iter.id;

                return (
                  <div
                    key={iter.id}
                    className={`p-3.5 rounded-2xl border transition-all flex flex-col gap-2.5 ${
                      isPreviewingThis
                        ? 'bg-amber-50/80 dark:bg-amber-950/30 border-amber-300 dark:border-amber-700 shadow-sm'
                        : isCurrent
                        ? 'bg-blue-50/70 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800 shadow-xs'
                        : 'bg-white dark:bg-slate-900 border-slate-200/90 dark:border-slate-800 hover:border-slate-300'
                    }`}
                  >
                    {/* Header Versi & Badge */}
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span
                          className={`font-mono text-xs font-black px-2 py-0.5 rounded-lg ${
                            isCurrent
                              ? 'bg-blue-600 text-white'
                              : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                          }`}
                        >
                          v{iter.versionNumber}
                        </span>
                        {isCurrent && (
                          <span className="text-[10px] font-extrabold text-blue-600 dark:text-blue-400 flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" />
                            <span>Versi Aktif</span>
                          </span>
                        )}
                        {isPreviewingThis && (
                          <span className="text-[10px] font-extrabold text-amber-600 dark:text-amber-400">
                            (Sedang Dilihat)
                          </span>
                        )}
                      </div>

                      <span className="text-[10px] text-slate-400 flex items-center gap-1">
                        <Clock className="w-2.5 h-2.5" />
                        <span>{formatTime(iter.timestamp)}</span>
                      </span>
                    </div>

                    {/* Ringkasan Aksi / Prompt */}
                    <div className="space-y-1">
                      <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                        {iter.actionSummary || 'Pembuatan Konten Awal'}
                      </p>
                      {iter.promptUsed && (
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 italic line-clamp-2 bg-slate-50 dark:bg-slate-800/60 p-2 rounded-lg border border-slate-100 dark:border-slate-800">
                          &ldquo;{iter.promptUsed}&rdquo;
                        </p>
                      )}
                    </div>

                    {/* Metrik Kata & Tombol Aksi */}
                    <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800 text-[11px]">
                      <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
                        <span>{iter.wordCount} kata</span>
                        {iter.deltaWords !== 0 && (
                          <span
                            className={`font-semibold ${
                              iter.deltaWords > 0 ? 'text-emerald-600' : 'text-red-500'
                            }`}
                          >
                            ({iter.deltaWords > 0 ? `+${iter.deltaWords}` : iter.deltaWords})
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-1.5">
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => onPreviewVersion(iter)}
                          className="h-7 px-2.5 text-[11px] font-bold text-slate-600 dark:text-slate-400 hover:text-blue-600 cursor-pointer"
                        >
                          <Eye className="w-3 h-3 mr-1" />
                          <span>Lihat</span>
                        </Button>

                        {!isCurrent && (
                          <Button
                            type="button"
                            size="sm"
                            onClick={() => onRestoreVersion(iter)}
                            className="h-7 px-2.5 text-[11px] font-extrabold bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-2xs cursor-pointer gap-1"
                          >
                            <RotateCcw className="w-3 h-3" />
                            <span>Pulihkan</span>
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
          )}
        </div>
      </div>
    </div>
  );
}
