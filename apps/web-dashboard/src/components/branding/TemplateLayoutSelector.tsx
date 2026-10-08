'use client';

import React from 'react';
import { Layout, Lock, CheckCircle2, Sparkles, Newspaper, Image, Layers } from 'lucide-react';
import { cn } from '@/lib/utils';
import { PortalTemplateId } from '@polaris/shared-types';

interface TemplateLayoutSelectorProps {
  selectedTemplateId: string;
  onSelectTemplate: (templateId: string) => void;
  planTier?: string | null;
  onUpgradePrompt?: () => void;
}

export const TEMPLATE_LAYOUTS = [
  {
    id: PortalTemplateId.STANDARD_DEFAULT,
    name: 'Standar Parlemen (Default)',
    tagline: 'Klasik, Resmi & Terstruktur',
    description: 'Tata letak institusional berbobot seimbang antara profil dewan, warta kinerja, dan kanal aspirasi warga.',
    icon: Layout,
    isPremium: false,
    previewBadge: 'Tersedia di Semua Paket',
  },
  {
    id: PortalTemplateId.EDITORIAL_PRESTIGE,
    name: 'Editorial Prestige',
    tagline: 'Intelektual & Analisis Kebijakan',
    description: 'Estetika jurnal kebijakan modern dengan tipografi serif elegan untuk publikasi naskah opini dan risalah legislatif.',
    icon: Newspaper,
    isPremium: true,
    previewBadge: 'Tier PRO (Eksekutif)',
  },
  {
    id: PortalTemplateId.BALIHO_HERO,
    name: 'Baliho Hero Karismatik',
    tagline: 'Visual Masif & Interaksi Konstituen',
    description: 'Hero banner berukuran masif dengan visual baliho digital interaktif untuk membangun resonansi emosional dapil.',
    icon: Image,
    isPremium: true,
    previewBadge: 'Tier PRO (Eksekutif)',
  },
  {
    id: PortalTemplateId.NEWSROOM_BRIEF,
    name: 'Newsroom Press Brief',
    tagline: 'Kanal Berita Dinamis Ruang Pers',
    description: 'Format agregasi siaran pers super responsif menyerupai biro pers kepresidenan untuk publikasi kegiatan harian tanpa jeda.',
    icon: Layers,
    isPremium: true,
    previewBadge: 'Tier PRO (Eksekutif)',
  },
];

export function TemplateLayoutSelector({
  selectedTemplateId,
  onSelectTemplate,
  planTier,
  onUpgradePrompt,
}: TemplateLayoutSelectorProps) {
  const isPremiumUnlocked = planTier === 'PRO';

  const handleSelect = (template: typeof TEMPLATE_LAYOUTS[0]) => {
    if (template.isPremium && !isPremiumUnlocked) {
      if (onUpgradePrompt) {
        onUpgradePrompt();
      } else {
        alert('Tata letak eksklusif ini memerlukan Paket PRO (Eksekutif Suite).');
      }
      return;
    }
    onSelectTemplate(template.id);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <label className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
            <Layout className="w-4 h-4 text-indigo-500" />
            <span>Tata Letak Halaman Utama Publik (Thematic Layout)</span>
          </label>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
            Pilih arsitektur visual portal publik Anda sesuai persona keparlemenan yang ingin dibangun.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {TEMPLATE_LAYOUTS.map((tpl) => {
          const Icon = tpl.icon;
          const isSelected = selectedTemplateId === tpl.id;
          const isLocked = tpl.isPremium && !isPremiumUnlocked;

          return (
            <div
              key={tpl.id}
              onClick={() => handleSelect(tpl)}
              className={cn(
                'relative p-4 rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between select-none group',
                isSelected
                  ? 'border-indigo-600 dark:border-indigo-500 bg-indigo-50/50 dark:bg-indigo-950/30 shadow-xs ring-2 ring-indigo-600/10'
                  : isLocked
                  ? 'border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-900/40 opacity-80 hover:opacity-100 hover:border-slate-300'
                  : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300 dark:hover:border-slate-700'
              )}
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <div
                      className={cn(
                        'w-8 h-8 rounded-xl flex items-center justify-center shrink-0',
                        isSelected
                          ? 'bg-indigo-600 text-white'
                          : isLocked
                          ? 'bg-slate-200 dark:bg-slate-800 text-slate-500'
                          : 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400'
                      )}
                    >
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-black text-slate-900 dark:text-white leading-tight">
                        {tpl.name}
                      </h4>
                      <p className="text-[10px] text-slate-400 dark:text-slate-500 font-medium">
                        {tpl.tagline}
                      </p>
                    </div>
                  </div>

                  {isLocked ? (
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                      <Lock className="w-3 h-3 text-amber-500" />
                      PRO
                    </span>
                  ) : isSelected ? (
                    <CheckCircle2 className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0" />
                  ) : null}
                </div>

                <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed mt-1">
                  {tpl.description}
                </p>
              </div>

              <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-[10px]">
                <span
                  className={cn(
                    'font-medium',
                    isSelected
                      ? 'text-indigo-600 dark:text-indigo-400 font-bold'
                      : isLocked
                      ? 'text-amber-600 dark:text-amber-400 flex items-center gap-1'
                      : 'text-slate-400'
                  )}
                >
                  {isSelected ? (
                    '● Layout Aktif'
                  ) : isLocked ? (
                    <>
                      <Sparkles className="w-2.5 h-2.5" />
                      Tingkatkan ke PRO
                    </>
                  ) : (
                    'Klik untuk terapkan'
                  )}
                </span>
                <span className="text-slate-400 dark:text-slate-500 font-mono text-[9px]">
                  {tpl.previewBadge}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
