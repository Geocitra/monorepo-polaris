'use client';

import React, { useState, useMemo } from 'react';
import {
  Download,
  Share2,
  Calendar,
  X,
  Maximize2,
  Check,
  Sparkles,
} from 'lucide-react';
import { formatDateIndonesian } from '@/lib/utils';

interface NayaEditorialInfografisGalleryClientProps {
  initialInfographics?: any[];
  member: any;
  theme?: any;
}

export function NayaEditorialInfografisGalleryClient({
  initialInfographics = [],
  member,
  theme,
}: NayaEditorialInfografisGalleryClientProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('Semua');
  const [activeModalInfo, setActiveModalInfo] = useState<any | null>(null);
  const [copied, setCopied] = useState(false);

  const infographics = initialInfographics || [];

  const categories = useMemo(() => {
    const set = new Set<string>();
    infographics.forEach((item) => {
      const cat = item.category || item.categoryName;
      if (cat) set.add(cat);
    });
    return ['Semua', ...Array.from(set)];
  }, [infographics]);

  const filtered = useMemo(() => {
    if (selectedCategory === 'Semua') return infographics;
    return infographics.filter(
      (item) => (item.category || item.categoryName) === selectedCategory
    );
  }, [infographics, selectedCategory]);

  const getInfographicImage = (info: any): string => {
    return (
      info?.imageUrl ||
      info?.posterUrl ||
      info?.featuredImageUrl ||
      info?.coverUrl ||
      '/images/showcase-infografis-apbd.jpg'
    );
  };

  const handleCopyLink = () => {
    if (typeof window !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="py-12 sm:py-16 px-6 sm:px-10 lg:px-16 max-w-[1520px] mx-auto space-y-12">
      
      {/* ─── CATEGORY FILTER PILLS ─── */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-[#E7E2D6]">
        {categories.map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => setSelectedCategory(cat)}
            className={`px-5 py-2.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
              selectedCategory === cat
                ? 'bg-[#272A20] text-white shadow-xs'
                : 'bg-white text-[#555A47] border border-[#E5E0D5] hover:bg-[#F2EFE8]'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* ─── INFOGRAPHICS GRID ─── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {filtered.map((info, idx) => {
          const img = getInfographicImage(info);
          const title = info.title || `Infografis Transparansi #${idx + 1}`;
          const metric = info.metric || (idx === 0 ? 'Rp 45,2 M' : idx === 1 ? '98,4%' : idx === 2 ? '1.420+' : '24/7');
          const metricLabel = info.metricLabel || (idx === 0 ? 'Alokasi Kawalan' : idx === 1 ? 'Target Tuntas' : idx === 2 ? 'Penerima Manfaat' : 'Respon Cepat');
          const category = info.category || info.categoryName || 'Transparansi Data';
          const dateStr = formatDateIndonesian(info.createdAt || new Date());

          return (
            <div
              key={info.id || idx}
              onClick={() => setActiveModalInfo(info)}
              className="group flex flex-col justify-between bg-[#181B15] text-white rounded-[28px] border border-white/10 hover:border-white/30 overflow-hidden transition-all duration-300 aspect-[3/4] sm:aspect-[4/5] p-6 relative cursor-pointer shadow-lg"
            >
              {/* Background Infographic Image */}
              <div className="absolute inset-0 z-0">
                <img
                  src={img}
                  alt={title}
                  className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-700 opacity-60 group-hover:opacity-75 filter contrast-105"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/images/showcase-infografis-apbd.jpg';
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#141712] via-[#141712]/60 to-transparent" />
              </div>

              {/* Card Top: Category & Zoom */}
              <div className="relative z-10 flex items-center justify-between">
                <span className="px-3.5 py-1 rounded-full bg-black/60 backdrop-blur-md text-[11px] font-semibold text-white/90 border border-white/10">
                  {category}
                </span>
                <div className="w-8 h-8 rounded-full bg-white/15 backdrop-blur-md text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <Maximize2 className="w-3.5 h-3.5" />
                </div>
              </div>

              {/* Card Bottom: Big Metric & Info */}
              <div className="relative z-10 select-text">
                <div className="font-cormorant text-3xl sm:text-4xl font-bold text-white tracking-tight leading-none mb-1">
                  {metric}
                </div>
                <div className="text-[11px] sm:text-xs font-semibold text-[#AAB09D] uppercase tracking-wider mb-2">
                  {metricLabel}
                </div>
                <h3 className="font-cormorant text-xl font-bold text-white/95 line-clamp-2 leading-snug">
                  {title}
                </h3>
                <div className="flex items-center gap-2 text-[11px] text-[#A5AB98] mt-2 font-medium">
                  <Calendar className="w-3 h-3" />
                  <span>{dateStr}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* ─── INTERACTIVE LIGHTBOX MODAL ─── */}
      {activeModalInfo && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200"
          onClick={() => setActiveModalInfo(null)}
        >
          <div
            className="bg-[#1C2018] border border-white/20 rounded-3xl max-w-4xl w-full max-h-[92vh] overflow-hidden flex flex-col text-white shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="p-5 sm:p-6 border-b border-white/10 flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold text-[#A2A796] uppercase tracking-wider block">
                  {activeModalInfo.category || 'Infografis Kebijakan'}
                </span>
                <h3 className="font-cormorant text-xl sm:text-2xl font-bold text-white mt-0.5">
                  {activeModalInfo.title}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setActiveModalInfo(null)}
                className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Image Preview */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-[#131610] flex items-center justify-center">
              <img
                src={getInfographicImage(activeModalInfo)}
                alt={activeModalInfo.title}
                className="max-h-[60vh] w-auto object-contain rounded-xl shadow-lg border border-white/10"
              />
            </div>

            {/* Footer */}
            <div className="p-5 sm:p-6 border-t border-white/10 flex flex-wrap items-center justify-between gap-4 bg-[#181C14]">
              <p className="text-xs sm:text-sm text-[#9FA493] max-w-xl">
                {activeModalInfo.description ||
                  'Publikasi data transparansi resmi parlemen untuk keterbukaan informasi publik.'}
              </p>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={handleCopyLink}
                  className="px-4 py-2 rounded-full bg-white/10 hover:bg-white/20 text-xs font-bold text-white transition-colors inline-flex items-center gap-1.5 cursor-pointer"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Share2 className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Tautan Disalin!' : 'Bagikan'}</span>
                </button>
                <a
                  href={getInfographicImage(activeModalInfo)}
                  target="_blank"
                  rel="noopener noreferrer"
                  download
                  className="px-4 py-2 rounded-full bg-white text-[#181B15] hover:bg-[#EFECE2] text-xs font-bold transition-colors inline-flex items-center gap-1.5 cursor-pointer"
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
