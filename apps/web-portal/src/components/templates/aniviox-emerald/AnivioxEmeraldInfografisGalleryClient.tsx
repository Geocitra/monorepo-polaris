'use client';

import React, { useState } from 'react';
import { Eye, X, Download, Tag, Layers, ArrowLeft, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { AnivioxEmeraldShell } from './AnivioxEmeraldShell';
import { getAnivioxMemberInfo, useAnivioxHref, ANIVIOX_DEFAULT_INFOGRAPHICS } from './utils';

interface AnivioxEmeraldInfografisGalleryClientProps {
  member: any;
  theme: any;
  infographics?: any[];
  subdomain?: string;
}

export function AnivioxEmeraldInfografisGalleryClient({
  member,
  theme,
  infographics = [],
  subdomain,
}: AnivioxEmeraldInfografisGalleryClientProps) {
  const info = getAnivioxMemberInfo(member, theme, subdomain);
  const href = useAnivioxHref(subdomain);
  const [selectedInfographic, setSelectedInfographic] = useState<any | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');

  const allInfographics =
    infographics && infographics.length > 0
      ? infographics.map((inf: any, i: number) => ({
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
        }))
      : [];

  const categories = [
    'ALL',
    ...Array.from(new Set(allInfographics.map((item) => item.category))),
  ];

  const filtered = allInfographics.filter(
    (item) => selectedCategory === 'ALL' || item.category === selectedCategory
  );

  return (
    <AnivioxEmeraldShell
      member={member}
      theme={theme}
      subdomain={subdomain}
      activePage="infografis"
    >
      {/* ─── INFOGRAPHICS HERO ─── */}
      <section className="relative px-3 sm:px-6 pt-3 sm:pt-4 pb-12 bg-[#060A08]">
        <div className="relative max-w-[1340px] mx-auto rounded-3xl sm:rounded-[44px] bg-gradient-to-b from-[#0A291A] via-[#071B11] to-[#05110B] border border-[#143B25] p-8 sm:p-14 text-center overflow-hidden shadow-2xl">
          
          <div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] rounded-full blur-[140px] pointer-events-none opacity-25"
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
              Galeri Infografis Kebijakan
            </h1>
            <p className="text-xs sm:text-sm text-[#A3B8AD] leading-relaxed">
              Ringkasan visual data fiskal, roadmap peraturan daerah, dan statistik tindak lanjut aspirasi masyarakat yang disajikan secara informatif dan mudah dipahami.
            </p>
          </div>

        </div>
      </section>

      {/* ─── CATEGORY FILTER TABS ─── */}
      <section className="bg-[#060A08] pb-6">
        <div className="max-w-[1340px] mx-auto px-6 lg:px-12">
          <div className="flex flex-wrap items-center gap-2 pb-4 border-b border-[#14241B]">
            <span className="text-xs font-mono text-[#688073] mr-2 flex items-center gap-1.5">
              <Tag className="w-3.5 h-3.5 text-[#00F076]" />
              Kategori:
            </span>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-1.5 rounded-full text-xs font-mono transition-all ${
                  selectedCategory === cat
                    ? 'bg-[#00F076] text-black font-bold shadow-[0_0_12px_rgba(0,240,118,0.3)]'
                    : 'bg-[#0C1510] text-[#A3B8AD] border border-[#15241C] hover:border-[#00F076]/40 hover:text-white'
                }`}
              >
                {cat === 'ALL' ? 'Semua Infografis' : cat}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ─── INFOGRAPHICS POSTER GALLERY GRID ─── */}
      <section className="py-8 pb-24 bg-[#060A08]">
        <div className="max-w-[1340px] mx-auto px-6 lg:px-12">
          
          {filtered.length === 0 ? (
            <div className="text-center py-20 bg-[#0C1510] border border-[#15241C] rounded-3xl p-8">
              <Layers className="w-10 h-10 text-[#688073] mx-auto mb-3" />
              <p className="text-sm font-semibold text-white">Tidak ada infografis publik yang sesuai kriteria.</p>
              <button
                onClick={() => setSelectedCategory('ALL')}
                className="mt-3 text-xs text-[#00F076] underline hover:text-white"
              >
                Reset Filter
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {filtered.map((item) => (
              <div
                key={item.id}
                onClick={() => setSelectedInfographic(item)}
                className="group cursor-pointer bg-[#0C1510] border border-[#15241C] rounded-2xl sm:rounded-3xl overflow-hidden hover:border-[#00F076]/60 transition-all duration-300 hover:shadow-2xl hover:shadow-[#00F076]/10 flex flex-col"
              >
                {/* Poster Gambar Infografis */}
                <div className="relative aspect-[4/5] overflow-hidden bg-[#070D09]">
                  <img
                    src={item.imageUrl}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 filter brightness-95 group-hover:brightness-105"
                  />
                  
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <span
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-black font-bold text-xs shadow-xl"
                      style={{ backgroundColor: info.primaryColor }}
                    >
                      <Eye className="w-3.5 h-3.5" />
                      Perbesar Poster
                    </span>
                  </div>

                  <div className="absolute top-3 left-3">
                    <span
                      className="px-3 py-1 rounded-full bg-[#060A08]/90 backdrop-blur-md border border-[#14241B] text-[10px] font-mono font-bold"
                      style={{ color: info.primaryColor }}
                    >
                      {item.badge}
                    </span>
                  </div>
                </div>

                {/* Deskripsi */}
                <div className="p-5 flex-1 flex flex-col justify-between">
                  <h3 className="font-bold text-sm text-white group-hover:text-[#00F076] transition-colors leading-snug line-clamp-2">
                    {item.title}
                  </h3>
                  <p className="text-xs text-[#688073] mt-2 line-clamp-2">
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
            className="relative max-w-4xl w-full bg-[#0C1510] border border-[#15241C] rounded-3xl overflow-hidden shadow-2xl p-6 sm:p-8 space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-4 border-b border-[#15241C]">
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
                className="p-2 text-[#A3B8AD] hover:text-white rounded-xl hover:bg-[#14241B] transition-colors"
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
              <p className="text-xs text-[#A3B8AD] leading-relaxed max-w-xl">
                {selectedInfographic.summary}
              </p>
              <a
                href={selectedInfographic.imageUrl}
                download
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-black font-bold text-xs hover:bg-white transition-colors shrink-0 shadow-lg"
                style={{ backgroundColor: info.primaryColor }}
              >
                <Download className="w-4 h-4" />
                <span>Unduh Poster</span>
              </a>
            </div>
          </div>
        </div>
      )}
    </AnivioxEmeraldShell>
  );
}
