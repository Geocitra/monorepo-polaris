'use client';

import React, { useState, useEffect } from 'react';
import {
  Lock,
  Mail,
  KeyRound,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertTriangle,
  X,
  ShieldCheck,
  Loader2,
  Sparkles,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ApiClient } from '@/lib/api-client';

interface AccountSecurityModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentEmail: string;
  onEmailUpdated?: (newEmail: string) => void;
  onPasswordUpdated?: () => void;
  initialTab?: 'PASSWORD' | 'EMAIL';
}

export function AccountSecurityModal({
  isOpen,
  onClose,
  currentEmail,
  onEmailUpdated,
  onPasswordUpdated,
  initialTab = 'PASSWORD',
}: AccountSecurityModalProps) {
  const [activeTab, setActiveTab] = useState<'PASSWORD' | 'EMAIL'>(initialTab);

  // Form states - Ganti Password
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Form states - Ganti Email
  const [newEmail, setNewEmail] = useState('');
  const [emailAuthPassword, setEmailAuthPassword] = useState('');
  const [showEmailAuthPassword, setShowEmailAuthPassword] = useState(false);

  // Status states
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setActiveTab(initialTab);
      setErrorMsg(null);
      setSuccessMsg(null);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setNewEmail('');
      setEmailAuthPassword('');
    }
  }, [isOpen, initialTab]);

  if (!isOpen) return null;

  async function handlePasswordSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!currentPassword) {
      setErrorMsg('Kata sandi saat ini wajib diisi.');
      return;
    }

    if (newPassword.length < 8) {
      setErrorMsg('Kata sandi baru minimal 8 karakter.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMsg('Konfirmasi kata sandi tidak cocok dengan kata sandi baru.');
      return;
    }

    if (currentPassword === newPassword) {
      setErrorMsg('Kata sandi baru tidak boleh sama dengan kata sandi saat ini.');
      return;
    }

    setLoading(true);
    try {
      const res = await ApiClient.request<{ message: string; passwordChangedAt?: string; accessToken?: string; user?: any }>(
        '/auth/change-password',
        {
          method: 'POST',
          body: JSON.stringify({
            currentPassword,
            newPassword,
          }),
        }
      );

      if (res?.accessToken) {
        ApiClient.setToken(res.accessToken);
        if (res.user) {
          try {
            localStorage.setItem('polaris_user', JSON.stringify(res.user));
          } catch {}
        }
      }

      setSuccessMsg(res?.message || 'Kata sandi berhasil diperbarui.');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');

      if (onPasswordUpdated) {
        onPasswordUpdated();
      }

      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (err: any) {
      setErrorMsg(err.message || 'Gagal mengubah kata sandi.');
    } finally {
      setLoading(false);
    }
  }

  async function handleEmailSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    const clean = newEmail.trim().toLowerCase();
    if (!clean) {
      setErrorMsg('Alamat email baru wajib diisi.');
      return;
    }

    if (clean === currentEmail.toLowerCase()) {
      setErrorMsg('Email baru tidak boleh sama dengan email akun saat ini.');
      return;
    }

    if (!emailAuthPassword) {
      setErrorMsg('Kata sandi saat ini diperlukan untuk mengonfirmasi perubahan email.');
      return;
    }

    setLoading(true);
    try {
      const res = await ApiClient.request<{ message: string; email: string; accessToken?: string }>(
        '/auth/change-email',
        {
          method: 'POST',
          body: JSON.stringify({
            newEmail: clean,
            currentPassword: emailAuthPassword,
          }),
        }
      );

      if (res?.accessToken) {
        ApiClient.setToken(res.accessToken);
      }

      setSuccessMsg(res?.message || 'Email login berhasil diperbarui.');
      setNewEmail('');
      setEmailAuthPassword('');

      if (onEmailUpdated) {
        onEmailUpdated(clean);
      }

      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (err: any) {
      setErrorMsg(err.message || 'Gagal mengubah email login.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-[#0B0F17] border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden transition-all duration-200">
        {/* HEADER MODAL */}
        <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/70 dark:bg-slate-900/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-50 dark:bg-blue-950/60 border border-blue-200/60 dark:border-blue-800/60 flex items-center justify-center text-blue-600 dark:text-blue-400 shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">
                Keamanan & Kredensial Akun
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Perbarui kata sandi mandiri atau ubah alamat email login Anda.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* TAB SWITCHER */}
        <div className="p-3 bg-slate-100/70 dark:bg-slate-900/70 border-b border-slate-100 dark:border-slate-800">
          <div className="grid grid-cols-2 gap-1.5 p-1 bg-white dark:bg-slate-950 rounded-xl border border-slate-200/80 dark:border-slate-800">
            <button
              type="button"
              onClick={() => {
                setActiveTab('PASSWORD');
                setErrorMsg(null);
                setSuccessMsg(null);
              }}
              className={`flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-bold transition cursor-pointer ${
                activeTab === 'PASSWORD'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <KeyRound className="w-3.5 h-3.5" />
              <span>Ganti Kata Sandi</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveTab('EMAIL');
                setErrorMsg(null);
                setSuccessMsg(null);
              }}
              className={`flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-bold transition cursor-pointer ${
                activeTab === 'EMAIL'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Mail className="w-3.5 h-3.5" />
              <span>Ganti Email Login</span>
            </button>
          </div>
        </div>

        {/* ALERTS (ERROR & SUCCESS) */}
        <div className="px-5 pt-4">
          {errorMsg && (
            <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50 text-red-700 dark:text-red-400 text-xs flex items-center gap-2 animate-in fade-in duration-150">
              <AlertTriangle className="w-4 h-4 shrink-0 text-red-600 dark:text-red-400" />
              <span className="font-semibold">{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/50 text-emerald-700 dark:text-emerald-400 text-xs flex items-center gap-2 animate-in fade-in duration-150">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
              <span className="font-semibold">{successMsg}</span>
            </div>
          )}
        </div>

        {/* TAB 1: GANTI KATA SANDI */}
        {activeTab === 'PASSWORD' && (
          <form onSubmit={handlePasswordSubmit} className="p-5 space-y-4">
            <div className="space-y-1">
              <label className="block text-[10px] font-bold text-slate-700 dark:text-slate-300 uppercase">
                Kata Sandi Saat Ini / Sementara
              </label>
              <div className="relative">
                <input
                  type={showCurrentPassword ? 'text' : 'password'}
                  required
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Masukkan kata sandi saat ini"
                  className="block w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 pr-10 text-xs text-slate-900 dark:text-white focus:border-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-600"
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                >
                  {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label className="block text-[10px] font-bold text-slate-700 dark:text-slate-300 uppercase">
                  Kata Sandi Baru
                </label>
                <span className="text-[10px] text-slate-400">Minimal 8 karakter</span>
              </div>
              <div className="relative">
                <input
                  type={showNewPassword ? 'text' : 'password'}
                  required
                  minLength={8}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Buat kata sandi baru yang kuat"
                  className="block w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 pr-10 text-xs text-slate-900 dark:text-white focus:border-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-600"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                >
                  {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="space-y-1">
              <label className="block text-[10px] font-bold text-slate-700 dark:text-slate-300 uppercase">
                Konfirmasi Kata Sandi Baru
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  required
                  minLength={8}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Ulangi kata sandi baru"
                  className="block w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 pr-10 text-xs text-slate-900 dark:text-white focus:border-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-600"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100 dark:border-slate-800">
              <Button
                type="button"
                variant="ghost"
                onClick={onClose}
                disabled={loading}
                className="text-xs font-bold text-slate-600 dark:text-slate-400"
              >
                Batal
              </Button>
              <Button
                type="submit"
                disabled={loading}
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-4 h-9 rounded-xl shadow-xs gap-1.5 cursor-pointer"
              >
                {loading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                <span>{loading ? 'Menyimpan...' : 'Perbarui Kata Sandi'}</span>
              </Button>
            </div>
          </form>
        )}

        {/* TAB 2: GANTI EMAIL LOGIN */}
        {activeTab === 'EMAIL' && (
          <form onSubmit={handleEmailSubmit} className="p-5 space-y-4">
            {/* CURRENT EMAIL BADGE */}
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 space-y-1">
              <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase block">
                Email Akun Terdaftar Saat Ini
              </span>
              <span className="text-xs font-bold text-slate-900 dark:text-white font-mono block">
                {currentEmail}
              </span>
            </div>

            <div className="space-y-1">
              <label className="block text-[10px] font-bold text-slate-700 dark:text-slate-300 uppercase">
                Alamat Email Login Baru
              </label>
              <input
                type="email"
                required
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                placeholder="nama.anda@gmail.com atau email resmi"
                className="block w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-xs text-slate-900 dark:text-white focus:border-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-600"
              />
              <span className="text-[10px] text-slate-500 dark:text-slate-400 block mt-1">
                Email baru akan digunakan untuk login dan menerima notifikasi OTP sistem.
              </span>
            </div>

            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label className="block text-[10px] font-bold text-slate-700 dark:text-slate-300 uppercase">
                  Konfirmasi Kata Sandi Akun
                </label>
                <span className="text-[10px] text-amber-600 dark:text-amber-400 font-bold">
                  Otorisasi Keamanan
                </span>
              </div>
              <div className="relative">
                <input
                  type={showEmailAuthPassword ? 'text' : 'password'}
                  required
                  value={emailAuthPassword}
                  onChange={(e) => setEmailAuthPassword(e.target.value)}
                  placeholder="Masukkan kata sandi untuk verifikasi"
                  className="block w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 pr-10 text-xs text-slate-900 dark:text-white focus:border-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-600"
                />
                <button
                  type="button"
                  onClick={() => setShowEmailAuthPassword(!showEmailAuthPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                >
                  {showEmailAuthPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100 dark:border-slate-800">
              <Button
                type="button"
                variant="ghost"
                onClick={onClose}
                disabled={loading}
                className="text-xs font-bold text-slate-600 dark:text-slate-400"
              >
                Batal
              </Button>
              <Button
                type="submit"
                disabled={loading}
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-4 h-9 rounded-xl shadow-xs gap-1.5 cursor-pointer"
              >
                {loading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                <span>{loading ? 'Menyimpan...' : 'Perbarui Email Login'}</span>
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
