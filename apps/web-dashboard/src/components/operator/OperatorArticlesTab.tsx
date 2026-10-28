'use client';

import React from 'react';
import { BookOpen, Plus, RefreshCw, Search, Edit3 } from 'lucide-react';

interface OperatorArticlesTabProps {
  selectedDewan: any;
  dewanArticles: any[];
  loadingDewanArticles: boolean;
  articlesFilter: 'ALL' | 'DRAFT' | 'PUBLISHED';
  setArticlesFilter: (mode: 'ALL' | 'DRAFT' | 'PUBLISHED') => void;
  articlesSearch: string;
  setArticlesSearch: (search: string) => void;
  onRefresh: () => void;
  onCreateNew: () => void;
  onLoadArticleToCanvas: (articleId: string) => void;
  loadingCanvasArticleId: string | null;
}

export function OperatorArticlesTab({
  selectedDewan,
  dewanArticles,
  loadingDewanArticles,
  articlesFilter,
  setArticlesFilter,
  articlesSearch,
  setArticlesSearch,
  onRefresh,
  onCreateNew,
  onLoadArticleToCanvas,
  loadingCanvasArticleId,
}: OperatorArticlesTabProps) {
  const filteredDewanArticles = dewanArticles.filter((a) => {
    if (articlesFilter === 'DRAFT' && a.status === 'PUBLISHED') return false;
    if (articlesFilter === 'PUBLISHED' && a.status !== 'PUBLISHED') return false;
    if (articlesSearch.trim()) {
      const q = articlesSearch.toLowerCase();
      return (
        a.title?.toLowerCase().includes(q) ||
        a.excerpt?.toLowerCase().includes(q) ||
        a.slug?.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="bg-white dark:bg-[#0B0F19] rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6 animate-in fade-in duration-150">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
        <div>
          <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-indigo-600" />
            <span>Arsip & Draf Naskah: {selectedDewan?.fullName || 'Dewan'}</span>
          </h4>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Daftar seluruh naskah kebijakan, rilis, dan draf yang tersimpan di profil dewan ini.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onCreateNew}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-sm transition cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Buat Naskah Baru</span>
          </button>

          <button
            type="button"
            onClick={onRefresh}
            disabled={loadingDewanArticles}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold hover:bg-slate-50 dark:hover:bg-slate-800 transition cursor-pointer"
          >
            <RefreshCw
              className={`w-3.5 h-3.5 ${loadingDewanArticles ? 'animate-spin' : ''}`}
            />
            <span>Segarkan</span>
          </button>
        </div>
      </div>

      {/* Filter Tabs & Search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none pb-1 sm:pb-0 max-w-full">
          {(['ALL', 'DRAFT', 'PUBLISHED'] as const).map((mode) => {
            const count =
              mode === 'ALL'
                ? dewanArticles.length
                : mode === 'DRAFT'
                ? dewanArticles.filter((a) => a.status !== 'PUBLISHED').length
                : dewanArticles.filter((a) => a.status === 'PUBLISHED').length;
            return (
              <button
                key={mode}
                type="button"
                onClick={() => setArticlesFilter(mode)}
                className={`shrink-0 whitespace-nowrap px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                  articlesFilter === mode
                    ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-sm'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                {mode === 'ALL' ? 'Semua' : mode === 'DRAFT' ? 'Draf' : 'Tayang'}{' '}
                <span className="opacity-75">({count})</span>
              </button>
            );
          })}
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Cari judul naskah..."
            value={articlesSearch}
            onChange={(e) => setArticlesSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
        </div>
      </div>

      {/* List of Articles */}
      {loadingDewanArticles ? (
        <div className="py-12 flex flex-col items-center justify-center text-slate-400 gap-2">
          <RefreshCw className="w-5 h-5 animate-spin text-indigo-600" />
          <span className="text-xs">Memuat arsip naskah dewan...</span>
        </div>
      ) : filteredDewanArticles.length === 0 ? (
        <div className="py-12 text-center space-y-2 border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl">
          <BookOpen className="w-8 h-8 text-slate-300 dark:text-slate-600 mx-auto" />
          <p className="text-xs font-bold text-slate-600 dark:text-slate-400">
            Belum ada naskah untuk filter ini
          </p>
          <p className="text-[11px] text-slate-400">
            Gunakan tab &quot;Pabrik Konten & Visual AI&quot; untuk membuat naskah pertama.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredDewanArticles.map((art) => {
            const isPublished = art.status === 'PUBLISHED';
            const isLoadingCanvas = loadingCanvasArticleId === art.id;

            return (
              <div
                key={art.id}
                className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-indigo-400 dark:hover:border-indigo-600 bg-slate-50/50 dark:bg-slate-900/40 transition flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="min-w-0 flex-1 space-y-1">
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                        isPublished
                          ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                          : 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300 border-amber-200 dark:border-amber-800'
                      }`}
                    >
                      {isPublished ? '✓ TAYANG' : '• DRAF'}
                    </span>
                    <span className="text-[11px] text-slate-400">
                      {art.createdAt
                        ? new Date(art.createdAt).toLocaleDateString('id-ID', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                          })
                        : '-'}
                    </span>
                  </div>
                  <h5 className="text-xs font-bold text-slate-900 dark:text-white line-clamp-1">
                    {art.title}
                  </h5>
                  {art.excerpt && (
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1">
                      {art.excerpt}
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => onLoadArticleToCanvas(art.id)}
                    disabled={isLoadingCanvas}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 text-xs font-bold hover:bg-indigo-100 dark:hover:bg-indigo-900/40 transition cursor-pointer"
                  >
                    {isLoadingCanvas ? (
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Edit3 className="w-3.5 h-3.5" />
                    )}
                    <span>Buka di Kanvas Editor</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
