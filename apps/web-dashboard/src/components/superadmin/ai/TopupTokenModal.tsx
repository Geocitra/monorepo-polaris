'use client';

import React, { useState, useEffect } from 'react';
import {
  X,
  Coins,
  CreditCard,
  CheckCircle2,
  AlertCircle,
  FileText,
  Info,
} from 'lucide-react';
import { AdminApiClient } from '@/lib/api-client';
import { Portal } from '@/components/ui/portal';

interface TopupTokenModalProps {
  isOpen: boolean;
  defaultProvider?: 'OPENAI' | 'GEMINI';
  liveFxRateIdr?: number;
  onClose: () => void;
  onSuccess: () => void;
}

export function TopupTokenModal({
  isOpen,
  defaultProvider = 'OPENAI',
  liveFxRateIdr = 16300,
  onClose,
  onSuccess,
}: TopupTokenModalProps) {
  const [provider, setProvider] = useState<'OPENAI' | 'GEMINI'>(defaultProvider);
  const [amountIdr, setAmountIdr] = useState<number>(1000000);
  const [idrInputStr, setIdrInputStr] = useState<string>('1000000');
  const [paymentReference, setPaymentReference] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setProvider(defaultProvider);
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [isOpen, defaultProvider]);

  if (!isOpen) return null;

  const quickSelectIdrValues = [250000, 500000, 1000000, 2500000, 5000000];

  const handleQuickSelect = (val: number) => {
    setAmountIdr(val);
    setIdrInputStr(String(val));
  };

  const handleIdrChange = (valStr: string) => {
    const sanitized = valStr.replace(/[^0-9]/g, '');
    setIdrInputStr(sanitized);

    const parsed = parseInt(sanitized, 10);
    if (!isNaN(parsed) && parsed > 0) {
      setAmountIdr(parsed);
    } else {
      setAmountIdr(0);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!amountIdr || amountIdr < 10000) {
      setError('Nominal deposit Rupiah minimal Rp 10.000.');
      return;
    }

    try {
      setLoading(true);
      await AdminApiClient.request('/admin/ai/topup', {
        method: 'POST',
        body: JSON.stringify({
          provider,
          amountIdr: Number(amountIdr),
          paymentReference: paymentReference.trim() || `${provider}-${Date.now()}`,
          notes:
            notes.trim() ||
            `Top up deposit saldo ${provider === 'GEMINI' ? 'Google Gemini / Vertex AI' : 'OpenAI Platform'}`,
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
    <Portal>
      <div className="fixed inset-0 !m-0 z-[60] flex items-center justify-center p-3 sm:p-4 bg-slate-950/75 backdrop-blur-xs animate-in fade-in duration-200">
        <div className="w-full max-w-lg bg-white dark:bg-[#0E131F] rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col">
          {/* Header */}
          <div className="px-5 py-4 sm:px-6 sm:py-5 border-b border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-2xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400 flex items-center justify-center shadow-xs">
                <Coins className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-base font-black text-slate-900 dark:text-white tracking-tight">
                  Catat Deposit Saldo AI (Rupiah)
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Pilih provider AI (OpenAI atau Google Gemini) dan masukkan nominal deposit dalam Rupiah
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
          <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-4 overflow-y-auto">
            {error && (
              <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-xs font-semibold text-rose-600 dark:text-rose-400 flex items-center gap-2">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Provider Selector */}
            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-2">
                Pilih Vault Provider AI <span className="text-rose-500">*</span>
              </label>
              <div className="grid grid-cols-2 gap-2.5">
                <button
                  type="button"
                  onClick={() => setProvider('OPENAI')}
                  className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                    provider === 'OPENAI'
                      ? 'bg-emerald-50 dark:bg-emerald-950/50 border-emerald-500 text-emerald-800 dark:text-emerald-200 ring-2 ring-emerald-500/20'
                      : 'bg-slate-50 dark:bg-slate-900/60 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300'
                  }`}
                >
                  <div className="text-xs font-black">OPENAI VAULT</div>
                  <div className="text-[10px] opacity-80 mt-0.5">
                    GPT-4o, GPT-4o-mini, DALL-E 3, Embeddings
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setProvider('GEMINI')}
                  className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                    provider === 'GEMINI'
                      ? 'bg-indigo-50 dark:bg-indigo-950/50 border-indigo-500 text-indigo-800 dark:text-indigo-200 ring-2 ring-indigo-500/20'
                      : 'bg-slate-50 dark:bg-slate-900/60 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300'
                  }`}
                >
                  <div className="text-xs font-black">GOOGLE GEMINI VAULT</div>
                  <div className="text-[10px] opacity-80 mt-0.5">
                    Gemini 2.5 Flash/Pro, Imagen 3, Vision OCR
                  </div>
                </button>
              </div>
            </div>

            {/* Quick Select Buttons (Rupiah) */}
            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-2">
                Pilihan Cepat Nominal Deposit (Rupiah)
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {quickSelectIdrValues.map((amt) => {
                  const isActive = amountIdr === amt;
                  return (
                    <button
                      type="button"
                      key={amt}
                      onClick={() => handleQuickSelect(amt)}
                      className={`py-2 px-2.5 rounded-xl text-xs font-black transition-all cursor-pointer text-center border ${
                        isActive
                          ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm shadow-emerald-600/30'
                          : 'bg-slate-50 dark:bg-slate-900/60 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:border-emerald-500/60'
                      }`}
                    >
                      Rp {amt.toLocaleString('id-ID')}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Input Nominal IDR */}
            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                Nominal Top Up (Rupiah) <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 font-bold text-xs">
                  Rp
                </div>
                <input
                  type="text"
                  inputMode="numeric"
                  value={idrInputStr}
                  onChange={(e) => handleIdrChange(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white text-sm font-black focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  placeholder="1000000"
                  required
                />
              </div>
              <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 mt-1.5 px-0.5">
                <span>
                  Terbaca:{' '}
                  <strong className="text-slate-700 dark:text-slate-200">
                    Rp {amountIdr.toLocaleString('id-ID')}
                  </strong>
                </span>
                <span className="text-slate-400">
                  Kurs Live API: Rp {Math.round(liveFxRateIdr).toLocaleString('id-ID')} / USD
                </span>
              </div>
            </div>

            {/* Dual Column: Ref Invoice & Catatan */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  No. Invoice / Referensi {provider}
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
                    placeholder={`Contoh: INV-${provider}-2026`}
                  />
                </div>
              </div>

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
                    placeholder="Contoh: Kartu Corporate / SPK"
                  />
                </div>
              </div>
            </div>

            {/* Information Callout */}
            <div className="p-3 rounded-2xl bg-indigo-50/70 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/40 flex items-start gap-2.5">
              <Info className="h-4 w-4 text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5" />
              <p className="text-[11px] leading-relaxed text-indigo-900 dark:text-indigo-300 font-medium">
                Saldo deposit Rupiah di vault <strong>{provider}</strong> akan terpotong secara terpisah sesuai konsumsi token dan render visual riil pada provider tersebut.
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
                    <span>Simpan Deposit {provider} (Rp)</span>
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
