'use client';

import { 
  Search, 
  X, 
  FileText, 
  Image as ImageIcon, 
  Sparkles, 
  LayoutGrid, 
  CheckCircle2, 
  Clock 
} from 'lucide-react';

export type StatusFilter = 'ALL' | 'PUBLISHED' | 'DRAFT';
export type FormatFilter = 'ALL' | 'ARTICLE' | 'INFOGRAPHIC' | 'TERPADU';

interface ArticleFiltersProps {
  activeStatusFilter: StatusFilter;
  onStatusFilterChange: (filter: StatusFilter) => void;
  activeFormatFilter: FormatFilter;
  onFormatFilterChange: (filter: FormatFilter) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  totalCount: number;
  publishedCount: number;
  draftCount: number;
  articleCount: number;
  infographicCount: number;
  terpaduCount: number;
}

export function ArticleFilters({
  activeStatusFilter,
  onStatusFilterChange,
  activeFormatFilter,
  onFormatFilterChange,
  searchQuery,
  onSearchChange,
  totalCount,
  publishedCount,
  draftCount,
  articleCount,
  infographicCount,
  terpaduCount,
}: ArticleFiltersProps) {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs p-4 space-y-3.5">
      {/* BARIS 1: Filter Format Konten & Pencarian */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        {/* Tab Format Konten */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <button
            type="button"
            onClick={() => onFormatFilterChange('ALL')}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeFormatFilter === 'ALL'
                ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-xs'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            <LayoutGrid className="w-3.5 h-3.5" />
            <span>Semua Format</span>
            <span className="ml-0.5 text-[10px] px-1.5 py-0.2 rounded-full opacity-75 bg-slate-800 text-white dark:bg-slate-200 dark:text-slate-900">
              {totalCount}
            </span>
          </button>

          <button
            type="button"
            onClick={() => onFormatFilterChange('ARTICLE')}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeFormatFilter === 'ARTICLE'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border border-blue-200/60 dark:border-blue-900/60 hover:bg-blue-100 dark:hover:bg-blue-900/40'
            }`}
          >
            <FileText className="w-3.5 h-3.5 text-blue-500 dark:text-blue-400" />
            <span>Artikel Opini</span>
            <span className="ml-0.5 text-[10px] px-1.5 py-0.2 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-200">
              {articleCount}
            </span>
          </button>

          <button
            type="button"
            onClick={() => onFormatFilterChange('INFOGRAPHIC')}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeFormatFilter === 'INFOGRAPHIC'
                ? 'bg-purple-600 text-white shadow-xs'
                : 'bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 border border-purple-200/60 dark:border-purple-900/60 hover:bg-purple-100 dark:hover:bg-purple-900/40'
            }`}
          >
            <ImageIcon className="w-3.5 h-3.5 text-purple-500 dark:text-purple-400" />
            <span>Infografis & Visual</span>
            <span className="ml-0.5 text-[10px] px-1.5 py-0.2 rounded-full bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-200">
              {infographicCount}
            </span>
          </button>

          <button
            type="button"
            onClick={() => onFormatFilterChange('TERPADU')}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeFormatFilter === 'TERPADU'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-900/60 hover:bg-emerald-100 dark:hover:bg-emerald-900/40'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-emerald-500 dark:text-emerald-400" />
            <span>Kampanye Terpadu</span>
            <span className="ml-0.5 text-[10px] px-1.5 py-0.2 rounded-full bg-emerald-100 dark:bg-emerald-900 text-emerald-700 dark:text-emerald-200">
              {terpaduCount}
            </span>
          </button>
        </div>

        {/* Input Pencarian */}
        <div className="relative w-full lg:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Cari topik atau judul konten..."
            className="w-full pl-8 pr-8 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-blue-600 dark:focus:border-blue-500 bg-slate-50/70 dark:bg-slate-800/60 transition-colors"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => onSearchChange('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 p-0.5 rounded text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* BARIS 2: Filter Status Tayang (Sub-filter) */}
      <div className="flex items-center gap-1 pt-2 border-t border-slate-100 dark:border-slate-800/80 overflow-x-auto scrollbar-none pb-0.5 max-w-full">
        <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500 mr-2 uppercase tracking-wider shrink-0">
          Status:
        </span>
        <button
          type="button"
          onClick={() => onStatusFilterChange('ALL')}
          className={`shrink-0 whitespace-nowrap px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
            activeStatusFilter === 'ALL'
              ? 'bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-white'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          Semua ({totalCount})
        </button>
        <button
          type="button"
          onClick={() => onStatusFilterChange('PUBLISHED')}
          className={`shrink-0 whitespace-nowrap inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
            activeStatusFilter === 'PUBLISHED'
              ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 font-extrabold'
              : 'text-slate-500 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/30'
          }`}
        >
          <CheckCircle2 className="w-3 h-3 text-emerald-500" />
          <span>Tayang di Web ({publishedCount})</span>
        </button>
        <button
          type="button"
          onClick={() => onStatusFilterChange('DRAFT')}
          className={`shrink-0 whitespace-nowrap inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
            activeStatusFilter === 'DRAFT'
              ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 font-extrabold'
              : 'text-slate-500 dark:text-slate-400 hover:text-amber-600 dark:hover:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/30'
          }`}
        >
          <Clock className="w-3 h-3 text-amber-500" />
          <span>Draf ({draftCount})</span>
        </button>
      </div>
    </div>
  );
}
