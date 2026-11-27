'use client';

import React from 'react';
import { Inbox } from 'lucide-react';

export function OperatorAspirasiTab() {
  return (
    <div className="bg-white dark:bg-[#0B0F19] rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4 animate-in fade-in duration-150">
      <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
        <h4 className="text-sm font-bold text-slate-900 dark:text-white">
          Aspirasi &amp; Suara Warga Dapil Masuk
        </h4>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          Klasifikasi dan verifikasi aduan warga yang masuk melalui portal publik resmi tokoh.
        </p>
      </div>

      <div className="p-6 rounded-xl bg-slate-50 dark:bg-slate-900/40 border border-dashed border-slate-200 dark:border-slate-800 text-center space-y-2">
        <Inbox className="h-6 w-6 text-slate-400 mx-auto" />
        <p className="text-xs font-bold text-slate-700 dark:text-slate-200">
          Panel Moderasi Aspirasi Terpusat Operator Segera Hadir
        </p>
        <p className="text-[11px] text-slate-500 dark:text-slate-400 max-w-md mx-auto">
          Saat ini tindak lanjut dan verifikasi aspirasi konstituen dikelola langsung melalui akun tokoh pada menu Suara &amp; Aspirasi Warga.
        </p>
      </div>
    </div>
  );
}
