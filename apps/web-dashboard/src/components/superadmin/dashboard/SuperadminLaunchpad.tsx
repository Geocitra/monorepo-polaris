'use client';

import React from 'react';
import Link from 'next/link';
import { Users, Database, Cpu, ChevronRight } from 'lucide-react';

export function SuperadminLaunchpad() {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      {/* 1. Direktori Dewan */}
      <Link
        href="/superadmin/tenants"
        className="p-5 rounded-2xl bg-white dark:bg-[#0B0F17] border border-slate-200 dark:border-slate-800 hover:border-blue-500/50 hover:shadow-md transition-all group flex flex-col justify-between"
      >
        <div className="space-y-2">
          <div className="h-10 w-10 rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-950/50 dark:text-blue-400 flex items-center justify-center group-hover:scale-105 transition-transform">
            <Users className="h-5 w-5" />
          </div>
          <h3 className="font-extrabold text-slate-900 dark:text-white text-sm">Direktori Anggota Dewan</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            Verifikasi keabsahan KPU dewan, aktivasi lisensi manual via SPK, atau tangguhkan akun yang bermasalah.
          </p>
        </div>
        <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs font-bold text-blue-600 dark:text-blue-400 group-hover:translate-x-0.5 transition-transform">
          <span>Buka Manajemen Dewan</span>
          <ChevronRight className="h-4 w-4" />
        </div>
      </Link>

      {/* 2. Master Partai Politik */}
      <Link
        href="/superadmin/master-data"
        className="p-5 rounded-2xl bg-white dark:bg-[#0B0F17] border border-slate-200 dark:border-slate-800 hover:border-amber-500/50 hover:shadow-md transition-all group flex flex-col justify-between"
      >
        <div className="space-y-2">
          <div className="h-10 w-10 rounded-xl bg-amber-50 text-amber-600 dark:bg-amber-950/50 dark:text-amber-400 flex items-center justify-center group-hover:scale-105 transition-transform">
            <Database className="h-5 w-5" />
          </div>
          <h3 className="font-extrabold text-slate-900 dark:text-white text-sm">Master Partai Politik</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            Kelola daftar partai politik peserta pemilu, nomor urut nasional KPU, singkatan fraksi, dan logo resmi.
          </p>
        </div>
        <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs font-bold text-amber-600 dark:text-amber-400 group-hover:translate-x-0.5 transition-transform">
          <span>Buka Master Data</span>
          <ChevronRight className="h-4 w-4" />
        </div>
      </Link>

      {/* 3. Observabilitas AI & Token (Langfuse) */}
      <Link
        href="/superadmin/ai-monitoring"
        className="p-5 rounded-2xl bg-white dark:bg-[#0B0F17] border border-slate-200 dark:border-slate-800 hover:border-indigo-500/50 hover:shadow-md transition-all group flex flex-col justify-between"
      >
        <div className="space-y-2">
          <div className="h-10 w-10 rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950/50 dark:text-indigo-400 flex items-center justify-center group-hover:scale-105 transition-transform">
            <Cpu className="h-5 w-5" />
          </div>
          <h3 className="font-extrabold text-slate-900 dark:text-white text-sm">Observabilitas AI & Token</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            Audit penggunaan token LLM, trace Langfuse per generasi artikel, pemakaian DALL-E, dan sisa kuota klien.
          </p>
        </div>
        <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs font-bold text-indigo-600 dark:text-indigo-400 group-hover:translate-x-0.5 transition-transform">
          <span>Buka Langfuse & Token AI</span>
          <ChevronRight className="h-4 w-4" />
        </div>
      </Link>
    </div>
  );
}
