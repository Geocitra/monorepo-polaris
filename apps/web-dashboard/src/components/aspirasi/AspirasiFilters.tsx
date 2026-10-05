'use client';

import { Card } from '@/components/ui/card';
import { Search, Filter } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AspirasiFiltersProps {
  searchQuery: string;
  setSearchQuery: (val: string) => void;
  statusFilter: string;
  setStatusFilter: (val: string) => void;
  categoryFilter: string;
  setCategoryFilter: (val: string) => void;
}

export function AspirasiFilters({
  searchQuery,
  setSearchQuery,
  statusFilter,
  setStatusFilter,
  categoryFilter,
  setCategoryFilter,
}: AspirasiFiltersProps) {
  const statusOptions = [
    { key: 'ALL', label: 'Semua Status' },
    { key: 'RECEIVED', label: 'RECEIVED' },
    { key: 'VERIFIED', label: 'VERIFIED' },
    { key: 'RESPONDED', label: 'RESPONDED' },
  ];

  const categories = [
    'ALL',
    'INFRASTRUKTUR',
    'PERTANIAN',
    'PENDIDIKAN',
    'KESEHATAN',
    'BANSOS_UMKM',
    'LAINNYA',
  ];

  return (
    <Card className="p-4 space-y-3">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Cari tiket (#CS-...), kecamatan, atau kata kunci aspirasi..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 text-xs focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary bg-slate-50/50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500"
          />
        </div>

        <div className="flex flex-wrap gap-1.5">
          {statusOptions.map((st) => (
            <button
              key={st.key}
              type="button"
              onClick={() => setStatusFilter(st.key)}
              className={cn(
                'px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer',
                statusFilter === st.key
                  ? 'bg-primary text-primary-foreground shadow-2xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              )}
            >
              {st.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-2 pt-2 border-t border-slate-100 dark:border-slate-800 flex-wrap text-xs">
        <span className="text-slate-400 font-medium flex items-center gap-1">
          <Filter className="h-3 w-3" /> Kategori:
        </span>
        {categories.map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => setCategoryFilter(cat)}
            className={cn(
              'px-2 py-0.5 rounded text-[11px] font-semibold transition-all cursor-pointer',
              categoryFilter === cat
                ? 'bg-primary text-primary-foreground font-bold shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 dark:hover:text-slate-200'
            )}
          >
            {cat === 'ALL' ? 'Semua Kategori' : cat}
          </button>
        ))}
      </div>
    </Card>
  );
}
