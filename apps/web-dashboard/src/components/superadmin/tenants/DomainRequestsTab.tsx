'use client';

import React, { useEffect, useState, useCallback } from 'react';
import {
  Globe,
  CheckCircle,
  XCircle,
  Clock,
  RefreshCw,
  Search,
  ExternalLink,
  ShieldCheck,
  AlertTriangle,
  Radio,
  ArrowRight,
  Filter,
} from 'lucide-react';
import { AdminApiClient } from '@/lib/api-client';
import { DomainRequestRow } from '../types';
import { useRealtime } from '@/contexts/RealtimeContext';
import { toast } from '@/components/ui/toast';

export function DomainRequestsTab({
  onRequestCountChange,
}: {
  onRequestCountChange?: (pendingCount: number) => void;
}) {
  const { subscribe, isConnected } = useRealtime();
  const [requests, setRequests] = useState<DomainRequestRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'PENDING_REVIEW' | 'APPROVED' | 'REJECTED'>('PENDING_REVIEW');
  const [search, setSearch] = useState('');

  // DNS Check State
  const [dnsCheckLoadingId, setDnsCheckLoadingId] = useState<string | null>(null);
  const [dnsResults, setDnsResults] = useState<Record<string, any>>({});

  // Action Modals
  const [approveModalReq, setApproveModalReq] = useState<DomainRequestRow | null>(null);
  const [isApproving, setIsApproving] = useState(false);

  const [rejectModalReq, setRejectModalReq] = useState<DomainRequestRow | null>(null);
  const [rejectNotes, setRejectNotes] = useState('');
  const [isRejecting, setIsRejecting] = useState(false);

  const loadRequests = useCallback(async () => {
    try {
      setLoading(true);
      const query = statusFilter !== 'ALL' ? `?status=${statusFilter}` : '';
      const res = await AdminApiClient.request<{ success: boolean; data: DomainRequestRow[] }>(
        `/admin/domain-requests${query}`
      );
      if (res?.data) {
        setRequests(res.data);
        const pending = res.data.filter((r) => r.status === 'PENDING_REVIEW').length;
        if (onRequestCountChange) onRequestCountChange(pending);
      }
    } catch (err: any) {
      console.error('Failed to load domain requests:', err);
    } finally {
      setLoading(false);
    }
  }, [statusFilter, onRequestCountChange]);

  useEffect(() => {
    loadRequests();
  }, [loadRequests]);

  // Real-time Event Subscription: Auto-reload without page refresh!
  useEffect(() => {
    const unsubCreated = subscribe('DOMAIN_REQUEST_CREATED', () => {
      loadRequests();
    });
    const unsubUpdated = subscribe('DOMAIN_REQUEST_UPDATED', () => {
      loadRequests();
    });

    return () => {
      unsubCreated();
      unsubUpdated();
    };
  }, [subscribe, loadRequests]);

  const handleDnsCheck = async (req: DomainRequestRow) => {
    try {
      setDnsCheckLoadingId(req.id);
      const res = await AdminApiClient.request<any>(`/admin/domain-requests/${req.id}/dns-check`);
      setDnsResults((prev) => ({
        ...prev,
        [req.id]: res?.dnsCheck || res,
      }));
      if (res?.dnsCheck?.isValid) {
        toast({
          title: 'DNS Terverifikasi',
          description: `Domain ${req.requestedDomain} telah mengarah ke server Polaris. Siap disetujui.`,
          type: 'success',
        });
      } else {
        toast({
          title: 'DNS Belum Mengarah',
          description: res?.dnsCheck?.diagnosis || 'DNS belum terpropagasi.',
          type: 'error',
        });
      }
    } catch (err: any) {
      toast({
        title: 'Pemeriksaan DNS Gagal',
        description: err.message || 'Tidak dapat memverifikasi catatan DNS.',
        type: 'error',
      });
    } finally {
      setDnsCheckLoadingId(null);
    }
  };

  const handleConfirmApprove = async () => {
    if (!approveModalReq) return;
    try {
      setIsApproving(true);
      await AdminApiClient.request(`/admin/domain-requests/${approveModalReq.id}/approve`, {
        method: 'PATCH',
      });
      toast({
        title: 'Domain Berhasil Disetujui',
        description: `Domain ${approveModalReq.requestedDomain} telah aktif terhubung.`,
        type: 'success',
      });
      setApproveModalReq(null);
      loadRequests();
    } catch (err: any) {
      toast({
        title: 'Persetujuan Gagal',
        description: err.message || 'Terjadi kesalahan saat menyetujui domain.',
        type: 'error',
      });
    } finally {
      setIsApproving(false);
    }
  };

  const handleConfirmReject = async () => {
    if (!rejectModalReq) return;
    if (!rejectNotes.trim()) {
      alert('Mohon cantumkan alasan penolakan untuk disampaikan ke tokoh.');
      return;
    }
    try {
      setIsRejecting(true);
      await AdminApiClient.request(`/admin/domain-requests/${rejectModalReq.id}/reject`, {
        method: 'PATCH',
        body: JSON.stringify({ adminNotes: rejectNotes }),
      });
      toast({
        title: 'Pengajuan Ditolak',
        description: 'Notifikasi penolakan beserta alasan telah dikirimkan ke tokoh.',
        type: 'info',
      });
      setRejectModalReq(null);
      setRejectNotes('');
      loadRequests();
    } catch (err: any) {
      toast({
        title: 'Gagal Menolak Pengajuan',
        description: err.message || 'Terjadi kesalahan sistem.',
        type: 'error',
      });
    } finally {
      setIsRejecting(false);
    }
  };

  const filtered = requests.filter((r) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      r.requestedDomain?.toLowerCase().includes(q) ||
      r.currentDomain?.toLowerCase().includes(q) ||
      r.tenantName?.toLowerCase().includes(q) ||
      r.tenantEmail?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-5">
      {/* 1. FILTER & STATUS BAR */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="flex items-center gap-2 flex-wrap">
          {(['PENDING_REVIEW', 'ALL', 'APPROVED', 'REJECTED'] as const).map((st) => {
            const label =
              st === 'PENDING_REVIEW'
                ? 'Menunggu Review'
                : st === 'ALL'
                ? 'Semua Status'
                : st === 'APPROVED'
                ? 'Disetujui'
                : 'Ditolak';

            const active = statusFilter === st;

            return (
              <button
                key={st}
                type="button"
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                  active
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                {st === 'PENDING_REVIEW' && (
                  <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                )}
                <span>{label}</span>
              </button>
            );
          })}
        </div>

        {/* Realtime Status Indicator & Search */}
        <div className="flex items-center gap-3">
          <div
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold border ${
              isConnected
                ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                : 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800'
            }`}
          >
            <Radio className={`w-3 h-3 ${isConnected ? 'animate-pulse text-emerald-500' : ''}`} />
            <span>{isConnected ? 'Realtime Live' : 'Menghubungkan...'}</span>
          </div>

          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari domain / tokoh..."
              className="pl-8 pr-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-1 focus:ring-indigo-500 text-slate-800 dark:text-slate-200 w-48 sm:w-60"
            />
          </div>

          <button
            type="button"
            onClick={loadRequests}
            title="Refresh Data"
            className="p-1.5 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* 2. TABLE DATA PENGAJUAN */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50/75 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 uppercase font-black tracking-wider text-[10px]">
                <th className="py-3.5 px-4">Tokoh Eksekutif</th>
                <th className="py-3.5 px-4">Tipe &amp; Domain Diajukan</th>
                <th className="py-3.5 px-4">Domain Aktif Lama</th>
                <th className="py-3.5 px-4">Waktu Pengajuan</th>
                <th className="py-3.5 px-4">Status &amp; Verifikasi DNS</th>
                <th className="py-3.5 px-4 text-right">Tindakan Superadmin</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {loading && requests.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-indigo-500" />
                    <span>Memuat data pengajuan domain...</span>
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    <Globe className="w-8 h-8 mx-auto mb-2 text-slate-300 dark:text-slate-700" />
                    <p className="font-medium">Tidak ada pengajuan domain ditemukan.</p>
                  </td>
                </tr>
              ) : (
                filtered.map((req) => {
                  const dns = dnsResults[req.id];
                  return (
                    <tr
                      key={req.id}
                      className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition group"
                    >
                      {/* 1. Tokoh */}
                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-900 dark:text-white">
                          {req.tenantName || 'Anggota Dewan'}
                        </div>
                        <div className="text-[11px] text-slate-500 dark:text-slate-400">
                          {req.tenantEmail}
                        </div>
                        {req.partyAffiliation && (
                          <span className="inline-block mt-0.5 px-1.5 py-0.5 rounded text-[10px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                            {req.partyAffiliation}
                          </span>
                        )}
                      </td>

                      {/* 2. Tipe & Target Domain */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1.5">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              req.requestType === 'SUBDOMAIN'
                                ? 'bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-900'
                                : 'bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-900'
                            }`}
                          >
                            {req.requestType === 'SUBDOMAIN' ? 'Subdomain' : 'Custom Domain'}
                          </span>
                        </div>
                        <div className="font-mono font-bold text-slate-900 dark:text-indigo-300 mt-1 flex items-center gap-1">
                          <span>
                            {req.requestType === 'SUBDOMAIN'
                              ? `${req.requestedDomain}.polaris.id`
                              : req.requestedDomain}
                          </span>
                        </div>
                      </td>

                      {/* 3. Domain Lama */}
                      <td className="py-3 px-4 font-mono text-[11px] text-slate-500 dark:text-slate-400">
                        {req.currentDomain ? (
                          <div className="flex items-center gap-1 text-slate-600 dark:text-slate-400">
                            <span>{req.currentDomain}</span>
                            <ArrowRight className="w-3 h-3 text-slate-400 inline" />
                          </div>
                        ) : (
                          <span className="text-slate-400 italic">Domain baru</span>
                        )}
                      </td>

                      {/* 4. Tanggal */}
                      <td className="py-3 px-4 text-slate-500 dark:text-slate-400 whitespace-nowrap text-[11px]">
                        <div>{new Date(req.createdAt).toLocaleDateString('id-ID')}</div>
                        <div className="text-[10px] text-slate-400">
                          {new Date(req.createdAt).toLocaleTimeString('id-ID', {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </div>
                      </td>

                      {/* 5. Status & DNS Check */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2 flex-wrap">
                          {req.status === 'PENDING_REVIEW' && (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800 inline-flex items-center gap-1">
                              <Clock className="w-3 h-3 text-amber-600 animate-pulse" />
                              <span>Menunggu Review</span>
                            </span>
                          )}
                          {req.status === 'APPROVED' && (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 inline-flex items-center gap-1">
                              <CheckCircle className="w-3 h-3 text-emerald-600" />
                              <span>Disetujui &amp; Aktif</span>
                            </span>
                          )}
                          {req.status === 'REJECTED' && (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300 border border-rose-200 dark:border-rose-800 inline-flex items-center gap-1">
                              <XCircle className="w-3 h-3 text-rose-600" />
                              <span>Ditolak</span>
                            </span>
                          )}
                        </div>

                        {/* Hasil Cek DNS bila ada */}
                        {dns && (
                          <div className="mt-1 text-[10px]">
                            {dns.isValid ? (
                              <span className="text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                                <ShieldCheck className="w-3 h-3" /> DNS Valid ({dns.resolvedTarget})
                              </span>
                            ) : (
                              <span className="text-rose-600 dark:text-rose-400 flex items-center gap-1">
                                <AlertTriangle className="w-3 h-3" /> {dns.diagnosis || 'DNS Belum Mengarah'}
                              </span>
                            )}
                          </div>
                        )}

                        {req.adminNotes && (
                          <div className="text-[10px] text-slate-500 dark:text-slate-400 italic mt-0.5">
                            Catatan: {req.adminNotes}
                          </div>
                        )}
                      </td>

                      {/* 6. Aksi */}
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5 flex-wrap">
                          {/* Tombol Cek DNS */}
                          {req.status === 'PENDING_REVIEW' && req.requestType === 'CUSTOM_DOMAIN' && (
                            <button
                              type="button"
                              onClick={() => handleDnsCheck(req)}
                              disabled={dnsCheckLoadingId === req.id}
                              className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold text-[11px] transition flex items-center gap-1"
                              title="Periksa apakah domain sudah mengarah ke server Polaris"
                            >
                              <RefreshCw
                                className={`w-3 h-3 ${dnsCheckLoadingId === req.id ? 'animate-spin' : ''}`}
                              />
                              <span>Cek DNS</span>
                            </button>
                          )}

                          {/* Tombol Setujui */}
                          {req.status === 'PENDING_REVIEW' && (
                            <button
                              type="button"
                              onClick={() => setApproveModalReq(req)}
                              className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] transition flex items-center gap-1 shadow-xs"
                            >
                              <CheckCircle className="w-3 h-3" />
                              <span>Setujui &amp; Bind</span>
                            </button>
                          )}

                          {/* Tombol Tolak */}
                          {req.status === 'PENDING_REVIEW' && (
                            <button
                              type="button"
                              onClick={() => {
                                setRejectModalReq(req);
                                setRejectNotes('');
                              }}
                              className="px-2.5 py-1 rounded-lg bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 dark:hover:bg-rose-900/40 text-rose-600 dark:text-rose-400 font-semibold text-[11px] transition flex items-center gap-1 border border-rose-200 dark:border-rose-900"
                            >
                              <XCircle className="w-3 h-3" />
                              <span>Tolak</span>
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 3. MODAL PERSETUJUAN (APPROVE) */}
      {approveModalReq && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 rounded-2xl">
                <CheckCircle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-black text-slate-900 dark:text-white">
                  Setujui &amp; Bind Domain
                </h3>
                <p className="text-xs text-slate-500">Konfirmasi pengikatan domain ke portal tokoh.</p>
              </div>
            </div>

            <div className="bg-slate-50 dark:bg-slate-800/60 p-3.5 rounded-2xl text-xs space-y-1.5 border border-slate-200 dark:border-slate-700">
              <div className="flex justify-between">
                <span className="text-slate-500">Tokoh:</span>
                <span className="font-bold text-slate-900 dark:text-white">{approveModalReq.tenantName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Domain Target:</span>
                <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400">
                  {approveModalReq.requestType === 'SUBDOMAIN'
                    ? `${approveModalReq.requestedDomain}.polaris.id`
                    : approveModalReq.requestedDomain}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Tipe:</span>
                <span className="font-semibold text-slate-700 dark:text-slate-300">
                  {approveModalReq.requestType === 'SUBDOMAIN' ? 'Subdomain Polaris' : 'Domain Kustom Eksternal'}
                </span>
              </div>
            </div>

            <div className="text-xs text-slate-600 dark:text-slate-300 space-y-2 bg-emerald-50/60 dark:bg-emerald-950/20 p-3 rounded-2xl border border-emerald-100 dark:border-emerald-900/50">
              <p className="font-semibold text-emerald-800 dark:text-emerald-300">
                🛡️ Tindakan Otomatis Sistem:
              </p>
              <ul className="list-disc pl-4 space-y-1 text-[11px] text-slate-600 dark:text-slate-400">
                <li>Domain aktif akan dialihkan ke target baru.</li>
                {approveModalReq.requestType === 'SUBDOMAIN' && (
                  <li>Subdomain lama disimpan sebagai alias 301 redirect (mencegah link brosur/QR rusak).</li>
                )}
                <li>Notifikasi real-time instan dikirimkan ke dashboard tokoh.</li>
                <li>Sertifikat TLS/SSL Caddy diterbitkan secara on-demand.</li>
              </ul>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setApproveModalReq(null)}
                disabled={isApproving}
                className="px-4 py-2 text-xs font-semibold rounded-xl text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleConfirmApprove}
                disabled={isApproving}
                className="px-4 py-2 text-xs font-bold rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white flex items-center gap-1.5 shadow-sm"
              >
                {isApproving ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle className="w-3.5 h-3.5" />}
                <span>Setujui Sekarang</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 4. MODAL PENOLAKAN (REJECT) */}
      {rejectModalReq && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-rose-100 dark:bg-rose-950 text-rose-600 dark:text-rose-400 rounded-2xl">
                <XCircle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-black text-slate-900 dark:text-white">
                  Tolak Pengajuan Domain
                </h3>
                <p className="text-xs text-slate-500">Berikan catatan penolakan untuk disampaikan ke tokoh.</p>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Alasan Penolakan <span className="text-rose-500">*</span>
              </label>
              <textarea
                value={rejectNotes}
                onChange={(e) => setRejectNotes(e.target.value)}
                placeholder="Contoh: Catatan CNAME belum mengarah ke cname.polaris.id, atau nama subdomain melanggar etika kelembagaan."
                rows={3}
                className="w-full text-xs p-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-500"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  setRejectModalReq(null);
                  setRejectNotes('');
                }}
                disabled={isRejecting}
                className="px-4 py-2 text-xs font-semibold rounded-xl text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleConfirmReject}
                disabled={isRejecting}
                className="px-4 py-2 text-xs font-bold rounded-xl bg-rose-600 hover:bg-rose-700 text-white flex items-center gap-1.5 shadow-sm"
              >
                {isRejecting ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <XCircle className="w-3.5 h-3.5" />}
                <span>Kirim Penolakan</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
