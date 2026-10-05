'use client';

import React from 'react';
import { Users, ShieldCheck, FileText, MessageSquare, Database } from 'lucide-react';
import { DashboardStats } from '../types';

interface SuperadminKpiCardsProps {
  stats: DashboardStats | null;
  loading: boolean;
}

export function SuperadminKpiCards({ stats, loading }: SuperadminKpiCardsProps) {
  const cards = [
    {
      label: 'Klien Dewan',
      value: stats?.totalTenants ?? 0,
      subtext: 'Anggota terdaftar',
      icon: Users,
      colorClass: 'bg-blue-50 text-blue-600 dark:bg-blue-950/50 dark:text-blue-400',
    },
    {
      label: 'Lisensi Aktif',
      value: stats?.activeSubscriptions ?? 0,
      subtext: 'Akses tak terbatas',
      icon: ShieldCheck,
      colorClass: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400',
      valueColor: 'text-emerald-600 dark:text-emerald-400',
    },
    {
      label: 'Naskah AI Terbit',
      value: stats?.totalArticles ?? 0,
      subtext: 'Tayang di portal publik',
      icon: FileText,
      colorClass: 'bg-indigo-50 text-indigo-600 dark:bg-indigo-950/50 dark:text-indigo-400',
    },
    {
      label: 'Aspirasi Warga',
      value: stats?.totalFeedbacks ?? 0,
      subtext: 'Kanal aspirasi konstituen',
      icon: MessageSquare,
      colorClass: 'bg-violet-50 text-violet-600 dark:bg-violet-950/50 dark:text-violet-400',
    },
    {
      label: 'Partai Terdaftar',
      value: stats?.totalParties ?? 0,
      subtext: 'Peserta pemilu sah',
      icon: Database,
      colorClass: 'bg-amber-50 text-amber-600 dark:bg-amber-950/50 dark:text-amber-400',
      valueColor: 'text-amber-600 dark:text-amber-400',
      colSpan: 'col-span-2 lg:col-span-1',
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
      {cards.map((c) => {
        const Icon = c.icon;
        return (
          <div
            key={c.label}
            className={`p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#0B0F17] border border-slate-200 dark:border-slate-800 shadow-xs space-y-2 transition-all ${c.colSpan || ''}`}
          >
            <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
              <span className="text-[10px] font-bold uppercase tracking-wider">{c.label}</span>
              <div className={`h-7 w-7 rounded-lg ${c.colorClass} flex items-center justify-center`}>
                <Icon className="h-3.5 w-3.5" />
              </div>
            </div>
            <div className={`text-2xl sm:text-3xl font-black tracking-tight ${c.valueColor || 'text-slate-900 dark:text-white'}`}>
              {loading ? '...' : c.value}
            </div>
            <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium block">
              {c.subtext}
            </span>
          </div>
        );
      })}
    </div>
  );
}
