'use client';

import Link from 'next/link';
import { Sparkles, ArrowRight, AlertTriangle, TrendingUp, MapPin } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';

interface PriorityIssue {
  id: string | number;
  title: string;
  location: string;
  status: string;
  impact?: string;
  frequency?: number;
  description: string;
}

interface PriorityFocusCardProps {
  priorityIssues?: PriorityIssue[];
}

export function PriorityFocusCard({ priorityIssues = [] }: PriorityFocusCardProps) {
  const { colors } = useTheme();

  const topIssue = priorityIssues[0] || {
    id: 'default-issue',
    title: 'Kelangkaan Pupuk Bersubsidi & Irigasi',
    location: 'Kab. Bandung & Sumedang',
    status: '18 Perlu Tindak Lanjut',
    frequency: 42,
    description: 'Petani mengeluhkan keterlambatan distribusi pupuk jelang musim tanam.',
  };

  return (
    <div className="relative rounded-3xl overflow-hidden border border-slate-200/90 dark:border-slate-800/80 bg-white dark:bg-gradient-to-br dark:from-[#121622] dark:via-[#0E121B] dark:to-[#0A0D14] shadow-lg dark:shadow-2xl p-5 sm:p-6 flex flex-col justify-between flex-1 min-h-[220px] group transition-all duration-300">
      {/* ─── AMBIENT GLOW ACCENT ─── */}
      <div
        className="absolute bottom-0 right-0 w-44 h-44 rounded-full pointer-events-none opacity-10 dark:opacity-20 blur-3xl"
        style={{ background: '#F59E0B' }}
      />

      {/* ─── CARD HEADER ─── */}
      <div className="flex items-center justify-between relative z-10 gap-2">
        <div className="flex items-center gap-2">
          <span className="flex h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
          <span className="text-xs font-bold text-slate-800 dark:text-slate-200 tracking-tight">
            Isu Prioritas Dapil
          </span>
          <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
            Urgensi Tinggi
          </span>
        </div>

        <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200/60 dark:border-transparent px-2 py-0.5 rounded-md">
          <TrendingUp className="h-3 w-3" />
          <span>+14% minggu ini</span>
        </span>
      </div>

      {/* ─── MAIN ISSUE CONTENT ─── */}
      <div className="space-y-2 py-2 relative z-10">
        <h4 className="text-sm sm:text-base font-black text-slate-900 dark:text-white leading-snug line-clamp-2 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
          {topIssue.title}
        </h4>

        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500 dark:text-slate-400">
          <div className="flex items-center gap-1 font-bold text-slate-700 dark:text-slate-300">
            <span className="text-sm font-black text-slate-900 dark:text-white">
              {topIssue.frequency || 42}
            </span>
            <span>Laporan Warga</span>
          </div>
          <span>•</span>
          <div className="flex items-center gap-1 truncate">
            <MapPin className="h-3 w-3 text-slate-400 shrink-0" />
            <span className="truncate font-medium">{topIssue.location}</span>
          </div>
        </div>

        <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed bg-slate-50 dark:bg-slate-900/60 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800/80">
          {topIssue.description}
        </p>
      </div>

      {/* ─── ACTION BUTTON ─── */}
      <div className="relative z-10 pt-1">
        <Link
          href={`/studio?topic=${encodeURIComponent(topIssue.title)}`}
          className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-slate-900 text-white dark:bg-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-100 transition-all font-bold text-xs shadow-md group/btn"
        >
          <span className="flex items-center gap-2">
            <Sparkles className="h-3.5 w-3.5 text-amber-400 dark:text-amber-600" />
            <span>Buat Kajian AI tentang Isu Ini</span>
          </span>
          <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover/btn:translate-x-1" />
        </Link>
      </div>
    </div>
  );
}
