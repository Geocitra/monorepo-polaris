'use client';

import { useState, useEffect } from 'react';
import { ApiClient } from '@/lib/api-client';
import { useToast } from '@/components/ui/toast';
import { BarChart3, Cpu, Coins, Users, Layers, RotateCcw, AlertTriangle } from 'lucide-react';
import type { InstitutionalUsageAnalyticsDto } from '@polaris/shared-types';
import { getOrgRoleLabel } from './institutional-labels';

interface InstitutionalUsageAnalyticsPanelProps {
  organizationId: string;
}

const UNIT_TYPE_LABELS: Record<string, string> = {
  COMMISSION: 'Komisi',
  FRACTION: 'Fraksi',
  COMMITTEE: 'Panja / Pansus',
  BUDGET_BODY: 'Banggar',
  LEGISLATION_BODY: 'Bapemperda',
  SECRETARIAT: 'Sekretariat',
  SUB_UNIT: 'Bidang / Sub-Unit',
  ORG_GENERAL: 'Umum Instansi',
};

export function InstitutionalUsageAnalyticsPanel({
  organizationId,
}: InstitutionalUsageAnalyticsPanelProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [resettingTenantId, setResettingTenantId] = useState<string | null>(null);
  const [usageAnalytics, setUsageAnalytics] =
    useState<InstitutionalUsageAnalyticsDto | null>(null);

  useEffect(() => {
    if (organizationId) {
      loadUsage();
    }
  }, [organizationId]);

  async function loadUsage() {
    setLoading(true);
    try {
      const res = await ApiClient.request<InstitutionalUsageAnalyticsDto>(
        `/institutions/${organizationId}/admin/usage-analytics`
      );
      setUsageAnalytics(res);
    } catch (err: any) {
      toast({
        title: 'Gagal Memuat Pantauan AI',
        description: err?.message || 'Tidak dapat memuat statistik pemakaian AI.',
        type: 'error',
      });
    } finally {
      setLoading(false);
    }
  }

  async function handleResetMemberQuota(tenantId: string, fullName: string) {
    setResettingTenantId(tenantId);
    try {
      await ApiClient.request(
        `/institutions/${organizationId}/admin/members/${tenantId}/reset-quota`,
        { method: 'POST' }
      );
      toast({
        title: 'Kuota Mingguan Direset',
        description: `Kuota AI minggu ini untuk ${fullName} berhasil dikembalikan ke penuh.`,
        type: 'success',
      });
      await loadUsage();
    } catch (err: any) {
      toast({
        title: 'Gagal Reset Kuota',
        description: err?.message || 'Tidak dapat mereset kuota anggota.',
        type: 'error',
      });
    } finally {
      setResettingTenantId(null);
    }
  }

  if (loading) {
    return (
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0D1322] p-8 text-center text-xs text-slate-500">
        Memuat ringkasan pemakaian AI Instansi...
      </div>
    );
  }

  if (!usageAnalytics) {
    return (
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0D1322] p-8 text-center text-xs text-slate-500">
        Belum ada data pemakaian AI yang tercatat untuk instansi ini.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 0. BANNER & PROGRESS POOL TOKEN TAHUNAN KONTRAK B2G */}
      {usageAnalytics.tokenPoolAlert && (
        <div
          className={`rounded-2xl border p-4 space-y-2.5 ${
            usageAnalytics.tokenPoolAlert.alertLevel === 'EXCEEDED' ||
            usageAnalytics.tokenPoolAlert.alertLevel === 'CRITICAL_95'
              ? 'border-rose-300 bg-rose-50/80 dark:border-rose-800 dark:bg-rose-950/30'
              : usageAnalytics.tokenPoolAlert.alertLevel === 'WARNING_80'
                ? 'border-amber-300 bg-amber-50/80 dark:border-amber-800 dark:bg-amber-950/30'
                : 'border-slate-200 bg-white dark:border-slate-800 dark:bg-[#0D1322]'
          }`}
        >
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2 text-xs font-black text-slate-900 dark:text-white">
              {usageAnalytics.tokenPoolAlert.alertLevel !== 'NORMAL' && (
                <AlertTriangle
                  className={`h-4 w-4 ${
                    usageAnalytics.tokenPoolAlert.alertLevel === 'WARNING_80'
                      ? 'text-amber-600'
                      : 'text-rose-600'
                  }`}
                />
              )}
              <span>
                Kapasitas Pool Token Tahunan{' '}
                {usageAnalytics.tokenPoolAlert.contractNumber
                  ? `(${usageAnalytics.tokenPoolAlert.contractNumber})`
                  : ''}
              </span>
            </div>
            <div className="text-xs font-bold text-slate-700 dark:text-slate-200">
              {usageAnalytics.tokenPoolAlert.tokensConsumed.toLocaleString('id-ID')} /{' '}
              {usageAnalytics.tokenPoolAlert.annualTokenPoolLimit.toLocaleString('id-ID')} token (
              {usageAnalytics.tokenPoolAlert.usagePercentage}%)
            </div>
          </div>
          <div className="w-full h-2 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
            <div
              className={`h-full transition-all ${
                usageAnalytics.tokenPoolAlert.alertLevel === 'EXCEEDED' ||
                usageAnalytics.tokenPoolAlert.alertLevel === 'CRITICAL_95'
                  ? 'bg-rose-600'
                  : usageAnalytics.tokenPoolAlert.alertLevel === 'WARNING_80'
                    ? 'bg-amber-500'
                    : 'bg-indigo-600'
              }`}
              style={{ width: `${Math.min(100, usageAnalytics.tokenPoolAlert.usagePercentage)}%` }}
            />
          </div>
          {usageAnalytics.tokenPoolAlert.message && (
            <p
              className={`text-xs font-semibold ${
                usageAnalytics.tokenPoolAlert.alertLevel === 'WARNING_80'
                  ? 'text-amber-800 dark:text-amber-200'
                  : 'text-rose-800 dark:text-rose-200'
              }`}
            >
              {usageAnalytics.tokenPoolAlert.message}
            </p>
          )}
        </div>
      )}

      {/* 1. KARTU KPI RINGKAS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0D1322] p-5 space-y-1">
          <div className="text-[11px] font-bold text-slate-500 flex items-center gap-1.5">
            <BarChart3 className="h-3.5 w-3.5 text-indigo-500" />
            Total Permintaan AI ({usageAnalytics.billingCycleMonth})
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white">
            {usageAnalytics.totals.totalRequests}
          </div>
          <div className="text-[11px] text-slate-500">
            {usageAnalytics.totals.generateRequests} generate &bull;{' '}
            {usageAnalytics.totals.revisionRequests} revisi
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0D1322] p-5 space-y-1">
          <div className="text-[11px] font-bold text-slate-500 flex items-center gap-1.5">
            <Cpu className="h-3.5 w-3.5 text-indigo-500" />
            Total Token Terpakai
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white">
            {usageAnalytics.totals.totalTokensConsumed.toLocaleString('id-ID')}
          </div>
          <div className="text-[11px] text-slate-500">Agregasi otomatis dari seluruh Bidang</div>
        </div>

        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0D1322] p-5 space-y-1">
          <div className="text-[11px] font-bold text-slate-500 flex items-center gap-1.5">
            <Coins className="h-3.5 w-3.5 text-emerald-500" />
            Estimasi Biaya AI
          </div>
          <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
            Rp {usageAnalytics.totals.totalCostIdr.toLocaleString('id-ID')}
          </div>
          <div className="text-[11px] text-slate-500">Periode bulan berjalan</div>
        </div>

        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0D1322] p-5 space-y-1">
          <div className="text-[11px] font-bold text-slate-500 flex items-center gap-1.5">
            <Users className="h-3.5 w-3.5 text-amber-500" />
            Anggota Aktif Tercatat
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white">
            {usageAnalytics.byMember.length}
          </div>
          <div className="text-[11px] text-slate-500">
            Minggu aktif: {usageAnalytics.weeklyPeriodKey}
          </div>
        </div>
      </div>

      {/* 2. TABEL PEMAKAIAN PER BIDANG / UNIT */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0D1322] p-6 space-y-4">
        <h3 className="text-base font-black flex items-center gap-2">
          <Layers className="h-4 w-4 text-indigo-500" />
          Agregat Pemakaian AI per Bidang / Unit ({usageAnalytics.byUnit.length})
        </h3>
        {usageAnalytics.byUnit.length === 0 ? (
          <p className="text-xs text-slate-500">
            Belum ada pemakaian AI di bidang mana pun bulan ini.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-[11px] text-slate-500 uppercase">
                  <th className="py-2.5 px-3 font-extrabold">Bidang / Unit</th>
                  <th className="py-2.5 px-3 font-extrabold">Jenis</th>
                  <th className="py-2.5 px-3 font-extrabold text-right">Generate</th>
                  <th className="py-2.5 px-3 font-extrabold text-right">Revisi</th>
                  <th className="py-2.5 px-3 font-extrabold text-right">Token</th>
                  <th className="py-2.5 px-3 font-extrabold text-right">Estimasi Biaya</th>
                </tr>
              </thead>
              <tbody>
                {usageAnalytics.byUnit.map((u) => (
                  <tr
                    key={u.unitId || u.unitCode}
                    className="border-b border-slate-100 dark:border-slate-800/60 last:border-0"
                  >
                    <td className="py-3 px-3 font-bold text-slate-900 dark:text-white">
                      {u.unitName}
                    </td>
                    <td className="py-3 px-3 text-slate-500">
                      {UNIT_TYPE_LABELS[u.unitType] || u.unitType}
                    </td>
                    <td className="py-3 px-3 text-right font-semibold">{u.generateRequests}</td>
                    <td className="py-3 px-3 text-right font-semibold">{u.revisionRequests}</td>
                    <td className="py-3 px-3 text-right font-bold">
                      {u.totalTokensConsumed.toLocaleString('id-ID')}
                    </td>
                    <td className="py-3 px-3 text-right font-bold text-emerald-600 dark:text-emerald-400">
                      Rp {u.totalCostIdr.toLocaleString('id-ID')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* 3. TABEL PEMAKAIAN & KUOTA MINGGUAN PER ANGGOTA */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0D1322] p-6 space-y-4">
        <h3 className="text-base font-black flex items-center gap-2">
          <Users className="h-4 w-4 text-indigo-500" />
          Pemakaian &amp; Kuota Mingguan per Anggota ({usageAnalytics.byMember.length})
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 text-[11px] text-slate-500 uppercase">
                <th className="py-2.5 px-3 font-extrabold">Nama Anggota</th>
                <th className="py-2.5 px-3 font-extrabold">Peran Instansi</th>
                <th className="py-2.5 px-3 font-extrabold">Kuota Minggu Ini</th>
                <th className="py-2.5 px-3 font-extrabold text-right">Generate / Revisi</th>
                <th className="py-2.5 px-3 font-extrabold text-right">Total Token</th>
                <th className="py-2.5 px-3 font-extrabold text-right">Estimasi Biaya</th>
                <th className="py-2.5 px-3 font-extrabold text-right">Aksi Admin</th>
              </tr>
            </thead>
            <tbody>
              {usageAnalytics.byMember.map((m) => {
                const pct = m.weeklyLimit > 0 ? Math.min(100, Math.round((m.weeklyUsed / m.weeklyLimit) * 100)) : 0;
                return (
                  <tr
                    key={m.tenantId}
                    className="border-b border-slate-100 dark:border-slate-800/60 last:border-0"
                  >
                    <td className="py-3 px-3">
                      <div className="font-bold text-slate-900 dark:text-white">{m.fullName}</div>
                      <div className="text-[11px] text-slate-400">{m.email}</div>
                    </td>
                    <td className="py-3 px-3 text-slate-600 dark:text-slate-300">
                      {getOrgRoleLabel(m.orgRole)}
                    </td>
                    <td className="py-3 px-3 min-w-[200px]">
                      {m.orgRole === 'ORG_ADMIN' && m.hasAssignedUnits === false ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                          Admin Sistem (Non-AI)
                        </span>
                      ) : m.byFeature ? (
                        <div className="space-y-1 text-[11px]">
                          <div className="flex items-center justify-between">
                            <span className="text-slate-500">Chat POLARIS:</span>
                            <span className="font-bold">
                              {m.byFeature.COORDINATOR_CHAT.weeklyUsed}/
                              {m.byFeature.COORDINATOR_CHAT.weeklyLimit}
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-slate-500">Evaluasi LKPJ:</span>
                            <span className="font-bold">
                              {m.byFeature.LKPJ_EVALUATION.weeklyUsed}/
                              {m.byFeature.LKPJ_EVALUATION.weeklyLimit}
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-slate-500">Legislasi:</span>
                            <span className="font-bold">
                              {m.byFeature.LEGISLATION.weeklyUsed}/
                              {m.byFeature.LEGISLATION.weeklyLimit}
                            </span>
                          </div>
                        </div>
                      ) : (
                        <>
                          <div className="flex items-center justify-between text-[11px] font-bold mb-1">
                            <span>
                              {m.weeklyUsed} / {m.weeklyLimit}
                            </span>
                            <span className="text-slate-400">{pct}%</span>
                          </div>
                          <div className="h-1.5 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                            <div
                              className={`h-full rounded-full ${
                                pct >= 100 ? 'bg-rose-500' : 'bg-indigo-600'
                              }`}
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                        </>
                      )}
                    </td>
                    <td className="py-3 px-3 text-right font-semibold">
                      {m.generateRequests} gen / {m.revisionRequests} rev
                    </td>
                    <td className="py-3 px-3 text-right font-bold">
                      {m.totalTokensConsumed.toLocaleString('id-ID')}
                    </td>
                    <td className="py-3 px-3 text-right font-bold text-emerald-600 dark:text-emerald-400">
                      Rp {m.totalCostIdr.toLocaleString('id-ID')}
                    </td>
                    <td className="py-3 px-3 text-right">
                      {m.orgRole === 'ORG_ADMIN' && m.hasAssignedUnits === false ? (
                        <span className="text-[11px] text-slate-400">&mdash;</span>
                      ) : (
                        <button
                          type="button"
                          disabled={resettingTenantId === m.tenantId}
                          onClick={() => handleResetMemberQuota(m.tenantId, m.fullName)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border border-indigo-200 dark:border-indigo-800 bg-indigo-50/70 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 text-[11px] font-bold hover:bg-indigo-100 disabled:opacity-50 cursor-pointer"
                        >
                          <RotateCcw className="h-3 w-3" />
                          {resettingTenantId === m.tenantId ? 'Mereset...' : 'Reset Kuota'}
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
