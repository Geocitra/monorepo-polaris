'use client';

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import {
  X,
  BarChart3,
  MessageSquare,
  Table2,
  Scale,
  Sparkles,
  CalendarClock,
  Loader2,
  Building2,
} from 'lucide-react';
import type { InstitutionalMyUsageDto } from '@polaris/shared-types';
import { ApiClient } from '@/lib/api-client';

interface MyQuotaUsageModalProps {
  isOpen: boolean;
  onClose: () => void;
  organizationId: string;
}

export function MyQuotaUsageModal({
  isOpen,
  onClose,
  organizationId,
}: MyQuotaUsageModalProps) {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<InstitutionalMyUsageDto | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen || !organizationId) return;
    let cancelled = false;
    setLoading(true);
    setError(null);
    ApiClient.request<InstitutionalMyUsageDto>(`/institutional/orgs/${organizationId}/my-usage`)
      .then((res) => {
        if (!cancelled) setData(res);
      })
      .catch((err: any) => {
        if (!cancelled) setError(err?.message || 'Gagal memuat detail kuota pribadi.');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [isOpen, organizationId]);

  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (ev: KeyboardEvent) => {
      if (ev.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || typeof document === 'undefined') return null;

  const featureCards = data?.quota.byFeature
    ? [
      {
        key: 'chat',
        label: 'Chat Koordinator & Infografis',
        desc: 'Tanya jawab, analisis bidang, artikel & visual',
        icon: MessageSquare,
        color: 'indigo',
        used: data.quota.byFeature.COORDINATOR_CHAT.weeklyUsed,
        limit: data.quota.byFeature.COORDINATOR_CHAT.weeklyLimit,
        remaining: data.quota.byFeature.COORDINATOR_CHAT.remainingWeekly,
      },
      {
        key: 'lkpj',
        label: 'Evaluasi LKPJ',
        desc: 'Audit serapan anggaran & sikap fraksi',
        icon: Table2,
        color: 'emerald',
        used: data.quota.byFeature.LKPJ_EVALUATION.weeklyUsed,
        limit: data.quota.byFeature.LKPJ_EVALUATION.weeklyLimit,
        remaining: data.quota.byFeature.LKPJ_EVALUATION.remainingWeekly,
      },
      {
        key: 'leg',
        label: 'Telaah Legislasi',
        desc: 'Uji kepatuhan Raperda & matriks DIM',
        icon: Scale,
        color: 'amber',
        used: data.quota.byFeature.LEGISLATION.weeklyUsed,
        limit: data.quota.byFeature.LEGISLATION.weeklyLimit,
        remaining: data.quota.byFeature.LEGISLATION.remainingWeekly,
      },
    ]
    : [];

  return createPortal(
    <div
      className="fixed inset-0 z-[100] bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        className="w-full max-w-3xl rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0D1322] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-200 dark:border-slate-800 flex items-start justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 text-indigo-600 dark:text-indigo-400">
              <BarChart3 className="h-5 w-5" />
              <h2 className="text-lg font-black text-slate-900 dark:text-white">
                Kuota &amp; Pemakaian AI Saya
              </h2>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Rincian sisa jatah mingguan dan statistik pemakaian AI pribadi Anda (terisolasi per akun).
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="h-9 w-9 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer shrink-0"
            title="Tutup"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          {loading ? (
            <div className="py-12 flex flex-col items-center justify-center gap-3 text-slate-400 text-xs font-semibold">
              <Loader2 className="h-6 w-6 animate-spin text-indigo-500" />
              <span>Memuat rincian kuota dan pemakaian AI Anda...</span>
            </div>
          ) : error ? (
            <div className="rounded-2xl border border-rose-200 dark:border-rose-900/50 bg-rose-50/70 dark:bg-rose-950/30 p-5 text-xs font-semibold text-rose-600 dark:text-rose-300">
              {error}
            </div>
          ) : data ? (
            <>
              {/* Periode Info */}
              <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 text-xs">
                <span className="inline-flex items-center gap-2 font-bold text-slate-700 dark:text-slate-200">
                  <CalendarClock className="h-4 w-4 text-indigo-500" />
                  <span>Periode Mingguan Aktif: {data.quota.weeklyPeriodKey}</span>
                </span>
                <span className="text-[11px] text-slate-500 dark:text-slate-400">
                  Reset otomatis tiap Senin 00:00 WIB &bull; Maks. {data.quota.revisionLimitPerItem}x revisi/dokumen
                </span>
              </div>

              {/* 3 Feature Quota Cards */}
              <div className="space-y-2.5">
                <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-400">
                  Sisa Kuota Mingguan per Fitur
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
                  {featureCards.map((fc) => {
                    const Icon = fc.icon;
                    const pct = fc.limit > 0 ? Math.min(100, Math.round((fc.used / fc.limit) * 100)) : 0;
                    const barColor =
                      fc.color === 'emerald'
                        ? 'bg-emerald-500'
                        : fc.color === 'amber'
                          ? 'bg-amber-500'
                          : 'bg-indigo-600';
                    return (
                      <div
                        key={fc.key}
                        className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/40 space-y-3"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="space-y-0.5">
                            <div className="text-xs font-extrabold text-slate-900 dark:text-white flex items-center gap-1.5">
                              <Icon className="h-4 w-4 text-indigo-500 shrink-0" />
                              <span>{fc.label}</span>
                            </div>
                            <p className="text-[11px] text-slate-500 dark:text-slate-400">
                              {fc.desc}
                            </p>
                          </div>
                        </div>

                        <div className="space-y-1.5">
                          <div className="flex items-baseline justify-between">
                            <span className="text-2xl font-black text-slate-900 dark:text-white font-mono">
                              {fc.remaining}
                              <span className="text-xs font-bold text-slate-400">/{fc.limit}</span>
                            </span>
                            <span className="text-[11px] font-semibold text-slate-500">
                              Terpakai {fc.used}x
                            </span>
                          </div>
                          <div className="h-2 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all ${barColor}`}
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Monthly Personal Summary */}
              <div className="space-y-2.5">
                <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-400">
                  Statistik Pemakaian AI Pribadi ({data.billingCycleMonth})
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                  <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-900/40">
                    <div className="text-[11px] font-bold text-slate-500">Total Permintaan Bulan Ini</div>
                    <div className="text-2xl font-black text-slate-900 dark:text-white mt-1 font-mono">
                      {data.monthlySummary.totalRequests.toLocaleString('id-ID')}
                    </div>
                  </div>
                  <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-900/40">
                    <div className="text-[11px] font-bold text-slate-500">Total Token Terpakai</div>
                    <div className="text-2xl font-black text-slate-900 dark:text-white mt-1 font-mono">
                      {data.monthlySummary.totalTokensConsumed.toLocaleString('id-ID')}
                    </div>
                  </div>
                  <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-900/40">
                    <div className="text-[11px] font-bold text-slate-500">Generate &amp; Revisi</div>
                    <div className="text-lg font-black text-slate-900 dark:text-white mt-1.5 font-mono">
                      {data.monthlySummary.generateRequests} gen &bull; {data.monthlySummary.revisionRequests} rev
                    </div>
                  </div>
                </div>
              </div>

              {/* By Unit Breakdown */}
              {data.byUnit.length > 0 && (
                <div className="space-y-2.5">
                  <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-400">
                    Rincian per Bidang Anda
                  </h3>
                  <div className="rounded-2xl border border-slate-200 dark:border-slate-800 divide-y divide-slate-100 dark:divide-slate-800 overflow-hidden">
                    {data.byUnit.map((u, idx) => (
                      <div
                        key={`${u.unitId || 'general'}_${idx}`}
                        className="px-4 py-3 flex items-center justify-between gap-4 bg-white dark:bg-slate-900/30 text-xs"
                      >
                        <span className="flex items-center gap-2 font-bold text-slate-800 dark:text-slate-100">
                          <Building2 className="h-4 w-4 text-indigo-500 shrink-0" />
                          <span>{u.unitName}</span>
                        </span>
                        <span className="font-mono text-slate-600 dark:text-slate-300">
                          {u.totalRequests} req &bull; {u.totalTokensConsumed.toLocaleString('id-ID')} token
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex items-center gap-2 text-[11px] text-slate-400 pt-1">
                <Sparkles className="h-3.5 w-3.5 text-indigo-400 shrink-0" />
                <span>
                  Permintaan yang gagal sebelum selesai otomatis mengembalikan kuota Anda. Butuh tambahan kuota? Hubungi Admin Instansi.
                </span>
              </div>
            </>
          ) : null}
        </div>
      </div>
    </div>,
    document.body
  );
}
