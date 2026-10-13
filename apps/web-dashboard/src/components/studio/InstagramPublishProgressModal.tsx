'use client';

import * as React from 'react';
import {
  CheckCircle2,
  AlertCircle,
  Loader2,
  ExternalLink,
  ShieldCheck,
  Instagram,
  Sparkles,
  X,
  Clock,
  ArrowUpRight,
} from 'lucide-react';
import Image from 'next/image';
import { ApiClient } from '@/lib/api-client';

export interface InstagramPublishProgressModalProps {
  isOpen: boolean;
  onClose: () => void;
  jobId: string | null;
  accountHandle: string;
  posterUrl?: string;
  captionPreview?: string;
  slideCount?: number;
}

type StepStatus = 'WAITING' | 'IN_PROGRESS' | 'DONE' | 'ERROR';

const TIMELINE_STEPS = [
  { id: 1, label: 'Optimasi Rasio Kanvas 4:5' },
  { id: 2, label: 'Kirim Container ke Meta API' },
  { id: 3, label: 'Validasi Grafis Instagram' },
  { id: 4, label: 'Rilis Live ke Feed Akun' },
];

export function InstagramPublishProgressModal({
  isOpen,
  onClose,
  jobId,
  accountHandle,
  posterUrl,
  captionPreview,
  slideCount = 1,
}: InstagramPublishProgressModalProps) {
  const [currentStep, setCurrentStep] = React.useState<number>(1);
  const [status, setStatus] = React.useState<'PROCESSING' | 'COMPLETED' | 'FAILED'>('PROCESSING');
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);
  const [permalink, setPermalink] = React.useState<string | null>(null);
  const [elapsedSeconds, setElapsedSeconds] = React.useState<number>(0);

  // Reset state saat modal dibuka dengan job baru
  React.useEffect(() => {
    if (isOpen && jobId) {
      setCurrentStep(1);
      setStatus('PROCESSING');
      setErrorMessage(null);
      setPermalink(null);
      setElapsedSeconds(0);
    }
  }, [isOpen, jobId]);

  // Elapsed timer
  React.useEffect(() => {
    if (!isOpen || status !== 'PROCESSING') return;
    const interval = setInterval(() => {
      setElapsedSeconds((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [isOpen, status]);

  // Polling status job
  React.useEffect(() => {
    if (!isOpen || !jobId || status !== 'PROCESSING') return;

    let isMounted = true;
    let pollCount = 0;

    const pollJobStatus = async () => {
      try {
        pollCount++;
        const res = await ApiClient.request<any>(`/social/instagram/publish/status/${jobId}`);
        if (!isMounted || !res || !res.data) return;

        const job = res.data;
        const jobStatus = job.status;

        if (jobStatus === 'PENDING' || jobStatus === 'PREPARING_MEDIA') {
          setCurrentStep(1);
        } else if (jobStatus === 'CONTAINER_CREATED') {
          setCurrentStep(2);
        } else if (jobStatus === 'PROCESSING') {
          setCurrentStep(3);
        } else if (jobStatus === 'PUBLISHED') {
          setCurrentStep(4);
          setStatus('COMPLETED');
          setPermalink(job.metaPermalink || `https://instagram.com/${accountHandle}`);
          return;
        } else if (jobStatus === 'FAILED') {
          setStatus('FAILED');
          setErrorMessage(job.lastErrorMessage || 'Gagal memproses penerbitan ke Instagram.');
          return;
        }

        if (pollCount >= 3 && currentStep < 3 && jobStatus !== 'FAILED' && jobStatus !== 'PUBLISHED') {
          setCurrentStep(3);
        }
      } catch (err: any) {
        console.warn('[InstagramModal] Polling warn:', err);
      }
    };

    pollJobStatus();
    const intervalId = setInterval(pollJobStatus, 2500);

    return () => {
      isMounted = false;
      clearInterval(intervalId);
    };
  }, [isOpen, jobId, status, currentStep, accountHandle]);

  if (!isOpen) return null;

  const isLocked = status === 'PROCESSING';

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-in fade-in duration-200"
      onClick={() => {
        if (!isLocked) onClose();
      }}
    >
      <div
        className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Ramping & Anggun */}
        <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800/80 flex items-center justify-between bg-slate-50/60 dark:bg-slate-900/60">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600 text-white flex items-center justify-center shadow-xs">
              <Instagram className="h-4.5 w-4.5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 leading-tight">
                Publikasi Instagram
              </h3>
              <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
                Akun Resmi: <span className="font-semibold text-slate-700 dark:text-slate-300">@{accountHandle}</span>
              </p>
            </div>
          </div>

          {!isLocked && (
            <button
              onClick={onClose}
              className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Modal Body */}
        <div className="p-5">
          {/* STATE 1: SEDANG PROSES (PROCESSING) */}
          {status === 'PROCESSING' && (
            <div className="space-y-4">
              {/* Spinner & Highlight Status */}
              <div className="text-center py-2 space-y-1.5">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-purple-50 dark:bg-purple-950/50 text-purple-600 dark:text-purple-400 border border-purple-200/60 dark:border-purple-800/60 shadow-xs mb-1">
                  <Loader2 className="h-6 w-6 animate-spin" />
                </div>
                <h4 className="text-sm font-extrabold text-slate-900 dark:text-slate-100">
                  {TIMELINE_STEPS[currentStep - 1]?.label || 'Memproses Konten...'}
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xs mx-auto">
                  Menghubungkan payload visual dan naskah ke Meta Graph API v21.0.
                </p>
              </div>

              {/* Slim Progress Bar */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center text-[10px] font-bold text-slate-500">
                  <span>Progres Sistem</span>
                  <span>{currentStep * 25}%</span>
                </div>
                <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-purple-600 to-rose-500 transition-all duration-500 ease-out rounded-full"
                    style={{ width: `${currentStep * 25}%` }}
                  />
                </div>
              </div>

              {/* Minimalist Steps List (Bukan Card Besar) */}
              <div className="py-2 space-y-2 border-y border-slate-100 dark:border-slate-800/80">
                {TIMELINE_STEPS.map((step) => {
                  const isDone = currentStep > step.id;
                  const isCurrent = currentStep === step.id;

                  return (
                    <div key={step.id} className="flex items-center gap-2.5 text-xs">
                      {isDone ? (
                        <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                      ) : isCurrent ? (
                        <Loader2 className="h-4 w-4 text-purple-600 dark:text-purple-400 animate-spin shrink-0" />
                      ) : (
                        <div className="w-4 h-4 rounded-full border border-slate-300 dark:border-slate-700 flex items-center justify-center text-[9px] text-slate-400 shrink-0">
                          {step.id}
                        </div>
                      )}
                      <span
                        className={`truncate ${
                          isCurrent
                            ? 'font-bold text-purple-700 dark:text-purple-300'
                            : isDone
                            ? 'text-slate-700 dark:text-slate-300 line-through opacity-70'
                            : 'text-slate-400 dark:text-slate-500'
                        }`}
                      >
                        {step.label}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Anti-spam footer note */}
              <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 pt-1">
                <span className="flex items-center gap-1.5 font-medium">
                  <ShieldCheck className="h-3.5 w-3.5 text-amber-500" />
                  Anti-spam lock aktif
                </span>
                <span className="font-mono text-[10px] bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full font-bold">
                  {elapsedSeconds}s
                </span>
              </div>
            </div>
          )}

          {/* STATE 2: SUKSES TERBIT (COMPLETED) */}
          {status === 'COMPLETED' && (
            <div className="space-y-4 text-center animate-in zoom-in-95">
              {/* Badge Centang Sukses */}
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 shadow-xs">
                <CheckCircle2 className="h-6 w-6" />
              </div>

              <div>
                <h4 className="text-base font-black text-slate-900 dark:text-slate-100">
                  Resmi Mengudara di Instagram! 🎉
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Konten dan poster kini dapat dilihat di feed @{accountHandle}.
                </p>
              </div>

              {/* Mini Card Pratinjau Postingan */}
              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-850 border border-slate-200/70 dark:border-slate-800 flex items-center gap-3 text-left">
                {posterUrl ? (
                  <div className="relative w-12 h-15 rounded-lg overflow-hidden shrink-0 border border-slate-200 dark:border-slate-700 bg-slate-200">
                    <img
                      src={posterUrl}
                      alt="Thumbnail Poster"
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="w-12 h-15 rounded-lg bg-slate-200 dark:bg-slate-800 flex items-center justify-center shrink-0">
                    <Instagram className="h-5 w-5 text-slate-400" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-900 dark:text-slate-100">
                    <span>@{accountHandle}</span>
                    <span className="text-[10px] text-slate-400 font-normal">• Baru saja</span>
                    {slideCount > 1 && (
                      <span className="text-[9px] px-1.5 py-0.2 rounded-md bg-purple-100 dark:bg-purple-900/60 text-purple-700 dark:text-purple-300 font-extrabold">
                        Karusel {slideCount} Slide
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-600 dark:text-slate-400 line-clamp-2 mt-0.5 leading-tight">
                    {captionPreview || 'Postingan kampanye visual resmi dewan.'}
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex items-center gap-2">
                {permalink && (
                  <a
                    href={permalink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 via-pink-600 to-rose-600 hover:opacity-95 text-white font-bold text-xs shadow-md shadow-pink-500/20 transition-all hover:scale-[1.01] cursor-pointer"
                  >
                    <span>Buka di Instagram</span>
                    <ArrowUpRight className="h-4 w-4" />
                  </a>
                )}
                <button
                  onClick={onClose}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 font-bold text-xs transition-colors cursor-pointer"
                >
                  Selesai
                </button>
              </div>
            </div>
          )}

          {/* STATE 3: GAGAL (FAILED) */}
          {status === 'FAILED' && (
            <div className="space-y-4 text-center animate-in zoom-in-95">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800 shadow-xs">
                <AlertCircle className="h-6 w-6" />
              </div>

              <div>
                <h4 className="text-sm font-black text-rose-900 dark:text-rose-100">
                  Publikasi Gagal
                </h4>
                <p className="text-xs text-rose-600 dark:text-rose-400 mt-1 font-mono break-words bg-rose-50 dark:bg-rose-950/30 p-2.5 rounded-xl text-left">
                  {errorMessage || 'Sistem Meta menolak container media ini.'}
                </p>
              </div>

              <div className="pt-1 flex justify-center">
                <button
                  onClick={onClose}
                  className="px-5 py-2 rounded-xl bg-slate-900 dark:bg-slate-100 hover:opacity-90 text-white dark:text-slate-900 font-bold text-xs transition-all cursor-pointer"
                >
                  Tutup & Periksa Lagi
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
