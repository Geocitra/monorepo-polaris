'use client';

import { Card } from '@/components/ui/card';
import { Search } from 'lucide-react';

interface CommentFiltersProps {
  searchQuery: string;
  setSearchQuery: (val: string) => void;
  statusFilter: string;
  setStatusFilter: (val: string) => void;
}

export function CommentFilters({
  searchQuery,
  setSearchQuery,
  statusFilter,
  setStatusFilter,
}: CommentFiltersProps) {
  const filterOptions = [
    { id: 'ALL', label: 'Semua' },
    { id: 'PUBLISHED', label: 'Tayang' },
    { id: 'HIDDEN', label: 'Disembunyikan' },
    { id: 'FLAGGED_SPAM', label: 'Spam' },
  ];

  return (
    <Card className="p-4 space-y-3">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Cari nama warga, judul artikel, atau isi komentar..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 text-xs focus:border-blue-600 focus:outline-none bg-slate-50/50"
          />
        </div>

        <div className="flex flex-wrap gap-1.5">
          {filterOptions.map((opt) => (
            <button
              key={opt.id}
              type="button"
              onClick={() => setStatusFilter(opt.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                statusFilter === opt.id
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>
    </Card>
  );
}
