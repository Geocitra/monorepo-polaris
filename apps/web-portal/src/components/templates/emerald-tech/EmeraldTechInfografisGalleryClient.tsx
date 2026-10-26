'use client';

import React, { useState, useMemo } from 'react';
import {
  Download,
  Eye,
  X,
  Share2,
  Filter,
  Check,
  Maximize2,
  FileText,
} from 'lucide-react';
import { formatDateIndonesian } from '@/lib/utils';

interface EmeraldTechInfografisGalleryClientProps {
  initialInfographics?: any[];
  member: any;
  theme?: any;
}

export function EmeraldTechInfografisGalleryClient({
  initialInfographics = [],
  member,
  theme,
}: EmeraldTechInfografisGalleryClientProps) {
  // Strictly use real generated infographics from the account (NO dummy data fallback)
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
      {categories.length > 1 && (
        <div className="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar">
          <Filter className="w-4 h-4 text-stone-400 shrink-0 ml-1" />
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-1.5 rounded-xs text-xs font-bold uppercase tracking-wider whitespace-nowrap transition-all shrink-0 cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-[#00DF82] text-black shadow-[0_0_15px_rgba(0,223,130,0.3)] font-black'
                  : 'bg-[#161616] text-stone-400 hover:text-white border border-white/[0.08]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      )}

      {/* ─── INFOGRAPHICS GRID DENGAN GAMBAR ASLI ─── */}
      {filteredList.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {filteredList.map((item, idx) => {
            const img =
              item.imageUrl ||
              item.posterUrl ||
              item.featuredImageUrl ||
              '/images/showcase-infografis-apbd.jpg';

            return (
              <div
                key={item.id || item.slug || idx}
                className="bg-[#161616] rounded-2xl border border-white/[0.08] hover:border-[#00DF82] transition-all overflow-hidden flex flex-col justify-between hover:shadow-[0_10px_30px_rgba(0,223,130,0.15)] hover:-translate-y-1 group"
              >
                {/* Gambar Infografis Asli Interaktif */}
                <div
                  onClick={() => setActiveModalInfo(item)}
                  className="relative aspect-[4/5] w-full overflow-hidden bg-stone-900 cursor-pointer group/img"
                >
                  <img
                    src={img}
                    alt={item.title}
                    className="w-full h-full object-cover object-top transition-transform duration-500 group-hover/img:scale-105"
                  />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover/img:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2 text-white">
                    <div className="w-11 h-11 rounded-full bg-[#00DF82] text-black flex items-center justify-center shadow-lg group-hover/img:scale-110 transition-transform">
                      <Maximize2 className="w-5 h-5 stroke-[2.5]" />
                    </div>
                    <span className="text-xs font-black uppercase tracking-wider">Perbesar Infografis</span>
                  </div>
                  <div className="absolute top-3 left-3 px-2.5 py-1 rounded-md bg-black/80 backdrop-blur border border-white/10 text-[10px] font-black uppercase tracking-wider text-[#00DF82]">
                    {item.category || 'Infografis Parlemen'}
                  </div>
                </div>

                {/* Detail Konten */}
                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <div className="space-y-2">
                    <h3 className="text-base sm:text-lg font-bold text-white group-hover:text-[#00DF82] transition-colors line-clamp-2 leading-snug">
                      {item.title}
                    </h3>
                    {item.excerpt && (
                      <p className="text-xs text-stone-400 line-clamp-2 leading-relaxed font-normal">
                        {item.excerpt}
                      </p>
                    )}
                  </div>

                  {/* Tombol Aksi Resolusi Penuh */}
                  <button
                    type="button"
                    onClick={() => setActiveModalInfo(item)}
                    className="w-full py-2.5 rounded-lg bg-[#00DF82]/10 hover:bg-[#00DF82] text-[#00DF82] hover:text-black font-extrabold text-xs uppercase tracking-wider border border-[#00DF82]/30 hover:border-[#00DF82] transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Lihat Resolusi Penuh</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="p-12 text-center rounded-2xl bg-[#161616] border border-white/[0.08] space-y-3">
          <div className="w-12 h-12 rounded-full bg-[#00DF82]/10 text-[#00DF82] flex items-center justify-center mx-auto">
            <FileText className="w-6 h-6" />
          </div>
          <h4 className="text-base font-bold text-white">Belum Ada Infografis Publikasi</h4>
          <p className="text-xs text-stone-400 max-w-md mx-auto">
            Infografis data transparansi dan capaian legislasi yang Anda generate melalui Studio Konten AI akan otomatis tampil di galeri ini.
          </p>
        </div>
      )}

      {/* ─── FULLSCREEN LIGHTBOX MODAL ─── */}
      {activeModalInfo && (
        <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200">
          <div className="relative bg-[#181818] rounded-2xl max-w-4xl w-full max-h-[92vh] overflow-hidden flex flex-col border border-white/[0.15] shadow-2xl">
            <div className="px-6 py-4 bg-[#111111] flex items-center justify-between border-b border-white/[0.1]">
              <div className="flex items-center gap-2.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#00DF82] animate-pulse" />
                <h3 className="font-bold text-sm sm:text-base text-white truncate max-w-lg">
                  {activeModalInfo.title}
                </h3>
              </div>
              <button
                onClick={() => setActiveModalInfo(null)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-black/80 flex items-center justify-center">
              <img
                src={activeModalInfo.imageUrl || activeModalInfo.posterUrl || activeModalInfo.featuredImageUrl || '/images/showcase-infografis-apbd.jpg'}
                alt={activeModalInfo.title}
                className="max-h-[65vh] w-auto object-contain rounded-lg border border-white/[0.1]"
              />
            </div>

            <div className="p-4 sm:p-6 bg-[#161616] border-t border-white/[0.1] flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="space-y-1 text-center sm:text-left">
                <span className="text-[10px] font-black uppercase tracking-wider text-[#00DF82]">
                  {activeModalInfo.category || 'INFOGRAFIS PARLEMEN'}
                </span>
                <p className="text-xs text-stone-400 max-w-md pt-1">
                  {activeModalInfo.excerpt || 'Visualisasi data resmi transparansi kebijakan dan capaian legislasi.'}
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => handleShare(activeModalInfo)}
                  className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xs bg-[#111111] border border-white/[0.1] text-white text-xs font-bold hover:border-[#00DF82] transition-colors cursor-pointer"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Share2 className="w-3.5 h-3.5 text-[#00DF82]" />}
                  <span>{copied ? 'Tersalin' : 'Bagikan'}</span>
                </button>
                <a
                  href={activeModalInfo.imageUrl || activeModalInfo.posterUrl || activeModalInfo.featuredImageUrl || '/images/showcase-infografis-apbd.jpg'}
                  download
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xs bg-[#00DF82] text-black font-extrabold text-xs uppercase tracking-wider hover:bg-[#00c974] transition-all cursor-pointer shadow-md"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Unduh Gambar</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
