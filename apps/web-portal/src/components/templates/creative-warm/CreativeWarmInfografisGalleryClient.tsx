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
  BookOpen,
} from 'lucide-react';
import { formatDateIndonesian } from '@/lib/utils';

interface CreativeWarmInfografisGalleryClientProps {
  initialInfographics?: any[];
  member: any;
  theme?: any;
}

export function CreativeWarmInfografisGalleryClient({
  initialInfographics = [],
  member,
  theme,
}: CreativeWarmInfografisGalleryClientProps) {
  // Strictly use real generated infographics from the account (NO dummy data fallback)
  const items = Array.isArray(initialInfographics) ? initialInfographics : [];

  const [selectedCategory, setSelectedCategory] = useState<string>('Semua');
  const [activeModalItem, setActiveModalItem] = useState<any | null>(null);
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [copied, setCopied] = useState<boolean>(false);

  // Derive categories dynamically
  const categories = useMemo(() => {
    const set = new Set<string>();
    items.forEach((item) => {
      const cat = item.category || item.issueCategory;
      if (cat) set.add(cat);
    });
    return ['Semua', ...Array.from(set)];
  }, [items]);

  // Filtered items
  const filteredItems = useMemo(() => {
    if (selectedCategory === 'Semua') return items;
    return items.filter((item) => {
      const cat = item.category || item.issueCategory;
      return cat && cat.toLowerCase() === selectedCategory.toLowerCase();
    });
  }, [items, selectedCategory]);

  const handleOpenModal = (item: any) => {
    setActiveModalItem(item);
    setZoomLevel(1);
  };

  const handleCloseModal = () => {
    setActiveModalItem(null);
    setZoomLevel(1);
    setCopied(false);
  };

  const handleShare = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="space-y-12">
      
      {/* ─── 1. CATEGORY FILTER CONTROLS ─── */}
      <div className="flex items-center justify-between gap-4 p-4 rounded-2xl bg-white border border-stone-200/90 shadow-sm overflow-x-auto scrollbar-none">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-stone-400 shrink-0 ml-1" />
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-amber-500 text-stone-950 font-bold shadow-xs'
                  : 'bg-stone-100 text-stone-600 hover:text-stone-900 hover:bg-stone-200/60'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
        <span className="text-xs font-mono text-stone-500 hidden sm:inline-block shrink-0">
          Menampilkan {filteredItems.length} visualisasi
        </span>
      </div>

      {/* ─── 2. INFOGRAPHICS GALLERY GRID ─── */}
      {filteredItems.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {filteredItems.map((info) => {
            const displayImage =
              info.imageUrl ||
              info.posterUrl ||
              info.featuredImageUrl ||
              '/images/showcase-infografis-apbd.jpg';

            return (
              <div
                key={info.id}
                className="group rounded-2xl bg-white border border-stone-200/90 hover:border-amber-500/80 overflow-hidden shadow-xs hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 flex flex-col justify-between"
              >
                {/* Visual Container */}
                <div className="relative aspect-[16/10] w-full overflow-hidden bg-stone-900">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={displayImage}
                    alt={info.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 filter contrast-[1.02]"
                  />

                  {/* Top Badge */}
                  <div className="absolute top-3 left-3 z-10">
                    <span className="px-2.5 py-1 rounded-md bg-stone-950/80 backdrop-blur-xs text-amber-300 font-mono text-[9.5px] font-bold uppercase tracking-wider border border-white/20">
                      {info.category || 'INFOGRAFIS RESMI'}
                    </span>
                  </div>

                  {/* Hover Overlay with Action Buttons */}
                  <div className="absolute inset-0 bg-stone-950/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-3 p-4 z-20">
                    <button
                      type="button"
                      onClick={() => handleOpenModal(info)}
                      className="px-4 py-2 rounded-full bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs uppercase tracking-wider shadow-lg transition-transform hover:scale-105 inline-flex items-center gap-1.5 cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Perbesar</span>
                    </button>
                    <a
                      href={displayImage}
                      download
                      className="p-2 rounded-full bg-white/20 hover:bg-white text-white hover:text-stone-950 transition-colors cursor-pointer"
                      title="Unduh Berkas Asli"
                    >
                      <Download className="w-4 h-4" />
                    </a>
                  </div>
                </div>

                {/* Information Body */}
                <div className="p-5 sm:p-6 space-y-3 flex-1 flex flex-col justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-[10.5px] font-mono text-stone-400">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>
                        {info.publishedAt
                          ? formatDateIndonesian(info.publishedAt)
                          : 'Terbaru'}
                      </span>
                    </div>

                    <h3 className="font-serif font-bold text-base text-stone-900 group-hover:text-amber-700 transition-colors line-clamp-2 leading-snug">
                      {info.title}
                    </h3>

                    <p className="text-xs text-stone-600 line-clamp-3 leading-relaxed font-normal">
                      {info.excerpt ||
                        info.prompt ||
                        'Visualisasi data capaian kinerja parlemen dan transparansi anggaran daerah pemilihan.'}
                    </p>
                  </div>

                  {/* Card Bottom CTA */}
                  <div className="pt-4 border-t border-stone-100 flex items-center justify-between text-xs">
                    <button
                      type="button"
                      onClick={() => handleOpenModal(info)}
                      className="font-bold text-amber-700 hover:text-amber-800 inline-flex items-center gap-1 cursor-pointer"
                    >
                      <span>Buka Visual Penuh &rarr;</span>
                    </button>
                    <span className="text-[10px] font-mono uppercase text-stone-400 font-semibold">
                      HD GRAPHIC
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-16 bg-white border border-dashed border-stone-300 rounded-2xl space-y-3">
          <BookOpen className="w-10 h-10 text-stone-300 mx-auto" />
          <div className="text-stone-700 font-serif font-bold text-base">
            {items.length === 0 ? 'Belum Ada Infografis Publikasi' : 'Tidak Ada Infografis di Kategori Ini'}
          </div>
          <p className="text-xs text-stone-400 max-w-sm mx-auto">
            {items.length === 0
              ? 'Infografis data capaian dan transparansi anggaran yang Anda buat di Studio Konten AI akan otomatis tampil di sini.'
              : 'Silakan pilih kategori "Semua" untuk menampilkan seluruh visualisasi kebijakan.'}
          </p>
        </div>
      )}

      {/* ─── 3. INTERACTIVE LIGHTBOX MODAL ─── */}
      {activeModalItem && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-stone-950/90 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200"
          onClick={handleCloseModal}
        >
          <div
            className="relative max-w-5xl w-full bg-white rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[92vh]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-stone-200 flex items-center justify-between bg-stone-50">
              <div className="space-y-0.5 max-w-md truncate">
                <span className="text-[10px] font-mono font-bold uppercase text-amber-700">
                  [ {activeModalItem.category || 'INFOGRAFIS RESMI'} ]
                </span>
                <h4 className="text-sm sm:text-base font-serif font-bold text-stone-900 truncate">
                  {activeModalItem.title}
                </h4>
              </div>

              {/* Controls */}
              <div className="flex items-center gap-2">
                {/* Zoom toggle */}
                <button
                  type="button"
                  onClick={() => setZoomLevel((prev) => (prev === 1 ? 1.5 : 1))}
                  className="p-2 rounded-lg hover:bg-stone-200 text-stone-700 transition-colors cursor-pointer"
                  title="Perbesar / Perkecil"
                >
                  <Maximize2 className="w-4 h-4" />
                </button>

                {/* Share Link */}
                <button
                  type="button"
                  onClick={handleShare}
                  className="p-2 rounded-lg hover:bg-stone-200 text-stone-700 transition-colors cursor-pointer"
                  title="Bagikan Tautan"
                >
                  {copied ? (
                    <Check className="w-4 h-4 text-emerald-600" />
                  ) : (
                    <Share2 className="w-4 h-4" />
                  )}
                </button>

                {/* Download */}
                <a
                  href={
                    activeModalItem.imageUrl ||
                    activeModalItem.posterUrl ||
                    activeModalItem.featuredImageUrl ||
                    '/images/showcase-infografis-apbd.jpg'
                  }
                  download
                  className="p-2 rounded-lg hover:bg-stone-200 text-stone-700 transition-colors cursor-pointer"
                  title="Unduh Berkas Asli"
                >
                  <Download className="w-4 h-4" />
                </a>

                {/* Close */}
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="p-2 rounded-lg hover:bg-stone-200 text-stone-700 transition-colors cursor-pointer ml-1"
                  title="Tutup"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Modal Body / Image Viewer */}
            <div className="flex-1 overflow-auto bg-stone-900 flex items-center justify-center p-4 select-none">
              <div
                className="transition-transform duration-300 max-w-full"
                style={{ transform: `scale(${zoomLevel})` }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={
                    activeModalItem.imageUrl ||
                    activeModalItem.posterUrl ||
                    activeModalItem.featuredImageUrl ||
                    '/images/showcase-infografis-apbd.jpg'
                  }
                  alt={activeModalItem.title}
                  className="max-h-[68vh] object-contain mx-auto rounded-lg shadow-2xl"
                />
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-3.5 border-t border-stone-200 bg-stone-50 flex items-center justify-between text-xs text-stone-600">
              <span className="font-mono text-[11px] text-stone-500">
                Dipublikasikan pada:{' '}
                {activeModalItem.publishedAt
                  ? formatDateIndonesian(activeModalItem.publishedAt)
                  : 'Terbaru'}
              </span>
              <span className="text-[11px] font-semibold text-amber-800">
                Arsip Resmi Sekretariat Parlemen
              </span>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
