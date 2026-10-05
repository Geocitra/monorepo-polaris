'use client';

import { Mail, KeyRound, ArrowLeft, Loader2 } from 'lucide-react';

interface OtpLoginFormProps {
  email: string;
  setEmail: (val: string) => void;
  otpCode: string;
  setOtpCode: (val: string) => void;
  otpStep: 'INPUT_EMAIL' | 'INPUT_CODE';
  setOtpStep: (step: 'INPUT_EMAIL' | 'INPUT_CODE') => void;
  countdown: number;
  loading: boolean;
  onSendOtp: (e: React.FormEvent) => void;
  onVerifyOtp: (e: React.FormEvent) => void;
  onResetError: () => void;
}

export function OtpLoginForm({
  email,
  setEmail,
  otpCode,
  setOtpCode,
  otpStep,
  setOtpStep,
  countdown,
  loading,
  onSendOtp,
  onVerifyOtp,
  onResetError,
}: OtpLoginFormProps) {
  if (otpStep === 'INPUT_EMAIL') {
    return (
      <form onSubmit={onSendOtp} className="space-y-3">
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
            Email Kantor / Parlemen
          </label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="email"
              required
              placeholder="nama@gov.id atau email resmi"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="block w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800/80 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:border-cyan-400 focus:ring-4 focus:ring-cyan-400/20 focus:outline-none transition-all shadow-xs"
            />
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-tight">
            Kode verifikasi 6-digit aman akan dikirimkan ke kotak masuk email Anda.
          </p>
        </div>

        <button
          type="submit"
          disabled={loading || !email}
          className="w-full py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold text-sm shadow-md shadow-blue-600/25 disabled:opacity-50 transition-all flex items-center justify-center space-x-2 cursor-pointer mt-1"
        >
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <KeyRound className="h-4 w-4" />
          )}
          <span>Kirim Kode OTP Masuk</span>
        </button>
      </form>
    );
  }

  return (
    <form onSubmit={onVerifyOtp} className="space-y-3">
      <div className="p-2.5 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl flex items-center justify-between text-xs">
        <div className="truncate pr-2">
          <span className="text-[10px] text-slate-400 dark:text-slate-500 block font-bold uppercase">
            Terkirim ke:
          </span>
          <span className="font-bold text-slate-800 dark:text-slate-200 truncate block">
            {email}
          </span>
        </div>
        <button
          type="button"
          onClick={() => {
            setOtpStep('INPUT_EMAIL');
            setOtpCode('');
            onResetError();
          }}
          className="font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 shrink-0 cursor-pointer text-xs"
        >
          <ArrowLeft className="h-3 w-3" />
          <span>Ubah</span>
        </button>
      </div>

      <div>
        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 text-center mb-1">
          Masukkan 6 Digit Kode OTP
        </label>
        <input
          type="text"
          required
          maxLength={6}
          autoFocus
          placeholder="••••••"
          value={otpCode}
          onChange={(e) => setOtpCode(e.target.value.replace(/[^0-9]/g, ''))}
          className="block w-full py-2.5 text-center font-mono font-black text-xl tracking-[0.4em] rounded-xl border-2 border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-slate-900 dark:text-white focus:border-cyan-400 focus:ring-4 focus:ring-cyan-400/20 focus:outline-none transition-all"
        />
        <p className="text-[10px] text-slate-400 text-center mt-1">
          ⏱️ Kode kedaluwarsa dalam 5 menit.
        </p>
      </div>

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
        <span>Verifikasi & Masuk Dashboard</span>
      </button>

      <div className="text-center pt-0.5">
        {countdown > 0 ? (
          <span className="text-[11px] text-slate-400 font-medium">
            Kirim ulang kode dalam <span className="font-bold text-slate-600 dark:text-slate-300">{countdown}s</span>
          </span>
        ) : (
          <button
            type="button"
            disabled={loading}
            onClick={onSendOtp}
            className="text-[11px] font-bold text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 flex items-center gap-1 mx-auto transition-colors cursor-pointer"
          >
            <span>Kirim Ulang Kode OTP</span>
          </button>
        )}
      </div>
    </form>
  );
}
