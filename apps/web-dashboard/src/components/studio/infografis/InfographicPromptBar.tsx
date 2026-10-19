'use client';

import { useState } from 'react';
import {
  Send,
  Sparkles,
  BarChart3,
  Camera,
  Palette,
  Loader2,
  Lightbulb,
  Ratio,
  Maximize2,
} from 'lucide-react';
import { VisualStyle, AspectRatio } from './InfographicTypes';
import { Button } from '@/components/ui/button';

interface InfographicPromptBarProps {
  prompt: string;
  onPromptChange: (val: string) => void;
  selectedStyle: VisualStyle;
  onStyleChange: (style: VisualStyle) => void;
  selectedAspectRatio: AspectRatio;
  onAspectRatioChange: (ratio: AspectRatio) => void;
  onSubmit: (e?: React.FormEvent, customPrompt?: string) => void;
  loading: boolean;
  isUnpaid: boolean;
  hasExistingIteration: boolean;
}

const STYLE_OPTIONS = [
  {
    id: 'infographic' as VisualStyle,
    name: 'Infografis Data',
    icon: BarChart3,
    desc: 'Statistik, perbandingan angka & ringkasan indikator kebijakan',
    defaultRatio: '16:9' as AspectRatio,
  },
  {
    id: 'poster' as VisualStyle,
    name: 'Poster Kebijakan',
    icon: Palette,
    desc: 'Desain poster editorial, headline advokasi publik & tata letak resmi',
    defaultRatio: '3:4' as AspectRatio,
  },
];

const ASPECT_RATIOS: { id: AspectRatio; label: string; desc: string; iconShape: string }[] = [
  { id: '16:9', label: '16:9', desc: 'Landscape / Banner Web', iconShape: 'w-5 h-3' },
  { id: '1:1', label: '1:1', desc: 'Feed Instagram / Persegi', iconShape: 'w-4 h-4' },
  { id: '9:16', label: '9:16', desc: 'Story / Reels / TikTok', iconShape: 'w-3 h-5' },
  { id: '4:3', label: '4:3', desc: 'Presentasi Standar', iconShape: 'w-4 h-3' },
  { id: '3:4', label: '3:4', desc: 'Poster Cetak / Vertikal', iconShape: 'w-3 h-4' },
];

const SUGGESTIONS = [
  'Kondisi jalan rusak dan upaya perbaikan PUPR di Sukabumi',
  'Pemberian bibit padi dan pupuk subsidi bagi kelompok tani',
  'Alokasi anggaran APBD pendidikan dan beasiswa siswa berprestasi',
  'Pelayanan kesehatan puskesmas keliling untuk lansia desa',
];

const REVISION_CHIPS = [
  'Buat visual bernuansa pedesaan Jawa Barat',
  'Perjelas elemen data dan angka statistiknya',
  'Beri suasana lebih hangat dan ramah warga',
  'Tingkatkan kesan resmi dan wibawa kebijakan',
];

