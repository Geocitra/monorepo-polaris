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
              <th className="pb-3 px-3">Nama Anggota &amp; Kredensial</th>
              <th className="pb-3 px-3">Fraksi Partai</th>
              <th className="pb-3 px-3">Tingkat Dewan</th>
              <th className="pb-3 px-3">Status Akun</th>
              <th className="pb-3 px-3 text-right">Aksi Superadmin</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
            {tenants.map((t) => (
              <tr key={t.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/30 transition-colors">
                <td className="py-3 px-3">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="font-bold text-slate-900 dark:text-white">{t.fullName}</span>
                    {t.isVerified ? (
                      <span
                        title="Klien Dewan Terverifikasi"
                        className="inline-flex items-center gap-0.5 px-1.5 py-0.2 rounded-full text-[9px] font-black uppercase bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800"
                      >
                        <CheckCircle2 className="h-2.5 w-2.5 text-emerald-500" />
                        <span>Terverifikasi</span>
                      </span>
                    ) : (
                      <span
                        title="Menunggu Verifikasi"
                        className="inline-flex items-center gap-0.5 px-1.5 py-0.2 rounded-full text-[9px] font-bold bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-200 dark:border-amber-800"
                      >
                        <AlertCircle className="h-2.5 w-2.5 text-amber-500" />
                        <span>Belum Verifikasi</span>
                      </span>
                    )}
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">{t.email}</div>
                </td>
                <td className="py-3 px-3">
                  <span className="px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 font-semibold text-[11px]">
                    {t.partyAffiliation || 'Independen'}
                  </span>
                </td>
                <td className="py-3 px-3 text-slate-600 dark:text-slate-300 font-medium text-[11px]">
                  {t.legislativeLevel ? t.legislativeLevel.replace(/_/g, ' ') : '-'}
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
                <td colSpan={5} className="py-6 text-center text-slate-400 text-xs italic">
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
