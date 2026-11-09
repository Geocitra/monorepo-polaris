'use client';

import React, { useState, useMemo } from 'react';
import { CheckCircle2, Clock } from 'lucide-react';
import { PaginationControls } from '../common/PaginationControls';

interface TraceLog {
  id: string;
  timestamp: string;
  operation: string;
  model: string;
  provider?: 'OPENAI' | 'GEMINI' | string;
  tenantName: string;
  party: string;
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
  imageCalls?: number;
  latencyMs: number;
  costIdr?: number;
  costUsd: number;
  fxRateApplied?: number;
  status: string;
}

interface AiTracesLogTableProps {
  traces: TraceLog[];
  loading: boolean;
  onRefresh: () => void;
}

export function AiTracesLogTable({ traces, loading, onRefresh }: AiTracesLogTableProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  const totalPages = Math.ceil(traces.length / itemsPerPage);
  const safePage = Math.min(currentPage, Math.max(1, totalPages));

  const displayedTraces = useMemo(() => {
    const start = (safePage - 1) * itemsPerPage;
    return traces.slice(start, start + itemsPerPage);
  }, [traces, safePage, itemsPerPage]);

  const getOpBadge = (op: string) => {
    if (op.includes('article'))
      return 'bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border-blue-200 dark:border-blue-800/60';
    if (op.includes('dalle') || op.includes('imagen') || op.includes('img2img'))
      return 'bg-purple-50 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300 border-purple-200 dark:border-purple-800/60';
    if (op.includes('social') || op.includes('research'))
      return 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border-amber-200 dark:border-amber-800/60';
    return 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-200 dark:border-slate-700';
  };

  return (
    <div className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-[#0B0F17] border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">
            Log Sesi Trace AI Terkini (OpenAI & Gemini dalam Rupiah)
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Audit eksekusi prompt AI, provider engine, konsumsi token/visual, dan realisasi biaya Rupiah per permintaan
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onRefresh}
            disabled={loading}
            className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold transition-colors cursor-pointer"
          >
            {loading ? 'Menyinkronkan...' : 'Segarkan Trace'}
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs min-w-[820px]">
          <thead>
            <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-bold uppercase text-[10px]">
              <th className="pb-3 px-3">Trace ID & Waktu</th>
              <th className="pb-3 px-3">Operasi Fungsi</th>
              <th className="pb-3 px-3">Provider & Model</th>
              <th className="pb-3 px-3">Anggota Dewan</th>
              <th className="pb-3 px-3">Token (In/Out) / Visual</th>
              <th className="pb-3 px-3">Latensi</th>
              <th className="pb-3 px-3 text-right">Biaya (Rp) & Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
            {displayedTraces.map((t) => {
              const prov =
                t.provider ||
                (t.model.toLowerCase().includes('gemini') || t.model.toLowerCase().includes('imagen')
                  ? 'GEMINI'
                  : 'OPENAI');
              const costIdr =
                typeof t.costIdr === 'number'
                  ? t.costIdr
                  : Math.round(Number(t.costUsd || 0) * Number(t.fxRateApplied || 16300));

              return (
                <tr
                  key={t.id}
                  className="hover:bg-slate-50/80 dark:hover:bg-slate-800/30 transition-colors"
                >
                  <td className="py-3 px-3">
                    <div className="font-mono font-bold text-slate-900 dark:text-white text-[11px]">
                      {t.id}
                    </div>
                    <div className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5">
                      <Clock className="h-3 w-3" />
                      <span>{new Date(t.timestamp).toLocaleTimeString('id-ID')} WIB</span>
                    </div>
                  </td>

                  <td className="py-3 px-3">
                    <span
                      className={`inline-block px-2 py-0.5 rounded-md text-[10px] font-mono font-bold border ${getOpBadge(
                        t.operation
                      )}`}
                    >
                      {t.operation}
                    </span>
                  </td>

                  <td className="py-3 px-3">
                    <span
                      className={`inline-block px-1.5 py-0.5 rounded text-[9px] font-black uppercase mr-1.5 ${
                        prov === 'GEMINI'
                          ? 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950/70 dark:text-indigo-300'
                          : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/70 dark:text-emerald-300'
                      }`}
                    >
                      {prov}
                    </span>
                    <span className="font-mono font-bold text-slate-800 dark:text-slate-200 text-[11px]">
                      {t.model}
                    </span>
                  </td>

                  <td className="py-3 px-3">
                    <div className="font-bold text-slate-900 dark:text-white text-[11px]">
                      {t.tenantName}
                    </div>
                    <div className="text-[10px] text-slate-500 dark:text-slate-400">{t.party}</div>
                  </td>

                  <td className="py-3 px-3 font-mono text-[11px]">
                    {(t.imageCalls ?? 0) > 0 && t.totalTokens === 0 ? (
                      <>
                        <span className="font-bold text-purple-600 dark:text-purple-400">
                          {t.imageCalls} render gambar
                        </span>
                        <span className="text-[10px] text-slate-400 block">Tarif flat per visual</span>
                      </>
                    ) : (
                      <>
                        <span className="font-bold text-slate-900 dark:text-white">
                          {t.totalTokens.toLocaleString('id-ID')} tok
                        </span>
                        <span className="text-[10px] text-slate-400 block">
                          {t.inputTokens} in / {t.outputTokens} out
                          {(t.imageCalls ?? 0) > 0 ? ` (+${t.imageCalls} img)` : ''}
                        </span>
                      </>
                    )}
                  </td>

                  <td className="py-3 px-3 font-mono text-[11px] text-slate-600 dark:text-slate-400">
                    {t.latencyMs} ms
                  </td>

                  <td className="py-3 px-3 text-right">
                    <div className="text-xs font-black text-emerald-600 dark:text-emerald-400 font-mono">
                      Rp {Math.round(costIdr).toLocaleString('id-ID')}
                    </div>
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border mt-0.5 ${
                        t.status === 'SUCCESS'
                          ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/60'
                          : 'bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300 border-rose-200 dark:border-rose-800/60'
                      }`}
                    >
                      <CheckCircle2 className="h-3 w-3" />
                      <span>{t.status}</span>
                    </span>
                  </td>
                </tr>
              );
            })}

            {displayedTraces.length === 0 && (
              <tr>
                <td colSpan={7} className="py-8 text-center text-slate-400 text-xs italic">
                  Belum ada rekaman jejak trace AI tersimpan.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      <PaginationControls
        currentPage={safePage}
        totalPages={totalPages}
        totalItems={traces.length}
        itemsPerPage={itemsPerPage}
        onPageChange={(page) => setCurrentPage(page)}
      />
    </div>
  );
}
