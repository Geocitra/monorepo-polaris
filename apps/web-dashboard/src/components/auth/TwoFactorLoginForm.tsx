'use client';

import { useState } from 'react';
import { Mail, Lock, KeyRound, ArrowRight, ArrowLeft, Loader2, ShieldCheck, Eye, EyeOff } from 'lucide-react';

interface TwoFactorLoginFormProps {
  step: 'CREDENTIALS' | 'OTP';
  setStep: (step: 'CREDENTIALS' | 'OTP') => void;
  email: string;
  setEmail: (val: string) => void;
  password: string;
  setPassword: (val: string) => void;
  otpCode: string;
  setOtpCode: (val: string) => void;
  countdown: number;
  loading: boolean;
  onVerifyCredentials: (e: React.FormEvent) => void;
  onVerifyOtp: (e: React.FormEvent) => void;
  onResendOtp: () => void;
  onResetError: () => void;
}

export function TwoFactorLoginForm({
  step,
  setStep,
  email,
  setEmail,
  password,
  setPassword,
  otpCode,
  setOtpCode,
  countdown,
  loading,
  onVerifyCredentials,
  onVerifyOtp,
  onResendOtp,
  onResetError,
}: TwoFactorLoginFormProps) {
  const [showPassword, setShowPassword] = useState(false);

  // =========================================================================
  // LANGKAH 1: EMAIL & KATA SANDI
  // =========================================================================
  if (step === 'CREDENTIALS') {
    return (
      <form onSubmit={onVerifyCredentials} className="space-y-3.5">
        {/* Input Email atau Username */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
            Email Resmi atau Username Akun
          </label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              required
              autoFocus
              placeholder="nama@dpr.go.id atau budi_santoso"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                onResetError();
              }}
              className="block w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800/80 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 focus:outline-none transition-all shadow-xs"
            />
          </div>
        </div>

        {/* Input Kata Sandi */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
            Kata Sandi
          </label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type={showPassword ? 'text' : 'password'}
              required
              placeholder="Masukkan kata sandi"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                onResetError();
              }}
              className="block w-full pl-9 pr-10 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800/80 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 focus:outline-none transition-all shadow-xs"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors cursor-pointer"
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>

        {/* Notis Keamanan Sederhana */}
        <div className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 text-xs text-slate-600 dark:text-slate-300">
          <ShieldCheck className="h-4 w-4 text-blue-600 dark:text-blue-400 shrink-0" />
          <span className="leading-snug">
            Kode OTP verifikasi akan otomatis dikirimkan ke email Anda.
          </span>
        </div>

        {/* Tombol Lanjut */}
        <button
          type="submit"
          disabled={loading || !email || !password}
          className="w-full py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold text-sm shadow-md shadow-blue-600/25 disabled:opacity-50 transition-all flex items-center justify-center space-x-2 cursor-pointer mt-1"
        >
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <>
              <span>Lanjut</span>
              <ArrowRight className="h-4 w-4" />
            </>
          )}
        </button>
      </form>
    );
  }

  // =========================================================================
  // LANGKAH 2: KODE OTP
  // =========================================================================
  return (
    <form onSubmit={onVerifyOtp} className="space-y-3.5">
      {/* Kartu Status Email Terdaftar */}
      <div className="p-2.5 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl flex items-center justify-between text-xs">
        <div className="truncate pr-2">
          <span className="text-[10px] text-slate-400 dark:text-slate-500 block font-semibold">
            Kode terkirim ke:
          </span>
          <span className="font-bold text-slate-800 dark:text-slate-200 truncate block">
            {email}
          </span>
        </div>
        <button
          type="button"
          onClick={() => {
            setStep('CREDENTIALS');
            setOtpCode('');
            onResetError();
          }}
          className="font-semibold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 shrink-0 cursor-pointer text-xs"
        >
          <ArrowLeft className="h-3 w-3" />
          <span>Ganti</span>
        </button>
      </div>

      {/* Input Kode OTP 6-Digit */}
      <div>
        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 text-center mb-1">
          Masukkan Kode OTP (6 Digit)
        </label>
        <input
          type="text"
          required
          maxLength={6}
          autoFocus
          placeholder="000000"
          value={otpCode}
          onChange={(e) => setOtpCode(e.target.value.replace(/[^0-9]/g, ''))}
          className="block w-full py-2.5 text-center font-mono font-black text-2xl tracking-[0.4em] rounded-xl border-2 border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-slate-900 dark:text-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 focus:outline-none transition-all shadow-xs"
        />
        <p className="text-[11px] text-slate-500 dark:text-slate-400 text-center mt-1">
          Cek kotak masuk atau folder spam email Anda.
        </p>
      </div>

      {/* Tombol Masuk */}
      <button
        type="submit"
        disabled={loading || otpCode.length < 6}
        className="w-full py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold text-sm shadow-md shadow-blue-600/25 disabled:opacity-50 transition-all flex items-center justify-center space-x-2 cursor-pointer mt-1"
      >
        {loading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <KeyRound className="h-4 w-4" />
        )}
        <span>Masuk</span>
      </button>

      {/* Kirim Ulang Kode */}
      <div className="text-center pt-0.5">
        {countdown > 0 ? (
          <span className="text-xs text-slate-400 font-medium">
            Kirim ulang kode dalam <span className="font-bold text-slate-600 dark:text-slate-300">{countdown} detik</span>
          </span>
        ) : (
          <button
            type="button"
            disabled={loading}
            onClick={onResendOtp}
            className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 flex items-center gap-1 mx-auto transition-colors cursor-pointer"
          >
            <span>Kirim Ulang Kode OTP</span>
          </button>
        )}
      </div>
    </form>
  );
}
