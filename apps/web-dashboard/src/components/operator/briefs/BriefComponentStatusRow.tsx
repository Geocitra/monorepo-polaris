'use client';

import React from 'react';
import { CheckCircle2, AlertCircle, RotateCcw } from 'lucide-react';
import { ContentBriefItem } from '../types';
import { isBriefFinishedOrTerminal } from './briefUtils';

interface BriefComponentStatusRowProps {
  brief: ContentBriefItem;
}

export const BriefComponentStatusRow: React.FC<BriefComponentStatusRowProps> = ({ brief }) => {
  const isFinished = isBriefFinishedOrTerminal(brief.status);

  // Jika sudah tayang atau disetujui penuh, tampilkan ringkasan tenang tanpa badge bertumpuk
  if (isFinished && brief.status !== 'REJECTED' && brief.status !== 'CANCELLED') {
    return (
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 py-2 text-xs text-slate-500 dark:text-slate-400">
        <div className="flex items-center gap-1.5 font-medium text-emerald-700 dark:text-emerald-400">
          <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
          <span>Seluruh komponen materi (Naskah, Poster, Caption) telah disetujui klien.</span>
        </div>
        <div className="text-[11px] text-slate-400 font-mono">
          Revisi Terpakai: {brief.revisionUsed} / {brief.revisionLimit}
        </div>
      </div>
    );
  }

  // Jika ditolak atau dibatalkan
  if (brief.status === 'REJECTED' || brief.status === 'CANCELLED') {
    return (
      <div className="flex items-center gap-2 py-2 text-xs text-slate-500 dark:text-slate-400">
        <AlertCircle className="w-4 h-4 text-slate-400 shrink-0" />
        <span>Tiket telah ditutup ({brief.status === 'REJECTED' ? 'Ditolak / Refund Kuota' : 'Dibatalkan'}).</span>
      </div>
    );
  }

  // Mode Aktif (Sedang Dikerjakan / Review / Revisi)
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 py-2">
      <div className="flex items-center gap-2 flex-wrap text-xs">
        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
          Komponen:
        </span>

        {brief.articleStatus !== 'NOT_APPLICABLE' && (
          <span
            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium border ${
              brief.articleStatus === 'APPROVED'
                ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                : brief.articleStatus === 'REVISION_REQUESTED'
                ? 'bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300 border-rose-200 dark:border-rose-800 font-bold'
                : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-200 dark:border-slate-700'
            }`}
          >
            {brief.articleStatus === 'APPROVED' ? '✓' : '•'} Naskah: {brief.articleStatus}
          </span>
        )}

        {brief.imageStatus !== 'NOT_APPLICABLE' && (
          <span
            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium border ${
              brief.imageStatus === 'APPROVED'
                ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                : brief.imageStatus === 'REVISION_REQUESTED'
                ? 'bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300 border-rose-200 dark:border-rose-800 font-bold'
                : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-200 dark:border-slate-700'
            }`}
          >
            {brief.imageStatus === 'APPROVED' ? '✓' : '•'} Poster: {brief.imageStatus}
          </span>
        )}

        {brief.captionStatus !== 'NOT_APPLICABLE' && (
          <span
            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium border ${
              brief.captionStatus === 'APPROVED'
                ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                : brief.captionStatus === 'REVISION_REQUESTED'
                ? 'bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300 border-rose-200 dark:border-rose-800 font-bold'
                : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-200 dark:border-slate-700'
            }`}
          >
            {brief.captionStatus === 'APPROVED' ? '✓' : '•'} Caption: {brief.captionStatus}
          </span>
        )}
      </div>

      <div className="flex items-center gap-1.5 text-xs">
        <span
          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium border ${
            brief.revisionUsed > 0
              ? 'bg-amber-50 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300 border-amber-200 dark:border-amber-800 font-bold'
              : 'bg-slate-50 text-slate-600 dark:bg-slate-800 dark:text-slate-400 border-slate-200 dark:border-slate-700'
          }`}
        >
          <RotateCcw className="w-3 h-3 text-slate-400" />
          <span>Putaran Revisi: {brief.revisionUsed} / {brief.revisionLimit}</span>
        </span>
      </div>
    </div>
  );
};

