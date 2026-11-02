'use client';

import React from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { Eye, Edit3, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

const TiptapExecutiveEditor = dynamic(
  () => import('@/components/studio/artikel/TiptapExecutiveEditor').then((m) => m.TiptapExecutiveEditor),
  {
    ssr: false,
    loading: () => (
      <div className="p-12 text-center text-xs text-slate-400 flex items-center justify-center gap-2">
        <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
        <span>Memuat Kanvas Artikel...</span>
      </div>
    ),
  }
);

interface ArticlePreviewTabProps {
  generatedResult: any;
  currentTitle: string;
  editedTitle: string;
  setEditedTitle: (val: string) => void;
  currentBody: string;
  setEditedBody: (val: string) => void;
  isEditingArticle: boolean;
  setIsEditingArticle: (val: boolean) => void;
  onSaveArticleEdit: () => void;
  authorName?: string;
  partyAffiliation?: string;
  selectedPosterUrl?: string;
}

export function ArticlePreviewTab({
  generatedResult,
  currentTitle,
  editedTitle,
  setEditedTitle,
  currentBody,
  setEditedBody,
  isEditingArticle,
  setIsEditingArticle,
  onSaveArticleEdit,
  authorName = 'Tokoh Publik',
  partyAffiliation = '',
  selectedPosterUrl,
}: ArticlePreviewTabProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
          Kajian lengkap dengan rujukan peraturan
        </span>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsEditingArticle(!isEditingArticle)}
            className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 hover:underline cursor-pointer"
          >
            {isEditingArticle ? <Eye className="h-3.5 w-3.5" /> : <Edit3 className="h-3.5 w-3.5" />}
            <span>{isEditingArticle ? 'Tutup Suntingan' : 'Sunting'}</span>
          </button>
          {generatedResult?.publication?.id && (
            <Link
              href={`/studio/${generatedResult.publication.id}`}
              className="text-xs font-bold text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors ml-2"
            >
              Buka di Editor Lengkap &rarr;
            </Link>
          )}
        </div>
      </div>

      {/* RINGKASAN */}
      <div className="p-4 rounded-2xl bg-blue-50/70 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/60 text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-200 leading-relaxed border-l-4 border-l-blue-600 dark:border-l-blue-500 shadow-2xs">
        <span className="text-[10px] font-black uppercase tracking-wider text-blue-700 dark:text-blue-300 block mb-1">
          Ringkasan
        </span>
        {generatedResult?.publication?.excerpt}
      </div>

      {/* JUDUL ARTIKEL (BISA DISUNTING LANGSUNG) */}
      <div className="space-y-1.5">
        <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
          Judul Artikel Kebijakan:
        </label>
        {isEditingArticle ? (
          <input
            type="text"
            value={editedTitle}
            onChange={(e) => setEditedTitle(e.target.value)}
            placeholder="Judul artikel kebijakan..."
            className="w-full rounded-xl border border-blue-500 dark:border-blue-500 bg-white dark:bg-slate-800 p-3 text-base sm:text-lg font-black text-slate-900 dark:text-white shadow-xs focus:outline-hidden"
          />
        ) : (
          <h2 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white tracking-tight">
            {currentTitle}
          </h2>
        )}
      </div>

      {/* ISI ARTIKEL DENGAN TIPTAP TRUE WYSIWYG EDITOR */}
      <div className="border border-slate-200 dark:border-slate-800 rounded-2xl shadow-inner bg-slate-50/50 dark:bg-slate-950/40 p-2 sm:p-4">
        <TiptapExecutiveEditor
          content={currentBody}
          onContentChange={(newHtml) => {
            setEditedBody(newHtml);
          }}
          authorName={authorName}
          partyName={partyAffiliation}
          editable={isEditingArticle}
          compactMode={true}
          aiPosterUrl={selectedPosterUrl || generatedResult?.posterUrl}
        />
      </div>

      {isEditingArticle && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-2">
          <span className="text-xs text-slate-500">
            Gunakan bilah di atas artikel untuk menyisipkan foto lapangan, tabel data, atau grafik kebijakan.
          </span>
          <Button
            size="sm"
            onClick={onSaveArticleEdit}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs self-end sm:self-auto"
          >
            Simpan Perubahan Artikel
          </Button>
        </div>
      )}
    </div>
  );
}

