'use client';

interface EditorMetricsProps {
  wordCount: number;
  targetWords?: number;
  syncStatusText?: string;
}

export function EditorMetrics({
  wordCount,
  targetWords = 3000,
  syncStatusText = 'Tersinkron Regulasi Daerah',
}: EditorMetricsProps) {
  const progressPercent = Math.min(100, Math.round((wordCount / targetWords) * 100));

  return (
    <div className="lg:col-span-4 p-5 rounded-2xl bg-white border border-slate-200 space-y-3 shadow-xs text-xs text-slate-700">
      <div>
        <div className="flex items-center justify-between font-bold text-[11px] uppercase tracking-wider text-slate-500">
          <span>Panjang Naskah</span>
          <span className="text-blue-600 font-bold">{progressPercent}% dari Target</span>
        </div>
        <div className="text-sm font-black text-slate-900 mt-1">
          {wordCount.toLocaleString()} / {targetWords.toLocaleString()} Kata
        </div>
        <div className="w-full h-2 rounded-full bg-slate-100 mt-2 overflow-hidden border border-slate-100">
          <div
            className="h-full bg-blue-600 transition-all duration-300 rounded-full"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-[11px]">
        <span className="text-slate-500 font-medium">Status Rujukan:</span>
        <span className="font-extrabold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
          {syncStatusText}
        </span>
      </div>
    </div>
  );
}
