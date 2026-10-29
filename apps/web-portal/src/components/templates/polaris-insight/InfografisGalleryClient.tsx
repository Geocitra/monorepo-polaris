'use client';

import React, { useState, useMemo } from 'react';
import {
  BarChart3,
  ArrowRight,
  X,
  Calendar,
  ExternalLink,
  Download,
  Share2,
  CheckCircle2,
} from 'lucide-react';
import { formatDateIndonesian } from '@/lib/utils';

interface InfographicItem {
  id: string;
  title: string;
  category: string;
  date: string;
  summary: string;
  imageUrl: string;
  dataPoints?: { label: string; value: string }[];
}

interface InfografisGalleryClientProps {
  initialInfographics: any[];
  member: any;
  theme?: any;
}

export function InfografisGalleryClient({
  initialInfographics = [],
  member,
  theme,
}: InfografisGalleryClientProps) {
  const [selectedInfographic, setSelectedInfographic] = useState<InfographicItem | null>(null);

  // Data riil infografis tanpa fallback dummy mock
  const displayInfographics: InfographicItem[] = useMemo(() => {
    if (!initialInfographics || initialInfographics.length === 0) return [];
    return initialInfographics.map((item: any, idx: number) => ({
      id: item.id || `real-info-${idx}`,
      title: item.title,
      category: item.issueCategory?.replace(/_/g, ' ') || 'Infografis',
      date: item.publishedAt
        ? formatDateIndonesian(item.publishedAt)
        : item.createdAt
        ? formatDateIndonesian(item.createdAt)
        : 'Terbaru',
      summary:
        item.leadParagraph ||
        item.excerpt ||
        item.summary ||
        '',
      imageUrl:
        item.imageUrl ||
        item.posterUrl ||
        item.featuredImageUrl ||
        '',
      dataPoints: item.dataPoints || undefined,
    }));
  }, [initialInfographics]);

  return (
    <div className="space-y-12">
      {/* ========================================================= */}
      {/* GALERI INFOGRAFIS & POSTER (Katalog Visual)              */}
      {/* ========================================================= */}
      <section className="space-y-6">
        <div className="border-b border-amber-200/60 pb-3">
          <div className="text-[11px] font-bold text-[#96702c] uppercase tracking-widest mb-1">
            Publikasi Grafis Resmi Parlemen
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight uppercase">
            Galeri Visualisasi &amp; Infografis
          </h2>
        </div>

        {/* Infographics Grid / Empty State */}
        {displayInfographics.length === 0 ? (
          <div className="rounded-3xl border-2 border-dashed border-amber-200 bg-[#FBF9F5] p-12 sm:p-16 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-amber-100/60 text-[#96702c] mx-auto flex items-center justify-center font-bold">
              <BarChart3 className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-800">
              Belum Ada Infografis yang Dipublikasikan
            </h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
              Publikasi materi visualisasi kebijakan, transparansi anggaran, dan infografis capaian kerja dewan akan ditampilkan di sini saat tersedia.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {displayInfographics.map((info) => (
              <div
                key={info.id}
                onClick={() => setSelectedInfographic(info)}
                className="group bg-white rounded-2xl overflow-hidden border border-amber-100/90 shadow-xs hover:shadow-xl hover:border-amber-300 transition-all duration-300 cursor-pointer flex flex-col justify-between"
              >
                <div>
                  {/* Poster Thumbnail */}
                  <div className="relative aspect-[4/5] overflow-hidden bg-slate-900 flex items-center justify-center">
                    {info.imageUrl ? (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img
                        src={info.imageUrl}
                        alt={info.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center text-amber-300/80 p-6 bg-gradient-to-br from-slate-900 to-slate-800">
                        <BarChart3 className="w-10 h-10 opacity-70 mb-2" />
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-300">Infografis Parlemen</span>
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />

                    {/* Date Badge */}
                    {info.date && (
                      <div className="absolute bottom-3 left-3 bg-[#96702c] text-white text-[11px] font-bold px-2.5 py-1 rounded-md shadow-sm">
                        {info.date}
                      </div>
                    )}
                  </div>

                  {/* Content Details */}
                  <div className="p-4 sm:p-5 space-y-2">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
                      <span className="text-[#96702c] font-black">|</span>
                      <span className="uppercase tracking-wide text-[11px]">{info.category}</span>
                    </div>

                    <h3 className="text-sm font-bold text-slate-900 group-hover:text-[#96702c] transition-colors line-clamp-2 leading-snug">
                      {info.title}
                    </h3>

                    {info.summary && (
                      <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                        {info.summary}
                      </p>
                    )}
                  </div>
                </div>

                {/* Footer CTA */}
                <div className="p-4 sm:p-5 pt-0 border-t border-slate-100 mt-2 flex items-center justify-between text-xs font-bold text-[#96702c] group-hover:translate-x-0.5 transition-transform">
                  <span>Perbesar Infografis</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* ========================================================= */}
      {/* MODAL LIGHTBOX INFOGRAFIS (High-Res Preview)               */}
      {/* ========================================================= */}
      {selectedInfographic && (
        <div
          onClick={() => setSelectedInfographic(null)}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs animate-in fade-in"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-2xl bg-white rounded-2xl overflow-hidden shadow-2xl space-y-4 p-5 sm:p-6 max-h-[92vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="space-y-0.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#96702c]">
                  {selectedInfographic.category} • {selectedInfographic.date}
                </span>
                <h3 className="font-bold text-slate-900 text-sm sm:text-base leading-snug">
                  {selectedInfographic.title}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedInfographic(null)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-900 flex items-center justify-center transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Gambar Besar */}
            <div className="rounded-xl overflow-hidden bg-slate-900 max-h-[55vh] flex items-center justify-center">
              {selectedInfographic.imageUrl ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                  src={selectedInfographic.imageUrl}
                  alt={selectedInfographic.title}
                  className="w-full h-auto max-h-[55vh] object-contain mx-auto"
                />
              ) : (
                <div className="p-12 text-center text-slate-400">
                  <BarChart3 className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p className="text-xs">Gambar grafis resolusi tinggi sedang diproses</p>
                </div>
              )}
            </div>

            {/* Narasi Ringkas */}
            {selectedInfographic.summary && (
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal bg-amber-50/50 p-4 rounded-xl border border-amber-100/60">
                {selectedInfographic.summary}
              </p>
            )}

            {/* Action Bar */}
            <div className="flex items-center justify-end gap-2 pt-2">
              {selectedInfographic.imageUrl && (
                <a
                  href={selectedInfographic.imageUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  download
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Unduh Poster</span>
                </a>
              )}
              <button
                type="button"
                onClick={() => {
                  if (navigator.share) {
                    navigator.share({
                      title: selectedInfographic.title,
                      text: selectedInfographic.summary,
                      url: window.location.href,
                    }).catch(() => {});
                  } else {
                    navigator.clipboard.writeText(window.location.href);
                    alert('Tautan halaman infografis berhasil disalin!');
                  }
                }}
                className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-[#96702c] hover:bg-[#805f24] text-white text-xs font-bold transition shadow-xs cursor-pointer"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>Bagikan</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
