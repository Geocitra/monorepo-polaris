'use client';

import React from 'react';
import { Eye, ArrowLeft, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ArticleIteration } from './ArticleVersionHistoryDrawer';

interface ArticleIterationBannerProps {
  previewIteration: ArticleIteration | null;
  onExitPreview: () => void;
  onRestoreVersion: (iteration: ArticleIteration) => void;
}

export function ArticleIterationBanner({
  previewIteration,
  onExitPreview,
  onRestoreVersion,
}: ArticleIterationBannerProps) {
  if (!previewIteration) return null;

  return (
    <div className="p-4 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-950 dark:text-amber-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-md animate-in fade-in duration-200">
      <div className="flex items-center gap-3">
        <div className="h-9 w-9 rounded-xl bg-amber-500/20 text-amber-700 dark:text-amber-400 flex items-center justify-center shrink-0">
          <Eye className="h-5 w-5" />
        </div>
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-mono font-black text-sm text-amber-900 dark:text-amber-100">
              Pratinjau Snapshot: Versi v{previewIteration.versionNumber}
            </span>
            <span className="text-xs text-amber-800 dark:text-amber-300">
              • {new Date(previewIteration.timestamp).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} ({previewIteration.wordCount} kata)
            </span>
          </div>
          <p className="text-xs text-amber-800 dark:text-amber-200 mt-0.5 font-medium">
            {previewIteration.actionSummary}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
        <Button
          size="sm"
          variant="outline"
          onClick={onExitPreview}
          className="text-xs font-bold border-amber-400/50 hover:bg-amber-100/50 dark:hover:bg-amber-950/40 text-amber-900 dark:text-amber-200 cursor-pointer"
        >
          <ArrowLeft className="h-3.5 w-3.5 mr-1" />
          Kembali ke Draf Sekarang
        </Button>
        <Button
          size="sm"
          onClick={() => onRestoreVersion(previewIteration)}
          className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-extrabold shadow-xs cursor-pointer"
        >
          <RotateCcw className="h-3.5 w-3.5 mr-1" />
          Pulihkan Versi Ini
        </Button>
      </div>
    </div>
  );
}

