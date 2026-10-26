'use client';

import React, { useState, useMemo } from 'react';
import { Eye, X, Download, Tag, Layers, ChevronRight, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { TiaraBurgundyShell } from './TiaraBurgundyShell';
import { getTiaraMemberInfo, useTiaraHref } from './utils';

interface TiaraBurgundyInfografisGalleryClientProps {
  member: any;
  theme: any;
  infographics?: any[];
  initialInfographics?: any[];
  subdomain?: string;
}

export function TiaraBurgundyInfografisGalleryClient({
  member,
  theme,
  infographics,
  initialInfographics,
  subdomain,
}: TiaraBurgundyInfografisGalleryClientProps) {
  const effectiveInfographics = infographics || initialInfographics || [];
  const info = getTiaraMemberInfo(member, theme, subdomain);
  const href = useTiaraHref(subdomain);
  const [selectedInfographic, setSelectedInfographic] = useState<any | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');

  // Real API infographics only
  const allInfographics = useMemo(() => {
    if (effectiveInfographics && effectiveInfographics.length > 0) {
      return effectiveInfographics.map((inf: any, i: number) => ({
        id: inf.id || `info-${i}`,
        title: inf.title,
        category: inf.category || inf.categoryName || 'Visual Kebijakan',
        badge:
          inf.badge ||
          (inf.assetType === 'DALLE_POSTER' ? 'Poster Kebijakan' : 'Infografis Resmi'),
        imageUrl:
          inf.posterUrl ||
          inf.featuredImageUrl ||
          inf.fileUrl ||
          inf.imageUrl ||
          inf.thumbnailUrl ||
          '/images/showcase-infografis-apbd.jpg',
        summary:
          inf.summary ||
          inf.description ||
          inf.excerpt ||
          (inf.bodyContentMarkdown
            ? inf.bodyContentMarkdown.substring(0, 140) + '...'
            : 'Visualisasi data transparansi dan kebijakan publik bagi masyarakat daerah.'),
      }));
    }
    return [];
  }, [effectiveInfographics]);

  const categories = useMemo(() => {
    const set = new Set<string>();
    allInfographics.forEach((item) => {
      if (item.category) set.add(item.category);
    });
    return ['ALL', ...Array.from(set)];
  }, [allInfographics]);

  const filteredInfographics = useMemo(() => {
    if (selectedCategory === 'ALL') return allInfographics;
    return allInfographics.filter((item) => item.category === selectedCategory);
  }, [allInfographics, selectedCategory]);

  return (
    <TiaraBurgundyShell member={member} theme={theme} subdomain={subdomain} activePage="infografis">
      {/* Editorial Header */}
      <section className="bg-[#EFEBE4] border-b border-[#E5DED5] py-14 sm:py-20 px-6 sm:px-10 lg:px-12">
        <div className="max-w-6xl mx-auto space-y-6">
          {/* Breadcrumb */}
          <div className="flex items-center space-x-2 text-xs font-serif uppercase tracking-[0.2em] text-[#7A6F6A]">
            <Link href={href('/')} className="hover:text-[#6B1724] transition-colors">
              Beranda
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-[#B8AEA8]" />
            <span className="font-bold" style={{ color: info.textAccentColor }}>Galeri Infografis & Data Visual</span>
          </div>

          <div className="max-w-3xl space-y-3">
            <span className="font-serif italic text-2xl sm:text-3xl block" style={{ color: info.textAccentColor }}>
              Transparansi Visual Parlemen
            </span>
            <h1 className="font-serif text-4xl sm:text-6xl text-[#6B1724] tracking-tight leading-none uppercase font-normal">
              INFOGRAFIS & POSTER KEBIJAKAN
            </h1>
            <p className="text-sm sm:text-base text-[#5A524D] leading-relaxed pt-1">
              Penyajian data alokasi APBD, capaian pengawasan komisi, dan panduan program bantuan rakyat yang dikemas secara ringkas, visual, dan mudah dipahami publik.
            </p>
          </div>

          {/* Category Filter Pills */}
          <div className="pt-4 flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            {categories.map((cat) => {
              const isActive = selectedCategory === cat;
              return (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-5 py-2.5 rounded-full font-serif text-[11px] font-semibold tracking-wider uppercase whitespace-nowrap transition-all ${
                    isActive
                      ? 'bg-[#6B1724] text-white shadow-xs'
                      : 'bg-white border border-[#DDD5CA] text-[#5A524D] hover:border-[#6B1724] hover:text-[#6B1724]'
                  }`}
                >
                  {cat === 'ALL' ? 'Semua Kategori' : cat}
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* Infographics Gallery Grid */}
      <section className="bg-[#FBF9F5] py-14 sm:py-20 px-6 sm:px-10 lg:px-12 min-h-[500px]">
        <div className="max-w-6xl mx-auto">
          {filteredInfographics.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredInfographics.map((inf) => (
                <div
                  key={inf.id}
                  onClick={() => setSelectedInfographic(inf)}
                  className="group bg-white border border-[#E5DED5] rounded-xs overflow-hidden flex flex-col hover:shadow-xl hover:border-[#6B1724]/40 transition-all duration-300 cursor-pointer"
                >
                  {/* Poster Image Preview */}
                  <div className="relative aspect-4/5 overflow-hidden bg-[#EFEBE4]">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={inf.imageUrl}
                      alt={inf.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-[#6B1724]/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <span className="px-5 py-2 bg-white text-[#6B1724] rounded-full font-serif text-xs font-bold uppercase tracking-wider flex items-center space-x-2 shadow-lg">
                        <Eye className="w-4 h-4" />
                        <span>Perbesar Grafis</span>
                      </span>
                    </div>
                    <div className="absolute top-3 left-3 bg-[#6B1724] text-white text-[10px] font-serif font-bold uppercase tracking-[0.15em] px-3 py-1 rounded-full shadow-xs">
                      {inf.badge}
                    </div>
                  </div>

                  {/* Card Info */}
                  <div className="p-6 flex-1 flex flex-col justify-between space-y-3">
                    <div className="space-y-2">
                      <span className="text-[11px] font-serif uppercase tracking-[0.15em] text-[#7A6F6A] block">
                        {inf.category}
                      </span>
                      <h2 className="font-serif text-lg font-bold text-[#1E1B18] group-hover:text-[#6B1724] transition-colors leading-snug line-clamp-2">
                        {inf.title}
                      </h2>
                      <p className="text-xs text-[#5A524D] leading-relaxed line-clamp-2">
                        {inf.summary}
                      </p>
                    </div>

                    <div className="pt-3 border-t border-[#E5DED5] flex items-center justify-between text-[11px] font-serif uppercase tracking-wider" style={{ color: info.textAccentColor }}>
                      <span className="font-bold flex items-center space-x-1.5 hover:opacity-80 transition">
                        <Eye className="w-3.5 h-3.5" />
                        <span>Buka Detail</span>
                      </span>
                      <span className="text-[#8C827A]">Visual Data</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-20 text-center max-w-md mx-auto space-y-4">
              <div className="w-16 h-16 rounded-full bg-[#EFEBE4] border border-[#DDD5CA] flex items-center justify-center mx-auto text-[#6B1724]">
                <Layers className="w-8 h-8" />
              </div>
              <h3 className="font-serif text-2xl text-[#6B1724] uppercase tracking-wide">
                Belum Ada Infografis
              </h3>
              <p className="text-xs text-[#7A6F6A] leading-relaxed">
                Belum ada berkas infografis atau poster kebijakan yang dipublikasikan dalam kategori ini.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Lightbox Modal */}
      {selectedInfographic && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={() => setSelectedInfographic(null)}
        >
          <div
            className="relative bg-[#FBF9F5] rounded-xs max-w-3xl w-full max-h-[90vh] overflow-y-auto p-6 border border-[#DDD5CA] shadow-2xl space-y-6"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-[#E5DED5] pb-4">
              <div>
                <span className="font-serif text-xs font-bold uppercase tracking-[0.2em] text-[#6B1724] block">
                  {selectedInfographic.category} • {selectedInfographic.badge}
                </span>
                <h3 className="font-serif text-xl sm:text-2xl font-bold text-[#1E1B18] mt-1">
                  {selectedInfographic.title}
                </h3>
              </div>
              <button
                onClick={() => setSelectedInfographic(null)}
                className="p-2 rounded-full hover:bg-[#EFEBE4] text-[#7A6F6A] hover:text-[#1E1B18] transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Graphic Image in Modal */}
            <div className="bg-[#EFEBE4] rounded-xs overflow-hidden border border-[#DDD5CA]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={selectedInfographic.imageUrl}
                alt={selectedInfographic.title}
                className="w-full h-auto max-h-[60vh] object-contain mx-auto"
              />
            </div>

            {/* Modal Description & Download */}
            <div className="space-y-4">
              <p className="text-sm text-[#5A524D] leading-relaxed">
                {selectedInfographic.summary}
              </p>

              <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-[#E5DED5]">
                <a
                  href={selectedInfographic.imageUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  download
                  className="inline-flex items-center space-x-2 px-6 py-2.5 bg-[#6B1724] text-white rounded-full font-serif text-xs font-semibold uppercase tracking-[0.15em] hover:bg-[#52101B] transition-colors"
                >
                  <Download className="w-4 h-4" />
                  <span>Unduh Dokumen Resolusi Penuh</span>
                </a>

                <button
                  onClick={() => setSelectedInfographic(null)}
                  className="px-5 py-2.5 bg-white border border-[#DDD5CA] text-[#5A524D] rounded-full font-serif text-xs font-semibold uppercase tracking-wider hover:border-[#6B1724] hover:text-[#6B1724] transition-colors"
                >
                  Tutup
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </TiaraBurgundyShell>
  );
}
