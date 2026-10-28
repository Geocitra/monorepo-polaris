'use client';

import React, { useEffect } from 'react';
import { Portal } from '@/components/ui/portal';

interface ResolveDiscrepancyModalProps {
  discrepancy: any | null;
  onClose: () => void;
  onResolve: (status: 'MANUALLY_RESOLVED' | 'IGNORED') => Promise<void>;
  resolveNotes: string;
  onNotesChange: (notes: string) => void;
  resolving: boolean;
}

export function ResolveDiscrepancyModal({
  discrepancy,
  onClose,
  onResolve,
  resolveNotes,
  onNotesChange,
  resolving,
}: ResolveDiscrepancyModalProps) {
  const isOpen = Boolean(discrepancy);

  useEffect(() => {
    if (isOpen) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [isOpen]);

  if (!isOpen || !discrepancy) return null;

  return (
    <Portal>
      <div className="fixed inset-0 !m-0 z-[60] flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
        <div className="w-full max-w-md bg-white dark:bg-[#0E131F] rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl p-6 space-y-4 animate-in zoom-in-95 duration-200">
          <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">
            Resolusi Selisih Transaksi: {discrepancy.gatewayOrderId}
          </h3>
          <p className="text-xs text-slate-500">
            Tipe: {discrepancy.discrepancyType} • Selisih: Rp{' '}
            {Number(discrepancy.discrepancyAmountIdr).toLocaleString('id-ID')}
          </p>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
              Catatan Justifikasi Audit:
            </label>
            <textarea
              rows={3}
              required
              placeholder="Contoh: Pembayaran telah dikonfirmasi manual via bukti mutasi rekening koran..."
              value={resolveNotes}
              onChange={(e) => onNotesChange(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-xs bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-2 rounded-xl text-slate-600 dark:text-slate-300 text-xs font-bold hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
            >
              Batal
            </button>
            <button
              type="button"
              disabled={resolving || !resolveNotes.trim()}
              onClick={() => onResolve('MANUALLY_RESOLVED')}
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold text-xs shadow-xs cursor-pointer"
            >
              {resolving ? 'Menyimpan...' : 'Tandai Selesai (Manually Resolved)'}
            </button>
          </div>
        </div>
      </div>
    </Portal>
  );
}
