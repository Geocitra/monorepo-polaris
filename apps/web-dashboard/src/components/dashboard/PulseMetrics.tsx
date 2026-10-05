'use client';

import { Card } from '@/components/ui/card';

interface PulseMetricsProps {
  metrics?: {
    totalAspirasi?: number;
    pendingFollowUp?: number;
    resolvedAspirasi?: number;
    sentimentIndex?: string | null;
    sentimentLabel?: string;
  };
}

export function PulseMetrics({ metrics }: PulseMetricsProps) {
  return (
    <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <Card className="p-5 space-y-1">
        <span className="text-[10px] font-extrabold uppercase text-slate-400">Aspirasi Masuk (7 Hari)</span>
        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-black text-slate-900">{metrics?.totalAspirasi ?? '—'}</span>
        </div>
        <p className="text-[11px] text-slate-500 font-medium">Dari warga konstituen dapil</p>
      </Card>

      <Card className="p-5 space-y-1">
        <span className="text-[10px] font-extrabold uppercase text-slate-400">Menunggu Tindak Lanjut</span>
        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-black text-amber-600">{metrics?.pendingFollowUp ?? '—'}</span>
          <span className="text-xs font-bold text-slate-400">Laporan</span>
        </div>
        <p className="text-[11px] text-slate-500 font-medium">Status RECEIVED atau VERIFIED</p>
      </Card>

      <Card className="p-5 space-y-1">
        <span className="text-[10px] font-extrabold uppercase text-slate-400">Kasus Terselesaikan</span>
        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-black text-blue-600">{metrics?.resolvedAspirasi ?? '—'}</span>
          <span className="text-xs font-bold text-slate-400">Disposisi</span>
        </div>
        <p className="text-[11px] text-slate-500 font-medium">Aspirasi berstatus RESPONDED</p>
      </Card>

      <Card className="p-5 space-y-1">
        <span className="text-[10px] font-extrabold uppercase text-slate-400">Indeks Sentimen Berita (Estimasi)</span>
        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-black text-slate-700">{metrics?.sentimentIndex ?? '—'}</span>
          <span className="text-xs font-bold text-slate-500">{metrics?.sentimentLabel || 'Data belum tersedia'}</span>
        </div>
        <p className="text-[11px] text-slate-500 font-medium">Estimasi dari berita wilayah dan nasional terbaru</p>
      </Card>
    </section>
  );
}
