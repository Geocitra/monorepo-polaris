'use client';

import React, { useEffect, useState, useRef } from 'react';
import {
  Receipt,
  CheckCircle2,
  AlertTriangle,
  UploadCloud,
  Clock,
  DollarSign,
  TrendingDown,
  Search,
  Check,
  RefreshCw,
} from 'lucide-react';
import { AdminApiClient } from '@/lib/api-client';
import {
  AuditApiModal,
  UploadCsvModal,
  ResolveDiscrepancyModal,
  ReconciliationFeedbackModal,
  BatchDetailModal,
} from '@/components/superadmin/reconciliation';

export default function SuperadminReconciliationPage() {
  // Main Tab State: TRANSACTIONS (Buku Kas Masuk Klien Dewan) vs BATCHES (Sesi Audit Gateway)
  const [mainTab, setMainTab] = useState<'TRANSACTIONS' | 'BATCHES'>('TRANSACTIONS');

  // State Transaksi Pembayaran Dewan
  const [transactions, setTransactions] = useState<any[]>([]);
  const [transLoading, setTransLoading] = useState(true);
  const [transPage, setTransPage] = useState(1);
  const [transTotalPages, setTransTotalPages] = useState(1);
  const [transTotalItems, setTransTotalItems] = useState(0);
  const [transStatus, setTransStatus] = useState('ALL');
  const [transSearch, setTransSearch] = useState('');

  // State Batch Rekonsiliasi
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

  // State Filter & Pagination Batch
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
    loadTransactions(1, transStatus, transSearch);
    loadBatches(1, statusFilter);
  }, []);

  const loadTransactions = async (page = transPage, status = transStatus, search = transSearch) => {
    try {
      setTransLoading(true);
      const queryParams = new URLSearchParams();
      queryParams.set('page', String(page));
      queryParams.set('limit', '10');
      if (status && status !== 'ALL') {
        queryParams.set('status', status);
      }
      if (search && search.trim()) {
        queryParams.set('search', search.trim());
      }
      const res = await AdminApiClient.request<any>(`/admin/reconciliation/transactions?${queryParams.toString()}`);
      setTransactions(res.items || []);
      if (res.pagination) {
        setTransPage(res.pagination.page);
        setTransTotalPages(res.pagination.totalPages);
        setTransTotalItems(res.pagination.totalItems);
      }
    } catch (err) {
      console.error('Gagal memuat transaksi kas dewan:', err);
    } finally {
      setTransLoading(false);
    }
  };

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
      const text = e.target?.result as string;
      setCsvContent(text || '');
    };
    reader.readAsText(file);
  };

  const handleDownloadSampleCsv = () => {
    const sample = `Order ID,Gross Amount,Payment Type,Transaction Status,Settlement Time,MDR Fee,VAT Fee\nINV-20260930-1001,7000000,credit_card,settlement,2026-09-30 14:20:00,8000,880\nINV-20260930-1002,1500000,bank_transfer,settlement,2026-09-30 15:10:00,4000,440`;
    const blob = new Blob([sample], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'sample_midtrans_settlement.csv');
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
      loadTransactions();
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
      loadTransactions();
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
      loadTransactions();
    } catch (err: any) {
      notify('error', 'Gagal Memperbarui Status', err.message || 'Gagal memperbarui status selisih.');
    } finally {
      setResolving(false);
    }
  };

  // Kalkulasi Ringkasan KPI Finansial
  const totalGrossAll = transactions.length > 0
    ? transactions.reduce((acc, t) => acc + (Number(t.grossAmountIdr) || Number(t.amountIdr) || 0), 0)
    : batches.reduce((acc, b) => acc + (Number(b.totalGrossAmountIdr) || 0), 0);
  const totalMdrAll = transactions.length > 0
    ? transactions.reduce((acc, t) => acc + (Number(t.mdrFeeIdr) || 0) + (Number(t.vatFeeIdr) || 0), 0)
    : batches.reduce((acc, b) => acc + (Number(b.totalMdrFeeIdr) || 0), 0);
  const totalNetAll = transactions.length > 0
    ? transactions.reduce((acc, t) => acc + (Number(t.netAmountIdr) || Number(t.amountIdr) || 0), 0)
    : batches.reduce((acc, b) => acc + (Number(b.totalNetAmountIdr) || 0), 0);
  const activeDiscrepanciesCount = batches.reduce((acc, b) => acc + (Number(b.totalDiscrepancies) || 0), 0);

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
              Audit Rekonsiliasi Kas Midtrans &amp; Pembukuan
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
            <span>Biaya MDR &amp; PPN 11%</span>
          </span>
          <div className="text-xl sm:text-2xl font-black text-amber-600 dark:text-amber-400 font-mono">
            Rp {totalMdrAll.toLocaleString('id-ID')}
          </div>
          <span className="text-[10px] text-slate-400 block font-medium">Potongan channel bank/gateway</span>
        </div>

        <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#0B0F17] border border-slate-200 dark:border-slate-800 shadow-xs space-y-1.5">
          <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
            <DollarSign className="h-3.5 w-3.5" />
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

      {/* PRIMARY TAB SWITCHER: BUKU KAS (TRANSAKSI KLIEN) vs BATCH AUDIT */}
      <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-900 rounded-2xl w-fit border border-slate-200/80 dark:border-slate-800">
        <button
          type="button"
          onClick={() => setMainTab('TRANSACTIONS')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black transition-all cursor-pointer ${mainTab === 'TRANSACTIONS'
              ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs'
              : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
        >
          <DollarSign className="w-4 h-4 text-emerald-500" />
          <span>Buku Kas Pembayaran Klien Dewan</span>
          <span className="px-1.5 py-0.2 rounded-md bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 font-mono text-[10px]">
            {transTotalItems || transactions.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setMainTab('BATCHES')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black transition-all cursor-pointer ${mainTab === 'BATCHES'
              ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs'
              : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
        >
          <Receipt className="w-4 h-4 text-blue-500" />
          <span>Sesi Batch Audit Rekonsiliasi</span>
          <span className="px-1.5 py-0.2 rounded-md bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 font-mono text-[10px]">
            {totalItems || batches.length}
          </span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* VIEW 1: BUKU KAS TRANSAKSI MASUK KLIEN DEWAN (WHO PAID, HOW MUCH, TIER)   */}
      {/* ========================================================================= */}
      {mainTab === 'TRANSACTIONS' && (
        <div className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-[#0B0F17] border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                <span>Daftar Pembayaran Klien Dewan (Buku Kas Masuk)</span>
              </h2>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Riwayat pembayaran riil dari anggota legislatif dengan rincian nama, fraksi partai, nomor tagihan, dan potongan MDR Midtrans.
              </p>
            </div>

            {/* Filter Status Pembayaran */}
            <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-900 rounded-xl">
              {[
                { id: 'ALL', label: 'Semua Status' },
                { id: 'SETTLEMENT', label: 'Settlement / Lunas' },
                { id: 'PENDING', label: 'Menunggu' },
                { id: 'EXPIRED', label: 'Kedaluwarsa' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => {
                    setTransStatus(tab.id);
                    loadTransactions(1, tab.id, transSearch);
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${transStatus === tab.id
                      ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-2xs'
                      : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
                    }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Search Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
            <div className="relative w-full sm:w-80">
              <Search className="h-3.5 w-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Cari Nama Anggota, Email, atau No. Invoice..."
                value={transSearch}
                onChange={(e) => {
                  setTransSearch(e.target.value);
                  loadTransactions(1, transStatus, e.target.value);
                }}
                className="w-full pl-9 pr-3 py-2 rounded-xl text-xs border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white placeholder:text-slate-400"
              />
            </div>

            <span className="text-xs text-slate-400 font-semibold">
              {transactions.length} Transaksi Terdata
            </span>
          </div>

          {/* Table Transaksi Masuk */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-[10px] font-black uppercase text-slate-400 tracking-wider">
                  <th className="pb-3 px-3">Klien Dewan Pembayar</th>
                  <th className="pb-3 px-3">Nomor Tagihan &amp; Paket</th>
                  <th className="pb-3 px-3">Tagihan Kotor (Gross)</th>
                  <th className="pb-3 px-3">MDR &amp; PPN</th>
                  <th className="pb-3 px-3">Kas Bersih (Net)</th>
                  <th className="pb-3 px-3">Waktu Bayar</th>
                  <th className="pb-3 px-3">Status Gateway</th>
                  <th className="pb-3 px-3 text-right">Audit Rekon</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium">
                {transLoading ? (
                  <tr>
                    <td colSpan={8} className="py-10 text-center text-slate-400 text-xs">
                      Memuat daftar pembayaran klien dewan...
                    </td>
                  </tr>
                ) : transactions.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-10 text-center text-slate-400 text-xs italic">
                      Belum ada transaksi pembayaran klien dewan yang tercatat.
                    </td>
                  </tr>
                ) : (
                  transactions.map((t) => (
                    <tr key={t.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/30 transition-colors">
                      {/* 1. KLIEN DEWAN PEMBAYAR */}
                      <td className="py-3 px-3">
                        <div className="font-extrabold text-slate-900 dark:text-white text-xs">
                          {t.tenantName || 'Pelanggan Non-Sistem'}
                        </div>
                        <div className="flex items-center gap-1.5 flex-wrap mt-0.5">
                          <span className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">
                            {t.tenantEmail || '-'}
                          </span>
                          {t.partyAffiliation && (
                            <span className="px-1.5 py-0.2 rounded-full text-[9px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                              {t.partyAffiliation}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* 2. NOMOR TAGIHAN & PAKET */}
                      <td className="py-3 px-3 font-mono">
                        <div className="font-bold text-slate-900 dark:text-white text-[11px]">
                          {t.invoiceNumber}
                        </div>
                        {t.planTier && (
                          <span className="inline-block px-1.5 py-0.2 rounded text-[9px] font-black uppercase bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border border-blue-200 dark:border-blue-800 mt-0.5">
                            PAKET {t.planTier}
                          </span>
                        )}
                      </td>

                      {/* 3. TAGIHAN KOTOR (GROSS) */}
                      <td className="py-3 px-3 font-mono">
                        <div className="font-bold text-slate-900 dark:text-white">
                          Rp {Math.round(Number(t.grossAmountIdr || t.amountIdr || 0)).toLocaleString('id-ID')}
                        </div>
                      </td>

                      {/* 4. MDR & PPN */}
                      <td className="py-3 px-3 font-mono text-amber-600 dark:text-amber-400">
                        <div>
                          Rp {Math.round((Number(t.mdrFeeIdr) || 0) + (Number(t.vatFeeIdr) || 0)).toLocaleString('id-ID')}
                        </div>
                        <span className="text-[9px] text-slate-400">MDR + PPN 11%</span>
                      </td>

                      {/* 5. KAS BERSIH (NET) */}
                      <td className="py-3 px-3 font-mono font-bold text-emerald-600 dark:text-emerald-400">
                        <div>
                          Rp {Math.round(Number(t.netAmountIdr || t.amountIdr || 0)).toLocaleString('id-ID')}
                        </div>
                      </td>

                      {/* 6. WAKTU BAYAR */}
                      <td className="py-3 px-3 text-[10px] text-slate-500 dark:text-slate-400 font-mono">
                        {t.paidAt ? new Date(t.paidAt).toLocaleString('id-ID') : '-'}
                      </td>

                      {/* 7. STATUS GATEWAY */}
                      <td className="py-3 px-3">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase font-mono ${t.paymentStatus === 'SETTLEMENT' || t.paymentStatus === 'PAID'
                              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                              : t.paymentStatus === 'PENDING'
                                ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                                : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                            }`}
                        >
                          {t.paymentStatus}
                        </span>
                      </td>

                      {/* 8. STATUS AUDIT REKONSILIASI */}
                      <td className="py-3 px-3 text-right">
                        {t.reconciliationStatus === 'MATCHED' ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-black uppercase bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                            <CheckCircle2 className="h-2.5 w-2.5 text-emerald-500" />
                            <span>Cocok</span>
                          </span>
                        ) : t.reconciliationStatus === 'DISCREPANCY' ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-black uppercase bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 border border-rose-200 dark:border-rose-800">
                            <AlertTriangle className="h-2.5 w-2.5 text-rose-500" />
                            <span>Selisih</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                            <span>Belum Diaudit</span>
                          </span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Bar Transaksi */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs">
            <span className="text-slate-400">
              Menampilkan <strong className="text-slate-700 dark:text-slate-200">{transactions.length}</strong> dari <strong className="text-slate-700 dark:text-slate-200">{transTotalItems}</strong> transaksi kas
            </span>
            <div className="flex items-center gap-2">
              <button
                disabled={transPage <= 1 || transLoading}
                onClick={() => loadTransactions(transPage - 1, transStatus, transSearch)}
                className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 font-bold text-slate-600 dark:text-slate-300 disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed"
              >
                Sebelumnya
              </button>
              <span className="px-2 font-mono font-bold text-slate-500">
                {transPage} / {transTotalPages || 1}
              </span>
              <button
                disabled={transPage >= transTotalPages || transLoading}
                onClick={() => loadTransactions(transPage + 1, transStatus, transSearch)}
                className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 font-bold text-slate-600 dark:text-slate-300 disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed"
              >
                Selanjutnya
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* VIEW 2: RIWAYAT BATCH AUDIT REKONSILIASI MIDTRANS                         */}
      {/* ========================================================================= */}
      {mainTab === 'BATCHES' && (
        <div className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-[#0B0F17] border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider">
                Riwayat Sesi Batch Audit Rekonsiliasi
              </h2>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Daftar sesi kroscek kas harian dan resolusi selisih gateway Midtrans
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
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${statusFilter === tab.id
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
                  <th className="pb-3 px-3">Batch ID &amp; Tanggal</th>
                  <th className="pb-3 px-3">Sumber Mutasi</th>
                  <th className="pb-3 px-3">Transaksi Cocok</th>
                  <th className="pb-3 px-3">Gross / Kas Bersih (Net)</th>
                  <th className="pb-3 px-3">Status Audit</th>
                  <th className="pb-3 px-3 text-right">Rincian</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="py-10 text-center text-slate-400 text-xs">
                      Memuat daftar batch audit rekonsiliasi...
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

          {/* Pagination Bar Batch */}
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
      )}

      {/* Modal Detail Batch & Investigasi Selisih */}
      <BatchDetailModal
        batchData={selectedBatch}
        onClose={() => setSelectedBatch(null)}
        detailTab={detailTab}
        onDetailTabChange={setDetailTab}
        onSelectDiscrepancy={(d) => setSelectedDiscrepancy(d)}
      />

      {/* Modal Tarik Otomatis Midtrans API */}
      <AuditApiModal
        isOpen={showApiModal}
        onClose={() => setShowApiModal(false)}
        apiReconDate={apiReconDate}
        onApiReconDateChange={setApiReconDate}
        apiNotes={apiNotes}
        onApiNotesChange={setApiNotes}
        triggeringApi={triggeringApi}
        onSubmit={submitApiReconciliation}
      />

      {/* Modal Upload CSV Mutasi */}
      <UploadCsvModal
        isOpen={showUploadModal}
        onClose={() => setShowUploadModal(false)}
        reconDateInput={reconDateInput}
        onReconDateChange={setReconDateInput}
        selectedFile={selectedFile}
        onFileChange={handleFileChange}
        csvContent={csvContent}
        onCsvContentChange={setCsvContent}
        showManualTextarea={showManualTextarea}
        onToggleManualTextarea={() => setShowManualTextarea(!showManualTextarea)}
        isDragging={isDragging}
        setIsDragging={setIsDragging}
        uploading={uploading}
        onSubmit={handleUploadCsv}
        onDownloadSampleCsv={handleDownloadSampleCsv}
        fileInputRef={fileInputRef}
      />

      {/* Modal Penyelesaian Selisih (Manual Resolve) */}
      <ResolveDiscrepancyModal
        discrepancy={selectedDiscrepancy}
        onClose={() => setSelectedDiscrepancy(null)}
        onResolve={handleResolveDiscrepancy}
        resolveNotes={resolveNotes}
        onNotesChange={setResolveNotes}
        resolving={resolving}
      />

      {/* SweetAlert Style Feedback Modal */}
      <ReconciliationFeedbackModal
        feedback={feedback}
        onClose={() => setFeedback(feedback ? { ...feedback, show: false } : null)}
      />
    </div>
  );
}
