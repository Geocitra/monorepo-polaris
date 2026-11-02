'use client';

import React from 'react';
import { Sparkles, FileText, Lightbulb } from 'lucide-react';

interface ThemeHeadlineBioCardProps {
  headlineTagline: string;
  onHeadlineTaglineChange: (val: string) => void;
  bioBiography: string;
  onBioBiographyChange: (val: string) => void;
}

export function ThemeHeadlineBioCard({
  headlineTagline,
  onHeadlineTaglineChange,
  bioBiography,
  onBioBiographyChange,
}: ThemeHeadlineBioCardProps) {
  return (
    <div className="p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-900/40 space-y-4">
      {/* TAGLINE VISI KEBIJAKAN */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5 uppercase tracking-wide">
            <Sparkles className="h-3.5 w-3.5 text-blue-500" />
            <span>Tagline Visi Kebijakan</span>
          </label>
          <span className="text-[10px] text-slate-400 font-mono">
            {headlineTagline.length} karakter
          </span>
        </div>
        <input
          type="text"
          required
          placeholder="Contoh: Mengawal aspirasi rakyat demi kemakmuran dan keadilan daerah."
          value={headlineTagline}
          onChange={(e) => onHeadlineTaglineChange(e.target.value)}
          className="block w-full rounded-xl border border-slate-200 dark:border-slate-700/80 bg-white dark:bg-slate-900 px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:border-blue-600 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-600 transition-all shadow-2xs"
        />
        <p className="text-[10.5px] text-slate-500 dark:text-slate-400">
          Tampil sebagai kutipan komitmen pembuka berwibawa di banner hero beranda.
        </p>
      </div>

      {/* BIOGRAFI & NARASI PENGABDIAN DEWAN (KHUSUS PROFIL) */}
      <div className="space-y-2 pt-3 border-t border-slate-200/60 dark:border-slate-800">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5 uppercase tracking-wide">
            <FileText className="h-3.5 w-3.5 text-blue-500" />
            <span>Biografi &amp; Narasi Pengabdian Dewan</span>
            <span className="text-[10px] font-normal text-blue-600 dark:text-blue-400 normal-case">(Khusus Halaman Profil Dewan)</span>
          </label>
          <div className="flex items-center gap-2 text-[10px] text-slate-400 font-mono">
            <span>{bioBiography.split('\n\n').filter((p) => p.trim()).length || 1} Paragraf</span>
            <span>•</span>
            <span>{bioBiography.length} karakter</span>
          </div>
        </div>
        <textarea
          rows={5}
          required
          placeholder="Tuliskan latar belakang pendidikan, nilai perjuangan, kisah pengabdian, dan komitmen legislasi Anda... (Tekan Enter 2x untuk membuat paragraf baru yang rapi di website)."
          value={bioBiography}
          onChange={(e) => onBioBiographyChange(e.target.value)}
          className="block w-full rounded-xl border border-slate-200 dark:border-slate-700/80 bg-white dark:bg-slate-900 p-3.5 text-xs sm:text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:border-blue-600 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-600 transition-all shadow-2xs resize-y leading-relaxed font-sans"
        />
        <div className="flex items-center gap-1.5 p-2 rounded-lg bg-blue-50/70 dark:bg-blue-950/40 border border-blue-100 dark:border-blue-900/50 text-blue-700 dark:text-blue-300 text-[11px]">
          <Lightbulb className="w-3.5 h-3.5 shrink-0 text-blue-600 dark:text-blue-400" />
          <span>
            <strong>Tips Penulisan Parlemen:</strong> Pisahkan antar-paragraf dengan menekan <em>Enter 2 kali</em> agar di website publik otomatis tampil berjarak rapi dan mudah dibaca oleh warga.
          </span>
        </div>
      </div>
    </div>
  );
}

