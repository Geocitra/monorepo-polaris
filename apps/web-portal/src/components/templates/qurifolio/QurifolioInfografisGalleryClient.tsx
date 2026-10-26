'use client';

import React, { useState, useMemo } from 'react';
import {
  Download,
  Eye,
  X,
  Filter,
  Maximize2,
  Calendar,
  Sparkles,
} from 'lucide-react';
import { formatDateIndonesian } from '@/lib/utils';

interface QurifolioInfografisGalleryClientProps {
  initialInfographics?: any[];
  member: any;
  theme?: any;
}

export function QurifolioInfografisGalleryClient({
  initialInfographics = [],
  member,
  theme,
}: QurifolioInfografisGalleryClientProps) {
  // Gunakan data real dari API tanpa fallback dummy
  const rawList = initialInfographics || [];
  const [selectedCategory, setSelectedCategory] = useState<string>('Semua');
  const [activeModalItem, setActiveModalItem] = useState<any | null>(null);

  const getInfographicImg = (item: any) =>
    item?.posterUrl || item?.imageUrl || item?.featuredImageUrl || item?.mediaUrl || item?.fileUrl || '';

  const getInfographicCategory = (item: any) =>
    item?.issueCategory || item?.category || 'Visual Data';

  // Derive categories
  const categories = useMemo(() => {
    const set = new Set<string>();
    rawList.forEach((it) => {
      const cat = getInfographicCategory(it);
      if (cat) set.add(cat);
    });
    return ['Semua', ...Array.from(set)];
  }, [rawList]);

  // Filtered list
  const filteredList = useMemo(() => {
    if (selectedCategory === 'Semua') return rawList;
    return rawList.filter((it) => getInfographicCategory(it) === selectedCategory);
  }, [rawList, selectedCategory]);

  return (
    <div className="space-y-12">
      
      {/* ─── CATEGORY FILTER PILLS ─── */}
      {categories.length > 1 && (
        <div className="bg-white p-6 sm:p-7 rounded-2xl border border-stone-200 shadow-xs flex flex-wrap items-center gap-2">
          <span className="text-xs font-black uppercase tracking-wider text-stone-400 mr-2 flex items-center gap-1.5">
            <Filter className="w-3.5 h-3.5" />
            Kategori:
          </span>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all select-none cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-[#FF6B00] text-white shadow-md'
                  : 'bg-stone-100 text-stone-700 hover:text-black hover:bg-stone-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      )}

      {/* ─── EMPTY STATE OR LIST ─── */}
      {rawList.length === 0 ? (
        <div className="bg-white p-12 sm:p-16 rounded-3xl border border-stone-200 text-center max-w-xl mx-auto shadow-xs">
          <Sparkles className="w-12 h-12 text-[#FF6B00] mx-auto mb-4" />
          <h3 className="text-xl font-black text-[#161616] mb-2">Belum Ada Infografis Publik</h3>
          <p className="text-sm text-stone-500">
            Dokumentasi visual data parlemen dan transparansi anggaran akan segera ditampilkan di sini.
          </p>
        </div>
      ) : filteredList.length === 0 ? (
        <div className="bg-white p-10 rounded-2xl border border-stone-200 text-center max-w-lg mx-auto">
          <p className="text-sm text-stone-500 mb-4">Tidak ada infografis dalam kategori ini.</p>
          <button
            onClick={() => setSelectedCategory('Semua')}
            className="px-5 py-2.5 rounded-xl bg-[#FF6B00] text-white font-extrabold text-xs uppercase cursor-pointer"
          >
            Reset Kategori
          </button>
        </div>
      ) : (
        /* ─── FEATURED PROJECT STYLE SHOWCASE CARDS (PERSIS SECTION 3 PADA GAMBAR) ─── */
        <div className="space-y-8">
          {filteredList.map((item, index) => {
            const img = getInfographicImg(item);
            const category = getInfographicCategory(item);

            return (
              <div
                key={item.id || index}
                className="bg-white rounded-3xl p-6 sm:p-10 lg:p-12 border border-stone-200/90 shadow-xs hover:shadow-xl hover:border-[#FF6B00] transition-all grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center"
              >
                {/* Left Column: Visual Showcase Preview with Zoom overlay */}
                <div
                  onClick={() => setActiveModalItem(item)}
                  className="lg:col-span-7 relative group cursor-pointer overflow-hidden rounded-2xl bg-stone-100 border border-stone-200 shadow-inner flex items-center justify-center p-3 sm:p-6 aspect-[16/10]"
                >
                  <img
                    src={img}
                    alt={item.title}
                    className="max-h-full max-w-full object-contain rounded-xl shadow-md group-hover:scale-[1.02] transition-transform duration-300"
                  />

                  {/* Hover overlay with zoom icon */}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                    <div className="px-4 py-2.5 rounded-xl bg-white text-[#161616] font-extrabold text-xs uppercase tracking-wider shadow-lg flex items-center gap-2">
                      <Maximize2 className="w-4 h-4 text-[#FF6B00]" />
                      <span>Perbesar Dokumen</span>
                    </div>
                  </div>
                </div>

                {/* Right Column: Category Badge + Bold Title + Description + Download (Persis format Bitx pada gambar) */}
                <div className="lg:col-span-5 space-y-5">
                  <span className="inline-block px-3 py-1 rounded-md bg-[#FFF5ED] text-[#FF6B00] text-xs font-black uppercase tracking-wider">
                    {category}
                  </span>

                  <h3 className="text-xl sm:text-2xl lg:text-3xl font-black text-[#161616] tracking-tight leading-tight">
                    {item.title}
                  </h3>

                  <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
                    {item.excerpt ||
                      'Visualisasi data kebijakan, transparansi alokasi fiskal belanja daerah, dan panduan program aspirasi dewan untuk konstituen.'}
                  </p>

                  <div className="flex items-center gap-2 text-xs font-semibold text-stone-400">
                    <Calendar className="w-3.5 h-3.5 text-[#FF6B00]" />
                    <span>
                      {item.publishedAt ? formatDateIndonesian(item.publishedAt) : 'Agustus 2026'}
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-3 pt-3">
                    <button
                      onClick={() => setActiveModalItem(item)}
                      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#161616] hover:bg-black text-white font-extrabold text-xs uppercase tracking-wider transition-colors shadow-xs cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5 text-[#FF6B00]" />
                      <span>Lihat Rinci</span>
                    </button>

                    <a
                      href={img}
                      download={item.title ? `${item.title}.png` : 'infografis.png'}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 font-extrabold text-xs uppercase tracking-wider transition-colors border border-stone-200 cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Unduh Infografis</span>
                    </a>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ─── FULLSCREEN LIGHTBOX MODAL ─── */}
      {activeModalItem && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200">
          <div className="relative bg-white rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
            
            {/* Modal Header */}
            <div className="px-6 py-4 bg-[#161616] text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#FF6B00]" />
                <h3 className="font-bold text-sm sm:text-base text-white truncate max-w-lg">
                  {activeModalItem.title}
                </h3>
              </div>
              <button
                onClick={() => setActiveModalItem(null)}
                className="p-1 rounded-full text-stone-400 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Image Body */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-stone-100 flex items-center justify-center">
              <img
                src={getInfographicImg(activeModalItem)}
                alt={activeModalItem.title}
                className="max-h-[60vh] w-auto object-contain rounded-lg shadow-md border border-stone-200"
              />
            </div>

            {/* Modal Footer */}
            <div className="p-4 sm:p-6 bg-white border-t border-stone-200 flex flex-col sm:flex-row items-center justify-between gap-4">
              <p className="text-xs text-stone-600 max-w-md">
                {activeModalItem.excerpt || 'Data resmi transparansi kebijakan parlemen.'}
              </p>
              <a
                href={getInfographicImg(activeModalItem)}
                download={activeModalItem.title ? `${activeModalItem.title}.png` : 'infografis.png'}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#FF6B00] text-white font-extrabold text-xs uppercase tracking-wider hover:bg-[#e65c00] transition-all shadow-md cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Unduh Infografis Resolusi Penuh</span>
              </a>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
