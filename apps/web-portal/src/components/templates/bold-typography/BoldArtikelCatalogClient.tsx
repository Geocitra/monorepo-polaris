'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import {
  Search,
  ArrowRight,
  ArrowUpRight,
  Calendar,
  Clock,
  Filter,
  X,
  FileText,
  Sparkles,
} from 'lucide-react';
import { formatDateIndonesian } from '@/lib/utils';

interface ArticleItem {
  id: string;
  title: string;
  slug: string;
  category: string;
  date: string;
  summary: string;
  thumbnail: string;
  readingTime?: string;
  featured?: boolean;
}

interface BoldArtikelCatalogClientProps {
  initialArticles: any[];
  defaultArticles: ArticleItem[];
  officialFullName: string;
  subdomain?: string;
}

const CATEGORIES = [
  'Semua Topik',
  'Ekonomi',
  'Infrastruktur',
  'Pendidikan',
  'Kesehatan',
  'Pertanian',
  'Hukum & Regulasi',
];

export function BoldArtikelCatalogClient({
  initialArticles = [],
  defaultArticles = [],
  officialFullName,
  subdomain,
}: BoldArtikelCatalogClientProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Semua Topik');

  const searchParams = useSearchParams();
  const previewTemplate = searchParams?.get('preview_template');

  const getArticleHref = (slug: string) => {
    let base = subdomain ? `/${subdomain}/artikel/${slug}` : `/artikel/${slug}`;
    if (previewTemplate) {
      base += `?preview_template=${previewTemplate}`;
    }
    return base;
  };

  // Normalize articles list
  const allArticles: ArticleItem[] = useMemo(() => {
    if (initialArticles && initialArticles.length > 0) {
      return initialArticles.map((a: any, idx: number) => ({
        id: a.id || `art-${idx}`,
        title: a.title,
        slug: a.slug || `artikel-${idx}`,
        category:
          a.sector ||
          a.issueCategory ||
          (idx % 3 === 0 ? 'Ekonomi' : idx % 3 === 1 ? 'Infrastruktur' : 'Pendidikan'),
        date: a.publishedAt ? formatDateIndonesian(a.publishedAt) : '10 Oktober 2026',
        summary:
          a.excerpt ||
          a.summary ||
          'Analisis dan pandangan strategis parlemen mengenai perkembangan kebijakan publik terkini.',
        thumbnail:
          a.thumbnailUrl ||
          a.featuredImageUrl ||
          a.posterUrl ||
          (idx % 3 === 0
            ? '/images/ref-article-1.jpg'
            : idx % 3 === 1
            ? '/images/ref-article-2.jpg'
            : '/images/ref-article-3.jpg'),
        readingTime: '3 mnt baca',
        featured: idx === 0,
      }));
    }
    return defaultArticles;
  }, [initialArticles, defaultArticles]);

  // Filtered articles
  const filteredArticles = useMemo(() => {
    return allArticles.filter((art) => {
      const matchSearch =
        searchQuery.trim() === '' ||
        art.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        art.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
        art.category.toLowerCase().includes(searchQuery.toLowerCase());

      const matchCategory =
        selectedCategory === 'Semua Topik' ||
        art.category.toLowerCase() === selectedCategory.toLowerCase();

      return matchSearch && matchCategory;
    });
  }, [allArticles, searchQuery, selectedCategory]);

  const featuredArticle = filteredArticles.find((a) => a.featured) || filteredArticles[0];
  const catalogArticles = featuredArticle
    ? filteredArticles.filter((a) => a.id !== featuredArticle.id)
    : filteredArticles;

  return (
    <div className="space-y-12 sm:space-y-16">
      {/* ─── SEARCH & FILTER TOOLBAR ─── */}
      <div className="p-6 rounded-2xl bg-[#0D0D0D] border border-white/10 space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Search Input */}
          <div className="relative flex-1 max-w-xl">
            <Search className="w-4 h-4 text-red-500 absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Cari risalah naskah, telaah kebijakan, UU, atau kata kunci..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#161616] border border-white/10 rounded-xl pl-11 pr-10 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-red-600 transition-colors"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white p-1"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Results Counter */}
          <div className="text-xs font-mono uppercase tracking-wider text-slate-400 flex items-center gap-2">
            <span>DITEMUKAN:</span>
            <span className="font-bold text-red-500">{filteredArticles.length} RISET KEBIJAKAN</span>
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-white/5">
          <div className="text-xs font-mono text-slate-500 uppercase tracking-wider mr-2 hidden sm:inline-block">
            FILTER:
          </div>
          {CATEGORIES.map((cat) => {
            const isActive = selectedCategory === cat;
            return (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-mono font-bold uppercase transition-all cursor-pointer ${
                  isActive
                    ? 'bg-red-600 text-white shadow-md'
                    : 'bg-white/5 text-slate-400 hover:text-white hover:bg-white/10 border border-white/5'
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>
      </div>

      {/* ─── FEATURED ARTICLE HERO CARD ─── */}
      {featuredArticle && (
        <section className="space-y-4">
          <div className="flex items-center justify-between border-b border-white/10 pb-3 text-xs font-mono uppercase tracking-widest text-red-500 font-bold">
            <span className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-red-600 animate-pulse" />
              <span>TELAAH UTAMA / PILIHAN EDITOR</span>
            </span>
            <span className="text-slate-500 font-normal">01 • REKOMENDASI PUBLIK</span>
          </div>

          <Link
            href={getArticleHref(featuredArticle.slug)}
            className="group block rounded-3xl bg-[#0D0D0D] border border-white/10 hover:border-red-600/60 overflow-hidden transition-all duration-300 shadow-xl"
          >
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-0">
              {/* Image Left */}
              <div className="lg:col-span-6 relative aspect-[16/10] lg:aspect-auto overflow-hidden bg-slate-900 min-h-[280px] lg:min-h-[380px]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={featuredArticle.thumbnail}
                  alt={featuredArticle.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent lg:hidden" />
                <div className="absolute top-4 left-4">
                  <span className="px-3 py-1 rounded-md bg-red-600 text-white text-xs font-mono font-bold uppercase tracking-wider shadow-lg">
                    {featuredArticle.category}
                  </span>
                </div>
              </div>

              {/* Text Right */}
              <div className="lg:col-span-6 p-6 sm:p-10 flex flex-col justify-between space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-4 text-xs font-mono text-slate-400">
                    <span className="text-red-500 font-bold">01</span>
                    <span className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-slate-500" />
                      <span>{featuredArticle.date}</span>
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-slate-500" />
                      <span>{featuredArticle.readingTime}</span>
                    </span>
                  </div>

                  <h2 className="font-bebas text-3xl sm:text-5xl lg:text-6xl font-black text-white group-hover:text-red-400 transition-colors uppercase leading-[0.95] tracking-tight">
                    {featuredArticle.title}
                  </h2>

                  <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-normal">
                    {featuredArticle.summary}
                  </p>
                </div>

                <div className="pt-4 border-t border-white/10 flex items-center justify-between">
                  <div className="text-xs font-mono text-slate-400">
                    Kajian Naskah: <span className="text-white font-bold">{officialFullName}</span>
                  </div>
                  <span className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-red-600 group-hover:bg-red-500 text-white font-mono font-bold text-xs uppercase tracking-wider transition-all">
                    <span>BACA NASKAH LENGKAP</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </span>
                </div>
              </div>
            </div>
          </Link>
        </section>
      )}

      {/* ─── ARTIKEL GRID (02, 03, 04...) ─── */}
      <section className="space-y-6">
        <div className="flex items-center justify-between border-b border-white/10 pb-3 text-xs font-mono uppercase tracking-widest text-slate-400 font-bold">
          <span className="text-white flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-red-600" />
            <span>KATALOG SELURUH RISALAH &amp; TELAAH REGULASI</span>
          </span>
          <span>HALAMAN 1</span>
        </div>

        {catalogArticles.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {catalogArticles.map((art, idx) => {
              const displayNum = String(idx + 2).padStart(2, '0');
              return (
                <Link
                  key={art.id}
                  href={getArticleHref(art.slug)}
                  className="group block p-5 rounded-2xl bg-[#111111] border border-white/5 hover:border-red-600/50 transition-all duration-300 space-y-4"
                >
                  <div className="relative aspect-[16/10] rounded-xl overflow-hidden bg-slate-900 border border-white/10">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={art.thumbnail}
                      alt={art.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-2.5 left-2.5">
                      <span className="px-2.5 py-0.5 rounded bg-black/80 backdrop-blur-md text-[10px] font-mono font-bold text-white border border-white/10 uppercase">
                        {art.category}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-xs font-mono">
                      <span className="text-red-500 font-bold">{displayNum}</span>
                      <span className="text-slate-500 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        <span>{art.readingTime}</span>
                      </span>
                      <ArrowUpRight className="w-4 h-4 text-slate-500 group-hover:text-red-400 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
                    </div>

                    <h3 className="text-base font-bold text-white group-hover:text-red-400 transition-colors leading-snug line-clamp-2">
                      {art.title}
                    </h3>

                    <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed font-normal">
                      {art.summary}
                    </p>

                    <div className="pt-3 border-t border-white/5 flex items-center justify-between text-[11px] font-mono text-slate-500">
                      <span>{art.date}</span>
                      <span className="text-red-400 group-hover:underline">BACA →</span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-16 px-4 rounded-2xl bg-[#0D0D0D] border border-dashed border-white/10 space-y-4">
            <FileText className="w-10 h-10 text-slate-600 mx-auto" />
            <div className="space-y-1">
              <h4 className="text-sm font-bold text-white font-mono uppercase">
                Tidak ada artikel yang cocok
              </h4>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                Coba ubah kata kunci pencarian atau pilih kategori topik lain di atas.
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('Semua Topik');
              }}
              className="px-4 py-2 rounded-lg bg-red-600 text-white font-mono text-xs font-bold uppercase hover:bg-red-500 transition-colors"
            >
              RESET FILTER
            </button>
          </div>
        )}
      </section>
    </div>
  );
}
