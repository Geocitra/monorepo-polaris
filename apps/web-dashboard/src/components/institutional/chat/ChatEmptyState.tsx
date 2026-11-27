'use client';

import type React from 'react';
import {
  Sparkles,
  Newspaper,
  Table2,
  Scale,
  Image as ImageIcon,
  ArrowUpRight,
} from 'lucide-react';
import type {
  CoordinatorChatMode,
  ProactivePromptCardDto,
} from '@polaris/shared-types';

interface ChatEmptyStateProps {
  unitName?: string;
  proactiveCards: ProactivePromptCardDto[];
  loadingProactive: boolean;
  onSelectProactiveCard: (card: ProactivePromptCardDto) => void;
  composerSlot: React.ReactNode;
}

const CATEGORY_ICON: Record<ProactivePromptCardDto['category'], typeof Newspaper> = {
  NEWS: Newspaper,
  LKPJ: Table2,
  LEGISLATION: Scale,
  IMAGE: ImageIcon,
};

const CATEGORY_ACCENT: Record<ProactivePromptCardDto['category'], string> = {
  NEWS: 'text-sky-600 bg-sky-50 border-sky-200 dark:bg-sky-950/50 dark:border-sky-800/60 dark:text-sky-300',
  LKPJ: 'text-emerald-600 bg-emerald-50 border-emerald-200 dark:bg-emerald-950/50 dark:border-emerald-800/60 dark:text-emerald-300',
  LEGISLATION: 'text-indigo-600 bg-indigo-50 border-indigo-200 dark:bg-indigo-950/50 dark:border-indigo-800/60 dark:text-indigo-300',
  IMAGE: 'text-purple-600 bg-purple-50 border-purple-200 dark:bg-purple-950/50 dark:border-purple-800/60 dark:text-purple-300',
};

export function ChatEmptyState({
  unitName,
  proactiveCards,
  loadingProactive,
  onSelectProactiveCard,
  composerSlot,
}: ChatEmptyStateProps) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center px-3 sm:px-6 py-8">
      <div className="w-full max-w-3xl space-y-6">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200/70 dark:border-indigo-800/60 text-indigo-700 dark:text-indigo-300 text-xs font-bold">
            <Sparkles className="h-3.5 w-3.5" />
            <span>POLARIS B2B &bull; {unitName || 'Ruang Kerja Bidang'}</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 dark:text-white">
            Apa yang ingin kita analisis hari ini?
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Ketik perintah langsung, tekan <strong>+</strong> untuk LKPJ/Legislasi/Gambar, atau pilih rekomendasi di bawah.
          </p>
        </div>

        {/* Composer berada tepat di tengah layar seperti ChatGPT/Gemini */}
        {composerSlot}

        {/* Rekomendasi Prompt Proaktif dari Berita Daerah & DB Bidang */}
        <div className="space-y-2">
          <div className="flex items-center justify-between px-1">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">
              Rekomendasi Cerdas untuk Anda (Dari Berita &amp; Dokumen Bidang)
            </span>
          </div>

          {loadingProactive ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="h-20 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-100/60 dark:bg-slate-900/40 animate-pulse"
                />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {proactiveCards.map((card) => {
                const Icon = CATEGORY_ICON[card.category] || Sparkles;
                const accent = CATEGORY_ACCENT[card.category] || CATEGORY_ACCENT.NEWS;
                return (
                  <button
                    key={card.id}
                    type="button"
                    onClick={() => onSelectProactiveCard(card)}
                    className="group text-left p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111827] hover:border-indigo-400 dark:hover:border-indigo-600 hover:shadow-sm transition-all cursor-pointer flex flex-col justify-between gap-2"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border ${accent}`}
                      >
                        <Icon className="h-3 w-3" />
                        <span>{card.badge}</span>
                      </span>
                      <ArrowUpRight className="h-3.5 w-3.5 text-slate-300 group-hover:text-indigo-500 transition-colors" />
                    </div>
                    <p className="text-xs font-bold text-slate-800 dark:text-slate-100 line-clamp-2 leading-snug">
                      {card.title}
                    </p>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
