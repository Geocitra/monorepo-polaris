'use client';

import React, { useState, useMemo } from 'react';
import {
  Download,
  Eye,
  X,
  Share2,
  Calendar,
  Filter,
  Check,
  Maximize2,
} from 'lucide-react';
import { formatDateIndonesian } from '@/lib/utils';

interface MidnightGoldInfografisGalleryClientProps {
  initialInfographics?: any[];
  member: any;
  theme?: any;
}

export function MidnightGoldInfografisGalleryClient({
  initialInfographics = [],
  member,
  theme,
}: MidnightGoldInfografisGalleryClientProps) {
  const rawList = Array.isArray(initialInfographics) ? initialInfographics : [];
  const [selectedCategory, setSelectedCategory] = useState<string>('Semua');
  const [activeModalInfo, setActiveModalInfo] = useState<any | null>(null);
  const [copied, setCopied] = useState(false);

  // Extract categories dynamically
  const categories = useMemo(() => {
    const set = new Set<string>();
    rawList.forEach((item) => {
      if (item.category) set.add(item.category);
    });
    return ['Semua', ...Array.from(set)];
  }, [rawList]);

  // Filtered items
  const filteredList = useMemo(() => {
    if (selectedCategory === 'Semua') return rawList;
    return rawList.filter((item) => item.category === selectedCategory);
  }, [rawList, selectedCategory]);

  const handleShare = (info: any) => {
    if (typeof window !== 'undefined') {
      const url = `${window.location.origin}/infografis#${info.slug || info.id}`;
      navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="space-y-10">
      
      {/* ─── CATEGORY FILTER PILLS ─── */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar">
        <Filter className="w-4 h-4 text-white/50 shrink-0 ml-1" />
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-4 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all shrink-0 ${
              selectedCategory === cat
                ? 'bg-[#FFBD39] text-black shadow-[0_0_15px_rgba(255,189,57,0.3)] font-black'
                : 'bg-[#0a0a0a] text-white/70 hover:text-white border border-white/[0.1]'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* ─── INFOGRAPHICS GRID / AUTHENTIC EMPTY STATE ─── */}
      {filteredList.length === 0 ? (
        <div className="py-20 px-6 text-center rounded-2xl bg-[#0a0a0a] border border-dashed border-white/[0.1] space-y-4">
          <div className="w-14 h-14 mx-auto rounded-full bg-white/[0.05] border border-white/[0.1] flex items-center justify-center text-[#FFBD39]">
            <Eye className="w-7 h-7" />
          </div>
          <h3 className="text-xl font-bold text-white">Tidak Ada Infografis Ditemukan</h3>
          <p className="text-xs sm:text-sm text-[#999999] max-w-md mx-auto leading-relaxed">
            {selectedCategory === 'Semua'
              ? 'Belum ada infografis publikasi resmi yang diterbitkan di akun dewan ini.'
              : `Belum ada infografis untuk kategori "${selectedCategory}". Coba pilih kategori "Semua".`}
          </p>
          {selectedCategory !== 'Semua' && (
            <button
              onClick={() => setSelectedCategory('Semua')}
              className="px-6 py-2.5 rounded-full bg-[#FFBD39] text-black font-black text-xs uppercase tracking-wider"
            >
              Lihat Semua Kategori
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredList.map((item, idx) => {
            const img = item.imageUrl || item.posterUrl || item.thumbnailUrl || '/images/showcase-infografis-apbd.jpg';
            const formattedDate = item.publishedAt
              ? formatDateIndonesian(item.publishedAt)
              : 'Terbaru';

            return (
              <div
                key={item.id || item.slug || idx}
                className="group bg-[#0a0a0a] rounded-2xl border border-white/[0.08] hover:border-[#FFBD39] transition-all overflow-hidden flex flex-col justify-between shadow-lg"
              >
                {/* Image Preview with Hover Overlay */}
                <div
                  onClick={() => setActiveModalInfo(item)}
                  className="relative aspect-[4/5] bg-black cursor-pointer overflow-hidden"
                >
                  <img
                    src={img}
                    alt={item.title}
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).src = '/images/showcase-infografis-apbd.jpg';
                    }}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-90 group-hover:opacity-100"
                  />
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <span className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#FFBD39] text-black font-extrabold text-xs shadow-lg">
                      <Maximize2 className="w-3.5 h-3.5" />
                      <span>Perbesar Dokumen</span>
                    </span>
                  </div>
                  <div className="absolute top-3 left-3">
                    <span className="px-2.5 py-1 rounded-full bg-black/85 backdrop-blur-sm text-[#FFBD39] text-[10px] font-black uppercase tracking-wider border border-white/[0.1]">
                      {item.category || 'DATA PARLEMEN'}
                    </span>
                  </div>
                </div>

                {/* Text Information & Actions */}
                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <div className="space-y-1.5">
                    <span className="text-[11px] text-[#999999] flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-[#FFBD39]" />
                      {formattedDate}
                    </span>
                    <h3
                      onClick={() => setActiveModalInfo(item)}
                      className="font-bold text-base text-white group-hover:text-[#FFBD39] transition-colors cursor-pointer line-clamp-2 leading-snug"
                    >
                      {item.title}
                    </h3>
                    {item.excerpt && (
                      <p className="text-xs text-[#999999] line-clamp-2 leading-relaxed">
                        {item.excerpt}
                      </p>
                    )}
                  </div>

                  {/* Footer Buttons */}
                  <div className="pt-3 border-t border-white/[0.08] flex items-center justify-between text-xs">
                    <button
                      onClick={() => setActiveModalInfo(item)}
                      className="inline-flex items-center gap-1.5 font-bold text-white hover:text-[#FFBD39] transition-colors"
                    >
                      <Eye className="w-3.5 h-3.5 text-[#FFBD39]" />
                      <span>Pratinjau</span>
                    </button>

                    <a
                      href={img}
                      download
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 font-bold text-[#999999] hover:text-white transition-colors"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Unduh</span>
                    </a>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ─── FULLSCREEN LIGHTBOX MODAL ─── */}
      {activeModalInfo && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200">
          <div className="relative bg-[#0c0c0c] rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col border border-white/[0.15] shadow-2xl">
            <div className="px-6 py-4 bg-black flex items-center justify-between border-b border-white/[0.1]">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#FFBD39]" />
                <h3 className="font-bold text-sm sm:text-base text-white truncate max-w-lg">
                  {activeModalInfo.title}
                </h3>
              </div>
              <button
                onClick={() => setActiveModalInfo(null)}
                className="p-1 rounded-full text-white/60 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-black flex items-center justify-center">
              <img
                src={activeModalInfo.imageUrl || activeModalInfo.posterUrl || '/images/showcase-infografis-apbd.jpg'}
                alt={activeModalInfo.title}
                className="max-h-[60vh] w-auto object-contain rounded-lg border border-white/[0.1]"
              />
            </div>

            <div className="p-4 sm:p-6 bg-[#0c0c0c] border-t border-white/[0.1] flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="space-y-1 text-center sm:text-left">
                <span className="text-[10px] font-black uppercase tracking-wider text-[#FFBD39]">
                  {activeModalInfo.category || 'INFOGRAFIS'}
                </span>
                <p className="text-xs text-[#999999] max-w-md pt-1">
                  {activeModalInfo.excerpt || 'Data resmi transparansi kebijakan parlemen.'}
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => handleShare(activeModalInfo)}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-black border border-white/[0.1] text-white text-xs font-bold hover:border-[#FFBD39] transition-colors"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Share2 className="w-3.5 h-3.5 text-[#FFBD39]" />}
                  <span>{copied ? 'Tautan Tersalin' : 'Bagikan'}</span>
                </button>
                <a
                  href={activeModalInfo.imageUrl || activeModalInfo.posterUrl || '/images/showcase-infografis-apbd.jpg'}
                  download
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-5 py-2 rounded-full bg-[#FFBD39] text-black font-black text-xs uppercase tracking-wider hover:bg-[#e5a823] transition-all"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Unduh Dokumen</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
