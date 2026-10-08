'use client';

import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Check,
  X,
  Crown,
  CreditCard,
  ShieldCheck,
  Clock,
  Receipt,
  Zap,
  Sparkles,
  ArrowRight,
  CheckCircle2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { TierOfferingDto } from '@polaris/shared-types';

interface PricingPlanGridProps {
  selectedCycle: 'MONTHLY' | 'SEMESTER' | 'ANNUAL';
  onCycleChange: (cycle: 'MONTHLY' | 'SEMESTER' | 'ANNUAL') => void;
  selectedTier: string;
  onTierChange: (tier: string) => void;
  tierOfferings?: TierOfferingDto[];
  onCheckout: (cycle: 'MONTHLY' | 'SEMESTER' | 'ANNUAL', tier: string, matrixId?: string) => void;
  checkoutLoading: string | null;
  isSubActive?: boolean;
  currentTier?: string;
  currentPeriodEnd?: string | null;
}

export function PricingPlanGrid({
  selectedCycle,
  onCycleChange,
  selectedTier,
  onTierChange,
  tierOfferings,
  onCheckout,
  checkoutLoading,
  isSubActive = false,
  currentTier,
  currentPeriodEnd,
}: PricingPlanGridProps) {
  const cycles: Array<{ id: 'MONTHLY' | 'SEMESTER' | 'ANNUAL'; label: string; duration: string; badge?: string }> = [
    { id: 'MONTHLY', label: '1 Bulan', duration: '30 Hari' },
    { id: 'SEMESTER', label: '6 Bulan (Semester)', duration: '180 Hari', badge: 'Diskon ~15%' },
    { id: 'ANNUAL', label: '1 Tahun (Tahunan)', duration: '365 Hari', badge: 'Hemat ~25%' },
  ];

  // Ambil penawaran STARTER (Standar) dan PRO (Eksekutif Suite) untuk antarmuka dewan
  const rawOfferings = tierOfferings && tierOfferings.length > 0 ? tierOfferings : [];
  const offerings = rawOfferings.filter((t) => t.tier === 'STARTER' || t.tier === 'PRO').length > 0
    ? rawOfferings.filter((t) => t.tier === 'STARTER' || t.tier === 'PRO')
    : rawOfferings;

  // Resolusi tier terpilih (default PRO jika belum dipilih)
  const effectiveSelectedTier = selectedTier === 'STARTER' ? 'STARTER' : 'PRO';
  const activeTierObj = offerings.find((t) => t.tier === effectiveSelectedTier) || offerings[0] || null;
  const activeCyclePricing = activeTierObj?.pricing?.[selectedCycle];

  return (
    <section className="space-y-6">
      {/* 1. CYCLE SWITCHER TOGGLE (DIMENSI WAKTU DI ATAS) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 dark:border-slate-800 pb-4">
        <div>
          <span className="text-[10px] font-black uppercase tracking-widest text-blue-600 dark:text-blue-400">
            Dimensi Waktu (Billing Cycle)
          </span>
          <h2 className="text-lg font-black text-slate-900 dark:text-white mt-0.5">
            Pilih Durasi Masa Aktif Lisensi
          </h2>
        </div>

        {/* Horizontal Segmented Switcher */}
        <div className="inline-flex p-1 rounded-2xl bg-slate-100 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 self-start sm:self-auto">
          {cycles.map((c) => {
            const isCurrent = selectedCycle === c.id;
            return (
              <button
                key={c.id}
                type="button"
                onClick={() => onCycleChange(c.id)}
                className={cn(
                  'px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer relative',
                  isCurrent
                    ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-sm font-extrabold ring-1 ring-slate-200/60 dark:ring-slate-700'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                )}
              >
                <span>{c.label}</span>
                {c.badge && (
                  <span
                    className={cn(
                      'text-[9px] px-1.5 py-0.2 rounded-full font-black uppercase tracking-wider',
                      isCurrent
                        ? 'bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300'
                        : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                    )}
                  >
                    {c.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. TWO TIERED CARDS (STANDAR PARLEMEN VS EKSEKUTIF SUITE) */}
      <div className="grid gap-6 md:grid-cols-2 items-stretch max-w-5xl mx-auto">
        {offerings.map((offering) => {
          const isSelected = effectiveSelectedTier === offering.tier;
          const cyclePrice = offering.pricing?.[selectedCycle];
          const isCurrentSubTier = currentTier === offering.tier && isSubActive;
          const isPro = offering.tier === 'PRO';
          const isStarter = offering.tier === 'STARTER';

          return (
            <Card
              key={offering.tier}
              onClick={() => onTierChange(offering.tier)}
              className={cn(
                'p-6 sm:p-7 flex flex-col justify-between transition-all rounded-3xl cursor-pointer relative select-none border-2',
                isSelected
                  ? isPro
                    ? 'border-blue-600 dark:border-blue-500 shadow-xl shadow-blue-500/10 ring-2 ring-blue-600/15 bg-gradient-to-b from-blue-50/50 via-white to-white dark:from-blue-950/40 dark:via-slate-900 dark:to-slate-900'
                    : 'border-slate-500 dark:border-slate-400 shadow-xl shadow-slate-500/10 ring-2 ring-slate-500/15 bg-gradient-to-b from-slate-50/70 via-white to-white dark:from-slate-800/40 dark:via-slate-900 dark:to-slate-900'
                  : 'border-slate-200/90 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-900'
              )}
            >
              {/* BADGE DI ATAS */}
              {isPro && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3.5 py-0.5 rounded-full bg-blue-600 text-white text-[10px] font-black uppercase tracking-wider shadow-sm flex items-center gap-1">
                  <Sparkles className="w-3 h-3" />
                  <span>Paling Populer & Lengkap</span>
                </div>
              )}
              {isStarter && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3.5 py-0.5 rounded-full bg-slate-700 text-white text-[10px] font-black uppercase tracking-wider shadow-sm flex items-center gap-1">
                  <span>Standar Parlemen</span>
                </div>
              )}

              <div className="space-y-4">
                {/* HEADER TIER */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span
                      className={cn(
                        'text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full',
                        isPro
                          ? 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
                          : 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300'
                      )}
                    >
                      {isPro ? 'Eksekutif Suite' : 'Standar Parlemen'}
                    </span>
                    {isCurrentSubTier && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                        Aktif Saat Ini
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-1 text-xs font-bold text-slate-400">
                    {isSelected && <CheckCircle2 className="h-4 w-4 text-blue-600 dark:text-blue-400" />}
                    <span>{cyclePrice ? `+${cyclePrice.durationDays} Hari` : ''}</span>
                  </div>
                </div>

                {/* NAMA & HARGA TIER */}
                <div>
                  <h3 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-1.5">
                    {isPro && <Crown className="w-4 h-4 text-amber-500" />}
                    <span>{offering.name}</span>
                  </h3>
                  <div className="mt-1 flex items-baseline gap-1.5 flex-wrap">
                    <span className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                      {cyclePrice?.priceFormatted || 'Tarif Terstandar'}
                    </span>
                    <span className="text-xs font-semibold text-slate-400">
                      {cyclePrice?.monthlyRateFormatted}
                    </span>
                  </div>
                  {cyclePrice?.savingsNote && (
                    <div className="text-[11px] font-extrabold text-emerald-600 dark:text-emerald-400 mt-0.5">
                      {cyclePrice.savingsNote}
                    </div>
                  )}
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-1.5 leading-relaxed">
                    {offering.tagline}
                  </p>
                </div>

                {/* DAFTAR HAK AKSES RESMI */}
                <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 space-y-2.5 text-xs text-slate-600 dark:text-slate-300">
                  <div className="flex items-start gap-2">
                    <Check className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5 stroke-[2.5]" />
                    <span>
                      <strong>+{cyclePrice?.durationDays || 30} Hari</strong> Masa Aktif Penuh
                    </span>
                  </div>

                  <div className="flex items-start gap-2">
                    <Check className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5 stroke-[2.5]" />
                    <span>AI Unlimited (Naskah Legislasi & Poster Dapil)</span>
                  </div>

                  {/* TEMPLATE LAYOUT THEME PERK */}
                  {isPro ? (
                    <div className="flex items-start gap-2">
                      <Check className="h-4 w-4 text-blue-600 shrink-0 mt-0.5 stroke-[2.5]" />
                      <div className="space-y-1">
                        <span className="font-extrabold text-blue-900 dark:text-blue-300">
                          Bebas Ganti Layout Tematik Eksklusif:
                        </span>
                        <ul className="text-[11px] text-slate-500 dark:text-slate-400 pl-2 space-y-0.5 list-disc list-inside">
                          <li>Editorial Prestige (Jurnal Kebijakan)</li>
                          <li>Baliho Hero Karismatik (Visual Masif)</li>
                          <li>Newsroom Press Brief (Siaran Pers)</li>
                        </ul>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-start gap-2">
                      <Check className="h-4 w-4 text-slate-600 dark:text-slate-400 shrink-0 mt-0.5 stroke-[2.5]" />
                      <span>Tata Letak Standar Parlemen (Responsif & Elegan)</span>
                    </div>
                  )}

                  {/* CUSTOM DOMAIN PERK */}
                  {isPro ? (
                    <div className="flex items-start gap-2">
                      <Check className="h-4 w-4 text-blue-600 shrink-0 mt-0.5 stroke-[2.5]" />
                      <span>
                        Dukungan <strong>Custom Domain Pribadi</strong> (<code>namadewan.id</code> / <code>.com</code>)
                      </span>
                    </div>
                  ) : (
                    <div className="flex items-start gap-2">
                      <Check className="h-4 w-4 text-slate-600 dark:text-slate-400 shrink-0 mt-0.5 stroke-[2.5]" />
                      <span>
                        Subdomain Resmi Parlemen (<code>namadewan.polaris.id</code>)
                      </span>
                    </div>
                  )}

                  {/* SPK & PAJAK DOKUMEN RESMI (PRO ONLY) */}
                  {isPro ? (
                    <>
                      <div className="flex items-start gap-2 text-blue-950 dark:text-blue-300">
                        <Check className="h-4 w-4 text-blue-600 shrink-0 mt-0.5 stroke-[2.5]" />
                        <span>
                          Fasilitasi <strong>Dokumen Resmi SPK Pengadaan Setwan</strong>
                        </span>
                      </div>
                      <div className="flex items-start gap-2 text-blue-950 dark:text-blue-300">
                        <Check className="h-4 w-4 text-blue-600 shrink-0 mt-0.5 stroke-[2.5]" />
                        <span>
                          <strong>Faktur Pajak Resmi Negara</strong> (PPN 11% & PPh Instansi)
                        </span>
                      </div>
                      <div className="flex items-start gap-2 text-blue-950 dark:text-blue-300">
                        <Check className="h-4 w-4 text-blue-600 shrink-0 mt-0.5 stroke-[2.5]" />
                        <span>Prioritas Jalur Antrean AI & Tim Pendamping Eksekutif 24/7</span>
                      </div>
                    </>
                  ) : (
                    <div className="flex items-start gap-2 text-slate-500 dark:text-slate-400">
                      <Check className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5 stroke-[2.5]" />
                      <span>Pembayaran Mandiri Cepat via VA Bank & QRIS</span>
                    </div>
                  )}

                  <div className="flex items-start gap-2">
                    <Check className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5 stroke-[2.5]" />
                    <span>Garansi Akumulasi Sisa Hari Tidak Hangus</span>
                  </div>
                </div>
              </div>

              {/* TOMBOL AKSI KARTU */}
              <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800">
                <Button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onTierChange(offering.tier);
                    if (cyclePrice?.matrixId) {
                      onCheckout(selectedCycle, offering.tier, cyclePrice.matrixId);
                    }
                  }}
                  disabled={checkoutLoading !== null}
                  loading={checkoutLoading === offering.tier}
                  variant={isPro ? 'primary' : 'outline'}
                  className={cn(
                    'w-full font-black text-xs py-2.5 rounded-xl cursor-pointer transition-all',
                    isPro
                      ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-600/25'
                      : 'bg-slate-900 hover:bg-slate-800 text-white shadow-md shadow-slate-900/20'
                  )}
                >
                  {isSelected ? `Lanjut Paket ${offering.name}` : `Pilih ${offering.name}`}
                </Button>
              </div>
            </Card>
          );
        })}
      </div>

      {/* 3. CONFIRMATION CHECKOUT STRIP */}
      {activeTierObj && activeCyclePricing && (
        <div className="p-5 sm:p-6 rounded-3xl bg-slate-900 text-white flex flex-col md:flex-row md:items-center justify-between gap-5 shadow-xl border border-slate-800">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[10px] font-black uppercase tracking-wider text-blue-400">
                Konfirmasi Pilihan:
              </span>
              <span className="text-xs font-extrabold text-white bg-slate-800 px-2.5 py-0.5 rounded-lg border border-slate-700">
                {activeTierObj.name} (Tier {activeTierObj.tier})
              </span>
              <span className="text-xs font-extrabold text-blue-300 bg-blue-950/80 px-2.5 py-0.5 rounded-lg border border-blue-800">
                Durasi +{activeCyclePricing.durationDays} Hari
              </span>
            </div>
            <div className="text-xs text-slate-300 font-medium">
              {isSubActive && currentPeriodEnd
                ? `Masa aktif bertambah +${activeCyclePricing.durationDays} hari di ujung periode aktif Anda saat ini.`
                : `Masa aktif langsung aktif selama ${activeCyclePricing.durationDays} hari sejak pembayaran berhasil diverifikasi.`}
            </div>
            <div className="text-[11px] text-amber-400 flex items-center gap-1 font-semibold pt-0.5">
              <Zap className="h-3.5 w-3.5 text-amber-400 shrink-0" />
              <span>Garansi Akumulasi: Seluruh sisa hari berjalan tidak akan hangus.</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center gap-4 shrink-0">
            <div className="text-left md:text-right">
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Total Investasi Resmi
              </div>
              <div className="text-2xl sm:text-3xl font-black text-white font-mono tracking-tight">
                {activeCyclePricing.priceFormatted}
              </div>
            </div>

            <Button
              type="button"
              onClick={() => onCheckout(selectedCycle, activeTierObj.tier, activeCyclePricing.matrixId)}
              disabled={checkoutLoading !== null}
              loading={checkoutLoading !== null}
              className="text-white font-black text-xs gap-2 py-3.5 px-6 rounded-2xl shadow-lg cursor-pointer h-auto bg-blue-600 hover:bg-blue-700 transition-all shadow-blue-500/25"
            >
              <span>Bayar via Midtrans Snap</span>
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* 4. TRUST BADGES */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-2">
        <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 flex items-center gap-3">
          <div className="h-8 w-8 rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400 flex items-center justify-center shrink-0">
            <Zap className="h-4 w-4" />
          </div>
          <div>
            <div className="text-xs font-black text-slate-900 dark:text-white leading-tight">Akumulasi Waktu</div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400">Sisa hari aktif tidak hangus</div>
          </div>
        </div>

        <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 flex items-center gap-3">
          <div className="h-8 w-8 rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400 flex items-center justify-center shrink-0">
            <CreditCard className="h-4 w-4" />
          </div>
          <div>
            <div className="text-xs font-black text-slate-900 dark:text-white leading-tight">Tanpa Auto-Debit</div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400">Bayar via VA Bank / QRIS</div>
          </div>
        </div>

        <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 flex items-center gap-3">
          <div className="h-8 w-8 rounded-xl bg-amber-50 text-amber-600 dark:bg-amber-950/60 dark:text-amber-400 flex items-center justify-center shrink-0">
            <Receipt className="h-4 w-4" />
          </div>
          <div>
            <div className="text-xs font-black text-slate-900 dark:text-white leading-tight">Kwitansi LPJ Resmi</div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400">Invoice instan untuk SPJ</div>
          </div>
        </div>

        <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 flex items-center gap-3">
          <div className="h-8 w-8 rounded-xl bg-purple-50 text-purple-600 dark:bg-purple-950/60 dark:text-purple-400 flex items-center justify-center shrink-0">
            <Clock className="h-4 w-4" />
          </div>
          <div>
            <div className="text-xs font-black text-slate-900 dark:text-white leading-tight">Grace Period 3 Hari</div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400">Toleransi jeda administrasi</div>
          </div>
        </div>
      </div>
    </section>
  );
}
