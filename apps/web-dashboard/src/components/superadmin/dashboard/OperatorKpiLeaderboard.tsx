'use client';

import React, { useEffect, useState } from 'react';
import {
  Award,
  Clock,
  MessageCircle,
  Star,
  FileText,
  Flame,
  CheckCircle2,
  RefreshCw,
  UserCheck,
} from 'lucide-react';
import { AdminApiClient } from '@/lib/api-client';
import { OperatorKpiSummaryItem } from '@/components/operator/types';

export function OperatorKpiLeaderboard() {
  const [kpis, setKpis] = useState<OperatorKpiSummaryItem[]>([]);
  const [loading, setLoading] = useState(true);

  const loadKpis = async () => {
    try {
      setLoading(true);
      const res = await AdminApiClient.request<OperatorKpiSummaryItem[]>('/whatsapp/kpi/operators');
      setKpis(Array.isArray(res) ? res : []);
    } catch (err) {
      console.error('Failed to load operator KPIs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadKpis();
  }, []);

  const formatSeconds = (sec: number) => {
    if (sec <= 0) return '—';
    if (sec < 60) return `${sec} detik`;
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}m ${s}s`;
  };

  return (
    <div className="bg-white dark:bg-[#0B0F19] rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
      <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
            <Award className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
              <span>Evaluasi Kinerja &amp; KPI Operator Redaksi</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
                SLA &amp; CSAT Scorecard
              </span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Penilaian First Response Time (FRT), kepuasan klien (CSAT), kecepatan produksi artikel (TAT), dan kepatuhan SLA.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={loadKpis}
          disabled={loading}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300 transition cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-amber-500' : ''}`} />
          <span>Segarkan Metrik</span>
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50/75 dark:bg-slate-900/50 border-b border-slate-200/80 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider text-[10px]">
            <tr>
              <th className="py-3 px-4">Operator Redaksi</th>
              <th className="py-3 px-3 text-center">Diskusi WA</th>
              <th className="py-3 px-3 text-center">Respon Pertama (FRT)</th>
              <th className="py-3 px-3 text-center">Kepuasan Klien (CSAT)</th>
              <th className="py-3 px-3 text-center">Artikel Ditangani</th>
              <th className="py-3 px-3 text-center">Rata-rata Terbit</th>
              <th className="py-3 px-4 text-center">Kepatuhan SLA Darurat</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-slate-700 dark:text-slate-300">
            {loading && kpis.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-8 text-center text-slate-400">
                  Memuat scorecard performa operator...
                </td>
              </tr>
            ) : kpis.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-8 text-center text-slate-400">
                  Belum ada data aktivitas operator yang tercatat.
                </td>
              </tr>
            ) : (
              kpis.map((op, idx) => (
                <tr
                  key={op.operatorId}
                  className="hover:bg-slate-50/60 dark:hover:bg-slate-900/40 transition"
                >
                  <td className="py-3.5 px-4 font-medium">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-black flex items-center justify-center text-xs shrink-0">
                        {op.operatorName.slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                          <span>{op.operatorName}</span>
                          {idx === 0 && (
                            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 font-black">
                              Top #1
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-slate-400">{op.operatorEmail}</div>
                      </div>
                    </div>
                  </td>

                  <td className="py-3.5 px-3 text-center">
                    <span className="font-bold text-slate-900 dark:text-white">
                      {op.totalChatsHandled}
                    </span>
                    {op.activeChatsCount > 0 && (
                      <span className="ml-1.5 text-[10px] px-1.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 font-black animate-pulse">
                        {op.activeChatsCount} aktif
                      </span>
                    )}
                  </td>

                  <td className="py-3.5 px-3 text-center">
                    <div className="font-bold text-slate-800 dark:text-slate-200 flex items-center justify-center gap-1">
                      <Clock className="w-3 h-3 text-slate-400" />
                      <span>{formatSeconds(op.avgFirstResponseSeconds)}</span>
                    </div>
                    {op.avgFirstResponseSeconds > 0 && op.avgFirstResponseSeconds <= 120 && (
                      <span className="text-[9px] text-emerald-600 dark:text-emerald-400 font-bold">
                        ⚡ Sangat Responsif (&lt;2m)
                      </span>
                    )}
                  </td>

                  <td className="py-3.5 px-3 text-center">
                    <div className="flex items-center justify-center gap-1.5">
                      <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                      <span className="font-black text-slate-900 dark:text-white">
                        {op.csatPercentage}%
                      </span>
                      <span className="text-[10px] text-slate-400">
                        ({op.csatPositiveCount}/{op.csatTotalRated})
                      </span>
                    </div>
                    <div className="w-20 mx-auto bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full mt-1 overflow-hidden">
                      <div
                        className="bg-emerald-500 h-full rounded-full"
                        style={{ width: `${op.csatPercentage}%` }}
                      />
                    </div>
                  </td>

                  <td className="py-3.5 px-3 text-center">
                    <div className="font-bold text-slate-900 dark:text-white">
                      {op.totalBriefsPublished} / {op.totalBriefsHandled}
                    </div>
                    <span className="text-[10px] text-slate-400">
                      {op.totalBriefsHandled > 0
                        ? `${Math.round((op.totalBriefsPublished / op.totalBriefsHandled) * 100)}% selesai`
                        : 'Belum ada'}
                    </span>
                  </td>

                  <td className="py-3.5 px-3 text-center">
                    <span className="font-bold text-slate-900 dark:text-white">
                      {op.avgHoursToPublish > 0 ? `${op.avgHoursToPublish} jam` : '—'}
                    </span>
                    <span className="block text-[10px] text-slate-400">
                      Rata-rata SLA terbit
                    </span>
                  </td>

                  <td className="py-3.5 px-4 text-center">
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-black ${
                        op.urgentSlaComplianceRate >= 90
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                          : op.urgentSlaComplianceRate >= 70
                          ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                          : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                      }`}
                    >
                      <CheckCircle2 className="w-3 h-3" />
                      <span>{op.urgentSlaComplianceRate}% SLA</span>
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
