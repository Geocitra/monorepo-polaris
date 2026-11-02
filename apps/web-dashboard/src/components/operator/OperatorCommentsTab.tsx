'use client';

import React from 'react';

export function OperatorCommentsTab() {
  return (
    <div className="bg-white dark:bg-[#0B0F19] rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4 animate-in fade-in duration-150">
      <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
        <h4 className="text-sm font-bold text-slate-900 dark:text-white">
          Moderasi Komentar Portal Publik
        </h4>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          Saring dan setujui komentar warga sebelum ditampilkan di portal resmi dewan.
        </p>
      </div>

      <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/40 border border-slate-200/80 dark:border-slate-800 space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="font-bold text-slate-800 dark:text-slate-200">
            Budi Santoso (Komentator Terverifikasi Google)
          </span>
          <span className="text-[11px] text-slate-400">10 menit yang lalu</span>
        </div>
        <p className="text-xs text-slate-600 dark:text-slate-300">
          &quot;Aspirasi yang sangat bagus bapak, semoga pupuk bersubsidi benar-benar merata sampai ke petani gurem di desa kami.&quot;
        </p>
        <div className="flex items-center justify-end space-x-2 pt-2 text-xs">
          <button
            type="button"
            className="px-3 py-1.5 rounded-xl text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 font-semibold transition cursor-pointer"
          >
            Sembunyikan / Spam
          </button>
          <button
            type="button"
            className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold transition shadow-sm cursor-pointer"
          >
            Setujui Tampil
          </button>
        </div>
      </div>
    </div>
  );
}

