'use client';

import { Inbox, MessageSquare, ShieldCheck, Globe } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AspirasiTabSwitcherProps {
  activeTab: 'INBOX' | 'COMMENTS';
  onTabChange: (tab: 'INBOX' | 'COMMENTS') => void;
  inboxCount: number;
  commentsCount: number;
}

export function AspirasiTabSwitcher({
  activeTab,
  onTabChange,
  inboxCount,
  commentsCount,
}: AspirasiTabSwitcherProps) {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {/* Card Tab 1: Aduan & Aspirasi */}
      <button
        type="button"
        onClick={() => onTabChange('INBOX')}
        className={cn(
          'p-4 sm:p-5 rounded-2xl border text-left transition-all relative flex flex-col justify-between cursor-pointer',
          activeTab === 'INBOX'
            ? 'bg-primary/10 border-primary shadow-sm ring-2 ring-primary/20'
            : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 hover:bg-slate-50/60 dark:hover:bg-slate-800/40 shadow-2xs'
        )}
      >
        <div className="flex items-start justify-between gap-3 mb-2">
          <div className="flex items-center gap-2.5">
            <div
              className={cn(
                'h-9 w-9 rounded-xl flex items-center justify-center shrink-0 transition-colors',
                activeTab === 'INBOX'
                  ? 'bg-primary text-primary-foreground shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
              )}
            >
              <Inbox className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-white leading-tight">
                Aspirasi & Aduan Warga
              </h3>
              <span className="text-[11px] font-semibold text-primary flex items-center gap-1 mt-0.5">
                <ShieldCheck className="h-3 w-3" />
                <span>Privat & Rahasia (Tiket Konstituen)</span>
              </span>
            </div>
          </div>

          <span
            className={cn(
              'px-2.5 py-0.5 rounded-full text-xs font-black shrink-0',
              activeTab === 'INBOX'
                ? 'bg-primary text-primary-foreground shadow-xs'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
            )}
          >
            {inboxCount}
          </span>
        </div>

        <p className="text-xs text-slate-500 dark:text-slate-400 font-medium leading-relaxed">
          Pesan pribadi, permohonan bantuan, dan keluhan warga yang dikirim melalui formulir aspirasi. Dilengkapi nomor tiket dan tombol WhatsApp.
        </p>
      </button>

      {/* Card Tab 2: Moderasi Komentar */}
      <button
        type="button"
        onClick={() => onTabChange('COMMENTS')}
        className={cn(
          'p-4 sm:p-5 rounded-2xl border text-left transition-all relative flex flex-col justify-between cursor-pointer',
          activeTab === 'COMMENTS'
            ? 'bg-emerald-50/70 dark:bg-emerald-950/40 border-emerald-500 shadow-sm ring-2 ring-emerald-500/20'
            : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 hover:bg-slate-50/60 dark:hover:bg-slate-800/40 shadow-2xs'
        )}
      >
        <div className="flex items-start justify-between gap-3 mb-2">
          <div className="flex items-center gap-2.5">
            <div
              className={cn(
                'h-9 w-9 rounded-xl flex items-center justify-center shrink-0 transition-colors',
                activeTab === 'COMMENTS'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
              )}
            >
              <MessageSquare className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-white leading-tight">
                Moderasi Komentar Artikel
              </h3>
              <span className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-400 flex items-center gap-1 mt-0.5">
                <Globe className="h-3 w-3" />
                <span>Publik (Diskusi di Website)</span>
              </span>
            </div>
          </div>

          <span
            className={cn(
              'px-2.5 py-0.5 rounded-full text-xs font-black shrink-0',
              activeTab === 'COMMENTS'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
            )}
          >
            {commentsCount}
          </span>
        </div>

        <p className="text-xs text-slate-500 dark:text-slate-400 font-medium leading-relaxed">
          Tanggapan dan diskusi terbuka warga pada kolom komentar artikel atau berita dewan. Sembunyikan tanggapan negatif atau bersihkan spam.
        </p>
      </button>
    </div>
  );
}
