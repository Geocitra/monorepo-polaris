'use client';

import Image from 'next/image';
import { Image as ImageIcon, ShieldCheck } from 'lucide-react';

interface IllustrationPreset {
  id: string;
  name: string;
  url: string;
  caption: string;
  icon: string;
  tag: string;
}

interface PosterCanvasProps {
  title: string;
  lead: string;
  stats: {
    stat1: string;
    stat1Label: string;
    stat2: string;
    stat2Label: string;
    stat3: string;
    stat3Label: string;
    stat4: string;
    stat4Label: string;
  };
  activePresetId: string;
  activeImage: string;
  activeImageCaption: string;
  imageError: boolean;
  onSelectPreset: (preset: IllustrationPreset) => void;
  onImageError: () => void;
  presets: IllustrationPreset[];
  authorName?: string;
  partyAffiliation?: string;
}

export function PosterCanvas({
  title,
  lead,
  stats,
  activePresetId,
  activeImage,
  activeImageCaption,
  imageError,
  onSelectPreset,
  onImageError,
  presets,
  authorName = 'Anggota Dewan',
  partyAffiliation = 'Fraksi Parlemen',
}: PosterCanvasProps) {
  return (
    <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 pb-3 gap-2">
        <div>
          <span className="text-xs font-extrabold text-slate-700 uppercase tracking-wider flex items-center gap-2">
            <ImageIcon className="h-4 w-4 text-emerald-600" />
            <span>Pratinjau Visual Poster</span>
          </span>
          <p className="text-[11px] text-slate-500 mt-0.5">
            Pilih visual ilustrasi atau masukkan instruksi AI untuk kreasi baru
          </p>
        </div>

        {/* PRESET PILL BUTTONS */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {presets.map((preset) => (
            <button
              key={preset.id}
              type="button"
              onClick={() => onSelectPreset(preset)}
              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all ${
                activePresetId === preset.id && activeImage === preset.url
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              <span>{preset.icon}</span>
              <span>{preset.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* INFOGRAPHIC POSTER CANVAS */}
      <div className="relative rounded-2xl overflow-hidden border border-slate-200 bg-gradient-to-b from-slate-900 via-slate-800 to-slate-950 text-white shadow-md p-5 sm:p-6 space-y-4">
        {/* WATERMARK ATAS */}
        <div className="flex items-center justify-between text-[10px] font-extrabold uppercase tracking-widest text-blue-400 border-b border-slate-700/60 pb-2.5">
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="h-3.5 w-3.5 text-blue-400" />
            <span>POLARIS GOV • INFOGRAFIK KEBIJAKAN RESMI</span>
          </span>
          <span className="text-slate-400">TAHUN 2026</span>
        </div>

        {/* MAIN HEADLINE */}
        <h3 className="text-lg sm:text-xl font-black text-white tracking-tight leading-snug">
          {title}
        </h3>

        <p className="text-xs text-slate-300 leading-relaxed">
          {lead}
        </p>

        {/* KONTEN DUAL COLUMN: STAT BADGES + GAMBAR */}
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-center pt-2">
          {/* STAT BADGES COLUMN (KIRI 5 COL) */}
          <div className="sm:col-span-5 space-y-2.5">
            <div className="p-2.5 rounded-xl bg-slate-800/90 border border-blue-500/30">
              <div className="text-xl font-black text-blue-400 leading-none">{stats.stat1}</div>
              <div className="text-[10px] font-extrabold text-slate-200 mt-1 leading-tight">{stats.stat1Label}</div>
            </div>

            <div className="p-2.5 rounded-xl bg-slate-800/90 border border-emerald-500/30">
              <div className="text-xl font-black text-emerald-400 leading-none">{stats.stat2}</div>
              <div className="text-[10px] font-extrabold text-slate-200 mt-1 leading-tight">{stats.stat2Label}</div>
            </div>

            <div className="p-2.5 rounded-xl bg-slate-800/90 border border-amber-500/30">
              <div className="text-xl font-black text-amber-400 leading-none">{stats.stat3}</div>
              <div className="text-[10px] font-extrabold text-slate-200 mt-1 leading-tight">{stats.stat3Label}</div>
            </div>

            <div className="p-2.5 rounded-xl bg-slate-800/90 border border-teal-500/30">
              <div className="text-xl font-black text-teal-400 leading-none">{stats.stat4}</div>
              <div className="text-[10px] font-extrabold text-slate-200 mt-1 leading-tight">{stats.stat4Label}</div>
            </div>
          </div>

          {/* ILUSTRASI VISUAL CENTERPIECE (KANAN 7 COL) */}
          <div className="sm:col-span-7 relative rounded-xl overflow-hidden border border-slate-700/80 aspect-square sm:aspect-auto sm:h-64 bg-slate-950 flex items-center justify-center">
            {!imageError ? (
              <Image
                src={activeImage}
                alt="Infographic Visual Illustration"
                fill
                unoptimized
                priority
                onError={onImageError}
                className="object-cover transition-opacity duration-300"
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center p-4 bg-gradient-to-br from-blue-950 to-slate-900 text-slate-300 text-center">
                <ImageIcon className="h-10 w-10 text-blue-400 mb-2 opacity-80" />
                <span className="text-xs font-bold text-white">Visual Kanvas Kebijakan</span>
                <span className="text-[10px] text-slate-400 mt-1">DALL-E 3 High Resolution 300 DPI</span>
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent pointer-events-none" />
            <div className="absolute bottom-2 left-2 right-2 px-2.5 py-1.5 rounded-lg bg-slate-900/80 backdrop-blur-sm border border-slate-700/60 text-[10px] font-bold text-slate-200 text-center pointer-events-none">
              {activeImageCaption}
            </div>
          </div>
        </div>

        {/* FOOTER WATERMARK */}
        <div className="pt-2.5 border-t border-slate-700/80 flex items-center justify-between text-[10px] text-slate-400">
          <span className="font-semibold">
            Diinisiasi oleh: <strong className="text-white">{authorName}</strong> ({partyAffiliation})
          </span>
          <span className="font-mono text-blue-400 font-bold">polaris.id</span>
        </div>
      </div>
    </div>
  );
}
