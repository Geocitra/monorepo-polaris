'use client';

import Link from 'next/link';
import { UserPlus, Loader2, ShieldCheck, Mail, Phone, Lock, User } from 'lucide-react';

interface RegisterStepBasicProps {
  formData: {
    fullName: string;
    email: string;
    password: string;
    phoneNumber: string;
  };
  setFormData: (val: any) => void;
  loading: boolean;
  onSubmit: (e: React.FormEvent) => void;
}

export function RegisterStepBasic({
  formData,
  setFormData,
  loading,
  onSubmit,
}: RegisterStepBasicProps) {
  return (
    <form onSubmit={onSubmit} className="space-y-3">
      <div className="space-y-2.5">
        {/* Nama Lengkap & Gelar */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
            Nama Lengkap & Gelar
          </label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
            <input
              type="text"
              required
              placeholder="Contoh: Ir. H. Achmad Fauzi, M.Si"
              value={formData.fullName}
              onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
              className="block w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800/80 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:border-cyan-400 focus:ring-4 focus:ring-cyan-400/20 focus:outline-none transition-all shadow-xs"
            />
          </div>
        </div>

        {/* No. WhatsApp / HP */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
            No. WhatsApp / HP
          </label>
          <div className="relative">
            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
            <input
              type="tel"
              required
              placeholder="08123456xxxx"
              value={formData.phoneNumber}
              onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
              className="block w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800/80 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:border-cyan-400 focus:ring-4 focus:ring-cyan-400/20 focus:outline-none transition-all shadow-xs"
            />
          </div>
        </div>

        {/* Email Resmi */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
            Email Kantor / Resmi
          </label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
            <input
              type="email"
              required
              placeholder="fauzi@dpr.go.id atau email resmi"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="block w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800/80 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:border-cyan-400 focus:ring-4 focus:ring-cyan-400/20 focus:outline-none transition-all shadow-xs"
            />
          </div>
        </div>

        {/* Kata Sandi */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
            Buat Kata Sandi
          </label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
            <input
              type="password"
              required
              placeholder="Minimal 8 karakter kombinasi"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="block w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800/80 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:border-cyan-400 focus:ring-4 focus:ring-cyan-400/20 focus:outline-none transition-all shadow-xs"
            />
          </div>
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold text-sm shadow-md shadow-blue-600/25 disabled:opacity-50 transition-all flex items-center justify-center space-x-2 cursor-pointer mt-1"
      >
        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <UserPlus className="h-4 w-4" />}
        <span>Daftar Akun & Dapatkan Kode OTP</span>
      </button>

      <div className="pt-1 text-center text-xs text-slate-500 dark:text-slate-400">
        Sudah memiliki akun?{' '}
        <Link href="/login" className="font-bold text-blue-600 dark:text-blue-400 hover:underline">
          Masuk di sini
        </Link>
      </div>
    </form>
  );
}
