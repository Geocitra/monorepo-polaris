'use client';

import Link from 'next/link';
import Image from 'next/image';
import { ArrowUpRight, AlertCircle, Sparkles, ChevronRight } from 'lucide-react';
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
    <div className="relative rounded-3xl overflow-hidden border border-slate-200/90 dark:border-slate-800/80 bg-white dark:bg-gradient-to-br dark:from-[#121622] dark:via-[#0E121B] dark:to-[#0A0D14] shadow-lg dark:shadow-2xl p-5 sm:p-6 flex flex-col justify-between flex-1 min-h-[210px] group transition-all duration-300">
      {/* ─── AMBIENT GLOW ACCENT ─── */}
      <div
        className="absolute bottom-0 right-0 w-36 h-36 rounded-full pointer-events-none opacity-10 dark:opacity-20 blur-2xl"
        style={{ background: '#F59E0B' }}
      />

      <div className="flex items-center justify-between relative z-10 gap-3">
        {/* LEFT STATS SECTION */}
        <div className="space-y-1.5 flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
              Isu Prioritas Perlu Perhatian
            </span>
            <span className="flex items-center gap-0.5 text-[10px] font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200/60 dark:border-transparent px-1.5 py-0.5 rounded-md">
              ▲ +14%
            </span>
          </div>

          {/* Mini Sparkline Curve */}
          <div className="w-24 h-4">
            <svg viewBox="0 0 100 24" className="w-full h-full" fill="none">
              <path
                d="M 2,18 C 20,20 40,5 60,12 C 80,18 95,4 98,2"
                stroke="#10B981"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          </div>

          <div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
                {topIssue.frequency || 42}
              </span>
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Laporan &amp; Keluhan Masuk</span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium truncate mt-0.5">
              {topIssue.location}
            </p>
          </div>
        </div>

        {/* RIGHT VISUAL CARD SHOWCASE */}
        <Link
          href={`/studio?topic=${encodeURIComponent(topIssue.title)}`}
          className="w-32 sm:w-36 h-[145px] rounded-2xl overflow-hidden border border-slate-200/90 bg-slate-50 hover:bg-slate-100/90 shadow-sm flex flex-col justify-between p-2 transition-all duration-300 hover:border-slate-300 hover:scale-[1.02] shrink-0 group/card relative dark:border-slate-700/80 dark:bg-slate-900/90 dark:hover:border-slate-500 dark:shadow-xl"
        >
          {/* Card Media Preview */}
          <div className="relative w-full h-18 rounded-xl overflow-hidden bg-slate-200 dark:bg-slate-950 flex items-center justify-center">
            <Image
              src="/images/showcase-artikel-pertanian.jpg"
              alt={topIssue.title}
              fill
              sizes="140px"
              className="object-cover opacity-90 group-hover/card:opacity-100 transition-opacity"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent opacity-80" />
            <span
              className="absolute top-1 right-1 text-[8px] font-black uppercase px-1.5 py-0.5 rounded-md text-white shadow-sm"
              style={{ backgroundColor: colors.primary }}
            >
              Urgensi Tinggi
            </span>
          </div>

          {/* Card Info & CTA */}
          <div className="space-y-0.5">
            <h5 className="text-[10px] font-extrabold text-slate-900 dark:text-white truncate leading-tight">
              {topIssue.title}
            </h5>
            <div className="flex items-center justify-between text-[10px] text-blue-600 dark:text-blue-400 font-bold pt-0.5">
              <span>Bikin Kajian AI</span>
              <ChevronRight className="h-3 w-3 transition-transform group-hover/card:translate-x-0.5" />
            </div>
          </div>
        </Link>
      </div>
    </div>
  );
}
