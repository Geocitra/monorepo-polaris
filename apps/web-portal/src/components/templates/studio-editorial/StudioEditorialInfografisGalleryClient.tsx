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
  Sparkles,
} from 'lucide-react';
import { formatDateIndonesian } from '@/lib/utils';

interface StudioEditorialInfografisGalleryClientProps {
  initialInfographics: any[];
  member: any;
  theme?: any;
}

export function StudioEditorialInfografisGalleryClient({
  initialInfographics = [],
  member,
  theme,
}: StudioEditorialInfografisGalleryClientProps) {
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
    <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-16 py-12 sm:py-16 space-y-12">
      
      {/* ──────────────────────────────────────────────────────────────────────────
          1. GALLERY GRID
          ────────────────────────────────────────────────────────────────────────── */}
      {initialInfographics.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-white border border-stone-300 text-stone-600 max-w-xl mx-auto space-y-3">
          <FileText className="w-10 h-10 text-stone-400 mx-auto" />
          <h4 className="font-serif text-base font-bold text-stone-900">
            Belum Ada Infografis Dipublikasikan
          </h4>
          <p className="text-xs text-stone-500">
            Visualisasi data alokasi APBD dan laporan pertanggungjawaban dewan sedang dalam tahap kurasi publikasi.
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
                className="group rounded-2xl overflow-hidden bg-white border border-stone-300 hover:border-stone-500 transition-all cursor-pointer shadow-2xs hover:shadow-xl flex flex-col justify-between"
              >
                {/* Poster Frame (Aspect 4/5) */}
                <div className="relative aspect-[4/5] w-full overflow-hidden bg-stone-200">
                  <img
                    src={posterImg}
                    alt={info.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/images/showcase-infografis-apbd.jpg';
                    }}
                  />

                  {/* Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-stone-950/70 via-transparent to-transparent opacity-50 group-hover:opacity-30 transition-opacity" />

                  {/* Hover Zoom Icon */}
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="w-12 h-12 rounded-full bg-stone-950 text-white flex items-center justify-center shadow-xl">
                      <Maximize2 className="w-5 h-5" />
                    </div>
                  </div>

                  {/* Category Pill */}
                  <div className="absolute top-3 left-3 z-10">
                    <span className="px-2.5 py-1 rounded-md bg-stone-950/80 backdrop-blur-md text-[10px] font-bold text-white uppercase tracking-wider">
                      {info.category || 'Data Publik'}
                    </span>
                  </div>
                </div>

                {/* Card Meta */}
                <div className="p-4 sm:p-5 bg-white flex-1 flex flex-col justify-between">
                  <h3 className="font-serif text-base font-bold text-stone-950 group-hover:text-stone-700 transition-colors line-clamp-2 leading-snug">
                    {info.title}
                  </h3>

                  <div className="flex items-center justify-between text-xs text-stone-500 mt-4 pt-3 border-t border-stone-200">
                    <span className="flex items-center gap-1 text-[11px]">
                      <Calendar className="w-3 h-3 text-stone-400" />
                      {formatDateIndonesian(info.publishedAt || info.createdAt)}
                    </span>
                    <span className="text-stone-950 font-bold text-[11px] flex items-center gap-1 group-hover:underline">
                      Perbesar
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
          className="fixed inset-0 z-50 bg-stone-950/80 backdrop-blur-md flex items-center justify-center p-4 sm:p-6"
          onClick={() => setSelectedInfographic(null)}
        >
          <div
            className="relative max-w-4xl w-full bg-[#EDEAE4] border border-stone-300 rounded-2xl overflow-hidden shadow-2xl flex flex-col max-h-[92vh]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-stone-300 flex items-center justify-between bg-white">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-stone-500">
                  {selectedInfographic.category || 'Publikasi Data'}
                </span>
                <h3 className="font-serif text-base sm:text-lg font-bold text-stone-950 line-clamp-1">
                  {selectedInfographic.title}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedInfographic(null)}
                className="w-9 h-9 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-800 flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body: Poster */}
            <div className="p-4 sm:p-6 overflow-y-auto flex-1 flex items-center justify-center bg-stone-900/10">
              <img
                src={getInfographicImage(selectedInfographic)}
                alt={selectedInfographic.title}
                className="max-h-[70vh] w-auto object-contain rounded-xl shadow-xl"
              />
            </div>

            {/* Modal Footer: Action Buttons */}
            <div className="px-6 py-3.5 border-t border-stone-300 flex items-center justify-between bg-white flex-wrap gap-3">
              <span className="text-xs text-stone-500 font-semibold">
                {formatDateIndonesian(selectedInfographic.publishedAt || selectedInfographic.createdAt)}
              </span>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleCopyLink(selectedInfographic)}
                  className="inline-flex items-center gap-1.5 px-4 py-2 border border-stone-300 text-stone-800 font-bold text-xs uppercase tracking-wider hover:bg-stone-100 transition-colors cursor-pointer"
                >
                  <Share2 className="w-3.5 h-3.5" />
                  <span>{copied ? 'Tersalin!' : 'Bagikan'}</span>
                </button>

                <a
                  href={getInfographicImage(selectedInfographic)}
                  download
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-stone-950 text-white font-bold text-xs uppercase tracking-wider hover:bg-stone-800 transition-colors"
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
