'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Clock, ShieldAlert, ArrowRight, X } from 'lucide-react';
import { formatDateIndonesian } from '@/lib/utils';
import { Portal } from '@/components/ui/portal';

interface ExpiryAlertModalProps {
  currentPeriodEnd?: string | null;
  isSubActive: boolean;
}

export function ExpiryAlertModal({ currentPeriodEnd, isSubActive }: ExpiryAlertModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isToday, setIsToday] = useState(false);

  useEffect(() => {
    if (!isSubActive || !currentPeriodEnd) return;

    const endMs = new Date(currentPeriodEnd).getTime();
    const nowMs = Date.now();
    const diffHours = (endMs - nowMs) / (1000 * 60 * 60);

    // Trigger dialog if expiring in <= 36 hours (H-1 or Day of Expiry)
    if (diffHours <= 36 && diffHours > -24) {
      setIsToday(diffHours <= 12);
      const dismissed = sessionStorage.getItem('polaris_h1_notice_dismissed');
      if (!dismissed) {
        setIsOpen(true);
      }
    }
  }, [currentPeriodEnd, isSubActive]);

  function handleDismiss() {
    sessionStorage.setItem('polaris_h1_notice_dismissed', 'true');
    setIsOpen(false);
  }

  useEffect(() => {
    if (isOpen) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <Portal>
      <div className="fixed inset-0 !m-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 dark:bg-slate-950/80 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-white dark:bg-[#0E131F] rounded-3xl p-6 sm:p-7 shadow-2xl border border-amber-200 dark:border-amber-900/40 space-y-5 relative transition-colors duration-200">
        <button
          onClick={handleDismiss}
          className="absolute right-4 top-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          title="Tutup Notifikasi"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="flex items-center gap-3">
          <div className="h-11 w-11 rounded-2xl bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-400 flex items-center justify-center shrink-0">
            <Clock className="h-6 w-6" />
          </div>
          <div>
            <span className="text-[10px] font-black uppercase tracking-wider text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-500/10 px-2 py-0.5 rounded border border-amber-200 dark:border-amber-500/20">
              {isToday ? 'Pengingat Jatuh Tempo (Hari Ini)' : 'Pengingat Jatuh Tempo (H-1)'}
            </span>
            <h3 className="text-base font-black text-slate-900 dark:text-white mt-1">
              {isToday ? 'Masa Aktif Lisensi Berakhir Hari Ini' : 'Masa Aktif Lisensi Berakhir Besok'}
            </h3>
          </div>
        </div>

        <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
          Masa aktif lisensi POLARIS Anda{' '}
          {isToday ? 'berakhir pada hari ini' : 'akan berakhir pada'}{' '}
          <strong className="text-slate-900 dark:text-white">
            {currentPeriodEnd ? formatDateIndonesian(currentPeriodEnd) : 'segera'}
          </strong>
          . Untuk memastikan website publik resmi dan fitur asisten AI tidak mengalami jeda operasional, silakan lakukan perpanjangan paket.
        </p>

        <div className="p-3 bg-amber-50/70 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 rounded-xl text-[11px] text-amber-900 dark:text-amber-300 flex items-start gap-2">
          <ShieldAlert className="h-4 w-4 shrink-0 text-amber-700 dark:text-amber-400 mt-0.5" />
          <span>
            <strong>Data Anda Aman:</strong> Sisa hari yang ada tidak akan hangus saat perpanjangan, melainkan otomatis ditambahkan ke durasi paket baru.
          </span>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-2 pt-1">
          <Link href="/billing" onClick={handleDismiss} className="w-full">
            <Button className="w-full bg-primary hover:opacity-90 text-primary-foreground font-extrabold text-xs gap-1.5 py-2.5 shadow-sm">
              <span>Perpanjang Sekarang</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </Link>

          <Button
            variant="ghost"
            onClick={handleDismiss}
            className="w-full sm:w-auto text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 text-xs font-semibold shrink-0"
          >
            Nanti Saja
          </Button>
        </div>
      </div>
    </div>
    </Portal>
  );
}

