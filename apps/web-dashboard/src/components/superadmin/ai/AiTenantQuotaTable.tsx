'use client';

import React from 'react';
import Link from 'next/link';
import { ShieldCheck, Cpu, Image as ImageIcon, FileText, ExternalLink } from 'lucide-react';

interface TenantBreakdown {
  tenantId: string;
  name: string;
  email: string;
  party: string;
  tier: string;
  articlesUsed: number;
  dalleUsed: number;
  tokensConsumed: number;
  estimatedCostUsd: number;
}

interface AiTenantQuotaTableProps {
  tenants?: TenantBreakdown[];
}

export function AiTenantQuotaTable({ tenants }: AiTenantQuotaTableProps) {
  return (
    <div className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-[#0B0F17] border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">
            Akumulasi Penggunaan AI per Anggota Dewan
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Pencatatan riil pemakaian naskah artikel AI, visual DALL-E, total token, dan estimasi biaya per orang
          </p>
        </div>
        <Link
          href="/superadmin/activity-logs"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/40 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 transition-colors w-fit"
        >
          <ShieldCheck className="h-3.5 w-3.5" />
          <span>Buka Audit Log Lengkap &rarr;</span>
        </Link>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-bold uppercase text-[10px]">
              <th className="pb-3 px-3">Nama Anggota Dewan</th>
              <th className="pb-3 px-3">Paket Lisensi</th>
              <th className="pb-3 px-3">Naskah Dibuat</th>
              <th className="pb-3 px-3">Gambar DALL-E</th>
              <th className="pb-3 px-3">Total Token</th>
              <th className="pb-3 px-3">Estimasi Biaya</th>
              <th className="pb-3 px-3 text-right">Audit Log</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
            {tenants?.map((t) => (
              <tr key={t.tenantId} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/30 transition-colors">
                <td className="py-3 px-3">
                  <div className="font-extrabold text-slate-900 dark:text-white">{t.name}</div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400">
                    {t.email} • <span className="font-semibold text-slate-700 dark:text-slate-300">Fraksi {t.party || 'Dewan'}</span>
                  </div>
                </td>

                <td className="py-3 px-3">
                  <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border border-blue-200 dark:border-blue-800/60">
                    {t.tier}
                  </span>
                </td>

                <td className="py-3 px-3">
                  <div className="flex items-center gap-1.5 font-bold text-slate-800 dark:text-slate-200">
                    <FileText className="h-3.5 w-3.5 text-blue-500" />
                    <span>{t.articlesUsed} naskah</span>
                  </div>
                </td>

                <td className="py-3 px-3">
                  <div className="flex items-center gap-1.5 font-bold text-slate-800 dark:text-slate-200">
                    <ImageIcon className="h-3.5 w-3.5 text-purple-500" />
                    <span>{t.dalleUsed} gambar</span>
                  </div>
                </td>

                <td className="py-3 px-3 font-mono font-bold text-slate-700 dark:text-slate-300">
                  <div className="flex items-center gap-1">
                    <Cpu className="h-3 w-3 text-indigo-500" />
                    <span>{t.tokensConsumed.toLocaleString('id-ID')}</span>
                  </div>
                </td>

                <td className="py-3 px-3 font-mono font-black text-emerald-600 dark:text-emerald-400">
                  ${t.estimatedCostUsd}
                </td>

                <td className="py-3 px-3 text-right">
                  <Link
                    href={`/superadmin/activity-logs?tenantId=${t.tenantId}`}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                  >
                    <span>Detail</span>
                    <ExternalLink className="h-3 w-3" />
                  </Link>
                </td>
              </tr>
            ))}

            {(!tenants || tenants.length === 0) && (
              <tr>
                <td colSpan={7} className="py-6 text-center text-slate-400 italic">
                  Belum ada rekaman pemakaian token anggota di periode ini.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
