'use client';

import React, { useState } from 'react';
import { Eye, Download, Share2, Tag, Calendar } from 'lucide-react';
import { ArikNoirShell } from './ArikNoirShell';
import {
  getArikMemberInfo,
  useArikHref,
  ARIK_DEFAULT_INFOGRAPHICS,
} from './utils';

export interface ArikNoirInfografisGalleryClientProps {
  member: any;
  theme?: any;
  infographics?: any[];
  subdomain?: string;
}

export function ArikNoirInfografisGalleryClient({
  member,
  theme,
  infographics: propInfographics,
  subdomain,
}: ArikNoirInfografisGalleryClientProps) {
  const info = getArikMemberInfo(member, theme, subdomain);
  const href = useArikHref(subdomain);

  const allInfographics =
    propInfographics && propInfographics.length > 0
      ? propInfographics
      : ARIK_DEFAULT_INFOGRAPHICS;

  const [activeItem, setActiveItem] = useState<any | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');

  const categories = Array.from(
    new Set(allInfographics.map((i: any) => i.category || 'Data Publik'))
  );

  const filtered =
    selectedCategory === 'ALL'
      ? allInfographics
      : allInfographics.filter(
          (i: any) => (i.category || 'Data Publik') === selectedCategory
        );

  return (
    <ArikNoirShell
      member={member}
      theme={theme}
      subdomain={subdomain}
      activePage="infografis"
    >
      <section className="pt-36 pb-24 bg-[#0A0A0A]">
        <div className="max-w-[1200px] mx-auto px-6 lg:px-12">
          
          {/* Header */}
          <div className="max-w-2xl mb-12">
            <span className="text-[10px] font-mono uppercase tracking-[0.25em] text-[#C5A880] block mb-2">
              GALERI VISUAL & TRANSPARANSI
            </span>
            <h1 className="text-3xl sm:text-5xl font-serif italic text-[#F5F2EB] tracking-tight">
              Infografis Kebijakan & Ringkasan Data
            </h1>
            <p className="text-xs sm:text-sm text-[#8E8A83] mt-3 leading-relaxed">
              Penyajian data postur anggaran daerah, progres pembangunan dapil, dan alur layanan publik dalam format visual informatif.
            </p>
          </div>

          {/* Filter Pills */}
          <div className="flex flex-wrap items-center gap-2 mb-10 pb-6 border-b border-[#1A1A1A]">
            <button
              type="button"
              onClick={() => setSelectedCategory('ALL')}
              className={`px-3.5 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-wider transition-all ${
                selectedCategory === 'ALL'
                  ? 'bg-[#E8DCC4] text-[#0A0A0A]'
                  : 'bg-[#141414] text-[#8E8A83] border border-[#222222] hover:text-[#F5F2EB]'
              }`}
            >
              Semua Kategori
            </button>
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`px-3.5 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-wider transition-all ${
                  selectedCategory === cat
                    ? 'bg-[#E8DCC4] text-[#0A0A0A]'
                    : 'bg-[#141414] text-[#8E8A83] border border-[#222222] hover:text-[#F5F2EB]'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Infographics 4-Column Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {filtered.map((item: any, idx: number) => {
              const poster =
                item.posterUrl ||
                item.imageUrl ||
                '/images/showcase-infografis-anggaran.jpg';

              return (
                <div
                  key={item.id || idx}
                  onClick={() => setActiveItem(item)}
                  className="group bg-[#111111] border border-[#1E1E1E] rounded-2xl overflow-hidden hover:border-[#C5A880]/60 transition-all duration-300 flex flex-col justify-between cursor-pointer shadow-xl hover:shadow-2xl hover:shadow-black/60"
                >
                  <div className="relative aspect-[3/4] overflow-hidden bg-[#161616]">
                    <img
                      src={poster}
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 filter brightness-95 group-hover:brightness-100"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A] via-transparent to-transparent opacity-80" />

                    <div className="absolute top-3 left-3">
                      <span className="px-2.5 py-1 rounded-full bg-[#0A0A0A]/90 backdrop-blur-md text-[9px] font-bold uppercase tracking-wider text-[#C5A880] border border-[#262626]">
                        {item.category || 'Data Publik'}
                      </span>
                    </div>

                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/40 backdrop-blur-xs">
                      <span className="px-4 py-2 rounded-full bg-[#E8DCC4] text-[#0A0A0A] text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 shadow-xl">
                        <Eye className="w-3.5 h-3.5" />
                        <span>Buka Visual</span>
                      </span>
                    </div>
                  </div>

                  <div className="p-5 flex-1 flex flex-col justify-between">
                    <div>
                      <span className="text-[10px] font-mono text-[#7A7670] uppercase tracking-wider block mb-1">
                        {item.date || 'Maret 2026'}
                      </span>
                      <h3 className="text-sm font-bold text-[#F5F2EB] group-hover:text-[#E8DCC4] transition-colors line-clamp-2 leading-snug">
                        {item.title}
                      </h3>
                    </div>

                    <div className="pt-3 mt-3 border-t border-[#181818] flex items-center justify-between text-[11px] font-bold text-[#C5A880]">
                      <span>Rincian Data</span>
                      <span>→</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

        </div>
      </section>

      {/* Modal Infographic */}
      {activeItem && (
        <div
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 sm:p-6"
          onClick={() => setActiveItem(null)}
        >
          <div
            className="bg-[#121212] border border-[#2A2A2A] rounded-3xl max-w-2xl w-full overflow-hidden shadow-2xl relative"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 sm:p-6 border-b border-[#1E1E1E] flex items-center justify-between">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-wider text-[#C5A880] block">
                  {activeItem.category || 'Infografis Resmi'}
                </span>
                <h3 className="text-base sm:text-lg font-bold text-[#F5F2EB] mt-0.5">
                  {activeItem.title}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setActiveItem(null)}
                className="p-2 rounded-full hover:bg-[#222] text-[#8E8A83] hover:text-white transition-colors"
              >
                ✕
              </button>
            </div>

            <div className="max-h-[70vh] overflow-y-auto p-4 sm:p-6 flex flex-col items-center">
              <img
                src={
                  activeItem.posterUrl ||
                  activeItem.imageUrl ||
                  '/images/showcase-infografis-anggaran.jpg'
                }
                alt={activeItem.title}
                className="w-full h-auto rounded-xl object-contain shadow-xl"
              />
              {activeItem.summary && (
                <p className="text-xs sm:text-sm text-[#8E8A83] mt-4 text-center leading-relaxed max-w-lg">
                  {activeItem.summary}
                </p>
              )}
            </div>

            <div className="p-4 border-t border-[#1E1E1E] flex justify-end">
              <button
                type="button"
                onClick={() => setActiveItem(null)}
                className="px-5 py-2 rounded-full bg-[#E8DCC4] text-[#0A0A0A] text-xs font-bold uppercase tracking-wider hover:bg-white transition-colors"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </ArikNoirShell>
  );
}
