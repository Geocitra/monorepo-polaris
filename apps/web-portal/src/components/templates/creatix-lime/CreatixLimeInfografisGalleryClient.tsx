'use client';

import React, { useState } from 'react';
import {
  Maximize2,
  X,
  Download,
  Share2,
  Calendar,
  FileText,
  ArrowUpRight,
} from 'lucide-react';
import { formatDateIndonesian } from '@/lib/utils';
import { LimeSparkle } from './CreatixLimeShell';

interface CreatixLimeInfografisGalleryClientProps {
  initialInfographics: any[];
  member: any;
  theme?: any;
}

export function CreatixLimeInfografisGalleryClient({
  initialInfographics = [],
  member,
  theme,
}: CreatixLimeInfografisGalleryClientProps) {
  const [selectedInfographic, setSelectedInfographic] = useState<any | null>(null);
  const [copied, setCopied] = useState(false);

  const getInfographicImage = (info: any): string => {
    return (
      info?.imageUrl ||
      info?.posterUrl ||
      info?.featuredImageUrl ||
      info?.coverUrl ||
      info?.coverImageUrl ||
      info?.thumbnailUrl ||
      info?.fileUrl ||
      '/images/showcase-infografis-apbd.jpg'
    );
  };

  const handleCopyLink = (info: any) => {
    const url = typeof window !== 'undefined' ? window.location.href : '';
    if (navigator.clipboard) {
      navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 space-y-12">
      
      {/* ──────────────────────────────────────────────────────────────────────────
          1. INFOGRAPHICS GRID
          ────────────────────────────────────────────────────────────────────────── */}
      {initialInfographics.length === 0 ? (
        <div className="p-12 text-center rounded-3xl bg-[#0D120D] border border-white/10 text-slate-400 max-w-xl mx-auto space-y-3">
          <FileText className="w-10 h-10 text-[#84CC16]/60 mx-auto" />
          <h4 className="text-base font-bold text-white">
            Belum Ada Infografis Dipublikasikan
          </h4>
          <p className="text-xs text-slate-400">
            Publikasi visualisasi data pokok-pokok pikiran dan realisasi anggaran dewan sedang dipersiapkan.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {initialInfographics.map((info, idx) => {
            const posterImg = getInfographicImage(info);
            return (
              <div
                key={info.id || idx}
                onClick={() => setSelectedInfographic(info)}
                className="group relative rounded-3xl overflow-hidden bg-[#0D120D] border border-white/10 hover:border-[#84CC16]/60 transition-all cursor-pointer shadow-xl flex flex-col justify-between"
              >
                {/* Poster Image (4:5 Aspect Ratio) */}
                <div className="relative aspect-[4/5] w-full overflow-hidden bg-slate-900">
                  <img
                    src={posterImg}
                    alt={info.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/images/showcase-infografis-apbd.jpg';
                    }}
                  />

                  {/* Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-80 group-hover:opacity-50 transition-opacity" />

                  {/* Hover Zoom Icon */}
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="w-12 h-12 rounded-full bg-[#84CC16] text-black flex items-center justify-center shadow-xl">
                      <Maximize2 className="w-5 h-5" />
                    </div>
                  </div>

                  {/* Category Tag */}
                  <div className="absolute top-3 left-3 z-10">
                    <span className="px-2.5 py-1 rounded-md bg-black/70 backdrop-blur-md border border-white/10 text-[10px] font-bold text-[#84CC16] uppercase tracking-wider">
                      {info.category || 'Data Publik'}
                    </span>
                  </div>
                </div>

                {/* Card Bottom Meta */}
                <div className="p-5 flex-1 flex flex-col justify-between bg-[#0E140E]">
                  <h3 className="text-sm sm:text-base font-bold text-white group-hover:text-[#84CC16] transition-colors line-clamp-2 leading-snug">
                    {info.title}
                  </h3>
                  <div className="flex items-center justify-between text-xs text-slate-400 mt-4 pt-3 border-t border-white/5">
                    <span className="text-[11px] flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-[#84CC16]" />
                      {formatDateIndonesian(info.publishedAt || info.createdAt)}
                    </span>
                    <span className="text-[#84CC16] font-bold text-[11px] flex items-center gap-1">
                      Buka Poster
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ──────────────────────────────────────────────────────────────────────────
          2. LIGHTBOX MODAL
          ────────────────────────────────────────────────────────────────────────── */}
      {selectedInfographic && (
        <div
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 sm:p-6"
          onClick={() => setSelectedInfographic(null)}
        >
          <div
            className="relative max-w-4xl w-full bg-[#0D120D] border border-white/15 rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[92vh]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between bg-[#080B08]">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#84CC16]">
                  {selectedInfographic.category || 'Publikasi Data'}
                </span>
                <h3 className="text-sm sm:text-base font-bold text-white line-clamp-1">
                  {selectedInfographic.title}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedInfographic(null)}
                className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Image Body */}
            <div className="p-4 sm:p-6 overflow-y-auto flex-1 flex items-center justify-center bg-black/50">
              <img
                src={getInfographicImage(selectedInfographic)}
                alt={selectedInfographic.title}
                className="max-h-[70vh] w-auto object-contain rounded-2xl shadow-xl"
              />
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-white/10 flex items-center justify-between bg-[#0A0E0A] flex-wrap gap-3">
              <span className="text-xs text-slate-400">
                {formatDateIndonesian(selectedInfographic.publishedAt || selectedInfographic.createdAt)}
              </span>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleCopyLink(selectedInfographic)}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full border border-white/20 text-white font-bold text-xs uppercase tracking-wider hover:bg-white/10 transition-colors cursor-pointer"
                >
                  <Share2 className="w-3.5 h-3.5 text-[#84CC16]" />
                  <span>{copied ? 'Tersalin!' : 'Bagikan'}</span>
                </button>

                <a
                  href={getInfographicImage(selectedInfographic)}
                  download
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#84CC16] text-black font-black text-xs uppercase tracking-wider hover:bg-[#72B813] transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Unduh Poster</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
