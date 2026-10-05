'use client';

import React from 'react';
import { Cpu, DollarSign, Activity, Sparkles, ExternalLink } from 'lucide-react';

interface AiObservabilityKpisProps {
  summary?: {
    totalTokens: number;
    totalCostUsd: number;
    totalCostIdr: number;
    totalGenerations: number;
    avgLatencySeconds: number;
  };
  langfuse?: {
    status: string;
    host: string;
    publicKey: string;
    telemetryActive: boolean;
    traceUrl: string;
  };
}

export function AiObservabilityKpis({ summary, langfuse }: AiObservabilityKpisProps) {
  return (
    <div className="space-y-4">
      {/* 1. LANGFUSE STATUS HERO BANNER */}
      <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#0B0F17] border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="h-11 w-11 rounded-2xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-400 flex items-center justify-center font-black shrink-0">
            <Activity className="h-6 w-6 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-extrabold text-slate-900 dark:text-white leading-tight">
                Langfuse LLM Telemetry & Cost Tracer
              </h2>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-ping" />
                <span>{langfuse?.status || 'CONNECTED'}</span>
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Host: <span className="font-mono text-slate-700 dark:text-slate-300 font-semibold">{langfuse?.host || 'https://cloud.langfuse.com'}</span> • Public Key: <span className="font-mono text-slate-500">{langfuse?.publicKey || 'pk-lf-***'}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <a
            href={langfuse?.traceUrl || 'https://cloud.langfuse.com'}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-xs shadow-indigo-600/20 transition-all cursor-pointer"
          >
            <span>Buka Langfuse Cloud Console</span>
            <ExternalLink className="h-3.5 w-3.5" />
          </a>
        </div>
      </div>

      {/* 2. 4 METRIC KPI CARDS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Token Terpakai */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#0B0F17] border border-slate-200 dark:border-slate-800 shadow-xs space-y-1.5">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-[10px] font-bold uppercase tracking-wider">Total Token AI</span>
            <div className="h-7 w-7 rounded-lg bg-blue-50 text-blue-600 dark:bg-blue-950/50 dark:text-blue-400 flex items-center justify-center">
              <Cpu className="h-3.5 w-3.5" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            {summary?.totalTokens ? summary.totalTokens.toLocaleString('id-ID') : '128.450'}
          </div>
          <span className="text-[10px] text-slate-400 font-medium block">
            Input & output tokens gabungan
          </span>
        </div>

        {/* Estimasi Biaya USD & IDR */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#0B0F17] border border-slate-200 dark:border-slate-800 shadow-xs space-y-1.5">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-[10px] font-bold uppercase tracking-wider">Estimasi Biaya API</span>
            <div className="h-7 w-7 rounded-lg bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400 flex items-center justify-center">
              <DollarSign className="h-3.5 w-3.5" />
            </div>
          </div>
          <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 tracking-tight">
            ${summary?.totalCostUsd ?? '1.68'}
          </div>
          <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium block">
            Setara Rp {(summary?.totalCostIdr ?? 27300).toLocaleString('id-ID')}
          </span>
        </div>

        {/* Total Operasi Generasi */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#0B0F17] border border-slate-200 dark:border-slate-800 shadow-xs space-y-1.5">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-[10px] font-bold uppercase tracking-wider">Generasi Berhasil</span>
            <div className="h-7 w-7 rounded-lg bg-purple-50 text-purple-600 dark:bg-purple-950/50 dark:text-purple-400 flex items-center justify-center">
              <Sparkles className="h-3.5 w-3.5" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            {summary?.totalGenerations ?? 18}
          </div>
          <span className="text-[10px] text-slate-400 font-medium block">
            Artikel, infografis & sosmed
          </span>
        </div>

        {/* Rata-Rata Latensi */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#0B0F17] border border-slate-200 dark:border-slate-800 shadow-xs space-y-1.5">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-[10px] font-bold uppercase tracking-wider">Rata-Rata Respon</span>
            <div className="h-7 w-7 rounded-lg bg-amber-50 text-amber-600 dark:bg-amber-950/50 dark:text-amber-400 flex items-center justify-center">
              <Activity className="h-3.5 w-3.5" />
            </div>
          </div>
          <div className="text-2xl font-black text-amber-600 dark:text-amber-400 tracking-tight">
            {summary?.avgLatencySeconds ?? 1.84}s
          </div>
          <span className="text-[10px] text-slate-400 font-medium block">
            Performa inferensi global
          </span>
        </div>
      </div>
    </div>
  );
}
