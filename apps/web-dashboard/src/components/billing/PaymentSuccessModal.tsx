'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  CheckCircle2,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Receipt,
  Calendar,
  X,
  Zap,
} from 'lucide-react';
import { cn, formatDateIndonesian } from '@/lib/utils';

export interface PaymentSuccessDetails {
  invoiceNumber: string;
  planName: string;
  amountFormatted: string;
  validUntil: string;
  paymentType?: string;
}

interface PaymentSuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  details: PaymentSuccessDetails | null;
  targetRedirectUrl?: string;
}

export function PaymentSuccessModal({
  isOpen,
  onClose,
  details,
  targetRedirectUrl = '/studio/artikel',
}: PaymentSuccessModalProps) {
  const router = useRouter();
  const [countdown, setCountdown] = useState(5);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setCountdown(5);
      setIsPaused(false);
      return;
    }

    if (isPaused) return;

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          router.push(targetRedirectUrl);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isOpen, isPaused, targetRedirectUrl, router]);

  if (!isOpen || !details) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-950/80 backdrop-blur-md transition-opacity animate-in fade-in duration-200"
        onClick={() => {
          setIsPaused(true);
          onClose();
        }}
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden z-10 animate-in zoom-in-95 duration-200">
        {/* Glow Header Background */}
        <div className="absolute top-0 inset-x-0 h-32 bg-gradient-to-b from-emerald-500/20 via-emerald-500/5 to-transparent pointer-events-none" />

        <button
          onClick={() => {
            setIsPaused(true);
            onClose();
          }}
          className="absolute top-4 right-4 p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer z-10"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="p-6 sm:p-8 text-center relative">
          {/* Animated Icon Centered */}
          <div className="relative mx-auto mb-4 h-20 w-20 flex items-center justify-center">
            <span className="absolute inset-0 rounded-full bg-emerald-500/20 animate-ping duration-1000" />
            <div className="relative h-16 w-16 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-400 text-white flex items-center justify-center shadow-lg shadow-emerald-500/30">
              <CheckCircle2 className="h-9 w-9 stroke-[2.5]" />
            </div>
          </div>

          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 mb-2">
            <ShieldCheck className="h-3.5 w-3.5" />
            <span>Midtrans Terverifikasi Lunas</span>
          </span>

          <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            Pembayaran Lisensi Berhasil!
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-1 max-w-sm mx-auto">
            Selamat, akun Parlemen Eksekutif Anda telah aktif penuh dengan akses AI tanpa batas.
          </p>

          {/* Rincian Transaksi */}
          <div className="mt-6 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 text-left space-y-2.5">
            <div className="flex items-center justify-between text-xs pb-2 border-b border-slate-200 dark:border-slate-700/60">
              <span className="text-slate-500 dark:text-slate-400 font-semibold flex items-center gap-1.5">
                <Receipt className="h-3.5 w-3.5 text-primary" />
                <span>Nomor Invoice:</span>
              </span>
              <span className="font-mono font-bold text-slate-900 dark:text-slate-100">
                {details.invoiceNumber}
              </span>
            </div>

            <div className="flex items-center justify-between text-xs pb-2 border-b border-slate-200 dark:border-slate-700/60">
              <span className="text-slate-500 dark:text-slate-400 font-semibold flex items-center gap-1.5">
                <Zap className="h-3.5 w-3.5 text-amber-500" />
                <span>Paket Langganan:</span>
              </span>
              <span className="font-extrabold text-primary">
                {details.planName}
              </span>
            </div>

            <div className="flex items-center justify-between text-xs pb-2 border-b border-slate-200 dark:border-slate-700/60">
              <span className="text-slate-500 dark:text-slate-400 font-semibold flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5 text-emerald-500" />
                <span>Masa Aktif Hingga:</span>
              </span>
              <span className="font-bold text-emerald-700 dark:text-emerald-400">
                {details.validUntil}
              </span>
            </div>

            <div className="flex items-center justify-between text-xs pt-1">
              <span className="text-slate-500 dark:text-slate-400 font-semibold">Total Pembayaran:</span>
              <span className="text-sm font-black text-slate-900 dark:text-white">
                {details.amountFormatted}
              </span>
            </div>
          </div>

          {/* Countdown Redirect Banner */}
          <div className="mt-5 p-3 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-between text-xs">
            <span className="text-primary font-medium text-[11px]">
              {isPaused ? (
                <span>Pengalihan otomatis dijeda.</span>
              ) : (
                <span>
                  Mengalihkan ke Studio Artikel dalam <strong className="font-mono font-black text-primary">{countdown}</strong> detik...
                </span>
              )}
            </span>
            {!isPaused && (
              <button
                type="button"
                onClick={() => setIsPaused(true)}
                className="text-[10px] font-bold text-primary hover:underline cursor-pointer"
              >
                Jeda
              </button>
            )}
          </div>

          {/* Action Buttons */}
          <div className="mt-5 flex flex-col sm:flex-row items-center gap-2.5">
            <button
              type="button"
              onClick={() => {
                onClose();
                router.push(targetRedirectUrl);
              }}
              className="w-full flex-1 flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-xs font-black text-white bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 hover:from-emerald-700 hover:to-teal-800 shadow-md shadow-emerald-500/20 transition-all cursor-pointer"
            >
              <span>Mulai Buat Naskah Kebijakan</span>
              <ArrowRight className="h-4 w-4" />
            </button>

            <button
              type="button"
              onClick={() => {
                setIsPaused(true);
                onClose();
              }}
              className="w-full sm:w-auto px-4 py-3 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              Tetap di Sini
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
