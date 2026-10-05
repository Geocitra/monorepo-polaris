'use client';

import { Card } from '@/components/ui/card';
import { TrendingUp } from 'lucide-react';

interface PulseMetricsProps {
  metrics?: {
    totalAspirasi?: number;
    pendingFollowUp?: number;
    resolvedAspirasi?: number;
    sentimentIndex?: string;
  };
}

export function PulseMetrics({ metrics }: PulseMetricsProps) {
  return (
    <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <Card className="p-5 space-y-1">
        <span className="text-[10px] font-extrabold uppercase text-slate-400">Aspirasi Masuk (7 Hari)</span>
        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-black text-slate-900">{metrics?.totalAspirasi || 0}</span>
          <span className="text-xs font-bold text-green-600 flex items-center">
            <TrendingUp className="h-3 w-3 mr-0.5" /> +12%
          </span>
        </div>
        <p className="text-[11px] text-slate-500 font-medium">Dari warga konstituen dapil</p>
      </Card>

      <Card className="p-5 space-y-1">
        <span className="text-[10px] font-extrabold uppercase text-slate-400">Menunggu Tindak Lanjut</span>
        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-black text-amber-600">{metrics?.pendingFollowUp || 0}</span>
          <span className="text-xs font-bold text-slate-400">Laporan</span>
        </div>
        <p className="text-[11px] text-slate-500 font-medium">Status RECEIVED di inbox</p>
      </Card>

      <Card className="p-5 space-y-1">
        <span className="text-[10px] font-extrabold uppercase text-slate-400">Kasus Terselesaikan</span>
        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-black text-blue-600">{metrics?.resolvedAspirasi || 0}</span>
          <span className="text-xs font-bold text-slate-400">Disposisi</span>
        </div>
        <p className="text-[11px] text-slate-500 font-medium">Berhasil diadvokasi ke dinas</p>
      </Card>

      <Card className="p-5 space-y-1">
        <span className="text-[10px] font-extrabold uppercase text-slate-400">Sentimen Media Daerah</span>
        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-black text-green-600">{metrics?.sentimentIndex || '74%'}</span>
          <span className="text-xs font-bold text-green-700">Positif</span>
        </div>
        <p className="text-[11px] text-slate-500 font-medium">Berdasarkan crawler berita lokal</p>
      </Card>
    </section>
  );
}
