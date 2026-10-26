'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import {
  Search,
  Calendar,
  Clock,
  ArrowRight,
  Filter,
  Sparkles,
  BookOpen,
} from 'lucide-react';
import { formatDateIndonesian } from '@/lib/utils';

interface CleanEditorialArtikelCatalogClientProps {
  articles: any[];
  member: any;
  theme?: any;
  subdomain?: string;
}

export function CleanEditorialArtikelCatalogClient({
  articles = [],
  member,
  theme,
  subdomain,
}: CleanEditorialArtikelCatalogClientProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('Semua');

  const pathname = usePathname();
  const searchParams = useSearchParams();
  const previewTemplate = searchParams?.get('preview_template');

  const getArticleLink = (slug: string) => {
    let base = `/artikel/${slug}`;
    if (subdomain && pathname?.startsWith(`/${subdomain}`)) {
      base = `/${subdomain}${base}`;
    }
    if (previewTemplate) {
      base += `${base.includes('?') ? '&' : '?'}preview_template=${previewTemplate}`;
    }
    return base;
  };

  // Derive categories dynamically from articles
  const categories = useMemo(() => {
    const set = new Set<string>();
    articles.forEach((art) => {
      const cat = art.issueCategory || art.category;
      if (cat) set.add(cat.toUpperCase());
    });
    return ['Semua', ...Array.from(set)];
  }, [articles]);

  // Filtered articles
  const filteredArticles = useMemo(() => {
    return articles.filter((art) => {
      const matchCat =
        selectedCategory === 'Semua' ||
        (art.issueCategory || art.category || '').toUpperCase() ===
          selectedCategory.toUpperCase();
      const matchSearch =
        searchQuery === '' ||
        art.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        art.excerpt?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        art.leadParagraph?.toLowerCase().includes(searchQuery.toLowerCase());
      return matchCat && matchSearch;
    });
  }, [articles, selectedCategory, searchQuery]);

  const featuredArticle = filteredArticles[0];
  const gridArticles = filteredArticles.slice(1);

  return (
    <div className="space-y-12 py-6 sm:py-10">
      {/* ─── 1. SEARCH & CATEGORY FILTER ─── */}
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          {/* Search Input */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Cari naskah kebijakan, regulasi, kata kunci..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-xl pl-10 pr-4 py-3 text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#6366F1] shadow-2xs font-sans transition-colors"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-mono text-slate-400 hover:text-slate-900"
              >
                [RESET]
              </button>
            )}
          </div>

          <div className="text-xs font-mono text-slate-500 self-end md:self-center font-bold">
            STATUS: <span className="text-[#6366F1] font-bold">{filteredArticles.length}</span> NASKAH RESMI
          </div>
        </div>

        {/* Category Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none font-mono">
          <Filter className="w-3.5 h-3.5 text-slate-400 shrink-0 mr-1" />
          {categories.map((cat) => {
            const isSelected = selectedCategory === cat;
            return (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-slate-950 text-white shadow-xs'
                    : 'bg-white text-slate-600 hover:text-slate-950 border border-slate-200 hover:border-slate-300'
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>
      </div>

      {/* ─── 2. FEATURED ARTICLE CARD (EDITORIAL HERO SPOTLIGHT) ─── */}
      {featuredArticle && (
        <div className="rounded-3xl bg-[#F8F9FD] border border-slate-200/90 overflow-hidden hover:border-purple-300 transition-all duration-300 shadow-xs group">
          <div className="grid grid-cols-1 lg:grid-cols-12">
            {/* Image */}
            <div className="lg:col-span-7 relative aspect-video lg:aspect-auto min-h-[260px] sm:min-h-[340px] bg-slate-900 overflow-hidden">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={
                  featuredArticle.featuredImageUrl ||
                  featuredArticle.posterUrl ||
                  featuredArticle.thumbnail ||
                  '/images/ref-article-1.jpg'
                }
                alt={featuredArticle.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 filter contrast-[1.02]"
              />
              <div className="absolute top-4 left-4">
                <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-slate-950/80 backdrop-blur-xs text-white shadow-sm flex items-center gap-1.5 uppercase tracking-wider">
                  <BookOpen className="w-3.5 h-3.5 text-[#6366F1]" />
                  KAJIAN UTAMA
                </span>
              </div>
            </div>

            {/* Content */}
            <div className="lg:col-span-5 p-6 sm:p-8 lg:p-10 flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                <div className="flex items-center gap-3 text-xs font-mono">
                  <span className="px-2.5 py-1 rounded-md bg-purple-50 text-[#6366F1] font-bold border border-purple-100 uppercase">
                    {featuredArticle.issueCategory || featuredArticle.category || 'KEBIJAKAN'}
                  </span>
                  <span className="flex items-center gap-1 text-slate-400">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    {featuredArticle.publishedAt
                      ? formatDateIndonesian(featuredArticle.publishedAt)
                      : featuredArticle.date || 'Terbaru'}
                  </span>
                </div>

                <h2 className="text-xl sm:text-2xl lg:text-3xl font-editorial-serif font-bold text-slate-900 group-hover:text-[#6366F1] transition-colors leading-tight">
                  {featuredArticle.title}
                </h2>

                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed line-clamp-4 font-normal">
                  {featuredArticle.leadParagraph ||
                    featuredArticle.summary ||
                    featuredArticle.excerpt ||
                    'Telaah mendalam implikasi kebijakan nasional terhadap ketahanan ekonomi masyarakat di daerah pemilihan.'}
                </p>
              </div>

              <div className="pt-4 border-t border-slate-200/80 flex items-center justify-between">
                <span className="text-xs font-mono text-slate-400 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-slate-400" /> {featuredArticle.readingTime || '4 min read'}
                </span>
                <Link
                  href={getArticleLink(featuredArticle.slug)}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-950 hover:bg-slate-800 text-white font-bold text-xs uppercase tracking-wider transition-all shadow-xs group-hover:translate-x-1"
                >
                  <span>BACA ARTIKEL</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─── 3. ARTICLES EDITORIAL GRID ─── */}
      {gridArticles.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {gridArticles.map((art) => (
            <article
              key={art.id || art.slug}
              className="group rounded-2xl bg-white border border-slate-200/90 hover:border-purple-300 p-5 flex flex-col justify-between transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl shadow-2xs"
            >
              <div className="space-y-4">
                {/* Thumbnail */}
                <div className="relative rounded-xl overflow-hidden aspect-video bg-slate-900 border border-slate-100">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={
                      art.featuredImageUrl ||
                      art.posterUrl ||
                      art.thumbnail ||
                      '/images/ref-article-2.jpg'
                    }
                    alt={art.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 filter contrast-[1.02]"
                  />
                </div>

                <div className="flex items-center justify-between text-[11px] font-mono text-slate-500">
                  <span className="px-2 py-0.5 rounded-md bg-purple-50 text-[#6366F1] border border-purple-100 font-bold uppercase">
                    {art.issueCategory || art.category || 'KEBIJAKAN'}
                  </span>
                  <span className="text-slate-400 flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {art.publishedAt
                      ? formatDateIndonesian(art.publishedAt)
                      : art.date || 'Terbaru'}
                  </span>
                </div>

                <h3 className="text-base font-editorial-serif font-bold text-slate-900 group-hover:text-[#6366F1] transition-colors leading-snug line-clamp-2">
                  {art.title}
                </h3>

                <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed font-normal">
                  {art.leadParagraph ||
                    art.summary ||
                    art.excerpt ||
                    'Baca telaah pemikiran kebijakan dan risalah lengkap pada halaman portal resmi dewan.'}
                </p>
              </div>

              <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between text-xs font-semibold">
                <span className="text-slate-400 font-mono text-[11px] flex items-center gap-1">
                  <Clock className="w-3 h-3" /> {art.readingTime || '4 min read'}
                </span>
                <Link
                  href={getArticleLink(art.slug)}
                  className="text-slate-900 group-hover:text-[#6366F1] inline-flex items-center gap-1 font-bold group-hover:translate-x-1 transition-all text-xs"
                >
                  <span>Baca Naskah</span>
                  <ArrowRight className="w-3.5 h-3.5 text-[#6366F1]" />
                </Link>
              </div>
            </article>
          ))}
        </div>
      ) : (
        filteredArticles.length === 0 && (
          <div className="text-center py-16 rounded-3xl border border-dashed border-slate-200 bg-[#F8F9FD] space-y-2">
            <p className="text-sm font-bold text-slate-700">Tidak ada naskah yang cocok dengan pencarian.</p>
            <p className="text-xs text-slate-500">Coba gunakan kata kunci lain atau pilih kategori &quot;Semua&quot;.</p>
          </div>
        )
      )}
    </div>
  );
}
