'use client';

import { Sparkles, ArrowRight, Loader2 } from 'lucide-react';
import { WritingStyle, WRITING_STYLES } from './WritingStyleSelector';

interface ArticleAiRefineBarProps {
  promptInput: string;
  setPromptInput: (v: string) => void;
  onRefine: (customPrompt?: string) => void;
  loading: boolean;
  isUnpaid: boolean;
  selectedStyle: WritingStyle;
}

export function ArticleAiRefineBar({
  promptInput,
  setPromptInput,
  onRefine,
  loading,
  isUnpaid,
  selectedStyle,
}: ArticleAiRefineBarProps) {
  const cfg = WRITING_STYLES[selectedStyle];

  const QUICK_ACTIONS = [
    `✨ Perhalus dengan Gaya ${cfg.name}`,
    '📊 Tambahkan Tabel Deviasi & Grafik Data',
    '⚖️ Sertakan Rujukan Regulasi UU/Perda Terkait',
    '🔍 Periksa EYD & Struktur Kalimat Baku',
    '✂️ Buatkan Ringkasan Eksekutif 1 Paragraf',
  ];

  return (
    <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 sm:p-5 shadow-xs space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="h-6 w-6 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center">
            <Sparkles className="h-3.5 w-3.5" />
          </div>
          <span className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white">
            AI Co-Pilot Kebijakan Parlemen
          </span>
        </div>
        <span className="text-[10px] font-bold text-slate-400">
          Target: {cfg.badge}
        </span>
      </div>

      {/* QUICK PROMPT PILLS */}
      <div className="flex flex-wrap gap-1.5">
        {QUICK_ACTIONS.map((action) => (
          <button
            key={action}
            type="button"
            onClick={() => onRefine(action)}
            disabled={loading}
            className="text-[11px] font-semibold px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-blue-950/40 text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 border border-transparent hover:border-blue-200 dark:hover:border-blue-800 transition-all cursor-pointer"
          >
            {action}
          </button>
        ))}
      </div>

      {/* PROMPT INPUT */}
      <div className="flex items-center gap-2 pt-1">
        <input
          type="text"
          placeholder={`Beri instruksi AI: misal "Tambahkan data anggaran infrastruktur dan matriks solusi..."`}
          value={promptInput}
          onChange={(e) => setPromptInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              onRefine();
            }
          }}
          disabled={loading}
          className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
        />

        <button
          type="button"
          onClick={() => onRefine()}
          disabled={loading || !promptInput.trim()}
          className="px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 transition-all flex items-center gap-1.5 shrink-0 shadow-xs cursor-pointer"
        >
          {loading ? (
            <>
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
              <span>Memproses...</span>
            </>
          ) : (
            <>
              <span>Proses AI</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </>
          )}
        </button>
      </div>
    </div>
  );
}
