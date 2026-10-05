'use client';

import React, { useState, useMemo } from 'react';
import { CheckCircle2, Clock, Cpu, ExternalLink } from 'lucide-react';
import { PaginationControls } from '../common/PaginationControls';

interface TraceLog {
  id: string;
  timestamp: string;
  operation: string;
  model: string;
  tenantName: string;
  party: string;
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
  latencyMs: number;
  costUsd: number;
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
    if (op.includes('dalle'))
      return 'bg-purple-50 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300 border-purple-200 dark:border-purple-800/60';
    if (op.includes('social'))
      return 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border-amber-200 dark:border-amber-800/60';
    return 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-200 dark:border-slate-700';
  };

  return (
    <div className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-[#0B0F17] border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">
            Log Sesi Trace Langfuse Terkini
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Audit eksekusi prompt AI, durasi latensi inferensi, dan konsumsi token per permintaan
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
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-bold uppercase text-[10px]">
              <th className="pb-3 px-3">Trace ID & Waktu</th>
              <th className="pb-3 px-3">Operasi Fungsi</th>
              <th className="pb-3 px-3">Model Engine</th>
              <th className="pb-3 px-3">Anggota Dewan</th>
              <th className="pb-3 px-3">Token (In/Out)</th>
              <th className="pb-3 px-3">Latensi</th>
              <th className="pb-3 px-3 text-right">Biaya / Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
            {displayedTraces.map((t) => (
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

                <td className="py-3 px-3 font-mono font-bold text-slate-800 dark:text-slate-200 text-[11px]">
                  {t.model}
                </td>

                <td className="py-3 px-3">
                  <div className="font-bold text-slate-900 dark:text-white text-[11px]">
                    {t.tenantName}
                  </div>
                  <div className="text-[10px] text-slate-500 dark:text-slate-400">{t.party}</div>
                </td>

                <td className="py-3 px-3 font-mono text-[11px]">
                  <span className="font-bold text-slate-900 dark:text-white">{t.totalTokens}</span>
                  <span className="text-[10px] text-slate-400 block">
                    {t.inputTokens} in / {t.outputTokens} out
                  </span>
                </td>

                <td className="py-3 px-3 font-mono text-[11px] text-slate-600 dark:text-slate-400">
                  {t.latencyMs} ms
                </td>

                <td className="py-3 px-3 text-right">
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60">
                    <CheckCircle2 className="h-3 w-3" />
                    <span>{t.status}</span>
                  </span>
                  <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                    ${t.costUsd.toFixed(4)}
                  </div>
                </td>
              </tr>
            ))}

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
