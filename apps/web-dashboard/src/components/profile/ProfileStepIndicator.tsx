'use client';

import React from 'react';
import { 
  User, 
  MapPin, 
  GraduationCap, 
  Sparkles, 
  CheckCircle2, 
  ChevronRight, 
  ChevronLeft,
  Save,
  Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export type ProfileSessionStep = 1 | 2 | 3 | 4;

export interface StepMeta {
  step: ProfileSessionStep;
  title: string;
  shortTitle: string;
  description: string;
  icon: React.ElementType;
  isCompleted: boolean;
}

interface ProfileStepIndicatorProps {
  currentStep: ProfileSessionStep;
  onStepChange: (step: ProfileSessionStep) => void;
  completionMap: Record<ProfileSessionStep, boolean>;
  onSave: (e: React.FormEvent) => void;
  isSaving: boolean;
  onCancel: () => void;
}

export function ProfileStepIndicator({
  currentStep,
  onStepChange,
  completionMap,
  onSave,
  isSaving,
  onCancel,
}: ProfileStepIndicatorProps) {
  const steps: StepMeta[] = [
    {
      step: 1,
      title: 'Identitas Resmi & Foto',
      shortTitle: 'Identitas Dewan',
      description: 'Nama lengkap, kontak, fraksi, komisi, dan foto profil parlemen.',
      icon: User,
      isCompleted: !!completionMap[1],
    },
    {
      step: 2,
      title: 'Wilayah Dapil Konstituen',
      shortTitle: 'Wilayah Dapil',
      description: 'Provinsi, nama daerah pemilihan, dan cakupan kota/kabupaten.',
      icon: MapPin,
      isCompleted: !!completionMap[2],
    },
    {
      step: 3,
      title: 'Pendidikan & Kredensial',
      shortTitle: 'Pendidikan & Diklat',
      description: 'Riwayat pendidikan formal dan sertifikasi/diklat kepemimpinan dewan.',
      icon: GraduationCap,
      isCompleted: !!completionMap[3],
    },
    {
      step: 4,
      title: 'Fokus Isu & Grounding AI',
      shortTitle: 'Fokus Isu & Web',
      description: 'Minat isu kebijakan publik untuk grounding AI dan integrasi website.',
      icon: Sparkles,
      isCompleted: !!completionMap[4],
    },
  ];

  const currentMeta = steps.find((s) => s.step === currentStep) || steps[0];
  const progressPercent = Math.round((currentStep / steps.length) * 100);

  return (
    <div className="space-y-4">
      {/* 1. HORIZONTAL STEP TRACKER CARD */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xs">
        {/* Progress Header */}
        <div className="flex items-center justify-between pb-3.5 mb-3.5 border-b border-slate-100 dark:border-slate-800">
          <div>
            <div className="text-[10px] font-black uppercase tracking-wider text-blue-600 dark:text-blue-400">
              Panduan Pengisian Profil Bertahap
            </div>
            <h2 className="text-sm font-extrabold text-slate-900 dark:text-white mt-0.5">
              Sesi {currentStep} dari 4: {currentMeta.title}
            </h2>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-400 dark:text-slate-500">
              {progressPercent}% Lengkap
            </span>
            <div className="w-20 sm:w-28 h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
              <div 
                className="h-full bg-blue-600 transition-all duration-300 rounded-full"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        </div>

        {/* Desktop / Tablet Stepper (Clickable Tiles) */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5">
          {steps.map((s) => {
            const isActive = s.step === currentStep;
            const isDone = s.isCompleted;
            const Icon = s.icon;

            return (
              <button
                key={s.step}
                type="button"
                onClick={() => onStepChange(s.step)}
                className={cn(
                  'relative p-3 rounded-xl border text-left transition-all cursor-pointer flex items-center gap-3 select-none group',
                  isActive
                    ? 'border-blue-600 dark:border-blue-500 bg-blue-50/50 dark:bg-blue-950/30 shadow-xs ring-1 ring-blue-600/20'
                    : 'border-slate-200/80 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-900'
                )}
              >
                {/* Step Icon Badge */}
                <div
                  className={cn(
                    'h-8 w-8 rounded-lg flex items-center justify-center shrink-0 font-black text-xs transition-all',
                    isActive
                      ? 'bg-blue-600 text-white shadow-xs'
                      : isDone
                      ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 group-hover:bg-slate-200 dark:group-hover:bg-slate-700'
                  )}
                >
                  {isDone && !isActive ? (
                    <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                  ) : (
                    <Icon className="h-4 w-4" />
                  )}
                </div>

                {/* Step Info */}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500">
                      Sesi {s.step}
                    </span>
                    {isDone && (
                      <span className="text-[9px] font-extrabold text-emerald-600 dark:text-emerald-400 hidden xl:inline">
                        ● Siap
                      </span>
                    )}
                  </div>
                  <div
                    className={cn(
                      'text-xs font-black truncate',
                      isActive
                        ? 'text-blue-700 dark:text-blue-300'
                        : 'text-slate-800 dark:text-slate-200'
                    )}
                  >
                    {s.shortTitle}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. SESSION BANNER SUMMARY */}
      <div className="p-3.5 px-4 rounded-xl bg-gradient-to-r from-blue-50/80 via-white to-slate-50/50 dark:from-blue-950/20 dark:via-slate-900 dark:to-slate-900 border border-blue-100/80 dark:border-blue-900/40 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="h-7 w-7 rounded-lg bg-blue-600/10 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
            <currentMeta.icon className="h-4 w-4" />
          </div>
          <div>
            <div className="text-xs font-bold text-slate-900 dark:text-white">
              {currentMeta.title}
            </div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400">
              {currentMeta.description}
            </div>
          </div>
        </div>

        {/* Quick Session Switch Buttons */}
        <div className="flex items-center gap-1.5 shrink-0">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => onStepChange(Math.max(1, currentStep - 1) as ProfileSessionStep)}
            disabled={currentStep === 1}
            className="h-7 px-2 text-[11px] font-bold rounded-lg cursor-pointer"
          >
            <ChevronLeft className="h-3 w-3 mr-0.5" />
            <span className="hidden sm:inline">Sebelumnya</span>
          </Button>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => onStepChange(Math.min(4, currentStep + 1) as ProfileSessionStep)}
            disabled={currentStep === 4}
            className="h-7 px-2 text-[11px] font-bold rounded-lg cursor-pointer"
          >
            <span className="hidden sm:inline">Berikutnya</span>
            <ChevronRight className="h-3 w-3 ml-0.5" />
          </Button>
        </div>
      </div>
    </div>
  );
}
