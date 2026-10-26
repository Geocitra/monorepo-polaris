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

interface EmeraldTechArtikelCatalogClientProps {
  articles: any[];
  member: any;
  theme?: any;
  subdomain?: string;
}

export function EmeraldTechArtikelCatalogClient({
  articles = [],
  member,
  theme,
  subdomain,
}: EmeraldTechArtikelCatalogClientProps) {
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
      <div className="bg-[#161616] rounded-xl border border-white/[0.08] p-5 sm:p-6 space-y-4">
        <div className="relative">
          <Search className="w-5 h-5 text-stone-500 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari topik kajian, regulasi, undang-undang, atau nama program..."
            className="w-full pl-12 pr-4 py-3.5 rounded-xs bg-[#111111] border border-white/[0.1] text-white placeholder:text-stone-500 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#00DF82] transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-[#00DF82] hover:underline"
            >
              Hapus
            </button>
          )}
        </div>

        {/* Categories Strip */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
          <Filter className="w-3.5 h-3.5 text-stone-400 shrink-0 ml-1" />
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-1.5 rounded-xs text-xs font-bold uppercase tracking-wider whitespace-nowrap transition-all shrink-0 ${
                selectedCategory === cat
                  ? 'bg-[#00DF82] text-black shadow-[0_0_15px_rgba(0,223,130,0.3)] font-black'
                  : 'bg-[#111111] text-stone-400 hover:text-white border border-white/[0.08]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* ─── ARTICLES LIST ─── */}
      {filteredArticles.length === 0 ? (
        <div className="p-16 text-center rounded-xl bg-[#161616] border border-dashed border-white/[0.1] space-y-4">
          <BookOpen className="w-12 h-12 text-stone-600 mx-auto" />
          <h3 className="font-bold text-lg text-white">Tidak ada artikel yang cocok</h3>
          <p className="text-xs text-stone-400 max-w-md mx-auto">
            Coba gunakan kata kunci pencarian yang lain atau pilih kategori &ldquo;Semua&rdquo; untuk melihat seluruh tulisan.
          </p>
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedCategory('Semua');
            }}
            className="px-6 py-2.5 rounded-xs bg-[#00DF82] text-black font-extrabold text-xs uppercase tracking-wider"
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

            const coverImg =
              article.featuredImageUrl ||
              article.posterUrl ||
              article.coverUrl ||
              article.imageUrl;

            return (
              <Link
                key={article.id || article.slug || idx}
                href={getNavLinkHref(`/artikel/${article.slug}`)}
                className="group block p-5 sm:p-6 rounded-xl bg-[#161616] border border-white/[0.08] hover:border-[#00DF82] hover:bg-white/[0.02] transition-all"
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-5 sm:gap-6">
                  
                  <div className="flex flex-col sm:flex-row items-start gap-4 sm:gap-5 flex-1">
                    {coverImg && (
                      <div className="w-full sm:w-40 sm:h-28 aspect-video sm:aspect-auto shrink-0 rounded-lg overflow-hidden bg-stone-900 border border-white/[0.08]">
                        <img
                          src={coverImg}
                          alt={article.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                    )}

                    <div className="space-y-2 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-black text-xs text-stone-600 group-hover:text-[#00DF82] transition-colors">
                          {numStr}
                        </span>
                        <span className="text-[10px] font-black uppercase tracking-wider text-[#00DF82]">
                          {categoryName}
                        </span>
                        <span className="text-[11px] text-stone-400 flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {formattedDate}
                        </span>
                        <span className="text-[11px] text-stone-400 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {article.readingTimeMinutes || 4} mnt baca
                        </span>
                      </div>

                      <h3 className="text-base sm:text-lg font-bold text-white group-hover:text-[#00DF82] transition-colors leading-snug">
                        {article.title}
                      </h3>

                      <p className="text-xs sm:text-sm text-stone-400 line-clamp-2 leading-relaxed max-w-3xl">
                        {article.excerpt || article.summary || 'Kajian analitis dan paparan komprehensif mengenai kebijakan publik dan dampaknya bagi kesejahteraan masyarakat.'}
                      </p>
                    </div>
                  </div>

                  <div className="shrink-0 self-end md:self-center">
                    <div className="w-10 h-10 rounded-full bg-black border border-white/[0.1] text-white flex items-center justify-center group-hover:bg-[#00DF82] group-hover:text-black group-hover:scale-110 transition-all">
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
