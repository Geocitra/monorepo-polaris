'use client';

import React, { useState, useMemo } from 'react';
import { Maximize2, X, Share2, Sparkles, Image as ImageIcon, Download, Check } from 'lucide-react';
import { WashoskiCyanShell } from './WashoskiCyanShell';
import {
  getWashoskiMemberInfo,
  useWashoskiHref,
  WASHOSKI_DEFAULT_INFOGRAPHICS,
  WASHOSKI_CYAN,
} from './utils';

export interface WashoskiCyanInfografisGalleryClientProps {
  initialInfographics?: any[];
  member: any;
  theme?: any;
  subdomain?: string;
}

const getInfoImg = (i: any) =>
  i?.imageUrl || i?.posterUrl || i?.thumbnailUrl || '/images/showcase-infografis-apbd.jpg';
const getInfoCat = (i: any) => i?.category || i?.categoryName || 'Transparansi Data';

export function WashoskiCyanInfografisGalleryClient({
  initialInfographics = [],
  member,
  theme,
  subdomain,
}: WashoskiCyanInfografisGalleryClientProps) {
  const info = getWashoskiMemberInfo(member, theme, subdomain);
  const items =
    initialInfographics && initialInfographics.length > 0
      ? initialInfographics
      : WASHOSKI_DEFAULT_INFOGRAPHICS;

  const [category, setCategory] = useState('Semua');
  const [activeModal, setActiveModal] = useState<any | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const categories = useMemo(() => {
    return ['Semua', ...Array.from(new Set(items.map(getInfoCat)))];
  }, [items]);

  const filtered = useMemo(() => {
    if (category === 'Semua') return items;
    return items.filter((i: any) => getInfoCat(i) === category);
  }, [items, category]);

  const handleShare = (item: any) => {
    if (typeof window !== 'undefined') {
      const url = window.location.href;
      if (navigator.share) {
        navigator.share({ title: item.title, url }).catch(() => {});
      } else if (navigator.clipboard) {
        navigator.clipboard.writeText(url);
        setCopiedId(item.id || item.title);
        setTimeout(() => setCopiedId(null), 2000);
      }
    }
  };

  return (
    <WashoskiCyanShell
      member={member}
      theme={theme}
      subdomain={subdomain}
      activePage="infografis"
    >
      {/* ─── 1. HEADER SECTION ─── */}
      <section className="pt-32 pb-16 bg-[#000000] border-b border-[#1A1A1A]">
        <div className="max-w-[1320px] mx-auto px-6 lg:px-12">
          <div className="max-w-2xl space-y-4">
            <span className="text-xs font-extrabold uppercase tracking-[0.25em] text-[#05DFD7] block">
              GALERI DATA & AKUNTABILITAS
            </span>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight uppercase">
              Infografis & Visualisasi Kinerja <span className="text-[#05DFD7]">.</span>
            </h1>
            <p className="text-sm text-[#9CA3AF] leading-relaxed">
              Ikhtisar visual berbasis data mengenai pengawasan APBD, sebaran realisasi pokok pikiran dewan, serta mekanisme pelayanan aspirasi konstituen {info.name}.
            </p>
          </div>
        </div>
      </section>

      {/* ─── 2. CATEGORY PILLS & GALLERY ─── */}
      <section className="py-12 bg-[#070707] min-h-[60vh]">
        <div className="max-w-[1320px] mx-auto px-6 lg:px-12">
          
          {/* Categories */}
          <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-10 scrollbar-none">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                className={`px-5 py-2 rounded-lg text-xs font-bold uppercase tracking-wider whitespace-nowrap transition-all duration-200 ${
                  category === cat
                    ? 'bg-[#05DFD7] text-black shadow-lg shadow-[#05DFD7]/20 font-extrabold'
                    : 'bg-[#111111] text-[#9CA3AF] hover:text-white border border-[#222]'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Grid of Infographics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filtered.map((item: any, idx: number) => {
              const img = getInfoImg(item);
              const cat = getInfoCat(item);
              const title = item.title || 'Infografis Publik';
              const date = item.date || item.publishedAt || 'Terbaru';

              return (
                <div
                  key={item.id || idx}
                  className="group bg-[#0E0E0E] rounded-2xl border border-[#1E1E1E] overflow-hidden hover:border-[#05DFD7] transition-all duration-300 flex flex-col justify-between"
                >
                  {/* Poster Image Container */}
                  <div
                    onClick={() => setActiveModal(item)}
                    className="relative aspect-[4/5] bg-[#161616] cursor-pointer overflow-hidden"
                  >
                    <img
                      src={img}
                      alt={title}
                      className="w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-105"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                      <button
                        type="button"
                        className="w-12 h-12 rounded-full bg-[#05DFD7] text-black flex items-center justify-center shadow-lg transform -translate-y-2 group-hover:translate-y-0 transition-transform duration-300 font-bold"
                        title="Perbesar Gambar"
                      >
                        <Maximize2 className="w-5 h-5" />
                      </button>
                    </div>

                    <div className="absolute top-4 left-4">
                      <span className="px-3 py-1 rounded-full bg-black/80 backdrop-blur-md text-[10px] font-bold uppercase tracking-wider text-white border border-white/20">
                        {cat}
                      </span>
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="p-6 flex-1 flex flex-col justify-between">
                    <div>
                      <p className="text-xs font-semibold text-[#71717A] mb-1.5">{date}</p>
                      <h3
                        onClick={() => setActiveModal(item)}
                        className="text-base font-bold text-white group-hover:text-[#05DFD7] transition-colors cursor-pointer line-clamp-2 leading-snug"
                      >
                        {title}
                      </h3>
                      {item.description && (
                        <p className="text-xs text-[#9CA3AF] mt-2 line-clamp-2 leading-relaxed">
                          {item.description}
                        </p>
                      )}
                    </div>

                    <div className="pt-4 mt-4 border-t border-[#1C1C1C] flex items-center justify-between">
                      <button
                        onClick={() => setActiveModal(item)}
                        className="inline-flex items-center gap-1.5 text-xs font-bold text-[#05DFD7] hover:underline"
                      >
                        <Maximize2 className="w-3.5 h-3.5" />
                        Buka Pratinjau
                      </button>

                      <button
                        onClick={() => handleShare(item)}
                        className="inline-flex items-center gap-1 text-xs font-medium text-[#9CA3AF] hover:text-white"
                      >
                        {copiedId === (item.id || item.title) ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                            <span className="text-emerald-400">Disalin</span>
                          </>
                        ) : (
                          <>
                            <Share2 className="w-3.5 h-3.5" />
                            <span>Bagikan</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ─── 3. LIGHTBOX MODAL ─── */}
      {activeModal && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 lg:p-8 animate-in fade-in duration-200"
          onClick={() => setActiveModal(null)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative bg-[#111] border border-[#262626] rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col shadow-2xl"
          >
            <div className="p-4 px-6 border-b border-[#1C1C1C] flex items-center justify-between bg-[#0A0A0A]">
              <div>
                <span className="text-[10px] font-bold text-[#05DFD7] uppercase tracking-wider">
                  {getInfoCat(activeModal)}
                </span>
                <h4 className="text-sm lg:text-base font-bold text-white line-clamp-1">
                  {activeModal.title || 'Infografis'}
                </h4>
              </div>
              <div className="flex items-center gap-2">
                <a
                  href={getInfoImg(activeModal)}
                  target="_blank"
                  rel="noopener noreferrer"
                  download
                  className="p-2 rounded-lg bg-[#181818] text-[#05DFD7] hover:bg-[#222] transition-colors"
                  title="Unduh / Buka Gambar Asli"
                >
                  <Download className="w-4 h-4" />
                </a>
                <button
                  onClick={() => setActiveModal(null)}
                  className="p-2 rounded-lg bg-[#181818] text-[#9CA3AF] hover:text-white hover:bg-[#222] transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-auto bg-black flex items-center justify-center p-4">
              <img
                src={getInfoImg(activeModal)}
                alt={activeModal.title || 'Infografis'}
                className="max-h-[70vh] w-auto object-contain rounded-lg"
              />
            </div>
          </div>
        </div>
      )}
    </WashoskiCyanShell>
  );
}
