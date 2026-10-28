'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Globe,
  CheckCircle2,
  Clock,
  XCircle,
  ExternalLink,
  ShieldCheck,
  Send,
  AlertCircle,
  RefreshCw,
  Info,
  Sparkles,
  ArrowRight,
} from 'lucide-react';
import { ApiClient } from '@/lib/api-client';
import { toast } from '@/components/ui/toast';
import { useRealtime } from '@/contexts/RealtimeContext';
import { getRootDomain } from '@/lib/urls';

interface DomainRequestItem {
  id: string;
  tenantId: string;
  requestType: 'SUBDOMAIN' | 'CUSTOM_DOMAIN';
  requestedDomain: string;
  currentDomain: string | null;
  status: 'PENDING_REVIEW' | 'APPROVED' | 'REJECTED';
  adminNotes: string | null;
  reviewedAt: string | null;
  createdAt: string;
}

interface DomainManagementPanelProps {
  currentSubdomain: string;
  currentCustomDomain?: string | null;
  onDomainUpdated?: () => void;
}

export function DomainManagementPanel({
  currentSubdomain,
  currentCustomDomain,
  onDomainUpdated,
}: DomainManagementPanelProps) {
  const { subscribe } = useRealtime();
  const [requests, setRequests] = useState<DomainRequestItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Form Pengajuan Baru
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [requestType, setRequestType] = useState<'SUBDOMAIN' | 'CUSTOM_DOMAIN'>('SUBDOMAIN');
  const [targetDomain, setTargetDomain] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const rootDomain = getRootDomain();

  const loadRequests = useCallback(async () => {
    try {
      setLoading(true);
      const res = await ApiClient.request<{ success: boolean; data: DomainRequestItem[] }>(
        '/cms/domain/request/my'
      );
      if (res?.data) {
        setRequests(res.data);
      }
    } catch (err) {
      console.error('Gagal mengambil riwayat pengajuan domain:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadRequests();
  }, [loadRequests]);

  // Real-time listener: Update otomatis jika admin menyetujui / menolak!
  useEffect(() => {
    const unsubApproved = subscribe('DOMAIN_REQUEST_APPROVED', () => {
      loadRequests();
      if (onDomainUpdated) onDomainUpdated();
    });

    const unsubRejected = subscribe('DOMAIN_REQUEST_REJECTED', () => {
      loadRequests();
    });

    return () => {
      unApproved();
      unsubRejected();
    };

    function unApproved() {
      unsubApproved();
    }
  }, [subscribe, loadRequests, onDomainUpdated]);

  const activePendingRequest = requests.find((r) => r.status === 'PENDING_REVIEW');
  const latestRejectedRequest = requests.find((r) => r.status === 'REJECTED');

  const handleSubmitRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    const clean = targetDomain.trim().toLowerCase();
    if (!clean) {
      toast({
        title: 'Input Tidak Boleh Kosong',
        description: 'Silakan isi domain atau subdomain yang ingin diajukan.',
        type: 'error',
      });
      return;
    }

    try {
      setSubmitting(true);
      await ApiClient.request('/cms/domain/request', {
        method: 'POST',
        body: JSON.stringify({
          requestType,
          requestedDomain: clean,
        }),
      });

      toast({
        title: 'Pengajuan Berhasil Dikirim',
        description: 'Permintaan domain telah dikirim ke tim admin Polaris untuk ditinjau.',
        type: 'success',
      });

      setIsModalOpen(false);
      setTargetDomain('');
      loadRequests();
    } catch (err: any) {
      toast({
        title: 'Pengajuan Gagal',
        description: err.message || 'Terjadi kesalahan sistem.',
        type: 'error',
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. SECTION TITLE */}
      <div className="border-b border-slate-100 dark:border-slate-800 pb-3 flex items-center justify-between">
        <div>
          <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
            <Globe className="h-4 w-4 text-blue-500" />
            Alur Tata Kelola &amp; Pengajuan Domain
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Domain resmi portal eksekutif Anda dikelola dengan perlindungan SSL dan validasi DNS terpadu.
          </p>
        </div>

        <button
          type="button"
          onClick={loadRequests}
          title="Segarkan Riwayat"
          className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* 2. KARTU STATUS DOMAIN SAAT INI */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {/* SUBDOMAIN AKTIF */}
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Subdomain Polaris Resmi
            </span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3 text-emerald-500" /> Aktif
            </span>
          </div>

          <div className="font-mono font-bold text-sm text-slate-900 dark:text-white truncate">
            https://{currentSubdomain || 'tokoh'}.{rootDomain}
          </div>

          <div className="pt-1 flex items-center justify-between">
            <a
              href={`https://${currentSubdomain}.${rootDomain}`}
              target="_blank"
              rel="noreferrer"
              className="text-xs font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-400 inline-flex items-center gap-1 transition"
            >
              <span>Buka Website</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>

        {/* CUSTOM DOMAIN AKTIF */}
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Custom Domain Pribadi
            </span>
            {currentCustomDomain ? (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 flex items-center gap-1">
                <ShieldCheck className="w-3 h-3 text-indigo-500" /> Terhubung &amp; SSL Aktif
              </span>
            ) : (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400">
                Belum Ditautkan
              </span>
            )}
          </div>

          <div className="font-mono font-bold text-sm text-slate-900 dark:text-white truncate">
            {currentCustomDomain ? `https://${currentCustomDomain}` : 'Belum memiliki custom domain'}
          </div>

          <div className="pt-1">
            {currentCustomDomain ? (
              <a
                href={`https://${currentCustomDomain}`}
                target="_blank"
                rel="noreferrer"
                className="text-xs font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-400 inline-flex items-center gap-1 transition"
              >
                <span>Kunjungi Domain Kustom</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            ) : (
              <span className="text-[11px] text-slate-400">
                Gunakan domain pribadi seperti .id / .com
              </span>
            )}
          </div>
        </div>
      </div>

      {/* 3. ALERT / STATUS PENGAJUAN SEDANG PROSES (JIKA ADA) */}
      {activePendingRequest && (
        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-900 dark:text-amber-200 space-y-2.5 animate-in fade-in">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-600 dark:text-amber-400 animate-spin" />
              <span className="font-bold text-xs">
                Pengajuan Domain Sedang Ditinjau Admin
              </span>
            </div>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-500 text-slate-950">
              PROSES REVIEW
            </span>
          </div>

          <div className="text-xs space-y-1">
            <p>
              Anda telah mengajukan{' '}
              <strong className="font-semibold">
                {activePendingRequest.requestType === 'SUBDOMAIN' ? 'Subdomain Baru' : 'Custom Domain'}
              </strong>
              :{' '}
              <span className="font-mono font-bold text-amber-700 dark:text-amber-300">
                {activePendingRequest.requestType === 'SUBDOMAIN'
                  ? `${activePendingRequest.requestedDomain}.${rootDomain}`
                  : activePendingRequest.requestedDomain}
              </span>
            </p>
            <p className="text-[11px] text-amber-700/80 dark:text-amber-300/80">
              Pengajuan dikirimkan pada:{' '}
              {new Date(activePendingRequest.createdAt).toLocaleString('id-ID')}. Begitu admin menyetujui, halaman ini akan otomatis diperbarui.
            </p>
          </div>
        </div>
      )}

      {/* 4. ALERT JIKA PENGAJUAN TERAKHIR DITOLAK */}
      {!activePendingRequest && latestRejectedRequest && (
        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-900 dark:text-rose-200 space-y-2 animate-in fade-in">
          <div className="flex items-center gap-2">
            <XCircle className="w-4 h-4 text-rose-600 dark:text-rose-400" />
            <span className="font-bold text-xs">Pengajuan Domain Sebelumnya Ditolak</span>
          </div>
          <p className="text-xs text-rose-700 dark:text-rose-300">
            Domain: <strong className="font-mono">{latestRejectedRequest.requestedDomain}</strong>
          </p>
          {latestRejectedRequest.adminNotes && (
            <div className="text-[11px] bg-rose-50 dark:bg-rose-950/30 p-2.5 rounded-xl border border-rose-200 dark:border-rose-900/40 text-rose-800 dark:text-rose-300">
              <span className="font-bold">Catatan Admin:</span> {latestRejectedRequest.adminNotes}
            </div>
          )}
        </div>
      )}

      {/* 5. TOMBOL AJUKAN PERUBAHAN DOMAIN */}
      <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="space-y-0.5">
          <div className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-blue-500" />
            <span>Ingin Mengganti Subdomain atau Menautkan Custom Domain?</span>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400">
            Kirimkan permohonan ke admin. Pengalihan domain lama akan dijaga otomatis dengan redirect 301.
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            setIsModalOpen(true);
            setRequestType('SUBDOMAIN');
            setTargetDomain('');
          }}
          disabled={Boolean(activePendingRequest)}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 shrink-0 ${
            activePendingRequest
              ? 'bg-slate-200 dark:bg-slate-800 text-slate-400 cursor-not-allowed'
              : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs'
          }`}
        >
          <Send className="w-3.5 h-3.5" />
          <span>{activePendingRequest ? 'Menunggu Peninjauan' : 'Ajukan Perubahan Domain'}</span>
        </button>
      </div>

      {/* 6. MODAL PENGAJUAN DOMAIN */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400 rounded-2xl">
                <Globe className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-black text-slate-900 dark:text-white">
                  Ajukan Domain / Subdomain
                </h3>
                <p className="text-xs text-slate-500">Pilih tipe domain yang ingin Anda gunakan.</p>
              </div>
            </div>

            {/* TAB SELECTOR TIPE DOMAIN */}
            <div className="grid grid-cols-2 gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl text-xs font-bold">
              <button
                type="button"
                onClick={() => {
                  setRequestType('SUBDOMAIN');
                  setTargetDomain('');
                }}
                className={`py-2 rounded-lg transition ${
                  requestType === 'SUBDOMAIN'
                    ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs'
                    : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                Subdomain Polaris
              </button>
              <button
                type="button"
                onClick={() => {
                  setRequestType('CUSTOM_DOMAIN');
                  setTargetDomain('');
                }}
                className={`py-2 rounded-lg transition ${
                  requestType === 'CUSTOM_DOMAIN'
                    ? 'bg-white dark:bg-slate-900 text-purple-600 dark:text-purple-400 shadow-xs'
                    : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                Custom Domain Pribadi
              </button>
            </div>

            <form onSubmit={handleSubmitRequest} className="space-y-4">
              {requestType === 'SUBDOMAIN' ? (
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Nama Subdomain Baru
                  </label>
                  <div className="flex items-center">
                    <input
                      type="text"
                      required
                      placeholder="contoh: budi-dprd"
                      value={targetDomain}
                      onChange={(e) =>
                        setTargetDomain(
                          e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '')
                        )
                      }
                      className="block w-full rounded-l-xl border border-r-0 border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3.5 py-2.5 text-xs font-semibold text-slate-900 dark:text-white focus:outline-none focus:border-blue-600"
                    />
                    <span className="inline-flex items-center px-3.5 py-2.5 rounded-r-xl border border-slate-300 dark:border-slate-700 bg-slate-100 dark:bg-slate-700 text-xs font-bold text-slate-500 select-none">
                      .{rootDomain}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Preview:{' '}
                    <span className="font-mono text-blue-600 dark:text-blue-400">
                      https://{targetDomain || 'nama'}.{rootDomain}
                    </span>
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                      Alamat Domain Pribadi
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="contoh: budisantoso.id atau dewanku.com"
                      value={targetDomain}
                      onChange={(e) => setTargetDomain(e.target.value.toLowerCase().trim())}
                      className="block w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3.5 py-2.5 text-xs font-mono text-slate-900 dark:text-white focus:outline-none focus:border-purple-600"
                    />
                  </div>

                  <div className="p-3 bg-blue-50 dark:bg-blue-950/40 rounded-xl border border-blue-200 dark:border-blue-900/60 text-[11px] text-slate-600 dark:text-slate-300 space-y-1">
                    <div className="font-bold text-blue-900 dark:text-blue-300 flex items-center gap-1">
                      <Info className="w-3.5 h-3.5" /> Konfigurasi DNS di Registrar Domain Anda:
                    </div>
                    <p>
                      Tambahkan DNS Record CNAME yang mengarah ke target:{' '}
                      <code className="font-bold text-blue-600 dark:text-blue-400 font-mono">
                        cname.{rootDomain}
                      </code>
                    </p>
                  </div>
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  disabled={submitting}
                  className="px-4 py-2 text-xs font-semibold rounded-xl text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={submitting || !targetDomain.trim()}
                  className="px-4 py-2 text-xs font-bold rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white flex items-center gap-1.5 shadow-sm disabled:opacity-50"
                >
                  {submitting ? (
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Send className="w-3.5 h-3.5" />
                  )}
                  <span>Kirim Pengajuan</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
