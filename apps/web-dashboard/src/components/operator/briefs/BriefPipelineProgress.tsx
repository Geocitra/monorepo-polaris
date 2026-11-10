'use client';

import React from 'react';
import { PIPELINE_STEPS, getPipelineActiveIndex } from './briefUtils';

interface BriefPipelineProgressProps {
  status: string;
}

export const BriefPipelineProgress: React.FC<BriefPipelineProgressProps> = ({ status }) => {
  const activeIdx = getPipelineActiveIndex(status);
  const currentStep = PIPELINE_STEPS[activeIdx] || PIPELINE_STEPS[0];

  return (
    <div className="bg-slate-50/70 dark:bg-slate-900/40 rounded-xl p-3 border border-slate-200/70 dark:border-slate-800/80 space-y-2.5">
      {/* HEADER RINGKAS TAHAP PROGRES */}
      <div className="flex items-center justify-between text-xs">
        <div className="flex items-center gap-1.5 font-bold text-slate-700 dark:text-slate-200">
          <span className="text-indigo-600 dark:text-indigo-400 font-mono text-[11px]">
            Tahap {activeIdx + 1}/5:
          </span>
          <span>{currentStep.label}</span>
        </div>
        <span className="text-[11px] text-slate-400 font-medium">
          {activeIdx === 4 ? 'Selesai & Tayang' : 'Alur Produksi'}
        </span>
      </div>

      {/* 5-SEGMENT PROGRESS BAR MINIMALIS */}
      <div className="grid grid-cols-5 gap-1.5 w-full">
        {PIPELINE_STEPS.map((step, idx) => {
          const isCompleted = idx < activeIdx;
          const isCurrent = idx === activeIdx;

          return (
            <div key={step.key} className="flex flex-col gap-1">
              <div
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  isCompleted
                    ? 'bg-emerald-500'
                    : isCurrent
                    ? 'bg-indigo-600 shadow-xs'
                    : 'bg-slate-200 dark:bg-slate-800'
                }`}
              />
              <span
                className={`text-[10px] truncate ${
                  isCurrent
                    ? 'font-bold text-indigo-600 dark:text-indigo-400'
                    : isCompleted
                    ? 'font-medium text-emerald-700 dark:text-emerald-400'
                    : 'text-slate-400 dark:text-slate-600'
                }`}
              >
                {step.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

