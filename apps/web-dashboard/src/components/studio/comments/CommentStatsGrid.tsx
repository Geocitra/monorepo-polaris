'use client';

import { Card } from '@/components/ui/card';

interface CommentStatsGridProps {
  totalPublished: number;
  totalHidden: number;
  totalSpam: number;
}

export function CommentStatsGrid({
  totalPublished,
  totalHidden,
  totalSpam,
}: CommentStatsGridProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-3">
      <Card className="p-4 space-y-1">
        <span className="text-[10px] font-extrabold uppercase text-slate-400">
          Komentar Tayang Aktif
        </span>
        <div className="text-2xl font-black text-green-600">{totalPublished}</div>
        <p className="text-[11px] text-slate-500 font-medium">Dapat dilihat publik di portal</p>
      </Card>

      <Card className="p-4 space-y-1">
        <span className="text-[10px] font-extrabold uppercase text-slate-400">
          Disembunyikan (Hidden)
        </span>
        <div className="text-2xl font-black text-amber-600">{totalHidden}</div>
        <p className="text-[11px] text-slate-500 font-medium">Ditarik dari tampilan publik</p>
      </Card>

      <Card className="p-4 space-y-1">
        <span className="text-[10px] font-extrabold uppercase text-slate-400">
          Terindikasi Spam
        </span>
        <div className="text-2xl font-black text-red-600">{totalSpam}</div>
        <p className="text-[11px] text-slate-500 font-medium">Diblokir otomatis oleh sistem</p>
      </Card>
    </div>
  );
}
