'use client';

import React, { useState } from 'react';
import { Download, Maximize2, X, ArrowUpRight, FileText } from 'lucide-react';

interface PlatinumSlateInfografisGalleryClientProps {
  infographics: any[];
  member: any;
  theme: any;
  subdomain?: string;
}

export function PlatinumSlateInfografisGalleryClient({
  infographics = [],
  member,
  theme,
  subdomain,
}: PlatinumSlateInfografisGalleryClientProps) {
  const [activeModalInfo, setActiveModalInfo] = useState<any | null>(null);

  const displayList = infographics || [];

  const getInfographicImg = (item: any, idx: number) => {
    const fallbacks = [
      '/images/showcase-infografis-apbd.jpg',
      '/images/showcase-poster-surya.jpg',
      '/images/qurifolio/header-infografis-bg.jpg',
    ];
    return (
      item?.imageUrl ||
      item?.posterUrl ||
      item?.featuredImageUrl ||
      item?.coverImageUrl ||
      item?.thumbnail ||
      fallbacks[idx % fallbacks.length]
    );
  };

  return (
    <div className="py-10 sm:py-16 bg-[#0D1117] text-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 sm:space-y-10 text-left">
        
        {/* Gallery Section Counter Bar (No search or filter) */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 block font-mono">
              PANEL TRANSPARANSI PUBLIK
            </span>
            <h2 className="font-bebas text-2xl sm:text-3xl text-white tracking-wider mt-0.5">
              POSTER &amp; LEMBAR DATA CAPAIAN
            </h2>
          </div>
          <div className="flex items-center gap-2">
            <span className="px-3.5 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs font-mono text-slate-300">
              {displayList.length} DOKUMEN POSTER
            </span>
          </div>
        </div>

        {/* ─── TALL PORTRAIT POSTER SHOWCASE CARDS (ASPECT [3/4]) ─── */}
        {displayList.length === 0 ? (
          <div className="py-20 text-center space-y-3">
            <FileText className="w-10 h-10 text-slate-600 mx-auto" />
            <p className="text-sm text-slate-400">Belum ada dokumen infografis atau visualisasi capaian yang dipublikasikan saat ini.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {displayList.map((item: any, idx: number) => {
            const formattedIdx = String(idx + 1).padStart(2, '0');
            const imgSrc = getInfographicImg(item, idx);
            const statVal = item.statPrimary || item.stat || null;
            const statTxt = item.statLabel || item.metricLabel || null;

            return (
              <div
                key={item.id || idx}
                className="group rounded-3xl bg-[#151B23] border border-white/10 hover:border-white/30 transition-all duration-500 overflow-hidden shadow-2xl flex flex-col justify-between"
              >
                {/* 1. Card Top Dossier Bar: Serial + Category + Highlight Metric */}
                <div className="p-4 sm:p-5 border-b border-white/5 bg-[#181F28] flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-slate-400 tracking-wider">
                      INFO-{formattedIdx}
                    </span>
                    <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-white/10 text-slate-200 border border-white/15 uppercase tracking-wider">
                      {item.category || 'Transparansi'}
                    </span>
                  </div>

                  {/* Prominent Metric Stat Pill */}
                  {statVal && (
                    <div className="flex flex-col items-end">
                      <span className="font-bebas text-base sm:text-lg text-emerald-400 tracking-wider leading-none">
                        {statVal}
                      </span>
                      {statTxt && (
                        <span className="text-[8px] font-mono text-slate-400 uppercase tracking-tight">
                          {statTxt}
                        </span>
                      )}
                    </div>
                  )}
                </div>

                {/* 2. Card Center: Tall Portrait Poster Window (Aspect 3:4) */}
                <div
                  onClick={() => setActiveModalInfo(item)}
                  className="aspect-[3/4] bg-[#0E1013] relative overflow-hidden cursor-pointer group/poster"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={imgSrc}
                    alt={item.title}
                    className="absolute inset-0 w-full h-full object-cover object-top group-hover/poster:scale-105 transition-transform duration-700 brightness-95 group-hover/poster:brightness-105"
                    onError={(e) => {
                      const target = e.currentTarget;
                      const fallbacks = [
                        '/images/showcase-infografis-apbd.jpg',
                        '/images/showcase-poster-surya.jpg',
                        '/images/qurifolio/header-infografis-bg.jpg',
                      ];
                      target.src = fallbacks[idx % fallbacks.length];
                    }}
                  />

                  {/* Gradient Vignette */}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#151B23] via-transparent to-transparent opacity-80 pointer-events-none" />

                  {/* Interactive Hover Overlay Dock */}
                  <div className="absolute inset-0 bg-black/50 backdrop-blur-[2px] opacity-0 group-hover/poster:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-2.5 p-4">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveModalInfo(item);
                      }}
                      className="px-4 py-2 rounded-full bg-white text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-lg hover:scale-105 active:scale-95 transition-all cursor-pointer font-sans"
                    >
                      <Maximize2 className="w-3.5 h-3.5" />
                      <span>PERBESAR POSTER</span>
                    </button>
                    <a
                      href={imgSrc}
                      target="_blank"
                      rel="noopener noreferrer"
                      download
                      onClick={(e) => e.stopPropagation()}
                      className="p-2 rounded-full bg-black/70 backdrop-blur-md border border-white/20 text-white hover:bg-white hover:text-black transition-all cursor-pointer shadow-lg"
                      title="Unduh Resolusi Penuh"
                    >
                      <Download className="w-3.5 h-3.5" />
                    </a>
                  </div>

                  {/* Mobile Quick Tap Indicator */}
                  <div className="absolute bottom-3 right-3 z-10 sm:hidden">
                    <div className="p-2 rounded-full bg-black/70 backdrop-blur-md border border-white/20 text-white shadow-md">
                      <Maximize2 className="w-3.5 h-3.5" />
                    </div>
                  </div>
                </div>

                {/* 3. Card Bottom: Title, Excerpt & Dual Button Action Dock */}
                <div className="p-5 sm:p-6 space-y-4 bg-[#151B23]">
                  <div className="space-y-1.5 text-left">
                    <h3 className="text-base sm:text-lg font-bold text-white group-hover:text-slate-200 transition-colors line-clamp-2 leading-snug">
                      {item.title}
                    </h3>
                    <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                      {item.excerpt ||
                        'Visualisasi data capaian dan transparansi alokasi belanja daerah.'}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-white/5 flex items-center justify-between gap-3">
                    <button
                      type="button"
                      onClick={() => setActiveModalInfo(item)}
                      className="text-xs font-bold font-mono tracking-wider text-slate-300 hover:text-white flex items-center gap-1.5 transition-colors cursor-pointer group/btn"
                    >
                      <span>PRATINJAU DOKUMEN</span>
                      <ArrowUpRight className="w-3.5 h-3.5 group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5 transition-transform" />
                    </button>

                    <a
                      href={imgSrc}
                      target="_blank"
                      rel="noopener noreferrer"
                      download
                      className="p-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-slate-400 hover:text-white transition-all cursor-pointer flex items-center gap-1 text-[11px] font-mono"
                      title="Unduh Berkas Gambar"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">UNDUH</span>
                    </a>
                  </div>
                </div>

              </div>
            );
          })}
        </div>
        )}

      </div>

      {/* ─── MODAL PREVIEW DETAIL (HIGH RESOLUTION LIGHTBOX) ─── */}
      {activeModalInfo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative w-full max-w-3xl rounded-3xl bg-[#151B23] border border-white/20 p-6 sm:p-8 shadow-2xl space-y-6 text-left max-h-[92vh] overflow-y-auto">
            
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-white/10 pb-4 gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold tracking-widest uppercase text-slate-400 font-mono">
                    {activeModalInfo.category || 'Transparansi Data'}
                  </span>
                  {activeModalInfo.statPrimary && (
                    <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 text-[10px] font-mono font-bold border border-emerald-500/30">
                      {activeModalInfo.statPrimary}
                    </span>
                  )}
                </div>
                <h3 className="text-lg sm:text-2xl font-bold text-white leading-snug">
                  {activeModalInfo.title}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setActiveModalInfo(null)}
                className="p-2 rounded-full hover:bg-white/10 text-slate-400 hover:text-white transition-colors cursor-pointer shrink-0"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Infographic Poster Preview */}
            <div className="w-full max-h-[60vh] rounded-2xl bg-[#0B0D11] border border-white/10 relative overflow-hidden flex items-center justify-center p-2">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={getInfographicImg(activeModalInfo, 0)}
                alt={activeModalInfo.title}
                className="w-full h-auto max-h-[56vh] object-contain rounded-xl"
              />
            </div>

            {/* Modal Footer & Actions */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 pt-2 border-t border-white/5">
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <FileText className="w-4 h-4 text-slate-500 shrink-0" />
                <span>Format: Lembar Visualisasi Publikasi Digital Resmi</span>
              </div>

              <div className="flex items-center gap-3">
                <a
                  href={getInfographicImg(activeModalInfo, 0)}
                  target="_blank"
                  rel="noopener noreferrer"
                  download
                  className="px-4 py-2.5 rounded-full bg-white/10 hover:bg-white/20 border border-white/15 text-white font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Unduh Resolusi Penuh</span>
                </a>
                <button
                  type="button"
                  onClick={() => setActiveModalInfo(null)}
                  className="px-5 py-2.5 rounded-full bg-white text-slate-950 font-bold text-xs hover:bg-slate-200 transition-colors cursor-pointer"
                >
                  Tutup
                </button>
              </div>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
