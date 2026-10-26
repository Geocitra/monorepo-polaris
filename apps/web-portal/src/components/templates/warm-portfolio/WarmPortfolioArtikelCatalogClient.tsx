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
  BookOpen,
} from 'lucide-react';
import { formatDateIndonesian } from '@/lib/utils';

interface WarmPortfolioArtikelCatalogClientProps {
  articles: any[];
  member: any;
  theme?: any;
  subdomain?: string;
}

export function WarmPortfolioArtikelCatalogClient({
  articles = [],
  member,
  theme,
  subdomain,
}: WarmPortfolioArtikelCatalogClientProps) {
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
    <div className="space-y-8">
      
      {/* ─── SEARCH & FILTER CONTROLS ─── */}
      <div className="bg-white rounded-3xl border border-stone-200/90 p-4 sm:p-6 shadow-sm space-y-4">
        <div className="relative">
          <Search className="w-5 h-5 text-stone-400 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari topik kajian, regulasi, undang-undang, atau nama program..."
            className="w-full pl-12 pr-4 py-3 rounded-full bg-[#FAF7F2] border border-stone-200 text-stone-900 placeholder:text-stone-400 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#F59E0B] focus:bg-white transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-stone-400 hover:text-stone-700"
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
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all shrink-0 ${
                selectedCategory === cat
                  ? 'bg-[#181311] text-white shadow-sm'
                  : 'bg-[#FAF7F2] text-stone-600 hover:bg-stone-200/60 border border-stone-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* ─── ARTICLES LIST WITH CHAMFERED CORNER CARDS ─── */}
      {filteredArticles.length === 0 ? (
        <div className="p-12 text-center rounded-3xl bg-white border border-dashed border-stone-300 space-y-3">
          <BookOpen className="w-10 h-10 text-stone-300 mx-auto" />
          <h3 className="font-serif font-bold text-lg text-stone-700">Tidak ada artikel yang cocok</h3>
          <p className="text-xs text-stone-500 max-w-md mx-auto">
            Coba gunakan kata kunci pencarian yang lain atau pilih kategori &ldquo;Semua&rdquo; untuk melihat seluruh tulisan.
          </p>
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedCategory('Semua');
            }}
            className="px-4 py-2 rounded-full bg-[#181311] text-white font-bold text-xs"
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

            return (
              <Link
                key={article.id || article.slug || idx}
                href={getNavLinkHref(`/artikel/${article.slug}`)}
                className="group block p-6 sm:p-8 rounded-3xl bg-white border border-stone-200/90 shadow-sm hover:border-[#F59E0B] hover:shadow-md transition-all relative overflow-hidden"
                style={{
                  clipPath: 'polygon(20px 0%, 100% 0%, 100% 100%, 0% 100%, 0% 20px)',
                }}
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                  
                  {/* Left: Number + Title & Info */}
                  <div className="flex items-start gap-4 sm:gap-6 flex-1">
                    <span className="font-serif font-black text-xl sm:text-2xl text-stone-300 group-hover:text-[#F59E0B] transition-colors pt-0.5">
                      {numStr}
                    </span>

                    <div className="space-y-2 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="px-3 py-1 rounded-full bg-amber-50 text-amber-900 text-[11px] font-bold border border-amber-200/70">
                          {categoryName}
                        </span>
                        <span className="text-[11px] text-stone-400 flex items-center gap-1 font-medium">
                          <Calendar className="w-3 h-3" />
                          {formattedDate}
                        </span>
                        <span className="text-[11px] text-stone-400 flex items-center gap-1 font-medium">
                          <Clock className="w-3 h-3" />
                          {article.readingTimeMinutes || 4} mnt baca
                        </span>
                      </div>

                      <h3 className="text-lg sm:text-xl font-serif font-bold text-stone-900 group-hover:text-[#F59E0B] transition-colors leading-snug">
                        {article.title}
                      </h3>

                      <p className="text-xs sm:text-sm text-stone-600 line-clamp-2 leading-relaxed max-w-3xl">
                        {article.excerpt || article.summary || 'Kajian analitis dan paparan komprehensif mengenai kebijakan publik dan dampaknya bagi kesejahteraan masyarakat.'}
                      </p>
                    </div>
                  </div>

                  {/* Right: Circular Arrow Icon Button */}
                  <div className="shrink-0 self-end md:self-center">
                    <div className="w-10 h-10 rounded-full bg-[#FAF7F2] border border-stone-200 text-stone-700 flex items-center justify-center group-hover:bg-[#F59E0B] group-hover:text-stone-950 group-hover:scale-110 transition-all">
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
