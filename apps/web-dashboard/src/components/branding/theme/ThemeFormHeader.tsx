'use client';

import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
  Lock,
  Palette,
  Layout,
  User,
  Globe,
  Layers,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { FormSectionTab } from './types';

interface ThemeFormHeaderProps {
  isUnpaid: boolean;
  primaryColor: string;
  secondaryColor: string;
  activeTemplateName: string;
  activeTab: FormSectionTab;
  onSelectTab: (tab: FormSectionTab) => void;
}

export function ThemeFormHeader({
  isUnpaid,
  primaryColor,
  secondaryColor,
  activeTemplateName,
  activeTab,
  onSelectTab,
}: ThemeFormHeaderProps) {
  return (
    <div className="space-y-4">
      {/* ─── BANNER UNPAID ─── */}
      {isUnpaid && (
        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-900 dark:text-amber-200 space-y-2">
          <div className="flex items-center gap-2">
            <Lock className="h-4 w-4 text-amber-600 dark:text-amber-400 shrink-0" />
            <span className="font-extrabold text-xs">Mode Pratinjau (Simpan Tema Terkunci)</span>
          </div>
          <p className="text-[11px] text-amber-700 dark:text-amber-300 leading-relaxed">
            Eksplorasi kombinasi warna dan tata letak dapat disimulasikan secara real-time pada simulator di samping. Selesaikan aktivasi lisensi untuk menyinkronkan tema ke website publik resmi.
          </p>
          <Link href="/billing" className="block pt-1">
            <Button size="sm" className="w-full bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs gap-1.5 shadow-sm">
              <Lock className="h-3.5 w-3.5" />
              <span>Aktifkan Lisensi Akun</span>
            </Button>
          </Link>
        </div>
      )}

      {/* ─── TOP STUDIO QUICK STATUS & ACTION BAR ─── */}
      <div className="flex items-center gap-2.5 p-3 bg-slate-50/80 dark:bg-slate-900/60 rounded-2xl border border-slate-200/80 dark:border-slate-800">
        <div className="flex items-center -space-x-1 shrink-0">
          <span
            className="w-4 h-4 rounded-full border border-white dark:border-slate-800 shadow-2xs"
            style={{ backgroundColor: primaryColor }}
            title={`Aksen: ${primaryColor}`}
          />
          <span
            className="w-4 h-4 rounded-full border border-white dark:border-slate-800 shadow-2xs"
            style={{ backgroundColor: secondaryColor }}
            title={`Header: ${secondaryColor}`}
          />
        </div>
        <div className="min-w-0">
          <span className="text-[10px] text-slate-400 uppercase font-bold block leading-none">
            Template Terpilih
          </span>
          <span className="text-xs font-bold text-slate-800 dark:text-slate-100 truncate block mt-0.5">
            {activeTemplateName}
          </span>
        </div>
      </div>

      {/* ─── STUDIO SECTION SUB-TABS (CLEAN SEGMENTED GRID - NO HORIZONTAL SCROLLBAR) ─── */}
      <div className="grid grid-cols-4 sm:grid-cols-5 gap-1 p-1 bg-slate-100 dark:bg-slate-800/80 rounded-xl">
        <button
          type="button"
          onClick={() => onSelectTab('colors')}
          className={cn(
            'flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-1.5 py-2 px-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer text-center',
            activeTab === 'colors'
              ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs'
              : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          )}
        >
          <Palette className="w-3.5 h-3.5 shrink-0" />
          <span className="truncate">Warna</span>
        </button>

        <button
          type="button"
          onClick={() => onSelectTab('templates')}
          className={cn(
            'flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-1.5 py-2 px-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer text-center',
            activeTab === 'templates'
              ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
              : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          )}
        >
          <Layout className="w-3.5 h-3.5 shrink-0" />
          <span className="truncate">Layout</span>
        </button>

        <button
          type="button"
          onClick={() => onSelectTab('profile')}
          className={cn(
            'flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-1.5 py-2 px-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer text-center',
            activeTab === 'profile'
              ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-xs'
              : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          )}
        >
          <User className="w-3.5 h-3.5 shrink-0" />
          <span className="truncate">Profil</span>
        </button>

        <button
          type="button"
          onClick={() => onSelectTab('domain')}
          className={cn(
            'flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-1.5 py-2 px-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer text-center',
            activeTab === 'domain'
              ? 'bg-white dark:bg-slate-900 text-violet-600 dark:text-violet-400 shadow-xs'
              : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          )}
        >
          <Globe className="w-3.5 h-3.5 shrink-0" />
          <span className="truncate">Domain</span>
        </button>

        <button
          type="button"
          onClick={() => onSelectTab('all')}
          className={cn(
            'hidden sm:flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-1.5 py-2 px-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer text-center',
            activeTab === 'all'
              ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
              : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
          )}
          title="Tampilkan semua pengaturan sekaligus"
        >
          <Layers className="w-3.5 h-3.5 shrink-0" />
          <span className="truncate">Semua</span>
        </button>
      </div>
    </div>
  );
}

