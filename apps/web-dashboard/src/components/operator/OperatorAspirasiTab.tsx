'use client';

import React from 'react';

export function OperatorAspirasiTab() {
  return (
    <div className="bg-white dark:bg-[#0B0F19] rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4 animate-in fade-in duration-150">
      <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
        <h4 className="text-sm font-bold text-slate-900 dark:text-white">
          Aspirasi & Suara Warga Dapil Masuk
        </h4>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          Klasifikasikan dan verifikasi aduan warga yang masuk melalui portal publik resmi dewan.
        </p>
      </div>

      <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/40 border border-slate-200/80 dark:border-slate-800 space-y-2.5">
        <div className="flex items-center justify-between text-xs">
          <span className="font-bold text-slate-800 dark:text-slate-200">
            Warga Konstituen (NIK Terproteksi: 3204*********441)
          </span>
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
            RECEIVED
          </span>
        </div>
        <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
          &quot;Pak Dewan, jalan poros desa di perbatasan rusak parah kena longsor minggu lalu. Truk pengangkut hasil tani terpaksa memutar 15 km. Mohon dibantu advokasi ke dinas PU provinsi.&quot;
        </p>
        <div className="flex items-center space-x-2 pt-2 text-xs">
          <span className="text-[11px] text-slate-400">Kategori:</span>
          <span className="px-2.5 py-0.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/30 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-900 font-bold">
            INFRASTRUKTUR
          </span>
          <button
            type="button"
            className="ml-auto px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition shadow-sm cursor-pointer"
          >
            Verifikasi & Masukkan ke Risalah
          </button>
        </div>
      </div>
    </div>
  );
}

