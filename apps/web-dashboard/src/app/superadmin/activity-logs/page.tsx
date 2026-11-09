'use client';

import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  ShieldCheck,
  Search,
  Filter,
  RotateCcw,
  Cpu,
  LogIn,
  LogOut,
  Clock,
  Sparkles,
  Bot,
  User,
  ChevronLeft,
  ChevronRight,
  X,
  ExternalLink,
  Calendar,
  Laptop,
  Globe,
  AlertTriangle,
  FileText,
  Wallet,
  Layers,
  Copy,
  Check,
  MessageSquare,
  ArrowRightLeft,
  RefreshCw,
  Image as ImageIcon,
} from 'lucide-react';
import { AdminApiClient } from '@/lib/api-client';

export default function SuperadminActivityLogsPage() {
  return (
    <React.Suspense
      fallback={
        <div className="py-20 text-center text-slate-400 text-xs">
          <div className="h-6 w-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
          <span>Memuat modul audit aktivitas dewan...</span>
        </div>
      }
    >
      <ActivityLogsContent />
    </React.Suspense>
  );
}

function ActivityLogsContent() {
  const searchParams = useSearchParams();
  const initialTenantId = searchParams.get('tenantId');

  // Filters state
  const [search, setSearch] = useState('');
  const [dapilId, setDapilId] = useState('ALL');
  const [party, setParty] = useState('ALL');
  const [commissionId, setCommissionId] = useState('ALL');
  const [page, setPage] = useState(1);

  // Data state
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Detail Modal / Drawer state
  const [selectedMemberId, setSelectedMemberId] = useState<string | null>(initialTenantId);
  const [detailAiData, setDetailAiData] = useState<any>(null);
  const [detailAuthData, setDetailAuthData] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'TRACES' | 'ACTIVITIES' | 'OPERATORS' | 'QUOTA_TX' | 'AUTH_LOGS'>('TRACES');
  const [detailLoading, setDetailLoading] = useState(false);

  // Filter di dalam Drawer Trace Log
  const [traceFilterActivity, setTraceFilterActivity] = useState('ALL');
  const [traceFilterChannel, setTraceFilterChannel] = useState('ALL');
  const [traceFilterProvider, setTraceFilterProvider] = useState('ALL');
  const [copiedTraceId, setCopiedTraceId] = useState<string | null>(null);

  useEffect(() => {
    loadMembers();
  }, [page, dapilId, party, commissionId]);

  useEffect(() => {
    if (selectedMemberId) {
      loadMemberDeepDetail(selectedMemberId);
    }
  }, [selectedMemberId]);

  const loadMembers = async () => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams({
        page: String(page),
        limit: '10',
        ...(search.trim() ? { search: search.trim() } : {}),
        ...(dapilId !== 'ALL' ? { dapilId } : {}),
        ...(party !== 'ALL' ? { party } : {}),
        ...(commissionId !== 'ALL' ? { commissionId } : {}),
      });

      const res = await AdminApiClient.request<any>(
        `/admin/members/activity-summary?${queryParams.toString()}`
      );
      setData(res);
    } catch (err) {
      console.error('Failed to load member activity summary:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadMemberDeepDetail = async (tenantId: string) => {
    try {
      setDetailLoading(true);
      const [aiDetail, authLogs] = await Promise.all([
        AdminApiClient.request<any>(`/admin/members/${tenantId}/ai-activity-detail`).catch(() => null),
        AdminApiClient.request<any>(`/admin/members/${tenantId}/activity-logs?limit=25`).catch(() => null),
      ]);
      setDetailAiData(aiDetail);
      setDetailAuthData(authLogs);
    } catch (err) {
      console.error('Failed to load member deep detail:', err);
    } finally {
      setDetailLoading(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    loadMembers();
  };

  const handleResetFilter = () => {
    setSearch('');
    setDapilId('ALL');
    setParty('ALL');
    setCommissionId('ALL');
    setPage(1);
  };

  const copyToClipboard = (text: string) => {
    if (navigator?.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedTraceId(text);
      setTimeout(() => setCopiedTraceId(null), 2000);
    }
  };

  const getActivityBadge = (type: string, category: string) => {
    switch (type) {
      case 'LOGIN':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-black uppercase bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60">
            <LogIn className="h-3 w-3" />
            <span>Login Berhasil</span>
          </span>
        );
      case 'LOGOUT':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-black uppercase bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
            <LogOut className="h-3 w-3" />
            <span>Logout</span>
          </span>
        );
      case 'PASSWORD_CHANGE':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-black uppercase bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border border-blue-200 dark:border-blue-800/60">
            <ShieldCheck className="h-3 w-3" />
            <span>Ubah Kata Sandi</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-black uppercase bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800/60">
            <Bot className="h-3 w-3" />
            <span>{type.replace(/_/g, ' ')}</span>
          </span>
        );
    }
  };

  // Filter traces
  const filteredTraces = (detailAiData?.recentTraces || []).filter((tr: any) => {
    if (traceFilterActivity !== 'ALL' && tr.activityType !== traceFilterActivity) return false;
    if (traceFilterChannel !== 'ALL' && tr.channel !== traceFilterChannel) return false;
    if (traceFilterProvider !== 'ALL' && tr.provider !== traceFilterProvider) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* 1. HEADER SECTION */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              Audit Rekonsiliasi & Log Aktivitas AI Anggota Dewan
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60">
              100% Rupiah (Rp)
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Audit telemetri presisi per dewan, per operator, per kegiatan, dan per request AI (terpisah OpenAI vs Google Gemini) serta rekonsiliasi kuota paket
          </p>
        </div>

        <div className="flex items-center gap-2">
          {data?.fxRateApplied && (
            <div className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 flex items-center gap-1.5 text-xs font-mono font-bold text-slate-700 dark:text-slate-300">
              <Globe className="h-3.5 w-3.5 text-emerald-500" />
              <span>Kurs Live: Rp {Number(data.fxRateApplied).toLocaleString('id-ID')} / USD</span>
            </div>
          )}
          <button
            onClick={() => loadMembers()}
            className="p-2 rounded-xl text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/60 transition-colors cursor-pointer"
            title="Muat ulang data"
          >
            <RefreshCw className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* 2. FILTER & PENCARIAN ANGGOTA */}
      <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#0B0F17] border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
        <form onSubmit={handleSearchSubmit} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          <div className="relative lg:col-span-2">
            <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari nama anggota dewan atau email..."
              className="w-full pl-9 pr-4 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:border-indigo-500"
            />
          </div>

          <div>
            <select
              value={dapilId}
              onChange={(e) => {
                setDapilId(e.target.value);
                setPage(1);
              }}
              className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 focus:outline-hidden focus:border-indigo-500 cursor-pointer"
            >
              <option value="ALL">Semua Dapil Pemilihan</option>
              {data?.filterOptions?.dapils?.map((d: any) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <select
              value={party}
              onChange={(e) => {
                setParty(e.target.value);
                setPage(1);
              }}
              className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 focus:outline-hidden focus:border-indigo-500 cursor-pointer"
            >
              <option value="ALL">Semua Partai / Fraksi</option>
              {data?.filterOptions?.parties?.map((p: any) => (
                <option key={p.id} value={p.name}>
                  {p.code} - {p.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="submit"
              className="flex-1 py-2 px-4 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-xs shadow-indigo-600/30 transition-all cursor-pointer flex items-center justify-center gap-1.5"
            >
              <Filter className="h-3.5 w-3.5" />
              <span>Terapkan</span>
            </button>
            <button
              type="button"
              onClick={handleResetFilter}
              className="p-2 rounded-xl text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer"
              title="Reset Filter"
            >
              <RotateCcw className="h-4 w-4" />
            </button>
          </div>
        </form>
      </div>

      {/* 3. TABEL UTAMA ANGGOTA DEWAN & REKAP AUDIT TOKEN */}
      <div className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-[#0B0F17] border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">
              Rekapitulasi Konsumsi AI & Sisa Kuota per Anggota Dewan
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Audit kuota paket tersisa, pemakaian OpenAI vs Google Gemini, dan total biaya riil dalam Rupiah
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs min-w-[960px]">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-bold uppercase text-[10px]">
                <th className="pb-3 px-3">Nama Anggota Dewan</th>
                <th className="pb-3 px-3">Paket & Sisa Kuota</th>
                <th className="pb-3 px-3">Pemakaian OpenAI (Rp)</th>
                <th className="pb-3 px-3">Pemakaian Gemini (Rp)</th>
                <th className="pb-3 px-3">Total Biaya (Rp)</th>
                <th className="pb-3 px-3">Aktivitas Terakhir</th>
                <th className="pb-3 px-3 text-right">Audit Detail</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400 text-xs">
                    <div className="h-5 w-5 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                    <span>Memuat data audit anggota dewan...</span>
                  </td>
                </tr>
              ) : data?.items?.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400 italic">
                    Tidak ada data anggota dewan yang cocok dengan filter pencarian.
                  </td>
                </tr>
              ) : (
                data?.items?.map((m: any) => (
                  <tr
                    key={m.id}
                    className="hover:bg-slate-50/80 dark:hover:bg-slate-800/30 transition-colors"
                  >
                    {/* Profil Anggota */}
                    <td className="py-3.5 px-3">
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-400 flex items-center justify-center font-black text-xs shrink-0">
                          {m.fullName.substring(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <div className="font-extrabold text-slate-900 dark:text-white">
                            {m.fullName}
                          </div>
                          <div className="text-[11px] text-slate-400">
                            {m.email} •{' '}
                            <span className="font-semibold text-slate-600 dark:text-slate-300">
                              {m.partyAffiliation}
                            </span>
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Kuota & Tier */}
                    <td className="py-3.5 px-3">
                      <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border border-blue-200 dark:border-blue-800/60">
                        {m.planTier}
                      </span>
                      <div className="flex items-center gap-1 text-[11px] font-bold text-slate-700 dark:text-slate-300 mt-1">
                        <Wallet className="h-3 w-3 text-emerald-500" />
                        <span>
                          Sisa {m.remainingQuota} / {m.totalQuotaAllocated} kuota
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-400 block mt-0.5">
                        Jatah: {m.weeklyAllowanceLimit} req/minggu
                      </span>
                    </td>

                    {/* OpenAI Breakdown */}
                    <td className="py-3.5 px-3">
                      <div className="font-mono font-black text-emerald-600 dark:text-emerald-400">
                        Rp {Math.round(Number(m.openaiCostIdr || 0)).toLocaleString('id-ID')}
                      </div>
                      <div className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">
                        {Number(m.openaiTotalTokens || 0).toLocaleString('id-ID')} tok •{' '}
                        {m.openaiImageCalls || 0} img
                      </div>
                    </td>

                    {/* Gemini Breakdown */}
                    <td className="py-3.5 px-3">
                      <div className="font-mono font-black text-indigo-600 dark:text-indigo-400">
                        Rp {Math.round(Number(m.geminiCostIdr || 0)).toLocaleString('id-ID')}
                      </div>
                      <div className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">
                        {Number(m.geminiTotalTokens || 0).toLocaleString('id-ID')} tok •{' '}
                        {m.geminiImageCalls || 0} img
                      </div>
                    </td>

                    {/* Total Combined IDR */}
                    <td className="py-3.5 px-3">
                      <div className="font-mono font-black text-slate-900 dark:text-white">
                        Rp {Math.round(Number(m.totalCostIdr || 0)).toLocaleString('id-ID')}
                      </div>
                      <div className="flex items-center gap-1 text-[10px] text-slate-400 font-mono">
                        <Cpu className="h-3 w-3 text-indigo-500" />
                        <span>
                          {Number(m.totalTokensUsed || 0).toLocaleString('id-ID')} total tok •{' '}
                          {m.totalAiCalls || 0} call
                        </span>
                      </div>
                    </td>

                    {/* Aktivitas Terakhir */}
                    <td className="py-3.5 px-3 text-[11px] text-slate-500 dark:text-slate-400">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="h-3 w-3 text-slate-400 shrink-0" />
                        <span>
                          {new Date(m.lastActivityAt || m.createdAt).toLocaleDateString('id-ID', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-400 block mt-0.5">
                        {m.totalLogins || 0} kali login
                      </span>
                    </td>

                    {/* Action: Lihat Detail */}
                    <td className="py-3.5 px-3 text-right">
                      <button
                        onClick={() => setSelectedMemberId(m.id)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-xs shadow-indigo-600/30 transition-all cursor-pointer"
                      >
                        <ShieldCheck className="h-3.5 w-3.5" />
                        <span>Audit Detail</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* PAGINATION */}
        {data?.pagination && data.pagination.totalPages > 1 && (
          <div className="pt-4 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              Menampilkan halaman <strong>{data.pagination.page}</strong> dari{' '}
              <strong>{data.pagination.totalPages}</strong> ({data.pagination.totalItems} dewan)
            </span>
            <div className="flex items-center gap-1.5">
              <button
                disabled={data.pagination.page <= 1}
                onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                className="p-2 rounded-xl text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30 disabled:pointer-events-none transition-colors"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <span className="px-3 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-black text-slate-700 dark:text-slate-200">
                {data.pagination.page}
              </span>
              <button
                disabled={data.pagination.page >= data.pagination.totalPages}
                onClick={() => setPage((prev) => prev + 1)}
                className="p-2 rounded-xl text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30 disabled:pointer-events-none transition-colors"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 4. MODAL DRAWER DEEP AUDIT & REKONSILIASI PER ANGGOTA DEWAN */}
      {selectedMemberId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/75 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="w-full max-w-5xl bg-white dark:bg-[#0E131F] rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[94vh]">
            {/* Header Member Profile */}
            <div className="p-5 sm:p-6 border-b border-slate-100 dark:border-slate-800/80 flex items-start justify-between gap-4">
              <div className="flex items-center gap-3.5">
                <div className="h-12 w-12 rounded-2xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-400 flex items-center justify-center font-black text-base shrink-0 shadow-xs">
                  {detailAiData?.member?.fullName
                    ? detailAiData.member.fullName.substring(0, 2).toUpperCase()
                    : <User className="h-6 w-6" />}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
                      {detailAiData?.member?.fullName || 'Memuat profil dewan...'}
                    </h3>
                    {detailAiData?.member?.partyAffiliation && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800/60">
                        {detailAiData.member.partyAffiliation}
                      </span>
                    )}
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border border-blue-200 dark:border-blue-800/60">
                      Tier {detailAiData?.member?.planTier || 'PRO'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    {detailAiData?.member?.email} • {detailAiData?.member?.dapilName || 'Dapil Belum Ditentukan'} • {detailAiData?.member?.commissionName || 'Komisi Belum Ditentukan'}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setSelectedMemberId(null)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Quick KPI Badges: 4 Vault Cards (100% Rupiah) */}
            <div className="px-5 py-3 sm:px-6 bg-slate-50/60 dark:bg-slate-900/40 border-b border-slate-100 dark:border-slate-800/80 grid grid-cols-2 lg:grid-cols-4 gap-3">
              {/* Saldo Kuota */}
              <div className="p-3 rounded-xl bg-white dark:bg-[#0B0F17] border border-slate-200/80 dark:border-slate-800">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block flex items-center gap-1">
                  <Wallet className="h-3 w-3 text-emerald-500" />
                  Saldo Kuota Paket
                </span>
                <div className="text-lg font-black text-slate-900 dark:text-white tracking-tight mt-0.5 font-mono">
                  {detailAiData?.quota?.remainingQuota ?? 0} / {detailAiData?.quota?.totalQuotaAllocated ?? 12}
                </div>
                <span className="text-[10px] text-slate-500 font-semibold block">
                  Minggu Ini: {detailAiData?.quota?.weeklyUsed ?? 0} / {detailAiData?.quota?.weeklyAllowanceLimit ?? 3} req
                </span>
              </div>

              {/* Vault OpenAI */}
              <div className="p-3 rounded-xl bg-white dark:bg-[#0B0F17] border border-slate-200/80 dark:border-slate-800">
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 block flex items-center gap-1">
                  <Cpu className="h-3 w-3" />
                  Vault OpenAI (Rp)
                </span>
                <div className="text-lg font-black text-emerald-600 dark:text-emerald-400 tracking-tight mt-0.5 font-mono">
                  Rp {Math.round(detailAiData?.providerBreakdown?.openai?.costIdr || 0).toLocaleString('id-ID')}
                </div>
                <span className="text-[10px] text-slate-400 font-mono block">
                  {(detailAiData?.providerBreakdown?.openai?.totalTokens || 0).toLocaleString('id-ID')} tok • {detailAiData?.providerBreakdown?.openai?.imageCalls || 0} DALL-E
                </span>
              </div>

              {/* Vault Google Gemini */}
              <div className="p-3 rounded-xl bg-white dark:bg-[#0B0F17] border border-slate-200/80 dark:border-slate-800">
                <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 block flex items-center gap-1">
                  <Sparkles className="h-3 w-3" />
                  Vault Gemini (Rp)
                </span>
                <div className="text-lg font-black text-indigo-600 dark:text-indigo-400 tracking-tight mt-0.5 font-mono">
                  Rp {Math.round(detailAiData?.providerBreakdown?.gemini?.costIdr || 0).toLocaleString('id-ID')}
                </div>
                <span className="text-[10px] text-slate-400 font-mono block">
                  {(detailAiData?.providerBreakdown?.gemini?.totalTokens || 0).toLocaleString('id-ID')} tok • {detailAiData?.providerBreakdown?.gemini?.imageCalls || 0} Imagen
                </span>
              </div>

              {/* Total Combined IDR */}
              <div className="p-3 rounded-xl bg-white dark:bg-[#0B0F17] border border-slate-200/80 dark:border-slate-800">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                  Total Biaya Beban AI
                </span>
                <div className="text-lg font-black text-slate-900 dark:text-white tracking-tight mt-0.5 font-mono">
                  Rp {Math.round(detailAiData?.providerBreakdown?.totalCostIdr || 0).toLocaleString('id-ID')}
                </div>
                <span className="text-[10px] text-emerald-500 font-semibold block">
                  Status Akun: {detailAiData?.member?.accountStatus || 'ACTIVE'}
                </span>
              </div>
            </div>

            {/* TAB SELECTOR */}
            <div className="px-5 py-2.5 sm:px-6 border-b border-slate-100 dark:border-slate-800 flex items-center gap-2 overflow-x-auto">
              {[
                { id: 'TRACES', label: `Log AI per Request (${detailAiData?.recentTraces?.length || 0})` },
                { id: 'ACTIVITIES', label: 'Rincian per Kegiatan' },
                { id: 'OPERATORS', label: 'Rincian per Operator' },
                { id: 'QUOTA_TX', label: `Rekonsiliasi Kuota (${detailAiData?.recentTransactions?.length || 0})` },
                { id: 'AUTH_LOGS', label: 'Log Akun & Keamanan' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* TAB CONTENT AREA */}
            <div className="p-5 sm:p-6 overflow-y-auto space-y-3 flex-1">
              {detailLoading ? (
                <div className="py-16 text-center text-slate-400 text-xs">
                  <div className="h-5 w-5 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                  <span>Memuat audit rincian anggota...</span>
                </div>
              ) : activeTab === 'TRACES' ? (
                // TAB 1: LOG AI PER REQUEST & CHATBOT
                <div className="space-y-3">
                  {/* Filter Sub-bar */}
                  <div className="flex flex-wrap items-center gap-2 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 text-xs">
                    <span className="text-[11px] font-bold text-slate-500">Filter Trace:</span>
                    <select
                      value={traceFilterActivity}
                      onChange={(e) => setTraceFilterActivity(e.target.value)}
                      className="px-2 py-1 rounded-lg text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300"
                    >
                      <option value="ALL">Semua Kegiatan</option>
                      <option value="STUDIO_ARTICLE_GENERATION">Naskah Artikel (GPT-4o)</option>
                      <option value="STUDIO_INFOGRAPHIC_GENERATION">Infografis & Poster (Imagen 3)</option>
                      <option value="POSTER_REVISION">Revisi Poster (Gemini Flash)</option>
                      <option value="VISION_CRITIC">Vision Critic Audit</option>
                      <option value="AUTONOMOUS_RESEARCH">Riset Otonom</option>
                      <option value="WHATSAPP_BOT_BRIEF">Chat Bot WhatsApp</option>
                      <option value="PUBLIC_CHAT_CONCIERGE">Chat Bot Web Publik</option>
                      <option value="CIVIC_ASSISTANT_QUERY">Chat Bot Tanya Dewan</option>
                    </select>

                    <select
                      value={traceFilterChannel}
                      onChange={(e) => setTraceFilterChannel(e.target.value)}
                      className="px-2 py-1 rounded-lg text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300"
                    >
                      <option value="ALL">Semua Saluran</option>
                      <option value="WEB_STUDIO">Web Studio</option>
                      <option value="WHATSAPP">WhatsApp Bot</option>
                      <option value="PUBLIC_CHAT">Public Web Chat</option>
                      <option value="CIVIC_ASSISTANT">Civic Assistant</option>
                    </select>

                    <select
                      value={traceFilterProvider}
                      onChange={(e) => setTraceFilterProvider(e.target.value)}
                      className="px-2 py-1 rounded-lg text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300"
                    >
                      <option value="ALL">Semua Provider</option>
                      <option value="OPENAI">OpenAI</option>
                      <option value="GEMINI">Google Gemini</option>
                    </select>
                  </div>

                  {filteredTraces.length === 0 ? (
                    <div className="py-12 text-center text-slate-400 text-xs italic">
                      Tidak ada rekaman log AI per request yang cocok dengan filter.
                    </div>
                  ) : (
                    filteredTraces.map((tr: any) => {
                      const isOpenAi = tr.provider === 'OPENAI';
                      return (
                        <div
                          key={tr.id}
                          className="p-3.5 sm:p-4 rounded-2xl bg-slate-50/70 dark:bg-slate-900/50 border border-slate-200/80 dark:border-slate-800 space-y-2.5 hover:border-indigo-500/40 transition-colors"
                        >
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                            <div className="flex flex-wrap items-center gap-2">
                              {/* Provider Badge */}
                              <span
                                className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase ${
                                  isOpenAi
                                    ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                                    : 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800'
                                }`}
                              >
                                {tr.provider}
                              </span>

                              {/* Channel Badge */}
                              <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                                {tr.channel}
                              </span>

                              {/* Activity Label */}
                              <span className="text-xs font-black text-slate-900 dark:text-white">
                                {tr.activityType || tr.operation}
                              </span>

                              {/* Model Pill */}
                              <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-semibold bg-purple-50 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
                                {tr.model}
                              </span>
                            </div>

                            {/* Biaya Riil Rupiah */}
                            <div className="text-right">
                              <span className="font-mono font-black text-xs sm:text-sm text-slate-900 dark:text-white">
                                Rp {Math.round(Number(tr.costIdr || 0)).toLocaleString('id-ID')}
                              </span>
                            </div>
                          </div>

                          {/* Operator & Execution Metadata */}
                          <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400">
                            {tr.operatorName ? (
                              <span className="font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                                <User className="h-3 w-3 text-indigo-500" />
                                Operator: {tr.operatorName}
                              </span>
                            ) : (
                              <span className="italic">Self-Service (Dewan Langsung)</span>
                            )}

                            <span>•</span>

                            <span className="flex items-center gap-1 font-mono text-[10px]">
                              <span>Trace: {tr.traceId.slice(0, 16)}...</span>
                              <button
                                onClick={() => copyToClipboard(tr.traceId)}
                                className="p-0.5 hover:text-slate-900 dark:hover:text-white cursor-pointer"
                                title="Salin Trace ID"
                              >
                                {copiedTraceId === tr.traceId ? (
                                  <Check className="h-2.5 w-2.5 text-emerald-500" />
                                ) : (
                                  <Copy className="h-2.5 w-2.5" />
                                )}
                              </button>
                            </span>

                            {tr.requestId && (
                              <>
                                <span>•</span>
                                <span className="font-mono text-[10px]">ReqID: {tr.requestId.slice(0, 14)}...</span>
                              </>
                            )}

                            <span>•</span>
                            <span className="flex items-center gap-1">
                              <Clock className="h-2.5 w-2.5" />
                              {tr.latencyMs}ms
                            </span>

                            <span>•</span>
                            <span>
                              {new Date(tr.createdAt).toLocaleDateString('id-ID', {
                                day: 'numeric',
                                month: 'short',
                                hour: '2-digit',
                                minute: '2-digit',
                                second: '2-digit',
                              })}
                            </span>
                          </div>

                          {/* Token Breakdown Pill */}
                          <div className="flex flex-wrap items-center gap-2 pt-1">
                            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300">
                              Total Token: {Number(tr.totalTokens).toLocaleString('id-ID')} ({tr.inputTokens} in / {tr.outputTokens} out)
                            </span>
                            {tr.imageCalls > 0 && (
                              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 flex items-center gap-1">
                                <ImageIcon className="h-3 w-3" />
                                <span>{tr.imageCalls} Image Call (Flat Rate)</span>
                              </span>
                            )}
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                                tr.status === 'SUCCESS'
                                  ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'
                                  : 'bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300'
                              }`}
                            >
                              {tr.status}
                            </span>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              ) : activeTab === 'ACTIVITIES' ? (
                // TAB 2: RINCIAN PER KEGIATAN (FEATURE BREAKDOWN)
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs min-w-[700px]">
                    <thead>
                      <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-bold uppercase text-[10px]">
                        <th className="pb-3 px-3">Kegiatan / Fitur AI</th>
                        <th className="pb-3 px-3">Frekuensi Panggilan</th>
                        <th className="pb-3 px-3">Token OpenAI</th>
                        <th className="pb-3 px-3">Token Gemini</th>
                        <th className="pb-3 px-3">Panggilan Gambar</th>
                        <th className="pb-3 px-3 text-right">Biaya Total (Rp)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                      {detailAiData?.activityBreakdown?.map((act: any) => (
                        <tr key={act.activityType} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/30">
                          <td className="py-3 px-3">
                            <div className="font-extrabold text-slate-900 dark:text-white">{act.label}</div>
                            <div className="text-[10px] text-slate-400 font-mono">{act.activityType}</div>
                          </td>
                          <td className="py-3 px-3 font-mono font-bold text-slate-700 dark:text-slate-300">
                            {act.totalCalls} kali
                          </td>
                          <td className="py-3 px-3 font-mono text-emerald-600 dark:text-emerald-400">
                            {Number(act.openaiTokens).toLocaleString('id-ID')}
                          </td>
                          <td className="py-3 px-3 font-mono text-indigo-600 dark:text-indigo-400">
                            {Number(act.geminiTokens).toLocaleString('id-ID')}
                          </td>
                          <td className="py-3 px-3 font-mono text-slate-600 dark:text-slate-300">
                            {act.imageCalls} visual
                          </td>
                          <td className="py-3 px-3 text-right font-mono font-black text-slate-900 dark:text-white">
                            Rp {Math.round(Number(act.totalCostIdr)).toLocaleString('id-ID')}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : activeTab === 'OPERATORS' ? (
                // TAB 3: RINCIAN PER OPERATOR
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs min-w-[600px]">
                    <thead>
                      <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-bold uppercase text-[10px]">
                        <th className="pb-3 px-3">Operator / Pemicu Generasi</th>
                        <th className="pb-3 px-3">Total Request Dieksekusi</th>
                        <th className="pb-3 px-3 text-right">Beban Biaya AI (Rp)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                      {detailAiData?.operatorBreakdown?.map((op: any, idx: number) => (
                        <tr key={idx} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/30">
                          <td className="py-3 px-3">
                            <div className="font-extrabold text-slate-900 dark:text-white flex items-center gap-1.5">
                              <User className="h-3.5 w-3.5 text-indigo-500" />
                              <span>{op.operatorName}</span>
                            </div>
                            {op.operatorId && (
                              <div className="text-[10px] text-slate-400 font-mono">ID: {op.operatorId}</div>
                            )}
                          </td>
                          <td className="py-3 px-3 font-mono font-bold text-slate-700 dark:text-slate-300">
                            {op.totalRequests} request
                          </td>
                          <td className="py-3 px-3 text-right font-mono font-black text-emerald-600 dark:text-emerald-400">
                            Rp {Math.round(Number(op.costIdr)).toLocaleString('id-ID')}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : activeTab === 'QUOTA_TX' ? (
                // TAB 4: REKONSILIASI TRANSAKSI KUOTA
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs min-w-[700px]">
                    <thead>
                      <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-bold uppercase text-[10px]">
                        <th className="pb-3 px-3">Waktu Transaksi</th>
                        <th className="pb-3 px-3">Jenis Transaksi</th>
                        <th className="pb-3 px-3">Saluran & Kegiatan</th>
                        <th className="pb-3 px-3">Mutasi Kuota</th>
                        <th className="pb-3 px-3">Saldo Setelah</th>
                        <th className="pb-3 px-3">Catatan / Keterangan</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                      {detailAiData?.recentTransactions?.map((tx: any) => {
                        const isDeduct = tx.amountDelta < 0;
                        return (
                          <tr key={tx.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/30">
                            <td className="py-3 px-3 text-[11px] text-slate-500 dark:text-slate-400">
                              {new Date(tx.createdAt).toLocaleDateString('id-ID', {
                                day: 'numeric',
                                month: 'short',
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </td>
                            <td className="py-3 px-3">
                              <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                                {tx.transactionType.replace(/_/g, ' ')}
                              </span>
                            </td>
                            <td className="py-3 px-3">
                              <span className="font-bold text-slate-800 dark:text-slate-200 block">
                                {tx.channel}
                              </span>
                              <span className="text-[10px] text-slate-400 block">{tx.activityType || '-'}</span>
                            </td>
                            <td className="py-3 px-3 font-mono font-black">
                              <span className={isDeduct ? 'text-rose-600' : 'text-emerald-600'}>
                                {tx.amountDelta > 0 ? `+${tx.amountDelta}` : tx.amountDelta}
                              </span>
                            </td>
                            <td className="py-3 px-3 font-mono font-black text-slate-900 dark:text-white">
                              {tx.balanceAfter} kuota
                            </td>
                            <td className="py-3 px-3 text-[11px] text-slate-500 max-w-xs truncate">
                              {tx.notes || '-'}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              ) : (
                // TAB 5: LOG AUTENTIKASI & AKUN
                <div className="space-y-2">
                  {detailAuthData?.items?.length === 0 ? (
                    <div className="py-12 text-center text-slate-400 text-xs italic">
                      Belum ada rekaman log autentikasi tercatat.
                    </div>
                  ) : (
                    detailAuthData?.items?.map((log: any) => (
                      <div
                        key={log.id}
                        className="p-3.5 rounded-xl bg-slate-50/70 dark:bg-slate-900/50 border border-slate-200/80 dark:border-slate-800 flex items-center justify-between gap-3 text-xs"
                      >
                        <div className="flex items-center gap-2">
                          {getActivityBadge(log.activityType, log.category)}
                          <span className="font-extrabold text-slate-900 dark:text-white">
                            {log.description}
                          </span>
                        </div>
                        <span className="text-[11px] text-slate-400 font-medium">
                          {new Date(log.createdAt).toLocaleDateString('id-ID', {
                            day: 'numeric',
                            month: 'short',
                            hour: '2-digit',
                            minute: '2-digit',
                            second: '2-digit',
                          })}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs text-slate-500">
              <span>Rekonsiliasi AI & Aktivitas Dewan • Polaris Governance Framework</span>
              <button
                onClick={() => setSelectedMemberId(null)}
                className="px-4 py-1.5 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 transition-colors cursor-pointer"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
