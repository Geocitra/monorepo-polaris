'use client';

import React, { useState, useMemo } from 'react';
import { Maximize2, X, Share2, Sparkles, Image as ImageIcon, Download, Check } from 'lucide-react';
import { OrixVioletShell } from './OrixVioletShell';
import { getOrixMemberInfo, ORIX_DEFAULT_INFOGRAPHICS } from './utils';

export interface OrixVioletInfografisGalleryClientProps {
  initialInfographics?: any[];
  member: any;
  theme?: any;
  subdomain?: string;
}

const getInfoImg = (i: any) =>
  i?.imageUrl || i?.posterUrl || i?.thumbnailUrl || '/images/showcase-infografis-apbd.jpg';
const getInfoCat = (i: any) => i?.category || i?.categoryName || 'Transparansi Data';

export function OrixVioletInfografisGalleryClient({
  initialInfographics = [],
  member,
  theme,
  subdomain,
}: OrixVioletInfografisGalleryClientProps) {
  const info = getOrixMemberInfo(member, theme, subdomain);
  const items =
    initialInfographics && initialInfographics.length > 0
      ? initialInfographics
      : ORIX_DEFAULT_INFOGRAPHICS;

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
    <OrixVioletShell
      member={member}
      theme={theme}
      subdomain={subdomain}
      activePage="infografis"
    >
      {/* ─── 1. HEADER SECTION ─── */}
      <section className="relative pt-36 pb-20 bg-gradient-to-br from-[#2D0694] via-[#3B0CB8] to-[#4F12D6] text-white overflow-hidden">
        {/* Geometric Accents */}
        <div className="absolute top-10 right-10 w-44 h-44 rounded-full border-4 border-yellow-400/30 pointer-events-none" />
        <div className="absolute -bottom-16 -left-16 w-64 h-64 rounded-full border-4 border-white/10 pointer-events-none" />

        <div className="max-w-[1240px] mx-auto px-6 lg:px-12 relative z-10">
          <div className="max-w-2xl space-y-4">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/15 backdrop-blur-md text-xs font-bold tracking-widest text-violet-200 uppercase">
              <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
              Galeri Data & Transparansi
            </div>
            <h1 className="text-4xl lg:text-5xl font-black tracking-tight text-white">
              Infografis & Informasi Publik
            </h1>
            <p className="text-violet-100/90 text-base lg:text-lg leading-relaxed">
              Ringkasan visual capaian kerja, alokasi anggaran aspirasi, jadwal reses, serta data pembangunan daerah {info.name}.
            </p>
          </div>
        </div>

        {/* Convex bottom white divider */}
        <div className="absolute -bottom-1 left-0 right-0 h-10 bg-white rounded-t-[2.5rem] pointer-events-none" />
      </section>

      {/* ─── 2. CATEGORY PILLS & GALLERY ─── */}
      <section className="py-12 bg-white min-h-[60vh]">
        <div className="max-w-[1240px] mx-auto px-6 lg:px-12">
          {/* Categories */}
          <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-8 scrollbar-none">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                className={`px-5 py-2.5 rounded-full text-xs font-bold whitespace-nowrap transition-all duration-200 ${
                  category === cat
                    ? 'bg-[#3B0CB8] text-white shadow-md shadow-[#3B0CB8]/25 scale-105'
                    : 'bg-violet-50 text-slate-600 hover:bg-violet-100/70 border border-violet-100'
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
                  className="group bg-white rounded-2xl border-2 border-violet-100 overflow-hidden hover:border-[#3B0CB8] transition-all duration-300 hover:shadow-xl hover:shadow-[#3B0CB8]/10 flex flex-col"
                >
                  {/* Poster Image Container */}
                  <div
                    onClick={() => setActiveModal(item)}
                    className="relative aspect-[4/5] bg-slate-100 cursor-pointer overflow-hidden"
                  >
                    <img
                      src={img}
                      alt={title}
                      className="w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-105"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-3">
                      <button
                        type="button"
                        className="w-12 h-12 rounded-full bg-white text-[#3B0CB8] flex items-center justify-center shadow-lg transform -translate-y-2 group-hover:translate-y-0 transition-transform duration-300"
                        title="Perbesar Gambar"
                      >
                        <Maximize2 className="w-5 h-5" />
                      </button>
                    </div>

                    <div className="absolute top-4 left-4">
                      <span className="px-3 py-1 rounded-full text-[11px] font-bold tracking-wide uppercase bg-[#3B0CB8] text-white shadow-md">
                        {cat}
                      </span>
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="p-5 flex-1 flex flex-col justify-between">
                    <div>
                      <p className="text-xs font-semibold text-slate-400 mb-1">{date}</p>
                      <h3
                        onClick={() => setActiveModal(item)}
                        className="text-base font-bold text-slate-900 group-hover:text-[#3B0CB8] transition-colors cursor-pointer line-clamp-2"
                      >
                        {title}
                      </h3>
                      {item.description && (
                        <p className="text-xs text-slate-500 mt-2 line-clamp-2 leading-relaxed">
                          {item.description}
                        </p>
                      )}
                    </div>

                    <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between">
                      <button
                        onClick={() => setActiveModal(item)}
                        className="inline-flex items-center gap-1.5 text-xs font-bold text-[#3B0CB8] hover:text-[#4F12D6]"
                      >
                        <Maximize2 className="w-3.5 h-3.5" />
                        Buka Pratinjau
                      </button>

                      <button
                        onClick={() => handleShare(item)}
                        className="inline-flex items-center gap-1 text-xs font-medium text-slate-500 hover:text-slate-800"
                      >
                        {copiedId === (item.id || item.title) ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                            <span className="text-emerald-600">Disalin</span>
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
          className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4 lg:p-8 animate-in fade-in duration-200"
          onClick={() => setActiveModal(null)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col shadow-2xl"
          >
            {/* Header Modal */}
            <div className="p-4 px-6 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div>
                <span className="text-[11px] font-bold text-[#3B0CB8] uppercase tracking-wide">
                  {getInfoCat(activeModal)}
                </span>
                <h4 className="text-sm lg:text-base font-bold text-slate-900 line-clamp-1">
                  {activeModal.title || 'Infografis'}
                </h4>
              </div>
              <div className="flex items-center gap-2">
                <a
                  href={getInfoImg(activeModal)}
                  target="_blank"
                  rel="noopener noreferrer"
                  download
                  className="p-2 rounded-lg bg-violet-50 text-[#3B0CB8] hover:bg-violet-100 transition-colors"
                  title="Unduh / Buka Gambar Asli"
                >
                  <Download className="w-4 h-4" />
                </a>
                <button
                  onClick={() => setActiveModal(null)}
                  className="p-2 rounded-lg bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Modal Image Body */}
            <div className="flex-1 overflow-auto bg-slate-950/5 flex items-center justify-center p-4">
              <img
                src={getInfoImg(activeModal)}
                alt={activeModal.title || 'Infografis'}
                className="max-h-[70vh] w-auto object-contain rounded-lg shadow-md"
              />
            </div>
          </div>
        </div>
      )}
    </OrixVioletShell>
  );
}
