'use client';

import { useState, useEffect, type ReactNode } from 'react';
import {
  Sparkles,
  Newspaper,
  Table2,
  Scale,
  Image as ImageIcon,
  ArrowUpRight,
  FileText,
  ClipboardList,
  ChevronDown,
} from 'lucide-react';
import type {
  CoordinatorChatMode,
  ProactivePromptCardDto,
} from '@polaris/shared-types';

interface ChatEmptyStateProps {
  userFullName?: string;
  userPhotoUrl?: string | null;
  orgName?: string;
  unitName?: string;
  activeMode?: CoordinatorChatMode;
  proactiveCards: ProactivePromptCardDto[];
  loadingProactive: boolean;
  onSelectProactiveCard: (card: ProactivePromptCardDto) => void;
  onSelectQuickMode: (mode: CoordinatorChatMode, prefillPrompt?: string) => void;
  composerSlot: ReactNode;
}

function getTimeGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 11) return 'Selamat pagi';
  if (hour < 15) return 'Selamat siang';
  if (hour < 18) return 'Selamat sore';
  return 'Selamat malam';
}

const QUICK_MODE_PILLS: Array<{
  id: string;
  label: string;
  mode: CoordinatorChatMode;
  prefill?: string;
  icon: typeof Table2;
}> = [
  { id: 'lkpj', label: 'Evaluasi LKPJ', mode: 'LKPJ_FINANCE', icon: Table2 },
  { id: 'legislation', label: 'Telaah Raperda', mode: 'LEGISLATION', icon: Scale },
  { id: 'article', label: 'Rilis Pers & Artikel', mode: 'ARTICLE', icon: FileText },
  { id: 'image', label: 'Buat Infografis', mode: 'IMAGE', icon: ImageIcon },
  {
    id: 'briefing',
    label: 'Briefing Rapat 5 Poin',
    mode: 'BRIEFING',
    prefill: 'Susun briefing rapat 5 poin yang ringkas dan tegas mengenai agenda prioritas bidang hari ini.',
    icon: ClipboardList,
  },
];

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
  userFullName,
  userPhotoUrl,
  orgName,
  unitName,
  activeMode = 'AUTO',
  proactiveCards,
  loadingProactive,
  onSelectProactiveCard,
  onSelectQuickMode,
  composerSlot,
}: ChatEmptyStateProps) {
  const [recommendationsOpen, setRecommendationsOpen] = useState(true);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('polaris_b2b_recs_open');
      if (saved === 'false') setRecommendationsOpen(false);
    } catch {}
  }, []);

  const toggleRecommendations = () => {
    setRecommendationsOpen((prev) => {
      const next = !prev;
      try {
        localStorage.setItem('polaris_b2b_recs_open', String(next));
      } catch {}
      return next;
    });
  };

  const greeting = getTimeGreeting();
  const displayName = userFullName?.trim() || 'Pimpinan';
  const initials = displayName
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() || '')
    .join('') || 'P';

  return (
    <div className="flex-1 flex flex-col items-center justify-center px-3 sm:px-6 py-10 sm:py-14">
      <div className="w-full max-w-3xl space-y-7">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2.5 justify-center">
            {userPhotoUrl ? (
              <img
                src={userPhotoUrl}
                alt={displayName}
                className="h-9 w-9 rounded-full object-cover border border-indigo-400/70 dark:border-indigo-500/60 shadow-xs"
              />
            ) : (
              <div className="h-9 w-9 rounded-full bg-gradient-to-br from-indigo-600 to-slate-900 text-white flex items-center justify-center text-xs font-black border border-indigo-300/60 dark:border-indigo-500/40 shadow-xs">
                {initials}
              </div>
            )}
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200/70 dark:border-indigo-800/60 text-indigo-700 dark:text-indigo-300 text-[11px] font-bold">
              <Sparkles className="h-3 w-3" />
              <span>
                {orgName ? `${orgName} • ` : ''}
                {unitName || 'Ruang Kerja Bidang'}
              </span>
            </span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 dark:text-white pt-1">
            {greeting}, {displayName}
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Asisten Koordinator Tenaga Ahli siap mendampingi agenda <strong>{unitName || 'Bidang Anda'}</strong> hari ini.
          </p>
        </div>

        {/* Composer berada tepat di tengah layar seperti ChatGPT/Gemini */}
        {composerSlot}

        {/* Pill Aksi Cepat & Rekomendasi hanya tampil saat mode AUTO (hilang otomatis saat mode spesifik aktif) */}
        {activeMode === 'AUTO' && (
          <>
            <div className="flex flex-wrap items-center justify-center gap-2">
              {QUICK_MODE_PILLS.map((pill) => {
                const Icon = pill.icon;
                return (
                  <button
                    key={pill.id}
                    type="button"
                    onClick={() => onSelectQuickMode(pill.mode, pill.prefill)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-slate-200 dark:border-slate-700/80 bg-white dark:bg-[#111827] hover:border-indigo-400 dark:hover:border-indigo-500 hover:bg-indigo-50/50 dark:hover:bg-indigo-950/30 text-xs font-semibold text-slate-700 dark:text-slate-200 transition-all cursor-pointer shadow-2xs"
                  >
                    <Icon className="h-3.5 w-3.5 text-indigo-500" />
                    <span>{pill.label}</span>
                  </button>
                );
              })}
            </div>

            {(loadingProactive || proactiveCards.length > 0) && (
              <div className="space-y-2">
                <button
                  type="button"
                  onClick={toggleRecommendations}
                  aria-expanded={recommendationsOpen}
                  className="w-full flex items-center justify-between px-1 py-0.5 text-left group cursor-pointer"
                >
                  <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300 transition-colors">
                    Rekomendasi Cerdas untuk Anda (Dari Berita &amp; Dokumen Bidang)
                  </span>
                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300 transition-colors">
                    <span>{recommendationsOpen ? 'Tutup' : 'Buka'}</span>
                    <ChevronDown
                      className={`h-3.5 w-3.5 transition-transform duration-200 ${
                        recommendationsOpen ? '' : '-rotate-90'
                      }`}
                    />
                  </span>
                </button>

                {recommendationsOpen &&
                  (loadingProactive ? (
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
                  ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
