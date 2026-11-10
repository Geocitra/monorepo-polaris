'use client';

import React from 'react';
import { Cpu, Image as ImageIcon, Zap, ShieldCheck } from 'lucide-react';

interface ModelMetric {
  model: string;
  provider?: 'OPENAI' | 'GEMINI';
  useCase: string;
  tokens: number;
  imageCalls?: number;
  calls: number;
  costIdr: number;
  costUsd?: number;
  avgLatencyMs: number;
  qualityScore: string;
}

interface AiModelMetricsCardsProps {
  metrics?: ModelMetric[];
}

export function AiModelMetricsCards({ metrics }: AiModelMetricsCardsProps) {
  const getIcon = (model: string) => {
    if (model.includes('DALL-E') || model.includes('Imagen') || model.includes('Visual')) return ImageIcon;
    if (model.includes('Mini') || model.includes('Flash')) return Zap;
    return Cpu;
  };

  const getColor = (model: string) => {
    if (model.includes('DALL-E') || model.includes('Imagen') || model.includes('Visual')) {
      return 'bg-purple-50 text-purple-600 dark:bg-purple-950/50 dark:text-purple-400';
    }
    if (model.includes('Mini') || model.includes('Flash')) {
      return 'bg-amber-50 text-amber-600 dark:bg-amber-950/50 dark:text-amber-400';
    }
    return 'bg-blue-50 text-blue-600 dark:bg-blue-950/50 dark:text-blue-400';
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
        <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">
          Alokasi &amp; Penggunaan Model AI (OpenAI vs Google Gemini)
        </h3>
        <span className="text-xs text-slate-500 dark:text-slate-400">
          Metrik volume, latensi, dan realisasi biaya Rupiah per arsitektur model
        </span>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {metrics?.map((m) => {
          const Icon = getIcon(m.model);
          const colorClass = getColor(m.model);
          const isImageEngine = (m.imageCalls ?? 0) > 0 && m.tokens === 0;
          const prov = m.provider || (m.model.toLowerCase().includes('gemini') || m.model.toLowerCase().includes('imagen') ? 'GEMINI' : 'OPENAI');
          const isGemini = prov === 'GEMINI';

          const volumeText = isImageEngine
            ? `${(m.imageCalls || m.calls).toLocaleString('id-ID')} img`
            : m.tokens >= 1_000_000
            ? `${(m.tokens / 1_000_000).toFixed(2)}M tok`
            : m.tokens >= 1_000
            ? `${(m.tokens / 1_000).toFixed(1)}k tok`
            : `${m.tokens} tok`;

          const latencySec = (m.avgLatencyMs / 1000).toFixed(2);
          const costFormatted = Math.round(Number(m.costIdr || 0)).toLocaleString('id-ID');

          return (
            <div
              key={m.model}
              className={`p-5 rounded-2xl border transition-all duration-200 flex flex-col justify-between space-y-4 ${
                isGemini
                  ? 'bg-gradient-to-br from-indigo-50/30 via-white to-white dark:from-indigo-950/20 dark:via-[#0B0F17] dark:to-[#0B0F17] border-indigo-100 dark:border-indigo-950/60 shadow-xs'
                  : 'bg-gradient-to-br from-emerald-50/30 via-white to-white dark:from-emerald-950/20 dark:via-[#0B0F17] dark:to-[#0B0F17] border-emerald-100 dark:border-emerald-950/60 shadow-xs'
              }`}
            >
              {/* HEADER */}
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <div className={`h-10 w-10 rounded-xl ${colorClass} flex items-center justify-center font-bold shadow-xs shrink-0`}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="flex items-center gap-1.5 flex-wrap justify-end">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider ${
                        isGemini
                          ? 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800'
                          : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                      }`}
                    >
                      {prov}
                    </span>
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      <span>{m.qualityScore}</span>
                    </span>
                  </div>
                </div>

                <div>
                  <h4 className="font-extrabold text-slate-900 dark:text-white text-sm leading-tight">
                    {m.model}
                  </h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                    {m.useCase}
                  </p>
                </div>
              </div>

              {/* STATS STRIP (CLEAN & CONTRASTED, NO CLUNKY NESTED BOXES) */}
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 space-y-2">
                <div className="flex items-baseline justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    {isImageEngine ? 'Volume Gambar' : 'Total Token'}
                  </span>
                  <span className="font-mono font-black text-sm text-slate-900 dark:text-white">
                    {volumeText}
                  </span>
                </div>

                <div className="flex items-center justify-between text-xs">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Rerata Latensi
                  </span>
                  <span className="font-mono font-bold text-[11px] text-slate-600 dark:text-slate-300">
                    ⚡ {latencySec}s
                  </span>
                </div>

                <div className="flex items-center justify-between pt-1 border-t border-dashed border-slate-100 dark:border-slate-800/60">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Realisasi Biaya
                  </span>
                  <span className="font-mono font-black text-xs text-emerald-600 dark:text-emerald-400">
                    Rp {costFormatted}
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
