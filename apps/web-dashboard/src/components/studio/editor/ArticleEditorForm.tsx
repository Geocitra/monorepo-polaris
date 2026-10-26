'use client';

import dynamic from 'next/dynamic';
import { Loader2 } from 'lucide-react';

const TiptapExecutiveEditor = dynamic(
  () => import('@/components/studio/artikel/TiptapExecutiveEditor').then((m) => m.TiptapExecutiveEditor),
  {
    ssr: false,
    loading: () => (
      <div className="p-12 text-center text-xs text-slate-400 flex items-center justify-center gap-2">
        <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
        <span>Memuat Kanvas Naskah TipTap...</span>
      </div>
    ),
  }
);

interface ArticleEditorFormProps {
  title: string;
  setTitle: (val: string) => void;
  excerpt: string;
  setExcerpt: (val: string) => void;
  bodyContentMarkdown: string;
  setBodyContentMarkdown: (val: string) => void;
  posterUrl?: string | null;
}

export function ArticleEditorForm({
  title,
  setTitle,
  excerpt,
  setExcerpt,
  bodyContentMarkdown,
  setBodyContentMarkdown,
  posterUrl,
}: ArticleEditorFormProps) {
  return (
    <div className="bg-white dark:bg-slate-900 p-6 md:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
      <div>
        <label className="block text-[11px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-200">
          Judul Artikel & Risalah Kebijakan
        </label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Judul artikel atau siaran pers dewan..."
          className="mt-1 block w-full text-xl sm:text-2xl font-black text-slate-900 dark:text-white border-b border-slate-200 dark:border-slate-700 bg-transparent pb-3 focus:border-blue-600 dark:focus:border-blue-400 focus:outline-none tracking-tight placeholder:text-slate-400 dark:placeholder:text-slate-500"
        />
      </div>

      <div>
        <label className="block text-[11px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-200">
          Ringkasan Eksekutif (Excerpt / Lead In)
        </label>
        <textarea
          rows={2}
          value={excerpt}
          onChange={(e) => setExcerpt(e.target.value)}
          placeholder="Ringkasan singkat artikel 1-2 kalimat..."
          className="mt-1 block w-full rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50/60 dark:bg-slate-800/80 p-3.5 text-xs sm:text-sm italic text-slate-700 dark:text-slate-100 focus:border-blue-600 dark:focus:border-blue-400 focus:outline-none placeholder:text-slate-400 dark:placeholder:text-slate-500"
        />
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="block text-[11px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-200">
            Naskah Lengkap (WYSIWYG Visual Editor)
          </label>
          <span className="text-[11px] text-slate-400 dark:text-slate-300 font-medium">
            Format artikel profesional dengan dukungan foto, grafik, dan tabel
          </span>
        </div>

        <div className="border border-slate-200 dark:border-slate-800 rounded-3xl shadow-inner bg-slate-50/50 dark:bg-slate-950/40 p-2 sm:p-5">
          <TiptapExecutiveEditor
            content={bodyContentMarkdown}
            onContentChange={(newHtml) => {
              setBodyContentMarkdown(newHtml);
            }}
            editable={true}
            compactMode={true}
            aiPosterUrl={posterUrl}
          />
        </div>
      </div>
    </div>
  );
}
