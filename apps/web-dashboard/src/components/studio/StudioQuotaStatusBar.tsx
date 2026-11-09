'use client';

import React from 'react';
import Link from 'next/link';
import { Zap, Calendar, AlertTriangle, Cpu } from 'lucide-react';

export interface StudioQuotaStatusBarProps {
  quota?: {
    remainingQuota?: number;
    totalQuotaAllocated?: number;
    weeklyUsed?: number;
    weeklyAllowanceLimit?: number;
    openaiTotalTokens?: number;
    geminiTotalTokens?: number;
  };
  isUrgentOverquota: boolean;
  onToggleUrgentOverquota: (val: boolean) => void;
}

export function StudioQuotaStatusBar({
  quota,
  isUrgentOverquota,
  onToggleUrgentOverquota,
}: StudioQuotaStatusBarProps) {
  if (!quota) return null;

  const remaining = quota.remainingQuota ?? 0;
  const allocated = quota.totalQuotaAllocated ?? 12;
  const weeklyUsed = quota.weeklyUsed ?? 0;
  const weeklyLimit = quota.weeklyAllowanceLimit ?? 3;
  const isWeeklyFull = weeklyUsed >= weeklyLimit;
  const isQuotaExhausted = remaining <= 0;

  return (
    <div className="rounded-2xl bg-white dark:bg-[#0E131F] border border-slate-200/90 dark:border-slate-800 px-4 py-3 shadow-2xs flex flex-col lg:flex-row lg:items-center justify-between gap-3 text-xs">
      <div className="flex flex-wrap items-center gap-3 sm:gap-5">
        {/* Saldo Kuota Paket */}
        <div className="flex items-center gap-2">
          <div
            className={`h-7 w-7 rounded-lg flex items-center justify-center shrink-0 ${isQuotaExhausted
              ? 'bg-rose-50 text-rose-600 dark:bg-rose-950/60 dark:text-rose-400'
              : 'bg-indigo-50 text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-400'
              }`}
          >
            <Zap className="h-3.5 w-3.5" />
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
              Sisa Kuota Paket
            </span>
            <span
              className={`font-black font-mono ${isQuotaExhausted
                ? 'text-rose-600 dark:text-rose-400'
                : 'text-slate-900 dark:text-white'
                }`}
            >
              {remaining} / {allocated} Request
            </span>
          </div>
        </div>

        <div className="h-6 w-px bg-slate-200 dark:bg-slate-800 hidden sm:block" />

        {/* Jatah Mingguan (Omnichannel WA + Web Studio) */}
        <div className="flex items-center gap-2">
          <div
            className={`h-7 w-7 rounded-lg flex items-center justify-center shrink-0 ${isWeeklyFull
              ? 'bg-amber-50 text-amber-600 dark:bg-amber-950/60 dark:text-amber-400'
              : 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400'
              }`}
          >
            <Calendar className="h-3.5 w-3.5" />
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
              Jatah Mingguan (WA &amp; Web)
            </span>
            <span className="font-black font-mono text-slate-900 dark:text-white">
              {weeklyUsed} / {weeklyLimit} Terpakai
            </span>
          </div>
        </div>

        <div className="h-6 w-px bg-slate-200 dark:bg-slate-800 hidden md:block" />

        {/* Dual-AI Token Counter */}
        <div className="hidden md:flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400">
          <Cpu className="h-3.5 w-3.5 text-blue-500 shrink-0" />
          <span>
            OpenAI:{' '}
            <strong className="font-mono text-slate-700 dark:text-slate-200">
              {(quota.openaiTotalTokens ?? 0).toLocaleString('id-ID')}
            </strong>{' '}
            tok • Gemini:{' '}
            <strong className="font-mono text-slate-700 dark:text-slate-200">
              {(quota.geminiTotalTokens ?? 0).toLocaleString('id-ID')}
            </strong>{' '}
            tok
          </span>
        </div>
      </div>

      {/* Right Action / Urgent Over-Quota Toggle */}
      <div className="flex items-center gap-2.5 flex-wrap">
        {isQuotaExhausted ? (
          <Link
            href="/billing"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-[11px] shadow-xs transition-colors"
          >
            <AlertTriangle className="h-3.5 w-3.5" />
            <span>Kuota Paket Habis — Isi Ulang Kuota</span>
          </Link>
        ) : isWeeklyFull ? (
          <label className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-amber-50 dark:bg-amber-950/50 border border-amber-300 dark:border-amber-800 text-amber-900 dark:text-amber-200 font-bold text-[11px] cursor-pointer select-none">
            <input
              type="checkbox"
              checked={isUrgentOverquota}
              onChange={(e) => onToggleUrgentOverquota(e.target.checked)}
              disabled={remaining < 2}
              className="rounded border-amber-400 text-amber-600 focus:ring-amber-500"
            />
            <span>
              Jatah Mingguan Penuh ({weeklyUsed}/{weeklyLimit}) — Gunakan Mode Darurat (-2 Kuota)
            </span>
          </label>
        ) : (
          <Link
            href="/billing"
            className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
          >
            Detail Kuota &amp; Buku Besar &rarr;
          </Link>
        )}
      </div>
    </div>
  );
}

