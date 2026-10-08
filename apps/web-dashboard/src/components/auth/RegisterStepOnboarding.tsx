'use client';

import { Globe, Sparkles, Loader2 } from 'lucide-react';

interface RegisterStepOnboardingProps {
  claimedSubdomain: string;
  setClaimedSubdomain: (val: string) => void;
  selectedCycle: 'MONTHLY' | 'SEMESTER' | 'ANNUAL';
  setSelectedCycle: (val: 'MONTHLY' | 'SEMESTER' | 'ANNUAL') => void;
  loading: boolean;
  onComplete: (shouldPayNow: boolean) => void;
}

export function RegisterStepOnboarding({
  claimedSubdomain,
  setClaimedSubdomain,
  selectedCycle,
  setSelectedCycle,
  loading,
  onComplete,
}: RegisterStepOnboardingProps) {
  const plans = [
    {
      cycle: 'MONTHLY' as const,
      label: '1 Bulan',
      price: 'Tarif Terstandar',
      normalPrice: null,
      note: '30 Hari (Evaluasi / Sidang)',
      popular: false,
    },
    {
      cycle: 'SEMESTER' as const,
      label: '6 Bulan',
      price: 'Tarif Terstandar',
      normalPrice: 'Diskon 1 Bulan',
      note: '180 Hari (1 Masa Sidang)',
      popular: true,
    },
    {
      cycle: 'ANNUAL' as const,
      label: '1 Tahun',
      price: 'Tarif Terstandar',
      normalPrice: 'Diskon 2 Bulan',
      note: '365 Hari (Tahun Anggaran)',
      popular: false,
    },
  ];

  return (
    <div className="space-y-4 animate-in fade-in">
      {/* Subdomain Input */}
      <div className="space-y-1.5">
        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
          <Globe className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
          <span>Klaim Subdomain Website Publik Anda</span>
        </label>
        <div className="flex items-center">
          <input
            type="text"
            required
            placeholder="achmad-fauzi"
            value={claimedSubdomain}
            onChange={(e) => setClaimedSubdomain(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
            className="block w-full rounded-l-xl border border-r-0 border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800/80 px-3.5 py-2.5 text-sm font-semibold text-slate-900 dark:text-white placeholder:text-slate-400 focus:border-cyan-400 focus:ring-4 focus:ring-cyan-400/20 focus:outline-none transition-all shadow-xs"
          />
          <span className="inline-flex items-center px-3 py-2.5 rounded-r-xl border border-slate-300 dark:border-slate-700 bg-slate-100 dark:bg-slate-700 text-xs font-bold text-slate-600 dark:text-slate-200">
            .polaris.id
          </span>
        </div>
        <p className="text-[10px] text-slate-500 dark:text-slate-400">
          Alamat situs: <span className="font-bold text-blue-600 dark:text-blue-400">https://{claimedSubdomain || 'nama'}.polaris.id</span>
        </p>
      </div>

      {/* Plan selection */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
            Pilih Durasi Paket Lisensi
          </label>
          <span className="text-[10px] text-blue-600 dark:text-blue-400 font-bold uppercase">
            Akses Penuh
          </span>
        </div>

        <div className="grid grid-cols-3 gap-2">
          {plans.map((p) => {
            const isSelected = selectedCycle === p.cycle;
            return (
              <button
                type="button"
                key={p.cycle}
                onClick={() => setSelectedCycle(p.cycle)}
                className={`p-2.5 rounded-xl border text-center transition-all relative flex flex-col justify-between cursor-pointer ${
                  isSelected
                    ? 'border-blue-600 dark:border-blue-500 bg-blue-50/70 dark:bg-blue-950/40 shadow-sm ring-2 ring-blue-500/20'
                    : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                {p.popular && (
                  <span className="absolute -top-2 left-1/2 -translate-x-1/2 px-1.5 py-0.2 rounded-full bg-blue-600 text-white text-[8px] font-black uppercase tracking-wider shadow-xs whitespace-nowrap">
                    Populer
                  </span>
                )}
                <div>
                  <div className="text-[11px] font-extrabold text-slate-900 dark:text-white mt-0.5">{p.label}</div>
                  <div className="text-xs font-black text-blue-600 dark:text-blue-400 mt-0.5">{p.price}</div>
                  {p.normalPrice && (
                    <div className="text-[9px] text-slate-400 line-through">{p.normalPrice}</div>
                  )}
                </div>
                <div className="text-[9px] text-slate-500 dark:text-slate-400 font-medium mt-1 border-t border-slate-100 dark:border-slate-700/60 pt-0.5 leading-tight">
                  {p.note}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="space-y-2 pt-1">
        <button
          type="button"
          disabled={loading}
          onClick={() => onComplete(true)}
          className="w-full py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold text-xs sm:text-sm shadow-md shadow-blue-600/25 disabled:opacity-50 transition-all flex items-center justify-center space-x-2 cursor-pointer"
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
          <span>Aktifkan Lisensi & Bayar Sekarang</span>
        </button>

        <button
          type="button"
          disabled={loading}
          onClick={() => onComplete(false)}
          className="w-full py-2 px-3 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800 font-semibold text-[11px] transition-colors text-center cursor-pointer"
        >
          Simpan Domain & Masuk ke Dashboard (Bayar Nanti)
        </button>
      </div>
    </div>
  );
}
