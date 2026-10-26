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
  BookOpen,
} from 'lucide-react';
import { formatDateIndonesian } from '@/lib/utils';

interface MidnightGoldArtikelCatalogClientProps {
  articles: any[];
  member: any;
  theme?: any;
  subdomain?: string;
}

export function MidnightGoldArtikelCatalogClient({
  articles = [],
  member,
  theme,
  subdomain,
}: MidnightGoldArtikelCatalogClientProps) {
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
      const titleMatch = art.title?.toLowerCase().includes(searchQuery.toLowerCase());
      const excerptMatch = (art.excerpt || art.summary || '')
        .toLowerCase()
        .includes(searchQuery.toLowerCase());
      const matchesSearch = titleMatch || excerptMatch;

      const cat = art.issueCategory || art.category || 'Umum';
      const matchesCategory = selectedCategory === 'Semua' || cat === selectedCategory;

      return matchesSearch && matchesCategory;
    });
  }, [articles, searchQuery, selectedCategory]);

  return (
    <div className="space-y-10">
      
      {/* ─── SEARCH & FILTER CONTROLS ─── */}
      <div className="bg-[#0a0a0a] rounded-2xl border border-white/[0.08] p-5 sm:p-6 space-y-4">
        <div className="relative">
          <Search className="w-5 h-5 text-[#999999] absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari topik kajian, regulasi, undang-undang, atau nama program..."
            className="w-full pl-12 pr-4 py-3.5 rounded-full bg-black border border-white/[0.1] text-white placeholder:text-white/40 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#FFBD39] transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-[#FFBD39] hover:underline"
            >
              Hapus
            </button>
          )}
        </div>

        {/* Categories Strip */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
          <Filter className="w-3.5 h-3.5 text-white/50 shrink-0 ml-1" />
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all shrink-0 ${
                selectedCategory === cat
                  ? 'bg-[#FFBD39] text-black shadow-[0_0_15px_rgba(255,189,57,0.3)] font-black'
                  : 'bg-black text-white/70 hover:text-white border border-white/[0.1]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* ─── ARTICLES LIST ─── */}
      {filteredArticles.length === 0 ? (
        <div className="p-16 text-center rounded-2xl bg-[#0a0a0a] border border-dashed border-white/[0.1] space-y-4">
          <BookOpen className="w-12 h-12 text-white/20 mx-auto" />
          <h3 className="font-bold text-lg text-white">Tidak ada artikel yang cocok</h3>
          <p className="text-xs text-[#999999] max-w-md mx-auto">
            Coba gunakan kata kunci pencarian yang lain atau pilih kategori &ldquo;Semua&rdquo; untuk melihat seluruh tulisan.
          </p>
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedCategory('Semua');
            }}
            className="px-6 py-2.5 rounded-full bg-[#FFBD39] text-black font-black text-xs uppercase tracking-wider"
          >
            Reset Pencarian
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredArticles.map((article, idx) => {
            const formattedDate = article.publishedAt
              ? formatDateIndonesian(article.publishedAt)
              : 'Terbaru';
            const numStr = String(idx + 1).padStart(2, '0') + '.';
            const categoryName = article.issueCategory || article.category || 'Kebijakan Publik';
            const artImage =
              article.featuredImageUrl ||
              article.coverUrl ||
              article.imageUrl ||
              article.posterUrl ||
              article.coverImageUrl ||
              article.thumbnailUrl ||
              '/images/showcase-artikel-pertanian.jpg';

            return (
              <Link
                key={article.id || article.slug || idx}
                href={getNavLinkHref(`/artikel/${article.slug}`)}
                className="group block p-5 sm:p-6 rounded-2xl bg-[#0a0a0a] border border-white/[0.08] hover:border-[#FFBD39] hover:bg-white/[0.02] transition-all"
              >
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                  
                  {/* Article Thumbnail Image */}
                  <div className="relative w-full md:w-52 lg:w-60 aspect-video rounded-xl overflow-hidden bg-black border border-white/[0.1] shrink-0">
                    <img
                      src={artImage}
                      alt={article.title}
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).src = '/images/showcase-artikel-pertanian.jpg';
                      }}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-90 group-hover:opacity-100"
                    />
                    <div className="absolute top-2.5 left-2.5">
                      <span className="px-2.5 py-0.5 rounded-full bg-black/85 backdrop-blur-sm text-[10px] font-black uppercase tracking-wider text-[#FFBD39] border border-white/[0.1]">
                        {categoryName}
                      </span>
                    </div>
                  </div>

                  {/* Information */}
                  <div className="flex items-start gap-4 flex-1">
                    <span className="hidden sm:inline font-black text-xl text-white/20 group-hover:text-[#FFBD39] transition-colors pt-0.5">
                      {numStr}
                    </span>

                    <div className="space-y-2 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-[11px] text-[#999999] flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-[#FFBD39]" />
                          {formattedDate}
                        </span>
                        <span className="text-white/20">•</span>
                        <span className="text-[11px] text-[#999999] flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {article.readingTimeMinutes || 4} mnt baca
                        </span>
                      </div>

                      <h3 className="text-base sm:text-lg font-bold text-white group-hover:text-[#FFBD39] transition-colors leading-snug">
                        {article.title}
                      </h3>

                      <p className="text-xs sm:text-sm text-[#999999] line-clamp-2 leading-relaxed max-w-2xl">
                        {article.excerpt || article.summary || 'Kajian analitis dan paparan komprehensif mengenai kebijakan publik dan dampaknya bagi kesejahteraan masyarakat.'}
                      </p>
                    </div>
                  </div>

                  <div className="shrink-0 self-end md:self-center">
                    <div className="w-10 h-10 rounded-full bg-black border border-white/[0.1] text-white flex items-center justify-center group-hover:bg-[#FFBD39] group-hover:text-black group-hover:scale-110 transition-all">
                      <ArrowUpRight className="w-4 h-4" />
                    </div>
                  </div>

                </div>
              </Link>
            );
          })}
        </div>
      )}

    </div>
  );
}
