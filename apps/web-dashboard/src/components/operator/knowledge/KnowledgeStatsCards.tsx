'use client';

import React from 'react';
import { FileText, Sparkles, ShieldCheck, Lock } from 'lucide-react';
import { KnowledgeStats } from './types';

interface KnowledgeStatsCardsProps {
  stats: KnowledgeStats;
}

export function KnowledgeStatsCards({ stats }: KnowledgeStatsCardsProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <div className="bg-white dark:bg-slate-900/60 p-4 rounded-xl border border-slate-200/80 dark:border-slate-800/80 shadow-xs flex items-center gap-3.5">
        <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0 border border-indigo-200/60 dark:border-indigo-500/20">
          <FileText className="w-5 h-5" />
        </div>
        <div>
          <div className="text-xs font-semibold text-slate-500 dark:text-slate-400">Total Dokumen Binaan</div>
          <div className="text-xl font-black text-slate-900 dark:text-white">{stats.totalDocuments}</div>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900/60 p-4 rounded-xl border border-slate-200/80 dark:border-slate-800/80 shadow-xs flex items-center gap-3.5">
        <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0 border border-purple-200/60 dark:border-purple-500/20">
          <Sparkles className="w-5 h-5" />
        </div>
        <div>
          <div className="text-xs font-semibold text-slate-500 dark:text-slate-400">Token AI Terserap</div>
          <div className="text-xl font-black text-purple-600 dark:text-purple-300">
            {stats.totalTokens.toLocaleString('id-ID')}
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900/60 p-4 rounded-xl border border-slate-200/80 dark:border-slate-800/80 shadow-xs flex items-center gap-3.5">
        <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-500/15 text-indigo-600 dark:text-indigo-300 flex items-center justify-center shrink-0 border border-indigo-200/60 dark:border-indigo-500/30">
          <ShieldCheck className="w-5 h-5" />
        </div>
        <div>
          <div className="text-xs font-semibold text-slate-500 dark:text-slate-400">Internal Fraksi Partai</div>
          <div className="text-xl font-black text-indigo-600 dark:text-indigo-300">
            {stats.scopeCounts.PARTY_CONFIDENTIAL || 0}
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900/60 p-4 rounded-xl border border-slate-200/80 dark:border-slate-800/80 shadow-xs flex items-center gap-3.5">
        <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-200/60 dark:border-emerald-500/20">
          <Lock className="w-5 h-5" />
        </div>
        <div>
          <div className="text-xs font-semibold text-slate-500 dark:text-slate-400">Rahasia Privat Dewan</div>
          <div className="text-xl font-black text-emerald-600 dark:text-emerald-300">
            {stats.scopeCounts.PRIVATE_TENANT || 0}
          </div>
        </div>
      </div>
    </div>
  );
}

