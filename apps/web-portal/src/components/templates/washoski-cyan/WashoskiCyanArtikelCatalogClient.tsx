'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { Search, ArrowRight, Calendar, Clock, BookOpen, Sparkles } from 'lucide-react';
import { WashoskiCyanShell } from './WashoskiCyanShell';
import {
  getWashoskiMemberInfo,
  useWashoskiHref,
  WASHOSKI_DEFAULT_ARTICLES,
  WASHOSKI_CYAN,
} from './utils';

export interface WashoskiCyanArtikelCatalogClientProps {
  articles?: any[];
  member: any;
  theme?: any;
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
    : 'Terbaru');

export function WashoskiCyanArtikelCatalogClient({
  articles = [],
  member,
  theme,
  subdomain,
}: WashoskiCyanArtikelCatalogClientProps) {
  const info = getWashoskiMemberInfo(member, theme, subdomain);
  const href = useWashoskiHref(subdomain);

  const rawList =
    articles && articles.length > 0 ? articles : WASHOSKI_DEFAULT_ARTICLES;

  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('Semua');

  const categories = useMemo(() => {
    return ['Semua', ...Array.from(new Set(rawList.map(getArtCat)))];
  }, [rawList]);

  const filtered = useMemo(() => {
    return rawList.filter((item: any) => {
      const matchCat =
        activeCategory === 'Semua' || getArtCat(item) === activeCategory;
      const matchQuery =
        !searchQuery ||
        item.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.excerpt?.toLowerCase().includes(searchQuery.toLowerCase());
      return matchCat && matchQuery;
    });
  }, [rawList, activeCategory, searchQuery]);

  return (
    <WashoskiCyanShell
      member={member}
      theme={theme}
      subdomain={subdomain}
      activePage="artikel"
    >
      {/* ─── 1. HEADER KATALOG ─── */}
      <section className="pt-32 pb-16 bg-[#000000] border-b border-[#1A1A1A]">
        <div className="max-w-[1320px] mx-auto px-6 lg:px-12">
          <div className="max-w-2xl space-y-4">
            <span className="text-xs font-extrabold uppercase tracking-[0.25em] text-[#05DFD7] block">
              PUBLIKASI & KAJIAN PARLEMEN
            </span>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight uppercase">
              Katalog Artikel & Telaah Kebijakan <span className="text-[#05DFD7]">.</span>
            </h1>
            <p className="text-sm text-[#9CA3AF] leading-relaxed">
              Arsip pemikiran hukum, evaluasi perda, audit anggaran belanja daerah, dan risalah perjuangan aspirasi masyarakat {info.dapil}.
            </p>
          </div>
        </div>
      </section>

      {/* ─── 2. SEARCH & FILTER SECTION ─── */}
      <section className="py-8 bg-[#070707] border-b border-[#1A1A1A]">
        <div className="max-w-[1320px] mx-auto px-6 lg:px-12">
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
            
            {/* Search Input */}
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-[#71717A] absolute left-4 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari artikel, perda, atau topik kebijakan..."
                className="w-full pl-11 pr-4 py-2.5 rounded-lg bg-[#111111] border border-[#222] text-white placeholder-[#71717A] text-xs font-medium focus:outline-none focus:border-[#05DFD7]"
              />
            </div>

            {/* Category Pills */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-none">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider whitespace-nowrap transition-all ${
                    activeCategory === cat
                      ? 'bg-[#05DFD7] text-black shadow-md shadow-[#05DFD7]/20 font-extrabold'
                      : 'bg-[#111111] text-[#9CA3AF] border border-[#222] hover:text-white'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

          </div>
        </div>
      </section>

      {/* ─── 3. GRID OF ARTICLES ─── */}
      <section className="py-16 bg-[#070707] min-h-[50vh]">
        <div className="max-w-[1320px] mx-auto px-6 lg:px-12">
          {filtered.length === 0 ? (
            <div className="text-center py-20 bg-[#0E0E0E] rounded-2xl border border-[#1E1E1E]">
              <p className="text-sm font-semibold text-[#9CA3AF]">
                Tidak ada artikel yang cocok dengan pencarian &quot;{searchQuery}&quot;.
              </p>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setActiveCategory('Semua');
                }}
                className="mt-4 px-5 py-2 rounded-md bg-[#05DFD7] text-black text-xs font-extrabold uppercase"
              >
                Reset Filter
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-10">
              {filtered.map((art: any, idx: number) => {
                const img = getArtImg(art);
                const title = art.title;
                const slug = art.slug || `artikel-${idx + 1}`;
                const cat = getArtCat(art);
                const date = getArtDate(art);

                return (
                  <div
                    key={art.id || idx}
                    className="group bg-[#111111] border border-[#1E1E1E] rounded-2xl overflow-hidden hover:border-[#05DFD7] transition-all flex flex-col justify-between"
                  >
                    <Link
                      href={href(`/artikel/${slug}`)}
                      className="relative aspect-[16/10] overflow-hidden bg-[#1A1A1A] block"
                    >
                      <img
                        src={img}
                        alt={title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        loading="lazy"
                      />
                      <div className="absolute top-4 left-4">
                        <span className="px-3 py-1 rounded-full bg-black/80 backdrop-blur-md text-[10px] font-bold uppercase tracking-wider text-[#05DFD7] border border-[#05DFD7]/30">
                          {cat}
                        </span>
                      </div>
                    </Link>

                    <div className="p-6 lg:p-7 flex-1 flex flex-col justify-between">
                      <div>
                        <div className="flex items-center gap-3 text-xs text-[#71717A] mb-2 font-medium">
                          <span>{date}</span>
                          <span>•</span>
                          <span>{art.readTime || art.readingTime || '4 min baca'}</span>
                        </div>
                        <h3 className="text-lg lg:text-xl font-bold text-white group-hover:text-[#05DFD7] transition-colors line-clamp-2 leading-snug">
                          <Link href={href(`/artikel/${slug}`)}>{title}</Link>
                        </h3>
                        {art.excerpt && (
                          <p className="text-xs text-[#9CA3AF] mt-2 line-clamp-2 leading-relaxed">
                            {art.excerpt}
                          </p>
                        )}
                      </div>

                      <div className="pt-6 mt-4 border-t border-[#1C1C1C]">
                        <Link
                          href={href(`/artikel/${slug}`)}
                          className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#05DFD7] group-hover:translate-x-1.5 transition-transform"
                        >
                          <span>BACA SELENGKAPNYA</span>
                          <ArrowRight className="w-3.5 h-3.5" />
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
    </WashoskiCyanShell>
  );
}
