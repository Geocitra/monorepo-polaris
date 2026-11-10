'use client';

import { 
  Search, 
  X, 
  FileText, 
  Image as ImageIcon, 
  Sparkles, 
  LayoutGrid, 
  CheckCircle2, 
  Clock,
  RotateCcw
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
  const isFiltered = activeStatusFilter !== 'ALL' || activeFormatFilter !== 'ALL' || searchQuery.trim() !== '';

  const handleResetFilters = () => {
    onFormatFilterChange('ALL');
    onStatusFilterChange('ALL');
    onSearchChange('');
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-xs p-2.5 sm:p-3 transition-all">
      <div className="flex flex-col 2xl:flex-row 2xl:items-center justify-between gap-2.5">
        
        {/* KELOMPOK FILTER (FORMAT & STATUS TERPADU) */}
        <div className="flex items-center gap-2 flex-wrap min-w-0">
          
          {/* 1. Format Konten Segmented Bar */}
          <div className="inline-flex items-center gap-1 p-1 rounded-xl bg-slate-100/90 dark:bg-slate-800/80 border border-slate-200/60 dark:border-slate-700/50 max-w-full overflow-x-auto scrollbar-none">
            <button
              type="button"
              onClick={() => onFormatFilterChange('ALL')}
              className={`shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeFormatFilter === 'ALL'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-white/50 dark:hover:bg-slate-700/50'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5 opacity-70" />
              <span>Semua Format</span>
              <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded-md ${
                activeFormatFilter === 'ALL'
                  ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-extrabold'
                  : 'bg-slate-200/70 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
              }`}>
                {totalCount}
              </span>
            </button>

            <button
              type="button"
              onClick={() => onFormatFilterChange('ARTICLE')}
              className={`shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeFormatFilter === 'ARTICLE'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-white/50 dark:hover:bg-slate-700/50'
              }`}
            >
              <FileText className={`w-3.5 h-3.5 ${activeFormatFilter === 'ARTICLE' ? 'text-white' : 'text-blue-500'}`} />
              <span>Artikel Opini</span>
              <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded-md ${
                activeFormatFilter === 'ARTICLE'
                  ? 'bg-blue-700 text-white font-extrabold'
                  : 'bg-blue-100/70 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300'
              }`}>
                {articleCount}
              </span>
            </button>

            <button
              type="button"
              onClick={() => onFormatFilterChange('INFOGRAPHIC')}
              className={`shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeFormatFilter === 'INFOGRAPHIC'
                  ? 'bg-purple-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-purple-600 dark:hover:text-purple-400 hover:bg-white/50 dark:hover:bg-slate-700/50'
              }`}
            >
              <ImageIcon className={`w-3.5 h-3.5 ${activeFormatFilter === 'INFOGRAPHIC' ? 'text-white' : 'text-purple-500'}`} />
              <span>Infografis & Visual</span>
              <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded-md ${
                activeFormatFilter === 'INFOGRAPHIC'
                  ? 'bg-purple-700 text-white font-extrabold'
                  : 'bg-purple-100/70 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300'
              }`}>
                {infographicCount}
              </span>
            </button>

            <button
              type="button"
              onClick={() => onFormatFilterChange('TERPADU')}
              className={`shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeFormatFilter === 'TERPADU'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-white/50 dark:hover:bg-slate-700/50'
              }`}
            >
              <Sparkles className={`w-3.5 h-3.5 ${activeFormatFilter === 'TERPADU' ? 'text-white' : 'text-emerald-500'}`} />
              <span>Kampanye Terpadu</span>
              <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded-md ${
                activeFormatFilter === 'TERPADU'
                  ? 'bg-emerald-700 text-white font-extrabold'
                  : 'bg-emerald-100/70 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300'
              }`}>
                {terpaduCount}
              </span>
            </button>
          </div>

          {/* Pemisah Vertikal Halus */}
          <div className="hidden sm:block h-6 w-px bg-slate-200 dark:bg-slate-700 shrink-0 mx-0.5" />

          {/* 2. Status Publikasi Segmented Bar */}
          <div className="inline-flex items-center gap-1 p-1 rounded-xl bg-slate-100/90 dark:bg-slate-800/80 border border-slate-200/60 dark:border-slate-700/50 max-w-full overflow-x-auto scrollbar-none">
            <button
              type="button"
              onClick={() => onStatusFilterChange('ALL')}
              className={`shrink-0 px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeStatusFilter === 'ALL'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-white/50 dark:hover:bg-slate-700/50'
              }`}
            >
              Semua ({totalCount})
            </button>

            <button
              type="button"
              onClick={() => onStatusFilterChange('PUBLISHED')}
              className={`shrink-0 inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeStatusFilter === 'PUBLISHED'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-white/50 dark:hover:bg-slate-700/50'
              }`}
            >
              <CheckCircle2 className={`w-3 h-3 ${activeStatusFilter === 'PUBLISHED' ? 'text-white' : 'text-emerald-500'}`} />
              <span>Tayang ({publishedCount})</span>
            </button>

            <button
              type="button"
              onClick={() => onStatusFilterChange('DRAFT')}
              className={`shrink-0 inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeStatusFilter === 'DRAFT'
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-amber-600 dark:hover:text-amber-400 hover:bg-white/50 dark:hover:bg-slate-700/50'
              }`}
            >
              <Clock className={`w-3 h-3 ${activeStatusFilter === 'DRAFT' ? 'text-white' : 'text-amber-500'}`} />
              <span>Draf ({draftCount})</span>
            </button>
          </div>

          {/* Tombol Reset Filter jika aktif */}
          {isFiltered && (
            <button
              type="button"
              onClick={handleResetFilters}
              title="Reset seluruh filter pencarian"
              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-bold text-slate-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition cursor-pointer"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset</span>
            </button>
          )}
        </div>

        {/* INPUT PENCARIAN TERPADU */}
        <div className="relative w-full 2xl:w-80 shrink-0">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Cari topik atau judul konten..."
            className="w-full pl-8.5 pr-8 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 bg-slate-50/70 dark:bg-slate-800/60 transition-colors"
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
    </div>
  );
}
