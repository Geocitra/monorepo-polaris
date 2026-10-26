'use client';

import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import { Search, Calendar, Clock, ArrowRight } from 'lucide-react';
import { formatDateIndonesian } from '@/lib/utils';
import {
  useBlushHref,
  getArticleImage,
  getArticleCategory,
  getArticleExcerpt,
  BLUSH_DEFAULT_ARTICLES,
} from './utils';

interface BlushEditorialArtikelCatalogClientProps {
  articles?: any[];
  member: any;
  theme?: any;
  subdomain?: string;
}

export function BlushEditorialArtikelCatalogClient({
  articles = [],
  subdomain,
}: BlushEditorialArtikelCatalogClientProps) {
  const href = useBlushHref(subdomain);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('Semua');

  const sourceArticles =
    articles && articles.length > 0 && !String(articles[0]?.id || '').startsWith('ref-art')
      ? articles
      : BLUSH_DEFAULT_ARTICLES;

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

  const [featured, ...rest] = filtered;

  return (
    <div className="max-w-[1240px] mx-auto px-6 lg:px-10 py-16 space-y-12">
      
      {/* ─── FILTER & SEARCH BAR ─── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Category Pills */}
        <div className="flex flex-wrap gap-2">
          {categories.map((cat) => {
            const active = selectedCategory === cat;
            return (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-full text-xs font-bold transition-all cursor-pointer ${
                  active
                    ? 'bg-[#D47A6A] text-white shadow-sm'
                    : 'bg-white border border-[#EDE5DA] text-[#6E635C] hover:text-[#332A26] hover:border-[#D47A6A]'
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>

        {/* Search Input */}
        <div className="relative md:w-72">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#9C8F85]" />
          <input
            id="blush-search-artikel"
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari risalah / topik..."
            className="w-full pl-10 pr-4 py-2.5 rounded-full bg-white border border-[#EDE5DA] text-xs text-[#332A26] placeholder:text-[#A89D94] focus:outline-none focus:border-[#D47A6A] shadow-2xs transition-colors"
          />
        </div>
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-20 text-[#8C7D73] text-sm">
          Tidak ada artikel yang sesuai dengan kriteria pencarian Anda.
        </div>
      )}

      {/* ─── ARTIKEL UTAMA (FEATURED) DENGAN GAMBAR BESAR ─── */}
      {featured && (
        <Link
          href={href(`/artikel/${featured.slug || featured.id}`)}
          className="group grid grid-cols-1 md:grid-cols-12 rounded-3xl bg-white border border-[#EDE5DA] overflow-hidden hover:shadow-xl transition-all duration-300"
        >
          {/* Gambar Featured */}
          <div className="md:col-span-6 relative aspect-[16/10] md:aspect-auto overflow-hidden bg-[#FAF7F2] min-h-[280px]">
            <img
              src={getArticleImage(featured)}
              alt={featured.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              onError={(e) => {
                (e.target as HTMLImageElement).src = '/images/showcase-artikel-pertanian.jpg';
              }}
            />
            <div className="absolute top-4 left-4 px-3.5 py-1 rounded-full bg-white/95 text-[#D47A6A] text-[10px] font-black uppercase tracking-wider shadow-sm">
              {getArticleCategory(featured)}
            </div>
          </div>

          {/* Konten Featured */}
          <div className="md:col-span-6 p-8 lg:p-12 flex flex-col justify-between space-y-4">
            <div>
              <span className="text-[10px] uppercase font-black text-[#D47A6A] tracking-[0.2em] block mb-2">
                SOROTAN UTAMA
              </span>
              <h2 className="font-serif font-bold text-2xl lg:text-3xl text-[#332A26] group-hover:text-[#D47A6A] transition-colors leading-tight">
                {featured.title}
              </h2>
              <p className="mt-3 text-xs sm:text-sm text-[#7A6B63] leading-relaxed line-clamp-3">
                {getArticleExcerpt(featured)}
              </p>
            </div>

            <div className="pt-4 border-t border-[#F3ECE1] flex items-center justify-between text-xs text-[#8C7D73]">
              <span className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-[#D47A6A]" />
                {formatDateIndonesian(featured.publishedAt || featured.createdAt || new Date())}
              </span>
              <span className="inline-flex items-center gap-1 font-bold text-[#D47A6A] group-hover:translate-x-1 transition-transform">
                Baca Selengkapnya <ArrowRight className="w-3.5 h-3.5" />
              </span>
            </div>
          </div>
        </Link>
      )}

      {/* ─── GRID ARTIKEL LAINNYA ─── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {rest.map((item: any, idx: number) => {
          const imgUrl = getArticleImage(item);
          const cat = getArticleCategory(item);
          const excerpt = getArticleExcerpt(item);
          const dateStr = formatDateIndonesian(item.publishedAt || item.createdAt || new Date());

          return (
            <Link
              key={item.id || idx}
              href={href(`/artikel/${item.slug || item.id}`)}
              className="group bg-white rounded-3xl border border-[#EDE5DA] overflow-hidden hover:shadow-xl transition-all duration-300 flex flex-col"
            >
              {/* Gambar Artikel */}
              <div className="relative aspect-[16/10] w-full overflow-hidden bg-[#FAF7F2]">
                <img
                  src={imgUrl}
                  alt={item.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/images/showcase-artikel-pertanian.jpg';
                  }}
                />
                <div className="absolute top-3 left-3 px-3 py-1 rounded-full bg-white/95 text-[#D47A6A] text-[10px] font-black uppercase tracking-wider shadow-sm">
                  {cat}
                </div>
              </div>

              {/* Konten Card */}
              <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                <div>
                  <h3 className="font-serif font-bold text-lg text-[#332A26] group-hover:text-[#D47A6A] transition-colors line-clamp-2 leading-snug">
                    {item.title}
                  </h3>
                  <p className="mt-2 text-xs text-[#7A6B63] line-clamp-3 leading-relaxed">
                    {excerpt}
                  </p>
                </div>

                <div className="pt-3 border-t border-[#F3ECE1] flex items-center justify-between text-[11px] text-[#8C7D73] font-medium">
                  <span className="flex items-center gap-1.5">
                    <Calendar className="w-3 h-3 text-[#D47A6A]" />
                    {dateStr}
                  </span>
                  <span className="flex items-center gap-1 text-[#D47A6A] font-bold group-hover:translate-x-0.5 transition-transform">
                    Baca <ArrowRight className="w-3 h-3" />
                  </span>
                </div>
              </div>
            </Link>
          );
        })}
      </div>

    </div>
  );
}
