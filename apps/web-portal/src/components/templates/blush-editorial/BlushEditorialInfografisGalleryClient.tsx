'use client';

import React, { useMemo, useState } from 'react';
import { X, Maximize2, Download, Share2, Check, Calendar } from 'lucide-react';
import { formatDateIndonesian } from '@/lib/utils';
import { BLUSH_DEFAULT_INFOGRAPHICS } from './utils';

interface BlushEditorialInfografisGalleryClientProps {
  initialInfographics?: any[];
  member: any;
  theme?: any;
}

const getInfoImg = (i: any) =>
  i?.imageUrl || i?.posterUrl || i?.thumbnailUrl || '/images/showcase-infografis-apbd.jpg';
const getInfoCat = (i: any) => i?.category || i?.categoryName || 'Transparansi Data';

export function BlushEditorialInfografisGalleryClient({
  initialInfographics = [],
}: BlushEditorialInfografisGalleryClientProps) {
  const items =
    initialInfographics && initialInfographics.length > 0
      ? initialInfographics
      : BLUSH_DEFAULT_INFOGRAPHICS;

  const [category, setCategory] = useState('Semua');
  const [activeModal, setActiveModal] = useState<any | null>(null);
  const [copied, setCopied] = useState(false);

  const categories = useMemo(() => {
    return ['Semua', ...Array.from(new Set(items.map(getInfoCat)))];
  }, [items]);

  const filtered = useMemo(() => {
    if (category === 'Semua') return items;
    return items.filter((i: any) => getInfoCat(i) === category);
  }, [items, category]);

  const handleShare = () => {
    if (typeof window !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="max-w-[1240px] mx-auto px-6 lg:px-10 py-16 space-y-12">
      
      {/* ─── KATEGORI FILTER PILLS ─── */}
      <div className="flex flex-wrap gap-2">
        {categories.map((c) => {
          const active = category === c;
          return (
            <button
              key={c}
              type="button"
              onClick={() => setCategory(c)}
              className={`px-4 py-2 rounded-full text-xs font-bold transition-all cursor-pointer ${
                active
                  ? 'bg-[#D47A6A] text-white shadow-sm'
                  : 'bg-white border border-[#EDE5DA] text-[#6E635C] hover:text-[#332A26] hover:border-[#D47A6A]'
              }`}
            >
              {c}
            </button>
          );
        })}
      </div>

      {/* ─── GRID INFOGRAFIS DENGAN GAMBAR JELAS ─── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {filtered.map((item: any, idx: number) => {
          const imgUrl = getInfoImg(item);
          const cat = getInfoCat(item);
          const dateStr = formatDateIndonesian(item.publishedAt || item.createdAt || new Date());

          return (
            <div
              key={item.id || idx}
              onClick={() => setActiveModal(item)}
              className="group relative rounded-3xl overflow-hidden bg-white border border-[#EDE5DA] shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col cursor-pointer"
            >
              {/* Gambar Infografis */}
              <div className="relative aspect-[4/5] w-full overflow-hidden bg-[#FAF7F2]">
                <img
                  src={imgUrl}
                  alt={item.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/images/showcase-infografis-apbd.jpg';
                  }}
                />
                
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                <div className="absolute top-4 right-4 w-9 h-9 rounded-full bg-white/90 text-[#332A26] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 shadow">
                  <Maximize2 className="w-4 h-4 font-bold" />
                </div>

                <div className="absolute bottom-4 left-4 right-4">
                  {item.metric && (
                    <div className="font-serif font-bold text-3xl text-white tracking-tight">
                      {item.metric}
                    </div>
                  )}
                  <div className="text-[10px] uppercase font-bold text-white/80 tracking-wider">
                    {item.metricLabel || cat}
                  </div>
                  <h3 className="mt-1 text-xs sm:text-sm font-bold text-white leading-snug line-clamp-2">
                    {item.title}
                  </h3>
                </div>
              </div>

              {/* Card Footer Info */}
              <div className="p-4 bg-white flex items-center justify-between text-xs text-[#8C7D73]">
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-[#D47A6A]" />
                  {dateStr}
                </span>
                <span className="font-bold text-[#D47A6A] group-hover:underline">
                  Buka Gambar ➔
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* ─── MODAL LIGHTBOX ─── */}
      {activeModal && (
        <div
          className="fixed inset-0 z-[100] bg-black/85 backdrop-blur-md flex items-center justify-center p-4"
          onClick={() => setActiveModal(null)}
        >
          <div
            className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-white rounded-3xl shadow-2xl grid grid-cols-1 md:grid-cols-2"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setActiveModal(null)}
              className="absolute top-4 right-4 z-10 w-9 h-9 rounded-full bg-white text-[#332A26] hover:bg-[#D47A6A] hover:text-white flex items-center justify-center shadow transition-colors cursor-pointer"
              aria-label="Tutup"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="bg-[#FAF7F2] flex items-center justify-center p-6">
              <img
                src={getInfoImg(activeModal)}
                alt={activeModal.title}
                className="max-h-[70vh] w-auto object-contain rounded-xl"
              />
            </div>

            <div className="p-8 sm:p-10 flex flex-col justify-between space-y-6">
              <div>
                <span className="px-3.5 py-1 rounded-full bg-[#FAF0EC] text-[#D47A6A] text-xs font-bold uppercase tracking-wider">
                  {getInfoCat(activeModal)}
                </span>

                <h2 className="mt-4 font-serif font-bold text-2xl text-[#332A26] leading-snug">
                  {activeModal.title}
                </h2>

                {activeModal.metric && (
                  <div className="mt-4 p-4 rounded-2xl bg-[#F8F5EE] border border-[#EDE5DA]">
                    <div className="font-serif font-black text-3xl text-[#D47A6A]">
                      {activeModal.metric}
                    </div>
                    <div className="text-xs text-[#8A7D75] font-semibold">
                      {activeModal.metricLabel || 'Capaian Terdata'}
                    </div>
                  </div>
                )}

                <p className="mt-4 text-xs sm:text-sm text-[#6E635C] leading-relaxed">
                  {activeModal.description ||
                    'Publikasi grafik kinerja akuntabel mengenai alokasi anggaran daerah, serapan aspirasi reses, dan realisasi program advokasi rakyat.'}
                </p>
              </div>

              <div className="pt-6 border-t border-[#F0E8DC] flex items-center gap-3">
                <a
                  href={getInfoImg(activeModal)}
                  download
                  className="px-6 py-2.5 rounded-full bg-[#D47A6A] hover:bg-[#B85E4E] text-white text-xs font-bold uppercase tracking-wider inline-flex items-center gap-2 transition-colors"
                >
                  <Download className="w-3.5 h-3.5" /> Unduh Dokumen
                </a>
                <button
                  type="button"
                  onClick={handleShare}
                  className="px-4 py-2.5 rounded-full border border-[#D5C9BD] text-[#6E635C] hover:text-[#332A26] text-xs font-semibold inline-flex items-center gap-2 transition-colors cursor-pointer"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Share2 className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Tersalin' : 'Bagikan'}</span>
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
