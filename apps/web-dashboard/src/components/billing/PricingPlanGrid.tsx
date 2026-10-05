'use client';

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Check, Crown, CreditCard, ShieldCheck, Clock, Receipt, Zap } from 'lucide-react';

interface PricingPlanGridProps {
  onCheckout: (cycle: 'MONTHLY' | 'SEMESTER' | 'ANNUAL') => void;
  checkoutLoading: string | null;
  isSubActive?: boolean;
}

export function PricingPlanGrid({
  onCheckout,
  checkoutLoading,
  isSubActive = false,
}: PricingPlanGridProps) {
  return (
    <section className="space-y-6">
      {/* HEADER SECTION */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200/80 dark:border-slate-800 pb-3">
        <div>
          <span className="text-[10px] font-black uppercase tracking-widest text-primary">
            Siklus Perpanjangan
          </span>
          <h2 className="text-lg font-black text-slate-900 dark:text-white">
            Pilih Durasi Masa Aktif
          </h2>
        </div>

        <div className="flex items-center gap-2 text-xs font-semibold text-slate-600 dark:text-slate-400 bg-slate-100/80 dark:bg-slate-800 px-3 py-1 rounded-full self-start sm:self-auto">
          <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>Semua paket mencakup AI Unlimited & Portal Resmi</span>
        </div>
      </div>

      {/* 3 PRICING CARDS */}
      <div className="grid gap-5 md:grid-cols-3 items-stretch">
        {/* 1. PAKET BULANAN (1 BULAN) */}
        <Card className="p-6 flex flex-col justify-between hover:border-slate-300 dark:hover:border-slate-700 transition-all border border-slate-200/90 dark:border-slate-800 rounded-2xl bg-white dark:bg-slate-900 space-y-5">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 bg-slate-100 dark:bg-slate-800 px-2.5 py-0.5 rounded-full">
                Fleksibel
              </span>
              <span className="text-xs font-bold text-slate-400">30 Hari</span>
            </div>

            <div>
              <h3 className="text-lg font-black text-slate-900 dark:text-white">Paket 1 Bulan</h3>
              <div className="mt-1 flex items-baseline gap-1">
                <span className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Rp2.000.000</span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium mt-1">
                Cocok untuk evaluasi awal atau masa sidang singkat
              </p>
            </div>

            <ul className="text-xs space-y-2.5 pt-3 border-t border-slate-100 dark:border-slate-800 text-slate-600 dark:text-slate-300">
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4 text-emerald-600 shrink-0 stroke-[2.5]" />
                <span><strong>+30 Hari</strong> Masa Aktif Langsung</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4 text-emerald-600 shrink-0 stroke-[2.5]" />
                <span>Unlimited Naskah AI & Poster DALL-E</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4 text-emerald-600 shrink-0 stroke-[2.5]" />
                <span>Website Publik & Kanal Aspirasi Warga</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4 text-emerald-600 shrink-0 stroke-[2.5]" />
                <span>Garansi Hari Aktif Tidak Hangus</span>
              </li>
            </ul>
          </div>

          <Button
            onClick={() => onCheckout('MONTHLY')}
            disabled={checkoutLoading !== null}
            loading={checkoutLoading === 'MONTHLY'}
            variant="outline"
            className="w-full font-extrabold text-xs cursor-pointer py-2.5 mt-2 rounded-xl"
          >
            {isSubActive ? 'Perpanjang +30 Hari' : 'Pilih Paket 1 Bulan'}
          </Button>
        </Card>

        {/* 2. PAKET 6 BULAN (PALING POPULER) */}
        <Card className="p-6 flex flex-col justify-between border-2 border-primary shadow-xl shadow-primary/10 rounded-2xl relative bg-gradient-to-b from-primary/10 via-white to-white dark:via-slate-900 dark:to-slate-900 space-y-5">
          <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-primary text-primary-foreground text-[10px] font-black uppercase tracking-wider shadow-sm">
            Paling Populer & Rekomendasi
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-700 bg-emerald-100 px-2.5 py-0.5 rounded-full">
                Hemat Rp2 Juta
              </span>
              <span className="text-xs font-bold text-primary">180 Hari</span>
            </div>

            <div>
              <h3 className="text-lg font-black text-slate-900 dark:text-white">Paket 6 Bulan</h3>
              <div className="mt-1 flex items-baseline gap-1.5">
                <span className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Rp10.000.000</span>
                <span className="text-xs font-semibold text-slate-500">~Rp1,66 Jt/bln</span>
              </div>
              <p className="text-[11px] text-primary font-semibold mt-1">
                Paling efisien untuk 1 siklus masa persidangan & reses
              </p>
            </div>

            <ul className="text-xs space-y-2.5 pt-3 border-t border-slate-100 text-slate-700">
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4 text-primary shrink-0 stroke-[2.5]" />
                <span><strong>+180 Hari</strong> Masa Aktif Penuh</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4 text-primary shrink-0 stroke-[2.5]" />
                <span>Unlimited Naskah AI & Poster DALL-E</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4 text-primary shrink-0 stroke-[2.5]" />
                <span>Dukungan Custom Domain (.id)</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4 text-primary shrink-0 stroke-[2.5]" />
                <span>Prioritas Rendering AI & Operator Ready</span>
              </li>
            </ul>
          </div>

          <Button
            onClick={() => onCheckout('SEMESTER')}
            disabled={checkoutLoading !== null}
            loading={checkoutLoading === 'SEMESTER'}
            className="w-full bg-primary hover:opacity-90 text-primary-foreground font-extrabold text-xs shadow-md shadow-primary/20 py-2.5 mt-2 rounded-xl cursor-pointer"
          >
            {isSubActive ? 'Perpanjang +180 Hari' : 'Pilih Paket 6 Bulan'}
          </Button>
        </Card>

        {/* 3. PAKET TAHUNAN (1 TAHUN) */}
        <Card className="p-6 flex flex-col justify-between hover:border-slate-300 transition-all border border-slate-200/90 rounded-2xl bg-white space-y-5">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-amber-800 bg-amber-100 px-2.5 py-0.5 rounded-full">
                Potongan 2 Bulan (Hemat Rp4 Jt)
              </span>
              <span className="text-xs font-bold text-slate-400">365 Hari</span>
            </div>

            <div>
              <div className="flex items-center gap-1.5">
                <Crown className="h-4 w-4 text-amber-500" />
                <h3 className="text-lg font-black text-slate-900">Paket 1 Tahun</h3>
              </div>
              <div className="mt-1 flex items-baseline gap-1.5">
                <span className="text-3xl font-black text-slate-900 tracking-tight">Rp20.000.000</span>
                <span className="text-xs font-semibold text-slate-500">~Rp1,67 Jt/bln</span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium mt-1">
                Perlindungan advokasi & publikasi 1 tahun anggaran penuh
              </p>
            </div>

            <ul className="text-xs space-y-2.5 pt-3 border-t border-slate-100 text-slate-600">
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4 text-emerald-600 shrink-0 stroke-[2.5]" />
                <span><strong>+365 Hari</strong> Masa Aktif Penuh</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4 text-emerald-600 shrink-0 stroke-[2.5]" />
                <span>Unlimited Naskah AI & Poster DALL-E</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4 text-emerald-600 shrink-0 stroke-[2.5]" />
                <span>Custom Domain & Arsip Digital Permanen</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4 text-emerald-600 shrink-0 stroke-[2.5]" />
                <span>Bantuan Teknis Prioritas 24/7</span>
              </li>
            </ul>
          </div>

          <Button
            onClick={() => onCheckout('ANNUAL')}
            disabled={checkoutLoading !== null}
            loading={checkoutLoading === 'ANNUAL'}
            variant="outline"
            className="w-full font-extrabold text-xs cursor-pointer py-2.5 mt-2 rounded-xl"
          >
            {isSubActive ? 'Perpanjang +365 Hari' : 'Pilih Tahunan (365 Hari)'}
          </Button>
        </Card>
      </div>

      {/* COMPACT TRUST BADGES (TANPA DINDING TEKS) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-2">
        <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 flex items-center gap-3">
          <div className="h-8 w-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
            <Zap className="h-4 w-4" />
          </div>
          <div>
            <div className="text-xs font-black text-slate-900 dark:text-white leading-tight">Akumulasi Waktu</div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400">Sisa hari aktif tidak hangus</div>
          </div>
        </div>

        <div className="p-3.5 rounded-xl bg-white border border-slate-200/80 flex items-center gap-3">
          <div className="h-8 w-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <CreditCard className="h-4 w-4" />
          </div>
          <div>
            <div className="text-xs font-black text-slate-900 leading-tight">Tanpa Auto-Debit</div>
            <div className="text-[11px] text-slate-500">Bayar via VA Bank / QRIS</div>
          </div>
        </div>

        <div className="p-3.5 rounded-xl bg-white border border-slate-200/80 flex items-center gap-3">
          <div className="h-8 w-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
            <Receipt className="h-4 w-4" />
          </div>
          <div>
            <div className="text-xs font-black text-slate-900 leading-tight">Kwitansi LPJ Resmi</div>
            <div className="text-[11px] text-slate-500">Invoice instan untuk SPJ</div>
          </div>
        </div>

        <div className="p-3.5 rounded-xl bg-white border border-slate-200/80 flex items-center gap-3">
          <div className="h-8 w-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
            <Clock className="h-4 w-4" />
          </div>
          <div>
            <div className="text-xs font-black text-slate-900 leading-tight">Grace Period 3 Hari</div>
            <div className="text-[11px] text-slate-500">Toleransi jeda administrasi</div>
          </div>
        </div>
      </div>
    </section>
  );
}
