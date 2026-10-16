'use client';

import { useState, useRef, useEffect } from 'react';
import {
  Sparkles,
  Send,
  Loader2,
  History,
  MessageSquare,
  Bot,
  User,
  Clock,
  ArrowUpRight,
  ChevronDown,
  RotateCcw,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export interface StudioChatMessage {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  timestamp: string;
  versionGenerated?: number;
  promptAction?: string;
  deltaWords?: number;
}

interface TerpaduChatCopilotProps {
  chatMessages: StudioChatMessage[];
  onSendMessage: (promptText: string) => void;
  loading: boolean;
  isUnpaid: boolean;
  currentVersion: number;
  iterationsCount: number;
  onOpenVersionDrawer: () => void;
  authorName?: string;
}

const DEFAULT_QUICK_ACTIONS = [
  '⚖️ Sertakan rujukan regulasi UU/Perda terkait',
  '📊 Tambahkan data alokasi anggaran APBD & tabel deviasi',
  '✂️ Ringkas poin utama menjadi lebih padat & tajam',
  '🔍 Periksa kesesuaian EYD & tata bahasa baku',
  '✨ Pertegas solusi kebijakan dan rekomendasi dewan',
];

export function TerpaduChatCopilot({
  chatMessages,
  onSendMessage,
  loading,
  isUnpaid,
  currentVersion,
  iterationsCount,
  onOpenVersionDrawer,
  authorName = 'Anggota Dewan',
}: TerpaduChatCopilotProps) {
  const [inputPrompt, setInputPrompt] = useState('');
  const [isExpanded, setIsExpanded] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (chatMessages.length > 0) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatMessages]);

  function handleSubmit(e?: React.FormEvent) {
    if (e) e.preventDefault();
    if (!inputPrompt.trim() || loading || isUnpaid) return;
    const text = inputPrompt.trim();
    setInputPrompt('');
    onSendMessage(text);
  }

  function handleQuickAction(action: string) {
    if (loading || isUnpaid) return;
    onSendMessage(action);
  }

  return (
    <div className="rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm overflow-hidden transition-all duration-200">
      {/* Header Bilah Co-Pilot */}
      <div className="p-3.5 sm:p-4 bg-slate-50/80 dark:bg-slate-800/40 border-b border-slate-200/80 dark:border-slate-800 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="h-8 w-8 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center shadow-xs">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white">
                AI Co-Pilot & Riwayat Chat Iterasi
              </h4>
              <span className="px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950/80 text-blue-700 dark:text-blue-300 text-[10px] font-black">
                Versi v{currentVersion}
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Instruksikan AI untuk merevisi draf, memperkaya data, atau mengubah nada naskah
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 shrink-0">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onOpenVersionDrawer}
            className="gap-1.5 text-xs font-bold rounded-xl h-8 px-3 border-slate-200 dark:border-slate-700 hover:border-blue-300 dark:hover:border-blue-600 cursor-pointer shadow-2xs"
          >
            <History className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
            <span className="hidden sm:inline">Riwayat Versi ({iterationsCount})</span>
            <span className="sm:hidden">v{currentVersion}</span>
          </Button>

          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            title={isExpanded ? 'Sembunyikan Riwayat Chat' : 'Tampilkan Riwayat Chat'}
          >
            <ChevronDown
              className={`w-4 h-4 transition-transform duration-200 ${
                isExpanded ? '' : '-rotate-90'
              }`}
            />
          </button>
        </div>
      </div>

      {isExpanded && (
        <div className="p-3.5 sm:p-4 space-y-3.5">
          {/* Thread Percakapan Chat AI Co-pilot */}
          {chatMessages.length > 0 ? (
            <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
              {chatMessages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex gap-3 text-xs ${
                    msg.role === 'user' ? 'justify-end' : 'justify-start'
                  }`}
                >
                  {msg.role === 'assistant' && (
                    <div className="h-7 w-7 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-2xs mt-0.5">
                      <Bot className="w-4 h-4" />
                    </div>
                  )}

                  <div
                    className={`max-w-[85%] rounded-2xl p-3 space-y-1.5 ${
                      msg.role === 'user'
                        ? 'bg-blue-600 text-white shadow-2xs rounded-tr-xs'
                        : 'bg-slate-100 dark:bg-slate-800/80 text-slate-800 dark:text-slate-200 border border-slate-200/70 dark:border-slate-700/60 rounded-tl-xs'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-3 text-[10px] opacity-80 border-b pb-1 border-white/20 dark:border-slate-700">
                      <span className="font-bold">
                        {msg.role === 'user' ? authorName : 'Polaris AI Co-Pilot'}
                      </span>
                      {msg.versionGenerated && (
                        <span className="font-extrabold px-1.5 py-0.2 rounded-md bg-black/10 dark:bg-white/10">
                          Snapshot v{msg.versionGenerated}
                        </span>
                      )}
                    </div>

                    <p className="whitespace-pre-line leading-relaxed text-xs">
                      {msg.text}
                    </p>

                    <div className="flex items-center justify-between gap-2 text-[9px] opacity-70 pt-0.5">
                      {msg.deltaWords !== undefined && msg.deltaWords !== 0 && (
                        <span className="font-semibold">
                          {msg.deltaWords > 0 ? `+${msg.deltaWords}` : msg.deltaWords} kata
                        </span>
                      )}
                      <span className="ml-auto">
                        {new Date(msg.timestamp).toLocaleTimeString('id-ID', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>
                  </div>

                  {msg.role === 'user' && (
                    <div className="h-7 w-7 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center justify-center shrink-0 mt-0.5">
                      <User className="w-3.5 h-3.5" />
                    </div>
                  )}
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
          ) : (
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/70 dark:border-slate-800 flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
              <MessageSquare className="w-5 h-5 text-blue-500 shrink-0" />
              <span>
                Belum ada instruksi revisi. Berikan prompt di bawah untuk meminta AI menyempurnakan draf konten Anda secara interaktif.
              </span>
            </div>
          )}

          {/* Quick Prompt Pills */}
          <div className="space-y-1.5">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-400">
              Pilihan Instruksi Cepat:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {DEFAULT_QUICK_ACTIONS.map((action) => (
                <button
                  key={action}
                  type="button"
                  disabled={loading || isUnpaid}
                  onClick={() => handleQuickAction(action)}
                  className="text-[11px] font-semibold px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-blue-950/40 text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 border border-slate-200/60 dark:border-slate-700 hover:border-blue-300 transition-all cursor-pointer disabled:opacity-50"
                >
                  {action}
                </button>
              ))}
            </div>
          </div>

          {/* Input Chat Prompt Bar */}
          <form onSubmit={handleSubmit} className="relative flex items-center gap-2 pt-1">
            <input
              type="text"
              value={inputPrompt}
              onChange={(e) => setInputPrompt(e.target.value)}
              placeholder="Ketik instruksi revisi: misal 'Tambahkan tabel anggaran 2026 dan usulan pembangunan irigasi...'"
              disabled={loading || isUnpaid}
              className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-blue-500 disabled:opacity-60"
            />

            <Button
              type="submit"
              disabled={!inputPrompt.trim() || loading || isUnpaid}
              className="bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs h-10 px-4 rounded-xl gap-1.5 shrink-0 shadow-xs cursor-pointer disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Memproses...</span>
                </>
              ) : (
                <>
                  <Send className="w-3.5 h-3.5" />
                  <span>Revisi AI</span>
                </>
              )}
            </Button>
          </form>
        </div>
      )}
    </div>
  );
}
