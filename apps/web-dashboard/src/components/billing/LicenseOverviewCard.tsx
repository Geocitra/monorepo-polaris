'use client';

import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ShieldCheck, Sparkles, Calendar, FileText, Image as ImageIcon, Zap, Clock } from 'lucide-react';
import { formatDateIndonesian } from '@/lib/utils';

interface LicenseOverviewCardProps {
  fullName?: string;
  partyAffiliation?: string;
  isSubActive: boolean;
  currentPeriodEnd?: string | null;
  articleUsed?: number;
  dalleUsed?: number;
}

export function LicenseOverviewCard({
  fullName = 'Anggota Dewan',
  partyAffiliation = '',
  isSubActive,
  currentPeriodEnd,
  articleUsed = 0,
  dalleUsed = 0,
}: LicenseOverviewCardProps) {
  let daysLeft: number | null = null;
  if (currentPeriodEnd && isSubActive) {
    const endMs = new Date(currentPeriodEnd).getTime();
    const nowMs = Date.now();
    daysLeft = Math.max(0, Math.ceil((endMs - nowMs) / (1000 * 60 * 60 * 24)));
  }

  return (
    <div className="grid gap-4 md:grid-cols-12 items-stretch">
      {/* 1. IDENTITAS AKUN & STATUS LISENSI (7 cols) */}
      <Card className="md:col-span-7 p-5 sm:p-6 bg-gradient-to-br from-white via-white to-primary/10 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800 border border-slate-200/80 dark:border-slate-800 flex flex-col justify-between space-y-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center space-x-3.5">
            <div className="h-12 w-12 rounded-2xl bg-primary text-primary-foreground flex items-center justify-center shadow-md shadow-primary/20 shrink-0">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-extrabold text-slate-900 dark:text-white text-base leading-tight">
                  {fullName}
                </h3>
                {partyAffiliation ? (
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                    Fraksi {partyAffiliation}
                  </span>
                ) : (
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                    Dewan / Lembaga Publik
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold mt-0.5">
                Ruang Kerja Parlemen POLARIS
              </p>
            </div>
          </div>

          <Badge
            variant={
              !isSubActive
                ? 'amber'
                : daysLeft !== null && daysLeft <= 7
                ? 'amber'
                : 'green'
            }
            className="shrink-0 font-black text-[11px] py-1 px-3"
          >
            {!isSubActive
              ? 'MENUNGGU AKTIVASI'
              : daysLeft !== null && daysLeft <= 7
              ? `SEGERA BERAKHIR (H-${daysLeft})`
              : 'LISENSI AKTIF'}
          </Badge>
        </div>

        {/* CHIPS FITUR PUNCHY */}
        <div className="flex flex-wrap items-center gap-2 pt-1 text-xs font-semibold text-slate-700 dark:text-slate-300">
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200/70 dark:border-emerald-800 text-emerald-800 dark:text-emerald-400">
            <Sparkles className="h-3.5 w-3.5 text-emerald-600" />
            <span>AI Artikel & Poster: <strong>Unlimited</strong></span>
          </div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-primary/10 border border-primary/20 text-primary">
            <span>🌐 Portal Publik Resmi: <strong>Aktif</strong></span>
          </div>
        </div>

        {/* MICRO-GUARANTEE ACCUMULATION */}
        <div className="flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400 font-medium pt-1 border-t border-slate-100 dark:border-slate-800">
          <Zap className="h-3.5 w-3.5 text-amber-500 shrink-0" />
          <span>Garansi Akumulasi: Sisa hari aktif tidak akan hangus saat perpanjangan.</span>
        </div>
      </Card>

      {/* 2. HITUNG MUNDUR MASA AKTIF (3 cols) */}
      <Card className="md:col-span-3 p-5 sm:p-6 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 flex flex-col justify-between text-center md:text-left">
        <div className="flex items-center justify-between text-slate-400">
          <span className="text-[10px] font-black uppercase tracking-wider">Masa Berlaku</span>
          <Calendar className="h-4 w-4 text-primary" />
        </div>

        <div className="my-2">
          {isSubActive && daysLeft !== null ? (
            <div className="space-y-0.5">
              <div className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
                {daysLeft} <span className="text-sm font-bold text-slate-500">Hari</span>
              </div>
              <p className="text-[11px] font-bold text-emerald-600">
                Tersisa hingga {formatDateIndonesian(currentPeriodEnd!)}
              </p>
            </div>
          ) : (
            <div className="space-y-0.5">
              <div className="text-2xl font-black text-amber-600">
                Belum Aktif
              </div>
              <p className="text-[11px] text-slate-400">
                Pilih paket di bawah untuk aktivasi
              </p>
            </div>
          )}
        </div>

        <div className="text-[11px] text-slate-400 pt-2 border-t border-slate-100 flex items-center gap-1 justify-center md:justify-start">
          <Clock className="h-3 w-3" />
          <span>Grace period 3 hari aktif</span>
        </div>
      </Card>

      {/* 3. QUICK STATS OUTPUT (2 cols) */}
      <Card className="md:col-span-2 p-5 sm:p-6 bg-slate-900 text-white border-0 flex flex-col justify-between">
        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
          Output Anda
        </span>

        <div className="space-y-3 my-2">
          <div>
            <div className="text-xl font-black text-white font-mono">
              {articleUsed}
            </div>
            <div className="text-[11px] text-slate-400 font-medium">Naskah Kajian</div>
          </div>
          <div>
            <div className="text-xl font-black text-white font-mono">
              {dalleUsed}
            </div>
            <div className="text-[11px] text-slate-400 font-medium">Poster Visual</div>
          </div>
        </div>

        <div className="text-[10px] font-bold text-emerald-400 flex items-center gap-1">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span>Server Siap 24/7</span>
        </div>
      </Card>
    </div>
  );
}
