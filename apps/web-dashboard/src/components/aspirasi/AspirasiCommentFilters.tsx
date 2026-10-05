'use client';

import { Card } from '@/components/ui/card';
import { Search } from 'lucide-react';

interface AspirasiCommentFiltersProps {
  commentSearch: string;
  setCommentSearch: (val: string) => void;
  commentStatusFilter: string;
  setCommentStatusFilter: (val: string) => void;
  totalComments: number;
}

export function AspirasiCommentFilters({
  commentSearch,
  setCommentSearch,
  commentStatusFilter,
  setCommentStatusFilter,
  totalComments,
}: AspirasiCommentFiltersProps) {
  const options = [
    { key: 'ALL', label: 'Semua Status' },
    { key: 'PUBLISHED', label: 'Tayang Publik' },
    { key: 'HIDDEN', label: 'Disembunyikan' },
    { key: 'FLAGGED_SPAM', label: 'Spam / Filtered' },
  ];

  return (
    <Card className="p-4 space-y-3">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Cari komentar, nama warga, atau judul artikel..."
            value={commentSearch}
            onChange={(e) => setCommentSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 text-xs focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary bg-slate-50/50 dark:bg-slate-900 text-slate-900 dark:text-slate-100"
          />
        </div>

        <div className="flex flex-wrap gap-1.5">
          {options.map((st) => (
            <button
              key={st.key}
              type="button"
              onClick={() => setCommentStatusFilter(st.key)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                commentStatusFilter === st.key
                  ? 'bg-primary text-primary-foreground shadow-2xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              {st.label}
            </button>
          ))}
        </div>
      </div>

      <div className="text-[11px] text-slate-500 pt-1 flex items-center justify-between">
        <span>
          Komentar baru otomatis tayang, kecuali terdeteksi kata kasar/spam. Dewan dapat menyembunyikan atau menghapus kapan saja.
        </span>
        <span className="font-bold text-slate-700 shrink-0">
          Total: {totalComments} Komentar
        </span>
      </div>
    </Card>
  );
}
