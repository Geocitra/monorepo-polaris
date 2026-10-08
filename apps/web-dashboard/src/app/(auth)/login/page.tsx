'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { ApiClient } from '@/lib/api-client';
import { ArrowLeft, CheckCircle2 } from 'lucide-react';
import { TwoFactorLoginForm } from '@/components/auth/TwoFactorLoginForm';
import { PolarisLogo } from '@/components/auth/PolarisLogo';

const LANDING_PAGE_URL = process.env.NEXT_PUBLIC_PORTAL_URL || 'http://localhost:3001';

function LoginFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get('redirect') || '/';

  const [step, setStep] = useState<'CREDENTIALS' | 'OTP'>('CREDENTIALS');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [countdown, setCountdown] = useState(0);

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    if (ApiClient.isAuthenticated()) {
      ApiClient.request<any>('/auth/me')
        .then(() => {
          router.replace(redirectUrl);
        })
        .catch(() => {
          ApiClient.removeToken();
        });
    }
  }, [redirectUrl, router]);

  useEffect(() => {
    if (countdown <= 0) return;
    const timer = setInterval(() => {
      setCountdown((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [countdown]);

  // Langkah 1: Validasi Kredensial Email & Password -> Memicu kirim OTP 2FA
  async function handleVerifyCredentials(e: React.FormEvent) {
    e.preventDefault();
    if (!email || !password) return;

    setLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const res = await ApiClient.request<any>('/auth/login', {
        method: 'POST',
        body: JSON.stringify({
          identifier: email.toLowerCase().trim(),
          email: email.toLowerCase().trim(),
          password,
        }),
      });

      if (res.email) {
        setEmail(res.email);
      }

      setSuccessMsg(res.message || 'Kredensial valid! Kode OTP 2FA telah dikirim ke email Anda.');
      setStep('OTP');
      setCountdown(60);
    } catch (err: any) {
      setErrorMsg(err.message || 'Email atau kata sandi tidak sesuai.');
    } finally {
      setLoading(false);
    }
  }

  // Resend OTP jika diminta di Langkah 2
  async function handleResendOtp() {
    if (!email) return;

    setLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const res = await ApiClient.request<any>('/auth/otp/send', {
        method: 'POST',
        body: JSON.stringify({ email: email.toLowerCase().trim() }),
      });

      setSuccessMsg(res.message || 'Kode OTP baru telah dikirimkan ke email Anda.');
      setCountdown(60);
    } catch (err: any) {
      setErrorMsg(err.message || 'Gagal mengirim ulang kode OTP.');
    } finally {
      setLoading(false);
    }
  }

  // Langkah 2: Verifikasi Kode OTP 6-Digit & Terbitkan Sesi Dewan
  async function handleVerifyOtp(e: React.FormEvent) {
    e.preventDefault();
    if (!otpCode || otpCode.length < 6) {
      setErrorMsg('Masukkan 6 digit kode OTP secara lengkap.');
      return;
    }

    setLoading(true);
    setErrorMsg(null);

    try {
      const res = await ApiClient.request<any>('/auth/otp/verify', {
        method: 'POST',
        body: JSON.stringify({
          email: email.toLowerCase().trim(),
          otpCode: otpCode.trim(),
        }),
      });

      ApiClient.setToken(res.accessToken);
      router.push(redirectUrl);
    } catch (err: any) {
      setErrorMsg(err.message || 'Verifikasi OTP gagal.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="h-screen max-h-screen w-full flex flex-col lg:flex-row bg-white dark:bg-[#070A12] text-slate-900 dark:text-slate-100 overflow-y-auto lg:overflow-hidden theme-transition">
      {/* ============================================================== */}
      {/* SISI KIRI: HERO IMAGE & VISUAL EKSEKUTIF (50% DESKTOP)          */}
      {/* ============================================================== */}
      <div className="relative hidden lg:flex lg:w-1/2 h-full overflow-hidden bg-slate-900 select-none">
        <Image
          src="/images/auth-building-bg.jpg"
          alt="POLARIS Civic Intelligence Hub"
          fill
          priority
          className="object-cover object-center"
        />

        {/* Ambient Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-900/35 to-slate-950/15" />
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-black/20" />

        {/* Bottom Floating Glass Card with Platform Highlights */}
        <div className="absolute bottom-6 left-6 right-6 z-10">
          <div className="p-4 sm:p-5 rounded-2xl bg-slate-950/65 backdrop-blur-xl border border-white/10 shadow-xl space-y-2 max-w-md">
            <div className="flex items-center gap-2">
              <span className="flex h-2 w-2 rounded-full bg-cyan-400 animate-ping" />
              <span className="text-[10px] font-black uppercase tracking-wider text-cyan-300">
                POLARIS Executive Operating System
              </span>
            </div>
            <h3 className="text-base sm:text-lg font-black text-white leading-snug tracking-tight">
              Kecerdasan Artifisial & Tata Kelola Aspirasi Terpadu untuk Parlemen Modern
            </h3>
            <p className="text-[11px] text-slate-300 leading-relaxed line-clamp-2">
              Mempercepat penyusunan naskah kebijakan, visualisasi data APBD, dan orkestrasi kanal advokasi publik dalam satu ruang kerja eksekutif terenkripsi.
            </p>
            <div className="pt-1 flex flex-wrap items-center gap-1.5 text-[9px] font-bold text-slate-300">
              <span className="px-2 py-0.5 rounded-full bg-white/10 border border-white/10">
                🛡️ Verifikasi Dua Langkah (2FA)
              </span>
              <span className="px-2 py-0.5 rounded-full bg-white/10 border border-white/10">
                ⚡ Real-time Redis Sync
              </span>
              <span className="px-2 py-0.5 rounded-full bg-white/10 border border-white/10">
                🇮🇩 Standar Data Pemerintah
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ============================================================== */}
      {/* SISI KANAN: FORMULIR AUTENTIKASI 2FA RAMPING & AMAN            */}
      {/* ============================================================== */}
      <div className="flex-1 flex flex-col justify-between h-full p-4 sm:p-6 lg:px-10 lg:py-5 max-w-lg mx-auto w-full overflow-y-auto lg:overflow-hidden">
        {/* Top Header Bar */}
        <div className="flex items-center justify-between w-full shrink-0 pb-1">
          <a
            href={LANDING_PAGE_URL}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 bg-slate-100/80 dark:bg-slate-800/60 hover:bg-slate-200/80 border border-slate-200 dark:border-slate-700 transition-all cursor-pointer"
          >
            <ArrowLeft className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
            <span>Kembali ke Landing Page</span>
          </a>

          <a
            href={`${LANDING_PAGE_URL}/pricing`}
            className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 hover:underline"
          >
            Ajukan Lisensi
          </a>
        </div>

        {/* Center Card Content */}
        <div className="w-full max-w-[360px] sm:max-w-[380px] mx-auto my-auto py-2 space-y-3.5">
          {/* Logo & Headline */}
          <div className="space-y-1.5 text-center sm:text-left">
            <div className="flex justify-center sm:justify-start">
              <PolarisLogo size="sm" />
            </div>
            <div className="space-y-0.5">
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                {step === 'CREDENTIALS' ? 'Masuk ke POLARIS' : 'Verifikasi Kode OTP'}
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {step === 'CREDENTIALS'
                  ? 'Silakan masukkan email dan kata sandi Anda.'
                  : 'Masukkan 6 digit kode yang dikirimkan ke email Anda.'}
              </p>
            </div>
          </div>

          {/* Notifikasi Status Error / Success */}
          {errorMsg && (
            <div className="p-2.5 rounded-xl bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-300 text-xs font-semibold border border-red-200 dark:border-red-900/60 leading-relaxed animate-in fade-in">
              {errorMsg}
            </div>
          )}

          {successMsg && (
            <div className="p-2.5 rounded-xl bg-green-50 dark:bg-green-950/40 text-green-700 dark:text-green-300 text-xs font-semibold border border-green-200 dark:border-green-900/60 flex items-start gap-2 animate-in fade-in">
              <CheckCircle2 className="h-4 w-4 shrink-0 text-green-600 mt-0.5" />
              <span className="text-xs">{successMsg}</span>
            </div>
          )}

          {/* Form Login Two-Step (2FA) */}
          <TwoFactorLoginForm
            step={step}
            setStep={setStep}
            email={email}
            setEmail={setEmail}
            password={password}
            setPassword={setPassword}
            otpCode={otpCode}
            setOtpCode={setOtpCode}
            countdown={countdown}
            loading={loading}
            onVerifyCredentials={handleVerifyCredentials}
            onVerifyOtp={handleVerifyOtp}
            onResendOtp={handleResendOtp}
            onResetError={() => setErrorMsg(null)}
          />

          {/* Secondary Link */}
          <div className="pt-1 text-center">
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Belum memiliki lisensi dewan?{' '}
              <a
                href={`${LANDING_PAGE_URL}/pricing`}
                className="font-bold text-blue-600 dark:text-blue-400 hover:underline"
              >
                Ajukan Permohonan Lisensi Resmi
              </a>
            </p>
          </div>
        </div>

        {/* Footer Notice */}
        <div className="pt-2 border-t border-slate-100 dark:border-slate-800 text-center shrink-0">
          <p className="text-[10px] sm:text-[11px] text-slate-400 dark:text-slate-500 font-medium">
            © 2026 POLARIS. Kepatuhan Keamanan Data Pemerintah & Standar ISO 27001.
          </p>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="h-screen bg-white dark:bg-[#070A12]" />}>
      <LoginFormContent />
    </Suspense>
  );
}
