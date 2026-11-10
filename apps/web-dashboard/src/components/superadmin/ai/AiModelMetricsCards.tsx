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
              className="p-5 rounded-2xl bg-white dark:bg-[#0B0F17] border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between space-y-4 hover:border-slate-300 dark:hover:border-slate-700 transition-colors"
            >
              {/* HEADER SIMPLE & CLEAN */}
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className={`h-10 w-10 rounded-xl ${colorClass} flex items-center justify-center font-bold shadow-xs shrink-0`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h4 className="font-extrabold text-slate-900 dark:text-white text-sm leading-tight truncate">
                      {m.model}
                    </h4>
                    <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block mt-0.5">
                      {prov} Architecture
                    </span>
                  </div>
                </div>

                <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                  {m.useCase}
                </p>
              </div>

              {/* STATS STRIP (CLEAN & CONTRASTED) */}
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
