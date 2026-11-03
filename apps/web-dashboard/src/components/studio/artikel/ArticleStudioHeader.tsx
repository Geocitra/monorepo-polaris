'use client';

import React from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  MessageSquare,
  ChevronDown,
  Plus,
  Eye,
  Edit3,
  Maximize2,
  Minimize2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { ArticleSession } from './ArticleSessionDrawer';

interface ArticleStudioHeaderProps {
  activeSession?: ArticleSession;
  onOpenSessionDrawer: () => void;
  onCreateNewSession: () => void;
  viewMode: 'DOCS' | 'EDIT';
  setViewMode: (mode: 'DOCS' | 'EDIT') => void;
  isWide: boolean;
  onToggleWide: () => void;
}

export function ArticleStudioHeader({
  activeSession,
  onOpenSessionDrawer,
  onCreateNewSession,
  viewMode,
  setViewMode,
  isWide,
  onToggleWide,
}: ArticleStudioHeaderProps) {
  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
      <div className="flex items-center gap-2.5 sm:gap-3 flex-wrap">
        {/* BREADCRUMB MINIMAL */}
        <Link
          href="/studio"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-400 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Studio</span>
          <span className="text-slate-300 dark:text-slate-600">/</span>
          <span className="text-slate-700 dark:text-slate-200 font-extrabold">Artikel & Kajian</span>
        </Link>

        <div className="h-4 w-px bg-slate-200 dark:bg-slate-800 hidden sm:block" />

        {/* SESI CHAT AKTIF & QUICK SWITCH */}
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={onOpenSessionDrawer}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-bold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-blue-500 hover:text-blue-600 dark:hover:text-blue-400 shadow-2xs transition-all cursor-pointer"
            title="Klik untuk membuka riwayat sesi / ganti chat"
          >
            <MessageSquare className="h-3.5 w-3.5 text-indigo-500" />
            <span className="text-slate-400 text-[11px]">Sesi:</span>
            <span className="font-extrabold max-w-[180px] sm:max-w-[220px] truncate text-slate-900 dark:text-slate-100 text-[11px]">
              {activeSession?.title || 'Kajian Baru'}
            </span>
            <ChevronDown className="h-3 w-3 text-slate-400" />
          </button>

          <button
            type="button"
            onClick={onCreateNewSession}
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-black bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900/60 shadow-2xs transition-all cursor-pointer"
            title="Mulai sesi naskah baru yang bersih"
          >
            <Plus className="h-3.5 w-3.5" />
            <span className="text-[11px]">Baru</span>
          </button>
        </div>
      </div>

      {/* SWITCH VIEW MODE & LEBAR KANVAS */}
      <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap">
        <div className="flex items-center gap-1 bg-white dark:bg-slate-900 p-1 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <button
            type="button"
            onClick={() => setViewMode('DOCS')}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer",
              viewMode === 'DOCS'
                ? "bg-blue-600 text-white shadow-xs"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            )}
          >
            <Eye className="h-3.5 w-3.5" />
            <span>Pratinjau Dokumen (A4)</span>
          </button>
          <button
            type="button"
            onClick={() => setViewMode('EDIT')}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer",
              viewMode === 'EDIT'
                ? "bg-blue-600 text-white shadow-xs"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            )}
          >
            <Edit3 className="h-3.5 w-3.5" />
            <span>Sunting Naskah Langsung</span>
          </button>
        </div>

        {/* TOGGLE LEBAR KANVAS */}
        <button
          type="button"
          onClick={onToggleWide}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-blue-500 hover:text-blue-600 dark:hover:text-blue-400 shadow-xs transition-all cursor-pointer"
          title={isWide ? "Ubah ke Lebar Dokumen Standar" : "Perluas Kanvas (Layar Penuh)"}
        >
          {isWide ? (
            <>
              <Minimize2 className="h-3.5 w-3.5" />
              <span>Mode Standar</span>
            </>
          ) : (
            <>
              <Maximize2 className="h-3.5 w-3.5" />
              <span>Kanvas Luas</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}

