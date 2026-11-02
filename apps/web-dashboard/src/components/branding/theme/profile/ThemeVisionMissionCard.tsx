'use client';

import React from 'react';
import { Compass } from 'lucide-react';
import { VisionMissionItem } from '../types';

interface ThemeVisionMissionCardProps {
  currentVisionMission: VisionMissionItem[];
  handleUpdatePillar: (index: number, field: keyof VisionMissionItem, val: string) => void;
}

export function ThemeVisionMissionCard({
  currentVisionMission,
  handleUpdatePillar,
}: ThemeVisionMissionCardProps) {
  return (
    <div className="p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-900/40 space-y-3.5">
      <div className="flex items-center justify-between border-b border-slate-200/60 dark:border-slate-800 pb-2.5">
        <div>
          <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5 uppercase tracking-wide">
            <Compass className="h-3.5 w-3.5 text-amber-500" />
            <span>3 Pilar Fokus Pengabdian Parlemen</span>
          </h4>
          <p className="text-[10.5px] text-slate-500 dark:text-slate-400 mt-0.5">
            Ditampilkan secara elegan dalam kartu 3 pilar komitmen pada halaman Profil publik dewan.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3">
        {currentVisionMission.map((pillar, idx) => (
          <div
            key={idx}
            className="p-3.5 rounded-xl border border-slate-200/70 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-2 shadow-2xs"
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black uppercase tracking-wider text-amber-600 dark:text-amber-400 flex items-center gap-1.5">
                <span className="w-4 h-4 rounded-full bg-amber-100 dark:bg-amber-950/80 text-amber-700 dark:text-amber-300 flex items-center justify-center text-[9px] font-bold">
                  {idx + 1}
                </span>
                <span>Pilar Ke-{idx + 1}</span>
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <div>
                <label className="text-[10px] font-bold text-slate-600 dark:text-slate-400 uppercase block mb-1">
                  Label Fungsi
                </label>
                <input
                  type="text"
                  value={pillar.title}
                  onChange={(e) => handleUpdatePillar(idx, 'title', e.target.value)}
                  placeholder="Contoh: Fungsi Legislasi"
                  className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-2.5 py-1.5 text-xs text-slate-900 dark:text-white font-medium focus:border-blue-600 focus:outline-none"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-600 dark:text-slate-400 uppercase block mb-1">
                  Judul Komitmen
                </label>
                <input
                  type="text"
                  value={pillar.subtitle || ''}
                  onChange={(e) => handleUpdatePillar(idx, 'subtitle', e.target.value)}
                  placeholder="Contoh: Legislasikan Solusi Nyata"
                  className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-2.5 py-1.5 text-xs text-slate-900 dark:text-white font-medium focus:border-blue-600 focus:outline-none"
                />
              </div>
            </div>
            <div>
              <label className="text-[10px] font-bold text-slate-600 dark:text-slate-400 uppercase block mb-1">
                Uraian Perjuangan
              </label>
              <textarea
                rows={2}
                value={pillar.description}
                onChange={(e) => handleUpdatePillar(idx, 'description', e.target.value)}
                placeholder="Uraian komitmen nyata Anda untuk fungsi ini..."
                className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-2.5 py-1.5 text-xs text-slate-900 dark:text-white font-normal focus:border-blue-600 focus:outline-none resize-none"
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

