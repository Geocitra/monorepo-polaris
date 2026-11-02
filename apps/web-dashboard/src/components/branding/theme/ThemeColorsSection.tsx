'use client';

import React from 'react';
import {
  Palette,
  RotateCcw,
  CheckCircle2,
  Sparkles,
  Paintbrush,
  Check,
} from 'lucide-react';
import { ColorPicker } from '@/components/ui/color-picker';
import { cn } from '@/lib/utils';
import { TEMPLATE_DEFAULT_COLORS } from '@polaris/shared-types';
import {
  ColorPalette,
  CURATED_PALETTES,
  PARTY_PRESETS,
  DEFAULT_WEBSITE_COLORS,
} from './types';

interface ThemeColorsSectionProps {
  primaryColor: string;
  onPrimaryColorChange: (val: string) => void;
  secondaryColor: string;
  onSecondaryColorChange: (val: string) => void;
  layoutTemplateId: string;
  showCustomPicker: boolean;
  setShowCustomPicker: (show: boolean | ((prev: boolean) => boolean)) => void;
}

export function ThemeColorsSection({
  primaryColor,
  onPrimaryColorChange,
  secondaryColor,
  onSecondaryColorChange,
  layoutTemplateId,
  showCustomPicker,
  setShowCustomPicker,
}: ThemeColorsSectionProps) {
  const currentTemplateDefault =
    (TEMPLATE_DEFAULT_COLORS as any)[layoutTemplateId] || DEFAULT_WEBSITE_COLORS;

  const isTemplateDefaultColor =
    primaryColor.toLowerCase() === currentTemplateDefault.primary.toLowerCase();

  function applyPreset(p: ColorPalette) {
    onPrimaryColorChange(p.primary);
    onSecondaryColorChange(p.secondary);
  }

  function handleResetWebsiteDefaults() {
    onPrimaryColorChange(currentTemplateDefault.primary);
    onSecondaryColorChange(currentTemplateDefault.secondary);
  }

  return (
    <div className="space-y-6">
      {/* HEADER: TITLE & RESET BUTTON */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
        <div>
          <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
            <Palette className="h-4 w-4" style={{ color: primaryColor }} />
            Skema Warna Website Publik
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Pilih warna resmi partai atau palet terkurasi untuk publikasi portal.
          </p>
        </div>

        <button
          type="button"
          onClick={handleResetWebsiteDefaults}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 shadow-2xs transition-all shrink-0 cursor-pointer self-start sm:self-auto"
          title="Kembalikan warna ke skema bawaan template asli"
        >
          <RotateCcw className="h-3 w-3 text-slate-500" />
          <span>Reset Warna Default Template</span>
        </button>
      </div>

      {/* STATUS WARNA TERPILIH */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-slate-50 dark:bg-slate-900/60 p-3.5 rounded-2xl border border-slate-200/80 dark:border-slate-800">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2.5">
            <div
              className="h-8 w-8 rounded-xl shadow-inner border border-black/10 shrink-0"
              style={{ backgroundColor: primaryColor }}
            />
            <div>
              <span className="text-[9px] font-bold text-slate-400 uppercase block leading-none">
                Aksen Utama Web
              </span>
              <span className="text-xs font-mono font-bold text-slate-700 dark:text-slate-200">
                {primaryColor.toUpperCase()}
              </span>
            </div>
          </div>

          <div className="h-7 w-px bg-slate-200 dark:bg-slate-800" />

          <div className="flex items-center gap-2.5">
            <div
              className="h-8 w-8 rounded-xl shadow-inner border border-black/10 shrink-0"
              style={{ backgroundColor: secondaryColor }}
            />
            <div>
              <span className="text-[9px] font-bold text-slate-400 uppercase block leading-none">
                Warna Header/Nav
              </span>
              <span className="text-xs font-mono font-bold text-slate-700 dark:text-slate-200">
                {secondaryColor.toUpperCase()}
              </span>
            </div>
          </div>
        </div>

        {/* BADGE STATUS WARNA (DEFAULT TEMPLATE VS KUSTOM) */}
        <div>
          {isTemplateDefaultColor ? (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Warna Asli Template
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-800">
              <Sparkles className="w-3.5 h-3.5" />
              Warna Kustom Aktif
            </span>
          )}
        </div>
      </div>

      {/* SECTION: PALET WARNA TERKURASI (1-KLIK) */}
      <div className="space-y-2.5">
        <div>
          <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wide flex items-center gap-1.5">
            <Paintbrush className="h-3.5 w-3.5" style={{ color: primaryColor }} />
            Palet Warna Terkurasi Website
          </label>
          <p className="text-[11px] text-slate-400 mt-0.5">
            Kombinasi warna website resmi — klik langsung terlihat di simulator sebelah kanan.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 xl:grid-cols-4 gap-2.5">
          {CURATED_PALETTES.map((p) => {
            const active =
              primaryColor.toLowerCase() === p.primary.toLowerCase() &&
              secondaryColor.toLowerCase() === p.secondary.toLowerCase();

            return (
              <button
                key={p.name}
                type="button"
                onClick={() => applyPreset(p)}
                className={cn(
                  'group relative flex flex-col items-center gap-1 px-2.5 py-2.5 rounded-xl border text-center transition-all hover:shadow-md hover:scale-[1.02] cursor-pointer',
                  active
                    ? 'border-blue-600 bg-blue-50/50 dark:bg-blue-950/40 ring-2 ring-blue-500/20'
                    : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300 dark:hover:border-slate-700'
                )}
              >
                <div className="flex items-center gap-0.5">
                  <div
                    className="h-5 w-5 rounded-l-md shadow-xs border border-black/10"
                    style={{ backgroundColor: p.primary }}
                  />
                  <div
                    className="h-5 w-5 rounded-r-md shadow-xs border border-black/10"
                    style={{ backgroundColor: p.secondary }}
                  />
                </div>
                <span className="text-[10px] font-bold text-slate-700 dark:text-slate-300 truncate w-full mt-0.5">
                  {p.name}
                </span>
                {active && (
                  <div className="absolute -top-1 -right-1 h-3.5 w-3.5 rounded-full bg-blue-600 flex items-center justify-center shadow-xs">
                    <Check className="h-2 w-2 text-white stroke-[3]" />
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* SECTION: PRECISION COLOR PICKER */}
      <div className="space-y-3">
        <button
          type="button"
          onClick={() => setShowCustomPicker(!showCustomPicker)}
          className={cn(
            'w-full flex items-center justify-between px-4 py-3 rounded-xl border-2 border-dashed transition-all cursor-pointer',
            showCustomPicker
              ? 'border-blue-400 bg-blue-50/30 dark:bg-blue-950/20'
              : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300 dark:hover:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/40'
          )}
        >
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-rose-400 via-violet-500 to-cyan-400 flex items-center justify-center shadow-xs shrink-0">
              <Palette className="h-3.5 w-3.5 text-white" />
            </div>
            <div className="text-left">
              <span className="block text-xs font-extrabold text-slate-900 dark:text-white">
                Pilih Warna Kustom Presisi (Color Picker)
              </span>
              <span className="block text-[10px] text-slate-500 dark:text-slate-400">
                Sesuaikan rona dan saturasi warna secara presisi menggunakan spektrum interaktif.
              </span>
            </div>
          </div>
          <span className="text-[11px] font-bold text-blue-600 dark:text-blue-400 px-2.5 py-1 rounded-lg bg-blue-50 dark:bg-blue-950/50">
            {showCustomPicker ? 'Tutup Picker ▲' : 'Buka Color Picker ▼'}
          </span>
        </button>

        {showCustomPicker && (
          <div className="grid gap-4 sm:grid-cols-2 p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 animate-in slide-in-from-top-2 duration-200">
            <ColorPicker
              label="🎨 Warna Utama Website"
              value={primaryColor}
              onChange={(hex) => onPrimaryColorChange(hex.toUpperCase())}
            />
            <ColorPicker
              label="🌙 Warna Header / Panel"
              value={secondaryColor}
              onChange={(hex) => onSecondaryColorChange(hex.toUpperCase())}
            />
          </div>
        )}
      </div>

      {/* SECTION: PRESET PARTAI POLITIK */}
      <div className="space-y-2.5">
        <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wide block">
          🏛️ Preset Resmi Partai Politik
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {PARTY_PRESETS.map((p) => {
            const active =
              primaryColor.toLowerCase() === p.primary.toLowerCase() &&
              secondaryColor.toLowerCase() === p.secondary.toLowerCase();

            return (
              <button
                key={p.name}
                type="button"
                onClick={() => applyPreset(p)}
                className={cn(
                  'group relative flex items-center gap-2 px-2.5 py-2 rounded-xl border text-left transition-all hover:shadow-md hover:scale-[1.01] cursor-pointer',
                  active
                    ? 'border-blue-600 bg-blue-50/50 dark:bg-blue-950/40 ring-2 ring-blue-500/20'
                    : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300 dark:hover:border-slate-700'
                )}
              >
                <div className="flex items-center gap-0.5 shrink-0">
                  <div
                    className="h-5 w-5 rounded-l-md shadow-xs border border-black/10"
                    style={{ backgroundColor: p.primary }}
                  />
                  <div
                    className="h-5 w-3 rounded-r-sm shadow-xs border border-black/10"
                    style={{ backgroundColor: p.secondary }}
                  />
                </div>
                <span className="text-[10.5px] font-bold text-slate-700 dark:text-slate-300 truncate">
                  {p.name}
                </span>
                {active && (
                  <div className="absolute -top-1 -right-1 h-3.5 w-3.5 rounded-full bg-blue-600 flex items-center justify-center shadow-xs">
                    <Check className="h-2 w-2 text-white stroke-[3]" />
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

