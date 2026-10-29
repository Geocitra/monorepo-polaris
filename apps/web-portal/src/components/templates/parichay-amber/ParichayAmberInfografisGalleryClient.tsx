'use client';

import React, { useState, useMemo } from 'react';
import { Maximize2, X, Share2, Sparkles, Image as ImageIcon } from 'lucide-react';
import { ParichayAmberShell } from './ParichayAmberShell';
import {
  getParichayMemberInfo,
  PARICHAY_DEFAULT_INFOGRAPHICS,
} from './utils';

export interface ParichayAmberInfografisGalleryClientProps {
  initialInfographics?: any[];
  member: any;
  theme?: any;
  subdomain?: string;
}

const getInfoImg = (i: any) =>
  i?.imageUrl || i?.posterUrl || i?.thumbnailUrl || '/images/showcase-infografis-apbd.jpg';
const getInfoCat = (i: any) => i?.category || i?.categoryName || 'Transparansi Data';

export function ParichayAmberInfografisGalleryClient({
  initialInfographics = [],
  member,
  theme,
  subdomain,
}: ParichayAmberInfografisGalleryClientProps) {
  const info = getParichayMemberInfo(member, theme, subdomain);
  const items =
    initialInfographics && initialInfographics.length > 0
      ? initialInfographics
      : PARICHAY_DEFAULT_INFOGRAPHICS;

  const [category, setCategory] = useState('Semua');
  const [activeModal, setActiveModal] = useState<any | null>(null);

  const categories = useMemo(() => {
    return ['Semua', ...Array.from(new Set(items.map(getInfoCat)))];
  }, [items]);

  const filtered = useMemo(() => {
    if (category === 'Semua') return items;
    return items.filter((i: any) => getInfoCat(i) === category);
  }, [items, category]);

  return (
    <ParichayAmberShell
      member={member}
      theme={theme}
      subdomain={subdomain}
      activePage="infografis"
      showMasthead={false}
    >
      {/* ─── 1. HEADER SECTION INFOGRAFIS ─── */}
      <section className="relative py-16 bg-[#FFF9ED] border-b border-[#F3E8D6] overflow-hidden">
        <div className="absolute -left-20 -top-20 w-[400px] h-[400px] rounded-full border-[40px] border-white/60 pointer-events-none" />
        <div className="max-w-[1240px] mx-auto px-6 lg:px-10 relative z-10">
          <div className="max-w-2xl space-y-3">
            <div className="flex items-center">
              <span
                className="text-xs font-black uppercase tracking-[0.2em]"
                style={{ color: info.primaryColor }}
              >
                DATA &amp; TRANSPARANSI PUBLIK
              </span>
            </div>
            <h1 className="font-extrabold text-4xl sm:text-5xl text-[#1E1E1E] tracking-tight">
              Galeri Infografis Capaian
            </h1>
            <p className="text-sm text-[#6B7280] leading-relaxed">
              Visualisasi data anggaran, capaian pengesahan perda, dan ringkasan pengawasan program kerja dari {info.officialFullName} dalam format visual yang mudah dipahami.
            </p>
          </div>
        </div>
      </section>

      {/* ─── 2. CATEGORY FILTER & GALLERY GRID ─── */}
      <section className="py-12 bg-white">
        <div className="max-w-[1240px] mx-auto px-6 lg:px-10 space-y-10">
          
          {/* Filter Pills */}
          <div className="flex flex-wrap items-center gap-2">
            {categories.map((c) => {
              const active = category === c;
              return (
                <button
                  key={c}
                  type="button"
                  onClick={() => setCategory(c)}
                  className={`px-4 py-2 rounded-full text-xs font-bold transition-all cursor-pointer ${
                    active
                      ? 'text-white shadow-sm'
                      : 'bg-[#FAFAFA] text-[#6B7280] hover:text-[#1E1E1E] border border-[#E5E7EB]'
                  }`}
                  style={active ? { backgroundColor: info.primaryColor } : {}}
                >
                  {c}
                </button>
              );
            })}
          </div>

          {/* Grid 3 Kolom Infografis */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {filtered.map((item: any, idx: number) => {
              const imgUrl = getInfoImg(item);
              const cat = getInfoCat(item);

              return (
                <div
                  key={item.id || idx}
                  onClick={() => setActiveModal(item)}
                  className="group relative rounded-2xl overflow-hidden bg-white border border-[#E5E7EB] shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col cursor-pointer"
                >
                  <div className="relative aspect-[4/5] w-full overflow-hidden bg-slate-100">
                    <img
                      src={imgUrl}
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = '/images/showcase-infografis-apbd.jpg';
                      }}
                    />
                    
                    <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent" />

                    <div className="absolute top-4 right-4 w-9 h-9 rounded-full bg-white/90 text-[#1E1E1E] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 shadow">
                      <Maximize2 className="w-4 h-4 font-bold" />
                    </div>

                    <div className="absolute bottom-4 left-4 right-4">
                      {item.metric && (
                        <div
                          className="font-extrabold text-3xl tracking-tight"
                          style={{ color: info.primaryColor }}
                        >
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

                  <div className="p-4 bg-white flex items-center justify-between text-xs text-[#6B7280]">
                    <span className="font-semibold" style={{ color: info.primaryColor }}>
                      {cat}
                    </span>
                    <span className="font-bold text-[#1E1E1E] group-hover:underline">
                      Perbesar Grafik ➔
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {filtered.length === 0 && (
            <div className="text-center py-16 bg-[#FAFAFA] rounded-3xl border border-dashed border-[#E5E7EB]">
              <ImageIcon className="w-10 h-10 text-[#9CA3AF] mx-auto mb-3" />
              <h3 className="font-bold text-base text-[#1E1E1E]">
                Tidak Ada Infografis di Kategori Ini
              </h3>
              <p className="text-xs text-[#6B7280] mt-1">
                Silakan pilih kategori lain untuk melihat publikasi visual dewan.
              </p>
            </div>
          )}

        </div>
      </section>

      {/* ─── MODAL LIGHTBOX INFOGRAFIS ─── */}
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
              className="absolute top-4 right-4 z-10 w-10 h-10 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-black transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Gambar Besar Infografis */}
            <div className="bg-[#1E1E1E] p-4 flex items-center justify-center min-h-[360px]">
              <img
                src={getInfoImg(activeModal)}
                alt={activeModal.title}
                className="max-h-[75vh] w-auto object-contain rounded-xl"
              />
            </div>

            {/* Info Detail Infografis */}
            <div className="p-8 flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                <span
                  className="px-3 py-1 rounded-full text-white text-[10px] font-extrabold uppercase tracking-wider inline-block"
                  style={{ backgroundColor: info.primaryColor }}
                >
                  {getInfoCat(activeModal)}
                </span>

                <h3 className="font-extrabold text-2xl text-[#1E1E1E] leading-snug">
                  {activeModal.title}
                </h3>

                {activeModal.metric && (
                  <div className="p-4 rounded-2xl bg-[#FFF9ED] border border-[#F3E8D6]">
                    <div
                      className="text-4xl font-extrabold"
                      style={{ color: info.primaryColor }}
                    >
                      {activeModal.metric}
                    </div>
                    <div className="text-xs font-bold text-[#6B7280] uppercase tracking-wider mt-1">
                      {activeModal.metricLabel || 'Indikator Utama'}
                    </div>
                  </div>
                )}

                <p className="text-xs sm:text-sm text-[#4B5563] leading-relaxed">
                  {activeModal.description ||
                    'Publikasi grafik transparansi dan capaian fungsi legislasi, anggaran, serta pengawasan dewan resmi untuk publik.'}
                </p>
              </div>

              <div className="pt-4 border-t border-[#F3E8D6] flex items-center justify-between">
                <span className="text-xs text-[#9CA3AF]">
                  Dipublikasikan oleh {info.officialFullName}
                </span>
                <button
                  type="button"
                  onClick={() => setActiveModal(null)}
                  className="px-6 py-2.5 rounded-full text-white text-xs font-bold uppercase tracking-wider shadow-sm hover:shadow"
                  style={{ backgroundColor: info.primaryColor }}
                >
                  Tutup Tampilan
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </ParichayAmberShell>
  );
}
