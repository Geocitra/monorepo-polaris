'use client';

import React, { useEffect, useState, useRef } from 'react';
import {
  Receipt,
  CheckCircle2,
  AlertTriangle,
  UploadCloud,
  PlayCircle,
  Clock,
  DollarSign,
  TrendingDown,
  X,
  FileText,
  Search,
  Check,
  ShieldAlert,
  FileSpreadsheet,
  Trash2,
  Download,
  RefreshCw,
} from 'lucide-react';
import { AdminApiClient } from '@/lib/api-client';

export default function SuperadminReconciliationPage() {
  const [batches, setBatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedBatch, setSelectedBatch] = useState<any | null>(null);
  const [selectedDiscrepancy, setSelectedDiscrepancy] = useState<any | null>(null);
  const [resolveNotes, setResolveNotes] = useState('');
  const [resolving, setResolving] = useState(false);

  // State Modal Upload CSV & File Handling
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [csvContent, setCsvContent] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [showManualTextarea, setShowManualTextarea] = useState(false);
  const [reconDateInput, setReconDateInput] = useState('2026-09-30');
  const [uploading, setUploading] = useState(false);

  // State Modal Tarik Otomatis API
  const [showApiModal, setShowApiModal] = useState(false);
  const [apiReconDate, setApiReconDate] = useState('2026-09-30');
  const [apiNotes, setApiNotes] = useState('');
  const [triggeringApi, setTriggeringApi] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // State Filter & Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [detailTab, setDetailTab] = useState<'MATCHED' | 'DISCREPANCIES'>('MATCHED');

  // State SweetAlert Style Feedback Modal
  const [feedback, setFeedback] = useState<{
    show: boolean;
    type: 'success' | 'error' | 'warning' | 'info';
    title: string;
    message: string;
    badge?: string;
  } | null>(null);

  const notify = (type: 'success' | 'error' | 'warning' | 'info', title: string, message: string, badge?: string) => {
    setFeedback({ show: true, type, title, message, badge });
  };

  useEffect(() => {
    loadBatches(1, statusFilter);
  }, []);

  const loadBatches = async (page = currentPage, status = statusFilter) => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams();
      queryParams.set('page', String(page));
      queryParams.set('limit', '10');
      if (status && status !== 'ALL') {
        queryParams.set('status', status);
      }
      const res = await AdminApiClient.request<any>(`/admin/reconciliation/batches?${queryParams.toString()}`);
      setBatches(res.items || []);
      if (res.pagination) {
        setCurrentPage(res.pagination.page);
        setTotalPages(res.pagination.totalPages);
        setTotalItems(res.pagination.totalItems);
      }
    } catch (err) {
      console.error('Gagal memuat daftar batch rekonsiliasi:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadBatchDetail = async (batchId: string) => {
    try {
      const res = await AdminApiClient.request<any>(`/admin/reconciliation/batches/${batchId}`);
      setSelectedBatch(res);
      setDetailTab((res.discrepancies && res.discrepancies.length > 0) ? 'DISCREPANCIES' : 'MATCHED');
    } catch (err: any) {
      notify('error', 'Gagal Memuat Detail', err.message || 'Gagal memuat rincian batch.');
    }
  };

  const handleFileChange = (file: File | null) => {
    if (!file) {
      setSelectedFile(null);
      setCsvContent('');
      return;
    }
    setSelectedFile(file);
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = (e.target?.result as string) || '';
      setCsvContent(text);
    };
    reader.readAsText(file);
  };

  const handleDownloadSampleCsv = () => {
    const sample = `Order ID,Gross Amount,Payment Type,Transaction Status,Settlement Time\nINV-20260930-5YY25,2000000,bank_transfer,settlement,2026-09-30 10:31:37\nINV-20260930-TPMRS,20000000,bank_transfer,settlement,2026-09-30 18:05:07\n`;
    const blob = new Blob([sample], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `sample_midtrans_settlement_${reconDateInput}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const submitApiReconciliation = async (e: React.FormEvent) => {
    e.preventDefault();
    setTriggeringApi(true);
    try {
      const res = await AdminApiClient.request<any>('/admin/reconciliation/trigger', {
        method: 'POST',
        body: JSON.stringify({
          reconDate: apiReconDate,
          notes: apiNotes.trim() || `Audit Midtrans API untuk tanggal ${apiReconDate}`,
        }),
      });

      notify(
        'success',
        'Rekonsiliasi Selesai Diproses!',
        'Kroscek mutasi kas berhasil dijalankan dan status audit telah diperbarui.',
        res.status
      );
      setShowApiModal(false);
      loadBatches();
    } catch (err: any) {
      notify('error', 'Gagal Memicu Rekonsiliasi', err.message || 'Gagal memicu rekonsiliasi otomatis Midtrans.');
    } finally {
      setTriggeringApi(false);
    }
  };

  const handleUploadCsv = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!csvContent.trim()) return;

    setUploading(true);
    try {
      await AdminApiClient.request('/admin/reconciliation/upload-csv', {
        method: 'POST',
        body: JSON.stringify({
          reconDate: reconDateInput,
          csvContent: csvContent.trim(),
          notes: selectedFile ? `Diunggah via file ${selectedFile.name}` : 'Diunggah via Konsol Superadmin',
        }),
      });

      notify(
        'success',
        'File CSV Berhasil Diproses',
        'Data settlement CSV telah berhasil diimpor dan dicocokkan dengan invoice internal.'
      );
      setShowUploadModal(false);
      setCsvContent('');
      setSelectedFile(null);
      loadBatches();
    } catch (err: any) {
      notify('error', 'Gagal Memproses File CSV', err.message || 'Format atau isi file CSV tidak valid.');
    } finally {
      setUploading(false);
    }
  };

  const handleResolveDiscrepancy = async (resolutionStatus: 'MANUALLY_RESOLVED' | 'IGNORED') => {
    if (!selectedDiscrepancy || !resolveNotes.trim()) {
      notify(
        'warning',
        'Catatan Resolusi Wajib Diisi',
        'Wajib mengisi catatan justifikasi audit untuk transparansi pelaporan finansial.'
      );
      return;
    }

    setResolving(true);
    try {
      await AdminApiClient.request(`/admin/reconciliation/discrepancies/${selectedDiscrepancy.id}/resolve`, {
        method: 'POST',
        body: JSON.stringify({
          resolutionStatus,
          resolutionNotes: resolveNotes.trim(),
        }),
      });

      notify(
        'success',
        'Selisih Berhasil Ditandai',
        `Selisih transaksi berhasil ditandai sebagai ${resolutionStatus}.`
      );
      setSelectedDiscrepancy(null);
      setResolveNotes('');
      if (selectedBatch) {
        loadBatchDetail(selectedBatch.batch.id);
      }
      loadBatches();
    } catch (err: any) {
      notify('error', 'Gagal Memperbarui Status', err.message || 'Gagal memperbarui status selisih.');
    } finally {
      setResolving(false);
    }
  };

  // Kalkulasi Ringkasan KPI Finansial
  const totalGrossAll = batches.reduce((acc, b) => acc + Number(b.totalGrossAmountIdr || 0), 0);
  const totalMdrAll = batches.reduce((acc, b) => acc + Number(b.totalMdrFeeIdr || 0), 0);
  const totalNetAll = batches.reduce((acc, b) => acc + Number(b.totalNetAmountIdr || 0), 0);
  const activeDiscrepanciesCount = batches.reduce((acc, b) => acc + Number(b.totalDiscrepancies || 0), 0);

  return (
    <div className="space-y-6">
      {/* Header Halaman */}
      <div className="border-b border-slate-200 dark:border-slate-800 pb-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400 flex items-center justify-center font-black">
              <Receipt className="h-5 w-5" />
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              Audit Rekonsiliasi Kas Midtrans & Pembukuan
            </h1>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Pencocokan harian mutasi penyelesaian resmi gateway terhadap buku kas internal POLARIS (Gross, MDR Fee, dan Net Cash Ingress).
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowApiModal(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold text-xs shadow-2xs transition-all cursor-pointer"
            title="Tarik data settlement resmi langsung dari API Midtrans"
          >
            <RefreshCw className="h-3.5 w-3.5 text-blue-600" />
            <span>Tarik Otomatis (API)</span>
          </button>

          <button
            onClick={() => setShowUploadModal(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs transition-all cursor-pointer"
          >
            <UploadCloud className="h-4 w-4" />
            <span>Unggah File CSV Mutasi</span>
          </button>
        </div>
      </div>

      {/* Kartu KPI Finansial */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#0B0F17] border border-slate-200 dark:border-slate-800 shadow-xs space-y-1.5">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Total Tagihan (Gross)</span>
          <div className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white font-mono">
            Rp {totalGrossAll.toLocaleString('id-ID')}
          </div>
          <span className="text-[10px] text-slate-400 block font-medium">Pembayaran resmi anggota dewan</span>
        </div>

        <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#0B0F17] border border-slate-200 dark:border-slate-800 shadow-xs space-y-1.5">
          <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400 flex items-center gap-1">
            <TrendingDown className="h-3.5 w-3.5" />
            <span>Biaya MDR & PPN 11%</span>
          </span>
          <div className="text-xl sm:text-2xl font-black text-amber-600 dark:text-amber-400 font-mono">
            Rp {totalMdrAll.toLocaleString('id-ID')}
          </div>
          <span className="text-[10px] text-slate-400 block font-medium">Potongan channel bank/gateway</span>
        </div>

        <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#0B0F17] border border-slate-200 dark:border-slate-800 shadow-xs space-y-1.5">
          <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
            
            <span>Kas Bersih Diterima (Net)</span>
          </span>
          <div className="text-xl sm:text-2xl font-black text-emerald-600 dark:text-emerald-400 font-mono">
            Rp {totalNetAll.toLocaleString('id-ID')}
          </div>
          <span className="text-[10px] text-slate-400 block font-medium">Pencairan riil ke rekening kas</span>
        </div>

        <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#0B0F17] border border-slate-200 dark:border-slate-800 shadow-xs space-y-1.5">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Selisih Transaksi Aktif</span>
          <div className={`text-xl sm:text-2xl font-black font-mono ${activeDiscrepanciesCount > 0 ? 'text-rose-600 dark:text-rose-400' : 'text-slate-900 dark:text-white'}`}>
            {activeDiscrepanciesCount} Kasus
          </div>
          <span className="text-[10px] text-slate-400 block font-medium">Memerlukan investigasi admin</span>
        </div>
      </div>

      {/* Tabel Batch Rekonsiliasi */}
      <div className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-[#0B0F17] border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider">
              Riwayat Batch Audit Rekonsiliasi
            </h2>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Daftar sesi kroscek kas harian dan resolusi selisih gateway
            </p>
          </div>

          {/* Filter Status Tabs */}
          <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-900 rounded-xl">
            {[
              { id: 'ALL', label: 'Semua Status' },
              { id: 'BALANCED', label: 'Balanced' },
              { id: 'DISCREPANCY', label: 'Selisih' },
              { id: 'RESOLVED', label: 'Resolved' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => {
                  setStatusFilter(tab.id);
                  loadBatches(1, tab.id);
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  statusFilter === tab.id
                    ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-2xs'
                    : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Search & Counter Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
          <div className="relative w-full sm:w-72">
            <Search className="h-3.5 w-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Cari Batch ID atau Tanggal..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 rounded-xl text-xs border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white placeholder:text-slate-400 font-mono"
            />
          </div>

          <span className="text-xs text-slate-400 font-semibold">
            {batches.length} Sesi Audit Terdata
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 text-[10px] font-black uppercase text-slate-400 tracking-wider">
                <th className="py-3 px-3">Batch ID & Tanggal</th>
                <th className="py-3 px-3">Sumber Mutasi</th>
                <th className="py-3 px-3">Transaksi Cocok</th>
                <th className="py-3 px-3">Gross / Kas Bersih (Net)</th>
                <th className="py-3 px-3">Status Audit</th>
                <th className="py-3 px-3 text-right">Rincian</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-10 text-center text-slate-400 text-xs">
                    <div className="flex items-center justify-center gap-2">
                      <RefreshCw className="h-4 w-4 animate-spin text-blue-600" />
                      <span>Memuat riwayat audit rekonsiliasi...</span>
                    </div>
                  </td>
                </tr>
              ) : batches.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-10 text-center text-slate-400 text-xs italic">
                    Belum ada sesi rekonsiliasi yang dijalankan.
                  </td>
                </tr>
              ) : (
                batches
                  .filter((b) => {
                    if (!searchQuery.trim()) return true;
                    const q = searchQuery.toLowerCase().trim();
                    return (
                      (b.batchNumber || '').toLowerCase().includes(q) ||
                      (b.reconDate || '').includes(q)
                    );
                  })
                  .map((b) => (
                    <tr key={b.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/30 transition-colors">
                      <td className="py-3.5 px-3">
                        <div className="font-mono font-bold text-slate-900 dark:text-white text-[11px]">
                          {b.batchNumber}
                        </div>
                        <div className="text-[10px] text-slate-400 mt-0.5 flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          <span>Tanggal Audit: {b.reconDate}</span>
                        </div>
                      </td>

                      <td className="py-3.5 px-3">
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                          {b.sourceGateway}
                        </span>
                      </td>

                      <td className="py-3.5 px-3">
                        <div className="font-bold text-slate-800 dark:text-slate-200">
                          {b.totalMatchedTransactions} / {b.totalGatewayTransactions} Cocok
                        </div>
                        {b.totalDiscrepancies > 0 && (
                          <span className="text-[10px] font-bold text-rose-600 block mt-0.5">
                            {b.totalDiscrepancies} transaksi selisih
                          </span>
                        )}
                      </td>

                      <td className="py-3.5 px-3 font-mono">
                        <div className="text-slate-900 dark:text-white font-bold">
                          Rp {Number(b.totalGrossAmountIdr).toLocaleString('id-ID')}
                        </div>
                        <div className="text-[10px] text-emerald-600 font-semibold">
                          Net: Rp {Number(b.totalNetAmountIdr).toLocaleString('id-ID')}
                        </div>
                      </td>

                      <td className="py-3.5 px-3">
                        {b.status === 'BALANCED' ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60">
                            <CheckCircle2 className="h-3 w-3" />
                            <span>BALANCED</span>
                          </span>
                        ) : b.status === 'RESOLVED' ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border border-blue-200 dark:border-blue-800/60">
                            <Check className="h-3 w-3" />
                            <span>RESOLVED</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 border border-rose-200 dark:border-rose-800/60">
                            <AlertTriangle className="h-3 w-3" />
                            <span>SELISIH TERDETEKSI</span>
                          </span>
                        )}
                      </td>

                      <td className="py-3.5 px-3 text-right">
                        <button
                          onClick={() => loadBatchDetail(b.id)}
                          className="px-3.5 py-1.5 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/60 text-xs font-bold transition-colors cursor-pointer"
                        >
                          Buka Audit
                        </button>
                      </td>
                    </tr>
                  ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs">
          <span className="text-slate-400">
            Menampilkan <strong className="text-slate-700 dark:text-slate-200">{batches.length}</strong> dari <strong className="text-slate-700 dark:text-slate-200">{totalItems}</strong> sesi audit
          </span>
          <div className="flex items-center gap-2">
            <button
              disabled={currentPage <= 1 || loading}
              onClick={() => loadBatches(currentPage - 1, statusFilter)}
              className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 font-bold text-slate-600 dark:text-slate-300 disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed"
            >
              Sebelumnya
            </button>
            <span className="px-2 font-mono font-bold text-slate-500">
              {currentPage} / {totalPages || 1}
            </span>
            <button
              disabled={currentPage >= totalPages || loading}
              onClick={() => loadBatches(currentPage + 1, statusFilter)}
              className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 font-bold text-slate-600 dark:text-slate-300 disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed"
            >
              Selanjutnya
            </button>
          </div>
        </div>
      </div>

      {/* Modal Detail Batch & Investigasi Selisih */}
      {selectedBatch && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/75 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="w-full max-w-4xl bg-white dark:bg-[#0E131F] rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2.5">
                  <h3 className="font-black text-slate-900 dark:text-white text-base font-mono">
                    {selectedBatch.batch.batchNumber}
                  </h3>
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase font-mono ${
                    selectedBatch.batch.status === 'BALANCED'
                      ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60'
                      : selectedBatch.batch.status === 'RESOLVED'
                      ? 'bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border border-blue-200 dark:border-blue-800/60'
                      : 'bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 border border-rose-200 dark:border-rose-800/60'
                  }`}>
                    {selectedBatch.batch.status}
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Tanggal Buku Kas: <strong className="text-slate-700 dark:text-slate-300">{selectedBatch.batch.reconDate}</strong> • Gateway: <strong className="text-slate-700 dark:text-slate-300">{selectedBatch.batch.sourceGateway}</strong> • Dijalankan oleh: {selectedBatch.batch.executedBy}
                </p>
                {selectedBatch.batch.notes && (
                  <p className="text-[11px] text-slate-400 italic mt-0.5">
                    Catatan: &ldquo;{selectedBatch.batch.notes}&rdquo;
                  </p>
                )}
              </div>
              <button
                onClick={() => setSelectedBatch(null)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white transition-colors cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* KPI Ringkasan Batch */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-5 bg-slate-50/70 dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-800 text-xs">
              <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800">
                <span className="text-[10px] font-bold uppercase text-slate-400 block">Total Tagihan (Gross)</span>
                <div className="text-base font-black text-slate-900 dark:text-white font-mono mt-0.5">
                  Rp {Number(selectedBatch.batch.totalGrossAmountIdr).toLocaleString('id-ID')}
                </div>
              </div>
              <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800">
                <span className="text-[10px] font-bold uppercase text-amber-500 block">Potongan MDR & PPN</span>
                <div className="text-base font-black text-amber-600 dark:text-amber-400 font-mono mt-0.5">
                  Rp {Number(selectedBatch.batch.totalMdrFeeIdr).toLocaleString('id-ID')}
                </div>
              </div>
              <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800">
                <span className="text-[10px] font-bold uppercase text-emerald-500 block">Kas Bersih (Net)</span>
                <div className="text-base font-black text-emerald-600 dark:text-emerald-400 font-mono mt-0.5">
                  Rp {Number(selectedBatch.batch.totalNetAmountIdr).toLocaleString('id-ID')}
                </div>
              </div>
              <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800">
                <span className="text-[10px] font-bold uppercase text-slate-400 block">Kecocokan</span>
                <div className="text-base font-black text-slate-900 dark:text-white font-mono mt-0.5">
                  {selectedBatch.batch.totalMatchedTransactions} / {selectedBatch.batch.totalGatewayTransactions} Transaksi
                </div>
              </div>
            </div>

            {/* Tab Navigasi Detail */}
            <div className="px-5 pt-3 border-b border-slate-100 dark:border-slate-800 flex items-center gap-4">
              <button
                onClick={() => setDetailTab('MATCHED')}
                className={`pb-2.5 text-xs font-bold transition-all border-b-2 cursor-pointer ${
                  detailTab === 'MATCHED'
                    ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-slate-400 hover:text-slate-600'
                }`}
              >
                Transaksi Cocok ({selectedBatch.matchedInvoices?.length || selectedBatch.batch.totalMatchedTransactions || 0})
              </button>
              <button
                onClick={() => setDetailTab('DISCREPANCIES')}
                className={`pb-2.5 text-xs font-bold transition-all border-b-2 cursor-pointer ${
                  detailTab === 'DISCREPANCIES'
                    ? 'border-rose-600 text-rose-600 dark:text-rose-400'
                    : 'border-transparent text-slate-400 hover:text-slate-600'
                }`}
              >
                Selisih Transaksi ({selectedBatch.discrepancies?.length || 0})
              </button>
            </div>

            {/* Modal Body / Tab Content */}
            <div className="p-5 overflow-y-auto space-y-4 flex-1">
              {detailTab === 'MATCHED' && (
                <div>
                  {!selectedBatch.matchedInvoices || selectedBatch.matchedInvoices.length === 0 ? (
                    <div className="p-8 text-center rounded-2xl bg-slate-50 dark:bg-slate-900 text-xs text-slate-400">
                      Tidak ada detail baris invoice langsung yang terlampir pada batch ini.
                    </div>
                  ) : (
                    <div className="overflow-x-auto border border-slate-100 dark:border-slate-800 rounded-2xl">
                      <table className="w-full text-left text-xs border-collapse">
                        <thead>
                          <tr className="bg-slate-50 dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 text-[10px] font-black uppercase text-slate-400 tracking-wider">
                            <th className="py-2.5 px-3">Nomor Tagihan</th>
                            <th className="py-2.5 px-3">Tagihan Kotor (Gross)</th>
                            <th className="py-2.5 px-3">Biaya MDR Bank</th>
                            <th className="py-2.5 px-3">PPN 11%</th>
                            <th className="py-2.5 px-3">Kas Bersih (Net)</th>
                            <th className="py-2.5 px-3">Waktu Bayar</th>
                            <th className="py-2.5 px-3 text-right">Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-mono text-[11px]">
                          {selectedBatch.matchedInvoices.map((inv: any) => (
                            <tr key={inv.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20">
                              <td className="py-2.5 px-3 font-bold text-slate-900 dark:text-white">
                                {inv.invoiceNumber}
                              </td>
                              <td className="py-2.5 px-3">
                                Rp {Number(inv.grossAmountIdr || inv.amountIdr).toLocaleString('id-ID')}
                              </td>
                              <td className="py-2.5 px-3 text-amber-600">
                                Rp {Number(inv.mdrFeeIdr || 0).toLocaleString('id-ID')}
                              </td>
                              <td className="py-2.5 px-3 text-amber-600">
                                Rp {Number(inv.vatFeeIdr || 0).toLocaleString('id-ID')}
                              </td>
                              <td className="py-2.5 px-3 text-emerald-600 font-bold">
                                Rp {Number(inv.netAmountIdr || inv.amountIdr).toLocaleString('id-ID')}
                              </td>
                              <td className="py-2.5 px-3 text-slate-400 text-[10px]">
                                {inv.paidAt ? new Date(inv.paidAt).toLocaleString('id-ID') : '-'}
                              </td>
                              <td className="py-2.5 px-3 text-right">
                                <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                                  {inv.paymentStatus}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}

              {detailTab === 'DISCREPANCIES' && (
                <div>
                  {selectedBatch.discrepancies?.length === 0 ? (
                    <div className="p-8 text-center rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-800 dark:text-emerald-300 font-bold flex flex-col items-center gap-2">
                      <CheckCircle2 className="h-6 w-6 text-emerald-600" />
                      <span>Nihil Selisih: Seluruh transaksi cocok 100% dan seimbang secara akuntansi.</span>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {selectedBatch.discrepancies.map((d: any) => (
                        <div
                          key={d.id}
                          className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2 text-xs"
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-mono font-bold text-slate-900 dark:text-white">
                              Order ID: {d.gatewayOrderId}
                            </span>
                            <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                              d.resolutionStatus === 'UNRESOLVED' ? 'bg-rose-100 text-rose-800' : 'bg-emerald-100 text-emerald-800'
                            }`}>
                              {d.resolutionStatus}
                            </span>
                          </div>
                          <div className="grid grid-cols-2 gap-2 text-slate-600 dark:text-slate-400">
                            <div>Tipe Selisih: <strong className="text-slate-800 dark:text-slate-200">{d.discrepancyType}</strong></div>
                            <div>Selisih: <strong className="text-rose-600">Rp {Number(d.discrepancyAmountIdr).toLocaleString('id-ID')}</strong></div>
                          </div>
                          <p className="text-[11px] text-slate-500 italic bg-white dark:bg-slate-800 p-2 rounded-lg border border-slate-200/60 dark:border-slate-700">
                            {d.resolutionNotes || 'Belum ada catatan investigasi.'}
                          </p>
                          {d.resolutionStatus === 'UNRESOLVED' && (
                            <button
                              onClick={() => setSelectedDiscrepancy(d)}
                              className="mt-1 px-3 py-1.5 rounded-lg bg-blue-600 text-white font-bold text-xs hover:bg-blue-700 transition-colors cursor-pointer"
                            >
                              Selesaikan Selisih
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal Tarik Otomatis Midtrans API */}
      {showApiModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="w-full max-w-lg bg-white dark:bg-[#0E131F] rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="h-9 w-9 rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400 flex items-center justify-center font-black">
                  <RefreshCw className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">
                    Audit Otomatis via Midtrans API
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Tarik dan kroscek mutasi settlement langsung dari Midtrans Core API
                  </p>
                </div>
              </div>
              <button onClick={() => setShowApiModal(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={submitApiReconciliation} className="space-y-4 text-xs">
              <div className="space-y-2">
                <label className="font-bold text-slate-700 dark:text-slate-300 block">
                  Pilih Tanggal Audit Mutasi:
                </label>
                <input
                  type="date"
                  required
                  value={apiReconDate}
                  onChange={(e) => setApiReconDate(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white font-mono"
                />

                {/* Shortcut Presets */}
                <div className="flex flex-wrap items-center gap-1.5 pt-1">
                  <span className="text-[10px] text-slate-400 font-medium">Pilihan Cepat:</span>
                  <button
                    type="button"
                    onClick={() => setApiReconDate('2026-09-30')}
                    className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                      apiReconDate === '2026-09-30'
                        ? 'bg-blue-600 text-white'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                    }`}
                  >
                    30 Sep 2026 (Transaksi Terakhir)
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const d = new Date();
                      d.setDate(d.getDate() - 1);
                      setApiReconDate(d.toISOString().slice(0, 10));
                    }}
                    className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 cursor-pointer"
                  >
                    Kemarin (H-1)
                  </button>
                  <button
                    type="button"
                    onClick={() => setApiReconDate(new Date().toISOString().slice(0, 10))}
                    className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 cursor-pointer"
                  >
                    Hari Ini
                  </button>
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700 dark:text-slate-300 block">
                  Catatan Justifikasi Audit (Opsional):
                </label>
                <input
                  type="text"
                  placeholder="Contoh: Audit reguler mutasi kas akhir bulan September..."
                  value={apiNotes}
                  onChange={(e) => setApiNotes(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white"
                />
              </div>

              {/* Kartu Informasi Transparansi Rekonsiliasi */}
              <div className="p-3.5 rounded-2xl bg-blue-50/70 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900/40 space-y-1.5">
                <div className="font-bold text-blue-900 dark:text-blue-300 flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4 text-blue-600 shrink-0" />
                  <span>Kroscek Finansial Otomatis 5-Arah</span>
                </div>
                <p className="text-[11px] text-blue-700/80 dark:text-blue-300/70 leading-relaxed">
                  Sistem akan mengkueri status resmi setiap tagihan ke Midtrans Core API, menghitung potongan MDR & PPN 11%, serta memverifikasi kecocokan status lunas terhadap pembukuan POLARIS.
                </p>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowApiModal(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 font-bold cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={triggeringApi}
                  className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold transition-all shadow-xs cursor-pointer"
                >
                  {triggeringApi ? (
                    <>
                      <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                      <span>Menghubungi Midtrans...</span>
                    </>
                  ) : (
                    <>
                      <PlayCircle className="h-3.5 w-3.5" />
                      <span>Jalankan Audit Midtrans</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Upload CSV Mutasi */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="w-full max-w-lg bg-white dark:bg-[#0E131F] rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-lg bg-blue-50 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400 flex items-center justify-center">
                  <UploadCloud className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">
                    Unggah File CSV Mutasi Midtrans
                  </h3>
                  <p className="text-[11px] text-slate-400">Pilih file .csv hasil ekspor dari portal Midtrans MAP</p>
                </div>
              </div>
              <button onClick={() => setShowUploadModal(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleUploadCsv} className="space-y-4 text-xs">
              <div className="flex items-center justify-between gap-4">
                <div className="flex-1">
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Tanggal Laporan Mutasi:
                  </label>
                  <input
                    type="date"
                    required
                    value={reconDateInput}
                    onChange={(e) => setReconDateInput(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-400 block mb-1 invisible">
                    Sample
                  </label>
                  <button
                    type="button"
                    onClick={handleDownloadSampleCsv}
                    className="inline-flex items-center gap-1.5 px-3 py-2.5 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/60 text-slate-600 dark:text-slate-400 text-xs font-semibold cursor-pointer"
                    title="Unduh contoh file CSV resmi"
                  >
                    <Download className="h-3.5 w-3.5" />
                    <span>Contoh CSV</span>
                  </button>
                </div>
              </div>

              {/* Area Drag-and-Drop File Picker */}
              <div>
                <input
                  type="file"
                  ref={fileInputRef}
                  accept=".csv,text/csv"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0] || null;
                    handleFileChange(file);
                  }}
                />

                {!selectedFile ? (
                  <div
                    onDragOver={(e) => {
                      e.preventDefault();
                      setIsDragging(true);
                    }}
                    onDragLeave={() => setIsDragging(false)}
                    onDrop={(e) => {
                      e.preventDefault();
                      setIsDragging(false);
                      const file = e.dataTransfer.files?.[0] || null;
                      handleFileChange(file);
                    }}
                    onClick={() => fileInputRef.current?.click()}
                    className={`border-2 border-dashed rounded-2xl p-6 text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-2 ${
                      isDragging
                        ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-950/20'
                        : 'border-slate-200 dark:border-slate-800 hover:border-blue-400 dark:hover:border-blue-500 bg-slate-50/50 dark:bg-slate-900/50'
                    }`}
                  >
                    <div className="h-10 w-10 rounded-xl bg-blue-100/80 dark:bg-blue-950 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                      <FileSpreadsheet className="h-5 w-5" />
                    </div>
                    <div>
                      <span className="font-bold text-slate-800 dark:text-slate-200">
                        Klik untuk cari file .csv
                      </span>{' '}
                      <span className="text-slate-400">atau seret file ke sini</span>
                    </div>
                    <span className="text-[10px] text-slate-400">
                      Mendukung format settlement resmi Midtrans (Order ID, Gross, Status, Time)
                    </span>
                  </div>
                ) : (
                  <div className="p-3.5 rounded-2xl bg-blue-50/80 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 flex items-center justify-between">
                    <div className="flex items-center gap-2.5 overflow-hidden">
                      <div className="h-9 w-9 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0">
                        <FileSpreadsheet className="h-5 w-5" />
                      </div>
                      <div className="truncate">
                        <div className="font-bold text-xs text-slate-900 dark:text-white truncate">
                          {selectedFile.name}
                        </div>
                        <div className="text-[10px] text-slate-500 dark:text-slate-400">
                          {(selectedFile.size / 1024).toFixed(1)} KB • {csvContent.split('\n').filter(Boolean).length - 1} baris transaksi terdeteksi
                        </div>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleFileChange(null)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
                      title="Ganti file"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                )}
              </div>

              {/* Opsi Toggle Pratinjau Teks CSV */}
              <div>
                <button
                  type="button"
                  onClick={() => setShowManualTextarea(!showManualTextarea)}
                  className="text-[11px] font-bold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer flex items-center gap-1"
                >
                  <FileText className="h-3 w-3" />
                  <span>{showManualTextarea ? 'Sembunyikan editor teks' : 'Lihat / Edit teks CSV secara manual'}</span>
                </button>

                {showManualTextarea && (
                  <div className="mt-2 space-y-1">
                    <textarea
                      rows={5}
                      placeholder="Order ID,Gross Amount,Payment Type,Transaction Status,Settlement Time..."
                      value={csvContent}
                      onChange={(e) => setCsvContent(e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 font-mono text-[11px] bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white"
                    />
                  </div>
                )}
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowUploadModal(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 font-bold cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={uploading || !csvContent.trim()}
                  className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold transition-all shadow-xs cursor-pointer"
                >
                  {uploading ? (
                    <>
                      <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                      <span>Memproses...</span>
                    </>
                  ) : (
                    <>
                      <Check className="h-3.5 w-3.5" />
                      <span>Proses Rekonsiliasi</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Penyelesaian Selisih (Manual Resolve) */}
      {selectedDiscrepancy && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-white dark:bg-[#0E131F] rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl p-6 space-y-4">
            <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">
              Resolusi Selisih Transaksi: {selectedDiscrepancy.gatewayOrderId}
            </h3>
            <p className="text-xs text-slate-500">
              Tipe: {selectedDiscrepancy.discrepancyType} • Selisih: Rp {Number(selectedDiscrepancy.discrepancyAmountIdr).toLocaleString('id-ID')}
            </p>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Catatan Justifikasi Audit:</label>
              <textarea
                rows={3}
                required
                placeholder="Contoh: Pembayaran telah dikonfirmasi manual via bukti mutasi rekening koran..."
                value={resolveNotes}
                onChange={(e) => setResolveNotes(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-xs bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setSelectedDiscrepancy(null)}
                className="px-3.5 py-2 rounded-xl text-slate-600 dark:text-slate-300 text-xs font-bold hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                disabled={resolving || !resolveNotes.trim()}
                onClick={() => handleResolveDiscrepancy('MANUALLY_RESOLVED')}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs cursor-pointer"
              >
                {resolving ? 'Menyimpan...' : 'Tandai Selesai (Manually Resolved)'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SweetAlert Style Feedback Modal (No More "localhost says") */}
      {feedback && feedback.show && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-sm bg-white dark:bg-[#0E131F] rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl p-6 text-center space-y-4 animate-in zoom-in-95 duration-200">
            {/* Animated Icon Container */}
            <div className="flex justify-center pt-2">
              {feedback.type === 'success' ? (
                <div className="h-16 w-16 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border-2 border-emerald-500/30 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shadow-lg shadow-emerald-500/10">
                  <CheckCircle2 className="h-9 w-9 stroke-[2.5]" />
                </div>
              ) : feedback.type === 'error' ? (
                <div className="h-16 w-16 rounded-full bg-rose-50 dark:bg-rose-950/60 border-2 border-rose-500/30 text-rose-600 dark:text-rose-400 flex items-center justify-center shadow-lg shadow-rose-500/10">
                  <ShieldAlert className="h-9 w-9 stroke-[2.5]" />
                </div>
              ) : (
                <div className="h-16 w-16 rounded-full bg-amber-50 dark:bg-amber-950/60 border-2 border-amber-500/30 text-amber-600 dark:text-amber-400 flex items-center justify-center shadow-lg shadow-amber-500/10">
                  <AlertTriangle className="h-9 w-9 stroke-[2.5]" />
                </div>
              )}
            </div>

            {/* Title & Badge & Message */}
            <div className="space-y-1.5">
              {feedback.badge && (
                <span className="inline-block px-3 py-0.5 rounded-full text-[10px] font-black uppercase font-mono tracking-wider bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 mb-1">
                  Status: {feedback.badge}
                </span>
              )}
              <h3 className="text-base font-black text-slate-900 dark:text-white tracking-tight">
                {feedback.title}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                {feedback.message}
              </p>
            </div>

            {/* Action Button */}
            <div className="pt-2">
              <button
                type="button"
                onClick={() => setFeedback({ ...feedback, show: false })}
                className="w-full py-2.5 px-4 rounded-xl font-bold text-xs text-white shadow-sm transition-all cursor-pointer bg-blue-600 hover:bg-blue-700 active:scale-98"
              >
                Mengerti & Lanjutkan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
