'use client';

import { useState, useEffect } from 'react';
import {
  Loader2,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  ArrowUpRight,
} from 'lucide-react';
import { ApiClient } from '@/lib/api-client';

interface XPublishProgressModalProps {
  isOpen: boolean;
  jobId: string | null;
  accountHandle: string;
  textPreview: string;
  mediaUrl?: string;
  onClose: () => void;
  onSuccess?: (permalink: string) => void;
}

const TIMELINE_STEPS = [
  { id: 1, label: 'Menyiapkan naskah tweet & parameter thread...' },
  { id: 2, label: 'Mengunggah aset visual chunked ke Twitter Media API...' },
  { id: 3, label: 'Menerbitkan status & chaining thread ke linimasa X...' },
  { id: 4, label: 'Cuitan terverifikasi & live di linimasa X' },
];

export function XPublishProgressModal({
  isOpen,
  jobId,
  accountHandle,
  textPreview,
  mediaUrl,
  onClose,
  onSuccess,
}: XPublishProgressModalProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [status, setStatus] = useState<'RUNNING' | 'COMPLETED' | 'FAILED'>('RUNNING');
  const [permalink, setPermalink] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  const cleanHandle = accountHandle?.replace(/^@/, '') || 'user';

  useEffect(() => {
    if (!isOpen) {
      setCurrentStep(1);
      setStatus('RUNNING');
      setPermalink(null);
      setErrorMessage(null);
      setElapsedSeconds(0);
      return;
    }

    const timer = setInterval(() => {
      setElapsedSeconds((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen || !jobId) return;

    let isSubscribed = true;
    let pollInterval: NodeJS.Timeout;

    const pollJobStatus = async () => {
      try {
        const res = await ApiClient.request<any>(`/social/x/publish/status/${jobId}`);
        if (!isSubscribed || !res?.data) return;

        const job = res.data;

        if (job.status === 'PUBLISHED') {
          setCurrentStep(4);
          setStatus('COMPLETED');
          const postLink = job.metaPermalink || `https://x.com/${cleanHandle}/status/${job.metaPostId}`;
          setPermalink(postLink);
          if (onSuccess) onSuccess(postLink);
          clearInterval(pollInterval);
        } else if (job.status === 'FAILED') {
          setStatus('FAILED');
          setErrorMessage(job.lastErrorMessage || 'Gagal mempublikasikan cuitan ke X.');
          clearInterval(pollInterval);
        } else if (elapsedSeconds > 4) {
          setCurrentStep(3);
        } else if (elapsedSeconds > 1) {
          setCurrentStep(2);
        }
      } catch (err: any) {
        console.error('[XProgress] Polling error:', err);
      }
    };

    pollJobStatus();
    pollInterval = setInterval(pollJobStatus, 2500);

    return () => {
      isSubscribed = false;
      clearInterval(pollInterval);
    };
  }, [isOpen, jobId, cleanHandle, elapsedSeconds, onSuccess]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl p-6 overflow-hidden">
        {/* Ambient Glow */}
        <div className="absolute -top-16 -right-16 w-36 h-36 bg-black/10 dark:bg-white/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative space-y-5">
          {/* STATE 1: SEDANG BERJALAN (RUNNING) */}
          {status === 'RUNNING' && (
            <div className="space-y-4">
              <div className="text-center space-y-1">
                <div className="inline-flex items-center justify-center w-11 h-11 rounded-2xl bg-black text-white shadow-md mb-1 border border-slate-800">
                  <svg viewBox="0 0 24 24" aria-hidden="true" className="w-5 h-5 fill-current">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"></path>
                  </svg>
                </div>
                <h3 className="text-base font-black text-slate-900 dark:text-slate-100">
                  Menerbitkan ke X (Twitter)
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Mengirimkan cuitan resmi ke akun @{cleanHandle}...
                </p>
              </div>

              {/* Progress Bar */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center text-[10px] font-bold text-slate-500">
                  <span>Progres Pengiriman</span>
                  <span>{currentStep * 25}%</span>
                </div>
                <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-black dark:bg-white transition-all duration-500 ease-out rounded-full"
                    style={{ width: `${currentStep * 25}%` }}
                  />
                </div>
              </div>

              {/* Timeline Steps */}
              <div className="py-2 space-y-2 border-y border-slate-100 dark:border-slate-800/80">
                {TIMELINE_STEPS.map((step) => {
                  const isDone = currentStep > step.id;
                  const isCurrent = currentStep === step.id;

                  return (
                    <div key={step.id} className="flex items-center gap-2.5 text-xs">
                      {isDone ? (
                        <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                      ) : isCurrent ? (
                        <Loader2 className="h-4 w-4 text-slate-900 dark:text-white animate-spin shrink-0" />
                      ) : (
                        <div className="w-4 h-4 rounded-full border border-slate-300 dark:border-slate-700 flex items-center justify-center text-[9px] text-slate-400 shrink-0">
                          {step.id}
                        </div>
                      )}
                      <span
                        className={`truncate ${
                          isCurrent
                            ? 'font-bold text-slate-900 dark:text-white'
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

              {/* Footer info */}
              <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 pt-1">
                <span className="flex items-center gap-1.5 font-medium">
                  <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
                  X API v2 Official
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
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 shadow-xs">
                <CheckCircle2 className="h-6 w-6" />
              </div>

              <div>
                <h4 className="text-base font-black text-slate-900 dark:text-slate-100">
                  Resmi Mengudara di Linimasa X! 🚀
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Cuitan kini live di feed akun @{cleanHandle}.
                </p>
              </div>

              {/* Mini Card Pratinjau X */}
              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-850 border border-slate-200/70 dark:border-slate-800 flex items-center gap-3 text-left">
                {mediaUrl ? (
                  <div className="relative w-12 h-15 rounded-lg overflow-hidden shrink-0 border border-slate-200 dark:border-slate-700 bg-slate-200">
                    <img src={mediaUrl} alt="Thumbnail Media" className="w-full h-full object-cover" />
                  </div>
                ) : (
                  <div className="w-12 h-12 rounded-xl bg-black text-white flex items-center justify-center shrink-0">
                    <svg viewBox="0 0 24 24" aria-hidden="true" className="w-5 h-5 fill-current">
                      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"></path>
                    </svg>
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-900 dark:text-slate-100">
                    <span>@{cleanHandle}</span>
                    <span className="text-[10px] text-slate-400 font-normal">• Baru saja</span>
                  </div>
                  <p className="text-[11px] text-slate-600 dark:text-slate-400 line-clamp-2 mt-0.5 leading-tight">
                    {textPreview || 'Cuitan resmi dewan di linimasa X.'}
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
                    className="flex-1 inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-black hover:bg-slate-800 text-white font-bold text-xs shadow-md transition-all hover:scale-[1.01] cursor-pointer"
                  >
                    <span>Buka di X</span>
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
                  Publikasi ke X Gagal
                </h4>
                <p className="text-xs text-rose-600 dark:text-rose-400 mt-1 font-mono break-words bg-rose-50 dark:bg-rose-950/30 p-2.5 rounded-xl text-left">
                  {errorMessage || 'Sistem X API menolak permintaan penerbitan ini.'}
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

