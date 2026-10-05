'use client';

import { useState } from 'react';
import { LogIn, Loader2, KeyRound } from 'lucide-react';

interface PasswordLoginFormProps {
  email: string;
  setEmail: (val: string) => void;
  password: string;
  setPassword: (val: string) => void;
  loading: boolean;
  onSubmit: (e: React.FormEvent) => void;
  onSwitchToOtp?: () => void;
}

export function PasswordLoginForm({
  email,
  setEmail,
  password,
  setPassword,
  loading,
  onSubmit,
  onSwitchToOtp,
}: PasswordLoginFormProps) {
  const [rememberMe, setRememberMe] = useState(true);
  const [showForgotNotice, setShowForgotNotice] = useState(false);

  return (
    <form onSubmit={onSubmit} className="space-y-3">
      {/* Email Input */}
      <div>
        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
          Email Kantor
        </label>
        <input
          type="email"
          required
          placeholder="nama@gov.id"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="block w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800/80 px-3.5 py-2.5 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:border-cyan-400 focus:ring-4 focus:ring-cyan-400/20 focus:outline-none transition-all shadow-xs"
        />
      </div>

      {/* Password Input */}
      <div>
        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
          Kata Sandi
        </label>
        <input
          type="password"
          required
          placeholder="masukkan kata sandi"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="block w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800/80 px-3.5 py-2.5 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:border-cyan-400 focus:ring-4 focus:ring-cyan-400/20 focus:outline-none transition-all shadow-xs"
        />
      </div>

      {/* Remember Me Checkbox & Forgot Password */}
      <div className="flex items-center justify-between pt-0.5 text-xs">
        <label className="flex items-center gap-2 cursor-pointer select-none text-slate-600 dark:text-slate-400">
          <input
            type="checkbox"
            checked={rememberMe}
            onChange={(e) => setRememberMe(e.target.checked)}
            className="h-3.5 w-3.5 rounded border-slate-300 dark:border-slate-700 text-blue-600 focus:ring-cyan-400 transition cursor-pointer"
          />
          <span>Ingat Saya</span>
        </label>

        <button
          type="button"
          onClick={() => setShowForgotNotice(!showForgotNotice)}
          className="font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 hover:underline cursor-pointer"
        >
          Lupa Kata Sandi?
        </button>
      </div>

      {/* Forgot Password Helper Box */}
      {showForgotNotice && (
        <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/60 text-xs text-blue-900 dark:text-blue-200 animate-in fade-in duration-200">
          <div className="flex items-start gap-2">
            <KeyRound className="h-4 w-4 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="font-bold">Lupa kata sandi Anda?</p>
              <p className="text-[11px] text-blue-700 dark:text-blue-300 leading-relaxed">
                Anda dapat langsung masuk menggunakan <strong>Kode OTP Email</strong> tanpa perlu mengingat sandi.
              </p>
              {onSwitchToOtp && (
                <button
                  type="button"
                  onClick={onSwitchToOtp}
                  className="font-bold text-blue-600 dark:text-blue-400 underline hover:text-blue-800 text-[11px] mt-0.5 cursor-pointer block"
                >
                  Beralih ke Masuk via OTP Email →
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Submit Button */}
      <button
        type="submit"
        disabled={loading || !email || !password}
        className="w-full py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold text-sm shadow-md shadow-blue-600/25 disabled:opacity-50 transition-all flex items-center justify-center space-x-2 cursor-pointer pt-2.5 pb-2.5 mt-1"
      >
        {loading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <LogIn className="h-4 w-4" />
        )}
        <span>Masuk</span>
      </button>
    </form>
  );
}
