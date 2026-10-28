'use client';

import React, { useEffect } from 'react';
import { RefreshCw, CheckCircle2, PlayCircle, X } from 'lucide-react';
import { Portal } from '@/components/ui/portal';

interface AuditApiModalProps {
  isOpen: boolean;
  onClose: () => void;
  apiReconDate: string;
  onApiReconDateChange: (date: string) => void;
  apiNotes: string;
  onApiNotesChange: (notes: string) => void;
  triggeringApi: boolean;
  onSubmit: (e: React.FormEvent) => void;
}

export function AuditApiModal({
  isOpen,
  onClose,
  apiReconDate,
  onApiReconDateChange,
  apiNotes,
  onApiNotesChange,
  triggeringApi,
  onSubmit,
}: AuditApiModalProps) {
  useEffect(() => {
    if (isOpen) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <Portal>
      <div className="fixed inset-0 !m-0 z-[60] flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
        <div className="w-full max-w-lg bg-white dark:bg-[#0E131F] rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl p-5 sm:p-6 space-y-4 animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
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
            <button
              onClick={onClose}
              className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <form onSubmit={onSubmit} className="space-y-4 text-xs">
            <div className="space-y-2">
              <label className="font-bold text-slate-700 dark:text-slate-300 block">
                Pilih Tanggal Audit Mutasi:
              </label>
              <input
                type="date"
                required
                value={apiReconDate}
                onChange={(e) => onApiReconDateChange(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white font-mono"
              />

              {/* Shortcut Presets */}
              <div className="flex flex-wrap items-center gap-1.5 pt-1">
                <span className="text-[10px] text-slate-400 font-medium">Pilihan Cepat:</span>
                <button
                  type="button"
                  onClick={() => onApiReconDateChange('2026-09-30')}
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
                    onApiReconDateChange(d.toISOString().slice(0, 10));
                  }}
                  className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 cursor-pointer"
                >
                  Kemarin (H-1)
                </button>
                <button
                  type="button"
                  onClick={() => onApiReconDateChange(new Date().toISOString().slice(0, 10))}
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
                onChange={(e) => onApiNotesChange(e.target.value)}
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
                Sistem akan mengkueri status resmi setiap tagihan ke Midtrans Core API, menghitung
                potongan MDR & PPN 11%, serta memverifikasi kecocokan status lunas terhadap
                pembukuan POLARIS.
              </p>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={onClose}
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
    </Portal>
  );
}
