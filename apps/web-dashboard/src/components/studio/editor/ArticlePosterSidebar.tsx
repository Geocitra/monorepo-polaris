'use client';

import { ExternalLink, LoaderCircle, RotateCw } from 'lucide-react';

interface ArticlePosterSidebarProps {
  posterUrl: string | null;
  title: string;
  isRegenerating: boolean;
  onRegenerate: () => void;
}

export function ArticlePosterSidebar({ posterUrl, title, isRegenerating, onRegenerate }: ArticlePosterSidebarProps) {
  return (
    <div className="bg-white dark:bg-[#0E131F] p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
      <span className="text-xs font-extrabold uppercase text-slate-400 dark:text-slate-300">
        Poster Visual
      </span>
      {posterUrl ? (
        <div className="rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={posterUrl} alt={title} className="w-full object-cover max-h-[320px]" />
          <div className="p-3 bg-slate-50 dark:bg-slate-800/80 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center text-xs">
            <span className="text-slate-500 dark:text-slate-300 text-[10px]">Cloudflare R2 WebP</span>
            <a
              href={posterUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 dark:text-blue-400 font-bold hover:underline flex items-center gap-1 text-[11px]"
            >
              Buka Resolusi Penuh <ExternalLink className="h-3 w-3" />
            </a>
          </div>
        </div>
      ) : (
        <div className="h-40 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-dashed border-slate-200 dark:border-slate-800 flex flex-col items-center justify-center gap-2 text-xs text-slate-500 dark:text-slate-200">
          <span className="font-semibold text-slate-700 dark:text-white">Poster belum tersedia</span>
          <span className="text-[11px] text-slate-400 dark:text-slate-400">Naskah tetap tersimpan dan dapat ditinjau.</span>
        </div>
      )}
      <button
        type="button"
        onClick={onRegenerate}
        disabled={isRegenerating}
        className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3.5 py-2.5 text-xs font-bold text-slate-700 dark:text-white transition hover:border-blue-500 dark:hover:border-blue-400 hover:text-blue-700 dark:hover:text-blue-300 hover:bg-slate-50 dark:hover:bg-slate-700/80 shadow-xs cursor-pointer disabled:cursor-wait disabled:opacity-60"
      >
        {isRegenerating ? (
          <LoaderCircle aria-hidden="true" className="h-3.5 w-3.5 animate-spin text-blue-500" />
        ) : (
          <RotateCw aria-hidden="true" className="h-3.5 w-3.5" />
        )}
        <span>{isRegenerating ? 'Poster masuk antrean...' : 'Buat ulang poster'}</span>
      </button>
    </div>
  );
}
