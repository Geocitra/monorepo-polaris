'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import Script from 'next/script';
import { ApiClient } from '@/lib/api-client';
import { Loader2, CheckCircle2, ArrowLeft } from 'lucide-react';
import { RegisterStepBasic } from '@/components/auth/RegisterStepBasic';
import { RegisterStepOtp } from '@/components/auth/RegisterStepOtp';
import { RegisterStepOnboarding } from '@/components/auth/RegisterStepOnboarding';
import { PolarisLogo } from '@/components/auth/PolarisLogo';

const LANDING_PAGE_URL = process.env.NEXT_PUBLIC_PORTAL_URL || 'http://localhost:3001';

type RegisterStep = 'STEP_REGISTER' | 'STEP_OTP' | 'STEP_ONBOARDING';

function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const planParam = searchParams.get('plan') || '';

  const [step, setStep] = useState<RegisterStep>('STEP_REGISTER');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Form Step 1: Profil Dasar
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    phoneNumber: '',
  });

  // Step 2: OTP
  const [otpCode, setOtpCode] = useState('');
  const [registeredEmail, setRegisteredEmail] = useState('');

  // Step 3: Klaim Subdomain & Paket
  const [claimedSubdomain, setClaimedSubdomain] = useState('');
  const [selectedCycle, setSelectedCycle] = useState<'MONTHLY' | 'SEMESTER' | 'ANNUAL'>('SEMESTER');

  useEffect(() => {
    const p = planParam.toLowerCase();
    if (p === '1bulan' || p === 'starter' || p === 'monthly') {
      setSelectedCycle('MONTHLY');
    } else if (p === '6bulan' || p === 'pro' || p === 'semester') {
      setSelectedCycle('SEMESTER');
    } else if (p === '1tahun' || p === 'vip' || p === 'annual') {
      setSelectedCycle('ANNUAL');
    }
  }, [planParam]);

  async function handleRegisterStep1(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const defaultSlug =
        formData.fullName
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/^-|-$/g, '')
          .slice(0, 25) || 'dewan';

      await ApiClient.request<any>('/auth/register', {
        method: 'POST',
        body: JSON.stringify({
          ...formData,
          subdomainSlug: `${defaultSlug}-${Math.floor(1000 + Math.random() * 9000)}`,
        }),
      });

      setRegisteredEmail(formData.email.toLowerCase().trim());
      setClaimedSubdomain(defaultSlug);
      setSuccessMsg('Pendaftaran berhasil! Kode OTP 6-digit telah dikirim ke email Anda.');
      setStep('STEP_OTP');
    } catch (err: any) {
      setErrorMsg(err.message || 'Pendaftaran gagal. Silakan periksa kembali data Anda.');
    } finally {
      setLoading(false);
    }
  }

  async function handleResendOtp() {
    setLoading(true);
    setErrorMsg(null);
    try {
      await ApiClient.request<any>('/auth/otp/send', {
        method: 'POST',
        body: JSON.stringify({ email: registeredEmail }),
      });
      setSuccessMsg('Kode OTP baru telah berhasil dikirimkan ke email Anda.');
    } catch (err: any) {
      setErrorMsg(err.message || 'Gagal mengirim ulang OTP.');
    } finally {
      setLoading(false);
    }
  }

  async function handleVerifyOtp(e: React.FormEvent) {
    e.preventDefault();
    if (!otpCode || otpCode.trim().length < 6) {
      setErrorMsg('Masukkan 6-digit kode OTP.');
      return;
    }

    setLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const res = await ApiClient.request<any>('/auth/otp/verify', {
        method: 'POST',
        body: JSON.stringify({
          email: registeredEmail,
          otpCode: otpCode.trim(),
        }),
      });

      ApiClient.setToken(res.accessToken);
      setSuccessMsg('Email berhasil diverifikasi! Lanjutkan pengaturan ruang kerja Anda.');
      setStep('STEP_ONBOARDING');
    } catch (err: any) {
      setErrorMsg(err.message || 'Kode OTP salah atau telah kedaluwarsa.');
    } finally {
      setLoading(false);
    }
  }

  async function handleCompleteOnboarding(shouldPayNow: boolean) {
    setLoading(true);
    setErrorMsg(null);

    try {
      const cleanSlug = claimedSubdomain
        .toLowerCase()
        .replace(/[^a-z0-9-]/g, '')
        .replace(/^-|-$/g, '');

      if (cleanSlug) {
        try {
          await ApiClient.request<any>('/cms/domain', {
            method: 'PUT',
            body: JSON.stringify({ subdomainSlug: cleanSlug }),
          });
        } catch (domainErr: any) {
          console.warn('Gagal set subdomain kustom:', domainErr.message);
        }
      }

      if (shouldPayNow) {
        const checkoutRes = await ApiClient.request<any>('/billing/checkout', {
          method: 'POST',
          body: JSON.stringify({ billingCycle: selectedCycle }),
        });

        if (window.snap && checkoutRes.snapToken) {
          window.snap.pay(checkoutRes.snapToken, {
            onSuccess: () => router.push('/'),
            onPending: () => router.push('/billing'),
            onError: () => router.push('/billing'),
            onClose: () => router.push('/'),
          });
          return;
        } else if (checkoutRes.redirectUrl) {
          window.location.href = checkoutRes.redirectUrl;
          return;
        }
      }

      router.push('/');
    } catch (err: any) {
      setErrorMsg(err.message || 'Terjadi kendala saat menyelesaikan pendaftaran.');
      setLoading(false);
    }
  }

  const snapScriptUrl =
    process.env.NEXT_PUBLIC_MIDTRANS_IS_PRODUCTION === 'true'
      ? 'https://app.midtrans.com/snap/snap.js'
      : 'https://app.sandbox.midtrans.com/snap/snap.js';
  const clientKey = process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY || 'SB-Mid-client-placeholder';

  return (
    <div className="h-screen max-h-screen w-full flex flex-col lg:flex-row bg-white dark:bg-[#070A12] text-slate-900 dark:text-slate-100 overflow-y-auto lg:overflow-hidden theme-transition">
      <Script src={snapScriptUrl} data-client-key={clientKey} strategy="lazyOnload" />

      {/* ============================================================== */}
      {/* SISI KIRI: HERO IMAGE & VISUAL EKSEKUTIF (50% DESKTOP)          */}
      {/* (HANYA VISUAL ELEGAN, TANPA TOMBOL GANDA)                       */}
      {/* ============================================================== */}
      <div className="relative hidden lg:flex lg:w-1/2 h-full overflow-hidden bg-slate-900 select-none">
        <Image
          src="/images/auth-building-bg.jpg"
          alt="POLARIS Civic Intelligence Hub"
          fill
          priority
          className="object-cover object-center"
        />

        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-900/35 to-slate-950/15" />
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-black/20" />

        {/* Bottom Floating Glass Card with Platform Highlights */}
        <div className="absolute bottom-6 left-6 right-6 z-10">
          <div className="p-4 sm:p-5 rounded-2xl bg-slate-950/65 backdrop-blur-xl border border-white/10 shadow-xl space-y-2 max-w-md">
            <div className="flex items-center gap-2">
              <span className="flex h-2 w-2 rounded-full bg-cyan-400 animate-ping" />
              <span className="text-[10px] font-black uppercase tracking-wider text-cyan-300">
                Pendaftaran Akun Eksekutif
              </span>
            </div>
            <h3 className="text-base sm:text-lg font-black text-white leading-snug tracking-tight">
              Satu Langkah Menuju Ruang Kerja Intelijen Advokasi Dewan
            </h3>
            <p className="text-[11px] text-slate-300 leading-relaxed line-clamp-2">
              Dapatkan domain portal publikasi resmi, asisten naskah kebijakan berbasis AI, serta sistem pelacakan aspirasi konstituen terotomasi.
            </p>
            <div className="pt-1 flex flex-wrap items-center gap-1.5 text-[9px] font-bold text-slate-300">
              <span className="px-2 py-0.5 rounded-full bg-white/10 border border-white/10">
                🛡️ Kepatuhan ISO 27001
              </span>
              <span className="px-2 py-0.5 rounded-full bg-white/10 border border-white/10">
                🌐 Custom Subdomain .polaris.id
              </span>
              <span className="px-2 py-0.5 rounded-full bg-white/10 border border-white/10">
                💳 Midtrans Verified
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ============================================================== */}
      {/* SISI KANAN: FORMULIR PENDAFTARAN COMPACT                       */}
      {/* ============================================================== */}
      <div className="flex-1 flex flex-col justify-between h-full p-4 sm:p-6 lg:px-10 lg:py-5 max-w-lg mx-auto w-full overflow-y-auto lg:overflow-hidden">
        {/* Top Header Bar: SATU-SATUNYA Tombol Navigasi Bersih */}
        <div className="flex items-center justify-between w-full shrink-0 pb-1">
          <a
            href={LANDING_PAGE_URL}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 bg-slate-100/80 dark:bg-slate-800/60 hover:bg-slate-200/80 border border-slate-200 dark:border-slate-700 transition-all cursor-pointer"
          >
            <ArrowLeft className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
            <span>Kembali ke Landing Page</span>
          </a>

          <Link
            href="/login"
            className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 hover:underline"
          >
            Sudah Punya Akun? Masuk
          </Link>
        </div>

        {/* Center Card Content: Ramping & Proporsional */}
        <div className="w-full max-w-[380px] sm:max-w-[400px] mx-auto my-auto py-2 space-y-3">
          {/* Logo & Headline */}
          <div className="space-y-1.5 text-center sm:text-left">
            <div className="flex justify-center sm:justify-start">
              <PolarisLogo size="sm" />
            </div>
            <div className="space-y-0.5">
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                {step === 'STEP_REGISTER' && 'Daftar Akun POLARIS'}
                {step === 'STEP_OTP' && 'Verifikasi Email OTP'}
                {step === 'STEP_ONBOARDING' && 'Ruang Kerja & Domain'}
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {step === 'STEP_REGISTER' && 'Langkah 1: Lengkapi profil dasar untuk membuka akses dashboard.'}
                {step === 'STEP_OTP' && 'Langkah 2: Masukkan kode verifikasi 6-digit dari email Anda.'}
                {step === 'STEP_ONBOARDING' && 'Langkah 3: Tentukan alamat subdomain resmi dan paket lisensi.'}
              </p>
            </div>
          </div>

          {/* Stepper Progress Bar */}
          <div className="flex items-center gap-1.5">
            <div
              className={`h-1.5 rounded-full transition-all ${
                step === 'STEP_REGISTER' ? 'w-10 bg-blue-600' : 'w-4 bg-emerald-500'
              }`}
            />
            <div
              className={`h-1.5 rounded-full transition-all ${
                step === 'STEP_OTP'
                  ? 'w-10 bg-blue-600'
                  : step === 'STEP_ONBOARDING'
                  ? 'w-4 bg-emerald-500'
                  : 'w-4 bg-slate-200 dark:bg-slate-700'
              }`}
            />
            <div
              className={`h-1.5 rounded-full transition-all ${
                step === 'STEP_ONBOARDING' ? 'w-10 bg-blue-600' : 'w-4 bg-slate-200 dark:bg-slate-700'
              }`}
            />
          </div>

          {/* Error & Success Alerts */}
          {errorMsg && (
            <div className="p-2.5 rounded-xl bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-300 text-xs font-semibold border border-red-200 dark:border-red-900/60 leading-relaxed animate-in fade-in">
              {errorMsg}
            </div>
          )}
          {successMsg && (
            <div className="p-2.5 rounded-xl bg-green-50 dark:bg-green-950/40 text-green-700 dark:text-green-300 text-xs font-semibold border border-green-200 dark:border-green-900/60 flex items-center gap-2 animate-in fade-in">
              <CheckCircle2 className="h-4 w-4 shrink-0 text-green-600" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Step Forms */}
          {step === 'STEP_REGISTER' && (
            <RegisterStepBasic
              formData={formData}
              setFormData={setFormData}
              loading={loading}
              onSubmit={handleRegisterStep1}
            />
          )}

          {step === 'STEP_OTP' && (
            <RegisterStepOtp
              registeredEmail={registeredEmail}
              otpCode={otpCode}
              setOtpCode={setOtpCode}
              loading={loading}
              onBackToRegister={() => setStep('STEP_REGISTER')}
              onResendOtp={handleResendOtp}
              onVerifyOtp={handleVerifyOtp}
            />
          )}

          {step === 'STEP_ONBOARDING' && (
            <RegisterStepOnboarding
              claimedSubdomain={claimedSubdomain}
              setClaimedSubdomain={setClaimedSubdomain}
              selectedCycle={selectedCycle}
              setSelectedCycle={setSelectedCycle}
              loading={loading}
              onComplete={handleCompleteOnboarding}
            />
          )}
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

export default function RegisterPage() {
  return (
    <Suspense
      fallback={
        <div className="h-screen flex items-center justify-center bg-white dark:bg-[#070A12]">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        </div>
      }
    >
      <RegisterForm />
    </Suspense>
  );
}
