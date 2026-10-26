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
  BookOpen,
  Sparkles,
  ChevronRight,
} from 'lucide-react';
import { formatDateIndonesian } from '@/lib/utils';

interface DarkModernArtikelCatalogClientProps {
  articles: any[];
  member: any;
  theme?: any;
  subdomain?: string;
}

export function DarkModernArtikelCatalogClient({
  articles = [],
  member,
  theme,
  subdomain,
}: DarkModernArtikelCatalogClientProps) {
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
      const cat = (art.issueCategory || art.category || '').toUpperCase();
      const matchesCategory =
        selectedCategory === 'Semua' || cat === selectedCategory.toUpperCase();
      const matchesQuery =
        !searchQuery.trim() ||
        art.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        art.summary?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        art.leadParagraph?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        art.excerpt?.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesQuery;
    });
  }, [articles, selectedCategory, searchQuery]);

  const featuredArticle = useMemo(() => {
    if (selectedCategory !== 'Semua' || searchQuery.trim()) return null;
    return filteredArticles.find((a) => a.featured) || filteredArticles[0] || null;
  }, [filteredArticles, selectedCategory, searchQuery]);

  const gridArticles = useMemo(() => {
    if (featuredArticle && selectedCategory === 'Semua' && !searchQuery.trim()) {
      return filteredArticles.filter((a) => a.id !== featuredArticle.id);
    }
    return filteredArticles;
  }, [filteredArticles, featuredArticle, selectedCategory, searchQuery]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 space-y-12">
      {/* ─── 1. SEARCH & CATEGORY BAR ─── */}
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          {/* Search Input */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Cari judul artikel, topik regulasi, atau kata kunci..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#16171b] border border-white/5 rounded-xl pl-10 pr-4 py-3 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500/50 transition-colors"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-white"
              >
                Reset
              </button>
            )}
          </div>

          <div className="text-xs text-slate-400 font-medium self-end md:self-center">
            Menampilkan <span className="text-white font-bold">{filteredArticles.length}</span> artikel resmi
          </div>
        </div>

        {/* Category Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          <Filter className="w-3.5 h-3.5 text-slate-500 shrink-0 mr-1" />
          {categories.map((cat) => {
            const isSelected = selectedCategory === cat;
            return (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                    : 'bg-[#16171b] text-slate-400 hover:text-white border border-white/5 hover:border-slate-700'
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>
      </div>

      {/* ─── 2. FEATURED ARTICLE CARD (SHOW ONLY ON DEFAULT VIEW) ─── */}
      {featuredArticle && (
        <div className="rounded-3xl bg-[#16171b] border border-white/5 overflow-hidden hover:border-blue-500/30 transition-all duration-300 shadow-xl group">
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
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute top-4 left-4">
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-600 text-white shadow-lg flex items-center gap-1.5 uppercase tracking-wider">
                  <Sparkles className="w-3.5 h-3.5" />
                  Kajian Utama
                </span>
              </div>
            </div>

            {/* Content */}
            <div className="lg:col-span-5 p-6 sm:p-8 lg:p-10 flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                <div className="flex items-center gap-3 text-xs text-slate-400">
                  <span className="px-2.5 py-1 rounded-md bg-blue-500/10 text-blue-400 font-bold border border-blue-500/20 uppercase">
                    {featuredArticle.issueCategory || featuredArticle.category || 'KEBIJAKAN'}
                  </span>
                  <span className="flex items-center gap-1 text-slate-400">
                    <Calendar className="w-3.5 h-3.5" />
                    {featuredArticle.publishedAt
                      ? formatDateIndonesian(featuredArticle.publishedAt)
                      : featuredArticle.date || 'Terbaru'}
                  </span>
                </div>

                <h2 className="text-xl sm:text-2xl lg:text-3xl font-black text-white group-hover:text-blue-400 transition-colors leading-tight">
                  {featuredArticle.title}
                </h2>

                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed line-clamp-4">
                  {featuredArticle.leadParagraph ||
                    featuredArticle.summary ||
                    featuredArticle.excerpt ||
                    'Telaah mendalam implikasi kebijakan nasional terhadap ketahanan ekonomi masyarakat di daerah pemilihan.'}
                </p>
              </div>

              <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between">
                <span className="text-xs text-slate-500 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" /> {featuredArticle.readingTime || '4 mnt baca'}
                </span>
                <Link
                  href={getArticleLink(featuredArticle.slug)}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md transition-all group-hover:translate-x-1"
                >
                  <span>Baca Analisis Lengkap</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─── 3. ARTICLES GRID ─── */}
      {gridArticles.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {gridArticles.map((art) => (
            <article
              key={art.id || art.slug}
              className="group rounded-2xl bg-[#16171b] border border-white/5 hover:border-blue-500/30 p-5 flex flex-col justify-between transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-black/40"
            >
              <div className="space-y-4">
                {/* Thumbnail */}
                <div className="relative rounded-xl overflow-hidden aspect-video bg-slate-900 border border-white/5">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={
                      art.featuredImageUrl ||
                      art.posterUrl ||
                      art.thumbnail ||
                      '/images/ref-article-2.jpg'
                    }
                    alt={art.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>

                <div className="flex items-center gap-2 text-[11px] text-slate-400 font-medium">
                  <span className="px-2 py-0.5 rounded-md bg-blue-500/10 text-blue-400 font-bold border border-blue-500/20 uppercase">
                    {art.issueCategory || art.category || 'KEBIJAKAN'}
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {art.publishedAt
                      ? formatDateIndonesian(art.publishedAt)
                      : art.date || 'Terbaru'}
                  </span>
                </div>

                <h3 className="text-base font-bold text-white group-hover:text-blue-400 transition-colors line-clamp-2 leading-snug">
                  {art.title}
                </h3>

                <p className="text-xs text-slate-400 leading-relaxed line-clamp-3">
                  {art.leadParagraph ||
                    art.summary ||
                    art.excerpt ||
                    'Baca telaah pemikiran kebijakan dan risalah lengkap pada halaman portal resmi.'}
                </p>
              </div>

              <div className="pt-4 mt-4 border-t border-slate-800/60 flex items-center justify-between text-xs font-semibold">
                <span className="text-slate-500 flex items-center gap-1">
                  <Clock className="w-3 h-3" /> {art.readingTime || '4 mnt baca'}
                </span>
                <Link
                  href={getArticleLink(art.slug)}
                  className="text-blue-400 hover:text-blue-300 inline-flex items-center gap-1 font-bold group-hover:translate-x-1 transition-all"
                >
                  <span>Baca Naskah</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="text-center py-16 px-4 rounded-3xl border border-dashed border-slate-800 space-y-4">
          <BookOpen className="w-12 h-12 text-slate-600 mx-auto" />
          <div className="space-y-1">
            <h4 className="text-base font-bold text-white">Tidak Ada Artikel Ditemukan</h4>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Tidak ada artikel yang cocok dengan filter atau kata kunci pencarian Anda.
            </p>
          </div>
          <button
            type="button"
            onClick={() => {
              setSearchQuery('');
              setSelectedCategory('Semua');
            }}
            className="px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-bold hover:bg-blue-500 transition-colors"
          >
            Bersihkan Pencarian & Filter
          </button>
        </div>
      )}
    </div>
  );
}
