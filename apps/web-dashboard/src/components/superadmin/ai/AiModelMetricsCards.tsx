'use client';

import React from 'react';
import { Cpu, Image as ImageIcon, Zap, Clock, ShieldCheck } from 'lucide-react';

interface ModelMetric {
  model: string;
  useCase: string;
  tokens: number;
  calls: number;
  costUsd: number;
  avgLatencyMs: number;
  qualityScore: string;
}

interface AiModelMetricsCardsProps {
  metrics?: ModelMetric[];
}

export function AiModelMetricsCards({ metrics }: AiModelMetricsCardsProps) {
  const getIcon = (model: string) => {
    if (model.includes('DALL-E')) return ImageIcon;
    if (model.includes('Mini')) return Zap;
    return Cpu;
  };

  const getColor = (model: string) => {
    if (model.includes('DALL-E')) return 'bg-purple-50 text-purple-600 dark:bg-purple-950/50 dark:text-purple-400';
    if (model.includes('Mini')) return 'bg-amber-50 text-amber-600 dark:bg-amber-950/50 dark:text-amber-400';
    return 'bg-blue-50 text-blue-600 dark:bg-blue-950/50 dark:text-blue-400';
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">
          Alokasi & Penggunaan Model AI
        </h3>
        <span className="text-xs text-slate-500 dark:text-slate-400">
          Metrik latensi dan estimasi biaya per arsitektur
        </span>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {metrics?.map((m) => {
          const Icon = getIcon(m.model);
          const colorClass = getColor(m.model);

          return (
            <div
              key={m.model}
              className="p-5 rounded-2xl bg-white dark:bg-[#0B0F17] border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between space-y-4"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className={`h-9 w-9 rounded-xl ${colorClass} flex items-center justify-center font-bold`}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60">
                    <ShieldCheck className="h-3 w-3" />
                    <span>Akurasi {m.qualityScore}</span>
                  </span>
                </div>

                <div>
                  <h4 className="font-extrabold text-slate-900 dark:text-white text-sm">
                    {m.model}
                  </h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-snug">
                    {m.useCase}
                  </p>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 grid grid-cols-3 gap-2 text-center">
                <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800">
                  <span className="text-[9px] text-slate-400 uppercase font-bold block">Token/Vol</span>
                  <span className="font-black text-xs text-slate-800 dark:text-slate-200">
                    {m.tokens > 1000 ? `${(m.tokens / 1000).toFixed(1)}k` : m.tokens}
                  </span>
                </div>

                <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800">
                  <span className="text-[9px] text-slate-400 uppercase font-bold block">Latensi</span>
                  <span className="font-black text-xs text-slate-800 dark:text-slate-200">
                    {(m.avgLatencyMs / 1000).toFixed(2)}s
                  </span>
                </div>

                <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800">
                  <span className="text-[9px] text-slate-400 uppercase font-bold block">Biaya USD</span>
                  <span className="font-black text-xs text-emerald-600 dark:text-emerald-400">
                    ${m.costUsd}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
