'use client';

import {
  History,
  X,
  Sparkles,
  Edit3,
  FileText,
  RotateCcw,
  CheckCircle2,
  Clock,
  ChevronRight,
  Eye,
  ArrowLeft
} from 'lucide-react';
import { WritingStyle, WRITING_STYLES } from './WritingStyleSelector';

export interface ArticleIteration {
  id: string;
  versionNumber: number;
  timestamp: string; // ISO string
  source: 'AI' | 'MANUAL' | 'INITIAL' | 'RESTORE';
  actionSummary: string;
  styleUsed?: WritingStyle;
  wordCount: number;
  deltaWords: number;
  content: string;
}

interface ArticleVersionHistoryDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  iterations: ArticleIteration[];
  currentVersionId: string;
  previewVersionId: string | null;
  onPreviewVersion: (version: ArticleIteration) => void;
  onRestoreVersion: (version: ArticleIteration) => void;
  onExitPreview: () => void;
}

export function ArticleVersionHistoryDrawer({
  isOpen,
  onClose,
  iterations,
  currentVersionId,
  previewVersionId,
  onPreviewVersion,
  onRestoreVersion,
  onExitPreview,
}: ArticleVersionHistoryDrawerProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden flex justify-end">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Drawer Panel */}
      <div className="relative w-full max-w-md bg-white dark:bg-slate-900 h-full shadow-2xl border-l border-slate-200 dark:border-slate-800 flex flex-col z-10 theme-transition">
        {/* Header */}
        <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/50">
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <History className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-sm font-black text-slate-900 dark:text-white tracking-tight">
                Riwayat Iterasi & Log Aktivitas
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                {iterations.length} versi tersimpan secara otomatis
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

        {/* Preview Alert Banner if actively previewing */}
        {previewVersionId && (
          <div className="p-3 bg-amber-500/10 border-b border-amber-500/20 text-amber-900 dark:text-amber-200 text-xs flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5">
              <Eye className="h-3.5 w-3.5 text-amber-600 shrink-0" />
              <span>Sedang melihat pratinjau versi lampau.</span>
            </div>
            <button
              type="button"
              onClick={onExitPreview}
              className="font-bold underline hover:text-amber-600 text-[11px]"
            >
              Keluar Pratinjau
            </button>
          </div>
        )}

        {/* Iteration Timeline List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {iterations.length === 0 ? (
            <div className="py-12 text-center text-xs text-slate-400 space-y-2">
              <Clock className="h-8 w-8 mx-auto text-slate-300 dark:text-slate-600" />
              <p>Belum ada riwayat aktivitas tercatat.</p>
            </div>
          ) : (
            iterations.map((iter) => {
              const isCurrent = iter.id === currentVersionId;
              const isPreview = iter.id === previewVersionId;
              const dateObj = new Date(iter.timestamp);
              const timeFormatted = dateObj.toLocaleTimeString('id-ID', {
                hour: '2-digit',
                minute: '2-digit',
              });
              const dateFormatted = dateObj.toLocaleDateString('id-ID', {
                day: 'numeric',
                month: 'short',
              });

              return (
                <div
                  key={iter.id}
                  className={`p-3.5 rounded-2xl border transition-all ${
                    isPreview
                      ? 'border-amber-400 bg-amber-50/40 dark:bg-amber-950/20 shadow-xs'
                      : isCurrent
                      ? 'border-blue-500/60 bg-blue-50/40 dark:bg-blue-950/20'
                      : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300 dark:hover:border-slate-700'
                  }`}
                >
                  {/* Badge & Version Number */}
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <div className="flex items-center gap-1.5">
                      <span className="font-mono text-xs font-black text-slate-900 dark:text-white">
                        v{iter.versionNumber}
                      </span>

                      {/* Source Pill */}
                      {iter.source === 'AI' && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-blue-500/10 text-blue-600 dark:text-blue-400 text-[10px] font-bold">
                          <Sparkles className="h-2.5 w-2.5" />
                          <span>AI Copilot</span>
                        </span>
                      )}
                      {iter.source === 'MANUAL' && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold">
                          <Edit3 className="h-2.5 w-2.5" />
                          <span>Edit Mandiri</span>
                        </span>
                      )}
                      {iter.source === 'INITIAL' && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-purple-500/10 text-purple-600 dark:text-purple-400 text-[10px] font-bold">
                          <FileText className="h-2.5 w-2.5" />
                          <span>Draf Awal</span>
                        </span>
                      )}
                      {iter.source === 'RESTORE' && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-600 dark:text-amber-400 text-[10px] font-bold">
                          <RotateCcw className="h-2.5 w-2.5" />
                          <span>Dipulihkan</span>
                        </span>
                      )}
                    </div>

                    {isCurrent && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 inline-block animate-pulse" />
                        <span>Versi Aktif</span>
                      </span>
                    )}
                  </div>

                  {/* Summary of Action / Prompt */}
                  <p className="text-xs text-slate-700 dark:text-slate-300 font-medium leading-relaxed mb-2.5 line-clamp-2">
                    {iter.actionSummary}
                  </p>

                  {/* Metadata Footer */}
                  <div className="flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800/80">
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {timeFormatted} • {dateFormatted}
                    </span>

                    <div className="flex items-center gap-1.5 font-mono">
                      <span>{iter.wordCount} kata</span>
                      {iter.deltaWords !== 0 && (
                        <span
                          className={`font-bold ${
                            iter.deltaWords > 0
                              ? 'text-blue-600 dark:text-blue-400'
                              : 'text-amber-600 dark:text-amber-400'
                          }`}
                        >
                          ({iter.deltaWords > 0 ? `+${iter.deltaWords}` : iter.deltaWords})
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="mt-3 flex items-center justify-end gap-2 pt-1">
                    {!isCurrent && (
                      <>
                        <button
                          type="button"
                          onClick={() => onPreviewVersion(iter)}
                          className="px-2.5 py-1 text-[11px] font-bold rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer flex items-center gap-1"
                        >
                          <Eye className="h-3 w-3" />
                          <span>Pratinjau</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => onRestoreVersion(iter)}
                          className="px-2.5 py-1 text-[11px] font-bold rounded-lg bg-blue-600 hover:bg-blue-700 text-white shadow-xs transition-colors cursor-pointer flex items-center gap-1"
                        >
                          <RotateCcw className="h-3 w-3" />
                          <span>Pulihkan</span>
                        </button>
                      </>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer info */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 text-[11px] text-slate-400 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/50">
          <span>Tersimpan di memori browser lokal</span>
          <span className="font-mono font-bold text-blue-600">Langfuse Telemetry Active</span>
        </div>
      </div>
    </div>
  );
}