export function InfographicPromptBar({
  prompt,
  onPromptChange,
  selectedStyle,
  onStyleChange,
  selectedAspectRatio,
  onAspectRatioChange,
  onSubmit,
  loading,
  isUnpaid,
  hasExistingIteration,
}: InfographicPromptBarProps) {
  const handleSelectStyle = (opt: (typeof STYLE_OPTIONS)[number]) => {
    onStyleChange(opt.id);
    if (opt.id === 'poster' && (selectedAspectRatio === '16:9' || selectedAspectRatio === '4:3')) {
      onAspectRatioChange('3:4');
    } else if (opt.id === 'infographic' && (selectedAspectRatio === '3:4' || selectedAspectRatio === '9:16')) {
      onAspectRatioChange('16:9');
    }
  };

  const isPoster = selectedStyle === 'poster';

  return (
    <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 sm:p-6 shadow-sm space-y-4">
      {/* HEADER: KONTROL GAYA VISUAL & RASIO UKURAN */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          <span className="text-xs font-black uppercase tracking-wider text-slate-800 dark:text-slate-200">
            {hasExistingIteration ? 'Revisi & Asah Visual (AI Refine)' : 'Prompt Desain AI'}
          </span>
        </div>

        {/* CONTROLS: 2 PILIHAN FORMAT UTAMA (INFOGRAFIS VS POSTER) & RASIO */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* 2 PILIHAN UTAMA: INFOGRAFIS vs POSTER */}
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800/80 p-1 rounded-xl border border-slate-200/80 dark:border-slate-700/60">
            {STYLE_OPTIONS.map((opt) => {
              const Icon = opt.icon;
              const isSelected = selectedStyle === opt.id;

              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => handleSelectStyle(opt)}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-2xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                  title={opt.desc}
                >
                  <Icon className="h-3.5 w-3.5" />
                  <span>{opt.name}</span>
                </button>
              );
            })}
          </div>

          {/* PILIHAN RASIO ASPEK (UKURAN TARGET) */}
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800/80 p-1 rounded-xl border border-slate-200/80 dark:border-slate-700/60">
            <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 px-1 hidden sm:inline">
              Rasio:
            </span>
            {ASPECT_RATIOS.map((r) => {
              const isSelected = selectedAspectRatio === r.id;

              return (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => onAspectRatioChange(r.id)}
                  className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] font-mono font-bold transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-blue-600 text-white shadow-2xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                  title={`${r.label} — ${r.desc}`}
                >
                  <span>{r.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* INPUT FORM */}
      <form onSubmit={(e) => onSubmit(e)} className="space-y-3">
        <div className="relative">
          <textarea
            rows={3}
            value={prompt}
            onChange={(e) => onPromptChange(e.target.value)}
            placeholder={
              hasExistingIteration
                ? `Ketik instruksi revisi (contoh: "Perjelas kutipan headline dan sesuaikan warna aksen...")`
                : isPoster
                ? `Tuliskan topik poster kebijakan atau aspirasi publik yang ingin dirancang (contoh: "Poster advokasi peningkatan beasiswa santri dan siswa berprestasi di pedesaan...")`
                : `Tuliskan ide infografis data atau indikator capaian yang ingin divisualisasikan (contoh: "Infografis pemerataan akses internet di sekolah 3T dengan data alokasi dana desa...")`
            }
            className="w-full p-4 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50/70 dark:bg-slate-800/60 text-xs sm:text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-blue-600 dark:focus:border-blue-500 focus:bg-white dark:focus:bg-slate-800 transition-all resize-none"
          />

          <div className="flex items-center justify-between pt-2">
            <span className="text-[11px] text-slate-400 dark:text-slate-500 hidden sm:inline">
              {hasExistingIteration
                ? `Setiap revisi akan otomatis menciptakan iterasi/versi baru dalam format ${selectedAspectRatio}.`
                : isPoster
                ? `AI akan merancang poster kebijakan resmi berstandar publikasi editorial sesuai arahan dan rasio ${selectedAspectRatio}.`
                : `AI akan menyusun infografis data kebijakan terstruktur sesuai arahan dan rasio ${selectedAspectRatio}.`}
            </span>

            <Button
              type="submit"
              disabled={loading || !prompt.trim()}
              className="ml-auto bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs shadow-md gap-2 px-5 py-2.5 rounded-xl cursor-pointer"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Sedang Merancang Visual...</span>
                </>
              ) : (
                <>
                  <Send className="h-3.5 w-3.5" />
                  <span>
                    {hasExistingIteration
                      ? 'Buat Versi Baru'
                      : isPoster
                      ? 'Rancang Poster'
                      : 'Rancang Infografis'}
                  </span>
                </>
              )}
            </Button>
          </div>
        </div>

        {/* CHIP REKOMENDASI CEPAT */}
        <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80">
          <div className="flex items-center gap-1.5 mb-1.5 text-[10.5px] font-bold text-slate-400 dark:text-slate-500">
            <Lightbulb className="h-3.5 w-3.5 text-amber-500" />
            <span>{hasExistingIteration ? 'Saran Instruksi Revisi Cepat:' : 'Contoh Isu Populer:'}</span>
          </div>

          <div className="flex flex-wrap gap-1.5">
            {(hasExistingIteration ? REVISION_CHIPS : SUGGESTIONS).map((chip) => (
              <button
                key={chip}
                type="button"
                onClick={() => onPromptChange(chip)}
                className="text-[11px] px-2.5 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-slate-700 hover:text-blue-700 dark:hover:text-blue-300 text-slate-600 dark:text-slate-400 font-semibold transition-colors text-left cursor-pointer"
              >
                + {chip}
              </button>
            ))}
          </div>
        </div>
      </form>
    </div>
  );
}
