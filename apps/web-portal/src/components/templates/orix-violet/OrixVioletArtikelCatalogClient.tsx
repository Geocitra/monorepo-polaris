'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { Search, Calendar, ArrowRight, BookOpen, Sparkles } from 'lucide-react';
import { OrixVioletShell } from './OrixVioletShell';
import {
  getOrixMemberInfo,
  useOrixHref,
  getArticleImage,
  getArticleCategory,
  getArticleExcerpt,
  ORIX_DEFAULT_ARTICLES,
} from './utils';

export interface OrixVioletArtikelCatalogClientProps {
  articles?: any[];
  member: any;
  theme?: any;
  subdomain?: string;
}

export function OrixVioletArtikelCatalogClient({
  articles = [],
  member,
  theme,
  subdomain,
}: OrixVioletArtikelCatalogClientProps) {
  const info = getOrixMemberInfo(member, theme, subdomain);
  const href = useOrixHref(subdomain);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('Semua');

  const sourceArticles =
    articles && articles.length > 0 && !String(articles[0]?.id || '').startsWith('ref-art')
      ? articles
      : ORIX_DEFAULT_ARTICLES;

  const categories = useMemo(() => {
    const set = new Set<string>();
    sourceArticles.forEach((a: any) => {
      const c = getArticleCategory(a);
      if (c) set.add(c);
    });
    return ['Semua', ...Array.from(set)];
  }, [sourceArticles]);

  const filtered = useMemo(() => {
    return sourceArticles.filter((item: any) => {
      const matchCategory =
        selectedCategory === 'Semua' || getArticleCategory(item) === selectedCategory;
      const q = searchQuery.trim().toLowerCase();
      const matchQuery =
        !q ||
        item.title?.toLowerCase().includes(q) ||
        getArticleExcerpt(item).toLowerCase().includes(q);
      return matchCategory && matchQuery;
    });
  }, [sourceArticles, selectedCategory, searchQuery]);

  const formatDate = (dateVal: any) => {
    try {
      const d = new Date(dateVal);
      if (isNaN(d.getTime())) return '01 Sep 2026';
      return d.toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      });
    } catch {
      return '01 Sep 2026';
    }
  };

  const [featured, ...rest] = filtered;

  return (
    <OrixVioletShell
      member={member}
      theme={theme}
      subdomain={subdomain}
      activePage="artikel"
      showMasthead={false}
    >
      {/* ─── 1. HEADER SECTION KATALOG ─── */}
      <section
        className="relative py-16 text-white overflow-hidden"
        style={{
          background: `linear-gradient(135deg, ${info.primaryColor} 0%, #1C025E 100%)`,
        }}
      >
        <div className="max-w-[1320px] mx-auto px-6 lg:px-12 xl:px-16 relative z-10">
          <div className="max-w-2xl space-y-3">
            <div className="flex items-center">
              <span className="text-xs font-black uppercase tracking-[0.2em] text-[#A78BFA]">
                PUBLIKASI &amp; RISET KEBIJAKAN
              </span>
            </div>
            <h1 className="font-extrabold text-4xl sm:text-5xl text-white tracking-tight">
              Katalog Artikel &amp; Risalah
            </h1>
            <p className="text-sm text-white/80 leading-relaxed">
              Arsip lengkap analisis kebijakan publik, telaah rancangan peraturan daerah, catatan pengawasan anggaran, serta edukasi parlemen dari {info.officialFullName}.
            </p>
          </div>
        </div>
      </section>

      {/* ─── 2. SEARCH & FILTER ─── */}
      <section className="py-12 bg-white">
        <div className="max-w-[1320px] mx-auto px-6 lg:px-12 xl:px-16 space-y-10">
          
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            {/* Search Input */}
            <div className="relative w-full md:w-96">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#9CA3AF]" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari judul artikel atau topik..."
                className="w-full pl-10 pr-4 py-2.5 rounded-full border border-slate-200 bg-[#FAFAFA] text-xs font-medium text-[#111827] placeholder-[#9CA3AF] focus:outline-none focus:border-[#4F12D6] transition-colors"
              />
            </div>

            {/* Category Pills */}
            <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0">
              {categories.map((cat) => {
                const isActive = selectedCategory === cat;
                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
                      isActive
                        ? 'bg-[#3B0CB8] text-white shadow-sm'
                        : 'bg-[#FAFAFA] text-[#6B7280] hover:text-[#111827] border border-slate-200'
                    }`}
                  >
                    {cat}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Featured Article */}
          {featured && (
            <Link
              href={href(`/artikel/${featured.slug || featured.id}`)}
              className="group block rounded-3xl overflow-hidden bg-white border border-slate-200 shadow-md hover:shadow-2xl transition-all duration-300"
            >
              <div className="grid grid-cols-1 lg:grid-cols-12 items-center">
                <div className="lg:col-span-7 relative aspect-[16/10] lg:aspect-auto lg:h-[380px] overflow-hidden bg-slate-100">
                  <img
                    src={getArticleImage(featured)}
                    alt={featured.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/images/showcase-artikel-pertanian.jpg';
                    }}
                  />
                  <div className="absolute top-4 left-4 px-3.5 py-1.5 rounded-full bg-[#3B0CB8] text-white text-[10px] font-extrabold uppercase tracking-wider shadow-sm">
                    {getArticleCategory(featured)} &bull; UTAMA
                  </div>
                </div>

                <div className="lg:col-span-5 p-8 lg:p-10 space-y-4">
                  <div className="flex items-center gap-2 text-xs font-semibold text-[#9CA3AF]">
                    <Calendar className="w-3.5 h-3.5 text-[#7C3AED]" />
                    <span>{formatDate(featured.publishedAt || featured.createdAt)}</span>
                  </div>

                  <h3 className="font-extrabold text-2xl lg:text-3xl text-[#111827] group-hover:text-[#4F12D6] transition-colors leading-tight">
                    {featured.title}
                  </h3>

                  <p className="text-xs sm:text-sm text-[#6B7280] line-clamp-3 leading-relaxed">
                    {getArticleExcerpt(featured)}
                  </p>

                  <div className="pt-2">
                    <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#4F12D6]">
                      <span>Baca Selengkapnya</span>
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          )}

          {/* Articles Grid */}
          {rest.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {rest.map((item: any, idx: number) => {
                const imgUrl = getArticleImage(item);
                const cat = getArticleCategory(item);
                const excerpt = getArticleExcerpt(item);
                const dateStr = formatDate(item.publishedAt || item.createdAt);

                return (
                  <Link
                    key={item.id || idx}
                    href={href(`/artikel/${item.slug || item.id}`)}
                    className="group bg-white rounded-3xl border border-slate-200 overflow-hidden hover:shadow-xl transition-all duration-300 flex flex-col"
                  >
                    <div className="relative aspect-[16/10] w-full overflow-hidden bg-slate-100">
                      <img
                        src={imgUrl}
                        alt={item.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = '/images/showcase-artikel-pertanian.jpg';
                        }}
                      />
                      <div className="absolute top-3 left-3 px-3 py-1 rounded-full bg-[#3B0CB8] text-white text-[10px] font-extrabold uppercase tracking-wider shadow-sm">
                        {cat}
                      </div>
                    </div>

                    <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                      <div>
                        <h4 className="font-bold text-base text-[#111827] group-hover:text-[#4F12D6] transition-colors line-clamp-2 leading-snug">
                          {item.title}
                        </h4>
                        <p className="mt-2 text-xs text-[#6B7280] line-clamp-3 leading-relaxed">
                          {excerpt}
                        </p>
                      </div>

                      <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-[11px] text-[#9CA3AF]">
                        <span className="flex items-center gap-1.5 font-medium">
                          <Calendar className="w-3.5 h-3.5 text-[#7C3AED]" />
                          {dateStr}
                        </span>
                        <span className="inline-flex items-center gap-1 font-bold text-[#4F12D6] group-hover:translate-x-1 transition-transform">
                          Baca ➔
                        </span>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}

          {filtered.length === 0 && (
            <div className="text-center py-16 bg-[#FAFAFA] rounded-3xl border border-dashed border-slate-200">
              <BookOpen className="w-10 h-10 text-[#9CA3AF] mx-auto mb-3" />
              <h3 className="font-bold text-base text-[#111827]">
                Tidak Ada Artikel yang Ditemukan
              </h3>
              <p className="text-xs text-[#6B7280] mt-1">
                Coba gunakan kata kunci pencarian yang lain atau ubah filter kategori.
              </p>
            </div>
          )}

        </div>
      </section>
    </OrixVioletShell>
  );
}
