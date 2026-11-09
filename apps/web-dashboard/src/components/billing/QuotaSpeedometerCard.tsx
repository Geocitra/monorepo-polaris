'use client';

import React, { useState, useEffect } from 'react';
import {
  Gauge,
  Zap,
  Calendar,
  Clock,
  History,
  AlertCircle,
  CheckCircle2,
  HelpCircle,
  X,
  Loader2,
  ArrowDownRight,
  ArrowUpRight,
} from 'lucide-react';
import { ApiClient } from '@/lib/api-client';
import { formatDateIndonesian } from '@/lib/utils';

export interface QuotaSpeedometerCardProps {
  totalQuotaAllocated?: number;
  remainingQuota?: number;
  weeklyAllowanceLimit?: number;
  weeklyUsed?: number;
  currentPeriodEnd?: string | null;
  isSubActive: boolean;
  openaiTotalTokens?: number;
  openaiImagesUsed?: number;
  geminiTotalTokens?: number;
  geminiImagesUsed?: number;
  onTopUpClick?: () => void;
}

interface QuotaTransaction {
  id: string;
  channel?: string;
  transactionType: string;
  amountDelta: number;
  balanceAfter: number;
  referenceCode: string | null;
  notes: string | null;
  createdAt: string;
}

export function QuotaSpeedometerCard({
  totalQuotaAllocated = 12,
  remainingQuota = 12,
  weeklyAllowanceLimit = 3,
  weeklyUsed = 0,
  currentPeriodEnd,
  isSubActive,
  openaiTotalTokens = 0,
  openaiImagesUsed = 0,
  geminiTotalTokens = 0,
  geminiImagesUsed = 0,
  onTopUpClick,
}: QuotaSpeedometerCardProps) {
  const [historyModalOpen, setHistoryModalOpen] = useState(false);
  const [transactions, setTransactions] = useState<QuotaTransaction[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  const percentRemaining =
    totalQuotaAllocated > 0
      ? Math.max(0, Math.min(100, Math.round((remainingQuota / totalQuotaAllocated) * 100)))
      : 0;

  let daysLeft: number | null = null;
  if (currentPeriodEnd && isSubActive) {
    const endMs = new Date(currentPeriodEnd).getTime();
    const nowMs = Date.now();
    daysLeft = Math.max(0, Math.ceil((endMs - nowMs) / (1000 * 60 * 60 * 24)));
  }

  const isExpired = daysLeft !== null ? daysLeft <= 0 : !isSubActive;

  const loadHistory = async () => {
    setHistoryModalOpen(true);
    setHistoryLoading(true);
    try {
      const res = await ApiClient.request<QuotaTransaction[]>('/billing/quota-transactions');
      setTransactions(Array.isArray(res) ? res : []);
    } catch (err) {
      console.error('Gagal mengambil riwayat transaksi kuota:', err);
    } finally {
      setHistoryLoading(false);
    }
  };

  const getTransactionTypeLabel = (type: string) => {
    switch (type) {
      case 'PACKAGE_PURCHASE':
        return { label: 'Aktivasi / Beli Paket', cls: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/50 border-emerald-200 dark:border-emerald-800' };
      case 'REGULAR_CONSUME':
        return { label: 'Request Reguler (x1)', cls: 'text-blue-600 bg-blue-50 dark:bg-blue-950/50 border-blue-200 dark:border-blue-800' };
      case 'URGENT_SURGE_CONSUME':
        return { label: 'Darurat Over-Quota (x2)', cls: 'text-amber-600 bg-amber-50 dark:bg-amber-950/50 border-amber-200 dark:border-amber-800' };
      case 'REFUND_CANCELLED':
        return { label: 'Refund Pembatalan Tiket', cls: 'text-indigo-600 bg-indigo-50 dark:bg-indigo-950/50 border-indigo-200 dark:border-indigo-800' };
      case 'REFUND_REJECTED':
        return { label: 'Refund Penolakan Redaksi', cls: 'text-purple-600 bg-purple-50 dark:bg-purple-950/50 border-purple-200 dark:border-purple-800' };
      case 'EXPIRED_FLUSH':
        return { label: 'Hangus / Masa Aktif Habis', cls: 'text-slate-500 bg-slate-50 dark:bg-slate-900 border-slate-200' };
      case 'ADMIN_ADJUSTMENT':
        return { label: 'Koreksi Admin Superadmin', cls: 'text-cyan-600 bg-cyan-50 dark:bg-cyan-950/50 border-cyan-200' };
      default:
        return { label: type, cls: 'text-slate-600 bg-slate-100 border-slate-200' };
    }
  };

  return (
    <div className="bg-white dark:bg-[#0E131F] border border-slate-200/90 dark:border-slate-800 rounded-3xl p-5 sm:p-7 shadow-xs space-y-6">
      {/* 1. HEADER SECTION */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800/80 pb-5">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-200/60 dark:border-indigo-800 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0 shadow-xs">
            <Gauge className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-base font-extrabold text-slate-900 dark:text-white leading-tight">
                Speedometer Kuota Request Materi
              </h2>
              <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                Model Kuota Internet
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">
              Kuota terpadu untuk pengajuan via WhatsApp Bot maupun pembuatan langsung di Web Studio (Artikel, Infografis, & Poster).
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={loadHistory}
          className="self-start sm:self-auto flex items-center gap-2 px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/60 text-xs font-bold text-slate-700 dark:text-slate-200 transition cursor-pointer"
        >
          <History className="w-4 h-4 text-slate-400" />
          <span>Buku Besar &amp; Riwayat Kuota</span>
        </button>
      </div>

      {/* 2. THREE-CARD GRID METRICS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 items-stretch">
        {/* CARD A: SALDO TOTAL KUOTA */}
        <div className="rounded-2xl p-4 sm:p-5 bg-gradient-to-br from-indigo-50/50 via-white to-indigo-50/30 dark:from-slate-900/90 dark:via-[#0E131F] dark:to-slate-900/50 border border-indigo-100 dark:border-indigo-950 flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-indigo-500" />
              <span>Saldo Kuota Tersisa</span>
            </span>
            <span
              className={`text-[10px] font-black px-2 py-0.5 rounded-full border ${
                remainingQuota > 4
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800'
                  : remainingQuota > 1
                  ? 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800'
                  : 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-800'
              }`}
            >
              {percentRemaining}% Tersedia
            </span>
          </div>

          <div>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-black text-slate-900 dark:text-white font-mono tracking-tight">
                {remainingQuota}
              </span>
              <span className="text-sm font-bold text-slate-400">
                / {totalQuotaAllocated} Request Total
              </span>
            </div>

            {/* Linear Progress Meter */}
            <div className="mt-3 w-full bg-slate-100 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  remainingQuota > 4
                    ? 'bg-gradient-to-r from-indigo-500 to-emerald-500'
                    : remainingQuota > 1
                    ? 'bg-gradient-to-r from-amber-500 to-amber-600'
                    : 'bg-gradient-to-r from-rose-500 to-rose-600'
                }`}
                style={{ width: `${percentRemaining}%` }}
              />
            </div>
          </div>

          <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed pt-1 border-t border-slate-100 dark:border-slate-800">
            {remainingQuota === 0
              ? 'Saldo kuota Anda telah habis. Silakan beli paket baru untuk terus mengirim bahan.'
              : '1 Request mencakup 1 naskah kajian, poster visual, dan caption sosial lengkap.'}
          </p>
        </div>

        {/* CARD B: PACING MINGGUAN & KONSEKUENSI OVER-QUOTA */}
        <div className="rounded-2xl p-4 sm:p-5 bg-white dark:bg-slate-900/50 border border-slate-200/90 dark:border-slate-800 flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-blue-500" />
              <span>Jatah Mingguan (Pacing)</span>
            </span>
            <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
              Maks {weeklyAllowanceLimit}x / Minggu
            </span>
          </div>

          <div>
            <div className="text-2xl font-black text-slate-900 dark:text-white font-mono">
              {weeklyUsed} <span className="text-sm font-bold text-slate-400">/ {weeklyAllowanceLimit} Terpakai</span>
            </div>
            <div className="text-[11px] font-bold text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-1.5">
              <Clock className="w-3 h-3 text-indigo-500 shrink-0" />
              <span>Reset otomatis setiap Senin 00:00 WIB</span>
            </div>
          </div>

          {/* Konsekuensi Urgent Card */}
          <div className="p-2.5 rounded-xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200/70 dark:border-amber-800 text-[11px] text-amber-900 dark:text-amber-200 leading-snug space-y-1">
            <div className="font-extrabold flex items-center gap-1">
              <AlertCircle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
              <span>Aturan Urgent Over-Quota:</span>
            </div>
            <p className="text-[10.5px] text-amber-800/90 dark:text-amber-300/90 font-medium">
              Jika jatah mingguan penuh ({weeklyAllowanceLimit}/{weeklyAllowanceLimit}), request darurat mengonsumsi <strong>2 kuota</strong>, atau pilih <strong>Antrean Senin (biaya 1 kuota)</strong>.
            </p>
          </div>
        </div>

        {/* CARD C: MASA AKTIF & TOMBOL TOP-UP */}
        <div className="rounded-2xl p-4 sm:p-5 bg-white dark:bg-slate-900/50 border border-slate-200/90 dark:border-slate-800 flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-emerald-500" />
              <span>Masa Aktif Kuota</span>
            </span>
            <span
              className={`text-[10px] font-black px-2 py-0.5 rounded-full border ${
                !isExpired
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800'
                  : 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-800'
              }`}
            >
              {!isExpired ? 'Masa Berlaku Aktif' : 'Kedaluwarsa'}
            </span>
          </div>

          <div>
            {!isExpired && daysLeft !== null ? (
              <div className="space-y-0.5">
                <div className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                  {daysLeft} <span className="text-sm font-bold text-slate-400">Hari Lagi</span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                  Hingga {currentPeriodEnd ? formatDateIndonesian(currentPeriodEnd) : '-'}
                </p>
              </div>
            ) : (
              <div className="space-y-0.5">
                <div className="text-2xl font-black text-rose-600 dark:text-rose-400">
                  Paket Berakhir
                </div>
                <p className="text-[11px] text-slate-400">
                  Beli paket baru untuk mengaktifkan kembali kuota Anda
                </p>
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={onTopUpClick}
            className="w-full py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs shadow-md shadow-indigo-600/20 transition cursor-pointer flex items-center justify-center gap-1.5"
          >
            <Zap className="w-3.5 h-3.5" />
            <span>+ Beli Kuota Paket / Perpanjang</span>
          </button>
        </div>
      </div>

      {/* 2B. RINCIAN KONSUMSI DUAL-AI (OPENAI VS GOOGLE GEMINI) */}
      <div className="pt-4 border-t border-slate-100 dark:border-slate-800/80 grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        <div className="p-3.5 rounded-2xl bg-emerald-50/40 dark:bg-emerald-950/20 border border-emerald-200/60 dark:border-emerald-900/50 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-black uppercase tracking-wider text-emerald-700 dark:text-emerald-300 block">
              Mesin OpenAI (GPT-4o & DALL-E 3)
            </span>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
              Sintesis naskah kebijakan 5-bab, riset &amp; RAG
            </p>
          </div>
          <div className="text-right font-mono">
            <div className="text-sm font-black text-slate-900 dark:text-white">
              {openaiTotalTokens.toLocaleString('id-ID')} tok
            </div>
            <div className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
              {openaiImagesUsed} visual DALL-E
            </div>
          </div>
        </div>

        <div className="p-3.5 rounded-2xl bg-indigo-50/40 dark:bg-indigo-950/20 border border-indigo-200/60 dark:border-indigo-900/50 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-black uppercase tracking-wider text-indigo-700 dark:text-indigo-300 block">
              Mesin Google Gemini (Flash & Imagen 3)
            </span>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
              Ekstraksi bukti, OCR dokumen, kanvas infografis &amp; relayout
            </p>
          </div>
          <div className="text-right font-mono">
            <div className="text-sm font-black text-slate-900 dark:text-white">
              {geminiTotalTokens.toLocaleString('id-ID')} tok
            </div>
            <div className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400">
              {geminiImagesUsed} visual Imagen
            </div>
          </div>
        </div>
      </div>

      {/* 3. MODAL BUKU BESAR RIWAYAT KUOTA (IMMUTABLE LEDGER) */}
      {historyModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white dark:bg-[#0E131F] border border-slate-200 dark:border-slate-800 rounded-3xl max-w-2xl w-full p-6 shadow-2xl space-y-4 max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                  <History className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-900 dark:text-white">
                    Buku Besar Riwayat Mutasi Kuota
                  </h3>
                  <p className="text-[11px] text-slate-400 font-medium">
                    Catatan audit transaksi kuota permanen (Immutable Ledger)
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setHistoryModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-2 pr-1">
              {historyLoading ? (
                <div className="py-12 flex flex-col items-center justify-center text-slate-400 space-y-2">
                  <Loader2 className="w-6 h-6 animate-spin text-indigo-500" />
                  <span className="text-xs">Memuat buku besar transaksi...</span>
                </div>
              ) : transactions.length === 0 ? (
                <div className="py-12 text-center text-slate-400 text-xs">
                  Belum ada transaksi mutasi kuota tercatat.
                </div>
              ) : (
                <div className="divide-y divide-slate-100 dark:divide-slate-800/60">
                  {transactions.map((tx) => {
                    const badge = getTransactionTypeLabel(tx.transactionType);
                    const isPositive = tx.amountDelta > 0;
                    return (
                      <div
                        key={tx.id}
                        className="py-3 flex items-start justify-between gap-3 text-xs"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-black border ${badge.cls}`}
                            >
                              {badge.label}
                            </span>
                            {tx.channel && (
                              <span className="px-2 py-0.5 rounded-md text-[9.5px] font-bold uppercase bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                                {tx.channel === 'WEB_STUDIO' ? 'Web Studio' : tx.channel === 'WHATSAPP' ? 'WhatsApp' : tx.channel}
                              </span>
                            )}
                            {tx.referenceCode && (
                              <span className="font-mono text-[11px] font-bold text-slate-500 dark:text-slate-400">
                                #{tx.referenceCode}
                              </span>
                            )}
                          </div>
                          {tx.notes && (
                            <p className="text-slate-600 dark:text-slate-300 font-medium text-[11.5px]">
                              {tx.notes}
                            </p>
                          )}
                          <div className="text-[10px] text-slate-400">
                            {new Date(tx.createdAt).toLocaleDateString('id-ID', {
                              day: '2-digit',
                              month: 'short',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}{' '}
                            WIB
                          </div>
                        </div>

                        <div className="text-right shrink-0">
                          <div
                            className={`font-mono font-black text-sm flex items-center justify-end gap-0.5 ${
                              isPositive
                                ? 'text-emerald-600 dark:text-emerald-400'
                                : 'text-rose-600 dark:text-rose-400'
                            }`}
                          >
                            {isPositive ? (
                              <ArrowUpRight className="w-3.5 h-3.5" />
                            ) : (
                              <ArrowDownRight className="w-3.5 h-3.5" />
                            )}
                            <span>{isPositive ? `+${tx.amountDelta}` : tx.amountDelta}</span>
                          </div>
                          <div className="text-[10.5px] text-slate-400 font-mono mt-0.5">
                            Sisa: <strong className="text-slate-700 dark:text-slate-200">{tx.balanceAfter}</strong>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="border-t border-slate-100 dark:border-slate-800 pt-3 flex justify-end">
              <button
                type="button"
                onClick={() => setHistoryModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-xs font-bold text-slate-700 dark:text-slate-200 cursor-pointer"
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

