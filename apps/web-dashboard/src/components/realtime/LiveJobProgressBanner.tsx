'use client';

import { useRealtime } from '@/contexts/RealtimeContext';
import { Sparkles, CheckCircle2, Loader2, Cpu } from 'lucide-react';
import { cn } from '@/lib/utils';

export function LiveJobProgressBanner() {
  const { activeJob } = useRealtime();

  if (!activeJob) return null;

  const isCompleted = activeJob.status === 'COMPLETED' || activeJob.percent >= 100;

  return (
    <div className="fixed bottom-6 right-6 z-50 max-w-sm w-full animate-in slide-in-from-bottom-5 fade-in duration-200">
      <div className={cn(
        "p-4 rounded-2xl border backdrop-blur-xl shadow-2xl transition-all",
        isCompleted
          ? "bg-emerald-50/95 dark:bg-emerald-950/90 border-emerald-300 dark:border-emerald-700 text-emerald-950 dark:text-emerald-100"
          : "bg-white/95 dark:bg-slate-900/95 border-blue-200 dark:border-blue-800 text-slate-900 dark:text-slate-100"
      )}>
        {/* Header Bar */}
        <div className="flex items-center justify-between gap-2 mb-2">
          <div className="flex items-center gap-2">
            <div className={cn(
              "h-7 w-7 rounded-xl flex items-center justify-center shrink-0",
              isCompleted
                ? "bg-emerald-500 text-white"
                : "bg-blue-600 text-white"
            )}>
              {isCompleted ? (
                <CheckCircle2 className="h-4 w-4 animate-in zoom-in-50" />
              ) : (
                <Cpu className="h-4 w-4 animate-pulse" />
              )}
            </div>
            <div>
              <h4 className="text-xs font-black tracking-wide uppercase">
                {isCompleted ? 'Proses Selesai!' : 'Polaris AI & Redis Queue'}
              </h4>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 font-bold truncate max-w-[200px]">
                {activeJob.step}
              </p>
            </div>
          </div>

          <span className="text-sm font-black font-mono">
            {activeJob.percent}%
          </span>
        </div>

        {/* Dynamic Progress Bar */}
        <div className="w-full bg-slate-200 dark:bg-slate-800 h-2 rounded-full overflow-hidden mt-1 p-0.5">
          <div
            className={cn(
              "h-full rounded-full transition-all duration-500 ease-out",
              isCompleted
                ? "bg-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.5)]"
                : "bg-gradient-to-r from-blue-600 via-indigo-500 to-cyan-400 shadow-[0_0_12px_rgba(37,99,235,0.5)]"
            )}
            style={{ width: `${Math.min(100, Math.max(5, activeJob.percent))}%` }}
          />
        </div>

        {/* Footer Note */}
        {!isCompleted && (
          <div className="mt-2.5 flex items-center justify-between text-[10px] text-slate-400">
            <span className="flex items-center gap-1">
              <Loader2 className="h-2.5 w-2.5 animate-spin text-blue-500" />
              <span>Memproses secara asinkron...</span>
            </span>
            <span className="font-mono text-[9px]">ID: {activeJob.jobId.slice(-6)}</span>
          </div>
        )}
      </div>
    </div>
  );
}
