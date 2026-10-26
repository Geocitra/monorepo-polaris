'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { Search, ArrowUpRight, FileText, Calendar, Clock, Tag } from 'lucide-react';
import { formatDateIndonesian } from '@/lib/utils';

interface StudioEditorialArtikelCatalogClientProps {
  articles: any[];
  member: any;
  theme?: any;
  subdomain?: string;
}

export function StudioEditorialArtikelCatalogClient({
  articles = [],
  member,
  theme,
  subdomain,
}: StudioEditorialArtikelCatalogClientProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

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

  const getArticleImage = (art: any): string => {
    return (
      art?.featuredImageUrl ||
      art?.coverUrl ||
      art?.imageUrl ||
      art?.posterUrl ||
      art?.coverImageUrl ||
      art?.thumbnailUrl ||
      '/images/showcase-artikel-pertanian.jpg'
    );
  };

  // Derive categories
  const categories = useMemo(() => {
    const set = new Set<string>();
    articles.forEach((art) => {
      if (art.category) set.add(art.category);
      if (art.issueCategory) set.add(art.issueCategory);
    });
    return ['all', ...Array.from(set)];
  }, [articles]);

  const filteredArticles = useMemo(() => {
    return articles.filter((art) => {
      const titleMatch = art.title?.toLowerCase().includes(searchQuery.toLowerCase());
      const summaryMatch = (art.summary || art.excerpt || '')
        .toLowerCase()
        .includes(searchQuery.toLowerCase());
      const cat = art.category || art.issueCategory || '';
      const categoryMatch =
        selectedCategory === 'all' || cat.toLowerCase() === selectedCategory.toLowerCase();

      return (titleMatch || summaryMatch) && categoryMatch;
    });
  }, [articles, searchQuery, selectedCategory]);

  return (
    <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-16 py-12 sm:py-16 space-y-12">
      
      {/* ──────────────────────────────────────────────────────────────────────────
          FILTER & SEARCH TOOLBAR
          ────────────────────────────────────────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 pb-6 border-b border-stone-300">
        
        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-all whitespace-nowrap cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-stone-950 text-white shadow-xs'
                  : 'bg-white text-stone-700 border border-stone-300 hover:border-stone-950'
              }`}
            >
              {cat === 'all' ? 'Semua Risalah' : cat}
            </button>
          ))}
        </div>

        {/* Search Input Box */}
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Cari risalah kebijakan..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-white border border-stone-300 rounded-full text-xs text-stone-900 placeholder:text-stone-400 focus:outline-none focus:border-stone-950 transition-colors shadow-2xs"
          />
        </div>

      </div>

      {/* ──────────────────────────────────────────────────────────────────────────
          ARTICLES GRID (STUDIO EDITORIAL SHOWCASE 3-COLUMN)
          ────────────────────────────────────────────────────────────────────────── */}
      {filteredArticles.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-white border border-stone-300 text-stone-600 max-w-xl mx-auto space-y-3">
          <FileText className="w-10 h-10 text-stone-400 mx-auto" />
          <h4 className="font-serif text-base font-bold text-stone-900">
            Tidak Ada Risalah Ditemukan
          </h4>
          <p className="text-xs text-stone-500">
            Tidak ada publikasi artikel yang cocok dengan kriteria pencarian &ldquo;{searchQuery}&rdquo;.
          </p>
          <button
            type="button"
            onClick={() => {
              setSearchQuery('');
              setSelectedCategory('all');
            }}
            className="text-xs font-bold uppercase tracking-wider text-stone-950 underline cursor-pointer pt-2"
          >
            Reset Filter
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredArticles.map((art, idx) => {
            const coverImg = getArticleImage(art);
            return (
              <Link
                key={art.id || idx}
                href={getNavLinkHref(`/artikel/${art.slug}`)}
                className="group flex flex-col justify-between rounded-2xl overflow-hidden bg-white hover:bg-[#F9F8F5] border border-stone-300 hover:border-stone-500 transition-all shadow-2xs hover:shadow-lg p-4 sm:p-5"
              >
                <div>
                  {/* Article Thumbnail */}
                  <div className="aspect-[16/10] w-full rounded-xl overflow-hidden bg-stone-200 relative mb-4">
                    <img
                      src={coverImg}
                      alt={art.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = '/images/showcase-artikel-pertanian.jpg';
                      }}
                    />
                    <div className="absolute top-3 left-3">
                      <span className="px-2.5 py-1 rounded-md bg-stone-950/80 backdrop-blur-md text-[10px] font-bold text-white uppercase tracking-wider">
                        {art.category || art.issueCategory || 'Kebijakan'}
                      </span>
                    </div>
                  </div>

                  {/* Metadata Date & Reading Time */}
                  <div className="flex items-center gap-3 text-[11px] font-semibold text-stone-500 mb-2">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-stone-400" />
                      <span>{formatDateIndonesian(art.publishedAt || art.createdAt)}</span>
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3 text-stone-400" />
                      <span>{art.readingTime || '4 mnt baca'}</span>
                    </span>
                  </div>

                  {/* Title */}
                  <h3 className="font-serif text-lg sm:text-xl font-bold text-stone-950 group-hover:text-stone-700 transition-colors line-clamp-2 leading-snug mb-2">
                    {art.title}
                  </h3>

                  {/* Summary */}
                  <p className="text-xs text-stone-600 line-clamp-3 leading-relaxed font-sans">
                    {art.summary || art.excerpt || 'Telaah dan analisis komprehensif terkait regulasi dan aspirasi masyarakat.'}
                  </p>
                </div>

                {/* Footer Action */}
                <div className="mt-5 pt-3 border-t border-stone-200 flex items-center justify-between text-xs font-bold text-stone-950 group-hover:text-stone-600">
                  <span className="uppercase tracking-wider text-[11px]">Baca Selengkapnya</span>
                  <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                </div>
              </Link>
            );
          })}
        </div>
      )}

    </div>
  );
}
