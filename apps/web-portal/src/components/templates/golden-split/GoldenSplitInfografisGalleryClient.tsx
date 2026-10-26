'use client';

import React, { useMemo, useState } from 'react';
import { X, Maximize2, Download, Share2, Check, Calendar } from 'lucide-react';
import { formatDateIndonesian } from '@/lib/utils';
import { GOLDEN_DEFAULT_INFOGRAPHICS } from './utils';

interface GoldenSplitInfografisGalleryClientProps {
  initialInfographics?: any[];
  member: any;
  theme?: any;
}

const getInfoImg = (i: any) =>
  i?.imageUrl || i?.posterUrl || i?.thumbnailUrl || '/images/showcase-infografis-apbd.jpg';
const getInfoCat = (i: any) => i?.category || i?.categoryName || 'Transparansi Data';

export function GoldenSplitInfografisGalleryClient({
  initialInfographics = [],
}: GoldenSplitInfografisGalleryClientProps) {
  const items =
    initialInfographics && initialInfographics.length > 0
      ? initialInfographics
      : GOLDEN_DEFAULT_INFOGRAPHICS;

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
    <div className="max-w-[1140px] mx-auto px-6 lg:px-10 py-16 space-y-12">
      
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
                  ? 'bg-[#FFA800] text-[#1E1E1E] shadow-md'
                  : 'bg-[#262626] border border-white/10 text-neutral-300 hover:text-white hover:border-[#FFA800]/50'
              }`}
            >
              {c}
            </button>
          );
        })}
      </div>

      {/* ─── GRID INFOGRAFIS MENAMPILKAN GAMBAR DENGAN JELAS ─── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {filtered.map((item: any, idx: number) => {
          const imgUrl = getInfoImg(item);
          const cat = getInfoCat(item);
          const dateStr = formatDateIndonesian(item.publishedAt || item.createdAt || new Date());

          return (
            <div
              key={item.id || idx}
              onClick={() => setActiveModal(item)}
              className="group relative rounded-2xl overflow-hidden bg-[#262626] border border-white/5 hover:border-[#FFA800] shadow-xl hover:shadow-2xl transition-all duration-300 flex flex-col cursor-pointer"
            >
              {/* Gambar Infografis */}
              <div className="relative aspect-[4/5] w-full overflow-hidden bg-neutral-900">
                <img
                  src={imgUrl}
                  alt={item.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/images/showcase-infografis-apbd.jpg';
                  }}
                />
                
                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />

                {/* Tombol Zoom */}
                <div className="absolute top-4 right-4 w-9 h-9 rounded-full bg-[#FFA800] text-[#1E1E1E] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 shadow">
                  <Maximize2 className="w-4 h-4 font-bold" />
                </div>

                {/* Angka Metrik & Judul di Atas Gambar */}
                <div className="absolute bottom-4 left-4 right-4">
                  {item.metric && (
                    <div className="font-outfit font-black text-3xl text-[#FFA800] tracking-tight">
                      {item.metric}
                    </div>
                  )}
                  <div className="text-[10px] uppercase font-bold text-neutral-300 tracking-wider">
                    {item.metricLabel || cat}
                  </div>
                  <h3 className="mt-1 text-sm font-bold text-white leading-snug line-clamp-2">
                    {item.title}
                  </h3>
                </div>
              </div>

              {/* Card Footer Info */}
              <div className="p-4 bg-[#262626] flex items-center justify-between text-xs text-neutral-400">
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-[#FFA800]" />
                  {dateStr}
                </span>
                <span className="font-bold text-[#FFA800] group-hover:underline">
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
          className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-md flex items-center justify-center p-4"
          onClick={() => setActiveModal(null)}
        >
          <div
            className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-[#262626] border border-white/10 rounded-2xl shadow-2xl grid grid-cols-1 md:grid-cols-2"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setActiveModal(null)}
              className="absolute top-4 right-4 z-10 w-9 h-9 rounded-full bg-black/70 hover:bg-[#FFA800] text-white hover:text-[#1E1E1E] flex items-center justify-center transition-colors cursor-pointer"
              aria-label="Tutup"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Gambar Lengkap di Lightbox */}
            <div className="bg-black flex items-center justify-center p-4">
              <img
                src={getInfoImg(activeModal)}
                alt={activeModal.title}
                className="max-h-[70vh] w-auto object-contain rounded"
              />
            </div>

            {/* Keterangan */}
            <div className="p-8 flex flex-col justify-between space-y-6">
              <div>
                <span className="px-3 py-1 rounded bg-[#FFA800] text-[#1E1E1E] text-xs font-black uppercase tracking-wider">
                  {getInfoCat(activeModal)}
                </span>

                <h2 className="mt-4 font-outfit font-extrabold text-2xl text-white leading-snug">
                  {activeModal.title}
                </h2>

                {activeModal.metric && (
                  <div className="mt-4 p-4 rounded-xl bg-[#1E1E1E] border border-white/5">
                    <div className="font-outfit font-black text-3xl text-[#FFA800]">
                      {activeModal.metric}
                    </div>
                    <div className="text-xs text-neutral-400 font-medium">
                      {activeModal.metricLabel || 'Capaian Terdata'}
                    </div>
                  </div>
                )}

                <p className="mt-4 text-xs sm:text-sm text-neutral-300 leading-relaxed">
                  {activeModal.description ||
                    'Publikasi grafik dan data kinerja resmi dalam pengawasan anggaran daerah, serapan aspirasi masyarakat, serta implementasi regulasi di parlemen.'}
                </p>
              </div>

              <div className="pt-6 border-t border-white/10 flex items-center gap-3">
                <a
                  href={getInfoImg(activeModal)}
                  download
                  className="px-6 py-2.5 rounded bg-[#FFA800] hover:bg-[#E09400] text-[#1E1E1E] text-xs font-bold uppercase tracking-wider inline-flex items-center gap-2 transition-colors"
                >
                  <Download className="w-3.5 h-3.5" /> Unduh Dokumen
                </a>
                <button
                  type="button"
                  onClick={handleShare}
                  className="px-4 py-2.5 rounded border border-white/20 text-neutral-300 hover:text-white text-xs font-semibold inline-flex items-center gap-2 transition-colors cursor-pointer"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Share2 className="w-3.5 h-3.5" />}
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
