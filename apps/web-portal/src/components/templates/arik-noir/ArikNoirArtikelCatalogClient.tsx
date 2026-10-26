'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { Search, Calendar, ArrowRight, Tag, ArrowUpRight } from 'lucide-react';
import { ArikNoirShell } from './ArikNoirShell';
import {
  getArikMemberInfo,
  useArikHref,
  ARIK_DEFAULT_ARTICLES,
} from './utils';

export interface ArikNoirArtikelCatalogClientProps {
  member: any;
  theme?: any;
  articles?: any[];
  subdomain?: string;
}

const getArtImg = (a: any) =>
  a?.imageUrl ||
  a?.featuredImageUrl ||
  a?.posterUrl ||
  a?.thumbnailUrl ||
  '/images/showcase-artikel-rapat.jpg';

const getArtCat = (a: any) =>
  a?.category || a?.categoryName || a?.issueCategory || 'Kebijakan Publik';

const getArtDate = (a: any) =>
  a?.date ||
  (a?.publishedAt
    ? new Date(a.publishedAt).toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      })
    : 'Maret 2026');

export function ArikNoirArtikelCatalogClient({
  member,
  theme,
  articles: propArticles,
  subdomain,
}: ArikNoirArtikelCatalogClientProps) {
  const info = getArikMemberInfo(member, theme, subdomain);
  const href = useArikHref(subdomain);

  const allArticles =
    propArticles && propArticles.length > 0 ? propArticles : ARIK_DEFAULT_ARTICLES;

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');

  // Categories extraction
  const categories = useMemo(() => {
    const set = new Set<string>();
    allArticles.forEach((a: any) => {
      const cat = getArtCat(a);
      if (cat) set.add(cat);
    });
    return ['ALL', ...Array.from(set)];
  }, [allArticles]);

  const filteredArticles = useMemo(() => {
    return allArticles.filter((a: any) => {
      const matchesSearch =
        !searchQuery ||
        a.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.excerpt?.toLowerCase().includes(searchQuery.toLowerCase());

      const cat = getArtCat(a);
      const matchesCategory =
        selectedCategory === 'ALL' || cat === selectedCategory;

      return matchesSearch && matchesCategory;
    });
  }, [allArticles, searchQuery, selectedCategory]);

  return (
    <ArikNoirShell
      member={member}
      theme={theme}
      subdomain={subdomain}
      activePage="artikel"
    >
      <section className="pt-36 pb-24 bg-[#0A0A0A]">
        <div className="max-w-[1200px] mx-auto px-6 lg:px-12">
          
          {/* Header */}
          <div className="max-w-2xl mb-12">
            <span className="text-[10px] font-mono uppercase tracking-[0.25em] text-[#C5A880] block mb-2">
              WARTA & KAJIAN LEGISLATIF
            </span>
            <h1 className="text-3xl sm:text-5xl font-serif italic text-[#F5F2EB] tracking-tight">
              Katalog Artikel & Risalah Kebijakan
            </h1>
            <p className="text-xs sm:text-sm text-[#8E8A83] mt-3 leading-relaxed">
              Arsip publikasi resmi, catatan persidangan komisi, telaah perda, dan gagasan strategis {info.officialFullName}.
            </p>
          </div>

          {/* Search & Filter Bar */}
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 mb-12 pb-6 border-b border-[#1A1A1A]">
            
            {/* Search Input */}
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-[#5C5852] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Cari topik artikel atau regulasi..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-full bg-[#111111] border border-[#222222] text-xs text-[#F5F2EB] placeholder-[#5C5852] focus:outline-hidden focus:border-[#C5A880] transition-colors"
              />
            </div>

            {/* Category Pills */}
            <div className="flex flex-wrap items-center gap-2">
              {categories.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-wider transition-all ${
                    selectedCategory === cat
                      ? 'bg-[#E8DCC4] text-[#0A0A0A]'
                      : 'bg-[#141414] text-[#8E8A83] border border-[#222222] hover:text-[#F5F2EB]'
                  }`}
                >
                  {cat === 'ALL' ? 'Semua Topik' : cat}
                </button>
              ))}
            </div>

          </div>

          {/* Articles Grid */}
          {filteredArticles.length === 0 ? (
            <div className="text-center py-20 bg-[#111111] border border-[#1E1E1E] rounded-2xl">
              <p className="text-sm text-[#8E8A83]">
                Tidak ada artikel yang cocok dengan pencarian "{searchQuery}".
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-10">
              {filteredArticles.map((art: any, idx: number) => {
                const img = getArtImg(art);
                const title = art.title;
                const slug = art.slug || `artikel-${idx + 1}`;
                const cat = getArtCat(art);
                const date = getArtDate(art);

                return (
                  <div
                    key={art.id || idx}
                    className="group bg-[#111111] border border-[#1E1E1E] rounded-2xl overflow-hidden hover:border-[#C5A880]/60 transition-all duration-300 flex flex-col justify-between shadow-xl"
                  >
                    <Link
                      href={href(`/artikel/${slug}`)}
                      className="relative aspect-[16/10] overflow-hidden bg-[#161616] block"
                    >
                      <img
                        src={img}
                        alt={title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 filter brightness-90 group-hover:brightness-100"
                        loading="lazy"
                      />
                      <div className="absolute top-4 left-4">
                        <span className="px-3 py-1 rounded-full bg-[#0A0A0A]/90 backdrop-blur-md text-[10px] font-bold uppercase tracking-wider text-[#E8DCC4] border border-[#2A2A2A]">
                          {cat}
                        </span>
                      </div>
                      <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                        <span className="w-8 h-8 rounded-full bg-[#E8DCC4] text-[#0A0A0A] flex items-center justify-center shadow-lg">
                          <ArrowUpRight className="w-4 h-4" />
                        </span>
                      </div>
                    </Link>

                    <div className="p-6 sm:p-7 flex-1 flex flex-col justify-between">
                      <div>
                        <div className="flex items-center gap-3 text-xs text-[#7A7670] mb-3 font-mono">
                          <Calendar className="w-3.5 h-3.5" />
                          <span>{date}</span>
                          <span>•</span>
                          <span>{info.party}</span>
                        </div>

                        <h2 className="text-lg sm:text-xl font-bold text-[#F5F2EB] group-hover:text-[#E8DCC4] transition-colors line-clamp-2 leading-snug">
                          <Link href={href(`/artikel/${slug}`)}>
                            {title}
                          </Link>
                        </h2>

                        {art.excerpt && (
                          <p className="text-xs sm:text-[13px] text-[#8E8A83] mt-2.5 line-clamp-2 leading-relaxed">
                            {art.excerpt}
                          </p>
                        )}
                      </div>

                      <div className="pt-6 mt-6 border-t border-[#181818] flex items-center justify-between">
                        <Link
                          href={href(`/artikel/${slug}`)}
                          className="inline-flex items-center gap-1.5 text-xs font-bold text-[#C5A880] group-hover:text-[#F5F2EB] transition-colors"
                        >
                          <span>Baca Risalah Penuh</span>
                          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

        </div>
      </section>
    </ArikNoirShell>
  );
}
