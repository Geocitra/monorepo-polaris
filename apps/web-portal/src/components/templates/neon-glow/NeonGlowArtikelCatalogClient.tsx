'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import {
  Search,
  Calendar,
  Clock,
  ArrowUpRight,
  Filter,
  Sparkles,
  Terminal,
  BookOpen,
} from 'lucide-react';
import { formatDateIndonesian } from '@/lib/utils';

interface NeonGlowArtikelCatalogClientProps {
  articles: any[];
  member: any;
  theme?: any;
  subdomain?: string;
}

export function NeonGlowArtikelCatalogClient({
  articles = [],
  member,
  theme,
  subdomain,
}: NeonGlowArtikelCatalogClientProps) {
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
      {/* ─── 1. CYBER SEARCH & CATEGORY BAR ─── */}
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          {/* Cyber Search Input */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-purple-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Cari naskah kebijakan, regulasi, kata kunci..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#0C1022]/90 border border-purple-900/40 rounded-xl pl-10 pr-4 py-3 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-purple-500/60 shadow-inner font-sans transition-colors"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-mono text-purple-400 hover:text-white"
              >
                [RESET]
              </button>
            )}
          </div>

          <div className="text-xs font-mono text-slate-400 self-end md:self-center">
            STATUS: <span className="text-cyan-400 font-bold">{filteredArticles.length}</span> NASKAH RESMI
          </div>
        </div>

        {/* Category Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none font-mono">
          <Filter className="w-3.5 h-3.5 text-purple-500 shrink-0 mr-1" />
          {categories.map((cat) => {
            const isSelected = selectedCategory === cat;
            return (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md shadow-purple-600/30 border border-purple-400/40'
                    : 'bg-slate-950/80 text-slate-400 hover:text-white border border-purple-900/40 hover:border-purple-500/50'
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>
      </div>

      {/* ─── 2. FEATURED ARTICLE CARD (CYBER HERO BANNER) ─── */}
      {featuredArticle && (
        <div className="rounded-3xl bg-[#0C1022]/90 border border-purple-900/40 overflow-hidden hover:border-purple-500/50 transition-all duration-300 shadow-2xl group">
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
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 filter contrast-[1.05]"
              />
              <div className="absolute top-4 left-4">
                <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-purple-600 text-white shadow-lg flex items-center gap-1.5 uppercase tracking-wider">
                  <Terminal className="w-3.5 h-3.5 text-cyan-300" />
                  Kajian Utama
                </span>
              </div>
            </div>

            {/* Content */}
            <div className="lg:col-span-5 p-6 sm:p-8 lg:p-10 flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                <div className="flex items-center gap-3 text-xs font-mono">
                  <span className="px-2.5 py-1 rounded-md bg-purple-500/10 text-purple-300 font-bold border border-purple-500/20 uppercase">
                    {featuredArticle.issueCategory || featuredArticle.category || 'KEBIJAKAN'}
                  </span>
                  <span className="flex items-center gap-1 text-slate-400">
                    <Calendar className="w-3.5 h-3.5 text-cyan-400" />
                    {featuredArticle.publishedAt
                      ? formatDateIndonesian(featuredArticle.publishedAt)
                      : featuredArticle.date || 'Terbaru'}
                  </span>
                </div>

                <h2 className="text-xl sm:text-2xl lg:text-3xl font-black text-white group-hover:text-purple-300 transition-colors leading-tight">
                  {featuredArticle.title}
                </h2>

                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed line-clamp-4 font-normal">
                  {featuredArticle.leadParagraph ||
                    featuredArticle.summary ||
                    featuredArticle.excerpt ||
                    'Telaah mendalam implikasi kebijakan nasional terhadap ketahanan ekonomi masyarakat di daerah pemilihan.'}
                </p>
              </div>

              <div className="pt-4 border-t border-purple-900/40 flex items-center justify-between">
                <span className="text-xs font-mono text-slate-400 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-cyan-400" /> {featuredArticle.readingTime || '4 min read'}
                </span>
                <Link
                  href={getArticleLink(featuredArticle.slug)}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs shadow-md shadow-purple-600/30 transition-all group-hover:translate-x-1"
                >
                  <span>Baca Analisis Lengkap</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─── 3. ARTICLES CYBER GRID ─── */}
      {gridArticles.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {gridArticles.map((art) => (
            <article
              key={art.id || art.slug}
              className="group rounded-2xl bg-[#0D1226]/80 border border-purple-900/40 hover:border-purple-500/50 p-5 flex flex-col justify-between transition-all duration-300 hover:-translate-y-1.5 hover:shadow-2xl hover:shadow-purple-950/40"
            >
              <div className="space-y-4">
                {/* Thumbnail */}
                <div className="relative rounded-xl overflow-hidden aspect-video bg-slate-900 border border-purple-900/30">
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

                <div className="flex items-center justify-between text-[11px] font-mono text-purple-300">
                  <span className="px-2 py-0.5 rounded-md bg-purple-500/10 border border-purple-500/20 font-bold uppercase">
                    {art.issueCategory || art.category || 'KEBIJAKAN'}
                  </span>
                  <span className="text-slate-400 flex items-center gap-1">
                    <Calendar className="w-3 h-3 text-cyan-400" />
                    {art.publishedAt
                      ? formatDateIndonesian(art.publishedAt)
                      : art.date || 'Terbaru'}
                  </span>
                </div>

                <h3 className="text-base font-bold text-white group-hover:text-purple-300 transition-colors line-clamp-2 leading-snug">
                  {art.title}
                </h3>

                <p className="text-xs text-slate-400 leading-relaxed line-clamp-3 font-normal">
                  {art.leadParagraph ||
                    art.summary ||
                    art.excerpt ||
                    'Baca telaah pemikiran kebijakan dan risalah lengkap pada halaman portal resmi.'}
                </p>
              </div>

              <div className="pt-4 mt-4 border-t border-purple-900/40 flex items-center justify-between text-xs font-semibold">
                <span className="text-slate-500 font-mono text-[11px] flex items-center gap-1">
                  <Clock className="w-3 h-3 text-cyan-400" /> {art.readingTime || '4 min read'}
                </span>
                <Link
                  href={getArticleLink(art.slug)}
                  className="text-purple-400 hover:text-purple-300 inline-flex items-center gap-1 font-bold group-hover:translate-x-1 transition-all"
                >
                  <span>Baca Naskah</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="text-center py-16 px-4 rounded-3xl border border-dashed border-purple-900/40 space-y-4 font-mono">
          <BookOpen className="w-12 h-12 text-purple-600 mx-auto" />
          <div className="space-y-1">
            <h4 className="text-base font-bold text-white">// 404_DATA_NOT_FOUND</h4>
            <p className="text-xs text-slate-400 max-w-sm mx-auto font-sans">
              Tidak ada artikel yang cocok dengan filter atau kata kunci pencarian Anda.
            </p>
          </div>
          <button
            type="button"
            onClick={() => {
              setSearchQuery('');
              setSelectedCategory('Semua');
            }}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-xs font-bold hover:opacity-95 transition-all cursor-pointer"
          >
            Bersihkan Filter
          </button>
        </div>
      )}
    </div>
  );
}
