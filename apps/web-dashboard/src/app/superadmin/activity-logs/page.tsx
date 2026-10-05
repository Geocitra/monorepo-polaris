'use client';

import React, { useEffect, useState, useTransition } from 'react';
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
  DollarSign,
  AlertTriangle,
  FileText,
} from 'lucide-react';
import { AdminApiClient } from '@/lib/api-client';

export default function SuperadminActivityLogsPage() {
  return (
    <React.Suspense fallback={
      <div className="py-20 text-center text-slate-400 text-xs">
        <div className="h-6 w-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
        <span>Memuat modul audit aktivitas dewan...</span>
      </div>
    }>
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
  const [detailData, setDetailData] = useState<any>(null);
  const [detailCategory, setDetailCategory] = useState('ALL');
  const [detailPage, setDetailPage] = useState(1);
  const [detailLoading, setDetailLoading] = useState(false);

  useEffect(() => {
    loadMembers();
  }, [page, dapilId, party, commissionId]);

  useEffect(() => {
    if (selectedMemberId) {
      loadMemberLogs(selectedMemberId, detailCategory, detailPage);
    }
  }, [selectedMemberId, detailCategory, detailPage]);

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

      const res = await AdminApiClient.request<any>(`/admin/members/activity-summary?${queryParams.toString()}`);
      setData(res);
    } catch (err) {
      console.error('Failed to load member activity summary:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadMemberLogs = async (tenantId: string, category: string, p: number) => {
    try {
      setDetailLoading(true);
      const queryParams = new URLSearchParams({
        page: String(p),
        limit: '15',
        ...(category !== 'ALL' ? { category } : {}),
      });

      const res = await AdminApiClient.request<any>(`/admin/members/${tenantId}/activity-logs?${queryParams.toString()}`);
      setDetailData(res);
    } catch (err) {
      console.error('Failed to load member activity logs:', err);
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
            <span>Logout Manual</span>
          </span>
        );
      case 'SESSION_TIMEOUT':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-black uppercase bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-200 dark:border-amber-800/60">
            <Clock className="h-3 w-3" />
            <span>Sesi Berakhir</span>
          </span>
        );
      case 'AI_GENERATION':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-black uppercase bg-purple-50 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300 border border-purple-200 dark:border-purple-800/60">
            <Sparkles className="h-3 w-3" />
            <span>AI Generation</span>
          </span>
        );
      case 'AI_CHAT':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-black uppercase bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border border-blue-200 dark:border-blue-800/60">
            <Bot className="h-3 w-3" />
            <span>Asisten AI</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-black uppercase bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
            <span>{type}</span>
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. HEADER */}
      <div className="border-b border-slate-200 dark:border-slate-800 pb-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-400 flex items-center justify-center font-black">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              Audit Aktivitas & Penggunaan AI Token Anggota
            </h1>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Log audit terperinci per anggota dewan: riwayat autentikasi (login/logout/timeout), eksekusi AI Agent, jumlah token digunakan, dan estimasi biaya riil.
          </p>
        </div>
      </div>

      {/* 2. FILTER & SEARCH BAR */}
      <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#0B0F17] border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
        <form onSubmit={handleSearchSubmit} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3">
          {/* Search Box */}
          <div className="lg:col-span-4 relative">
            <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari nama anggota dewan / email..."
              className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Filter Dapil */}
          <div className="lg:col-span-3">
            <select
              value={dapilId}
              onChange={(e) => {
                setDapilId(e.target.value);
                setPage(1);
              }}
              className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="ALL">Semua Daerah Pemilihan (Dapil)</option>
              {data?.filterOptions?.dapils?.map((d: any) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </select>
          </div>

          {/* Filter Fraksi (Partai) */}
          <div className="lg:col-span-2">
            <select
              value={party}
              onChange={(e) => {
                setParty(e.target.value);
                setPage(1);
              }}
              className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="ALL">Semua Fraksi</option>
              {data?.filterOptions?.parties?.map((p: any) => (
                <option key={p.id} value={p.name}>
                  {p.code} - {p.name}
                </option>
              ))}
            </select>
          </div>

          {/* Filter Komisi */}
          <div className="lg:col-span-2">
            <select
              value={commissionId}
              onChange={(e) => {
                setCommissionId(e.target.value);
                setPage(1);
              }}
              className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="ALL">Semua Komisi</option>
              {data?.filterOptions?.commissions?.map((c: any) => (
                <option key={c.id} value={c.id}>
                  {c.code} - {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Reset Action */}
          <div className="lg:col-span-1 flex items-center">
            <button
              type="button"
              onClick={handleResetFilter}
              className="w-full py-2.5 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 text-xs font-bold transition-colors flex items-center justify-center gap-1 cursor-pointer"
              title="Reset Filter"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span className="sm:hidden lg:inline">Reset</span>
            </button>
          </div>
        </form>
      </div>

      {/* 3. TABEL ANGGOTA DEWAN & PEMAKAIAN AI TOKEN */}
      <div className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-[#0B0F17] border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider">
            Daftar Anggota Dewan & Ringkasan Konsumsi Token
          </h2>
          <span className="text-xs text-slate-400 font-semibold">
            Total {data?.pagination?.totalItems || 0} Anggota Terdata
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 text-[10px] font-black uppercase text-slate-400 tracking-wider">
                <th className="py-3 px-3">Anggota Dewan</th>
                <th className="py-3 px-3">Fraksi & Partai</th>
                <th className="py-3 px-3">Dapil & Komisi</th>
                <th className="py-3 px-3">Total Token Dipakai</th>
                <th className="py-3 px-3">Estimasi Biaya API</th>
                <th className="py-3 px-3">Aktivitas Terakhir</th>
                <th className="py-3 px-3 text-right">Audit Log</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400 text-xs">
                    <div className="flex items-center justify-center gap-2">
                      <div className="h-4 w-4 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                      <span>Memuat data anggota dewan...</span>
                    </div>
                  </td>
                </tr>
              ) : data?.items?.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400 text-xs italic">
                    Tidak ditemukan data anggota dewan yang sesuai dengan filter.
                  </td>
                </tr>
              ) : (
                data?.items?.map((m: any) => (
                  <tr key={m.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/30 transition-colors">
                    {/* Nama & Email */}
                    <td className="py-3.5 px-3">
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-xl bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-400 flex items-center justify-center font-black text-xs shrink-0">
                          {m.fullName ? m.fullName.substring(0, 2).toUpperCase() : 'DW'}
                        </div>
                        <div>
                          <div className="font-extrabold text-slate-900 dark:text-white leading-tight">
                            {m.fullName}
                          </div>
                          <div className="text-[11px] text-slate-400 font-medium">
                            {m.email}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Fraksi & Partai */}
                    <td className="py-3.5 px-3">
                      <span className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200">
                        {m.partyAffiliation}
                      </span>
                    </td>

                    {/* Dapil & Komisi */}
                    <td className="py-3.5 px-3">
                      <div className="font-bold text-slate-800 dark:text-slate-200">{m.dapilName}</div>
                      <div className="text-[11px] text-slate-400 font-medium">{m.commissionName}</div>
                    </td>

                    {/* Total Token Dipakai */}
                    <td className="py-3.5 px-3">
                      <div className="flex items-center gap-1.5 font-mono font-black text-slate-900 dark:text-white">
                        <Cpu className="h-3.5 w-3.5 text-indigo-500" />
                        <span>{Number(m.totalTokensUsed || 0).toLocaleString('id-ID')}</span>
                      </div>
                      <span className="text-[10px] text-slate-400 block mt-0.5">
                        {m.totalAiCalls || 0} kali inferensi
                      </span>
                    </td>

                    {/* Estimasi Biaya API */}
                    <td className="py-3.5 px-3">
                      <div className="font-mono font-black text-emerald-600 dark:text-emerald-400 text-sm">
                        ${Number(m.totalCostUsd || 0).toFixed(4)}
                      </div>
                      <span className="text-[10px] text-slate-400 font-semibold block mt-0.5">
                        &asymp; Rp {Number(m.totalCostIdr || 0).toLocaleString('id-ID')}
                      </span>
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
                        {m.totalLogins || 0} kali login tercatat
                      </span>
                    </td>

                    {/* Action: Lihat Detail */}
                    <td className="py-3.5 px-3 text-right">
                      <button
                        onClick={() => setSelectedMemberId(m.id)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-xs shadow-indigo-600/30 transition-all cursor-pointer"
                      >
                        <ShieldCheck className="h-3.5 w-3.5" />
                        <span>Lihat Log Detil</span>
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
              Menampilkan halaman <strong>{data.pagination.page}</strong> dari <strong>{data.pagination.totalPages}</strong> ({data.pagination.totalItems} dewan)
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

      {/* 4. MODAL DRAWER DETAIL LOG AKTIVITAS ANGGOTA */}
      {selectedMemberId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/75 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="w-full max-w-4xl bg-white dark:bg-[#0E131F] rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
            {/* Header Member Profile */}
            <div className="p-5 sm:p-6 border-b border-slate-100 dark:border-slate-800/80 flex items-start justify-between gap-4">
              <div className="flex items-center gap-3.5">
                <div className="h-12 w-12 rounded-2xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-400 flex items-center justify-center font-black text-base shrink-0 shadow-xs">
                  {detailData?.member?.fullName ? detailData.member.fullName.substring(0, 2).toUpperCase() : <User className="h-6 w-6" />}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
                      {detailData?.member?.fullName || 'Memuat profil dewan...'}
                    </h3>
                    {detailData?.member?.partyAffiliation && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800/60">
                        {detailData.member.partyAffiliation}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    {detailData?.member?.email} • {detailData?.member?.dapilName || 'Dapil Belum Ditentukan'} • {detailData?.member?.commissionName || 'Komisi Belum Ditentukan'}
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

            {/* Quick KPI Badges */}
            <div className="px-5 py-3 sm:px-6 bg-slate-50/60 dark:bg-slate-900/40 border-b border-slate-100 dark:border-slate-800/80 grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div className="p-3 rounded-xl bg-white dark:bg-[#0B0F17] border border-slate-200/80 dark:border-slate-800">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                  Total Token AI Terpakai
                </span>
                <div className="text-lg font-black text-slate-900 dark:text-white tracking-tight mt-0.5 font-mono">
                  {Number(detailData?.member?.totalTokensUsed || 0).toLocaleString('id-ID')}
                </div>
              </div>

              <div className="p-3 rounded-xl bg-white dark:bg-[#0B0F17] border border-slate-200/80 dark:border-slate-800">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                  Estimasi Biaya API Riil
                </span>
                <div className="text-lg font-black text-emerald-600 dark:text-emerald-400 tracking-tight mt-0.5 font-mono">
                  ${Number(detailData?.member?.totalCostUsd || 0).toFixed(4)}
                </div>
                <span className="text-[10px] text-slate-400 block">
                  &asymp; Rp {Number(detailData?.member?.totalCostIdr || 0).toLocaleString('id-ID')}
                </span>
              </div>

              <div className="p-3 rounded-xl bg-white dark:bg-[#0B0F17] border border-slate-200/80 dark:border-slate-800 col-span-2 sm:col-span-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                  Status Akun & Verifikasi
                </span>
                <div className="flex items-center gap-1.5 mt-1">
                  <span className="h-2 w-2 rounded-full bg-emerald-500" />
                  <span className="text-xs font-extrabold text-slate-900 dark:text-white">
                    {detailData?.member?.accountStatus || 'ACTIVE'}
                  </span>
                </div>
              </div>
            </div>

            {/* Category Filter Tabs */}
            <div className="px-5 py-3 sm:px-6 border-b border-slate-100 dark:border-slate-800 flex items-center gap-2 overflow-x-auto">
              {[
                { id: 'ALL', label: 'Semua Aktivitas' },
                { id: 'AUTH', label: 'Autentikasi (Login / Logout)' },
                { id: 'AI_AGENT', label: 'AI Agent & Inferensi Token' },
              ].map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => {
                    setDetailCategory(cat.id);
                    setDetailPage(1);
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                    detailCategory === cat.id
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            {/* List of Detailed Logs */}
            <div className="p-5 sm:p-6 overflow-y-auto space-y-3 flex-1">
              {detailLoading ? (
                <div className="py-16 text-center text-slate-400 text-xs">
                  <div className="flex items-center justify-center gap-2">
                    <div className="h-4 w-4 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                    <span>Memuat log aktivitas...</span>
                  </div>
                </div>
              ) : detailData?.items?.length === 0 ? (
                <div className="py-16 text-center text-slate-400 text-xs italic">
                  Belum ada log aktivitas untuk kategori ini.
                </div>
              ) : (
                detailData?.items?.map((log: any) => (
                  <div
                    key={log.id}
                    className="p-4 rounded-2xl bg-slate-50/70 dark:bg-slate-900/50 border border-slate-200/80 dark:border-slate-800 space-y-2 hover:border-indigo-500/40 transition-colors"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        {getActivityBadge(log.activityType, log.category)}
                        <span className="text-xs font-extrabold text-slate-900 dark:text-white">
                          {log.description}
                        </span>
                      </div>
                      <span className="text-[11px] text-slate-400 font-medium flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {new Date(log.createdAt).toLocaleDateString('id-ID', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                          second: '2-digit',
                        })}
                      </span>
                    </div>

                    {/* Metadata Details for AI / Device */}
                    <div className="flex flex-wrap items-center gap-2 pt-1">
                      {log.metadata?.model && (
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-purple-50 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300 font-mono">
                          Model: {log.metadata.model}
                        </span>
                      )}
                      {log.metadata?.totalTokens && (
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 font-mono">
                          Token: {Number(log.metadata.totalTokens).toLocaleString('id-ID')} ({log.metadata.inputTokens || 0} in / {log.metadata.outputTokens || 0} out)
                        </span>
                      )}
                      {log.metadata?.costUsd && (
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 font-mono">
                          Biaya: ${Number(log.metadata.costUsd).toFixed(4)}
                        </span>
                      )}
                      {log.metadata?.latencyMs && (
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 font-mono">
                          Latensi: {log.metadata.latencyMs}ms
                        </span>
                      )}
                      {log.ipAddress && (
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-medium text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center gap-1">
                          <Globe className="h-2.5 w-2.5" />
                          <span>IP: {log.ipAddress}</span>
                        </span>
                      )}
                      {log.userAgent && (
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-medium text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center gap-1 max-w-xs truncate">
                          <Laptop className="h-2.5 w-2.5 shrink-0" />
                          <span className="truncate">{log.userAgent}</span>
                        </span>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Modal Footer & Pagination */}
            <div className="p-4 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
              <span className="text-xs text-slate-400">
                Total {detailData?.pagination?.totalItems || 0} catatan log
              </span>
              <div className="flex items-center gap-2">
                <button
                  disabled={detailPage <= 1}
                  onClick={() => setDetailPage((p) => Math.max(1, p - 1))}
                  className="px-3 py-1.5 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 disabled:opacity-40 transition-colors"
                >
                  Sebelumnya
                </button>
                <button
                  disabled={!detailData?.pagination || detailPage >= detailData.pagination.totalPages}
                  onClick={() => setDetailPage((p) => p + 1)}
                  className="px-3 py-1.5 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 disabled:opacity-40 transition-colors"
                >
                  Selanjutnya
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
