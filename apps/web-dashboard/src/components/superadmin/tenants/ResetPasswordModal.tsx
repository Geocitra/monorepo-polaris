'use client';

import React, { useState } from 'react';
import { X, KeyRound, Copy, Check, Eye, EyeOff, AlertTriangle, CheckCircle2, RefreshCw } from 'lucide-react';
import { AdminApiClient } from '@/lib/api-client';
import { TenantRow } from '@/components/superadmin/types';

interface ResetPasswordModalProps {
  tenant: TenantRow;
  onClose: () => void;
  onSuccess: () => void;
}

export function ResetPasswordModal({ tenant, onClose, onSuccess }: ResetPasswordModalProps) {
  const [useCustomPassword, setUseCustomPassword] = useState(false);
  const [customPassword, setCustomPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Result state
  const [generatedPassword, setGeneratedPassword] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (!generatedPassword) return;
    navigator.clipboard.writeText(generatedPassword);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const payload: { newPassword?: string } = {};
      if (useCustomPassword && customPassword.trim()) {
        payload.newPassword = customPassword.trim();
      }

      const res: any = await AdminApiClient.request(`/admin/tenants/${tenant.id}/reset-password`, {
        method: 'POST',
        body: JSON.stringify(payload),
      });

      setGeneratedPassword(res.temporaryPasswordPlaintext || customPassword.trim());
    } catch (err: any) {
      setError(err.message || 'Gagal mereset kata sandi dewan.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white dark:bg-[#0B0F17] border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden theme-transition">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-600/10 dark:bg-rose-500/20 text-rose-600 dark:text-rose-400 flex items-center justify-center font-bold">
              <KeyRound className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Reset Kata Sandi Akun
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Pemberian kredensial sementara baru untuk dewan bersangkutan.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        {generatedPassword ? (
          <div className="p-6 space-y-5">
            <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-sm font-semibold text-emerald-900 dark:text-emerald-300">
                  Kata Sandi Berhasil Direset!
                </h4>
                <p className="text-xs text-emerald-700 dark:text-emerald-400/90 mt-1">
                  Akun <span className="font-semibold">{tenant.fullName}</span> telah diatur untuk wajib mengganti kata sandi pada login pertama berikutnya.
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Kata Sandi Sementara Baru
              </label>
              <div className="flex items-center justify-between p-3.5 bg-slate-900 dark:bg-black rounded-xl border border-slate-700 font-mono text-emerald-400 text-sm tracking-wide">
                <span>{generatedPassword}</span>
                <button
                  type="button"
                  onClick={handleCopy}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-sans font-medium flex items-center gap-1.5 transition border border-slate-600"
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      Disalin
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      Salin Kredensial
                    </>
                  )}
                </button>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 italic">
                Harap salin dan kirimkan secara privat kepada anggota dewan atau staf resminya.
              </p>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={() => {
                  onSuccess();
                  onClose();
                }}
                className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium transition shadow-sm"
              >
                Selesai & Tutup
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-5">
            {error && (
              <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/60 flex items-start gap-2.5 text-rose-700 dark:text-rose-300 text-xs">
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            {/* Tenant Info Preview */}
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-1 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500 dark:text-slate-400">Nama Anggota:</span>
                <span className="font-semibold text-slate-900 dark:text-white">{tenant.fullName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 dark:text-slate-400">Username:</span>
                <span className="font-mono text-slate-700 dark:text-slate-300">
                  {tenant.username || tenant.email.split('@')[0]}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 dark:text-slate-400">Email Resmi:</span>
                <span className="text-slate-700 dark:text-slate-300">{tenant.email}</span>
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center justify-between">
                <span>Metode Kata Sandi</span>
                <button
                  type="button"
                  onClick={() => setUseCustomPassword(!useCustomPassword)}
                  className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline font-normal"
                >
                  {useCustomPassword ? 'Gunakan Auto-Generate Acak' : 'Tentukan Kata Sandi Manual'}
                </button>
              </label>

              {useCustomPassword ? (
                <div className="space-y-1">
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={customPassword}
                      onChange={(e) => setCustomPassword(e.target.value)}
                      required
                      placeholder="Masukkan kata sandi baru (min 8 karakter)"
                      className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 pr-10 text-slate-900 dark:text-white font-mono"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Minimal 8 karakter kombinasi huruf besar, kecil, dan angka.
                  </p>
                </div>
              ) : (
                <div className="p-3.5 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/40 text-xs text-slate-600 dark:text-slate-400 flex items-center gap-2">
                  <RefreshCw className="w-4 h-4 text-indigo-500 shrink-0" />
                  <span>
                    Sistem akan secara otomatis membuat kata sandi acak 12-karakter berkekuatan tinggi (format: <code className="font-mono text-indigo-600 dark:text-indigo-400">PLR-XXXX-XXXX</code>).
                  </span>
                </div>
              )}
            </div>

            <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-700 dark:text-amber-400 flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>
                Setelah direset, bendera <strong>mustChangePassword</strong> akan aktif kembali. Dewan diwajibkan mengganti kata sandi begitu berhasil login.
              </span>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                disabled={loading}
                className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 text-xs font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={loading || (useCustomPassword && customPassword.length < 6)}
                className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white text-xs font-semibold transition flex items-center gap-2 shadow-sm"
              >
                {loading && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                Reset Kata Sandi Sekarang
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
