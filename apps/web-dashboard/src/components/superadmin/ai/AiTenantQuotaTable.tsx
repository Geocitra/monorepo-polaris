'use client';

import React from 'react';
import Link from 'next/link';
import { ShieldCheck, Cpu, Image as ImageIcon, FileText, ExternalLink, Wallet } from 'lucide-react';

interface TenantBreakdown {
  tenantId: string;
  name: string;
  email: string;
  party: string;
  tier: string;
  remainingQuota?: number;
  totalQuotaAllocated?: number;
  articlesUsed: number;
  dalleUsed: number;
  tokensConsumed: number;
  openaiInputTokens?: number;
  openaiOutputTokens?: number;
  openaiTotalTokens?: number;
  openaiImagesUsed?: number;
  openaiCostIdr?: number;
  geminiInputTokens?: number;
  geminiOutputTokens?: number;
  geminiTotalTokens?: number;
  geminiImagesUsed?: number;
  geminiCostIdr?: number;
  estimatedCostIdr?: number;
  estimatedCostUsd?: number;
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
            Rincian Penggunaan AI per Anggota Dewan (Terpisah: OpenAI vs Google Gemini)
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Audit kuota paket tersisa, naskah & poster yang digenerate, serta rincian token & biaya Rupiah untuk masing-masing provider AI per tokoh
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
        <table className="w-full text-left text-xs min-w-[920px]">
          <thead>
            <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-bold uppercase text-[10px]">
              <th className="pb-3 px-3">Nama Anggota Dewan</th>
              <th className="pb-3 px-3">Paket & Sisa Kuota</th>
              <th className="pb-3 px-3">Output Konten</th>
              <th className="pb-3 px-3">Pemakaian OpenAI (Rp)</th>
              <th className="pb-3 px-3">Pemakaian Gemini (Rp)</th>
              <th className="pb-3 px-3">Total Biaya (Rp)</th>
              <th className="pb-3 px-3 text-right">Audit Log</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
            {tenants?.map((t) => {
              const totalIdr = Number(t.estimatedCostIdr ?? 0);
              const openaiIdr = Number(t.openaiCostIdr ?? 0);
              const geminiIdr = Number(t.geminiCostIdr ?? 0);

              return (
                <tr
                  key={t.tenantId}
                  className="hover:bg-slate-50/80 dark:hover:bg-slate-800/30 transition-colors"
                >
                  <td className="py-3 px-3">
                    <div className="font-extrabold text-slate-900 dark:text-white">{t.name}</div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400">
                      {t.email} •{' '}
                      <span className="font-semibold text-slate-700 dark:text-slate-300">
                        Fraksi {t.party || 'Dewan'}
                      </span>
                    </div>
                  </td>

                  <td className="py-3 px-3">
                    <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border border-blue-200 dark:border-blue-800/60">
                      {t.tier}
                    </span>
                    <div className="flex items-center gap-1 text-[11px] font-bold text-slate-700 dark:text-slate-300 mt-1">
                      <Wallet className="h-3 w-3 text-emerald-500" />
                      <span>
                        Sisa {t.remainingQuota ?? 0} / {t.totalQuotaAllocated ?? 0} kuota
                      </span>
                    </div>
                  </td>

                  <td className="py-3 px-3">
                    <div className="flex items-center gap-1.5 font-bold text-slate-800 dark:text-slate-200">
                      <FileText className="h-3.5 w-3.5 text-blue-500" />
                      <span>{t.articlesUsed} naskah</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-500 dark:text-slate-400 mt-0.5">
                      <ImageIcon className="h-3 w-3 text-purple-500" />
                      <span>{t.dalleUsed} poster/visual</span>
                    </div>
                  </td>

                  {/* OpenAI Breakdown */}
                  <td className="py-3 px-3">
                    <div className="font-mono font-black text-emerald-600 dark:text-emerald-400">
                      Rp {Math.round(openaiIdr).toLocaleString('id-ID')}
                    </div>
                    <div className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">
                      {(t.openaiTotalTokens ?? 0).toLocaleString('id-ID')} tok •{' '}
                      {t.openaiImagesUsed ?? 0} img
                    </div>
                  </td>

                  {/* Gemini Breakdown */}
                  <td className="py-3 px-3">
                    <div className="font-mono font-black text-indigo-600 dark:text-indigo-400">
                      Rp {Math.round(geminiIdr).toLocaleString('id-ID')}
                    </div>
                    <div className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">
                      {(t.geminiTotalTokens ?? 0).toLocaleString('id-ID')} tok •{' '}
                      {t.geminiImagesUsed ?? 0} img
                    </div>
                  </td>

                  {/* Total Combined IDR */}
                  <td className="py-3 px-3">
                    <div className="font-mono font-black text-slate-900 dark:text-white">
                      Rp {Math.round(totalIdr).toLocaleString('id-ID')}
                    </div>
                    <div className="flex items-center gap-1 text-[10px] text-slate-400 font-mono">
                      <Cpu className="h-3 w-3 text-indigo-500" />
                      <span>{(t.tokensConsumed ?? 0).toLocaleString('id-ID')} total tok</span>
                    </div>
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
              );
            })}

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
