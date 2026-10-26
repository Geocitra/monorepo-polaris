'use client';

import React, { useState, useMemo } from 'react';
import { Eye, X, Download, Tag, Layers, ArrowLeft, Sparkles, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { LailaSakuraShell } from './LailaSakuraShell';
import { getLailaMemberInfo, useLailaHref } from './utils';

interface LailaSakuraInfografisGalleryClientProps {
  member: any;
  theme: any;
  infographics?: any[];
  initialInfographics?: any[];
  subdomain?: string;
}

export function LailaSakuraInfografisGalleryClient({
  member,
  theme,
  infographics,
  initialInfographics,
  subdomain,
}: LailaSakuraInfografisGalleryClientProps) {
  const effectiveInfographics = infographics || initialInfographics || [];
  const info = getLailaMemberInfo(member, theme, subdomain);
  const href = useLailaHref(subdomain);
  const [selectedInfographic, setSelectedInfographic] = useState<any | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');

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
            : 'Visualisasi data transparansi dan kebijakan publik.'),
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

  const filtered = useMemo(() => {
    return allInfographics.filter(
      (item) => selectedCategory === 'ALL' || item.category === selectedCategory
    );
  }, [allInfographics, selectedCategory]);

  return (
    <LailaSakuraShell
      member={member}
      theme={theme}
      subdomain={subdomain}
      activePage="infografis"
    >
      {/* ─── INFOGRAPHICS HERO ─── */}
      <section className="relative px-4 sm:px-6 pt-6 pb-12 bg-[#080D1A]">
        <div className="relative max-w-[1320px] mx-auto rounded-3xl sm:rounded-[44px] bg-[#0D1527] border border-[#1E2B42] p-8 sm:p-14 text-center overflow-hidden shadow-2xl">
          
          <div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] rounded-full blur-[160px] pointer-events-none opacity-25"
            style={{ backgroundColor: info.primaryColor }}
          />

          <div className="relative z-10 max-w-2xl mx-auto space-y-4">
            <span
              className="text-xs font-mono font-bold uppercase tracking-[0.25em] block"
              style={{ color: info.primaryColor }}
            >
              Visualisasi Data & Kinerja
            </span>
            <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
              🌸 Galeri Infografis Parlemen 🌸
            </h1>
            <p className="text-xs sm:text-sm text-[#A0ABC0] leading-relaxed">
              Ringkasan visual data fiskal, roadmap peraturan daerah, dan statistik tindak lanjut aspirasi masyarakat yang disajikan secara informatif dan mudah dipahami.
            </p>
          </div>

        </div>
      </section>

      {/* ─── CATEGORY FILTER TABS ─── */}
      <section className="bg-[#080D1A] pb-6">
        <div className="max-w-[1320px] mx-auto px-6 lg:px-12">
          <div className="flex flex-wrap items-center gap-2 pb-4 border-b border-[#1E2B42]">
            <span className="text-xs font-mono text-[#64748B] mr-2 flex items-center gap-1.5">
              <Tag className="w-3.5 h-3.5 text-[#FF4D8D]" />
              Kategori:
            </span>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-1.5 rounded-full text-xs font-mono transition-all ${
                  selectedCategory === cat
                    ? 'bg-[#FF4D8D] text-white font-bold shadow-[0_0_12px_rgba(255,77,141,0.4)]'
                    : 'bg-[#0D1527] text-[#A0ABC0] border border-[#1E2B42] hover:border-[#FF4D8D]/40 hover:text-white'
                }`}
              >
                {cat === 'ALL' ? 'Semua Infografis' : cat}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ─── INFOGRAPHICS POSTER GALLERY GRID ─── */}
      <section className="py-8 pb-24 bg-[#080D1A]">
        <div className="max-w-[1320px] mx-auto px-6 lg:px-12">
          
          {filtered.length === 0 ? (
            <div className="text-center py-20 bg-[#0D1527] border border-[#1E2B42] rounded-3xl p-8">
              <Layers className="w-10 h-10 text-[#64748B] mx-auto mb-3" />
              <p className="text-sm font-semibold text-white">
                {allInfographics.length === 0
                  ? 'Belum ada infografis publik yang diterbitkan saat ini.'
                  : 'Tidak ada infografis yang sesuai dengan kategori yang dipilih.'}
              </p>
              {allInfographics.length > 0 && (
                <button
                  onClick={() => setSelectedCategory('ALL')}
                  className="mt-3 text-xs text-[#FF4D8D] underline hover:text-white"
                >
                  Tampilkan Semua Infografis
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.map((item) => (
                <div
                  key={item.id}
                  onClick={() => setSelectedInfographic(item)}
                  className="group cursor-pointer bg-[#0D1527] border border-[#1E2B42] rounded-3xl overflow-hidden hover:border-[#FF4D8D]/60 transition-all duration-300 hover:shadow-[0_8px_30px_rgba(255,77,141,0.25)] flex flex-col"
                >
                  {/* Poster Gambar Infografis */}
                  <div className="relative aspect-[4/5] overflow-hidden bg-[#070B14]">
                    <img
                      src={item.imageUrl}
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 filter brightness-95 group-hover:brightness-105"
                    />
                    
                    <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <span
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-white font-bold text-xs shadow-xl"
                        style={{ backgroundColor: info.primaryColor }}
                      >
                        <Eye className="w-3.5 h-3.5" />
                        Perbesar Poster
                      </span>
                    </div>

                    <div className="absolute top-3 left-3">
                      <span
                        className="px-3 py-1 rounded-full bg-[#080D1A]/90 backdrop-blur-md border border-[#1E2B42] text-[10px] font-mono font-bold"
                        style={{ color: info.primaryColor }}
                      >
                        {item.badge}
                      </span>
                    </div>
                  </div>

                  {/* Deskripsi */}
                  <div className="p-5 flex-1 flex flex-col justify-between text-left">
                    <h3 className="font-bold text-sm text-white group-hover:text-[#FF4D8D] transition-colors leading-snug line-clamp-2">
                      {item.title}
                    </h3>
                    <p className="text-xs text-[#8E9BB0] mt-2 line-clamp-2">
                      {item.summary}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}

        </div>
      </section>

      {/* ─── MODAL VIEWER ─── */}
      {selectedInfographic && (
        <div
          className="fixed inset-0 z-50 bg-black/95 backdrop-blur-md flex items-center justify-center p-4 sm:p-6"
          onClick={() => setSelectedInfographic(null)}
        >
          <div
            className="relative max-w-4xl w-full bg-[#0D1527] border border-[#1E2B42] rounded-3xl overflow-hidden shadow-2xl p-6 sm:p-8 space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-4 border-b border-[#1E2B42]">
              <div>
                <span
                  className="text-[10px] font-mono uppercase tracking-wider font-bold"
                  style={{ color: info.primaryColor }}
                >
                  {selectedInfographic.badge}
                </span>
                <h3 className="text-lg sm:text-xl font-bold text-white mt-1">
                  {selectedInfographic.title}
                </h3>
              </div>
              <button
                onClick={() => setSelectedInfographic(null)}
                className="p-2 text-[#A0ABC0] hover:text-white rounded-xl hover:bg-[#1E2B42] transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="max-h-[65vh] overflow-auto rounded-2xl bg-black flex items-center justify-center p-2">
              <img
                src={selectedInfographic.imageUrl}
                alt={selectedInfographic.title}
                className="w-full h-auto max-h-[65vh] object-contain rounded-xl"
              />
            </div>

            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-2">
              <p className="text-xs text-[#A0ABC0] leading-relaxed max-w-xl">
                {selectedInfographic.summary}
              </p>
              <a
                href={selectedInfographic.imageUrl}
                download
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-white font-bold text-xs hover:bg-[#FF2E74] transition-colors shrink-0 shadow-lg"
                style={{ backgroundColor: info.primaryColor }}
              >
                <Download className="w-4 h-4" />
                <span>Unduh Poster</span>
              </a>
            </div>
          </div>
        </div>
      )}
    </LailaSakuraShell>
  );
}
