'use client';

import { Search } from 'lucide-react';

interface ArticleFiltersProps {
  activeFilter: 'ALL' | 'PUBLISHED' | 'DRAFT';
  onFilterChange: (filter: 'ALL' | 'PUBLISHED' | 'DRAFT') => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  totalCount: number;
  publishedCount: number;
  draftCount: number;
}

export function ArticleFilters({
  activeFilter,
  onFilterChange,
  searchQuery,
  onSearchChange,
  totalCount,
  publishedCount,
  draftCount,
}: ArticleFiltersProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-slate-900 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
      <div className="flex items-center gap-1.5 flex-wrap">
        <button
          type="button"
          onClick={() => onFilterChange('ALL')}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeFilter === 'ALL'
              ? 'bg-primary text-primary-foreground shadow-xs'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
          }`}
        >
          Semua ({totalCount})
        </button>
        <button
          type="button"
          onClick={() => onFilterChange('PUBLISHED')}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeFilter === 'PUBLISHED'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
          }`}
        >
          Tayang di Web ({publishedCount})
        </button>
        <button
          type="button"
          onClick={() => onFilterChange('DRAFT')}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeFilter === 'DRAFT'
              ? 'bg-slate-800 dark:bg-slate-700 text-white shadow-xs'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
          }`}
        >
          Draf ({draftCount})
        </button>
      </div>

      <div className="relative w-full sm:w-72">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Cari judul konten..."
          className="w-full pl-8 pr-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-blue-600 dark:focus:border-blue-500 bg-slate-50/50 dark:bg-slate-800/60"
        />
      </div>
    </div>
  );
}
