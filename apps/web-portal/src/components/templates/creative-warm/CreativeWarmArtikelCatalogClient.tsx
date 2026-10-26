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

interface CreativeWarmArtikelCatalogClientProps {
  articles: any[];
  member: any;
  theme?: any;
  subdomain?: string;
}

export function CreativeWarmArtikelCatalogClient({
  articles = [],
  member,
  theme,
  subdomain,
}: CreativeWarmArtikelCatalogClientProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('Semua');

  const pathname = usePathname();
  const searchParams = useSearchParams();
  const previewTemplate = searchParams?.get('preview_template');

  const getNavLinkHref = (path: string) => {
    let base = path;
    if (subdomain && pathname?.startsWith(`/${subdomain}`)) {
      base = path === '/' ? `/${subdomain}` : `/${subdomain}${path}`;
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
      if (cat) set.add(cat);
    });
    return ['Semua', ...Array.from(set)];
  }, [articles]);

  // Filtered articles
  const filteredArticles = useMemo(() => {
    return articles.filter((art) => {
      const matchesCategory =
        selectedCategory === 'Semua' ||
        (art.issueCategory && art.issueCategory.toLowerCase() === selectedCategory.toLowerCase()) ||
        (art.category && art.category.toLowerCase() === selectedCategory.toLowerCase());

      const matchesSearch =
        !searchQuery.trim() ||
        art.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        art.excerpt?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        art.summary?.toLowerCase().includes(searchQuery.toLowerCase());

      return matchesCategory && matchesSearch;
    });
  }, [articles, selectedCategory, searchQuery]);

  // Featured article is the first one or one with featured: true
  const featuredArticle = useMemo(() => {
    if (filteredArticles.length === 0) return null;
    return filteredArticles.find((a) => a.featured) || filteredArticles[0];
  }, [filteredArticles]);

  const gridArticles = useMemo(() => {
    if (!featuredArticle) return filteredArticles;
    return filteredArticles.filter((a) => a.id !== featuredArticle.id);
  }, [filteredArticles, featuredArticle]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 space-y-12">
      
      {/* ─── 1. SEARCH & CATEGORIES CONTROLS ─── */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 p-4 sm:p-5 rounded-2xl bg-white border border-stone-200/90 shadow-sm">
        
        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-none">
          <Filter className="w-4 h-4 text-stone-400 shrink-0 ml-1" />
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-amber-500 text-stone-950 font-bold shadow-xs'
                  : 'bg-stone-100 text-stone-600 hover:text-stone-900 hover:bg-stone-200/60'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative min-w-[240px] sm:min-w-[280px]">
          <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari risalah atau topik..."
            className="w-full pl-9 pr-4 py-2 text-xs sm:text-sm rounded-xl border border-stone-200 bg-stone-50/70 focus:bg-white focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 text-stone-900 placeholder:text-stone-400 transition-all"
          />
        </div>
      </div>

      {/* ─── 2. FEATURED SPOTLIGHT ARTICLE BANNER ─── */}
      {featuredArticle && (
        <div className="rounded-3xl bg-[#1A382B] text-white overflow-hidden shadow-xl border border-stone-800">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-center p-6 sm:p-8 lg:p-10">
            
            {/* Image */}
            <div className="lg:col-span-6">
              <div className="relative aspect-[16/10] rounded-2xl overflow-hidden bg-stone-900 border border-white/10 shadow-lg group">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={
                    featuredArticle.featuredImageUrl ||
                    featuredArticle.thumbnail ||
                    featuredArticle.posterUrl ||
                    '/images/default-article.jpg'
                  }
                  alt={featuredArticle.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-3 left-3">
                  <span className="px-3 py-1 rounded-md bg-amber-500 text-stone-950 font-mono text-[10px] font-bold uppercase tracking-wider shadow-md">
                    [ KAJIAN UTAMA ]
                  </span>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="lg:col-span-6 space-y-4 text-left">
              <div className="flex items-center gap-3 text-xs text-amber-300 font-mono font-bold">
                <span className="px-2.5 py-0.5 rounded bg-white/10 border border-white/20 uppercase">
                  {featuredArticle.issueCategory || featuredArticle.category || 'KEBIJAKAN'}
                </span>
                <span>•</span>
                <span className="flex items-center gap-1 text-stone-300 font-normal font-sans">
                  <Calendar className="w-3.5 h-3.5" />
                  {featuredArticle.publishedAt
                    ? formatDateIndonesian(featuredArticle.publishedAt)
                    : featuredArticle.date || 'Terbaru'}
                </span>
              </div>

              <h2 className="text-2xl sm:text-3xl font-serif font-black text-white leading-snug">
                {featuredArticle.title}
              </h2>

              <p className="text-xs sm:text-sm text-stone-300 leading-relaxed font-normal line-clamp-3">
                {featuredArticle.excerpt ||
                  featuredArticle.summary ||
                  'Telaah mendalam mengenai perumusan regulasi dan keberpihakan parlemen dalam memperjuangkan hak-hak warga daerah pemilihan.'}
              </p>

              <div className="pt-2 flex items-center justify-between">
                <Link
                  href={getNavLinkHref(`/artikel/${featuredArticle.slug}`)}
                  className="px-6 py-3 rounded-full bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs uppercase tracking-wider transition-all shadow-md shadow-amber-500/20 inline-flex items-center gap-2 group"
                >
                  <span>BACA KAJIAN LENGKAP</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </Link>

                <span className="text-xs text-stone-400 font-mono flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  {featuredArticle.readingTime || '4 mnt baca'}
                </span>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* ─── 3. ARTICLES 3-COLUMN GRID ─── */}
      <div className="space-y-6">
        <div className="flex items-center justify-between border-b border-stone-200 pb-4">
          <h3 className="text-xl sm:text-2xl font-serif font-bold text-stone-900">
            Daftar Publikasi &amp; Risalah ({filteredArticles.length})
          </h3>
          <span className="text-xs font-mono text-stone-500">
            Arsip Kebijakan Resmi
          </span>
        </div>

        {gridArticles.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {gridArticles.map((art) => (
              <div
                key={art.id}
                className="group rounded-2xl bg-white border border-stone-200/90 hover:border-amber-500/80 p-5 flex flex-col justify-between transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl hover:shadow-stone-200/60"
              >
                <div className="space-y-4">
                  {/* Aspect video thumbnail */}
                  <div className="relative aspect-video rounded-xl overflow-hidden bg-stone-100 border border-stone-100">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={
                        art.featuredImageUrl ||
                        art.thumbnail ||
                        art.posterUrl ||
                        '/images/default-article.jpg'
                      }
                      alt={art.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>

                  {/* Metadata */}
                  <div className="flex items-center justify-between text-[11px] text-stone-500 font-medium">
                    <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 font-bold">
                      {art.issueCategory || art.category || 'KEBIJAKAN'}
                    </span>
                    <span className="flex items-center gap-1 font-mono text-[10.5px]">
                      <Calendar className="w-3 h-3 text-stone-400" />
                      {art.publishedAt
                        ? formatDateIndonesian(art.publishedAt)
                        : art.date || 'Terbaru'}
                    </span>
                  </div>

                  {/* Title */}
                  <h4 className="text-base font-serif font-bold text-stone-900 group-hover:text-amber-700 transition-colors leading-snug line-clamp-2">
                    {art.title}
                  </h4>

                  {/* Excerpt */}
                  <p className="text-xs text-stone-600 line-clamp-3 leading-relaxed font-normal">
                    {art.leadParagraph ||
                      art.excerpt ||
                      art.summary ||
                      'Pelajari sikap dan pandangan resmi dewan dalam mengawal aspirasi daerah pemilihan.'}
                  </p>
                </div>

                {/* Footer Link */}
                <div className="pt-4 mt-4 border-t border-stone-100 flex items-center justify-between text-xs font-bold">
                  <span className="text-stone-400 flex items-center gap-1 font-mono text-[11px]">
                    <Clock className="w-3 h-3" />
                    {art.readingTime || '3 mnt baca'}
                  </span>
                  <Link
                    href={getNavLinkHref(`/artikel/${art.slug}`)}
                    className="text-amber-700 hover:text-amber-800 inline-flex items-center gap-1 group-hover:translate-x-1 transition-all"
                  >
                    <span>Pelajari Naskah</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-white border border-dashed border-stone-300 rounded-2xl space-y-3">
            <BookOpen className="w-10 h-10 text-stone-300 mx-auto" />
            <div className="text-stone-700 font-serif font-bold text-base">
              Tidak Ada Artikel yang Cocok
            </div>
            <p className="text-xs text-stone-400 max-w-sm mx-auto">
              Silakan gunakan kata kunci pencarian lain atau pilih kategori &quot;Semua&quot; untuk menampilkan seluruh publikasi.
            </p>
          </div>
        )}
      </div>

    </div>
  );
}
