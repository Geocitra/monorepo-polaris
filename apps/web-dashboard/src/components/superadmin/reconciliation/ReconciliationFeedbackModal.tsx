'use client';

import React, { useEffect } from 'react';
import { CheckCircle2, ShieldAlert, AlertTriangle } from 'lucide-react';
import { Portal } from '@/components/ui/portal';

export interface ReconciliationFeedback {
  show: boolean;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  badge?: string;
}

interface ReconciliationFeedbackModalProps {
  feedback: ReconciliationFeedback | null;
  onClose: () => void;
}

export function ReconciliationFeedbackModal({
  feedback,
  onClose,
}: ReconciliationFeedbackModalProps) {
  const isOpen = Boolean(feedback?.show);

  useEffect(() => {
    if (isOpen) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [isOpen]);

  if (!isOpen || !feedback) return null;

  return (
    <Portal>
      <div className="fixed inset-0 !m-0 z-[60] flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
        <div className="w-full max-w-sm bg-white dark:bg-[#0E131F] rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl p-6 text-center space-y-4 animate-in zoom-in-95 duration-200">
          {/* Animated Icon Container */}
          <div className="flex justify-center pt-2">
            {feedback.type === 'success' ? (
              <div className="h-16 w-16 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border-2 border-emerald-500/30 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shadow-lg shadow-emerald-500/10">
                <CheckCircle2 className="h-9 w-9 stroke-[2.5]" />
              </div>
            ) : feedback.type === 'error' ? (
              <div className="h-16 w-16 rounded-full bg-rose-50 dark:bg-rose-950/60 border-2 border-rose-500/30 text-rose-600 dark:text-rose-400 flex items-center justify-center shadow-lg shadow-rose-500/10">
                <ShieldAlert className="h-9 w-9 stroke-[2.5]" />
              </div>
            ) : (
              <div className="h-16 w-16 rounded-full bg-amber-50 dark:bg-amber-950/60 border-2 border-amber-500/30 text-amber-600 dark:text-amber-400 flex items-center justify-center shadow-lg shadow-amber-500/10">
                <AlertTriangle className="h-9 w-9 stroke-[2.5]" />
              </div>
            )}
          </div>

          {/* Title & Badge & Message */}
          <div className="space-y-1.5">
            {feedback.badge && (
              <span className="inline-block px-3 py-0.5 rounded-full text-[10px] font-black uppercase font-mono tracking-wider bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 mb-1">
                Status: {feedback.badge}
              </span>
            )}
            <h3 className="text-base font-black text-slate-900 dark:text-white tracking-tight">
              {feedback.title}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              {feedback.message}
            </p>
          </div>

          {/* Action Button */}
          <div className="pt-2">
            <button
              type="button"
              onClick={onClose}
              className="w-full py-2.5 px-4 rounded-xl font-bold text-xs text-white shadow-sm transition-all cursor-pointer bg-blue-600 hover:bg-blue-700 active:scale-98"
            >
              Mengerti & Lanjutkan
            </button>
          </div>
        </div>
      </div>
    </Portal>
  );
}
