'use client';

import React, { useState } from 'react';
import { X, DollarSign, Coins, CreditCard, CheckCircle2, AlertCircle, FileText, Info } from 'lucide-react';
import { AdminApiClient } from '@/lib/api-client';

interface TopupTokenModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function TopupTokenModal({ isOpen, onClose, onSuccess }: TopupTokenModalProps) {
  const [amountUsd, setAmountUsd] = useState<number>(50);
  const [usdInputStr, setUsdInputStr] = useState<string>('50');
  const [paymentReference, setPaymentReference] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  // Kurs konversi acuan
  const rateIdr = 16250;
  const estimatedIdr = Math.round(amountUsd * rateIdr);

  const handleQuickSelect = (val: number) => {
    setAmountUsd(val);
    setUsdInputStr(String(val));
  };

  const handleUsdChange = (valStr: string) => {
    // Hanya izinkan angka dan titik desimal
    const sanitized = valStr.replace(/[^0-9.]/g, '');
    setUsdInputStr(sanitized);

    const parsed = parseFloat(sanitized);
    if (!isNaN(parsed) && parsed > 0) {
      setAmountUsd(parsed);
    } else {
      setAmountUsd(0);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!amountUsd || amountUsd <= 0) {
      setError('Nominal deposit USD harus lebih besar dari 0.');
      return;
    }

    try {
      setLoading(true);
      await AdminApiClient.request('/admin/ai/topup', {
        method: 'POST',
        body: JSON.stringify({
          amountUsd: Number(amountUsd),
          amountIdr: estimatedIdr,
          paymentReference: paymentReference.trim() || `OPENAI-${Date.now()}`,
          notes: notes.trim() || 'Top up deposit OpenAI Billing',
        }),
      });

      onSuccess();
    } catch (err: any) {
      setError(err?.message || 'Gagal menyimpan transaksi top up.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/75 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="w-full max-w-lg bg-white dark:bg-[#0E131F] rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden my-auto">
        {/* Header */}
        <div className="px-5 py-4 sm:px-6 sm:py-5 border-b border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-2xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400 flex items-center justify-center shadow-xs">
              <Coins className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-black text-slate-900 dark:text-white tracking-tight">
                Catat Deposit Saldo OpenAI
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Pencatatan saldo kredit USD yang dibayarkan di dashboard OpenAI
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-4">
          {error && (
            <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-xs font-semibold text-rose-600 dark:text-rose-400 flex items-center gap-2">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Quick Select Buttons */}
          <div>
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-2">
              Pilihan Cepat Nominal Deposit (USD)
            </label>
            <div className="grid grid-cols-5 gap-2">
              {[10, 25, 50, 100, 200].map((amt) => {
                const isActive = amountUsd === amt;
                return (
                  <button
                    type="button"
                    key={amt}
                    onClick={() => handleQuickSelect(amt)}
                    className={`py-2 px-2 rounded-xl text-xs font-black transition-all cursor-pointer text-center border ${
                      isActive
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm shadow-emerald-600/30'
                        : 'bg-slate-50 dark:bg-slate-900/60 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:border-emerald-500/60'
                    }`}
                  >
                    ${amt}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Input Nominal USD */}
          <div>
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
              Nominal Top Up (USD) <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 font-bold text-sm">
                $
              </div>
              <input
                type="text"
                inputMode="decimal"
                value={usdInputStr}
                onChange={(e) => handleUsdChange(e.target.value)}
                className="w-full pl-8 pr-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white text-sm font-black focus:outline-none focus:ring-2 focus:ring-emerald-500"
                placeholder="50"
                required
              />
            </div>
            <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 mt-1.5 px-0.5">
              <span>
                Setara: <strong className="text-slate-700 dark:text-slate-200">Rp {estimatedIdr.toLocaleString('id-ID')}</strong>
              </span>
              <span className="text-slate-400">Kurs acuan: Rp 16.250 / USD</span>
            </div>
          </div>

          {/* Dual Column: Ref Invoice & Catatan */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {/* Input Referensi / Invoice */}
            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                No. Invoice / Referensi OpenAI
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <CreditCard className="h-4 w-4" />
                </div>
                <input
                  type="text"
                  value={paymentReference}
                  onChange={(e) => setPaymentReference(e.target.value)}
                  className="w-full pl-9 pr-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white text-xs font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  placeholder="Contoh: INV-OPENAI-2026-OCT-01"
                />
              </div>
            </div>

            {/* Catatan Internal */}
            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                Catatan Pembukuan / Sumber Dana
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <FileText className="h-4 w-4" />
                </div>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full pl-9 pr-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white text-xs font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  placeholder="Contoh: Kartu Kredit Corporate / SPK"
                />
              </div>
            </div>
          </div>

          {/* Information Callout */}
          <div className="p-3 rounded-2xl bg-indigo-50/70 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/40 flex items-start gap-2.5">
            <Info className="h-4 w-4 text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5" />
            <p className="text-[11px] leading-relaxed text-indigo-900 dark:text-indigo-300 font-medium">
              Saldo deposit ini akan otomatis terpotong setiap kali anggota dewan melakukan aktivitas AI (kajian APBD, artikel, ataupun infografis) sesuai tarif pemakaian riil OpenAI.
            </p>
          </div>

          {/* Submit Actions */}
          <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 transition-all cursor-pointer shadow-xs shadow-emerald-600/30"
            >
              {loading ? (
                <>
                  <div className="h-3.5 w-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Menyimpan...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="h-4 w-4" />
                  <span>Simpan Deposit Saldo</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
