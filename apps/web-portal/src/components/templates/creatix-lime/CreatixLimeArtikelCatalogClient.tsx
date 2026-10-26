'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { Search, ArrowUpRight, FileText, Calendar, Clock } from 'lucide-react';
import { formatDateIndonesian } from '@/lib/utils';
import { LimeSparkle } from './CreatixLimeShell';

interface CreatixLimeArtikelCatalogClientProps {
  articles: any[];
  member: any;
  theme?: any;
  subdomain?: string;
}

export function CreatixLimeArtikelCatalogClient({
  articles = [],
  member,
  theme,
  subdomain,
}: CreatixLimeArtikelCatalogClientProps) {
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 space-y-12">
      
      {/* ──────────────────────────────────────────────────────────────────────────
          FILTER & SEARCH BAR
          ────────────────────────────────────────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 pb-6 border-b border-white/10">
        
        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-all whitespace-nowrap cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-[#84CC16] text-slate-950 font-black shadow-lg shadow-[#84CC16]/20'
                  : 'bg-[#0E150E] text-slate-400 hover:text-white border border-white/10'
              }`}
            >
              {cat === 'all' ? 'Semua Risalah' : cat}
            </button>
          ))}
        </div>

        {/* Search Input Box */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Cari risalah kebijakan..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-[#0D120D] border border-white/10 rounded-full text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-[#84CC16] transition-colors"
          />
        </div>

      </div>

      {/* ──────────────────────────────────────────────────────────────────────────
          ARTICLES GRID
          ────────────────────────────────────────────────────────────────────────── */}
      {filteredArticles.length === 0 ? (
        <div className="p-12 text-center rounded-3xl bg-[#0D120D] border border-white/10 text-slate-400 max-w-xl mx-auto space-y-3">
          <FileText className="w-10 h-10 text-[#84CC16]/60 mx-auto" />
          <h4 className="text-base font-bold text-white">
            Tidak Ada Risalah Ditemukan
          </h4>
          <p className="text-xs text-slate-400">
            Tidak ada dokumen artikel yang sesuai dengan kata kunci &ldquo;{searchQuery}&rdquo;.
          </p>
          <button
            type="button"
            onClick={() => {
              setSearchQuery('');
              setSelectedCategory('all');
            }}
            className="text-xs font-bold uppercase tracking-wider text-[#84CC16] underline cursor-pointer pt-2"
          >
            Reset Filter Pencarian
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
                className="group flex flex-col justify-between rounded-3xl overflow-hidden bg-[#0D120D] border border-white/10 hover:border-[#84CC16]/60 transition-all shadow-xl hover:shadow-2xl hover:shadow-[#84CC16]/5 p-4 sm:p-5"
              >
                <div>
                  {/* Article Thumbnail */}
                  <div className="aspect-[16/10] w-full rounded-2xl overflow-hidden bg-slate-900 relative mb-4">
                    <img
                      src={coverImg}
                      alt={art.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = '/images/showcase-artikel-pertanian.jpg';
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0D120D] via-transparent to-transparent opacity-60" />

                    {/* Lime Accent Badge */}
                    <div className="absolute bottom-3 left-3 z-10 flex items-center bg-[#84CC16] text-slate-950 font-black text-[10px] uppercase px-2.5 py-1 rounded-md shadow-md">
                      <span>{art.category || art.issueCategory || 'Kebijakan'}</span>
                      <div className="ml-1.5 pl-1.5 border-l border-black/20 flex items-center gap-0.5">
                        <div className="w-0.5 h-2.5 bg-black/60 rounded-full" />
                        <div className="w-0.5 h-2.5 bg-black/60 rounded-full" />
                      </div>
                    </div>
                  </div>

                  {/* Date & Reading Time */}
                  <div className="flex items-center gap-3 text-xs text-slate-400 mb-2.5">
                    <span className="flex items-center gap-1 text-[11px]">
                      <Calendar className="w-3 h-3 text-[#84CC16]" />
                      <span>{formatDateIndonesian(art.publishedAt || art.createdAt)}</span>
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1 text-[11px]">
                      <Clock className="w-3 h-3 text-slate-500" />
                      <span>{art.readingTime || '4 mnt baca'}</span>
                    </span>
                  </div>

                  {/* Title */}
                  <h3 className="text-lg font-black text-white group-hover:text-[#84CC16] transition-colors line-clamp-2 leading-snug mb-2">
                    {art.title}
                  </h3>

                  {/* Excerpt */}
                  <p className="text-xs text-slate-400 line-clamp-3 leading-relaxed">
                    {art.summary || art.excerpt || 'Kajian kebijakan publik strategis dan advokasi peraturan perundang-undangan.'}
                  </p>
                </div>

                {/* Footer Action */}
                <div className="mt-5 pt-3.5 border-t border-white/5 flex items-center justify-between text-xs font-bold text-white group-hover:text-[#84CC16] transition-colors">
                  <span className="uppercase tracking-wider text-[11px]">Baca Selengkapnya</span>
                  <ArrowUpRight className="w-4 h-4 text-[#84CC16] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                </div>
              </Link>
            );
          })}
        </div>
      )}

    </div>
  );
}
