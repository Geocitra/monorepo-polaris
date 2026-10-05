'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Database, Users } from 'lucide-react';
import { AdminApiClient } from '@/lib/api-client';
import { DashboardStats, RecentTenant } from '@/components/superadmin/types';
import { SuperadminKpiCards } from '@/components/superadmin/dashboard/SuperadminKpiCards';
import { SuperadminLaunchpad } from '@/components/superadmin/dashboard/SuperadminLaunchpad';
import { RecentTenantsTable } from '@/components/superadmin/dashboard/RecentTenantsTable';

export default function SuperadminDashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentTenants, setRecentTenants] = useState<RecentTenant[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const res = await AdminApiClient.request<{
        stats: DashboardStats;
        recentTenants: RecentTenant[];
      }>('/admin/dashboard/stats');
      setStats(res.stats);
      setRecentTenants(res.recentTenants);
    } catch (err) {
      console.error('Failed to load superadmin stats:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyToggle = async (tenantId: string, currentVerified: boolean) => {
    try {
      await AdminApiClient.request(`/admin/tenants/${tenantId}/verify`, {
        method: 'POST',
        body: JSON.stringify({ isVerified: !currentVerified }),
      });
      loadDashboardData();
    } catch (err: any) {
      alert(err.message || 'Gagal mengubah status verifikasi.');
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. HEADER SECTION */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800/80 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              Control Tower & Observabilitas Platform
            </h1>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60">
              Live Production
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Monitoring agregat pengguna legislatif, lisensi aktif, beban AI, dan master data keparlemenan se-Indonesia.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/superadmin/master-data"
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold border border-slate-200 dark:border-slate-700 transition-all shadow-xs"
          >
            <Database className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
            <span>Kelola Master Data</span>
          </Link>

          <Link
            href="/superadmin/tenants"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-xs shadow-blue-600/30"
          >
            <Users className="h-3.5 w-3.5" />
            <span>Daftar Klien Dewan</span>
          </Link>
        </div>
      </div>

      {/* 2. MODULAR KPI CARDS */}
      <SuperadminKpiCards stats={stats} loading={loading} />

      {/* 3. MODULAR QUICK OPERATIONS LAUNCHPAD */}
      <SuperadminLaunchpad />

      {/* 4. MODULAR RECENT CLIENTS TABLE */}
      <RecentTenantsTable
        tenants={recentTenants}
        onVerifyToggle={handleVerifyToggle}
      />
    </div>
  );
}
