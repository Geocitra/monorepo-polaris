'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight, CheckCircle2, AlertCircle } from 'lucide-react';
import { RecentTenant } from '../types';

interface RecentTenantsTableProps {
  tenants: RecentTenant[];
  onVerifyToggle: (tenantId: string, currentVerified: boolean) => void;
}

export function RecentTenantsTable({ tenants, onVerifyToggle }: RecentTenantsTableProps) {
  return (
    <div className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-[#0B0F17] border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-sm font-extrabold text-slate-900 dark:text-white">
            Pendaftaran Klien Dewan Terbaru
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Anggota legislatif yang baru saja mendaftarkan akun di sistem POLARIS.
          </p>
        </div>

        <Link
          href="/superadmin/tenants"
          className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:text-blue-700 flex items-center gap-1"
        >
          <span>Lihat Semua</span>
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-bold uppercase text-[10px]">
              <th className="pb-3 px-3">Nama Anggota</th>
              <th className="pb-3 px-3">Fraksi Partai</th>
              <th className="pb-3 px-3">Tingkat Dewan</th>
              <th className="pb-3 px-3">Status Verifikasi</th>
              <th className="pb-3 px-3">Status Akun</th>
              <th className="pb-3 px-3 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
            {tenants.map((t) => (
              <tr key={t.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/30 transition-colors">
                <td className="py-3 px-3">
                  <div className="font-bold text-slate-900 dark:text-white">{t.fullName}</div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400">{t.email}</div>
                </td>
                <td className="py-3 px-3">
                  <span className="px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 font-semibold text-[11px]">
                    {t.partyAffiliation || 'Independen'}
                  </span>
                </td>
                <td className="py-3 px-3 text-slate-600 dark:text-slate-300 font-mono text-[11px]">
                  {t.legislativeLevel}
                </td>
                <td className="py-3 px-3">
                  {t.isVerified ? (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20 text-[10px] font-bold">
                      <CheckCircle2 className="h-3 w-3" />
                      <span>Terverifikasi KPU</span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400 border border-amber-200 dark:border-amber-500/20 text-[10px] font-bold">
                      <AlertCircle className="h-3 w-3" />
                      <span>Menunggu Verifikasi</span>
                    </span>
                  )}
                </td>
                <td className="py-3 px-3">
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                      t.accountStatus === 'ACTIVE'
                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-400'
                        : 'bg-red-100 text-red-800 dark:bg-red-950/40 dark:text-red-400'
                    }`}
                  >
                    {t.accountStatus}
                  </span>
                </td>
                <td className="py-3 px-3 text-right">
                  <button
                    onClick={() => onVerifyToggle(t.id, t.isVerified)}
                    className="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold border border-slate-200 dark:border-slate-700 transition-all cursor-pointer shadow-2xs"
                  >
                    {t.isVerified ? 'Cabut Verifikasi' : 'Verifikasi Akun'}
                  </button>
                </td>
              </tr>
            ))}

            {tenants.length === 0 && (
              <tr>
                <td colSpan={6} className="py-6 text-center text-slate-400 text-xs italic">
                  Belum ada anggota dewan yang terdaftar.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
