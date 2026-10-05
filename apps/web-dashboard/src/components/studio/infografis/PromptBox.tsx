'use client';

import { Sparkles, Send, Loader2, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface PromptBoxProps {
  chatPrompt: string;
  onPromptChange: (val: string) => void;
  onSubmit: (e?: React.FormEvent, customSuggestion?: string) => void;
  loading: boolean;
  isUnpaid: boolean;
  userInitial?: string;
  suggestions?: string[];
}

export function PromptBox({
  chatPrompt,
  onPromptChange,
  onSubmit,
  loading,
  isUnpaid,
  userInitial = 'D',
  suggestions = [
    'Sederhanakan bahasa visual',
    'Tambahkan lebih banyak statistik dampak',
    'Buat varian warna fraksi',
    'Ubah format ke Instagram Story 9:16',
  ],
}: PromptBoxProps) {
  return (
    <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-2 text-slate-700 font-bold uppercase tracking-wider text-[11px]">
          <Sparkles className="h-4 w-4 text-blue-600" />
          <span>Interaktif Prompt AI Studio</span>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-slate-500 font-semibold">
          <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>AI Desainer Siap Menerima Instruksi</span>
        </div>
      </div>

      {/* SARAN PROMPT CHIPS */}
      <div className="flex items-center gap-2 flex-wrap text-xs">
        <span className="text-slate-400 font-semibold text-[11px]">Saran:</span>
        {suggestions.map((saran) => (
          <button
            key={saran}
            type="button"
            onClick={() => {
              if (isUnpaid) {
                onSubmit(undefined, saran);
                return;
              }
              onPromptChange(saran);
              onSubmit(undefined, saran);
            }}
            className="px-3 py-1 rounded-full bg-slate-50 border border-slate-200 text-slate-700 hover:border-blue-400 hover:text-blue-600 text-xs font-semibold transition-all shadow-xs"
          >
            "{saran}"
          </button>
        ))}
      </div>

      {/* INPUT CHAT PROMPT */}
      <form onSubmit={(e) => onSubmit(e)} className="flex items-center gap-3 pt-1">
        <div className="h-10 w-10 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-sm shrink-0 border border-blue-200">
          {userInitial}
        </div>
        <input
          type="text"
          disabled={isUnpaid}
          value={chatPrompt}
          onChange={(e) => onPromptChange(e.target.value)}
          placeholder={
            isUnpaid
              ? '🔒 Fitur AI Infografis terkunci. Silakan aktifkan lisensi di menu Billing...'
              : 'Minta AI untuk mengubah palet warna, membuat poster baru DALL-E 3, atau menyesuaikan data...'
          }
          className="w-full rounded-2xl bg-slate-50 border border-slate-300 px-4 py-3 text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:bg-white focus:border-blue-600 focus:outline-none disabled:cursor-not-allowed"
        />
        <Button
          type="submit"
          disabled={loading || isUnpaid}
          className={`py-3 px-5 rounded-2xl font-extrabold text-xs shrink-0 shadow-sm gap-1.5 ${
            isUnpaid
              ? 'bg-slate-100 border border-slate-300 text-slate-400 hover:bg-slate-100 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700 text-white cursor-pointer'
          }`}
        >
          {isUnpaid ? (
            <>
              <Lock className="h-4 w-4 text-slate-400" />
              <span>Terkunci</span>
            </>
          ) : loading ? (
            <Loader2 className="h-4 w-4 animate-spin text-white" />
          ) : (
            <>
              <Send className="h-4 w-4 text-white" />
              <span className="hidden sm:inline">Kirim Instruksi</span>
            </>
          )}
        </Button>
      </form>
    </div>
  );
}
