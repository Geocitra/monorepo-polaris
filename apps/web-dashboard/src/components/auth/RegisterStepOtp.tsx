'use client';

import { Mail, KeyRound, ArrowLeft, Loader2 } from 'lucide-react';

interface RegisterStepOtpProps {
  registeredEmail: string;
  otpCode: string;
  setOtpCode: (val: string) => void;
  loading: boolean;
  onBackToRegister: () => void;
  onResendOtp: () => void;
  onVerifyOtp: (e: React.FormEvent) => void;
}

export function RegisterStepOtp({
  registeredEmail,
  otpCode,
  setOtpCode,
  loading,
  onBackToRegister,
  onResendOtp,
  onVerifyOtp,
}: RegisterStepOtpProps) {
  return (
    <form onSubmit={onVerifyOtp} className="space-y-5 animate-in fade-in">
      <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-center space-y-2">
        <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center mx-auto">
          <Mail className="h-5 w-5" />
        </div>
        <div className="text-xs text-slate-600 dark:text-slate-300">
          Kode OTP 6-digit telah dikirim ke: <br />
          <strong className="text-slate-900 dark:text-white text-sm font-bold">{registeredEmail}</strong>
        </div>
        <p className="text-[11px] text-slate-400 dark:text-slate-500">
          Kode berlaku selama 5 menit. Silakan periksa folder Inbox atau Spam email Anda.
        </p>
      </div>

      <div>
        <label className="block text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2 text-center">
          Masukkan 6-Digit Kode OTP
        </label>
        <input
          type="text"
          required
          maxLength={6}
          autoFocus
          placeholder="••••••"
          value={otpCode}
          onChange={(e) => setOtpCode(e.target.value.replace(/[^0-9]/g, ''))}
          className="w-full text-center text-2xl tracking-[0.4em] font-black font-mono py-3.5 rounded-xl border-2 border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-slate-900 dark:text-white focus:border-cyan-400 focus:ring-4 focus:ring-cyan-400/20 focus:outline-none transition-all"
        />
      </div>

      <div className="flex items-center justify-between text-xs pt-1">
        <button
          type="button"
          onClick={onBackToRegister}
          className="text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 font-semibold flex items-center gap-1 cursor-pointer"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Ubah Email</span>
        </button>

        <button
          type="button"
          disabled={loading}
          onClick={onResendOtp}
          className="text-blue-600 dark:text-blue-400 hover:underline font-bold cursor-pointer"
        >
          Kirim Ulang Kode OTP
        </button>
      </div>

      <button
        type="submit"
        disabled={loading || otpCode.length < 6}
        className="w-full py-3.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold text-sm shadow-md shadow-blue-600/25 disabled:opacity-50 transition-all flex items-center justify-center space-x-2 cursor-pointer mt-2"
      >
        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <KeyRound className="h-4 w-4" />}
        <span>Verifikasi OTP & Lanjutkan</span>
      </button>
    </form>
  );
}
