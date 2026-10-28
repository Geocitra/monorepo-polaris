'use client';

import React, { useEffect } from 'react';
import { X, CheckCircle2 } from 'lucide-react';
import { Portal } from '@/components/ui/portal';

interface BatchDetailModalProps {
  batchData: any | null;
  onClose: () => void;
  detailTab: 'MATCHED' | 'DISCREPANCIES';
  onDetailTabChange: (tab: 'MATCHED' | 'DISCREPANCIES') => void;
  onSelectDiscrepancy: (discrepancy: any) => void;
}

export function BatchDetailModal({
  batchData,
  onClose,
  detailTab,
  onDetailTabChange,
  onSelectDiscrepancy,
}: BatchDetailModalProps) {
  const isOpen = Boolean(batchData);

  useEffect(() => {
    if (isOpen) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [isOpen]);

  if (!isOpen || !batchData) return null;

  const { batch, matchedInvoices, discrepancies } = batchData;

  return (
    <Portal>
      <div className="fixed inset-0 !m-0 z-[60] flex items-center justify-center p-3 sm:p-5 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
        <div className="w-full max-w-4xl bg-white dark:bg-[#0E131F] rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
          {/* Modal Header */}
          <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2.5">
                <h3 className="font-black text-slate-900 dark:text-white text-base font-mono">
                  {batch.batchNumber}
                </h3>
                <span
                  className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase font-mono ${
                    batch.status === 'BALANCED'
                      ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60'
                      : batch.status === 'RESOLVED'
                      ? 'bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border border-blue-200 dark:border-blue-800/60'
                      : 'bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 border border-rose-200 dark:border-rose-800/60'
                  }`}
                >
                  {batch.status}
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Tanggal Buku Kas:{' '}
                <strong className="text-slate-700 dark:text-slate-300">
                  {batch.reconDate}
                </strong>{' '}
                • Gateway:{' '}
                <strong className="text-slate-700 dark:text-slate-300">
                  {batch.sourceGateway}
                </strong>{' '}
                • Dijalankan oleh: {batch.executedBy}
              </p>
              {batch.notes && (
                <p className="text-[11px] text-slate-400 italic mt-0.5">
                  Catatan: &ldquo;{batch.notes}&rdquo;
                </p>
              )}
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white transition-colors cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* KPI Ringkasan Batch */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-5 bg-slate-50/70 dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-800 text-xs">
            <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800">
              <span className="text-[10px] font-bold uppercase text-slate-400 block">
                Total Tagihan (Gross)
              </span>
              <div className="text-base font-black text-slate-900 dark:text-white font-mono mt-0.5">
                Rp {Number(batch.totalGrossAmountIdr).toLocaleString('id-ID')}
              </div>
            </div>
            <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800">
              <span className="text-[10px] font-bold uppercase text-amber-500 block">
                Potongan MDR & PPN
              </span>
              <div className="text-base font-black text-amber-600 dark:text-amber-400 font-mono mt-0.5">
                Rp {Number(batch.totalMdrFeeIdr).toLocaleString('id-ID')}
              </div>
            </div>
            <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800">
              <span className="text-[10px] font-bold uppercase text-emerald-500 block">
                Kas Bersih (Net)
              </span>
              <div className="text-base font-black text-emerald-600 dark:text-emerald-400 font-mono mt-0.5">
                Rp {Number(batch.totalNetAmountIdr).toLocaleString('id-ID')}
              </div>
            </div>
            <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800">
              <span className="text-[10px] font-bold uppercase text-slate-400 block">
                Kecocokan
              </span>
              <div className="text-base font-black text-slate-900 dark:text-white font-mono mt-0.5">
                {batch.totalMatchedTransactions} / {batch.totalGatewayTransactions} Transaksi
              </div>
            </div>
          </div>

          {/* Tab Navigasi Detail */}
          <div className="px-5 pt-3 border-b border-slate-100 dark:border-slate-800 flex items-center gap-4">
            <button
              onClick={() => onDetailTabChange('MATCHED')}
              className={`pb-2.5 text-xs font-bold transition-all border-b-2 cursor-pointer ${
                detailTab === 'MATCHED'
                  ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-slate-400 hover:text-slate-600'
              }`}
            >
              Transaksi Cocok (
              {matchedInvoices?.length || batch.totalMatchedTransactions || 0})
            </button>
            <button
              onClick={() => onDetailTabChange('DISCREPANCIES')}
              className={`pb-2.5 text-xs font-bold transition-all border-b-2 cursor-pointer ${
                detailTab === 'DISCREPANCIES'
                  ? 'border-rose-600 text-rose-600 dark:text-rose-400'
                  : 'border-transparent text-slate-400 hover:text-slate-600'
              }`}
            >
              Selisih Transaksi ({discrepancies?.length || 0})
            </button>
          </div>

          {/* Modal Body / Tab Content */}
          <div className="p-5 overflow-y-auto space-y-4 flex-1">
            {detailTab === 'MATCHED' && (
              <div>
                {!matchedInvoices || matchedInvoices.length === 0 ? (
                  <div className="p-8 text-center rounded-2xl bg-slate-50 dark:bg-slate-900 text-xs text-slate-400">
                    Tidak ada detail baris invoice langsung yang terlampir pada batch ini.
                  </div>
                ) : (
                  <div className="overflow-x-auto border border-slate-100 dark:border-slate-800 rounded-2xl">
                    <table className="w-full text-left text-xs border-collapse min-w-[620px]">
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
                        {matchedInvoices.map((inv: any) => (
                          <tr
                            key={inv.id}
                            className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20"
                          >
                            <td className="py-2.5 px-3 font-bold text-slate-900 dark:text-white">
                              {inv.invoiceNumber}
                            </td>
                            <td className="py-2.5 px-3">
                              Rp{' '}
                              {Number(
                                inv.grossAmountIdr || inv.amountIdr
                              ).toLocaleString('id-ID')}
                            </td>
                            <td className="py-2.5 px-3 text-amber-600">
                              Rp {Number(inv.mdrFeeIdr || 0).toLocaleString('id-ID')}
                            </td>
                            <td className="py-2.5 px-3 text-amber-600">
                              Rp {Number(inv.vatFeeIdr || 0).toLocaleString('id-ID')}
                            </td>
                            <td className="py-2.5 px-3 text-emerald-600 font-bold">
                              Rp{' '}
                              {Number(
                                inv.netAmountIdr || inv.amountIdr
                              ).toLocaleString('id-ID')}
                            </td>
                            <td className="py-2.5 px-3 text-slate-400 text-[10px]">
                              {inv.paidAt
                                ? new Date(inv.paidAt).toLocaleString('id-ID')
                                : '-'}
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
                {discrepancies?.length === 0 ? (
                  <div className="p-8 text-center rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-800 dark:text-emerald-300 font-bold flex flex-col items-center gap-2">
                    <CheckCircle2 className="h-6 w-6 text-emerald-600" />
                    <span>
                      Nihil Selisih: Seluruh transaksi cocok 100% dan seimbang secara akuntansi.
                    </span>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {discrepancies.map((d: any) => (
                      <div
                        key={d.id}
                        className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2 text-xs"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-mono font-bold text-slate-900 dark:text-white">
                            Order ID: {d.gatewayOrderId}
                          </span>
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                              d.resolutionStatus === 'UNRESOLVED'
                                ? 'bg-rose-100 text-rose-800'
                                : 'bg-emerald-100 text-emerald-800'
                            }`}
                          >
                            {d.resolutionStatus}
                          </span>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-slate-600 dark:text-slate-400">
                          <div>
                            Tipe Selisih:{' '}
                            <strong className="text-slate-800 dark:text-slate-200">
                              {d.discrepancyType}
                            </strong>
                          </div>
                          <div>
                            Selisih:{' '}
                            <strong className="text-rose-600">
                              Rp{' '}
                              {Number(d.discrepancyAmountIdr).toLocaleString('id-ID')}
                            </strong>
                          </div>
                        </div>
                        <p className="text-[11px] text-slate-500 italic bg-white dark:bg-slate-800 p-2 rounded-lg border border-slate-200/60 dark:border-slate-700">
                          {d.resolutionNotes || 'Belum ada catatan investigasi.'}
                        </p>
                        {d.resolutionStatus === 'UNRESOLVED' && (
                          <button
                            onClick={() => onSelectDiscrepancy(d)}
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
    </Portal>
  );
}
