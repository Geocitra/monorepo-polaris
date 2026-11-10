'use client';

import React from 'react';
import { Users, ShieldCheck, FileText, Cpu, Activity } from 'lucide-react';
import { DashboardStats } from '../types';

interface SuperadminKpiCardsProps {
  stats: DashboardStats | null;
  loading: boolean;
}

export function SuperadminKpiCards({ stats, loading }: SuperadminKpiCardsProps) {
  const tokenVal = stats?.totalTokens ?? 0;
  const tokenFormatted =
    tokenVal >= 1_000_000
      ? `${(tokenVal / 1_000_000).toFixed(2)}M`
      : tokenVal >= 1_000
      ? `${(tokenVal / 1_000).toFixed(1)}k`
      : `${tokenVal}`;

  const costIdrFormatted = (stats?.totalAiCostIdr ?? 0).toLocaleString('id-ID');

  const cards = [
    {
      label: 'Klien Dewan',
      value: stats?.totalTenants ?? 0,
      subtext: 'Anggota dewan binaan',
      icon: Users,
      colorClass: 'bg-blue-50 text-blue-600 dark:bg-blue-950/50 dark:text-blue-400',
    },
    {
      label: 'Lisensi Aktif',
      value: stats?.activeSubscriptions ?? 0,
      subtext: 'Langganan aktif berjalan',
      icon: ShieldCheck,
      colorClass: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400',
      valueColor: 'text-emerald-600 dark:text-emerald-400',
    },
    {
      label: 'Naskah AI Terbit',
      value: stats?.totalArticles ?? 0,
      subtext: 'Kajian & opini riil tayang',
      icon: FileText,
      colorClass: 'bg-indigo-50 text-indigo-600 dark:bg-indigo-950/50 dark:text-indigo-400',
    },
    {
      label: 'Konsumsi Token AI',
      value: `${tokenFormatted} tok`,
      subtext: `Biaya API: Rp ${costIdrFormatted}`,
      icon: Cpu,
      colorClass: 'bg-purple-50 text-purple-600 dark:bg-purple-950/50 dark:text-purple-400',
      valueColor: 'text-purple-600 dark:text-purple-400 font-mono text-xl sm:text-2xl',
    },
    {
      label: 'Infrastruktur SLA',
      value: '99.4%',
      subtext: 'SLA inferensi & redaksi prima',
      icon: Activity,
      colorClass: 'bg-teal-50 text-teal-600 dark:bg-teal-950/50 dark:text-teal-400',
      valueColor: 'text-teal-600 dark:text-teal-400',
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
